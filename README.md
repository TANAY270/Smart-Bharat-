# Smart Bharat - GenAI Civic Companion Platform

Smart Bharat is a premium, Generative AI-powered web platform designed to simplify everyday civic interactions, promote municipal transparency, support digital inclusion, and improve accessibility for all citizens.

---

## 🌟 Key Features

### 1. 💬 Sahayak AI Companion
*   **Direct REST Integration**: Connects to the **Google Gemini API** (supporting `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3.5-flash`, `gemini-2.0-flash`, etc.) using a direct REST endpoint. Passing the key in the URL (`?key=...`) bypasses custom header stripping rules in privacy-focused browsers like **Brave**.
*   **Self-Healing Diagnostics**: If connection issues occur, the client automatically runs `ModelService.ListModels` live to list all permitted models for your exact key.
*   **Dual-Mode fallback**: Runs on a high-fidelity **Offline NLP Simulator** using matching local rules if no API key is provided.
*   **Active Multilingual Language Lock**: The AI Companion dynamically reads the website's language toggle (`state.currentLang`) to force responses in the selected language (**English**, **Hindi (हिंदी)**, **Tamil (தமிழ்)**, or **Bengali (বাংলা)**) matching the citizen's active view.
*   **Speech Accessibility & Voice Synthesis**:
    *   🎤 **Speech-to-Text (STT)**: Voice-input query box matching the selected language (`en-IN`, `hi-IN`, `ta-IN`, `bn-IN`).
    *   🔊 **Text-to-Speech (TTS)**: Audibly reads back AI responses in the chosen language.
    *   ⚙️ **Robust Voice Matching**: Normalizes case and delimiter characters (e.g. `ta`, `ta-IN`, `ta_IN`) to dynamically locate matching system voices on the user's OS.
    *   ⚠️ **Speech Pack Diagnostics Toast**: Renders a floating visual warning if a user attempts to listen in a language (like Hindi, Tamil, or Bengali) that lacks downloaded native speech packages on the client OS, or if browser shields (such as Brave's fingerprinting blocker) restrict voice enumeration, detailing how to enable them.

### 2. ⚠️ Public Grievance (Report an Issue)
*   **Interactive Ward Map**: Canvas-based municipal road maps. Pin locations to automatically capture `X, Y` coordinates.
*   **Auto-Location**: Simulated browser GPS coordinate detector.
*   **AI Auto-Categorizer**: Real-time keyword scanning automatically matches and selects categories (e.g., Streetlights, Potholes, Water Supply) based on the user's description.
*   **Official Receipts**: Stamped confirmation cards with printable and downloadable receipt text files.

### 3. 📂 Status Tracker & Action Simulator
*   **Log Timelines**: Track complaints from submission, to inspector allocation, through active site repair, to resolution.
*   **Officer Simulation**: Allows administrators or testers to simulate official updates, updating timelines and changing map coordinate colors.
*   **Satisfaction Audit**: Citizen ratings (1-5 stars) upon resolution. Rates of 1 or 2 stars activate an **Escalate Case** process, re-opening the file and assigning it to the Senior Nodal Supervisor (Commissioner Auditor Board).

### 4. 🏛️ Municipal Analytics Ledger
*   **Transparency Dashboard**: Displays live municipal metrics on the Home page, including **Resolution Rates (87.4%)**, **Average Resolution Timelines (3.2 Days)**, and **Active Service Crews** to build public trust.

### 5. 📂 Document Helper & Verification Lab
*   **Checklist Compiler**: Renders mandatory checklist requirements and schedules for citizenship services (Aadhaar, PAN, Passport, Ration Card, Voter ID, Income Certificate).
*   **Verification Lab**: Drop dummy files (e.g. name a text file `aadhaar_card.pdf` or `photo.jpg`) and the app's heuristic parser checks it off the list.

### 6. ♿ Accessibility Toolbar
*   **Dynamic Typography Scaling**: Custom buttons (`A+`, `A`, `A-`) in the top navigation header set a `--font-scale` variable on the document root, adjusting the sizes of all elements from 85% to 130% dynamically.

### 7. 🔗 Website Footer Links & Support Modals
*   **Standard Website Footer**: Premium footer links mapping *About Us*, *Contact Us*, *Feedback*, *FAQs*, and *Help* sections.
*   **Localized Overlays**: Clicking a footer link opens an interactive overlay modal (`#infoModal`) displaying translation-compliant content (**English**, **Hindi**, **Tamil**, or **Bengali**):
    *   *Feedback*: Interactive star-rating and comment submission form.
    *   *FAQs*: Accordion cards with slide-down panels.
    *   *Help*: Step-by-step guidance manual.

---

## 🛠️ Technology Stack
*   **Core Structure**: Semantic HTML5.
*   **Styling**: Vanilla CSS3 (custom HSL variables, responsive grids, and transitions).
*   **Logic**: ES6+ Javascript Modules.
*   **AI Integration**: Google Gemini API via REST.
*   **Tooling**: Vite (hot module reloading, production bundling).

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The server will start at **http://localhost:5173/**. Open this URL in Brave or any modern web browser.

### 3. Build for Production
```bash
npm run build
```
Generates a static web bundle inside the `/dist` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📂 Project Structure
```text
Smart Bharat/
├── index.html        # Main SPA HTML interface, layouts, and modals
├── styles.css        # Theme variables, responsive layouts, header, footer, and animations
├── app.js            # Main application logic, REST fetch, state, and simulators
├── package.json      # Dependencies and dev server configurations
├── netlify.toml      # Build rules and SPA redirects configuration for Netlify
├── vercel.json       # Router rewrites configuration for Vercel
├── firebase.json     # Public folder and SPA rewrites for Firebase Hosting
└── README.md         # Documentation
```

---

## 🔒 Security Note (Gemini API Integration)
This application supports client-side API requests to Google Gemini for prototyping and testing ease. For production environments, it is recommended to set up a proxy backend server (e.g., Node/Express) to handle API keys and securely sign requests.
