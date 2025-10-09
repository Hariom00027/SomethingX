import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GanttChart from '../../components/ui/gantt-chart';

const JobDescription = () => {
  const { roleName } = useParams();
  const { user } = useAuth();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customDuration, setCustomDuration] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Use the new Gantt chart endpoint
    const durationParam = customDuration ? `&duration=${customDuration}` : '';
    axios.get(`http://localhost:8080/api/blueprint/role/${roleName}/gantt?userId=${user.id}${durationParam}`)
      .then(response => {
        setJobDetails(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching job details:', err);
        // Fallback to original endpoint if Gantt endpoint fails
        axios.get(`http://localhost:8080/api/blueprint/role/${roleName}`)
          .then(response => {
            setJobDetails(response.data);
            setLoading(false);
          })
          .catch(fallbackErr => {
            setError(fallbackErr);
            setLoading(false);
          });
      });
  }, [roleName, user?.id, customDuration]);

  const handleDurationChange = (newDuration) => {
    setCustomDuration(newDuration);
    setShowDurationModal(false);
  };

  const getPersonalizedMessage = () => {
    if (!user || !jobDetails) return '';
    
    const userName = user.name || user.firstName || 'Student';
    const semester = user.semester || 'Unknown';
    const year = user.year || 'Unknown';
    const totalMonths = jobDetails.plan?.totalMonths || 6;
    
    return `Dear ${userName}, since you are in ${semester} of ${year}, the time remaining for you to graduate is ${totalMonths} months. This is also the time remaining for you to be role ready.`;
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading job details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error loading job details: {error.message}</div>;
  }

  if (!jobDetails) {
    return <div className="container mx-auto p-4 text-center">No job details found for {roleName}.</div>;
  }

  // Check if we have Gantt chart data
  const isGanttChart = jobDetails.plan && jobDetails.plan.chartType === 'gantt';
  const totalMonths = jobDetails.plan?.totalMonths || 6;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Career Blueprint for {jobDetails.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobDetails.jobDescription?.description || jobDetails.description || 'No description available for this role.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {jobDetails.skillRequirements && jobDetails.skillRequirements.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Skill Requirements:</h3>
                <div className="space-y-3">
                  {jobDetails.skillRequirements.map((skill, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{skill.skillName}</h4>
                          <p className="text-sm text-gray-600">{skill.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            skill.skillType === 'technical' ? 'bg-blue-100 text-blue-800' :
                            skill.skillType === 'soft' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {skill.skillType}
                          </span>
                          <div className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              skill.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                              skill.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {skill.difficulty}
                            </span>
                          </div>
                          <div className="mt-1 text-xs">
                            {skill.timeRequiredMonths} month{skill.timeRequiredMonths !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : jobDetails.skills ? (
              <div>
                <h3 className="text-lg font-semibold">Technical Skills:</h3>
                <ul className="list-disc list-inside mb-4">
                  {jobDetails.skills.technical?.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  )) || <li>No technical skills listed</li>}
                </ul>
                <h3 className="text-lg font-semibold">Soft Skills:</h3>
                <ul className="list-disc list-inside">
                  {jobDetails.skills.soft?.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  )) || <li>No soft skills listed</li>}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">No skill requirements available for this role.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {isGanttChart ? `${totalMonths}-Month Skill Development Plan` : '6-Month Plan'}
            </CardTitle>
            {isGanttChart && (
              <button
                onClick={() => setShowDurationModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Customize Duration
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isGanttChart ? (
            <div>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 font-medium">{getPersonalizedMessage()}</p>
              </div>
              <GanttChart data={jobDetails.plan} totalMonths={totalMonths} />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Gantt chart data not available. Please ensure your profile is complete.</p>
              <p className="text-sm mt-2">Make sure to fill in your expected graduation year and current year information.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Customization Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Customize Preparation Duration</h3>
            <p className="text-gray-600 mb-4">
              How many months would you like to prepare for this role?
            </p>
            <div className="mb-4">
              <input
                type="number"
                min="3"
                max="24"
                defaultValue={totalMonths}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter duration in months"
                id="durationInput"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const input = document.getElementById('durationInput');
                  const duration = parseInt(input.value);
                  if (duration >= 3 && duration <= 24) {
                    handleDurationChange(duration);
                  } else {
                    alert('Please enter a duration between 3 and 24 months');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowDurationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescription;
