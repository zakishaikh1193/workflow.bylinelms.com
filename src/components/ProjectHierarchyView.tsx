import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Users, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  GraduationCap,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { taskService, projectService, stageService, teamService } from '../services/apiService';

interface ProjectHierarchyViewProps {
  projectId: string;
  onBack: () => void;
}

interface HierarchyItem {
  id: string;
  name: string;
  type: string; // Dynamic type based on actual data
  parentId?: string;
  children?: HierarchyItem[];
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started' | 'overdue';
  totalTasks: number;
  completedTasks: number;
  stages: StageProgress[];
  level: number; // Hierarchy level (0 = grade, 1 = book/unit, 2 = lesson, etc.)
  hasChildren: boolean;
}

interface StageProgress {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export function ProjectHierarchyView({ projectId, onBack }: ProjectHierarchyViewProps) {
  const [project, setProject] = useState<any>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedLeafItems, setExpandedLeafItems] = useState<Set<string>>(new Set()); // For lesson Subject Content
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData, stagesData] = await Promise.all([
        projectService.getById(projectId),
        taskService.getAll({ project_id: projectId, all: 'true' }),
        stageService.getAll()
      ]);

      const projectInfo = projectData.data || projectData;
      const tasks = tasksData.data || tasksData;
      const stages = stagesData.data || stagesData;

      setProject(projectInfo);
      
      // Build hierarchy from tasks
      const hierarchyData = buildHierarchyFromTasks(tasks, stages);
      setHierarchy(hierarchyData);
      
      // Don't auto-expand anything - let users choose what to expand
      setExpandedItems(new Set());
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

    const buildHierarchyFromTasks = (tasks: any[], stages: any[]): HierarchyItem[] => {
    const hierarchyMap = new Map<string, HierarchyItem>();
    const rootItems: HierarchyItem[] = [];

    // If no tasks, return empty hierarchy
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Process each task to build hierarchy
    tasks.forEach((task: any) => {
      const componentPath = task.component_path || '';
      if (!componentPath) return;

        const pathParts = componentPath.split('>').map((part: string) => part.trim());
        
        // Build hierarchy levels dynamically
        let currentParentId = '';
        pathParts.forEach((part: string, index: number) => {
          const itemId = pathParts.slice(0, index + 1).join('>');
          const level = index;
          
          // Determine type based on level and naming pattern
          let type = 'item';
          if (level === 0) {
            type = 'grade';
          } else if (level === 1) {
            // Check if this looks like a book/unit or lesson
            if (part.startsWith('B') || part.startsWith('U')) {
              type = 'book';
            } else if (part.startsWith('L')) {
              type = 'lesson';
            } else {
              type = 'book'; // Default to book for middle level
            }
          } else if (level === 2) {
            type = 'lesson';
          } else {
            type = 'item';
          }
        
        if (!hierarchyMap.has(itemId)) {
          const newItem: HierarchyItem = {
            id: itemId,
            name: part,
            type,
            parentId: currentParentId,
            progress: 0,
            status: 'not-started',
            totalTasks: 0,
            completedTasks: 0,
            stages: [],
            level,
            hasChildren: false
          };
          
          hierarchyMap.set(itemId, newItem);
          
          if (currentParentId) {
            const parent = hierarchyMap.get(currentParentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(newItem);
              parent.hasChildren = true;
            }
          } else {
            rootItems.push(newItem);
          }
        }
        
        currentParentId = itemId;
      });
    });

    // Calculate progress and status for each hierarchy item
    hierarchyMap.forEach(item => {
      // Get tasks that belong to this specific hierarchy level
      const itemTasks = tasks.filter(task => {
        const taskPath = task.component_path || '';
        if (taskPath === item.id) return true; // Exact match
        
        // Check if this task belongs to this hierarchy level
        const taskParts = taskPath.split('>').map((part: string) => part.trim());
        const itemParts = item.id.split('>').map((part: string) => part.trim());
        
        // Task should have at least as many parts as the item
        if (taskParts.length < itemParts.length) return false;
        
        // Check if the task path starts with this item's path
        for (let i = 0; i < itemParts.length; i++) {
          if (taskParts[i] !== itemParts[i]) return false;
        }
        return true;
      });
      
      item.totalTasks = itemTasks.length;
      item.completedTasks = itemTasks.filter(task => task.status === 'completed').length;
      item.progress = item.totalTasks > 0 ? Math.round((item.completedTasks / item.totalTasks) * 100) : 0;
      
      // Determine status
      if (item.progress === 100) item.status = 'completed';
      else if (item.progress > 0) item.status = 'in-progress';
      else item.status = 'not-started';
      
      // Calculate stage progress for this hierarchy item
      item.stages = stages.map(stage => {
        const stageTasks = itemTasks.filter(task => 
          task.category_stage_id === stage.id || task.stage_id === stage.id
        );
        const completed = stageTasks.filter(task => task.status === 'completed').length;
        const total = stageTasks.length;
        
        return {
          name: stage.name,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      }).filter(stage => stage.total > 0);
    });

    // Sort root items by name to ensure proper order (G1, G2, G3, G4)
    rootItems.sort((a, b) => {
      // Extract numeric part from grade names (G1, G2, G3, G4)
      const aNum = parseInt(a.name.replace(/\D/g, ''));
      const bNum = parseInt(b.name.replace(/\D/g, ''));
      
      // If both are numeric grades, sort numerically
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // Otherwise, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    // Sort children within each hierarchy item
    hierarchyMap.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          // Extract numeric part from names (U1, U2, L1, L2, etc.)
          const aNum = parseInt(a.name.replace(/\D/g, ''));
          const bNum = parseInt(b.name.replace(/\D/g, ''));
          
          // If both are numeric, sort numerically
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          // Otherwise, sort alphabetically
          return a.name.localeCompare(b.name);
        });
      }
    });

    return rootItems;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleLeafExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedLeafItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedLeafItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grade': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'book': return <BookOpen className="w-4 h-4 text-orange-600" />;
      case 'lesson': return <FileText className="w-4 h-4 text-green-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string, childrenCount: number) => {
    switch (type) {
      case 'grade': return `${childrenCount} books`;
      case 'book': return `${childrenCount} lessons`;
      case 'lesson': return `${childrenCount} tasks`;
      default: return `${childrenCount} items`;
    }
  };

  const renderHierarchyItem = (item: HierarchyItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const indentClass = `ml-${level * 6}`;
    
    // Alternate background colors: white for even levels, gray for odd levels
    const getAlternatingBackground = (level: number) => {
      return level % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    };

    return (
      <div key={item.id} className={`${indentClass} space-y-3`}>
        <div className={`flex items-center space-x-3 p-3 ${getAlternatingBackground(level)} border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors`}>
          {/* Expand/Collapse Button for items with children */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          {/* Chevron for leaf nodes (lessons) and grades with NO children to show Subject Content */}
          {!hasChildren && item.stages.length > 0 && (
            <button
              onClick={() => toggleLeafExpanded(item.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {expandedLeafItems.has(item.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          {/* Icon and Name */}
          <div className="flex items-center space-x-2">
            <div className="text-gray-500">
              {getTypeIcon(item.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              {hasChildren && (
                <p className="text-sm text-gray-500">
                  {getTypeLabel(item.type, item.children?.length || 0)}
                </p>
              )}
              {!hasChildren && item.type === 'lesson' && (
                <p className="text-sm text-gray-500">
                  {item.totalTasks} tasks
                </p>
              )}
            </div>
          </div>

          {/* Progress and Status */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status.replace('-', ' ')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {item.progress}%
                </span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(item.progress)} transition-all duration-300`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
            
          </div>
        </div>

                            {/* Stage Progress - for leaf nodes (lessons) and grades with NO children */}
          {!hasChildren && item.stages.length > 0 && expandedLeafItems.has(item.id) && (
            <div className={`ml-12 space-y-3 ${getAlternatingBackground(level + 1)} rounded-lg p-2`}>
              {/* Subject Content Header */}
              <div className="flex items-center space-x-2 p-2">
                <span className="text-sm font-medium text-gray-700">Subject Content:</span>
                <span className="text-xs text-gray-500">({item.stages.length} stages)</span>
              </div>
              
              {/* Stage Progress Grid */}
              <div className="grid grid-cols-5 gap-3">
                {item.stages.map((stage, index) => (
                  <div key={index} className="text-center space-y-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    {/* Stage title */}
                    <div className="text-xs font-medium text-gray-700 mb-2">{stage.name}</div>
                    
                    {/* Icon, progress bar, and percentage in one row */}
                    <div className="flex items-center justify-center space-x-2">
                      {/* Icon next to progress bar */}
                      {stage.percentage === 100 ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400" />
                      )}
                      
                      {/* Progress bar */}
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            stage.percentage === 100 ? 'bg-green-500' : 
                            stage.percentage > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Percentage */}
                      <span className="text-xs text-gray-600 font-medium">{stage.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="space-y-3">
            {item.children?.map(child => renderHierarchyItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading project hierarchy...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Analytics
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">Project hierarchy and progress tracking</p>
          </div>
        </div>
        
        {/* Project Summary Card */}
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-lg font-bold text-gray-900">
                  {hierarchy.length > 0 ? hierarchy[0].progress : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getProgressColor(hierarchy.length > 0 ? hierarchy[0].progress : 0)}`}
                  style={{ width: `${hierarchy.length > 0 ? hierarchy[0].progress : 0}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-medium">
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium">{project.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Tasks</p>
                  <p className="font-medium">
                    {hierarchy.length > 0 ? hierarchy[0].totalTasks : 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchy Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Project Hierarchy & Progress
          </CardTitle>
          <p className="text-sm text-gray-600">
            Click on arrows to expand/collapse sections. View detailed progress for each level.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {hierarchy.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hierarchy found for this project</p>
              <p className="text-sm text-gray-400 mt-1">Create some tasks with component paths to see the hierarchy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hierarchy.map(item => renderHierarchyItem(item))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
