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
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Phone, 
  DollarSign, 
  X, 
  Image as ImageIcon,
  Camera,
  Upload,
  BookOpen,
  Award,
  CreditCard,
  Briefcase,
  AlertCircle,
  MessageCircle,
  Save
} from 'lucide-react';
import { Student, Installment, InstituteSettings, COURSES, VILLAGES, COURSE_FEES, PAYMENT_METHODS, formatDate } from '../types';
import { Language, translations } from '../locales';
import StudentDetailView from './StudentDetailView';

interface AdmissionViewProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'paidAmount' | 'balanceFees' | 'installments'> & { AcademicYear?: string; CreatedDate?: string; UpdatedDate?: string }, initialDeposit: number) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onAddInstallment: (studentId: string, installment: Omit<Installment, 'receiptNo' | 'installmentNo'> & { AcademicYear?: string }) => void;
  onTriggerReceipt: (student: Student, inst: Installment) => void;
  prefilledEnquiry: any | null;
  clearPrefill: () => void;
  lang: Language;
  courses?: string[];
  courseFees?: Record<string, number>;
  settings: InstituteSettings;
  autoOpenAddForm?: boolean;
  clearAutoOpenAddForm?: () => void;
  selectedYear?: string;
  academicYears?: string[];
}

const createAvatarSvg = (bgColor: string, accentColor: string, bodyColor: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="none"><rect width="240" height="240" rx="40" fill="${bgColor}"/><circle cx="120" cy="95" r="45" fill="${accentColor}"/><path d="M40 205 C 40 160, 200 160, 200 205 Z" fill="${bodyColor}"/><circle cx="120" cy="40" r="10" fill="${bodyColor}" opacity="0.15"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const AVATARS = [
  // General Neutral (Slate / Gray)
  createAvatarSvg('#F8FAFC', '#E2E8F0', '#64748B'),
  // Royal Blue boy/neutral theme
  createAvatarSvg('#EFF6FF', '#BFDBFE', '#2563EB'),
  // Smart Emerald (Intellectual theme)
  createAvatarSvg('#F0FDF4', '#BBF7D0', '#16A34A'),
  // Bright Orange/Amber 
  createAvatarSvg('#FFFBEB', '#FDE68A', '#D97706'),
  // Elegance Pink girl/neutral theme
  createAvatarSvg('#FDF2F8', '#FBCFE8', '#DB2777'),
  // Modern Indigo Group
  createAvatarSvg('#EEF2FF', '#C7D2FE', '#4F46E5')
];

// Helper to display/edit DOB cleanly
const convertToDisplayDOB = (dobStr: string): string => {
  if (!dobStr) return '';
  if (dobStr.includes('/')) return dobStr;
  const parts = dobStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY-MM-DD
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (parts[2].length === 4) { // DD-MM-YYYY
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
  }
  return dobStr;
};

const calculateNextMonthDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    const tempDate = new Date(year, month - 1, day);
    tempDate.setMonth(tempDate.getMonth() + 1);
    
    const yStr = tempDate.getFullYear();
    const mStr = String(tempDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(tempDate.getDate()).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  }
  return dateString;
};


const getWhatsAppAdmissionMessage = (studentName: string, courseName: string, customTemplate?: string) => {
  const defaultMsg = `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

मनापासून अभिनंदन! ✨

*दिप्स कॉम्प्युटर्स* मध्ये *[कोर्सचे नाव]* या कोर्ससाठी तुमचा प्रवेश यशस्वीरीत्या निश्चित झाला आहे. 🎓

आम्हाला अत्यंत आनंद आहे की तुम्ही तुमच्या उज्ज्वल भविष्यासाठी आणि तंत्रज्ञानाच्या प्रवासासाठी आमची निवड केली. आम्ही तुम्हाला सर्वोत्तम शिक्षण आणि मार्गदर्शन देण्यास कटिबद्ध आहोत.

📅 *बॅचच्या वेळेबद्दल* आणि इतर माहितीसाठी कृपया सेंटरशी संपर्क साधा किंवा उद्यापासून ठरलेल्या वेळेत बॅचला उपस्थित रहा.

📍 *पत्ता:* बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन
📞 संपर्क: 9049102035 / 8888732035

*तुमच्यापुढील शैक्षणिक वाटचालीस हार्दिक शुभेच्छा!* 🚀`;
  const baseTemplate = customTemplate || defaultMsg;
  return baseTemplate
    .replace(/\[विद्यार्थ्याचे नाव\]/g, studentName)
    .replace(/\[कोर्सचे नाव\]/g, courseName);
};

