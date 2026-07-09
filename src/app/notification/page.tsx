'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, User, Users, Building, AlertTriangle, 
  CheckCircle, Plus, Trash2, ShieldCheck, ChevronLeft, Send
} from 'lucide-react';

export default function NotificationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // === IMZO (SIGNATURE) UCHUN STATE VA REF ===
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Xabarnoma Form State
  const [formData, setFormData] = useState({
    header: {
      department: '',
      managerInfo: '',
      employeeInfo: ''
    },
    personal: { passport: '', passportDate: '', pinfl: '' },
    relatives: [{ 
      relationship: '', 
      fullName: '', 
      passport: '', 
      passportDate: '',
      pinfl: '', 
      noInfo: false,
      worksAtNBU: false,
      nbuBranch: '',
      nbuPosition: ''
    }],
    myCompanies: [{ companyName: '', stir: '', isLeader: '', roleInCompany: '', sharePercent: '', noDetails: false }],
    relativeCompanies: [{ relativeName: '', companyName: '', stir: '', isLeader: '', roleInCompany: '', sharePercent: '', noDetails: false }],
    conflictInfo: ''
  });

  const steps = [
    { id: 1, name: "Shaxsiy ma'lumotlar", icon: User },
    { id: 2, name: 'Aloqador shaxslar', icon: Users },
    { id: 3, name: 'Yuridik shaxslar', icon: Building },
    { id: 4, name: 'Xabarnoma matni', icon: AlertTriangle },
  ];

  const relationshipOptions = [
    "Otasi", "Onasi", "Turmush o'rtog'i", "Akasi", "Ukasi", 
    "Opasi", "Singlisi", "O'g'li", "Qizi", "Bobosi", "Buvisi"
  ];

  const passportRegex = /^[a-zA-Z]{2}\d{7}$/;
  const pinflRegex = /^\d{14}$/;
  const stirRegex = /^\d{9}$/;

  // === IMZO FUNKSIYALARI ===
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0A2540'; // To'q ko'k ruchka
      }
    }
  }, [currentStep]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if (e.type.includes('touch')) {
      const touch = (e as React.TouchEvent).touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      const mouse = e as React.MouseEvent;
      return {
        x: mouse.clientX - rect.left,
        y: mouse.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSignature(true);
    const { x, y } = getCoordinates(e);
    const ctx = signatureCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = signatureCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = signatureCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };
  // ==========================

  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (formData.header.department.trim().length < 3) newErrors.push("Tuzilmaviy bo'linma nomini kiriting");
      if (formData.header.managerInfo.trim().length < 5) newErrors.push("Rahbarning lavozimi va F.I.O. kiriting");
      if (formData.header.employeeInfo.trim().length < 5) newErrors.push("O'zingizning lavozimingiz va F.I.O. ni kiriting");
      if (!passportRegex.test(formData.personal.passport)) newErrors.push("Pasport formati noto'g'ri (Masalan: AA1234567)");
      if (!formData.personal.passportDate) newErrors.push("Pasport berilgan sanasini tanlang");
      if (formData.personal.pinfl && !pinflRegex.test(formData.personal.pinfl)) newErrors.push("JSHSHIR 14 ta raqam bo'lishi shart");
    } 
    else if (currentStep === 2) {
      formData.relatives.forEach((rel, index) => {
        if (!rel.relationship) newErrors.push(`${index + 1}-qator: Qarindoshlik darajasini tanlang`);
        
        if (!rel.noInfo) {
          if (rel.fullName.trim().length < 5) newErrors.push(`${index + 1}-qarindoshning F.I.O chala kiritilgan`);
          if (rel.passport && !passportRegex.test(rel.passport)) newErrors.push(`${index + 1}-qarindoshning pasporti xato`);
          if (rel.passport && !rel.passportDate) newErrors.push(`${index + 1}-qarindoshning pasport sanasi tanlanmagan`);
          if (rel.pinfl && !pinflRegex.test(rel.pinfl)) newErrors.push(`${index + 1}-qarindoshning JSHSHIR xato`);
        }

        if (rel.worksAtNBU) {
          if (rel.nbuBranch.trim().length < 3) newErrors.push(`${index + 1}-qarindosh uchun NBU filiali/BXM kiritilmagan`);
          if (rel.nbuPosition.trim().length < 3) newErrors.push(`${index + 1}-qarindosh uchun NBU lavozimi kiritilmagan`);
        }
      });
    }
    else if (currentStep === 3) {
      formData.myCompanies.forEach((comp, idx) => {
        if (!comp.noDetails && comp.companyName && !stirRegex.test(comp.stir)) newErrors.push(`O'zingizga tegishli ${idx + 1}-kompaniya STIRi xato`);
      });
      formData.relativeCompanies.forEach((comp, idx) => {
        if (!comp.noDetails && comp.companyName && !comp.relativeName) newErrors.push(`Qarindoshga tegishli ${idx + 1}-kompaniyada qarindosh tanlanmagan`);
        if (!comp.noDetails && comp.companyName && !stirRegex.test(comp.stir)) newErrors.push(`Qarindoshga tegishli ${idx + 1}-kompaniya STIRi xato`);
      });
    }
    else if (currentStep === 4) {
      if (formData.conflictInfo.trim().length < 10) newErrors.push("Mavjud manfaatlar to'qnashuvi haqida batafsil ma'lumot kiriting!");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep() && hasSignature) {
      setIsLoading(true);
      // Imzoni rasm sifatida (Base64) olish
      const signatureImage = signatureCanvasRef.current?.toDataURL('image/png');

      setTimeout(() => {
        console.log("Xabarnoma yuborildi: ", { ...formData, signature: signatureImage });
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 1500);
    }
  };

  const addRelative = () => setFormData({ 
    ...formData, relatives: [...formData.relatives, { relationship: '', fullName: '', passport: '', passportDate: '', pinfl: '', noInfo: false, worksAtNBU: false, nbuBranch: '', nbuPosition: '' }] 
  });
  const removeRelative = (index: number) => setFormData({ 
    ...formData, relatives: formData.relatives.filter((_, i) => i !== index) 
  });
  const addCompany = (type: 'myCompanies' | 'relativeCompanies') => {
    if (type === 'myCompanies') {
      setFormData({ ...formData, myCompanies: [...formData.myCompanies, { companyName: '', stir: '', isLeader: '', roleInCompany: '', sharePercent: '', noDetails: false }] });
    } else {
      setFormData({ ...formData, relativeCompanies: [...formData.relativeCompanies, { relativeName: '', companyName: '', stir: '', isLeader: '', roleInCompany: '', sharePercent: '', noDetails: false }] });
    }
  };
  const removeCompany = (type: 'myCompanies' | 'relativeCompanies', index: number) => {
    setFormData({ ...formData, [type]: formData[type].filter((_, i) => i !== index) });
  };

  // FOOTNOTE
  const renderFootnote = () => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <p className="text-[11px] text-slate-500 text-justify leading-relaxed">
        *Xodim unga aloqador shaxslarning (xodimning yaqin qarindoshlari yoki xodimning yaqin qarindoshlari ustav fondi (ustav kapitali) aksiyalariga yoki ulushlariga egalik qiladigan yoxud boshqaruv organi rahbari yoki a'zosi bo'lgan yuridik shaxs) identifikatsiya ID-kartasi (biometrik pasporti), JSHSHIR, STIR bo'yicha ma'lumotlarni olish imkoniyatiga ega bo'lmasa, u tomonidan tegishli pozitsiyalarda "ma'lumotga ega emasman" deb izoh ko'rsatilishi mumkin.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 relative font-sans">
      
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Muvaffaqiyatli!</h3>
            <p className="text-slate-500 mb-8">
              Sizning xabarnomangiz BKR departamentiga muvaffaqiyatli yuborildi.
            </p>
            <Link href="/dashboard" className="block w-full py-3 bg-[#0A2540] text-white rounded-xl font-medium hover:bg-[#113559] transition-colors">
              Asosiy panelga qaytish
            </Link>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-800">Mavjud manfaatlar to'qnashuvi xabarnomasi</h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <ShieldCheck className="w-4 h-4" /> BKR Nazoratida
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
              <AlertTriangle className="w-5 h-5" /> Iltimos, xatoliklarni to'g'rilang:
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 ml-5 space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 -z-0" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium mt-2 hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          
          {/* 1-QADAM: Shaxsiy ma'lumotlar & Xabarnoma Boshi */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Rasmiy Xabarnoma "Shapka" (Header) qismi */}
              <div className="flex justify-end mb-12">
                <div className="w-full sm:w-[400px] flex flex-col gap-2">
                  <p className="font-bold text-slate-800 text-right pr-4">"O'zmilliybank" AJ</p>
                  
                  <div className="flex flex-col items-end">
                    <input 
                      type="text" 
                      placeholder="tuzilmaviy bo'linma nomi" 
                      value={formData.header.department}
                      onChange={e => setFormData({...formData, header: {...formData.header, department: e.target.value}})}
                      className="w-full border-b-2 border-slate-400 bg-transparent px-2 py-1 outline-none focus:border-blue-600 text-slate-800 text-right font-medium"
                    />
                    <span className="text-xs text-slate-500 mt-1 mr-2">(tuzilmaviy bo'linma nomi)</span>
                  </div>

                  <div className="flex items-end mt-2">
                    <div className="flex-1 flex flex-col items-end">
                      <input 
                        type="text" 
                        placeholder="bevosita rahbarning lavozimi va F.I.O." 
                        value={formData.header.managerInfo}
                        onChange={e => setFormData({...formData, header: {...formData.header, managerInfo: e.target.value}})}
                        className="w-full border-b-2 border-slate-400 bg-transparent px-2 py-1 outline-none focus:border-blue-600 text-slate-800 text-right font-medium"
                      />
                      <span className="text-xs text-slate-500 mt-1 mr-2">(bevosita rahbarning lavozimi va F.I.O.)</span>
                    </div>
                    <span className="font-bold text-slate-800 ml-2 mb-6">ga</span>
                  </div>

                  <div className="flex items-end mt-2">
                    <div className="flex-1 flex flex-col items-end">
                      <input 
                        type="text" 
                        placeholder="xodimning lavozimi va F.I.O." 
                        value={formData.header.employeeInfo}
                        onChange={e => setFormData({...formData, header: {...formData.header, employeeInfo: e.target.value}})}
                        className="w-full border-b-2 border-slate-400 bg-transparent px-2 py-1 outline-none focus:border-blue-600 text-slate-800 text-right font-medium"
                      />
                      <span className="text-xs text-slate-500 mt-1 mr-2">(xodimning lavozimi va F.I.O.)</span>
                    </div>
                    <span className="font-bold text-slate-800 ml-2 mb-6">dan</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase tracking-wide leading-relaxed">
                  Mavjud manfaatlar to'qnashuvi to'g'risidagi<br/> XABARNOMA
                </h2>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 text-slate-800 leading-relaxed text-lg font-medium text-center">
                Men ushbu xabarnomada o'zim va menga aloqador shaxslarning <span className="font-bold text-blue-800">mavjud manfaatlar to'qnashuviga</span> oid quyidagi ma'lumotlar to'g'risida xabar beraman:
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">1. Xodimga oid ma'lumotlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Identifikatsiya ID-kartasi yoki biometrik pasport ma'lumotlari (seriyasi, raqami, berilgan sanasi)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={9}
                      placeholder="AA1234567" 
                      value={formData.personal.passport}
                      onChange={(e) => setFormData({...formData, personal: {...formData.personal, passport: e.target.value.toUpperCase()}})}
                      className="w-1/2 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white uppercase" 
                    />
                    <input 
                      type="date" 
                      value={formData.personal.passportDate}
                      onChange={(e) => setFormData({...formData, personal: {...formData.personal, passportDate: e.target.value}})}
                      className="w-1/2 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jismoniy shaxsning shaxsiy identifikatsiya raqami (JSHSHIR) (mavjud bo'lgan taqdirda)
                  </label>
                  <input 
                    type="text" 
                    maxLength={14} 
                    placeholder="12345678901234" 
                    value={formData.personal.pinfl}
                    onChange={(e) => setFormData({...formData, personal: {...formData.personal, pinfl: e.target.value.replace(/\D/g, '')}})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-white" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2-QADAM: Yaqin qarindoshlar */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">2. Aloqador shaxslarga oid ma'lumotlar*</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Xodimning yaqin qarindoshiga oid ma'lumotlar</p>
                </div>
                <button onClick={addRelative} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Qarindosh qo'shish
                </button>
              </div>

              <div className="space-y-6">
                {formData.relatives.map((relative, index) => (
                  <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 relative group transition-all">
                    {index > 0 && (
                      <button onClick={() => removeRelative(index)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Qarindoshlik</label>
                        <select 
                          value={relative.relationship}
                          onChange={(e) => {
                            const newRels = [...formData.relatives];
                            newRels[index].relationship = e.target.value;
                            setFormData({...formData, relatives: newRels});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                        >
                          <option value="" disabled>Tanlang...</option>
                          {relationshipOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Familiya, ismi, otasining ismi</label>
                        <input 
                          type="text" 
                          placeholder="To'liq ism sharifi" 
                          disabled={relative.noInfo}
                          value={relative.fullName}
                          onChange={(e) => {
                            const newRels = [...formData.relatives];
                            newRels[index].fullName = e.target.value;
                            setFormData({...formData, relatives: newRels});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 leading-snug">
                          Identifikatsiya ID-kartasi yoki biometrik pasport ma'lumotlari (seriyasi, raqami, berilgan sanasi)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            maxLength={9}
                            placeholder="Seriya va raqam" 
                            disabled={relative.noInfo}
                            value={relative.passport}
                            onChange={(e) => {
                              const newRels = [...formData.relatives];
                              newRels[index].passport = e.target.value.toUpperCase();
                              setFormData({...formData, relatives: newRels});
                            }}
                            className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900 uppercase disabled:bg-slate-100 disabled:text-slate-400" 
                          />
                          <input 
                            type="date" 
                            disabled={relative.noInfo}
                            value={relative.passportDate}
                            onChange={(e) => {
                              const newRels = [...formData.relatives];
                              newRels[index].passportDate = e.target.value;
                              setFormData({...formData, relatives: newRels});
                            }}
                            className="w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 leading-snug">
                          Jismoniy shaxsning shaxsiy identifikatsiya raqami (JSHSHIR) (mavjud bo'lgan taqdirda)
                        </label>
                        <input 
                          type="text" 
                          maxLength={14}
                          placeholder="14 ta raqam" 
                          disabled={relative.noInfo}
                          value={relative.pinfl}
                          onChange={(e) => {
                            const newRels = [...formData.relatives];
                            newRels[index].pinfl = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, relatives: newRels});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400" 
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`noInfo-${index}`} 
                        checked={relative.noInfo}
                        onChange={(e) => {
                          const newRels = [...formData.relatives];
                          newRels[index].noInfo = e.target.checked;
                          if(e.target.checked) {
                            newRels[index].passport = '';
                            newRels[index].passportDate = '';
                            newRels[index].pinfl = '';
                          }
                          setFormData({...formData, relatives: newRels});
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer" 
                      />
                      <label htmlFor={`noInfo-${index}`} className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                        "Ma'lumotga ega emasman" deb izoh ko'rsatish
                      </label>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <p className="text-sm font-bold text-slate-700 mb-3">Ushbu qarindoshingiz NBU tizimida ishlaydimi?</p>
                      <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`worksAtNBU-${index}`}
                            checked={relative.worksAtNBU === true}
                            onChange={() => {
                              const newRels = [...formData.relatives];
                              newRels[index].worksAtNBU = true;
                              setFormData({...formData, relatives: newRels});
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Ha, ishlaydi</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`worksAtNBU-${index}`}
                            checked={relative.worksAtNBU === false}
                            onChange={() => {
                              const newRels = [...formData.relatives];
                              newRels[index].worksAtNBU = false;
                              newRels[index].nbuBranch = '';
                              newRels[index].nbuPosition = '';
                              setFormData({...formData, relatives: newRels});
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yo'q, ishlamaydi</span>
                        </label>
                      </div>

                      {relative.worksAtNBU && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Qaysi filialda/BXM da?</label>
                            <input 
                              type="text"
                              placeholder="Filial yoki BXM nomini yozing..."
                              value={relative.nbuBranch}
                              onChange={(e) => {
                                const newRels = [...formData.relatives];
                                newRels[index].nbuBranch = e.target.value;
                                setFormData({...formData, relatives: newRels});
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Qaysi lavozimda?</label>
                            <input 
                              type="text"
                              placeholder="Lavozimini yozing..."
                              value={relative.nbuPosition}
                              onChange={(e) => {
                                const newRels = [...formData.relatives];
                                newRels[index].nbuPosition = e.target.value;
                                setFormData({...formData, relatives: newRels});
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {renderFootnote()}
            </div>
          )}

          {/* 3-QADAM: Yuridik shaxslar */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* O'zining kompaniyalari */}
              <div>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b pb-4">
                  <h2 className="text-sm font-bold text-slate-800 leading-relaxed md:w-3/4">
                    Xodim qaysi yuridik shaxsning ustav fondi (ustav kapitali) aksiyalariga yoki ulushlariga egalik qilsa yoxud unda boshqaruv organining rahbari yoki a'zosi bo'lsa, o'sha yuridik shaxsga oid ma'lumotlar
                  </h2>
                  <button onClick={() => addCompany('myCompanies')} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Qo'shish
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.myCompanies.map((comp, idx) => (
                    <div key={idx} className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 transition-all">
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Yuridik shaxsning nomi</label>
                          <input 
                            type="text" 
                            disabled={comp.noDetails}
                            placeholder="Kompaniya nomi"
                            value={comp.companyName}
                            onChange={e => {
                              const newComps = [...formData.myCompanies];
                              newComps[idx].companyName = e.target.value;
                              setFormData({...formData, myCompanies: newComps});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white disabled:bg-slate-100" 
                          />
                        </div>
                        <div className="w-full md:w-1/3">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Soliq to'lovchining identifikatsiya raqami (STIR)</label>
                          <input 
                            type="text" 
                            maxLength={9} 
                            disabled={comp.noDetails}
                            placeholder="9 ta raqam"
                            value={comp.stir}
                            onChange={e => {
                              const newComps = [...formData.myCompanies];
                              newComps[idx].stir = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, myCompanies: newComps});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white disabled:bg-slate-100" 
                          />
                        </div>
                        {idx > 0 && (
                           <button onClick={() => removeCompany('myCompanies', idx)} className="mb-0.5 p-2.5 text-red-500 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-200">
                             <Trash2 className="w-4 h-4"/>
                           </button>
                        )}
                      </div>

                      <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer w-max">
                          <input 
                            type="checkbox" 
                            checked={comp.noDetails} 
                            onChange={e => {
                              const newComps = [...formData.myCompanies];
                              newComps[idx].noDetails = e.target.checked;
                              if (e.target.checked) {
                                newComps[idx].companyName = '';
                                newComps[idx].stir = '';
                                newComps[idx].isLeader = '';
                                newComps[idx].roleInCompany = '';
                                newComps[idx].sharePercent = '';
                              }
                              setFormData({...formData, myCompanies: newComps});
                            }} 
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" 
                          />
                          <span className="text-sm font-medium text-slate-600">"Ma'lumotga ega emasman" deb izoh ko'rsatish</span>
                        </label>
                      </div>

                      {!comp.noDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 border-t border-slate-200 pt-4">
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-2">Boshqaruv organining rahbari yoki a'zosimisiz?</p>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`myComp-leader-${idx}`} 
                                  value="Ha" 
                                  checked={comp.isLeader === 'Ha'} 
                                  onChange={e => {
                                    const newComps = [...formData.myCompanies];
                                    newComps[idx].isLeader = e.target.value;
                                    setFormData({...formData, myCompanies: newComps});
                                  }} 
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-600" 
                                />
                                <span className="text-sm text-slate-700">Ha</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`myComp-leader-${idx}`} 
                                  value="Yo'q" 
                                  checked={comp.isLeader === "Yo'q"} 
                                  onChange={e => {
                                    const newComps = [...formData.myCompanies];
                                    newComps[idx].isLeader = e.target.value;
                                    if (e.target.value === "Yo'q") newComps[idx].roleInCompany = '';
                                    setFormData({...formData, myCompanies: newComps});
                                  }} 
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-600" 
                                />
                                <span className="text-sm text-slate-700">Yo'q</span>
                              </label>
                            </div>

                            {comp.isLeader === 'Ha' && (
                              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Lavozimingiz / Holatingiz?</label>
                                <select 
                                  value={comp.roleInCompany}
                                  onChange={e => {
                                    const newComps = [...formData.myCompanies];
                                    newComps[idx].roleInCompany = e.target.value;
                                    setFormData({...formData, myCompanies: newComps});
                                  }}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                                >
                                  <option value="" disabled>Tanlang...</option>
                                  <option value="Ta'sischi">Ta'sischi</option>
                                  <option value="Rahbar">Rahbar</option>
                                  <option value="Boshqa">Boshqa</option>
                                </select>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-1">Aksiyalariga yoki ulushlariga egalik qilasizmi (foizda)?</p>
                            <div className="relative w-32">
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                placeholder="0" 
                                value={comp.sharePercent} 
                                onChange={e => {
                                  const newComps = [...formData.myCompanies];
                                  newComps[idx].sharePercent = e.target.value;
                                  setFormData({...formData, myCompanies: newComps});
                                }} 
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 pr-8 bg-white text-slate-900" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Qarindoshning kompaniyalari */}
              <div>
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b pb-4">
                  <h2 className="text-sm font-bold text-slate-800 leading-relaxed md:w-3/4">
                    Xodimning yaqin qarindoshi qaysi yuridik shaxsning ustav fondi (ustav kapitali) aksiyalariga yoki ulushlariga egalik qilsa yoxud unda boshqaruv organining rahbari yoki a'zosi bo'lsa, o'sha yuridik shaxsga oid ma'lumotlar
                  </h2>
                  <button onClick={() => addCompany('relativeCompanies')} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Qo'shish
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.relativeCompanies.map((comp, idx) => (
                    <div key={idx} className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200 transition-all">
                      
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Qaysi qarindoshingiz?</label>
                          <select 
                            value={comp.relativeName}
                            disabled={comp.noDetails}
                            onChange={(e) => {
                              const newComps = [...formData.relativeCompanies];
                              newComps[idx].relativeName = e.target.value;
                              setFormData({...formData, relativeCompanies: newComps});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white disabled:bg-slate-100 text-slate-900" 
                          >
                            <option value="" disabled>Ro'yxatdan tanlang...</option>
                            {formData.relatives.filter(r => r.fullName).map((rel, rIdx) => (
                              <option key={rIdx} value={rel.fullName}>{rel.fullName} ({rel.relationship})</option>
                            ))}
                            {formData.relatives.filter(r => r.fullName).length === 0 && (
                              <option value="" disabled>Avval 2-bosqichdan qarindosh qo'shing</option>
                            )}
                          </select>
                        </div>
                        <div className="w-full md:w-1/3">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Yuridik shaxsning nomi</label>
                          <input 
                            type="text" 
                            disabled={comp.noDetails}
                            placeholder="Kompaniya nomi"
                            value={comp.companyName}
                            onChange={e => {
                              const newComps = [...formData.relativeCompanies];
                              newComps[idx].companyName = e.target.value;
                              setFormData({...formData, relativeCompanies: newComps});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white disabled:bg-slate-100 text-slate-900" 
                          />
                        </div>
                        <div className="w-full md:w-1/4">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Soliq to'lovchining identifikatsiya raqami (STIR)</label>
                          <input 
                            type="text" 
                            maxLength={9} 
                            disabled={comp.noDetails}
                            placeholder="9 ta raqam"
                            value={comp.stir}
                            onChange={e => {
                              const newComps = [...formData.relativeCompanies];
                              newComps[idx].stir = e.target.value.replace(/\D/g, '');
                              setFormData({...formData, relativeCompanies: newComps});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white disabled:bg-slate-100 text-slate-900" 
                          />
                        </div>
                        {idx > 0 && (
                           <button onClick={() => removeCompany('relativeCompanies', idx)} className="mb-0.5 p-2.5 text-red-500 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-200">
                             <Trash2 className="w-4 h-4"/>
                           </button>
                        )}
                      </div>

                      <div className="mt-2">
                        <label className="flex items-center gap-2 cursor-pointer w-max">
                          <input 
                            type="checkbox" 
                            checked={comp.noDetails} 
                            onChange={e => {
                              const newComps = [...formData.relativeCompanies];
                              newComps[idx].noDetails = e.target.checked;
                              if (e.target.checked) {
                                newComps[idx].relativeName = '';
                                newComps[idx].companyName = '';
                                newComps[idx].stir = '';
                                newComps[idx].isLeader = '';
                                newComps[idx].roleInCompany = '';
                                newComps[idx].sharePercent = '';
                              }
                              setFormData({...formData, relativeCompanies: newComps});
                            }} 
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" 
                          />
                          <span className="text-sm font-medium text-slate-600">"Ma'lumotga ega emasman" deb izoh ko'rsatish</span>
                        </label>
                      </div>

                      {!comp.noDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 border-t border-slate-200 pt-4">
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-2">Qarindoshingiz tashkilotning rahbari yoki a'zosimi?</p>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`relComp-leader-${idx}`} 
                                  value="Ha" 
                                  checked={comp.isLeader === 'Ha'} 
                                  onChange={e => {
                                    const newComps = [...formData.relativeCompanies];
                                    newComps[idx].isLeader = e.target.value;
                                    setFormData({...formData, relativeCompanies: newComps});
                                  }} 
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-600" 
                                />
                                <span className="text-sm text-slate-700">Ha</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`relComp-leader-${idx}`} 
                                  value="Yo'q" 
                                  checked={comp.isLeader === "Yo'q"} 
                                  onChange={e => {
                                    const newComps = [...formData.relativeCompanies];
                                    newComps[idx].isLeader = e.target.value;
                                    if (e.target.value === "Yo'q") newComps[idx].roleInCompany = '';
                                    setFormData({...formData, relativeCompanies: newComps});
                                  }} 
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-600" 
                                />
                                <span className="text-sm text-slate-700">Yo'q</span>
                              </label>
                            </div>

                            {comp.isLeader === 'Ha' && (
                              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Qarindoshingiz roli qanday?</label>
                                <select 
                                  value={comp.roleInCompany}
                                  onChange={e => {
                                    const newComps = [...formData.relativeCompanies];
                                    newComps[idx].roleInCompany = e.target.value;
                                    setFormData({...formData, relativeCompanies: newComps});
                                  }}
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                                >
                                  <option value="" disabled>Tanlang...</option>
                                  <option value="Ta'sischi">Ta'sischi</option>
                                  <option value="Rahbar">Rahbar</option>
                                  <option value="Boshqa">Boshqa</option>
                                </select>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-600 mb-1">Aksiyalariga yoki ulushlariga egalik qiladimi (foizda)?</p>
                            <div className="relative w-32">
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                placeholder="0" 
                                value={comp.sharePercent} 
                                onChange={e => {
                                  const newComps = [...formData.relativeCompanies];
                                  newComps[idx].sharePercent = e.target.value;
                                  setFormData({...formData, relativeCompanies: newComps});
                                }} 
                                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 pr-8 bg-white text-slate-900" 
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {renderFootnote()}
            </div>
          )}

          {/* 4-QADAM: Tasdiqlash / Xabarnoma matni */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-4">3. Mavjud manfaatlar to'qnashuvi bo'yicha ma'lumot</h2>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mavjud manfaatlar to'qnashuvi to'g'risida ma'lumot:</label>
                <textarea 
                  rows={6} 
                  value={formData.conflictInfo}
                  onChange={(e) => setFormData({...formData, conflictInfo: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-slate-50 resize-none"
                  placeholder="Xabarnoma matnini batafsil yozing..."
                ></textarea>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  Ushbu xabarnomadagi barcha ma'lumotlarning to'g'riligini tasdiqlayman. Hujjat BKR departamentiga yuboriladi va elektron shaklda saqlanadi.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Harakat tugmalari */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <button 
            onClick={() => {setCurrentStep((prev) => Math.max(prev - 1, 1)); setErrors([]);}}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${currentStep === 1 ? 'invisible' : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}
          >
            <ArrowLeft className="w-5 h-5" /> Orqaga
          </button>

          {currentStep < 4 ? (
            <button 
              onClick={handleNext}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-[#0A2540] text-white hover:bg-[#113559] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Keyingisi <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto mt-6 sm:mt-0">
              
              {/* IMZO QO'YISH MAYDONI */}
              <div className="flex flex-col items-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Shu yerga imzo qo'ying</p>
                <div className="relative bg-white border-2 border-dashed border-blue-300 rounded-xl overflow-hidden shadow-inner group hover:border-blue-400 transition-colors">
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <span className="font-serif italic text-2xl text-slate-400 select-none">Imzo...</span>
                    </div>
                  )}
                  <canvas
                    ref={signatureCanvasRef}
                    width={280}
                    height={90}
                    className="touch-none cursor-crosshair block bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                {hasSignature && (
                  <button onClick={clearSignature} className="text-xs font-bold text-red-500 hover:text-red-700 mt-2 transition-colors">
                    Qaytadan qo'yish
                  </button>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isLoading || !hasSignature}
                className="px-8 py-4 w-full md:w-auto rounded-xl font-bold flex justify-center items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5"
              >
                {isLoading ? 'Yuborilmoqda...' : <><Send className="w-5 h-5" /> Xabarnomani Imzolash</>}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}