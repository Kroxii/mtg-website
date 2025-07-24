import { useState, useEffect } from 'react';

const ColorDistributionChart = ({ data }) => {
  const [animatedData, setAnimatedData] = useState([]);

  const colors = {
    W: { name: 'Blanc', color: '#FFFBD5', textColor: '#333' },
    U: { name: 'Bleu', color: '#0E68AB', textColor: '#fff' },
    B: { name: 'Noir', color: '#150B00', textColor: '#fff' },
    R: { name: 'Rouge', color: '#D3202A', textColor: '#fff' },
    G: { name: 'Vert', color: '#00733E', textColor: '#fff' },
    C: { name: 'Incolore', color: '#CAC5C0', textColor: '#333' },
    M: { name: 'Multicolore', color: '#F8D248', textColor: '#333' }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      // Animation progressive des données
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>Aucune donnée de couleur disponible</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  const createPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    };

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', centerX, centerY,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
      'Z'
    ].join(' ');
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <svg viewBox="0 0 300 300" className="pie-chart">
          {animatedData.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const angle = (percentage / 100) * 360;
            const path = createPath(150, 150, 100, currentAngle, currentAngle + angle);
            const textAngle = currentAngle + angle / 2;
            const textX = 150 + 70 * Math.cos((textAngle * Math.PI) / 180);
            const textY = 150 + 70 * Math.sin((textAngle * Math.PI) / 180);
            
            currentAngle += angle;
            
            const colorInfo = colors[item.color] || { name: item.color, color: '#ccc', textColor: '#333' };
            
            return (
              <g key={item.color}>
                <path
                  d={path}
                  fill={colorInfo.color}
                  stroke="#fff"
                  strokeWidth="2"
                  className="pie-slice"
                  style={{
                    opacity: 0,
                    animation: `fadeIn 0.6s ease-in-out ${index * 0.1}s forwards`
                  }}
                />
                {percentage > 5 && (
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={colorInfo.textColor}
                    fontSize="12"
                    fontWeight="600"
                    style={{
                      opacity: 0,
                      animation: `fadeIn 0.6s ease-in-out ${index * 0.1 + 0.3}s forwards`
                    }}
                  >
                    {Math.round(percentage)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="chart-legend">
        {data.map((item) => {
          const colorInfo = colors[item.color] || { name: item.color, color: '#ccc' };
          const percentage = ((item.count / total) * 100).toFixed(1);
          
          return (
            <div key={item.color} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: colorInfo.color }}
              ></div>
              <span>{colorInfo.name}: {item.count} ({percentage}%)</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .pie-chart {
          width: 100%;
          height: 100%;
        }
        
        .pie-slice {
          transition: transform 0.3s ease;
          transform-origin: 150px 150px;
        }
        
        .pie-slice:hover {
          transform: scale(1.05);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
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

export default ColorDistributionChart;
