import type { RecurrenceType } from '../types';

export const formatDate = (dateStr?: string): string => {  if (!dateStr) return 'Sin fecha';
  
  // Format YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  }
  return dateStr;
};

export const getGreeting = (): { greeting: string; dateText: string } => {
  const now = new Date();
  const hour = now.getHours();

  let greeting = 'Buenos días';
  if (hour >= 12 && hour < 20) {
    greeting = 'Buenas tardes';
  } else if (hour >= 20 || hour < 6) {
    greeting = 'Buenas noches';
  }

  const dateText = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Capitalize first letter of weekday
  const capitalizedDate = dateText.charAt(0).toUpperCase() + dateText.slice(1);

  return { greeting, dateText: capitalizedDate };
};

export const isTaskToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const todayStr = toLocalISODate(new Date());
  return dateStr.split('T')[0] === todayStr;
};

export const isTaskOverdue = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const todayStr = toLocalISODate(new Date());
  return dateStr.split('T')[0] < todayStr;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Fecha local (sin desfase UTC) en formato YYYY-MM-DD. */
export const toLocalISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Convierte 'YYYY-MM-DD' (o con hora) a Date local. */
export const parseLocalISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Devuelve 42 días (6 semanas) desde el lunes anterior al día 1 del mes. */
export const getMonthMatrix = (year: number, month: number): Date[] => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // 0 = lunes
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
  );
};

export const formatLongDate = (iso: string): string => {
  const s = parseLocalISODate(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Próxima fecha de una tarea recurrente, conservando el día del mes
 * (si el mes siguiente es más corto, usa su último día).
 */
export const nextRecurrenceDate = (
  dueDate: string | undefined,
  recurrence: RecurrenceType | undefined
): string | undefined => {
  if (!dueDate || !recurrence || recurrence === 'unica') return undefined;
  const base = parseLocalISODate(dueDate);
  if (Number.isNaN(base.getTime())) return undefined;

  if (recurrence === 'diaria') {
    base.setDate(base.getDate() + 1);
  } else if (recurrence === 'semanal') {
    base.setDate(base.getDate() + 7);
  } else if (recurrence === 'mensual') {
    const day = base.getDate();
    base.setDate(1);
    base.setMonth(base.getMonth() + 1);
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(day, lastDay));
  } else if (recurrence === 'anual') {
    base.setFullYear(base.getFullYear() + 1);
  }

  return toLocalISODate(base);
};
