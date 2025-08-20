import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { projectService, taskService, teamService, categoryService, skillService, dashboardService } from './apiService';

export function useProjects(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useTasks(filters?: any, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['tasks', filters ?? {}],
    queryFn: () => taskService.getAll(filters),
    staleTime: 1000 * 30,
    ...options,
  });
}

export function useTeamMembers(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamService.getMembers(),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useTeams(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getTeams(),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useCategories(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 1000 * 60 * 60,
    ...options,
  });
}

export function useSkills(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getAll(),
    staleTime: 1000 * 60 * 60,
    ...options,
  });
}

export function useDashboardOverview(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardService.getOverview(),
    staleTime: 1000 * 60,
    ...options,
  });
}


