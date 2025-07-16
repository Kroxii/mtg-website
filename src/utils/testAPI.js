// Script de test pour vérifier les appels API en français
import { scryfallApi, scryfallApiGeneral, apiUtils } from './api.js';

// Fonction de test pour vérifier les appels API
export const testFrenchAPI = async () => {
  console.log('🧪 Test des appels API en français...');
  
  try {
    // Test 1: Recherche de cartes
    console.log('\n📚 Test 1: Recherche de cartes');
    const searchResult = await apiUtils.searchCards('Lightning Bolt', 1);
    console.log('Premier résultat:', {
      nom: searchResult.data?.[0]?.name,
      nom_francais: searchResult.data?.[0]?.printed_name,
      langue: searchResult.data?.[0]?.lang
    });
    
    // Test 2: Récupération d'une extension
    console.log('\n🗂️ Test 2: Récupération des extensions');
    const sets = await apiUtils.getSets();
    console.log('Première extension:', {
      nom: sets?.[0]?.name,
      code: sets?.[0]?.code,
      type: sets?.[0]?.set_type
    });
    
    // Test 3: Cartes d'une extension
    console.log('\n🃏 Test 3: Cartes d\'une extension (DOM)');
    const cards = await apiUtils.getCardsFromSet('dom');
    console.log('Première carte:', {
      nom: cards?.[0]?.name,
      nom_francais: cards?.[0]?.printed_name,
      langue: cards?.[0]?.lang
    });
    
    // Test 4: Vérification des paramètres par défaut
    console.log('\n⚙️ Test 4: Vérification des paramètres par défaut');
    console.log('Configuration scryfallApi:', scryfallApi.defaults.params);
    console.log('Configuration scryfallApiGeneral:', scryfallApiGeneral.defaults.params);
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Test spécifique pour les cartes double face
export const testDoubleFacedCards = async () => {
  console.log('🔄 Test des cartes double face...');
  
  try {
    const searchResult = await apiUtils.searchCards('Delver of Secrets', 1);
    const card = searchResult.data?.[0];
    
    if (card) {
      console.log('Carte double face trouvée:', {
        nom: card.name,
        nom_francais: card.printed_name,
        layout: card.layout,
        faces: card.card_faces?.length || 0
      });
      
      if (card.card_faces) {
        card.card_faces.forEach((face, index) => {
          console.log(`Face ${index}:`, {
            nom: face.name,
            nom_francais: face.printed_name,
            type: face.type_line
          });
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test des cartes double face:', error);
  }
};

// Fonction pour tester en mode développement
if (import.meta.env.DEV) {
  window.testFrenchAPI = testFrenchAPI;
  window.testDoubleFacedCards = testDoubleFacedCards;
}
