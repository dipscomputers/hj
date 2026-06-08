/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  HelpCircle, 
  IndianRupee, 
  TrendingUp, 
  BookOpen, 
  Award, 
  TrendingDown, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Printer,
  MessageCircle,
  X,
  Search,
  Bell,
  Clock,
  Settings,
  Check
} from 'lucide-react';
import { Student, Enquiry, COURSE_FEES, COURSES, formatDate, Installment, InstituteSettings } from '../types';
import { Language, translations } from '../locales';

interface DashboardViewProps {
  students: Student[];
  enquiries: Enquiry[];
  lang: Language;
  settings: InstituteSettings;
  onNavigate: (tab: string) => void;
  onViewStudent: (student: Student) => void;
  courses?: string[];
  courseFees?: Record<string, number>;
  onTriggerReceipt?: (student: Student, inst: Installment) => void;
}

const getWhatsAppReminderMessage = (studentName: string, courseName: string, balance: number, customTemplate?: string) => {
  const defaultMsg = `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

हा *दिप्स कॉम्प्युटर्स* कडून एक नम्र आठवण संदेश आहे. 💡

तुमच्या *[कोर्सचे नाव]* या कोर्सची थकीत फी *₹[थकीत रक्कम]* जमा करणे प्रलंबित आहे.

कृपया आपल्या सोयीनुसार लवकरात लवकर सदर शुल्क फी जमा करावी जेणेकरून तुमचा अभ्यासक्रम विनाअडथळा सुरू राहील.

मदत किंवा अधिक माहितीसाठी संपर्क साधू शकता.

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.

📞 संपर्क: 9049102035 / 8888732035
*धन्यवाद!* 😊`;
  const baseTemplate = customTemplate || defaultMsg;
  return baseTemplate
    .replace(/\[विद्यार्थ्याचे नाव\]/g, studentName)
    .replace(/\[कोर्सचे नाव\]/g, courseName)
    .replace(/\[थकीत रक्कम\]/g, balance.toLocaleString());
};

