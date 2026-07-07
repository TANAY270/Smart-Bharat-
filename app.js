import { GoogleGenerativeAI } from "@google/generative-ai";

// ----------------------------------------------------
// STATE MANAGEMENT & CONFIG
// ----------------------------------------------------
let state = {
  currentLang: 'en',
  theme: 'light',
  apiKey: localStorage.getItem('sb_gemini_api_key') || '',
  apiModel: localStorage.getItem('sb_gemini_api_model') || 'gemini-2.5-flash',
  complaints: [],
  selectedComplaintId: null,
  activeView: 'home',
  ttsEnabled: true,
  currentDocChecklist: [],
  mapPins: [], // Coordinates and information for ward map hotspots
  selectedCoords: { x: 120, y: 110 }, // Default map location
  kioskMode: localStorage.getItem('sb_kiosk_mode') === 'true',
  lastInteractionTime: Date.now(),
  lastMessageSentTime: 0
};

// ----------------------------------------------------
// DICTIONARY FOR MULTILINGUAL SUPPORT (EN & HI)
// ----------------------------------------------------
const DICT = {
  en: {
    brandSub: "Civic Companion",
    navhome: "Home",
    navassistant: "Sahayak AI",
    navreport: "Report an Issue",
    navtrack: "Track Complaints",
    navservices: "Services Directory",
    navdocs: "Document Helper",
    langLabel: "Language",
    heroTitle: "One companion for every civic task.",
    heroSub: "Ask questions in your own language, report local structural problems, trace complaints with official file numbers, and verify document requirement checklists before standing in a queue.",
    statOpenLabel: "Active complaints",
    statResolvedLabel: "Resolved issues",
    statAvail: "Sahayak Online",
    quickActionsLabel: "Quick Actions",
    qa1h: "Ask Sahayak",
    qa1p: "Get immediate answers on government schemes, eligibility, and administrative offices in English, Hindi, or Hinglish.",
    qa2h: "Report an issue",
    qa2p: "Report streetlights, garbage, water leaks, or road potholes on our municipal portal and track status changes.",
    qa3h: "Check documents",
    qa3p: "Identify lists of mandatory documents, cross-check drafts in our checklist simulator, and download checklists.",
    popularLabel: "Popular Identity & Welfare Services",
    asstEyebrow: "AI Companion",
    asstTitle: "Sahayak AI",
    asstSub: "Ask about schemes, eligibility, administrative procedures, or local civic bodies — get direct step-by-step assistance.",
    reportEyebrow: "Public Grievance",
    reportTitle: "Report an Issue",
    reportSub: "File a complaint to notify municipal authorities. Get tracking numbers and live timeline updates.",
    lblCategory: "Issue Category",
    lblLocation: "Location / Landmark",
    lblDesc: "Describe the problem",
    lblName: "Your Name (Optional)",
    lblPhone: "Contact Number (Optional)",
    submitBtn: "Submit Complaint",
    fileNoLabel: "Official file tracking number",
    confirmMsg: "The grievance has been entered into the municipal server registry. Save this ID to track official action logs.",
    fileAnother: "File another issue",
    trackEyebrow: "Grievance status",
    trackTitle: "Track Complaints",
    trackSub: "Search active issues, view municipal progress log, or examine coordinates on the map.",
    trackSearch: "Enter file ID, e.g. SB-2026-103847",
    trackSearchBtn: "Search File",
    svcEyebrow: "Directory",
    svcTitle: "Services Directory",
    svcSub: "List of frequent citizen registries. Select cards to read guidelines or ask Sahayak AI for assistance.",
    docEyebrow: "Document Checklist Helper",
    docTitle: "Know What to Carry",
    docSub: "Avoid repeated visits. Type the service you are applying for to check list requirements and verify drafts.",
    lblDocGoal: "What certificate/service are you applying for?",
    docGoalPlaceholder: "e.g. new passport, caste certificate, driving license renewal",
    docSubmit: "Analyze Requirements",
    chatPlaceholder: "Type your query...",
    chatSend: "Send ➔",
    emptyTrack: "No complaints filed from this device yet. Switch to \"Report an Issue\" to file one.",
    notFound: "No municipal file found with that tracking number.",
    thisArea: "Recent complaints in your ward",
    settingsText: "AI Config",
    themeTextDark: "Dark Mode",
    themeTextLight: "Light Mode",
    lblMapMarker: "Pin Location on Ward Map (Click to select)",
    mapLabelText: "Ward Map (District Central)",
    legPending: "Pending",
    legProgress: "Active",
    legResolved: "Done",
    lblImage: "Upload Photo of the Issue (Optional)",
    uploadTextLabel: "Drag & drop a photo here, or click to upload",
    lblTimelinePhoto: "Attached Photo",
    lblTimelineLog: "Municipal Action Timeline",
    stepTitle1: "Grievance Registered",
    stepTitle2: "Engineer Assigned",
    stepTitle3: "Correction Active",
    stepTitle4: "Issue Resolved",
    muteStatusOn: "TTS Enabled",
    muteStatusOff: "TTS Muted",
    asstStatusLabel: "Active & Online",
    modalConfigTitle: "AI Engine Config",
    modalConfigDesc: "Provide your Gemini API Key to enable live response generation from Google Gemini. If empty, the system runs in high-fidelity offline simulation mode.",
    lblConfigKey: "Gemini API Key",
    lblConfigModel: "Model Version",
    btnCancelSettings: "Cancel",
    btnSaveSettings: "Save Config",
    alertTitle: "Monsoon Water Drainage Drive (July 2026)",
    alertDesc: "The Municipal Corporation is cleaning central drainage channels. Report any water logging using \"Report an Issue\" for immediate action.",
    accessibilityLabel: "Text Accessibility",
    analyticsLabel: "Municipal Analytics & Transparency Ledger",
    lblResolutionRate: "Resolution Rate",
    lblAvgTimeLabel: "Average Resolution Time",
    lblActiveCrewsLabel: "Active Service Crews",
    aiCategorySuggestion: "AI Suggested Category",
    suggestedCategoryLabel: "AI Suggested Category:",
    lblFeedbackTitle: "Rate Resolution Quality",
    lblEscalateWarn: "Not satisfied with the execution? Escalate this file to the Commissioner Nodal Board for review.",
    btnEscalateGrievance: "Escalate Case",
    categoryLabels: {
      'Roads & Potholes': 'Roads & Potholes',
      'Streetlights': 'Streetlights',
      'Garbage & Sanitation': 'Garbage & Sanitation',
      'Water Supply': 'Water & Leakages',
      'Drainage': 'Drainage & Flooding',
      'Public Nuisance': 'Public Nuisance',
      'Other': 'Other'
    },
    footerTitle: "Smart Bharat Portal",
    footerDesc: "An official Generative AI initiative of the Municipal Nodal Board to provide transparent, accessible, and digitally inclusive public services to every citizen.",
    footerLabelInfo: "Information",
    footerLabelSupport: "Support",
    footerLabelSupport: "Support",
    footerLabelGov: "Government Links",
    footerCopyright: "© 2026 Municipal Corporation. All Rights Reserved.",
    // Modal Keys
    modalAboutTitle: "About Us",
    modalAboutHtml: `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);">Welcome to the <strong>Smart Bharat Civic Companion Portal</strong>.</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">This platform is an official, AI-driven municipal workspace designed to simplify document workflows, expedite grievance filing, and bridge communication gaps between local government offices and municipal residents.</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">Built with modern Generative AI technologies, we aim to ensure civic convenience, transparent service timelines, and high accessibility support.</p>`,
    modalContactTitle: "Contact Us",
    modalContactHtml: `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
                         <p style="margin-bottom: 12px;">📞 <strong>Citizen Toll-Free Helpline:</strong> 1800-345-5678 (Available 24x7)</p>
                         <p style="margin-bottom: 12px;">📧 <strong>Official Grievance Desk:</strong> support@smartbharat.gov.in</p>
                         <p style="margin-bottom: 12px;">🏢 <strong>Central Office:</strong> Central Headquarters, Vikas Marg, New Delhi - 110001</p>
                         <hr style="border: none; border-top: 1px solid var(--line); margin: 16px 0;">
                         <p style="font-size: 12.5px; color: var(--ink-muted);">For issues relating to municipal repairs, please file an official request using the <strong>\"Report an Issue\"</strong> tab for direct coordination with ward staff.</p>
                       </div>`,
    modalFeedbackTitle: "Rate our portal:",
    modalFeedbackComment: "Add comments (optional):",
    modalFeedbackPlaceholder: "Share your experience with Sahayak AI...",
    modalFeedbackSubmit: "Submit Feedback",
    modalFeedbackSuccess: "Thank you! Your feedback has been registered to help us improve the citizen companion.",
    modalFaqsTitle: "FAQs",
    modalFaqsList: [
      { q: "How long does it take for a grievance to get resolved?", a: "Typically, minor issues like streetlight bulb replacements or garbage sanitation sweeps take 24-48 hours. Major civic works like road pothole repairs or sewer main cleaning can take 3-5 working days." },
      { q: "Are the documents uploaded to the Verification Lab secure?", a: "Yes, absolutely. The Document Verification Lab runs 100% locally on your browser. Your files are inspected client-side and are never uploaded or stored on any server." },
      { q: "Can I use the Sahayak AI Companion without an internet connection?", a: "Yes, our offline keyword parser runs locally on the browser. If you don't have internet or haven't configured a Gemini API key, the simulator returns offline templates for Aadhaar, Voter cards, licensing, etc." }
    ],
    modalHelpTitle: "Help & Guidelines",
    modalHelpHtml: `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">How to Navigate the Portal:</h4>
                      <ol style="padding-left: 20px; margin-bottom: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Sahayak AI Chat:</strong> Ask about services, schemes, and guidelines. Click the mic icon to dictate queries in English or Hindi.</li>
                        <li style="margin-bottom: 8px;"><strong>Report an Issue:</strong> Click directly on the vector map to register coordinates, drop a photo, and hit submit.</li>
                        <li style="margin-bottom: 8px;"><strong>Document Helper Lab:</strong> Search for services to verify if your files match the checklist rules.</li>
                      </ol>
                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">Configuring Live AI Integration:</h4>
                      <p style="color: var(--ink-muted);">Click the <strong>\"AI Config\"</strong> button in the top utility bar, paste your Google Gemini API Key, and save. The app will immediately transition from simulator template fallback response structures to real-time generative responses.</p>
                    </div>`
  },
  hi: {
    brandSub: "नागरिक सहायक",
    navhome: "होम",
    navassistant: "सहायक AI",
    navreport: "शिकायत दर्ज करें",
    navtrack: "शिकायत ट्रैक करें",
    navservices: "सेवा निर्देशिका",
    navdocs: "दस्तावेज़ सहायक",
    langLabel: "भाषा",
    heroTitle: "हर नागरिक काम के लिए एक साथी।",
    heroSub: "अपनी भाषा में सवाल पूछें, अपने क्षेत्र की समस्या दर्ज करें, फ़ाइल नंबर से ट्रैक करें, और कतार में लगने से पहले जानें कि आपको कौन से दस्तावेज़ चाहिए।",
    statOpenLabel: "सक्रिय शिकायतें",
    statResolvedLabel: "हल हो चुकी शिकायतें",
    statAvail: "सहायक ऑनलाइन",
    quickActionsLabel: "त्वरित कार्रवाई",
    qa1h: "सहायक से पूछें",
    qa1p: "योजनाओं, पात्रता, और प्रशासनिक कार्यालयों के बारे में तुरंत हिंदी, अंग्रेजी या हिंग्लिश में जानकारी प्राप्त करें।",
    qa2h: "समस्या दर्ज करें",
    qa2p: "स्ट्रीटलाइट, कचरा, पानी रिसाव या सड़क के गड्ढों की शिकायत नगर निगम पोर्टल पर दर्ज करें और स्थिति ट्रैक करें।",
    qa3h: "दस्तावेज़ जांचें",
    qa3p: "आवश्यक दस्तावेजों की सूची जानें, हमारे चेकलिस्ट सिम्युलेटर में ड्राफ्ट की जांच करें और सूची डाउनलोड करें।",
    popularLabel: "लोकप्रिय पहचान और कल्याण सेवाएं",
    asstEyebrow: "AI साथी",
    asstTitle: "सहायक AI",
    asstSub: "योजनाओं, पात्रता, प्रशासनिक प्रक्रियाओं या स्थानीय नागरिक निकायों के बारे में पूछें - सीधे सहायता प्राप्त करें।",
    reportEyebrow: "सार्वजनिक शिकायत",
    reportTitle: "शिकायत दर्ज करें",
    reportSub: "नगर निगम अधिकारियों को सूचित करने के लिए शिकायत दर्ज करें। ट्रैकिंग नंबर और लाइव टाइमलाइन अपडेट प्राप्त करें।",
    lblCategory: "समस्या की श्रेणी",
    lblLocation: "स्थान / मील का पत्थर (Landmark)",
    lblDesc: "समस्या का विवरण दें",
    lblName: "आपका नाम (वैकल्पिक)",
    lblPhone: "संपर्क नंबर (वैकल्पिक)",
    submitBtn: "शिकायत दर्ज करें",
    fileNoLabel: "आधिकारिक फ़ाइल ट्रैकिंग नंबर",
    confirmMsg: "शिकायत नगर निगम सर्वर रजिस्ट्री में दर्ज कर ली गई है। प्रगति जांचने के लिए इस फ़ाइल आईडी को सहेजें।",
    fileAnother: "एक और शिकायत दर्ज करें",
    trackEyebrow: "शिकायत की स्थिति",
    trackTitle: "शिकायत ट्रैक करें",
    trackSub: "सक्रिय शिकायतों को खोजें, नगर निगम प्रगति लॉग देखें, या मानचित्र पर निर्देशांक (coordinates) देखें।",
    trackSearch: "फ़ाइल आईडी दर्ज करें, जैसे SB-2026-103847",
    trackSearchBtn: "खोजें",
    svcEyebrow: "निर्देशिका",
    svcTitle: "सेवा निर्देशিকা",
    svcSub: "सामान्य सरकारी सेवाएं। विवरण पढ़ने या सहायक AI से सहायता लेने के लिए कार्ड चुनें।",
    docEyebrow: "दस्तावेज़ चेकलिस्ट सहायक",
    docTitle: "जानें क्या साथ ले जाना है",
    docSub: "बार-बार चक्कर काटने से बचें। दस्तावेजों की आवश्यकता जानने और चेकलिस्ट का परीक्षण करने के लिए सेवा का नाम लिखें।",
    lblDocGoal: "आप किस प्रमाण पत्र / सेवा के लिए आवेदन कर रहे हैं?",
    docGoalPlaceholder: "जैसे: नया पासपोर्ट, जाति प्रमाण पत्र, ड्राइविंग लाइसेंस नवीनीकरण",
    docSubmit: "आवश्यकताएं जांचें",
    chatPlaceholder: "अपना सवाल पूछें...",
    chatSend: "भेजें ➔",
    emptyTrack: "इस डिवाइस से अभी तक कोई शिकायत दर्ज नहीं की गई है। दर्ज करने के लिए \"शिकायत दर्ज करें\" पर जाएं।",
    notFound: "इस ट्रैकिंग नंबर से कोई नगर निगम फ़ाइल नहीं मिली।",
    thisArea: "आपके वार्ड में हाल की शिकायतें",
    settingsText: "AI सेटिंग्स",
    themeTextDark: "डार्क मोड",
    themeTextLight: "लाइट मोड",
    lblMapMarker: "वार्ड मानचित्र पर स्थान पिन करें (चुनने के लिए क्लिक करें)",
    mapLabelText: "वार्ड मानचित्र (मध्य जिला)",
    legPending: "लंबित",
    legProgress: "सक्रिय",
    legResolved: "पूर्ण",
    lblImage: "समस्या की तस्वीर अपलोड करें (वैकल्पिक)",
    uploadTextLabel: "तस्वीर यहां खींचें और छोड़ें (drag & drop), या क्लिक करें",
    lblTimelinePhoto: "संलग्न फोटो",
    lblTimelineLog: "नगर निगम कार्रवाई टाइमलाइन",
    stepTitle1: "शिकायत दर्ज हुई",
    stepTitle2: "अभियंता नियुक्त",
    stepTitle3: "सुधार कार्य सक्रिय",
    stepTitle4: "समस्या हल हो गई",
    muteStatusOn: "आवाज चालू",
    muteStatusOff: "आवाज बंद",
    asstStatusLabel: "सक्रिय और ऑनलाइन",
    modalConfigTitle: "AI इंजन सेटिंग्स",
    modalConfigDesc: "गूगल जेमिनी से लाइव उत्तर प्राप्त करने के लिए जेमिनी एपीआई की (API Key) दर्ज करें। खाली होने पर, सिस्टम सिम्युलेटर मोड में कार्य करेगा।",
    lblConfigKey: "जेमिनी API की (Key)",
    lblConfigModel: "मॉडल संस्करण",
    btnCancelSettings: "रद्द करें",
    btnSaveSettings: "सेटिंग्स सहेजें",
    alertTitle: "मानसून जल निकासी अभियान (जुलाई 2026)",
    alertDesc: "नगर निगम द्वारा मुख्य जल निकासी नालों की सफाई की जा रही है। तत्काल कार्रवाई के लिए \"शिकायत दर्ज करें\" का उपयोग करके जलभराव की रिपोर्ट करें।",
    accessibilityLabel: "पाठ पहुँच क्षमता",
    analyticsLabel: "नगर निगम विश्लेषिकी और पारदर्शिता बહીखाता",
    lblResolutionRate: "निवारण दर",
    lblAvgTimeLabel: "औसत निवारण समय",
    lblActiveCrewsLabel: "सक्रिय सेवा दल",
    aiCategorySuggestion: "AI सुझाया गया वर्ग",
    suggestedCategoryLabel: "AI सुझाया गया वर्ग:",
    lblFeedbackTitle: "निवारण गुणवत्ता का मूल्यांकन करें",
    lblEscalateWarn: "कार्यवाही से संतुष्ट नहीं हैं? वरिष्ठ समीक्षा के लिए इस फ़ाइल को आयुक्त नोडल बोर्ड को अग्रेषित करें।",
    btnEscalateGrievance: "मामला अग्रेषित करें",
    categoryLabels: {
      'Roads & Potholes': 'सड़क और गड्ढे',
      'Streetlights': 'स्ट्रीटलाइट्स',
      'Garbage & Sanitation': 'कचरा और स्वच्छता',
      'Water Supply': 'जल और रिसाव',
      'Drainage': 'जल निकासी और बाढ़',
      'Public Nuisance': 'सार्वजनिक उपद्रव',
      'Other': 'अन्य'
    },
    footerTitle: "स्मार्ट भारत पोर्टल",
    footerDesc: "प्रत्येक नागरिक को पारदर्शी, सुलभ और डिजिटल रूप से समावेशी सार्वजनिक सेवाएं प्रदान करने के लिए नगर निगम नोडल बोर्ड की एक आधिकारिक जनरेटिव एआई पहल।",
    footerLabelInfo: "सूचना",
    footerLabelSupport: "सहायता",
    footerLabelGov: "सरकारी वेबसाइटें",
    footerCopyright: "© 2026 नगर निगम। सर्वाधिकार सुरक्षित।",
    // Modal Keys
    modalAboutTitle: "हमारे बारे में",
    modalAboutHtml: `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);"><strong>स्मार्ट भारत नागरिक सहायक पोर्टल</strong> में आपका स्वागत है।</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">यह मंच एक एकीकृत नागरिक पोर्टल है जो एआई-संचालित सहायकों और डिजिटल ग्राइवेंस टूल का उपयोग करके नगर निगम के प्रशासनिक कार्यों को सरल बनाता है।</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">हमारा लक्ष्य प्रत्येक भारतीय नागरिक को कुशल, उत्तरदायी और डिजिटल रूप से सुरक्षित तरीके से सार्वजनिक सेवाओं तक पहुंच प्रदान करना है।</p>`,
    modalContactTitle: "संपर्क करें",
    modalContactHtml: `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
                         <p style="margin-bottom: 12px;">📞 <strong>नागरिक टोल-फ्री हेल्पलाइन:</strong> 1800-345-5678 (24x7 उपलब्ध)</p>
                         <p style="margin-bottom: 12px;">📧 <strong>आधिकारिक शिकायत ईमेल:</strong> support@smartbharat.gov.in</p>
                         <p style="margin-bottom: 12px;">🏢 <strong>केंद्रीय कार्यालय:</strong> नगर निगम भवन, विकास मार्ग, नई दिल्ली - 110001</p>
                         <hr style="border: none; border-top: 1px solid var(--line); margin: 16px 0;">
                         <p style="font-size: 12.5px; color: var(--ink-muted);">यदि आपको जलभराव, खराब सड़कों या स्ट्रीटलाइट से संबंधित शिकायत दर्ज करनी है, तो कृपया शीर्ष पर स्थित <strong>\"शिकायत दर्ज करें\"</strong> विकल्प का उपयोग करें।</p>
                       </div>`,
    modalFeedbackTitle: "प्रतिक्रिया दें",
    modalFeedbackComment: "अपनी टिप्पणियाँ लिखें (वैकल्पिक):",
    modalFeedbackPlaceholder: "कृपया अपना सुझाव साझा करें...",
    modalFeedbackSubmit: "फीडबैक भेजें",
    modalFeedbackSuccess: "आपकी प्रतिक्रिया प्राप्त हुई। स्मार्ट भारत को बेहतर बनाने में सहायता के लिए धन्यवाद!",
    modalFaqsTitle: "अक्सर पूछे जाने वाले प्रश्न",
    modalFaqsList: [
      { q: "शिकायत का समाधान होने में कितना समय लगता है?", a: "सामान्य तौर पर, स्ट्रीटलाइट और कचरे की सफाई में 24-48 घंटे लगते हैं। सड़क की मरम्मत और जल निकासी से संबंधित समस्याओं के समाधान में 3-5 कार्य दिवस लग सकते हैं।" },
      { q: "क्या मेरे द्वारा अपलोड किए गए दस्तावेज़ सुरक्षित हैं?", a: "हां। दस्तावेज़ सत्यापन लैब पूरी तरह से क्लाइंट-साइड काम करती है। आपकी फाइलें हमारे सर्वर पर अपलोड नहीं की जाती हैं, जिससे आपकी गोपनीयता बनी रहती है।" },
      { q: "क्या मैं बिना इंटरनेट के भी सहायक का उपयोग कर सकता हूँ?", a: "हां, यदि आपके पास इंटरनेट नहीं है या आपके पास कोई एपीआई कुंजी नहीं है, तो पोर्टल स्वचालित रूप से हमारे स्थानीय बुद्धिमान एनएलपी सिमुलेटर का उपयोग करता है जो अधिकांश सामान्य नागरिक प्रश्नों का उत्तर दे सकता है।" }
    ],
    modalHelpTitle: "सहायता एवं दिशा-निर्देश",
    modalHelpHtml: `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">पोर्टल का उपयोग कैसे करें:</h4>
                      <ol style="padding-left: 20px; margin-bottom: 20px;">
                        <li style="margin-bottom: 8px;"><strong>सहायक एआई:</strong> वॉयस माइक बटन का उपयोग करके बोलकर या लिखकर सरकारी योजनाओं के बारे में जानकारी प्राप्त करें।</li>
                        <li style="margin-bottom: 8px;"><strong>शिकायत दर्ज करें:</strong> मानचित्र पर क्लिक करके सटीक स्थान चुनें, समस्या की फोटो अपलोड करें और तुरंत शिकायत दर्ज करें।</li>
                        <li style="margin-bottom: 8px;"><strong>दस्तावेज़ सहायक:</strong> योजना का नाम लिखें और दस्तावेज़ों को ड्रैग-एंड-ड्रॉप करके पात्रता की जांच करें।</li>
                      </ol>
                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">एआई कुंजी कैसे कॉन्फ़िगर करें:</h4>
                      <p style="color: var(--ink-muted);">शीर्ष बार पर <strong>\"AI Config\"</strong> पर क्लिक करें, अपनी व्यक्तिगत जेमिनी एपीआई कुंजी दर्ज करें और सेटिंग्स सहेजें।</p>
                    </div>`
  },
  ta: {
    brandSub: "குடிமகன் உதவியாளர்",
    navhome: "முகப்பு",
    navassistant: "உதவியாளர் AI",
    navreport: "புகார் அளிக்கவும்",
    navtrack: "புகாரைக் கண்காணிக்க",
    navservices: "சேவை அடைவு",
    navdocs: "ஆவண உதவி",
    langLabel: "மொழி",
    heroTitle: "ஒவ்வொரு குடிமைப் பணிக்கும் ஒரு AI துணை.",
    heroSub: "கேள்விகளை உங்கள் சொந்த மொழியில் கேளுங்கள், உள்ளூர் பிரச்சினைகளைப் புகாரளிக்கவும், உங்கள் புகார்களைக் கண்காணிக்கவும், தேவையான ஆவணங்களைச் சரிபார்க்கவும்.",
    statOpenLabel: "செயலில் உள்ள புகார்கள்",
    statResolvedLabel: "தீர்க்கப்பட்ட சிக்கல்கள்",
    statAvail: "சஹாயக் ஆன்லைனில்",
    quickActionsLabel: "விரைவான செயல்கள்",
    qa1h: "சஹாயக்கிடம் கேளுங்கள்",
    qa1p: "அரசுத் திட்டங்கள், தகுதி மற்றும் அலுவலகங்கள் பற்றிய உடனடி பதில்களை தமிழ், இந்தி அல்லது ஆங்கிலத்தில் பெறுங்கள்.",
    qa2h: "பிரச்சினையைப் புகாரளிக்கவும்",
    qa2p: "மின்விளக்குகள், குப்பைகள், நீர் கசிவு அல்லது சாலைப் பள்ளங்கள் போன்ற பிரச்சினைகளை நகராட்சி இணையதளத்தில் புகாரளிக்கவும்.",
    qa3h: "ஆவணங்களைச் சரிபார்க்கவும்",
    qa3p: "தேவையான ஆவணங்களின் பட்டியலைக் கண்டறிந்து, எங்கள் சரிபார்ப்பு சிமுலேட்டரில் வரைவுகளைச் சரிபார்க்கவும்.",
    popularLabel: "பிரபலமான அடையாள மற்றும் நலன்புரி சேவைகள்",
    asstEyebrow: "AI துணை",
    asstTitle: "சஹாயக் AI",
    asstSub: "அரசுத் திட்டங்கள், தகுதி, நடைமுறைகள் அல்லது உள்ளூர் நகராட்சி அமைப்புகள் பற்றி கேளுங்கள் - நேரடி உதவி பெறுங்கள்.",
    reportEyebrow: "பொது குறை தீர்க்கும்",
    reportTitle: "பிரச்சினையைப் புகாரளிக்கவும்",
    reportSub: "நகராட்சி அதிகாரிகளுக்குத் தெரிவிக்க புகார் அளிக்கவும். கண்காணிப்பு எண்கள் மற்றும் நேரடி காலவரிசை அறிவிப்புகளைப் பெறுங்கள்.",
    lblCategory: "பிரச்சினை வகை",
    lblLocation: "இடம் / லேண்ட்மார்க்",
    lblDesc: "பிரச்சினையை விளக்கவும்",
    lblName: "உங்கள் பெயர் (விருப்பம்)",
    lblPhone: "தொலைபேசி எண் (விருப்பம்)",
    submitBtn: "புகாரைச் சமர்ப்பிக்கவும்",
    fileNoLabel: "அதிகாரப்பூர்வ கோப்பு கண்காணிப்பு எண்",
    confirmMsg: "உங்களது புகார் நகராட்சி சேவையகத்தில் பதிவு செய்யப்பட்டுள்ளது. நிலைமையைக் கண்காணிக்க இந்த ஐடியைச் சேமிக்கவும்.",
    fileAnother: "மற்றொரு சிக்கலைப் புகாரளிக்கவும்",
    trackEyebrow: "புகார் நிலை",
    trackTitle: "புகாரைக் கண்காணிக்க",
    trackSub: "செயலில் உள்ள சிக்கல்களைத் தேடவும், நகராட்சி முன்னேற்றப் பதிவைப் பார்க்கவும் அல்லது வரைபடத்தில் இடத்தைக் கண்டறியவும்.",
    trackSearch: "கோப்பு ஐடியை உள்ளிடவும் (எ.கா. SB-2026-103847)",
    trackSearchBtn: "தேடவும்",
    svcEyebrow: "அடைவு",
    svcTitle: "சேவை அடைவு",
    svcSub: "அடிக்கடி பயன்படுத்தப்படும் குடிமக்கள் சேவைகள். விவரங்களைப் படிக்க கார்டுகளைத் தேர்ந்தெடுக்கவும் அல்லது சஹாயக்கிடம் உதவி பெறவும்.",
    docEyebrow: "ஆவணச் சரிபார்ப்பு உதவியாளர்",
    docTitle: "என்ன ஆவணங்களை எடுத்துச் செல்ல வேண்டும்",
    docSub: "அலுவலகங்களுக்குத் திரும்பத் திரும்பச் செல்வதைத் தவிர்க்கவும். தேவையான ஆவணங்களைச் சரிபார்க்க சேவையின் பெயரைத் தட்டச்சு செய்யவும்.",
    lblDocGoal: "நீங்கள் எந்த சான்றிதழ்/சேவைக்கு விண்ணப்பிக்கிறீர்கள்?",
    docGoalPlaceholder: "எ.கா. புதிய பாஸ்போர்ட், சாதிச் சான்றிதழ், ஓட்டுநர் உரிமம் புதுப்பித்தல்",
    docSubmit: "தேவைகளை பகுப்பாய்வு செய்க",
    chatPlaceholder: "உங்கள் கேள்வியைத் தட்டச்சு செய்க...",
    chatSend: "அனுப்புக ➔",
    emptyTrack: "இந்த சாதனத்திலிருந்து இன்னும் புகார்கள் எதுவும் பதிவு செய்யப்படவில்லை. ஒரு புகாரைப் பதிவு செய்ய 'பிரச்சினையைப் புகாரளிக்கவும்' பக்கத்திற்குச் செல்லவும்.",
    notFound: "அந்த கண்காணிப்பு எண்ணில் எந்த நகராட்சிக் கோப்பும் காணப்படவில்லை.",
    thisArea: "உள்ளூர் வார்டில் உள்ள புகார்கள்",
    settingsText: "AI அமைப்புகள்",
    themeTextDark: "இருண்ட பயன்முறை",
    themeTextLight: "ஒளி பயன்முறை",
    lblMapMarker: "வரைபடத்தில் இருப்பிடத்தைக் குறிக்கவும் (தேர்ந்தெடுக்க கிளிக் செய்யவும்)",
    mapLabelText: "வார்டு வரைபடம் (மத்திய மாவட்டம்)",
    legPending: "நிலுவையில் உள்ளது",
    legProgress: "செயலில் உள்ளது",
    legResolved: "தீர்க்கப்பட்டது",
    lblImage: "பிரச்சினையின் புகைப்படம் (விருப்பம்)",
    uploadTextLabel: "புகைப்படத்தை இங்கே இழுத்து விடவும் அல்லது கிளிக் செய்யவும்",
    lblTimelinePhoto: "இணைக்கப்பட்ட புகைப்படம்",
    lblTimelineLog: "நகராட்சி நடவடிக்கை காலவரிசை",
    stepTitle1: "புகார் பதிவு செய்யப்பட்டது",
    stepTitle2: "பொறியாளர் நியமிக்கப்பட்டார்",
    stepTitle3: "சரிசெய்தல் பணி செயலில் உள்ளது",
    stepTitle4: "பிரச்சினை தீர்க்கப்பட்டது",
    muteStatusOn: "ஒலி இயக்கப்பட்டது",
    muteStatusOff: "ஒலி முடக்கப்பட்டது",
    asstStatusLabel: "செயலில் மற்றும் ஆன்லைனில்",
    modalConfigTitle: "AI எஞ்சின் அமைப்புகள்",
    modalConfigDesc: "கூகிள் ஜெமினியிடமிருந்து நேரடி பதில்களைப் பெற ஜெமினி ஏபிஐ கீயை (API Key) உள்ளிடவும். காலியாக இருந்தால், கணினி சிமுலேட்டர் பயன்முறையில் செயல்படும்.",
    lblConfigKey: "ஜெமினி API கீ",
    lblConfigModel: "மாதிரி பதிப்பு",
    btnCancelSettings: "ரத்துசெய்",
    btnSaveSettings: "அமைப்புகளைச் சேமிக்கவும்",
    alertTitle: "பருவமழை வடிகால் பிரச்சாரம் (ஜூலை 2026)",
    alertDesc: "நகராட்சியால் முக்கிய வடிகால் வாய்க்கால்கள் சுத்தம் செய்யப்படுகின்றன. உடனடியாக நடவடிக்கை எடுக்க \"புகார் அளிக்கவும்\" பக்கத்தைப் பயன்படுத்தி வெள்ளப் பெருக்கை புகாரளிக்கவும்.",
    accessibilityLabel: "உரை அணுகல்தன்மை",
    analyticsLabel: "நகராட்சி பகுப்பாய்வு மற்றும் வெளிப்படைத்தன்மை பதிவேடு",
    lblResolutionRate: "தீர்வு விகிதம்",
    lblAvgTimeLabel: "சராசரி தீர்வு நேரம்",
    lblActiveCrewsLabel: "செயலில் உள்ள குழுக்கள்",
    aiCategorySuggestion: "AI வகை பரிந்துரை",
    suggestedCategoryLabel: "AI பரிந்துரைத்த வகை:",
    lblFeedbackTitle: "தீர்வு தரத்தை மதிப்பிடுங்கள்",
    lblEscalateWarn: "தீர்வில் திருப்தி இல்லையா? மூத்த அதிகாரி மதிப்பாய்வுக்கு இந்த கோப்பை ஆணையாளர் தணிக்கை வாரியத்திற்கு அனுப்பவும்.",
    btnEscalateGrievance: "வழக்கை மேல்முறையீடு செய்யவும்",
    categoryLabels: {
      'Roads & Potholes': 'சாலைகள் மற்றும் பள்ளங்கள்',
      'Streetlights': 'தெருவிளக்குகள்',
      'Garbage & Sanitation': 'குப்பை மற்றும் சுகாதாரம்',
      'Water Supply': 'நீர் விநியோகம்',
      'Drainage': 'வடிகால்',
      'Public Nuisance': 'பொது தொல்லை',
      'Other': 'இதர'
    },
    footerTitle: "ஸ்மார்ட் பாரத் போர்டல்",
    footerDesc: "ஒவ்வொரு குடிமகனுக்கும் வெளிப்படையான, அணுகக்கூடிய மற்றும் டிஜிட்டல் முறையில் உள்ளடக்கிய பொதுச் சேவைகளை வழங்க நகராட்சி வாரியத்தின் அதிகாரப்பூர்வ உற்பத்தி எஐ முயற்சி.",
    footerLabelInfo: "தகவல்",
    footerLabelSupport: "ஆதரவு",
    footerLabelGov: "அரசு இணைப்புகள்",
    footerCopyright: "© 2026 நகராட்சி கழகம். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    // Modal Keys
    modalAboutTitle: "எங்களைப் பற்றி",
    modalAboutHtml: `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);">வரவேற்கிறோம் <strong>ஸ்மார்ட் பாரத் குடிமகன் உதவி போர்டல்</strong>.</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">இந்த தளம் நகராட்சி நிர்வாக பணிகளை எளிதாக்க எங்களின் எஐ-உதவியாளரை பயன்படுத்தும் ஒருங்கிணைந்த தளமாகும்.</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">நகராட்சி குடிமக்களுக்கு திறமையான மற்றும் டிஜிட்டல் பாதுகாப்புடன் கூடிய பொது சேவைகளை வழங்குவதே எங்களின் குறிக்கோள்.</p>`,
    modalContactTitle: "தொடர்பு கொள்ள",
    modalContactHtml: `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
                         <p style="margin-bottom: 12px;">📞 <strong>நாங்கள் உதவும் எண்:</strong> 1800-345-5678 (24x7 கிடைக்கும்)</p>
                         <p style="margin-bottom: 12px;">📧 <strong>மின்னஞ்சல் முகவரி:</strong> support@smartbharat.gov.in</p>
                         <p style="margin-bottom: 12px;">🏢 <strong>தலைமை அலுவலகம்:</strong> நகராட்சி தலைமையகம், விகாஸ் மார்க், புது தில்லி - 110001</p>
                       </div>`,
    modalFeedbackTitle: "எங்கள் போர்ட்டலை மதிப்பிடுங்கள்",
    modalFeedbackComment: "கருத்துக்களை சேர்க்கவும் (விருப்பம்):",
    modalFeedbackPlaceholder: "சஹாயக் AI உடனான உங்கள் அனுபவத்தை பகிர்ந்து கொள்ளுங்கள்...",
    modalFeedbackSubmit: "கருத்தை சமர்ப்பிக்கவும்",
    modalFeedbackSuccess: "உங்கள் கருத்துக்கு நன்றி! போர்ட்டலை மேம்படுத்த இது உதவும்.",
    modalFaqsTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    modalFaqsList: [
      { q: "பிரச்சினை தீர்க்கப்பட எவ்வளவு காலம் ஆகும்?", a: "தெருவிளக்கு பழுது அல்லது குப்பை சுத்தம் 24-48 மணிநேரத்திற்குள் சரி செய்யப்படும். சாலை பழுதுகள் மற்றும் வடிகால் அடைப்பு பணிகள் 3-5 வேலை நாட்கள் ஆகும்." },
      { q: "நாங்கள் பதிவேற்றும் ஆவணங்கள் பாதுகாப்பானதா?", a: "ஆம், நிச்சயமாக. ஆவண சரிபார்ப்பு உங்கள் உலாவியில் மட்டுமே இயங்குகிறது, சர்வர்களில் சேமிக்கப்பட மாட்டாது." }
    ],
    modalHelpTitle: "உதவி & வழிகாட்டுதல்கள்",
    modalHelpHtml: `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
                      <h4 style="margin: 0 0 8px 0; font-size: 15px;">வழிமுறைகள்:</h4>
                      <ol style="padding-left: 20px;">
                        <li>வொய்ஸ் பட்டனை பயன்படுத்தி உங்கள் சொந்த மொழியில் திட்டங்கள் பற்றி பேசிக் கேட்கலாம்.</li>
                        <li>வழிகாட்டி வரைபடத்தில் இடத்தை குறியிட்டு எளிதாக புகார் அளிக்கலாம்.</li>
                      </ol>
                    </div>`
  },
  bn: {
    brandSub: "নাগরিক সহকারী",
    navhome: "হোম",
    navassistant: "সহায়ক AI",
    navreport: "অভিযোগ জানান",
    navtrack: "অভিযোগ ট্র্যাক করুন",
    navservices: "পরিষেবা নির্দেশিকা",
    navdocs: "নথিপত্র সহায়ক",
    langLabel: "ভাষা",
    heroTitle: "প্রতিটি নাগরিক কাজের জন্য একটি AI সঙ্গী।",
    heroSub: "আপনার নিজস্ব ভাষায় প্রশ্ন জিজ্ঞাসা করুন, স্থানীয় সমস্যাগুলির অভিযোগ জানান এবং আপনার অভিযোগ ট্র্যাক করুন।",
    statOpenLabel: "সক্রিয় অভিযোগ",
    statResolvedLabel: "মীমাংসিত সমস্যা",
    statAvail: "সহায়ক অনলাইন",
    quickActionsLabel: "দ্রুত অ্যাকশন",
    qa1h: "সহায়ককে জিজ্ঞাসা করুন",
    qa1p: "সরকারী প্রকল্প, যোগ্যতা এবং অফিস সম্পর্কে তাত্ক্ষণিক উত্তর বাংলা, হিন্দি বা ইংরেজিতে পান।",
    qa2h: "সমস্যা রিপোর্ট করুন",
    qa2p: "রাস্তার আলো, আবর্জনা, জলের লিক বা রাস্তার গর্তের মতো সমস্যাগুলি পৌরসভা পোর্টালে রিপোর্ট করুন।",
    qa3h: "নথিপত্র পরীক্ষা করুন",
    qa3p: "প্রয়োজনীয় নথির তালিকা খুঁজুন এবং আমাদের চেকলিস্ট সিমুলেটরে খসড়াগুলি পরীক্ষা করুন।",
    popularLabel: "জনপ্রিয় পরিচয় এবং কল্যাণ পরিষেবা",
    asstEyebrow: "AI সঙ্গী",
    asstTitle: "সহায়ক AI",
    asstSub: "সরকারী প্রকল্প, যোগ্যতা, প্রশাসনিক পদ্ধতি বা স্থানীয় পৌরসভা সম্পর্কে জিজ্ঞাসা করুন - সরাসরি সহায়তা পান।",
    reportEyebrow: "জনসাধারণের অভিযোগ",
    reportTitle: "অভিযোগ জানান",
    reportSub: "পৌরসভা কর্মকর্তাদের জানাতে অভিযোগ দায়ের করুন। ট্র্যাকিং নম্বর এবং লাইভ টাইমলাইন আপডেট পান।",
    lblCategory: "সমস্যার বিভাগ",
    lblLocation: "অবস্থান / ল্যান্ডমার্ক",
    lblDesc: "সমস্যাটি বর্ণনা করুন",
    lblName: "আপনার নাম (ঐচ্ছিক)",
    lblPhone: "যোগাযোগ নম্বর (ঐচ্ছিক)",
    submitBtn: "অভিযোগ জমা দিন",
    fileNoLabel: "অফিসিয়াল ফাইল ট্র্যাকিং নম্বর",
    confirmMsg: "আপনার অভিযোগ পৌরসভা সার্ভার রেজিস্ট্রিতে নথিভুক্ত করা হয়েছে। অগ্রগতি ট্র্যাক করতে এই আইডিটি সংরক্ষণ করুন।",
    fileAnother: "অন্য একটি অভিযোগ দায়ের করুন",
    trackEyebrow: "অভিযোগের স্থিতি",
    trackTitle: "অভিযোগ ট্র্যাক করুন",
    trackSub: "সক্রিয় অভিযোগগুলি খুঁজুন, পৌরসভার অগ্রগতি লগ দেখুন বা মানচিত্রে অবস্থান দেখুন।",
    trackSearch: "ফাইল আইডি লিখুন (যেমন SB-2026-103847)",
    trackSearchBtn: "অনুসন্ধান",
    svcEyebrow: "নির্দেশিকা",
    svcTitle: "পরিষেবা নির্দেশিকা",
    svcSub: "সাধারণত ব্যবহৃত নাগরিক পরিষেবা। বিশদ বিবরণ পড়তে কার্ডগুলি নির্বাচন করুন বা সহায়কের সাহায্য নিন।",
    docEyebrow: "নথিপত্র চেকলিস্ট সহায়ক",
    docTitle: "কি কি নথি সঙ্গে রাখতে হবে",
    docSub: "অফিসে বারবার যাওয়া এড়িয়ে চলুন। প্রয়োজনীয় নথিগুলি পরীক্ষা করতে পরিষেবার নামটি টাইপ করুন।",
    lblDocGoal: "আপনি কোন শংসাপত্র/পরিষেবার জন্য আবেদন করছেন?",
    docGoalPlaceholder: "যেমন: নতুন পাসপোর্ট, জাতিগত শংসাপত্র, ড্রাইভিং লাইসেন্স নবীকরণ",
    docSubmit: "প্রয়োজনীয়তা বিশ্লেষণ করুন",
    chatPlaceholder: "আপনার প্রশ্নটি টাইপ করুন...",
    chatSend: "পাঠান ➔",
    emptyTrack: "এই ডিভাইস থেকে এখনও কোনও অভিযোগ দায়ের করা হয়নি। অভিযোগ দায়ের করতে 'অভিযোগ জানান' পৃষ্ঠায় যান।",
    notFound: "সেই ট্র্যাকিং নম্বরে কোনও পৌরসভা ফাইল পাওয়া যায়নি।",
    thisArea: "আপনার ওয়ার্ডের সাম্প্রতিক অভিযোগ",
    settingsText: "AI সেটিংস",
    themeTextDark: "ডার্ক মোড",
    themeTextLight: "লাইট মোড",
    lblMapMarker: "ওয়ার্ড মানচিত্রে অবস্থান পিন করুন (নির্বাচন করতে ক্লিক করুন)",
    mapLabelText: "ওয়ার্ড মানচিত্র (মধ্য জেলা)",
    legPending: "মুলতুবি",
    legProgress: "সক্রিয়",
    legResolved: "সম্পন্ন",
    lblImage: "সমস্যার ছবি (ঐচ্ছিক)",
    uploadTextLabel: "ছবিটি এখানে টেনে এনে ছেড়ে দিন, অথবা আপলোড করতে ক্লিক করুন",
    lblTimelinePhoto: "সংযুক্ত ছবি",
    lblTimelineLog: "পৌরসভার পদক্ষেপের টাইমলাইন",
    stepTitle1: "অভিযোগ নথিভুক্ত হয়েছে",
    stepTitle2: "প্রকৌশলী নিযুক্ত",
    stepTitle3: "সংশোধনমূলক কাজ সক্রিয়",
    stepTitle4: "সমস্যা সমাধান হয়েছে",
    muteStatusOn: "শব্দ চালু",
    muteStatusOff: "শব্দ বন্ধ",
    asstStatusLabel: "সক্রিয় এবং অনলাইন",
    modalConfigTitle: "AI ইঞ্জিন কনফিগারেশন",
    modalConfigDesc: "জে মিনি AI থেকে সরাসরি উত্তর পেতে আপনার জে মিনি API কী লিখুন। খালি থাকলে, সিস্টেমটি অফলাইন সিমুলেটর মোডে চলবে।",
    lblConfigKey: "জে মিনি API কী",
    lblConfigModel: "মডেল সংস্করণ",
    btnCancelSettings: "বাতিল করুন",
    btnSaveSettings: "সেটিংস সংরক্ষণ করুন",
    alertTitle: "বর্ষাকালীন জল নিষ্কাশন অভিযান (জুলাই 2026)",
    alertDesc: "পৌরসভা প্রধান নর্দমাগুলি পরিষ্কার করছে। অবিলম্বে ব্যবস্থা গ্রহণের জন্য জল জমার রিপোর্ট করুন।",
    accessibilityLabel: "পাঠ্য অ্যাক্সেসিবিলিটি",
    analyticsLabel: "পৌরসভার বিশ্লেষণ ও স্বচ্ছতার খতিয়ান",
    lblResolutionRate: "সমাধানের হার",
    lblAvgTimeLabel: "গড় সমাধানের সময়",
    lblActiveCrewsLabel: "সক্রিয় পরিষেবা দল",
    aiCategorySuggestion: "AI প্রস্তাবিত বিভাগ",
    suggestedCategoryLabel: "AI প্রস্তাবিত বিভাগ:",
    lblFeedbackTitle: "সমাধানের গুণমান মূল্যায়ন করুন",
    lblEscalateWarn: "পদক্ষেপে সন্তুষ্ট নন? পর্যালোচনার জন্য এই ফাইলটি কমিশনার অডিট বোর্ডে প্রেরণ করুন।",
    btnEscalateGrievance: "মামলা আপিল করুন",
    categoryLabels: {
      'Roads & Potholes': 'রাস্তা এবং গর্ত',
      'Streetlights': 'রাস্তার আলো',
      'Garbage & Sanitation': 'আবর্জনা ও পরিচ্ছন্নতা',
      'Water Supply': 'জল সরবরাহ',
      'Drainage': 'নর্দমা ও বন্যা',
      'Public Nuisance': 'পাবলিক উপদ্রব',
      'Other': 'অন্যান্য'
    },
    footerTitle: "স্মার্ট ভারত পোর্টাল",
    footerDesc: "প্রতিটি নাগরিককে স্বচ্ছ, অ্যাক্সেসযোগ্য এবং ডিজিটালভাবে অন্তর্ভুক্ত পাবলিক পরিষেবা প্রদানের জন্য পৌরসভা বোর্ডের একটি অফিসিয়াল জেনারেটিভ এআই উদ্যোগ।",
    footerLabelInfo: "তথ্য",
    footerLabelSupport: "সহায়তা",
    footerLabelGov: "সরকারী লিঙ্ক",
    footerCopyright: "© 2026 পৌরসভা কর্পোরেশন। সর্বস্বত্ব সংরক্ষিত।",
    // Modal Keys
    modalAboutTitle: "আমাদের সম্পর্কে",
    modalAboutHtml: `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);">স্বাগতম <strong>স্মার্ট ভারত নাগরিক পোর্টাল</strong>-এ।</p>
                     <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">এই পোর্টালটি নাগরিক সেবা ও পৌরসভা কাজ ত্বরান্বিত করতে এআই-সহায়কের দ্বারা নির্মিত একটি ডিজিটাল প্ল্যাটফর্ম।</p>`,
    modalContactTitle: "যোগাযোগ",
    modalContactHtml: `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
                         <p style="margin-bottom: 12px;">📞 <strong>হেল্পলাইন:</strong> 1800-345-5678 (২৪x৭ উপলব্ধ)</p>
                         <p style="margin-bottom: 12px;">📧 <strong>ইমেল:</strong> support@smartbharat.gov.in</p>
                         <p style="margin-bottom: 12px;">🏢 <strong>প্রধান কার্যালয়:</strong> পৌর কর্পোরেশন ভবন, বিকাশ মার্গ, নতুন দিল্লি - ১১০০০১</p>
                       </div>`,
    modalFeedbackTitle: "মতামত দিন",
    modalFeedbackComment: "মন্তব্য যোগ করুন (ঐচ্ছিক):",
    modalFeedbackPlaceholder: "আপনার মতামত লিখুন...",
    modalFeedbackSubmit: "মতামত জমা দিন",
    modalFeedbackSuccess: "মতামতের জন্য ধন্যবাদ! এটি আমাদের পোর্টাল উন্নত করতে সাহায্য করবে।",
    modalFaqsTitle: "সাধারণ প্রশ্নাবলী (FAQs)",
    modalFaqsList: [
      { q: "অভিযোগ সমাধান হতে কত সময় লাগে?", a: "রাস্তার আলো ও আবর্জনার সমস্যা ২৪-৪৮ ঘণ্টার মধ্যে সমাধান করা হয়। জল এবং ড্রেনের সমস্যা ৩-৫ কার্যদিবস সময় নিতে পারে।" },
      { q: "আমার ফাইলগুলি কি সুরক্ষিত থাকবে?", a: "হ্যাঁ, সম্পূর্ণভাবে। আমাদের ভেরিফিকেশন সিস্টেম সম্পূর্ণভাবে ব্রাউজারে কাজ করে ও কোনো সার্ভারে ফাইল আপলোড হয় না।" }
    ],
    modalHelpTitle: "সহায়তা ও নির্দেশাবলী",
    modalHelpHtml: `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
                      <h4>ব্যবহার বিধি:</h4>
                      <ol style="padding-left: 20px;">
                        <li>সহায়কের সাথে ভয়েস পিন ব্যবহার করে নিজের ভাষায় কথা বলুন।</li>
                        <li>অভিযোগ জানাতে মানচিত্রের সঠিক স্থানে পিন করুন ও ছবি সংযুক্ত করুন।</li>
                      </ol>
                    </div>`
  }
};


