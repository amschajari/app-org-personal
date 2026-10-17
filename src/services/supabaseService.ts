import { supabase } from './supabase';
import {
  Category,
  Task,
  SubTask,
  FinancialCommitment,
  Priority,
  TaskStatus,
  PaymentStatus,
  RecurrenceType,
} from '../types';
import { INITIAL_CATEGORIES } from './seed';

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const emptyToNull = (v?: string | null): string | null =>
  v && v.trim() !== '' ? v : null;

// ------------------------------------------------------------------
// Filas de la base (snake_case)
// ------------------------------------------------------------------
interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  is_default: boolean;
  sort_order: number;
}

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  project_id: string | null;
  priority: string;
  status: string;
  estimated_minutes: number | null;
  due_date: string | null;
  reminder_at: string | null;
  postponement_count: number;
  last_postponed_at: string | null;
  created_at: string;
  completed_at: string | null;
}

interface SubtaskRow {
  id: string;
  user_id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
}

interface PaymentRow {
  id: string;
  user_id: string;
  concept: string;
  amount: number | string;
  currency: string;
  entity_name: string | null;
  category_id: string | null;
  due_date: string | null;
  status: string;
  recurrence: string;
  reminder_days_before: number;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
}

// ------------------------------------------------------------------
// Mapeos fila -> modelo
// ------------------------------------------------------------------
const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  name: r.name,
  color: r.color,
  icon: r.icon ?? undefined,
  isDefault: r.is_default,
  order: r.sort_order,
});

const toSubTask = (r: SubtaskRow): SubTask => ({
  id: r.id,
  title: r.title,
  isCompleted: r.is_completed,
  order: r.sort_order,
});

const toTask = (r: TaskRow, subtasks: SubTask[]): Task => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  description: r.description ?? undefined,
  categoryId: r.category_id ?? '',
  projectId: r.project_id ?? undefined,
  priority: r.priority as Priority,
  status: r.status as TaskStatus,
  estimatedMinutes: r.estimated_minutes ?? undefined,
  dueDate: r.due_date ?? undefined,
  reminderAt: r.reminder_at ?? undefined,
  subtasks,
  postponementCount: r.postponement_count,
  lastPostponedAt: r.last_postponed_at ?? undefined,
  createdAt: r.created_at,
  completedAt: r.completed_at ?? undefined,
});

const toPayment = (r: PaymentRow): FinancialCommitment => ({
  id: r.id,
  userId: r.user_id,
  concept: r.concept,
  amount: Number(r.amount),
  currency: r.currency,
  entityName: r.entity_name ?? undefined,
  categoryId: r.category_id ?? '',
  dueDate: r.due_date ?? '',
  status: r.status as PaymentStatus,
  recurrence: r.recurrence as RecurrenceType,
  reminderDaysBefore: r.reminder_days_before,
  notes: r.notes ?? undefined,
  paidAt: r.paid_at ?? undefined,
  createdAt: r.created_at,
});

// ------------------------------------------------------------------
// Mapeos modelo -> patch/fila (solo claves presentes)
// ------------------------------------------------------------------
const taskToRow = (userId: string, t: Task) => ({
  id: t.id,
  user_id: userId,
  title: t.title,
  description: t.description ?? null,
  category_id: t.categoryId || null,
  project_id: t.projectId ?? null,
  priority: t.priority,
  status: t.status,
  estimated_minutes: t.estimatedMinutes ?? null,
  due_date: emptyToNull(t.dueDate),
  reminder_at: t.reminderAt ?? null,
  postponement_count: t.postponementCount ?? 0,
  last_postponed_at: t.lastPostponedAt ?? null,
  created_at: t.createdAt,
  completed_at: t.completedAt ?? null,
});

const taskPatchToRow = (u: Partial<Task>): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if ('title' in u) r.title = u.title;
  if ('description' in u) r.description = u.description ?? null;
  if ('categoryId' in u) r.category_id = u.categoryId || null;
  if ('projectId' in u) r.project_id = u.projectId ?? null;
  if ('priority' in u) r.priority = u.priority;
  if ('status' in u) r.status = u.status;
  if ('estimatedMinutes' in u) r.estimated_minutes = u.estimatedMinutes ?? null;
  if ('dueDate' in u) r.due_date = emptyToNull(u.dueDate);
  if ('reminderAt' in u) r.reminder_at = u.reminderAt ?? null;
  if ('postponementCount' in u) r.postponement_count = u.postponementCount ?? 0;
  if ('lastPostponedAt' in u) r.last_postponed_at = u.lastPostponedAt ?? null;
  if ('completedAt' in u) r.completed_at = u.completedAt ?? null;
  return r;
};

const subtaskPatchToRow = (u: Partial<SubTask>): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if ('title' in u) r.title = u.title;
  if ('isCompleted' in u) r.is_completed = u.isCompleted;
  if ('order' in u) r.sort_order = u.order;
  return r;
};

const categoryPatchToRow = (u: Partial<Category>): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if ('name' in u) r.name = u.name;
  if ('color' in u) r.color = u.color;
  if ('icon' in u) r.icon = u.icon ?? null;
  if ('isDefault' in u) r.is_default = u.isDefault;
  if ('order' in u) r.sort_order = u.order;
  return r;
};

