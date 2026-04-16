import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiSearch, FiTrash2, FiUserPlus, FiChevronDown } from 'react-icons/fi';
import api from '../../api/axios';

import { Dropdown, Badge, Tooltip, Avatar, Pagination } from "flowbite-react";

const ProjectBacklog = () => {
    const { project, isAdmin } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    
    const [serverTasks, setServerTasks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, priorityFilter]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await api.get(`/issues/`, {
                    params: { 
                        project: project.id,
                        search: searchTerm,
                        status: statusFilter !== "all" ? statusFilter : undefined,
                        priority: priorityFilter !== "all" ? priorityFilter : undefined,
                        page: currentPage 
                    }
                });
                
               
                if (response.data.results) {
                    setServerTasks(response.data.results);
                    setTotalPages(Math.ceil(response.data.count / 10)); 
                } else {
                    setServerTasks(Array.isArray(response.data) ? response.data : []);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error("Search API failed", err);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            if (project?.id) fetchSearchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, priorityFilter, currentPage, project?.id]);

    const onPageChange = (page) => setCurrentPage(page);

    const SafeDropdown = Dropdown || (({ children }) => <div className="relative inline-block">{children}</div>);
    const SafeAvatar = Avatar || (() => <div className="w-8 h-8 bg-gray-200 rounded-full" />);

    if (!project) return <div className="p-10 text-center font-bold text-slate-400 tracking-widest">LOADING...</div>;

    return (
        <div className="p-3 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
                <div className="relative w-full lg:w-96">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search tasks..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl md:rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-row items-center gap-2 md:gap-3 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none">
                        <SafeDropdown 
                            inline
                            arrowIcon={false}
                            label={
                                <div className="flex items-center justify-between lg:justify-start gap-2 w-full px-4 md:px-6 py-3 bg-slate-50 text-slate-700 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
                                    <span className="truncate">{statusFilter === 'all' ? 'Status' : statusFilter.replace('_', ' ')}</span>
                                    <FiChevronDown className="text-slate-400 flex-shrink-0" />
                                </div>
                            }
                        >
                            <div className="bg-slate-800 text-white rounded-xl overflow-hidden min-w-[160px] shadow-xl">
                               <div onClick={() => setStatusFilter("all")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 uppercase tracking-tight text-slate-400">All Status</div>
                               <div onClick={() => setStatusFilter("todo")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 uppercase tracking-tight">To Do</div>
                               <div onClick={() => setStatusFilter("in_progress")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 uppercase tracking-tight">In Progress</div>
                               <div onClick={() => setStatusFilter("done")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs uppercase tracking-tight text-green-400">Done</div>
                            </div>
                        </SafeDropdown>
                    </div>

                    <div className="flex-1 lg:flex-none">
                        <SafeDropdown 
                            inline
                            arrowIcon={false}
                            label={
                                <div className="flex items-center justify-between lg:justify-start gap-2 w-full px-4 md:px-6 py-3 bg-slate-50 text-slate-700 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-wider hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
                                    <span className="truncate">{priorityFilter === 'all' ? 'Priority' : priorityFilter}</span>
                                    <FiChevronDown className="text-slate-400 flex-shrink-0" />
                                </div>
                            }
                        >
                            <div className="bg-slate-800 text-white rounded-xl overflow-hidden min-w-[160px] shadow-xl">
                                <div onClick={() => setPriorityFilter("all")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 text-slate-400 uppercase tracking-tight">All Priority</div>
                                <div onClick={() => setPriorityFilter("high")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 uppercase tracking-tight text-red-400">High</div>
                                <div onClick={() => setPriorityFilter("medium")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs border-b border-slate-700/50 uppercase tracking-tight text-yellow-400">Medium</div>
                                <div onClick={() => setPriorityFilter("low")} className="px-5 py-3 hover:bg-slate-700 cursor-pointer font-bold text-xs uppercase tracking-tight text-blue-400">Low</div>
                            </div>
                        </SafeDropdown>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue & Title</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Assignee</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Priority</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                {isAdmin && <th className="p-6"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {serverTasks.length > 0 ? (
                                serverTasks.map(task => (
                                    <tr key={task.id} className="group hover:bg-blue-50/30 transition-all">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[11px] font-black text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">#{task.id}</span>
                                                <p className="font-bold text-slate-700 group-hover:text-slate-900 truncate max-w-xs">{task.title}</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center">
                                                {task.assignee ? (
                                                    <Tooltip content={task.assignee.username}>
                                                        <SafeAvatar
                                                            img={`https://ui-avatars.com/api/?name=${task.assignee.username}&background=0f172a&color=fff`}
                                                            rounded size="sm"
                                                        />
                                                    </Tooltip>
                                                ) : <FiUserPlus className="text-slate-300" />}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center text-[11px] font-black uppercase">
                                            <span className={`px-2 py-1 rounded-md ${task.priority === 'high' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'}`}>
                                                {task.priority || "Medium"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <Badge color={task.status === 'done' ? 'success' : 'info'} className="uppercase text-[10px] font-black px-3 py-1 rounded-lg">
                                                {task.status?.replace('_', ' ') || "To Do"}
                                            </Badge>
                                        </td>
                                        {isAdmin && (
                                            <td className="p-6 text-right">
                                                <button className="p-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><FiTrash2 /></button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <EmptyState isAdmin={isAdmin} />
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y divide-slate-100">
                    {serverTasks.map(task => (
                        <div key={task.id} className="p-5">
                            <h3 className="font-bold text-slate-800 text-sm mb-4">{task.title}</h3>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center py-6 bg-slate-50/50 border-t border-slate-100">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            showIcons
                            layout="pagination"
                            className="font-bold"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ isAdmin }) => (
    <tr>
        <td colSpan={isAdmin ? 5 : 4} className="p-24 text-center text-slate-400 font-bold">
            No tasks match your filters
        </td>
    </tr>
);

export default ProjectBacklog;