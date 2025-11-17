import React, { useState, useMemo } from 'react';
import { Layers, Timer, Target, Sparkles, Calendar } from 'lucide-react';

const GanttChart = ({ data, totalMonths = 6 }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredTaskInfo, setHoveredTaskInfo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
        gradient: 'from-blue-500/90 via-indigo-500/90 to-purple-500/90', 
        icon: Layers 
      },
      { 
        label: 'Avg Duration', 
        value: `${(totalDuration / tasks.length).toFixed(1)} mo`, 
        hint: 'per milestone', 
        gradient: 'from-fuchsia-500/90 via-violet-500/90 to-blue-500/90', 
        icon: Timer 
      },
      { 
        label: 'Longest Sprint', 
        value: longestTask ? `${longestTask.duration} mo` : '–', 
        hint: longestTask?.name || 'N/A', 
        gradient: 'from-emerald-500/90 via-teal-500/90 to-cyan-500/90', 
        icon: Target 
      },
      { 
        label: 'Timeline', 
        value: `${totalMonths} mo`, 
        hint: `${firstLabel} → ${lastLabel}`, 
        gradient: 'from-amber-500/90 via-orange-500/90 to-rose-500/90', 
        icon: Sparkles 
      }
    ];
  }, [tasks, labels, technicalTasks.length, nonTechnicalTasks.length, totalMonths]);

  // Generate task color based on type
  const getTaskColor = (task, index) => {
    const technicalColors = ['#4A90E2', '#50E3C2', '#F5A623', '#7ED321', '#BD10E0'];
    const nonTechnicalColors = ['#F8E71C', '#D0021B', '#9013FE', '#B8E986', '#4A4A4A'];

    if (task.type === 'non-technical') {
      return nonTechnicalColors[index % nonTechnicalColors.length];
    } else if (task.type === 'technical') {
      return technicalColors[index % technicalColors.length];
    }
    const hue = (index * 137.5) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  // Check if month is in task range
  const isMonthInTask = (monthIndex, task) => {
    const monthNum = monthIndex + 1;
    return monthNum >= (task.start ?? 0) && monthNum <= (task.end ?? 0);
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

  // Render task row
  const renderTaskRow = (task, index) => {
    if (!task || !task.start || !task.end) return null;
    
    const startPosition = ((task.start - 1) / totalMonths) * 100;
    const taskWidth = ((task.end - task.start + 1) / totalMonths) * 100;
    const taskColor = getTaskColor(task, index);
    const isHovered = hoveredTask === task.id;
    const typeLabel = task.type === 'technical' ? 'Technical' : 
                     task.type === 'non-technical' ? 'Non-Technical' : 
                     task.type || 'Task';
    
    return (
      <div
        key={task.id || index}
        className="group relative flex items-stretch overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
        onMouseEnter={() => setHoveredTask(task.id)}
        onMouseLeave={() => setHoveredTask(null)}
      >
        <div className="w-56 flex-shrink-0 border-r border-slate-200/70 bg-white/95 px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-3.5 w-3.5 rounded-full shadow-md ring-2 ring-white transition-transform duration-300 group-hover:scale-125"
              style={{ backgroundColor: taskColor }}
            />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">{task.name || 'Unnamed Task'}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{typeLabel}</span>
            </div>
          </div>
        </div>
        <div className="relative flex-1 min-w-0 py-6">
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-white/60" />
          <div className="absolute inset-0 flex">
            {labels.map((label, monthIndex) => {
              const isInTask = isMonthInTask(monthIndex, task);
              return (
                <div
                  key={monthIndex}
                  className="relative flex-1 border-r border-slate-200/60"
                  style={{ flexBasis: 0 }}
                  onMouseEnter={(e) => {
                    if (isInTask) {
                      const monthInfo = getMonthInfo(label, monthIndex);
                      setHoveredTaskInfo({ task, monthInfo });
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isInTask) {
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={() => {
                    if (isInTask) {
                      setHoveredTaskInfo(null);
                    }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-white/10 to-transparent" />
                  {isInTask && (
                    <div
                      className="absolute inset-[6px] rounded-lg"
                      style={{ backgroundColor: taskColor, opacity: 0.18 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div
            className={`absolute top-1/2 flex h-12 -translate-y-1/2 items-center justify-center rounded-xl px-3 text-xs font-semibold uppercase tracking-wide text-white transition-all duration-300 ${
              isHovered ? 'ring-2 ring-offset-1 ring-indigo-300 shadow-lg' : 'shadow-md'
            }`}
            style={{
              left: `${startPosition}%`,
              width: `${taskWidth}%`,
              backgroundColor: taskColor,
              zIndex: isHovered ? 20 : 1,
              transform: isHovered ? 'translateY(-50%) scale(1.03)' : 'translateY(-50%)'
            }}
          >
            {task.start}-{task.end}
          </div>
        </div>
      </div>
    );
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
    <div className="gantt-chart-container relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/70 via-sky-50/60 to-purple-50/50" />
      <div className="relative z-10 space-y-8">
        {/* Summary Cards */}
        {summaryCards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/85 p-5 shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{card.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
                      <p className="mt-3 text-sm font-medium text-white/80">{card.hint}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Gantt Chart */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/90 shadow-inner">
          <div className="inline-block min-w-full align-top">
            {/* Header */}
            <div className="sticky top-0 z-10 flex rounded-t-2xl border-b border-slate-200/80 bg-gradient-to-r from-slate-100 via-indigo-50 to-white">
              <div className="w-56 flex-shrink-0 border-r border-slate-200/70 px-4 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
                Skills & Milestones
              </div>
              <div className="flex flex-1">
                {labels.map((label, index) => {
                  const monthInfo = getMonthInfo(label, index);
                  return (
                    <div
                      key={index}
                      className="flex-1 border-r border-slate-200/60 px-3 py-3 text-center transition-all duration-200 hover:bg-indigo-50/60"
                    >
                      <div className="text-sm font-semibold text-slate-800">{monthInfo.name}</div>
                      <div className="text-xs font-medium text-slate-500">M{monthInfo.number}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Tasks */}
            {technicalTasks.length > 0 && (
              <>
                <div className="bg-gradient-to-r from-blue-900/10 via-blue-50/60 to-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-blue-900">
                  Technical Skills
                </div>
                <div className="space-y-3 px-4 py-4">
                  {technicalTasks.map((task, index) => renderTaskRow(task, index))}
                </div>
              </>
            )}

            {/* Non-Technical Tasks */}
            {nonTechnicalTasks.length > 0 && (
              <>
                <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-50/60 to-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-900">
                  Non-Technical Skills
                </div>
                <div className="space-y-3 px-4 py-4">
                  {nonTechnicalTasks.map((task, index) => renderTaskRow(task, index))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-inner">
          <h3 className="mb-5 flex items-center gap-3 text-base font-bold text-slate-900">
            <div className="h-5 w-1.5 rounded-full bg-gradient-to-b from-slate-500 to-slate-700" />
            Task Legend
          </h3>
          <div className="flex flex-wrap gap-3">
            {tasks.map((task, index) => {
              const taskColor = getTaskColor(task, index);
              const typeLabel = task.type === 'technical' ? 'Technical' : 
                              task.type === 'non-technical' ? 'Non-Technical' : 
                              task.type || 'Task';
              return (
                <div 
                  key={task.id || index}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white via-slate-50 to-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-lg"
                >
                  <div 
                    className="h-4 w-4 flex-shrink-0 rounded-full shadow-md ring-2 ring-white"
                    style={{ backgroundColor: taskColor }}
                  />
                  <div className="flex flex-col">
                    <span className="max-w-[200px] truncate text-sm font-semibold text-slate-900">{task.name || 'Unnamed Task'}</span>
                    <span className="text-xs font-medium text-slate-500">{typeLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTaskInfo && hoveredTaskInfo.task && (
        <div
          className="fixed z-50 w-[320px] max-w-[360px] rounded-2xl border border-white/10 bg-slate-950/95 px-6 py-4 text-sm text-white shadow-2xl backdrop-blur-lg"
          style={{
            left: `${tooltipPosition.x + 20}px`,
            top: `${tooltipPosition.y - 15}px`,
            transform: 'translateY(-100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="mb-3 text-base font-semibold">{hoveredTaskInfo.task.name}</div>
          {hoveredTaskInfo.monthInfo && (
            <div className="mb-3 border-b border-white/10 pb-3 text-sm text-white/80">
              <span className="font-semibold text-white">Month:</span> {hoveredTaskInfo.monthInfo.fullLabel}
            </div>
          )}
          <div className="mb-2 text-sm text-white/80">
            <span className="font-semibold text-white">Duration:</span> Months {hoveredTaskInfo.task.start} - {hoveredTaskInfo.task.end} ({hoveredTaskInfo.task.end - hoveredTaskInfo.task.start + 1} months)
          </div>
          {hoveredTaskInfo.task.type && (
            <div className="mb-2 text-sm text-white/70">
              <span className="font-semibold text-white">Type:</span> <span className="font-medium capitalize text-white/80">{hoveredTaskInfo.task.type}</span>
            </div>
          )}
          {hoveredTaskInfo.task.difficulty && (
            <div className="mb-2 text-sm text-white/70">
              <span className="font-semibold text-white">Difficulty:</span> <span className="font-medium capitalize text-white/80">{hoveredTaskInfo.task.difficulty}</span>
            </div>
          )}
          {hoveredTaskInfo.task.description && (
            <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/70">
              {hoveredTaskInfo.task.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GanttChart;
