/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  UserCheck, 
  HelpCircle,
  MapPin,
  Calendar,
  Phone,
  UserPlus,
  X,
  FileCheck2,
  Minimize2,
  MessageCircle
} from 'lucide-react';
import { Enquiry, COURSES, VILLAGES, formatDate, InstituteSettings } from '../types';
import { Language, translations } from '../locales';

const getWhatsAppMessage = (studentName: string, courseName: string, customTemplate?: string) => {
  const template = customTemplate || `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

आज *दिप्स कॉम्प्युटर्स* सेंटरला भेट देऊन *[कोर्सचे नाव]*  या कोर्सच्या चौकशीसाठी आल्याबद्दल तुमचे मनःपूर्वक धन्यवाद!

तुम्हाला या कोर्सबद्दल दिलेली सर्व माहिती आणि बॅचच्या वेळा व्यवस्थित समजल्या असतील अशी आशा आहे. तुमचा प्रवेश निश्चित करण्यासाठी किंवा तुमच्या मनात अजून काही शंका असल्यास, तुम्ही याच नंबरवर मेसेज किंवा कॉल करून नक्की विचारू शकता.

लवकरात लवकर आपला प्रवेश निश्चित करा आणि तुमच्या उज्ज्वल करिअरची सुरुवात करा! ✨

📍 *आमचा पत्ता:*
बँक ऑफ महाराष्ट्रच्या मागे,
येवले कॉम्प्लेक्स, शिरपूर जैन,
ता. मालेगाव जि. वाशिम 444504

🌐 वेबसाईट: www.dipscomputers.in

📞 संपर्क:
👨🏼💼*दिपक मा. खंदारे (पाटील)*
📲 9049102035 / 8888732035

*धन्यवाद.* 🙏`;

  return template
    .replace(/\[विद्यार्थ्याचे नाव\]/g, studentName)
    .replace(/\[कोर्सचे नाव\]/g, courseName);
};

