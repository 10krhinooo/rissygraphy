/* <Resume data={RESUME} pdfHref="cv/file.pdf" pdfName="Name_CV.pdf" />
   A self-contained, reusable full-width CV. All content comes from the `data` prop,
   so the same component renders any CV with the same shape as RESUME. */

/* Download button: uses the viewer's download prompt when the page runs as a published
   artifact, and a normal browser download anywhere else. */
function DownloadButton({ href, name, label = 'Download CV' }) {
  const [st, setSt] = useState('idle');
  const dlRef = useRef(null);
  useEffect(() => {
    if (window.claude && window.claude.use) dlRef.current = window.claude.use('downloads').catch(() => null);
  }, []);
  const go = async () => {
    if (st === 'busy') return;
    setSt('busy');
    try {
      const blob = await (await fetch(href)).blob();
      const dl = dlRef.current ? await dlRef.current : null;
      if (dl) {
        await dl.save({ filename: name, data: blob });
      } else {
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 3000);
      }
      setSt('done');
      toast(`${name} is in your downloads.`, { kind: 'ok', tag: 'Saved' });
    } catch (e) {
      const declined = e && e.code === 'declined';
      setSt(declined ? 'idle' : 'err');
      if (!declined) toast('The CV could not be downloaded. Check your connection and try again.', { kind: 'err', action: { label: 'Retry', run: () => go() } });
    }
    setTimeout(() => setSt((s) => (s === 'busy' ? s : 'idle')), 2600);
  };
  const text = { idle: label, busy: 'Preparing PDF', done: 'Saved', err: 'Download failed, try again' }[st];
  return (
    <button className={'btn solid dl ' + st} onClick={go} aria-live="polite">
      <span className="dl-ico" aria-hidden="true"><i></i></span>{text}<span className="mono dl-meta">PDF</span>
    </button>
  );
}

function ResumeItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    // height is a CSS grid-rows transition, so opening and closing always move together
    const el = bodyRef.current;
    if (first.current) { first.current = false; return; }
    if (REDUCED || !isOpen) return;
    anime({ targets: el.querySelectorAll('li'), opacity: [0, 1], translateX: [-16, 0], delay: anime.stagger(70, { start: 120 }), duration: 700, easing: SMOOTH });
  }, [isOpen]);
  return (
    <li className={'r-item' + (isOpen ? ' open' : '')}>
      <button className="r-item-head" aria-expanded={isOpen} onClick={onToggle}>
        <span className="r-dot" aria-hidden="true"></span>
        <span className="r-item-main"><b>{item.role}</b><span className="r-org">{item.org}</span></span>
        <span className="r-item-meta"><span className="mono">{item.when}</span><span className={'r-tag' + (item.tag === 'Current' ? ' now' : '')}>{item.tag}</span></span>
        <span className="r-chev" aria-hidden="true">+</span>
      </button>
      <div className="r-item-body" ref={bodyRef}><ul>{item.pts.map((t) => <li key={t}>{t}</li>)}</ul></div>
    </li>
  );
}

function Resume({ data, pdfHref, pdfName }) {
  const [open, setOpen] = useState(0);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.email); setCopied(true); setTimeout(() => setCopied(false), 1500); toast(`${data.email} is on your clipboard.`, { kind: 'ok', tag: 'Copied' }); }
    catch (e) { toast('Your browser blocked the clipboard. The email address is on the page to copy by hand.', { kind: 'err' }); }
  };
  return (
    <div className="cvx" aria-label={`CV of ${data.name}`}>
      <header className="cvx-head" data-reveal="up" data-stagger="100">
        <div className="cvx-id">
          <h3>{data.name}</h3>
          <p className="cvx-role">{data.title}</p>
        </div>
        <div className="cvx-actions">
          {pdfHref && <DownloadButton href={pdfHref} name={pdfName || 'CV.pdf'} />}
          <div className="cvx-contact mono">
            <button className="r-mail" onClick={copy} title="Copy email">{copied ? 'Email copied' : data.email}</button>
            <span>{data.phones.join('  ·  ')}</span>
            <span className="muted">{data.location}</span>
          </div>
        </div>
      </header>

      <p className="cvx-profile" data-reveal="up">{data.profile}</p>

      <div className="cvx-grid">
        <section className="cvx-col">
          <h4 className="cvx-h" data-reveal="left">Experience</h4>
          <ol className="r-timeline" data-reveal="up" data-stagger="90">
            {data.experience.map((x, i) => (
              <ResumeItem key={i} item={x} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </ol>
          <h4 className="cvx-h" data-reveal="left">Education</h4>
          <div data-reveal="up" data-stagger="90">
            {data.education.map((e) => (
              <div className="r-edu" key={e.q + e.school}>
                <div className="r-edu-line"><b>{e.q}</b><span className="mono">{e.when}</span></div>
                <p className="r-org">{e.school} · <span className="muted">{e.note}</span></p>
              </div>
            ))}
          </div>
        </section>
        <aside className="cvx-col cvx-side" data-reveal="right" data-stagger="100">
          {data.skills.map(({ group, items }, gi) => (
            <div className="r-group" key={gi}>
              <h4 className="cvx-h">{group}</h4>
              <div className="r-chips">{items.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          ))}
          <div className="r-group">
            <h4 className="cvx-h">Languages</h4>
            <ul className="r-langs">
              {data.languages.map(({ name: l, level: lvl, n }, li) => (
                <li key={li}><span>{l}</span><span className="r-meter" aria-label={lvl}>{Array.from({ length: 5 }, (_, i) => <i key={i} className={i < n ? 'on' : ''}></i>)}</span><span className="mono muted">{lvl}</span></li>
              ))}
            </ul>
          </div>
          <div className="r-group">
            <h4 className="cvx-h">Interests</h4>
            <div className="r-chips soft">{data.interests.map((s) => <span key={s}>{s}</span>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
