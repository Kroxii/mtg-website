import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { backendApi } from '../services/backendApi.js';
import DraggableWidget from '../components/DraggableWidget.jsx';
import ServerStatus from '../components/ServerStatus.jsx';
import ColorDistributionChart from '../components/charts/ColorDistributionChart.jsx';
import TypeDistributionChart from '../components/charts/TypeDistributionChart.jsx';
import CMCDistributionChart from '../components/charts/CMCDistributionChart.jsx';
import ExtensionDistributionChart from '../components/charts/ExtensionDistributionChart.jsx';
import CollectionGrowthChart from '../components/charts/CollectionGrowthChart.jsx';
import StatsOverview from '../components/widgets/StatsOverview.jsx';
import TopExtensions from '../components/widgets/TopExtensions.jsx';
import RecentAdditions from '../components/widgets/RecentAdditions.jsx';
import CollectionComparison from '../components/widgets/CollectionComparison.jsx';
import { BarChart3, PieChart, TrendingUp, Users, Library, Clock, Server } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [collectionData, setCollectionData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([
    { id: 'server-status', title: 'État du serveur', icon: Server, component: 'ServerStatus', position: { x: 0, y: 0 }, size: 'small' },
    { id: 'overview', title: 'Vue d\'ensemble', icon: BarChart3, component: 'StatsOverview', position: { x: 1, y: 0 }, size: 'large' },
    { id: 'color-distribution', title: 'Répartition par couleurs', icon: PieChart, component: 'ColorDistributionChart', position: { x: 2, y: 0 }, size: 'medium' },
    { id: 'type-distribution', title: 'Répartition par types', icon: PieChart, component: 'TypeDistributionChart', position: { x: 0, y: 1 }, size: 'medium' },
    { id: 'cmc-distribution', title: 'Répartition par CMC', icon: BarChart3, component: 'CMCDistributionChart', position: { x: 1, y: 1 }, size: 'medium' },
    { id: 'growth-chart', title: 'Évolution de la collection', icon: TrendingUp, component: 'CollectionGrowthChart', position: { x: 0, y: 2 }, size: 'large' },
    { id: 'top-extensions', title: 'Extensions principales', icon: Library, component: 'TopExtensions', position: { x: 1, y: 2 }, size: 'small' },
    { id: 'recent-additions', title: 'Ajouts récents', icon: Clock, component: 'RecentAdditions', position: { x: 0, y: 3 }, size: 'medium' },
    { id: 'collection-comparison', title: 'Comparaison collections', icon: Users, component: 'CollectionComparison', position: { x: 1, y: 3 }, size: 'medium' }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Chargement des données du dashboard...');
        console.log('👤 Utilisateur connecté:', user);
        
        // Récupérer les données de la collection
        console.log('📊 Récupération des collections...');
        const collectionResponse = await backendApi.getCollection();
        console.log('📊 Réponse collections:', collectionResponse);
        if (collectionResponse.success) {
          setCollectionData(collectionResponse.collections);
        } else {
          console.error('❌ Erreur collections:', collectionResponse.error);
        }

        // Récupérer les statistiques du tableau de bord
        console.log('📈 Récupération des stats...');
        const statsResponse = await backendApi.getDashboardStats();
        console.log('📈 Réponse stats:', statsResponse);
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        } else {
          console.error('❌ Erreur stats:', statsResponse.error);
          // En cas d'erreur, utiliser des données par défaut pour le développement
          setDashboardStats({
            totalCards: 0,
            uniqueSets: 0,
            estimatedValue: 0,
            monthlyAdditions: 0,
            colorDistribution: [],
            typeDistribution: [],
            cmcDistribution: []
          });
        }

      } catch (error) {
        console.error('❌ Erreur lors du chargement des données du tableau de bord:', error);
        // Données par défaut en cas d'erreur
        setDashboardStats({
          totalCards: 0,
          uniqueSets: 0,
          estimatedValue: 0,
          monthlyAdditions: 0,
          colorDistribution: [],
          typeDistribution: [],
          cmcDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      console.log('⚠️ Pas d\'utilisateur connecté');
      setLoading(false);
    }
  }, [user]);

  const updateWidgetPosition = (widgetId, newPosition) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    ));
  };

  const renderWidget = (widget) => {
    const componentMap = {
      ServerStatus: <ServerStatus />,
      StatsOverview: <StatsOverview data={dashboardStats} />,
      ColorDistributionChart: <ColorDistributionChart data={dashboardStats?.colorDistribution} />,
      TypeDistributionChart: <TypeDistributionChart data={dashboardStats?.typeDistribution} />,
      CMCDistributionChart: <CMCDistributionChart data={dashboardStats?.cmcDistribution} />,
      CollectionGrowthChart: <CollectionGrowthChart data={dashboardStats?.growthData} />,
      TopExtensions: <TopExtensions data={dashboardStats?.topExtensions} />,
      RecentAdditions: <RecentAdditions data={dashboardStats?.recentAdditions} />,
      CollectionComparison: <CollectionComparison data={dashboardStats?.comparisonData} />
    };

    return componentMap[widget.component] || <div>Widget non trouvé</div>;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Accès non autorisé</h2>
        <p>Vous devez être connecté pour voir le tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Collection MTG</h1>
        <p>Tableau de bord de {user?.username}</p>
      </div>

      <div className="dashboard-grid">
        {widgets.map(widget => (
          <div 
            key={widget.id}
            className="widget"
            data-id={widget.id}
          >
            <div className="widget-header">
              <widget.icon className="widget-icon" />
              <h3 className="widget-title">{widget.title}</h3>
            </div>
            <div className={`widget-content ${loading ? 'loading' : ''}`}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Chargement...</div>
                </>
              ) : (
                renderWidget(widget)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
