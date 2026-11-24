import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { StockExplorerPage } from './pages/StockExplorerPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { AIPredictionPage } from './pages/AIPredictionPage';
import { TechnicalAnalysisPage } from './pages/TechnicalAnalysisPage';
import { FundamentalAnalysisPage } from './pages/FundamentalAnalysisPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { BacktestPage } from './pages/BacktestPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { NewsPage } from './pages/NewsPage';
import { LearningPage } from './pages/LearningPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authenticated / Dashboard Application Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/explorer" element={<StockExplorerPage />} />
        <Route path="/stocks/:symbol" element={<StockDetailPage />} />
        <Route path="/predictions" element={<AIPredictionPage />} />
        <Route path="/technical" element={<TechnicalAnalysisPage />} />
        <Route path="/fundamentals" element={<FundamentalAnalysisPage />} />
        <Route path="/risk" element={<RiskAnalysisPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/backtest" element={<BacktestPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
