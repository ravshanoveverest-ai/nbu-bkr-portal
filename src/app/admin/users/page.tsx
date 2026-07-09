

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Filter, Plus, Edit, Key, 
  Ban, CheckCircle, ChevronDown, Shield, User as UserIcon, X,
  UserPlus, UserCog, Mail, MapPin, Briefcase,
  FileBarChart
} from 'lucide-react';

// Namunaviy xodimlar bazasi
const initialUsers = [
  { id: 1, name: "Valiyev Alisher Baxodirovich", email: "a.valiyev@nbu.uz", region: "Bosh ofis", position: "Komplayens nazoratchi", role: "admin", status: "active" },
  { id: 2, name: "Toshmatov Sardor Olimovich", email: "s.toshmatov@nbu.uz", region: "Andijon viloyati", position: "Kredit mutaxassisi", role: "user", status: "active" },
  { id: 3, name: "Karimova Nargiza Rustamovna", email: "n.karimova@nbu.uz", region: "Toshkent shahar", position: "Buxgalter", role: "user", status: "active" },
  { id: 4, name: "Umarov Jasur Xasanovich", email: "j.umarov@nbu.uz", region: "Buxoro viloyati", position: "Filial boshqaruvchisi", role: "user", status: "blocked" },
  { id: 5, name: "Rustamov Otabek", email: "o.rustamov@nbu.uz", region: "Bosh ofis", position: "BKR Bosh mutaxassis", role: "admin", status: "active" },
];

