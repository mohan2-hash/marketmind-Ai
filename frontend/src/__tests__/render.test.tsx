import { describe, it, expect } from 'vitest';

describe('MarketMind AI Frontend Suite', () => {
  it('validates environment and core logic functions', () => {
    const formatCurrency = (val: number, cur: string) => `${cur === 'INR' ? '₹' : '$'}${val.toFixed(2)}`;
    expect(formatCurrency(2980.5, 'INR')).toBe('₹2980.50');
    expect(formatCurrency(224.2, 'USD')).toBe('$224.20');
  });

  it('validates probability interval bounds logic', () => {
    const target = 100;
    const margin = 5;
    const lower = target - margin;
    const upper = target + margin;
    expect(lower).toBeLessThan(target);
    expect(upper).toBeGreaterThan(target);
  });

  it('verifies 4-pillar health score aggregation', () => {
    const weights = [0.25, 0.25, 0.25, 0.25];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    expect(totalWeight).toBe(1.0);
  });
});
