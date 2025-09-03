import React, { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectManager } from './components/ProjectManager';
import { TeamManager } from './components/TeamManager';
import { TaskManager } from './components/TaskManager';
import { TeamMemberLogin } from './components/TeamMemberLogin';
import { TeamMemberPortal } from './components/TeamMemberPortal';
import { Loader2 } from 'lucide-react';
import type { User as UserType } from './types';

import { MainApp } from './components/MainApp';

function App() {
  const { user, loading } = useAuth();
  const [teamMemberUser, setTeamMemberUser] = useState<UserType | null>(null);
  const [showTeamPortal, setShowTeamPortal] = useState(false);
  const [teamSessionLoading, setTeamSessionLoading] = useState(true);

  // Restore team member session on page load
  useEffect(() => {
    const restoreTeamSession = () => {
      try {
        const teamToken = localStorage.getItem('teamToken');
        const teamUserData = localStorage.getItem('teamUserData');
        
        if (teamToken && teamUserData) {
          const parsedUser = JSON.parse(teamUserData);
          setTeamMemberUser(parsedUser);
          setShowTeamPortal(true);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('teamToken');
        localStorage.removeItem('teamUserData');
      } finally {
        setTeamSessionLoading(false);
      }
    };

    restoreTeamSession();
  }, []);

  if (loading || teamSessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Team Member Portal Flow
  if (showTeamPortal) {
    if (!teamMemberUser) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
          <TeamMemberLogin 
            onLogin={(user) => setTeamMemberUser(user)}
            onBackToAdmin={() => setShowTeamPortal(false)}
          />
        </div>
      );
    }
    
    return (
      <TeamMemberPortal 
        user={teamMemberUser} 
        onLogout={() => {
          setTeamMemberUser(null);
          setShowTeamPortal(false);
        }} 
      />
    );
  }

  // Admin/Manager Login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Auth onSwitchToTeam={() => setShowTeamPortal(true)} />
      </div>
    );
  }

  return (
    <MainApp />
  );
}

export default App;