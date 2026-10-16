import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MyDayView } from './components/views/MyDayView';
import { UpcomingView } from './components/views/UpcomingView';
import { PaymentsView } from './components/views/PaymentsView';
import { CompletedView } from './components/views/CompletedView';
import { TaskModal } from './components/tasks/TaskModal';
import { FocusTimerModal } from './components/antiProcrastination/FocusTimerModal';
import { BreakdownModal } from './components/antiProcrastination/BreakdownModal';

import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, lastCompletedTask, undoCompleteTask } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Barra de Navegación Superior Fija */}
      <Navbar />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'mi-dia' && <MyDayView />}
        {activeTab === 'proximos' && <UpcomingView />}
        {activeTab === 'pagos' && <PaymentsView />}
        {activeTab === 'completados' && <CompletedView />}
      </main>

      {/* Modales Globales */}
      <TaskModal />
      <FocusTimerModal />
      <BreakdownModal />

      {/* Toast Flotante de Deshacer para Tareas Completadas */}
      {lastCompletedTask && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-100">Tarea completada y guardada</p>
            <p className="text-slate-400 line-clamp-1 max-w-[200px]">{lastCompletedTask.title}</p>
          </div>
          <button
            onClick={undoCompleteTask}
            className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
          >
            Deshacer
          </button>
        </div>
      )}

    </div>
  );
};
