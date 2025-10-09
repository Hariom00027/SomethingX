import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const RoleOrEducation = () => {
  const { industryName } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Continue your Career Blueprint for {industryName}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to={`/students/career-blueprint/industry/${industryName}/roles`} aria-label={`Explore roles in ${industryName}`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Continue by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore various roles within the {industryName} industry.</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/students/career-blueprint/industry/${industryName}/education`} aria-label={`Explore education paths for ${industryName}`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Continue by Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Explore education paths and qualifications relevant to the {industryName} industry.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default RoleOrEducation;
