import React, { useState } from 'react';

const GanttChart = ({ data, totalMonths }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (!data || !data.tasks) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for Gantt chart
      </div>
    );
  }

  const { tasks, labels } = data;
  
  // Calculate the width of each month column
  const monthWidth = 100 / totalMonths;
  
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

  return (
    <div className="gantt-chart-container overflow-x-auto bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="min-w-full">
        {/* Header with month labels */}
        <div className="flex border-b-2 border-gray-300 mb-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="w-48 flex-shrink-0 p-3 font-semibold border-r border-gray-300 text-gray-700 bg-gray-50">
            Skills & Tasks
          </div>
          {labels.map((label, index) => {
            const monthInfo = getMonthInfo(label, index);
            return (
              <div 
                key={index}
                className="flex-shrink-0 p-2 text-center border-r border-gray-300 font-medium text-sm text-gray-700 hover:bg-blue-50 transition-colors cursor-help relative group"
                style={{ width: `${monthWidth}%` }}
                onMouseEnter={() => setHoveredMonth(monthInfo)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                <div className="font-semibold">{monthInfo.name}</div>
                <div className="text-xs text-gray-500">M{monthInfo.number}</div>
                {hoveredMonth && hoveredMonth.number === monthInfo.number && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                    {monthInfo.fullLabel}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Task rows */}
        <div className="space-y-0">
          {tasks.map((task, index) => {
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
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                {/* Task name */}
                <div className="w-48 flex-shrink-0 p-2 border-r border-gray-300 bg-gray-50">
                  <div className="flex items-center">
                    <div 
                      className="w-3.5 h-3.5 rounded-full mr-3 shadow-sm transition-transform hover:scale-110 flex-shrink-0"
                      style={{ backgroundColor: taskColor }}
                    ></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate">{task.name}</span>
                      {skillTypeLabel && (
                        <span className="text-xs text-gray-500">{skillTypeLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Timeline area */}
                <div className="flex-1 relative h-10">
                  {/* Background grid */}
                  <div className="absolute inset-0 flex">
                    {labels.map((_, monthIndex) => {
                      const monthInfo = getMonthInfo(labels[monthIndex], monthIndex);
                      const isInTask = isMonthInTask(monthIndex, task);
                      return (
                        <div 
                          key={monthIndex}
                          className="border-r border-gray-200 relative"
                          style={{ width: `${monthWidth}%` }}
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
                    title={`${task.name}: ${task.start}-${task.end} months`}
                  >
                    <span className="text-xs text-white font-bold px-2 drop-shadow-md">
                      {task.start}-{task.end}
                    </span>
                    {isHovered && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-xs rounded-lg px-4 py-3 whitespace-nowrap shadow-2xl z-50 border border-gray-700 min-w-max">
                        <div className="font-bold mb-1.5 text-sm">{task.name}</div>
                        <div className="text-gray-300 text-xs mb-1.5">
                          Duration: Months {task.start} - {task.end} ({task.end - task.start + 1} months)
                        </div>
                        {skillTypeLabel && (
                          <div className="text-gray-400 text-xs mb-1">
                            Type: <span className="text-gray-300 font-medium">{skillTypeLabel}</span>
                          </div>
                        )}
                        {task.difficulty && (
                          <div className="text-gray-400 text-xs mb-1">
                            Difficulty: <span className="text-gray-300 font-medium capitalize">{task.difficulty}</span>
                          </div>
                        )}
                        {task.importance && (
                          <div className="text-gray-400 text-xs mb-1">
                            Importance: <span className="text-gray-300 font-medium">{task.importance}</span>
                          </div>
                        )}
                        {task.description && (
                          <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700 max-w-xs">
                            {task.description}
                          </div>
                        )}
                        {/* Arrow pointing down */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-gray-400 rounded"></div>
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
                className="flex items-center bg-gradient-to-r from-gray-50 to-white px-3 py-2 rounded-lg hover:from-gray-100 hover:to-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full mr-2.5 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: taskColor }}
                ></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">{task.name}</span>
                  {skillTypeLabel && (
                    <span className="text-xs text-gray-500">{skillTypeLabel}</span>
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
