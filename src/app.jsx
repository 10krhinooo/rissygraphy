/* ---------- About / Meet ---------- */
function About() {
  const C = useContext(ContentCtx);
  const ref = useRef(null);
  useEffect(() => {
    if (REDUCED) return;
    const el = ref.current;
    const onEnter = (e) => { const r = e.target.closest && e.target.closest('.skill'); if (r) anime({ targets: r.querySelectorAll('.bar i'), scaleX: [0, 1], delay: anime.stagger(30), duration: 600, easing: SMOOTH }); };
    el.addEventListener('mouseover', onEnter);
    return () => el.removeEventListener('mouseover', onEnter);
  }, []);
  return (
    <section className="about wrap" id="about" ref={ref}>
      <div className="meet">
        <figure className="portrait" data-reveal="frame">
          {PORTRAIT ? <img src={PORTRAIT} alt="Portrait of Lincoln Kariuki Chege" /> : (
            <div className="portrait-empty" aria-label="Portrait of Lincoln to come"><span className="pm">LKC</span></div>
          )}
          <span className="vf tl"></span><span className="vf tr"></span><span className="vf bl"></span><span className="vf br"></span>
          <span className="af" aria-hidden="true" style={PORTRAIT ? { left: '53%', top: '31%' } : undefined}></span>
          <figcaption className="mono">{PORTRAIT ? 'Elephant Hill summit · Aberdares · 12,000 ft' : 'Lincoln Kariuki Chege · Nairobi, KE'}</figcaption>
        </figure>
        <div className="meet-text" data-reveal="right" data-stagger="110">
          <p className="eyebrow">Scene 04 · Meet Lincoln</p>
          <h2>{C.about.heading}</h2>
          {C.about.paras.map((t, i) => <p key={i}>{t}</p>)}
          <dl className="meet-facts">
            {C.about.facts.map((f, i) => <div key={i}><dt className="mono muted">{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>
        </div>
      </div>
      <div className="do">
        <div className="sec-head" data-reveal="left"><p className="eyebrow">What I do</p></div>
        <ul className="skills" data-reveal="right" data-stagger="100">
          {C.services.map((s, i) => (
            <li className="skill" key={i}>
              <span className="mono muted">{pad(i + 1)}</span>
              <div><b>{s.t}</b><p>{s.d}</p></div>
              <span className="bar" aria-hidden="true">{Array.from({ length: 12 }, (_, k) => <i key={k}></i>)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- CV: a teaser on Home, the full CV on its own page ---------- */
function CVTeaser() {
  const C = useContext(ContentCtx);
  const R = C.resume;
  return (
    <section className="cv-teaser wrap" id="cv-teaser">
      <div className="sec-head sec-row" data-reveal="left">
        <div>
          <p className="eyebrow">Scene 05 · Curriculum vitae</p>
          <h2>Where I have worked.</h2>
        </div>
        <a className="btn" href="#cv">Read the full CV <span aria-hidden="true">→</span></a>
      </div>
      <ol className="teaser-list" data-reveal="up" data-stagger="90">
        {R.experience.slice(0, 3).map((x, i) => (
          <li key={i}><span className="mono muted">{x.when}</span><b>{x.role}</b><span className="t-org">{x.org}</span></li>
        ))}
      </ol>
    </section>
  );
}
function CVPage() {
  const C = useContext(ContentCtx);
  const ref = useRef(null);
  useEffect(() => {
    A({ targets: ref.current.querySelectorAll('.ch > span'), translateY: ['115%', '0%'], rotate: [10, 0], delay: anime.stagger(30, { start: 250 }), duration: 1400, easing: SMOOTH });
    A({ targets: ref.current.querySelectorAll('.fade'), opacity: [0, 1], translateY: [24, 0], delay: anime.stagger(100, { start: 650 }), duration: 1200, easing: SMOOTH });
  }, []);
  return (
    <section className="cv page wrap" id="cv" ref={ref}>
      <header className="page-head">
        <p className="eyebrow fade">Curriculum vitae · {C.resume.location}</p>
        <h1 className="title page-title" aria-label="The full story.">
          <span className="t-line" aria-hidden="true">{chars('The')}<span className="sp"> </span>{chars('full')}<span className="sp"> </span>{chars('story')}<span className="ch dot"><span>.</span></span></span>
        </h1>
        <p className="lede fade">Experience, education and the tools I work with. Open any role to see what I did there, or download the one page PDF.</p>
      </header>
      <Resume data={C.resume} pdfHref="cv/Lincoln_Chege_CV.pdf" pdfName="Lincoln_Kariuki_Chege_CV.pdf" />
    </section>
  );
}

/* ---------- Contact ---------- */
function Copy({ text }) {
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const click = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); }
    catch (e) { const r = document.createRange(); r.selectNodeContents(ref.current); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  };
  return (
    <div className="copy">
      <span ref={ref} className="copy-text">{text}</span>
      <button onClick={click} className="btn sm">{done ? 'Copied' : 'Copy'}</button>
    </div>
  );
}
function Contact() {
  const C = useContext(ContentCtx);
  return (
    <section className="contact wrap" id="contact">
      <p className="eyebrow" data-reveal="left">Final scene · Contact</p>
      <h2 className="big" data-reveal="up">Have a shoot or a brand that needs pictures?</h2>
      <div className="contact-grid" data-reveal="up" data-stagger="120">
        <div><span className="mono muted">Email</span><Copy text={C.resume.email} /></div>
        <div><span className="mono muted">Phone</span>{C.resume.phones.map((p) => <Copy key={p} text={p} />)}</div>
        <div>
          <span className="mono muted">More work</span>
          <a className="link" href="https://rissygraphy.mypixieset.com" target="_blank" rel="noopener">rissygraphy on Pixieset ↗</a>
          <a className="link" href="https://drive.google.com/drive/folders/1Z2Iw4goRF_9_kg9F4_finH36bImbxOge?usp=drive_link" target="_blank" rel="noopener">Design and video folder ↗</a>
        </div>
      </div>
      <footer className="foot mono muted"><span>© 2026 Lincoln Kariuki Chege</span><span>Shot on Nikon D5600 · Nairobi, Kenya</span></footer>
    </section>
  );
}


/* ---------- Opening: a Netflix-style ident that plays once per visit ---------- */
const INTRO_KEY = 'lkc-intro-seen';
function introSeen() { try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch (e) { return false; } }
function Intro({ onDone }) {
  const ref = useRef(null);
  const done = useRef(false);
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) {}
    onDone();
  }, [onDone]);
  useEffect(() => {
    const el = ref.current;
    const logo = el.querySelector('.intro-logo');
    const letters = logo.querySelectorAll('.ich');
    const ribbonBox = el.querySelector('.ribbons');
    const ribbons = el.querySelectorAll('.ribbon');
    // only transform and opacity move here, so every frame stays on the compositor
    const fill = Math.max(2, (window.innerWidth / Math.max(1, ribbonBox.offsetWidth)) * 1.4);
    const tl = anime.timeline({ easing: SMOOTH, complete: finish });
    tl.add({ targets: letters, opacity: [0, 1], translateY: ['40%', '0%'], scale: [0.86, 1], delay: anime.stagger(45), duration: 900 })
      .add({ targets: logo.querySelector('.idot'), opacity: [0, 1], scale: [0, 1], duration: 600, easing: 'easeOutBack' }, '-=450')
      .add({ targets: logo, scale: [1, 1.05], duration: 800, easing: 'easeInOutSine' }, '-=250')
      .add({ targets: ribbons, scaleY: [0, 1], opacity: [0, 0.9], delay: anime.stagger(16, { from: 'center' }), duration: 700, easing: 'easeOutExpo' }, '-=700')
      .add({ targets: ribbonBox, scaleX: [1, fill], duration: 900, easing: 'easeInCubic' })
      .add({ targets: logo, scale: [1.05, 1.5], opacity: [1, 0], duration: 700, easing: 'easeInQuad' }, '-=950')
      .add({ targets: el, opacity: [1, 0], duration: 450, easing: 'linear', begin: releaseIntro }, '-=200');
    const skip = () => { tl.pause(); releaseIntro(); anime({ targets: el, opacity: 0, duration: 300, easing: 'linear', complete: finish }); };
    el.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });
    if (LENIS) LENIS.stop();
    return () => { tl.pause(); releaseIntro(); el.removeEventListener('click', skip); window.removeEventListener('keydown', skip); if (LENIS) LENIS.start(); };
  }, []);
  const word = (w) => [...w].map((c, i) => <span className="ich" key={w + i}>{c}</span>);
  return (
    <div className="intro" ref={ref} role="presentation">
      <div className="intro-stage">
        <div className="ribbons" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i className="ribbon" key={i} style={{ '--h': `${(i * 37) % 100}` }}></i>)}</div>
        <div className="intro-logo" aria-label="Rissy Graphy">{word('Rissy')}<span className="isp"></span>{word('Graphy')}<span className="idot"></span></div>
      </div>
      <span className="intro-skip mono">Click or press any key to skip</span>
    </div>
  );
}

