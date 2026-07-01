'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, User, Users, Building, AlertTriangle, 
  CheckCircle, Plus, Trash2, ShieldCheck, ChevronLeft, Send
} from 'lucide-react';

export default function NotificationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Xabarnoma Form State
  const [formData, setFormData] = useState({
    personal: { fullName: '', passport: '', pinfl: '' },
    relatives: [{ 
      relationship: '', 
      fullName: '', 
      passport: '', 
      pinfl: '', 
      noInfo: false,
      worksAtNBU: false,
      nbuBranch: '',
      nbuPosition: ''
    }],
    myCompanies: [{ companyName: '', stir: '' }],
    relativeCompanies: [{ companyName: '', stir: '' }],
    conflictInfo: ''
  });

  const steps = [
    { id: 1, name: "Shaxsiy ma'lumotlar", icon: User },
    { id: 2, name: 'Aloqador shaxslar', icon: Users },
    { id: 3, name: 'Yuridik shaxslar', icon: Building },
    { id: 4, name: 'Xabarnoma matni', icon: AlertTriangle },
  ];

  // Qarindoshlik darajalari ro'yxati
  const relationshipOptions = [
    "Otasi", "Onasi", "Turmush o'rtog'i", "Akasi", "Ukasi", 
    "Opasi", "Singlisi", "O'g'li", "Qizi", "Bobosi", "Buvisi"
  ];

  // NBU filiallari (MVP uchun namunaviy)
  const nbuBranches = [
    "Bosh ofis", "Andijon viloyati bosh amaliyot filiali", "Buxoro viloyati filiali",
    "Farg'ona viloyati filiali", "Namangan viloyati filiali", "Toshkent shahar Bosh filiali"
  ];

  // NBU lavozimlari (MVP uchun namunaviy)
  const nbuPositions = [
    "Boshqaruvchi", "O'rinbosar", "Bo'lim boshlig'i", "Bosh mutaxassis",
    "Yetakchi mutaxassis", "Kredit mutaxassisi", "Kassir", "Buxgalter"
  ];

  // Regex naqshlari
  const passportRegex = /^[A-Z]{2}\d{7}$/;
  const pinflRegex = /^\d{14}$/;
  const stirRegex = /^\d{9}$/;

  // Validatsiya funksiyasi
  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (currentStep === 1) {
      if (formData.personal.fullName.trim().length < 5) newErrors.push("F.I.Sh ni to'liq kiriting");
      if (!formData.personal.passport || !passportRegex.test(formData.personal.passport)) newErrors.push("Pasport formati noto'g'ri (Masalan: AA1234567)");
      if (!formData.personal.pinfl || !pinflRegex.test(formData.personal.pinfl)) newErrors.push("JSHSHIR 14 ta raqamdan iborat bo'lishi shart");
    } 
    else if (currentStep === 2) {
      formData.relatives.forEach((rel, index) => {
        if (!rel.relationship) newErrors.push(`${index + 1}-qator: Qarindoshlik darajasini tanlang`);
        
        if (!rel.noInfo) {
          if (rel.fullName.trim().length < 5) newErrors.push(`${index + 1}-qarindoshning F.I.Sh chala kiritilgan`);
          if (!rel.passport || !passportRegex.test(rel.passport)) newErrors.push(`${index + 1}-qarindoshning pasporti xato`);
          if (!rel.pinfl || !pinflRegex.test(rel.pinfl)) newErrors.push(`${index + 1}-qarindoshning JSHSHIR xato`);
        }

        if (rel.worksAtNBU) {
          if (!rel.nbuBranch) newErrors.push(`${index + 1}-qarindosh uchun NBU filiali tanlanmagan`);
          if (!rel.nbuPosition) newErrors.push(`${index + 1}-qarindosh uchun NBU lavozimi tanlanmagan`);
        }
      });
    }
    else if (currentStep === 3) {
      formData.myCompanies.forEach((comp, idx) => {
        if (comp.companyName && (!comp.stir || !stirRegex.test(comp.stir))) newErrors.push(`O'zingizga tegishli ${idx + 1}-kompaniya STIRi 9 xonali bo'lishi shart`);
      });
      formData.relativeCompanies.forEach((comp, idx) => {
        if (comp.companyName && (!comp.stir || !stirRegex.test(comp.stir))) newErrors.push(`Qarindoshga tegishli ${idx + 1}-kompaniya STIRi 9 xonali bo'lishi shart`);
      });
    }
    else if (currentStep === 4) {
      if (formData.conflictInfo.trim().length < 10) newErrors.push("Mavjud manfaatlar to'qnashuvi haqida batafsilroq yozing");
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
    if (validateStep()) {
      console.log("Xabarnoma yuborilmoqda: ", formData);
      setShowSuccessModal(true);
    }
  };

  // Dinamik yordamchi funksiyalar
  const addRelative = () => setFormData({ 
    ...formData, 
    relatives: [...formData.relatives, { relationship: '', fullName: '', passport: '', pinfl: '', noInfo: false, worksAtNBU: false, nbuBranch: '', nbuPosition: '' }] 
  });
  
  const removeRelative = (index: number) => setFormData({ 
    ...formData, 
    relatives: formData.relatives.filter((_, i) => i !== index) 
  });
  
  const addCompany = (type: 'myCompanies' | 'relativeCompanies') => {
    setFormData({ ...formData, [type]: [...formData[type], { companyName: '', stir: '' }] });
  };

  const removeCompany = (type: 'myCompanies' | 'relativeCompanies', index: number) => {
    setFormData({ ...formData, [type]: formData[type].filter((_, i) => i !== index) });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 relative">
      
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Xabarnoma yuborildi!</h3>
            <p className="text-slate-500 mb-8">
              Mavjud manfaatlar to'qnashuvi haqidagi xabarnomangiz rahbariyat va BKR bo'limiga yuborildi.
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
          
          {/* 1-QADAM: Shaxsiy ma'lumotlar */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">1. Ходимга оид маълумотлар</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">F.I.Sh (To'liq)</label>
                  <input 
                    type="text" 
                    placeholder="Familiya Ism Sharif" 
                    value={formData.personal.fullName}
                    onChange={(e) => setFormData({...formData, personal: {...formData.personal, fullName: e.target.value}})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ID-karta yoki Pasport</label>
                  <input 
                    type="text" 
                    maxLength={9}
                    placeholder="AA1234567" 
                    value={formData.personal.passport}
                    onChange={(e) => setFormData({...formData, personal: {...formData.personal, passport: e.target.value.toUpperCase()}})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-slate-50 uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">JSHSHIR (14 ta raqam)</label>
                  <input 
                    type="text" 
                    maxLength={14} 
                    placeholder="12345678901234" 
                    value={formData.personal.pinfl}
                    onChange={(e) => setFormData({...formData, personal: {...formData.personal, pinfl: e.target.value.replace(/\D/g, '')}})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-slate-50" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2-QADAM: Yaqin qarindoshlar */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800">2. Алоқадор шахсга оид маълумотлар (Яқин қариндошлар)</h2>
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
                      {/* Qarindoshlik darajasi */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Qarindoshlik</label>
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

                      {/* F.I.Sh */}
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">F.I.Sh (To'liq)</label>
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
                      {/* Pasport */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Pasport / ID</label>
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
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900 uppercase disabled:bg-slate-100 disabled:text-slate-400" 
                        />
                      </div>

                      {/* JSHSHIR */}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">JSHSHIR</label>
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

                    {/* Checkbox */}
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
                            newRels[index].pinfl = '';
                          }
                          setFormData({...formData, relatives: newRels});
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer" 
                      />
                      <label htmlFor={`noInfo-${index}`} className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                        Ma'lumotlarni (Pasport va JSHSHIR) olish imkoniyatiga ega emasman
                      </label>
                    </div>

                    {/* NBU da ishlaydimi Qismi */}
                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 mb-3">Sizning bu qarindoshingiz NBU ning biror filialida ishlaydimi?</p>
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

                      {/* Filial va Lavozim Selectlari */}
                      {relative.worksAtNBU && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Qaysi filialda ishlaydi?</label>
                            <select 
                              value={relative.nbuBranch}
                              onChange={(e) => {
                                const newRels = [...formData.relatives];
                                newRels[index].nbuBranch = e.target.value;
                                setFormData({...formData, relatives: newRels});
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                            >
                              <option value="" disabled>Filialni tanlang...</option>
                              {nbuBranches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Qaysi lavozimda?</label>
                            <select 
                              value={relative.nbuPosition}
                              onChange={(e) => {
                                const newRels = [...formData.relatives];
                                newRels[index].nbuPosition = e.target.value;
                                setFormData({...formData, relatives: newRels});
                              }}
                              className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900"
                            >
                              <option value="" disabled>Lavozimni tanlang...</option>
                              {nbuPositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-QADAM: Yuridik shaxslar */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              
              {/* O'zining kompaniyalari */}
              <div>
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-lg font-bold text-slate-800">Sizga aloqador yuridik shaxslar</h2>
                  <button onClick={() => addCompany('myCompanies')} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Qo'shish
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.myCompanies.map((comp, idx) => (
                    <div key={idx} className="flex gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-200 transition-all">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Yuridik shaxs nomi</label>
                        <input 
                          type="text" 
                          placeholder="Kompaniya nomi"
                          value={comp.companyName}
                          onChange={(e) => {
                            const newComps = [...formData.myCompanies];
                            newComps[idx].companyName = e.target.value;
                            setFormData({...formData, myCompanies: newComps});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900" 
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">STIR (INN)</label>
                        <input 
                          type="text" 
                          maxLength={9} 
                          placeholder="9 ta raqam"
                          value={comp.stir}
                          onChange={(e) => {
                            const newComps = [...formData.myCompanies];
                            newComps[idx].stir = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, myCompanies: newComps});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900" 
                        />
                      </div>
                      {idx > 0 && (
                         <button onClick={() => removeCompany('myCompanies', idx)} className="mb-0.5 p-2.5 text-red-500 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-200">
                           <Trash2 className="w-4 h-4"/>
                         </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Qarindoshning kompaniyalari */}
              <div>
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-lg font-bold text-slate-800">Qarindoshingizga aloqador yuridik shaxslar</h2>
                  <button onClick={() => addCompany('relativeCompanies')} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Qo'shish
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.relativeCompanies.map((comp, idx) => (
                    <div key={idx} className="flex gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-200 transition-all">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Yuridik shaxs nomi</label>
                        <input 
                          type="text" 
                          placeholder="Kompaniya nomi"
                          value={comp.companyName}
                          onChange={(e) => {
                            const newComps = [...formData.relativeCompanies];
                            newComps[idx].companyName = e.target.value;
                            setFormData({...formData, relativeCompanies: newComps});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900" 
                        />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">STIR (INN)</label>
                        <input 
                          type="text" 
                          maxLength={9} 
                          placeholder="9 ta raqam"
                          value={comp.stir}
                          onChange={(e) => {
                            const newComps = [...formData.relativeCompanies];
                            newComps[idx].stir = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, relativeCompanies: newComps});
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-600 bg-white text-slate-900" 
                        />
                      </div>
                      {idx > 0 && (
                         <button onClick={() => removeCompany('relativeCompanies', idx)} className="mb-0.5 p-2.5 text-red-500 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-200">
                           <Trash2 className="w-4 h-4"/>
                         </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4-QADAM: Xabarnoma yuborish */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">3. Мавжуд манфаатлар тўқнашуви бўйича маълумот</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Mavjud manfaatlar to'qnashuvi to'g'risida batafsil ma'lumot kiriting:</label>
                <textarea 
                  rows={6} 
                  value={formData.conflictInfo}
                  onChange={(e) => setFormData({...formData, conflictInfo: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-slate-900 bg-slate-50 resize-none"
                  placeholder="Holatni to'liq bayon eting..."
                ></textarea>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800">
                  Men ushbu xabarnomada o'zim va menga aloqador shaxslarning mavjud manfaatlar to'qnashuviga oid ma'lumotlar to'g'riligini tasdiqlayman. Noto'g'ri ma'lumotlar uchun qonunchilikka asosan javobgarlikni o'z zimmamga olaman.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Harakat tugmalari */}
        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={() => {setCurrentStep((prev) => Math.max(prev - 1, 1)); setErrors([]);}}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${currentStep === 1 ? 'invisible' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
          >
            <ArrowLeft className="w-4 h-4" /> Orqaga
          </button>

          {currentStep < 4 ? (
            <button 
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 bg-[#0A2540] text-white hover:bg-[#113559] transition-colors shadow-sm"
            >
              Keyingisi <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              className="px-8 py-3 rounded-lg font-medium flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              <Send className="w-4 h-4" /> Xabarnomani Yuborish
            </button>
          )}
        </div>
      </main>
    </div>
  );
}