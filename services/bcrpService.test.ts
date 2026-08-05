import { describe, expect, it } from 'vitest';
import { fetchEconomicIndicators, parseLatestIndicator } from './bcrpService';

describe('BCRP indicators', () => {
  it('uses the latest numeric period and skips unavailable values', () => {
    const indicator = parseLatestIndicator(
      {
        periods: [
          { name: 'Jun.2026', values: ['138.20'] },
          { name: 'Jul.2026', values: ['n.d.'] },
        ],
      },
      'IPC Lima',
      (value) => `${value.toFixed(2)} pts`,
    );

    expect(indicator).toEqual({
      name: 'IPC Lima',
      value: '138.20 pts',
      period: 'Jun.2026',
    });
  });

  it('returns no estimates when every live request fails', async () => {
    const failedFetch = async () => { throw new Error('offline'); };
    await expect(fetchEconomicIndicators(failedFetch as typeof fetch)).resolves.toEqual([]);
  });
});
