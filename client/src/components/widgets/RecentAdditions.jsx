import { Clock, Plus } from 'lucide-react';

const RecentAdditions = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="recent-additions">
        <div className="no-data">
          <Clock size={48} />
          <p>Aucun ajout récent</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'common': '#1a1a1a',
      'uncommon': '#c0c0c0', 
      'rare': '#ffd700',
      'mythic': '#ff8c00'
    };
    return colors[rarity?.toLowerCase()] || '#6b7280';
  };

  const getRarityLabel = (rarity) => {
    const labels = {
      'common': 'C',
      'uncommon': 'U',
      'rare': 'R',
      'mythic': 'M'
    };
    return labels[rarity?.toLowerCase()] || '?';
  };

  return (
    <div className="recent-additions">
      <div className="additions-header">
        <h4>Derniers ajouts à votre collection</h4>
      </div>
      
      <ul className="additions-list">
        {data.map((card, index) => (
          <li key={`${card.id}-${index}`} className="addition-item">
            <div className="card-image">
              {card.image_uri ? (
                <img 
                  src={card.image_uri} 
                  alt={card.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="image-placeholder" style={{ display: card.image_uri ? 'none' : 'flex' }}>
                <span>{card.name?.charAt(0) || '?'}</span>
              </div>
            </div>
            
            <div className="card-details">
              <div className="card-name" title={card.name}>
                {card.name}
              </div>
              <div className="card-info">
                <span className="card-set">{card.set_code?.toUpperCase()}</span>
                <span className="card-rarity" style={{ color: getRarityColor(card.rarity) }}>
                  {getRarityLabel(card.rarity)}
                </span>
                {card.mana_cost && (
                  <span className="card-cost">{card.mana_cost}</span>
                )}
              </div>
            </div>
            
            <div className="addition-meta">
              <div className="addition-date">{formatDate(card.added_date)}</div>
              <div className="addition-count">
                <Plus size={12} />
                {card.quantity || 1}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .recent-additions {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          gap: 1rem;
        }
        
        .additions-header h4 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .additions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }
        
        .addition-item {
          display: grid;
          grid-template-columns: 50px 1fr auto;
          gap: 0.75rem;
          padding: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        .addition-item:hover {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          transform: translateX(4px);
          border-bottom-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
        }
        
        .card-image {
          width: 40px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }
        
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        
        .card-name {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .card-info {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          font-size: 0.75rem;
        }
        
        .card-set {
          background: #f3f4f6;
          color: #374151;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .card-rarity {
          font-weight: 700;
          font-size: 0.7rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: currentColor;
          color: white !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .card-cost {
          color: #6b7280;
          font-family: 'Courier New', monospace;
        }
        
        .addition-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }
        
        .addition-date {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: right;
        }
        
        .addition-count {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #22c55e;
          font-weight: 600;
          background: rgba(34, 197, 94, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default RecentAdditions;
