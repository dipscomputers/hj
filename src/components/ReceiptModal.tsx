/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, MessageSquare } from 'lucide-react';
import { Student, Installment, InstituteSettings, formatDate } from '../types';
import { Language, translations } from '../locales';

interface ReceiptModalProps {
  student: Student;
  installment: Installment;
  settings: InstituteSettings;
  lang: Language;
  onClose: () => void;
}

// Function to convert number to words
function numberToWords(amount: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (amount === 0) return 'Two Zero';
  
  const convert = (num: number): string => {
    if (num < 20) return words[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + words[num % 10] : '');
    if (num < 1000) return words[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '');
    return num.toString();
  };
  
  return convert(amount) + ' Rupees Only';
}

const getWhatsAppReceiptMessage = (
  studentName: string,
  courseName: string,
  paymentDate: string,
  receiptNo: string,
  paidAmount: number,
  balanceAmount: number,
  customTemplate?: string
) => {
  const defaultMsg = `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

तुमचे *दिप्स कॉम्प्युटर्स* मध्ये शुल्क यशस्वीरीत्या जमा केल्याबद्दल मनःपूर्वक धन्यवाद! 🧾✨

*फी पावती तपशील:*
----------------------------------
👤 विद्यार्थी: *[विद्यार्थ्याचे नाव]*
🎓 कोर्स: *[कोर्सचे नाव]*
💵 जमा तारीख: *[जमा तारीख]*
🔢 पावती क्रमांक: *[पावती क्रमांक]*
💰 जमा रक्कम: *₹[भरलेली रक्कम]*
Remaining थकीत रक्कम (Balance): *₹[शिल्लक रक्कम]*
----------------------------------

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.
📞 संपर्क: 9049102035 / 8888732035

*तुमच्या उज्ज्वल भविष्यासाठी शुभेच्छा!* 🚀`;

  const baseTemplate = customTemplate || defaultMsg;
  return baseTemplate
    .replace(/\[विद्यार्थ्याचे नाव\]/g, studentName)
    .replace(/\[कोर्सचे नाव\]/g, courseName)
    .replace(/\[जमा तारीख\]/g, formatDate(paymentDate))
    .replace(/\[पावती क्रमांक\]/g, receiptNo)
    .replace(/\[भरलेली रक्कम\]/g, paidAmount.toLocaleString())
    .replace(/\[शिल्लक रक्कम\]/g, balanceAmount.toLocaleString());
};

