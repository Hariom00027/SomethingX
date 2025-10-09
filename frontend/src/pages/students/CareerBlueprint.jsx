import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CareerBlueprint = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-5xl font-bold text-red-500 mb-8 text-center">THIS IS THE NEW CAREER BLUEPRINT PAGE</h1>
      <h1 className="text-3xl font-bold mb-6 text-center">Career Blueprint</h1>
      <p className="text-lg text-center mb-8">Click to get a "Career Blueprint"</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/students/career-blueprint/industry" aria-label="Explore career paths by industry">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>By Industry</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore career paths based on various industries.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/students/career-blueprint/education" aria-label="Explore career paths by education">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>By Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Discover career options aligned with your educational background.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/students/career-blueprint/role" aria-label="Explore career paths by role">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>By Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Find out more about specific job roles and their requirements.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default CareerBlueprint;
