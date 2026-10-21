import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  RotateCcw,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NextActionCard } from '../antiProcrastination/NextActionCard';
import { TaskItem } from '../tasks/TaskItem';
import { getGreeting, isTaskToday, isTaskOverdue, formatDate, toLocalISODate } from '../../utils/dateUtils';
import { getPostponedTasks } from '../../utils/antiProcrastination';

export const MyDayView: React.FC = () => {
  const { 
    tasks, 
    payments, 
    categories, 
    addTask, 
    openTaskModal, 
    setActiveTab,
    searchQuery 
  } = useApp();

  const [quickInput, setQuickInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { greeting, dateText } = getGreeting();

  // Filtrado de tareas del día y atrasadas
  const pendingTasks = tasks.filter((t) => t.status !== 'completada');
  const completedToday = tasks.filter((t) => t.status === 'completada' && isTaskToday(t.completedAt));

  const overdueTasks = pendingTasks.filter((t) => isTaskOverdue(t.dueDate));
  const todayTasks = pendingTasks.filter((t) => isTaskToday(t.dueDate));
  const withoutDateTasks = pendingTasks.filter((t) => !t.dueDate);

  // Tareas para la sección principal de Mi Día (Atrasadas primero, luego hoy, luego alta prioridad)
  const myDayList = [...overdueTasks, ...todayTasks].filter((t) => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const postponedList = getPostponedTasks(tasks);

  // Pagos próximos en los siguientes 7 días
  const todayStr = toLocalISODate(new Date());
  const upcomingPayments = payments.filter((p) => p.status === 'pendiente');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    addTask({
      title: quickInput.trim(),
      categoryId: selectedCategory !== 'all' ? selectedCategory : (categories[0]?.id || ''),
      priority: 'media',
      status: 'pendiente',
      dueDate: todayStr,
      estimatedMinutes: 20,
    });

    setQuickInput('');
  };

  return (
    <div className="space-y-7 pb-16">
      
      {/* Saludo y Resumen Ejecutivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {greeting}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {dateText}
          </p>
        </div>

        {/* Resumen rápido de métricas */}
        <div className="flex items-center gap-2">
          {overdueTasks.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" />
              {overdueTasks.length} {overdueTasks.length === 1 ? 'atrasada' : 'atrasadas'}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {todayTasks.length} para hoy
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedToday.length} hechas
          </span>
        </div>
      </div>

      {/* 🎯 HERO ANTIPROCRASTINACIÓN: ¿Qué es lo más importante que debería hacer ahora? */}
      <NextActionCard />

      {/* Grid Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        
        {/* Columna Izquierda (2/3): Tareas de Hoy y Captura Rápida */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Barra de Captura Rápida en 1 Click */}
          <form
            onSubmit={handleQuickAdd}
            className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs focus-within:border-indigo-500 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 ml-1">
              <Plus className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Agregar tarea rápida para hoy (presioná Enter)..."
              className="flex-1 min-w-0 text-sm bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="shrink-0 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => openTaskModal(null, { dueDate: todayStr })}
              className="shrink-0 text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Abrir formulario detallado"
            >
              Detalles
            </button>
          </form>

          {/* Filtros de Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todas
            </button>
            {categories.slice(0, 7).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Lista de Tareas de Hoy */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>Prioridades y Tareas del Día</span>
                <span className="text-[11px] font-normal text-slate-400">({myDayList.length})</span>
              </h3>
            </div>

            {myDayList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No hay tareas pendientes asignadas a hoy</p>
                <p className="text-xs text-slate-400 mt-1">
                  Podés agregar una arriba o revisar la pestaña <button onClick={() => setActiveTab('proximos')} className="text-indigo-600 font-semibold underline">Próximos</button>.
                </p>
              </div>
            ) : (
              myDayList.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </div>

          {/* Rescate de Tareas Postergadas (Antiprocrastinación activa) */}
          {postponedList.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200/80">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rescate de Tareas Postergadas ({postponedList.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Tareas que fueron pospuestas repetidamente. Revisalas para ejecutarlas hoy, delegarlas o descartarlas sin culpa.
              </p>
              <div className="space-y-2">
                {postponedList.slice(0, 3).map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Columna Derecha (1/3): Compromisos Financieros & Atajos */}
        <div className="space-y-6">
          
          {/* Card de Vencimientos Financieros Próximos */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">Vencimientos y Pagos</h3>
              </div>
              <button
                onClick={() => setActiveTab('pagos')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No tenés pagos pendientes registrados.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingPayments.slice(0, 3).map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{pay.concept}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Vence: <strong>{formatDate(pay.dueDate)}</strong> {pay.entityName && `• ${pay.entityName}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        {pay.currency} {pay.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips de Productividad y Enfoque */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-5 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Regla de los 5 minutos
            </div>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Si una tarea te genera resistencia, proponete avanzar en ella durante solo <strong>5 minutos</strong> con el cronómetro de enfoque. El 80% de las veces, romper la inercia es suficiente para terminarla.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
