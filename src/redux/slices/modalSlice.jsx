// src/redux/slices/modalSlice.jsx
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showLoginModal: false,
  showExpiredModal: false,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setShowLoginModal: (state, action) => {
      state.showLoginModal = action.payload;
    },
    setShowExpiredModal: (state, action) => {
      state.showExpiredModal = action.payload;
    },
  },
});

export const { setShowLoginModal, setShowExpiredModal } = modalSlice.actions;

// SELECTORES
export const selectModals = (state) => state.modal;

export default modalSlice.reducer;
