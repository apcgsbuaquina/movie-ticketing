export default function BookingSummary({ session, selectedSeats, ticketDetails, movie, screen }) {
  const convenienceFee = 20.0;
  const subtotal = ticketDetails.reduce((sum, t) => sum + t.finalPrice, 0);
  const total = subtotal + convenienceFee;

  return (
    <div className="bg-cinema-dark/60 border border-cinema-gold/20 p-4 space-y-3">
      <h3 className="font-heading font-bold text-cinema-gold text-lg border-b border-cinema-gold/20 pb-2">
        Booking Summary
      </h3>

      <div className="space-y-1 text-sm font-body">
        <div className="flex justify-between">
          <span className="text-cinema-cream/60">Movie</span>
          <span className="text-cinema-cream font-semibold">{movie?.title}</span>
        </div>
        {screen && (
          <div className="flex justify-between">
            <span className="text-cinema-cream/60">Screen</span>
            <span className="text-cinema-cream">
              {screen.cinemabranch} — #{screen.screennumber} ({screen.screentype})
            </span>
          </div>
        )}
        {session?.experience && (
          <div className="flex justify-between">
            <span className="text-cinema-cream/60">Experience</span>
            <span className="text-cinema-cream">{session.experience}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-cinema-cream/60">Seats</span>
          <span className="text-cinema-cream">
            {selectedSeats.map((s) => `${s.rowchar}${s.seatnumber}`).join(', ')}
          </span>
        </div>
      </div>

      <div className="border-t border-cinema-gold/10 pt-2 space-y-1 text-sm">
        {ticketDetails.map((t, idx) => (
          <div key={idx} className="flex justify-between text-cinema-cream/60">
            <span>
              {selectedSeats[idx]?.rowchar}{selectedSeats[idx]?.seatnumber} — {t.ticketType}
            </span>
            <span>₱{t.finalPrice.toFixed(2)}</span>
          </div>
        ))}

        <div className="flex justify-between text-cinema-cream/60">
          <span>Convenience Fee</span>
          <span>₱{convenienceFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-heading font-bold text-cinema-gold text-lg pt-1 border-t border-cinema-gold/20 mt-1">
          <span>Total</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
