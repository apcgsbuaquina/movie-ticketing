export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Film reel spinner */}
        <div className="absolute inset-0 border-2 border-cinema-gold/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-cinema-gold rounded-full animate-spin" />
        <div className="absolute inset-2 border-2 border-transparent border-b-cinema-sepia rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      {text && (
        <p className="text-cinema-cream/60 font-accent text-sm tracking-wider animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
