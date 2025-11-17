import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, Loader2, AlertCircle, ArrowLeft, Target, TrendingUp, Calendar, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Pie, Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PreparationAnalytics = () => {
  const { roleName } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preparation, setPreparation] = useState(null);
  const [roleDetails, setRoleDetails] = useState(null);
  const [showSkills, setShowSkills] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedRoleName = decodeURIComponent(roleName || '');
        
        // Fetch analytics
        const analyticsResponse = await axios.get(
          `http://localhost:8080/api/role-preparation/analytics/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
        );
        setAnalytics(analyticsResponse.data);
        
        // Fetch preparation details
        try {
          const prepResponse = await axios.get(
            `http://localhost:8080/api/role-preparation/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
          );
          setPreparation(prepResponse.data);
        } catch (prepErr) {
          console.error('Error fetching preparation:', prepErr);
        }
        
        // Fetch role details for skills
        try {
          const roleResponse = await axios.get(
            `http://localhost:8080/api/blueprint/role/${encodeURIComponent(decodedRoleName)}`
          );
          setRoleDetails(roleResponse.data);
        } catch (roleErr) {
          console.error('Error fetching role details:', roleErr);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleName, user?.id, authLoading]);

  const handleToggleSkill = async (skillName, currentStatus) => {
    if (!user?.id || !preparation) return;

    const newStatus = !currentStatus;
    try {
      const decodedRoleName = decodeURIComponent(roleName || '');
      const response = await axios.put(
        `http://localhost:8080/api/role-preparation/skill/${encodeURIComponent(decodedRoleName)}/${encodeURIComponent(skillName)}?studentId=${user.id}&completed=${newStatus}`
      );
      setPreparation(response.data);
      
      // Refresh analytics
      const analyticsResponse = await axios.get(
        `http://localhost:8080/api/role-preparation/analytics/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
      );
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error('Error updating skill:', err);
      alert('Failed to update skill. Please try again.');
    }
  };

  const handleLeavePreparation = async () => {
    console.log('handleLeavePreparation called');
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }
    
    setIsDeleting(true);
    try {
      const decodedRoleName = decodeURIComponent(roleName || '');
      console.log('Deleting preparation for role:', decodedRoleName, 'student:', user.id);
      const response = await axios.delete(
        `http://localhost:8080/api/role-preparation/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
      );
      console.log('Delete response:', response);
      
      // Navigate back or to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error leaving preparation:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert(`Failed to leave preparation: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Analytics Available</h2>
          <p className="text-gray-600 mb-4">Please start preparing for a role to see analytics.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const skillsByTypeData = {
    labels: Object.keys(analytics.skillsByType || {}),
    datasets: [{
      label: 'Skills Completed',
      data: Object.values(analytics.skillsByType || {}),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const preparationProgressData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [analytics.completedSkills || 0, analytics.remainingSkills || 0],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(156, 163, 175, 1)',
      ],
      borderWidth: 2,
    }],
  };

  // Prepare learning timeline data
  const learningByMonth = analytics.learningByMonth || {};
  const sortedMonths = Object.keys(learningByMonth).sort();
  const learningTimelineData = {
    labels: sortedMonths,
    datasets: [{
      label: 'Skills Completed',
      data: sortedMonths.map(month => learningByMonth[month]),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 10
          }
        },
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Preparation Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                {decodeURIComponent(roleName || 'Unknown Role')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Skills</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalSkills || 0}</p>
                </div>
                <Target className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-900">{analytics.completedSkills || 0}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.remainingSkills || 0}</p>
                </div>
                <XCircle className="h-12 w-12 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Progress</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Math.round(analytics.completionPercentage || 0)}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <p className="text-sm font-medium text-gray-600">Days Since Start</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.daysSinceStart || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-gray-600">Avg Skills/Month</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.averageSkillsPerMonth ? analytics.averageSkillsPerMonth.toFixed(1) : '0.0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-gray-600">Overdue Skills</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.skillsWithWarnings?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skills by Type Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Skills by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                {Object.keys(analytics.skillsByType || {}).length > 0 ? (
                  <div className="w-48 h-48 mx-auto">
                    <Pie data={skillsByTypeData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preparation Progress Doughnut Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Preparation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex flex-col items-center justify-center">
                <div className="w-48 h-48 mx-auto">
                  <Doughnut data={preparationProgressData} options={chartOptions} />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xl font-bold text-gray-900">
                    {Math.round(analytics.completionPercentage || 0)}%
                  </p>
                  <p className="text-xs text-gray-600">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Learning Timeline</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Skills completed across different months
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {sortedMonths.length > 0 ? (
                <Line data={learningTimelineData} options={{...lineChartOptions, maintainAspectRatio: false}} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No learning data available yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skills Progress</CardTitle>
              <button
                onClick={() => setShowSkills(!showSkills)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {showSkills ? 'Hide Skills' : 'Show Skills'}
              </button>
            </div>
          </CardHeader>
          {showSkills && roleDetails?.skillRequirements && preparation && (
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  const technicalSkills = (roleDetails.skillRequirements || []).filter(skill => 
                    skill?.skillType === 'technical' || skill?.skillType === 'Technical'
                  );
                  const nonTechnicalSkills = (roleDetails.skillRequirements || []).filter(skill => 
                    skill?.skillType !== 'technical' && skill?.skillType !== 'Technical'
                  );
                  
                  return (
                    <>
                      {technicalSkills.length > 0 && (
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
                          <h3 className="text-lg font-bold text-blue-900 mb-4">Technical Skills</h3>
                          <div className="space-y-3">
                            {technicalSkills.map((skill, index) => {
                              const progress = preparation.skillProgress?.[skill.skillName];
                              const isCompleted = progress?.completed || false;
                              const isOverdue = progress?.targetDate && !isCompleted && new Date(progress.targetDate) < new Date();
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`rounded-xl border p-4 transition-all ${
                                    isCompleted 
                                      ? 'border-green-300 bg-green-50/50' 
                                      : isOverdue
                                      ? 'border-red-300 bg-red-50/50'
                                      : 'border-blue-200 bg-white/90'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-slate-900">{skill.skillName}</h4>
                                        {isCompleted && (
                                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {isOverdue && (
                                          <AlertCircle className="h-5 w-5 text-red-600" />
                                        )}
                                      </div>
                                      {skill.description && (
                                        <p className="text-sm text-slate-600 mb-2">{skill.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Technical</span>
                                        {skill.importance && (
                                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">{skill.importance}</span>
                                        )}
                                        {progress?.targetDate && (
                                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            Target: {new Date(progress.targetDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      {isCompleted && progress?.completedDate && (
                                        <p className="text-xs text-green-700">
                                          Completed on {new Date(progress.completedDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleToggleSkill(skill.skillName, isCompleted)}
                                      className="flex-shrink-0"
                                    >
                                      {isCompleted ? (
                                        <ToggleRight className="h-8 w-8 text-green-600" />
                                      ) : (
                                        <ToggleLeft className="h-8 w-8 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {nonTechnicalSkills.length > 0 && (
                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
                          <h3 className="text-lg font-bold text-emerald-900 mb-4">Non-Technical Skills</h3>
                          <div className="space-y-3">
                            {nonTechnicalSkills.map((skill, index) => {
                              const progress = preparation.skillProgress?.[skill.skillName];
                              const isCompleted = progress?.completed || false;
                              const isOverdue = progress?.targetDate && !isCompleted && new Date(progress.targetDate) < new Date();
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`rounded-xl border p-4 transition-all ${
                                    isCompleted 
                                      ? 'border-green-300 bg-green-50/50' 
                                      : isOverdue
                                      ? 'border-red-300 bg-red-50/50'
                                      : 'border-emerald-200 bg-white/90'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-slate-900">{skill.skillName}</h4>
                                        {isCompleted && (
                                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {isOverdue && (
                                          <AlertCircle className="h-5 w-5 text-red-600" />
                                        )}
                                      </div>
                                      {skill.description && (
                                        <p className="text-sm text-slate-600 mb-2">{skill.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">Non-Technical</span>
                                        {skill.importance && (
                                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">{skill.importance}</span>
                                        )}
                                        {progress?.targetDate && (
                                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            Target: {new Date(progress.targetDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      {isCompleted && progress?.completedDate && (
                                        <p className="text-xs text-green-700">
                                          Completed on {new Date(progress.completedDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleToggleSkill(skill.skillName, isCompleted)}
                                      className="flex-shrink-0"
                                    >
                                      {isCompleted ? (
                                        <ToggleRight className="h-8 w-8 text-green-600" />
                                      ) : (
                                        <ToggleLeft className="h-8 w-8 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Warnings Section */}
        {analytics.skillsWithWarnings && analytics.skillsWithWarnings.length > 0 && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900">Overdue Skills</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.skillsWithWarnings.map((warning, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div>
                      <p className="font-semibold text-gray-900">{warning.skillName}</p>
                      <p className="text-sm text-gray-600">
                        Target Date: {new Date(warning.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        {warning.daysOverdue} day{warning.daysOverdue !== 1 ? 's' : ''} overdue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leave Preparation Button */}
        <Card className="mb-8 border-red-200">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Leave Preparation button clicked');
                  console.log('Current showLeaveConfirmation state:', showLeaveConfirmation);
                  setShowLeaveConfirmation(true);
                  console.log('Set showLeaveConfirmation to true');
                }}
                className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg shadow-lg cursor-pointer"
                type="button"
                style={{ zIndex: 10 }}
              >
                Leave Preparation
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              console.log('Closing dialog by clicking backdrop');
              setShowLeaveConfirmation(false);
            }
          }}
        >
          <Card 
            className="w-full max-w-md bg-white"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 10000 }}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-900">Leave Preparation?</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Are you sure you want to leave this preparation? All your progress, including completed skills and learning history, will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Cancel clicked');
                    setShowLeaveConfirmation(false);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Confirm clicked');
                    handleLeavePreparation();
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  type="button"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    'Yes, Leave Preparation'
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PreparationAnalytics;

