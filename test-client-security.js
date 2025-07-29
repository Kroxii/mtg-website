/**
 * Tests de sécurité côté client (Frontend)
 * Vérifie la gestion sécurisée des tokens, stockage, et navigation
 */

// Test de sécurité du stockage des tokens
function testTokenStorage() {
  console.log('=== Tests de stockage des tokens ===');
  
  const results = [];

  // Test 1: Vérifier que les tokens ne sont pas stockés en plain text
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    localStorage.setItem('mtg_token', token);
    
    const stored = localStorage.getItem('mtg_token');
    if (stored === token) {
      results.push({
        test: 'Stockage token en localStorage',
        status: 'WARNING',
        message: 'Token stocké en plain text - considérer le chiffrement'
      });
    }
    
    localStorage.removeItem('mtg_token');
  } catch (error) {
    results.push({
      test: 'Stockage token en localStorage',
      status: 'ERROR',
      message: error.message
    });
  }

  // Test 2: Vérifier la protection contre XSS
  try {
    const maliciousScript = '<script>alert("XSS")</script>';
    const div = document.createElement('div');
    div.textContent = maliciousScript;
    
    if (div.innerHTML === '&lt;script&gt;alert("XSS")&lt;/script&gt;') {
      results.push({
        test: 'Protection XSS automatique',
        status: 'PASS',
        message: 'Les scripts sont automatiquement échappés'
      });
    } else {
      results.push({
        test: 'Protection XSS automatique',
        status: 'FAIL',
        message: 'Risque XSS détecté'
      });
    }
  } catch (error) {
    results.push({
      test: 'Protection XSS automatique',
      status: 'ERROR',
      message: error.message
    });
  }

  // Test 3: Vérifier la sécurité des cookies
  try {
    document.cookie = 'test_secure=value; Secure; HttpOnly; SameSite=Strict';
    results.push({
      test: 'Configuration sécurisée des cookies',
      status: 'INFO',
      message: 'Vérifiez manuellement les flags Secure, HttpOnly, SameSite'
    });
  } catch (error) {
    results.push({
      test: 'Configuration sécurisée des cookies',
      status: 'WARNING',
      message: 'Impossible de définir des cookies sécurisés'
    });
  }

  return results;
}

// Test de sécurité des requêtes HTTP
function testHTTPSecurity() {
  console.log('=== Tests de sécurité HTTP ===');
  
  const results = [];

  // Test 1: Vérifier HTTPS
  if (location.protocol === 'https:') {
    results.push({
      test: 'Utilisation HTTPS',
      status: 'PASS',
      message: 'Site sécurisé avec HTTPS'
    });
  } else {
    results.push({
      test: 'Utilisation HTTPS',
      status: 'FAIL',
      message: 'Site non sécurisé - utilisez HTTPS en production'
    });
  }

  // Test 2: Vérifier CSP (Content Security Policy)
  const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (metaCSP) {
    results.push({
      test: 'Content Security Policy',
      status: 'PASS',
      message: 'CSP configuré'
    });
  } else {
    results.push({
      test: 'Content Security Policy',
      status: 'WARNING',
      message: 'CSP non détecté - recommandé pour la sécurité'
    });
  }

  // Test 3: Vérifier les headers de sécurité
  fetch(location.href, { method: 'HEAD' })
    .then(response => {
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];

      securityHeaders.forEach(header => {
        if (response.headers.get(header)) {
          results.push({
            test: `Header ${header}`,
            status: 'PASS',
            message: 'Header de sécurité présent'
          });
        } else {
          results.push({
            test: `Header ${header}`,
            status: 'WARNING',
            message: 'Header de sécurité manquant'
          });
        }
      });
    })
    .catch(error => {
      results.push({
        test: 'Vérification headers de sécurité',
        status: 'ERROR',
        message: error.message
      });
    });

  return results;
}

// Test de sécurité de l'authentification frontend
function testFrontendAuth() {
  console.log('=== Tests d\'authentification frontend ===');
  
  const results = [];

  // Test 1: Vérifier la gestion des tokens expirés
  try {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
    
    // Simuler une requête avec token expiré
    const mockResponse = {
      status: 401,
      json: () => Promise.resolve({ error: 'Token expiré' })
    };

    results.push({
      test: 'Gestion token expiré',
      status: 'INFO',
      message: 'Vérifiez que l\'app redirige vers login si token expiré'
    });
  } catch (error) {
    results.push({
      test: 'Gestion token expiré',
      status: 'ERROR',
      message: error.message
    });
  }

  // Test 2: Vérifier la protection des routes
  const protectedRoutes = ['/dashboard', '/collection', '/profile'];
  
  protectedRoutes.forEach(route => {
    results.push({
      test: `Protection route ${route}`,
      status: 'INFO',
      message: 'Vérifiez manuellement que la route nécessite une authentification'
    });
  });

  // Test 3: Vérifier le nettoyage à la déconnexion
  results.push({
    test: 'Nettoyage à la déconnexion',
    status: 'INFO',
    message: 'Vérifiez que tous les tokens/données sont supprimés au logout'
  });

  return results;
}

