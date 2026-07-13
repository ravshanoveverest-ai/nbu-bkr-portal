'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Download, FileBarChart 
} from 'lucide-react';

// EXCEL VA WORD UCHUN KUTUBXONALAR
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
const ImageModule = require('docxtemplater-image-module-free');

// Imzoni Base64 dan ArrayBuffer ga o'girish (Wordga rasm qo'yish uchun)
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

  const filteredDeclarations = allDeclarations.filter(decl => {
    if (decl.type && decl.type !== selectedTab) return false;
    if (selectedTab === 'yillik' && selectedCampaignId && decl.campaignId !== selectedCampaignId) return false;
    if (searchQuery && decl.personalInfo?.fullName) {
      return decl.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalUsers = users.length;
  const submittedCount = filteredDeclarations.length;
  const percentage = totalUsers > 0 ? ((submittedCount / totalUsers) * 100).toFixed(1) : '0.0';

  // === EXCEL GENERATSIYASI (Chiroyli dizayn bilan) ===
  const handleExportExcel = async () => {
    if (filteredDeclarations.length === 0) return alert("Yuklash uchun ma'lumot yo'q!");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Deklaratsiyalar", {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] // Tepa va yon qatorni qotirib qo'yish
    });

    // Ustunlarni sozlash va kengliklarini berish
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'XODIM F.I.SH', key: 'fullName', width: 30 },
      { header: "SHAXSIY MA'LUMOTLAR\n(Pasport va JSHSHIR)", key: 'personal', width: 25 },
      { header: 'HUDUD / FILIAL', key: 'branch', width: 20 },
      { header: 'TOPSHIRILGAN SANA', key: 'date', width: 18 },
      { header: 'XAVF DARAJASI', key: 'risk', width: 20 },
      { header: 'TIZIM XULOSASI (Sabab)', key: 'riskText', width: 30 },
      { header: "YAQIN QARINDOSHLAR HAQIDA MA'LUMOT", key: 'relatives', width: 45 },
      { header: 'YURIDIK SHAXSLARGA ALOQADORLIK (Kompaniyalar)', key: 'companies', width: 50 },
    ];

    // Header (Sarlavha) qatoriga dizayn berish
    const headerRow = worksheet.getRow(1);
    headerRow.height = 35;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0A2540' } // To'q ko'k rang
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // Oq matn
        bold: true,
        size: 10
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FF94A3B8' } },
        right: { style: 'thin', color: { argb: 'FF94A3B8' } }
      };
    });

    // Ma'lumotlarni to'ldirish
    filteredDeclarations.forEach((decl, index) => {
      let riskLevel = '🟢 Yashil (Toza)';
      let riskText = 'Xavf aniqlanmadi';
      
      if (decl.relatives && decl.relatives.some((r:any) => r.worksAtNBU)) {
        riskLevel = '🔴 Qizil (Xavfli)'; 
        riskText = 'Qarindoshi NBU da ishlaydi';
      } else if (decl.myCompanies && decl.myCompanies.length > 0) {
        riskLevel = '🟡 Sariq (Diqqat)'; 
        riskText = "O'zining nomida kompaniya mavjud";
      }

      const relsStr = decl.relatives?.length > 0
        ? decl.relatives.map((r:any, i:number) => `${i+1}. ${r.fullName} (${r.relationship})\n   ${r.worksAtNBU ? '☑ NBU da ishlaydi ('+r.nbuBranch+')' : '☒ NBU da ishlamaydi'}`).join('\n\n')
        : 'Qarindoshlar kiritilmagan';

      const myComps = decl.myCompanies?.map((c:any, i:number) => `${i+1}. Nomi: "${c.companyName}"\nSTIR: ${c.stir}\nHolati: ${c.roleInCompany} (${c.sharePercent}% ulush)\nTegishli: O'ziga`) || [];
      const relComps = decl.relativeCompanies?.map((c:any, i:number) => `${myComps.length + i + 1}. Nomi: "${c.companyName}"\nSTIR: ${c.stir}\nHolati: ${c.roleInCompany} (${c.sharePercent}% ulush)\nTegishli: Qarindoshiga (${c.relativeName})`) || [];
      const allCompsStr = [...myComps, ...relComps].join('\n\n') || 'Yuridik shaxslar aniqlanmadi';

      const row = worksheet.addRow({
        id: index + 1,
        fullName: decl.personalInfo?.fullName || "-",
        personal: `Pasport: ${decl.personalInfo?.passport || "-"}\nJSHSHIR: ${decl.personalInfo?.pinfl || "-"}`,
        branch: decl.personalInfo?.branch || "-",
        date: new Date(decl.createdAt).toLocaleDateString('uz-UZ'),
        risk: riskLevel,
        riskText: riskText,
        relatives: relsStr,
        companies: allCompsStr
      });

      // Har bir data katagiga dizayn (wrapText) berish
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });
    });

    // Faylni generatsiya qilib yuklash
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, "Deklaratsiyalar_Reyestri.xlsx");
  };

  // === DOCX GENERATSIYASI ===
  const handleDownloadDocx = async (decl: any) => {
    try {
      const response = await fetch('/template.docx');
      if (!response.ok) {
        alert("template.docx fayli public papkada topilmadi!");
        return;
      }
      const content = await response.arrayBuffer();
      const zip = new PizZip(content);

      const imageOptions = {
        centered: true,
        getImage: function(tagValue: any) {
          return base64DataURLToArrayBuffer(tagValue);
        },
        getSize: function() {
          return [140, 45]; 
        }
      };
      const imageModule = new ImageModule(imageOptions);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [imageModule]
      });

      const typeMap: any = {
        'yillik': 'йиллик',
        'rotatsiya': 'бошқа ишга ўтказилаётганда',
        'yangi_xodim': 'ишга қабул қилинаётганда'
      };
      const declType = decl.type ? typeMap[decl.type] : 'йиллик';

      const relativesData = decl.relatives?.length > 0 
        ? decl.relatives.map((r: any) => ({
            relName: r.fullName || "-",
            relRel: r.relationship || "-",
            relPass: r.noInfo ? "Маълумотга эга эмасман" : `${r.passport || '-'} (${r.passportDate || ''})`,
            relPinfl: r.noInfo ? "Маълумотга эга эмасман" : (r.pinfl || "-")
        }))
        : [{ relName: "-", relRel: "-", relPass: "-", relPinfl: "-" }];

      const myCompsData = decl.myCompanies?.length > 0
        ? decl.myCompanies.map((c: any) => ({
            compName: c.companyName || "-",
            compStir: c.stir || "-"
        }))
        : [{ compName: "-", compStir: "-" }];

      const relCompsData = decl.relativeCompanies?.length > 0
        ? decl.relativeCompanies.map((c: any) => ({
            relName: c.relativeName || "-",
            compName: c.companyName || "-",
            compStir: c.stir || "-"
        }))
        : [{ relName: "-", compName: "-", compStir: "-" }];

      const fallbackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

      const data = {
        declType: declType,
        fullName: decl.personalInfo?.fullName || "-",
        branch: decl.personalInfo?.branch || "-",
        position: decl.personalInfo?.position || "-",
        passport: decl.personalInfo?.passport || "-",
        passportDate: decl.personalInfo?.passportDate || "-",
        pinfl: decl.personalInfo?.pinfl || "-",
        
        relatives: relativesData,
        myComps: myCompsData,
        relComps: relCompsData,

        conflictInfo: decl.conflictInfo || "-",
        additionalInfo: decl.additionalInfo || "-",
        date: new Date(decl.createdAt).toLocaleDateString('uz-UZ').replace(/\//g, '.'),
        signature: decl.signature || fallbackImage,
      };

      doc.render(data);

      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
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

          {/* JADVAL */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Xodim Ismi orqali qidiruv..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 text-sm font-medium"
                />
              </div>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <Download className="w-4 h-4" /> Excel yuklab olish
              </button>
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