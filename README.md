# LoanAI - AI Loan Eligibility Checker & Financial Advisory Platform

> **BFSI (Banking, Financial Services and Insurance) Domain Web Application**  
> An intelligent personal finance platform that combines rigorous mathematical loan underwriting rules (FOIR, DTI, amortisation) with server-side AI reasoning (Gemini 3.8 Flash) and Google Sheets integration for audit trails.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Financial Formulas & Underwriting Benchmarks](#financial-formulas--underwriting-benchmarks)
- [Project Directory Structure](#project-directory-structure)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints Documentation](#api-endpoints-documentation)
- [Google Sheets Integration Guide](#google-sheets-integration-guide)
- [Future Enhancements](#future-enhancements)
- [Disclaimer](#disclaimer)

---

## 🌟 Overview

**LoanAI** helps individuals, borrowers, and banking applicants evaluate their loan viability before approaching institutional lenders. By calculating Fixed Obligation to Income Ratios (FOIR), debt-to-income percentages, and bureau health metrics, users avoid unnecessary loan rejections and hard credit inquiry penalties.

### The Four Main Tools

1. **Loan Eligibility Checker**: Multi-parameter form calculating DTI, maximum affordable loan amount, monthly disposable cushion, and institution-grade approval likelihood (High, Moderate, Low) with explainable rationale.
2. **Credit Score Analyzer**: Interactive circular score meter evaluating on-time payment track records, revolving credit utilization, active loans, and recent hard inquiries.
3. **Interactive EMI Calculator**: Reducing-balance installment simulator with real-time principal vs. interest donut charts, yearly amortization schedules, and prepayment interest-saving simulations.
4. **AI Financial Assistant**: Conversational BFSI advisor powered by Gemini 3.8 Flash offering contextual guidance on debt restructuring, FOIR thresholds, and credit repair.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Client Browser                      │
│        (React 19 + Tailwind CSS + Obsidian Glass UI)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Full-Stack Express Server                   │
│                       (server.ts)                           │
│                                                             │
│   ├── /api/loan/evaluate    --> Underwriting Engine         │
│   ├── /api/credit/analyze   --> Bureau Scoring Model        │
│   ├── /api/ai/financial-tips--> Gemini 3.8 Flash SDK        │
│   └── /api/records          --> Storage & Sheets Sync       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌──────────────────────────────┐
│     Google GenAI SDK        ││   Google Sheets Sync Vault   │
│   (Model: gemini-3.8-flash) ││   (Live Webhook & CSV Stream)│
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **AI Engine**: `@google/genai` TypeScript SDK (model `gemini-3.8-flash`) with rule-based fallback
- **Data Persistence**: In-memory + JSON file store (`data/loan_records.json`) + Google Sheets Webhook API
- **Deployment**: Vite build + Node/Express production runner

---

## 📐 Financial Formulas & Underwriting Benchmarks

### 1. Equated Monthly Installment (EMI)
$$\text{EMI} = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$$
- $P$ = Principal loan amount
- $r$ = Monthly interest rate ($\text{Annual Rate} / (12 \times 100)$)
- $n$ = Number of monthly installments

### 2. Debt-To-Income (DTI / FOIR)
$$\text{FOIR} = \frac{\text{Existing EMIs} + \text{Estimated New EMI}}{\text{Net Monthly Income}} \times 100$$
- $\le 40\%$: **Prime Safety Zone** (High Eligibility)
- $40\% - 50\%$: **Borderline Zone** (Moderate Eligibility)
- $> 50\%$: **Repayment Stress Zone** (Low Eligibility)

---

## 📁 Project Directory Structure

```
loan-ai/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                   # Top Bar contract navigation
│   │   ├── HeroSection.tsx              # Hero with dynamic fintech visual
│   │   ├── LoanEligibilityChecker.tsx   # Tool 1: Form & underwriting analysis
│   │   ├── CreditScoreAnalyzer.tsx      # Tool 2: Circular gauge & bureau health
│   │   ├── EmiCalculator.tsx            # Tool 3: Sliders, donut chart & amortization
│   │   ├── AiFinancialTips.tsx          # Tool 4: Chat assistant with Gemini
│   │   ├── RecordsDashboard.tsx         # Vault table & Google Sheets sync
│   │   ├── AboutSection.tsx             # BFSI underwriting concepts & data flow
│   │   └── Footer.tsx                   # Regulatory notices & copyright
│   ├── types/
│   │   └── index.ts                     # TypeScript definitions
│   ├── utils/
│   │   └── formatters.ts                # Currency formatting & EMI algorithms
│   ├── App.tsx                          # Root container & cross-tool state
│   ├── index.css                        # Glassmorphism styling & scrollbars
│   └── main.tsx                         # Client bootstrap
├── data/
│   └── loan_records.json                # Server-side assessment storage
├── server.ts                            # Full-stack Express backend & API endpoints
├── index.html                           # HTML5 entry with fonts & meta tags
├── metadata.json                        # AI Studio app metadata
├── package.json                         # Dependencies & npm scripts
└── README.md                            # Documentation
```

---

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/loan-ai.git
cd loan-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `GEMINI_API_KEY` is present.

### 4. Start the application
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📊 Google Sheets Integration Guide

LoanAI provides two methods for Google Sheets integration:

1. **Instant CSV Export**: Click **"Export Sheets CSV"** to download an audit spreadsheet ready for Google Sheets or Excel import.
2. **Real-time Webhook Push**:
   - Open your Google Sheet, click **Extensions > Apps Script**.
   - Paste the provided Apps Script snippet (available inside the app's Google Sheets Modal).
   - Deploy as a **Web App** with access set to **Anyone**.
   - Paste your Web App URL into the LoanAI sync field. Every evaluation is automatically added as a new row!

---

## 🔮 Future Enhancements

- [ ] **Multi-Bank Rate Comparison**: Live API scraping of current interest rates across SBI, HDFC, ICICI, and Axis Bank.
- [ ] **Property Co-Borrower Stacking**: Support multi-applicant income aggregation for home mortgage evaluations.
- [ ] **Document OCR**: Automated salary slip and bank statement parsing via Gemini Multimodal.
- [ ] **Multilingual Support**: Hindi, Tamil, Telugu, and Spanish localization.

---

## ⚖️ Statutory Disclaimer

*LoanAI is an educational financial intelligence platform developed for computational estimation, credit score education, and loan scenario modeling. It does not issue loan approvals, sanction letters, or legal or certified investment advice. Loan terms, interest rates, and final approvals are subject to the underwriting discretion and credit policies of verified lending institutions.*
