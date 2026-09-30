export type EligibilityStatus = 'High' | 'Moderate' | 'Low';

export interface LoanInputData {
  userName: string;
  monthlyIncome: number;
  employmentType: string;
  age: number;
  existingEmi: number;
  loanAmount: number;
  loanTenureYears: number;
  creditScore: number;
  monthlyExpenses: number;
  dependents: number;
  interestRate: number;
}

export interface LoanEvaluationResult {
  success: boolean;
  eligibilityStatus: EligibilityStatus;
  estimatedEmi: number;
  totalEmi: number;
  dtiRatio: number;
  expenseRatio: number;
  netDiscretionary: number;
  maxAllowedEmiCap: number;
  maxAffordablePrincipal: number;
  explanation: string;
  keyFactors: string[];
  disclaimer: string;
}

export interface CreditAnalysisInput {
  creditScore: number;
  paymentHistoryPct: number;
  creditUtilizationPct: number;
  activeLoans: number;
  totalCreditAccounts: number;
  recentInquiries: number;
}

export interface CreditAnalysisResult {
  success: boolean;
  score: number;
  tier: string;
  color: string;
  positiveFactors: string[];
  areasForImprovement: string[];
  educationalTips: string[];
  aiInsight: string;
  disclaimer: string;
}

export interface LoanRecord {
  id: string;
  timestamp: string;
  userName: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTenureMonths: number;
  creditScore: number;
  existingEmi: number;
  estimatedEmi: number;
  dtiRatio: number;
  eligibilityResult: EligibilityStatus;
  employmentType?: string;
  syncedToSheets?: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
