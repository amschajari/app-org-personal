import { Category, Task, FinancialCommitment, AppNotification, Project } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-trabajo', name: 'Trabajo', color: '#3b82f6', isDefault: true },
  { id: 'cat-municipalidad', name: 'Municipalidad', color: '#0ea5e9', isDefault: true },
  { id: 'cat-clicando', name: 'Clicando', color: '#8b5cf6', isDefault: true },
  { id: 'cat-dev', name: 'Desarrollo web', color: '#10b981', isDefault: true },
  { id: 'cat-proyectos', name: 'Proyectos personales', color: '#f59e0b', isDefault: true },
  { id: 'cat-reuniones', name: 'Reuniones', color: '#ec4899', isDefault: true },
  { id: 'cat-pagos', name: 'Pagos y deudas', color: '#ef4444', isDefault: true },
  { id: 'cat-tramites', name: 'Trámites', color: '#6366f1', isDefault: true },
  { id: 'cat-estudio', name: 'Estudio y aprendizaje', color: '#14b8a6', isDefault: true },
  { id: 'cat-personal', name: 'Personal', color: '#84cc16', isDefault: true },
  { id: 'cat-ideas', name: 'Ideas', color: '#64748b', isDefault: true },
];

const getTodayISODate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Resolver bug de carga en la plataforma',
    description: 'Reproducir el error reportado en consola durante 15 minutos y aislar la función.',
    categoryId: 'cat-dev',
    priority: 'alta',
    status: 'pendiente',
    estimatedMinutes: 20,
    dueDate: getTodayISODate(0),
    subtasks: [
      { id: 'st-1', title: 'Abrir DevTools y revisar log de errores', isCompleted: true, order: 0 },
      { id: 'st-2', title: 'Reproducir con usuario de prueba', isCompleted: false, order: 1 },
      { id: 'st-3', title: 'Aplicar parche y verificar', isCompleted: false, order: 2 },
    ],
    postponementCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Preparar propuesta técnica para cliente',
    description: 'Armar alcance del proyecto y tiempos estimados de entrega.',
    categoryId: 'cat-trabajo',
    priority: 'alta',
    status: 'pendiente',
    estimatedMinutes: 45,
    dueDate: getTodayISODate(0),
    subtasks: [],
    postponementCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Enviar documentación a la Municipalidad',
    description: 'Adjuntar formulario firmado y constancia de trámite.',
    categoryId: 'cat-municipalidad',
    priority: 'media',
    status: 'pendiente',
    estimatedMinutes: 15,
    dueDate: getTodayISODate(1),
    subtasks: [],
    postponementCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Planificar arquitectura del nuevo módulo en Clicando',
    description: 'Definir endpoints y esquema relacional de datos.',
    categoryId: 'cat-clicando',
    priority: 'media',
    status: 'pendiente',
    estimatedMinutes: 30,
    dueDate: getTodayISODate(2),
    subtasks: [],
    postponementCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Comprar insumos de oficina y cables USB-C',
    description: 'Verificar ofertas en comercio local.',
    categoryId: 'cat-personal',
    priority: 'baja',
    status: 'pendiente',
    estimatedMinutes: 15,
    dueDate: '', // Sin fecha para backlog de ideas
    subtasks: [],
    postponementCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-completed-1',
    title: 'Revisión matutina de prioridades y agenda',
    description: 'Alinear los objetivos principales del día.',
    categoryId: 'cat-personal',
    priority: 'media',
    status: 'completada',
    estimatedMinutes: 10,
    dueDate: getTodayISODate(0),
    subtasks: [],
    postponementCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

export const INITIAL_PAYMENTS: FinancialCommitment[] = [
  {
    id: 'pay-1',
    concept: 'Pago mensual Monotributo',
    amount: 28500,
    currency: 'ARS',
    entityName: 'ARCA / AFIP',
    categoryId: 'cat-pagos',
    dueDate: getTodayISODate(2),
    status: 'pendiente',
    recurrence: 'mensual',
    reminderDaysBefore: 2,
    notes: 'Pagar con VEP antes del vencimiento.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    concept: 'Alojamiento Servidor Cloud (VPS)',
    amount: 14.99,
    currency: 'USD',
    entityName: 'Hetzner / Cloud',
    categoryId: 'cat-pagos',
    dueDate: getTodayISODate(5),
    status: 'pendiente',
    recurrence: 'mensual',
    reminderDaysBefore: 1,
    notes: 'Débito automático en tarjeta.',
    createdAt: new Date().toISOString(),
  }
];

const STORAGE_KEYS = {
  TASKS: 'productiva_tasks_v1',
  CATEGORIES: 'productiva_categories_v1',
  PROJECTS: 'productiva_projects_v1',
  PAYMENTS: 'productiva_payments_v1',
  NOTIFICATIONS: 'productiva_notifications_v1',
};

export class StorageService {
  static getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static getTasks(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      this.saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TASKS;
    }
  }

  static saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static getPayments(): FinancialCommitment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      this.savePayments(INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PAYMENTS;
    }
  }

  static savePayments(payments: FinancialCommitment[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  static getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static exportBackup(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories: this.getCategories(),
      tasks: this.getTasks(),
      payments: this.getPayments(),
      projects: this.getProjects(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.payments)) this.savePayments(data.payments);
      if (Array.isArray(data.projects)) this.saveProjects(data.projects);
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  }
}
