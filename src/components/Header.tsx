/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, Bell, Globe, Sparkles, LogOut, Sun, Moon, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { Language } from '../locales';
import { InstituteSettings } from '../types';

interface HeaderProps {
  currentMenu: string;
  lang: Language;
  setLang: (lang: Language) => void;
  settings: InstituteSettings;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  academicYears: string[];
  onAddAcademicYear?: (year: string) => void;
  user?: any;
  onSignIn?: () => void;
  onSignOut?: () => void;
  syncLoading?: boolean;
}

export default function Header({ 
  currentMenu, 
  lang, 
  setLang, 
  settings, 
  sidebarOpen, 
  setSidebarOpen,
  selectedYear,
  setSelectedYear,
  academicYears,
  onAddAcademicYear,
  user = null,
  onSignIn,
  onSignOut,
  syncLoading = false
}: HeaderProps) {
  
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const mode = localStorage.getItem('dips_dark_mode');
      return mode === 'enabled';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('dips_dark_mode', newVal ? 'enabled' : 'disabled');
      } catch (e) {
        console.error(e);
      }
      return newVal;
    });
  };

  const getMenuLabel = () => {
    switch (currentMenu) {
      case 'dashboard':
        return lang === 'en' ? 'Performance Console' : 'कार्यप्रदर्शन डॅशबोर्ड';
      case 'enquiry':
        return lang === 'en' ? 'Admission Enquiry CRM' : 'प्रवेश चौकशी व्यवस्थापन';
      case 'admission':
        return lang === 'en' ? 'Admission Registry' : 'प्रवेश घेतलेले विद्यार्थी यादी';
      case 'fees':
        return lang === 'en' ? 'Fee Collection & Ledgers' : 'शुल्क संग्रह आणि लेजर';
      case 'reports':
        return lang === 'en' ? 'Report Analytics Center' : 'अहवाल आणि विश्लेषण केंद्र';
      case 'settings':
        return lang === 'en' ? 'CRM Configuration' : 'व्यवस्थापन कॉन्फिगरेशन';
      default:
        return 'DIPs Computers Console';
    }
  };

  return (
    <header id="app-header" className="sticky top-0 z-45 bg-[#3182ce] text-white shadow-md px-4 py-3 flex items-center justify-between transition-colors duration-300">
      {/* Brand area & Mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition active:scale-95"
          title="Toggle Sidebar"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
        
        <div className="flex flex-col">
          <h2 id="header-menu-desc" className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
            {getMenuLabel()}
          </h2>
          <div className="text-[10px] text-blue-100 uppercase tracking-widest hidden sm:block">
            {settings.instituteName} &bull; Shirpur Jain
          </div>
        </div>
      </div>

      {/* Control Tools */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Academic Year Selection */}
        <div id="header-academic-year-selector" className="flex items-center gap-1 bg-blue-900/40 px-2.5 py-1.5 rounded-lg border border-white/20 select-none">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-200 hidden sm:inline">
            {lang === 'en' ? 'Year' : 'वर्ष'}:
          </span>
          <select
            id="header-ac-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
          >
            {academicYears.map(yr => (
              <option key={yr} value={yr} className="text-gray-900 bg-white font-semibold">
                {yr}
              </option>
            ))}
          </select>
          {onAddAcademicYear && (
            <button
              id="btn-quick-add-year"
              onClick={() => {
                const futYear = prompt(lang === 'en' ? 'Enter new Academic Year (e.g. 2030):' : 'नवीन शैक्षणिक वर्ष प्रविष्ट करा (उदा. 2030):');
                if (futYear) {
                  const cleaned = futYear.trim();
                  if (/^\d{4}$/.test(cleaned)) {
                    onAddAcademicYear(cleaned);
                  } else {
                    alert(lang === 'en' ? 'Please enter a valid 4-digit year.' : 'कृपया वैध ४-अंकी वर्ष प्रविष्ट करा.');
                  }
                }
              }}
              className="p-1 hover:bg-white/10 rounded text-blue-100 hover:text-white transition text-xs font-extrabold"
              title={lang === 'en' ? 'Add Academic Year' : 'शैक्षणिक वर्ष जोडा'}
            >
              +
            </button>
          )}
        </div>

        {/* Persistent Dark Mode Toggle Button */}
        <button
          id="btn-dark-mode-toggle"
          onClick={toggleTheme}
          className="p-2 hover:bg-white/10 rounded-full transition text-blue-100 hover:text-white flex items-center justify-center cursor-pointer"
          title={isDark ? (lang === 'en' ? 'Switch to Light Mode' : 'लाईट मोड सुरू करा') : (lang === 'en' ? 'Switch to Dark Mode' : 'डार्क मोड सुरू करा')}
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-blue-100" />}
        </button>

        {/* Language Switcher Button */}
        <div id="language-toggle-pills" className="flex items-center bg-blue-900/30 rounded-lg p-0.5 border border-white/10">
          <button
            id="lang-pill-en"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${lang === 'en' ? 'bg-white text-blue-800' : 'text-blue-100 hover:text-white'}`}
          >
            English
          </button>
          <button
            id="lang-pill-mr"
            onClick={() => setLang('mr')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${lang === 'mr' ? 'bg-white text-blue-800' : 'text-blue-100 hover:text-white'}`}
          >
            मराठी
          </button>
        </div>

        {/* Notifications and Alerts Indicator */}
        <button 
          id="bell-alert-badge" 
          className="relative p-2 hover:bg-white/10 rounded-full transition text-blue-100 hover:text-white"
          title="Alert Alerts"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-blue-600 animate-bounce">
            3
          </span>
        </button>

        {/* User Summary Card / Auth Capsule */}
        <div id="owner-header-capsule" className="flex items-center gap-3 border-l border-white/20 pl-4">
          {syncLoading ? (
            <div className="flex items-center gap-1.5 text-blue-200 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs" title="Connected to Google Cloud Core">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Cloud AutoSync</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-blue-200 text-xs" title="Running in local sandbox">
              <CloudOff className="h-4 w-4 text-orange-200" />
              <span className="hidden sm:inline">Local Only</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold leading-tight truncate max-w-[150px]">
                  {user.displayName || settings.ownerName}
                </div>
                <div className="text-[9px] text-gray-200 leading-none truncate max-w-[150px]">
                  {user.email}
                </div>
              </div>
              <div className="relative group">
                <img 
                  id="owner-avatar"
                  src={user.photoURL || settings.logo} 
                  alt="User Profile" 
                  className="h-9 w-9 object-cover rounded-full border-2 border-emerald-400 shadow cursor-pointer hover:opacity-80 transition"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={onSignOut}
                  className="absolute right-0 mt-1 hidden group-hover:block bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1.5 rounded shadow-lg whitespace-nowrap z-50 transition active:scale-95"
                >
                  <span className="flex items-center gap-1">
                    <LogOut className="h-3 w-3" />
                    Logout
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Cloud className="h-4 w-4" />
              Connect Cloud
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
