import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { FiUserPlus, FiUser, FiMail, FiLock, FiArrowRight, FiLoader } from 'react-icons/fi';
import InputField from '../components/InputField';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/accounts/register/', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[460px] p-10 sm:p-12 border border-white">
        
        <header className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <FiUserPlus className="text-white" size={26} />
          </div>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Create Account</h1>
          <p className="text-gray-400 text-[15px] mt-2 font-medium">Join the community today.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
             {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <InputField
            label="Username"
            type="text"
            icon={FiUser}
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            isUpdating={loading}
          />

          <InputField
            label="Email Address"
            type="email"
            icon={FiMail}
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            isUpdating={loading}
          />

          <InputField
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            isUpdating={loading}
          />

          <div className="flex items-start gap-3 px-1 pt-2">
            <input 
              type="checkbox" 
              id="terms"
              required
              className="mt-1 w-5 h-5 rounded border-gray-200 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms" className="text-[13px] text-gray-500 cursor-pointer leading-tight font-medium">
              I agree to the <span className="text-gray-900 font-bold hover:underline">Terms of Service</span> and <span className="text-gray-900 font-bold hover:underline">Privacy Policy</span>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!agreed || loading}
            className={`w-full py-4.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-[16px] ${
              agreed && !loading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? <FiLoader className="animate-spin" size={24} /> : (
              <>Get Started <FiArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-gray-500 font-medium text-[14px]">
          Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;