export default function ReceiptModal({ student, installment, settings, lang, onClose }: ReceiptModalProps) {
  const t = translations[lang];
  const printRef = useRef<HTMLDivElement>(null);

  const isCustomLogo = !!(settings.receiptLogo || (settings.logo && !settings.logo.includes("unsplash.com/photo-1546410531-bb4caa6b424d")));
  const headerLogoSrc = settings.receiptLogo || (isCustomLogo ? settings.logo : null);

  const handleSendWhatsApp = () => {
    const text = getWhatsAppReceiptMessage(
      student.fullName,
      student.course,
      installment.paymentDate,
      installment.receiptNo,
      installment.amount,
      student.balanceFees,
      settings.whatsAppReceiptTemplate
    );
    const cleanPhone = student.mobile.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (printContent) {
      const win = window.open('', '', 'height=700,width=1000');
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Fees Receipt - ${student.fullName}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
                body {
                  margin: 0;
                  padding: 10px;
                  background-color: #ffffff;
                  color: #000000;
                  font-family: 'Poppins', 'Noto Sans Marathi', sans-serif;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .receipt-container {
                  border: 4px solid #002060 !important;
                  padding: 20px;
                  border-radius: 12px;
                  max-width: 950px;
                  margin: 0 auto;
                  box-sizing: border-box;
                  background-color: #ffffff;
                }
                .no-print { display: none !important; }
                
                /* Class-based styles for direct print */
                .header-flex {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 2px solid #002060;
                  padding-bottom: 12px;
                  margin-bottom: 15px;
                  gap: 15px;
                }
                .logo-section {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .logo-wrapper {
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  width: 92px;
                  height: 92px;
                }
                .logo-box {
                  width: 86px;
                  height: 86px;
                  border-radius: 8px;
                  border: 2px solid rgba(30, 58, 138, 0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: white;
                  padding: 4px;
                  box-sizing: border-box;
                  overflow: hidden;
                }
                .logo-box img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
                .logo-box-default {
                  width: 86px;
                  height: 86px;
                  border-radius: 50%;
                  border: 2.5px solid #dc2626;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #fffbeb;
                  padding: 6px;
                  box-sizing: border-box;
                }
                .shirpur-banner {
                  position: absolute;
                  bottom: -8px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: #dc2626 !important;
                  background: linear-gradient(to right, #dc2626, #f43f5e, #dc2626) !important;
                  color: white !important;
                  font-family: 'Poppins', monospace;
                  font-weight: bold;
                  font-size: 8px !important;
                  padding: 2px 8px !important;
                  border-radius: 4px !important;
                  border: 1px solid white !important;
                  text-align: center;
                  white-space: nowrap !important;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.15) !important;
                  letter-spacing: 0.05em;
                  z-index: 10;
                }
                .brand-info {
                  margin-left: 8px;
                  text-align: left;
                }
                .school-title {
                  font-size: 28px;
                  font-weight: 800;
                  color: #002060;
                  margin: 0;
                  line-height: 1.1;
                }
                .title-line {
                  width: 100%;
                  height: 3px;
                  background: linear-gradient(to right, #ef4444, #f59e0b);
                  background-color: #ef4444;
                  margin: 4px 0;
                }
                .school-address {
                  font-size: 11px;
                  color: #111;
                  line-height: 1.3;
                  margin: 0;
                  font-weight: 600;
                }
                .flex-right {
                  display: flex;
                  align-items: center;
                  gap: 15px;
                }
                .owner-contact-box {
                  font-size: 11px;
                  color: #111;
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  border-left: 1.5px solid #ccc;
                  padding-left: 15px;
                }
                .owner-line, .phone-line {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-weight: 600;
                }
                .phone-line {
                  color: #002060;
                  font-family: monospace;
                  font-weight: bold;
                }
                .icon-span {
                  background-color: #f1f5f9;
                  border-radius: 4px;
                  padding: 3px;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                }
                .receipt-ribbon {
                  background-color: #002060;
                  color: white;
                  padding: 10px 18px;
                  border-radius: 0 8px 8px 24px;
                  border-left: 4px solid #ef4444;
                  text-align: center;
                }
                .ribbon-sub {
                  font-size: 9px;
                  color: #f87171;
                  font-weight: bold;
                  letter-spacing: 0.1em;
                  display: block;
                }
                .ribbon-main {
                  font-size: 14px;
                  font-weight: bold;
                  display: block;
                  letter-spacing: 0.05em;
                }
                .twin-boxes-row {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 15px;
                }
                .course-box, .date-box {
                  display: flex;
                  align-items: center;
                  border: 2px solid #002060;
                  border-radius: 8px;
                  overflow: hidden;
                  background-color: white;
                }
                .box-label {
                  background-color: #002060;
                  color: white;
                  padding: 8px 15px;
                  font-weight: bold;
                  font-size: 13px;
                  min-width: 90px;
                  text-align: center;
                }
                .box-value {
                  padding: 8px 15px;
                  font-size: 18px;
                  font-weight: 800;
                  color: #002060;
                  font-family: monospace;
                  flex: 1;
                }
                .body-grid {
                  display: grid;
                  grid-template-columns: 2.3fr 1fr;
                  gap: 20px;
                  border-bottom: 2px solid #002060;
                  padding-bottom: 15px;
                  margin-bottom: 15px;
                }
                .form-fields-side {
                  display: flex;
                  flex-direction: column;
                  gap: 15px;
                }
                .field-row {
                  display: flex;
                  align-items: flex-end;
                  font-size: 14px;
                }
                .field-label {
                  font-weight: bold;
                  color: #050505;
                  white-space: nowrap;
                  margin-right: 8px;
                }
                .field-value-line {
                  flex: 1;
                  border-bottom: 1.5px dotted #002060;
                  padding-bottom: 2px;
                  font-weight: bold;
                  color: #002060;
                  font-size: 15px;
                  padding-left: 10px;
                }
                .italic-text {
                  font-style: italic;
                  font-weight: 500;
                }
                .field-row-stack {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                }
                .empty-dashed-line {
                  border-bottom: 1.5px dotted #002060;
                  height: 18px;
                  width: 100%;
                }
                .inline-action-row {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-top: 15px;
                }
                .footer-rs-box {
                  display: flex;
                  align-items: center;
                  border: 2.5px solid #002060;
                  border-radius: 8px;
                  overflow: hidden;
                  height: 52px;
                }
                .footer-rs-label {
                  background-color: #002060;
                  color: white;
                  padding: 8px 18px;
                  font-weight: 900;
                  font-size: 20px;
                  height: 100%;
                  display: flex;
                  align-items: center;
                }
                .footer-rs-val {
                  padding: 8px 25px;
                  font-size: 22px;
                  font-weight: 950;
                  color: #002060;
                  font-family: monospace;
                  background-color: white;
                  height: 100%;
                  display: flex;
                  align-items: center;
                }
                .signature-box {
                  text-align: center;
                  min-width: 200px;
                }
                .signature-for {
                  font-size: 12px;
                  font-weight: bold;
                  color: #002060;
                }
                .signature-line-decor {
                  border-top: 1.5px solid #002060;
                  margin-top: 8px;
                  padding-top: 4px;
                }
                .signature-title {
                  font-size: 9px;
                  font-weight: 800;
                  color: #555;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                }
                .print-disclaimer {
                  font-size: 10px;
                  font-style: italic;
                  color: #ef4444;
                  font-weight: bold;
                }
                .right-calc-side {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  border-left: 2px solid #002060;
                  padding-left: 15px;
                  gap: 12px;
                }
                .column-calc-box {
                  border: 2px solid #002060;
                  border-radius: 8px;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                }
                .calc-item-header {
                  background-color: #002060;
                  color: white;
                  padding: 4px 10px;
                  font-size: 10px;
                  font-weight: 900;
                  text-transform: uppercase;
                  text-align: center;
                  letter-spacing: 0.05em;
                }
                .calc-item-value {
                  padding: 8px;
                  font-size: 15px;
                  font-weight: 800;
                  text-align: center;
                  font-family: monospace;
                  background-color: #f8fafc;
                }
                .date-highlight {
                  color: #dc2626;
                }
                .fee-highlight {
                  color: #d97706;
                }
                .footer-grid-bottom {
                  display: grid;
                  grid-template-columns: 1.5fr 0.8fr 1.5fr;
                  gap: 15px;
                  align-items: center;
                  font-size: 11px;
                }
                .conditions-col {
                  display: block;
                }
                .rules-ol {
                  margin: 0;
                  padding-left: 15px;
                  color: #1e293b;
                  font-weight: 600;
                  line-height: 1.45;
                }
                .rules-ol li {
                  margin-bottom: 5px;
                }
                .seal-badge-col {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .seal-badge-wrapper {
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .seal-badge-outer {
                  width: 76px;
                  height: 76px;
                  border-radius: 50%;
                  background-color: #1e3a8a;
                  border: 2.5px solid #fbbf24;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 3px;
                  box-sizing: border-box;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .seal-badge-inner {
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  border: 1px dashed rgba(255, 255, 255, 0.85);
                  background-color: #0c1938;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  box-sizing: border-box;
                }
                .seal-inner-1 {
                  font-size: 8px;
                  font-weight: 950;
                  color: #fda4af;
                  line-height: 1.1;
                  letter-spacing: 0.05em;
                }
                .seal-inner-2 {
                  font-size: 9px;
                  font-weight: 950;
                  color: white;
                  line-height: 1.1;
                  margin: 2px 0;
                  letter-spacing: 0.05em;
                }
                .seal-inner-3 {
                  font-size: 6.5px;
                  font-weight: 950;
                  color: #cbd5e1;
                  line-height: 1.1;
                  letter-spacing: 0.03em;
                }
                .marathi-note-col {
                  text-align: center;
                }
                .marathi-note-p {
                  font-size: 13px;
                  font-weight: 800;
                  color: #002060;
                  line-height: 1.45;
                  margin: 0;
                }
                .marathi-note-h {
                  font-size: 15px;
                  font-weight: 900;
                  color: #dc2626;
                  margin-top: 5px;
                }
                .marathi-note-dec {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 6px;
                  color: #f59e0b;
                  font-family: monospace;
                  font-size: 9px;
                  margin-top: 4px;
                }
                
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                @media print {
                  body { 
                    padding: 0 !important; 
                    margin: 0 !important;
                  }
                  .receipt-container {
                    border: 4px solid #002060 !important;
                    border-radius: 12px !important;
                    box-shadow: none !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    display: block !important;
                    padding: 20px !important;
                  }
                  .no-print { display: none !important; }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent}
              </div>
              <script>
                function triggerPrint() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
                if (document.readyState === 'complete') {
                  setTimeout(triggerPrint, 350);
                } else {
                  window.onload = function() {
                    setTimeout(triggerPrint, 350);
                  };
                  // Ultimate safety net
                  setTimeout(triggerPrint, 1500);
                }
              </script>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
      }
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      receiptMeta: "DIPs Computers Student Receipt",
      institute: settings.instituteName,
      address: settings.address,
      contact: `${settings.mobile1} / ${settings.mobile2}`,
      studentName: student.fullName,
      course: student.course,
      installmentNo: installment.installmentNo,
      amountPaid: installment.amount,
      paymentDate: formatDate(installment.paymentDate),
      receiptNumber: installment.receiptNo,
      balanceDue: student.balanceFees
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Receipt_${installment.receiptNo}_${student.fullName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm">
      <div 
        id="receipt-modal-card" 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:max-h-[92vh] border border-gray-200"
      >
        {/* Modal Header Controls */}
        <div id="receipt-modal-header" className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-800 text-lg">
              {lang === 'en' ? 'E-Receipt Generated' : 'ई-पावती तयार झाली'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
               id="btn-receipt-whatsapp"
               onClick={handleSendWhatsApp}
               className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition active:scale-95 shadow"
               title={lang === 'en' ? 'Send Fee Confirmation raw WhatsApp' : 'विद्यार्थ्याला व्हॉट्सॲपवर फी पावती मेसेज पाठवा'}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{lang === 'en' ? 'Send WhatsApp' : 'व्हॉट्सॲप पावती'}</span>
            </button>
            <button
               id="btn-receipt-print"
               onClick={handlePrint}
               className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition active:scale-95 shadow"
               title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
              <span>{t.print}</span>
            </button>
            <button
              id="btn-receipt-download"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg transition active:scale-95 shadow-sm"
              title="Download Data"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              id="btn-receipt-close"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Dynamic & Beautiful Premium Receipt Layout */}
        <div id="receipt-print-wrapper" className="p-6 overflow-y-auto flex-1 bg-slate-100/50 space-y-4">
          
          {/* VIP Prominent WhatsApp Send Action Alert */}
          <div className="max-w-[950px] mx-auto bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500 text-white rounded-full p-2 shrink-0 animate-bounce">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-gray-900 text-sm">
                  {lang === 'en' ? 'Fee Recorded Successfully!' : 'शुल्क यशस्वीरित्या जमा झाले आहे!'}
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {lang === 'en' 
                    ? `Click the button to send the fee payment receipt directly to ${student.fullName}'s WhatsApp (${student.mobile}).`
                    : `विद्यार्थी ${student.fullName} याला मोबाईल नंबर (${student.mobile}) वर फी पावतीचा व्हॉट्सॲप मेसेज पाठवण्यासाठी पुढील बटणावर क्लिक करा.`}
                </p>
              </div>
            </div>
            
            <button
              id="btn-receipt-whatsapp-banner"
              onClick={handleSendWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 text-xs cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{lang === 'en' ? 'Send WhatsApp Receipt' : 'व्हॉट्सॲपवर पावती पाठवा'}</span>
            </button>
          </div>
          <div 
            ref={printRef} 
            id="receipt-printable-content" 
            className="bg-white border-3 border-[#002060] rounded-xl p-5 md:p-6 shadow-md text-black font-sans max-w-[950px] mx-auto receipt-container"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-[#002060] pb-3 mb-4 gap-4 header-flex">
              {/* Logo Badge on left */}
              <div className="flex items-center gap-3 logo-section">
                <div className="relative flex flex-col items-center justify-center logo-wrapper" style={{ position: 'relative' }}>
                  {headerLogoSrc ? (
                    <div className="h-[86px] w-[86px] rounded-lg border-2 border-[#1e3a8a]/30 flex items-center justify-center bg-white p-1 shadow-sm overflow-hidden logo-box">
                      <img 
                        src={headerLogoSrc} 
                        alt="Custom Header Logo" 
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    /* Circular decorative emblem matching reference image */
                    <div className="h-[86px] w-[86px] rounded-full border-2 border-red-600 flex items-center justify-center bg-[#fffbeb] p-1.5 shadow-sm logo-box-default">
                      <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="47" stroke="#e11d48" strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="41" fill="#fef08a" stroke="#1e3a8a" strokeWidth="1.5" />
                        {/* Monogram DC */}
                        <text x="32" y="60" fontFamily="sans-serif" fontSize="34" fontWeight="950" fill="#16a34a">D</text>
                        <text x="52" y="62" fontFamily="sans-serif" fontSize="34" fontWeight="950" fill="#be123c">C</text>
                        <path d="M 12 50 A 38 38 0 0 1 88 50" stroke="#e11d48" strokeWidth="1" strokeDasharray="3 3"/>
                      </svg>
                    </div>
                  )}
                  {/* Red banner for Shirpur */}
                  {!headerLogoSrc && (
                    <div className="absolute -bottom-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-mono font-bold text-[8px] px-2 rounded-md border border-white text-center shadow-sm uppercase tracking-wider shirpur-banner">
                      || SHIRPUR ||
                    </div>
                  )}
                </div>
                
                {/* School title & subtext */}
                <div className="ml-1 text-center md:text-left brand-info">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#002060] tracking-wide font-sans m-0 leading-none school-title">
                    DIPs Computers
                  </h1>
                  <div className="w-full h-0.5 bg-gradient-to-r from-red-500 to-amber-500 my-1 title-line"></div>
                  <p className="text-[10px] md:text-[11px] text-gray-900 leading-tight font-semibold school-address">
                    Near Bank of Maharashtra, Yeole Complex,<br />
                    Shirpur Jain, Tq. Malegaon Dist.Washim 444504.
                  </p>
                </div>
              </div>

              {/* Owner Info & Contacts */}
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-right">
                <div className="text-xs text-gray-900 flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-300 md:pl-4 pt-2 md:pt-0 owner-contact-box">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 owner-line">
                    <span className="bg-slate-100 rounded p-1 text-slate-600 icon-span">
                      <svg className="h-3.5 w-3.5 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <span className="align-middle">Dipak Khandare (Patil)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#002060] phone-line">
                    <span className="bg-slate-100 rounded p-1 text-red-500 icon-span">
                      <svg className="h-3.5 w-3.5 inline-block align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.878 4.878l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <span className="align-middle">{settings.mobile1 || '9049102035'}, 8888732035</span>
                  </div>
                </div>

                {/* Accent Styled Receipt Ribbon */}
                <div className="bg-[#002060] text-white px-5 py-3 rounded-tr-xl rounded-br-xl rounded-bl-3xl border-l-4 border-red-500 text-center shadow-sm receipt-ribbon">
                  <span className="text-[10px] uppercase tracking-widest block font-bold text-red-400 font-mono ribbon-sub">FEES</span>
                  <span className="text-sm font-bold block leading-none font-mono ribbon-main">RECEIPT</span>
                </div>
              </div>
            </div>

            {/* Twin Custom Row for Course and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 twin-boxes-row">
              {/* Course box */}
              <div className="flex items-center border-2 border-[#002060] rounded-lg overflow-hidden bg-slate-50 course-box">
                <div className="bg-[#002060] text-white px-4 py-2 font-bold text-sm tracking-wide min-w-[90px] text-center box-label">
                  Course :
                </div>
                <div className="px-4 py-2 text-base md:text-lg font-extrabold text-[#002060] flex-1 font-mono uppercase bg-white box-value">
                  {student.course}
                </div>
              </div>

              {/* Date box */}
              <div className="flex items-center border-2 border-[#002060] rounded-lg overflow-hidden bg-slate-50 date-box">
                <div className="bg-[#002060] text-white px-4 py-2 font-bold text-sm tracking-wide min-w-[90px] text-center box-label">
                  Date :
                </div>
                <div className="px-4 py-2 text-base md:text-lg font-extrabold text-[#002060] flex-1 font-mono bg-white box-value">
                  {formatDate(installment.paymentDate)}
                </div>
              </div>
            </div>

            {/* Split layout: Solid Dotted Line input fields in Marathi & English on left, calculation box stack on right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-b-2 border-[#002060] pb-4 mb-4 body-grid">
              {/* Left Column (Main Form fields with dotted styling) */}
              <div className="md:col-span-8 flex flex-col gap-4 form-fields-side">
                {/* Field 1: Received with thanks form */}
                <div className="flex items-end text-sm field-row">
                  <span className="font-extrabold text-slate-900 whitespace-nowrap mr-2 field-label">
                    Received with Thanks From :
                  </span>
                  <span className="flex-1 border-b border-dashed border-[#002060] pb-1 font-extrabold text-[#002060] pl-3 text-sm md:text-base field-value-line">
                    {student.fullName}
                  </span>
                </div>

                {/* Field 2: The Sum of Rupees */}
                <div className="flex items-end text-sm field-row">
                  <span className="font-extrabold text-slate-900 whitespace-nowrap mr-2 field-label">
                    The Sum of Rupees :
                  </span>
                  <span className="flex-1 border-b border-dashed border-[#002060] pb-1 font-bold text-[#002060] pl-3 italic text-xs md:text-sm field-value-line italic-text">
                    {numberToWords(installment.amount)}
                  </span>
                </div>

                {/* Field 3: Remarks */}
                <div className="flex flex-col gap-2 mt-1 field-row-stack">
                  <div className="flex items-end text-sm field-row">
                    <span className="font-extrabold text-slate-900 whitespace-nowrap mr-2 field-label">
                      Remarks :
                    </span>
                    <span className="flex-1 border-b border-dashed border-[#002060] pb-1 font-semibold text-[#002060] pl-3 text-xs md:text-sm field-value-line">
                      Received via {installment.paymentMethod}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-[#002060] h-6 w-full empty-dashed-line"></div>
                </div>

                {/* Big Rupees box inline with authorization */}
                <div className="flex flex-wrap items-center justify-between mt-3 gap-4 inline-action-row">
                  {/* Big Custom Rs Box */}
                  <div className="flex items-center border-2 border-[#002060] rounded-lg overflow-hidden bg-[#002060] h-[52px] shadow-sm footer-rs-box">
                    <div className="text-white px-5 py-2 font-black text-xl tracking-wide footer-rs-label">
                      Rs.
                    </div>
                    <div className="bg-white px-6 py-2 font-black text-[#002060] font-mono text-xl h-full flex items-center footer-rs-val">
                      ₹ {installment.amount.toLocaleString()}/-
                    </div>
                  </div>

                  {/* Right hand Authorised Signatory block */}
                  <div className="text-center min-w-[200px] signature-box">
                    <span className="text-[11px] font-bold text-[#002060] block tracking-wide signature-for">
                      For, DIPs Computers
                    </span>
                    <div className="w-full border-t border-[#002060] my-2 pt-1 signature-line-decor">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 block signature-title">
                        Authorised Signatory
                      </span>
                    </div>
                  </div>
                </div>

                {/* Computer print red note */}
                <div className="mt-1 print-disclaimer">
                  <span className="text-[10px] italic font-bold text-red-500 tracking-wider">
                    * Computer Generated Print - No physical stamp required
                  </span>
                </div>
              </div>

              {/* Right Column (Calculation Box Stack) */}
              <div className="md:col-span-4 flex flex-col gap-3 justify-between md:border-l-2 md:border-[#002060] md:pl-5 right-calc-side">
                {/* Total Course Fees box */}
                <div className="border-2 border-[#002060] rounded-lg overflow-hidden flex flex-col column-calc-box">
                  <div className="bg-[#002060] text-white px-2 py-1 text-[10px] font-black uppercase text-center tracking-wider calc-item-header">
                    Total Courses Fees
                  </div>
                  <div className="p-2 font-extrabold text-[#002060] text-center text-sm md:text-base font-mono bg-[#f8fafc] calc-item-value">
                    ₹ {student.totalFees.toLocaleString()}
                  </div>
                </div>

                {/* Next Fees Date box */}
                <div className="border-2 border-[#002060] rounded-lg overflow-hidden flex flex-col column-calc-box">
                  <div className="bg-[#002060] text-white px-2 py-1 text-[10px] font-black uppercase text-center tracking-wider calc-item-header">
                    Next Fees Date
                  </div>
                  <div className="p-2 font-extrabold text-red-600 text-center text-sm md:text-base font-mono bg-[#f8fafc] calc-item-value date-highlight">
                    {student.nextInstallmentDate ? formatDate(student.nextInstallmentDate) : 'Not Scheduled'}
                  </div>
                </div>

                {/* Next Installments balance box */}
                <div className="border-2 border-[#002060] rounded-lg overflow-hidden flex flex-col column-calc-box">
                  <div className="bg-[#002060] text-white px-2 py-1 text-[10px] font-black uppercase text-center tracking-wider calc-item-header">
                    Remaining Fee
                  </div>
                  <div className="p-2 font-extrabold text-amber-600 text-center text-sm md:text-base font-mono bg-[#f8fafc] calc-item-value fee-highlight">
                    ₹ {student.balanceFees.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer containing conditions, blue badge and marathi quotation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center footer-grid-bottom">
              {/* Box 1: Rules and regulations */}
              <div className="md:col-span-5 conditions-col">
                <ol className="list-decimal pl-4 text-[11px] text-slate-850 font-semibold space-y-1.5 rules-ol">
                  <li>Money will be Not refund in any case.</li>
                  <li>Minimum 85% attendance Required.</li>
                  <li>Carry all receipts when Certificate Required.</li>
                </ol>
              </div>

              {/* Box 2: Seal Circle Element */}
              <div className="md:col-span-2 flex justify-center items-center py-2 md:py-0 seal-badge-col">
                <div className="relative flex flex-col items-center seal-badge-wrapper">
                  <div className="relative h-[76px] w-[76px] rounded-full bg-blue-900 flex items-center justify-center border-2 border-amber-400 p-0.5 shadow-md seal-badge-outer">
                    <div className="h-full w-full rounded-full border border-dashed border-white flex flex-col items-center justify-center p-0.5 text-center bg-blue-950 seal-badge-inner">
                      <span className="text-[8px] font-black text-rose-300 leading-none seal-inner-1">YOUR</span>
                      <span className="text-[9px] font-black text-white leading-none my-0.5 seal-inner-2">SUCCESS</span>
                      <span className="text-[8px] font-black text-rose-300 leading-none seal-inner-1">OUR</span>
                      <span className="text-[6.5px] font-black text-slate-300 leading-none seal-inner-3">COMMITMENT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Hearty Marathi Note */}
              <div className="md:col-span-5 text-center marathi-note-col">
                <p className="text-[13px] font-extrabold text-[#002060] tracking-wide leading-normal font-sans marathi-note-p">
                  सुस्पष्ट अध्ययन, शिस्तबद्ध प्रशिक्षण <br />
                  आणि तुमच्या उज्ज्वल भविष्यासाठी
                </p>
                <div className="text-[15px] font-black text-red-600 font-sans tracking-wide mt-1.5 marathi-note-h">
                  दिप्स कॉम्प्युटर्स तुमच्या सोबत!
                </div>
                {/* Decorative golden separator ornament */}
                <div className="flex justify-center items-center gap-1.5 mt-1.5 text-amber-500 font-mono text-[11px] marathi-note-dec">
                  <span>—•••</span>
                  <span className="text-red-500 font-serif text-xs">❦</span>
                  <span>•••—</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            id="btn-receipt-modal-whatsapp-footer"
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition active:scale-95 shadow cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{lang === 'en' ? 'Send WhatsApp' : 'व्हॉट्सॲप पावती'}</span>
          </button>
          <button
            id="btn-receipt-modal-close-footer"
            onClick={onClose}
            className="px-5 py-2 text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-lg transition active:scale-95"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
