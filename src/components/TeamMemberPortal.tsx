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
  Activity,
  Home,
  Settings,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { teamTaskService, teamProjectService, teamService, performanceFlagService, notificationService } from '../services/apiService';
import { TeamNotifications } from './TeamNotifications';
import type { Task, User as UserType } from '../types';
import notificationServiceRealTime from '../services/notificationService';
import type { RealTimeNotification } from '../services/notificationService';
import tokenService from '../services/tokenService';

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
  // Per-task details state: remarks & extensions
  const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});
  const [remarksByTask, setRemarksByTask] = useState<Record<string, any[]>>({});
  const [extensionsByTask, setExtensionsByTask] = useState<Record<string, any[]>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<RealTimeNotification[]>([]);

  // Load user's data
  useEffect(() => {
    loadUserData();
    loadNotificationCount();
  }, [user.id]);

  // Initialize token auto-refresh for team members
  useEffect(() => {
    console.log('🔐 Initializing team member token auto-refresh...');
    tokenService.initializeTeamAutoRefresh();
    
    return () => {
      console.log('🧹 Cleaning up team member token service...');
      tokenService.cleanup();
    };
  }, []);

  // Separate effect for real-time notifications
  useEffect(() => {
    // Connect to real-time notification service
    const token = localStorage.getItem('teamToken');
    if (token && userProjects.length > 0) {
      console.log('🔌 Connecting team member to notification service...');
      
      notificationServiceRealTime.connect(token, 'team');
      
      // Listen for connection status changes
      const unsubscribeConnection = notificationServiceRealTime.onConnectionChange((connected) => {
        setIsConnected(connected);
        if (connected) {
          console.log('✅ Team member connected, joining project rooms...');
          // Join assigned project rooms for real-time updates
          const projectIds = userProjects.map(project => project.id);
          console.log('🔗 Joining project rooms:', projectIds);
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
  }, [userProjects.length]);

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

  const loadNotificationCount = async () => {
    try {
      const response = await notificationService.getTeamNotifications();
      const { extensions, remarks } = response.data;
      
      // Count new notifications (pending extensions + recent remarks)
      const newExtensions = extensions.filter((ext: any) => 
        ext.status === 'pending' || 
        (ext.reviewed_at && new Date(ext.reviewed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      );
      const newRemarks = remarks.filter((remark: any) => 
        new Date(remark.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      setNotificationCount(newExtensions.length + newRemarks.length);
    } catch (error) {
      console.error('Failed to load notification count:', error);
      // Don't set count to 0 on error, just keep the previous count
      // This prevents the notification bell from disappearing on temporary errors
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadNotificationCount()]);
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

  // Toggle remarks & extensions section for a task; lazy-load on first open
  const toggleTaskDetails = async (taskId: string) => {
    setDetailsOpen(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    const alreadyLoaded = remarksByTask[taskId] !== undefined || extensionsByTask[taskId] !== undefined;
    const willOpen = !detailsOpen[taskId];
    if (willOpen && !alreadyLoaded) {
      try {
        setDetailsLoading(prev => ({ ...prev, [taskId]: true }));
        const [remarks, extensions] = await Promise.all([
          teamTaskService.getRemarks(taskId).catch(() => []),
          teamTaskService.getExtensions(taskId).catch(() => []),
        ]);
        setRemarksByTask(prev => ({ ...prev, [taskId]: Array.isArray(remarks) ? remarks : [] }));
        setExtensionsByTask(prev => ({ ...prev, [taskId]: Array.isArray(extensions) ? extensions : [] }));
      } catch (e) {
        // Swallow errors; UI will show empty lists
      } finally {
        setDetailsLoading(prev => ({ ...prev, [taskId]: false }));
      }
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-6 text-blue-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Portal</h2>
          <p className="text-gray-600">Preparing your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
              <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                <p className="text-gray-600 flex items-center">
                  
                  <Home className="w-4 h-4 mr-2" />
                  {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Team Member Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                loading={refreshing}
                className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
                        {/* Connection Status */}
          <div className="flex items-center space-x-2 text-sm px-3 py-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="font-medium">Offline</span>
              </div>
            )}
          </div>

          {/* Notification Permission Status */}
          {typeof window !== 'undefined' && 'Notification' in window && (
            <div className="flex items-center space-x-2">
              {Notification.permission === 'default' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    Notification.requestPermission().then((permission) => {
                      console.log('🔔 Team member notification permission:', permission);
                      if (permission === 'granted') {
                        // Force a notification test
                        new Notification('Test Notification', {
                          body: 'Team member notifications are now enabled!',
                          icon: '/logo.png'
                        });
                      }
                    });
                  }}
                  className="text-xs px-2 py-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                >
                  🔔 Enable Notifications
                </Button>
              )}
              
              {Notification.permission === 'denied' && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <span>🔔</span>
                  <span>Notifications Disabled</span>
                </div>
              )}
              
              {Notification.permission === 'granted' && (
                <div className="flex items-center space-x-1 text-green-600 text-xs">
                  <span>🔔</span>
                  <span>Notifications Enabled</span>
                </div>
              )}

              {/* Test Notification Button */}
              {Notification.permission === 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🧪 Testing browser notification...');
                    try {
                      const testNotification = new Notification('Test Notification', {
                        body: 'This is a test notification to verify they work!',
                        icon: '/logo.png',
                        tag: 'test-notification'
                      });
                      
                      testNotification.onclick = () => {
                        console.log('✅ Test notification clicked');
                        testNotification.close();
                      };
                      
                      console.log('✅ Test notification created successfully');
                    } catch (error) {
                      console.error('❌ Test notification failed:', error);
                    }
                  }}
                  className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  🧪 Test Notification
                </Button>
              )}
            </div>
          )}

              <Button
                variant="ghost"
                onClick={() => setShowNotifications(true)}
                className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('teamToken');
                  localStorage.removeItem('teamRefreshToken');
                  localStorage.removeItem('teamUserData');
                  tokenService.cleanup();
                  onLogout();
                }}
                className="p-3 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 lg:px-12 xl:px-16 py-8">
        {/* Enhanced Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Active Tasks</p>
                  <p className="text-4xl font-bold">{activeTasks.length}</p>
                  <p className="text-blue-200 text-sm mt-2">Currently working on</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-400/20 backdrop-blur-sm">
                  <CheckSquare className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2">Completed</p>
                  <p className="text-4xl font-bold">{completedTasks.length}</p>
                  <p className="text-green-200 text-sm mt-2">Successfully finished</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-400/20 backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-2">Overdue</p>
                  <p className="text-4xl font-bold">{overdueTasks.length}</p>
                  <p className="text-red-200 text-sm mt-2">Need attention</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-400/20 backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-2">Completion Rate</p>
                  <p className="text-4xl font-bold">{completionRate}%</p>
                  <p className="text-purple-200 text-sm mt-2">Overall performance</p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-400/20 backdrop-blur-sm">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance & Flags Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Performance Flags */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-gray-800 text-xl">
                <div className="p-3 rounded-xl bg-purple-100 mr-4">
                  <Flag className="w-6 h-6 text-purple-600" />
                </div>
                My Performance Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceFlags.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center">
                    <Flag className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Performance Flags</h3>
                  <p className="text-gray-600">Keep up the excellent work!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Flag Counts Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {performanceFlags.filter(f => f.type === 'green').length}
                      </div>
                      <div className="text-sm text-green-600 font-semibold">🟢 Green Flags</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="text-3xl font-bold text-yellow-700 mb-2">
                        {performanceFlags.filter(f => f.type === 'yellow').length}
                      </div>
                      <div className="text-sm text-yellow-600 font-semibold">🟡 Yellow Flags</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="text-3xl font-bold text-orange-700 mb-2">
                        {performanceFlags.filter(f => f.type === 'orange').length}
                      </div>
                      <div className="text-sm text-orange-600 font-semibold">🟠 Orange Flags</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="text-3xl font-bold text-red-700 mb-2">
                        {performanceFlags.filter(f => f.type === 'red').length}
                      </div>
                      <div className="text-sm text-red-600 font-semibold">🔴 Red Flags</div>
                    </div>
                  </div>

                  {/* Recent Flags */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                      Recent Flags
                    </h4>
                    <div className="space-y-3">
                      {performanceFlags.slice(0, 3).map((flag, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <Badge variant={
                              flag.type === 'green' ? 'success' :
                                flag.type === 'yellow' ? 'warning' :
                                  flag.type === 'orange' ? 'warning' : 'danger'
                            } size="sm" className="shadow-sm">
                              <Flag className="w-3 h-3 mr-1" />
                              {flag.type.toUpperCase()}
                            </Badge>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{flag.reason}</p>
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
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-gray-800 text-xl">
                <div className="p-3 rounded-xl bg-green-100 mr-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                Recent Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                    <Award className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Tasks Yet</h3>
                  <p className="text-gray-600">Start working on your assigned tasks!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTasks.slice(0, 5).map(task => {
                    const project = userProjects.find(p => p.id === task.project_id);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">{task.name}</p>
                          <p className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full inline-block">{project?.name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="text-sm text-green-700 font-semibold">Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Active Tasks Section - Full Width */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-100 mr-4">
                  <CheckSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">My Active Tasks</h2>
                  <p className="text-gray-600 mt-1 text-sm">Manage your current assignments and track progress</p>
                </div>
              </div>
              <Badge variant="primary" className="text-base font-bold px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600">
                {activeTasks.length} tasks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-16 h-16 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No Active Tasks</h3>
                <p className="text-gray-600 text-xl max-w-md mx-auto">You're all caught up! No tasks are currently assigned to you. Enjoy your free time!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTasks.map(task => {
                  const project = userProjects.find(p => p.id === task.project_id);
                  const daysUntilDue = getDaysUntilDue(task);
                  const isOverdue = isTaskOverdue(task);

                  return (
                    <div key={task.id} className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-1 ${isOverdue ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-red-200' :
                      'border-gray-200 bg-white hover:border-blue-400 shadow-lg'
                      }`}>
                      {/* Priority indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-2 ${task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700' :
                        task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700' :
                          task.priority === 'medium' ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700' :
                            'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                        }`} />

                      <div className="p-4 pt-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {task.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                              <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">{project?.name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">{task.stage_name || 'No Stage'}</span>
                              {task.category_name && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{task.category_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3 ml-6">
                            {isOverdue && (
                              <Badge variant="danger" size="sm" className="animate-pulse shadow-lg px-4 py-2">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Overdue
                              </Badge>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                task.priority === 'urgent' ? 'danger' :
                                  task.priority === 'high' ? 'warning' :
                                    task.priority === 'medium' ? 'primary' : 'default'
                              } size="sm" className="shadow-sm px-3 py-1">
                                {task.priority}
                              </Badge>
                              <Badge variant={
                                task.status === 'in-progress' ? 'primary' :
                                  task.status === 'under-review' ? 'warning' :
                                    task.status === 'blocked' ? 'danger' : 'default'
                              } size="sm" className="shadow-sm px-3 py-1">
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2 bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-lg border-l-4 border-blue-300">{task.description}</p>
                        )}

                        {/* Progress Section */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text-gray-700 font-bold text-lg">Progress</span>
                            <span className="font-bold text-gray-900 text-2xl">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            <div
                              className={`h-4 rounded-full transition-all duration-700 shadow-sm ${task.progress >= 80 ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700' :
                                task.progress >= 50 ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700' :
                                  task.progress >= 25 ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600' :
                                    'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                                }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Educational Hierarchy */}
                        {(task.grade_name || task.book_name || task.unit_name || task.lesson_name) && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center mb-2">
                              <Target className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-bold text-blue-900">Educational Hierarchy</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {task.grade_name && (
                                <Badge variant="primary" className="text-xs bg-blue-100 text-blue-800 border-2 border-blue-200 font-semibold px-2 py-1">
                                  {task.grade_name}
                                </Badge>
                              )}
                              {task.book_name && (
                                <Badge variant="primary" className="text-xs bg-indigo-100 text-indigo-800 border-2 border-indigo-200 font-semibold px-2 py-1">
                                  {task.book_name}
                                </Badge>
                              )}
                              {task.unit_name && (
                                <Badge variant="primary" className="text-xs bg-purple-100 text-purple-800 border-2 border-purple-200 font-semibold px-2 py-1">
                                  {task.unit_name}
                                </Badge>
                              )}
                              {task.lesson_name && (
                                <Badge variant="primary" className="text-xs bg-pink-100 text-pink-800 border-2 border-pink-200 font-semibold px-2 py-1">
                                  {task.lesson_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        {task.required_skills && task.required_skills.length > 0 && (
                          <div className="mb-3 p-3 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-lg border-2 border-green-200 shadow-sm">
                            <div className="flex items-center mb-2">
                              <Activity className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-bold text-green-900">Required Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {task.required_skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 border-2 border-green-200 font-semibold px-2 py-1">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Time & Hours Info */}
                        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 rounded-lg border border-gray-300 shadow-sm">
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1 font-semibold">Due Date</div>
                            <div className="text-sm font-bold text-gray-900">
                              {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No due date'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1 font-semibold">Time Left</div>
                            <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' :
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
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-6">
                            <span className="font-semibold">Estimated: <span className="font-bold text-gray-900 text-lg">{task.estimated_hours}h</span></span>
                            {task.actual_hours && (
                              <span className="font-semibold">Actual: <span className="font-bold text-gray-900 text-lg">{task.actual_hours}h</span></span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestExtension(task)}
                            className="flex-1 h-9 font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 text-sm"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Request Extension
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddRemark(task)}
                            className="flex-1 h-9 font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 text-sm"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Add Remark
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTaskDetails(task.id)}
                            className="ml-2"
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            Remarks & Extensions
                          </Button>
                        </div>

                        {/* Remarks & Extensions (Expandable) */}
                        {detailsOpen[task.id] && (
                          <div className="mt-4 space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {detailsLoading[task.id] ? (
                              <div className="text-sm text-gray-600">Loading details...</div>
                            ) : (
                              <>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <MessageSquare className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-semibold text-gray-800">Remarks</span>
                                    </div>
                                    <Badge variant="secondary">{(remarksByTask[task.id] || []).length}</Badge>
                                  </div>
                                  {(remarksByTask[task.id] || []).length === 0 ? (
                                    <p className="text-xs text-gray-500">No remarks yet.</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {(remarksByTask[task.id] || []).map((r: any) => (
                                        <li key={r.id} className="p-2 bg-white rounded border border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-800 font-medium">{r.remark_type || 'general'}</div>
                                            <div className="text-xs text-gray-500">{new Date(r.created_at || r.remark_date).toLocaleString()}</div>
                                          </div>
                                          <div className="text-sm text-gray-700 mt-1">{r.remark}</div>
                                          {r.user_name && (
                                            <div className="text-xs text-gray-500 mt-1">by {r.user_name}</div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4 text-orange-600" />
                                      <span className="text-sm font-semibold text-gray-800">Extension Requests</span>
                                    </div>
                                    <Badge variant="secondary">{(extensionsByTask[task.id] || []).length}</Badge>
                                  </div>
                                  {(extensionsByTask[task.id] || []).length === 0 ? (
                                    <p className="text-xs text-gray-500">No extension requests.</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {(extensionsByTask[task.id] || []).map((e: any) => (
                                        <li key={e.id} className="p-2 bg-white rounded border border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-800 font-medium capitalize">{e.status || 'pending'}</div>
                                            <div className="text-xs text-gray-500">{new Date(e.created_at).toLocaleString()}</div>
                                          </div>
                                          <div className="text-xs text-gray-600 mt-1">Current due: {e.current_due_date ? new Date(e.current_due_date).toLocaleDateString() : '-'}</div>
                                          <div className="text-xs text-gray-600">Requested due: {e.requested_due_date ? new Date(e.requested_due_date).toLocaleDateString() : '-'}</div>
                                          {e.reason && (
                                            <div className="text-sm text-gray-700 mt-1">Reason: {e.reason}</div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
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
                Project: {userProjects.find(p => p.id === selectedTask.project_id)?.name}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Remark Date
            </label>
            <input
              type="date"
              value={remarkDate}
              onChange={(e) => setRemarkDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

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
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Remark Content
            </label>
            <textarea
              value={remarkContent}
              onChange={(e) => setRemarkContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              rows={4}
              placeholder="Add your remark or comment about this task..."
              required
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
              disabled={!remarkContent.trim()}
              className="px-6 py-3 font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Add Remark
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