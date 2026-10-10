import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  Globe,
  Plus,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/Dashboard.css';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const stats = [
  {
    title: 'Total Websites',
    value: '0',
    description: 'Your published websites',
    icon: Globe,
    color: 'purple',
    link: '/app/websites',
  },
  {
    title: 'CRM Leads',
    value: '0',
    description: 'Customers and prospects',
    icon: Users,
    color: 'blue',
    link: '/app/crm',
  },
  {
    title: 'Webinars',
    value: '0',
    description: 'Events you have created',
    icon: CalendarDays,
    color: 'orange',
    link: '/app/webinars',
  },
  {
    title: 'Business Insights',
    value: '—',
    description: 'Analytics overview',
    icon: ChartNoAxesCombined,
    color: 'green',
    link: '/app/analytics',
  },
];

const quickActions = [
  {
    title: 'Build a website',
    description: 'Turn your idea into a website.',
    icon: Globe,
    link: '/app/websites',
  },
  {
    title: 'Add a customer',
    description: 'Save a new lead in your CRM.',
    icon: Users,
    link: '/app/crm',
  },
  {
    title: 'Create a webinar',
    description: 'Plan your next online event.',
    icon: CalendarDays,
    link: '/app/webinars',
  },
];

const suggestions = [
  'Build a website for my business',
  'Add a new customer',
  'Plan a webinar for next week',
];

const placeholders = [
  'Build a landing page for my bakery…',
  'Add Priya as a new lead…',
  'Create a webinar for Friday at 5 pm…',
];

/* -------------------------------------------------------------------------- */
/*  Small 3D scene for the welcome card                                       */
/*  Robot follows the cursor, blinks and waves; three tiles in the colours of */
/*  the stat cards orbit it. Click the robot for a spin.                      */
/* -------------------------------------------------------------------------- */

function disposeMaterial(mat: THREE.Material) {
  const withMap = mat as THREE.Material & { map?: THREE.Texture | null };
  withMap.map?.dispose();
  mat.dispose();
}

