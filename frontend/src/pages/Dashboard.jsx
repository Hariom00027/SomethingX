import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReviewNotifications from '../components/notifications/ReviewNotifications';
import { BarChart3, Loader2 } from 'lucide-react';

const normalizePreparation = (prep) => {
  if (!prep) return null;
  const isActive = prep.isActive ?? prep.active ?? false;
  return { ...prep, isActive };
};

const Dashboard = () => {
  const { user } = useAuth();
  const [preparations, setPreparations] = useState([]);
  const [loadingPreparations, setLoadingPreparations] = useState(false);

  useEffect(() => {
    if (user?.userType === 'STUDENT' && user?.id) {
      setLoadingPreparations(true);
      axios.get(`http://localhost:8080/api/role-preparation/all?studentId=${user.id}`)
        .then(response => {
          const normalized = (response.data || []).map(normalizePreparation).filter(Boolean);
          const activePreparations = normalized.filter(p => p.isActive);
          setPreparations(activePreparations);
        })
        .catch(err => {
          console.error('Error fetching preparations:', err);
        })
        .finally(() => {
          setLoadingPreparations(false);
        });
    }
  }, [user?.id, user?.userType]);

  const getDashboardContent = () => {
    switch (user?.userType) {
      case 'STUDENT':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/students/career-blueprint" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Blueprint</h3>
              <p className="text-gray-600">Plan your career path and explore opportunities</p>
            </Link>
            
            <Link to="/students/resume-builder" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resume Builder</h3>
              <p className="text-gray-600">Create professional resumes with templates</p>
            </Link>
            
            <Link to="/students/apply-jobs" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply for Jobs</h3>
              <p className="text-gray-600">Browse and apply to job opportunities</p>
            </Link>
            
            <Link to="/students/courses" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Courses</h3>
              <p className="text-gray-600">Enroll in skill development courses</p>
            </Link>
            
            <Link to="/students/career-counselling" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Counselling</h3>
              <p className="text-gray-600">Get guidance from career experts</p>
            </Link>
            
            {preparations.length > 0 && (
              <Link 
                to={`/students/preparation-analytics/${encodeURIComponent(preparations[0].roleName)}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600">View your preparation progress and analytics</p>
                {preparations.length > 1 && (
                  <p className="text-sm text-blue-600 mt-2">{preparations.length} active preparations</p>
                )}
              </Link>
            )}
          </div>
        );
        
      case 'INSTITUTE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/institutes/internship-management" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Internship Management</h3>
              <p className="text-gray-600">Manage student internships and placements</p>
            </Link>

            <Link to="/institutes/student-training-role-ready" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Training (Role Ready)</h3>
              <p className="text-gray-600">Enroll batches of students into role-ready programs</p>
            </Link>
            
            <Link to="/institutes/expert-sessions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Sessions</h3>
              <p className="text-gray-600">Organize expert talks and workshops</p>
            </Link>
            
            <Link to="/institutes/workshops" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Workshops</h3>
              <p className="text-gray-600">Conduct skill development workshops</p>
            </Link>
          </div>
        );
        
      case 'INDUSTRY':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/industry/post-jobs" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Post Jobs</h3>
              <p className="text-gray-600">Create and manage job postings</p>
            </Link>
            
            <Link to="/industry/resume-access" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resume Access</h3>
              <p className="text-gray-600">Browse student resumes and profiles</p>
            </Link>
            
            <Link to="/industry/role-ready-freshers" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Role Ready Freshers</h3>
              <p className="text-gray-600">Secure day-one ready cohorts or request bespoke programs</p>
            </Link>

            <Link to="/industry/ai-interview" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Interview</h3>
              <p className="text-gray-600">Conduct AI-powered interviews</p>
            </Link>

            <Link to="/industry/expert-sessions" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Sessions</h3>
              <p className="text-gray-600">Book sessions with industry experts</p>
            </Link>
          </div>
        );
        
      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">Please complete your profile to access dashboard features.</p>
            <Link to="/profile" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Complete Profile
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="mt-2 text-gray-600">
              {user?.userType === 'STUDENT' && 'Explore your career development tools'}
              {user?.userType === 'INSTITUTE' && 'Manage your educational programs'}
              {user?.userType === 'INDUSTRY' && 'Connect with talented students'}
              {!user?.userType && 'Complete your profile to get started'}
            </p>
          </div>
          {user?.userType === 'STUDENT' && (
            <ReviewNotifications />
          )}
        </div>

        <div className="mb-8">
          {getDashboardContent()}
        </div>

        {/* Active Preparations Section for Students */}
        {user?.userType === 'STUDENT' && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Active Preparations</h2>
              {loadingPreparations && (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              )}
            </div>
            {preparations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparations.map((prep) => (
                  <Link
                    key={prep.id}
                    to={`/students/preparation-analytics/${encodeURIComponent(prep.roleName)}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{prep.roleName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Started: {new Date(prep.preparationStartDate).toLocaleDateString()}
                      </p>
                      {prep.skillProgress && (
                        <p className="text-sm text-gray-600 mt-1">
                          {Object.values(prep.skillProgress).filter(p => p.completed).length} / {Object.keys(prep.skillProgress).length} skills completed
                        </p>
                      )}
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {loadingPreparations ? 'Loading...' : 'No active preparations. Start preparing for a role to see analytics here.'}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/profile" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Update Profile
            </Link>
            <Link to="/settings" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Settings
            </Link>
            <Link to="/help" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
