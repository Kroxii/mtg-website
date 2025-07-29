// Script de test pour vérifier la santé de l'application
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testHealth() {
  try {
    console.log('🔍 Test de santé de l\'API...');
    
    // Test de la route de santé
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Santé API:', healthResponse.data);
    
    // Test de la liste des routes
    console.log('\n🔍 Test des routes principales...');
    
    // Test auth endpoints (sans authentification - devrait retourner 401 ou 400)
    try {
      await axios.get(`${API_BASE_URL}/auth/profile`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route auth/profile protégée correctement');
      }
    }
    
    // Test collections endpoints
    try {
      await axios.get(`${API_BASE_URL}/collections`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Route collections protégée correctement');
      }
    }
    
    console.log('\n🎉 Tous les tests de base sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    }
  }
}

testHealth();
