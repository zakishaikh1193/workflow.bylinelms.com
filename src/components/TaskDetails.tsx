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
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { calculateTaskProgress } from '../utils/progressCalculator';
import { CreateTaskModal } from './TaskManager';
import { taskService, teamService, projectService, skillService, stageService, gradeService, bookService, unitService, lessonService } from '../services/apiService';

interface TaskDetailsProps {
  taskId: string;
  onBack: () => void;
}

export function TaskDetails({ taskId, onBack }: TaskDetailsProps) {
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
      const [projectData, stageData, allTeamMembersData, teamsData, skillsData, gradesData, booksData, unitsData, lessonsData] = await Promise.all([
        projectService.getById(taskData.project_id),
        stageService.getById(taskData.stage_id),
        teamService.getMembers(),
        teamService.getTeams(),
        skillService.getAll(),
        gradeService.getAll(),
        bookService.getAll(),
        unitService.getAll(),
        lessonService.getAll()
      ]);

      setProject(projectData);
      setStage(stageData);
      setAllTeamMembers(allTeamMembersData);
      setTeams(teamsData);
      setSkills(skillsData);
      setGrades(gradesData);
      setBooks(booksData);
      setUnits(unitsData);
      setLessons(lessonsData);

      // Filter assignees based on task assignees
      console.log('🔍 Task assignees data:', taskData.assignees);
      console.log('🔍 All team members:', allTeamMembersData);
      
      const taskAssignees = allTeamMembersData.filter((user: any) => {
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
      const updatedTask = await taskService.update(taskId, updatedTaskData);
      setTask(updatedTask);
      setIsEditModalOpen(false);
      await loadTaskDetails(); // Refresh all data
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.message || 'Failed to update task');
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

  const isOverdue = () => {
    if (!task?.end_date) return false;
    return new Date(task.end_date) < new Date() && task.status !== 'completed';
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
            <Button onClick={onBack}>Go Back</Button>
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
            Back to Tasks
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
                    <div key={assignee.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {assignee.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{assignee.name}</p>
                        <p className="text-sm text-gray-600">{assignee.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No assignees</p>
              )}
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Required Skills ({task.skills?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.skills && task.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill: any) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills required</p>
              )}
            </CardContent>
          </Card>

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
    </div>
  );
}
