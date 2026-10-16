import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Split, 
  Clock, 
  ChevronRight, 
  Check, 
  Flame, 
  Coffee,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRecommendedNextAction, ScoredTask } from '../../utils/antiProcrastination';

export const NextActionCard: React.FC = () => {
  const { 
    tasks, 
    categories, 
    toggleCompleteTask, 
    openFocusTimer, 
    openBreakdownModal,
    postponeTask,
    openTaskModal
  } = useApp();

  const [skipOffset, setSkipOffset] = useState(0);

  // Filtrar pendientes y ordenar según algoritmo antiprocrastinación
  const pendingTasks = tasks.filter(t => t.status !== 'completada');
  const scoredTasks: ScoredTask[] = pendingTasks
    .map(t => {
      // Reutilizamos el cálculo
      const rec = getRecommendedNextAction([t]);
      return rec ? rec : { task: t, score: 0, reason: 'Pendiente' };
    })
    .sort((a, b) => b.score - a.score);

  // Si el usuario da a "Pasar a otra", rotamos el índice
  const currentIndex = scoredTasks.length > 0 ? (skipOffset % scoredTasks.length) : 0;
  const currentRecommendation = scoredTasks[currentIndex] || null;

  if (!currentRecommendation) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/60 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                ¡Día despejado! No tenés tareas pendientes urgentes
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Excelente momento para descansar, aprender algo nuevo o registrar tus próximas metas.
              </p>
            </div>
          </div>
          <button
            onClick={() => openTaskModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-all shrink-0"
          >
            + Registrar nueva tarea
          </button>
        </div>
      </div>
    );
  }

  const { task, reason } = currentRecommendation;
  const category = categories.find(c => c.id === task.categoryId);
  const pendingSubtasks = task.subtasks.filter(s => !s.isCompleted);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
      {/* Glow ambiental decorativo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Cabecera de la Recomendación */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              ¿Qué hago ahora?
            </span>
            {category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                {category.name}
              </span>
            )}
            {task.priority === 'alta' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                <Flame className="w-3 h-3" /> Alta prioridad
              </span>
            )}
          </div>

          <div className="text-xs text-indigo-200/80 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Estimado: <strong>{task.estimatedMinutes || 25} min</strong></span>
          </div>
        </div>

        {/* Título de la Próxima Acción */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
          {task.title}
        </h2>

        {/* Razón de priorización concreta */}
        <p className="text-sm text-indigo-100/90 flex items-center gap-2 mb-4 font-normal">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span><strong>Por qué empezar acá:</strong> {reason}</span>
        </p>

        {/* Subtareas si las hay */}
        {task.subtasks.length > 0 && (
          <div className="mb-5 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-xs text-indigo-200 mb-2 font-medium">
              <span>Primer paso concreto a ejecutar:</span>
              <span>{task.subtasks.filter(s => s.isCompleted).length} de {task.subtasks.length} listos</span>
            </div>
            {pendingSubtasks.length > 0 ? (
              <p className="text-sm font-medium text-amber-200 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 shrink-0 text-amber-300" />
                {pendingSubtasks[0].title}
              </p>
            ) : (
              <p className="text-xs text-emerald-300">¡Todas las subtareas completadas! Podés finalizar la tarea.</p>
            )}
          </div>
        )}

        {/* Botones de Acción Inmediata (Antiprocrastinación activa) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          
          {/* Botón de Enfoque con Timer */}
          <button
            onClick={() => openFocusTimer(task)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar enfoque ({task.estimatedMinutes || 25} min)</span>
          </button>

          {/* Botón Dividir en Pasos (Descomposición) */}
          <button
            onClick={() => openBreakdownModal(task)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-100 font-medium text-sm transition-all border border-white/15"
            title="Dividir en subtareas más pequeñas si sentís bloqueo"
          >
            <Split className="w-4 h-4 text-indigo-300" />
            <span>Dividir en pasos</span>
          </button>

          {/* Completar Tarea */}
          <button
            onClick={() => toggleCompleteTask(task.id)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 font-medium text-sm transition-all border border-emerald-500/40"
          >
            <Check className="w-4 h-4" />
            <span>Completada</span>
          </button>

          {/* Pasar a la siguiente recomendación sin culpa */}
          {scoredTasks.length > 1 && (
            <button
              onClick={() => setSkipOffset(prev => prev + 1)}
              className="ml-auto text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Ver la siguiente tarea recomendada en la lista"
            >
              <span>Otra tarea</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
