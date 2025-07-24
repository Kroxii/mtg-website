import { useState } from 'react';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';

const CollectionComparison = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState('totalCards');
  
  if (!data || data.length === 0) {
    return (
      <div className="collection-comparison">
        <div className="no-data">
          <Users size={48} />
          <p>Aucune comparaison disponible</p>
        </div>
      </div>
    );
  }

  const metrics = {
    totalCards: { label: 'Cartes totales', icon: Target },
    uniqueSets: { label: 'Extensions uniques', icon: Trophy },
    estimatedValue: { label: 'Valeur estimée', icon: TrendingUp }
  };

  const formatValue = (value, metric) => {
    if (metric === 'estimatedValue') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    }
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const sortedData = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric]);
  const maxValue = Math.max(...sortedData.map(user => user[selectedMetric]));

  return (
    <div className="collection-comparison">
      <div className="comparison-header">
        <h4>Comparaison des collections</h4>
        <div className="metric-selector">
          {Object.entries(metrics).map(([key, metric]) => {
            const Icon = metric.icon;
            return (
              <button
                key={key}
                className={`metric-button ${selectedMetric === key ? 'active' : ''}`}
                onClick={() => setSelectedMetric(key)}
                title={metric.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="comparison-chart">
        {sortedData.map((user, index) => {
          const percentage = maxValue > 0 ? (user[selectedMetric] / maxValue) * 100 : 0;
          const isCurrentUser = user.isCurrentUser;
          
          return (
            <div key={user.username} className={`comparison-user ${isCurrentUser ? 'current-user' : ''}`}>
              <div className="user-info">
                <div className="user-rank">#{index + 1}</div>
                <div className="user-details">
                  <div className="user-name">
                    {user.username}
                    {isCurrentUser && <span className="you-badge">Vous</span>}
                  </div>
                  <div className="user-value">
                    {formatValue(user[selectedMetric], selectedMetric)}
                  </div>
                </div>
              </div>
              
              <div className="comparison-bar">
                <div 
                  className="comparison-fill"
                  style={{
                    width: `${percentage}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="comparison-stats">
        <div className="stat">
          <span className="stat-label">Participants:</span>
          <span className="stat-value">{data.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Votre rang:</span>
          <span className="stat-value">
            #{sortedData.findIndex(user => user.isCurrentUser) + 1}
          </span>
        </div>
      </div>

      <style jsx>{`
        .collection-comparison {
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
        
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .comparison-header h4 {
          margin: 0;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .metric-selector {
          display: flex;
          gap: 0.25rem;
        }
        
        .metric-button {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }
        
        .metric-button:hover {
          background: #f9fafb;
          border-color: #667eea;
        }
        
        .metric-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: #667eea;
          color: white;
        }
        
        .comparison-chart {
          flex: 1;
          overflow-y: auto;
          max-height: 300px;
        }
        
        .comparison-user {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .comparison-user:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .comparison-user.current-user {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border: 2px solid #667eea;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .user-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        
        .comparison-user:nth-child(1) .user-rank {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1a1a1a;
        }
        
        .comparison-user:nth-child(2) .user-rank {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          color: #1a1a1a;
        }
        
        .comparison-user:nth-child(3) .user-rank {
          background: linear-gradient(135deg, #cd7f32, #daa520);
          color: white;
        }
        
        .user-details {
          flex: 1;
        }
        
        .user-name {
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .you-badge {
          background: #667eea;
          color: white;
          font-size: 0.7rem;
          padding: 0.125rem 0.375rem;
          border-radius: 8px;
          font-weight: 500;
        }
        
        .user-value {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .comparison-bar {
          width: 100%;
          height: 24px;
          background: #e9ecef;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        .comparison-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 12px;
          transition: width 0.3s ease;
          opacity: 0;
          animation: barGrow 0.8s ease-out forwards;
        }
        
        .current-user .comparison-fill {
          background: linear-gradient(90deg, #22c55e, #16a34a);
        }
        
        .comparison-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }
        
        .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }
        
        @keyframes barGrow {
          from {
            opacity: 0;
            width: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CollectionComparison;
