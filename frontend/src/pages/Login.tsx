import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MousePointer2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { authenticateLocally } from '../services/auth';
import '../styles/Login.css';

/* -------------------------------------------------------------------------- */
/*  Three.js Helpers: Floating Brand Text Texture                             */
/* -------------------------------------------------------------------------- */

function makeNameTexture(hollow: boolean, tint: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 160;
  const ctx = c.getContext('2d')!;
  ctx.font = '800 104px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;

  const a = 'NEXUS';
  const b = 'AI';
  const wa = ctx.measureText(a).width;
  const wb = ctx.measureText(b).width;
  const x = (c.width - wa - wb) / 2;

  if (hollow) {
    ctx.strokeStyle = '#d9d2ff';
    ctx.strokeText(a, x, 82);
    ctx.strokeStyle = tint;
    ctx.strokeText(b, x + wa, 82);
  } else {
    ctx.shadowColor = tint;
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(a, x, 82);
    ctx.fillStyle = tint;
    ctx.fillText(b, x + wa, 82);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const wrapY = (v: number) => ((((v + 9) % 18) + 18) % 18) - 9;

/* -------------------------------------------------------------------------- */
/*  Three.js Bot Scene Setup (matching Home Page)                             */
/* -------------------------------------------------------------------------- */

interface BotSceneHandle {
  spin: () => void;
  dispose: () => void;
}

function createLoginBotScene(
  canvas: HTMLCanvasElement,
  stageEl: HTMLElement,
): BotSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  // Lighting matching home page
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2, 4, 5);
  scene.add(keyLight);

  const purpleLight = new THREE.PointLight(0x8b6bff, 70, 14, 2);
  purpleLight.position.set(-3, 2, 3);
  scene.add(purpleLight);

  const blueLight = new THREE.PointLight(0x3fa9ff, 50, 14, 2);
  blueLight.position.set(4, -1.5, 3);
  scene.add(blueLight);

  /* ---------------------------- Robot ---------------------------------- */
  const white = new THREE.MeshStandardMaterial({ color: 0xeceaff, metalness: 0.5, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b1a, metalness: 0.9, roughness: 0.15 });
  const glowPurple = new THREE.MeshStandardMaterial({
    color: 0x8b6bff,
    emissive: 0x7a5cff,
    emissiveIntensity: 1.6,
  });
  const glowCyan = new THREE.MeshBasicMaterial({ color: 0x7df3ff });

  const robot = new THREE.Group();
  scene.add(robot);

  // Head
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
  const earCapGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 32);
  earCapGeo.rotateZ(Math.PI / 2);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, white);
    ear.position.set(side * 1.02, 0, 0);
    const cap = new THREE.Mesh(earCapGeo, glowPurple);
    cap.position.set(side * 1.04, 0, 0);
    head.add(ear, cap);
  }

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), dark);
  antenna.position.y = 0.98;
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), glowCyan);
  antennaTip.position.y = 1.3;
  head.add(antenna, antennaTip);

  // Torso / Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.3, 24), dark);
  neck.position.y = 0.42;
  robot.add(neck);

  const body = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.15, 0.9, 5, 0.35), white);
  body.position.y = -0.25;
  robot.add(body);

  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 12, 40), glowPurple);
  coreRing.position.set(0, -0.2, 0.46);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), glowCyan);
  core.position.set(0, -0.2, 0.47);
  robot.add(coreRing, core);

  // Hands
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

  // Thruster Flame
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.7, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x8b6bff,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -1.2;
  robot.add(flame);

  // Orbit rings and satellites
  const orbit = new THREE.Group();
  robot.add(orbit);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x9b86ff, transparent: true, opacity: 0.32 });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.01, 8, 160), ringMat);
  ringA.rotation.x = Math.PI / 2.3;
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.008, 8, 160), ringMat);
  ringB.rotation.set(Math.PI / 2.8, 0.5, 0);
  orbit.add(ringA, ringB);

  const satGeo = new THREE.SphereGeometry(0.09, 16, 16);
  const satellites: { mesh: THREE.Mesh; radius: number; speed: number; phase: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(satGeo, i === 1 ? glowCyan : glowPurple);
    orbit.add(mesh);
    satellites.push({ mesh, radius: 2.2 + i * 0.25, speed: 0.6 + i * 0.25, phase: i * 2.1 });
  }

  // Floating Cosmic Dust Particles
  const dustCount = 400;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    dustPos[i * 3 + 2] = -5 + Math.random() * 8;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xb9a9ff,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(dust);

  /* ---------------------- Background: floating brand text ---------------- */
  const nameTextures = [
    makeNameTexture(true, '#a995ff'),
    makeNameTexture(false, '#a995ff'),
    makeNameTexture(true, '#6fb2ff'),
    makeNameTexture(false, '#6fb2ff'),
  ];

  interface Faller {
    sprite: THREE.Sprite;
    mat: THREE.SpriteMaterial;
    y: number;
    prevDisp: number;
    speed: number;
    sway: number;
    ph: number;
    rot: number;
    baseOpacity: number;
    q: number;
  }

  const fallers: Faller[] = [];
  for (let i = 0; i < 12; i++) {
    const hollow = i % 2 === 0;
    const z = -10 + Math.random() * 7;
    const depth = (z + 10) / 7; // 0 far .. 1 near
    const baseOpacity = (hollow ? 0.16 : 0.08) * (0.5 + depth * 0.5);
    const mat = new THREE.SpriteMaterial({
      map: nameTextures[(i % 2) + (i % 4 < 2 ? 0 : 2)],
      transparent: true,
      opacity: baseOpacity,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    const w = 2.4 + depth * 2.8;
    sprite.scale.set(w, (w * 160) / 640, 1);
    scene.add(sprite);
    const y = (Math.random() - 0.5) * 18;
    fallers.push({
      sprite,
      mat,
      y,
      prevDisp: y,
      speed: 0.18 + Math.random() * 0.35,
      sway: 0.15 + Math.random() * 0.3,
      ph: Math.random() * Math.PI * 2,
      rot: (Math.random() - 0.5) * 0.35,
      baseOpacity,
      q: 0,
    });
    sprite.position.set((Math.random() - 0.5) * 26, y, z);
  }

  /* --------------------------- Sizing + input --------------------------- */
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let halfH = 1;
  let halfW = 1;

  const layout = () => {
    vw = Math.max(window.innerWidth, 1);
    vh = Math.max(window.innerHeight, 1);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
  };
  layout();
  window.addEventListener('resize', layout);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  const smooth = new THREE.Vector2(0, 0);

  const hitsRobot = () => {
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(robot, true).length > 0;
  };

  let spinT = 0.2; // Starts with welcoming spin
  let waveUntil = 3.5;
  let clock = 0;

  const onMove = (e: PointerEvent) => {
    pointer.set((e.clientX / vw) * 2 - 1, -(e.clientY / vh) * 2 + 1);
    document.body.style.cursor = hitsRobot() ? 'pointer' : '';
  };

  const triggerSpin = () => {
    spinT = 0;
    waveUntil = clock + 2.4;
  };

  const onDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, button, a')) return;
    if (hitsRobot()) {
      triggerSpin();
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);

  /* ------------------------------ Render Loop --------------------------- */
  let curScale = 0.9;
  const robotPos = new THREE.Vector3();
  let prev = performance.now();
  let raf = 0;
  const v = new THREE.Vector3();

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;
    clock += dt;
    const t = clock;
    const k = (rate: number) => 1 - Math.exp(-dt * rate);

    smooth.lerp(pointer, k(4));
    camera.position.set(smooth.x * 0.4, smooth.y * 0.25, 9);
    camera.lookAt(0, 0, 0);

    // Track stage position in viewport
    const r = stageEl.getBoundingClientRect();
    const upp = (2 * halfH) / vh;
    const tx = (((r.left + r.right) / 2 / vw) * 2 - 1) * halfW;
    const ty = -((((r.top + r.bottom) / 2 / vh) * 2 - 1)) * halfH;
    const fit = Math.min(1.1, (r.height * upp) / 4.2, (r.width * upp) / 5.2);

    robotPos.x += (tx - robotPos.x) * k(6);
    robotPos.y += (ty - robotPos.y) * k(6);
    curScale += (fit - curScale) * k(5);

    robot.scale.setScalar(Math.max(curScale, 0.001));
    robot.position.set(robotPos.x, robotPos.y + Math.sin(t * 1.4) * 0.15 * curScale, 0);

    /* --- Spin Animation exactly matching requested algorithm --- */
    if (spinT < 1) spinT = Math.min(1, spinT + dt / 1.1);
    const eased = spinT < 0.5 ? 4 * spinT ** 3 : 1 - (-2 * spinT + 2) ** 3 / 2;
    robot.rotation.y = smooth.x * 0.25 + eased * Math.PI * 2;

    head.rotation.y = THREE.MathUtils.clamp(smooth.x * 0.7, -0.7, 0.7);
    head.rotation.x = THREE.MathUtils.clamp(-smooth.y * 0.4, -0.4, 0.4);
    eyes.position.x = smooth.x * 0.05;
    eyes.position.y = 0.1 + smooth.y * 0.04;

    const b = t % 3.6;
    const blink = b < 0.14 ? Math.sin((b / 0.14) * Math.PI) : 0;
    eyeL.scale.y = eyeR.scale.y = 1.5 * (1 - 0.92 * blink);

    antennaTip.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
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
    ringA.rotation.z = t * 0.25;
    ringB.rotation.z = -t * 0.18;
    for (const s of satellites) {
      const a = t * s.speed + s.phase;
      s.mesh.position.set(Math.cos(a) * s.radius, Math.sin(a * 0.9) * 0.8, Math.sin(a) * s.radius * 0.6);
    }

    // Elements whose area should stay calm (real text lives here)
    const quietEls = Array.from(document.querySelectorAll<HTMLElement>('[data-quiet]'));
    const quietRects = quietEls.map((el) => el.getBoundingClientRect());
    const quietAt = (px: number, py: number, pad: number) => {
      for (const q of quietRects) {
        if (px > q.left - pad && px < q.right + pad && py > q.top - pad && py < q.bottom + pad) return 1;
      }
      return 0;
    };

    /* ---- floating/falling NEXUSAI brand text ---- */
    for (const f of fallers) {
      f.y -= f.speed * dt;
      const disp = wrapY(f.y);
      if (disp - f.prevDisp > 9) f.sprite.position.x = (Math.random() - 0.5) * 24;
      f.prevDisp = disp;
      f.sprite.position.y = disp;
      f.sprite.position.x += Math.sin(t * 0.3 + f.ph) * f.sway * dt;
      f.mat.rotation = f.rot + Math.sin(t * 0.4 + f.ph) * 0.1;

      v.copy(f.sprite.position).project(camera);
      const px = (v.x * 0.5 + 0.5) * vw;
      const py = (-v.y * 0.5 + 0.5) * vh;
      f.q += (quietAt(px, py, 70) - f.q) * k(4);
      f.mat.opacity = f.baseOpacity * (1 - 0.92 * f.q);
    }

    renderer.render(scene, camera);
  };

  tick(performance.now());

  return {
    spin: triggerSpin,
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.body.style.cursor = '';
      renderer.dispose();
      pmrem.dispose();
      envTarget.dispose();
      nameTextures.forEach((t) => t.dispose());
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Main Login Component                                                      */
/* -------------------------------------------------------------------------- */

function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const botHandleRef = useRef<BotSceneHandle | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize 3D Bot in empty area on the right
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    try {
      const handle = createLoginBotScene(canvas, stage);
      botHandleRef.current = handle;
      return () => {
        handle.dispose();
      };
    } catch (err) {
      console.warn('Login bot scene initialization error:', err);
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const targetEmail = email.trim();
    authenticateLocally(targetEmail, password);

    // Trigger bot spin and celebratory wave
    botHandleRef.current?.spin();

    setSuccessMessage('Thank you for logging in!');
    setIsSubmitted(true);

    window.setTimeout(() => {
      navigate('/app');
    }, 1500);
  }

  const onHeroMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <main className="login-page" onMouseMove={onHeroMove}>
      {/* 3D WebGL Canvas Layer */}
      <canvas className="login-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="login-spotlight" />

      {/* Top Navbar matching Home page */}
      <nav className="login-navbar">
        <Link to="/" className="login-brand">
          <span className="login-brand-icon">
            <BrainCircuit size={23} />
          </span>
          <span>
            NEXUS<span className="login-brand-highlight">AI</span>
          </span>
        </Link>

        <div className="login-nav-links">
          <Link to="/">Home</Link>
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it works</a>
        </div>

        <div className="login-nav-actions">
          <Link to="/signup" className="login-nav-cta">
            Sign up <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Main Container: Left Form + Left Thank You Space, Right 3D Bot Stage */}
      <div className="login-hero-inner">
        {/* Left Column: Form & Thank You below */}
        <div className="login-left-col">
          <section className="login-card" data-quiet>
            <div className="login-card-heading">
              <span className="login-heading-icon">
                <LockKeyhole size={22} />
              </span>

              <h1>Welcome back</h1>
              <p>Sign in to continue to your workspace.</p>
            </div>

            {successMessage && (
              <div className="auth-success-banner">
                <span className="success-icon">✓</span>
                <div>
                  <p className="success-text-title">{successMessage}</p>
                  <p className="success-text-sub">Opening your adventure workspace...</p>
                </div>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="login-email">Email address</label>

              <div className="login-input-wrapper">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-password-label">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button className="login-submit-button" type="submit" disabled={isSubmitted}>
                {isSubmitted ? (
                  'Logging in...'
                ) : (
                  <>
                    Log in <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>YOUR BUSINESS WORKSPACE</span>
            </div>

            <p className="login-signup-prompt">
              Don't have an account? <Link to="/signup">Create one</Link>
            </p>
          </section>

          {/* Left Empty Space Below: Just Thank you for Logging in! */}
          <div className={`login-thank-you-box ${isSubmitted ? 'is-active' : ''}`} data-quiet>
            <h2 className="login-thank-you-title">
              Thank you for <span className="login-gradient-text">Logging in!</span>
            </h2>
          </div>
        </div>

        {/* Right Empty Area: The 3D Bot Stage */}
        <div className="login-stage" ref={stageRef}>
          <div
            className="login-hint"
            onClick={() => {
              botHandleRef.current?.spin();
            }}
          >
            <MousePointer2 size={14} />
            Move your cursor. Click the bot.
          </div>
        </div>
      </div>

      <p className="login-footer">
        Built for people who want to turn ideas into action.
      </p>
    </main>
  );
}

export default Login;
