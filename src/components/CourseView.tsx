/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  IndianRupee, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Language } from '../locales';
import { Student } from '../types';

interface CourseViewProps {
  courses: string[];
  courseFees: Record<string, number>;
  students: Student[];
  onAddCourse: (name: string, fee: number) => void;
  onUpdateCourse: (oldName: string, newName: string, fee: number) => void;
  onDeleteCourse: (name: string) => void;
  lang: Language;
}

export default function CourseView({
  courses,
  courseFees,
  students,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  lang
}: CourseViewProps) {
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseFee, setNewCourseFee] = useState<string>('');
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editFee, setEditFee] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isEn = lang === 'en';

  // Count active students in a course
  const studentCountByCourse = (courseName: string) => {
    return students.filter(s => s.course === courseName).length;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = newCourseName.trim();
    if (!trimmedName) {
      setErrorMsg(isEn ? 'Course name is required.' : 'कोर्सचे नाव आवश्यक आहे.');
      return;
    }

    if (courses.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setErrorMsg(isEn ? 'Course already exists!' : 'हा कोर्स अगोदरच समाविष्ट आहे!');
      return;
    }

    const feeAmount = Number(newCourseFee);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      setErrorMsg(isEn ? 'Please enter a valid fee amount.' : 'कृपया योग्य कोर्स फी रक्कम भरा.');
      return;
    }

    onAddCourse(trimmedName, feeAmount);
    setNewCourseName('');
    setNewCourseFee('');
    setSuccessMsg(isEn ? 'Course added successfully!' : 'कोर्स यशस्वीरित्या जोडला गेला!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleStartEdit = (courseName: string) => {
    setEditingCourse(courseName);
    setEditName(courseName);
    setEditFee(String(courseFees[courseName] || 0));
    setErrorMsg('');
  };

  const handleSaveEdit = (courseName: string) => {
    setErrorMsg('');
    const trimmedNewName = editName.trim();
    if (!trimmedNewName) {
      setErrorMsg(isEn ? 'Course name cannot be empty.' : 'कोर्सचे नाव रिकामे ठेवू शकत नाही.');
      return;
    }

    if (
      trimmedNewName.toLowerCase() !== courseName.toLowerCase() &&
      courses.some(c => c.toLowerCase() === trimmedNewName.toLowerCase())
    ) {
      setErrorMsg(isEn ? 'Another course with this name already exists!' : 'या नावाचा दुसरा कोर्स आधीपासून उपलब्ध आहे!');
      return;
    }

    const feeAmount = Number(editFee);
    if (isNaN(feeAmount) || feeAmount <= 0) {
      setErrorMsg(isEn ? 'Please enter a valid fee amount.' : 'कृपया योग्य कोर्स फी रक्कम प्रविष्ट करा.');
      return;
    }

    onUpdateCourse(courseName, trimmedNewName, feeAmount);
    setEditingCourse(null);
    setSuccessMsg(isEn ? 'Course updated successfully!' : 'कोर्स फी सुधारित झाली!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteClick = (courseName: string) => {
    setErrorMsg('');
    const count = studentCountByCourse(courseName);
    if (count > 0) {
      const confirmForce = window.confirm(
        isEn
          ? `Warning: There are ${count} student(s) enrolled in ${courseName}. Deleting this course will leave their course records as ${courseName}. Are you sure you want to delete?`
          : `चेतावणी: या कोर्समध्ये ${count} विद्यार्थी प्रवेशित आहेत. हा कोर्स डिलीट केल्यावर विद्यार्थ्यांच्या रेकॉर्डवर ${courseName} च राहील. तुम्ही खात्रीने डिलीट करू इच्छिता का?`
      );
      if (!confirmForce) return;
    } else {
      const confirmSimple = window.confirm(
        isEn
          ? `Are you sure you want to delete ${courseName}?`
          : `तुम्ही नक्की ${courseName} कोर्स डिलीट करू इच्छिता का?`
      );
      if (!confirmSimple) return;
    }

    onDeleteCourse(courseName);
    setSuccessMsg(isEn ? 'Course deleted successfully.' : 'कोर्स यशस्वीरित्या डिलीट केला.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Banner Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <BookOpen className="h-56 w-56" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-blue-500/30 text-blue-100 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-blue-400/20">
              {isEn ? 'Course Rates Configuration' : 'कोर्स आणि फी दर रचना'}
            </span>
            <h2 className="text-2xl font-bold font-sans mt-2">
              {isEn ? 'Course Fees Management' : 'कोर्स फी रचना व्यवस्थापन'}
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-1.5 opacity-90 max-w-xl">
              {isEn 
                ? 'Create, modify, and manage computer course profiles and their standard fee rates. Changes instantly apply to new student registrations.' 
                : 'विविध कॉम्प्युटर कोर्सेसचे नाव आणि फी चे दर व्यवस्थापित करा. येथे केलेले बदल त्वरित नवीन प्रवेश अर्ज फॉर्ममध्ये लागू होतील.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 shrink-0 text-center md:text-right">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">{isEn ? 'Total Courses' : 'एकूण कोर्सेस'}</div>
            <div className="text-2xl font-mono font-extrabold text-amber-300 mt-1">{courses.length} Active</div>
          </div>
        </div>
      </div>

      {/* Grid of Add Form & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to Add Course */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" />
              <span>{isEn ? 'Add New Course' : 'नवीन कोर्स जोडा'}</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {isEn ? 'Setup a new course with standard tuition fee' : 'नवीन कोर्स आणि त्याची चालू शैक्षणिक शुल्क निश्चित करा'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs flex items-center gap-2 font-medium">
              <span className="text-emerald-500">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {isEn ? 'Course Name' : 'कोर्सचे नाव'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCourseName}
                onChange={e => setNewCourseName(e.target.value)}
                placeholder="eg. MS-CIT, Tally GST"
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:border-blue-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {isEn ? 'Course Fee (₹)' : 'कोर्स फी रक्कम (₹)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-extrabold">₹</span>
                <input
                  type="number"
                  min={1}
                  value={newCourseFee}
                  onChange={e => setNewCourseFee(e.target.value)}
                  placeholder="eg. 5000"
                  className="w-full text-sm border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 focus:border-blue-500 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow active:scale-95 mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isEn ? 'Add Course Profile' : 'कोर्स समाविष्ट करा'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Courses Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">
                {isEn ? 'Active Courses List' : 'सध्या कार्यरत कोर्सेसची यादी'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {isEn ? 'Standard tuition rates used for billing and admissions' : 'विद्यार्थी फॉर्मवर लागू होणारे अधिकृत कोर्स फी शुल्क दर'}
              </p>
            </div>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold text-[10px] px-2.5 py-1 rounded">
              {courses.length} courses
            </span>
          </div>

          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-2.5 px-3">{isEn ? 'Course Name' : 'कोर्स नाव'}</th>
                  <th className="py-2.5 px-3 text-right">{isEn ? 'Enrolled Students' : 'प्रवेशित विद्यार्थी'}</th>
                  <th className="py-2.5 px-3 text-right">{isEn ? 'Course Fee' : 'कोर्स फी'}</th>
                  <th className="py-2.5 px-3 text-center w-28">{isEn ? 'Actions' : 'क्रिया/बदल'}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs select-none">
                {courses.map(course => {
                  const isEditing = editingCourse === course;
                  const totalEnrolled = studentCountByCourse(course);

                  return (
                    <tr key={course} className={`hover:bg-gray-50/50 transition-colors ${isEditing ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="bg-white border rounded px-2.5 py-1 font-bold text-gray-800 text-xs w-full max-w-[170px]"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                            <span className="font-bold text-gray-800 text-sm">{course}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                          <GraduationCap className="h-3 w-3 text-slate-500" />
                          <span>{totalEnrolled} {isEn ? 'students' : 'विद्यार्थी'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        {isEditing ? (
                          <div className="relative inline-block w-28 max-w-full text-left">
                            <span className="absolute left-2.5 top-1.5 text-slate-400 font-extrabold text-[10px]">₹</span>
                            <input
                              type="number"
                              min={1}
                              value={editFee}
                              onChange={e => setEditFee(e.target.value)}
                              className="bg-white border rounded pl-5 pr-1.5 py-1 font-bold text-gray-800 text-xs w-full text-right"
                            />
                          </div>
                        ) : (
                          <div className="font-extrabold text-blue-700 text-sm">
                            ₹{(courseFees[course] || 0).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(course)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded transition shadow-sm"
                                title={isEn ? 'Save' : 'जतन करा'}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCourse(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-1.5 rounded transition"
                                title={isEn ? 'Cancel' : 'रद्द करा'}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(course)}
                                className="bg-white border hover:bg-slate-50 border-slate-200 text-slate-700 p-1.5 rounded transition active:scale-95"
                                title={isEn ? 'Edit Fee' : 'फी सुधारा'}
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(course)}
                                className="bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 p-1.5 rounded transition active:scale-95"
                                title={isEn ? 'Remove Course' : 'कोर्स काढा'}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
