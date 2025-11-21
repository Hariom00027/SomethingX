import React, { useMemo, useState, useEffect } from 'react';
import { Layers, Timer, Target, Sparkles, Calendar, BookOpen } from 'lucide-react';
import axios from 'axios';

const GanttChart = ({ data, totalMonths = 6, roleName }) => {

  // Safely extract and normalize data
  const normalizedData = useMemo(() => {
    if (!data || typeof data !== 'object') {
      return { tasks: [], labels: [] };
    }

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const labels = Array.isArray(data.labels) ? data.labels : [];

    // Generate labels if missing
    const finalLabels = labels.length > 0
      ? labels
      : Array.from({ length: totalMonths }, (_, i) => `Month ${i + 1}`);

    return { tasks, labels: finalLabels };
  }, [data, totalMonths]);

  const { tasks, labels } = normalizedData;

  // Separate tasks by type
  const { technicalTasks, nonTechnicalTasks } = useMemo(() => {
    const technical = tasks.filter(task => task?.type === 'technical');
    const nonTechnical = tasks.filter(task => task?.type === 'non-technical');
    return { technicalTasks: technical, nonTechnicalTasks: nonTechnical };
  }, [tasks]);

  // Calculate summary statistics
  const summaryCards = useMemo(() => {
    if (tasks.length === 0) return [];

    const durations = tasks.map(task => Math.max(1, (task.end ?? 0) - (task.start ?? 0) + 1));
    const totalDuration = durations.reduce((sum, val) => sum + val, 0);
    const longestTask = tasks.reduce((longest, task) => {
      const duration = Math.max(1, (task.end ?? 0) - (task.start ?? 0) + 1);
      return !longest || duration > longest.duration
        ? { name: task.name, duration }
        : longest;
    }, null);

    const firstLabel = labels[0] || 'Start';
    const lastLabel = labels[labels.length - 1] || 'Finish';

    return [
      {
        label: 'Total Items',
        value: tasks.length,
        hint: `${technicalTasks.length} technical • ${nonTechnicalTasks.length} non-technical`,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        icon: Layers
      },
      {
        label: 'Avg Duration',
        value: `${(totalDuration / tasks.length).toFixed(1)} mo`,
        hint: 'per milestone',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        icon: Timer
      },
      {
        label: 'Longest Sprint',
        value: longestTask ? `${longestTask.duration} mo` : '–',
        hint: longestTask?.name || 'N/A',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        icon: Target
      },
      {
        label: 'Timeline',
        value: `${totalMonths} mo`,
        hint: `${firstLabel} → ${lastLabel}`,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        icon: Sparkles
      }
    ];
  }, [tasks, labels, technicalTasks.length, nonTechnicalTasks.length, totalMonths]);

  // Generate task color based on type
  // Generate task color based on type
  const getTaskColor = (task, index) => {
    const technicalColors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
    ];
    const nonTechnicalColors = [
      '#6366F1', // indigo-500
      '#EF4444', // red-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#06B6D4', // cyan-500
    ];

    if (task.type === 'non-technical') {
      return nonTechnicalColors[index % nonTechnicalColors.length];
    } else if (task.type === 'technical') {
      return technicalColors[index % technicalColors.length];
    }
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Get month info
  const getMonthInfo = (label, index) => {
    const monthNum = index + 1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = (monthNum - 1) % 12;
    return {
      number: monthNum,
      name: monthNames[monthIndex],
      fullLabel: label
    };
  };

  // State for topics and hover
  const [topicsCache, setTopicsCache] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate month-based skill plan
  const generateSkillPlan = useMemo(() => {
    const plan = [];

    // Create plan rows - one row per task
    tasks.forEach((task, index) => {
      const row = {
        id: task.id || index,
        skill: task.name || 'Unnamed Task',
        type: task.type === 'technical' ? 'Technical' :
          task.type === 'non-technical' ? 'Non-Technical' :
            'Task',
        task: task,
        months: Array.from({ length: totalMonths }, (_, i) => {
          const monthNum = i + 1;
          const isInRange = monthNum >= (task.start || 0) && monthNum <= (task.end || 0);
          return {
            month: monthNum,
            hasTask: isInRange,
            task: isInRange ? task : null,
            isStart: monthNum === (task.start || 0),
            isEnd: monthNum === (task.end || 0)
          };
        })
      };
      plan.push(row);
    });

    return plan;
  }, [tasks, totalMonths]);

  // Fetch topics for a skill
  const fetchTopics = async (skillName, startMonth, endMonth) => {
    if (!roleName || !skillName) return;

    const cacheKey = `${skillName}_${startMonth}_${endMonth}`;
    if (topicsCache[cacheKey]) {
      return topicsCache[cacheKey];
    }

    if (loadingTopics[cacheKey]) {
      return null;
    }

    setLoadingTopics(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const response = await axios.get(
        `http://localhost:8080/api/blueprint/role/${encodeURIComponent(roleName)}/skill/${encodeURIComponent(skillName)}/topics`,
        {
          params: {
            totalMonths,
            startMonth,
            endMonth
          }
        }
      );

      const topics = response.data || {};
      setTopicsCache(prev => ({ ...prev, [cacheKey]: topics }));
      return topics;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return null;
    } finally {
      setLoadingTopics(prev => {
        const newState = { ...prev };
        delete newState[cacheKey];
        return newState;
      });
    }
  };

  // Fetch all topics for all skills on component mount
  useEffect(() => {
    const fetchAllTopics = async () => {
      if (!roleName || tasks.length === 0) return;

      const fetchPromises = tasks.map(async (task) => {
        if (task.start && task.end) {
          const cacheKey = `${task.name}_${task.start}_${task.end}`;
          if (!topicsCache[cacheKey] && !loadingTopics[cacheKey]) {
            await fetchTopics(task.name, task.start, task.end);
          }
        }
      });

      await Promise.all(fetchPromises);
    };

    fetchAllTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleName, tasks.length]);

  // Handle cell hover
  const handleCellMouseEnter = async (e, row, monthData) => {
    if (!monthData.hasTask || !monthData.task) return;

    // Set tooltip position immediately from mouse event
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY
    });

    setHoveredCell({ row, month: monthData.month, task: monthData.task });

    // Fetch topics if not cached
    const cacheKey = `${row.skill}_${monthData.task.start}_${monthData.task.end}`;
    if (!topicsCache[cacheKey]) {
      await fetchTopics(row.skill, monthData.task.start, monthData.task.end);
    }
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleCellMouseMove = (e) => {
    if (hoveredCell) {
      // Update tooltip position to follow cursor
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Early returns after all hooks
  if (!data || tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-12 text-center shadow-inner">
        <Target className="mx-auto mb-4 h-16 w-16 text-slate-400" />
        <p className="mb-2 text-lg font-semibold text-slate-700">No Gantt chart data available</p>
        <p className="text-sm text-slate-500">Please ensure your profile is fully updated with graduation year and academic details.</p>
      </div>
    );
  }

  if (labels.length === 0 && tasks.length > 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-12 text-center shadow-inner">
        <Calendar className="mx-auto mb-4 h-16 w-16 text-slate-400" />
        <p className="mb-2 text-lg font-semibold text-slate-700">Unable to generate timeline</p>
        <p className="text-sm text-slate-500">Missing timeline information. Please ensure totalMonths is provided.</p>
      </div>
    );
  }

  return (
    <div className="gantt-chart-container space-y-8">
      {/* Summary Info - Removed as it is now displayed in the parent component */}


      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="relative z-10 p-6 md:p-8">
          {/* Skill Development Plan Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 border-r border-slate-200 min-w-[200px]">
                    Skill & Type
                  </th>
                  {labels.map((label, index) => {
                    const monthInfo = getMonthInfo(label, index);
                    return (
                      <th
                        key={index}
                        className="px-4 py-5 text-center border-r border-slate-200 last:border-r-0 min-w-[100px]"
                      >
                        <div className="text-sm font-bold text-slate-900">{monthInfo.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">M{monthInfo.number}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {generateSkillPlan.map((row, rowIndex) => {
                  const taskColor = getTaskColor(
                    { type: row.type.toLowerCase().replace(' ', '-') },
                    rowIndex
                  );
                  const isTechnical = row.type === 'Technical';

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 border-r border-slate-200 bg-white">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-transparent"
                            style={{ backgroundColor: taskColor }}
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-900">{row.skill}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{row.type}</div>
                          </div>
                        </div>
                      </td>
                      {row.months.map((monthData, monthIndex) => {
                        // Determine border radius for continuous effect
                        let borderRadius = '0';
                        if (monthData.isStart && monthData.isEnd) borderRadius = '0.5rem';
                        else if (monthData.isStart) borderRadius = '0.5rem 0 0 0.5rem';
                        else if (monthData.isEnd) borderRadius = '0 0.5rem 0.5rem 0';

                        return (
                          <td
                            key={monthIndex}
                            className="px-0 py-4 text-center border-r border-slate-100 last:border-r-0 align-middle relative group h-[60px]"
                            onMouseEnter={(e) => handleCellMouseEnter(e, row, monthData)}
                            onMouseLeave={handleCellMouseLeave}
                            onMouseMove={(e) => {
                              setTooltipPosition({
                                x: e.clientX,
                                y: e.clientY
                              });
                              handleCellMouseMove(e);
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center px-0.5">
                              {monthData.hasTask ? (
                                <div
                                  className="w-full h-12 flex items-center justify-center text-[11px] font-bold text-white shadow-sm transition-all duration-200 hover:brightness-110 cursor-pointer relative z-10"
                                  style={{
                                    backgroundColor: taskColor,
                                    borderRadius: borderRadius,
                                    marginLeft: monthData.isStart ? '4px' : '0',
                                    marginRight: monthData.isEnd ? '4px' : '0',
                                    width: (monthData.isStart || monthData.isEnd) ? 'calc(100% - 4px)' : '100%'
                                  }}
                                >
                                  {monthData.isStart && monthData.isEnd
                                    ? 'Target'
                                    : monthData.isStart
                                      ? 'Start'
                                      : monthData.isEnd
                                        ? 'End'
                                        : ''}
                                </div>
                              ) : (
                                <div className="w-1.5 h-1.5 bg-slate-100 rounded-full mx-auto" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Topics Tooltip */}
          {hoveredCell && hoveredCell.task && (() => {
            const cacheKey = `${hoveredCell.row.skill}_${hoveredCell.task.start}_${hoveredCell.task.end}`;
            const topics = topicsCache[cacheKey];
            const monthTopics = topics && topics[hoveredCell.month] ? topics[hoveredCell.month] : [];
            const isLoading = loadingTopics[cacheKey];

            if (!monthTopics.length && !isLoading) return null;

            // Get task color for the tooltip
            const rowIndex = generateSkillPlan.findIndex(r => r.id === hoveredCell.row.id);
            const taskColor = getTaskColor(
              { type: hoveredCell.row.type.toLowerCase().replace(' ', '-') },
              rowIndex >= 0 ? rowIndex : 0
            );

            const tooltipWidth = 320;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const gap = 12; // Fixed small gap between cursor and tooltip (consistent for all roles)

            // Always position tooltip relative to cursor using transform
            // This ensures consistent positioning regardless of scroll or container position
            let x = tooltipPosition.x;
            let y = tooltipPosition.y;

            // Default: position above cursor, centered horizontally
            let transformX = '-50%';
            let transformY = `calc(-100% - ${gap}px)`;

            // Check horizontal boundaries
            const halfWidth = tooltipWidth / 2;
            const margin = 10;

            if (x - halfWidth < margin) {
              // Too close to left edge - shift right
              const shift = margin - (x - halfWidth);
              x = x + shift;
              transformX = `calc(-100% + ${shift}px)`;
            } else if (x + halfWidth > viewportWidth - margin) {
              // Too close to right edge - shift left
              const shift = (x + halfWidth) - (viewportWidth - margin);
              x = x - shift;
              transformX = `calc(-100% - ${shift}px)`;
            }

            // Check vertical space (estimate tooltip height ~220px)
            const estimatedHeight = 220;
            if (y - estimatedHeight - gap < margin) {
              // Not enough space above, show below cursor
              transformY = `${gap}px`;
              // Ensure it doesn't go off bottom
              if (y + estimatedHeight + gap > viewportHeight - margin) {
                y = viewportHeight - estimatedHeight - gap - margin;
              }
            }

            const transform = `translate(${transformX}, ${transformY})`;

            return (
              <div
                className="fixed z-50 rounded-lg border-2 shadow-2xl pointer-events-none"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${tooltipWidth}px`,
                  opacity: 1,
                  backgroundColor: taskColor,
                  borderColor: taskColor,
                  filter: 'brightness(0.85)',
                  transform: transform,
                  transition: 'none'
                }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/30">
                    <BookOpen className="h-4 w-4 text-white" />
                    <h4 className="text-sm font-bold text-white">
                      Topics for {hoveredCell.row.skill}
                    </h4>
                  </div>
                  <div className="text-xs font-medium text-white/90 mb-3">
                    Month {hoveredCell.month} ({getMonthInfo(labels[hoveredCell.month - 1] || `Month ${hoveredCell.month}`, hoveredCell.month - 1).name})
                  </div>
                  {isLoading ? (
                    <div className="text-sm text-white/80 text-center py-4">
                      Loading topics...
                    </div>
                  ) : monthTopics.length > 0 ? (
                    <ul className="space-y-2">
                      {monthTopics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white">
                          <span className="text-white mt-1.5 font-bold">•</span>
                          <span className="flex-1">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-white/80 text-center py-4">
                      No topics available for this month
                    </div>
                  )}
                </div>
              </div>
            );
          })()}



          {/* Monthly Plan Section - Fixed View */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Monthly Learning Plan</h3>
            </div>

            <div className="space-y-6">
              {generateSkillPlan.map((row, rowIndex) => {
                const cacheKey = `${row.skill}_${row.task.start}_${row.task.end}`;
                const topics = topicsCache[cacheKey];
                const isLoading = loadingTopics[cacheKey];
                const taskColor = getTaskColor(
                  { type: row.type.toLowerCase().replace(' ', '-') },
                  rowIndex
                );

                if (!topics && !isLoading) {
                  // Trigger fetch if not loading
                  if (row.task.start && row.task.end) {
                    fetchTopics(row.skill, row.task.start, row.task.end);
                  }
                }

                return (
                  <div key={row.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full shadow-sm"
                        style={{ backgroundColor: taskColor }}
                      />
                      <h4 className="text-base font-bold text-slate-900">{row.skill}</h4>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide px-2 py-1 bg-slate-200 rounded">
                        {row.type}
                      </span>
                      <span className="text-xs text-slate-600 ml-auto">
                        Months {row.task.start} - {row.task.end}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="text-sm text-slate-500 text-center py-4">
                        Loading topics...
                      </div>
                    ) : topics && Object.keys(topics).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: totalMonths }, (_, i) => {
                          const monthNum = i + 1;
                          const monthTopics = topics[monthNum] || [];
                          const isInRange = monthNum >= (row.task.start || 0) && monthNum <= (row.task.end || 0);
                          const monthInfo = getMonthInfo(labels[i] || `Month ${monthNum}`, i);

                          if (!isInRange || monthTopics.length === 0) return null;

                          return (
                            <div key={monthNum} className="rounded-lg border border-slate-200 bg-white p-4">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                                <Calendar className="h-4 w-4 text-indigo-600" />
                                <h5 className="text-sm font-semibold text-slate-900">
                                  {monthInfo.name} (M{monthNum})
                                </h5>
                              </div>
                              <ul className="space-y-2">
                                {monthTopics.map((topic, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-indigo-600 mt-1.5 flex-shrink-0">•</span>
                                    <span className="flex-1">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 text-center py-4">
                        Topics will be loaded shortly...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