// ----------------------------------------------------
// PRE-DEFINED MOCK DATA & KNOWLEDGE SYSTEM (LOCAL FALLBACK)
// ----------------------------------------------------
const SERVICES_DATA = [
  {
    icn: "🆔",
    key: "aadhaar",
    category: "Identity",
    en: {
      name: "Aadhaar Card Update/Enrolment",
      desc: "Enroll for a new Aadhaar number or update demographic and biometric details.",
      steps: [
        "Find your nearest Aadhaar Seva Kendra via uidai.gov.in.",
        "Book an appointment online or walk in with document proofs.",
        "Submit filled Enrollment/Update form along with proofs.",
        "Provide biometric data (fingerprints, iris scan, and photograph) at the desk.",
        "Pay the nominal fee (free for new enrollment, ₹50 for demographic update, ₹100 for biometric update).",
        "Collect the Acknowledgement Slip containing the 14-digit EID."
      ],
      docs: ["Proof of Identity (e.g. Passport, PAN, Voter ID)", "Proof of Address (e.g. Electricity Bill, Bank Statement)", "Proof of Date of Birth (e.g. Birth Certificate, SSLC Book)"],
      timeline: "90 days (Usually updates online within 7-15 days)",
      office: "UIDAI Aadhaar Seva Kendra / Selected Post Offices & Banks"
    },
    hi: {
      name: "आधार कार्ड अपडेट / नया नामांकन",
      desc: "नया आधार नंबर प्राप्त करें या जनसांख्यिकीय (demographic) और बायोमेट्रिक विवरण अपडेट करें।",
      steps: [
        "uidai.gov.in के माध्यम से अपने निकटतम आधार सेवा केंद्र का पता लगाएं।",
        "ऑनलाइन अपॉइंटमेंट बुक करें या सीधे केंद्र पर जाएं।",
        "दस्तावेज़ प्रमाणों के साथ भरा हुआ नामांकन / अपडेट फॉर्म जमा करें।",
        "डेस्क पर बायोमेट्रिक डेटा (उंगलियों के निशान, आईरिस स्कैन और फोटो) प्रदान करें।",
        "नाममात्र शुल्क का भुगतान करें (नए नामांकन के लिए मुफ्त, अपडेट के लिए ₹50-₹100)।",
        "14-अंकीय EID वाली पावती पर्ची (Acknowledgement Slip) प्राप्त करें।"
      ],
      docs: ["पहचान का प्रमाण (उदा. पासपोर्ट, पैन कार्ड, वोटर आईडी)", "पते का प्रमाण (उदा. बिजली बिल, बैंक स्टेटमेंट)", "जन्म तिथि का प्रमाण (उदा. जन्म प्रमाण पत्र, स्कूल टीसी)"],
      timeline: "90 दिन (आमतौर पर 7-15 दिनों में ऑनलाइन अपडेट हो जाता है)",
      office: "UIDAI आधार सेवा केंद्र / अधिकृत डाकघर और बैंक"
    }
  },
  {
    icn: "💳",
    key: "pan",
    category: "Finance",
    en: {
      name: "Permanent Account Number (PAN) Card",
      desc: "Apply for a fresh PAN card or request correction in an existing card for financial transactions.",
      steps: [
        "Go to the official Protean (NSDL) or UTIITSL online portal.",
        "Fill Form 49A (Indian Citizens) or Form 49AA (Foreign Citizens).",
        "Upload scans of ID, Address, and Date of Birth proofs.",
        "Pay the application fee (~₹107 for physical card inside India, ~₹1011 for foreign addresses).",
        "Authenticate using Aadhaar OTP (e-KYC) for paperless application, or post physical docs to NSDL office."
      ],
      docs: ["Aadhaar Card", "Recent Passport Size Photographs (2 copies)", "Proof of Date of Birth"],
      timeline: "10-15 business days (e-PAN is sent via email in 48 hours)",
      office: "Income Tax PAN Services Unit (Online Protean/UTIITSL)"
    },
    hi: {
      name: "स्थायी खाता संख्या (PAN) कार्ड",
      desc: "वित्तीय लेनदेन के लिए नया पैन कार्ड बनवाएं या मौजूदा कार्ड में सुधार का अनुरोध करें।",
      steps: [
        "Protean (NSDL) या UTIITSL के आधिकारिक ऑनलाइन पोर्टल पर जाएं।",
        "फॉर्म 49A (भारतीय नागरिक) भरें।",
        "पहचान, पते और जन्म तिथि के प्रमाणों की स्कैन कॉपी अपलोड करें।",
        "आवेदन शुल्क का भुगतान करें (~₹107)।",
        "पेपरलेस आवेदन के लिए आधार ओटीपी (e-KYC) का उपयोग करके सत्यापित करें।"
      ],
      docs: ["आधार कार्ड", "हालिया पासपोर्ट साइज फोटो (2 प्रतियां)", "जन्म तिथि का प्रमाण"],
      timeline: "10-15 कार्य दिवस (e-PAN 48 घंटे में ईमेल द्वारा भेजा जाता है)",
      office: "आयकर पैन सेवा इकाई (ऑनलाइन Protean/UTIITSL)"
    }
  },
  {
    icn: "✈️",
    key: "passport",
    category: "Travel",
    en: {
      name: "Indian Passport Application",
      desc: "Register online for a fresh passport, reissue, or tatkal emergency passport services.",
      steps: [
        "Register on the Passport Seva Portal (passportindia.gov.in).",
        "Log in and fill the application form (Fresh/Reissue, Normal/Tatkal).",
        "Pay the fee online (₹1,500 for normal 36 pages, ₹3,500 for Tatkal) and book appointment.",
        "Visit the Passport Seva Kendra (PSK) with original documents.",
        "Complete biometric enrolment and document verification at the PSK counters.",
        "Police Verification will be initiated at your local address.",
        "Passport is printed and dispatched via Speed Post."
      ],
      docs: ["Proof of Address (Aadhaar, Voter ID, Rent Agreement, Passbook)", "Proof of Date of Birth (Birth Certificate, Matriculation Certificate)", "Non-ECR proof if applicable (10th standard certificate or higher)"],
      timeline: "15-20 days (Normal), 3-7 days (Tatkal)",
      office: "Regional Passport Office / Passport Seva Kendra (PSK)"
    },
    hi: {
      name: "भारतीय पासपोर्ट आवेदन",
      desc: "नए पासपोर्ट, नवीनीकरण (reissue) या तत्काल आपातकालीन सेवाओं के लिए ऑनलाइन पंजीकरण करें।",
      steps: [
        "पासपोर्ट सेवा पोर्टल (passportindia.gov.in) पर पंजीकरण करें।",
        "लॉग इन करें और आवेदन पत्र भरें (सामान्य/तत्काल)।",
        "ऑनलाइन शुल्क का भुगतान करें (सामान्य के लिए ₹1,500, तत्काल के लिए ₹3,500) और अपॉइंटमेंट बुक करें।",
        "मूल दस्तावेजों के साथ पासपोर्ट सेवा केंद्र (PSK) जाएं।",
        "बायोमेट्रिक नामांकन और दस्तावेज़ सत्यापन पूरा करें।",
        "स्थानीय पुलिस द्वारा पते का सत्यापन किया जाएगा।",
        "सत्यापन के बाद पासपोर्ट स्पीड पोस्ट द्वारा भेजा जाएगा।"
      ],
      docs: ["पते का प्रमाण (आधार, वोटर आईडी, बैंक पासबुक)", "जन्म तिथि का प्रमाण (जन्म प्रमाण पत्र, 10वीं मार्कशीट)", "गैर-ईसीआर प्रमाण यदि लागू हो (10वीं का प्रमाणपत्र)"],
      timeline: "15-20 दिन (सामान्य), 3-7 दिन (तत्काल)",
      office: "क्षेत्रीय पासपोर्ट कार्यालय / पासपोर्ट सेवा केंद्र (PSK)"
    }
  },
  {
    icn: "🌾",
    key: "ration",
    category: "Welfare",
    en: {
      name: "Ration Card (NFSA Benefit)",
      desc: "Apply for a new family ration card or modify members for subsidized foodgrain distributions.",
      steps: [
        "Visit your State's Food & Civil Supplies portal or local Common Service Centre (CSC).",
        "Download Form A (for new card) or Form B (for modification).",
        "Fill family details, income certificate, and bank details of the female head of the family.",
        "Attach gas connection details, Aadhaar card copies of all family members.",
        "Submit the application form and pay minor fee (₹5-₹20).",
        "Verification officer will physically inspect the house before approval."
      ],
      docs: ["Aadhaar Cards of all family members", "Income Certificate of the family", "Bank Account Passbook (Female Head of Family)", "Electricity Bill / Address Proof"],
      timeline: "15-30 days",
      office: "District Food & Supply Office / State Citizen Portals (e-District)"
    },
    hi: {
      name: "राशन कार्ड (NFSA लाभ)",
      desc: "रियायती खाद्यान्न वितरण के लिए नया पारिवारिक राशन कार्ड बनवाएं या सदस्यों के नाम जोड़ें/संशोधित करें।",
      steps: [
        "राज्य के खाद्य एवं नागरिक आपूर्ति पोर्टल या स्थानीय जन सेवा केंद्र (CSC) पर जाएं।",
        "आवेदन पत्र डाउनलोड करें और परिवार के विवरण भरें।",
        "परिवार की महिला मुखिया का बैंक विवरण और आय प्रमाण पत्र संलग्न करें।",
        "सभी सदस्यों के आधार कार्ड की प्रतियां संलग्न करें।",
        "आवेदन जमा करें और सत्यापन अधिकारी के भौतिक निरीक्षण की प्रतीक्षा करें।"
      ],
      docs: ["सभी परिवार के सदस्यों के आधार कार्ड", "परिवार का आय प्रमाण पत्र", "बैंक पासबुक (महिला मुखिया की)", "बिजली का बिल / पते का प्रमाण"],
      timeline: "15-30 दिन",
      office: "जिला खाद्य एवं आपूर्ति कार्यालय / राज्य ई-डिस्ट्रिक्ट पोर्टल"
    }
  },
  {
    icn: "🗳️",
    key: "voterid",
    category: "Identity",
    en: {
      name: "Voter ID Card Registration (Form 6)",
      desc: "Register as a new voter, change constituency, or correct details on the National Voter Services Portal.",
      steps: [
        "Visit voterportal.eci.gov.in or download the Voters Helpline App.",
        "Create an account and click on 'Form 6' (Application for New Voter).",
        "Fill in personal details, constituency, and family voter links.",
        "Upload passport size photograph, age proof, and address proof.",
        "Submit application online. The Booth Level Officer (BLO) will visit your address for verification.",
        "Once verified, Epic Card is sent by post."
      ],
      docs: ["Passport Size Photograph", "Age Proof (Birth Certificate, PAN, 10th marksheet)", "Address Proof (Aadhaar, Water/Electricity Bill)"],
      timeline: "30-45 days",
      office: "Electoral Registration Officer (ERO) / local BLO office"
    },
    hi: {
      name: "वोटर आईडी कार्ड पंजीकरण (फॉर्म 6)",
      desc: "नए मतदाता के रूप में पंजीकरण करें, निर्वाचन क्षेत्र बदलें, या मतदाता सूची में विवरण सुधारें।",
      steps: [
        "voterportal.eci.gov.in पर जाएं या 'Voter Helpline App' डाउनलोड करें।",
        "नया खाता बनाएं और 'फॉर्म 6' पर क्लिक करें।",
        "व्यक्तिगत विवरण, निर्वाचन क्षेत्र और परिवार के सदस्यों के वोटर लिंक भरें।",
        "फोटो, आयु प्रमाण और पते का प्रमाण अपलोड करें।",
        "सत्यापन के लिए बीएलओ (BLO) आपके घर आएगा। इसके बाद डाक द्वारा कार्ड मिल जाएगा।"
      ],
      docs: ["पासपोर्ट साइज फोटो", "आयु का प्रमाण (जन्म प्रमाण पत्र, पैन कार्ड, 10वीं मार्कशीट)", "पते का प्रमाण (आधार, पानी/बिजली का बिल)"],
      timeline: "30-45 दिन",
      office: "निर्वाचक पंजीकरण अधिकारी (ERO) / स्थानीय बीएलओ कार्यालय"
    }
  },
  {
    icn: "💼",
    key: "income",
    category: "Welfare",
    en: {
      name: "Income Certificate",
      desc: "Apply for a government-certified proof of annual family income to claim scholarships and subsidy benefits.",
      steps: [
        "Log in to your State's e-District portal or visit a CSC center.",
        "Fill the Income Certificate application form.",
        "Attach salary slips, income tax returns, or landlord/patwari report verify.",
        "Submit the details and pay the processing fee (approx. ₹15 to ₹50).",
        "Tehsildar/Revenue inspector reviews the self-declaration and local patwari survey.",
        "Download digitised signed certificate from the portal."
      ],
      docs: ["Aadhaar Card", "Salary Slips / Form 16 / Income Declaration Affidavit", "Ration Card", "Patwari / Lekhpal report verification"],
      timeline: "7-15 days",
      office: "Tehsil Office / Revenue Department / e-District online portal"
    },
    hi: {
      name: "आय प्रमाण पत्र",
      desc: "छात्रवृत्ति, शुल्क प्रतिपूर्ति और सरकारी सब्सिडी के लाभों के लिए वार्षिक पारिवारिक आय का प्रमाणित दस्तावेज।",
      steps: [
        "राज्य के ई-डिस्ट्रिक्ट पोर्टल पर लॉग इन करें या सीएससी केंद्र पर जाएं।",
        "आय प्रमाण पत्र का आवेदन पत्र भरें।",
        "वेतन पर्ची, आयकर रिटर्न या पटवारी रिपोर्ट संलग्न करें।",
        "विवरण जमा करें और प्रोसेसिंग शुल्क (~₹15 से ₹50) का भुगतान करें।",
        "तहसीलदार/राजस्व निरीक्षक द्वारा सत्यापन के बाद प्रमाण पत्र डाउनलोड करें।"
      ],
      docs: ["आधार कार्ड", "वेतन पर्ची / फॉर्म 16 / आय स्व-घोषणा शपथ पत्र", "राशन कार्ड", "पटवारी / लेखपाल सत्यापन रिपोर्ट"],
      timeline: "7-15 दिन",
      office: "तहसील कार्यालय / राजस्व विभाग / राज्य ई-डिस्ट्रिक्ट पोर्टल"
    }
  }
];

