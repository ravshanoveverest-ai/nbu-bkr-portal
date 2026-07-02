// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import * as XLSX from 'xlsx';
// import { 
//   LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
//   Settings, LogOut, Search, Filter, Download, AlertTriangle, 
//   CheckCircle, ChevronDown, Eye, User, X, Building
// } from 'lucide-react';

// // Haqiqiyga o'xshash 25 ta xodimlar ro'yxati (Paginatsiyani ko'rish uchun ko'paytirildi)
// const mockDeclarations = [
//   { id: 1, name: "Valiyev Alisher Baxodirovich", region: "Bosh ofis", date: "2024-02-15", status: "Tekshiruvda", risk: "red", riskReason: "Qarindoshi (Akasi) Bosh ofisda ishlaydi", details: { passport: "AA1234567", pinfl: "31505901234567", relatives: [{ relation: "Akasi", name: "Valiyev Sardor Baxodirovich", passport: "AC7654321", pinfl: "31201907654321", worksAtNbu: true, nbuBranch: "Bosh ofis", nbuPosition: "Kredit mutaxassisi" }], companies: [], conflictInfo: "Akam bosh ofis kredit bo'limida ishlaydi. Men esa komplayens nazoratda faoliyat yuritaman.", additionalInfo: "Boshqa manfaatlar to'qnashuvi yo'q." } },
//   { id: 2, name: "Toshmatov Sardor Olimovich", region: "Andijon viloyati", date: "2024-02-14", status: "Tasdiqlangan", risk: "yellow", riskReason: "O'zining nomida MCHJ mavjud", details: { passport: "AD9876543", pinfl: "32008951234567", relatives: [{ relation: "Otasi", name: "Toshmatov Olim Rustamovich", passport: "AA1112233", pinfl: "30501651234567", worksAtNbu: false }], companies: [{ type: "O'zining biznesi", name: "SARDOR IDEAL BIZNES MCHJ", stir: "305123456" }], conflictInfo: "O'zimning nomimda qurilish mollari bilan savdo qiluvchi MCHJ bor, lekin bank faoliyatiga aralashmaydi.", additionalInfo: "" } },
//   { id: 3, name: "Karimova Nargiza Rustamovna", region: "Toshkent shahar", date: "2024-02-14", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AB1239876", pinfl: "41805901234567", relatives: [], companies: [], conflictInfo: "Manfaatlar to'qnashuvi mavjud emas.", additionalInfo: "" } },
//   { id: 4, name: "Umarov Jasur Xasanovich", region: "Buxoro viloyati", date: "2024-02-13", status: "Tekshiruvda", risk: "red", riskReason: "Qarindoshi rahbarlik lavozimida", details: { passport: "FA4567890", pinfl: "31111921234567", relatives: [{ relation: "Turmush o'rtog'i", name: "Umarova Malika Azimovna", passport: "FA9876543", pinfl: "41212931234567", worksAtNbu: true, nbuBranch: "Buxoro viloyati", nbuPosition: "Filial boshqaruvchisi" }], companies: [], conflictInfo: "Turmush o'rtog'im o'zim ishlayotgan filialda rahbar lavozimida ishlaydi.", additionalInfo: "" } },
//   { id: 5, name: "Qodirova Madina Aliyevna", region: "Bosh ofis", date: "2024-02-12", status: "Qaytarilgan", risk: "yellow", riskReason: "Qarindoshiga tegishli STIR bank mijozi", details: { passport: "AC1122334", pinfl: "40505881234567", relatives: [], companies: [{ type: "Qarindosh biznesi", name: "MADINA TEX SERVIS XK", stir: "201987654" }], conflictInfo: "Onamning nomidagi firma bizning filialdan kredit olgan.", additionalInfo: "" } },
//   { id: 6, name: "Azimov Rustam Farxodovich", region: "Farg'ona viloyati", date: "2024-02-11", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AD5544332", pinfl: "31505991234567", relatives: [{ relation: "Ukasi", name: "Azimov Murod Farxodovich", passport: "AD5544333", pinfl: "31705991234567", worksAtNbu: false }], companies: [], conflictInfo: "Hech qanday manfaatlar to'qnashuvi yo'q", additionalInfo: "" } },
//   { id: 7, name: "Nurmatov Bekzod Akmalovich", region: "Namangan viloyati", date: "2024-02-10", status: "Tasdiqlangan", risk: "red", riskReason: "Mijozlar bilan ishlashda qarindoshlik", details: { passport: "KA9988776", pinfl: "30505901234567", relatives: [{ relation: "Otasi", name: "Nurmatov Akmal", passport: "KA1112233", pinfl: "30101701234567", worksAtNbu: false }], companies: [{ type: "Qarindosh biznesi", name: "NURMATOV PLAST MCHJ", stir: "304561234" }], conflictInfo: "Otamga tegishli MCHJ ga kredit ajratishda qatnashganman.", additionalInfo: "Rahbariyat ogohlantirilgan." } },
//   { id: 8, name: "Xalilova Sevara Murod qizi", region: "Qoraqalpog'iston Resp.", date: "2024-02-09", status: "Tekshiruvda", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "QR1234567", pinfl: "42001951234567", relatives: [], companies: [], conflictInfo: "Holat toza.", additionalInfo: "" } },
//   { id: 9, name: "Eshmatov G'ayrat Sobirovich", region: "Toshkent shahar", date: "2024-02-08", status: "Tasdiqlangan", risk: "yellow", riskReason: "Xodim ta'sischiligida firma bor", details: { passport: "AA0011223", pinfl: "30505911234567", relatives: [], companies: [{ type: "O'zining biznesi", name: "G'AYRAT SAVDO BARAKA", stir: "206541234" }], conflictInfo: "Savdo do'konim bor, uni ishonchli boshqaruvga berganman.", additionalInfo: "Hujjatlar taqdim etilgan." } },
//   { id: 10, name: "Salimova Feruza Botirovna", region: "Andijon viloyati", date: "2024-02-08", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AD4455667", pinfl: "41005951234567", relatives: [], companies: [], conflictInfo: "To'qnashuv yo'q.", additionalInfo: "" } },
//   { id: 11, name: "Rahmonov Dilshod Anvarovich", region: "Bosh ofis", date: "2024-02-07", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AA2233445", pinfl: "31205931234567", relatives: [], companies: [], conflictInfo: "Hammasi qonuniy.", additionalInfo: "" } },
//   { id: 12, name: "Ibragimov Shavkat O'tkamovich", region: "Buxoro viloyati", date: "2024-02-07", status: "Tasdiqlangan", risk: "red", riskReason: "Bitta bo'limda er-xotin ishlaydi", details: { passport: "FA1122334", pinfl: "30905901234567", relatives: [{ relation: "Turmush o'rtog'i", name: "Ibragimova Laylo", passport: "FA9988776", pinfl: "41105951234567", worksAtNbu: true, nbuBranch: "Buxoro viloyati", nbuPosition: "Buxgalter" }], companies: [], conflictInfo: "Xotinim bilan bir bo'limda ishlaymiz, pul o'tkazmalariga aloqador.", additionalInfo: "" } },
//   { id: 13, name: "Nematov Alisher Qobilovich", region: "Namangan viloyati", date: "2024-02-06", status: "Tekshiruvda", risk: "yellow", riskReason: "Qarindoshi bilan raqobatchi tashkilotda", details: { passport: "NA5566778", pinfl: "31805901234567", relatives: [{ relation: "Akasi", name: "Nematov Qobil", passport: "NA1122334", pinfl: "31505901234567", worksAtNbu: false }], companies: [], conflictInfo: "Akam boshqa raqobatchi bankda filial boshqaruvchisi.", additionalInfo: "Tijorat sirlari himoyasi bor." } },
//   { id: 14, name: "Xalilov Jamshid To'lqinovich", region: "Farg'ona viloyati", date: "2024-02-05", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "FA3344556", pinfl: "31505901234568", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 15, name: "Yusupova Shahnoza Ibrohim qizi", region: "Toshkent shahar", date: "2024-02-05", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AA7788990", pinfl: "41905951234567", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 16, name: "Samatov Izzatulla Bahodir o'g'li", region: "Bosh ofis", date: "2024-02-04", status: "Tasdiqlangan", risk: "yellow", riskReason: "Aksiyadorlik", details: { passport: "AA1231234", pinfl: "31505901234569", relatives: [], companies: [{ type: "O'zining biznesi", name: "UZTEX GROUP", stir: "305555555" }], conflictInfo: "Yirik korxona aksiyalariga egaman (1% dan kam).", additionalInfo: "" } },
//   { id: 17, name: "Botirov Sherzod Valiyevich", region: "Andijon viloyati", date: "2024-02-04", status: "Tekshiruvda", risk: "red", riskReason: "Ota-bola bir filialda", details: { passport: "AD5566778", pinfl: "31505901234570", relatives: [{ relation: "Otasi", name: "Botirov Vali", passport: "AD1122334", pinfl: "30105701234567", worksAtNbu: true, nbuBranch: "Andijon viloyati", nbuPosition: "Xo'jalik mudiri" }], companies: [], conflictInfo: "Otam filialda xo'jalik bo'limida ishlaydilar.", additionalInfo: "To'g'ridan-to'g'ri bo'ysunuv yo'q." } },
//   { id: 18, name: "Olimova Dildora Jasurovna", region: "Qoraqalpog'iston Resp.", date: "2024-02-03", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "QR3344556", pinfl: "42005951234568", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 19, name: "Rahmatov Zafar Murodovich", region: "Bosh ofis", date: "2024-02-02", status: "Tasdiqlangan", risk: "yellow", riskReason: "Tashqi o'rindoshlik", details: { passport: "AA9988776", pinfl: "31505901234571", relatives: [], companies: [], conflictInfo: "Dars berish faoliyati bilan shug'ullanaman (Iqtisodiyot universiteti).", additionalInfo: "Rahbariyat ruxsati bor." } },
//   { id: 20, name: "Yo'ldoshev Ulug'bek Tursunovich", region: "Toshkent shahar", date: "2024-02-01", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AA4455667", pinfl: "31505901234572", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 21, name: "Karimov Aziz Sobirovich", region: "Buxoro viloyati", date: "2024-02-01", status: "Qaytarilgan", risk: "red", riskReason: "Ma'lumotlar yashirilgan", details: { passport: "FA9988775", pinfl: "31505901234573", relatives: [], companies: [], conflictInfo: "Yo'q deb ko'rsatilgan, lekin orginfo dan xotinining kompaniyasi chiqdi.", additionalInfo: "BKR tomonidan tekshiruv jarayonida aniqlandi." } },
//   { id: 22, name: "Usmonov Qudrat Murodovich", region: "Namangan viloyati", date: "2024-01-30", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AA3332211", pinfl: "31505901234580", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 23, name: "Mirzayev Doston Ilhomovich", region: "Bosh ofis", date: "2024-01-29", status: "Tekshiruvda", risk: "yellow", riskReason: "Xodim ta'sischiligida firma bor", details: { passport: "AB1122334", pinfl: "31505901234581", relatives: [], companies: [{ type: "O'zining biznesi", name: "DOSTON TEX", stir: "205555111" }], conflictInfo: "To'qimachilik firmam bor", additionalInfo: "" } },
//   { id: 24, name: "Sodiqova Malika Ulug'bekovna", region: "Toshkent shahar", date: "2024-01-28", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AC9988776", pinfl: "41505901234582", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
//   { id: 25, name: "Jalolov Akmal Rustamovich", region: "Andijon viloyati", date: "2024-01-27", status: "Tasdiqlangan", risk: "safe", riskReason: "Xavf aniqlanmadi", details: { passport: "AD8877665", pinfl: "31505901234583", relatives: [], companies: [], conflictInfo: "Yo'q", additionalInfo: "" } },
// ];

