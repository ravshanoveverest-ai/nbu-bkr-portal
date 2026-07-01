'use client';

import React from 'react';
import Link from 'next/link';
import { FileSignature, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';

export default function EmployeeDashboard() {
  // Bu qiymat kelajakda Backend API (Campaigns) dan keladi.
  // Hozir true qilib turibmiz, ya'ni deklaratsiya to'ldirish ochiq.
  const isDeclarationOpen = true; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Yuqori Navigatsiya paneli */}
      <header className="bg-[#0A2540] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0A2540] font-bold text-sm shadow-sm">
              NBU
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">Komplayens Nazorat</h1>
              <p className="text-xs text-slate-300">Xodim paneli</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline font-medium text-white">Valiyev Alisher</span>
            </div>
            <button className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Asosiy Qism */}
      <main className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Xush kelibsiz!</h2>
          <p className="text-slate-500 mt-1">O'zingizga kerakli bo'limni tanlang.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1-Blok: Deklaratsiya */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileSignature className="w-6 h-6 text-blue-600 stroke-[1.5]" />
                  </div>
                  Manfaatlar To'qnashuvi
                </h3>
                {isDeclarationOpen ? (
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ochiq
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
                    Yopiq
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Ushбу yillik deklaratsiyani to'ldirish orqali o'zingiz va sizga aloqador shaxslarning bank bilan bo'lishi mumkin bo'lgan manfaatlar to'qnashuvi holatlarini ma'lum qilasiz.
              </p>
            </div>
            
            {isDeclarationOpen ? (
              <Link href="/declaration" className="block">
                <button className="w-full py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                  Deklaratsiyani To'ldirish
                </button>
              </Link>
            ) : (
              <button disabled className="w-full py-3 rounded-lg font-medium text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200">
                Hozircha yopiq
              </button>
            )}
          </div>

          {/* 2-Blok: Xabarnoma */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-amber-500 stroke-[1.5]" />
                  </div>
                  Xabarnoma Yuborish
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Agar bank faoliyatida korrupsion xavflar, mavjud manfaatlar to'qnashuvi yoki qonunbuzilish holatlarini sezsangiz, rahbariyatga xabarnoma qoldiring.
              </p>
            </div>
            
            <Link href="/notification" className="block">
              <button className="w-full py-3 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                Xabarnoma Yaratish
              </button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}