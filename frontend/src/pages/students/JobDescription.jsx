import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GanttChart from '../../components/ui/gantt-chart';
import { Briefcase, Loader2, AlertCircle, Calendar, Target, Sparkles } from 'lucide-react';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Job Details</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No job details found for {roleName}.</p>
        </div>
      </div>
    );
  }

  // Check if we have Gantt chart data
  const isGanttChart = jobDetails.plan && jobDetails.plan.chartType === 'gantt';
  const totalMonths = jobDetails.plan?.totalMonths || 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-6 shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Career Blueprint for {jobDetails.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Target className="w-5 h-5" />
            <span className="text-lg">Your personalized career development plan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Job Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">{jobDetails.jobDescription?.description || jobDetails.description || 'No description available for this role.'}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Required Skills</CardTitle>
              </div>
            </CardHeader>
          <CardContent>
            {jobDetails.skillRequirements && jobDetails.skillRequirements.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Skill Requirements:</h3>
                <div className="space-y-4">
                  {jobDetails.skillRequirements.map((skill, index) => {
                    const skillTypeColors = {
                      technical: 'from-blue-500 to-cyan-500',
                      soft: 'from-green-500 to-emerald-500',
                      certification: 'from-yellow-500 to-orange-500'
                    };
                    const difficultyColors = {
                      beginner: 'bg-green-100 text-green-800 border-green-300',
                      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      advanced: 'bg-red-100 text-red-800 border-red-300'
                    };
                    const importanceColors = {
                      'Essential': 'bg-red-100 text-red-800 border-red-300',
                      'Important': 'bg-orange-100 text-orange-800 border-orange-300',
                      'Good to be': 'bg-blue-100 text-blue-800 border-blue-300'
                    };
                    return (
                      <div 
                        key={index} 
                        className="border-l-4 pl-4 py-3 rounded-r-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200"
                        style={{ borderLeftColor: skill.skillType === 'technical' ? '#3b82f6' : skill.skillType === 'soft' ? '#10b981' : '#a855f7' }}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{skill.skillName}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{skill.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              skill.skillType === 'technical' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              skill.skillType === 'soft' ? 'bg-green-100 text-green-800 border-green-300' :
                              'bg-purple-100 text-purple-800 border-purple-300'
                            }`}>
                              {skill.skillType}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${importanceColors[skill.importance] || importanceColors['Good to be']}`}>
                              {skill.importance || 'Good to be'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[skill.difficulty] || difficultyColors.beginner}`}>
                              {skill.difficulty}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium">{skill.timeRequiredMonths} month{skill.timeRequiredMonths !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

      <Card className="mb-8 border-2 border-gray-200 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {isGanttChart ? `${totalMonths}-Month Skill Development Plan` : '6-Month Plan'}
              </CardTitle>
            </div>
            {isGanttChart && (
              <button
                onClick={() => setShowDurationModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
              >
                Customize Duration
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isGanttChart ? (
            <div>
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-indigo-500 text-white mt-1">
                    <Target className="w-4 h-4" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{getPersonalizedMessage()}</p>
                </div>
              </div>
              {jobDetails.plan?.warnings && jobDetails.plan.warnings.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                      {jobDetails.plan.warnings.map((warning, index) => (
                        <p key={index} className="text-yellow-700 text-sm mb-1">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <GanttChart data={jobDetails.plan} totalMonths={totalMonths} />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">Gantt chart data not available</p>
              <p className="text-sm text-gray-500">Please ensure your profile is complete. Make sure to fill in your expected graduation year and current year information.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Customization Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-96 max-w-md mx-4 shadow-2xl border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Customize Preparation Duration</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              How many months would you like to prepare for this role?
            </p>
            <div className="mb-6">
              <input
                type="number"
                min="3"
                max="24"
                defaultValue={totalMonths}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium transition-all"
                placeholder="Enter duration in months"
                id="durationInput"
              />
            </div>
            <div className="flex gap-3">
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
              >
                Apply
              </button>
              <button
                onClick={() => setShowDurationModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default JobDescription;
