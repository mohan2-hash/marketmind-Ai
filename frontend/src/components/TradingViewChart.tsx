import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Candle } from '../types';

interface TradingViewChartProps {
  candles: Candle[];
  symbol: string;
  currency?: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  symbol,
  currency = 'INR',
  timeframe,
  onTimeframeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Dispose old chart if exists
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0d1527' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: '#172442' },
        horzLines: { color: '#172442' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        borderColor: '#21335b',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#21335b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    seriesRef.current = candleSeries;

    // Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Populate data
    if (candles && candles.length > 0) {
      const formattedCandles: CandlestickData<Time>[] = candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const formattedVolume = candles.map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      }));

      candleSeries.setData(formattedCandles);
      volumeSeries.setData(formattedVolume);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, chartType]);

  return (
    <div className="flex flex-col h-full w-full bg-navy-900 rounded-xl border border-navy-700/60 p-4 shadow-xl">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-wide">{symbol}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-navy-800 text-slate-300 font-mono border border-navy-700">
            {currency}
          </span>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-lg border border-navy-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                timeframe === tf
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-navy-850'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-1 min-h-[380px] w-full pt-2" ref={chartContainerRef} />
    </div>
  );
};
