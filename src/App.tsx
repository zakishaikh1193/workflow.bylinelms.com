import React, { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <TeamMemberLogin 
          onLogin={(user) => setTeamMemberUser(user)} 
        />
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
        <div className="w-full max-w-md space-y-4">
          <Auth />
          <div className="text-center">
            <button
              onClick={() => setShowTeamPortal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Team Member? Sign in here →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainApp />
  );
}

export default App;