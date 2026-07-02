'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, Search, Filter, Download, Eye, AlertTriangle, 
  CheckCircle, User, FileSpreadsheet, X, Building, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx'; // EXCEL UCHUN YANGI KUTUBXONA

// --- 1. MOCK DATA VA HUDUDLAR RO'YXATI ---
const regionsList = [
  "Bosh ofis", "Toshkent shahri", "Toshkent viloyati", "Andijon viloyati", 
  "Buxoro viloyati", "Farg'ona viloyati", "Jizzax viloyati", "Xorazm viloyati", 
  "Namangan viloyati", "Navoiy viloyati", "Qashqadaryo viloyati", 
  "Qoraqalpog'iston Respublikasi", "Samarqand viloyati", "Sirdaryo viloyati", "Surxondaryo viloyati"
];

// O'zbekiston bo'yicha progress ma'lumotlari (15 ta hudud)
const progressData = [
  { id: 1, name: "Bosh ofis", total: 350, submitted: 340 },
  { id: 2, name: "Toshkent shahri", total: 280, submitted: 250 },
  { id: 3, name: "Andijon viloyati", total: 145, submitted: 140 },
  { id: 4, name: "Samarqand viloyati", total: 160, submitted: 130 },
  { id: 5, name: "Farg'ona viloyati", total: 135, submitted: 120 },
  { id: 6, name: "Buxoro viloyati", total: 120, submitted: 85 },
  { id: 7, name: "Qashqadaryo viloyati", total: 110, submitted: 90 },
  { id: 8, name: "Namangan viloyati", total: 105, submitted: 100 },
  { id: 9, name: "Xorazm viloyati", total: 95, submitted: 80 },
  { id: 10, name: "Navoiy viloyati", total: 85, submitted: 75 },
  { id: 11, name: "Toshkent viloyati", total: 220, submitted: 190 },
  { id: 12, name: "Surxondaryo viloyati", total: 115, submitted: 95 },
  { id: 13, name: "Sirdaryo viloyati", total: 70, submitted: 65 },
  { id: 14, name: "Jizzax viloyati", total: 80, submitted: 75 },
  { id: 15, name: "Qoraqalpog'iston Respublikasi", total: 130, submitted: 110 },
];

const generateMockData = () => {
  const names = [
    "Valiyev Alisher Baxodirovich", "Toshmatov Sardor Olimovich", "Xalimov Rustam", 
    "Karimova Nargiza", "Umarov Jasur Xasanovich", "Qodirova Madina", 
    "Azimov Rustam Farxodovich", "Nurmatov Bekzod Akmalovich", "Holimov Botir", "Tashmatov Eshmat"
  ];
  return Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: names[i % 10] + (i >= 10 ? ` ${i+1}` : ''),
    region: regionsList[i % regionsList.length],
    date: `2024-02-${String((i % 28) + 1).padStart(2, '0')}`,
    risk: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    reason: i % 3 === 0 ? "Qarindoshi rahbarlik lavozimida" : i % 2 === 0 ? "O'zining nomida MCHJ mavjud" : "Xavf aniqlanmadi",
    details: {
      personal: { pinfl: `3${String(i+1).padStart(13, '0')}`, passport: `AA${String(i+1).padStart(7, '0')}` },
      relatives: [
        { name: "Eshmatov Toshmat", relation: "Otasi", worksAtNbu: i % 4 === 0, nbuBranch: i % 4 === 0 ? "Bosh ofis" : "" }
      ],
      companies: i % 2 === 0 ? [ { name: `Biznes Plus MCHJ ${i}`, stir: `30${String(i).padStart(7, '1')}`, percent: (i+1)*5 } ] : []
    }
  }));
};

const mockDeclarations = generateMockData();

// --- 2. QIDIRUV UCHUN NORMALIZATSIYA ---
const cyrillicToLatin = (text: string) => {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y',
    'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
    'х':'x','ц':'ts','ч':'ch','ш':'sh','щ':'sh','ъ':'','ы':'','ь':'','э':'e','ю':'yu','я':'ya',
    'ў':"o'",'ғ':"g'",'қ':'q','ҳ':'h'
  };
  return text.toLowerCase().split('').map(char => map[char] || char).join('');
};

