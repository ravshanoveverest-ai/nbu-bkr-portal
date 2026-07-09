'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { 
  LayoutDashboard, FileText, ShieldAlert, Users, Calendar, 
  LogOut, User, Activity, Download, FileBarChart, Briefcase, Network, Landmark, CheckCircle
} from 'lucide-react';

// Hisobot muddatlari uchun Data
const reportDataStore = {
  'I yarim yillik': {
    total: 6525, submitted: 6287, excused: 238,
    relatives: 385, subordination: 4, shares: 42, relativeShares: 158
  },
  'II yarim yillik': {
    total: 6600, submitted: 6410, excused: 190,
    relatives: 390, subordination: 2, shares: 45, relativeShares: 162
  },
  'Yillik': {
    total: 6600, submitted: 6450, excused: 150,
    relatives: 410, subordination: 6, shares: 50, relativeShares: 175
  }
};

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'I yarim yillik' | 'II yarim yillik' | 'Yillik'>('I yarim yillik');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const currentData = reportDataStore[period];
  const submittedPercent = Math.round((currentData.submitted / currentData.total) * 100);

  // --- SVG NI PNG GA O'GIRISH ---
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
          resolve(canvas.toDataURL('image/png').split(',')[1]);
        } else {
          reject("Canvas yaratishda xatolik");
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => reject("Rasmni yuklashda xatolik");
      img.src = url;
    });
  };

  const base64ToUint8Array = (base64: string) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // --- HAQIQIY WORD (.DOCX) GENERATORI ---
  const downloadReport = async () => {
    setIsDownloading(true);
    try {
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
          <text x="60" y="96" font-family="Times New Roman" font-size="14">Bola parvarishi ta'tili, o'qish va boshqa uzrli sabablarga ko'ra topshirmaganlar</text>

          <g transform="translate(300, 190) rotate(-90)">
            <circle r="${r}" cx="0" cy="0" fill="transparent" stroke="#C0504D" stroke-width="35" />
            <circle r="${r}" cx="0" cy="0" fill="transparent" stroke="#4472C4" stroke-width="35" stroke-dasharray="${dash} ${c}" />
          </g>
          <text x="300" y="196" text-anchor="middle" font-family="Times New Roman" font-size="18" font-weight="bold">${submittedPercent}%</text>
        </svg>
      `;

      const maxVal = Math.max(currentData.relatives, currentData.subordination, currentData.shares, currentData.relativeShares);
      const barSvg = `
        <svg width="700" height="250" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff" />
          
          <line x1="280" y1="20" x2="280" y2="220" stroke="#d1d5db" stroke-width="2" />
          <line x1="380" y1="20" x2="380" y2="220" stroke="#e5e7eb" stroke-width="1" />
          <line x1="480" y1="20" x2="480" y2="220" stroke="#e5e7eb" stroke-width="1" />
          <line x1="580" y1="20" x2="580" y2="220" stroke="#e5e7eb" stroke-width="1" />
          <line x1="680" y1="20" x2="680" y2="220" stroke="#e5e7eb" stroke-width="1" />

          <g font-family="Times New Roman" font-size="14" fill="#000000">
            <text x="270" y="45" text-anchor="end">Yaqin qarindoshlari</text>
            <text x="270" y="60" text-anchor="end">mavjudligi</text>
            <rect x="280" y="35" width="${Math.max((currentData.relatives/maxVal)*400, 5)}" height="30" fill="#4472C4" />
            <text x="${280 + Math.max((currentData.relatives/maxVal)*400, 5) + 10}" y="55" fill="#000" font-weight="bold">${currentData.relatives}</text>

            <text x="270" y="95" text-anchor="end">Bo'ysunuv munosabatlari</text>
            <rect x="280" y="85" width="${Math.max((currentData.subordination/maxVal)*400, 5)}" height="30" fill="#4472C4" />
            <text x="${280 + Math.max((currentData.subordination/maxVal)*400, 5) + 10}" y="105" fill="#000" font-weight="bold">${currentData.subordination}</text>

            <text x="270" y="145" text-anchor="end">Yuridik shaxslarda ulushga</text>
            <text x="270" y="160" text-anchor="end">egaligi</text>
            <rect x="280" y="135" width="${Math.max((currentData.shares/maxVal)*400, 5)}" height="30" fill="#4472C4" />
            <text x="${280 + Math.max((currentData.shares/maxVal)*400, 5) + 10}" y="155" fill="#000" font-weight="bold">${currentData.shares}</text>

            <text x="270" y="195" text-anchor="end">Tadbirkorlik subyektlarida</text>
            <text x="270" y="210" text-anchor="end">ishtirok etishi</text>
            <rect x="280" y="185" width="${Math.max((currentData.relativeShares/maxVal)*400, 5)}" height="30" fill="#4472C4" />
            <text x="${280 + Math.max((currentData.relativeShares/maxVal)*400, 5) + 10}" y="205" fill="#000" font-weight="bold">${currentData.relativeShares}</text>
          </g>
        </svg>
      `;

      const pieImgData = await svgToPngBase64(pieSvg, 600, 280);
      const barImgData = await svgToPngBase64(barSvg, 700, 250);

      const pieUint8 = base64ToUint8Array(pieImgData);
      const barUint8 = base64ToUint8Array(barImgData);

      const p = (text: string, bold = false, align: any = "both", indent = 708) => new Paragraph({
        alignment: align,
        spacing: { line: 360, before: 60, after: 60 },
        indent: { firstLine: indent },
        children: [new TextRun({ text, bold, font: "Times New Roman", size: 26 })]
      });

      const bullet = (text: string) => new Paragraph({
        alignment: "both",
        spacing: { line: 360 },
        indent: { left: 708, hanging: 354 },
        children: [new TextRun({ text: "· " + text, font: "Times New Roman", size: 26 })]
      });

      const tblBorder = { style: "single" as any, size: 1, color: "000000" };
      const noBorder = { style: "none" as any, size: 0, color: "FFFFFF" };

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            p(`“O'zmilliybank” AJda 2026 yilning ${period} yakunlari bo'yicha`, true, "center", 0),
            p(`manfaatlar to'qnashuvini boshqarish holati hamda ushbu yo'nalishda`, true, "center", 0),
            p(`amalga oshirilgan ishlar natijalari to'g'risida`, true, "center", 0),
            p(`HISOBOT`, true, "center", 0),
            
            new Paragraph({ spacing: { before: 200 } }),

            p(`I. Umumiy ma'lumot`, true, "center", 0),
            p(`Hisobot davrida “O'zmilliybank” AJda manfaatlar to'qnashuvini aniqlash, oldini olish va tartibga solish sohasidagi ishlar O'zbekiston Respublikasining “Manfaatlar to'qnashuvi to'g'risida”gi Qonuni, korrupsiyaga qarshi kurashish sohasidagi boshqa normativ-huquqiy hujjatlar hamda Bankning ichki qoidalari talablariga muvofiq tizimli ravishda amalga oshirildi.`),
            p(`Asosiy e'tibor manfaatlar to'qnashuvini keltirib chiqarishi mumkin bo'lgan xavf va omillarni barvaqt aniqlash, ularning oldini olish va bartaraf etish, manfaatlar to'qnashuvini deklaratsiyalash tizimini takomillashtirish, xodimlar tomonidan qonunchilik hamda ichki normativ hujjatlar talablariga rioya etish madaniyatini yuksaltirish, shuningdek mazkur yo'nalishdagi ichki nazorat mexanizmlarining samaradorligini oshirishga qaratildi.`),

            p(`II. Normativ-huquqiy bazani takomillashtirish`, true, "center", 0),
            p(`“Manfaatlar to'qnashuvi to'g'risida”gi Qonun talablarini Bank faoliyatiga to'liq implementatsiya qilish maqsadida Bankning manfaatlar to'qnashuvini boshqarish va korrupsiyaga qarshi kurashish sohasidagi ichki normativ hujjatlari kompleks ravishda qayta ko'rib chiqildi hamda qonunchilik talablariga muvofiqlashtirildi.`),
            p(`Jumladan:`),
            p(`- “Manfaatlar to'qnashuvi bilan bog'liq munosabatlarni tartibga solish siyosati” (2026 yil 30 iyun, 163v/35-son);`, false, "both", 0),
            p(`- “Korrupsiyaga qarshi kurashish siyosati” (2026 yil 30 iyun, 162v/35-son) yangi tahrirda tasdiqlandi.`, false, "both", 0),
            p(`Mazkur chora-tadbirlar natijasida Bankda manfaatlar to'qnashuvini aniqlash, oldini olish, oshkor etish va tartibga solishga qaratilgan yagona huquqiy va tashkiliy mexanizm shakllantirilib, uning amaliyotda samarali qo'llanilishi ta'minlandi.`),

            p(`III. Deklaratsiyalash natijalari va xavflar tahlili`, true, "center", 0),
            p(`Hisobot davrida manfaatlar to'qnashuvi to'g'risidagi deklaratsiyalarni to'ldirish bo'yicha keng ko'lamli ishlar amalga oshirildi, jumladan:`),
            
            new Table({
              width: { size: 100, type: "pct" as any },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Ko'rsatkich", bold: true, font: "Times New Roman", size: 26 })], alignment: "center" as any })] }),
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Soni", bold: true, font: "Times New Roman", size: 26 })], alignment: "center" as any })] }),
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Jami shtat birliklari", font: "Times New Roman", size: 26 })] })] }),
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: currentData.total.toString(), font: "Times New Roman", size: 26 })], alignment: "center" as any })] }),
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Deklaratsiya topshirgan xodimlar", font: "Times New Roman", size: 26 })] })] }),
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: currentData.submitted.toString(), font: "Times New Roman", size: 26 })], alignment: "center" as any })] }),
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Bola parvarishi ta'tili, o'qish va boshqa uzrli sabablarga ko'ra topshirmaganlar", font: "Times New Roman", size: 26 })] })] }),
                    new TableCell({ borders: { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: currentData.excused.toString(), font: "Times New Roman", size: 26 })], alignment: "center" as any })] }),
                  ]
                })
              ]
            }),

            new Paragraph({ spacing: { before: 300 } }),

            // PIE CHART RASMI (TS XATOLIGI BO'LMASLIGI UCHUN AS ANY)
            new Paragraph({
              alignment: "center" as any,
              children: [new ImageRun({ data: pieUint8, type: "png", transformation: { width: 450, height: 210 } } as any)]
            }),

            new Paragraph({ spacing: { before: 300 } }),

            p(`Manfaatlar to'qnashuvi to'g'risidagi deklaratsiyalar tahlili natijalariga ko'ra quyidagi holatlar aniqlandi:`, false, "both", 708),

            new Paragraph({ spacing: { before: 200 } }),

            // BAR CHART RASMI (TS XATOLIGI BO'LMASLIGI UCHUN AS ANY)
            new Paragraph({
              alignment: "center" as any,
              children: [new ImageRun({ data: barUint8, type: "png", transformation: { width: 550, height: 196 } } as any)]
            }),

            new Paragraph({ spacing: { before: 200 } }),

            bullet(`${currentData.relatives} nafar xodimning Bank tizimida mehnat faoliyatini amalga oshirayotgan yaqin qarindoshlari mavjudligi;`),
            bullet(`mazkur holatlarni o'rganish natijasida ${currentData.subordination} ta holatda xodimlar o'rtasida bevosita bo'ysunuv munosabatlari mavjudligi aniqlanib, ular mavjud manfaatlar to'qnashuvi sifatida baholandi hamda Odob-axloq komissiyasining qarori asosida belgilangan tartibda bartaraf etildi;`),
            bullet(`${currentData.shares} nafar xodimning yuridik shaxslar ustav fondida ulush yoki aksiyalarga egaligi yoxud ularning boshqaruv organlari tarkibida ishtirok etishi mavjudligi;`),
            bullet(`${currentData.relativeShares} nafar xodimning yaqin qarindoshlari tadbirkorlik subyektlarining ustav kapitalida ishtirok etishi yoki ularning boshqaruv organlari tarkibiga kirishi aniqlandi.`),

            new Paragraph({ spacing: { before: 200 } }),

            p(`IV. Profilaktik chora-tadbirlar`, true, "center", 0),
            p(`Hisobot davrida manfaatlar to'qnashuvining oldini olish va uning yuzaga kelish ehtimolini kamaytirishga qaratilgan quyidagi profilaktik chora-tadbirlar amalga oshirildi:`),
            bullet(`ishga qabul qilinayotgan nomzodlar tomonidan manfaatlar to'qnashuvi to'g'risidagi deklaratsiyalarni to'ldirish va ularda keltirilgan ma'lumotlarni belgilangan tartibda ko'rib chiqish;`),
            bullet(`xodimlarni lavozimga tayinlash, boshqa lavozimga o'tkazish hamda rotatsiya qilish jarayonlarida manfaatlar to'qnashuvi mavjudligi yoki yuzaga kelishi ehtimolini baholash;`),
            bullet(`Bankning barcha xodimlarini korrupsiyaga qarshi kurashish va manfaatlar to'qnashuvini boshqarish sohasidagi ichki normativ hujjatlar mazmun-mohiyati bilan tanishtirish hamda ular tomonidan mazkur talablarga rioya etilishini ta'minlash.`),

            p(`V. O'quv va monitoring ishlari`, true, "center", 0),
            p(`Hisobot davrida Korrupsiyani oldini olish boshqarmasi tomonidan manfaatlar to'qnashuvining oldini olish hamda korrupsiyaga qarshi kurashish sohasida xodimlarning huquqiy ongi va huquqiy madaniyatini yuksaltirishga qaratilgan keng qamrovli tushuntirish va profilaktik tadbirlar amalga oshirildi.`),
            p(`Xususan, SAP ta'lim platformasi orqali: “Korrupsiyaga qarshi kurashish davlat siyosati”; “Manfaatlar to'qnashuvi to'g'risida”gi Qonun; “Korrupsiya uchun javobgarlik” mavzulari bo'yicha masofaviy o'quv mashg'ulotlari tashkil etildi hamda ularga jami 4 630 nafar xodim jalb qilindi.`),

            p(`VI. Aniqlangan qoidabuzarliklar va ularga nisbatan qo'llanilgan choralar`, true, "center", 0),
            p(`Hisobot davrida manfaatlar to'qnashuvi bilan bog'liq 3 ta holat aniqlanib, ularning har biri yuzasidan belgilangan tartibda xizmat tekshiruvlari o'tkazildi. O'tkazilgan tekshiruvlar natijasida qoidabuzarliklar yuzasidan Odob-axloq komissiyasining qarorlariga asosan tegishli intizomiy jazo va boshqa ta'sir choralari qo'llanildi.`),

            p(`VII. Tahliliy xulosa`, true, "center", 0),
            p(`Hisobot davrida amalga oshirilgan ishlar natijalari Bankda manfaatlar to'qnashuvini boshqarish tizimi izchil takomillashtirilayotganini ko'rsatdi. Deklaratsiyalash tizimining joriy etilishi manfaatlar to'qnashuvini barvaqt aniqlash, baholash va oldini olish imkoniyatlarini kengaytirdi.`),
            p(`Kelgusida deklaratsiyalash jarayonlarini raqamlashtirish, avtomatlashtirilgan monitoring va nazorat tizimlarini joriy etish hamda korrupsiyaviy xavflarni erta aniqlash mexanizmlarini takomillashtirish ustuvor vazifalardan biri hisoblanadi.`),

            new Paragraph({ spacing: { before: 800 } }),

            // Imzo qismi
            new Table({
              width: { size: 100, type: "pct" as any },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ children: [new TextRun({ text: "Korrupsiyani oldini olish boshqarmasi", bold: true, font: "Times New Roman", size: 26 })] }), new Paragraph({ children: [new TextRun({ text: "Boshqarma boshlig'i v.b.", bold: true, font: "Times New Roman", size: 26 })] })] }),
                    new TableCell({ borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ children: [new TextRun({ text: "X. Usmanov", bold: true, font: "Times New Roman", size: 26 })], alignment: "right" as any })], verticalAlign: "bottom" as any }),
                  ]
                })
              ]
            })
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `BKR_Hisobot_${period.replace(/\s+/g, '_')}.docx`);

    } catch (error) {
      console.error("Xatolik:", error);
      alert("Hisobotni yuklashda xatolik yuz berdi. Kutubxonalar o'rnatilganiga ishonch hosil qiling.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A2540] text-slate-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-20 flex items-center px-6 bg-[#071d33] border-b border-slate-700/50">
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-y-auto">
        <header className="min-h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <FileBarChart className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Tahliliy Hisobotlar</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="text-right">
              <p className="font-bold text-slate-900">Rustamov Otabek</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">BKR Bosh mutaxassis</p>
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
              <div className="flex-1 sm:w-64">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hisobot davrini tanlang</label>
                <select 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full text-slate-800 font-bold bg-transparent outline-none border-b-2 border-slate-200 pb-1 focus:border-blue-600 cursor-pointer transition-colors"
                >
                  <option value="I yarim yillik">I yarim yillik (2026)</option>
                  <option value="II yarim yillik">II yarim yillik (2026)</option>
                  <option value="Yillik">Yillik (2026)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={downloadReport}
              disabled={isDownloading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Hujjat tayyorlanmoqda...' : <><Download className="w-5 h-5" /> Word formatida yuklash</>}
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
                    <span className="text-sm font-semibold text-red-900">Uzrli sabab (Dekret/Ta'til)</span>
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