import React, { useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "flowbite-react";
import { FiUsers, FiSearch } from "react-icons/fi";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const JoinedProjects = () => {
  const [search, setSearch] = useState("");
  
  
  const deferredSearch = useDeferredValue(search);

  const { data: projects = [], isLoading, isError } = useQuery({
    
    queryKey: ["joined-projects", deferredSearch], 
    queryFn: async () => {
      const res = await api.get("/projects/", {
        params: { search: deferredSearch }
      });
      
      const currentUser = localStorage.getItem("username");

      const rawProjects = (res.data.joined_projects || []).filter(
        (p) => p.owner_username !== currentUser
      );

      return Array.from(new Map(rawProjects.map(p => [p.id, p])).values());
    },
    placeholderData: (previousData) => previousData,
  });

  
  const filtered = projects.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && !projects.length)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Spinner size="xl" color="info" />
        <div className="text-blue-600 font-black animate-pulse text-lg md:text-xl uppercase tracking-tighter text-center">
          Joining Workspaces...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="mx-2 md:mx-0 p-8 md:p-10 text-center bg-red-50 rounded-[2rem] md:rounded-[3rem] border border-red-100">
        <p className="text-red-500 font-bold text-sm md:text-base">
          Failed to load collaborations. Please try again.
        </p>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-10 pb-12 animate-in fade-in slide-in-from-right-4 duration-500 px-2 sm:px-4 md:px-0">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Joined Projects</h1>
          <p className="text-slate-400 font-bold text-xs md:text-sm">
            Projects you are collaborating on
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 text-lg" />
          <input
            type="text"
            value={search}
            placeholder="Search collaborations..."
            className="w-full pl-14 pr-4 py-3.5 md:py-4 rounded-xl md:rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-600 font-bold text-sm text-slate-700 placeholder:text-slate-300"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <ProjectCard 
              key={p.id}
              id={p.id}
              name={p.name} 
              description={p.description}
              deadline={p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Active'}
              progress={p.progress_percentage || 0}
              status={p.status || 'Member'}
              type="joined"
              joined_at={p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
            />
          ))
        ) : (
          <div className="col-span-full py-16 md:py-24 text-center bg-white/50 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-slate-100 px-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-slate-300 text-xl md:text-2xl" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
              {search ? "No matches found for your search" : "No collaborations found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinedProjects;