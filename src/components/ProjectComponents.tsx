import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Layers, 
  FileText, 
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/ProgressBar';
import { useApp } from '../contexts/AppContext';
import type { Project, Grade, Book, Unit, Lesson } from '../types';

interface ProjectComponentsProps {
  project: Project;
  onBack: () => void;
}

export function ProjectComponents({ project, onBack }: ProjectComponentsProps) {
  const { state, dispatch } = useApp();
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<any>(null);
  const [componentType, setComponentType] = useState<'grade' | 'book' | 'unit' | 'lesson'>('grade');
  const [parentId, setParentId] = useState<string>('');

  const toggleExpanded = (type: 'grade' | 'book' | 'unit', id: string) => {
    const setters = {
      grade: setExpandedGrades,
      book: setExpandedBooks,
      unit: setExpandedUnits,
    };
    
    const setter = setters[type];
    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const validateWeights = (items: any[]) => {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    return Math.abs(totalWeight - 100) <= 0.1;
  };

  const distributeWeightsEvenly = (items: any[]) => {
    if (items.length === 0) return items;
    const weightPerItem = Math.floor(100 / items.length);
    const remainder = 100 - (weightPerItem * items.length);
    
    return items.map((item, index) => ({
      ...item,
      weight: index === 0 ? weightPerItem + remainder : weightPerItem
    }));
  };

  const handleCreateComponent = (componentData: any) => {
    const updatedProject = { ...project };
    
    if (!updatedProject.grades) {
      updatedProject.grades = [];
    }

    if (componentType === 'grade') {
      const newGrade: Grade = {
        id: Date.now().toString(),
        name: componentData.name,
        description: componentData.description,
        projectId: project.id,
        order: updatedProject.grades.length + 1,
        weight: componentData.weight || Math.floor(100 / (updatedProject.grades.length + 1)),
        books: [],
      };
      
      if (editingComponent) {
        updatedProject.grades = updatedProject.grades.map(g => 
          g.id === editingComponent.id ? { ...newGrade, id: editingComponent.id } : g
        );
      } else {
        updatedProject.grades.push(newGrade);
      }
    } else if (componentType === 'book') {
      const grade = updatedProject.grades.find(g => g.id === parentId);
      if (grade) {
        const newBook: Book = {
          id: Date.now().toString(),
          name: componentData.name,
          type: componentData.type || 'student',
          description: componentData.description,
          gradeId: parentId,
          order: grade.books.length + 1,
          weight: componentData.weight || Math.floor(100 / (grade.books.length + 1)),
          units: [],
        };
        
        if (editingComponent) {
          grade.books = grade.books.map(b => 
            b.id === editingComponent.id ? { ...newBook, id: editingComponent.id } : b
          );
        } else {
          grade.books.push(newBook);
        }
      }
    } else if (componentType === 'unit') {
      const grade = updatedProject.grades.find(g => g.books.some(b => b.id === parentId));
      const book = grade?.books.find(b => b.id === parentId);
      if (book) {
        const newUnit: Unit = {
          id: Date.now().toString(),
          name: componentData.name,
          description: componentData.description,
          bookId: parentId,
          order: book.units.length + 1,
          weight: componentData.weight || Math.floor(100 / (book.units.length + 1)),
          lessons: [],
        };
        
        if (editingComponent) {
          book.units = book.units.map(u => 
            u.id === editingComponent.id ? { ...newUnit, id: editingComponent.id } : u
          );
        } else {
          book.units.push(newUnit);
        }
      }
    } else if (componentType === 'lesson') {
      const grade = updatedProject.grades.find(g => 
        g.books.some(b => b.units.some(u => u.id === parentId))
      );
      const book = grade?.books.find(b => b.units.some(u => u.id === parentId));
      const unit = book?.units.find(u => u.id === parentId);
      if (unit) {
        const newLesson: Lesson = {
          id: Date.now().toString(),
          name: componentData.name,
          description: componentData.description,
          unitId: parentId,
          order: unit.lessons.length + 1,
          weight: componentData.weight || Math.floor(100 / (unit.lessons.length + 1)),
        };
        
        if (editingComponent) {
          unit.lessons = unit.lessons.map(l => 
            l.id === editingComponent.id ? { ...newLesson, id: editingComponent.id } : l
          );
        } else {
          unit.lessons.push(newLesson);
        }
      }
    }

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    setIsModalOpen(false);
    setEditingComponent(null);
  };

  const handleDeleteComponent = (type: 'grade' | 'book' | 'unit' | 'lesson', id: string) => {
    const updatedProject = { ...project };
    
    if (type === 'grade') {
      updatedProject.grades = updatedProject.grades?.filter(g => g.id !== id) || [];
    } else if (type === 'book') {
      updatedProject.grades?.forEach(grade => {
        grade.books = grade.books.filter(b => b.id !== id);
      });
    } else if (type === 'unit') {
      updatedProject.grades?.forEach(grade => {
        grade.books.forEach(book => {
          book.units = book.units.filter(u => u.id !== id);
        });
      });
    } else if (type === 'lesson') {
      updatedProject.grades?.forEach(grade => {
        grade.books.forEach(book => {
          book.units.forEach(unit => {
            unit.lessons = unit.lessons.filter(l => l.id !== id);
          });
        });
      });
    }

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  };

  const handleAutoDistributeWeights = (type: 'grade' | 'book' | 'unit' | 'lesson', parentId?: string) => {
    const updatedProject = { ...project };
    
    if (type === 'grade' && updatedProject.grades) {
      updatedProject.grades = distributeWeightsEvenly(updatedProject.grades);
    } else if (type === 'book' && parentId) {
      const grade = updatedProject.grades?.find(g => g.id === parentId);
      if (grade) {
        grade.books = distributeWeightsEvenly(grade.books);
      }
    } else if (type === 'unit' && parentId) {
      updatedProject.grades?.forEach(grade => {
        const book = grade.books.find(b => b.id === parentId);
        if (book) {
          book.units = distributeWeightsEvenly(book.units);
        }
      });
    } else if (type === 'lesson' && parentId) {
      updatedProject.grades?.forEach(grade => {
        grade.books.forEach(book => {
          const unit = book.units.find(u => u.id === parentId);
          if (unit) {
            unit.lessons = distributeWeightsEvenly(unit.lessons);
          }
        });
      });
    }

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  };

  const openCreateModal = (type: 'grade' | 'book' | 'unit' | 'lesson', parent?: string) => {
    setComponentType(type);
    setParentId(parent || '');
    setEditingComponent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'grade' | 'book' | 'unit' | 'lesson', component: any, parent?: string) => {
    setComponentType(type);
    setParentId(parent || '');
    setEditingComponent(component);
    setIsModalOpen(true);
  };

  const getComponentIcon = (type: 'grade' | 'book' | 'unit' | 'lesson') => {
    switch (type) {
      case 'grade': return <GraduationCap className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'unit': return <Layers className="w-4 h-4" />;
      case 'lesson': return <FileText className="w-4 h-4" />;
    }
  };

  const getComponentColor = (type: 'grade' | 'book' | 'unit' | 'lesson') => {
    switch (type) {
      case 'grade': return 'bg-purple-500';
      case 'book': return 'bg-blue-500';
      case 'unit': return 'bg-green-500';
      case 'lesson': return 'bg-orange-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Project
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Components</h1>
            <p className="text-gray-600">{project.name} - Manage grades, books, units, and lessons</p>
          </div>
        </div>
        <Button 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => openCreateModal('grade')}
        >
          Add Grade
        </Button>
      </div>

      {/* Project Structure */}
      <div className="space-y-4">
        {project.grades && project.grades.length > 0 ? (
          project.grades.map((grade) => (
            <Card key={grade.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleExpanded('grade', grade.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedGrades.has(grade.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className={`w-10 h-10 ${getComponentColor('grade')} rounded-full flex items-center justify-center text-white`}>
                      {getComponentIcon('grade')}
                    </div>
                    <div>
                      <CardTitle className="flex items-center">
                        {grade.name}
                        <Badge variant="secondary" size="sm" className="ml-2">
                          {grade.weight}% weight
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">{grade.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!validateWeights(grade.books) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoDistributeWeights('book', grade.id)}
                        title="Auto-distribute weights"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                        Fix Weights
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCreateModal('book', grade.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Book
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal('grade', grade)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComponent('grade', grade.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedGrades.has(grade.id) && (
                <CardContent className="pt-0">
                  <div className="space-y-3 ml-8">
                    {grade.books.map((book) => (
                      <div key={book.id} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleExpanded('book', book.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {expandedBooks.has(book.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div className={`w-8 h-8 ${getComponentColor('book')} rounded-full flex items-center justify-center text-white`}>
                              {getComponentIcon('book')}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center">
                                {book.name}
                                <Badge variant="secondary" size="sm" className="ml-2">
                                  {book.weight}%
                                </Badge>
                                <Badge variant="outline" size="sm" className="ml-1">
                                  {book.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{book.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!validateWeights(book.units) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoDistributeWeights('unit', book.id)}
                                title="Auto-distribute weights"
                              >
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCreateModal('unit', book.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal('book', book, grade.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComponent('book', book.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedBooks.has(book.id) && (
                          <div className="space-y-2 ml-6 mt-3">
                            {book.units.map((unit) => (
                              <div key={unit.id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => toggleExpanded('unit', unit.id)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      {expandedUnits.has(unit.id) ? (
                                        <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3" />
                                      )}
                                    </button>
                                    <div className={`w-6 h-6 ${getComponentColor('unit')} rounded-full flex items-center justify-center text-white`}>
                                      {getComponentIcon('unit')}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 flex items-center text-sm">
                                        {unit.name}
                                        <Badge variant="secondary" size="sm" className="ml-2">
                                          {unit.weight}%
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600">{unit.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {!validateWeights(unit.lessons) && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAutoDistributeWeights('lesson', unit.id)}
                                        title="Auto-distribute weights"
                                        className="h-6 w-6 p-0"
                                      >
                                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openCreateModal('lesson', unit.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditModal('unit', unit, book.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComponent('unit', unit.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>

                                {expandedUnits.has(unit.id) && (
                                  <div className="space-y-1 ml-4 mt-2">
                                    {unit.lessons.map((lesson) => (
                                      <div key={lesson.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                        <div className="flex items-center space-x-2">
                                          <div className={`w-5 h-5 ${getComponentColor('lesson')} rounded-full flex items-center justify-center text-white`}>
                                            {getComponentIcon('lesson')}
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900 flex items-center">
                                              {lesson.name}
                                              <Badge variant="secondary" size="sm" className="ml-2">
                                                {lesson.weight}%
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600">{lesson.description}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal('lesson', lesson, unit.id)}
                                            className="h-5 w-5 p-0"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComponent('lesson', lesson.id)}
                                            className="h-5 w-5 p-0"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grades defined yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first grade level for this project.</p>
              <Button 
                icon={<Plus className="w-4 h-4" />}
                onClick={() => openCreateModal('grade')}
              >
                Create First Grade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weight Validation Summary */}
      {project.grades && project.grades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Weight Distribution Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Grade Level Weights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Grade Level Weights</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Total: {project.grades.reduce((sum, g) => sum + g.weight, 0)}%
                    </span>
                    {!validateWeights(project.grades) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAutoDistributeWeights('grade')}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                        Auto-fix
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {project.grades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{grade.name}</span>
                      <Badge variant={validateWeights([grade]) ? 'success' : 'warning'} size="sm">
                        {grade.weight}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Modal */}
      <ComponentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingComponent(null);
        }}
        onSubmit={handleCreateComponent}
        componentType={componentType}
        editingComponent={editingComponent}
      />
    </div>
  );
}

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  componentType: 'grade' | 'book' | 'unit' | 'lesson';
  editingComponent?: any;
}

function ComponentModal({ isOpen, onClose, onSubmit, componentType, editingComponent }: ComponentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 0,
    type: 'student', // For books
  });

  React.useEffect(() => {
    if (editingComponent) {
      setFormData({
        name: editingComponent.name || '',
        description: editingComponent.description || '',
        weight: editingComponent.weight || 0,
        type: editingComponent.type || 'student',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        weight: 0,
        type: 'student',
      });
    }
  }, [editingComponent, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      description: '',
      weight: 0,
      type: 'student',
    });
  };

  const getModalTitle = () => {
    const action = editingComponent ? 'Edit' : 'Create';
    const type = componentType.charAt(0).toUpperCase() + componentType.slice(1);
    return `${action} ${type}`;
  };

  const getComponentIcon = () => {
    switch (componentType) {
      case 'grade': return <GraduationCap className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'unit': return <Layers className="w-5 h-5" />;
      case 'lesson': return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {getComponentIcon()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {componentType.charAt(0).toUpperCase() + componentType.slice(1)} Information
            </h4>
            <p className="text-sm text-gray-600">
              Define the structure and weighting for this {componentType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${componentType} name`}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={`Describe this ${componentType}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
            />
          </div>

          {componentType === 'book' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Student Book</option>
                <option value="teacher">Teacher Guide</option>
                <option value="practice">Practice Book</option>
                <option value="digital">Digital Resource</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Weight Guidelines</h4>
          <p className="text-sm text-blue-700">
            The weight represents the percentage contribution of this {componentType} to its parent component. 
            All {componentType}s at the same level should sum to 100%.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingComponent ? 'Update' : 'Create'} {componentType.charAt(0).toUpperCase() + componentType.slice(1)}
          </Button>
        </div>
      </form>
    </Modal>
  );
}