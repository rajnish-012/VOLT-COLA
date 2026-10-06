import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { FLAVORS } from './flavors.js';
const Scene3D = lazy(() => import('./Scene3D.jsx'));

function useScrollState(rootRef) {
  const motion = useRef({ y: 0, velocity: 0, progress: 0 }).current;
  useEffect(() => {
    let targetY = window.scrollY, lastY = targetY, lastTime = performance.now(), raf = 0;
    motion.y = targetY;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onScroll = () => { targetY = window.scrollY; schedule(); };
    const update = (time) => {
      const dt = Math.max(1, time - lastTime), delta = targetY - lastY;
      motion.velocity = delta ? delta / dt : motion.velocity * Math.exp(-dt / 135);
      motion.y = targetY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      motion.progress = Math.min(1, Math.max(0, targetY / max));
      const root = rootRef.current;
      if (root) {
        const speed = Math.min(1, Math.abs(motion.velocity) * .05);
        const heroProgress = Math.min(1, Math.max(0, targetY / Math.max(1, window.innerHeight)));
        root.style.setProperty('--scroll', `${motion.progress * 100}%`);
        root.style.setProperty('--speed', String(speed));
        root.style.setProperty('--energy-scale', String(1 + speed * .13));
        root.style.setProperty('--energy-width', `${speed * 100}%`);
        root.style.setProperty('--hero-rise-volt', `${heroProgress * -65}px`);
        root.style.setProperty('--hero-rise-cola', `${heroProgress * -28}px`);
        root.style.setProperty('--hero-opacity', String(1 - heroProgress * .2));
      }
      lastY = targetY; lastTime = time; raf = 0;
      if (Math.abs(motion.velocity) > .002) schedule();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    schedule();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [motion, rootRef]);
  return motion;
}

function ScenePoster({ type, className = '' }) {
  return <div className={`scene-poster ${type}`} aria-hidden="true">
    {type !== 'fizz' && <div className="poster-can"><i className="poster-cap" /><b>VOLT</b><small>COLA</small><i className="poster-line" /><i className="poster-foot" /></div>}
  </div>;
}

function SceneLayer({ calm, ...props }) {
  const host = useRef(null), [near, setNear] = useState(false), [ready, setReady] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node || !('IntersectionObserver' in window)) { setNear(true); return; }
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: props.type === 'hero' ? '40px 0px' : '120px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [props.type]);
  useEffect(() => {
    if (calm || !near) return;
    const timer = window.setTimeout(() => setReady(true), props.type === 'hero' ? 1050 : 180);
    return () => window.clearTimeout(timer);
  }, [calm, near, props.type]);
  const showScene = ready && near && !calm;
  return <div ref={host} className={`canvas-wrap scene-slot ${props.className}`} aria-hidden="true">
    {showScene ? <Suspense fallback={<ScenePoster {...props} />}><Scene3D calm={calm} {...props} /></Suspense> : <ScenePoster {...props} />}
  </div>;
}
function Cursor() {
  const dot = useRef(), ring = useRef(), pointer = useRef({ x: -100, y: -100 }), follow = useRef({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const over = e => setHover(Boolean(e.target.closest('a,button,[data-hover]')));
    window.addEventListener('pointerover', over);
    return () => { window.removeEventListener('pointerover', over); };
  }, []);
  useEffect(() => {
    let id = 0;
    const draw = () => {
      follow.current.x += (pointer.current.x - follow.current.x) * .22; follow.current.y += (pointer.current.y - follow.current.y) * .22;
      if (ring.current) ring.current.style.transform = `translate3d(${follow.current.x}px,${follow.current.y}px,0) translate(-50%,-50%) scale(${hover ? 1.55 : 1})`;
      const dx = pointer.current.x - follow.current.x, dy = pointer.current.y - follow.current.y;
      id = Math.hypot(dx, dy) > .5 ? requestAnimationFrame(draw) : 0;
    };
    const move = e => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
      if (!id) id = requestAnimationFrame(draw);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(id); };
  }, [hover]);
  return <><i className="cursor-dot" ref={dot} /><i className={`cursor-ring ${hover ? 'is-hover' : ''}`} ref={ring} /></>;
}

