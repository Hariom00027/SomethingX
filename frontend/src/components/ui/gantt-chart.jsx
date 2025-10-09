import React from 'react';

const GanttChart = ({ data, totalMonths }) => {
  if (!data || !data.tasks) {
    return <div>No data available for Gantt chart</div>;
  }

  const { tasks, labels } = data;
  
  // Calculate the width of each month column
  const monthWidth = 100 / totalMonths;
  
  // Get unique task types for color coding
  const taskTypes = [...new Set(tasks.map(task => task.type))];
  const typeColors = {
    technical: 'bg-blue-500',
    soft: 'bg-green-500',
    certification: 'bg-yellow-500',
    project: 'bg-purple-500'
  };

  return (
    <div className="gantt-chart-container overflow-x-auto">
      <div className="min-w-full">
        {/* Header with month labels */}
        <div className="flex border-b-2 border-gray-300 mb-4">
          <div className="w-48 flex-shrink-0 p-2 font-semibold border-r border-gray-300">
            Skills & Tasks
          </div>
          {labels.map((label, index) => (
            <div 
              key={index}
              className="flex-shrink-0 p-2 text-center border-r border-gray-300 font-medium"
              style={{ width: `${monthWidth}%` }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Task rows */}
        {tasks.map((task, index) => {
          const startPosition = ((task.start - 1) / totalMonths) * 100;
          const taskWidth = ((task.end - task.start + 1) / totalMonths) * 100;
          
          return (
            <div key={task.id} className="flex items-center border-b border-gray-200 py-2">
              {/* Task name */}
              <div className="w-48 flex-shrink-0 p-2 border-r border-gray-300">
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 ${typeColors[task.type] || 'bg-gray-500'}`}
                  ></div>
                  <span className="text-sm font-medium">{task.name}</span>
                </div>
              </div>
              
              {/* Timeline area */}
              <div className="flex-1 relative h-8">
                {/* Background grid */}
                <div className="absolute inset-0 flex">
                  {labels.map((_, monthIndex) => (
                    <div 
                      key={monthIndex}
                      className="border-r border-gray-200"
                      style={{ width: `${monthWidth}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Task bar */}
                <div 
                  className={`absolute top-1 h-6 rounded ${typeColors[task.type] || 'bg-gray-500'} opacity-80 flex items-center justify-center`}
                  style={{
                    left: `${startPosition}%`,
                    width: `${taskWidth}%`
                  }}
                  title={task.description || `${task.name} (${task.start}-${task.end})`}
                >
                  <span className="text-xs text-white font-medium px-1">
                    {task.start}-{task.end}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Technical Skills</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Soft Skills</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Certifications</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Projects & Internships</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

