'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Plus, X, StopCircle, Clock, AlertCircle, FileBarChart, User as UserIcon
} from 'lucide-react';



    

export default function CampaignsPage() {
  // Boshlang'ich holatda ro'yxat bo'm-bo'sh turadi (statik ma'lumotlar yo'q)
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Yangi muddat ochish modali state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  // Admin profil ma'lumotlari (Statik)
  const adminName = "Hasan Turaevich";
  const adminRole = "BKR Boshlig'i";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Backenddan kampaniyalarni olib kelish funksiyasi
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://nbu-bkr-api.onrender.com/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Kampaniyalarni yuklashda xatolik:", error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Yangi muddat ochish (Yaratish)
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('https://nbu-bkr-api.onrender.com/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'active'
        }),
      });
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', startDate: '', endDate: '' });
        fetchCampaigns(); // Ro'yxatni yangilash
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Yaratishda xato:", error);
    }
  };

  // Muddatni qo'lda to'xtatish (Statusni yakunlangan qilish)
  const handleStopCampaign = async (id: string) => {
    const confirmStop = window.confirm("Haqiqatan ham ushbu deklaratsiya qabulini to'xtatmoqchimisiz? Xodimlar boshqa to'ldira olmaydi.");
    if (!confirmStop) return;

    try {
      const res = await fetch(`https://nbu-bkr-api.onrender.com/api/campaigns/${id}/stop`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchCampaigns();
      }
    } catch (error) {
      console.error("To'xtatishda xato:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">

      {/* YANGI MUDDAT OCHISH MODALI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-[#0A2540]">
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Yangi muddat ochish
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kampaniya nomi</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium" 
                  placeholder="Masalan: 2026-yilgi yillik deklaratsiya" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Boshlanish sanasi</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tugash sanasi (Deadline)</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-medium text-slate-700" 
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex gap-3 mt-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Yangi muddat ochishingiz bilan xodimlar panelida <b>"Yillik deklaratsiya"</b> tugmasi aktivlashadi. Muddat o'tgach u avtomatik ravishda qulflanadi.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Ochish va Boshlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A2540] text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-16 flex items-center px-6 bg-[#071d33] border-b border-slate-700/50">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#0A2540] font-bold text-xs mr-3 shadow-sm">NBU</div>
          <span className="text-white font-semibold tracking-wide">BKR Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/declarations" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <FileText className="w-5 h-5" /> Deklaratsiyalar
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> Xabarnomalar
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </Link>
          <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
            <Calendar className="w-5 h-5" /> Muddatlarni sozlash
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Xodimlar bazasi
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <FileBarChart className="w-5 h-5" /> Hisobotlar
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors mb-2">
            <Settings className="w-5 h-5" /> Sozlamalar
          </Link>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Deklaratsiya muddatlarini boshqarish</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="text-right">
                <p className="font-bold text-slate-900">{adminName}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{adminRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 max-w-5xl">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0A2540]">Kampaniyalar</h2>
              <p className="text-slate-500 mt-1">Xodimlar uchun deklaratsiya to'ldirish darchasini ochish va yopish.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-[#113559] transition-colors shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-5 h-5" /> Yangi muddat ochish
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 font-bold animate-pulse">
                Ma'lumotlar yuklanmoqda...
              </div>
            ) : campaigns.length > 0 ? (
              campaigns.map((camp) => (
                <div key={camp._id} className={`bg-white p-6 rounded-2xl border shadow-sm transition-all ${camp.status === 'active' ? 'border-emerald-200' : 'border-slate-200 opacity-75'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{camp.title}</h3>
                        {camp.status === 'active' ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Faol
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-wider uppercase">
                            Yakunlangan
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4" /> 
                        {new Date(camp.startDate).toLocaleDateString('uz-UZ')} dan — {new Date(camp.endDate).toLocaleDateString('uz-UZ')} gacha
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center border-r border-slate-100 pr-6">
                        <p className="text-2xl font-black text-slate-800">0 <span className="text-sm font-medium text-slate-400">/ 0</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topshirganlar</p>
                      </div>
                      
                      {camp.status === 'active' && (
                        <button 
                          onClick={() => handleStopCampaign(camp._id)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 font-bold text-sm transition-colors"
                        >
                          <StopCircle className="w-4 h-4" /> To'xtatish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // HECH QANDAY KAMPANIYA YO'Q BO'LSA BO'SH EKRAN CHIQADI
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Faol muddatlar mavjud emas</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Hozirda tizimda hech qanday deklaratsiya to'ldirish muddati ochilmagan. Xodimlar uchun darchani ochish uchun yangi muddat yarating.
                </p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  + Birinchi muddatni ochish
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}