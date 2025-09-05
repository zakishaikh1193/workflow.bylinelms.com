import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskStatus, Priority } from '../types';
import { calculateTaskProgress } from '../utils/progressCalculator';
import { taskService, stageService, teamService, projectService, skillService, gradeService, bookService, unitService, lessonService } from '../services/apiService';
import { TaskDetails } from './TaskDetails';

export function TaskManager() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('all');
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  // Loading state for project-specific stages in top-level filters
  const [loadingProjectStages, setLoadingProjectStages] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [allTasks, setAllTasks] = useState<any[]>([]); // For statistics

  // Fetch tasks and related data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if we need to fetch all tasks (for cross-page filtering)
        // Only when filters are handled on the frontend (due date or overdue toggles)
        const needsAllTasks = selectedStatus === 'overdue' || selectedDueDate !== 'all' || onlyOverdue;

        // Build filters object
        const filters: any = {
          sort: sortField,
          order: sortOrder
        };

        // Only add pagination if we don't need all tasks
        if (!needsAllTasks) {
          filters.page = currentPage;
          filters.limit = pageSize;
        } else {
          // Fetch all tasks for cross-page filtering
          filters.all = 'true';
        }

        // Add filter parameters (exclude overdue as it's handled on frontend)
        if (selectedStatus !== 'all' && selectedStatus !== 'overdue') {
          filters.status = selectedStatus;
        }
        if (selectedPriority !== 'all') {
          filters.priority = selectedPriority;
        }
        // Stage selection overrides project filter
        if (selectedStage !== 'all') {
          filters.stage_id = selectedStage;
        } else if (selectedProject !== 'all') {
          filters.project_id = selectedProject;
        }
        if (selectedDueDate !== 'all') {
          filters.due_date = selectedDueDate;
        }
        if (selectedAssignee !== 'all') {
          filters.assignee_id = selectedAssignee;
        }
        if (debouncedSearch) {
          filters.search = debouncedSearch;
        }

        console.log('🔍 Sending filters to API:', filters);
        console.log('🔍 Available stages:', stages);
        console.log('🔍 Selected stage:', selectedStage);

        // Fetch paginated tasks and all tasks for statistics
        const [tasksResponse, teamMembersData, teamsData, stagesData, projectsResponse, skillsData, gradesData, booksData, unitsData, lessonsData] = await Promise.all([
          taskService.getAll(filters),
          teamService.getMembers(),
          teamService.getTeams(),
          stageService.getAll(),
          projectService.getAll(),
          skillService.getAll(),
          gradeService.getAll(),
          bookService.getAll(),
          unitService.getAll(),
          lessonService.getAll()
        ]);

        // Handle response (could be paginated or all tasks)
        console.log('🔍 Tasks response:', tasksResponse);
        console.log('🔍 Tasks data:', tasksResponse?.data);
        console.log('🔍 Tasks stage info:', tasksResponse?.data?.map((task: any) => ({
          id: task.id,
          name: task.name,
          category_stage_id: task.category_stage_id,
          stage_name: task.stage_name
        })));
        console.log('🔍 Number of tasks returned:', tasksResponse?.data?.length || 0);
        console.log('🔍 Tasks stage info:', tasksResponse?.data?.map((task: any) => ({
          id: task.id,
          name: task.name,
          category_stage_id: task.category_stage_id,
          stage_name: task.stage_name
        })));
        if (tasksResponse && tasksResponse.data) {
          if (needsAllTasks) {
            // We fetched all tasks, so we need to handle pagination on frontend
            setTasks(tasksResponse.data);
            setTotalTasks(tasksResponse.data.length);
            setTotalPages(Math.ceil(tasksResponse.data.length / pageSize));
          } else {
            // Normal paginated response
            setTasks(tasksResponse.data);
            setTotalTasks(tasksResponse.pagination?.total || 0);
            setTotalPages(tasksResponse.pagination?.pages || 1);
          }
        } else {
          // Fallback for non-paginated response
          setTasks(tasksResponse || []);
          setTotalTasks(tasksResponse?.length || 0);
          setTotalPages(1);
        }

        // Fetch all tasks for statistics (without any filters or pagination)
        try {
          const allTasksResponse = await taskService.getAll({ all: 'true' });
          const allTasksData = allTasksResponse.data || allTasksResponse || [];
          console.log('📊 All tasks for statistics:', allTasksData.length, allTasksData);
          setAllTasks(allTasksData);
        } catch (error) {
          console.warn('Failed to fetch all tasks for statistics:', error);
          // If we already have all tasks from the main fetch, use those
          if (needsAllTasks && tasksResponse && tasksResponse.data) {
            console.log('📊 Using main fetch data for statistics');
            setAllTasks(tasksResponse.data);
          } else {
            console.log('📊 Using total count for statistics instead of all tasks');
            setAllTasks([]);
          }
        }

        setTeamMembers(teamMembersData.data || teamMembersData);
        setTeams(teamsData.data || teamsData);
        
        // Remove duplicates from stages data and ensure proper structure
        const stagesArray = stagesData.data || stagesData;
        const uniqueStages = getUniqueStages(stagesArray);
        setStages(uniqueStages);
        console.log('🔍 Stages data received:', stagesData);
        console.log('🔍 Unique stages set to state:', uniqueStages);
        
        // Handle projects response (could be paginated or direct array)
        const projectsData = projectsResponse && projectsResponse.data ? projectsResponse.data : (Array.isArray(projectsResponse) ? projectsResponse : []);
        setProjects(projectsData);
        
        setSkills(skillsData.data || skillsData);
        setGrades(gradesData.data || gradesData);
        setBooks(booksData.data || booksData);
        setUnits(unitsData.data || unitsData);
        setLessons(lessonsData.data || lessonsData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch task data:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated
    if (user) {
      fetchData();
    }
  }, [user, sortField, sortOrder, selectedStatus, selectedPriority, selectedProject, selectedStage, selectedDueDate, selectedAssignee, debouncedSearch, currentPage, pageSize]);

  // Debounce search term to reduce API calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Debug stages data
  useEffect(() => {
    console.log('🔍 Stages state updated:', stages);
    console.log('🔍 Stages length:', stages.length);
    console.log('🔍 All stages with IDs:', stages.map(s => ({ id: s.id, name: s.name, idType: typeof s.id })));
    
    // Validate stage selection
    if (selectedStage !== 'all' && stages.length > 0) {
      const selectedStageId = parseInt(selectedStage);
      const stageExists = stages.find(s => s.id === selectedStageId);
      console.log('🔍 Stage validation:', {
        selectedStage,
        selectedStageId,
        stageExists: !!stageExists,
        stageDetails: stageExists
      });
    }
  }, [stages, selectedStage]);

  // Helper function to get unique stages
  const getUniqueStages = (stagesData: any[]) => {
    const seen = new Set();
    return stagesData.filter((stage: any) => {
      const duplicate = seen.has(stage.id);
      seen.add(stage.id);
      return !duplicate;
    });
  };

  // Fetch stages for the selected project's category (top-level filters)
  const fetchProjectStagesForProject = async (projectId: string) => {
    if (!projectId || projectId === 'all') {
      setProjectStages([]);
      return;
    }

    try {
      setLoadingProjectStages(true);
      const proj = projects.find(p => p.id === parseInt(projectId) || p.id === projectId);
      if (proj && proj.category_id) {
        const stagesData = await stageService.getByCategory(proj.category_id);
        const stagesArray = stagesData?.data || stagesData || [];
        const unique = getUniqueStages(stagesArray);
        setProjectStages(unique);
      } else {
        setProjectStages([]);
      }
    } catch (e) {
      console.error('❌ Failed to fetch stages for selected project:', e);
      setProjectStages([]);
    } finally {
      setLoadingProjectStages(false);
    }
  };

  // When project changes, reset stage filter and fetch project-specific stages
  useEffect(() => {
    // Always reset stage on project change
    setSelectedStage('all');
    if (selectedProject && selectedProject !== 'all') {
      fetchProjectStagesForProject(selectedProject);
    } else {
      setProjectStages([]);
    }
  }, [selectedProject]);

  // Helper function to get task count for a stage
  const getTaskCountForStage = (stageId: number) => {
    const tasksToCheck = allTasks.length > 0 ? allTasks : tasks;
    const stageIdNum = parseInt(stageId.toString());

    return tasksToCheck.filter((task: any) => {
      const taskStageId = task.category_stage_id ? parseInt(task.category_stage_id.toString()) : null;
      const matchesStage = taskStageId === stageIdNum;

      // If a specific project is selected, constrain count to that project
      if (selectedProject !== 'all') {
        const taskProjectId = task.project_id || task.projectId;
        const taskProjectNum = typeof taskProjectId === 'string' ? parseInt(taskProjectId) : taskProjectId;
        const selectedProjectNum = typeof selectedProject === 'string' ? parseInt(selectedProject) : selectedProject;
        return matchesStage && taskProjectNum === selectedProjectNum;
      }

      return matchesStage;
    }).length;
  };

  // Apply filters from dashboard navigation
  useEffect(() => {
    if (state.filters && Object.keys(state.filters).length > 0) {
      if (state.filters.statuses) {
        setSelectedStatus(state.filters.statuses.length === 1 ? state.filters.statuses[0] : 'all');
      }
      if (state.filters.teamMembers) {
        setSelectedAssignee(state.filters.teamMembers.length === 1 ? state.filters.teamMembers[0] : 'all');
      }
      if ((state.filters as any).priority) {
        setSelectedPriority((state.filters as any).priority);
      }
      if ((state.filters as any).overdue) {
        setOnlyOverdue(true);
      }
      // Clear filters after applying - use setTimeout to avoid infinite loop
      setTimeout(() => {
        dispatch({ type: 'SET_FILTERS', payload: {} });
      }, 0);
    }
  }, [state.filters, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPriority, selectedProject, selectedStage, selectedDueDate, selectedAssignee, debouncedSearch]);

  const isOverdue = (task: Task) => {
    const endDate = task.end_date || task.endDate;
    if (!endDate) return false;

    // Get today's date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the end date at midnight (start of day)
    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);

    // Task is overdue if due date is before today AND not completed
    return dueDate < today && task.status !== 'completed';
  };

  const isDueToday = (task: Task) => {
    const endDate = task.end_date || task.endDate;
    if (!endDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === today.getTime() && task.status !== 'completed';
  };

  const isDueTomorrow = (task: Task) => {
    const endDate = task.end_date || task.endDate;
    if (!endDate) return false;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === tomorrow.getTime() && task.status !== 'completed';
  };

  const isDueThisWeek = (task: Task) => {
    const endDate = task.end_date || task.endDate;
    if (!endDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    weekFromNow.setHours(0, 0, 0, 0);
    const dueDate = new Date(endDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate >= today && dueDate <= weekFromNow && task.status !== 'completed';
  };

  // Check if we need to fetch all tasks (for cross-page filtering)
  const needsAllTasks = selectedStatus === 'overdue' || 
                       selectedPriority !== 'all' || 
                       selectedStage !== 'all' ||
                       selectedDueDate !== 'all' ||
                       selectedAssignee !== 'all' || 
                       debouncedSearch;

  // Apply filters to tasks
  console.log('🔍 Starting task filtering. Total tasks:', tasks.length);
  console.log('🔍 Selected stage:', selectedStage);
  console.log('🔍 Sample tasks with stage info:', tasks.slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    category_stage_id: t.category_stage_id,
    stage_name: t.stage_name
  })));
  
  // Get all unique stage IDs from tasks
  const uniqueStageIds = [...new Set(tasks.map(t => t.category_stage_id).filter(id => id !== null && id !== undefined))];
  console.log('🔍 Unique stage IDs in tasks:', uniqueStageIds);
  console.log('🔍 Tasks by stage ID:', uniqueStageIds.map(stageId => ({
    stageId,
    count: tasks.filter(t => t.category_stage_id === stageId).length,
    tasks: tasks.filter(t => t.category_stage_id === stageId).map(t => ({ id: t.id, name: t.name }))
  })));
  
  let filteredTasks = tasks.filter((task: any) => {
    // Apply dashboard filters only (other filters are handled by backend)
    if (state.filters?.overdue && !isOverdue(task)) return false;
    if (state.filters?.dueToday && !isDueToday(task)) return false;
    if (state.filters?.dueTomorrow && !isDueTomorrow(task)) return false;
    if (state.filters?.dueThisWeek && !isDueThisWeek(task)) return false;
    if (onlyOverdue && !isOverdue(task)) return false;
    
    // Apply status filter for overdue
    if (selectedStatus === 'overdue' && !isOverdue(task)) return false;

    // Apply stage filter
    if (selectedStage !== 'all') {
      const taskStageId = task.category_stage_id;
      const selectedStageId = parseInt(selectedStage);
      
      // Handle different data types - convert both to numbers for comparison
      const taskStageIdNum = taskStageId ? parseInt(taskStageId.toString()) : null;
      const selectedStageIdNum = parseInt(selectedStage);
      
      console.log('🔍 Stage filter check:', {
        taskId: task.id,
        taskName: task.name,
        taskStageId: taskStageId,
        taskStageIdType: typeof taskStageId,
        taskStageIdNum: taskStageIdNum,
        selectedStageId: selectedStageId,
        selectedStageIdNum: selectedStageIdNum,
        matches: taskStageIdNum === selectedStageIdNum
      });
      
      if (taskStageIdNum !== selectedStageIdNum) {
        return false;
      }
    }

    // Apply due date filter
    if (selectedDueDate !== 'all') {
      const taskEndDate = task.end_date || task.endDate;
      if (!taskEndDate) return false;
      
      const dueDate = new Date(taskEndDate);
      dueDate.setHours(0, 0, 0, 0);
      
      switch (selectedDueDate) {
        case 'overdue':
          if (!isOverdue(task)) return false;
          break;
        case 'today':
          if (!isDueToday(task)) return false;
          break;
        case 'tomorrow':
          if (!isDueTomorrow(task)) return false;
          break;
        case 'this-week':
          if (!isDueThisWeek(task)) return false;
          break;
        case 'next-week':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextWeekStart = new Date();
          nextWeekStart.setDate(today.getDate() + 7);
          nextWeekStart.setHours(0, 0, 0, 0);
          const nextWeekEnd = new Date();
          nextWeekEnd.setDate(today.getDate() + 14);
          nextWeekEnd.setHours(0, 0, 0, 0);
          if (dueDate < nextWeekStart || dueDate > nextWeekEnd || task.status === 'completed') return false;
          break;
        case 'no-due-date':
          if (taskEndDate) return false;
          break;
      }
    }

    return true;
  });

  console.log('🔍 Task filtering completed. Filtered tasks:', filteredTasks.length);
  console.log('🔍 Filtered tasks sample:', filteredTasks.slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    category_stage_id: t.category_stage_id,
    stage_name: t.stage_name
  })));
  
  // Summary of stage filtering
  if (selectedStage !== 'all') {
    const selectedStageId = parseInt(selectedStage);
    const selectedStageName = stages.find(s => s.id === selectedStageId)?.name || 'Unknown';
    console.log('🔍 Stage filter summary:', {
      selectedStage,
      selectedStageId,
      selectedStageName,
      totalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      expectedTasks: tasks.filter(t => {
        const taskStageId = t.category_stage_id ? parseInt(t.category_stage_id.toString()) : null;
        return taskStageId === selectedStageId;
      }).length
    });
  }

  // Apply frontend pagination if we have all tasks
  if (needsAllTasks && filteredTasks.length > 0) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    filteredTasks = filteredTasks.slice(startIndex, endIndex);
  }



  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Build component path for display (same logic as ProjectDetails)
        let componentPath = '';
        if (taskData.gradeId) {
          const grade = grades.find(g => g.id === parseInt(taskData.gradeId || '0'));
          if (grade) {
            componentPath = grade.name;
            if (taskData.bookId) {
              const book = books.find(b => b.id === parseInt(taskData.bookId || '0'));
              if (book) {
                componentPath += ` > ${book.name}`;
                if (taskData.unitId) {
                  const unit = units.find(u => u.id === parseInt(taskData.unitId || '0'));
                  if (unit) {
                    componentPath += ` > ${unit.name}`;
                    if (taskData.lessonId) {
                      const lesson = lessons.find(l => l.id === parseInt(taskData.lessonId || '0'));
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

        // Update existing task
        const updateData = {
          name: taskData.name,
          description: taskData.description,
          project_id: parseInt(taskData.projectId || '1'),
          category_stage_id: parseInt(taskData.stageId || ''),
          status: taskData.status,
          priority: taskData.priority,
          start_date: taskData.startDate,
          end_date: taskData.endDate,
          estimated_hours: parseInt(String(taskData.estimatedHours || 0)),
          actual_hours: parseInt(String(taskData.actualHours || 0)),
          assignees: taskData.assignees || [],
          skills: taskData.skills,
          // Add educational hierarchy IDs
          grade_id: taskData.gradeId ? parseInt(taskData.gradeId) : null,
          book_id: taskData.bookId ? parseInt(taskData.bookId) : null,
          unit_id: taskData.unitId ? parseInt(taskData.unitId) : null,
          lesson_id: taskData.lessonId ? parseInt(taskData.lessonId) : null,
          component_path: componentPath
        };

        console.log('🔄 Updating task with hierarchy in TaskManager:', {
          taskId: editingTask.id,
          grade_id: updateData.grade_id,
          book_id: updateData.book_id,
          unit_id: updateData.unit_id,
          lesson_id: updateData.lesson_id,
          component_path: updateData.component_path
        });

        await taskService.update(editingTask.id, updateData);

        // Refresh tasks list with current filters
        const filters: any = {
          sort: sortField,
          order: sortOrder,
          page: currentPage,
          limit: pageSize
        };

        if (selectedStatus !== 'all') filters.status = selectedStatus;
        if (selectedPriority !== 'all') filters.priority = selectedPriority;
        if (selectedStage !== 'all') filters.stage_id = selectedStage; else if (selectedProject !== 'all') filters.project_id = selectedProject;
        if (selectedDueDate !== 'all') filters.due_date = selectedDueDate;
        if (selectedAssignee !== 'all') filters.assignee_id = selectedAssignee;
        if (debouncedSearch) filters.search = debouncedSearch;

        const tasksResponse = await taskService.getAll(filters);
        if (tasksResponse && tasksResponse.data) {
          setTasks(tasksResponse.data);
          setTotalTasks(tasksResponse.pagination?.total || 0);
          setTotalPages(tasksResponse.pagination?.pages || 1);
        }
      } else {
        // Build component path for display
        let componentPath = '';
        if (taskData.gradeId) {
          const grade = grades.find(g => g.id === parseInt(taskData.gradeId || '0'));
          if (grade) {
            componentPath = grade.name;
            if (taskData.bookId) {
              const book = books.find(b => b.id === parseInt(taskData.bookId || '0'));
              if (book) {
                componentPath += ` > ${book.name}`;
                if (taskData.unitId) {
                  const unit = units.find(u => u.id === parseInt(taskData.unitId || '0'));
                  if (unit) {
                    componentPath += ` > ${unit.name}`;
                    if (taskData.lessonId) {
                      const lesson = lessons.find(l => l.id === parseInt(taskData.lessonId || '0'));
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
          category_stage_id: parseInt(taskData.stageId || ''),
          status: taskData.status || 'not-started',
          priority: taskData.priority || 'medium',
          start_date: taskData.startDate || new Date().toISOString().split('T')[0],
          end_date: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estimated_hours: taskData.estimatedHours || 8,
          assignees: taskData.assignees || [],
          skills: skillIds,
          component_path: componentPath,
          // Add educational hierarchy IDs
          grade_id: taskData.gradeId ? parseInt(taskData.gradeId) : null,
          book_id: taskData.bookId ? parseInt(taskData.bookId) : null,
          unit_id: taskData.unitId ? parseInt(taskData.unitId) : null,
          lesson_id: taskData.lessonId ? parseInt(taskData.lessonId) : null
        };

        console.log('🚀 Creating task with data:', createData);
        console.log('📚 Educational hierarchy IDs being sent:', {
          grade_id: createData.grade_id,
          book_id: createData.book_id,
          unit_id: createData.unit_id,
          lesson_id: createData.lesson_id,
          component_path: createData.component_path
        });

        const newTask = await taskService.create(createData);

        // Refresh tasks list with current filters
        const filters: any = {
          sort: sortField,
          order: sortOrder,
          page: currentPage,
          limit: pageSize
        };

        if (selectedStatus !== 'all') filters.status = selectedStatus;
        if (selectedPriority !== 'all') filters.priority = selectedPriority;
        if (selectedStage !== 'all') filters.stage_id = selectedStage; else if (selectedProject !== 'all') filters.project_id = selectedProject;
        if (selectedDueDate !== 'all') filters.due_date = selectedDueDate;
        if (selectedAssignee !== 'all') filters.assignee_id = selectedAssignee;
        if (debouncedSearch) filters.search = debouncedSearch;

        const tasksResponse = await taskService.getAll(filters);
        if (tasksResponse && tasksResponse.data) {
          setTasks(tasksResponse.data);
          setTotalTasks(tasksResponse.pagination?.total || 0);
          setTotalPages(tasksResponse.pagination?.pages || 1);
        }

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc order
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete the task "${task.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);

      // Delete the task
      await taskService.delete(task.id);

      // Refresh tasks list with current filters
      const filters: any = {
        sort: sortField,
        order: sortOrder,
        page: currentPage,
        limit: pageSize
      };

      if (selectedStatus !== 'all') filters.status = selectedStatus;
      if (selectedPriority !== 'all') filters.priority = selectedPriority;
      if (selectedStage !== 'all') filters.stage_id = selectedStage; else if (selectedProject !== 'all') filters.project_id = selectedProject;
      if (selectedDueDate !== 'all') filters.due_date = selectedDueDate;
      if (selectedAssignee !== 'all') filters.assignee_id = selectedAssignee;
      if (debouncedSearch) filters.search = debouncedSearch;

      const tasksResponse = await taskService.getAll(filters);
      if (tasksResponse && tasksResponse.data) {
        setTasks(tasksResponse.data);
        setTotalTasks(tasksResponse.pagination?.total || 0);
        setTotalPages(tasksResponse.pagination?.pages || 1);
      }

      console.log('✅ Task deleted successfully:', task.name);
    } catch (err: any) {
      console.error('❌ Delete task error:', err);
      setError(err.message || 'Failed to delete task');
    }
  };

  // Calculate task statistics
  const taskStats = (() => {
    if (allTasks.length > 0) {
      // Use all tasks data if available
      return {
        total: totalTasks,
        notStarted: allTasks.filter((t: any) => t.status === 'not-started').length,
        inProgress: allTasks.filter((t: any) => t.status === 'in-progress').length,
        underReview: allTasks.filter((t: any) => t.status === 'under-review').length,
        completed: allTasks.filter((t: any) => t.status === 'completed').length,
        overdue: allTasks.filter((t: any) => {
          const endDate = t.end_date || t.endDate;
          if (!endDate || t.status === 'completed') return false;

          // Get today's date at midnight (start of day)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Get the end date at midnight (start of day)
          const dueDate = new Date(endDate);
          dueDate.setHours(0, 0, 0, 0);

          // Task is overdue if due date is before today AND not completed
          return dueDate < today;
        }).length,
      };
    } else {
      // Fallback: Calculate statistics from current page data and total count
      const currentPageStats = {
        notStarted: tasks.filter((t: any) => t.status === 'not-started').length,
        inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
        underReview: tasks.filter((t: any) => t.status === 'under-review').length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        overdue: tasks.filter((t: any) => {
          const endDate = t.end_date || t.endDate;
          if (!endDate || t.status === 'completed') return false;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(endDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        }).length,
      };

      // Estimate total statistics based on current page proportions
      const currentPageTotal = tasks.length;
      if (currentPageTotal > 0 && totalTasks > 0) {
        const multiplier = totalTasks / currentPageTotal;
        return {
          total: totalTasks,
          notStarted: Math.round(currentPageStats.notStarted * multiplier),
          inProgress: Math.round(currentPageStats.inProgress * multiplier),
          underReview: Math.round(currentPageStats.underReview * multiplier),
          completed: Math.round(currentPageStats.completed * multiplier),
          overdue: Math.round(currentPageStats.overdue * multiplier),
        };
      } else {
        // If no current page data, return zeros
        return {
          total: totalTasks,
          notStarted: 0,
          inProgress: 0,
          underReview: 0,
          completed: 0,
          overdue: 0,
        };
      }
    }
  })();

  // Debug logging for statistics
  console.log('📊 Task Statistics:', {
    totalTasks,
    allTasksLength: allTasks.length,
    taskStats,
    method: allTasks.length > 0 ? 'using all tasks' : 'using estimated statistics',
    sampleTasks: allTasks.length > 0 ? allTasks.slice(0, 3).map(t => ({ id: t.id, name: t.name, status: t.status, end_date: t.end_date })) : tasks.slice(0, 3).map(t => ({ id: t.id, name: t.name, status: t.status, end_date: t.end_date })),
    statusCounts: allTasks.length > 0 ? allTasks.reduce((acc: any, t: any) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {}) : tasks.reduce((acc: any, t: any) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {})
  });



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
      {/* <div className="flex items-center justify-between">
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
      </div> */}
      <div className="relative">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold">Task Management</h1>
              <p className="text-white/80">Track and manage all project tasks</p>
              {process.env.NODE_ENV === 'development' && showDebugInfo && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-800">
                    🔧 Debug Mode Active
                  </span>
                </div>
              )}
            </div>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
              setEditingTask(null);
              setIsCreateModalOpen(true);
            }}>
              Create Task
            </Button>
          </div>
        </div>
      </div>


      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${onlyOverdue ? 'ring-2 ring-red-300' : ''} cursor-pointer hover:shadow-md`}
          onClick={() => setOnlyOverdue(prev => !prev)}
        // title="Click to toggle Overdue only filter"
        >
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
              <option value="overdue">Overdue</option>
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
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${
              selectedStage !== 'all' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300'
            }`}
            disabled={selectedProject === 'all' || loadingProjectStages}
          >
            {selectedProject === 'all' ? (
              <option value="all">Select a project first</option>
            ) : (
              <>
                <option value="all">All Stages</option>
                {(projectStages || []).map(stage => {
                  const taskCount = getTaskCountForStage(stage.id);
                  return (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  );
                })}
              </>
            )}
          </select>
          
          {selectedStage !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {(projectStages || []).find(s => s.id === parseInt(selectedStage))?.name || 'Unknown Stage'}
              </span>
              <button
                onClick={() => setSelectedStage('all')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                title="Clear stage filter"
              >
                Clear Stage
              </button>
            </div>
          )}
          
          {/* Show message when selected stage has no tasks */}
          {selectedStage !== 'all' && filteredTasks.length === 0 && (
            <div className="col-span-full mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>No tasks found</strong> for stage "{(projectStages || []).find(s => s.id === parseInt(selectedStage))?.name || 'Unknown Stage'}" within the selected project.
                  </p>
                </div>
              </div>
            </div>
          )}

          <select
            value={selectedDueDate}
            onChange={(e) => setSelectedDueDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Due Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="this-week">Due This Week</option>
            <option value="next-week">Due Next Week</option>
            <option value="no-due-date">No Due Date</option>
          </select>

          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Assignees</option>
            <option value="none">No Assignees</option>
            {teamMembers.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          {/* Overdue-only checkbox temporarily disabled; use the Overdue stat card to toggle */}
          
          {/* Debug Info Toggle Button */}
        </div>
        
        {/* Debug Panel - Only show when enabled */}
        
      </div>

            {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Task Name
                      {sortField === 'name' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
               
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>

                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center">
                      Priority
                      {sortField === 'priority' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('assignees')}
                  >
                    <div className="flex items-center">
                      Assignees
                      {sortField === 'assignees' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('end_date')}
                  >
                    <div className="flex items-center">
                      Due Date
                      {sortField === 'end_date' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center">
                      Progress
                      {sortField === 'progress' && (
                        <span className="ml-1 text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task,index) => {
                  const assignedUsers = teamMembers.filter(u => task.assignees && task.assignees.includes(u.id));
                  const assignedTeams = teams.filter(t => task.teamAssignees && task.teamAssignees.includes(t.id));
                  const overdue = isOverdue(task);
                  // Find project by ID - handle both string and number types
                  const taskProjectId = task.project_id || task.projectId;
                  const project = projects.find(p => {
                    const projectId = typeof p.id === 'string' ? parseInt(p.id) : p.id;
                    const taskId = typeof taskProjectId === 'string' ? parseInt(taskProjectId) : taskProjectId;
                    return projectId === taskId;
                  });

                  // Use stage_name from API response directly
                  const stageName = task.stage_name;
                  console.log('🔍 Task stage info:', { 
                    taskId: task.id, 
                    taskName: task.name, 
                    category_stage_id: task.category_stage_id, 
                    stage_name: task.stage_name 
                  });
                  
                  return (
                    <tr key={task.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {task.name}
                            {overdue && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.component_path && (
                              <div className="text-xs text-purple-600 mt-1 bg-purple-100 p-1 rounded-md inline-block">
                                📚 {task.component_path}
                              </div>
                            )}
                            {task.description && <div className="mt-1">{task.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project ? (
                            <div>
                              <div className="font-medium text-blue-600">{project.name}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown Project</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stageName ? (
                            <div className="font-medium text-green-600">{stageName}</div>
                          ) : (
                            <span className="text-gray-400">Unknown Stage</span>
                          )}
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
                          {assignedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {assignedUsers.slice(0, 3).map(user => (
                                <span
                                  key={user.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {user.name}
                                </span>
                              ))}
                              {assignedUsers.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{assignedUsers.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {assignedUsers.length === 0 && (
                            <span className={`text-xs ${selectedAssignee === 'none' ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                              No assignees
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {task.end_date || task.endDate ? new Date(task.end_date || task.endDate || '').toLocaleDateString() : 'No due date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${calculateTaskProgress(task.status)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{calculateTaskProgress(task.status)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'SET_PREVIOUS_VIEW', payload: 'tasks' });
                              dispatch({ type: 'SET_SELECTED_TASK', payload: task.id.toString() });
                            }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task);
                            }}
                            title="Delete Task"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks} tasks
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
        grades={grades}
        books={books}
        units={units}
        lessons={lessons}
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
  grades: any[];
  books: any[];
  units: any[];
  lessons: any[];
  editingTask?: Task | null;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, users, teams, skills, projects, stages, grades, books, units, lessons, editingTask }: CreateTaskModalProps) {
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
    skills: [] as string[] | any[],
    priority: 'medium' as Priority,
    estimatedHours: 8,
    actualHours: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // State for project-specific stages
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  // Function to fetch stages for the selected project's category
  const fetchProjectStages = async (projectId: string) => {
    if (!projectId) {
      setProjectStages([]);
      return;
    }

    try {
      setLoadingStages(true);
      const selectedProject = projects.find(p => p.id === parseInt(projectId) || p.id === projectId);

      if (selectedProject && selectedProject.category_id) {
        // Fetch stages for this project's category
        const stagesData = await stageService.getByCategory(selectedProject.category_id);
        setProjectStages(stagesData);
        console.log('📋 Fetched stages for project category:', stagesData);
      } else {
        setProjectStages([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch project stages:', error);
      setProjectStages([]);
    } finally {
      setLoadingStages(false);
    }
  };

  // Fetch stages when project changes
  useEffect(() => {
    if (formData.projectId) {
      fetchProjectStages(formData.projectId);
    } else {
      setProjectStages([]);
    }
  }, [formData.projectId]);

  useEffect(() => {
    if (editingTask) {
      // Convert skills from objects to names if needed
      const skillNames = Array.isArray(editingTask.skills)
        ? editingTask.skills.map((skill: any) => {
          if (typeof skill === 'object' && skill.name) {
            return skill.name;
          } else if (typeof skill === 'string') {
            return skill;
          }
          return '';
        }).filter(name => name !== '')
        : [];

      // Convert assignees to array of string IDs
      const assigneeIds = Array.isArray(editingTask.assignees)
        ? editingTask.assignees.map((assignee: any) => {
          if (typeof assignee === 'object' && assignee.id) {
            return assignee.id.toString();
          } else {
            return assignee.toString();
          }
        })
        : [];

      console.log('🔍 Editing task assignees:', editingTask.assignees);
      console.log('🔍 Converted assignee IDs:', assigneeIds);

      console.log('🔍 Setting form data for editing task:', editingTask);

      setFormData({
        name: editingTask.name,
        description: editingTask.description || '',
        projectId: editingTask.project_id || editingTask.projectId || '',
        stageId: (editingTask.category_stage_id || editingTask.stage_id || editingTask.stageId || '').toString(),
        gradeId: (editingTask.grade_id || editingTask.gradeId || '').toString(),
        bookId: (editingTask.book_id || editingTask.bookId || '').toString(),
        unitId: (editingTask.unit_id || editingTask.unitId || '').toString(),
        lessonId: (editingTask.lesson_id || editingTask.lessonId || '').toString(),
        status: editingTask.status,
        assignees: assigneeIds,
        teamAssignees: Array.isArray(editingTask.teamAssignees)
          ? editingTask.teamAssignees.map((id: any) => id.toString())
          : [],
        skills: skillNames,
        priority: editingTask.priority,
        estimatedHours: editingTask.estimated_hours || editingTask.estimatedHours || 8,
        actualHours: editingTask.actual_hours || editingTask.actualHours || 0,
        startDate: editingTask.start_date || editingTask.startDate ? new Date(editingTask.start_date || editingTask.startDate || '').toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: editingTask.end_date || editingTask.endDate ? new Date(editingTask.end_date || editingTask.endDate || '').toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

    // Build educational hierarchy path for display
    let educationalPath = '';
    const selectedProject = projects.find(p => p.id === parseInt(formData.projectId) || p.id === formData.projectId);
    if (selectedProject && formData.gradeId) {
      const grade = selectedProject.grades?.find((g: any) => g.id === formData.gradeId);
      if (grade) {
        educationalPath = grade.name;
        if (formData.bookId) {
          const book = grade.books.find((b: any) => b.id === formData.bookId);
          if (book) {
            educationalPath += ` > ${book.name}`;
            if (formData.unitId) {
              const unit = book.units.find((u: any) => u.id === formData.unitId);
              if (unit) {
                educationalPath += ` > ${unit.name}`;
                if (formData.lessonId) {
                  const lesson = unit.lessons.find((l: any) => l.id === formData.lessonId);
                  if (lesson) {
                    educationalPath += ` > ${lesson.name}`;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Convert skill names back to skill IDs
    const skillIds = formData.skills.map(skillName => {
      const skill = skills.find(s => s.name === skillName);
      return skill ? skill.id : null;
    }).filter(id => id !== null);

    onSubmit({
      ...formData,
      skills: skillIds, // Use skill IDs instead of names
      // progress will be auto-calculated by backend based on status
      componentPath: educationalPath, // Keep componentPath for backend compatibility
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

  const toggleTeamAssignee = async (teamId: string) => {
    console.log('🔍 Toggling team:', teamId);
    console.log('🔍 Available teams:', teams);
    console.log('🔍 Available users:', users);

    try {
      // Fetch team members from API
      const teamMembers = await teamService.getTeamMembers(teamId);
      const teamMembersArray = teamMembers.data || teamMembers;
      console.log('🔍 Team members from API:', teamMembersArray);

      setFormData(prev => {
        const isTeamSelected = prev.teamAssignees.includes(teamId);
        console.log('🔍 Is team selected:', isTeamSelected);

        // Find the team
        const team = teams.find(t => t.id === parseInt(teamId));
        console.log('🔍 Found team:', team);

        if (!team) {
          console.log('❌ Team not found');
          return prev;
        }

        // Get team member IDs from the API response
        const teamMemberIds = teamMembersArray.map((member: any) => member.id.toString());
        console.log('🔍 Team member IDs from API:', teamMemberIds);

        let newAssignees = [...prev.assignees];

        if (isTeamSelected) {
          // Remove team - uncheck all team members
          newAssignees = newAssignees.filter(id => !teamMemberIds.includes(id));
        } else {
          // Add team - check all team members (avoid duplicates)
          teamMemberIds.forEach((memberId: string) => {
            if (!newAssignees.includes(memberId)) {
              newAssignees.push(memberId);
            }
          });
        }

        console.log('🔍 New assignees:', newAssignees);

        return {
          ...prev,
          assignees: newAssignees,
          teamAssignees: isTeamSelected
            ? prev.teamAssignees.filter(id => id !== teamId)
            : [...prev.teamAssignees, teamId]
        };
      });
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
      // Fallback to simple toggle without member expansion
      setFormData(prev => {
        const isTeamSelected = prev.teamAssignees.includes(teamId);
        return {
          ...prev,
          teamAssignees: isTeamSelected
            ? prev.teamAssignees.filter(id => id !== teamId)
            : [...prev.teamAssignees, teamId]
        };
      });
    }
  };

  const toggleSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  const selectedProject = projects.find(p => p.id === parseInt(formData.projectId) || p.id === formData.projectId);
  // const availableStages = selectedProject?.stages || [];
  // const availableGrades = selectedProject?.grades || [];
  // const selectedGrade = availableGrades.find((g: any) => g.id === formData.gradeId);
  // const availableBooks = selectedGrade?.books || [];
  // const selectedBook = availableBooks.find((b: any) => b.id === formData.bookId);
  // const availableUnits = selectedBook?.units || [];
  // const selectedUnit = availableUnits.find((u: any) => u.id === formData.unitId);
  // const availableLessons = selectedUnit?.lessons || [];

  // Build availableEducationalHierarchy array for the educational hierarchy selector
  const availableEducationalHierarchy: any[] = [];

  if (selectedProject) {
    // Get grades for this project
    const projectGrades = grades.filter((grade: any) => grade.project_id === parseInt(selectedProject.id));

    // Add grades
    projectGrades.forEach((grade: any) => {
      availableEducationalHierarchy.push({
        id: grade.id,
        name: grade.name,
        type: 'grade',
        gradeId: grade.id,
        bookId: null,
        unitId: null,
        lessonId: null
      });

      // Get books for this grade
      const gradeBooks = books.filter((book: any) => book.grade_id === grade.id);

      // Add books within this grade
      gradeBooks.forEach((book: any) => {
        availableEducationalHierarchy.push({
          id: `${grade.id}-${book.id}`,
          name: `${grade.name} > ${book.name}`,
          type: 'book',
          gradeId: grade.id,
          bookId: book.id,
          unitId: null,
          lessonId: null
        });

        // Get units for this book
        const bookUnits = units.filter((unit: any) => unit.book_id === book.id);

        // Add units within this book
        bookUnits.forEach((unit: any) => {
          availableEducationalHierarchy.push({
            id: `${grade.id}-${book.id}-${unit.id}`,
            name: `${grade.name} > ${book.name} > ${unit.name}`,
            type: 'unit',
            gradeId: grade.id,
            bookId: book.id,
            unitId: unit.id,
            lessonId: null
          });

          // Get lessons for this unit
          const unitLessons = lessons.filter((lesson: any) => lesson.unit_id === unit.id);

          // Add lessons within this unit
          unitLessons.forEach((lesson: any) => {
            availableEducationalHierarchy.push({
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
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
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
              Stage *
            </label>
            <select
              required
              value={formData.stageId}
              onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.projectId || loadingStages}
            >
              <option value="">
                {loadingStages ? 'Loading stages...' : 'Select Stage'}
              </option>
              {projectStages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} {stage.description && `- ${stage.description}`}
                </option>
              ))}
            </select>
            {!formData.projectId && (
              <p className="text-xs text-gray-500 mt-1">
                Please select a project first to load available stages
              </p>
            )}
            {formData.projectId && projectStages.length === 0 && !loadingStages && (
              <p className="text-xs text-gray-500 mt-1">
                No stages found for this project's category
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Educational Hierarchy (Optional)
            </label>
            <select
              value={(() => {
                // Find the matching educational hierarchy item based on current form data
                const formGradeId = formData.gradeId ? parseInt(formData.gradeId) : null;
                const formBookId = formData.bookId ? parseInt(formData.bookId) : null;
                const formUnitId = formData.unitId ? parseInt(formData.unitId) : null;
                const formLessonId = formData.lessonId ? parseInt(formData.lessonId) : null;

                const matchingHierarchyItem = availableEducationalHierarchy.find(c => {
                  return c.gradeId === formGradeId &&
                    c.bookId === formBookId &&
                    c.unitId === formUnitId &&
                    c.lessonId === formLessonId;
                });

                return matchingHierarchyItem ? matchingHierarchyItem.id : '';
              })()}
              onChange={(e) => {
                const selectedHierarchyItem = availableEducationalHierarchy.find(c => c.id === e.target.value);
                if (selectedHierarchyItem) {
                  setFormData({
                    ...formData,
                    gradeId: selectedHierarchyItem.gradeId ? selectedHierarchyItem.gradeId.toString() : '',
                    bookId: selectedHierarchyItem.bookId ? selectedHierarchyItem.bookId.toString() : '',
                    unitId: selectedHierarchyItem.unitId ? selectedHierarchyItem.unitId.toString() : '',
                    lessonId: selectedHierarchyItem.lessonId ? selectedHierarchyItem.lessonId.toString() : ''
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
              {availableEducationalHierarchy.map(component => (
                <option key={component.id} value={component.id}>
                  {component.name} ({component.type})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a specific educational hierarchy item to assign this task to a particular grade, book, unit, or lesson
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
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
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
            {users && users.length > 0 ? users.map((user: any) => {
              const isChecked = formData.assignees.includes(user.id.toString());
              return (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAssignee(user.id.toString())}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{user.name}</span>
                </label>
              );
            }) : (
              <p className="text-gray-500 text-sm">No team members available</p>
            )}
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Assignees (Auto-selects all team members)
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
            Selecting a team will automatically check all its members in the Individual Assignees list above
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {skills.map(skill => {
              const isChecked = formData.skills.includes(skill.name);
              console.log(`🔍 Skill ${skill.name} - checked: ${isChecked}, skills:`, formData.skills);
              return (
                <label key={skill.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSkill(skill.name)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill.name}</span>
                </label>
              );
            })}
          </div>
        </div> */}

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