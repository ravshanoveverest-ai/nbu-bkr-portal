'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Plus, Trash2, CheckCircle, XCircle, 
  Clock, AlertCircle, User, ChevronDown, ChevronUp, AlertOctagon,
  FileBarChart
} from 'lucide-react';

// Namunaviy kampaniyalar va HUDUDLAR KESIMIDAGI STATISTIKA
const initialCampaigns = [
  {
    id: 1,
    title: "2024-yilgi yillik deklaratsiya",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "active", // active, completed, draft
    totalExpected: 1500,
    totalSubmitted: 1245,
    regionalStats: [
      { region: "Bosh ofis", submitted: 310, total: 320 },
      { region: "Andijon viloyati", submitted: 145, total: 150 },
      { region: "Buxoro viloyati", submitted: 120, total: 140 },
      { region: "Farg'ona viloyati", submitted: 200, total: 250 },
      { region: "Namangan viloyati", submitted: 180, total: 200 },
      { region: "Toshkent shahar", submitted: 200, total: 320 },
      { region: "Qoraqalpog'iston Resp.", submitted: 90, total: 120 }
    ]
  },
  {
    id: 2,
    title: "2023-yilgi yillik deklaratsiya",
    startDate: "2023-01-15",
    endDate: "2023-02-15",
    status: "completed",
    totalExpected: 1450,
    totalSubmitted: 1420,
    regionalStats: [
      { region: "Bosh ofis", submitted: 300, total: 300 },
      { region: "Andijon viloyati", submitted: 150, total: 150 },
      { region: "Buxoro viloyati", submitted: 140, total: 140 },
      { region: "Farg'ona viloyati", submitted: 240, total: 250 },
      { region: "Namangan viloyati", submitted: 190, total: 200 },
      { region: "Toshkent shahar", submitted: 300, total: 300 },
      { region: "Qoraqalpog'iston Resp.", submitted: 100, total: 110 }
    ]
  }
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Batafsil hududlar statistikasini ko'rish uchun (Accordion state)
  const [expandedCampaignId, setExpandedCampaignId] = useState<number | null>(null);

  // To'xtatish (Stop) modali uchun state
  const [stopModal, setStopModal] = useState<{isOpen: boolean, id: number | null}>({isOpen: false, id: null});
  
  // Yangi muddat qo'shish uchun state
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.startDate || !newCampaign.endDate) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const campaign = {
      id: campaigns.length + 1,
      ...newCampaign,
      status: "active",
      totalExpected: 1500, // Namunaviy jami xodimlar soni
      totalSubmitted: 0,
      regionalStats: [
        { region: "Bosh ofis", submitted: 0, total: 320 },
        { region: "Andijon viloyati", submitted: 0, total: 150 },
        { region: "Buxoro viloyati", submitted: 0, total: 140 },
        { region: "Farg'ona viloyati", submitted: 0, total: 250 },
        { region: "Namangan viloyati", submitted: 0, total: 200 },
        { region: "Toshkent shahar", submitted: 0, total: 320 },
        { region: "Qoraqalpog'iston Resp.", submitted: 0, total: 120 }
      ]
    };

    // Yangisi qo'shilganda eskilarini avtomatik "completed" qilib qo'yish
    const updatedCampaigns = campaigns.map(c => ({ ...c, status: "completed" }));
    
    setCampaigns([campaign, ...updatedCampaigns]);
    setShowAddForm(false);
    setNewCampaign({ title: '', startDate: '', endDate: '' });
  };

  // Kampaniyani to'xtatishni tasdiqlash
  const confirmStopCampaign = () => {
    if (stopModal.id !== null) {
      setCampaigns(campaigns.map(c => c.id === stopModal.id ? { ...c, status: "completed" } : c));
      setStopModal({ isOpen: false, id: null });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCampaignId(expandedCampaignId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">
      
      {/* TO'XTATISH MODALI (Custom Confirmation) */}
      {stopModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Jarayonni to'xtatasizmi?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Ushbu deklaratsiya qabulini to'xtatish xodimlarni tizimdan bloklaydi. Xodimlar ortiq deklaratsiya topshira olishmaydi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setStopModal({ isOpen: false, id: null })}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmStopCampaign}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
              >
                Ha, to'xtatish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (Chap menyu) */}
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
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors flex-justify-between">
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
        </nav>
        <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <FileBarChart className="w-5 h-5" /> Hisobotlar
          </Link>
        <div className="p-4 border-t border-slate-700/50">
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors mb-2">
            <Settings className="w-5 h-5" /> Sozlamalar
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
                <p className="font-semibold text-slate-900">Rustamov Otabek</p>
                <p className="text-xs text-slate-500">BKR Bosh mutaxassis</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 max-w-5xl">
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0A2540]">Kampaniyalar</h2>
              <p className="text-sm text-slate-500 mt-1">Xodimlar uchun deklaratsiya to'ldirish darchasini ochish va yopish.</p>
            </div>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white rounded-lg text-sm font-medium hover:bg-[#113559] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Yangi muddat ochish
              </button>
            )}
          </div>

          {/* YANGI MUDDAT QO'SHISH FORMASI */}
          {showAddForm && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 mb-8 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Yangi deklaratsiya mavsumini e'lon qilish
                </h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCampaign} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kampaniya nomi</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: 2024-yilgi deklaratsiya"
                    value={newCampaign.title}
                    onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Boshlanish sanasi</label>
                  <input 
                    type="date" 
                    value={newCampaign.startDate}
                    onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tugash sanasi</label>
                  <input 
                    type="date" 
                    value={newCampaign.endDate}
                    onChange={e => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white text-sm font-medium"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                  >
                    Ishga tushirish
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KAMPANIYALAR RO'YXATI */}
          <div className="space-y-4">
            {campaigns.map(campaign => {
              const isExpanded = expandedCampaignId === campaign.id;
              const globalPercentage = Math.round((campaign.totalSubmitted / campaign.totalExpected) * 100);

              return (
                <div 
                  key={campaign.id} 
                  className={`bg-white rounded-xl border p-6 shadow-sm transition-all duration-300 ${
                    campaign.status === 'active' ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{campaign.title}</h3>
                        {campaign.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                            Yakunlangan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> 
                          {campaign.startDate} dan — {campaign.endDate} gacha
                        </div>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <div className="text-xl font-bold text-[#0A2540]">
                          {campaign.totalSubmitted} <span className="text-sm font-medium text-slate-400">/ {campaign.totalExpected}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Topshirganlar</p>
                      </div>
                      
                      {campaign.status === 'active' && (
                        <button 
                          onClick={() => setStopModal({ isOpen: true, id: campaign.id })}
                          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" /> To'xtatish
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Asosiy Progress Bar */}
                  <div className="mt-6 mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span>Umumiy qabul qilish ko'rsatkichi</span>
                      <span className={globalPercentage > 80 ? 'text-emerald-600' : 'text-amber-600'}>{globalPercentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${campaign.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        style={{ width: `${globalPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hududlar bo'yicha batafsil ko'rish tugmasi */}
                  <div className="border-t border-slate-100 pt-3">
                    <button 
                      onClick={() => toggleExpand(campaign.id)}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Hududlar kesimida statistika
                    </button>

                    {/* Hududlar statistikasi (Yig'iladigan oyna) */}
                    {isExpanded && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                        {campaign.regionalStats.map((stat, idx) => {
                          const percent = Math.round((stat.submitted / stat.total) * 100);
                          return (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-slate-800">{stat.region}</span>
                                <span className={`text-xs font-bold ${percent === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  {stat.submitted} / {stat.total}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : percent > 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}