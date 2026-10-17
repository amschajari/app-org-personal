export interface SeedCategory {
  name: string;
  color: string;
}

// Categorías estándar que se siembran por cada usuario nuevo en su primer ingreso.
// Son genéricas para cualquier persona (no incluyen rubros personales).
export const INITIAL_CATEGORIES: SeedCategory[] = [
  { name: 'Trabajo', color: '#3b82f6' },
  { name: 'Personal', color: '#84cc16' },
  { name: 'Hogar', color: '#f59e0b' },
  { name: 'Finanzas', color: '#ef4444' },
  { name: 'Compras', color: '#ec4899' },
  { name: 'Trámites', color: '#6366f1' },
  { name: 'Salud', color: '#14b8a6' },
  { name: 'Estudio y aprendizaje', color: '#8b5cf6' },
  { name: 'Reuniones', color: '#0ea5e9' },
  { name: 'Proyectos', color: '#10b981' },
  { name: 'Ideas', color: '#64748b' },
];

// Paleta sugerida para el selector de color de categorías.
export const CATEGORY_COLORS: string[] = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#14b8a6',
  '#0ea5e9',
  '#64748b',
  '#0f172a',
];
