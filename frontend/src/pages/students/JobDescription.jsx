import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GanttChart from '../../components/ui/gantt-chart';
import { Briefcase, Loader2, AlertCircle, Calendar, Target, Sparkles, CheckCircle2, Play, BarChart3, ToggleLeft, ToggleRight, Clock, TrendingUp, Layers } from 'lucide-react';

const normalizePreparation = (prep) => {
  if (!prep) return null;
  const isActive = prep.isActive ?? prep.active ?? false;
  return { ...prep, isActive };
};

// Skill Badge Component with Tooltip
const SkillBadge = ({ skill, variant, type }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const tooltipHeight = 200; // approximate height
    const viewportWidth = window.innerWidth;

    let x = rect.left + rect.width / 2;
    let y = rect.top - 10;

    // Adjust if tooltip would go off screen horizontally
    if (x - tooltipWidth / 2 < 10) {
      x = tooltipWidth / 2 + 10;
    } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
      x = viewportWidth - tooltipWidth / 2 - 10;
    }

    // Adjust if tooltip would go off screen vertically
    if (y - tooltipHeight < 10) {
      y = rect.bottom + 10;
    }

    setTooltipPosition({ x, y });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getBadgeClasses = () => {
    const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer hover:scale-105";

    if (type === 'technical') {
      return variant === 'essential'
        ? `${baseClasses} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300`
        : `${baseClasses} bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300`;
    } else {
      return variant === 'essential'
        ? `${baseClasses} bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300`
        : `${baseClasses} bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300`;
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-slate-600';
    const diff = difficulty.toLowerCase();
    if (diff === 'beginner') return 'text-green-600';
    if (diff === 'intermediate') return 'text-yellow-600';
    if (diff === 'advanced') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div className="relative inline-block">
      <span
        className={getBadgeClasses()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {skill?.skillName || 'Unknown Skill'}
      </span>

      {showTooltip && (
        <div
          className="fixed z-50 w-72 rounded-lg border border-slate-200 bg-white shadow-2xl p-4 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: tooltipPosition.y > window.innerHeight / 2
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
            marginTop: tooltipPosition.y > window.innerHeight / 2 ? '8px' : '-8px'
          }}
        >
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-base font-bold text-slate-900">{skill?.skillName || 'Unknown Skill'}</h4>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
                {type === 'technical' ? 'Technical Skill' : 'Soft Skill'}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {skill?.importance && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Importance:</span>
                  <span className="font-semibold text-slate-900">{skill.importance}</span>
                </div>
              )}

              {skill?.difficulty && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Difficulty:</span>
                  <span className={`font-semibold capitalize ${getDifficultyColor(skill.difficulty)}`}>
                    {skill.difficulty}
                  </span>
                </div>
              )}

              {skill?.timeRequiredMonths !== undefined && skill?.timeRequiredMonths !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Total Time:</span>
                  <span className="font-semibold text-slate-900">
                    {skill.timeRequiredMonths} {skill.timeRequiredMonths === 1 ? 'month' : 'months'}
                  </span>
                </div>
              )}

              {skill?.description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-700 leading-relaxed">{skill.description}</p>
                </div>
              )}

              {skill?.prerequisites && Array.isArray(skill.prerequisites) && skill.prerequisites.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Prerequisites:</p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {skill.prerequisites.map((prereq, idx) => (
                      <li key={idx}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className={`absolute left-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 transform -translate-x-1/2 rotate-45 ${tooltipPosition.y > window.innerHeight / 2
              ? 'top-0 -translate-y-1/2'
              : 'bottom-0 translate-y-1/2'
              }`}
            style={tooltipPosition.y > window.innerHeight / 2
              ? { marginTop: '-6px' }
              : { marginBottom: '-6px' }
            }
          />
        </div>
      )}
    </div>
  );
};

