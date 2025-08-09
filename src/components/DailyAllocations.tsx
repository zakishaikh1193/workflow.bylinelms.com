import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  AlertTriangle,
  FolderOpen,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import type { TeamAllocation, Task, User as UserType } from '../types';

export function DailyAllocations() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [groupBy, setGroupBy] = useState<'team' | 'project'>('team');
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<TeamAllocation | null>(null);

  // Generate sample allocations for demonstration
  const sampleAllocations: TeamAllocation[] = useMemo(() => {
    const allocations: TeamAllocation[] = [];
    
    state.tasks.forEach(task => {
      task.assignees.forEach(userId => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const hoursPerDay = Math.min(task.estimatedHours / Math.max(daysDiff, 1), 8);
        
        allocations.push({
          userId,
          projectId: task.projectId,
          taskId: task.id,
          hoursPerDay: Math.round(hoursPerDay * 100) / 100,
          startDate: startDate,
          endDate: endDate,
        });
      });
    });
    
    return allocations;
  }, [state.tasks]);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getAllocationsForDate = (date: Date, userId?: string, projectId?: string) => {
    return sampleAllocations.filter(allocation => {
      const allocDate = new Date(date);
      const startDate = new Date(allocation.startDate);
      const endDate = new Date(allocation.endDate);
      
      const isInDateRange = allocDate >= startDate && allocDate <= endDate;
      const isForUser = !userId || allocation.userId === userId;
      const isForProject = !projectId || allocation.projectId === projectId;
      
      return isInDateRange && isForUser && isForProject;
    });
  };

  const getTotalHoursForUserOnDate = (userId: string, date: Date) => {
    const allocations = getAllocationsForDate(date, userId);
    return allocations.reduce((total, allocation) => total + allocation.hoursPerDay, 0);
  };

  const getTotalHoursForProjectOnDate = (projectId: string, date: Date) => {
    const allocations = getAllocationsForDate(date, undefined, projectId);
    return allocations.reduce((total, allocation) => total + allocation.hoursPerDay, 0);
  };

  const getUserWorkloadStatus = (userId: string, date: Date) => {
    const totalHours = getTotalHoursForUserOnDate(userId, date);
    if (totalHours === 0) return 'available';
    if (totalHours > 8) return 'overloaded';
    if (totalHours >= 6) return 'busy';
    return 'normal';
  };

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'overloaded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const formatDateRange = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const handleCreateAllocation = (allocationData: Partial<TeamAllocation>) => {
    const newAllocation: TeamAllocation = {
      userId: allocationData.userId || '',
      projectId: allocationData.projectId || '',
      taskId: allocationData.taskId || '',
      hoursPerDay: allocationData.hoursPerDay || 8,
      startDate: allocationData.startDate || new Date(),
      endDate: allocationData.endDate || new Date(),
    };
    
    // Add to allocations state and update sample allocations
    dispatch({ type: 'ADD_ALLOCATION', payload: newAllocation });
    
    // Force re-render by updating the component state
    setIsAllocationModalOpen(false);
    // Trigger a re-render to show the new allocation
    window.location.reload();
    setIsAllocationModalOpen(false);
  };

  const renderTeamWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="font-medium text-gray-700 p-2">Team Member</div>
          {weekDates.map(date => (
            <div key={date.toISOString()} className="text-center p-2">
              <div className="font-medium text-gray-700">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm text-gray-500">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Team Member Rows */}
        {state.users.map(user => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-8 gap-2">
                {/* User Info */}
                <div className="p-4 bg-gray-50 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.skills[0]}</div>
                  </div>
                </div>

                {/* Daily Allocations */}
                {weekDates.map(date => {
                  const allocations = getAllocationsForDate(date, user.id);
                  const totalHours = getTotalHoursForUserOnDate(user.id, date);
                  const status = getUserWorkloadStatus(user.id, date);
                  
                  return (
                    <div key={date.toISOString()} className="p-2 border-l border-gray-200">
                      <div className={`rounded-lg p-2 text-center ${getWorkloadColor(status)}`}>
                        <div className="font-semibold">{totalHours}h</div>
                        <div className="text-xs mt-1">{allocations.length} tasks</div>
                      </div>
                      
                      {allocations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {allocations.slice(0, 2).map(allocation => {
                            const task = state.tasks.find(t => t.id === allocation.taskId);
                            const project = state.projects.find(p => p.id === allocation.projectId);
                            const user = state.users.find(u => u.id === allocation.userId);
                            
                            return (
                              <div 
                                key={allocation.taskId}
                                className="text-xs bg-white rounded p-1 border"
                                title={`${project?.name}: ${task?.name} (${user?.skills[0]})`}
                              >
                                <div className="font-medium truncate">{task?.name}</div>
                                <div className="text-gray-600">{allocation.hoursPerDay}h • {user?.skills[0]}</div>
                              </div>
                            );
                          })}
                          {allocations.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{allocations.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderProjectWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="font-medium text-gray-700 p-2">Project</div>
          {weekDates.map(date => (
            <div key={date.toISOString()} className="text-center p-2">
              <div className="font-medium text-gray-700">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm text-gray-500">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Project Rows */}
        {state.projects.map(project => (
          <Card key={project.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-8 gap-2">
                {/* Project Info */}
                <div className="p-4 bg-gray-50 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.category}</div>
                  </div>
                </div>

                {/* Daily Project Allocations */}
                {weekDates.map(date => {
                  const allocations = getAllocationsForDate(date, undefined, project.id);
                  const totalHours = getTotalHoursForProjectOnDate(project.id, date);
                  const uniqueUsers = new Set(allocations.map(a => a.userId)).size;
                  
                  return (
                    <div key={date.toISOString()} className="p-2 border-l border-gray-200">
                      <div className="rounded-lg p-2 text-center bg-blue-100 text-blue-800">
                        <div className="font-semibold">{totalHours}h</div>
                        <div className="text-xs mt-1">{uniqueUsers} people</div>
                      </div>
                      
                      {allocations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {allocations.slice(0, 2).map(allocation => {
                            const user = state.users.find(u => u.id === allocation.userId);
                            const task = state.tasks.find(t => t.id === allocation.taskId);
                            
                            return (
                              <div 
                                key={`${allocation.userId}-${allocation.taskId}`}
                                className="text-xs bg-white rounded p-1 border"
                                title={`${user?.name}: ${task?.name}`}
                              >
                                <div className="font-medium truncate">{user?.name}</div>
                                <div className="text-gray-600">{allocation.hoursPerDay}h</div>
                              </div>
                            );
                          })}
                          {allocations.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{allocations.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    if (groupBy === 'team') {
      return (
        <div className="space-y-6">
          {state.users.map(user => {
            const allocations = getAllocationsForDate(selectedDate, user.id);
            const totalHours = getTotalHoursForUserOnDate(user.id, selectedDate);
            const status = getUserWorkloadStatus(user.id, selectedDate);
            
            return (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <p className="text-sm text-gray-600">{user.skills.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        status === 'available' ? 'success' :
                        status === 'overloaded' ? 'danger' :
                        status === 'busy' ? 'warning' : 'primary'
                      }>
                        {totalHours}h allocated
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {allocations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No tasks allocated for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allocations.map(allocation => {
                        const task = state.tasks.find(t => t.id === allocation.taskId);
                        const project = state.projects.find(p => p.id === allocation.projectId);
                        
                        return (
                          <div key={allocation.taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{task?.name}</div>
                              <div className="text-sm text-gray-600">{project?.name}</div>
                              <div className="flex items-center mt-1 space-x-4">
                                <Badge variant="secondary" size="sm">
                                  {task?.priority}
                                </Badge>
                                <Badge variant={
                                  task?.status === 'completed' ? 'success' :
                                  task?.status === 'in-progress' ? 'primary' :
                                  task?.status === 'blocked' ? 'danger' : 'default'
                                } size="sm">
                                  {task?.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">{allocation.hoursPerDay}h</div>
                              <div className="text-sm text-gray-600">allocated</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    } else {
      // Project-based day view
      return (
        <div className="space-y-6">
          {state.projects.map(project => {
            const allocations = getAllocationsForDate(selectedDate, undefined, project.id);
            const totalHours = getTotalHoursForProjectOnDate(project.id, selectedDate);
            const uniqueUsers = new Set(allocations.map(a => a.userId)).size;
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <p className="text-sm text-gray-600">{project.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="primary">
                        {totalHours}h • {uniqueUsers} people
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {allocations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No allocations for this project today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allocations.map(allocation => {
                        const user = state.users.find(u => u.id === allocation.userId);
                        const task = state.tasks.find(t => t.id === allocation.taskId);
                        
                        return (
                          <div key={`${allocation.userId}-${allocation.taskId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{task?.name}</div>
                              <div className="text-sm text-gray-600">Assigned to: {user?.name}</div>
                              <div className="flex items-center mt-1 space-x-4">
                                <Badge variant="secondary" size="sm">
                                  {task?.priority}
                                </Badge>
                                <Badge variant={
                                  task?.status === 'completed' ? 'success' :
                                  task?.status === 'in-progress' ? 'primary' :
                                  task?.status === 'blocked' ? 'danger' : 'default'
                                } size="sm">
                                  {task?.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">{allocation.hoursPerDay}h</div>
                              <div className="text-sm text-gray-600">allocated</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Allocations</h1>
          <p className="text-gray-600">View team member and project task allocations</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsAllocationModalOpen(true)}>
          Add Allocation
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="font-medium text-gray-900 min-w-[200px] text-center">
              {formatDateRange()}
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Group By Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Group by:</span>
            <Button
              variant={groupBy === 'team' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setGroupBy('team')}
            >
              <Users className="w-4 h-4 mr-1" />
              Team
            </Button>
            <Button
              variant={groupBy === 'project' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setGroupBy('project')}
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              Project
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'day' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Team</p>
                <p className="text-2xl font-bold text-gray-900">{state.users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-50">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Busy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'busy').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Overloaded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {state.users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'overloaded').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'week' ? (
        groupBy === 'team' ? renderTeamWeekView() : renderProjectWeekView()
      ) : (
        renderDayView()
      )}

      {/* Add Allocation Modal */}
      <AddAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        onSubmit={handleCreateAllocation}
        users={state.users}
        projects={state.projects}
        tasks={state.tasks}
      />
    </div>
  );
}

interface AddAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (allocation: Partial<TeamAllocation>) => void;
  users: any[];
  projects: any[];
  tasks: any[];
}

function AddAllocationModal({ isOpen, onClose, onSubmit, users, projects, tasks }: AddAllocationModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    projectId: '',
    taskId: '',
    hoursPerDay: 8,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    setFormData({
      userId: '',
      projectId: '',
      taskId: '',
      hoursPerDay: 8,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const availableTasks = tasks.filter(task => 
    !formData.projectId || task.projectId === formData.projectId
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Team Allocation" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Member *
            </label>
            <select
              required
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Team Member</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task *
            </label>
            <select
              required
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.projectId}
            >
              <option value="">Select Task</option>
              {availableTasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Day
            </label>
            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={formData.hoursPerDay}
              onChange={(e) => setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
}