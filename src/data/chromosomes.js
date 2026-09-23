// Descriptive data for the 24 human chromosome types.
// Sizes and band coordinates come from bands.json (GRCh38 / UCSC cytoBand).
// Gene counts are approximate protein-coding counts (Ensembl / GENCODE) and are
// rounded on purpose, since they move a little with each annotation release.
// Loci use band names relative to the chromosome ("q31.2"); a two-element array
// is an inclusive range of bands.

export const MORPHOLOGY = {
  metacentric: {
    label: 'Metacentric',
    ci: '≈ 46–50%',
    blurb: 'Centromere near the middle, so the p and q arms are about the same length. The chromosome looks like an X.',
    f: 0.5,
  },
  submetacentric: {
    label: 'Submetacentric',
    ci: '≈ 26–45%',
    blurb: 'Centromere off-centre. The p arm is clearly shorter than the q arm, so the chromosome looks like a lopsided X or a K.',
    f: 0.32,
  },
  acrocentric: {
    label: 'Acrocentric',
    ci: '≈ 10–25%',
    blurb: 'Centromere close to one end. The p arm is tiny, and in chromosomes 13, 14, 15, 21 and 22 it carries a stalk and satellite holding the ribosomal RNA genes.',
    f: 0.14,
  },
  telocentric: {
    label: 'Telocentric',
    ci: '≈ 0%',
    blurb: 'Centromere right at the tip, so there is no p arm at all. This shape is found in mice but not in a normal human karyotype.',
    f: 0.02,
  },
};

export const GROUPS = {
  A: 'Large metacentric / submetacentric (1–3)',
  B: 'Large submetacentric (4–5)',
  C: 'Medium submetacentric (6–12, X)',
  D: 'Medium acrocentric with satellites (13–15)',
  E: 'Short metacentric / submetacentric (16–18)',
  F: 'Short metacentric (19–20)',
  G: 'Short acrocentric (21–22, Y)',
};

