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
import { teamTaskService, teamProjectService, teamService } from '../services/apiService';
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
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionDays, setExtensionDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user's data
  useEffect(() => {
    loadUserData();
  }, [user.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user's tasks and projects using team-specific APIs
      const [tasksData, projectsData] = await Promise.all([
        teamService.getMyTasks(),
        teamProjectService.getAll()
      ]);
      
      setUserTasks(tasksData);
      setUserProjects(projectsData);
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
  const performanceFlags = user.performance_flags || [];

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

  const submitExtensionRequest = async () => {
    if (selectedTask) {
      try {
        // Update task with extension request
        await teamTaskService.update(selectedTask.id, {
          description: `${selectedTask.description}\n\n[Extension Request: ${extensionReason} - ${extensionDays} days]`
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
    setExtensionDays(1);
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
    return task.end_date && new Date(task.end_date) < new Date() && task.status !== 'completed';
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  My Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No active tasks assigned</p>
                  </div>
                ) : (
                  activeTasks.map(task => {
                    const project = userProjects.find(p => p.id === task.project_id);
                    const daysUntilDue = getDaysUntilDue(task);
                    const isOverdue = isTaskOverdue(task);
                    
                    return (
                      <div key={task.id} className={`p-4 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 flex items-center">
                              {task.name}
                              {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                              <span className="font-medium">{project?.name}</span>
                              <span>•</span>
                              <span>{task.stage_name}</span>
                              {task.category_name && (
                                <>
                                  <span>•</span>
                                  <span>{task.category_name}</span>
                                </>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                            )}
                            {/* Educational Hierarchy */}
                            {(task.grade_name || task.book_name || task.unit_name || task.lesson_name) && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">Educational Hierarchy:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.grade_name && <Badge variant="default" className="text-xs">{task.grade_name}</Badge>}
                                  {task.book_name && <Badge variant="default" className="text-xs">{task.book_name}</Badge>}
                                  {task.unit_name && <Badge variant="default" className="text-xs">{task.unit_name}</Badge>}
                                  {task.lesson_name && <Badge variant="default" className="text-xs">{task.lesson_name}</Badge>}
                                </div>
                              </div>
                            )}
                            {/* Required Skills */}
                            {task.required_skills && task.required_skills.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">Required Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.required_skills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              task.priority === 'urgent' ? 'danger' :
                              task.priority === 'high' ? 'warning' :
                              task.priority === 'medium' ? 'primary' : 'default'
                            } size="sm">
                              {task.priority}
                            </Badge>
                            <Badge variant={
                              task.status === 'in-progress' ? 'primary' :
                              task.status === 'under-review' ? 'warning' :
                              task.status === 'blocked' ? 'danger' : 'default'
                            } size="sm">
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <ProgressBar value={task.progress} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No due date'}
                          </div>
                          <div className={`font-medium ${
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

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Estimated: {task.estimated_hours}h
                            {task.actual_hours && ` | Actual: ${task.actual_hours}h`}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestExtension(task)}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Request Extension
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkComplete(task.id)}
                              disabled={task.status === 'completed'}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance & Flags */}
          <div className="space-y-6">
            {/* Performance Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="w-5 h-5 mr-2" />
                  My Performance Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performanceFlags.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No performance flags</p>
                ) : (
                  <div className="space-y-4">
                    {/* Flag Counts Summary */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {performanceFlags.filter(f => f.type === 'gold').length}
                        </div>
                        <div className="text-xs text-gray-600">🥇 Gold Flags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {performanceFlags.filter(f => f.type === 'green').length}
                        </div>
                        <div className="text-xs text-gray-600">🟢 Green Flags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {performanceFlags.filter(f => f.type === 'orange').length}
                        </div>
                        <div className="text-xs text-gray-600">🟠 Orange Flags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {performanceFlags.filter(f => f.type === 'red').length}
                        </div>
                        <div className="text-xs text-gray-600">🔴 Red Flags</div>
                      </div>
                    </div>

                    {/* Recent Flags */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Flags:</h4>
                      <div className="space-y-2">
                        {performanceFlags.slice(0, 5).map((flag, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white border">
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                flag.type === 'gold' || flag.type === 'green' ? 'success' :
                                flag.type === 'orange' ? 'warning' : 'danger'
                              } size="sm">
                                <Flag className="w-3 h-3 mr-1" />
                                {flag.type.toUpperCase()}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{flag.reason}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(flag.date).toLocaleDateString()} by {flag.added_by}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Recent Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No completed tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {completedTasks.slice(0, 5).map(task => {
                      const project = userProjects.find(p => p.id === task.project_id);
                      return (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{task.name}</p>
                            <p className="text-xs text-gray-600">{project?.name}</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
              Extension Days
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={extensionDays}
              onChange={(e) => setExtensionDays(parseInt(e.target.value))}
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
    </div>
  );
}