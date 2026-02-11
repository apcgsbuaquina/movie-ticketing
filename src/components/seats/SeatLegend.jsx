export default function SeatLegend() {
  const items = [
    { label: 'Available', className: 'seat seat-available' },
    { label: 'VIP', className: 'seat seat-vip' },
    { label: 'Selected', className: 'seat seat-selected' },
    { label: 'Taken', className: 'seat seat-taken' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`${item.className} w-6 h-6 text-[9px] pointer-events-none`} />
          <span className="text-cinema-cream/50 font-accent text-xs tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
