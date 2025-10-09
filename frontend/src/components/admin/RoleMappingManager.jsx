import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';

const RoleMappingManager = () => {
  const [roles, setRoles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [educations, setEducations] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [roleMappings, setRoleMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, industriesRes, educationsRes, institutesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/blueprint/roles'),
        axios.get('http://localhost:8080/api/blueprint/industries'),
        axios.get('http://localhost:8080/api/blueprint/educations'),
        axios.get('http://localhost:8080/api/admin/blueprints/type/institute')
      ]);
      
      setRoles(rolesRes.data);
      setIndustries(industriesRes.data);
      setEducations(educationsRes.data);
      setInstitutes(institutesRes.data.map(inst => inst.name));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleMapRoleToIndustry = async () => {
    if (!selectedRole || !selectedIndustry) {
      setMessage('Please select both role and industry');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/blueprint/role/${selectedRole}/map-industry?industryName=${selectedIndustry}`);
      setMessage(`Successfully mapped ${selectedRole} to ${selectedIndustry}`);
      fetchRoleMappings();
    } catch (error) {
      setMessage('Error mapping role to industry');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapRoleToEducation = async () => {
    if (!selectedRole || !selectedEducation) {
      setMessage('Please select both role and education');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/blueprint/role/${selectedRole}/map-education?educationName=${selectedEducation}`);
      setMessage(`Successfully mapped ${selectedRole} to ${selectedEducation}`);
      fetchRoleMappings();
    } catch (error) {
      setMessage('Error mapping role to education');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapIndustryToInstitute = async () => {
    if (!selectedIndustry || !selectedInstitute) {
      setMessage('Please select both industry and institute');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/blueprint/industry/${selectedIndustry}/map-institute?instituteName=${selectedInstitute}`);
      setMessage(`Successfully mapped ${selectedIndustry} to ${selectedInstitute}`);
    } catch (error) {
      setMessage('Error mapping industry to institute');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleMappings = async () => {
    if (!selectedRole) return;

    try {
      const response = await axios.get(`http://localhost:8080/api/blueprint/role/${selectedRole}/mappings`);
      setRoleMappings(response.data);
    } catch (error) {
      console.error('Error fetching role mappings:', error);
    }
  };

  useEffect(() => {
    fetchRoleMappings();
  }, [selectedRole]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Mapping Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {/* Role to Industry Mapping */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Map Role to Industry</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleMapRoleToIndustry} disabled={loading}>
              {loading ? 'Mapping...' : 'Map Role to Industry'}
            </Button>
          </div>

          {/* Role to Education Mapping */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Map Role to Education</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Education</label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose an education</option>
                  {educations.map(education => (
                    <option key={education} value={education}>{education}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleMapRoleToEducation} disabled={loading}>
              {loading ? 'Mapping...' : 'Map Role to Education'}
            </Button>
          </div>

          {/* Industry to Institute Mapping */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Map Industry to Institute</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Institute</label>
                <select
                  value={selectedInstitute}
                  onChange={(e) => setSelectedInstitute(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose an institute</option>
                  {institutes.map(institute => (
                    <option key={institute} value={institute}>{institute}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleMapIndustryToInstitute} disabled={loading}>
              {loading ? 'Mapping...' : 'Map Industry to Institute'}
            </Button>
          </div>

          {/* Current Mappings Display */}
          {selectedRole && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Current Mappings for {selectedRole}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Mapped Industries:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {roleMappings.industries?.map(industry => (
                      <li key={industry}>{industry}</li>
                    )) || <li className="text-gray-500">No industries mapped</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Mapped Educations:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {roleMappings.educations?.map(education => (
                      <li key={education}>{education}</li>
                    )) || <li className="text-gray-500">No educations mapped</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleMappingManager;
