/**
 * Tests approfondis des vulnérabilités détectées
 * Et corrections des problèmes de sécurité
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function testDetailedVulnerabilities() {
  log('\n=== ANALYSE DÉTAILLÉE DES VULNÉRABILITÉS ===\n', 'blue');

  // 1. Test du endpoint /auth/me
  log('1. Test d\'accès au profil utilisateur:', 'yellow');
  
  // Créer un utilisateur de test
  const userEmail = `security-test-${Date.now()}@example.com`;
  const registerResult = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: 'Security',
      prenom: 'Test',
      email: userEmail,
      password: 'SecurePass123!'
    })
  });

  if (registerResult.ok) {
    const loginResult = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'SecurePass123!'
      })
    });

    if (loginResult.ok && loginResult.data.token) {
      const token = loginResult.data.token;
      
      // Test accès au profil
      const profileResult = await makeRequest('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResult.ok) {
        log('✅ Endpoint /auth/me fonctionne correctement', 'green');
      } else {
        log(`❌ Problème avec /auth/me: ${profileResult.data.error}`, 'red');
        log('   → Vérifiez que le middleware authenticateToken utilise le bon champ (userId vs id)', 'yellow');
      }

      // 2. Test des statistiques
      log('\n2. Test d\'accès aux statistiques:', 'yellow');
      const statsResult = await makeRequest('/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResult.ok) {
        log('✅ Endpoint /stats accessible', 'green');
      } else {
        log(`❌ Problème avec /stats: ${statsResult.status} - ${statsResult.data.error || 'Endpoint non trouvé'}`, 'red');
        log('   → Vérifiez que la route /stats existe et est protégée', 'yellow');
      }

      // 3. Test de modification de profil
      log('\n3. Test de modification de profil:', 'yellow');
      const updateResult = await makeRequest('/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nom: 'Updated Name'
        })
      });

      if (updateResult.ok) {
        log('✅ Modification de profil fonctionne', 'green');
      } else {
        log(`❌ Problème avec modification profil: ${updateResult.status} - ${updateResult.data.error || 'Endpoint non trouvé'}`, 'red');
        log('   → Vérifiez que la route PUT /auth/profile existe', 'yellow');
      }

    } else {
      log('❌ Impossible de se connecter pour les tests approfondis', 'red');
    }
  } else {
    log('❌ Impossible de créer un utilisateur pour les tests', 'red');
  }

  // 4. Test de protection XSS
  log('\n4. Test de protection XSS:', 'yellow');
  const xssTest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '<script>alert("XSS")</script>',
      prenom: '<img src=x onerror=alert("XSS")>',
      email: 'xss-test@example.com',
      password: 'TestPass123!'
    })
  });

  if (xssTest.ok && xssTest.data.user) {
    const nom = xssTest.data.user.nom;
    const prenom = xssTest.data.user.prenom;
    
    if (nom.includes('<script>') || prenom.includes('<img')) {
      log('❌ Vulnérabilité XSS détectée - données non sanitisées', 'red');
      log(`   Nom stocké: ${nom}`, 'red');
      log(`   Prénom stocké: ${prenom}`, 'red');
      log('   → Implémentez la sanitisation des entrées utilisateur', 'yellow');
    } else {
      log('✅ Protection XSS en place - données sanitisées', 'green');
    }
  } else {
    log('   Test XSS incomplet - vérification manuelle requise', 'yellow');
  }

  // 5. Test de rate limiting
  log('\n5. Test de rate limiting (brute force):', 'yellow');
  let rateLimitDetected = false;
  let attemptCount = 0;
  
  for (let i = 0; i < 10; i++) {
    const attempt = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: `wrong-password-${i}`
      })
    });

    attemptCount++;
    
    if (attempt.status === 429) {
      rateLimitDetected = true;
      log(`✅ Rate limiting détecté après ${attemptCount} tentatives`, 'green');
      break;
    }
    
    // Petite pause entre les tentatives
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!rateLimitDetected) {
    log(`❌ Aucun rate limiting détecté après ${attemptCount} tentatives`, 'red');
    log('   → Implémentez express-rate-limit ou équivalent', 'yellow');
  }

  // 6. Test de path traversal
  log('\n6. Test de path traversal:', 'yellow');
  const pathTraversalTest = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nom: '../../../etc/passwd',
      prenom: '..\\..\\windows\\system32\\config',
      email: 'path-test@example.com',
      password: 'TestPass123!'
    })
  });

  if (pathTraversalTest.ok && pathTraversalTest.data.user) {
    const nom = pathTraversalTest.data.user.nom;
    const prenom = pathTraversalTest.data.user.prenom;
    
    if (nom.includes('../') || prenom.includes('..\\')) {
      log('❌ Vulnérabilité path traversal détectée', 'red');
      log(`   Nom stocké: ${nom}`, 'red');
      log(`   Prénom stocké: ${prenom}`, 'red');
      log('   → Validez et sanitisez les chemins de fichiers', 'yellow');
    } else {
      log('✅ Protection path traversal en place', 'green');
    }
  }

  // 7. Test des headers de sécurité
  log('\n7. Test des headers de sécurité:', 'yellow');
  const headersTest = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password'
    })
  });

  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy'
  ];

  let headersMissing = [];
  securityHeaders.forEach(header => {
    if (!headersTest.headers.get(header)) {
      headersMissing.push(header);
    }
  });

  if (headersMissing.length > 0) {
    log(`❌ Headers de sécurité manquants: ${headersMissing.join(', ')}`, 'red');
    log('   → Installez et configurez helmet.js', 'yellow');
  } else {
    log('✅ Tous les headers de sécurité sont présents', 'green');
  }
}

async function generateSecurityReport() {
  log('\n=== RAPPORT DE SÉCURITÉ DÉTAILLÉ ===\n', 'blue');

  const issues = [];
  const recommendations = [];

  // Analyse des middlewares
  log('📋 ANALYSE DES MIDDLEWARES DE SÉCURITÉ', 'blue');
  
  // Vérification de l'existence des fichiers critiques
  try {
    const fs = await import('fs');
    const path = await import('path');

    const criticalFiles = [
      'server/src/middleware/auth.js',
      'server/src/controllers/authController.js',
      'server/.env'
    ];

    criticalFiles.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        log(`✅ ${file} existe`, 'green');
      } else {
        log(`❌ ${file} manquant`, 'red');
        issues.push(`Fichier critique manquant: ${file}`);
      }
    });

  } catch (error) {
    log('⚠️  Impossible de vérifier les fichiers critiques', 'yellow');
  }

  // Recommendations de sécurité spécifiques
  log('\n🛡️  RECOMMANDATIONS SPÉCIFIQUES', 'blue');

  recommendations.push('1. Corriger le middleware authenticateToken pour utiliser le bon champ JWT');
  recommendations.push('2. Implémenter express-rate-limit pour prévenir le brute force');
  recommendations.push('3. Ajouter helmet.js pour les headers de sécurité');
  recommendations.push('4. Implémenter la validation et sanitisation avec joi ou express-validator');
  recommendations.push('5. Configurer CORS correctement');
  recommendations.push('6. Ajouter des logs de sécurité');
  recommendations.push('7. Implémenter une politique de mots de passe robuste');
  recommendations.push('8. Considérer l\'authentification à deux facteurs');

  recommendations.forEach(rec => log(rec, 'yellow'));

  // Instructions d'implémentation
  log('\n🔧 INSTRUCTIONS D\'IMPLÉMENTATION', 'blue');
  
  log('\n1. Installation des dépendances de sécurité:', 'yellow');
  log('   npm install helmet express-rate-limit joi bcryptjs', 'green');
  
  log('\n2. Configuration dans server.js:', 'yellow');
  log(`   import helmet from 'helmet';
   import rateLimit from 'express-rate-limit';
   
   app.use(helmet());
   
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 tentatives par IP
     message: 'Trop de tentatives de connexion'
   });
   
   app.use('/api/auth/login', loginLimiter);`, 'green');

  log('\n3. Correction du middleware JWT:', 'yellow');
  log(`   // Dans auth.js, ligne ~25
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user = await User.findById(decoded.userId); // Corriger ici`, 'green');

  return { issues, recommendations };
}

async function main() {
  await testDetailedVulnerabilities();
  await generateSecurityReport();
  
  log('\n🎯 PROCHAINES ÉTAPES', 'blue');
  log('1. Corrigez les vulnérabilités identifiées', 'yellow');
  log('2. Réexécutez les tests de sécurité', 'yellow');
  log('3. Implémentez une surveillance continue de la sécurité', 'yellow');
  log('4. Documentez les procédures de sécurité', 'yellow');
  
  log('\n✅ Analyse de sécurité terminée', 'green');
}

main().catch(console.error);
