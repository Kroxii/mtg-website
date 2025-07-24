import { useState, useEffect } from 'react';

const CollectionGrowthChart = ({ data }) => {
  const [animatedPath, setAnimatedPath] = useState('');
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      const timer1 = setTimeout(() => {
        generatePath();
      }, 300);
      
      const timer2 = setTimeout(() => {
        setShowPoints(true);
      }, 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [data]);

  const generatePath = () => {
    if (!data || data.length === 0) return;

    const width = 400;
    const height = 200;
    const padding = 40;
    
    const maxCount = Math.max(...data.map(item => item.totalCards));
    const minCount = Math.min(...data.map(item => item.totalCards));
    
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((item.totalCards - minCount) / (maxCount - minCount || 1)) * (height - 2 * padding);
      return { x, y, ...item };
    });

    const pathData = points.map((point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
    }).join(' ');

    setAnimatedPath(pathData);
  };

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>Aucune donnée de croissance disponible</p>
      </div>
    );
  }

  const width = 400;
  const height = 200;
  const padding = 40;
  
  const maxCount = Math.max(...data.map(item => item.totalCards));
  const minCount = Math.min(...data.map(item => item.totalCards));
  
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((item.totalCards - minCount) / (maxCount - minCount || 1)) * (height - 2 * padding);
    return { x, y, ...item };
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const yAxisTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const value = minCount + (maxCount - minCount) * (i / tickCount);
    const y = height - padding - (i / tickCount) * (height - 2 * padding);
    yAxisTicks.push({ y, value: Math.round(value) });
  }

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="growth-chart">
          {/* Grille */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Axe Y */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#d1d5db"
            strokeWidth="2"
          />
          
          {/* Axe X */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#d1d5db"
            strokeWidth="2"
          />
          
          {/* Graduations Y */}
          {yAxisTicks.map((tick, index) => (
            <g key={index}>
              <line
                x1={padding - 5}
                y1={tick.y}
                x2={padding}
                y2={tick.y}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {tick.value}
              </text>
            </g>
          ))}
          
          {/* Zone sous la courbe */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#667eea" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {animatedPath && (
            <path
              d={`${animatedPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
              fill="url(#areaGradient)"
              className="growth-area"
            />
          )}
          
          {/* Ligne de croissance */}
          {animatedPath && (
            <path
              d={animatedPath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className="growth-line"
            />
          )}
          
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea"/>
              <stop offset="100%" stopColor="#764ba2"/>
            </linearGradient>
          </defs>
          
          {/* Points de données */}
          {showPoints && points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#fff"
                stroke="#667eea"
                strokeWidth="3"
                className="growth-point"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="rgba(102, 126, 234, 0.1)"
                className="growth-point-hover"
              >
                <title>{formatDate(point.date)}: {point.totalCards} cartes</title>
              </circle>
            </g>
          ))}
          
          {/* Labels des dates */}
          {points.length <= 8 && points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={height - padding + 15}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
              transform={`rotate(-45, ${point.x}, ${height - padding + 15})`}
            >
              {formatDate(point.date)}
            </text>
          ))}
        </svg>
      </div>
      
      <div className="growth-stats">
        <div className="stat">
          <span className="stat-label">Croissance totale:</span>
          <span className="stat-value">+{maxCount - minCount} cartes</span>
        </div>
        <div className="stat">
          <span className="stat-label">Période:</span>
          <span className="stat-value">
            {data.length > 1 ? `${formatDate(data[0].date)} - ${formatDate(data[data.length - 1].date)}` : 'N/A'}
          </span>
        </div>
      </div>

      <style jsx>{`
        .growth-chart {
          width: 100%;
          height: 250px;
        }
        
        .growth-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 2s ease-in-out forwards;
        }
        
        .growth-area {
          opacity: 0;
          animation: fadeInArea 1s ease-in-out 1s forwards;
        }
        
        .growth-point {
          opacity: 0;
          transform: scale(0);
          animation: popIn 0.5s ease-out forwards;
        }
        
        .growth-point-hover {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .growth-point-hover:hover {
          opacity: 1;
        }
        
        .growth-stats {
          display: flex;
          justify-content: space-around;
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
        
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeInArea {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CollectionGrowthChart;
