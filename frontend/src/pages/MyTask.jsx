import React, { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, Search, ListFilter, Layout } from 'lucide-react';

const MyTasks = () => {
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [page, setPage] = useState(1);
  
  
  const deferredSearch = useDeferredValue(searchTerm);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['my-tasks', page, deferredSearch],
    queryFn: async () => {
      const res = await api.get(`/issues/my-tasks/`, {
        params: { 
          page: page,
          search: deferredSearch 
          
        }
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const tasks = data?.results || [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  
  const filteredTasks = tasks.filter((task) =>
    (task.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.project_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Fetching Tasks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-100 max-w-5xl mx-auto mt-10">
        <h2 className="font-bold flex items-center gap-2">
          <AlertCircle size={20} />
          Failed to load tasks
        </h2>
        <p className="text-sm mt-1">{error?.response?.data?.detail || "Check your connection status."}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 font-medium mt-1">Review and manage your personal assignments</p>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-2">
            <ListFilter size={18} className="text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Task Inventory</span>
            {isFetching && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping ml-2" />}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFetching ? 'text-indigo-500 animate-pulse' : 'text-slate-300'}`} size={16} />
            <input 
              type="text"
              placeholder="Search tasks or projects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); 
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-none rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Task Detail</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Project</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-colors ${task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                          <CheckCircle2 size={18} />
                        </div>
                        <span className="font-bold text-slate-700 truncate max-w-[180px] md:max-w-xs transition-colors group-hover:text-indigo-600">
                          {task.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Layout size={14} className="text-slate-300" />
                        <span className="text-xs font-semibold truncate max-w-[120px]">
                          {task.project_name || "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        task.priority === 'high' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Clock size={14} className="text-indigo-400" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        task.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      {searchTerm ? "No matches found for your search" : "No assignments found"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Page {page}</p>
            <span className="text-[10px] font-medium text-slate-300">|</span>
            <p className="text-xs font-bold text-slate-500">Total: {data?.count || 0}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={!hasPrevious}
              className={`p-2 rounded-xl border transition-all ${!hasPrevious ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-95'}`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(old => old + 1)}
              disabled={!hasNext}
              className={`p-2 rounded-xl border transition-all ${!hasNext ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-95'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;