// const regionsList = [
//   "Barcha hududlar", "Bosh ofis", "Andijon viloyati", "Buxoro viloyati", 
//   "Farg'ona viloyati", "Namangan viloyati", "Toshkent shahar", "Qoraqalpog'iston Resp."
// ];

// export default function AdminDashboard() {
//   const [selectedRegion, setSelectedRegion] = useState("Barcha hududlar");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedDeclaration, setSelectedDeclaration] = useState<any>(null);
  
//   // Pagination States
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   // Qidiruv yoki filter o'zgarganda sahifani 1 ga qaytarish
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, selectedRegion]);

//   // FUZZY SEARCH NORMALIZATSIYASI
//   // Ushbu funksiya so'zlarni bitta standartga tushiradi (sh -> s, ch -> c, o' -> o, a -> o va hokazo)
//   const normalizeString = (str: string) => {
//     return str.toLowerCase()
//       .replace(/'/g, '')      // tutuq belgisini ob tashlaydi
//       .replace(/sh/g, 's')    // sh va s ni bir xil ko'radi
//       .replace(/ch/g, 'c')    // ch va c
//       .replace(/o/g, 'a')     // o va a (Toshmatov -> Tashmatov)
//       .replace(/q/g, 'k')     // q va k
//       .replace(/g/g, 'g')
//       .replace(/\s+/g, '');   // bo'shliqlarni yo'qotadi
//   };

