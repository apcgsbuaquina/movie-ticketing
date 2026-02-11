import { useMemo } from 'react';

export default function SeatMap({
  seats,
  takenSeatIds,
  selectedSeats,
  onSeatToggle,
  maxSelectable = 10,
}) {
  // Group seats by row
  const seatsByRow = useMemo(() => {
    const rows = {};
    (seats || []).forEach((seat) => {
      const row = seat.rowchar;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    // Sort rows alphabetically
    const sorted = {};
    Object.keys(rows)
      .sort()
      .forEach((row) => {
        sorted[row] = rows[row].sort((a, b) => a.seatnumber - b.seatnumber);
      });
    return sorted;
  }, [seats]);

  const selectedIds = new Set(selectedSeats.map((s) => s.seatid));

  function handleClick(seat) {
    if (takenSeatIds.has(seat.seatid)) return;

    if (selectedIds.has(seat.seatid)) {
      onSeatToggle(selectedSeats.filter((s) => s.seatid !== seat.seatid));
    } else {
      if (selectedSeats.length >= maxSelectable) return;
      onSeatToggle([...selectedSeats, seat]);
    }
  }

  function getSeatClass(seat) {
    if (takenSeatIds.has(seat.seatid)) return 'seat seat-taken';
    if (selectedIds.has(seat.seatid)) return 'seat seat-selected';
    if (seat.seattype === 'VIP') return 'seat seat-vip';
    return 'seat seat-available';
  }

  const rows = Object.keys(seatsByRow);

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="flex flex-col items-center mb-8">
        <div className="cinema-screen w-3/4 max-w-md h-8 mb-2" />
        <span className="text-cinema-cream/40 font-accent text-xs tracking-[0.3em] uppercase">
          Screen
        </span>
      </div>

      {/* Seats grid */}
      <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-4">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            {/* Row label */}
            <span className="w-6 text-center text-cinema-gold/60 font-accent text-xs font-bold">
              {row}
            </span>

            {/* Seats */}
            {seatsByRow[row].map((seat) => (
              <button
                key={seat.seatid}
                className={getSeatClass(seat)}
                onClick={() => handleClick(seat)}
                disabled={takenSeatIds.has(seat.seatid)}
                title={`${row}${seat.seatnumber} (${seat.seattype})${
                  takenSeatIds.has(seat.seatid) ? ' — Taken' : ''
                }`}
              >
                {seat.seatnumber}
              </button>
            ))}

            {/* Row label right */}
            <span className="w-6 text-center text-cinema-gold/60 font-accent text-xs font-bold">
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="text-center text-cinema-cream/40 font-accent text-xs">
        {selectedSeats.length > 0 ? (
          <span>
            Selected: {selectedSeats.length} / {maxSelectable} seats
          </span>
        ) : (
          <span>Click a seat to select it (max {maxSelectable})</span>
        )}
      </div>
    </div>
  );
}