/* ---------- Scene rail: a film-strip index of the Home page ---------- */
const SCENES = [['reel', 'The film'], ['numbers', 'At a glance'], ['work', 'Selected work'], ['about', 'Meet Lincoln'], ['cv-teaser', 'Curriculum vitae'], ['contact', 'Contact']];
function SceneRail() {
  const [active, setActive] = useState(0);
  const fillRef = useRef(null);
  const railRef = useRef(null);
  useEffect(() => {
    let raf = 0, last = -1;
    const tick = () => {
      const mid = window.innerHeight * 0.4;
      let idx = 0;
      SCENES.forEach(([id], i) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= mid) idx = i; });
      if (idx !== last) { last = idx; setActive(idx); }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${clamp(window.scrollY / Math.max(1, max))})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    A({ targets: railRef.current.querySelectorAll('a'), opacity: [0, 1], translateX: [20, 0], delay: anime.stagger(70, { start: 1600 }), duration: 900, easing: SMOOTH });
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    const dot = railRef.current && railRef.current.querySelector('a.on i');
    if (dot) A({ targets: dot, scale: [0.4, 1], duration: 700, easing: 'easeOutElastic(1, .55)' });
  }, [active]);
  return (
    <nav className="rail" ref={railRef} aria-label="Scenes on this page">
      <span className="rail-line" aria-hidden="true"><i ref={fillRef}></i></span>
      {SCENES.map(([id, label], i) => (
        <a key={id} href={'#' + id} className={i === active ? 'on' : ''} aria-current={i === active ? 'true' : undefined}>
          <span className="lbl"><span className="mono">{pad(i + 1)}</span>{label}</span>
          <i aria-hidden="true"></i>
        </a>
      ))}
    </nav>
  );
}

