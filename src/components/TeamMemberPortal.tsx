import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Award,
  Flag,
  MessageSquare,
  TrendingUp,
  User,
  LogOut,
  CheckCircle,
  XCircle,
  RefreshCw,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { teamTaskService, teamProjectService, teamService, performanceFlagService } from '../services/apiService';
import type { Task, User as UserType } from '../types';

interface TeamMemberPortalProps {
  user: UserType;
  onLogout: () => void;
}

export function TeamMemberPortal({ user, onLogout }: TeamMemberPortalProps) {
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionDate, setExtensionDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [remarkContent, setRemarkContent] = useState('');
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarkType, setRemarkType] = useState('general');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceFlags, setPerformanceFlags] = useState<any[]>([]);

  // Load user's data
  useEffect(() => {
    loadUserData();
  }, [user.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user's tasks, projects, and performance flags using team-specific APIs
      const [tasksData, projectsData, flagsData] = await Promise.all([
        teamService.getMyTasks(),
        teamProjectService.getAll(),
        performanceFlagService.getByTeamMember(user.id)
      ]);
      
      setUserTasks(tasksData);
      setUserProjects(projectsData);
      setPerformanceFlags(flagsData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Filter tasks
  const activeTasks = userTasks.filter(task => task.status !== 'completed');
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const overdueTasks = userTasks.filter(task => 
    task.end_date && new Date(task.end_date) < new Date() && task.status !== 'completed'
  );

  // Performance metrics
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
  const onTimeCompletions = completedTasks.filter(task => 
    task.updated_at && task.end_date && new Date(task.updated_at) <= new Date(task.end_date)
  ).length;

  const handleMarkComplete = async (taskId: string) => {
    try {
      await teamTaskService.update(taskId, { 
        status: 'completed', 
        progress: 100,
        actual_hours: 0 // You might want to add actual hours tracking
      });
      
      // Refresh data
      await loadUserData();
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const handleRequestExtension = (task: Task) => {
    setSelectedTask(task);
    setIsExtensionModalOpen(true);
  };

  const handleAddRemark = (task: Task) => {
    setSelectedTask(task);
    setIsRemarkModalOpen(true);
  };

  const submitExtensionRequest = async () => {
    if (selectedTask) {
      try {
        // Request extension using the new API
        await teamTaskService.requestExtension(selectedTask.id, {
          requested_due_date: extensionDate, // This will be the new date
          reason: extensionReason
        });
        
        // Refresh data
        await loadUserData();
      } catch (error) {
        console.error('Failed to submit extension request:', error);
      }
    }
    
    setIsExtensionModalOpen(false);
    setSelectedTask(null);
    setExtensionReason('');
    setExtensionDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Reset to 7 days from now
  };

  const submitRemark = async () => {
    if (selectedTask) {
      try {
        // Add remark using the new API
        await teamTaskService.addRemark(selectedTask.id, {
          remark: remarkContent,
          remark_date: remarkDate,
          remark_type: remarkType
        });
        
        // Refresh data
        await loadUserData();
      } catch (error) {
        console.error('Failed to add remark:', error);
      }
    }
    
    setIsRemarkModalOpen(false);
    setSelectedTask(null);
    setRemarkContent('');
    setRemarkDate(new Date().toISOString().split('T')[0]);
    setRemarkType('general');
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.end_date) return false;
    
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the end date at midnight (start of day)
    const dueDate = new Date(task.end_date);
    dueDate.setHours(0, 0, 0, 0);
    
    // Task is overdue if due date is before today AND not completed
    return dueDate < today && task.status !== 'completed';
  };

  const getDaysUntilDue = (task: Task) => {
    if (!task.end_date) return 0;
    const today = new Date();
    const dueDate = new Date(task.end_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-600">
                  {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Team Member'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshData}
                loading={refreshing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" onClick={() => {
                localStorage.removeItem('teamToken');
                onLogout();
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-400 bg-opacity-20">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-blue-100 text-sm font-medium">Active Tasks</p>
                  <p className="text-2xl font-bold">{activeTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-400 bg-opacity-20">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-400 bg-opacity-20">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-red-100 text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold">{overdueTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-400 bg-opacity-20">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Flags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Performance Flags */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-800">
                <Flag className="w-5 h-5 mr-2 text-purple-600" />
                My Performance Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceFlags.length === 0 ? (
                <div className="text-center py-8">
                  <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No performance flags</p>
                  <p className="text-sm text-gray-400 mt-1">Keep up the great work!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Flag Counts Summary */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {performanceFlags.filter(f => f.type === 'green').length}
                      </div>
                      <div className="text-xs text-green-600 font-medium">🟢 Green Flags</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">
                        {performanceFlags.filter(f => f.type === 'yellow').length}
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">🟡 Yellow Flags</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-700">
                        {performanceFlags.filter(f => f.type === 'orange').length}
                      </div>
                      <div className="text-xs text-orange-600 font-medium">🟠 Orange Flags</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">
                        {performanceFlags.filter(f => f.type === 'red').length}
                      </div>
                      <div className="text-xs text-red-600 font-medium">🔴 Red Flags</div>
                    </div>
                  </div>

                  {/* Recent Flags */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Flags:</h4>
                    <div className="space-y-2">
                      {performanceFlags.slice(0, 3).map((flag, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <Badge variant={
                              flag.type === 'green' ? 'success' :
                              flag.type === 'yellow' ? 'warning' :
                              flag.type === 'orange' ? 'warning' : 'danger'
                            } size="sm" className="shadow-sm">
                              <Flag className="w-3 h-3 mr-1" />
                              {flag.type.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{flag.reason}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(flag.created_at).toLocaleDateString()} by {flag.added_by}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Completions */}
          <Card className="bg-gradient-to-br from-white to-green-50 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-800">
                <Award className="w-5 h-5 mr-2 text-green-600" />
                Recent Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No completed tasks yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start working on your tasks!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedTasks.slice(0, 5).map(task => {
                    const project = userProjects.find(p => p.id === task.project_id);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.name}</p>
                          <p className="text-xs text-gray-600">{project?.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks Section - Full Width */}
        <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckSquare className="w-6 h-6 mr-3 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">My Active Tasks</span>
              </div>
              <Badge variant="primary" className="text-sm font-semibold px-3 py-1">
                {activeTasks.length} tasks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <CheckSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Tasks</h3>
                <p className="text-gray-600 text-lg">You're all caught up! No tasks are currently assigned to you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTasks.map(task => {
                  const project = userProjects.find(p => p.id === task.project_id);
                  const daysUntilDue = getDaysUntilDue(task);
                  const isOverdue = isTaskOverdue(task);
                  
                  return (
                    <div key={task.id} className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                      isOverdue ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-red-100' : 
                      'border-gray-200 bg-white hover:border-blue-400 shadow-lg'
                    }`}>
                      {/* Priority indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-2 ${
                        task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        task.priority === 'medium' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                        'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`} />
                      
                      <div className="p-6 pt-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {task.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{project?.name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{task.stage_name || 'No Stage'}</span>
                              {task.category_name && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{task.category_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            {isOverdue && (
                              <Badge variant="danger" size="sm" className="animate-pulse shadow-lg">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                            <div className="flex items-center space-x-1">
                              <Badge variant={
                                task.priority === 'urgent' ? 'danger' :
                                task.priority === 'high' ? 'warning' :
                                task.priority === 'medium' ? 'primary' : 'default'
                              } size="sm" className="shadow-sm">
                                {task.priority}
                              </Badge>
                              <Badge variant={
                                task.status === 'in-progress' ? 'primary' :
                                task.status === 'under-review' ? 'warning' :
                                task.status === 'blocked' ? 'danger' : 'default'
                              } size="sm" className="shadow-sm">
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-sm text-gray-700 mb-5 line-clamp-2 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">{task.description}</p>
                        )}

                        {/* Progress Section */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-gray-700 font-semibold">Progress</span>
                            <span className="font-bold text-gray-900 text-lg">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                                task.progress >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                task.progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                task.progress >= 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Educational Hierarchy */}
                        {(task.grade_name || task.book_name || task.unit_name || task.lesson_name) && (
                          <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center mb-3">
                              <Target className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="text-sm font-bold text-blue-900">Educational Hierarchy</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {task.grade_name && (
                                <Badge variant="primary" className="text-xs bg-blue-100 text-blue-800 border-2 border-blue-200 font-semibold">
                                  {task.grade_name}
                                </Badge>
                              )}
                              {task.book_name && (
                                <Badge variant="primary" className="text-xs bg-indigo-100 text-indigo-800 border-2 border-indigo-200 font-semibold">
                                  {task.book_name}
                                </Badge>
                              )}
                              {task.unit_name && (
                                <Badge variant="primary" className="text-xs bg-purple-100 text-purple-800 border-2 border-purple-200 font-semibold">
                                  {task.unit_name}
                                </Badge>
                              )}
                              {task.lesson_name && (
                                <Badge variant="primary" className="text-xs bg-pink-100 text-pink-800 border-2 border-pink-200 font-semibold">
                                  {task.lesson_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        {task.required_skills && task.required_skills.length > 0 && (
                          <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                            <div className="flex items-center mb-3">
                              <Activity className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-sm font-bold text-green-900">Required Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {task.required_skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 border-2 border-green-200 font-semibold">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Time & Hours Info */}
                        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1 font-medium">Due Date</div>
                            <div className="text-sm font-bold text-gray-900">
                              {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No due date'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1 font-medium">Time Left</div>
                            <div className={`text-sm font-bold ${
                              isOverdue ? 'text-red-600' :
                              daysUntilDue <= 1 ? 'text-orange-600' :
                              daysUntilDue <= 3 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                               daysUntilDue === 0 ? 'Due today' :
                               daysUntilDue === 1 ? 'Due tomorrow' :
                               `${daysUntilDue} days left`}
                            </div>
                          </div>
                        </div>

                        {/* Hours Info */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-5 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">Estimated: <span className="font-bold text-gray-900">{task.estimated_hours}h</span></span>
                            {task.actual_hours && (
                              <span className="font-medium">Actual: <span className="font-bold text-gray-900">{task.actual_hours}h</span></span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestExtension(task)}
                            className="flex-1 h-10 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Request Extension
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddRemark(task)}
                            className="flex-1 h-10 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add Remark
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extension Request Modal */}
      <Modal 
        isOpen={isExtensionModalOpen} 
        onClose={() => setIsExtensionModalOpen(false)} 
        title="Request Task Extension"
      >
        <div className="space-y-4">
          {selectedTask && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedTask.name}</h4>
              <p className="text-sm text-gray-600">
                Current due date: {selectedTask.end_date ? new Date(selectedTask.end_date).toLocaleDateString() : 'No due date'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Due Date
            </label>
            <input
              type="date"
              value={extensionDate}
              onChange={(e) => setExtensionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Extension
            </label>
            <textarea
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Please explain why you need an extension..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsExtensionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitExtensionRequest}
              disabled={!extensionReason.trim()}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Remark Modal */}
      <Modal 
        isOpen={isRemarkModalOpen} 
        onClose={() => setIsRemarkModalOpen(false)} 
        title="Add Task Remark"
      >
        <div className="space-y-4">
          {selectedTask && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedTask.name}</h4>
              <p className="text-sm text-gray-600">
                Project: {userProjects.find(p => p.id === selectedTask.project_id)?.name}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark Date
            </label>
            <input
              type="date"
              value={remarkDate}
              onChange={(e) => setRemarkDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark Type
            </label>
            <select
              value={remarkType}
              onChange={(e) => setRemarkType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="progress">Progress Update</option>
              <option value="issue">Issue/Problem</option>
              <option value="update">Update</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark Content
            </label>
            <textarea
              value={remarkContent}
              onChange={(e) => setRemarkContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Add your remark or comment about this task..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsRemarkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitRemark}
              disabled={!remarkContent.trim()}
            >
              Add Remark
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}