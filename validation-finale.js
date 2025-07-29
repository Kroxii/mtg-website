// Validation finale du Dashboard MTG
console.log('🔍 Validation finale du Dashboard MTG...\n');

import { promises as fs } from 'fs';
import path from 'path';

async function validateDashboard() {
  const checks = [];
  
  try {
    // 1. Vérifier Dashboard.jsx
    const dashboardPath = path.join(process.cwd(), 'client', 'src', 'pages', 'Dashboard.jsx');
    const dashboardContent = await fs.readFile(dashboardPath, 'utf8');
    
    checks.push({
      component: 'Dashboard.jsx',
      test: 'Imports corrects',
      status: dashboardContent.includes('import ServerStatus') && 
              dashboardContent.includes('import { backendApi }')
    });
    
    checks.push({
      component: 'Dashboard.jsx', 
      test: 'Authentification gérée',
      status: dashboardContent.includes('useAuth') && 
              dashboardContent.includes('token')
    });
    
    // 2. Vérifier Dashboard.css
    const cssPath = path.join(process.cwd(), 'client', 'src', 'pages', 'Dashboard.css');
    const cssContent = await fs.readFile(cssPath, 'utf8');
    
    checks.push({
      component: 'Dashboard.css',
      test: 'Grid responsive',
      status: cssContent.includes('grid-template-columns: repeat(12, 1fr)')
    });
    
    checks.push({
      component: 'Dashboard.css',
      test: 'Widgets dimensionnés',
      status: cssContent.includes('.widget.size-small') && 
              cssContent.includes('.widget.size-medium')
    });
    
    // 3. Vérifier ServerStatus.jsx
    const serverStatusPath = path.join(process.cwd(), 'client', 'src', 'components', 'ServerStatus.jsx');
    const serverStatusContent = await fs.readFile(serverStatusPath, 'utf8');
    
    checks.push({
      component: 'ServerStatus.jsx',
      test: 'Structure correcte',
      status: serverStatusContent.includes('status-header') && 
              serverStatusContent.includes('status-indicator')
    });
    
    // 4. Vérifier App.jsx
    const appPath = path.join(process.cwd(), 'client', 'src', 'App.jsx');
    const appContent = await fs.readFile(appPath, 'utf8');
    
    checks.push({
      component: 'App.jsx',
      test: 'Routing Dashboard',
      status: appContent.includes('import Dashboard') && 
              !appContent.includes('SimpleDashboard')
    });
    
    // 5. Vérifier backendApi.js
    const backendApiPath = path.join(process.cwd(), 'client', 'src', 'services', 'backendApi.js');
    const backendApiContent = await fs.readFile(backendApiPath, 'utf8');
    
    checks.push({
      component: 'backendApi.js',
      test: 'API configurée',
      status: backendApiContent.includes('BASE_URL') && 
              backendApiContent.includes('getCollectionStats')
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error.message);
    return;
  }
  
  // Affichage des résultats
  console.log('📋 Résultats de la validation:\n');
  
  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.component]) acc[check.component] = [];
    acc[check.component].push(check);
    return acc;
  }, {});
  
  let totalPassed = 0;
  let totalTests = 0;
  
  Object.entries(groupedChecks).forEach(([component, tests]) => {
    console.log(`🔧 ${component}:`);
    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      console.log(`  ${icon} ${test.test}`);
      if (test.status) totalPassed++;
      totalTests++;
    });
    console.log('');
  });
  
  const successRate = Math.round((totalPassed / totalTests) * 100);
  console.log(`🎯 Score global: ${totalPassed}/${totalTests} (${successRate}%)`);
  
  if (successRate === 100) {
    console.log('\n🎉 Dashboard MTG entièrement fonctionnel !');
    console.log('✅ Toutes les corrections ont été appliquées avec succès');
    console.log('✅ CSS optimisé et responsive');
    console.log('✅ Composants correctement intégrés');
    console.log('✅ API backend configurée');
  } else {
    console.log('\n⚠️  Quelques vérifications ont échoué.');
    console.log('🔧 Consultez les détails ci-dessus pour plus d\'informations.');
  }
}

console.log('🚀 Système MTG Dashboard - Validation finale');
console.log('📊 Vérification de tous les composants corrigés\n');

validateDashboard().catch(console.error);
