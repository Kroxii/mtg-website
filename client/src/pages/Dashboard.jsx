import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { backendApi } from '../services/backendApi.js';
import DraggableWidget from '../components/DraggableWidget.jsx';
import ColorDistributionChart from '../components/charts/ColorDistributionChart.jsx';
import TypeDistributionChart from '../components/charts/TypeDistributionChart.jsx';
import CMCDistributionChart from '../components/charts/CMCDistributionChart.jsx';
import ExtensionDistributionChart from '../components/charts/ExtensionDistributionChart.jsx';
import CollectionGrowthChart from '../components/charts/CollectionGrowthChart.jsx';
import StatsOverview from '../components/widgets/StatsOverview.jsx';
import TopExtensions from '../components/widgets/TopExtensions.jsx';
import RecentAdditions from '../components/widgets/RecentAdditions.jsx';
import CollectionComparison from '../components/widgets/CollectionComparison.jsx';
import { BarChart3, PieChart, TrendingUp, Users, Library, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [collectionData, setCollectionData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([
    { id: 'overview', title: 'Vue d\'ensemble', icon: BarChart3, component: 'StatsOverview', position: { x: 0, y: 0 }, size: 'large' },
    { id: 'color-distribution', title: 'Répartition par couleurs', icon: PieChart, component: 'ColorDistributionChart', position: { x: 1, y: 0 }, size: 'medium' },
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
        
        // Récupérer les données de la collection
        const collectionResponse = await backendApi.getCollection();
        setCollectionData(collectionResponse.data);

        // Récupérer les statistiques du tableau de bord
        const statsResponse = await backendApi.getDashboardStats();
        setDashboardStats(statsResponse.data);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p>Bienvenue, {user?.username}</p>
      </div>

      <div className="dashboard-grid">
        {widgets.map(widget => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            onPositionChange={updateWidgetPosition}
          >
            <div className="widget-header">
              <widget.icon size={20} />
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {renderWidget(widget)}
            </div>
          </DraggableWidget>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
