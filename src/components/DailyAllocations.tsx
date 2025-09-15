import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  User, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  FolderOpen,
  Users,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { allocationService } from '../services/apiService';

interface DailyAllocation {
  id: string;
  user_id: number;
  user_type: string;
  user_name: string;
  user_email: string;
  user_skills: string[];
  project_id: number;
  project_name: string;
  project_category: string;
  task_id: number;
  task_name: string;
  task_status: string;
  task_priority: string;
  hours_per_day: number;
  date: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
}

interface GroupedData {
  [userId: string]: {
    user_id: number;
    user_name: string;
    user_email: string;
    user_skills: string[];
    daily_allocations: {
      [date: string]: {
        date: string;
        total_hours: number;
        tasks: Array<{
          task_id: number;
          task_name: string;
          project_name: string;
          hours_per_day: number;
          status: string;
          priority: string;
        }>;
      };
    };
  };
}

interface SummaryStats {
  total_allocations: number;
  total_users: number;
  total_dates: number;
  user_stats: Array<{
    user_id: number;
    user_name: string;
    total_hours: number;
    total_tasks: number;
    dates_worked: number;
  }>;
  date_stats: Array<{
    date: string;
    total_hours: number;
    total_tasks: number;
    unique_users: number;
  }>;
}

interface BackendResponse {
  success: boolean;
  data: {
    allocations: DailyAllocation[];
    grouped: GroupedData;
    summary: SummaryStats;
    date_range: {
      start: string;
      end: string;
    };
  };
}

interface DailyAllocationsProps {
  onNavigateToTask?: (taskId: number) => void;
}

