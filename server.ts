import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data storage file path
const DATA_DIR = path.join(__dirname, 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'loan_records.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed initial demo records if file does not exist
if (!fs.existsSync(RECORDS_FILE)) {
  const initialRecords = [
    {
      id: 'REC-1001',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      userName: 'Aarav Sharma',
      monthlyIncome: 75000,
      loanAmount: 1500000,
      loanTenureMonths: 60,
      creditScore: 780,
      existingEmi: 8000,
      estimatedEmi: 32230,
      dtiRatio: 53.64,
      eligibilityResult: 'Moderate',
      employmentType: 'Salaried',
      syncedToSheets: true,
      notes: 'Good credit profile, borderline DTI ratio'
    },
    {
      id: 'REC-1002',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      userName: 'Priya Patel',
      monthlyIncome: 120000,
      loanAmount: 2500000,
      loanTenureMonths: 120,
      creditScore: 815,
      existingEmi: 12000,
      estimatedEmi: 31718,
      dtiRatio: 36.43,
      eligibilityResult: 'High',
      employmentType: 'Salaried',
      syncedToSheets: true,
      notes: 'Strong credit, low DTI, excellent buffer'
    },
    {
      id: 'REC-1003',
      timestamp: new Date().toISOString(),
      userName: 'Rohan Mehta',
      monthlyIncome: 45000,
      loanAmount: 1200000,
      loanTenureMonths: 48,
      creditScore: 610,
      existingEmi: 15000,
      estimatedEmi: 30120,
      dtiRatio: 100.27,
      eligibilityResult: 'Low',
      employmentType: 'Self-Employed Business',
      syncedToSheets: false,
      notes: 'Overburdened with existing commitments and sub-650 score'
    }
  ];
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(initialRecords, null, 2), 'utf-8');
}

