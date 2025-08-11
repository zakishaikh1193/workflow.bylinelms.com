import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CheckSquare, 
  Clock,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Flag,
  AlertTriangle,
  Layers,
  UserPlus,
  X,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Project, Task, Stage, TaskStatus, Priority } from '../types';
import { calculateProjectProgress, calculateStageProgress } from '../utils/progressCalculator';
import { calculateTaskProgress } from '../utils/progressCalculator';
import { CreateTaskModal } from './TaskManager';
import { EditProjectModal } from './modals/EditProjectModal';
import { ProjectComponents } from './ProjectComponents';
import EducationalHierarchy from './EducationalHierarchy';
import { projectService, teamService } from '../services/apiService';

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetails({ project, onBack }: ProjectDetailsProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'tasks' | 'timeline' | 'team' | 'components' | 'educational-hierarchy'>('overview');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectTeams, setProjectTeams] = useState<any[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const projectTasks = state.tasks.filter(task => task.projectId === project.id);
  const projectProgress = calculateProjectProgress(project, projectTasks);

  // Fetch project members, teams, and available team members
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [members, teams, teamMembers, availableTeamsData] = await Promise.all([
          projectService.getMembers(project.id),
          projectService.getTeams(project.id),
          teamService.getMembers(),
          teamService.getTeams()
        ]);
        setProjectMembers(members);
        setProjectTeams(teams);
        setAvailableTeamMembers(teamMembers);
        setAvailableTeams(availableTeamsData);
      } catch (error) {
        console.error('Failed to fetch project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project.id]);

  const handleAddMember = async (memberId: number, role: string = 'member') => {
    try {
      await projectService.addMember(project.id, { 
        user_id: memberId, 
        user_type: 'team',
        role 
      });
      
      // Refresh project members
      const members = await projectService.getMembers(project.id);
      setProjectMembers(members);
      setIsAddMemberModalOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleAddTeam = async (teamId: number, role: string = 'member') => {
    try {
      await projectService.addTeam(project.id, { 
        team_id: teamId, 
        role 
      });
      
      // Refresh project members and teams
      const [members, teams] = await Promise.all([
        projectService.getMembers(project.id),
        projectService.getTeams(project.id)
      ]);
      setProjectMembers(members);
      setProjectTeams(teams);
      setIsAddTeamModalOpen(false);
    } catch (error) {
      console.error('Failed to add team:', error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await projectService.removeMember(project.id, memberId);
      
      // Refresh project members
      const members = await projectService.getMembers(project.id);
      setProjectMembers(members);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleRemoveTeam = async (teamId: number) => {
    try {
      await projectService.removeTeam(project.id, teamId);
      
      // Refresh project members and teams
      const [members, teams] = await Promise.all([
        projectService.getMembers(project.id),
        projectService.getTeams(project.id)
      ]);
      setProjectMembers(members);
      setProjectTeams(teams);
    } catch (error) {
      console.error('Failed to remove team:', error);
    }
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    // Auto-calculate progress based on status
    const autoProgress = taskData.status ? calculateTaskProgress(taskData.status) : 0;
    
    // Build component path for display
    let componentPath = '';
    if (taskData.gradeId) {
      const grade = project.grades?.find(g => g.id === taskData.gradeId);
      if (grade) {
        componentPath = grade.name;
        if (taskData.bookId) {
          const book = grade.books.find(b => b.id === taskData.bookId);
          if (book) {
            componentPath += ` > ${book.name}`;
            if (taskData.unitId) {
              const unit = book.units.find(u => u.id === taskData.unitId);
              if (unit) {
                componentPath += ` > ${unit.name}`;
                if (taskData.lessonId) {
                  const lesson = unit.lessons.find(l => l.id === taskData.lessonId);
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
    
    const newTask: Task = {
      id: Date.now().toString(),
      name: taskData.name || '',
      description: taskData.description || '',
      projectId: project.id,
      stageId: taskData.stageId || '',
      gradeId: taskData.gradeId,
      bookId: taskData.bookId,
      unitId: taskData.unitId,
      lessonId: taskData.lessonId,
      componentPath,
      assignees: taskData.assignees || [],
      skills: taskData.skills || [],
      status: taskData.status || 'not-started',
      priority: taskData.priority || 'medium',
      startDate: taskData.startDate || new Date(),
      endDate: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: autoProgress,
      estimatedHours: taskData.estimatedHours || 8,
      actualHours: taskData.actualHours || 0,
    };
    
    dispatch({ type: 'ADD_TASK', payload: newTask });
    setIsCreateTaskModalOpen(false);
  };

  const handleEditProject = (projectData: Partial<Project>) => {
    const updatedProject: Project = {
      ...project,
      ...projectData,
      startDate: projectData.startDate || project.startDate,
      endDate: projectData.endDate || project.endDate,
    };
    
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    setIsEditProjectModalOpen(false);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'stages', label: 'Stages', icon: Flag },
    { key: 'components', label: 'Components', icon: Layers },
    { key: 'educational-hierarchy', label: 'Educational Hierarchy', icon: GraduationCap },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'timeline', label: 'Timeline', icon: Calendar },
    { key: 'team', label: 'Team', icon: Users },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{projectProgress.progress}%</p>
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
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{projectTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team</p>
                <p className="text-2xl font-bold text-gray-900">{projectMembers.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Days Left</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{project.description}</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              Start: {new Date(project.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              End: {new Date(project.endDate).toLocaleDateString()}
            </div>
            <Badge variant={
              project.status === 'active' ? 'primary' :
              project.status === 'completed' ? 'success' :
              project.status === 'on-hold' ? 'warning' : 'default'
            }>
              {project.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTimeline = () => {
    // Create timeline data combining stages and tasks
    const timelineItems = [];
    
    // Add project milestones
    timelineItems.push({
      id: 'project-start',
      type: 'milestone',
      title: 'Project Start',
      date: new Date(project.startDate),
      status: 'completed',
      description: 'Project officially started'
    });

    // Add stages to timeline
    project.stages?.forEach(stage => {
      const stageProgress = calculateStageProgress(stage.id, projectTasks);
      timelineItems.push({
        id: stage.id,
        type: 'stage',
        title: stage.name,
        date: new Date(stage.startDate),
        endDate: new Date(stage.endDate),
        status: stage.status,
        progress: stageProgress.progress,
        description: stage.description,
        weight: stage.weight
      });
    });

    // Add major tasks to timeline
    projectTasks.filter(task => task.priority === 'high' || task.priority === 'urgent').forEach(task => {
      timelineItems.push({
        id: task.id,
        type: 'task',
        title: task.name,
        date: new Date(task.startDate),
        endDate: new Date(task.endDate),
        status: task.status,
        progress: task.progress,
        description: task.description,
        priority: task.priority,
        assignees: task.assignees
      });
    });

    // Add project end milestone
    timelineItems.push({
      id: 'project-end',
      type: 'milestone',
      title: 'Project Completion',
      date: new Date(project.endDate),
      status: project.status === 'completed' ? 'completed' : 'pending',
      description: 'Planned project completion date'
    });

    // Sort by date
    timelineItems.sort((a, b) => a.date.getTime() - b.date.getTime());

    const getStatusColor = (status: string, type: string) => {
      if (type === 'milestone') {
        return status === 'completed' ? 'bg-green-500' : 'bg-gray-400';
      }
      switch (status) {
        case 'completed': return 'bg-green-500';
        case 'in-progress': return 'bg-blue-500';
        case 'under-review': return 'bg-yellow-500';
        case 'not-started': return 'bg-gray-400';
        case 'blocked': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    };

    const isOverdue = (item: any) => {
      return new Date(item.endDate || item.date) < new Date() && 
             item.status !== 'completed' && 
             item.type !== 'milestone';
    };

    return (
      <div className="space-y-6">
        {/* Timeline Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
            <p className="text-sm text-gray-600">Track project milestones, stages, and key tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span>Not Started</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Overdue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline items */}
              <div className="space-y-8">
                {timelineItems.map((item, index) => (
                  <div key={item.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-12 h-12 rounded-full ${getStatusColor(item.status, item.type)} flex items-center justify-center`}>
                      {item.type === 'milestone' && <Flag className="w-5 h-5 text-white" />}
                      {item.type === 'stage' && <BarChart3 className="w-5 h-5 text-white" />}
                      {item.type === 'task' && <CheckSquare className="w-5 h-5 text-white" />}
                    </div>

                    {/* Timeline content */}
                    <div className="ml-6 flex-1">
                      <div className={`p-4 rounded-lg border-2 ${
                        isOverdue(item) ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              {item.type === 'stage' && (item as any).weight && (
                                <Badge variant="secondary" size="sm">
                                  {(item as any).weight}% weight
                                </Badge>
                              )}
                              {(item as any).priority && (
                                <Badge variant={
                                  (item as any).priority === 'urgent' ? 'danger' :
                                  (item as any).priority === 'high' ? 'warning' : 'primary'
                                } size="sm">
                                  {(item as any).priority}
                                </Badge>
                              )}
                              {isOverdue(item) && (
                                <Badge variant="danger" size="sm">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {item.date.toLocaleDateString()}
                                {(item as any).endDate && ` - ${(item as any).endDate.toLocaleDateString()}`}
                              </div>
                              
                              {(item as any).assignees && (item as any).assignees.length > 0 && (
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {(item as any).assignees.length} assigned
                                </div>
                              )}
                            </div>

                            {/* Progress bar for stages and tasks */}
                            {(item.type === 'stage' || item.type === 'task') && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{(item as any).progress}%</span>
                                </div>
                                <ProgressBar value={(item as any).progress} showLabel={false} />
                              </div>
                            )}
                          </div>

                          <Badge variant={
                            item.status === 'completed' ? 'success' :
                            item.status === 'in-progress' ? 'primary' :
                            item.status === 'under-review' ? 'warning' :
                            item.status === 'blocked' ? 'danger' : 'default'
                          }>
                            {item.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {timelineItems.filter(item => item.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed Items</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {timelineItems.filter(item => item.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {timelineItems.filter(item => isOverdue(item)).length}
                </div>
                <div className="text-sm text-gray-600">Overdue Items</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStages = () => (
    <div className="space-y-6">
      {project.stages && project.stages.length > 0 ? (
        project.stages.map((stage) => {
          const stageTasks = projectTasks.filter(task => task.stageId === stage.id);
          const stageProgress = calculateStageProgress(stage.id, projectTasks);
          
          return (
            <Card key={stage.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Stage {stage.order}: {stage.name}
                      <Badge variant="secondary" size="sm" className="ml-2">
                        {stage.weight}% weight
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                  </div>
                  <Badge variant={
                    stage.status === 'completed' ? 'success' :
                    stage.status === 'in-progress' ? 'primary' :
                    stage.status === 'under-review' ? 'warning' : 'default'
                  }>
                    {stage.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Start: {new Date(stage.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    End: {new Date(stage.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    {stageTasks.length} tasks
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{stageProgress.progress}%</span>
                  </div>
                  <ProgressBar value={stageProgress.progress} />
                </div>

                {stageTasks.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Recent Tasks:</h5>
                    {stageTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{task.name}</span>
                        <Badge variant={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in-progress' ? 'primary' :
                          task.status === 'under-review' ? 'warning' :
                          task.status === 'blocked' ? 'danger' : 'default'
                        } size="sm">
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {stageTasks.length > 3 && (
                      <p className="text-xs text-gray-500">+{stageTasks.length - 3} more tasks</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stages Defined</h3>
            <p className="text-gray-600">This project doesn't have any stages configured yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateTaskModalOpen(true)}>
          Add Task
        </Button>
      </div>

      {projectTasks.length > 0 ? (
        <div className="space-y-4">
          {projectTasks.map((task) => {
            const assignedUsers = state.users.filter(u => task.assignees && task.assignees.includes(u.id));
            const stage = project.stages?.find(s => s.id === task.stageId);
            
            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {stage && (
                        <p className="text-xs text-blue-600 mt-1">Stage: {stage.name}</p>
                      )}
                      {task.componentPath && (
                        <p className="text-xs text-purple-600 mt-1">{task.componentPath}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Due: {new Date(task.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.estimatedHours}h estimated
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        {assignedUsers.slice(0, 3).map(user => (
                          <div 
                            key={user.id}
                            className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium relative group"
                            title={user.name}
                          >
                            {user.name.charAt(0)}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {user.name}
                              <br />
                                                              <span className="text-gray-300">{user.skills?.[0] || 'No skills'}</span>
                            </div>
                          </div>
                        ))}
                        {assignedUsers.length > 3 && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                            +{assignedUsers.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
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
                      } size="sm">
                        {task.priority}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                        <div className="w-20">
                          <ProgressBar value={task.progress} showLabel={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first task for this project.</p>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateTaskModalOpen(true)}>
              Create First Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Team</h3>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsAddTeamModalOpen(true)}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Users className="w-4 h-4" />
            <span>Add Team</span>
          </Button>
          <Button 
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>
      
      {/* Teams Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Assigned Teams</h4>
        {projectTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {projectTeams.map((team) => (
               <Card key={team.id}>
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                         <Users className="w-5 h-5" />
                       </div>
                       <div>
                         <h5 className="font-medium text-gray-900">{team.team_name}</h5>
                         <Badge variant="secondary" className="text-xs">{team.role}</Badge>
                       </div>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleRemoveTeam(team.id)}
                       className="text-red-600 hover:text-red-700 hover:bg-red-50"
                     >
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Members</span>
                      <span className="font-medium">{team.member_count} / {team.max_capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min((team.member_count / team.max_capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No teams assigned to this project</p>
          </div>
        )}
      </div>

      {/* Individual Members Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Individual Members</h4>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading team members...</div>
        </div>
      ) : projectMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectMembers.map((member) => {
            const memberTasks = projectTasks.filter(task => task.assignees && task.assignees.includes(member.user_id || member.team_member_id));
            const completedTasks = memberTasks.filter(task => task.status === 'completed');
            const completionRate = memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0;
            
            return (
              <Card key={member.project_member_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {member.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name || 'Unknown User'}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{member.role || 'member'}</Badge>
                          {member.skills && (
                            <p className="text-sm text-gray-600">{member.skills.join?.(', ') || member.skills}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.project_member_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tasks Assigned</span>
                      <span className="font-medium">{memberTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-medium text-green-600">{completedTasks.length}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                      <ProgressBar value={completionRate} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
                 <Card>
           <CardContent className="p-8 text-center">
             <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
             <p className="text-gray-600 mb-4">No team members have been assigned to this project yet.</p>
             <Button 
               onClick={() => setIsAddMemberModalOpen(true)}
               className="flex items-center space-x-2"
             >
               <UserPlus className="w-4 h-4" />
               <span>Add First Member</span>
             </Button>
           </CardContent>
         </Card>
       )}
       </div>
     </div>
   );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={
            project.status === 'active' ? 'primary' :
            project.status === 'completed' ? 'success' :
            project.status === 'on-hold' ? 'warning' : 'default'
          }>
            {project.status}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditProjectModalOpen(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">{projectProgress.progress}%</span>
            </div>
            <ProgressBar value={projectProgress.progress} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'stages' && renderStages()}
        {activeTab === 'components' && <ProjectComponents project={project} onBack={onBack} />}
        {activeTab === 'educational-hierarchy' && <EducationalHierarchy projectId={Number(project.id)} />}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'team' && renderTeam()}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        users={state.users}
        skills={state.skills}
        projects={state.projects}
        stages={[]}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSubmit={handleEditProject}
        project={project}
        categories={state.categories}
        users={state.users}
      />

             {/* Add Member Modal */}
       <AddMemberModal
         isOpen={isAddMemberModalOpen}
         onClose={() => setIsAddMemberModalOpen(false)}
         onSubmit={handleAddMember}
         availableMembers={availableTeamMembers}
         projectMembers={projectMembers}
       />
       
       {/* Add Team Modal */}
       <AddTeamModal
         isOpen={isAddTeamModalOpen}
         onClose={() => setIsAddTeamModalOpen(false)}
         onSubmit={handleAddTeam}
         availableTeams={availableTeams}
         projectTeams={projectTeams}
       />
     </div>
   );
 }

// Add Team Modal Component
interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamId: number, role: string) => void;
  availableTeams: any[];
  projectTeams: any[];
}

function AddTeamModal({ isOpen, onClose, onSubmit, availableTeams, projectTeams }: AddTeamModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');

  const assignedTeamIds = projectTeams.map(pt => pt.team_id);
  const unassignedTeams = availableTeams.filter(team => 
    !assignedTeamIds.includes(team.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeamId) {
      onSubmit(selectedTeamId, selectedRole);
      setSelectedTeamId(null);
      setSelectedRole('member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team to Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team
          </label>
          <select
            value={selectedTeamId || ''}
            onChange={(e) => setSelectedTeamId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a team...</option>
            {unassignedTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} - {team.member_count || 0} members
              </option>
            ))}
          </select>
          {unassignedTeams.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              All teams are already assigned to this project.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
                     <select
             value={selectedRole}
             onChange={(e) => setSelectedRole(e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           >
             <option value="member">Member</option>
             <option value="admin">Admin</option>
             <option value="owner">Owner</option>
             <option value="viewer">Viewer</option>
           </select>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> When you assign a team to this project, all team members will automatically be added as individual project members.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!selectedTeamId || unassignedTeams.length === 0}
          >
            Add Team
          </Button>
        </div>
      </form>
    </Modal>
  );
 }

// Add Member Modal Component
interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberId: number, role: string) => void;
  availableMembers: any[];
  projectMembers: any[];
}

function AddMemberModal({ isOpen, onClose, onSubmit, availableMembers, projectMembers }: AddMemberModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');

  const assignedMemberIds = projectMembers.map(pm => pm.user_id || pm.team_member_id);
  const unassignedMembers = availableMembers.filter(member => 
    !assignedMemberIds.includes(member.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId) {
      onSubmit(selectedMemberId, selectedRole);
      setSelectedMemberId(null);
      setSelectedRole('member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team Member
          </label>
          <select
            value={selectedMemberId || ''}
            onChange={(e) => setSelectedMemberId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a team member...</option>
            {unassignedMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
          {unassignedMembers.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              All team members are already assigned to this project.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!selectedMemberId || unassignedMembers.length === 0}
          >
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}