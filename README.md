# CampusOS

<div align="center">

<h3>🎓 CampusOS — AI-Powered Campus Operations Platform ⚡</h3>

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service/)
[![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📋 Executive Summary
CampusOS is an AI-powered operations nervous system designed for modern universities. The platform consolidates student services, administrative tasks, policy navigation, lost-and-found tracking, and campus intelligence modules into a unified dashboard. By leveraging large language models (LLMs) and computer vision, CampusOS automates administrative workflows, resolves inquiries instantaneously, and reduces response times for grievances and maintenance issues.

---

## ⚠️ Problem Statement
Modern campus administration is plagued by:
1. **Siloed Communication:** Students struggle to navigate multiple independent portals for grievances, maintenance, canteen, and scholarships.
2. **Slow Resolution Times:** Manual triage of student grievances and maintenance reports results in routing delays.
3. **Manual Lost & Found Matching:** Lost item lists are historically stored in spreadsheets or physical ledgers, making matching slow and inefficient.
4. **Opaque Policy Handbooks:** Handbooks are distributed as long, dense PDF documents that students rarely read, leading to compliance issues and repetitive queries to the dean's office.

---

## 🔮 Platform Vision
CampusOS consolidates campus activities into a single, cohesive interface. It acts as a real-time operational hub where student reports are automatically categorized, policies are queryable in plain English, and lost item matches are calculated instantly.

---

## ✨ Core Features

### 1. 🤖 AI Grievance Triage
* **Automatic Categorization:** Student grievances are classified into categories (Hostel, Academic, Infrastructure, Canteen) using LLMs.
* **Urgency Evaluation:** Evaluates the severity of grievances and sets priority flags dynamically.
* **Smart Routing:** Auto-assigns cases to corresponding departments (IT, Facilities, Admin) and displays resolved/under-review logs.

### 2. 🔍 AI Lost & Found Matcher
* **Combinatorial Matching:** An attribute-weighted evaluation engine evaluates all active lost and found items.
* **Accuracy Scoring:** Guarantees a score of $\ge 90\%$ when category, name, and color match, alerting students when a match is found.
* **Secure OTP Claiming:** Generates security OTPs for claim verification.
* **Social Sharing:** Features quick-action sharing links to WhatsApp and Telegram, alongside dynamic QR code generation.

### 3. 📖 AI Policy Navigator
* **Real PDF Parsing:** Uses `pdfjs-dist` to parse actual text content page-by-page from uploaded files on the fly.
* **In-Memory RAG:** Combines active policy texts directly inside the LLM prompt context to answer questions in real time.
* **Policy Simplifier:** Converts complex bureaucratic jargon into clear Grade 8 level plain English.
* **Eligibility Checker & Procedure Guides:** Evaluates whether students meet qualifications for scholarships/leaves and drafts step-by-step procedures.
* **Hallucination Protection:** Strictly limits answers to provided documents; returns: *"I could not find this information in the uploaded policy documents"* on a RAG miss.

### 4. 📊 Attendance Intelligence
* Tracks student class hours, displays statistics, and flags exam eligibility.

### 5. 🛡️ Anti-Ragging Intelligence
* Direct portal to report issues anonymously, view anti-ragging bylaws, and contact emergency hotlines.

### 6. 🎓 Scholarship Finder
* Matches available campus scholarships based on student CGPA, family income, and year of study.

### 7. 🍔 Canteen Demand Predictor
* Displays crowd volumes and uses historical data to predict peak timings and dish popularity.

### 8. 🛠️ Maintenance Predictor
* Allows students to file maintenance requests (e.g. plumbing leak, electrical failure). Shows real-time status and AI escalation logs.

### 9. 🛡️ Admin Portal (`/admin/*`)
* The control center for administrators to manage policy documents, resolve grievances, update maintenance statuses, and review active lost/found matches.

---

## 🔄 Student & Admin Workflows

### Student Workflow
1. Log in with Student credentials.
2. File grievances, report lost items, or submit maintenance requests.
3. Open the **Policy Navigator** to ask rules questions, simplify complex clauses, or run eligibility checks.
4. Review matches in the **Lost & Found Feed** and claim items via OTP.

### Admin Workflow
1. Log in with Admin credentials.
2. Go to **Policy Documents** to upload official PDFs (e.g., Exam rules, Hostel guidelines) which are immediately indexed.
3. Manage active/inactive status of documents.
4. Review and resolve student grievances and maintenance reports on the **Admin Dashboard**.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, TypeScript, TailwindCSS, Lucide Icons, Framer Motion, Radix UI.
* **PDF Parser:** `pdfjs-dist` (Version 6, bundled using Vite workers).
* **State & Persistence:** React Context API synced dynamically with browser `localStorage`.
* **AI Orchestration:** Azure OpenAI API (GPT-4 mini) and Gemini 1.5 Flash (for proof validation).
* **Backend:** Node.js, Express.js (runs API routes for LangGraph workflows and notifications).
* **Communication APIs:** Twilio WhatsApp API, Telegram Share API, QR Code API.

---

## 🏗️ Architecture Overview

```
[Student / Admin UI (React SPA)] ──(Context Store)──> [localStorage Persistence]
       │
       ├──(PDF Ingestion)──> [pdfjs-dist Parser] ──> [Plain Text Metadata]
       │
       ├──(Direct AI Queries)──> [Azure OpenAI GPT-4 mini / Gemini API]
       │
       └──(Endpoints)──> [Express.js Backend] ──> [Twilio / WhatsApp Alert Service]
```

---

## 🚀 Installation & Quick Start

### Prerequisites
* **Node.js:** `Version >= 18.x`
* **npm:** `Version >= 9.x`

### Setup Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shreyanshsharma-1210/Mythos_Campus_Ops.git
   cd Mythos_Campus_Ops
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Setup environment variables:**
   Copy the `env` template file to `.env` (which is git-ignored for security):
   ```bash
   cp env .env
   ```
   Open `.env` and fill in your Azure OpenAI keys and endpoint credentials.

4. **Run in development mode:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.


---

## 🔮 Future Scope
* **Vector Database Integration:** Transition from in-memory injection to vector stores (such as Pinecone or pgvector) for highly scalable policy documents.
* **Live Notifications:** Real-time push alerts using WebSockets or Firebase Cloud Messaging.
* **Authentication Hardening:** Move from client-side mock auth to full OAuth2 and session token validation.
* **Multi-tenant Support:** Generalize the workspace to support multiple campus centers under a single system instance.
