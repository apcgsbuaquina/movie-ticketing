import { forwardRef } from 'react';

const RetroSelect = forwardRef(
  ({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-accent text-cinema-gold/80 tracking-wider uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5
            bg-cinema-dark/80 border-2 border-cinema-gold/30
            text-cinema-cream font-body
            focus:outline-none focus:border-cinema-gold focus:shadow-[0_0_10px_rgba(196,163,90,0.2)]
            transition-all duration-300
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23c4a35a%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
            bg-no-repeat bg-[right_12px_center]
            ${error ? 'border-cinema-red' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-cinema-dark text-cinema-cream/50">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-cinema-dark text-cinema-cream"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-cinema-red text-sm font-accent">{error}</p>
        )}
      </div>
    );
  }
);

RetroSelect.displayName = 'RetroSelect';
export default RetroSelect;
