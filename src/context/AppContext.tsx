import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Task, Category, FinancialCommitment, AppNotification, ActiveTab, Priority } from '../types';
import { StorageService } from '../services/storage';
import { isTaskOverdue, isTaskToday } from '../utils/dateUtils';

interface AppContextType {
  tasks: Task[];
  categories: Category[];
  payments: FinancialCommitment[];
  notifications: AppNotification[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [payments, setPayments] = useState<FinancialCommitment[]>(() => StorageService.getPayments());
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

  // Guardar en Storage al cambiar
  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.savePayments(payments);
  }, [payments]);

  // Generador dinámico de notificaciones in-app
  const notifications = useMemo(() => {
    const list: AppNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Tareas vencidas
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

    // 2. Tareas de hoy
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

    // 3. Pagos próximos o vencidos
    payments.filter(p => p.status === 'pendiente').forEach(p => {
      if (p.dueDate < todayStr) {
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
      } else {
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

  // Acciones de Tareas
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'postponementCount' | 'subtasks'> & { subtasks?: string[] }) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      postponementCount: 0,
      subtasks: (taskData.subtasks || []).map((title, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title,
        isCompleted: false,
        order: idx,
      })),
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleCompleteTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const willBeCompleted = t.status !== 'completada';

        if (willBeCompleted) {
          const found = prev.find(item => item.id === id);
          if (found) setLastCompletedTask(found);

          // Lanzar confeti suave y satisfactorio
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
        } else {
          setLastCompletedTask(null);
        }

        return {
          ...t,
          status: willBeCompleted ? 'completada' : 'pendiente',
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const undoCompleteTask = () => {
    if (!lastCompletedTask) return;
    const targetId = lastCompletedTask.id;
    setTasks(prev =>
      prev.map(t => (t.id === targetId ? { ...t, status: 'pendiente', completedAt: undefined } : t))
    );
    setLastCompletedTask(null);
  };

  const postponeTask = (id: string, daysOffset = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const newDueDate = d.toISOString().split('T')[0];

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        return {
          ...t,
          dueDate: newDueDate,
          postponementCount: (t.postponementCount || 0) + 1,
          lastPostponedAt: new Date().toISOString(),
        };
      })
    );
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(s =>
          s.id === subTaskId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  const addSubTask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newSub: { id: string; title: string; isCompleted: boolean; order: number } = {
          id: `st-${Date.now()}`,
          title: title.trim(),
          isCompleted: false,
          order: t.subtasks.length,
        };
        return { ...t, subtasks: [...t.subtasks, newSub] };
      })
    );
  };

  const deleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: t.subtasks.filter(s => s.id !== subTaskId) };
      })
    );
  };

  // Categorías
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Finanzas
  const addPayment = (paymentData: Omit<FinancialCommitment, 'id' | 'createdAt'>) => {
    const newPayment: FinancialCommitment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [newPayment, ...prev]);
  };

  const togglePaymentStatus = (id: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const isNowPaid = p.status !== 'pagado';
        return {
          ...p,
          status: isNowPaid ? 'pagado' : 'pendiente',
          paidAt: isNowPaid ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const updatePayment = (id: string, updates: Partial<FinancialCommitment>) => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
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
        addPayment,
        updatePayment,
        togglePaymentStatus,
        deletePayment,
        lastCompletedTask,
        undoCompleteTask,
        isTaskModalOpen,
        taskToEdit,
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
