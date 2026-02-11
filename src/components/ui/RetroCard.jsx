export default function RetroCard({ children, className = '', jagged = false, glow = false }) {
  return (
    <div
      className={`
        bg-cinema-navy/80 border border-cinema-gold/20
        ${jagged ? 'jagged-both pt-4 pb-4' : ''}
        ${glow ? 'retro-glow' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}
