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

  const retryConnection = async () => {
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

  if (loading) {
    return (
      <div className="server-status-widget">
        <div className="status-header">
          <div className="status-indicator connecting"></div>
          <span className="status-text connecting">Connexion...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="server-status-widget">
        <div className="status-header">
          <div className="status-indicator offline"></div>
          <span className="status-text offline">Hors ligne</span>
        </div>
        <div className="server-info">
          <p><strong>Erreur:</strong> {error}</p>
          <button onClick={retryConnection} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="server-status-widget">
      <div className="status-header">
        <div className="status-indicator online"></div>
        <span className="status-text online">Connecté</span>
      </div>
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
