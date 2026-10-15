/* ---------- Admin: edit the site's text, CV and captions ---------- */
function Field({ id, label, value, onChange, multiline, rows = 3, type = 'text', hint }) {
  return (
    <label className="adm-field" htmlFor={id}>
      <span className="adm-label">{label}{hint && <em>{hint}</em>}</span>
      {multiline
        ? <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} type={type} value={value} onChange={(e) => onChange(type === 'number' ? +e.target.value : e.target.value)} />}
    </label>
  );
}

function ListEditor({ items, onChange, blank, addLabel, render, title }) {
  const set = (i, v) => { const n = items.slice(); n[i] = v; onChange(n); };
  const move = (i, d) => { const n = items.slice(); const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const del = (i) => onChange(items.filter((_, k) => k !== i));
  return (
    <div className="adm-list">
      {items.map((it, i) => (
        <div className="adm-card" key={i}>
          <div className="adm-card-bar">
            <span className="mono">{title ? title(it, i) : pad(i + 1)}</span>
            <span className="adm-card-tools">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              <button onClick={() => del(i)} aria-label="Remove" className="danger">Remove</button>
            </span>
          </div>
          {render(it, (v) => set(i, v), i)}
        </div>
      ))}
      <button className="adm-add" onClick={() => onChange([...items, clone(blank)])}>+ {addLabel}</button>
    </div>
  );
}

const ADMIN_TABS = [['look', 'Look'], ['intro', 'Intro'], ['about', 'About'], ['services', 'What I do'], ['cv', 'CV'], ['captions', 'Captions']];

function Admin({ site, onClose }) {
  const [draft, setDraft] = useState(() => clone(site.content));
  const [tab, setTab] = useState('intro');
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState('');
  const ref = useRef(null);
  const savedJSON = useRef(JSON.stringify(site.saved.current));
  const dirty = JSON.stringify(draft) !== savedJSON.current;

  useEffect(() => {
    site.begin();
    if (LENIS) LENIS.stop();
    A({ targets: ref.current.querySelector('.adm-panel'), translateX: ['100%', '0%'], duration: 800, easing: SMOOTH });
    A({ targets: ref.current, backgroundColor: ['rgba(0,0,0,0)', 'rgba(0,0,0,.45)'], duration: 500, easing: 'linear' });
    const key = (e) => { if (e.key === 'Escape') tryClose(); };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); if (LENIS) LENIS.start(); };
  }, []);
  useEffect(() => { site.preview(draft); setStatus((s) => (s === 'saved' ? '' : s)); }, [draft]);

  const up = (fn) => setDraft((d) => { const n = clone(d); fn(n); return n; });
  const finish = () => {
    const panel = ref.current.querySelector('.adm-panel');
    if (REDUCED) { site.end(); onClose(); return; }
    anime({ targets: panel, translateX: ['0%', '100%'], duration: 600, easing: 'cubicBezier(.7, 0, .84, 0)', complete: () => { site.end(); onClose(); } });
  };
  const tryClose = () => { if (dirty && confirm !== 'close') { setConfirm('close'); return; } finish(); };
  const save = async () => {
    setStatus('saving'); setConfirm('');
    try { await site.save(draft); savedJSON.current = JSON.stringify(mergeContent(JSON.parse(JSON.stringify(draft)))); setDraft((d) => clone(d)); setStatus('saved'); }
    catch (e) { setStatus(e && (e.code === 'permission_denied' || e.code === 'not_granted') ? 'denied' : 'error'); }
  };
  const reset = () => { if (confirm !== 'reset') { setConfirm('reset'); return; } setConfirm(''); setDraft(clone(DEFAULT_CONTENT)); };
  const msg = { saving: 'Saving', saved: site.mode === 'shared' ? 'Saved. Everyone now sees this version.' : 'Saved in this browser.', error: 'Could not save. Check your connection and try again.', denied: 'Your account can view this page but not edit it.' }[status];
  const R = draft.resume;

  return (
    <div className="adm" ref={ref} role="dialog" aria-modal="true" aria-label="Edit site" onClick={(e) => { if (e.target === ref.current) tryClose(); }}>
      <div className="adm-panel" data-lenis-prevent>
        <header className="adm-head">
          <div>
            <p className="mono adm-kicker">Admin</p>
            <h2>Edit the site</h2>
            <p className="adm-note">{site.mode === 'shared' ? 'Changes preview live behind this panel. Save to publish them for every visitor.' : 'Local copy: changes are saved in this browser only.'}</p>
          </div>
          <button className="adm-x" onClick={tryClose} aria-label="Close editor">✕</button>
        </header>
        <nav className="adm-tabs" role="tablist" aria-label="Sections">
          {ADMIN_TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>)}
        </nav>

        <div className="adm-body">
          {tab === 'look' && (
            <>
              <div className="adm-field">
                <span className="adm-label">Background photo<em>shown softly behind every page</em></span>
                <div className="adm-bgs">
                  <button className={!draft.look.bg ? 'on' : ''} onClick={() => up((d) => (d.look.bg = ''))} aria-label="No background photo">None</button>
                  {ALL_PHOTOS.map((p) => (
                    <button key={p.id} className={draft.look.bg === p.id ? 'on' : ''} onClick={() => up((d) => (d.look.bg = p.id))} aria-label={`Use ${p.cap}`} aria-pressed={draft.look.bg === p.id}>
                      <img src={p.thumb} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
              <label className="adm-field" htmlFor="lk-str">
                <span className="adm-label">Brightness of the background<em>{draft.look.strength}%</em></span>
                <input id="lk-str" type="range" min="0" max="90" step="5" value={draft.look.strength} onChange={(e) => { const v = +e.target.value; up((d) => (d.look.strength = v)); }} />
              </label>
            </>
          )}

          {tab === 'intro' && (
            <>
              <Field id="in-eyebrow" label="Line above the name" value={draft.intro.eyebrow} onChange={(v) => up((d) => (d.intro.eyebrow = v))} />
              <Field id="in-lede" label="Intro sentence" multiline value={draft.intro.lede} onChange={(v) => up((d) => (d.intro.lede = v))} />
            </>
          )}

          {tab === 'about' && (
            <>
              <Field id="ab-head" label="Heading" value={draft.about.heading} onChange={(v) => up((d) => (d.about.heading = v))} />
              <p className="adm-sub">Paragraphs</p>
              <ListEditor items={draft.about.paras} blank="" addLabel="Add paragraph" onChange={(n) => up((d) => (d.about.paras = n))}
                render={(it, set, i) => <Field id={`ab-p${i}`} label="Text" multiline rows={4} value={it} onChange={set} />} />
              <p className="adm-sub">Quick facts</p>
              <ListEditor items={draft.about.facts} blank={{ k: '', v: '' }} addLabel="Add fact" onChange={(n) => up((d) => (d.about.facts = n))}
                render={(it, set, i) => (
                  <div className="adm-row">
                    <Field id={`ab-fk${i}`} label="Label" value={it.k} onChange={(v) => set({ ...it, k: v })} />
                    <Field id={`ab-fv${i}`} label="Value" value={it.v} onChange={(v) => set({ ...it, v })} />
                  </div>
                )} />
            </>
          )}

          {tab === 'services' && (
            <ListEditor items={draft.services} blank={{ t: '', d: '' }} addLabel="Add service" title={(it, i) => `${pad(i + 1)} · ${it.t || 'New service'}`} onChange={(n) => up((d) => (d.services = n))}
              render={(it, set, i) => (
                <>
                  <Field id={`sv-t${i}`} label="Service" value={it.t} onChange={(v) => set({ ...it, t: v })} />
                  <Field id={`sv-d${i}`} label="Short description" multiline rows={2} value={it.d} onChange={(v) => set({ ...it, d: v })} />
                </>
              )} />
          )}

          {tab === 'cv' && (
            <>
              <p className="adm-sub">Basics</p>
              <Field id="cv-title" label="Title line" value={R.title} onChange={(v) => up((d) => (d.resume.title = v))} />
              <div className="adm-row">
                <Field id="cv-email" label="Email" type="email" value={R.email} onChange={(v) => up((d) => (d.resume.email = v))} />
                <Field id="cv-loc" label="Location" value={R.location} onChange={(v) => up((d) => (d.resume.location = v))} />
              </div>
              <Field id="cv-phones" label="Phone numbers" hint="one per line" multiline rows={2} value={R.phones.join('\n')} onChange={(v) => up((d) => (d.resume.phones = v.split('\n').map((s) => s.trim()).filter(Boolean)))} />
              <Field id="cv-profile" label="Profile" multiline rows={5} value={R.profile} onChange={(v) => up((d) => (d.resume.profile = v))} />

              <p className="adm-sub">Experience</p>
              <ListEditor items={R.experience} blank={{ role: '', org: '', when: '', tag: 'Attachment', pts: [] }} addLabel="Add role" title={(it, i) => it.role || 'New role'}
                onChange={(n) => up((d) => (d.resume.experience = n))}
                render={(it, set, i) => (
                  <>
                    <div className="adm-row">
                      <Field id={`xp-r${i}`} label="Role" value={it.role} onChange={(v) => set({ ...it, role: v })} />
                      <Field id={`xp-o${i}`} label="Organisation" value={it.org} onChange={(v) => set({ ...it, org: v })} />
                    </div>
                    <div className="adm-row">
                      <Field id={`xp-w${i}`} label="Dates" value={it.when} onChange={(v) => set({ ...it, when: v })} />
                      <label className="adm-field" htmlFor={`xp-t${i}`}><span className="adm-label">Type</span>
                        <select id={`xp-t${i}`} value={it.tag} onChange={(e) => set({ ...it, tag: e.target.value })}>
                          {['Current', 'Full time', 'Freelance', 'Attachment', 'Internship'].map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </label>
                    </div>
                    <Field id={`xp-p${i}`} label="What you did" hint="one point per line" multiline rows={4} value={it.pts.join('\n')} onChange={(v) => set({ ...it, pts: v.split('\n').filter((s) => s.trim()) })} />
                  </>
                )} />

              <p className="adm-sub">Education</p>
              <ListEditor items={R.education} blank={{ q: '', school: '', when: '', note: '' }} addLabel="Add education" title={(it) => it.q || 'New entry'}
                onChange={(n) => up((d) => (d.resume.education = n))}
                render={(it, set, i) => (
                  <>
                    <Field id={`ed-q${i}`} label="Qualification" value={it.q} onChange={(v) => set({ ...it, q: v })} />
                    <div className="adm-row">
                      <Field id={`ed-s${i}`} label="School" value={it.school} onChange={(v) => set({ ...it, school: v })} />
                      <Field id={`ed-w${i}`} label="Dates" value={it.when} onChange={(v) => set({ ...it, when: v })} />
                    </div>
                    <Field id={`ed-n${i}`} label="Note" value={it.note} onChange={(v) => set({ ...it, note: v })} />
                  </>
                )} />

              <p className="adm-sub">Skills</p>
              <ListEditor items={R.skills} blank={{ group: '', items: [] }} addLabel="Add skill group" title={(it) => it.group || 'New group'}
                onChange={(n) => up((d) => (d.resume.skills = n))}
                render={(it, set, i) => (
                  <>
                    <Field id={`sk-g${i}`} label="Group" value={it.group} onChange={(v) => set({ ...it, group: v })} />
                    <Field id={`sk-i${i}`} label="Skills" hint="separate with commas" value={it.items.join(', ')} onChange={(v) => set({ ...it, items: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
                  </>
                )} />

              <p className="adm-sub">Languages</p>
              <ListEditor items={R.languages} blank={{ name: '', level: 'Basic', n: 2 }} addLabel="Add language" title={(it) => it.name || 'New language'}
                onChange={(n) => up((d) => (d.resume.languages = n))}
                render={(it, set, i) => (
                  <div className="adm-row three">
                    <Field id={`lg-n${i}`} label="Language" value={it.name} onChange={(v) => set({ ...it, name: v })} />
                    <Field id={`lg-l${i}`} label="Level" value={it.level} onChange={(v) => set({ ...it, level: v })} />
                    <Field id={`lg-s${i}`} label="Bars (1 to 5)" type="number" value={it.n} onChange={(v) => set({ ...it, n: Math.max(1, Math.min(5, v || 1)) })} />
                  </div>
                )} />
              <Field id="cv-int" label="Interests" hint="separate with commas" value={R.interests.join(', ')} onChange={(v) => up((d) => (d.resume.interests = v.split(',').map((s) => s.trim()).filter(Boolean)))} />
              <p className="adm-hint">The downloadable PDF is a separate file and does not change with these edits.</p>
            </>
          )}

          {tab === 'captions' && (
            <div className="adm-caps">
              {ALL_PHOTOS.map((p) => (
                <label className="adm-cap" key={p.id} htmlFor={`cap-${p.id}`}>
                  <img src={p.thumb} alt="" loading="lazy" />
                  <input id={`cap-${p.id}`} value={draft.captions[p.id] != null ? draft.captions[p.id] : CAPTIONS_BY_ID[p.id]}
                    onChange={(e) => { const v = e.target.value; up((d) => { d.captions[p.id] = v; }); }} />
                </label>
              ))}
            </div>
          )}
        </div>

        <footer className="adm-foot">
          <span className={'adm-status ' + status} aria-live="polite">{confirm === 'close' ? 'You have unsaved changes. Close again to discard them.' : confirm === 'reset' ? 'Click reset again to restore every section to its original text.' : msg || (dirty ? 'Unsaved changes' : 'All changes saved')}</span>
          <div className="adm-actions">
            <button className="btn sm" onClick={reset}>{confirm === 'reset' ? 'Confirm reset' : 'Reset to original'}</button>
            <button className="btn solid" onClick={save} disabled={!dirty || status === 'saving'}>{status === 'saving' ? 'Saving' : 'Save changes'}</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
