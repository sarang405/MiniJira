import React from 'react';
import { useQuery } from '@tanstack/react-query'; 
import { Badge, Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBarChart2, FiCheckCircle, 
  FiAlertCircle, FiUsers, FiArrowUpRight
} from 'react-icons/fi';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip 
} from 'recharts';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const themeBlue = "#2563eb"; 

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/projects/summary/').then(res => res.data),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get('/projects/').then(res => res.data),
  });

  const allProjects = [
    ...(projectsData?.my_projects || []), 
    ...(projectsData?.joined_projects || [])
  ];

  const pieData = [
    { name: 'Done', v: stats?.completed || 0, color: '#10b981' },
    { name: 'In Progress', v: stats?.in_progress || 0, color: '#3b82f6' },
    { name: 'Overdue', v: stats?.overdue || 0, color: '#ef4444' },
  ];

  if (statsLoading || projectsLoading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="xl" color="info" />
      <div className="text-blue-600 font-black animate-pulse text-lg md:text-xl uppercase tracking-widest text-center px-4">
        Syncing Your Workspace...
      </div>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-4 md:px-0">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatusCard icon={<FiBarChart2 />} label="My Projects" value={stats?.total_projects || 0} change="Active" sub="Joined & Created" color="text-blue-600" />
        <StatusCard icon={<FiUsers />} label="Active Users" value={stats?.active_users || 0} change="+2" sub="Collaborators" color="text-purple-500" />
        <StatusCard icon={<FiCheckCircle />} label="My Tasks Done" value={stats?.completed || 0} change="Live" sub="Across your projects" color="text-green-500" />
        <StatusCard icon={<FiAlertCircle />} label="My Overdue" value={stats?.overdue || 0} change="Alert" sub="Requires attention" color="text-red-500" />
      </div>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Recent Projects</h2>
          <button 
            onClick={() => navigate('/my-projects')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-5 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
          >
            Explore All <FiArrowUpRight />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {allProjects.length > 0 ? (
            allProjects.slice(0, 3).map((p) => (
              <ProjectCard 
                key={p.id}
                id={p.id}
                name={p.title}
                description={p.description}
                deadline={p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}
                progress={p.progress_percentage || 0}
                status={p.status}
                type={p.created_by?.id === stats?.user_id ? 'personal' : 'joined'}
              />
            ))
          ) : (
            <div className="col-span-full py-16 md:py-20 text-center bg-white/50 rounded-[1rem] md:rounded-[1rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic px-4">No projects found. Create one to get started!</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
        
        <div className="bg-white p-6 md:p-10 rounded-[1rem] md:rounded-[1rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 text-center sm:text-left">Project Health</h3>
          <div className="flex-grow relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius="65%" outerRadius="90%" dataKey="v" paddingAngle={5}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl md:text-2xl font-black text-gray-900">{stats?.completed || 0}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Done</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 text-[10px] font-black uppercase">
            {pieData.map((d, i) => (
              <div key={`pie-legend-${i}`} className="flex flex-col items-center gap-1 text-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-gray-400 truncate w-full">{d.name}</span>
                <span className="text-gray-900 text-sm">{d.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 md:p-10 rounded-[1rem] md:rounded-[1.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col h-full">
          <h3 className="text-xl md:text-2xl font-black text-white mb-8 md:mb-10 relative z-10 text-center sm:text-left">Monthly Growth</h3>
          <div className="flex-grow min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{m:'Jan', v:4}, {m:'Feb', v:7}, {m:'Mar', v:stats?.total_projects || 0}]}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                <Bar dataKey="v" fill={themeBlue} radius={[10, 10, 10, 10]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ icon, label, value, change, sub, color }) => (
  <div className="bg-white p-5 md:p-7 rounded-[1rem] md:rounded-[1.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 ${color} text-xl md:text-2xl shadow-inner`}>{icon}</div>
      <Badge color={change === 'Alert' ? 'failure' : 'success'} size="sm" className="font-bold">
        {change}
      </Badge>
    </div>
    <div className="text-[10px] md:text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
    <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-[9px] md:text-[10px] font-medium text-slate-400">{sub}</div>
  </div>
);

export default Dashboard;