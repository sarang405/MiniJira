import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiLock, FiShield, FiLoader, FiCheckCircle } from 'react-icons/fi';
import InputField from '../components/InputField';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/accounts/password-reset-confirm/', { 
        uidb64, 
        token, 
        new_password: newPassword 
      });
      alert("Success! Password updated.");
      navigate('/login');
    } catch (err) {
      setError("This link is invalid or has expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] p-10 sm:p-12 border border-white">
        
        <header className="mb-10 text-left">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-all duration-300">
            <FiShield className="text-white" size={26} />
          </div>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">New Password</h1>
          <p className="text-gray-400 text-[15px] mt-2 font-medium">Strengthen your account security.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirmReset} className="space-y-6">
          <InputField
            label="New Password"
            type="password"
            icon={FiLock}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            isUpdating={loading}
          />

          <button 
            type="submit"
            disabled={loading || !newPassword}
            className={`w-full py-4.5 font-bold rounded-2xl transition-all flex justify-center items-center text-[16px] shadow-lg active:scale-[0.98] ${
              !loading && newPassword
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <FiLoader className="animate-spin" size={24} />
            ) : (
              "Update & Sign In"
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-sm font-medium">
            Remembered your password? 
            <button 
              onClick={() => navigate('/login')}
              className="ml-1 text-gray-900 font-bold hover:text-indigo-600 transition-colors"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;