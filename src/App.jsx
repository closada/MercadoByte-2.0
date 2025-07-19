import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import { CartProvider } from './context/CartContext';

// modal disponible en  todas partes de la app
import { AuthModalProvider } from './context/AuthModalContext';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      <AuthProvider>
        <AuthModalProvider>
          
            <AppRoutes />
          
        </AuthModalProvider>
      </AuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
