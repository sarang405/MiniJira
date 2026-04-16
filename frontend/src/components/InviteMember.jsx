import React, { useState } from 'react';
import { UserPlus, Copy, Check, Loader2 } from 'lucide-react';
import api from '../api/axios';

const InviteMember = ({ projectId, projectName }) => {
  const [showModal, setShowModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/invitations/project/${projectId}/create/`);
      setInviteLink(res.data.invite_link);
    } catch (err) {
      console.error("Invite Error:", err.response?.data);
      alert("Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] md:text-xs hover:bg-blue-600 transition-all shadow-md cursor-pointer"
      >
        <UserPlus size={14} /> <span>Invite</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[400px] rounded-[2rem] p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
            
            <button
              onClick={() => {
                setShowModal(false);
                setInviteLink('');
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Invite Member</h2>
            <p className="text-slate-500 text-sm mb-6">Generate a secure link to invite others to <strong>{projectName}</strong>.</p>

            {!inviteLink ? (
              <button
                disabled={loading}
                onClick={handleGenerateLink}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Generate Invite Link"}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    value={inviteLink}
                    readOnly
                    className="w-full p-4 pr-12 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium text-sm focus:ring-0"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
                    {copied ? <Check size={18} /> : <Copy size={18} onClick={copyToClipboard} className="cursor-pointer" />}
                  </div>
                </div>

                <button
                  onClick={copyToClipboard}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                    copied ? "bg-green-500 text-white" : "bg-slate-900 text-white hover:bg-black"
                  }`}
                >
                  {copied ? "Link Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InviteMember;