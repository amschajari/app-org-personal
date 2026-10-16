import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  Search, 
  Sparkles,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';

export const CompletedView: React.FC = () => {
  const { tasks, toggleCompleteTask, deleteTask, categories, searchQuery } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const completedTasks = tasks.filter(
    (t) =>
      t.status === 'completada' &&
      (!searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterCategory === 'all' || t.categoryId === filterCategory)
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            Historial de Completados
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Registro de todo lo que lograste. Podés reabrir cualquier tarea o eliminarla definitivamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            {completedTasks.length} {completedTasks.length === 1 ? 'tarea completada' : 'tareas completadas'}
          </span>
        </div>
      </div>

      {/* Filtro por Categoría */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas ({tasks.filter(t => t.status === 'completada').length})
        </button>
        {categories.map((c) => {
          const count = tasks.filter(t => t.status === 'completada' && t.categoryId === c.id).length;
          if (count === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === c.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de Tareas Completadas */}
      {completedTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-500">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">Aún no hay tareas en el historial</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            A medida que vayas completando tus tareas del día, aparecerán acá ordenadas para que puedas consultar tus avances.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {completedTasks.map((task) => {
            const category = categories.find((c) => c.id === task.categoryId);
            return (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 line-through truncate">
                      {task.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                      {category && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.2 rounded"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                      <span>•</span>
                      <span>Completada {formatDate(task.completedAt || task.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Botón Reabrir */}
                  <button
                    onClick={() => toggleCompleteTask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    title="Restaurar a pendientes"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reabrir</span>
                  </button>

                  {/* Botón Eliminar Definitivamente (Acción diferenciada con confirmación) */}
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Confirmás la eliminación definitiva de "${task.title}"? Esta acción no se puede deshacer.`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Eliminar definitivamente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
