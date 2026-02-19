import { format } from 'date-fns';
import { Film, Clock, MapPin } from 'lucide-react';

export default function RetroTicket({ ticket, booking, movie, session, seat, screen }) {
  return (
    <div className="relative flex bg-cinema-cream text-cinema-dark overflow-hidden group">
      {/* Left stub */}
      <div className="w-24 bg-cinema-red flex flex-col items-center justify-center px-2 py-4 shrink-0">
        <Film size={20} className="text-cinema-cream mb-1" />
        <span className="text-cinema-cream font-heading text-xs font-bold text-center leading-tight">
          RETRO
          <br />
          CINE
        </span>
      </div>

      {/* Perforation line */}
      <div className="w-0 relative">
        <div className="absolute inset-y-0 -left-px w-px border-l-2 border-dashed border-cinema-dark/30" />
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <h3 className="font-heading font-bold text-lg text-cinema-dark truncate">
          {movie?.title || 'Movie Title'}
        </h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-cinema-dark/70 font-body min-w-0">
          {session?.starttime && (
            <span className="flex items-center gap-1 min-w-0">
              <Clock size={12} />
              {format(new Date(session.starttime), 'MMM d, yyyy — h:mm a')}
            </span>
          )}
          {screen && (
            <span className="flex items-center gap-1 min-w-0 break-words">
              <MapPin size={12} />
              {screen.cinemabranch} — Screen {screen.screennumber}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 min-w-0">
          {seat && (
            <span className="bg-cinema-dark text-cinema-cream px-2 py-0.5 text-xs font-accent tracking-wider">
              {seat.rowchar}{seat.seatnumber} ({seat.seattype})
            </span>
          )}
          {ticket?.tickettype && (
            <span className="text-xs font-accent text-cinema-dark/60 uppercase">
              {ticket.tickettype}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="w-24 bg-cinema-gold/20 flex flex-col items-center justify-center px-2 shrink-0">
        <span className="font-accent text-xs text-cinema-dark/60">PRICE</span>
        <span className="font-heading font-bold text-lg">
          ₱{ticket?.finalprice ? Number(ticket.finalprice).toFixed(0) : '0'}
        </span>
      </div>
    </div>
  );
}
