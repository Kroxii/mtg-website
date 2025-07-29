#!/usr/bin/env node

// Script de test complet pour le Dashboard
console.log('🔍 Test du Dashboard MTG...\n');

import { promises as fs } from 'fs';
import path from 'path';

async function testDashboard() {
  console.log('📋 Vérification des composants Dashboard...');
  
  const clientSrc = path.join(process.cwd(), 'client', 'src');
  const checks = [];
  
  try {
    // 1. Vérifier que Dashboard.jsx existe et a les bons imports
    const dashboardPath = path.join(clientSrc, 'pages', 'Dashboard.jsx');
    const dashboardContent = await fs.readFile(dashboardPath, 'utf8');
    
    checks.push({
      name: 'Dashboard.jsx existe',
      status: true
    });
    
    checks.push({
      name: 'ServerStatus importé',
      status: dashboardContent.includes('import ServerStatus')
    });
    
    checks.push({
      name: 'Icon Server importé',
      status: dashboardContent.includes('Server') && dashboardContent.includes('lucide-react')
    });
    
    checks.push({
      name: 'Widget ServerStatus configuré',
      status: dashboardContent.includes("'ServerStatus'")
    });
    
    // 2. Vérifier App.jsx utilise le bon Dashboard
    const appPath = path.join(clientSrc, 'App.jsx');
    const appContent = await fs.readFile(appPath, 'utf8');
    
    checks.push({
      name: 'Dashboard importé dans App.jsx',
      status: appContent.includes('import Dashboard') && !appContent.includes('SimpleDashboard')
    });
    
    checks.push({
      name: 'Route Dashboard configurée',
      status: appContent.includes('<Dashboard />') && !appContent.includes('<SimpleDashboard />')
    });
    
    // 3. Vérifier les services API
    const apiPath = path.join(clientSrc, 'services', 'backendApi.js');
    const apiContent = await fs.readFile(apiPath, 'utf8');
    
    checks.push({
      name: 'Service getDashboardStats existe',
      status: apiContent.includes('getDashboardStats')
    });
    
    checks.push({
      name: 'Service getCollection existe',
      status: apiContent.includes('getCollection')
    });
    
    // 4. Vérifier les composants widgets
    const widgetPaths = [
      'components/widgets/StatsOverview.jsx',
      'components/ServerStatus.jsx',
      'components/DraggableWidget.jsx'
    ];
    
    for (const widgetPath of widgetPaths) {
      try {
        await fs.access(path.join(clientSrc, widgetPath));
        checks.push({
          name: `${widgetPath} existe`,
          status: true
        });
      } catch {
        checks.push({
          name: `${widgetPath} existe`,
          status: false
        });
      }
    }
    
    // 5. Vérifier les styles CSS
    const cssPath = path.join(clientSrc, 'pages', 'Dashboard.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');
    
    checks.push({
      name: 'Styles ServerStatus présents',
      status: cssContent.includes('.server-status')
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
  
  // Afficher les résultats
  console.log('\n📊 Résultats des vérifications:\n');
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (check.status) passed++;
  });
  
  console.log(`\n🎯 Score: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 Tous les tests sont passés ! Le Dashboard devrait fonctionner.');
  } else {
    console.log('\n⚠️  Certains problèmes ont été détectés.');
  }
  
  // Recommandations
  console.log('\n📋 Pour tester le Dashboard:');
  console.log('1. Ouvrir http://localhost:5174/dashboard');
  console.log('2. Se connecter si nécessaire');
  console.log('3. Vérifier la console du navigateur pour les logs');
  console.log('4. Regarder si les widgets s\'affichent correctement');
}

runTests().catch(console.error);

async function runTests() {
  await testDashboard();
}