function MagneticLink({ href, children, className = '', onClick }) {
  const ref = useRef();
  const move = e => { if (matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const r = ref.current.getBoundingClientRect(); ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px, ${(e.clientY - r.top - r.height / 2) * .16}px)`; };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };
  return <a ref={ref} href={href} className={className} onPointerMove={move} onPointerLeave={reset} onClick={onClick}>{children}</a>;
}

function Header({ onMenu, menuOpen }) {
  return <header className="header"><a className="brand-lockup" href="#top" aria-label="VOLT COLA, home"><span className="brand-mark">V</span><span>VOLT <b>COLA</b></span></a>
    <div className="header-right"><a href="#flavor" className="nav-link">THE LINEUP</a><button className={`menu-button ${menuOpen ? 'open' : ''}`} onClick={onMenu} aria-expanded={menuOpen}><span>{menuOpen ? 'CLOSE' : 'MENU'}</span><i><b></b><b></b></i></button></div>
  </header>;
}

function Menu({ open, close }) {
  return <div className={`menu-overlay ${open ? 'visible' : ''}`} aria-hidden={!open}>
    <div className="menu-orb" /><div className="menu-content"><p className="eyebrow">THE NIGHT IS YOURS</p>
      {[['01', 'THE EXPERIENCE', '#top'], ['02', 'THE FIZZ', '#fizz'], ['03', 'THE LINEUP', '#flavor'], ['04', 'OUR STORY', '#story']].map(([n, title, href]) => <a href={href} key={n} onClick={close}><small>{n}</small><span>{title}</span><b>↗</b></a>)}
      <p className="menu-bottom">VOLT COLA <span>—</span> TURN IT UP.</p>
    </div>
  </div>;
}

function Loader({ done, progress }) {
  return <div className={`loader ${done ? 'loader-out' : ''}`} aria-hidden={done}><div className="loader-brand">V<span>OLT</span></div><div className="loader-track"><i style={{ transform: `scaleX(${progress / 100})` }} /></div><div className="loader-meta"><span>BUILT FOR AFTER DARK</span><span>{String(progress).padStart(2, '0')}%</span></div></div>;
}

function App() {
  const rootRef = useRef(null);
  const motion = useScrollState(rootRef);
  const [menuOpen, setMenuOpen] = useState(false), [active, setActive] = useState('original'), [loading, setLoading] = useState(true), [progress, setProgress] = useState(0), [mobile, setMobile] = useState(false);
  useEffect(() => { const timer = setInterval(() => setProgress(p => Math.min(100, p + 10)), 40); const finish = setTimeout(() => setLoading(false), 460); return () => { clearInterval(timer); clearTimeout(finish); }; }, []);
  useEffect(() => { const resize = () => setMobile(window.innerWidth < 760); resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize); }, []);
  useEffect(() => {
    const move = e => {
      const root = rootRef.current;
      if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      root.style.setProperty('--parallax-x', `${(e.clientX / window.innerWidth - .5) * 22}px`);
      root.style.setProperty('--parallax-y', `${(e.clientY / window.innerHeight - .5) * 18}px`);
      root.style.setProperty('--energy-shift', `${(.5 - e.clientX / window.innerWidth) * 18}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <div ref={rootRef} className={`site ${loading ? 'is-loading' : ''}`} style={{ '--scroll': '0%', '--speed': '0', '--energy-scale': '1', '--energy-width': '0%', '--hero-rise-volt': '0px', '--hero-rise-cola': '0px', '--hero-opacity': '1', '--parallax-x': '0px', '--parallax-y': '0px', '--energy-shift': '0px' }}>
    <div className="grain" /><div className="progress-rail"><i /></div><Header menuOpen={menuOpen} onMenu={() => setMenuOpen(v => !v)} /><Menu open={menuOpen} close={() => setMenuOpen(false)} />
    <main>
      <section className="hero" id="top">
        <div className="hero-glow" /><div className="hero-copy"><p className="eyebrow reveal">A NEW KIND OF NIGHT</p><h1 aria-label="VOLT COLA"><span className="hero-volt">VOLT</span><span className="hero-cola">COLA<span className="hero-period">.</span></span></h1><div className="hero-bottom"><span className="tagline">TURN IT UP<span className="red-dot">.</span></span><p>For the hours that<br />belong to no one else.</p></div></div>
        <SceneLayer type="hero" className="hero-product" camera={mobile ? [0, 0, 7.6] : [0, 0, 7.1]} dpr={mobile ? [1, 1.3] : [1, 1.65]} motion={motion} mobile={mobile} calm={calm} />
        <div className="hero-index"><span>01 / 08</span><i /><span>SCROLL TO FEEL IT</span></div><div className="hero-side-note">COLD. LOUD. ALIVE.</div>
        <a className="scroll-cue" href="#fizz"><span>SCROLL TO BEGIN</span><i><b /></i></a>
      </section>

      <section className="fizz section-dark" id="fizz">
        <SceneLayer type="fizz" className="fizz-particles" camera={[0, 0, 10]} dpr={mobile ? [1, 1.2] : [1, 1.5]} motion={motion} mobile={mobile} calm={calm} />
        <div className="fizz-topline"><span>02 — THE FEELING</span><span>OPEN A LITTLE LOUDER</span></div>
        <div className="fizz-copy"><p className="eyebrow">HEAR THAT?</p><h2>FEEL<br /><span>THE</span><br /><em>FIZZ.</em></h2></div>
        <div className="fizz-caption"><span className="orbit-dot" /><p>That first crack.<br />The sound of <strong>what's next.</strong></p></div><div className="fizz-stamp">TSSS<span>+</span></div>
      </section>

      <section className="liquid" id="liquid">
        <div className="liquid-orb"><div className="liquid-core" /><div className="liquid-sheen" /><i /><i /><i /></div>
        <div className="liquid-top"><span>01 — OPEN</span><span>02 — POUR</span><span>03 — GO</span></div>
        <div className="liquid-copy"><p className="eyebrow">A MOMENT IN MOTION</p><h2>LET THE<br /><span>NIGHT</span><br />POUR IN.</h2></div>
        <p className="liquid-foot">DEEP COLA. BRIGHT SPARK.<br />ALL THE WAY ALIVE.</p><div className="liquid-number">100<span>%</span></div>
      </section>

      <section className="flavor" id="flavor">
        <div className="flavor-heading"><p className="eyebrow">04 — PICK YOUR FREQUENCY</p><h2>ONE TASTE.<br /><span>ZERO</span> COMPROMISE.</h2><p className="flavor-intro">Three ways to light up the night.<br />Find your current.</p></div>
        <div className="flavor-grid">
          {Object.entries(FLAVORS).map(([id, f], i) => <button key={id} className={`flavor-card flavor-${id} ${active === id ? 'active' : ''}`} onMouseEnter={() => setActive(id)} onFocus={() => setActive(id)} onClick={() => setActive(id)} style={{ '--flavor': f.color, '--flavor-dark': f.dark, '--flavor-accent': f.accent }}>
            <span className="card-index">0{i + 1}</span><div className="card-halo" /><div className="card-can-css"><i className="can-cap" /><b>VOLT</b><small>COLA</small><i className="can-stripe" /><em>{f.flavor}</em><i className="can-foot" /></div><span className="card-copy"><b>{f.name}</b><small>{f.note}</small></span><span className="card-arrow">↗</span>
          </button>)}
        </div><div className="flavor-note"><span>REAL COLA ATTITUDE.</span><i /><span>YOUR NIGHT, YOUR CALL.</span></div>
      </section>

      <section className="energy" id="energy">
        <div className="energy-lines"><i /><i /><i /><i /><i /><i /></div><div className="energy-orb" />
        <div className="energy-meta"><span>05 — THE SWITCH</span><span>CHOOSE YOUR VOLUME</span></div>
        <h2><span>TURN</span><span>IT</span><span>UP<span className="red-dot">.</span></span></h2>
        <p className="energy-footer">WHEN THE WORLD TURNS DOWN,<br />WE TURN THE NIGHT UP.</p><div className="energy-track"><i /></div>
      </section>

      <section className="story" id="story">
        <div className="story-side"><span>06 — THE STORY</span><span>EST. AFTER DARK</span></div>
        <div className="story-copy"><p className="eyebrow">A DRINK FOR THE IN-BETWEEN</p><h2><span>Born after dark.</span><span>Built for <em>loud</em> nights.</span><span>Made for the moments</span><span>you don't want to <b>end.</b></span></h2><MagneticLink className="text-link" href="#collection">MEET YOUR NIGHT <span>↗</span></MagneticLink></div>
        <div className="story-flare" /><div className="story-vertical">VOLT COLA  /  TURN IT UP  /  VOLT COLA  /</div>
      </section>

      <section className="collection" id="collection">
        <div className="collection-heading"><p className="eyebrow">07 — THE COLLECTION</p><h2>MADE FOR<br /><span>YOUR</span> SIDE OF<br />MIDNIGHT.</h2></div>
        <div className="collection-stage"><div className="collection-ring" /><SceneLayer type="showcase" className="collection-product" camera={mobile ? [0, 0, 7.5] : [0, 0, 6.7]} dpr={mobile ? [1, 1.2] : [1, 1.5]} active={active} mobile={mobile} calm={calm} /><div className="collection-spark spark-a" /><div className="collection-spark spark-b" /><div className="collection-product-label"><span>VOLT / 00{Object.keys(FLAVORS).indexOf(active) + 1}</span><b>{FLAVORS[active].name}</b></div>
          <div className="collection-controls"><button aria-label="Select Original" className={active === 'original' ? 'chosen' : ''} onClick={() => setActive('original')}><i /></button><button aria-label="Select Zero" className={active === 'zero' ? 'chosen' : ''} onClick={() => setActive('zero')}><i /></button><button aria-label="Select Cherry" className={active === 'cherry' ? 'chosen' : ''} onClick={() => setActive('cherry')}><i /></button><span>SELECT YOUR CURRENT</span></div>
        </div><div className="collection-footer"><span>01 — ORIGINAL / 02 — ZERO / 03 — CHERRY</span><span>THREE CURRENTS. ONE VOLT.</span></div>
      </section>

      <section className="finale" id="finale">
        <div className="finale-light" /><p className="eyebrow">THE NIGHT IS STILL YOUNG</p><h2>READY<br /><span>TO TURN</span><br />IT UP<span className="red-dot">?</span></h2>
        <MagneticLink className="final-cta" href="#top"><span>ENTER THE NIGHT</span><b>↗</b></MagneticLink>
        <div className="finale-brand">VOLT<br /><span>COLA</span></div><div className="finale-bottom"><span>VOLT COLA © 2026</span><span>BEST SERVED AFTER DARK</span><a href="#top">BACK TO THE TOP ↑</a></div>
      </section>
    </main>
    <footer className="legal"><span>VOLT COLA IS A FICTIONAL BRAND CONCEPT.</span><span>DRINK IT COLD. LIVE IT LOUD.</span></footer>
    <Loader done={!loading} progress={progress} />{!mobile && !calm && <Cursor />}
  </div>;
}

export default App;
