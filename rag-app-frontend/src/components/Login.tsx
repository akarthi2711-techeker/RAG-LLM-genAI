import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import api from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      if (isRegistering) {
        const response = await api.post('/register', { username, password });
        localStorage.setItem('token', response.data.access_token);
        navigate('/');
        return;
      }
      
      // Login
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail[0].msg);
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('An error occurred connecting to the server.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050B2E]">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#06B6D4]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-[#081B5C]/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.4)] border border-[#06B6D4]/20 p-8 sm:p-10 transition-all duration-300">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#123B9A] to-[#06B6D4] flex items-center justify-center mb-5 shadow-lg shadow-[#06B6D4]/20">
              <Hammer size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              BigHammer AI
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              {isRegistering ? 'Create your new AI workspace account' : 'Welcome back, sign in to your workspace'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-xl border border-red-800/50 text-center font-medium animate-pulse">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="peer w-full px-4 pt-6 pb-2 border border-[#123B9A] rounded-xl text-white bg-[#050B2E]/50 focus:bg-[#050B2E] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-[#06B6D4] transition-all duration-200"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label 
                  htmlFor="username"
                  className="absolute text-sm font-medium text-slate-400 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#06B6D4] cursor-text"
                >
                  Username
                </label>
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="peer w-full px-4 pt-6 pb-2 border border-[#123B9A] rounded-xl text-white bg-[#050B2E]/50 focus:bg-[#050B2E] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-[#06B6D4] transition-all duration-200"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label 
                  htmlFor="password"
                  className="absolute text-sm font-medium text-slate-400 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#06B6D4] cursor-text"
                >
                  Password
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#1d4ed8] hover:to-[#0891b2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#081B5C] focus:ring-[#06B6D4] shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              >
                {isRegistering ? 'Create Account' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-[#06B6D4] hover:text-[#4F46E5] text-sm font-semibold transition-colors duration-200"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
              >
                {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