const OFFLINE_COMPLAINTS = [
  {
    fileNo: 'SB-2026-981273',
    category: 'Streetlights',
    location: 'Ward 12, Main Bazar, near Post Office',
    desc: 'Entire street is dark because 4 sodium vapor streetlights are fused. High risk of chain snatching at night.',
    name: 'Ramesh Sharma',
    phone: '9876543210',
    status: 'submitted',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    coords: { x: 80, y: 70 },
    history: [
      { status: 'submitted', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), desc: 'Complaint registered by Ramesh Sharma. Assigned to Central Ward Maintenance Desk.' }
    ]
  },
  {
    fileNo: 'SB-2026-554210',
    category: 'Roads & Potholes',
    location: 'Sector 4, Cross Road 3',
    desc: 'Deep pothole has developed right at the blind turn. Multiple two-wheelers have skidded here.',
    name: 'Priya Iyer',
    phone: '9123456789',
    status: 'progress',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    coords: { x: 190, y: 150 },
    history: [
      { status: 'submitted', date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), desc: 'Complaint filed.' },
      { status: 'assigned', date: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), desc: 'Junior Engineer Sandeep Kumar assigned for site verification.', officer: 'JE Sandeep Kumar (PWD)' },
      { status: 'progress', date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), desc: 'Road repair crew dispatched. Asphalt mix laying initiated.', officer: 'JE Sandeep Kumar (PWD)' }
    ]
  }
];

