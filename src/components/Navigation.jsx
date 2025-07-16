import { Link, useLocation } from 'react-router-dom';
import { Home, Library, FileText, User, Zap } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const handleLoginClick = () => {
    // Fonctionnalité de connexion à implémenter plus tard
    console.log('Connexion en cours de développement...');
    alert('Fonctionnalité de connexion bientôt disponible !');
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
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
          <li>
            <Link 
              to="/collection" 
              className={`nav-link ${location.pathname === '/collection' ? 'active' : ''}`}
            >
              <Library size={18} />
              Collection
            </Link>
          </li>
          <li>
            <Link 
              to="/decklists" 
              className={`nav-link ${location.pathname === '/decklists' ? 'active' : ''}`}
            >
              <FileText size={18} />
              Deck Lists
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          <button 
            className="btn-login"
            onClick={handleLoginClick}
            title="Se connecter"
          >
            <User size={16} />
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
