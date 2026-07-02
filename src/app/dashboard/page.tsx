'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, ShieldAlert, LogOut, User, Bell, ChevronRight,
  CalendarDays, ArrowLeftRight, UserPlus, X, AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Admin tomonidan ochiladigan yillik deklaratsiya holati (Hozircha ochiq deb turamiz)
  const isCampaignActive = true; 
  
  const [showTypeModal, setShowTypeModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative">
      
      {/* 3 TA DEKLARATSIYA TURINI TANLASH MODALI */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Deklaratsiya turini tanlang</h2>
                <p className="text-sm text-slate-500 mt-1">Hozirgi holatingizga mos keladigan deklaratsiyani tanlang.</p>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Yillik deklaratsiya (Admin boshqaradi) */}
              <div 
                onClick={() => isCampaignActive && router.push('/declaration?type=yillik')}
                className={`relative border-2 rounded-xl p-5 transition-all ${isCampaignActive ? 'border-blue-100 hover:border-blue-500 hover:shadow-md cursor-pointer bg-white group' : 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'}`}
              >
                {!isCampaignActive && (
                  <div className="absolute -top-3 -right-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3" /> Yopiq
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isCampaignActive ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors' : 'bg-slate-200 text-slate-400'}`}>
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h3 className={`font-bold mb-2 ${isCampaignActive ? 'text-slate-800' : 'text-slate-500'}`}>Yillik deklaratsiya</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Har yili barcha xodimlar tomonidan ommaviy to'ldiriladigan navbatdagi deklaratsiya.</p>
              </div>

              {/* 2. Rotatsiya deklaratsiyasi (Doim ochiq) */}
              <div 
                onClick={() => router.push('/declaration?type=rotatsiya')}
                className="border-2 border-indigo-100 hover:border-indigo-500 rounded-xl p-5 cursor-pointer bg-white group hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Rotatsiya holatida</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Boshqa bo'limga, filialga o'tganda yoki lavozim o'zgarganda to'ldiriladi.</p>
              </div>

              {/* 3. Yangi xodim deklaratsiyasi (Doim ochiq) */}
              <div 
                onClick={() => router.push('/declaration?type=yangi_xodim')}
                className="border-2 border-emerald-100 hover:border-emerald-500 rounded-xl p-5 cursor-pointer bg-white group hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Yangi ishga qabul</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Bankka birinchi marta ishga kirayotgan nomzodlar tomonidan to'ldiriladi.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-[#0A2540] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0A2540] font-black text-sm">
            NBU
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Komplayens Nazorat</h1>
            <p className="text-xs text-blue-200">Xodim paneli</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-blue-100" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 bg-white/10 py-1.5 px-3 rounded-full border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium mr-1 hidden md:block">Valiyev Alisher</span>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors" onClick={() => router.push('/login')}>
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#0A2540]">Xush kelibsiz!</h2>
          <p className="text-slate-500 mt-2 text-lg">O'zingizga kerakli bo'limni tanlang.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* DEKLARATSIYA KARTASI */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative group flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                {isCampaignActive ? (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ochiq
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">Yopiq</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Manfaatlar To'qnashuvi</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Tizim orqali o'zingiz va sizga aloqador shaxslarning bank bilan bo'lishi mumkin bo'lgan manfaatlar to'qnashuvi holatlarini ma'lum qiling.
              </p>
            </div>
            <div className="px-8 pb-8">
              <button 
                onClick={() => setShowTypeModal(true)}
                className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                Deklaratsiyani To'ldirish <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* XABARNOMA KARTASI */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative group flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-7 h-7" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Xabarnoma Yuborish</h3>
              <p className="text-slate-500 leading-relaxed mb-8">
                Agar bank faoliyatida korrupsion xavflar, mavjud manfaatlar to'qnashuvi yoki qonunbuzilish holatlarini sezsangiz, rahbariyatga xabarnoma qoldiring.
              </p>
            </div>
            <div className="px-8 pb-8">
              <button 
                onClick={() => router.push('/notification')}
                className="w-full py-3.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors flex justify-center items-center gap-2"
              >
                Xabarnoma Yaratish <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}