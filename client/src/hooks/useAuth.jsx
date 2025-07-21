import { useState, useEffect, createContext, useContext } from 'react';

// Contexte d'authentification
const AuthContext = createContext();

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('mtg_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        localStorage.removeItem('mtg_user');
      }
    }

    // Créer un utilisateur de test s'il n'y en a pas
    const users = JSON.parse(localStorage.getItem('mtg_users') || '[]');
    if (users.length === 0) {
      const testUser = {
        id: '1',
        email: 'test@mtg.com',
        password: 'test123',
        nom: 'Testeur',
        prenom: 'Magic',
        dateCreation: new Date().toISOString(),
        collection: [],
        deckLists: []
      };
      users.push(testUser);
      localStorage.setItem('mtg_users', JSON.stringify(users));
      console.log('Utilisateur de test créé: test@mtg.com / test123');
    }

    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      // Validation des entrées
      if (!email || !password) {
        throw new Error('Email et mot de passe sont obligatoires');
      }

      // Récupérer les utilisateurs stockés
      const users = JSON.parse(localStorage.getItem('mtg_users') || '[]');
      
      // Vérifier les identifiants
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Connexion réussie
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('mtg_user', JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: error.message };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const { email, password, nom, prenom } = userData;

      // Validation des données
      if (!email || !password || !nom || !prenom) {
        throw new Error('Tous les champs sont obligatoires');
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Adresse email invalide');
      }

      // Récupérer les utilisateurs existants
      const users = JSON.parse(localStorage.getItem('mtg_users') || '[]');
      
      // Vérifier si l'email existe déjà
      if (users.find(u => u.email === email)) {
        throw new Error('Un compte avec cette adresse email existe déjà');
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // En production, il faudrait hasher le mot de passe
        nom,
        prenom,
        dateCreation: new Date().toISOString(),
        collection: [],
        deckLists: []
      };

      // Sauvegarder le nouvel utilisateur
      users.push(newUser);
      localStorage.setItem('mtg_users', JSON.stringify(users));

      // Connecter automatiquement l'utilisateur
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('mtg_user', JSON.stringify(userWithoutPassword));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mtg_user');
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
};