//   // Filtrlash logikasi (Region + Fuzzy Search)
//   const filteredData = mockDeclarations.filter(item => {
//     const matchRegion = selectedRegion === "Barcha hududlar" || item.region.includes(selectedRegion);
    
//     // Fuzzy Search tekshiruvi
//     const normalizedItemName = normalizeString(item.name);
//     const normalizedSearchQuery = normalizeString(searchQuery);
//     const matchSearch = normalizedItemName.includes(normalizedSearchQuery);
    
//     return matchRegion && matchSearch;
//   });

//   // Pagination hisob-kitoblari
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
//   const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
//   const handlePageClick = (pageNum: number) => setCurrentPage(pageNum);

//   // EXCEL YUKLAB OLISH LOGIKASI
//   const handleExportExcel = () => {
//     const exportData = filteredData.map(item => ({
//       "ID": item.id,
//       "Xodim F.I.Sh": item.name,
//       "Pasport": item.details.passport,
//       "JSHSHIR": item.details.pinfl,
//       "Hudud / Filial": item.region,
//       "Sana": item.date,
//       "Xavf darajasi": item.risk === 'red' ? 'Qizil (Xavfli)' : item.risk === 'yellow' ? 'Sariq (Diqqat)' : 'Yashil (Toza)',
//       "Tizim Xulosasi (Risk)": item.riskReason,
//       "Qarindoshlar ma'lumoti": item.details.relatives.length > 0 ? item.details.relatives.map((r: any) => `${r.name} (${r.relation}) - NBUda ishlaydi: ${r.worksAtNbu ? `HA (${r.nbuBranch}, ${r.nbuPosition})` : "YO'Q"}`).join(" | ") : "Yo'q",
//       "Kompaniyalar (Bizneslar)": item.details.companies.length > 0 ? item.details.companies.map((c: any) => `${c.name} (STIR: ${c.stir}) - ${c.type}`).join(" | ") : "Yo'q",
//       "Mavjud to'qnashuv holati": item.details.conflictInfo,
//       "Qo'shimcha izoh": item.details.additionalInfo || "Kiritilmagan"
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const wscols = [
//       {wch: 5}, {wch: 35}, {wch: 15}, {wch: 20}, {wch: 25}, 
//       {wch: 15}, {wch: 15}, {wch: 40}, {wch: 60}, {wch: 50}, {wch: 50}, {wch: 30}
//     ];
//     worksheet['!cols'] = wscols;

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Deklaratsiyalar");
//     XLSX.writeFile(workbook, `NBU_Deklaratsiyalar_${selectedRegion}.xlsx`);
//   };

//   return (
//     <div className="min-h-screen bg-[#F1F5F9] flex font-sans relative">
      
//       {/* DEKLARATSIYA TO'LIQ MA'LUMOTI UCHUN MODAL (POP-UP) */}
//       {selectedDeclaration && (
//         <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
//           <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-[#0A2540]">
//               <div>
//                 <h2 className="text-xl font-bold text-white tracking-wide">{selectedDeclaration.name}</h2>
//                 <p className="text-sm text-slate-300 mt-1">{selectedDeclaration.region} | Topshirilgan sana: {selectedDeclaration.date}</p>
//               </div>
//               <button 
//                 onClick={() => setSelectedDeclaration(null)}
//                 className="p-2 text-slate-300 hover:bg-white/10 hover:text-white rounded-full transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
            
//             {/* Modal Body */}
//             <div className="p-6 overflow-y-auto space-y-8 bg-white">
              
//               {/* Shaxsiy Ma'lumotlar */}
//               <div>
//                 <h3 className="text-lg font-bold text-[#0A2540] border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
//                   <User className="w-5 h-5 text-blue-600" /> Shaxsiy ma'lumotlar
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-5 rounded-xl border border-slate-200">
//                   <div>
//                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pasport / ID</span>
//                     <span className="text-base font-bold text-slate-900">{selectedDeclaration.details.passport}</span>
//                   </div>
//                   <div>
//                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">JSHSHIR</span>
//                     <span className="text-base font-bold text-slate-900">{selectedDeclaration.details.pinfl}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Qarindoshlar */}
//               {selectedDeclaration.details.relatives.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-bold text-[#0A2540] border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
//                     <Users className="w-5 h-5 text-blue-600" /> Yaqin qarindoshlar
//                   </h3>
//                   <div className="space-y-4">
//                     {selectedDeclaration.details.relatives.map((rel: any, idx: number) => (
//                       <div key={idx} className="bg-[#F8FAFC] p-5 rounded-xl border border-slate-200 shadow-sm">
//                         <div className="flex justify-between items-center mb-4">
//                           <span className="text-base font-bold text-slate-900">
//                             {rel.name}
//                             <span className="ml-3 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">{rel.relation}</span>
//                           </span>
//                         </div>
//                         <div className="grid grid-cols-2 gap-6 text-sm mb-4">
//                           <div>
//                             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pasport / ID</span> 
//                             <span className="font-semibold text-slate-800">{rel.passport}</span>
//                           </div>
//                           <div>
//                             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">JSHSHIR</span> 
//                             <span className="font-semibold text-slate-800">{rel.pinfl}</span>
//                           </div>
//                         </div>
//                         <div className="border-t border-slate-200 pt-3">
//                           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider inline-block mr-2">NBU da ishlaydimi:</span> 
//                           {rel.worksAtNbu ? (
//                             <span className="font-bold text-amber-600">Ha ({rel.nbuBranch} - {rel.nbuPosition})</span>
//                           ) : (
//                             <span className="font-bold text-emerald-600">Yo'q</span>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Kompaniyalar */}
//               {selectedDeclaration.details.companies.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-bold text-[#0A2540] border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
//                     <Building className="w-5 h-5 text-blue-600" /> Yuridik shaxslar
//                   </h3>
//                   <div className="grid grid-cols-1 gap-4">
//                     {selectedDeclaration.details.companies.map((comp: any, idx: number) => (
//                       <div key={idx} className="flex justify-between items-center bg-[#F8FAFC] p-5 rounded-xl border border-slate-200 shadow-sm">
//                         <div>
//                           <p className="text-base font-bold text-slate-900">{comp.name}</p>
//                           <p className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block mt-2">{comp.type}</p>
//                         </div>
//                         <div className="text-right bg-white p-3 rounded-lg border border-slate-200">
//                           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">STIR (INN)</span>
//                           <span className="text-lg font-bold text-slate-900">{comp.stir}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Xulosa */}
//               <div>
//                 <h3 className="text-lg font-bold text-[#0A2540] border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
//                   <AlertTriangle className="w-5 h-5 text-amber-500" /> Ehtimoliy manfaatlar to'qnashuvi
//                 </h3>
//                 <div className="bg-[#FFFBEB] p-5 rounded-xl border border-amber-200 text-amber-900 text-base font-medium leading-relaxed shadow-sm">
//                   {selectedDeclaration.details.conflictInfo}
//                 </div>
//                 {selectedDeclaration.details.additionalInfo && (
//                   <div className="mt-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed">
//                     <span className="font-semibold block mb-1">Qo'shimcha izoh:</span>
//                     {selectedDeclaration.details.additionalInfo}
//                   </div>
//                 )}
//               </div>

//             </div>
            
//             {/* Modal Footer */}
//             <div className="p-5 border-t border-slate-200 bg-[#F8FAFC] flex justify-end">
//               <button 
//                 onClick={() => setSelectedDeclaration(null)}
//                 className="px-8 py-2.5 bg-[#0A2540] text-white font-medium rounded-lg hover:bg-[#113559] transition-colors shadow-sm"
//               >
//                 Yopish
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* MODAL YAKUNI */}


