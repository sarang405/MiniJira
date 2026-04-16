import React, { useState } from 'react';
import api from '../api/axios';
import { X, FolderPlus, Loader2 } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name: formData.title,
      description: formData.description,
      deadline: formData.deadline || null,
    };

    try {
      const response = await api.post('/projects/', payload);
      onProjectCreated(response.data); 
      onClose(); 
      setFormData({ title: '', description: '', deadline: '' }); 
    } catch (err) {
      console.error("Error creating project:", err.response?.data);
      const errorMsg = err.response?.data?.name?.[0] || 
                       err.response?.data?.deadline?.[0] || 
                       "Failed to create project";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <FolderPlus size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Project</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Project Title</label>
              <input
                required
                type="text"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. Website Redesign"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
              <textarea
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium h-32"
                placeholder="What is this project about?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Deadline</label>
              <input
                type="date"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Launch Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;