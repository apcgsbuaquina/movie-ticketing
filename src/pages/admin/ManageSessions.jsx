import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useSessions } from '../../hooks/useSessions';
import { useMovies } from '../../hooks/useMovies';
import { useScreens } from '../../hooks/useScreens';
import RetroButton from '../../components/ui/RetroButton';
import RetroInput from '../../components/ui/RetroInput';
import RetroSelect from '../../components/ui/RetroSelect';
import RetroModal from '../../components/ui/RetroModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, CalendarClock } from 'lucide-react';

const EXPERIENCE_OPTIONS = [
  { value: '2D', label: '2D' },
  { value: '3D', label: '3D' },
  { value: '4DX 2D', label: '4DX 2D' },
  { value: '4DX 3D', label: '4DX 3D' },
  { value: 'IMAX 2D', label: 'IMAX 2D' },
  { value: 'IMAX 3D', label: 'IMAX 3D' },
  { value: 'IMAX with Laser', label: 'IMAX with Laser' },
];

const emptyForm = {
  movieid: '',
  screenid: '',
  starttime: '',
  endtime: '',
  baseprice: '',
  experience: '2D',
};

export default function ManageSessions() {
  const { sessions, loading, createSession, updateSession, deleteSession } = useSessions();
  const { movies } = useMovies();
  const { screens } = useScreens();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(session) {
    setEditing(session);
    setForm({
      movieid: session.movieid?.toString() || '',
      screenid: session.screenid?.toString() || '',
      starttime: session.starttime ? format(new Date(session.starttime), "yyyy-MM-dd'T'HH:mm") : '',
      endtime: session.endtime ? format(new Date(session.endtime), "yyyy-MM-dd'T'HH:mm") : '',
      baseprice: session.baseprice?.toString() || '',
      experience: session.experience || '2D',
    });
    setModalOpen(true);
  }

  function handleChange(field) {
    return (e) => {
      const val = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [field]: val };

        // Auto-calculate end time when start time or movie changes
        if (field === 'starttime' || field === 'movieid') {
          const selectedMovie = movies.find(
            (m) => m.movieid.toString() === (field === 'movieid' ? val : prev.movieid)
          );
          const startVal = field === 'starttime' ? val : prev.starttime;

          if (selectedMovie?.durationminutes && startVal) {
            const start = new Date(startVal);
            const end = new Date(start.getTime() + selectedMovie.durationminutes * 60000);
            next.endtime = format(end, "yyyy-MM-dd'T'HH:mm");
          }
        }

        return next;
      });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        movieid: parseInt(form.movieid),
        screenid: parseInt(form.screenid),
        starttime: new Date(form.starttime).toISOString(),
        endtime: new Date(form.endtime).toISOString(),
        baseprice: parseFloat(form.baseprice),
        experience: form.experience,
      };

      if (editing) {
        await updateSession(editing.sessionid, data);
        toast.success('Session updated');
      } else {
        await createSession(data);
        toast.success('Session created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(session) {
    if (!confirm('Delete this session? Related bookings and tickets will also be deleted.')) return;
    try {
      await deleteSession(session.sessionid);
      toast.success('Session deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  const movieOptions = movies.map((m) => ({
    value: m.movieid.toString(),
    label: `${m.title} (${m.durationminutes}m)`,
  }));

  const screenOptions = screens.map((s) => ({
    value: s.screenid.toString(),
    label: `${s.cinemabranch} — Screen ${s.screennumber} (${s.screentype})`,
  }));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Admin Panel
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2">
          <CalendarClock size={22} className="text-cinema-gold" />
          Manage Sessions
        </h1>
        <RetroButton onClick={openCreate} size="sm">
          <Plus size={14} />
          Add Session
        </RetroButton>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <p className="text-cinema-cream/40 font-accent text-center py-12">
          No sessions yet. Create one!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-gold/20 text-left text-cinema-gold/70 font-accent text-xs uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Movie</th>
                <th className="py-3 px-2">Screen</th>
                <th className="py-3 px-2">Start</th>
                <th className="py-3 px-2">End</th>
                <th className="py-3 px-2">Exp.</th>
                <th className="py-3 px-2">Price</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.sessionid}
                  className="border-b border-cinema-gold/5 hover:bg-cinema-gold/5 transition-colors"
                >
                  <td className="py-2.5 px-2 text-cinema-cream/40 font-mono text-xs">
                    {s.sessionid}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream font-semibold">
                    {s.movies?.title || s.movieid}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60 text-xs">
                    {s.screens ? `${s.screens.cinemabranch} #${s.screens.screennumber}` : s.screenid}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60 text-xs">
                    {format(new Date(s.starttime), 'MMM d, h:mm a')}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60 text-xs">
                    {format(new Date(s.endtime), 'h:mm a')}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="bg-cinema-teal/20 text-cinema-teal px-1.5 py-0.5 text-xs font-accent">
                      {s.experience}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-cinema-gold font-semibold">
                    ₱{Number(s.baseprice).toFixed(0)}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 text-cinema-cream/40 hover:text-cinema-gold transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
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
        title={editing ? 'Edit Session' : 'Add Session'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <RetroSelect
            label="Movie"
            options={movieOptions}
            placeholder="Select a movie"
            value={form.movieid}
            onChange={handleChange('movieid')}
            required
          />
          <RetroSelect
            label="Screen"
            options={screenOptions}
            placeholder="Select a screen"
            value={form.screenid}
            onChange={handleChange('screenid')}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <RetroInput
              label="Start Time"
              type="datetime-local"
              value={form.starttime}
              onChange={handleChange('starttime')}
              required
            />
            <RetroInput
              label="End Time"
              type="datetime-local"
              value={form.endtime}
              onChange={handleChange('endtime')}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RetroInput
              label="Base Price (₱)"
              type="number"
              min="0"
              step="0.01"
              value={form.baseprice}
              onChange={handleChange('baseprice')}
              required
            />
            <RetroSelect
              label="Experience"
              options={EXPERIENCE_OPTIONS}
              value={form.experience}
              onChange={handleChange('experience')}
            />
          </div>
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
