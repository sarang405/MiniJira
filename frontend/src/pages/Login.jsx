import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLoader, FiLogIn } from "react-icons/fi";
import InputField from "../components/InputField";
import api from "../api/axios"; 

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/accounts/login/", form);
      localStorage.setItem("user",JSON.stringify(response.data.user || response.data));

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      
      const pendingInvite = localStorage.getItem("pending_invite_token");

      if (pendingInvite) {
        window.location.href = `/invite/${pendingInvite}`;
      } else {
        window.location.href = "/dashboard";
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FF] p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] p-10 sm:p-12 border border-white">
        
        <header className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <FiLogIn className="text-white" size={26} />
          </div>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Welcome Back</h1>
          <p className="text-gray-400 text-[15px] mt-2">Enter your details to access your dashboard.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <InputField
            label="Username"
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            isUpdating={loading}
            required
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            isUpdating={loading}
            required
          />

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20" 
              />
              <span className="text-[14px] font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                Remember me
              </span>
            </label>
            <Link to="/forgot-password" size="sm" className="text-[14px] font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex justify-center items-center text-[16px]"
          >
            {loading ? <FiLoader className="animate-spin" size={24} /> : "Sign In"}
          </button>
        </form>

        <p className="mt-10 text-center text-gray-500 font-medium text-[14px]">
          New here?{" "}
          <Link to="/register" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors ml-1">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}