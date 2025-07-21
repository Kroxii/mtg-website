import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Pour l'instant, utilisons une base de données locale
    // En production, utilisez une vraie base de données MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mtg_collection';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    
    // Utiliser un système de fichiers simple si MongoDB n'est pas disponible
    console.log('📁 Utilisation du système de fichiers pour le stockage des données');
    
    // Ne pas arrêter le serveur, continuer avec le système de fichiers
    return;
  }
};

export default connectDB;
