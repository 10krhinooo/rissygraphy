/* ================= Scroll scene: a real-looking DSLR (three.js) =================
   One scroll progress value drives everything. SEG holds the shared beats so the camera
   move, captions, screen playback, letterbox, timecode and film reel all change together. */
const SEG = {
  reveal: 0.035, // camera arrives
  turn: 0.17,    // slow orbit across the front, lens zooms out
  back: 0.29,    // turns round to the back
  review: 0.42,  // screen plays back photos
  push: 0.51,    // push into the screen
  open: 0.55,    // screen opens out into the film reel
  reel: 0.92,    // scroll through the reel
  end: 1,        // reel pulls back and hands off to the gallery
};
const SCENE_CAPS = [
  { from: 0, to: SEG.reveal * 1.6, k: 'Scene 01 · Scroll', t: 'Scroll to turn the camera around.' },
  { from: SEG.reveal * 1.6, to: SEG.turn, k: 'Scene 02 · The camera', t: 'Every frame on this site came out of one body.' },
  { from: SEG.turn, to: SEG.back, k: 'Scene 02 · Turn around', t: 'The part nobody sees: the back of the camera.' },
  { from: SEG.back, to: SEG.review, k: 'Scene 02 · Playback', t: 'Three hikes. 352 frames. One memory card.' },
  { from: SEG.review, to: SEG.open, k: 'Scene 02 · Into the frame', t: 'Step inside.' },
  { from: SEG.open, to: SEG.reel, k: 'reel', t: '' },
  { from: SEG.reel, to: 1.01, k: 'Scene 03 · The gallery', t: 'Keep scrolling for every frame.' },
];

/* ---------- procedural textures ---------- */
function canvasTex(T, w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
}
function makeTextures(T) {
  const pebble = canvasTex(T, 256, 256, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) {
      const v = 70 + Math.random() * 120 | 0;
      g.fillStyle = `rgba(${v},${v},${v},.55)`;
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.4, 0, 7); g.fill();
    }
  }, [3, 3]);
  const ribs = canvasTex(T, 1024, 8, (g, w, h) => {
    for (let i = 0; i < 128; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#202020'; g.fillRect((i * w) / 128, 0, w / 128, h); }
  });
  const knurl = canvasTex(T, 512, 8, (g, w, h) => {
    for (let i = 0; i < 90; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#303030'; g.fillRect((i * w) / 90, 0, w / 90, h); }
  });
  const marks = canvasTex(T, 2048, 96, (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9e4dc'; g.font = '600 40px Arial, sans-serif'; g.textBaseline = 'middle';
    const f = ['18', '35', '50', '70', '105', '200', '300'];
    f.forEach((x, i) => g.fillText(x, 120 + i * 120, h / 2));
    g.font = '600 30px Arial, sans-serif'; g.fillStyle = '#9d978f';
    g.fillText('AF-S  DX  NIKKOR  18-300mm  1:3.5-6.3G  ED  VR', 1000, h / 2);
  });
  // brand on the prism hump and model plate on the front, as on the D3100/D5600 body
  const badge = canvasTex(T, 512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#f4f1ec'; g.font = 'italic 900 100px Arial Black, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Nikon', w / 2, h / 2 + 4);
  });
  badge.wrapS = badge.wrapT = T.ClampToEdgeWrapping;
  const plate = canvasTex(T, 512, 192, (g, w, h) => {
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#f2efe9'); grd.addColorStop(1, '#9a958e');
    g.fillStyle = grd; g.font = '700 120px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('D5600', w / 2, h / 2 + 6);
  });
  plate.wrapS = plate.wrapT = T.ClampToEdgeWrapping;
  const shadow = canvasTex(T, 256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,.85)'); r.addColorStop(.55, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const lcdCanvas = document.createElement('canvas'); lcdCanvas.width = 1200; lcdCanvas.height = 800;
  const lcd = new T.CanvasTexture(lcdCanvas);
  [marks, badge, plate, lcd].forEach((t) => (t.encoding = T.sRGBEncoding));
  return { pebble, ribs, knurl, marks, badge, plate, shadow, lcd, lcdCanvas };
}

/* ---------- the camera model: a Nikon D3100/D5600-class body, units are centimetres
   measured off a reference model (body 12.1 x 7.1 x 5.3, grip out to 4.4, 18-300 style zoom) ---------- */
