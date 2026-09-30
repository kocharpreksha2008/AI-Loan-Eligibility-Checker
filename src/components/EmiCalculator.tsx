import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PieChart as PieIcon,
  Table as TableIcon,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { calculateEmiFormula, formatCurrency, formatNumber, generateAmortizationSchedule } from '../utils/formatters';

export const EmiCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(2000000);
  const [interestRate, setInterestRate] = useState<number>(8.75);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [tenureMode, setTenureMode] = useState<'years' | 'months'>('years');
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [extraPrepayment, setExtraPrepayment] = useState<number>(0);

  const totalTenureMonths = tenureMode === 'years' ? tenureYears * 12 : tenureYears;

  // Calculation results
  const { monthlyEmi, totalInterest, totalAmount } = useMemo(() => {
    return calculateEmiFormula(loanAmount, interestRate, totalTenureMonths);
  }, [loanAmount, interestRate, totalTenureMonths]);

  // Prepayment simulation calculation
  const prepaymentImpact = useMemo(() => {
    if (extraPrepayment <= 0 || monthlyEmi <= 0) return null;
    let balance = loanAmount;
    const monthlyRate = interestRate / (12 * 100);
    const newMonthlyPayment = monthlyEmi + extraPrepayment;
    let monthsElapsed = 0;
    let newTotalInterest = 0;

    while (balance > 0 && monthsElapsed < totalTenureMonths) {
      monthsElapsed++;
      const interestForMonth = balance * monthlyRate;
      newTotalInterest += interestForMonth;
      const principalForMonth = Math.min(balance, newMonthlyPayment - interestForMonth);
      balance -= principalForMonth;
      if (balance <= 0) break;
    }

    const monthsSaved = Math.max(0, totalTenureMonths - monthsElapsed);
    const interestSaved = Math.max(0, totalInterest - Math.round(newTotalInterest));

    return {
      newMonths: monthsElapsed,
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
      interestSaved,
    };
  }, [loanAmount, interestRate, totalTenureMonths, monthlyEmi, totalInterest, extraPrepayment]);

  // Percentages for Donut chart
  const principalPct = totalAmount > 0 ? (loanAmount / totalAmount) * 100 : 50;
  const interestPct = totalAmount > 0 ? (totalInterest / totalAmount) * 100 : 50;

  // Donut SVG circumference calculation
  // radius = 60, circumference = 2 * PI * 60 ≈ 377
  const circumference = 377;
  const principalStroke = (principalPct / 100) * circumference;
  const interestStroke = (interestPct / 100) * circumference;

  // Amortization schedule data
  const schedule = useMemo(() => {
    if (!showAmortization) return [];
    return generateAmortizationSchedule(loanAmount, interestRate, totalTenureMonths);
  }, [showAmortization, loanAmount, interestRate, totalTenureMonths]);

  // Aggregated yearly schedule for compact reading
  const yearlySchedule = useMemo(() => {
    if (schedule.length === 0) return [];
    const yearlyMap = new Map<number, { year: number; principal: number; interest: number; balance: number }>();
    schedule.forEach((item) => {
      const existing = yearlyMap.get(item.year) || {
        year: item.year,
        principal: 0,
        interest: 0,
        balance: item.closingBalance,
      };
      existing.principal += item.principalPaid;
      existing.interest += item.interestPaid;
      existing.balance = item.closingBalance;
      yearlyMap.set(item.year, existing);
    });
    return Array.from(yearlyMap.values());
  }, [schedule]);

  return (
    <section id="emi" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
            Tool 03 · Mathematical Modeling
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive EMI Calculator
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Simulate standard reducing-balance Equated Monthly Installments (EMI) with precision principal vs. interest breakdown and prepayment savings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders & Inputs Column */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-7">
            {/* Control 1: Loan Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Loan Principal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                    step="50000"
                    min="10000"
                    max="50000000"
                    className="glass-input pl-7 pr-3 py-1.5 rounded-lg text-sm font-mono font-bold text-white w-40 text-right tabular-nums"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="20000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>₹50K</span>
                <span>₹50L</span>
                <span>₹1 Cr</span>
                <span>₹2 Cr</span>
              </div>
            </div>

            {/* Control 2: Interest Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Annual Interest Rate (% p.a.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                    step="0.05"
                    min="4"
                    max="30"
                    className="glass-input pr-7 pl-3 py-1.5 rounded-lg text-sm font-mono font-bold text-white w-32 text-right tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs font-mono">%</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>5% (Home Loan Prime)</span>
                <span>10.5% (Personal)</span>
                <span>16% (Unsecured)</span>
                <span>20%</span>
              </div>
            </div>

            {/* Control 3: Loan Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Loan Tenure
                  </label>
                  <div className="flex p-0.5 rounded-lg bg-slate-800/80 border border-white/5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTenureMode('years')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        tenureMode === 'years' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => setTenureMode('months')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        tenureMode === 'months' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      Months
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                    step="1"
                    min="1"
                    max={tenureMode === 'years' ? 30 : 360}
                    className="glass-input pr-10 pl-3 py-1.5 rounded-lg text-sm font-mono font-bold text-white w-32 text-right tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs font-mono">
                    {tenureMode === 'years' ? 'Yrs' : 'Mos'}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max={tenureMode === 'years' ? 30 : 360}
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>1 {tenureMode === 'years' ? 'Yr' : 'Mo'}</span>
                <span>{tenureMode === 'years' ? '15 Yrs' : '180 Mos'}</span>
                <span>{tenureMode === 'years' ? '30 Yrs' : '360 Mos'}</span>
              </div>
            </div>

            {/* Formula Reference Tag */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Standard Reducing EMI Formula</span>
              </span>
              <p className="font-mono text-[11px] text-cyan-300/90 pt-0.5">
                EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)
              </p>
              <p className="text-[11px] text-slate-400">
                P = {formatCurrency(loanAmount)} · r = {(interestRate / 12).toFixed(3)}% monthly · n = {totalTenureMonths} months
              </p>
            </div>

            {/* Prepayment Simulator Drawer */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Extra Monthly Prepayment Simulator</span>
                  <p className="text-[11px] text-slate-400">See how paying extra principal cuts total interest & tenure</p>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-mono">+₹</span>
                  <input
                    type="number"
                    value={extraPrepayment || ''}
                    onChange={(e) => setExtraPrepayment(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    step="500"
                    min="0"
                    className="glass-input pl-8 pr-2.5 py-1 rounded-lg text-xs font-mono text-white w-28 text-right tabular-nums"
                  />
                </div>
              </div>

              {prepaymentImpact && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <span>
                      Save <strong>{formatCurrency(prepaymentImpact.interestSaved)}</strong> in interest!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-200">
                    Tenure shortened by {prepaymentImpact.yearsSaved} yrs ({prepaymentImpact.monthsSaved} mos)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results & Visual Breakdown Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
              {/* Highlight Card: Monthly EMI */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 text-center space-y-1 shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Calculated Monthly EMI
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {formatCurrency(monthlyEmi)}
                  <span className="text-sm font-normal text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  for {totalTenureMonths} installments ({Math.round(totalTenureMonths / 12)} years)
                </p>
              </div>

              {/* Total Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-xs text-slate-400">Principal Amount</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono tabular-nums">
                    {formatCurrency(loanAmount)}
                  </p>
                  <span className="text-[11px] text-slate-400">{principalPct.toFixed(1)}% of total</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    <span className="text-xs text-slate-400">Total Interest</span>
                  </div>
                  <p className="text-base font-bold text-teal-300 font-mono tabular-nums">
                    {formatCurrency(totalInterest)}
                  </p>
                  <span className="text-[11px] text-slate-400">{interestPct.toFixed(1)}% of total</span>
                </div>
              </div>

              {/* Total Payable Summary */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Repayment Amount</span>
                  <p className="text-lg font-bold text-white font-mono tabular-nums">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Effective Cost</span>
                  <p className="text-xs font-mono text-cyan-300">
                    +{(interestPct).toFixed(1)}% above principal
                  </p>
                </div>
              </div>

              {/* Visual Breakdown Donut Chart */}
              <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 flex items-center justify-center gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                    {/* Principal Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      stroke="#06b6d4"
                      strokeWidth="16"
                      strokeDasharray={`${principalStroke} ${circumference}`}
                      strokeDashoffset="0"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                    {/* Interest Arc */}
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      stroke="#2dd4bf"
                      strokeWidth="16"
                      strokeDasharray={`${interestStroke} ${circumference}`}
                      strokeDashoffset={-principalStroke}
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <PieIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-0.5">Breakdown</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-400" />
                    <span className="text-slate-300">Principal: {principalPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-teal-400" />
                    <span className="text-slate-300">Interest: {interestPct.toFixed(1)}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-snug">
                    As tenure expands, interest components often exceed the original loan amount.
                  </p>
                </div>
              </div>

              {/* Toggle Amortization Schedule Table */}
              <button
                type="button"
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showAmortization ? 'Hide Amortization Schedule' : 'View Yearly Amortization Schedule'}</span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Drawer Table */}
        {showAmortization && (
          <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h4 className="text-base font-bold text-white">Yearly Amortization Schedule</h4>
                <p className="text-xs text-slate-400">Step-by-step reduction of principal balance over time</p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {yearlySchedule.length} Financial Years
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3 text-right">Principal Paid</th>
                    <th className="px-4 py-3 text-right">Interest Paid</th>
                    <th className="px-4 py-3 text-right">Total Annual Payment</th>
                    <th className="px-4 py-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 tabular-nums">
                  {yearlySchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-white">Year {row.year}</td>
                      <td className="px-4 py-2.5 text-right text-cyan-300">
                        {formatCurrency(row.principal)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-teal-300">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-white">
                        {formatCurrency(row.principal + row.interest)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
