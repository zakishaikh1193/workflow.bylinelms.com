export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  avatar?: string;
  passcode?: string;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'on-leave';
  hourly_rate?: number;
  bio?: string;
  performanceFlags?: PerformanceFlag[];
}

export interface PerformanceFlag {
  id: string;
  type: 'gold' | 'green' | 'orange' | 'red';
  reason: string;
  date: string;
  addedBy: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  category_id?: number | null; // Backend field for category ID
  status: ProjectStatus;
  startDate?: Date; // Frontend field (optional for backward compatibility)
  endDate?: Date; // Frontend field (optional for backward compatibility)
  start_date?: string; // Backend field for start date (primary)
  end_date?: string; // Backend field for end date (primary)
  progress: number;
  stages: Stage[];
  teamMembers: string[]; // User IDs
  subProjects?: Project[];
  parentId?: string;
  grades?: Grade[];
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  order: number;
  weight: number; // Percentage weight of this grade (0-100)
  books: Book[];
}

export interface Book {
  id: string;
  name: string;
  type: 'student' | 'teacher' | 'practice' | 'digital';
  description?: string;
  gradeId: string;
  order: number;
  weight: number; // Percentage weight of this book (0-100)
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  description?: string;
  bookId: string;
  order: number;
  weight: number; // Percentage weight of this unit (0-100)
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  name: string;
  description?: string;
  unitId: string;
  order: number;
  weight: number; // Percentage weight of this lesson (0-100)
}

export interface ProjectComponent {
  id: string;
  name: string;
  type: 'project' | 'grade' | 'book' | 'unit' | 'lesson';
  description?: string;
  parentId?: string;
  projectId: string;
  progress: number;
  order: number;
  path: string; // e.g., "Grade KG1 > Book 1 > Unit 1 > Lesson 1"
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  order: number;
  weight: number; // Percentage weight of this stage (0-100)
  status: StageStatus;
  progress: number;
  startDate: Date;
  endDate: Date;
  reviewRounds: ReviewRound[];
  tasks: Task[];
  subStages?: Stage[];
  parentStageId?: string;
}

export interface ReviewRound {
  id: string;
  name: string;
  stageId: string;
  status: ReviewStatus;
  reviewers: string[]; // User IDs
  startDate: Date;
  endDate: Date;
  comments?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  stageId?: string; // Frontend field (optional for backward compatibility)
  projectId?: string; // Frontend field (optional for backward compatibility)
  stage_id?: string; // Backend field for stage ID
  project_id?: string; // Backend field for project ID
  gradeId?: string;
  bookId?: string;
  unitId?: string;
  lessonId?: string;
  componentPath?: string; // Human readable path
  assignees: string[]; // User IDs
  teamAssignees?: string[]; // Team IDs
  skills: string[] | any[]; // Can be array of strings or skill objects
  status: TaskStatus;
  priority: Priority;
  startDate?: Date; // Frontend field (optional for backward compatibility)
  endDate?: Date; // Frontend field (optional for backward compatibility)
  start_date?: string; // Backend field for start date
  end_date?: string; // Backend field for end date
  progress: number;
  estimatedHours?: number; // Frontend field (optional for backward compatibility)
  actualHours?: number; // Frontend field (optional for backward compatibility)
  estimated_hours?: number; // Backend field for estimated hours
  actual_hours?: number; // Backend field for actual hours
}

export interface TeamAllocation {
  userId: string;
  projectId: string;
  taskId: string;
  hoursPerDay: number;
  startDate: Date;
  endDate: Date;
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type StageStatus = 'not-started' | 'in-progress' | 'under-review' | 'completed';
export type ReviewStatus = 'pending' | 'in-progress' | 'approved' | 'rejected';
export type TaskStatus = 'not-started' | 'in-progress' | 'under-review' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface FilterOptions {
  projects?: string[];
  categories?: string[];
  teamMembers?: string[];
  skills?: string[];
  stages?: string[];
  statuses?: string[];
  overdue?: boolean;
  dueToday?: boolean;
  dueTomorrow?: boolean;
  dueThisWeek?: boolean;
}