function buildDSLR(T, tex) {
  const M = {
    plastic: new T.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.22 }),
    leather: new T.MeshPhysicalMaterial({ color: 0x090909, roughness: 0.9, bumpMap: tex.pebble, bumpScale: 0.035, envMapIntensity: 0.2 }),
    rubber: new T.MeshPhysicalMaterial({ color: 0x080808, roughness: 0.85, bumpMap: tex.ribs, bumpScale: 0.06, envMapIntensity: 0.25 }),
    dial: new T.MeshPhysicalMaterial({ color: 0x1c1c1c, metalness: 0.7, roughness: 0.34, bumpMap: tex.knurl, bumpScale: 0.05, envMapIntensity: 0.5 }),
    chrome: new T.MeshPhysicalMaterial({ color: 0xbdbdbd, metalness: 1, roughness: 0.18, envMapIntensity: 0.8 }),
    darkMetal: new T.MeshPhysicalMaterial({ color: 0x151515, metalness: 0.85, roughness: 0.32, envMapIntensity: 0.5 }),
    gloss: new T.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.45 }),
    gold: new T.MeshPhysicalMaterial({ color: 0xc9a24a, metalness: 1, roughness: 0.35, envMapIntensity: 0.7 }),
    red: new T.MeshPhysicalMaterial({ color: 0x8c0c0c, roughness: 0.45, clearcoat: 0.3, emissive: 0x1a0101 }),
    glass: new T.MeshPhysicalMaterial({ color: 0x020305, metalness: 0.3, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [220, 700], envMapIntensity: 0.9 }),
    black: new T.MeshBasicMaterial({ color: 0x030303 }),
    marks: new T.MeshPhysicalMaterial({ map: tex.marks, roughness: 0.5, metalness: 0.1 }),
    badge: new T.MeshPhysicalMaterial({ map: tex.badge, transparent: true, metalness: 0.2, roughness: 0.4 }),
    plate: new T.MeshPhysicalMaterial({ map: tex.plate, metalness: 0.6, roughness: 0.3 }),
    af: new T.MeshPhysicalMaterial({ color: 0xd8d4cc, metalness: 0.2, roughness: 0.15, clearcoat: 1, emissive: 0x1a1612 }),
  };
  const screen = new T.MeshPhysicalMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex.lcd, emissiveIntensity: 0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.03 });
  const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); return o; };
  const rbox = (w, h, d, r, m) => new T.Mesh(new T.RoundedBoxGeometry(w, h, d, 6, r), m);
  const cyl = (rt, rb, h, m, seg = 96) => new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg, 1, false), m);
  const zCyl = (r, h, m, x, y, z) => { const c = cyl(r, r, h, m, 48); c.rotation.x = Math.PI / 2; c.position.set(x, y, z); return c; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

  const cam = new T.Group();
  // body slab, deep rounded grip with the red flash, leather on the lens-release side
  cam.add(at(rbox(12.1, 7.1, 5.3, 1.0, M.plastic), 0, -0.25, 0.15));
  cam.add(at(rbox(3.4, 6.6, 4.4, 1.4, M.leather), -4.4, -0.6, 2.2));
  const stripe = at(rbox(2.0, 0.18, 0.4, 0.08, M.red), -4.35, 1.25, 4.25); stripe.rotation.z = 0.12; cam.add(stripe);
  cam.add(at(rbox(2.8, 4.0, 0.12, 0.05, M.leather), 4.6, -1.3, 2.82));
  // prism hump with the pop-up flash housing overhanging the lens
  const s = new T.Shape();
  [[-2.3, 3.0], [-2.1, 4.4], [-0.8, 5.15], [1.4, 5.15], [3.0, 4.7], [4.3, 4.4], [4.3, 3.6], [2.8, 3.0]].forEach(([u, v], i) => (i ? s.lineTo(u, v) : s.moveTo(u, v)));
  s.closePath();
  const hg = new T.ExtrudeGeometry(s, { depth: 3.4, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.35, bevelSegments: 5, curveSegments: 8 });
  hg.rotateY(-Math.PI / 2); hg.translate(2.9, 0, 0);
  // narrow towards the top like the real prism housing (4.5 cm at the shoulders, about 3 cm on top)
  const hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) hp.setX(i, 1.2 + (hp.getX(i) - 1.2) * (1 - 0.32 * Math.max(0, hp.getY(i) - 3.0) / 2.15));
  hg.computeVertexNormals();
  cam.add(new T.Mesh(hg, M.plastic));
  cam.add(mesh(new T.PlaneGeometry(2.3, 0.58), M.badge, 1.2, 3.95, 4.66));
  cam.add(mesh(new T.BoxGeometry(2.2, 0.2, 2.0), M.darkMetal, 1.2, 5.6, 0.4)); // hot shoe
  cam.add(mesh(new T.PlaneGeometry(1.1, 0.42), M.plate, 5.15, 1.4, 2.81));
  // top plate: mode dial, shutter button in its power collar, two small buttons
  const dial = cyl(1.2, 1.2, 0.6, M.dial, 64); dial.position.set(-2.6, 3.6, -0.15); cam.add(dial);
  cam.add(mesh(new T.CylinderGeometry(1.0, 1.0, 0.02, 48), M.darkMetal, -2.6, 3.91, -0.15));
  cam.add(mesh(new T.SphereGeometry(0.09, 12, 8), M.chrome, -2.6, 3.94, 0.65));
  cam.add(at(cyl(0.75, 0.75, 0.16, M.darkMetal, 48), -4.4, 2.75, 2.3));
  cam.add(at(cyl(0.42, 0.42, 0.26, M.chrome, 48), -4.4, 2.88, 2.3));
  cam.add(at(cyl(0.22, 0.22, 0.14, M.plastic, 24), -5.1, 2.76, 1.0));
  cam.add(at(cyl(0.22, 0.22, 0.14, M.plastic, 24), -3.6, 3.35, 1.0));
  // strap lugs
  [-6.15, 6.15].forEach((x) => { const t = new T.Mesh(new T.TorusGeometry(0.36, 0.09, 12, 32), M.chrome); t.position.set(x, 2.5, 0); t.rotation.y = Math.PI / 2; cam.add(t); });
  // AF-assist lamp and lens release
  cam.add(mesh(new T.SphereGeometry(0.3, 24, 16), M.af, -2.15, 2.0, 2.7));
  cam.add(at(rbox(0.55, 1.0, 0.3, 0.14, M.plastic), 5.0, -0.7, 2.9));
  // back: screen with its bezel, playback column, multi-selector, AE-L, live view, eyecup
  cam.add(at(rbox(6.9, 4.9, 0.2, 0.18, M.gloss), 1.22, -0.83, -2.55));
  const scr = mesh(new T.PlaneGeometry(6.45, 4.3), screen, 1.22, -0.83, -2.66); scr.rotation.y = Math.PI; cam.add(scr);
  [1.12, 0.11, -0.86, -1.86, -2.82].forEach((y) => cam.add(zCyl(0.3, 0.2, M.plastic, 5.15, y, -2.52)));
  cam.add(zCyl(0.95, 0.24, M.plastic, -3.6, -1.32, -2.5));
  cam.add(zCyl(0.4, 0.3, M.darkMetal, -3.6, -1.32, -2.56));
  cam.add(zCyl(0.36, 0.22, M.plastic, -2.08, 2.58, -2.5));
  cam.add(zCyl(0.3, 0.2, M.plastic, -3.09, -3.14, -2.5));
  cam.add(at(rbox(0.6, 1.2, 0.3, 0.14, M.plastic), -2.56, 0.48, -2.52));
  cam.add(mesh(new T.SphereGeometry(0.12, 16, 10), M.red, -2.56, 0.48, -2.68));
  cam.add(at(rbox(1.4, 1.6, 0.3, 0.3, M.leather), -4.9, 1.1, -2.5));
  cam.add(at(rbox(1.6, 0.3, 0.1, 0.05, M.gloss), -4.6, 2.76, -2.52)); // speaker
  cam.add(at(rbox(3.6, 2.8, 0.7, 0.35, M.leather), 1.16, 3.4, -2.6));
  const eyeGlass = mesh(new T.PlaneGeometry(1.5, 0.95), M.gloss, 1.16, 3.0, -2.96); eyeGlass.rotation.y = Math.PI; cam.add(eyeGlass);

  // lens, built along +Y then turned to face +Z: mount, gold VR band, zoom ring, then the barrel that extends
  const L = new T.Group(); L.position.set(1.3, -0.3, 2.8); L.rotation.x = Math.PI / 2; cam.add(L);
  L.add(mesh(new T.CylinderGeometry(2.9, 2.9, 0.25, 96), M.chrome, 0, 0.12, 0));
  L.add(mesh(new T.CylinderGeometry(2.95, 3.0, 1.0, 96), M.plastic, 0, 0.75, 0));
  L.add(mesh(new T.CylinderGeometry(2.97, 2.97, 0.08, 96), M.gold, 0, 1.3, 0));
  L.add(mesh(new T.CylinderGeometry(2.95, 2.95, 1.6, 96), M.gloss, 0, 2.15, 0));
  L.add(mesh(new T.CylinderGeometry(2.97, 2.97, 0.6, 128), M.marks, 0, 3.25, 0));
  const zoomRing = mesh(new T.CylinderGeometry(3.28, 3.28, 2.8, 128), M.rubber, 0, 5.0, 0); L.add(zoomRing);
  const inner = new T.Group(); L.add(inner); // extends as the lens zooms
  inner.add(mesh(new T.CylinderGeometry(2.85, 2.85, 3.0, 96), M.gloss, 0, 7.0, 0));
  const focusRing = mesh(new T.CylinderGeometry(3.1, 3.1, 0.7, 128), M.rubber, 0, 8.15, 0); inner.add(focusRing);
  const lip = [[2.45, 8.5], [3.12, 8.5], [3.2, 8.65], [3.15, 9.0], [2.6, 9.05]].map(([r, y]) => new T.Vector2(r, y));
  inner.add(new T.Mesh(new T.LatheGeometry(lip, 128), M.darkMetal));
  const disc = mesh(new T.CircleGeometry(2.6, 64), M.black, 0, 8.75, 0); disc.rotation.x = -Math.PI / 2; inner.add(disc);
  const iring = new T.Mesh(new T.TorusGeometry(1.7, 0.05, 8, 96), M.darkMetal); iring.rotation.x = Math.PI / 2; iring.position.y = 8.9; inner.add(iring);
  const R = 6.5, phi = Math.asin(2.58 / R);
  inner.add(mesh(new T.SphereGeometry(R, 96, 24, 0, Math.PI * 2, 0, phi), M.glass, 0, 8.85 - R * Math.cos(phi), 0));

  return { cam, inner, zoomRing, focusRing, screen, screenCenter: new T.Vector3(1.22, -0.83, -2.66), screenSize: [6.45, 4.3] };
}

