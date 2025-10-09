import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

const RoleSelection = () => {
  const { industryName, specializationName } = useParams();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (industryName) {
      axios.get(`http://localhost:8080/api/blueprint/industry/${industryName}/roles`)
        .then(response => {
          setRoles(response.data);
        })
        .catch(error => {
          console.error('Error fetching roles by industry:', error);
        });
    } else if (specializationName) {
      axios.get(`http://localhost:8080/api/blueprint/specialization/${specializationName}/roles`)
        .then(response => {
          setRoles(response.data);
        })
        .catch(error => {
          console.error('Error fetching roles by specialization:', error);
        });
    }
  }, [industryName, specializationName]);

  const title = industryName ? `Select a Role for ${industryName} Industry` : `Select a Role for ${specializationName} Specialization`;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <Link to={`/students/career-blueprint/role/${role}`} key={role}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{role}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View details for the {role} role.</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