//       {/* SIDEBAR (Chap menyu) */}
//       <aside className="w-64 bg-[#0A2540] text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
//         <div className="h-16 flex items-center px-6 bg-[#071d33] border-b border-slate-700/50">
//           <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#0A2540] font-bold text-xs mr-3 shadow-sm">NBU</div>
//           <span className="text-white font-semibold tracking-wide">BKR Admin</span>
//         </div>
        
//         <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
//           <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
//             <LayoutDashboard className="w-5 h-5" /> Dashboard
//           </Link>
//           <Link href="/admin/declarations" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
//             <FileText className="w-5 h-5" /> Deklaratsiyalar
//           </Link>
//           <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors flex-justify-between">
//             <div className="flex items-center gap-3">
//               <ShieldAlert className="w-5 h-5" /> Xabarnomalar
//             </div>
//             <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
//           </Link>
//           <Link href="/admin/campaigns" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
//             <Calendar className="w-5 h-5" /> Muddatlarni sozlash
//           </Link>
//           <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors">
//             <Users className="w-5 h-5" /> Xodimlar bazasi
//           </Link>
//         </nav>

//         <div className="p-4 border-t border-slate-700/50">
//           <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 hover:text-white rounded-lg transition-colors mb-2">
//             <Settings className="w-5 h-5" /> Sozlamalar
//           </Link>
//           <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
//             <LogOut className="w-5 h-5" /> Chiqish
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT (O'ng tomon) */}
//       <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
//         {/* Top Header */}
//         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
//           <h1 className="text-xl font-bold text-slate-800">Deklaratsiyalar monitoringi</h1>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-3 text-sm text-slate-600">
//               <div className="text-right">
//                 <p className="font-semibold text-slate-900">Rustamov Otabek</p>
//                 <p className="text-xs text-slate-500">BKR Bosh mutaxassis</p>
//               </div>
//               <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
//                 <User className="w-5 h-5 text-slate-500" />
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Content Body */}
//         <div className="flex-1 p-8">
          
