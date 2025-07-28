import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Home, Library, User, LogOut, Zap, BarChart3 } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="nav-title">
          <Zap size={24} />
          Magic Collection Manager
        </Link>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={18} />
              Accueil
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                  <BarChart3 size={18} />
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link 
                  to="/collection" 
                  className={`nav-link ${location.pathname === '/collection' ? 'active' : ''}`}
                >
                  <Library size={18} />
                  Collection
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link 
                to="/profile" 
                className={`btn-profile ${location.pathname === '/profile' ? 'active' : ''}`}
                title="Mon profil"
              >
                <User size={16} />
                {user?.prenom || 'Profil'}
              </Link>
              <button 
                className="btn-logout"
                onClick={handleLogout}
                title="Se déconnecter"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="btn-login"
              title="Se connecter"
            >
              <User size={16} />
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
