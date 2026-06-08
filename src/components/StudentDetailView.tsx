/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  UserCheck, 
  BookOpen, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Plus, 
  Printer, 
  MessageCircle, 
  Download, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Student, Installment, InstituteSettings, formatDate } from '../types';
import { Language, translations } from '../locales';

interface StudentDetailViewProps {
  student: Student;
  onClose: () => void;
  onAddInstallmentClick: () => void;
  onTriggerReceipt: (student: Student, installment: Installment) => void;
  onOpenWhatsAppModal: (data: { fullName: string; course: string; mobile: string }) => void;
  onPrintPortfolio: (student: Student) => void;
  onEditClick: (student: Student) => void;
  onDeleteClick: (student: Student) => void;
  lang: Language;
  settings: InstituteSettings;
}

export default function StudentDetailView({
  student,
  onClose,
  onAddInstallmentClick,
  onTriggerReceipt,
  onOpenWhatsAppModal,
  onPrintPortfolio,
  onEditClick,
  onDeleteClick,
  lang,
  settings,
}: StudentDetailViewProps) {
  const t = translations[lang];

  // Function to calculate and style the financial status
  const getFinancialStatus = (stud: Student) => {
    if (stud.balanceFees <= 0) {
      return {
        id: 'fully_paid',
        label: lang === 'en' ? 'Fully Paid' : 'पूर्ण जमा',
        description: lang === 'en' ? 'No outstanding fees balance' : 'उर्वरित फी शिल्लक नाही',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        badgeBg: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
      };
    }
    
    // Check if overdue
    if (stud.nextInstallmentDate) {
      const today = new Date().toISOString().split('T')[0];
      if (stud.nextInstallmentDate < today) {
        return {
          id: 'overdue',
          label: lang === 'en' ? 'Overdue' : 'मुदत उलटली',
          description: lang === 'en' ? 'Payment timeline exceeded' : 'देय मुदत निघून गेली आहे',
          colorClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 animate-pulse',
          badgeBg: 'bg-rose-500',
          textColor: 'text-rose-600 dark:text-rose-400',
        };
      }
    }

    return {
      id: 'pending',
      label: lang === 'en' ? 'Pending' : 'प्रलंबित (Pending)',
      description: lang === 'en' ? 'Fees scheduled for collection' : 'फी हप्ता जमा करणे प्रलंबित',
      colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
      badgeBg: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
    };
  };

  const statusInfo = getFinancialStatus(student);

  // Compute fee progress metrics
  const paidPercent = student.totalFees > 0 
    ? Math.round((student.paidAmount / student.totalFees) * 100) 
    : 0;

  // Render a mini milestone log
  const milestones = [
    {
      label: lang === 'en' ? 'Registered & Enrolled' : 'प्रवेश नोंदणीकृत',
      date: student.admissionDate,
      isCompleted: true,
    },
    {
      label: lang === 'en' ? 'Initial Deposit Paid' : 'पहिला हप्ता जमा',
      date: student.installments[0]?.paymentDate || null,
      isCompleted: student.paidAmount > 0,
    },
    {
      label: lang === 'en' ? 'Course Completed (Financial)' : 'पूर्ण फी जमा झाली',
      date: student.balanceFees <= 0 && student.installments.length > 0 
        ? student.installments[student.installments.length - 1].paymentDate 
        : null,
      isCompleted: student.balanceFees <= 0,
    }
  ];

  return (
    <div 
      id="stud-detail-backdrop" 
      className="fixed inset-0 z-50 bg-black/65 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        id="stud-detail-card" 
        className="bg-white dark:bg-[#151c2c] rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Dynamic Branded Header */}
        <div className="bg-[#1a202c] dark:bg-[#111827] text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/25 rounded-lg border border-blue-500/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase block">Student Portfolio Dossier</span>
              <span className="font-extrabold text-sm tracking-wide font-sans text-gray-100 flex items-center gap-1.5 mt-0.5">
                {student.id} 
                <span className="h-1 w-1 rounded-full bg-gray-500"></span>
                <span className="text-blue-400 select-all">{student.course}</span>
              </span>
            </div>
          </div>
          <button 
            id="btn-close-student-detail"
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title={lang === 'en' ? 'Close profile' : 'बंद करा'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 dark:text-gray-300 flex-1 custom-scrollbar">
          
          {/* TOP SECTION: User Intro Card with Financial Badging */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-gray-150 dark:border-gray-805">
            <div className="relative self-center md:self-start shrink-0">
              <img 
                id="detail-profile-avatar"
                src={student.photo} 
                alt={student.fullName} 
                className="h-28 w-28 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-md bg-slate-100 dark:bg-slate-900"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border text-white shadow ${statusInfo.badgeBg} border-white dark:border-[#151c2c]`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="flex-1 space-y-3 w-full text-center md:text-left">
              <div>
                <h4 className="font-extrabold text-2xl text-gray-900 dark:text-slate-100 tracking-tight leading-tight">
                  {student.fullName}
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mt-1 flex items-center justify-center md:justify-start gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  Course Joined: {student.course}
                </p>
              </div>

              {/* Badging and Financial Status Description Column */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className={`px-3 py-1 rounded-xl border text-xs font-bold leading-none w-fit mx-auto md:mx-0 flex items-center gap-1.5 ${statusInfo.colorClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.badgeBg}`} />
                  {statusInfo.label}
                </div>
                <span className="text-xs text-gray-400 text-center md:text-left block mt-1 md:mt-0">
                  {statusInfo.description}
                </span>
              </div>

              <div className="text-xs text-gray-400 font-mono border-t border-dashed border-gray-200 dark:border-gray-800 pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span>Admission: <strong className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(student.admissionDate)}</strong></span>
                <span className="h-1.5 w-1.5 bg-gray-300 rounded-full"></span>
                <span>DOB: <strong className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(student.dob)}</strong></span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: Details & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Column 1: Personal Profile Dossier (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h5 className="font-extrabold text-gray-900 dark:text-slate-200 uppercase text-xs tracking-wider border-l-4 border-l-blue-500 pl-2">
                Personal Contact & Demographics
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-55/40 dark:bg-gray-900/20 p-4 border rounded-xl border-gray-150 dark:border-gray-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Contact Phone:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-gray-800 dark:text-slate-200 font-mono text-base flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {student.mobile}
                    </span>
                    <button
                      id="btn-detail-wa-shortcut"
                      onClick={() => onOpenWhatsAppModal({
                        fullName: student.fullName,
                        course: student.course,
                        mobile: student.mobile
                      })}
                      className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition cursor-pointer"
                      title="Quick WhatsApp message"
                    >
                      <MessageCircle className="h-4 w-4 fill-emerald-600/15" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Village Location:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 text-sm">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    {student.village}
                  </span>
                </div>

                <div className="space-y-1 sm:border-t sm:border-dashed border-gray-200 dark:border-gray-800 pt-2.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Referral Info:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 text-sm">
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                    {student.referralName || 'Self Enrolled / Direct'}
                  </span>
                </div>

                <div className="space-y-1 sm:border-t sm:border-dashed border-gray-200 dark:border-gray-800 pt-2.5">
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-bold block">Next Installment Date:</span>
                  <span className={`font-semibold font-mono flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded border text-xs w-fit ${
                    student.balanceFees > 0 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/60' 
                      : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-900 dark:text-gray-600 dark:border-gray-850'
                  }`}>
                    <Calendar className="h-3.5 w-3.5" />
                    {student.balanceFees > 0 && student.nextInstallmentDate ? formatDate(student.nextInstallmentDate) : 'Not Scheduled'}
                  </span>
                </div>
              </div>

              {/* Milestone Tracker inside Detail View */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Enrollment Milestone Tracker</span>
                <div className="space-y-2.5">
                  {milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-gray-100 dark:border-gray-805/40 rounded-lg p-2.5 bg-gray-50/40 dark:bg-gray-900/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4.5 w-4.5 ${
                          milestone.isCompleted 
                            ? 'text-emerald-500 fill-emerald-500/10' 
                            : 'text-gray-300 dark:text-gray-700'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          milestone.isCompleted ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'
                        }`}>
                          {milestone.label}
                        </span>
                      </div>
                      {milestone.isCompleted && milestone.date && (
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {formatDate(milestone.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Column 2: Financial Progress & Visual Gauge (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h5 className="font-extrabold text-gray-900 dark:text-slate-200 uppercase text-xs tracking-wider border-l-4 border-l-orange-500 pl-2">
                Fee Enrollment Progress
              </h5>

              <div className="bg-white dark:bg-[#1a2438]/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden">
                
                {/* Visual Circle Gauge or Horizontal Gauge */}
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block">FEE PROGRESS</span>
                    <span className="font-extrabold text-2xl text-gray-900 dark:text-slate-100 font-mono">
                      {paidPercent}%
                    </span>
                  </div>
                  {/* Miniature Visual Bar Chart representation */}
                  <div className="w-24 bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-150 dark:border-gray-700">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${paidPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Grid metrics details */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                      {t.courseFees}
                    </span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                      ₹{student.totalFees.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {t.paidAmount}
                    </span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                      ₹{student.paidAmount.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-dashed border-gray-200 dark:border-gray-800 pt-2.5">
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                      {t.pendingAmount}
                    </span>
                    <strong className="text-rose-700 dark:text-rose-400 font-extrabold font-mono text-sm">
                      ₹{student.balanceFees.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Progress bar inside indicator panel */}
                <div className="pt-2">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-2.5 border border-dashed border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500">outstanding status</span>
                      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        {student.balanceFees > 0 
                          ? `${lang === 'en' ? 'Pending due steps' : 'शिल्लक फी जमा होणे बाकी'}`
                          : `${lang === 'en' ? 'Admission fully cleared' : 'प्रवेश फी पूर्णतः सुस्पष्ट'}`
                        }
                      </p>
                    </div>
                    {student.balanceFees > 0 ? (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded uppercase">
                        Unpaid
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">
                        CLEARED
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* TRANSACTION HISTORY SECTION: Tabular List & Add Payment Link */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center pb-1">
              <h5 className="font-extrabold text-gray-900 dark:text-slate-200 uppercase text-xs tracking-wider border-l-4 border-l-emerald-500 pl-2">
                {t.installmentHistory} &amp; Transactions List
              </h5>
              
              {student.balanceFees > 0 && (
                <button
                  id="btn-add-inst-from-detailed-profile"
                  onClick={onAddInstallmentClick}
                  className="text-xs bg-orange-600 text-white font-bold hover:bg-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{lang === 'en' ? 'Add Installment' : 'हप्ता जमा करा'}</span>
                </button>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1a2438]/20">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 uppercase font-bold text-[9px] tracking-wider border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="p-3 text-center">No</th>
                      <th className="p-3 text-right">Amount Paid</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Receipt Number</th>
                      <th className="p-3">Method</th>
                      <th className="p-3 text-right">Invoice / Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                    {student.installments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400 dark:text-gray-500 italic">
                          No transactions recorded yet. Click 'Add Installment' to record first tuition fee payment.
                        </td>
                      </tr>
                    ) : (
                      student.installments.map((inst, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 text-center font-bold text-gray-700 dark:text-gray-400">#{inst.installmentNo}</td>
                          <td className="p-3 text-right font-extrabold text-blue-700 dark:text-blue-400 font-mono">₹{inst.amount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-gray-500 dark:text-gray-400">{formatDate(inst.paymentDate)}</td>
                          <td className="p-3 font-semibold font-mono text-gray-700 dark:text-gray-300">{inst.receiptNo}</td>
                          <td className="p-3 text-xs">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              {inst.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-right align-middle">
                            <button
                              id={`btn-detailed-profile-receipt-${inst.receiptNo}`}
                              onClick={() => onTriggerReceipt(student, inst)}
                              className="h-8 w-8 flex items-center justify-center bg-[#2b6cb0]/10 border border-[#2b6cb0]/25 hover:bg-[#2b6cb0] hover:text-white text-[#2b6cb0] rounded-lg transition-all shadow-2xs active:scale-95 cursor-pointer ml-auto"
                              title={lang === 'en' ? 'View/Print Receipt' : 'पावती पहा / प्रिंट करा'}
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* COMPREHENSIVE FOOTER ACTION PORTAL */}
        <div className="bg-gray-50 dark:bg-[#111827] px-6 py-4 border-t border-gray-150 dark:border-gray-805 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">
            PORTFOLIO STATUS: ACTIVE
          </span>
          
          <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto">
            {/* WhatsApp Quick Message Action */}
            <button
              id="btn-detail-wa-action"
              onClick={() => onOpenWhatsAppModal({
                fullName: student.fullName,
                course: student.course,
                mobile: student.mobile
              })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Send WhatsApp welcome message' : 'व्हॉट्सॲप संदेश पाठवा'}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Print Student Dossier Portfolio */}
            <button
              id="btn-detail-print-action"
              onClick={() => onPrintPortfolio(student)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Print standard A4 record card' : 'प्रिंट घ्या'}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Print' : 'प्रिंट'}</span>
            </button>

            {/* Save PDF document replica */}
            <button
              id="btn-detail-pdf-action"
              onClick={() => onPrintPortfolio(student)}
              className="bg-sky-600 hover:bg-sky-700 text-white h-9 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Save portfolio sheet as A4 PDF' : 'A4 डाउनलोड करा'}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <div className="w-px bg-gray-200 dark:bg-gray-800 h-6 mx-1 hidden sm:block align-self-center animate-pulse-none" />

            {/* Edit Profile details */}
            <button
              id="btn-detail-edit-action"
              onClick={() => onEditClick(student)}
              className="bg-white dark:bg-[#1e2530] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 h-9 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Edit registration card fields' : 'माहिती बदला'}
            >
              <Edit2 className="h-4 w-4 text-gray-500" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Edit' : 'बदला'}</span>
            </button>

            {/* Delete Student Profile trigger */}
            <button
              id="btn-detail-delete-action"
              onClick={() => onDeleteClick(student)}
              className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/60 dark:hover:bg-rose-950/40 dark:text-rose-400 h-9 px-2.5 sm:px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer mr-auto sm:mr-0"
              title={lang === 'en' ? 'Permadelete record from system' : 'नोंद काढून टाका'}
            >
              <Trash2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Delete' : 'हटवा'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              id="btn-detail-close-action"
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-900 border border-gray-700 text-white dark:bg-gray-200 dark:hover:bg-gray-100 dark:border-gray-300 dark:text-gray-900 h-9 px-3.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title={lang === 'en' ? 'Close Student Details' : 'माहिती पत्रक बंद करा'}
            >
              <X className="h-4 w-4" />
              <span>{t.close}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