//           {/* STATISTIKA KARTALARI */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500 mb-1">Jami topshirilgan</p>
//                 <h3 className="text-2xl font-bold text-slate-800">1,245</h3>
//               </div>
//               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
//                 <FileText className="w-6 h-6" />
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm flex items-center justify-between relative overflow-hidden">
//               <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
//               <div>
//                 <p className="text-sm font-medium text-slate-500 mb-1">Qizil hudud (Xavfli)</p>
//                 <h3 className="text-2xl font-bold text-red-600">28</h3>
//               </div>
//               <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
//                 <AlertTriangle className="w-6 h-6" />
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-6 border border-amber-100 shadow-sm flex items-center justify-between relative overflow-hidden">
//               <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
//               <div>
//                 <p className="text-sm font-medium text-slate-500 mb-1">Sariq hudud (Diqqat)</p>
//                 <h3 className="text-2xl font-bold text-amber-600">142</h3>
//               </div>
//               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
//                 <AlertTriangle className="w-6 h-6" />
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm flex items-center justify-between relative overflow-hidden">
//               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
//               <div>
//                 <p className="text-sm font-medium text-slate-500 mb-1">Yashil hudud (Toza)</p>
//                 <h3 className="text-2xl font-bold text-emerald-600">1,075</h3>
//               </div>
//               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
//                 <CheckCircle className="w-6 h-6" />
//               </div>
//             </div>
//           </div>

