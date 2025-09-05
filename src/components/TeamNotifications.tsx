import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { notificationService as apiNotificationService } from '../services/apiService';
import notificationService from '../services/notificationService';

interface ExtensionRequest {
  id: number;
  type: 'extension_request';
  task_id: number;
  task_name: string;
  project_name: string;
  requester_name: string;
  requester_type: 'admin' | 'team';
  current_due_date: string;
  requested_due_date: string;
  reason: string;
  status: string;
  created_at: string;
  review_notes?: string;
  reviewed_at?: string;
  reviewer_name?: string;
  is_new: boolean;
}

interface TaskRemark {
  id: number;
  type: 'remark';
  task_id: number;
  task_name: string;
  project_name: string;
  user_name: string;
  user_type: 'admin' | 'team';
  remark: string;
  remark_type: string;
  is_private: boolean;
  created_at: string;
  is_new: boolean;
}

interface NotificationsData {
  extensions: ExtensionRequest[];
  remarks: TaskRemark[];
}

interface TeamNotificationsProps {
  onBack: () => void;
}

export function TeamNotifications({ onBack }: TeamNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationsData>({ extensions: [], remarks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'new'>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('team_notification_filter_type') : null;
    return (stored === 'new' || stored === 'all') ? (stored as 'all' | 'new') : 'all';
  });
  const [filterDate, setFilterDate] = useState<string>('');

  // Keep filterType in localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('team_notification_filter_type', filterType);
    } catch {}
  }, [filterType]);

  // Build unique users list
  const uniqueUsers = React.useMemo(() => {
    const set = new Set<string>();
    notifications.extensions.forEach(ext => {
      if (ext.requester_name) set.add(ext.requester_name);
    });
    notifications.remarks.forEach(r => {
      if (r.user_name) set.add(r.user_name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notifications.extensions, notifications.remarks]);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Real-time notification listening
  useEffect(() => {
    const unsubscribe = notificationService.onNotification((realTimeNotification) => {
      console.log('📢 Real-time notification received in TeamNotifications component:', realTimeNotification);
      
      // Reload notifications to get the latest data
      loadNotifications();
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiNotificationService.getTeamNotifications();
      setNotifications(response.data);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (taskId: number) => {
    // For now, just go back to the portal
    // In a full implementation, you might want to navigate to task details
    onBack();
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    let filteredExtensions = notifications.extensions;
    let filteredRemarks = notifications.remarks;

    // Filter by type (New = last 24 hours)
    if (filterType === 'new') {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);
      filteredExtensions = filteredExtensions.filter(ext => new Date(ext.created_at) >= cutoff);
      filteredRemarks = filteredRemarks.filter(remark => new Date(remark.created_at) >= cutoff);
    }

    // Filter by date
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filterDateObj.setHours(0, 0, 0, 0);
      
      filteredExtensions = filteredExtensions.filter(ext => {
        const extDate = new Date(ext.created_at);
        extDate.setHours(0, 0, 0, 0);
        return extDate.getTime() === filterDateObj.getTime();
      });
      
      filteredRemarks = filteredRemarks.filter(remark => {
        const remarkDate = new Date(remark.created_at);
        remarkDate.setHours(0, 0, 0, 0);
        return remarkDate.getTime() === filterDateObj.getTime();
      });
    }



    return { extensions: filteredExtensions, remarks: filteredRemarks };
  };

  const filteredNotifications = getFilteredNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'extension_request':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'remark':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, remarkType?: string) => {
    switch (type) {
      case 'extension_request':
        return 'border-orange-200 bg-orange-50';
      case 'remark':
        // Special handling for complete remarks - green background
        if (remarkType === 'complete') {
          return 'border-green-200 bg-green-50';
        }
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getRemarkTypeBadge = (type: string) => {
    switch (type) {
      case 'progress':
        return <Badge variant="success">Progress</Badge>;
      case 'issue':
        return <Badge variant="danger">Issue</Badge>;
      case 'update':
        return <Badge variant="primary">Update</Badge>;
      case 'complete':
        return <Badge variant="success">Complete</Badge>;
      case 'general':
        return <Badge variant="default">General</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    console.log('🕐 TeamNotifications - Original date string:', dateString);
    
    // Parse the date string - it's already in UTC format
    const date = new Date(dateString);
    console.log('🕐 TeamNotifications - Parsed date (UTC):', date);
    
    // Use UTC time for comparison to avoid timezone issues
    const now = new Date();
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    console.log('🕐 TeamNotifications - Current time (local):', now);
    console.log('🕐 TeamNotifications - Current time (UTC):', nowUTC);
    
    const diffInMs = nowUTC.getTime() - date.getTime();
    console.log('🕐 TeamNotifications - Difference in ms:', diffInMs);
    console.log('🕐 TeamNotifications - Difference in hours:', diffInMs / (1000 * 60 * 60));
    
    // Handle negative differences (future dates)
    if (diffInMs < 0) {
      return 'Just now';
    }
    
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Notifications</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalNotifications = filteredNotifications.extensions.length + filteredNotifications.remarks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Notifications</h1>
                  <p className="text-gray-600">
                    {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
                         <div className="flex items-center space-x-3">
               <Button onClick={loadNotifications} variant="outline">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Refresh
               </Button>
               <Button onClick={onBack} variant="ghost" className="text-gray-600 hover:text-gray-800">
                 <XCircle className="w-5 h-5" />
               </Button>
             </div>
          </div>
        </div>
      </header>

      <div className="w-full px-8 lg:px-12 xl:px-16 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter by Type */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'new')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Notifications</option>
                  <option value="new">New (Last 24 hours)</option>
                </select>
              </div>

              {/* Filter by Date */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Date:</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {filterDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDate('')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                )}
              </div>

                          {/* Clear All Filters */}
            {(filterType !== 'all' || filterDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType('all');
                  setFilterDate('');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear All Filters
              </Button>
            )}
            </div>
          </CardContent>
        </Card>

        {/* Extension Requests */}
        {filteredNotifications.extensions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>Extension Requests ({filteredNotifications.extensions.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.extensions.map((extension) => (
                  <div 
                    key={extension.id} 
                    className={`p-4 border rounded-lg ${getNotificationColor(extension.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getNotificationIcon(extension.type)}
                          <span className="font-medium text-gray-900">
                            Extension Request for "{extension.task_name}"
                          </span>
                          {/* Show enhanced status with emoji */}
                          <Badge variant={
                            extension.status === 'approved' ? 'success' :
                            extension.status === 'rejected' ? 'danger' :
                            'warning'
                          } className="text-sm font-bold">
                            {extension.status === 'approved' ? 'Approved' :
                             extension.status === 'rejected' ? 'Rejected' :
                             'Pending'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <User className="w-3 h-3 inline mr-1" />
                              Requested by: <span className="font-medium">{extension.requester_name || 'Unknown User'}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <FileText className="w-3 h-3 inline mr-1" />
                              Project: <span className="font-medium">{extension.project_name}</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Current Due: {new Date(extension.current_due_date).toLocaleDateString()}
                            </p>
                            <div className="text-sm text-gray-600">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Requested Due: {new Date(extension.requested_due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span> {extension.reason}
                          </p>
                          
                          {/* Admin Review Information */}
                          {extension.status !== 'pending' && extension.reviewer_name && (
                            <div className={`mt-3 p-4 rounded-lg border-2 ${
                              extension.status === 'approved' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center space-x-2 mb-3">
                                <span className={`text-lg font-bold ${
                                  extension.status === 'approved' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {extension.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  by {extension.reviewer_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {extension.reviewed_at && new Date(extension.reviewed_at).toLocaleDateString()}
                                </span>
                              </div>
                              {extension.review_notes && (
                                <div className="bg-white p-3 rounded border">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Admin Notes:</span> {extension.review_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Requested: {formatTimeAgo(extension.created_at)}</span>
                          <Button 
                            size="sm" 
                            onClick={() => handleViewTask(extension.task_id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Task</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Remarks */}
        {filteredNotifications.remarks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span>Recent Remarks ({filteredNotifications.remarks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.remarks.map((remark) => (
                  <div 
                    key={remark.id} 
                    className={`p-4 border rounded-lg ${getNotificationColor(remark.type, remark.remark_type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getNotificationIcon(remark.type)}
                          <span className="font-medium text-gray-900">
                            Remark on "{remark.task_name}"
                          </span>
                          {getRemarkTypeBadge(remark.remark_type)}
                          {/* Show enhanced user type display */}
                          <Badge variant={
                            remark.user_type === 'admin' ? 'primary' : 'secondary'
                          } className={
                            remark.user_type === 'admin' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }>
                            {remark.user_type === 'admin' ? 'Admin' : 'Team'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Remark:</span> {remark.remark}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <User className="w-3 h-3 inline mr-1" />
                              Added by: <span className="font-medium">{remark.user_name || 'Unknown User'}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <FileText className="w-3 h-3 inline mr-1" />
                              Project: <span className="font-medium">{remark.project_name}</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Date: {new Date(remark.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Added: {formatTimeAgo(remark.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewTask(remark.task_id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Task</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Notifications */}
        {totalNotifications === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-600">
                You're all caught up! No new extension requests or remarks to review.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
