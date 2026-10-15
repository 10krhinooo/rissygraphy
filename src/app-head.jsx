/* ---------- Nav ---------- */
function Nav({ route, canEdit, onEdit }) {
  // Hidden entry: three quick taps on the logo's dot open the editor (editors only)
  const taps = useRef([]);
  const onDot = () => {
    const now = Date.now();
    taps.current = taps.current.filter((t) => now - t < 900).concat(now);
    if (taps.current.length >= 3) { taps.current = []; onEdit(); return true; }
    return taps.current.length > 1;
  };
  const L = (href, label, on, opt) => <a href={href} className={(on ? 'on ' : '') + (opt ? 'opt' : '')} aria-current={on ? 'page' : undefined}>{label}</a>;
  return (
    <header className="nav">
      <div className="nav-in">
        <a href="#top" className="mark" aria-label="Lincoln Kariuki Chege, home">LKC<span className="dot" onClick={(e) => { if (canEdit && onDot()) { e.preventDefault(); e.stopPropagation(); } }}></span></a>
        <nav className="links">
          {L('#top', 'Home', route === 'home', true)}
          {L('#gallery', 'Gallery', route === 'gallery')}
          {L('#cv', 'CV', route === 'cv')}
          {L('#about', 'About', false, true)}
          {L('#contact', 'Contact', false)}
        </nav>
      </div>
    </header>
  );
}

/* split a word into animatable letters */
const chars = (word) => word.split('').map((ch, i) => (ch === ' ' ? <span className="sp" key={i}> </span> : <span className="ch" key={i}><span>{ch}</span></span>));

