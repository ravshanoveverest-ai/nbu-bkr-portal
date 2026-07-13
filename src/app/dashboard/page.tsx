'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ShieldAlert, LogOut, User, ChevronRight,
  CalendarDays, ArrowLeftRight, UserPlus, X, Lock, 
  AlertCircle, Save, Edit3, CheckCircle, Database
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // MODALLAR STATELARI
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // DINAMIK HOLATLAR
  const [isAnnualLocked, setIsAnnualLocked] = useState(true); 
  const [annualLockReason, setAnnualLockReason] = useState<'no_campaign' | 'already_submitted'>('no_campaign');
  const [hasSavedData, setHasSavedData] = useState(false); 

  // PROFIL MA'LUMOTLARI
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Yuklanmoqda...",
    email: "Yuklanmoqda...",
    role: "user",
    phone: "+998 90 000 00 00",
    region: "Bosh ofis",
    position: "Mutaxassis",
    passport: "Kiritilmagan",
    pinfl: "Kiritilmagan"
  });

  useEffect(() => {
    // 1. LocalStorage dan User ma'lumotlarini o'qib olish
    const userInfoString = localStorage.getItem('user_info');
    let currentUserEmail = '';

    if (userInfoString) {
      const parsedUser = JSON.parse(userInfoString);
      currentUserEmail = parsedUser.email || '';
      setProfileData(prev => ({
        ...prev,
        fullName: parsedUser.fullName || prev.fullName,
        email: parsedUser.email || prev.email,
        role: parsedUser.role || prev.role,
        phone: parsedUser.phone || prev.phone,
        passport: parsedUser.passport || prev.passport,
        pinfl: parsedUser.pinfl || prev.pinfl,
      }));
    }

    // 2. Yillik deklaratsiya holatini (ochiq/yopiq va topshirilganligini) tekshirish
    const checkStatus = async () => {
      try {
        // Faol kampaniyalarni tortish
        const resCamps = await fetch('https://nbu-bkr-api.onrender.com/api/campaigns');
        const campaigns = resCamps.ok ? await resCamps.json() : [];
        const activeCamp = campaigns.find((camp: any) => camp.status === 'active');

        // Barcha deklaratsiyalarni tortish va xodimnikini ajratib olish
        if (currentUserEmail) {
          const resDecls = await fetch('https://nbu-bkr-api.onrender.com/api/declarations');
          if (resDecls.ok) {
            const allDecls = await resDecls.json();
            const myDecls = allDecls.filter((d: any) => d.userEmail === currentUserEmail);
            
            // Xodimda umuman deklaratsiya bormi? (Profil uchun)
            if (myDecls.length > 0) setHasSavedData(true);

            // Faol muddat bor bo'lsa, xodim shu muddatga 'yillik' yuborganmi tekshiramiz
            if (activeCamp) {
              const hasSubmittedAnnual = myDecls.some((d: any) => 
                d.type === 'yillik' && d.campaignId === activeCamp._id
              );
              
              if (hasSubmittedAnnual) {
                // Agar yuborgan bo'lsa qulflaymiz
                setIsAnnualLocked(true);
                setAnnualLockReason('already_submitted');
              } else {
                // Yubormagan bo'lsa ochiq turadi
                setIsAnnualLocked(false);
              }
            } else {
              // Faol kampaniya umuman yo'q
              setIsAnnualLocked(true);
              setAnnualLockReason('no_campaign');
            }
          }
        }
      } catch (error) {
        console.error("Xatolik:", error);
      }
    };

    checkStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bkr_token'); 
    localStorage.removeItem('user_info');
    router.push('/login');
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    localStorage.setItem('user_info', JSON.stringify({
      fullName: profileData.fullName,
      email: profileData.email,
      role: profileData.role,
      phone: profileData.phone,
      passport: profileData.passport,
      pinfl: profileData.pinfl
    }));
  };

  const getInitials = (name: string) => {
    if (!name || name === "Yuklanmoqda...") return "U";
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getShortName = (name: string) => {
    if (!name || name === "Yuklanmoqda...") return "Foydalanuvchi";
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[1]} ${parts[0]}` : name;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative">
      
      {/* 1. PROFIL MODALI */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-[#0A2540] rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Mening profilim
              </h2>
              <button onClick={() => {setShowProfileModal(false); setIsEditingProfile(false);}} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold border-2 border-white shadow-md">
                      {getInitials(profileData.fullName)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{profileData.fullName}</h3>
                      <p className="text-sm text-slate-500">
                        {profileData.role === 'admin' ? "Administrator" : profileData.position} ({profileData.region})
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={isEditingProfile ? handleSaveProfile : () => setIsEditingProfile(true)} 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isEditingProfile ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
                  >
                    {isEditingProfile ? <><Save className="w-4 h-4"/> Saqlash</> : <><Edit3 className="w-4 h-4"/> Tahrirlash</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email manzil</label>
                    {isEditingProfile ? (
                      <input type="email" disabled value={profileData.email} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-slate-100 cursor-not-allowed text-slate-500" />
                    ) : <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profileData.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Telefon raqam</label>
                    {isEditingProfile ? (
                      <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600" />
                    ) : <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profileData.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pasport</label>
                    {isEditingProfile ? (
                      <input type="text" value={profileData.passport} onChange={e => setProfileData({...profileData, passport: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600 uppercase" />
                    ) : <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profileData.passport}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">JSHSHIR</label>
                    {isEditingProfile ? (
                      <input type="text" value={profileData.pinfl} onChange={e => setProfileData({...profileData, pinfl: e.target.value.replace(/\D/g, '')})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600" />
                    ) : <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profileData.pinfl}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Mening Deklaratsiyam
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-indigo-800">
                    Sizning oxirgi to'ldirgan deklaratsiyangiz tizimda saqlanganligi holati:
                  </p>
                  {hasSavedData ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5"/> Saqlangan
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5"/> Mavjud emas
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. DEKLARATSIYA TURINI TANLASH MODALI */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Deklaratsiya turini tanlang</h2>
                <p className="text-sm text-slate-500 mt-1">Hozirgi holatingizga mos keladigan deklaratsiyani tanlang.</p>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Yillik deklaratsiya (DINAMIK QULFLANGAN) */}
              <div 
                className={`relative border-2 rounded-xl p-5 transition-all ${!isAnnualLocked ? 'border-blue-100 hover:border-blue-500 hover:shadow-md cursor-pointer bg-white group' : 'border-slate-200 bg-slate-50 opacity-80 cursor-not-allowed'}`}
                onClick={() => !isAnnualLocked && router.push('/declaration?type=yillik')}
              >
                {isAnnualLocked && (
                  <div className={`absolute -top-3 -right-2 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold shadow-md ${annualLockReason === 'already_submitted' ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    {annualLockReason === 'already_submitted' ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />} 
                    {annualLockReason === 'already_submitted' ? 'Topshirilgan' : 'Yopiq'}
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${!isAnnualLocked ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors' : (annualLockReason === 'already_submitted' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500')}`}>
                  {isAnnualLocked ? (annualLockReason === 'already_submitted' ? <CheckCircle className="w-6 h-6" /> : <Lock className="w-5 h-5" />) : <CalendarDays className="w-6 h-6" />}
                </div>
                <h3 className={`font-bold mb-2 ${!isAnnualLocked ? 'text-slate-800' : 'text-slate-600'}`}>Yillik deklaratsiya</h3>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  {isAnnualLocked && annualLockReason === 'already_submitted' 
                    ? "Siz joriy muddat uchun yillik deklaratsiyani muvaffaqiyatli topshirgansiz. Yana to'ldirish talab etilmaydi." 
                    : "Har yili belgilangan muddatda barcha xodimlar tomonidan ommaviy to'ldiriladigan navbatdagi deklaratsiya."}
                </p>
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
                <p className="text-[11px] text-slate-500 leading-relaxed">Boshqa bo'limga, filialga o'tganda yoki lavozim o'zgarganda to'ldiriladi.</p>
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
                <p className="text-[11px] text-slate-500 leading-relaxed">Bankka birinchi marta ishga kirayotgan nomzodlar tomonidan to'ldiriladi.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-[#0A2540] text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white px-2 py-1.5 rounded-lg flex items-center justify-center shadow-sm">
             <img src="/nbu-logo.png" alt="NBU" className="h-7 w-auto object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight tracking-wide">O'zmilliybank</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest font-medium mt-0.5">Korporativ Xodimlar Portali</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          
          <div 
            onClick={() => setShowProfileModal(true)} 
            className="flex items-center gap-3 bg-white/10 py-1.5 px-2.5 sm:px-3 rounded-full border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border border-white/20 font-bold text-sm">
              {getInitials(profileData.fullName)}
            </div>
            <span className="text-sm font-medium mr-1 hidden sm:block">
              {getShortName(profileData.fullName)}
            </span>
          </div>
          
          <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#0A2540]">Xush kelibsiz!</h2>
          <p className="text-slate-500 mt-2 text-base">O'zingizga kerakli bo'limni tanlang.</p>
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
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Manfaatlar To'qnashuvi Deklaratsiyasi</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Tizim orqali o'zingiz va sizga aloqador shaxslarning bank bilan bo'lishi mumkin bo'lgan manfaatlar to'qnashuvi holatlarini rasmiy ravishda ma'lum qiling.
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
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
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