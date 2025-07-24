import { useState, useEffect } from 'react';

const TypeDistributionChart = ({ data }) => {
  const [animatedData, setAnimatedData] = useState([]);

  const typeColors = {
    'Créature': '#4CAF50',
    'Rituel': '#2196F3',
    'Éphémère': '#FF9800',
    'Artefact': '#9E9E9E',
    'Enchantement': '#9C27B0',
    'Planeswalker': '#F44336',
    'Terrain': '#795548',
    'Tribal': '#607D8B'
  };

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
        <p>Aucune donnée de type disponible</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <div className="bar-chart">
          {animatedData.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const color = typeColors[item.type] || '#6366f1';
            
            return (
              <div key={item.type} className="bar-item">
                <div className="bar-label">{item.type}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
                <div className="bar-percentage">
                  {((item.count / total) * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
          padding: 1rem;
        }
        
        .bar-item {
          display: grid;
          grid-template-columns: 80px 1fr 50px;
          align-items: center;
          gap: 0.75rem;
        }
        
        .bar-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          text-align: right;
        }
        
        .bar-container {
          position: relative;
          height: 24px;
          background: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 12px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          opacity: 0;
          animation: barGrow 0.8s ease-out forwards;
          transition: all 0.3s ease;
        }
        
        .bar-fill:hover {
          filter: brightness(1.1);
          transform: scaleY(1.1);
        }
        
        .bar-value {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .bar-percentage {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          text-align: center;
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

export default TypeDistributionChart;
