import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Edit2, 
  Trash2,
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Award, 
  AlertTriangle, 
  Flag, 
  Star,
  UserPlus,
  Mail,
  Activity,
  Building2,
  BarChart3,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { teamService, skillService } from '../services/apiService';
import type { User, PerformanceFlag } from '../types';

export function TeamManager() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copiedPasscode, setCopiedPasscode] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'functional-units'>('grid');
  
  // Backend integration state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamData, skillsData] = await Promise.all([
          teamService.getAll(),
          skillService.getAll()
        ]);
        
        console.log('✅ Team members fetched:', teamData);
        console.log('✅ Skills fetched:', skillsData);
        
        setTeamMembers(teamData);
        setSkills(skillsData);
        setError(null);
      } catch (error) {
        console.error('❌ Fetch team data error:', error);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Functional Units data (in real app, this would come from state/database)
  const functionalUnits = [
    {
      id: '1',
      name: 'Content Development Unit',
      description: 'Responsible for creating and developing educational content',
      skills: ['Content Writers', 'Instructional Designers'],
      lead: 'Sarah Johnson',
      isDefault: true
    },
    {
      id: '2',
      name: 'Design & Media Unit',
      description: 'Handles visual design, graphics, and multimedia production',
      skills: ['Graphic Designers', 'Animators'],
      lead: 'Emily Rodriguez',
      isDefault: true
    },
    {
      id: '3',
      name: 'Technology Unit',
      description: 'Manages technical development and system integration',
      skills: ['Developers', 'Tech'],
      lead: 'Mike Chen',
      isDefault: true
    },
    {
      id: '4',
      name: 'Quality Assurance Unit',
      description: 'Ensures quality and testing of all deliverables',
      skills: ['QA'],
      lead: 'David Kim',
      isDefault: true
    },
    {
      id: '5',
      name: 'Business Development Unit',
      description: 'Handles marketing, sales, and business growth',
      skills: ['Marketing', 'Sales'],
      lead: 'Lisa Thompson',
      isDefault: true
    }
  ];

  // Remove duplicate useEffect - we already have data fetching above

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        // Update existing user
        console.log('🔄 Updating team member:', editingUser.id, userData);
        
        // Convert skill names to skill IDs for update
        const skillIds = (userData.skills || []).map((skillName: string) => {
          const skill = skills.find(s => s.name === skillName);
          return skill ? skill.id : null;
        }).filter(id => id !== null);
        
        const updateData = {
          ...userData,
          skills: skillIds,
        };
        
        const updatedUser = await teamService.update(editingUser.id, updateData);
        setTeamMembers(teamMembers.map(member => 
          member.id === editingUser.id ? { ...member, ...updatedUser } : member
        ));
      } else {
        // Create new user
        console.log('🚀 Creating team member:', userData);
        
        // Convert skill names to skill IDs
        console.log('🔍 Input skills:', userData.skills);
        console.log('🔍 Available skills:', skills);
        const skillIds = (userData.skills || []).map((skillName: string) => {
          const skill = skills.find(s => s.name === skillName);
          console.log(`🔍 Skill "${skillName}" → ID:`, skill?.id);
          return skill ? skill.id : null;
        }).filter(id => id !== null);
        console.log('🔍 Final skill IDs:', skillIds);
        
        const newUserData = {
          ...userData,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          passcode: generatePasscode(),
          hourly_rate: userData.hourly_rate || null,
          bio: userData.bio || '',
          status: userData.status || 'active',
          skills: skillIds,
        };
        console.log('🔍 Final data being sent:', newUserData);
        const createdUser = await teamService.create(newUserData);
        setTeamMembers([...teamMembers, createdUser]);
        console.log('✅ Team member created:', createdUser);
      }
    } catch (error) {
      console.error('❌ Failed to save team member:', error);
      setError('Failed to save team member');
    }
    setIsCreateModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      console.log('🔄 Updating team member:', userId, updateData);
      const updatedUser = await teamService.update(userId, updateData);
      setTeamMembers(teamMembers.map(member => 
        member.id === userId ? { ...member, ...updatedUser } : member
      ));
    } catch (error) {
      console.error('❌ Update team member error:', error);
      setError('Failed to update team member');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting team member:', userId);
      await teamService.delete(userId);
      setTeamMembers(teamMembers.filter(member => member.id !== userId));
      console.log('✅ Team member deleted');
    } catch (error) {
      console.error('❌ Delete team member error:', error);
      setError('Failed to delete team member');
    }
  };

  // Generate a consistent demo passcode for team members
  const generatePasscode = () => {
    return 'DEMO123'; // Using consistent demo passcode for all team members
  };

  const handleEditUser = (member: any) => {
    setEditingUser(member);
    setIsCreateModalOpen(true);
  };

  const copyPasscode = async (passcode: string) => {
    try {
      await navigator.clipboard.writeText(passcode);
      setCopiedPasscode(passcode);
      setTimeout(() => setCopiedPasscode(null), 2000);
    } catch (err) {
      console.error('Failed to copy passcode:', err);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const userToUpdate = teamMembers.find(member => member.id === userId);
    if (userToUpdate) {
      try {
        const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
        await handleUpdateUser(userId, { status: newStatus });
      } catch (error) {
        console.error('Failed to update user status:', error);
      }
    }
  };

  const addPerformanceFlag = async (userId: string, flagType: 'gold' | 'green' | 'orange' | 'red') => {
    const flagReasons = {
      gold: 'Outstanding performance',
      green: 'Good work',
      orange: 'Needs attention',
      red: 'Performance issue'
    };

    const userToUpdate = teamMembers.find(member => member.id === userId);
    if (userToUpdate) {
      try {
        const createdFlag = await teamService.addPerformanceFlag(userId, {
          type: flagType,
          description: flagReasons[flagType],
          severity: 'medium',
          flagged_by: user?.id || 1
        });

        const newFlag: PerformanceFlag = {
          id: createdFlag.id,
          type: flagType,
          reason: flagReasons[flagType],
          date: createdFlag.created_at,
          addedBy: user?.email || 'System'
        };

        const updatedUser = {
          ...userToUpdate,
          performanceFlags: [...(userToUpdate.performanceFlags || []), newFlag]
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } catch (error) {
        console.error('Failed to add performance flag:', error);
      }
    }
  };

  const removePerformanceFlag = async (userId: string, flagId: string) => {
    const userToUpdate = teamMembers.find(member => member.id === userId);
    if (userToUpdate) {
      try {
        await teamService.removePerformanceFlag(flagId);
        
        const updatedUser = {
          ...userToUpdate,
          performanceFlags: (userToUpdate.performanceFlags || []).filter((flag: PerformanceFlag) => flag.id !== flagId)
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } catch (error) {
        console.error('Failed to remove performance flag:', error);
      }
    }
  };

  // Helper function to determine which functional unit a member belongs to
  // const getFunctionalUnitForMember = (member: User) => {
  //   return functionalUnits.find(unit => 
  //     unit.skills.some(skill => (member.skills || []).includes(skill))
  //   );
  // };

  const getMembersForUnit = (unit: any) => {
    return (teamMembers || []).filter(member => 
      unit.skills.some((skill: string) => member.skills?.includes(skill))
    );
  };

  const getUnitUtilization = (unit: any) => {
    const members = getMembersForUnit(unit);
    const activeMembers = members.filter(m => m.status === 'active');
    return members.length > 0 ? Math.round((activeMembers.length / members.length) * 100) : 0;
  };

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'gold': return <Award className="w-3 h-3" />;
      case 'green': return <Star className="w-3 h-3" />;
      case 'orange': return <AlertTriangle className="w-3 h-3" />;
      case 'red': return <Flag className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  const getFlagColor = (type: string) => {
    switch (type) {
      case 'gold': return 'bg-yellow-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'red': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUserStats = (userId: string) => {
    const userTasks = state.tasks.filter(task => task.assignees.includes(userId));
    const completedTasks = userTasks.filter(task => task.status === 'completed');
    const activeTasks = userTasks.filter(task => task.status !== 'completed');
    const overdueTasks = userTasks.filter(task => 
      new Date(task.endDate) < new Date() && task.status !== 'completed'
    );

    return {
      totalTasks: userTasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0
    };
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(teamMembers || []).map((member) => {
        const stats = getUserStats(member.id);
        
        return (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(member)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Badge variant={member.status === 'active' ? 'success' : 'secondary'} size="sm">
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Skills */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {(member.skills || []).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Task Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg font-bold text-blue-600">{stats.activeTasks}</div>
                  <div className="text-xs text-gray-600">Active</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">{stats.completedTasks}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {/* Passcode Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Passcode:</span>
                  <div className="flex items-center space-x-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {member.passcode || 'DEMO123'}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyPasscode(member.passcode || 'DEMO123')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedPasscode === member.passcode ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Performance Flags Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Performance:</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={() => addPerformanceFlag(member.id, 'gold')}
                      className="h-6 w-6 p-0 bg-yellow-500 hover:bg-yellow-600"
                      title="Add Gold Flag"
                    >
                      <Award className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addPerformanceFlag(member.id, 'green')}
                      className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600"
                      title="Add Green Flag"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addPerformanceFlag(member.id, 'orange')}
                      className="h-6 w-6 p-0 bg-orange-500 hover:bg-orange-600"
                      title="Add Orange Flag"
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addPerformanceFlag(member.id, 'red')}
                      className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                      title="Add Red Flag"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Display Performance Flags */}
                {member.performanceFlags && member.performanceFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.performanceFlags.map((flag: PerformanceFlag) => (
                      <div
                        key={flag.id}
                        className="relative group"
                      >
                        <div title={`${flag.reason} - Added on ${new Date(flag.date).toLocaleDateString()}`}>
                          <Badge
                            className={`text-xs px-2 py-1 ${getFlagColor(flag.type)}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getFlagIcon(flag.type)}
                              <span>{flag.type}</span>
                            </div>
                          </Badge>
                        </div>
                        <button
                          onClick={() => removePerformanceFlag(member.id, flag.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove flag"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Flag Counts Summary */}
                {member.performanceFlags && member.performanceFlags.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'gold').length > 0 && (
                      <span className="mr-2">🥇 {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'gold').length}</span>
                    )}
                    {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'green').length > 0 && (
                      <span className="mr-2">🟢 {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'green').length}</span>
                    )}
                    {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'orange').length > 0 && (
                      <span className="mr-2">🟠 {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'orange').length}</span>
                    )}
                    {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'red').length > 0 && (
                      <span className="mr-2">🔴 {member.performanceFlags.filter((f: PerformanceFlag) => f.type === 'red').length}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Access Control Section */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-medium text-gray-700">Access:</span>
                <Button
                  size="sm"
                  variant={member.status === 'active' ? "outline" : "primary"}
                  onClick={() => toggleUserStatus(member.id)}
                  className="h-7 px-3 text-xs"
                >
                  {member.status === 'active' ? (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(teamMembers || []).map((member) => {
                const stats = getUserStats(member.id);
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(member.skills || []).slice(0, 2).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {(member.skills || []).length > 2 && (
                          <Badge variant="secondary" size="sm">
                            +{(member.skills || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-600">{stats.activeTasks} active</span>
                        <span className="text-green-600">{stats.completedTasks} done</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {member.performanceFlags?.slice(0, 3).map((flag: PerformanceFlag) => (
                          <div key={flag.id} title={flag.reason}>
                            <Badge
                              className={`text-xs ${getFlagColor(flag.type)}`}
                            >
                              {getFlagIcon(flag.type)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(member.id)}
                        >
                          {member.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(member.id)}
                          className="text-red-600 hover:text-red-700"
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
      </CardContent>
    </Card>
  );

  const renderFunctionalUnitsView = () => (
    <div className="space-y-6">
      {/* Functional Units Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{functionalUnits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{state.users?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(functionalUnits.reduce((sum, unit) => sum + getUnitUtilization(unit), 0) / functionalUnits.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-50">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Skills Covered</p>
                <p className="text-2xl font-bold text-gray-900">{state.skills?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Functional Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {functionalUnits.map((unit) => {
          const members = getMembersForUnit(unit);
          const activeMembers = members.filter(m => m.status === 'active');
          const utilization = getUnitUtilization(unit);
          
          const getUtilizationColor = (util: number) => {
            if (util >= 80) return 'text-green-600 bg-green-50';
            if (util >= 60) return 'text-blue-600 bg-blue-50';
            if (util >= 40) return 'text-yellow-600 bg-yellow-50';
            return 'text-gray-600 bg-gray-50';
          };
          
          return (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{unit.name}</CardTitle>
                      <p className="text-sm text-gray-600">{unit.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Skills */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {unit.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Unit Lead */}
                {unit.lead && (
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>Lead: {unit.lead}</span>
                  </div>
                )}

                {/* Member Statistics */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-lg font-bold text-blue-600">{members.length}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{activeMembers.length}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                </div>

                {/* Utilization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Utilization</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${getUtilizationColor(utilization)}`}>
                      {utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilization >= 80 ? 'bg-green-500' :
                        utilization >= 60 ? 'bg-blue-500' :
                        utilization >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>

                {/* Team Members Preview */}
                {members.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Team Members:</p>
                    <div className="flex items-center space-x-2">
                      {members.slice(0, 4).map(member => (
                        <div 
                          key={member.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            member.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          title={`${member.name} - ${member.status === 'active' ? 'Active' : 'Inactive'}`}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                          +{members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {members.slice(0, 3).map(m => m.name).join(', ')}
                      {members.length > 3 && ` and ${members.length - 3} more`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team members, access codes, and performance</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team members, access codes, and performance</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team members, access codes, and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={selectedView === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={selectedView === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('list')}
            >
              List
            </Button>
            <Button
              variant={selectedView === 'functional-units' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('functional-units')}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Units
            </Button>
          </div>
          <Button 
            icon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              setEditingUser(null);
              setIsCreateModalOpen(true);
            }}
          >
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers?.filter(member => member.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers?.filter(member => member.performanceFlags?.some((f: PerformanceFlag) => f.type === 'gold')).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-2xl font-bold text-gray-900">{state.skills?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      {selectedView === 'grid' ? renderGridView() : 
       selectedView === 'list' ? renderListView() : 
       renderFunctionalUnitsView()}

      {/* Empty State */}
      {(!teamMembers || teamMembers.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first team member.</p>
            <Button 
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setEditingUser(null);
                setIsCreateModalOpen(true);
              }}
            >
              Add First Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleCreateUser}
        skills={skills || []}
        editingUser={editingUser}
      />
    </div>
  );
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User>) => void;
  skills: any[];
  editingUser?: User | null;
}

function CreateUserModal({ isOpen, onClose, onSubmit, skills, editingUser }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: [] as any[],
    isActive: true,
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        skills: editingUser.skills || [],
        isActive: editingUser.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        skills: [],
        isActive: true,
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      email: '',
      skills: [],
      isActive: true,
    });
  };

  const toggleSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName]
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingUser ? `Edit ${editingUser.name}` : "Add Team Member"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {skills.map((skill: any) => (
              <label key={skill.id || skill.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill.name)}
                  onChange={() => toggleSkill(skill.name)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active member (can access team portal)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingUser ? 'Update Member' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}