// ----------------------------------------------------
// LOCAL CUSTOM NLP RESPONSE ENGINE
// ----------------------------------------------------
function getLocalNLPResponse(query, lang) {
  const q = query.toLowerCase();
  
  if (q.includes('passport') || q.includes('पासपोर्ट')) {
    const s = SERVICES_DATA.find(x => x.key === 'passport');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }
  
  if (q.includes('aadhaar') || q.includes('aadhar') || q.includes('आधार')) {
    const s = SERVICES_DATA.find(x => x.key === 'aadhaar');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }
  
  if (q.includes('pan') || q.includes('पैन')) {
    const s = SERVICES_DATA.find(x => x.key === 'pan');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }
  
  if (q.includes('ration') || q.includes('राशन') || q.includes('rashan')) {
    const s = SERVICES_DATA.find(x => x.key === 'ration');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }
  
  if (q.includes('voter') || q.includes('मतदाता') || q.includes('election') || q.includes('चुनाव')) {
    const s = SERVICES_DATA.find(x => x.key === 'voterid');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }
  
  if (q.includes('income') || q.includes('आय')) {
    const s = SERVICES_DATA.find(x => x.key === 'income');
    const t = lang === 'hi' ? s.hi : s.en;
    return generateStructuredServiceText(t, lang);
  }

  if (q.includes('streetlight') || q.includes('लाइट') || q.includes('बिजली')) {
    if (lang === 'hi') {
      return `💡 **स्ट्रीटलाइट शिकायतों की गाइड**\n\nयदि आपके क्षेत्र की स्ट्रीटलाइट काम नहीं कर रही है, तो आप इसे सीधे दर्ज कर सकते हैं:\n1. **शिकायत दर्ज करें** टैब पर जाएं।\n2. 'स्ट्रीटलाइट्स' श्रेणी चुनें।\n3. मानचित्र पर स्थान पिन करें और विवरण जोड़ें।\n\n**समय सीमा (Timelines):** नगर निगम नियमों के तहत 48 घंटे में समाधान आवश्यक है। कोई अतिरिक्त शुल्क नहीं है।`;
    }
    return `💡 **Streetlight Grievances Guide**\n\nIf streetlights in your area are broken or flickering, you can file a complaint directly:\n1. Go to the **Report an Issue** tab.\n2. Choose 'Streetlights' category.\n3. Pin the location on the interactive map and submit details.\n\n**Timeline:** Resolved within 48 hours according to the citizen charter. No fee applies.`;
  }

  if (q.includes('pothole') || q.includes('road') || q.includes('गड्ढा') || q.includes('सड़क') || q.includes('road')) {
    if (lang === 'hi') {
      return `🛣️ **सड़क और गड्ढों की शिकायत गाइड**\n\nटूटी सड़कों या गहरे गड्ढों की रिपोर्ट करने के लिए:\n1. **शिकायत दर्ज करें** टैब पर जाएं।\n2. 'सड़क और गड्ढे' श्रेणी का चयन करें।\n3. सटीक क्षेत्र निर्दिष्ट करें और यदि संभव हो तो एक तस्वीर अपलोड करें।\n\n**समय सीमा:** मुख्य सड़कों के गड्ढे 7 दिनों के भीतर और आंतरिक सड़कों के 15 दिनों के भीतर भरे जाने चाहिए।`;
    }
    return `🛣️ **Roads and Potholes Guide**\n\nTo report damaged roads or potholes causing traffic issues:\n1. Open the **Report an Issue** tab.\n2. Select 'Roads & Potholes' category.\n3. Describe the exact spot and drag/drop an issue picture.\n\n**Resolution Timeline:** Main roads are repaired within 7 days, internal ward roads within 15 days.`;
  }
  
  if (q.includes('garbage') || q.includes('sanitation') || q.includes('कचरा') || q.includes('सफाई')) {
    if (lang === 'hi') {
      return `🧹 **कचरा और स्वच्छता शिकायत**\n\nयदि आपके क्षेत्र में नियमित रूप से कचरा नहीं उठाया जा रहा है:\n1. **शिकायत दर्ज करें** टैब में 'कचरा और स्वच्छता' चुनें।\n2. स्थान दर्ज करें और विवरण दें।\n\n**समय सीमा:** कचरा संग्रहण में सुधार 24 घंटे के भीतर किया जाना चाहिए।`;
    }
    return `🧹 **Garbage & Sanitation Grievance**\n\nIf waste collection in your neighborhood is irregular or garbage is piling up:\n1. Select 'Garbage & Sanitation' in the **Report an Issue** tab.\n2. Provide coordinates or landmark details.\n\n**Expected Timeline:** Cleared within 24 hours of registration.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('नमस्ते') || q.includes('hey') || q.includes('pranam')) {
    if (lang === 'hi') {
      return `नमस्ते! मैं आपका **सहायक AI** नागरिक साथी हूँ।\n\nमैं निम्नलिखित में आपकी सहायता कर सकता हूँ:\n- **सरकारी योजनाएं और प्रमाण पत्र** (आधार, पैन, पासपोर्ट, राशन कार्ड, वोटर आईडी, आय प्रमाण पत्र) की आवेदन प्रक्रिया और आवश्यक दस्तावेज।\n- **नागरिक शिकायतें** (स्ट्रीटलाइट, सड़क, पानी, सफाई) दर्ज करने की गाइड।\n\nकृपया अपना प्रश्न लिखें (उदा: *"नया पासपोर्ट कैसे बनवाएं?"*) या नीचे दिए गए त्वरित बटनों पर क्लिक करें।`;
    }
    return `Hello! I am your **Sahayak AI** civic companion.\n\nI can assist you with:\n- **Government Schemes & Certifications** (Aadhaar, PAN, Passport, Ration Card, Voter ID, Income Certificate) application steps and document checklists.\n- Filing and tracking **Local Civic Complaints** (Streetlights, Potholes, Garbage, Water leakage).\n\nPlease type your query (e.g., *"How do I apply for Aadhaar?"*) or select one of the suggestion chips below.`;
  }

  // Fallback general response
  if (lang === 'hi') {
    return `मैं आपके प्रश्न *"#{query}"* को समझ रहा हूँ, लेकिन मेरे स्थानीय भंडार में इसका सटीक मिलान नहीं है।\n\n**आप मुझसे इन विषयों पर पूछ सकते हैं:**\n1. नया आधार / पैन / वोटर आईडी / पासपोर्ट कैसे प्राप्त करें?\n2. राशन कार्ड और आय प्रमाण पत्र की पात्रता।\n3. टूटी सड़क, कचरा या खराब लाइट की शिकायत दर्ज करने की प्रक्रिया।\n\n*युक्ति: यदि आप अधिक लाइव उत्तर चाहते हैं, तो कृपया सेटिंग्स में जाकर अपनी **Gemini API Key** दर्ज करें।*`;
  }
  return `I understand you are asking about *"#${query}"*, but my local knowledge base doesn't have a specific match.\n\n**Try asking about:**\n1. How to get a new Aadhaar, PAN, Voter ID, or Passport?\n2. Document requirements for Ration Card or Income Certificate.\n3. Resolution timelines for local streetlights or garbage clearance.\n\n*Tip: To get dynamically generated real-time answers, please open **AI Config** in the bottom sidebar and save your **Gemini API Key**.*`;
}

function generateStructuredServiceText(t, lang) {
  const stepLabel = lang === 'hi' ? 'आवेदन चरण (Application Steps)' : 'Step-by-Step Guide';
  const docLabel = lang === 'hi' ? 'आवश्यक दस्तावेज़ (Required Documents)' : 'Mandatory Document Checklist';
  const timelineLabel = lang === 'hi' ? 'अनुमानित समय (Timeline)' : 'Estimated Timeline';
  const officeLabel = lang === 'hi' ? 'प्रशासनिक कार्यालय (Where to Apply)' : 'Authorized Office';
  
  return `🏛️ **${t.name}**\n\n*${t.desc}*\n\n🔹 **${stepLabel}:**\n${t.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\n📋 **${docLabel}:**\n${t.docs.map(d => `- ${d}`).join('\n')}\n\n⏳ **${timelineLabel}:** ${t.timeline}\n🏢 **${officeLabel}:** ${t.office}`;
}

// ----------------------------------------------------
// INITIALIZATION & EVENT BINDINGS
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Load complaints from localStorage or initialize with defaults
  const stored = localStorage.getItem('sb_complaints');
  if (stored) {
    try {
      state.complaints = JSON.parse(stored);
    } catch(e) {
      state.complaints = [...OFFLINE_COMPLAINTS];
    }
  } else {
    state.complaints = [...OFFLINE_COMPLAINTS];
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));
  }

  initAccessibility();
  applyLang();
  initNavigation();
  initSettingsModal();
  initChat();
  initReportForm();
  initTracker();
  initServicesDirectory();
  initDocHelper();
  initFooterLinks();
  
  // Render map on startup
  renderWardMap();

  // KIOSK MODE SECURITY TIMERS & STORAGE HOOKS
  window.addEventListener('beforeunload', () => {
    if (state.kioskMode) {
      localStorage.removeItem('sb_gemini_api_key');
    }
  });

  // Track interactions for 5-minute inactivity auto-clear
  const resetInteractionTimer = () => {
    state.lastInteractionTime = Date.now();
  };
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, resetInteractionTimer, { passive: true });
  });

  // Check inactivity every 10 seconds
  setInterval(() => {
    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes
    if (state.kioskMode && (Date.now() - state.lastInteractionTime > INACTIVITY_LIMIT)) {
      localStorage.removeItem('sb_gemini_api_key');
      alert(state.currentLang === 'hi'
        ? "⚠️ किओस्क सत्र समय सीमा समाप्त: सुरक्षा कारणों से आपकी जेमिनी एपीआई कुंजी को हटा दिया गया है।"
        : "⚠️ Kiosk Session Timeout: You have been inactive for 5 minutes. For security, your Gemini API Key has been wiped from this kiosk.");
      window.location.reload();
    }
  }, 10000);
});

// ----------------------------------------------------
// THEME & STYLES SYSTEM
// ----------------------------------------------------
/* Theme manager removed */

function initAccessibility() {
  const incBtn = document.getElementById('fontIncBtn');
  const resetBtn = document.getElementById('fontResetBtn');
  const decBtn = document.getElementById('fontDecBtn');

  if (!state.fontSizeScale) {
    state.fontSizeScale = 100;
  }

  const updateFontSize = () => {
    document.documentElement.style.setProperty('--font-scale', state.fontSizeScale / 100);
  };

  incBtn.addEventListener('click', () => {
    if (state.fontSizeScale < 130) {
      state.fontSizeScale += 10;
      updateFontSize();
    }
  });

  decBtn.addEventListener('click', () => {
    if (state.fontSizeScale > 85) {
      state.fontSizeScale -= 10;
      updateFontSize();
    }
  });

  resetBtn.addEventListener('click', () => {
    state.fontSizeScale = 100;
    updateFontSize();
  });
}

