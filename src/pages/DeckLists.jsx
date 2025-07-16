import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Grid, List, AlertTriangle } from 'lucide-react';
import CardItem from '../components/CardItem';
import { scryfallApi, isDoubleFacedCard } from '../utils/api';
import { FORMATS, FORMAT_NAMES, validateDeck, isCardBanned } from '../utils/banlists';

const DeckLists = () => {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState(FORMATS.COMMANDER);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [deckValidation, setDeckValidation] = useState(null);
  const [cardFaces, setCardFaces] = useState({}); // Pour stocker les faces des cartes double face
  const [foilCards, setFoilCards] = useState({}); // Pour stocker les cartes foil

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      const validation = validateDeck(selectedDeck, selectedDeck.format || FORMATS.COMMANDER);
      setDeckValidation(validation);
    }
  }, [selectedDeck]);

  const loadDecks = () => {
    const saved = localStorage.getItem('mtg-decks');
    if (saved) {
      setDecks(JSON.parse(saved));
    }
    
    // Charger les états des cartes (faces et foil)
    const savedCardFaces = localStorage.getItem('mtg-card-faces');
    if (savedCardFaces) {
      setCardFaces(JSON.parse(savedCardFaces));
    }
    
    const savedFoilCards = localStorage.getItem('mtg-foil-cards');
    if (savedFoilCards) {
      setFoilCards(JSON.parse(savedFoilCards));
    }
  };

  const saveDecks = (decksData) => {
    localStorage.setItem('mtg-decks', JSON.stringify(decksData));
  };

  const saveCardFaces = (cardFacesData) => {
    localStorage.setItem('mtg-card-faces', JSON.stringify(cardFacesData));
  };

  const saveFoilCards = (foilCardsData) => {
    localStorage.setItem('mtg-foil-cards', JSON.stringify(foilCardsData));
  };

  const createDeck = () => {
    if (newDeckName.trim()) {
      const newDeck = {
        id: Date.now(),
        name: newDeckName,
        format: newDeckFormat,
        cards: {},
        created: new Date().toISOString()
      };
      const updatedDecks = [...decks, newDeck];
      setDecks(updatedDecks);
      saveDecks(updatedDecks);
      setNewDeckName('');
      setNewDeckFormat(FORMATS.COMMANDER);
      setIsCreating(false);
    }
  };

  const deleteDeck = (deckId) => {
    const updatedDecks = decks.filter(deck => deck.id !== deckId);
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    if (selectedDeck && selectedDeck.id === deckId) {
      setSelectedDeck(null);
    }
  };

  const updateDeckName = (deckId, newName) => {
    const updatedDecks = decks.map(deck => 
      deck.id === deckId ? { ...deck, name: newName } : deck
    );
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    setEditingDeck(null);
  };

  const searchCards = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Première tentative en français
      let response;
      try {
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: `${term} lang:fr`
          }
        });
      } catch (frenchError) {
        // Fallback en anglais si pas de résultats en français
        console.log('Recherche en français sans résultat, fallback vers l\'anglais');
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: term
          }
        });
      }
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    }
  };

  const addCardToDeck = (card) => {
    if (!selectedDeck) return;

    // Vérifier si la carte est bannie dans le format du deck
    if (isCardBanned(card.name, selectedDeck.format || FORMATS.COMMANDER)) {
      alert(`⚠️ Cette carte est bannie en ${FORMAT_NAMES[selectedDeck.format || FORMATS.COMMANDER]} !`);
      return;
    }

    const updatedDecks = decks.map(deck => {
      if (deck.id === selectedDeck.id) {
        const updatedCards = { ...deck.cards };
        updatedCards[card.id] = {
          ...card,
          quantity: (updatedCards[card.id]?.quantity || 0) + 1
        };
        return { ...deck, cards: updatedCards };
      }
      return deck;
    });

    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id));
  };

  const updateCardQuantity = (cardId, newQuantity) => {
    if (!selectedDeck) return;

    const updatedDecks = decks.map(deck => {
      if (deck.id === selectedDeck.id) {
        const updatedCards = { ...deck.cards };
        if (newQuantity === 0) {
          delete updatedCards[cardId];
        } else {
          updatedCards[cardId] = { ...updatedCards[cardId], quantity: newQuantity };
        }
        return { ...deck, cards: updatedCards };
      }
      return deck;
    });

    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id));
  };

  const updateCardAppearance = (cardId, newAppearance) => {
    if (!selectedDeck) return;

    const updatedDecks = decks.map(deck => {
      if (deck.id === selectedDeck.id) {
        const updatedCards = { ...deck.cards };
        if (updatedCards[cardId]) {
          updatedCards[cardId] = { 
            ...updatedCards[cardId], 
            ...newAppearance,
            // Conserver la quantité originale
            quantity: updatedCards[cardId].quantity 
          };
        }
        return { ...deck, cards: updatedCards };
      }
      return deck;
    });

    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    setSelectedDeck(updatedDecks.find(d => d.id === selectedDeck.id));
  };

  const toggleCardFace = (cardId) => {
    const updatedCardFaces = { ...cardFaces };
    updatedCardFaces[cardId] = updatedCardFaces[cardId] === 1 ? 0 : 1;
    setCardFaces(updatedCardFaces);
    saveCardFaces(updatedCardFaces);
  };

  const toggleCardFoil = (cardId, isFoil) => {
    const updatedFoilCards = { ...foilCards };
    if (isFoil) {
      updatedFoilCards[cardId] = true;
    } else {
      delete updatedFoilCards[cardId];
    }
    setFoilCards(updatedFoilCards);
    saveFoilCards(updatedFoilCards);
  };

  const removeCardFromDeck = (cardId) => {
    if (!selectedDeck) return;
    
    const updatedDeck = { ...selectedDeck };
    delete updatedDeck.cards[cardId];
    
    const updatedDecks = decks.map(deck => 
      deck.id === selectedDeck.id ? updatedDeck : deck
    );
    
    setDecks(updatedDecks);
    setSelectedDeck(updatedDeck);
    saveDecks(updatedDecks);
  };

  const getTotalCards = (deck) => {
    return Object.values(deck.cards).reduce((sum, card) => sum + card.quantity, 0);
  };

  const openCardMarket = (card) => {
    const cardMarketUrl = `https://www.cardmarket.com/en/Magic/Products/Singles/${card.set_name}/${card.name}`;
    window.open(cardMarketUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="decklists-container">
      <div className="decklists-header">
        <h2>Mes Deck Lists</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="create-deck-btn"
        >
          <Plus size={20} />
          Nouveau Deck
        </button>
      </div>

      {isCreating && (
        <div className="deck-creation">
          <input
            type="text"
            placeholder="Nom du deck"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="deck-name-input"
            onKeyPress={(e) => e.key === 'Enter' && createDeck()}
          />
          <select
            value={newDeckFormat}
            onChange={(e) => setNewDeckFormat(e.target.value)}
            className="deck-format-select"
          >
            {Object.values(FORMATS).map(format => (
              <option key={format} value={format}>
                {FORMAT_NAMES[format]}
              </option>
            ))}
          </select>
          <button onClick={createDeck} className="save-btn">
            <Save size={16} />
          </button>
          <button onClick={() => setIsCreating(false)} className="cancel-btn">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="decklists-content">
        <div className="decks-sidebar">
          <h3>Mes Decks</h3>
          {decks.map(deck => (
            <div 
              key={deck.id} 
              className={`deck-item ${selectedDeck?.id === deck.id ? 'active' : ''}`}
              onClick={() => setSelectedDeck(deck)}
            >
              <div className="deck-info">
                {editingDeck === deck.id ? (
                  <input
                    type="text"
                    defaultValue={deck.name}
                    onBlur={(e) => updateDeckName(deck.id, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                    className="deck-name-edit"
                    autoFocus
                  />
                ) : (
                  <>
                    <h4>{deck.name}</h4>
                    <p>{getTotalCards(deck)} cartes • {FORMAT_NAMES[deck.format] || 'Commander'}</p>
                  </>
                )}
              </div>
              <div className="deck-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDeck(deck.id);
                  }}
                  className="edit-btn"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDeck(deck.id);
                  }}
                  className="delete-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="deck-content">
          {selectedDeck ? (
            <>
              <div className="deck-header">
                <div className="deck-info">
                  <h3>{selectedDeck.name}</h3>
                  <p>{getTotalCards(selectedDeck)} cartes • {FORMAT_NAMES[selectedDeck.format] || 'Commander'}</p>
                </div>
                <div className="deck-controls">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    title="Vue grille"
                  >
                    <Grid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    title="Vue liste"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>

              {deckValidation && (
                <div className="deck-validation">
                  {deckValidation.bannedCards.length > 0 && (
                    <div className="validation-error">
                      <AlertTriangle size={16} />
                      <span>Cartes bannies en {FORMAT_NAMES[selectedDeck.format] || 'Commander'}: {deckValidation.bannedCards.map(card => card.name).join(', ')}</span>
                    </div>
                  )}
                  {deckValidation.warnings.map((warning, index) => (
                    <div key={index} className="validation-warning">
                      <AlertTriangle size={16} />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="card-search">
                <input
                  type="text"
                  placeholder="Rechercher des cartes à ajouter..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchCards(e.target.value);
                  }}
                  className="search-input"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>Résultats de recherche:</h4>
                  <div className="search-cards">
                    {searchResults.slice(0, 10).map(card => (
                      <div key={card.id} className="search-card">
                        <img 
                          src={card.image_uris?.small} 
                          alt={card.printed_name || card.name}
                          className="search-card-image"
                        />
                        <div className="search-card-info">
                          <h5>{card.printed_name || card.name}</h5>
                          <p>{card.set_name}</p>
                        </div>
                        <button 
                          onClick={() => addCardToDeck(card)}
                          className="add-card-btn"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="deck-cards">
                <h4>Cartes du deck:</h4>
                {Object.keys(selectedDeck.cards).length === 0 ? (
                  <p>Aucune carte dans ce deck.</p>
                ) : (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="deck-cards-grid">
                        {Object.values(selectedDeck.cards).map(card => (
                          <CardItem
                            key={card.id}
                            card={card}
                            quantity={card.quantity}
                            onQuantityChange={updateCardQuantity}
                            showAppearanceSelector={false}
                            onAppearanceChange={updateCardAppearance}
                            showContextMenu={true}
                            onToggleFoil={toggleCardFoil}
                            onRemoveCard={removeCardFromDeck}
                            isFoil={foilCards[card.id] || false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="deck-cards-list-view">
                        {Object.values(selectedDeck.cards).map(card => (
                          <div key={card.id} className="deck-card-list-item">
                            <div className="card-list-image">
                              <img 
                                src={card.image_uris?.small || card.image_uris?.normal} 
                                alt={card.printed_name || card.name}
                                className="card-list-thumb"
                              />
                              {isDoubleFacedCard(card) && (
                                <span className="double-face-badge" title="Carte double face">⚡</span>
                              )}
                            </div>
                            <div className="card-list-info">
                              <span className="card-list-name">
                                {card.printed_name || card.name}
                                {isDoubleFacedCard(card) && (
                                  <span className="double-face-indicator" title="Carte double face">⚡</span>
                                )}
                                {foilCards[card.id] && (
                                  <span className="foil-indicator" title="Version foil">✨</span>
                                )}
                                {isCardBanned(card.name, selectedDeck.format || FORMATS.COMMANDER) && (
                                  <span className="banned-indicator" title="Carte bannie">⚠️</span>
                                )}
                              </span>
                              <span className="card-list-set">{card.set_name}</span>
                              <span className="card-list-type">{card.type_line}</span>
                            </div>
                            <div className="card-list-actions">
                              <button 
                                onClick={() => updateCardQuantity(card.id, Math.max(0, card.quantity - 1))}
                                className="quantity-btn-small"
                              >
                                -
                              </button>
                              <span className="quantity-display">{card.quantity}</span>
                              <button 
                                onClick={() => updateCardQuantity(card.id, card.quantity + 1)}
                                className="quantity-btn-small"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="no-deck-selected">
              <p>Sélectionnez un deck pour voir son contenu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckLists;
