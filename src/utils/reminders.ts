import { Task, FinancialCommitment } from '../types';
import { toLocalISODate, parseLocalISODate } from './dateUtils';

const STORAGE_KEY = 'productiva:reminders-notified';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export const getNotificationPermission = (): NotificationPermissionState => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

const loadNotified = (today: string): Set<string> => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    return new Set(raw.filter((k) => k.endsWith(`:${today}`)));
  } catch {
    return new Set();
  }
};

const saveNotified = (set: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* almacenamiento no disponible */
  }
};

/**
 * Lanza notificaciones del navegador para tareas/pagos del día.
 * Deduplica por item+día para no repetir mientras la app esté abierta.
 * Devuelve cuántas notificaciones se mostraron.
 */
export const runReminderCheck = (tasks: Task[], payments: FinancialCommitment[]): number => {
  if (getNotificationPermission() !== 'granted') return 0;

  const today = toLocalISODate(new Date());
  const notified = loadNotified(today);
  let count = 0;
  const MAX_PER_CHECK = 4;

  const notify = (key: string, title: string, body: string) => {
    if (notified.has(key) || count >= MAX_PER_CHECK) return;
    try {
      // eslint-disable-next-line no-new
      new Notification(title, { body, tag: key });
      notified.add(key);
      count += 1;
    } catch {
      /* el navegador puede bloquear la notificación */
    }
  };

  tasks.forEach((t) => {
    if (t.status === 'completada' || !t.dueDate) return;
    const due = t.dueDate.split('T')[0];
    if (due === today) {
      notify(`${t.id}:${today}`, 'Tarea para hoy', `“${t.title}” vence hoy.`);
    } else if (due < today) {
      notify(`${t.id}:${today}`, 'Tarea atrasada', `“${t.title}” debía completarse el ${due}.`);
    }
  });

  payments.forEach((p) => {
    if (p.status === 'pagado' || !p.dueDate) return;
    const due = p.dueDate.split('T')[0];
    const diff = Math.round(
      (parseLocalISODate(due).getTime() - parseLocalISODate(today).getTime()) / 86_400_000
    );
    const amount = `${p.currency} ${p.amount.toLocaleString('es-AR')}`;

    if (diff < 0) {
      notify(`${p.id}:${today}`, 'Pago vencido', `${p.concept} (${amount}) venció el ${due}.`);
    } else if (diff === 0) {
      notify(`${p.id}:${today}`, 'Pago para hoy', `${p.concept} (${amount}) vence hoy.`);
    } else if (diff <= p.reminderDaysBefore) {
      notify(
        `${p.id}:${today}`,
        'Pago próximo a vencer',
        `${p.concept} (${amount}) vence en ${diff} día(s).`
      );
    }
  });

  saveNotified(notified);
  return count;
};
