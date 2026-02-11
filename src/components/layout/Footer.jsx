import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cinema-gold/10 bg-cinema-black/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-cinema-gold/60">
            <Film size={18} />
            <span className="font-heading text-sm">
              Cinema &copy; {new Date().getFullYear()}
            </span>
          </div>

          <p className="text-cinema-cream/30 font-accent text-xs tracking-wider text-center">
            A vintage cinema experience — crafted with love for the silver screen
          </p>

          <div className="text-cinema-cream/20 text-xs font-accent">
            Powered by Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
