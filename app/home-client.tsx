'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  PenTool, 
  Sparkles, 
  Plus, 
  FolderOpen, 
  Layout, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Edit3, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  Shield,
  Moon,
  Sun,
  Info,
  Layers,
  Sparkle,
  Linkedin,
  FileCheck,
  RotateCcw,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Printer,
  Send,
  Eye,
  X,
  Settings,
  Presentation,
  Cpu,
  Wifi,
  WifiOff,
  Smartphone,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';

import {
  getAllResumes,
  saveResumeToDB,
  deleteResumeFromDB,
  saveAllResumesToDB,
  getQueuedEmails,
  queueOfflineEmail,
  removeQueuedEmail,
  clearEmailQueue,
  type OfflineEmail
} from '../lib/indexed-db';

import { generatePdfBlob as generatePdfExportBlob } from '../lib/pdf-export';
import { oklchToRgb as parseOklchToRgb, sanitizeOklchColors as replaceOklchColors } from '../lib/css-color-parser';

import {
  type ThemeID,
  type ThemeConfig,
  THEMES,
  type ResumeTemplate,
  TEMPLATES,
  EXECUTIVE_SUMMARY_TEMPLATES,
  COVER_LETTER_TEMPLATES,
  getPhoneFlag,
  getNationalityFlag
} from '../lib/static-data';

import OnboardingTutorial from '../components/OnboardingTutorial';



// INTERFACES FOR RESUME STATE DRAFT BUILDER
interface CustomField {
  id: string;
  label: string;
  value: string;
}

interface ResumeDraft {
  id: string;
  title: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  // Section 1: Personal Information additions
  profilePhoto?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  customFields?: CustomField[];
  deletedFields?: string[]; // keys like 'nationality', 'dateOfBirth', 'gender', 'maritalStatus', 'phone', 'email', 'address', 'summary', 'profilePhoto', etc.
  
  experiences: { id: string; company: string; position: string; duration: string; details: string; page?: number; }[];
  education: { id: string; school: string; degree: string; duration: string; page?: number; }[];
  skills: string[];
  projects?: { id: string; title: string; role: string; duration: string; details: string; page?: number; }[];
  certifications?: { id: string; title: string; issuer: string; date: string; page?: number; }[];
  trainings?: { id: string; title: string; provider: string; date: string; details?: string; page?: number; }[];
  languages?: { id: string; name: string; proficiency: string; page?: number; }[];
  references?: { id: string; name: string; organization: string; contact: string; page?: number; }[];
  socialLinks?: { id: string; platform: string; url: string; }[];
  coverLetter?: string;
  templateId?: number;
  sectionPages?: Record<string, number>;
  clSenderName?: string;
  clSenderAddress?: string;
  clEmail?: string;
  clPhone?: string;
  clDate?: string;
  clRecipientName?: string;
  clCompanyName?: string;
  clPositionTitle?: string;
  clSubject?: string;
  clGreeting?: string;
  clBody?: string;
  clClosing?: string;
  clSignature?: string;
  pagesCount?: number;
  colorTheme?: string;
  fontPack?: 'sans' | 'serif' | 'mono';
  textDirection?: 'ltr' | 'rtl';
  previewMode?: 'light' | 'dark';
  lastSaved: string;
}

// UNIFIED DATE RANGE PICKER COMPONENT FOR EXPERIENCE & EDUCATION
interface DateRangePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  isDarkMode: boolean;
}

function DateRangePicker({ value, onChange, isDarkMode }: DateRangePickerProps) {
  // Parse initial value (like "MM/YYYY - MM/YYYY" or "MM/YYYY - Present")
  const parts = value ? value.split('-').map(p => p.trim()) : [];
  const startPart = parts[0] || '';
  const endPart = parts[1] || '';

  // Parse start month/year
  let startMonth = '01';
  let startYear = String(new Date().getFullYear());
  if (startPart) {
    if (startPart.includes('/')) {
      const startSubparts = startPart.split('/');
      startMonth = startSubparts[0] || '01';
      startYear = startSubparts[1] || startYear;
    } else if (/^\d{4}$/.test(startPart)) {
      startMonth = '01';
      startYear = startPart;
    }
  }

  // Parse end month/year/present
  const currentlyHere = !endPart || /present/i.test(endPart) || endPart === '';
  let endMonth = '12';
  let endYear = String(new Date().getFullYear());
  if (!currentlyHere && endPart) {
    if (endPart.includes('/')) {
      const endSubparts = endPart.split('/');
      endMonth = endSubparts[0] || '12';
      endYear = endSubparts[1] || endYear;
    } else if (/^\d{4}$/.test(endPart)) {
      endMonth = '12';
      endYear = endPart;
    }
  }

  // Handle updates and emit
  const updateRange = (sm: string, sy: string, em: string, ey: string, cur: boolean) => {
    const finalStart = `${sm}/${sy}`;
    const finalEnd = cur ? 'Present' : `${em}/${ey}`;
    onChange(`${finalStart} - ${finalEnd}`);
  };

  const handleStartMonthChange = (val: string) => {
    updateRange(val, startYear, endMonth, endYear, currentlyHere);
  };

  const handleStartYearChange = (val: string) => {
    updateRange(startMonth, val, endMonth, endYear, currentlyHere);
  };

  const handleEndMonthChange = (val: string) => {
    updateRange(startMonth, startYear, val, endYear, currentlyHere);
  };

  const handleEndYearChange = (val: string) => {
    updateRange(startMonth, startYear, endMonth, val, currentlyHere);
  };

  const handleCurrentlyHereToggle = (cur: boolean) => {
    updateRange(startMonth, startYear, endMonth, endYear, cur);
  };

  const MONTH_OPTIONS = [
    { value: '01', label: 'Jan (01)' },
    { value: '02', label: 'Feb (02)' },
    { value: '03', label: 'Mar (03)' },
    { value: '04', label: 'Apr (04)' },
    { value: '05', label: 'May (05)' },
    { value: '06', label: 'Jun (06)' },
    { value: '07', label: 'Jul (07)' },
    { value: '08', label: 'Aug (08)' },
    { value: '09', label: 'Sep (09)' },
    { value: '10', label: 'Oct (10)' },
    { value: '11', label: 'Nov (11)' },
    { value: '12', label: 'Dec (12)' },
  ];

  const currentYearNum = new Date().getFullYear();
  // Provide a long modern dropdown array
  const YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) => String(currentYearNum + 5 - i));

  return (
    <div className={`space-y-2 p-3 rounded-xl border transition-all ${
      isDarkMode 
        ? 'bg-[#060a17]/55 border-white/10 text-white' 
        : 'bg-[#fafafa] border-slate-200 text-slate-800'
    }`}>
      {/* Target Preview */}
      <div className="flex items-center justify-between pointer-events-none">
        <span className="text-[8px] font-mono tracking-wider opacity-50 uppercase flex items-center gap-1">
          📅 Period Format
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
          {startMonth}/{startYear} &rarr; {currentlyHere ? 'Present' : `${endMonth}/${endYear}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 pt-1">
        {/* START DATE */}
        <div className="space-y-1">
          <span className="block text-[8px] font-mono tracking-wider opacity-40 uppercase">
            Start Date
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={startMonth}
              onChange={(e) => handleStartMonthChange(e.target.value)}
              className={`text-[11px] px-1.5 py-1 rounded bg-[#0b132b]/55 border focus:outline-none cursor-pointer w-full ${
                isDarkMode 
                  ? 'border-white/10 text-white focus:border-blue-400' 
                  : 'border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>{m.label}</option>
              ))}
            </select>
            <select
              value={startYear}
              onChange={(e) => handleStartYearChange(e.target.value)}
              className={`text-[11px] px-1.5 py-1 rounded bg-[#0b132b]/55 border focus:outline-none cursor-pointer w-full ${
                isDarkMode 
                  ? 'border-white/10 text-white focus:border-blue-400' 
                  : 'border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* END DATE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="block text-[8px] font-mono tracking-wider opacity-40 uppercase">
              End Date
            </span>
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentlyHere}
                onChange={(e) => handleCurrentlyHereToggle(e.target.checked)}
                className="w-2.5 h-2.5 text-blue-600 rounded bg-transparent border-white/20 focus:ring-0"
              />
              <span className="text-[8px] font-mono font-bold text-blue-400 uppercase">Present</span>
            </label>
          </div>

          <div className={`grid grid-cols-2 gap-1.5 transition-opacity duration-200 ${currentlyHere ? 'opacity-30 pointer-events-none' : ''}`}>
            <select
              value={endMonth}
              disabled={currentlyHere}
              onChange={(e) => handleEndMonthChange(e.target.value)}
              className={`text-[11px] px-1.5 py-1 rounded bg-[#0b132b]/55 border focus:outline-none cursor-pointer w-full ${
                isDarkMode 
                  ? 'border-white/10 text-white focus:border-blue-400' 
                  : 'border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>{m.label}</option>
              ))}
            </select>
            <select
              value={endYear}
              disabled={currentlyHere}
              onChange={(e) => handleEndYearChange(e.target.value)}
              className={`text-[11px] px-1.5 py-1 rounded bg-[#0b132b]/55 border focus:outline-none cursor-pointer w-full ${
                isDarkMode 
                  ? 'border-white/10 text-white focus:border-blue-400' 
                  : 'border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}



// HIGH-FIDELITY AUTOMATIC DYNAMIC PAGINATION ENGINE FOR MULTI-PAGE RESUMES
export interface PageData {
  summary: string;
  experiences: any[];
  projects: any[];
  education: any[];
  skills: string[];
  certifications: any[];
  trainings: any[];
  languages: any[];
  references: any[];
  socialLinks: any[];
  customFields: any[];
}

interface PaginationResult {
  totalPages: number;
  pages: Record<number, PageData>;
}

function calculateResumePagination(draft: any, isSidebarLayout: boolean): PaginationResult {
  const result: PaginationResult = {
    totalPages: 1,
    pages: {
      1: {
        summary: '',
        experiences: [],
        projects: [],
        education: [],
        skills: [],
        certifications: [],
        trainings: [],
        languages: [],
        references: [],
        socialLinks: [],
        customFields: []
      }
    }
  };

  if (!draft) return result;

  const deletedFilters: string[] = draft.deletedFields || [];

  // Helper to check if a field is deleted
  const isDeleted = (field: string) => deletedFilters.includes(field);

  const headerHeight = isSidebarLayout ? 240 : 200;
  const page1MaxContentHeight = 1000 - headerHeight;
  const subsequentMaxContentHeight = 920;

  const getSummaryHeight = (text: string) => {
    if (!text || isDeleted('summary')) return 0;
    const lineCount = Math.ceil(text.length / 90);
    return 30 + lineCount * 18;
  };

  const getExperienceHeight = (exp: any) => {
    if (isDeleted('experiences')) return 0;
    let height = 45;
    if (exp.details) {
      const lineCount = Math.ceil(exp.details.length / 85);
      height += lineCount * 17;
    }
    return height;
  };

  const getProjectHeight = (proj: any) => {
    if (isDeleted('projects')) return 0;
    let height = 45;
    if (proj.details) {
      const lineCount = Math.ceil(proj.details.length / 85);
      height += lineCount * 17;
    }
    return height;
  };

  const getEducationHeight = (edu: any) => {
    if (isDeleted('education')) return 0;
    return 38;
  };

  const getCertificationHeight = (cert: any) => {
    if (isDeleted('certifications')) return 0;
    return 26;
  };

  const getTrainingHeight = (trn: any) => {
    if (isDeleted('trainings')) return 0;
    let height = 30;
    if (trn.details) {
      const lineCount = Math.ceil(trn.details.length / 80);
      height += lineCount * 16;
    }
    return height;
  };

  const skillsList = draft.skills || [];
  const skillsCount = isDeleted('skills') ? 0 : skillsList.length;
  const skillsSectionHeight = skillsCount > 0 ? (40 + Math.ceil(skillsCount / 5) * 28) : 0;

  const languagesList = draft.languages || [];
  const languagesCount = isDeleted('languages') ? 0 : languagesList.length;
  const languagesSectionHeight = languagesCount > 0 ? (40 + Math.ceil(languagesCount / 3) * 32) : 0;

  const referencesList = draft.references || [];
  const referencesCount = isDeleted('references') ? 0 : referencesList.length;
  const referencesSectionHeight = referencesCount > 0 ? (40 + referencesCount * 45) : 0;

  const socialLinksList = draft.socialLinks || [];
  const socialLinksCount = isDeleted('social_links') ? 0 : socialLinksList.length;
  const socialLinksSectionHeight = socialLinksCount > 0 ? (40 + socialLinksCount * 24) : 0;

  const customFieldsList = draft.customFields || [];
  const customFieldsCount = isDeleted('custom_fields') ? 0 : customFieldsList.length;
  const customFieldsSectionHeight = customFieldsCount > 0 ? (45 + Math.ceil(customFieldsCount / 2) * 44) : 0;

  let currentPage = 1;
  let accumulatedHeight = 0;

  const getLimitForPage = (page: number) => {
    return page === 1 ? page1MaxContentHeight : subsequentMaxContentHeight;
  };

  const ensurePageExists = (page: number) => {
    if (!result.pages[page]) {
      result.pages[page] = {
        summary: '',
        experiences: [],
        projects: [],
        education: [],
        skills: [],
        certifications: [],
        trainings: [],
        languages: [],
        references: [],
        socialLinks: [],
        customFields: []
      };
    }
    if (page > result.totalPages) {
      result.totalPages = page;
    }
  };

  if (draft.summary && !isDeleted('summary')) {
    const sHeight = getSummaryHeight(draft.summary);
    result.pages[1].summary = draft.summary;
    accumulatedHeight += sHeight;
  }

  const exps = draft.experiences || [];
  if (exps.length > 0 && !isDeleted('experiences')) {
    accumulatedHeight += 25;
    for (const exp of exps) {
      const eHeight = getExperienceHeight(exp);
      const limit = getLimitForPage(currentPage);
      if (accumulatedHeight + eHeight > limit) {
        currentPage++;
        ensurePageExists(currentPage);
        accumulatedHeight = 35;
      }
      result.pages[currentPage].experiences.push(exp);
      accumulatedHeight += eHeight + 8;
    }
  }

  const projs = draft.projects || [];
  if (projs.length > 0 && !isDeleted('projects')) {
    accumulatedHeight += 25;
    for (const proj of projs) {
      const pHeight = getProjectHeight(proj);
      const limit = getLimitForPage(currentPage);
      if (accumulatedHeight + pHeight > limit) {
        currentPage++;
        ensurePageExists(currentPage);
        accumulatedHeight = 35;
      }
      result.pages[currentPage].projects.push(proj);
      accumulatedHeight += pHeight + 8;
    }
  }

  const edus = draft.education || [];
  if (edus.length > 0 && !isDeleted('education')) {
    accumulatedHeight += 25;
    for (const edu of edus) {
      const edHeight = getEducationHeight(edu);
      const limit = getLimitForPage(currentPage);
      if (accumulatedHeight + edHeight > limit) {
        currentPage++;
        ensurePageExists(currentPage);
        accumulatedHeight = 35;
      }
      result.pages[currentPage].education.push(edu);
      accumulatedHeight += edHeight + 6;
    }
  }

  const trns = draft.trainings || [];
  if (trns.length > 0 && !isDeleted('trainings')) {
    accumulatedHeight += 25;
    for (const trn of trns) {
      const tHeight = getTrainingHeight(trn);
      const limit = getLimitForPage(currentPage);
      if (accumulatedHeight + tHeight > limit) {
        currentPage++;
        ensurePageExists(currentPage);
        accumulatedHeight = 35;
      }
      result.pages[currentPage].trainings.push(trn);
      accumulatedHeight += tHeight + 6;
    }
  }

  const certs = draft.certifications || [];
  if (certs.length > 0 && !isDeleted('certifications')) {
    accumulatedHeight += 25;
    for (const cert of certs) {
      const cHeight = getCertificationHeight(cert);
      const limit = getLimitForPage(currentPage);
      if (accumulatedHeight + cHeight > limit) {
        currentPage++;
        ensurePageExists(currentPage);
        accumulatedHeight = 35;
      }
      result.pages[currentPage].certifications.push(cert);
      accumulatedHeight += cHeight + 4;
    }
  }

  const placeCompactSection = (secHeight: number, callback: (pg: number) => void) => {
    if (secHeight === 0) return;
    const limit = getLimitForPage(currentPage);
    if (accumulatedHeight + secHeight > limit) {
      currentPage++;
      ensurePageExists(currentPage);
      accumulatedHeight = 35;
    }
    callback(currentPage);
    accumulatedHeight += secHeight + 12;
  };

  placeCompactSection(skillsSectionHeight, (pg) => {
    result.pages[pg].skills = skillsList;
  });

  placeCompactSection(languagesSectionHeight, (pg) => {
    result.pages[pg].languages = languagesList;
  });

  placeCompactSection(referencesSectionHeight, (pg) => {
    result.pages[pg].references = referencesList;
  });

  placeCompactSection(socialLinksSectionHeight, (pg) => {
    result.pages[pg].socialLinks = socialLinksList;
  });

  placeCompactSection(customFieldsSectionHeight, (pg) => {
    result.pages[pg].customFields = customFieldsList;
  });

  return result;
}

export default function Home() {
  // Suppress verbose logs in production builds, keeping only critical error logging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
      console.warn = () => {};
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  // VIEW SWITCHING STATE
  // 'welcome' | 'navigation' | 'blank_builder' | 'open_browser' | 'templates_gallery'
  const [view, setView] = useState<'welcome' | 'navigation' | 'blank_builder' | 'open_browser' | 'templates_gallery'>('welcome');
  
  // GLOBAL LIGHT/DARK THEME CONTROL FOR ENTIRE APPLICATION UI (Light Mode Removed)
  const isDarkMode = true;
  const toggleDarkMode = () => {};

  // THEME CONTROL (declared before styling functions for direct accessibility)
  const [activeThemeId, setActiveThemeId] = useState<ThemeID>('apple-vision-pro');
  const activeTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  const isWindows95 = activeThemeId === 'windows-95-teal';

  // Theme Helper Styling functions for Light Mode & Custom Retro Theme fixes
  const getInputClass = (additionalClass = '') => {
    if (isWindows95) {
      return `w-full text-xs p-2.5 transition-all font-sans bg-white border-2 border-t-zinc-700 border-l-zinc-700 border-b-white border-r-white text-black placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-800 ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `w-full text-xs p-2.5 transition-all font-mono rounded-lg border outline-none bg-[#020712]/85 border-cyan-500/30 text-cyan-50 placeholder-cyan-500/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.25)] focus:bg-[#030c20] ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-white/45 focus:bg-white/12 focus:shadow-[0_0_15px_rgba(255,255,255,0.12)] ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none bg-[#090620]/30 border-white/10 text-white placeholder-white/30 focus:border-cyan-400 focus:bg-[#090620]/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] ${additionalClass}`;
    }
    return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none ${
      isDarkMode 
        ? 'bg-[#0b132b]/55 border-white/10 text-white placeholder-white/30 focus:border-blue-400 focus:bg-[#0b132b]/75' 
        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white shadow-sm'
    } ${additionalClass}`;
  };

  const getTextareaClass = (additionalClass = '') => {
    if (isWindows95) {
      return `w-full text-xs p-2.5 transition-all font-sans bg-white border-2 border-t-zinc-700 border-l-zinc-700 border-b-white border-r-white text-black placeholder-zinc-400 outline-none resize-none focus:bg-white focus:border-zinc-800 ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `w-full text-xs p-2.5 transition-all font-mono rounded-lg border outline-none resize-none bg-[#020712]/85 border-cyan-500/30 text-cyan-50 placeholder-cyan-500/40 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.25)] focus:bg-[#030c20] ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none resize-none bg-white/5 border-white/10 text-white placeholder-white/35 focus:border-white/45 focus:bg-white/12 focus:shadow-[0_0_15px_rgba(255,255,255,0.12)] ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none resize-none bg-[#090620]/30 border-white/10 text-white placeholder-white/35 focus:border-cyan-400 focus:bg-[#090620]/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)] ${additionalClass}`;
    }
    return `w-full text-xs p-2.5 transition-all font-sans rounded-lg border outline-none resize-none ${
      isDarkMode 
        ? 'bg-[#0b132b]/55 border-white/10 text-white placeholder-white/35 focus:border-blue-400 focus:bg-[#0b132b]/75' 
        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:bg-white shadow-sm'
    } ${additionalClass}`;
  };

  const getSelectClass = (additionalClass = '') => {
    if (isWindows95) {
      return `w-full text-xs p-3 transition-all font-sans bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-zinc-700 border-r-zinc-700 text-black outline-none appearance-none cursor-pointer focus:border-zinc-800 ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `w-full text-xs p-3.5 transition-all font-mono rounded-xl border outline-none appearance-none cursor-pointer bg-[#020712]/85 border-cyan-500/30 text-cyan-50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.2)] ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `w-full text-xs p-3.5 transition-all font-sans rounded-xl border outline-none appearance-none cursor-pointer bg-white/10 border-white/15 text-white focus:border-white/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `w-full text-xs p-3.5 transition-all font-sans rounded-xl border outline-none appearance-none cursor-pointer bg-[#090620]/50 border-white/15 text-white focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] ${additionalClass}`;
    }
    return `w-full text-xs p-3.5 transition-all font-sans rounded-xl border outline-none appearance-none cursor-pointer ${
      isDarkMode 
        ? 'bg-[#0b132b]/85 border-white/20 text-white focus:border-white' 
        : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-650 focus:bg-white shadow-sm'
    } ${additionalClass}`;
  };

  const getCardClass = (additionalClass = '') => {
    if (isWindows95) {
      return `bg-[#c0c0c0]/40 backdrop-blur-lg border-2 border-t-white border-l-white border-b-zinc-700 border-r-zinc-700 text-black p-5 relative group transition-all shadow-md ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `backdrop-blur-3xl border rounded-[22px] p-5.5 relative group transition-all bg-[#040a16]/80 border-cyan-500/20 text-cyan-50 shadow-[0_0_25px_rgba(0,242,254,0.06)] hover:shadow-[0_0_35px_rgba(236,72,153,0.12)] hover:border-pink-500/35 transition-all duration-300 ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `backdrop-blur-3xl border rounded-[22px] p-5.5 relative group transition-all bg-white/10 border-white/20 text-white shadow-[0_20px_50px_rgba(255,255,255,0.03)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.08)] hover:border-white/35 transition-all duration-500 ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `backdrop-blur-xl border rounded-[22px] p-5.5 relative group transition-all bg-slate-900/40 border-white/10 text-white shadow-[0_0_25px_rgba(139,92,246,0.06)] hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] hover:border-cyan-500/35 transition-all duration-300 ${additionalClass}`;
    }
    return `backdrop-blur-lg border rounded-[22px] p-5.5 relative group transition-all shadow-xl ${
      isDarkMode 
        ? 'bg-white/5 hover:bg-white/8 border-white/10 text-white' 
        : 'bg-white/55 hover:bg-white/75 border-slate-200/60 text-slate-800 shadow-sm hover:border-indigo-200/50 hover:shadow-2xl'
    } ${additionalClass}`;
  };

  const getLabelClass = (additionalClass = '') => {
    if (isWindows95) {
      return `block text-[9px] font-mono font-bold uppercase mb-0.5 tracking-wider text-zinc-900 ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `block text-[9px] font-mono font-bold uppercase mb-0.5 tracking-wider text-pink-400/80 ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `block text-[9px] font-sans font-semibold uppercase mb-0.5 tracking-wider text-white/60 ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `block text-[9px] font-mono font-bold uppercase mb-0.5 tracking-wider text-cyan-400/80 ${additionalClass}`;
    }
    return `block text-[9px] font-mono font-bold uppercase mb-0.5 tracking-wider ${
      isDarkMode ? 'text-white/50' : 'text-slate-500'
    } ${additionalClass}`;
  };

  const getTitleClass = (additionalClass = '') => {
    if (isWindows95) {
      return `text-xs font-mono font-bold uppercase tracking-wider text-[#000080] ${additionalClass}`;
    }
    if (activeThemeId === 'cyber-ai') {
      return `text-xs font-mono font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-indigo-300 drop-shadow-[0_0_10px_rgba(0,242,254,0.15)] ${additionalClass}`;
    }
    if (activeThemeId === 'apple-vision-pro') {
      return `text-xs font-sans font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 ${additionalClass}`;
    }
    if (activeThemeId === 'neon-glass-pro') {
      return `text-xs font-mono font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 ${additionalClass}`;
    }
    return `text-xs font-mono font-bold uppercase tracking-wider ${
      isDarkMode ? 'text-blue-300' : 'text-indigo-600'
    } ${additionalClass}`;
  };

  // RESUMES PERSISTENCE DRAFTS
  const [drafts, setDrafts] = useState<ResumeDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ResumeDraft | null>(null);

  // PWA & OFFLINE STATES
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [queuedEmailsCount, setQueuedEmailsCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // SEARCH AND FILTER IN 50 TEMPLATES GALLERY VIEW
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('All');

  // SECTION 1 STEP PROGRESS CONTEXT
  const [showStepModal, setShowStepModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputMobileRef = useRef<HTMLInputElement>(null);

  // SECTION 1: DRAFTS TRACKING AND PROMPTS ON LOAD
  const [showTitlePromptModal, setShowTitlePromptModal] = useState(false);
  const [promptTitleInput, setPromptTitleInput] = useState('');
  const [executiveSummaryDropdownOpen, setExecutiveSummaryDropdownOpen] = useState(false);
  const [summarySearchQuery, setSummarySearchQuery] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPrintHelpModal, setShowPrintHelpModal] = useState(false);
  const [showFullPagePreview, setShowFullPagePreview] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(1);
  const [showExportSuccessModal, setShowExportSuccessModal] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string>('');
  const [showExportErrorModal, setShowExportErrorModal] = useState(false);
  const [pdfEngine, setPdfEngine] = useState<'vector' | 'canvas'>('vector');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSendStatus, setEmailSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailSendError, setEmailSendError] = useState<string>('');
  const [smtpHostOverride, setSmtpHostOverride] = useState('');
  const [smtpPortOverride, setSmtpPortOverride] = useState('');
  const [smtpUserOverride, setSmtpUserOverride] = useState('');
  const [smtpPassOverride, setSmtpPassOverride] = useState('');
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const lastAskedDraftIdRef = useRef<string | null>(null);

  // MULTIPAGE AND EXPORT SCOPE STATES
  const [previewPageMode, setPreviewPageMode] = useState<string>('stacked');
  const [exportScope, setExportScope] = useState<'resume_only' | 'cover_only' | 'full_suite'>('full_suite');
  const [carouselPreviewOpen, setCarouselPreviewOpen] = useState<boolean>(false);
  const [currentReviewPageIndex, setCurrentReviewPageIndex] = useState<number>(0);
  const [showPdfExportModal, setShowPdfExportModal] = useState<boolean>(false);
  const [showExportSuiteModal, setShowExportSuiteModal] = useState<boolean>(false);
  const [selectedExportPageIds, setSelectedExportPageIds] = useState<string[]>([]);
  const [previewZoom, setPreviewZoom] = useState<number>(75);

  // SMART SKILLS SUGGESTION STATES
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedSkillsError, setSuggestedSkillsError] = useState<string | null>(null);
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);

  // REFS FOR CONTROL AND CACHING OF GEMINI REQUESTS
  const suggestionsCacheRef = useRef<Record<string, string[]>>({});
  const suggestionsAbortControllerRef = useRef<AbortController | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestInProgressRef = useRef<boolean>(false);

  // SETTINGS BUTTON AND MODAL STATE
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'themes' | 'about' | 'privacy' | 'terms' | 'features'>('themes');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // ONBOARDING INTERACTIVE TUTORIAL STATE
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('siraj_onboarding_completed');
      return completed !== 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Allow launching onboarding via a custom window event
      const handleLaunch = () => {
        setShowOnboarding(true);
      };
      window.addEventListener('launch-onboarding', handleLaunch);
      return () => {
        window.removeEventListener('launch-onboarding', handleLaunch);
      };
    }
  }, []);

  // NOTIFICATIONS GLOBAL TOGGLE STATE (with localStorage persistence)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const notificationsEnabledRef = useRef(notificationsEnabled);
  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications_enabled', String(notificationsEnabled));
    }
  }, [notificationsEnabled]);
  
  // TOAST NOTIFICATION STATE FOR AUTOSAVE
  const [showSavedToast, setShowSavedToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const onlineToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ATS ACCREDITATION MATCH AND SCORE DASHBOARD STATES
  const [targetJobDescription, setTargetJobDescription] = useState<string>('');
  const [isAtsPanelExpanded, setIsAtsPanelExpanded] = useState<boolean>(false);

  // DYNAMIC ATS OPTIMIZER ANALYZER MODULE
  const getAtsAnalysis = (draft: ResumeDraft | null, targetJobDesc: string) => {
    if (!draft) {
      return {
        score: 0,
        baseScore: 0,
        keywordMatchRate: 0,
        foundKeywords: [] as string[],
        missingKeywords: [] as string[],
        actionVerbsCount: 0,
        foundActionVerbs: [] as string[],
        suggestions: [] as { text: string; completed: boolean; impact: 'high' | 'medium' | 'low' }[],
        scoreBreakdown: [] as { category: string; max: number; earned: number; tips: string[] }[]
      };
    }

    // 1. Personal Info Completeness (Max 15)
    let contactScore = 0;
    const isFieldActive = (fieldName: string) => {
      return !draft.deletedFields?.includes(fieldName);
    };

    const hasEmail = !!(draft.email && draft.email.trim().length > 0 && isFieldActive('email'));
    const hasPhone = !!(draft.phone && draft.phone.trim().length > 0 && isFieldActive('phone'));
    const hasAddress = !!(draft.address && draft.address.trim().length > 0 && isFieldActive('address'));
    const hasSocial = !!(draft.socialLinks && draft.socialLinks.length > 0);

    if (hasEmail) contactScore += 5;
    if (hasPhone) contactScore += 5;
    if (hasAddress) contactScore += 3;
    if (hasSocial) contactScore += 2;

    const contactTips: string[] = [];
    if (!hasEmail) contactTips.push("Provide an email address for recruiter outreach.");
    if (!hasPhone) contactTips.push("Add an active phone number to your contact section.");
    if (!hasSocial) contactTips.push("Link specialized social accounts like LinkedIn or GitHub.");

    // 2. Profile Summary Metrics (Max 15)
    let summaryScore = 0;
    const hasTitle = !!(draft.professionalTitle && draft.professionalTitle.trim().length > 0);
    const summaryLength = draft.summary && isFieldActive('summary') ? draft.summary.trim().length : 0;

    if (hasTitle) summaryScore += 5;
    if (summaryLength >= 120) summaryScore += 10;
    else if (summaryLength >= 50) summaryScore += 5;

    const summaryTips: string[] = [];
    if (!hasTitle) summaryTips.push("Set a clear professional title (e.g. Senior Frontend Engineer).");
    if (summaryLength < 120) {
      summaryTips.push("Expand your profile summary to at least 120 characters to capture key value.");
    }

    // 3. Work Experience Details (Max 25)
    let expScore = 0;
    const expCount = draft.experiences ? draft.experiences.length : 0;
    if (expCount >= 1) expScore += 10;
    if (expCount >= 2) expScore += 5;

    // Check for metrics/quantified achievements (digits like percentage %, dollar $, count number)
    let hasMetricsInExp = false;
    if (draft.experiences && draft.experiences.length > 0) {
      draft.experiences.forEach((exp) => {
        const detailsText = exp.details || '';
        if (/[\d%+$]|million|billion|thousand|hours|days|USD/i.test(detailsText)) {
          hasMetricsInExp = true;
        }
      });
    }
    if (hasMetricsInExp) expScore += 10;

    const expTips: string[] = [];
    if (expCount === 0) {
      expTips.push("Add at least one professional work experience record.");
    } else if (expCount < 2) {
      expTips.push("Add a second experience node if applicable to flesh out details.");
    }
    if (!hasMetricsInExp && expCount > 0) {
      expTips.push("Quantify work wins with numbers/percentages (e.g., 'saved 15 hours/week').");
    }

    // 4. Skills & Projects Completeness (Max 25)
    let skPrScore = 0;
    const skillsCount = draft.skills ? draft.skills.length : 0;
    if (skillsCount >= 5) skPrScore += 10;
    if (skillsCount >= 8) skPrScore += 5;

    const hasProjects = !!(draft.projects && draft.projects.length > 0);
    if (hasProjects) skPrScore += 10;

    const skPrTips: string[] = [];
    if (skillsCount < 8) {
      skPrTips.push("List at least 8 specific software, technical, or soft skills.");
    }
    if (!hasProjects) {
      skPrTips.push("Add a projects section to illustrate hands-on practical execution.");
    }

    // 5. Structure & Verb Strength (Max 20)
    let verbScore = 0;
    // Check for standard high-impact action verbs (case insensitive, words boundary)
    const ACTION_VERBS_DICT = [
      "led", "directed", "managed", "designed", "built", "engineered", "implemented", 
      "optimized", "improved", "accelerated", "boosted", "created", "constructed", 
      "facilitated", "formulated", "coordinated", "authored", "orchestrated", "spearheaded",
      "pioneered", "scaled", "decreased", "increased", "maximized", "reduced"
    ];

    const fullResumeText = `
      ${draft.fullName || ''} ${draft.professionalTitle || ''} ${draft.summary || ''} 
      ${draft.experiences?.map(e => `${e.position || ''} ${e.company || ''} ${e.details || ''}`).join(' ') || ''}
      ${draft.projects?.map(p => `${p.title || ''} ${p.role || ''} ${p.details || ''}`).join(' ') || ''}
      ${draft.skills?.join(' ') || ''}
    `.toLowerCase();

    const foundActionVerbs = ACTION_VERBS_DICT.filter(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'i');
      return regex.test(fullResumeText);
    });

    const actionVerbsCount = foundActionVerbs.length;
    if (actionVerbsCount >= 3) verbScore += 10;
    else if (actionVerbsCount >= 1) verbScore += 5;

    // Length check (words ratio)
    const totalWords = fullResumeText.split(/\s+/).filter(w => w.trim().length > 0).length;
    let hasIdealWords = false;
    if (totalWords >= 150 && totalWords <= 550) {
      hasIdealWords = true;
      verbScore += 10;
    } else if (totalWords > 0) {
      verbScore += 5;
    }

    const verbTips: string[] = [];
    if (actionVerbsCount < 3) {
      verbTips.push("Inject strong action verbs like 'Spearheaded', 'Optimized', or 'Scaled' in accomplishments.");
    }
    if (totalWords < 150) {
      verbTips.push("Resume is a bit brief. Aim for at least 150 words of rich content.");
    } else if (totalWords > 550) {
      verbTips.push("Resume length is long. Consolidate bullet points to be punchier.");
    }

    const baseScore = contactScore + summaryScore + expScore + skPrScore + verbScore;

    // 6. Keywords Overlap Matching
    const INDUSTRY_KEYWORDS = [
      "React", "TypeScript", "Node.js", "Python", "SQL", "Docker", "AWS", "Agile", "Management", 
      "HTML", "CSS", "JavaScript", "Kubernetes", "Git", "D3", "Tailwind", "Java", "C++", "Drizzle", 
      "Firebase", "PostgreSQL", "Next.js", "Express", "API", "NoSQL", "Redux", "GraphQL", "Cloud", 
      "Linux", "UI/UX", "Design", "Figma", "Marketing", "SEO", "Sales", "Business", "Project", 
      "Product", "Client", "Support", "Software", "Analyst", "Developer", "Engineer", "Scrum", 
      "CI/CD", "Testing", "Security", "AI", "Machine Learning", "Data Science", "Communication", 
      "Leadership", "Operations", "Strategy", "Execution", "Infrastructure", "Integration"
    ];

    let foundKeywords: string[] = [];
    let missingKeywords: string[] = [];
    let keywordMatchRate = 100;
    let targetKeywords: string[] = [];

    // If a targeted job description is pasted, calculate keyword overlap based on it
    if (targetJobDesc && targetJobDesc.trim().length > 0) {
      const lowerJobDesc = targetJobDesc.toLowerCase();
      // Extract target keywords present inside the job description
      targetKeywords = INDUSTRY_KEYWORDS.filter(kw => {
        const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
        return regex.test(lowerJobDesc);
      });

      if (targetKeywords.length > 0) {
        foundKeywords = targetKeywords.filter(kw => {
          const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
          return regex.test(fullResumeText);
        });

        missingKeywords = targetKeywords.filter(kw => !foundKeywords.includes(kw));
        keywordMatchRate = Math.round((foundKeywords.length / targetKeywords.length) * 105); // slight scaling
        keywordMatchRate = Math.min(100, keywordMatchRate);
      }
    }

    // Blend basescore and keyword overlap score if target keywords are present
    let finalScore = baseScore;
    if (targetKeywords.length > 0) {
      // 70% Base Completeness / Best Practices, 30% Keyword Matching
      finalScore = Math.round((baseScore * 0.70) + (keywordMatchRate * 0.30));
    }

    // Limit final score to maximum 100
    finalScore = Math.min(100, Math.max(0, finalScore));

    // Compile dynamic structured suggestions list
    const suggestions = [
      { text: "Include complete contact email, phone number, and location", completed: !!(hasEmail && hasPhone), impact: 'high' as const },
      { text: "Link specialized profiles (e.g. LinkedIn, GitHub, or Website)", completed: !!hasSocial, impact: 'medium' as const },
      { text: "Add a crisp, 125+ character professional focus summary", completed: summaryLength >= 120, impact: 'high' as const },
      { text: "Include at least two separate professional experience items", completed: expCount >= 2, impact: 'high' as const },
      { text: "Quantify achievements with numbers or percentages (e.g. 'boosted speeds by 40%')", completed: hasMetricsInExp, impact: 'high' as const },
      { text: "List at least 8 specific professional skills", completed: skillsCount >= 8, impact: 'medium' as const },
      { text: "Utilize strong action verbs like 'Spearheaded', 'Optimized', or 'Launched'", completed: actionVerbsCount >= 3, impact: 'medium' as const },
      { text: "Maintain optimal word count (between 150 and 550 words)", completed: hasIdealWords, impact: 'low' as const }
    ];

    if (targetKeywords.length > 0) {
      suggestions.push({
        text: `Overlap matching keywords with job description (Aim for over 60%)`,
        completed: keywordMatchRate >= 60,
        impact: 'high' as const
      });
    }

    const scoreBreakdown = [
      { category: "Contact Profile", max: 15, earned: contactScore, tips: contactTips },
      { category: "Executive Summary", max: 15, earned: summaryScore, tips: summaryTips },
      { category: "Work Achievements", max: 25, earned: expScore, tips: expTips },
      { category: "Skills & Scope", max: 25, earned: skPrScore, tips: skPrTips },
      { category: "Action Verbs & Length", max: 20, earned: verbScore, tips: verbTips }
    ];

    return {
      score: finalScore,
      baseScore,
      keywordMatchRate,
      foundKeywords,
      missingKeywords,
      actionVerbsCount,
      foundActionVerbs,
      suggestions,
      scoreBreakdown
    };
  };

  // AUTO FEED SMART SKILLS RECOMMENDATIONS HELPER WITH ROBUST DEBOUNCING, RETRIES, AND CACHING
  const triggerSuggestSkills = useCallback((draft: ResumeDraft | null, force: boolean = false) => {
    if (!draft) return;

    // 1. Clear any existing debounce timer
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
      suggestionsTimeoutRef.current = null;
    }

    // Generate unique cache key for current draft data
    const cacheKey = JSON.stringify({
      experiences: draft.experiences || [],
      education: draft.education || [],
      projects: draft.projects || [],
      certifications: draft.certifications || []
    });

    // 2. Check Cache (if not forced recalculation)
    if (!force && suggestionsCacheRef.current[cacheKey]) {
      setSuggestedSkills(suggestionsCacheRef.current[cacheKey]);
      setSuggestedSkillsError(null);
      return;
    }

    // 3. Request debouncing (1000ms delay)
    suggestionsTimeoutRef.current = setTimeout(() => {
      // 4. Loading state protection: if a request is already running, do not start another one.
      if (isRequestInProgressRef.current) {
        return;
      }

      // 5. Cancel previous pending requests when a new request starts.
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      suggestionsAbortControllerRef.current = controller;

      const executeRequest = async () => {
        isRequestInProgressRef.current = true;
        setIsSuggesting(true);
        setSuggestedSkillsError(null);

        // Retry logic for 503 errors
        const maxRetries = 3;
        const delayMs = [1000, 2000, 4000];

        let attempt = 0;
        let success = false;
        let finalSkills: string[] = [];
        let finalError: any = null;

        while (attempt <= maxRetries && !success) {
          if (controller.signal.aborted) {
            break;
          }

          try {
            const res = await fetch('/api/suggest-skills', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                experiences: draft.experiences || [],
                education: draft.education || [],
                projects: draft.projects || [],
                certifications: draft.certifications || []
              }),
              signal: controller.signal
            });

            // Handle HTTP 503 error for retry
            if (res.status === 503) {
              throw new Error("503");
            }

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`Request failed with status ${res.status}: ${errText}`);
            }

            const data = await res.json();
            if (data.success && data.skills) {
              finalSkills = data.skills;
              success = true;
            } else {
              throw new Error(data.error || "Failed to parse skills list");
            }
          } catch (err: any) {
            if (err.name === 'AbortError') {
              // Ignore aborted requests
              return;
            }

            finalError = err;
            if (err.message === "503" && attempt < maxRetries) {
              // Wait before next retry
              const waitTime = delayMs[attempt] || 1000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
              attempt++;
            } else {
              // Non-retryable error or out of retries
              break;
            }
          }
        }

        if (controller.signal.aborted) {
          isRequestInProgressRef.current = false;
          return;
        }

        isRequestInProgressRef.current = false;
        setIsSuggesting(false);

        if (success) {
          // Cache the result
          suggestionsCacheRef.current[cacheKey] = finalSkills;
          setSuggestedSkills(finalSkills);
          setSuggestedSkillsError(null);
        } else {
          setSuggestedSkillsError("AI suggestions are temporarily unavailable. Please try again shortly.");
        }
      };

      executeRequest();
    }, 1000);
  }, []);

  // AUTO FEED SMART SKILLS RECOMMENDATIONS
  useEffect(() => {
    if (activeSection === 4 && currentDraft) {
      triggerSuggestSkills(currentDraft, false);
    }
    return () => {
      // Cleanup of any pending timers/requests on switch or unmount
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
    };
  }, [activeSection, currentDraft, triggerSuggestSkills]);

  // TRIGGER TITLE PROMPT WHEN BLANK BUILDER APPEARS
  useEffect(() => {
    if (view === 'blank_builder' && currentDraft && lastAskedDraftIdRef.current !== currentDraft.id) {
      lastAskedDraftIdRef.current = currentDraft.id;
      const initialTitle = currentDraft.title || '';
      const isUntitled = !initialTitle || initialTitle.trim() === '' || initialTitle.toLowerCase().includes('untitled');
      if (isUntitled) {
        const timer = setTimeout(() => {
          setPromptTitleInput(initialTitle);
          setShowTitlePromptModal(true);
        }, 50);
        return () => clearTimeout(timer);
      }
    } else if (view !== 'blank_builder') {
      lastAskedDraftIdRef.current = null;
    }
  }, [view, currentDraft]);

  // AUTOMATICALLY SCROLL TO TOP OF THE WINDOW AND SUB-CONTAINERS WHEN TABS AND VIEWS CHANGE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Scroll main window to top
      window.scrollTo(0, 0);

      // 2. Scroll the editor panel to top
      const editorPanel = document.getElementById('editor-scroll-container');
      if (editorPanel) {
        editorPanel.scrollTo(0, 0);
      }

      // 3. Scroll the templates gallery grid to top
      const templatesPanel = document.getElementById('templates-scroll-container');
      if (templatesPanel) {
        templatesPanel.scrollTo(0, 0);
      }
    }
  }, [view, activeSection, templateFilter]);

  // SYNCHRONIZE OFFLINE QUEUED EMAILS TO API SERVER
  const syncOfflineQueuedEmails = async () => {
    if (typeof navigator === 'undefined' || !navigator.onLine) return;
    try {
      const queued = await getQueuedEmails();
      if (queued.length === 0) return;
      
      setIsSyncing(true);
      console.log(`[PWA Sync] Reconnected! Found ${queued.length} queued emails to dispatch.`);

      for (const email of queued) {
        try {
          const payload = {
            email: email.recipientEmail,
            subject: email.subject,
            message: email.messageText,
            attachmentsList: email.pdfBlob ? JSON.parse(email.pdfBlob) : [],
            resumeDetails: {
              fullName: email.resumeTitle || 'Candidate',
              professionalTitle: 'Professional',
              email: '',
              phone: ''
            },
            smtpHostOverride: email.smtpHost || '',
            smtpPortOverride: email.smtpPort || '',
            smtpUserOverride: email.smtpUser || '',
            smtpPassOverride: email.smtpPass || ''
          };

          const response = await fetch('/api/send-resume-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const resData = await response.json();
          if (response.ok && resData.success) {
            console.log(`[PWA Sync] Queued email to ${email.recipientEmail} synced!`);
            await removeQueuedEmail(email.id!);
          } else {
            console.error(`[PWA Sync] Sync failed for ${email.recipientEmail}:`, resData.error);
          }
        } catch (err) {
          console.error(`[PWA Sync] Transmission error:`, err);
        }
      }

      const updatedQueued = await getQueuedEmails();
      setQueuedEmailsCount(updatedQueued.length);
      setIsSyncing(false);
    } catch (e) {
      console.error('[PWA Sync] Failed executing background sync:', e);
      setIsSyncing(false);
    }
  };

  // TRIGGER THE PWA INSTALLATION SEQUENCE
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA Install] Outcome of install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // SAVE CURRENT RESUME WORKSPACE TO LOCALSTORAGE AND INDEXEDDB
  const saveCurrentDraftToLocalStorage = async (draftToSave: ResumeDraft) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftToSave.id);
    const newDrafts = [draftToSave, ...updatedDrafts];
    setDrafts(newDrafts);
    localStorage.setItem('srb_draft_resumes', JSON.stringify(newDrafts));

    try {
      // Save to IndexedDB durable store
      await saveResumeToDB(draftToSave);
    } catch (err) {
      console.error('[IndexedDB Save Failed]', err);
    }

    // Non-intrusive debounced toast trigger
    if (notificationsEnabled) {
      setShowSavedToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowSavedToast(false);
      }, 2000);
    }
  };

  // LOAD SAVED RESUMES FROM STORAGE WITH HYDRATION SAFEGUARDS, SERVICE WORKER, AND CONNECTIVITY SYNCS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Connectivity status listeners
      const currentOnlineStatus = navigator.onLine;
      setTimeout(() => {
        setIsOnline(currentOnlineStatus);
      }, 0);

      const handleOnline = () => {
        setIsOnline(true);
        // Instantly clear any potential offline flags stored in localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('offline');
          localStorage.removeItem('isOffline');
          localStorage.removeItem('srb_offline');
          localStorage.removeItem('offline_mode');
          localStorage.setItem('isOnline', 'true');
        }
        // Trigger back-online toast instantly with auto-hide behavior
        if (notificationsEnabledRef.current) {
          setShowOnlineToast(true);
          if (onlineToastTimeoutRef.current) {
            clearTimeout(onlineToastTimeoutRef.current);
          }
          onlineToastTimeoutRef.current = setTimeout(() => {
            setShowOnlineToast(false);
          }, 3000);
        }

        // Automatically sync queued emails on network restoration
        syncOfflineQueuedEmails();
      };
      const handleOffline = () => {
        setIsOnline(false);
        setShowOnlineToast(false); // Instantly hide back-online toast if went offline again
        if (onlineToastTimeoutRef.current) {
          clearTimeout(onlineToastTimeoutRef.current);
        }
      };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 2. Unregister Service Worker to prevent HMR and module caching issues
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        // Also clear cache storage to avoid stale assets/chunks
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
      }

      // 3. Capture PWA beforeinstallprompt event to enable install prompt UI
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // 4. Initial Load of Saved Resumes from IndexedDB / LocalStorage
      const saved = localStorage.getItem('srb_draft_resumes');
      let loadedDrafts: ResumeDraft[] = [];
      if (saved) {
        try {
          loadedDrafts = JSON.parse(saved);
        } catch (err) {
          console.error('Failed to parse saved resumes archive', err);
        }
      }

      const seedDraft = {
        id: 'draft-seed-1',
        title: 'Strategic Cloud Lead Developer CV',
        fullName: 'Siraj Ahmed',
        professionalTitle: 'Lead Solutions Architect & Full-Stack Developer',
        email: 'siraj@example.com',
        phone: '+971 50 123 4567',
        address: 'Dubai Core Tech Hub, UAE',
        summary: 'Forward-looking solutions developer dedicated to crafting highly interactive and structured modular applications designed for continuous scale.',
        experiences: [
          { id: 'exp-1', company: 'Acme Systems Global', position: 'Senior Infrastructure Engineer', duration: '05/2023 - Present', details: 'Architected high performance enterprise microservices. Guided a staff of 12 engineering professionals.' }
        ],
        education: [
          { id: 'edu-1', school: 'University of Engineering and IT', degree: 'B.Sc. Computer Engineering', duration: '09/2016 - 06/2020' }
        ],
        skills: ['Cloud Native Platforms', 'Next.js App Router', 'Material 3 Design', 'Glassmorphism', 'D3 Analysis'],
        trainings: [
          { id: 'train-1', title: 'Advanced Cloud Architecture Certification', provider: 'Google Cloud Platform', date: '2024', details: 'Completed intensive labs and case studies on globally scalable high-availability clusters.' }
        ],
        templateId: 50,
        lastSaved: '2026-06-19'
      };

      const hydrateAndLoad = async () => {
        try {
          // Attempt loading from IndexedDB durable layer
          const idbDrafts = await getAllResumes();
          
          if (idbDrafts && idbDrafts.length > 0) {
            console.log('[IndexedDB] Successfully loaded drafts:', idbDrafts.length);
            setDrafts(idbDrafts);
            // Backup save to localStorage
            localStorage.setItem('srb_draft_resumes', JSON.stringify(idbDrafts));
          } else if (loadedDrafts.length > 0) {
            // No IndexedDB data but have LocalStorage data -> Migrate to IndexedDB
            console.log('[IndexedDB] Hydrating database store with existing LocalStorage drafts');
            setDrafts(loadedDrafts);
            await saveAllResumesToDB(loadedDrafts);
          } else {
            // First install -> Seed default CV in both
            console.log('[PWA] Seeding default resume builder CV template');
            const defaultResumes = [seedDraft];
            setDrafts(defaultResumes);
            localStorage.setItem('srb_draft_resumes', JSON.stringify(defaultResumes));
            await saveAllResumesToDB(defaultResumes);
          }

          // Load SMTP values asynchronously
          setSmtpHostOverride(localStorage.getItem('srb_smtp_host') || '');
          setSmtpPortOverride(localStorage.getItem('srb_smtp_port') || '');
          setSmtpUserOverride(localStorage.getItem('srb_smtp_user') || '');
          setSmtpPassOverride(localStorage.getItem('srb_smtp_pass') || '');

          // Get initial queued emails count
          const queued = await getQueuedEmails();
          setQueuedEmailsCount(queued.length);
        } catch (err) {
          console.error('[Hydration Error] Failed loading drafts from IndexedDB', err);
          // Fallback to standard localstorage if indexeddb fails
          if (loadedDrafts.length > 0) {
            setDrafts(loadedDrafts);
          } else {
            setDrafts([seedDraft]);
          }
        }
      };

      hydrateAndLoad();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        if (onlineToastTimeoutRef.current) {
          clearTimeout(onlineToastTimeoutRef.current);
        }
      };
    }
  }, []);

  // Toast timeout cleanup
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (onlineToastTimeoutRef.current) {
        clearTimeout(onlineToastTimeoutRef.current);
      }
    };
  }, []);

  // EXPORT TO WORD DOCUMENT (.docx format)
  const handleExportWord = async (customScope?: 'resume_only' | 'cover_only' | 'full_suite') => {
    if (!currentDraft) return;
    const fullName = currentDraft.fullName || 'Siraj Ahmed';
    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10]; // Fallback to Royal Blue
    const activeScope = customScope || exportScope || 'full_suite';
    
    try {
      const { generateDocxBlob } = await import('@/lib/docx-generator');
      const blob = await generateDocxBlob(currentDraft, activeTemplate, activeScope);
      const url = URL.createObjectURL(blob);
      const fNameStr = fullName.replace(/\s+/g, '_');
      
      let suffix = '';
      if (activeScope === 'resume_only') suffix = '_Resume';
      else if (activeScope === 'cover_only') suffix = '_CoverLetter';
      else suffix = '_FullSuite';
      
      const filename = `${fNameStr}${suffix}.docx`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failure:", err);
    }
  };

  // COMPOSER OF FULL HIGH-FIDELITY WEB/PRINT MULTIPAGE EMBEDDABLE HTML
  const buildFullExportHtml = (draft: ResumeDraft, scope: 'resume_only' | 'cover_only' | 'full_suite', activeTemplate: typeof TEMPLATES[0], onlyPageNumber?: number, selectedPageIds?: string[]) => {
    const fullName = draft.fullName || 'Siraj Ahmed';
    const email = draft.email || '';
    const phone = draft.phone || '';
    const address = draft.address || '';
    const title = draft.professionalTitle || '';
    const summary = draft.summary || '';
    const deletedFilters = draft.deletedFields || [];

    let finalPrimaryColor = activeTemplate.primaryColor;
    let finalAccentHex = activeTemplate.accentHex || '#3b82f6';

    if (draft.colorTheme) {
      if (draft.colorTheme === 'teal') {
        finalPrimaryColor = 'from-[#0d9488] to-[#065f46]';
        finalAccentHex = '#10b981';
      } else if (draft.colorTheme === 'cobalt') {
        finalPrimaryColor = 'from-[#1d4ed8] to-[#1e1b4b]';
        finalAccentHex = '#3b82f6';
      } else if (draft.colorTheme === 'sunset') {
        finalPrimaryColor = 'from-[#f97316] to-[#be123c]';
        finalAccentHex = '#f97316';
      } else if (draft.colorTheme === 'amethyst') {
        finalPrimaryColor = 'from-[#6d28d9] to-[#4c1d95]';
        finalAccentHex = '#a855f7';
      } else if (draft.colorTheme === 'crimson') {
        finalPrimaryColor = 'from-[#be123c] to-[#991b1b]';
        finalAccentHex = '#e11d48';
      } else if (draft.colorTheme === 'obsidian') {
        finalPrimaryColor = 'from-[#020617] via-[#090d1a] to-[#d97706]';
        finalAccentHex = '#fbbf24';
      } else if (draft.colorTheme === 'slate') {
        finalPrimaryColor = 'from-[#475569] to-[#334155]';
        finalAccentHex = '#64748b';
      } else if (draft.colorTheme === 'navy') {
        finalPrimaryColor = 'from-[#0f172a] to-[#172554]';
        finalAccentHex = '#2563eb';
      }
    }

    const hexes = finalPrimaryColor.match(/#([0-9a-fA-F]{3,8})/g) || [];
    const accentHex = finalAccentHex;
    
    let baseBgColor = '#0f172a';
    let linearGradient = 'linear-gradient(135deg, #0f172a, #1e293b)';
    if (finalPrimaryColor.startsWith('from-')) {
      const twHexes = finalPrimaryColor.match(/#([0-9a-fA-F]{3,6})/g) || [];
      if (twHexes.length >= 2) {
        baseBgColor = twHexes[0];
        linearGradient = `linear-gradient(135deg, ${twHexes[0]}, ${twHexes[twHexes.length - 1]})`;
      } else if (twHexes.length === 1) {
        baseBgColor = twHexes[0];
        linearGradient = twHexes[0];
      }
    } else if (hexes.length >= 2) {
      baseBgColor = hexes[0] || '#0f172a';
      linearGradient = `linear-gradient(135deg, ${hexes[0] || '#0f172a'}, ${hexes[hexes.length - 1] || '#1e293b'})`;
    } else if (hexes.length === 1) {
      baseBgColor = hexes[0] || '#0f172a';
      linearGradient = hexes[0] || '#0f172a';
    }

    let isDarkTheme = activeTemplate && (
      activeTemplate.name.toLowerCase().includes('black') || 
      activeTemplate.name.toLowerCase().includes('luxury') || 
      activeTemplate.name.toLowerCase().includes('dark') || 
      activeTemplate.name.toLowerCase().includes('midnight') || 
      activeTemplate.name.toLowerCase().includes('cosmic') || 
      activeTemplate.name.toLowerCase().includes('visionos') || 
      activeTemplate.name.toLowerCase().includes('cyberpunk') || 
      activeTemplate.name.toLowerCase().includes('plum')
    );
    if (draft.previewMode === 'dark') {
      isDarkTheme = true;
    } else if (draft.previewMode === 'light') {
      isDarkTheme = false;
    }

    const innerCardBg = isDarkTheme ? '#090d1a' : '#ffffff';
    const textPrimaryColor = isDarkTheme ? '#ffffff' : '#0f172a';
    const textSecondaryColor = accentHex;
    const textMutedColor = isDarkTheme ? '#cbd5e1' : '#475569';
    const borderBlockColor = isDarkTheme ? '#1e293b' : '#e2e8f0';
    const tagBgColor = isDarkTheme ? '#1e293b' : '#f1f5f9';
    const tagTextColor = isDarkTheme ? '#93c5fd' : '#1e3a8a';
    const sidebarBgColor = isDarkTheme ? '#020617' : '#f8fafc';

    // Premium template configurations
    const tName = activeTemplate.name;
    let customInnerCardBg = innerCardBg;
    let customSidebarBgColor = sidebarBgColor;
    let customTextPrimaryColor = textPrimaryColor;
    let customTextMutedColor = textMutedColor;
    let customBorderBlockColor = borderBlockColor;

    if (tName === 'Professional Sidebar' || tName === 'Sidebar Left Split') {
      customInnerCardBg = isDarkTheme ? '#090d1a' : '#ffffff'; 
      customSidebarBgColor = isDarkTheme ? '#020617' : '#0f172a'; 
      customTextPrimaryColor = isDarkTheme ? '#ffffff' : '#0f172a'; 
      customTextMutedColor = isDarkTheme ? '#cbd5e1' : '#334155'; 
      customBorderBlockColor = isDarkTheme ? '#1e293b' : '#e2e8f0';
    } else if (tName === 'Eclipse' || tName === 'Developer Tech Spec') {
      customInnerCardBg = '#0b0f19';
      customSidebarBgColor = '#030712';
      customTextPrimaryColor = '#ffffff';
      customTextMutedColor = '#cbd5e1';
      customBorderBlockColor = '#1e293b';
    } else if (tName === 'Quantum') {
      customInnerCardBg = '#070b15';
      customSidebarBgColor = '#02040a';
      customTextPrimaryColor = '#e2e8f0';
      customTextMutedColor = '#94a3b8';
      customBorderBlockColor = '#1e293b';
    }

    // Font Configuration per template with fontPack override
    let mainFont = 'system-ui, -apple-system, sans-serif';
    let headingFont = 'system-ui, -apple-system, sans-serif';
    let headingWeight = '800';
    let headingCase = 'uppercase';
    let letterSpacing = '0.5px';

    if (draft.fontPack === 'sans') {
      mainFont = '"Inter", sans-serif';
      headingFont = '"Space Grotesk", sans-serif';
      headingWeight = '700';
      headingCase = 'uppercase';
      letterSpacing = '1px';
    } else if (draft.fontPack === 'serif') {
      mainFont = '"Georgia", serif';
      headingFont = '"Playfair Display", serif';
      headingWeight = '700';
      headingCase = 'none';
      letterSpacing = '0.5px';
    } else if (draft.fontPack === 'mono') {
      mainFont = '"JetBrains Mono", monospace';
      headingFont = '"JetBrains Mono", monospace';
      headingWeight = '700';
      headingCase = 'uppercase';
      letterSpacing = '1px';
    } else {
      // Default template fonts
      if (tName === 'Astralis' || tName === 'Centered Alignment') {
        mainFont = '"Inter", sans-serif';
        headingFont = '"Playfair Display", Georgia, serif';
        headingWeight = '700';
        headingCase = 'none';
        letterSpacing = '1px';
      } else if (tName === 'Galaxy' || tName === 'Magazine Hero Header') {
        mainFont = '"Outfit", sans-serif';
        headingFont = '"Outfit", sans-serif';
        headingWeight = '800';
        headingCase = 'uppercase';
        letterSpacing = '2px';
      } else if (tName === 'Eclipse' || tName === 'Newspaper Editorial') {
        mainFont = '"Montserrat", sans-serif';
        headingFont = '"Cinzel", "Playfair Display", serif';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1.5px';
      } else if (tName === 'Axis' || tName === 'Vertical Career Timeline') {
        mainFont = '"Inter", sans-serif';
        headingFont = '"Space Grotesk", sans-serif';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1px';
      } else if (tName === 'Keystone' || tName === 'Formal Government ATS') {
        mainFont = '"Georgia", serif';
        headingFont = '"Georgia", serif';
        headingWeight = '800';
        headingCase = 'uppercase';
        letterSpacing = '0.5px';
      } else if (tName === 'Helix' || tName === 'Developer Tech Spec') {
        mainFont = '"Inter", sans-serif';
        headingFont = '"JetBrains Mono", monospace';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1px';
      } else if (tName === 'Horizon' || tName === 'Modern Clean Line') {
        mainFont = '"Outfit", sans-serif';
        headingFont = '"Outfit", sans-serif';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1.5px';
      } else if (tName === 'Professional Sidebar' || tName === 'Sidebar Left Split') {
        mainFont = '"Inter", sans-serif';
        headingFont = '"Inter", sans-serif';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '0.5px';
      } else if (tName === 'Aurora' || tName === 'Minimal Whitespace') {
        mainFont = '"Inter", sans-serif';
        headingFont = '"Space Grotesk", sans-serif';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1.5px';
      } else if (tName === 'Quantum' || tName === 'Grid Portfolio Cards') {
        mainFont = '"JetBrains Mono", monospace';
        headingFont = '"JetBrains Mono", monospace';
        headingWeight = '700';
        headingCase = 'uppercase';
        letterSpacing = '1px';
      }
    }
    // Custom Section Header Renderer
    const renderSectionHeader = (sectionTitle: string, isIntro: boolean = true) => {
      const fullTitle = isIntro ? sectionTitle : `${sectionTitle} (Continued)`;
      
      if (tName === 'Centered Alignment') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px solid ${textSecondaryColor}40; padding-bottom: 4px; margin-bottom: 12px; text-transform: ${headingCase}; letter-spacing: ${letterSpacing}; text-align: center;">✦ ${fullTitle} ✦</div>`;
      }
      if (tName === 'Newspaper Editorial') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: bold; color: #1c1917; border-top: 1px solid #1c1917; border-bottom: 1px solid #1c1917; padding: 3px 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">${fullTitle}</div>`;
      }
      if (tName === 'Vertical Career Timeline') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: bold; color: ${textSecondaryColor}; border-left: 3px solid ${textSecondaryColor}; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase;">${fullTitle}</div>`;
      }
      if (tName === 'Developer Tech Spec') {
        return `<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${textSecondaryColor}; border: 1px dashed ${textSecondaryColor}60; padding: 4px 10px; margin-bottom: 12px; background: rgba(16,185,129,0.05);">[SYSTEM_CORE_NODE: ${fullTitle}]</div>`;
      }
      if (tName === 'Formal Government ATS') {
        return `<div style="font-family: ${headingFont}; font-size: 12px; font-weight: bold; color: #000000; border-bottom: 1px solid #000000; padding-bottom: 2px; margin-bottom: 10px; text-transform: uppercase;">${fullTitle}</div>`;
      }
      if (tName === 'Minimal Whitespace') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: 500; color: #000000; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1.5px;">${fullTitle}</div>`;
      }
      if (tName === 'Academic Research CV') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: bold; color: #1c1917; text-decoration: underline; margin-bottom: 10px; text-transform: uppercase;">${fullTitle}</div>`;
      }
      if (tName === 'Elegant Bookish Serif') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: bold; color: ${textSecondaryColor}; border-bottom: 1px solid ${textSecondaryColor}50; padding-bottom: 2px; margin-bottom: 10px; text-transform: uppercase;">${fullTitle}</div>`;
      }
      if (tName === 'Grid Portfolio Cards') {
        return `<div style="font-family: ${headingFont}; font-size: 12px; font-weight: bold; color: ${textSecondaryColor}; display: inline-block; background: ${textSecondaryColor}15; padding: 3px 10px; border-radius: 9999px; margin-bottom: 12px; text-transform: uppercase;">✨ ${fullTitle}</div>`;
      }
      if (tName === 'Startup Growth Leader') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: 800; color: ${textSecondaryColor}; border-bottom: 2px solid ${textSecondaryColor}; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase;">🚀 ${fullTitle}</div>`;
      }
      if (tName === 'Astralis') {
        return `<div style="font-family: ${headingFont}; font-size: 14px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px solid ${textSecondaryColor}; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: ${letterSpacing};">✦ ${fullTitle}</div>`;
      }
      if (tName === 'Galaxy') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px dashed ${accentHex}80; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing};">🌌 ${fullTitle}</div>`;
      }
      if (tName === 'Eclipse') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: ${headingWeight}; color: ${customTextPrimaryColor}; border-bottom: 3px double ${textSecondaryColor}; padding-bottom: 3px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing}; text-align: center;">🌘 ${fullTitle} 🌒</div>`;
      }
      if (tName === 'Axis') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-left: 3px solid ${textSecondaryColor}; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing};">│ ${fullTitle}</div>`;
      }
      if (tName === 'Keystone') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: ${headingWeight}; color: ${customTextPrimaryColor}; border: 1px solid ${customBorderBlockColor}; border-width: 1px 0; padding: 4px 0; text-align: center; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing};">🏛️ ${fullTitle} 🏛️</div>`;
      }
      if (tName === 'Helix') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px solid ${customBorderBlockColor}; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing}; display: flex; align-items: center; gap: 6px;">🧬 ${fullTitle}</div>`;
      }
      if (tName === 'Horizon') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px solid ${accentHex}; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing};">🌅 ${fullTitle}</div>`;
      }
      if (tName === 'Professional Sidebar') {
        return `<div style="font-family: ${headingFont}; font-size: 13px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 2px solid ${textSecondaryColor}; padding-bottom: 2px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: ${letterSpacing};">${fullTitle}</div>`;
      }
      if (tName === 'Aurora') {
        return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border-bottom: 1px solid ${textSecondaryColor}; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing}; text-shadow: 0 0 8px ${textSecondaryColor}40;">❄️ ${fullTitle}</div>`;
      }
      if (tName === 'Quantum') {
        return `<div style="font-family: ${headingFont}; font-size: 12px; font-weight: ${headingWeight}; color: ${textSecondaryColor}; border: 1px dashed ${textSecondaryColor}60; padding: 6px 12px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: ${letterSpacing}; font-family: 'JetBrains Mono', monospace; background: rgba(6,182,212,0.03);">[SYSTEM_CORE_NODE: ${fullTitle}]</div>`;
      }
      return `<div style="font-family: ${headingFont}; font-size: 13.5px; font-weight: bold; color: ${textSecondaryColor}; border-bottom: 2px solid ${textSecondaryColor}; padding-bottom: 2px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${fullTitle}</div>`;
    };

    const isSidebarLayout = activeTemplate && (
      activeTemplate.layout.toLowerCase().includes('sidebar') ||
      activeTemplate.layout.toLowerCase().includes('two column') ||
      activeTemplate.layout.toLowerCase().includes('rail') ||
      activeTemplate.layout.toLowerCase().includes('asymmetric') ||
      activeTemplate.layout.toLowerCase().includes('bespoke') ||
      activeTemplate.layout.toLowerCase().includes('dual')
    );

    const pagination = calculateResumePagination(draft, isSidebarLayout);

    // Dynamic Helper HTML renderers per page drawing from pagination engine
    const renderExperiencesHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.experiences || [];
      if (items.length === 0) return '';
      const isIntro = pageNum === 1 || !pagination.pages[pageNum - 1]?.experiences?.length;
      const titleHtml = renderSectionHeader("Work Experience", isIntro);

      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${items.map(exp => `
              <div style="margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <strong style="font-size: 13px; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${exp.position}</strong>
                  <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: bold; font-family: ${headingFont};">${exp.duration}</span>
                </div>
                <div style="font-size: 12px; color: ${textSecondaryColor}; font-weight: 600; margin-top: 1px; font-family: ${headingFont};">${exp.company}</div>
                <p style="font-size: 11.5px; color: ${customTextMutedColor}; margin: 4px 0 0 0; line-height: 1.5; text-align: justify; white-space: pre-wrap;">${exp.details}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderProjectsHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.projects || [];
      if (items.length === 0) return '';
      const isIntro = pageNum === 1 || !pagination.pages[pageNum - 1]?.projects?.length;
      const titleHtml = renderSectionHeader("Projects & Initiatives", isIntro);

      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${items.map(proj => `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <strong style="font-size: 13px; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${proj.title}</strong>
                  <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: bold; font-family: ${headingFont};">${proj.duration}</span>
                </div>
                <div style="font-size: 11.5px; color: ${textSecondaryColor}; font-style: italic; margin-top: 1px; font-family: ${headingFont};">Role: ${proj.role}</div>
                <p style="font-size: 11.5px; color: ${customTextMutedColor}; margin: 3px 0 0 0; line-height: 1.5; white-space: pre-wrap;">${proj.details}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderEducationHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.education || [];
      if (items.length === 0) return '';
      const isIntro = pageNum === 1 || !pagination.pages[pageNum - 1]?.education?.length;
      const titleHtml = renderSectionHeader("Academic Background", isIntro);

      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${items.map(edu => `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <strong style="font-size: 12.5px; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${edu.degree}</strong>
                  <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: bold; font-family: ${headingFont};">${edu.duration}</span>
                </div>
                <div style="font-size: 11.5px; color: ${customTextMutedColor}; margin-top: 1px;">${edu.school}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderCertificationsHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.certifications || [];
      if (items.length === 0) return '';
      const isIntro = pageNum === 1 || !pagination.pages[pageNum - 1]?.certifications?.length;
      const titleHtml = renderSectionHeader("Certifications & Licenses", isIntro);

      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${items.map(cert => `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <strong style="font-size: 12.5px; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${cert.title}</strong>
                  <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: bold; font-family: ${headingFont};">${cert.date}</span>
                </div>
                <div style="font-size: 11.5px; color: ${customTextMutedColor}; margin-top: 1px;">Issuer: ${cert.issuer}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderTrainingsHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.trainings || [];
      if (items.length === 0) return '';
      const isIntro = pageNum === 1 || !pagination.pages[pageNum - 1]?.trainings?.length;
      const titleHtml = renderSectionHeader("Training & Specializations", isIntro);

      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${items.map(trn => `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <strong style="font-size: 12.5px; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${trn.title}</strong>
                  <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: bold; font-family: ${headingFont};">${trn.date}</span>
                </div>
                <div style="font-size: 11.5px; color: ${customTextMutedColor}; margin-top: 1px;">Provider: ${trn.provider}</div>
                ${trn.details ? `<p style="font-size: 11.5px; color: ${customTextMutedColor}; margin: 3px 0 0 0; line-height: 1.5; white-space: pre-wrap;">${trn.details}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderSkillsHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.skills || [];
      if (items.length === 0) return '';
      const titleHtml = renderSectionHeader("Strategic Core Skills", true);
      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
            ${items.map(s => `
              <span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 8px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap; display: inline-block; margin-bottom: 4px; margin-right: 4px;">⚡ ${s}</span>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderLanguagesHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.languages || [];
      if (items.length === 0) return '';
      const titleHtml = renderSectionHeader("Languages", true);
      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
            ${items.map(l => `
              <div style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 8px; border-radius: 6px; border: 1px solid ${customBorderBlockColor}; box-sizing: border-box; display: inline-block; margin-bottom: 4px; margin-right: 4px;">
                <strong style="color: ${customTextPrimaryColor}; font-size: 11px; display: inline-block;">${l.name}</strong>
                <span style="font-size: 9.5px; color: ${textSecondaryColor}; font-weight: 600; margin-left: 4px;">🗣️ ${l.proficiency}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderReferencesHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.references || [];
      if (items.length === 0) return '';
      const titleHtml = renderSectionHeader("References", true);
      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
            ${items.map(r => `
              <div style="border: 1px solid ${customBorderBlockColor}; border-radius: 6px; padding: 6px 10px; background-color: ${isDarkTheme ? 'rgba(255,255,255,0.03)' : '#f8fafc'}; box-sizing: border-box; margin-bottom: 4px;">
                <strong style="font-size: 11.5px; color: ${customTextPrimaryColor};">${r.name}</strong>
                <span style="font-size: 10px; color: ${textSecondaryColor}; font-weight: 600; margin-left: 6px;">${r.organization}</span>
                <span style="font-size: 10px; color: ${customTextMutedColor}; margin-left: 6px;">📞 ${r.contact}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderSocialLinksHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.socialLinks || [];
      if (items.length === 0) return '';
      const titleHtml = renderSectionHeader("Contact Networks & Links", true);
      return `
        <div style="margin-top: 10px;">
          ${titleHtml}
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
            ${items.map(s => `
              <div style="font-size: 11.5px; margin-bottom: 2px;">
                <span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; margin-right: 6px;">${s.platform}</span>
                <a href="${s.url}" target="_blank" style="color: ${textSecondaryColor}; text-decoration: none; word-break: break-all;">${s.url}</a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderCustomFieldsHtml = (pageNum: number) => {
      const pageData = pagination.pages[pageNum];
      const items = pageData?.customFields || [];
      if (items.length === 0) return '';
      const titleHtml = renderSectionHeader("Core Attributes", true);
      return `
        <div style="margin-top: 10px; width: 100%;">
          ${titleHtml}
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
            ${items.map(f => `
              <div style="background-color: ${tagBgColor}; border: 1px solid ${customBorderBlockColor}; padding: 6px 12px; border-radius: 8px; box-sizing: border-box; min-width: 140px; display: inline-block;">
                <div style="font-size: 9px; font-weight: bold; color: ${textSecondaryColor}; text-transform: uppercase;">${f.label}</div>
                <div style="font-size: 11.5px; color: ${customTextPrimaryColor}; font-weight: 500; margin-top: 2px;">${f.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const photoHtml = (!deletedFilters.includes('profilePhoto') && draft.profilePhoto) ? `
      <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid ${isDarkTheme ? '#ffffff' : accentHex}; background-color: #f1f5f9; flex-shrink: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.15); margin-right: 18px;">
        <img src="${draft.profilePhoto}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" />
      </div>
    ` : '';

    const renderHeaderBlock = (pageNum: number) => {
      const emailHtml = !deletedFilters.includes('email') && email ? `<div>📧 ${email}</div>` : '';
      const phoneHtml = !deletedFilters.includes('phone') && phone ? `<div style="margin-top: 2px;">📞 ${phone}</div>` : '';
      const addressHtml = !deletedFilters.includes('address') && address ? `<div style="margin-top: 2px;">📍 ${address}</div>` : '';

      const tagsHtml = `
        ${!deletedFilters.includes('nationality') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">🗺️ ${draft.nationality || 'Nationality Unspecified'}</span>` : ''}
        ${!deletedFilters.includes('dateOfBirth') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">📅 ${draft.dateOfBirth || 'DOB Unspecified'}</span>` : ''}
        ${!deletedFilters.includes('gender') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">👤 ${draft.gender || 'Gender Unspecified'}</span>` : ''}
        ${!deletedFilters.includes('maritalStatus') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">❤️ ${draft.maritalStatus || 'Single'}</span>` : ''}
      `;

      if (pageNum === 1) {
        if (tName === 'Professional Sidebar') {
          // Special minimalist header for sidebar layout because profile photo is in sidebar
          return `
            <div style="padding: 24px; border-bottom: 2px solid ${customBorderBlockColor};">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: ${customTextPrimaryColor}; text-shadow: none; font-family: ${headingFont};">${fullName.toUpperCase()}</h1>
              <div style="margin-top: 4px; font-size: 13.5px; font-weight: bold; color: ${textSecondaryColor}; letter-spacing: 1px; text-transform: uppercase; font-family: ${headingFont};">${title}</div>
            </div>
          `;
        }

        if (tName === 'Quantum') {
          return `
            <div style="padding: 24px; border-bottom: 1px dashed ${textSecondaryColor}60; font-family: 'JetBrains Mono', monospace;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                  ${photoHtml}
                  <div>
                    <div style="font-size: 10px; color: ${textSecondaryColor}; font-weight: bold; margin-bottom: 2px;">// USER_IDENTIFIER_LOADED</div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${customTextPrimaryColor}; letter-spacing: -0.5px;">${fullName.toUpperCase()}</h1>
                    <div style="margin-top: 4px; font-size: 12px; color: ${textSecondaryColor}; text-transform: uppercase;">[${title}]</div>
                  </div>
                </div>
                <div style="font-size: 11px; color: ${customTextMutedColor}; text-align: right; line-height: 1.6;">
                  ${emailHtml}
                  ${phoneHtml}
                  ${addressHtml}
                </div>
              </div>
              <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${tagsHtml}
              </div>
            </div>
          `;
        }

        if (tName === 'Astralis') {
          return `
            <div style="padding: 24px; border-bottom: 2px solid ${textSecondaryColor}; font-family: 'Inter', sans-serif;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center;">
                  ${photoHtml}
                  <div>
                    <h1 style="margin: 0; font-size: 26px; font-family: ${headingFont}; font-weight: 700; color: ${customTextPrimaryColor}; letter-spacing: 0.5px;">✦ ${fullName} ✦</h1>
                    <div style="margin-top: 4px; font-size: 13px; font-family: ${headingFont}; font-weight: bold; color: ${textSecondaryColor}; text-transform: uppercase; letter-spacing: 1.5px;">${title}</div>
                  </div>
                </div>
                <div style="font-size: 11.5px; color: ${customTextMutedColor}; text-align: right; line-height: 1.6;">
                  ${emailHtml}
                  ${phoneHtml}
                  ${addressHtml}
                </div>
              </div>
              <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${tagsHtml}
              </div>
            </div>
          `;
        }

        if (tName === 'Eclipse') {
          return `
            <div style="padding: 24px; border-bottom: 3px double ${textSecondaryColor}; text-align: center; font-family: 'Montserrat', sans-serif;">
              <div style="display: flex; flex-direction: column; align-items: center;">
                ${photoHtml ? `<div style="margin-bottom: 12px;">${photoHtml}</div>` : ''}
                <h1 style="margin: 0; font-size: 28px; font-family: ${headingFont}; font-weight: 700; color: ${customTextPrimaryColor}; letter-spacing: 2px; text-transform: uppercase;">🌘 ${fullName} 🌒</h1>
                <div style="margin-top: 6px; font-size: 13.5px; font-family: ${headingFont}; font-weight: bold; color: ${textSecondaryColor}; text-transform: uppercase; letter-spacing: 2px;">${title}</div>
                
                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; font-size: 11.5px; color: ${customTextMutedColor};">
                  ${!deletedFilters.includes('email') && email ? `<span>📧 ${email}</span>` : ''}
                  ${!deletedFilters.includes('phone') && phone ? `<span>📞 ${phone}</span>` : ''}
                  ${!deletedFilters.includes('address') && address ? `<span>📍 ${address}</span>` : ''}
                </div>
                
                <div style="margin-top: 12px; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
                  ${tagsHtml}
                </div>
              </div>
            </div>
          `;
        }

        return `
          <!-- DEFAULT HEADER BLOCK -->
          <div style="padding: 24px; border-bottom: 2px solid ${customBorderBlockColor};">
            <div style="display: flex; align-items: center;">
              ${photoHtml}
              <div style="flex: 1;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: ${customTextPrimaryColor}; text-shadow: none; font-family: ${headingFont};">${fullName.toUpperCase()}</h1>
                <div style="margin-top: 4px; font-size: 13px; font-weight: bold; color: ${textSecondaryColor}; letter-spacing: 1px; text-transform: uppercase; font-family: ${headingFont};">${title}</div>
                
                <!-- Metadata bar -->
                <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                  ${tagsHtml}
                </div>
              </div>
              
              <div style="font-size: 11.5px; color: ${customTextMutedColor}; line-height: 1.6; text-align: right; white-space: nowrap; margin-left: 20px;">
                ${emailHtml}
                ${phoneHtml}
                ${addressHtml}
              </div>
            </div>
          </div>
        `;
      } else {
        // Running headers for Page 2+
        if (tName === 'Quantum') {
          return `
            <div style="padding: 12px 24px; border-bottom: 1px dashed ${textSecondaryColor}60; display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <span style="color: ${customTextPrimaryColor};">[LOG_NODE: ${fullName.toUpperCase()} // PAGE ${pageNum}]</span>
              <span style="color: ${textSecondaryColor}; text-transform: uppercase;">SYS_TITLE: ${title}</span>
            </div>
          `;
        }
        if (tName === 'Astralis') {
          return `
            <div style="padding: 12px 24px; border-bottom: 2px solid ${textSecondaryColor}; display: flex; justify-content: space-between; align-items: center; font-family: ${headingFont}; font-size: 12px;">
              <span style="font-weight: 700; color: ${customTextPrimaryColor};">✦ ${fullName} — Page ${pageNum}</span>
              <span style="color: ${textSecondaryColor}; text-transform: uppercase; letter-spacing: 1px;">${title}</span>
            </div>
          `;
        }
        if (tName === 'Eclipse') {
          return `
            <div style="padding: 12px 24px; border-bottom: 3px double ${textSecondaryColor}; display: flex; justify-content: space-between; align-items: center; font-family: ${headingFont}; font-size: 12px; text-transform: uppercase;">
              <span style="font-weight: 700; color: ${customTextPrimaryColor};">🌘 ${fullName} — Page ${pageNum}</span>
              <span style="color: ${textSecondaryColor}; letter-spacing: 1.5px;">${title} 🌒</span>
            </div>
          `;
        }
        return `
          <!-- SUBSEQUENT PAGES running Header -->
          <div style="padding: 12px 24px; border-bottom: 2px solid ${customBorderBlockColor}; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: bold; color: ${customTextPrimaryColor}; font-family: ${headingFont};">${fullName.toUpperCase()} — Page ${pageNum}</span>
            <span style="font-size: 11px; color: ${textSecondaryColor}; font-weight: 800; text-transform: uppercase; font-family: ${headingFont};">${title}</span>
          </div>
        `;
      }
    };

    const pagesList: number[] = [];
    for (let p = 1; p <= pagination.totalPages; p++) {
      pagesList.push(p);
    }

    const resumePagesMarkup = pagesList.map((pageNum) => {
      if (onlyPageNumber !== undefined && pageNum !== onlyPageNumber) return '';
      if (selectedPageIds !== undefined && !selectedPageIds.includes(`page${pageNum}`)) return '';
      
      const expMarkup = renderExperiencesHtml(pageNum);
      const eduMarkup = renderEducationHtml(pageNum);
      const sksMarkup = renderSkillsHtml(pageNum);
      const prjMarkup = renderProjectsHtml(pageNum);
      const crtMarkup = renderCertificationsHtml(pageNum);
      const trnMarkup = renderTrainingsHtml(pageNum);
      const lanMarkup = renderLanguagesHtml(pageNum);
      const refMarkup = renderReferencesHtml(pageNum);
      const socMarkup = renderSocialLinksHtml(pageNum);
      const customAttributesMarkup = renderCustomFieldsHtml(pageNum);

      // Unique custom dynamic headers
      const headerBlock = renderHeaderBlock(pageNum);

      return `
        <!-- PAGE ${pageNum} SHEET -->
        <div class="page-break" style="width: 210mm; height: 296mm; min-height: 296mm; max-height: 296mm; box-sizing: border-box; background: ${linearGradient}; padding: 20px; overflow: hidden; position: relative; font-family: ${mainFont}; ${draft.textDirection === 'rtl' ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'}">
          <div style="background-color: ${customInnerCardBg}; border-radius: 16px; overflow: hidden; border: 1px solid ${customBorderBlockColor}; box-shadow: 0 10px 25px rgba(0,0,0,0.1); height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
            
            <div>
              ${headerBlock}

              <!-- BODY CONTENT WITH SIDEBAR-VS-SINGLE SEGMENT FOR PAGE ${pageNum} -->
              ${(() => {
                let mainBodyHtml = '';

                if (tName === 'Sidebar Left Split' || tName === 'Professional Sidebar') {
                  mainBodyHtml = `
                    <div style="display: flex; flex-direction: ${draft.textDirection === 'rtl' ? 'row-reverse' : 'row'};">
                      <!-- Left Sidebar Block -->
                      <div style="width: 35%; background-color: ${customSidebarBgColor}; padding: 20px; border-right: 2px solid ${customBorderBlockColor}; box-sizing: border-box; display: flex; flex-direction: column; gap: 15px; color: ${isDarkTheme || tName === 'Professional Sidebar' ? '#cbd5e1' : '#334155'};">
                        ${tName === 'Professional Sidebar' && pageNum === 1 ? `
                          <div style="text-align: center; margin-bottom: 10px;">
                            ${photoHtml}
                          </div>
                          <div style="font-size: 11px; line-height: 1.6; border-bottom: 1px solid ${customBorderBlockColor}50; padding-bottom: 10px; margin-bottom: 5px;">
                            <div style="font-size: 12px; font-weight: bold; color: ${textSecondaryColor}; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">Contact</div>
                            ${!deletedFilters.includes('email') && email ? `<div style="margin-bottom: 4px;">📧 ${email}</div>` : ''}
                            ${!deletedFilters.includes('phone') && phone ? `<div style="margin-bottom: 4px;">📞 ${phone}</div>` : ''}
                            ${!deletedFilters.includes('address') && address ? `<div>📍 ${address}</div>` : ''}
                          </div>
                          <div style="font-size: 11px; line-height: 1.6; border-bottom: 1px solid ${customBorderBlockColor}50; padding-bottom: 10px; margin-bottom: 5px;">
                            <div style="font-size: 12px; font-weight: bold; color: ${textSecondaryColor}; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">Personal</div>
                            ${!deletedFilters.includes('nationality') ? `<div style="margin-bottom: 4px;">🗺️ ${draft.nationality || 'Nationality Unspecified'}</div>` : ''}
                            ${!deletedFilters.includes('dateOfBirth') ? `<div>📅 ${draft.dateOfBirth || 'DOB Unspecified'}</div>` : ''}
                          </div>
                        ` : ''}
                        ${sksMarkup}
                        ${lanMarkup}
                        ${socMarkup}
                        ${refMarkup}
                      </div>

                      <!-- Right Main Column details block -->
                      <div style="width: 65%; padding: 24px; background-color: ${customInnerCardBg}; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; color: ${customTextPrimaryColor};">
                        ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                          <div>
                            ${renderSectionHeader("Executive Profile", true)}
                            <p style="font-size: 12px; color: ${customTextMutedColor}; line-height: 1.6; text-align: justify; margin: 0; white-space: pre-wrap;">${summary}</p>
                          </div>
                        ` : ''}
                        ${expMarkup}
                        ${prjMarkup}
                        ${eduMarkup}
                        ${crtMarkup}
                        ${trnMarkup}
                        ${customAttributesMarkup}
                      </div>
                    </div>
                  `;
                } else if (tName === 'Sidebar Right Split') {
                  mainBodyHtml = `
                    <div style="display: flex; flex-direction: ${draft.textDirection === 'rtl' ? 'row-reverse' : 'row'};">
                      <!-- Left Main Column details block -->
                      <div style="width: 65%; padding: 24px; background-color: ${customInnerCardBg}; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; color: ${customTextPrimaryColor}; border-right: 2px solid ${customBorderBlockColor};">
                        ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                          <div>
                            ${renderSectionHeader("Executive Profile", true)}
                            <p style="font-size: 12px; color: ${customTextMutedColor}; line-height: 1.6; text-align: justify; margin: 0; white-space: pre-wrap;">${summary}</p>
                          </div>
                        ` : ''}
                        ${expMarkup}
                        ${prjMarkup}
                        ${eduMarkup}
                        ${crtMarkup}
                        ${trnMarkup}
                        ${customAttributesMarkup}
                      </div>

                      <!-- Right Sidebar Block -->
                      <div style="width: 35%; background-color: ${customSidebarBgColor}; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 15px; color: ${isDarkTheme ? '#cbd5e1' : '#334155'};">
                        ${sksMarkup}
                        ${lanMarkup}
                        ${socMarkup}
                        ${refMarkup}
                      </div>
                    </div>
                  `;
                } else if (tName === 'Newspaper Editorial') {
                  mainBodyHtml = `
                    <div style="display: flex; flex-direction: ${draft.textDirection === 'rtl' ? 'row-reverse' : 'row'}; gap: 20px; padding: 20px;">
                      <div style="width: 50%; display: flex; flex-direction: column; gap: 15px; border-right: 1px solid ${customBorderBlockColor}; padding-right: 15px; box-sizing: border-box;">
                        ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                          <div>
                            ${renderSectionHeader("Editorial Profile", true)}
                            <p style="font-size: 11.5px; color: ${customTextMutedColor}; line-height: 1.6; margin: 0; white-space: pre-wrap;">${summary}</p>
                          </div>
                        ` : ''}
                        ${expMarkup}
                        ${eduMarkup}
                      </div>
                      <div style="width: 50%; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
                        ${prjMarkup}
                        ${sksMarkup}
                        ${lanMarkup}
                        ${crtMarkup}
                        ${refMarkup}
                      </div>
                    </div>
                  `;
                } else if (tName === 'Centered Alignment') {
                  mainBodyHtml = `
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 15px; text-align: center; justify-content: center; align-items: center; width: 100%; box-sizing: border-box;">
                      ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                        <div style="max-width: 650px; margin: 0 auto;">
                          ${renderSectionHeader("Executive Profile", true)}
                          <p style="font-size: 12px; color: ${customTextMutedColor}; line-height: 1.6; text-align: center; margin: 0; white-space: pre-wrap;">${summary}</p>
                        </div>
                      ` : ''}
                      <div style="width: 100%; text-align: center;">
                        ${expMarkup}
                      </div>
                      <div style="width: 100%; text-align: center;">
                        ${prjMarkup}
                      </div>
                      <div style="width: 100%; text-align: center;">
                        ${eduMarkup}
                      </div>
                      <div style="width: 100%; text-align: center;">
                        ${sksMarkup}
                      </div>
                      <div style="width: 100%; text-align: center;">
                        ${lanMarkup}
                        ${refMarkup}
                      </div>
                    </div>
                  `;
                } else if (tName === 'Vertical Career Timeline') {
                  const timelineExpMarkup = expMarkup.replace(/<div style="margin-bottom: 4px;">/g, `
                    <div class="timeline-item" style="position: relative; margin-bottom: 15px; padding-left: 20px;">
                      <div class="timeline-circle" style="position: absolute; left: -25px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: ${accentHex}; border: 2px solid ${customInnerCardBg};"></div>
                  `);
                  mainBodyHtml = `
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
                      ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                        <div>
                          ${renderSectionHeader("Career Narrative", true)}
                          <p style="font-size: 12px; color: ${customTextMutedColor}; line-height: 1.6; margin: 0; white-space: pre-wrap;">${summary}</p>
                        </div>
                      ` : ''}
                      
                      <div style="position: relative;">
                        ${expMarkup ? `
                          <div style="position: absolute; left: 14px; top: 35px; bottom: 10px; width: 2px; background-color: ${accentHex}40;"></div>
                          <div style="padding-left: 10px;">
                            ${timelineExpMarkup}
                          </div>
                        ` : ''}
                      </div>

                      ${prjMarkup}
                      ${eduMarkup}
                      ${sksMarkup}
                      ${lanMarkup}
                      ${refMarkup}
                    </div>
                  `;
                } else if (tName === 'Grid Portfolio Cards') {
                  mainBodyHtml = `
                    <div style="padding: 24px; display: flex; flex-direction: column; gap: 15px; box-sizing: border-box;">
                      ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                        <div style="border: 1px solid ${customBorderBlockColor}; border-radius: 12px; padding: 15px; background: ${isDarkTheme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};">
                          ${renderSectionHeader("Executive Profile", true)}
                          <p style="font-size: 12px; color: ${customTextMutedColor}; line-height: 1.6; margin: 0; white-space: pre-wrap;">${summary}</p>
                        </div>
                      ` : ''}

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="border: 1px solid ${customBorderBlockColor}; border-radius: 12px; padding: 15px; box-sizing: border-box; background: ${isDarkTheme ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'};">
                          ${expMarkup}
                        </div>
                        <div style="border: 1px solid ${customBorderBlockColor}; border-radius: 12px; padding: 15px; box-sizing: border-box; background: ${isDarkTheme ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'};">
                          ${prjMarkup}
                          ${eduMarkup}
                        </div>
                      </div>

                      <div style="border: 1px solid ${customBorderBlockColor}; border-radius: 12px; padding: 15px; background: ${isDarkTheme ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'};">
                        ${sksMarkup}
                      </div>
                      ${lanMarkup}
                      ${refMarkup}
                    </div>
                  `;
                } else if (tName === 'Compact Dense Single Page') {
                  mainBodyHtml = `
                    <div style="padding: 15px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; box-sizing: border-box; line-height: 1.4;">
                      ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                        <div>
                          ${renderSectionHeader("Profile Summary", true)}
                          <p style="font-size: 11px; color: ${customTextMutedColor}; margin: 0; white-space: pre-wrap;">${summary}</p>
                        </div>
                      ` : ''}
                      ${expMarkup}
                      ${prjMarkup}
                      ${eduMarkup}
                      ${sksMarkup}
                      ${lanMarkup}
                      ${refMarkup}
                    </div>
                  `;
                } else {
                  // Standard single column
                  mainBodyHtml = `
                    <div style="padding: 24px; background-color: ${customInnerCardBg}; display: flex; flex-direction: column; gap: 15px; color: ${customTextPrimaryColor}; box-sizing: border-box;">
                      ${summary && pageNum === 1 && !deletedFilters.includes('summary') ? `
                        <div>
                          ${renderSectionHeader("Executive Profile", true)}
                          <p style="font-size: 12.5px; color: ${customTextMutedColor}; line-height: 1.6; text-align: justify; margin: 0; white-space: pre-wrap;">${summary}</p>
                        </div>
                      ` : ''}
                      ${expMarkup}
                      ${prjMarkup}
                      ${eduMarkup}
                      ${crtMarkup}
                      ${trnMarkup}

                      <div style="display: flex; gap: 20px; border-top: 1px solid ${customBorderBlockColor}; padding-top: 15px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px;">
                          ${sksMarkup}
                        </div>
                        ${customAttributesMarkup ? `
                          <div style="flex: 1; min-width: 250px;">
                            ${customAttributesMarkup}
                          </div>
                        ` : ''}
                      </div>
                      ${lanMarkup}
                      ${refMarkup}
                      ${socMarkup}
                    </div>
                  `;
                }
                return mainBodyHtml;
              })()}
            </div>

            <!-- EXPORT FOOTER -->
            <div style="background-color: ${sidebarBgColor}; padding: 14px; border-top: 2px solid ${borderBlockColor}; font-size: 11px; color: ${textMutedColor}; font-family: monospace; letter-spacing: 0.5px; text-align: center;">
              EXECUTIVE RESUME PRESENTATION • TEMPLATE LAYOUT: ${activeTemplate?.name || 'CUSTOM MASTERPIECE'} • PAGE ${pageNum}
            </div>

          </div>
        </div>
      `;
    }).join('');

    const clSenderNameValue = draft.clSenderName || fullName;
    const clSenderAddressValue = draft.clSenderAddress || address;
    const clEmailValue = draft.clEmail || email;
    const clPhoneValue = draft.clPhone || phone;
    const clDateValue = draft.clDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const clRecipientNameValue = draft.clRecipientName || 'Hiring Manager';
    const clCompanyNameValue = draft.clCompanyName || 'Target Company';
    const clPositionTitleValue = draft.clPositionTitle || 'Target Position';
    const clSubjectValue = draft.clSubject || `Re: Application for ${draft.clPositionTitle || title || 'Open Position'}`;
    const clGreetingValue = draft.clGreeting || 'Dear Hiring Manager';
    const clBodyValue = draft.clBody || draft.coverLetter || 'I am writing to express my strong interest in joining your team...';
    const clClosingValue = draft.clClosing || 'Sincerely';
    const clSignatureValue = draft.clSignature || fullName;

    const coverPageMarkup = (!deletedFilters.includes('coverLetter') && (draft.coverLetter || draft.clBody) && (selectedPageIds === undefined || selectedPageIds.includes('cover'))) ? `
      <!-- COVER LETTER SHEET -->
      <div class="page-break" style="width: 210mm; height: 296mm; min-height: 296mm; max-height: 296mm; box-sizing: border-box; background: ${linearGradient}; padding: 20px; overflow: hidden; position: relative;">
        <div style="background-color: ${innerCardBg}; border-radius: 16px; overflow: hidden; border: 1px solid ${borderBlockColor}; box-shadow: 0 10px 25px rgba(0,0,0,0.1); height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
          
          <div>
            <!-- COVER LETTER HEADER -->
            <div style="padding: 24px; border-bottom: 2px solid ${borderBlockColor};">
              <div style="display: flex; align-items: center;">
                ${photoHtml}
                <div style="flex: 1;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: ${textPrimaryColor}; text-shadow: none;">${fullName.toUpperCase()}</h1>
                  <div style="margin-top: 4px; font-size: 13px; font-weight: bold; color: ${textSecondaryColor}; letter-spacing: 1px; text-transform: uppercase;">${title}</div>
                  
                  <!-- Metadata bar -->
                  <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                    ${!deletedFilters.includes('nationality') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">🗺️ ${draft.nationality || 'Nationality Unspecified'}</span>` : ''}
                    ${!deletedFilters.includes('dateOfBirth') ? `<span style="background-color: ${tagBgColor}; color: ${tagTextColor}; padding: 4px 10px; font-size: 11px; border-radius: 6px; font-weight: bold; white-space: nowrap;">📅 ${draft.dateOfBirth || 'DOB Unspecified'}</span>` : ''}
                  </div>
                </div>
                
                <div style="font-size: 11.5px; color: ${textMutedColor}; line-height: 1.6; text-align: right; white-space: nowrap; margin-left: 20px;">
                  ${!deletedFilters.includes('email') && email ? `<div>📧 ${email}</div>` : ''}
                  ${!deletedFilters.includes('phone') && phone ? `<div style="margin-top: 2px;">📞 ${phone}</div>` : ''}
                  ${!deletedFilters.includes('address') && address ? `<div style="margin-top: 2px;">📍 ${address}</div>` : ''}
                </div>
              </div>
            </div>

            <!-- COVER LETTER BODY -->
            <div style="padding: 35px 45px; background-color: ${innerCardBg}; display: flex; flex-direction: column; gap: 14px; min-height: 200mm; box-sizing: border-box; color: ${textPrimaryColor}; font-family: sans-serif; font-size: 11.5px; line-height: 1.6;">
              <!-- Sender Info Block -->
              <div style="text-align: right; margin-bottom: 20px;">
                <strong style="font-size: 13px; color: ${textSecondaryColor}; font-weight: bold; display: block;">${clSenderNameValue}</strong>
                <span style="color: ${textMutedColor}; font-size: 11px; display: block;">${clSenderAddressValue}</span>
                <span style="color: ${textMutedColor}; font-size: 11px; display: block;">📧 ${clEmailValue} ${clPhoneValue ? `• 📞 ${clPhoneValue}` : ''}</span>
              </div>

              <!-- Date -->
              <div style="margin-bottom: 12px; color: ${textMutedColor}; font-weight: 500;">
                ${clDateValue}
              </div>

              <!-- Recipient block -->
              <div style="margin-bottom: 15px; line-height: 1.5;">
                <strong style="color: ${textPrimaryColor}; display: block;">${clRecipientNameValue}</strong>
                ${clPositionTitleValue ? `<span style="color: ${textMutedColor}; display: block;">${clPositionTitleValue}</span>` : ''}
                <strong style="color: ${textSecondaryColor}; display: block;">${clCompanyNameValue}</strong>
              </div>

              <!-- Subject -->
              <div style="font-weight: 800; font-size: 12px; border-bottom: 1px solid ${borderBlockColor}; padding-bottom: 4px; margin-bottom: 12px; color: ${textPrimaryColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                ${clSubjectValue}
              </div>

              <!-- Greeting -->
              <div style="margin-bottom: 10px; font-weight: 600;">
                ${clGreetingValue},
              </div>

              <!-- Body Paragraphs -->
              <div style="text-align: justify; white-space: pre-wrap; margin-bottom: 20px; color: ${textMutedColor}; line-height: 1.6; font-size: 11px;">
                ${clBodyValue}
              </div>

              <!-- Sign off -->
              <div style="margin-top: auto; line-height: 1.5;">
                <div style="margin-bottom: 25px;">${clClosingValue},</div>
                <strong style="color: ${textSecondaryColor}; font-size: 13px; font-weight: bold; display: block;">${clSignatureValue}</strong>
              </div>
            </div>
          </div>

          <!-- EXPORT FOOTER -->
          <div style="background-color: ${sidebarBgColor}; padding: 14px; border-top: 2px solid ${borderBlockColor}; font-size: 11px; color: ${textMutedColor}; font-family: monospace; letter-spacing: 0.5px; text-align: center;">
            EXECUTIVE COVER LETTER ATTACHMENT • GENTLY ARCHITECTED ON DIGITAL SMART SUITE
          </div>

        </div>
      </div>
    ` : '';

    let finalMarkup = '';
    if (scope === 'resume_only') {
      finalMarkup = resumePagesMarkup;
    } else if (scope === 'cover_only') {
      finalMarkup = coverPageMarkup || '<div style="padding: 50px; text-align:center;">Cover Letter is empty or deleted.</div>';
    } else {
      finalMarkup = coverPageMarkup + resumePagesMarkup;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fullName.toUpperCase()} — Premium Portfolio Export</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Georgia&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: system-ui, -apple-system, sans-serif; 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-break { 
              width: 210mm;
              height: 296mm;
              min-height: 296mm;
              max-height: 296mm;
              box-sizing: border-box;
              page-break-before: auto;
              page-break-after: auto;
              break-inside: avoid;
              page-break-inside: avoid;
              overflow: hidden;
              position: relative;
            }
            .page-break:last-child { 
              page-break-after: avoid; 
            }
          </style>
        </head>
        <body>
          ${finalMarkup}
        </body>
      </html>
    `;
  };

  // REUSABLE PDF BLOB GENERATION PROCESSOR
  const generatePdfBlob = async (pagesToExport?: string[], customScope?: 'resume_only' | 'cover_only' | 'full_suite'): Promise<Blob> => {
    if (!currentDraft) throw new Error("No active draft to export PDF");
    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
    return generatePdfExportBlob({
      currentDraft,
      targetScope: customScope || exportScope,
      activeTemplate,
      pagesToExport,
      buildFullExportHtml
    });
  };

  // PROGRAMMATIC EXPORT TO HIGH-FIDELITY PDF WITH HTML2PDF
  const handleExportPDF = async (pagesToExport?: string[]) => {
    if (!currentDraft) return;
    setIsExportingPDF(true);
    setPdfErrorMessage('');
    try {
      const blob = await generatePdfBlob(pagesToExport);
      const fullName = currentDraft.fullName || 'Siraj Ahmed';
      const fNameStr = fullName.replace(/\s+/g, '_');
      const filename = `${fNameStr}_Resume.pdf`;
      setPdfFileName(filename);
      setGeneratedPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setShowExportSuccessModal(true);
    } catch (error: any) {
      console.error("PDF generation failure: ", error);
      setPdfErrorMessage(error?.message || String(error));
      setShowExportErrorModal(true);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getActiveDocumentPages = (draft: any) => {
    if (!draft) return [];
    const deletedFilters = draft.deletedFields || [];
    const hasCoverLetter = !deletedFilters.includes('coverLetter') && (draft.coverLetter || draft.clBody);

    const activeTemplate = TEMPLATES.find(t => t.id === draft?.templateId) || TEMPLATES[10];
    const isSidebarLayout = activeTemplate && (
      activeTemplate.layout.toLowerCase().includes('sidebar') ||
      activeTemplate.layout.toLowerCase().includes('two column') ||
      activeTemplate.layout.toLowerCase().includes('rail') ||
      activeTemplate.layout.toLowerCase().includes('asymmetric') ||
      activeTemplate.layout.toLowerCase().includes('bespoke') ||
      activeTemplate.layout.toLowerCase().includes('dual')
    );

    const pagination = calculateResumePagination(draft, isSidebarLayout);
    const activePages: Array<{ id: string; type: 'cover' | 'resume'; pageNum?: number; title: string }> = [];

    if (hasCoverLetter) {
      activePages.push({ id: 'cover', type: 'cover', title: 'Cover Letter' });
    }

    for (let p = 1; p <= pagination.totalPages; p++) {
      activePages.push({ id: `page${p}`, type: 'resume', pageNum: p, title: `Resume - Page ${p}` });
    }

    return activePages;
  };

  const getSectionsOnPage = (pageNum: number) => {
    if (!currentDraft) return [];
    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
    const isSidebarLayout = activeTemplate && (
      activeTemplate.layout.toLowerCase().includes('sidebar') ||
      activeTemplate.layout.toLowerCase().includes('two column') ||
      activeTemplate.layout.toLowerCase().includes('rail') ||
      activeTemplate.layout.toLowerCase().includes('asymmetric') ||
      activeTemplate.layout.toLowerCase().includes('bespoke') ||
      activeTemplate.layout.toLowerCase().includes('dual')
    );
    const pagination = calculateResumePagination(currentDraft, isSidebarLayout);
    const pageData = pagination.pages[pageNum];
    if (!pageData) return [];
    
    const sections: string[] = [];
    if (pageData.summary) sections.push('Profile Summary');
    if (pageData.experiences && pageData.experiences.length > 0) sections.push('Work Experience');
    if (pageData.projects && pageData.projects.length > 0) sections.push('Projects');
    if (pageData.education && pageData.education.length > 0) sections.push('Education');
    if (pageData.skills && pageData.skills.length > 0) sections.push('Skills');
    if (pageData.certifications && pageData.certifications.length > 0) sections.push('Certifications');
    if (pageData.trainings && pageData.trainings.length > 0) sections.push('Training');
    if (pageData.languages && pageData.languages.length > 0) sections.push('Languages');
    if (pageData.references && pageData.references.length > 0) sections.push('References');
    if (pageData.socialLinks && pageData.socialLinks.length > 0) sections.push('Social Links');
    if (pageData.customFields && pageData.customFields.length > 0) sections.push('Core Attributes');
    return sections;
  };

  const handlePrintPage = async (pageItem: { id: string; type: 'cover' | 'resume'; pageNum?: number; title: string }) => {
    if (!currentDraft) return;
    setIsPrinting(true);
    try {
      const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
      let htmlContent = '';
      if (pageItem.type === 'cover') {
        htmlContent = buildFullExportHtml(currentDraft, 'cover_only', activeTemplate);
      } else {
        htmlContent = buildFullExportHtml(currentDraft, 'resume_only', activeTemplate, pageItem.pageNum);
      }
      
      const processedHtmlContent = replaceOklchColors(htmlContent);
      
      const printFrame = document.createElement('iframe');
      printFrame.name = "print_specific_frame";
      printFrame.style.position = 'absolute';
      printFrame.style.width = '0px';
      printFrame.style.height = '0px';
      printFrame.style.border = 'none';
      printFrame.style.left = '-10000px';
      printFrame.style.top = '-10000px';
      document.body.appendChild(printFrame);
      
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) throw new Error("Could not access iframe document");
      
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>\${currentDraft.fullName || 'Siraj Ahmed'} - \${pageItem.title}</title>
            <style>
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              body {
                margin: 0;
                padding: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background-color: #ffffff;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            \${processedHtmlContent}
          </body>
        </html>
      `);
      frameDoc.close();
      
      try {
        const images = Array.from(frameDoc.getElementsByTagName('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }));
      } catch (e) {
        console.warn("Failed to wait for images load:", e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
      
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      
      setTimeout(() => {
        try {
          if (printFrame.parentNode) {
            document.body.removeChild(printFrame);
          }
        } catch (e) {}
      }, 2000);
    } catch (err) {
      console.error("Print specific page error: ", err);
    } finally {
      setIsPrinting(false);
    }
  };

  const getCompiledPreviewHtml = () => {
    if (!currentDraft) return '';
    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
    const htmlContent = buildFullExportHtml(currentDraft, exportScope, activeTemplate, undefined, selectedExportPageIds.length > 0 ? selectedExportPageIds : undefined);
    return replaceOklchColors(htmlContent);
  };

  const handlePrintResume = async () => {
    if (!currentDraft) return;
    setIsPrinting(true);
    try {
      const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
      const fullName = currentDraft.fullName || "Siraj Ahmed";

      // 1. Generate multi-page, precise A4 styled HTML based on the active preview scope
      const htmlContent = buildFullExportHtml(currentDraft, exportScope, activeTemplate, undefined, selectedExportPageIds);
      const processedHtmlContent = replaceOklchColors(htmlContent);

      // 2. Setup iframe container for silent, clean background rendering & printing
      const printFrame = document.createElement("iframe");
      printFrame.name = "print_resume_frame";
      printFrame.style.position = "absolute";
      printFrame.style.width = "0px";
      printFrame.style.height = "0px";
      printFrame.style.border = "none";
      printFrame.style.left = "-10000px";
      printFrame.style.top = "-10000px";
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) throw new Error("Could not access iframe document");

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>\${fullName} - Print Preview</title>
            <style>
              @media print {
                @page {
                  size: A4 portrait !important;
                  margin: 0 !important;
                }
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                /* Professional page-breaking and containment rules (Requirement 12) */
                .page-break {
                  page-break-before: auto !important;
                  page-break-after: auto !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                  margin: 0 !important;
                  padding: 20px !important;
                  height: 296mm !important;
                  width: 210mm !important;
                  max-height: 296mm !important;
                  min-height: 296mm !important;
                  box-sizing: border-box !important;
                  overflow: hidden !important;
                  position: relative !important;
                  background-color: transparent !important;
                }
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                font-family: system-ui, -apple-system, sans-serif !important;
                background-color: #ffffff !important;
              }
              img {
                max-width: 100% !important;
                height: auto !important;
              }
            </style>
          </head>
          <body>
            \${processedHtmlContent}
          </body>
        </html>
      `);
      frameDoc.close();

      // Wait for image elements to load securely to prevent blank/incomplete avatars
      try {
        const images = Array.from(frameDoc.getElementsByTagName("img"));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }));
      } catch (e) {
        console.warn("Failed to wait for images loading in print iframe:", e);
      }

      // Small delay to allow style compilation & paint mechanics
      await new Promise<void>(resolve => setTimeout(resolve, 350));

      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      setTimeout(() => {
        try {
          if (printFrame.parentNode) {
            document.body.removeChild(printFrame);
          }
        } catch (e) {}
      }, 2000);

    } catch (error) {
      console.error("Print execution error: ", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPPTX = async () => {
    if (!currentDraft) return;
    const fullName = currentDraft.fullName || 'Siraj Ahmed';
    const email = currentDraft.email || 'siraj@example.com';
    const phone = currentDraft.phone || 'Unspecified';
    const address = currentDraft.address || 'Unspecified';
    const title = currentDraft.professionalTitle || 'Professional';
    const summary = currentDraft.summary || '';

    // Create a new presentation slide deck using standard pptxgenjs API
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_169'; // High-fidelity widescreen format

    // SLIDE 1: Title & Presentation Cover Slide (Branded Dark Slate Indigo)
    const slide1 = pptx.addSlide();
    slide1.background = { fill: '0f172a' };
    
    // Slide top banner light accent line
    slide1.addShape(pptx.ShapeType.rect, {
      fill: { color: '6366f1' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide1.addText(fullName.toUpperCase(), {
      x: 0.5,
      y: 1.8,
      w: 9.0,
      h: 0.8,
      fontSize: 38,
      bold: true,
      color: 'fbbf24',
      align: 'center',
      fontFace: 'Arial'
    });

    slide1.addText(title, {
      x: 0.5,
      y: 2.7,
      w: 9.0,
      h: 0.5,
      fontSize: 20,
      color: 'ffffff',
      align: 'center',
      fontFace: 'Arial'
    });

    // Elegant separator line
    slide1.addShape(pptx.ShapeType.line, {
      line: { color: '475569', width: 2 },
      x: 2.0,
      y: 3.5,
      w: 6.0,
      h: 0
    });

    slide1.addText(`✉️ ${email}    |    📞 ${phone}    |    📍 ${address}`, {
      x: 0.5,
      y: 3.8,
      w: 9.0,
      h: 0.5,
      fontSize: 12,
      color: 'cbd5e1',
      align: 'center',
      fontFace: 'Arial'
    });

    slide1.addText(`PRODUCED WITH PREMIUM SMART RESUME BUILDER ENGINE • PAGE 1`, {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '64748b',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 2: Professional Profile & General Stats (Vibrant Purple Indigo)
    const slide2 = pptx.addSlide();
    slide2.background = { fill: '1e1b4b' };
    
    slide2.addShape(pptx.ShapeType.rect, {
      fill: { color: 'fbbf24' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide2.addText('EXECUTIVE SUMMARY & BIOMETRICS', {
      x: 0.6,
      y: 0.5,
      w: 8.8,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    slide2.addText(summary || 'Dynamic, goal-oriented professional with specialized experience in delivering industry-leading application solutions, modern responsive layouts, and robust system automation.', {
      x: 0.6,
      y: 1.2,
      w: 8.8,
      h: 1.8,
      fontSize: 14,
      color: 'f1f5f9',
      fontFace: 'Arial',
      align: 'left'
    });

    // Demographics and Meta Data
    const dY = 3.2;
    slide2.addText('PERSONAL DATA METADATA:', {
      x: 0.6,
      y: dY,
      w: 8.8,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: 'a5b4fc',
      fontFace: 'Courier New'
    });

    const lStyle = { fontSize: 11, bold: true, color: 'fbbf24', fontFace: 'Arial' };
    const vStyle = { fontSize: 11, color: 'ffffff', fontFace: 'Arial' };

    slide2.addText('Nationality:', { x: 0.6, y: dY + 0.4, w: 2.0, h: 0.3, ...lStyle });
    slide2.addText(currentDraft.nationality || 'Unspecified', { x: 2.2, y: dY + 0.4, w: 2.5, h: 0.3, ...vStyle });

    slide2.addText('Gender:', { x: 5.2, y: dY + 0.4, w: 1.8, h: 0.3, ...lStyle });
    slide2.addText(currentDraft.gender || 'Unspecified', { x: 6.8, y: dY + 0.4, w: 2.5, h: 0.3, ...vStyle });

    slide2.addText('Marital Status:', { x: 0.6, y: dY + 0.8, w: 2.0, h: 0.3, ...lStyle });
    slide2.addText(currentDraft.maritalStatus || 'Unspecified', { x: 2.2, y: dY + 0.8, w: 2.5, h: 0.3, ...vStyle });

    slide2.addText('Date of Birth:', { x: 5.2, y: dY + 0.8, w: 1.8, h: 0.3, ...lStyle });
    slide2.addText(currentDraft.dateOfBirth || 'Unspecified', { x: 6.8, y: dY + 0.8, w: 2.5, h: 0.3, ...vStyle });

    slide2.addText(`PROFESSIONAL RESUME PRESENTATION • PAGE 2`, {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '818cf8',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 3: Work Experiences Slides (Deep Blue Navy Theme)
    if (currentDraft.experiences && currentDraft.experiences.length > 0) {
      const slide3 = pptx.addSlide();
      slide3.background = { fill: '0b1329' };
      
      slide3.addShape(pptx.ShapeType.rect, {
        fill: { color: '3b82f6' },
        x: 0,
        y: 0,
        w: 10.0,
        h: 0.15
      });

      slide3.addText('PROFESSIONAL WORK PORTFOLIO', {
        x: 0.6,
        y: 0.4,
        w: 8.8,
        h: 0.5,
        fontSize: 22,
        bold: true,
        color: 'fbbf24',
        fontFace: 'Arial'
      });

      let experienceY = 1.0;
      currentDraft.experiences.slice(0, 3).forEach((exp, idx) => {
        // Experience Item Box Header
        slide3.addText(`💼   ${exp.position}   •   ${exp.company}`, {
          x: 0.6,
          y: experienceY,
          w: 8.8,
          h: 0.3,
          fontSize: 13,
          bold: true,
          color: 'ffffff',
          fontFace: 'Arial'
        });

        slide3.addText(exp.duration, {
          x: 0.6,
          y: experienceY + 0.25,
          w: 8.8,
          h: 0.25,
          fontSize: 10,
          italic: true,
          color: '94a3b8',
          fontFace: 'Arial'
        });

        slide3.addText(exp.details || 'No experience summary details provided.', {
          x: 0.6,
          y: experienceY + 0.5,
          w: 8.8,
          h: 0.6,
          fontSize: 10.5,
          color: 'cbd5e1',
          fontFace: 'Arial'
        });

        experienceY += 1.35;
      });

      slide3.addText(`PROFESSIONAL RESUME PRESENTATION • PAGE 3`, {
        x: 0.5,
        y: 5.1,
        w: 9.0,
        h: 0.3,
        fontSize: 9,
        color: '60a5fa',
        align: 'center',
        fontFace: 'Courier New'
      });
    }


    // SLIDE 4: Core Competencies and Education Assets (Deep Space Black)
    const slide4 = pptx.addSlide();
    slide4.background = { fill: '020617' };
    
    slide4.addShape(pptx.ShapeType.rect, {
      fill: { color: 'ec4899' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide4.addText('COMPETENCY MATRIX & CREDENTIALS', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    // Column A: Key Skills list
    if (currentDraft.skills && currentDraft.skills.length > 0) {
      slide4.addText('CORE COMPETENCIES & SKILLS:', {
        x: 0.6,
        y: 1.1,
        w: 4.2,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: 'f472b6',
        fontFace: 'Courier New'
      });

      let skillY = 1.5;
      currentDraft.skills.slice(0, 8).forEach((skill) => {
        slide4.addText(`⚡  ${skill}`, {
          x: 0.6,
          y: skillY,
          w: 4.2,
          h: 0.3,
          fontSize: 11.5,
          color: 'ffffff',
          fontFace: 'Arial'
        });
        skillY += 0.39;
      });
    } else {
      slide4.addText('Skills metadata is blank.', {
        x: 0.6,
        y: 1.5,
        w: 4.2,
        h: 0.4,
        fontSize: 12,
        color: '64748b',
        fontFace: 'Arial'
      });
    }

    // Column B: Education & Professional Credentials Info
    if (currentDraft.education && currentDraft.education.length > 0) {
      slide4.addText('EDUCATION & CREDENTIALLING:', {
        x: 5.2,
        y: 1.1,
        w: 4.2,
        h: 0.3,
        fontSize: 12,
        bold: true,
        color: 'fbbf24',
        fontFace: 'Courier New'
      });

      let eduY = 1.5;
      currentDraft.education.slice(0, 3).forEach((edu) => {
        slide4.addText(edu.degree, {
          x: 5.2,
          y: eduY,
          w: 4.2,
          h: 0.3,
          fontSize: 12,
          bold: true,
          color: 'ffffff',
          fontFace: 'Arial'
        });

        slide4.addText(`${edu.school} (${edu.duration})`, {
          x: 5.2,
          y: eduY + 0.3,
          w: 4.2,
          h: 0.4,
          fontSize: 11,
          color: 'cbd5e1',
          fontFace: 'Arial'
        });

        eduY += 0.95;
      });
    } else {
      slide4.addText('Education details not listed.', {
        x: 5.2,
        y: 1.5,
        w: 4.2,
        h: 0.4,
        fontSize: 12,
        color: '64748b',
        fontFace: 'Arial'
      });
    }

    slide4.addText(`PROFESSIONAL RESUME PRESENTATION • PAGE 4`, {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: 'f472b6',
      align: 'center',
      fontFace: 'Courier New'
    });

    // Write & Trigger instant safe download of MS PowerPoint presentation deck
    pptx.writeFile({ fileName: `${fullName.replace(/\s+/g, '_')}_Portfolio_Slides.pptx` });
  };

  const handleDownloadFeaturesPPTX = async () => {
    // Create a new presentation slide deck for the app features presentation using standard pptxgenjs API
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_169'; // High-fidelity widescreen format

    // TITLE SLIDE
    const slide1 = pptx.addSlide();
    slide1.background = { fill: '0f172a' };
    
    // Top colored banner accent line
    slide1.addShape(pptx.ShapeType.rect, {
      fill: { color: '6366f1' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide1.addText('SIRAJ RESUME BUILDER PRO', {
      x: 0.5,
      y: 1.8,
      w: 9.0,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: 'fbbf24',
      align: 'center',
      fontFace: 'Arial'
    });

    slide1.addText('Complete Suite Features Overview', {
      x: 0.5,
      y: 2.7,
      w: 9.0,
      h: 0.5,
      fontSize: 20,
      color: 'ffffff',
      align: 'center',
      fontFace: 'Arial'
    });

    // Elegant separator line
    slide1.addShape(pptx.ShapeType.line, {
      line: { color: '475569', width: 2 },
      x: 2.0,
      y: 3.5,
      w: 6.0,
      h: 0
    });

    slide1.addText('Interactive High-Fidelity Professional Document Design Workspace', {
      x: 0.5,
      y: 3.8,
      w: 9.0,
      h: 0.5,
      fontSize: 13,
      color: 'cbd5e1',
      align: 'center',
      fontFace: 'Arial'
    });

    slide1.addText('VERSION 1.0.0 • SYSTEM FEATURE REVIEW', {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '64748b',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 2: MULTI-PAGE DESIGNS & THEMES
    const slide2 = pptx.addSlide();
    slide2.background = { fill: '1e1b4b' };
    
    slide2.addShape(pptx.ShapeType.rect, {
      fill: { color: 'fbbf24' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide2.addText('01 / MULTI-PAGE LAYOUTS & REACTIVE THEMES', {
      x: 0.6,
      y: 0.5,
      w: 8.8,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    slide2.addText('Our architecture is designed with advanced layout responsiveness and aesthetic theme control:', {
      x: 0.6,
      y: 1.2,
      w: 8.8,
      h: 0.8,
      fontSize: 14,
      color: 'f1f5f9',
      fontFace: 'Arial'
    });

    slide2.addText('• LUXURY TEMPLATES: Explore an extensive array of layout designs tailored for a variety of roles.\n\n• SYSTEM STYLESYNC: Transition on-the-fly with predesigned meshes, warm retro modes, or minimalistic presets.\n\n• ACTIVE METADATA FIELDS: Configure demographics, biometrics, languages, and custom portfolios easily.\n\n• FULL RESPONSIVENESS: Clean and beautiful viewports across desktop, tablet, and mobile platforms.', {
      x: 0.8,
      y: 2.0,
      w: 8.4,
      h: 2.8,
      fontSize: 12,
      color: 'ffffff',
      fontFace: 'Arial',
      lineSpacing: 18
    });

    slide2.addText('SIRAJ RESUME BUILDER PRO • SLIDE 2', {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '818cf8',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 3: HIGH-FIDELITY EXPORTS
    const slide3 = pptx.addSlide();
    slide3.background = { fill: '0b1329' };
    
    slide3.addShape(pptx.ShapeType.rect, {
      fill: { color: '3b82f6' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide3.addText('02 / HIGH-FIDELITY DOCUMENT EXPORTS', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    slide3.addText('Generate pristine outputs with standard document compile configurations:', {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.6,
      fontSize: 14,
      color: 'cbd5e1',
      fontFace: 'Arial'
    });

    slide3.addText('• PERFECT MS WORD (.docx): High-fidelity, clean parser exports structured tables and paragraphs without unreadable characters.\n\n• VECTOR PRINT LAYOUTS: Full integration with browser-native printing engines matching exact A4 dimensions.\n\n• MULTIPAGE SCOPE MANAGEMENT: Choose whether to print cover letters, single resumes, or the entire profile compilation.\n\n• NO COMPRESSION LOSS: Export files containing beautiful structures ready for ATS evaluation.', {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 3.0,
      fontSize: 12,
      color: 'ffffff',
      fontFace: 'Arial',
      lineSpacing: 18
    });

    slide3.addText('SIRAJ RESUME BUILDER PRO • SLIDE 3', {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '60a5fa',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 4: AUTO-SAVE & SECURITY
    const slide4 = pptx.addSlide();
    slide4.background = { fill: '020617' };
    
    slide4.addShape(pptx.ShapeType.rect, {
      fill: { color: 'ec4899' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide4.addText('03 / CONTINUOUS AUTOSAVE & OFFLINE CORES', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    slide4.addText('Security and persistence designed directly for offline-first protection:', {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.6,
      fontSize: 14,
      color: 'e2e8f0',
      fontFace: 'Arial'
    });

    slide4.addText('• ACTIVE LOCALSTORAGE BACKUP: Continuous draft status tracking automatically saves every keystroke on your device.\n\n• MULTIPLE DRAFT MANAGEMENT: Preserve several candidate variations in a single click.\n\n• ZERO SERVER PIPELINES: Keep sensitive biometrics, addresses, and history protected; no drafts leak to tracking servers.\n\n• ROBUST RETRIEVAL CORE: Restore and pick up drafting progress right where you left off via the Autosaved CV archive container.', {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 3.0,
      fontSize: 12,
      color: 'ffffff',
      fontFace: 'Arial',
      lineSpacing: 18
    });

    slide4.addText('SIRAJ RESUME BUILDER PRO • SLIDE 4', {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: 'f472b6',
      align: 'center',
      fontFace: 'Courier New'
    });


    // SLIDE 5: DYNAMIC SLIDE EXPORTER
    const slide5 = pptx.addSlide();
    slide5.background = { fill: '090d16' };
    
    slide5.addShape(pptx.ShapeType.rect, {
      fill: { color: '10b981' },
      x: 0,
      y: 0,
      w: 10.0,
      h: 0.15
    });

    slide5.addText('04 / BUILT-IN PROFILE SLIDE EXPORTER', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: 'fbbf24',
      fontFace: 'Arial'
    });

    slide5.addText('Present yourself beyond paper with high-impact slideshow portfolios:', {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.6,
      fontSize: 14,
      color: 'd1fae5',
      fontFace: 'Arial'
    });

    slide5.addText('• EXECUTIVE INTERACTIVE WORK: Seamless compilation of experiences, metrics, and profiles into standard .pptx files.\n\n• READY FOR WIDESCREEN PRESENTATION: Built in 16:9 widescreen format, compatible with Microsoft PowerPoint and Google Slides.\n\n• INTERVIEW PROVEN TECHNIQUE: Bring fully animated dynamic outlines of accomplishments to your discussions.\n\n• ONE-CLICK COMPILE: Transform your candidate data draft into visual outlines instantly and confidently.', {
      x: 0.8,
      y: 1.8,
      w: 8.4,
      h: 3.0,
      fontSize: 12,
      color: 'ffffff',
      fontFace: 'Arial',
      lineSpacing: 18
    });

    slide5.addText('SIRAJ RESUME BUILDER PRO • SLIDE 5', {
      x: 0.5,
      y: 5.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: '10b981',
      align: 'center',
      fontFace: 'Courier New'
    });

    // Write file
    pptx.writeFile({ fileName: 'Siraj_Resume_Builder_App_Features.pptx' });
  };

  // FORMATTED EMAIL BODY GENERATOR
  const buildFormattedEmailBody = (draft: any, cover: string) => {
    const fullName = draft?.fullName || 'Professional Candidate';
    const title = draft?.professionalTitle || '';
    const emailStr = draft?.email || '';
    const phoneStr = draft?.phone || '';
    const addressStr = draft?.address || '';
    
    let text = '';
    if (cover) {
      text += `${cover}\n\n`;
      text += `=========================================\n\n`;
    }
    
    text += `RESUME PROFILE: ${fullName.toUpperCase()}\n`;
    if (title) text += `ROLE: ${title.toUpperCase()}\n`;
    text += `-----------------------------------------\n\n`;
    
    text += `CONTACT INFORMATION\n`;
    if (emailStr) text += `- Email: ${emailStr}\n`;
    if (phoneStr) text += `- Phone: ${phoneStr}\n`;
    if (addressStr) text += `- Address: ${addressStr}\n`;
    text += `- Nationality: ${draft?.nationality || 'Single Nationality'}\n`;
    text += `- Gender: ${draft?.gender || 'Unspecified'}\n`;
    text += `- Marital Status: ${draft?.maritalStatus || 'Single'}\n`;
    if (draft?.dateOfBirth) text += `- Date of Birth: ${draft?.dateOfBirth}\n`;
    text += `\n`;

    if (draft?.summary) {
      text += `EXECUTIVE PROFESSIONAL SUMMARY\n`;
      text += `${draft.summary}\n\n`;
    }

    if (draft?.experiences && draft?.experiences.length > 0) {
      text += `PROFESSIONAL WORK HISTORY & EXPERIENCE\n`;
      draft.experiences.forEach((exp: any, i: number) => {
        text += `${i+1}. ${exp.position} at ${exp.company}\n`;
        text += `   Duration: ${exp.duration}\n`;
        text += `   Responsibility: ${exp.details || 'N/A'}\n\n`;
      });
    }

    if (draft?.education && draft?.education.length > 0) {
      text += `EDUCATION & CREDENTIALS\n`;
      draft.education.forEach((edu: any, i: number) => {
        text += `- ${edu.degree} | ${edu.school} (${edu.duration})\n`;
      });
      text += `\n`;
    }

    if (draft?.skills && draft?.skills.length > 0) {
      text += `CORE SCIENTIFIC & TECHNICAL SKILLS\n`;
      text += `${draft.skills.join(', ')}\n\n`;
    }

    text += `-----------------------------------------\n`;
    text += `Prepared using the Premium Resume Presentation & Builder Application.\n`;
    return text;
  };

  const [copiedEmailStatus, setCopiedEmailStatus] = useState(false);

  const handleCopyEmailToClipboard = () => {
    if (!currentDraft) return;
    const plainTextBody = buildFormattedEmailBody(currentDraft, emailMessage);
    navigator.clipboard.writeText(plainTextBody);
    setCopiedEmailStatus(true);
    setTimeout(() => setCopiedEmailStatus(false), 2000);
  };

  const handleSendViaMailto = () => {
    if (!currentDraft || !recipientEmail) return;
    const bodyText = buildFormattedEmailBody(currentDraft, emailMessage);
    const subject = `Resume Portfolio & Professional Application — ${currentDraft.fullName || 'Candidate'}`;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
    setEmailSendStatus('success');
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSendStatus('idle');
      setRecipientEmail('');
      setEmailMessage('');
    }, 2000);
  };

  // SEND RESUME EMAIL TRANSMITTER FLOW (Server API with multi-document attachment build)
  const handleSendResumeEmail = async () => {
    setEmailSendError('');
    if (!currentDraft) {
      setEmailSendError('No active resume draft found.');
      setEmailSendStatus('error');
      return;
    }

    const trimmedEmail = recipientEmail.trim();
    if (!trimmedEmail) {
      setEmailSendError('Recipient email address is required.');
      setEmailSendStatus('error');
      return;
    }

    // Basic RFC 5322 Email Validation Pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmedEmail)) {
      setEmailSendError('Please provide a valid email address.');
      setEmailSendStatus('error');
      return;
    }

    setEmailSendStatus('sending');
    try {
      const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
      const { generateDocxBlob } = await import('@/lib/docx-generator');
      
      // Filename slug formatting: Firstname_Lastname
      const getFilenameSlug = (nameStr: string) => {
        const clean = nameStr.replace(/[^\w\s-]/g, '').trim();
        const parts = clean.split(/\s+/);
        if (parts.length >= 2) {
          return `${parts[0]}_${parts.slice(1).join('_')}`;
        } else if (parts.length === 1 && parts[0]) {
          return `${parts[0]}_Lastname`;
        }
        return 'Firstname_Lastname';
      };

      const nameSlug = getFilenameSlug(currentDraft.fullName || 'Siraj Ahmed');

      // Helper to convert blob to clean, uncorrupted base64 payload
      const blobToBase64 = (b: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result as string;
            if (res && res.includes(',')) {
              resolve(res.split(',')[1]);
            } else {
              resolve('');
            }
          };
          reader.onerror = () => reject(new Error("Failed converting binary blob asset."));
          reader.readAsDataURL(b);
        });
      };

      // 1. Check active cover letter presence
      const deletedFields = currentDraft.deletedFields || [];
      const hasCoverLetter = !deletedFields.includes('coverLetter') && !!(currentDraft.coverLetter || currentDraft.clBody);

      // 2. Generate Resume Files
      const resumePdfBlob = await generatePdfBlob(undefined, 'resume_only');
      if (!resumePdfBlob || resumePdfBlob.size < 100) {
        throw new Error("Resume PDF generation returned incomplete or blank payload.");
      }
      const resumePdfBase64 = await blobToBase64(resumePdfBlob);

      const resumeDocxBlob = await generateDocxBlob(currentDraft, activeTemplate, 'resume_only');
      if (!resumeDocxBlob || resumeDocxBlob.size < 100) {
        throw new Error("Resume DOCX generation returned incomplete or blank payload.");
      }
      const resumeDocxBase64 = await blobToBase64(resumeDocxBlob);

      // Prep attachment collection
      const attachments = [
        {
          filename: `${nameSlug}_Resume.pdf`,
          content: resumePdfBase64,
          contentType: 'application/pdf'
        },
        {
          filename: `${nameSlug}_Resume.docx`,
          content: resumeDocxBase64,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ];

      // 3. Conditionally build Cover Letter Files
      if (hasCoverLetter) {
        const clPdfBlob = await generatePdfBlob(undefined, 'cover_only');
        if (clPdfBlob && clPdfBlob.size > 100) {
          const clPdfBase64 = await blobToBase64(clPdfBlob);
          attachments.push({
            filename: `${nameSlug}_CoverLetter.pdf`,
            content: clPdfBase64,
            contentType: 'application/pdf'
          });
        }

        const clDocxBlob = await generateDocxBlob(currentDraft, activeTemplate, 'cover_only');
        if (clDocxBlob && clDocxBlob.size > 100) {
          const clDocxBase64 = await blobToBase64(clDocxBlob);
          attachments.push({
            filename: `${nameSlug}_CoverLetter.docx`,
            content: clDocxBase64,
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });
        }
      }

      // Default customized email body requested by user
      const defaultEmailSubject = 'Your Resume Documents';
      const defaultEmailBody = `Dear User,\n\nPlease find attached your generated resume and cover letter files.\n\nThank you for using Resume Builder.`;

      // 4. Intercept for Offline Queueing if network is unavailable
      if (!isOnline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        console.log('[PWA Queue] Device is offline. Queueing email for automatic back-online dispatch.');
        
        const offlineEmailItem: OfflineEmail = {
          id: 'mail_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          recipientEmail: trimmedEmail,
          subject: defaultEmailSubject,
          messageText: emailMessage.trim() || defaultEmailBody,
          smtpHost: smtpHostOverride.trim(),
          smtpPort: smtpPortOverride.trim(),
          smtpUser: smtpUserOverride.trim(),
          smtpPass: smtpPassOverride.trim(),
          pdfBlob: JSON.stringify(attachments),
          resumeTitle: currentDraft.fullName || 'Candidate',
          timestamp: Date.now()
        };

        await queueOfflineEmail(offlineEmailItem);
        
        // Update queue badge count
        const updatedQueued = await getQueuedEmails();
        setQueuedEmailsCount(updatedQueued.length);
        
        setEmailSendStatus('success');
        setEmailSendError('Offline mode: Email safely queued on your device! It will auto-transmit immediately when connection returns.');
        
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSendStatus('idle');
          setRecipientEmail('');
          setEmailMessage('');
          setEmailSendError('');
        }, 4000);
        return;
      }

      // 5. Dispatch JSON payload to secure API route
      const response = await fetch('/api/send-resume-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          subject: defaultEmailSubject,
          message: emailMessage.trim() || defaultEmailBody,
          attachmentsList: attachments,
          resumeDetails: {
            fullName: currentDraft.fullName || 'Candidate',
            professionalTitle: currentDraft.professionalTitle || 'Professional',
            email: currentDraft.email || '',
            phone: currentDraft.phone || ''
          },
          smtpHostOverride: smtpHostOverride.trim(),
          smtpPortOverride: smtpPortOverride.trim(),
          smtpUserOverride: smtpUserOverride.trim(),
          smtpPassOverride: smtpPassOverride.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEmailSendStatus('success');
        // Clear recipient and text inputs upon completion
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSendStatus('idle');
          setRecipientEmail('');
          setEmailMessage('');
          setEmailSendError('');
        }, 3000);
      } else {
        const errorMsg = data.error || 'Server rejected SMTP transmission. Please check port details.';
        setEmailSendError(errorMsg);
        setEmailSendStatus('error');
      }
    } catch (err: any) {
      console.error("MIME email transmit failure:", err);
      setEmailSendError(err?.message || "An unexpected error occurred during client file compilation.");
      setEmailSendStatus('error');
    }
  };

  // INITIATOR OF BLANK SLATE RESUME
  const startNewBlankResume = () => {
    const newBlank: ResumeDraft = {
      id: 'draft_' + Date.now(),
      title: 'Untitled Blank Resume',
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      profilePhoto: '',
      nationality: 'Single Nationality',
      dateOfBirth: '',
      gender: '',
      maritalStatus: 'Single',
      customFields: [],
      deletedFields: [],
      experiences: [],
      education: [],
      skills: [],
      trainings: [],
      coverLetter: '',
      lastSaved: new Date().toISOString().split('T')[0]
    };
    setCurrentDraft(newBlank);
    saveCurrentDraftToLocalStorage(newBlank);
    setView('blank_builder');
  };

  // HANDLERS FOR MODIFYING INPUTS IN BUILDER
  const updateDraftMeta = (key: keyof ResumeDraft, value: any) => {
    if (!currentDraft) return;
    const updated = { ...currentDraft, [key]: value, lastSaved: new Date().toISOString().split('T')[0] };
    setCurrentDraft(updated);
    saveCurrentDraftToLocalStorage(updated);
  };

  const activePages = currentDraft ? getActiveDocumentPages(currentDraft) : [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#02040a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,254,0.15),rgba(255,0,128,0.05),transparent)] transition-all duration-700 font-sans p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center relative overflow-x-hidden">
        <div className="text-center font-mono text-xs text-cyan-400 tracking-widest animate-pulse">
          INITIALIZING RECONSTRUCTED WORKSPACE...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isWindows95 ? 'theme-windows-95' : ''} ${isDarkMode ? activeTheme.bgClass : 'bg-[#f1f5f9] bg-[#f1f5f9] bg-gradient-to-tr from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0]'} transition-all duration-700 font-sans p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center relative overflow-x-hidden`}>
      
      {/* PWA & CONNECTIVITY FLOATING STATUS BANNERS */}
      <AnimatePresence>
        {!isOnline && notificationsEnabled && (
          <motion.div
            key="offline-banner"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4.5 py-2.5 rounded-full shadow-2xl bg-amber-500 text-slate-950 font-bold text-xs border border-amber-400"
          >
            <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Device offline. Resumes saved safely in IndexedDB</span>
          </motion.div>
        )}
        {isSyncing && notificationsEnabled && (
          <motion.div
            key="sync-banner"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4.5 py-2.5 rounded-full shadow-2xl bg-emerald-600 text-white font-bold text-xs border border-emerald-500"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connection restored! Syncing queued emails...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA CUSTOM INSTALL FLOATING CARD */}
      <AnimatePresence>
        {isInstallable && notificationsEnabled && (
          <motion.div
            key="install-banner"
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            className={`fixed bottom-6 right-6 z-[999] p-4.5 rounded-2xl border shadow-2xl flex flex-col gap-3 max-w-sm ${
              isDarkMode 
                ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md' 
                : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-slate-200/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wide">Install CV Builder</h4>
                <p className={`text-xs mt-0.5 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Get complete offline support, instant launching, and secure local IndexedDB storage.
                </p>
              </div>
              <button 
                onClick={() => setIsInstallable(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
              </button>
            </div>
            
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>INSTALL DESKTOP / MOBILE APP</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THEME BACKGROUND DECORATIONS BY CUSTOM CHOREOGRAPHY */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          {/* Cyber AI Quantum Terminal background */}
          {activeThemeId === 'cyber-ai' && (
            <>
              {/* Futuristic grid pattern overlay */}
              <div 
                className="absolute inset-0 opacity-85"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 242, 254, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 242, 254, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '45px 45px'
                }}
              />
              <div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,4,10,0.92)_95%)]"
              />
              {/* Animating Holographic Quantum Blobs */}
              <motion.div
                animate={{
                  x: [0, 50, -40, 0],
                  y: [0, -70, 60, 0],
                  scale: [1, 1.25, 0.85, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 20,
                  ease: "easeInOut"
                }}
                className="absolute top-10 left-[10%] w-[32rem] h-[32rem] rounded-full bg-cyan-400/8 blur-[130px]"
              />
              <motion.div
                animate={{
                  x: [0, -60, 40, 0],
                  y: [0, 80, -50, 0],
                  scale: [1, 0.9, 1.2, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 24,
                  ease: "easeInOut"
                }}
                className="absolute bottom-10 right-[10%] w-[35rem] h-[35rem] rounded-full bg-pink-500/8 blur-[150px]"
              />
              <motion.div
                animate={{
                  x: [0, 30, -35, 0],
                  y: [0, 40, 60, 0],
                  scale: [1, 1.15, 0.95, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: "easeInOut"
                }}
                className="absolute top-1/3 left-1/4 w-[24rem] h-[24rem] rounded-full bg-indigo-500/8 blur-[100px]"
              />
              
              {/* Glowing horizontal digital scan lines */}
              <div className="absolute top-[15%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent shadow-[0_0_10px_rgba(0,242,254,0.4)] animate-pulse" style={{ animationDuration: '3.5s' }} />
              <div className="absolute bottom-[25%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/35 to-transparent shadow-[0_0_10px_rgba(236,72,153,0.4)] animate-pulse" style={{ animationDuration: '4.5s' }} />

              {/* Digital framing ticks */}
              <div className="absolute top-12 left-12 w-20 h-20 border-t border-l border-cyan-400/35 pointer-events-none" />
              <div className="absolute top-12 right-12 w-20 h-20 border-t border-r border-pink-500/35 pointer-events-none" />
              <div className="absolute bottom-12 left-12 w-20 h-20 border-b border-l border-pink-500/35 pointer-events-none" />
              <div className="absolute bottom-12 right-12 w-20 h-20 border-b border-r border-cyan-400/35 pointer-events-none" />
            </>
          )}

          {/* Apple Vision Pro Spatial OS */}
          {activeThemeId === 'apple-vision-pro' && (
            <>
              <motion.div
                animate={{
                  x: [0, 30, -30, 0],
                  y: [0, -50, 50, 0],
                  scale: [1, 1.15, 0.9, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 25,
                  ease: "easeInOut"
                }}
                className="absolute top-1/4 left-[5%] w-72 h-72 bg-white/10 rounded-full blur-[140px]"
              />
              <motion.div
                animate={{
                  x: [0, -40, 40, 0],
                  y: [0, 60, -60, 0],
                  scale: [1, 0.9, 1.1, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 30,
                  ease: "easeInOut"
                }}
                className="absolute bottom-1/3 right-[5%] w-80 h-80 bg-slate-300/10 rounded-full blur-[160px]"
              />
              <motion.div
                animate={{
                  y: [0, -30, 30, 0],
                  scale: [1, 1.05, 0.95, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 20,
                  ease: "easeInOut"
                }}
                className="absolute top-[18%] right-[18%] w-56 h-56 rounded-full bg-white/5 blur-[100px]"
              />
              {/* Fine horizon light dividers */}
              <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute bottom-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </>
          )}

          {/* Neon Glass Pro */}
          {activeThemeId === 'neon-glass-pro' && (
            <>
              <motion.div
                animate={{
                  x: [0, 40, -20, 0],
                  y: [0, -60, 40, 0],
                  scale: [1, 1.2, 0.9, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 16,
                  ease: "easeInOut"
                }}
                className="absolute top-10 left-10 w-[35rem] h-[35rem] rounded-full bg-purple-600/10 blur-[130px]"
              />
              <motion.div
                animate={{
                  x: [0, -50, 30, 0],
                  y: [0, 80, -40, 0],
                  scale: [1, 0.85, 1.15, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 20,
                  ease: "easeInOut"
                }}
                className="absolute bottom-10 right-10 w-[40rem] h-[40rem] rounded-full bg-cyan-500/10 blur-[150px]"
              />
              <motion.div
                animate={{
                  x: [0, 30, -40, 0],
                  y: [0, 40, 60, 0],
                  scale: [1, 1.1, 0.95, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/3 w-[25rem] h-[25rem] rounded-full bg-blue-600/8 blur-[100px]"
              />
              <div className="absolute top-4 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
              <div className="absolute bottom-4 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </>
          )}

          {/* Ferrari Red Gold */}
          {activeThemeId === 'ferrari-red-gold' && (
            <>
              <div className="absolute top-1/4 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-1/3 right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
              <div className="absolute top-20 right-1/4 w-12 h-12 border border-amber-300/25 rotate-45 transform skew-x-12 opacity-40 animate-bounce" style={{ animationDuration: '10s' }} />
              <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-amber-400/20 rotate-12 transform -skew-y-6 opacity-30 animate-bounce" style={{ animationDuration: '14s' }} />
              <div className="absolute top-1/2 left-1/3 w-8 h-8 border border-white/20 rotate-45 opacity-25" />
            </>
          )}

          {/* Rolex Emerald Gold */}
          {activeThemeId === 'rolex-emerald-gold' && (
            <>
              <div className="absolute top-12 left-[15%] w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl" />
              <div className="absolute bottom-12 right-[15%] w-60 h-60 bg-teal-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '9s' }} />
              <div className="absolute top-[20%] right-[15%] w-16 h-16 rounded-full border border-yellow-400/30 bg-yellow-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.15)] animate-bounce" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[20%] left-[10%] w-20 h-20 rounded-full border border-emerald-400/20 bg-emerald-500/5 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-bounce" style={{ animationDuration: '12s' }} />
              <div className="absolute top-1/4 left-1/4 w-28 h-28 border border-yellow-400/15 rotate-45 opacity-30" />
              <div className="absolute top-1/4 left-1/4 w-28 h-28 border border-yellow-400/15 rotate-90 opacity-30" />
            </>
          )}

          {/* Executive Red Black */}
          {activeThemeId === 'executive-red-black' && (
            <>
              <div className="absolute top-10 left-1/3 w-64 h-64 bg-red-950/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stone-900/40 rounded-full blur-2xl" />
              <div className="absolute top-[15%] right-[20%] w-24 h-12 bg-zinc-950/80 border border-yellow-500/30 rounded-lg shadow-2xl rotate-[25deg] transform hover:rotate-45" style={{ transition: 'transform 3s' }} />
              <div className="absolute bottom-[25%] left-[15%] w-14 h-14 rounded-full border-2 border-yellow-500/25 animate-ping opacity-45" style={{ animationDuration: '4s' }} />
            </>
          )}

          {/* Orange Purple Mesh */}
          {activeThemeId === 'orange-purple-mesh' && (
            <>
              <div className="absolute top-1/4 left-[5%] w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '11s' }} />
              <div className="absolute bottom-1/3 right-[5%] w-80 h-80 bg-orange-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }} />
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  scale: [1, 1.08, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: "easeInOut"
                }}
                className="absolute top-[18%] right-[18%] w-24 h-24 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-gradient-to-tr from-purple-500/25 to-pink-500/20 backdrop-blur-sm border border-purple-400/20"
              />
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  scale: [1, 0.95, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "easeInOut"
                }}
                className="absolute bottom-[22%] left-[12%] w-28 h-28 rounded-[50%_40%_30%_70%_/_50%_60%_40%_60%] bg-gradient-to-tr from-orange-500/20 to-purple-600/20 backdrop-blur-sm border border-orange-400/10"
              />
            </>
          )}

          {/* Gemstone Emerald */}
          {activeThemeId === 'gem-emerald' && (
            <>
              <div className="absolute top-[10%] left-[8%] w-60 h-60 bg-[#50c878]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-[#01796F]/15 rounded-full blur-2xl" />
              <motion.div
                animate={{ rotate: 360, y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute top-[25%] right-[15%] w-14 h-14 border border-[#50c878]/30 bg-[#00202e]/30 backdrop-blur-md shadow-lg shadow-[#50c878]/5 rounded-[12px]"
              />
              <motion.div
                animate={{ rotate: -360, y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute bottom-[25%] left-[15%] w-12 h-12 border border-[#00A86B]/40 bg-[#00202e]/40 backdrop-blur-sm rotate-45"
              />
            </>
          )}

          {/* Gemstone Sapphire */}
          {activeThemeId === 'gem-sapphire' && (
            <>
              <div className="absolute top-[15%] right-[10%] w-80 h-80 bg-[#0f52ba]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[10%] left-[8%] w-64 h-64 bg-[#3aafb9]/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '9s' }} />
              <motion.div
                animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute top-[30%] left-[20%] w-16 h-16 rounded-full border border-[#3aafb9]/30 bg-[#29609C]/10 backdrop-blur-md"
              />
              <motion.div
                animate={{ y: [0, -15, 0], scale: [1, 0.9, 1] }}
                transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
                className="absolute bottom-[30%] right-[20%] w-10 h-10 rounded-full border border-[#f4ffff]/25 bg-white/5"
              />
            </>
          )}

          {/* Gemstone Amethyst */}
          {activeThemeId === 'gem-amethyst' && (
            <>
              <div className="absolute top-[5%] left-[20%] w-96 h-32 bg-[#9966cc]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
              <div className="absolute bottom-[15%] right-[5%] w-80 h-80 bg-[#4c0043]/15 rounded-full blur-2xl" />
              <motion.div
                animate={{ rotate: [45, 90, 45], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                className="absolute top-[40%] right-[18%] w-14 h-14 border border-[#9966cc]/40 bg-[#4a47a3]/10 backdrop-blur-lg rotate-45 transform skew-y-3"
              />
              <motion.div
                animate={{ rotate: [-45, -90, -45], scale: [1, 0.95, 1] }}
                transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
                className="absolute bottom-[20%] left-[18%] w-12 h-12 border border-[#a4a0c6]/30 bg-[#120015]/50 backdrop-blur-md -rotate-12"
              />
            </>
          )}

          {/* Gemstone Ruby */}
          {activeThemeId === 'gem-ruby' && (
            <>
              <div className="absolute top-[20%] left-[5%] w-72 h-72 bg-[#7a0909]/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-[#b31b1b]/10 rounded-full blur-2xl" />
              <motion.div
                animate={{ y: [0, -12, 0], rotate: 45 }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute top-[15%] right-[25%] w-10 h-10 border border-[#f9e3c9]/45 bg-[#7a0909]/20 backdrop-blur-sm"
              />
              <motion.div
                animate={{ y: [0, 8, 0], rotate: 15 }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                className="absolute bottom-[25%] left-[25%] w-14 h-14 border border-[#b31b1b]/30 bg-[#180202]/40 backdrop-blur-md rounded-[4px]"
              />
            </>
          )}

          {/* Gemstone Citrine */}
          {activeThemeId === 'gem-citrine' && (
            <>
              <div className="absolute top-[10%] right-[12%] w-64 h-64 bg-[#ffd700]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '11s' }} />
              <div className="absolute bottom-[10%] left-[12%] w-72 h-72 bg-[#b86f08]/15 rounded-full blur-2xl" />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                className="absolute top-[35%] left-[15%] w-20 h-20 rounded-full border border-[#ffc87c]/35 bg-[#451a03]/20 backdrop-blur-sm"
              />
              <motion.div
                animate={{ rotate: 180 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute bottom-[20%] right-[15%] w-12 h-12 border border-[#ffd700]/25 rotate-12 bg-black/40"
              />
            </>
          )}
        </div>
      )}

      {/* Light Mode High-Contrast Form Overrides */}
      {!isDarkMode && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Styles inside the editor container when in Light Mode */
          .light-theme-form-override input,
          .light-theme-form-override textarea,
          .light-theme-form-override select {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
            opacity: 1 !important;
          }
          .light-theme-form-override input::placeholder,
          .light-theme-form-override textarea::placeholder {
            color: #94a3b8 !important;
            opacity: 0.8 !important;
          }
          .light-theme-form-override label {
            color: #475569 !important;
            opacity: 1 !important;
            text-shadow: none !important;
          }
          .light-theme-form-override option {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          .light-theme-form-override .text-white\\/30,
          .light-theme-form-override .text-white\\/40,
          .light-theme-form-override .text-white\\/50 {
            color: #556987 !important;
            opacity: 1 !important;
          }
          .light-theme-form-override .text-white\\/60,
          .light-theme-form-override .text-white\\/65,
          .light-theme-form-override .text-white\\/80,
          .light-theme-form-override .text-white\\/85,
          .light-theme-form-override .text-white\\/90,
          .light-theme-form-override .text-white {
            color: #1e293b !important;
            opacity: 1 !important;
          }
          .light-theme-form-override .bg-white\\/5,
          .light-theme-form-override .bg-white\\/10 {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            color: #1e293b !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
          }
          .light-theme-form-override .hover\\:bg-white\\/8:hover {
            background-color: #f8fafc !important;
          }
          .light-theme-form-override .text-blue-250,
          .light-theme-form-override .text-blue-200,
          .light-theme-form-override .text-blue-300,
          .light-theme-form-override .text-indigo-200,
          .light-theme-form-override .text-indigo-300 {
            color: #2563eb !important; /* blue-600 */
            font-weight: 700 !important;
          }
          .light-theme-form-override .border-white\\/10,
          .light-theme-form-override .border-white\\/20,
          .light-theme-form-override .border-white\\/5 {
            border-color: #cbd5e1 !important;
          }
          .light-theme-form-override .border-dashed {
            border-color: #cbd5e1 !important;
            background-color: #f8fafc !important;
            color: #1e293b !important;
          }
          .light-theme-form-override .border-dashed:hover {
            background-color: #f1f5f9 !important;
            border-color: #4f46e5 !important;
          }
          .light-theme-form-override .divide-white\\/5,
          .light-theme-form-override .divide-white\\/10 {
            border-color: #e2e8f0 !important;
          }
          .light-theme-form-override .bg-blue-950,
          .light-theme-form-override .bg-blue-950\\/50 {
            background-color: #f8fafc !important;
            color: #1e293b !important;
          }

          /* Force overrides on hardcoded dark inputs / containers */
          .light-theme-form-override .bg-\\[\\#0b132b\\]\\/55,
          .light-theme-form-override .bg-\\[\\#0b132b\\]\\/50,
          .light-theme-form-override .bg-\\[\\#0b132b\\]\\/30,
          .light-theme-form-override .bg-slate-950\\/60,
          .light-theme-form-override .bg-slate-900\\/40,
          .light-theme-form-override .bg-slate-900\\/30 {
            background-color: #ffffff !important;
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
          }

          /* Match specific drop list containers */
          .light-theme-form-override .bg-\\[\\#0e1628\\] {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) !important;
          }
          .light-theme-form-override .hover\\:bg-white\\/5:hover {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
          }

          /* Custom suggestion & re-calculate pill buttons formatting */
          .light-theme-form-override .bg-amber-500\\/10 {
            background-color: #fef3c7 !important; /* amber-100 */
            border-color: #fde047 !important; /* amber-300 */
            color: #b45309 !important; /* amber-800 */
          }
          .light-theme-form-override .hover\\:bg-amber-500\\/20:hover {
            background-color: #fde68a !important; /* amber-200 */
          }
          .light-theme-form-override .text-amber-300 {
            color: #92400e !important; /* amber-800 */
            font-weight: 700 !important;
          }
          .light-theme-form-override .border-amber-500\\/20 {
            border-color: #fcd34d !important;
          }

          /* Skills autoselect options button dynamic items */
          .light-theme-form-override .bg-emerald-500\\/15 {
            background-color: #d1fae5 !important; /* emerald-100 */
            border-color: #6ee7b7 !important; /* emerald-300 */
            color: #065f46 !important; /* emerald-800 */
          }
          .light-theme-form-override .text-emerald-300,
          .light-theme-form-override .text-emerald-400 {
            color: #047857 !important; /* emerald-700 */
            font-weight: 700 !important;
          }
          .light-theme-form-override .border-emerald-500\\/35,
          .light-theme-form-override .border-emerald-500\\/25 {
            border-color: #34d399 !important;
          }
          .light-theme-form-override .hover\\:bg-red-500\\/15:hover {
            background-color: #fee2e2 !important; /* red-100 */
            border-color: #fca5a5 !important; /* red-300 */
            color: #991b1b !important; /* red-800 */
          }
          .light-theme-form-override .hover\\:text-red-300:hover {
            color: #dc2626 !important;
          }
          .light-theme-form-override .hover\\:border-red-500\\/35:hover {
            border-color: #f87171 !important;
          }

          /* Applied active skills badges */
          .light-theme-form-override .bg-blue-900\\/40 {
            background-color: #dbeafe !important; /* blue-100 */
            color: #1e40af !important; /* blue-800 */
            border-color: #93c5fd !important; /* blue-300 */
          }
          .light-theme-form-override .border-blue-500\\/30 {
            border-color: #93c5fd !important;
          }
          .light-theme-form-override .text-blue-200 {
            color: #1e3a8a !important; /* blue-900 */
          }
          .light-theme-form-override .hover\\:bg-red-950\\/40:hover {
            background-color: #ffe4e6 !important; /* rose-100 */
            color: #be123c !important; /* rose-700 */
            border-color: #fda4af !important; /* rose-300 */
          }

          /* Delete / Trash actions adjustments */
          .light-theme-form-override .bg-red-500\\/15,
          .light-theme-form-override .bg-red-500\\/10 {
            background-color: #fee2e2 !important; /* red-100 */
            border-color: #fecaca !important;
            color: #dc2626 !important;
          }
          .light-theme-form-override .text-red-300,
          .light-theme-form-override .text-red-400 {
            color: #b91c1c !important;
            font-weight: 700 !important;
          }
          .light-theme-form-override .hover\\:bg-red-500\\/35:hover,
          .light-theme-form-override .hover\\:bg-red-500\\/30:hover {
            background-color: #fca5a5 !important;
            color: #991b1b !important;
          }
          .light-theme-form-override .hover\\:bg-red-650\\/80:hover {
            background-color: #b91c1c !important;
            color: #ffffff !important;
          }

          /* Cover Letter style templates and options */
          .light-theme-form-override .hover\\:bg-slate-800:hover {
            background-color: #e0e7ff !important; /* indigo-100 */
            border-color: #818cf8 !important;
          }
          .light-theme-form-override .group:hover .group-hover\\:text-amber-300 {
            color: #3730a3 !important; /* indigo-800 */
          }
          .light-theme-form-override .text-indigo-400 {
            color: #4f46e5 !important; /* indigo-600 */
          }
          .light-theme-form-override .bg-indigo-500\\/10 {
            background-color: #e0e7ff !important; /* indigo-100 */
            border-color: #818cf8 !important;
          }

          /* Sidebar theme picker presets details */
          .light-theme-form-override .bg-white\\/2 {
            background-color: #f8fafc !important; /* slate-50 */
            border-color: #e2e8f0 !important;
          }
          .light-theme-form-override .bg-white\\/4 {
            background-color: #f1f5f9 !important; /* slate-100 */
            border-color: #cbd5e1 !important;
          }
          .light-theme-form-override .hover\\:bg-white\\/4:hover {
            background-color: #e2e8f0 !important;
          }
          .light-theme-form-override .bg-black\\/20 {
            background-color: #f1f5f9 !important; /* slate-100 */
            border-color: #cbd5e1 !important;
          }
          .light-theme-form-override .text-slate-300,
          .light-theme-form-override .text-slate-400 {
            color: #475569 !important; /* slate-600 */
          }

          /* Ensure white text remains white on dark button backgrounds in light mode */
          .light-theme-form-override button.bg-blue-600,
          .light-theme-form-override button.bg-indigo-600,
          .light-theme-form-override button.bg-indigo-700,
          .light-theme-form-override button.bg-blue-500,
          .light-theme-form-override button.bg-violet-650,
          .light-theme-form-override button.bg-violet-600,
          .light-theme-form-override button.bg-emerald-600,
          .light-theme-form-override button.bg-emerald-500,
          .light-theme-form-override button.bg-red-600,
          .light-theme-form-override button[class*="bg-blue-"],
          .light-theme-form-override button[class*="bg-indigo-"],
          .light-theme-form-override button[class*="bg-violet-"],
          .light-theme-form-override button[class*="bg-emerald-"],
          .light-theme-form-override .bg-indigo-600,
          .light-theme-form-override .bg-blue-600,
          .light-theme-form-override .bg-emerald-600,
          .light-theme-form-override button {
            text-shadow: none !important;
          }
          .light-theme-form-override button.bg-blue-600 *,
          .light-theme-form-override button.bg-indigo-600 *,
          .light-theme-form-override button.bg-[#6366f1] *,
          .light-theme-form-override button.bg-emerald-600 * {
            color: #ffffff !important;
          }
          .light-theme-form-override button.bg-blue-600,
          .light-theme-form-override button.bg-indigo-600,
          .light-theme-form-override button.bg-emerald-600,
          .light-theme-form-override button.bg-violet-600,
          .light-theme-form-override button.bg-[#6366f1] {
            color: #ffffff !important;
          }
        ` }} />
      )}
      
      {/* Global theme toggle is now located inside the Settings panel */}

      {/* 50 TEMPLATE GALLERY OVERLAYS / SCREEN ENCLOSURES INSPIRED BY CANVA */}
      <AnimatePresence mode="wait">
        
        {/* ========================================================= */}
        {/* VIEW 1: WELCOME / SPLASH SCREEN PAGE                     */}
        {/* ========================================================= */}
        {view === 'welcome' && (
          <motion.div
            key="welcome-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            id="welcome-splash"
            className={`w-full max-w-[1080px] min-h-[700px] bg-transparent backdrop-blur-3xl border rounded-3xl p-6 sm:p-12 relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
              activeThemeId === 'cyber-ai'
                ? 'bg-[#040916]/75 border-cyan-500/30 text-cyan-50 shadow-[0_0_50px_rgba(0,242,254,0.15)]'
                : activeThemeId === 'apple-vision-pro'
                  ? 'bg-white/10 border-white/20 shadow-[0_20px_50px_rgba(255,255,255,0.05)] text-white'
                  : isDarkMode ? 'border-white/10 text-white shadow-2xl shadow-black/40' : 'border-slate-205 text-slate-800'
            }`}
          >
            {/* FLOATING CV WATERMARKS DECORATIVES */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}>
              <div className="absolute top-10 left-12 rotate-12 scale-125 select-none animate-bounce" style={{ animationDuration: '8s' }}>
                <FileText className="w-56 h-56 animate-pulse" />
                <span className={`text-xs font-mono ml-4 block ${isDarkMode ? 'text-white' : 'text-slate-400'}`}>CV MATRIX</span>
              </div>
              <div className="absolute bottom-16 right-10 -rotate-12 scale-150 animate-pulse" style={{ animationDuration: '6s' }}>
                <FileCheck className="w-64 h-64" />
                <span className={`text-xs font-mono block ${isDarkMode ? 'text-white' : 'text-slate-400'}`}>PORTFOLIO</span>
              </div>
              <div className="absolute top-2/3 left-1/3 rotate-45 scale-75 animate-bounce" style={{ animationDuration: '12s' }}>
                <Layers className="w-44 h-44" />
              </div>
            </div>



            {/* TOP SECTION: PREMIUM APP ICON */}
            <div className="z-10 flex flex-col items-center text-center mt-6">
              <motion.div
                initial={{ scale: 0.92, y: 5 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 4, ease: "easeInOut" }}
                className={`w-32 h-32 p-[3px] rounded-3xl shadow-2xl relative group ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-gradient-to-tr from-cyan-400 via-pink-400 to-indigo-500 shadow-cyan-500/10'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-gradient-to-tr from-white via-slate-300 to-slate-400 shadow-white/5'
                      : 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-blue-900/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b0f19] rounded-[22px] overflow-hidden relative">
                  <img
                    src="/srb_app_icon.jpg"
                    alt="SIRAJ RESUME BUILDER premium logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[21px]"
                  />
                </div>
                {/* Glowing shadow rings */}
                <span className={`absolute -inset-1 rounded-3xl border -z-10 animate-pulse opacity-60 ${
                  activeThemeId === 'cyber-ai' ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.3)]' : activeThemeId === 'apple-vision-pro' ? 'border-white/30' : 'border-amber-300/40'
                }`} />
              </motion.div>
            </div>

            {/* CENTER SECTION: APP TITLE AND PREMIUM SLOGAN CLUSTERS */}
            <div className="z-10 text-center my-6 max-w-2xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-display mb-6 uppercase bg-clip-text text-transparent filter drop-shadow-sm ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-gradient-to-r from-cyan-400 via-pink-500 to-indigo-300 drop-shadow-[0_0_20px_rgba(0,242,254,0.25)] animate-pulse'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-gradient-to-b from-white via-slate-100 to-slate-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                      : activeThemeId === 'neon-glass-pro'
                        ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
                        : isDarkMode 
                          ? 'bg-gradient-to-b from-white via-indigo-100 to-indigo-200' 
                          : 'bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950'
                }`}
                style={activeThemeId === 'neon-glass-pro' || activeThemeId === 'cyber-ai' ? { animationDuration: '6s' } : undefined}
              >
                SIRAJ RESUME BUILDER
              </motion.h1>

              {/* Slogan cards with Material-inspired responsive listing wrapper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-left font-sans text-xs"
              >
                <div className={`border rounded-2xl p-4 flex gap-3 h-full transition-all hover:scale-[1.01] ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-[#020712]/75 border-cyan-500/20 hover:border-pink-500/40 hover:bg-[#030d22]/90 text-cyan-100 shadow-[0_0_15px_rgba(0,242,254,0.05)]'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
                      : isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-slate-50 border-slate-205 hover:bg-slate-100/80 text-slate-800 shadow-sm shadow-slate-100'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeThemeId === 'cyber-ai' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.15)]' : activeThemeId === 'apple-vision-pro' ? 'bg-white/15 text-white' : isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#eff6ff]' : 'text-slate-900'}`}>Build your future</h3>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#eff6ff]/70' : 'text-slate-500'}`}>Assemble a highly professional CV in a single click with fully reactive grids.</p>
                  </div>
                </div>

                <div className={`border rounded-2xl p-4 flex gap-3 h-full transition-all hover:scale-[1.01] ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-[#020712]/75 border-cyan-500/20 hover:border-pink-500/40 hover:bg-[#030d22]/90 text-cyan-100 shadow-[0_0_15px_rgba(0,242,254,0.05)]'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
                      : isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-slate-50 border-slate-205 hover:bg-slate-100/80 text-slate-800 shadow-sm shadow-slate-100'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeThemeId === 'cyber-ai' ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.15)]' : activeThemeId === 'apple-vision-pro' ? 'bg-white/15 text-white' : isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#eff6ff]' : 'text-slate-900'}`}>Professional Crafting</h3>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#eff6ff]/70' : 'text-slate-500'}`}>Specifically design high converting layouts that actively pass ATS software tests to land top job offers.</p>
                  </div>
                </div>

                <div className={`border rounded-2xl p-4 flex gap-3 h-full transition-all hover:scale-[1.01] ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-[#020712]/75 border-cyan-500/20 hover:border-pink-500/40 hover:bg-[#030d22]/90 text-cyan-100 shadow-[0_0_15px_rgba(0,242,254,0.05)]'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
                      : isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-slate-50 border-slate-205 hover:bg-slate-100/80 text-slate-800 shadow-sm shadow-slate-100'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeThemeId === 'cyber-ai' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : activeThemeId === 'apple-vision-pro' ? 'bg-white/15 text-white' : isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#eff6ff]' : 'text-slate-900'}`}>Action-Oriented Narrative</h3>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#eff6ff]/70' : 'text-slate-500'}`}>Communicate key metrics, achievements, credentials, and languages formatted elegantly for review boards.</p>
                  </div>
                </div>

                <div className={`border rounded-2xl p-4 flex gap-3 h-full transition-all hover:scale-[1.01] ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-[#020712]/75 border-cyan-500/20 hover:border-pink-500/40 hover:bg-[#030d22]/90 text-cyan-100 shadow-[0_0_15px_rgba(0,242,254,0.05)]'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
                      : isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                        : 'bg-slate-50 border-slate-205 hover:bg-slate-100/80 text-slate-800 shadow-sm shadow-slate-100'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeThemeId === 'cyber-ai' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.15)]' : activeThemeId === 'apple-vision-pro' ? 'bg-white/15 text-white' : isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#eff6ff]' : 'text-slate-900'}`}>Empowering Success</h3>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#eff6ff]/70' : 'text-slate-500'}`}>Take command of your career and present yourself with beautiful, Apple-grade design standards.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* BOTTOM SECTION: GET STARTED BUTTON */}
            <div className="z-10 flex flex-col items-center justify-center gap-1.5 mt-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('navigation')}
                id="get-started-button"
                className={`px-10 py-4 rounded-2xl font-extrabold text-sm tracking-widest uppercase transition-all shadow-xl flex items-center gap-2.5 border cursor-pointer ${
                  activeThemeId === 'cyber-ai'
                    ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 text-slate-950 border-cyan-300 shadow-[0_0_30px_rgba(0,242,254,0.35)] hover:shadow-[0_0_45px_rgba(236,72,153,0.5)] hover:border-pink-300'
                    : activeThemeId === 'apple-vision-pro'
                      ? 'bg-white text-slate-950 border-white hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]'
                      : activeThemeId === 'neon-glass-pro'
                        ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white border-white/20 shadow-indigo-950/50'
                }`}
              >
                <span>GET STARTED</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              
              <p className={`text-[10px] font-mono tracking-widest mt-2 ${isDarkMode ? 'text-white/50' : 'text-slate-400/80'}`}>
                DESIGN SUITE v3.5 • COMPATIBLE WITH ALL MOBILE VIEWPORTS
              </p>
            </div>
            
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: TRANSITION HUB / THREE NAVIGATION BUTTONS SCREEN  */}
        {/* ========================================================= */}
        {view === 'navigation' && (
          <motion.div
            key="navigation-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`w-full max-w-4xl backdrop-blur-3xl border rounded-3xl p-6 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
              activeThemeId === 'cyber-ai'
                ? 'bg-[#040916]/85 border-cyan-500/25 text-cyan-50 shadow-[0_0_40px_rgba(0,242,254,0.12)] hover:border-pink-500/30'
                : activeThemeId === 'apple-vision-pro'
                  ? 'bg-white/10 border-white/20 text-white shadow-[0_20px_50px_rgba(255,255,255,0.05)]'
                  : activeThemeId === 'neon-glass-pro'
                    ? 'bg-[#090620]/35 border-purple-500/25 text-white shadow-[0_0_50px_rgba(139,92,246,0.12)] hover:border-cyan-500/30 hover:shadow-[0_0_60px_rgba(6,182,212,0.18)]'
                    : isDarkMode
                      ? 'bg-transparent border-white/10 text-white shadow-2xl shadow-black/40'
                      : 'border-slate-205 text-slate-800 bg-white'
            }`}
          >
            <div>
              {/* Header Info */}
              <div className={`flex items-center justify-between border-b ${
                activeThemeId === 'cyber-ai' ? 'border-cyan-500/15' : isDarkMode ? 'border-slate-800' : 'border-slate-100'
              } pb-5 mb-8`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs select-none shadow ${
                    activeThemeId === 'cyber-ai' ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]' : 'bg-blue-600 text-white'
                  }`}>
                    SRB
                  </div>
                  <div>
                    <h2 className={`font-extrabold tracking-tight text-sm ${
                      activeThemeId === 'cyber-ai' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 font-mono' : isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>SIRAJ RESUME BUILDER</h2>
                    <p className={`text-[10px] font-mono tracking-widest uppercase mt-0.5 ${
                      activeThemeId === 'cyber-ai' ? 'text-cyan-400/80' : isDarkMode ? 'text-slate-400' : 'text-slate-400/80'
                    }`}>Design Hub Enclosure</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSettingsTab('themes');
                      setShowSettingsModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeThemeId === 'cyber-ai'
                        ? 'border-cyan-500/30 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-pink-500/30'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : isDarkMode ? 'border-indigo-500/30 text-indigo-350 hover:bg-indigo-500/10' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button 
                    onClick={() => setView('welcome')}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      activeThemeId === 'cyber-ai'
                        ? 'border-cyan-500/20 text-cyan-300 hover:bg-cyan-950/30'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-850' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Splash
                  </button>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center max-w-lg mx-auto mb-8">
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight font-display mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select Design Mode
                </h2>
                <p className={`text-xs leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  How would you like to build your stand-out profile document today? Select an entry node to proceed securely.
                </p>
              </div>

              {/* THREE INTERACTIVE BUTTON CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
                
                {/* BUTTON 1: NEW RESUME (BLANK) */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  onClick={startNewBlankResume}
                  className={`p-6 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[220px] group cursor-pointer ${
                    activeThemeId === 'cyber-ai'
                      ? 'border-cyan-500/20 bg-[#020712]/70 hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:bg-[#030d22]/90 text-cyan-50'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'border-white/15 bg-white/5 hover:border-white/35 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white'
                        : activeThemeId === 'neon-glass-pro'
                          ? 'border-purple-500/20 bg-purple-950/15 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-purple-950/30 text-white'
                          : isDarkMode 
                            ? 'border-blue-900/60 bg-[#0f172a]/50 hover:border-blue-600 text-white shadow-black/20' 
                            : 'border-blue-200 bg-gradient-to-b from-blue-50/50 to-white text-slate-800 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:border-blue-300'
                  }`}
                >
                  <div className={`w-11 h-11 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : activeThemeId === 'neon-glass-pro' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-blue-600'
                  }`}>
                    <Plus className="w-5.5 h-5.5" />
                  </div>
                  <div className="mt-4">
                    <span className={`text-[9.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-pink-300 bg-pink-950/50 border border-pink-500/25'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white bg-white/10 border border-white/20'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/20'
                            : isDarkMode ? 'text-blue-300 bg-blue-950/60' : 'text-blue-600 bg-blue-100/50'
                    }`}>
                      Recommended
                    </span>
                    <h3 className={`text-base font-extrabold mt-2 ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-cyan-50 group-hover:text-pink-400'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white group-hover:text-white'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-white group-hover:text-cyan-300'
                            : isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900'
                    }`}>New Resume (Blank)</h3>
                    <p className={`text-[11.5px] leading-normal mt-1 ${
                      activeThemeId === 'cyber-ai' ? 'text-cyan-100/60' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Start fresh with a clean default canvas structure. Choose themes and configurations later as you expand.
                    </p>
                  </div>
                </motion.button>

                {/* BUTTON 2: OPEN */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  onClick={() => setView('open_browser')}
                  className={`p-6 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[220px] group cursor-pointer ${
                    activeThemeId === 'cyber-ai'
                      ? 'border-cyan-500/20 bg-[#020712]/70 hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:bg-[#030d22]/90 text-cyan-50'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'border-white/15 bg-white/5 hover:border-white/35 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white'
                        : activeThemeId === 'neon-glass-pro'
                          ? 'border-purple-500/20 bg-purple-950/15 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-purple-950/30 text-white'
                          : isDarkMode 
                            ? 'border-slate-800 bg-[#0f172a]/50 hover:border-slate-700 text-white shadow-black/20' 
                            : 'border-slate-200 bg-gradient-to-b from-slate-50/50 to-white text-slate-800 hover:border-slate-350 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className={`w-11 h-11 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : activeThemeId === 'neon-glass-pro' ? 'bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-indigo-600'
                  }`}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className={`text-[9.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/25'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white bg-white/10 border border-white/20'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-purple-300 bg-purple-950/50 border border-purple-500/20'
                            : isDarkMode ? 'text-indigo-300 bg-indigo-950/60' : 'text-indigo-600 bg-indigo-100/50'
                    }`}>
                      Drafts Folder
                    </span>
                    <h3 className={`text-base font-extrabold mt-2 ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-cyan-50 group-hover:text-pink-400'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white group-hover:text-white'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-white group-hover:text-purple-300'
                            : isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900'
                    }`}>Open Draft Record</h3>
                    <p className={`text-[11.5px] leading-normal mt-1 ${
                      activeThemeId === 'cyber-ai' ? 'text-cyan-100/60' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Pick up exactly where you left off. Browse previously autosaved resumes cached on your device.
                    </p>
                  </div>
                </motion.button>

                {/* BUTTON 3: TEMPLATES */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  onClick={() => setView('templates_gallery')}
                  className={`p-6 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[220px] group cursor-pointer ${
                    activeThemeId === 'cyber-ai'
                      ? 'border-cyan-500/20 bg-[#020712]/70 hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:bg-[#030d22]/90 text-cyan-50'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'border-white/15 bg-white/5 hover:border-white/35 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white'
                        : activeThemeId === 'neon-glass-pro'
                          ? 'border-purple-500/20 bg-purple-950/15 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-purple-950/30 text-white'
                          : isDarkMode 
                            ? 'border-amber-950 bg-[#0f172a]/50 hover:border-amber-800 text-white shadow-black/20' 
                            : 'border-amber-200 bg-gradient-to-b from-amber-50/30 to-white text-slate-800 shadow-lg shadow-amber-500/5 hover:shadow-xl hover:border-amber-300'
                  }`}
                >
                  <div className={`w-11 h-11 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        : activeThemeId === 'neon-glass-pro' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-amber-500'
                  }`}>
                    <Layout className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <span className={`text-[9.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/25'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white bg-white/10 border border-white/20'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-blue-300 bg-blue-950/50 border border-blue-500/20'
                            : isDarkMode ? 'text-amber-300 bg-amber-950/60' : 'text-amber-700 bg-amber-100/60'
                    }`}>
                      50 Designs
                    </span>
                    <h3 className={`text-base font-extrabold mt-2 ${
                      activeThemeId === 'cyber-ai'
                        ? 'text-cyan-50 group-hover:text-pink-400'
                        : activeThemeId === 'apple-vision-pro'
                          ? 'text-white group-hover:text-white'
                          : activeThemeId === 'neon-glass-pro'
                            ? 'text-white group-hover:text-blue-300'
                            : isDarkMode ? 'text-white group-hover:text-amber-400' : 'text-slate-900'
                    }`}>Stylish Templates</h3>
                    <p className={`text-[11.5px] leading-normal mt-1 ${
                      activeThemeId === 'cyber-ai' ? 'text-cyan-100/60' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Browse modern, custom-crafted designer templates including Creative, Executive, ATS and minimal grids.
                    </p>
                  </div>
                </motion.button>

              </div>
            </div>

            <div className={`mt-8 border-t pt-5 text-center flex flex-col md:flex-row md:items-center md:justify-between text-xs gap-3 ${
              isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
            }`}>
              <span className="font-mono">Ready to process client drafts dynamically.</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono font-bold uppercase tracking-widest text-[9px] text-[#059669]">Network Sync Online</span>
              </div>
            </div>
          </motion.div>
        )}
        {view === 'blank_builder' && currentDraft && (
          <motion.div
            key="builder-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full max-w-6xl rounded-[25px] shadow-3xl flex flex-col overflow-hidden min-h-[720px] relative transition-all duration-500 ${
              activeThemeId === 'cyber-ai'
                ? 'bg-[#040916]/85 border border-cyan-500/30 text-cyan-50 shadow-[0_0_50px_rgba(0,242,254,0.15)]'
                : activeThemeId === 'apple-vision-pro'
                  ? 'bg-white/10 border border-white/20 text-white shadow-[0_20px_50px_rgba(255,255,255,0.05)]'
                  : isDarkMode 
                    ? activeTheme.cardClass 
                    : 'bg-transparent border border-slate-205 shadow-md shadow-slate-100 text-slate-800'
            }`}
          >
            {/* Animating soft ambient light circles inside the card */}
            <div className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'}`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[130px] -z-10 animate-pulse pointer-events-none ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
 
            {/* Header toolbar */}
            <div className={`backdrop-blur-md px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-10 no-print ${
              activeThemeId === 'cyber-ai'
                ? 'bg-[#060c1c]/90 border-cyan-500/20 text-cyan-100 shadow-[0_0_15px_rgba(0,242,254,0.05)]'
                : activeThemeId === 'apple-vision-pro'
                  ? 'bg-white/5 border-white/15 text-white'
                  : isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-white/45 border-slate-200/55 text-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => {
                    saveCurrentDraftToLocalStorage(currentDraft);
                    setView('navigation');
                  }} 
                  className={`cursor-pointer p-2.5 rounded-xl transition-all max-w-fit border ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 border-cyan-500/35 hover:border-pink-500/40 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                        : isDarkMode 
                          ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-250 shadow-sm'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={currentDraft.title}
                      onChange={(e) => updateDraftMeta('title', e.target.value)}
                      className={`font-extrabold text-sm sm:text-base tracking-tight bg-transparent border-b border-transparent focus:outline-none focus:ring-0 max-w-[200px] ${
                        activeThemeId === 'cyber-ai'
                          ? 'focus:border-cyan-400 text-cyan-200 font-mono'
                          : activeThemeId === 'apple-vision-pro'
                            ? 'focus:border-white text-white'
                            : isDarkMode 
                              ? 'focus:border-white text-white' 
                              : 'focus:border-indigo-600 text-slate-800'
                      }`}
                    />
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className={`text-[10px] font-mono tracking-widest ${isDarkMode ? 'text-blue-200/60' : 'text-slate-50'}`}>
                    STATUS: EDITING {(() => {
                      const names: Record<number, string> = {
                        1: "IDENTITY INFORMATION",
                        2: "WORK EXPERIENCE",
                        3: "ACADEMIC EDUCATION",
                        4: "CORE EXPERTISE SKILLS",
                        5: "PORTFOLIO PROJECTS",
                        6: "CERTIFICATIONS",
                        7: "TRAINING & COURSES",
                        8: "LANGUAGES",
                        9: "REFERENCES & LINKS"
                      };
                      return names[activeSection] || "DRAFT BUILDER";
                    })()}
                  </p>
                </div>
              </div>
 
              {/* Actions row */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('themes');
                    setShowSettingsModal(true);
                  }}
                  className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer ${
                    activeThemeId === 'cyber-ai'
                      ? 'text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/30 hover:border-pink-500/30'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'text-white bg-white/10 hover:bg-white/20 border border-white/15'
                        : isDarkMode 
                          ? 'text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30' 
                          : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm shadow-indigo-100/30'
                  }`}
                  title="Configure Themes, About Us, and Application Info"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullPagePreview(true)}
                  className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer ${
                    activeThemeId === 'cyber-ai'
                      ? 'text-pink-300 bg-pink-950/20 hover:bg-pink-950/40 border border-pink-500/30 hover:border-cyan-500/30'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'text-white bg-white/10 hover:bg-white/20 border border-white/15'
                        : isDarkMode 
                          ? 'text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30' 
                          : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm shadow-indigo-100/30'
                  }`}
                  title="Preview entire page layout in distraction-free light modal"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Page Preview
                </button>
                <button
                  type="button"
                  onClick={() => setView('templates_gallery')}
                  className={`text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 border border-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:border-pink-300 font-bold'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white text-slate-950 border border-white hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                        : 'bg-sky-400 hover:bg-sky-300 text-black border border-sky-500/40 shadow-sky-400/20'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5 text-black" /> Pick Layout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveCurrentDraftToLocalStorage(currentDraft);
                    setView('navigation');
                  }}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer shadow-md ${
                    activeThemeId === 'cyber-ai'
                      ? 'bg-[#020712]/80 hover:bg-[#030d22]/90 text-cyan-300 border border-cyan-500/35 hover:border-pink-500/45 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : activeThemeId === 'apple-vision-pro'
                        ? 'bg-white/20 hover:bg-white/30 text-white border border-white/25 shadow-white/5'
                        : isDarkMode
                          ? 'bg-indigo-600 hover:bg-indigo-555 text-white border border-indigo-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700/20 shadow-md shadow-indigo-200'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Save Section Draft
                </button>
              </div>
            </div>

            {/* Split Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden z-10">
              
              {/* LEFT COLUMN: SCROLLABLE EDITOR (Frosted Glass Panel) */}
              <div id="editor-scroll-container" className={`lg:col-span-7 p-6 space-y-5 max-h-[580px] overflow-y-auto scrollbar-thin border-r no-print bg-transparent ${
                activeThemeId === 'cyber-ai'
                  ? 'border-cyan-500/20'
                  : activeThemeId === 'apple-vision-pro'
                    ? 'border-white/15'
                    : isDarkMode 
                      ? 'border-white/10' 
                      : 'border-slate-205 light-theme-form-override'
              } backdrop-blur-sm`}>
                
                {/* SUB-NAVIGATION TABS FOR MASTER EDITING */}
                <div className={`flex items-center gap-1.5 overflow-x-auto pb-3 border-b scrollbar-thin select-none ${
                  isDarkMode ? 'border-white/10 scrollbar-thumb-white/10' : 'border-slate-200 scrollbar-thumb-slate-300/50'
                }`}>
                  {[
                    { id: 1, label: 'Identity', icon: User },
                    { id: 2, label: 'Experience', icon: Briefcase },
                    { id: 3, label: 'Education', icon: GraduationCap },
                    { id: 4, label: 'Skills', icon: PenTool },
                    { id: 5, label: 'Projects', icon: FileText },
                    { id: 6, label: 'Certifications', icon: Award },
                    { id: 7, label: 'Trainings', icon: FileCheck },
                    { id: 8, label: 'Languages', icon: Languages },
                    { id: 9, label: 'Ref & Links', icon: Info },
                    { id: 10, label: 'Cover Letter', icon: Mail }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          saveCurrentDraftToLocalStorage(currentDraft);
                          setActiveSection(tab.id);
                        }}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border cursor-pointer ${
                          isActive 
                            ? isWindows95 
                              ? "bg-[#000080] text-white border-zinc-700 font-sans shadow-none" 
                              : activeThemeId === 'cyber-ai'
                                ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.25)] scale-[1.02] font-mono"
                                : activeThemeId === 'apple-vision-pro'
                                  ? "bg-white text-slate-950 border-white shadow-[0_5px_15px_rgba(255,255,255,0.15)] scale-[1.02]"
                                  : "bg-indigo-600 text-white border-indigo-500/40 shadow-lg shadow-indigo-600/15 scale-[1.02]"
                            : isWindows95
                              ? "bg-zinc-300 text-black border-zinc-400 hover:text-black hover:bg-zinc-200"
                              : activeThemeId === 'cyber-ai'
                                ? "bg-[#020712]/40 text-cyan-400/70 border-cyan-500/15 hover:bg-cyan-950/20 hover:text-cyan-200"
                                : activeThemeId === 'apple-vision-pro'
                                  ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                                  : isDarkMode 
                                    ? "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800/80"
                                    : "bg-white text-indigo-900/75 hover:text-indigo-950 hover:bg-indigo-5/60 border-indigo-100 shadow-sm shadow-indigo-100/10"
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Header Title for Active Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl border ${
                      isWindows95 
                        ? 'bg-zinc-300 border-zinc-500 text-black' 
                        : isDarkMode 
                          ? 'bg-blue-500/20 border-blue-400/30' 
                          : 'bg-indigo-100 border-indigo-200'
                    }`}>
                      {(() => {
                        const iconMap: Record<number, any> = {
                          1: User,
                          2: Briefcase,
                          3: GraduationCap,
                          4: PenTool,
                          5: FileText,
                          6: Award,
                          7: FileCheck,
                          8: Languages,
                          9: Info,
                          10: Mail
                        };
                        const SectionIconComponent = iconMap[activeSection] || User;
                        return <SectionIconComponent className={`w-4 h-4 ${
                          isWindows95 
                            ? 'text-black' 
                            : isDarkMode 
                              ? 'text-blue-300' 
                              : 'text-indigo-600'
                        }`} />;
                      })()}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold tracking-tight font-display ${
                        isWindows95 
                          ? 'text-black' 
                          : isDarkMode 
                            ? 'text-white' 
                            : 'text-slate-800'
                      }`}>
                        {(() => {
                          const titleMap: Record<number, string> = {
                            1: 'Personal Identity Values',
                            2: 'Professional Work Experience',
                            3: 'Academic & Education Background',
                            4: 'Strategic Core Skills',
                            5: 'Projects & Key Initiatives',
                            6: 'Certifications & Credentials',
                            7: 'Attended Training & Courses',
                            8: 'Language Proficiency',
                            9: 'References & Social links',
                            10: 'Cover Letter Composer'
                          };
                          return titleMap[activeSection] || 'Editor Segment';
                        })()}
                      </h3>
                      <p className={`text-[10px] uppercase tracking-widest font-mono font-bold mt-0.5 ${isDarkMode ? 'text-blue-200/50' : 'text-slate-500'}`}>Section {activeSection} of 10</p>
                    </div>
                  </div>
                  
                  {/* Quick helper tip */}
                  <div className={`text-[10px] px-2.5 py-1 rounded-lg font-mono ${isDarkMode ? 'text-amber-300 bg-amber-500/10 border border-amber-300/20' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'}`}>
                    Premium Glass Builder Enabled
                  </div>
                </div>

                {/* FIELDS AREA */}
                <div className="space-y-4">
                  {activeSection === 1 && (
                    <>
                      {/* Photo Field Card (if not deleted/hidden) */}
                  {!((currentDraft.deletedFields || []).includes('profilePhoto')) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={getCardClass()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const deleted = currentDraft.deletedFields || [];
                          updateDraftMeta('deletedFields', [...deleted, 'profilePhoto']);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all border border-red-500/20 cursor-pointer"
                        title="Delete this field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 mb-3.5">
                        <Upload className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-300' : 'text-indigo-600'}`} />
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-200' : 'text-indigo-600'}`}>Candidate Photo</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Circle preview */}
                        <div className={`relative w-22 h-22 rounded-full overflow-hidden border flex items-center justify-center shadow-inner group ${isDarkMode ? 'bg-blue-950/50 border-white/20' : 'bg-slate-100 border-slate-300'}`}>
                          {currentDraft.profilePhoto ? (
                            <img
                              src={currentDraft.profilePhoto}
                              alt="Avatar"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`flex flex-col items-center text-center p-2 ${isDarkMode ? 'text-blue-300/40' : 'text-slate-450'}`}>
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* File pick actions */}
                        <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                          <p className={`text-xs font-semibold ${isDarkMode ? 'text-white/85' : 'text-slate-800'}`}>Upload candidate photograph:</p>
                          <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                            Recommended: Square photo, high resolution. Supports JPG, PNG formats up to 2MB.
                          </p>
                          
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                            {/* Browser File Upload trigger */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isDarkMode ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-sm'
                              }`}
                            >
                              <Upload className="w-3 h-3" /> Browse PC
                            </button>
                            
                            {/* Mobile Camera Upload trigger */}
                            <button
                              type="button"
                              onClick={() => fileInputMobileRef.current?.click()}
                              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isDarkMode ? 'bg-blue-500/30 hover:bg-blue-500/40 text-blue-100 border border-blue-400/30' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                              }`}
                            >
                              <Phone className="w-3 h-3" /> Mobile Camera
                            </button>

                            {currentDraft.profilePhoto && (
                              <button
                                type="button"
                                onClick={() => updateDraftMeta('profilePhoto', '')}
                                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                  isDarkMode ? 'bg-red-500/10 hover:bg-red-500/25 text-red-200 border-red-500/20' : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-sm'
                                }`}
                              >
                                Clear Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hidden File Inputs */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateDraftMeta('profilePhoto', reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={fileInputMobileRef}
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateDraftMeta('profilePhoto', reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </motion.div>
                  )}

                  {/* Render standard Personal Fields */}
                  {[
                    { key: 'fullName', label: 'Full Name', placeholder: 'e.g. Siraj Ahmed', icon: User, type: 'text' },
                    { key: 'professionalTitle', label: 'Professional Title', placeholder: 'e.g. Senior Software Architect', icon: Briefcase, type: 'text' },
                    { key: 'nationality', label: 'Nationality', placeholder: 'Select Nationality', icon: Globe, type: 'select', options: ['Emirati', 'Indian', 'Pakistani', 'British', 'American', 'Canadian', 'Australian', 'Egyptian', 'Saudi', 'Jordanian', 'Syrian', 'Lebanese', 'Omani', 'Bahraini', 'Kuwaiti', 'Qatari', 'Yemeni', 'Sudanese', 'Iraqi', 'Moroccan', 'South African', 'German', 'French', 'Italian', 'Spanish', 'Russian', 'Turkish', 'Filipino', 'Bangladeshi', 'Chinese', 'Japanese', 'Korean', 'Singaporean', 'Other'] },
                    { key: 'dateOfBirth', label: 'Date of Birth', placeholder: 'YYYY-MM-DD', icon: Calendar, type: 'date' },
                    { key: 'gender', label: 'Gender', placeholder: 'Select Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
                    { key: 'maritalStatus', label: 'Marital Status', placeholder: 'Select Status', icon: Heart, type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'] },
                    { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +971 501 2345', icon: Phone, type: 'text' },
                    { key: 'email', label: 'Email Address', placeholder: 'e.g. siraj@resumebuilder.com', icon: Mail, type: 'email' },
                    { key: 'address', label: 'Address Residence', placeholder: 'e.g. Dubai, UAE', icon: MapPin, type: 'text' }
                  ]
                    .filter((field) => !((currentDraft.deletedFields || []).includes(field.key)))
                    .map((field) => {
                      const IconComponent = field.icon;
                      return (
                        <motion.div
                          key={field.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={getCardClass()}
                        >
                          {/* Inside Delete Button for each field */}
                          <button
                            type="button"
                            onClick={() => {
                              const deleted = currentDraft.deletedFields || [];
                              updateDraftMeta('deletedFields', [...deleted, field.key]);
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all border border-red-500/20 cursor-pointer opacity-80 hover:opacity-100"
                            title="Delete field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Header section labeling */}
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <IconComponent className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-300' : 'text-indigo-600'}`} />
                            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-200' : 'text-indigo-600'}`}>{field.label}</span>
                          </div>

                          {/* Body element custom render */}
                          {field.type === 'select' ? (
                            <div className="relative mt-1">
                              {field.key === 'nationality' && currentDraft.nationality && getNationalityFlag(currentDraft.nationality) !== '🌐' && (
                                <span className="absolute left-3.5 top-[14px] text-base z-10 pointer-events-none select-none">
                                  {getNationalityFlag(currentDraft.nationality)}
                                </span>
                              )}
                              <select
                                value={currentDraft[field.key as keyof ResumeDraft] as string || ''}
                                onChange={(e) => updateDraftMeta(field.key as keyof ResumeDraft, e.target.value)}
                                className={getSelectClass(field.key === 'nationality' && currentDraft.nationality && getNationalityFlag(currentDraft.nationality) !== '🌐' ? 'pl-11' : '')}
                              >
                                <option value="" disabled className={isDarkMode ? 'bg-blue-950 text-white/50' : 'bg-white text-slate-400'}>Select option...</option>
                                {field.options?.map((opt) => {
                                  const displayLabel = field.key === 'nationality' 
                                    ? `${getNationalityFlag(opt)} ${opt}` 
                                    : opt;
                                  return (
                                    <option key={opt} value={opt} className={isDarkMode ? 'bg-blue-950 text-white' : 'bg-white text-slate-800'}>{displayLabel}</option>
                                  );
                                })}
                              </select>
                              <ChevronDown className={`w-4 h-4 absolute right-3.5 top-4 pointer-events-none ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`} />
                            </div>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              placeholder={field.placeholder}
                              value={currentDraft[field.key as keyof ResumeDraft] as string || ''}
                              rows={4}
                              onChange={(e) => updateDraftMeta(field.key as keyof ResumeDraft, e.target.value)}
                              className={getTextareaClass('mt-1')}
                            />
                          ) : (
                            <div className="relative mt-1">
                              {field.key === 'phone' && currentDraft.phone && getPhoneFlag(currentDraft.phone) && (
                                <span className="absolute left-3.5 top-[14px] text-base z-10 pointer-events-none select-none">
                                  {getPhoneFlag(currentDraft.phone)}
                                </span>
                              )}
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={currentDraft[field.key as keyof ResumeDraft] as string || ''}
                                onChange={(e) => updateDraftMeta(field.key as keyof ResumeDraft, e.target.value)}
                                className={getInputClass(`p-3.5 rounded-xl ${field.key === 'phone' && currentDraft.phone && getPhoneFlag(currentDraft.phone) ? 'pl-11' : ''}`)}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                  {/* HIGH-FIDELITY CUSTOM EXECUTIVES SUMMARY DROPDOWN SECTION */}
                  {!((currentDraft.deletedFields || []).includes('summary')) && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={getCardClass("col-span-1 md:col-span-2")}
                    >
                      {/* Trash Delete field option */}
                      <button
                        type="button"
                        onClick={() => {
                          const deleted = currentDraft.deletedFields || [];
                          updateDraftMeta('deletedFields', [...deleted, 'summary']);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all border border-red-500/20 cursor-pointer opacity-80 hover:opacity-100 z-10"
                        title="Delete field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Header styling */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>Executive Summary</span>
                      </div>

                      {/* Dropdown Container */}
                      <div className="relative mt-2 mb-4 z-30">
                        <label className={`block text-[10px] font-mono font-bold uppercase mb-1.5 flex items-center justify-between ${isDarkMode ? 'text-white/65' : 'text-slate-600'}`}>
                          <span>Select Profile Summary Template:</span>
                          <span className={`text-[9px] lowercase font-normal italic tracking-normal ${isDarkMode ? 'text-amber-300 animate-pulse' : 'text-indigo-650'}`}>Pick one to populate summary field</span>
                        </label>
                        
                        {/* Selector Trigger Button */}
                        <div 
                          onClick={() => setExecutiveSummaryDropdownOpen(!executiveSummaryDropdownOpen)}
                          className={`w-full text-xs p-3.5 border rounded-xl focus:outline-none transition-all flex items-center justify-between cursor-pointer select-none ${
                            isDarkMode 
                              ? 'bg-[#0b132b]/85 border-[#1b2a4a] hover:border-amber-400/50 text-white/90' 
                              : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800'
                          }`}
                        >
                          <span className="truncate">
                            {(() => {
                              const found = EXECUTIVE_SUMMARY_TEMPLATES.find(
                                t => t.text === currentDraft.summary
                              );
                              return found 
                                ? `Template Picked: ${found.title}` 
                                : "Custom Write / Pick a Professional Template...";
                            })()}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-white/50' : 'text-slate-500'} ${executiveSummaryDropdownOpen ? "rotate-180" : ""}`} />
                        </div>

                        {/* Interactive Dropdown List */}
                        <AnimatePresence>
                          {executiveSummaryDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className={`absolute w-full mt-2 border rounded-xl shadow-2xl overflow-hidden z-20 flex flex-col max-h-[300px] ${
                                isDarkMode ? 'bg-[#090e1f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              {/* Search field within dropdown */}
                              <div className={`p-2 border-b flex items-center gap-2 ${isDarkMode ? 'border-white/10 bg-[#0f172a]' : 'border-slate-100 bg-slate-50'}`}>
                                <Search className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? 'text-white/45' : 'text-slate-400'}`} />
                                <input
                                  type="text"
                                  placeholder="Type to filter 25 master categories..."
                                  value={summarySearchQuery}
                                  onChange={(e) => setSummarySearchQuery(e.target.value)}
                                  className={`w-full text-xs bg-transparent border-none outline-none focus:ring-0 p-1 ${
                                    isDarkMode ? 'text-white placeholder-white/30' : 'text-slate-800 placeholder-slate-400'
                                  }`}
                                />
                                {summarySearchQuery && (
                                  <button 
                                    onClick={() => setSummarySearchQuery('')}
                                    className={`text-[10px] rounded px-1.5 py-0.5 ${isDarkMode ? 'text-white/50 hover:text-white bg-white/5' : 'text-slate-500 hover:text-slate-800 bg-slate-150'}`}
                                  >
                                    clear
                                  </button>
                                )}
                              </div>

                              {/* Search results / Items */}
                              <div className={`overflow-y-auto divide-y scrollbar-thin flex-1 ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                                {(() => {
                                  const filtered = EXECUTIVE_SUMMARY_TEMPLATES.filter(
                                    t => t.title.toLowerCase().includes(summarySearchQuery.toLowerCase()) || 
                                         t.text.toLowerCase().includes(summarySearchQuery.toLowerCase())
                                  );

                                  if (filtered.length === 0) {
                                    return (
                                      <div className={`p-4 text-center text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                                        No matching templates found.
                                      </div>
                                    );
                                  }

                                  return filtered.map((t) => {
                                    const isSelected = currentDraft.summary === t.text;
                                    return (
                                      <div
                                        key={t.id}
                                        onClick={() => {
                                          updateDraftMeta('summary', t.text);
                                          setExecutiveSummaryDropdownOpen(false);
                                        }}
                                        className={`p-3.5 text-left text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                                          isSelected 
                                            ? "bg-amber-400/10 hover:bg-amber-400/15 text-amber-600"
                                            : isDarkMode ? "hover:bg-white/5 text-white/80" : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between font-bold text-[11px] font-sans">
                                          <span>{t.id}. {t.title}</span>
                                          {isSelected && (
                                            <span className="text-[10px] bg-amber-400 text-slate-950 font-mono tracking-widest font-extrabold px-1 rounded-sm uppercase scale-90 animate-pulse">
                                              ACTIVE
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10.5px] opacity-70 leading-relaxed truncate-2-lines line-clamp-2">
                                          {t.text}
                                        </p>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Description Multi-line Input Field */}
                      <div className="relative z-10">
                        <div className={`flex justify-between items-center text-[10px] font-mono font-bold mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                          <label className="uppercase tracking-wider">Configure Summary Content:</label>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-emerald-600 px-1 py-0.5 rounded bg-emerald-400/10 font-bold tracking-wider">
                              📡 Ready & Autosaved
                            </span>
                          </div>
                        </div>

                        <textarea
                          placeholder="Write a brief description of your accomplishments, goals, or certifications..."
                          value={currentDraft.summary || ''}
                          rows={4}
                          onChange={(e) => updateDraftMeta('summary', e.target.value)}
                          className={getTextareaClass('')}
                        />

                        {/* Counter and Firebase indications beneath it */}
                        <div className={`flex justify-between items-center mt-2.5 text-[10px] font-mono select-none ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Firebase sandbox active • Local Persistence Ok
                          </span>
                          <span className={`${(currentDraft.summary || '').length > 400 ? 'text-amber-500 font-bold' : ''}`}>
                            {(currentDraft.summary || '').length} chars
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* Render Custom Added Fields list */}
                  {currentDraft.customFields && currentDraft.customFields.map((field) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={getCardClass()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const customs = currentDraft.customFields || [];
                          updateDraftMeta('customFields', customs.filter(f => f.id !== field.id));
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all border border-red-500/20 cursor-pointer"
                        title="Delete custom field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Header section labeling */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Sparkle className={`w-3.5 h-3.5 ${isDarkMode ? 'text-blue-300' : 'text-indigo-600'}`} />
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-blue-200' : 'text-indigo-600'}`}>
                          {field.label || 'Custom Field'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-1">
                        <div className="sm:col-span-4">
                          <label className={`block text-[10px] font-mono font-bold uppercase mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Field Name / Label</label>
                          <input
                            type="text"
                            placeholder="e.g. LinkedIn / License"
                            value={field.label}
                            onChange={(e) => {
                              const customs = currentDraft.customFields || [];
                              const updated = customs.map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                              updateDraftMeta('customFields', updated);
                            }}
                            className={getInputClass('')}
                          />
                        </div>
                        <div className="sm:col-span-8">
                          <label className={`block text-[10px] font-mono font-bold uppercase mb-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Field Value Content</label>
                          <input
                            type="text"
                            placeholder="e.g. linkedin.com/in/username"
                            value={field.value}
                            onChange={(e) => {
                              const customs = currentDraft.customFields || [];
                              const updated = customs.map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                              updateDraftMeta('customFields', updated);
                            }}
                            className={getInputClass('')}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                    </>
                  )}

                  {activeSection === 2 && (
                    <div className="space-y-4 text-white">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none">
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase">Interactive Experience Timeline</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.experiences || [];
                            const newItem = {
                              id: 'exp_' + Date.now(),
                              company: 'Acme Global Inc',
                              position: 'Senior Software Engineer',
                              duration: '06/2022 - Present',
                              details: 'Led high-scale cloud refactoring, improving system capability and query performance.'
                            };
                            updateDraftMeta('experiences', [newItem, ...list]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-mono font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                        >
                          <Plus className="w-3" /> ADD POSITION
                        </button>
                      </div>

                      {(!currentDraft.experiences || currentDraft.experiences.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 font-sans leading-relaxed select-none">
                          {"No experience positions listed yet. Click 'Add Position' to template new entries."}
                        </div>
                      ) : (
                        currentDraft.experiences.map((exp) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.experiences || [];
                                updateDraftMeta('experiences', list.filter(item => item.id !== exp.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5 animate-pulse">Job Title / Position</label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => {
                                    const list = currentDraft.experiences || [];
                                    const updated = list.map(item => item.id === exp.id ? { ...item, position: e.target.value } : item);
                                    updateDraftMeta('experiences', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5 animate-pulse">Company Name</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => {
                                    const list = currentDraft.experiences || [];
                                    const updated = list.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item);
                                    updateDraftMeta('experiences', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-1.5">Duration / Period</label>
                                <DateRangePicker
                                  value={exp.duration || ''}
                                  onChange={(newValue) => {
                                    const list = currentDraft.experiences || [];
                                    const updated = list.map(item => item.id === exp.id ? { ...item, duration: newValue } : item);
                                    updateDraftMeta('experiences', updated);
                                  }}
                                  isDarkMode={isDarkMode}
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5 animate-pulse">Key Responsibilities & Description</label>
                                <textarea
                                  value={exp.details}
                                  rows={3}
                                  onChange={(e) => {
                                    const list = currentDraft.experiences || [];
                                    const updated = list.map(item => item.id === exp.id ? { ...item, details: e.target.value } : item);
                                    updateDraftMeta('experiences', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans leading-relaxed focus:outline-none resize-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 3 && (
                    <div className="space-y-4 text-white">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none">
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase">Education Timeline Records</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.education || [];
                            const newItem = {
                              id: 'edu_' + Date.now(),
                              school: 'Stanford University',
                              degree: 'M.S. in Computer Science',
                              duration: '09/2018 - 06/2020'
                            };
                            updateDraftMeta('education', [newItem, ...list]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-mono font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                        >
                          <Plus className="w-3" /> ADD EDUCATION
                        </button>
                      </div>

                      {(!currentDraft.education || currentDraft.education.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 font-sans select-none">
                          {"No education listings found. Click 'Add Education' to start dynamic entries."}
                        </div>
                      ) : (
                        currentDraft.education.map((edu) => (
                          <motion.div
                            key={edu.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.education || [];
                                updateDraftMeta('education', list.filter(item => item.id !== edu.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all"
                              title="Delete education record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Degree / Certification</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => {
                                    const list = currentDraft.education || [];
                                    const updated = list.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item);
                                    updateDraftMeta('education', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">School / University</label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => {
                                    const list = currentDraft.education || [];
                                    const updated = list.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item);
                                    updateDraftMeta('education', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-1.5">Duration / Period</label>
                                <DateRangePicker
                                  value={edu.duration || ''}
                                  onChange={(newValue) => {
                                    const list = currentDraft.education || [];
                                    const updated = list.map(item => item.id === edu.id ? { ...item, duration: newValue } : item);
                                    updateDraftMeta('education', updated);
                                  }}
                                  isDarkMode={isDarkMode}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 4 && (
                    <div className="space-y-4 text-white">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none">
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          Professional Skills & Recommendations
                        </span>
                        <button
                          type="button"
                          disabled={isSuggesting}
                          onClick={() => triggerSuggestSkills(currentDraft, true)}
                          className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${isSuggesting ? 'animate-spin' : ''}`} />
                          RE-CALCULATE
                        </button>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 text-xs relative">
                        {/* Auto suggestions section based on profile */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[10px] font-mono font-bold text-white/70 uppercase">
                              Profile Auto-Suggested Skills (Discovered):
                            </label>
                            <span className="text-[9px] font-mono opacity-50">Derived from Education, Experience, & Projects</span>
                          </div>

                          {suggestedSkillsError && (
                            <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl font-mono text-[11px] leading-relaxed select-none">
                              ⚠️ {suggestedSkillsError}
                            </div>
                          )}
                          
                          {isSuggesting && suggestedSkills.length === 0 ? (
                            <div className="flex items-center gap-2 py-3 px-4 bg-white/2 rounded-xl text-xs text-white/50 border border-white/5 animate-pulse font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                              Analyzing resume data logs...
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {suggestedSkills.map((s) => {
                                const isAdded = (currentDraft.skills || []).includes(s);
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      const list = currentDraft.skills || [];
                                      if (isAdded) {
                                        updateDraftMeta('skills', list.filter(item => item !== s));
                                      } else {
                                        updateDraftMeta('skills', [...list, s]);
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sans border transition-all cursor-pointer select-none 
                                      ${isAdded 
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/35' 
                                        : 'bg-white/5 text-white/80 border-white/10 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40'}`}
                                  >
                                    {isAdded ? '✓' : '+'} {s}
                                  </button>
                                );
                              })}
                              {suggestedSkills.length === 0 && !isSuggesting && (
                                <p className="text-white/40 italic text-[11px] py-1">Type in details in Education & Experience sections to see automatic contextual skill recommendations!</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Searchable dropdown input search bar */}
                        <div className="space-y-1.5 relative">
                          <label className="block text-[10px] font-mono font-bold text-white/60 uppercase">
                            Direct Custom Entry or Search Suggested Skills Dropdown:
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder="Search suggestions, select from dropdown, or type custom skill..."
                                value={skillsSearchQuery}
                                onFocus={() => setIsSkillsDropdownOpen(true)}
                                onChange={(e) => {
                                  setSkillsSearchQuery(e.target.value);
                                  setIsSkillsDropdownOpen(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = skillsSearchQuery.trim();
                                    if (val) {
                                      const list = currentDraft.skills || [];
                                      if (!list.includes(val)) {
                                        updateDraftMeta('skills', [...list, val]);
                                      }
                                      setSkillsSearchQuery('');
                                      setIsSkillsDropdownOpen(false);
                                    }
                                  }
                                }}
                                className="w-full text-xs p-3 bg-[#0b132b]/50 border border-white/20 rounded-xl focus:outline-none text-white focus:border-blue-400 placeholder-white/30"
                              />

                              {/* Search Dropdown Overlay list */}
                              {isSkillsDropdownOpen && (
                                <div className="absolute z-[100] left-0 right-0 mt-1.5 bg-[#0e1628] border border-white/15 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-white/5 backdrop-blur-md">
                                  {/* Filter and display matchings */}
                                  {(() => {
                                    const query = skillsSearchQuery.toLowerCase().trim();
                                    // Combine some dynamic default tags if suggestion lists are blank
                                    const referencePool = Array.from(new Set([
                                      ...suggestedSkills,
                                      'React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 
                                      'PostgreSQL', 'MongoDB', 'Python', 'Machine Learning', 'DevOps', 
                                      'Docker', 'AWS', 'Project Management', 'Agile Methodologies'
                                    ]));
                                    
                                    const filtered = referencePool.filter(s => s.toLowerCase().includes(query));

                                    return (
                                      <>
                                        {query && !filtered.some(s => s.toLowerCase() === query) && (
                                          <div
                                            key="custom-add-item"
                                            onClick={() => {
                                              const list = currentDraft.skills || [];
                                              if (!list.includes(skillsSearchQuery.trim())) {
                                                updateDraftMeta('skills', [...list, skillsSearchQuery.trim()]);
                                              }
                                              setSkillsSearchQuery('');
                                              setIsSkillsDropdownOpen(false);
                                            }}
                                            className="p-3 text-xs text-blue-300 font-mono font-bold cursor-pointer hover:bg-white/5 flex items-center transition-all gap-1.5"
                                          >
                                            <Plus className="w-3" /> Add Custom Skill: &quot;{skillsSearchQuery.trim()}&quot;
                                          </div>
                                        )}
                                        {filtered.map(s => {
                                          const isActive = (currentDraft.skills || []).includes(s);
                                          return (
                                            <div
                                              key={s}
                                              onClick={() => {
                                                const list = currentDraft.skills || [];
                                                if (isActive) {
                                                  updateDraftMeta('skills', list.filter(item => item !== s));
                                                } else {
                                                  updateDraftMeta('skills', [...list, s]);
                                                }
                                                setSkillsSearchQuery('');
                                                setIsSkillsDropdownOpen(false);
                                              }}
                                              className="p-3 text-xs text-white/80 cursor-pointer hover:bg-white/5 flex items-center justify-between transition-all"
                                            >
                                              <span className="font-medium">{s}</span>
                                              {isActive ? (
                                                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25 flex items-center gap-1">✓ Added</span>
                                              ) : (
                                                <span className="text-[10px] font-mono text-white/30 flex items-center gap-1">+ Choose</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                        {filtered.length === 0 && !query && (
                                          <div className="p-3 text-xs text-white/30 italic text-center animate-pulse">No reference keywords matched. Try typing a custom entry...</div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const val = skillsSearchQuery.trim();
                                if (val) {
                                  const list = currentDraft.skills || [];
                                  if (!list.includes(val)) {
                                    updateDraftMeta('skills', [...list, val]);
                                  }
                                  setSkillsSearchQuery('');
                                  setIsSkillsDropdownOpen(false);
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold font-mono rounded-xl border border-blue-500/20 text-white cursor-pointer select-none transition-all flex items-center"
                            >
                              ADD
                            </button>
                          </div>
                          {/* Close overlay click guardian list */}
                          {isSkillsDropdownOpen && (
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsSkillsDropdownOpen(false)} />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold text-white/50 uppercase mb-2.5">Current Applied Skills Badges (Click to Remove):</label>
                          {(!currentDraft.skills || currentDraft.skills.length === 0) ? (
                            <p className="text-xs text-white/30 italic text-center p-4 bg-white/2 rounded-lg border border-white/5">No skills currently added to your CV. Search, type, or toggle recommended skills above!</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {currentDraft.skills.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 text-blue-200 border border-blue-500/30 text-xs rounded-full font-bold select-none hover:bg-red-950/40 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer"
                                  onClick={() => {
                                    const list = currentDraft.skills || [];
                                    updateDraftMeta('skills', list.filter(item => item !== s));
                                  }}
                                  title="Click to remove skill"
                                >
                                  ⚡ {s}
                                  <span className="text-[10px] font-mono text-white/40 font-normal">×</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 5 && (
                    <div className="space-y-4 text-white font-sans text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none font-mono">
                        <span className="text-xs font-bold text-blue-300 uppercase">Key Projects & Initiatives</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.projects || [];
                            const newItem = {
                              id: 'proj_' + Date.now(),
                              title: 'AI Smart Search Engine',
                              role: 'Principal Architect',
                              duration: '2024 - 2025',
                              details: 'Re-designed query-matching architecture using custom embedding indexing, boosting latency by 35%.'
                            };
                            updateDraftMeta('projects', [newItem, ...list]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                        >
                          <Plus className="w-3" /> ADD PROJECT
                        </button>
                      </div>

                      {(!currentDraft.projects || currentDraft.projects.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 select-none">
                          {"No projects recorded. Click 'Add Project' to begin inputting assignments."}
                        </div>
                      ) : (
                        currentDraft.projects.map((proj) => (
                          <motion.div
                            key={proj.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.projects || [];
                                updateDraftMeta('projects', list.filter(item => item.id !== proj.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Project Title Name</label>
                                <input
                                  type="text"
                                  value={proj.title}
                                  onChange={(e) => {
                                    const list = currentDraft.projects || [];
                                    const updated = list.map(item => item.id === proj.id ? { ...item, title: e.target.value } : item);
                                    updateDraftMeta('projects', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Candidate Role</label>
                                <input
                                  type="text"
                                  value={proj.role || ''}
                                  onChange={(e) => {
                                    const list = currentDraft.projects || [];
                                    const updated = list.map(item => item.id === proj.id ? { ...item, role: e.target.value } : item);
                                    updateDraftMeta('projects', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Duration</label>
                                <input
                                  type="text"
                                  value={proj.duration || ''}
                                  onChange={(e) => {
                                    const list = currentDraft.projects || [];
                                    const updated = list.map(item => item.id === proj.id ? { ...item, duration: e.target.value } : item);
                                    updateDraftMeta('projects', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Description & Key Deliverables</label>
                                <textarea
                                  value={proj.details}
                                  rows={3}
                                  onChange={(e) => {
                                    const list = currentDraft.projects || [];
                                    const updated = list.map(item => item.id === proj.id ? { ...item, details: e.target.value } : item);
                                    updateDraftMeta('projects', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans leading-relaxed focus:outline-none resize-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 6 && (
                    <div className="space-y-4 text-white font-sans text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none font-mono">
                        <span className="text-xs font-bold text-blue-300 uppercase">Certifications & Credentials</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.certifications || [];
                            const newItem = {
                              id: 'cert_' + Date.now(),
                              title: 'AWS Professional Solutions Architect',
                              issuer: 'Amazon Web Services',
                              date: '2025'
                            };
                            updateDraftMeta('certifications', [newItem, ...list]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer border border-blue-500/25 transition-all"
                        >
                          <Plus className="w-3" /> ADD CREDENTIAL
                        </button>
                      </div>

                      {(!currentDraft.certifications || currentDraft.certifications.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 select-none">
                          {"No certifications listed. Click 'Add Credential' to list qualifications."}
                        </div>
                      ) : (
                        currentDraft.certifications.map((cert) => (
                          <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.certifications || [];
                                updateDraftMeta('certifications', list.filter(item => item.id !== cert.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all"
                              title="Delete certification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Certification / License Title</label>
                                <input
                                  type="text"
                                  value={cert.title}
                                  onChange={(e) => {
                                    const list = currentDraft.certifications || [];
                                    const updated = list.map(item => item.id === cert.id ? { ...item, title: e.target.value } : item);
                                    updateDraftMeta('certifications', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Issuing Authority</label>
                                <input
                                  type="text"
                                  value={cert.issuer}
                                  onChange={(e) => {
                                    const list = currentDraft.certifications || [];
                                    const updated = list.map(item => item.id === cert.id ? { ...item, issuer: e.target.value } : item);
                                    updateDraftMeta('certifications', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Award Date</label>
                                <input
                                  type="text"
                                  value={cert.date}
                                  onChange={(e) => {
                                    const list = currentDraft.certifications || [];
                                    const updated = list.map(item => item.id === cert.id ? { ...item, date: e.target.value } : item);
                                    updateDraftMeta('certifications', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 7 && (
                    <div className="space-y-4 text-white font-sans text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none font-mono">
                        <span className="text-xs font-bold text-blue-300 uppercase">Training, Online Courses & Awards</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.trainings || [];
                            const newItem = {
                              id: 'train_' + Date.now(),
                              title: 'Professional Specialization Course',
                              provider: 'E-Learning Platform',
                              date: '2026',
                              details: ''
                            };
                            updateDraftMeta('trainings', [newItem, ...list]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer border border-blue-500/25 transition-all"
                        >
                          <Plus className="w-3" /> ADD TRAINING / COURSE
                        </button>
                      </div>

                      {(!currentDraft.trainings || currentDraft.trainings.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 font-sans select-none">
                          {"No attended trainings or online courses specified. Click 'Add Training' to setup."}
                        </div>
                      ) : (
                        currentDraft.trainings.map((trn) => (
                          <motion.div
                            key={trn.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.trainings || [];
                                updateDraftMeta('trainings', list.filter(item => item.id !== trn.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all font-mono font-bold"
                              title="Delete training"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Training / Course / Award Title</label>
                                <input
                                  type="text"
                                  value={trn.title || ''}
                                  onChange={(e) => {
                                    const list = currentDraft.trainings || [];
                                    const updated = list.map(item => item.id === trn.id ? { ...item, title: e.target.value } : item);
                                    updateDraftMeta('trainings', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Completion Date / Year</label>
                                <input
                                  type="text"
                                  value={trn.date || ''}
                                  placeholder="e.g. 2026 or Jan 2026"
                                  onChange={(e) => {
                                    const list = currentDraft.trainings || [];
                                    const updated = list.map(item => item.id === trn.id ? { ...item, date: e.target.value } : item);
                                    updateDraftMeta('trainings', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Issuing Provider / Institution</label>
                                <input
                                  type="text"
                                  value={trn.provider || ''}
                                  onChange={(e) => {
                                    const list = currentDraft.trainings || [];
                                    const updated = list.map(item => item.id === trn.id ? { ...item, provider: e.target.value } : item);
                                    updateDraftMeta('trainings', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Key Achievements, Learnings & Details (Optional)</label>
                                <textarea
                                  value={trn.details || ''}
                                  rows={2}
                                  onChange={(e) => {
                                    const list = currentDraft.trainings || [];
                                    const updated = list.map(item => item.id === trn.id ? { ...item, details: e.target.value } : item);
                                    updateDraftMeta('trainings', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans leading-relaxed focus:outline-none resize-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 8 && (
                    <div className="space-y-4 text-white text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 select-none font-mono">
                        <span className="text-xs font-mono font-bold text-blue-300 uppercase">Languages Proficiency</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = currentDraft.languages || [];
                            const newItem = {
                              id: 'lang_' + Date.now(),
                              name: 'English',
                              proficiency: 'Native'
                            };
                            updateDraftMeta('languages', [...list, newItem]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-mono font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                        >
                          <Plus className="w-3" /> ADD LANGUAGE
                        </button>
                      </div>

                      {(!currentDraft.languages || currentDraft.languages.length === 0) ? (
                        <div className="p-8 text-center text-xs text-white/30 bg-white/5 rounded-2xl border border-white/5 font-sans select-none">
                          {"No languages specified. Click 'Add Language' to setup."}
                        </div>
                      ) : (
                        currentDraft.languages.map((l) => (
                          <motion.div
                            key={l.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative group hover:bg-white/8 transition-all shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const list = currentDraft.languages || [];
                                updateDraftMeta('languages', list.filter(item => item.id !== l.id));
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/35 text-red-300 text-xs cursor-pointer border border-red-500/10 transition-all font-mono font-bold"
                              title="Delete language"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Language Name</label>
                                <input
                                  type="text"
                                  value={l.name || ''}
                                  onChange={(e) => {
                                    const list = currentDraft.languages || [];
                                    const updated = list.map(item => item.id === l.id ? { ...item, name: e.target.value } : item);
                                    updateDraftMeta('languages', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-mono font-bold text-white/50 uppercase mb-0.5">Proficiency Level</label>
                                <select
                                  value={l.proficiency || 'Native'}
                                  onChange={(e) => {
                                    const list = currentDraft.languages || [];
                                    const updated = list.map(item => item.id === l.id ? { ...item, proficiency: e.target.value } : item);
                                    updateDraftMeta('languages', updated);
                                  }}
                                  className="w-full text-xs p-2.5 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                >
                                  <option value="Native">Native / Bilingual</option>
                                  <option value="Professional">Professional Working</option>
                                  <option value="Conversational">Conversational</option>
                                  <option value="Elementary">Elementary</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {activeSection === 9 && (
                    <div className="space-y-6 text-white font-sans text-xs">
                      
                      {/* REFERENCES */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none font-mono">
                          <span className="text-xs font-bold text-blue-300 uppercase">Professional References</span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = currentDraft.references || [];
                              const newItem = {
                                id: 'ref_' + Date.now(),
                                name: 'Sarah Connor',
                                organization: 'Cyberdyne Systems Corp',
                                contact: 'sarah@cyberdyne.com'
                              };
                              updateDraftMeta('references', [...list, newItem]);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[9px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                          >
                            <Plus className="w-3" /> ADD REFERENCE
                          </button>
                        </div>

                        {(!currentDraft.references || currentDraft.references.length === 0) ? (
                          <div className="p-5 text-center text-xs text-white/30 bg-white/2 rounded-xl select-none">
                            {"No references added yet. Click 'Add Reference' above."}
                          </div>
                        ) : (
                          currentDraft.references.map((r) => (
                            <motion.div
                              key={r.id}
                              className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2.5 relative group text-white hover:bg-white/8 transition-all shadow-md"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const list = currentDraft.references || [];
                                  updateDraftMeta('references', list.filter(item => item.id !== r.id));
                                }}
                                className="absolute top-3 right-3 p-1.5 rounded bg-red-500/10 hover:bg-red-500/30 text-red-100 text-[10px] cursor-pointer border border-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Reference Name</label>
                                  <input
                                    type="text"
                                    value={r.name || ''}
                                    onChange={(e) => {
                                      const list = currentDraft.references || [];
                                      const updated = list.map(item => item.id === r.id ? { ...item, name: e.target.value } : item);
                                      updateDraftMeta('references', updated);
                                    }}
                                    className="w-full text-xs p-2 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Organization</label>
                                  <input
                                    type="text"
                                    value={r.organization || ''}
                                    onChange={(e) => {
                                      const list = currentDraft.references || [];
                                      const updated = list.map(item => item.id === r.id ? { ...item, organization: e.target.value } : item);
                                      updateDraftMeta('references', updated);
                                    }}
                                    className="w-full text-xs p-2 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Contact coordinates</label>
                                  <input
                                    type="text"
                                    value={r.contact || ''}
                                    onChange={(e) => {
                                      const list = currentDraft.references || [];
                                      const updated = list.map(item => item.id === r.id ? { ...item, contact: e.target.value } : item);
                                      updateDraftMeta('references', updated);
                                    }}
                                    className="w-full text-xs p-2 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 font-sans"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* SOCIAL LINKS AND NETWORKS */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none font-mono">
                          <span className="text-xs font-bold text-blue-300 uppercase">Social & Professional Networks</span>
                          <button
                            type="button"
                            onClick={() => {
                              const list = currentDraft.socialLinks || [];
                              const newItem = {
                                id: 'soc_' + Date.now(),
                                platform: 'LinkedIn',
                                url: 'https://linkedin.com/in/unique-profile'
                              };
                              updateDraftMeta('socialLinks', [...list, newItem]);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[9px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all border border-blue-500/25"
                          >
                            <Plus className="w-3" /> ADD NETWORK LINK
                          </button>
                        </div>

                        {(!currentDraft.socialLinks || currentDraft.socialLinks.length === 0) ? (
                          <div className="p-5 text-center text-xs text-white/30 bg-white/2 rounded-xl select-none">
                            {"No network links added. Click 'Add Network Link' above."}
                          </div>
                        ) : (
                          currentDraft.socialLinks.map((s) => (
                            <motion.div
                              key={s.id}
                              className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2.5 relative group text-white hover:bg-white/8 transition-all shadow-md"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const list = currentDraft.socialLinks || [];
                                  updateDraftMeta('socialLinks', list.filter(item => item.id !== s.id));
                                }}
                                className="absolute top-3 right-3 p-1 rounded bg-red-500/10 hover:bg-red-500/30 text-red-100 text-xs cursor-pointer border border-red-500/10 transition-all"
                              >
                                <Trash2 className="w-3" />
                              </button>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white">
                                <div>
                                  <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Platform Network Name</label>
                                  <select
                                    value={s.platform || 'LinkedIn'}
                                    onChange={(e) => {
                                      const list = currentDraft.socialLinks || [];
                                      const updated = list.map(item => item.id === s.id ? { ...item, platform: e.target.value } : item);
                                      updateDraftMeta('socialLinks', updated);
                                    }}
                                    className="w-full text-xs p-2.5 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                                  >
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="GitHub">GitHub</option>
                                    <option value="Portfolio">Portfolio Website</option>
                                    <option value="X">X (Twitter)</option>
                                    <option value="Dribbble">Dribbble</option>
                                    <option value="Behance font-sans">Behance</option>
                                    <option value="Other">Other Profile</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Profile URL</label>
                                  <input
                                    type="text"
                                    value={s.url || ''}
                                    onChange={(e) => {
                                      const list = currentDraft.socialLinks || [];
                                      const updated = list.map(item => item.id === s.id ? { ...item, url: e.target.value } : item);
                                      updateDraftMeta('socialLinks', updated);
                                    }}
                                    className="w-full text-xs p-2.5 bg-[#0b132b]/55 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 font-sans"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                  {activeSection === 10 && (
                    <div className="space-y-6 text-white font-sans text-xs">
                      {((currentDraft.deletedFields || []).includes('coverLetter')) ? (
                        <div id="cover_letter_deleted_state" className="p-8 rounded-2xl bg-slate-900/40 border border-red-500/15 text-center space-y-4 select-none my-2">
                          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="space-y-1.5 animate-fade-in">
                            <h4 className="text-sm font-extrabold tracking-tight font-display text-white">Cover Letter is Currently Deleted/Disabled</h4>
                            <p className="text-[10.5px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                              You have excluded the cover letter from this document suite. It won&apos;t compile to printable page list or export with your resume.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const deleted = currentDraft.deletedFields || [];
                              updateDraftMeta('deletedFields', deleted.filter(k => k !== 'coverLetter'));
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 border border-indigo-500/20 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Re-enable Cover Letter</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* CONTROL BANNER TO EXCLUDE/DELETE COVER LETTER */}
                          <div id="cover_letter_active_banner" className="p-3.5 rounded-2xl bg-slate-900/30 border border-white/5 flex items-center justify-between gap-3 select-none">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                                <Mail className="w-4 h-4 animate-pulse" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-mono font-bold text-indigo-300 block tracking-wider leading-none">Structure Status</span>
                                <span className="text-[11px] font-sans text-white/95 font-extrabold block mt-1">Included in Document Suite</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const deleted = currentDraft.deletedFields || [];
                                updateDraftMeta('deletedFields', [...deleted, 'coverLetter']);
                              }}
                              className="px-3.5 py-2 text-[10.5px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-650/80 border border-red-500/20 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Exclude / Delete</span>
                            </button>
                          </div>

                          {/* PRE-WRITTEN TEMPLATES SELECTOR */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none font-mono">
                              <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 25 Professional Cover Letter Presets
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                              Select one of these pre-configured templates to populate your Cover Letter instantly. You can then edit and customize the content to fit your specific needs.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 max-h-56 overflow-y-auto scrollbar-thin pr-1 pb-1">
                              {COVER_LETTER_TEMPLATES.map((tpl) => (
                                <button
                                  key={tpl.id}
                                  type="button"
                                  onClick={() => {
                                    const baseBody = tpl.bodyText || tpl.text || '';
                                    updateDraftMeta('coverLetter', baseBody);
                                    updateDraftMeta('clBody', baseBody);
                                    if (tpl.subject) updateDraftMeta('clSubject', tpl.subject);
                                    if (tpl.greeting) updateDraftMeta('clGreeting', tpl.greeting);
                                    if (tpl.closing) updateDraftMeta('clClosing', tpl.closing);
                                    updateDraftMeta('clSenderName', currentDraft.fullName || 'Siraj Ahmed');
                                    updateDraftMeta('clSenderAddress', currentDraft.address || 'Dubai, UAE');
                                    updateDraftMeta('clEmail', currentDraft.email || 'siraj@example.com');
                                    updateDraftMeta('clPhone', currentDraft.phone || '+971 501 2345');
                                    updateDraftMeta('clSignature', currentDraft.fullName || 'Siraj Ahmed');
                                    updateDraftMeta('clRecipientName', 'Hiring Manager');
                                    updateDraftMeta('clCompanyName', 'Target Company');
                                    updateDraftMeta('clPositionTitle', currentDraft.professionalTitle || 'Target Position');
                                    updateDraftMeta('clDate', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
                                  }}
                                  className="p-3 text-left rounded-xl border border-white/10 bg-white/5 hover:bg-slate-800 hover:border-indigo-500 transition-all cursor-pointer group flex flex-col justify-between min-h-20 text-white"
                                >
                                  <span className="font-mono text-[10px] font-bold text-white group-hover:text-amber-300 transition-colors">
                                    {tpl.title}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-mono mt-1">
                                    Click to Auto-fill
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* STRUCTURED LETTER COORDS */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none font-mono">
                              <span className="text-xs font-bold text-blue-300 uppercase">Cover Letter Editable Fields</span>
                              <span className="text-[9px] text-slate-400 uppercase">structured layout</span>
                            </div>

                            <div className="bg-[#0b132b]/30 border border-white/5 rounded-2xl p-4.5 space-y-4">
                              
                              {/* SENDER DETAILS */}
                              <div>
                                <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider block mb-2">1. Sender Coordinates</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Sender Name</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clSenderName !== undefined ? currentDraft.clSenderName : (currentDraft.fullName || '')}
                                      placeholder="Siraj Ahmed"
                                      onChange={(e) => updateDraftMeta('clSenderName', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Sender Address</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clSenderAddress !== undefined ? currentDraft.clSenderAddress : (currentDraft.address || '')}
                                      placeholder="Dubai, UAE"
                                      onChange={(e) => updateDraftMeta('clSenderAddress', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Sender Email</label>
                                    <input
                                      type="email"
                                      value={currentDraft.clEmail !== undefined ? currentDraft.clEmail : (currentDraft.email || '')}
                                      placeholder="siraj@example.com"
                                      onChange={(e) => updateDraftMeta('clEmail', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Sender Phone</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clPhone !== undefined ? currentDraft.clPhone : (currentDraft.phone || '')}
                                      placeholder="+971 501 2345"
                                      onChange={(e) => updateDraftMeta('clPhone', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* RECIPIENT DETAILS */}
                              <div className="border-t border-white/5 pt-3.5">
                                <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider block mb-2">2. Recipient & Date</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Date of Letter</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clDate !== undefined ? currentDraft.clDate : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                      placeholder="June 20, 2026"
                                      onChange={(e) => updateDraftMeta('clDate', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Recipient Name</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clRecipientName || ''}
                                      placeholder="Hiring Manager / Recruiting Team"
                                      onChange={(e) => updateDraftMeta('clRecipientName', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Company Name</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clCompanyName || ''}
                                      placeholder="Target Corporation"
                                      onChange={(e) => updateDraftMeta('clCompanyName', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Position Title</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clPositionTitle || ''}
                                      placeholder="Senior Solutions Architect"
                                      onChange={(e) => updateDraftMeta('clPositionTitle', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* CONTENT FIELDS */}
                              <div className="border-t border-white/5 pt-3.5 space-y-3">
                                <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider block mb-1">3. Letter Content</span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Subject Line</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clSubject || ''}
                                      placeholder="Re: Application for Senior Solutions Architect"
                                      onChange={(e) => updateDraftMeta('clSubject', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Salutation / Greeting</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clGreeting || ''}
                                      placeholder="Dear Hiring Manager"
                                      onChange={(e) => updateDraftMeta('clGreeting', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-1 select-none font-mono">
                                    <label className="text-[8px] font-mono font-bold text-white/50 uppercase">Body Paragraphs</label>
                                    <span className="text-[8px] text-slate-400">
                                      {((currentDraft.clBody || currentDraft.coverLetter) || '').length} characters
                                    </span>
                                  </div>
                                  <textarea
                                    value={currentDraft.clBody || currentDraft.coverLetter || ''}
                                    onChange={(e) => {
                                      updateDraftMeta('clBody', e.target.value);
                                      updateDraftMeta('coverLetter', e.target.value);
                                    }}
                                    rows={8}
                                    placeholder="Write the main paragraphs of your cover letter..."
                                    className="w-full text-xs p-3 bg-slate-950/60 border border-white/10 focus:border-blue-405 rounded-lg text-white focus:outline-none placeholder-white/20 font-mono leading-relaxed resize-y"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Sign-off Closing Statement</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clClosing || ''}
                                      placeholder="Sincerely"
                                      onChange={(e) => updateDraftMeta('clClosing', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/50 uppercase mb-0.5">Signature Name</label>
                                    <input
                                      type="text"
                                      value={currentDraft.clSignature !== undefined ? currentDraft.clSignature : (currentDraft.fullName || '')}
                                      placeholder="Siraj Ahmed"
                                      onChange={(e) => updateDraftMeta('clSignature', e.target.value)}
                                      className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 rounded-lg text-white font-sans focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                </div>

                              </div>

                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>

                {/* ADD CUSTOM FIELD BUTTON */}
                {activeSection === 1 && (
                  <div className="pt-2 text-center select-none">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const customs = currentDraft.customFields || [];
                        const newField = {
                          id: 'custom_' + Date.now(),
                          label: 'Custom Field',
                          value: ''
                        };
                        updateDraftMeta('customFields', [...customs, newField]);
                      }}
                      className="px-6 py-3.5 rounded-xl border border-dashed border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-xs font-bold font-mono text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-300" />
                      <span>ADD OTHER CUSTOM FIELD</span>
                    </motion.button>
                  </div>
                )}

                {/* RESTORE DELETED/REMOVED CORE DEFAULTS */}
                {(() => {
                  const defaultKeys = [
                    { key: 'profilePhoto', label: 'Photo Upload' },
                    { key: 'fullName', label: 'Full Name' },
                    { key: 'professionalTitle', label: 'Professional Title' },
                    { key: 'nationality', label: 'Nationality' },
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'maritalStatus', label: 'Marital Status' },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'email', label: 'Email Address' },
                    { key: 'address', label: 'Address' },
                    { key: 'summary', label: 'Executive Summary' }
                  ];
                  const removed = defaultKeys.filter(k => (currentDraft.deletedFields || []).includes(k.key));
                  if (removed.length === 0) return null;

                  return (
                    <div className="border-t border-white/10 pt-5 space-y-2 select-none">
                      <p className="text-[10px] font-mono font-bold text-blue-200/50 uppercase tracking-widest">
                        Restore Deleted Default Fields:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {removed.map(item => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              const deleted = currentDraft.deletedFields || [];
                              updateDraftMeta('deletedFields', deleted.filter(k => k !== item.key));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/30 text-[10.5px] font-bold text-blue-200 transition-all flex items-center gap-1.5"
                          >
                            <Plus className="w-3 h-3 text-emerald-400" /> {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* RIGHT COLUMN: HIGH-FIDELITY LIVE PREVIEW (Smartphone simulated layout card) */}
              <div className={`lg:col-span-5 p-6 flex flex-col justify-between max-h-[580px] overflow-y-auto scrollbar-thin relative border-l bg-transparent ${
                isDarkMode ? 'border-white/5' : 'border-slate-205'
              }`}>
                
                {/* Floating ambient orb */}
                <div className="absolute top-10 right-10 w-28 h-28 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 select-none no-print">
                    <span className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin duration-3000" /> LIVE A4 PREVIEW CONTAINER
                    </span>
                    <span className="text-[9px] font-mono font-extrabold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 animate-pulse">
                      VERIFIED REAL-TIME
                    </span>
                  </div>

                  {/* ATS REAL-TIME SCORE OPTIMIZER PANELS */}
                  {(() => {
                    const analysis = getAtsAnalysis(currentDraft, targetJobDescription);
                    const getRingColor = (score: number) => {
                      if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
                      if (score >= 60) return 'text-amber-400 stroke-amber-400';
                      return 'text-rose-400 stroke-rose-400';
                    };

                    return (
                      <div className={`mb-6 rounded-2xl border overflow-hidden backdrop-blur-md no-print transition-all duration-300 ${
                        activeThemeId === 'cyber-ai'
                          ? 'border-cyan-500/35 bg-[#030814]/85 shadow-[0_0_30px_rgba(0,242,254,0.12)] hover:border-pink-500/40 hover:shadow-[0_0_40px_rgba(236,72,153,0.18)]'
                          : activeThemeId === 'apple-vision-pro'
                            ? 'border-white/20 bg-white/5 shadow-[0_15px_35px_rgba(255,255,255,0.03)] hover:border-white/30 hover:bg-white/10'
                            : activeThemeId === 'neon-glass-pro'
                              ? 'border-purple-500/20 bg-[#090620]/30 shadow-[0_0_30px_rgba(139,92,246,0.12)] hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.18)]'
                              : 'border-white/10 bg-slate-900/40 shadow-xl'
                      }`}>
                        {/* Header Banner - Collapsible Trigger */}
                        <div 
                          onClick={() => setIsAtsPanelExpanded(!isAtsPanelExpanded)}
                          className={`px-4.5 py-3.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                            activeThemeId === 'cyber-ai'
                              ? 'bg-cyan-950/20 hover:bg-cyan-900/25'
                              : activeThemeId === 'apple-vision-pro'
                                ? 'bg-white/5 hover:bg-white/10'
                                : activeThemeId === 'neon-glass-pro'
                                  ? 'bg-purple-950/20 hover:bg-purple-900/25'
                                  : 'bg-slate-950/25 hover:bg-slate-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Circular dynamic progress gauge */}
                            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                              <svg className="w-10 h-10 transform -rotate-90">
                                <circle 
                                  className="text-slate-800" 
                                  strokeWidth="3.5" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="16" 
                                  cx="20" 
                                  cy="20"
                                />
                                <motion.circle 
                                  className={`${getRingColor(analysis.score)} ${
                                    activeThemeId === 'cyber-ai' ? 'drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]' : activeThemeId === 'apple-vision-pro' ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]' : activeThemeId === 'neon-glass-pro' ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]' : ''
                                  }`}
                                  strokeWidth="3.5" 
                                  strokeDasharray="100"
                                  initial={{ strokeDashoffset: 100 }}
                                  animate={{ strokeDashoffset: [100, 100 - (analysis.score || 0)] }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  strokeLinecap="round" 
                                  stroke="currentColor" 
                                  fill="transparent" 
                                  r="16" 
                                  cx="20" 
                                  cy="20"
                                />
                              </svg>
                              <span className={`absolute text-[10px] font-mono font-black ${
                                activeThemeId === 'cyber-ai' ? 'text-cyan-300 drop-shadow-[0_0_3px_rgba(6,182,212,0.5)]' : activeThemeId === 'apple-vision-pro' ? 'text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]' : activeThemeId === 'neon-glass-pro' ? 'text-cyan-300 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]' : 'text-white'
                              }`}>{analysis.score}%</span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-mono font-bold tracking-tight text-white uppercase">ATS Optimization Score</h4>
                                {analysis.score >= 80 && (
                                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-505/10 text-emerald-400 border border-emerald-500/20 rounded animate-pulse">Good Match</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                                {analysis.score < 60 ? 'Needs improvement.' : analysis.score < 80 ? 'Decent. Add achievements/metrics.' : 'Excellent formatting and details.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {targetJobDescription.trim().length > 0 && (
                              <div className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-amber-300 border border-indigo-500/20 rounded-md">
                                Overlap: {analysis.keywordMatchRate}%
                              </div>
                            )}
                            <div className="p-1 rounded-lg bg-white/5 border border-white/5 text-slate-400">
                              <ChevronDown className={`w-4 h-4 transition-transform ${isAtsPanelExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </div>

                        {/* Collapsible content pane */}
                        <AnimatePresence>
                          {isAtsPanelExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="border-t border-white/5 overflow-hidden"
                            >
                              <div className="p-4.5 space-y-4 text-xs">
                                {/* Segment 1: Target Matcher input */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                      <Search className="w-3 h-3 text-indigo-400" /> Target Job Description
                                    </label>
                                    {targetJobDescription.trim().length > 0 && (
                                      <button 
                                        onClick={() => setTargetJobDescription('')}
                                        className="text-[9px] font-mono text-rose-400 hover:underline"
                                      >
                                        Clear Job Spec
                                      </button>
                                    )}
                                  </div>
                                  <textarea
                                    value={targetJobDescription}
                                    onChange={(e) => setTargetJobDescription(e.target.value)}
                                    placeholder="Paste target job description to run keyword matching against your resume..."
                                    className={`w-full h-20 text-[10.5px] p-2.5 border rounded-xl text-white outline-none resize-none font-sans placeholder-slate-500 transition-all duration-300 ${
                                      activeThemeId === 'cyber-ai'
                                        ? 'bg-[#020612]/70 border-cyan-500/25 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.25)] font-mono text-cyan-200'
                                        : activeThemeId === 'apple-vision-pro'
                                          ? 'bg-white/5 border-white/10 focus:border-white focus:bg-white/10 placeholder-white/30 text-white'
                                          : activeThemeId === 'neon-glass-pro'
                                            ? 'bg-[#090620]/45 border-purple-500/25 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                                            : 'bg-slate-950/60 border-white/10 focus:border-indigo-500/50'
                                    }`}
                                  />
                                </div>

                                {/* Segment 2: Keywords pills if job desc provided */}
                                {targetJobDescription.trim().length > 0 && (
                                  <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/25 border border-white/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Dynamic keyword scanner</span>
                                      <span className="text-[10px] font-mono text-indigo-300 font-bold">Match Rate: {analysis.keywordMatchRate}%</span>
                                    </div>
                                    
                                    {/* Found Keywords */}
                                    {analysis.foundKeywords.length > 0 && (
                                      <div className="space-y-1">
                                        <div className="text-[8px] font-mono tracking-widest uppercase text-emerald-400 font-bold">Found Overlapping Keywords:</div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {analysis.foundKeywords.map((kw) => (
                                            <span key={kw} className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md flex items-center gap-1">
                                              <span className="w-1 h-1 rounded-full bg-emerald-500" /> {kw}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Missing Keywords */}
                                    {analysis.missingKeywords.length > 0 ? (
                                      <div className="space-y-1">
                                        <div className="text-[8px] font-mono tracking-widest uppercase text-amber-400 font-bold">Missing Recommended Keywords (Add to resume!):</div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {analysis.missingKeywords.map((kw) => (
                                            <span key={kw} className="text-[9px] font-mono px-2 py-0.5 bg-amber-500/5 text-amber-100 border border-amber-500/15 rounded-md flex items-center gap-1 hover:bg-amber-500/10 hover:border-amber-500/35 transition-colors cursor-pointer" title="Click to add as skill if proficient">
                                              <span>+ {kw}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-[9.5px] text-emerald-405 font-mono flex items-center gap-1">
                                        ✓ Outstanding! No critical missing keywords found from industry scanner scope.
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Segment 3: Dynamic Checklist */}
                                <div className="space-y-2">
                                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">ATS Structure & Best-Practices Checklist:</div>
                                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                                    {analysis.suggestions.map((s, idx) => (
                                      <div 
                                        key={idx} 
                                        className={`flex items-start gap-2 p-2 rounded-lg border transition-all ${
                                          s.completed 
                                            ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-300' 
                                            : 'bg-slate-950/20 border-white/5 text-slate-400'
                                        }`}
                                      >
                                        <div className="shrink-0 mt-0.5">
                                          {s.completed ? (
                                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            </div>
                                          ) : (
                                            <div className={`w-3.5 h-3.5 rounded-full bg-transparent border flex items-center justify-center ${
                                              s.impact === 'high' ? 'border-rose-450/60' : s.impact === 'medium' ? 'border-amber-400/60' : 'border-slate-500/40'
                                            }`}>
                                              <span className={`w-1.5 h-1.5 rounded-full ${
                                                s.impact === 'high' ? 'bg-rose-400' : s.impact === 'medium' ? 'bg-amber-400' : 'bg-slate-500'
                                              }`} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`text-[10px] leading-tight ${s.completed ? 'line-through text-slate-500' : ''}`}>
                                            {s.text}
                                          </p>
                                        </div>
                                        <span className={`shrink-0 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                          s.impact === 'high' ? 'bg-rose-500/10 text-rose-400' : s.impact === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                                        }`}>
                                          {s.impact}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Segment 4: Detailed Rating breakdown bar */}
                                <div className="space-y-2 border-t border-white/5 pt-3">
                                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Score Metrics breakdown:</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {analysis.scoreBreakdown.map((item, idx) => (
                                      <div key={idx} className="space-y-1 p-2 rounded-lg bg-slate-950/15 border border-white/5">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="font-medium text-slate-300">{item.category}</span>
                                          <span className="font-mono font-bold text-white">{item.earned}/{item.max}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-indigo-500" 
                                            style={{ width: `${(item.earned / item.max) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  <div id="printable_resume_root_wrapper" className="w-full">

                  {/* PREMIUM DIGITAL SMART RESUME CARD VIEW WITH DYNAMIC STYLING */}
                  {(() => {
                    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10]; // Fallback to Royal Blue
                    
                    const isDarkTheme = activeTemplate && (
                      activeTemplate.name.toLowerCase().includes('black') || 
                      activeTemplate.name.toLowerCase().includes('luxury') || 
                      activeTemplate.name.toLowerCase().includes('dark') || 
                      activeTemplate.name.toLowerCase().includes('midnight') || 
                      activeTemplate.name.toLowerCase().includes('cosmic') || 
                      activeTemplate.name.toLowerCase().includes('visionos') || 
                      activeTemplate.name.toLowerCase().includes('cyberpunk') || 
                      activeTemplate.name.toLowerCase().includes('plum')
                    );

                    const innerCardClass = isDarkTheme
                      ? "bg-slate-950/75 backdrop-blur-md border border-white/15 text-white"
                      : "bg-white/85 backdrop-blur-md border border-white/40 text-slate-850 shadow-inner";

                    const textPrimary = isDarkTheme ? "text-white" : "text-slate-900";
                    const textSecondary = isDarkTheme ? "text-amber-300" : "text-blue-600";
                    const textMuted = isDarkTheme ? "text-slate-300/85" : "text-slate-500";
                    const borderClass = isDarkTheme ? "border-white/10" : "border-slate-200/80";
                    const tagBgClass = isDarkTheme ? "bg-white/10 border border-white/10 text-blue-200" : "bg-slate-100/90 border border-slate-200/60 text-slate-600";
                    const textSummaryClass = isDarkTheme ? "text-slate-200" : "text-slate-600";

                    return (
                      <div 
                        id="smart_resume_preview_card_wrapper"
                        className={`rounded-[26px] p-4.5 shadow-2.5xl relative overflow-hidden flex flex-col gap-4 min-h-[440px] transition-all duration-500 bg-gradient-to-br ${activeTemplate ? activeTemplate.primaryColor : 'from-indigo-900 to-blue-800'}`}
                      >
                        
                        {/* Dynamic Floating Premium Decorative elements centered on background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                          
                          {/* 1. Spheres / Glass Orbs overlay */}
                          {(activeTemplate.name.toLowerCase().includes('sphere') || activeTemplate.name.toLowerCase().includes('orb') || activeTemplate.name.toLowerCase().includes('glass') || activeTemplate.layout.toLowerCase().includes('orb') || activeTemplate.layout.toLowerCase().includes('sphere')) && (
                            <>
                              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/20 border border-white/40 shadow-2xl backdrop-blur-md animate-pulse" />
                              <div className="absolute top-8 right-6 w-14 h-14 rounded-full bg-white/10 border border-white/30 shadow-xl backdrop-blur-sm" />
                              <div className="absolute top-1/2 left-2 w-6 h-6 rounded-full bg-white/15 border border-white/20" />
                            </>
                          )}

                          {/* 2. Liquid Blobs / Aurora Waves */}
                          {(activeTemplate.name.toLowerCase().includes('blob') || activeTemplate.name.toLowerCase().includes('wave') || activeTemplate.name.toLowerCase().includes('mesh') || activeTemplate.name.toLowerCase().includes('aurora') || activeTemplate.name.toLowerCase().includes('ripple') || activeTemplate.layout.toLowerCase().includes('wave') || activeTemplate.layout.toLowerCase().includes('mesh') || activeTemplate.layout.toLowerCase().includes('fluid')) && (
                            <>
                              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pink-500/30 blur-2xl filter animate-pulse" />
                              <div className="absolute -bottom-16 right-4 w-40 h-40 rounded-full bg-amber-400/20 blur-xl filter" />
                              <div className="absolute top-1/3 left-0 w-20 h-20 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
                            </>
                          )}

                          {/* 3. Geometric Hex / Crystals */}
                          {(activeTemplate.name.toLowerCase().includes('cube') || activeTemplate.name.toLowerCase().includes('geometric') || activeTemplate.name.toLowerCase().includes('hex') || activeTemplate.layout.toLowerCase().includes('hex') || activeTemplate.layout.toLowerCase().includes('pillar') || activeTemplate.layout.toLowerCase().includes('geometric')) && (
                            <>
                              <div className="absolute right-4 top-6 w-14 h-14 border-2 border-white/30 rotate-45 bg-white/5 backdrop-blur-[1px] rounded-lg" />
                              <div className="absolute left-6 bottom-4 w-10 h-10 border border-white/15 -rotate-12 bg-white/5 rounded-md" />
                              <div className="absolute inset-x-0 bottom-0 h-20 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                            </>
                          )}

                          {/* 4. Concentric Rings */}
                          {(activeTemplate.name.toLowerCase().includes('ring') || activeTemplate.name.toLowerCase().includes('circle') || activeTemplate.layout.toLowerCase().includes('circle') || activeTemplate.layout.toLowerCase().includes('orbital')) && (
                            <>
                              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full border-2 border-white/20" />
                              <div className="absolute -bottom-14 -right-14 w-40 h-40 rounded-full border border-white/10" />
                            </>
                          )}

                          {/* 5. Curved Ribbons */}
                          {(activeTemplate.name.toLowerCase().includes('ribbon') || activeTemplate.name.toLowerCase().includes('curve') || activeTemplate.name.toLowerCase().includes('stripe') || activeTemplate.name.toLowerCase().includes('sunset') || activeTemplate.layout.toLowerCase().includes('ribbon') || activeTemplate.layout.toLowerCase().includes('curve') || activeTemplate.layout.toLowerCase().includes('stripe')) && (
                            <div className="absolute -top-4 -left-12 w-56 h-28 bg-gradient-to-r from-amber-400/20 to-pink-500/20 rotate-12 skew-x-12 border-b-2 border-white/20 backdrop-blur-[0.5px]" />
                          )}

                          {/* 6. Gold Luxury */}
                          {(activeTemplate.name.toLowerCase().includes('gold') || activeTemplate.name.toLowerCase().includes('luxury') || activeTemplate.name.toLowerCase().includes('royal') || activeTemplate.name.toLowerCase().includes('elegance') || activeTemplate.layout.toLowerCase().includes('shield')) && (
                            <div className="absolute inset-2.5 border border-amber-400/25 rounded-2xl pointer-events-none">
                              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-amber-400/50 rounded-tl-sm" />
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-amber-400/50 rounded-tr-sm" />
                            </div>
                          )}
                        </div>

                        {/* Interactive Frosty Inner Card wrapper containing all values */}
                        <div className={`rounded-xl p-4.5 flex flex-col gap-3.5 min-h-[390px] relative z-10 ${innerCardClass} transition-shadow duration-300`}>
                          
                          {/* Header: Photo and Primary Info */}
                          <div className={`border-b pb-3 block ${borderClass}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4.5">
                              
                              {/* Profile Photo in preview */}
                              {!((currentDraft.deletedFields || []).includes('profilePhoto')) && (
                                <div className="relative w-15 h-15 rounded-full overflow-hidden bg-slate-100 border-2 border-amber-400/40 flex-shrink-0 flex items-center justify-center shadow-lg">
                                  {currentDraft.profilePhoto ? (
                                    <img
                                      src={currentDraft.profilePhoto}
                                      alt="CV Photo"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-slate-400">
                                      <User className="w-5.5 h-5.5" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex-1">
                                <h2 className={`text-base font-extrabold tracking-tight leading-tight ${textPrimary}`}>
                                  {currentDraft.fullName || 'SIRAJ AHMED'}
                                </h2>
                                <p className={`text-[10px] font-mono tracking-wider font-extrabold uppercase mt-1 ${textSecondary}`}>
                                  {currentDraft.professionalTitle || 'SENIOR SOLUTIONS ARCHITECT'}
                                </p>

                                {/* Identity values grid row */}
                                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-[9.5px] font-mono">
                                  {!((currentDraft.deletedFields || []).includes('nationality')) && (
                                    <span className={`rounded-md px-1.5 py-0.5 ${tagBgClass}`}>
                                      {getNationalityFlag(currentDraft.nationality)} {currentDraft.nationality || 'Nationality Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('dateOfBirth')) && (
                                    <span className={`rounded-md px-1.5 py-0.5 ${tagBgClass}`}>
                                      📅 {currentDraft.dateOfBirth || 'DOB Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('gender')) && (
                                    <span className={`rounded-md px-1.5 py-0.5 ${tagBgClass}`}>
                                      👤 {currentDraft.gender || 'Gender Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('maritalStatus')) && (
                                    <span className={`rounded-md px-1.5 py-0.5 ${tagBgClass}`}>
                                      ❤️ {currentDraft.maritalStatus || 'Single'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contact metadata list */}
                            <div className={`flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] mt-2.5 border-t pt-2 font-mono ${borderClass} ${textMuted}`}>
                              {!((currentDraft.deletedFields || []).includes('email')) && (
                                <span>📧 {currentDraft.email || 'siraj@example.com'}</span>
                              )}
                              {!((currentDraft.deletedFields || []).includes('phone')) && (
                                <span>📞 {getPhoneFlag(currentDraft.phone) ? `${getPhoneFlag(currentDraft.phone)} ` : ''}{currentDraft.phone || '+971 501 2345'}</span>
                              )}
                              {!((currentDraft.deletedFields || []).includes('address')) && (
                                <span>📍 {currentDraft.address || 'Dubai, UAE'}</span>
                              )}
                              {currentDraft.customFields && currentDraft.customFields.map((field) => (
                                <span key={field.id}>✨ {field.label || 'Custom'}: {field.value || 'N/A'}</span>
                              ))}
                            </div>
                          </div>

                          {activeSection === 10 ? (
                            <div className={`border-t pt-3.5 ${borderClass} flex-1 flex flex-col gap-2.5`}>
                              <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest font-mono ${textSecondary} flex items-center gap-1`}>
                                <Mail className="w-2.5 h-2.5 text-amber-300" /> Cover Letter
                              </h4>
                              <div className={`text-[10px] leading-relaxed font-mono whitespace-pre-wrap select-text selection:bg-amber-400 selection:text-slate-900 ${textSummaryClass}`}>
                                {currentDraft.coverLetter || 'Click custom cover letter presets or type on the left editor to compose your cover letter...'}
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Executive Summary */}
                              {!((currentDraft.deletedFields || []).includes('summary')) && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-1 font-mono ${textSecondary}`}>Profile Executive Summary</h4>
                                  <p className={`text-[10px] leading-relaxed font-sans ${textSummaryClass}`}>
                                    {currentDraft.summary || 'Craft high-fidelity solutions for continuous product growth...'}
                                  </p>
                                </div>
                              )}

                              {/* 1. Professional Experience Section */}
                              {currentDraft.experiences && currentDraft.experiences.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2.5 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <Briefcase className="w-2.5 h-2.5" /> Professional Experience
                                  </h4>
                                  <div className="space-y-3">
                                    {currentDraft.experiences.map((exp) => (
                                      <div key={exp.id} className="text-left">
                                        <div className="flex justify-between items-start text-[10px] gap-1 font-semibold">
                                          <span className={`${textPrimary} font-bold`}>{exp.position || 'Software Engineer'}</span>
                                          <span className={`text-[9px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{exp.duration || '2022 - Present'}</span>
                                        </div>
                                        <p className={`text-[9.5px] font-medium font-sans ${textSecondary} opacity-90`}>{exp.company || 'Acme Corp'}</p>
                                        {exp.details && (
                                          <p className={`text-[9.5px] leading-relaxed font-sans mt-0.5 opacity-80 ${textSummaryClass}`}>
                                            {exp.details}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 2. Education Section */}
                              {currentDraft.education && currentDraft.education.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2.5 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <GraduationCap className="w-2.5 h-2.5" /> Education & Academic
                                  </h4>
                                  <div className="space-y-2">
                                    {currentDraft.education.map((edu) => (
                                      <div key={edu.id} className="text-left text-[10px]">
                                        <div className="flex justify-between items-start font-semibold gap-1">
                                          <span className={`${textPrimary} font-bold`}>{edu.degree || 'Bachelor of Science'}</span>
                                          <span className={`text-[9px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{edu.duration || '2018 - 2022'}</span>
                                        </div>
                                        <p className={`text-[9.5px] font-medium font-sans opacity-95 ${textSummaryClass}`}>{edu.school || 'Global Tech University'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 3. Core Expertise / Skills Section */}
                              {currentDraft.skills && currentDraft.skills.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <PenTool className="w-2.5 h-2.5" /> Core Expertise & Skills
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {currentDraft.skills.map((skill, index) => (
                                      <span key={index} className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-semibold ${tagBgClass}`}>
                                        ⚡ {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 4. Projects Section */}
                              {currentDraft.projects && currentDraft.projects.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2.5 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <FileText className="w-2.5 h-2.5" /> Key Portfolio Projects
                                  </h4>
                                  <div className="space-y-2.5">
                                    {currentDraft.projects.map((proj) => (
                                      <div key={proj.id} className="text-left">
                                        <div className="flex justify-between items-start text-[10px] gap-1 font-semibold">
                                          <span className={`${textPrimary} font-bold`}>{proj.title || 'Enterprise Portal'}</span>
                                          <span className={`text-[9px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{proj.duration || '3 Months'}</span>
                                        </div>
                                        <p className={`text-[9.5px] font-medium font-sans ${textSecondary} opacity-90`}>{proj.role || 'Lead Engineer'}</p>
                                        {proj.details && (
                                          <p className={`text-[9.5px] leading-relaxed font-sans mt-0.5 opacity-80 ${textSummaryClass}`}>
                                            {proj.details}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 5. Certifications Section */}
                              {currentDraft.certifications && currentDraft.certifications.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <Award className="w-2.5 h-2.5" /> Certifications
                                  </h4>
                                  <div className="space-y-1.5">
                                    {currentDraft.certifications.map((cert) => (
                                      <div key={cert.id} className="text-left text-[9.5px] flex justify-between items-center gap-2">
                                        <div>
                                          <span className={`font-bold ${textPrimary}`}>{cert.title || 'AWS Architect'}</span>
                                          <span className={`opacity-80 ml-1 ${textMuted}`}>• {cert.issuer || 'Amazon Web Services'}</span>
                                        </div>
                                        <span className={`text-[8.5px] font-mono whitespace-nowrap opacity-80 ${textMuted}`}>{cert.date || '2023'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 5.5. Training & Specializations Section */}
                              {currentDraft.trainings && currentDraft.trainings.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Training & Specializations
                                  </h4>
                                  <div className="space-y-2">
                                    {currentDraft.trainings.map((trn) => (
                                      <div key={trn.id} className="text-left text-[9.5px]">
                                        <div className="flex justify-between items-start gap-2">
                                          <div>
                                            <span className={`font-bold ${textPrimary}`}>{trn.title || 'Professional Course'}</span>
                                            <span className={`opacity-80 ml-1 ${textMuted}`}>• {trn.provider || 'E-Learning'}</span>
                                          </div>
                                          <span className={`text-[8.5px] font-mono whitespace-nowrap opacity-80 ${textMuted}`}>{trn.date || '2026'}</span>
                                        </div>
                                        {trn.details && (
                                          <p className={`text-[8.5px] leading-relaxed font-sans mt-0.5 opacity-75 ${textSummaryClass} whitespace-pre-wrap`}>
                                            {trn.details}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 6. Languages Section */}
                              {currentDraft.languages && currentDraft.languages.length > 0 && (
                                <div className={`border-t pt-2.5 ${borderClass}`}>
                                  <h4 className={`text-[8.5px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                    <Languages className="w-2.5 h-2.5" /> Languages
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {currentDraft.languages.map((lang) => (
                                      <span key={lang.id} className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-semibold ${tagBgClass}`}>
                                        🌐 {lang.name || 'English'} <span className="opacity-75 font-normal text-[8px]">({lang.proficiency || 'Fluent'})</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                        </div>
                      </div>
                    );
                  })()}
                  </div>
                </div>

                {/* HIGH-FIDELITY EXPORT COMPRESSED BAR */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-3.5 z-10 relative select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Resume Export Center
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">All Formats Ready</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const activePages = currentDraft ? getActiveDocumentPages(currentDraft) : [];
                      setSelectedExportPageIds(activePages.map(p => p.id));
                      setShowExportSuiteModal(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] duration-150 animate-pulse-subtle"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>EXPORT</span>
                  </button>

                  <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 text-[10.5px] text-slate-300 space-y-1.5 leading-relaxed">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-indigo-300/65 mb-1">Available Actions Inside:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>Save as high-res PDF</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Export MS Word (.docx)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Direct paper printing</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Live Email Dispatch</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2 justify-between items-center text-[10px] text-blue-200/40 font-mono">
                    <p>Template Config: <strong className="text-amber-300/80">#{currentDraft.templateId || 'Simple Design Default'}</strong></p>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>A4 Live Preview Ok</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM NAVIGATION: STEP INDICATOR & GLASSMORPHISM NEXT/PREVIEW BUTTONS */}
            <div className={`backdrop-blur-md border-t px-6 py-5.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4.5 z-10 select-none ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-white/45 border-slate-200/60 text-slate-850'
            }`}>
              
              {/* Progress and status container + Print Preview trigger */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4.5 max-w-2xl">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className={`font-bold ${isDarkMode ? 'text-blue-200' : 'text-indigo-600'}`}>
                      {(() => {
                        const labels: Record<number, string> = {
                          1: 'Personal Details Caching',
                          2: 'Professional Context Recorded',
                          3: 'Education Credentials Configured',
                          4: 'Core Skills Matched',
                          5: 'Industry Projects Outlined',
                          6: 'Certifications Calibrated',
                          7: 'Languages Synchronized',
                          8: 'Ready for Export & Distribution'
                        };
                        return labels[activeSection] || 'Resume Setup In Progress';
                      })()}
                    </span>
                    <span className={isDarkMode ? 'text-amber-300 font-black' : 'text-amber-600 font-black'}>
                      Step {activeSection} of 8 ({Math.round((activeSection / 8) * 100)}%)
                    </span>
                  </div>
                  
                  {/* Horizontal progress bar */}
                  <div className={`w-full h-2.5 rounded-full overflow-hidden border relative ${
                    isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-200/70 border-slate-300/40'
                  }`}>
                    <motion.div 
                      animate={{ width: `${(activeSection / 8) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-300 shadow-lg shadow-blue-500/40 rounded-full"
                    />
                  </div>
                </div>

                {/* Print Preview Center Trigger Inline */}
                {currentDraft && activePages.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.getElementById('smart_resume_preview_card_wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setCarouselPreviewOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-800/95 border border-white/10 text-white rounded-xl shadow-lg backdrop-blur-md hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all cursor-pointer group shrink-0 self-start sm:self-auto"
                  >
                    <div className="flex items-center justify-center p-1.5 bg-indigo-500/15 border border-indigo-400/20 rounded-lg group-hover:rotate-12 transition-transform">
                      <Layers className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start leading-none text-left select-none">
                      <span className="text-[8px] font-mono uppercase tracking-widest font-black text-slate-400">Total Size</span>
                      <span className="text-xs font-sans font-bold text-white mt-0.5">
                        {activePages.length} {activePages.length === 1 ? 'Page' : 'Pages'}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 mx-0.5" />
                    <div className="flex items-center text-xs font-bold text-emerald-400 gap-1 font-mono uppercase text-[9px] tracking-wider bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                      <Printer className="w-3 h-3 text-emerald-400 animate-bounce duration-1500" />
                      <span>Print Suite</span>
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Action Buttons: Move to Next Section */}
              <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch sm:self-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    saveCurrentDraftToLocalStorage(currentDraft);
                    if (activeSection < 8) {
                      setActiveSection(activeSection + 1);
                    } else {
                      // Done! Loop to Section 1
                      setActiveSection(1);
                    }
                  }}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl shadow-indigo-950/30 flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer self-stretch sm:self-auto"
                >
                  <span>{activeSection < 8 ? "Move to Next Section" : "Start Over (Step 1)"}</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </motion.button>
              </div>
            </div>

            {/* INTERACTIVE MATERIAL 3 ALERT MODAL IF STEP 1 COMPLETED */}
            <AnimatePresence>
              {showStepModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.93, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.93, opacity: 0 }}
                    className="bg-gradient-to-tr from-blue-950 via-[#101e42] to-blue-900 border border-white/20 rounded-[30px] p-8 max-w-md w-full shadow-3xl text-center relative overflow-hidden"
                  >
                    {/* Glowing particle decor */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />
                    
                    <div className="w-16 h-16 bg-amber-400/10 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-400/30 shadow-lg animate-pulse">
                      <Sparkles className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold font-display tracking-tight text-white mb-2">
                      Section 1 Completed!
                    </h3>
                    
                    <p className="text-xs text-blue-100/80 leading-relaxed mb-6 font-sans">
                      Your identity values, Base64 profile photo, and customized fields have passed standard layout schema parameters and been cached successfully in local draft metadata.
                      <strong className="block text-amber-300 mt-2.5 text-[11px] font-mono tracking-wide">
                        READY FOR STEP 2 OF 8! Please submit your next prompt to build experience, education, or skill sections next.
                      </strong>
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowStepModal(false)}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase border border-white/10 shadow-lg transition-all cursor-pointer"
                    >
                      Awesome, Continue Editing Section 1
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* INTERACTIVE TITLE PROMPT MODAL WHEN PAGE FIRST APPEARS */}
            <AnimatePresence>
              {showTitlePromptModal && (
                <div id="title_prompt_overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gradient-to-tr from-[#0b132b] via-[#101e42] to-blue-900 border border-white/20 rounded-[30px] p-8 max-w-md w-full shadow-3xl text-center relative overflow-hidden"
                  >
                    {/* Golden top progress indicator decor */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500" />
                    
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-400/30 shadow-lg select-none">
                      <FileText className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold font-display tracking-tight text-white mb-2">
                      Name Your Resume
                    </h3>
                    
                    <p className="text-xs text-blue-200/80 leading-relaxed mb-6 font-sans">
                      Start your premium draft with an optimized document title (displayed in the top app bar).
                    </p>

                    <div className="mb-6 relative">
                      <input
                        id="title_prompt_input"
                        type="text"
                        placeholder="e.g. Master Cloud Engineer"
                        value={promptTitleInput}
                        onChange={(e) => setPromptTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && promptTitleInput.trim()) {
                            updateDraftMeta('title', promptTitleInput.trim());
                            setShowTitlePromptModal(false);
                          }
                        }}
                        className="w-full text-xs p-4 bg-slate-950/50 border border-white/20 rounded-xl focus:outline-none focus:border-amber-300 text-white placeholder-white/30 font-sans pr-10"
                        autoFocus
                      />
                      <Sparkles className="w-4 h-4 text-amber-300/60 absolute right-3.5 top-4 pointer-events-none" />
                    </div>

                    <div className="flex gap-2 text-xs">
                      <button
                        id="btn_cancel_title"
                        type="button"
                        onClick={() => setShowTitlePromptModal(false)}
                        className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/80 font-bold border border-white/10 transition-all cursor-pointer"
                      >
                        Skip
                      </button>
                      <button
                        id="btn_save_title"
                        type="button"
                        disabled={!promptTitleInput.trim()}
                        onClick={() => {
                          if (promptTitleInput.trim()) {
                            updateDraftMeta('title', promptTitleInput.trim());
                            setShowTitlePromptModal(false);
                          }
                        }}
                        className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold tracking-wider uppercase border border-white/10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        Set Title
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: OPEN PREVIOUSLY SAVED ARCHIVE DRAFTS LIST         */}
        {/* ========================================================= */}
        {view === 'open_browser' && (
          <motion.div
            key="open-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full max-w-2xl backdrop-blur-xl rounded-3xl border p-6 sm:p-8 shadow-2xl ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/60 text-white shadow-black/45' : 'bg-white/45 border-slate-200/60 text-slate-800'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4 mb-6`}>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                <h2 className={`text-xl font-bold tracking-tight font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Autosaved CV Archive
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setView('navigation')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isDarkMode ? 'border-slate-700 text-slate-350 hover:bg-slate-850' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Exit to Hub
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 mb-6 max-h-[360px] overflow-y-auto pr-1">
              {drafts.length === 0 ? (
                <div className={`p-12 border border-dashed rounded-2xl text-center text-xs ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/20 text-slate-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <p className={`font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-650'}`}>No saved resumes found on this workspace.</p>
                  <p className="mt-1">Go back and click &apos;New Resume (Blank)&apos; to begin drafting!</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={`p-4 border rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                      isDarkMode 
                        ? 'border-slate-800 hover:border-blue-700 bg-slate-950/30 hover:bg-slate-950/60' 
                        : 'border-slate-150 bg-slate-50/50 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{draft.title}</h4>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          Autosave File
                        </span>
                      </div>
                      <p className={`text-xs mt-1 truncate max-w-[340px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Owner: {draft.fullName || 'Unspecified Candidate Name'} • {draft.professionalTitle || 'Architect Title'}
                      </p>
                      <span className={`text-[10px] font-mono mt-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Saved: {draft.lastSaved}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentDraft(draft);
                          setView('blank_builder');
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const newer = drafts.filter(d => d.id !== draft.id);
                          setDrafts(newer);
                          localStorage.setItem('srb_draft_resumes', JSON.stringify(newer));
                          try {
                            await deleteResumeFromDB(draft.id);
                            console.log('[IndexedDB] Draft deleted successfully:', draft.id);
                          } catch (err) {
                            console.error('[IndexedDB Delete Failed]', err);
                          }
                        }}
                        className={`p-2 border rounded-xl transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/10' 
                            : 'border-slate-200 text-slate-450 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={`p-3 rounded-2xl text-[11px] flex gap-2 ${
              isDarkMode ? 'bg-indigo-955/20 border border-indigo-900/50 text-indigo-300' : 'bg-indigo-50 border border-indigo-100/50 text-indigo-700'
            }`}>
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="leading-snug">
                Your credentials and profile entries remain securely cached inside your local draft environment. Simply click any card to loaded.
              </p>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: DELIBERATE 50 PREMIUM STYLISH TEMPLATE GALLERY   */}
        {/* ========================================================= */}
        {view === 'templates_gallery' && (
          <motion.div
            key="templates-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full max-w-[1200px] backdrop-blur-xl rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[700px] bg-transparent ${
              isDarkMode ? 'border-white/10 text-white shadow-black/45' : 'border-slate-205 text-slate-850'
            }`}
          >
            {/* Header controls layout bar */}
            <div>
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 mb-6 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-amber-500" />
                    <h2 className={`text-xl font-bold tracking-tight font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Stylish Master Designs for Resumes and CVs.
                    </h2>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pick high-fidelity overlays to structure resume grids instantly with dynamic previews.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentDraft) {
                        setView('blank_builder');
                      } else {
                        setView('navigation');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-sky-400 hover:bg-sky-300 text-black border-sky-400 cursor-pointer shadow-sm shadow-sky-400/20"
                  >
                    <ChevronLeft className="w-4 h-4 text-black" /> Close
                  </button>
                </div>
              </div>

              {/* SEARCH & CATEGORY CHIPS SYSTEM */}
              <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border p-4 rounded-2xl mb-6 ${
                isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50/50 border-slate-100'
              }`}>
                
                {/* Search query input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search templates, formats or layouts..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className={`w-full text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-400 border ${
                      isDarkMode ? 'bg-slate-950 border-slate-850 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                {/* Categories filtering tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold font-mono hidden lg:inline mr-1 ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Filters:
                  </span>
                  {['All', 'Standard & Professional Layouts', 'Split & Sidebar Layouts', 'Creative & Modern Layouts', 'Specialized & Minimalist Layouts'].map((category) => {
                    const isSelect = templateFilter === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setTemplateFilter(category)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelect 
                            ? 'bg-sky-400 text-black border-sky-500/50 shadow-lg shadow-sky-400/20 scale-[1.02]' 
                            : isDarkMode 
                              ? 'bg-gradient-to-r from-slate-900 to-slate-850 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                              : 'bg-white border-slate-205 text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 shadow-sm'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* CAROUSEL SLIDER PER CATEGORY SYSTEM */}
              <div className="space-y-8 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin select-none">
                {['Standard & Professional Layouts', 'Split & Sidebar Layouts', 'Creative & Modern Layouts', 'Specialized & Minimalist Layouts']
                  .filter(cat => templateFilter === 'All' || cat === templateFilter)
                  .map((category) => {
                    const filteredTemplates = TEMPLATES.filter(t => {
                      const matchesCategory = t.category === category;
                      const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.layout.toLowerCase().includes(templateSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    });

                    if (filteredTemplates.length === 0) return null;

                    return (
                      <div key={category} className="space-y-3 relative group/cat">
                        {/* Category Heading & Controls */}
                        <div className="flex items-center justify-between">
                          <h3 className={`font-extrabold text-xs font-sans tracking-wide uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            {category}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const container = document.getElementById(`carousel-${category.replace(/\s+/g, '-')}`);
                                if (container) {
                                  container.scrollBy({ left: -280, behavior: 'smooth' });
                                }
                              }}
                              className={`p-1 rounded-full border transition-all cursor-pointer ${
                                isDarkMode 
                                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-55'
                              }`}
                              title="Scroll Left"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const container = document.getElementById(`carousel-${category.replace(/\s+/g, '-')}`);
                                if (container) {
                                  container.scrollBy({ left: 280, behavior: 'smooth' });
                                }
                              }}
                              className={`p-1 rounded-full border transition-all cursor-pointer ${
                                isDarkMode 
                                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-55'
                              }`}
                              title="Scroll Right"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Carousel row scroll container */}
                        <div 
                          id={`carousel-${category.replace(/\s+/g, '-')}`}
                          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 pb-3 scrollbar-none pr-4"
                          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                        >
                          {filteredTemplates.map((t) => {
                            const isPickCurrent = currentDraft?.templateId === t.id;
                            return (
                              <motion.div
                                key={t.id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className={`snap-start shrink-0 w-[240px] border rounded-2xl p-4 text-left transition-all relative flex flex-col justify-between min-h-[290px] cursor-pointer group shadow-sm ${
                                  isPickCurrent 
                                    ? 'border-amber-500 bg-amber-500/5 ring-4 ring-amber-100/30' 
                                    : isDarkMode 
                                      ? 'border-slate-850 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/80 shadow-black/25' 
                                      : 'border-slate-150 bg-white hover:border-slate-350 hover:shadow-lg'
                                }`}
                                onClick={() => {
                                  if (currentDraft) {
                                    const updated = { ...currentDraft, templateId: t.id };
                                    setCurrentDraft(updated);
                                    saveCurrentDraftToLocalStorage(updated);
                                    setView('blank_builder');
                                  } else {
                                    const tempDraft: ResumeDraft = {
                                      id: 'draft_' + Date.now(),
                                      title: 'Draft - ' + t.name,
                                      fullName: '',
                                      professionalTitle: '',
                                      email: '',
                                      phone: '',
                                      address: '',
                                      summary: '',
                                      experiences: [],
                                      education: [],
                                      skills: [],
                                      trainings: [],
                                      coverLetter: '',
                                      templateId: t.id,
                                      lastSaved: new Date().toISOString().split('T')[0]
                                    };
                                    setCurrentDraft(tempDraft);
                                    saveCurrentDraftToLocalStorage(tempDraft);
                                    setView('blank_builder');
                                  }
                                }}
                              >
                                {/* Live Style Preview Box */}
                                <div className={`w-full h-24 rounded-xl mb-3 relative overflow-hidden bg-gradient-to-br ${t.primaryColor} border shadow-inner flex flex-col justify-between p-2 ${
                                  isDarkMode ? 'border-slate-800' : 'border-slate-200/40'
                                }`}>
                                  
                                  {/* Ambient soft glow overlays depending on name/layout properties */}
                                  {(t.name.toLowerCase().includes('sphere') || t.name.toLowerCase().includes('orb') || t.name.toLowerCase().includes('glass') || t.layout.toLowerCase().includes('orb') || t.layout.toLowerCase().includes('sphere')) && (
                                    <>
                                      <div className="absolute -bottom-2 -left-1 w-9 h-9 rounded-full bg-white/25 border border-white/40 shadow-lg backdrop-blur-[1px] pointer-events-none" />
                                      <div className="absolute top-2 right-4 w-5 h-5 rounded-full bg-white/15 border border-white/30 shadow-md backdrop-blur-[2px] pointer-events-none" />
                                    </>
                                  )}
                                  
                                  {(t.name.toLowerCase().includes('blob') || t.name.toLowerCase().includes('wave') || t.name.toLowerCase().includes('mesh') || t.name.toLowerCase().includes('aurora') || t.name.toLowerCase().includes('ripple') || t.layout.toLowerCase().includes('wave') || t.layout.toLowerCase().includes('mesh') || t.layout.toLowerCase().includes('fluid')) && (
                                    <>
                                      <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-pink-500/25 blur-md pointer-events-none" />
                                      <div className="absolute -bottom-4 right-1 w-10 h-10 rounded-full bg-yellow-400/20 blur-lg pointer-events-none" />
                                    </>
                                  )}

                                  {(t.name.toLowerCase().includes('cube') || t.name.toLowerCase().includes('geometric') || t.name.toLowerCase().includes('hex') || t.layout.toLowerCase().includes('hex') || t.layout.toLowerCase().includes('pillar') || t.layout.toLowerCase().includes('geometric')) && (
                                    <>
                                      <div className="absolute right-2 top-2 w-7 h-7 border border-white/45 rotate-45 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
                                      <div className="absolute left-6 bottom-1 w-5 h-5 border border-white/20 -rotate-12 bg-white/5 pointer-events-none" />
                                    </>
                                  )}

                                  {(t.name.toLowerCase().includes('ring') || t.name.toLowerCase().includes('circle') || t.layout.toLowerCase().includes('circle') || t.layout.toLowerCase().includes('orbital')) && (
                                    <>
                                      <div className="absolute -bottom-4 -right-1 w-12 h-12 rounded-full border border-white/40 pointer-events-none" />
                                      <div className="absolute -bottom-2 -right-3 w-12 h-12 rounded-full border border-white/20 pointer-events-none" />
                                    </>
                                  )}

                                  {(t.name.toLowerCase().includes('ribbon') || t.name.toLowerCase().includes('curve') || t.name.toLowerCase().includes('stripe') || t.name.toLowerCase().includes('sunset') || t.layout.toLowerCase().includes('ribbon') || t.layout.toLowerCase().includes('curve') || t.layout.toLowerCase().includes('stripe')) && (
                                    <div className="absolute -top-1 -left-4 w-24 h-14 bg-gradient-to-r from-amber-400/20 to-rose-400/25 rotate-12 skew-x-12 border-b border-white/25 pointer-events-none" />
                                  )}

                                  {(t.name.toLowerCase().includes('gold') || t.name.toLowerCase().includes('luxury') || t.name.toLowerCase().includes('royal') || t.name.toLowerCase().includes('elegance') || t.layout.toLowerCase().includes('shield')) && (
                                    <div className="absolute inset-1.5 border border-amber-400/35 rounded-lg pointer-events-none">
                                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow shadow-amber-300" />
                                    </div>
                                  )}

                                  {(t.name.toLowerCase().includes('visionos') || t.name.toLowerCase().includes('glass') || t.name.toLowerCase().includes('frost') || t.name.toLowerCase().includes('translucent')) && (
                                    <div className="absolute inset-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
                                      <span className="text-[7.5px] font-mono text-white/70 tracking-widest font-extrabold">VISION_OS</span>
                                    </div>
                                  )}

                                  <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full bg-white/30 border border-white/40 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-[7px] text-white/80">👤</span>
                                      </div>
                                      <div className="space-y-0.5">
                                        <div className="w-12 h-1.5 rounded-sm bg-white" />
                                        <div className="w-8 h-1 rounded-sm bg-white/60" />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-1.5 mt-1">
                                      <div className="col-span-4 space-y-1">
                                        <div className="w-full h-1 rounded-sm bg-white/40" />
                                        <div className="w-3/4 h-1 rounded-sm bg-white/40" />
                                        <div className="w-1/2 h-1 rounded-sm bg-white/40" />
                                      </div>
                                      <div className="col-span-8 space-y-1">
                                        <div className="w-full h-1 rounded bg-white/75" />
                                        <div className="w-full h-1 rounded bg-white/50" />
                                        <div className="w-11/12 h-1 rounded bg-white/50" />
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[5px] text-white/60 font-mono uppercase tracking-widest mt-0.5 pt-0.5 border-t border-white/15">
                                      <span>PREVIEW FOR #{t.id}</span>
                                      <span>HIGH FIDELITY</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Selected Indicator */}
                                {isPickCurrent && (
                                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow shadow-amber-200 z-20">
                                    ✓
                                  </div>
                                )}

                                {/* Top tag level */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-mono tracking-wider px-2 py-0.5 rounded-md border uppercase font-bold ${
                                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200/50 text-slate-500'
                                  }`}>
                                    #{t.id}
                                  </span>
                                  <span className={`text-[8px] font-mono tracking-wider px-2 py-0.5 rounded-md border uppercase font-bold ${
                                    isDarkMode ? 'bg-indigo-950/45 border-indigo-900/50 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                  }`}>
                                    {t.category.split(' & ')[0]}
                                  </span>
                                </div>

                                {/* Middle info */}
                                <div className="my-3 flex-1 flex flex-col justify-center">
                                  <h4 className={`font-extrabold group-hover:text-amber-500 transition-colors text-xs leading-snug break-normal line-clamp-2 ${
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {t.name}
                                  </h4>
                                  <p className={`text-[10px] mt-0.5 font-mono tracking-tight leading-snug truncate ${
                                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                                  }`}>
                                    Layout: {t.layout}
                                  </p>
                                </div>

                                {/* Footer downloads stats */}
                                <div className={`border-t pt-2 flex items-center justify-between text-[9px] font-mono ${
                                  isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100/80 text-slate-400'
                                }`}>
                                  <span className={`px-1.5 py-0.5 rounded font-extrabold ${
                                    isDarkMode ? 'bg-emerald-950/65 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                                  }`}>{t.difficulty}</span>
                                  <span>⬇️ {t.downloads}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom info banner bar */}
            <div className={`mt-6 border-t pt-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3 ${
              isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              <span className="font-mono">Showing {TEMPLATES.length} Premium Custom Android Grid Formats.</span>
              <span>Click any template to select and load it directly.</span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================================= */}
      {/* SEND RESUME TO EMAIL MODAL OVERLAY                        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#090e1f] border border-white/15 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Email Portfolio dispatcher</h3>
                  <p className="text-[10px] text-white/50">Send high-fidelity formatted profile directly</p>
                </div>
              </div>

              {emailSendStatus === 'idle' && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#a5b4fc] font-bold">Recipient Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. recruiter@company.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#a5b4fc] font-bold">Cover Message / Introduction</label>
                    <textarea
                      rows={3}
                      placeholder="Greetings, please find my professional tech profile and portfolio attachment..."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition-all text-xs"
                    />
                  </div>

                  {/* HIGH-FIDELITY ACTIONS MATRIX */}
                  <div className="space-y-2 pt-1 border-t border-white/10 mt-2">
                    <p className="text-[10px] uppercase font-mono text-white/40 tracking-wider">Select Dispatch Protocol</p>
                    
                    {/* Method 1: Local client (mailto) - Guaranteed to work */}
                    <button
                      type="button"
                      disabled={!recipientEmail.trim() || !recipientEmail.includes('@')}
                      onClick={handleSendViaMailto}
                      className="w-full p-3 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/35 text-emerald-300 font-bold border border-[#10b981]/30 transition-all text-xs flex items-center justify-between cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2">
                        <span>📧</span>
                        <span className="text-left font-sans">
                          <strong className="block text-white">Send via Device Email Client</strong>
                          <span className="block text-[9px] text-[#22c55e] font-normal font-mono">Guaranteed delivery with default client</span>
                        </span>
                      </span>
                      <span>🚀</span>
                    </button>

                    {/* Method 2: Copy to Clipboard */}
                    <button
                      type="button"
                      onClick={handleCopyEmailToClipboard}
                      className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/10 transition-all text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>📋</span>
                        <span className="text-left font-sans text-white/90">
                          <strong className="block">Copy Body to Clipboard</strong>
                          <span className="block text-[9px] text-white/40 font-normal">Fast manual copy to paste on Gmail web or mobile</span>
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-300">
                        {copiedEmailStatus ? '✓ COPIED' : 'COPY'}
                      </span>
                    </button>

                    {/* Method 3: Server SMTP Sender */}
                    <button
                      type="button"
                      disabled={!recipientEmail.trim() || !recipientEmail.includes('@')}
                      onClick={handleSendResumeEmail}
                      className="w-full p-2.5 rounded-xl bg-amber-500/10 text-amber-300 hover:text-white hover:bg-amber-500/25 border border-amber-500/20 transition-all text-[11px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                    >
                      <span>🌐</span>
                      <span>Transmit via Server SMTP Envelope</span>
                    </button>

                    {/* Optional SMTP configuration Accordion */}
                    <div className="border border-white/5 rounded-2xl p-3 bg-black/40 text-left">
                      <button
                        type="button"
                        onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                        className="w-full flex items-center justify-between text-[10px] font-mono uppercase font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
                      >
                        <span className="flex items-center gap-1">⚙️ SMTP Server Credentials {(!smtpUserOverride && !smtpPassOverride) ? '(Optional)' : '(Active Override)'}</span>
                        <span>{showSmtpConfig ? '▲ Hide' : '▼ Setup / Override'}</span>
                      </button>
                      
                      {showSmtpConfig && (
                        <div className="mt-2.5 space-y-2.5 pt-2.5 border-t border-white/5 font-sans">
                          <p className="text-[9.5px] leading-relaxed text-white/45">
                            Override default servers with your custom SMTP profile (saved securely in your local browser state).
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-1">
                              <span className="text-[8px] uppercase font-mono tracking-wider text-white/40 font-bold">SMTP Host</span>
                              <input
                                type="text"
                                placeholder="smtp.gmail.com"
                                value={smtpHostOverride}
                                onChange={(e) => {
                                  setSmtpHostOverride(e.target.value);
                                  localStorage.setItem('srb_smtp_host', e.target.value);
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-400"
                              />
                            </div>
                            <div className="col-span-1 space-y-1">
                              <span className="text-[8px] uppercase font-mono tracking-wider text-white/40 font-bold">Port</span>
                              <input
                                type="text"
                                placeholder="587"
                                value={smtpPortOverride}
                                onChange={(e) => {
                                  setSmtpPortOverride(e.target.value);
                                  localStorage.setItem('srb_smtp_port', e.target.value);
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-400"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] uppercase font-mono tracking-wider text-white/40 font-bold">SMTP User / Email address</span>
                            <input
                              type="email"
                              placeholder="e.g. user@gmail.com"
                              value={smtpUserOverride}
                              onChange={(e) => {
                                  setSmtpUserOverride(e.target.value);
                                  localStorage.setItem('srb_smtp_user', e.target.value);
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] uppercase font-mono tracking-wider text-white/40 font-bold">SMTP App Password</span>
                            <input
                              type="password"
                              placeholder="16-character google app password"
                              value={smtpPassOverride}
                              onChange={(e) => {
                                  setSmtpPassOverride(e.target.value);
                                  localStorage.setItem('srb_smtp_pass', e.target.value);
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div className="text-[9px] text-amber-300 font-mono bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-snug">
                            💡 <strong>Gmail Users:</strong> Use a 16-character Google &quot;App Password&quot; instead of your main password. (Google Account &rarr; Security &rarr; Enable 2-Step verification &rarr; search App Passwords). Single spaces are dynamic compacted.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/10 transition-all text-xs cursor-pointer text-center"
                    >
                      Cancel & Close
                    </button>
                  </div>
                </div>
              )}

              {emailSendStatus === 'sending' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                  <div className="space-y-1 font-mono">
                    <p className="text-xs font-bold text-[#a5b4fc] animate-pulse">TRANSMITTING MIME PAYLOAD...</p>
                    <p className="text-[9px] text-white/40">Securing SMTP tunnel & building custom templates</p>
                  </div>
                </div>
              )}

              {emailSendStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400">TRANSMISSION COMPLETED!</p>
                    <p className="text-[9px] font-mono text-white/40">Envelope sent to: <span className="text-[#a5b4fc] font-semibold">{recipientEmail}</span></p>
                  </div>
                </div>
              )}

              {emailSendStatus === 'error' && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-[340px]">
                    <p className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">SMTP Delivery Failed</p>
                    <p className="text-[10px] text-rose-300/90 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 text-left font-mono whitespace-pre-line leading-relaxed max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">{emailSendError || 'Check recipient spelling or SMTP configuration.'}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full pt-1.5">
                    <button
                      type="button"
                      onClick={handleSendViaMailto}
                      className="w-full py-2 rounded-xl bg-emerald-600/95 hover:bg-emerald-500 text-white font-extrabold text-[11px] tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>📧</span> Use Device Email Client Fallback
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEmailSendStatus('idle')}
                        className="w-1/2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[10px] uppercase font-mono cursor-pointer"
                      >
                        Change Input
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailModal(false);
                          setEmailSendStatus('idle');
                        }}
                        className="w-1/2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[10px] uppercase font-mono cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PDF EXPORT CUSTOM PAGE SELECTION MODAL LAYER             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPdfExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg p-6 my-auto rounded-3xl bg-[#090e1f] border border-white/15 shadow-2xl relative text-white"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPdfExportModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
                <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight font-display">Export PDF Document Suite</h3>
                  <p className="text-[10px] text-white/50 leading-relaxed font-sans mt-0.5">
                    Select exactly which pages to compile into your printable high-fidelity PDF.
                  </p>
                </div>
              </div>

              {/* Quick Presets Options */}
              <div className="mb-5 bg-white/5 p-3 rounded-2xl border border-white/5 font-sans">
                <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-300 font-bold block mb-2">
                  Select Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allPages = currentDraft ? getActiveDocumentPages(currentDraft) : [];
                      setSelectedExportPageIds(allPages.map(p => p.id));
                    }}
                    className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider font-extrabold rounded-md bg-indigo-600/35 hover:bg-indigo-600/50 border border-indigo-500/30 text-white transition-all cursor-pointer"
                  >
                    All Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allPages = currentDraft ? getActiveDocumentPages(currentDraft) : [];
                      const resumeOnly = allPages.filter(p => p.type === 'resume').map(p => p.id);
                      setSelectedExportPageIds(resumeOnly);
                    }}
                    className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider font-extrabold rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    Resume Only
                  </button>
                  <button
                    type="button"
                    disabled={!currentDraft || !getActiveDocumentPages(currentDraft).some(p => p.type === 'cover')}
                    onClick={() => {
                      setSelectedExportPageIds(['cover']);
                    }}
                    className="px-3 py-2 text-[10px] uppercase font-mono tracking-wider font-extrabold rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white transition-all cursor-pointer disabled:opacity-30"
                  >
                    Cover Letter
                  </button>
                </div>
              </div>

              {/* Section Page Checklist List */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 mb-6 scrollbar-thin scrollbar-thumb-white/10">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold block">
                  Select Specific Pages ({selectedExportPageIds.length} of {currentDraft ? getActiveDocumentPages(currentDraft).length : 0} included)
                </span>
                
                {currentDraft && getActiveDocumentPages(currentDraft).map((page) => {
                  const isChecked = selectedExportPageIds.includes(page.id);
                  let subLabel = '';
                  if (page.type === 'cover') {
                    subLabel = 'Custom cover letter intro';
                  } else if (page.pageNum) {
                    const sections = getSectionsOnPage(page.pageNum);
                    subLabel = sections.length > 0 ? sections.join(', ') : 'Profile Summary / Info';
                  }

                  return (
                    <div
                      key={page.id}
                      onClick={() => {
                        if (isChecked) {
                          // Prevent from having 0 checked pages
                          if (selectedExportPageIds.length > 1) {
                            setSelectedExportPageIds(selectedExportPageIds.filter(id => id !== page.id));
                          }
                        } else {
                          setSelectedExportPageIds([...selectedExportPageIds, page.id]);
                        }
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-indigo-950/45 border-indigo-500/50 hover:border-indigo-400'
                          : 'bg-black/20 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'}`}>
                          {page.type === 'cover' ? <FileText className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold font-display leading-tight">{page.title}</p>
                          <p className="text-[10px] text-white/40 font-sans leading-relaxed mt-0.5 max-w-[280px]">
                            {subLabel}
                          </p>
                        </div>
                      </div>

                      {/* Custom Checkbox indicator */}
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-white/25 hover:border-white/40'
                      }`}>
                        {isChecked && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PDF Conversion Engine Selector */}
              <div className="mb-4 bg-white/5 p-3 rounded-2xl border border-white/5 font-sans space-y-2.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-300 font-bold block">
                  Select Conversion Method
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {/* Option A: Vector Engine (Browser Print) */}
                  <div
                    onClick={() => setPdfEngine('vector')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      pdfEngine === 'vector'
                        ? 'bg-indigo-950/45 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 font-bold text-indigo-300">
                        <span>⭐</span> Vector Engine (Print / Save as PDF)
                      </div>
                      <p className="text-[9px] text-white/50 leading-relaxed mt-1 font-sans">
                        Uses Chrome/browser print service. Perfect crisp text and functioning clickable links. 100% immune to sandbox limits.
                      </p>
                    </div>
                  </div>

                  {/* Option B: Legacy Canvas Engine (Direct Download) */}
                  <div
                    onClick={() => setPdfEngine('canvas')}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      pdfEngine === 'canvas'
                        ? 'bg-amber-955/45 border-amber-600/60 text-white shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                        : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1 font-bold text-amber-300">
                        <span>⚙️</span> Canvas Capture (Direct File)
                      </div>
                      <p className="text-[9px] text-white/50 leading-relaxed mt-1 font-sans">
                        Offline canvas rendering via html2pdf.js. Blocks/fails inside sanboxed iframe frames of AI Studio.
                      </p>
                    </div>
                  </div>
                </div>

                {pdfEngine === 'vector' ? (
                  <div className="text-[9px] text-emerald-400 font-mono bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 leading-normal">
                    💡 <strong>Instructions:</strong> Clicking below opens the print options. Set the <strong>Destination</strong> dropdown to <strong>&quot;Save as PDF&quot;</strong> to export.
                  </div>
                ) : (
                  <div className="text-[9px] text-amber-400 font-mono bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 leading-normal">
                    ⚠️ <strong>Iframe Warning:</strong> If download doesn&apos;t start, please click <strong>&quot;Open in New Tab&quot;</strong> in the top-right toolbar which lifts iframe blocks.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPdfExportModal(false)}
                  className="flex-1 px-4 py-3 text-xs bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-center font-extrabold tracking-wider uppercase select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedExportPageIds.length === 0 || (pdfEngine === 'canvas' && isExportingPDF) || (pdfEngine === 'vector' && isPrinting)}
                  onClick={async () => {
                    if (pdfEngine === 'vector') {
                      await handlePrintResume();
                    } else {
                      await handleExportPDF(selectedExportPageIds);
                    }
                    setShowPdfExportModal(false);
                  }}
                  className="flex-[1.5] flex items-center justify-center gap-1.5 px-4 py-3 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg text-center font-extrabold tracking-wider uppercase select-none cursor-pointer"
                >
                  {isExportingPDF || isPrinting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {pdfEngine === 'vector' ? (
                        <>
                          <svg className="w-4 h-4 text-emerald-300 animate-pulse animate-duration-1000" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                          <span>Open Print Utility</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-emerald-300 animate-pulse" />
                          <span>Direct Download</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* EXPORT SUITE WITH LIVE DOCUMENT PREVIEW MODAL LAYERING    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showExportSuiteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-5xl rounded-3xl bg-[#090e1f]/35 backdrop-blur-xl border border-white/10 shadow-2xl relative text-white overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowExportSuiteModal(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/40 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT COLUMN: ACTIONS PANEL WITH THEME TRANSPARENCY */}
              <div className="w-full md:w-[400px] border-r border-white/10 bg-[#060917]/35 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <div className="space-y-5">
                  {/* Header Title */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Download className="w-5 h-5 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight font-display">Export Center</h3>
                      <p className="text-[10px] text-white/50 leading-relaxed font-sans">
                        Fidelity preview, multi-channel dispatch & file compilers
                      </p>
                    </div>
                  </div>

                  {/* Document Scope Presets */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold block">
                      Export Scope
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setExportScope('full_suite');
                          const allPages = currentDraft ? getActiveDocumentPages(currentDraft) : [];
                          setSelectedExportPageIds(allPages.map(p => p.id));
                        }}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          exportScope === 'full_suite'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExportScope('resume_only');
                          const allPages = currentDraft ? getActiveDocumentPages(currentDraft) : [];
                          setSelectedExportPageIds(allPages.filter(p => p.type === 'resume').map(p => p.id));
                        }}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          exportScope === 'resume_only'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Resume
                      </button>
                      <button
                        type="button"
                        disabled={!currentDraft || !getActiveDocumentPages(currentDraft).some(p => p.type === 'cover')}
                        onClick={() => {
                          setExportScope('cover_only');
                          setSelectedExportPageIds(['cover']);
                        }}
                        className={`py-1.5 text-[9px] uppercase font-mono font-bold rounded-lg transition-all cursor-pointer disabled:opacity-20 ${
                          exportScope === 'cover_only'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Cover Letter
                      </button>
                    </div>
                  </div>

                  {/* Grid of four main requested action buttons */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold block mb-1">
                      Export Methods
                    </label>

                    {/* Button 1B: Save as PDF (Legacy Direct Canvas) */}
                    <button
                      type="button"
                      disabled={isExportingPDF}
                      onClick={() => handleExportPDF(selectedExportPageIds)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-950/40 to-slate-900/40 border-slate-500/20 hover:border-slate-500/40 transition-all text-left cursor-pointer group select-none disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-400 group-hover:scale-105 transition-all">
                          {isExportingPDF ? (
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight text-white/90">Save as PDF (Canvas Fallback)</p>
                          <p className="text-[9px] text-white/30 leading-none mt-0.5 font-sans">Offline snapshot download. Blocks in Iframe.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Button 2: Save as MS Word File */}
                    <button
                      type="button"
                      onClick={() => handleExportWord()}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-blue-500/20 hover:border-blue-500/40 transition-all text-left cursor-pointer group select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-all">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight text-white">Save as MS Word File</p>
                          <p className="text-[9px] text-white/40 leading-none mt-0.5 font-sans">Fully editable MS Word file</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Button 3: Print */}
                    <button
                      type="button"
                      disabled={isPrinting}
                      onClick={handlePrintResume}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-500/20 hover:border-amber-500/40 transition-all text-left cursor-pointer group select-none disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-all">
                          {isPrinting ? (
                            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Printer className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight text-white">Print Document</p>
                          <p className="text-[9px] text-white/40 leading-none mt-0.5 font-sans">Standard A4 page format layout</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 border-t border-white/5 text-[9px] font-mono text-white/30 text-center">
                  Live Dynamic Compiling • Ready
                </div>
              </div>

              {/* RIGHT COLUMN: HD PREVIEW PORT */}
              <div className="flex-1 bg-slate-900/10 backdrop-blur-xl overflow-hidden flex flex-col p-4 md:p-6 relative h-full">
                {/* Browser Mockup Top-Bar */}
                <div className="bg-slate-800/90 px-4 py-2.5 rounded-t-xl border-x border-t border-white/10 flex items-center justify-between z-10 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1 rounded-md border border-white/5 w-1/2 max-w-sm justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="truncate">a4_high_fidelity_payload.pdf</span>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    A4 Canvas Mode
                  </div>
                </div>

                {/* Preview Frame Area */}
                <div className="flex-1 border-x border-b border-white/10 bg-slate-955 rounded-b-xl overflow-hidden relative p-4 flex items-center justify-center">
                  <iframe
                    className="w-full h-full max-w-3xl border-0 bg-white shadow-2xl rounded-lg"
                    srcDoc={getCompiledPreviewHtml()}
                    title="Export Live Frame"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PRINTER SETUP OPTIONS & HELP MODAL OVERLAY                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showPrintHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#090e1f] border border-white/15 shadow-2xl relative text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Printer className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Print Layout Configuration</h3>
                  <p className="text-[10px] text-white/50">Auto-configured for standard A4 formatting</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Option/Setting block */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-[#a5b4fc] font-bold">Standard Print Settings</p>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span>📄 Target Sheet Size:</span>
                      <strong className="text-white">A4 (210mm x 297mm)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>🔄 Layout Style:</span>
                      <strong className="text-white">Full-Bleed Responsive</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>🎨 Color Adjust:</span>
                      <strong className="text-white">Exact Graphics (Force Backgrounds)</strong>
                    </div>
                  </div>
                </div>

                {/* NO PRINTER / ADD PRINTER INFORMATION BLOCK */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[10px] uppercase font-mono">
                    <span>⚠️ Printer Check & Diagnostics</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-amber-100/80 text-justify">
                    Your document has been pre-budgeted for A4 pages. If no physical printer is connected to your workstation, please click the <strong>&apos;Destination dropdown&apos;</strong> in the next screen and select <strong>&apos;Save as PDF&apos;</strong> or <strong>&apos;Add Printer...&apos;</strong> to link a local printer.
                  </p>
                </div>

                {/* PRINT STEPS CHECKLIST */}
                <div className="space-y-1 text-[10px] text-white/60 font-mono">
                  <p className="font-extrabold uppercase text-[#a5b4fc]">Before you print checklist:</p>
                  <p>✓ Enable <strong>&quot;Background Graphics&quot;</strong> to preserve template themes</p>
                  <p>✓ Set margins to <strong>&quot;Default&quot;</strong> or <strong>&quot;None&quot;</strong></p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrintHelpModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/10 transition-all text-xs cursor-pointer"
                  >
                    Close Wizard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrintHelpModal(false);
                      setTimeout(() => {
                        handlePrintResume();
                      }, 300);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold tracking-wider uppercase border border-white/10 shadow-lg transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Proceed to Print</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL PAGE PREVIEW MODAL */}
      <AnimatePresence>
        {showFullPagePreview && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b132b] border border-white/10 rounded-3xl max-w-4xl w-full shadow-3xl text-white relative flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header inside the modal with control actions */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/45">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/25">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight font-display text-white">Full-Screen Layout Preview</h3>
                    <p className="text-[10px] text-blue-200/60 font-mono">Verify exact bounds, colors, and styling rules before printing</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullPagePreview(false);
                      setTimeout(() => {
                        setShowPrintHelpModal(true);
                      }, 300);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Page</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFullPagePreview(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl border border-white/10 transition-all cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable container for the actual high-fidelity resume layout */}
              <div className="p-8 overflow-y-auto flex-1 bg-slate-950/50 flex justify-center items-start scrollbar-thin scrollbar-thumb-white/10">
                <div className="w-full max-w-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/40 p-1.5 rounded-[32px] shadow-2xl border border-white/5">
                  
                  {/* Reuse the custom resume builder renderer inside the preview modal */}
                  {(() => {
                    if (!currentDraft) return null;
                    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft.templateId) || TEMPLATES[10];
                    const isDarkTheme = activeTemplate && (
                      activeTemplate.name.toLowerCase().includes('black') || 
                      activeTemplate.name.toLowerCase().includes('luxury') || 
                      activeTemplate.name.toLowerCase().includes('dark') || 
                      activeTemplate.name.toLowerCase().includes('midnight') || 
                      activeTemplate.name.toLowerCase().includes('cosmic') || 
                      activeTemplate.name.toLowerCase().includes('visionos') || 
                      activeTemplate.name.toLowerCase().includes('cyberpunk') || 
                      activeTemplate.name.toLowerCase().includes('plum')
                    );

                    const innerCardClass = isDarkTheme
                      ? "bg-slate-950/80 backdrop-blur-md border border-white/15 text-white"
                      : "bg-white text-slate-900 shadow-xl border border-slate-200/80";

                    const textPrimary = isDarkTheme ? "text-white" : "text-slate-900";
                    const textSecondary = isDarkTheme ? "text-amber-300" : "text-blue-600";
                    const textMuted = isDarkTheme ? "text-slate-300/85" : "text-slate-500";
                    const borderClass = isDarkTheme ? "border-white/10" : "border-slate-200/80";
                    const tagBgClass = isDarkTheme ? "bg-white/10 border border-white/10 text-blue-200" : "bg-slate-100/95 border border-slate-200/60 text-slate-600";
                    const textSummaryClass = isDarkTheme ? "text-slate-200" : "text-slate-600";

                    return (
                      <div className={`rounded-[28px] p-8 relative overflow-hidden flex flex-col gap-6 min-h-[600px] transition-all duration-300 bg-gradient-to-br ${activeTemplate.primaryColor}`}>
                        
                        {/* Dynamic Floating Background Orbs / Decors */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                          {(activeTemplate.name.toLowerCase().includes('sphere') || activeTemplate.name.toLowerCase().includes('orb') || activeTemplate.layout.toLowerCase().includes('orb') || activeTemplate.layout.toLowerCase().includes('sphere')) && (
                            <>
                              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/15 border border-white/30 blur-sm animate-pulse" />
                              <div className="absolute top-12 right-12 w-24 h-24 rounded-full bg-white/10 border border-white/20 blur-[1px]" />
                            </>
                          )}
                          {(activeTemplate.name.toLowerCase().includes('blob') || activeTemplate.name.toLowerCase().includes('wave') || activeTemplate.name.toLowerCase().includes('mesh') || activeTemplate.name.toLowerCase().includes('aurora') || activeTemplate.layout.toLowerCase().includes('wave') || activeTemplate.layout.toLowerCase().includes('mesh')) && (
                            <>
                              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl" />
                              <div className="absolute -bottom-16 right-4 w-56 h-56 rounded-full bg-amber-400/15 blur-2xl" />
                            </>
                          )}
                          {(activeTemplate.name.toLowerCase().includes('cube') || activeTemplate.name.toLowerCase().includes('geometric') || activeTemplate.layout.toLowerCase().includes('hex') || activeTemplate.layout.toLowerCase().includes('geometric')) && (
                            <>
                              <div className="absolute right-8 top-12 w-20 h-20 border-2 border-white/20 rotate-45 bg-white/5 rounded-xl" />
                              <div className="absolute left-10 bottom-8 w-14 h-14 border border-white/10 -rotate-12 bg-white/5 rounded-lg" />
                            </>
                          )}
                        </div>

                        {/* White/Dark Frosty card with full-screen dimensions */}
                        <div className={`rounded-xl p-7 flex flex-col gap-5 relative z-10 ${innerCardClass} shadow-3xl`}>
                          
                          {/* Photo and Header details */}
                          <div className={`border-b pb-4 ${borderClass}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                              
                              {/* Photo */}
                              {!((currentDraft.deletedFields || []).includes('profilePhoto')) && (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-amber-400/50 flex-shrink-0 flex items-center justify-center shadow-lg">
                                  {currentDraft.profilePhoto ? (
                                    <img
                                      src={currentDraft.profilePhoto}
                                      alt="CV Photo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-slate-400">
                                      <User className="w-6 h-6" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex-grow">
                                <h2 className={`text-xl font-extrabold tracking-tight leading-none ${textPrimary}`}>
                                  {currentDraft.fullName || 'SIRAJ AHMED'}
                                </h2>
                                <p className={`text-xs font-mono tracking-widest font-black uppercase mt-1.5 ${textSecondary}`}>
                                  {currentDraft.professionalTitle || 'SENIOR SOLUTIONS ARCHITECT'}
                                </p>

                                {/* Identity Flags */}
                                <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
                                  {!((currentDraft.deletedFields || []).includes('nationality')) && (
                                    <span className={`rounded-md px-2 py-0.5 ${tagBgClass}`}>
                                      {getNationalityFlag(currentDraft.nationality)} {currentDraft.nationality || 'Nationality Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('dateOfBirth')) && (
                                    <span className={`rounded-md px-2 py-0.5 ${tagBgClass}`}>
                                      📅 {currentDraft.dateOfBirth || 'DOB Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('gender')) && (
                                    <span className={`rounded-md px-2 py-0.5 ${tagBgClass}`}>
                                      👤 {currentDraft.gender || 'Gender Unspecified'}
                                    </span>
                                  )}
                                  {!((currentDraft.deletedFields || []).includes('maritalStatus')) && (
                                    <span className={`rounded-md px-2 py-0.5 ${tagBgClass}`}>
                                      ❤️ {currentDraft.maritalStatus || 'Single'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contact bar */}
                            <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[10px] mt-4 border-t pt-3 font-mono ${borderClass} ${textMuted}`}>
                              {!((currentDraft.deletedFields || []).includes('email')) && (
                                <span className="flex items-center gap-1">📧 {currentDraft.email || 'siraj@example.com'}</span>
                              )}
                              {!((currentDraft.deletedFields || []).includes('phone')) && (
                                <span className="flex items-center gap-1">📞 {getPhoneFlag(currentDraft.phone) ? `${getPhoneFlag(currentDraft.phone)} ` : ''}{currentDraft.phone || '+971 501 2345'}</span>
                              )}
                              {!((currentDraft.deletedFields || []).includes('address')) && (
                                <span className="flex items-center gap-1">📍 {currentDraft.address || 'Dubai, UAE'}</span>
                              )}
                              {currentDraft.customFields && currentDraft.customFields.map((field) => (
                                <span key={field.id} className="flex items-center gap-1">✨ {field.label || 'Custom'}: {field.value || 'N/A'}</span>
                              ))}
                            </div>
                          </div>

                          {/* Executive Summary */}
                          {currentDraft.summary && (
                            <div className="text-left">
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-1.5 font-mono ${textSecondary}`}>
                                Executive Objective
                              </h4>
                              <p className={`text-xs leading-relaxed font-sans ${textSummaryClass} opacity-90`}>
                                {currentDraft.summary}
                              </p>
                            </div>
                          )}

                          {/* Experiences */}
                          {currentDraft.experiences && currentDraft.experiences.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                <Briefcase className="w-3.5 h-3.5" /> Professional Experience
                              </h4>
                              <div className="space-y-3.5 text-left">
                                {currentDraft.experiences.map((exp) => (
                                  <div key={exp.id}>
                                    <div className="flex justify-between items-start text-xs gap-1 font-semibold">
                                      <span className={`${textPrimary} font-bold`}>{exp.position || 'Software Engineer'}</span>
                                      <span className={`text-[10px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{exp.duration || '2022 - Present'}</span>
                                    </div>
                                    <p className={`text-xs font-medium font-sans ${textSecondary} opacity-90`}>{exp.company || 'Acme Corp'}</p>
                                    {exp.details && (
                                      <p className={`text-xs leading-relaxed font-sans mt-1 opacity-85 ${textSummaryClass}`}>
                                        {exp.details}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {currentDraft.education && currentDraft.education.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2.5 font-mono ${textSecondary} flex items-center gap-1`}>
                                <GraduationCap className="w-3.5 h-3.5" /> Academic & Education
                              </h4>
                              <div className="space-y-2.5">
                                {currentDraft.education.map((edu) => (
                                  <div key={edu.id} className="text-left text-xs">
                                    <div className="flex justify-between items-start font-semibold gap-1">
                                      <span className={`${textPrimary} font-bold`}>{edu.degree || 'Bachelor of Science'}</span>
                                      <span className={`text-[10px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{edu.duration || '2018 - 2022'}</span>
                                    </div>
                                    <p className={`text-xs font-sans opacity-95 ${textSummaryClass}`}>{edu.school || 'Global Tech University'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {currentDraft.skills && currentDraft.skills.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                <PenTool className="w-3.5 h-3.5" /> Core Expertise & Skills
                              </h4>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {currentDraft.skills.map((skill, index) => (
                                  <span key={index} className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-semibold ${tagBgClass}`}>
                                    ⚡ {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Projects */}
                          {currentDraft.projects && currentDraft.projects.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2.5 font-mono ${textSecondary} flex items-center gap-1`}>
                                <FileText className="w-3.5 h-3.5" /> Core Initiatives & Projects
                              </h4>
                              <div className="space-y-3">
                                {currentDraft.projects.map((proj) => (
                                  <div key={proj.id} className="text-left text-xs">
                                    <div className="flex justify-between items-start gap-1 font-semibold">
                                      <span className={`${textPrimary} font-bold`}>{proj.title || 'Enterprise Portal'}</span>
                                      <span className={`text-[10px] font-mono text-right whitespace-nowrap opacity-80 ${textMuted}`}>{proj.duration || '3 Months'}</span>
                                    </div>
                                    <p className={`text-xs font-sans ${textSecondary}`}>{proj.role || 'Lead Engineer'}</p>
                                    {proj.details && (
                                      <p className={`text-xs leading-relaxed font-sans mt-1 opacity-80 ${textSummaryClass}`}>
                                        {proj.details}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certifications */}
                          {currentDraft.certifications && currentDraft.certifications.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                <Award className="w-3.5 h-3.5" /> Official Certifications
                              </h4>
                              <div className="space-y-2">
                                {currentDraft.certifications.map((cert) => (
                                  <div key={cert.id} className="text-left text-xs flex justify-between items-center gap-2">
                                    <div>
                                      <span className={`font-bold ${textPrimary}`}>{cert.title || 'AWS Architect'}</span>
                                      <span className={`opacity-85 ml-1.5 ${textMuted}`}>• {cert.issuer || 'Amazon Web Services'}</span>
                                    </div>
                                    <span className={`text-[9.5px] font-mono whitespace-nowrap opacity-85 ${textMuted}`}>{cert.date || '2023'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trainings & courses list */}
                          {currentDraft.trainings && currentDraft.trainings.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Training & Specializations
                              </h4>
                              <div className="space-y-2.5">
                                {currentDraft.trainings.map((trn) => (
                                  <div key={trn.id} className="text-left text-xs">
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <span className={`font-bold ${textPrimary}`}>{trn.title || 'Specialized Course'}</span>
                                        <span className={`opacity-85 ml-1.5 ${textMuted}`}>• {trn.provider || 'E-Learning'}</span>
                                      </div>
                                      <span className={`text-[9.5px] font-mono whitespace-nowrap opacity-85 ${textMuted}`}>{trn.date || '2026'}</span>
                                    </div>
                                    {trn.details && (
                                      <p className={`text-xs leading-relaxed font-sans mt-1 opacity-80 ${textSummaryClass} whitespace-pre-wrap`}>
                                        {trn.details}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Languages */}
                          {currentDraft.languages && currentDraft.languages.length > 0 && (
                            <div className={`border-t pt-3 ${borderClass}`}>
                              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono ${textSecondary} flex items-center gap-1`}>
                                <Languages className="w-3.5 h-3.5" /> Languages Support
                              </h4>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {currentDraft.languages.map((lang) => (
                                  <span key={lang.id} className={`rounded-lg px-2.5 py-0.5 text-[10px] font-mono font-semibold ${tagBgClass}`}>
                                    🌐 {lang.name || 'English'} <span className="opacity-75 font-normal text-[9.5px]">({lang.proficiency || 'Fluent'})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Bottom bar of modal */}
              <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-slate-900/40 select-none">
                <button
                  type="button"
                  onClick={() => setShowFullPagePreview(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            {/* Background click guardian */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSettingsModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`w-full max-w-2xl rounded-[30px] shadow-3xl flex flex-col overflow-hidden max-h-[90vh] z-10 relative border backdrop-blur-xl bg-transparent ${
                isDarkMode 
                  ? 'border-white/10 text-white' 
                  : 'border-slate-205 text-slate-800 shadow-slate-200/50 light-theme-form-override'
              }`}
            >
              <div className="h-[3px] w-full bg-gradient-to-r from-[#ef4444] via-[#fbbf24] to-[#10b981]" />

              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between select-none ${
                isDarkMode ? 'border-white/10 bg-black/20 text-white' : 'border-slate-100 bg-slate-50 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Settings className={`w-5 h-5 animate-spin ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} style={{ animationDuration: '6s' }} />
                  <div>
                    <h3 className={`font-extrabold text-sm font-display tracking-tight uppercase font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Applet Settings</h3>
                    <p className={`text-[9.5px] font-mono tracking-widest ${isDarkMode ? 'text-[#fbbf24]' : 'text-amber-600'}`}>SIRAJ RESUME BUILDER PRO</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border-slate-200'
                  }`}
                  title="Close Settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body (Tabs + Content split) */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                
                {/* Side Tabs navigation */}
                <div className={`w-full md:w-48 border-b md:border-b-0 md:border-r p-3 flex flex-col justify-between shrink-0 ${
                  isDarkMode ? 'bg-black/15 border-white/10' : 'bg-slate-50/50 border-slate-150'
                }`}>
                  <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full shrink-0">
                    <button
                      type="button"
                      onClick={() => setSettingsTab('themes')}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                        settingsTab === 'themes' 
                          ? isDarkMode 
                            ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/10 scale-[1.01]' 
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm scale-[1.01]'
                          : isDarkMode 
                            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <Sparkle className="w-3.5 h-3.5" />
                      Themes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('about')}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                        settingsTab === 'about' 
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/10 scale-[1.01]'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm scale-[1.01]'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      About Us
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('privacy')}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                        settingsTab === 'privacy' 
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/10 scale-[1.01]'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm scale-[1.01]'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Privacy Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('terms')}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                        settingsTab === 'terms' 
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/10 scale-[1.01]'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm scale-[1.01]'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Terms & Conditions
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('features')}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                        settingsTab === 'features' 
                          ? isDarkMode
                            ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/10 scale-[1.01]'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm scale-[1.01]'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                      }`}
                    >
                      <Presentation className="w-3.5 h-3.5 text-amber-400" />
                      About App Features
                    </button>
                  </div>

                  {/* System Version Footing - First Stable Release */}
                  <div className={`mt-auto pt-4 border-t px-4 hidden md:block select-none ${
                    isDarkMode ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1 justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a5b4fc]">SYSTEM BUILD</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md font-bold font-mono">v1.0.0</span>
                    </div>
                    <p className="text-[9.5px] font-mono opacity-85 leading-normal">First Stable Production Release</p>
                  </div>
                </div>

                {/* Tab Content window */}
                <div className={`flex-1 p-6 overflow-y-auto min-h-0 ${isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50'}`}>
                  {settingsTab === 'themes' && (
                    <div className="space-y-4">
                      {/* Notifications Preferences Switch */}
                      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/2 hover:border-white/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            notificationsEnabled 
                              ? isDarkMode 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-emerald-50 text-emerald-600'
                              : isDarkMode 
                                ? 'bg-rose-500/10 text-rose-400' 
                                : 'bg-rose-50 text-rose-600'
                          }`}>
                            {notificationsEnabled ? (
                              <Bell className="w-4 h-4 animate-bounce" style={{ animationDuration: '4s' }} />
                            ) : (
                              <BellOff className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h5 className={`text-xs font-extrabold uppercase tracking-wide font-sans ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>App Notifications</h5>
                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-tight mt-0.5 select-none`}>
                              {notificationsEnabled ? 'Banners, alerts, and autosave toast notifications are ENABLED.' : 'Banners, alerts, and autosave toast notifications are DISABLED.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          id="toggle_notifications"
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Onboarding Tutorial Replay Option */}
                      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/2 hover:border-white/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            isDarkMode 
                              ? 'bg-indigo-500/10 text-indigo-400' 
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            <HelpCircle className="w-4 h-4 animate-pulse" style={{ animationDuration: '3s' }} />
                          </div>
                          <div>
                            <h5 className={`text-xs font-extrabold uppercase tracking-wide font-sans ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>App Tutorial</h5>
                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} leading-tight mt-0.5 select-none`}>
                              Replay the interactive walkthrough of Siraj Resume Builder.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSettingsModal(false);
                            window.dispatchEvent(new CustomEvent('launch-onboarding'));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all border shrink-0 cursor-pointer ${
                            isDarkMode
                              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 hover:bg-indigo-600/50 hover:text-white'
                              : 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 hover:text-indigo-950'
                          }`}
                        >
                          Replay App Tutorial
                        </button>
                      </div>

                      <div className="border-b border-white/5 pb-2" />

                      <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">Select Interface Theme Style</h4>
                        <p className="text-[11px] text-slate-400 font-sans leading-normal">
                          This sets the overall cosmetic interface of the editor application, featuring custom ambient gradients, 3D elements, and status styling.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-2">
                        {THEMES.map((t) => {
                          const isSelected = activeThemeId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                 setActiveThemeId(t.id);
                              }}
                              className={`text-left rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group min-h-[120px] ${
                                isSelected 
                                  ? t.id === 'neon-glass-pro'
                                    ? 'border-purple-500/55 bg-purple-950/20 shadow-lg shadow-purple-500/20'
                                    : 'border-amber-400 bg-white/5 shadow-lg shadow-amber-500/5' 
                                  : 'border-white/10 bg-white/2 hover:border-white/25 hover:bg-white/4'
                              }`}
                            >
                              {/* Theme capsule color tags */}
                              <div className="flex items-center justify-between w-full mb-2">
                                <span className={`text-[9px] font-mono tracking-wide font-extrabold flex items-center gap-1.5 ${
                                  isSelected && t.id === 'neon-glass-pro' ? 'text-cyan-400' : 'text-[#fbbf24]'
                                }`}>
                                  <span className="w-2.5 h-2.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: t.accentColor }} />
                                  {isSelected ? '✓ Active Theme' : 'Select Theme'}
                                </span>
                              </div>

                              <div>
                                <p className={`text-[11px] font-bold tracking-tight group-hover:text-amber-200 transition-colors uppercase font-sans leading-none ${
                                  isSelected && t.id === 'neon-glass-pro' ? 'text-cyan-300' : 'text-white'
                                }`}>{t.name}</p>
                                <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-3 leading-snug font-sans">{t.description}</p>
                              </div>

                              {/* Aesthetic design gradient bar at bottom of card */}
                              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                                t.id === 'neon-glass-pro' ? 'from-purple-500 via-blue-500 to-cyan-400' :
                                t.id === 'ferrari-red-gold' ? 'from-red-600 to-amber-500' :
                                t.id === 'rolex-emerald-gold' ? 'from-emerald-700 to-amber-500' :
                                t.id === 'executive-red-black' ? 'from-black via-red-800 to-amber-500' :
                                t.id === 'orange-purple-mesh' ? 'from-orange-500 to-purple-650' :
                                t.id === 'gem-emerald' ? 'from-[#01796F] to-[#50c878]' :
                                t.id === 'gem-sapphire' ? 'from-[#0f52ba] to-[#3aafb9]' :
                                t.id === 'gem-amethyst' ? 'from-[#4a47a3] to-[#9966cc]' :
                                t.id === 'gem-ruby' ? 'from-[#7a0909] to-[#b31b1b]' :
                                t.id === 'gem-citrine' ? 'from-[#b86f08] to-[#ffd700]' :
                                'from-blue-600 to-teal-400'
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {settingsTab === 'about' && (
                    <div className="space-y-5 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                          <User className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold tracking-tight text-white uppercase font-display">About Us</h4>
                          <p className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Siraj Resume Builder</p>
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-slate-300 space-y-4">
                        <p>
                          Welcome to <strong className="text-white">Siraj Resume Builder</strong>, your trusted partner for creating professional resumes, CVs, and cover letters with ease and confidence.
                        </p>
                        <p>
                          Founded by <strong className="text-indigo-300 font-semibold">Siraj Ahmed</strong>, Siraj Resume Builder is designed to help students, fresh graduates, and professionals build impressive and ATS-friendly resumes through beautiful templates and modern design tools. Our mission is to make resume creation simple, accessible, and professional for everyone.
                        </p>
                        <p>
                          With a wide collection of stylish templates, customizable sections, and easy PDF export options, we aim to help users present their skills and achievements in the best possible way and take the next step toward their dream careers.
                        </p>
                        <p className="font-semibold text-slate-200">
                          At Siraj Resume Builder, we believe that a great future starts with a great first impression.
                        </p>
                        
                        <div className="text-center py-2 text-indigo-300 font-extrabold text-xs tracking-wider uppercase">
                          Build Your Dream • Build Your Future
                        </div>

                        <hr className="border-white/10 my-4" />

                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-white">Developer Information</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 font-mono">
                            <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                              <span className="text-slate-400 block mb-0.5">Developer:</span>
                              <span className="text-white font-bold">Siraj Ahmed</span>
                            </div>
                            <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                              <span className="text-slate-400 block mb-0.5">Email:</span>
                              <a href="mailto:seeraajs@gmail.com" className="text-indigo-400 hover:underline">seeraajs@gmail.com</a>
                            </div>
                            <div className="p-2 bg-black/20 rounded-lg border border-white/5 sm:col-span-2">
                              <span className="text-slate-400 block mb-0.5">Location:</span>
                              <span className="text-white">Dubai, United Arab Emirates</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 italic pt-1">
                            Thank you for choosing Siraj Resume Builder. We are committed to continuously improving the app and providing the best experience for our users.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'privacy' && (
                    <div className="space-y-5 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                          <Shield className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold tracking-tight text-white uppercase font-display">Privacy Policy</h4>
                          <p className="text-[10px] font-mono tracking-widest text-[#fbbf24] uppercase">Effective: June 20, 2026</p>
                        </div>
                      </div>

                      <div className="text-[11.5px] leading-relaxed text-slate-300 space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p>
                          Welcome to <strong className="text-white">Siraj Resume Builder</strong>. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our application.
                        </p>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Information We Collect</h5>
                          <p>Siraj Resume Builder may collect and store the following information:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400">
                            <li>Personal information provided by you, such as your name, email address, phone number, and location.</li>
                            <li>Resume-related information including education, work experience, skills, certifications, and profile photos.</li>
                            <li>Documents and files created within the app.</li>
                            <li>Technical information required for app functionality and performance improvement.</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">How We Use Your Information</h5>
                          <p>We use your information to:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400">
                            <li>Create and manage your resumes, CVs, and cover letters.</li>
                            <li>Improve the features and functionality of the app.</li>
                            <li>Provide customer support and respond to inquiries.</li>
                            <li>Maintain the security and reliability of our services.</li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Data Storage</h5>
                          <p>
                            Your information may be stored securely using trusted cloud services such as Firebase. We take reasonable measures to protect your data from unauthorized access, disclosure, or misuse.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Third-Party Services</h5>
                          <p>Our app may use third-party services, including:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[10.5px]">
                            <li>Google Firebase</li>
                            <li>Google Analytics</li>
                            <li>Google Authentication Services</li>
                          </ul>
                          <p className="text-slate-400">These services may collect certain information in accordance with their own privacy policies.</p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Data Sharing</h5>
                          <p>
                            Siraj Resume Builder does not sell, rent, or trade your personal information to third parties. Your information is only used to provide and improve the services offered by the app.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Data Security</h5>
                          <p>
                            We are committed to protecting your information and implementing appropriate security measures. However, no method of electronic storage or transmission over the internet can guarantee absolute security.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Children&apos;s Privacy</h5>
                          <p>
                            Siraj Resume Builder is intended for general users and does not knowingly collect personal information from children under the age of 13.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">Changes to This Privacy Policy</h5>
                          <p>
                            We may update this Privacy Policy from time to time. Any changes will be posted within the app, and continued use of the app constitutes acceptance of the updated policy.
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl mt-4">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-white mb-2">Contact Us</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            If you have any questions regarding this Privacy Policy or our services, please contact:
                          </p>
                          <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5">
                            <p><strong className="text-white font-semibold">Siraj Ahmed</strong></p>
                            <p>Email: <a href="mailto:seeraajs@gmail.com" className="text-indigo-400 hover:underline">seeraajs@gmail.com</a></p>
                            <p>Location: Dubai, United Arab Emirates</p>
                          </div>
                        </div>

                        <div className="text-center pt-3 text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase">
                          Build Your Dream • Build Your Future
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'terms' && (
                    <div className="space-y-5 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/25">
                          <FileText className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold tracking-tight text-white uppercase font-display">Terms & Conditions</h4>
                          <p className="text-[10px] font-mono tracking-widest text-[#fbbf24] uppercase">Effective: June 20, 2026</p>
                        </div>
                      </div>

                      <div className="text-[11.5px] leading-relaxed text-slate-300 space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p>
                          Welcome to <strong className="text-white">Siraj Resume Builder</strong>. By accessing or using this application, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services.
                        </p>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">1. Acceptance of Terms</h5>
                          <p>
                            By using Siraj Resume Builder, you acknowledge that you have read, understood, and agreed to these Terms & Conditions. If you do not agree with any part of these terms, please discontinue using the app.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">2. Use of the Application</h5>
                          <p>
                            Siraj Resume Builder is designed to help users create professional resumes, CVs, and cover letters. Users agree to use the app only for lawful purposes and in accordance with applicable laws and regulations.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">3. User Responsibilities</h5>
                          <p>Users are responsible for:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400">
                            <li>Providing accurate and up-to-date information.</li>
                            <li>Maintaining the confidentiality of their account credentials.</li>
                            <li>Ensuring that the content they create does not violate any laws or third-party rights.</li>
                            <li>Using the application in a responsible and ethical manner.</li>
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">4. Intellectual Property</h5>
                          <p>
                            All content, designs, logos, graphics, and software associated with Siraj Resume Builder are the property of Siraj Resume Builder and are protected by applicable intellectual property laws. Unauthorized copying, reproduction, or distribution is prohibited.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">5. User Content</h5>
                          <p>
                            Users retain ownership of the information and documents they create using the app. However, users are solely responsible for the accuracy and legality of the content they submit.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">6. Privacy</h5>
                          <p>
                            Your use of the app is also governed by our Privacy Policy. By using Siraj Resume Builder, you agree to the collection and use of information as described in the Privacy Policy.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">7. Third-Party Services</h5>
                          <p>The app may utilize third-party services, including but not limited to:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[10.5px]">
                            <li>Google Firebase</li>
                            <li>Google Authentication Services</li>
                            <li>Google Analytics</li>
                          </ul>
                          <p className="text-slate-450">These services are governed by their respective terms and privacy policies.</p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">8. Limitation of Liability</h5>
                          <p>
                            Siraj Resume Builder and its developer shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the application. Users are responsible for verifying the accuracy of the documents they create.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">9. Service Availability</h5>
                          <p>
                            We strive to provide reliable services; however, we do not guarantee uninterrupted or error-free operation. Features and services may be modified, suspended, or discontinued at any time without prior notice.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">10. Modifications to Terms</h5>
                          <p>
                            We reserve the right to update or modify these Terms & Conditions at any time. Continued use of the application following any changes constitutes acceptance of the revised terms.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wide">11. Termination</h5>
                          <p>
                            We reserve the right to restrict or terminate access to the app if users violate these Terms & Conditions or engage in unlawful activities.
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl mt-4">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-white mb-2">12. Contact Information</h5>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            If you have any questions regarding these Terms & Conditions, please contact:
                          </p>
                          <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5">
                            <p><span className="text-slate-400">Developer:</span> <strong className="text-white font-semibold">Siraj Ahmed</strong></p>
                            <p>Email: <a href="mailto:seeraajs@gmail.com" className="text-indigo-400 hover:underline">seeraajs@gmail.com</a></p>
                            <p>Location: Dubai, United Arab Emirates</p>
                          </div>
                        </div>

                        <div className="text-center pt-3 text-indigo-300 font-extrabold text-[10px] tracking-wider uppercase">
                          Build Your Dream • Build Your Future
                        </div>
                      </div>
                    </div>
                  )}


                  {settingsTab === 'features' && (
                    <div className="space-y-5 font-sans">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div>
                          <h4 className="text-sm font-extrabold tracking-tight text-white uppercase font-display select-none">About App Features</h4>
                          <p className="text-[10px] text-slate-400 mt-1 select-none">Interactive feature presentation deck & offline PowerPoint slides.</p>
                        </div>
                      </div>

                      {/* Interactive Presentation Deck Frame */}
                      <div className="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden relative shadow-inner p-5 sm:p-7 min-h-[300px] flex flex-col justify-between">
                        {/* Slide Contents mapped by activeSlideIndex */}
                        <AnimatePresence mode="wait">
                          {activeSlideIndex === 0 && (
                            <motion.div
                              key="slide-0"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="class-slide-content space-y-3 flex-1 flex flex-col justify-center text-center"
                            >
                              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                                <Cpu className="w-7 h-7 animate-pulse" />
                              </div>
                              <h3 className="text-xl font-black text-amber-300 tracking-tight font-display select-none uppercase">SIRAJ RESUME BUILDER PRO</h3>
                              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                                Experience an elegant, responsive, and secure professional document building workspace engineered for high converting designs.
                              </p>
                              <div className="text-[9px] font-mono tracking-widest text-indigo-400 font-bold mt-2">
                                FIRST PRODUCTION RELEASE • v1.0.0
                              </div>
                            </motion.div>
                          )}

                          {activeSlideIndex === 1 && (
                            <motion.div
                              key="slide-1"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="class-slide-content space-y-4 flex-1 text-left"
                            >
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono font-bold text-amber-400 select-none bg-amber-500/10 px-2 py-0.5 rounded">01 / 04</span>
                                <h3 className="text-sm font-extrabold text-white uppercase font-all tracking-wide">Multi-Page & Responsive Layouts</h3>
                              </div>
                              <p className="text-xs text-slate-300 leading-normal">
                                Transition on-the-fly between diverse styling profiles designed to catch recruiters&apos; eyes instantly.
                              </p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-slate-400">
                                <li className="flex items-start gap-1.5"><span className="text-amber-400">⚡</span> Luxury Resume Layout Templates</li>
                                <li className="flex items-start gap-1.5"><span className="text-amber-400">⚡</span> Live stylesheet dynamic injection</li>
                                <li className="flex items-start gap-1.5"><span className="text-amber-400">⚡</span> Complete Demographic biometrics</li>
                                <li className="flex items-start gap-1.5"><span className="text-amber-400">⚡</span> Perfect tablet & mobile fluid states</li>
                              </ul>
                            </motion.div>
                          )}

                          {activeSlideIndex === 2 && (
                            <motion.div
                              key="slide-2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="class-slide-content space-y-4 flex-1 text-left"
                            >
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono font-bold text-indigo-400 select-none bg-indigo-500/10 px-2 py-0.5 rounded">02 / 04</span>
                                <h3 className="text-sm font-extrabold text-white uppercase font-all tracking-wide">High-Fidelity Formatted Exports</h3>
                              </div>
                              <p className="text-xs text-slate-300 leading-normal">
                                Secure pristine outputs with multi-format compilers matching strict industry delivery protocols:
                              </p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-slate-400">
                                <li className="flex items-start gap-1.5"><span className="text-indigo-400">✓</span> Error-free MS Word (.docx) files</li>
                                <li className="flex items-start gap-1.5"><span className="text-indigo-400">✓</span> No unreadable content artifacts</li>
                                <li className="flex items-start gap-1.5"><span className="text-indigo-400">✓</span> Exact browser-native A4 PDF printing</li>
                                <li className="flex items-start gap-1.5"><span className="text-indigo-400">✓</span> Multi-page selective scope printing</li>
                              </ul>
                            </motion.div>
                          )}

                          {activeSlideIndex === 3 && (
                            <motion.div
                              key="slide-3"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="class-slide-content space-y-4 flex-1 text-left"
                            >
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono font-bold text-pink-400 select-none bg-pink-500/10 px-2 py-0.5 rounded">03 / 04</span>
                                <h3 className="text-sm font-extrabold text-white uppercase font-all tracking-wide">Autosave Persistence & Privacy</h3>
                              </div>
                              <p className="text-xs text-slate-300 leading-normal">
                                Your drafts survive browser refreshes without exposing personal details to external databases.
                              </p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-slate-400">
                                <li className="flex items-start gap-1.5"><span className="text-pink-400">🔒</span> Offline local browser storage</li>
                                <li className="flex items-start gap-1.5"><span className="text-pink-400">🔒</span> Continuous background backups</li>
                                <li className="flex items-start gap-1.5"><span className="text-pink-400">🔒</span> Fast recovery archive windows</li>
                                <li className="flex items-start gap-1.5"><span className="text-pink-400">🔒</span> Zero server tracking pipeline designs</li>
                              </ul>
                            </motion.div>
                          )}

                          {activeSlideIndex === 4 && (
                            <motion.div
                              key="slide-4"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="class-slide-content space-y-4 flex-1 text-left"
                            >
                              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 select-none bg-emerald-500/10 px-2 py-0.5 rounded">04 / 04</span>
                                <h3 className="text-sm font-extrabold text-white uppercase font-all tracking-wide">Branded Presentation Slides Exporter</h3>
                              </div>
                              <p className="text-xs text-slate-300 leading-normal">
                                Stand out during executive boards and interviews by rendering widescreen presentations in a single click:
                              </p>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] text-slate-400">
                                <li className="flex items-start gap-1.5"><span className="text-emerald-400">★</span> Fully editable widescreen .pptx decks</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-400">★</span> Perfect Microsoft PowerPoint sync</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-400">★</span> Instant experiences & resume mappings</li>
                                <li className="flex items-start gap-1.5"><span className="text-emerald-400">★</span> Professional executive layout designs</li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Interactive Slide Controls Footer */}
                        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6 select-none">
                          <button
                            type="button"
                            onClick={() => setActiveSlideIndex(prev => prev === 0 ? 4 : prev - 1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all cursor-pointer active:scale-90"
                            title="Previous Slide"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Dots indicator array */}
                          <div className="flex items-center gap-2 select-none">
                            {[0, 1, 2, 3, 4].map((idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveSlideIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                  activeSlideIndex === idx ? 'bg-amber-400 scale-125' : 'bg-slate-600'
                                }`}
                                title={`Go to slide ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveSlideIndex(prev => prev === 4 ? 0 : prev + 1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all cursor-pointer active:scale-90"
                            title="Next Slide"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-3.5 text-[10px] text-indigo-300 leading-normal text-center select-none">
                        💡 <strong>Pro Tip</strong>: Easily browse through the slide deck above to explore all version 1.0.0 features of this application.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 border-t border-white/10 flex justify-end gap-2 bg-black/20 select-none">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase cursor-pointer transition-all border border-amber-500/20 shadow-lg"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* FULL-SCREEN CAROUSEL PRINT PREVIEW MODAL OVERLAY */}
      <AnimatePresence>
        {carouselPreviewOpen && currentDraft && (
          <div id="carousel_print_preview_overlay" className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col justify-between overflow-hidden p-6 text-white no-print">
            
            {/* Modal Header details */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Layers className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight font-display text-white flex items-center gap-2">
                    <span>Interactive Document Print Center</span>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold">CAROUSEL ACTIVATE</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Sleek visual carousel. Browse pages and select any sheet to trigger an exact high-fidelity print</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
                    setIsPrinting(true);
                    try {
                      const htmlContent = buildFullExportHtml(currentDraft, 'full_suite', activeTemplate);
                      const processedHtmlContent = replaceOklchColors(htmlContent);
                      
                      const printFrame = document.createElement('iframe');
                      printFrame.name = "print_full_suite_frame";
                      printFrame.style.position = 'absolute';
                      printFrame.style.width = '0px';
                      printFrame.style.height = '0px';
                      printFrame.style.border = 'none';
                      printFrame.style.left = '-10000px';
                      printFrame.style.top = '-10000px';
                      document.body.appendChild(printFrame);
                      
                      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
                      if (!frameDoc) throw new Error("Could not access iframe document");
                      
                      frameDoc.open();
                      frameDoc.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>${currentDraft.fullName || 'Siraj Ahmed'} - Full Suite</title>
                            <style>
                              @media print {
                                @page {
                                  size: A4 portrait;
                                  margin: 0;
                                }
                                body {
                                  margin: 0;
                                  padding: 0;
                                  -webkit-print-color-adjust: exact !important;
                                  print-color-adjust: exact !important;
                                }
                              }
                              body {
                                margin: 0;
                                padding: 0;
                                font-family: system-ui, -apple-system, sans-serif;
                                background-color: #ffffff;
                              }
                              img {
                                max-width: 100%;
                                height: auto;
                              }
                            </style>
                          </head>
                          <body>
                            ${processedHtmlContent}
                          </body>
                        </html>
                      `);
                      frameDoc.close();
                      
                      try {
                        const images = Array.from(frameDoc.getElementsByTagName('img'));
                        await Promise.all(images.map(img => {
                          if (img.complete) return Promise.resolve();
                          return new Promise<void>(resolve => {
                            img.onload = () => resolve();
                            img.onerror = () => resolve();
                          });
                        }));
                      } catch (e) {
                        console.warn("Failed to load images in custom full print: ", e);
                      }
                      
                      await new Promise(resolve => setTimeout(resolve, 350));
                      printFrame.contentWindow?.focus();
                      printFrame.contentWindow?.print();
                      
                      setTimeout(() => {
                        try {
                          if (printFrame.parentNode) {
                            document.body.removeChild(printFrame);
                          }
                        } catch (e) {}
                      }, 2000);
                    } catch (e) {
                      console.error("Print full suite error: ", e);
                    } finally {
                      setIsPrinting(false);
                    }
                  }}
                  disabled={isPrinting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 border border-indigo-500/35 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print All Pages ({activePages.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCarouselPreviewOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-white hover:text-amber-300 rounded-xl border border-white/10 transition-all cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider / Carousel stage */}
            <div className="flex items-center justify-center gap-6 py-4 flex-1 overflow-hidden relative">
              {/* Back controls navigation */}
              {activePages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentReviewPageIndex((prev) => (prev > 0 ? prev - 1 : activePages.length - 1));
                  }}
                  className="p-4 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white border border-white/10 rounded-full transition-all cursor-pointer shrink-0 z-10 active:scale-95 shadow-lg"
                  title="Previous Sheet"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Central display preview */}
              <div className="flex flex-col items-center gap-4.5 max-w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentReviewPageIndex}
                    initial={{ opacity: 0, x: 40, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    {/* Sheet metadata title tags */}
                    <div className="mb-2.5 px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-400/25 rounded-xl text-[10.5px] font-mono tracking-wider text-indigo-300 font-extrabold uppercase select-none shadow-md flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{activePages[currentReviewPageIndex]?.title}</span>
                    </div>

                    {/* Highly authentic scale-down visual sheet container */}
                    <div className="relative w-[300px] h-[424px] overflow-hidden rounded-2xl border-2 border-indigo-500/45 bg-[#090d1a] shadow-2.5xl flex-shrink-0 transition-transform hover:scale-[1.01] duration-300 select-none">
                      {(() => {
                        const pageItem = activePages[currentReviewPageIndex];
                        if (!pageItem) return null;
                        const activeTemplate = TEMPLATES.find(t => t.id === currentDraft?.templateId) || TEMPLATES[10];
                        
                        let pageHtml = '';
                        if (pageItem.type === 'cover') {
                          pageHtml = buildFullExportHtml(currentDraft, 'cover_only', activeTemplate);
                        } else {
                          pageHtml = buildFullExportHtml(currentDraft, 'resume_only', activeTemplate, pageItem.pageNum);
                        }

                        const processedHtml = replaceOklchColors(pageHtml);

                        return (
                          <div 
                            className="origin-top-left"
                            style={{
                              transform: 'scale(0.353)',
                              width: '850px',
                              height: '1198px',
                              userSelect: 'none',
                              pointerEvents: 'none',
                            }}
                            dangerouslySetInnerHTML={{ __html: processedHtml }}
                          />
                        );
                      })()}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Print selected sheet control */}
                <div className="flex justify-center mt-1.5 select-none z-10">
                  <button
                    type="button"
                    onClick={() => handlePrintPage(activePages[currentReviewPageIndex])}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center gap-2 cursor-pointer border border-amber-400/20 active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    <span>Print This Page Only</span>
                  </button>
                </div>
              </div>

              {/* Forward controls navigation */}
              {activePages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentReviewPageIndex((prev) => (prev < activePages.length - 1 ? prev + 1 : 0));
                  }}
                  className="p-4 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white border border-white/10 rounded-full transition-all cursor-pointer shrink-0 z-10 active:scale-95 shadow-lg"
                  title="Next Sheet"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Pagination Thumbnails / Direct Choose List */}
            <div className="flex flex-col gap-2 pt-4.5 border-t border-white/5 pb-2 select-none">
              <span className="text-[9px] font-mono font-bold text-center text-slate-400 uppercase tracking-widest block mb-1">Direct Page Selection List</span>
              <div className="flex justify-center items-center gap-3.5 max-w-full overflow-x-auto scrollbar-none pb-1 px-4">
                {activePages.map((page, idx) => {
                  const isActive = idx === currentReviewPageIndex;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setCurrentReviewPageIndex(idx)}
                      className={`px-3.5 py-2 hover:y-[-2px] text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between whitespace-nowrap min-w-[125px] active:scale-95 ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-xl shadow-indigo-500/5' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/90'
                      }`}
                    >
                      <span className="text-[8px] font-mono font-extrabold tracking-widest uppercase text-amber-300">
                        {page.type === 'cover' ? 'LETTER' : `SHEET 0${page.pageNum}`}
                      </span>
                      <span className="text-[11.5px] font-sans font-bold mt-1.5 block max-w-[130px] truncate leading-tight">
                        {page.title.split(' - ')[1] || page.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* AUTOSAVE & CONNECTIVITY TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {showSavedToast && notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`fixed bottom-6 right-6 z-55 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md select-none ${
              isDarkMode 
                ? 'bg-[#090e1f]/95 border-emerald-500/20 text-white shadow-[#042018]/40' 
                : 'bg-white/95 border-emerald-250 text-slate-800 shadow-slate-200/50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Draft Saved</p>
              <p className={`text-[9.5px] font-sans mt-0.5 leading-none ${
                isDarkMode ? 'text-white/45' : 'text-slate-500'
              }`}>
                Autosaved to browser storage
              </p>
            </div>
          </motion.div>
        )}
        {showOnlineToast && notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`fixed bottom-6 right-6 z-55 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md select-none ${
              isDarkMode 
                ? 'bg-[#090e1f]/95 border-indigo-500/20 text-white shadow-[#040e20]/40' 
                : 'bg-white/95 border-indigo-250 text-slate-800 shadow-slate-200/50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${
              isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Wifi className="w-3.5 h-3.5 stroke-[3px]" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Back Online</p>
              <p className={`text-[9.5px] font-sans mt-0.5 leading-none ${
                isDarkMode ? 'text-white/45' : 'text-slate-500'
              }`}>
                Connectivity successfully restored
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIRST-TIME USER ONBOARDING / INTERACTIVE TUTORIAL */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTutorial
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
