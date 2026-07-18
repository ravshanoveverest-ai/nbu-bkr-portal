'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Lock, Eye, EyeOff, MapPin, 
  Building2, Briefcase, Phone, CheckCircle, ShieldCheck, AlertCircle
} from 'lucide-react';

// --- HUDUD VA FILIALLAR BAZASI ---
const NBU_REGIONS: Record<string, string[]> = {
  "Toshkent shahri": [
    "Bosh amaliyot BXM", "Sebzor amaliyot BXM", "Markaziy amaliyot BXM", "Akademiya BXM",
    "Uchtepa BXM", "Bektemir BXM", "Sayohat BXM", "Mirzo Ulug‘bek BXM", "Olmazor BXM",
    "Yashnobod BXM", "Yunusobod BXM", "Yakkasaroy BXM", "Yangiobod BXM", "Sergeli BXM",
    "Mirobod bo'limi", "Yangi Sergeli BXO", "Humo BXO", "Shayhontoxur BXO", "Navro‘z BXO",
    "Atlas NBU BXO", "Texnopark BXO", "Abu Saxiy BXO", "Mirobod plaza BXO", "G‘alaba BXO",
    "\"City\" BXO"
  ],
  "Andijon viloyati": ["Andijon amaliyot BXM", "Asaka BXM", "Marxamat BXM", "Izboskan BXM", "Paxtaobod BXO", "Qo‘rg‘ontepa BXO", "Shahrixon BXO", "Boburmirzo BXO"],
  "Buxoro viloyati": ["Buxoro amaliyot BXM", "G‘ijduvon BXM", "Kogon BXM", "Qorako‘l BXM", "Romitan BXO", "Qorovulbozor BXO", "Vobkent BXO", "Shofirkon BXO", "Ark BXO", "Naqshband BXO", "Buxoro shahar BXO", "Mirkulol BXO"],
  "Farg'ona viloyati": ["Farg‘ona amaliyot BXM", "Quva BXM", "Qo‘qon BXM", "Rishton BXM", "Beshariq BXM", "Quvasoy BXO", "Buvayda BXO", "Marg‘ilon BXO", "Oltiariq BXO"],
  "Jizzax viloyati": ["Jizzax amaliyot BXM", "Mirzacho‘l BXM", "Industrial BXM", "Paxtakor BXO"],
  "Namangan viloyati": ["Namangan amaliyot BXM", "Uychi BXM", "Uchqo‘rg‘on BXM", "Chortoq BXM", "To‘raqo‘rg‘on BXO", "Kosonsoy BXO", "Chust BXO", "Sardoba BXO"],
  "Navoiy viloyati": ["Navoiy amaliyot BXM", "Zarafshon BXM", "Qiziltepa BXM", "Uchquduq BXM", "Malikrabot BXO", "Nurota BXO", "Yoshlik BXO", "Oltin vodiy BXO", "Xalqlar do‘stligi BXO"],
  "Qashqadaryo viloyati": ["Qarshi amaliyot BXM", "Shahrisabz BXM", "G‘uzor BXO", "Muborak BXO", "Yangi-nishon BXO", "Nasaf BXO"],
  "Qoraqalpog'iston Respublikasi": ["Qo‘ng‘irot BXM", "To‘rtko‘l BXM", "Nukus amaliyot BXM", "Xo‘jayli BXO", "Chimboy BXO", "Mang‘it BXO", "Nurli yo‘l BXO"],
  "Samarqand viloyati": ["Samarqand amaliyot BXM", "Jomboy BXM", "Pastdarg‘om BXM", "Urgut BXM", "Registon BXM", "Nurobod BXO", "Bulung‘ur BXO", "Kattaqo‘rg‘on BXO", "Zarmitan BXO", "Qorasuv BXO", "Tadbirkor BXO", "Payariq BXO", "Tayloq BXO", "Do‘stlik BXO"],
  "Sirdaryo viloyati": ["Guliston amaliyot BXM", "Oqoltin BXO"],
  "Surxondaryo viloyati": ["Termiz amaliyot BXM", "Qumqo‘rg‘on BXM", "Denov BXM", "Sherobod BXO", "Jarqo‘rg‘on BXO", "Ayritom BXO", "Sangardak BXO"],
  "Toshkent viloyati": ["Nurafshon amaliyot BXM", "Angren BXM", "Bekobod BXM", "Yangiyo‘l BXM", "G‘azalkent BXO", "Olmaliq BXO", "Chirchiq BXO", "Metallurg BXO", "Zarhal BXO", "Oydin BXO", "Zangiota BXO", "Toshkent viloyati BXO"],
  "Xorazm viloyati": ["Xorazm amaliyot BXM", "Hazorasp BXM", "Xonqa BXO", "Shovot BXM", "Yangiariq BXO", "Karvon BXO", "Gurlan BXO", "Xiva BXO", "Qo‘shko‘pir BXO"]
};

