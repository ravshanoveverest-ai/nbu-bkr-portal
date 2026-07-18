'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Download, FileBarChart, 
  CheckSquare, Filter, UserX, MapPin, Building2
} from 'lucide-react';

// EXCEL VA WORD UCHUN KUTUBXONALAR
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
const ImageModule = require('docxtemplater-image-module-free');

// ==========================================
// 1. HUDUDLAR VA FILIALLAR BAZASI (Doimiy)
// ==========================================
const NBU_REGIONS: Record<string, string[]> = {
  "Toshkent shahri": [
    "Bosh amaliyot BXM", "Sebzor amaliyot BXM", "Markaziy amaliyot BXM", "Akademiya BXM",
    "Uchtepa BXM", "Bektemir BXM", "Sayohat BXM", "Mirzo Ulug‘bek BXM", "Olmazor BXM",
    "Yashnobod BXM", "Yunusobod BXM", "Yakkasaroy BXM", "Yangiobod BXM", "Sergeli BXM",
    "Mirobod bo'limi", "Yangi Sergeli BXO", "Humo BXO", "Shayhontoxur BXO", "Navro‘z BXO",
    "Atlas NBU BXO", "Texnopark BXO", "Abu Saxiy BXO", "Mirobod plaza BXO", "G‘alaba BXO",
    "\"City\" BXO"
  ],
  "Andijon viloyati": [
    "Andijon amaliyot BXM", "Asaka BXM", "Marxamat BXM", "Izboskan BXM", "Paxtaobod BXO", 
    "Qo‘rg‘ontepa BXO", "Shahrixon BXO", "Boburmirzo BXO"
  ],
  "Buxoro viloyati": [
    "Buxoro amaliyot BXM", "G‘ijduvon BXM", "Kogon BXM", "Qorako‘l BXM", "Romitan BXO", 
    "Qorovulbozor BXO", "Vobkent BXO", "Shofirkon BXO", "Ark BXO", "Naqshband BXO", 
    "Buxoro shahar BXO", "Mirkulol BXO"
  ],
  "Farg'ona viloyati": [
    "Farg‘ona amaliyot BXM", "Quva BXM", "Qo‘qon BXM", "Rishton BXM", "Beshariq BXM", 
    "Quvasoy BXO", "Buvayda BXO", "Marg‘ilon BXO", "Oltiariq BXO"
  ],
  "Jizzax viloyati": [
    "Jizzax amaliyot BXM", "Mirzacho‘l BXM", "Industrial BXM", "Paxtakor BXO"
  ],
  "Namangan viloyati": [
    "Namangan amaliyot BXM", "Uychi BXM", "Uchqo‘rg‘on BXM", "Chortoq BXM", 
    "To‘raqo‘rg‘on BXO", "Kosonsoy BXO", "Chust BXO", "Sardoba BXO"
  ],
  "Navoiy viloyati": [
    "Navoiy amaliyot BXM", "Zarafshon BXM", "Qiziltepa BXM", "Uchquduq BXM", 
    "Malikrabot BXO", "Nurota BXO", "Yoshlik BXO", "Oltin vodiy BXO", "Xalqlar do‘stligi BXO"
  ],
  "Qashqadaryo viloyati": [
    "Qarshi amaliyot BXM", "Shahrisabz BXM", "G‘uzor BXO", "Muborak BXO", 
    "Yangi-nishon BXO", "Nasaf BXO"
  ],
  "Qoraqalpog'iston Respublikasi": [
    "Qo‘ng‘irot BXM", "To‘rtko‘l BXM", "Nukus amaliyot BXM", "Xo‘jayli BXO", 
    "Chimboy BXO", "Mang‘it BXO", "Nurli yo‘l BXO"
  ],
  "Samarqand viloyati": [
    "Samarqand amaliyot BXM", "Jomboy BXM", "Pastdarg‘om BXM", "Urgut BXM", 
    "Registon BXM", "Nurobod BXO", "Bulung‘ur BXO", "Kattaqo‘rg‘on BXO", "Zarmitan BXO", 
    "Qorasuv BXO", "Tadbirkor BXO", "Payariq BXO", "Tayloq BXO", "Do‘stlik BXO"
  ],
  "Sirdaryo viloyati": [
    "Guliston amaliyot BXM", "Oqoltin BXO"
  ],
  "Surxondaryo viloyati": [
    "Termiz amaliyot BXM", "Qumqo‘rg‘on BXM", "Denov BXM", "Sherobod BXO", 
    "Jarqo‘rg‘on BXO", "Ayritom BXO", "Sangardak BXO"
  ],
  "Toshkent viloyati": [
    "Nurafshon amaliyot BXM", "Angren BXM", "Bekobod BXM", "Yangiyo‘l BXM", 
    "G‘azalkent BXO", "Olmaliq BXO", "Chirchiq BXO", "Metallurg BXO", "Zarhal BXO", 
    "Oydin BXO", "Zangiota BXO", "Toshkent viloyati BXO"
  ],
  "Xorazm viloyati": [
    "Xorazm amaliyot BXM", "Hazorasp BXM", "Xonqa BXO", "Shovot BXM", "Yangiariq BXO", 
    "Karvon BXO", "Gurlan BXO", "Xiva BXO", "Qo‘shko‘pir BXO"
  ]
};

