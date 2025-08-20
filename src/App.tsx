import React, { useEffect } from 'react';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Suspense, lazy } from 'react';
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Sidebar = lazy(() => import('./components/Sidebar').then(m => ({ default: m.Sidebar })));
const Header = lazy(() => import('./components/Header').then(m => ({ default: m.Header })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const ProjectManager = lazy(() => import('./components/ProjectManager').then(m => ({ default: m.ProjectManager })));
const TeamManager = lazy(() => import('./components/TeamManager').then(m => ({ default: m.TeamManager })));
const TaskManager = lazy(() => import('./components/TaskManager').then(m => ({ default: m.TaskManager })));
const TeamMemberLogin = lazy(() => import('./components/TeamMemberLogin').then(m => ({ default: m.TeamMemberLogin })));
const TeamMemberPortal = lazy(() => import('./components/TeamMemberPortal').then(m => ({ default: m.TeamMemberPortal })));
import { Loader2 } from 'lucide-react';
import type { User as UserType } from './types';

const MainApp = lazy(() => import('./components/MainApp').then(m => ({ default: m.MainApp })));

function App() {
  const { user, loading } = useAuth();
  const [teamMemberUser, setTeamMemberUser] = useState<UserType | null>(null);
  const [showTeamPortal, setShowTeamPortal] = useState(false);

  if (loading) {
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center ">
          <Suspense fallback={<div className="p-6 text-gray-600">Loading portal...</div>}>
            <TeamMemberLogin 
              onLogin={(user) => setTeamMemberUser(user)}
              onBackToAdmin={() => setShowTeamPortal(false)}
            />
          </Suspense>
        </div>
      );
    }
    
    return (
      <Suspense fallback={<div className="p-6 text-gray-600">Loading portal...</div>}>
        <TeamMemberPortal 
          user={teamMemberUser} 
          onLogout={() => {
            setTeamMemberUser(null);
            setShowTeamPortal(false);
          }} 
        />
      </Suspense>
    );
  }

  // Admin/Manager Login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ">
        <Suspense fallback={<div className="p-6 text-gray-600">Loading auth...</div>}>
          <Auth onSwitchToTeam={() => setShowTeamPortal(true)} />
        </Suspense>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading app...</div>}>
      <MainApp />
    </Suspense>
  );
}

export default App;