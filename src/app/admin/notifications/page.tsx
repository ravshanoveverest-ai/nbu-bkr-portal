'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Filter, AlertTriangle, 
  CheckCircle, ChevronDown, Eye, User, X, MessageSquareWarning,
  Clock, FileCheck,
  FileBarChart
} from 'lucide-react';

// MVP uchun Xabarnomalar (Notifications) namunaviy bazasi
const mockNotifications = [
  { 
    id: 1, 
    name: "Olimjonov Sardor", 
    region: "Andijon viloyati", 
    date: "2024-02-16", 
    status: "new", 
    message: "Filialimizga mijoz sifatida kelgan MCHJ rahbari mening amakim bo'lib chiqdi. Kredit ajratish komissiyasida qatnashishim manfaatlar to'qnashuviga olib kelishi mumkin.",
    resolution: "",
    registryNumber: ""
  },
  { 
    id: 2, 
    name: "Karimov Aziz", 
    region: "Bosh ofis", 
    date: "2024-02-15", 
    status: "new", 
    message: "Bankning yuridik bo'limiga yangi ishga olingan xodim mening xotinim. Garchi bo'limlarimiz boshqa-boshqa bo'lsa ham, xabardor qilib qo'ymoqchiman.",
    resolution: "",
    registryNumber: ""
  },
  { 
    id: 3, 
    name: "Usmonova Nilufar", 
    region: "Toshkent shahar", 
    date: "2024-02-15", 
    status: "new", 
    message: "Hamkor kompaniyalardan birida ta'sischilar o'zgarib, mening uzoq qarindoshim ustav kapitaliga kiribdi. Bu kompaniya bankimizga xizmat ko'rsatadi.",
    resolution: "",
    registryNumber: ""
  },
  { 
    id: 4, 
    name: "Tursunov Bekzod", 
    region: "Buxoro viloyati", 
    date: "2024-02-10", 
    status: "reviewed", 
    message: "Tender jarayonida ishtirok etayotgan ta'minotchilardan biri sobiq kursdoshim ekanligini ma'lum qilaman.",
    resolution: "Tender komissiyasi tarkibidan xodim vaqtincha chetlatildi. Jarayon shaffofligi ta'minlandi.",
    registryNumber: "BKR-2024/045"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Rezolyutsiya (Chora) va Reestr raqamini yozish uchun state
  const [resolutionText, setResolutionText] = useState("");
  const [registryNum, setRegistryNum] = useState("");

  const filteredData = notifications.filter(item => {
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = () => {
    if (!resolutionText || !registryNum) {
      alert("Iltimos, ko'rilgan chora va reestr raqamini kiriting!");
      return;
    }

    // Xabarnoma statusini yangilash
    const updatedNotifications = notifications.map(notif => 
      notif.id === selectedNotification.id 
        ? { ...notif, status: "reviewed", resolution: resolutionText, registryNumber: registryNum }
        : notif
    );
    
    setNotifications(updatedNotifications);
    setSelectedNotification(null);
    setResolutionText("");
    setRegistryNum("");
  };

  const openModal = (item: any) => {
    setSelectedNotification(item);
    setResolutionText(item.resolution || "");
    setRegistryNum(item.registryNumber || "");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">
      
      {/* XABARNOMA KO'RISH VA CHORA KO'RISH MODALI */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-[#0A2540]">
              <div className="flex items-center gap-3">
                <MessageSquareWarning className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Xabarnoma #{selectedNotification.id}</h2>
                  <p className="text-sm text-slate-300 mt-1">{selectedNotification.name} | {selectedNotification.region} | {selectedNotification.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="p-2 text-slate-300 hover:bg-white/10 hover:text-white rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 bg-white flex-1">
              
              {/* Xodim yuborgan xabar */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Mavjud manfaatlar to'qnashuvi:</h3>
                <div className="bg-[#FFFBEB] p-5 rounded-xl border border-amber-200 text-amber-900 text-base font-medium leading-relaxed shadow-sm">
                  "{selectedNotification.message}"
                </div>
              </div>

              {/* Admin tomonidan to'ldiriladigan qism */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-[#0A2540] uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" /> Tartibga solish va choralar
                </h3>
                
                {selectedNotification.status === 'new' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Ko'rilgan chora (Rahbar qarori)</label>
                      <textarea 
                        rows={3}
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Holatni bartaraf etish bo'yicha qilingan ishlar..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 text-sm resize-none bg-white"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Reestr raqami</label>
                      <input 
                        type="text" 
                        value={registryNum}
                        onChange={(e) => setRegistryNum(e.target.value)}
                        placeholder="Masalan: BKR-2024/045"
                        className="w-full sm:w-1/2 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 text-sm bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Ko'rilgan chora:</p>
                      <p className="text-sm text-slate-800 font-medium bg-white p-3 border border-slate-200 rounded-lg">{selectedNotification.resolution}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Reestr raqami:</p>
                      <p className="text-sm font-bold text-blue-700 bg-blue-50 w-max px-3 py-1.5 border border-blue-100 rounded-lg">{selectedNotification.registryNumber}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-[#F8FAFC] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
              >
                Yopish
              </button>
              {selectedNotification.status === 'new' && (
                <button 
                  onClick={handleApprove}
                  className="px-8 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Saqlash va Yopish
                </button>
              )}
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
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors flex-justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> Xabarnomalar
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => n.status === 'new').length}
            </span>
          </Link>
          <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
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
          <h1 className="text-xl font-bold text-slate-800">Xabarnomalar paneli</h1>
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
        <div className="flex-1 p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Yangi (Ko'rib chiqilmagan)</p>
                <h3 className="text-2xl font-bold text-amber-600">{notifications.filter(n => n.status === 'new').length}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Tartibga solingan</p>
                <h3 className="text-2xl font-bold text-emerald-600">{notifications.filter(n => n.status === 'reviewed').length}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Jami xabarnomalar</p>
                <h3 className="text-2xl font-bold text-slate-800">{notifications.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Ism orqali qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] text-sm text-slate-900 outline-none"
                />
              </div>
              
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >Barchasi</button>
                <button 
                  onClick={() => setStatusFilter("new")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === 'new' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >Yangilar</button>
                <button 
                  onClick={() => setStatusFilter("reviewed")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === 'reviewed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >Ko'rib chiqilgan</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">ID</th>
                    <th className="px-6 py-4 whitespace-nowrap">Xodim F.I.Sh</th>
                    <th className="px-6 py-4 whitespace-nowrap">Hudud / Filial</th>
                    <th className="px-6 py-4 whitespace-nowrap">Yuborilgan sana</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">#{item.id}</td>
                      <td className="px-6 py-4 font-bold text-[#0A2540]">{item.name}</td>
                      <td className="px-6 py-4 text-slate-700">{item.region}</td>
                      <td className="px-6 py-4 text-slate-600">{item.date}</td>
                      <td className="px-6 py-4">
                        {item.status === 'new' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Yangi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" /> Hal etilgan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openModal(item)}
                          className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-2 text-xs font-bold"
                        >
                          {item.status === 'new' ? "Ko'rib chiqish" : "Tafsilotlar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}