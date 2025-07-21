import { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

const CardDetailsPopup = ({ card, isOpen, onClose }) => {
  const [currentFace, setCurrentFace] = useState(0);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      fetchCardDetails();
    }
  }, [isOpen, card]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchCardDetails = async () => {
    setLoading(true);
    try {
      // Utiliser l'API Scryfall pour récupérer les détails complets
      let response;
      
      // Essayer d'abord avec l'ID Scryfall si disponible
      if (card.id) {
        try {
          response = await fetch(`https://api.scryfall.com/cards/${card.id}`);
          if (!response.ok) throw new Error('ID non trouvé');
        } catch (error) {
          // Si l'ID ne fonctionne pas, essayer avec le nom
          response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`);
        }
      } else {
        // Fallback sur le nom de la carte
        response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setCardData(data);
      } else {
        throw new Error('Carte non trouvée');
      }
      setCurrentFace(0);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      setCardData(card); // Fallback sur les données existantes
    } finally {
      setLoading(false);
    }
  };

  const parseManaSymbols = (manaCost) => {
    if (!manaCost) return [];
    
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];
    return symbols.map((symbol, index) => {
      const clean = symbol.replace(/[{}]/g, '');
      let className = 'mana-symbol ';
      
      if (clean === 'W') className += 'white';
      else if (clean === 'U') className += 'blue';
      else if (clean === 'B') className += 'black';
      else if (clean === 'R') className += 'red';
      else if (clean === 'G') className += 'green';
      else if (clean === 'C') className += 'colorless';
      else if (/^\d+$/.test(clean)) className += 'generic';
      else className += 'generic';
      
      return (
        <span key={index} className={className}>
          {clean}
        </span>
      );
    });
  };

  const getFormatLegality = (legalities) => {
    if (!legalities) return [];
    
    const formatOrder = [
      'standard',
      'pioneer',
      'modern',
      'legacy',
      'vintage',
      'commander',
      'pauper',
      'historic',
      'alchemy',
      'explorer',
      'brawl'
    ];

    const formatNames = {
      'standard': 'Standard',
      'pioneer': 'Pioneer',
      'modern': 'Moderne',
      'legacy': 'Legacy',
      'vintage': 'Vintage',
      'commander': 'Commander',
      'pauper': 'Pauper',
      'historic': 'Historic',
      'alchemy': 'Alchemy',
      'explorer': 'Explorer',
      'brawl': 'Brawl'
    };
    
    return formatOrder
      .filter(format => legalities[format])
      .map(format => ({
        name: formatNames[format] || format,
        status: legalities[format]
      }));
  };

  const getCurrentCardData = () => {
    if (!cardData) return null;
    
    if (cardData.card_faces && cardData.card_faces.length > 1) {
      return cardData.card_faces[currentFace];
    }
    
    return cardData;
  };

  const getCurrentImage = () => {
    const current = getCurrentCardData();
    if (current?.image_uris?.normal) {
      return current.image_uris.normal;
    }
    
    if (cardData?.image_uris?.normal) {
      return cardData.image_uris.normal;
    }
    
    return card?.image_uris?.normal || '';
  };

  if (!isOpen) return null;

  const currentCard = getCurrentCardData();
  const hasMultipleFaces = cardData?.card_faces && cardData.card_faces.length > 1;
  const formats = getFormatLegality(cardData?.legalities);

  return (
    <div className="card-details-overlay" onClick={onClose}>
      <div className="card-details-popup" onClick={(e) => e.stopPropagation()}>
        <div className="card-details-header">
          <h2 className="card-details-title">
            {currentCard?.name || card?.name || 'Détails de la carte'}
          </h2>
          <button className="card-details-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Chargement des détails...</p>
          </div>
        ) : (
          <div className="card-details-content">
            <div className="card-details-image-section">
              <img 
                src={getCurrentImage()} 
                alt={currentCard?.name || card?.name}
                className="card-details-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              
              {hasMultipleFaces && (
                <div className="card-flip-controls">
                  {cardData.card_faces.map((face, index) => (
                    <button
                      key={index}
                      className={`flip-face-btn ${currentFace === index ? 'active' : ''}`}
                      onClick={() => setCurrentFace(index)}
                    >
                      {face.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card-details-info">
              <div className="card-basic-info">
                <h3 className="card-name-display">
                  {currentCard?.name || card?.name}
                </h3>
                
                {currentCard?.mana_cost && (
                  <div className="card-mana-cost-display">
                    <strong>Coût :</strong>
                    {parseManaSymbols(currentCard.mana_cost)}
                  </div>
                )}
                
                <p className="card-type-display">
                  {currentCard?.type_line || card?.type_line}
                </p>
                
                {(currentCard?.power || currentCard?.toughness) && (
                  <div className="card-power-toughness">
                    {currentCard.power}/{currentCard.toughness}
                  </div>
                )}
              </div>

              {currentCard?.oracle_text && (
                <div className="card-text-section">
                  <h3>Effet</h3>
                  <p className="card-oracle-text">
                    {currentCard.oracle_text}
                  </p>
                </div>
              )}

              {formats.length > 0 && (
                <div className="card-formats-section">
                  <h3>Légalité par format</h3>
                  <div className="formats-grid">
                    {formats.map((format) => (
                      <div key={format.name} className="format-item">
                        <span className="format-name">{format.name}</span>
                        <span className={`format-status ${format.status.replace('_', '-')}`}>
                          {format.status === 'legal' ? 'Légal' :
                           format.status === 'not_legal' ? 'Interdit' :
                           format.status === 'banned' ? 'Banni' :
                           format.status === 'restricted' ? 'Restreint' :
                           format.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card-set-info-display">
                <h3>Informations d'extension</h3>
                <div className="set-info-grid">
                  <div className="set-info-item">
                    <span className="set-info-label">Extension</span>
                    <span className="set-info-value">
                      {cardData?.set_name || card?.set_name}
                    </span>
                  </div>
                  
                  <div className="set-info-item">
                    <span className="set-info-label">Code</span>
                    <span className="set-info-value">
                      {(cardData?.set || card?.set)?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="set-info-item">
                    <span className="set-info-label">Rareté</span>
                    <span className={`set-info-value rarity-display ${cardData?.rarity || card?.rarity}`}>
                      {cardData?.rarity || card?.rarity}
                    </span>
                  </div>
                  
                  {(cardData?.collector_number || card?.collector_number) && (
                    <div className="set-info-item">
                      <span className="set-info-label">Numéro</span>
                      <span className="set-info-value">
                        {cardData?.collector_number || card?.collector_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetailsPopup;
