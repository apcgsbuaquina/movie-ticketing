import { useState, useEffect } from 'react';
import { useScreens } from '../../hooks/useScreens';
import { useSeats } from '../../hooks/useSeats';
import RetroButton from '../../components/ui/RetroButton';
import RetroInput from '../../components/ui/RetroInput';
import RetroSelect from '../../components/ui/RetroSelect';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Armchair, Plus, Trash2, Wand2 } from 'lucide-react';

export default function ManageSeats() {
  const { screens } = useScreens();
  const { seats, loading, fetchSeats, createSeats, deleteAllSeatsForScreen } = useSeats();
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [generating, setGenerating] = useState(false);

  // Generate form
  const [genRows, setGenRows] = useState('8');
  const [genSeatsPerRow, setGenSeatsPerRow] = useState('12');
  const [genVipRows, setGenVipRows] = useState('2');

  useEffect(() => {
    if (selectedScreenId) {
      fetchSeats(parseInt(selectedScreenId));
    }
  }, [selectedScreenId]);

  // Group seats by row for display
  const seatsByRow = {};
  seats.forEach((seat) => {
    if (!seatsByRow[seat.rowchar]) seatsByRow[seat.rowchar] = [];
    seatsByRow[seat.rowchar].push(seat);
  });
  const sortedRows = Object.keys(seatsByRow).sort();

  async function handleGenerate() {
    if (!selectedScreenId) {
      toast.error('Select a screen first');
      return;
    }

    const rows = parseInt(genRows);
    const seatsPerRow = parseInt(genSeatsPerRow);
    const vipRows = parseInt(genVipRows);

    if (rows < 1 || seatsPerRow < 1) {
      toast.error('Invalid values');
      return;
    }

    if (!confirm(`This will delete all existing seats for this screen and generate ${rows * seatsPerRow} new seats. Continue?`)) {
      return;
    }

    setGenerating(true);
    try {
      // Delete existing seats
      await deleteAllSeatsForScreen(parseInt(selectedScreenId));

      // Generate new seats
      const newSeats = [];
      for (let r = 0; r < rows; r++) {
        const rowChar = String.fromCharCode(65 + r); // A, B, C...
        const isVip = r >= rows - vipRows; // Last N rows are VIP

        for (let s = 1; s <= seatsPerRow; s++) {
          newSeats.push({
            screenid: parseInt(selectedScreenId),
            rowchar: rowChar,
            seatnumber: s,
            seattype: isVip ? 'VIP' : 'Standard',
          });
        }
      }

      await createSeats(newSeats);
      toast.success(`Generated ${newSeats.length} seats`);
      await fetchSeats(parseInt(selectedScreenId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleClearAll() {
    if (!selectedScreenId) return;
    if (!confirm('Delete ALL seats for this screen?')) return;

    try {
      await deleteAllSeatsForScreen(parseInt(selectedScreenId));
      toast.success('All seats deleted');
      await fetchSeats(parseInt(selectedScreenId));
    } catch (err) {
      toast.error(err.message);
    }
  }

  const screenOptions = screens.map((s) => ({
    value: s.screenid.toString(),
    label: `${s.cinemabranch} — Screen ${s.screennumber} (${s.screentype})`,
  }));

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-cinema-cream/50 hover:text-cinema-gold text-sm font-accent transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Admin Panel
      </Link>

      <h1 className="font-heading text-2xl font-bold text-cinema-cream flex items-center gap-2 mb-6">
        <Armchair size={22} className="text-cinema-gold" />
        Manage Seats
      </h1>

      {/* Screen selector */}
      <div className="bg-cinema-navy/40 border border-cinema-gold/15 p-4 mb-6">
        <RetroSelect
          label="Select Screen"
          options={screenOptions}
          placeholder="Choose a screen..."
          value={selectedScreenId}
          onChange={(e) => setSelectedScreenId(e.target.value)}
        />
      </div>

      {selectedScreenId && (
        <>
          {/* Generator */}
          <div className="bg-cinema-dark/50 border border-cinema-gold/15 p-4 mb-6">
            <h2 className="font-heading font-bold text-cinema-gold mb-3 flex items-center gap-2">
              <Wand2 size={16} />
              Auto-Generate Seats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <RetroInput
                label="Number of Rows"
                type="number"
                min="1"
                max="26"
                value={genRows}
                onChange={(e) => setGenRows(e.target.value)}
              />
              <RetroInput
                label="Seats per Row"
                type="number"
                min="1"
                max="30"
                value={genSeatsPerRow}
                onChange={(e) => setGenSeatsPerRow(e.target.value)}
              />
              <RetroInput
                label="VIP Rows (from back)"
                type="number"
                min="0"
                value={genVipRows}
                onChange={(e) => setGenVipRows(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <RetroButton onClick={handleGenerate} disabled={generating} size="sm">
                {generating ? 'Generating...' : (
                  <>
                    <Plus size={14} />
                    Generate Seats
                  </>
                )}
              </RetroButton>
              <RetroButton onClick={handleClearAll} variant="danger" size="sm">
                <Trash2 size={14} />
                Clear All
              </RetroButton>
            </div>
          </div>

          {/* Seat display */}
          {loading ? (
            <LoadingSpinner text="Loading seats..." />
          ) : seats.length === 0 ? (
            <p className="text-cinema-cream/40 font-accent text-center py-8">
              No seats configured for this screen. Use the generator above.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-cinema-cream">
                  Seat Layout ({seats.length} seats)
                </h2>
                <div className="flex items-center gap-3 text-xs font-accent">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-cinema-navy border border-cinema-teal/50 rounded-t" />
                    Standard
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-cinema-burgundy/40 border border-cinema-gold/50 rounded-t" />
                    VIP
                  </span>
                </div>
              </div>

              {/* Visual seat map */}
              <div className="bg-cinema-dark/30 border border-cinema-gold/10 p-6 overflow-x-auto">
                <div className="cinema-screen w-3/4 max-w-sm h-6 mx-auto mb-6" />
                <p className="text-center text-cinema-cream/30 font-accent text-[10px] tracking-[0.3em] uppercase mb-4">
                  Screen
                </p>

                <div className="flex flex-col items-center gap-1">
                  {sortedRows.map((row) => (
                    <div key={row} className="flex items-center gap-1">
                      <span className="w-5 text-center text-cinema-gold/50 font-accent text-xs">
                        {row}
                      </span>
                      {seatsByRow[row]
                        .sort((a, b) => a.seatnumber - b.seatnumber)
                        .map((seat) => (
                          <div
                            key={seat.seatid}
                            className={`w-6 h-6 rounded-t text-[9px] flex items-center justify-center font-accent ${
                              seat.seattype === 'VIP'
                                ? 'bg-cinema-burgundy/40 border border-cinema-gold/40 text-cinema-gold/60'
                                : 'bg-cinema-navy border border-cinema-teal/30 text-cinema-cream/40'
                            }`}
                            title={`${row}${seat.seatnumber} (${seat.seattype})`}
                          >
                            {seat.seatnumber}
                          </div>
                        ))}
                      <span className="w-5 text-center text-cinema-gold/50 font-accent text-xs">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
