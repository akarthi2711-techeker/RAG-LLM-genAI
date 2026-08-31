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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-10 transition-all duration-300">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
              <Hammer size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              BigHammer AI
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {isRegistering ? 'Create your new AI workspace account' : 'Welcome back, sign in to your workspace'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center font-medium animate-pulse">
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
                  className="peer w-full px-4 pt-6 pb-2 border border-slate-200 rounded-xl text-slate-900 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label 
                  htmlFor="username"
                  className="absolute text-sm font-medium text-slate-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 cursor-text"
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
                  className="peer w-full px-4 pt-6 pb-2 border border-slate-200 rounded-xl text-slate-900 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label 
                  htmlFor="password"
                  className="absolute text-sm font-medium text-slate-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-indigo-600 cursor-text"
                >
                  Password
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              >
                {isRegistering ? 'Create Account' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-semibold transition-colors duration-200"
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
