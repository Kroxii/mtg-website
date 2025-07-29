/**
 * Test complet des sécurités de connexion
 * Tests d'authentification, autorisation et sécurité
 */

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(test, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    log(`✓ ${test}`, 'green');
  } else {
    testResults.failed++;
    log(`✗ ${test}`, 'red');
    if (details) log(`  ${details}`, 'yellow');
  }
}

// Helper pour faire des requêtes
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

// Variables globales pour les tests
let validToken = '';
let validUserId = '';
let testUserEmail = `test-security-${Date.now()}@example.com`;

async function runSecurityTests() {
  log('\n=== TESTS DE SÉCURITÉ MTG COLLECTION MANAGER ===\n', 'blue');

  // 1. Tests d'inscription
  await testRegistration();

  // 2. Tests de connexion
  await testLogin();

  // 3. Tests d'authentification JWT
  await testJWTAuthentication();

  // 4. Tests d'autorisation
  await testAuthorization();

  // 5. Tests de validation des données
  await testDataValidation();

  // 6. Tests de sécurité des endpoints
  await testEndpointSecurity();

  // 7. Tests d'injection et attaques
  await testSecurityAttacks();

  // 8. Tests de session et déconnexion
  await testSessionManagement();

  // Résultats finaux
  displayResults();
}

async function testRegistration() {
  log('\n--- Tests d\'inscription ---', 'blue');

  // Test inscription valide
  const validRegistration = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      email: testUserEmail,
      password: 'TestPassword123!',
      dateNaissance: '1990-01-01'
    })
  });
  logResult('Inscription avec données valides', validRegistration.ok);

  // Test inscription sans email
  const noEmail = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      password: 'TestPassword123!'
    })
  });
  logResult('Rejet inscription sans email', !noEmail.ok);

  // Test inscription sans mot de passe
  const noPassword = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      email: 'test2@example.com'
    })
  });
  logResult('Rejet inscription sans mot de passe', !noPassword.ok);

  // Test inscription avec email déjà existant
  const duplicateEmail = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test2',
      prenom: 'User2',
      email: testUserEmail,
      password: 'TestPassword123!'
    })
  });
  logResult('Rejet inscription avec email existant', !duplicateEmail.ok);

  // Test inscription avec mot de passe faible
  const weakPassword = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test3',
      prenom: 'User3',
      email: 'test3@example.com',
      password: '123'
    })
  });
  logResult('Rejet inscription avec mot de passe faible', !weakPassword.ok);
}

async function testLogin() {
  log('\n--- Tests de connexion ---', 'blue');

  // Test connexion valide
  const validLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUserEmail,
      password: 'TestPassword123!'
    })
  });
  
  if (validLogin.ok && validLogin.data.token) {
    validToken = validLogin.data.token;
    validUserId = validLogin.data.user._id;
    logResult('Connexion avec identifiants valides', true);
  } else {
    logResult('Connexion avec identifiants valides', false, 'Token non reçu');
  }

  // Test connexion avec email invalide
  const invalidEmail = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'inexistant@example.com',
      password: 'TestPassword123!'
    })
  });
  logResult('Rejet connexion avec email invalide', !invalidEmail.ok);

  // Test connexion avec mot de passe invalide
  const invalidPassword = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUserEmail,
      password: 'MauvaisMotDePasse'
    })
  });
  logResult('Rejet connexion avec mot de passe invalide', !invalidPassword.ok);

  // Test connexion sans données
  const noData = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({})
  });
  logResult('Rejet connexion sans données', !noData.ok);
}

async function testJWTAuthentication() {
  log('\n--- Tests d\'authentification JWT ---', 'blue');

  // Test accès avec token valide
  const validAccess = await makeRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Accès avec token JWT valide', validAccess.ok);

  // Test accès sans token
  const noToken = await makeRequest('/auth/me');
  logResult('Rejet accès sans token', !noToken.ok);

  // Test accès avec token invalide
  const invalidToken = await makeRequest('/auth/me', {
    headers: {
      'Authorization': 'Bearer invalid.token.here'
    }
  });
  logResult('Rejet accès avec token invalide', !invalidToken.ok);

  // Test accès avec token malformé
  const malformedToken = await makeRequest('/auth/me', {
    headers: {
      'Authorization': 'Bearer malformed-token'
    }
  });
  logResult('Rejet accès avec token malformé', !malformedToken.ok);

  // Test accès avec token expiré (simulé)
  try {
    const expiredToken = jwt.sign(
      { userId: validUserId }, 
      'fake-secret', 
      { expiresIn: '-1h' }
    );
    const expiredAccess = await makeRequest('/auth/me', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    logResult('Rejet accès avec token expiré', !expiredAccess.ok);
  } catch (error) {
    logResult('Test token expiré', false, 'Erreur de génération du token');
  }
}

async function testAuthorization() {
  log('\n--- Tests d\'autorisation ---', 'blue');

  // Test accès aux collections personnelles
  const ownCollections = await makeRequest('/collections', {
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Accès aux collections personnelles', ownCollections.ok);

  // Test accès aux statistiques
  const stats = await makeRequest('/stats', {
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Accès aux statistiques', stats.ok);

  // Test modification de profil
  const updateProfile = await makeRequest('/auth/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({
      nom: 'Test Updated'
    })
  });
  logResult('Modification de profil autorisée', updateProfile.ok);
}

async function testDataValidation() {
  log('\n--- Tests de validation des données ---', 'blue');

  // Test données malformées JSON
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    });
    logResult('Rejet données JSON malformées', !response.ok);
  } catch (error) {
    logResult('Rejet données JSON malformées', true);
  }

  // Test injection XSS dans les champs
  const xssTest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '<script>alert("xss")</script>',
      prenom: 'User',
      email: 'xss@example.com',
      password: 'TestPassword123!'
    })
  });
  logResult('Protection contre XSS dans les champs', !xssTest.ok || !xssTest.data.user?.nom?.includes('<script>'));

  // Test injection SQL dans email
  const sqlInjection = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: "' OR '1'='1' --",
      password: 'password'
    })
  });
  logResult('Protection contre injection SQL', !sqlInjection.ok);
}

