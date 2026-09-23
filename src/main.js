import { Viewer } from './viewer.js';
import { IDS, getChromosome, formatMb, locusLabel, LARGEST_BP, GENOME_BP } from './model.js';
import { MORPHOLOGY, GROUPS } from './data/chromosomes.js';
import { ideogramSVG, morphologyIcon } from './ideogram.js';
import { STAIN_COLORS } from './geometry.js';

const PICKER_ROWS = [
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10', '11', '12'],
  ['13', '14', '15', '16', '17', '18'],
  ['19', '20', '21', '22', 'X', 'Y'],
];

const STAINS = [
  ['gneg', 'G-negative', 'Light band. GC-rich, gene-dense, early-replicating.'],
  ['gpos25', 'G-positive 25', 'Faint dark band.'],
  ['gpos50', 'G-positive 50', 'Medium dark band.'],
  ['gpos75', 'G-positive 75', 'Strong dark band.'],
  ['gpos100', 'G-positive 100', 'Darkest band. AT-rich, gene-poor, late-replicating.'],
  ['acen', 'Centromere', 'Primary constriction where the kinetochore assembles.'],
  ['gvar', 'Heterochromatin', 'Variable satellite DNA whose size differs between people.'],
  ['stalk', 'Stalk (NOR)', 'Ribosomal RNA gene repeats on the acrocentric short arms.'],
];
const STAIN_INFO = Object.fromEntries(STAINS.map(([k, label, desc]) => [k, { label, desc }]));

const ANATOMY = [
  ['Sister chromatids', 'Two identical DNA copies made in S phase, held together until anaphase.'],
  ['Centromere', 'The primary constriction. It divides the chromosome into a short p arm (petit) and a long q arm.'],
  ['Telomeres', 'TTAGGG repeats that cap and protect both chromosome ends (pter and qter).'],
  ['Bands', 'Named by arm, region, band and sub-band. 7q31.2 means chromosome 7, q arm, region 3, band 1, sub-band 2.'],
];

const state = { id: '1', mode: 'single', autoRotate: true, locusRange: null, hoverRange: null };

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const tooltip = $('#tooltip');

const viewer = new Viewer($('#stage'), {
  getChromosome,
  onHover: (hit) => {
    if (!hit) {
      tooltip.hidden = true;
      setHover(null);
      return;
    }
    const c = getChromosome(hit.id);
    const b = c.bands[hit.bandIndex];
    tooltip.innerHTML = bandReadout(c, b, true);
    tooltip.hidden = false;
    const rect = $('#stage').getBoundingClientRect();
    tooltip.style.transform = `translate(${hit.x - rect.left + 16}px, ${hit.y - rect.top + 16}px)`;
    setHover({ id: hit.id, range: [hit.bandIndex, hit.bandIndex] });
  },
  onPick: ({ id }) => {
    if (state.mode === 'karyotype' || id !== state.id) select(id, { mode: 'single' });
  },
});

// ---------- rendering ----------

function renderPicker() {
  const maxH = 78;
  $('#picker').innerHTML = PICKER_ROWS.map(
    (row) =>
      `<div class="picker-row">${row
        .map((id) => {
          const c = getChromosome(id);
          const h = Math.max(14, (c.total / LARGEST_BP) * maxH);
          return `<button class="chip" data-id="${id}" aria-label="Chromosome ${id}, ${MORPHOLOGY[c.morphology].label}">
            <span class="chip-fig">${ideogramSVG(c, { length: h, thickness: 7 })}</span>
            <span class="chip-label">${id}</span>
          </button>`;
        })
        .join('')}</div>`
  ).join('');
}

function renderLegend() {
  $('#legend').innerHTML = `
    <h2 class="section-title">Morphology</h2>
    <p class="section-lede">Chromosomes are classified by where the centromere sits. The <strong>centromere index</strong> (CI) is the p arm's share of total length.</p>
    <div class="morph-list">
      ${Object.entries(MORPHOLOGY)
        .map(
          ([key, m]) => `<div class="morph" data-morph="${key}">
            ${morphologyIcon(m.f, { satellite: key === 'acrocentric' })}
            <div>
              <div class="morph-head"><span class="morph-name">${m.label}</span><span class="morph-ci">CI ${m.ci}</span></div>
              <p>${m.blurb}</p>
              <div class="morph-members">${membersOf(key)}</div>
            </div>
          </div>`
        )
        .join('')}
    </div>

    <h2 class="section-title">Anatomy</h2>
    <dl class="anatomy">
      ${ANATOMY.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}
    </dl>

    <h2 class="section-title">G-band stains</h2>
    <p class="section-lede">Giemsa staining gives each chromosome a reproducible barcode. The 3D models use the same colours as this key.</p>
    <ul class="stains">
      ${STAINS.map(
        ([k, label, desc]) => `<li><span class="swatch" style="--c:${STAIN_COLORS[k]}"></span>
          <span><strong>${label}</strong> <span class="muted">${desc}</span></span></li>`
      ).join('')}
    </ul>`;
}

