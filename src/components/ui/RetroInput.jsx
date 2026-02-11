import { forwardRef } from 'react';

const RetroInput = forwardRef(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-accent text-cinema-gold/80 tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5
            bg-cinema-dark/80 border-2 border-cinema-gold/30
            text-cinema-cream font-body
            placeholder:text-cinema-cream/30
            focus:outline-none focus:border-cinema-gold focus:shadow-[0_0_10px_rgba(196,163,90,0.2)]
            transition-all duration-300
            ${error ? 'border-cinema-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-cinema-red text-sm font-accent">{error}</p>
        )}
      </div>
    );
  }
);

RetroInput.displayName = 'RetroInput';
export default RetroInput;
