import React, { useState, useEffect } from 'react';
import { Avatar, TextInput } from 'flowbite-react';
import { FiSend, FiPaperclip, FiSearch } from 'react-icons/fi';
import api from '../api/axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const activeProjectId = 1; // Example ID

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/communications/${activeProjectId}/`, { content: newMessage });
      setNewMessage("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8">
      <div className="w-80 bg-white rounded-[3rem] p-6 border border-gray-50 shadow-sm flex flex-col">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold" placeholder="Search chats..." />
        </div>
        <div className="space-y-2 overflow-y-auto">
          {['Hustle Hub', 'CRM Project', 'Design Team'].map((name, i) => (
            <div key={i} className={`p-4 rounded-[1.5rem] cursor-pointer transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' : 'hover:bg-gray-50 text-gray-900'}`}>
              <p className="font-black text-sm">{name}</p>
              <p className={`text-[10px] font-bold ${i === 0 ? 'text-blue-100' : 'text-gray-400'}`}>Last message 2m ago</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow bg-white rounded-[3rem] border border-gray-50 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">H</div>
            <h2 className="font-black text-gray-900">Hustle Hub Project Chat</h2>
          </div>
        </div>

        <div className="flex-grow p-8 overflow-y-auto space-y-6">
          <div className="flex gap-4">
            <Avatar rounded size="sm" />
            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none max-w-md">
              <p className="text-sm font-bold text-gray-900 leading-relaxed">How is the Prisma ORM integration going?</p>
              <span className="text-[9px] font-black text-gray-400 uppercase mt-2 block">10:45 AM</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 m-6 rounded-[2rem] flex items-center gap-4">
          <FiPaperclip className="text-gray-400 cursor-pointer" />
          <input 
            className="flex-grow bg-transparent border-none focus:ring-0 font-bold text-sm" 
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSend} className="bg-blue-600 p-3 rounded-xl text-white shadow-lg hover:scale-110 transition-transform">
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;