import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Split, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BreakdownModal: React.FC = () => {
  const { 
    breakdownTask, 
    closeBreakdownModal, 
    addSubTask, 
    toggleSubTask, 
    deleteSubTask 
  } = useApp();

  const [newStepText, setNewStepText] = useState('');

  if (!breakdownTask) return null;

  const handleAddStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStepText.trim()) return;
    addSubTask(breakdownTask.id, newStepText.trim());
    setNewStepText('');
  };

  const completedSteps = breakdownTask.subtasks.filter(s => s.isCompleted).length;
  const totalSteps = breakdownTask.subtasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-7">
        
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-1.5">
              <Split className="w-3.5 h-3.5" />
              Descomposición en micro-pasos
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {breakdownTask.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dividir una tarea grande en pasos de 10-15 minutos elimina la resistencia a comenzar.
            </p>
          </div>
          <button
            onClick={closeBreakdownModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progreso */}
        {totalSteps > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
              <span>Progreso de pasos</span>
              <span>{completedSteps} de {totalSteps} completados</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Lista de Subtareas Existentes */}
        <div className="my-5 max-h-60 overflow-y-auto space-y-2 pr-1">
          {breakdownTask.subtasks.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
              <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
              ¿Cuál es la primera acción física concreta que podés hacer en 10 minutos?
            </div>
          ) : (
            breakdownTask.subtasks.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <button
                  onClick={() => toggleSubTask(breakdownTask.id, step.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      step.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {step.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-sm ${
                      step.isCompleted
                        ? 'line-through text-slate-400 font-normal'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                <button
                  onClick={() => deleteSubTask(breakdownTask.id, step.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Eliminar paso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Formulario para agregar nuevo paso */}
        <form onSubmit={handleAddStep} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            placeholder="Escribí un paso pequeño (ej: abrir archivo y leer resumen)..."
            className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newStepText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium text-sm rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </form>

        {/* Botón de Listo */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={closeBreakdownModal}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
