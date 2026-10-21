import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CreditCard,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem } from '../tasks/TaskItem';
import { UpcomingView } from '../views/UpcomingView';
import {
  getMonthMatrix,
  toLocalISODate,
  MONTH_NAMES_ES,
  formatLongDate,
} from '../../utils/dateUtils';
import { Task, FinancialCommitment } from '../../types';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const AgendaView: React.FC = () => {
  const { tasks, payments, categories, openTaskModal, togglePaymentStatus, setActiveTab } = useApp();

  const todayIso = toLocalISODate(new Date());

  const [view, setView] = useState<'calendario' | 'lista'>('calendario');
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [selected, setSelected] = useState<string>(todayIso);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate.split('T')[0];
      (map[key] ||= []).push(t);
    });
    return map;
  }, [tasks]);

  const paymentsByDate = useMemo(() => {
    const map: Record<string, FinancialCommitment[]> = {};
    payments.forEach((p) => {
      if (!p.dueDate) return;
      const key = p.dueDate.split('T')[0];
      (map[key] ||= []).push(p);
    });
    return map;
  }, [payments]);

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.color;
    });
    return map;
  }, [categories]);

  const matrix = useMemo(() => getMonthMatrix(cursor.year, cursor.month), [cursor]);

  const goMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const goToday = () => {
    const n = new Date();
    setCursor({ year: n.getFullYear(), month: n.getMonth() });
    setSelected(todayIso);
  };

  const selectedTasks = tasksByDate[selected] || [];
  const selectedPayments = paymentsByDate[selected] || [];

  return (
    <div className="space-y-5 pb-16">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-indigo-600" />
            Agenda
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Calendario de tareas y vencimientos de pagos en un solo lugar.
          </p>
        </div>

        <div className="inline-flex self-start bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView('calendario')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              view === 'calendario' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendario
          </button>
          <button
            onClick={() => setView('lista')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              view === 'lista' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {view === 'lista' ? (
        <UpcomingView />
      ) : (
        <>
          {/* Barra del mes */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => goMonth(-1)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 min-w-[150px] text-center capitalize">
                {MONTH_NAMES_ES[cursor.month]} {cursor.year}
              </h2>
              <button
                onClick={() => goMonth(1)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Tareas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Pagos
                </span>
              </div>
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Grilla mensual + panel del día */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-2 sm:p-3">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wide py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {matrix.map((day) => {
                  const iso = toLocalISODate(day);
                  const inMonth = day.getMonth() === cursor.month;
                  const isToday = iso === todayIso;
                  const isSelected = iso === selected;
                  const dTasks = tasksByDate[iso] || [];
                  const dPayments = paymentsByDate[iso] || [];
                  const total = dTasks.length + dPayments.length;
                  const dTaskColors = Array.from(
                    new Set(dTasks.map((t) => categoryColors[t.categoryId] || '#6366f1'))
                  ).slice(0, 3);

                  return (
                    <button
                      key={iso}
                      onClick={() => setSelected(iso)}
                      className={`relative min-h-[74px] sm:min-h-[96px] rounded-xl border p-1.5 text-left flex flex-col transition-all ${
                        inMonth ? 'bg-white border-slate-100' : 'bg-slate-50/60 border-transparent'
                      } ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : 'hover:border-slate-300'} ${
                        isToday && !isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isToday ? 'text-indigo-700' : inMonth ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      {/* Vista compacta en desktop */}
                      <div className="hidden sm:block mt-1 space-y-0.5 overflow-hidden">
                        {dTasks.slice(0, 2).map((t) => (
                          <div key={t.id} className="flex items-center gap-1 text-[10px] leading-tight">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: categoryColors[t.categoryId] || '#6366f1' }}
                            />
                            <span
                              className={`truncate ${
                                t.status === 'completada' ? 'line-through text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {t.title}
                            </span>
                          </div>
                        ))}
                        {dPayments.slice(0, 1).map((p) => (
                          <div key={p.id} className="flex items-center gap-1 text-[10px] leading-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span
                              className={`truncate ${
                                p.status === 'pagado' ? 'line-through text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {p.concept}
                            </span>
                          </div>
                        ))}
                        {total > 3 && (
                          <div className="text-[10px] font-medium text-slate-400 px-0.5">+{total - 3} más</div>
                        )}
                      </div>

                      {/* Puntos en mobile */}
                      <div className="sm:hidden mt-auto flex items-center gap-0.5">
                        {dTaskColors.map((color) => (
                          <span
                            key={color}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {dPayments.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel del día seleccionado */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{formatLongDate(selected)}</h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedTasks.length + selectedPayments.length === 0
                        ? 'Sin compromisos'
                        : `${selectedTasks.length} tarea(s) · ${selectedPayments.length} pago(s)`}
                    </p>
                  </div>
                  <button
                    onClick={() => openTaskModal(null, { dueDate: selected })}
                    className="shrink-0 inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tarea
                  </button>
                </div>

                {selectedTasks.length + selectedPayments.length === 0 ? (
                  <div className="py-8 text-center">
                    <CalendarClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No hay nada agendado para este día.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-0.5">
                    {selectedTasks.map((t) => (
                      <TaskItem key={t.id} task={t} />
                    ))}

                    {selectedPayments.map((p) => {
                      const paid = p.status === 'pagado';
                      const overdue = !paid && p.dueDate < todayIso;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-100"
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-rose-500 shrink-0" />
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  paid ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {p.concept}
                              </p>
                              <p
                                className={`text-xs truncate ${
                                  overdue ? 'text-rose-600 font-medium' : 'text-slate-500'
                                }`}
                              >
                                {p.entityName ? `${p.entityName} · ` : ''}
                                {p.currency} {p.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => togglePaymentStatus(p.id)}
                            title={paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              paid
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {selectedPayments.length > 0 && (
                      <button
                        onClick={() => setActiveTab('pagos')}
                        className="w-full text-center text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 py-1"
                      >
                        Ver todo en Pagos y Deudas →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
