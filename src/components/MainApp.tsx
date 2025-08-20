import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
const Sidebar = lazy(() => import('./Sidebar').then(m => ({ default: m.Sidebar })));
const Header = lazy(() => import('./Header').then(m => ({ default: m.Header })));
const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));
const ProjectManager = lazy(() => import('./ProjectManager').then(m => ({ default: m.ProjectManager })));
const TeamManager = lazy(() => import('./TeamManager').then(m => ({ default: m.TeamManager })));
const TaskManager = lazy(() => import('./TaskManager').then(m => ({ default: m.TaskManager })));
const DailyAllocations = lazy(() => import('./DailyAllocations').then(m => ({ default: m.DailyAllocations })));
const Settings = lazy(() => import('./Settings').then(m => ({ default: m.Settings })));
const Analytics = lazy(() => import('./Analytics').then(m => ({ default: m.Analytics })));

export function MainApp() {
  const { state } = useApp();

  const content = useMemo(() => {
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
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  }, [state.selectedView]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Suspense fallback={<div className="p-4 text-gray-600">Loading navigation...</div>}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<div className="p-4 text-gray-600">Loading header...</div>}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-6 text-gray-600">Loading content...</div>}>
            {content}
          </Suspense>
        </main>
      </div>
    </div>
  );
}