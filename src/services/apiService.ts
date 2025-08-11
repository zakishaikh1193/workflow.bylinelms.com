// Modern API service for the new Node.js backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  // Debug logging for auth headers
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Auth headers:', { hasToken: !!token, headers });
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'API request failed');
  }
  
  return data;
};

// Simple fetch wrapper without retries
const simpleFetch = async (url: string, options: RequestInit) => {
  // Debug logging for requests
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Making request to: ${url}`, { method: options.method });
  }
  
  const response = await fetch(url, options);
  
  // Debug logging for responses
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 Response from ${url}:`, { status: response.status, ok: response.ok });
  }
  
  return response;
};

// Generic API methods
export const apiService = {
  // GET request
  get: async (endpoint: string) => {
    const response = await simpleFetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // POST request
  post: async (endpoint: string, data: any) => {
    const response = await simpleFetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // PUT request
  put: async (endpoint: string, data: any) => {
    const response = await simpleFetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // DELETE request
  delete: async (endpoint: string) => {
    const response = await simpleFetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Team service (existing)
export const teamService = {
  getAll: async () => {
    const result = await apiService.get('/team');
    return result.data;
  },
  getById: async (id: string) => {
    const result = await apiService.get(`/team/${id}`);
    return result.data;
  },
  create: async (data: any) => {
    const result = await apiService.post('/team', data);
    return result.data;
  },
  update: async (id: string, data: any) => {
    const result = await apiService.put(`/team/${id}`, data);
    return result.data;
  },
  delete: async (id: string) => {
    const result = await apiService.delete(`/team/${id}`);
    return result.data;
  },
  
  // Team member specific endpoints
  getMembers: async () => {
    const result = await apiService.get('/team/members');
    return result.data;
  },
  getMemberById: async (id: string) => {
    const result = await apiService.get(`/team/members/${id}`);
    return result.data;
  },
  createMember: async (data: any) => {
    const result = await apiService.post('/team/members', data);
    return result.data;
  },
  updateMember: async (id: string, data: any) => {
    const result = await apiService.put(`/team/members/${id}`, data);
    return result.data;
  },
  deleteMember: async (id: string) => {
    const result = await apiService.delete(`/team/members/${id}`);
    return result.data;
  },
  
  // Team management endpoints (new)
  getTeams: async () => {
    const result = await apiService.get('/team/teams');
    return result.data;
  },
  getTeamById: async (id: string) => {
    const result = await apiService.get(`/team/teams/${id}`);
    return result.data;
  },
  createTeam: async (data: any) => {
    const result = await apiService.post('/team/teams', data);
    return result.data;
  },
  updateTeam: async (id: string, data: any) => {
    const result = await apiService.put(`/team/teams/${id}`, data);
    return result.data;
  },
  deleteTeam: async (id: string) => {
    const result = await apiService.delete(`/team/teams/${id}`);
    return result.data;
  },
  addMemberToTeam: async (teamId: string, data: any) => {
    const result = await apiService.post(`/team/teams/${teamId}/members`, data);
    return result.data;
  },
  removeMemberFromTeam: async (teamId: string, memberId: string) => {
    const result = await apiService.delete(`/team/teams/${teamId}/members/${memberId}`);
    return result.data;
  }
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

  // Get project teams
  getTeams: async (id: string | number) => {
    const result = await apiService.get(`/projects/${id}/teams`);
    return result.data;
  },

  // Add member to project
  addMember: async (projectId: string | number, memberData: any) => {
    const result = await apiService.post(`/projects/${projectId}/members`, memberData);
    return result.data;
  },

  // Add team to project
  addTeam: async (projectId: string | number, teamData: any) => {
    const result = await apiService.post(`/projects/${projectId}/members`, teamData);
    return result.data;
  },

  // Remove member from project
  removeMember: async (projectId: string | number, memberId: string | number) => {
    const result = await apiService.delete(`/projects/${projectId}/members/${memberId}`);
    return result.data;
  },

  // Remove team from project
  removeTeam: async (projectId: string | number, teamId: string | number) => {
    const result = await apiService.delete(`/projects/${projectId}/teams/${teamId}`);
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

// Grade Service
export const gradeService = {
  // Get all grades for a project
  getByProject: async (projectId: string | number) => {
    const result = await apiService.get(`/grades/project/${projectId}`);
    return result.data;
  },

  // Get all grades
  getAll: async () => {
    const result = await apiService.get('/grades');
    return result.data;
  },

  // Get grade by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/grades/${id}`);
    return result.data;
  },

  // Create new grade
  create: async (gradeData: any) => {
    const result = await apiService.post('/grades', gradeData);
    return result.data;
  },

  // Update grade
  update: async (id: string | number, gradeData: any) => {
    const result = await apiService.put(`/grades/${id}`, gradeData);
    return result.data;
  },

  // Delete grade
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/grades/${id}`);
    return result.data;
  },

  // Distribute weights
  distributeWeights: async (projectId: string | number) => {
    const result = await apiService.post('/grades/distribute-weights', { project_id: projectId });
    return result.data;
  }
};

// Book Service
export const bookService = {
  // Get all books for a grade
  getByGrade: async (gradeId: string | number) => {
    const result = await apiService.get(`/books/grade/${gradeId}`);
    return result.data;
  },

  // Get all books
  getAll: async () => {
    const result = await apiService.get('/books');
    return result.data;
  },

  // Get book by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/books/${id}`);
    return result.data;
  },

  // Create new book
  create: async (bookData: any) => {
    const result = await apiService.post('/books', bookData);
    return result.data;
  },

  // Update book
  update: async (id: string | number, bookData: any) => {
    const result = await apiService.put(`/books/${id}`, bookData);
    return result.data;
  },

  // Delete book
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/books/${id}`);
    return result.data;
  },

  // Distribute weights
  distributeWeights: async (gradeId: string | number) => {
    const result = await apiService.post('/books/distribute-weights', { grade_id: gradeId });
    return result.data;
  }
};

// Unit Service
export const unitService = {
  // Get all units for a book
  getByBook: async (bookId: string | number) => {
    const result = await apiService.get(`/units/book/${bookId}`);
    return result.data;
  },

  // Get all units
  getAll: async () => {
    const result = await apiService.get('/units');
    return result.data;
  },

  // Get unit by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/units/${id}`);
    return result.data;
  },

  // Create new unit
  create: async (unitData: any) => {
    const result = await apiService.post('/units', unitData);
    return result.data;
  },

  // Update unit
  update: async (id: string | number, unitData: any) => {
    const result = await apiService.put(`/units/${id}`, unitData);
    return result.data;
  },

  // Delete unit
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/units/${id}`);
    return result.data;
  },

  // Distribute weights
  distributeWeights: async (bookId: string | number) => {
    const result = await apiService.post('/units/distribute-weights', { book_id: bookId });
    return result.data;
  }
};

// Lesson Service
export const lessonService = {
  // Get all lessons for a unit
  getByUnit: async (unitId: string | number) => {
    const result = await apiService.get(`/lessons/unit/${unitId}`);
    return result.data;
  },

  // Get all lessons
  getAll: async () => {
    const result = await apiService.get('/lessons');
    return result.data;
  },

  // Get lesson by ID
  getById: async (id: string | number) => {
    const result = await apiService.get(`/lessons/${id}`);
    return result.data;
  },

  // Create new lesson
  create: async (lessonData: any) => {
    const result = await apiService.post('/lessons', lessonData);
    return result.data;
  },

  // Update lesson
  update: async (id: string | number, lessonData: any) => {
    const result = await apiService.put(`/lessons/${id}`, lessonData);
    return result.data;
  },

  // Delete lesson
  delete: async (id: string | number) => {
    const result = await apiService.delete(`/lessons/${id}`);
    return result.data;
  },

  // Distribute weights
  distributeWeights: async (unitId: string | number) => {
    const result = await apiService.post('/lessons/distribute-weights', { unit_id: unitId });
    return result.data;
  }
};

// Dashboard Service
export const dashboardService = {
  // Get dashboard overview data
  getOverview: async () => {
    try {
      // Fetch all necessary data in parallel with individual error handling
      const results = await Promise.allSettled([
        projectService.getAll().catch((error) => {
          console.error('❌ Projects fetch error:', error);
          return [];
        }),
        teamService.getMembers().catch((error) => {
          console.error('❌ Team members fetch error:', error);
          return [];
        }),
        categoryService.getAll().catch((error) => {
          console.error('❌ Categories fetch error:', error);
          return [];
        }),
        skillService.getAll().catch((error) => {
          console.error('❌ Skills fetch error:', error);
          return [];
        }),
        taskService.getAll().catch((error) => {
          console.error('❌ Tasks fetch error:', error);
          return [];
        })
      ]);

      const [projects, teamMembers, categories, skills, tasks] = results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value || [];
        } else {
          console.error('❌ API call failed:', result.reason);
          return [];
        }
      });

      // Debug logging
      console.log('🔍 Dashboard data received:', {
        projects: projects.length,
        teamMembers: teamMembers.length,
        categories: categories.length,
        skills: skills.length,
        tasks: tasks.length
      });

      // Calculate statistics
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        totalTeamMembers: teamMembers.length,
        activeTeamMembers: teamMembers.filter((m: any) => m.is_active !== false).length,
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
      // Return empty data instead of throwing
      return {
        projects: [],
        teamMembers: [],
        tasks: [],
        categories: [],
        skills: [],
        stats: {
          totalProjects: 0,
          activeProjects: 0,
          totalTeamMembers: 0,
          activeTeamMembers: 0,
          totalCategories: 0,
          totalSkills: 0,
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          overdueTasks: 0
        }
      };
    }
  },

  // Get recent activity (placeholder for now)
  getRecentActivity: async () => {
    // TODO: Implement when we have activity/audit logs
    return [];
  }
};
