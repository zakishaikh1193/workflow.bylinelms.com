import React, { useState } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  Users, 
  MoreHorizontal,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { useApp } from '../contexts/AppContext';
import { Project, ProjectStatus } from '../types';
import { ProjectDetails } from './ProjectDetails';
import { calculateProjectProgress } from '../utils/progressCalculator';

// Category-specific stage templates
const stageTemplates = {
  'eLearning Design': [
    { id: '1', name: 'Content Strategy', description: 'Define learning objectives and content outline', order: 1 },
    { id: '2', name: 'Instructional Design', description: 'Create detailed instructional design document', order: 2 },
    { id: '3', name: 'Storyboarding', description: 'Visual planning and storyboard creation', order: 3 },
    { id: '4', name: 'Content Development', description: 'Content creation and writing phase', order: 4 },
    { id: '5', name: 'Media Production', description: 'Graphics, animations, and multimedia creation', order: 5 },
    { id: '6', name: 'Development & Integration', description: 'Technical development and LMS integration', order: 6 },
    { id: '7', name: 'Review & QA', description: 'Quality assurance and review process', order: 7 },
    { id: '8', name: 'Deployment', description: 'Final deployment and launch', order: 8 },
  ],
  'Curriculum Design': [
    { id: '9', name: 'Curriculum Analysis', description: 'Analyze curriculum requirements and standards', order: 1 },
    { id: '10', name: 'Scope & Sequence', description: 'Define scope and sequence of curriculum', order: 2 },
    { id: '11', name: 'Learning Objectives', description: 'Define detailed learning objectives', order: 3 },
    { id: '12', name: 'Content Creation', description: 'Develop curriculum content and materials', order: 4 },
    { id: '13', name: 'Assessment Design', description: 'Create assessments and evaluation tools', order: 5 },
    { id: '14', name: 'Teacher Resources', description: 'Develop teacher guides and resources', order: 6 },
    { id: '15', name: 'Pilot Testing', description: 'Pilot test with target audience', order: 7 },
    { id: '16', name: 'Revision & Finalization', description: 'Revise based on feedback and finalize', order: 8 },
  ],
  'IT Applications': [
    { id: '17', name: 'Requirements Analysis', description: 'Gather and analyze system requirements', order: 1 },
    { id: '18', name: 'System Design', description: 'Design system architecture and database', order: 2 },
    { id: '19', name: 'UI/UX Design', description: 'Design user interface and user experience', order: 3 },
    { id: '20', name: 'Frontend Development', description: 'Develop user interface and client-side logic', order: 4 },
    { id: '21', name: 'Backend Development', description: 'Develop server-side logic and APIs', order: 5 },
    { id: '22', name: 'Database Implementation', description: 'Implement database and data models', order: 6 },
    { id: '23', name: 'Integration Testing', description: 'Test system integration and APIs', order: 7 },
    { id: '24', name: 'User Acceptance Testing', description: 'Conduct user acceptance testing', order: 8 },
    { id: '25', name: 'Deployment & Launch', description: 'Deploy to production and launch', order: 9 },
  ],
};

export function ProjectManager() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredProjects = state.projects.filter(project => {
    if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && project.status !== selectedStatus) return false;
    return true;
  });

  const handleCreateProject = (projectData: Partial<Project>) => {
    // Get stages for the selected category
    const categoryStages = stageTemplates[projectData.category as keyof typeof stageTemplates] || [];
    
    // Add weights to stages (distribute evenly)
    const stagesWithWeights = categoryStages.map((stage, index, array) => {
      const baseWeight = Math.floor(100 / array.length);
      const remainder = 100 - (baseWeight * array.length);
      return {
        ...stage,
        weight: index === 0 ? baseWeight + remainder : baseWeight,
        status: 'not-started' as const,
        progress: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewRounds: [],
        tasks: [],
      };
    });
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name || '',
      description: projectData.description || '',
      category: projectData.category || state.categories[0],
      status: 'planning' as ProjectStatus,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      progress: 0,
      teamMembers: [],
      // Add category-specific stages to new projects
      stages: stagesWithWeights,
      ...projectData,
    };
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    setIsCreateModalOpen(false);
  };

  const getStatusVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'on-hold': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (selectedProject) {
    return (
      <ProjectDetails 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage and track your project portfolio</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Filters and View Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {state.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{project.category}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {project.teamMembers.length}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(project.endDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24">
                          <ProgressBar value={project.progress} showLabel={false} />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{project.progress}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {project.teamMembers.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        categories={state.categories}
      />
    </div>
  );
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => void;
  categories: string[];
}

function CreateProjectModal({ isOpen, onClose, onSubmit, categories }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0] || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
    setFormData({
      name: '',
      description: '',
      category: categories[0] || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
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
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}