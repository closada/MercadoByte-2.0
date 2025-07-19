// src/redux/slices/cartSlice.jsx
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  carrito: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    agregarAlCarrito: (state, action) => {
      state.carrito.push(action.payload);
    },
    vaciarCarrito: (state) => {
      state.carrito = [];
    },
    setCarrito: (state, action) => {
      state.carrito = action.payload;
    },
  },
});

export const { agregarAlCarrito, vaciarCarrito, setCarrito } = cartSlice.actions;

// SELECTOR
export const selectCart = (state) => state.cart.carrito;

export default cartSlice.reducer;
