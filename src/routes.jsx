import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
import Carrito from './components/Carrito';
import PrivateRoute from './components/PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="misdatos" element={<PrivateRoute><MisDatos /></PrivateRoute>} />
        <Route path="miscompras" element={<PrivateRoute><MisCompras /></PrivateRoute>} />
        <Route path="misventas" element={<PrivateRoute><MisVentas /></PrivateRoute>} />
        <Route path="mispublicaciones" element={<PrivateRoute><MisPublicaciones /></PrivateRoute>} />
        <Route path="adminprod" element={<PrivateRoute><AdminProd /></PrivateRoute>} />
        <Route path="publicacion/:id" element={<Publicacion />} />
        <Route path="mispreguntas" element={<PrivateRoute><MisPreguntas /></PrivateRoute>} />
        <Route path="misrespuestas" element={<PrivateRoute><MisRespuestas /></PrivateRoute>} />
        <Route path="buscador/:texto" element={<Buscador />} />
      </Route>
    </Routes>
  );
}