function membersOf(morph) {
  const ids = IDS.filter((id) => getChromosome(id).morphology === morph);
  return ids.length ? `Human: ${ids.join(', ')}` : 'None in the normal human karyotype';
}

function renderInfo() {
  const c = getChromosome(state.id);
  const m = MORPHOLOGY[c.morphology];
  const pLen = c.cen, qLen = c.total - c.cen;
  $('#info').innerHTML = `
    <div class="eyebrow">Group ${c.group} · ${GROUPS[c.group]}</div>
    <h1 class="info-title">Chromosome <span>${c.id}</span></h1>
    <div class="tags">
      <span class="tag morph-tag" data-morph="${c.morphology}">${m.label}</span>
      ${c.id === 'X' || c.id === 'Y' ? '<span class="tag">Sex chromosome</span>' : '<span class="tag">Autosome</span>'}
      ${c.bands.some((b) => b.stain === 'stalk') ? '<span class="tag">Satellited · NOR</span>' : ''}
    </div>

    <div class="ideo-wrap" id="ideo-wrap">
      <div class="arm-scale">
        <span style="flex:${pLen}" title="p arm · ${formatMb(pLen)}">${c.ci < 0.3 ? 'p' : `p · ${formatMb(pLen, 0)}`}</span>
        <span style="flex:${qLen}">q · ${formatMb(qLen, 0)}</span>
      </div>
      ${ideogramSVG(c, { length: 320, thickness: 22, horizontal: true, interactive: true, className: 'ideo-main' })}
      <div class="band-readout" id="band-readout"><span class="muted">Hover a band here or on the 3D model</span></div>
    </div>

    <div class="stats">
      ${stat('Length', formatMb(c.total))}
      ${stat('Of genome', `${((c.total / GENOME_BP) * 100).toFixed(1)}%`)}
      ${stat('Protein-coding genes', `≈ ${c.genes.toLocaleString('en-US')}`)}
      ${stat('Gene density', `${c.genesPerMb.toFixed(1)} / Mb`)}
      ${stat('Centromere index', `${(c.ci * 100).toFixed(1)}%`)}
      ${stat('Arm ratio q/p', c.armRatio.toFixed(2))}
    </div>

    <div class="size-compare" title="Length relative to chromosome 1">
      <div class="size-bar"><span style="width:${(c.total / LARGEST_BP) * 100}%"></span></div>
      <div class="muted small">${((c.total / LARGEST_BP) * 100).toFixed(0)}% the length of chromosome 1 · ${c.bands.length} bands at this resolution</div>
    </div>

    <h2 class="section-title">Overview</h2>
    <p class="summary">${esc(c.summary)}</p>
    <p class="morph-note"><strong>${m.label}.</strong> ${m.blurb}</p>

    <h2 class="section-title">Notable loci <span class="muted small">hover to locate</span></h2>
    <ul class="loci">
      ${c.loci
        .map(
          (l, i) => `<li><button class="locus" data-locus="${i}">
            <span class="locus-band">${locusLabel(c.id, l.band)}</span>
            <span class="locus-name">${esc(l.name)}</span>
            <span class="locus-note">${esc(l.note)}</span>
          </button></li>`
        )
        .join('')}
    </ul>

    <h2 class="section-title">Associated conditions</h2>
    <div class="conditions">${c.conditions.map((x) => `<span class="condition">${esc(x)}</span>`).join('')}</div>

    <p class="source muted small">Band coordinates: GRCh38 (UCSC cytoBand, ~850-band resolution). Centromere index is calculated from assembly coordinates, where the short arms of acrocentric chromosomes are placeholder sequence, so they read longer than under the microscope. Gene counts are approximate.</p>
  `;
}

