import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/backendApi';

// Contexte d'authentification
const AuthContext = createContext();

// Provider d'authentification
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook pour utiliser le contexte d'authentification
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
