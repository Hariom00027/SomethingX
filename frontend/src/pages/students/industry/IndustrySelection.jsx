import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import axios from 'axios';

const IndustrySelection = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/blueprint/industries')
      .then(response => {
        setIndustries(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching industries. Please try again later.');
        setLoading(false);
        console.error('Error fetching industries:', error);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (industries.length === 0) {
    return <div>No industries available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Select an Industry</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {industries.map(industry => (
          <Link to={`/students/career-blueprint/industry/${industry}`} key={industry}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{industry}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Explore roles and education paths in the {industry} industry.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default IndustrySelection;