// ----------------------------------------------------
// LOCALIZATION MANAGER
// ----------------------------------------------------
function applyLang() {
  const d = DICT[state.currentLang];
  
  // Brand details
  document.getElementById('brandSub').textContent = d.brandSub;
  
  // Sidebar Nav Links
  document.getElementById('nav-home').textContent = d.navhome;
  document.getElementById('nav-assistant').textContent = d.navassistant;
  document.getElementById('nav-report').textContent = d.navreport;
  document.getElementById('nav-track').textContent = d.navtrack;
  document.getElementById('nav-services').textContent = d.navservices;
  document.getElementById('nav-docs').textContent = d.navdocs;
  
  // Language Sidebar Header
  document.getElementById('langLabel').textContent = d.langLabel;
  
  // Settings UI
  document.getElementById('settingsText').textContent = d.settingsText;
  
  // Home panel
  document.getElementById('heroTitle').textContent = d.heroTitle;
  document.getElementById('heroSub').textContent = d.heroSub;
  document.getElementById('statOpenLabel').textContent = d.statOpenLabel;
  document.getElementById('statResolvedLabel').textContent = d.statResolvedLabel;
  document.getElementById('statAvail').textContent = d.statAvail;
  document.getElementById('quickActionsLabel').textContent = d.quickActionsLabel;
  document.getElementById('qa1h').textContent = d.qa1h;
  document.getElementById('qa1p').textContent = d.qa1p;
  document.getElementById('qa2h').textContent = d.qa2h;
  document.getElementById('qa2p').textContent = d.qa2p;
  document.getElementById('qa3h').textContent = d.qa3h;
  document.getElementById('qa3p').textContent = d.qa3p;
  document.getElementById('popularLabel').textContent = d.popularLabel;
  document.getElementById('alertsLabel').textContent = d.alertsLabel;
  document.getElementById('alertTitle').textContent = d.alertTitle;
  document.getElementById('alertDesc').textContent = d.alertDesc;

  // Assistant panel
  document.getElementById('asstEyebrow').textContent = d.asstEyebrow;
  document.getElementById('asstTitle').textContent = d.asstTitle;
  document.getElementById('asstSub').textContent = d.asstSub;
  document.getElementById('chatInput').placeholder = d.chatPlaceholder;
  document.getElementById('chatSendText').textContent = d.chatSend.replace(' ➔','');
  document.getElementById('asstStatusLabel').textContent = d.asstStatusLabel;

  // Report panel
  document.getElementById('reportEyebrow').textContent = d.reportEyebrow;
  document.getElementById('reportTitle').textContent = d.reportTitle;
  document.getElementById('reportSub').textContent = d.reportSub;
  document.getElementById('lblCategory').textContent = d.lblCategory;
  document.getElementById('lblLocation').textContent = d.lblLocation;
  document.getElementById('lblDesc').textContent = d.lblDesc;
  document.getElementById('lblName').textContent = d.lblName;
  document.getElementById('lblPhone').textContent = d.lblPhone;
  document.getElementById('submitReport').textContent = d.submitBtn;
  document.getElementById('lblMapMarker').textContent = d.lblMapMarker;
  document.getElementById('mapLabelText').textContent = d.mapLabelText;
  document.getElementById('legPending').textContent = d.legPending;
  document.getElementById('legProgress').textContent = d.legProgress;
  document.getElementById('legResolved').textContent = d.legResolved;
  document.getElementById('lblImage').textContent = d.lblImage;
  document.getElementById('uploadTextLabel').textContent = d.uploadTextLabel;

  // Confirmation panel
  document.getElementById('stampText').textContent = state.currentLang === 'hi' ? 'दर्ज हुआ' : 'Submitted';
  document.getElementById('fileNoLabel').textContent = d.fileNoLabel;
  document.getElementById('confirmMsg').textContent = d.confirmMsg;
  document.getElementById('fileAnother').textContent = d.fileAnother;

  // Tracker panel
  document.getElementById('trackEyebrow').textContent = d.trackEyebrow;
  document.getElementById('trackTitle').textContent = d.trackTitle;
  document.getElementById('trackSub').textContent = d.trackSub;
  document.getElementById('trackSearch').placeholder = d.trackSearch;
  document.getElementById('trackSearchBtn').textContent = d.trackSearchBtn;
  
  // Timeline inner panel
  document.getElementById('lblTimelineLog').textContent = d.lblTimelineLog;
  document.getElementById('lblTimelinePhoto').textContent = d.lblTimelinePhoto;
  document.getElementById('stepTitle1').textContent = d.stepTitle1;
  document.getElementById('stepTitle2').textContent = d.stepTitle2;
  document.getElementById('stepTitle3').textContent = d.stepTitle3;
  document.getElementById('stepTitle4').textContent = d.stepTitle4;

  // Directory panel
  document.getElementById('svcEyebrow').textContent = d.svcEyebrow;
  document.getElementById('svcTitle').textContent = d.svcTitle;
  document.getElementById('svcSub').textContent = d.svcSub;

  // Docs panel
  document.getElementById('docEyebrow').textContent = d.docEyebrow;
  document.getElementById('docTitle').textContent = d.docTitle;
  document.getElementById('docSub').textContent = d.docSub;
  document.getElementById('lblDocGoal').textContent = d.lblDocGoal;
  document.getElementById('docGoal').placeholder = d.docGoalPlaceholder;
  document.getElementById('docSubmit').textContent = d.docSubmit;

  // Modal Settings
  document.getElementById('modalConfigTitle').textContent = d.modalConfigTitle;
  document.getElementById('modalConfigDesc').textContent = d.modalConfigDesc;
  document.getElementById('lblConfigKey').textContent = d.lblConfigKey;
  document.getElementById('lblConfigModel').textContent = d.lblConfigModel;
  document.getElementById('btnCancelSettings').textContent = d.btnCancelSettings;
  document.getElementById('btnSaveSettings').textContent = d.btnSaveSettings;

  // Accessibility & Analytics localization bindings
  document.getElementById('accessibilityLabel').textContent = d.accessibilityLabel;
  document.getElementById('analyticsLabel').textContent = d.analyticsLabel;
  document.getElementById('lblResolutionRate').textContent = state.currentLang === 'hi' ? '87.4%' : '87.4%';
  document.getElementById('lblResRateLabel').textContent = d.lblResolutionRate;
  document.getElementById('lblAvgTimeLabel').textContent = d.lblAvgTimeLabel;
  document.getElementById('lblActiveCrewsLabel').textContent = d.lblActiveCrewsLabel;
  document.getElementById('suggestedCategoryLabel').textContent = d.suggestedCategoryLabel;
  document.getElementById('lblFeedbackTitle').textContent = d.lblFeedbackTitle;
  document.getElementById('lblEscalateWarn').textContent = d.lblEscalateWarn;
  document.getElementById('btnEscalateGrievance').textContent = d.btnEscalateGrievance;

  // Footer localized bindings
  document.getElementById('footerTitle').textContent = d.footerTitle;
  document.getElementById('footerDesc').textContent = d.footerDesc;
  document.getElementById('footerLabelInfo').textContent = d.footerLabelInfo;
  document.getElementById('footerLabelSupport').textContent = d.footerLabelSupport;
  document.getElementById('footerLabelGov').textContent = d.footerLabelGov;
  document.getElementById('footerCopyright').textContent = d.footerCopyright;

  document.getElementById('footerLinkAbout').textContent = state.currentLang === 'hi' ? 'हमारे बारे में' : 'About Us';
  document.getElementById('footerLinkContact').textContent = state.currentLang === 'hi' ? 'संपर्क करें' : 'Contact Us';
  document.getElementById('footerLinkFeedback').textContent = state.currentLang === 'hi' ? 'प्रतिक्रिया' : 'Feedback';
  document.getElementById('footerLinkFaqs').textContent = state.currentLang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'FAQs';
  document.getElementById('footerLinkHelp').textContent = state.currentLang === 'hi' ? 'सहायता एवं दिशा-निर्देश' : 'Help & Guidelines';

  // Map render and chips update
  renderPopularGrid();
  renderServicesGrid();
  renderTrackList();
  renderSuggestChips();
}

document.getElementById('btn-en').onclick = () => {
  state.currentLang = 'en';
  document.getElementById('btn-en').classList.add('active');
  document.getElementById('btn-hi').classList.remove('active');
  applyLang();
};

document.getElementById('btn-hi').onclick = () => {
  state.currentLang = 'hi';
  document.getElementById('btn-hi').classList.add('active');
  document.getElementById('btn-en').classList.remove('active');
  applyLang();
};

// ----------------------------------------------------
// INTERATIVE ROUTING & VIEW CONTROLLER
// ----------------------------------------------------
function initNavigation() {
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      goto(item.dataset.view);
    });
  });

  // Intercept links inside page views that trigger redirect navigation
  document.addEventListener('click', e => {
    const gotoEl = e.target.closest('[data-goto]');
    if (gotoEl) {
      goto(gotoEl.dataset.goto);
    }
  });
}

function goto(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === viewName);
  });
  document.querySelectorAll('.view').forEach(el => {
    el.classList.toggle('active', el.id === 'view-' + viewName);
  });
  
  if (viewName === 'track' || viewName === 'report') {
    // Redraw map canvases when views become visible
    setTimeout(renderWardMap, 50);
  }
}

// ----------------------------------------------------
// AI CONFIGURATION SETTINGS MODAL
// ----------------------------------------------------
const MOCK_GRIEVANCES = [
  {
    id: "GR-9081",
    title: "Severe Water Supply Leakage",
    desc: "A major pipeline burst near the community temple. Water has been flooding the street since yesterday morning.",
    category: "water",
    ward: "Ward 4 (Kalyan Nagar)",
    coords: { x: 120, y: 190 },
    reporter: "Rajesh Kumar",
    phone: "9876543210",
    status: "resolved",
    timestamp: new Date(Date.now() - 172800000).toLocaleString(),
    imageUrl: "",
    timeline: [
      { step: "submitted", label: "Grievance Logged", time: new Date(Date.now() - 172800000).toLocaleString(), desc: "Citizen Rajesh Kumar reported water leakage.", active: true },
      { step: "allocated", label: "Officer Appointed", time: new Date(Date.now() - 150000000).toLocaleString(), desc: "Assigned to Ward Engineer S. Patil.", active: true },
      { step: "progress", label: "Repair Underway", time: new Date(Date.now() - 86400000).toLocaleString(), desc: "Plumbing crew dispatched. Main valve closed.", active: true },
      { step: "resolved", label: "Case Resolved", time: new Date(Date.now() - 43200000).toLocaleString(), desc: "Pipeline patch completed and tested.", active: true }
    ],
    rating: 5,
    escalated: false
  },
  {
    id: "GR-8932",
    title: "Broken Streetlight near School",
    desc: "The streetlight right outside Govt High School is broken. It is pitch dark at night, making it unsafe for kids.",
    category: "streetlight",
    ward: "Ward 9 (Rajajinagar)",
    coords: { x: 310, y: 220 },
    reporter: "Sunita Deshmukh",
    phone: "9911223344",
    status: "progress",
    timestamp: new Date(Date.now() - 86400000).toLocaleString(),
    imageUrl: "",
    timeline: [
      { step: "submitted", label: "Grievance Logged", time: new Date(Date.now() - 86400000).toLocaleString(), desc: "Citizen Sunita logged streetlight failure.", active: true },
      { step: "allocated", label: "Officer Appointed", time: new Date(Date.now() - 50000000).toLocaleString(), desc: "Assigned to Electrical Inspector Amit Roy.", active: true },
      { step: "progress", label: "Repair Underway", time: new Date(Date.now() - 20000000).toLocaleString(), desc: "Replacement bulb and wiring check scheduled.", active: true },
      { step: "resolved", label: "Case Resolved", time: "", desc: "Pending field verification.", active: false }
    ],
    rating: null,
    escalated: false
  },
  {
    id: "GR-7762",
    title: "Clogged Drain Overflows on Road",
    desc: "Heavy rain has caused the main storm drain to overflow. Wastewater is spilling into the marketplace causing foul smell.",
    category: "garbage",
    ward: "Ward 12 (Metro Bazaar)",
    coords: { x: 420, y: 150 },
    reporter: "Anwar Shaikh",
    phone: "9822334455",
    status: "resolved",
    timestamp: new Date(Date.now() - 259200000).toLocaleString(),
    imageUrl: "",
    timeline: [
      { step: "submitted", label: "Grievance Logged", time: new Date(Date.now() - 259200000).toLocaleString(), desc: "Reported drainage clogging in bazaar.", active: true },
      { step: "allocated", label: "Officer Appointed", time: new Date(Date.now() - 200000000).toLocaleString(), desc: "Assigned to Sanitation Inspector Meena Rao.", active: true },
      { step: "progress", label: "Repair Underway", time: new Date(Date.now() - 172800000).toLocaleString(), desc: "Cleaning crews cleared silt blockages.", active: true },
      { step: "resolved", label: "Case Resolved", time: new Date(Date.now() - 86400000).toLocaleString(), desc: "Silt cleared. Water flow normalized.", active: true }
    ],
    rating: 2,
    escalated: true,
    escalationTimeline: {
      timestamp: new Date(Date.now() - 72000000).toLocaleString(),
      reason: "Satisfaction rating of 2 stars submitted. Escalated to Commissioner Auditor Board.",
      auditor: "Nodal Supervisor (Board 3)"
    }
  }
];

function initSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsModal');
  const cancelBtn = document.getElementById('btnCancelSettings');
  const saveBtn = document.getElementById('btnSaveSettings');
  const keyInput = document.getElementById('geminiApiKeyInput');
  const modelSelect = document.getElementById('geminiApiModel');
  const kioskChk = document.getElementById('chkKioskMode');
  
  // Visibility toggle handler
  const toggleVisibleBtn = document.getElementById('toggleApiKeyVisibility');
  toggleVisibleBtn.addEventListener('click', () => {
    if (keyInput.type === 'password') {
      keyInput.type = 'text';
      toggleVisibleBtn.textContent = '🔒';
    } else {
      keyInput.type = 'password';
      toggleVisibleBtn.textContent = '👁️';
    }
  });

  openBtn.addEventListener('click', () => {
    keyInput.value = state.apiKey;
    modelSelect.value = state.apiModel;
    kioskChk.checked = state.kioskMode;
    modal.classList.add('active');
  });

  const closeModal = () => modal.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  saveBtn.addEventListener('click', () => {
    state.apiKey = keyInput.value.trim();
    state.apiModel = modelSelect.value;
    state.kioskMode = kioskChk.checked;
    
    localStorage.setItem('sb_gemini_api_key', state.apiKey);
    localStorage.setItem('sb_gemini_api_model', state.apiModel);
    localStorage.setItem('sb_kiosk_mode', state.kioskMode);
    
    closeModal();
    
    // Add success chat bubble if Assistant is active
    if (state.activeView === 'assistant') {
      addMessage(state.currentLang === 'hi' 
        ? "AI इंजन सेटिंग्स सफलतापूर्वक अपडेट हो गई हैं! लाइव मॉडल अब उपलब्ध है।" 
        : "AI configuration saved successfully! The live model is now loaded.", 'bot');
    }
  });

  // Diagnostic connection validator
  const testBtn = document.getElementById('btnTestConfig');
  testBtn.addEventListener('click', async () => {
    const key = keyInput.value.trim();
    const model = modelSelect.value;
    if (!key) {
      alert("Please enter an API Key to test.");
      return;
    }
    
    testBtn.textContent = "⏳ Testing...";
    testBtn.disabled = true;
    
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with exactly "OK"' }] }]
        })
      });
      
      if (res.ok) {
        testBtn.textContent = "✓ Connected!";
        testBtn.style.color = "#0B6E4F";
        testBtn.style.borderColor = "#0B6E4F";
        alert("✓ Connection successful! Your Gemini API Key is fully active.");
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
    } catch (e) {
      testBtn.textContent = "✗ Failed";
      testBtn.style.color = "#d93838";
      testBtn.style.borderColor = "#d93838";
      alert(`✗ Connection failed: ${e.message}`);
    } finally {
      setTimeout(() => {
        testBtn.textContent = "⚡ Test Connection";
        testBtn.style.color = "";
        testBtn.style.borderColor = "";
        testBtn.disabled = false;
      }, 3000);
    }
  });

  // Load Demo Data
  const demoBtn = document.getElementById('btnLoadDemoData');
  demoBtn.addEventListener('click', () => {
    state.complaints = [...MOCK_GRIEVANCES, ...state.complaints.filter(c => !c.id.startsWith('GR-'))];
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));
    
    // Refresh views if methods are loaded
    if (typeof renderComplaints === 'function') renderComplaints();
    if (typeof renderWardMap === 'function') renderWardMap();
    if (typeof updateDashboardMetrics === 'function') updateDashboardMetrics();
    
    alert("🚀 Demo grievances loaded successfully! Go to 'Track Grievance' to test timeline steps and satisfaction ratings.");
    closeModal();
  });

  // Wipe Storage
  const wipeBtn = document.getElementById('btnWipeStorage');
  wipeBtn.addEventListener('click', () => {
    if (confirm("⚠️ Are you sure you want to wipe all local data? This will clear your saved API Key, all complaints, and configuration settings.")) {
      localStorage.clear();
      alert("🗑️ Local cache cleared successfully. Reloading...");
      window.location.reload();
    }
  });
}

// ----------------------------------------------------
// CHAT & SAHAYAK AI ENGINE
// ----------------------------------------------------
const SUGGESTIONS = {
  en: [
    "How to apply for a fresh passport?",
    "Documents required for Aadhaar update?",
    "How do I file a pothole grievance?",
    "Check PM-Awas eligibility rules"
  ],
  hi: [
    "नया पासपोर्ट कैसे बनवाएं?",
    "आधार अपडेट के लिए आवश्यक दस्तावेज़?",
    "सड़क के गड्ढे की शिकायत कैसे दर्ज करें?",
    "PM-आवास योजना के लिए पात्रता नियम"
  ]
};

let synthesisUtterance = null;

function initChat() {
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const speechBtn = document.getElementById('speechBtn');
  const muteBtn = document.getElementById('muteToggleBtn');
  const muteText = document.getElementById('muteStatusText');

  chatSend.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSendMessage();
  });

  // Set default initial greeting if chat is empty
  const log = document.getElementById('chatLog');
  if (log.children.length === 0) {
    const defaultGreeting = state.currentLang === 'hi'
      ? "नमस्ते! मैं आपका सहायक AI नागरिक साथी हूँ। आप मुझसे सरकारी योजनाओं, आवेदन प्रक्रियाओं या स्थानीय शिकायतों के निवारण के बारे में पूछ सकते हैं।"
      : "Namaste! I am your Sahayak AI civic companion. You can ask me about government welfare schemes, documentation requirements, or guidelines for reporting street issues.";
    addMessage(defaultGreeting, 'bot');
  }

  // Speak Synthesis Toggler
  muteBtn.addEventListener('click', () => {
    state.ttsEnabled = !state.ttsEnabled;
    const d = DICT[state.currentLang];
    
    if (state.ttsEnabled) {
      muteBtn.querySelector('span').textContent = '🔊';
      muteText.textContent = d.muteStatusOn || 'TTS Enabled';
    } else {
      window.speechSynthesis.cancel();
      muteBtn.querySelector('span').textContent = '🔇';
      muteText.textContent = d.muteStatusOff || 'TTS Muted';
    }
  });

  // Speech Recognition (Speech to Text)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    speechBtn.addEventListener('click', () => {
      if (speechBtn.classList.contains('listening')) {
        recognition.stop();
      } else {
        recognition.lang = state.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        speechBtn.classList.add('listening');
        recognition.start();
      }
    });

    recognition.onresult = e => {
      const resultText = e.results[0][0].transcript;
      chatInput.value = resultText;
    };

    recognition.onend = () => {
      speechBtn.classList.remove('listening');
    };

    recognition.onerror = () => {
      speechBtn.classList.remove('listening');
    };
  } else {
    // Hide speech recognition button if not supported in the browser
    speechBtn.style.display = 'none';
  }
}

