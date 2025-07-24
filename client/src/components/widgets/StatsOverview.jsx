import { Zap, TrendingUp, Library, Target } from 'lucide-react';

const StatsOverview = ({ data }) => {
  if (!data) {
    return (
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">-</div>
          <div className="stat-label">Cartes totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">-</div>
          <div className="stat-label">Extensions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">-</div>
          <div className="stat-label">Valeur estimée</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">-</div>
          <div className="stat-label">Ajouts ce mois</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon">
          <Library size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{formatNumber(data.totalCards || 0)}</div>
          <div className="stat-label">Cartes totales</div>
        </div>
        <div className="stat-trend positive">
          +{data.monthlyGrowth || 0}
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Target size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{data.uniqueSets || 0}</div>
          <div className="stat-label">Extensions</div>
        </div>
        <div className="stat-trend">
          {data.uniqueSets > 50 ? 'Excellente diversité' : 'Bonne diversité'}
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{formatCurrency(data.estimatedValue || 0)}</div>
          <div className="stat-label">Valeur estimée</div>
        </div>
        <div className="stat-trend positive">
          +{((data.valueGrowth || 0) * 100).toFixed(1)}%
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Zap size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{data.monthlyAdditions || 0}</div>
          <div className="stat-label">Ajouts ce mois</div>
        </div>
        <div className="stat-trend">
          {data.monthlyAdditions > data.avgMonthlyAdditions ? 'Au-dessus moyenne' : 'Normale'}
        </div>
      </div>

      <style jsx>{`
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          height: 100%;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          transition: transform 0.5s ease;
          transform: scale(0);
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(102, 126, 234, 0.4);
        }
        
        .stat-card:hover::before {
          transform: scale(1);
        }
        
        .stat-icon {
          align-self: flex-start;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          backdrop-filter: blur(8px);
        }
        
        .stat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          line-height: 1;
        }
        
        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
          font-weight: 500;
        }
        
        .stat-trend {
          font-size: 0.85rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        
        .stat-trend.positive {
          background: rgba(76, 175, 80, 0.3);
        }
        
        @media (max-width: 768px) {
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stat-number {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsOverview;