export function DailyAllocations({ onNavigateToTask }: DailyAllocationsProps = {}) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [groupBy, setGroupBy] = useState<'team' | 'project'>('team');
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendData, setBackendData] = useState<BackendResponse['data'] | null>(null);
  
  // Filter states
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  
  // Daily allocation modal states
  const [isDailyAllocationModalOpen, setIsDailyAllocationModalOpen] = useState(false);
  const [selectedDailyAllocation, setSelectedDailyAllocation] = useState<{
    user: any;
    date: string;
    tasks: any[];
    totalHours: number;
  } | null>(null);

  // Fetch daily allocations from backend
  const fetchDailyAllocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range based on current view
      let startDate, endDate;
      if (viewMode === 'week') {
        const weekDates = getWeekDates(selectedDate);
        startDate = weekDates[0].toISOString().split('T')[0];
        endDate = weekDates[6].toISOString().split('T')[0];
      } else if (viewMode === 'day') {
        const dateStr = selectedDate.toISOString().split('T')[0];
        startDate = dateStr;
        endDate = dateStr;
      } else {
        // Month view - get first and last day of month
        const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      }
      
      console.log('🔍 Fetching daily allocations for date range:', { startDate, endDate, groupBy });
      
      const result = await allocationService.getDaily({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy
      });
      
      console.log('📊 Daily allocations result:', result);
      console.log('🔍 Result structure:', { 
        hasData: !!result.data, 
        hasAllocations: !!result.allocations, 
        hasGrouped: !!result.grouped,
        resultKeys: Object.keys(result)
      });
      
      // Handle both possible response structures
      const responseData = result.data || result;
      setBackendData(responseData);
      
    } catch (err) {
      console.error('Failed to fetch daily allocations:', err);
      setError('Failed to load daily allocations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    if (user) {
      fetchDailyAllocations();
    }
  }, [user, viewMode, selectedDate, groupBy]);

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

  const getUserWorkloadStatus = (totalHours: number) => {
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

  // Get unique teams from backend data
  const getUniqueTeams = () => {
    if (!backendData?.allocations) return [];
    
    const teams = new Set<string>();
    backendData.allocations.forEach(allocation => {
      if (allocation.user_skills && allocation.user_skills.length > 0) {
        allocation.user_skills.forEach(skill => teams.add(skill));
      }
    });
    
    return Array.from(teams).sort();
  };

  // Get unique members from backend data, optionally filtered by team
  const getUniqueMembers = () => {
    if (!backendData?.grouped) return [];
    
    const members = Object.values(backendData.grouped).filter(member => 
      member && member.user_id && member.user_name
    );
    
    if (selectedTeam === 'all') {
      return members;
    }
    
    // Filter by selected team
    return members.filter(member => 
      member.user_skills && member.user_skills.includes(selectedTeam)
    );
  };

  // Filter grouped data based on selected filters
  const getFilteredGroupedData = () => {
    if (!backendData?.grouped) return {};
    
    let filteredData = { ...backendData.grouped };
    
    // Filter by team
    if (selectedTeam !== 'all') {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([_, member]) => 
          member && member.user_skills && member.user_skills.includes(selectedTeam)
        )
      );
    }
    
    // Filter by specific member
    if (selectedMember !== 'all') {
      filteredData = Object.fromEntries(
        Object.entries(filteredData).filter(([userId, member]) => 
          userId === selectedMember && member && member.user_id
        )
      );
    }
    
    return filteredData;
  };

  // Open daily allocation modal
  const openDailyAllocationModal = (user: any, date: string, dayData: any) => {
    setSelectedDailyAllocation({
      user,
      date,
      tasks: dayData?.tasks || [],
      totalHours: dayData?.total_hours || 0
    });
    setIsDailyAllocationModalOpen(true);
  };

  // Navigate to task details
  const navigateToTaskDetails = (taskId: number) => {
    setIsDailyAllocationModalOpen(false);
    if (onNavigateToTask) {
      onNavigateToTask(taskId);
    } else {
      console.log('Navigate to task details for task ID:', taskId);
    }
  };

  const renderTeamWeekView = () => {
    if (!backendData || !backendData.grouped) {
      return <div className="text-center text-gray-500 p-8">Loading allocation data...</div>;
    }

    const weekDates = getWeekDates(selectedDate);
    const filteredGroupedData = getFilteredGroupedData();
    const users = Object.values(filteredGroupedData);

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
        {users.filter(user => user && user.user_id && user.user_name).map(user => (
          <Card key={user.user_id || 'unknown'} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-8 gap-2">
                {/* User Info */}
                <div className="p-4 bg-gray-50 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.user_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.user_name || 'Unknown User'}</div>
                    <div className="text-sm text-gray-600">{user.user_skills?.[0] || 'No skills'}</div>
                  </div>
                </div>

                {/* Daily Allocations */}
                {weekDates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayData = user.daily_allocations[dateStr];
                  const totalHours = dayData?.total_hours || 0;
                  const tasks = dayData?.tasks || [];
                  const status = getUserWorkloadStatus(totalHours);
                  
                  return (
                    <div key={date.toISOString()} className="p-2 border-l border-gray-200">
                      <div 
                        className={`rounded-lg p-2 text-center cursor-pointer hover:opacity-80 transition-opacity ${getWorkloadColor(status)}`}
                        onClick={() => openDailyAllocationModal(user, dateStr, dayData)}
                        title={`Click to view ${tasks.length} tasks for ${user.user_name} on ${date.toLocaleDateString()}`}
                      >
                        <div className="font-semibold">{totalHours.toFixed(1)}h</div>
                        <div className="text-xs mt-1">{tasks.length} tasks</div>
                      </div>
                      
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
    if (!backendData || !backendData.allocations) {
      return <div className="text-center text-gray-500 p-8">Loading allocation data...</div>;
    }

    const weekDates = getWeekDates(selectedDate);
    
    // Group allocations by project
    const projectGroups: { [projectId: string]: {
      project_id: number;
      project_name: string;
      project_category: string;
      daily_allocations: { [date: string]: DailyAllocation[] };
    }} = {};

    backendData.allocations.forEach(allocation => {
      const projectId = allocation.project_id.toString();
      if (!projectGroups[projectId]) {
        projectGroups[projectId] = {
          project_id: allocation.project_id,
          project_name: allocation.project_name,
          project_category: allocation.project_category,
          daily_allocations: {}
        };
      }
      
      if (!projectGroups[projectId].daily_allocations[allocation.date]) {
        projectGroups[projectId].daily_allocations[allocation.date] = [];
      }
      projectGroups[projectId].daily_allocations[allocation.date].push(allocation);
    });

    const projects = Object.values(projectGroups);

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
          <Card key={project.project_id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-8 gap-2">
                {/* Project Info */}
                <div className="p-4 bg-gray-50 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{project.project_name}</div>
                    <div className="text-sm text-gray-600">{project.project_category}</div>
                  </div>
                </div>

                {/* Daily Project Allocations */}
                {weekDates.map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayAllocations = project.daily_allocations[dateStr] || [];
                  const totalHours = dayAllocations.reduce((sum, alloc) => sum + alloc.hours_per_day, 0);
                  const uniqueUsers = new Set(dayAllocations.map(a => a.user_id)).size;
                  
                  return (
                    <div key={date.toISOString()} className="p-2 border-l border-gray-200">
                      <div className="rounded-lg p-2 text-center bg-blue-100 text-blue-800">
                        <div className="font-semibold">{totalHours.toFixed(1)}h</div>
                        <div className="text-xs mt-1">{uniqueUsers} people</div>
                      </div>
                      
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
    if (!backendData) {
      return <div className="text-center text-gray-500 p-8">Loading allocation data...</div>;
    }

    if (groupBy === 'team') {
      const users = Object.values(backendData.grouped || {});
      const selectedDateStr = selectedDate.toISOString().split('T')[0];

      return (
        <div className="space-y-6">
          {users.filter(user => user && user.user_id && user.user_name).map(user => {
            const dayData = user.daily_allocations[selectedDateStr];
            const totalHours = dayData?.total_hours || 0;
            const tasks = dayData?.tasks || [];
            const status = getUserWorkloadStatus(totalHours);
            
            return (
              <Card key={user.user_id || 'unknown'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {user.user_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <CardTitle>{user.user_name || 'Unknown User'}</CardTitle>
                        <p className="text-sm text-gray-600">{user.user_skills?.join(', ') || 'No skills'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        status === 'available' ? 'success' :
                        status === 'overloaded' ? 'danger' :
                        status === 'busy' ? 'warning' : 'primary'
                      }>
                        {totalHours.toFixed(1)}h allocated
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No tasks allocated for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.task_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{task.task_name}</div>
                            <div className="text-sm text-gray-600">{task.project_name}</div>
                            <div className="flex items-center mt-1 space-x-4">
                              <Badge variant="secondary" size="sm">
                                {task.priority}
                              </Badge>
                              <Badge variant={
                                task.status === 'completed' ? 'success' :
                                task.status === 'in-progress' ? 'primary' :
                                task.status === 'blocked' ? 'danger' : 'default'
                              } size="sm">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end space-y-2">
                            <div>
                              <div className="font-semibold text-lg">{task.hours_per_day}h</div>
                              <div className="text-sm text-gray-600">allocated</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigateToTaskDetails(task.task_id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
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
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const dayAllocations = backendData.allocations.filter(alloc => alloc.date === selectedDateStr);
      
      // Group by project
      const projectGroups: { [projectId: string]: DailyAllocation[] } = {};
      dayAllocations.forEach(alloc => {
        const projectId = alloc.project_id.toString();
        if (!projectGroups[projectId]) {
          projectGroups[projectId] = [];
        }
        projectGroups[projectId].push(alloc);
      });

      const projects = Object.entries(projectGroups).map(([projectId, allocations]) => ({
        project_id: parseInt(projectId),
        project_name: allocations[0].project_name,
        project_category: allocations[0].project_category,
        allocations
      }));

      return (
        <div className="space-y-6">
          {projects.map(project => {
            const totalHours = project.allocations.reduce((sum, alloc) => sum + alloc.hours_per_day, 0);
            const uniqueUsers = new Set(project.allocations.map(a => a.user_id)).size;
            
            return (
              <Card key={project.project_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle>{project.project_name}</CardTitle>
                        <p className="text-sm text-gray-600">{project.project_category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="primary">
                        {totalHours.toFixed(1)}h • {uniqueUsers} people
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.allocations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No allocations for this project today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {project.allocations.map(allocation => (
                        <div key={`${allocation.user_id}-${allocation.task_id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{allocation.task_name}</div>
                            <div className="text-sm text-gray-600">Assigned to: {allocation.user_name}</div>
                            <div className="flex items-center mt-1 space-x-4">
                              <Badge variant="secondary" size="sm">
                                {allocation.task_priority}
                              </Badge>
                              <Badge variant={
                                allocation.task_status === 'completed' ? 'success' :
                                allocation.task_status === 'in-progress' ? 'primary' :
                                allocation.task_status === 'blocked' ? 'danger' : 'default'
                              } size="sm">
                                {allocation.task_status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">{allocation.hours_per_day}h</div>
                            <div className="text-sm text-gray-600">allocated</div>
                          </div>
                        </div>
                      ))}
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

  // Calculate summary stats from filtered data
  const getSummaryStats = () => {
    const filteredGroupedData = getFilteredGroupedData();
    const users = Object.values(filteredGroupedData);
    
    let available = 0, busy = 0, overloaded = 0;

    users.forEach(user => {
      // Calculate average hours per day for this user
      const dates = Object.keys(user.daily_allocations);
      const totalHours = dates.reduce((sum, date) => sum + user.daily_allocations[date].total_hours, 0);
      const avgHoursPerDay = dates.length > 0 ? totalHours / dates.length : 0;
      
      if (avgHoursPerDay === 0) available++;
      else if (avgHoursPerDay > 8) overloaded++;
      else if (avgHoursPerDay >= 6) busy++;
    });

    return {
      total: users.length,
      available,
      busy,
      overloaded
    };
  };

  const summaryStats = getSummaryStats();

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
          {/* Team Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Team:</span>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setSelectedMember('all'); // Reset member filter when team changes
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Teams</option>
              {getUniqueTeams().map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Member:</span>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Members</option>
              {getUniqueMembers().map(member => (
                <option key={member.user_id || 'unknown'} value={(member.user_id || '').toString()}>
                  {member.user_name || 'Unknown Member'}
                </option>
              ))}
            </select>
          </div>

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

          {/* Clear Filters */}
          {(selectedTeam !== 'all' || selectedMember !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTeam('all');
                setSelectedMember('all');
              }}
            >
              Clear Filters
            </Button>
          )}
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
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{summaryStats.available}</p>
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
                <p className="text-2xl font-bold text-gray-900">{summaryStats.busy}</p>
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
                <p className="text-2xl font-bold text-gray-900">{summaryStats.overloaded}</p>
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

      {/* Add Allocation Modal - Simplified for now */}
      <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} title="Add Team Allocation" size="lg">
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Allocation management will be implemented in a future update.</p>
          <Button onClick={() => setIsAllocationModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Daily Allocation Modal */}
      <Modal 
        isOpen={isDailyAllocationModalOpen} 
        onClose={() => setIsDailyAllocationModalOpen(false)} 
        title={`Daily Tasks - ${selectedDailyAllocation?.user?.user_name || 'Unknown User'}`}
        size="lg"
      >
        {selectedDailyAllocation && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {new Date(selectedDailyAllocation.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedDailyAllocation.user?.user_name} • {selectedDailyAllocation.user?.user_skills?.join(', ') || 'No skills'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDailyAllocation.totalHours.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedDailyAllocation.tasks.length} tasks
                  </div>
                </div>
              </div>
            </div>

            {selectedDailyAllocation.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No tasks allocated for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDailyAllocation.tasks.map(task => (
                  <div key={task.task_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                          <Badge variant={
                            task.status === 'completed' ? 'success' :
                            task.status === 'in-progress' ? 'primary' :
                            task.status === 'under-review' ? 'warning' :
                            task.status === 'blocked' ? 'danger' : 'default'
                          } size="sm">
                            {task.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{task.project_name}</div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{task.hours_per_day}h allocated</span>
                          </div>
                          <Badge variant="secondary" size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigateToTaskDetails(task.task_id)}
                        className="text-blue-600 hover:text-blue-800 ml-4"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}