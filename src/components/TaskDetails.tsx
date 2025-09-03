import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckSquare, 
  Clock,
  BarChart3,
  Edit2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  User,
  Tag,
  Flag,
  MessageSquare,
  Clock as ClockIcon,
  CheckCircle,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStatus, Priority, PerformanceFlag } from '../types';
import { calculateTaskProgress } from '../utils/progressCalculator';
import { CreateTaskModal } from './TaskManager';
import { taskService, teamService, projectService, skillService, stageService, gradeService, bookService, unitService, lessonService, performanceFlagService } from '../services/apiService';

interface TaskDetailsProps {
  taskId: string;
  onBack: () => void;
}

interface TaskExtension {
  id: number;
  task_id: number;
  requested_by: number;
  requested_by_type: 'admin' | 'team';
  current_due_date: string;
  requested_due_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_name: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

interface TaskRemark {
  id: number;
  task_id: number;
  added_by: number;
  added_by_type: 'admin' | 'team';
  remark_date: string;
  remark: string;
  remark_type: 'general' | 'progress' | 'issue' | 'update' | 'other';
  is_private: boolean;
  user_name: string;
  created_at: string;
}

export function TaskDetails({ taskId, onBack }: TaskDetailsProps) {
  const { state } = useApp();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Related data
  const [project, setProject] = useState<any>(null);
  const [stage, setStage] = useState<any>(null);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [educationalHierarchy, setEducationalHierarchy] = useState<any>(null);

  // Extensions and Remarks
  const [extensions, setExtensions] = useState<TaskExtension[]>([]);
  const [remarks, setRemarks] = useState<TaskRemark[]>([]);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<TaskExtension | null>(null);
  const [extensionAction, setExtensionAction] = useState<'approved' | 'rejected'>('approved');
  const [extensionNotes, setExtensionNotes] = useState('');
  const [approvedDate, setApprovedDate] = useState('');

  // Performance Flags
  const [performanceFlags, setPerformanceFlags] = useState<PerformanceFlag[]>([]);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null);
  const [flagType, setFlagType] = useState<'red' | 'orange' | 'yellow' | 'green'>('green');
  const [flagReason, setFlagReason] = useState('');

  // Check if user is admin
  const isAdmin = user?.id !== undefined; // Assuming any authenticated user is admin in this context

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load task details
      const taskData = await taskService.getById(taskId);
      console.log('📋 Task data received:', taskData);
      
      // Calculate progress if not set or if it's 0 but status suggests progress
      if (taskData.progress === 0 || taskData.progress === null) {
        const calculatedProgress = calculateTaskProgress(taskData.status);
        console.log('📊 Calculating progress for status:', taskData.status, '->', calculatedProgress);
        taskData.progress = calculatedProgress;
      }
      
      setTask(taskData);

      // Load related data
      const [projectData, stageData, allTeamMembersData, teamsData, skillsData, gradesData, booksData, unitsData, lessonsData, extensionsData, remarksData, flagsData] = await Promise.all([
        projectService.getById(taskData.project_id),
        stageService.getById(taskData.category_stage_id || taskData.stage_id),
        teamService.getMembers(),
        teamService.getTeams(),
        skillService.getAll(),
        gradeService.getAll(),
        bookService.getAll(),
        unitService.getAll(),
        lessonService.getAll(),
        taskService.getExtensions(taskId),
        taskService.getRemarks(taskId),
        performanceFlagService.getByTask(taskId)
      ]);

      setProject(projectData);
      setStage(stageData);
      setAllTeamMembers(allTeamMembersData.data || allTeamMembersData);
      setTeams(teamsData.data || teamsData);
      setSkills(skillsData.data || skillsData);
      setGrades(gradesData.data || gradesData);
      setBooks(booksData.data || booksData);
      setUnits(unitsData.data || unitsData);
      setLessons(lessonsData.data || lessonsData);
      setExtensions(extensionsData.data || extensionsData);
      setRemarks(remarksData.data || remarksData);
      setPerformanceFlags(flagsData.data || flagsData);

      // Filter assignees based on task assignees
      const allTeamMembersArray = allTeamMembersData.data || allTeamMembersData;
      console.log('🔍 Task assignees data:', taskData.assignees);
      console.log('🔍 All team members:', allTeamMembersArray);
      
      const taskAssignees = allTeamMembersArray.filter((user: any) => {
        // Handle both array of IDs and array of objects
        if (Array.isArray(taskData.assignees)) {
          return taskData.assignees.some((assignee: any) => {
            if (typeof assignee === 'object' && assignee.id) {
              return assignee.id === user.id;
            } else {
              return assignee === user.id;
            }
          });
        }
        return false;
      });
      
