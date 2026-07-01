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
// MANA SHU YERGA 'Users' IKONKASI QO'SHILDI:
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Haqiqiy tizimda bu yerda Backend API ga so'rov yuboriladi. 
    // Hozir esa MVP (Demo) uchun 2 ta statik akkaunt qildik:
    
    setTimeout(() => {
      if (email === 'admin@nbu.uz' && password === 'admin123') {
        // ADMIN uchun login
        router.push('/admin');
      } else if (email === 'xodim@nbu.uz' && password === 'xodim123') {
        // XODIM uchun login
        router.push('/dashboard');
      } else {
        // Xato parol yoki email
        setError("Email yoki parol noto'g'ri kiritildi!");
        setIsLoading(false);
      }
    }, 800); // 0.8 soniya sun'iy kutish (haqiqiy login jarayonini o'xshatish uchun)
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Orqa fon bezaklari */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#0A2540]"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#0A2540] font-black text-2xl shadow-xl shadow-black/10">
            NBU
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          BKR Portaliga kirish
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200">
          Bank komplayens nazorati tizimi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
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
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="name@nbu.uz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Parol</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm font-medium text-slate-900 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0A2540] hover:bg-[#113559] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Tizimga kirilmoqda...' : 'Tizimga kirish'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Test qilish uchun eslatma (Taqdimotda esdan chiqmasligi uchun) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
              Test uchun akkauntlar
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => {setEmail('admin@nbu.uz'); setPassword('admin123');}}
                className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 font-mono">admin@nbu.uz<br/>admin123</div>
              </div>
              <div 
                onClick={() => {setEmail('xodim@nbu.uz'); setPassword('xodim123');}}
                className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-1">
                  <Users className="w-3.5 h-3.5" /> Xodim
                </div>
                <div className="text-[10px] text-slate-500 font-mono">xodim@nbu.uz<br/>xodim123</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}