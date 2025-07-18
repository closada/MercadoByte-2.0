import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Verifica token cada vez que cambia
    if (token && verificarToken(token)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('jwt_token');
    }

    setLoading(false); // <-- ya terminó la validación

  }, [token]);

  function login(jwt) {
    localStorage.setItem('jwt_token', jwt);
    setToken(jwt);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setIsAuthenticated(false);
  }

  return (
     <AuthContext.Provider value={{ token, login, logout, isAuthenticated, loading }}>
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
