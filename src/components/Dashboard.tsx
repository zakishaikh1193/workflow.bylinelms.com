import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { useApp } from '../contexts/AppContext';
import { dashboardService } from '../services/apiService';
// import { calculateProjectProgress } from '../utils/progressCalculator';

export function Dashboard() {
  const { state, dispatch } = useApp();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await dashboardService.getOverview();
        
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Dashboard fetch error:', err);
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatClick = (view: string, filter?: any) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: view as any });
    if (filter) {
      dispatch({ type: 'SET_FILTERS', payload: filter });
    }
  };

  // Get data from dashboard service
  const projects = dashboardData?.projects || [];
  const teamMembers = dashboardData?.teamMembers || [];
  const allTasks = dashboardData?.tasks || [];
  
  // Calculate task counts for different time periods
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  
  const todayTasks = allTasks.filter((task: any) => {
    const taskDate = new Date(task.end_date);
    return taskDate.toDateString() === today.toDateString() && task.status !== 'completed';
  });
  
  const tomorrowTasks = allTasks.filter((task: any) => {
    const taskDate = new Date(task.end_date);
    return taskDate.toDateString() === tomorrow.toDateString() && task.status !== 'completed';
  });
  
  const thisWeekTasks = allTasks.filter((task: any) => {
    const taskDate = new Date(task.end_date);
    return taskDate >= today && taskDate <= weekFromNow && task.status !== 'completed';
  });

  const handleUserClick = (userId: string) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' });
    dispatch({ type: 'SET_FILTERS', payload: { teamMembers: [userId] } });
  };

  // This function will be called after data is loaded

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your project management activities</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your project management activities</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use backend data instead of context state  
  const stats_data = dashboardData?.stats || {};

  // Create stats array with real backend data
  const stats = [
    {
      title: 'Total Projects',
      value: stats_data.totalProjects || 0,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => handleStatClick('projects'),
    },
    {
      title: 'Active Projects',
      value: stats_data.activeProjects || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      onClick: () => handleStatClick('projects', { statuses: ['active'] }),
    },
    {
      title: 'Team Members',
      value: stats_data.totalTeamMembers || 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      onClick: () => handleStatClick('teams'),
    },
    {
      title: 'Categories',
      value: stats_data.totalCategories || 0,
      icon: CheckSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      onClick: () => handleStatClick('settings'),
    },
  ];

  return (
    <div className="relative min-h-screen p-6 space-y-8 bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-white/80">Overview of your project management activities</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-white/70">Projects</p>
                <p className="text-xl font-semibold">{stats_data.totalProjects || 0}</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-white/70">Team</p>
                <p className="text-xl font-semibold">{stats_data.totalTeamMembers || 0}</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-white/70">Categories</p>
                <p className="text-xl font-semibold">{stats_data.totalCategories || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5" onClick={stat.onClick}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2.5 rounded-xl ring-1 ring-inset ring-gray-200 ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <span>Click to view details</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Due Dates Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
          onClick={() => handleStatClick('tasks', { dueToday: true })}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-red-600">{todayTasks.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Click to view tasks</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
          onClick={() => handleStatClick('tasks', { dueTomorrow: true })}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Tomorrow</p>
                <p className="text-2xl font-bold text-orange-600">{tomorrowTasks.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Click to view tasks</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
          onClick={() => handleStatClick('tasks', { dueThisWeek: true })}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-blue-600">{thisWeekTasks.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Click to view tasks</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStatClick('projects')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.slice(0, 5).map((project: any) => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleStatClick('projects')}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.category_name || project.category}</p>
                  <ProgressBar value={project.progress || 0} className="mt-2" />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    project.status === 'active' ? 'primary' :
                    project.status === 'completed' ? 'success' :
                    project.status === 'on-hold' ? 'warning' : 'default'
                  }>
                    {project.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Team Workload</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleStatClick('teams')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.slice(0, 6).map((member: any) => {
              const memberTasks = allTasks.filter((t: any) => t.assignees && t.assignees.includes(member.id));
              const completedTasks = memberTasks.filter((t: any) => t.status === 'completed').length;
              const workloadPercentage = memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0;
              
              return (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-white hover:shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(member.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.skills?.[0] || 'No skills'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{memberTasks.length} tasks</span>
                    <ProgressBar 
                      value={workloadPercentage} 
                      className="w-20" 
                      showLabel={false}
                      variant={workloadPercentage > 80 ? 'warning' : 'default'}
                    />
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'projects' })}
              className="p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <FolderOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Create New Project</p>
            </button>
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'teams' })}
              className="p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Add Team Member</p>
            </button>
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' })}
              className="p-4 rounded-lg bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <CheckSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Create Task</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}