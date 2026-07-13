import { createContext, useContext, useState } from 'react';
import AuthModal from '../components/ui/AuthModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intendedRoute, setIntendedRoute] = useState('');

  const showLoginModal = (route = '') => {
    setIntendedRoute(route);
    setIsModalOpen(true);
  };

  const hideLoginModal = () => {
    setIsModalOpen(false);
    setIntendedRoute('');
  };

  return (
    <AuthContext.Provider value={{ showLoginModal, hideLoginModal }}>
      {children}
      <AuthModal isOpen={isModalOpen} onClose={hideLoginModal} intendedRoute={intendedRoute} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