function createRobotScene(host: HTMLElement, canvas: HTMLCanvasElement, reduced: boolean): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 4, 5);
  scene.add(key);
  const purple = new THREE.PointLight(0x8b6bff, 60, 14, 2);
  purple.position.set(-3, 2, 3);
  scene.add(purple);
  const blue = new THREE.PointLight(0x3fa9ff, 45, 14, 2);
  blue.position.set(4, -1.5, 3);
  scene.add(blue);

  const white = new THREE.MeshStandardMaterial({ color: 0xeceaff, metalness: 0.5, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b1a, metalness: 0.9, roughness: 0.15 });
  const glowPurple = new THREE.MeshStandardMaterial({
    color: 0x8b6bff,
    emissive: 0x7a5cff,
    emissiveIntensity: 1.6,
  });
  const glowCyan = new THREE.MeshBasicMaterial({ color: 0x7df3ff });

  const rig = new THREE.Group();
  scene.add(rig);

  const robot = new THREE.Group();
  robot.position.y = -0.35;
  rig.add(robot);

  const head = new THREE.Group();
  head.position.y = 1.25;
  robot.add(head);
  head.add(new THREE.Mesh(new RoundedBoxGeometry(1.9, 1.5, 1.6, 5, 0.45), white));
  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.85, 0.2, 4, 0.1), dark);
  visor.position.set(0, 0.02, 0.72);
  head.add(visor);

  const eyes = new THREE.Group();
  eyes.position.set(0, 0.1, 0.84);
  head.add(eyes);
  const eyeGeo = new THREE.SphereGeometry(0.15, 24, 24);
  const eyeL = new THREE.Mesh(eyeGeo, glowCyan);
  const eyeR = new THREE.Mesh(eyeGeo, glowCyan);
  eyeL.position.x = -0.38;
  eyeR.position.x = 0.38;
  eyeL.scale.set(1, 1.5, 0.4);
  eyeR.scale.set(1, 1.5, 0.4);
  eyes.add(eyeL, eyeR);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.017, 8, 28, Math.PI), glowCyan);
  smile.rotation.z = Math.PI;
  smile.position.set(0, -0.16, 0.84);
  head.add(smile);

  const earGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 32);
  earGeo.rotateZ(Math.PI / 2);
  const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 32);
  capGeo.rotateZ(Math.PI / 2);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, white);
    ear.position.set(side * 1.02, 0, 0);
    const cap = new THREE.Mesh(capGeo, glowPurple);
    cap.position.set(side * 1.04, 0, 0);
    head.add(ear, cap);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), dark);
  antenna.position.y = 0.98;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), glowCyan);
  tip.position.y = 1.3;
  head.add(antenna, tip);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.3, 24), dark);
  neck.position.y = 0.42;
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.15, 0.9, 5, 0.35), white);
  body.position.y = -0.25;
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 12, 40), glowPurple);
  coreRing.position.set(0, -0.2, 0.46);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), glowCyan);
  core.position.set(0, -0.2, 0.47);
  robot.add(neck, body, coreRing, core);

  const handGeo = new THREE.SphereGeometry(0.26, 28, 28);
  const cuffGeo = new THREE.TorusGeometry(0.2, 0.05, 12, 32);
  const makeHand = (side: number) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(handGeo, white));
    const cuff = new THREE.Mesh(cuffGeo, dark);
    cuff.position.x = -side * 0.2;
    cuff.rotation.y = Math.PI / 2;
    g.add(cuff);
    robot.add(g);
    return g;
  };
  const handL = makeHand(-1);
  const handR = makeHand(1);

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.7, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x8b6bff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -1.2;
  robot.add(flame);

  // Orbiting tiles in the colours of the stat cards (websites, CRM, analytics)
  const orbit = new THREE.Group();
  orbit.rotation.x = 0.35;
  rig.add(orbit);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.008, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0x9b86ff, transparent: true, opacity: 0.3 }),
  );
  ring.rotation.x = Math.PI / 2;
  orbit.add(ring);

  const tileGeo = new RoundedBoxGeometry(0.5, 0.5, 0.5, 4, 0.14);
  const tileColors = [0x8b6bff, 0x4f9bff, 0x5fe0a0];
  const tiles = tileColors.map((color, i) => {
    const mesh = new THREE.Mesh(
      tileGeo,
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0.3,
        roughness: 0.25,
        emissive: color,
        emissiveIntensity: 0.35,
      }),
    );
    orbit.add(mesh);
    return { mesh, phase: (i / 3) * Math.PI * 2 };
  });

  // A little dust for depth
  const dustPos = new Float32Array(80 * 3);
  for (let i = 0; i < 80; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 10;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    dustPos[i * 3 + 2] = -3 + Math.random() * 4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xb9a9ff,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  /* ---- sizing + input ---- */
  const layout = () => {
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    rig.scale.setScalar(THREE.MathUtils.clamp(Math.min(halfH / 2.5, halfW / 3.2), 0.35, 1.05));
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(host);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-0.3, 0.1);
  const smooth = new THREE.Vector2(-0.3, 0.1);
  const local = new THREE.Vector2();

  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1),
      THREE.MathUtils.clamp(-(e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5), -1, 1),
    );
  };

  let spinT = 1;
  let waveUntil = 3;
  let clock = 0;

  const onDown = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    local.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(local, camera);
    if (raycaster.intersectObject(robot, true).length === 0) return;
    if (spinT >= 1) spinT = 0;
    waveUntil = clock + 2;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  canvas.addEventListener('pointerdown', onDown);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(host);

  let prev = performance.now();
  let raf = 0;
  const motion = reduced ? 0 : 1;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible) {
      prev = now;
      return;
    }
    const dt = Math.min((now - prev) / 1000, 0.05) * motion;
    prev = now;
    clock += dt;
    const t = clock;

    smooth.lerp(pointer, reduced ? 1 : 1 - Math.exp(-dt * 4));

    rig.position.y = Math.sin(t * 1.4) * 0.12;
    if (spinT < 1) spinT = Math.min(1, spinT + dt / 1.1);
    const eased = spinT < 0.5 ? 4 * spinT ** 3 : 1 - (-2 * spinT + 2) ** 3 / 2;
    robot.rotation.y = smooth.x * 0.25 + eased * Math.PI * 2;

    head.rotation.y = THREE.MathUtils.clamp(smooth.x * 0.8, -0.7, 0.7);
    head.rotation.x = THREE.MathUtils.clamp(-smooth.y * 0.5, -0.4, 0.4);
    eyes.position.x = smooth.x * 0.05;
    eyes.position.y = 0.1 + smooth.y * 0.04;

    const b = t % 3.6;
    const blink = b < 0.14 ? Math.sin((b / 0.14) * Math.PI) : 0;
    eyeL.scale.y = eyeR.scale.y = 1.5 * (1 - 0.92 * blink);

    tip.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
    coreRing.rotation.z = t * 1.2;
    core.scale.setScalar(1 + Math.sin(t * 3) * 0.15);

    handL.position.set(-1.1, -0.3 + Math.sin(t * 1.6 + 1) * 0.08, 0.25);
    if (t < waveUntil) {
      handR.position.set(1.25, 0.45 + Math.sin(t * 10) * 0.12, 0.25);
      handR.rotation.z = Math.sin(t * 10) * 0.4;
    } else {
      handR.position.set(1.1, -0.3 + Math.sin(t * 1.6 + 2) * 0.08, 0.25);
      handR.rotation.z = 0;
    }
    flame.scale.set(1, 0.85 + Math.sin(t * 22) * 0.15 + Math.random() * 0.08, 1);

    orbit.rotation.y = smooth.x * 0.2;
    for (const tile of tiles) {
      const a = t * 0.55 + tile.phase;
      tile.mesh.position.set(Math.cos(a) * 2.7, Math.sin(a * 2) * 0.15, Math.sin(a) * 2.7);
      tile.mesh.rotation.x = t * 0.6 + tile.phase;
      tile.mesh.rotation.y = t * 0.8 + tile.phase;
    }
    dust.rotation.y = t * 0.03;

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerdown', onDown);
    scene.traverse((obj) => {
      const o = obj as THREE.Mesh | THREE.Points;
      if ('geometry' in o && o.geometry) o.geometry.dispose();
      const m = (o as THREE.Mesh).material;
      if (Array.isArray(m)) m.forEach(disposeMaterial);
      else if (m) disposeMaterial(m);
    });
    envTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}

