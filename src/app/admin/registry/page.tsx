'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  LogOut, User, Search, Plus, Download, X, AlertCircle, FileBarChart, CheckSquare
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function RegistryPage() {
  const [adminProfile, setAdminProfile] = useState({ name: 'Admin', role: "BKR Boshlig'i" });
  
  // Ma'lumotlar state-lari
  const [registryData, setRegistryData] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    branchPosition: '',
    details: '',
    riskType: 'Sariq'
  });

  useEffect(() => {
    const userInfoString = localStorage.getItem('user_info');
    if (userInfoString) {
      const parsed = JSON.parse(userInfoString);
      setAdminProfile({ name: parsed.fullName || 'Admin', role: parsed.role === 'admin' ? "BKR Administrator" : "BKR Xodimi" });
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resReg, resCamp] = await Promise.all([
        fetch('https://nbu-bkr-api.onrender.com/api/registry').catch(() => ({ ok: false, json: () => [] })),
        fetch('https://nbu-bkr-api.onrender.com/api/campaigns').catch(() => ({ ok: false, json: () => [] }))
      ]);

      if (!resReg.ok) {
        console.error("Server API xatosi! Backend yangilanmagan.");
      }

      const regData = resReg.ok ? await (resReg as Response).json() : [];
      const campData = resCamp.ok ? await (resCamp as Response).json() : [];

      setRegistryData(regData);
      setCampaigns(campData);

      // Faol muddatni avtomat tanlab qo'yish
      const activeCamp = campData.find((c: any) => c.status === 'active');
      if (activeCamp) {
        setSelectedCampaignId(activeCamp._id);
      }
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('https://nbu-bkr-api.onrender.com/api/registry/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ fullName: '', branchPosition: '', details: '', riskType: 'Sariq' });
        fetchData(); 
      } else {
        alert("Serverda xatolik yuz berdi! Backend Render'ga yuklanganini tekshiring.");
      }
    } catch (error) {
      console.error("Saqlashda xatolik", error);
      alert("Internet yoki server bilan aloqa yo'q!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MUDDAT VA QIDIRUV BO'YICHA FILTRLASH ---
  const filteredByCampaign = useMemo(() => {
    if (selectedCampaignId === 'all') return registryData;
    
    const campaign = campaigns.find(c => c._id === selectedCampaignId);
    if (!campaign) return registryData;

    const startTime = new Date(campaign.startDate).getTime();
    const endTime = new Date(campaign.endDate).getTime() + 86400000; // Oxirgi kunni ham qo'shish

    return registryData.filter(item => {
      const itemTime = new Date(item.date).getTime();
      return itemTime >= startTime && itemTime <= endTime;
    });
  }, [registryData, selectedCampaignId, campaigns]);

  const finalFilteredData = useMemo(() => {
    return filteredByCampaign.filter(item => 
      item.fullName.toLowerCase().includes(search.toLowerCase()) || 
      item.branchPosition.toLowerCase().includes(search.toLowerCase())
    );
  }, [filteredByCampaign, search]);

  // --- EXCELJS YUKLAB OLISH (5-ILOVA FORMATI UCHUN QAT'IY SAQLANDI) ---
  const downloadStyledExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Reyestr', { views: [{ showGridLines: false }] });

    ws.columns = [
      { key: 'A', width: 6 },   // T.r
      { key: 'B', width: 18 },  // Sana
      { key: 'C', width: 35 },  // F.I.O
      { key: 'D', width: 40 },  // Lavozimi
      { key: 'E', width: 50 },  // Qisqacha ma'lumot
      { key: 'F', width: 25 },  // Turi
      { key: 'G', width: 30 },  // Choralar
      { key: 'H', width: 30 },  // Xulosa raqami
      { key: 'I', width: 30 },  // Bayonnoma
      { key: 'J', width: 35 },  // Mas'ul shaxs
      { key: 'K', width: 30 },  // Imzo
    ];

    const ilovaCell = ws.getCell('K1');
    ilovaCell.value = '5-Илова';
    ilovaCell.font = { bold: true, name: 'Times New Roman' };
    ilovaCell.alignment = { horizontal: 'center' };

    ws.mergeCells('A2:K2');
    const titleCell = ws.getCell('A2');
    titleCell.value = '“O‘zmilliybank” AJ ning манфаатлар тўқнашувини ҳисобга олиш РЕЕСТРИ *';
    titleCell.font = { bold: true, size: 14, name: 'Times New Roman' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells('I4:K4');
    const dateCell = ws.getCell('I4');
    const todayStr = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '.');
    dateCell.value = `${todayStr} ҳолатига`;
    dateCell.font = { bold: true, color: { argb: 'FFFF0000' }, name: 'Times New Roman' }; 
    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } }; 
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };

    const headers = [
      "Т/р", 
      "Маълумотлар олинган сана", 
      "Мавжуд ёки эҳтимолий манфаатлар тўқнашуви ҳолатларини реестрга киритган ходимнинг Ф.И.О.", 
      "Ходим фаолият юритаётган таркибий бўлинманинг номи ва унинг лавозими", 
      "Манфаатлар тўқнашувига оид қисқача маълумот", 
      "Манфаатлар тўқнашувининг тури (мавжуд ёки эҳтимолий)", 
      "Манфаатлар тўқнашувини тартибга солиш бўйича кўрилган чоралар", 
      "Махсус бўлинма томонидан қабул қилинган хулоса рақами ва санаси", 
      "Одоб-ахлоқ комиссияси йиғилиш баённомаси рақами ва санаси **", 
      "Кўрилган чораларнинг амалга оширилиши устидан назорат қилиш бўйича масъул шахс", 
      "Махсус бўлинма ходимининг ўз қўли билан қўйилган имзоси ёки электрон рақамли имзоси ва сана"
    ];

    const headerRow = ws.getRow(5);
    headerRow.values = headers;
    headerRow.height = 80;

    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } }; 
      cell.font = { bold: true, name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    finalFilteredData.forEach((item, index) => {
      const row = ws.addRow([
        index + 1,
        item.date,
        item.fullName,
        item.branchPosition,
        item.details,
        item.riskType === 'Qizil' ? 'Манфаатлар тўқнашуви мавжуд' : 'Эҳтимолий манфаатлар тўқнашуви',
        '', '', '', '', '' 
      ]);

      row.eachCell((cell) => {
        cell.font = { name: 'Times New Roman', size: 11 };
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `NBU_Reyestr_${todayStr}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex font-sans overflow-hidden">
      
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
          <Link href="/admin/registry" className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 font-bold rounded-lg transition-colors">
            <CheckSquare className="w-5 h-5" /> Reyestr
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
        <div className="p-4 border-t border-slate-700/50">
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <header className="min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Reyestr</h1>
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

          {/* MUDDAT FILTRI VA TOOLBAR */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 self-start">
              <span className="text-xs font-bold text-slate-500 uppercase ml-2 flex items-center gap-1">
                <Calendar className="w-4 h-4"/> Muddat:
              </span>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer min-w-[250px]"
              >
                <option value="all">Barcha davrlar</option>
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.year} [{new Date(c.startDate).toLocaleDateString('uz-UZ')} - {new Date(c.endDate).toLocaleDateString('uz-UZ')}] {c.status === 'active' ? '(FAOL)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Xodim qidirish..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm text-black placeholder-slate-400 outline-none focus:border-blue-600 bg-white"
                />
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" /> Qo'shish
              </button>
              <button onClick={downloadStyledExcel} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00875A] text-white font-bold text-sm rounded-xl hover:bg-[#00734D] transition-colors shadow-sm whitespace-nowrap">
                <Download className="w-4 h-4" /> Excel yuklash
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-500 w-16">T/r</th>
                    <th className="px-6 py-4 font-bold text-slate-500 w-32">Sana</th>
                    <th className="px-6 py-4 font-bold text-slate-500">Xodim F.I.O</th>
                    <th className="px-6 py-4 font-bold text-slate-500">Tarkibiy bo'linma va lavozimi</th>
                    <th className="px-6 py-4 font-bold text-slate-500 w-1/3">Manfaatlar to'qnashuviga oid ma'lumot</th>
                    <th className="px-6 py-4 font-bold text-slate-500">Holat turi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <div className="flex justify-center mb-2"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : finalFilteredData.length > 0 ? finalFilteredData.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 font-bold text-[#0A2540]">
                        {item.fullName}
                        {item.source === 'manual' && <span className="ml-2 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Qo'lda</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">{item.branchPosition}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 bg-red-50/30">
                        {item.details}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                          item.riskType === 'Qizil' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.riskType === 'Qizil' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {item.riskType === 'Qizil' ? 'Mavjud' : 'Ehtimoliy'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Ushbu muddat bo'yicha reyestr topilmadi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* QO'LDA QO'SHISH MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Yashiringan holatni kiritish</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium">
                  Ushbu shakl orqali faqat deklaratsiyada o'z ma'lumotlarini qasddan yashirgan, lekin surishtiruv natijasida xavf aniqlangan xodimlar kiritiladi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Xodim F.I.O</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 text-black" placeholder="Masalan: Aliyev Vali" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bo'linma va Lavozimi</label>
                <input required type="text" value={formData.branchPosition} onChange={e => setFormData({...formData, branchPosition: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 text-black" placeholder="Masalan: Bosh ofis, Kredit bo'limi boshlig'i" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Aniqlangan holat bo'yicha ma'lumot</label>
                <textarea required rows={3} value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 text-black resize-none" placeholder="Masalan: Akasi, soliq qo'mitasida ishlaydi..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Xavf turi</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="riskType" value="Sariq" checked={formData.riskType === 'Sariq'} onChange={() => setFormData({...formData, riskType: 'Sariq'})} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-amber-600">Ehtimoliy (Sariq)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="riskType" value="Qizil" checked={formData.riskType === 'Qizil'} onChange={() => setFormData({...formData, riskType: 'Qizil'})} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-red-600">Mavjud (Qizil)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-70">
                  {isSubmitting ? 'Saqlanmoqda...' : 'Bazaga qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}