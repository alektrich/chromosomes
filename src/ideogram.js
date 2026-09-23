import { STAIN_COLORS } from './geometry.js';

/**
 * Standard ISCN-style ideogram as an SVG string.
 * Vertical: pter at top. Horizontal: pter on the left.
 * With `interactive`, every band gets data-band="<index>" for hover handling.
 */
export function ideogramSVG(c, { length, thickness, horizontal = false, interactive = false, className = '' }) {
  const k = length / c.total;
  const w = thickness;
  const cenStart = c.bands.find((b) => b.stain === 'acen').start;
  const cenEnd = c.bands.findLast((b) => b.stain === 'acen').end;
  const rad = w / 2;

  // Map "along" (a) / "across" (x) coordinates into SVG space.
  const rect = (a0, a1, x0, x1) =>
    horizontal
      ? { x: a0, y: x0, width: a1 - a0, height: x1 - x0 }
      : { x: x0, y: a0, width: x1 - x0, height: a1 - a0 };
  const pt = (a, x) => (horizontal ? `${a},${x}` : `${x},${a}`);
  const attrs = (o) => Object.entries(o).map(([key, v]) => `${key}="${typeof v === 'number' ? +v.toFixed(2) : v}"`).join(' ');

  const uid = `clip-${c.id}-${Math.round(length)}-${horizontal ? 'h' : 'v'}`;
  const pArm = rect(0, cenStart * k, 0, w);
  const qArm = rect(cenEnd * k, length, 0, w);

  const parts = c.bands.map((b, i) => {
    const a0 = b.start * k;
    const a1 = b.end * k;
    const fill = STAIN_COLORS[b.stain] ?? STAIN_COLORS.gneg;
    const data = interactive ? ` data-band="${i}" class="band"` : '';
    if (b.stain === 'acen') {
      // Centromere drawn as two triangles pinching toward the constriction.
      const isP = b.name.startsWith('p');
      const tip = isP ? a1 : a0;
      const base = isP ? a0 : a1;
      return `<polygon points="${pt(base, 0)} ${pt(tip, w / 2)} ${pt(base, w)}" fill="${fill}"${data}/>`;
    }
    const inset = b.stain === 'stalk' ? w * 0.3 : 0;
    const r = rect(a0, a1, inset, w - inset);
    return `<rect ${attrs(r)} fill="${fill}" clip-path="url(#${uid})"${data}/>`;
  });

  const [W, H] = horizontal ? [length, w] : [w, length];
  const hasStalk = c.bands.some((b) => b.stain === 'stalk');
  const outline = [
    hasStalk ? '' : `<rect ${attrs(pArm)} rx="${rad}" class="arm-outline"/>`,
    `<rect ${attrs(qArm)} rx="${rad}" class="arm-outline"/>`,
  ].join('');

  return `<svg class="ideogram ${className}" viewBox="-1 -1 ${W + 2} ${H + 2}" width="${W + 2}" height="${H + 2}" aria-hidden="true">
    <defs><clipPath id="${uid}">
      <rect ${attrs(pArm)} rx="${rad}"/><rect ${attrs(qArm)} rx="${rad}"/>
    </clipPath></defs>
    ${parts.join('')}${outline}
  </svg>`;
}

/** Schematic replicated chromosome (two chromatids) for the morphology legend. */
export function morphologyIcon(f, { satellite = false } = {}) {
  const H = 64, cw = 9, gap = 1;
  const top = 6, bottom = H - 4;
  const cen = top + (bottom - top) * f;
  const pinch = 3;
  const chromatid = (x) => {
    const parts = [];
    if (cen - top > 3) parts.push(`<rect x="${x}" y="${top}" width="${cw}" height="${cen - top - pinch}" rx="${cw / 2}"/>`);
    parts.push(`<rect x="${x}" y="${cen + pinch}" width="${cw}" height="${bottom - cen - pinch}" rx="${cw / 2}"/>`);
    if (satellite) {
      parts.push(`<line x1="${x + cw / 2}" y1="${top - 1}" x2="${x + cw / 2}" y2="${top - 4}" class="stalk"/>`);
      parts.push(`<circle cx="${x + cw / 2}" cy="${top - 5}" r="2.2"/>`);
    }
    return parts.join('');
  };
  const x0 = 12 - cw - gap / 2;
  return `<svg viewBox="0 -2 24 ${H + 2}" width="24" height="${H + 2}" class="morph-icon" aria-hidden="true">
    <g class="chromatids">${chromatid(x0)}${chromatid(12 + gap / 2)}</g>
    <circle cx="12" cy="${cen}" r="3" class="cen"/>
  </svg>`;
}
