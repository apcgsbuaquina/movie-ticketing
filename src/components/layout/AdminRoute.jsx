import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { user, isAdmin, isStaff, loading } = useAuth();

  if (loading) return null;

  if (!user || (!isAdmin && !isStaff)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
