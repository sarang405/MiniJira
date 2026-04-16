import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiMail, FiArrowLeft, FiCheckCircle, FiLoader, FiKey } from 'react-icons/fi';
import InputField from '../components/InputField';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/accounts/password-reset/', { email });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] p-10 sm:p-12 border border-white">
        
        {!submitted ? (
          <>
            <header className="mb-10 text-left">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/40 transform -rotate-3">
                <FiKey className="text-white" size={26} />
              </div>
              <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Reset Password</h1>
              <p className="text-gray-400 text-[15px] mt-2 font-medium">We'll send a link to your email to reset your password.</p>
            </header>

            <form onSubmit={handleResetRequest} className="space-y-6">
              <InputField
                label="Email Address"
                type="email"
                icon={FiMail}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isUpdating={loading}
              />

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex justify-center items-center text-[16px]"
              >
                {loading ? <FiLoader className="animate-spin" size={24} /> : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-500 font-medium mb-8">We've sent password reset instructions to your inbox.</p>
          </div>
        )}

        <Link 
          to="/login" 
          className="mt-8 flex items-center justify-center gap-2 text-[14px] font-bold text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <FiArrowLeft size={18} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;