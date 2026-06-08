/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Building, 
  User, 
  Mail, 
  Globe, 
  Smartphone, 
  MapPin, 
  Palette, 
  Check, 
  Save, 
  Settings,
  HelpCircle,
  Upload,
  Image,
  Trash2,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { InstituteSettings, Student } from '../types';
import { Language, translations } from '../locales';
import CourseView from './CourseView';

interface SettingsViewProps {
  settings: InstituteSettings;
  onUpdateSettings: (updated: InstituteSettings) => void;
  lang: Language;
  
  // Tab Course props
  courses: string[];
  courseFees: Record<string, number>;
  students: Student[];
  onAddCourse: (name: string, fee: number) => void;
  onUpdateCourse: (oldName: string, newName: string, fee: number) => void;
  onDeleteCourse: (name: string) => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  lang,
  courses,
  courseFees,
  students,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse
}: SettingsViewProps) {
  const t = translations[lang];

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'whatsapp'>('profile');

  // Forms states
  const [instName, setInstName] = useState(settings.instituteName);
  const [owner, setOwner] = useState(settings.ownerName);
  const [email, setEmail] = useState(settings.email);
  const [web, setWeb] = useState(settings.website);
  const [mob1, setMob1] = useState(settings.mobile1);
  const [mob2, setMob2] = useState(settings.mobile2);
  const [address, setAddress] = useState(settings.address);
  const [activeTheme, setActiveTheme] = useState(settings.themeColor);

  // Unified Logo state
  const [logo, setLogo] = useState(settings.receiptLogo || settings.logo);

  // WhatsApp Message Template States
  const [waSubTab, setWaSubTab] = useState<'enquiry' | 'admission' | 'reminder' | 'receipt'>('enquiry');
  const [templateText, setTemplateText] = useState(settings.whatsAppTemplate || '');
  const [admissionTemplateText, setAdmissionTemplateText] = useState(settings.whatsAppAdmissionTemplate || `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

मनापासून अभिनंदन! ✨

*दिप्स कॉम्प्युटर्स* मध्ये *[कोर्सचे नाव]* या कोर्ससाठी तुमचा प्रवेश यशस्वीरीत्या निश्चित झाला आहे. 🎓

आम्हाला अत्यंत आनंद आहे की तुम्ही तुमच्या उज्ज्वल भविष्यासाठी आणि तंत्रज्ञानाच्या प्रवासासाठी आमची निवड केली. आम्ही तुम्हाला सर्वोत्तम शिक्षण आणि मार्गदर्शन देण्यास कटिबद्ध आहोत.

📅 *बॅचच्या वेळेबद्दल* आणि इतर माहितीसाठी कृपया सेंटरशी संपर्क साधा किंवा उद्यापासून ठरलेल्या वेळेत बॅचला उपस्थित रहा.

📍 *पत्ता:* बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन

📞 संपर्क: 9049102035 / 8888732035

*तुमच्यापुढील शैक्षणिक वाटचालीस हार्दिक शुभेच्छा!* 🚀`);
  const [reminderTemplateText, setReminderTemplateText] = useState(settings.whatsAppReminderTemplate || `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

हा *दिप्स कॉम्प्युटर्स* कडून एक नम्र आठवण संदेश आहे. 💡

तुमच्या *[कोर्सचे नाव]* या कोर्सची थकीत फी *₹[थकीत रक्कम]* जमा करणे प्रलंबित आहे.

कृपया आपल्या सोयीनुसार लवकरात लवकर सदर शुल्क फी जमा करावी जेणेकरून तुमचा अभ्यासक्रम विनाअडथळा सुरू राहील.

मदत किंवा अधिक माहितीसाठी संपर्क साधू शकता.

📍 पत्ता: बँक ऑफ महाराष्ट्रच्या मागे, येवले कॉम्प्लेक्स, शिरपूर जैन.

📞 संपर्क: 9049102035 / 8888732035
*धन्यवाद!* 😊`);
  const [receiptTemplateText, setReceiptTemplateText] = useState(settings.whatsAppReceiptTemplate || `*प्रिय [विद्यार्थ्याचे नाव],* 🙏

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

*तुमच्या उज्ज्वल भविष्यासाठी शुभेच्छा!* 🚀`);
  const [sampleStudent, setSampleStudent] = useState('Abhinav Patil');
  const [sampleCourse, setSampleCourse] = useState('MS-CIT');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      instituteName: instName,
      ownerName: owner,
      email,
      website: web,
      mobile1: mob1,
      mobile2: mob2,
      address,
      themeColor: activeTheme,
      logo,
      receiptLogo: logo
    });
    alert(lang === 'en' ? 'Administrative Settings updated successfully!' : 'व्यवस्थापकीय सेटिंग्ज यशस्वीरित्या जतन केल्या!');
  };

  const handleSaveWhatsAppTemplate = () => {
    onUpdateSettings({
      ...settings,
      whatsAppTemplate: templateText,
      whatsAppAdmissionTemplate: admissionTemplateText,
      whatsAppReminderTemplate: reminderTemplateText,
      whatsAppReceiptTemplate: receiptTemplateText
    });
    alert(lang === 'en' ? 'WhatsApp templates updated successfully!' : 'व्हॉट्सॲप टेम्पलेट्स यशस्वीरित्या जतन केले!');
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!textareaRef.current) return;
    const ref = textareaRef.current;
    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    const text = ref.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const updated = before + placeholder + after;
    if (waSubTab === 'enquiry') {
      setTemplateText(updated);
    } else if (waSubTab === 'admission') {
      setAdmissionTemplateText(updated);
    } else if (waSubTab === 'reminder') {
      setReminderTemplateText(updated);
    } else {
      setReceiptTemplateText(updated);
    }
    setTimeout(() => {
      ref.focus();
      ref.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Replace placeholders for the live WhatsApp preview
  const getPreviewText = () => {
    const text = waSubTab === 'enquiry' 
      ? templateText 
      : waSubTab === 'admission' 
        ? admissionTemplateText 
        : waSubTab === 'reminder'
          ? reminderTemplateText
          : receiptTemplateText;
    return text
      .replace(/\[विद्यार्थ्याचे नाव\]/g, sampleStudent)
      .replace(/\[कोर्सचे नाव\]/g, sampleCourse)
      .replace(/\[थकीत रक्कम\]/g, '1,500')
      .replace(/\[भरलेली रक्कम\]/g, '2,000')
      .replace(/\[शिल्लक रक्कम\]/g, '1,500')
      .replace(/\[पावती क्रमांक\]/g, 'REC-0842')
      .replace(/\[जमा तारीख\]/g, new Date().toLocaleDateString('en-GB'));
  };

  const THEMES: { id: InstituteSettings['themeColor']; label: string; colorClass: string; textClass: string }[] = [
    { id: 'blue', label: 'Premium Blue (डिफॉल्ट)', colorClass: 'bg-blue-600', textClass: 'text-blue-600' },
    { id: 'indigo', label: 'Classic Indigo', colorClass: 'bg-indigo-600', textClass: 'text-indigo-600' },
    { id: 'emerald', label: 'Vibrant Emerald', colorClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
    { id: 'slate', label: 'Metallic Slate', colorClass: 'bg-slate-700', textClass: 'text-slate-700' },
    { id: 'violet', label: 'Elite Violet', colorClass: 'bg-violet-600', textClass: 'text-violet-600' },
  ];

  const LOGOS = [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&h=120&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=120&fit=crop&q=80"
  ];

  return (
    <div className="space-y-6">
      
      {/* Settings Navigation Tabs Header */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100 hidden sm:block">
            <Settings className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
              {lang === 'en' ? 'Administrative Control Center' : 'प्रशासकीय नियंत्रण केंद्र'}
            </h2>
            <p className="text-[11px] text-gray-400">
              {lang === 'en' 
                ? 'Configure institution details, manage course rates, and customize WhatsApp message templates' 
                : 'पार्श्वभूमी सेटिंग्ज, कोर्सची यादी व दर, आणि व्हॉट्सॲप टेम्पलेट सानुकूलित करा'}
            </p>
          </div>
        </div>

        {/* Tab Buttons bar matching premium tabs style */}
        <div className="flex items-center bg-gray-100/80 p-1.5 rounded-xl border">
          <button
            id="tab-settings-profile"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Profile Details' : 'प्रोफाइल सविस्तर'}</span>
          </button>
          
          <button
            id="tab-settings-courses"
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'Course Settings' : 'कोर्स व्यवस्थापन'}</span>
          </button>

          <button
            id="tab-settings-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'whatsapp' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'WhatsApp Template' : 'व्हॉट्सॲप टेम्पलेट'}</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: INSTITUTE PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmitProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left column - Branding Info */}
            <div className="space-y-6 lg:col-span-2">
              
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                
                <h4 className="font-extrabold text-sm text-gray-700 uppercase border-l-4 border-l-blue-500 pl-2">
                  {lang === 'en' ? 'Institute Identification Details' : 'संस्थान ओळख तपशील'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-gray-400" />
                      <span>{lang === 'en' ? 'Institute Name' : 'संस्थेचे नाव'}</span>
                    </label>
                    <input
                      id="settings-inst-name"
                      type="text"
                      value={instName}
                      onChange={e => setInstName(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span>{lang === 'en' ? 'Owner / Director Name' : 'संचालकाचे नाव'}</span>
                    </label>
                    <input
                      id="settings-owner-name"
                      type="text"
                      value={owner}
                      onChange={e => setOwner(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-gray-400" />
                      <span>Website Link URL</span>
                    </label>
                    <input
                      id="settings-website"
                      type="text"
                      value={web}
                      onChange={e => setWeb(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-gray-400" />
                      <span>Primary Mobile Number</span>
                    </label>
                    <input
                      id="settings-mob1"
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={mob1}
                      onChange={e => setMob1(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-gray-400" />
                      <span>Alternate Mobile Number</span>
                    </label>
                    <input
                      id="settings-mob2"
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={mob2}
                      onChange={e => setMob2(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-mono"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      <span>Institutional Core Address</span>
                    </label>
                    <textarea
                      id="settings-address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full text-sm border p-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 h-20"
                      required
                    />
                  </div>

                </div>

              </div>

              {/* Logo customization box */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                <h4 id="unified-logo-title" className="font-extrabold text-sm text-gray-700 uppercase border-l-4 border-l-blue-500 pl-2">
                  {lang === 'en' ? 'Institute Logo & Print Branding' : 'संस्थान लोगो आणि ब्रँडिंग'}
                </h4>

                {logo ? (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="relative">
                      <img
                        id="unified-logo-preview-img"
                        src={logo}
                        alt="Active Branding Logo"
                        className="h-16 w-16 object-contain rounded bg-white shadow-sm border p-1"
                        referrerPolicy="no-referrer"
                      />
                      {logo !== LOGOS[0] && (
                        <button
                          id="btn-clear-branding-logo"
                          type="button"
                          onClick={() => setLogo(LOGOS[0])}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow hover:scale-105 transition flex items-center justify-center"
                          title="Reset to Default"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-700 block truncate">
                        {lang === 'en' ? 'Active branding logo is configured successfully' : 'सक्रिय लोगो ब्रँडिंग सक्रिय आहे'}
                      </span>
                      <span className="text-[10px] text-gray-400 block break-all truncate">
                        {logo === LOGOS[0] ? (lang === 'en' ? 'Default Logo Placeholder' : 'डिफॉल्ट लोगो') : (logo.startsWith('data:') ? (lang === 'en' ? 'Local uploaded file (Base64)' : 'अपलोड केलेली स्थानिक फाईल (Base64)') : logo)}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-600 block">
                      {lang === 'en' ? 'Upload Custom Logo Photo' : 'सानुकूल लोगो फोटो अपलोड करा'}
                    </span>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl py-4 px-4 cursor-pointer hover:bg-blue-50/10 transition">
                      <Upload className="h-5 w-5 text-gray-400 mb-1" />
                      <span className="text-xs font-extrabold text-gray-700">{lang === 'en' ? 'Choose Image File' : 'इमेज फाईल निवडा'}</span>
                      <span className="text-[10px] text-gray-450 mt-0.5">PNG, JPG, SVG up to 1MB</span>
                      <input
                        id="branding-logo-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert(lang === 'en' ? 'Image is too large! Maximum allowed is 1MB.' : 'प्रतिमा खूप मोठी आहे! कमाल मर्यादा १MB आहे.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setLogo(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-600 block">
                        {lang === 'en' ? 'Custom Logo Web URL' : 'सानुकूल लोगो वेब URL'}
                      </span>
                      <p className="text-[10.5px] text-gray-400 leading-normal">{lang === 'en' ? 'Paste the web address or image link of your custom logo' : 'तुमच्या सानुकूल लोगोची थेट वेब लिंक पेस्ट करा'}</p>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="relative flex-1">
                        <Image className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          id="branding-logo-url-input"
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={LOGOS.includes(logo) || logo.startsWith('data:') ? '' : logo}
                          onChange={(e) => setLogo(e.target.value)}
                          className="w-full text-xs border pl-8 pr-2.5 py-2 px-2.5 rounded-lg outline-none focus:border-blue-500 bg-gray-50/20 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right column - Themes selection & Save button */}
            <div className="space-y-6">
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-gray-700 uppercase border-l-4 border-l-blue-500 pl-2 flex items-center gap-1.5">
                  <Palette className="h-4.5 w-4.5 text-blue-500" />
                  <span>CRM Theme Accent</span>
                </h4>
                <p className="text-xs text-gray-400">{lang === 'en' ? 'Apply beautiful theme accents instantly across the platform' : 'संपूर्ण डेटाबेस प्रणालीसाठी विविध मुख्य थीमचे आकर्षक रंग निवडा आणि लागू करा'}</p>

                <div className="space-y-2 select-none pt-2">
                  {THEMES.map(theme => {
                    const isSelected = activeTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        id={`btn-theme-${theme.id}`}
                        type="button"
                        onClick={() => setActiveTheme(theme.id)}
                        className={`w-full flex items-center justify-between p-3 border rounded-xl text-xs font-semibold hover:bg-gray-50 transition ${isSelected ? 'border-blue-600 bg-blue-50/20 font-bold' : 'border-gray-200'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`h-4 w-4 rounded-full ${theme.colorClass}`}></span>
                          <span className={theme.textClass}>{theme.label}</span>
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600 font-bold" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Administrative note */}
              <div className="bg-gray-50 border p-4 rounded-2xl space-y-2 text-xs text-gray-505 leading-relaxed">
                <p className="font-semibold text-gray-700">DIPs Computers Control Panel</p>
                <p className="text-gray-500">Every change to the branding, logo, owner identity or coordinates will instantly synchronize on the client dashboard.</p>
              </div>

              {/* Save profile block */}
              <button
                id="btn-settings-submit"
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase p-4 rounded-xl shadow-md transition active:scale-95"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{lang === 'en' ? 'Save Profile Settings' : 'प्रोफाइल सेटिंग्ज जतन करा'}</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: COURSE MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-gray-500 border-b pb-3">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{lang === 'en' ? 'Course Admissions Configuration' : 'कॉम्प्युटर कोर्सेस फी संरचना'}</h3>
                <p className="text-[11px] text-gray-400">{lang === 'en' ? 'Create, delete or update active courses and fee categories' : 'तेजीने नवीन कोर्सेस भरा किंवा अस्तित्वात असलेल्या कोर्सेसच्या शैक्षणिक शुल्क दरात बदल करा'}</p>
              </div>
            </div>
            
            {/* Directly embedding CourseView here */}
            <CourseView
              courses={courses}
              courseFees={courseFees}
              students={students}
              onAddCourse={onAddCourse}
              onUpdateCourse={onUpdateCourse}
              onDeleteCourse={onDeleteCourse}
              lang={lang}
            />
          </div>
        )}

        {/* TAB 3: WHATSAPP MESSAGE TEMPLATE */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Template Editor Box */}
            <div className="lg:col-span-7 bg-white border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h4 className="font-extrabold text-sm text-gray-800 uppercase border-l-4 border-l-emerald-500 pl-2">
                    {lang === 'en' ? 'WhatsApp Template Customizer' : 'व्हॉट्सॲप संदेश टेम्पलेट संपादक'}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {lang === 'en' 
                      ? 'Configure personalized messages automatically loaded when alerting or welcoming students.' 
                      : 'विविध प्रसंगी पाठवल्या जाणाऱ्या व्हॉट्सॲप संदेशांचे टेम्पलेट निवडून मसुदे सानुकूलित करा व जतन करा.'}
                  </p>
                </div>
              </div>

              {/* Selection Tabs for templates inside the WhatsApp tab */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-full border gap-1">
                <button
                  type="button"
                  id="tab-wa-sub-enquiry"
                  onClick={() => setWaSubTab('enquiry')}
                  className={`flex-1 py-1.5 text-center text-xs font-bold transition rounded-lg ${
                    waSubTab === 'enquiry'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'en' ? 'Enquiry' : 'चौकशी संदेश'}
                </button>
                <button
                  type="button"
                  id="tab-wa-sub-admission"
                  onClick={() => setWaSubTab('admission')}
                  className={`flex-1 py-1.5 text-center text-xs font-bold transition rounded-lg ${
                    waSubTab === 'admission'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'en' ? 'Admission' : 'प्रवेश संदेश'}
                </button>
                <button
                  type="button"
                  id="tab-wa-sub-reminder"
                  onClick={() => setWaSubTab('reminder')}
                  className={`flex-1 py-1.5 text-center text-xs font-bold transition rounded-lg ${
                    waSubTab === 'reminder'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'en' ? 'Reminder' : 'थकीत फी आठवण'}
                </button>
                <button
                  type="button"
                  id="tab-wa-sub-receipt"
                  onClick={() => setWaSubTab('receipt')}
                  className={`flex-1 py-1.5 text-center text-xs font-bold transition rounded-lg ${
                    waSubTab === 'receipt'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'en' ? 'Receipt' : 'जमा फी पावती'}
                </button>
              </div>

              {/* Informative placeholder box */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'Supported Variables' : 'वापरता येणारे व्हेरियेबल्स/जागा:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-700">
                  {lang === 'en' 
                    ? 'Use the special tags below to automatically inject details. Click to copy or insert directly into your editor:' 
                    : 'खालीलपैकी कोणत्याही बटनावर क्लिक करून तो शब्द मेसेजच्या मसुद्यात योग्य ठिकाणी समाविष्ट करा:'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 font-mono">
                  <button 
                    type="button"
                    onClick={() => insertPlaceholder('[विद्यार्थ्याचे नाव]')}
                    className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                  >
                    <span className="text-amber-500 font-extrabold">+</span> [विद्यार्थ्याचे नाव]
                  </button>
                  <button 
                    type="button"
                    onClick={() => insertPlaceholder('[कोर्सचे नाव]')}
                    className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                  >
                    <span className="text-amber-500 font-extrabold">+</span> [कोर्सचे नाव]
                  </button>
                  {waSubTab === 'reminder' && (
                    <button 
                      type="button"
                      onClick={() => insertPlaceholder('[थकीत रक्कम]')}
                      className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                    >
                      <span className="text-amber-500 font-extrabold">+</span> [थकीत रक्कम]
                    </button>
                  )}
                  {waSubTab === 'receipt' && (
                    <>
                      <button 
                        type="button"
                        onClick={() => insertPlaceholder('[भरलेली रक्कम]')}
                        className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                      >
                        <span className="text-amber-500 font-extrabold">+</span> [भरलेली रक्कम]
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertPlaceholder('[शिल्लक रक्कम]')}
                        className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                      >
                        <span className="text-amber-500 font-extrabold">+</span> [शिल्लक रक्कम]
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertPlaceholder('[पावती क्रमांक]')}
                        className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                      >
                        <span className="text-amber-500 font-extrabold">+</span> [पावती क्रमांक]
                      </button>
                      <button 
                        type="button"
                        onClick={() => insertPlaceholder('[जमा तारीख]')}
                        className="bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md text-[10.5px] font-bold tracking-tight transition flex items-center gap-1"
                      >
                        <span className="text-amber-500 font-extrabold">+</span> [जमा तारीख]
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message text area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>
                    {waSubTab === 'enquiry' 
                      ? (lang === 'en' ? 'Enquiry Message Content' : 'चौकशी संदेशाचा मुख्य मजकूर')
                      : waSubTab === 'admission'
                        ? (lang === 'en' ? 'Admission Welcome Message Content' : 'प्रवेश अभिनंदन संदेशाचा मुख्य मजकूर')
                        : waSubTab === 'reminder'
                          ? (lang === 'en' ? 'Payment Reminder Message Content' : 'थकीत फी आठवण संदेशाचा मुख्य मजकूर')
                          : (lang === 'en' ? 'Fee Payment Receipt Message Content' : 'शुल्क पावती संदेशाचा मुख्य मजकूर')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono font-medium">
                    {waSubTab === 'enquiry' 
                      ? templateText.length 
                      : waSubTab === 'admission' 
                        ? admissionTemplateText.length 
                        : waSubTab === 'reminder'
                          ? reminderTemplateText.length
                          : receiptTemplateText.length} characters
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  id="whatsapp-template-textarea"
                  value={
                    waSubTab === 'enquiry' 
                      ? templateText 
                      : waSubTab === 'admission' 
                        ? admissionTemplateText 
                        : waSubTab === 'reminder'
                          ? reminderTemplateText
                          : receiptTemplateText
                  }
                  onChange={(e) => {
                    if (waSubTab === 'enquiry') {
                      setTemplateText(e.target.value);
                    } else if (waSubTab === 'admission') {
                      setAdmissionTemplateText(e.target.value);
                    } else if (waSubTab === 'reminder') {
                      setReminderTemplateText(e.target.value);
                    } else {
                      setReceiptTemplateText(e.target.value);
                    }
                  }}
                  placeholder={lang === 'en' ? 'Write your template content here...' : 'मेसेज कंटेंट लिहा...'}
                  className="w-full text-xs font-sans p-4 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 bg-gray-50/10 min-h-[380px] leading-relaxed shadow-inner"
                />
              </div>

              {/* Formatting tips bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10.5px] text-gray-450 border-t">
                <div className="flex items-center gap-3">
                  <span>Formatting: <strong>*Bold*</strong></span>
                  <span>/</span>
                  <span><em>_Italics_</em></span>
                  <span>/</span>
                  <span>~Screws~</span>
                </div>
                <button
                  id="btn-save-wa-tpl"
                  type="button"
                  onClick={handleSaveWhatsAppTemplate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{lang === 'en' ? 'Save All Templates' : 'टेम्पलेट्स जतन करा'}</span>
                </button>
              </div>

            </div>

            {/* Simulated Live Preview Phone Column */}
            <div className="lg:col-span-5 bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-[36px] bg-[#1f2937] p-2.5 border-4 border-gray-700 shadow-2xl relative overflow-hidden flex flex-col font-sans">
                
                {/* Speaker & Sensor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#1f2937] h-5 w-32 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
                </div>

                {/* Simulated Phone Screen Interface */}
                <div className="rounded-[28px] overflow-hidden bg-[#efeae2] h-[520px] relative flex flex-col z-10 text-[11px]">
                  
                  {/* WhatsApp Header bar */}
                  <div className="bg-[#075e54] text-white pt-5 pb-2.5 px-3 flex items-center justify-between shadow">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#128c7e] border border-white/20 flex items-center justify-center text-white font-black text-xs">
                        D
                      </div>
                      <div>
                        <div className="font-bold leading-none text-xs">{settings.instituteName}</div>
                        <div className="text-[8px] text-emerald-100 mt-0.5 leading-none">Online</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 scale-95">
                      <span className="font-bold text-[9px] font-mono">LIVE PREVIEW</span>
                    </div>
                  </div>

                  {/* Wallpaper Background Overlay Pattern */}
                  <div 
                    className="flex-1 p-3 flex flex-col justify-end overflow-y-auto"
                    style={{ 
                      backgroundImage: 'radial-gradient(#dfdcd6 1.1px, transparent 0px)', 
                      backgroundSize: '16px 16px' 
                    }}
                  >
                    
                    {/* Mock Date Badge */}
                    <div className="mx-auto bg-white/85 text-gray-550 border rounded-md px-2 py-0.5 text-[8.5px] font-bold shadow-2xs mb-4">
                      TODAY
                    </div>

                    {/* Chat Bubble matching exactly */}
                    <div className="bg-[#d9fdd3] text-[#111b21] p-2.5 rounded-lg shadow-sm max-w-[90%] whitespace-pre-wrap leading-relaxed self-end relative mb-2">
                      <div className="text-[10px] break-words">
                        {getPreviewText()}
                      </div>
                      <div className="text-right text-[7.5px] text-gray-400 font-mono mt-1 text-right flex items-center justify-end gap-0.5 font-bold">
                        <span>10:30 AM</span>
                        <span className="text-blue-500">✓✓</span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Mini control panel for the Live dynamic sample template */}
              <div className="w-full mt-4 bg-slate-50 border rounded-xl p-3.5 space-y-3">
                <div className="text-xs font-bold text-gray-600 border-b pb-1">
                  💡 {lang === 'en' ? 'Modify Preview sample values:' : 'लाईव्ह प्रिव्ह्यूचे डमी विद्यार्थी तपशील सुधारा:'}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Student Name</span>
                    <input 
                      type="text" 
                      value={sampleStudent} 
                      onChange={(e) => setSampleStudent(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded px-2 py-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Course Name</span>
                    <input 
                      type="text" 
                      value={sampleCourse} 
                      onChange={(e) => setSampleCourse(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-gray-200 rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
