import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  User,
  Calendar,
  Filter,
  Search,
  Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { calculateTaskProgress } from '../utils/progressCalculator';

export function TaskManager() {
  const { state, dispatch } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (state.filters) {
      if (state.filters.statuses) {
        setSelectedStatus(state.filters.statuses.length === 1 ? state.filters.statuses[0] : 'all');
      }
      if (state.filters.teamMembers) {
        setSelectedAssignee(state.filters.teamMembers.length === 1 ? state.filters.teamMembers[0] : 'all');
      }
      // Clear filters after applying
      dispatch({ type: 'SET_FILTERS', payload: {} });
    }
  }, [state.filters, dispatch]);

  const isOverdue = (task: Task) => {
    return new Date(task.endDate) < new Date() && task.status !== 'completed';
  };

  const isDueToday = (task: Task) => {
    const today = new Date();
    const dueDate = new Date(task.endDate);
    return today.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueTomorrow = (task: Task) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.endDate);
    return tomorrow.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueThisWeek = (task: Task) => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    const dueDate = new Date(task.endDate);
    return dueDate >= today && dueDate <= weekFromNow && task.status !== 'completed';
  };

  const filteredTasks = state.tasks.filter(task => {
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && !task.assignees.includes(selectedAssignee)) return false;
    
    // Apply dashboard filters
    if (state.filters?.overdue && !isOverdue(task)) return false;
    if (state.filters?.dueToday && !isDueToday(task)) return false;
    if (state.filters?.dueTomorrow && !isDueTomorrow(task)) return false;
    if (state.filters?.dueThisWeek && !isDueThisWeek(task)) return false;
    
    return true;
  });

  const handleCreateTask = (taskData: Partial<Task>) => {
    // Auto-calculate progress based on status
    const autoProgress = taskData.status ? calculateTaskProgress(taskData.status) : 0;
    
    if (editingTask) {
      // Update existing task
      const updatedTask: Task = {
        ...editingTask,
        ...taskData,
        progress: taskData.progress !== undefined ? taskData.progress : autoProgress,
        startDate: taskData.startDate || editingTask.startDate,
        endDate: taskData.endDate || editingTask.endDate,
      };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        name: taskData.name || '',
        description: taskData.description || '',
        projectId: taskData.projectId || '',
        stageId: taskData.stageId || '',
        gradeId: taskData.gradeId,
        bookId: taskData.bookId,
        unitId: taskData.unitId,
        lessonId: taskData.lessonId,
        componentPath: taskData.componentPath,
        assignees: taskData.assignees || [],
        skills: taskData.skills || [],
        status: 'not-started' as TaskStatus,
        priority: taskData.priority || 'medium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        progress: autoProgress,
        estimatedHours: taskData.estimatedHours || 8,
        ...taskData,
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    }
    setIsCreateModalOpen(false);
    setEditingTask(null);
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const taskStats = {
    total: state.tasks.length,
    notStarted: state.tasks.filter(t => t.status === 'not-started').length,
    inProgress: state.tasks.filter(t => t.status === 'in-progress').length,
    completed: state.tasks.filter(t => t.status === 'completed').length,
    overdue: state.tasks.filter(t => isOverdue(t)).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Track and manage all project tasks</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
          setEditingTask(null);
          setIsCreateModalOpen(true);
        }}>
          Create Task
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-gray-50">
                <CheckSquare className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.notStarted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="under-review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Assignees</option>
            {state.users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const assignedUsers = state.users.filter(u => task.assignees.includes(u.id));
                  const overdue = isOverdue(task);
                  const project = state.projects.find(p => p.id === task.projectId);
                  const stage = project?.stages?.find(s => s.id === task.stageId);
                  
                  return (
                    <tr key={task.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {task.name}
                            {overdue && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project && <span className="font-medium">{project.name}</span>}
                            {stage && <span> → {stage.name}</span>}
                            {task.componentPath && <div className="text-xs text-blue-600">{task.componentPath}</div>}
                            {task.description && <div>{task.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {assignedUsers.slice(0, 3).map(user => (
                            <div 
                              key={user.id}
                              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium relative group"
                              title={user.name}
                            >
                              {user.name.charAt(0)}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {user.name}
                                <br />
                                <span className="text-gray-300">{user.skills[0]}</span>
                              </div>
                            </div>
                          ))}
                          {assignedUsers.length > 3 && (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                              +{assignedUsers.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(task.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{task.progress}%</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        users={state.users}
        skills={state.skills}
        projects={state.projects}
        editingTask={editingTask}
      />
    </div>
  );
}

export interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  users: any[];
  skills: string[];
  projects: any[];
  editingTask?: Task | null;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, users, skills, projects, editingTask }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    stageId: '',
    gradeId: '',
    bookId: '',
    unitId: '',
    lessonId: '',
    status: 'not-started' as TaskStatus,
    assignees: [] as string[],
    skills: [] as string[],
    priority: 'medium' as Priority,
    estimatedHours: 8,
    actualHours: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        description: editingTask.description || '',
        projectId: editingTask.projectId,
        stageId: editingTask.stageId,
        gradeId: editingTask.gradeId || '',
        bookId: editingTask.bookId || '',
        unitId: editingTask.unitId || '',
        lessonId: editingTask.lessonId || '',
        status: editingTask.status,
        assignees: editingTask.assignees,
        skills: editingTask.skills,
        priority: editingTask.priority,
        estimatedHours: editingTask.estimatedHours,
        actualHours: editingTask.actualHours || 0,
        startDate: new Date(editingTask.startDate).toISOString().split('T')[0],
        endDate: new Date(editingTask.endDate).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        projectId: '',
        stageId: '',
        gradeId: '',
        bookId: '',
        unitId: '',
        lessonId: '',
        status: 'not-started',
        assignees: [],
        skills: [],
        priority: 'medium',
        estimatedHours: 8,
        actualHours: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [editingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate progress based on status
    const autoProgress = calculateTaskProgress(formData.status);
    
    // Build component path for display
    let componentPath = '';
    const selectedProject = projects.find(p => p.id === formData.projectId);
    if (selectedProject && formData.gradeId) {
      const grade = selectedProject.grades?.find(g => g.id === formData.gradeId);
      if (grade) {
        componentPath = grade.name;
        if (formData.bookId) {
          const book = grade.books.find(b => b.id === formData.bookId);
          if (book) {
            componentPath += ` > ${book.name}`;
            if (formData.unitId) {
              const unit = book.units.find(u => u.id === formData.unitId);
              if (unit) {
                componentPath += ` > ${unit.name}`;
                if (formData.lessonId) {
                  const lesson = unit.lessons.find(l => l.id === formData.lessonId);
                  if (lesson) {
                    componentPath += ` > ${lesson.name}`;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    onSubmit({
      ...formData,
      progress: autoProgress,
      componentPath,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const availableStages = selectedProject?.stages || [];
  const availableGrades = selectedProject?.grades || [];
  const selectedGrade = availableGrades.find(g => g.id === formData.gradeId);
  const availableBooks = selectedGrade?.books || [];
  const selectedBook = availableBooks.find(b => b.id === formData.bookId);
  const availableUnits = selectedBook?.units || [];
  const selectedUnit = availableUnits.find(u => u.id === formData.unitId);
  const availableLessons = selectedUnit?.lessons || [];

  // Build availableComponents array for the component selector
  const availableComponents = [];
  
  if (selectedProject) {
    // Add grades
    selectedProject.grades?.forEach(grade => {
      availableComponents.push({
        id: grade.id,
        name: grade.name,
        type: 'grade',
        gradeId: grade.id,
        bookId: null,
        unitId: null,
        lessonId: null
      });
      
      // Add books within this grade
      grade.books?.forEach(book => {
        availableComponents.push({
          id: `${grade.id}-${book.id}`,
          name: `${grade.name} > ${book.name}`,
          type: 'book',
          gradeId: grade.id,
          bookId: book.id,
          unitId: null,
          lessonId: null
        });
        
        // Add units within this book
        book.units?.forEach(unit => {
          availableComponents.push({
            id: `${grade.id}-${book.id}-${unit.id}`,
            name: `${grade.name} > ${book.name} > ${unit.name}`,
            type: 'unit',
            gradeId: grade.id,
            bookId: book.id,
            unitId: unit.id,
            lessonId: null
          });
          
          // Add lessons within this unit
          unit.lessons?.forEach(lesson => {
            availableComponents.push({
              id: `${grade.id}-${book.id}-${unit.id}-${lesson.id}`,
              name: `${grade.name} > ${book.name} > ${unit.name} > ${lesson.name}`,
              type: 'lesson',
              gradeId: grade.id,
              bookId: book.id,
              unitId: unit.id,
              lessonId: lesson.id
            });
          });
        });
      });
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? `Edit Task: ${editingTask.name}` : "Create New Task"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task name"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, gradeId: '', bookId: '', unitId: '', lessonId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Component (Optional)
            </label>
            <select
              value={`${formData.gradeId}-${formData.bookId}-${formData.unitId}-${formData.lessonId}`.replace(/^-+|-+$/g, '')}
              onChange={(e) => {
                const selectedComponent = availableComponents.find(c => c.id === e.target.value);
                if (selectedComponent) {
                  setFormData({ 
                    ...formData, 
                    gradeId: selectedComponent.gradeId || '',
                    bookId: selectedComponent.bookId || '',
                    unitId: selectedComponent.unitId || '',
                    lessonId: selectedComponent.lessonId || ''
                  });
                } else {
                  setFormData({ 
                    ...formData, 
                    gradeId: '',
                    bookId: '',
                    unitId: '',
                    lessonId: ''
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.projectId}
            >
              <option value="">Project Level Task</option>
              {availableComponents.map(component => (
                <option key={component.id} value={component.id}>
                  {component.name} ({component.type})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a specific component to assign this task to a particular grade, book, unit, or lesson
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value as TaskStatus;
                const autoProgress = calculateTaskProgress(newStatus);
                setFormData({ ...formData, status: newStatus, progress: autoProgress });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="under-review">Under Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Progress (Auto-calculated)
              </label>
              <span className="text-sm text-blue-600 font-semibold">
                {calculateTaskProgress(formData.status)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateTaskProgress(formData.status)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Progress is automatically calculated based on task status
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {editingTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Hours
              </label>
              <input
                type="number"
                min="0"
                value={formData.actualHours}
                onChange={(e) => setFormData({ ...formData, actualHours: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignees
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {users.map(user => (
              <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.assignees.includes(user.id)}
                  onChange={() => toggleAssignee(user.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{user.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {skills.map(skill => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}