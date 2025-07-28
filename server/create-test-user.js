import User from './src/models/User.js';
import connectDB from './src/config/database.js';

// Connexion à la base de données
await connectDB();

console.log('Création d\'un utilisateur test...');

try {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email: 'test@example.com' });
  
  if (existingUser) {
    console.log('L\'utilisateur test existe déjà:', existingUser.email);
    process.exit(0);
  }

  // Créer un nouvel utilisateur
  const testUser = new User({
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: 'password123'
  });

  await testUser.save();
  console.log('Utilisateur test créé avec succès:', testUser.email);
  console.log('ID:', testUser._id);
  
} catch (error) {
  console.error('Erreur lors de la création de l\'utilisateur test:', error);
} finally {
  process.exit(0);
}
