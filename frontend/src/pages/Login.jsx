import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleAuth from '../components/auth/GoogleAuth';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const Login = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      const result = await adminLogin(adminCredentials.username, adminCredentials.password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setAdminError(result.error || 'Login failed');
      }
    } catch (error) {
      setAdminError('An error occurred during login');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to SaarthiX
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your career development tools
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-lg shadow-md">
            {!showAdminLogin ? (
              <>
                <GoogleAuth />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Admin Login
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Admin Login</h3>
                  <button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminError('');
                      setAdminCredentials({ username: '', password: '' });
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Back to User Login
                  </button>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  {adminError && (
                    <div className="text-red-600 text-sm">{adminError}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={adminLoading}>
                    {adminLoading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </form>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
