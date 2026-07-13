'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
const ImageModule = require('docxtemplater-image-module-free');
import { saveAs } from 'file-saver';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  LogOut, User, Download, FileBarChart, Briefcase, Network, Landmark
} from 'lucide-react';

// Rasmlarni Word'ga joylash uchun yordamchi funksiya
function base64DataURLToArrayBuffer(dataURL: string) {
  const base64Regex = /^data:image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) return false;
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function ReportsPage() {
  const router = useRouter();
  
  // TIZIM MA'LUMOTLARI
  const [users, setUsers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [declarations, setDeclarations] = useState<any[]>([]);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const adminName = "Hasan Turaevich";
  const adminRole = "BKR Boshlig'i";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resCamps, resDecls] = await Promise.all([
        fetch('https://nbu-bkr-api.onrender.com/api/auth/users').catch(() => ({ ok: false, json: () => [] })),
        fetch('https://nbu-bkr-api.onrender.com/api/campaigns').catch(() => ({ ok: false, json: () => [] })),
        fetch('https://nbu-bkr-api.onrender.com/api/declarations').catch(() => ({ ok: false, json: () => [] }))
      ]);

      const fetchedUsers = resUsers.ok ? await (resUsers as Response).json() : [];
      const fetchedCamps = resCamps.ok ? await (resCamps as Response).json() : [];
      const fetchedDecls = resDecls.ok ? await (resDecls as Response).json() : [];

      setUsers(fetchedUsers);
      setCampaigns(fetchedCamps);
      setDeclarations(fetchedDecls);

      if (fetchedCamps.length > 0) {
        const activeCamp = fetchedCamps.find((c: any) => c.status === 'active');
        setSelectedCampaignId(activeCamp ? activeCamp._id : fetchedCamps[0]._id);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA VA HISOBLASH (QOG'OZDAGI ALGORITM) ---
  const currentData = useMemo(() => {
    let stats = {
      total: users.length > 0 ? users.length : 6525, // Agar userlar topilmasa default
      submitted: 0,
      excused: 0,
      relatives: 0,
      subordination: 0,
      shares: 0,
      relativeShares: 0
    };

    if (!selectedCampaignId) return stats;

    const filteredDecls = declarations.filter(d => d.campaignId === selectedCampaignId);
    stats.submitted = filteredDecls.length;
    stats.excused = Math.max(stats.total - stats.submitted, 0);

    filteredDecls.forEach(decl => {
      let hasRelatives = false;
      let hasSubordination = false;
      let hasShares = false;
      let hasRelativeShares = false;

      // 1. Qarindoshlar va Bo'ysunishni tekshirish
      if (decl.relatives && decl.relatives.some((r: any) => r.worksAtNBU)) {
        hasRelatives = true;
        
        // BO'YSUNISH ALGORITMI
        const pBranch = (decl.personalInfo?.branch || "").toLowerCase();
        const pPos = (decl.personalInfo?.position || "").toLowerCase();
        
        const isSubordinate = decl.relatives.some((r: any) => {
          if (!r.worksAtNBU) return false;
          const rBranch = (r.nbuBranch || "").toLowerCase();
          const rPos = (r.nbuPosition || "").toLowerCase();
          
          // Agar bir xil filialda bo'lsa
          const isSameBranch = pBranch === rBranch && pBranch !== "";
          
          // Boshqaruvchi maqomini bildiruvchi kalit so'zlar
          const bossKeywords = ['bosh', 'mudir', 'rahbar', 'boshqaruvchi'];
          const isBoss = bossKeywords.some(keyword => pPos.includes(keyword) || rPos.includes(keyword));
          
          return isSameBranch && isBoss;
        });

        if (isSubordinate) hasSubordination = true;
      }

      // 2. Tijorat manfaatlari
      if (decl.myCompanies && decl.myCompanies.length > 0) hasShares = true;
      if (decl.relativeCompanies && decl.relativeCompanies.length > 0) hasRelativeShares = true;

      // Natijalarni qo'shish
      if (hasRelatives) stats.relatives++;
      if (hasSubordination) stats.subordination++;
      if (hasShares) stats.shares++;
      if (hasRelativeShares) stats.relativeShares++;
    });

    return stats;
  }, [declarations, users, selectedCampaignId]);

  const submittedPercent = currentData.total > 0 ? Math.round((currentData.submitted / currentData.total) * 100) : 0;

  // --- SVG NI PNG GA O'GIRISH (Word uchun) ---
  const svgToPngBase64 = (svgString: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2; 
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0, width, height);
          resolve('data:image/png;base64,' + canvas.toDataURL('image/png').split(',')[1]);
        } else {
          reject("Canvas yaratishda xatolik");
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => reject("Rasmni yuklashda xatolik");
      img.src = url;
    });
  };

  // --- HAQIQIY WORD (.DOCX) GENERATORI ---
  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      // 1. Grafiklar uchun SVG larni chizib olish
      const r = 70;
      const c = 2 * Math.PI * r;
      const dash = (submittedPercent / 100) * c;
      const pieSvg = `
        <svg width="600" height="280" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff" />
          <text x="300" y="30" text-anchor="middle" font-family="Times New Roman" font-size="18" font-weight="bold">KO'RSATKICH</text>
          
          <rect x="40" y="60" width="12" height="12" fill="#4472C4" />
          <text x="60" y="71" font-family="Times New Roman" font-size="14">Deklaratsiya topshirgan xodimlar</text>
          
          <rect x="40" y="85" width="12" height="12" fill="#C0504D" />
          <text x="60" y="96" font-family="Times New Roman" font-size="14">Dekret/Ta'til va boshqa uzrli sabablar</text>

          <g transform="translate(300, 190) rotate(-90)">
            <circle r="${r}" cx="0" cy="0" fill="transparent" stroke="#C0504D" stroke-width="35" />
            <circle r="${r}" cx="0" cy="0" fill="transparent" stroke="#4472C4" stroke-width="35" stroke-dasharray="${dash} ${c}" />
          </g>
          <text x="300" y="196" text-anchor="middle" font-family="Times New Roman" font-size="18" font-weight="bold">${submittedPercent}%</text>
        </svg>
      `;

      const maxVal = Math.max(currentData.relatives, currentData.subordination, currentData.shares, currentData.relativeShares, 1);
      const barSvg = `
        <svg width="700" height="250" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff" />
          <line x1="280" y1="20" x2="280" y2="220" stroke="#d1d5db" stroke-width="2" />
          
          <g font-family="Times New Roman" font-size="14" fill="#000000">
            <text x="270" y="45" text-anchor="end">Yaqin qarindoshlari mavjudligi</text>
            <rect x="280" y="35" width="${Math.max((currentData.relatives/maxVal)*400, 5)}" height="30" fill="#4472C4" />
            <text x="${280 + Math.max((currentData.relatives/maxVal)*400, 5) + 10}" y="55" fill="#000" font-weight="bold">${currentData.relatives}</text>

            <text x="270" y="95" text-anchor="end">Bo'ysunuv munosabatlari</text>
            <rect x="280" y="85" width="${Math.max((currentData.subordination/maxVal)*400, 5)}" height="30" fill="#C0504D" />
            <text x="${280 + Math.max((currentData.subordination/maxVal)*400, 5) + 10}" y="105" fill="#000" font-weight="bold">${currentData.subordination}</text>

            <text x="270" y="145" text-anchor="end">Yuridik shaxslarda ulushga egaligi</text>
            <rect x="280" y="135" width="${Math.max((currentData.shares/maxVal)*400, 5)}" height="30" fill="#EAB308" />
            <text x="${280 + Math.max((currentData.shares/maxVal)*400, 5) + 10}" y="155" fill="#000" font-weight="bold">${currentData.shares}</text>

            <text x="270" y="195" text-anchor="end">Tadbirkorlik subyektlarida ishtiroki</text>
            <rect x="280" y="185" width="${Math.max((currentData.relativeShares/maxVal)*400, 5)}" height="30" fill="#10B981" />
            <text x="${280 + Math.max((currentData.relativeShares/maxVal)*400, 5) + 10}" y="205" fill="#000" font-weight="bold">${currentData.relativeShares}</text>
          </g>
        </svg>
      `;

      const pieImgData = await svgToPngBase64(pieSvg, 600, 280);
      const barImgData = await svgToPngBase64(barSvg, 700, 250);

      // 2. Shablonni yuklash va to'ldirish
      const response = await fetch('/report_template.docx');
      if (!response.ok) {
        alert("report_template.docx fayli public papkada topilmadi!");
        return;
      }
      const content = await response.arrayBuffer();
      const zip = new PizZip(content);

      const imageOptions = {
        centered: true,
        getImage: function(tagValue: any) {
          return base64DataURLToArrayBuffer(tagValue);
        },
        getSize: function(img: any, tagValue: any, tagName: string) {
          if (tagName === 'pieChart') return [450, 210];
          if (tagName === 'barChart') return [550, 196];
          return [150, 150];
        }
      };
      const imageModule = new ImageModule(imageOptions);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule]
      });

      const activeCampaign = campaigns.find(c => c._id === selectedCampaignId);
      const periodName = activeCampaign ? activeCampaign.title : 'Noma\'lum davr';

      doc.render({
        period: periodName,
        total: currentData.total,
        submitted: currentData.submitted,
        excused: currentData.excused,
        relatives: currentData.relatives,
        subordination: currentData.subordination,
        shares: currentData.shares,
        relativeShares: currentData.relativeShares,
        pieChart: pieImgData,
        barChart: barImgData
      });

      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      saveAs(out, `BKR_Hisobot_${periodName.replace(/\s+/g, '_')}.docx`);

    } catch (error) {
      console.error("Xatolik:", error);
      alert("Hisobotni yuklashda xatolik yuz berdi.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500">Hisobotlar tahlil qilinmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      
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
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <ShieldAlert className="w-5 h-5" /> Xabarnomalar
          </Link>
          <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" /> Muddatlarni sozlash
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Xodimlar bazasi
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 font-bold rounded-lg transition-colors">
            <FileBarChart className="w-5 h-5" /> Hisobotlar
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
        <header className="min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Tahliliy Hisobotlar</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-bold text-slate-900">{adminName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{adminRole}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 sm:w-72">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hisobot davrini tanlang</label>
                <select 
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full text-slate-800 font-bold bg-transparent outline-none border-b-2 border-slate-200 pb-1 focus:border-blue-600 cursor-pointer transition-colors"
                >
                  {campaigns.length > 0 ? campaigns.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  )) : (
                    <option value="">Muddatlar mavjud emas</option>
                  )}
                </select>
              </div>
            </div>

            <button 
              onClick={downloadReport}
              disabled={isDownloading || !selectedCampaignId}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Hujjat tayyorlanmoqda...' : <><Download className="w-5 h-5" /> Hisobotni yuklash</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CHAP TOMON: DUMALOQ GRAFIK */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 flex flex-col items-center">
              <h3 className="text-base font-bold text-slate-800 w-full mb-8">Deklaratsiya topshirish ko'rsatkichi</h3>
              
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle r="15.915" cx="18" cy="18" fill="transparent" stroke="#EF4444" strokeWidth="4" />
                  <circle r="15.915" cx="18" cy="18" fill="transparent" stroke="#2563EB" strokeWidth="4" strokeDasharray={`${submittedPercent} 100`} />
                </svg>
                <div className="absolute inset-0 m-auto flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-[#0A2540]">{submittedPercent}%</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Topshirdi</span>
                </div>
              </div>

              <div className="w-full mt-10 space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 shadow-sm"></div>
                    <span className="text-sm font-semibold text-slate-700">Jami xodimlar</span>
                  </div>
                  <span className="font-black text-slate-900 text-base">{currentData.total}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm"></div>
                    <span className="text-sm font-semibold text-blue-900">Topshirganlar</span>
                  </div>
                  <span className="font-black text-blue-700 text-base">{currentData.submitted}</span>
                </div>
                <div className="flex justify-between items-center bg-red-50 p-3.5 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></div>
                    <span className="text-sm font-semibold text-red-900">Dekret/Ta'til va boshqa sabablar</span>
                  </div>
                  <span className="font-black text-red-700 text-base">{currentData.excused}</span>
                </div>
              </div>
            </div>

            {/* O'NG TOMON: KARTALAR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Manfaatlar to'qnashuvi to'g'risidagi deklaratsiyalar tahlili</h3>
                <p className="text-sm text-slate-500 mt-1">Tahlil natijalariga ko'ra quyidagi holatlar aniqlandi:</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-indigo-900 text-lg mb-1">{currentData.relatives} <span className="text-sm font-semibold text-indigo-600">nafar xodimning</span></h4>
                    <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                      Bank tizimida mehnat faoliyatini amalga oshirayotgan yaqin qarindoshlari mavjudligi;
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50/60 transition-colors">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <Network className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-red-900 text-lg mb-1">mazkur holatlarni o'rganish natijasida {currentData.subordination} <span className="text-sm font-semibold text-red-600">ta holatda</span></h4>
                    <p className="text-sm text-red-800/80 leading-relaxed font-medium">
                      xodimlar o'rtasida bevosita bo'ysunuv munosabatlari mavjudligi aniqlanib, ular mavjud manfaatlar to'qnashuvi sifatida baholandi;
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/60 transition-colors">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 text-lg mb-1">{currentData.shares} <span className="text-sm font-semibold text-amber-600">nafar xodimning</span></h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                      yuridik shaxslar ustav fondida ulush yoki aksiyalarga egaligi yoxud ularning boshqaruv organlari tarkibida ishtirok etishi mavjudligi;
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 text-lg mb-1">{currentData.relativeShares} <span className="text-sm font-semibold text-emerald-600">nafar xodimning</span></h4>
                    <p className="text-sm text-emerald-800/80 leading-relaxed font-medium">
                      yaqin qarindoshlari tadbirkorlik subyektlarining ustav kapitalida ishtirok etishi yoki ularning boshqaruv organlari tarkibiga kirishi aniqlandi.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}