function renderSuggestChips() {
  const row = document.getElementById('suggestRow');
  const items = SUGGESTIONS[state.currentLang] || SUGGESTIONS['en'];
  
  row.innerHTML = items.map(s => `<div class="suggest-chip">${s}</div>`).join('');
  row.querySelectorAll('.suggest-chip').forEach(chip => {
    chip.onclick = () => {
      document.getElementById('chatInput').value = chip.textContent;
      handleSendMessage();
    };
  });
}

function addMessage(text, role) {
  const log = document.getElementById('chatLog');
  
  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${role}`;

  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  
  // Format markdown lists and bold elements basic formatting
  if (role === 'bot') {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      // Clean up adjacent ul tags
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>')
      .replace(/<\/ol>\s*<ol>/g, '')
      .replace(/\n/g, '<br>');
    
    msg.innerHTML = html;
  } else {
    msg.textContent = text;
  }

  wrapper.appendChild(msg);

  // Meta row containing Timestamp and Speech reader
  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.innerHTML = `<span>${time}</span>`;
  
  if (role === 'bot') {
    const speakBtn = document.createElement('button');
    speakBtn.className = 'msg-speak-btn';
    speakBtn.innerHTML = '🗣️ Listen';
    speakBtn.addEventListener('click', () => {
      speakAloud(text);
    });
    meta.appendChild(speakBtn);
  }

  wrapper.appendChild(meta);
  log.appendChild(wrapper);
  log.scrollTop = log.scrollHeight;

  // Speak aloud if TTS is enabled for incoming bot messages
  if (role === 'bot' && state.ttsEnabled) {
    speakAloud(text);
  }

  return wrapper;
}

function speakAloud(text) {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel(); // Terminate existing speeches
  
  // Strip out markdown patterns for speech readability
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/[-*#]/g, '')
    .replace(/\d+\./g, '');

  synthesisUtterance = new SpeechSynthesisUtterance(cleanText);
  synthesisUtterance.lang = state.currentLang === 'hi' ? 'hi-IN' : 'en-US';
  
  // Set voice options
  const voices = window.speechSynthesis.getVoices();
  const langMatch = state.currentLang === 'hi' ? 'hi-IN' : 'en';
  const matchingVoice = voices.find(v => v.lang.includes(langMatch));
  if (matchingVoice) {
    synthesisUtterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(synthesisUtterance);
}

async function handleSendMessage() {
  const now = Date.now();
  if (now - state.lastMessageSentTime < 2000) {
    alert(state.currentLang === 'hi'
      ? "⚠️ सुरक्षा गार्ड: स्पैम रोकने के लिए कृपया संदेशों के बीच कम से कम 2 सेकंड प्रतीक्षा करें।"
      : "⚠️ Security Guard: Please wait at least 2 seconds between messages to prevent request spam.");
    return;
  }
  state.lastMessageSentTime = now;

  const input = document.getElementById('chatInput');
  const query = input.value.trim();
  if (!query) return;

  input.value = '';
  addMessage(query, 'user');

  const sendBtn = document.getElementById('chatSend');
  sendBtn.disabled = true;
  
  // Add loading placeholder
  const loadingLog = document.getElementById('chatLog');
  const loadingWrap = document.createElement('div');
  loadingWrap.className = 'msg-wrapper bot';
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'msg bot loading';
  loadingMsg.innerHTML = `<span class="spinner"></span> <span>Sahayak is thinking...</span>`;
  loadingWrap.appendChild(loadingMsg);
  loadingLog.appendChild(loadingWrap);
  loadingLog.scrollTop = loadingLog.scrollHeight;

  try {
    let reply = '';
    if (state.apiKey) {
      // LIVE GENAI GEMINI DIRECT REST API CALL (Bypasses custom header stripping issues in Brave)
      const systemPrompt = `You are Sahayak, a helpful civic companion on the Smart Bharat platform.
      Rules:
      - Answer citizen questions about Indian government services (Aadhaar, PAN, Passport, Ration, Voter ID, Welfare Schemes, Municipal grievances, certificates).
      - Maintain standard administrative vocabulary. List clear application procedures, timelines, fees and essential document requirements.
      - The citizen's active portal language is currently: ${state.currentLang === 'hi' ? 'Hindi (हिंदी)' : 'English'}. You MUST formulate your entire response in ${state.currentLang === 'hi' ? 'Hindi (हिंदी)' : 'English'} only.
      - Give structured answers using lists and bold tags. Be direct and avoid technical legalese.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${state.apiModel}:generateContent?key=${state.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Question: ${query}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        let errMsg = `HTTP error ${response.status}`;
        try {
          const errJson = await response.json();
          errMsg = errJson.error?.message || errMsg;
        } catch (e) {}
        
        // Dynamically query available models using the key for direct client-side diagnostics
        let listStr = "";
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${state.apiKey}`);
          if (listRes.ok) {
            const listJson = await listRes.json();
            const models = listJson.models || [];
            listStr = "\n\n📋 **Permitted models for your API Key:**\n" + models.map(m => `- \`${m.name.replace('models/', '')}\``).join('\n');
          } else {
            listStr = `\n\n❌ **ModelService.ListModels failed**: Status ${listRes.status}`;
          }
        } catch (le) {
          listStr = `\n\n❌ **ModelService.ListModels failure**: ${le.message}`;
        }

        throw new Error(errMsg + listStr);
      }

      const resData = await response.json();
      reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!reply) {
        throw new Error("Empty response received from AI engine.");
      }
    } else {
      // HIGH-FIDELITY OFFLINE LOCAL NLP SIMULATION
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulated network latency
      reply = getLocalNLPResponse(query, state.currentLang);
    }
    
    loadingWrap.remove();
    addMessage(reply, 'bot');
  } catch (error) {
    console.error("AI engine failure:", error);
    loadingWrap.remove();
    const errorDetails = error.message || error.toString();
    
    let advice = "";
    if (errorDetails.toLowerCase().includes("quota") || errorDetails.includes("429")) {
      advice = state.currentLang === 'hi'
        ? "\n\n💡 **सलाह:** ऐसा लगता है कि इस मॉडल के लिए मुफ़्त कोटा समाप्त या ब्लॉक हो गया है। कृपया शीर्ष बार पर **AI Config** पर क्लिक करें और **Gemini 1.5 Flash** मॉडल चुनें।"
        : "\n\n💡 **Tip:** It looks like you have hit the free tier quota limit for this model. Please open **AI Config** at the top and switch the model version to **Gemini 1.5 Flash (Recommended)**.";
    }

    const errorMsg = state.currentLang === 'hi'
      ? `एआई इंजन विफलता: ${errorDetails}${advice}\n\nकृपया जांचें कि आपकी API Key मान्य है या सिम्युलेटर का उपयोग करने के लिए इसे सेटिंग्स में हटा दें।`
      : `AI Engine Failure: ${errorDetails}${advice}\n\nPlease verify that your API Key is valid or clear it from the AI Config settings to use local offline simulation.`;
    addMessage(errorMsg, 'bot');
  } finally {
    sendBtn.disabled = false;
  }
}

// ----------------------------------------------------
// PUBLIC GRIEVANCE (REPORT AN ISSUE) MODULE
// ----------------------------------------------------
function initReportForm() {
  const submitBtn = document.getElementById('submitReport');
  const geolocateBtn = document.getElementById('geolocateBtn');
  const formWrap = document.getElementById('reportFormWrap');
  const confirmWrap = document.getElementById('reportConfirmWrap');
  const uploadArea = document.getElementById('imageUploadArea');
  const fileInput = document.getElementById('imageFileInput');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewThumb = document.getElementById('imagePreviewThumb');
  const previewName = document.getElementById('imagePreviewName');
  const removeBtn = document.getElementById('imageRemoveBtn');
  const downloadBtn = document.getElementById('downloadReceiptBtn');
  
  let uploadedImageBase64 = '';

  // Canvas Ward map integration
  const canvas = document.getElementById('wardMap');
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    state.selectedCoords = { x, y };
    
    document.getElementById('mapCoords').textContent = `X: ${x}, Y: ${y}`;
    renderWardMap();
  });

  // Geolocation button
  geolocateBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      geolocateBtn.textContent = '⏳';
      navigator.geolocation.getCurrentPosition(
        pos => {
          geolocateBtn.textContent = '📍';
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          document.getElementById('fLocation').value = `GPS (${lat}, ${lon}) - Near Ward Center`;
          
          // Randomly plot inside the map coordinates
          state.selectedCoords = {
            x: Math.floor(50 + Math.random() * 200),
            y: Math.floor(50 + Math.random() * 120)
          };
          renderWardMap();
        },
        err => {
          geolocateBtn.textContent = '📍';
          alert(state.currentLang === 'hi' ? "सटीक स्थान प्राप्त नहीं किया जा सका।" : "Unable to acquire current location.");
        }
      );
    }
  });

  // Image upload triggers
  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleImageFile(fileInput.files[0]);
    }
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      uploadedImageBase64 = e.target.result;
      previewThumb.src = uploadedImageBase64;
      previewName.textContent = file.name;
      previewContainer.style.display = 'block';
      uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener('click', () => {
    uploadedImageBase64 = '';
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
  });

  // Form Submission
  submitBtn.addEventListener('click', async () => {
    const category = document.getElementById('fCategory').value;
    const location = document.getElementById('fLocation').value.trim();
    const desc = document.getElementById('fDesc').value.trim();
    const name = document.getElementById('fName').value.trim();
    const phone = document.getElementById('fPhone').value.trim();

    if (!location || !desc) {
      alert(state.currentLang === 'hi' 
        ? "कृपया पते का विवरण और समस्या का विवरण अवश्य भरें।" 
        : "Please fill in both Location and Problem description fields.");
      return;
    }

    submitBtn.disabled = true;
    
    const id = `SB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newGrievance = {
      fileNo: id,
      category,
      location,
      desc,
      name: name || 'Anonymous Citizen',
      phone: phone || '-',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      coords: { ...state.selectedCoords },
      photo: uploadedImageBase64,
      history: [
        { 
          status: 'submitted', 
          date: new Date().toISOString(), 
          desc: state.currentLang === 'hi' 
            ? 'शिकायत सर्वर में दर्ज हुई। विवरणों की जांच की जा रही है।' 
            : 'Grievance entered into server databases. Forwarded to Ward inspector desk.' 
        }
      ]
    };

    state.complaints.unshift(newGrievance);
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));

    // Update UI Stats
    updateHomeCounters();

    // Trigger confirmation layout
    formWrap.style.display = 'none';
    confirmWrap.style.display = 'block';
    document.getElementById('fileNoValue').textContent = id;
    
    // Refresh visual stamp trigger animation
    const stampText = document.getElementById('stampText');
    stampText.style.animation = 'none';
    void stampText.offsetWidth; // Trigger reflow
    stampText.style.animation = null;

    // Save active tracking code to state
    state.selectedComplaintId = id;

    // Reset Form Fields
    document.getElementById('fLocation').value = '';
    document.getElementById('fDesc').value = '';
    document.getElementById('fName').value = '';
    document.getElementById('fPhone').value = '';
    uploadedImageBase64 = '';
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
    submitBtn.disabled = false;

    // Refresh directory lists
    renderTrackList();
    renderWardMap();
  });

  // Receipt Download
  downloadBtn.addEventListener('click', () => {
    const active = state.complaints.find(c => c.fileNo === state.selectedComplaintId);
    if (!active) return;

    const receiptText = `
--------------------------------------------------
           SMART BHARAT CIVIC REGISTRY
           OFFICIAL GRIEVANCE RECEIPT
--------------------------------------------------
File Number    : ${active.fileNo}
Category       : ${active.category}
Date Registered: ${new Date(active.createdAt).toLocaleString()}
Location       : ${active.location}
Description    : ${active.desc}
Filer Name     : ${active.name}
Filer Phone    : ${active.phone}
Coordinates    : X: ${active.coords.x}, Y: ${active.coords.y}
Status         : ${active.status.toUpperCase()}
--------------------------------------------------
This document serves as verification of filing. 
Check progress in "Track Complaints" using the ID.
--------------------------------------------------
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${active.fileNo}.txt`;
    link.click();
  });

  document.getElementById('fileAnother').addEventListener('click', () => {
    formWrap.style.display = 'block';
    confirmWrap.style.display = 'none';
  });

  // AI Auto-Categorizer based on description keyword matching
  const descTextarea = document.getElementById('fDesc');
  const categorySelect = document.getElementById('fCategory');
  const aiSuggestionContainer = document.getElementById('aiCategorySuggestion');
  const suggestedVal = document.getElementById('suggestedCategoryValue');

  descTextarea.addEventListener('input', () => {
    const text = descTextarea.value.toLowerCase();
    let category = '';

    if (text.includes('wire') || text.includes('dark') || text.includes('light') || text.includes('pole') || text.includes('bulb') || text.includes('खंभा') || text.includes('बिजली') || text.includes('अंधेरा')) {
      category = 'Streetlights';
    } else if (text.includes('road') || text.includes('pothole') || text.includes('asphalt') || text.includes('hole') || text.includes('ditch') || text.includes('sarak') || text.includes('सड़क') || text.includes('गड्ढा')) {
      category = 'Roads & Potholes';
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('sanitation') || text.includes('waste') || text.includes('litter') || text.includes('smell') || text.includes('dump') || text.includes('कचरा') || text.includes('गंदगी') || text.includes('सफाई')) {
      category = 'Garbage & Sanitation';
    } else if (text.includes('leak') || text.includes('pipe') || text.includes('water') || text.includes('tap') || text.includes('sewage') || text.includes('पानी') || text.includes('पाइप') || text.includes('निकास')) {
      category = 'Water Supply';
    } else if (text.includes('drain') || text.includes('flood') || text.includes('clog') || text.includes('channel') || text.includes('नाला') || text.includes('बाढ़') || text.includes('जलभराव')) {
      category = 'Drainage';
    } else if (text.includes('noise') || text.includes('nuisance') || text.includes('loud') || text.includes('music') || text.includes('illegal') || text.includes('शोर') || text.includes('पार्क') || text.includes('अवैध')) {
      category = 'Public Nuisance';
    }

    if (category) {
      categorySelect.value = category;
      aiSuggestionContainer.style.display = 'flex';
      suggestedVal.textContent = state.currentLang === 'hi'
        ? (DICT.hi.categoryLabels[category] || category)
        : category;
    } else {
      aiSuggestionContainer.style.display = 'none';
    }
  });
}

// ----------------------------------------------------
// GRIEVANCE TRACKER & TIMELINE CONTROLS
// ----------------------------------------------------
function initTracker() {
  const searchBtn = document.getElementById('trackSearchBtn');
  const searchInput = document.getElementById('trackSearch');
  const closeTimelineBtn = document.getElementById('btnCloseTimeline');
  const simulateBtn = document.getElementById('btnSimulateAction');

  searchBtn.addEventListener('click', () => {
    const val = searchInput.value.trim();
    renderTrackList(val || null);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchBtn.click();
  });

  closeTimelineBtn.addEventListener('click', () => {
    document.getElementById('timelineViewerCard').style.display = 'none';
    state.selectedComplaintId = null;
  });

  // Simulate Municipal Officer Action Flow
  simulateBtn.addEventListener('click', () => {
    if (!state.selectedComplaintId) return;
    
    const idx = state.complaints.findIndex(c => c.fileNo === state.selectedComplaintId);
    if (idx === -1) return;

    const active = state.complaints[idx];
    const nowStr = new Date().toISOString();
    
    if (active.status === 'submitted') {
      active.status = 'assigned';
      active.history.push({
        status: 'assigned',
        date: nowStr,
        desc: state.currentLang === 'hi' 
          ? 'कनिष्ठ अभियंता राकेश कुमार (जल/सड़क विभाग) को जांच सौंपी गई है।' 
          : 'Junior Engineer Rakesh Kumar (Sanitation/Public Works) designated for physical verification.',
        officer: 'JE Rakesh Kumar (PWD)'
      });
    } else if (active.status === 'assigned') {
      active.status = 'progress';
      active.history.push({
        status: 'progress',
        date: nowStr,
        desc: state.currentLang === 'hi' 
          ? 'संशोधन कार्य सक्रिय। श्रमिक और निर्माण सामग्री स्थल पर पहुंच चुके हैं।' 
          : 'Grievance correction active. Labor, transport, and raw materials routed to the coordinate points.',
        officer: 'JE Rakesh Kumar (PWD)'
      });
    } else if (active.status === 'progress') {
      active.status = 'resolved';
      active.history.push({
        status: 'resolved',
        date: nowStr,
        desc: state.currentLang === 'hi' 
          ? 'सुधार कार्य संपन्न। स्थानीय वार्ड आयुक्त द्वारा कार्य का ऑडिट कर फाइल बंद कर दी गई है।' 
          : 'Site audit executed. Street repairs and structural operations certified complete. File closed.',
        officer: 'Assistant Commissioner'
      });
    } else {
      alert(state.currentLang === 'hi'
        ? "यह शिकायत पहले से ही हल हो चुकी है!"
        : "This grievance is already fully resolved!");
      return;
    }

    state.complaints[idx] = active;
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));
    
    // Refresh UI
    updateHomeCounters();
    renderTrackList();
    renderWardMap();
    openTimelineViewer(active);
  });

  // Filter Buttons
  document.getElementById('btnFilterAll').onclick = () => renderTrackList(null, 'all');
  document.getElementById('btnFilterSubmitted').onclick = () => renderTrackList(null, 'submitted');
  document.getElementById('btnFilterProgress').onclick = () => renderTrackList(null, 'progress');
  document.getElementById('btnFilterResolved').onclick = () => renderTrackList(null, 'resolved');

  // Ratings Star Clicks binding inside Nodal Track Timeline
  const ratingStars = document.getElementById('timelineStarRating');
  ratingStars.addEventListener('click', e => {
    const starSpan = e.target.closest('span');
    if (!starSpan) return;

    const ratingVal = parseInt(starSpan.dataset.star);
    const activeId = state.selectedComplaintId;
    if (!activeId) return;

    const idx = state.complaints.findIndex(c => c.fileNo === activeId);
    if (idx === -1) return;

    const active = state.complaints[idx];
    active.rating = ratingVal;

    // Save state
    state.complaints[idx] = active;
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));

    // Update visual stars UI
    const stars = ratingStars.querySelectorAll('span');
    stars.forEach((s, i) => {
      s.textContent = (i < ratingVal) ? '★' : '☆';
    });

    const escalationPanel = document.getElementById('escalationPanel');
    if (ratingVal <= 2 && !active.escalated) {
      escalationPanel.style.display = 'block';
    } else {
      escalationPanel.style.display = 'none';
    }
  });

  // Escalation request triggers
  const escalateBtn = document.getElementById('btnEscalateGrievance');
  escalateBtn.addEventListener('click', () => {
    const activeId = state.selectedComplaintId;
    if (!activeId) return;

    const idx = state.complaints.findIndex(c => c.fileNo === activeId);
    if (idx === -1) return;

    const active = state.complaints[idx];
    if (active.escalated) return;

    active.escalated = true;
    active.status = 'progress'; // Re-opens the case
    
    const nowStr = new Date().toISOString();
    active.history.push({
      status: 'progress',
      date: nowStr,
      desc: state.currentLang === 'hi'
        ? 'शिकायत को वरिष्ठ आयुक्त ऑडिट बोर्ड को अग्रेषित कर फाइल को दोबारा सक्रिय कर दिया गया है।'
        : 'File escalated to Senior Nodal Supervisor (Commissioner Nodal Board) for active audit review. Grievance re-opened.',
      officer: 'Commissioner Auditor Board'
    });

    state.complaints[idx] = active;
    localStorage.setItem('sb_complaints', JSON.stringify(state.complaints));

    alert(state.currentLang === 'hi'
      ? "शिकायत आयुक्त बोर्ड को अग्रेषित कर दी गई है और जांच पुनः शुरू हो गई है!"
      : "The complaint has been escalated to the Commissioner Board and the inspection is re-opened!");

    // Refresh UI
    updateHomeCounters();
    renderTrackList();
    renderWardMap();
    openTimelineViewer(active);
  });
}

function renderTrackList(searchQuery = null, filter = 'all') {
  const container = document.getElementById('trackList');
  const d = DICT[state.currentLang];
  
  let list = [...state.complaints];

  if (searchQuery) {
    list = list.filter(c => c.fileNo.toLowerCase().includes(searchQuery.toLowerCase()));
  } else if (filter !== 'all') {
    if (filter === 'progress') {
      list = list.filter(c => c.status === 'progress' || c.status === 'assigned');
    } else {
      list = list.filter(c => c.status === filter);
    }
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icn">🔍</div>
        <div>${searchQuery ? d.notFound : d.emptyTrack}</div>
      </div>
    `;
    return;
  }

  const badgeLabels = {
    submitted: state.currentLang === 'hi' ? 'दर्ज हुआ' : 'Submitted',
    assigned: state.currentLang === 'hi' ? 'नियुक्त' : 'Assigned',
    progress: state.currentLang === 'hi' ? 'प्रगति पर' : 'Active',
    resolved: state.currentLang === 'hi' ? 'समाधान' : 'Resolved'
  };

  const recentHeader = searchQuery ? '' : `<div class="section-label" style="margin-top:0;">${d.thisArea}</div>`;
  
  container.innerHTML = recentHeader + list.map(c => {
    // Map internal status logic to CSS badge classes
    let statusClass = 'submitted';
    if (c.status === 'resolved') statusClass = 'resolved';
    if (c.status === 'progress' || c.status === 'assigned') statusClass = 'progress';

    return `
      <div class="complaint-card" data-fileno="${c.fileNo}">
        <div class="complaint-left">
          <h4>${c.category}</h4>
          <p>${c.location} ${c.desc ? ' — ' + c.desc.substring(0, 70) + '...' : ''}</p>
          <span class="file-tag">📂 ${c.fileNo}</span>
        </div>
        <div class="status-badge ${statusClass}">${badgeLabels[c.status] || c.status}</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.complaint-card').forEach(card => {
    card.addEventListener('click', () => {
      const active = state.complaints.find(c => c.fileNo === card.dataset.fileno);
      if (active) openTimelineViewer(active);
    });
  });
}

function openTimelineViewer(c) {
  state.selectedComplaintId = c.fileNo;
  const panel = document.getElementById('timelineViewerCard');
  panel.style.display = 'block';

  document.getElementById('timelineCategory').textContent = c.category;
  document.getElementById('timelineFileNo').textContent = `📂 ${c.fileNo}`;
  document.getElementById('timelineLocation').textContent = `${DICT[state.currentLang].lblLocation}: ${c.location}`;
  document.getElementById('timelineDesc').textContent = c.desc;

  // Status Badge classes
  const badge = document.getElementById('timelineBadge');
  badge.className = 'status-badge';
  
  const labels = {
    submitted: state.currentLang === 'hi' ? 'दर्ज हुआ' : 'Submitted',
    assigned: state.currentLang === 'hi' ? 'प्रक्रिया' : 'Assigned',
    progress: state.currentLang === 'hi' ? 'सक्रिय' : 'Active',
    resolved: state.currentLang === 'hi' ? 'पूर्ण' : 'Resolved'
  };
  badge.textContent = labels[c.status] || c.status;
  
  if (c.status === 'resolved') badge.classList.add('resolved');
  else if (c.status === 'progress' || c.status === 'assigned') badge.classList.add('progress');
  else badge.classList.add('submitted');

  // Photo attachments
  const photoSection = document.getElementById('timelineImageContainer');
  if (c.photo) {
    document.getElementById('timelineAttachedImage').src = c.photo;
    photoSection.style.display = 'block';
  } else {
    photoSection.style.display = 'none';
  }

  // Reset timeline steps styling
  const steps = ['submitted', 'assigned', 'progress', 'resolved'];
  steps.forEach(s => {
    const el = document.getElementById(`step-${s}`);
    el.classList.remove('active', 'completed');
  });

  // Populate active dates and notes
  steps.forEach(s => {
    const historyItem = c.history.find(h => h.status === s);
    const dateEl = document.getElementById(`date-${s}`);
    const descEl = document.getElementById(`desc-${s}`);
    const officerEl = document.getElementById(`officer-${s}`);

    if (historyItem) {
      dateEl.textContent = new Date(historyItem.date).toLocaleDateString();
      descEl.textContent = historyItem.desc;
      if (officerEl && historyItem.officer) {
        officerEl.style.display = 'block';
        officerEl.textContent = `Staff: ${historyItem.officer}`;
      } else if (officerEl) {
        officerEl.style.display = 'none';
      }
      
      document.getElementById(`step-${s}`).classList.add('completed');
    } else {
      dateEl.textContent = '-';
      if (s === 'assigned') descEl.textContent = 'Municipal inspection scheduled.';
      if (s === 'progress') descEl.textContent = 'Awaiting site verification.';
      if (s === 'resolved') descEl.textContent = 'File audits and signoff pending.';
      if (officerEl) officerEl.style.display = 'none';
    }
  });

  // Mark the current status step as active highlight
  const currentStepEl = document.getElementById(`step-${c.status}`);
  if (currentStepEl) {
    currentStepEl.classList.remove('completed');
    currentStepEl.classList.add('active');
  }
  
  // Highlight pin location in Canvas Map
  state.selectedCoords = c.coords;
  renderWardMap();

  // Handle Resolved rating & escalation display
  const feedbackSec = document.getElementById('timelineFeedbackSection');
  const ratingStars = document.getElementById('timelineStarRating');
  const escalationPanel = document.getElementById('escalationPanel');

  if (c.status === 'resolved') {
    feedbackSec.style.display = 'block';
    // Load existing rating if present
    const stars = ratingStars.querySelectorAll('span');
    stars.forEach((s, idx) => {
      s.textContent = (c.rating && idx < c.rating) ? '★' : '☆';
    });
    
    if (c.rating && c.rating <= 2 && !c.escalated) {
      escalationPanel.style.display = 'block';
    } else {
      escalationPanel.style.display = 'none';
    }
  } else {
    feedbackSec.style.display = 'none';
    escalationPanel.style.display = 'none';
  }
}

// ----------------------------------------------------
// CANVAS INTERACTIVE WARD MAP
// ----------------------------------------------------
function renderWardMap() {
  const canvas = document.getElementById('wardMap');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.parentElement.clientWidth;
  const h = canvas.height = 220;

  // Detect Theme Colors dynamically
  const colorBackground = '#ffffff';
  const colorGrid = '#f0eada';
  const colorRoads = '#f5ebd9';
  const colorBorder = '#ddd6c9';
  const colorLabels = '#5c6b84';
  
  // Draw base layout canvas background
  ctx.fillStyle = colorBackground;
  ctx.fillRect(0, 0, w, h);

  // Draw grid lines
  ctx.strokeStyle = colorGrid;
  ctx.lineWidth = 1;
  const gridSize = 30;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw simulated arterial roads/layout structures
  ctx.fillStyle = colorRoads;
  // Road A: horizontal
  ctx.fillRect(0, 80, w, 28);
  // Road B: vertical
  ctx.fillRect(150, 0, 32, h);
  // Road C: diagonal/branch
  ctx.beginPath();
  ctx.moveTo(150, 180);
  ctx.lineTo(0, h - 10);
  ctx.lineWidth = 15;
  ctx.strokeStyle = colorRoads;
  ctx.stroke();

  // Draw boundary frame line
  ctx.strokeStyle = colorBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, w, h);

  // Draw sector tags/labels
  ctx.fillStyle = colorLabels;
  ctx.font = '9px monospace';
  ctx.fillText("SECTOR 1", 30, 40);
  ctx.fillText("SECTOR 2", w - 80, 40);
  ctx.fillText("CIVIC PARK", 20, 160);
  ctx.fillText("METRO STATION", w - 100, 180);

  // Plot existing complaints inside state as status-colored dots
  state.complaints.forEach(c => {
    if (!c.coords) return;
    
    // Scale coords to handle canvas resize dynamically
    const cx = (c.coords.x / 300) * w;
    const cy = (c.coords.y / 220) * h;
    
    let color = '#E8620C'; // submitted (saffron)
    if (c.status === 'resolved') color = '#0B6E4F'; // green
    if (c.status === 'progress' || c.status === 'assigned') color = '#8A6D00'; // yellow

    // Draw coordinate marker glow
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = color + '40'; // transparency
    ctx.fill();

    // Core point dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Pulse active item highlight
    if (state.selectedComplaintId === c.fileNo) {
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Draw active selected picker pin target (during Reporting)
  if (state.selectedCoords) {
    const rx = (state.selectedCoords.x / 300) * w;
    const ry = (state.selectedCoords.y / 220) * h;
    
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 6, ry - 14);
    ctx.lineTo(rx + 6, ry - 14);
    ctx.closePath();
    ctx.fillStyle = '#E8620C';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rx, ry - 14, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#E8620C';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rx, ry - 14, 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
}

// ----------------------------------------------------
// SERVICES DIRECTORY VIEW CARD RENDERS
// ----------------------------------------------------
function renderPopularGrid() {
  const grid = document.getElementById('popularGrid');
  grid.innerHTML = SERVICES_DATA.slice(0, 3).map(s => {
    const t = state.currentLang === 'hi' ? s.hi : s.en;
    return `
      <div class="svc-card" data-key="${s.key}">
        <div class="icn">${s.icn}</div>
        <h4>${t.name}</h4>
        <p>${t.desc.substring(0, 60)}...</p>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('click', () => openServiceDetails(card.dataset.key));
  });
}

