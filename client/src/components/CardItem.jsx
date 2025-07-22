import { useState, useRef } from 'react';
import { Minus, Plus, Eye, EyeOff, Sparkles, MoreVertical, Info } from 'lucide-react';
import CardContextMenu from './CardContextMenu';
import CardDetailsPopup from './CardDetailsPopup';
import { isDoubleFacedCard, getCardFaceImage, getCardDisplayName, getCardDisplayType, getCardMarketUrl } from '../utils/api';

const CardItem = ({ 
  card, 
  quantity = 0, 
  onQuantityChange, 
  showAddButton = true,
  isDeckCard = false,
  onToggleFace,
  currentFace = 0,
  isFoil = false,
  onToggleFoil 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const cardName = getCardDisplayName(card);
  const cardType = getCardDisplayType(card);
  const isDoubleFaced = isDoubleFacedCard(card);
  const cardImage = getCardFaceImage(card, currentFace);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0) {
      onQuantityChange(card.id, newQuantity);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  const handleToggleFace = () => {
    if (onToggleFace && isDoubleFaced) {
      onToggleFace(card.id);
    }
  };

  const handleToggleFoil = () => {
    if (onToggleFoil) {
      onToggleFoil(card.id);
    }
  };

  const handleViewOnCardMarket = () => {
    const url = getCardMarketUrl(card);
    window.open(url, '_blank');
    handleCloseContextMenu();
  };

  const handleShowDetails = () => {
    setShowDetailsPopup(true);
    handleCloseContextMenu();
  };

  const contextMenuOptions = [
    {
      label: 'Voir les détails',
      action: handleShowDetails,
      icon: <Info size={16} />
    },
    {
      label: 'Voir sur CardMarket',
      action: handleViewOnCardMarket,
      icon: '🔗'
    }
  ];

  if (isDoubleFaced) {
    contextMenuOptions.push({
      label: currentFace === 0 ? 'Voir face B' : 'Voir face A',
      action: handleToggleFace,
      icon: currentFace === 0 ? '🔄' : '↩️'
    });
  }

  if (onToggleFoil) {
    contextMenuOptions.push({
      label: isFoil ? 'Version normale' : 'Version foil',
      action: handleToggleFoil,
      icon: isFoil ? '✨' : '⭐'
    });
  }

  return (
    <>
      <div 
        ref={cardRef}
        className={`card-item ${isFoil ? 'foil' : ''} ${quantity > 0 ? 'in-collection' : ''}`}
        onContextMenu={handleContextMenu}
      >
        <div className="card-image-container">
          {!imageLoaded && !imageError && (
            <div className="card-image-placeholder">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="card-image-error">
              <span>Image non disponible</span>
            </div>
          ) : (
            <img
              src={cardImage}
              alt={cardName}
              className="card-image"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}

          {/* Indicateurs visuels */}
          {isDoubleFaced && (
            <button 
              className="card-indicator double-face clickable" 
              title="Retourner la carte (clic)"
              onClick={handleToggleFace}
            >
              🔄
            </button>
          )}

          {isFoil && (
            <div className="card-indicator foil-indicator" title="Version foil">
              <Sparkles size={14} />
            </div>
          )}

          {quantity > 0 && (
            <div className="quantity-badge" title={`Quantité: ${quantity}`}>
              {quantity}
            </div>
          )}

          {/* Menu contextuel trigger */}
          <button 
            className="context-menu-trigger"
            onClick={handleContextMenu}
            title="Plus d'options"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="card-info">
          <h3 className="card-name" title={cardName}>
            {cardName}
          </h3>
          
          <p className="card-type" title={cardType}>
            {cardType}
          </p>

          {card.mana_cost && (
            <div className="card-mana-cost">
              <span className="mana-cost-text">{card.mana_cost}</span>
            </div>
          )}

          <div className="card-details">
            <span className="card-set" title={`Extension: ${card.set_name}`}>
              {card.set_name} ({card.set.toUpperCase()})
            </span>
            
            {card.rarity && (
              <span className={`card-rarity ${card.rarity}`} title={`Rareté: ${card.rarity}`}>
                {card.rarity}
              </span>
            )}
          </div>

          {/* Contrôles de quantité */}
          {showAddButton && (
            <div className="quantity-controls">
              <button
                className="quantity-btn decrease"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity === 0}
                title="Diminuer la quantité"
              >
                <Minus size={16} />
              </button>
              
              <span className="quantity-display">
                {quantity}
              </span>
              
              <button
                className="quantity-btn increase"
                onClick={() => handleQuantityChange(quantity + 1)}
                title="Augmenter la quantité"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {/* Actions spéciales pour les cartes double face */}
          {isDoubleFaced && onToggleFace && (
            <div className="card-actions">
              <button
                className="action-btn toggle-face"
                onClick={handleToggleFace}
                title={currentFace === 0 ? 'Voir la face B' : 'Voir la face A'}
              >
                {currentFace === 0 ? <Eye size={16} /> : <EyeOff size={16} />}
                Face {currentFace === 0 ? 'B' : 'A'}
              </button>
            </div>
          )}

          {/* Toggle foil pour les deck lists */}
          {isDeckCard && onToggleFoil && (
            <div className="card-actions">
              <button
                className={`action-btn toggle-foil ${isFoil ? 'active' : ''}`}
                onClick={handleToggleFoil}
                title={isFoil ? 'Version normale' : 'Version foil'}
              >
                <Sparkles size={16} />
                {isFoil ? 'Foil' : 'Normal'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu contextuel */}
      {showContextMenu && (
        <CardContextMenu
          isOpen={showContextMenu}
          position={contextMenuPosition}
          options={contextMenuOptions}
          onClose={handleCloseContextMenu}
          card={card}
        />
      )}

      {/* Popup de détails */}
      {showDetailsPopup && (
        <CardDetailsPopup
          card={card}
          isOpen={showDetailsPopup}
          onClose={() => setShowDetailsPopup(false)}
        />
      )}
    </>
  );
};

export default CardItem;
