import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Briefcase, ArrowRight, Loader2, AlertCircle, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import axios from 'axios';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/blueprint/roles')
      .then(response => {
        setRoles(response.data);
        setFilteredRoles(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching role list. Please try again later.');
        setLoading(false);
        console.error('Error fetching roles:', error);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(role =>
        role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchQuery, roles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Roles</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No roles available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Select a Role
          </h1>
          <p className="text-gray-600 text-lg">Explore career paths and requirements for different job roles</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg border-2 border-gray-200 focus:border-green-500 rounded-lg"
            />
          </div>
        </div>

        {/* Roles Grid */}
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No roles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredRoles.map(role => (
              <Link 
                to={`/students/career-blueprint/role/${role}`} 
                key={role}
                className="group"
              >
                <Card className="cursor-pointer h-full border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors flex items-center justify-between">
                      <span>{role}</span>
                      <ArrowRight className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      View details and requirements for the <span className="font-semibold text-gray-800">{role}</span> role.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleList;


