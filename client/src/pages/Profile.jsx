import { useAuth } from '../hooks/useAuth.jsx';
import { User, Calendar, Mail, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h1>Profil non disponible</h1>
          <p>Vous devez être connecté pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1>{user.prenom} {user.nom}</h1>
            <p className="profile-email">
              <Mail size={16} />
              {user.email}
            </p>
          </div>
        </div>

        <div className="profile-details">
          <h2>Informations du compte</h2>
          
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Membre depuis</span>
                <span className="stat-value">{formatDate(user.dateCreation)}</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <User size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Cartes dans la collection</span>
                <span className="stat-value">{user.collection ? user.collection.length : 0}</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <User size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Deck lists créées</span>
                <span className="stat-value">{user.deckLists ? user.deckLists.length : 0}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button 
              onClick={handleLogout}
              className="btn-logout"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
