import { useState } from 'react';
import { useMovies } from '../../hooks/useMovies';
import RetroButton from '../../components/ui/RetroButton';
import RetroInput from '../../components/ui/RetroInput';
import RetroSelect from '../../components/ui/RetroSelect';
import RetroModal from '../../components/ui/RetroModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Film } from 'lucide-react';

const RATING_OPTIONS = [
  { value: 'G', label: 'G' },
  { value: 'PG', label: 'PG' },
  { value: 'PG-13', label: 'PG-13' },
  { value: 'R-16', label: 'R-16' },
  { value: 'R-18', label: 'R-18' },
  { value: 'X', label: 'X' },
];

const emptyForm = {
  title: '',
  durationminutes: '',
  mtrcb_rating: 'G',
  distributor: '',
  genre: '',
  posterurl: '',
};

export default function ManageMovies() {
  const { movies, loading, createMovie, updateMovie, deleteMovie } = useMovies();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(movie) {
    setEditing(movie);
    setForm({
      title: movie.title || '',
      durationminutes: movie.durationminutes || '',
      mtrcb_rating: movie.mtrcb_rating || 'G',
      distributor: movie.distributor || '',
      genre: movie.genre || '',
      posterurl: movie.posterurl || '',
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
        title: form.title,
        durationminutes: parseInt(form.durationminutes) || null,
        mtrcb_rating: form.mtrcb_rating,
        distributor: form.distributor || null,
        genre: form.genre || null,
        posterurl: form.posterurl || null,
      };

      if (editing) {
        await updateMovie(editing.movieid, data);
        toast.success('Movie updated');
      } else {
        await createMovie(data);
        toast.success('Movie created');
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(movie) {
    if (!confirm(`Delete "${movie.title}"? This will also delete all related sessions, bookings, and tickets.`)) return;

    try {
      await deleteMovie(movie.movieid);
      toast.success('Movie deleted');
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
          <Film size={22} className="text-cinema-gold" />
          Manage Movies
        </h1>
        <RetroButton onClick={openCreate} size="sm">
          <Plus size={14} />
          Add Movie
        </RetroButton>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : movies.length === 0 ? (
        <p className="text-cinema-cream/40 font-accent text-center py-12">No movies yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cinema-gold/20 text-left text-cinema-gold/70 font-accent text-xs uppercase tracking-wider">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Title</th>
                <th className="py-3 px-2">Duration</th>
                <th className="py-3 px-2">Rating</th>
                <th className="py-3 px-2">Genre</th>
                <th className="py-3 px-2">Distributor</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr
                  key={movie.movieid}
                  className="border-b border-cinema-gold/5 hover:bg-cinema-gold/5 transition-colors"
                >
                  <td className="py-2.5 px-2 text-cinema-cream/40 font-mono text-xs">
                    {movie.movieid}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream font-semibold">
                    {movie.title}
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">
                    {movie.durationminutes ? `${movie.durationminutes}m` : '—'}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="bg-cinema-red/30 text-cinema-cream px-1.5 py-0.5 text-xs font-accent">
                      {movie.mtrcb_rating}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">{movie.genre || '—'}</td>
                  <td className="py-2.5 px-2 text-cinema-cream/60">{movie.distributor || '—'}</td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(movie)}
                        className="p-1.5 text-cinema-cream/40 hover:text-cinema-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(movie)}
                        className="p-1.5 text-cinema-cream/40 hover:text-cinema-red transition-colors"
                        title="Delete"
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

      {/* Modal */}
      <RetroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Movie' : 'Add Movie'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <RetroInput
            label="Title"
            value={form.title}
            onChange={handleChange('title')}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <RetroInput
              label="Duration (minutes)"
              type="number"
              min="1"
              value={form.durationminutes}
              onChange={handleChange('durationminutes')}
              required
            />
            <RetroSelect
              label="MTRCB Rating"
              options={RATING_OPTIONS}
              value={form.mtrcb_rating}
              onChange={handleChange('mtrcb_rating')}
            />
          </div>
          <RetroInput
            label="Genre"
            placeholder="Action, Drama, Comedy..."
            value={form.genre}
            onChange={handleChange('genre')}
          />
          <RetroInput
            label="Poster URL"
            placeholder="https://..."
            value={form.posterurl}
            onChange={handleChange('posterurl')}
          />
          <RetroInput
            label="Distributor"
            placeholder="e.g. Star Cinema"
            value={form.distributor}
            onChange={handleChange('distributor')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <RetroButton
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
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
