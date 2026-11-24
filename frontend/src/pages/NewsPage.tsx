import React, { useState, useEffect } from 'react';
import { marketApi } from '../services/api';
import { NewsArticle } from '../types';
import { Newspaper, Sparkles, Filter, ExternalLink } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSentiment, setFilterSentiment] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('ALL');

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const data = await marketApi.getNews('', 20);
        setNews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (filterSentiment === 'ALL') return true;
    return item.sentiment === filterSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-brand-cyan" />
            <span>AI News &amp; Sentiment Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial journalism curated with NLP sentiment scoring and key impact summaries
          </p>
        </div>

        {/* Sentiment Filter */}
        <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-navy-800 text-xs">
          {(['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const).map((sent) => (
            <button
              key={sent}
              onClick={() => setFilterSentiment(sent)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterSentiment === sent
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sent}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400 font-mono">Parsing NLP Sentiment Feeds...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNews.map((article) => {
            const isPos = article.sentiment === 'POSITIVE';
            const isNeg = article.sentiment === 'NEGATIVE';
            return (
              <div
                key={article.id}
                className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-navy-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2 py-0.5 rounded bg-navy-950 text-slate-300 font-mono text-[10px] border border-navy-800">
                      {article.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        isPos
                          ? 'bg-gain/20 text-gain'
                          : isNeg
                          ? 'bg-loss/20 text-loss'
                          : 'bg-navy-950 text-slate-400 border border-navy-800'
                      }`}
                    >
                      {article.sentiment} ({article.sentiment_score > 0 ? '+' : ''}{article.sentiment_score})
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Source: {article.source}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-cyan hover:underline"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
