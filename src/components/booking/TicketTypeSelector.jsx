import RetroSelect from '../ui/RetroSelect';
import RetroInput from '../ui/RetroInput';

const TICKET_TYPES = [
  { value: 'Regular', label: 'Regular', discount: 0 },
  { value: 'Senior Citizen', label: 'Senior Citizen (20% off)', discount: 0.20 },
  { value: 'PWD', label: 'PWD (20% off)', discount: 0.20 },
  { value: 'Student', label: 'Student (20% off)', discount: 0.20 },
  { value: 'Child', label: 'Child (50% off)', discount: 0.50 },
];

export function getDiscountForType(type) {
  const found = TICKET_TYPES.find((t) => t.value === type);
  return found ? found.discount : 0;
}

export default function TicketTypeSelector({
  seat,
  basePrice,
  ticketType,
  seniorPwdId,
  onTypeChange,
  onIdChange,
}) {
  const discount = getDiscountForType(ticketType);
  const finalPrice = basePrice * (1 - discount);
  const needsId = ticketType === 'Senior Citizen' || ticketType === 'PWD';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-cinema-dark/50 border border-cinema-gold/10">
      <div className="shrink-0 flex items-center gap-2">
        <span className="bg-cinema-gold text-cinema-dark px-2 py-0.5 text-xs font-accent font-bold tracking-wider">
          {seat.rowchar}{seat.seatnumber}
        </span>
        <span className="text-cinema-cream/40 text-xs font-accent">
          {seat.seattype}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <RetroSelect
          options={TICKET_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          value={ticketType}
          onChange={(e) => onTypeChange(e.target.value)}
        />

        {needsId && (
          <RetroInput
            placeholder="Senior/PWD ID #"
            value={seniorPwdId}
            onChange={(e) => onIdChange(e.target.value)}
          />
        )}
      </div>

      <div className="shrink-0 text-right">
        {discount > 0 && (
          <span className="text-cinema-cream/30 text-xs line-through block font-accent">
            ₱{basePrice.toFixed(2)}
          </span>
        )}
        <span className="text-cinema-gold font-heading font-bold">
          ₱{finalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
