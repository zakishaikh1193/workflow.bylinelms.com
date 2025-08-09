import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { useApp } from '../contexts/AppContext';

export function Analytics() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Calculate analytics data
  const analytics = {
    projectStats: {
      total: state.projects.length,
      active: state.projects.filter(p => p.status === 'active').length,
      completed: state.projects.filter(p => p.status === 'completed').length,
      onHold: state.projects.filter(p => p.status === 'on-hold').length,
    },
    taskStats: {
      total: state.tasks.length,
      completed: state.tasks.filter(t => t.status === 'completed').length,
      inProgress: state.tasks.filter(t => t.status === 'in-progress').length,
      overdue: state.tasks.filter(t => new Date(t.endDate) < new Date() && t.status !== 'completed').length,
    },
    teamStats: {
      total: state.users.length,
      active: state.users.filter(u => state.tasks.some(t => t.assignees.includes(u.id) && t.status !== 'completed')).length,
      available: state.users.filter(u => !state.tasks.some(t => t.assignees.includes(u.id) && t.status !== 'completed')).length,
    },
    productivity: {
      completionRate: state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.status === 'completed').length / state.tasks.length) * 100) : 0,
      averageProgress: state.projects.length > 0 ? Math.round(state.projects.reduce((sum, p) => sum + p.progress, 0) / state.projects.length) : 0,
    }
  };

  const categoryDistribution = state.categories.map(category => ({
    name: category,
    count: state.projects.filter(p => p.category === category).length,
    percentage: state.projects.length > 0 ? Math.round((state.projects.filter(p => p.category === category).length / state.projects.length) * 100) : 0,
  }));

  const skillUtilization = state.skills.map(skill => ({
    name: skill,
    users: state.users.filter(u => u.skills.includes(skill)).length,
    activeTasks: state.tasks.filter(t => t.skills.includes(skill) && t.status !== 'completed').length,
  }));

  const topPerformers = state.users.map(user => {
    const userTasks = state.tasks.filter(t => t.assignees.includes(user.id));
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
    
    return {
      ...user,
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
    };
  }).sort((a, b) => b.completionRate - a.completionRate).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and performance metrics for your projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Project Completion</p>
                <p className="text-3xl font-bold">{analytics.productivity.completionRate}%</p>
                <p className="text-blue-100 text-sm">Average progress</p>
              </div>
              <Target className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Projects</p>
                <p className="text-3xl font-bold">{analytics.projectStats.active}</p>
                <p className="text-green-100 text-sm">of {analytics.projectStats.total} total</p>
              </div>
              <Activity className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Team Utilization</p>
                <p className="text-3xl font-bold">{analytics.teamStats.active}</p>
                <p className="text-orange-100 text-sm">of {analytics.teamStats.total} members</p>
              </div>
              <Users className="w-12 h-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Overdue Tasks</p>
                <p className="text-3xl font-bold">{analytics.taskStats.overdue}</p>
                <p className="text-red-100 text-sm">Need attention</p>
              </div>
              <Clock className="w-12 h-12 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32">
                    <ProgressBar 
                      value={analytics.projectStats.total > 0 ? (analytics.projectStats.active / analytics.projectStats.total) * 100 : 0} 
                      variant="primary" 
                      showLabel={false} 
                    />
                  </div>
                  <span className="text-sm text-gray-600">{analytics.projectStats.active}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Completed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32">
                    <ProgressBar 
                      value={analytics.projectStats.total > 0 ? (analytics.projectStats.completed / analytics.projectStats.total) * 100 : 0} 
                      variant="success" 
                      showLabel={false} 
                    />
                  </div>
                  <span className="text-sm text-gray-600">{analytics.projectStats.completed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">On Hold</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32">
                    <ProgressBar 
                      value={analytics.projectStats.total > 0 ? (analytics.projectStats.onHold / analytics.projectStats.total) * 100 : 0} 
                      variant="warning" 
                      showLabel={false} 
                    />
                  </div>
                  <span className="text-sm text-gray-600">{analytics.projectStats.onHold}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Projects by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryDistribution.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32">
                    <ProgressBar 
                      value={category.percentage} 
                      showLabel={false} 
                    />
                  </div>
                  <span className="text-sm text-gray-600">{category.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.completedTasks}/{user.totalTasks} tasks completed</p>
                  </div>
                </div>
                <Badge 
                  variant={user.completionRate >= 80 ? 'success' : user.completionRate >= 60 ? 'primary' : 'warning'}
                >
                  {user.completionRate}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skill Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Skill Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillUtilization.slice(0, 6).map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{skill.name}</p>
                  <p className="text-sm text-gray-600">{skill.activeUsers}/{skill.users} active members</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{skill.activeTasks}</p>
                  <p className="text-sm text-gray-600">active tasks</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Task Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Task Timeline Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analytics.taskStats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.taskStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.taskStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.taskStats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}