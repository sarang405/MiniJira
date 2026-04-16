import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Progress } from 'flowbite-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FiClock, FiCheckCircle, FiAlertCircle, FiActivity, FiUsers } from 'react-icons/fi';
import api from '../../api/axios';

const ProjectSummary = () => {
  const { project } = useOutletContext();
  const [activities, setActivities] = useState([]);

  const fetchActivities = async () => {
    if (!project?.id) return;
    

    try {
      const res = await api.get(`/issues/activities/?project=${project.id}`);
      setActivities(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load activities");
    }
  };

  useEffect(() => {
    if (project?.id) fetchActivities();
  }, [project]);

  const tasks = project.tasks || [];
  const statusData = [
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#2563eb' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#dbeafe' },
  ].filter(item => item.value > 0);

  const chartData = statusData.length > 0 ? statusData : [{ name: 'Empty', value: 1, color: '#f1f5f9' }];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-slate-900 text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
               Status overview
            </h3>
            
            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
              <div className="relative w-52 h-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black text-slate-900">{project.issue_count || 0}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                </div>
              </div>

              <div className="flex-1 w-full space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Progress</p>
                      <p className="text-2xl font-black text-slate-900">{project.progress_percentage || 0}%</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Active</span>
                  </div>
                  <Progress 
                    progress={project.progress_percentage || 0} 
                    color="blue" 
                    size="lg" 
                    className="rounded-full h-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-blue-50/30 rounded-3xl border border-blue-50">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-black text-slate-900">{tasks.filter(t => t.status === 'done').length}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                    <p className="text-2xl font-black text-slate-900">
                      {(project.issue_count || 0) - tasks.filter(t => t.status === 'done').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<FiUsers />} label="Members" value={project.members?.length || 0} color="text-blue-500" bg="bg-blue-50" />
            <StatCard icon={<FiClock />} label="Deadline" value={project.deadline || 'No Date'} color="text-orange-500" bg="bg-orange-50" isSmall />
            <StatCard icon={<FiAlertCircle />} label="High Priority" value={tasks.filter(t => t.priority === 'high').length} color="text-red-500" bg="bg-red-50" />
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-slate-900 text-sm font-black uppercase tracking-widest flex items-center gap-3">
              <FiActivity className="text-blue-600" size={18} /> Activity
            </h3>
            <button className="text-[9px] font-black text-blue-600 uppercase hover:tracking-tighter transition-all">Full Log</button>
          </div>

          <div className="space-y-8">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity, idx) => (
                <div key={activity.id} className="flex gap-4 relative group">
                  {idx !== activities.slice(0, 6).length - 1 && (
                    <div className="absolute left-[15px] top-10 bottom-[-2rem] w-[2px] bg-slate-50"></div>
                  )}

                  <div className="w-8 h-8 shrink-0 bg-slate-900 rounded-xl text-white flex items-center justify-center text-[10px] font-black z-10 shadow-lg shadow-slate-200">
                    {activity.user_detail?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      <span className="text-slate-900 font-black">{activity.user_detail?.username || 'User'}</span>
                      {" "}{activity.description}
                    </p>
                    <p className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-tight">
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-4">
                  <FiActivity className="text-slate-200" size={28} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent updates</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bg, isSmall }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`${isSmall ? 'text-sm' : 'text-xl'} font-black text-slate-900`}>{value}</p>
    </div>
  </div>
);

export default ProjectSummary;