import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReviewNotifications from '../components/notifications/ReviewNotifications';

const Dashboard = () => {
  const { user } = useAuth();

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
          </div>
        );
        
      case 'INSTITUTE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/institutes/internship-management" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Internship Management</h3>
              <p className="text-gray-600">Manage student internships and placements</p>
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
            
            <Link to="/industry/ai-interview" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Interview</h3>
              <p className="text-gray-600">Conduct AI-powered interviews</p>
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
