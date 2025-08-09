import { supabase } from '../lib/supabase';
import type { Project, User, Task, ProjectStatus, TaskStatus, Priority } from '../types';

// Projects
export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        categories(name),
        project_members(
          user_id,
          role,
          profiles(name, email)
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async create(project: Omit<Project, 'id' | 'stages' | 'teamMembers'> & { teamMembers: string[] }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        category_id: project.category,
        status: project.status,
        start_date: project.startDate.toISOString().split('T')[0],
        end_date: project.endDate.toISOString().split('T')[0],
        progress: project.progress,
        created_by: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add project members
    if (project.teamMembers.length > 0) {
      const members = project.teamMembers.map(userId => ({
        project_id: data.id,
        user_id: userId,
        role: 'member' as const,
      }));

      await supabase.from('project_members').insert(members);
    }

    return data;
  },

  async update(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        progress: updates.progress,
        start_date: updates.startDate?.toISOString().split('T')[0],
        end_date: updates.endDate?.toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Users/Profiles
export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills(
          skills(name)
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async create(user: Omit<User, 'id'>) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        name: user.name,
        email: user.email,
      })
      .select()
      .single();

    if (error) throw error;

    // Add user skills
    if (user.skills.length > 0) {
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', user.skills);

      if (skillsData) {
        const userSkills = skillsData.map(skill => ({
          user_id: data.id,
          skill_id: skill.id,
        }));

        await supabase.from('user_skills').insert(userSkills);
      }
    }

    return data;
  },

  async getCurrentProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills(
          skills(name)
        )
      `)
      .eq('id', user.user.id)
      .single();

    if (error) throw error;
    return data;
  },
};

// Tasks
export const taskService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignees(
          assignee_id,
          profiles(name, email)
        ),
        task_skills(
          skills(name)
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async create(task: Omit<Task, 'id'>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: task.name,
        description: task.description,
        stage_id: task.stageId,
        status: task.status,
        priority: task.priority,
        start_date: task.startDate.toISOString().split('T')[0],
        end_date: task.endDate.toISOString().split('T')[0],
        progress: task.progress,
        estimated_hours: task.estimatedHours,
        actual_hours: task.actualHours,
        created_by: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add task assignees
    if (task.assignees.length > 0) {
      const assignees = task.assignees.map(userId => ({
        task_id: data.id,
        assignee_id: userId,
      }));

      await supabase.from('task_assignees').insert(assignees);
    }

    // Add task skills
    if (task.skills.length > 0) {
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', task.skills);

      if (skillsData) {
        const taskSkills = skillsData.map(skill => ({
          task_id: data.id,
          skill_id: skill.id,
        }));

        await supabase.from('task_skills').insert(taskSkills);
      }
    }

    return data;
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        progress: updates.progress,
        start_date: updates.startDate?.toISOString().split('T')[0],
        end_date: updates.endDate?.toISOString().split('T')[0],
        estimated_hours: updates.estimatedHours,
        actual_hours: updates.actualHours,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Categories
export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(name: string, description?: string) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Skills
export const skillService = {
  async getAll() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(name: string, description?: string) {
    const { data, error } = await supabase
      .from('skills')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};