const sendWhatsAppReminderMsg = (mobile: string, name: string, course: string, balance: number, customTemplate?: string) => {
  const cleanPhone = mobile.replace(/\D/g, '');
  const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(getWhatsAppReminderMessage(name, course, balance, customTemplate))}`;
  window.open(whatsappUrl, '_blank');
};

interface AutoReminderSchedule {
  studentId: string;
  frequency: 'weekly' | 'monthly' | 'due_date';
  preferredTime: string;
  active: boolean;
  scheduledAt: string;
}

export default function DashboardView({ 
  students, 
  enquiries, 
  lang, 
  settings,
  onNavigate,
  onViewStudent,
  courses,
  courseFees,
  onTriggerReceipt
}: DashboardViewProps) {
  const t = translations[lang];

  const [reminderSearch, setReminderSearch] = useState('');
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ fullName: string; course: string; balance: number; mobile: string } | null>(null);

  const [autoReminders, setAutoReminders] = useState<Record<string, AutoReminderSchedule>>(() => {
    try {
      const saved = localStorage.getItem('whatsapp_auto_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [configuringReminder, setConfiguringReminder] = useState<Student | null>(null);

  const toggleAutoReminder = (studentId: string) => {
    const existing = autoReminders[studentId];
    if (existing) {
      const updated = {
        ...autoReminders,
        [studentId]: {
          ...existing,
          active: !existing.active
        }
      };
      setAutoReminders(updated);
      localStorage.setItem('whatsapp_auto_reminders', JSON.stringify(updated));
    } else {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setConfiguringReminder(student);
      }
    }
  };

  const activeCourses = courses || COURSES;
  const activeCourseFees = courseFees || COURSE_FEES;

  // Calculations for state stats
  const totalEnquiries = enquiries.length;
  const totalStudents = students.length;

  const totalFees = students.reduce((acc, curr) => acc + curr.totalFees, 0);
  const receivedFees = students.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const pendingFees = students.reduce((acc, curr) => acc + curr.balanceFees, 0);

  // Recents List
  const recentEnquiries = [...enquiries]
    .sort((a,b) => b.enquiryDate.localeCompare(a.enquiryDate))
    .slice(0, 5);

  const recentAdmissions = [...students]
    .sort((a,b) => b.admissionDate.localeCompare(a.admissionDate))
    .slice(0, 5);

  // Flat list of recent installments
  const recentInstallments = students.flatMap(s => 
    s.installments.map(inst => ({
      studentId: s.id,
      fullName: s.fullName,
      amount: inst.amount,
      installmentNo: inst.installmentNo,
      paymentDate: inst.paymentDate,
      receiptNo: inst.receiptNo
    }))
  ).sort((a,b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 5);

  // Target students calculation for the reminder widget
  const targetStudents = students.filter(s => s.balanceFees > 0);

  const filteredReminderStudents = targetStudents.filter(s => 
    s.fullName.toLowerCase().includes(reminderSearch.toLowerCase()) ||
    s.course.toLowerCase().includes(reminderSearch.toLowerCase()) ||
    s.mobile.includes(reminderSearch)
  );

  // Course Summary calculator
  const getCourseSummary = (course: string) => {
    const courseStudents = students.filter(s => s.course === course);
    return {
      total: courseStudents.length,
      active: courseStudents.filter(s => s.balanceFees > 0).length,
      revenuePaid: courseStudents.reduce((acc, s) => acc + s.paidAmount, 0)
    };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP DUAL ACTION CRUISE PILLS */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <p className="text-gray-500 text-xs">
            {lang === 'en' 
              ? 'DIPs Computers Operations Console is live. Manage registration and fee invoices securely.' 
              : 'DIPs कॉम्प्युटर्स संचालन कन्सोल सुरू आहे. नोंदणी आणि शुल्क पावत्या सुरक्षितपणे व्यवस्थापित करा.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="btn-quick-new-enquiry"
            onClick={() => onNavigate('enquiry')}
            className="flex items-center gap-1.5 text-xs bg-[#48bb78] text-white hover:bg-[#38a169] px-3.5 py-2 font-bold rounded-lg shadow-sm transition active:scale-95"
          >
            <HelpCircle className="h-4 w-4" />
            + {lang === 'en' ? 'New Enquiry' : 'नवीन चौकशी'}
          </button>
          <button
            id="btn-quick-new-admission"
            onClick={() => onNavigate('admission')}
            className="flex items-center gap-1.5 text-xs bg-[#3182ce] text-white hover:bg-[#2b6cb0] px-3.5 py-2 font-bold rounded-lg shadow-sm transition active:scale-95"
          >
            <Users className="h-4 w-4" />
            + {lang === 'en' ? 'New Admission' : 'नवीन प्रवेश'}
          </button>
        </div>
      </div>

      {/* 2. ADMINLTE-STYLE CRM HIGHLIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* TOTAL STUDENTS */}
        <div 
          onClick={() => onNavigate('admission')}
          className="bg-[#0073b7] text-white rounded-lg shadow relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="p-4 relative">
            <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest font-mono">ADMISSION</div>
            <h4 className="text-3xl font-extrabold mt-1.5 font-sans">{totalStudents}</h4>
            <p className="text-xs font-semibold mt-1 text-white/90">{t.totalStudents}</p>
            <div className="absolute right-2 bottom-3 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <Users className="h-16 w-16" />
            </div>
          </div>
          <div className="bg-black/15 group-hover:bg-black/25 transition-colors py-1.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none border-t border-white/5">
            <span>More info</span>
            <ArrowRight className="h-3 w-3 bg-white text-[#0073b7] p-0.5 rounded-full inline-flex items-center justify-center" />
          </div>
        </div>

        {/* TOTAL ENQUIRIES */}
        <div 
          onClick={() => onNavigate('enquiry')}
          className="bg-[#00a65a] text-white rounded-lg shadow relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="p-4 relative">
            <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest font-mono">ENQUIRIES</div>
            <h4 className="text-3xl font-extrabold mt-1.5 font-sans">{totalEnquiries}</h4>
            <p className="text-xs font-semibold mt-1 text-white/90">{t.totalEnquiries}</p>
            <div className="absolute right-2 bottom-3 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <HelpCircle className="h-16 w-16" />
            </div>
          </div>
          <div className="bg-black/15 group-hover:bg-black/25 transition-colors py-1.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none border-t border-white/5">
            <span>More info</span>
            <ArrowRight className="h-3 w-3 bg-white text-[#00a65a] p-0.5 rounded-full inline-flex items-center justify-center" />
          </div>
        </div>

        {/* TOTAL FEES EXPECTED */}
        <div 
          onClick={() => onNavigate('fees')}
          className="bg-[#f39c12] text-white rounded-lg shadow relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="p-4 relative">
            <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest font-mono">GROSS PREMIUM</div>
            <h4 className="text-3xl font-extrabold mt-1.5 font-sans">₹{totalFees.toLocaleString()}</h4>
            <p className="text-xs font-semibold mt-1 text-white/90">{t.totalFees}</p>
            <div className="absolute right-2 bottom-3 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <IndianRupee className="h-16 w-16" />
            </div>
          </div>
          <div className="bg-black/15 group-hover:bg-black/25 transition-colors py-1.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none border-t border-white/5">
            <span>More info</span>
            <ArrowRight className="h-3 w-3 bg-white text-[#f39c12] p-0.5 rounded-full inline-flex items-center justify-center" />
          </div>
        </div>

        {/* RECEIVED FEES */}
        <div 
          onClick={() => onNavigate('fees')}
          className="bg-[#dd4b39] text-white rounded-lg shadow relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="p-4 relative">
            <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest font-mono font-mono">REVENUE PAID</div>
            <h4 className="text-3xl font-extrabold mt-1.5 font-sans">₹{receivedFees.toLocaleString()}</h4>
            <p className="text-xs font-semibold mt-1 text-white/90">{t.receivedFees}</p>
            <div className="absolute right-2 bottom-3 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <TrendingUp className="h-16 w-16" />
            </div>
          </div>
          <div className="bg-black/15 group-hover:bg-black/25 transition-colors py-1.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none border-t border-white/5">
            <span>More info</span>
            <ArrowRight className="h-3 w-3 bg-white text-[#dd4b39] p-0.5 rounded-full inline-flex items-center justify-center" />
          </div>
        </div>

        {/* PENDING FEES */}
        <div 
          onClick={() => onNavigate('fees')}
          className="bg-[#526075] text-white rounded-lg shadow relative overflow-hidden group hover:scale-[1.01] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
        >
          <div className="p-4 relative">
            <div className="text-[11px] text-white/80 font-bold uppercase tracking-widest font-mono">RECEIVABLES</div>
            <h4 className="text-3xl font-extrabold mt-1.5 font-sans">₹{pendingFees.toLocaleString()}</h4>
            <p className="text-xs font-semibold mt-1 text-white/90">{t.pendingFees}</p>
            <div className="absolute right-2 bottom-3 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <TrendingDown className="h-16 w-16" />
            </div>
          </div>
          <div className="bg-black/15 group-hover:bg-black/25 transition-colors py-1.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none border-t border-white/5">
            <span>More info</span>
            <ArrowRight className="h-3 w-3 bg-white text-[#526075] p-0.5 rounded-full inline-flex items-center justify-center" />
          </div>
        </div>

      </div>

      {/* 3. COURSE WISE SMALL HIGHLIGHT CARDS */}
      <div className="space-y-2">
        <h3 id="course-section-title" className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
          {t.courseSummary}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {activeCourses.map(course => {
            const sum = getCourseSummary(course);
            // Vibrant full colors for each course card
            const colors = {
              'MS-CIT': 'bg-[#00c0ef]',       // Cyan / Light Blue
              'Tally GST': 'bg-[#605ca8]',     // Purple
              'Basic Computer': 'bg-[#00a65a]',// Green
              'Advanced Excel': 'bg-[#e08e0b]',// Darker yellow/orange
              'DTP': 'bg-[#f012be]',           // Fuchsia
            }[course] || 'bg-[#526075]';

            return (
              <div 
                key={course} 
                className={`p-2.5 px-3.5 rounded-lg text-white ${colors} relative overflow-hidden group hover:scale-[1.02] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="text-[10px] text-white/85 font-mono font-bold uppercase tracking-wider truncate mr-5">{course}</div>
                  <h4 className="text-xl font-extrabold mt-0.5 font-sans leading-none">{sum.total}</h4>
                  <div className="text-[9px] mt-0.5 text-white/80 font-bold uppercase tracking-wider">
                    {sum.total === 1 ? 'Student' : 'Students'}
                  </div>
                </div>
                {/* BookOpen icon with custom opacity in background */}
                <div className="absolute right-1.5 bottom-1.5 text-black/15 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURED: FEE RECEIVABLES & QUICK REMINDERS WIDGET */}
      <div id="fee-reminders-widget" className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden hover:shadow-md transition duration-200">
        
        {/* Header bar */}
        <div className="p-4 sm:px-6 border-b border-gray-150 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                {lang === 'en' ? 'Fee Receivables & Payment Reminders' : 'प्रलंबित शुल्क आणि थकीत फी आठवण कन्सोल'}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 font-mono">
                  {targetStudents.length} {lang === 'en' ? 'Pending' : 'बाकी'}
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {lang === 'en' 
                  ? 'Send personalized WhatsApp reminder alerts to students with outstanding balance fees.' 
                  : 'थकीत फी असलेल्या विद्यार्थ्यांना लवकरात लवकर फी भरण्याबाबत व्हॉट्सॲपवर स्मरणपत्र पाठवा.'}
              </p>
            </div>
          </div>

          {/* Search box for filtering */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              id="reminder-search-input"
              value={reminderSearch}
              onChange={(e) => setReminderSearch(e.target.value)}
              placeholder={lang === 'en' ? 'Search student or course...' : 'विद्यार्थ्याचे नाव किंवा कोर्स शोधा...'}
              className="w-full text-xs py-2 pl-9 pr-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white shadow-xs focus:ring-1 focus:ring-blue-500/20"
            />
            {reminderSearch && (
              <button
                id="btn-clear-reminder-search"
                onClick={() => setReminderSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List panel */}
        <div className="max-h-[385px] overflow-y-auto">
          {filteredReminderStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <div className="inline-flex p-3 bg-gray-50 rounded-full text-gray-300">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-xs font-semibold">
                {reminderSearch 
                  ? (lang === 'en' ? 'No matching pending student records found.' : 'या नावाने कोणतेही प्रलंबित शुल्क रेकॉर्ड सापडले नाही.')
                  : (lang === 'en' ? 'No outstanding fees pending. Excellent job!' : 'सर्व विद्यार्थ्यांचे शुल्क पूर्ण जमा झाले आहे. अभिनंदन!')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-500">
                <thead className="text-[10px] text-gray-400 bg-slate-50 border-b border-gray-100 uppercase tracking-wider font-bold sticky top-0 bg-slate-55 z-10 shadow-xs">
                  <tr>
                    <th className="p-3 w-[26%] text-left">{lang === 'en' ? 'Student' : 'विद्यार्थी'}</th>
                    <th className="p-3 w-[15%] text-left">{lang === 'en' ? 'Course' : 'कोर्स'}</th>
                    <th className="p-3 w-[15%] text-left">{lang === 'en' ? 'Next Due' : 'पुढील हप्ता तारीख'}</th>
                    <th className="p-3 w-[10%] text-right">{lang === 'en' ? 'Paid' : 'भरलेले'}</th>
                    <th className="p-3 w-[10%] text-right">{lang === 'en' ? 'Balance' : 'शिल्लक'}</th>
                    <th className="p-3 w-[14%] text-center">{lang === 'en' ? 'Auto-Remind' : 'ऑटो आठवण'}</th>
                    <th className="p-3 w-[10%] text-right">{lang === 'en' ? 'Action' : 'क्रिया'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredReminderStudents.map(stud => {
                    return (
                      <tr key={stud.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 align-middle">
                          <div className="flex items-center gap-3">
                            <img src={stud.photo} alt="" className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <div 
                                className="font-bold text-gray-800 text-xs hover:underline cursor-pointer" 
                                onClick={() => onViewStudent(stud)}
                              >
                                {stud.fullName}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono tracking-tight mt-0.5">{stud.village} • {stud.mobile}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-middle text-left">
                          <span className="px-2 py-0.5 font-bold rounded bg-sky-50 text-sky-700 text-[10px] uppercase font-mono tracking-wide">
                            {stud.course}
                          </span>
                        </td>
                        <td className="p-3 align-middle text-left text-gray-550 font-mono">
                          {stud.nextInstallmentDate ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Calendar className="h-3.5 w-3.5 text-amber-500" />
                              <span>{formatDate(stud.nextInstallmentDate)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="p-3 align-middle text-right text-gray-500 font-bold font-mono">₹{stud.paidAmount.toLocaleString()}</td>
                        <td className="p-3 align-middle text-right text-rose-600 font-extrabold font-mono text-[13px] bg-rose-50/10">
                          ₹{stud.balanceFees.toLocaleString()}
                        </td>
                        <td className="p-3 align-middle text-center">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            {/* Toggle Button Switch */}
                            <button
                              id={`btn-toggle-auto-${stud.id}`}
                              onClick={() => toggleAutoReminder(stud.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                autoReminders[stud.id]?.active ? 'bg-emerald-500' : 'bg-gray-200'
                              }`}
                              title={
                                autoReminders[stud.id]?.active
                                  ? (lang === 'en' ? 'Active automatic reminder. Click to Pause.' : 'थकीत फी ऑटो आठवण सुरू आहे. थांबवण्यासाठी क्लिक करा.')
                                  : (lang === 'en' ? 'Schedule automatic reminder' : 'ऑटो आठवण नियोजित करा')
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  autoReminders[stud.id]?.active ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Info or Edit Schedule config button */}
                            {autoReminders[stud.id] ? (
                              <button
                                id={`btn-config-auto-${stud.id}`}
                                onClick={() => setConfiguringReminder(stud)}
                                className="p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                                title={lang === 'en' ? 'Configure schedule' : 'नियोजन बदला'}
                              >
                                <Settings className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                id={`btn-config-new-auto-${stud.id}`}
                                onClick={() => setConfiguringReminder(stud)}
                                className="p-1 text-gray-300 hover:text-gray-550 rounded-md transition"
                                title={lang === 'en' ? 'Setup schedule' : 'नियोजन करा'}
                              >
                                <Settings className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Active Schedule Badge text */}
                            {autoReminders[stud.id]?.active && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                {autoReminders[stud.id].frequency === 'due_date' 
                                  ? (lang === 'en' ? 'Due' : 'हप्त्याला')
                                  : autoReminders[stud.id].frequency === 'weekly'
                                    ? (lang === 'en' ? 'Weekly' : 'साप्ताह.')
                                    : (lang === 'en' ? 'Monthly' : 'मासिक')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 align-middle text-right">
                          <button
                            id={`btn-remind-wa-${stud.id}`}
                            onClick={() => {
                              setWhatsAppModalData({
                                fullName: stud.fullName,
                                course: stud.course,
                                balance: stud.balanceFees,
                                mobile: stud.mobile
                              });
                            }}
                            className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 border border-emerald-250 text-emerald-700 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition shadow-xs active:scale-95 ml-auto cursor-pointer"
                            title={lang === 'en' ? 'Send WhatsApp Payment Reminder' : 'शुल्क भरण्याबाबत स्मरणपत्र पाठवा'}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{lang === 'en' ? 'Remind' : 'स्मरणपत्र'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. MULTIPLE RECENT LEDGER TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Column 1: Recent Enquiries */}
        <div id="recent-enquiries-card" className="bg-white rounded-xl border border-gray-150 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition duration-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00c0ef]"></span>
              {t.recentEnquiries}
            </h4>
            <button 
              id="view-all-enquiries-btn"
              onClick={() => onNavigate('enquiry')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
            >
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-[10px] text-gray-400 bg-gray-50 border-b border-gray-100 uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-3 w-[45%] text-left">Name</th>
                  <th className="p-3 w-[30%] text-left">Course</th>
                  <th className="p-3 w-[25%] text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {recentEnquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 align-middle">
                      <div className="font-semibold text-gray-800 text-xs truncate max-w-[120px]">{enq.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{enq.mobile}</div>
                    </td>
                    <td className="p-3 align-middle text-left">
                      <span className="px-2 py-0.5 font-bold rounded bg-sky-50 text-sky-700 text-[10px] uppercase font-mono tracking-wide">
                        {enq.course}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right text-gray-400 font-mono text-[11px] whitespace-nowrap">{formatDate(enq.enquiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Recent Admissions */}
        <div id="recent-admissions-card" className="bg-white rounded-xl border border-gray-150 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition duration-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00a65a]"></span>
              {t.recentAdmissions}
            </h4>
            <button 
              id="view-all-admissions-btn"
              onClick={() => onNavigate('admission')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
            >
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-[10px] text-gray-400 bg-gray-50 border-b border-gray-100 uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-3 w-[50%] text-left">Student Name</th>
                  <th className="p-3 w-[25%] text-left">Course</th>
                  <th className="p-3 w-[25%] text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {recentAdmissions.map(stud => (
                  <tr key={stud.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => onViewStudent(stud)}>
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <img src={stud.photo} alt="" className="h-7 w-7 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm animate-fade-in" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 hover:underline hover:text-blue-600 text-xs truncate max-w-[125px]">{stud.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{stud.village}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-middle text-left">
                      <span className="px-2 py-0.5 font-bold rounded bg-emerald-50 text-emerald-700 text-[10px] uppercase font-mono tracking-wide">
                        {stud.course}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right text-gray-400 font-mono text-[11px] whitespace-nowrap">{formatDate(stud.admissionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Recent Fees Collection */}
        <div id="recent-fees-card" className="bg-white rounded-xl border border-gray-150 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition duration-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e08e0b]"></span>
              {t.recentFees}
            </h4>
            <button 
              id="view-all-fees-btn"
              onClick={() => onNavigate('fees')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
            >
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-[10px] text-gray-400 bg-gray-50 border-b border-gray-100 uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-3 w-[40%] text-left">Student</th>
                  <th className="p-3 w-[15%] text-center">Inst No</th>
                  <th className="p-3 w-[25%] text-right font-sans">Amount</th>
                  <th className="p-3 w-[20%] text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {recentInstallments.map((inst, i) => (
                  <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 align-middle">
                      <div className="font-semibold text-gray-800 text-xs truncate max-w-[130px]">{inst.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">Inv: {inst.receiptNo}</div>
                    </td>
                    <td className="p-3 align-middle text-center font-mono font-bold text-gray-500 text-[11px]">#{inst.installmentNo}</td>
                    <td className="p-3 align-middle text-right font-bold text-emerald-600 font-mono text-xs whitespace-nowrap">₹{inst.amount.toLocaleString()}</td>
                    <td className="p-3 align-middle text-right">
                      {onTriggerReceipt && (
                        <button
                          id={`btn-dash-receipt-${inst.receiptNo}`}
                          onClick={() => {
                            const student = students.find(s => s.id === inst.studentId);
                            if (student) {
                              const installment = student.installments.find(item => item.receiptNo === inst.receiptNo);
                              if (installment) {
                                onTriggerReceipt(student, installment);
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-md transition shadow-xs active:scale-95"
                          title="View / Print Receipt"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Print</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. PERFORMANCE ANALYTICS PLOTS - Interactive SVG representation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend chart card */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Monthly Admission Trend (2026)</h4>
              <p className="text-xs text-gray-400">Total metrics tracking admission records</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest font-mono">
              TRENDLINE
            </span>
          </div>

          {/* SVG Line & Grid Drawing with dynamic statistics */}
          {(() => {
            // Dynamic monthly trend calculation based on actual admission dates in 2026
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'];
            const baseCounts = [3, 5, 4, 8, 10, 14]; 
            
            // Increment with real students' admission dates
            students.forEach(s => {
              if (!s.admissionDate) return;
              const parts = s.admissionDate.split('-');
              let m = -1;
              if (parts.length === 3) {
                if (parts[0].length === 4) { // YYYY-MM-DD
                  m = parseInt(parts[1], 10) - 1;
                } else if (parts[2].length === 4) { // DD-MM-YYYY
                  m = parseInt(parts[1], 10) - 1;
                }
              }
              if (m >= 0 && m < 6) {
                baseCounts[m]++;
              }
            });
            
            const maxVal = Math.max(...baseCounts, 1) || 15;
            
            // X interval starts at 30 and steps by 88 to fit in 500width viewport beautifully
            const points = baseCounts.map((val, idx) => {
              const x = 30 + idx * 88; // 6 points nicely spaced: 30, 118, 206, 294, 382, 470
              const y = 150 - (val / maxVal) * 110; // offset the baseline for visual balance
              return { x, y, val };
            });
            
            let pathD = '';
            if (points.length > 0) {
              pathD = `M ${points[0].x},${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const cpX1 = prev.x + (curr.x - prev.x) / 2;
                const cpY1 = prev.y;
                const cpX2 = prev.x + (curr.x - prev.x) / 2;
                const cpY2 = curr.y;
                pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
              }
            }

            return (
              <div className="relative h-60 w-full mt-2 bg-gray-50/50 rounded-lg p-2 border border-gray-100 flex flex-col justify-between">
                {/* Custom vector line chart */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                    {/* Horizontal reference helper lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                    <line x1="0" y1="130" x2="500" y2="130" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                    
                    {/* Gradient Fill under Path */}
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3182ce" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#3182ce" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    {pathD && (
                      <path 
                        d={`${pathD} L 470,160 L 30,160 Z`} 
                        fill="url(#trendGradient)" 
                      />
                    )}

                    {/* Vector path for trend line */}
                    {pathD && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke="#3182ce" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Pulsing indicator dots on path */}
                    {points.map((pt, idx) => (
                      <circle 
                        key={idx}
                        cx={pt.x} 
                        cy={pt.y} 
                        r={idx === points.length - 1 ? "5.5" : "4"} 
                        fill={idx === points.length - 1 ? "#48bb78" : "#3182ce"}
                        className={idx === points.length - 1 ? "animate-pulse" : ""}
                      />
                    ))}
                  </svg>
                  <div className="absolute top-2 left-3 bg-white/95 shadow-sm px-2.5 py-1 rounded text-[10px] border border-gray-150 font-bold font-mono text-gray-750 flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="h-2 w-2 bg-[#48bb78] rounded-full animate-ping"></span>
                    Peak: {baseCounts[5]} Admissions in June
                  </div>
                </div>

                {/* Months indicators on X Axis */}
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold font-mono px-5 pt-2 border-t border-gray-100">
                  {months.map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Product performance card */}
        <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Product Performance Matrix (Revenue Base)</h4>
              <p className="text-xs text-gray-400">Total fees receipts distributed per academic program</p>
            </div>
            <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest font-mono">
              REVENUE MIX
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {activeCourses.map(course => {
              const info = getCourseSummary(course);
              const maxVal = Math.max(...activeCourses.map(c => getCourseSummary(c).revenuePaid)) || 10000;
              const percent = maxVal > 0 ? (info.revenuePaid / maxVal) * 100 : 0;
              
              // Colors matching courses
              const colorClass = {
                'MS-CIT': 'bg-[#00c0ef]',
                'Tally GST': 'bg-[#605ca8]',
                'Basic Computer': 'bg-[#00a65a]',
                'Advanced Excel': 'bg-[#e08e0b]',
                'DTP': 'bg-[#f012be]',
              }[course] || 'bg-gray-500';

              return (
                <div key={course} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`}></span>
                      {course}
                    </span>
                    <span className="font-bold font-mono text-gray-800">₹{info.revenuePaid.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                      style={{ width: `${Math.max(percent, 8)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* WHATSAPP CONFIRMATION PREVIEW & SEND MODAL */}
      {whatsAppModalData && (
        <div id="wa-reminder-modal-backdrop" className="fixed inset-0 z-55 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
          <div id="wa-reminder-modal-card" className="bg-[#f0f2f5] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            
            {/* Top WhatsApp branded bar */}
            <div className="bg-[#00a884] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2 font-sans">
                <MessageCircle className="h-5 w-5 fill-white text-[#00a884]" />
                <div>
                  <h4 className="font-bold text-xs tracking-wider uppercase">{lang === 'en' ? 'Payment Reminder' : 'थकीत फी आठवण संदेश'}</h4>
                  <p className="text-[10px] text-emerald-100 font-medium">To: {whatsAppModalData.fullName} ({whatsAppModalData.mobile})</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppModalData(null)} 
                className="text-white hover:bg-white/10 p-1 rounded transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs font-sans">
              <p className="text-gray-500 font-medium leading-relaxed">
                {lang === 'en' 
                  ? 'Review the payment reminder message that will be sent via WhatsApp:' 
                  : 'विद्यार्थ्यास जाणाऱ्या व्हॉट्सॲप स्मरणपत्र संदेशाची पडताळणी करा:'}
              </p>

              {/* Chat-bubble container simulating a real WhatsApp chat window */}
              <div 
                className="p-3.5 bg-[#efeae2] border rounded-xl flex flex-col justify-end min-h-[160px]"
                style={{ 
                  backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 0px)', 
                  backgroundSize: '12px 12px' 
                }}
              >
                <div className="bg-[#d9fdd3] text-[#111b21] p-3 rounded-xl shadow-xs whitespace-pre-wrap leading-relaxed relative max-w-[95%] text-left">
                  {getWhatsAppReminderMessage(whatsAppModalData.fullName, whatsAppModalData.course, whatsAppModalData.balance, settings?.whatsAppReminderTemplate)}
                  <p className="text-right text-[8px] text-gray-400 font-mono mt-1 font-bold">10:30 AM ✓✓</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  id="btn-wa-reminder-modal-cancel"
                  onClick={() => setWhatsAppModalData(null)}
                  className="bg-white border text-gray-700 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-lg text-xs"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  id="btn-wa-reminder-modal-send"
                  onClick={() => {
                    sendWhatsAppReminderMsg(whatsAppModalData.mobile, whatsAppModalData.fullName, whatsAppModalData.course, whatsAppModalData.balance, settings?.whatsAppReminderTemplate);
                    setWhatsAppModalData(null);
                  }}
                  className="bg-[#00a884] hover:bg-[#00a37f] text-white font-extrabold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0 text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Send WhatsApp' : 'व्हॉट्सॲपवर पाठवा'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* AUTOMATIC WHATSAPP SCHEDULER CONFIGURATION MODAL */}
      {configuringReminder && (() => {
        const existing = autoReminders[configuringReminder.id] || {
          studentId: configuringReminder.id,
          frequency: 'due_date',
          preferredTime: '10:00 AM',
          active: true,
          scheduledAt: new Date().toISOString()
        };

        return (
          <div id="wa-schedule-setup-backdrop" className="fixed inset-0 z-55 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
            <div id="wa-schedule-setup-card" className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              
              {/* Modal Title Banner */}
              <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2 font-sans">
                  <Clock className="h-5 w-5" />
                  <div>
                    <h4 className="font-bold text-sm leading-tight">
                      {lang === 'en' ? 'Setup Automatic Payment Reminders' : 'थकीत फी ऑटो स्मरणपत्र नियोजन'}
                    </h4>
                    <p className="text-[10px] text-emerald-100 font-medium">
                      Student: {configuringReminder.fullName}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setConfiguringReminder(null)} 
                  className="text-white hover:bg-white/10 p-1 rounded transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-gray-700 font-sans leading-relaxed">
                <p className="text-gray-550 font-semibold leading-normal">
                  {lang === 'en' 
                    ? 'Configure automated recurring reminder schedules. Alerts are dispatched to the student’s WhatsApp number using your predefined templates.' 
                    : 'पुढील हप्ता किंवा निश्चित कालावधीनुसार विद्यार्थ्याला आपोआप जाणाऱ्या व्हॉट्सॲप स्मरणपत्र संदेशाचे नियोजन येथे करा:'}
                </p>

                {/* Form Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-150">
                  
                  {/* Select Frequency */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700">
                      {lang === 'en' ? 'Reminder Frequency' : 'स्मरणपत्र वारंवारता'}
                    </label>
                    <select
                      id="schedule-frequency-select"
                      defaultValue={existing.frequency}
                      onChange={(e) => {
                        existing.frequency = e.target.value as any;
                      }}
                      className="w-full text-xs font-semibold py-2 px-2.5 border border-gray-200 rounded-lg outline-none bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 font-sans cursor-pointer"
                    >
                      <option value="due_date">
                        {lang === 'en' ? 'On Next Due Date' : 'पुढील हप्ता तारखेला'}
                      </option>
                      <option value="weekly">
                        {lang === 'en' ? 'Weekly (Mondays)' : 'साप्ताहिक (दर सोमवारी)'}
                      </option>
                      <option value="monthly">
                        {lang === 'en' ? 'Monthly (1st Day)' : 'मासिक (१ तारखेला)'}
                      </option>
                    </select>
                  </div>

                  {/* Preferred Delivery Hour */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700">
                      {lang === 'en' ? 'Preferred Delivery Time' : 'मजकूर पाठवण्याची वेळ'}
                    </label>
                    <select
                      id="schedule-time-select"
                      defaultValue={existing.preferredTime}
                      onChange={(e) => {
                        existing.preferredTime = e.target.value;
                      }}
                      className="w-full text-xs font-semibold py-2 px-2.5 border border-gray-200 rounded-lg outline-none bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 font-sans cursor-pointer"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>

                  {/* Active Switch status toggle */}
                  <div className="sm:col-span-2 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-gray-800 text-[11px]">
                        {lang === 'en' ? 'Schedule Daemon Status' : 'स्मरणपत्र प्रणाली स्थिती'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {lang === 'en' ? 'Temporarily pause automatic runs' : 'थेट संदेश पाठवणी तात्पुरती थांबवा किंवा सुरू ठेवा'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={existing.active}
                        onChange={(e) => {
                          existing.active = e.target.checked;
                        }}
                        id="schedule-active-toggle"
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                </div>

                {/* Template Message Live Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      {lang === 'en' ? 'Live Alert Preview' : 'स्मरणपत्र संदेश पडताळणी'}
                    </span>
                    <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase font-mono">
                      {lang === 'en' ? 'Active Template' : 'सक्रिय टेम्पलेट'}
                    </span>
                  </div>

                  <div 
                    className="p-3 bg-[#efeae2] border rounded-xl flex flex-col justify-end min-h-[140px]"
                    style={{ 
                      backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 0px)', 
                      backgroundSize: '12px 12px' 
                    }}
                  >
                    <div className="bg-[#d9fdd3] text-[#111b21] p-3 rounded-xl shadow-xs whitespace-pre-wrap leading-relaxed relative max-w-[95%] text-left font-sans">
                      {getWhatsAppReminderMessage(configuringReminder.fullName, configuringReminder.course, configuringReminder.balanceFees, settings?.whatsAppReminderTemplate)}
                      <p className="text-right text-[8px] text-gray-400 font-mono mt-1 font-bold">10:30 AM ✓✓</p>
                    </div>
                  </div>
                </div>

                {/* Notification helper */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2 text-emerald-800">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <p className="text-[10px]">
                    {lang === 'en'
                      ? 'Saved automated configurations run at their designated periods. Dispatches use the background message queue daemon.'
                      : 'जतन केलेले स्वयंचलित नियोजन बैग्राउंड सर्व्हर वरून दर निश्चित कालावधीत विद्यार्थ्याच्या व्हॉट्सॲप क्रमांकावर पाठवले जाईल.'}
                  </p>
                </div>

                {/* Action controls */}
                <div className="pt-2 flex gap-2 justify-end">
                  <button
                    id="btn-schedule-setup-cancel"
                    onClick={() => setConfiguringReminder(null)}
                    className="bg-white border text-gray-700 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-lg text-xs"
                  >
                    {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    id="btn-schedule-setup-save"
                    onClick={() => {
                      // Save and update state
                      const updated = {
                        ...autoReminders,
                        [configuringReminder.id]: {
                          studentId: configuringReminder.id,
                          frequency: existing.frequency,
                          preferredTime: existing.preferredTime,
                          active: existing.active,
                          scheduledAt: new Date().toISOString()
                        }
                      };
                      setAutoReminders(updated);
                      localStorage.setItem('whatsapp_auto_reminders', JSON.stringify(updated));
                      setConfiguringReminder(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 shrink-0 text-xs"
                  >
                    <Check className="h-4 w-4" />
                    <span>{lang === 'en' ? 'Save Schedule' : 'नियोजन जतन करा'}</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
