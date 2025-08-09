import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const teamMemberService = {
  // Authenticate team member with email and passcode
  async authenticate(email: string, passcode: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.rpc('authenticate_team_member', {
        p_email: email,
        p_passcode: passcode
      });

      if (error) {
        console.error('Authentication error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  },

  // Get all team members (for managers)
  async getAll() {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team_member_skills(
          skills(name)
        ),
        performance_flags(*)
      `)
      .order('name');
    
    if (error) throw error;
    
    // Transform data to match User interface
    return data?.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      passcode: member.passcode,
      isActive: member.is_active,
      skills: member.team_member_skills?.map((ts: any) => ts.skills.name) || [],
      performanceFlags: member.performance_flags?.map((flag: any) => ({
        id: flag.id,
        type: flag.type,
        reason: flag.reason,
        date: flag.created_at,
        addedBy: flag.added_by
      })) || []
    })) || [];
  },

  // Create new team member
  async create(memberData: Omit<User, 'id'>) {
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        name: memberData.name,
        email: memberData.email,
        passcode: memberData.passcode || this.generatePasscode(),
        is_active: memberData.isActive !== false
      })
      .select()
      .single();

    if (memberError) throw memberError;

    // Add skills if provided
    if (memberData.skills && memberData.skills.length > 0) {
      // Get skill IDs
      const { data: skills } = await supabase
        .from('skills')
        .select('id, name')
        .in('name', memberData.skills);

      if (skills && skills.length > 0) {
        const skillLinks = skills.map(skill => ({
          team_member_id: member.id,
          skill_id: skill.id
        }));

        await supabase
          .from('team_member_skills')
          .insert(skillLinks);
      }
    }

    return member;
  },

  // Update team member
  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: updates.name,
        email: updates.email,
        is_active: updates.isActive,
        ...(updates.passcode && { passcode: updates.passcode })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update skills if provided
    if (updates.skills !== undefined) {
      // Remove existing skills
      await supabase
        .from('team_member_skills')
        .delete()
        .eq('team_member_id', id);

      // Add new skills
      if (updates.skills.length > 0) {
        const { data: skills } = await supabase
          .from('skills')
          .select('id, name')
          .in('name', updates.skills);

        if (skills && skills.length > 0) {
          const skillLinks = skills.map(skill => ({
            team_member_id: id,
            skill_id: skill.id
          }));

          await supabase
            .from('team_member_skills')
            .insert(skillLinks);
        }
      }
    }

    return data;
  },

  // Add performance flag
  async addPerformanceFlag(teamMemberId: string, type: 'gold' | 'green' | 'orange' | 'red', reason: string, addedBy: string) {
    const { data, error } = await supabase
      .from('performance_flags')
      .insert({
        team_member_id: teamMemberId,
        type,
        reason,
        added_by: addedBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove performance flag
  async removePerformanceFlag(flagId: string) {
    const { error } = await supabase
      .from('performance_flags')
      .delete()
      .eq('id', flagId);

    if (error) throw error;
  },

  // Generate random passcode
  generatePasscode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
};