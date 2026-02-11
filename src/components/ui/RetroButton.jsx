import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-cinema-gold text-cinema-dark hover:bg-cinema-sepia border-cinema-gold',
  secondary:
    'bg-transparent text-cinema-gold border-cinema-gold hover:bg-cinema-gold/10',
  danger:
    'bg-cinema-red text-cinema-cream hover:bg-cinema-burgundy border-cinema-red',
  ghost:
    'bg-transparent text-cinema-cream/70 border-transparent hover:text-cinema-gold hover:border-cinema-gold/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const RetroButton = forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-heading font-semibold tracking-wide uppercase
          border-2 transition-all duration-300
          retro-glow cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';
export default RetroButton;
