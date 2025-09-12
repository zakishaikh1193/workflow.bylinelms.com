import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  TrendingUp,
  LogOut,
  CheckCircle,
  RefreshCw,
  Home,
  Bell,
  Check,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { RichTextEditor } from './ui/RichTextEditor';
import { useToast } from './ui/Toast';
import { useApp } from '../contexts/AppContext';
import { teamTaskService, teamProjectService, teamService, notificationService } from '../services/apiService';
import { TeamNotifications } from './TeamNotifications';
import { TeamTaskDetail } from './TeamTaskDetail';
import type { Task, User as UserType } from '../types';
import notificationServiceRealTime from '../services/notificationService';
import type { RealTimeNotification } from '../services/notificationService';
import tokenService from '../services/tokenService';

interface TeamMemberPortalProps {
  user: UserType;
  onLogout: () => void;
}

export function TeamMemberPortal({ user, onLogout }: TeamMemberPortalProps) {
  const { showToast } = useToast();
  const { state } = useApp();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionDate, setExtensionDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [remarkContent, setRemarkContent] = useState('');
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarkType, setRemarkType] = useState('general');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceFlags, setPerformanceFlags] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [, setRecentNotifications] = useState<RealTimeNotification[]>([]);

  // Load user's data
  useEffect(() => {
    loadUserData();
    loadNotificationCount();
  }, [user.id]);

  // Handle selected task from App context (from notifications)
  useEffect(() => {
    if (state.selectedTaskId && userTasks.length > 0) {
      const task = userTasks.find(t => t.id.toString() === state.selectedTaskId);
      if (task) {
        setSelectedTaskForDetail(task);
      }
    }
  }, [state.selectedTaskId, userTasks]);

  // Initialize token auto-refresh for team members
  useEffect(() => {
    if (user) {
      console.log('🔐 Initializing token auto-refresh for team member...');
      tokenService.initializeTeamAutoRefresh();
      
      return () => {
        console.log('🧹 Cleaning up team token service...');
        tokenService.cleanup();
      };
    }
  }, [user]);

  // Separate effect for real-time notifications
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('teamToken');
      if (token) {
        // Connect to real-time notification service
        console.log('🔌 Connecting team member to notification service...');
        try {
          notificationServiceRealTime.connect(token, 'team');
          console.log('✅ Connected to notification service');
        } catch (error) {
          console.error('❌ Failed to connect to notification service:', error);
        }

        const unsubscribeConnection = notificationServiceRealTime.onConnectionChange((connected) => {
          setIsConnected(connected);
          if (connected) {
            // Join assigned projects for real-time updates
            const projectIds = userProjects.map(p => p.id);
            notificationServiceRealTime.joinAssignedProjects(projectIds);
          }
        });

        // Listen for real-time notifications
        const unsubscribeNotifications = notificationServiceRealTime.onNotification((notification) => {
          console.log('📢 Team member received notification:', notification);
          setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
          setNotificationCount(prev => prev + 1);
        });

        return () => {
          unsubscribeConnection();
          unsubscribeNotifications();
          notificationServiceRealTime.disconnect();
        };
      }
    }
  }, [user, userProjects]);

  const loadNotificationCount = async () => {
    try {
      const response = await notificationService.getTeamNotifications();
      if (response && response.data) {
        const { extensions, remarks, completedTasks } = response.data;
        
        // Count new notifications (pending extensions + recent remarks + recent completions)
        const newExtensions = extensions.filter((ext: any) => ext.status === 'pending');
        const newRemarks = remarks.filter((remark: any) => {
          const remarkDate = new Date(remark.created_at || remark.remark_date);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return remarkDate > oneDayAgo;
        });
        const newCompletedTasks = completedTasks.filter((task: any) => {
          const completionDate = new Date(task.completed_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return completionDate > oneDayAgo;
        });
        
        setNotificationCount(newExtensions.length + newRemarks.length + newCompletedTasks.length);
      }
    } catch (error) {
      console.error('Failed to load notification count:', error);
      // This prevents the notification bell from disappearing on temporary errors
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserTasks(), loadUserProjects(), loadPerformanceFlags()]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTasks = async () => {
    try {
      const tasks = await teamService.getMyTasks();
      setUserTasks(tasks || []);
    } catch (error) {
      console.error('Failed to load user tasks:', error);
      setUserTasks([]);
    }
  };

  const loadUserProjects = async () => {
    try {
      const projects = await teamProjectService.getAll();
      setUserProjects(projects || []);
    } catch (error) {
      console.error('Failed to load user projects:', error);
      setUserProjects([]);
    }
  };

  const loadPerformanceFlags = async () => {
    try {
      // Mock performance flags data for now
      // TODO: Implement actual API call when backend is ready
      const mockFlags = [
        { id: 1, type: 'green', description: 'Excellent performance' },
        { id: 2, type: 'yellow', description: 'Minor improvement needed' },
        { id: 3, type: 'red', description: 'Attention required' }
      ];
      setPerformanceFlags(mockFlags);
    } catch (error) {
      console.error('Failed to load performance flags:', error);
      setPerformanceFlags([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadUserData(), loadNotificationCount()]);
      showToast('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      showToast('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRequestExtension = (task: Task) => {
    setSelectedTask(task);
    setIsExtensionModalOpen(true);
  };


  const handleMarkComplete = (task: Task) => {
    setSelectedTask(task);
    setIsMarkCompleteModalOpen(true);
  };

  const handleViewTaskDetail = (task: Task) => {
    setSelectedTaskForDetail(task);
  };

  const handleBackFromTaskDetail = () => {
    setSelectedTaskForDetail(null);
  };

  const submitExtensionRequest = async () => {
    if (selectedTask) {
      try {
        // Check if team token is expired before making API calls
        if (tokenService.isTeamTokenExpired()) {
          console.log('🚨 Team member token expired, logging out...');
          onLogout();
          return;
        }

        // Request extension using the new API
        await teamTaskService.requestExtension(selectedTask.id, {
          requested_due_date: extensionDate, // This will be the new date
          reason: extensionReason
        });

        // Refresh data
        await loadUserData();
        showToast('Extension request submitted successfully!', 'success');
      } catch (error: any) {
        console.error('Failed to submit extension request:', error);
        
        // Check if it's an authentication error
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Token expired')) {
          console.log('🚨 Authentication error, logging out team member...');
          onLogout();
        } else {
          showToast('Failed to submit extension request. Please try again.', 'error');
        }
      }
    }

    setIsExtensionModalOpen(false);
    setSelectedTask(null);
    setExtensionReason('');
    setExtensionDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Reset to 7 days from now
  };

  const submitRemark = async () => {
    // Check if remark has meaningful content (not just empty HTML tags)
    const hasContent = remarkContent.replace(/<[^>]*>/g, '').trim().length > 0;
    
    if (selectedTask && hasContent) {
      try {
        // Check if team token is expired before making API calls
        if (tokenService.isTeamTokenExpired()) {
          console.log('🚨 Team member token expired, logging out...');
          onLogout();
          return;
        }

        // Add remark using the new API
        await teamTaskService.addRemark(selectedTask.id, {
          remark: remarkContent,
          remark_date: remarkDate,
          remark_type: remarkType
        });

        // Refresh data
        await loadUserData();
        showToast('Remark added successfully!', 'success');
      } catch (error: any) {
        console.error('Failed to add remark:', error);
        
        // Check if it's an authentication error
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Token expired')) {
          console.log('🚨 Authentication error, logging out team member...');
          onLogout();
        } else {
          showToast('Failed to add remark. Please try again.', 'error');
        }
      }
    }

    setIsRemarkModalOpen(false);
    setSelectedTask(null);
    setRemarkContent('');
    setRemarkDate(new Date().toISOString().split('T')[0]);
    setRemarkType('general');
  };

  const submitMarkComplete = async () => {
    if (selectedTask) {
      try {
        // Check if team token is expired before making API calls
        if (tokenService.isTeamTokenExpired()) {
          console.log('🚨 Team member token expired, logging out...');
          onLogout();
          return;
        }

        // Update task status to completed
        await teamTaskService.updateStatus(selectedTask.id, 'completed');

        // Show success message
        showToast(`Task "${selectedTask.name}" has been marked as complete!`, 'success');

        // Refresh data
        await loadUserData();
      } catch (error: any) {
        console.error('Failed to mark task as complete:', error);
        
        // Show error message
        showToast('Failed to mark task as complete. Please try again.', 'error');
        
        // Check if it's an authentication error
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Token expired')) {
          console.log('🚨 Authentication error, logging out team member...');
          onLogout();
        }
      }
    }

    setIsMarkCompleteModalOpen(false);
    setSelectedTask(null);
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.end_date || task.status === 'completed') return false;
    
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the end date at midnight (start of day)
    const dueDate = new Date(task.end_date);
    dueDate.setHours(0, 0, 0, 0);
    
    // Task is overdue if due date is before today
    return dueDate < today;
  };

  const getDaysUntilDue = (task: Task) => {
    if (!task.end_date) return null;
    
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the end date at midnight (start of day)
    const dueDate = new Date(task.end_date);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter tasks by status
  const activeTasks = userTasks.filter(task => 
    task.status === 'not-started' || 
    task.status === 'in-progress' || 
    task.status === 'under-review' || 
    task.status === 'blocked'
  );
  
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const overdueTasks = userTasks.filter(task => isTaskOverdue(task));
  
  // Calculate completion rate
  const completionRate = userTasks.length > 0 
    ? Math.round((completedTasks.length / userTasks.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-6 text-gray-600" />
            <div className="absolute inset-0 bg-gray-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Portal</h2>
          <p className="text-gray-600">Preparing your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  // Show task detail view if a task is selected
  if (selectedTaskForDetail) {
    return (
      <TeamTaskDetail
        task={selectedTaskForDetail}
        onBack={handleBackFromTaskDetail}
        onTaskUpdate={loadUserData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gray-900 shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Portal</h1>
                  <p className="text-gray-600">Welcome back, {user.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center">
                {isConnected ? (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-3 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 lg:px-12 xl:px-16 py-8">
        {/* Simple Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Active Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{activeTasks.length}</p>
                </div>
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{completedTasks.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-red-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium mb-1">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Flags Overview */}
        {performanceFlags.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="w-5 h-5 text-gray-600" />
                <span>Performance Flags ({performanceFlags.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {performanceFlags.filter(f => f.type === 'green').length}
                  </div>
                  <div className="text-sm text-green-600 font-medium">🟢 Green Flags</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 mb-1">
                    {performanceFlags.filter(f => f.type === 'yellow').length}
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">🟡 Yellow Flags</div>
                </div>
                <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700 mb-1">
                    {performanceFlags.filter(f => f.type === 'orange').length}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">🟠 Orange Flags</div>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 mb-1">
                    {performanceFlags.filter(f => f.type === 'red').length}
                  </div>
                  <div className="text-sm text-red-600 font-medium">🔴 Red Flags</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-gray-600" />
                <span>Active Tasks ({activeTasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active tasks. Great job!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.slice(0, 5).map((task) => {
                    const isOverdue = isTaskOverdue(task);
                    const daysUntilDue = getDaysUntilDue(task);
                    
                    return (
                      <div
                        key={task.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewTaskDetail(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{task.name}</h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant={
                              task.priority === 'urgent' ? 'danger' :
                              task.priority === 'high' ? 'warning' :
                              task.priority === 'medium' ? 'default' : 'default'
                            } size="sm">
                              {task.priority}
                            </Badge>
                            {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{task.project_name}</span>
                          <span className={`font-medium ${
                            isOverdue ? 'text-red-600' :
                            daysUntilDue && daysUntilDue <= 1 ? 'text-red-500' :
                            daysUntilDue && daysUntilDue <= 3 ? 'text-gray-600' : 'text-gray-600'
                          }`}>
                            {isOverdue ? `${Math.abs(daysUntilDue || 0)} days overdue` :
                             daysUntilDue === 0 ? 'Due today' :
                             daysUntilDue === 1 ? 'Due tomorrow' :
                             `${daysUntilDue || 0} days left`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-600 h-2 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{task.progress}%</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(task);
                            }}
                            className="bg-gray-900 hover:bg-black text-white"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {activeTasks.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Active Tasks ({activeTasks.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Overdue Tasks ({overdueTasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No overdue tasks. Keep it up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueTasks.slice(0, 5).map((task) => {
                    const daysOverdue = Math.abs(getDaysUntilDue(task) || 0);
                    
                    return (
                      <div
                        key={task.id}
                        className="p-4 border border-red-200 bg-red-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewTaskDetail(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{task.name}</h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="danger" size="sm">
                              {task.priority}
                            </Badge>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{task.project_name}</span>
                          <span className="font-medium text-red-600">
                            {daysOverdue} days overdue
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{task.progress}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestExtension(task);
                              }}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Extend
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkComplete(task);
                              }}
                              className="bg-gray-900 hover:bg-black text-white"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {overdueTasks.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        View All Overdue Tasks ({overdueTasks.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Completions */}
        {completedTasks.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-gray-600" />
                <span>Recent Completions ({completedTasks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewTaskDetail(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 line-clamp-2">{task.name}</h4>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>{task.project_name}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Completed {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                ))}
              </div>
              
              {completedTasks.length > 6 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Completed Tasks ({completedTasks.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extension Request Modal */}
      <Modal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        title="Request Task Extension"
      >
        <div className="space-y-6">
          {selectedTask && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-semibold text-gray-900 text-lg">{selectedTask.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Current due date: {selectedTask.end_date ? new Date(selectedTask.end_date).toLocaleDateString() : 'No due date'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              New Due Date
            </label>
            <input
              type="date"
              value={extensionDate}
              onChange={(e) => setExtensionDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Reason for Extension
            </label>
            <textarea
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={4}
              placeholder="Please explain why you need an extension..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsExtensionModalOpen(false)}
              className="px-6 py-3 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={submitExtensionRequest}
              disabled={!extensionReason.trim()}
              className="px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
        <div className="space-y-6">
          {selectedTask && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <h4 className="font-semibold text-gray-900 text-lg">{selectedTask.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Add a remark or comment about this task
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Remark Type
            </label>
            <select
              value={remarkType}
              onChange={(e) => setRemarkType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="general">General</option>
              <option value="progress">Progress Update</option>
              <option value="issue">Issue/Problem</option>
              <option value="update">Update</option>
              <option value="complete">Complete</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Remark Content
            </label>
            <RichTextEditor
              value={remarkContent}
              onChange={setRemarkContent}
              placeholder="Add your remark or comment about this task..."
              height="150px"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsRemarkModalOpen(false)}
              className="px-6 py-3 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={submitRemark}
              disabled={remarkContent.replace(/<[^>]*>/g, '').trim().length === 0}
              className="px-6 py-3 font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Add Remark
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Complete Confirmation Modal */}
      <Modal
        isOpen={isMarkCompleteModalOpen}
        onClose={() => setIsMarkCompleteModalOpen(false)}
        title="Mark Task as Complete"
      >
        <div className="space-y-6">
          {selectedTask && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h4 className="font-semibold text-gray-900 text-lg">{selectedTask.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to mark this task as completed?
              </p>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Once marked as complete, this task will be moved to your completed tasks list and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsMarkCompleteModalOpen(false)}
              className="px-6 py-3 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={submitMarkComplete}
              className="px-6 py-3 font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notifications View */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          <TeamNotifications onBack={() => {
            setShowNotifications(false);
            // Refresh notification count when returning from notifications
            loadNotificationCount();
          }} />
        </div>
      )}
    </div>
  );
}
