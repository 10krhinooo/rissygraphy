/* Shared helpers used by every component */
const { useState, useEffect, useRef, useCallback, useMemo, useContext } = React;
const META = window.__META__;
const PORTRAIT = window.__PORTRAIT__ || null;
const REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const A = (opts) => (REDUCED ? null : anime(opts));
const SMOOTH = 'cubicBezier(.16, 1, .3, 1)';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');
const lerp = (a, b, t) => a + (b - a) * t;
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const shutter = (s) => (s >= 1 ? `${s}` : `1/${Math.round(1 / s)}`);

/* While the opening ident plays, heavy scenes wait so the ident gets every frame */
const INTRO = { on: false, cbs: [] };
function whenIntroDone(fn) { if (INTRO.on) INTRO.cbs.push(fn); else fn(); }
function releaseIntro() { if (!INTRO.on) return; INTRO.on = false; INTRO.cbs.splice(0).forEach((f) => f()); }

/* Smooth scroll (Lenis) shared by every scroll-driven piece */
let LENIS = null;
function startLenis() {
  if (REDUCED || !window.Lenis || LENIS) return;
  try {
    LENIS = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    const raf = (t) => { LENIS.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } catch (e) { LENIS = null; }
}
function scrollToEl(el) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 64;
  if (LENIS) LENIS.scrollTo(y, { duration: 1.8 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/* Slide-into-frame reveals: elements marked data-reveal stay visible at rest
   and animate once as they arrive in the viewport. */
const REVEALS = {
  up: { translateY: [64, 0], opacity: [0, 1] },
  left: { translateX: [-100, 0], opacity: [0, 1] },
  right: { translateX: [100, 0], opacity: [0, 1] },
  frame: { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], translateY: [48, 0] },
  print: { clipPath: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'], translateY: [-70, 0] },
};
function useReveals(key) {
  useEffect(() => {
    if (REDUCED || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const group = el.hasAttribute('data-stagger');
        const nodes = group ? [...el.children] : [el];
        anime({
          targets: nodes, ...(REVEALS[el.dataset.reveal] || REVEALS.up),
          delay: group ? anime.stagger(+el.dataset.stagger || 90) : 0,
          duration: el.dataset.reveal === 'print' ? 1700 : 1300, easing: SMOOTH,
          begin: () => nodes.forEach((n) => (n.style.willChange = 'transform, opacity, clip-path')),
          complete: () => nodes.forEach((n) => { n.style.willChange = ''; n.style.clipPath = ''; }),
        });
      });
    }, { threshold: 0.01 });
    const t = setTimeout(() => document.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n)), 50);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [key]);
}
