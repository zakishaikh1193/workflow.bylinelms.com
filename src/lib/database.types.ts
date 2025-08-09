export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          category_id: string | null
          status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          progress: number
          created_by: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category_id?: string | null
          status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          progress?: number
          created_by?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category_id?: string | null
          status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date?: string
          end_date?: string
          progress?: number
          created_by?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          name: string
          description: string | null
          stage_id: string
          status: 'not-started' | 'in-progress' | 'under-review' | 'completed' | 'blocked'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string
          end_date: string
          progress: number
          estimated_hours: number
          actual_hours: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          stage_id: string
          status?: 'not-started' | 'in-progress' | 'under-review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string
          end_date: string
          progress?: number
          estimated_hours?: number
          actual_hours?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          stage_id?: string
          status?: 'not-started' | 'in-progress' | 'under-review' | 'completed' | 'blocked'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string
          end_date?: string
          progress?: number
          estimated_hours?: number
          actual_hours?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}