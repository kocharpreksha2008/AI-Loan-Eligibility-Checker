import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { LoanRecord } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface RecordsDashboardProps {
  onRefreshRecords?: () => void;
  isOpenSheetsModal: boolean;
  onCloseSheetsModal: () => void;
}

export const RecordsDashboard: React.FC<RecordsDashboardProps> = ({
  isOpenSheetsModal,
  onCloseSheetsModal,
}) => {
  const [records, setRecords] = useState<LoanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTabModal, setActiveTabModal] = useState<'sync' | 'script'>('sync');

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/records/export-sheets';
  };

  const handleTestWebhookSync = async () => {
    if (!webhookUrl) {
      alert('Please enter a Google Apps Script Web App URL.');
      return;
    }
    setSyncStatus('Testing synchronization with Google Sheets...');
    try {
      const res = await fetch('/api/records/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus('✓ Successfully pushed record to your Google Sheet!');
      } else {
        setSyncStatus(`Sync error: ${data.error || 'Check Webhook URL'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync failed: ${err.message}`);
    }
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterResult === 'all' || r.eligibilityResult.toLowerCase() === filterResult.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Aggregate stats
  const totalAssessments = records.length;
  const highCount = records.filter((r) => r.eligibilityResult === 'High').length;
  const moderateCount = records.filter((r) => r.eligibilityResult === 'Moderate').length;
  const lowCount = records.filter((r) => r.eligibilityResult === 'Low').length;
  const avgDti =
    totalAssessments > 0
      ? (records.reduce((acc, curr) => acc + (curr.dtiRatio || 0), 0) / totalAssessments).toFixed(1)
      : '0.0';

  const googleAppsScriptCode = `// Google Apps Script to automatically capture LoanAI records
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add header row if first entry
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Record ID", "Timestamp", "User Name", "Monthly Income", 
        "Loan Amount", "Tenure (Mo)", "Credit Score", "Existing EMI", 
        "Estimated EMI", "DTI Ratio (%)", "Eligibility Result"
      ]);
    }
    
    // Append loan applicant record
    sheet.appendRow([
      data.id || "N/A",
      data.timestamp || new Date().toISOString(),
      data.userName || "Anonymous",
      data.monthlyIncome || 0,
      data.loanAmount || 0,
      data.loanTenureMonths || 0,
      data.creditScore || 0,
      data.existingEmi || 0,
      data.estimatedEmi || 0,
      data.dtiRatio ? data.dtiRatio + "%" : "0%",
      data.eligibilityResult || "Moderate"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <section id="dashboard" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
              Assessment Vault & Telemetry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Analysis Dashboard & Google Sheets
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Inspect historical underwriting assessments, track portfolio-level DTI ratios, and sync directly with Google Sheets for audit reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecords}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Sheets CSV</span>
            </button>

            <button
              onClick={onCloseSheetsModal}
              className="px-4 py-2.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets Integration</span>
            </button>
          </div>
        </div>

        {/* Dashboard Aggregate Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Total Analyzed Records</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {totalAssessments}
              </span>
              <span className="text-xs text-cyan-400 font-medium">Logged</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-2">
              <div className="bg-cyan-400 h-full w-full" />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">High Eligibility Ratio</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                {highCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {totalAssessments > 0 ? ((highCount / totalAssessments) * 100).toFixed(0) : 0}% of vault
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-2">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${totalAssessments > 0 ? (highCount / totalAssessments) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Moderate / Low Count</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                {moderateCount + lowCount}
              </span>
              <span className="text-xs text-amber-300 font-mono">
                {moderateCount} Mod · {lowCount} Low
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-2">
              <div
                className="bg-amber-400 h-full"
                style={{
                  width: `${totalAssessments > 0 ? ((moderateCount + lowCount) / totalAssessments) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Mean Portfolio DTI</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-cyan-300 font-mono tabular-nums">
                {avgDti}%
              </span>
              <span className="text-xs text-slate-400">Benchmark: &lt;50%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-2">
              <div
                className="bg-cyan-500 h-full"
                style={{ width: `${Math.min(100, (Number(avgDti) / 60) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Records Table Card */}
        <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden space-y-4 p-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant or ID..."
                className="glass-input pl-9 pr-4 py-2 rounded-xl text-xs w-full"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-white/5 w-full sm:w-auto">
              {['all', 'high', 'moderate', 'low'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterResult(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors flex-1 sm:flex-none ${
                    filterResult === f
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All Results' : `${f} Eligibility`}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3 text-right">Income</th>
                  <th className="px-4 py-3 text-right">Loan Amount</th>
                  <th className="px-4 py-3 text-right">Tenure</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-right">Est. EMI</th>
                  <th className="px-4 py-3 text-right">DTI</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-cyan-400 font-semibold">{rec.id}</td>
                      <td className="px-4 py-3 font-sans font-medium text-white">{rec.userName}</td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        {formatCurrency(rec.monthlyIncome)}
                      </td>
                      <td className="px-4 py-3 text-right text-cyan-300 font-semibold">
                        {formatCurrency(rec.loanAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400">
                        {rec.loanTenureMonths} mo
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            rec.creditScore >= 750
                              ? 'text-emerald-400 bg-emerald-950/40'
                              : rec.creditScore >= 650
                              ? 'text-cyan-400 bg-cyan-950/40'
                              : 'text-amber-400 bg-amber-950/40'
                          }`}
                        >
                          {rec.creditScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        {formatCurrency(rec.estimatedEmi)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-300">
                        {rec.dtiRatio}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            rec.eligibilityResult === 'High'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : rec.eligibilityResult === 'Moderate'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                              : 'bg-red-950/60 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {rec.eligibilityResult}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                      No assessment records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Google Sheets Modal Drawer */}
      {isOpenSheetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel rounded-2xl max-w-2xl w-full border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Sheets Integration Hub</h3>
                  <p className="text-xs text-slate-400">Live Webhook Sync & Apps Script Configuration</p>
                </div>
              </div>
              <button
                onClick={onCloseSheetsModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTabModal('sync')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTabModal === 'sync'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Webhook Sync
              </button>
              <button
                type="button"
                onClick={() => setActiveTabModal('script')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  activeTabModal === 'script'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Apps Script Setup (2 Min)
              </button>
            </div>

            {activeTabModal === 'sync' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your published Google Apps Script Web App URL below to directly sync loan evaluations to your Google Sheet in real time:
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleTestWebhookSync}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Push Assessment to Google Sheet</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Ready CSV</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-emerald-400">
                    {syncStatus}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-300">
                    Paste this snippet into <strong>Extensions &gt; Apps Script</strong> inside any Google Sheet:
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(googleAppsScriptCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2500);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10 flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-52 border border-white/5">
                  {googleAppsScriptCode}
                </pre>

                <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Click <strong>Deploy &gt; New deployment</strong> in Google Apps Script</li>
                  <li>Select type <strong>Web App</strong>, set access to <strong>Anyone</strong></li>
                  <li>Copy the resulting Web App URL and paste it in the Live Webhook Sync tab</li>
                </ol>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Strict zero sensitive data policy: Only applicant pseudonym, financial ratios, and evaluation indicators are exported.</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
