// Modern API service for the new Node.js backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'API request failed');
  }
  
  return data;
};

// Generic API methods
export const apiService = {
  // GET request
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // POST request
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // PUT request
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // DELETE request
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Team Member Service (replaces teamMemberService.ts)
export const teamService = {
  // Get all team members
  getAll: async () => {
    const result = await apiService.get('/team');
    return result.data;
  },

  // Get team member by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/team/${id}`);
    return result.data;
  },

  // Create new team member
  create: async (memberData: any) => {
    const result = await apiService.post('/team', memberData);
    return result.data;
  },

  // Update team member
  update: async (id: string | number, memberData: any) => {
    const result = await apiService.put(`/team/${id}`, memberData);
    return result.data;
  },

  // Delete team member
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/team/${id}`);
    return result.data;
  },

  // Get performance flags for team member
  getPerformanceFlags: async (id: string | number) => {
    const result = await apiService.get(`/team/${id}/flags`);
    return result.data;
  },

  // Add performance flag
  addPerformanceFlag: async (memberId: string | number, flagData: any) => {
    const result = await apiService.post(`/team/${memberId}/flags`, flagData);
    return result.data;
  },

  // Remove performance flag
  removePerformanceFlag: async (flagId: string | number) => {
    const result = await apiService.delete(`/team/flags/${flagId}`);
    return result.data;
  },

  // Generate a random passcode (utility function)
  generatePasscode: () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
  },
};

// Project Service
export const projectService = {
  // Get all projects
  getAll: async (filters?: any) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/projects?${queryParams}` : '/projects';
    const result = await apiService.get(endpoint);
    return result.data;
  },

  // Get project by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/projects/${id}`);
    return result.data;
  },

  // Create new project
  create: async (projectData: any) => {
    const result = await apiService.post('/projects', projectData);
    return result.data;
  },

  // Update project
  update: async (id: string | number, projectData: any) => {
    const result = await apiService.put(`/projects/${id}`, projectData);
    return result.data;
  },

  // Delete project
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/projects/${id}`);
    return result.data;
  },

  // Get project members
  getMembers: async (id: string | number) => {
    const result = await apiService.get(`/projects/${id}/members`);
    return result.data;
  },

  // Add member to project
  addMember: async (projectId: string | number, memberData: any) => {
    const result = await apiService.post(`/projects/${projectId}/members`, memberData);
    return result.data;
  },

  // Remove member from project
  removeMember: async (projectId: string | number, memberId: string | number) => {
    const result = await apiService.delete(`/projects/${projectId}/members/${memberId}`);
    return result.data;
  },
};

// Category Service
export const categoryService = {
  // Get all categories
  getAll: async () => {
    const result = await apiService.get('/categories');
    return result.data;
  },

  // Get category by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/categories/${id}`);
    return result.data;
  },

  // Create new category
  create: async (categoryData: any) => {
    const result = await apiService.post('/categories', categoryData);
    return result.data;
  },

  // Update category
  update: async (id: string | number, categoryData: any) => {
    const result = await apiService.put(`/categories/${id}`, categoryData);
    return result.data;
  },

  // Delete category
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/categories/${id}`);
    return result.data;
  },
};

// Skills Service
export const skillService = {
  // Get all skills
  getAll: async () => {
    const result = await apiService.get('/skills');
    return result.data;
  },

  // Get skill by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/skills/${id}`);
    return result.data;
  },

  // Create new skill
  create: async (skillData: any) => {
    const result = await apiService.post('/skills', skillData);
    return result.data;
  },

  // Update skill
  update: async (id: string | number, skillData: any) => {
    const result = await apiService.put(`/skills/${id}`, skillData);
    return result.data;
  },

  // Delete skill
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/skills/${id}`);
    return result.data;
  },
};

// Task Service
export const taskService = {
  // Get all tasks
  getAll: async (filters?: any) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/tasks?${queryParams}` : '/tasks';
    const result = await apiService.get(endpoint);
    return result.data;
  },

  // Get task by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/tasks/${id}`);
    return result.data;
  },

  // Create new task
  create: async (taskData: any) => {
    const result = await apiService.post('/tasks', taskData);
    return result.data;
  },

  // Update task
  update: async (id: string | number, taskData: any) => {
    const result = await apiService.put(`/tasks/${id}`, taskData);
    return result.data;
  },

  // Delete task
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/tasks/${id}`);
    return result.data;
  },

  // Get tasks by project
  getByProject: async (projectId: string | number) => {
    const result = await apiService.get(`/tasks?project_id=${projectId}`);
    return result.data;
  },

  // Get tasks by assignee
  getByAssignee: async (assigneeId: string | number, assigneeType: 'admin' | 'team') => {
    const result = await apiService.get(`/tasks?assignee_id=${assigneeId}&assignee_type=${assigneeType}`);
    return result.data;
  },

  // Update task status
  updateStatus: async (id: string | number, status: string, progress?: number) => {
    const data: any = { status };
    if (progress !== undefined) {
      data.progress = progress;
    }
    const result = await apiService.put(`/tasks/${id}`, data);
    return result.data;
  },

  // Update task progress
  updateProgress: async (id: string | number, progress: number) => {
    const result = await apiService.put(`/tasks/${id}`, { progress });
    return result.data;
  },
};

// Stage Service
export const stageService = {
  // Get all stages
  getAll: async (projectId?: string | number) => {
    const endpoint = projectId ? `/stages?project_id=${projectId}` : '/stages';
    const result = await apiService.get(endpoint);
    return result.data;
  },

  // Get stage by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/stages/${id}`);
    return result.data;
  },

  // Create new stage
  create: async (stageData: any) => {
    const result = await apiService.post('/stages', stageData);
    return result.data;
  },

  // Get stages by project
  getByProject: async (projectId: string | number) => {
    const result = await apiService.get(`/stages?project_id=${projectId}`);
    return result.data;
  },
};

// Dashboard Service
export const dashboardService = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      // Fetch all necessary data in parallel
      const [projects, teamMembers, categories, skills, tasks] = await Promise.all([
        projectService.getAll(),
        teamService.getAll(),
        categoryService.getAll(),
        skillService.getAll(),
        taskService.getAll()
      ]);

      // Calculate statistics
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        totalTeamMembers: teamMembers.length,
        activeTeamMembers: teamMembers.filter((m: any) => m.status === 'active').length,
        totalCategories: categories.length,
        totalSkills: skills.length,
        totalTasks: tasks.length,
        activeTasks: tasks.filter((t: any) => ['not-started', 'in-progress', 'under-review'].includes(t.status)).length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
        overdueTasks: tasks.filter((t: any) => new Date(t.end_date) < new Date() && t.status !== 'completed').length
      };

      return {
        projects,
        teamMembers,
        tasks,
        categories,
        skills,
        stats
      };
    } catch (error) {
      console.error('Dashboard overview fetch error:', error);
      throw error;
    }
  },

  // Get recent activity (placeholder for now)
  getRecentActivity: async () => {
    // TODO: Implement when we have activity/audit logs
    return [];
  }
};
