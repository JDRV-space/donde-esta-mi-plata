// Banco Central de Reserva del Perú series API.
// Documentation: https://estadisticas.bcrp.gob.pe/estadisticas/series/ayuda/api

export interface BcrpIndicator {
  name: string;
  value: string;
  period: string;
}

interface BcrpPayload {
  periods?: Array<{ name: string; values: string[] }>;
}

type Fetcher = typeof fetch;

const SERIES = [
  {
    url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04640PD/json',
    name: 'TC Venta (USD)',
    format: (value: number) => `S/ ${value.toFixed(3)}`,
  },
  {
    url: 'https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PN01288PM/json',
    name: 'IPC Lima',
    format: (value: number) => `${value.toFixed(2)} pts`,
  },
] as const;

export const parseLatestIndicator = (
  payload: BcrpPayload,
  name: string,
  format: (value: number) => string,
): BcrpIndicator | null => {
  const period = [...(payload.periods ?? [])]
    .reverse()
    .find((candidate) => Number.isFinite(Number(candidate.values[0])));
  if (!period) return null;

  return {
    name,
    value: format(Number(period.values[0])),
    period: period.name,
  };
};

export const fetchEconomicIndicators = async (
  fetcher: Fetcher = fetch,
): Promise<BcrpIndicator[]> => {
  const requests = SERIES.map(async (series) => {
    const response = await fetcher(series.url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`BCRP request failed: ${response.status}`);

    return parseLatestIndicator(await response.json(), series.name, series.format);
  });

  const results = await Promise.allSettled(requests);
  return results.flatMap((result) => (
    result.status === 'fulfilled' && result.value ? [result.value] : []
  ));
};
