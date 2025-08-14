import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Project, ProjectStatus } from '../../types';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => void;
  project: Project;
  categories: any[]; // Changed to any[] to match backend structure
}

export function EditProjectModal({ isOpen, onClose, onSubmit, project, categories }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: null as number | null, // Changed to category_id to match backend
    status: 'planning' as ProjectStatus,
    start_date: '', // Changed to start_date to match backend
    end_date: '', // Changed to end_date to match backend
  });

  useEffect(() => {
    if (project && isOpen) {
      // Helper function to safely format date
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return new Date().toISOString().split('T')[0];
        
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            return new Date().toISOString().split('T')[0];
          }
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.warn('Invalid date value:', dateValue, error);
          return new Date().toISOString().split('T')[0];
        }
      };

      // Use backend field names since that's what we're getting from the API
      const startDate = project.start_date;
      const endDate = project.end_date;

      setFormData({
        name: project.name || '',
        description: project.description || '',
        category_id: project.category_id || null,
        status: project.status || 'planning',
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Update Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}