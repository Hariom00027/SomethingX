import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import RoleMappingManager from '../components/admin/RoleMappingManager';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null); // null, 'blueprint', 'resume-sections', or 'resume-review'
  const [blueprints, setBlueprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMappingManager, setShowMappingManager] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'role',
    description: '',
    category: '',
    skillRequirements: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Section Templates state
  const [sectionTemplates, setSectionTemplates] = useState([]);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSectionTemplate, setEditingSectionTemplate] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    contentType: 'text',
    content: '',
    items: [],
    icon: '📄',
    color: 'bg-gray-100 hover:bg-gray-200',
    isActive: true
  });

  useEffect(() => {
    if (activeSection === 'blueprint') {
      fetchBlueprints();
    } else if (activeSection === 'resume-sections') {
      fetchSectionTemplates();
    }
  }, [activeSection]);

  const fetchBlueprints = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/blueprints');
      setBlueprints(response.data);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkillRequirement = () => {
    setFormData(prev => ({
      ...prev,
      skillRequirements: [...prev.skillRequirements, {
        skillName: '',
        skillType: 'technical',
        timeRequiredMonths: 1,
        difficulty: 'beginner',
        description: '',
        prerequisites: []
      }]
    }));
  };

  const updateSkillRequirement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skillRequirements: prev.skillRequirements.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkillRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      skillRequirements: prev.skillRequirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBlueprint) {
        await axios.put(`http://localhost:8080/api/admin/blueprints/${editingBlueprint.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/admin/blueprints', formData);
      }
      
      setShowForm(false);
      setEditingBlueprint(null);
      setFormData({
        name: '',
        type: 'role',
        description: '',
        category: '',
        skillRequirements: []
      });
      fetchBlueprints();
    } catch (error) {
      console.error('Error saving blueprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blueprint) => {
    setEditingBlueprint(blueprint);
    setFormData({
      name: blueprint.name || '',
      type: blueprint.type || 'role',
      description: blueprint.description || '',
      category: blueprint.category || '',
      skillRequirements: blueprint.skillRequirements || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blueprint?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/blueprints/${id}`);
        fetchBlueprints();
      } catch (error) {
        console.error('Error deleting blueprint:', error);
      }
    }
  };

  const toggleActive = async (blueprint) => {
    try {
      const updatedBlueprint = { ...blueprint, isActive: !blueprint.isActive };
      await axios.put(`http://localhost:8080/api/admin/blueprints/${blueprint.id}`, updatedBlueprint);
      fetchBlueprints();
    } catch (error) {
      console.error('Error updating blueprint:', error);
    }
  };

  // Section Templates functions
  const fetchSectionTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/section-templates/all');
      setSectionTemplates(response.data);
    } catch (error) {
      console.error('Error fetching section templates:', error);
    }
  };

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSectionItem = () => {
    setSectionFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), '']
    }));
  };

  const updateSectionItem = (index, value) => {
    setSectionFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeSectionItem = (index) => {
    setSectionFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSectionTemplate) {
        await axios.put(`http://localhost:8080/api/admin/section-templates/${editingSectionTemplate.id}`, sectionFormData);
      } else {
        await axios.post('http://localhost:8080/api/admin/section-templates', sectionFormData);
      }
      
      setShowSectionForm(false);
      setEditingSectionTemplate(null);
      setSectionFormData({
        title: '',
        contentType: 'text',
        content: '',
        items: [],
        icon: '📄',
        color: 'bg-gray-100 hover:bg-gray-200',
        isActive: true
      });
      fetchSectionTemplates();
    } catch (error) {
      console.error('Error saving section template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionEdit = (template) => {
    setEditingSectionTemplate(template);
    setSectionFormData({
      title: template.title || '',
      contentType: template.contentType || 'text',
      content: template.content || '',
      items: template.items || [],
      icon: template.icon || '📄',
      color: template.color || 'bg-gray-100 hover:bg-gray-200',
      isActive: template.isActive !== undefined ? template.isActive : true
    });
    setShowSectionForm(true);
  };

  const handleSectionDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section template?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/section-templates/${id}`);
        fetchSectionTemplates();
      } catch (error) {
        console.error('Error deleting section template:', error);
      }
    }
  };

  const toggleSectionActive = async (template) => {
    try {
      const updatedTemplate = { ...template, isActive: !template.isActive };
      await axios.put(`http://localhost:8080/api/admin/section-templates/${template.id}`, updatedTemplate);
      fetchSectionTemplates();
    } catch (error) {
      console.error('Error updating section template:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Section Selection Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setActiveSection('blueprint')}
          variant={activeSection === 'blueprint' ? 'default' : 'outline'}
          className="text-lg px-6 py-3"
        >
          Blueprint Settings
        </Button>
        <Button
          onClick={() => setActiveSection('resume-sections')}
          variant={activeSection === 'resume-sections' ? 'default' : 'outline'}
          className="text-lg px-6 py-3"
        >
          Resume Sections
        </Button>
        <Button
          onClick={() => navigate('/admin/resume-review')}
          variant={activeSection === 'resume-review' ? 'default' : 'outline'}
          className="text-lg px-6 py-3"
        >
          Resume Review
        </Button>
      </div>

      {activeSection === 'blueprint' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Blueprint Management</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowMappingManager(true)} variant="outline">
                Manage Mappings
              </Button>
              <Button onClick={() => setShowForm(true)}>
                Create New Blueprint
              </Button>
            </div>
          </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingBlueprint ? 'Edit Blueprint' : 'Create New Blueprint'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="role">Role</option>
                    <option value="industry">Industry</option>
                    <option value="education">Education</option>
                    <option value="specialization">Specialization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Skill Requirements</label>
                  <Button type="button" onClick={addSkillRequirement} variant="outline">
                    Add Skill
                  </Button>
                </div>
                
                {formData.skillRequirements.map((skill, index) => (
                  <div key={index} className="border p-4 rounded-md mb-2">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Skill Name"
                        value={skill.skillName}
                        onChange={(e) => updateSkillRequirement(index, 'skillName', e.target.value)}
                      />
                      <select
                        value={skill.skillType}
                        onChange={(e) => updateSkillRequirement(index, 'skillType', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md"
                      >
                        <option value="technical">Technical</option>
                        <option value="soft">Soft</option>
                        <option value="certification">Certification</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        type="number"
                        placeholder="Time (months)"
                        value={skill.timeRequiredMonths}
                        onChange={(e) => updateSkillRequirement(index, 'timeRequiredMonths', parseInt(e.target.value))}
                        min="1"
                      />
                      <select
                        value={skill.difficulty}
                        onChange={(e) => updateSkillRequirement(index, 'difficulty', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <Button
                        type="button"
                        onClick={() => removeSkillRequirement(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <Textarea
                      placeholder="Skill Description"
                      value={skill.description}
                      onChange={(e) => updateSkillRequirement(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingBlueprint ? 'Update' : 'Create')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingBlueprint(null);
                  setFormData({
                    name: '',
                    type: 'role',
                    description: '',
                    category: '',
                    skillRequirements: []
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showMappingManager && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Role Mapping Management</h2>
            <Button onClick={() => setShowMappingManager(false)} variant="outline">
              Close
            </Button>
          </div>
          <RoleMappingManager />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blueprints.map((blueprint) => (
          <Card key={blueprint.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {blueprint.name}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  blueprint.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {blueprint.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{blueprint.description}</p>
              <p className="text-xs text-gray-500 mb-2">Type: {blueprint.type}</p>
              <p className="text-xs text-gray-500 mb-4">Category: {blueprint.category}</p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleEdit(blueprint)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => toggleActive(blueprint)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {blueprint.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  onClick={() => handleDelete(blueprint.id)}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </>
      )}

      {activeSection === 'resume-sections' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Pre-made Resume Sections</h2>
            <Button onClick={() => setShowSectionForm(true)}>
              Create New Section
            </Button>
          </div>

          {showSectionForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingSectionTemplate ? 'Edit Section Template' : 'Create New Section Template'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        name="title"
                        value={sectionFormData.title}
                        onChange={handleSectionInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Content Type</label>
                      <select
                        name="contentType"
                        value={sectionFormData.contentType}
                        onChange={handleSectionInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="text">Text</option>
                        <option value="list">List</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                      <Input
                        name="icon"
                        value={sectionFormData.icon}
                        onChange={handleSectionInputChange}
                        placeholder="📄"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color Class</label>
                      <Input
                        name="color"
                        value={sectionFormData.color}
                        onChange={handleSectionInputChange}
                        placeholder="bg-gray-100 hover:bg-gray-200"
                      />
                    </div>
                  </div>

                  {sectionFormData.contentType === 'text' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <Textarea
                        name="content"
                        value={sectionFormData.content}
                        onChange={handleSectionInputChange}
                        rows={4}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">List Items</label>
                        <Button type="button" onClick={addSectionItem} variant="outline">
                          Add Item
                        </Button>
                      </div>
                      {sectionFormData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={item}
                            onChange={(e) => updateSectionItem(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                          />
                          <Button
                            type="button"
                            onClick={() => removeSectionItem(index)}
                            variant="destructive"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={sectionFormData.isActive}
                      onChange={(e) => setSectionFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (editingSectionTemplate ? 'Update' : 'Create')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowSectionForm(false);
                      setEditingSectionTemplate(null);
                      setSectionFormData({
                        title: '',
                        contentType: 'text',
                        content: '',
                        items: [],
                        icon: '📄',
                        color: 'bg-gray-100 hover:bg-gray-200',
                        isActive: true
                      });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectionTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span>{template.icon}</span>
                      {template.title}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500 mb-2">Type: {template.contentType}</p>
                  {template.contentType === 'text' ? (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.content}</p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-4">{template.items?.length || 0} items</p>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSectionEdit(template)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => toggleSectionActive(template)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {template.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleSectionDelete(template.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
