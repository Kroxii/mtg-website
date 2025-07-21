// Test rapide de l'API française
console.log('🧪 Test de l\'API française...');

// Test basique pour vérifier les paramètres
import('./utils/api.js').then(({ scryfallApi, apiUtils }) => {
  console.log('Configuration API française:', scryfallApi.defaults.params);
  
  // Test de recherche avec une carte connue
  apiUtils.searchCards('Lightning Bolt', 1)
    .then(result => {
      const card = result.data[0];
      if (card) {
        console.log('Test carte Lightning Bolt:');
        console.log('- Nom original:', card.name);
        console.log('- Nom français:', card.printed_name || 'Non disponible');
        console.log('- Langue:', card.lang);
        console.log('- Type original:', card.type_line);
        console.log('- Type français:', card.printed_type_line || 'Non disponible');
      }
    })
    .catch(err => console.error('Erreur test:', err));
    
  // Test extension
  apiUtils.getSets()
    .then(sets => {
      console.log('Extensions disponibles:', sets.length);
      console.log('Première extension:', sets[0]?.name, '- Nombre de cartes:', sets[0]?.card_count);
    })
    .catch(err => console.error('Erreur extensions:', err));
});

export default {};
