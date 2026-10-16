export type Priority = 'baja' | 'media' | 'alta';

export type TaskStatus = 'pendiente' | 'en_curso' | 'completada';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  icon?: string;
  isDefault?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  deadline?: string;
  status: 'activo' | 'pausado' | 'completado';
}

export interface Task {
  id: string;
  userId?: string; // SaaS readiness
  title: string;
  description?: string;
  categoryId: string;
  projectId?: string;
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes?: number; // 5, 15, 30, 45, 60...
  dueDate?: string; // ISO date string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  reminderAt?: string; // ISO string
  subtasks: SubTask[];
  postponementCount: number; // Incrementa cuando se reprograma para detectar procrastinación
  lastPostponedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido';
export type RecurrenceType = 'unica' | 'semanal' | 'mensual' | 'anual';

export interface FinancialCommitment {
  id: string;
  userId?: string;
  concept: string;
  amount: number;
  currency: string; // 'ARS', 'USD', etc.
  entityName?: string; // persona, organismo o comercio
  categoryId: string;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  recurrence: RecurrenceType;
  reminderDaysBefore: number; // 0 (mismo día), 1, 2, etc.
  notes?: string;
  paidAt?: string;
  createdAt: string;
}

export type UrgencyLevel = 'baja' | 'media' | 'alta' | 'critica';

export interface AppNotification {
  id: string;
  entityType: 'task' | 'finance' | 'reminder' | 'system';
  entityId: string;
  title: string;
  message: string;
  urgency: UrgencyLevel;
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export type ActiveTab = 'mi-dia' | 'proximos' | 'pagos' | 'completados';
