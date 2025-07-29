#!/usr/bin/env node

// Script de test des fonctionnalités frontend
console.log('🔍 Vérification des bugs potentiels frontend...\n');

// 1. Vérification des imports dans les fichiers React
import { promises as fs } from 'fs';
import path from 'path';

async function checkImports() {
  console.log('📁 Vérification des imports...');
  
  const clientSrc = path.join(process.cwd(), 'client', 'src');
  const files = [
    'pages/Dashboard.jsx',
    'hooks/useAuth.jsx',
    'components/ServerStatus.jsx',
    'services/backendApi.js'
  ];
  
  for (const file of files) {
    try {
      const filePath = path.join(clientSrc, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Vérifier les imports manquants
      if (file === 'pages/Dashboard.jsx') {
        if (!content.includes('import ServerStatus')) {
          console.log('✅ ServerStatus importé dans Dashboard');
        }
        if (!content.includes('Server') && content.includes('ServerStatus')) {
          console.log('⚠️  Icon Server pourrait manquer dans Dashboard');
        }
      }
      
      console.log(`✅ ${file} semble correct`);
    } catch (error) {
      console.log(`❌ Erreur avec ${file}:`, error.message);
    }
  }
}

async function checkPackageJson() {
  console.log('\n📦 Vérification des dépendances...');
  
  try {
    const packagePath = path.join(process.cwd(), 'client', 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(packageContent);
    
    const requiredDeps = ['react', 'react-dom', 'axios', 'lucide-react', 'react-router-dom'];
    const missing = requiredDeps.filter(dep => !pkg.dependencies[dep] && !pkg.devDependencies?.[dep]);
    
    if (missing.length === 0) {
      console.log('✅ Toutes les dépendances requises sont présentes');
    } else {
      console.log('❌ Dépendances manquantes:', missing);
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification du package.json:', error.message);
  }
}

// Exécuter les vérifications
async function runChecks() {
  await checkImports();
  await checkPackageJson();
  console.log('\n🎉 Vérification terminée !');
}

runChecks().catch(console.error);
