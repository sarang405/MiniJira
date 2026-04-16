import React from 'react';
import { useParams, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPieChart, FiLayout, FiList, FiArrowLeft, FiGrid, FiTarget, FiLayers } from 'react-icons/fi';
import api from '../../api/axios';

import InviteMember from '../../components/InviteMember'; 

import { Tooltip } from "flowbite-react";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ 
    queryKey: ['profile'], 
    queryFn: () => api.get('/accounts/profile/').then(res => res.data) 
  });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}/`).then(res => res.data),
    refetchOnWindowFocus: true 
  });

  const refreshProject = () => {
    queryClient.invalidateQueries(['project', id]);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 md:p-10 text-center flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">Workspace Unavailable</h2>
      <button onClick={() => navigate('/dashboard')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200">
        Back to Dashboard
      </button>
    </div>
  );

  const isAdmin = project.created_by.id === user?.id;

  const navItems = [
    { name: 'Summary', path: 'summary', icon: <FiTarget /> },
    { name: 'Backlog', path: 'backlog', icon: <FiLayers /> },
    { name: 'Board', path: 'board', icon: <FiGrid /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-5 md:p-6">
      <div className="max-w-[1600px] mx-auto bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm shadow-slate-200/50 flex flex-col min-h-[calc(100vh-3rem)] overflow-hidden">
        
        <header className="px-6 sm:px-8 md:px-10 pt-6 md:pt-10 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="group p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-300 shrink-0 shadow-sm"
                aria-label="Go back"
              >
                <FiArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.25rem] md:rounded-[1.5rem] shadow-xl shadow-blue-200 flex items-center justify-center text-white font-black text-xl md:text-2xl shrink-0 border-4 border-white">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {project.name}
                    </h1>
                    {isAdmin && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Team Workspace</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-5">
              <div className="flex -space-x-3">
                {project.members?.slice(0, 4).map((m, index) => (
                  <Tooltip key={index} content={m.user.username}>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 border-[3px] border-white text-white flex items-center justify-center text-[10px] md:text-xs font-black cursor-pointer uppercase shadow-sm">
                      {m.user.username.slice(0, 2)}
                    </div>
                  </Tooltip>
                ))}
                {project.members?.length > 4 && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 border-[3px] border-white text-slate-400 flex items-center justify-center text-[10px] md:text-xs font-black shadow-sm">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex shrink-0">
                  <InviteMember 
                    projectId={id} 
                    projectName={project.name} 
                  />
                </div>
              )}
            </div>
          </div>

          <nav className="flex gap-8 md:gap-12 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-2.5 pb-5 text-[11px] md:text-xs font-black transition-all border-b-[3px] tracking-widest uppercase whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-100'
                  }`
                }
              >
                <span className="text-lg md:text-xl">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 bg-white">
            <Outlet context={{ project, user, isAdmin, refreshProject }} />
        </main>
      </div>
    </div>
  );
};

export default ProjectWorkspace;