#!/usr/bin/env node

/**
 * Script de nettoyage du projet MTG Collection Manager
 * Supprime les fichiers temporaires et de développement
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧹 Nettoyage du projet MTG Collection Manager...\n');

const toClean = [
  // Dossiers de cache
  '.vite',
  '.cache',
  'temp',
  'tmp',
  
  // Logs
  '*.log',
  'logs',
  
  // Fichiers de build
  'dist',
  'build',
  
  // Node modules (seront réinstallés si nécessaire)
  // 'node_modules' - décommenté pour éviter de supprimer lors du nettoyage léger
];

const patterns = [
  'test-*.js',
  'test-*.html',
  '*-test.js',
  'validation-*.js',
  'check-*.js'
];

try {
  // Nettoyage des dossiers
  toClean.forEach(item => {
    if (fs.existsSync(item)) {
      console.log(`🗑️  Suppression: ${item}`);
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${item}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${item}"`, { stdio: 'ignore' });
      }
    }
  });

  // Nettoyage des patterns de fichiers
  patterns.forEach(pattern => {
    try {
      if (process.platform === 'win32') {
        execSync(`del /q ${pattern}`, { stdio: 'ignore' });
      } else {
        execSync(`rm -f ${pattern}`, { stdio: 'ignore' });
      }
      console.log(`🗑️  Nettoyage pattern: ${pattern}`);
    } catch (e) {
      // Ignorer si aucun fichier ne correspond au pattern
    }
  });

  // Nettoyage des node_modules et reinstall (optionnel)
  if (process.argv.includes('--deep')) {
    console.log('🔄 Nettoyage profond - Réinstallation des dépendances...');
    
    ['client', 'server', '.'].forEach(dir => {
      const nmPath = path.join(dir, 'node_modules');
      if (fs.existsSync(nmPath)) {
        console.log(`🗑️  Suppression: ${dir}/node_modules`);
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${nmPath}"`, { stdio: 'ignore' });
        } else {
          execSync(`rm -rf "${nmPath}"`, { stdio: 'ignore' });
        }
      }
    });

    console.log('📦 Réinstallation des dépendances...');
    execSync('npm run install:all', { stdio: 'inherit' });
  }

  console.log('\n✅ Nettoyage terminé!');
  console.log('\n💡 Utilisation:');
  console.log('   node cleanup.js         - Nettoyage léger');
  console.log('   node cleanup.js --deep  - Nettoyage profond + réinstall');

} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  process.exit(1);
}
