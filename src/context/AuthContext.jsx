import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsuario,
  getRol,
  estaAutenticado,
  logout as logoutService,
} from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validar token cada vez que cambie
  useEffect(() => {
    if (token && verificarToken(token)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('jwt_token');
    }
    setLoading(false);
  }, [token]);

  function login(jwt) {
    localStorage.setItem('jwt_token', jwt);
    setToken(jwt);
    setIsAuthenticated(true);
  }

  function logout() {
    logoutService(navigate); // Llama a logout de backend
    setToken(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        loading,
        getUsuario,
        getRol,
        estaAutenticado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function verificarToken(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp > ahora;
  } catch {
    return false;
  }
}
