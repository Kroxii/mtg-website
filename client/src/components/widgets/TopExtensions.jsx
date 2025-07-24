import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TopExtensions = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <div className="top-extensions">
        <p>Aucune extension trouvée</p>
      </div>
    );
  }

  const displayData = expanded ? data : data.slice(0, 5);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="top-extensions">
      <ul className="extension-list">
        {displayData.map((extension, index) => {
          const percentage = ((extension.count / total) * 100).toFixed(1);
          
          return (
            <li key={extension.set_code} className="extension-item">
              <div className="extension-rank">#{index + 1}</div>
              <div className="extension-details">
                <div className="extension-code">{extension.set_code.toUpperCase()}</div>
                <div className="extension-name" title={extension.set_name}>
                  {extension.set_name}
                </div>
              </div>
              <div className="extension-stats">
                <div className="extension-count">{extension.count}</div>
                <div className="extension-percentage">{percentage}%</div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {data.length > 5 && (
        <button 
          className="expand-button"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Voir toutes ({data.length})
            </>
          )}
        </button>
      )}

      <style jsx>{`
        .top-extensions {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .extension-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
          overflow-y: auto;
          max-height: 300px;
        }
        
        .extension-item {
          display: grid;
          grid-template-columns: 30px 1fr auto;
          gap: 0.75rem;
          padding: 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        .extension-item:hover {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          transform: translateX(4px);
          border-bottom-color: #667eea;
        }
        
        .extension-rank {
          font-weight: 700;
          color: #667eea;
          font-size: 0.9rem;
          text-align: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }
        
        .extension-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        
        .extension-code {
          font-weight: 700;
          color: #374151;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }
        
        .extension-name {
          font-size: 0.75rem;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .extension-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }
        
        .extension-count {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }
        
        .extension-percentage {
          font-size: 0.75rem;
          color: #667eea;
          font-weight: 500;
        }
        
        .expand-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #667eea;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }
        
        .expand-button:hover {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .extension-item:nth-child(1) .extension-rank {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #1a1a1a;
        }
        
        .extension-item:nth-child(2) .extension-rank {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          color: #1a1a1a;
        }
        
        .extension-item:nth-child(3) .extension-rank {
          background: linear-gradient(135deg, #cd7f32, #daa520);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default TopExtensions;
