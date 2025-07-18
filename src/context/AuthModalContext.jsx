import { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export function useAuthModals() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  return (
    <AuthModalContext.Provider value={{
      showLoginModal,
      setShowLoginModal,
      showExpiredModal,
      setShowExpiredModal
    }}>
      {children}
    </AuthModalContext.Provider>
  );
}
