import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  Building2,
  Users2,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { teamService, skillService, taskService } from '../services/apiService';
import { useApp } from '../contexts/AppContext';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  passcode?: string;
  skills: string[];
  team_names?: string[];
  team_ids?: number[];
  performance_flags_count: number;
  is_active: boolean;
  created_at: string;
  task_count?: number; // Number of tasks assigned to this member
}

interface Team {
  id: number;
  name: string;
  description: string;
  functional_unit_name: string;
  team_lead_name: string;
  member_count: number;
  max_capacity: number;
  skills: string[];
  is_active: boolean;
  created_at: string;
  members?: any[];
}

interface FunctionalUnit {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
}

export function TeamManager() {
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'members' | 'teams'>('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Teams State
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [showAddMemberToTeamModal, setShowAddMemberToTeamModal] = useState(false);
  const [availableMembersForTeam, setAvailableMembersForTeam] = useState<TeamMember[]>([]);
  
  // Form States
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    passcode: '',
    skills: [] as string[],
    team_id: null as number | null
  });
  
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    functional_unit_id: null as number | null,
    team_lead_id: null as number | null,
    team_lead_type: 'team' as 'admin' | 'team',
    max_capacity: 10,
    members: [] as any[]
  });

  // Available skills for selection
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await skillService.getAll();
        console.log('🔍 Raw skills data:', skillsData);
        
        // The API now returns the data array directly
        let skillsArray = [];
        if (Array.isArray(skillsData)) {
          skillsArray = skillsData;
        }
        
        console.log('🔍 Skills array:', skillsArray);
        
        // Extract skill names from the skills data
        const skillNames = skillsArray.map((skill: any) => skill.name || skill);
        setAvailableSkills(skillNames);
        console.log('✅ Skills fetched:', skillNames);
        console.log('✅ Skills array length:', skillNames.length);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, []);

    const fetchData = async () => {
      try {
        setLoading(true);
      setError(null);
      
      if (activeTab === 'members') {
        const [membersData, tasksData] = await Promise.all([
          teamService.getMembers(),
          taskService.getAll()
        ]);
        
        console.log('✅ Team members fetched:', membersData);
        console.log('✅ Tasks fetched:', tasksData);
        
        // Add task counts to team members
        const membersWithTaskCounts = (membersData || []).map((member: TeamMember) => {
          const memberTasks = tasksData.filter((task: any) => 
            task.assignees && task.assignees.includes(member.id)
          );
          return {
            ...member,
            task_count: memberTasks.length
          };
        });
        
        setTeamMembers(membersWithTaskCounts);
        setFilteredMembers(membersWithTaskCounts);
      } else {
        const teamsData = await teamService.getTeams();
        
        console.log('✅ Teams fetched:', teamsData);
        setTeams(teamsData || []);
        setFilteredTeams(teamsData || []);
      }
      } catch (error) {
        console.error('❌ Fetch team data error:', error);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

  // Always fetch teams for the dropdown, regardless of active tab
  useEffect(() => {
    const fetchTeamsForDropdown = async () => {
      try {
        const teamsData = await teamService.getTeams();
        setTeams(teamsData || []);
        console.log('✅ Teams for dropdown fetched:', teamsData);
      } catch (error) {
        console.error('Error fetching teams for dropdown:', error);
      }
    };
    fetchTeamsForDropdown();
  }, []);

  // Filter team members
  useEffect(() => {
    if (activeTab === 'members') {
      const filtered = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.skills && member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredMembers(filtered);
      } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (team.skills && team.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teamMembers, teams, activeTab]);

  // Team Member Functions
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passcode is provided for new members
    if (!memberFormData.passcode || memberFormData.passcode.trim() === '') {
      setError('Passcode is required for new team members');
      return;
    }
    
    try {
      const result = await teamService.createMember(memberFormData);
      setTeamMembers([...teamMembers, result]);
      setShowCreateMemberModal(false);
      resetMemberForm();
    } catch (error) {
      console.error('Error creating team member:', error);
      setError('Failed to create team member');
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    try {
      // Only include passcode if it's provided (for updates)
      const updateData: any = { ...memberFormData };
      if (!updateData.passcode || updateData.passcode.trim() === '') {
        delete updateData.passcode;
      }
      
      const result = await teamService.updateMember(editingMember.id.toString(), updateData);
      setTeamMembers(teamMembers.map(m => m.id === editingMember.id ? result : m));
      setShowCreateMemberModal(false);
      setEditingMember(null);
      resetMemberForm();
    } catch (error) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      await teamService.deleteMember(id.toString());
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting team member:', error);
      setError('Failed to delete team member');
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    // Navigate to tasks page filtered by this team member
    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'tasks' });
    dispatch({ type: 'SET_FILTERS', payload: { teamMembers: [member.id.toString()] } });
  };

  const resetMemberForm = () => {
    setMemberFormData({
      name: '',
      email: '',
      passcode: '',
      skills: [],
      team_id: null
    });
  };

  // Team Functions
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await teamService.createTeam(teamFormData);
      setTeams([...teams, result]);
      setShowCreateTeamModal(false);
      resetTeamForm();
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team');
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    
    try {
      const result = await teamService.updateTeam(editingTeam.id.toString(), teamFormData);
      setTeams(teams.map(t => t.id === editingTeam.id ? result : t));
      setShowCreateTeamModal(false);
      setEditingTeam(null);
      resetTeamForm();
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team');
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await teamService.deleteTeam(id.toString());
      setTeams(teams.filter(t => t.id !== id));
      } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team');
    }
  };

  const resetTeamForm = () => {
    setTeamFormData({
      name: '',
      description: '',
      functional_unit_id: null,
      team_lead_id: null,
      team_lead_type: 'team',
      max_capacity: 10,
      members: []
    });
  };

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberFormData({
      name: member.name,
      email: member.email,
      passcode: '', // Leave empty for updates - only required for new members
      skills: member.skills,
      team_id: member.team_ids && member.team_ids.length > 0 ? member.team_ids[0] : null
    });
    setShowCreateMemberModal(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name,
      description: team.description,
      functional_unit_id: null, // Would need to fetch functional unit ID
      team_lead_id: null, // Would need to fetch team lead ID
      team_lead_type: 'team',
      max_capacity: team.max_capacity,
      members: []
    });
    setShowCreateTeamModal(true);
  };

  const openTeamDetails = async (team: Team) => {
    try {
      const result = await teamService.getTeamById(team.id.toString());
      setSelectedTeam(result);  
      setShowTeamDetailsModal(true);
      } catch (error) {
      console.error('Error fetching team details:', error);
      setError('Failed to fetch team details');
    }
  };

  const openAddMemberToTeam = async (team: Team) => {
    try {
      // Get all team members and filter out those already in this team
      const allMembers = await teamService.getMembers();
      const teamMembers = allMembers || [];
      
      // Filter out members who are already in this team
      const availableMembers = teamMembers.filter((member: TeamMember) => 
        !member.team_ids || !member.team_ids.includes(team.id)
      );
      
      setAvailableMembersForTeam(availableMembers);
      setSelectedTeam(team);
      setShowAddMemberToTeamModal(true);
      } catch (error) {
      console.error('Error fetching available members:', error);
      setError('Failed to fetch available members');
    }
  };

  const handleAddMemberToTeam = async (memberId: number) => {
    if (!selectedTeam) return;
    
    try {
      await teamService.addMemberToTeam(selectedTeam.id.toString(), { member_id: memberId });
      
      // Refresh team details
      const result = await teamService.getTeamById(selectedTeam.id.toString());
      setSelectedTeam(result);
      
      // Refresh team members list
      await fetchData();
      
      setShowAddMemberToTeamModal(false);
    } catch (error) {
      console.error('Error adding member to team:', error);
      setError('Failed to add member to team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading team data...</div>
      </div>
    );
  }
        
        return (
    <div className="space-y-6">
      {/* Header */}
              <div className="flex items-center justify-between">
                  <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team members and teams</p>
                  </div>
                </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
                </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Teams</span>
          </button>
        </nav>
              </div>

      {/* Search and Actions */}
                <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'members' ? 'team members' : 'teams'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
                </div>
              </div>

                    <Button
          onClick={() => {
            if (activeTab === 'members') {
              setEditingMember(null);
              resetMemberForm();
              setShowCreateMemberModal(true);
            } else {
              setEditingTeam(null);
              resetTeamForm();
              setShowCreateTeamModal(true);
            }
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'members' ? 'Member' : 'Team'}</span>
                    </Button>
                </div>

      {/* Content */}
      {activeTab === 'members' ? (
        <TeamMembersTab 
          members={filteredMembers}
          onEdit={openEditMember}
          onDelete={handleDeleteMember}
          onMemberClick={handleMemberClick}
        />
      ) : (
        <TeamsTab 
          teams={filteredTeams}
          onEdit={openEditTeam}
          onDelete={handleDeleteTeam}
          onViewDetails={openTeamDetails}
        />
      )}

      {/* Create/Edit Member Modal */}
      <Modal
        isOpen={showCreateMemberModal}
        onClose={() => {
          setShowCreateMemberModal(false);
          setEditingMember(null);
          resetMemberForm();
        }}
        title={editingMember ? 'Edit Team Member' : 'Create Team Member'}
      >
        <form onSubmit={editingMember ? handleUpdateMember : handleCreateMember} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={memberFormData.name}
                onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
                required
              />
                            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={memberFormData.email}
                onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
                        </div>
                      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passcode {editingMember && <span className="text-gray-500 text-xs">(leave empty to keep current)</span>}
              </label>
              <input
                type="text"
                value={memberFormData.passcode}
                onChange={(e) => setMemberFormData({ ...memberFormData, passcode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={editingMember ? "Leave empty to keep current passcode" : "Enter passcode"}
                required={!editingMember}
              />
              {!editingMember && (
                <p className="text-xs text-gray-500 mt-1">Passcode is required for new team members</p>
                    )}
                  </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Team</label>
              <select
                value={memberFormData.team_id || ''}
                onChange={(e) => setMemberFormData({ ...memberFormData, team_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a team (optional)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              </div>
    </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>
            <div className="text-xs text-gray-500 mb-2">Available skills: {availableSkills.length}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableSkills.length > 0 ? (
                availableSkills.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={memberFormData.skills.includes(skill)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMemberFormData({
                            ...memberFormData,
                            skills: [...memberFormData.skills, skill]
                          });
                        } else {
                          setMemberFormData({
                            ...memberFormData,
                            skills: memberFormData.skills.filter(s => s !== skill)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 py-4">
                  No skills available. Please add skills first.
                        </div>
              )}
                        </div>
            {memberFormData.skills.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected skills:</p>
                <div className="flex flex-wrap gap-2">
                  {memberFormData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      </div>
            )}
                          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowCreateMemberModal(false);
                setEditingMember(null);
                resetMemberForm();
              }}
              className="px-6"
            >
              Cancel
                        </Button>
            <Button type="submit" className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              {editingMember ? 'Update Member' : 'Create Member'}
                        </Button>
                      </div>
        </form>
      </Modal>

            {/* Create/Edit Team Modal */}
      <Modal
        isOpen={showCreateTeamModal}
        onClose={() => {
          setShowCreateTeamModal(false);
          setEditingTeam(null);
          resetTeamForm();
        }}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
      >
        <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
              <input
                type="text"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team name"
                required
              />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
              <input
                type="number"
                value={teamFormData.max_capacity}
                onChange={(e) => setTeamFormData({ ...teamFormData, max_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="50"
                placeholder="10"
              />
              </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={teamFormData.description}
              onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter team description"
            />
              </div>



          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowCreateTeamModal(false);
                setEditingTeam(null);
                resetTeamForm();
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-6 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
              {editingTeam ? 'Update Team' : 'Create Team'}
            </Button>
              </div>
        </form>
      </Modal>

      {/* Team Details Modal */}
      {selectedTeam && (
        <Modal
          isOpen={showTeamDetailsModal}
          onClose={() => {
            setShowTeamDetailsModal(false);
            setSelectedTeam(null);
          }}
          title={`${selectedTeam.name} - Team Details`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
              <p className="text-gray-600">{selectedTeam.description}</p>
      </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Functional Unit</label>
                <p className="text-gray-900">{selectedTeam.functional_unit_name || 'Not assigned'}</p>
                    </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700">Team Lead</label>
                <p className="text-gray-900">{selectedTeam.team_lead_name}</p>
                    </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Members</label>
                <p className="text-gray-900">{selectedTeam.member_count} / {selectedTeam.max_capacity}</p>
                  </div>
                </div>
              
            {selectedTeam.skills && selectedTeam.skills.length > 0 && (
                <div>
                <label className="block text-sm font-medium text-gray-700">Team Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTeam.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Team Members</label>
                <Button
                  size="sm"
                  onClick={() => openAddMemberToTeam(selectedTeam)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={selectedTeam.member_count >= selectedTeam.max_capacity}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add Member
                </Button>
                  </div>
              
              {selectedTeam.members && selectedTeam.members.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {selectedTeam.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.team_role}</p>
                  </div>
                      <Badge variant="secondary">{member.skills?.length || 0} skills</Badge>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No members assigned to this team</p>
                  </div>
              )}
                  </div>
                </div>
        </Modal>
      )}

      {/* Add Member to Team Modal */}
      {selectedTeam && (
        <Modal
          isOpen={showAddMemberToTeamModal}
          onClose={() => {
            setShowAddMemberToTeamModal(false);
            setSelectedTeam(null);
            setAvailableMembersForTeam([]);
          }}
          title={`Add Member to ${selectedTeam.name}`}
        >
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Select a member to add to <strong>{selectedTeam.name}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current: {selectedTeam.member_count} / {selectedTeam.max_capacity} members
              </p>
            </div>

            {availableMembersForTeam.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableMembersForTeam.map((member) => (
                        <div 
                          key={member.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddMemberToTeam(member.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                        </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {member.skills.length} skills
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
      </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No available members</p>
                <p className="text-sm">All team members are already assigned to this team or other teams.</p>
    </div>
            )}

            <div className="flex justify-end pt-4 border-t">
            <Button 
                variant="outline"
              onClick={() => {
                  setShowAddMemberToTeamModal(false);
                  setSelectedTeam(null);
                  setAvailableMembersForTeam([]);
              }}
            >
                Cancel
            </Button>
          </div>
        </div>
        </Modal>
      )}
      </div>
    );
  }

// Team Members Tab Component
interface TeamMembersTabProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (id: number) => void;
  onMemberClick?: (member: TeamMember) => void;
}

function TeamMembersTab({ members, onEdit, onDelete, onMemberClick }: TeamMembersTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <Card 
          key={member.id} 
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => onMemberClick && onMemberClick(member)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
        <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {member.email}
                    </p>
                    {member.passcode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Passcode: <span className="font-mono bg-gray-100 px-1 rounded">{member.passcode}</span>
                      </p>
                    )}
        </div>
          </div>
                
                <div className="mb-4 space-y-3">
                  {/* Task Count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Tasks</span>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {member.task_count || 0} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((member.task_count || 0) * 10, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Skills</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {member.skills.length} skills
                      </span>
                    </div>

                    {member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            +{member.skills.length - 3} more
                          </Badge>
                        )}
              </div>
                    )}
              </div>

                  {member.team_names && member.team_names.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Teams</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {member.team_names.length} team{member.team_names.length > 1 ? 's' : ''}
                        </span>
              </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {member.team_names.map((teamName, index) => (
                          <Badge key={index} variant="default" className="text-xs px-2 py-1 bg-green-100 text-green-800">
                            {teamName}
                          </Badge>
                        ))}
              </div>
              </div>
                  )}
            </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.is_active ? "default" : "secondary"} className="px-3 py-1">
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {member.performance_flags_count > 0 && (
                      <Badge variant="danger" className="px-3 py-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {member.performance_flags_count} flags
                      </Badge>
                    )}
      </div>

                  <div className="flex space-x-1">
            <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
            </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(member.id);
                      }}
                      className="hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Teams Tab Component
interface TeamsTabProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (id: number) => void;
  onViewDetails: (team: Team) => void;
}

function TeamsTab({ teams, onEdit, onDelete, onViewDetails }: TeamsTabProps) {
  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h3>
        <p className="text-gray-600 mb-6">Create your first team to get started.</p>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
          <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.description || 'No description'}</p>
                  </div>
          </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{team.functional_unit_name || 'No unit'}</span>
          </div>
                    <Badge variant={team.is_active ? "default" : "secondary"} className="px-2 py-1 text-xs">
                      {team.is_active ? 'Active' : 'Inactive'}
                    </Badge>
        </div>

                  <div className="flex items-center space-x-2">
                    <Users2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {team.member_count || 0} / {team.max_capacity || 10} members
                    </span>
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((team.member_count || 0) / (team.max_capacity || 10)) * 100, 100)}%` }}
                        ></div>
                      </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{team.team_lead_name || 'No team lead'}</span>
                  </div>
        </div>

                {team.skills && team.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Team Skills</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {team.skills.length} skills
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {team.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                          {skill}
                        </Badge>
                      ))}
                      {team.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          +{team.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onViewDetails(team)}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Users className="w-3 h-3" />
          </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEdit(team)}
                      className="hover:bg-green-50 hover:border-green-300 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDelete(team.id)}
                      className="hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
          </Button>
        </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}