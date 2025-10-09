import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import axios from 'axios';

const EducationList = () => {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/blueprint/educations')
      .then(response => {
        setEducations(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching education list. Please try again later.');
        setLoading(false);
        console.error('Error fetching educations:', error);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (educations.length === 0) {
    return <div>No education items available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Select an Education</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {educations.map(edu => (
          <Link to={`/students/career-blueprint/education/${edu}`} key={edu}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{edu}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Explore specializations and roles related to {edu}.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EducationList;


