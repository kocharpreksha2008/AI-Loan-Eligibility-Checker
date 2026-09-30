import React from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="border-t border-white/5 bg-[#070a10] py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Loan<span className="text-cyan-400">AI</span>
            </span>
            <span className="text-xs text-slate-400 ml-2">
              · BFSI Financial Advisory Suite
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onNavClick('home')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavClick('eligibility')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Loan Eligibility
            </button>
            <button
              onClick={() => onNavClick('credit')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Credit Score
            </button>
            <button
              onClick={() => onNavClick('emi')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              EMI Calculator
            </button>
            <button
              onClick={() => onNavClick('ai-tips')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              AI Tips
            </button>
            <button
              onClick={() => onNavClick('dashboard')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavClick('about')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Statutory Regulatory Notice: </strong>
          LoanAI is an educational financial intelligence platform developed for computational estimation, credit score education, and loan scenario modeling. It does not issue loan approvals, sanction letters, or legal or certified investment advice. Loan terms, interest rates, and final approvals are subject to the underwriting discretion and credit policies of verified lending institutions.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/5 gap-3">
          <p>© {new Date().getFullYear()} LoanAI. All rights reserved.</p>
          <p className="font-mono text-[11px]">BFSI Underwriting Engine · Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
