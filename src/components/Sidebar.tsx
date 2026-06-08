/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart4, 
  HelpCircle, 
  Users, 
  IndianRupee, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  GraduationCap, 
  UserCheck, 
  PlusCircle, 
  Sparkles,
  PhoneCall,
  Activity,
  Archive
} from 'lucide-react';
import { Language, translations } from '../locales';
import { InstituteSettings } from '../types';

interface SidebarProps {
  currentMenu: string;
  setCurrentMenu: (menu: string) => void;
  lang: Language;
  settings: InstituteSettings;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  academicYears: string[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

export default function Sidebar({
  currentMenu,
  setCurrentMenu,
  lang,
  settings,
  sidebarOpen,
  setSidebarOpen,
  academicYears,
  selectedYear,
  setSelectedYear
}: SidebarProps) {
  const t = translations[lang];

  // Menu lists matching Insurance CRM Sections
  const coreConsoleItems = [
    { id: 'dashboard', label: t.dashboard, icon: BarChart4 },
  ];

  const salesLeadsItems = [
    { id: 'admission', label: t.students, icon: Users },
    { id: 'enquiry', label: t.enquiries, icon: HelpCircle },
  ];

  const operationalFinanceItems = [
    { id: 'fees', label: t.fees, icon: IndianRupee },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet },
  ];

  const systemConfigItems = [
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const renderMenuItem = (item: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const IconComponent = item.icon;
    const isActive = currentMenu === item.id;
    return (
      <button
        key={item.id}
        id={`sidebar-item-${item.id}`}
        onClick={() => {
          setCurrentMenu(item.id);
          // Auto close on mobile
          if (window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-left ${
          isActive 
            ? 'bg-blue-600 text-white font-semibold shadow-sm text-sm' 
            : 'text-gray-400 hover:bg-gray-800/60 hover:text-white text-xs'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <IconComponent className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400 transition-colors'}`} />
          <span>{item.label}</span>
        </span>
        {isActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        )}
      </button>
    );
  };

  const renderArchiveMenuItem = (yr: string) => {
    const isCurrentActive = selectedYear === yr;
    return (
      <button
        key={yr}
        id={`sidebar-archive-${yr}`}
        onClick={() => {
          setSelectedYear(yr);
          setCurrentMenu('dashboard');
          if (window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group text-left ${
          isCurrentActive
            ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/50 text-[11px]' 
            : 'text-gray-400 hover:bg-gray-800/40 hover:text-white text-[11px]'
        }`}
      >
        <span className="flex items-center gap-2">
          <Archive className={`h-3.5 w-3.5 ${isCurrentActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400 transition-colors'}`} />
          <span>Archive {yr}</span>
        </span>
        {isCurrentActive && (
          <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
            Viewing
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Handheld overlay backdrop */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay-backdrop"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-48 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Primary Left Sidebar Column */}
      <aside
        id="sidebar-navigation"
        className={`fixed top-0 left-0 bottom-0 z-49 w-64 bg-[#1a202c] text-white flex flex-col border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div id="sidebar-brand-banner" className="h-[60px] flex items-center gap-2 px-4 bg-[#2b6cb0] border-b border-[#2b6cb0]/20">
          <GraduationCap className="h-6 w-6 text-white animate-bounce" />
          <div>
            <h1 id="sidebar-brand-text" className="font-bold text-sm tracking-wide text-white font-sans flex items-center gap-1">
              DIPs <span className="text-amber-300 font-mono">Computers</span>
            </h1>
            <p className="text-[10px] text-blue-100 font-mono tracking-widest uppercase mt-0.5">Agent CRM</p>
          </div>
        </div>

        {/* Administrator Greeting Card - Exact Reference replica */}
        <div id="admin-identity-card" className="p-4 border-b border-gray-800 bg-gray-900/60 flex items-center gap-3">
          <img 
            id="admin-profile-pic"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80" 
            alt="Director" 
            className="h-12 w-12 object-cover rounded-full border border-gray-700 shadow"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Hii, DIPSCOMPUTERS</div>
            <div className="font-semibold text-xs text-gray-200 mt-0.5 truncate max-w-[140px] flex items-center gap-1" title="DIPAK PATIL">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              DIPAK PATIL
            </div>
            <div className="inline-flex items-center gap-1 bg-[#2b6cb0]/20 border border-[#2b6cb0]/30 rounded px-1.5 py-0.5 text-[8px] font-bold text-[#63b3ed] uppercase tracking-wider mt-1.5">
              <UserCheck className="h-2 w-2" />
              Professional
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Scroller Links */}
        <nav id="sidebar-nav-scroller" className="flex-1 overflow-y-auto p-3 space-y-5 select-none custom-scrollbar py-4">
          
          {/* Section 1: CORE CONSOLE */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              CORE CONSOLE
            </h3>
            {coreConsoleItems.map(renderMenuItem)}
          </div>

          {/* Section 2: SALES & LEADS */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              SALES & LEADS
            </h3>
            {salesLeadsItems.map(renderMenuItem)}
          </div>

          {/* Section 3: OPERATIONS & FINANCE */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              INSURANCE OPERATIONS
            </h3>
            {operationalFinanceItems.map(renderMenuItem)}
          </div>

          {/* Section 3b: ARCHIVE CENTER */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Previous Year Archives' : 'पूर्वीचे रेकॉर्ड आर्काइव्ह'}
            </h3>
            <div className="space-y-1 bg-gray-950/20 p-2 rounded-lg border border-gray-800/40">
              {academicYears.map(renderArchiveMenuItem)}
            </div>
          </div>

          {/* Section 4: SYSTEM CONFIG */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              SYSTEM CONFIG
            </h3>
            {systemConfigItems.map(renderMenuItem)}
          </div>

          {/* Institutional Stamp Info */}
          <div id="company-stamp-box" className="pt-6 border-t border-gray-800/60 text-center">
            <div className="text-[10px] text-gray-500">Need support? Contact Dipak Sir</div>
            <div className="text-xs font-mono text-[#63b3ed] font-semibold mt-1 flex items-center justify-center gap-1">
              <PhoneCall className="h-2.5 w-2.5" />
              +91 {settings.mobile1}
            </div>
          </div>
        </nav>

        {/* Footer info lockup */}
        <div className="p-3 border-t border-gray-850 bg-gray-900/40 flex justify-center items-center text-[10px] text-gray-500 font-mono">
          <span>DIPs Computers Control Panel</span>
        </div>
      </aside>
    </>
  );
}
