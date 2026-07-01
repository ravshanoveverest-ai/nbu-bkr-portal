'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Parolni ko'rsatish/yashirish uchun state-lar
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Parollar o'zaro mos kelmadi. Iltimos tekshiring!");
      return;
    }
    // API ga so'rov shu yerdan ketadi
    console.log('Register attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#0A2540] p-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">NBU Komplayens</h1>
          <p className="text-slate-300 text-sm mt-2">Tizimda ro'yxatdan o'tish</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* F.I.Sh */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">F.I.Sh (To'liq)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none"
                  placeholder="Valiyev Alisher Baxodirovich"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none"
                  placeholder="name@nbu.uz"
                  required
                />
              </div>
            </div>

            {/* Parol */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none"
                  placeholder="••••••••"
                  required
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

            {/* Parolni tasdiqlash */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parolni tasdiqlang</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0A2540] hover:bg-[#113559] transition-colors"
              >
                Ro'yxatdan o'tish
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Allaqachon hisobingiz bormi? </span>
            <Link href="/login" className="text-blue-600 font-medium hover:text-blue-500">
              Tizimga kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}