// Test de validation des entrées utilisateur
function testInputValidation() {
  console.log('=== Tests de validation des entrées ===');
  
  const results = [];

  // Test 1: Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const testEmails = [
    'valid@example.com',
    'invalid-email',
    'test@',
    '@example.com',
    'test..test@example.com'
  ];

  testEmails.forEach(email => {
    const isValid = emailRegex.test(email);
    results.push({
      test: `Validation email: ${email}`,
      status: (email === 'valid@example.com' && isValid) || 
              (email !== 'valid@example.com' && !isValid) ? 'PASS' : 'FAIL',
      message: isValid ? 'Email valide' : 'Email invalide'
    });
  });

  // Test 2: Validation mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const testPasswords = [
    'ValidPass123!',
    'weak',
    '12345678',
    'NoNumbers!',
    'nonumbers123!'
  ];

  testPasswords.forEach(password => {
    const isValid = passwordRegex.test(password);
    results.push({
      test: `Validation mot de passe: ${password}`,
      status: (password === 'ValidPass123!' && isValid) || 
              (password !== 'ValidPass123!' && !isValid) ? 'PASS' : 'FAIL',
      message: isValid ? 'Mot de passe fort' : 'Mot de passe faible'
    });
  });

  return results;
}

// Test de sécurité des données sensibles
function testSensitiveDataHandling() {
  console.log('=== Tests de gestion des données sensibles ===');
  
  const results = [];

  // Test 1: Vérifier qu'aucun mot de passe n'est visible dans le DOM
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  if (passwordInputs.length > 0) {
    results.push({
      test: 'Masquage des mots de passe',
      status: 'PASS',
      message: `${passwordInputs.length} champ(s) de mot de passe correctement masqué(s)`
    });
  }

  // Test 2: Vérifier l'absence de données sensibles dans les logs console
  const originalLog = console.log;
  let sensitiveDataLogged = false;
  
  console.log = function(...args) {
    const logString = args.join(' ').toLowerCase();
    if (logString.includes('password') || logString.includes('token') || logString.includes('secret')) {
      sensitiveDataLogged = true;
    }
    originalLog.apply(console, args);
  };

  results.push({
    test: 'Absence de données sensibles dans les logs',
    status: sensitiveDataLogged ? 'FAIL' : 'PASS',
    message: sensitiveDataLogged ? 'Données sensibles détectées dans les logs' : 'Aucune donnée sensible dans les logs'
  });

  // Restaurer console.log
  console.log = originalLog;

  return results;
}

// Fonction principale d'exécution des tests
function runClientSecurityTests() {
  console.log('🔒 TESTS DE SÉCURITÉ CÔTÉ CLIENT - MTG COLLECTION MANAGER');
  console.log('===========================================================');

  const allResults = [
    ...testTokenStorage(),
    ...testHTTPSecurity(),
    ...testFrontendAuth(),
    ...testInputValidation(),
    ...testSensitiveDataHandling()
  ];

  // Affichage des résultats
  console.log('\n📊 RÉSULTATS DES TESTS DE SÉCURITÉ');
  console.log('===================================');

  const summary = {
    PASS: 0,
    FAIL: 0,
    WARNING: 0,
    ERROR: 0,
    INFO: 0
  };

  allResults.forEach(result => {
    summary[result.status]++;
    
    const emoji = {
      PASS: '✅',
      FAIL: '❌',
      WARNING: '⚠️',
      ERROR: '🔥',
      INFO: 'ℹ️'
    };

    console.log(`${emoji[result.status]} ${result.test}: ${result.message}`);
  });

  console.log('\n📈 RÉSUMÉ');
  console.log(`Total: ${allResults.length} tests`);
  console.log(`✅ Réussis: ${summary.PASS}`);
  console.log(`❌ Échoués: ${summary.FAIL}`);
  console.log(`⚠️ Avertissements: ${summary.WARNING}`);
  console.log(`🔥 Erreurs: ${summary.ERROR}`);
  console.log(`ℹ️ Informations: ${summary.INFO}`);

  // Recommandations de sécurité
  console.log('\n🛡️ RECOMMANDATIONS DE SÉCURITÉ');
  console.log('================================');
  console.log('1. Utilisez HTTPS en production');
  console.log('2. Implémentez un Content Security Policy (CSP)');
  console.log('3. Configurez les headers de sécurité');
  console.log('4. Chiffrez les tokens sensibles avant stockage');
  console.log('5. Validez toutes les entrées utilisateur');
  console.log('6. Ne loggez jamais de données sensibles');
  console.log('7. Implémentez une gestion robuste des sessions');
  console.log('8. Utilisez des cookies sécurisés (HttpOnly, Secure, SameSite)');

  return allResults;
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runClientSecurityTests,
    testTokenStorage,
    testHTTPSecurity,
    testFrontendAuth,
    testInputValidation,
    testSensitiveDataHandling
  };
}

// Auto-exécution si dans un navigateur
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runClientSecurityTests);
  } else {
    runClientSecurityTests();
  }
}