//           {/* TABLE SECTION */}
//           <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
//             {/* Table Header & Filters */}
//             <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Search className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Xodim F.I.Sh orqali qidirish..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="block w-full sm:w-72 pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] text-sm text-slate-900 placeholder:text-slate-500 outline-none bg-white"
//                   />
//                 </div>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Filter className="h-4 w-4 text-slate-400" />
//                   </div>
//                   <select
//                     value={selectedRegion}
//                     onChange={(e) => setSelectedRegion(e.target.value)}
//                     className="block w-full sm:w-56 pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-[#0A2540] focus:border-[#0A2540] text-sm text-slate-900 font-medium outline-none appearance-none bg-white cursor-pointer"
//                   >
//                     {regionsList.map(region => (
//                       <option key={region} value={region} className="text-slate-900">{region}</option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                     <ChevronDown className="h-4 w-4 text-slate-400" />
//                   </div>
//                 </div>
//               </div>

//               {/* Export Button */}
//               <button 
//                 onClick={handleExportExcel}
//                 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
//               >
//                 <Download className="w-4 h-4" /> Excel yuklab olish
//               </button>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm text-slate-600">
//                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
//                   <tr>
//                     <th className="px-6 py-4 whitespace-nowrap">ID</th>
//                     <th className="px-6 py-4 whitespace-nowrap">Xodim F.I.Sh</th>
//                     <th className="px-6 py-4 whitespace-nowrap">Hudud / Filial</th>
//                     <th className="px-6 py-4 whitespace-nowrap">Topshirilgan sana</th>
//                     <th className="px-6 py-4 whitespace-nowrap">Tizim xulosasi (Xavf)</th>
//                     <th className="px-6 py-4 whitespace-nowrap text-right">Harakatlar</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                   {paginatedData.length > 0 ? (
//                     paginatedData.map((item) => (
//                       <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
//                         <td className="px-6 py-4 font-medium text-slate-900">#{item.id}</td>
//                         <td 
//                           className="px-6 py-4 font-bold text-[#0A2540] cursor-pointer hover:text-blue-600 hover:underline transition-colors"
//                           onClick={() => setSelectedDeclaration(item)}
//                         >
//                           {item.name}
//                         </td>
//                         <td className="px-6 py-4 font-medium text-slate-700">{item.region}</td>
//                         <td className="px-6 py-4 text-slate-600">{item.date}</td>
//                         <td className="px-6 py-4">
//                           {item.risk === 'red' && (
//                             <div className="flex flex-col gap-1.5">
//                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 w-max border border-red-200">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Qizil hudud
//                               </span>
//                               <span className="text-[11px] font-medium text-slate-600">{item.riskReason}</span>
//                             </div>
//                           )}
//                           {item.risk === 'yellow' && (
//                             <div className="flex flex-col gap-1.5">
//                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 w-max border border-amber-200">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Sariq hudud
//                               </span>
//                               <span className="text-[11px] font-medium text-slate-600">{item.riskReason}</span>
//                             </div>
//                           )}
//                           {item.risk === 'safe' && (
//                             <div className="flex flex-col gap-1.5">
//                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 w-max border border-emerald-200">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Toza
//                               </span>
//                               <span className="text-[11px] font-medium text-slate-500">{item.riskReason}</span>
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right">
//                           <button 
//                             onClick={() => setSelectedDeclaration(item)}
//                             className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors inline-flex items-center gap-2 text-xs font-bold border border-transparent group-hover:border-blue-200"
//                           >
//                             <Eye className="w-4 h-4" /> Ko'rish
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
//                         Ushbu hudud bo'yicha yoki qidiruv so'roviga mos ma'lumot topilmadi.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
            
