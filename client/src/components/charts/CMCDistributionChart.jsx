import { useState, useEffect } from 'react';

const CMCDistributionChart = ({ data }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>Aucune donnée de CMC disponible</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getBarColor = (cmc) => {
    const colors = [
      '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5',
      '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'
    ];
    return colors[Math.min(cmc, colors.length - 1)] || '#0d47a1';
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <div className="cmc-chart">
          <div className="chart-bars">
            {animatedData.map((item, index) => {
              const height = (item.count / maxCount) * 100;
              const percentage = ((item.count / total) * 100).toFixed(1);
              
              return (
                <div key={item.cmc} className="cmc-bar-container">
                  <div className="cmc-count">{item.count}</div>
                  <div 
                    className="cmc-bar"
                    style={{
                      height: `${height}%`,
                      backgroundColor: getBarColor(item.cmc),
                      animationDelay: `${index * 0.05}s`
                    }}
                    title={`CMC ${item.cmc}: ${item.count} cartes (${percentage}%)`}
                  >
                  </div>
                  <div className="cmc-label">{item.cmc >= 7 ? '7+' : item.cmc}</div>
                </div>
              );
            })}
          </div>
          
          <div className="chart-info">
            <div className="total-cards">
              Total: {total} cartes
            </div>
            <div className="average-cmc">
              CMC moyen: {(data.reduce((sum, item) => sum + (item.cmc * item.count), 0) / total).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cmc-chart {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
        
        .chart-bars {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 0.25rem;
          margin-bottom: 1rem;
          min-height: 200px;
        }
        
        .cmc-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 40px;
        }
        
        .cmc-count {
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          min-height: 16px;
        }
        
        .cmc-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          opacity: 0;
          animation: barRise 0.6s ease-out forwards;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          min-height: 4px;
        }
        
        .cmc-bar:hover {
          filter: brightness(1.2);
          transform: scaleX(1.1);
        }
        
        .cmc-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #6b7280;
          margin-top: 4px;
          text-align: center;
        }
        
        .chart-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.9rem;
          color: #374151;
        }
        
        .total-cards,
        .average-cmc {
          font-weight: 500;
        }
        
        @keyframes barRise {
          from {
            opacity: 0;
            height: 0 !important;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CMCDistributionChart;
