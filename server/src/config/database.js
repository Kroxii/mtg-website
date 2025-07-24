import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Tentative de connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mtg_collection';
    
    console.log('🔄 Tentative de connexion à MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB non disponible:', error.message);
    console.log('📁 Le serveur continuera à fonctionner sans base de données persistante');
    
    // Ne pas arrêter le serveur, continuer sans MongoDB
    return false;
  }
};

export default connectDB;
