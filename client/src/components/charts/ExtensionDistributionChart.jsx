import { useState, useEffect } from 'react';

const ExtensionDistributionChart = ({ data }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const timer = setTimeout(() => {
        setAnimatedData(data.slice(0, 10)); // Limiter aux 10 premières extensions
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>Aucune donnée d'extension disponible</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(item => item.count));

  const getExtensionColor = (index) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <div className="extension-chart">
          {animatedData.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const totalPercentage = ((item.count / total) * 100).toFixed(1);
            
            return (
              <div key={item.set_code} className="extension-item">
                <div className="extension-info">
                  <div className="extension-name" title={item.set_name}>
                    {item.set_code.toUpperCase()}
                  </div>
                  <div className="extension-full-name">
                    {item.set_name}
                  </div>
                </div>
                
                <div className="extension-bar-container">
                  <div 
                    className="extension-bar"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${getExtensionColor(index)}, ${getExtensionColor(index)}aa)`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className="extension-count">{item.count}</span>
                  </div>
                </div>
                
                <div className="extension-percentage">
                  {totalPercentage}%
                </div>
              </div>
            );
          })}
        </div>
        
        {data.length > 10 && (
          <div className="chart-footer">
            +{data.length - 10} autres extensions
          </div>
        )}
      </div>

      <style jsx>{`
        .extension-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
          padding: 1rem;
          overflow-y: auto;
        }
        
        .extension-item {
          display: grid;
          grid-template-columns: 120px 1fr 50px;
          align-items: center;
          gap: 1rem;
          min-height: 40px;
        }
        
        .extension-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .extension-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .extension-full-name {
          font-size: 0.7rem;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        
        .extension-bar-container {
          position: relative;
          height: 28px;
          background: #f3f4f6;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .extension-bar {
          height: 100%;
          border-radius: 14px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          opacity: 0;
          animation: extensionBarGrow 0.8s ease-out forwards;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .extension-bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.05);
        }
        
        .extension-count {
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .extension-percentage {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 600;
          text-align: center;
        }
        
        .chart-footer {
          text-align: center;
          font-size: 0.8rem;
          color: #6b7280;
          font-style: italic;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }
        
        @keyframes extensionBarGrow {
          from {
            opacity: 0;
            width: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ExtensionDistributionChart;