const regionsList = ["Barcha hududlar", "Bosh ofis", "Andijon viloyati", "Buxoro viloyati", "Farg'ona viloyati", "Namangan viloyati", "Toshkent shahar", "Qoraqalpog'iston Resp."];
const formRegionsList = regionsList.filter(r => r !== "Barcha hududlar");

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Barcha hududlar");

  // Modallar uchun statelar
  const [resetModal, setResetModal] = useState<{isOpen: boolean, user: any, newPass: string | null}>({isOpen: false, user: null, newPass: null});
  const [blockModal, setBlockModal] = useState<{isOpen: boolean, user: any}>({isOpen: false, user: null});
  const [userModal, setUserModal] = useState<{isOpen: boolean, mode: 'add' | 'edit', user: any}>({isOpen: false, mode: 'add', user: null});
  
  const [formData, setFormData] = useState({ name: '', email: '', region: '', position: '', role: 'user' });

  // Filtrlash logikasi
  const filteredUsers = users.filter(user => {
    const matchRegion = selectedRegion === "Barcha hududlar" || user.region === selectedRegion;
    const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRegion && matchSearch;
  });

  // --- FUNKSIYALAR ---

  const handleResetPassword = () => {
    const generatedPassword = Math.random().toString(36).slice(-8).toUpperCase();
    setResetModal({ ...resetModal, newPass: generatedPassword });
  };

  // Shu funksiya yo'qolib qolgan edi
  const closeResetModal = () => {
    setResetModal({ isOpen: false, user: null, newPass: null });
  };

  const toggleUserStatus = () => {
    if (blockModal.user) {
      setUsers(users.map(u => 
        u.id === blockModal.user.id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
      ));
      setBlockModal({ isOpen: false, user: null });
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', region: '', position: '', role: 'user' });
    setUserModal({ isOpen: true, mode: 'add', user: null });
  };

  const openEditModal = (user: any) => {
    setFormData({ name: user.name, email: user.email, region: user.region, position: user.position, role: user.role });
    setUserModal({ isOpen: true, mode: 'edit', user: user });
  };

  const handleUserSubmit = (e: any) => {
    e.preventDefault();
    if (userModal.mode === 'add') {
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...formData,
        status: 'active'
      };
      setUsers([newUser, ...users]);
    } else {
      setUsers(users.map(u => u.id === userModal.user?.id ? { ...u, ...formData } : u));
    }
    setUserModal({ isOpen: false, mode: 'add', user: null });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">

      {/* YANGI QO'SHISH / TAHRIRLASH MODALI */}
      {userModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-[#0A2540]">
              <div className="flex items-center gap-3">
                {userModal.mode === 'add' ? <UserPlus className="w-6 h-6 text-blue-400" /> : <UserCog className="w-6 h-6 text-blue-400" />}
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {userModal.mode === 'add' ? "Yangi xodim qo'shish" : "Xodim ma'lumotlarini tahrirlash"}
                </h2>
              </div>
              <button onClick={() => setUserModal({isOpen: false, mode: 'add', user: null})} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">F.I.Sh (To'liq ism)</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Masalan: Valiyev Alisher" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="name@nbu.uz" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tizim roli</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={formData.role} onChange={(e: any) => setFormData({...formData, role: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white">
                      <option value="user">Oddiy xodim</option>
                      <option value="admin">Admin (BKR xodimi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hudud / Filial</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select required value={formData.region} onChange={(e: any) => setFormData({...formData, region: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white">
                      <option value="" disabled>Tanlang...</option>
                      {formRegionsList.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lavozimi</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={formData.position} onChange={(e: any) => setFormData({...formData, position: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Kredit mutaxassisi" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setUserModal({isOpen: false, mode: 'add', user: null})} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  {userModal.mode === 'add' ? "Qo'shish" : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAROLNI TIKLASH MODALI */}
      {resetModal.isOpen && resetModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Parolni tiklash</h3>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-semibold text-slate-700">{resetModal.user.name}</span> uchun yangi parol generatsiya qilinadi.
            </p>

            {resetModal.newPass ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Yangi parol:</p>
                <p className="text-2xl font-mono font-bold text-slate-900 tracking-widest">{resetModal.newPass}</p>
                <p className="text-xs text-slate-500 mt-2">Ushbu parolni xodimga xabar qiling. U tizimga kirgach, o'zgartirib olishi mumkin.</p>
              </div>
            ) : (
              <div className="flex gap-3 mt-8">
                <button onClick={closeResetModal} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button onClick={handleResetPassword} className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
                  Tiklash
                </button>
              </div>
            )}

            {resetModal.newPass && (
              <button onClick={closeResetModal} className="w-full py-2.5 bg-[#0A2540] text-white font-medium rounded-xl hover:bg-[#113559] transition-colors">
                Yopish
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATUS O'ZGARTIRISH (BLOKLASH) MODALI */}
      {blockModal.isOpen && blockModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${blockModal.user.status === 'active' ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {blockModal.user.status === 'active' ? <Ban className="w-8 h-8 text-red-600" /> : <CheckCircle className="w-8 h-8 text-emerald-600" />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {blockModal.user.status === 'active' ? 'Xodimni bloklash' : 'Xodimni faollashtirish'}
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Haqiqatan ham <span className="font-semibold text-slate-700">{blockModal.user.name}</span> huquqlarini o'zgartirmoqchimisiz?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBlockModal({isOpen: false, user: null})} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">
                Bekor qilish
              </button>
              <button 
                onClick={toggleUserStatus} 
                className={`flex-1 py-2.5 text-white font-medium rounded-xl transition-colors shadow-sm ${blockModal.user.status === 'active' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
              >
                Tasdiqlash
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
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors flex-justify-between">
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
                <p className="font-semibold text-slate-900">Rustamov Otabek</p>
                <p className="text-xs text-slate-500">BKR Bosh mutaxassis</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8">
          
          {/* STATISTIKA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Jami xodimlar</p>
                <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Faol xodimlar</p>
                <h3 className="text-2xl font-bold text-emerald-600">{users.filter(u => u.status === 'active').length}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Bloklanganlar</p>
                <h3 className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'blocked').length}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <Ban className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ism yoki Email orqali qidirish..."
                    value={searchQuery}
                    onChange={(e: any) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] text-sm text-slate-900 outline-none"
                  />
                </div>
                <div className="relative sm:w-56">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    value={selectedRegion}
                    onChange={(e: any) => setSelectedRegion(e.target.value)}
                    className="block w-full pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] text-sm text-slate-900 font-medium outline-none appearance-none bg-white"
                  >
                    {regionsList.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <button 
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white rounded-lg text-sm font-medium hover:bg-[#113559] transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Yangi xodim
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">F.I.Sh / Email</th>
                    <th className="px-6 py-4 whitespace-nowrap">Hudud va Lavozim</th>
                    <th className="px-6 py-4 whitespace-nowrap">Tizim roli</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0A2540]">{user.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{user.region}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{user.position}</p>
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                              <Shield className="w-3.5 h-3.5" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <UserIcon className="w-3.5 h-3.5" /> Xodim
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Faol
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-red-600">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span> Bloklangan
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setResetModal({isOpen: true, user: user, newPass: null})}
                              title="Parolni tiklash"
                              className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setBlockModal({isOpen: true, user: user})}
                              title={user.status === 'active' ? "Bloklash" : "Faollashtirish"}
                              className={`p-2 rounded-lg transition-colors border border-transparent ${user.status === 'active' ? 'text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'text-red-500 bg-red-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                            >
                              {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => openEditModal(user)}
                              title="Tahrirlash"
                              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
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