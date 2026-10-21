import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Repeat, 
  Calendar, 
  DollarSign, 
  Trash2,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinancialCommitment, PaymentStatus, RecurrenceType } from '../../types';
import { formatDate, toLocalISODate } from '../../utils/dateUtils';

export const PaymentsView: React.FC = () => {
  const { payments, categories, addPayment, updatePayment, togglePaymentStatus, deletePayment } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<FinancialCommitment | null>(null);

  // Form State
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [entityName, setEntityName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('unica');
  const [notes, setNotes] = useState('');
  const [reminderDays, setReminderDays] = useState(2);
  const [categoryId, setCategoryId] = useState('');

  const defaultCategoryId = () =>
    categories.find((c) => c.name === 'Finanzas')?.id || categories[0]?.id || '';

  const handleOpenCreate = () => {
    setPaymentToEdit(null);
    setConcept('');
    setAmount('');
    setCurrency('ARS');
    setEntityName('');
    setDueDate(toLocalISODate(new Date()));
    setRecurrence('unica');
    setNotes('');
    setReminderDays(2);
    setCategoryId(defaultCategoryId());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: FinancialCommitment) => {
    setPaymentToEdit(p);
    setConcept(p.concept);
    setAmount(String(p.amount));
    setCurrency(p.currency);
    setEntityName(p.entityName || '');
    setDueDate(p.dueDate || '');
    setRecurrence(p.recurrence || 'unica');
    setNotes(p.notes || '');
    setReminderDays(p.reminderDaysBefore ?? 2);
    setCategoryId(p.categoryId || '');
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    togglePaymentStatus(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseás eliminar este registro de pago?')) {
      deletePayment(id);
    }
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !amount) return;

    if (paymentToEdit) {
      updatePayment(paymentToEdit.id, {
        concept: concept.trim(),
        amount: parseFloat(amount) || 0,
        currency,
        entityName: entityName.trim() || undefined,
        categoryId: categoryId || '',
        dueDate: dueDate || toLocalISODate(new Date()),
        recurrence,
        reminderDaysBefore: Number(reminderDays),
        notes: notes.trim() || undefined,
      });
    } else {
      addPayment({
        concept: concept.trim(),
        amount: parseFloat(amount) || 0,
        currency,
        entityName: entityName.trim() || undefined,
        categoryId: categoryId || defaultCategoryId(),
        dueDate: dueDate || toLocalISODate(new Date()),
        status: 'pendiente',
        recurrence,
        reminderDaysBefore: Number(reminderDays),
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);

    // Reset Form
    setConcept('');
    setAmount('');
    setEntityName('');
    setNotes('');
  };

  const todayStr = toLocalISODate(new Date());

  const pendingPayments = payments.filter((p) => p.status === 'pendiente');
  const paidPayments = payments.filter((p) => p.status === 'pagado');
  const overduePayments = pendingPayments.filter((p) => p.dueDate < todayStr);

  const totalPendingARS = pendingPayments
    .filter((p) => p.currency === 'ARS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingUSD = pendingPayments
    .filter((p) => p.currency === 'USD')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-rose-500" />
            Pagos, Deudas y Vencimientos
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Administrá tus compromisos económicos, monotributo, servicios y cuotas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xs transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo compromiso</span>
        </button>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Pendiente Este Mes
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900">
            ${totalPendingARS.toLocaleString('es-AR')} ARS
          </div>
          {totalPendingUSD > 0 && (
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              + ${totalPendingUSD.toLocaleString()} USD
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Compromisos Vencidos
          </span>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {overduePayments.length}
          </div>
          <span className="text-xs text-slate-400">Requieren pago prioritario</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pagos Realizados
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {paidPayments.length}
          </div>
          <span className="text-xs text-slate-400">Historial conservado</span>
        </div>

      </div>

      {/* Lista de Pagos Pendientes */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Próximos Vencimientos ({pendingPayments.length})
        </h3>

        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">¡Al día! No hay compromisos de pago pendientes.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingPayments.map((p) => {
              const isOverdue = p.dueDate < todayStr;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleStatus(p.id)}
                      className="mt-0.5 w-5 h-5 rounded-lg border border-slate-300 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                      title="Marcar como pagado"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.concept}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        {p.entityName && <span>Para: <strong>{p.entityName}</strong></span>}
                        <span>•</span>
                        <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                          Vence: {formatDate(p.dueDate)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 capitalize">
                          <Repeat className="w-3 h-3" />
                          {p.recurrence}
                        </span>
                      </div>
                      {p.notes && <p className="text-xs text-slate-400 mt-1">{p.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {p.currency} ${p.amount.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(p.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
                    >
                      Pagar
                    </button>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Editar compromiso de pago"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Eliminar registro"
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

      {/* Historial de Pagos Realizados */}
      {paidPayments.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Historial de Pagos Realizados ({paidPayments.length})
          </h3>
          <div className="space-y-2 opacity-80">
            {paidPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStatus(p.id)}
                    className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0"
                    title="Reabrir / volver a pendiente"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <div>
                    <span className="font-semibold text-slate-800 line-through">{p.concept}</span>
                    <span className="text-slate-400 ml-2">Pagado {formatDate(p.paidAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">
                    {p.currency} ${p.amount.toLocaleString('es-AR')}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Editar datos de este pago"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                    title="Eliminar del historial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear Compromiso Financiero */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {paymentToEdit ? 'Editar Compromiso de Pago' : 'Nuevo Compromiso de Pago'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="overflow-y-auto min-h-0 px-6 py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej: Monotributo, Alquiler, Servidor..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Importe *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Moneda
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organismo / Comercio / Persona
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Ej: AFIP, Banco, Proveedor..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Recurrencia
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="unica">Única vez</option>
                    <option value="mensual">Mensual</option>
                    <option value="semanal">Semanal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Avisar con anticipación
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>El mismo día del vencimiento</option>
                  <option value={1}>1 día antes</option>
                  <option value={2}>2 días antes (Recomendado)</option>
                  <option value={3}>3 días antes</option>
                  <option value={5}>5 días antes</option>
                  <option value={7}>1 semana antes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pagar con VEP o débito..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {paymentToEdit ? 'Guardar Cambios' : 'Guardar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
