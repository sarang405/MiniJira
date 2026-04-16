import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMessageCircle, FiCalendar, FiUser, FiTrash2 } from 'react-icons/fi';
import api from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';

const ProjectCard = ({ id, name, description, deadline, status, progress, type, joined_at }) => {
  const workspacePath = `/projects/${id}/board`;
  const queryClient = useQueryClient();

  const handleDelete = async (e) => {
    e.preventDefault(); 
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/projects/${id}/`);
        queryClient.invalidateQueries(['joined-projects']);
        queryClient.invalidateQueries(['projects']);
      } catch (err) {
        alert("Failed to delete project. You might not have permission.");
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_15px_40px_rgba(8,112,184,0.08)] transition-all duration-500 group relative flex flex-col h-full">
      
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
          status === 'In Progress' ? 'bg-cyan-50 text-cyan-500' : 'bg-indigo-50 text-indigo-600'
        }`}>
          {type === 'joined' ? 'Collaborator' : (status || 'Admin')}
        </span>
        
        {type !== 'joined' && (
          <button 
            onClick={handleDelete}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Project"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex-grow">
        <Link to={workspacePath} className="block mb-2">
          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate tracking-tight">
            {name}
          </h3>
        </Link>
        
        <p className="text-xs font-medium text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {description || "No description provided for this workspace."}
        </p>

        <div className="grid grid-cols-1 gap-2 mb-6">
          <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 rounded-lg w-fit">
            <FiCalendar size={12} className="text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-tight text-slate-500">
              {type === 'joined' ? `Since: ${joined_at || 'Recent'}` : `Due: ${deadline}`}
            </span>
          </div>
          {type !== 'joined' && (
            <div className="flex items-center gap-2 py-1.5 px-3 bg-indigo-50/50 rounded-lg w-fit">
              <FiUser size={12} className="text-indigo-500" />
              <span className="text-[9px] font-black uppercase tracking-tight text-indigo-600">Owner: You</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-[10px] font-black text-indigo-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-lg h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-1.5 rounded-lg transition-all duration-1000 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="flex -space-x-2.5">
          {[1, 2].map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-8 rounded-lg bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow-sm">
            +3
          </div>
        </div>

        <div className="flex gap-2">
          {type === 'joined' && (
            <button className="p-3 text-slate-400 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <FiMessageCircle size={18} />
            </button>
          )}
          
          <Link 
            to={workspacePath}
            className="p-3 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 hover:-translate-y-0.5 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center group/btn"
          >
            <FiArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;