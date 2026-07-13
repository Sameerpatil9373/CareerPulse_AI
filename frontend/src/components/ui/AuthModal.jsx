// components/AuthModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const AuthModal = ({ isOpen, onClose, intendedRoute }) => {
  const navigate = useNavigate();
  const location = useLocation(); // The current public page

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleLoginRedirect = () => {
    onClose();
    // Pass the intended route (or the current page) so Login knows where to go back to
    navigate('/login', { state: { from: intendedRoute || location.pathname } });
  };

  const handleSignupRedirect = () => {
    onClose();
    navigate('/signup', { state: { from: intendedRoute || location.pathname } });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            {/* Close (X) button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            <h2
              id="auth-modal-title"
              className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please sign in to upload your resume and access personalized AI career insights.
            </p>
            <div className="flex gap-4">
              <button onClick={handleLoginRedirect} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
                Login
              </button>
              <button onClick={handleSignupRedirect} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                Create Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;