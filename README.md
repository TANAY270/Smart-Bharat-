# Smart Bharat - GenAI Civic Companion Platform

Smart Bharat is a premium, Generative AI-powered web platform designed to simplify everyday civic interactions, promote municipal transparency, support digital inclusion, and improve accessibility for all citizens.

---

## 🏛️ 1. Chosen Vertical: Civic Services & Municipal Grievance Redressal

Smart Bharat targets the **Civic Services and Local Governance** vertical. Navigating public offices, understanding documentation requirements, and reporting structural municipal issues (e.g., potholes, broken streetlights) are often complex, time-consuming tasks for citizens. 

To bridge this gap, Smart Bharat provides a unified, highly visual dashboard containing:
*   An intelligent civic assistant (**Sahayak AI**).
*   An interactive, map-based reporting interface (**Public Grievance**).
*   A localized guidance compiler (**Document Verification Lab**).
*   Live transparency ledgers.

---

## 💡 2. Approach and Logic

The platform's design centers on **digital inclusion, maximum accessibility, and client-side self-healing performance**:

### A. Multilingual Architecture (Digital Inclusion)
To accommodate India's diverse demographic landscape, the platform supports **English, Hindi (हिंदी), Tamil (தமிழ்), and Bengali (বাংলা)**. Language switches are handled globally:
- We map a unified dictionary (`DICT`) holding local interface texts for all four languages.
- Clicking any language toggle re-renders all UI cards, buttons, titles, placeholder texts, and suggestion chips instantly.
- The chatbot's welcome greetings and suggested quick-action cards load in the selected language.

### B. Direct REST Integration & Bypass Logic
- Instead of using heavyweight Node SDKs, the platform connects to the **Google Gemini API** directly via client-side REST requests.
- Privacy-focused browsers like **Brave** strip custom request headers (such as `x-goog-api-key`) as part of fingerprinting protection. To guarantee reliable connections across all browsers, we pass the API key as a query parameter (`?key=...`) directly in the REST URL.

### C. Self-Healing Diagnostics
- If the user's key experiences connection errors, the application runs a live diagnostics routine calling `ModelService.ListModels`. It scans and retrieves the exact list of models permitted for that key (supporting `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3.5-flash`, `gemini-2.0-flash`, etc.) to dynamically switch and repair the connection.
- If no key is configured, the application falls back to an offline **NLP Rule Simulator** to maintain core interactivity.

