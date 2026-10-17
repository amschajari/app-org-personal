import React, { useState } from 'react';
import { X, Tags, Plus, Trash2, ChevronUp, ChevronDown, Check, Pencil, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_COLORS } from '../../services/seed';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = { type: 'error' | 'success'; text: string } | null;

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
  const { categories, tasks, payments, addCategory, updateCategory, deleteCategory, reorderCategories } = useApp();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<Message>(null);

  if (!isOpen) return null;

  const usageCount = (catId: string): number =>
    tasks.filter((t) => t.categoryId === catId).length +
    payments.filter((p) => p.categoryId === catId).length;

  const nameExists = (name: string, ignoreId?: string): boolean =>
    categories.some((c) => c.id !== ignoreId && c.name.trim().toLowerCase() === name.trim().toLowerCase());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (nameExists(name)) {
      setMessage({ type: 'error', text: 'Ya existe una categoría con ese nombre.' });
      return;
    }
    addCategory({ name, color: newColor, isDefault: false });
    setNewName('');
    setNewColor(CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]);
    setMessage({ type: 'success', text: `Categoría "${name}" creada.` });
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setMessage(null);
  };

  const saveEdit = (id: string) => {
    const name = editName.trim();
    if (!name) return;
    if (nameExists(name, id)) {
      setMessage({ type: 'error', text: 'Ya existe otra categoría con ese nombre.' });
      return;
    }
    updateCategory(id, { name });
    setEditingId(null);
    setMessage(null);
  };

  const handleDelete = (id: string, name: string) => {
    const used = usageCount(id);
    if (used > 0) {
      setMessage({
        type: 'error',
        text: `No se puede eliminar "${name}": está en uso en ${used} elemento(s). Reasigná o eliminá esos primero.`,
      });
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${name}"?`)) {
      deleteCategory(id);
      setMessage({ type: 'success', text: `Categoría "${name}" eliminada.` });
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const ids = categories.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderCategories(ids);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Categorías</h2>
              <p className="text-[11px] text-slate-400">Personalizá tus rubros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">

          {/* Nueva categoría */}
          <form onSubmit={handleAdd} className="flex items-center gap-2">
            <div className="relative shrink-0">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer bg-white p-0.5"
                title="Color"
              />
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nueva categoría..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </form>

          {message && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Lista */}
          <div className="space-y-1.5">
            {categories.map((cat, i) => {
              const used = usageCount(cat.id);
              const isEditing = editingId === cat.id;
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 p-2 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-colors"
                >
                  <input
                    type="color"
                    value={cat.color}
                    onChange={(e) => updateCategory(cat.id, { color: e.target.value })}
                    className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5 shrink-0"
                    title="Cambiar color"
                  />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveEdit(cat.id); }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-indigo-400 rounded-lg focus:outline-none text-slate-900"
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">{cat.name}</span>
                  )}

                  {!isEditing && used > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 shrink-0">
                      {used}
                    </span>
                  )}

                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Renombrar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex flex-col shrink-0">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      title="Subir"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === categories.length - 1}
                      className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      title="Bajar"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
