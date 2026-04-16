import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");
  
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const processInvite = async () => {
      const authToken = localStorage.getItem('access_token');

      if (!authToken) {
        localStorage.setItem('pending_invite_token', token);
        setStatus("Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 1000);
        return;
      }

      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        setStatus("Joining project...");
        const res = await api.post(`/invitations/accept/${token}/`);
        
        alert(res.data.message);
        localStorage.removeItem('pending_invite_token'); 
        navigate('/joined-projects');
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to join";
        alert(errorMsg);
        navigate('/dashboard');
      }
    };

    processInvite();
  }, [token, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F4F7FF] font-sans">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-sm w-full border border-white">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{status}</h2>
        <p className="text-gray-400 font-bold text-sm">Please do not refresh the page.</p>
      </div>
    </div>
  );
};

export default AcceptInvite;