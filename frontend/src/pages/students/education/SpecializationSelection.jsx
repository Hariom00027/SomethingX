import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import axios from 'axios';

const SpecializationSelection = () => {
  const { educationName } = useParams();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error and loading when educationName changes
    setError(null);
    setLoading(true);

    axios.get(`http://localhost:8080/api/blueprint/education/${educationName}/specializations`)
      .then(response => {
        setSpecializations(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching specializations. Please try again later.');
        setLoading(false);
        console.error('Error fetching specializations:', error);
      });
  }, [educationName]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (specializations.length === 0) {
    return <div>No specializations available for {educationName}.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Select a Specialization for {educationName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {specializations.map(spec => (
          <Link to={`/students/career-blueprint/specialization/${spec}/roles`} key={spec}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{spec}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Explore roles within the {spec} specialization.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecializationSelection;
