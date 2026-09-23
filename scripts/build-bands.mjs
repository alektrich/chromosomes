// Converts UCSC hg38 cytoBand.txt into a compact JSON used by the app.
// Source: https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/cytoBand.txt.gz
import { readFileSync, writeFileSync } from 'node:fs';

const ids = [...Array.from({ length: 22 }, (_, i) => String(i + 1)), 'X', 'Y'];
const out = {};
for (const line of readFileSync(new URL('./cytoBand.hg38.txt', import.meta.url), 'utf8').split('\n')) {
  const [chr, start, end, name, stain] = line.split('\t');
  const id = chr?.replace(/^chr/, '');
  if (!ids.includes(id)) continue;
  (out[id] ??= []).push([+start, +end, name, stain]);
}
for (const id of ids) out[id].sort((a, b) => a[0] - b[0]);
writeFileSync(new URL('../src/data/bands.json', import.meta.url), JSON.stringify(out));
console.log('wrote', ids.map((id) => `${id}:${out[id].length}`).join(' '));
