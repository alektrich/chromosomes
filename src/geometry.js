import * as THREE from 'three';
import { LARGEST_BP } from './model.js';

// Scene scale: chromosome 1 is 10 units long. Every chromosome uses the same
// scale, so relative sizes and arm lengths are true to the assembly.
export const UNITS_PER_BP = 10 / LARGEST_BP;
export const CHROMATID_RADIUS = 0.34;

// Giemsa (G-banding) stain palette, also used by the 2D ideograms and legend.
export const STAIN_COLORS = {
  gneg: '#efe9dc',
  gpos25: '#c6bca9',
  gpos50: '#958a78',
  gpos75: '#62594d',
  gpos100: '#2d2824',
  acen: '#d9534f',
  gvar: '#6f93c6',
  stalk: '#8fa3b8',
};

const RING_SEGMENTS = 40;
const SAMPLES_PER_UNIT = 70;
const CAP_SAMPLES = 18;

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Builds a metaphase chromosome (two sister chromatids joined at the centromere).
 * Local frame: centromere at y = 0, p arm pointing +y, q arm pointing -y.
 * Returns a Group whose userData exposes helpers for hover picking and highlighting.
 */
export function buildChromosome(c) {
  const k = UNITS_PER_BP;
  const R = CHROMATID_RADIUS;
  const { bands, total, cen } = c;

  // Sample positions (in bp) along the chromosome. Band edges get a pair of
  // samples a hair apart, so colour changes stay sharp and do not bleed across triangles.
  const eps = 0.0004 / k;
  const samples = [];
  const n = Math.ceil(total * k * SAMPLES_PER_UNIT);
  for (let i = 0; i <= n; i++) samples.push((total * i) / n);
  for (let j = 1; j <= CAP_SAMPLES; j++) {
    const d = (R * (1 - Math.cos((j / CAP_SAMPLES) * (Math.PI / 2)))) / k;
    samples.push(d, total - d);
  }
  for (let i = 1; i < bands.length; i++) samples.push(bands[i].start - eps, bands[i].start + eps);
  samples.sort((a, b) => a - b);
  const s = samples.filter((v, i) => v >= 0 && v <= total && (i === 0 || v - samples[i - 1] > eps * 0.25));

  const stalks = bands.filter((b) => b.stain === 'stalk').map((b) => [b.start * k, b.end * k]);

  const profile = (bp) => {
    const u = bp * k;
    const y = (cen - bp) * k;
    let r = R;
    r *= 1 - 0.44 * Math.exp(-(y * y) / 0.045); // primary constriction
    for (const [a, b] of stalks) {
      const f = smoothstep(a - 0.06, a + 0.06, u) * (1 - smoothstep(b - 0.06, b + 0.06, u));
      r *= 1 - 0.62 * f; // secondary constriction (NOR stalk)
    }
    const d = Math.min(u, total * k - u); // distance to nearest telomere
    if (d < R) r *= Math.sqrt(Math.max(0, 1 - ((R - d) / R) ** 2));
    return Math.max(r, 0.002);
  };

  const bandIdx = new Array(s.length);
  for (let i = 0, b = 0; i < s.length; i++) {
    while (b < bands.length - 1 && s[i] >= bands[b].end) b++;
    bandIdx[i] = b;
  }
  const colorOf = bands.map((b) => new THREE.Color(STAIN_COLORS[b.stain] ?? STAIN_COLORS.gneg));

  const material = createBandMaterial();
  const group = new THREE.Group();
  group.name = `chr${c.id}`;

  for (const side of [-1, 1]) {
    const geo = chromatidGeometry(s, side, { k, R, cen, profile, bandIdx, colorOf });
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = false;
    mesh.userData.chromosomeId = c.id;
    group.add(mesh);
  }

  group.userData = {
    id: c.id,
    material,
    top: cen * k,
    bottom: (cen - total) * k,
    bpAtY: (y) => cen - y / k,
    yAtBp: (bp) => (cen - bp) * k,
  };
  return group;
}

function chromatidGeometry(s, side, { k, R, cen, profile, bandIdx, colorOf }) {
  const M = RING_SEGMENTS;
  const rings = s.length;
  const pos = new Float32Array(rings * M * 3);
  const col = new Float32Array(rings * M * 3);
  const band = new Float32Array(rings * M);

  for (let i = 0; i < rings; i++) {
    const y = (cen - s[i]) * k;
    const r = profile(s[i]);
    // Chromatids are fused at the centromere and drift apart toward the telomeres.
    const sep = R * (0.7 + 0.36 * (1 - Math.exp(-y * y))) + 0.018 * Math.abs(y);
    const cx = side * sep;
    const cz = -0.01 * y * y;
    // Low-amplitude helical ripple that hints at the coiled chromatin fibre.
    const ripple = 0.018 * smoothstep(0.35 * R, 0.9 * R, r);
    const color = colorOf[bandIdx[i]];
    for (let j = 0; j < M; j++) {
      const th = (j / M) * Math.PI * 2;
      const rr = r * (1 + ripple * Math.sin(y * 16 + side * th));
      const o = (i * M + j) * 3;
      pos[o] = cx + rr * Math.cos(th);
      pos[o + 1] = y;
      pos[o + 2] = cz + rr * Math.sin(th);
      col[o] = color.r;
      col[o + 1] = color.g;
      col[o + 2] = color.b;
      band[i * M + j] = bandIdx[i];
    }
  }

  const index = [];
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * M + j;
      const b = i * M + ((j + 1) % M);
      const c = (i + 1) * M + j;
      const d = (i + 1) * M + ((j + 1) % M);
      index.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aBand', new THREE.BufferAttribute(band, 1));
  geo.setIndex(index);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

// Physical material with vertex band colours, plus a shader hook that lights up
// a range of bands (hover or locus highlight).
function createBandMaterial() {
  const uniforms = {
    uHlMin: { value: -10 },
    uHlMax: { value: -10 },
    uTime: { value: 0 },
  };
  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    sheen: 0.6,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#9fc4ff'),
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aBand;\nvarying float vBand;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBand = aBand;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vBand;\nuniform float uHlMin;\nuniform float uHlMax;\nuniform float uTime;'
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        bool hl = vBand > uHlMin - 0.5 && vBand < uHlMax + 0.5;
        if (hl) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.52, 0.08), 0.7);`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        if (hl) totalEmissiveRadiance += vec3(1.0, 0.45, 0.05) * (0.28 + 0.14 * sin(uTime * 5.0));`
      );
  };
  material.userData.uniforms = uniforms;
  return material;
}

export function setHighlight(group, range) {
  const u = group.userData.material.userData.uniforms;
  u.uHlMin.value = range ? range[0] : -10;
  u.uHlMax.value = range ? range[1] : -10;
}
