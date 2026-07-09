'use client';

import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 1. Sahifa yuklanganda login qilinganligini tekshiramiz
  useEffect(() => {
    const authStatus = sessionStorage.getItem('bkr_admin_logged_in');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // 2. Login tekshiruv (Murakkab va xavfsiz)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // SIZ SO'RAGAN MURAKKAB LOGIN VA PAROL:
    if (username === 'BKR_SuperAdmin' && password === 'Nbu@StrongPass!2026') {
      sessionStorage.setItem('bkr_admin_logged_in', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError("Login yoki parol noto'g'ri kiritildi!");
    }
  };

  if (isChecking) {
    return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center text-slate-500 font-bold">Tekshirilmoqda...</div>;
  }

  // 3. Agar ruxsat bo'lmasa, faqat Login ekranini ko'rsatamiz
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        
        {/* Orqa fon bezaklari */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl"></div>

        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-blue-100">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#0A2540]">BKR Admin Panel</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Tizimga kirish uchun ruxsat talab qilinadi</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-200 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Login</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 font-bold transition-all"
                  placeholder="Loginni kiriting"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parol</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#113559] transition-all shadow-lg hover:shadow-xl mt-2 flex justify-center items-center gap-2"
            >
              Tizimga kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Agar hammasi joyida bo'lsa, Admin sahifalari (children) ni ochib beradi
  return <>{children}</>;
}