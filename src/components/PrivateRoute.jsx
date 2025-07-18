import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Cargando...</div>;


  return isAuthenticated ? children : <Navigate to="/" />;
}
