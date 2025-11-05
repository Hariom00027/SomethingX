import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import RoleMappingManager from '../components/admin/RoleMappingManager';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('blueprint'); // 'blueprint' or 'resume-review'
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

  useEffect(() => {
    if (activeSection === 'blueprint') {
      fetchBlueprints();
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
    </div>
  );
};

export default AdminDashboard;
