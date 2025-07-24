import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { backendApi } from '../services/backendApi.js';
import SimpleWidget from '../components/SimpleWidget.jsx';
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

const SimpleDashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const widgets = [
    { id: 'overview', title: 'Vue d\'ensemble', icon: BarChart3, component: 'StatsOverview', size: 'large' },
    { id: 'color-distribution', title: 'Répartition par couleurs', icon: PieChart, component: 'ColorDistributionChart', size: 'medium' },
    { id: 'type-distribution', title: 'Répartition par types', icon: PieChart, component: 'TypeDistributionChart', size: 'medium' },
    { id: 'cmc-distribution', title: 'Répartition par CMC', icon: BarChart3, component: 'CMCDistributionChart', size: 'medium' },
    { id: 'growth-chart', title: 'Évolution de la collection', icon: TrendingUp, component: 'CollectionGrowthChart', size: 'large' },
    { id: 'top-extensions', title: 'Extensions principales', icon: Library, component: 'TopExtensions', size: 'small' },
    { id: 'recent-additions', title: 'Ajouts récents', icon: Clock, component: 'RecentAdditions', size: 'medium' },
    { id: 'collection-comparison', title: 'Comparaison collections', icon: Users, component: 'CollectionComparison', size: 'medium' }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching dashboard stats...');
        const response = await backendApi.getDashboardStats();
        
        if (response.success) {
          console.log('Dashboard stats received:', response.data);
          setDashboardStats(response.data);
        } else {
          console.error('Error in dashboard response:', response.error);
          setError(response.error || 'Erreur lors du chargement des statistiques');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
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
          <SimpleWidget key={widget.id} widget={widget}>
            {renderWidget(widget)}
          </SimpleWidget>
        ))}
      </div>
    </div>
  );
};

export default SimpleDashboard;
