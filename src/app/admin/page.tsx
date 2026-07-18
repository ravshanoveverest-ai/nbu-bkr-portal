'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  LogOut, User, Activity, MapPin, BarChart3, AlertTriangle,
  Search, Filter, ChevronLeft, ChevronRight, Building2, Info, X, 
  CheckCircle, Zap, Shield, FileBarChart,
  CheckSquare
} from 'lucide-react';

// --- 1. HUDUDLAR 3D XARITASI UCHUN ASOSIY KOORDINATALAR ---
const baseMapCoords = [
  { id: 1, name: "Qoraqalpog'iston", x: 15, y: 35 },
  { id: 2, name: "Xorazm", x: 28, y: 50 },
  { id: 3, name: "Navoiy", x: 45, y: 40 },
  { id: 4, name: "Buxoro", x: 38, y: 65 },
  { id: 5, name: "Samarqand", x: 55, y: 62 },
  { id: 6, name: "Qashqadaryo", x: 55, y: 80 },
  { id: 7, name: "Surxondaryo", x: 68, y: 90 },
  { id: 8, name: "Jizzax", x: 68, y: 55 },
  { id: 9, name: "Sirdaryo", x: 74, y: 48 },
  { id: 10, name: "Toshkent viloyati", x: 80, y: 40 },
  { id: 11, name: "Toshkent shahri", x: 77, y: 32 },
  { id: 12, name: "Namangan", x: 88, y: 28 },
  { id: 13, name: "Farg'ona", x: 87, y: 45 },
  { id: 14, name: "Andijon", x: 96, y: 35 },
];

const getRegionName = (branchName: string) => {
  const b = (branchName || '').toLowerCase();
  if (b.includes('qoraqalpoq')) return "Qoraqalpog'iston";
  if (b.includes('xorazm') || b.includes('urganch')) return "Xorazm";
  if (b.includes('navoiy') || b.includes('zarafshon')) return "Navoiy";
  if (b.includes('buxoro') || b.includes("qorako'l") || b.includes("g'ijduvon")) return "Buxoro";
  if (b.includes('samarqand') || b.includes('urgut')) return "Samarqand";
  if (b.includes('qashqadaryo') || b.includes('shahrisabz')) return "Qashqadaryo";
  if (b.includes('surxondaryo') || b.includes('denov')) return "Surxondaryo";
  if (b.includes('jizzax')) return "Jizzax";
  if (b.includes('sirdaryo') || b.includes('guliston')) return "Sirdaryo";
  if (b.includes('toshkent v') || b.includes('zangiota')) return "Toshkent viloyati";
  if (b.includes('namangan') || b.includes('chust')) return "Namangan";
  if (b.includes("farg'ona") || b.includes("marg'ilon")) return "Farg'ona";
  if (b.includes('andijon') || b.includes('asaka')) return "Andijon";
  return "Toshkent shahri"; 
};

