
import { Routes, Route } from 'react-router-dom';
import Inicio from './pages/inicio';
import MisDatos from './pages/misdatos';
import MisCompras from './pages/miscompras';
import MisVentas from './pages/misventas';
import MisPublicaciones from './pages/mispublicaciones';
import AdminProd from './pages/adminprod';
import Publicacion from './pages/publicacion';
import MisPreguntas from './pages/mispreguntas';
import MisRespuestas from './pages/misrespuestas';
import Buscador from './pages/buscador';
import PrivateRoute from './components/PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/misdatos" element={<PrivateRoute><MisDatos /></PrivateRoute>} />
      <Route path="/miscompras" element={<PrivateRoute><MisCompras /></PrivateRoute>} />
      <Route path="/misventas" element={<PrivateRoute><MisVentas /></PrivateRoute>} />
      <Route path="/mispublicaciones" element={<PrivateRoute><MisPublicaciones /></PrivateRoute>} />
      <Route path="/adminprod" element={<PrivateRoute><AdminProd /></PrivateRoute>} />
      <Route path="/publicacion/:id" element={<PrivateRoute><Publicacion /></PrivateRoute>} />
      <Route path="/mispreguntas" element={<PrivateRoute><MisPreguntas /></PrivateRoute>} />
      <Route path="/misrespuestas" element={<PrivateRoute><MisRespuestas /></PrivateRoute>} />
      <Route path="/buscador/:texto" element={<PrivateRoute><Buscador /></PrivateRoute>} />
    </Routes>
  );
}