function renderServicesGrid() {
  const grid = document.getElementById('servicesGrid');
  const searchInput = document.getElementById('svcSearch');
  const filterVal = searchInput ? searchInput.value.toLowerCase() : '';

  let list = [...SERVICES_DATA];
  if (filterVal) {
    list = list.filter(s => {
      const nameMatch = s.en.name.toLowerCase().includes(filterVal) || s.hi.name.toLowerCase().includes(filterVal);
      const descMatch = s.en.desc.toLowerCase().includes(filterVal) || s.hi.desc.toLowerCase().includes(filterVal);
      return nameMatch || descMatch;
    });
  }

  grid.innerHTML = list.map(s => {
    const t = state.currentLang === 'hi' ? s.hi : s.en;
    return `
      <div class="svc-card" data-key="${s.key}">
        <div class="icn">${s.icn}</div>
        <h4>${t.name}</h4>
        <p>${t.desc}</p>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('click', () => openServiceDetails(card.dataset.key));
  });
}

function initServicesDirectory() {
  const searchInput = document.getElementById('svcSearch');
  if (searchInput) {
    searchInput.addEventListener('input', renderServicesGrid);
  }

  const modal = document.getElementById('serviceDetailsModal');
  const closeBtn = document.getElementById('closeSvcModal');
  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
}

function openServiceDetails(key) {
  const s = SERVICES_DATA.find(x => x.key === key);
  if (!s) return;

  const t = state.currentLang === 'hi' ? s.hi : s.en;
  const modal = document.getElementById('serviceDetailsModal');
  const title = document.getElementById('svcModalTitle');
  const body = document.getElementById('svcModalBody');
  
  title.textContent = t.name;
  
  const stepLabel = state.currentLang === 'hi' ? 'आवेदन की चरण-दर-चरण प्रक्रिया' : 'Application Step-by-Step Procedure';
  const docLabel = state.currentLang === 'hi' ? 'दस्तावेज़ चेकलिस्ट' : 'Document Checklist';
  const askBtnLabel = state.currentLang === 'hi' ? 'सहायक से इस बारे में पूछें 💬' : 'Consult Sahayak AI on this 💬';

  body.innerHTML = `
    <p style="font-size: 14px; line-height: 1.6; color: var(--ink-muted); margin-bottom: 20px;">${t.desc}</p>
    
    <h4 style="margin: 0 0 10px 0; font-size: 15px; font-family: var(--font-serif);">${stepLabel}</h4>
    <ol style="font-size: 13.5px; line-height: 1.5; padding-left: 20px; margin-bottom: 20px;">
      ${t.steps.map(step => `<li style="margin-bottom: 6px;">${step}</li>`).join('')}
    </ol>
    
    <h4 style="margin: 0 0 10px 0; font-size: 15px; font-family: var(--font-serif);">${docLabel}</h4>
    <ul style="font-size: 13.5px; line-height: 1.5; padding-left: 20px; margin-bottom: 20px;">
      ${t.docs.map(doc => `<li style="margin-bottom: 4px;">${doc}</li>`).join('')}
    </ul>

    <div style="margin-top: 12px; font-size: 12px; font-family: var(--font-mono); color: var(--primary-deep);">
      ⏳ ${state.currentLang === 'hi' ? 'अवधि' : 'Timeline'}: ${t.timeline} | 🏢 Office: ${t.office}
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
      <button class="btn-primary" id="svcConsultBtn" style="width: 100%;">${askBtnLabel}</button>
    </div>
  `;

  document.getElementById('svcConsultBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    goto('assistant');
    const q = state.currentLang === 'hi' 
      ? `${t.name} के लिए कैसे आवेदन करें और क्या योग्यता है?`
      : `How do I apply for ${t.name} and what is the eligibility?`;
    document.getElementById('chatInput').value = q;
    handleSendMessage();
  });

  modal.classList.add('active');
}

// ----------------------------------------------------
// DOCUMENT HELPER & DRAG-DROP VERIFICATION LAB
// ----------------------------------------------------
function initDocHelper() {
  const submitBtn = document.getElementById('docSubmit');
  const resultWrap = document.getElementById('docResult');
  const goalInput = document.getElementById('docGoal');

  submitBtn.addEventListener('click', async () => {
    const goal = goalInput.value.trim();
    if (!goal) {
      alert(state.currentLang === 'hi' ? "कृपया उस सेवा का नाम दर्ज करें जिसके लिए आप तैयारी कर रहे हैं।" : "Please specify the service you are applying for.");
      return;
    }

    submitBtn.disabled = true;
    resultWrap.style.display = 'block';
    resultWrap.innerHTML = `<span class="spinner"></span> <span>${state.currentLang === 'hi' ? 'दस्तावेजों का विश्लेषण किया जा रहा है...' : 'Analyzing document guidelines...'}</span>`;

    try {
      let reply = '';
      if (state.apiKey) {
        // LIVE GEMINI MODE
        const genAI = new GoogleGenerativeAI(state.apiKey);
        const model = genAI.getGenerativeModel({ model: state.apiModel });
        const docPrompt = `You are a document checking assistant for Smart Bharat.
        Analyze what the citizen is applying for. Detail the MANDATORY documents in a structured list.
        Ensure you present the information in their language (English or Hindi).
        Format your response in a structured manner. Under a section titled "Mandatory Checklist:", list the document names clearly. Example:
        - Document Name 1
        - Document Name 2`;

        const contents = [{ role: 'user', parts: [{ text: `${docPrompt}\n\nCitizen Goal: ${goal}` }] }];
        const result = await model.generateContent({ contents });
        const response = await result.response;
        reply = response.text();
      } else {
        // SIMULATED OFFLINE SYSTEM
        await new Promise(resolve => setTimeout(resolve, 1000));
        reply = getLocalDocChecklistResponse(goal);
      }

      renderDocResultWithLab(reply);
    } catch (error) {
      console.error(error);
      resultWrap.innerHTML = `<div>Error compiling documents. Please retry.</div>`;
    } finally {
      submitBtn.disabled = false;
    }
  });

  goalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn.click();
  });
}

function getLocalDocChecklistResponse(goal) {
  const g = goal.toLowerCase();
  
  if (g.includes('passport') || g.includes('पासपोर्ट')) {
    if (state.currentLang === 'hi') {
      return `### पासपोर्ट आवेदन के लिए आवश्यक दस्तावेज\n\nयहाँ आपके लिए आवश्यक मुख्य दस्तावेज दिए गए हैं:\n\n**Mandatory Checklist:**\n- पते का प्रमाण (Aadhaar Card)\n- जन्म तिथि का प्रमाण (Birth Certificate)\n- शैक्षणिक योग्यता (Non-ECR Class 10th Certificate)\n- पासपोर्ट साइज फोटो (Photograph)`;
    }
    return `### Indian Passport Requirements\n\nHere are the standard documents you must submit:\n\n**Mandatory Checklist:**\n- Proof of Address (Aadhaar Card)\n- Proof of Date of Birth (Birth Certificate)\n- Academic Certificate (Non-ECR Class 10th Certificate)\n- Recent Passport Size Photos (Photograph)`;
  }
  
  if (g.includes('aadhaar') || g.includes('aadhar') || g.includes('आधार')) {
    if (state.currentLang === 'hi') {
      return `### आधार अपडेट के लिए आवश्यक दस्तावेज\n\n**Mandatory Checklist:**\n- पहचान पत्र (PAN Card)\n- पते का प्रमाण (Aadhaar Card)\n- जन्म तिथि का प्रमाण (Birth Certificate)`;
    }
    return `### Aadhaar Update Requirements\n\n**Mandatory Checklist:**\n- Proof of Identity (PAN Card)\n- Proof of Address (Aadhaar Card)\n- Birth proof document (Birth Certificate)`;
  }

  // General local fallback
  if (state.currentLang === 'hi') {
    return `### ${goal} के लिए दस्तावेज़ चेकलिस्ट\n\n**Mandatory Checklist:**\n- पहचान पत्र (PAN Card)\n- पते का प्रमाण (Aadhaar Card)\n- हालिया फोटो (Photograph)\n- आय का प्रमाण (Income Certificate)`;
  }
  return `### Document Checklist for ${goal}\n\n**Mandatory Checklist:**\n- Identity Verification (PAN Card)\n- Proof of Address (Aadhaar Card)\n- Current Photograph (Photograph)\n- Income Declaration (Income Certificate)`;
}