// Imzoni Base64 dan ArrayBuffer ga o'girish
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

export default function DeclarationsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allDeclarations, setAllDeclarations] = useState<any[]>([]);
  
  const [selectedTab, setSelectedTab] = useState<'yillik' | 'rotatsiya' | 'yangi_xodim'>('yillik');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // === HUDUD VA FILIAL FILTRLARI UCHUN STATELAR ===
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Agar viloyat o'zgarsa, filialni "all" ga tushirib qoyamiz
  useEffect(() => {
    setSelectedBranch('all');
  }, [selectedRegion]);

  const adminName = "Hasan Turaevich";
  const adminRole = "BKR Boshlig'i";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const resUsers = await fetch('https://nbu-bkr-api.onrender.com/api/auth/users');
      if (resUsers.ok) setUsers(await resUsers.json());

      const resCamps = await fetch('https://nbu-bkr-api.onrender.com/api/campaigns');
      if (resCamps.ok) {
        const campsData = await resCamps.json();
        setCampaigns(campsData);
        if (campsData.length > 0) {
          const activeCamp = campsData.find((c: any) => c.status === 'active');
          setSelectedCampaignId(activeCamp ? activeCamp._id : campsData[0]._id);
        }
      }

      const resDecls = await fetch('https://nbu-bkr-api.onrender.com/api/declarations');
      if (resDecls.ok) setAllDeclarations(await resDecls.json());

    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Faqat topshirganlarni ajratib olamiz (Jadval uchun)
  const filteredDeclarations = allDeclarations.filter(decl => {
    if (decl.type && decl.type !== selectedTab) return false;
    if (selectedTab === 'yillik' && selectedCampaignId && decl.campaignId !== selectedCampaignId) return false;
    if (searchQuery && decl.personalInfo?.fullName) {
      return decl.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Topshirmaganlarni aniqlash (Aynan tanlangan muddat bo'yicha)
  const currentCampaignDeclarations = allDeclarations.filter(decl => {
    if (decl.type && decl.type !== selectedTab) return false;
    if (selectedTab === 'yillik' && selectedCampaignId && decl.campaignId !== selectedCampaignId) return false;
    return true;
  });

  const submittedEmails = new Set(currentCampaignDeclarations.map(d => d.userEmail));
  
  // === MURAKKAB FILTRATSIYA (Viloyat va BXM kesimida) ===
  const unsubmittedUsers = users.filter(u => {
    const hasNotSubmitted = !submittedEmails.has(u.email);

    // Viloyat filtri
    let matchesRegion = true;
    if (selectedRegion !== 'all') {
      const allowedBranches = NBU_REGIONS[selectedRegion] || [];
      matchesRegion = allowedBranches.includes(u.branch);
    }

    // Aniq filial filtri
    let matchesBranch = true;
    if (selectedBranch !== 'all') {
      matchesBranch = u.branch === selectedBranch;
    }

    return hasNotSubmitted && matchesRegion && matchesBranch;
  });

  const totalUsers = users.length;
  const submittedCount = currentCampaignDeclarations.length; 
  const percentage = totalUsers > 0 ? ((submittedCount / totalUsers) * 100).toFixed(1) : '0.0';

  // === EXCEL GENERATSIYASI (TOPSHIRGANLAR UCHUN) ===
  const handleExportExcel = async () => {
    if (filteredDeclarations.length === 0) return alert("Yuklash uchun ma'lumot yo'q!");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Topshirganlar", {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }]
    });

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'XODIM F.I.SH', key: 'fullName', width: 30 },
      { header: "SHAXSIY MA'LUMOTLAR", key: 'personal', width: 25 },
      { header: 'HUDUD / FILIAL', key: 'branch', width: 20 },
      { header: 'TOPSHIRILGAN SANA', key: 'date', width: 18 },
      { header: 'XAVF DARAJASI', key: 'risk', width: 20 },
      { header: 'TIZIM XULOSASI', key: 'riskText', width: 30 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }; 
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    filteredDeclarations.forEach((decl, index) => {
      let riskLevel = '🟢 Yashil (Toza)';
      let riskText = 'Xavf aniqlanmadi';
      
      if (decl.relatives && decl.relatives.some((r:any) => r.worksAtNBU)) {
        riskLevel = '🔴 Qizil (Xavfli)'; riskText = 'Qarindoshi NBU da ishlaydi';
      } else if (decl.myCompanies && decl.myCompanies.length > 0) {
        riskLevel = '🟡 Sariq (Diqqat)'; riskText = "O'zining nomida kompaniya mavjud";
      }

      worksheet.addRow({
        id: index + 1,
        fullName: decl.personalInfo?.fullName || "-",
        personal: `Pasport: ${decl.personalInfo?.passport || "-"}\nJSHSHIR: ${decl.personalInfo?.pinfl || "-"}`,
        branch: decl.personalInfo?.branch || "-",
        date: new Date(decl.createdAt).toLocaleDateString('uz-UZ'),
        risk: riskLevel,
        riskText: riskText,
      }).eachCell((cell) => { cell.alignment = { wrapText: true, vertical: 'top' }; });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, "Topshirganlar_Reyestri.xlsx");
  };

  // === EXCEL GENERATSIYASI (TOPSHIRMAGANLAR UCHUN) ===
  const handleExportUnsubmittedExcel = async () => {
    if (unsubmittedUsers.length === 0) return alert("Ushbu hudud/filial bo'yicha hamma topshirgan yoki xodimlar topilmadi!");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Topshirmaganlar", {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'XODIM F.I.SH', key: 'fullName', width: 35 },
      { header: 'LAVOZIM', key: 'position', width: 30 },
      { header: 'HUDUD / FILIAL', key: 'branch', width: 30 },
      { header: 'EMAIL / LOGIN', key: 'email', width: 25 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; 
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    });

    unsubmittedUsers.forEach((user, index) => {
      worksheet.addRow({
        id: index + 1,
        fullName: user.fullName || "-",
        position: user.position || user.role || "-",
        branch: user.branch || "-",
        email: user.email || "-",
      }).eachCell((cell) => { 
        cell.alignment = { wrapText: true, vertical: 'top' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Nomi chiroyli chiqishi uchun
    const campInfo = selectedTab === 'yillik' ? "Yillik_" : selectedTab + "_";
    const rName = selectedRegion === 'all' ? "Respublika" : selectedRegion.replace(/\s+/g, "");
    const bName = selectedBranch === 'all' ? "" : `_${selectedBranch.replace(/\s+/g, "")}`;
    
    saveAs(blob, `Topshirmaganlar_${campInfo}${rName}${bName}.xlsx`);
  };

  // === DOCX GENERATSIYASI ===
  const handleDownloadDocx = async (decl: any) => {
    try {
      const response = await fetch('/template.docx');
      if (!response.ok) return alert("template.docx fayli public papkada topilmadi!");
      const content = await response.arrayBuffer();
      const zip = new PizZip(content);

      const imageOptions = {
        centered: true,
        getImage: function(tagValue: any) { return base64DataURLToArrayBuffer(tagValue); },
        getSize: function() { return [140, 45]; }
      };
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, modules: [new ImageModule(imageOptions)] });

      const typeMap: any = { 'yillik': 'йиллик', 'rotatsiya': 'бошқа ишга ўтказилаётганда', 'yangi_xodim': 'ишга қабул қилинаётганда' };
      
      doc.render({
        declType: decl.type ? typeMap[decl.type] : 'йиллик',
        fullName: decl.personalInfo?.fullName || "-",
        branch: decl.personalInfo?.branch || "-",
        position: decl.personalInfo?.position || "-",
        passport: decl.personalInfo?.passport || "-",
        passportDate: decl.personalInfo?.passportDate || "-",
        pinfl: decl.personalInfo?.pinfl || "-",
        relatives: decl.relatives?.length ? decl.relatives.map((r: any) => ({
            relName: r.fullName || "-", relRel: r.relationship || "-",
            relPass: r.noInfo ? "Маълумотга эга эмасман" : `${r.passport || '-'} (${r.passportDate || ''})`,
            relPinfl: r.noInfo ? "Маълумотга эга эмасман" : (r.pinfl || "-")
        })) : [{ relName: "-", relRel: "-", relPass: "-", relPinfl: "-" }],
        myComps: decl.myCompanies?.length ? decl.myCompanies.map((c: any) => ({ compName: c.companyName || "-", compStir: c.stir || "-" })) : [{ compName: "-", compStir: "-" }],
        relComps: decl.relativeCompanies?.length ? decl.relativeCompanies.map((c: any) => ({ relName: c.relativeName || "-", compName: c.companyName || "-", compStir: c.stir || "-" })) : [{ relName: "-", compName: "-", compStir: "-" }],
        conflictInfo: decl.conflictInfo || "-",
        additionalInfo: decl.additionalInfo || "-",
        date: new Date(decl.createdAt).toLocaleDateString('uz-UZ').replace(/\//g, '.'),
        signature: decl.signature || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });

      const out = doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      saveAs(out, `${decl.personalInfo?.fullName || 'Xodim'}_deklaratsiya.docx`);

    } catch (error) {
      console.error("DOCX xato:", error);
      alert("DOCX yaratishda xato yuz berdi!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">
      
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
          <Link href="/admin/declarations" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
            <FileText className="w-5 h-5" /> Deklaratsiyalar
          </Link>
                    <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-bold transition-colors flex-justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> Xabarnomalar
            </div>
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
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Deklaratsiyalar reyestri</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-slate-900">{adminName}</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{adminRole}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          
          {/* TABLAR */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setSelectedTab('yillik')} 
              className={`px-5 py-2.5 rounded-lg font-bold transition-all ${selectedTab === 'yillik' ? 'bg-[#0A2540] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Yillik deklaratsiya
            </button>
            <button 
              onClick={() => setSelectedTab('rotatsiya')} 
              className={`px-5 py-2.5 rounded-lg font-bold transition-all ${selectedTab === 'rotatsiya' ? 'bg-[#0A2540] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Rotatsiya
            </button>
            <button 
              onClick={() => setSelectedTab('yangi_xodim')} 
              className={`px-5 py-2.5 rounded-lg font-bold transition-all ${selectedTab === 'yangi_xodim' ? 'bg-[#0A2540] text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Yangi ishga qabul
            </button>
          </div>

          {/* STATISTIKA VA MUDDAT TANLASH */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full blur-2xl"></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 z-10">Jami Topshirilgan</p>
              <div className="flex items-end gap-2 z-10">
                <h2 className="text-5xl font-black text-[#0A2540]">{submittedCount}</h2>
                <p className="text-xl font-bold text-slate-400 mb-1">/ {totalUsers}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 z-10">
                <FileText className="w-4 h-4" /> Umumiy jarayon: {percentage}%
              </div>
            </div>

            {selectedTab === 'yillik' ? (
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Muddatlar kesimida statistika</h3>
                {campaigns.length > 0 ? (
                  <select 
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-600 outline-none text-slate-800 font-bold appearance-none bg-blue-50/30 cursor-pointer"
                  >
                    {campaigns.map((camp: any) => (
                      <option key={camp._id} value={camp._id}>
                        {camp.title} [{new Date(camp.startDate).toLocaleDateString('uz-UZ')} — {new Date(camp.endDate).toLocaleDateString('uz-UZ')}] {camp.status === 'active' ? '(FAOL)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-amber-600 font-bold text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Hali tizimda hech qanday Yillik muddat ochilmagan.
                  </div>
                )}
              </div>
            ) : (
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-slate-500">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-medium text-sm text-center">Ushbu toifadagi deklaratsiyalar uchun qat'iy muddat yo'q.<br/> Xodim tomonidan vaziyatga qarab to'ldiriladi.</p>
              </div>
            )}
          </div>

          {/* JADVAL VA EXCEL YUKLASH TUGMALARI */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50/50">
              
              {/* Jadval qidiruvi */}
              <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Jadvaldan xodim izlash..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 text-sm font-medium shadow-sm"
                />
              </div>

              {/* Yuklash tugmalari va Filial kaskadli filtrlari */}
              <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                
                {/* 1. Viloyat Select */}
                <div className="relative w-full md:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm font-bold text-slate-700 cursor-pointer appearance-none truncate"
                  >
                    <option value="all">Barcha hududlar</option>
                    {Object.keys(NBU_REGIONS).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Filial Select (Faqat viloyat tanlanganda ochiladi) */}
                {selectedRegion !== 'all' && (
                  <div className="relative w-full md:w-56 animate-in fade-in zoom-in duration-200">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm font-bold text-slate-700 cursor-pointer appearance-none truncate"
                    >
                      <option value="all">Barcha BXM / BXO lar</option>
                      {NBU_REGIONS[selectedRegion].map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 w-full md:w-auto border-l border-slate-100 pl-2">
                  {/* Topshirmaganlar (QIZIL) */}
                  <button 
                    onClick={handleExportUnsubmittedExcel}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all text-sm whitespace-nowrap"
                    title="Tanlangan hudud va filial bo'yicha topshirmaganlarni yuklash"
                  >
                    <UserX className="w-4 h-4" /> Topshirmaganlar
                  </button>

                  {/* Topshirganlar (YASHIL) */}
                  <button 
                    onClick={handleExportExcel}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm text-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" /> Topshirganlar
                  </button>
                </div>

              </div>

            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Xodim F.I.Sh</th>
                    <th className="px-6 py-4">Hudud / Filial</th>
                    <th className="px-6 py-4">Topshirilgan sana</th>
                    <th className="px-6 py-4 text-center">Xavf (Tizim xulosasi)</th>
                    <th className="px-6 py-4 text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center font-bold text-slate-400">Yuklanmoqda...</td></tr>
                  ) : filteredDeclarations.length > 0 ? (
                    filteredDeclarations.map((decl: any) => {
                      let riskLevel = 'yashil';
                      let riskText = 'Xavf aniqlanmadi';
                      if (decl.relatives && decl.relatives.some((r:any) => r.worksAtNBU)) {
                        riskLevel = 'qizil'; riskText = 'Qarindoshi NBU da ishlaydi';
                      } else if (decl.myCompanies && decl.myCompanies.length > 0) {
                        riskLevel = 'sariq'; riskText = "O'zining nomida kompaniya mavjud";
                      }

                      return (
                        <tr key={decl._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#0A2540]">{decl.personalInfo?.fullName || 'Noma\'lum'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{decl.userEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{decl.personalInfo?.branch || '-'}</td>
                          <td className="px-6 py-4 font-bold text-slate-600">{new Date(decl.createdAt).toLocaleDateString('uz-UZ')}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${riskLevel === 'qizil' ? 'bg-red-100 text-red-700' : riskLevel === 'sariq' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                <span className={`w-2 h-2 rounded-full ${riskLevel === 'qizil' ? 'bg-red-500' : riskLevel === 'sariq' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                {riskLevel === 'qizil' ? 'Qizil hudud' : riskLevel === 'sariq' ? 'Sariq hudud' : 'Toza'}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1">{riskText}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDownloadDocx(decl)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold transition-colors text-xs border border-blue-200"
                            >
                              <Download className="w-3.5 h-3.5" /> DOCX formatda
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan={5} className="p-12 text-center font-bold text-slate-400">Ma'lumot topilmadi.</td></tr>
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