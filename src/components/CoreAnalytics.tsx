import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  FolderOpen,
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';

// Curriculum Development Dashboard Data Structure
const curriculumData = {
  // Summary Metrics
  summary: {
    totalProjects: 5,
    inProgress: 3,
    completed: 0,
    totalBooks: 22,
    avgProgress: 7.7
  },

  // Distribution Data
  distribution: {
    projects: { total: 5, completed: 0, inProgress: 3, overdue: 0, pending: 2 },
    books: { total: 22, completed: 0, inProgress: 5, overdue: 0, pending: 17 },
    lessons: { total: 26, completed: 0, inProgress: 5, overdue: 0, pending: 21 }
  },

  // Development Stages Progress
  developmentStages: [
    { name: 'Content', completed: 1, inProgress: 13, overdue: 0, pending: 38, total: 52 },
    { name: 'Storyboarding', completed: 1, inProgress: 13, overdue: 0, pending: 38, total: 52 },
    { name: 'Design', completed: 1, inProgress: 13, overdue: 0, pending: 38, total: 52 },
    { name: 'Development', completed: 1, inProgress: 13, overdue: 0, pending: 38, total: 52 },
    { name: 'QA', completed: 1, inProgress: 13, overdue: 0, pending: 38, total: 52 }
  ],

  // Individual Curriculum Projects
  projects: [
    {
      id: 1,
      name: 'ICT Curriculum Development',
      subtitle: 'Comprehensive ICT curriculum for grades 1-12',
      status: 'IN PROGRESS',
      progress: 18.5,
      startDate: '1/1/2024',
      targetDate: '7/31/2024',
      projectedCompletion: '10/8/2024',
      tasks: 6,
      taskProgress: 33
    },
    {
      id: 2,
      name: 'KG Curriculum Development',
      subtitle: 'Kindergarten curriculum development program',
      status: 'IN PROGRESS',
      progress: 18.5,
      startDate: '2/1/2024',
      targetDate: '10/31/2024',
      projectedCompletion: '10/8/2024',
      tasks: 7,
      taskProgress: 28
    },
    {
      id: 3,
      name: 'Science Curriculum Development',
      subtitle: 'Primary Science curriculum for grades 1-8',
      status: 'PENDING',
      progress: 0.0,
      startDate: '3/1/2024',
      targetDate: '7/30/2024',
      projectedCompletion: '7/18/2024',
      tasks: 4,
      taskProgress: 0
    },
    {
      id: 4,
      name: 'Mathematics Curriculum Development',
      subtitle: 'Primary Mathematics curriculum for grades 1-8',
      status: 'PENDING',
      progress: 0.0,
      startDate: '4/1/2024',
      targetDate: '9/3/2024',
      projectedCompletion: '7/18/2024',
      tasks: 3,
      taskProgress: 0
    },
    {
      id: 5,
      name: 'English Language Arts Curriculum',
      subtitle: 'Comprehensive ELA curriculum for grades 1-8',
      status: 'PENDING',
      progress: 0.0,
      startDate: '5/1/2024',
      targetDate: '6/15/2024',
      projectedCompletion: '7/18/2024',
      tasks: 2,
      taskProgress: 0
    },
    {
      id: 6,
      name: 'Social Studies Curriculum',
      subtitle: 'Primary Social Studies curriculum for grades 1-8',
      status: 'PENDING',
      progress: 0.0,
      startDate: '6/1/2024',
      targetDate: '8/15/2024',
      projectedCompletion: '8/30/2024',
      tasks: 5,
      taskProgress: 0
    }
  ]
};

