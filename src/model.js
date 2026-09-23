import bandsJson from './data/bands.json' with { type: 'json' };
import { CHROMOSOMES } from './data/chromosomes.js';

// bands: [start, end, name, stain][]
export const IDS = CHROMOSOMES.map((c) => c.id);
export const LARGEST_BP = Math.max(...IDS.map((id) => bandsJson[id].at(-1)[1]));
export const GENOME_BP = IDS.reduce((sum, id) => sum + bandsJson[id].at(-1)[1], 0);

const cache = new Map();

export function getChromosome(id) {
  if (cache.has(id)) return cache.get(id);
  const meta = CHROMOSOMES.find((c) => c.id === id);
  const bands = bandsJson[id].map(([start, end, name, stain]) => ({ start, end, name, stain }));
  const total = bands.at(-1).end;
  // Centromere = boundary between the p11.1 and q11.1 "acen" bands.
  const cen = bands.find((b) => b.stain === 'acen').end;
  const ci = cen / total;
  const c = {
    ...meta,
    bands,
    total,
    cen,
    ci,
    armRatio: (total - cen) / cen,
    genesPerMb: meta.genes / (total / 1e6),
    loci: meta.loci.map((l) => ({ ...l, range: bandRange(bands, l.band) })),
  };
  cache.set(id, c);
  return c;
}

export function bandIndexAt(c, bp) {
  const { bands } = c;
  let lo = 0, hi = bands.length - 1;
  if (bp <= 0) return 0;
  if (bp >= c.total) return hi;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (bands[mid].end <= bp) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function matches(bandName, locus) {
  if (bandName === locus) return true;
  if (!bandName.startsWith(locus)) return false;
  const next = bandName[locus.length];
  // "q22" matches "q22.1"; "q22.1" matches "q22.11"; "q2" must not match "q22".
  return locus.includes('.') ? /\d/.test(next) : next === '.';
}

/** Returns [firstIndex, lastIndex] of bands covered by a locus or locus range, or null. */
export function bandRange(bands, band) {
  const [from, to] = Array.isArray(band) ? band : [band, band];
  const hits = (loc) => bands.flatMap((b, i) => (matches(b.name, loc) ? [i] : []));
  const a = hits(from), b = hits(to);
  if (!a.length || !b.length) return null;
  const all = [...a, ...b];
  return [Math.min(...all), Math.max(...all)];
}

export function formatMb(bp, digits = 1) {
  return `${(bp / 1e6).toFixed(digits)} Mb`;
}

export function locusLabel(id, band) {
  return Array.isArray(band) ? `${id}${band[0]}–${band[1]}` : `${id}${band}`;
}
