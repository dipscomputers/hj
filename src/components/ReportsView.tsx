/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  Users, 
  IndianRupee, 
  HelpCircle, 
  BookOpen, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import { Student, Enquiry, COURSES, formatDate } from '../types';
import { Language, translations } from '../locales';

interface ReportsViewProps {
  students: Student[];
  enquiries: Enquiry[];
  lang: Language;
  courses?: string[];
}

type ReportType = 'admission' | 'fees' | 'pending' | 'course' | 'enquiry';

export default function ReportsView({ students, enquiries, lang, courses }: ReportsViewProps) {
  const t = translations[lang];
  const activeCourses = courses || COURSES;
  const [activeReport, setActiveReport] = useState<ReportType>('admission');

  const totalFeesExpected = students.reduce((acc, curr) => acc + curr.totalFees, 0);
  const totalFeesReceived = students.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalFeesPending = students.reduce((acc, curr) => acc + curr.balanceFees, 0);

  // Expose Excel (CSV)
  const handleExportCSV = () => {
    let headers = "";
    let rows = "";
    let filename = `DIPS_${activeReport}_report.csv`;

    if (activeReport === 'admission') {
      headers = "ID,Name,Contact,Village,Course,Admission Date,Gross fees\n";
      rows = students.map(s => `"${s.id}","${s.fullName}","${s.mobile}","${s.village}","${s.course}","${formatDate(s.admissionDate)}",${s.totalFees}`).join("\n");
    } else if (activeReport === 'fees') {
      headers = "Student ID,Student Name,Installment Number,Amount Deposited,Date,Receipt Number,Method\n";
      rows = students.flatMap(s => s.installments.map(inst => (
        `"${s.id}","${s.fullName}",${inst.installmentNo},${inst.amount},"${formatDate(inst.paymentDate)}","${inst.receiptNo}","${inst.paymentMethod}"`
      ))).join("\n");
    } else if (activeReport === 'pending') {
      headers = "ID,Name,Contact,Course,Gross Fee,Paid Fee,Balance Outstanding\n";
      rows = students.filter(s => s.balanceFees > 0).map(s => (
        `"${s.id}","${s.fullName}","${s.mobile}","${s.course}",${s.totalFees},${s.paidAmount},${s.balanceFees}`
      )).join("\n");
    } else if (activeReport === 'course') {
      headers = "Course Program,Enrolled Students,Total Dues Expected,Total Collected\n";
      rows = activeCourses.map(course => {
        const matching = students.filter(s => s.course === course);
        const expected = matching.reduce((sum, s) => sum + s.totalFees, 0);
        const collected = matching.reduce((sum, s) => sum + s.paidAmount, 0);
        return `"${course}",${matching.length},${expected},${collected}`;
      }).join("\n");
    } else if (activeReport === 'enquiry') {
      headers = "ID,Student Name,Mobile Number,Village,Course,Date,Referral,Status\n";
      rows = enquiries.map(e => `"${e.id}","${e.fullName}","${e.mobile}","${e.village}","${e.course}","${formatDate(e.enquiryDate)}","${e.referralName}","${e.status}"`).join("\n");
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableHTML = "";
    let rTitle = "";

    if (activeReport === 'admission') {
      rTitle = "Student Registration Admission Index";
      tableHTML = `
        <table>
          <thead>
            <tr><th>ID</th><th>Student Name</th><th>Contact</th><th>Course</th><th>Admission Date</th></tr>
          </thead>
          <tbody>
            ${students.map(s => `<tr><td>${s.id}</td><td>${s.fullName}</td><td>${s.mobile}</td><td>${s.course}</td><td>${formatDate(s.admissionDate)}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'fees') {
      rTitle = "Fees Collections Audit Log";
      tableHTML = `
        <table>
          <thead>
            <tr><th>Student Name</th><th>Course</th><th>Inst No</th><th>Paid Amount</th><th>Date</th><th>Receipt No</th></tr>
          </thead>
          <tbody>
            ${students.flatMap(s => s.installments.map(i => `<tr><td>${s.fullName}</td><td>${s.course}</td><td>#${i.installmentNo}</td><td>₹${i.amount}</td><td>${formatDate(i.paymentDate)}</td><td>${i.receiptNo}</td></tr>`)).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'pending') {
      rTitle = "Pending Outstanding Liabilities Index";
      tableHTML = `
        <table>
          <thead>
            <tr><th>Student Name</th><th>Course</th><th>Contact</th><th>Gross Fee</th><th>Paid</th><th>Outstanding</th></tr>
          </thead>
          <tbody>
            ${students.filter(s => s.balanceFees > 0).map(s => `<tr><td>${s.fullName}</td><td>${s.course}</td><td>${s.mobile}</td><td>₹${s.totalFees}</td><td>₹${s.paidAmount}</td><td style="color:red; font-weight:bold;">₹${s.balanceFees}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'course') {
      rTitle = "Course Distribution and Collections Statistics Summary";
      tableHTML = `
        <table>
          <thead>
            <tr><th>Course Name</th><th>Admitted Students</th><th>Capital Expected</th><th>Revenue Collected</th></tr>
          </thead>
          <tbody>
            ${activeCourses.map(c => {
              const matching = students.filter(s => s.course === c);
              const exp = matching.reduce((sum, s) => sum + s.totalFees, 0);
              const col = matching.reduce((sum, s) => sum + s.paidAmount, 0);
              return `<tr><td>${c}</td><td>${matching.length}</td><td>₹${exp}</td><td>₹${col}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeReport === 'enquiry') {
      rTitle = "Counselling Admission Enquiry Ledger List";
      tableHTML = `
        <table>
          <thead>
            <tr><th>Name</th><th>Contact</th><th>Village</th><th>Course Wanted</th><th>Enquiry Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${enquiries.map(e => `<tr><td>${e.fullName}</td><td>${e.mobile}</td><td>${e.village}</td><td>${e.course}</td><td>${formatDate(e.enquiryDate)}</td><td>${e.status.toUpperCase()}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${rTitle}</title>
          <style>
            body { font-family:sans-serif; margin:30px; color:#333; }
            h2 { color:#2b6cb0; margin-bottom:5px; }
            table { width:100%; border-collapse:collapse; margin-top:15px; }
            th, td { border:1px solid #ddd; padding:8px; text-align:left; font-size:12px; }
            th { background-color:#3182ce; color:white; }
          </style>
        </head>
        <body>
          <h2>DIPs Computers, Shirpur Jain</h2>
          <p>Official Institutional Audit Ledger Summaries &bull; Reports Section</p>
          <hr />
          <h3>${rTitle} (${formatDate(new Date().toISOString().split('T')[0])})</h3>
          ${tableHTML}
          <p style="margin-top:50px; font-size:12px; text-align:right;">Verified by DIPs Administration</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">

      {/* 1. SECTION HEADLINE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h2 id="reports-main-title" className="text-xl font-bold text-gray-800">
            {lang === 'en' ? 'Report Analytics Center' : 'संस्थान अहवाल आणि दस्तऐवजीकरण'}
          </h2>
          <p className="text-xs text-gray-400">
            {lang === 'en' 
              ? 'Render specific student statistics, export bookkeeping logs, compile data rosters' 
              : 'विशेष अहवाल काढा, तपशीलवार विश्लेषणाची पाहणी करा आणि एक्सेल निर्यात करा'}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            id="btn-report-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-4 py-2.5 hover:bg-emerald-100 transition active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (CSV) Export</span>
          </button>
          <button
            id="btn-report-print-pdf"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs bg-blue-600 text-white font-bold rounded-lg px-4 py-2.5 hover:bg-blue-700 shadow transition active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>{lang === 'en' ? 'Print report vector' : 'अहवाल प्रिंट करा'}</span>
          </button>
        </div>
      </div>

      {/* 2. CHANGER REPORT TABS PANEL */}
      <div id="reports-tab-panel" className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
        
        <button
          id="btn-report-tab-admissions"
          onClick={() => setActiveReport('admission')}
          className={`p-3.5 rounded-xl border font-bold text-xs text-center flex flex-col items-center justify-center gap-1.5 transition ${activeReport === 'admission' ? 'bg-[#3182ce] text-white border-[#3182ce] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <Users className="h-5 w-5" />
          <span>Admission Report</span>
        </button>

        <button
          id="btn-report-tab-collections"
          onClick={() => setActiveReport('fees')}
          className={`p-3.5 rounded-xl border font-bold text-xs text-center flex flex-col items-center justify-center gap-1.5 transition ${activeReport === 'fees' ? 'bg-[#3182ce] text-white border-[#3182ce] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <IndianRupee className="h-5 w-5" />
          <span>Fees Collection</span>
        </button>

        <button
          id="btn-report-tab-pending"
          onClick={() => setActiveReport('pending')}
          className={`p-3.5 rounded-xl border font-bold text-xs text-center flex flex-col items-center justify-center gap-1.5 transition ${activeReport === 'pending' ? 'bg-[#3182ce] text-white border-[#3182ce] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <FileText className="h-5 w-5 text-rose-500" />
          <span>Pending Fees Ledger</span>
        </button>

        <button
          id="btn-report-tab-course"
          onClick={() => setActiveReport('course')}
          className={`p-3.5 rounded-xl border font-bold text-xs text-center flex flex-col items-center justify-center gap-1.5 transition ${activeReport === 'course' ? 'bg-[#3182ce] text-white border-[#3182ce] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <BookOpen className="h-5 w-5 text-sky-500" />
          <span>Course Analysis</span>
        </button>

        <button
          id="btn-report-tab-enquiries"
          onClick={() => setActiveReport('enquiry')}
          className={`p-3.5 rounded-xl border font-bold text-xs text-center flex flex-col items-center justify-center gap-1.5 transition ${activeReport === 'enquiry' ? 'bg-[#3182ce] text-white border-[#3182ce] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <HelpCircle className="h-5 w-5 text-amber-500" />
          <span>Enquiry Tracker</span>
        </button>

      </div>

      {/* 3. CORE DOCUMENT RENDERING */}
      <div id="report-ledger-view-wrapper" className="bg-white border rounded-2xl p-6 shadow-sm">
        
        {/* Report description banner */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h4 className="font-extrabold text-gray-800 text-sm tracking-wide uppercase">
              {activeReport === 'admission' && 'Student Admission Registry Index'}
              {activeReport === 'fees' && 'Fees Collections Ledger Index'}
              {activeReport === 'pending' && 'Outstanding Account Liabilities List'}
              {activeReport === 'course' && 'Course Wise Enrollment Breakdown'}
              {activeReport === 'enquiry' && 'Enquiry Lead Generation List'}
            </h4>
            <p className="text-xs text-gray-400 font-medium">Auto compiled on local database operations logs</p>
          </div>
          <div className="text-xs font-mono font-bold text-gray-400">
            Total records: {activeReport === 'enquiry' ? enquiries.length : students.length}
          </div>
        </div>

        {/* Dynamic preview list tables based on active tab selection */}
        {activeReport === 'admission' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="p-3">ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Course Program</th>
                  <th className="p-3">Date joined</th>
                  <th className="p-3">Residence</th>
                  <th className="p-3 text-right">M.R.P Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/55">
                    <td className="p-3 font-mono font-bold text-gray-400">#{s.id}</td>
                    <td className="p-3 font-semibold text-gray-800">{s.fullName}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{s.course}</span></td>
                    <td className="p-3 font-mono">{formatDate(s.admissionDate)}</td>
                    <td className="p-3 font-medium text-gray-500">{s.village}</td>
                    <td className="p-3 text-right font-bold font-mono">₹{s.totalFees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'fees' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Course</th>
                  <th className="p-3 text-center">Inst No</th>
                  <th className="p-3 text-right">Deposit Amt</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3 text-center">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {students.flatMap(s => s.installments.map((inst, i) => (
                  <tr key={inst.receiptNo} className="hover:bg-gray-50/55">
                    <td className="p-3 font-semibold font-mono text-gray-800">{inst.receiptNo}</td>
                    <td className="p-3 font-semibold text-gray-700">{s.fullName}</td>
                    <td className="p-3"><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700">{s.course}</span></td>
                    <td className="p-3 text-center font-bold">#{inst.installmentNo}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-600 font-mono">₹{inst.amount}</td>
                    <td className="p-3 font-mono">{formatDate(inst.paymentDate)}</td>
                    <td className="p-3 text-center">
                      <span className="px-1.5 py-0.5 border text-[9px] rounded font-bold bg-white text-gray-500">
                        {inst.paymentMethod}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'pending' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Full Student Name</th>
                  <th className="p-3">Mobile Contact</th>
                  <th className="p-3">Invoiced course fee</th>
                  <th className="p-3">Deposits Paid</th>
                  <th className="p-3 text-right text-rose-600">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {students.filter(s => s.balanceFees > 0).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/55">
                    <td className="p-3 font-mono font-bold text-gray-400">#{s.id}</td>
                    <td className="p-3 font-semibold text-gray-800">{s.fullName}</td>
                    <td className="p-3 font-mono text-gray-500">{s.mobile}</td>
                    <td className="p-3 font-mono">₹{s.totalFees}</td>
                    <td className="p-3 font-mono text-emerald-600">₹{s.paidAmount}</td>
                    <td className="p-3 text-right font-black font-mono text-rose-500">₹{s.balanceFees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'course' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="p-3">Academic Program Course</th>
                  <th className="p-3 text-center">Enrolled Students Count</th>
                  <th className="p-3 text-right">Invoiced Expected Capital</th>
                  <th className="p-3 text-right text-emerald-700">Accumulated Earnings</th>
                  <th className="p-3 text-right text-rose-500">Uncollected Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {activeCourses.map(c => {
                  const matching = students.filter(s => s.course === c);
                  const expected = matching.reduce((sum, s) => sum + s.totalFees, 0);
                  const collected = matching.reduce((sum, s) => sum + s.paidAmount, 0);
                  const remaining = matching.reduce((sum, s) => sum + s.balanceFees, 0);

                  return (
                    <tr key={c} className="hover:bg-gray-50/55">
                      <td className="p-3 font-extrabold text-sm text-gray-800">{c}</td>
                      <td className="p-3 text-center font-bold font-mono text-gray-600">{matching.length} Students</td>
                      <td className="p-3 text-right font-mono font-medium">₹{expected.toLocaleString()}</td>
                      <td className="p-3 text-right font-extrabold text-emerald-600 font-mono">₹{collected.toLocaleString()}</td>
                      <td className="p-3 text-right font-extrabold text-rose-600 font-mono">₹{remaining.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'enquiry' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b">
                  <th className="p-3">Reference</th>
                  <th className="p-3">Student Full Name</th>
                  <th className="p-3">Mobile Phone</th>
                  <th className="p-3">Residential Locality</th>
                  <th className="p-3">Course Program interested</th>
                  <th className="p-3">Enquiry Date</th>
                  <th className="p-3 text-right">Lead Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {enquiries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/55">
                    <td className="p-3 font-mono font-bold text-gray-400">#{e.id}</td>
                    <td className="p-3 font-semibold text-gray-800">{e.fullName}</td>
                    <td className="p-3 font-mono text-gray-500">{e.mobile}</td>
                    <td className="p-3 text-gray-600">{e.village}</td>
                    <td className="p-3 font-bold text-sky-700">{e.course}</td>
                    <td className="p-3 font-mono">{formatDate(e.enquiryDate)}</td>
                    <td className="p-3 text-right font-extrabold">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded tracking-wide font-bold ${e.status === 'converted' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
