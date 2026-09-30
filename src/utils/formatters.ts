export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

export function calculateEmiFormula(principal: number, annualRatePct: number, tenureMonths: number): {
  monthlyEmi: number;
  totalInterest: number;
  totalAmount: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalAmount: 0 };
  }
  if (annualRatePct <= 0) {
    const monthlyEmi = Math.round(principal / tenureMonths);
    return { monthlyEmi, totalInterest: 0, totalAmount: principal };
  }

  const monthlyRate = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const monthlyEmi = Math.round(emi);
  const totalAmount = Math.round(monthlyEmi * tenureMonths);
  const totalInterest = Math.max(0, totalAmount - principal);

  return { monthlyEmi, totalInterest, totalAmount };
}

export function generateAmortizationSchedule(principal: number, annualRatePct: number, tenureMonths: number) {
  const schedule = [];
  let balance = principal;
  const monthlyRate = annualRatePct / (12 * 100);
  const { monthlyEmi } = calculateEmiFormula(principal, annualRatePct, tenureMonths);

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPaid = Math.round(balance * monthlyRate);
    const principalPaid = Math.min(balance, monthlyEmi - interestPaid);
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      month,
      year: Math.ceil(month / 12),
      monthlyEmi,
      principalPaid,
      interestPaid,
      closingBalance: balance,
    });

    if (balance <= 0) break;
  }
  return schedule;
}