const JobDescription = () => {
  const { roleName } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customDuration, setCustomDuration] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [preparation, setPreparation] = useState(null);
  const [preparationLoading, setPreparationLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const decodedRoleName = decodeURIComponent(roleName || '');

    if (!decodedRoleName || decodedRoleName === 'undefined') {
      setError('Role name is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let response;

        if (user?.id) {
          const durationParam = customDuration ? `&duration=${customDuration}` : '';
          const ganttUrl = `http://localhost:8080/api/blueprint/role/${encodeURIComponent(decodedRoleName)}/gantt?userId=${user.id}${durationParam}`;

          try {
            response = await axios.get(ganttUrl);
          } catch {
            // Fallback to basic endpoint
            const fallbackUrl = `http://localhost:8080/api/blueprint/role/${encodeURIComponent(decodedRoleName)}`;
            response = await axios.get(fallbackUrl);
          }
        } else {
          const basicUrl = `http://localhost:8080/api/blueprint/role/${encodeURIComponent(decodedRoleName)}`;
          response = await axios.get(basicUrl);
        }

        setJobDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load job details');
        setLoading(false);
      }
    };

    fetchData();
  }, [roleName, user?.id, customDuration, authLoading]);

  // Fetch preparation status
  useEffect(() => {
    if (!user?.id || !roleName) return;

    const fetchPreparation = async () => {
      try {
        const decodedRoleName = decodeURIComponent(roleName || '');
        const response = await axios.get(
          `http://localhost:8080/api/role-preparation/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
        );
        if (response.data) {
          const normalized = normalizePreparation(response.data);
          setPreparation(normalized);
        } else {
          setPreparation(null);
        }
      } catch {
        // Preparation doesn't exist yet, that's okay
        setPreparation(null);
      }
    };

    fetchPreparation();
  }, [user?.id, roleName]);

  const handleDurationChange = (newDuration) => {
    if (newDuration >= 3 && newDuration <= 24) {
      setCustomDuration(newDuration);
      setShowDurationModal(false);
    } else {
      alert('Please enter a duration between 3 and 24 months');
    }
  };

  const handleStartPreparation = async () => {
    console.log('handleStartPreparation called');
    if (!user?.id) {
      alert('Please login to start preparation');
      return;
    }

    console.log('Starting preparation for user:', user.id, 'role:', roleName);
    setPreparationLoading(true);
    try {
      const decodedRoleName = decodeURIComponent(roleName || '');
      console.log('Decoded role name:', decodedRoleName);
      const url = `http://localhost:8080/api/role-preparation/start/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`;
      console.log('Request URL:', url);

      const response = await axios.post(url);
      console.log('Response received:', response);

      if (response.data) {
        console.log('Preparation data:', response.data);
        const normalized = normalizePreparation(response.data);
        setPreparation(normalized);
        // Refetch preparation to ensure everything is in sync
        try {
          const prepResponse = await axios.get(
            `http://localhost:8080/api/role-preparation/${encodeURIComponent(decodedRoleName)}?studentId=${user.id}`
          );
          if (prepResponse.data) {
            setPreparation(normalizePreparation(prepResponse.data));
          }
        } catch (refetchErr) {
          console.warn('Error refetching preparation:', refetchErr);
          // Not critical, continue with the data we have
        }
      } else {
        console.error('No data in response');
        alert('No data received from server. Please try again.');
      }
    } catch (err) {
      console.error('Error starting preparation:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to start preparation. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setPreparationLoading(false);
    }
  };

  const handleToggleSkill = async (skillName, currentStatus, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!user?.id || !preparation) return;

    // If trying to mark as completed, navigate to test page
    if (!currentStatus) {
      const decodedRoleName = decodeURIComponent(roleName || '');
      navigate(`/students/skill-test/${encodeURIComponent(decodedRoleName)}/${encodeURIComponent(skillName)}`);
      return;
    }

    // If unmarking (setting to not completed)
    const newStatus = false;
    try {
      const decodedRoleName = decodeURIComponent(roleName || '');
      const response = await axios.put(
        `http://localhost:8080/api/role-preparation/skill/${encodeURIComponent(decodedRoleName)}/${encodeURIComponent(skillName)}?studentId=${user.id}&completed=${newStatus}`
      );
      if (response.data) {
        const normalized = normalizePreparation(response.data);
        setPreparation(normalized);
      }
    } catch (err) {
      console.error('Error updating skill:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update skill. Please try again.';

      // If it's the test requirement error, navigate to test page instead
      if (err.response?.data?.code === 'SKILL_COMPLETION_REQUIRES_TEST' ||
        errorMessage.includes('test') ||
        errorMessage.includes('Cannot mark skill as completed directly')) {
        const decodedRoleName = decodeURIComponent(roleName || '');
        navigate(`/students/skill-test/${encodeURIComponent(decodedRoleName)}/${encodeURIComponent(skillName)}`);
        return;
      }

      alert(errorMessage);
    }
  };

  const handleViewAnalytics = () => {
    const decodedRoleName = decodeURIComponent(roleName || '');
    navigate(`/students/preparation-analytics/${encodeURIComponent(decodedRoleName)}`);
  };

  const getPersonalizedMessage = () => {
    if (!user || !jobDetails) return '';

    const userName = user.name || user.firstName || 'Student';
    const semester = user.semester || 'Unknown';
    const year = user.year || 'Unknown';
    const totalMonths = jobDetails.plan?.totalMonths || 6;

    return `Dear ${userName}, since you are in ${semester} of ${year}, the time remaining for you to graduate is ${totalMonths} months. This is also the time remaining for you to be role ready.`;
  };

  const planStats = useMemo(() => {
    if (!jobDetails?.plan?.tasks || !Array.isArray(jobDetails.plan.tasks)) {
      return null;
    }
    const tasks = jobDetails.plan.tasks;
    const technicalCount = tasks.filter(task => task.type === 'technical').length;
    const nonTechnicalCount = tasks.filter(task => task.type === 'non-technical').length;
    const projectCount = tasks.length - technicalCount - nonTechnicalCount;

    // Calculate duration stats
    // tasks have start and end as month numbers (e.g., 1, 6)
    const durations = tasks.map(t => {
      const start = t.start || 0;
      const end = t.end || 0;
      // Duration is inclusive: end - start + 1
      return Math.max(1, end - start + 1);
    });

    const avgDuration = durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
      : 0;

    const longestSprint = durations.length > 0
      ? Math.max(...durations).toFixed(0)
      : 0;

    return {
      total: tasks.length,
      technical: technicalCount,
      nonTechnical: nonTechnicalCount,
      project: projectCount > 0 ? projectCount : 0,
      avgDuration,
      longestSprint
    };
  }, [jobDetails?.plan?.tasks]);

  const technicalSkillsData = useMemo(() => {
    if (!jobDetails?.skillRequirements || !Array.isArray(jobDetails.skillRequirements) || jobDetails.skillRequirements.length === 0) {
      return null;
    }

    const technicalSkills = (jobDetails.skillRequirements || []).filter(skill =>
      skill?.skillType === 'technical' || skill?.skillType === 'Technical'
    );

    if (technicalSkills.length === 0) {
      return null;
    }

    const essentialSkills = technicalSkills.filter(skill =>
      skill?.importance?.toLowerCase() === 'essential' || skill?.importance?.toLowerCase() === 'required'
    );
    const importantSkills = technicalSkills.filter(skill =>
      skill?.importance?.toLowerCase() === 'important' ||
      (skill?.importance?.toLowerCase() !== 'essential' && skill?.importance?.toLowerCase() !== 'required')
    );

    return {
      essentialSkills,
      importantSkills
    };
  }, [jobDetails?.skillRequirements]);

  const softSkillsData = useMemo(() => {
    if (!jobDetails?.skillRequirements || !Array.isArray(jobDetails.skillRequirements) || jobDetails.skillRequirements.length === 0) {
      return null;
    }

    const softSkills = (jobDetails.skillRequirements || []).filter(skill =>
      skill?.skillType !== 'technical' && skill?.skillType !== 'Technical'
    );

    if (softSkills.length === 0) {
      return null;
    }

    const essentialSkills = softSkills.filter(skill =>
      skill?.importance?.toLowerCase() === 'essential' || skill?.importance?.toLowerCase() === 'required'
    );
    const importantSkills = softSkills.filter(skill =>
      skill?.importance?.toLowerCase() === 'important' ||
      (skill?.importance?.toLowerCase() !== 'essential' && skill?.importance?.toLowerCase() !== 'required')
    );

    return {
      essentialSkills,
      importantSkills
    };
  }, [jobDetails?.skillRequirements]);

  const isGanttChart = jobDetails?.plan && jobDetails.plan.chartType === 'gantt';
  const totalMonths = jobDetails?.plan?.totalMonths || 6;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading job details...</p>
          <p className="text-gray-400 text-sm mt-2">Role: {decodeURIComponent(roleName || 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Job Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Role: {decodeURIComponent(roleName || 'Unknown')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!jobDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Job Details Found</h2>
          <p className="text-gray-600">No job details found for {decodeURIComponent(roleName || 'Unknown')}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/80 via-purple-50/50 to-transparent" />
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-indigo-100/40 blur-3xl opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-purple-100/40 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] rounded-full bg-pink-100/40 blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="relative mx-auto mb-16 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-2xl bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-slate-100">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-inner">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Career Blueprint for{' '}
            <span className="text-indigo-600">
              {jobDetails?.name || jobDetails?.roleName || decodeURIComponent(roleName || 'Unknown Role')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your personalized roadmap to mastering the skills required for this role.
          </p>
        </div>

        {/* Stats Grid */}
        {planStats && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 md:p-6 max-w-5xl mx-auto mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Skills',
                  value: planStats.total,
                  icon: Target,
                  color: 'text-indigo-700',
                  bgColor: '#c7d2fe', // indigo-200
                  borderColor: '#a5b4fc', // indigo-300
                },
                {
                  label: 'Technical',
                  value: planStats.technical,
                  icon: CheckCircle2,
                  color: 'text-emerald-700',
                  bgColor: '#a7f3d0', // emerald-200
                  borderColor: '#6ee7b7', // emerald-300
                },
                {
                  label: 'Soft Skills',
                  value: planStats.nonTechnical,
                  icon: Sparkles,
                  color: 'text-purple-700',
                  bgColor: '#e9d5ff', // purple-200
                  borderColor: '#d8b4fe', // purple-300
                },
                {
                  label: 'Projects',
                  value: planStats.project,
                  icon: Briefcase,
                  color: 'text-blue-700',
                  bgColor: '#bfdbfe', // blue-200
                  borderColor: '#93c5fd', // blue-300
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="relative group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      backgroundColor: item.bgColor,
                      borderColor: item.borderColor
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`inline-flex p-3 rounded-xl bg-white/80 shadow-sm ${item.color} mb-3`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{item.value}</p>
                      <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '64px', marginTop: '64px' }}>

          {/* Column 1: Job Description */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Job Description</h2>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#475569' }}>
                {jobDetails?.jobDescription?.description || jobDetails?.description || ''}
              </p>
            </div>

            {jobDetails?.jobDescription?.keyResponsibilities && Array.isArray(jobDetails.jobDescription.keyResponsibilities) && jobDetails.jobDescription.keyResponsibilities.length > 0 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '16px' }}>Key Responsibilities:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {jobDetails.jobDescription.keyResponsibilities.map((responsibility, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flexShrink: 0, marginTop: '4px' }}>
                        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                      </div>
                      <span style={{ fontSize: '15px', color: '#475569', lineHeight: '1.5' }}>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Column 2: Technical Skills */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Technical Skills Required</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {technicalSkillsData?.essentialSkills?.map((skill, index) => (
                <div key={`tech-essential-${index}`} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {typeof skill === 'object' ? skill.skillName : skill}
                    </span>
                    <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Essential
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {typeof skill === 'object' && skill.difficulty ? skill.difficulty : 'Intermediate'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      {typeof skill === 'object' && skill.timeRequiredMonths ? `${skill.timeRequiredMonths} Month${skill.timeRequiredMonths !== 1 ? 's' : ''}` : '1 Month'}
                    </span>
                  </div>
                </div>
              ))}

              {technicalSkillsData?.importantSkills?.map((skill, index) => (
                <div key={`tech-important-${index}`} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {typeof skill === 'object' ? skill.skillName : skill}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Important
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {typeof skill === 'object' && skill.difficulty ? skill.difficulty : 'Beginner'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      {typeof skill === 'object' && skill.timeRequiredMonths ? `${skill.timeRequiredMonths} Month${skill.timeRequiredMonths !== 1 ? 's' : ''}` : '1 Month'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Soft Skills */}
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Soft Skills Required</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {softSkillsData?.essentialSkills?.map((skill, index) => (
                <div key={`soft-essential-${index}`} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {typeof skill === 'object' ? skill.skillName : skill}
                    </span>
                    <span style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Essential
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {typeof skill === 'object' && skill.difficulty ? skill.difficulty : 'Intermediate'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      {typeof skill === 'object' && skill.timeRequiredMonths ? `${skill.timeRequiredMonths} Month${skill.timeRequiredMonths !== 1 ? 's' : ''}` : '1 Month'}
                    </span>
                  </div>
                </div>
              ))}

              {softSkillsData?.importantSkills?.map((skill, index) => (
                <div key={`soft-important-${index}`} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {typeof skill === 'object' ? skill.skillName : skill}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Important
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {typeof skill === 'object' && skill.difficulty ? skill.difficulty : 'Beginner'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></span>
                      {typeof skill === 'object' && skill.timeRequiredMonths ? `${skill.timeRequiredMonths} Month${skill.timeRequiredMonths !== 1 ? 's' : ''}` : '1 Month'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Gantt Chart Section */}
        <Card className="mb-16 overflow-hidden border border-slate-200 bg-white shadow-lg">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardHeader style={{ backgroundColor: 'white', borderBottom: '1px solid #f1f5f9', paddingBottom: '0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', padding: '32px 32px 0 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)',
                  padding: '14px',
                  color: 'white',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                }}>
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle style={{ fontSize: '30px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.025em', margin: '0' }}>
                    {isGanttChart ? (
                      <span style={{
                        background: 'linear-gradient(to right, #0f172a, #334155)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: '#0f172a' // Fallback
                      }}>
                        {totalMonths}-Month Skill Development Atlas
                      </span>
                    ) : (
                      '6-Month Plan'
                    )}
                  </CardTitle>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', marginTop: '4px' }}>Your comprehensive roadmap to success</p>
                </div>
              </div>
              {isGanttChart && (
                <button
                  onClick={() => setShowDurationModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#334155',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Clock className="h-4 w-4" style={{ color: '#94a3b8' }} />
                  <span>Customize Duration</span>
                </button>
              )}
            </div>

            <div style={{ padding: '0 32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {getPersonalizedMessage() && (
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  border: '1px solid #e0e7ff',
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '6px', background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      marginTop: '4px',
                      flexShrink: '0',
                      height: '40px',
                      width: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5'
                    }}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#312e81', marginBottom: '4px' }}>Personalized Roadmap</h4>
                      <p style={{ lineHeight: '1.6', color: '#475569', fontWeight: '500', fontSize: '16px', margin: '0' }}>{getPersonalizedMessage()}</p>
                    </div>
                  </div>
                </div>
              )}

              {jobDetails?.plan?.warnings && Array.isArray(jobDetails.plan.warnings) && jobDetails.plan.warnings.length > 0 && (
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  border: '1px solid #fef3c7',
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '6px', background: 'linear-gradient(to bottom, #f59e0b, #f97316)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                      marginTop: '4px',
                      flexShrink: '0',
                      height: '40px',
                      width: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: '#fffbeb',
                      color: '#d97706'
                    }}>
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78350f', marginBottom: '4px' }}>Important Notice</h4>
                      {jobDetails.plan.warnings.map((warning, index) => (
                        <p key={index} style={{ lineHeight: '1.6', color: '#475569', fontWeight: '500', fontSize: '16px', margin: '0' }}>{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* New Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>

              {/* Total Items */}
              <div style={{ padding: '32px 24px', borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '16px' }}>
                  TOTAL ITEMS
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1' }}>
                  {planStats?.total || 0}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  {planStats?.technical || 0} technical • {planStats?.nonTechnical || 0} non-technical
                </div>
                <div style={{ position: 'absolute', top: '32px', right: '24px', color: '#cbd5e1', opacity: '0.5' }}>
                  <Layers className="h-8 w-8" />
                </div>
              </div>

              {/* Avg Duration */}
              <div style={{ padding: '32px 24px', borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '16px' }}>
                  AVG DURATION
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1' }}>
                  {planStats?.avgDuration || 0} <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>mo</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  per milestone
                </div>
                <div style={{ position: 'absolute', top: '32px', right: '24px', color: '#cbd5e1', opacity: '0.5' }}>
                  <Clock className="h-8 w-8" />
                </div>
              </div>

              {/* Longest Sprint */}
              <div style={{ padding: '32px 24px', borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '16px' }}>
                  LONGEST SPRINT
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1' }}>
                  {planStats?.longestSprint || 0} <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>mo</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  Kaam kal karunga
                </div>
                <div style={{ position: 'absolute', top: '32px', right: '24px', color: '#cbd5e1', opacity: '0.5' }}>
                  <Target className="h-8 w-8" />
                </div>
              </div>

              {/* Timeline */}
              <div style={{ padding: '32px 24px', position: 'relative' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '16px' }}>
                  TIMELINE
                </h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1' }}>
                  {totalMonths} <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>mo</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  Month 1 → Month {totalMonths}
                </div>
                <div style={{ position: 'absolute', top: '32px', right: '24px', color: '#cbd5e1', opacity: '0.5' }}>
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>

            </div>

          </CardHeader>
          <CardContent style={{ paddingTop: '64px', paddingBottom: '48px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {isGanttChart ? (
              <>
                {jobDetails?.plan && (
                  <div style={{ marginBottom: '64px' }}>
                    <GanttChart
                      data={jobDetails.plan}
                      totalMonths={totalMonths}
                      roleName={jobDetails?.name || jobDetails?.roleName || decodeURIComponent(roleName || '')}
                    />
                  </div>
                )}
                {jobDetails?.plan?.hasSpareTime && jobDetails.plan.spareMonths > 0 && (
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-emerald-900">Additional Practice Time Available</h4>
                        <p className="leading-relaxed text-emerald-700">
                          Great news! You have <span className="font-bold">{jobDetails.plan.spareMonths} month{jobDetails.plan.spareMonths !== 1 ? 's' : ''}</span> of additional time after completing all required skills.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-8 py-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-2 text-base font-medium text-slate-700">Gantt chart data not available</p>
                <p className="text-sm text-slate-500">Please ensure your profile is fully updated, including expected graduation year and current academic year details.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Preparation Button */}
        {(!preparation || !preparation.isActive) && (
          <Card className="mb-12 overflow-hidden border border-white/60 bg-white/85 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-4 text-white shadow-lg">
                  <Play className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Ready to Start Your Preparation?</h3>
                <p className="text-slate-600 max-w-md">
                  Begin tracking your skill development journey. Mark skills as you complete them and track your progress.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStartPreparation();
                  }}
                  disabled={preparationLoading}
                  className="rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {preparationLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Preparing
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preparation Section */}
        {preparation && preparation.isActive && (
          <Card className="mb-12 overflow-hidden border border-white/60 bg-white/85 shadow-2xl backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
            <CardHeader className="bg-gradient-to-br from-white to-green-50/65">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-3 text-white shadow-lg">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">My Preparation Progress</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Started on {new Date(preparation.preparationStartDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleViewAnalytics}
                  className="rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              {/* Warnings for overdue skills */}
              {(() => {
                const today = new Date();
                const overdueSkills = jobDetails.skillRequirements.filter(skill => {
                  const progress = preparation.skillProgress?.[skill.skillName];
                  if (!progress || progress.completed) return false;
                  if (progress.targetDate) {
                    const targetDate = new Date(progress.targetDate);
                    return targetDate < today;
                  }
                  return false;
                });

                if (overdueSkills.length > 0) {
                  return (
                    <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-md">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-red-800">Warning: Overdue Skills</h4>
                          <p className="text-sm text-red-700">
                            You have {overdueSkills.length} skill{overdueSkills.length !== 1 ? 's' : ''} that {overdueSkills.length !== 1 ? 'are' : 'is'} past the target date. Please prioritize completing these skills.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Skills List with Toggles */}
              {jobDetails?.skillRequirements && jobDetails.skillRequirements.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    const technicalSkills = (jobDetails.skillRequirements || []).filter(skill =>
                      skill?.skillType === 'technical' || skill?.skillType === 'Technical'
                    );
                    const nonTechnicalSkills = (jobDetails.skillRequirements || []).filter(skill =>
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
                                    className={`rounded-xl border p-4 transition-all ${isCompleted
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
                                          {skill.difficulty && (
                                            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded capitalize">{skill.difficulty}</span>
                                          )}
                                          {progress?.targetDate && (
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                              }`}>
                                              Target: {new Date(progress.targetDate).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        {isCompleted && progress?.completedDate && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-green-700">
                                              Completed on {new Date(progress.completedDate).toLocaleDateString()}
                                              {progress?.score && (
                                                <span className="ml-2">(Score: {progress.score}%)</span>
                                              )}
                                            </p>
                                            {progress?.completedInRole && (
                                              <p className="text-xs text-blue-700">
                                                Auto-completed from:{' '}
                                                <button
                                                  type="button"
                                                  className="underline hover:text-blue-900 font-medium text-left"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/students/career-blueprint/role/${encodeURIComponent(progress.completedInRole)}`);
                                                  }}
                                                >
                                                  {progress.completedInRole}
                                                </button>
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => handleToggleSkill(skill.skillName, isCompleted, e)}
                                        className="flex-shrink-0"
                                        type="button"
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
                                    className={`rounded-xl border p-4 transition-all ${isCompleted
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
                                          {skill.difficulty && (
                                            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded capitalize">{skill.difficulty}</span>
                                          )}
                                          {progress?.targetDate && (
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                              }`}>
                                              Target: {new Date(progress.targetDate).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        {isCompleted && progress?.completedDate && (
                                          <div className="space-y-1">
                                            <p className="text-xs text-green-700">
                                              Completed on {new Date(progress.completedDate).toLocaleDateString()}
                                              {progress?.score && (
                                                <span className="ml-2">(Score: {progress.score}%)</span>
                                              )}
                                            </p>
                                            {progress?.completedInRole && (
                                              <p className="text-xs text-blue-700">
                                                Auto-completed from:{' '}
                                                <button
                                                  type="button"
                                                  className="underline hover:text-blue-900 font-medium text-left"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/students/career-blueprint/role/${encodeURIComponent(progress.completedInRole)}`);
                                                  }}
                                                >
                                                  {progress.completedInRole}
                                                </button>
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={(e) => handleToggleSkill(skill.skillName, isCompleted, e)}
                                        className="flex-shrink-0"
                                        type="button"
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading skill requirements...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Duration Customization Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-96 max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 text-white shadow-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Customize Preparation Duration</h3>
            </div>
            <p className="mb-6 leading-relaxed text-slate-600">
              How many months would you like to prepare for this role?
            </p>
            <div className="mb-6">
              <input
                type="number"
                min="3"
                max="24"
                defaultValue={totalMonths}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-lg font-medium text-slate-900 shadow-inner transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter duration in months"
                id="durationInput"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const input = document.getElementById('durationInput');
                  const duration = parseInt(input.value);
                  handleDurationChange(duration);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Apply
              </button>
              <button
                onClick={() => setShowDurationModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
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
