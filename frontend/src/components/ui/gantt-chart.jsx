import React, { useMemo } from 'react';
import { Layers, Timer, Target, Sparkles, Calendar } from 'lucide-react';

const GanttChart = ({ data, totalMonths = 6 }) => {

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
      <div className="relative z-10">
        {/* Skill Development Plan Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/90 shadow-inner">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 via-indigo-50 to-white border-b border-slate-200/80">
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-700 border-r border-slate-200/70">
                  Skill
                </th>
                {labels.map((label, index) => {
                  const monthInfo = getMonthInfo(label, index);
                  return (
                    <th
                      key={index}
                      className="px-4 py-4 text-center text-sm font-semibold text-slate-800 border-r border-slate-200/60 last:border-r-0"
                    >
                      <div>{monthInfo.name}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">M{monthInfo.number}</div>
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
                    className={`border-b border-slate-200/60 transition-colors hover:bg-slate-50/50 ${
                      isTechnical ? 'bg-blue-50/30' : 'bg-emerald-50/30'
                    }`}
                  >
                    <td className="px-6 py-4 border-r border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{ backgroundColor: taskColor }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{row.skill}</div>
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{row.type}</div>
                        </div>
                      </div>
                    </td>
                    {row.months.map((monthData, monthIndex) => (
                      <td
                        key={monthIndex}
                        className="px-4 py-4 text-center border-r border-slate-200/60 last:border-r-0 align-middle"
                      >
                        {monthData.hasTask ? (
                          <div
                            className="inline-flex items-center justify-center min-w-[60px] px-3 py-2 rounded-lg text-xs font-medium text-white shadow-sm"
                            style={{ backgroundColor: taskColor }}
                          >
                            {monthData.isStart && monthData.isEnd
                              ? '✓'
                              : monthData.isStart
                              ? 'Start'
                              : monthData.isEnd
                              ? 'End'
                              : '●'}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Info */}
        {summaryCards.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      </div>
    </div>
  );
};

export default GanttChart;