export function CoreAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions'>('overview');
  const [selectedFilter, setSelectedFilter] = useState('Standard Bar Chart');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderIconGrid = (type: 'projects' | 'books' | 'lessons') => {
    const data = curriculumData.distribution[type];
    const total = data.total;
    const completed = data.completed;
    const inProgress = data.inProgress;
    
    const icons = [];
    for (let i = 0; i < total; i++) {
      let iconClass = 'w-6 h-6 rounded-full border-2 ';
      if (i < completed) {
        iconClass += 'bg-green-500 border-green-500';
      } else if (i < completed + inProgress) {
        iconClass += 'bg-blue-500 border-blue-500';
      } else {
        iconClass += 'bg-orange-200 border-orange-300';
      }
      icons.push(
        <div key={i} className={iconClass}></div>
      );
    }

    return (
      <div className="grid grid-cols-6 gap-1">
        {icons}
      </div>
    );
  };

  const renderStackedBar = (type: 'projects' | 'books' | 'lessons') => {
    const data = curriculumData.distribution[type];
    const total = data.total;
    const completedPercent = (data.completed / total) * 100;
    const inProgressPercent = (data.inProgress / total) * 100;
    const overduePercent = (data.overdue / total) * 100;
    const pendingPercent = (data.pending / total) * 100;

    return (
      <div className="space-y-2">
        <div className="flex space-x-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-green-500" 
                style={{ width: `${completedPercent}%` }}
              ></div>
              <div 
                className="absolute left-0 top-0 h-full bg-blue-500" 
                style={{ width: `${inProgressPercent}%`, left: `${completedPercent}%` }}
              ></div>
              <div 
                className="absolute left-0 top-0 h-full bg-red-500" 
                style={{ width: `${overduePercent}%`, left: `${completedPercent + inProgressPercent}%` }}
              ></div>
              <div 
                className="absolute left-0 top-0 h-full bg-orange-500" 
                style={{ width: `${pendingPercent}%`, left: `${completedPercent + inProgressPercent + overduePercent}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Completed: {data.completed}%</span>
          <span>In Progress: {inProgressPercent.toFixed(1)}%</span>
          <span>Overdue: {overduePercent.toFixed(1)}%</span>
          <span>Pending: {pendingPercent.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Curriculum Development Dashboard</h1>
          <p className="text-gray-600">Monitor project progress and track development milestones.</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'predictions' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('predictions')}
          >
            Predictions
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{curriculumData.summary.totalProjects}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{curriculumData.summary.inProgress}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{curriculumData.summary.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{curriculumData.summary.totalBooks}</p>
                <p className="text-sm text-gray-600">Total Books</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{curriculumData.summary.avgProgress}%</p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Donut */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - curriculumData.summary.avgProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">0%</p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="w-5 h-5 mr-2" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderIconGrid('projects')}
            <p className="text-sm text-gray-600 mt-2">Total {curriculumData.distribution.projects.total}</p>
          </CardContent>
        </Card>

        {/* Books Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderIconGrid('books')}
            <p className="text-sm text-gray-600 mt-2">Total {curriculumData.distribution.books.total}</p>
          </CardContent>
        </Card>

        {/* Lessons Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderIconGrid('lessons')}
            <p className="text-sm text-gray-600 mt-2">Total {curriculumData.distribution.lessons.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stacked Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStackedBar('projects')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStackedBar('books')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStackedBar('lessons')}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Suite */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Advanced Analytics Suite
              </CardTitle>
              <p className="text-sm text-gray-600">Comprehensive data visualization and insights.</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                {selectedFilter}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Development Stages Progress</h3>
            <p className="text-sm text-gray-600">52 items for each stage</p>
            
            {curriculumData.developmentStages.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <span className="text-gray-600">{stage.total} items</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-green-500" 
                    style={{ width: `${(stage.completed / stage.total) * 100}%` }}
                  ></div>
                  <div 
                    className="absolute left-0 top-0 h-full bg-blue-500" 
                    style={{ 
                      width: `${(stage.inProgress / stage.total) * 100}%`, 
                      left: `${(stage.completed / stage.total) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-500" 
                    style={{ 
                      width: `${(stage.overdue / stage.total) * 100}%`, 
                      left: `${((stage.completed + stage.inProgress) / stage.total) * 100}%` 
                    }}
                  ></div>
                  <div 
                    className="absolute left-0 top-0 h-full bg-orange-500" 
                    style={{ 
                      width: `${(stage.pending / stage.total) * 100}%`, 
                      left: `${((stage.completed + stage.inProgress + stage.overdue) / stage.total) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Completed: {stage.completed}</span>
                  <span>In Progress: {stage.inProgress}</span>
                  <span>Overdue: {stage.overdue}</span>
                  <span>Pending: {stage.pending}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Curriculum Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {curriculumData.projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{project.subtitle}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Target Date</p>
                  <p className="font-medium">{project.targetDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Proj. Completion</p>
                  <p className="font-medium">{project.projectedCompletion}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tasks</p>
                  <p className="font-medium">{project.tasks} tasks</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Task Progress</span>
                  <span>{project.taskProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full bg-blue-500"
                    style={{ width: `${project.taskProgress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debug Info Panel */}
      {showDebugInfo && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Debug Info (Development Only)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Available Stages:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {curriculumData.developmentStages.map((stage, index) => (
                  <div key={index} className="text-yellow-700">
                    ID: {index + 1} - {stage.name}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Tasks by Stage:</h4>
              <div className="space-y-1 text-sm">
                {curriculumData.developmentStages.map((stage, index) => (
                  <div key={index} className="text-yellow-700">
                    Stage {index + 1}: {stage.inProgress} tasks
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="flex items-center gap-2"
        >
          {showDebugInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
        </Button>
      </div>
    </div>
  );
}