/* ---------- Stats ---------- */
function Counter({ to }) {
  const ref = useRef(null);
  useEffect(() => {
    if (REDUCED) return;
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const o = { v: 0 };
      anime({ targets: o, v: to, round: 1, duration: 1800, easing: SMOOTH, update: () => { el.textContent = o.v; } });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{to}</span>;
}
function Gauge({ fill }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const on = Math.round(fill * 24);
    if (REDUCED) { [...el.children].forEach((t, i) => t.classList.toggle('on', i < on)); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      anime({ targets: [...el.children].slice(0, on), scaleY: [0.3, 1], backgroundColor: ['#3d3936', '#ff6a3d'], delay: anime.stagger(35, { start: 300 }), duration: 600, easing: SMOOTH });
    }, { threshold: 0.6 });
    io.observe(el);
    [...el.children].forEach((t, i) => t.classList.toggle('on', i < on));
    return () => io.disconnect();
  }, [fill]);
  return <span className="gauge" ref={ref} aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i}></i>)}</span>;
}
function Stats() {
  const cells = [
    { k: 'Frames', v: <Counter to={352} />, s: 'shot across three hikes', fill: 1 },
    { k: 'Selects', v: <Counter to={ALL_PHOTOS.length} />, s: 'kept for the gallery', fill: ALL_PHOTOS.length / 352 },
    { k: 'Hikes', v: <Counter to={3} />, u: '2026', s: 'Kipipiri, Kathandeni, Lake Ellis', fill: 3 / 12 },
    { k: 'Gear', v: 'D5600', s: 'Nikon, 18 to 300mm, edited in Lightroom Classic', fill: 0.5 },
  ];
  return (
    <section className="stats-wrap wrap" id="numbers" aria-label="At a glance">
      <div className="spec" data-reveal="up" data-stagger="110">
        {cells.map((c) => (
          <div className="spec-cell" key={c.k}>
            <span className="spec-k mono">{c.k}</span>
            <b className="spec-v">{c.v}{c.u && <small className="mono">{c.u}</small>}</b>
            <Gauge fill={c.fill} />
            <span className="spec-s">{c.s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Home: a short selection that leads to the Gallery page ---------- */
function Tile({ p, onClick }) {
  return (
    <button className="m-tile" onClick={onClick} aria-label={`Open ${p.cap}`}>
      <img src={p.thumb} alt={p.cap} loading="lazy" style={{ aspectRatio: `${p.w} / ${p.h}` }} />
      <span className="tile-cap"><span>{p.cap}</span><span className="mono">{exifText(p) || p.place}</span></span>
    </button>
  );
}
function SelectedWork({ onOpen }) {
  return (
    <section className="gallery wrap" id="work">
      <div className="sec-head sec-row" data-reveal="left">
        <div>
          <p className="eyebrow">Scene 03 · Selected work</p>
          <h2>A few frames I keep coming back to.</h2>
        </div>
        <a className="btn" href="#gallery">See all {ALL_PHOTOS.length} photos <span aria-hidden="true">→</span></a>
      </div>
      <div className="masonry" data-reveal="frame" data-stagger="55">
        {SELECTED.map((p, k) => <Tile key={p.id} p={p} onClick={(e) => onOpen(SELECTED, k, 'Selected work', e.currentTarget.querySelector('img'))} />)}
      </div>
      <div className="more-row" data-reveal="up">
        <a className="btn solid" href="#gallery">Open the full gallery <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

/* ---------- Gallery page ---------- */
function GalleryPage({ onOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    A({ targets: ref.current.querySelectorAll('.ch > span'), translateY: ['115%', '0%'], rotate: [10, 0], delay: anime.stagger(30, { start: 250 }), duration: 1400, easing: SMOOTH });
    A({ targets: ref.current.querySelectorAll('.fade'), opacity: [0, 1], translateY: [24, 0], delay: anime.stagger(100, { start: 650 }), duration: 1200, easing: SMOOTH });
  }, []);
  return (
    <section className="gallery page wrap" id="gallery" ref={ref}>
      <header className="page-head">
        <p className="eyebrow fade">The gallery · {ALL_PHOTOS.length} frames · 2026</p>
        <h1 className="title page-title" aria-label="The gallery.">
          <span className="t-line" aria-hidden="true">{chars('The')}<span className="sp"> </span>{chars('gallery')}<span className="ch dot"><span>.</span></span></span>
        </h1>
        <p className="lede fade">Frames from three hikes in 2026: forest falls, high moorland and the people who walked them. Tap any photo to see it full screen.</p>
      </header>
      <div className="masonry big" data-reveal="frame" data-stagger="40">
        {ALL_PHOTOS.map((p, k) => <Tile key={p.id} p={p} onClick={(e) => onOpen(ALL_PHOTOS, k, 'Gallery', e.currentTarget.querySelector('img'))} />)}
      </div>
      <div className="more-row">
        <a className="btn" href="#top">← Back home</a>
        <a className="btn solid" href="#cv">Read the CV <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

/* ---------- Lightbox: photos grow out of the tile they came from ---------- */
function Lightbox({ state, onClose, onMove }) {
  const ref = useRef(null);
  const imgRef = useRef(null);
  const dir = useRef(0);
  const p = state.list[state.k];
  const first = useRef(true);
  useEffect(() => {
    A({ targets: ref.current, backgroundColor: ['rgba(10,9,8,0)', 'rgba(10,9,8,.96)'], duration: 600, easing: 'easeOutSine' });
    A({ targets: ref.current.querySelectorAll('.lb-top, .lb-foot, .lb-arrow'), opacity: [0, 1], translateY: [14, 0], delay: anime.stagger(60, { start: 250 }), duration: 700, easing: SMOOTH });
    const key = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', key);
    if (LENIS) LENIS.stop();
    document.body.style.overflow = 'hidden';
    ref.current.querySelector('.lb-close').focus();
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; if (LENIS) LENIS.start(); };
  }, []);
  const flipIn = () => {
    const img = imgRef.current;
    if (!img || REDUCED) return;
    const o = first.current && state.origin;
    first.current = false;
    if (o) {
      const r = img.getBoundingClientRect();
      const s = o.width / r.width;
      A({ targets: img, translateX: [o.left + o.width / 2 - (r.left + r.width / 2), 0], translateY: [o.top + o.height / 2 - (r.top + r.height / 2), 0], scale: [s, 1], duration: 900, easing: SMOOTH });
    } else {
      A({ targets: img, opacity: [0, 1], translateX: [dir.current * 60, 0], duration: 800, easing: SMOOTH });
    }
  };
  const go = (d) => { dir.current = Math.sign(d) || 1; onMove(d); };
  const close = () => {
    if (REDUCED) { onClose(); return; }
    anime({ targets: ref.current, opacity: [1, 0], duration: 380, easing: 'easeInSine', complete: onClose });
  };
  return (
    <div className="lb" ref={ref} role="dialog" aria-modal="true" aria-label={p.cap}>
      <div className="lb-top">
        <span className="mono">{state.title} · {pad(state.k + 1)}/{pad(state.list.length)}</span>
        <button className="lb-close" onClick={close}>Close <span aria-hidden="true">✕</span></button>
      </div>
      <div className="lb-stage">
        <button className="lb-arrow" onClick={() => go(-1)} aria-label="Previous photo">←</button>
        <div className="lb-imgwrap"><img ref={imgRef} src={p.full} alt={p.cap} key={p.id} onLoad={flipIn} /></div>
        <button className="lb-arrow" onClick={() => go(1)} aria-label="Next photo">→</button>
      </div>
      <div className="lb-foot">
        <div>
          <p className="lb-cap">{p.cap}</p>
          <p className="mono muted">{p.place}{p.mm ? ` · ${exifText(p)} · ISO ${p.iso}` : ''} · Nikon D5600</p>
        </div>
        <div className="scrub" role="group" aria-label="Jump to photo">
          {state.list.map((x, i) => (
            <button key={x.id} className={'st' + (i === state.k ? ' on' : '')} onClick={() => go(i - state.k)} aria-label={`Photo ${i + 1}: ${x.cap}`}><i></i></button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Shutter: iris transition used when jumping between sections ---------- */
function useShutter() {
  const svgRef = useRef(null);
  const busy = useRef(false);
  const run = useCallback((midway) => {
    if (busy.current) return;
    if (REDUCED || !svgRef.current) { midway(); return; }
    busy.current = true;
    const svg = svgRef.current, poly = svg.querySelector('polygon');
    const W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2, R = Math.hypot(W, H) * 0.62;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.querySelector('rect.mask-bg').setAttribute('width', W); svg.querySelector('rect.mask-bg').setAttribute('height', H);
    svg.querySelector('rect.fill').setAttribute('width', W); svg.querySelector('rect.fill').setAttribute('height', H);
    const st = { r: R, a: 0 };
    const draw = () => {
      const pts = [];
      for (let i = 0; i < 6; i++) { const t = st.a + (i * Math.PI) / 3; pts.push(`${cx + Math.cos(t) * st.r},${cy + Math.sin(t) * st.r}`); }
      poly.setAttribute('points', pts.join(' '));
    };
    svg.style.visibility = 'visible';
    anime.timeline({ update: draw })
      .add({ targets: st, r: [R, 0], a: [0, Math.PI / 3], duration: 620, easing: 'cubicBezier(.7, 0, .84, 0)', complete: () => { midway(); } })
      .add({ targets: st, r: [0, 0], duration: 160 })
      .add({ targets: st, r: [0, R], a: [Math.PI / 3, Math.PI * 0.66], duration: 900, easing: SMOOTH, complete: () => { svg.style.visibility = 'hidden'; busy.current = false; } });
  }, []);
  const el = (
    <svg className="shutter-fx" ref={svgRef} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <mask id="iris-mask"><rect className="mask-bg" x="0" y="0" fill="#fff" /><polygon fill="#000" /></mask>
      </defs>
      <rect className="fill" x="0" y="0" fill="#050505" mask="url(#iris-mask)" />
    </svg>
  );
  return [el, run];
}
