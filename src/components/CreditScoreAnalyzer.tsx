import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Info,
  TrendingUp,
  Percent,
  Layers,
  Search
} from 'lucide-react';
import { CreditAnalysisInput, CreditAnalysisResult } from '../types';

export const CreditScoreAnalyzer: React.FC = () => {
  const [inputs, setInputs] = useState<CreditAnalysisInput>({
    creditScore: 745,
    paymentHistoryPct: 99,
    creditUtilizationPct: 24,
    activeLoans: 1,
    totalCreditAccounts: 4,
    recentInquiries: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CreditAnalysisResult | null>(null);

  // Quick presets
  const presets = [
    {
      label: 'Prime Tier (785)',
      data: {
        creditScore: 785,
        paymentHistoryPct: 100,
        creditUtilizationPct: 15,
        activeLoans: 2,
        totalCreditAccounts: 6,
        recentInquiries: 0,
      },
    },
    {
      label: 'Average Profile (680)',
      data: {
        creditScore: 680,
        paymentHistoryPct: 96,
        creditUtilizationPct: 38,
        activeLoans: 2,
        totalCreditAccounts: 3,
        recentInquiries: 2,
      },
    },
    {
      label: 'Needs Repair (590)',
      data: {
        creditScore: 590,
        paymentHistoryPct: 91,
        creditUtilizationPct: 72,
        activeLoans: 4,
        totalCreditAccounts: 5,
        recentInquiries: 5,
      },
    },
  ];

  const handleSliderChange = (name: keyof CreditAnalysisInput, val: number) => {
    setInputs((prev) => ({ ...prev, [name]: val }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/credit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
      } else {
        alert(data.error || 'Failed to analyze credit score.');
      }
    } catch {
      // Fallback evaluation
      const score = inputs.creditScore;
      let tier = 'Fair';
      let color = '#f59e0b';
      if (score >= 800) {
        tier = 'Excellent';
        color = '#10b981';
      } else if (score >= 740) {
        tier = 'Very Good';
        color = '#06b6d4';
      } else if (score >= 670) {
        tier = 'Good';
        color = '#3b82f6';
      } else if (score >= 580) {
        tier = 'Fair';
        color = '#f59e0b';
      } else {
        tier = 'Poor';
        color = '#ef4444';
      }

      setAnalysis({
        success: true,
        score,
        tier,
        color,
        positiveFactors: [
          inputs.paymentHistoryPct >= 98
            ? 'Exceptional 98%+ on-time repayment history.'
            : 'Account vintage is building steadily.',
          inputs.creditUtilizationPct <= 30
            ? 'Low credit card revolving utilization (<30%).'
            : 'Multiple active account relationships.',
        ],
        areasForImprovement: [
          inputs.creditUtilizationPct > 30
            ? `Credit utilization of ${inputs.creditUtilizationPct}% is above the optimal 30% guideline.`
            : 'Maintaining consistent zero-delinquency streak.',
          inputs.recentInquiries > 2
            ? `${inputs.recentInquiries} inquiries recorded in the last 6 months.`
            : 'Continue diversifying credit mix.',
        ],
        educationalTips: [
          'Pay credit card balances prior to statement cut-off date to report lower utilization.',
          'Keep oldest accounts open even if unused to protect credit history length.',
          'Consolidate high-interest debt into structured installment terms.',
        ],
        aiInsight: `A ${tier} rating of ${score} puts you in a favorable position for competitive prime lending spreads. Maintain utilization under 30% to maximize rate negotiation leverage.`,
        disclaimer: 'This analysis is informational and educational only. It is not an official credit bureau report.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on first render
  React.useEffect(() => {
    handleAnalyze();
  }, []);

  // Compute circular gauge angles
  // Score range: 300 to 900 (span: 600)
  const currentScore = inputs.creditScore;
  const scorePct = Math.min(100, Math.max(0, ((currentScore - 300) / 600) * 100));
  const strokeDashoffset = 440 - (440 * scorePct) / 100;

  return (
    <section id="credit" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
              Tool 02 · Credit Bureau Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Credit Score Analyzer
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Inspect how payment timeliness, revolving utilization, credit age, and recent inquiries impact your overall bureau rating and borrowing terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Sample Profiles:</span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setInputs(preset.data);
                  setTimeout(handleAnalyze, 50);
                }}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-lg transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Credit Parameters & Behavior Inputs</span>
            </h3>

            {/* Slider 1: Credit Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Credit Score</span>
                <span className="font-mono text-cyan-300 font-bold text-base tabular-nums">
                  {inputs.creditScore}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="5"
                value={inputs.creditScore}
                onChange={(e) => handleSliderChange('creditScore', Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>300</span>
                <span>580</span>
                <span>670</span>
                <span>740</span>
                <span>900</span>
              </div>
            </div>

            {/* Slider 2: Payment History % */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Payment History Track Record</span>
                <span className="font-mono text-teal-300 font-bold tabular-nums">
                  {inputs.paymentHistoryPct}% on-time
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                step="1"
                value={inputs.paymentHistoryPct}
                onChange={(e) => handleSliderChange('paymentHistoryPct', Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-red-400">70% (Delinquent)</span>
                <span className="text-emerald-400">100% (Flawless)</span>
              </div>
            </div>

            {/* Slider 3: Credit Utilization % */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Revolving Credit Card Utilization</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    inputs.creditUtilizationPct <= 30
                      ? 'text-emerald-400'
                      : inputs.creditUtilizationPct <= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {inputs.creditUtilizationPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={inputs.creditUtilizationPct}
                onChange={(e) => handleSliderChange('creditUtilizationPct', Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400">0% - 30% (Optimal)</span>
                <span className="text-amber-400">30% - 50%</span>
                <span className="text-red-400">&gt;50% (High Risk)</span>
              </div>
            </div>

            {/* Grid of Number Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Active Loans
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={inputs.activeLoans}
                  onChange={(e) => handleSliderChange('activeLoans', Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Total Accounts
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={inputs.totalCreditAccounts}
                  onChange={(e) => handleSliderChange('totalCreditAccounts', Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Recent Inquiries
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={inputs.recentInquiries}
                  onChange={(e) => handleSliderChange('recentInquiries', Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-slate-950 font-semibold bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Health Analytics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recalculate Health Report</span>
                </>
              )}
            </button>
          </div>

          {/* Visual Gauge & Health Insights Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
              {/* Circular Gauge Score Meter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                    {/* Background circle track */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={analysis?.color || '#06b6d4'}
                      strokeWidth="12"
                      strokeDasharray="440"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      {inputs.creditScore}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1"
                      style={{
                        color: analysis?.color || '#06b6d4',
                        backgroundColor: `${analysis?.color || '#06b6d4'}20`,
                      }}
                    >
                      {analysis?.tier || 'Good'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Bureau Health Rating
                  </span>
                  <h4 className="text-2xl font-bold text-white">
                    {analysis?.tier} Credit Tier
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Scores above 740 unlock top-tier interest rate discounts from institutional banks and NBFCs, saving lakhs in long-term borrowing costs.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span>Range: 300 - 900</span>
                    <span>·</span>
                    <span className="text-cyan-400">Top {(100 - scorePct * 0.7).toFixed(0)}% Rank</span>
                  </div>
                </div>
              </div>

              {/* Positive Factors */}
              {analysis?.positiveFactors && analysis.positiveFactors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Positive Profile Strengths</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {analysis.positiveFactors.map((factor, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/10">
                        <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {analysis?.areasForImprovement && analysis.areasForImprovement.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Areas Requiring Attention</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {analysis.areasForImprovement.map((area, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/10">
                        <span className="text-amber-400 mt-0.5 font-bold">!</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Educational Suggestions */}
              {analysis?.educationalTips && analysis.educationalTips.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Actionable Recommendations</span>
                  </h5>
                  <ul className="space-y-1.5">
                    {analysis.educationalTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-500/10">
                        <span className="text-cyan-400 mt-0.5 font-bold">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Expert Insight */}
              {analysis?.aiInsight && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex gap-2.5 items-start">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-300">Underwriter Note: </strong>
                    {analysis.aiInsight}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-white/5">
                <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>
                  {analysis?.disclaimer ||
                    'This analysis is informational and educational only. It is not an official credit bureau report.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
