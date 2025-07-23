import { Link } from 'react-router-dom';
import { Library, FileText, Zap, Plus, Search, TrendingUp } from 'lucide-react';
import ServerStatus from '../components/ServerStatus';

const Home = () => {
  return (
    <div className="home-container">
      {/* Statut du serveur */}
      <ServerStatus />
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <Zap size={48} />
          </div>
          <h1>Magic Collection Manager</h1>
          <p className="hero-description">
            Gérez votre collection Magic: The Gathering et créez vos deck lists en toute simplicité.
            Explorez vos cartes, suivez vos collections et organisez vos decks favoris.
          </p>
          <div className="hero-actions">
            <Link to="/collection" className="btn-primary">
              <Library size={20} />
              Voir ma collection
            </Link>
            <Link to="/decklists" className="btn-secondary">
              <FileText size={20} />
              Mes deck lists
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Library size={32} />
            </div>
            <h3>Gestion de Collection</h3>
            <p>
              Cataloguez toutes vos cartes Magic par extension. 
              Recherchez facilement dans votre collection et gardez le compte de vos cartes.
            </p>
            <Link to="/collection" className="feature-link">
              Gérer ma collection
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FileText size={32} />
            </div>
            <h3>Deck Builder</h3>
            <p>
              Créez et gérez vos deck lists pour différents formats. 
              Validation automatique des règles et des banlists.
            </p>
            <Link to="/decklists" className="feature-link">
              Créer un deck
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Search size={32} />
            </div>
            <h3>Recherche Avancée</h3>
            <p>
              Recherchez des cartes par nom, type, coût, ou tout autre critère. 
              Interface en français avec les données Scryfall.
            </p>
            <div className="feature-link disabled">
              Recherche intégrée
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={32} />
            </div>
            <h3>Suivi des Prix</h3>
            <p>
              Consultez les prix de vos cartes grâce à l'intégration CardMarket. 
              Suivez la valeur de votre collection.
            </p>
            <div className="feature-link disabled">
              Bientôt disponible
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Votre Collection en un Coup d'Œil</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {(() => {
                const saved = localStorage.getItem('mtg-collection');
                if (saved) {
                  const collection = JSON.parse(saved);
                  return Object.values(collection).reduce((sum, quantity) => sum + quantity, 0);
                }
                return 0;
              })()}
            </div>
            <div className="stat-label">Cartes dans la collection</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {(() => {
                const saved = localStorage.getItem('mtg-decks');
                if (saved) {
                  const decks = JSON.parse(saved);
                  return decks.length;
                }
                return 0;
              })()}
            </div>
            <div className="stat-label">Deck lists créées</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {(() => {
                const saved = localStorage.getItem('mtg-collection');
                if (saved) {
                  const collection = JSON.parse(saved);
                  return Object.keys(collection).length;
                }
                return 0;
              })()}
            </div>
            <div className="stat-label">Cartes uniques</div>
          </div>
        </div>
      </div>

      <div className="getting-started">
        <h2>Commencer</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Explorez les Extensions</h3>
              <p>Accédez à votre collection et choisissez une extension Magic pour commencer à ajouter vos cartes.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Ajoutez vos Cartes</h3>
              <p>Parcourez les cartes de l'extension et indiquez combien vous en possédez.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Créez vos Decks</h3>
              <p>Utilisez vos cartes pour créer des deck lists et testez différentes stratégies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