export default function RegisterPage() {
  const router = useRouter();

  // --- FORM STATELARI ---
  const [formData, setFormData] = useState({
    fullName: '',
    region: '',
    branch: '',
    position: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const API_URL = 'https://nbu-bkr-api.onrender.com/api/auth';

  // --- PAROL VALIDATSIYASI UCHUN QOIDALAR ---
  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    isLatin: /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]+$/.test(formData.password) && formData.password.length > 0
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Agar viloyat o'zgarsa, filialni tozalab yuboramiz
    if (name === 'region') {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Barcha maydonlar to'ldirilganligini tekshirish
    if (!formData.fullName || !formData.region || !formData.branch || !formData.position || !formData.phone || !formData.email) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    // Parol qoidalarini tekshirish
    if (!passwordRules.length || !passwordRules.uppercase || !passwordRules.specialChar || !passwordRules.isLatin) {
      setError("Parol belgilangan qoidalarga javob bermaydi.");
      return;
    }

    // Parollar mosligini tekshirish
    if (formData.password !== formData.confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi.");
      return;
    }

    // API orqali ro'yxatdan o'tish
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          region: formData.region,
          branch: formData.branch,
          position: formData.position,
          phone: formData.phone
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      setSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Tizimga yo'naltirilmoqdasiz...");
      
      // 2 soniyadan so'ng login pageda o'tkazish
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans relative flex flex-col items-center">
      
      {/* Tepa qism - To'q ko'k fon */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#0A2540] z-0"></div>

      {/* Asosiy kontent */}
      <div className="z-10 w-full max-w-[500px] mt-12 mb-12 px-4 flex flex-col items-center">
        
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

        {/* Ro'yxatdan o'tish formasi (Karta) */}
        <div className="bg-white rounded-2xl shadow-xl w-full p-8 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. F.I.SH */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">F.I.Sh</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="To'liq ism-sharifingiz" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* 2. Viloyat */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Hudud / Viloyat</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Viloyatni tanlang</option>
                  {Object.keys(NBU_REGIONS).map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. BXM / BXO */}
            {formData.region && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Filial (BXM / BXO)</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select 
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Filialni tanlang</option>
                    {NBU_REGIONS[formData.region].map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 4. Lavozimi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Lavozimi</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Lavozimingizni kiriting" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-1.5 ml-1">
                * Lavozim nomi to'liq ko'rsatilishi shart.
              </p>
            </div>

            {/* 5. Telefon raqami */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Telefon raqam</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998 90 123 45 67" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* 6. Korporativ Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Korporativ Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@nbu.uz" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            {/* 7. Parol va Validatsiya */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Parol qoidalari ro'yxati */}
              <div className="mt-3 space-y-1.5 ml-1">
                <p className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors ${passwordRules.isLatin ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Faqat lotin alifbosi harflari va raqamlar
                </p>
                <p className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors ${passwordRules.length ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Eng kamida 8 ta belgi
                </p>
                <p className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors ${passwordRules.uppercase ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Eng kamida bitta katta harf (A-Z)
                </p>
                <p className={`text-[11px] font-bold flex items-center gap-1.5 transition-colors ${passwordRules.specialChar ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Eng kamida bitta maxsus belgi (!, @, #, $, va hk.)
                </p>
              </div>
            </div>

            {/* 8. Parolni tasdiqlash */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Parolni qayta kiriting</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Yuborish tugmasi */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 py-3.5 bg-[#0A2540] text-white font-bold rounded-xl shadow-lg hover:bg-[#0f3458] hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish"}
              {!isLoading && <ShieldCheck className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-500">
              Akkauntingiz bormi? <Link href="/login" className="text-blue-600 font-bold hover:underline">Tizimga kirish</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}