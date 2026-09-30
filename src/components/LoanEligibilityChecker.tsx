import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Save,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Percent,
  Wallet,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { LoanInputData, LoanEvaluationResult } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface LoanEligibilityCheckerProps {
  onSaveRecord: (recordData: any) => void;
  onAskAiWithContext: (context: any, defaultQuery?: string) => void;
}

export const LoanEligibilityChecker: React.FC<LoanEligibilityCheckerProps> = ({
  onSaveRecord,
  onAskAiWithContext,
}) => {
  const initialForm: LoanInputData = {
    userName: 'Karan Mehra',
    monthlyIncome: 85000,
    employmentType: 'Salaried',
    age: 29,
    existingEmi: 12000,
    loanAmount: 1800000,
    loanTenureYears: 5,
    creditScore: 760,
    monthlyExpenses: 25000,
    dependents: 1,
    interestRate: 10.5,
  };

  const [formData, setFormData] = useState<LoanInputData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LoanEvaluationResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preset scenarios for instant testing
  const presets = [
    {
      label: 'Prime Salaried',
      data: {
        userName: 'Aarav Sharma',
        monthlyIncome: 120000,
        employmentType: 'Salaried',
        age: 32,
        existingEmi: 10000,
        loanAmount: 2500000,
        loanTenureYears: 7,
        creditScore: 795,
        monthlyExpenses: 30000,
        dependents: 1,
        interestRate: 9.5,
      },
    },
    {
      label: 'Moderate Freelancer',
      data: {
        userName: 'Sneha Rao',
        monthlyIncome: 70000,
        employmentType: 'Freelancer',
        age: 27,
        existingEmi: 15000,
        loanAmount: 1500000,
        loanTenureYears: 5,
        creditScore: 710,
        monthlyExpenses: 22000,
        dependents: 0,
        interestRate: 11.0,
      },
    },
    {
      label: 'High Debt Burden',
      data: {
        userName: 'Vikram Joshi',
        monthlyIncome: 45000,
        employmentType: 'Self-Employed Business',
        age: 38,
        existingEmi: 22000,
        loanAmount: 1800000,
        loanTenureYears: 4,
        creditScore: 620,
        monthlyExpenses: 20000,
        dependents: 3,
        interestRate: 13.5,
      },
    },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Monthly income must be greater than zero.';
    }
    if (!formData.loanAmount || formData.loanAmount <= 0) {
      newErrors.loanAmount = 'Loan amount must be greater than zero.';
    }
    if (!formData.loanTenureYears || formData.loanTenureYears < 1 || formData.loanTenureYears > 30) {
      newErrors.loanTenureYears = 'Tenure must be between 1 and 30 years.';
    }
    if (!formData.creditScore || formData.creditScore < 300 || formData.creditScore > 900) {
      newErrors.creditScore = 'Credit score must be between 300 and 900.';
    }
    if (formData.age < 18 || formData.age > 75) {
      newErrors.age = 'Applicant age must be between 18 and 75.';
    }
    if (formData.existingEmi < 0) {
      newErrors.existingEmi = 'Existing EMI cannot be negative.';
    }
    if (formData.monthlyExpenses < 0) {
      newErrors.monthlyExpenses = 'Monthly expenses cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      'monthlyIncome',
      'age',
      'existingEmi',
      'loanAmount',
      'loanTenureYears',
      'creditScore',
      'monthlyExpenses',
      'dependents',
      'interestRate',
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? 0 : Number(value)) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/loan/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          loanTenureMonths: formData.loanTenureYears * 12,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Evaluation failed.');
      }
    } catch (err: any) {
      // Fallback client-side calculation if offline
      const income = Number(formData.monthlyIncome);
      const loanAmt = Number(formData.loanAmount);
      const months = Number(formData.loanTenureYears) * 12;
      const rate = Number(formData.interestRate) || 10.5;
      const monthlyRate = rate / (12 * 100);
      const factor = Math.pow(1 + monthlyRate, months);
      const estimatedEmi = Math.round((loanAmt * monthlyRate * factor) / (factor - 1));
      const totalEmi = Number(formData.existingEmi) + estimatedEmi;
      const dtiRatio = (totalEmi / income) * 100;
      const expenseRatio = ((Number(formData.monthlyExpenses) + totalEmi) / income) * 100;
      const netDiscretionary = income - (totalEmi + Number(formData.monthlyExpenses));
      const maxAllowedEmiCap = Math.max(0, income * 0.50 - Number(formData.existingEmi));
      const maxAffordablePrincipal = Math.round((maxAllowedEmiCap * (factor - 1)) / (monthlyRate * factor));

      let status: 'High' | 'Moderate' | 'Low' = 'Low';
      let explanation = '';
      if (dtiRatio <= 40 && formData.creditScore >= 740) {
        status = 'High';
        explanation = 'Your DTI ratio is within prime banking norms (<40%) and your credit score indicates strong creditworthiness.';
      } else if (dtiRatio <= 50 && formData.creditScore >= 650) {
        status = 'Moderate';
        explanation = 'Moderate eligibility: DTI is borderline (<50%) and credit score meets minimum institutional underwriting thresholds.';
      } else {
        status = 'Low';
        explanation = 'Elevated DTI ratio or credit score below prime tiers indicates repayment stress. Consider lowering loan amount or extending tenure.';
      }

      setResult({
        success: true,
        eligibilityStatus: status,
        estimatedEmi,
        totalEmi,
        dtiRatio: parseFloat(dtiRatio.toFixed(2)),
        expenseRatio: parseFloat(expenseRatio.toFixed(2)),
        netDiscretionary,
        maxAllowedEmiCap,
        maxAffordablePrincipal: Math.max(0, maxAffordablePrincipal),
        explanation,
        keyFactors: [
          `Projected total debt obligation: ${formatCurrency(totalEmi)}/month`,
          `DTI / FOIR ratio: ${dtiRatio.toFixed(1)}% (Banking benchmark ceiling: 50%)`,
          `Monthly cash surplus: ${formatCurrency(netDiscretionary)}`,
        ],
        disclaimer: 'These results are an educational estimate and do not guarantee loan approval.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToRecords = () => {
    if (!result) return;
    onSaveRecord({
      userName: formData.userName || 'Anonymous Applicant',
      monthlyIncome: formData.monthlyIncome,
      loanAmount: formData.loanAmount,
      loanTenureMonths: formData.loanTenureYears * 12,
      creditScore: formData.creditScore,
      existingEmi: formData.existingEmi,
      estimatedEmi: result.estimatedEmi,
      dtiRatio: result.dtiRatio,
      eligibilityResult: result.eligibilityStatus,
      employmentType: formData.employmentType,
      notes: `Evaluated with age ${formData.age}, ${formData.dependents} dependents`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAskAi = () => {
    if (!result) return;
    const context = {
      monthlyIncome: formData.monthlyIncome,
      existingEmi: formData.existingEmi,
      loanAmount: formData.loanAmount,
      creditScore: formData.creditScore,
      eligibilityStatus: result.eligibilityStatus,
      dtiRatio: result.dtiRatio,
    };
    const defaultQuery = `I was assessed with ${result.eligibilityStatus} eligibility for a ₹${formatNumber(
      formData.loanAmount
    )} loan. My DTI is ${result.dtiRatio}%. What specific steps should I take to improve my loan approval chances and optimize my interest rate?`;
    onAskAiWithContext(context, defaultQuery);
  };

  return (
    <section id="eligibility" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
              Tool 01 · Underwriting Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Loan Eligibility Checker
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Enter your income, obligations, and requested terms to compute your Debt-to-Income (DTI) ratio, estimated EMI, and institutional approval likelihood.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Load Preset:</span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFormData(preset.data);
                  setResult(null);
                }}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-lg transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl">
            <form onSubmit={handleEvaluate} className="space-y-6">
              {/* Row 1: Applicant Name & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Applicant Name / ID
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="e.g. Karan Mehra"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="Salaried" className="bg-slate-900">Salaried (Corporate/Govt)</option>
                    <option value="Self-Employed Professional" className="bg-slate-900">Self-Employed Professional (Doctor/CA/Lawyer)</option>
                    <option value="Self-Employed Business" className="bg-slate-900">Self-Employed Business Owner</option>
                    <option value="Freelancer" className="bg-slate-900">Independent Consultant / Freelancer</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Monthly Income & Existing EMIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Net Monthly In-Hand Income (₹) <span className="text-cyan-400">*</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 75000"
                    min="1"
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums ${
                      errors.monthlyIncome ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.monthlyIncome && (
                    <p className="text-xs text-red-400 mt-1">{errors.monthlyIncome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Existing Monthly EMIs (₹)
                  </label>
                  <input
                    type="number"
                    name="existingEmi"
                    value={formData.existingEmi}
                    onChange={handleInputChange}
                    placeholder="0 if none"
                    min="0"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Row 3: Requested Loan Amount & Tenure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Loan Amount Required (₹) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 1500000"
                    step="10000"
                    min="10000"
                    className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums ${
                      errors.loanAmount ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.loanAmount && (
                    <p className="text-xs text-red-400 mt-1">{errors.loanAmount}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Loan Tenure ({formData.loanTenureYears} Years / {formData.loanTenureYears * 12} Mo)
                    </label>
                  </div>
                  <input
                    type="range"
                    name="loanTenureYears"
                    min="1"
                    max="30"
                    step="1"
                    value={formData.loanTenureYears}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>1 yr</span>
                    <span>15 yrs</span>
                    <span>30 yrs</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Credit Score & Indicative Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Credit Score (300 - 900) <span className="text-cyan-400">*</span>
                    </label>
                    <span className="text-xs font-mono text-cyan-300 tabular-nums">
                      {formData.creditScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    name="creditScore"
                    min="300"
                    max="900"
                    step="5"
                    value={formData.creditScore}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span className="text-red-400">300 (Poor)</span>
                    <span className="text-amber-400">650</span>
                    <span className="text-emerald-400">900 (Excellent)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Indicative Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    step="0.1"
                    min="5"
                    max="25"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Row 5: Age, Monthly Expenses, Dependents */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="75"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly Expenses (₹)
                  </label>
                  <input
                    type="number"
                    name="monthlyExpenses"
                    value={formData.monthlyExpenses}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Dependents
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl text-slate-950 font-semibold bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Financial Indicators...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Loan Eligibility</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    result.eligibilityStatus === 'High'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : result.eligibilityStatus === 'Moderate'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.eligibilityStatus === 'High' && (
                      <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />
                    )}
                    {result.eligibilityStatus === 'Moderate' && (
                      <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                    )}
                    {result.eligibilityStatus === 'Low' && (
                      <XCircle className="w-7 h-7 text-red-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                        Institutional Verdict
                      </span>
                      <h4 className="text-xl font-bold tracking-tight">
                        {result.eligibilityStatus} Eligibility
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs opacity-75">Projected DTI</span>
                    <p className="text-lg font-mono font-bold tabular-nums">
                      {result.dtiRatio}%
                    </p>
                  </div>
                </div>

                {/* Key Underwriting Indicators */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-xs text-slate-400">Estimated New EMI</span>
                    <p className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                      {formatCurrency(result.estimatedEmi)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-xs text-slate-400">Total Monthly Debt</span>
                    <p className="text-lg font-bold text-cyan-300 font-mono tabular-nums mt-0.5">
                      {formatCurrency(result.totalEmi)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-xs text-slate-400">Max Affordable Loan</span>
                    <p className="text-lg font-bold text-teal-300 font-mono tabular-nums mt-0.5">
                      {formatCurrency(result.maxAffordablePrincipal)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-xs text-slate-400">Monthly Cash Buffer</span>
                    <p
                      className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                        result.netDiscretionary >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(result.netDiscretionary)}
                    </p>
                  </div>
                </div>

                {/* Underwriting Rationale / Explanation */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Why You Received This Result</span>
                  </h5>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                    {result.explanation}
                  </p>
                </div>

                {/* Key Drivers / Actions */}
                {result.keyFactors && result.keyFactors.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Key Underwriting Factors & Recommendations
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {result.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mandatory Educational Disclaimer */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    <strong className="text-amber-300">Important Disclaimer:</strong> {result.disclaimer}
                  </p>
                </div>

                {/* Action Buttons: Save to Sheets / Ask AI */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToRecords}
                    disabled={savedSuccess}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{savedSuccess ? 'Saved to Records & Sheets!' : 'Save Assessment Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAskAi}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Consult AI Assistant</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Placeholder */
              <div className="glass-panel rounded-2xl p-8 border border-white/10 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <Wallet className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-semibold text-white">
                  Awaiting Applicant Information
                </h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Fill in your income, monthly expenses, existing loan EMIs, and requested loan terms to generate your comprehensive eligibility score.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400/80">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant FOIR & DTI ratio calculation</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