const normalizeText = (text: string) => {
  let latin = cyrillicToLatin(text);
  return latin
    .replace(/['`‘’]/g, '')
    .replace(/x/g, 'h')     
    .replace(/a/g, 'o')     
    .replace(/q/g, 'k');    
};

// --- 3. HAQIQIY EXCEL (.XLSX) YUKLASH FUNKSIYASI ---
const downloadExcel = (data: any[][], filename: string, colWidths: number[]) => {
  const worksheet = XLSX.utils.aoa_to_sheet(data); // Array of arrays to sheet
  
  // Ustunlarning kengligini (chiroyli qilib) sozlash
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ma'lumotlar");
  
  // Excel faylni to'g'ridan-to'g'ri .xlsx formatida yuklash
  XLSX.writeFile(workbook, filename);
};

export default function DeclarationsPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('Barcha hududlar');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDecl, setSelectedDecl] = useState<any>(null);

  const itemsPerPage = 20;

  // Filtrlash va qidirish
  const filteredData = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return mockDeclarations.filter(item => {
      const matchRegion = regionFilter === 'Barcha hududlar' || item.region === regionFilter;
      const matchSearch = normalizeText(item.name).includes(normalizedSearch);
      return matchRegion && matchSearch;
    });
  }, [search, regionFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Qarzdorlarni Excel yuklash (Topshirmaganlar ro'yxati)
  const handleDownloadDebtors = (regionName: string) => {
    const excelData = [
      ["ID", "Xodim F.I.Sh", "Hudud / Filial", "Lavozimi", "Holati"],
      ["1", "Abdullayev Alisher", regionName === "Barcha hududlar" ? "Bosh ofis" : regionName, "Kredit mutaxassisi", "Topshirmagan"],
      ["2", "Sodiqova Malika", regionName === "Barcha hududlar" ? "Toshkent shahri" : regionName, "Kassir", "Topshirmagan"],
      ["3", "Rahmonov Botir", regionName === "Barcha hududlar" ? "Buxoro viloyati" : regionName, "Buxgalter", "Topshirmagan"]
    ];
    
    // Ustun kengliklari (ID, Ism, Hudud, Lavozim, Holati)
    const colWidths = [5, 35, 25, 25, 20];
    downloadExcel(excelData, `Qarzdorlar_${regionName.replace(/\s+/g, '_')}.xlsx`, colWidths);
  };

  // Asosiy Jadvalni Excel yuklash (Filtrlangan ma'lumotlarni TO'LIQ ustunlar bilan)
  const handleDownloadFilteredData = () => {
    const excelData = [
      ["ID", "Xodim F.I.Sh", "Pasport", "JSHSHIR", "Hudud / Filial", "Sana", "Xavf darajasi", "Tizim Xulosasi (Risk)", "Qarindoshlar ma'lumoti"],
      ...filteredData.map(item => {
        // Xavf darajasini rasmga moslab o'zgartiramiz
        const riskLevel = item.risk === 'high' ? 'Qizil (Xavfli)' : item.risk === 'medium' ? 'Sariq (Diqqat)' : 'Yashil (Toza)';
        
        // Qarindoshlar ma'lumotini shakllantiramiz
        let relativesInfo = "Yo'q";
        if (item.details.relatives && item.details.relatives.length > 0) {
          relativesInfo = item.details.relatives.map((rel: any) => {
            if (rel.worksAtNbu) {
              return `${rel.name} (${rel.relation}) - NBUda ishlaydi: HA (${rel.nbuBranch})`;
            }
            return `${rel.name} (${rel.relation}) - NBUda ishlaydi: YO'Q`;
          }).join(" | ");
        }

        return [
          item.id,
          item.name,
          item.details.personal.passport,
          item.details.personal.pinfl,
          item.region,
          item.date,
          riskLevel,
          item.reason,
          relativesInfo
        ];
      })
    ];

    // Har bir ustun uchun taxminiy kenglik (Excelda yopishib qolmasligi uchun)
    const colWidths = [5, 35, 12, 16, 25, 12, 15, 35, 60];
    downloadExcel(excelData, `NBU_Deklaratsiyalar_${regionFilter.replace(/\s+/g, '_')}.xlsx`, colWidths);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans">
      
      {/* MODAL (Xodim deklaratsiyasini ko'rish) */}
      {selectedDecl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedDecl.name}</h2>
                <p className="text-sm text-slate-500">{selectedDecl.region} | Topshirilgan: {selectedDecl.date}</p>
              </div>
              <button onClick={() => setSelectedDecl(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 bg-slate-50">
              {/* Shaxsiy ma'lumotlar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Shaxsiy ma'lumotlar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-slate-500 mb-1">Pasport</p><p className="font-semibold text-slate-800">{selectedDecl.details.personal.passport}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">JSHSHIR</p><p className="font-semibold text-slate-800">{selectedDecl.details.personal.pinfl}</p></div>
                </div>
              </div>

              {/* Qarindoshlar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> Yaqin qarindoshlari</h3>
                <div className="space-y-3">
                  {selectedDecl.details.relatives.map((rel: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{rel.name}</p>
                        <p className="text-xs text-slate-500">{rel.relation}</p>
                      </div>
                      {rel.worksAtNbu && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded">NBU xodimi ({rel.nbuBranch})</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yuridik shaxslar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Building className="w-4 h-4"/> Aloqador yuridik shaxslar</h3>
                {selectedDecl.details.companies.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDecl.details.companies.map((comp: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-3 gap-4 items-center">
                        <div className="col-span-1"><p className="text-xs text-slate-500 mb-1">Kompaniya nomi</p><p className="font-bold text-slate-800 text-sm">{comp.name}</p></div>
                        <div className="col-span-1"><p className="text-xs text-slate-500 mb-1">STIR</p><p className="font-semibold text-slate-800 text-sm">{comp.stir}</p></div>
                        <div className="col-span-1 text-right"><p className="text-xs text-slate-500 mb-1">Ulushi</p><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">{comp.percent}%</span></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Yuridik shaxslar aniqlanmadi.</p>
                )}
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
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Deklaratsiyalar reyestri</h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-semibold text-slate-900">Rustamov Otabek</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">BKR Bosh mutaxassis</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8">
          
          {/* STATS & PROGRESS SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            
            {/* Jami Topshirilgan Blok */}
            <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm flex flex-col justify-center relative overflow-hidden xl:col-span-1">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10"></div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Jami topshirilgan</p>
              <h3 className="text-4xl font-black text-[#0A2540] relative z-10">4,032 <span className="text-xl font-semibold text-slate-400">/ 6,100</span></h3>
              <p className="text-sm text-blue-600 font-medium mt-4 relative z-10 flex items-center gap-2">
                <FileText className="w-4 h-4"/> Umumiy jarayon: 66%
              </p>
            </div>

            {/* Hududlar bo'yicha progress va Excel download */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
                Hududlar kesimida
                <button onClick={() => handleDownloadDebtors("Barcha hududlar")} className="text-xs flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                  <Download className="w-3.5 h-3.5"/> Barcha qarzdorlarni yuklash
                </button>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {progressData.map((item) => {
                  const percent = Math.round((item.submitted / item.total) * 100);
                  const barColor = percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-blue-500' : 'bg-red-500';
                  
                  return (
                    <div key={item.id} className="relative group">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        <div className="text-right flex items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-900">{item.submitted}</span>
                          <span className="text-[10px] text-slate-400 font-medium">/{item.total} kishi</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <button 
                          onClick={() => handleDownloadDebtors(item.name)}
                          title={`${item.name} qarzdorlarini yuklash`}
                          className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Toolbar (Qidiruv + Excel yuklash asosiysi) */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
                    placeholder="F.I.Sh orqali aqlli qidiruv..." 
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 bg-white transition-colors" 
                  />
                </div>
                <div className="relative sm:w-56">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select 
                    value={regionFilter}
                    onChange={(e) => {setRegionFilter(e.target.value); setCurrentPage(1);}}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-600 appearance-none bg-white font-medium cursor-pointer"
                  >
                    <option value="Barcha hududlar">Barcha hududlar</option>
                    {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              
              {/* ASOSIY JADVALNI YUKLASH (EXCEL) TUGMASI */}
              <button 
                onClick={handleDownloadFilteredData}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap w-full sm:w-auto shadow-sm"
              >
                <Download className="w-4 h-4" /> Excel yuklab olish
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500 w-16">#</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Xodim F.I.Sh</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Hudud / Filial</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Topshirilgan sana</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Tizim xulosasi (Xavf)</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.length > 0 ? currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-6 py-4 font-bold text-[#0A2540]">{item.name}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{item.region}</td>
                      <td className="px-6 py-4 text-slate-500">{item.date}</td>
                      <td className="px-6 py-4">
                        {item.risk === 'high' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Qizil hudud</span>}
                        {item.risk === 'medium' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Sariq hudud</span>}
                        {item.risk === 'low' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Toza</span>}
                        <p className="text-[11px] text-slate-500 mt-1.5">{item.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedDecl(item)}
                          className="text-blue-600 font-bold hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto text-xs transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Ko'rish
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Qidiruv natijalariga mos ma'lumot topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-xl">
                <span className="text-sm text-slate-500 font-medium">Jami {filteredData.length} tadan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} ko'rsatilmoqda</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}