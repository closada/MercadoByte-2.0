// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 🔄 AsyncThunk: Login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:3001/login', credentials);
    return response.data; // { token: "..." }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error al iniciar sesión');
  }
});

// 🔁 Obtener token del localStorage al iniciar
const token = localStorage.getItem('jwt_token');
let decoded = null;
if (token && token.split('.').length === 3) {
  try {
    decoded = jwtDecode(token);
  } catch (error) {
    console.error('Token inválido:', error);
    localStorage.removeItem('jwt_token');
  }
}

// 🔧 Estado inicial
const initialState = {
  token: token || null,
  isAuthenticated: !!token,
  user: decoded?.usuario || null,
  rol: decoded?.rol || null,
  menu: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 🧩 Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('jwt_token');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.rol = null;
      state.menu = [];
      state.status = 'idle';
      state.error = null;
    },
    fetchMenu: (state, action) => {
      state.menu = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token } = action.payload;
        localStorage.setItem('jwt_token', token);
        const decoded = jwtDecode(token);
        state.token = token;
        state.isAuthenticated = true;
        state.user = decoded.usuario;
        state.rol = decoded.rol;
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error al iniciar sesión';
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.rol = null;
      });
  },
});

// 🧪 Actions y Selectores
export const { logout, fetchMenu } = authSlice.actions;

export const selectAuth = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectRol = (state) => state.auth.rol;
export const selectMenu = (state) => state.auth.menu;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