/* ---------- draws the rear LCD ---------- */
function drawLCD(c, img, p, i, n) {
  const g = c.getContext('2d'), W = c.width, H = c.height;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (img && img.complete && img.naturalWidth) {
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    // opened straight from disk (file://) the photo taints the canvas; fall back to a dark screen
    try { g.getImageData(0, 0, 1, 1); } catch (e) { g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, W, H); }
  }
  const top = g.createLinearGradient(0, 0, 0, 120); top.addColorStop(0, 'rgba(0,0,0,.55)'); top.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = top; g.fillRect(0, 0, W, 120);
  const bot = g.createLinearGradient(0, H - 130, 0, H); bot.addColorStop(0, 'rgba(0,0,0,0)'); bot.addColorStop(1, 'rgba(0,0,0,.6)');
  g.fillStyle = bot; g.fillRect(0, H - 130, W, 130);
  g.fillStyle = '#fff'; g.font = '500 34px "JetBrains Mono", monospace'; g.textBaseline = 'top';
  g.fillText(`▶  ${pad(i + 1)}/${pad(n)}`, 34, 30);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(W - 110, 32, 64, 30); g.fillRect(W - 46, 40, 6, 14); g.fillRect(W - 104, 38, 40, 18);
  g.textBaseline = 'bottom';
  g.fillText(`${p.mm}mm   f/${p.f}   ${shutter(p.s)}s   ISO ${p.iso}`, 34, H - 30);
  g.textAlign = 'right'; g.fillStyle = '#ff6a3d'; g.fillText('RAW', W - 34, H - 30); g.textAlign = 'left';
}

