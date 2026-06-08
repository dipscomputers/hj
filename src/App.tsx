/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Enquiry, 
  Student, 
  InstituteSettings, 
  Installment,
  COURSE_FEES 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_ENQUIRIES, 
  DEFAULT_STUDENTS 
} from './data';
import { Language } from './locales';

// Import Firebase and Config Units
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

// Import UI subcomponents
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import EnquiryView from './components/EnquiryView';
import AdmissionView from './components/AdmissionView';
import FeesView from './components/FeesView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ReceiptModal from './components/ReceiptModal';
import CourseView from './components/CourseView';

export default function App() {
  
  // 1. STATE INITIALIZATION (Local Storage Persistent)
  const [settings, setSettings] = useState<InstituteSettings>(() => {
    const local = localStorage.getItem('dips_settings');
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  });

  const [courses, setCourses] = useState<string[]>(() => {
    const local = localStorage.getItem('dips_courses');
    return local ? JSON.parse(local) : ['MS-CIT', 'Tally GST', 'Basic Computer', 'Advanced Excel', 'DTP'];
  });

  const [courseFees, setCourseFees] = useState<Record<string, number>>(() => {
    const local = localStorage.getItem('dips_course_fees');
    return local ? JSON.parse(local) : {
      'MS-CIT': 5000,
      'Tally GST': 6000,
      'Basic Computer': 3500,
      'Advanced Excel': 4500,
      'DTP': 4000
    };
  });

  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    const local = localStorage.getItem('dips_academic_years');
    return local ? JSON.parse(local) : ['2026', '2027', '2028', '2029'];
  });

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const local = localStorage.getItem('dips_selected_year');
    return local || '2026';
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const local = localStorage.getItem('dips_enquiries');
    const parsed: Enquiry[] = local ? JSON.parse(local) : DEFAULT_ENQUIRIES;
    
    let updated = false;
    const normalized = parsed.map(eq => {
      let isChanged = false;
      let AcademicYear = eq.AcademicYear;
      let CreatedDate = eq.CreatedDate;
      let UpdatedDate = eq.UpdatedDate;

      if (!AcademicYear) {
        AcademicYear = '2026';
        isChanged = true;
      }
      if (!CreatedDate) {
        CreatedDate = eq.enquiryDate || new Date().toISOString();
        isChanged = true;
      }
      if (!UpdatedDate) {
        UpdatedDate = eq.enquiryDate || new Date().toISOString();
        isChanged = true;
      }

      if (isChanged) {
        updated = true;
        return { ...eq, AcademicYear, CreatedDate, UpdatedDate };
      }
      return eq;
    });

    if (updated) {
      localStorage.setItem('dips_enquiries', JSON.stringify(normalized));
    }
    return normalized;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('dips_students');
    let parsed: Student[] = local ? JSON.parse(local) : DEFAULT_STUDENTS;
    
    let updated = false;
    parsed = parsed.map(s => {
      let isChanged = false;
      let currentDob = s.dob;
      if (s.id === 'stud-269' || s.fullName?.toUpperCase().includes('DIPAK MADHAV KHANDARE')) {
        if (s.dob !== '1993-08-20' || s.id !== 'stud-269') {
          currentDob = '1993-08-20';
          isChanged = true;
        }
      }

      let AcademicYear = s.AcademicYear;
      let CreatedDate = s.CreatedDate;
      let UpdatedDate = s.UpdatedDate;

      if (!AcademicYear) {
        AcademicYear = '2026';
        isChanged = true;
      }
      if (!CreatedDate) {
        CreatedDate = s.admissionDate || new Date().toISOString();
        isChanged = true;
      }
      if (!UpdatedDate) {
        UpdatedDate = s.admissionDate || new Date().toISOString();
        isChanged = true;
      }

      const updatedInstallments = s.installments.map(inst => {
        let instChanged = false;
        let instYr = inst.AcademicYear;
        let instCd = inst.CreatedDate;
        let instUd = inst.UpdatedDate;

        if (!instYr) {
          instYr = AcademicYear || '2026';
          instChanged = true;
        }
        if (!instCd) {
          instCd = inst.paymentDate || new Date().toISOString();
          instChanged = true;
        }
        if (!instUd) {
          instUd = inst.paymentDate || new Date().toISOString();
          instChanged = true;
        }

        if (instChanged) {
          isChanged = true;
          return { ...inst, AcademicYear: instYr, CreatedDate: instCd, UpdatedDate: instUd };
        }
        return inst;
      });

      if (isChanged) {
        updated = true;
        return { 
          ...s, 
          id: s.id === 'stud-269' || s.fullName?.toUpperCase().includes('DIPAK MADHAV KHANDARE') ? 'stud-269' : s.id, 
          dob: currentDob, 
          AcademicYear, 
          CreatedDate, 
          UpdatedDate,
          installments: updatedInstallments
        };
      }
      return s;
    });

    if (updated) {
      localStorage.setItem('dips_students', JSON.stringify(parsed));
    }
    return parsed;
  });

  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [autoOpenAddForm, setAutoOpenAddForm] = useState<boolean>(false);

  // Cross-module logic parameters
  const [prefilledEnquiry, setPrefilledEnquiry] = useState<Enquiry | null>(null);
  
  // Active Receipt Modal details if any
  const [activeReceipt, setActiveReceipt] = useState<{ student: Student; installment: Installment } | null>(null);

  // --- AUTH AND FIREBASE SYNC MANAGEMENT ---
  const [user, setUser] = useState<any>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Sign-in error", e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign-out error", e);
    }
  };

  // Helper to sync course configs to Firestore appConfig document
  const writeAppConfig = async (nextCourses: string[], nextFees: Record<string, number>, nextAcYears: string[], nextSelected: string) => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'settings', 'appConfig'), {
          courses: nextCourses,
          courseFees: nextFees,
          academicYears: nextAcYears,
          selectedYear: nextSelected
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `settings/appConfig`);
      }
    }
  };

  // Listen for dynamic authentication changes & run one-time Cloud Database bootstrapping / migrations
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncLoading(true);
        try {
          // A. Sync Global Settings Document
          const settingsRef = doc(db, 'settings', 'configs');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setSettings(settingsSnap.data() as InstituteSettings);
          } else {
            await setDoc(settingsRef, settings);
          }

          // B. Sync Global AppConfig Document (courses, courseFees, academicYears)
          const appConfigRef = doc(db, 'settings', 'appConfig');
          const appConfigSnap = await getDoc(appConfigRef);
          if (appConfigSnap.exists()) {
            const data = appConfigSnap.data();
            if (data.courses) setCourses(data.courses);
            if (data.courseFees) setCourseFees(data.courseFees);
            if (data.academicYears) setAcademicYears(data.academicYears);
            if (data.selectedYear) setSelectedYear(data.selectedYear);
          } else {
            await setDoc(appConfigRef, {
              courses,
              courseFees,
              academicYears,
              selectedYear
            });
          }

          // C. Bootstrapped sync of Enquiries
          const enquiriesColl = collection(db, 'enquiries');
          const enquiriesSnap = await getDocs(enquiriesColl);
          if (enquiriesSnap.empty && enquiries.length > 0) {
            for (const enq of enquiries) {
              await setDoc(doc(db, 'enquiries', enq.id), enq);
            }
          }

          // D. Bootstrapped sync of Students
          const studentsColl = collection(db, 'students');
          const studentsSnap = await getDocs(studentsColl);
          if (studentsSnap.empty && students.length > 0) {
            for (const stud of students) {
              await setDoc(doc(db, 'students', stud.id), stud);
            }
          }
        } catch (err) {
          console.error("Firebase Sync/Migration Error: ", err);
        } finally {
          setSyncLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Setup real-time listeners for live synchronization across cloud sessions
  useEffect(() => {
    if (!user || syncLoading) return;

    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
      const list: Enquiry[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Enquiry);
      });
      list.sort((a, b) => (b.CreatedDate || '').localeCompare(a.CreatedDate || ''));
      setEnquiries(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'enquiries');
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Student);
      });
      list.sort((a, b) => (b.CreatedDate || '').localeCompare(a.CreatedDate || ''));
      setStudents(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'configs'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as InstituteSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/configs');
    });

    const unsubAppConfig = onSnapshot(doc(db, 'settings', 'appConfig'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.courses) setCourses(data.courses);
        if (data.courseFees) setCourseFees(data.courseFees);
        if (data.academicYears) setAcademicYears(data.academicYears);
        if (data.selectedYear) setSelectedYear(data.selectedYear);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/appConfig');
    });

    return () => {
      unsubEnquiries();
      unsubStudents();
      unsubSettings();
      unsubAppConfig();
    };
  }, [user, syncLoading]);

  // Sync back to local storage automatically (cached local sandbox mode)
  useEffect(() => {
    localStorage.setItem('dips_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('dips_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem('dips_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('dips_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('dips_course_fees', JSON.stringify(courseFees));
  }, [courseFees]);

  useEffect(() => {
    localStorage.setItem('dips_academic_years', JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem('dips_selected_year', selectedYear);
  }, [selectedYear]);

  const handleAddAcademicYear = (year: string) => {
    setAcademicYears(prev => {
      const next = [...prev, year];
      const finalized = Array.from(new Set(next)).sort((a, b) => Number(a) - Number(b));
      writeAppConfig(courses, courseFees, finalized, year);
      return finalized;
    });
    setSelectedYear(year);
  };

  // Adjust sidebar on initial load depending on window size
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // --- COORDINATE GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Alt+N (supports both lowercase/uppercase)
      const isNewShortcut = (e.ctrlKey && (e.key === 'n' || e.key === 'N')) || (e.altKey && (e.key === 'n' || e.key === 'N'));
      // Ctrl+S or Alt+S (supports both lowercase/uppercase)
      const isSaveShortcut = (e.ctrlKey && (e.key === 's' || e.key === 'S')) || (e.altKey && (e.key === 's' || e.key === 'S'));

      if (isNewShortcut) {
        e.preventDefault();
        if (currentMenu === 'enquiry') {
          // If we are currently on EnquiryView: trigger add Enquiry
          window.dispatchEvent(new CustomEvent('shortcut-add-enquiry'));
        } else {
          // Switch to admission tab & set auto-trigger
          setCurrentMenu('admission');
          setAutoOpenAddForm(true);
          // Wait briefly for component to mount and trigger event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('shortcut-add-admission'));
          }, 50);
        }
      }

      if (isSaveShortcut) {
        const saveStudBtn = document.getElementById('btn-student-form-save');
        const saveEnqBtn = document.getElementById('btn-enq-save');
        const saveInstBtn = document.getElementById('btn-inst-form-save');

        if (saveStudBtn || saveEnqBtn || saveInstBtn) {
          e.preventDefault();
          if (saveStudBtn) saveStudBtn.click();
          else if (saveEnqBtn) saveEnqBtn.click();
          else if (saveInstBtn) saveInstBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentMenu]);

  // 2. OPERATIONS IMPLEMENTATION (CALLBACKS)
  
  // --- ENQUIRY OPERATORS ---
  const handleAddEnquiry = async (enq: Omit<Enquiry, 'id' | 'status'>) => {
    const newEnq: Enquiry = {
      ...enq,
      id: `enq-${Math.floor(Math.random() * 900) + 100}`,
      status: 'pending',
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      AcademicYear: enq.AcademicYear || selectedYear
    };
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'enquiries', newEnq.id), newEnq);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `enquiries/${newEnq.id}`);
      }
    } else {
      setEnquiries(prev => [newEnq, ...prev]);
    }
  };

  const handleUpdateEnquiry = async (id: string, updated: Partial<Enquiry>) => {
    const found = enquiries.find(e => e.id === id);
    if (!found) return;
    const nextEnq = { ...found, ...updated, UpdatedDate: new Date().toISOString() };
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'enquiries', id), nextEnq);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `enquiries/${id}`);
      }
    } else {
      setEnquiries(prev => prev.map(item => item.id === id ? nextEnq : item));
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'enquiries', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `enquiries/${id}`);
      }
    } else {
      setEnquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleConvertToAdmission = (enq: Enquiry) => {
    // 1. Mark enquiry converted
    handleUpdateEnquiry(enq.id, { status: 'converted' });
    // 2. Load prefill state
    setPrefilledEnquiry(enq);
    // 3. Jump to admissions module
    setCurrentMenu('admission');
  };

  // --- ADMISSIONS OPERATORS ---
  const handleAddStudent = async (
    stud: Omit<Student, 'id' | 'paidAmount' | 'balanceFees' | 'installments'>,
    initialDeposit: number
  ) => {
    const studentId = `stud-${Math.floor(Math.random() * 90) + 200}`;
    const totalFees = courseFees[stud.course] || 5000;
    const paidAmount = Math.min(initialDeposit, totalFees);
    const balanceFees = Math.max(0, totalFees - paidAmount);

    // Auto generate the first receipt
    const firstReceipt: Installment = {
      installmentNo: 1,
      amount: paidAmount,
      paymentDate: stud.admissionDate,
      receiptNo: `RC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000) + 100}`,
      paymentMethod: 'Cash',
      AcademicYear: stud.AcademicYear || selectedYear,
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString()
    };

    const newStudent: Student = {
      ...stud,
      id: studentId,
      paidAmount,
      balanceFees,
      installments: paidAmount > 0 ? [firstReceipt] : [],
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      AcademicYear: stud.AcademicYear || selectedYear
    };

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'students', studentId), newStudent);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `students/${studentId}`);
      }
    } else {
      setStudents(prev => [newStudent, ...prev]);
    }

    // Automatically trigger receipt modal popup to review/print out of the box
    if (paidAmount > 0) {
      setActiveReceipt({ student: newStudent, installment: firstReceipt });
    }
  };

  const handleUpdateStudent = async (id: string, updated: Partial<Student>) => {
    const found = students.find(s => s.id === id);
    if (!found) return;

    const fullStud = { ...found, ...updated, UpdatedDate: new Date().toISOString() };
    // Recalculate balances
    const currentPaid = fullStud.installments.reduce((acc, c) => acc + c.amount, 0);
    fullStud.paidAmount = currentPaid;
    fullStud.balanceFees = Math.max(0, fullStud.totalFees - currentPaid);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'students', id), fullStud);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
      }
    } else {
      setStudents(prev => prev.map(item => item.id === id ? fullStud : item));
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
      }
    } else {
      setStudents(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddInstallment = async (studentId: string, inst: Omit<Installment, 'receiptNo' | 'installmentNo'>) => {
    // Generate fresh receipt serial number
    const receiptNo = `RC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000) + 100}`;
    const found = students.find(s => s.id === studentId);
    if (!found) return;

    const nextNo = found.installments.length + 1;
    const newInst: Installment = {
      ...inst,
      installmentNo: nextNo,
      receiptNo,
      AcademicYear: found.AcademicYear || selectedYear,
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString()
    };
    const updatedInsts = [...found.installments, newInst];
    const newPaid = updatedInsts.reduce((sum, current) => sum + current.amount, 0);
    const newBalance = Math.max(0, found.totalFees - newPaid);

    const updatedStudent: Student = {
      ...found,
      installments: updatedInsts,
      paidAmount: newPaid,
      balanceFees: newBalance,
      UpdatedDate: new Date().toISOString()
    };

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'students', studentId), updatedStudent);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
      }
    } else {
      setStudents(prev => prev.map(stud => stud.id === studentId ? updatedStudent : stud));
    }

    // Open Electronic Invoice Receipt Modal right away!
    setActiveReceipt({ student: updatedStudent, installment: newInst });
  };

  // --- SETTINGS OPERATORS ---
  const handleUpdateSettings = async (updated: InstituteSettings) => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'settings', 'configs'), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `settings/configs`);
      }
    } else {
      setSettings(updated);
    }
  };

  // --- COURSE MANAGEMENT OPERATORS ---
  const handleAddCourse = (name: string, fee: number) => {
    setCourses(prev => {
      const nextCourses = prev.includes(name) ? prev : [...prev, name];
      setCourseFees(prevFees => {
        const nextFees = { ...prevFees, [name]: fee };
        writeAppConfig(nextCourses, nextFees, academicYears, selectedYear);
        return nextFees;
      });
      return nextCourses;
    });
  };

  const handleUpdateCourse = (oldName: string, newName: string, fee: number) => {
    if (oldName !== newName) {
      setCourses(prev => {
        const nextCourses = prev.map(c => c === oldName ? newName : c);
        setCourseFees(prevFees => {
          const nextFees = { ...prevFees };
          delete nextFees[oldName];
          nextFees[newName] = fee;
          writeAppConfig(nextCourses, nextFees, academicYears, selectedYear);
          return nextFees;
        });
        return nextCourses;
      });
      // Cascade update to student and enquiry courses
      setStudents(prev => {
        const next = prev.map(s => s.course === oldName ? { ...s, course: newName } : s);
        if (auth.currentUser) {
          next.forEach(async (s) => {
            try {
              await setDoc(doc(db, 'students', s.id), s);
            } catch (e) {}
          });
        }
        return next;
      });
      setEnquiries(prev => {
        const next = prev.map(e => e.course === oldName ? { ...e, course: newName } : e);
        if (auth.currentUser) {
          next.forEach(async (e) => {
            try {
              await setDoc(doc(db, 'enquiries', e.id), e);
            } catch (e) {}
          });
        }
        return next;
      });
    } else {
      setCourseFees(prevFees => {
        const nextFees = { ...prevFees, [oldName]: fee };
        writeAppConfig(courses, nextFees, academicYears, selectedYear);
        return nextFees;
      });
    }
  };

  const handleDeleteCourse = (name: string) => {
    setCourses(prev => {
      const nextCourses = prev.filter(c => c !== name);
      setCourseFees(prevFees => {
        const nextFees = { ...prevFees };
        delete nextFees[name];
        writeAppConfig(nextCourses, nextFees, academicYears, selectedYear);
        return nextFees;
      });
      return nextCourses;
    });
  };

  const handleTriggerReceipt = (student: Student, inst: Installment) => {
    setActiveReceipt({ student, installment: inst });
  };

  const filteredStudents = students.filter(s => (s.AcademicYear || '2026') === selectedYear);
  const filteredEnquiries = enquiries.filter(e => (e.AcademicYear || '2026') === selectedYear);

  return (
    <div id="crm-layout-container" className="min-h-screen bg-[#f7fafc] font-sans flex flex-col md:flex-row text-gray-800">
      
      {/* SECTION A: LEFT CONSOLE DRAWER SIDEBAR */}
      <Sidebar
        currentMenu={currentMenu}
        setCurrentMenu={setCurrentMenu}
        lang={lang}
        settings={settings}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        academicYears={academicYears}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      {/* SECTION B: PRIMARY CONTENT VIEW AREA */}
      <div 
        id="crm-content-canvas" 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}
      >
        {/* Dynamic header tracker */}
        <Header
          currentMenu={currentMenu}
          lang={lang}
          setLang={setLang}
          settings={settings}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          academicYears={academicYears}
          onAddAcademicYear={handleAddAcademicYear}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          syncLoading={syncLoading}
        />

        {/* Core panel swapper */}
        <main id="crm-main-panel" className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentMenu === 'dashboard' && (
            <DashboardView
              students={filteredStudents}
              enquiries={filteredEnquiries}
              lang={lang}
              settings={settings}
              onNavigate={setCurrentMenu}
              onViewStudent={(student) => {
                // Navigate to standard admissions and highlight the record
                setCurrentMenu('admission');
              }}
              courses={courses}
              courseFees={courseFees}
              onTriggerReceipt={handleTriggerReceipt}
            />
          )}

          {currentMenu === 'enquiry' && (
            <EnquiryView
              enquiries={filteredEnquiries}
              onAddEnquiry={handleAddEnquiry}
              onUpdateEnquiry={handleUpdateEnquiry}
              onDeleteEnquiry={handleDeleteEnquiry}
              onConvertToAdmission={handleConvertToAdmission}
              lang={lang}
              courses={courses}
              settings={settings}
              selectedYear={selectedYear}
              academicYears={academicYears}
            />
          )}

          {currentMenu === 'admission' && (
            <AdmissionView
              students={filteredStudents}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddInstallment={handleAddInstallment}
              onTriggerReceipt={handleTriggerReceipt}
              prefilledEnquiry={prefilledEnquiry}
              clearPrefill={() => setPrefilledEnquiry(null)}
              lang={lang}
              courses={courses}
              courseFees={courseFees}
              settings={settings}
              autoOpenAddForm={autoOpenAddForm}
              clearAutoOpenAddForm={() => setAutoOpenAddForm(false)}
              selectedYear={selectedYear}
              academicYears={academicYears}
            />
          )}

          {currentMenu === 'fees' && (
            <FeesView
              students={filteredStudents}
              onTriggerReceipt={handleTriggerReceipt}
              onAddInstallment={handleAddInstallment}
              lang={lang}
              courses={courses}
              settings={settings}
            />
          )}

          {currentMenu === 'reports' && (
            <ReportsView
              students={filteredStudents}
              enquiries={filteredEnquiries}
              lang={lang}
              courses={courses}
            />
          )}

          {currentMenu === 'courses' && (
            <CourseView
              courses={courses}
              courseFees={courseFees}
              students={students}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              lang={lang}
            />
          )}

          {currentMenu === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              lang={lang}
              courses={courses}
              courseFees={courseFees}
              students={students}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          )}
        </main>
      </div>

      {/* SECTION C: E-RECEIPT POPUP DIALOG */}
      {activeReceipt && (
        <ReceiptModal
          student={activeReceipt.student}
          installment={activeReceipt.installment}
          settings={settings}
          lang={lang}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
}
