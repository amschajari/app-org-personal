import { Task } from '../types';

export interface ScoredTask {
  task: Task;
  score: number;
  reason: string;
}

export const calculateTaskScore = (task: Task): ScoredTask => {
  let score = 0;
  const reasons: string[] = [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Urgencia Temporal
  if (task.dueDate) {
    if (task.dueDate < todayStr) {
      score += 100;
      reasons.push('Venció y requiere atención inmediata');
    } else if (task.dueDate === todayStr) {
      score += 80;
      reasons.push('Vence hoy');
    } else {
      const due = new Date(task.dueDate).getTime();
      const diffHours = (due - now.getTime()) / (1000 * 60 * 60);
      if (diffHours <= 48 && diffHours > 0) {
        score += 50;
        reasons.push('Vence en las próximas 48 horas');
      } else {
        score += 20;
      }
    }
  } else {
    // Sin fecha asignada
    score += 10;
  }

  // 2. Nivel de Prioridad
  if (task.priority === 'alta') {
    score += 40;
    reasons.push('Alta prioridad estratégica');
  } else if (task.priority === 'media') {
    score += 20;
  } else {
    score += 5;
  }

  // 3. Fricción por duración (Activación conductual)
  const duration = task.estimatedMinutes || 25;
  if (duration <= 15) {
    score += 30;
    reasons.push(`Acción corta (${duration} min): ideal para destrabar`);
  } else if (duration <= 35) {
    score += 15;
  } else if (duration > 60 && task.subtasks.filter(s => !s.isCompleted).length === 0) {
    // Tarea larga sin descomponer: penalización para invitar a dividir
    score -= 15;
  }

  // 4. Factor Rescate (Antipostergación)
  if (task.postponementCount > 0) {
    const boost = Math.min(task.postponementCount * 15, 45);
    score += boost;
    reasons.push(`Postergada ${task.postponementCount} ${task.postponementCount === 1 ? 'vez' : 'veces'}`);
  }

  const primaryReason = reasons.length > 0 ? reasons.slice(0, 2).join(' • ') : 'Prioridad general del día';

  return {
    task,
    score,
    reason: primaryReason,
  };
};

export const getRecommendedNextAction = (tasks: Task[]): ScoredTask | null => {
  const pendingTasks = tasks.filter(t => t.status !== 'completada');
  if (pendingTasks.length === 0) return null;

  const scored = pendingTasks.map(calculateTaskScore);
  scored.sort((a, b) => b.score - a.score);

  return scored[0];
};

export const getPostponedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(t => t.status !== 'completada' && t.postponementCount > 0);
};
