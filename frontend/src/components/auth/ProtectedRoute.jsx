import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredUserType = null, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for required role (e.g., ADMIN)
  if (requiredRole) {
    const hasRole = user?.roles && Array.isArray(user.roles) 
      ? user.roles.includes(requiredRole)
      : user?.roles && typeof user.roles === 'object' 
        ? Object.values(user.roles).includes(requiredRole)
        : false;
    
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check for required user type
  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
