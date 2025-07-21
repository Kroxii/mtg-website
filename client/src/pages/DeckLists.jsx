import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Grid, List, AlertTriangle, ChevronDown } from 'lucide-react';
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
  const [commanderSearchTerm, setCommanderSearchTerm] = useState('');
  const [commanderSearchResults, setCommanderSearchResults] = useState([]);
  const [selectedCommander, setSelectedCommander] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'stack'
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
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

  // Fermer le menu déroulant quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isViewMenuOpen && !event.target.closest('.view-mode-selector')) {
        setIsViewMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isViewMenuOpen]);

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
        commander: selectedCommander || null,
        created: new Date().toISOString()
      };
      const updatedDecks = [...decks, newDeck];
      setDecks(updatedDecks);
      saveDecks(updatedDecks);
      setNewDeckName('');
      setNewDeckFormat(FORMATS.COMMANDER);
      setSelectedCommander(null);
      setCommanderSearchTerm('');
      setCommanderSearchResults([]);
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

  const searchCommanders = async (term) => {
    if (!term.trim()) {
      setCommanderSearchResults([]);
      return;
    }

    try {
      // Rechercher des créatures légendaires ou des planeswalkers pouvant être commandants
      let response;
      try {
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: `${term} (type:legendary type:creature) OR (type:planeswalker o:"can be your commander") lang:fr`
          }
        });
      } catch (frenchError) {
        // Fallback en anglais
        console.log('Recherche de commandants en français sans résultat, fallback vers l\'anglais');
        response = await scryfallApi.get(`/cards/search`, {
          params: {
            q: `${term} (type:legendary type:creature) OR (type:planeswalker o:"can be your commander")`
          }
        });
      }
      setCommanderSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche de commandants:', error);
      setCommanderSearchResults([]);
    }
  };

  const selectCommander = (commander) => {
    setSelectedCommander(commander);
    setCommanderSearchTerm('');
    setCommanderSearchResults([]);
  };

  const removeCommander = (deckId) => {
    const updatedDecks = decks.map(deck => 
      deck.id === deckId ? { ...deck, commander: null } : deck
    );
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    if (selectedDeck && selectedDeck.id === deckId) {
      setSelectedDeck({ ...selectedDeck, commander: null });
    }
  };

  const setCommanderForDeck = (deckId, commander) => {
    const updatedDecks = decks.map(deck => 
      deck.id === deckId ? { ...deck, commander: commander } : deck
    );
    setDecks(updatedDecks);
    saveDecks(updatedDecks);
    if (selectedDeck && selectedDeck.id === deckId) {
      setSelectedDeck({ ...selectedDeck, commander: commander });
    }
  };

  const setCardAsCommander = (card) => {
    if (!selectedDeck) return;

    // Vérifier si la carte peut être un commandant
    const isLegendaryCreature = card.type_line && card.type_line.includes('Legendary') && card.type_line.includes('Creature');
    const canBeCommander = card.oracle_text && card.oracle_text.includes('can be your commander');
    
    if (!isLegendaryCreature && !canBeCommander) {
      alert('⚠️ Cette carte ne peut pas être un commandant ! Seules les créatures légendaires ou les cartes avec "can be your commander" peuvent être commandants.');
      return;
    }

    setCommanderForDeck(selectedDeck.id, card);
    alert(`✅ ${card.printed_name || card.name} a été défini comme commandant !`);
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

  const viewModeOptions = [
    { value: 'grid', label: 'Visual Grid', icon: Grid },
    { value: 'list', label: 'Text', icon: List }
  ];

  const getCurrentViewModeLabel = () => {
    return viewModeOptions.find(option => option.value === viewMode)?.label || 'Visual Grid';
  };

  const organizeCardsByType = (cards) => {
    const organized = {
      'Créatures': [],
      'Planeswalkers': [],
      'Artefacts': [],
      'Enchantements': [],
      'Éphémères': [],
      'Rituels': [],
      'Terrains': [],
      'Autres': []
    };

    Object.values(cards).forEach(card => {
      const typeLine = card.type_line || '';
      
      if (typeLine.includes('Creature')) {
        organized['Créatures'].push(card);
      } else if (typeLine.includes('Planeswalker')) {
        organized['Planeswalkers'].push(card);
      } else if (typeLine.includes('Artifact')) {
        organized['Artefacts'].push(card);
      } else if (typeLine.includes('Enchantment')) {
        organized['Enchantements'].push(card);
      } else if (typeLine.includes('Instant')) {
        organized['Éphémères'].push(card);
      } else if (typeLine.includes('Sorcery')) {
        organized['Rituels'].push(card);
      } else if (typeLine.includes('Land')) {
        organized['Terrains'].push(card);
      } else {
        organized['Autres'].push(card);
      }
    });

    // Trier chaque section par nom
    Object.keys(organized).forEach(key => {
      organized[key].sort((a, b) => {
        const nameA = a.printed_name || a.name;
        const nameB = b.printed_name || b.name;
        return nameA.localeCompare(nameB, 'fr');
      });
    });

    return organized;
  };

  const getCardTypeCount = (cards) => {
    return Object.values(cards).reduce((sum, card) => sum + card.quantity, 0);
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
          <div className="deck-creation-form">
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
            
            {/* Section commandant pour format Commander */}
            {newDeckFormat === FORMATS.COMMANDER && (
              <div className="commander-selection">
                <h4>Sélectionner un commandant (optionnel):</h4>
                {selectedCommander ? (
                  <div className="selected-commander">
                    <img 
                      src={selectedCommander.image_uris?.small}
                      alt={selectedCommander.printed_name || selectedCommander.name}
                      className="selected-commander-image"
                    />
                    <div className="selected-commander-info">
                      <span>{selectedCommander.printed_name || selectedCommander.name}</span>
                      <small>{selectedCommander.set_name}</small>
                    </div>
                    <button 
                      onClick={() => setSelectedCommander(null)}
                      className="remove-selected-commander"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Rechercher un commandant..."
                      value={commanderSearchTerm}
                      onChange={(e) => {
                        setCommanderSearchTerm(e.target.value);
                        searchCommanders(e.target.value);
                      }}
                      className="commander-search-input"
                    />
                    {commanderSearchResults.length > 0 && (
                      <div className="commander-search-results">
                        {commanderSearchResults.slice(0, 5).map(commander => (
                          <div 
                            key={commander.id} 
                            className="commander-search-item"
                            onClick={() => selectCommander(commander)}
                          >
                            <img 
                              src={commander.image_uris?.small}
                              alt={commander.printed_name || commander.name}
                              className="commander-search-image"
                            />
                            <div className="commander-search-info">
                              <span>{commander.printed_name || commander.name}</span>
                              <small>{commander.set_name}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="deck-creation-actions">
              <button onClick={createDeck} className="save-btn">
                <Save size={16} />
                Créer
              </button>
              <button onClick={() => {
                setIsCreating(false);
                setSelectedCommander(null);
                setCommanderSearchTerm('');
                setCommanderSearchResults([]);
              }} className="cancel-btn">
                <X size={16} />
                Annuler
              </button>
            </div>
          </div>
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
                  <div className="view-mode-selector">
                    <button 
                      className="view-mode-dropdown"
                      onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                    >
                      <span>{getCurrentViewModeLabel()}</span>
                      <ChevronDown size={16} className={`chevron ${isViewMenuOpen ? 'open' : ''}`} />
                    </button>
                    {isViewMenuOpen && (
                      <div className="view-mode-menu">
                        {viewModeOptions.map(option => {
                          const IconComponent = option.icon;
                          return (
                            <button
                              key={option.value}
                              className={`view-mode-option ${viewMode === option.value ? 'active' : ''}`}
                              onClick={() => {
                                setViewMode(option.value);
                                setIsViewMenuOpen(false);
                              }}
                            >
                              <IconComponent size={16} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                    {searchResults.slice(0, 10).map(card => {
                      const isLegendaryCreature = card.type_line && card.type_line.includes('Legendary') && card.type_line.includes('Creature');
                      const canBeCommander = card.oracle_text && card.oracle_text.includes('can be your commander');
                      const isCommanderEligible = isLegendaryCreature || canBeCommander;
                      const isCommanderFormat = selectedDeck && selectedDeck.format === FORMATS.COMMANDER;
                      
                      return (
                        <div key={card.id} className="search-card">
                          <img 
                            src={card.image_uris?.small} 
                            alt={card.printed_name || card.name}
                            className="search-card-image"
                          />
                          <div className="search-card-info">
                            <h5>{card.printed_name || card.name}</h5>
                            <p>{card.set_name}</p>
                            {isCommanderEligible && (
                              <span className="commander-eligible">⭐ Peut être commandant</span>
                            )}
                          </div>
                          <div className="search-card-actions">
                            <button 
                              onClick={() => addCardToDeck(card)}
                              className="add-card-btn"
                              title="Ajouter au deck"
                            >
                              <Plus size={16} />
                            </button>
                            {isCommanderFormat && isCommanderEligible && (
                              <button 
                                onClick={() => setCardAsCommander(card)}
                                className="set-commander-btn"
                                title="Définir comme commandant"
                              >
                                ⭐
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section Commandant pour les decks Commander */}
              {selectedDeck.format === FORMATS.COMMANDER && (
                <div className="commander-section">
                  <h4>Commandant:</h4>
                  {selectedDeck.commander ? (
                    <div className="commander-display">
                      {viewMode === 'grid' ? (
                        <div className="commander-card">
                          <img 
                            src={selectedDeck.commander.image_uris?.normal || selectedDeck.commander.image_uris?.large}
                            alt={selectedDeck.commander.printed_name || selectedDeck.commander.name}
                            className="commander-image"
                          />
                          <button 
                            onClick={() => removeCommander(selectedDeck.id)}
                            className="remove-commander-btn"
                            title="Retirer le commandant"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="card-text-item commander-text-item">
                          <div className="card-text-image">
                            <img 
                              src={selectedDeck.commander.image_uris?.small || selectedDeck.commander.image_uris?.normal} 
                              alt={selectedDeck.commander.printed_name || selectedDeck.commander.name}
                              className="card-text-thumb"
                            />
                            {isDoubleFacedCard(selectedDeck.commander) && (
                              <span className="double-face-badge" title="Carte double face">⚡</span>
                            )}
                          </div>
                          <div className="card-text-info">
                            <span className="card-text-name commander-text-name">
                              {selectedDeck.commander.printed_name || selectedDeck.commander.name}
                              {isDoubleFacedCard(selectedDeck.commander) && (
                                <span className="double-face-indicator" title="Carte double face">⚡</span>
                              )}
                            </span>
                          </div>
                          <div className="card-text-actions">
                            <button 
                              onClick={() => removeCommander(selectedDeck.id)}
                              className="remove-card-text-btn"
                              title="Retirer le commandant"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-commander">
                      <p>Aucun commandant sélectionné. Recherchez une créature légendaire et utilisez le bouton ⭐ pour la définir comme commandant.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="deck-cards">
                <h4>Cartes du deck:</h4>
                {Object.keys(selectedDeck.cards).length === 0 ? (
                  <p>Aucune carte dans ce deck.</p>
                ) : (
                  <>
                    {(() => {
                      const organizedCards = organizeCardsByType(selectedDeck.cards);
                      
                      return Object.entries(organizedCards).map(([cardType, cards]) => {
                        if (cards.length === 0) return null;
                        
                        const totalCards = getCardTypeCount(cards.reduce((acc, card) => {
                          acc[card.id] = card;
                          return acc;
                        }, {}));

                        return (
                          <div key={cardType} className="card-type-section">
                            <div className="card-type-header">
                              <h5>{cardType} ({totalCards} cartes)</h5>
                            </div>
                            
                            {viewMode === 'grid' ? (
                              <div className="deck-cards-grid">
                                {cards.map(card => (
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
                                {cards.map(card => (
                                  <div key={card.id} className="card-text-item">
                                    <div className="card-text-image">
                                      <img 
                                        src={card.image_uris?.small || card.image_uris?.normal} 
                                        alt={card.printed_name || card.name}
                                        className="card-text-thumb"
                                      />
                                      {isDoubleFacedCard(card) && (
                                        <span className="double-face-badge" title="Carte double face">⚡</span>
                                      )}
                                    </div>
                                    <div className="card-text-info">
                                      <span className="card-text-name">
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
                                    </div>
                                    <div className="card-text-actions">
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
                          </div>
                        );
                      });
                    })()}
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