export const CHROMOSOMES = [
  {
    id: '1', group: 'A', morphology: 'metacentric', genes: 2000,
    summary: 'The largest human chromosome, with about 8% of the genome. Just below the centromere sits 1q12, a large block of satellite DNA whose size varies a lot from person to person.',
    loci: [
      { name: '1p36 terminal region', band: ['p36.33', 'p36.13'], note: 'Deleted in 1p36 deletion syndrome, the most common terminal deletion in humans.' },
      { name: 'AMY1 cluster', band: 'p21.1', note: 'Salivary amylase genes. The number of copies varies and tracks how much starch a population eats.' },
      { name: '1q12 heterochromatin', band: 'q12', note: 'Satellite III DNA that varies in size between people (1qh+).' },
      { name: 'GBA1', band: 'q22', note: 'Glucocerebrosidase. Mutations cause Gaucher disease and raise Parkinson risk.' },
    ],
    conditions: ['1p36 deletion syndrome', 'Gaucher disease', 'Charcot–Marie–Tooth type 1B'],
  },
  {
    id: '2', group: 'A', morphology: 'submetacentric', genes: 1300,
    summary: 'The second-largest chromosome. It formed when two ancestral ape chromosomes fused end to end, which is why humans have 23 pairs and great apes have 24. The fusion point still shows inverted telomere repeats.',
    loci: [
      { name: 'MSH2', band: 'p21', note: 'DNA mismatch repair. Mutations cause Lynch syndrome (hereditary colorectal cancer).' },
      { name: 'Ancestral fusion site', band: 'q13', note: 'Head-to-head telomeric repeats where chimp chromosomes 2A and 2B joined.' },
      { name: 'LCT / MCM6', band: 'q21.3', note: 'Lactase gene and the enhancer behind adult lactose tolerance.' },
      { name: 'HOXD cluster', band: 'q31.1', note: 'Homeobox genes that pattern the limbs and body axis.' },
    ],
    conditions: ['Lynch syndrome', 'Lactase persistence / non-persistence'],
  },
  {
    id: '3', group: 'A', morphology: 'metacentric', genes: 1080,
    summary: 'A large metacentric chromosome with a near-central centromere. Its short arm (3p) is often lost in lung and kidney cancers because it holds several tumour-suppressor genes.',
    loci: [
      { name: 'VHL', band: 'p25.3', note: 'Tumour suppressor. Loss causes von Hippel–Lindau disease and clear-cell renal carcinoma.' },
      { name: 'MLH1', band: 'p22.2', note: 'Mismatch repair gene, the second major Lynch syndrome gene.' },
      { name: 'FHIT / FRA3B', band: 'p14.2', note: 'The most active common fragile site in the human genome.' },
      { name: 'SOX2', band: 'q26.33', note: 'Transcription factor that keeps stem cells pluripotent.' },
    ],
    conditions: ['von Hippel–Lindau disease', 'Lynch syndrome', '3q29 microdeletion syndrome'],
  },
  {
    id: '4', group: 'B', morphology: 'submetacentric', genes: 750,
    summary: 'A large submetacentric chromosome that is relatively gene-poor. The tip of its short arm (4p16.3) holds the genes behind Huntington disease and achondroplasia.',
    loci: [
      { name: 'HTT', band: 'p16.3', note: 'Huntingtin. An expanded CAG repeat causes Huntington disease.' },
      { name: 'FGFR3', band: 'p16.3', note: 'A gain-of-function mutation causes achondroplasia, the most common form of dwarfism.' },
      { name: 'KIT', band: 'q12', note: 'Receptor tyrosine kinase that drives gastrointestinal stromal tumours.' },
      { name: 'SNCA', band: 'q22.1', note: 'α-synuclein, the main protein in the Lewy bodies of Parkinson disease.' },
    ],
    conditions: ['Huntington disease', 'Wolf–Hirschhorn syndrome (4p−)', 'Achondroplasia'],
  },
  {
    id: '5', group: 'B', morphology: 'submetacentric', genes: 880,
    summary: 'A large submetacentric chromosome. Losing the end of its short arm causes cri-du-chat syndrome, named for the cat-like cry of affected infants.',
    loci: [
      { name: 'Cri-du-chat region', band: ['p15.33', 'p15.2'], note: 'Terminal 5p deletion that causes cri-du-chat (5p−) syndrome.' },
      { name: 'SMN1 / SMN2', band: 'q13.2', note: 'Survival motor neuron genes. Losing SMN1 causes spinal muscular atrophy.' },
      { name: 'APC', band: 'q22.2', note: 'Gatekeeper tumour suppressor mutated in familial adenomatous polyposis.' },
      { name: 'NSD1', band: 'q35.3', note: 'Histone methyltransferase. Loss causes Sotos (overgrowth) syndrome.' },
    ],
    conditions: ['Cri-du-chat syndrome', 'Spinal muscular atrophy', 'Familial adenomatous polyposis'],
  },
  {
    id: '6', group: 'C', morphology: 'submetacentric', genes: 1040,
    summary: 'Home of the major histocompatibility complex (MHC/HLA), the most gene-dense and most variable region of the genome. It shapes immune responses, transplant matching and autoimmune risk.',
    loci: [
      { name: 'HFE', band: 'p22.2', note: 'Iron regulation. The C282Y variant causes hereditary haemochromatosis.' },
      { name: 'MHC / HLA complex', band: ['p22.1', 'p21.32'], note: 'Highly polymorphic HLA genes that present antigens to T cells.' },
      { name: 'PRKN', band: 'q26', note: 'Parkin. Mutations cause early-onset recessive Parkinson disease.' },
    ],
    conditions: ['Hereditary haemochromatosis', 'HLA-linked autoimmunity (e.g. type 1 diabetes, coeliac disease)'],
  },
  {
    id: '7', group: 'C', morphology: 'submetacentric', genes: 920,
    summary: 'A medium submetacentric chromosome. It carries CFTR, the cystic fibrosis gene, and the 7q11.23 region that is deleted in Williams syndrome.',
    loci: [
      { name: 'EGFR', band: 'p11.2', note: 'Growth-factor receptor, often mutated or amplified in lung cancer and glioblastoma.' },
      { name: 'Williams region', band: 'q11.23', note: 'A ~1.5 Mb deletion here causes Williams–Beuren syndrome.' },
      { name: 'FOXP2', band: 'q31.1', note: 'Transcription factor involved in speech and language development.' },
      { name: 'CFTR', band: 'q31.2', note: 'Chloride channel. Loss-of-function variants cause cystic fibrosis.' },
    ],
    conditions: ['Cystic fibrosis', 'Williams–Beuren syndrome'],
  },
  {
    id: '8', group: 'C', morphology: 'submetacentric', genes: 680,
    summary: 'A medium submetacentric chromosome that carries MYC, one of the most studied oncogenes. The t(8;14) translocation, which puts MYC next to the antibody heavy-chain locus, drives Burkitt lymphoma.',
    loci: [
      { name: 'WRN', band: 'p12', note: 'RecQ helicase. Loss causes Werner (premature ageing) syndrome.' },
      { name: 'FGFR1', band: 'p11.23', note: 'Growth-factor receptor, amplified in some breast and lung cancers.' },
      { name: 'MYC', band: 'q24.21', note: 'Master transcriptional oncogene, deregulated in many cancers.' },
    ],
    conditions: ['Burkitt lymphoma t(8;14)', 'Werner syndrome'],
  },
  {
    id: '9', group: 'C', morphology: 'submetacentric', genes: 780,
    summary: 'A medium submetacentric chromosome with a large variable heterochromatin block (9qh) next to the centromere. Its ABL1 gene forms the BCR-ABL1 fusion of the Philadelphia chromosome.',
    loci: [
      { name: 'CDKN2A (p16)', band: 'p21.3', note: 'Cell-cycle brake, one of the most often deleted genes in cancer.' },
      { name: '9q heterochromatin', band: 'q12', note: 'Satellite DNA block, often inverted as a harmless variant, inv(9).' },
      { name: 'ABL1', band: 'q34.12', note: 'Tyrosine kinase that fuses with BCR in chronic myeloid leukaemia.' },
      { name: 'ABO', band: 'q34.2', note: 'Glycosyltransferase that sets the A, B, AB or O blood group.' },
    ],
    conditions: ['Chronic myeloid leukaemia t(9;22)', 'Tuberous sclerosis (TSC1)'],
  },
  {
    id: '10', group: 'C', morphology: 'submetacentric', genes: 730,
    summary: 'A medium submetacentric chromosome with key growth-signalling genes. Mutations here cause several inherited cancer and craniofacial syndromes.',
    loci: [
      { name: 'RET', band: 'q11.21', note: 'Receptor tyrosine kinase. Mutations cause MEN2 and Hirschsprung disease.' },
      { name: 'PTEN', band: 'q23.31', note: 'Phosphatase tumour suppressor, lost in many cancers and in Cowden syndrome.' },
      { name: 'FGFR2', band: 'q26.13', note: 'Mutations cause Crouzon, Apert and Pfeiffer craniosynostosis.' },
    ],
    conditions: ['Multiple endocrine neoplasia type 2', 'Cowden syndrome', 'Apert / Crouzon syndromes'],
  },
  {
    id: '11', group: 'C', morphology: 'submetacentric', genes: 1300,
    summary: 'A gene-rich submetacentric chromosome. It holds the β-globin cluster (sickle-cell disease), the insulin gene, and the largest family of olfactory receptor genes in the genome.',
    loci: [
      { name: 'INS', band: 'p15.5', note: 'The insulin gene, inside an imprinted domain linked to Beckwith–Wiedemann syndrome.' },
      { name: 'HBB cluster', band: 'p15.4', note: 'β-globin. The Glu6Val change causes sickle-cell disease.' },
      { name: 'WT1', band: 'p13', note: 'Wilms tumour suppressor, needed for kidney and gonad development.' },
      { name: 'ATM', band: 'q22.3', note: 'DNA damage kinase. Loss causes ataxia-telangiectasia.' },
    ],
    conditions: ['Sickle-cell disease', 'β-thalassaemia', 'Beckwith–Wiedemann syndrome', 'Ataxia-telangiectasia'],
  },
  {
    id: '12', group: 'C', morphology: 'submetacentric', genes: 1030,
    summary: 'A medium submetacentric chromosome with a short p arm. It carries KRAS, one of the most often mutated oncogenes, and PAH, the phenylketonuria gene.',
    loci: [
      { name: 'VWF', band: 'p13.31', note: 'von Willebrand factor. Defects cause the most common inherited bleeding disorder.' },
      { name: 'KRAS', band: 'p12.1', note: 'GTPase oncogene, mutated in most pancreatic cancers.' },
      { name: 'HOXC cluster', band: 'q13.13', note: 'Homeobox genes that pattern the body axis.' },
      { name: 'PAH', band: 'q23.2', note: 'Phenylalanine hydroxylase. Loss causes phenylketonuria (PKU).' },
    ],
    conditions: ['Phenylketonuria', 'von Willebrand disease', 'Noonan syndrome (PTPN11)'],
  },
  {
    id: '13', group: 'D', morphology: 'acrocentric', genes: 320,
    summary: 'The largest acrocentric chromosome and fairly gene-poor. Its tiny p arm has a stalk that holds ribosomal RNA genes (a nucleolus organiser region, NOR). Trisomy 13 causes Patau syndrome.',
    loci: [
      { name: 'NOR (rDNA)', band: 'p12', note: 'Stalk with tandem ribosomal RNA gene repeats that build the nucleolus.' },
      { name: 'BRCA2', band: 'q13.1', note: 'Homologous-recombination repair gene linked to hereditary breast and ovarian cancer.' },
      { name: 'RB1', band: 'q14.2', note: 'Retinoblastoma protein, the first tumour-suppressor gene ever cloned.' },
    ],
    conditions: ['Patau syndrome (trisomy 13)', 'Retinoblastoma', 'Hereditary breast / ovarian cancer'],
  },
  {
    id: '14', group: 'D', morphology: 'acrocentric', genes: 610,
    summary: 'An acrocentric chromosome with a satellited p arm. The end of its q arm holds the immunoglobulin heavy-chain locus (IGH), which often takes part in lymphoma translocations.',
    loci: [
      { name: 'NOR (rDNA)', band: 'p12', note: 'Ribosomal RNA gene array on the acrocentric stalk.' },
      { name: 'PSEN1', band: 'q24.2', note: 'Presenilin 1, the most common cause of early-onset familial Alzheimer disease.' },
      { name: 'SERPINA1', band: 'q32.13', note: 'α1-antitrypsin. Deficiency damages the lungs and liver.' },
      { name: 'IGH locus', band: 'q32.33', note: 'Antibody heavy-chain genes, partner in t(8;14) and t(14;18).' },
    ],
    conditions: ['α1-antitrypsin deficiency', 'Early-onset Alzheimer disease', 'Robertsonian translocations (13;14)'],
  },
  {
    id: '15', group: 'D', morphology: 'acrocentric', genes: 600,
    summary: 'An acrocentric chromosome that is a classic example of genomic imprinting. The same 15q11–q13 deletion causes Prader–Willi syndrome when inherited from the father and Angelman syndrome when inherited from the mother.',
    loci: [
      { name: 'NOR (rDNA)', band: 'p12', note: 'Ribosomal RNA gene array on the acrocentric stalk.' },
      { name: 'PWS / AS region', band: ['q11.2', 'q13.1'], note: 'Imprinted domain (SNRPN, UBE3A) behind Prader–Willi and Angelman syndromes.' },
      { name: 'FBN1', band: 'q21.1', note: 'Fibrillin-1. Mutations cause Marfan syndrome.' },
      { name: 'HEXA', band: 'q23', note: 'β-hexosaminidase A. Loss causes Tay–Sachs disease.' },
    ],
    conditions: ['Prader–Willi syndrome', 'Angelman syndrome', 'Marfan syndrome', 'Tay–Sachs disease'],
  },
  {
    id: '16', group: 'E', morphology: 'metacentric', genes: 860,
    summary: 'A short chromosome, classed as metacentric (its centromere index is on the border with submetacentric). It has a heterochromatin block next to the centromere and the α-globin genes near the tip of 16p.',
    loci: [
      { name: 'HBA1 / HBA2, PKD1', band: 'p13.3', note: 'α-globin (α-thalassaemia) and polycystin-1 (polycystic kidney disease).' },
      { name: '16q heterochromatin', band: 'q11.2', note: 'Variable satellite DNA block (16qh).' },
      { name: 'FTO', band: 'q12.2', note: 'The locus most strongly linked to common obesity risk.' },
      { name: 'CDH1', band: 'q22.1', note: 'E-cadherin. Loss causes hereditary diffuse gastric cancer.' },
    ],
    conditions: ['α-thalassaemia', 'Autosomal dominant polycystic kidney disease', '16p11.2 CNV (autism risk)'],
  },
  {
    id: '17', group: 'E', morphology: 'submetacentric', genes: 1190,
    summary: 'A short but very gene-dense submetacentric chromosome. It carries TP53, known as the "guardian of the genome", along with BRCA1 and several well-known microdeletion regions.',
    loci: [
      { name: 'TP53', band: 'p13.1', note: 'The most often mutated gene in human cancer. Germline loss causes Li–Fraumeni syndrome.' },
      { name: 'Smith–Magenis region', band: 'p11.2', note: 'RAI1 deletion causes Smith–Magenis syndrome. The duplication causes Potocki–Lupski syndrome.' },
      { name: 'NF1', band: 'q11.2', note: 'Neurofibromin. Loss causes neurofibromatosis type 1.' },
      { name: 'ERBB2 (HER2)', band: 'q12', note: 'Amplified in about 20% of breast cancers. Targeted by trastuzumab.' },
      { name: 'BRCA1', band: 'q21.31', note: 'DNA repair gene linked to hereditary breast and ovarian cancer.' },
    ],
    conditions: ['Li–Fraumeni syndrome', 'Neurofibromatosis type 1', 'Hereditary breast / ovarian cancer'],
  },
  {
    id: '18', group: 'E', morphology: 'submetacentric', genes: 270,
    summary: 'A short, gene-poor submetacentric chromosome. Because it has so few genes, a full trisomy (Edwards syndrome) is compatible with birth, although survival is usually short.',
    loci: [
      { name: 'SMAD4', band: 'q21.2', note: 'TGF-β signalling mediator, lost in pancreatic and colorectal cancer.' },
      { name: 'TCF4', band: 'q21.2', note: 'Transcription factor. Haploinsufficiency causes Pitt–Hopkins syndrome.' },
      { name: 'MC4R', band: 'q21.32', note: 'Melanocortin-4 receptor, the most common single-gene cause of obesity.' },
    ],
    conditions: ['Edwards syndrome (trisomy 18)', '18q deletion syndrome'],
  },
  {
    id: '19', group: 'F', morphology: 'metacentric', genes: 1470,
    summary: 'The most gene-dense human chromosome, with more than 20 genes per megabase. It carries large clusters of zinc-finger genes and important genes for cholesterol and lipid metabolism.',
    loci: [
      { name: 'LDLR', band: 'p13.2', note: 'LDL receptor. Mutations cause familial hypercholesterolaemia.' },
      { name: 'ZNF cluster', band: 'p12', note: 'One of the largest clusters of KRAB zinc-finger genes.' },
      { name: 'APOE', band: 'q13.32', note: 'Apolipoprotein E. The ε4 allele is the strongest common risk factor for Alzheimer disease.' },
      { name: 'DMPK', band: 'q13.32', note: 'An expanded CTG repeat causes myotonic dystrophy type 1.' },
    ],
    conditions: ['Familial hypercholesterolaemia', 'Myotonic dystrophy type 1', 'Late-onset Alzheimer risk (APOE ε4)'],
  },
  {
    id: '20', group: 'F', morphology: 'metacentric', genes: 550,
    summary: 'A short metacentric chromosome. It carries the imprinted GNAS locus and the prion protein gene, and 20q is often gained in colorectal cancer.',
    loci: [
      { name: 'PRNP', band: 'p13', note: 'Prion protein. Misfolding causes Creutzfeldt–Jakob disease.' },
      { name: 'JAG1', band: 'p12.2', note: 'Notch ligand. Haploinsufficiency causes Alagille syndrome.' },
      { name: 'ADA', band: 'q13.12', note: 'Adenosine deaminase. Loss causes SCID. It was the first gene therapy target.' },
      { name: 'GNAS', band: 'q13.32', note: 'Imprinted G-protein locus behind McCune–Albright syndrome and pseudohypoparathyroidism.' },
    ],
    conditions: ['Alagille syndrome', 'ADA-SCID', 'McCune–Albright syndrome'],
  },
  {
    id: '21', group: 'G', morphology: 'acrocentric', genes: 230,
    summary: 'The smallest human chromosome. It is listed as number 21 because early karyotypes mis-sized it relative to 22. Trisomy 21 causes Down syndrome, the most common viable autosomal aneuploidy.',
    loci: [
      { name: 'NOR (rDNA)', band: 'p12', note: 'Ribosomal RNA gene array on the acrocentric stalk.' },
      { name: 'APP', band: 'q21.3', note: 'Amyloid precursor protein. Its extra dose explains early Alzheimer pathology in Down syndrome.' },
      { name: 'RUNX1', band: 'q22.12', note: 'Blood-development transcription factor, often translocated in leukaemia.' },
      { name: 'Down syndrome critical region', band: 'q22.13', note: 'Holds DYRK1A and other dosage-sensitive genes.' },
    ],
    conditions: ['Down syndrome (trisomy 21)', 'Acute myeloid leukaemia t(8;21)'],
  },
  {
    id: '22', group: 'G', morphology: 'acrocentric', genes: 440,
    summary: 'A small acrocentric chromosome. In 1999 it was the first human chromosome to be fully sequenced. It is involved in the Philadelphia translocation and the common 22q11.2 microdeletion.',
    loci: [
      { name: 'NOR (rDNA)', band: 'p12', note: 'Ribosomal RNA gene array on the acrocentric stalk.' },
      { name: '22q11.2 deletion region', band: 'q11.21', note: 'Deleted in DiGeorge / velocardiofacial syndrome (TBX1).' },
      { name: 'BCR', band: 'q11.23', note: 'Fuses with ABL1 on chromosome 9 to form the Philadelphia chromosome.' },
      { name: 'NF2', band: 'q12.2', note: 'Merlin. Loss causes neurofibromatosis type 2.' },
    ],
    conditions: ['22q11.2 deletion syndrome', 'Chronic myeloid leukaemia t(9;22)', 'Neurofibromatosis type 2'],
  },
  {
    id: 'X', group: 'C', morphology: 'submetacentric', genes: 840,
    summary: 'A medium submetacentric sex chromosome. Females have two X chromosomes and silence one of them through XIST-driven X-inactivation. Males have one, so recessive X-linked disorders show up mainly in males.',
    loci: [
      { name: 'PAR1', band: 'p22.33', note: 'Pseudoautosomal region that pairs and recombines with Y during male meiosis.' },
      { name: 'DMD', band: ['p21.2', 'p21.1'], note: 'Dystrophin, the largest human gene at ~2.2 Mb. Causes Duchenne and Becker muscular dystrophy.' },
      { name: 'XIST', band: 'q13.2', note: 'Non-coding RNA that coats and silences one X in female cells.' },
      { name: 'FMR1', band: 'q27.3', note: 'A CGG repeat expansion causes fragile X syndrome.' },
      { name: 'F8', band: 'q28', note: 'Clotting factor VIII. Loss causes haemophilia A.' },
    ],
    conditions: ['Duchenne muscular dystrophy', 'Haemophilia A and B', 'Fragile X syndrome', 'Turner (45,X) / Klinefelter (47,XXY)'],
  },
  {
    id: 'Y', group: 'G', morphology: 'acrocentric', genes: 63,
    summary: 'The small sex chromosome passed from father to son. It has the fewest genes, but SRY on its short arm triggers male development. Much of Yq is repetitive heterochromatin that varies in length between men.',
    loci: [
      { name: 'PAR1', band: 'p11.32', note: 'Pseudoautosomal region shared with X, needed for male meiotic pairing.' },
      { name: 'SRY', band: 'p11.2', note: 'Sex-determining region Y, the switch that starts testis development.' },
      { name: 'AZF regions', band: ['q11.221', 'q11.23'], note: 'Azoospermia factor genes. Deletions cause male infertility.' },
      { name: 'Yq12 heterochromatin', band: 'q12', note: 'DYZ1/DYZ2 satellite arrays that vary in length.' },
    ],
    conditions: ['Y microdeletion infertility', 'Swyer syndrome (SRY loss)', 'XX male syndrome (SRY translocation)'],
  },
];
