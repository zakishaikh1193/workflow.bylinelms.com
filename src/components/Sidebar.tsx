import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  CheckSquare, 
  BarChart3,
  Calendar,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { name: 'Projects', icon: FolderOpen, key: 'projects' },
  { name: 'Teams', icon: Users, key: 'teams' },
  { name: 'Tasks', icon: CheckSquare, key: 'tasks' },
  { name: 'Allocations', icon: Calendar, key: 'allocations' },
  { name: 'Analytics', icon: BarChart3, key: 'analytics' },
  { name: 'Core Analytics', icon: TrendingUp, key: 'core-analytics' },
  { name: 'Settings', icon: Settings, key: 'settings' },
];

export function Sidebar() {
  const { state, dispatch } = useApp();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">ProjectFlow</h1>
        <p className="text-sm text-gray-500 mt-1">Project Management</p>
      </div>
      
      <nav className="px-4 space-y-4 h-[100vh]">
        {navigation.map((item) => {
          const isActive = state.selectedView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => dispatch({ type: 'SET_SELECTED_VIEW', payload: item.key as any })}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}