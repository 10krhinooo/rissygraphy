/* Editable site content.
   Defaults live in code; saved edits live in the artifact's shared database at
   `site/content` (published page) or in this browser's storage (local copy). */
const ContentCtx = React.createContext(null);

const DEFAULT_CONTENT = {
  look: { bg: 'lakeellis-9', strength: 45 },
  intro: {
    eyebrow: 'Photographer · Graphic designer · Nairobi',
    lede: 'I follow people up mountains and into forests, then turn what I shoot into posters, promos and stories that brands can use.',
  },
  about: {
    heading: "Journalist's eye, designer's hand.",
    paras: [
      'I studied Journalism and Digital Media at KCA University, where I learned to find the story in a scene and tell it fast. I shoot on a Nikon D5600, grade in Lightroom Classic and finish in Photoshop.',
      'Design is where those images go to work. At Wanderville Tours and Travel I made posters, video promos and social content, and today I create and edit video for PowerPulse Dynamics.',
      'Away from the screen you will find me on a basketball court, out on a trail or deep in a book.',
    ],
    facts: [
      { k: 'Based in', v: 'Nairobi' }, { k: 'Studied', v: 'KCA University' },
      { k: 'Shoots on', v: 'Nikon D5600' }, { k: 'Speaks', v: 'English, Kiswahili' },
    ],
  },
  services: [
    { t: 'Event and adventure photography', d: 'Group hikes, outdoor events and the moments between them.' },
    { t: 'Portraits', d: 'Natural light portraits on location, styled or candid.' },
    { t: 'Editing and retouching', d: 'Colour grading and retouching in Lightroom and Photoshop.' },
    { t: 'Posters and social graphics', d: 'Campaign posters and feed content built around strong imagery.' },
    { t: 'Video and promos', d: 'Short promotional edits cut in Premiere Pro.' },
  ],
  resume: {
    ...RESUME,
    languages: RESUME.languages.map(([name, level, n]) => ({ name, level, n })),
    skills: Object.entries(RESUME.skills).map(([group, items]) => ({ group, items })),
  },
  captions: {},
};

const clone = (o) => JSON.parse(JSON.stringify(o));
function mergeContent(d) {
  const D = DEFAULT_CONTENT;
  if (!d || typeof d !== 'object') return clone(D);
  return clone({
    look: { ...D.look, ...(d.look || {}) },
    intro: { ...D.intro, ...(d.intro || {}) },
    about: { ...D.about, ...(d.about || {}) },
    services: Array.isArray(d.services) ? d.services : D.services,
    resume: { ...D.resume, ...(d.resume || {}) },
    captions: { ...(d.captions || {}) },
  });
}
/* Photo objects are shared by the gallery, reel and screen, so captions are applied in place */
function applyCaptions(c) {
  ALL_PHOTOS.forEach((p) => { p.cap = (c.captions && c.captions[p.id]) || CAPTIONS_BY_ID[p.id]; });
}

const IN_ARTIFACT = !!(window.claude && window.claude.use);
const LOCAL_KEY = 'lkc-site-content';

function useSiteContent() {
  const [content, setContent] = useState(() => clone(DEFAULT_CONTENT));
  const [canEdit, setCanEdit] = useState(false);
  const saved = useRef(clone(DEFAULT_CONTENT));
  const editing = useRef(false);
  const dbRef = useRef(null);

  useEffect(() => {
    if (!IN_ARTIFACT) {
      try { const raw = localStorage.getItem(LOCAL_KEY); if (raw) { const c = mergeContent(JSON.parse(raw)); saved.current = c; setContent(c); } } catch (e) {}
      setCanEdit(location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
      return;
    }
    let unsub = null, alive = true;
    (async () => {
      const [db, user] = await Promise.all([window.claude.use('db').catch(() => null), window.claude.use('user').catch(() => null)]);
      if (!alive) return;
      if (user) { try { setCanEdit(await user.canEdit()); } catch (e) {} }
      if (db) {
        dbRef.current = db;
        unsub = db.doc('site/content').onSnapshot((s) => {
          if (!s.exists) return;
          const c = mergeContent(s.data());
          saved.current = c;
          if (!editing.current) setContent(c);
        }, () => {});
      }
    })();
    return () => { alive = false; if (unsub) unsub(); };
  }, []);

  const preview = useCallback((c) => setContent(c), []);
  const begin = useCallback(() => { editing.current = true; }, []);
  const end = useCallback(() => { editing.current = false; setContent(saved.current); }, []);
  const save = useCallback(async (draft) => {
    const body = { ...clone(draft), updatedAt: new Date().toISOString() };
    if (IN_ARTIFACT) {
      if (!dbRef.current) throw { code: 'unavailable' };
      await dbRef.current.doc('site/content').set(body);
    } else {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(body));
    }
    saved.current = mergeContent(body);
  }, []);
  return { content, canEdit, preview, begin, end, save, saved, mode: IN_ARTIFACT ? 'shared' : 'local' };
}
