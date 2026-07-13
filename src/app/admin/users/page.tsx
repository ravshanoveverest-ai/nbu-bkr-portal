'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Trash2, 
  Shield, User as UserIcon, X, FileBarChart, AlertTriangle
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Admin profil ma'lumotlari
// Admin profil ma'lumotlari
const adminName = "Hasan Turaevich";
const adminRole = "BKR Boshlig'i";

  // O'chirish modali
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, userId: string | null, userName: string}>({
    isOpen: false, 
    userId: null, 
    userName: ''
  });

  // 1. Sahifa yuklanganda Admin ismini olish va Bazadan Userlarni tortib kelish
  useEffect(() => {
    // // Admin ismini o'rnatish
    // const userInfoString = localStorage.getItem('user_info');
    // if (userInfoString) {
    //   const parsedUser = JSON.parse(userInfoString);
    //   setAdminName(parsedUser.fullName || "Administrator");
    // }

    // Bazadan barcha xodimlarni olib kelish (Backend API chaqiruvi)
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://nbu-bkr-api.onrender.com/api/auth/users'); // Backenddagi API (buni endi yozamiz)
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Xodimlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrlash (Qidiruv bo'yicha)
  const filteredUsers = users.filter(user => {
    const matchSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // 2. Xodimni o'chirish logikasi
  const confirmDelete = async () => {
    if (!deleteModal.userId) return;

    try {
      const res = await fetch(`https://nbu-bkr-api.onrender.com/api/auth/users/${deleteModal.userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Ekranda ham ro'yxatdan olib tashlaymiz
        setUsers(users.filter(u => u._id !== deleteModal.userId));
        setDeleteModal({ isOpen: false, userId: null, userName: '' });
      } else {
        alert("O'chirishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Xodimni o'chirishda xato:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">

      {/* O'CHIRISH TASDIQLASH MODALI */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xodimni o'chirish</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Siz haqiqatan ham <span className="font-bold text-slate-800">{deleteModal.userName}</span>ni bazadan butunlay o'chirib tashlamoqchimisiz? Bu harakatni orqaga qaytarib bo'lmaydi va u tizimga boshqa kira olmaydi.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({isOpen: false, userId: null, userName: ''})} 
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20"
              >
                O'chirish
              </button>
            </div>
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
          <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" /> Muddatlarni sozlash
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
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
          <h1 className="text-xl font-bold text-slate-800">Xodimlar va ruxsatlar bazasi</h1>
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
        <div className="flex-1 p-8">
          
          {/* STATISTIKA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Jami ro'yxatdan o'tganlar</p>
                <h3 className="text-3xl font-black text-slate-800">{users.length}</h3>
              </div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Tizim Adminlari</p>
                <h3 className="text-3xl font-black text-indigo-600">{users.filter(u => u.role === 'admin').length}</h3>
              </div>
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ism yoki Email orqali qidirish..."
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">F.I.Sh / Email</th>
                    <th className="px-6 py-4 whitespace-nowrap">Ro'yxatdan o'tgan sana</th>
                    <th className="px-6 py-4 whitespace-nowrap">Tizim roli</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold">
                        Ma'lumotlar yuklanmoqda...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0A2540]">{user.fullName}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-700">
                            {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                              <Shield className="w-3.5 h-3.5" /> Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              <UserIcon className="w-3.5 h-3.5" /> Oddiy Xodim
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setDeleteModal({isOpen: true, userId: user._id, userName: user.fullName})}
                            title="Xodimni o'chirish"
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold">
                        Qidiruv bo'yicha xodim topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}