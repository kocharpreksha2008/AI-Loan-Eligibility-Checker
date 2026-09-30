/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LoanEligibilityChecker } from './components/LoanEligibilityChecker';
import { CreditScoreAnalyzer } from './components/CreditScoreAnalyzer';
import { EmiCalculator } from './components/EmiCalculator';
import { AiFinancialTips } from './components/AiFinancialTips';
import { RecordsDashboard } from './components/RecordsDashboard';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [aiContext, setAiContext] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState<string>('');

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveRecord = async (recordData: any) => {
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
    } catch (err) {
      console.error('Failed to auto-save record:', err);
    }
  };

  const handleAskAiWithContext = (context: any, defaultQuery?: string) => {
    setAiContext(context);
    if (defaultQuery) {
      setAiQuery(defaultQuery);
    }
    scrollToSection('ai-tips');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onCheckEligibilityClick={() => scrollToSection('eligibility')}
          onCalculateEmiClick={() => scrollToSection('emi')}
        />

        {/* Tool 1: Loan Eligibility Checker */}
        <LoanEligibilityChecker
          onSaveRecord={handleSaveRecord}
          onAskAiWithContext={handleAskAiWithContext}
        />

        {/* Tool 2: Credit Score Analyzer */}
        <CreditScoreAnalyzer />

        {/* Tool 3: EMI Calculator */}
        <EmiCalculator />

        {/* Tool 4: AI Financial Tips */}
        <AiFinancialTips
          externalQuery={aiQuery}
          externalContext={aiContext}
        />

        {/* Dashboard & Google Sheets Records */}
        <RecordsDashboard
          isOpenSheetsModal={isSheetsModalOpen}
          onCloseSheetsModal={() => setIsSheetsModalOpen(false)}
        />

        {/* About & Underwriting Architecture */}
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer onNavClick={scrollToSection} />
    </div>
  );
}
