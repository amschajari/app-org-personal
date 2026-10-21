import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, Category, FinancialCommitment, AppNotification, ActiveTab, Priority, SubTask } from '../types';
import { dataService, newId } from '../services/supabaseService';
import { useAuth } from './AuthContext';
import { isTaskOverdue, isTaskToday, nextRecurrenceDate, toLocalISODate } from '../utils/dateUtils';
import {
  runReminderCheck,
  getNotificationPermission,
  requestNotificationPermission as requestNotificationPermissionUtil,
  NotificationPermissionState,
} from '../utils/reminders';

interface AppContextType {
  tasks: Task[];
  categories: Category[];
  payments: FinancialCommitment[];
  notifications: AppNotification[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isLoading: boolean;
  error: string | null;
  reload: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'postponementCount' | 'subtasks'> & { subtasks?: string[] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleCompleteTask: (id: string) => void;
  postponeTask: (id: string, daysOffset?: number) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, title: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  // Financial Actions
  addPayment: (payment: Omit<FinancialCommitment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, updates: Partial<FinancialCommitment>) => void;
  togglePaymentStatus: (id: string) => void;
  deletePayment: (id: string) => void;

  // Undo support
  lastCompletedTask: Task | null;
  undoCompleteTask: () => void;

  // Modals & Panels
  isTaskModalOpen: boolean;
  taskToEdit: Task | null;
  taskDefaultValues: Partial<Task> | null;
  openTaskModal: (task?: Task | null, defaultValues?: Partial<Task>) => void;
  closeTaskModal: () => void;

  focusTask: Task | null;
  openFocusTimer: (task: Task) => void;
  closeFocusTimer: () => void;

  breakdownTask: Task | null;
  openBreakdownModal: (task: Task) => void;
  closeBreakdownModal: () => void;

  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  unreadNotificationsCount: number;
  dismissNotification: (id: string) => void;

  notificationPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<void>;
  remindersEnabled: boolean;
  setRemindersEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<FinancialCommitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('mi-dia');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskDefaultValues, setTaskDefaultValues] = useState<Partial<Task> | null>(null);

  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const [lastCompletedTask, setLastCompletedTask] = useState<Task | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(getNotificationPermission());

  const REMINDERS_KEY = 'productiva:reminders-enabled';
  const [remindersEnabled, setRemindersEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(REMINDERS_KEY) !== 'false';
    } catch {
      return true;
    }
  });

  const setRemindersEnabled = (enabled: boolean) => {
    setRemindersEnabledState(enabled);
    try {
      localStorage.setItem(REMINDERS_KEY, enabled ? 'true' : 'false');
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const reportError = useCallback((context: string, e: unknown) => {
    console.error(`[Productiva] ${context}:`, e);
  }, []);

  // Cargar (o recargar) todos los datos del usuario autenticado
  const loadData = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setCategories([]);
      setPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await dataService.ensureSeedCategories(userId);
      const data = await dataService.loadAll(userId);
      setCategories([...data.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setTasks(data.tasks);
      setPayments(data.payments);
    } catch (e) {
      reportError('cargar datos', e);
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, reportError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generador dinámico de notificaciones in-app
  const notifications = useMemo(() => {
    const list: AppNotification[] = [];
    const todayStr = toLocalISODate(new Date());

    tasks.filter(t => t.status !== 'completada' && isTaskOverdue(t.dueDate)).forEach(t => {
      list.push({
        id: `notif-overdue-${t.id}`,
        entityType: 'task',
        entityId: t.id,
        title: 'Tarea atrasada',
        message: `"${t.title}" debía completarse el ${t.dueDate}.`,
        urgency: 'critica',
        date: t.dueDate || todayStr,
        isRead: false,
      });
    });

    tasks.filter(t => t.status !== 'completada' && isTaskToday(t.dueDate)).forEach(t => {
      list.push({
        id: `notif-today-${t.id}`,
        entityType: 'task',
        entityId: t.id,
        title: 'Compromiso para hoy',
        message: `"${t.title}" tiene fecha límite hoy.`,
        urgency: t.priority === 'alta' ? 'alta' : 'media',
        date: todayStr,
        isRead: false,
      });
    });

    payments.filter(p => p.status === 'pendiente').forEach(p => {
      if (p.dueDate && p.dueDate < todayStr) {
        list.push({
          id: `notif-pay-overdue-${p.id}`,
          entityType: 'finance',
          entityId: p.id,
          title: 'Pago vencido',
          message: `${p.concept} (${p.currency} ${p.amount.toLocaleString()}) venció el ${p.dueDate}.`,
          urgency: 'critica',
          date: p.dueDate,
          isRead: false,
        });
      } else if (p.dueDate) {
        const due = new Date(p.dueDate).getTime();
        const diffDays = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= p.reminderDaysBefore) {
          list.push({
            id: `notif-pay-soon-${p.id}`,
            entityType: 'finance',
            entityId: p.id,
            title: 'Vencimiento próximo de pago',
            message: `${p.concept} vence en ${diffDays === 0 ? 'el día de hoy' : `${diffDays} día(s)`}.`,
            urgency: 'alta',
            date: p.dueDate,
            isRead: false,
          });
        }
      }
    });

    return list.filter(n => !dismissedNotificationIds.includes(n.id));
  }, [tasks, payments, dismissedNotificationIds]);

  const unreadNotificationsCount = notifications.length;

  const dismissNotification = (id: string) => {
    setDismissedNotificationIds(prev => [...prev, id]);
  };

  // Recordatorios del navegador (mientra la app está abierta)
  useEffect(() => {
    if (notificationPermission !== 'granted' || !remindersEnabled) return;
    runReminderCheck(tasks, payments);
    const id = window.setInterval(() => runReminderCheck(tasks, payments), 60_000);
    return () => window.clearInterval(id);
  }, [notificationPermission, remindersEnabled, tasks, payments]);

  const requestNotificationPermission = async () => {
    const p = await requestNotificationPermissionUtil();
    setNotificationPermission(p);
    if (p === 'granted') {
      setRemindersEnabled(true);
      runReminderCheck(tasks, payments);
    }
  };

  // Acciones de Tareas
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'postponementCount' | 'subtasks'> & { subtasks?: string[] }) => {
    if (!userId) return;
    const newTask: Task = {
      ...taskData,
      id: newId(),
      userId,
      createdAt: new Date().toISOString(),
      postponementCount: 0,
      subtasks: (taskData.subtasks || []).map((title, idx) => ({
        id: newId(),
        title,
        isCompleted: false,
        order: idx,
      })),
    };

    setTasks(prev => [newTask, ...prev]);
    dataService.insertTask(userId, newTask).catch(e => {
      reportError('crear tarea', e);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    dataService.updateTask(id, updates).catch(e => reportError('actualizar tarea', e));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    dataService.deleteTask(id).catch(e => reportError('eliminar tarea', e));
  };

  const createNextOccurrence = (task: Task) => {
    const nextDate = nextRecurrenceDate(task.dueDate, task.recurrence);
    if (!nextDate) return;

    const alreadyExists = tasks.some(
      (t) =>
        t.status !== 'completada' &&
        t.title.trim().toLowerCase() === task.title.trim().toLowerCase() &&
        (t.dueDate || '').split('T')[0] === nextDate
    );
    if (alreadyExists) return;

    addTask({
      title: task.title,
      description: task.description,
      categoryId: task.categoryId,
      projectId: task.projectId,
      priority: task.priority,
      status: 'pendiente',
      dueDate: nextDate,
      recurrence: task.recurrence,
      estimatedMinutes: task.estimatedMinutes,
      subtasks: task.subtasks.map((s) => s.title),
    });
  };

  const toggleCompleteTask = (id: string) => {
    const current = tasks.find(t => t.id === id);
    if (!current) return;

    const willBeCompleted = current.status !== 'completada';
    const status = willBeCompleted ? 'completada' : 'pendiente';
    const completedAt = willBeCompleted ? new Date().toISOString() : undefined;

    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status, completedAt } : t)));

    if (willBeCompleted) {
      setLastCompletedTask(current);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#10b981', '#6366f1'],
        });
      } catch {
        // Ignorar si el navegador bloquea
      }
      createNextOccurrence(current);
    } else {
      setLastCompletedTask(null);
    }

    dataService.updateTask(id, { status, completedAt }).catch(e => reportError('completar tarea', e));
  };

  const undoCompleteTask = () => {
    if (!lastCompletedTask) return;
    const targetId = lastCompletedTask.id;
    setTasks(prev =>
      prev.map(t => (t.id === targetId ? { ...t, status: 'pendiente', completedAt: undefined } : t))
    );
    setLastCompletedTask(null);
    dataService
      .updateTask(targetId, { status: 'pendiente', completedAt: undefined })
      .catch(e => reportError('deshacer completado', e));
  };

  const postponeTask = (id: string, daysOffset = 1) => {
    const current = tasks.find(t => t.id === id);
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const newDueDate = toLocalISODate(d);
    const lastPostponedAt = new Date().toISOString();
    const postponementCount = (current?.postponementCount || 0) + 1;

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, dueDate: newDueDate, postponementCount, lastPostponedAt } : t
      )
    );
    dataService
      .updateTask(id, { dueDate: newDueDate, postponementCount, lastPostponedAt })
      .catch(e => reportError('posponer tarea', e));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const sub = task?.subtasks.find(s => s.id === subTaskId);
    if (!sub) return;

    const isCompleted = !sub.isCompleted;
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map(s => (s.id === subTaskId ? { ...s, isCompleted } : s)) }
          : t
      )
    );
    dataService.updateSubtask(subTaskId, { isCompleted }).catch(e => reportError('actualizar micro-paso', e));
  };

  const addSubTask = (taskId: string, title: string) => {
    if (!title.trim() || !userId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSub: SubTask = {
      id: newId(),
      title: title.trim(),
      isCompleted: false,
      order: task.subtasks.length,
    };

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t))
    );
    dataService.insertSubtask(userId, taskId, newSub).catch(e => reportError('agregar micro-paso', e));
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subTaskId) } : t
      )
    );
    dataService.deleteSubtask(subTaskId).catch(e => reportError('eliminar micro-paso', e));
  };

  // Categorías
  const addCategory = (catData: Omit<Category, 'id'>) => {
    if (!userId) return;
    const newCat: Category = { ...catData, id: newId() };
    const sortOrder = categories.length;
    setCategories(prev => [...prev, newCat]);
    dataService.insertCategory(userId, newCat, sortOrder).catch(e => reportError('crear categoría', e));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    dataService.updateCategory(id, updates).catch(e => reportError('actualizar categoría', e));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    dataService.deleteCategory(id).catch(e => reportError('eliminar categoría', e));
  };

  const reorderCategories = (orderedIds: string[]) => {
    if (!userId) return;
    setCategories(prev => {
      const map = new Map(prev.map(c => [c.id, c]));
      return orderedIds
        .map(id => map.get(id))
        .filter((c): c is Category => Boolean(c))
        .map((c, idx) => ({ ...c, order: idx }));
    });
    orderedIds.forEach((id, idx) => {
      dataService.updateCategory(id, { order: idx }).catch(e => reportError('reordenar categorías', e));
    });
  };

  // Finanzas
  const addPayment = (paymentData: Omit<FinancialCommitment, 'id' | 'createdAt'>) => {
    if (!userId) return;
    const newPayment: FinancialCommitment = {
      ...paymentData,
      id: newId(),
      userId,
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [newPayment, ...prev]);
    dataService.insertPayment(userId, newPayment).catch(e => reportError('crear pago', e));
  };

  const updatePayment = (id: string, updates: Partial<FinancialCommitment>) => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    dataService.updatePayment(id, updates).catch(e => reportError('actualizar pago', e));
  };

  const togglePaymentStatus = (id: string) => {
    const current = payments.find(p => p.id === id);
    if (!current) return;
    const isNowPaid = current.status !== 'pagado';
    const status = isNowPaid ? 'pagado' : 'pendiente';
    const paidAt = isNowPaid ? new Date().toISOString() : undefined;

    setPayments(prev => prev.map(p => (p.id === id ? { ...p, status, paidAt } : p)));
    dataService.updatePayment(id, { status, paidAt }).catch(e => reportError('marcar pago', e));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    dataService.deletePayment(id).catch(e => reportError('eliminar pago', e));
  };

  // Modales
  const openTaskModal = (task?: Task | null, defaultValues?: Partial<Task>) => {
    setTaskToEdit(task || null);
    setTaskDefaultValues(defaultValues || null);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
    setTaskDefaultValues(null);
  };

  const openFocusTimer = (task: Task) => setFocusTask(task);
  const closeFocusTimer = () => setFocusTask(null);

  const openBreakdownModal = (task: Task) => setBreakdownTask(task);
  const closeBreakdownModal = () => setBreakdownTask(null);

  return (
    <AppContext.Provider
      value={{
        tasks,
        categories,
        payments,
        notifications,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isLoading,
        error,
        reload: loadData,
        addTask,
        updateTask,
        deleteTask,
        toggleCompleteTask,
        postponeTask,
        toggleSubTask,
        addSubTask,
        deleteSubTask,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addPayment,
        updatePayment,
        togglePaymentStatus,
        deletePayment,
        lastCompletedTask,
        undoCompleteTask,
        isTaskModalOpen,
        taskToEdit,
        taskDefaultValues,
        openTaskModal,
        closeTaskModal,
        focusTask,
        openFocusTimer,
        closeFocusTimer,
        breakdownTask,
        openBreakdownModal,
        closeBreakdownModal,
        isNotificationOpen,
        setIsNotificationOpen,
        unreadNotificationsCount,
        dismissNotification,
        notificationPermission,
        requestNotificationPermission,
        remindersEnabled,
        setRemindersEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
