import React from 'react';
import {
  ShieldCheck,
  Cpu,
  FileSpreadsheet,
  Layers,
  Award,
  BookOpen,
  Scale,
  Sparkles
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
            System Architecture & Standards
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            About LoanAI & BFSI Principles
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Designed to bridge the gap between complex retail lending underwriting rules and consumer financial comprehension through automated mathematical modeling and AI analysis.
          </p>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">FOIR / DTI Metric</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fixed Obligation to Income Ratio (FOIR) measures the portion of gross monthly earnings committed to loan EMIs. Indian banks typically mandate a ceiling between 40% and 50%.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Bureau Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Credit bureaus (CIBIL, Experian, Equifax) rate profiles from 300 to 900. Scores above 750 reflect prime creditworthiness, unlocking reduced risk premiums and preferential loan terms.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Financial Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by server-side Gemini 3.8 Flash, the advisory module translates raw numerical ratios into understandable trade-offs, prepayment timelines, and debt management roadmaps.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Google Sheets Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lightweight webhook architecture and formatted CSV streaming enable instant synchronization with Google Sheets for audit histories without exposing sensitive PII.
            </p>
          </div>
        </div>

        {/* Project Technology Flow Blueprint */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">Technical Pipeline & Data Flow</h3>
              <p className="text-xs text-slate-400">Complete end-to-end execution path</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30 self-start sm:self-auto">
              BFSI Standard Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-cyan-400 font-bold font-mono">01. Input</span>
              <p className="text-slate-300 font-medium">User Form Inputs</p>
              <p className="text-[11px] text-slate-400">Income, EMI, score, tenure</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-teal-400 font-bold font-mono">02. Validate</span>
              <p className="text-slate-300 font-medium">Boundary Checks</p>
              <p className="text-[11px] text-slate-400">Sanitized & non-negative</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-blue-400 font-bold font-mono">03. Compute</span>
              <p className="text-slate-300 font-medium">Financial Modeling</p>
              <p className="text-[11px] text-slate-400">DTI, EMI, FOIR, buffer</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-purple-400 font-bold font-mono">04. AI Reason</span>
              <p className="text-slate-300 font-medium">Gemini Underwriter</p>
              <p className="text-[11px] text-slate-400">Contextual advice & drivers</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-amber-400 font-bold font-mono">05. Output</span>
              <p className="text-slate-300 font-medium">Glass UI Cards</p>
              <p className="text-[11px] text-slate-400">Status, meters & breakdowns</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-emerald-400 font-bold font-mono">06. Storage</span>
              <p className="text-slate-300 font-medium">Google Sheets</p>
              <p className="text-[11px] text-slate-400">Live Webhook & CSV vault</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