      console.log('🔍 Filtered task assignees:', taskAssignees);
      setAssignees(taskAssignees);

      // Load educational hierarchy data if task has it
      if (taskData.grade_id || taskData.book_id || taskData.unit_id || taskData.lesson_id) {
        const hierarchyData: any = {};
        
        if (taskData.grade_id) {
          hierarchyData.grade = await gradeService.getById(taskData.grade_id);
        }
        if (taskData.book_id) {
          hierarchyData.book = await bookService.getById(taskData.book_id);
        }
        if (taskData.unit_id) {
          hierarchyData.unit = await unitService.getById(taskData.unit_id);
        }
        if (taskData.lesson_id) {
          hierarchyData.lesson = await lessonService.getById(taskData.lesson_id);
        }
        
        setEducationalHierarchy(hierarchyData);
      }

    } catch (err: any) {
      console.error('Failed to load task details:', err);
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (updatedTaskData: Partial<Task>) => {
    try {
      // Ensure actual_hours is included in the update
      const taskUpdateData = {
        ...updatedTaskData,
        actual_hours: updatedTaskData.actual_hours !== undefined ? updatedTaskData.actual_hours : task?.actual_hours
      };
      
      const updatedTask = await taskService.update(taskId, taskUpdateData);
      setTask(updatedTask);
      setIsEditModalOpen(false);
      await loadTaskDetails(); // Refresh all data
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.message || 'Failed to update task');
    }
  };

  // Extension handling
  const handleReviewExtension = async () => {
    if (!selectedExtension) return;

    try {
      const reviewData: any = {
        status: extensionAction
      };

      if (extensionAction === 'approved' && approvedDate) {
        reviewData.review_notes = `Approved until ${approvedDate}. ${extensionNotes}`;
      } else if (extensionAction === 'rejected') {
        reviewData.review_notes = extensionNotes;
      }

      await taskService.reviewExtension(selectedExtension.id.toString(), reviewData);
      
      // Refresh data
      await loadTaskDetails();
      setIsExtensionModalOpen(false);
      setSelectedExtension(null);
      setExtensionAction('approved');
      setExtensionNotes('');
      setApprovedDate('');
    } catch (err: any) {
      console.error('Failed to review extension:', err);
      setError(err.message || 'Failed to review extension');
    }
  };

  const openExtensionModal = (extension: TaskExtension, action: 'approved' | 'rejected') => {
    setSelectedExtension(extension);
    setExtensionAction(action);
    setExtensionNotes('');
    setApprovedDate(action === 'approved' ? extension.requested_due_date : '');
    setIsExtensionModalOpen(true);
  };

  // Remark handling
  const handleAddRemark = async (remarkData: { remark: string; remark_date: string; remark_type: string; is_private: boolean }) => {
    try {
      await taskService.addRemark(taskId, remarkData);
      await loadTaskDetails(); // Refresh remarks
      setIsRemarkModalOpen(false);
    } catch (err: any) {
      console.error('Failed to add remark:', err);
      setError(err.message || 'Failed to add remark');
    }
  };

  const handleDeleteRemark = async (remarkId: number) => {
    try {
      await taskService.deleteRemark(remarkId.toString());
      await loadTaskDetails(); // Refresh remarks
    } catch (err: any) {
      console.error('Failed to delete remark:', err);
      setError(err.message || 'Failed to delete remark');
    }
  };

  // Performance Flag Functions
  const openFlagModal = (assignee: any) => {
    setSelectedAssignee(assignee);
    setFlagType('green');
    setFlagReason('');
    setIsFlagModalOpen(true);
  };

  const handleAddFlag = async () => {
    if (!selectedAssignee || !flagReason.trim()) return;

    try {
      await performanceFlagService.add({
        team_member_id: selectedAssignee.id,
        task_id: parseInt(taskId),
        type: flagType,
        reason: flagReason.trim()
      });

      // Reload flags
      const flagsData = await performanceFlagService.getByTask(taskId);
      setPerformanceFlags(flagsData.data || flagsData);

      // Close modal
      setIsFlagModalOpen(false);
      setSelectedAssignee(null);
      setFlagType('green');
      setFlagReason('');
    } catch (error) {
      console.error('Failed to add performance flag:', error);
    }
  };

  const handleDeleteFlag = async (flagId: number) => {
    try {
      await performanceFlagService.delete(flagId.toString());
      // Reload flags
      const flagsData = await performanceFlagService.getByTask(taskId);
      setPerformanceFlags(flagsData.data || flagsData);
    } catch (error) {
      console.error('Failed to delete performance flag:', error);
    }
  };

  const getFlagColor = (type: string) => {
    switch (type) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case 'not-started': return 'default';
      case 'in-progress': return 'primary';
      case 'under-review': return 'warning';
      case 'completed': return 'success';
      case 'blocked': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'primary';
      case 'high': return 'warning';
      case 'urgent': return 'danger';
      default: return 'default';
    }
  };

  const getExtensionStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getRemarkTypeVariant = (type: string) => {
    switch (type) {
      case 'progress': return 'success';
      case 'issue': return 'danger';
      case 'update': return 'primary';
      case 'general': return 'default';
      default: return 'secondary';
    }
  };

  const isOverdue = () => {
    if (!task?.end_date) return false;
    
    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the end date at midnight (start of day)
    const dueDate = new Date(task.end_date);
    dueDate.setHours(0, 0, 0, 0);
    
    // Task is overdue if due date is before today AND not completed
    return dueDate < today && task.status !== 'completed';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Task not found'}</p>
            <Button onClick={onBack}>Back to {state.previousView === 'notifications' ? 'Notifications' : 'Tasks'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {state.previousView === 'notifications' ? 'Notifications' : 'Tasks'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
            <p className="text-gray-600">
              {project?.name} • {stage?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(task.status)}>
            {task.status.replace('-', ' ')}
          </Badge>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
          {isOverdue() && (
            <Badge variant="danger">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Task Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{task.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
                  <div className="space-y-2">
                    <ProgressBar value={task.progress} />
                    <p className="text-sm text-gray-600">{task.progress}% complete</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Time Tracking</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Estimated: {task.estimated_hours || 0}h
                    </p>
                    <p className="text-sm text-gray-600">
                      Actual: {task.actual_hours || 0}h
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Start: {task.start_date ? new Date(task.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Due: {task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Project Info</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <Flag className="w-3 h-3 inline mr-1" />
                      Project: {project?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Layers className="w-3 h-3 inline mr-1" />
                      Stage: {stage?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extension Requests */}
          {isAdmin && extensions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Extension Requests ({extensions.filter(e => e.status === 'pending').length} pending)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extensions.map((extension) => (
                    <div key={extension.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getExtensionStatusVariant(extension.status)}>
                              {extension.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Requested by {extension.requester_name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{extension.reason}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Current Due:</span> {new Date(extension.current_due_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Requested Due:</span> {new Date(extension.requested_due_date).toLocaleDateString()}
                            </div>
                          </div>
                          {extension.review_notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Review Notes:</span> {extension.review_notes}
                            </div>
                          )}
                        </div>
                        {extension.status === 'pending' && (
                          <div className="flex space-x-2">
                                                         <Button
                               size="sm"
                               variant="outline"
                               onClick={() => openExtensionModal(extension, 'approved')}
                               className="text-green-600 hover:text-green-700"
                             >
                               <CheckCircle className="w-4 h-4 mr-1" />
                               Approve
                             </Button>
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={() => openExtensionModal(extension, 'rejected')}
                               className="text-red-600 hover:text-red-700"
                             >
                               <XCircle className="w-4 h-4 mr-1" />
                               Reject
                             </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Remarks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Remarks ({remarks.length})
                </CardTitle>
                {isAdmin && (
                  <Button
                    size="sm"
                    onClick={() => setIsRemarkModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Remark
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {remarks.length > 0 ? (
                <div className="space-y-4">
                  {remarks.map((remark) => (
                    <div key={remark.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getRemarkTypeVariant(remark.remark_type)}>
                            {remark.remark_type}
                          </Badge>
                          {remark.is_private && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRemark(remark.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{remark.remark}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>By {remark.user_name}</span>
                        <span>{new Date(remark.remark_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No remarks yet</p>
              )}
            </CardContent>
          </Card>

          {/* Educational Hierarchy */}
          {educationalHierarchy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Educational Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {educationalHierarchy.grade && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">{educationalHierarchy.grade.name}</p>
                        <p className="text-sm text-gray-600">Grade</p>
                      </div>
                    </div>
                  )}
                  
                  {educationalHierarchy.book && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{educationalHierarchy.book.name}</p>
                        <p className="text-sm text-gray-600">Book</p>
                      </div>
                    </div>
                  )}
                  
                  {educationalHierarchy.unit && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Layers className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{educationalHierarchy.unit.name}</p>
                        <p className="text-sm text-gray-600">Unit</p>
                      </div>
                    </div>
                  )}
                  
                  {educationalHierarchy.lesson && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">{educationalHierarchy.lesson.name}</p>
                        <p className="text-sm text-gray-600">Lesson</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Team & Skills */}
        <div className="space-y-6">
          {/* Assignees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Assignees ({assignees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignees.length > 0 ? (
                <div className="space-y-3">
                  {assignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {assignee.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{assignee.name}</p>
                          <p className="text-sm text-gray-600">{assignee.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFlagModal(assignee)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No assignees</p>
              )}
            </CardContent>
          </Card>

          {/* Performance Flags */}
          {isAdmin && performanceFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="w-5 h-5 mr-2" />
                  Performance Flags ({performanceFlags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          flag.type === 'red' ? 'bg-red-500' :
                          flag.type === 'orange' ? 'bg-orange-500' :
                          flag.type === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{flag.team_member_name}</p>
                          <p className="text-sm text-gray-600">{flag.reason}</p>
                          <p className="text-xs text-gray-500">
                            Added by {flag.added_by_name} on {new Date(flag.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFlag(flag.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="font-medium">
                  {task.end_date ? 
                    Math.ceil((new Date(task.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                    'No due date'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hours Remaining</span>
                <span className="font-medium">
                  {Math.max(0, (task.estimated_hours || 0) - (task.actual_hours || 0))}h
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Modal */}
      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateTask}
        users={allTeamMembers}
        teams={teams}
        skills={skills}
        projects={project ? [project] : []}
        stages={stage ? [stage] : []}
        grades={grades}
        books={books}
        units={units}
        lessons={lessons}
        editingTask={task}
      />

      {/* Extension Review Modal */}
      <Modal isOpen={isExtensionModalOpen} onClose={() => setIsExtensionModalOpen(false)} title={`${extensionAction === 'approved' ? 'Approve' : 'Reject'} Extension Request`}>
        <div className="space-y-4">
          {selectedExtension && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Extension Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Requested by:</span> {selectedExtension.requester_name}</p>
                <p><span className="font-medium">Reason:</span> {selectedExtension.reason}</p>
                <p><span className="font-medium">Current due date:</span> {new Date(selectedExtension.current_due_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Requested due date:</span> {new Date(selectedExtension.requested_due_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {extensionAction === 'approved' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approved Until Date
              </label>
              <input
                type="date"
                value={approvedDate}
                onChange={(e) => setApprovedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={selectedExtension?.current_due_date}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes
            </label>
            <textarea
              value={extensionNotes}
              onChange={(e) => setExtensionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Add notes for ${extensionAction === 'approved' ? 'approval' : 'rejection'}...`}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsExtensionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={extensionAction === 'approved' ? 'primary' : 'danger'}
              onClick={handleReviewExtension}
              disabled={extensionAction === 'approved' && !approvedDate}
            >
              {extensionAction === 'approved' ? 'Approve' : 'Reject'} Extension
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Remark Modal */}
      <Modal isOpen={isRemarkModalOpen} onClose={() => setIsRemarkModalOpen(false)} title="Add Remark">
        <AddRemarkForm onSubmit={handleAddRemark} onCancel={() => setIsRemarkModalOpen(false)} />
      </Modal>

      {/* Performance Flag Modal */}
      <Modal isOpen={isFlagModalOpen} onClose={() => setIsFlagModalOpen(false)} title="Add Performance Flag">
        <div className="space-y-4">
          {selectedAssignee && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Flagging:</p>
              <p className="font-medium">{selectedAssignee.name}</p>
              <p className="text-sm text-gray-500">{selectedAssignee.email}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flag Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['green', 'yellow', 'orange', 'red'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFlagType(type)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    flagType === type
                      ? type === 'red' ? 'border-red-500 bg-red-50' :
                        type === 'orange' ? 'border-orange-500 bg-orange-50' :
                        type === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'red' ? 'bg-red-500' :
                      type === 'orange' ? 'bg-orange-500' :
                      type === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <span className="capitalize font-medium">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the reason for this performance flag..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsFlagModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddFlag}
              disabled={!flagReason.trim()}
            >
              Add Flag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Add Remark Form Component
interface AddRemarkFormProps {
  onSubmit: (data: { remark: string; remark_date: string; remark_type: string; is_private: boolean }) => void;
  onCancel: () => void;
}

function AddRemarkForm({ onSubmit, onCancel }: AddRemarkFormProps) {
  const [remark, setRemark] = useState('');
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarkType, setRemarkType] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remark.trim()) {
      onSubmit({
        remark: remark.trim(),
        remark_date: remarkDate,
        remark_type: remarkType,
        is_private: isPrivate
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Remark
        </label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your remark..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
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
          Type
        </label>
        <select
          value={remarkType}
          onChange={(e) => setRemarkType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="general">General</option>
          <option value="progress">Progress</option>
          <option value="issue">Issue</option>
          <option value="update">Update</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
          Private remark (only visible to admins)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!remark.trim()}>
          Add Remark
        </Button>
      </div>
    </form>
  );
}
