import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '870210312110-3gmop6gud44relrcidkj74i5r8l1boto.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 250
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google OAuth response received:', response);
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('Decoded payload:', payload);
      
      const googleData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      console.log('Sending login request with data:', googleData);
      const result = await login(googleData);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.error('Login failed:', result.error);
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error processing Google auth:', error);
      alert('Error processing Google authentication: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      <p className="text-sm text-gray-600">
        Sign in with your Google account to continue
      </p>
    </div>
  );
};

export default GoogleAuth;