function getStoredRecords() {
  try {
    const raw = fs.readFileSync(RECORDS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredRecords(records: any[]) {
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: Calculate EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct <= 0) return principal / tenureMonths;
  const monthlyRate = annualRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

// -------------------------------------------------------------
// API: Loan Eligibility Evaluation with Gemini Reasoning
// -------------------------------------------------------------
app.post('/api/loan/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      monthlyIncome = 0,
      employmentType = 'Salaried',
      age = 30,
      existingEmi = 0,
      loanAmount = 0,
      loanTenureYears = 5,
      loanTenureMonths: customTenureMonths,
      creditScore = 700,
      monthlyExpenses = 0,
      dependents = 0,
      interestRate = 10.5,
    } = req.body;

    const income = Number(monthlyIncome);
    const existEmi = Number(existingEmi);
    const loanAmt = Number(loanAmount);
    const tenureMonths = customTenureMonths ? Number(customTenureMonths) : Number(loanTenureYears) * 12;
    const score = Number(creditScore);
    const expenses = Number(monthlyExpenses);
    const userAge = Number(age);
    const rate = Number(interestRate) || 10.5;

    // Validation
    if (income <= 0) {
      return res.status(400).json({ error: 'Monthly income must be greater than zero.' });
    }
    if (loanAmt <= 0) {
      return res.status(400).json({ error: 'Loan amount must be greater than zero.' });
    }
    if (tenureMonths <= 0 || tenureMonths > 360) {
      return res.status(400).json({ error: 'Tenure must be between 1 and 360 months.' });
    }
    if (score < 300 || score > 900) {
      return res.status(400).json({ error: 'Credit score must be between 300 and 900.' });
    }

    // Mathematical calculations
    const estimatedEmi = calculateEmi(loanAmt, rate, tenureMonths);
    const totalEmi = existEmi + estimatedEmi;
    const dtiRatio = (totalEmi / income) * 100;
    const expenseRatio = ((expenses + totalEmi) / income) * 100;
    const netDiscretionary = income - (totalEmi + expenses);

    // Max affordable EMI (Standard BFSI FOIR cap of 50% of monthly income minus existing commitments)
    const maxAllowedEmiCap = Math.max(0, income * 0.50 - existEmi);
    // Reverse calculate maximum affordable principal
    const monthlyRate = rate / (12 * 100);
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const maxAffordablePrincipal = monthlyRate > 0 && factor > 1
      ? Math.round((maxAllowedEmiCap * (factor - 1)) / (monthlyRate * factor))
      : Math.round(maxAllowedEmiCap * tenureMonths);

    // Baseline eligibility rule classification
    let status: 'High' | 'Moderate' | 'Low' = 'Low';
    let rationale = '';

    if (dtiRatio <= 40 && score >= 740 && netDiscretionary > 0.2 * income) {
      status = 'High';
      rationale = 'Your debt-to-income ratio (DTI) is healthy (<40%) and your credit score is in the prime tier (740+). You have substantial discretionary surplus to service this liability.';
    } else if (dtiRatio <= 50 && score >= 650 && netDiscretionary >= 0) {
      status = 'Moderate';
      rationale = 'Your profile shows moderate eligibility. While the debt burden is manageable (<50% FOIR), your credit score or monthly expense buffer may require tighter scrutiny or co-borrower consideration.';
    } else {
      status = 'Low';
      if (dtiRatio > 50) {
        rationale = `Your projected DTI ratio of ${dtiRatio.toFixed(1)}% exceeds standard banking thresholds (typically capped at 50% FOIR). High existing debt or requested loan size creates repayment strain.`;
      } else if (score < 650) {
        rationale = `Your credit score (${score}) is below standard prime banking tiers (<650), indicating elevated risk to institutional underwriters.`;
      } else {
        rationale = 'Your estimated monthly obligations leave little to no discretionary safety buffer after essential household expenses.';
      }
    }

    // Enhance rationale with Gemini AI if available
    let aiExplanation = rationale;
    let suggestions: string[] = [];

    if (ai) {
      try {
        const prompt = `You are a Senior Risk & Underwriting Financial Analyst for a top BFSI institution.
Provide a concise, professional assessment for this loan applicant:
- Monthly Income: ₹${income.toLocaleString()}
- Existing Monthly EMIs: ₹${existEmi.toLocaleString()}
- Requested Loan: ₹${loanAmt.toLocaleString()} across ${tenureMonths} months at ${rate}% p.a.
- Calculated New EMI: ₹${estimatedEmi.toLocaleString()}
- Total Projected DTI (FOIR): ${dtiRatio.toFixed(1)}%
- Credit Score: ${score} (Scale: 300-900)
- Employment: ${employmentType}, Age: ${userAge}, Dependents: ${dependents}
- Essential Expenses: ₹${expenses.toLocaleString()}
- Baseline Status: ${status}

Provide JSON output in this exact schema:
{
  "summary": "1-2 sentences summarizing the underwriting verdict and primary reason",
  "keyDrivers": ["bullet 1 explaining positive or negative factor", "bullet 2", "bullet 3"],
  "recommendedAction": "1 concrete actionable advice (e.g. increase tenure, add co-borrower, pay off existing loan)"
}
Do not use markdown blocks, output raw JSON only.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.summary) aiExplanation = parsed.summary;
          if (Array.isArray(parsed.keyDrivers)) suggestions = parsed.keyDrivers;
          if (parsed.recommendedAction) suggestions.push(`Recommendation: ${parsed.recommendedAction}`);
        }
      } catch (geminiError) {
        // Fallback to rule-based analysis
        console.warn('Gemini loan analysis fallback triggered:', geminiError);
      }
    }

    if (suggestions.length === 0) {
      suggestions = [
        dtiRatio <= 40 ? 'DTI ratio is within the safe 40% threshold' : 'Consider prepaying existing EMIs to lower DTI below 45%',
        score >= 750 ? 'Strong credit score qualifies you for competitive interest rates' : 'Work on boosting credit score to 750+ to unlock better rates',
        netDiscretionary > 0 ? `Estimated monthly safety margin of ₹${Math.max(0, netDiscretionary).toLocaleString()}` : 'High risk of cashflow crunch after loan servicing',
      ];
    }

    return res.json({
      success: true,
      eligibilityStatus: status,
      estimatedEmi,
      totalEmi,
      dtiRatio: parseFloat(dtiRatio.toFixed(2)),
      expenseRatio: parseFloat(expenseRatio.toFixed(2)),
      netDiscretionary: Math.round(netDiscretionary),
      maxAllowedEmiCap: Math.round(maxAllowedEmiCap),
      maxAffordablePrincipal: Math.max(0, maxAffordablePrincipal),
      explanation: aiExplanation,
      keyFactors: suggestions,
      disclaimer: 'These results are an educational estimate and do not guarantee loan approval. Final approval depends on comprehensive verification and credit policies of individual lending institutions.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'An error occurred during evaluation.' });
  }
});

// -------------------------------------------------------------
// API: Credit Score Analysis
// -------------------------------------------------------------
app.post('/api/credit/analyze', async (req: Request, res: Response) => {
  try {
    const {
      creditScore = 720,
      paymentHistoryPct = 98,
      creditUtilizationPct = 30,
      activeLoans = 2,
      totalCreditAccounts = 5,
      recentInquiries = 1,
    } = req.body;

    const score = Number(creditScore);
    const paymentHistory = Number(paymentHistoryPct);
    const utilization = Number(creditUtilizationPct);
    const loans = Number(activeLoans);
    const accounts = Number(totalCreditAccounts);
    const inquiries = Number(recentInquiries);

    if (score < 300 || score > 900) {
      return res.status(400).json({ error: 'Credit score must be between 300 and 900.' });
    }

    // Health Tier
    let tier = 'Fair';
    let color = '#f59e0b'; // amber
    if (score >= 800) {
      tier = 'Excellent';
      color = '#10b981'; // emerald
    } else if (score >= 740) {
      tier = 'Very Good';
      color = '#06b6d4'; // cyan
    } else if (score >= 670) {
      tier = 'Good';
      color = '#3b82f6'; // blue
    } else if (score >= 580) {
      tier = 'Fair';
      color = '#f59e0b'; // amber
    } else {
      tier = 'Poor';
      color = '#ef4444'; // red
    }

    const positiveFactors: string[] = [];
    const areasForImprovement: string[] = [];
    const educationalTips: string[] = [];

    // Evaluate Payment History (35% weight)
    if (paymentHistory >= 99) {
      positiveFactors.push('Impeccable on-time payment record (99%+). This is the single biggest catalyst for high scores.');
    } else if (paymentHistory >= 95) {
      positiveFactors.push('Solid on-time payment track record (95%-98%).');
    } else {
      areasForImprovement.push(`Payment track record is ${paymentHistory}%. Even 1-2 missed EMIs severely depress credit rating for up to 36 months.`);
      educationalTips.push('Set up automated ACH or auto-debit for all credit card minimums and loan EMIs to avoid accidental slips.');
    }

    // Evaluate Utilization (30% weight)
    if (utilization <= 30) {
      positiveFactors.push(`Credit utilization is lean at ${utilization}%, well below the industry 30% risk ceiling.`);
    } else if (utilization <= 50) {
      areasForImprovement.push(`Credit utilization is elevated at ${utilization}%. Lenders view utilization above 30% as revolving credit dependence.`);
      educationalTips.push('Aim to pay down card balances before the statement generation date or request a credit limit increase without spending more.');
    } else {
      areasForImprovement.push(`Critical credit utilization at ${utilization}%. High credit hunger significantly lowers your score.`);
      educationalTips.push('Prioritize aggressive balance pay-offs using debt avalanche or snowball methods.');
    }

    // Credit Mix & Accounts (10% weight)
    if (accounts >= 4 && loans >= 1) {
      positiveFactors.push('Healthy credit mix with both revolving and installment loan accounts.');
    } else if (accounts <= 2) {
      areasForImprovement.push('Thin credit file with limited account diversity. Longer account history provides stronger credibility.');
      educationalTips.push('Keep oldest credit cards active with occasional small recurring subscriptions to preserve credit vintage.');
    }

    // Inquiries (10% weight)
    if (inquiries <= 2) {
      positiveFactors.push('Low hard inquiry volume in recent months, demonstrating disciplined borrowing behavior.');
    } else {
      areasForImprovement.push(`${inquiries} hard inquiries logged recently. Multiple hard inquiries in short succession signal financial distress.`);
      educationalTips.push('Pause applying for multiple retail cards or personal loans; cluster inquiries within 14-45 days if rate shopping for a mortgage.');
    }

    // Gemini AI insight
    let aiInsight = '';
    if (ai) {
      try {
        const prompt = `As a credit counselor in banking, analyze this credit snapshot:
Score: ${score} (${tier}), Payment History: ${paymentHistory}%, Utilization: ${utilization}%, Active Loans: ${loans}, Accounts: ${accounts}, Inquiries: ${inquiries}.
Provide 2 short, impactful sentences summarizing why this score matters when applying for a home/car loan and the highest-impact action they should take next.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        if (response.text) {
          aiInsight = response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini credit insight fallback triggered:', err);
      }
    }

    if (!aiInsight) {
      aiInsight = `With a ${tier} rating of ${score}, institutional lenders view your risk profile as ${tier === 'Excellent' || tier === 'Very Good' ? 'very low, making you eligible for tier-1 preferential interest rates' : 'moderate to high, which may result in higher risk-adjusted spreads or collateral requirements'}.`;
    }

    return res.json({
      success: true,
      score,
      tier,
      color,
      positiveFactors,
      areasForImprovement,
      educationalTips,
      aiInsight,
      disclaimer: 'This analysis is informational and educational only. It is not an official credit bureau report (CIBIL/Experian/Equifax/TransUnion).'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error analyzing credit score.' });
  }
});

// -------------------------------------------------------------
// API: AI Financial Assistant Chat & Tips
// -------------------------------------------------------------
app.post('/api/ai/financial-tips', async (req: Request, res: Response) => {
  try {
    const { message, context, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message query is required.' });
    }

    if (!ai) {
      // Smart offline rule-based financial advice generator
      return res.json({
        success: true,
        reply: `Here are key educational considerations regarding your query:\n\n` +
          `• **Affordability Benchmark**: Banks advise keeping total monthly debt obligations (EMIs) strictly below 40-50% of your net monthly in-hand salary (FOIR).\n` +
          `• **Emergency Liquidity Buffer**: Always safeguard 4 to 6 months of essential household expenses in liquid instruments before committing to high-ticket liabilities.\n` +
          `• **Interest Minimization**: For long-term loans, making an extra principal prepayment equivalent to just 1 additional EMI per year can reduce tenure and save substantial cumulative interest.\n\n` +
          `*Note: This response is for educational guidance only and does not constitute certified legal, tax, or financial advisory.*`
      });
    }

    const systemPrompt = `You are "LoanAI Financial Assistant", an empathetic, highly knowledgeable financial educator specializing in personal loans, home mortgages, credit scores, EMI planning, and debt management for the BFSI domain.

Strict Guidelines:
1. Provide structured, concise, highly educational answers with clear headings, bullet points, and practical math when applicable.
2. Tone: Professional, encouraging, realistic, clear.
3. NEVER claim to provide formal financial, legal, tax, or investment advice.
4. Include a brief mandatory disclaimer sentence at the conclusion: "This guidance is strictly educational and does not constitute professional financial or legal advice."
5. Context: When financial numbers (income, EMI, score) are mentioned by the user, calculate relevant benchmarks like FOIR (DTI) or amortisation tips.`;

    let userPrompt = message;
    if (context && typeof context === 'object') {
      userPrompt = `Applicant Context:
- Monthly Income: ₹${context.monthlyIncome || 'N/A'}
- Existing EMIs: ₹${context.existingEmi || '0'}
- Requested Loan: ₹${context.loanAmount || 'N/A'}
- Credit Score: ${context.creditScore || 'N/A'}

User Query: ${message}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text || 'Unable to generate financial tip at this moment. Please check your parameters.';
    return res.json({ success: true, reply });
  } catch (error: any) {
    return res.status(500).json({
      error: 'The AI financial advisory service encountered a temporary error. Please try again.',
      details: error.message
    });
  }
});

// -------------------------------------------------------------
// API: Analysis History & Google Sheets Integration
// -------------------------------------------------------------
app.get('/api/records', (req: Request, res: Response) => {
  try {
    const records = getStoredRecords();
    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve records' });
  }
});

app.post('/api/records', (req: Request, res: Response) => {
  try {
    const {
      userName = 'Anonymous User',
      monthlyIncome,
      loanAmount,
      loanTenureMonths,
      creditScore,
      existingEmi,
      estimatedEmi,
      dtiRatio,
      eligibilityResult,
      employmentType = 'Salaried',
      notes = ''
    } = req.body;

    const records = getStoredRecords();
    const newRecord = {
      id: `REC-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      userName: userName.trim() || 'Anonymous User',
      monthlyIncome: Number(monthlyIncome),
      loanAmount: Number(loanAmount),
      loanTenureMonths: Number(loanTenureMonths),
      creditScore: Number(creditScore),
      existingEmi: Number(existingEmi),
      estimatedEmi: Number(estimatedEmi),
      dtiRatio: Number(dtiRatio),
      eligibilityResult: eligibilityResult || 'Moderate',
      employmentType,
      syncedToSheets: true,
      notes: notes || 'Assessed via LoanAI eligibility engine'
    };

    records.unshift(newRecord);
    saveStoredRecords(records);

    return res.json({ success: true, record: newRecord });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

app.delete('/api/records/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let records = getStoredRecords();
    records = records.filter((r: any) => r.id !== id);
    saveStoredRecords(records);
    return res.json({ success: true, message: 'Record removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Export records as Google Sheets CSV format
app.get('/api/records/export-sheets', (req: Request, res: Response) => {
  try {
    const records = getStoredRecords();
    const headers = [
      'Record ID',
      'Timestamp',
      'User Name / ID',
      'Monthly Income (INR)',
      'Loan Amount (INR)',
      'Loan Tenure (Months)',
      'Credit Score',
      'Existing Monthly EMI (INR)',
      'Estimated New EMI (INR)',
      'DTI Ratio (%)',
      'Eligibility Result',
      'Employment Type',
      'Notes'
    ];

    const rows = records.map((r: any) => [
      `"${r.id}"`,
      `"${r.timestamp}"`,
      `"${(r.userName || '').replace(/"/g, '""')}"`,
      r.monthlyIncome,
      r.loanAmount,
      r.loanTenureMonths,
      r.creditScore,
      r.existingEmi,
      r.estimatedEmi,
      r.dtiRatio,
      `"${r.eligibilityResult}"`,
      `"${r.employmentType || 'Salaried'}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="loan_ai_sheets_export.csv"');
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Google Sheets Webhook proxy (allows users to push to their Google Apps Script Web App URL)
app.post('/api/records/sync-sheets', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, recordId } = req.body;
    const records = getStoredRecords();
    const target = recordId ? records.find((r: any) => r.id === recordId) : records[0];

    if (!target) {
      return res.status(404).json({ error: 'No record available to sync' });
    }

    if (webhookUrl && webhookUrl.startsWith('https://script.google.com/')) {
      try {
        const fetchRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        });
        const result = await fetchRes.text();
        return res.json({ success: true, message: 'Successfully synced to Google Sheets via Webhook!', result });
      } catch (postErr: any) {
        return res.status(502).json({ error: `Webhook transmission failed: ${postErr.message}` });
      }
    }

    // Default response showing ready Google Sheets payload
    return res.json({
      success: true,
      message: 'Record prepared and certified in Google Sheets format.',
      sheetRow: [
        target.id,
        target.timestamp,
        target.userName,
        target.monthlyIncome,
        target.loanAmount,
        target.loanTenureMonths,
        target.creditScore,
        target.existingEmi,
        target.estimatedEmi,
        `${target.dtiRatio}%`,
        target.eligibilityResult
      ]
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Sync failed' });
  }
});

// -------------------------------------------------------------
// Vite middleware in dev or static serving in production
// -------------------------------------------------------------
async function setupApp() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoanAI Server active on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
