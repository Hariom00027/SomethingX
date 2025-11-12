import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { GraduationCap, ArrowRight, Loader2, AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import axios from 'axios';

const EducationSelection = () => {
  const { industryName } = useParams();
  const [educationPaths, setEducationPaths] = useState([]);
  const [filteredEducationPaths, setFilteredEducationPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Reset error and loading when industryName changes
    setError(null);
    setLoading(true);

    axios.get(`http://localhost:8080/api/blueprint/industry/${industryName}/education`)
      .then(response => {
        setEducationPaths(response.data);
        setFilteredEducationPaths(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching education paths. Please try again later.');
        setLoading(false);
        console.error('Error fetching education paths:', error);
      });
  }, [industryName]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEducationPaths(educationPaths);
    } else {
      const filtered = educationPaths.filter(edu =>
        edu.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEducationPaths(filtered);
    }
  }, [searchQuery, educationPaths]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading education paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Education Paths</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (educationPaths.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Education Paths Available</h2>
          <p className="text-gray-600 mb-4">No education paths found for {industryName}.</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Select an Education Path
          </h1>
          <p className="text-gray-600 text-lg">
            Choose an education path for <span className="font-semibold text-gray-800">{industryName}</span> industry
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search education paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
            />
          </div>
        </div>

        {/* Education Paths Grid */}
        {filteredEducationPaths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No education paths found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredEducationPaths.map(edu => (
            <Link 
              to={`/students/career-blueprint/education/${edu}`} 
              key={edu}
              className="group"
            >
              <Card className="cursor-pointer h-full border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{edu}</span>
                    <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Explore specializations and roles related to <span className="font-semibold text-gray-800">{edu}</span>.
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

export default EducationSelection;