const sendWhatsAppAdmissionMsg = (mobile: string, name: string, course: string, customTemplate?: string) => {
  const cleanPhone = mobile.replace(/\D/g, '');
  const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(getWhatsAppAdmissionMessage(name, course, customTemplate))}`;
  window.open(whatsappUrl, '_blank');
};

export default function AdmissionView({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddInstallment,
  onTriggerReceipt,
  prefilledEnquiry,
  clearPrefill,
  lang,
  courses,
  courseFees,
  settings,
  autoOpenAddForm,
  clearAutoOpenAddForm,
  selectedYear,
  academicYears
}: AdmissionViewProps) {
  const t = translations[lang];

  const getFinancialStatus = (stud: Student) => {
    if (stud.balanceFees <= 0) {
      return {
        id: 'fully_paid',
        label: lang === 'en' ? 'Fully Paid' : 'पूर्ण जमा',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      };
    }
    
    // Check if overdue
    if (stud.nextInstallmentDate) {
      const today = new Date().toISOString().split('T')[0];
      if (stud.nextInstallmentDate < today) {
        return {
          id: 'overdue',
          label: lang === 'en' ? 'Overdue' : 'मुदत उलटली',
          colorClass: 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 animate-pulse',
        };
      }
    }

    return {
      id: 'pending',
      label: lang === 'en' ? 'Pending' : 'प्रलंबित (Pending)',
      colorClass: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    };
  };

  const activeCourses = courses || COURSES;
  const activeCourseFees = courseFees || COURSE_FEES;

  // Forms and Modals Layout State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{ fullName: string; course: string; mobile: string } | null>(null);

  // Security passcode verification states
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deletePasscode, setDeletePasscode] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [sortBy, setSortBy] = useState<keyof Student>('admissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination Configuration
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Student Admissions Fields
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formDOB, setFormDOB] = useState('');
  const [formVillage, setFormVillage] = useState('Shirpur Jain');
  const [formCourse, setFormCourse] = useState('MS-CIT');
  const [formReferral, setFormReferral] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formNextInstallmentDate, setFormNextInstallmentDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return calculateNextMonthDate(today);
  });
  const [formPhoto, setFormPhoto] = useState(AVATARS[0]);
  const [formDeposit, setFormDeposit] = useState<string>('');
  const [formCourseFee, setFormCourseFee] = useState<string>(() => {
    return String(activeCourseFees['MS-CIT'] || 5000);
  });
  const [formAcademicYear, setFormAcademicYear] = useState(selectedYear || '2026');

  // Sync academic year when prop changes or editing mode initializes
  React.useEffect(() => {
    if (editingStudent) {
      setFormAcademicYear(editingStudent.AcademicYear || selectedYear || '2026');
    } else {
      setFormAcademicYear(selectedYear || '2026');
    }
  }, [editingStudent, selectedYear]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(lang === 'en' ? 'File size should be less than 3MB.' : 'फाईल खूप मोठी आहे, कृपया ३MB पेक्षा लहान फाईल निवडा.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Installment adding fields
  const [instAmt, setInstAmt] = useState<number>(1500);
  const [instDate, setInstDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [instMethod, setInstMethod] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>('Cash');

  // Load prefix hook on mounting prefill
  React.useEffect(() => {
    if (prefilledEnquiry) {
      setFormName(prefilledEnquiry.fullName);
      setFormMobile(prefilledEnquiry.mobile);
      setFormVillage(prefilledEnquiry.village);
      setFormCourse(prefilledEnquiry.course);
      setFormCourseFee(String(activeCourseFees[prefilledEnquiry.course] || 5000));
      setFormReferral(prefilledEnquiry.referralName);
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setFormNextInstallmentDate(calculateNextMonthDate(today));
      setFormDeposit('');
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prefilledEnquiry]);

  // Listen for keyboard shortcut triggers to auto-open
  React.useEffect(() => {
    const handleTriggerAdmissionForm = () => {
      setEditingStudent(null);
      setFormName('');
      setFormMobile('');
      setFormDOB('');
      setFormVillage('Shirpur Jain');
      setFormCourse('MS-CIT');
      setFormCourseFee(String(activeCourseFees['MS-CIT'] || 5000));
      setFormReferral('');
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setFormNextInstallmentDate(calculateNextMonthDate(today));
      setFormDeposit('');
      setFormPhoto(AVATARS[0]);
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Auto-focus student full name input
      setTimeout(() => {
        const nameInput = document.getElementById('form-stud-name');
        if (nameInput) nameInput.focus();
      }, 150);
    };

    if (autoOpenAddForm) {
      handleTriggerAdmissionForm();
      if (clearAutoOpenAddForm) {
        clearAutoOpenAddForm();
      }
    }

    window.addEventListener('shortcut-add-admission', handleTriggerAdmissionForm);
    return () => {
      window.removeEventListener('shortcut-add-admission', handleTriggerAdmissionForm);
    };
  }, [autoOpenAddForm, activeCourseFees, clearAutoOpenAddForm]);

  // Submit new admission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) {
      alert(lang === 'en' ? 'Please complete all required fields.' : 'कृपया आवश्यक असलेली सर्व माहिती भरा.');
      return;
    }

    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (formDOB && !dobRegex.test(formDOB)) {
      alert(lang === 'en' ? 'Please enter DOB in DD/MM/YYYY format.' : 'कृपया जन्म तारीख DD/MM/YYYY (उदा. 20/08/1993) या स्वरूपात प्रविष्ट करा.');
      return;
    }

    const calculatedCourseFee = Number(formCourseFee) || activeCourseFees[formCourse] || 5000;

    const initialDeposit = Number(formDeposit) || 0;
    if (!editingStudent && initialDeposit > calculatedCourseFee) {
      alert(lang === 'en'
        ? 'First installment deposit cannot be greater than the course fee.'
        : 'पहिला हप्ता जमा रक्कम एकूण कोर्स फी पेक्षा जास्त असू शकत नाही.');
      return;
    }

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, {
        fullName: formName,
        mobile: formMobile,
        dob: formDOB,
        village: formVillage,
        course: formCourse,
        referralName: formReferral,
        admissionDate: formDate,
        photo: formPhoto,
        totalFees: calculatedCourseFee,
        nextInstallmentDate: formNextInstallmentDate,
        AcademicYear: formAcademicYear,
        UpdatedDate: new Date().toISOString()
      });
      setEditingStudent(null);
    } else {
      onAddStudent({
        fullName: formName,
        mobile: formMobile,
        dob: formDOB,
        village: formVillage,
        course: formCourse,
        referralName: formReferral || 'Direct',
        admissionDate: formDate,
        photo: formPhoto,
        totalFees: calculatedCourseFee,
        nextInstallmentDate: formNextInstallmentDate,
        AcademicYear: formAcademicYear,
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString()
      }, Number(formDeposit) || 0);

      // Trigger automatic WhatsApp greeting modal on the screen
      setWhatsAppModalData({
        fullName: formName,
        course: formCourse,
        mobile: formMobile
      });
    }

    resetForm();
    setShowAddForm(false);
    clearPrefill();
  };

  const handleEditInit = (stud: Student) => {
    setEditingStudent(stud);
    setFormName(stud.fullName);
    setFormMobile(stud.mobile);
    setFormDOB(convertToDisplayDOB(stud.dob));
    setFormVillage(stud.village);
    setFormCourse(stud.course);
    setFormCourseFee(String(stud.totalFees || activeCourseFees[stud.course] || 5000));
    setFormReferral(stud.referralName);
    setFormDate(stud.admissionDate);
    setFormNextInstallmentDate(stud.nextInstallmentDate || calculateNextMonthDate(stud.admissionDate));
    setFormPhoto(stud.photo);
    setFormAcademicYear(stud.AcademicYear || selectedYear || '2026');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      paymentMethod: instMethod as any,
      AcademicYear: selectedStudent.AcademicYear || selectedYear || '2026'
    });

    // Close and reset
    setInstAmt(1000);
    setShowInstallmentModal(false);

    // Refresh selected record
    const updated = students.find(s => s.id === selectedStudent.id);
    if (updated) {
      setSelectedStudent(updated);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormMobile('');
    setFormDOB('');
    setFormVillage('Shirpur Jain');
    setFormCourse('MS-CIT');
    setFormCourseFee(String(activeCourseFees['MS-CIT'] || 5000));
    setFormReferral('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNextInstallmentDate(calculateNextMonthDate(new Date().toISOString().split('T')[0]));
    setFormPhoto(AVATARS[0]);
    setFormDeposit('');
    setFormAcademicYear(selectedYear || '2026');
    setEditingStudent(null);
    clearPrefill();
  };

  const handleSort = (field: keyof Student) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const processedStudents = useMemo(() => {
    return students
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
  }, [students, searchTerm, selectedCourse, selectedVillage, sortBy, sortOrder]);

  const totalItems = processedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [processedStudents, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // CSV Exporter for local table spreadsheet matching instructions
  const exportToExcel = () => {
    const headers = "ID,Name,Contact,Village,Course,Date,Balance,Paid,Receipts Count\n";
    const dataRows = students.map(s => (
      `"${s.id}","${s.fullName}","${s.mobile}","${s.village}","${s.course}","${formatDate(s.admissionDate)}",${s.balanceFees},${s.paidAmount},${s.installments.length}`
    )).join("\n");
    
    const blob = new Blob([headers + dataRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DIPS_Admitted_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Window
  const exportToPDFAndPrint = () => {
    const pwin = window.open('', '_blank');
    if (!pwin) return;

    const dataRows = students.map(s => `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${s.fullName}</td>
        <td style="border:1px solid #ddd; padding:8px;">${s.course}</td>
        <td style="border:1px solid #ddd; padding:8px;">${s.village}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace;">₹${s.totalFees}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace; color:green;">₹${s.paidAmount}</td>
        <td style="border:1px solid #ddd; padding:8px; font-family:monospace; color:red;">₹${s.balanceFees}</td>
      </tr>
    `).join('');

    pwin.document.write(`
      <html>
        <head>
          <title>DIPs Admitted Students Registry</title>
          <style>body { font-family: sans-serif; padding:20px; } table{width:100%; border-collapse:collapse; margin-top:20px;} th{background:#2b6cb0; color:white; border:1px solid #ddd; padding:10px; text-align:left;}</style>
        </head>
        <body>
          <h2>DIPs Computers, Shirpur Jain</h2>
          <p>Admissions Registry Index &bull; Export List</p>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Village</th>
                <th>Total Course fee</th>
                <th>Paid Fee</th>
                <th>Outstanding Balance</th>
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
    pwin.document.close();
  };

  // Dedicated high-fidelity printing & A4 PDF generation for Student Portfolio folder
  const printStudentPortfolio = (student: Student) => {
    const pw = window.open('', '_blank');
    if (!pw) return;

    // Formatted ID schema matching corporate standards
    const getFormattedID = (studentID: string, course: string): string => {
      const cleanId = studentID.replace('STUD-', '');
      const cleanCourse = course.toUpperCase().replace(/[^A-Z0-9]/g, '');
      return `DIPS-${cleanCourse}-2026-${cleanId.padStart(3, '0')}`;
    };

    const isCustomLogo = !!(settings.receiptLogo || (settings.logo && !settings.logo.includes("unsplash.com/photo-1546410531-bb4caa6b424d")));
    const headerLogoSrc = settings.receiptLogo || (isCustomLogo ? settings.logo : null);

    // Double-checked installment rows mimicking dot-grid dividers in corporate log
    const installmentRows = student.installments.map(inst => `
      <tr style="border-bottom: 1px dotted #cbd5e1;">
        <td style="padding: 7px 10px; font-weight: bold; text-align: center; color: #4b5563; font-size: 11.5px;">#${inst.installmentNo}</td>
        <td style="padding: 7px 10px; font-weight: 800; text-align: center; color: #1e3a8a; font-family: monospace; font-size: 12.5px;">₹${inst.amount.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; text-align: center; color: #4b5563; font-family: monospace; font-size: 11.5px;">${formatDate(inst.paymentDate)}</td>
        <td style="padding: 7px 10px; font-weight: 700; font-family: monospace; color: #1e293b; text-align: center; font-size: 11.5px;">${inst.receiptNo}</td>
        <td style="padding: 7px 10px; text-align: center; font-weight: 800; color: #0a3c82; font-size: 11.5px; font-family: 'Inter', sans-serif;">${inst.paymentMethod || 'UPI'}</td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="5" style="padding: 16px; text-align: center; color: #9ca3af; font-style: italic; font-size: 11.5px;">
          No installment payments recorded yet for this student.
        </td>
      </tr>`;

    pw.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${getFormattedID(student.id, student.course)}_${student.fullName.replace(/\s+/g, '_')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              background-color: #f8fafc;
              line-height: 1.35;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .a4-page {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              padding: 10mm 12mm 8mm 12mm;
              background: #ffffff;
              position: relative;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            
            /* HEADER LAYOUT */
            .header-main {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 8px;
              border-bottom: 3px solid #0a3c82;
              margin-bottom: 12px;
            }
            
            .brand-section {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            
            .logo-container {
              width: 56px;
              height: 56px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .brand-details h1 {
              font-size: 26px;
              font-weight: 900;
              color: #0a3c82;
              letter-spacing: -0.5px;
              line-height: 0.95;
              text-transform: uppercase;
              font-family: 'Inter', sans-serif;
            }
            
            .brand-details h2 {
              font-size: 11px;
              font-weight: 700;
              color: #1d72dd;
              margin-top: 2px;
              letter-spacing: 0.2px;
              text-transform: capitalize;
            }
            
            .address-block {
              margin-top: 4px;
              font-size: 9px;
              color: #334155;
              font-weight: 500;
              line-height: 1.25;
            }
            
            .address-item {
              display: flex;
              align-items: center;
              gap: 5px;
              margin-bottom: 1px;
            }
            
            .address-icon {
              width: 10px;
              height: 10px;
              stroke: #0a3c82;
              stroke-width: 2.2;
              fill: none;
              flex-shrink: 0;
            }
            
            .portfolio-badge {
              display: flex;
              align-items: center;
              background: linear-gradient(135deg, #0a3c82 0%, #1e40af 100%);
              color: #ffffff;
              border-radius: 12px;
              padding: 6px 12px;
              border: 1.5px solid #ffffff;
              box-shadow: 0 3px 8px rgba(10, 60, 130, 0.15);
              gap: 8px;
            }
            
            .badge-circle {
              background-color: #ffffff;
              border-radius: 50%;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            
            .badge-circle svg {
              width: 16px;
              height: 16px;
              fill: none;
              stroke: #0a3c82;
              stroke-width: 2.5;
            }
            
            .badge-title-stack {
              display: flex;
              flex-direction: column;
              line-height: 1.05;
            }
            
            .badge-title-top {
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 1.2px;
              text-transform: uppercase;
            }
            
            .badge-title-bottom {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.2px;
              text-transform: uppercase;
              opacity: 0.9;
            }
            
            /* PROFILE CARD GRID */
            .profile-card-container {
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              padding: 10px 12px;
              background-color: #ffffff;
              box-shadow: 0 1px 4px rgba(0,0,0,0.01);
              display: flex;
              gap: 16px;
              align-items: stretch;
              margin-bottom: 12px;
              position: relative;
            }
            
            .photo-frame-wrapper {
              width: 100px;
              height: 120px;
              flex-shrink: 0;
              border: 1px solid #bfdbfe;
              background-color: #f0f7ff;
              border-radius: 8px;
              padding: 3px;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .student-actual-photo {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 5px;
            }
            
            .profile-data-columns {
              flex: 1;
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 0 24px;
              position: relative;
            }
            
            .profile-data-columns::after {
              content: '';
              position: absolute;
              top: 4px;
              bottom: 4px;
              left: 50.0%;
              width: 1px;
              border-left: 1px dashed #cbd5e1;
            }
            
            .grid-data-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px dotted #e2e8f0;
              padding: 8px 0;
              font-size: 11px;
            }
            
            .grid-data-row:last-child {
              border-bottom: none;
            }
            
            .field-key-box {
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 700;
              color: #475569;
            }
            
            .field-key-icon {
              width: 13px;
              height: 13px;
              stroke: #0a3c82;
              stroke-width: 2.2;
              fill: none;
              flex-shrink: 0;
            }
            
            .field-colon {
              font-weight: 700;
              color: #94a3b8;
              margin-left: auto;
              margin-right: 6px;
            }
            
            .field-value-box {
              font-weight: 700;
              color: #0f172a;
              text-align: right;
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .value-blue-brand {
              color: #0a3c82;
              font-weight: 800;
            }
            
            /* FEES CARDS ROW */
            .fees-section-title {
              font-size: 11px;
              font-weight: 800;
              color: #0a3c82;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
              border-left: 3px solid #0a3c82;
              padding-left: 6px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            
            .fees-cards-grid {
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 12px;
            }
            
            .fees-card-item {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 6px 10px;
              display: flex;
              align-items: center;
              gap: 10px;
              background-color: #ffffff;
            }
            
            .fees-card-item.course-fees-theme {
              border-color: #bfdbfe;
              background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%);
            }
            
            .fees-card-item.paid-fees-theme {
              border-color: #bbf7d0;
              background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
            }
            
            .fees-card-item.pending-fees-theme {
              border-color: #fecaca;
              background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
            }
            
            .fees-badge-circle {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            
            .fees-badge-circle svg {
              width: 16px;
              height: 16px;
              stroke: #ffffff;
              stroke-width: 2.2;
              fill: none;
            }
            
            .course-fees-theme .fees-badge-circle { background-color: #1d72dd; }
            .paid-fees-theme .fees-badge-circle { background-color: #16a34a; }
            .pending-fees-theme .fees-badge-circle { background-color: #dc2626; }
            
            .fees-text-details {
              display: flex;
              flex-direction: column;
              line-height: 1.25;
            }
            
            .fees-card-label {
              font-size: 8.5px;
              font-weight: 800;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .fees-card-amount {
              font-size: 16px;
              font-weight: 900;
              font-family: 'Inter', sans-serif;
            }
            
            .course-fees-theme .fees-card-amount { color: #0a3c82; }
            .paid-fees-theme .fees-card-amount { color: #15803d; }
            .pending-fees-theme .fees-card-amount { color: #b91c1c; }
            
            /* INSTALLMENT LEDGER */
            .ledger-bar-header {
              display: flex;
              align-items: center;
              background-color: #0a3c82;
              color: #ffffff;
              border-radius: 6px;
              padding: 5px 10px;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.8px;
              text-transform: uppercase;
              margin-bottom: 6px;
              gap: 6px;
              position: relative;
            }
            
            .ledger-bar-circle {
              width: 15px;
              height: 15px;
              background-color: #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            
            .ledger-bar-circle svg {
              width: 10px;
              height: 10px;
              stroke: #0a3c82;
              stroke-width: 2.5;
              fill: none;
            }
            
            .ledger-table-container {
              border: 1.5px solid #0a3c82;
              border-radius: 8px;
              overflow: hidden;
              background-color: #ffffff;
              margin-bottom: 10px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
            }
            
            .ledger-main-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
            }
            
            .ledger-main-table th {
              background-color: #0a3c82;
              color: #ffffff;
              padding: 6px 10px;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 9.5px;
              letter-spacing: 0.5px;
              border: none;
            }
            
            /* SIGNATURE AND STAMPS */
            .stamps-signatures-row {
              margin-top: auto;
              display: flex;
              justify-content: space-between;
              padding: 4px 10px 8px 10px;
            }
            
            .stamp-box-item {
              width: 180px;
              text-align: center;
              border-top: 1.5px solid #cbd5e1;
              padding-top: 4px;
              font-size: 9px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .stamp-box-item .placeholder-space {
              height: 32px;
              display: block;
            }
            
            .stamp-box-item .admin-stamp-title {
              font-size: 10px;
              font-weight: 900;
              color: #0a3c82;
              margin-bottom: 16px;
              display: block;
            }
            
            /* FOOTER info */
            .footer-info-bar {
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8px;
              color: #64748b;
              font-weight: 600;
            }
            
            .footer-bold-brand {
              color: #0a3c82;
              font-weight: 700;
            }
            
            /* PRINTOUT FIXES */
            @media print {
              html, body {
                height: 100%;
                background-color: #ffffff;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
              }
              .a4-page {
                border: none;
                box-shadow: none;
                padding: 8mm 10mm 6mm 10mm !important;
                width: 210mm;
                height: 297mm;
                position: absolute;
                top: 0;
                left: 0;
                box-sizing: border-box;
                page-break-after: avoid;
                page-break-before: avoid;
                background-color: #ffffff !important;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="a4-page">
            
            <!-- A4 COMPACT BRAND HEADER -->
            <div class="header-main">
              <div class="brand-section">
                <div class="logo-container">
                  ${headerLogoSrc ? `
                    <div style="height: 56px; width: 56px; border-radius: 8px; border: 1.5px solid #002060; display: flex; align-items: center; justify-content: center; background: white; overflow: hidden; padding: 2px;">
                      <img src="${headerLogoSrc}" style="height: 100%; width: 100%; object-fit: contain;" referrerpolicy="no-referrer" />
                    </div>
                  ` : `
                    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                      <!-- Professional desktop outline monitor -->
                      <rect x="6" y="16" width="88" height="52" rx="6" stroke="#0a3c82" stroke-width="5" fill="#f8fafc" />
                      <!-- Inside display screen area -->
                      <rect x="11" y="21" width="78" height="36" rx="3" fill="#eff6ff" />
                      <!-- Desktop pedestal stand -->
                      <path d="M36 68 L42 82 H58 L64 68 Z" fill="#0a3c82" />
                      <rect x="26" y="82" width="48" height="5" rx="2.5" fill="#0a3c82" />
                      <!-- Graduation Cap Academic Symbol -->
                      <path d="M50 24 L24 35 L50 46 L76 35 Z" fill="#0a3c82" />
                      <path d="M33 39 V46 C33 51 50 54 50 54 C50 54 67 51 67 46 V39" fill="#1d72dd" opacity="0.95" />
                      <!-- Cap tassel drop -->
                      <path d="M70 38 V51 L72 54 V38" stroke="#0a3c82" stroke-width="1.8" fill="none" />
                      <circle cx="72" cy="53" r="2.5" fill="#0d9488" />
                    </svg>
                  `}
                </div>
                <div class="brand-details">
                  <h1>${settings.instituteName}</h1>
                  <h2>${settings.instituteName.toUpperCase().includes('DIPS') ? 'Advanced IT Education & Skill Development Institute' : 'Authorized Learning & IT Education Center'}</h2>
                  <div class="address-block">
                    <div class="address-item">
                      <svg class="address-icon" viewBox="0 0 24 24">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                      </svg>
                      <span>${settings.address}</span>
                    </div>
                    <div class="address-item">
                      <svg class="address-icon" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Director: <strong>${settings.ownerName}</strong></span>
                    </div>
                    <div class="address-item">
                      <svg class="address-icon" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>Phone: <strong>${settings.mobile1}${settings.mobile2 ? ' | ' + settings.mobile2 : ''}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Dossier Pill-Capsule Container tag -->
              <div class="portfolio-badge center">
                <div class="badge-circle">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div class="badge-title-stack">
                  <span class="badge-title-top">STUDENT</span>
                  <span class="badge-title-bottom">PORTFOLIO</span>
                </div>
              </div>
            </div>

            <!-- STUDENT PROFILE GRID BOX -->
            <div class="profile-card-container">
              <div class="photo-frame-wrapper">
                <img src="${student.photo}" class="student-actual-photo" alt="Student Passport Photo" referrerpolicy="no-referrer" />
              </div>
              
              <div class="profile-data-columns">
                
                <!-- COLUMN 1 DETAILS -->
                <div style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>Student Name</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box value-blue-brand" style="text-transform: uppercase;">${student.fullName}</span>
                  </div>
                  
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M2 10h20"/></svg>
                      <span>Course</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box value-blue-brand">${student.course}</span>
                  </div>
                  
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span>Mobile</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box value-blue-brand" style="font-family: monospace;">+91 ${student.mobile}</span>
                  </div>
                </div>
                
                <!-- COLUMN 2 DETAILS -->
                <div style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>Admission Date</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box value-blue-brand" style="font-family: monospace;">${formatDate(student.admissionDate)}</span>
                  </div>
                  
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>Date of Birth</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box" style="font-family: monospace; color: #1e3a8a;">${formatDate(student.dob)}</span>
                  </div>
                  
                  <div class="grid-data-row">
                    <div class="field-key-box">
                      <svg class="field-key-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span>Village</span>
                    </div>
                    <span class="field-colon">:</span>
                    <span class="field-value-box value-blue-brand">${student.village}</span>
                  </div>
                </div>
                
              </div>
            </div>

            <!-- FEES AND COLLECTIONS TITLE -->
            <div class="fees-section-title">
              <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: #0a3c82; stroke-width: 2.2; fill: none;"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              <span>Fees and Collections Summary</span>
            </div>

            <!-- THREE COLUMNS FEES CARDS -->
            <div class="fees-cards-grid">
              <!-- Course Fees Card -->
              <div class="fees-card-item course-fees-theme">
                <div class="fees-badge-circle">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12" y2="18"/>
                    <path d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                  </svg>
                </div>
                <div class="fees-text-details">
                  <span class="fees-card-label">Total Course Fees</span>
                  <strong class="fees-card-amount">₹${student.totalFees.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              
              <!-- Paid Fees Card -->
              <div class="fees-card-item paid-fees-theme">
                <div class="fees-badge-circle">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8l-6 6-2-2"/>
                  </svg>
                </div>
                <div class="fees-text-details">
                  <span class="fees-card-label">Total Paid Fees</span>
                  <strong class="fees-card-amount">₹${student.paidAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              
              <!-- Pending Fees Card -->
              <div class="fees-card-item pending-fees-theme">
                <div class="fees-badge-circle">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div class="fees-text-details">
                  <span class="fees-card-label">Pending Fees</span>
                  <strong class="fees-card-amount">₹${student.balanceFees.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <!-- INSTALLMENT PAYMENT BARS & TABLE -->
            <div class="ledger-bar-header">
              <div class="ledger-bar-circle">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span>Installment Payment Ledger</span>
            </div>

            <div class="ledger-table-container">
              <table class="ledger-main-table">
                <thead>
                  <tr style="border-bottom: 2px solid #083068;">
                    <th style="width: 15%; text-align: center;">Installment</th>
                    <th style="width: 25%; text-align: center;">Amount</th>
                    <th style="width: 20%; text-align: center;">Date</th>
                    <th style="width: 25%; text-align: center;">Receipt No</th>
                    <th style="width: 15%; text-align: center;">Mode</th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffffff;">
                   ${installmentRows}
                </tbody>
              </table>
            </div>

            <!-- AUTHENTICITY STAMPS AND SIGNATURES -->
            <div class="stamps-signatures-row">
              <div class="stamp-box-item">
                <span class="placeholder-space"></span>
                <span>Student / Parent Signature</span>
              </div>
              <div class="stamp-box-item">
                <span class="admin-stamp-title">${settings.instituteName} Office</span>
                <span>Authorized Stamp & Sign</span>
              </div>
            </div>

            <!-- A4 COMPACT FOOTER -->
            <div class="footer-info-bar">
              <span>Document Generated On: <strong>${new Date().toLocaleDateString('en-GB')}</strong> at ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</span>
              <span>Dossier System of <span class="footer-bold-brand">${settings.instituteName}${settings.address.toUpperCase().includes('SHIRPUR') ? ', Shirpur Jain' : ''}</span></span>
            </div>
            
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    pw.document.close();
  };


  return (
    <div className="space-y-6">

      {/* A. VIEW HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 id="admission-header-desc" className="text-xl font-bold text-gray-800">
            {lang === 'en' ? 'Admission Student Registry' : 'प्रवेश घेतलेले विद्यार्थी (Registry)'}
          </h2>
          <p className="text-xs text-gray-400">
            {lang === 'en' 
              ? 'Enroll students, maintain dossiers, manage structured installment due schedules' 
              : 'नवीन विद्यार्थ्यांचे प्रवेश नोंदवा, तपशील आणि हप्त्यांचे नियोजन व्यवस्थापित करा'}
          </p>
        </div>

        <button
          id="btn-toggle-student-add"
          onClick={() => {
            if (showAddForm) resetForm();
            setShowAddForm(!showAddForm);
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold shadow transition active:scale-95 text-white ${showAddForm ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#3182ce] hover:bg-[#2b6cb0]'}`}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showAddForm ? t.close : (lang === 'en' ? 'New Admission' : 'नवीन प्रवेश नोंदवा')}</span>
          {!showAddForm && (
            <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[9px] font-mono bg-blue-700/50 text-blue-100 rounded border border-blue-400/30">Ctrl+N</kbd>
          )}
        </button>
      </div>

      {/* B. DYNAMIC ENROLLMENT SHEET FORM */}
      {showAddForm && (
        <fieldset id="field-student-form" className="bg-white rounded-xl border-t-4 border-t-blue-500 border border-gray-200 p-6 shadow-sm">
          <legend className="px-3 text-sm font-extrabold text-[#3182ce] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-blue-500" />
            {editingStudent ? (lang === 'en' ? 'Update Admitted Student File' : 'माहिती सुधारित करा') : (lang === 'en' ? 'Student Admission Dossier Sheet' : 'नवीन विद्यार्थी प्रवेश अर्ज')}
          </legend>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            
            {/* Field: Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.fullName} <span className="text-red-500">*</span></label>
              <input
                id="form-stud-name"
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="पहिले नाव, वडिलांचे नाव, आडनाव"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 outlined-none"
                required
              />
            </div>

            {/* Field: Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.mobile} <span className="text-red-500">*</span></label>
              <input
                id="form-stud-phone"
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={formMobile}
                onChange={e => setFormMobile(e.target.value)}
                placeholder="उदा. 9049102035"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 font-mono"
                required
              />
            </div>

            {/* Field: DOB */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {t.dob} (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <input
                id="form-stud-dob"
                type="text"
                placeholder="DD/MM/YYYY"
                maxLength={10}
                value={formDOB}
                onChange={e => {
                  const val = e.target.value;
                  // Auto-format DD/MM/YYYY on user input
                  let clean = val.replace(/[^0-9]/g, '');
                  let formatted = '';
                  if (clean.length > 0) {
                    formatted += clean.substring(0, 2);
                  }
                  if (clean.length >= 3) {
                    formatted += '/' + clean.substring(2, 4);
                  }
                  if (clean.length >= 5) {
                    formatted += '/' + clean.substring(4, 8);
                  }
                  setFormDOB(formatted);
                }}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 font-mono text-gray-800 focus:border-blue-500 placeholder-slate-400"
                required
              />
            </div>

            {/* Field: Village */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.village} <span className="text-red-500">*</span></label>
              <input
                id="form-stud-village"
                type="text"
                value={formVillage}
                onChange={e => setFormVillage(e.target.value)}
                list="villages-datalist"
                placeholder={lang === 'en' ? 'Type or select Village/Town' : 'गाव / शहर लिहा किंवा निवडा'}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-2.5 focus:border-blue-500"
                required
              />
              <datalist id="villages-datalist">
                {VILLAGES.map(v => <option key={v} value={v} />)}
                <option value="Washim Rural" />
              </datalist>
            </div>

            {/* Field: Course Choice */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.course}</label>
              <select
                id="form-stud-course"
                value={formCourse}
                onChange={e => {
                  const selectedCourse = e.target.value;
                  setFormCourse(selectedCourse);
                  const feeMax = activeCourseFees[selectedCourse] || 5000;
                  setFormCourseFee(String(feeMax));
                  // Default deposit check to not exceed the course fee
                  if (Number(formDeposit) > feeMax) setFormDeposit(String(feeMax));
                }}
                className="w-full text-sm border border-gray-200 bg-white rounded-lg p-2.5"
              >
                {activeCourses.map(c => <option key={c} value={c}>{c} (Fee: ₹{activeCourseFees[c]})</option>)}
              </select>
            </div>

            {/* Field: Custom Course Fee Option */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-teal-600 block">
                {lang === 'en' ? 'Course Fee (₹)' : 'कोर्स फी (₹)'} <span className="text-red-500">*</span>
              </label>
              <input
                id="form-stud-fee"
                type="text"
                value={formCourseFee}
                onChange={e => {
                  const rawVal = e.target.value;
                  const cleanVal = rawVal.replace(/[^0-9]/g, '');
                  setFormCourseFee(cleanVal);
                }}
                placeholder="उदा. 4000"
                className="w-full text-sm border border-teal-200 bg-teal-50/5 rounded-lg p-2.5 font-mono font-bold text-teal-850 focus:border-teal-500"
                required
              />
              <p className="text-[10px] text-gray-400 font-medium">
                {lang === 'en' ? 'Default fee amount can be customized' : 'डीफॉल्ट फी रक्कम बदलू शकता'}
              </p>
            </div>

            {/* Field: Admission Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.admissionDate}</label>
              <input
                id="form-stud-date"
                type="date"
                value={formDate}
                onChange={e => {
                  const newDate = e.target.value;
                  setFormDate(newDate);
                  setFormNextInstallmentDate(calculateNextMonthDate(newDate));
                }}
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 font-mono"
              />
            </div>

            {/* Field: Academic Year */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{lang === 'en' ? 'Academic Year' : 'शैक्षणिक वर्ष'} <span className="text-red-500">*</span></label>
              <select
                id="form-stud-ac-year"
                value={formAcademicYear}
                onChange={e => setFormAcademicYear(e.target.value)}
                className="w-full text-sm border border-teal-200 bg-teal-50/5 rounded-lg p-2.5 outline-none focus:border-teal-500 font-semibold"
                required
              >
                {(academicYears || ['2026', '2027', '2028', '2029']).map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Field: Referral */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">{t.referral}</label>
              <input
                id="form-stud-referral"
                type="text"
                value={formReferral}
                onChange={e => setFormReferral(e.target.value)}
                placeholder="Direct or referral source"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5"
              />
            </div>

            {/* Field: Initial deposit payment (Only if registering new student!) */}
            {!editingStudent && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-600 block">
                  {lang === 'en' ? 'First Installment Deposit' : 'पहिला हप्ता जमा रक्कम'}
                </label>
                <input
                  id="form-stud-deposit"
                  type="text"
                  placeholder={lang === 'en' ? 'Amount' : 'रक्कम रिकामी ठेवा'}
                  value={formDeposit}
                  onChange={e => {
                    const rawVal = e.target.value;
                    const cleanVal = rawVal.replace(/[^0-9]/g, '');
                    if (cleanVal === '') {
                      setFormDeposit('');
                    } else {
                      const maxVal = activeCourseFees[formCourse] || 5000;
                      const num = Math.min(Number(cleanVal), maxVal);
                      setFormDeposit(String(num));
                    }
                  }}
                  className="w-full text-sm border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/20 font-bold font-mono text-emerald-750"
                />
                <p className="text-[10px] text-gray-400 font-medium">
                  {lang === 'en' ? 'Leave empty or enter deposit' : 'रिकामी ठेवा किंवा भरलेला पहिला हप्ता दाखल करा'}
                </p>
              </div>
            )}

            {/* Field: Next Installment Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-indigo-600 block">
                {lang === 'en' ? 'Next Installment Date' : 'पुढील हप्ता तारीख'} <span className="text-red-500">*</span>
              </label>
              <input
                id="form-stud-next-inst"
                type="date"
                value={formNextInstallmentDate}
                onChange={e => setFormNextInstallmentDate(e.target.value)}
                className="w-full text-sm border border-indigo-200 bg-indigo-50/5 rounded-lg p-2.5 font-mono text-indigo-750 focus:border-indigo-500"
                required
              />
              <p className="text-[10px] text-gray-400 font-medium">
                {lang === 'en' ? 'Automatically calculated 1 month ahead' : 'प्रवेशावरून १ महिना पुढे स्वयंचलित गणना केली'}
              </p>
            </div>

            {/* Field: Real Photo Upload & Preview */}
            <div className="space-y-3 md:col-span-3">
              <label className="text-xs font-bold text-gray-700 block">
                {lang === 'en' ? 'Student Photograph' : 'विद्यार्थ्याचा फोटो'}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                {/* Visual Preview Frame of the Selected Photo */}
                <div className="md:col-span-3 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="h-32 w-28 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden shadow-sm flex items-center justify-center p-1">
                      {formPhoto ? (
                        <img 
                          src={formPhoto} 
                          alt="Student passport preview" 
                          className="h-full w-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-slate-400 flex flex-col items-center justify-center text-[10px]">
                          <Camera className="h-8 w-8 mb-1.5 text-slate-300" />
                          <span>No Photo</span>
                        </div>
                      )}
                    </div>
                    {formPhoto && (
                      <span className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md animate-pulse">✓</span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-wider flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    {lang === 'en' ? 'Photo Frame' : 'फोटो फ्रेम'}
                  </span>
                </div>

                {/* Upload Action Area */}
                <div className="md:col-span-5 flex flex-col justify-center gap-2">
                  <div className="text-sm font-bold text-slate-850 flex items-center gap-1.5 justify-center md:justify-start">
                    <Camera className="h-4.5 w-4.5 text-blue-600" />
                    {lang === 'en' ? 'Upload Passport Size Photo' : 'फोटो अपलोड करा'}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-center md:text-left">
                    {lang === 'en' 
                      ? 'Upload a custom student picture (JPG/PNG up to 3MB) or tap any preset icon on the right to select instantly.' 
                      : 'विद्यार्थ्याचा फोटो अपलोड करा (कमाल ३MB) किंवा उजवीकडील कोणत्याही डिझाईन फोटो आयकॉनवर टॅप करा.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                    <label 
                      htmlFor="student-photo-file" 
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{lang === 'en' ? 'Choose File' : 'फाईल निवडा'}</span>
                      <input 
                        id="student-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {formPhoto !== AVATARS[0] && (
                      <button
                        type="button"
                        onClick={() => setFormPhoto(AVATARS[0])}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 text-xs font-bold rounded-lg transition active:scale-95 shadow-sm"
                      >
                        {lang === 'en' ? 'Reset to Default' : 'मूळ फोटो'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatars Selection Panel with beautiful photo icons */}
                <div className="md:col-span-4 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-5">
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 justify-center md:justify-start">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    <span>{lang === 'en' ? 'Default Avatars' : 'फोटो आयकॉन्स निवडा'}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {AVATARS.map((avatar, idx) => {
                      const isSelected = formPhoto === avatar;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormPhoto(avatar)}
                          className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all p-0.5 focus:outline-none ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/50 shadow shadow-indigo-100 scale-105 z-10' 
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:scale-98'
                          }`}
                          title={`Avatar Option ${idx + 1}`}
                        >
                          <img 
                            src={avatar} 
                            alt={`Avatar ${idx + 1}`} 
                            className="h-full w-full object-cover rounded-lg"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                              <span className="bg-indigo-600 text-white rounded-full p-0.5 text-[8px] font-bold">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Submitter details */}
            <div className="md:col-span-3 flex justify-end gap-3 border-t pt-4">
              <button
                id="btn-student-form-cancel"
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="px-4 py-2.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg transition hover:bg-gray-200"
              >
                {t.close}
              </button>
              <button
                id="btn-student-form-save"
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-[#3182ce] hover:bg-[#2b6cb0] text-white rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <span>{editingStudent ? t.save : (lang === 'en' ? 'Enroll & Register' : 'प्रवेश निश्चित करा')}</span>
                <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-mono bg-blue-700/50 text-blue-100 rounded border border-blue-400/30">Ctrl+S</kbd>
              </button>
            </div>

          </form>
        </fieldset>
      )}

      {/* C. GENERAL TOOLBAR: SEARCH & EXPORTS */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              id="search-stud-box"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="विद्यार्थी नाव, फोन नंबर किंवा गाव शोधा..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
            {/* Card vs list toggles */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border">
              <button
                id="btn-layout-stud-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-850'}`}
                title={t.listView}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                id="btn-layout-stud-card"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-850'}`}
                title={t.cardView}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Standard Exporters */}
            <button
              id="btn-stud-xls"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition"
              title="Export admissions data to CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t.exportExcel}</span>
            </button>
            <button
              id="btn-stud-pdf"
              onClick={exportToPDFAndPrint}
              className="flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 font-bold border border-sky-200 rounded-lg px-3 py-2 hover:bg-sky-100 transition"
              title="Print admissions ledger"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{t.print}</span>
            </button>
          </div>

        </div>

        {/* Course and Village Filter Dropdowns */}
        <div id="filter-selects" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-3.5 text-xs">
          
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="font-extrabold text-[10px] uppercase tracking-wider">{lang === 'en' ? 'Filters' : 'फिल्टर्स'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
            <div className="w-full sm:w-56">
              <select
                id="filter-stud-course"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-250 bg-white rounded-lg p-2 h-10 px-3 cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-medium transition duration-200"
              >
                <option value="">-- {t.filterCourse} --</option>
                {activeCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="w-full sm:w-56">
              <select
                id="filter-stud-village"
                value={selectedVillage}
                onChange={e => setSelectedVillage(e.target.value)}
                className="w-full border border-gray-250 bg-white rounded-lg p-2 h-10 px-3 cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-medium transition duration-200"
              >
                <option value="">-- {t.filterVillage} --</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* D. RESULTS: LIST OR CARD VIEWS */}
      {processedStudents.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400 font-medium">
          <ImageIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p>{t.noData}</p>
        </div>
      ) : viewMode === 'list' ? (
        
        /* 1. LIST TABLE */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table id="student-list-table" className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-3.5">Photo</th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center gap-1">Student Name <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-3.5">Contact No</th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('village')}>
                    <div className="flex items-center gap-1">Village <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('course')}>
                    <div className="flex items-center gap-1">Course <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map(stud => (
                  <tr key={stud.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3.5">
                      <img src={stud.photo} alt={stud.fullName} className="h-9 w-9 object-cover rounded-full border shadow-sm" referrerPolicy="no-referrer" />
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{stud.fullName}</div>
                      <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-bold uppercase">DOB:</span>
                        <span className="font-mono text-gray-700">{formatDate(stud.dob)}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-gray-600">{stud.mobile}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {stud.village}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 font-bold rounded bg-sky-50 text-sky-700 text-[10px]">
                        {stud.course}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {stud.balanceFees > 0 ? (
                        <span className="font-bold text-red-600 font-mono">₹{stud.balanceFees.toLocaleString()}</span>
                      ) : (
                        <span className="inline-flex bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide font-sans">
                          PAID
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center align-middle">
                      {(() => {
                        const statusObj = getFinancialStatus(stud);
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs ${statusObj.colorClass}`}>
                            {statusObj.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          id={`btn-wa-stud-${stud.id}`}
                          onClick={() => {
                            setWhatsAppModalData({
                              fullName: stud.fullName,
                              course: stud.course,
                              mobile: stud.mobile
                            });
                          }}
                          className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                          title={lang === 'en' ? 'Send WhatsApp Message' : 'व्हॉट्सॲप पाठवा'}
                        >
                          <MessageCircle className="h-4 w-4 fill-current" />
                        </button>
                        <button
                          id={`btn-view-stud-${stud.id}`}
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
        
        /* 2. CARD CAROUSEL SHUFFLE GRID */
        <div id="student-grid-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStudents.map(stud => (
            <div key={stud.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-3 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <img src={stud.photo} className="h-10 w-10 rounded-full object-cover border" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-bold text-gray-800 text-sm line-clamp-1">{stud.fullName}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-1">
                      <span className="font-bold uppercase">DOB:</span>
                      <span className="font-mono text-gray-700">{formatDate(stud.dob)}</span>
                    </div>
                  </div>
                </div>
                {(() => {
                  const statusObj = getFinancialStatus(stud);
                  return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-2xs ${statusObj.colorClass}`}>
                      {statusObj.label}
                    </span>
                  );
                })()}
              </div>

              <div className="p-4 space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Enrolled Course:</span>
                  <span className="font-bold text-gray-800">{stud.course}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Mobile:</span>
                  <span>{stud.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locality:</span>
                  <span>{stud.village}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Balance Due:</span>
                  {stud.balanceFees > 0 ? (
                    <strong className="text-red-600 font-bold">₹{stud.balanceFees}</strong>
                  ) : (
                    <span className="text-emerald-700 font-bold uppercase text-[9px]">PAID (जमा)</span>
                  )}
                </div>
                {stud.balanceFees > 0 && stud.nextInstallmentDate && (
                  <div className="flex justify-between text-indigo-600 font-semibold bg-indigo-50/50 p-1.5 rounded border border-indigo-100/50">
                    <span>{lang === 'en' ? 'Next Due Date:' : 'पुढील हप्ता तारीख:'}</span>
                    <span className="font-bold font-mono">{formatDate(stud.nextInstallmentDate)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 flex justify-end gap-1.5 text-xs border-t">
                <button
                  id={`btn-wa-card-stud-${stud.id}`}
                  onClick={() => {
                    setWhatsAppModalData({
                      fullName: stud.fullName,
                      course: stud.course,
                      mobile: stud.mobile
                    });
                  }}
                  className="h-8 w-8 flex items-center justify-center bg-emerald-100/50 hover:bg-emerald-600 hover:text-white border border-emerald-250 text-emerald-800 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Send WhatsApp welcome message"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                </button>
                <button
                  id={`btn-card-view-stud-${stud.id}`}
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
        <div className="flex items-center justify-between bg-white border rounded-xl p-3 shadow-sm select-none mt-4">
          <p className="text-xs text-gray-500">
            Showing <strong className="font-mono">{((currentPage-1)*itemsPerPage)+1}</strong> to <strong className="font-mono">{Math.min(currentPage*itemsPerPage, totalItems)}</strong> of <strong className="font-mono">{totalItems}</strong> entries
          </p>
          <div className="flex items-center gap-2">
            <button
              id="btn-stud-prev-page"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-750">
              Page <strong className="font-mono">{currentPage}</strong> of <strong className="font-mono">{totalPages}</strong>
            </span>
            <button
              id="btn-stud-next-page"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 border rounded-lg bg-gray-50 font-semibold disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* F. STUDENT PORTFOLIO DETAIL PROFILE PANEL */}
      {selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onAddInstallmentClick={() => {
            setInstAmt(selectedStudent.balanceFees);
            setShowInstallmentModal(true);
          }}
          onTriggerReceipt={onTriggerReceipt}
          onOpenWhatsAppModal={(data) => setWhatsAppModalData(data)}
          onPrintPortfolio={printStudentPortfolio}
          onEditClick={(stud) => {
            handleEditInit(stud);
            setSelectedStudent(null);
          }}
          onDeleteClick={(stud) => {
            setStudentToDelete(stud);
            setDeletePasscode('');
            setDeleteError('');
          }}
          lang={lang}
          settings={settings}
        />
      )}

      {/* G. CONSOLE SUB-MODAL: COLLECT NEW INSTALLMENT FEES */}
      {showInstallmentModal && selectedStudent && (
        <div id="inst-form-backdrop" className="fixed inset-0 z-52 bg-black/70 p-4 flex items-center justify-center backdrop-blur-sm">
          <div id="inst-form-card" className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-[#e6fffa] border-b border-[#b2f5ea] px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-bold text-teal-800 text-sm">
                <CreditCard className="h-4.5 w-4.5 text-teal-600 animate-pulse" />
                <span>Submit Fee Installment</span>
              </div>
              <button onClick={() => setShowInstallmentModal(false)} className="text-gray-400 hover:text-gray-700 font-bold p-1">&times;</button>
            </div>

            <form onSubmit={handleAddInstallmentSubmit} className="p-5 space-y-4 text-sm text-gray-700">
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-4 text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider shrink-0">Name:</span>
                  <span className="font-extrabold text-gray-950 text-right break-words max-w-[200px]">{selectedStudent.fullName}</span>
                </div>
                <div className="border-t border-gray-200/60" />
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider shrink-0">Outstanding pending balance:</span>
                  <span className="font-black font-mono text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md shadow-sm">
                    ₹{selectedStudent.balanceFees.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Installment Amount Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">{t.amountPaid} (₹) <span className="text-red-500">*</span></label>
                <input
                  id="form-inst-amt"
                  type="number"
                  min={1}
                  max={selectedStudent.balanceFees}
                  value={instAmt}
                  onChange={e => setInstAmt(Number(e.target.value))}
                  className="w-full text-base border-2 border-teal-200 bg-teal-50/10 p-2.5 rounded-lg outline-none font-bold font-mono text-teal-700 focus:border-teal-400"
                  required
                />
              </div>

              {/* Installment Date Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block">{t.paymentDate}</label>
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
                <label className="text-xs font-bold text-gray-600 block">{t.paymentMethod}</label>
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
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  id="btn-inst-form-save"
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow flex items-center gap-1.5"
                >
                  <span>Confirm Deposit (भरणा)</span>
                  <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-mono bg-teal-800 text-teal-100 rounded border border-teal-500/30">Ctrl+S</kbd>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* H. SECURITY PASSCODE VERIFICATION MODAL FOR DELETION */}
      {studentToDelete && (
        <div id="delete-passcode-backdrop" className="fixed inset-0 z-55 bg-black/70 p-4 flex items-center justify-center backdrop-blur-sm">
          <div id="delete-passcode-card" className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 font-black text-rose-800 text-sm tracking-wider uppercase">
                <AlertCircle className="h-5 w-5 text-rose-600 animate-pulse" />
                <span>{lang === 'en' ? 'Security Verification' : 'सुरक्षा पडताळणी'}</span>
              </div>
              <button 
                onClick={() => {
                  setStudentToDelete(null);
                  setDeletePasscode('');
                  setDeleteError('');
                }} 
                className="text-gray-400 hover:text-gray-700 font-bold p-1 leading-none text-xl text-rose-600 hover:bg-rose-100/50 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                {lang === 'en' 
                  ? `To delete the student record of ` 
                  : `विद्यार्थी `}
                <strong className="text-gray-900">{studentToDelete.fullName}</strong>
                {lang === 'en' 
                  ? `, please enter the administrator security passcode.` 
                  : ` चा प्रवेश रेकॉर्ड हटवण्यासाठी प्रशासक पासवर्ड टाका.`}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block select-none">
                  {lang === 'en' ? 'Admin Passcode (4-Digits)' : 'ऍडमीन पासवर्ड (४-अंकी)'}
                </label>
                <input
                  id="delete-passcode-input"
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={deletePasscode}
                  onChange={e => {
                    setDeletePasscode(e.target.value);
                    setDeleteError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      document.getElementById('btn-delete-passcode-confirm')?.click();
                    }
                  }}
                  className="w-full text-center text-xl tracking-widest border-2 border-rose-100 focus:border-rose-400 bg-rose-50/10 p-2.5 rounded-xl outline-none font-black text-rose-700 transition-colors"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">
                    ⚠️ {deleteError}
                  </p>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  id="btn-delete-passcode-cancel"
                  type="button"
                  onClick={() => {
                    setStudentToDelete(null);
                    setDeletePasscode('');
                    setDeleteError('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  id="btn-delete-passcode-confirm"
                  type="button"
                  onClick={() => {
                    if (deletePasscode === '1122') {
                      onDeleteStudent(studentToDelete.id);
                      setStudentToDelete(null);
                      setSelectedStudent(null);
                      setDeletePasscode('');
                      setDeleteError('');
                    } else if (!deletePasscode) {
                      setDeleteError(lang === 'en' ? 'Password cannot be empty!' : 'पासवर्ड रिकामा असू शकत नाही!');
                    } else {
                      setDeleteError(lang === 'en' ? 'Incorrect security passcode!' : 'चुकीचा पासवर्ड! पुन्हा प्रयत्न करा.');
                    }
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-lg text-xs shadow-sm transition-all"
                >
                  {lang === 'en' ? 'Verify & Delete' : 'पडताळणी करा आणि हटवा'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP CONFIRMATION PREVIEW & SEND MODAL */}
      {whatsAppModalData && (
        <div id="wa-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex items-center justify-center backdrop-blur-sm">
          <div id="wa-modal-card" className="bg-[#f0f2f5] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            
            {/* Top WhatsApp branded bar */}
            <div className="bg-[#00a884] text-white p-4 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-1.5 font-sans">
                <MessageCircle className="h-5 w-5 fill-white text-[#00a884]" />
                <div>
                  <h4 className="font-bold text-sm tracking-wider uppercase">{lang === 'en' ? 'Admission Welcome' : 'प्रवेश अभिनंदन संदेश'}</h4>
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
                  ? 'Review the welcome message that will be sent via WhatsApp:' 
                  : 'विद्यार्थ्यास जाणाऱ्या व्हॉट्सॲप अभिनंदन संदेशाची पडताळणी करा:'}
              </p>

              {/* Chat-bubble container simulating a real WhatsApp chat window */}
              <div 
                className="p-3.5 bg-[#efeae2] border rounded-xl flex flex-col justify-end min-h-[160px] "
                style={{ 
                  backgroundImage: 'radial-gradient(#dfdcd6 1px, transparent 0px)', 
                  backgroundSize: '12px 12px' 
                }}
              >
                <div className="bg-[#d9fdd3] text-[#111b21] p-3 rounded-xl shadow-xs whitespace-pre-wrap leading-relaxed relative max-w-[95%] text-left">
                  {getWhatsAppAdmissionMessage(whatsAppModalData.fullName, whatsAppModalData.course, settings?.whatsAppAdmissionTemplate)}
                  <p className="text-right text-[8px] text-gray-400 font-mono mt-1 font-bold">10:30 AM ✓✓</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  id="btn-wa-modal-cancel"
                  onClick={() => setWhatsAppModalData(null)}
                  className="bg-white border text-gray-700 hover:bg-gray-100 font-bold px-4 py-2.5 rounded-lg text-xs"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  id="btn-wa-modal-send"
                  onClick={() => {
                    sendWhatsAppAdmissionMsg(whatsAppModalData.mobile, whatsAppModalData.fullName, whatsAppModalData.course, settings?.whatsAppAdmissionTemplate);
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

    </div>
  );
}
