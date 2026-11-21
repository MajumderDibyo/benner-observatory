export const CYCLES = [
  { id: 'A', label: 'Panic reference', color: '#c0623a', years: [1927,1945,1965,1981,1999,2019,2035,2053] },
  { id: 'B', label: 'High-price reference', color: '#7b68ae', years: [1926,1935,1945,1953,1962,1972,1980,1989,1999,2007,2016,2026,2034,2043,2053] },
  { id: 'C', label: 'Low-price reference', color: '#3e7a3c', years: [1924,1931,1942,1951,1958,1968,1978,1985,1996,2005,2012,2023,2032,2039,2050,2059] },
];

export const MARKETS = ['Global', 'US equities', 'India equities', 'Crypto', 'Commodities', 'Real estate', 'Rates & credit'];
export const STANCES = ['Supports', 'Challenges', 'Neutral'];

export function referencesForYear(year) {
  return CYCLES.filter(c => c.years.includes(Number(year)));
}

export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function validFact(fact) {
  return !!fact && typeof fact.id === 'string' && fact.id.length > 0 &&
    typeof fact.title === 'string' && fact.title.trim().length > 0 && fact.title.length <= 200 &&
    typeof fact.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fact.date) &&
    !Number.isNaN(Date.parse(fact.date)) && new Date(fact.date).toISOString().slice(0,10) === fact.date &&
    Number(fact.date.slice(0,4)) >= 1924 && Number(fact.date.slice(0,4)) <= 2059 &&
    MARKETS.includes(fact.market) && STANCES.includes(fact.stance) &&
    typeof fact.source === 'string' && !!safeUrl(fact.source) &&
    typeof fact.note === 'string' && fact.note.length <= 4000;
}

export function validateBackup(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.facts) || data.facts.length > 10000 ||
      !data.facts.every(validFact) || new Set(data.facts.map(f => f.id)).size !== data.facts.length ||
      !data.scenarios || typeof data.scenarios !== 'object' || Array.isArray(data.scenarios) ||
      !Object.entries(data.scenarios).every(([year, note]) =>
        /^\d{4}$/.test(year) && Number(year) >= 1924 && Number(year) <= 2059 &&
        typeof note === 'string' && note.length <= 8000)) {
    throw new Error('Invalid backup. Expected a version 1 Observatory export with valid sourced facts and scenario notes.');
  }
  return {
    version: 1,
    facts: data.facts.map(({ id, title, date, market, stance, source, note }) => ({ id, title, date, market, stance, source, note })),
    scenarios: { ...data.scenarios },
  };
}
