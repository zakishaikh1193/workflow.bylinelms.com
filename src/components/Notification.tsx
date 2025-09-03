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
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { notificationService } from '../services/apiService';

interface Notification {
  id: number;
  type: 'extension_request' | 'remark';
  task_id: number;
  task_name: string;
  project_name: string;
  created_at: string;
  is_new: boolean;
}

interface ExtensionRequest extends Notification {
  type: 'extension_request';
  requester_name: string;
  requester_type: 'admin' | 'team';
  current_due_date: string;
  requested_due_date: string;
  reason: string;
  status: string;
}

interface TaskRemark extends Notification {
  type: 'remark';
  user_name: string;
  user_type: 'admin' | 'team';
  remark: string;
  remark_type: string;
  is_private: boolean;
}

interface NotificationsData {
  extensions: ExtensionRequest[];
  remarks: TaskRemark[];
}

export function Notification() {
  const { user } = useAuth();
  const { dispatch } = useApp();
  const [notifications, setNotifications] = useState<NotificationsData>({ extensions: [], remarks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.id !== undefined;

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();
    }
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getAll();
      setNotifications(response.data);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (taskId: number) => {
    // Navigate to tasks view - user can then search/filter to find the specific task
    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' });
    // Note: The specific task details will need to be accessed from the TaskManager
    // by searching for the task name or ID
  };

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'extension_request':
        return 'border-orange-200 bg-orange-50';
      case 'remark':
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
      case 'general':
        return <Badge variant="default">General</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only admin users can view notifications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
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

  const totalNotifications = notifications.extensions.length + notifications.remarks.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              {totalNotifications} new activity{totalNotifications !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>
        <Button onClick={loadNotifications} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Extension Requests */}
      {notifications.extensions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Extension Requests ({notifications.extensions.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.extensions.map((extension) => (
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
                        {getStatusBadge(extension.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <User className="w-3 h-3 inline mr-1" />
                            Requested by: <span className="font-medium">{extension.requester_name}</span>
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
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatTimeAgo(extension.created_at)}</span>
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
      {notifications.remarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Recent Remarks ({notifications.remarks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.remarks.map((remark) => (
                <div 
                  key={remark.id} 
                  className={`p-4 border rounded-lg ${getNotificationColor(remark.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getNotificationIcon(remark.type)}
                        <span className="font-medium text-gray-900">
                          Remark on "{remark.task_name}"
                        </span>
                        {getRemarkTypeBadge(remark.remark_type)}
                        {remark.is_private && (
                          <Badge variant="secondary">Private</Badge>
                        )}
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
                            Added by: <span className="font-medium">{remark.user_name}</span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No New Notifications</h3>
            <p className="text-gray-600">
              You're all caught up! No new extension requests or remarks to review.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}