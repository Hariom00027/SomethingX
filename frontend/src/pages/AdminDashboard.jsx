import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import RoleMappingManager from '../components/admin/RoleMappingManager';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';

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
  
  // Mapping state - show mapping options after creation
  const [showMappingSection, setShowMappingSection] = useState(false);
  const [createdBlueprint, setCreatedBlueprint] = useState(null);
  const [mappingOptions, setMappingOptions] = useState({
    industries: [],
    educations: [],
    specializations: []
  });
  const [mappingSelections, setMappingSelections] = useState({
    industry: '',
    education: '',
    specialization: ''
  });
  const [educationSpecializations, setEducationSpecializations] = useState([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingMessage, setMappingMessage] = useState('');

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
      fetchMappingOptions();
    } else if (activeSection === 'resume-sections') {
      fetchSectionTemplates();
    }
  }, [activeSection]);
  
  // Fetch options for mapping
  const fetchMappingOptions = async () => {
    try {
      const [industriesRes, educationsRes, specializationsRes] = await Promise.all([
        apiClient.get('/blueprint/industries').catch(() => ({ data: [] })),
        apiClient.get('/blueprint/educations').catch(() => ({ data: [] })),
        apiClient.get('/blueprint/specializations').catch(() => ({ data: [] }))
      ]);
      setMappingOptions({
        industries: industriesRes.data || [],
        educations: educationsRes.data || [],
        specializations: specializationsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching mapping options:', error);
    }
  };

  const fetchBlueprints = async () => {
    try {
      const response = await apiClient.get('/admin/blueprints');
      setBlueprints(response.data);
    } catch (error) {
      console.error('Error fetching blueprints:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      // If type changes and it's not 'role', clear skill requirements
      if (name === 'type' && value !== 'role') {
        updated.skillRequirements = [];
      }
      return updated;
    });
  };

  const addSkillRequirement = () => {
    setFormData(prev => ({
      ...prev,
      skillRequirements: [...prev.skillRequirements, {
        skillName: '',
        skillType: 'technical',
        timeRequiredMonths: 1,
        difficulty: 'beginner',
        importance: 'Essential',
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
    setMappingMessage('');

    try {
      let response;
      if (editingBlueprint) {
        response = await apiClient.put(`/admin/blueprints/${editingBlueprint.id}`, formData);
        setShowForm(false);
        setEditingBlueprint(null);
        setShowMappingSection(false);
      } else {
        response = await apiClient.post('/admin/blueprints', formData);
        // After creation, show mapping section
        // Use response.data to ensure we have the exact blueprint as stored in backend
        const created = response.data || formData;
        setCreatedBlueprint({
          id: created.id || created.name,
          name: created.name || formData.name,
          type: created.type || formData.type,
          description: created.description || formData.description,
          category: created.category || formData.category,
          skillRequirements: created.skillRequirements || formData.skillRequirements
        });
        setShowMappingSection(true);
        // Keep form open but show mapping section
      }
      
      // Reset form only if editing
      if (editingBlueprint) {
        setFormData({
          name: '',
          type: 'role',
          description: '',
          category: '',
          skillRequirements: []
        });
      }
      fetchBlueprints();
      fetchMappingOptions(); // Refresh mapping options
    } catch (error) {
      console.error('Error saving blueprint:', error);
      setMappingMessage('Error saving blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle mapping operations
  const handleMapToEducation = async () => {
    if (!createdBlueprint || !mappingSelections.education) {
      setMappingMessage('Please select an education');
      return;
    }
    
    setMappingLoading(true);
    setMappingMessage('');
    
    try {
      const blueprintName = createdBlueprint.name;
      if (!blueprintName) {
        setMappingMessage('Error: Blueprint name is missing');
        return;
      }
      
      // Construct endpoint based on blueprint type
      let endpoint;
      if (createdBlueprint.type === 'role') {
        endpoint = `/blueprint/role/${encodeURIComponent(blueprintName)}/map-education?educationName=${encodeURIComponent(mappingSelections.education)}`;
      } else if (createdBlueprint.type === 'industry') {
        endpoint = `/blueprint/industry/${encodeURIComponent(blueprintName)}/map-education?educationName=${encodeURIComponent(mappingSelections.education)}`;
      } else if (createdBlueprint.type === 'specialization') {
        endpoint = `/blueprint/specialization/${encodeURIComponent(blueprintName)}/map-education?educationName=${encodeURIComponent(mappingSelections.education)}`;
      } else {
        setMappingMessage(`Error: Unsupported blueprint type: ${createdBlueprint.type}`);
        return;
      }
      
      await apiClient.post(endpoint);
      setMappingMessage(`Successfully mapped ${blueprintName} to ${mappingSelections.education}`);
      setMappingSelections(prev => ({ ...prev, education: '' }));
      fetchMappingOptions();
      fetchBlueprints(); // Refresh blueprint list to show updated mappings
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setMappingMessage(`Error mapping to education: ${errorMsg}`);
      console.error('Mapping error details:', error.response?.data || error);
    } finally {
      setMappingLoading(false);
    }
  };
  
  const handleMapToIndustry = async () => {
    if (!createdBlueprint || !mappingSelections.industry) {
      setMappingMessage('Please select an industry');
      return;
    }
    
    setMappingLoading(true);
    setMappingMessage('');
    
    try {
      const blueprintName = createdBlueprint.name;
      if (!blueprintName) {
        setMappingMessage('Error: Blueprint name is missing');
        return;
      }
      
      // For roles, map role to industry
      if (createdBlueprint.type === 'role') {
        await apiClient.post(`/blueprint/role/${encodeURIComponent(blueprintName)}/map-industry?industryName=${encodeURIComponent(mappingSelections.industry)}`);
        setMappingMessage(`Successfully mapped ${blueprintName} to ${mappingSelections.industry}`);
        setMappingSelections(prev => ({ ...prev, industry: '' }));
        fetchMappingOptions();
        fetchBlueprints(); // Refresh blueprint list to show updated mappings
      } else if (createdBlueprint.type === 'industry') {
        // Industry to industry mapping doesn't exist, skip
        setMappingMessage('Industry to industry mapping is not available');
      } else {
        setMappingMessage(`Error: Cannot map ${createdBlueprint.type} to industry`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setMappingMessage(`Error mapping to industry: ${errorMsg}`);
      console.error('Mapping error details:', error.response?.data || error);
    } finally {
      setMappingLoading(false);
    }
  };
  
  const handleMapToSpecialization = async () => {
    if (!createdBlueprint || !mappingSelections.specialization) {
      setMappingMessage('Please select a specialization');
      return;
    }
    
    setMappingLoading(true);
    setMappingMessage('');
    
    try {
      const blueprintName = createdBlueprint.name;
      if (!blueprintName) {
        setMappingMessage('Error: Blueprint name is missing');
        return;
      }
      
      if (createdBlueprint.type === 'role') {
        await apiClient.post(`/blueprint/role/${encodeURIComponent(blueprintName)}/map-specialization?specializationName=${encodeURIComponent(mappingSelections.specialization)}`);
        setMappingMessage(`Successfully mapped ${blueprintName} to ${mappingSelections.specialization}`);
        setMappingSelections(prev => ({ ...prev, specialization: '' }));
        fetchMappingOptions();
        fetchBlueprints(); // Refresh blueprint list to show updated mappings
      } else if (createdBlueprint.type === 'specialization') {
        // Specialization to education mapping
        if (!mappingSelections.education) {
          setMappingMessage('Please select an education first');
          return;
        }
        await apiClient.post(`/blueprint/specialization/${encodeURIComponent(blueprintName)}/map-education?educationName=${encodeURIComponent(mappingSelections.education)}`);
        setMappingMessage(`Successfully mapped ${blueprintName} to ${mappingSelections.education}`);
        setMappingSelections(prev => ({ ...prev, education: '', specialization: '' }));
        fetchMappingOptions();
        fetchBlueprints(); // Refresh blueprint list to show updated mappings
      } else {
        setMappingMessage(`Error: Cannot map ${createdBlueprint.type} to specialization`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setMappingMessage(`Error mapping to specialization: ${errorMsg}`);
      console.error('Mapping error details:', error.response?.data || error);
    } finally {
      setMappingLoading(false);
    }
  };
  
  const closeMappingAndReset = () => {
    setShowMappingSection(false);
    setCreatedBlueprint(null);
    setMappingSelections({ industry: '', education: '', specialization: '' });
    setEducationSpecializations([]);
    setMappingMessage('');
    setFormData({
      name: '',
      type: 'role',
      description: '',
      category: '',
      skillRequirements: []
    });
    setShowForm(false);
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
        await apiClient.delete(`/admin/blueprints/${id}`);
        fetchBlueprints();
      } catch (error) {
        console.error('Error deleting blueprint:', error);
      }
    }
  };

  const toggleActive = async (blueprint) => {
    try {
      const updatedBlueprint = { ...blueprint, isActive: !blueprint.isActive };
      await apiClient.put(`/admin/blueprints/${blueprint.id}`, updatedBlueprint);
      fetchBlueprints();
    } catch (error) {
      console.error('Error updating blueprint:', error);
    }
  };

  // Section Templates functions
  const fetchSectionTemplates = async () => {
    try {
      const response = await apiClient.get('/admin/section-templates/all');
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
        await apiClient.put(`/admin/section-templates/${editingSectionTemplate.id}`, sectionFormData);
      } else {
        await apiClient.post('/admin/section-templates', sectionFormData);
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
        await apiClient.delete(`/admin/section-templates/${id}`);
        fetchSectionTemplates();
      } catch (error) {
        console.error('Error deleting section template:', error);
      }
    }
  };

  const toggleSectionActive = async (template) => {
    try {
      const updatedTemplate = { ...template, isActive: !template.isActive };
      await apiClient.put(`/admin/section-templates/${template.id}`, updatedTemplate);
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
        <Button
          onClick={() => navigate('/admin/industry-training')}
          variant="outline"
          className="text-lg px-6 py-3"
        >
          Industry Training
        </Button>
        <Button
          onClick={() => navigate('/admin/expert-management')}
          variant={activeSection === 'expert-management' ? 'default' : 'outline'}
          className="text-lg px-6 py-3"
        >
          Expert Management
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
            <p className="text-sm text-gray-500 mt-2">
              {formData.type === 'role' && 'Roles define specific job positions with skill requirements.'}
              {formData.type === 'industry' && 'Industries represent business sectors or domains.'}
              {formData.type === 'education' && 'Education types represent academic qualifications.'}
              {formData.type === 'specialization' && 'Specializations are focused areas within education programs.'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.type === 'role' ? 'Role Name' : 
                     formData.type === 'industry' ? 'Industry Name' :
                     formData.type === 'education' ? 'Education Name' :
                     'Specialization Name'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={`Enter ${formData.type} name`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type <span className="text-red-500">*</span></label>
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
                  placeholder={`Describe this ${formData.type}...`}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category (Optional)</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Healthcare, etc."
                />
              </div>

              {/* Skill Requirements - Only for Roles */}
              {formData.type === 'role' && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium">Skill Requirements</label>
                    <p className="text-xs text-gray-500">Define the skills needed for this role</p>
                  </div>
                  <Button type="button" onClick={addSkillRequirement} variant="outline" size="sm">
                    + Add Skill
                  </Button>
                </div>
                
                {formData.skillRequirements.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-500 text-sm mb-2">No skills added yet</p>
                    <Button type="button" onClick={addSkillRequirement} variant="outline" size="sm">
                      Add First Skill
                    </Button>
                  </div>
                ) : (
                  formData.skillRequirements.map((skill, index) => (
                    <div key={index} className="border p-4 rounded-md mb-2 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Skill #{index + 1}</span>
                        <Button
                          type="button"
                          onClick={() => removeSkillRequirement(index)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <Input
                          placeholder="Skill Name *"
                          value={skill.skillName}
                          onChange={(e) => updateSkillRequirement(index, 'skillName', e.target.value)}
                          required
                        />
                        <select
                          value={skill.skillType}
                          onChange={(e) => updateSkillRequirement(index, 'skillType', e.target.value)}
                          className="p-2 border border-gray-300 rounded-md"
                        >
                          <option value="technical">Technical</option>
                          <option value="non-technical">Non-Technical</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Time (months)</label>
                          <Input
                            type="number"
                            placeholder="Months"
                            value={skill.timeRequiredMonths}
                            onChange={(e) => updateSkillRequirement(index, 'timeRequiredMonths', parseInt(e.target.value) || 1)}
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
                          <select
                            value={skill.difficulty}
                            onChange={(e) => updateSkillRequirement(index, 'difficulty', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Importance</label>
                          <select
                            value={skill.importance || 'Essential'}
                            onChange={(e) => updateSkillRequirement(index, 'importance', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Essential">Essential (P1)</option>
                            <option value="Important">Important (P2)</option>
                            <option value="Good to be">Good to be (P3)</option>
                          </select>
                        </div>
                        <div className="md:col-span-1"></div>
                      </div>
                      
                      <Textarea
                        placeholder="Skill Description (Optional)"
                        value={skill.description}
                        onChange={(e) => updateSkillRequirement(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))
                )}
              </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingBlueprint ? 'Update Blueprint' : 'Create Blueprint')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingBlueprint(null);
                  setShowMappingSection(false);
                  setCreatedBlueprint(null);
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

      {/* Mapping Section - Show after successful creation */}
      {showMappingSection && createdBlueprint && !editingBlueprint && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Map {createdBlueprint.name} to Related Entities</span>
              <Button variant="ghost" size="sm" onClick={closeMappingAndReset}>
                ✕
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Connect this {createdBlueprint.type} to other blueprints to create relationships.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {mappingMessage && (
              <div className={`p-3 rounded-md ${
                mappingMessage.includes('Error') || mappingMessage.includes('Please') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {mappingMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Map to Education */}
              {(createdBlueprint.type === 'role' || createdBlueprint.type === 'industry' || createdBlueprint.type === 'specialization') && (
                <div className="border p-4 rounded-lg bg-white">
                  <h3 className="font-semibold mb-2 text-sm">Map to Education</h3>
                  <select
                    value={mappingSelections.education}
                    onChange={async (e) => {
                      const education = e.target.value;
                      setMappingSelections(prev => ({ ...prev, education, specialization: '' }));
                      // Fetch specializations for this education
                      if (education) {
                        try {
                          const response = await apiClient.get(`/blueprint/education/${education}/specializations`);
                          setEducationSpecializations(response.data || []);
                        } catch (error) {
                          setEducationSpecializations([]);
                        }
                      } else {
                        setEducationSpecializations([]);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                  >
                    <option value="">Select Education</option>
                    {mappingOptions.educations.map(edu => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={handleMapToEducation} 
                    disabled={mappingLoading || !mappingSelections.education}
                    size="sm"
                    className="w-full"
                  >
                    Map to Education
                  </Button>
                </div>
              )}

              {/* Map to Industry - Only for Roles */}
              {createdBlueprint.type === 'role' && (
                <div className="border p-4 rounded-lg bg-white">
                  <h3 className="font-semibold mb-2 text-sm">Map to Industry</h3>
                  <select
                    value={mappingSelections.industry}
                    onChange={(e) => setMappingSelections(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                  >
                    <option value="">Select Industry</option>
                    {mappingOptions.industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={handleMapToIndustry} 
                    disabled={mappingLoading || !mappingSelections.industry}
                    size="sm"
                    className="w-full"
                  >
                    Map to Industry
                  </Button>
                </div>
              )}

              {/* Map to Specialization - Only after selecting education */}
              {(createdBlueprint.type === 'role' || createdBlueprint.type === 'specialization') && mappingSelections.education && (
                <div className="border p-4 rounded-lg bg-white">
                  <h3 className="font-semibold mb-2 text-sm">Map to Specialization</h3>
                  <select
                    value={mappingSelections.specialization}
                    onChange={(e) => setMappingSelections(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                  >
                    <option value="">Select Specialization</option>
                    {educationSpecializations.length > 0 ? (
                      educationSpecializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))
                    ) : (
                      <option value="" disabled>No specializations available</option>
                    )}
                  </select>
                  <Button 
                    onClick={handleMapToSpecialization} 
                    disabled={mappingLoading || !mappingSelections.specialization || educationSpecializations.length === 0}
                    size="sm"
                    className="w-full"
                  >
                    Map to Specialization
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={closeMappingAndReset}>
                Done
              </Button>
            </div>
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
