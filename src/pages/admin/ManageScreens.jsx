import { useState } from 'react';
import { useScreens } from '../../hooks/useScreens';
import RetroButton from '../../components/ui/RetroButton';
import RetroInput from '../../components/ui/RetroInput';
import RetroSelect from '../../components/ui/RetroSelect';
import RetroModal from '../../components/ui/RetroModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Monitor } from 'lucide-react';

const SCREEN_TYPE_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'IMAX', label: 'IMAX' },
  { value: 'Directors Club', label: "Directors Club" },
  { value: '4DX', label: '4DX' },
];

const emptyForm = {
  cinemabranch: '',
  screennumber: '',
  screentype: 'Standard',
  totalseats: '',
};

export default function ManageScreens() {
  const { screens, loading, createScreen, updateScreen, deleteScreen } = useScreens();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(screen) {
    setEditing(screen);
    setForm({
      cinemabranch: screen.cinemabranch || '',
      screennumber: screen.screennumber?.toString() || '',
      screentype: screen.screentype || 'Standard',
      totalseats: screen.totalseats?.toString() || '',
    });
    setModalOpen(true);
  }

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        cinemabranch: form.cinemabranch,
        screennumber: parseInt(form.screennumber),
        screentype: form.screentype,
        totalseats: parseInt(form.totalseats) || null,
      };

      if (editing) {
        await updateScreen(editing.screenid, data);
        toast.success('Screen updated');
      } else {
        await createScreen(data);
        toast.success('Screen created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(screen) {
    if (!confirm(`Delete Screen ${screen.screennumber} at ${screen.cinemabranch}? All seats, sessions, and bookings will be deleted.`)) return;
    try {
      await deleteScreen(screen.screenid);
      toast.success('Screen deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2">
          <Monitor size={22} className="text-cinema-gold" />
          Manage Screens
        </h1>
        <RetroButton onClick={openCreate} size="sm">
          <Plus size={14} />
          Add Screen
        </RetroButton>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : screens.length === 0 ? (
        <p className="text-cinema-cream/40 font-accent text-center py-12">No screens yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-gold/20 text-left text-cinema-gold/70 font-accent text-xs uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Branch</th>
                <th className="py-3 px-2">Screen #</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Total Seats</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr
                  key={screen.screenid}
                  className="border-b border-cinema-gold/5 hover:bg-cinema-gold/5 transition-colors"
                >
                  <td className="py-2.5 px-2 text-cinema-cream/40 font-mono text-xs">
                    {screen.screenid}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream font-semibold">
                    {screen.cinemabranch}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">{screen.screennumber}</td>
                  <td className="py-2.5 px-2">
                    <span className="bg-cinema-gold/10 text-cinema-gold/80 px-1.5 py-0.5 text-xs font-accent">
                      {screen.screentype}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">{screen.totalseats || '—'}</td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(screen)}
                        className="p-1.5 text-cinema-cream/40 hover:text-cinema-gold transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(screen)}
                        className="p-1.5 text-cinema-cream/40 hover:text-cinema-red transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RetroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Screen' : 'Add Screen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <RetroInput
            label="Cinema Branch"
            placeholder="e.g. SM Mall of Asia"
            value={form.cinemabranch}
            onChange={handleChange('cinemabranch')}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <RetroInput
              label="Screen Number"
              type="number"
              min="1"
              value={form.screennumber}
              onChange={handleChange('screennumber')}
              required
            />
            <RetroSelect
              label="Screen Type"
              options={SCREEN_TYPE_OPTIONS}
              value={form.screentype}
              onChange={handleChange('screentype')}
            />
          </div>
          <RetroInput
            label="Total Seats"
            type="number"
            min="1"
            value={form.totalseats}
            onChange={handleChange('totalseats')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <RetroButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </RetroButton>
            <RetroButton type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </RetroButton>
          </div>
        </form>
      </RetroModal>
    </div>
  );
}