function renderDocResultWithLab(rawText) {
  const resultWrap = document.getElementById('docResult');
  
  // Parse document strings out of the text block to feed checklist lab
  const listItems = [];
  const lines = rawText.split('\n');
  let capturing = false;

  lines.forEach(line => {
    if (line.includes('Mandatory Checklist:') || line.includes('चेकलिस्ट:')) {
      capturing = true;
      return;
    }
    if (capturing && line.trim().startsWith('-')) {
      // Clean document name
      const name = line.replace(/[-\*\d\.]/g, '').trim();
      if (name) listItems.push(name);
    }
  });

  // Default values if parse fails
  if (listItems.length === 0) {
    listItems.push(
      state.currentLang === 'hi' ? "पहचान पत्र (PAN Card)" : "Identity Verification (PAN Card)",
      state.currentLang === 'hi' ? "पते का प्रमाण (Aadhaar Card)" : "Proof of Address (Aadhaar Card)",
      state.currentLang === 'hi' ? "पासपोर्ट साइज फोटो (Photograph)" : "Current Photograph (Photograph)"
    );
  }

  // Create state structure for Document Lab
  state.currentDocChecklist = listItems.map(name => ({
    name,
    verified: false,
    status: 'missing' // loaded or missing
  }));

  // Build innerHTML combining HTML responses and drag-drop components
  let formattedHtml = rawText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n/g, '<br>');

  const labTitle = state.currentLang === 'hi' ? 'दस्तावेज़ सत्यापन लैब (Verification Lab)' : 'Interactive Document Verification Lab';
  const labDesc = state.currentLang === 'hi' 
    ? 'सत्यापन का परीक्षण करने के लिए फ़ाइलों (उदा: *aadhaar_scan.pdf*, *pan_card.jpg*, *photo.png*) को यहाँ खींचें और छोड़ें (drag & drop) या अपलोड करें।'
    : 'Simulate document readiness. Drag and drop dummy files (e.g. *aadhaar_scan.pdf*, *pan_card.jpg*, *photo.png*) to check them off.';
  const dropLabel = state.currentLang === 'hi' ? 'फ़ाइलें यहाँ खींचें या अपलोड करने के लिए क्लिक करें' : 'Drag & drop draft documents or click here';

  resultWrap.innerHTML = `
    <div class="doc-result">
      <div>${formattedHtml}</div>
      
      <!-- INTERACTIVE LAB CONTAINER -->
      <div class="verification-lab">
        <div class="lab-title">${labTitle}</div>
        <div class="lab-desc">${labDesc}</div>
        
        <div id="labChecklistItems"></div>

        <div class="file-upload-area" id="docLabUploadArea" style="margin-top: 16px;">
          <div class="file-upload-icon">📁</div>
          <div class="file-upload-text">${dropLabel}</div>
          <input type="file" id="docLabFileInput" multiple style="display: none;" />
        </div>
      </div>
    </div>
  `;

  renderLabChecklist();

  // Setup Document Lab Event Bindings
  const uploadArea = document.getElementById('docLabUploadArea');
  const fileInput = document.getElementById('docLabFileInput');

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      processLabFiles(e.dataTransfer.files);
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      processLabFiles(fileInput.files);
    }
  });
}

function renderLabChecklist() {
  const container = document.getElementById('labChecklistItems');
  if (!container) return;

  const missingText = state.currentLang === 'hi' ? 'अनुपलब्ध' : 'Missing';
  const loadedText = state.currentLang === 'hi' ? 'सत्यापित' : 'Verified';

  container.innerHTML = state.currentDocChecklist.map((item, idx) => `
    <div class="doc-checklist-item ${item.verified ? 'verified' : ''}">
      <div class="checklist-left">
        <input type="checkbox" class="checklist-chk" data-idx="${idx}" ${item.verified ? 'checked' : ''} />
        <span class="checklist-name ${item.verified ? 'verified' : ''}">${item.name}</span>
      </div>
      <span class="checklist-status ${item.status}">${item.status === 'missing' ? missingText : loadedText}</span>
    </div>
  `).join('');

  // Bind checkbox events for manual toggle overrides
  container.querySelectorAll('.checklist-chk').forEach(chk => {
    chk.addEventListener('change', e => {
      const idx = parseInt(e.target.dataset.idx);
      state.currentDocChecklist[idx].verified = e.target.checked;
      state.currentDocChecklist[idx].status = e.target.checked ? 'loaded' : 'missing';
      renderLabChecklist();
    });
  });
}

function processLabFiles(files) {
  const alertMatches = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const nameLower = file.name.toLowerCase();
    
    // Scan matching tags based on filename analysis heuristics
    state.currentDocChecklist.forEach(item => {
      const itName = item.name.toLowerCase();
      
      let matched = false;
      if (nameLower.includes('aadhaar') || nameLower.includes('aadhar') || nameLower.includes('address')) {
        if (itName.includes('aadhaar') || itName.includes('address') || itName.includes('पता')) matched = true;
      }
      if (nameLower.includes('pan') || nameLower.includes('identity')) {
        if (itName.includes('pan') || itName.includes('identity') || itName.includes('पहचान')) matched = true;
      }
      if (nameLower.includes('birth') || nameLower.includes('dob') || nameLower.includes('certificate')) {
        if (itName.includes('birth') || itName.includes('certificate') || itName.includes('जन्म') || itName.includes('प्रमाण')) matched = true;
      }
      if (nameLower.includes('photo') || nameLower.includes('image') || nameLower.includes('jpg') || nameLower.includes('png')) {
        if (itName.includes('photo') || itName.includes('photograph') || itName.includes('तस्वीर') || itName.includes('फोटो')) matched = true;
      }
      if (nameLower.includes('income') || nameLower.includes('salary') || nameLower.includes('tax')) {
        if (itName.includes('income') || itName.includes('salary') || itName.includes('आय') || itName.includes('वेतन')) matched = true;
      }
      if (nameLower.includes('caste') || nameLower.includes('domicile') || nameLower.includes('residence')) {
        if (itName.includes('caste') || itName.includes('domicile') || itName.includes('जाति') || itName.includes('मूल')) matched = true;
      }

      if (matched && !item.verified) {
        item.verified = true;
        item.status = 'loaded';
        alertMatches.push(item.name);
      }
    });
  }

  if (alertMatches.length > 0) {
    const matchedCount = alertMatches.length;
    const msg = state.currentLang === 'hi' 
      ? `सफलता: ${matchedCount} फाइल(ें) पहचानी गईं और चेकलिस्ट में सत्यापित की गईं!`
      : `Success: System identified and verified ${matchedCount} matching draft file(s)!`;
    alert(msg);
  } else {
    alert(state.currentLang === 'hi'
      ? "कोई मेल खाता दस्तावेज़ नहीं मिला। कृपया फ़ाइल नाम बदलें (जैसे: aadhaar_card.pdf या photo.jpg)"
      : "No matching documents recognized. Try renaming your file (e.g., aadhaar_card.pdf or photo.jpg) to match the items.");
  }
  
  renderLabChecklist();
}

// ----------------------------------------------------
// SYSTEM STATISTICS RE-CALCULATION HELPERS
// ----------------------------------------------------
function updateHomeCounters() {
  const openCount = state.complaints.filter(c => c.status !== 'resolved').length;
  const resolvedCount = state.complaints.filter(c => c.status === 'resolved').length;
  
  const oEl = document.getElementById('statOpen');
  const rEl = document.getElementById('statResolved');
  if (oEl) oEl.textContent = openCount;
  if (rEl) rEl.textContent = resolvedCount;
}

function initFooterLinks() {
  const modal = document.getElementById('infoModal');
  const closeBtn = document.getElementById('closeInfoModal');
  const title = document.getElementById('infoModalTitle');
  const body = document.getElementById('infoModalBody');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  const showModal = (modalTitle, modalHtml) => {
    title.textContent = modalTitle;
    body.innerHTML = modalHtml;
    modal.classList.add('active');
  };

  document.getElementById('footerLinkAbout').addEventListener('click', (e) => {
    e.preventDefault();
    const isHi = state.currentLang === 'hi';
    const modalTitle = isHi ? "हमारे बारे में" : "About Us";
    const modalHtml = isHi 
      ? `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);"><strong>स्मार्ट भारत नागरिक सहायक पोर्टल</strong> में आपका स्वागत है।</p>
         <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">
           यह मंच एक एकीकृत नागरिक पोर्टल है जो एआई-संचालित सहायकों और डिजिटल ग्राइवेंस टूल का उपयोग करके नगर निगम के प्रशासनिक कार्यों को सरल बनाता है।
         </p>
         <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">
           हमारा लक्ष्य प्रत्येक भारतीय नागरिक को कुशल, उत्तरदायी और डिजिटल रूप से सुरक्षित तरीके से सार्वजनिक सेवाओं तक पहुंच प्रदान करना है।
         </p>`
      : `<p style="font-size: 14px; line-height: 1.6; color: var(--ink);">Welcome to the <strong>Smart Bharat Civic Companion Portal</strong>.</p>
         <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">
           This platform is an official, AI-driven municipal workspace designed to simplify document workflows, expedite grievance filing, and bridge communication gaps between local government offices and municipal residents.
         </p>
         <p style="font-size: 13.5px; line-height: 1.6; color: var(--ink-muted); margin-top: 12px;">
           Built with modern Generative AI technologies, we aim to ensure civic convenience, transparent service timelines, and high accessibility support.
         </p>`;
    showModal(modalTitle, modalHtml);
  });

  document.getElementById('footerLinkContact').addEventListener('click', (e) => {
    e.preventDefault();
    const isHi = state.currentLang === 'hi';
    const modalTitle = isHi ? "संपर्क करें" : "Contact Us";
    const modalHtml = isHi 
      ? `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
           <p style="margin-bottom: 12px;">📞 <strong>नागरिक टोल-फ्री हेल्पलाइन:</strong> 1800-345-5678 (24x7 उपलब्ध)</p>
           <p style="margin-bottom: 12px;">📧 <strong>आधिकारिक शिकायत ईमेल:</strong> support@smartbharat.gov.in</p>
           <p style="margin-bottom: 12px;">🏢 <strong>केंद्रीय कार्यालय:</strong> नगर निगम भवन, विकास मार्ग, नई दिल्ली - 110001</p>
           <hr style="border: none; border-top: 1px solid var(--line); margin: 16px 0;">
           <p style="font-size: 12.5px; color: var(--ink-muted);">यदि आपको जलभराव, खराब सड़कों या स्ट्रीटलाइट से संबंधित शिकायत दर्ज करनी है, तो कृपया शीर्ष पर स्थित <strong>\"शिकायत दर्ज करें\"</strong> विकल्प का उपयोग करें।</p>
         </div>`
      : `<div style="line-height: 1.8; font-size: 14px; color: var(--ink);">
           <p style="margin-bottom: 12px;">📞 <strong>Citizen Toll-Free Helpline:</strong> 1800-345-5678 (Available 24x7)</p>
           <p style="margin-bottom: 12px;">📧 <strong>Official Grievance Desk:</strong> support@smartbharat.gov.in</p>
           <p style="margin-bottom: 12px;">🏢 <strong>Central Office:</strong> Municipal Headquarters, Vikas Marg, New Delhi - 110001</p>
           <hr style="border: none; border-top: 1px solid var(--line); margin: 16px 0;">
           <p style="font-size: 12.5px; color: var(--ink-muted);">For issues relating to municipal repairs, please file an official request using the <strong>\"Report an Issue\"</strong> tab for direct coordination with ward staff.</p>
         </div>`;
    showModal(modalTitle, modalHtml);
  });

  document.getElementById('footerLinkFeedback').addEventListener('click', (e) => {
    e.preventDefault();
    const isHi = state.currentLang === 'hi';
    const modalTitle = isHi ? "प्रतिक्रिया दें" : "Feedback";
    const ratingLabel = isHi ? "हमारे पोर्टल को रेट करें:" : "Rate our portal:";
    const commentLabel = isHi ? "अपनी टिप्पणियाँ लिखें (वैकल्पिक):" : "Add comments (optional):";
    const placeholderText = isHi ? "कृपया अपना सुझाव साझा करें..." : "Share your experience with Sahayak AI...";
    const submitText = isHi ? "फीडबैक भेजें" : "Submit Feedback";

    const modalHtml = `
      <form id="frmFeedback" class="feedback-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 8px; color: var(--ink);">${ratingLabel}</label>
          <div class="feedback-stars" id="lblFeedbackStars" style="display: flex; gap: 8px; font-size: 28px; color: #ffbc00; cursor: pointer;">
            <span data-val="1">☆</span>
            <span data-val="2">☆</span>
            <span data-val="3">☆</span>
            <span data-val="4">☆</span>
            <span data-val="5">☆</span>
          </div>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 13px; display: block; margin-bottom: 8px; color: var(--ink);">${commentLabel}</label>
          <textarea id="txtFeedbackComment" placeholder="${placeholderText}" rows="4" style="width: 100%; padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--line); font-size: 13.5px; outline: none; resize: none; background: var(--card); color: var(--ink);"></textarea>
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 600;">${submitText}</button>
      </form>
    `;
    showModal(modalTitle, modalHtml);

    let selectedFeedbackRating = 0;
    const stars = document.getElementById('lblFeedbackStars').querySelectorAll('span');
    stars.forEach(s => {
      s.addEventListener('click', () => {
        selectedFeedbackRating = parseInt(s.dataset.val);
        stars.forEach((star, idx) => {
          star.textContent = (idx < selectedFeedbackRating) ? '★' : '☆';
        });
      });
    });

    document.getElementById('frmFeedback').addEventListener('submit', (evt) => {
      evt.preventDefault();
      alert(isHi 
        ? "आपकी प्रतिक्रिया प्राप्त हुई। स्मार्ट भारत को बेहतर बनाने में सहायता के लिए धन्यवाद!" 
        : "Thank you! Your feedback has been registered to help us improve the citizen companion.");
      modal.classList.remove('active');
    });
  });

  document.getElementById('footerLinkFaqs').addEventListener('click', (e) => {
    e.preventDefault();
    const isHi = state.currentLang === 'hi';
    const modalTitle = isHi ? "अक्सर पूछे जाने वाले प्रश्न" : "FAQs";
    
    const faqs = isHi ? [
      { q: "शिकायत का समाधान होने में कितना समय लगता है?", a: "सामान्य तौर पर, स्ट्रीटलाइट और कचरे की सफाई में 24-48 घंटे लगते हैं। सड़क की मरम्मत और जल निकासी से संबंधित समस्याओं के समाधान में 3-5 कार्य दिवस लग सकते हैं।" },
      { q: "क्या मेरे द्वारा अपलोड किए गए दस्तावेज़ सुरक्षित हैं?", a: "हां। दस्तावेज़ सत्यापन लैब पूरी तरह से क्लाइंट-साइड काम करती है। आपकी फाइलें हमारे सर्वर पर अपलोड नहीं की जाती हैं, जिससे आपकी गोपनीयता बनी रहती है।" },
      { q: "क्या मैं बिना इंटरनेट के भी सहायक का उपयोग कर सकता हूँ?", a: "हां, यदि आपके पास इंटरनेट नहीं है या आपके पास कोई एपीआई कुंजी नहीं है, तो पोर्टल स्वचालित रूप से हमारे स्थानीय बुद्धिमान एनएलपी सिमुलेटर का उपयोग करता है जो अधिकांश सामान्य नागरिक प्रश्नों का उत्तर दे सकता है।" }
    ] : [
      { q: "How long does it take for a grievance to get resolved?", a: "Typically, minor issues like streetlight bulb replacements or garbage sanitation sweeps take 24-48 hours. Major civic works like road pothole repairs or sewer main cleaning can take 3-5 working days." },
      { q: "Are the documents uploaded to the Verification Lab secure?", a: "Yes, absolutely. The Document Verification Lab runs 100% locally on your browser. Your files are inspected client-side and are never uploaded or stored on any server." },
      { q: "Can I use the Sahayak AI Companion without an internet connection?", a: "Yes, our offline keyword parser runs locally on the browser. If you don't have internet or haven't configured a Gemini API key, the simulator returns offline templates for Aadhaar, Voter cards, licensing, etc." }
    ];

    const modalHtml = `
      <div class="info-accordion" style="display: flex; flex-direction: column; gap: 12px;">
        ${faqs.map((f, i) => `
          <div class="accordion-item" style="border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden;">
            <div class="accordion-header" data-idx="${i}" style="padding: 12px 16px; background: var(--paper); font-weight: 600; font-size: 13.5px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none;">
              <span>${f.q}</span>
              <span class="acc-chevron" style="transition: transform 0.2s;">▼</span>
            </div>
            <div class="accordion-body" id="acc-body-${i}" style="display: none; padding: 16px; font-size: 13px; line-height: 1.5; color: var(--ink-muted); border-top: 1px solid var(--line); background: var(--card);">
              ${f.a}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    showModal(modalTitle, modalHtml);

    const headers = body.querySelectorAll('.accordion-header');
    headers.forEach(h => {
      h.addEventListener('click', () => {
        const idx = h.dataset.idx;
        const b = document.getElementById(`acc-body-${idx}`);
        const chevron = h.querySelector('.acc-chevron');
        const isCollapsed = b.style.display === 'none';

        body.querySelectorAll('.accordion-body').forEach(ab => ab.style.display = 'none');
        body.querySelectorAll('.acc-chevron').forEach(cv => cv.style.transform = 'rotate(0deg)');

        if (isCollapsed) {
          b.style.display = 'block';
          chevron.style.transform = 'rotate(180deg)';
        }
      });
    });
  });

  document.getElementById('footerLinkHelp').addEventListener('click', (e) => {
    e.preventDefault();
    const isHi = state.currentLang === 'hi';
    const modalTitle = isHi ? "सहायता एवं दिशा-निर्देश" : "Help & Guidelines";
    const modalHtml = isHi
      ? `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
           <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">पोर्टल का उपयोग कैसे करें:</h4>
           <ol style="padding-left: 20px; margin-bottom: 20px;">
             <li style="margin-bottom: 8px;"><strong>सहायक एआई:</strong> वॉयस माइक बटन का उपयोग करके बोलकर या लिखकर सरकारी योजनाओं के बारे में जानकारी प्राप्त करें।</li>
             <li style="margin-bottom: 8px;"><strong>शिकायत दर्ज करें:</strong> मानचित्र पर क्लिक करके सटीक स्थान चुनें, समस्या की फोटो अपलोड करें और तुरंत शिकायत दर्ज करें।</li>
             <li style="margin-bottom: 8px;"><strong>दस्तावेज़ सहायक:</strong> योजना का नाम लिखें और दस्तावेज़ों को ड्रैग-एंड-ड्रॉप करके पात्रता की जांच करें।</li>
           </ol>
           <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">एआई कुंजी कैसे कॉन्फ़िगर करें:</h4>
           <p style="color: var(--ink-muted);">शीर्ष बार पर <strong>\"AI Config\"</strong> पर क्लिक करें, अपनी व्यक्तिगत जेमिनी एपीआई कुंजी दर्ज करें और सेटिंग्स सहेजें।</p>
         </div>`
      : `<div style="font-size: 13.5px; line-height: 1.6; color: var(--ink);">
           <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">How to Navigate the Portal:</h4>
           <ol style="padding-left: 20px; margin-bottom: 20px;">
             <li style="margin-bottom: 8px;"><strong>Sahayak AI Chat:</strong> Ask about services, schemes, and guidelines. Click the mic icon to dictate queries in English or Hindi.</li>
             <li style="margin-bottom: 8px;"><strong>Report an Issue:</strong> Click directly on the vector map to register coordinates, drop a photo, and hit submit.</li>
             <li style="margin-bottom: 8px;"><strong>Document Helper Lab:</strong> Search for services to verify if your files (e.g. ` + "`aadhaar.pdf`" + `) match the checklist rules.</li>
           </ol>
           <h4 style="margin: 0 0 8px 0; font-size: 15px; font-family: var(--font-serif);">Configuring Live AI Integration:</h4>
           <p style="color: var(--ink-muted);">Click the <strong>\"AI Config\"</strong> button in the top utility bar, paste your Google Gemini API Key, and save. The app will immediately transition from simulator template fallback response structures to real-time generative responses.</p>
         </div>`;
    showModal(modalTitle, modalHtml);
  });
}
