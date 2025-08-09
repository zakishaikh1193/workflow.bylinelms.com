import React from 'react';
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { useApp } from '../contexts/AppContext';
import { calculateProjectProgress } from '../utils/progressCalculator';

export function Dashboard() {
  const { state, dispatch } = useApp();

  const handleStatClick = (view: string, filter?: any) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: view as any });
    if (filter) {
      dispatch({ type: 'SET_FILTERS', payload: filter });
    }
  };

  const handleUserClick = (userId: string) => {
    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' });
    dispatch({ type: 'SET_FILTERS', payload: { teamMembers: [userId] } });
  };

  // Get fresh task data for calculations
  const allTasks = state.tasks || [];
  
  const isOverdue = (task: any) => {
    return new Date(task.endDate) < new Date() && task.status !== 'completed';
  };

  const isDueToday = (task: any) => {
    const today = new Date();
    const dueDate = new Date(task.endDate);
    return today.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueTomorrow = (task: any) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.endDate);
    return tomorrow.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueThisWeek = (task: any) => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    const dueDate = new Date(task.endDate);
    return dueDate >= today && dueDate <= weekFromNow && task.status !== 'completed';
  };

  const overdueTasks = allTasks.filter(isOverdue);
  const todayTasks = allTasks.filter(isDueToday);
  const tomorrowTasks = allTasks.filter(isDueTomorrow);
  const thisWeekTasks = allTasks.filter(isDueThisWeek);

  const stats = [
    {
      title: 'Active Projects',
      value: state.projects.filter(p => p.status === 'active').length,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => handleStatClick('projects', { statuses: ['active'] }),
    },
    {
      title: 'Team Members',
      value: state.users.length,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      onClick: () => handleStatClick('teams'),
    },
    {
      title: 'Open Tasks',
      value: allTasks.filter(t => t.status !== 'completed').length,
      icon: CheckSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      onClick: () => handleStatClick('tasks', { statuses: ['not-started', 'in-progress', 'under-review', 'blocked'] }),
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      onClick: () => handleStatClick('tasks', { overdue: true }),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your project management activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={stat.onClick}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
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
          className="hover:shadow-md transition-shadow cursor-pointer"
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
          className="hover:shadow-md transition-shadow cursor-pointer"
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
          className="hover:shadow-md transition-shadow cursor-pointer"
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
        <Card>
          <CardHeader>
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
          <CardContent className="space-y-4">
            {state.projects.slice(0, 5).map((project) => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleStatClick('projects')}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.category}</p>
                  <ProgressBar value={calculateProjectProgress(project, state.tasks).progress} className="mt-2" />
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
        <Card>
          <CardHeader>
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
          <CardContent className="space-y-4">
            {state.users.slice(0, 6).map((user) => {
              const userTasks = allTasks.filter(t => t.assignees.includes(user.id));
              const completedTasks = userTasks.filter(t => t.status === 'completed').length;
              const workloadPercentage = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;
              
              return (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.skills[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{userTasks.length} tasks</span>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'projects' })}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Create New Project</p>
            </button>
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'teams' })}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Add Team Member</p>
            </button>
            <button 
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' })}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <CheckSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Create Task</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}