import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FilmGrain from '../ui/FilmGrain';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col halftone-bg">
      <FilmGrain />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
