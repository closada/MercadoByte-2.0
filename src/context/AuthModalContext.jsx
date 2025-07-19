import { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const handleExpiredSession = () => {
    setShowExpiredModal(true);
  };

  const closeExpiredAndOpenLogin = () => {
    setShowExpiredModal(false);
    setShowLoginModal(true);
  };

  return (
    <AuthModalContext.Provider
      value={{
        showLoginModal,
        setShowLoginModal,
        showExpiredModal,
        setShowExpiredModal,
        handleExpiredSession,
        closeExpiredAndOpenLogin,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModals() {
  return useContext(AuthModalContext);
}