/* -------------------------------------------------------------------------- */
/*  Hooks + small pieces                                                      */
/* -------------------------------------------------------------------------- */

/** Counts a number up when it first appears (and whenever it changes). */
function useCountUp(target: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced || target === 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return value;
}

function StatValue({ value, reduced }: { value: string; reduced: boolean }) {
  const numeric = /^\d+$/.test(value);
  const counted = useCountUp(numeric ? Number(value) : 0, reduced);
  return <strong>{numeric ? counted : value}</strong>;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function Dashboard() {
  const navigate = useNavigate();
  const welcomeRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const { greeting, today } = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    return {
      greeting: h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening',
      today: new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now),
    };
  }, []);

  // 3D robot in the welcome card (page keeps working if WebGL is unavailable)
  useEffect(() => {
    const host = artRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let dispose: (() => void) | undefined;
    try {
      dispose = createRobotScene(host, canvas, reduced);
    } catch (err) {
      console.warn('Dashboard: WebGL scene could not start.', err);
    }
    return () => dispose?.();
  }, [reduced]);

  // Rotating placeholder
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setPlaceholderIndex((i) => (i + 1) % placeholders.length), 3500);
    return () => window.clearInterval(id);
  }, [reduced]);

  // "/" jumps to the AI prompt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitPrompt = (e: FormEvent) => {
    e.preventDefault();
    // The workspace page can read this via useLocation().state?.prompt
    navigate('/app/workspace', { state: { prompt: prompt.trim() } });
  };

  const pickSuggestion = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  // Pointer-following light on the welcome card
  const onWelcomeMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  // Spotlight (all cards) + tilt (stat cards only)
  const onSpot = (e: ReactMouseEvent<HTMLElement>, tilt = false) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
    if (tilt) {
      el.style.setProperty('--rx', `${(0.5 - py) * 8}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
    }
  };
  const onSpotLeave = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  const rise = (i: number) => ({ '--i': i }) as CSSProperties;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar title="Dashboard" />

        <main className="dashboard-content">
          <section className="dashboard-welcome dash-rise" style={rise(0)} ref={welcomeRef} onMouseMove={onWelcomeMove}>
            <div className="dashboard-welcome-copy">
              <span className="dashboard-eyebrow">
                <span className="dashboard-live-dot" />
                {greeting}
                <span className="dashboard-date">{today}</span>
              </span>

              <h1>Turn your ideas into action.</h1>

              <p>Welcome to Nexus AI. What would you like to work on today?</p>

              <form className="dashboard-prompt" onSubmit={submitPrompt}>
                <Sparkles size={17} className="dashboard-prompt-icon" />
                <input
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholders[placeholderIndex]}
                  aria-label="Tell Nexus what you want to do"
                  onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
                />
                <kbd className="dashboard-kbd" aria-hidden="true">
                  /
                </kbd>
                <button type="submit" className="dashboard-prompt-send" aria-label="Open AI Workspace">
                  <ArrowRight size={17} />
                </button>
              </form>

              <div className="dashboard-chips">
                {suggestions.map((s) => (
                  <button type="button" className="dashboard-chip" key={s} onClick={() => pickSuggestion(s)}>
                    {s}
                  </button>
                ))}
              </div>

              <Link to="/app/workspace" className="dashboard-ai-button">
                <BrainCircuit size={18} />
                Open AI Workspace
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="dashboard-welcome-art" ref={artRef}>
              <canvas ref={canvasRef} aria-hidden="true" />
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading dash-rise" style={rise(1)}>
              <div>
                <h2>Workspace overview</h2>
                <p>A quick look at your business resources.</p>
              </div>

              <span className="dashboard-period-label">
                <Clock3 size={14} />
                All time
              </span>
            </div>

            <div className="dashboard-stats-grid">
              {stats.map((stat, i) => {
                const Icon = stat.icon;

                return (
                  <Link
                    to={stat.link}
                    className="dashboard-stat-card dash-rise"
                    style={rise(2 + i)}
                    key={stat.title}
                    onMouseMove={(e) => onSpot(e, true)}
                    onMouseLeave={onSpotLeave}
                  >
                    <div className="dashboard-stat-top">
                      <span className={`dashboard-stat-icon ${stat.color}`}>
                        <Icon size={20} />
                      </span>
                      <ArrowRight className="dashboard-stat-arrow" size={16} />
                    </div>

                    <p>{stat.title}</p>
                    <StatValue value={stat.value} reduced={reduced} />
                    <span className="dashboard-stat-description">{stat.description}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="dashboard-lower-grid">
            <div
              className="dashboard-panel dashboard-quick-panel dash-rise"
              style={rise(6)}
              onMouseMove={onSpot}
            >
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Quick actions</h2>
                  <p>Get started with a new task.</p>
                </div>
                <Zap size={19} />
              </div>

              <div className="dashboard-quick-list">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link to={action.link} className="dashboard-quick-item" key={action.title}>
                      <span className="dashboard-quick-icon">
                        <Icon size={19} />
                      </span>

                      <span className="dashboard-quick-text">
                        <strong>{action.title}</strong>
                        <span>{action.description}</span>
                      </span>

                      <ArrowRight size={17} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div
              className="dashboard-panel dashboard-activity-panel dash-rise"
              style={rise(7)}
              onMouseMove={onSpot}
            >
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Your latest workspace updates.</p>
                </div>

                <Clock3 size={19} />
              </div>

              <div className="dashboard-empty-state">
                <div className="dashboard-ghosts" aria-hidden="true">
                  {[0, 1, 2].map((n) => (
                    <div className="dashboard-ghost" key={n} style={{ '--g': n } as CSSProperties}>
                      <span />
                      <div>
                        <i />
                        <i />
                      </div>
                    </div>
                  ))}
                </div>

                <span className="dashboard-empty-icon">
                  <Plus size={23} />
                </span>

                <strong>Nothing here yet</strong>

                <p>
                  Your website, CRM, and webinar activities will appear here once you start creating resources.
                </p>

                <Link to="/app/workspace">
                  Start with AI <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>Nexus AI Workspace</span>
            <span>One workspace. More possibilities.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;