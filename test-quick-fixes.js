/**
 * Test rapide des corrections de sécurité
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testQuickFixes() {
  console.log('🔧 Test rapide des corrections de sécurité\n');

  // 1. Test route statistiques
  console.log('1. Test accès aux statistiques...');
  
  // Créer un utilisateur pour les tests
  const userEmail = `quick-test-${Date.now()}@example.com`;
  const register = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Quick',
      prenom: 'Test',
      email: userEmail,
      password: 'QuickTest123!'
    })
  });

  if (register.ok) {
    console.log('   ✅ Inscription réussie');
    
    const login = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'QuickTest123!'
      })
    });

    if (login.ok) {
      console.log('   ✅ Connexion réussie');
      const token = login.data.token;

      // Test accès aux statistiques
      const stats = await makeRequest('/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (stats.ok) {
        console.log('   ✅ Accès aux statistiques OK');
        console.log(`   📊 Données reçues: ${JSON.stringify(stats.data.data || stats.data.endpoints)}`);
      } else {
        console.log(`   ❌ Erreur statistiques: ${stats.data.error}`);
      }

      // Test accès au profil
      const profile = await makeRequest('/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profile.ok) {
        console.log('   ✅ Accès au profil OK');
      } else {
        console.log(`   ❌ Erreur profil: ${profile.data.error}`);
      }

    } else {
      console.log(`   ❌ Échec connexion: ${login.data.error}`);
    }
  } else {
    console.log(`   ❌ Échec inscription: ${register.data.error || register.data.details}`);
  }

  // 2. Test rate limiting
  console.log('\n2. Test rate limiting...');
  let attempts = 0;
  let blocked = false;

  for (let i = 0; i < 6; i++) {
    const attempt = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'fake@example.com',
        password: 'wrongpassword'
      })
    });

    attempts++;
    if (attempt.status === 429) {
      blocked = true;
      console.log(`   ✅ Rate limiting activé après ${attempts} tentatives`);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  if (!blocked) {
    console.log(`   ⚠️  Rate limiting non détecté après ${attempts} tentatives`);
  }

  console.log('\n🎯 Test rapide terminé');
}

testQuickFixes().catch(console.error);