//             {/* Pagination Controls */}
//             {filteredData.length > 0 && (
//               <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-b-xl">
//                 <span className="font-medium">
//                   Jami: <span className="text-slate-900 font-bold">{filteredData.length}</span> ta natija ({currentPage}-{totalPages} sahifa)
//                 </span>
//                 <div className="flex items-center gap-2 font-medium">
//                   <button 
//                     onClick={handlePrevPage}
//                     disabled={currentPage === 1}
//                     className="px-3 py-1.5 border border-slate-300 bg-white rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
//                   >
//                     Oldingi
//                   </button>

//                   {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
//                     <button 
//                       key={page} 
//                       onClick={() => handlePageClick(page)} 
//                       className={`px-3 py-1.5 border rounded-md transition-colors cursor-pointer ${currentPage === page ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'}`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                   <button 
//                     onClick={handleNextPage}
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1.5 border border-slate-300 bg-white rounded-md hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
//                   >
//                     Keyingi
//                   </button>
//                 </div>
//               </div>
//             )}

//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  Settings, LogOut, User, Activity, MapPin, BarChart3, AlertTriangle
} from 'lucide-react';

// O'zbekistonning barcha 14 ta hududi (Geografik xaritaga moslashtirilgan X, Y koordinatalar)
const mapData = [
  { id: 1, name: "Qoraqalpog'iston", risk: 5, x: 22, y: 30 },
  { id: 2, name: "Xorazm", risk: 22, x: 35, y: 48 },
  { id: 3, name: "Navoiy", risk: 12, x: 48, y: 42 },
  { id: 4, name: "Buxoro", risk: 85, x: 42, y: 65 },
  { id: 5, name: "Samarqand", risk: 45, x: 60, y: 62 },
  { id: 6, name: "Qashqadaryo", risk: 55, x: 62, y: 78 },
  { id: 7, name: "Surxondaryo", risk: 18, x: 70, y: 92 },
  { id: 8, name: "Jizzax", risk: 10, x: 70, y: 55 },
  { id: 9, name: "Sirdaryo", risk: 8, x: 76, y: 52 },
  { id: 10, name: "Toshkent viloyati", risk: 28, x: 82, y: 42 },
  { id: 11, name: "Toshkent shahri", risk: 48, x: 79, y: 35 }, // Viloyat bilan ustma-ust tushmasligi uchun biroz surildi
  { id: 12, name: "Namangan", risk: 14, x: 92, y: 32 },
  { id: 13, name: "Farg'ona", risk: 35, x: 92, y: 45 },
  { id: 14, name: "Andijon", risk: 11, x: 97, y: 38 },
];

// Hududlar kesimida deklaratsiya topshirish statistikasi
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
];

