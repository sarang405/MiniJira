import React, { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner, Modal, Label, TextInput, Textarea, Button } from 'flowbite-react';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';

const MyProjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, isFetching } = useQuery({
    queryKey: ['projects', deferredSearch],
    queryFn: async () => {
      const res = await api.get(`/projects/?search=${deferredSearch}`);
      return res.data.my_projects || [];
    },
    placeholderData: (previousData) => previousData,
  });

  const filteredProjects = projects.filter((p) =>
    (p.name || p.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: (newProj) => api.post('/projects/', newProj),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']); 
      setIsModalOpen(false); 
      setNewProject({ title: '', description: '', deadline: '' });
    },
    onError: (err) => {
      alert(err.response?.data?.detail || "Error creating project");
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(newProject);
  };

  if (isLoading && !projects.length) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="xl" color="info" />
      <div className="text-blue-600 font-black animate-pulse text-lg md:text-xl uppercase tracking-tighter">
        Loading Workspaces...
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-12 animate-in fade-in duration-500 px-2 sm:px-4 md:px-0">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">My Projects</h1>
            {isFetching && <Spinner size="sm" color="info" />}
          </div>
          <p className="text-slate-400 font-bold text-xs md:text-sm">Manage and track your active workspaces</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 md:px-8 rounded-2xl md:rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >
          <FiPlus strokeWidth={4} className="text-lg" /> <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-row gap-3 items-center bg-white p-3 md:p-5 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-50">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-blue-600 text-lg" />
          <input 
            type="text"
            placeholder="Search projects..."
            className="w-full pl-11 md:pl-14 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl border-none bg-slate-50 focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-700 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100 flex-shrink-0">
          <FiFilter size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filteredProjects.length > 0 ? filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id}
            id={project.id}
            name={project.name || project.title} 
            description={project.description}
            deadline={project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
            progress={project.progress_percentage || 0}
            status={project.status}
            type="my-projects" 
          />
        )) : (
          <div className="col-span-full py-16 md:py-24 text-center border-4 border-dashed border-slate-50 rounded-[2.5rem] md:rounded-[4rem] px-4">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs md:text-sm">
                {searchTerm ? "No projects match your search" : "No active workspaces found"}
              </p>
          </div>
        )}
      </div>

      <Modal 
        show={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="bg-white rounded-3xl overflow-hidden">
          <Modal.Header className="font-black text-xl md:text-2xl border-none p-6 pb-0">Create New Project</Modal.Header>
          <Modal.Body className="p-6 pt-4">
            <div className="space-y-5 md:space-y-6">
              <div>
                <Label htmlFor="title" value="Project Title" className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2 block" />
                <TextInput 
                  id="title" 
                  placeholder="e.g. WinHive Pro" 
                  required 
                  className="rounded-xl"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="deadline" value="Deadline" className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2 block" />
                <TextInput 
                  id="deadline" 
                  type="date" 
                  className="rounded-xl"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description" value="Description" className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2 block" />
                <Textarea 
                  id="description" 
                  placeholder="What is this workspace about?" 
                  rows={4} 
                  className="rounded-xl"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-none justify-end gap-3 p-6 pt-0 pb-8">
            <Button color="gray" pill onClick={() => setIsModalOpen(false)} className="font-bold flex-1 sm:flex-none">Cancel</Button>
            <Button 
              type="submit" 
              pill 
              className="font-black px-4 bg-slate-900 flex-1 sm:flex-none text-white hover:bg-blue-600 transition-colors"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default MyProjects;