import React, { useState, useMemo, useEffect } from 'react';
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
import { allocationService, teamService, projectService, taskService, gradeService, bookService, unitService, lessonService } from '../services/apiService';
import type { TeamAllocation, Task, User as UserType } from '../types';

export function DailyAllocations() {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-08-11')); // Set to a date that has allocations
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [groupBy, setGroupBy] = useState<'team' | 'project'>('team');
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<TeamAllocation | null>(null);
  const [allocations, setAllocations] = useState<TeamAllocation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch allocations from API
  const fetchAllocations = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await allocationService.getAll(filters);
      setAllocations(result);
    } catch (err) {
      console.error('Failed to fetch allocations:', err);
      setError('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allocationsData, usersData, projectsData, tasksData, gradesData, booksData, unitsData, lessonsData] = await Promise.all([
          allocationService.getAll(),
          teamService.getMembers(),
          projectService.getAll(),
          taskService.getAll(),
          gradeService.getAll(),
          bookService.getAll(),
          unitService.getAll(),
          lessonService.getAll()
        ]);
        
        console.log('📊 Allocations data:', allocationsData);
        console.log('👥 Users data:', usersData);
        console.log('📋 Projects data:', projectsData);
        console.log('✅ Tasks data:', tasksData);
        
        setAllocations(allocationsData);
        setUsers(usersData);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Auto-create allocations from existing tasks if no allocations exist
  const createAllocationsFromTasks = async () => {
    if (allocations.length === 0 && tasks.length > 0) {
      try {
        setLoading(true);
        
        // Create allocations for each task with assignees
        for (const task of tasks) {
          if (task.assignees && task.assignees.length > 0) {
            const startDate = task.start_date || task.startDate;
            const endDate = task.end_date || task.endDate;
            const estimatedHours = task.estimated_hours || task.estimatedHours || 8;
            
            if (startDate && endDate) {
              const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
              const hoursPerDay = Math.min(estimatedHours / Math.max(daysDiff, 1), 8);
              
              for (const userId of task.assignees) {
                // Don't specify user_type - let the backend determine it
                const allocationData = {
                  user_id: userId,
                  project_id: task.project_id || task.projectId || '',
                  task_id: task.id,
                  hours_per_day: Math.round(hoursPerDay * 100) / 100,
                  start_date: new Date(startDate).toISOString().split('T')[0],
                  end_date: new Date(endDate).toISOString().split('T')[0],
                };
                
                await allocationService.create(allocationData);
              }
            }
          }
        }
        
        // Refresh allocations after creating them
        await fetchAllocations();
      } catch (err) {
        console.error('Failed to create allocations from tasks:', err);
        setError('Failed to create initial allocations');
      } finally {
        setLoading(false);
      }
    }
  };

  // Auto-create allocations when component mounts and no allocations exist
  useEffect(() => {
    if (allocations.length === 0 && !loading && tasks.length > 0) {
      createAllocationsFromTasks();
    }
  }, [allocations.length, loading, tasks.length]);

  // Fetch allocations for a specific date range
  const fetchAllocationsForDateRange = async (startDate: Date, endDate: Date) => {
    const filters = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
    await fetchAllocations(filters);
  };

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
    console.log(`🔍 getAllocationsForDate: date=${date.toISOString().split('T')[0]}, userId=${userId}, allocations.length=${allocations.length}`);
    
    const filteredAllocations = allocations.filter(allocation => {
      // Convert dates to YYYY-MM-DD format for comparison
      const allocDateStr = date.toISOString().split('T')[0];
      const startDateStr = allocation.start_date.split('T')[0];
      const endDateStr = allocation.end_date.split('T')[0];
      
      const isInDateRange = allocDateStr >= startDateStr && allocDateStr <= endDateStr;
      const isForUser = !userId || allocation.user_id?.toString() === userId;
      const isForProject = !projectId || allocation.project_id?.toString() === projectId;

      // Debug: Only log date filtering issues for specific user
      if (userId && allocation.user_id?.toString() === userId && !isInDateRange) {
        console.log(`❌ Date mismatch: Looking for ${allocDateStr}, allocation ${allocation.id} range is ${startDateStr} to ${endDateStr}`);
      }
      
      // Debug: Log ALL allocations for user 7 to see what we have
      if (userId === '7' && allocation.user_id?.toString() === userId) {
        console.log(`🔍 User 7 allocation ${allocation.id}: date ${allocDateStr}, range ${startDateStr} to ${endDateStr}, inRange: ${isInDateRange}`);
      }

      return isInDateRange && isForUser && isForProject;
    });
    
    return filteredAllocations;
  };

  const getTotalHoursForUserOnDate = (userId: string, date: Date) => {
    const userAllocations = getAllocationsForDate(date, userId);
    return userAllocations.reduce((total: number, allocation: TeamAllocation) => {
      const hours = typeof allocation.hours_per_day === 'string' 
        ? parseFloat(allocation.hours_per_day) 
        : allocation.hours_per_day || 0;
      return total + hours;
    }, 0);
  };

  const getTotalHoursForProjectOnDate = (projectId: string, date: Date) => {
    const projectAllocations = getAllocationsForDate(date, undefined, projectId);
    return projectAllocations.reduce((total: number, allocation: TeamAllocation) => {
      const hours = typeof allocation.hours_per_day === 'string' 
        ? parseFloat(allocation.hours_per_day) 
        : allocation.hours_per_day || 0;
      return total + hours;
    }, 0);
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

  const handleCreateAllocation = async (allocationData: Partial<TeamAllocation>) => {
    try {
      const newAllocation = {
        user_id: allocationData.userId || '',
        project_id: allocationData.projectId || '',
        task_id: allocationData.taskId || undefined,
        hours_per_day: allocationData.hoursPerDay || 8,
        start_date: allocationData.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        end_date: allocationData.endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      };
      
      await allocationService.create(newAllocation);
      
      // Refresh allocations
      await fetchAllocations();
      
      setIsAllocationModalOpen(false);
    } catch (err) {
      console.error('Failed to create allocation:', err);
      setError('Failed to create allocation');
    }
  };

  const renderTeamWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    console.log(`📅 Current selected date: ${selectedDate.toISOString().split('T')[0]}`);
    console.log(`📅 Week dates:`, weekDates.map(d => d.toISOString().split('T')[0]));
    
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
        {users.map(user => (
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
                                                <div className="text-sm text-gray-600">{user.skills?.[0] || 'No skills'}</div>
                  </div>
                </div>

                                  {/* Daily Allocations */}
                  {weekDates.map(date => {
                    console.log(`🎯 Rendering date ${date.toISOString().split('T')[0]} for user ${user.id}`);
       
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
                          {allocations.slice(0, 2).map((allocation: TeamAllocation) => {
                            const task = tasks.find(t => t.id === allocation.task_id);
                            const project = projects.find(p => p.id === allocation.project_id);
                            const user = users.find(u => u.id === allocation.user_id);
                            
                            return (
                              <div 
                                key={allocation.task_id || allocation.id}
                                className="text-xs bg-white rounded p-1 border"
                                title={`${project?.name}: ${task?.name} (${user?.skills?.[0]})`}
                              >
                                <div className="font-medium truncate">{task?.name}</div>
                                <div className="text-gray-600">{allocation.hours_per_day}h • {user?.skills?.[0]}</div>
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
        {projects.map(project => (
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
                  const uniqueUsers = new Set(allocations.map((a: TeamAllocation) => a.user_id)).size;
                  
                  return (
                    <div key={date.toISOString()} className="p-2 border-l border-gray-200">
                      <div className="rounded-lg p-2 text-center bg-blue-100 text-blue-800">
                        <div className="font-semibold">{totalHours}h</div>
                        <div className="text-xs mt-1">{uniqueUsers} people</div>
                      </div>
                      
                      {allocations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {allocations.slice(0, 2).map((allocation: TeamAllocation) => {
                            const user = users.find(u => u.id === allocation.user_id);
                            const task = tasks.find(t => t.id === allocation.task_id);
                            
                            return (
                              <div 
                                key={`${allocation.user_id}-${allocation.task_id}`}
                                className="text-xs bg-white rounded p-1 border"
                                title={`${user?.name}: ${task?.name}`}
                              >
                                <div className="font-medium truncate">{user?.name}</div>
                                <div className="text-gray-600">{allocation.hours_per_day}h</div>
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
          {users.map(user => {
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
                        const task = tasks.find(t => t.id === allocation.taskId);
                        const project = projects.find(p => p.id === allocation.projectId);
                        
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
          {projects.map(project => {
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
                        const user = users.find(u => u.id === allocation.userId);
                        const task = tasks.find(t => t.id === allocation.taskId);
                        
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
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                  {users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'available').length}
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
                  {users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'busy').length}
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
                  {users.filter(u => getUserWorkloadStatus(u.id, selectedDate) === 'overloaded').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading allocations...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        viewMode === 'week' ? (
          groupBy === 'team' ? renderTeamWeekView() : renderProjectWeekView()
        ) : (
          renderDayView()
        )
      )}

      {/* Add Allocation Modal */}
      <AddAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        onSubmit={handleCreateAllocation}
        users={users}
        projects={projects}
        tasks={tasks}
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