// Xavf foiziga qarab avtomatik rang beruvchi funksiya
const getStatusConfig = (risk: number) => {
  if (risk > 50) return { color: "bg-red-500", shadow: "shadow-red-500/40", text: "text-red-600", border: "border-red-200", gradient: "from-red-500/0 via-red-500 to-red-500" };
  if (risk >= 15) return { color: "bg-amber-500", shadow: "shadow-amber-500/40", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500/0 via-amber-500 to-amber-500" };
  return { color: "bg-emerald-500", shadow: "shadow-emerald-500/40", text: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-500/0 via-emerald-500 to-emerald-500" };
};

export default function AdminDashboard() {
  const totalEmployees = 1500;
  const totalSubmitted = 1335;
  const overallPercent = Math.round((totalSubmitted / totalEmployees) * 100);

  // Hover qilingan element eng oldinga chiqishi uchun State
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A2540] text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-16 flex items-center px-6 bg-[#071d33] border-b border-slate-700/50">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#0A2540] font-bold text-xs mr-3 shadow-sm">NBU</div>
          <span className="text-white font-semibold tracking-wide">BKR Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium transition-colors">
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
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Korporativ Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-semibold text-slate-900">Rustamov Otabek</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">BKR Bosh mutaxassis</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8">
          
          {/* Yuqori tezkor statistika */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Umumiy ko'rsatkich</p>
              <div className="flex items-end justify-between mb-3">
                <h3 className="text-2xl font-black text-[#0A2540]">{totalSubmitted} / <span className="text-lg text-slate-400">{totalEmployees}</span></h3>
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">{overallPercent}% Bajarildi</div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${overallPercent}%` }}></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Eng xavfli hudud</p>
              <div className="flex items-end justify-between mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-none">Buxoro</h3>
                    <p className="text-xs text-slate-500 mt-1">120 tadan 35 tasi xavfli</p>
                  </div>
                </div>
                <div className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-md border border-red-100">85% Risk</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Faol xabarnomalar</p>
              <div className="flex items-end justify-between mt-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-8 h-8 text-amber-500" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-none">170 ta</h3>
                    <p className="text-xs text-slate-500 mt-1">Ko'rib chiqilmoqda</p>
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100">Diqqat</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* CHAP QISM: 3D XARITA (2 ustunni egallaydi) */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[550px]">
              <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md z-10 absolute top-0 left-0 w-full flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Hududlar bo'yicha ehtimoliy risk xaritasi
                </h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-xs text-slate-500 font-medium">Yuqori</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-xs text-slate-500 font-medium">O'rta</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-xs text-slate-500 font-medium">Past</span></div>
                </div>
              </div>

              {/* 3D MAP KONTEYNERI */}
              <div className="flex-1 flex items-center justify-center pt-20 pb-10 bg-[#FAFAFA]" style={{ perspective: '1200px' }}>
                <div 
                  className="relative w-[850px] h-[500px] transition-transform duration-1000 ease-out"
                  style={{ transform: 'rotateX(55deg) rotateZ(-20deg)', transformStyle: 'preserve-3d' }}
                >
                  
                  {/* O'ZBEKISTON GEOGRAFIK XARITASI (SVG Asos) */}
                  <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full drop-shadow-xl opacity-80" style={{ transform: 'translateZ(-1px)' }}>
                    <polygon
                      points="150,220 220,180 280,200 350,190 450,250 500,240 550,280 650,260 700,290 750,260 800,270 850,220 950,260 980,300 950,330 900,320 860,380 820,360 780,410 720,380 680,480 700,550 630,580 580,500 600,440 520,400 450,460 380,430 300,350 250,390 180,360 120,370 80,310 100,250"
                      fill="#E2E8F0"
                      stroke="#CBD5E1"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(10,37,64,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(10,37,64,0.04)_1px,transparent_1px)] bg-[size:40px_40px] rounded-3xl" style={{ clipPath: 'polygon(150px 220px, 220px 180px, 280px 200px, 350px 190px, 450px 250px, 500px 240px, 550px 280px, 650px 260px, 700px 290px, 750px 260px, 800px 270px, 850px 220px, 950px 260px, 980px 300px, 950px 330px, 900px 320px, 860px 380px, 820px 360px, 780px 410px, 720px 380px, 680px 480px, 700px 550px, 630px 580px, 580px 500px, 600px 440px, 520px 400px, 450px 460px, 380px 430px, 300px 350px, 250px 390px, 180px 360px, 120px 370px, 80px 310px, 100px 250px)' }}></div>

                  {/* MARKERLAR */}
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
                          // Hover bo'lganda z-indexni eng yuqoriga chiqarish va biroz kattalashtirish
                          zIndex: isHovered ? 999 : 10,
                          transform: isHovered ? 'scale(1.1) translateZ(20px)' : 'scale(1) translateZ(0px)'
                        }}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      >
                        {/* Yerda yotgan pulsatsiyali nuqta */}
                        <div className={`w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 animate-ping opacity-30 ${config.color}`}></div>
                        <div className={`w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 shadow-[0_0_10px] ${config.color} ${config.shadow}`}></div>

                        {/* 3D ustun va ma'lumot */}
                        <div 
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 origin-bottom flex flex-col items-center transition-transform duration-300"
                          style={{ transform: 'rotateZ(20deg) rotateX(-55deg)' }}
                        >
                          {/* Tooltip Card (Yorug' tema) */}
                          <div className={`bg-white/95 backdrop-blur-md border p-2.5 rounded-xl shadow-lg flex flex-col items-center gap-0.5 min-w-[110px] ${config.border}`}>
                            <h4 className="text-slate-700 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                              <MapPin className={`w-3 h-3 ${config.text}`} />
                              {region.name}
                            </h4>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className={`text-xl font-black leading-none ${config.text}`}>
                                {region.risk}%
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">risk</span>
                            </div>
                          </div>
                          
                          {/* Bog'lovchi nur */}
                          <div 
                            className={`w-0.5 rounded-full mt-1.5 bg-gradient-to-t ${config.gradient}`}
                            style={{ height: `${(region.risk * 1.2) + 15}px` }} 
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* O'NG QISM: HUDUDLAR BO'YICHA TOPSHIRISH STATISTIKASI (Barchart) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-[550px]">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Topshirish ko'rsatkichlari
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-5">
                {progressData.map((item) => {
                  const percent = Math.round((item.submitted / item.total) * 100);
                  // Rangi foizga qarab o'zgaradi
                  const barColor = percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-blue-500' : 'bg-red-500';
                  
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900">{item.submitted}</span>
                          <span className="text-xs text-slate-400 font-medium"> / {item.total} kishi</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center relative">
                        <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-[10px] text-slate-400">{item.total - item.submitted} ta deklaratsiya qoldi</p>
                        <p className="text-[10px] font-bold text-slate-500">{percent}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TUGMA ENDI ISHLAYDI: Sahifaga yo'naltiradi */}
              <Link href="/admin/declarations" className="block text-center w-full mt-6 py-2.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
                Batafsil ro'yxatni ko'rish
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}