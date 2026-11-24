import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { MarketTicker } from '../components/MarketTicker';
import { marketApi } from '../services/api';
import { MarketIndexItem } from '../types';

export const DashboardLayout: React.FC = () => {
  const [currentMarket, setCurrentMarket] = useState<'IN' | 'US'>('IN');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [indices, setIndices] = useState<MarketIndexItem[]>([]);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const overview = await marketApi.getOverview(currentMarket, isDemoMode);
        setIndices(overview.indices);
      } catch (err) {
        console.error('Failed to fetch market pulse', err);
      }
    };
    fetchIndices();
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, [currentMarket, isDemoMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy-950 font-sans">
      {/* Sidebar */}
      <Sidebar currentMarket={currentMarket} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar
          currentMarket={currentMarket}
          onMarketChange={setCurrentMarket}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        />

        {/* Real-time Ticker Strip */}
        <MarketTicker indices={indices} />

        {/* Routed Sub-pages */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          <Outlet context={{ currentMarket, isDemoMode }} />
        </main>
      </div>
    </div>
  );
};
