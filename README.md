# Chromosome Atlas

Interactive 3D atlas of the 24 human chromosome types, built with three.js.

- Procedural 3D metaphase chromosomes (two sister chromatids, centromere constriction,
  telomere caps, NOR stalks and satellites on the acrocentrics) at true relative scale.
- Real GRCh38 G-banding from UCSC `cytoBand`, painted per vertex. Hover any band in 3D or on
  the ideogram to read its name, stain and coordinates.
- Morphology legend (metacentric / submetacentric / acrocentric / telocentric), anatomy and stain keys.
- Per-chromosome overview: Denver group, centromere index, arm ratio, gene density, notable loci
  (hover to light them up on the model) and associated conditions.
- Karyotype view with all 24 chromosomes aligned on their centromeres.

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # static site in dist/
npm run data:bands   # regenerate src/data/bands.json from scripts/cytoBand.hg38.txt
```

Deep links: `#chr7`, `#chrX`, `#karyotype/21`. Arrow keys step through chromosomes.
