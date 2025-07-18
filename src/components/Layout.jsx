import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Footer from './Footer';
import { getRol, estaAutenticado, getUsuario } from '../services/auth';

import { useAuthModals } from '../context/AuthModalContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import ExpiredModal from './ExpiredModal';

export default function Layout() {
  const [usuarioaut, setUsuarioaut] = useState(estaAutenticado());
  const [opMenu, setOpMenu] = useState([]);
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);

  const { login: loginGlobal, logout: logoutGlobal } = useAuth();
  const { showLoginModal, setShowLoginModal, showExpiredModal, setShowExpiredModal } = useAuthModals();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuarioaut) {
      traerMenu(getRol());
    }
  }, [usuarioaut]);

  const logout = async () => {
    try {
      await api.patch('/logout', { id_usuario: getUsuario() });
    } catch (e) {
      console.log(e);
    }
    logoutGlobal();
    setUsuarioaut(false);
    setOpMenu([]);
    navigate('/');
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password: clave });
      loginGlobal(res.data.token);
      setUsuarioaut(true);
      setClave('');
      setEmail('');
      setShowLoginModal(false);
    } catch (err) {
      setError(true);
    }
  };

  const traerMenu = async (idRol) => {
    try {
      const res = await api.get(`/menu/${idRol}`);
      setOpMenu(res.data);
    } catch (e) {
      setOpMenu([]);
    }
  };

  const buscar = () => {
    const info = document.getElementById('buscador');
    if (info.value !== '') {
      navigate(`/buscador/${info.value}`);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg bg-body-secondary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/assets/img/logo4.png" alt="mercadobyte" height="60" />
          </a>
          <div className="flex-grow-1 d-flex justify-content-center align-items-center">
            <form className="d-flex" onSubmit={(e) => { e.preventDefault(); buscar(); }} style={{ width: '100%', maxWidth: 600 }}>
              <input className="form-control me-2" id="buscador" type="search" placeholder="Buscar..." />
              <button className="btn btn-light">Buscar</button>
            </form>
          </div>

          <div className="d-flex align-items-center">
            <ul className="navbar-nav ms-auto">
              {!usuarioaut && (
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={() => setShowLoginModal(true)}>
                    Ingresá
                  </button>
                </li>
              )}

              {usuarioaut && (
                <li className="nav-item dropdown">
                  <button className="btn p-0 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="/assets/img/perfil.png" alt="perfil" width="50" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {opMenu.map((m) => (
                      <li key={m.titulo}>
                        <a className="dropdown-item" href={m.accion}>{m.titulo}</a>
                      </li>
                    ))}
                    <li className="border-top mt-2 pt-2">
                      <button className="dropdown-item" onClick={logout}>Cerrar sesión</button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid m-0 p-0">
        <Outlet />
        <LoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          email={email}
          setEmail={setEmail}
          clave={clave}
          setClave={setClave}
          login={login}
          error={error}
          setError={setError}
        />

        <ExpiredModal
          show={showExpiredModal}
          onClose={() => {
            setShowExpiredModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>

      <Footer />
    </div>
  );
}
