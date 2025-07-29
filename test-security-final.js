/**
 * Test de sécurité final - Vérification complète après corrections
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

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
    return { status: response.status, data, ok: response.ok, headers: response.headers };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function runFinalSecurityTest() {
  log('\n🔒 TEST DE SÉCURITÉ FINAL - MTG COLLECTION MANAGER', 'blue');
  log('==================================================\n', 'blue');

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  function logResult(test, success, details = '') {
    testResults.total++;
    if (success) {
      testResults.passed++;
      log(`✅ ${test}`, 'green');
    } else {
      testResults.failed++;
      log(`❌ ${test}`, 'red');
      if (details) log(`   ${details}`, 'yellow');
    }
  }

  // 1. Tests d'authentification corrigés
  log('🔐 TESTS D\'AUTHENTIFICATION', 'cyan');
  
  const userEmail = `final-test-${Date.now()}@example.com`;
  
  // Test inscription avec validation
  const register = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      email: userEmail,
      password: 'SecurePass123!'
    })
  });
  logResult('Inscription avec validation', register.ok);

  // Test inscription avec données invalides
  const invalidRegister = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '<script>alert("XSS")</script>',
      prenom: 'Te',
      email: 'invalid-email',
      password: '123'
    })
  });
  logResult('Rejet inscription avec données invalides', !invalidRegister.ok);

  let token = '';
  if (register.ok) {
    // Test connexion
    const login = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'SecurePass123!'
      })
    });
    
    if (login.ok) {
      token = login.data.token;
      logResult('Connexion réussie', true);
      
      // Test accès au profil
      const profile = await makeRequest('/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      logResult('Accès au profil avec token JWT', profile.ok);
      
      // Test modification de profil
      const updateProfile = await makeRequest('/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nom: 'Updated Name'
        })
      });
      logResult('Modification de profil', updateProfile.ok);
    }
  }

  // 2. Tests de sécurité des endpoints
  log('\n🛡️  TESTS DE SÉCURITÉ DES ENDPOINTS', 'cyan');
  
  // Test accès aux statistiques
  const stats = await makeRequest('/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  logResult('Accès aux statistiques protégées', stats.ok);

  // Test accès sans token
  const noToken = await makeRequest('/auth/me');
  logResult('Rejet accès sans token', !noToken.ok);

  // Test token invalide
  const invalidToken = await makeRequest('/auth/me', {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  logResult('Rejet token invalide', !invalidToken.ok);

  // 3. Tests de rate limiting
  log('\n⏱️  TESTS DE RATE LIMITING', 'cyan');
  
  log('   Test de brute force sur login...');
  let rateLimitHit = false;
  for (let i = 0; i < 6; i++) {
    const attempt = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: `wrong-${i}`
      })
    });
    
    if (attempt.status === 429) {
      rateLimitHit = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  logResult('Rate limiting sur connexions', rateLimitHit);

  // 4. Tests de validation des données
  log('\n🔍 TESTS DE VALIDATION DES DONNÉES', 'cyan');
  
  // Test email invalide
  const invalidEmail = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      email: 'not-an-email',
      password: 'SecurePass123!'
    })
  });
  logResult('Rejet email invalide', !invalidEmail.ok);

  // Test mot de passe faible
  const weakPassword = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Test',
      prenom: 'User',
      email: 'weak@example.com',
      password: 'weak'
    })
  });
  logResult('Rejet mot de passe faible', !weakPassword.ok);

  // Test injection NoSQL
  const nosqlInjection = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: { "$ne": null },
      password: { "$ne": null }
    })
  });
  logResult('Protection contre injection NoSQL', !nosqlInjection.ok);

  // 5. Tests de sanitisation
  log('\n🧹 TESTS DE SANITISATION', 'cyan');
  
  const xssTest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '<img src=x onerror=alert("XSS")>',
      prenom: '<script>alert("XSS")</script>',
      email: 'xss-test@example.com',
      password: 'SecurePass123!'
    })
  });
  
  if (xssTest.ok && xssTest.data.user) {
    const nom = xssTest.data.user.nom;
    const hasXSS = nom.includes('<script>') || nom.includes('<img') || nom.includes('onerror');
    logResult('Sanitisation des scripts XSS', !hasXSS);
  } else {
    logResult('Test de sanitisation XSS', true, 'Données rejetées par la validation');
  }

  // Test path traversal
  const pathTraversal = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '../../../etc/passwd',
      prenom: '..\\..\\windows\\system32',
      email: 'path@example.com',
      password: 'SecurePass123!'
    })
  });
  
  if (pathTraversal.ok && pathTraversal.data.user) {
    const nom = pathTraversal.data.user.nom;
    const hasTraversal = nom.includes('../') || nom.includes('..\\');
    logResult('Protection contre path traversal', !hasTraversal);
  } else {
    logResult('Protection contre path traversal', true, 'Données rejetées par la validation');
  }

  // 6. Tests de headers de sécurité
  log('\n🔒 TESTS DE HEADERS DE SÉCURITÉ', 'cyan');
  
  const response = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password'
    })
  });

  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];

  securityHeaders.forEach(header => {
    const hasHeader = response.headers.get(header);
    logResult(`Header ${header}`, !!hasHeader);
  });

  // 7. Tests de performance et DoS
  log('\n⚡ TESTS DE PROTECTION DoS', 'cyan');
  
  // Test payload volumineux
  const largePayload = 'A'.repeat(200 * 1024); // 200KB
  const oversizeTest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: largePayload,
      prenom: 'User',
      email: 'large@example.com',
      password: 'SecurePass123!'
    })
  });
  logResult('Protection contre payload volumineux', !oversizeTest.ok || oversizeTest.status === 413);

  // Test de multiples requêtes rapides
  log('   Test de multiples requêtes rapides...');
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('/auth/test'));
  }
  const results = await Promise.all(promises);
  const hasRateLimit = results.some(r => r.status === 429);
  logResult('Protection contre spam de requêtes', hasRateLimit);

  // Résultats finaux
  log('\n📊 RÉSULTATS FINAUX', 'blue');
  log('==================', 'blue');
  
  const percentage = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`Total des tests: ${testResults.total}`, 'cyan');
  log(`Tests réussis: ${testResults.passed}`, 'green');
  log(`Tests échoués: ${testResults.failed}`, 'red');
  log(`Taux de réussite: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 75 ? 'yellow' : 'red');

  // Évaluation de la sécurité
  log('\n🏆 ÉVALUATION DE LA SÉCURITÉ', 'blue');
  if (percentage >= 95) {
    log('🔒 EXCELLENT - Sécurité de niveau production', 'green');
  } else if (percentage >= 85) {
    log('🛡️  BON - Sécurité solide avec quelques améliorations possibles', 'yellow');
  } else if (percentage >= 70) {
    log('⚠️  MOYEN - Sécurité de base mais vulnérabilités présentes', 'yellow');
  } else {
    log('🚨 FAIBLE - Vulnérabilités critiques détectées', 'red');
  }

  // Recommandations finales
  log('\n🔧 RECOMMANDATIONS FINALES', 'blue');
  log('==========================', 'blue');
  
  if (testResults.failed === 0) {
    log('✅ Félicitations ! Votre application a passé tous les tests de sécurité.', 'green');
    log('💡 Considérez maintenant:', 'cyan');
    log('   • Authentification à deux facteurs (2FA)', 'yellow');
    log('   • Audit de sécurité régulier', 'yellow');
    log('   • Monitoring des tentatives d\'intrusion', 'yellow');
    log('   • Chiffrement des données sensibles au repos', 'yellow');
  } else {
    log('🔧 Actions requises:', 'yellow');
    if (testResults.failed > 5) {
      log('   • Correction des vulnérabilités critiques identifiées', 'red');
    }
    log('   • Réexécution des tests après corrections', 'yellow');
    log('   • Formation de l\'équipe sur les bonnes pratiques de sécurité', 'yellow');
  }

  log('\n🎯 SURVEILLANCE CONTINUE', 'blue');
  log('• Intégrez ces tests dans votre pipeline CI/CD', 'cyan');
  log('• Planifiez des audits de sécurité réguliers', 'cyan');
  log('• Tenez à jour les dépendances de sécurité', 'cyan');
  log('• Surveillez les logs de sécurité en production', 'cyan');

  return testResults;
}

// Exécution du test
runFinalSecurityTest().catch(console.error);