const sendWhatsAppMsg = (mobile: string, name: string, course: string, customTemplate?: string) => {
  const cleanedPhone = mobile.replace(/\D/g, '');
  const phoneWithCode = cleanedPhone.length === 10 ? '91' + cleanedPhone : cleanedPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(getWhatsAppMessage(name, course, customTemplate))}`;
  window.open(whatsappUrl, '_blank');
};

interface EnquiryViewProps {
  enquiries: Enquiry[];
  onAddEnquiry: (enq: Omit<Enquiry, 'id' | 'status'> & { AcademicYear?: string; CreatedDate?: string; UpdatedDate?: string }) => void;
  onUpdateEnquiry: (id: string, updated: Partial<Enquiry>) => void;
  onDeleteEnquiry: (id: string) => void;
  onConvertToAdmission: (enq: Enquiry) => void;
  lang: Language;
  courses?: string[];
  settings?: InstituteSettings;
  selectedYear?: string;
  academicYears?: string[];
}

export default function EnquiryView({
  enquiries,
  onAddEnquiry,
  onUpdateEnquiry,
  onDeleteEnquiry,
  onConvertToAdmission,
  lang,
  courses,
  settings,
  selectedYear,
  academicYears
}: EnquiryViewProps) {
  const t = translations[lang];

  const activeCourses = courses || COURSES;

  // Component UI State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ fullName: string; course: string; mobile: string } | null>(null);

  // Query States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [sortBy, setSortBy] = useState<keyof Enquiry>('enquiryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination Details
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // New Form Fields
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formVillage, setFormVillage] = useState('Shirpur Jain');
  const [formCourse, setFormCourse] = useState('MS-CIT');
  const [formReferral, setFormReferral] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formAcademicYear, setFormAcademicYear] = useState(selectedYear || '2026');

  // Auto-sync academic year when prop changes or editing mode initializes
  React.useEffect(() => {
    if (editingEnquiry) {
      setFormAcademicYear(editingEnquiry.AcademicYear || selectedYear || '2026');
    } else {
      setFormAcademicYear(selectedYear || '2026');
    }
  }, [editingEnquiry, selectedYear]);

  // Listen for keyboard shortcut custom event to open Enquiry Form
  React.useEffect(() => {
    const handleTriggerEnquiryForm = () => {
      setEditingEnquiry(null);
      setFormName('');
      setFormMobile('');
      setFormVillage('Shirpur Jain');
      setFormCourse('MS-CIT');
      setFormReferral('');
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setFormNotes('');
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Focus Name Input
      setTimeout(() => {
        const nameInput = document.getElementById('form-enq-name');
        if (nameInput) nameInput.focus();
      }, 150);
    };

    window.addEventListener('shortcut-add-enquiry', handleTriggerEnquiryForm);
    return () => {
      window.removeEventListener('shortcut-add-enquiry', handleTriggerEnquiryForm);
    };
  }, []);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) {
      alert(lang === 'en' ? 'Please fill out Name and Mobile Number!' : 'कृपया नाव आणि मोबाईल नंबर भरा!');
      return;
    }

    if (editingEnquiry) {
      onUpdateEnquiry(editingEnquiry.id, {
        fullName: formName,
        mobile: formMobile,
        village: formVillage,
        course: formCourse,
        referralName: formReferral,
        enquiryDate: formDate,
        notes: formNotes,
        AcademicYear: formAcademicYear,
        UpdatedDate: new Date().toISOString()
      });
      setEditingEnquiry(null);
    } else {
      onAddEnquiry({
        fullName: formName,
        mobile: formMobile,
        village: formVillage,
        course: formCourse,
        referralName: formReferral || 'Self',
        enquiryDate: formDate,
        notes: formNotes,
        AcademicYear: formAcademicYear,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
      });

      // Auto-trigger WhatsApp preview dialog on new enquiry creation
      setWhatsAppModalData({
        fullName: formName,
        course: formCourse,
        mobile: formMobile
      });
    }

    // Reset items
    resetForm();
    setShowAddForm(false);
  };

  const handleEditInit = (enq: Enquiry) => {
    setEditingEnquiry(enq);
    setFormName(enq.fullName);
    setFormMobile(enq.mobile);
    setFormVillage(enq.village);
    setFormCourse(enq.course);
    setFormReferral(enq.referralName);
    setFormDate(enq.enquiryDate);
    setFormNotes(enq.notes || '');
    setFormAcademicYear(enq.AcademicYear || selectedYear || '2026');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormName('');
    setFormMobile('');
    setFormVillage('Shirpur Jain');
    setFormCourse('MS-CIT');
    setFormReferral('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormAcademicYear(selectedYear || '2026');
    setEditingEnquiry(null);
  };

  // Safe sorting comparator
  const handleSort = (field: keyof Enquiry) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search Pipelines
  const processedEnquiries = useMemo(() => {
    return enquiries
      .filter(item => {
        const matchesSearch = 
          item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.mobile.includes(searchTerm) || 
          item.village.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse ? item.course === selectedCourse : true;
        const matchesVillage = selectedVillage ? item.village === selectedVillage : true;
        return matchesSearch && matchesCourse && matchesVillage;
      })
      .sort((a, b) => {
        const aVal = String(a[sortBy]);
        const bVal = String(b[sortBy]);
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      });
  }, [enquiries, searchTerm, selectedCourse, selectedVillage, sortBy, sortOrder]);

  // Paginated Slices
  const totalItems = processedEnquiries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedEnquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [processedEnquiries, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // CSV Generator for Excel Exporter
  const exportToExcel = () => {
    const headers = "ID,Name,Contact,Village,Course,Date,Referral,Status,Notes\n";
    const dataRows = enquiries.map(enq => (
      `"${enq.id}","${enq.fullName}","${enq.mobile}","${enq.village}","${enq.course}","${enq.enquiryDate}","${enq.referralName}","${enq.status}","${enq.notes || ''}"`
    )).join("\n");
    
    const blob = new Blob([headers + dataRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DIPS_Enquiry_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable HTML Window Launcher
  const exportToPDFAndPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = enquiries.map(e => `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${e.fullName}</td>
        <td style="border:1px solid #ddd; padding:8px;">${e.mobile}</td>
        <td style="border:1px solid #ddd; padding:8px;">${e.village}</td>
        <td style="border:1px solid #ddd; padding:8px;">${e.course}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace;">${formatDate(e.enquiryDate)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${e.status.toUpperCase()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>DIPs Computers Admission Enquiry Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; margin:30px; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th { background-color:#3182ce; color:white; border:1px solid #ddd; padding:8px; text-align:left; }
            h2 { color:#2b6cb0; margin-bottom:5px; }
          </style>
        </head>
        <body>
          <h2>DIPs Computers</h2>
          <p>Shirpur Jain &bull; Contact: 9049102035 / 8888732035</p>
          <hr />
          <h3>Admission Enquiry Reports (${formatDate(new Date().toISOString().split('T')[0])})</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Mobile</th>
                <th>Village</th>
                <th>Course</th>
                <th>Enquiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <p style="margin-top:40px; font-size:12px; text-align:right;">Authorized Signature</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">

      {/* A. TITLE BAR BAR & FORM TRIGGER COUPLING */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 id="enquiry-brand-header" className="text-xl font-bold text-gray-800">
            {lang === 'en' ? 'Admission Enquiries' : 'प्रवेश मिळवण्यासाठी चौकशी यादी'}
          </h2>
          <p className="text-xs text-gray-400">
            {lang === 'en' 
              ? 'Record, follow up, and register prospective student enquiries' 
              : 'विद्यार्थी चौकशीची नोंद ठेवा, पाठपुरावा करा आणि प्रवेशात रूपांतर करा'}
          </p>
        </div>
        
        <button
          id="btn-toggle-add-form"
          onClick={() => {
            if (showAddForm) resetForm();
            setShowAddForm(!showAddForm);
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold shadow transition active:scale-95 text-white ${showAddForm ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#3182ce] hover:bg-[#2b6cb0]'}`}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showAddForm ? t.close : (lang === 'en' ? 'Add Enquiry' : 'नवीन चौकशी नोंदवा')}</span>
          {!showAddForm && (
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[9px] font-mono bg-blue-700/50 text-blue-100 rounded border border-blue-400/30">Ctrl+N</kbd>
          )}
        </button>
      </div>

      {/* B. ADD / EDIT DYNAMIC ENTRY FORM SLIDER */}
      {showAddForm && (
        <fieldset id="field-enquiry-form" className="bg-white rounded-xl border-t-4 border-t-blue-500 border border-gray-200 p-6 shadow-sm">
          <legend className="px-3 text-sm font-extrabold text-[#3182ce] uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-blue-500" />
            {editingEnquiry ? (lang === 'en' ? 'Edit Enquiry Details' : 'चौकशी दुरुस्त करा') : (lang === 'en' ? 'Enquiry Entry Sheet' : 'नवीन चौकशी नोंदणी अर्ज')}
          </legend>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            
            {/* Field 1: Full name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.fullName} <span className="text-red-500">*</span></label>
              <input
                id="form-enq-name"
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="उदा. अमित श्रीकृष्ण जोशी"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Field 2: Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.mobile} <span className="text-red-500">*</span></label>
              <input
                id="form-enq-phone"
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={formMobile}
                onChange={e => setFormMobile(e.target.value)}
                placeholder="904910XXXX"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                required
              />
            </div>

            {/* Field 3: Village */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.village} <span className="text-red-500">*</span></label>
              <input
                id="form-enq-village"
                type="text"
                value={formVillage}
                onChange={e => setFormVillage(e.target.value)}
                list="enq-villages-datalist"
                placeholder={lang === 'en' ? 'Type or select Village/Town' : 'गाव / शहर लिहा किंवा निवडा'}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                required
              />
              <datalist id="enq-villages-datalist">
                {VILLAGES.map(v => <option key={v} value={v} />)}
                <option value="Washim Rural" />
                <option value="Malegaon Rural" />
              </datalist>
            </div>

            {/* Field 4: Course */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.course}</label>
              <select
                id="form-enq-course"
                value={formCourse}
                onChange={e => setFormCourse(e.target.value)}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
              >
                {activeCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Field 5: Referral */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.referral}</label>
              <input
                id="form-enq-referral"
                type="text"
                value={formReferral}
                onChange={e => setFormReferral(e.target.value)}
                placeholder="Self, Alumni name etc."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Field 6: Enquiry Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.enquiryDate}</label>
              <input
                id="form-enq-date"
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 font-mono outline-none"
              />
            </div>

            {/* Field 6b: Academic Year Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{lang === 'en' ? 'Academic Year' : 'शैक्षणिक वर्ष'}</label>
              <select
                id="form-enq-ac-year"
                value={formAcademicYear}
                onChange={e => setFormAcademicYear(e.target.value)}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-2.5 outline-none focus:border-blue-500 font-semibold"
              >
                {(academicYears || ['2026', '2027', '2028', '2029']).map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Field 7: Notes */}
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs font-bold text-gray-600 block">{t.notes}</label>
              <textarea
                id="form-enq-notes"
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="Interested inside morning batches starting next Monday..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outline-none h-20"
              />
            </div>

            {/* Action buttons inside form */}
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                id="btn-enq-cancel"
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="px-4 py-2.5 text-xs font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition"
              >
                {t.close}
              </button>
              <button
                id="btn-enq-save"
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-[#3182ce] hover:bg-[#2b6cb0] text-white rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{editingEnquiry ? t.save : (lang === 'en' ? 'Submit Enquiry' : 'नोंदणी करा')}</span>
                <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-mono bg-blue-700/50 text-blue-100 rounded border border-blue-400/30">Ctrl+S</kbd>
              </button>
            </div>

          </form>
        </fieldset>
      )}

      {/* C. SEARCH BAR, INTERACTIVE FILTERS & VIEWS CAP */}
      <div id="filter-wrapper" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        
        {/* Row 1: Search and Grid Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div id="search-input-capsule" className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              id="search-enq-box"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
            {/* View layout toggles */}
            <div id="layout-toggle-pills" className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
              <button
                id="btn-layout-enq-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-550 hover:text-gray-800'}`}
                title={t.listView}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                id="btn-layout-enq-card"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-white text-blue-600 shadow' : 'text-gray-550 hover:text-gray-800'}`}
                title={t.cardView}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Standard Exporters */}
            <button
              id="btn-enq-xls"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition"
              title="Export to CSV"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">{t.exportExcel}</span>
            </button>
            <button
              id="btn-enq-pdf"
              onClick={exportToPDFAndPrint}
              className="flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 font-bold border border-sky-200 rounded-lg px-3 py-2 hover:bg-sky-100 transition"
              title="Generate PDF Report"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{t.print}</span>
            </button>
          </div>

        </div>

        {/* Row 2: Select Filters */}
        <div id="filter-selects" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-3.5 text-xs">
          
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="font-extrabold text-[10px] uppercase tracking-wider">{lang === 'en' ? 'Filters' : 'फिल्टर्स'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
            <div className="w-full sm:w-56">
              <select
                id="filter-enq-course"
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
                id="filter-enq-village"
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

      {/* D. RESULTS: CARD VIEW VS LIST VIEW */}
      {processedEnquiries.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400 font-medium">
          <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p>{t.noData}</p>
        </div>
      ) : viewMode === 'list' ? (
        
        /* 1. LIST VIEW OF TABLE */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table id="enquiry-list-table" className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1">
                      Student Name <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('village')}>
                    <div className="flex items-center gap-1">
                      Village <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('course')}>
                    <div className="flex items-center gap-1">
                      Course <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('enquiryDate')}>
                    <div className="flex items-center gap-1">
                      Enquiry Date <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEnquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-800">{enq.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">Ref: {enq.referralName}</div>
                    </td>
                    <td className="p-3.5 font-mono font-medium text-gray-600">{enq.mobile}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {enq.village}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700">
                        {enq.course}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 font-mono text-xs">{formatDate(enq.enquiryDate)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          id={`btn-wa-enq-${enq.id}`}
                          onClick={() => setWhatsAppModalData({ fullName: enq.fullName, course: enq.course, mobile: enq.mobile })}
                          className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                          title={lang === 'en' ? 'Send WhatsApp Message' : 'व्हॉट्सॲपवर मेसेज पाठवा'}
                        >
                          <MessageCircle className="h-4 w-4 fill-current" />
                        </button>
                        <button
                          id={`btn-view-enq-${enq.id}`}
                          onClick={() => setSelectedEnquiry(enq)}
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
        
        /* 2. CARD VIEW OF CARDS */
        <div id="enquiry-card-view-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEnquiries.map(enq => (
            <div key={enq.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-800 text-sm line-clamp-1">{enq.fullName}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{enq.id}</div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-orange-100 text-orange-700 tracking-wide">
                  Enquiry
                </span>
              </div>

              <div className="p-4 space-y-2.5 text-xs text-gray-500 flex-1">
                <div className="flex justify-between">
                  <span>Course Wanted:</span>
                  <strong className="text-gray-800 font-bold">{enq.course}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Phone:</span>
                  <strong className="text-gray-800">{enq.mobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Village / Area:</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-400" />
                    {enq.village}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Date:</span>
                  <span>{formatDate(enq.enquiryDate)}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 flex justify-end gap-1.5 text-xs border-t">
                <button
                  id={`btn-card-wa-enq-${enq.id}`}
                  onClick={() => setWhatsAppModalData({ fullName: enq.fullName, course: enq.course, mobile: enq.mobile })}
                  className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                  title={lang === 'en' ? 'Send WhatsApp Message' : 'व्हॉट्सॲप मेसेज'}
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                </button>
                <button
                  id={`btn-card-view-enq-${enq.id}`}
                  onClick={() => setSelectedEnquiry(enq)}
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
        <div id="enq-pagination-bar" className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm select-none">
          <p className="text-xs text-gray-500">
            Showing <strong className="font-mono">{((currentPage-1)*itemsPerPage)+1}</strong> to <strong className="font-mono">{Math.min(currentPage*itemsPerPage, totalItems)}</strong> of <strong className="font-mono">{totalItems}</strong> entries
          </p>
          <div className="flex items-center gap-2">
            <button
              id="btn-enq-prev-page"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-700 font-semibold">
              Page <strong className="font-mono">{currentPage}</strong> of <strong className="font-mono">{totalPages}</strong>
            </span>
            <button
              id="btn-enq-next-page"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* F. STUDENT ENQUIRY PROFILE MODAL DETAIL PAGE */}
      {selectedEnquiry && (
        <div id="enq-detail-backdrop" className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
          <div id="enq-detail-card" className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden relative">
            <div className="bg-[#1a202c] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-sm tracking-wider uppercase">Student Enquiry File #{selectedEnquiry.id}</span>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              
              {/* Profile Block */}
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-200">
                  {selectedEnquiry.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 leading-tight">{selectedEnquiry.fullName}</h4>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Lead Status: {selectedEnquiry.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase block font-medium">Course Requested:</span>
                  <span className="font-bold text-gray-800">{selectedEnquiry.course}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase block font-medium">Contact Mobile:</span>
                  <span className="font-semibold font-mono text-gray-800">{selectedEnquiry.mobile}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase block font-medium">Village/Town:</span>
                  <span className="font-semibold text-gray-800">{selectedEnquiry.village}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase block font-medium">Enquiry Date:</span>
                  <span className="font-semibold font-mono text-gray-800">{formatDate(selectedEnquiry.enquiryDate)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 uppercase block font-medium">Referral Name:</span>
                  <span className="font-medium text-gray-800">{selectedEnquiry.referralName}</span>
                </div>
                {selectedEnquiry.notes && (
                  <div className="col-span-2 bg-gray-50 border p-3 rounded-lg text-xs leading-relaxed">
                    <strong className="text-gray-700 block mb-1">Counsellor Notes:</strong>
                    {selectedEnquiry.notes}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="mt-8 border-t pt-5 flex flex-wrap gap-2 justify-end">
                <button
                  id="btn-enq-whatsapp-modal"
                  onClick={() => {
                    setWhatsAppModalData({
                      fullName: selectedEnquiry.fullName,
                      course: selectedEnquiry.course,
                      mobile: selectedEnquiry.mobile
                    });
                    setSelectedEnquiry(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title={lang === 'en' ? 'Send WhatsApp Message' : 'व्हॉट्सॲप मेसेज पाठवा'}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{lang === 'en' ? 'WhatsApp' : 'व्हॉट्सॲप संदेश'}</span>
                </button>
                <button
                  id="btn-enq-convert"
                  onClick={() => {
                    onConvertToAdmission(selectedEnquiry);
                    setSelectedEnquiry(null);
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t.convertToAdmission}</span>
                </button>
                <button
                  id="btn-enq-edit"
                  onClick={() => {
                    handleEditInit(selectedEnquiry);
                    setSelectedEnquiry(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2.5 rounded-lg transition"
                >
                  {t.edit}
                </button>
                <button
                  id="btn-enq-delete"
                  onClick={() => {
                    if (confirm(t.confirmDelete)) {
                      onDeleteEnquiry(selectedEnquiry.id);
                      setSelectedEnquiry(null);
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2.5 rounded-lg transition"
                >
                  {t.delete}
                </button>
                <button
                  id="btn-enq-close-diag"
                  onClick={() => setSelectedEnquiry(null)}
                  className="bg-gray-50 border hover:bg-gray-100 text-gray-600 text-xs font-bold px-3 py-2.5 rounded-lg transition"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* G. WHATSAPP CONFIRMATION PREVIEW & SEND MODAL */}
      {whatsAppModalData && (
        <div id="wa-preview-backdrop" className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
          <div id="wa-preview-card" className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden relative">
            
            {/* Top WhatsApp branded bar */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-[#128c7e] p-2 rounded-full text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wider uppercase">{lang === 'en' ? 'WhatsApp Notification' : 'व्हॉट्सॲप संदेश'}</h4>
                  <p className="text-[10px] text-emerald-100 font-medium">To: {whatsAppModalData.fullName} ({whatsAppModalData.mobile})</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppModalData(null)} 
                className="text-emerald-100 hover:text-white p-1 hover:bg-white/10 rounded transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <span className="text-xs text-gray-500 font-medium block">
                {lang === 'en' 
                  ? 'Review the message that will be sent via WhatsApp:' 
                  : 'विद्यार्थ्याला व्हॉट्सॲपवर पाठवण्यासाठी खालील मेसेजची खात्री करा:'}
              </span>

              {/* Chat-bubble container simulating a real WhatsApp chat window */}
              <div 
                className="p-4 rounded-xl relative border max-h-80 overflow-y-auto" 
                style={{ 
                  backgroundColor: '#efeae2', 
                  backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 0px)', 
                  backgroundSize: '16px 16px' 
                }}
              >
                <div className="bg-[#d9fdd3] text-[#111b21] p-3.5 rounded-lg shadow-xs max-w-[90%] text-xs whitespace-pre-wrap leading-relaxed font-sans ml-auto">
                  {getWhatsAppMessage(whatsAppModalData.fullName, whatsAppModalData.course, settings?.whatsAppTemplate)}
                </div>
              </div>

              {/* Send & Cancel buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  id="btn-wa-dismiss"
                  type="button"
                  onClick={() => setWhatsAppModalData(null)}
                  className="px-4 py-2.5 text-xs font-bold bg-gray-150 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                >
                  {t.close}
                </button>
                <button
                  id="btn-wa-trigger-send"
                  type="button"
                  onClick={() => {
                    sendWhatsAppMsg(whatsAppModalData.mobile, whatsAppModalData.fullName, whatsAppModalData.course, settings?.whatsAppTemplate);
                    setWhatsAppModalData(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-[#128c7e] hover:bg-[#075e54] text-white rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
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