### D. Adaptive Speech Engine
- **Speech-to-Text (STT)**: Integrates the HTML5 `webkitSpeechRecognition` API, dynamically setting the recognition language code (`en-IN`, `hi-IN`, `ta-IN`, `bn-IN`) based on the active UI language.
- **Text-to-Speech (TTS)**: Leverages `SpeechSynthesisUtterance`. It features a custom voice search algorithm that normalizes language tags (e.g., matching `ta-IN`, `ta_IN`, or `ta` for Tamil) to locate the native voice registered on the client machine.
- **Diagnostic Toasts**: If the browser returns an empty voice list (often due to Brave's fingerprinting shields) or lacks the required OS speech packages, the system displays a custom toast explaining how to download the voice assets.

---

## 🛠️ 3. How the Solution Works

### 1. Sahayak AI Companion
- Formulates a detailed system prompt instructing the LLM to act as a supportive administrative civic officer.
- Injects a strict **Active Language Lock**: The system prompt instructs the AI to formulate its entire reply only in the selected locale (English, Hindi, Tamil, or Bengali).

### 2. Interactive Grievance Map & Real-Time Categorizer
- Citizens pin coordinates on an interactive canvas map.
- As the user types their complaint description, a debounced **Auto-Categorizer** scans key phrases (e.g., "gully", "dark", "leak") and automatically selects the correct municipal department dropdown (e.g., Streetlights, Potholes, Water Supply).

### 3. Officer Simulation & Grievance Auditing
- Timeline nodes trace the complaint from submission, allocation, and active repair, to resolution.
- Testers can simulate officer actions, which changes status colors on the interactive map.
- When resolved, citizens submit a 1-5 star review. High-priority grievances (1 or 2 stars) trigger an **Escalate Case** flow, re-opening the file and assigning it to the Commissioner Auditor Board.

### 4. Interactive Document Verification Lab
- Lists document checklists for critical citizen services (Aadhaar, Passport, Ration Card, etc.).
- The verification lab lets users drop draft mock files (e.g., a text file named `aadhaar_card.pdf`). A regex helper checks the files against the required guidelines and updates the visual checkmark grid.

---

## 📐 4. Code Quality & Engineering Excellence

### A. Code Cleanliness, Readability, and Structure
The application follows a clean Single-Page Application (SPA) structure. All logic is organized inside [app.js](file:///c:/Users/LENOVO/Desktop/Smart%20Bharat/app.js) with clearly demarcated sections for core state management, translation dictionaries (`DICT`), API fetch clients, routing controllers, form validators, and canvas map renderers. Visual styling and custom variable parameters are isolated inside [styles.css](file:///c:/Users/LENOVO/Desktop/Smart%20Bharat/styles.css).

### B. Safe Practices & Security Vulnerabilities
- **XSS Prevention**: Modifies DOM attributes strictly via `.textContent` for standard user-entered text nodes to avoid raw HTML evaluation.
- **Credential Safety**: The Gemini API key is stored locally in the browser (`localStorage`) rather than hardcoded in the codebase.
- **Production Gateways**: Recommends routing API requests through a secure proxy backend gateway (e.g. Node/Express) for enterprise deployments to fully isolate keys from client-side network inspectors.
- **Request Debouncing**: Implements built-in timers (such as a 2-second chat wait constraint) to prevent client-side request flooding.

### C. Testability, Validation, and Maintenance
- **Offline NLP Fallback**: Includes a rule-based NLP simulator engine that processes user queries locally. This enables developers and quality engineers to fully test, debug, and validate the application's client views and form routing workflows offline or without an active Gemini API key.
- **Testing Simulators**: Features an *Officer Simulation Panel* in the tracker UI to trigger timeline step changes and update map statuses manually, allowing full validation of the satisfaction audit escalation workflow (re-routing cases to the Commissioner Auditor Board on low ratings) instantly.
- **Vite Bundling**: Integrates cleanly into standard Vite module bundlers, building production assets without code compilation warnings.

### D. Usability for Diverse Users and Environments
- **Multilingual Support**: Promotes digital inclusion by translating all interactive cards, suggestion grids, titles, and form fields into **English, Hindi, Tamil, and Bengali**.
- **Dynamic Text Resizing Toolbar**: Scalable custom header buttons (`A+`, `A`, `A-`) adjust a root `--font-scale` variable dynamically, scaling the layout between 85% and 130% proportionally to accommodate users with visual impairments.
- **Speech Controls**: Integrated with Web Speech STT (Speech-to-Text) and TTS (Text-to-Speech) modules.
- **Graceful Failures**: Displays a custom warning toast notification detailing how to resolve missing speech packages or adjust Brave browser Shield controls if voice engines are unavailable.

---

## 📌 5. Assumptions Made

1.  **API Key Configuration**: It is assumed the user will input their Gemini API key via the **"AI Config"** modal on the header to unlock real-time Gemini chat capabilities.
2.  **OS Voice Availability**: It is assumed that the client machine running the browser has the corresponding language speech packages (Hindi, Tamil, or Bengali) installed locally in the OS Settings for the text-to-speech engine to output audible native audio.
3.  **Autoplay Constraints**: To comply with modern browser policies, Text-to-Speech (TTS) is disabled (`muted`) by default on page load. The user must click the speaker button on a message or toggle the TTS header button to unmute it.
4.  **Mock File Types**: The Document Verification Lab validates files heuristically by inspecting file names and formats (e.g., matching `.pdf`, `.jpg`, `.png`) rather than performing server-side OCR metadata analysis.
5.  **Client-Side Persistence**: State data (complaints, custom API keys, and settings) is stored inside browser `localStorage` to persist values across page reloads.

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
The server will start at **http://localhost:5173/**.

### 3. Build for Production
```bash
npm run build
```
Generates a static web bundle inside the `/dist` directory.
