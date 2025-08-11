import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Search,
  Edit2
} from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { calculateTaskProgress } from '../utils/progressCalculator';
import { taskService, stageService, teamService, projectService, skillService } from '../services/apiService';

export function TaskManager() {
  const { state, dispatch } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks and related data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksData, teamMembersData, teamsData, stagesData, projectsData, skillsData] = await Promise.all([
          taskService.getAll(),
          teamService.getMembers(),
          teamService.getTeams(),
          stageService.getAll(),
          projectService.getAll(),
          skillService.getAll()
        ]);
        
        setTasks(tasksData);
        setTeamMembers(teamMembersData);
        setTeams(teamsData);
        setStages(stagesData);
        setProjects(projectsData);
        setSkills(skillsData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch task data:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    if (!task.endDate) return false;
    return new Date(task.endDate) < new Date() && task.status !== 'completed';
  };

  const isDueToday = (task: Task) => {
    if (!task.endDate) return false;
    const today = new Date();
    const dueDate = new Date(task.endDate);
    return today.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueTomorrow = (task: Task) => {
    if (!task.endDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.endDate);
    return tomorrow.toDateString() === dueDate.toDateString() && task.status !== 'completed';
  };

  const isDueThisWeek = (task: Task) => {
    if (!task.endDate) return false;
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    const dueDate = new Date(task.endDate);
    return dueDate >= today && dueDate <= weekFromNow && task.status !== 'completed';
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedProject !== 'all' && task.project_id !== parseInt(selectedProject)) return false;
    if (selectedAssignee !== 'all' && (!task.assignees || !task.assignees.includes(selectedAssignee))) return false;
    
    // Apply dashboard filters
    if (state.filters?.overdue && !isOverdue(task)) return false;
    if (state.filters?.dueToday && !isDueToday(task)) return false;
    if (state.filters?.dueTomorrow && !isDueTomorrow(task)) return false;
    if (state.filters?.dueThisWeek && !isDueThisWeek(task)) return false;
    
    return true;
  });

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        const updateData = {
          name: taskData.name,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          start_date: taskData.startDate,
          end_date: taskData.endDate,
          estimated_hours: taskData.estimatedHours,
          assignees: taskData.assignees || [],
          teamAssignees: taskData.teamAssignees || [],
          skills: taskData.skills
        };
        
        await taskService.update(editingTask.id, updateData);
        
        // Refresh tasks list
        const tasksData = await taskService.getAll();
        setTasks(tasksData);
      } else {
        // Convert skill names to skill IDs
        const skillIds = (taskData.skills || []).map((skillName: string) => {
          const skill = skills.find(s => s.name === skillName);
          return skill ? skill.id : null;
        }).filter(id => id !== null);

        // Create new task
        const createData = {
          name: taskData.name || '',
          description: taskData.description || '',
          project_id: parseInt(taskData.projectId || '1'),
          stage_id: parseInt(taskData.stageId || '1'), 
          status: taskData.status || 'not-started',
          priority: taskData.priority || 'medium',
          start_date: taskData.startDate || new Date().toISOString().split('T')[0],
          end_date: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimated_hours: taskData.estimatedHours || 8,
          assignees: taskData.assignees || [],
          teamAssignees: taskData.teamAssignees || [],
          skills: skillIds,
          component_path: taskData.componentPath
        };
        
        console.log('🚀 Creating task with data:', createData);
        
        const newTask = await taskService.create(createData);
        
        // Refresh tasks list
        const tasksData = await taskService.getAll();
        setTasks(tasksData);
        
        console.log('✅ Task created successfully:', newTask);
      }
      
      setIsCreateModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('❌ Failed to save task:', error);
      setError('Failed to save task');
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter((t: any) => t.status === 'not-started').length,
    inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    overdue: tasks.filter((t: any) => new Date(t.end_date) < new Date() && t.status !== 'completed').length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 mb-2">Loading tasks...</div>
            <div className="text-gray-500">Please wait while we fetch your tasks</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-medium text-red-600 mb-2">Failed to load tasks</div>
            <div className="text-gray-500 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Assignees</option>
            {teamMembers.map(user => (
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
                  const assignedUsers = teamMembers.filter(u => task.assignees && task.assignees.includes(u.id));
                  const assignedTeams = teams.filter(t => task.teamAssignees && task.teamAssignees.includes(t.id));
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
                            {project && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-blue-600">{project.name}</span>
                                {stage && <span className="text-gray-400">→</span>}
                                {stage && <span className="text-gray-600">{stage.name}</span>}
                              </div>
                            )}
                            {task.componentPath && <div className="text-xs text-purple-600 mt-1">{task.componentPath}</div>}
                            {task.description && <div className="mt-1">{task.description}</div>}
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
                        <div className="space-y-1">
                          {/* All Assignees (Individuals + Team Members) */}
                          {assignedUsers.length > 0 && (
                            <div className="flex items-center space-x-2">
                              {assignedUsers.slice(0, 5).map(user => (
                                <div 
                                  key={user.id}
                                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium relative group"
                                  title={user.name}
                                >
                                  {user.name.charAt(0)}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {user.name}
                                  </div>
                                </div>
                              ))}
                              {assignedUsers.length > 5 && (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                                  +{assignedUsers.length - 5}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {assignedUsers.length === 0 && (
                            <span className="text-xs text-gray-400">No assignees</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{task.progress || 0}%</span>
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
        users={teamMembers}
        teams={teams}
        skills={skills}
        projects={projects}
        stages={stages}
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
  teams: any[];
  skills: any[];
  projects: any[];
  stages: any[];
  editingTask?: Task | null;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, users, teams, skills, projects, editingTask }: CreateTaskModalProps) {
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
    teamAssignees: [] as string[],
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
        assignees: editingTask.assignees || [],
        teamAssignees: editingTask.teamAssignees || [],
        skills: editingTask.skills || [],
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
        teamAssignees: [],
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
      const grade = selectedProject.grades?.find((g: any) => g.id === formData.gradeId);
      if (grade) {
        componentPath = grade.name;
        if (formData.bookId) {
          const book = grade.books.find((b: any) => b.id === formData.bookId);
          if (book) {
            componentPath += ` > ${book.name}`;
            if (formData.unitId) {
              const unit = book.units.find((u: any) => u.id === formData.unitId);
              if (unit) {
                componentPath += ` > ${unit.name}`;
                if (formData.lessonId) {
                  const lesson = unit.lessons.find((l: any) => l.id === formData.lessonId);
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

  const toggleTeamAssignee = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      teamAssignees: prev.teamAssignees.includes(teamId)
        ? prev.teamAssignees.filter(id => id !== teamId)
        : [...prev.teamAssignees, teamId]
    }));
  };

  const toggleSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  // const availableStages = selectedProject?.stages || [];
  // const availableGrades = selectedProject?.grades || [];
  // const selectedGrade = availableGrades.find((g: any) => g.id === formData.gradeId);
  // const availableBooks = selectedGrade?.books || [];
  // const selectedBook = availableBooks.find((b: any) => b.id === formData.bookId);
  // const availableUnits = selectedBook?.units || [];
  // const selectedUnit = availableUnits.find((u: any) => u.id === formData.unitId);
  // const availableLessons = selectedUnit?.lessons || [];

  // Build availableComponents array for the component selector
  const availableComponents: any[] = [];
  
  if (selectedProject) {
    // Add grades
    selectedProject.grades?.forEach((grade: any) => {
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
      grade.books?.forEach((book: any) => {
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
        book.units?.forEach((unit: any) => {
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
          unit.lessons?.forEach((lesson: any) => {
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
                setFormData({ ...formData, status: newStatus });
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
            Individual Assignees
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
            Team Assignees (Will show all team members)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {teams.map(team => (
              <label key={team.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.teamAssignees.includes(team.id)}
                  onChange={() => toggleTeamAssignee(team.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{team.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            When you assign a task to a team, all individual team members will be shown as assignees
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {skills.map(skill => (
              <label key={skill.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill.name)}
                  onChange={() => toggleSkill(skill.name)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill.name}</span>
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