import { useState, useRef } from 'react';
import { Move } from 'lucide-react';

const DraggableWidget = ({ widget, onPositionChange, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const container = widgetRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Limiter le déplacement dans les limites du conteneur
    const maxX = containerRect.width - widgetRef.current.offsetWidth;
    const maxY = containerRect.height - widgetRef.current.offsetHeight;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    widgetRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Calculer la nouvelle position en grille
    const container = widgetRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const widgetRect = widgetRef.current.getBoundingClientRect();
    
    const gridCols = Math.floor(containerRect.width / 300); // Approximation basée sur la largeur minimale
    const cellWidth = containerRect.width / gridCols;
    const cellHeight = 200; // Hauteur approximative d'une cellule
    
    const newGridX = Math.round((widgetRect.left - containerRect.left) / cellWidth);
    const newGridY = Math.round((widgetRect.top - containerRect.top) / cellHeight);
    
    onPositionChange(widget.id, { x: newGridX, y: newGridY });
    
    // Réinitialiser la transformation
    widgetRef.current.style.transform = '';
  };

  // Ajouter les écouteurs d'événements globaux pour le déplacement et le relâchement
  useState(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={widgetRef}
      className={`widget size-${widget.size} ${isDragging ? 'dragging' : ''}`}
      style={{
        gridColumn: `${widget.position.x + 1} / span ${widget.size === 'large' ? 2 : 1}`,
        gridRow: `${widget.position.y + 1}`,
        position: isDragging ? 'absolute' : 'relative',
        zIndex: isDragging ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="widget-drag-handle">
        <Move size={16} style={{ opacity: 0.5, float: 'right', cursor: 'move' }} />
      </div>
      {children}
    </div>
  );
};

export default DraggableWidget;
