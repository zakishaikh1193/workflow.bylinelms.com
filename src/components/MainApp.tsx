import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { ProjectManager } from './ProjectManager';
import { TeamManager } from './TeamManager';
import { TaskManager } from './TaskManager';
import { DailyAllocations } from './DailyAllocations';
import { Settings } from './Settings';
import { Analytics } from './Analytics';
import { CoreAnalytics } from './CoreAnalytics';
import { Notification } from './Notification';
import { ToastProvider } from './ui/Toast';

export function MainApp() {
  const { state } = useApp();

  const renderContent = () => {
    switch (state.selectedView) {
      case 'projects':
        return <ProjectManager />;
      case 'teams':
        return <TeamManager />;
      case 'tasks':
        return <TaskManager />;
      case 'allocations':
        return <DailyAllocations />;
      case 'analytics':
        return <Analytics />;
      case 'core-analytics':
        return <CoreAnalytics />;
      case 'notifications':
        return <Notification />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}