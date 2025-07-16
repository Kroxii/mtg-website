import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const CardContextMenu = ({ 
  isOpen, 
  position, 
  options, 
  onClose, 
  card 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Ajuster la position si le menu dépasse de l'écran
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Ajuster horizontalement
      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      // Ajuster verticalement
      if (position.y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      menu.style.left = `${Math.max(10, adjustedX)}px`;
      menu.style.top = `${Math.max(10, adjustedY)}px`;
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div className="context-menu-overlay">
      <div 
        ref={menuRef}
        className="context-menu"
        style={{ 
          left: position.x, 
          top: position.y 
        }}
      >
        <div className="context-menu-header">
          <span className="context-menu-title">
            {card?.name || 'Options'}
          </span>
          <button 
            className="context-menu-close"
            onClick={onClose}
            title="Fermer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="context-menu-content">
          {options.map((option, index) => (
            <button
              key={index}
              className="context-menu-option"
              onClick={() => {
                option.action();
                onClose();
              }}
              disabled={option.disabled}
            >
              {option.icon && (
                <span className="context-menu-icon">
                  {option.icon}
                </span>
              )}
              <span className="context-menu-label">
                {option.label}
              </span>
              {option.shortcut && (
                <span className="context-menu-shortcut">
                  {option.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>

        {card && (
          <div className="context-menu-footer">
            <div className="card-mini-info">
              <span className="card-set-info">
                {card.set_name} ({card.set?.toUpperCase()})
              </span>
              {card.rarity && (
                <span className={`card-rarity-mini ${card.rarity}`}>
                  {card.rarity}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardContextMenu;
