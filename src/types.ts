/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Enquiry {
  id: string;
  fullName: string;
  mobile: string;
  village: string;
  course: string;
  referralName: string;
  enquiryDate: string;
  status: 'pending' | 'converted' | 'cancelled';
  notes?: string;
  AcademicYear?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
}

export interface Installment {
  installmentNo: number;
  amount: number;
  paymentDate: string;
  receiptNo: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking';
  AcademicYear?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
}

export interface Student {
  id: string;
  photo: string; // Base64 or Avatar URL
  fullName: string;
  mobile: string;
  dob: string;
  village: string;
  course: string;
  referralName: string;
  admissionDate: string;
  totalFees: number;
  paidAmount: number;
  balanceFees: number;
  installments: Installment[];
  nextInstallmentDate?: string;
  AcademicYear?: string;
  CreatedDate?: string;
  UpdatedDate?: string;
}

export interface InstituteSettings {
  instituteName: string;
  logo: string;
  receiptLogo?: string;
  ownerName: string;
  email: string;
  website: string;
  mobile1: string;
  mobile2: string;
  address: string;
  themeColor: 'blue' | 'indigo' | 'emerald' | 'slate' | 'violet';
  whatsAppTemplate?: string;
  whatsAppAdmissionTemplate?: string;
  whatsAppReminderTemplate?: string;
  whatsAppReceiptTemplate?: string;
}

export type ViewMode = 'card' | 'list';

export const COURSE_FEES: Record<string, number> = {
  'MS-CIT': 5000,
  'Tally GST': 6000,
  'Basic Computer': 3500,
  'Advanced Excel': 4500,
  'DTP': 4000
};

export const COURSES = ['MS-CIT', 'Tally GST', 'Basic Computer', 'Advanced Excel', 'DTP'];
export const VILLAGES = ['Shirpur Jain', 'Malegaon', 'Washim', 'Kenwad', 'Ansing', 'Risod', 'Mangrulpir'];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'NetBanking'];

/**
 * Utility function to format any YYYY-MM-DD date string to DD-MM-YYYY.
 * If the input is already in DD-MM-YYYY format or is invalid, it is gracefully handled.
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const trimmed = dateString.trim();
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (parts[2].length === 4) { // DD-MM-YYYY
      return trimmed;
    }
  }
  // Alternate format with slash
  const slashParts = trimmed.split('/');
  if (slashParts.length === 3) {
    if (slashParts[0].length === 4) { // YYYY/MM/DD
      return `${slashParts[2]}-${slashParts[1]}-${slashParts[0]}`;
    }
    if (slashParts[2].length === 4) { // DD/MM/YYYY converted to DD-MM-YYYY
      return `${slashParts[0]}-${slashParts[1]}-${slashParts[2]}`;
    }
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {}
  return trimmed;
}

