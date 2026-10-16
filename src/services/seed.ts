export interface SeedCategory {
  name: string;
  color: string;
}

// Categorías iniciales que se siembran por cada usuario nuevo en su primer ingreso.
export const INITIAL_CATEGORIES: SeedCategory[] = [
  { name: 'Trabajo', color: '#3b82f6' },
  { name: 'Municipalidad', color: '#0ea5e9' },
  { name: 'Clicando', color: '#8b5cf6' },
  { name: 'Desarrollo web', color: '#10b981' },
  { name: 'Proyectos personales', color: '#f59e0b' },
  { name: 'Reuniones', color: '#ec4899' },
  { name: 'Pagos y deudas', color: '#ef4444' },
  { name: 'Trámites', color: '#6366f1' },
  { name: 'Estudio y aprendizaje', color: '#14b8a6' },
  { name: 'Personal', color: '#84cc16' },
  { name: 'Ideas', color: '#64748b' },
];
