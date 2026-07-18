'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Lock, Mail, AlertCircle, ArrowRight, 
  KeyRound, CheckCircle, X, Eye, EyeOff, Building2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Login formasi state'lari
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Parolni tiklash modali state'lari
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = 'https://nbu-bkr-api.onrender.com/api/auth';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Email yoki parol xato");

      // Token va ma'lumotlarni saqlash
      localStorage.setItem('bkr_token', data.token);
      localStorage.setItem('user_info', JSON.stringify({ 
        fullName: data.fullName, 
        email: data.email, 
        role: data.role,
        branch: data.branch,
        position: data.position
      }));

      setSuccess("Tizimga kirilmoqda...");
      
      setTimeout(() => {
        if (data.role === 'admin' || email.includes('admin@nbu.uz')) {
          router.push('/admin'); 
        } else {
          router.push('/dashboard'); 
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PAROLNI TIKLASH ---
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setSuccess("Kodingiz emailga jo'natildi!");
      setForgotStep(2); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (resetCode.length === 6) { 
      setForgotStep(3); 
    } else {
      setError("Kod 6 xonali bo'lishi kerak.");
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError("Parollar bir-biriga mos kelmadi!");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetCode, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      setShowForgotModal(false);
      setForgotStep(1);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setSuccess("Parolingiz muvaffaqiyatli yangilandi! Tizimga kirishingiz mumkin.");
      setEmail(resetEmail); 
      setPassword('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans relative flex flex-col items-center">
      
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#0A2540] z-0"></div>

      {/* PAROLNI TIKLASH MODALI */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
            <button 
              onClick={() => {
                setShowForgotModal(false); 
                setForgotStep(1); 
                setError('');
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Parolni tiklash</h2>
              <p className="text-sm text-slate-500 mt-1">
                {forgotStep === 1 && "Korporativ pochtangizni kiriting, biz tasdiqlash kodini yuboramiz."}
                {forgotStep === 2 && "Pochtangizga yuborilgan 6 xonali kodni kiriting."}
                {forgotStep === 3 && "Yangi xavfsiz parol o'rnating."}
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* 1-BOSQICH: EMAIL */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email manzil</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    placeholder="name@nbu.uz"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-[#113559] transition-colors disabled:opacity-70">
                  {isLoading ? 'Yuborilmoqda...' : 'Kodni yuborish'}
                </button>
              </form>
            )}

            {/* 2-BOSQICH: TASDIQLASH KODI */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tasdiqlash kodi</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-center tracking-[0.5em] font-bold text-lg"
                    placeholder="------"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-[#113559] transition-colors disabled:opacity-70">
                  Tasdiqlash
                </button>
              </form>
            )}

            {/* 3-BOSQICH: YANGI PAROL */}
            {forgotStep === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Yangi parol</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Parolni tasdiqlang</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70">
                  {isLoading ? 'Saqlanmoqda...' : 'Saqlash va Kirish'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ASOSIY KONTENT */}
      <div className="z-10 w-full max-w-[500px] mt-16 px-4 flex flex-col items-center">
        
        {/* Logo va Sarlavha */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 p-2 overflow-hidden">
             <div className="text-[#0A2540] font-black text-2xl flex flex-col items-center leading-none">
                <Building2 className="w-8 h-8 mb-1" />
                <span className="text-[10px]">O'ZMILLIYBANK</span>
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">"O'zmilliybank" AJ Portali</h1>
          <p className="text-blue-200 text-sm font-medium">Xodimlar uchun yagona korporativ tizim</p>
        </div>

        {/* Login formasi (Karta) */}
        <div className="bg-white rounded-2xl shadow-xl w-full p-8 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-5 h-5 shrink-0" /> {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Korporativ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="name@nbu.uz"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Parol</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#0A2540] hover:bg-[#113559] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] disabled:opacity-70 transition-all"
              >
                {isLoading ? 'Iltimos kuting...' : 'Tizimga kirish'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* SAHIFA O'TISHI (LOGIN -> REGISTER) */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-500">
              Akkauntingiz yo'qmi?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:underline transition-all">
                Ro'yxatdan o'tish
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}