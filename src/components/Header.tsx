import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { notificationService } from '../services/apiService';

export function Header() {
  const { user, signOut } = useAuth();
  const { dispatch } = useApp();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadNotificationCount();
      // Refresh notification count every 5 minutes
      const interval = setInterval(loadNotificationCount, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotificationCount = async () => {
    try {
      const response = await notificationService.getAll();
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      const extensions = response?.data?.extensions || [];
      const remarks = response?.data?.remarks || [];

      const recentExtensions = extensions.filter((e: any) => new Date(e.created_at) >= cutoff);
      const recentRemarks = remarks.filter((r: any) => new Date(r.created_at) >= cutoff);

      const totalCount = recentExtensions.length + recentRemarks.length;
      setNotificationCount(totalCount);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const handleNotificationClick = () => {
    // Always clear any selected task when navigating to notifications
    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'notifications' });
    setShowDropdown(false);
  };

  const handleSignOut = () => {
    signOut();
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">ProjectFlow</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationClick}
            className="relative p-2"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>{user?.name || 'User'}</span>
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={() => {
                    // Always clear any selected task when navigating to settings
                    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
                    dispatch({ type: 'SET_SELECTED_VIEW', payload: 'settings' });
                    setShowDropdown(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}