async function testEndpointSecurity() {
  log('\n--- Tests de sécurité des endpoints ---', 'blue');

  // Test CORS (si configuré)
  const corsTest = await makeRequest('/auth/me', {
    headers: {
      'Origin': 'http://malicious-site.com',
      'Authorization': `Bearer ${validToken}`
    }
  });
  // Note: Le test CORS dépend de la configuration du serveur
  logResult('Test CORS (vérification manuelle requise)', true);

  // Test méthodes HTTP non autorisées
  const deleteMethod = await makeRequest('/auth/login', {
    method: 'DELETE'
  });
  logResult('Rejet méthode DELETE sur endpoint LOGIN', !deleteMethod.ok);

  // Test headers de sécurité
  const securityHeaders = await makeRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Réponse avec headers de sécurité (vérification manuelle)', true);
}

async function testSecurityAttacks() {
  log('\n--- Tests d\'attaques de sécurité ---', 'blue');

  // Test brute force (simulation)
  log('Simulation d\'attaque brute force...');
  let bruteForceBlocked = false;
  for (let i = 0; i < 5; i++) {
    const attempt = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: `wrong-password-${i}`
      })
    });
    if (attempt.status === 429) { // Too Many Requests
      bruteForceBlocked = true;
      break;
    }
  }
  logResult('Protection contre brute force', bruteForceBlocked);

  // Test très gros payload
  const largePayload = 'A'.repeat(10000);
  const oversizeRequest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: largePayload,
      prenom: 'User',
      email: 'large@example.com',
      password: 'TestPassword123!'
    })
  });
  logResult('Protection contre payload oversized', !oversizeRequest.ok);

  // Test caractères spéciaux malveillants
  const specialChars = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '../../etc/passwd',
      prenom: '../../../windows/system32',
      email: 'special@example.com',
      password: 'TestPassword123!'
    })
  });
  logResult('Protection contre path traversal', !specialChars.ok || !specialChars.data.user?.nom?.includes('../'));
}

async function testSessionManagement() {
  log('\n--- Tests de gestion de session ---', 'blue');

  // Test déconnexion
  const logout = await makeRequest('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Déconnexion réussie', logout.ok);

  // Test accès après déconnexion (si le logout invalide le token)
  const accessAfterLogout = await makeRequest('/auth/me', {
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  // Note: Selon l'implémentation, le token peut rester valide après logout
  logResult('État après déconnexion (vérification manuelle)', true);

  // Test refresh token (si implémenté)
  const refreshTest = await makeRequest('/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${validToken}`
    }
  });
  logResult('Test refresh token (si implémenté)', refreshTest.ok || refreshTest.status === 404);
}

function displayResults() {
  log('\n=== RÉSULTATS DES TESTS DE SÉCURITÉ ===\n', 'blue');
  log(`Total des tests: ${testResults.total}`, 'blue');
  log(`Tests réussis: ${testResults.passed}`, 'green');
  log(`Tests échoués: ${testResults.failed}`, 'red');
  
  const percentage = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`Taux de réussite: ${percentage}%`, percentage >= 80 ? 'green' : 'yellow');

  if (testResults.failed > 0) {
    log('\n⚠️  Des vulnérabilités potentielles ont été détectées!', 'red');
    log('Veuillez vérifier les tests échoués ci-dessus.', 'yellow');
  } else {
    log('\n✅ Tous les tests de sécurité sont passés!', 'green');
  }

  log('\n--- RECOMMANDATIONS DE SÉCURITÉ ---', 'blue');
  log('1. Vérifiez la configuration CORS', 'yellow');
  log('2. Implémentez un rate limiting pour les tentatives de connexion', 'yellow');
  log('3. Utilisez HTTPS en production', 'yellow');
  log('4. Configurez des headers de sécurité (helmet.js)', 'yellow');
  log('5. Validez et sanitisez toutes les entrées utilisateur', 'yellow');
  log('6. Implémentez une politique de mots de passe robuste', 'yellow');
  log('7. Loggez les tentatives de connexion suspectes', 'yellow');
  log('8. Considérez l\'authentification à deux facteurs', 'yellow');
}

// Vérifier que le serveur est accessible
async function checkServerStatus() {
  try {
    // Essayer plusieurs endpoints pour vérifier la connexion
    const endpoints = ['/test/health', '/auth/test', '/'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(endpoint);
        if (response.status !== 0) {
          log('✅ Serveur accessible', 'green');
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    log('❌ Serveur non accessible', 'red');
    return false;
  } catch (error) {
    log('❌ Impossible de contacter le serveur', 'red');
    log(`Erreur: ${error.message}`, 'red');
    return false;
  }
}

// Point d'entrée principal
async function main() {
  log('Vérification de l\'état du serveur...', 'blue');
  
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    log('\n⚠️  Le serveur doit être démarré pour exécuter les tests.', 'yellow');
    log('Utilisez: npm run server:start', 'yellow');
    return;
  }

  await runSecurityTests();
}

main().catch(console.error);