/* ---------- the scene component ---------- */
function CameraScene({ onOpen }) {
  const C = useContext(ContentCtx);
  const secRef = useRef(null), canvasRef = useRef(null), titleRef = useRef(null), bgRef = useRef(null);
  const topBar = useRef(null), botBar = useRef(null), fadeRef = useRef(null), takeRef = useRef(null);
  const tcRef = useRef(null), scrubRef = useRef(null), reelRef = useRef(null), trackRef = useRef(null), framesRef = useRef([]);
  const [cap, setCap] = useState(0);
  const [shot, setShot] = useState(0);
  const [frame, setFrame] = useState(0);
  const [noGL, setNoGL] = useState(false);

  useEffect(() => {
    const T = window.THREE;
    let renderer = null, scene, cam3, model, tex, imgs = [], env;
    const S = { ry: -34, rx: 14, sc: 0.84, ext: 0, focus: 0, push: 0, lcd: 0, ox: 0, oy: 0 };
    const I = { spin: REDUCED ? 0 : 1 };
    const RS = { s: 1, x: 0, exit: 0 };
    let tl, raf = 0, cur = 0, running = false, layout = null, par = { x: 0, y: 0, tx: 0, ty: 0 };
    const refs = { cap: -1, shot: -1, frame: -1 };
    const base = { pos: null, tgt: null };

    // ---- three.js setup
    try {
      if (!T || !T.RoundedBoxGeometry) throw new Error('three missing');
      renderer = new T.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      scene = new T.Scene();
      const pm = new T.PMREMGenerator(renderer);
      env = pm.fromScene(new T.RoomEnvironment(), 0.03).texture;
      scene.environment = env;
      cam3 = new T.PerspectiveCamera(28, 1, 0.1, 400);
      tex = makeTextures(T);
      model = buildDSLR(T, tex);
      scene.add(model.cam);
      const key = new T.DirectionalLight(0xfff1e0, 1.6); key.position.set(8, 10, 12); scene.add(key);
      const rim = new T.DirectionalLight(0x8fb4ff, 2.8); rim.position.set(-10, 5, -10); scene.add(rim);
      const rim2 = new T.DirectionalLight(0xff7a45, 1.3); rim2.position.set(10, -2, -8); scene.add(rim2);
      scene.add(new T.HemisphereLight(0xffffff, 0x1a1a1a, 0.15));
      const top = new T.SpotLight(0xffffff, 1.2, 0, 0.5, 0.8); top.position.set(0, 26, 6); scene.add(top);
      const sh = new T.Mesh(new T.PlaneGeometry(22, 12), new T.MeshBasicMaterial({ map: tex.shadow, transparent: true, depthWrite: false, opacity: 0.75 }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = -5.2; scene.add(sh);
      imgs = PLAYBACK.map((p) => { const im = new Image(); im.src = p.full; im.onload = () => { if (refs.shot >= 0) paint(refs.shot); }; return im; });
    } catch (e) {
      renderer = null; setNoGL(true);
    }
    const paint = (i) => {
      if (!tex) return;
      drawLCD(tex.lcdCanvas, imgs[i], PLAYBACK[i], i, PLAYBACK.length);
      tex.lcd.needsUpdate = true;
    };

    // ---- layout + timeline (rebuilt on resize)
    const build = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (renderer) {
        renderer.setSize(vw, vh, false);
        cam3.aspect = vw / vh; cam3.updateProjectionMatrix();
        const tf = Math.tan((cam3.fov * Math.PI) / 360);
        const dist = Math.max((11 / 0.6) / 2 / tf, (15 / 0.86) / 2 / (tf * cam3.aspect));
        base.pos = new T.Vector3(0, dist * 0.08, dist); base.tgt = new T.Vector3(0, 0.6, 0);
        // opening frame: camera sits beside the title (right on wide screens, low on tall ones)
        base.ox = cam3.aspect > 1.1 ? -dist * tf * cam3.aspect * 0.34 : 0;
        base.oy = cam3.aspect > 1.1 ? 0 : dist * tf * 0.42;
      }
      // film reel frames
      const H = Math.min(vh * 0.68, (vw * 0.84) / 1.5);
      const gap = Math.max(18, vw * 0.025);
      const widths = FILM.map((p) => (p.h > p.w * 1.1 ? H * (2 / 3) : H * 1.5));
      const centers = []; let acc = 0;
      widths.forEach((w) => { centers.push(acc + w / 2); acc += w + gap; });
      framesRef.current.forEach((el, i) => { if (el) { el.style.width = widths[i] + 'px'; el.style.height = H + 'px'; } });
      const fill = Math.max(vw / widths[0], vh / H) * 1.02;
      layout = { centers, fill, H };

      const D = 1000, seg = (a, b) => ({ duration: Math.max(1, (b - a) * D) });
      tl = anime.timeline({ autoplay: false, easing: 'linear', duration: D });
      tl.add({ targets: S, sc: [0.84, 0.92], rx: [14, 12], ry: [-34, -26], ...seg(0, SEG.reveal), easing: 'easeOutSine' })
        .add({ targets: S, sc: [0.94, 1], rx: [12, 6], ry: [-26, 22], ext: [0, 1.4], ...seg(SEG.reveal, SEG.turn), easing: 'easeInOutSine' })
        .add({ targets: S, sc: [1, 1.04], rx: [6, 0], ry: [22, 180], ext: [1.4, 1.4], ...seg(SEG.turn, SEG.back), easing: 'easeInOutCubic' })
        .add({ targets: S, sc: [1.04, 1.08], rx: [0, 0], ry: [180, 180], ...seg(SEG.back, SEG.review) })
        .add({ targets: S, push: [0, 1], ...seg(SEG.review, SEG.push), easing: 'easeInOutCubic' })
        .add({ targets: S, push: [1, 1], ...seg(SEG.push, SEG.end) });
      tl.add({ targets: S, focus: [0, Math.PI * 1.4], duration: SEG.back * D, easing: 'easeInOutSine' }, 0);
      tl.add({ targets: S, lcd: [0, 1], duration: 0.025 * D, easing: 'easeOutQuad' }, (SEG.back - 0.03) * D);
      tl.add({ targets: S, ox: [1, 0], oy: [1, 0], duration: SEG.turn * D, easing: 'easeInOutSine' }, 0);
      tl.add({ targets: titleRef.current, opacity: [1, 0], translateY: [0, -80], duration: SEG.reveal * 1.6 * D, easing: 'easeInSine' }, 0);
      tl.add({ targets: [topBar.current, botBar.current], scaleY: [1, 0], duration: (SEG.open - SEG.review) * D, easing: 'easeInOutSine' }, SEG.review * D);
      tl.add({ targets: takeRef.current, opacity: [0, 1], duration: 0.03 * D, easing: 'easeInOutSine' }, (SEG.push - 0.03) * D);
      tl.add({ targets: reelRef.current, opacity: [0, 1], duration: 0.004 * D }, SEG.push * D);
      tl.add({ targets: takeRef.current, opacity: [1, 0], duration: 0.004 * D }, (SEG.push + 0.006) * D);
      tl.add({ targets: [canvasRef.current, secRef.current.querySelector('.spot')], opacity: [1, 0], duration: 0.004 * D }, (SEG.push + 0.006) * D);
      tl.add({ targets: RS, s: [fill, 1], duration: (SEG.open - SEG.push) * D, easing: 'easeInOutCubic' }, SEG.push * D);
      tl.add({ targets: RS, exit: [0, 1], duration: (SEG.end - SEG.reel) * D, easing: 'easeInOutSine' }, SEG.reel * D);
      tl.add({ targets: fadeRef.current, opacity: [0, 1], duration: (SEG.end - SEG.reel) * 0.6 * D, easing: 'easeInSine' }, (SEG.reel + (SEG.end - SEG.reel) * 0.4) * D);
      tl.seek(cur * D);
      apply();
    };

    // ---- apply state to the 3D scene and the reel
    const apply = () => {
      if (renderer) {
        const free = 1 - S.push;
        model.cam.rotation.set(((S.rx + 8 * I.spin) * Math.PI) / 180 + par.y * 0.05 * free, ((S.ry - 160 * I.spin) * Math.PI) / 180 + par.x * 0.08 * free, 0);
        model.cam.scale.setScalar(S.sc * (1 - 0.3 * I.spin));
        model.inner.position.y = S.ext;
        model.zoomRing.rotation.y = S.focus;
        model.focusRing.rotation.y = -S.focus * 0.6;
        model.screen.emissiveIntensity = S.lcd * 1.15;
        model.cam.updateMatrixWorld(true);
        const C = model.cam.localToWorld(model.screenCenter.clone());
        const tf = Math.tan((cam3.fov * Math.PI) / 360);
        const sw = model.screenSize[0] * S.sc, shh = model.screenSize[1] * S.sc;
        const dClose = Math.min((shh * 0.9) / (2 * tf), (sw * 0.9) / (2 * tf * cam3.aspect));
        const P1 = C.clone().add(new T.Vector3(0, 0, dClose));
        const off = new T.Vector3(base.ox * S.ox, base.oy * S.oy, 0);
        cam3.position.lerpVectors(base.pos.clone().add(off), P1, S.push);
        cam3.lookAt(base.tgt.clone().add(off).lerp(C, S.push));
        if (S.push < 1 || cur < SEG.push + 0.01) renderer.render(scene, cam3);
      }
      // reel
      if (layout && cur >= SEG.push - 0.01) {
        const n = FILM.length;
        const t = clamp((cur - SEG.open) / (SEG.reel - SEG.open)) * (n - 1);
        const i = Math.min(n - 2, Math.floor(t)), f = smoother(clamp(t - i));
        const x = lerp(layout.centers[i], layout.centers[i + 1], f);
        const sc = RS.s * (1 - RS.exit * 0.42);
        reelRef.current.style.transform = `scale(${sc})`;
        reelRef.current.style.setProperty('--dim', RS.exit);
        trackRef.current.style.transform = `translate3d(${-x}px, 0, 0)`;
        framesRef.current.forEach((el, k) => {
          if (!el) return;
          const off = (layout.centers[k] - x) / layout.H;
          el.firstChild.style.transform = `translate3d(${off * -6}%, 0, 0) scale(1.14)`;
        });
        const fi = Math.round(t);
        if (fi !== refs.frame) { refs.frame = fi; setFrame(fi); }
      }
    };

    const frameLoop = () => {
      const s = secRef.current; if (!s) return;
      const rect = s.getBoundingClientRect();
      const p = clamp(-rect.top / (s.offsetHeight - window.innerHeight));
      cur = window.__SNAP ? p : cur + (p - cur) * 0.12;
      if (Math.abs(p - cur) < 0.00025) cur = p;
      par.x += (par.tx - par.x) * 0.06; par.y += (par.ty - par.y) * 0.06;
      tl.seek(cur * tl.duration);
      apply();
      const c = SCENE_CAPS.findIndex((x) => cur >= x.from && cur < x.to);
      if (c !== refs.cap && c >= 0) { refs.cap = c; setCap(c); }
      const sp = clamp((cur - SEG.back) / (SEG.review - SEG.back));
      const sh = Math.min(PLAYBACK.length - 1, Math.floor(sp * PLAYBACK.length));
      if (sh !== refs.shot) { refs.shot = sh; setShot(sh); paint(sh); }
      const secs = cur * 40, ss = Math.floor(secs), ff = Math.floor((secs - ss) * 24);
      tcRef.current.textContent = `00:00:${pad(ss)}:${pad(ff)}`;
      scrubRef.current.style.transform = `scaleX(${cur})`;
      // location backdrop: slow drift, dims as the camera turns, gone once we are inside the screen
      const bo = cur < SEG.turn ? 0.62 : cur < SEG.review ? lerp(0.62, 0.38, (cur - SEG.turn) / (SEG.review - SEG.turn)) : lerp(0.38, 0, clamp((cur - SEG.review) / (SEG.push - SEG.review)));
      bgRef.current.style.opacity = String(bo);
      bgRef.current.style.transform = `translate3d(${par.x * -12}px, ${cur * -40 + par.y * -8}px, 0) scale(${1.12 + cur * 0.25})`;
      if (running) raf = requestAnimationFrame(frameLoop);
    };

    build();
    try { if (renderer && scene && cam3) renderer.compile(scene, cam3); } catch (e) {}
    paint(0); refs.shot = 0;
    if (!REDUCED) whenIntroDone(() => {
      anime({ targets: I, spin: 0, duration: 2600, easing: SMOOTH, delay: 150 });
      anime({ targets: titleRef.current.querySelectorAll('.ch > span'), translateY: ['115%', '0%'], rotate: [10, 0], delay: anime.stagger(32, { start: 450 }), duration: 1500, easing: SMOOTH });
      anime({ targets: titleRef.current.querySelectorAll('.fade'), opacity: [0, 1], translateY: [26, 0], delay: anime.stagger(120, { start: 1000 }), duration: 1400, easing: SMOOTH });
    });
    if (REDUCED) { cur = (SEG.back + SEG.review) / 2; tl.seek(cur * tl.duration); apply(); setCap(2); setShot(3); paint(3); return () => renderer && renderer.dispose(); }
    let vis = false, gone = false;
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis && !running) whenIntroDone(() => { if (!running && vis && !gone) { running = true; raf = requestAnimationFrame(frameLoop); } });
      else if (!vis) { running = false; cancelAnimationFrame(raf); }
    }, { rootMargin: '300px 0px' });
    io.observe(secRef.current);
    const onMove = (e) => { par.tx = (e.clientX / window.innerWidth - 0.5) * 2; par.ty = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('pointermove', onMove);
    let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(build, 150); };
    window.addEventListener('resize', onResize);
    return () => { gone = true; io.disconnect(); running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove); if (renderer) renderer.dispose(); };
  }, []);

  const c = SCENE_CAPS[cap];
  const fp = FILM[Math.min(frame, FILM.length - 1)];
  const p = PLAYBACK[shot];
  return (
    <section className="scene" id="reel" ref={secRef} data-top aria-label="A camera turns around, plays back Lincoln's photos, then opens into a film reel">
      <div className="scene-pin">
        <div className="scene-bg" ref={bgRef} aria-hidden="true"><img src={byId('lakeellis-9').full} alt="" /></div>
        <div className="spot" aria-hidden="true"></div>
        <canvas className="gl" ref={canvasRef} aria-hidden="true"></canvas>
        {noGL && (
          <div className="nogl"><div className="nogl-screen"><img src={p.full} alt={p.cap} /></div></div>
        )}
        <div className="scene-title" ref={titleRef}>
          <div className="wrap">
            <p className="eyebrow fade">{C.intro.eyebrow}</p>
            <h1 className="title" aria-label="Lincoln Kariuki Chege">
              <span className="t-line" aria-hidden="true">{chars('Lincoln')}</span>
              <span className="t-line" aria-hidden="true">{chars('Kariuki')}</span>
              <span className="t-line" aria-hidden="true">{chars('Chege')}<span className="ch dot"><span>.</span></span></span>
            </h1>
            <p className="lede fade">{C.intro.lede}</p>
            <div className="cta fade">
              <a className="btn solid" href="#gallery">See the gallery</a>
              <a className="btn ghost" href="#cv">Read the CV</a>
            </div>
          </div>
        </div>
        <div className="lbx top" ref={topBar} aria-hidden="true"></div>
        <div className="lbx bot" ref={botBar} aria-hidden="true"></div>
        <div className="takeover" ref={takeRef} aria-hidden="true"><img src={FILM[0].full} alt="" /></div>
        <div className="reel" ref={reelRef}>
          <div className="reel-track" ref={trackRef}>
            {FILM.map((x, k) => (
              <button key={x.id} className="film" ref={(el) => (framesRef.current[k] = el)} onClick={() => onOpen(FILM, k, 'The reel')} aria-label={`Open ${x.cap}`} tabIndex={-1}>
                <img src={x.full} alt={x.cap} loading="lazy" />
                <span className="sprockets top"></span><span className="sprockets bot"></span>
                <span className="film-no mono">{pad(k + 1)}A</span>
              </button>
            ))}
          </div>
        </div>
        <div className="scene-hud">
          <div className="sub" key={c.k === 'reel' ? 'r' + frame : cap}>
            {c.k === 'reel' ? (
              <><p className="mono">The reel · frame {pad(frame + 1)}/{pad(FILM.length)}</p><p className="sub-t">{fp.cap}</p><p className="mono sub-ex">{fp.place} · {fp.mm}mm · f/{fp.f} · {shutter(fp.s)}s · tap to open</p></>
            ) : (
              <><p className="mono">{c.k}</p><p className="sub-t">{c.t}</p></>
            )}
          </div>
          <div className="hud-r mono">
            <span className="rec"><i></i>REC</span>
            <span ref={tcRef}>00:00:00:00</span>
            <span className="scrub-line"><i ref={scrubRef}></i></span>
          </div>
        </div>
        <div className="scene-fade" ref={fadeRef} aria-hidden="true"></div>
      </div>
    </section>
  );
}