/* ---------- Ambient backdrop: one of Lincoln's photos, softly blurred behind every page ---------- */
function Backdrop() {
  const C = useContext(ContentCtx);
  const look = C.look || {};
  const p = look.bg && ALL_PHOTOS.find((x) => x.id === look.bg);
  if (!p) return <div className="backdrop" aria-hidden="true"></div>;
  return (
    <div className="backdrop" aria-hidden="true" style={{ '--bgo': (look.strength ?? 45) / 100 }}>
      <img key={p.id} src={p.thumb} alt="" decoding="async" ref={(n) => { if (n && n.complete && n.naturalWidth) n.classList.add('ld'); }} onLoad={(e) => e.currentTarget.classList.add('ld')} />
    </div>
  );
}

/* ---------- App + pages (#gallery and #cv are their own pages) ---------- */
const PAGE_OF = (id) => (id === 'gallery' ? 'gallery' : id === 'cv' ? 'cv' : 'home');
function App() {
  const [lb, setLb] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [intro, setIntro] = useState(() => (INTRO.on = !REDUCED && PAGE_OF(location.hash.slice(1)) === 'home' && !introSeen()));
  const [route, setRoute] = useState(() => PAGE_OF(location.hash.slice(1)));
  const routeRef = useRef(route);
  const pending = useRef(null);
  const site = useSiteContent();
  applyCaptions(site.content);
  const [shutterEl, runShutter] = useShutter();
  useReveals(route);
  useEffect(() => { startLenis(); }, []);
  // Hidden entry: Ctrl+Shift+E (Cmd+Shift+E on Mac) opens the editor for editors only
  useEffect(() => {
    if (!site.canEdit) return;
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) { e.preventDefault(); setAdmin(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [site.canEdit]);

  const toTop = () => { if (LENIS) LENIS.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); };
  const jumpTo = (id) => {
    const el = id === 'top' ? null : document.getElementById(id);
    if (!el) { toTop(); return; }
    const y = id === 'reel' ? 0 : el.getBoundingClientRect().top + window.scrollY - 64;
    // the new page is taller than the old one, so Lenis must re-measure before it can reach y
    if (LENIS) { LENIS.resize(); LENIS.scrollTo(y, { immediate: true, force: true }); }
    if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
  };
  // after a page swap renders, land on the requested spot
  useEffect(() => {
    const id = pending.current; pending.current = null;
    requestAnimationFrame(() => requestAnimationFrame(() => { if (id && PAGE_OF(id) === 'home' && id !== 'top') jumpTo(id); else toTop(); }));
  }, [route]);

  const go = useCallback((id, viaHistory) => {
    const page = PAGE_OF(id);
    const setHash = () => { if (!viaHistory) { try { history.pushState(null, '', '#' + id); } catch (e) {} } };
    if (page !== routeRef.current) {
      runShutter(() => { pending.current = id; routeRef.current = page; setRoute(page); setHash(); });
      return;
    }
    const el = id === 'top' ? document.body : document.getElementById(id);
    if (!el) return;
    setHash();
    if (Math.abs(el.getBoundingClientRect().top) < window.innerHeight * 1.2 || id === 'top' && window.scrollY < window.innerHeight * 1.2) scrollToEl(id === 'top' ? document.body : el);
    else runShutter(() => jumpTo(id));
  }, [runShutter]);

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      go(a.getAttribute('href').slice(1) || 'top');
    };
    const onPop = () => go(location.hash.slice(1) || 'top', true);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); };
  }, [go]);

  const open = (list, k, title, originEl) => {
    const r = originEl && originEl.getBoundingClientRect();
    setLb({ list, k, title, origin: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null });
  };
  const move = (d) => setLb((s) => ({ ...s, origin: null, k: (s.k + d + s.list.length) % s.list.length }));
  return (
    <ContentCtx.Provider value={site.content}>
      <Backdrop />
      <Nav route={route} canEdit={site.canEdit} onEdit={() => setAdmin(true)} />
      <main key={route}>
        {route === 'home' && <><CameraScene onOpen={open} /><Stats /><SelectedWork onOpen={open} /><About /><CVTeaser /><Contact /></>}
        {route === 'gallery' && <><GalleryPage onOpen={open} /><Contact /></>}
        {route === 'cv' && <><CVPage /><Contact /></>}
      </main>
      {route === 'home' && <SceneRail key="rail" />}
      {intro && <Intro onDone={() => setIntro(false)} />}
      {lb && <Lightbox state={lb} onClose={() => setLb(null)} onMove={move} />}
      {shutterEl}
      <div className="grain" aria-hidden="true"></div>
      <div className="vignette" aria-hidden="true"></div>
      {admin && <Admin site={site} onClose={() => setAdmin(false)} />}
    </ContentCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