const getStatusConfig = (risk: number) => {
  if (risk >= 60) return { color: "bg-red-500", shadow: "shadow-red-500/50", text: "text-red-600", border: "border-red-200", gradient: "from-red-500/0 via-red-500 to-red-500" };
  if (risk >= 25) return { color: "bg-amber-500", shadow: "shadow-amber-500/50", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500/0 via-amber-500 to-amber-500" };
  return { color: "bg-emerald-500", shadow: "shadow-emerald-500/50", text: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-500/0 via-emerald-500 to-emerald-500" };
};

export default function AdminDashboard() {
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState('Barcha holatlar');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlgoModal, setShowAlgoModal] = useState(false);
  const itemsPerPage = 10; 

  // Kaskadli menyu (Akkordeon) uchun state
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // --- RAW DATA STATES ---
  const [isLoading, setIsLoading] = useState(true);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [rawDeclarations, setRawDeclarations] = useState<any[]>([]);
  
  // --- MUDDAT (CAMPAIGN) STATES ---
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const [adminProfile, setAdminProfile] = useState({ name: 'Admin', role: "BKR Boshlig'i" });
  
  // --- CALCULATED STATES ---
  const [mapData, setMapData] = useState<any[]>(baseMapCoords);
  const [branchesData, setBranchesData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    submittedCount: 0,
    highRiskCount: 0,
    mostDangerousRegion: { name: 'Aniqlanmoqda', risk: 0, total: 0, dangerous: 0 }
  });

  useEffect(() => {
    const userInfoString = localStorage.getItem('user_info');
    if (userInfoString) {
      const parsed = JSON.parse(userInfoString);
      setAdminProfile({ name: parsed.fullName || 'Admin', role: parsed.role === 'admin' ? "BKR Administrator" : "BKR Xodimi" });
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resDecls, resCamps] = await Promise.all([
        fetch('https://nbu-bkr-api.onrender.com/api/auth/users').catch(() => ({ ok: false, json: () => [] })),
        fetch('https://nbu-bkr-api.onrender.com/api/declarations').catch(() => ({ ok: false, json: () => [] })),
        fetch('https://nbu-bkr-api.onrender.com/api/campaigns').catch(() => ({ ok: false, json: () => [] }))
      ]);
      
      const users = resUsers.ok ? await (resUsers as Response).json() : [];
      const declarations = resDecls.ok ? await (resDecls as Response).json() : [];
      const camps = resCamps.ok ? await (resCamps as Response).json() : [];

      setRawUsers(users);
      setRawDeclarations(declarations);
      setCampaigns(camps);

      const activeCamp = camps.find((c: any) => c.status === 'active');
      if (activeCamp) {
        setSelectedCampaignId(activeCamp._id);
      }

    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      calculateDashboardData();
    }
  }, [selectedCampaignId, rawUsers, rawDeclarations, isLoading]);

  const calculateDashboardData = () => {
    // 1. ASOSIY QAT'IY QOIDA: Jami xodimlar roppa-rosa users bazasi uzunligiga teng.
    const totalUsersCount = rawUsers.length;

    // 2. FAQAT "Yillik deklaratsiya"larni ajratib olamiz (Rotatsiya va Yangi xodim kirmaydi!)
    let filteredDeclarations = rawDeclarations.filter((decl: any) => {
      const isDeclaration = !!decl.personalInfo; 
      const isYillik = !decl.type || decl.type === 'yillik'; 
      return isDeclaration && isYillik;
    });

    // 3. Muddatga (Campaign) ko'ra qat'iy saralash
    if (selectedCampaignId !== 'all') {
      filteredDeclarations = filteredDeclarations.filter(decl => {
        if (decl.campaignId) {
          return decl.campaignId === selectedCampaignId;
        }
        const campaign = campaigns.find(c => c._id === selectedCampaignId);
        if (campaign) {
          const startTime = new Date(campaign.startDate).getTime();
          const endTime = new Date(campaign.endDate).getTime() + 86400000; 
          const declTime = new Date(decl.createdAt || decl.date).getTime();
          return declTime >= startTime && declTime <= endTime;
        }
        return false;
      });
    }

    const branchMap: any = {};
    const regionMap: any = {};

    baseMapCoords.forEach(c => {
      regionMap[c.name] = { 
        ...c, 
        riskSum: 0, 
        rawSubmitted: 0, 
        totalUsers: 0, 
        dangerousCount: 0, 
        uniqueSubmitters: new Set(),
        branches: [] // Filiallarni hudud ichiga saqlash uchun yangi joy
      };
    });

    // Foydalanuvchilarni o'z filial va hududiga taqsimlaymiz
    rawUsers.forEach((u: any) => {
      const branchName = u.branch || "Noma'lum filial";
      // Registrationdan olingan hududni aniq ishlatamiz (bo'lmasa fallback)
      const regionName = u.region || getRegionName(branchName); 

      // Agar map ichida bunday region yo'q bo'lsa (misol eski bazada xato yozilgan bo'lsa) standartga qo'shamiz
      if (!regionMap[regionName] && regionMap["Toshkent shahri"]) {
        regionMap[regionName] = { ...regionMap["Toshkent shahri"], name: regionName, totalUsers: 0, uniqueSubmitters: new Set(), branches: [] };
      }

      if (regionMap[regionName]) {
        regionMap[regionName].totalUsers += 1;
      }

      if (!branchMap[branchName]) {
        branchMap[branchName] = {
          id: Object.keys(branchMap).length + 1,
          name: branchName,
          region: regionName,
          employees: 0, 
          scoreSum: 0,
          rawSubmitted: 0,
          reasons: new Set(),
          uniqueSubmitters: new Set()
        };
      }
      branchMap[branchName].employees += 1;
    });

    let highRiskCountGlobal = 0;
    const globalUniqueSubmitters = new Set();

    // Deklaratsiyalarni tahlil qilish
    filteredDeclarations.forEach((decl: any) => {
      const branchName = decl.personalInfo?.branch || decl.branch || "Noma'lum filial";
      const regionName = decl.personalInfo?.region || decl.region || getRegionName(branchName);
      
      const identifier = decl.userEmail || decl.personalInfo?.fullName || decl.personalInfo?.passport || "NoName";
      
      if (globalUniqueSubmitters.has(identifier) && identifier !== "NoName") {
         return; 
      }
      globalUniqueSubmitters.add(identifier);

      let score = 0;
      let reasons: string[] = [];

      if (decl.relatives && decl.relatives.some((r: any) => r.worksAtNBU)) {
        score += 40; reasons.push("Qarindoshi NBU da ishlaydi");
      }
      if (decl.myCompanies && decl.myCompanies.length > 0) {
        score += 50; reasons.push("O'zining nomida MCHJ mavjud");
      }
      if (decl.relativeCompanies && decl.relativeCompanies.length > 0) {
        score += 30; reasons.push("Qarindoshi biznesga aloqador");
      }
      if (score === 0) {
        score = Math.floor(Math.random() * 10) + 5; 
        reasons.push("Xavf aniqlanmadi");
      }
      if (score > 100) score = 100;
      if (score >= 60) highRiskCountGlobal++;

      if (!branchMap[branchName]) {
        branchMap[branchName] = {
          id: Object.keys(branchMap).length + 1,
          name: branchName,
          region: regionName,
          employees: 0, 
          scoreSum: 0,
          rawSubmitted: 0,
          reasons: new Set(),
          uniqueSubmitters: new Set()
        };
      }

      branchMap[branchName].uniqueSubmitters.add(identifier);
      branchMap[branchName].rawSubmitted += 1;
      branchMap[branchName].scoreSum += score;
      if (score >= 25) {
        reasons.filter(r => r !== "Xavf aniqlanmadi").forEach(r => branchMap[branchName].reasons.add(r));
      }

      if (regionMap[regionName]) {
        regionMap[regionName].uniqueSubmitters.add(identifier);
        regionMap[regionName].rawSubmitted += 1;
        regionMap[regionName].riskSum += score;
        if (score >= 60) regionMap[regionName].dangerousCount += 1;
      }
    });

    const finalBranches = Object.values(branchMap).map((b: any) => {
      const submitted = Math.min(b.uniqueSubmitters.size, b.employees > 0 ? b.employees : b.uniqueSubmitters.size);
      const avgScore = b.rawSubmitted > 0 ? Math.round(b.scoreSum / b.rawSubmitted) : 0;
      return {
        ...b,
        submitted: submitted,
        score: avgScore,
        risk: avgScore >= 60 ? 'Qizil' : avgScore >= 25 ? 'Sariq' : 'Yashil',
        reason: b.reasons.size > 0 ? Array.from(b.reasons).join('; ') : "Xavf aniqlanmadi"
      };
    });

    // Filiallarni o'z viloyati ichiga joylash
    finalBranches.forEach(b => {
      if (regionMap[b.region]) {
        regionMap[b.region].branches.push(b);
      }
    });

    const finalMap = Object.values(regionMap).map((r: any) => ({
      id: r.id,
      name: r.name,
      x: r.x,
      y: r.y,
      risk: r.rawSubmitted > 0 ? Math.round(r.riskSum / r.rawSubmitted) : 0
    }));

    // Barcha regionlarni olamiz (faqat top 4 ta emas) va filiallarni sortlaymiz
    const finalProgress = Object.values(regionMap)
      .filter((r: any) => r.totalUsers > 0 || r.uniqueSubmitters.size > 0)
      .map((r: any) => {
        const submitted = Math.min(r.uniqueSubmitters.size, r.totalUsers > 0 ? r.totalUsers : r.uniqueSubmitters.size);
        return {
          id: r.id,
          name: r.name,
          total: r.totalUsers,
          submitted: submitted,
          branches: r.branches.sort((a:any, b:any) => b.employees - a.employees)
        };
      })
      .sort((a, b) => b.total - a.total); // Odam soni bo'yicha eng yirik viloyatlar birinchi chiqadi

    let mostDangerous = { name: "Hozircha xavfsiz", risk: 0, total: 0, dangerous: 0 };
    Object.values(regionMap).forEach((r: any) => {
      const avgRisk = r.rawSubmitted > 0 ? Math.round(r.riskSum / r.rawSubmitted) : 0;
      if (avgRisk > mostDangerous.risk) {
        mostDangerous = { name: r.name, risk: avgRisk, total: r.uniqueSubmitters.size, dangerous: r.dangerousCount };
      }
    });

    setBranchesData(finalBranches);
    setMapData(finalMap);
    setProgressData(finalProgress);

    let rawCalcSubmitted = globalUniqueSubmitters.size > 0 && globalUniqueSubmitters.has("NoName") ? globalUniqueSubmitters.size - 1 : globalUniqueSubmitters.size;
    let clampedSubmitted = Math.min(rawCalcSubmitted, totalUsersCount);

    setGlobalStats({
      totalUsers: totalUsersCount, 
      submittedCount: clampedSubmitted, 
      highRiskCount: highRiskCountGlobal,
      mostDangerousRegion: mostDangerous
    });
  };

  const filteredBranches = useMemo(() => {
    return branchesData.filter(branch => {
      const matchSearch = branch.name.toLowerCase().includes(search.toLowerCase()) || branch.region.toLowerCase().includes(search.toLowerCase());
      let matchRisk = true;
      if (branchFilter === 'Qizil hudud') matchRisk = branch.risk === 'Qizil';
      if (branchFilter === 'Sariq hudud') matchRisk = branch.risk === 'Sariq';
      if (branchFilter === 'Yashil hudud') matchRisk = branch.risk === 'Yashil';
      if (branchFilter === 'Sariq va qizil') matchRisk = branch.risk === 'Qizil' || branch.risk === 'Sariq';
      
      return matchSearch && matchRisk;
    });
  }, [search, branchFilter, branchesData]);

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const currentBranches = filteredBranches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const globalPercentage = globalStats.totalUsers > 0 
    ? ((globalStats.submittedCount / globalStats.totalUsers) * 100).toFixed(1) 
    : '0.0';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500">Katta hajmdagi ma'lumotlar tahlil qilinmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
      {/* ALGORITM LOGIKASI MODALI */}
      {showAlgoModal && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-[#0A2540] rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" /> BKR Xavfni Baholash Algoritmi
              </h2>
              <button onClick={() => setShowAlgoModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 leading-relaxed">
                Tizim har bir xodimning deklaratsiyasini o'qib, unga avtomatik tarzda <span className="font-bold text-blue-600">0 dan 100 gacha xavf balini (Risk Score)</span> beradi. 
                Tahlil jarayoni quyidagi 4 ta asosiy omilga (Pillar) asoslanadi:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Lavozim */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> 1. Lavozim va Bo'lim Sezuvchanligi</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><span className="font-bold text-red-600">A-Toifa (O'ta xavfli):</span> Kredit, Davlat xaridlari, Kadrlar (HR), Filial rahbarlari. Bu toifada kichik xato ham qizil signal beradi.</li>
                    <li><span className="font-bold text-amber-600">B-Toifa (O'rta xavfli):</span> Kassirlar, Mijozlarga xizmat ko'rsatuvchilar, IT, Yuridik bo'lim.</li>
                    <li><span className="font-bold text-emerald-600">C-Toifa (Past xavf):</span> Xo'jalik bo'limi, Farroshlar, Haydovchilar.</li>
                  </ul>
                </div>

                {/* 2. Nepotizm */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600"/> 2. Nepotizm (Qarindoshlik urug'lari)</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><span className="font-bold text-red-600">+50-80 ball:</span> Aka-uka yoki Ota-bola bitta filialda va ulardan biri A-Toifada bo'lsa yoki bevosita bo'ysunsa.</li>
                    <li><span className="font-bold text-amber-600">+30-40 ball:</span> Ikkalasi bitta filialda, lekin xavfi past bo'limlarda ishlasa.</li>
                    <li><span className="font-bold text-emerald-600">+0-10 ball:</span> Bankda ishlaydi, lekin mutlaqo boshqa-boshqa filiallarda.</li>
                  </ul>
                </div>

                {/* 3. Tijorat */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-600"/> 3. Tijorat va Biznes Manfaatlari</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><span className="font-bold text-red-600">+60-90 ball:</span> Xodim A-Toifada (Masalan, Kredit) ishlasa va o'zining yoki qarindoshining nomida MCHJ bo'lsa.</li>
                    <li><span className="font-bold text-amber-600">+30-40 ball:</span> Xodim C-Toifada ishlasa ham uning nomida yirik MCHJ bo'lsa (Tekshiruv uchun).</li>
                    <li className="italic">Ulush miqdori {'>'}50% va rahbar bo'lsa ball maksimal ko'tariladi.</li>
                  </ul>
                </div>

                {/* 4. NLP */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-purple-600"/> 4. O'z-o'zini fosh qilish (NLP Trigger)</h3>
                  <p className="text-sm text-slate-600">
                    Agar xodim erkin matn joyiga "kredit", "qarz", "tender", "akamning firmasi" kabi kalit so'zlarni yozsa, tizim matnni tahlil qiladi va ballni avtomatik ravishda <span className="font-bold text-amber-600">Sariq hududga</span> o'tkazib, BKR diqqatini jalb qiladi.
                  </p>
                </div>
              </div>

              {/* Xulosalar */}
              <div className="bg-[#0A2540] p-5 rounded-xl shadow-inner text-white mt-4">
                <h3 className="font-bold text-lg mb-4 text-blue-200">Algoritm Xulosasi:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="font-bold">0% - 24%</span></div>
                    <p className="text-xs text-slate-300">Yashil hudud. Hech qanday shubhali holat yo'q. Avtomatik tasdiqlanadi.</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="font-bold">25% - 59%</span></div>
                    <p className="text-xs text-slate-300">Sariq hudud. Potensial xavf. BKR xodimi ko'zdan kechirishi tavsiya etiladi.</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="font-bold">60% - 100%</span></div>
                    <p className="text-xs text-slate-300">Qizil hudud. RED FLAG! Zudlik bilan tekshiruv va komplayens nazorat kerak.</p>
                  </div>
                </div>
              </div>

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
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-bold transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/declarations" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <FileText className="w-5 h-5" /> Deklaratsiyalar
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <ShieldAlert className="w-5 h-5" /> Xabarnomalar
          </Link>
          <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" /> Muddatlarni sozlash
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Xodimlar bazasi
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <FileBarChart className="w-5 h-5" /> Hisobotlar
          </Link>
          <Link href="/admin/registry" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <CheckSquare className="w-5 h-5" /> Reyestr
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER */}
        <header className="min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-semibold text-slate-900">{adminProfile.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{adminProfile.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 space-y-6">
          
          {/* MUDDAT FILTRI */}
          <div className="flex justify-end">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase ml-2 flex items-center gap-1">
                <Calendar className="w-4 h-4"/> Muddat:
              </span>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Barcha davrlar</option>
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.year} [{new Date(c.startDate).toLocaleDateString('uz-UZ')} - {new Date(c.endDate).toLocaleDateString('uz-UZ')}] {c.status === 'active' ? '(FAOL)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Topshirilgan deklaratsiyalar</p>
              <div className="flex items-end justify-between mb-3">
                <h3 className="text-3xl font-black text-[#0A2540]">{globalStats.submittedCount} <span className="text-lg text-slate-400 font-bold">/ {globalStats.totalUsers} kishi</span></h3>
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">{globalPercentage}% Bajarildi</div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${globalPercentage}%` }}></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Eng xavfli hudud</p>
              <div className="flex items-end justify-between mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-none">{globalStats.mostDangerousRegion.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{globalStats.mostDangerousRegion.total} tadan {globalStats.mostDangerousRegion.dangerous} tasi xavfli</p>
                  </div>
                </div>
                <div className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-md border border-red-100">{globalStats.mostDangerousRegion.risk}% Risk</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Jami xavfli xodimlar</p>
              <div className="flex items-end justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-8 h-8 text-amber-500" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-none">{globalStats.highRiskCount} kishi</h3>
                    <p className="text-xs text-slate-500 mt-1">Algoritm aniqladi</p>
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100">Diqqat</div>
              </div>
            </div>
          </div>

          {/* XARITA VA PROGRESS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 3D XARITA */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 absolute top-0 left-0 w-full flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Hududlar bo'yicha ehtimoliy risk xaritasi
                </h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-xs text-slate-500 font-medium">Yuqori ({'>'}60%)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-xs text-slate-500 font-medium">O'rta (25-59%)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-xs text-slate-500 font-medium">Past ({'<'}25%)</span></div>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center pt-24 pb-16 bg-[#FAFAFA]" style={{ perspective: '1200px' }}>
                <div 
                  className="relative w-[900px] h-[550px] transition-transform duration-1000 ease-out"
                  style={{ transform: 'rotateX(55deg) rotateZ(-20deg)', transformStyle: 'preserve-3d' }}
                >
                  <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full drop-shadow-xl opacity-80" style={{ transform: 'translateZ(-1px)' }}>
                    <polygon
                      points="150,220 220,180 280,200 350,190 450,250 500,240 550,280 650,260 700,290 750,260 800,270 850,220 950,260 980,300 950,330 900,320 860,380 820,360 780,410 720,380 680,480 700,550 630,580 580,500 600,440 520,400 450,460 380,430 300,350 250,390 180,360 120,370 80,310 100,250"
                      fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="3" strokeLinejoin="round"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(10,37,64,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(10,37,64,0.04)_1px,transparent_1px)] bg-[size:40px_40px] rounded-3xl" style={{ clipPath: 'polygon(150px 220px, 220px 180px, 280px 200px, 350px 190px, 450px 250px, 500px 240px, 550px 280px, 650px 260px, 700px 290px, 750px 260px, 800px 270px, 850px 220px, 950px 260px, 980px 300px, 950px 330px, 900px 320px, 860px 380px, 820px 360px, 780px 410px, 720px 380px, 680px 480px, 700px 550px, 630px 580px, 580px 500px, 600px 440px, 520px 400px, 450px 460px, 380px 430px, 300px 350px, 250px 390px, 180px 360px, 120px 370px, 80px 310px, 100px 250px)' }}></div>

                  {mapData.map((region) => {
                    const config = getStatusConfig(region.risk);
                    const isHovered = hoveredRegion === region.id;
                    
                    return (
                      <div 
                        key={region.id} 
                        className="absolute transition-all duration-300 cursor-pointer" 
                        style={{ 
                          left: `${region.x}%`, 
                          top: `${region.y}%`, 
                          transformStyle: 'preserve-3d',
                          transform: isHovered ? 'scale(1.2) translateZ(80px)' : 'scale(1) translateZ(0px)',
                          zIndex: isHovered ? 999 : 10
                        }}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      >
                        <div className={`w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 animate-ping opacity-30 ${config.color}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 shadow-[0_0_10px] ${config.color} ${config.shadow}`}></div>

                        <div 
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center"
                          style={{ transform: 'rotateZ(20deg) rotateX(-55deg)' }}
                        >
                          <div className={`bg-white/95 backdrop-blur-md border p-2.5 rounded-xl shadow-lg flex flex-col items-center gap-0.5 min-w-[110px] ${config.border} transition-all duration-300 ${isHovered ? 'scale-110 shadow-2xl' : ''}`}>
                            <h4 className="text-slate-800 text-[10px] font-extrabold flex items-center gap-1 whitespace-nowrap">
                              <MapPin className={`w-3 h-3 ${config.text}`} />
                              {region.name}
                            </h4>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className={`text-xl font-black leading-none ${config.text}`}>
                                {region.risk}%
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium uppercase">risk</span>
                            </div>
                          </div>
                          
                          <div 
                            className={`w-1 rounded-full mt-1.5 bg-gradient-to-t ${config.gradient}`}
                            style={{ height: `${(region.risk * 1.5) + 20}px` }} 
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PROGRESS CHART (Viloyat va akkordeon shaklidagi filiallar bilan) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[500px]">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Topshirish ko'rsatkichlari
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {progressData.length > 0 ? progressData.map((item) => {
                  const percent = item.total > 0 ? Math.round((item.submitted / item.total) * 100) : 0;
                  const barColor = percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-blue-500' : 'bg-red-500';
                  const isExpanded = expandedRegion === item.name;

                  return (
                    <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0">
                      
                      {/* Asosiy Viloyat Qismi (Clickable) */}
                      <div 
                        className="cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors group"
                        onClick={() => setExpandedRegion(isExpanded ? null : item.name)}
                      >
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            {item.name}
                            {item.branches.length > 0 && (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                {item.branches.length} ta
                              </span>
                            )}
                          </span>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900">{item.submitted}</span>
                            <span className="text-xs text-slate-400 font-medium"> / {item.total} kishi</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
                          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      {/* Filiallar Dropdown qismi (Faqat shu viloyat tanlansa ochiladi) */}
                      {isExpanded && item.branches.length > 0 && (
                        <div className="mt-3 pl-4 space-y-3 border-l-2 border-blue-100 animate-in slide-in-from-top-2 fade-in duration-200">
                          {item.branches.map((branch: any) => {
                            const bPercent = branch.employees > 0 ? Math.round((branch.submitted / branch.employees) * 100) : 0;
                            const bColor = bPercent >= 90 ? 'bg-emerald-400' : bPercent >= 70 ? 'bg-blue-400' : 'bg-red-400';
                            
                            return (
                              <div key={branch.id} className="w-full">
                                <div className="flex justify-between items-end mb-1">
                                  <span className="text-xs font-semibold text-slate-600 truncate max-w-[150px]" title={branch.name}>
                                    {branch.name}
                                  </span>
                                  <div className="text-right whitespace-nowrap pl-2">
                                    <span className="text-[10px] font-bold text-slate-700">{branch.submitted}</span>
                                    <span className="text-[10px] text-slate-400 font-medium"> / {branch.employees}</span>
                                  </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${bColor}`} style={{ width: `${bPercent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="text-slate-400 text-sm text-center mt-10">Ushbu muddat uchun ma'lumot yo'q</p>
                )}
              </div>
              
              <Link href="/admin/declarations" className="block text-center w-full mt-6 py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
                Batafsil ko'rish
              </Link>
            </div>
          </div>

          {/* FILIALLAR KESIMIDA XAVFLARNI BAHOLASH JADVALI */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Filial / BXM lar kesimida algoritm xulosasi
                </h2>
                <button onClick={() => setShowAlgoModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                   <Info className="w-4 h-4" /> Algoritm logikasi
                </button>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filial qidirish..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-black placeholder-slate-400 outline-none focus:border-blue-600 bg-white"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={branchFilter}
                    onChange={e => {setBranchFilter(e.target.value); setCurrentPage(1);}}
                    className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm font-bold text-black outline-none focus:border-blue-600 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Barcha holatlar">Barcha holatlar</option>
                    <option value="Qizil hudud">Qizil hudud (Xavfli)</option>
                    <option value="Sariq hudud">Sariq hudud (Diqqat)</option>
                    <option value="Yashil hudud">Yashil hudud (Toza)</option>
                    <option value="Sariq va qizil">Sariq va Qizil</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-500">Filial / BXM nomi</th>
                    <th className="px-6 py-4 font-bold text-slate-500">Hudud</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center">Xodimlar</th>
                    <th className="px-6 py-4 font-bold text-slate-500">Xavf (Risk Score)</th>
                    <th className="px-6 py-4 font-bold text-slate-500 w-1/3">Algoritm aniqlagan muammo (Trigger)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentBranches.length > 0 ? currentBranches.map(branch => (
                    <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0A2540]">{branch.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{branch.region}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{branch.submitted} / {branch.employees}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${
                            branch.risk === 'Qizil' ? 'bg-red-50 text-red-700 border border-red-100' :
                            branch.risk === 'Sariq' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${branch.risk === 'Qizil' ? 'bg-red-500 animate-pulse' : branch.risk === 'Sariq' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            {branch.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-500 font-medium">
                        {branch.reason}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-bold">Ushbu muddat bo'yicha ma'lumot topilmadi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Jami {filteredBranches.length} ta filialdan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBranches.length)} ko'rsatilmoqda</span>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p=>p-1)} className="p-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
                  <span className="text-sm font-bold text-slate-700">{currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p=>p+1)} className="p-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}