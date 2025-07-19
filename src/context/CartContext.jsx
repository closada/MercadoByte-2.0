import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const local = localStorage.getItem('carrito');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito(prev => {
      const existente = prev.find(p => p.id_publicacion === producto.id_publicacion);
      if (existente) {
        return prev.map(p =>
          p.id_publicacion === producto.id_publicacion
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      } else {
        return [...prev, { ...producto, cantidad }];
      }
    });
  };

  const quitarDelCarrito = (id_publicacion) => {
    setCarrito(prev => prev.filter(p => p.id_publicacion !== id_publicacion));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito }}>
      {children}
    </CartContext.Provider>
  );
}
