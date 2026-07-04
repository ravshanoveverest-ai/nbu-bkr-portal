// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Login attempt:', { email, password });
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="bg-[#0A2540] p-6 text-center">
//           <h1 className="text-2xl font-bold text-white tracking-wide">NBU Komplayens</h1>
//           <p className="text-slate-300 text-sm mt-2">Tizimga kirish</p>
//         </div>
        
//         <div className="p-8">
//           <form onSubmit={handleLogin} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-slate-400" />
//                 </div>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none transition-colors"
//                   placeholder="name@nbu.uz"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-slate-400" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] sm:text-sm outline-none transition-colors"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0A2540] hover:bg-[#113559] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] transition-colors"
//             >
//               Kirish
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm">
//             <span className="text-slate-500">Hisobingiz yo'qmi? </span>
//             <Link href="/register" className="text-blue-600 font-medium hover:text-blue-500">
//               Ro'yxatdan o'tish
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, Mail, AlertCircle, ArrowRight, User, 
  KeyRound, CheckCircle, X, ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Asosiy formalar state'i
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Parolni tiklash (Forgot Password) modali state'lari
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // --- ASOSIY KONTROLLERLAR ---

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      if (authMode === 'register') {
        // Ro'yxatdan o'tish logikasi (Demo)
        if (password.length < 6) {
          setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
          setIsLoading(false);
          return;
        }
        setSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Tizimga kiring.");
        setAuthMode('login');
        setPassword('');
        setIsLoading(false);
      } else {
        // Tizimga kirish logikasi (Demo)
        if (email.includes('admin@nbu.uz')) {
          router.push('/admin'); // Admin uchun
        } else if (email && password) {
          router.push('/dashboard'); // Xodim uchun
        } else {
          setError("Iltimos, email va parolni kiriting.");
        }
        setIsLoading(false);
      }
    }, 1000);
  };

  // --- PAROLNI TIKLASH KONTROLLERLARI ---

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotStep(2); // Email tasdiqlangach, kod so'rash bosqichiga o'tadi
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (resetCode === '123456') { // Demo uchun to'g'ri kod
        setForgotStep(3); // Yangi parol kiritish bosqichiga o'tadi
      } else {
        setError("Tasdiqlash kodi noto'g'ri. (Demo kod: 123456)");
      }
    }, 800);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmNewPassword) {
      setError("Parollar bir-biriga mos kelmadi!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowForgotModal(false);
      setForgotStep(1);
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccess("Parolingiz muvaffaqiyatli yangilandi! Tizimga kirishingiz mumkin.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* ORQA FON BEZAKLARI */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#0A2540]"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
      
      {/* PAROLNI TIKLASH MODALI */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
            <button 
              onClick={() => {setShowForgotModal(false); setForgotStep(1); setError('');}} 
              className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Parolni tiklash</h2>
              <p className="text-sm text-slate-500 mt-1">
                {forgotStep === 1 && "Korporativ pochtangizni kiriting, biz tasdiqlash kodini yuboramiz."}
                {forgotStep === 2 && "Pochtangizga yuborilgan 6 xonali kodni kiriting."}
                {forgotStep === 3 && "Yangi xavfsiz parol o'rnating."}
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* 1-BOSQICH: EMAIL */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email manzil</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    placeholder="name@nbu.uz"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-[#113559] transition-colors disabled:opacity-70">
                  {isLoading ? 'Yuborilmoqda...' : 'Kodni yuborish'}
                </button>
              </form>
            )}

            {/* 2-BOSQICH: TASDIQLASH KODI */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tasdiqlash kodi</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-center tracking-[0.5em] font-bold text-lg"
                    placeholder="------"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-[#113559] transition-colors disabled:opacity-70">
                  {isLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                </button>
              </form>
            )}

            {/* 3-BOSQICH: YANGI PAROL */}
            {forgotStep === 3 && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Yangi parol</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Parolni tasdiqlang</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70">
                  {isLoading ? 'Saqlanmoqda...' : 'Saqlash va Kirish'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* HEADER LOGO QISMI */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          {/* NBU HAQIQIY LOGOTIPI */}
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/10 flex items-center justify-center w-24 h-24">
             <img src="/nbu-logo.png" alt="NBU Logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          "O‘zmilliybank" AJ Portali
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200">
          Xodimlar uchun yagona korporativ tizim
        </p>
      </div>

      {/* ASOSIY FORMA */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-5 h-5 shrink-0" /> {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            
            {/* RO'YXATDAN O'TISH UCHUN F.I.SH */}
            {authMode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">F.I.Sh</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm font-medium text-slate-900 transition-shadow"
                    placeholder="To'liq ism-sharifingiz"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Korporativ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="name@nbu.uz"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Parol</label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Parolni unutdingizmi?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0A2540] hover:bg-[#113559] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Iltimos kuting...' : (authMode === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish")}
                {!isLoading && authMode === 'login' && <ArrowRight className="w-4 h-4" />}
                {!isLoading && authMode === 'register' && <ShieldCheck className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* SAHIFA O'ZGARISHLARI (LOGIN <-> REGISTER) */}
          <div className="mt-6 text-center">
            {authMode === 'login' ? (
              <p className="text-sm text-slate-600">
                Akkauntingiz yo'qmi?{' '}
                <button onClick={() => {setAuthMode('register'); setError(''); setSuccess('');}} className="font-bold text-blue-600 hover:underline transition-all">
                  Ro'yxatdan o'tish
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Akkauntingiz bormi?{' '}
                <button onClick={() => {setAuthMode('login'); setError(''); setSuccess('');}} className="font-bold text-blue-600 hover:underline transition-all">
                  Tizimga kirish
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}