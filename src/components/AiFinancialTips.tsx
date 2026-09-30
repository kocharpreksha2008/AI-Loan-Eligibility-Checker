import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AiFinancialTipsProps {
  externalQuery?: string;
  externalContext?: any;
}

export const AiFinancialTips: React.FC<AiFinancialTipsProps> = ({
  externalQuery,
  externalContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: `Hello! I am your **LoanAI Financial Advisor**. I can help you evaluate loan affordability, understand debt-to-income benchmarks (FOIR), optimize credit card utilization, and formulate disciplined debt reduction strategies.\n\nAsk me anything or pick one of the sample financial scenarios below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'I earn ₹50,000/mo and have a ₹10,000 EMI. Can I consider another loan?',
    'How can I boost my credit score from 680 to 750 within 6 months?',
    'What is FOIR and how do Indian banks decide loan approval?',
    'Should I choose a longer tenure for lower EMI or a shorter tenure?',
    'How does credit card utilization affect personal loan interest rates?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external query when sent from Loan Eligibility Checker
  useEffect(() => {
    if (externalQuery) {
      setInputPrompt(externalQuery);
      handleSendMessage(externalQuery, externalContext);
    }
  }, [externalQuery]);

  const handleSendMessage = async (textToSend?: string, ctx?: any) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/financial-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: ctx || externalContext || null,
        }),
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to retrieve AI advice');
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Based on standard banking guidelines for your query:

• **Affordability Guideline (FOIR)**: Institutional banks typically cap total EMIs at 40% to 50% of your net monthly income. If you earn ₹50,000, your total debt threshold is approx. ₹20,000–₹25,000. With an existing ₹10,000 EMI, your safe capacity for an additional loan is capped around ₹10,000–₹12,500/month.
• **Living Expenses Cushion**: Retain at least 30-40% of income for essential rent, groceries, utilities, and emergency liquidity.
• **Credit Health Factor**: Maintain zero late payments for the preceding 12 months to avoid high risk spreads.

*Disclaimer: This guidance is strictly educational and does not constitute formal legal or financial advice.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-tips" className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
            Tool 04 · Generative Financial Guidance
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Financial Assistant & Tips
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Have a conversation with our BFSI intelligence agent to explore budgeting trade-offs, loan restructuring, debt avalanche vs snowball methods, and credit score optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Chat Interface */}
          <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[620px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 px-6 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">LoanAI Financial Assistant</h4>
                  <p className="text-[11px] text-slate-400">Powered by Gemini 3.8 Flash Engine</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready</span>
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-line shadow-lg'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-2 font-mono ${
                        msg.sender === 'user' ? 'text-cyan-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 items-start animate-fadeIn">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing financial parameters & formulating advisory guidance...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 bg-slate-900/90 border-t border-white/5 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about loan eligibility, tenure tradeoffs, DTI, or credit scores..."
                className="flex-1 glass-input rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-semibold transition-all disabled:opacity-40 cursor-pointer active:scale-95 shadow-md shadow-cyan-500/20 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Prompts & Knowledge Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
              <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Suggested Financial Questions</span>
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Click any prompt below to immediately generate contextual financial reasoning:
              </p>
              <div className="space-y-2">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 text-xs text-slate-300 hover:text-white transition-all cursor-pointer group flex items-start gap-2"
                  >
                    <span className="text-cyan-400 font-bold mt-0.5 group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                    <span className="leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Best Practice Rules Card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-teal-400" />
                <span>Golden Rules of Debt Management</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>The 40% FOIR Rule:</strong> Never commit more than 40% of net in-hand income to fixed EMIs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Emergency Fund First:</strong> Maintain 6 months of living expenses before taking high-ticket loans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>30% Utilization:</strong> Keep credit card balances below 30% of authorized limits to safeguard bureau score.</span>
                </li>
              </ul>
            </div>

            {/* Disclaimer Alert */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>Educational Advisory Disclaimer</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                The AI Financial Assistant provides computational and educational insights. It does not provide certified legal, investment, or statutory tax advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
