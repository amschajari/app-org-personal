import React from 'react';
import { Calendar, Plus, Inbox, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem } from '../tasks/TaskItem';
import { formatDate, toLocalISODate } from '../../utils/dateUtils';

export const UpcomingView: React.FC = () => {
  const { tasks, openTaskModal, searchQuery } = useApp();

  const now = new Date();
  const todayStr = toLocalISODate(now);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toLocalISODate(tomorrow);

  const inSevenDays = new Date();
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const inSevenDaysStr = toLocalISODate(inSevenDays);

  const pendingTasks = tasks.filter((t) => t.status !== 'completada' && (!searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())));

  const tomorrowTasks = pendingTasks.filter((t) => t.dueDate === tomorrowStr);
  const thisWeekTasks = pendingTasks.filter((t) => t.dueDate && t.dueDate > tomorrowStr && t.dueDate <= inSevenDaysStr);
  const laterTasks = pendingTasks.filter((t) => t.dueDate && t.dueDate > inSevenDaysStr);
  const backlogTasks = pendingTasks.filter((t) => !t.dueDate);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Próximos Compromisos y Backlog
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Vista cronológica de tareas futuras y banco de ideas sin fecha definida.
          </p>
        </div>

        <button
          onClick={() => openTaskModal(null, { dueDate: tomorrowStr })}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Programar tarea</span>
        </button>
      </div>

      {/* Mañana */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Mañana ({formatDate(tomorrowStr)})</span>
          <span className="text-[11px] font-medium text-slate-400">{tomorrowTasks.length} tareas</span>
        </h3>
        {tomorrowTasks.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 bg-white rounded-2xl border border-slate-100">
            No tenés compromisos programados para mañana.
          </p>
        ) : (
          <div className="space-y-2">
            {tomorrowTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Próximos 7 Días */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Próximos 7 días</span>
          <span className="text-[11px] font-medium text-slate-400">{thisWeekTasks.length} tareas</span>
        </h3>
        {thisWeekTasks.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 bg-white rounded-2xl border border-slate-100">
            Sin tareas para el resto de la semana.
          </p>
        ) : (
          <div className="space-y-2">
            {thisWeekTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Más adelante en el mes */}
      {laterTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Más adelante</span>
            <span className="text-[11px] font-medium text-slate-400">{laterTasks.length} tareas</span>
          </h3>
          <div className="space-y-2">
            {laterTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* Backlog de Ideas / Sin fecha (Sin agobio) */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              Banco de Ideas y Asuntos sin fecha ({backlogTasks.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cosas para hacer en algún momento sin la presión de un vencimiento inmediato.
            </p>
          </div>
          <button
            onClick={() => openTaskModal(null, { dueDate: undefined })}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Registrar idea
          </button>
        </div>

        {backlogTasks.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 bg-white rounded-2xl border border-slate-100">
            No tenés ideas ni asuntos pendientes sin fecha guardados.
          </p>
        ) : (
          <div className="space-y-2">
            {backlogTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
