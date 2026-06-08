/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  X, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  AlertCircle,
  FileCheck2,
  FileText,
  UserCheck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowUpDown,
  CreditCard,
  Plus,
  MessageCircle
} from 'lucide-react';
import { Student, Installment, COURSES, VILLAGES, PAYMENT_METHODS, formatDate, InstituteSettings } from '../types';
import { Language, translations } from '../locales';

interface FeesViewProps {
  students: Student[];
  onTriggerReceipt: (student: Student, inst: Installment) => void;
  onAddInstallment: (studentId: string, inst: Omit<Installment, 'receiptNo' | 'installmentNo'>) => void;
  lang: Language;
  courses?: string[];
  settings: InstituteSettings;
}

export default function FeesView({
  students,
  onTriggerReceipt,
  onAddInstallment,
  lang,
  courses,
  settings,
}: FeesViewProps) {
  const t = translations[lang];

  const activeCourses = courses || COURSES;

  // Component local states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ fullName: string; course: string; balance: number; mobile: string } | null>(null);

  // Financial status helper
  const getFinancialStatus = (stud: Student) => {
    if (stud.balanceFees <= 0) {
      return {
        id: 'fully_paid',
        label: lang === 'en' ? 'Fully Paid' : 'पूर्ण जमा',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
      };
    }
    
    if (stud.nextInstallmentDate) {
      const today = new Date().toISOString().split('T')[0];
      if (stud.nextInstallmentDate < today) {
        return {
          id: 'overdue',
          label: lang === 'en' ? 'Overdue' : 'मुदत उलटली',
          colorClass: 'bg-rose-50 text-rose-755 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900 animate-pulse',
        };
      }
    }

    return {
      id: 'pending',
      label: lang === 'en' ? 'Pending' : 'प्रलंबित',
      colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/10 dark:text-amber-500 dark:border-amber-900/40',
    };
  };

  const getWhatsAppReminderMessage = (studentName: string, courseName: string, balance: number) => {
    const defaultMsg = `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

हा *दिप्स कॉम्प्युटर्स* कडून एक नम्र आठवण संदेश आहे. 💡

तुमच्या *[कोर्सचे नाव]* या कोर्सची थकीत फी *₹[थकीत रक्कम]* जमा करणे प्रलंबित आहे.

कृपया आपल्या सोयीनुसार लवकरात लवकर सदर शुल्क फी जमा करावी जेणेकरून तुमचा अभ्यासक्रम विनाअडथळा सुरू राहील.

मदत किंवा अधिक माहितीसाठी संपर्क साधू शकता.

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.

📞 संपर्क: 9049102035 / 8888732035
*धन्यवाद!* 😊`;
    const baseTemplate = settings?.whatsAppReminderTemplate || defaultMsg;
    return baseTemplate
      .replace(/\[विद्यार्थ्याचे नाव\]/g, studentName)
      .replace(/\[कोर्सचे नाव\]/g, courseName)
      .replace(/\[थकीत रक्कम\]/g, balance.toLocaleString());
  };

  const sendWhatsAppReminderMsg = (mobile: string, name: string, course: string, balance: number) => {
    const cleanPhone = mobile.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(getWhatsAppReminderMessage(name, course, balance))}`;
    window.open(whatsappUrl, '_blank');
  };
  
  // Installment adding states
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [instAmt, setInstAmt] = useState<number>(1000);
  const [instDate, setInstDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [instMethod, setInstMethod] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>('Cash');

  const handleAddInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (instAmt <= 0) {
      alert(lang === 'en' ? 'Installment must be greater than 0' : 'हप्त्याची रक्कम ० पेक्षा जास्त असावी');
      return;
    }
    if (instAmt > selectedStudent.balanceFees) {
      alert(lang === 'en' ? 'Amt exceeds final remaining due balance!' : 'रक्कम उर्वरित देय बाकीपेक्षा जास्त आहे!');
      return;
    }

    onAddInstallment(selectedStudent.id, {
      amount: Number(instAmt),
      paymentDate: instDate,
      paymentMethod: instMethod
    });

    // Reset values
    setInstAmt(1000);
    setShowInstallmentModal(false);
  };
  
  // Queries
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [showOnlyWithDues, setShowOnlyWithDues] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Student>('balanceFees');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination Pages
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Next Installment Due calculations (Mocked for easy oversight)
  const getNextInstallmentDetails = (student: Student) => {
    if (student.balanceFees <= 0) return null;
    const nextNo = student.installments.length + 1;
    
    let suggestedDateStr = student.nextInstallmentDate;
    if (!suggestedDateStr) {
      // Calculate 30 days after the last installment or admission date
      const referenceDateStr = student.installments.length > 0 
        ? student.installments[student.installments.length-1].paymentDate 
        : student.admissionDate;

      const refDate = new Date(referenceDateStr);
      refDate.setDate(refDate.getDate() + 30);
      suggestedDateStr = refDate.toISOString().split('T')[0];
    }
    
    return {
      installmentNo: nextNo,
      suggestedAmount: Math.min(2000, student.balanceFees),
      suggestedDueDate: suggestedDateStr
    };
  };

  // Aggregated summaries
  const totalFeesExpected = students.reduce((acc, curr) => acc + curr.totalFees, 0);
  const totalFeesReceived = students.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalFeesPending = students.reduce((acc, curr) => acc + curr.balanceFees, 0);

  // Sorting
  const handleSort = (field: keyof Student) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Pipeline filter
  const processedFees = useMemo(() => {
    return students
      .filter(item => {
        const matchesSearch = 
          item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.mobile.includes(searchTerm) || 
          item.village.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse ? item.course === selectedCourse : true;
        const matchesVillage = selectedVillage ? item.village === selectedVillage : true;
        const matchesDues = showOnlyWithDues ? item.balanceFees > 0 : true;
        return matchesSearch && matchesCourse && matchesVillage && matchesDues;
      })
      .sort((a,b) => {
        const aVal = String(a[sortBy]);
        const bVal = String(b[sortBy]);
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      });
  }, [students, searchTerm, selectedCourse, selectedVillage, showOnlyWithDues, sortBy, sortOrder]);

  const totalItems = processedFees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedFees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedFees.slice(startIndex, startIndex + itemsPerPage);
  }, [processedFees, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // CSV Spreadsheet Export
  const exportToExcel = () => {
    const headers = "ID,Student Name,Selected Course,Gross Total Fees,Paid Total Fees,Net Remaining Due\n";
    const dataRows = students.map(s => (
      `"${s.id}","${s.fullName}","${s.course}",${s.totalFees},${s.paidAmount},${s.balanceFees}`
    )).join("\n");
    
    const blob = new Blob([headers + dataRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DIPS_Fee_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary Page
  const exportToPDFAndPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataRows = students.map(s => `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${s.fullName}</td>
        <td style="border:1px solid #ddd; padding:8px;">${s.course}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace;">₹${s.totalFees}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace; color:green;">₹${s.paidAmount}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace; color:red;">₹${s.balanceFees}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>DIPs Computers Outstanding Balance Summary Ledger</title>
          <style>body{font-family:sans-serif; padding:15px;} table{width:100%; border-collapse:collapse; margin-top:15px;} th{background:#3182ce; color:white; border:1px solid #ddd; padding:10px;}</style>
        </head>
        <body>
          <h2>DIPs Computers, Shirpur Jain</h2>
          <p>Oustanding Students Payment Matrix List</p>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Gross Fees</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
              </tr>
            </thead>
            <tbody>
              ${dataRows}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">

      {/* A. VIEW INTRO TITLE BANNER */}
      <div>
        <h2 id="fees-header-title" className="text-xl font-bold text-gray-800">
          {lang === 'en' ? 'Fee Collections Control' : 'शुल्क प्रभार आणि जमा यादी (Fees Ledger)'}
        </h2>
        <p className="text-xs text-gray-400">
          {lang === 'en' 
            ? 'Oversee gross expected cash receipts, collect installments, print professional receipts' 
            : 'प्रवेश फी प्रभार पाहा, हप्ते जमा करा आणि अधिकृत पावती प्रिंट करा'}
        </p>
      </div>

      {/* B. RIBBON SUMMARIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase block font-semibold">{t.totalFees}</span>
            <span className="text-2xl font-black font-mono mt-1 block text-blue-600">₹{totalFeesExpected.toLocaleString()}</span>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between col-span-1">
          <div>
            <span className="text-xs text-gray-400 uppercase block font-semibold">{t.receivedFees}</span>
            <span className="text-2xl font-black font-mono mt-1 block text-emerald-600">₹{totalFeesReceived.toLocaleString()}</span>
          </div>
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between col-span-1">
          <div>
            <span className="text-xs text-gray-400 uppercase block font-semibold">{t.pendingFees}</span>
            <span className="text-2xl font-black font-mono mt-1 block text-rose-500">₹{totalFeesPending.toLocaleString()}</span>
          </div>
          <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center border border-rose-100">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* C. TOOLBAR PANELS */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              id="search-fees-box"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="विद्यार्थी नाव किंवा मोबाईल शोधा..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap"> 
            {/* Oustanding filter checkbox */}
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer font-bold select-none bg-rose-50/50 border border-rose-100 hover:bg-rose-50 px-3 py-2 rounded-lg transition shrink-0">
              <input
                id="checkbox-dues"
                type="checkbox"
                checked={showOnlyWithDues}
                onChange={e => setShowOnlyWithDues(e.target.checked)}
                className="rounded accent-red-600 cursor-pointer"
              />
              <span>{lang === 'en' ? 'Only Pending (बाकी फी)' : 'फक्त देय शिल्लक'}</span>
            </label>

            {/* Layout view controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border">
              <button
                id="btn-layout-fees-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
                title={t.listView}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                id="btn-layout-fees-card"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-white text-blue-600 shadow' : 'text-gray-500'}`}
                title={t.cardView}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Sorter triggers */}
            <button
              id="btn-fees-xls"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition"
              title="Download accounting report"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              id="btn-fees-pdf"
              onClick={exportToPDFAndPrint}
              className="flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 font-bold border border-sky-200 rounded-lg px-3 py-2 hover:bg-sky-100 transition"
              title="Print gross fees due"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print List</span>
            </button>
          </div>

        </div>

        {/* Dropdowns filters */}
        <div id="filter-selects" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-3.5 text-xs text-gray-600">
          
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="font-extrabold text-[10px] uppercase tracking-wider">{lang === 'en' ? 'Filter Ledgers' : 'लेजर फिल्टर'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
            <div className="w-full sm:w-56">
              <select
                id="filter-fees-course"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-lg p-2 h-10 px-3 cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-medium transition duration-200"
              >
                <option value="">-- {t.filterCourse} --</option>
                {activeCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-full sm:w-56">
              <select
                id="filter-fees-village"
                value={selectedVillage}
                onChange={e => setSelectedVillage(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-lg p-2 h-10 px-3 cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-medium transition duration-200"
              >
                <option value="">-- {t.filterVillage} --</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* D. RESULTS GRID / TABLE */}
      {processedFees.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400 font-medium">
          <Clock className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p>{t.noData}</p>
        </div>
      ) : viewMode === 'list' ? (
        
        /* 1. LIST VIEW TABLE */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table id="fees-registry-table" className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-3.5">Student Photo</th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-250 select-none" onClick={() => handleSort('fullName')}>
                     Student Name
                  </th>
                  <th className="p-3 text-right">Total Fee</th>
                  <th className="p-3 text-right text-emerald-700">Paid Fee</th>
                  <th className="p-3 text-right text-red-600 cursor-pointer hover:bg-gray-250 select-none" onClick={() => handleSort('balanceFees')}>
                    <div className="flex items-center justify-end gap-1">Balance Due <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-3 text-center">Receipts Count</th>
                  <th className="p-3.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedFees.map(stud => (
                  <tr key={stud.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3.5">
                      <img src={stud.photo} className="h-9 w-9 object-cover rounded-full border shadow-sm" referrerPolicy="no-referrer" />
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{stud.fullName}</div>
                      <div className="text-[10px] text-[#63b3ed] font-bold font-mono uppercase mt-0.5">{stud.course}</div>
                    </td>
                    <td className="p-3 text-right font-medium font-mono">₹{stud.totalFees.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 font-mono">₹{stud.paidAmount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      {stud.balanceFees > 0 ? (
                        <div className="space-y-1 text-right">
                          <span className="text-rose-600 block">₹{stud.balanceFees.toLocaleString()}</span>
                          {(() => {
                            const statusObj = getFinancialStatus(stud);
                            return (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${statusObj.colorClass}`}>
                                {statusObj.label}
                              </span>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="inline-flex bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-sans">Fulfilled</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-gray-500">
                      {stud.installments.length}
                    </td>
                    <td className="p-3 text-right text-xs">
                      <div className="flex items-center gap-1.5 justify-end">
                        {stud.balanceFees > 0 ? (
                          <>
                            <button
                              id={`btn-add-inst-list-${stud.id}`}
                              onClick={() => {
                                setSelectedStudent(stud);
                                setInstAmt(Math.min(2000, stud.balanceFees));
                                setInstMethod('Cash');
                                setInstDate(new Date().toISOString().split('T')[0]);
                                setShowInstallmentModal(true);
                              }}
                              className="h-8 w-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
                              title={lang === 'en' ? 'Add Installment' : 'हप्ता भरा'}
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              id={`btn-remind-fees-list-${stud.id}`}
                              onClick={() => {
                                setWhatsAppModalData({
                                  fullName: stud.fullName,
                                  course: stud.course,
                                  balance: stud.balanceFees,
                                  mobile: stud.mobile
                                });
                              }}
                              className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                              title={lang === 'en' ? 'Send WhatsApp payment reminder' : 'शुल्क भरण्याबाबत स्मरणपत्र पाठवा'}
                            >
                              <MessageCircle className="h-4 w-4 fill-current" />
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-1 rounded-sm uppercase font-extrabold tracking-wider font-sans shrink-0">
                            {lang === 'en' ? 'Paid' : 'पूर्ण'}
                          </span>
                        )}
                        <button
                          id={`btn-view-fees-${stud.id}`}
                          onClick={() => setSelectedStudent(stud)}
                          className="h-8 w-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
                          title={t.view}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* 2. CARD WRAPPER */
        <div id="fees-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedFees.map(stud => (
            <div key={stud.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              
              <div className="p-4 border-b bg-gray-50/50 flex gap-3 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src={stud.photo} className="h-9 w-9 object-cover rounded-full border shadow-sm" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-extrabold text-gray-800 text-sm leading-tight">{stud.fullName}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{stud.course}</div>
                  </div>
                </div>
                {(() => {
                  const statusObj = getFinancialStatus(stud);
                  return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border shadow-2xs ${statusObj.colorClass}`}>
                      {statusObj.label}
                    </span>
                  );
                })()}
              </div>

              <div className="p-4 space-y-2 text-xs font-mono text-gray-500">
                <div className="flex justify-between">
                  <span className="font-sans">Total Course fee:</span>
                  <span className="text-gray-900 font-bold">₹{stud.totalFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-emerald-600">Total Paid quota:</span>
                  <strong className="text-emerald-700 font-bold">₹{stud.paidAmount}</strong>
                </div>
                <div className="flex justify-between border-t border-dashed pt-1.5">
                  <span className="font-sans text-rose-500">Pending Balance:</span>
                  <strong className="text-rose-600 font-extrabold text-sm">₹{stud.balanceFees}</strong>
                </div>
              </div>

              <div className="p-3 bg-gray-50 flex justify-end gap-1.5 text-xs border-t">
                {stud.balanceFees > 0 ? (
                  <>
                    <button
                      id={`btn-card-add-inst-${stud.id}`}
                      onClick={() => {
                        setSelectedStudent(stud);
                        setInstAmt(Math.min(2000, stud.balanceFees));
                        setInstMethod('Cash');
                        setInstDate(new Date().toISOString().split('T')[0]);
                        setShowInstallmentModal(true);
                      }}
                      className="h-8 w-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
                      title={lang === 'en' ? 'Add Installment' : 'हप्ता भरा'}
                    >
                      <CreditCard className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-card-remind-${stud.id}`}
                      onClick={() => {
                        setWhatsAppModalData({
                          fullName: stud.fullName,
                          course: stud.course,
                          balance: stud.balanceFees,
                          mobile: stud.mobile
                        });
                      }}
                      className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                      title={lang === 'en' ? 'Send WhatsApp payment reminder' : 'शुल्क भरण्याबाबत स्मरणपत्र पाठवा'}
                    >
                      <MessageCircle className="h-4 w-4 fill-current" />
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                    {lang === 'en' ? 'Fully Paid' : 'पूर्ण भरली'}
                  </span>
                )}
                <button
                  id={`btn-card-fees-${stud.id}`}
                  onClick={() => setSelectedStudent(stud)}
                  className="h-8 w-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
                  title={t.view}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* E. PAGINATION ROW */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm select-none">
          <p className="text-xs text-gray-500">
            Showing <strong className="font-mono">{((currentPage-1)*itemsPerPage)+1}</strong> to <strong className="font-mono">{Math.min(currentPage*itemsPerPage, totalItems)}</strong> of <strong className="font-mono">{totalItems}</strong> entries
          </p>
          <div className="flex items-center gap-2">
            <button
              id="btn-fees-prev-page"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-600">
              Page <strong className="font-mono">{currentPage}</strong> of <strong className="font-mono">{totalPages}</strong>
            </span>
            <button
              id="btn-fees-next-page"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* F. STUDENT FEES PROFILE DETAIL DIALOG */}
      {selectedStudent && (
        (() => {
          const activeStudent = students.find(s => s.id === selectedStudent.id) || selectedStudent;
          return (
            <div id="fees-detail-backdrop" className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
              <div id="fees-detail-card" className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                
                <div className="bg-[#1a202c] text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="font-bold text-sm tracking-wider uppercase">Student Ledger Audit Sheet &bull; {activeStudent.id}</span>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Dossier info */}
                <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 flex-1">
                  
                  {/* Profile card summary */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <img src={activeStudent.photo} className="h-14 w-14 object-cover rounded-xl border" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-base text-gray-900 leading-tight">{activeStudent.fullName}</h4>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        Course Program: <span className="text-blue-600 font-semibold uppercase">{activeStudent.course}</span> &bull; Phone: {activeStudent.mobile}
                      </div>
                    </div>
                  </div>

                  {/* Accounting details Box */}
                  <div className="bg-gray-50 border p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-xs text-gray-500 uppercase tracking-wide">Account Invoicing Balances</h5>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center rounded border bg-white p-2.5">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">{t.courseFees}</span>
                        <span className="font-mono font-bold text-gray-800 block mt-0.5">₹{activeStudent.totalFees.toLocaleString()}</span>
                      </div>
                      <div className="text-center rounded border bg-white p-2.5">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Paid To Date</span>
                        <span className="font-mono font-bold text-emerald-600 block mt-0.5">₹{activeStudent.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-center rounded border bg-white p-2.5">
                        <span className="text-[10px] text-gray-400 block uppercase font-medium">Balance Liability</span>
                        <span className="font-mono font-bold text-rose-600 block mt-0.5">₹{activeStudent.balanceFees.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next installment details calculations */}
                  {activeStudent.balanceFees > 0 ? (
                    (() => {
                      const details = getNextInstallmentDetails(activeStudent);
                      if (!details) return null;
                      return (
                        <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-lg flex items-start gap-2 text-xs text-orange-800">
                          <AlertCircle className="h-4.5 w-4.5 text-orange-600 shrink-0 mt-0.5 animate-bounce" />
                          <div>
                            <strong className="block text-orange-800 font-extrabold uppercase tracking-wide">Next Installment due (हप्ता अनुमान)</strong>
                            <div className="mt-1 leading-relaxed">
                              The next installment <strong className="font-mono">#{details.installmentNo}</strong> of minimum <strong className="font-mono text-gray-900 font-extrabold">₹{details.suggestedAmount.toLocaleString()}</strong> is proposed to be paid on or before <strong className="font-mono text-gray-900 font-bold">{formatDate(details.suggestedDueDate)}</strong>.
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle className="h-5 w-5 text-emerald-600 animate-pulse" />
                      <div>
                        <strong className="block text-emerald-800">This account has completely paid all program dues successfully!</strong>
                      </div>
                    </div>
                  )}

                  {/* Installment History list */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-[#3182ce] uppercase text-xs tracking-wider border-l-4 border-l-blue-500 pl-2">
                      Receipt Invoices Index
                    </h5>
                    <div className="border rounded-xl bg-white overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-gray-100 font-bold text-gray-700 uppercase text-[9px]">
                          <tr>
                            <th className="p-3 text-center">Inst No</th>
                            <th className="p-3 text-right">Amount Paid</th>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3 font-mono">Receipt No</th>
                            <th className="p-3">Method</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-gray-600">
                          {activeStudent.installments.map((inst, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="p-3 text-center font-bold text-gray-800">#{inst.installmentNo}</td>
                              <td className="p-3 text-right font-mono font-bold text-gray-900">₹{inst.amount.toLocaleString()}</td>
                              <td className="p-3 font-mono text-gray-500">{formatDate(inst.paymentDate)}</td>
                              <td className="p-3 font-semibold font-mono text-gray-700">{inst.receiptNo}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-50 text-gray-700 border">
                                  {inst.paymentMethod || 'UPI'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  id={`btn-ledger-receipt-${inst.receiptNo}`}
                                  onClick={() => onTriggerReceipt(activeStudent, inst)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-md transition-all shadow-xs active:scale-95"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  <span>Print / View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Footer with reactive buttons */}
                <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center gap-2 text-xs">
                  <div>
                    {activeStudent.balanceFees > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-fees-modal-add-inst"
                          onClick={() => {
                            setInstAmt(Math.min(2000, activeStudent.balanceFees));
                            setInstMethod('Cash');
                            setInstDate(new Date().toISOString().split('T')[0]);
                            setShowInstallmentModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{lang === 'en' ? 'Add Installment' : 'हप्ता जमा करा'}</span>
                        </button>
                        <button
                          id="btn-fees-modal-remind"
                          onClick={() => {
                            setWhatsAppModalData({
                              fullName: activeStudent.fullName,
                              course: activeStudent.course,
                              balance: activeStudent.balanceFees,
                              mobile: activeStudent.mobile
                            });
                          }}
                          className="bg-[#e6fffa] hover:bg-emerald-600 text-teal-850 hover:text-white border border-teal-200 hover:border-emerald-600 font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow cursor-pointer"
                          title={lang === 'en' ? 'Send WhatsApp payment reminder' : 'शुल्क भरण्याबाबत स्मरणपत्र पाठवा'}
                        >
                          <MessageCircle className="h-4 w-4 fill-current" />
                          <span>{lang === 'en' ? 'Send Reminder' : 'स्मरणपत्र पाठवा'}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-extrabold text-xs uppercase block bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                        {lang === 'en' ? 'Fully Paid' : 'सर्व फी जमा झाली'}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-fees-close-modal"
                    onClick={() => setSelectedStudent(null)}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-4 py-2 rounded-lg transition"
                  >
                    {t.close}
                  </button>
                </div>

              </div>
            </div>
          );
        })()
      )}

      {/* G. SUB-MODAL: COLLECT NEW INSTALLMENT FEES */}
      {showInstallmentModal && selectedStudent && (
        (() => {
          const activeStudent = students.find(s => s.id === selectedStudent.id) || selectedStudent;
          return (
            <div id="inst-form-backdrop" className="fixed inset-0 z-52 bg-black/70 p-4 flex items-center justify-center backdrop-blur-sm">
              <div id="inst-form-card" className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-[#e6fffa] border-b border-[#b2f5ea] px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 font-bold text-teal-800 text-sm">
                    <CreditCard className="h-4.5 w-4.5 text-teal-600 animate-pulse" />
                    <span>{lang === 'en' ? 'Submit Fee Installment' : 'हप्ता जमा करा (Collect Fees)'}</span>
                  </div>
                  <button onClick={() => setShowInstallmentModal(false)} className="text-gray-400 hover:text-gray-700 font-bold p-1 leading-none text-xl">&times;</button>
                </div>

                <form onSubmit={handleAddInstallmentSubmit} className="p-5 space-y-4 text-sm text-gray-700">
                  <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-4 text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wider shrink-0">Name:</span>
                      <span className="font-extrabold text-gray-950 text-right break-words max-w-[200px]">{activeStudent.fullName}</span>
                    </div>
                    <div className="border-t border-gray-200/60" />
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-wider shrink-0">Outstanding Balance:</span>
                      <span className="font-black font-mono text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md shadow-sm">
                        ₹{activeStudent.balanceFees.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Installment Amount Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">{lang === 'en' ? 'Amount Paid' : 'जमा केलेली रक्कम'} (₹) <span className="text-red-500">*</span></label>
                    <input
                      id="form-inst-amt"
                      type="number"
                      min={1}
                      max={activeStudent.balanceFees}
                      value={instAmt}
                      onChange={e => setInstAmt(Number(e.target.value))}
                      className="w-full text-base border-2 border-teal-200 bg-teal-50/10 p-2.5 rounded-lg outline-none font-bold font-mono text-teal-700 focus:border-teal-400"
                      required
                    />
                  </div>

                  {/* Installment Date Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">{lang === 'en' ? 'Payment Date' : 'भरणा तारीख'}</label>
                    <input
                      id="form-inst-date"
                      type="date"
                      value={instDate}
                      onChange={e => setInstDate(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg font-mono outline-none"
                      required
                    />
                  </div>

                  {/* Payment Method Option */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">{lang === 'en' ? 'Payment Method' : 'पेमेंट पद्धत'}</label>
                    <select
                      id="form-inst-method"
                      value={instMethod}
                      onChange={e => setInstMethod(e.target.value as any)}
                      className="w-full text-sm bg-white border p-2.5 rounded-lg outline-none"
                    >
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Form trigger buttons */}
                  <div className="pt-4 flex justify-end gap-2 border-t">
                    <button
                      id="btn-inst-form-cancel"
                      type="button"
                      onClick={() => setShowInstallmentModal(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs animate-pulse-none"
                    >
                      {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                    </button>
                    <button
                      id="btn-inst-form-save"
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow"
                    >
                      {lang === 'en' ? 'Confirm Deposit' : 'भरणा निश्चित करा'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          );
        })()
      )}

      {/* WHATSAPP CONFIRMATION PREVIEW & SEND MODAL */}
      {whatsAppModalData && (
        <div id="wa-ledger-reminder-backdrop" className="fixed inset-0 z-55 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
          <div id="wa-ledger-reminder-card" className="bg-[#f0f2f5] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            
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
                className="text-white hover:bg-white/10 p-1 rounded transition cursor-pointer"
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
                  {getWhatsAppReminderMessage(whatsAppModalData.fullName, whatsAppModalData.course, whatsAppModalData.balance)}
                  <p className="text-right text-[8px] text-gray-400 font-mono mt-1 font-bold font-sans">10:30 AM ✓✓</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  id="btn-wa-ledger-reminder-cancel"
                  onClick={() => setWhatsAppModalData(null)}
                  className="bg-white border text-gray-700 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  id="btn-wa-ledger-reminder-send"
                  onClick={() => {
                    sendWhatsAppReminderMsg(whatsAppModalData.mobile, whatsAppModalData.fullName, whatsAppModalData.course, whatsAppModalData.balance);
                    setWhatsAppModalData(null);
                  }}
                  className="bg-[#00a884] hover:bg-[#00a37f] text-white font-extrabold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0 text-xs cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Send WhatsApp' : 'व्हॉट्सॲपवर पाठवा'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
