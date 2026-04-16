import React, { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiMail, FiSearch, FiUserPlus } from 'react-icons/fi';
import { Spinner, Badge } from 'flowbite-react';
import api from '../api/axios';

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['team-directory', deferredSearch],
    queryFn: async () => {
      const res = await api.get(`/accounts/users/?search=${deferredSearch}`);
      return res.data.results || res.data;    },
    placeholderData: (prev) => prev,
  });

  const filteredMembers = team.filter((member) =>
    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !team.length) return (
    <div className="flex h-[50vh] items-center justify-center"><Spinner size="xl" /></div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Team Directory</h1>
          <p className="text-gray-400 font-bold text-sm">Manage all system collaborators</p>
        </div>

        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blue-600 font-bold text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredMembers.length > 0 ? filteredMembers.map((member) => (
          <div key={member.id} className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-blue-600 opacity-[0.03]" />
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl mx-auto relative z-10 flex items-center justify-center text-3xl font-black text-blue-600 mb-5 border-4 border-gray-50">
              {member.username?.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-black text-xl text-gray-900 mb-1">{member.username}</h3>
            <Badge color="info" className="mx-auto w-fit mb-4">{member.role || "Member"}</Badge>
            <p className="text-[11px] font-bold text-gray-400 mb-8 italic">{member.email}</p>
            <div className="flex justify-center gap-3">
              <a href={`mailto:${member.email}`} className="flex-grow bg-slate-900 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-600 transition-colors">
                <FiMail size={14} className="inline mr-2" /> Email
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic font-bold">
            No team members found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;