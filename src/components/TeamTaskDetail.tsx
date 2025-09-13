import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  AlertTriangle,
  Calendar,
  Target,
  Activity,
  MessageSquare,
  Award,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { RichTextEditor, RichTextDisplay } from './ui/RichTextEditor';
import { useToast } from './ui/Toast';
import { teamTaskService } from '../services/apiService';
import type { Task } from '../types';

interface TeamTaskDetailProps {
  task: Task;
  onBack: () => void;
  onTaskUpdate: () => void;
}

export function TeamTaskDetail({ task, onBack, onTaskUpdate }: TeamTaskDetailProps) {
  const { showToast } = useToast();
  const [isMarkCompleteModalOpen, setIsMarkCompleteModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const [extensionDate, setExtensionDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [remarkContent, setRemarkContent] = useState('');
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarkType, setRemarkType] = useState('general');
  const [remarks, setRemarks] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [, setLoading] = useState(false);

  // Load task details
  useEffect(() => {
    loadTaskDetails();
  }, [task.id]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const [remarksData, extensionsData] = await Promise.all([
        teamTaskService.getRemarks(task.id).catch(() => []),
        teamTaskService.getExtensions(task.id).catch(() => [])
      ]);
      setRemarks(Array.isArray(remarksData) ? remarksData : []);
      setExtensions(Array.isArray(extensionsData) ? extensionsData : []);
    } catch (error) {
      console.error('Failed to load task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = () => {
    if (!task.end_date) return false;
    return new Date(task.end_date) < new Date();
  };

  const getDaysUntilDue = () => {
    if (!task.end_date) return null;
    const today = new Date();
    const dueDate = new Date(task.end_date);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmitForReview = () => {
    setIsMarkCompleteModalOpen(true);
  };

  const handleRequestExtension = () => {
    setIsExtensionModalOpen(true);
  };

  const handleAddRemark = () => {
    setIsRemarkModalOpen(true);
  };

  const submitForReview = async () => {
    try {
      await teamTaskService.updateStatus(task.id, 'under-review');
      showToast(`Task "${task.name}" has been submitted for review!`, 'success');
      onTaskUpdate();
      onBack();
    } catch (error: any) {
      console.error('Failed to submit task for review:', error);
      showToast('Failed to submit task for review. Please try again.', 'error');
    }
    setIsMarkCompleteModalOpen(false);
  };

  const submitExtensionRequest = async () => {
    try {
      await teamTaskService.requestExtension(task.id, {
        requested_due_date: extensionDate,
        reason: extensionReason
      });
      showToast('Extension request submitted successfully!', 'success');
      await loadTaskDetails();
      onTaskUpdate();
    } catch (error: any) {
      console.error('Failed to submit extension request:', error);
      showToast('Failed to submit extension request. Please try again.', 'error');
    }
    setIsExtensionModalOpen(false);
    setExtensionReason('');
    setExtensionDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  const submitRemark = async () => {
    const hasContent = remarkContent.replace(/<[^>]*>/g, '').trim().length > 0;
    
    if (hasContent) {
      try {
        await teamTaskService.addRemark(task.id, {
          remark: remarkContent,
          remark_date: remarkDate,
          remark_type: remarkType
        });
        showToast('Remark added successfully!', 'success');
        await loadTaskDetails();
        onTaskUpdate();
      } catch (error: any) {
        console.error('Failed to add remark:', error);
        showToast('Failed to add remark. Please try again.', 'error');
      }
    }
    setIsRemarkModalOpen(false);
    setRemarkContent('');
    setRemarkDate(new Date().toISOString().split('T')[0]);
    setRemarkType('general');
  };

  const daysUntilDue = getDaysUntilDue();
  const overdue = isOverdue();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tasks</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{task.name}</h1>
            </div>
            
            {task.status !== 'completed' && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestExtension}
                  className="flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Request Extension</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddRemark}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Add Remark</span>
                </Button>
                <Button
                  onClick={handleSubmitForReview}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit for Review</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Task Overview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      task.status === 'completed' ? 'success' :
                      task.status === 'in-progress' ? 'primary' :
                      task.status === 'under-review' ? 'warning' :
                      task.status === 'blocked' ? 'danger' : 'default'
                    }>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant={
                      task.priority === 'urgent' ? 'danger' :
                      task.priority === 'high' ? 'warning' :
                      task.priority === 'medium' ? 'primary' : 'default'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{task.description}</p>
                  </div>
                )}

                {/* Educational Hierarchy */}
                {(task.grade_name || task.book_name || task.unit_name || task.lesson_name) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Educational Hierarchy</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.grade_name && (
                        <Badge variant="primary" className="bg-blue-100 text-blue-800">
                          {task.grade_name}
                        </Badge>
                      )}
                      {task.book_name && (
                        <Badge variant="primary" className="bg-indigo-100 text-indigo-800">
                          {task.book_name}
                        </Badge>
                      )}
                      {task.unit_name && (
                        <Badge variant="primary" className="bg-purple-100 text-purple-800">
                          {task.unit_name}
                        </Badge>
                      )}
                      {task.lesson_name && (
                        <Badge variant="primary" className="bg-pink-100 text-pink-800">
                          {task.lesson_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {task.required_skills && task.required_skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.required_skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Component Path */}
                {task.componentPath && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Component Path</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <span className="text-purple-800 font-medium">{task.componentPath}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Progress & Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        task.progress >= 80 ? 'bg-green-500' :
                        task.progress >= 50 ? 'bg-blue-500' :
                        task.progress >= 25 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start Date</p>
                      <p className="text-sm text-gray-600">
                        {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Due Date</p>
                      <p className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Status */}
                {task.end_date && daysUntilDue !== null && (
                  <div className={`p-4 rounded-lg border-2 ${
                    overdue ? 'bg-red-50 border-red-200' :
                    daysUntilDue <= 1 ? 'bg-orange-50 border-orange-200' :
                    daysUntilDue <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {overdue ? (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-600" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          overdue ? 'text-red-800' :
                          daysUntilDue <= 1 ? 'text-orange-800' :
                          daysUntilDue <= 3 ? 'text-yellow-800' : 'text-green-800'
                        }`}>
                          {overdue ? `${Math.abs(daysUntilDue)} days overdue` :
                           daysUntilDue === 0 ? 'Due today' :
                           daysUntilDue === 1 ? 'Due tomorrow' :
                           `${daysUntilDue} days left`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Estimated Hours</p>
                      <p className="text-lg font-bold text-blue-900">{task.estimated_hours}h</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Actual Hours</p>
                      <p className="text-lg font-bold text-green-900">{task.actual_hours || 0}h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Project Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Project</p>
                  <p className="text-sm text-gray-600">{task.project_name || 'Unknown Project'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Stage</p>
                  <p className="text-sm text-gray-600">{task.stage_name || 'Unknown Stage'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-600">{task.category_name || 'Unknown Category'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Extension Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Extensions ({extensions.length})</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsExtensionModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Request
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {extensions.length === 0 ? (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">No extension requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extensions.map((extension, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${
                        extension.status === 'approved' ? 'bg-green-50 border-green-200' :
                        extension.status === 'rejected' ? 'bg-red-50 border-red-200' :
                        'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            extension.status === 'approved' ? 'success' :
                            extension.status === 'rejected' ? 'danger' : 'warning'
                          } size="sm">
                            {extension.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(extension.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">From:</span>
                            <span className="text-gray-600 ml-1">
                              {new Date(extension.current_due_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">To:</span>
                            <span className="text-gray-600 ml-1">
                              {new Date(extension.requested_due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Reason</p>
                          <p className="text-xs text-gray-600 line-clamp-2">{extension.reason}</p>
                        </div>
                        
                        {extension.status !== 'pending' && extension.review_notes && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Admin Review
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">{extension.review_notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Task Remarks - Full Width */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Task Remarks ({remarks.length})</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsRemarkModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Add Remark
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {remarks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No remarks yet. Add your first remark to track progress or share updates.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remarks.map((remark, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            remark.remark_type === 'progress' ? 'success' :
                            remark.remark_type === 'issue' ? 'danger' :
                            remark.remark_type === 'update' ? 'primary' :
                            remark.remark_type === 'complete' ? 'success' : 'default'
                          }>
                            {remark.remark_type}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {remark.user_name || 'You'} • {new Date(remark.remark_date || remark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <RichTextDisplay content={remark.remark} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit for Review Modal */}
      <Modal
        isOpen={isMarkCompleteModalOpen}
        onClose={() => setIsMarkCompleteModalOpen(false)}
        title="Submit Task for Review"
      >
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 text-lg">{task.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to submit this task for admin review?
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800">Review Process</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This task will be marked as "Under Review" and an admin will need to approve it before it's marked as complete. You'll be notified once the review is complete.
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
              onClick={submitForReview}
              className="px-6 py-3 font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>
      </Modal>

      {/* Extension Request Modal */}
      <Modal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        title="Request Task Extension"
      >
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 text-lg">{task.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Current due date: {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No due date'}
            </p>
          </div>

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
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <h4 className="font-semibold text-gray-900 text-lg">{task.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Add a remark or comment about this task
            </p>
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
    </div>
  );
}
