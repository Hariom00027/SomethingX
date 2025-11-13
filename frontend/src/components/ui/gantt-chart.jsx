import React, { useState, useMemo } from 'react';

const GanttChart = ({ data, totalMonths }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredTaskInfo, setHoveredTaskInfo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!data || !data.tasks) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for Gantt chart
      </div>
    );
  }

  const { tasks, labels } = data;
  
  // Separate technical and non-technical skills
  const { technicalTasks, nonTechnicalTasks } = useMemo(() => {
    const technical = tasks.filter(task => task.type === 'technical');
    const nonTechnical = tasks.filter(task => task.type === 'non-technical');
    return { technicalTasks: technical, nonTechnicalTasks: nonTechnical };
  }, [tasks]);
  
  // Calculate the width of each month column - ensure it fills the container
  // Use a fixed pixel width for the Skills & Tasks column (12rem = 192px)
  const skillsColumnWidth = 192; // 12rem in pixels
  const monthWidth = `calc((100% - ${skillsColumnWidth}px) / ${totalMonths})`;
  
  // Generate colors based on skill type
  const generateTaskColor = (task, index, totalTasks) => {
    // Use different color schemes for technical vs non-technical skills
    if (task.type === 'non-technical') {
      // Non-technical skills: use green/teal tones
      const hue = 160 + (index % 3) * 10; // Green to teal range
      const saturation = 60 + (index % 2) * 10;
      const lightness = 45 + (index % 2) * 5;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else if (task.type === 'technical') {
      // Technical skills: use blue/purple tones
      const hue = 220 + (index % 3) * 15; // Blue to purple range
      const saturation = 65 + (index % 3) * 5;
      const lightness = 50 + (index % 2) * 5;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    } else {
      // Project phase or other: use orange/red tones
      const hue = (index * 360 / totalTasks) % 360;
      const saturation = 65 + (index % 3) * 5;
      const lightness = 50 + (index % 2) * 5;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
  };

  // Get month name from label (e.g., "Month 1" -> "Month 1" or extract month number)
  const getMonthInfo = (label, index) => {
    const monthNum = index + 1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Calculate which month of the year (assuming starting from current month or Jan)
    const monthIndex = (monthNum - 1) % 12;
    return {
      number: monthNum,
      name: monthNames[monthIndex],
      fullLabel: label
    };
  };

  // Check if a month is within a task's range
  const isMonthInTask = (monthIndex, task) => {
    const monthNum = monthIndex + 1;
    return monthNum >= task.start && monthNum <= task.end;
  };

  // Render a task row
  const renderTaskRow = (task, index, isTechnical) => {
    const startPosition = ((task.start - 1) / totalMonths) * 100;
    const taskWidth = ((task.end - task.start + 1) / totalMonths) * 100;
    const taskColor = generateTaskColor(task, index, tasks.length);
    const isHovered = hoveredTask === task.id;
    const skillTypeLabel = task.type === 'technical' ? 'Technical' : 
                          task.type === 'non-technical' ? 'Non-Technical' : 
                          task.type === 'project' ? 'Project' : '';
    
    return (
      <div 
        key={task.id} 
        className="flex items-center border-b border-gray-200 py-2.5 hover:bg-gray-50 transition-colors"
        onMouseEnter={(e) => {
          setHoveredTask(task.id);
          setHoveredTaskInfo({ task, monthInfo: null });
          setTooltipPosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseMove={(e) => {
          setTooltipPosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => {
          setHoveredTask(null);
          setHoveredTaskInfo(null);
        }}
      >
        {/* Task name - Fixed width for alignment */}
        <div className="w-48 flex-shrink-0 p-2 border-r-2 border-gray-300 bg-gray-50">
          <div className="flex items-center">
            <div 
              className="w-3.5 h-3.5 rounded-full mr-3 shadow-sm transition-transform hover:scale-110 flex-shrink-0"
              style={{ backgroundColor: taskColor }}
            ></div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-gray-800 truncate">{task.name}</span>
              {skillTypeLabel && (
                <span className="text-xs text-gray-500">{skillTypeLabel}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Timeline area */}
        <div className="flex-1 relative h-10 min-w-0">
          {/* Background grid */}
          <div className="absolute inset-0 flex">
            {labels.map((_, monthIndex) => {
              const monthInfo = getMonthInfo(labels[monthIndex], monthIndex);
              const isInTask = isMonthInTask(monthIndex, task);
              return (
                <div 
                  key={monthIndex}
                  className="border-r border-gray-200 relative flex-shrink-0 flex-grow"
                  style={{ flexBasis: 0 }}
                  onMouseEnter={(e) => {
                    if (isInTask) {
                      setHoveredTask(task.id);
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
                      setHoveredTaskInfo(prev => prev ? { ...prev, monthInfo: null } : null);
                    }
                  }}
                >
                  {isInTask && (
                    <div className="absolute inset-0 bg-opacity-5" style={{ backgroundColor: taskColor }}></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Task bar - end-to-end aligned */}
          <div 
            className={`absolute top-0 h-10 rounded flex items-center justify-center transition-all duration-200 ${
              isHovered ? 'ring-2 ring-offset-1 ring-gray-400' : ''
            }`}
            style={{
              left: `${startPosition}%`,
              width: `${taskWidth}%`,
              backgroundColor: taskColor,
              transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
              zIndex: isHovered ? 20 : 1,
              boxShadow: isHovered ? `0 4px 12px ${taskColor}60` : '0 2px 6px rgba(0,0,0,0.15)',
              border: isHovered ? `2px solid ${taskColor}` : 'none'
            }}
          >
            <span className="text-xs text-white font-bold px-2 drop-shadow-md">
              {task.start}-{task.end}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="gantt-chart-container bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full" style={{ width: '100%' }}>
          {/* Header with month labels */}
          <div className="flex border-b-2 border-gray-300 mb-2 bg-gradient-to-r from-gray-50 via-blue-50 to-gray-100 rounded-t-lg sticky top-0 z-10">
            <div className="w-48 flex-shrink-0 p-3 font-bold border-r-2 border-gray-400 text-gray-800 bg-gradient-to-br from-gray-100 to-gray-50">
              Skills & Tasks
            </div>
            <div className="flex" style={{ width: `calc(100% - ${skillsColumnWidth}px)` }}>
              {labels.map((label, index) => {
                const monthInfo = getMonthInfo(label, index);
                return (
                  <div 
                    key={index}
                    className="flex-shrink-0 flex-grow p-2 text-center border-r border-gray-300 font-semibold text-sm text-gray-700 hover:bg-blue-100 transition-all duration-200 cursor-help relative group"
                    style={{ flexBasis: 0 }}
                  >
                    <div className="font-bold text-gray-800">{monthInfo.name}</div>
                    <div className="text-xs text-gray-600 font-medium">M{monthInfo.number}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Skills Section */}
          {technicalTasks.length > 0 && (
            <>
              <div className="flex border-b-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="w-48 flex-shrink-0 p-2 border-r-2 border-blue-300 bg-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                    <span className="text-sm font-bold text-blue-900">Technical Skills</span>
                  </div>
                </div>
                <div className="flex-1"></div>
              </div>
              <div className="space-y-0">
                {technicalTasks.map((task, index) => renderTaskRow(task, index, true))}
              </div>
            </>
          )}

          {/* Non-Technical Skills Section */}
          {nonTechnicalTasks.length > 0 && (
            <>
              <div className="flex border-b-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="w-48 flex-shrink-0 p-2 border-r-2 border-emerald-300 bg-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                    <span className="text-sm font-bold text-emerald-900">Non-Technical Skills</span>
                  </div>
                </div>
                <div className="flex-1"></div>
              </div>
              <div className="space-y-0">
                {nonTechnicalTasks.map((task, index) => renderTaskRow(task, index, false))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Unified Hover Tooltip */}
      {hoveredTaskInfo && hoveredTaskInfo.task && (
        <div className="fixed bg-gray-900 text-white text-xs rounded-lg px-4 py-3 shadow-2xl z-50 border border-gray-700 pointer-events-none"
             style={{
               left: `${tooltipPosition.x + 15}px`,
               top: `${tooltipPosition.y - 10}px`,
               minWidth: '250px',
               maxWidth: '400px',
               transform: 'translateY(-100%)'
             }}>
          <div className="font-bold mb-2 text-sm text-white">{hoveredTaskInfo.task.name}</div>
          {hoveredTaskInfo.monthInfo && (
            <div className="text-gray-300 text-xs mb-2 pb-2 border-b border-gray-700">
              <span className="font-semibold">Month:</span> {hoveredTaskInfo.monthInfo.fullLabel}
            </div>
          )}
          <div className="text-gray-300 text-xs mb-1.5">
            <span className="font-semibold">Duration:</span> Months {hoveredTaskInfo.task.start} - {hoveredTaskInfo.task.end} ({hoveredTaskInfo.task.end - hoveredTaskInfo.task.start + 1} months)
          </div>
          {hoveredTaskInfo.task.type && (
            <div className="text-gray-400 text-xs mb-1">
              <span className="font-semibold">Type:</span> <span className="text-gray-300 font-medium capitalize">{hoveredTaskInfo.task.type === 'technical' ? 'Technical' : hoveredTaskInfo.task.type === 'non-technical' ? 'Non-Technical' : hoveredTaskInfo.task.type}</span>
            </div>
          )}
          {hoveredTaskInfo.task.difficulty && (
            <div className="text-gray-400 text-xs mb-1">
              <span className="font-semibold">Difficulty:</span> <span className="text-gray-300 font-medium capitalize">{hoveredTaskInfo.task.difficulty}</span>
            </div>
          )}
          {hoveredTaskInfo.task.importance && (
            <div className="text-gray-400 text-xs mb-1">
              <span className="font-semibold">Importance:</span> <span className="text-gray-300 font-medium">{hoveredTaskInfo.task.importance}</span>
            </div>
          )}
          {hoveredTaskInfo.task.description && (
            <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
              {hoveredTaskInfo.task.description}
            </div>
          )}
        </div>
      )}


      {/* Legend */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300">
        <h3 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
          Task Legend
        </h3>
        <div className="flex flex-wrap gap-3">
          {tasks.map((task, index) => {
            const taskColor = generateTaskColor(task, index, tasks.length);
            const skillTypeLabel = task.type === 'technical' ? 'Technical' : 
                                  task.type === 'non-technical' ? 'Non-Technical' : 
                                  task.type === 'project' ? 'Project' : '';
            return (
              <div 
                key={task.id}
                className="flex items-center bg-gradient-to-r from-gray-50 via-white to-gray-50 px-4 py-2.5 rounded-xl hover:from-gray-100 hover:via-white hover:to-gray-100 transition-all duration-200 border-2 border-gray-200 hover:border-gray-400 shadow-md hover:shadow-lg"
              >
                <div 
                  className="w-4 h-4 rounded-full mr-3 shadow-md flex-shrink-0 ring-2 ring-white"
                  style={{ backgroundColor: taskColor }}
                ></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-gray-800 font-semibold truncate max-w-[200px]">{task.name}</span>
                  {skillTypeLabel && (
                    <span className="text-xs text-gray-600 font-medium">{skillTypeLabel}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
