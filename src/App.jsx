// src/App.js
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

// modal disponible en  todas partes de la app
import { AuthModalProvider } from './context/AuthModalContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <AppRoutes />
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
