import React, { useState, useRef, useEffect } from 'react';
import { assistantApi } from '../services/api';
import { Bot, Send, Sparkles, User, ShieldCheck } from 'lucide-react';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp?: string;
  disclaimer?: string;
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am **MarketMind Financial Assistant**.\n\nI answer queries about company balance sheets, technical momentum indicators, risk statistics, and machine-learning predictions using verified application data.\n\nHow can I assist your financial analysis today?',
      sources: ['MarketMind Analytics Engine'],
      timestamp: 'Initial Greeting',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [targetSymbol, setTargetSymbol] = useState<string>('RELIANCE');
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Explain the 14-day RSI for TCS',
    'What are the main risks of RELIANCE?',
    'How healthy is INFY according to the health score?',
    'Explain the machine learning prediction for NVDA',
    'What is the difference between PE and PB ratios?',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatEntry = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const resp = await assistantApi.sendMessage(text, targetSymbol);
      const assistantMessage: ChatEntry = {
        role: 'assistant',
        content: resp.reply,
        sources: resp.sources_cited,
        timestamp: resp.data_timestamp,
        disclaimer: resp.disclaimer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error retrieving live market information. Please ensure backend services are running.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-brand-cyan" />
            <span>AI Financial Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded financial intelligence citing verified company metrics and timestamped technical indicators
          </p>
        </div>

        {/* Symbol Context Picker */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Context Stock:</span>
          <select
            value={targetSymbol}
            onChange={(e) => setTargetSymbol(e.target.value)}
            className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-white font-bold"
          >
            {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'AAPL', 'MSFT', 'NVDA', 'TSLA'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 bg-navy-900 border border-navy-800 rounded-2xl p-6 overflow-y-auto space-y-6 shadow-xl custom-scrollbar">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-brand-blue text-white rounded-br-none shadow-md'
                    : 'bg-navy-950 border border-navy-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Sources & Timestamp */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-navy-850 text-[10px] text-slate-400 font-mono space-y-1">
                    <div>
                      <span className="text-slate-500">Cited Sources:</span> {m.sources.join(', ')}
                    </div>
                    {m.timestamp && <div><span className="text-slate-500">Timestamp:</span> {m.timestamp}</div>}
                    {m.disclaimer && <div className="text-amber-400/80 italic">{m.disclaimer}</div>}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-navy-950 border border-navy-800 p-3 rounded-2xl text-xs font-mono text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-ping"></div>
              <span>Querying financial data &amp; calculating metrics...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full bg-navy-900 border border-navy-800 text-slate-300 hover:text-white hover:border-brand-blue whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-3 bg-navy-900 border border-navy-800 p-2 rounded-2xl shadow-xl">
        <input
          type="text"
          placeholder={`Ask about ${targetSymbol} or any market concept...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
