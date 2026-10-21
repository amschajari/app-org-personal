import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Flag, AlertCircle, Plus, Check, Repeat } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBackToClose } from '../../hooks/useBackToClose';
import { Priority, RecurrenceType } from '../../types';
import { formatDate, nextRecurrenceDate, toLocalISODate } from '../../utils/dateUtils';

export const TaskModal: React.FC = () => {
  const { 
    isTaskModalOpen, 
    closeTaskModal, 
    taskToEdit, 
    taskDefaultValues,
    addTask, 
    updateTask, 
    categories 
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('unica');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
  const [subtasksInput, setSubtasksInput] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // Sincronizar campos cuando se abre en modo edición o creación
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setRecurrence(taskToEdit.recurrence || 'unica');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 25);
      setSubtasksInput([]);
    } else {
      // Valores por defecto para nueva tarea
      setTitle(taskDefaultValues?.title || '');
      setDescription(taskDefaultValues?.description || '');
      setCategoryId(taskDefaultValues?.categoryId || categories[0]?.id || '');
      setPriority(taskDefaultValues?.priority || 'media');
      setDueDate(taskDefaultValues?.dueDate || toLocalISODate(new Date()));
      setRecurrence(taskDefaultValues?.recurrence || 'unica');
      setEstimatedMinutes(taskDefaultValues?.estimatedMinutes || 25);
      setSubtasksInput([]);
    }
  }, [taskToEdit, isTaskModalOpen, categories, taskDefaultValues]);

  useBackToClose(isTaskModalOpen, closeTaskModal);

  if (!isTaskModalOpen) return null;

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek' | 'none') => {
    const d = new Date();
    if (type === 'today') {
      setDueDate(toLocalISODate(d));
    } else if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      setDueDate(toLocalISODate(d));
    } else if (type === 'nextWeek') {
      d.setDate(d.getDate() + 7);
      setDueDate(toLocalISODate(d));
    } else {
      setDueDate('');
    }
  };

  const handleAddSubtaskItem = () => {
    if (!newSubtask.trim()) return;
    setSubtasksInput(prev => [...prev, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || categories[0]?.id || '',
        priority,
        dueDate: dueDate || undefined,
        recurrence,
        estimatedMinutes: Number(estimatedMinutes) || 25,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || categories[0]?.id || '',
        priority,
        status: 'pendiente',
        dueDate: dueDate || undefined,
        recurrence,
        estimatedMinutes: Number(estimatedMinutes) || 25,
        subtasks: subtasksInput,
      });
    }

    closeTaskModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {taskToEdit ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto min-h-0 p-5 sm:p-6 space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              ¿Qué tenés que hacer? *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Preparar presentación para la reunión..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
              autoFocus
              required
            />
          </div>

          {/* Descripción opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notas o detalles (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Contexto, links o anotaciones adicionales..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800 resize-none"
            />
          </div>

          {/* Categoría y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['baja', 'media', 'alta'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                      priority === p
                        ? p === 'alta'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : p === 'media'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fecha Límite con accesos rápidos */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha límite
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {dueDate ? dueDate : 'Sin fecha (Backlog)'}
              </span>
            </label>

            {/* Accesos rápidos de fecha */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handleQuickDate('today')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate('tomorrow')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Mañana
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate('nextWeek')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                En 1 semana
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate('none')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Sin fecha
              </button>
            </div>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* Repetición */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-slate-400" />
              Repetir
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
            >
              <option value="unica">No se repite</option>
              <option value="diaria">Todos los días</option>
              <option value="semanal">Cada semana</option>
              <option value="mensual">Cada mes</option>
              <option value="anual">Cada año</option>
            </select>
            {recurrence !== 'unica' && dueDate && (
              <p className="text-[11px] text-slate-400 mt-1">
                Al completarla se crea la siguiente para el{' '}
                <span className="font-medium text-slate-500">
                  {formatDate(nextRecurrenceDate(dueDate, recurrence))}
                </span>
                .
              </p>
            )}
          </div>

          {/* Tiempo estimado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tiempo estimado (clave antiprocrastinación)
            </label>
            <div className="flex gap-2">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    estimatedMinutes === mins
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Subtareas iniciales (en modo creación) */}
          {!taskToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Micro-pasos iniciales (opcional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtaskItem();
                    }
                  }}
                  placeholder="Ej: Abrir archivo de plantilla..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddSubtaskItem}
                  disabled={!newSubtask.trim()}
                  className="px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-medium rounded-xl"
                >
                  + Paso
                </button>
              </div>

              {subtasksInput.length > 0 && (
                <div className="space-y-1">
                  {subtasksInput.map((st, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg text-slate-700">
                      <span>• {st}</span>
                      <button
                        type="button"
                        onClick={() => setSubtasksInput(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción del Modal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'Guardar cambios' : 'Crear tarea'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
