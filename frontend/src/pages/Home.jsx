import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Home = () => {
  return (
    <div>
      <div className="p-10 text-center">
        <h1 className="text-4xl font-bold">Welcome to CareerConnect 360</h1>
        <p className="text-lg mt-4">Your one-stop platform for career development.</p>
        
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/login">
            <Button>Get Started</Button>
          </Link>
          <Link to="/admin/dashboard">
            <Button variant="outline">Admin Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
