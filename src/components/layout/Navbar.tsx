import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Bell, 
  Plus, 
  Search, 
  Target,
  Sparkles,
  X,
  ExternalLink,
  LogOut,
  Tags,
  KeyRound,
  BellRing
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CategoryManagerModal } from './CategoryManagerModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    openTaskModal,
    unreadNotificationsCount,
    notifications,
    dismissNotification,
    tasks,
    payments,
    notificationPermission,
    requestNotificationPermission,
    remindersEnabled,
    setRemindersEnabled
  } = useApp();

  const { signOut, user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const completedCount = tasks.filter(t => t.status === 'completada').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'pendiente').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'mi-dia', label: 'Mi Día', icon: <Sun className="w-4 h-4" /> },
    { id: 'proximos', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
    { id: 'pagos', label: 'Pagos y Deudas', icon: <CreditCard className="w-4 h-4" />, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined },
    { id: 'completados', label: 'Completados', icon: <CheckCircle2 className="w-4 h-4" />, badge: completedCount > 0 ? completedCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo y Marca */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                Productiva
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Personal
                </span>
              </span>
            </div>
          </div>

          {/* Buscador Rápido */}
          <div className="hidden md:flex flex-1 max-w-xs relative items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas, proyectos..."
              className="w-full pl-9 pr-8 py-1.5 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-transparent focus:border-indigo-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navegación Principal de 4 Espacios */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-indigo-200/80 text-indigo-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Acciones: Campanita & Botón Nueva Tarea */}
          <div className="flex items-center gap-2.5">
            {/* Campanita de Notificaciones */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
                  showNotifications ? 'bg-slate-100 text-slate-900' : ''
                }`}
                title="Notificaciones y avisos"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Panel Desplegable de la Campanita */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-semibold text-slate-900">Avisos y Recordatorios</h4>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {unreadNotificationsCount} {unreadNotificationsCount === 1 ? 'pendiente' : 'pendientes'}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 px-4">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium">¡Estás al día!</p>
                        <p className="text-xs text-slate-400 mt-0.5">No tenés vencimientos ni avisos pendientes para hoy.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-left"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                notif.urgency === 'critica' ? 'bg-rose-500' : notif.urgency === 'alta' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                              <span className="text-[10px] text-slate-400 ml-auto">{notif.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Descartar aviso"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer: activar recordatorios del navegador */}
                  <div className="p-3 bg-slate-50/70 border-t border-slate-100">
                    {notificationPermission === 'granted' ? (
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`flex items-center gap-1.5 text-[11px] font-medium ${
                            remindersEnabled ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          {remindersEnabled ? 'Recordatorios activos' : 'Recordatorios pausados'}
                        </p>
                        <button
                          onClick={() => setRemindersEnabled(!remindersEnabled)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2"
                        >
                          {remindersEnabled ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    ) : notificationPermission === 'unsupported' ? (
                      <p className="text-[11px] text-slate-400">
                        Este navegador no admite notificaciones.
                      </p>
                    ) : notificationPermission === 'denied' ? (
                      <p className="text-[11px] leading-relaxed text-amber-700">
                        Bloqueaste las notificaciones. Habilitalas desde el candado de la barra de direcciones.
                      </p>
                    ) : (
                      <button
                        onClick={() => requestNotificationPermission()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        Activar recordatorios del navegador
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón Categorías */}
            <button
              onClick={() => setShowCategories(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Gestionar categorías"
              aria-label="Categorías"
            >
              <Tags className="w-5 h-5" />
            </button>

            {/* Botón Acción Rápida: + Nueva Tarea */}
            <button
              onClick={() => openTaskModal()}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva tarea</span>
            </button>

            {/* Cambiar contraseña */}
            <button
              onClick={() => setShowPassword(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Cambiar contraseña"
              aria-label="Cambiar contraseña"
            >
              <KeyRound className="w-5 h-5" />
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title={user?.email ? `Cerrar sesión (${user.email})` : 'Cerrar sesión'}
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Barra de Navegación Móvil (Pestañas inferiores o secundarias) */}
        <div className="sm:hidden flex items-center justify-around py-2 border-t border-slate-100">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <CategoryManagerModal isOpen={showCategories} onClose={() => setShowCategories(false)} />
      <ChangePasswordModal isOpen={showPassword} onClose={() => setShowPassword(false)} />
    </header>
  );
};
