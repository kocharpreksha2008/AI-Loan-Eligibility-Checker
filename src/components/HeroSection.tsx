import React from 'react';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface HeroSectionProps {
  onCheckEligibilityClick: () => void;
  onCalculateEmiClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCheckEligibilityClick,
  onCalculateEmiClick,
}) => {
  return (
    <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen BFSI Financial Intelligence Engine</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
                Make Smarter Financial Decisions with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                  AI
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Check your loan eligibility, analyze your credit score, calculate EMIs, and receive personalized financial insights in one intelligent platform.
              </p>
            </div>

            {/* Two Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onCheckEligibilityClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
              >
                <span>Check Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onCalculateEmiClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Calculate EMI</span>
              </button>
            </div>

            {/* Domain trust indicators */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Standard FOIR Banking Formulas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Educational Non-Guaranteed Insights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Live Amortization Modeling</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Fintech / AI Visual Card Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Container with dark glassmorphism */}
            <div className="w-full max-w-md relative">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-3xl blur-xl opacity-75" />

              {/* Main glass card */}
              <div className="relative glass-panel rounded-2xl p-6 border border-white/15 space-y-6 shadow-2xl">
                {/* Header of the mock console */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Underwriting Analysis</h3>
                      <p className="text-xs text-slate-400">Real-time BFSI engine</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    High Eligibility
                  </span>
                </div>

                {/* Score and Metric highlights */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">Credit Score</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white font-mono tabular-nums">782</span>
                      <span className="text-xs text-emerald-400 font-medium">Prime</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[85%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-xs text-slate-400">DTI / FOIR Ratio</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white font-mono tabular-nums">34.2%</span>
                      <span className="text-xs text-teal-400 font-medium">Safe</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-full w-[45%]" />
                    </div>
                  </div>
                </div>

                {/* Simulated Loan Profile breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Max Borrowing Capacity</span>
                    <span className="font-semibold text-white font-mono tabular-nums">{formatCurrency(3250000)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Monthly EMI</span>
                    <span className="font-semibold text-cyan-300 font-mono tabular-nums">{formatCurrency(26450)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Monthly Disposable Buffer</span>
                    <span className="font-semibold text-emerald-400 font-mono tabular-nums">+{formatCurrency(41200)}</span>
                  </div>
                </div>

                {/* AI Underwriter preview bubble */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex gap-3 items-start">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-cyan-200">AI Assessment:</span> Applicant qualifies for tier-1 preferential lending spread with 0.50% interest rate rebate.
                  </p>
                </div>
              </div>

              {/* Floating secondary badge */}
              <div className="absolute -bottom-4 -left-4 glass-panel px-3.5 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-200 font-medium">Google Sheets Live Sync Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
