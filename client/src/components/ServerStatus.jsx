import { useState, useEffect } from 'react';
import { authApi } from '../utils/localApi';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        const health = await authApi.checkHealth();
        setServerStatus(health);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkServerHealth();
  }, []);

  const retryConnection = () => {
    setLoading(true);
    setError(null);
    checkServerHealth();
  };

  if (loading) {
    return (
      <div className="server-status loading">
        <span>🔄 Vérification de la connexion au serveur...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="server-status error">
        <span>❌ Erreur de connexion au serveur: {error}</span>
        <button onClick={retryConnection} className="retry-btn">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="server-status success">
      <span>✅ Serveur connecté</span>
      <div className="server-info">
        <p><strong>Status:</strong> {serverStatus.status}</p>
        <p><strong>Message:</strong> {serverStatus.message}</p>
        <p><strong>Version:</strong> {serverStatus.version}</p>
        <p><strong>Timestamp:</strong> {new Date(serverStatus.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ServerStatus;