const paymentToRow = (userId: string, p: FinancialCommitment) => ({
  id: p.id,
  user_id: userId,
  concept: p.concept,
  amount: p.amount,
  currency: p.currency,
  entity_name: p.entityName ?? null,
  category_id: p.categoryId || null,
  due_date: emptyToNull(p.dueDate),
  status: p.status,
  recurrence: p.recurrence,
  reminder_days_before: p.reminderDaysBefore,
  notes: p.notes ?? null,
  paid_at: p.paidAt ?? null,
  created_at: p.createdAt,
});

const paymentPatchToRow = (u: Partial<FinancialCommitment>): Record<string, unknown> => {
  const r: Record<string, unknown> = {};
  if ('concept' in u) r.concept = u.concept;
  if ('amount' in u) r.amount = u.amount;
  if ('currency' in u) r.currency = u.currency;
  if ('entityName' in u) r.entity_name = u.entityName ?? null;
  if ('categoryId' in u) r.category_id = u.categoryId || null;
  if ('dueDate' in u) r.due_date = emptyToNull(u.dueDate);
  if ('status' in u) r.status = u.status;
  if ('recurrence' in u) r.recurrence = u.recurrence;
  if ('reminderDaysBefore' in u) r.reminder_days_before = u.reminderDaysBefore;
  if ('notes' in u) r.notes = u.notes ?? null;
  if ('paidAt' in u) r.paid_at = u.paidAt ?? null;
  return r;
};

// ------------------------------------------------------------------
// Servicio de datos
// ------------------------------------------------------------------
export const dataService = {
  /** Crea las categorías por defecto si el usuario todavía no tiene ninguna. */
  async ensureSeedCategories(userId: string): Promise<void> {
    const { count, error } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    if ((count ?? 0) > 0) return;

    const now = new Date().toISOString();
    const rows = INITIAL_CATEGORIES.map((c, idx) => ({
      id: newId(),
      user_id: userId,
      name: c.name,
      color: c.color,
      icon: null,
      is_default: true,
      sort_order: idx,
      created_at: now,
    }));

    const { error: insErr } = await supabase.from('categories').insert(rows);
    if (insErr) throw insErr;
  },

  async loadAll(userId: string): Promise<{
    categories: Category[];
    tasks: Task[];
    payments: FinancialCommitment[];
  }> {
    const [catRes, taskRes, subRes, payRes] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('subtasks').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (catRes.error) throw catRes.error;
    if (taskRes.error) throw taskRes.error;
    if (subRes.error) throw subRes.error;
    if (payRes.error) throw payRes.error;

    const byTask = new Map<string, SubTask[]>();
    ((subRes.data as SubtaskRow[]) ?? []).forEach((r) => {
      const list = byTask.get(r.task_id) ?? [];
      list.push(toSubTask(r));
      byTask.set(r.task_id, list);
    });

    return {
      categories: ((catRes.data as CategoryRow[]) ?? []).map(toCategory),
      tasks: ((taskRes.data as TaskRow[]) ?? []).map((r) => toTask(r, byTask.get(r.id) ?? [])),
      payments: ((payRes.data as PaymentRow[]) ?? []).map(toPayment),
    };
  },

  // ---- Tareas ----
  async insertTask(userId: string, task: Task): Promise<void> {
    const { error } = await supabase.from('tasks').insert(taskToRow(userId, task));
    if (error) throw error;

    if (task.subtasks.length > 0) {
      const rows = task.subtasks.map((s) => ({
        id: s.id,
        user_id: userId,
        task_id: task.id,
        title: s.title,
        is_completed: s.isCompleted,
        sort_order: s.order,
      }));
      const { error: subErr } = await supabase.from('subtasks').insert(rows);
      if (subErr) throw subErr;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const row = taskPatchToRow(updates);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from('tasks').update(row).eq('id', id);
    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Subtareas ----
  async insertSubtask(userId: string, taskId: string, sub: SubTask): Promise<void> {
    const { error } = await supabase.from('subtasks').insert({
      id: sub.id,
      user_id: userId,
      task_id: taskId,
      title: sub.title,
      is_completed: sub.isCompleted,
      sort_order: sub.order,
    });
    if (error) throw error;
  },

  async updateSubtask(id: string, updates: Partial<SubTask>): Promise<void> {
    const row = subtaskPatchToRow(updates);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from('subtasks').update(row).eq('id', id);
    if (error) throw error;
  },

  async deleteSubtask(id: string): Promise<void> {
    const { error } = await supabase.from('subtasks').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Categorías ----
  async insertCategory(userId: string, cat: Category, sortOrder: number): Promise<void> {
    const { error } = await supabase.from('categories').insert({
      id: cat.id,
      user_id: userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon ?? null,
      is_default: cat.isDefault ?? false,
      sort_order: sortOrder,
    });
    if (error) throw error;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const row = categoryPatchToRow(updates);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from('categories').update(row).eq('id', id);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Pagos ----
  async insertPayment(userId: string, p: FinancialCommitment): Promise<void> {
    const { error } = await supabase.from('payments').insert(paymentToRow(userId, p));
    if (error) throw error;
  },

  async updatePayment(id: string, updates: Partial<FinancialCommitment>): Promise<void> {
    const row = paymentPatchToRow(updates);
    if (Object.keys(row).length === 0) return;
    const { error } = await supabase.from('payments').update(row).eq('id', id);
    if (error) throw error;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },
};

export { newId };
