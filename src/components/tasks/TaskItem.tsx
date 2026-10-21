import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Check, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Split, 
  Play, 
  AlertTriangle,
  RotateCcw,
  Repeat
} from 'lucide-react';
import { Task, Category, RECURRENCE_LABELS } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate, isTaskOverdue, isTaskToday } from '../../utils/dateUtils';

interface TaskItemProps {
  task: Task;
}


export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { 
    categories, 
    toggleCompleteTask, 
    openTaskModal, 
    deleteTask, 
    postponeTask, 
    openBreakdownModal,
    openFocusTimer
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const place = () => {
      const btn = buttonRef.current;
      const panel = panelRef.current;
      if (!btn || !panel) return;
      const r = btn.getBoundingClientRect();
      const pw = panel.offsetWidth;
      const ph = panel.offsetHeight;
      const left = Math.min(Math.max(8, r.right - pw), window.innerWidth - pw - 8);
      const top =
        r.bottom + ph + 8 > window.innerHeight ? Math.max(8, r.top - ph - 4) : r.bottom + 4;
      setMenuPos({ top, left });
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    place();
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [menuOpen]);

  const category = categories.find((c) => c.id === task.categoryId);
  const isCompleted = task.status === 'completada';
  const isOverdue = !isCompleted && isTaskOverdue(task.dueDate);
  const isToday = !isCompleted && isTaskToday(task.dueDate);

  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200/60 opacity-75'
          : isOverdue
          ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300 hover:shadow-xs'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Botón Checkbox circular suave */}
      <button
        onClick={() => toggleCompleteTask(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
          isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : isOverdue
            ? 'border-rose-400 hover:border-rose-600'
            : 'border-slate-300 hover:border-indigo-500'
        }`}
        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0">
        
        {/* Título y Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={`text-sm font-semibold tracking-tight transition-all truncate ${
              isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
            }`}
          >
            {task.title}
          </span>

          {/* Badge de Categoría */}
          {category && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}

          {/* Badge de Repetición */}
          {task.recurrence && task.recurrence !== 'unica' && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 flex items-center gap-1"
              title={`Se repite: ${RECURRENCE_LABELS[task.recurrence]}`}
            >
              <Repeat className="w-2.5 h-2.5" />
              {RECURRENCE_LABELS[task.recurrence]}
            </span>
          )}

          {/* Badge de Prioridad */}
          {task.priority === 'alta' && !isCompleted && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
              ALTA
            </span>
          )}

          {/* Badge de Tarea Postergada (Alerta antiprocrastinación suave) */}
          {task.postponementCount > 0 && !isCompleted && (
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-1" title={`Esta tarea fue postergada ${task.postponementCount} veces`}>
              <RotateCcw className="w-2.5 h-2.5" />
              {task.postponementCount}x
            </span>
          )}
        </div>

        {/* Descripción si existe */}
        {task.description && (
          <p
            className={`text-xs mb-2 leading-relaxed line-clamp-2 ${
              isCompleted ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Metadatos: Fecha, Duración, Subtareas */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          
          {/* Fecha Límite */}
          {task.dueDate ? (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 font-semibold'
                  : isToday
                  ? 'text-amber-600 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              <Calendar className="w-3.5 h-3.5" />
              <span>{isOverdue ? `Atrasada: ${formatDate(task.dueDate)}` : isToday ? 'Hoy' : formatDate(task.dueDate)}</span>
            </span>
          ) : (
            <span className="text-slate-400">Sin fecha límite</span>
          )}

          {/* Duración */}
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{task.estimatedMinutes}m</span>
            </span>
          )}

          {/* Subtareas */}
          {totalSubtasks > 0 && (
            <button
              onClick={() => openBreakdownModal(task)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Split className="w-3 h-3" />
              <span>
                {completedSubtasks}/{totalSubtasks} pasos
              </span>
            </button>
          )}

        </div>

      </div>

      {/* Menú de Acciones Rápidas */}
      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          onClick={() => {
            setMenuPos(null);
            setMenuOpen((v) => !v);
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Opciones de tarea"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {menuOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              top: menuPos?.top ?? -9999,
              left: menuPos?.left ?? -9999,
              visibility: menuPos ? 'visible' : 'hidden',
            }}
            className="fixed w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            {!isCompleted && (
              <>
                <button
                  onClick={() => {
                    openFocusTimer(task);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Modo Enfoque</span>
                </button>

                <button
                  onClick={() => {
                    openBreakdownModal(task);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Split className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dividir en micro-pasos</span>
                </button>

                <button
                  onClick={() => {
                    postponeTask(task.id, 1);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Posponer para mañana</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                openTaskModal(task);
                setMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Editar tarea</span>
            </button>

            <div className="border-t border-slate-100 my-1" />

            <button
              onClick={() => {
                if (window.confirm(`¿Seguro que deseás eliminar "${task.title}"?`)) {
                  deleteTask(task.id);
                }
                setMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar definitivamente</span>
            </button>
          </div>,
          document.body
        )}

    </div>
  );
};