const stat = (label, value) => `<div class="stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;

function bandReadout(c, b, withChr = false) {
  const info = STAIN_INFO[b.stain];
  return `<span class="readout-band">${withChr ? `chr${c.id} · ` : ''}${c.id}${b.name}</span>
    <span class="readout-stain"><i class="swatch" style="--c:${STAIN_COLORS[b.stain]}"></i>${info.label}</span>
    <span class="readout-range">${(b.start / 1e6).toFixed(1)}–${(b.end / 1e6).toFixed(1)} Mb</span>`;
}

function syncChrome() {
  const c = getChromosome(state.id);
  document.querySelectorAll('.chip').forEach((el) => el.setAttribute('aria-current', el.dataset.id === state.id));
  document.querySelectorAll('.morph').forEach((el) => el.classList.toggle('active', el.dataset.morph === c.morphology));
  document.querySelectorAll('.segmented button').forEach((b) => b.setAttribute('aria-selected', b.dataset.mode === state.mode));
  $('#stage-title').innerHTML =
    state.mode === 'single'
      ? `<strong>Chromosome ${c.id}</strong><span>${MORPHOLOGY[c.morphology].label} · ${formatMb(c.total)}</span>`
      : `<strong>Human karyotype</strong><span>All 24 chromosome types at true relative scale · click one to inspect</span>`;
  document.body.dataset.mode = state.mode;
}

// ---------- highlight plumbing ----------

function setHover(h) {
  state.hoverRange = h;
  applyHighlight();
}

function applyHighlight() {
  const h = state.hoverRange ?? (state.locusRange && { id: state.id, range: state.locusRange });
  viewer.highlight(h?.id, h?.range ?? null);
  document.querySelectorAll('.ideo-main .band').forEach((el) => {
    const i = +el.dataset.band;
    el.classList.toggle('hl', !!h && h.id === state.id && i >= h.range[0] && i <= h.range[1]);
  });
  const readout = $('#band-readout');
  if (!readout) return;
  const c = getChromosome(state.id);
  readout.innerHTML =
    h && h.id === state.id && h.range[0] === h.range[1]
      ? bandReadout(c, c.bands[h.range[0]])
      : h && h.id === state.id
        ? `<span class="readout-band">${c.id}${c.bands[h.range[0]].name}–${c.bands[h.range[1]].name}</span><span class="readout-range">${(c.bands[h.range[0]].start / 1e6).toFixed(1)}–${(c.bands[h.range[1]].end / 1e6).toFixed(1)} Mb</span>`
        : '<span class="muted">Hover a band here or on the 3D model</span>';
}

// ---------- navigation ----------

function select(id, { mode = state.mode } = {}) {
  const modeChanged = mode !== state.mode;
  const idChanged = id !== state.id;
  state.id = id;
  state.mode = mode;
  state.locusRange = null;
  state.hoverRange = null;
  tooltip.hidden = true;
  if (idChanged || !$('#info').innerHTML) renderInfo();
  if (mode === 'single' && (idChanged || modeChanged || !viewer.mode)) viewer.showSingle(getChromosome(id));
  if (mode === 'karyotype' && (modeChanged || !viewer.mode)) viewer.showKaryotype(IDS.map(getChromosome));
  syncChrome();
  applyHighlight();
  history.replaceState(null, '', mode === 'karyotype' ? `#karyotype/${id}` : `#chr${id}`);
}

function step(delta) {
  const i = IDS.indexOf(state.id);
  select(IDS[(i + delta + IDS.length) % IDS.length]);
}

// ---------- events ----------

$('#picker').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) select(chip.dataset.id, { mode: 'single' });
});

document.querySelector('.segmented').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) select(state.id, { mode: b.dataset.mode });
});

$('#rotate-btn').addEventListener('click', (e) => {
  state.autoRotate = !state.autoRotate;
  e.currentTarget.setAttribute('aria-pressed', state.autoRotate);
  viewer.setAutoRotate(state.autoRotate);
});
$('#reset-btn').addEventListener('click', () => viewer.resetView());
$('#prev-btn').addEventListener('click', () => step(-1));
$('#next-btn').addEventListener('click', () => step(1));

const info = $('#info');
info.addEventListener('pointerover', (e) => {
  const band = e.target.closest('.ideo-main .band');
  if (band) return setHover({ id: state.id, range: [+band.dataset.band, +band.dataset.band] });
  const locus = e.target.closest('.locus');
  if (locus) {
    state.locusRange = getChromosome(state.id).loci[+locus.dataset.locus].range;
    applyHighlight();
  }
});
info.addEventListener('pointerout', (e) => {
  if (e.target.closest('.ideo-main .band')) setHover(null);
  if (e.target.closest('.locus') && !e.relatedTarget?.closest?.('.locus')) {
    state.locusRange = null;
    applyHighlight();
  }
});
info.addEventListener('focusin', (e) => {
  const locus = e.target.closest('.locus');
  if (!locus) return;
  state.locusRange = getChromosome(state.id).loci[+locus.dataset.locus].range;
  applyHighlight();
});
info.addEventListener('focusout', () => {
  state.locusRange = null;
  applyHighlight();
});

window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, textarea')) return;
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});

// ---------- boot ----------

function fromHash() {
  const m = location.hash.match(/^#(?:chr|karyotype\/)?([0-9]{1,2}|X|Y)$/i) ?? [];
  const id = m[1]?.toUpperCase();
  return {
    id: IDS.includes(id) ? id : '1',
    mode: location.hash.startsWith('#karyotype') ? 'karyotype' : 'single',
  };
}

renderPicker();
renderLegend();
const initial = fromHash();
select(initial.id, { mode: initial.mode });
window.addEventListener('hashchange', () => {
  const h = fromHash();
  select(h.id, { mode: h.mode });
});
