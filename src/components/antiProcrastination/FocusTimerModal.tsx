import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, CheckCircle2, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FocusTimerModal: React.FC = () => {
  const { focusTask, closeFocusTimer, toggleCompleteTask } = useApp();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(focusTask?.estimatedMinutes || 25);
  const [secondsLeft, setSecondsLeft] = useState<number>(selectedMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Sincronizar tiempo cuando cambia la tarea seleccionada
  useEffect(() => {
    if (focusTask) {
      const mins = focusTask.estimatedMinutes || 25;
      setSelectedMinutes(mins);
      setSecondsLeft(mins * 60);
      setIsRunning(true);
    }
  }, [focusTask]);

  // Intervalo del cronómetro
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  if (!focusTask) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const handleSelectMinutes = (mins: number) => {
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
  };

  const handleCompleteAndClose = () => {
    toggleCompleteTask(focusTask.id);
    closeFocusTimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-8">
        
        {/* Botón Cerrar */}
        <button
          onClick={closeFocusTimer}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Indicador de Enfoque */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-3 border border-indigo-100">
          <Flame className="w-3.5 h-3.5 text-indigo-600" />
          Modo Enfoque sin distracciones
        </div>

        {/* Tarea en curso */}
        <h3 className="text-lg font-bold text-slate-900 mb-1 max-w-xs mx-auto line-clamp-2">
          {focusTask.title}
        </h3>
        {focusTask.description && (
          <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto line-clamp-2">
            {focusTask.description}
          </p>
        )}

        {/* Círculo o visualizador del tiempo */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono text-slate-900">
            {formattedTime}
          </div>

          {/* Barra de progreso */}
          <div className="w-48 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Selectores de intervalo rápido */}
        <div className="flex justify-center gap-2 mb-6">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectMinutes(mins)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedMinutes === mins
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Controles de reproducción */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-indigo-200 transition-all"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setSecondsLeft(selectedMinutes * 60);
              setIsRunning(false);
            }}
            className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all"
            title="Reiniciar cronómetro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Botón de Terminar Tarea con Éxito */}
        <button
          onClick={handleCompleteAndClose}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm border border-emerald-200 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Tarea terminada! Marcar como completada</span>
        </button>

      </div>
    </div>
  );
};
