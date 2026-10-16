import React from 'react';
import { CheckCircle2, Loader2, Target, AlertTriangle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navbar } from './components/layout/Navbar';
import { MyDayView } from './components/views/MyDayView';
import { UpcomingView } from './components/views/UpcomingView';
import { PaymentsView } from './components/views/PaymentsView';
import { CompletedView } from './components/views/CompletedView';
import { TaskModal } from './components/tasks/TaskModal';
import { FocusTimerModal } from './components/antiProcrastination/FocusTimerModal';
import { BreakdownModal } from './components/antiProcrastination/BreakdownModal';

const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'Cargando tus datos...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
      <Target className="w-6 h-6 animate-pulse" />
    </div>
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { activeTab, lastCompletedTask, undoCompleteTask, isLoading, error, reload } = useApp();

  if (authLoading) return <LoadingScreen label="Verificando sesión..." />;
  if (!user) return <AuthScreen />;
  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">

      {/* Barra de Navegación Superior Fija */}
      <Navbar />

      {/* Banner de error de sincronización */}
      {error && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1 leading-relaxed">No se pudieron sincronizar los datos: {error}</span>
            <button
              onClick={reload}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

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
