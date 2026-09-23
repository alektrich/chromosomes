import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildChromosome, setHighlight, CHROMATID_RADIUS as R } from './geometry.js';
import { bandIndexAt } from './model.js';

const KARYOTYPE_ROWS = [
  [['1', '2', '3'], ['4', '5']],
  [['6', '7', '8', '9', '10', '11', '12']],
  [['13', '14', '15'], ['16', '17', '18']],
  [['19', '20'], ['21', '22'], ['X', 'Y']],
];

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class Viewer {
  constructor(container, { getChromosome, onHover, onPick }) {
    this.container = container;
    this.getChromosome = getChromosome;
    this.onHover = onHover;
    this.onPick = onPick;
    this.groups = new Map(); // id -> chromosome group currently in the scene
    this.mode = null;
    this.tween = null;
    this.pointer = null;
    this.pointerDirty = false;
    this.hoverKey = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const labels = new CSS2DRenderer();
    labels.domElement.className = 'label-layer';
    container.appendChild(labels.domElement);
    this.labelRenderer = labels;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();
    this.scene = scene;

    const key = new THREE.DirectionalLight('#fff4e6', 1.8);
    key.position.set(6, 10, 12);
    const rim = new THREE.DirectionalLight('#6aa8ff', 2.4);
    rim.position.set(-10, 4, -8);
    const fill = new THREE.HemisphereLight('#bcd4ff', '#1a1420', 0.5);
    scene.add(key, rim, fill);

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
    this.camera.position.set(0, 0, 20);

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotateSpeed = 1.2;
    controls.minDistance = 1.5;
    controls.maxDistance = 85;
    controls.addEventListener('start', () => (this.tween = null));
    this.controls = controls;

    this.root = new THREE.Group();
    scene.add(this.root);
    scene.add(this.#makeDust());

    this.raycaster = new THREE.Raycaster();
    this.#bindPointer();

    this.timer = new THREE.Timer();
    this.timer.connect(document);
    new ResizeObserver(() => this.#resize()).observe(container);
    this.#resize();
    renderer.setAnimationLoop(() => this.#frame());
  }

  // ---------- public API ----------

  showSingle(c) {
    this.#clear();
    this.mode = 'single';
    const g = buildChromosome(c);
    this.root.add(g);
    this.groups.set(c.id, g);
    g.add(this.#makeRuler(c, g));
    this.#addAnatomyLabels(c, g);

    // Frame the model plus its ruler and labels. Small chromosomes get a minimum
    // frame height so labels stay readable and the true scale still shows.
    const { top, bottom } = g.userData;
    const mid = (top + bottom) / 2;
    const half = Math.max((top - bottom) / 2, 1.9);
    const box = new THREE.Box3(new THREE.Vector3(-R * 3.4 - 1.1, mid - half, -R), new THREE.Vector3(R * 3 + 2.4, mid + half, R));
    box.max.y += half * 0.16 + 0.3; // headroom for the title overlay
    const dir = new THREE.Vector3(0.3, 0.1, 1).normalize();
    this.#fit(box, dir, 1.18);
    this.controls.autoRotate = this.autoRotate ?? true;
  }

  showKaryotype(chromosomes) {
    this.#clear();
    this.mode = 'karyotype';
    const byId = new Map(chromosomes.map((c) => [c.id, c]));
    const pitch = 2.0;
    const groupGap = 1.3;
    let cursorY = 0;
    const box = new THREE.Box3();

    for (const row of KARYOTYPE_ROWS) {
      const built = row.map((set) => set.map((id) => buildChromosome(byId.get(id))));
      const flat = built.flat();
      const top = Math.max(...flat.map((g) => g.userData.top));
      const bottom = Math.min(...flat.map((g) => g.userData.bottom));
      const width = flat.length * pitch + (row.length - 1) * groupGap - pitch;
      const rowY = cursorY - top; // centromeres of a row sit on one line
      let x = -width / 2;
      built.forEach((set, si) => {
        if (si > 0) x += groupGap;
        for (const g of set) {
          g.position.set(x, rowY, 0);
          this.root.add(g);
          this.groups.set(g.userData.id, g);
          const label = makeLabel(g.userData.id, 'k-label');
          label.position.set(0, g.userData.bottom - 0.55, 0);
          g.add(label);
          x += pitch;
        }
      });
      cursorY = rowY + bottom - 1.9;
    }

    this.root.updateMatrixWorld(true);
    box.setFromObject(this.root);
    box.expandByScalar(0.6);
    box.min.y -= 1.0; // room for the number labels under the last row
    box.max.y += 2.6; // clear the title overlay at the top of the stage
    this.#fit(box, new THREE.Vector3(0, 0, 1), 1.02);
    this.controls.autoRotate = false;
  }

  highlight(id, range) {
    for (const [gid, g] of this.groups) setHighlight(g, gid === id ? range : null);
  }

  setAutoRotate(on) {
    this.autoRotate = on;
    if (this.mode === 'single') this.controls.autoRotate = on;
  }

  resetView() {
    if (this.lastFit) this.#fit(...this.lastFit);
  }

  // ---------- internals ----------

  #clear() {
    for (const g of this.groups.values()) {
      g.traverse((o) => {
        if (o.isMesh || o.isLineSegments) o.geometry.dispose();
        if (o.isCSS2DObject) o.element.remove();
      });
      g.userData.material?.dispose();
    }
    this.root.clear();
    this.groups.clear();
    this.hoverKey = null;
  }

  #fit(box, dir, margin) {
    this.lastFit = [box, dir, margin];
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const aspect = this.camera.aspect;
    const distH = size.y / 2 / Math.tan(vfov / 2);
    const distW = size.x / 2 / (Math.tan(vfov / 2) * aspect);
    const dist = Math.max(distH, distW) * margin + size.z / 2;
    this.tween = {
      t0: performance.now(),
      dur: 900,
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: center.clone().addScaledVector(dir, dist),
      toTarget: center,
    };
  }

  #makeRuler(c, g) {
    const { yAtBp } = g.userData;
    const x = -R * 3.4;
    const pts = [x, g.userData.top, 0, x, g.userData.bottom, 0];
    const mb = c.total / 1e6;
    const labelEvery = mb > 150 ? 50 : mb > 70 ? 20 : 10;
    const ruler = new THREE.Group();
    for (let m = 0; m <= mb; m += 10) {
      const y = yAtBp(m * 1e6);
      const major = m % labelEvery === 0;
      const len = major ? 0.2 : 0.1;
      pts.push(x - len, y, 0, x, y, 0);
      if (major) {
        const l = makeLabel(m === 0 ? '0 Mb' : `${m}`, 'ruler-label');
        l.center.set(1, 0.5);
        l.position.set(x - 0.28, y, 0);
        ruler.add(l);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const line = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: '#7e8aa6', transparent: true, opacity: 0.55 })
    );
    ruler.add(line);
    return ruler;
  }

  #addAnatomyLabels(c, g) {
    const { yAtBp, top, bottom } = g.userData;
    const L = top - bottom;
    const acro = c.morphology === 'acrocentric';
    const stalk = c.bands.find((b) => b.stain === 'stalk');
    const items = [
      { y: top, text: acro && stalk ? 'satellite · telomere' : 'telomere (pter)' },
      ...(stalk ? [{ y: yAtBp((stalk.start + stalk.end) / 2), text: 'stalk · NOR' }] : []),
      { y: top / 2, text: 'p arm', strong: true },
      { y: 0, text: 'centromere', accent: true },
      { y: bottom / 2, text: 'q arm', strong: true },
      { y: bottom, text: 'telomere (qter)' },
    ];
    // Relax labels vertically so they never overlap on small chromosomes.
    items.sort((a, b) => b.y - a.y);
    const gap = Math.max(0.3, L * 0.075);
    const placed = items.map((it) => ({ ...it, py: it.y }));
    for (let i = 1; i < placed.length; i++) {
      placed[i].py = Math.min(placed[i].py, placed[i - 1].py - gap);
    }
    const drift = (placed.at(-1).py - bottom) / 2;
    if (drift < 0) placed.forEach((p) => (p.py -= drift));
    for (const p of placed) {
      const l = makeLabel(p.text, `anat-label${p.strong ? ' strong' : ''}${p.accent ? ' accent' : ''}`);
      l.center.set(0, 0.5);
      l.position.set(R * 3.0, p.py, 0);
      g.add(l);
    }
  }

  #makeDust() {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 95 + Math.random() * 70;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: '#8fb3ff', size: 0.45, transparent: true, opacity: 0.4, depthWrite: false })
    );
    this.dust = dust;
    return dust;
  }

  #bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointermove', (e) => {
      this.pointer = { x: e.clientX, y: e.clientY };
      this.pointerDirty = true;
    });
    el.addEventListener('pointerleave', () => {
      this.pointer = null;
      this.pointerDirty = true;
    });
    el.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
    el.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
      const hit = this.#pick(e.clientX, e.clientY);
      if (hit) this.onPick?.(hit);
    });
  }

  #pick(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const meshes = [...this.groups.values()].flatMap((g) => g.children.filter((o) => o.isMesh));
    const [hit] = this.raycaster.intersectObjects(meshes, false);
    if (!hit) return null;
    const g = hit.object.parent;
    const local = g.worldToLocal(hit.point.clone());
    const c = this.getChromosome(g.userData.id);
    return { id: c.id, bandIndex: bandIndexAt(c, g.userData.bpAtY(local.y)) };
  }

  #frame() {
    this.timer.update();
    const t = this.timer.getElapsed();
    if (this.tween) {
      const { t0, dur, fromPos, toPos, fromTarget, toTarget } = this.tween;
      const k = easeInOutCubic(Math.min(1, (performance.now() - t0) / dur));
      this.camera.position.lerpVectors(fromPos, toPos, k);
      this.controls.target.lerpVectors(fromTarget, toTarget, k);
      if (k >= 1) this.tween = null;
    }
    this.controls.update();
    this.dust.rotation.y = t * 0.01;

    if (this.pointerDirty) {
      this.pointerDirty = false;
      const hit = this.pointer && this.#pick(this.pointer.x, this.pointer.y);
      const key = hit ? `${hit.id}:${hit.bandIndex}` : null;
      if (key !== this.hoverKey || hit) {
        this.hoverKey = key;
        this.onHover?.(hit ? { ...hit, x: this.pointer.x, y: this.pointer.y } : null);
      }
      this.renderer.domElement.style.cursor = hit ? 'pointer' : '';
    }
    // Keep hover picking live while the camera moves under a still pointer.
    if (this.pointer && (this.controls.autoRotate || this.tween)) this.pointerDirty = true;

    for (const g of this.groups.values()) g.userData.material.userData.uniforms.uTime.value = t;
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  #resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

function makeLabel(text, className) {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = text;
  return new CSS2DObject(el);
}
