import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Globe,
  Users,
  CalendarDays,
  ChartNoAxesCombined,
  MousePointer2,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import '../styles/LandingPage.css';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  number: string;
}

const features: Feature[] = [
  {
    icon: Globe,
    title: 'AI Website Builder',
    description: 'Create professional business websites using simple prompts.',
    number: '01',
  },
  {
    icon: Users,
    title: 'Smart CRM',
    description: 'Manage leads and customer information in one workspace.',
    number: '02',
  },
  {
    icon: CalendarDays,
    title: 'Webinar Manager',
    description: 'Create webinars and organize registrations effortlessly.',
    number: '03',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Business Analytics',
    description: 'Understand your business using meaningful insights.',
    number: '04',
  },
];

const marqueeItems = ['AI Websites', 'Smart CRM', 'Webinars', 'Analytics', 'Nexus AI'];

const prompts = [
  'Build a website for my bakery',
  'Add a webinar for Friday at 5 pm',
  'Show me this month’s new leads',
];

const steps = [
  { n: '01', title: 'Describe', text: 'Tell Nexus what your business needs in plain English.' },
  { n: '02', title: 'Review', text: 'Review the proposed changes before important actions run.' },
  { n: '03', title: 'Launch', text: 'Turn approved plans into real, connected business resources.' },
];

const reviewRows = ['Create homepage', 'Add booking form', 'Connect CRM'];
const launchRows = ['Website is live', 'CRM is connected', 'Webinar is scheduled'];

/* -------------------------------------------------------------------------- */
/*  Three.js helpers                                                          */
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

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function disposeMaterial(mat: THREE.Material) {
  const withMap = mat as THREE.Material & { map?: THREE.Texture | null };
  withMap.map?.dispose();
  mat.dispose();
}

const wrapY = (v: number) => ((((v + 9) % 18) + 18) % 18) - 9;
const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* -------------------------------------------------------------------------- */
/*  Page-wide scene                                                           */
/*                                                                            */
/*  One fixed canvas sits behind the whole page.                              */
/*  - The robot hops between "anchor" elements (hero stage, features slot,    */
/*    final CTA slot): it shrinks away, reappears at the next one and waves.  */
/*  - Background orbs, glow and "NEXUSAI" text drift with scroll parallax and */
/*    fade out wherever real text ([data-quiet]) is on screen.                */
/* -------------------------------------------------------------------------- */

function createScene(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  anchors: HTMLElement[],
  reduced: boolean,
): () => void {
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
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
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
  robot.visible = false;
  scene.add(robot);

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
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -1.2;
  robot.add(flame);

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

  /* ------------------------ Background: soft glow ----------------------- */
  const glowTex = makeGlowTexture();
  interface Glow {
    sprite: THREE.Sprite;
    home: THREE.Vector3;
    sp: number;
    ph: number;
    par: number;
  }
  const glows: Glow[] = [];
  const glowColors = [0x7a5cff, 0x3f7bff, 0x9a4dff, 0x4b6dff, 0x7a5cff];
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color: glowColors[i],
      transparent: true,
      opacity: 0.2 + Math.random() * 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    const s = 10 + Math.random() * 6;
    sprite.scale.set(s, s, 1);
    const home = new THREE.Vector3((Math.random() - 0.5) * 22, -8 + i * 4.2, -12 + Math.random() * 3);
    sprite.position.copy(home);
    scene.add(sprite);
    glows.push({ sprite, home, sp: 0.05 + Math.random() * 0.06, ph: Math.random() * 6, par: 0.0012 });
  }

  /* ---------------------- Background: soft floating orbs ---------------- */
  const orbGeo = new THREE.SphereGeometry(1, 32, 32);
  const torusGeo = new THREE.TorusGeometry(0.7, 0.28, 24, 48);
  const icoGeo = new THREE.IcosahedronGeometry(0.9, 0);
  const palette = [0x8b6bff, 0x5b8cff, 0xb9a9ff, 0x3fd0ff];

  interface Floater {
    mesh: THREE.Mesh;
    mat: THREE.Material & { opacity: number };
    base: THREE.Vector3;
    home: THREE.Vector3;
    vel: THREE.Vector3;
    spin: THREE.Vector3;
    fx: number;
    fy: number;
    ph: number;
    par: number;
    baseOpacity: number;
    q: number;
  }
  const floaters: Floater[] = [];
  for (let i = 0; i < 18; i++) {
    const color = palette[i % palette.length];
    const kind = i % 6; // 0-3 orbs, 4 torus, 5 wire ico
    let mesh: THREE.Mesh;
    let baseOpacity: number;
    if (kind === 5) {
      baseOpacity = 0.35;
      mesh = new THREE.Mesh(
        icoGeo,
        new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: baseOpacity }),
      );
      mesh.scale.setScalar(0.35 + Math.random() * 0.25);
    } else {
      baseOpacity = kind === 4 ? 0.8 : 0.45 + Math.random() * 0.4;
      mesh = new THREE.Mesh(
        kind === 4 ? torusGeo : orbGeo,
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.25,
          roughness: 0.18,
          emissive: color,
          emissiveIntensity: 0.28,
          transparent: true,
          opacity: baseOpacity,
        }),
      );
      mesh.scale.setScalar(kind === 4 ? 0.3 + Math.random() * 0.15 : 0.1 + Math.pow(Math.random(), 2) * 0.5);
    }
    const z = -7 + Math.random() * 7.5;
    const home = new THREE.Vector3((Math.random() - 0.5) * 17, (Math.random() - 0.5) * 18, z);
    scene.add(mesh);
    floaters.push({
      mesh,
      mat: mesh.material as THREE.Material & { opacity: number },
      base: home.clone(),
      home,
      vel: new THREE.Vector3(),
      spin: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3),
      fx: 0.15 + Math.random() * 0.2,
      fy: 0.12 + Math.random() * 0.2,
      ph: Math.random() * Math.PI * 2,
      par: 0.003 + ((z + 7) / 7.5) * 0.006,
      baseOpacity,
      q: 0,
    });
  }

  /* ---------------------- Background: falling brand text ---------------- */
  const textures = [
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
    par: number;
    baseOpacity: number;
    q: number;
  }
  const fallers: Faller[] = [];
  for (let i = 0; i < 14; i++) {
    const hollow = i % 2 === 0;
    const z = -11 + Math.random() * 8;
    const depth = (z + 11) / 8; // 0 far .. 1 near
    const baseOpacity = (hollow ? 0.16 : 0.08) * (0.5 + depth * 0.5);
    const mat = new THREE.SpriteMaterial({
      map: textures[(i % 2) + (i % 4 < 2 ? 0 : 2)],
      transparent: true,
      opacity: baseOpacity,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    const w = 2.2 + depth * 2.8;
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
      par: 0.002 + depth * 0.005,
      baseOpacity,
      q: 0,
    });
    sprite.position.set((Math.random() - 0.5) * 26, y, z);
  }

  /* ------------------------------ Dust ---------------------------------- */
  const dustCount = 600;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    dustPos[i * 3 + 2] = -6 + Math.random() * 9;
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
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointer = new THREE.Vector2(0, 0);
  const smooth = new THREE.Vector2(0, 0);
  const mouseWorld = new THREE.Vector3(999, 999, 0);

  const hitsRobot = () => {
    if (!robot.visible) return false;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(robot, true).length > 0;
  };

  let spinT = 1;
  let waveUntil = 3.5;
  let clock = 0;

  const onMove = (e: PointerEvent) => {
    pointer.set((e.clientX / vw) * 2 - 1, -(e.clientY / vh) * 2 + 1);
    root.style.cursor = hitsRobot() ? 'pointer' : '';
  };

  const onDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, article')) return;
    if (!hitsRobot()) return;
    if (spinT >= 1) spinT = 0;
    waveUntil = clock + 2.2;
    for (const f of floaters) {
      const dir = new THREE.Vector3(f.base.x - robot.position.x, f.base.y - robot.position.y, 0).normalize();
      f.vel.addScaledVector(dir, 3 + Math.random() * 3);
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);

  // Elements whose area should stay calm (real text lives here)
  const quietEls = Array.from(root.querySelectorAll<HTMLElement>('[data-quiet]'));
  let quietRects: DOMRect[] = [];
  const quietAt = (px: number, py: number, pad: number) => {
    for (const r of quietRects) {
      if (px > r.left - pad && px < r.right + pad && py > r.top - pad && py < r.bottom + pad) return 1;
    }
    return 0;
  };

  /* ------------------------------ Loop ---------------------------------- */
  const v = new THREE.Vector3();
  const vis: number[] = anchors.map(() => 0);
  const rects: DOMRect[] = [];
  let current = 0;
  let curScale = 0;
  const robotPos = new THREE.Vector3();
  let robotInit = false;
  let scrollS = window.scrollY;
  let prev = performance.now();
  let raf = 0;
  const motion = reduced ? 0 : 1;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - prev) / 1000, 0.05) * motion;
    prev = now;
    clock += dt;
    const t = clock;
    const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-dt * rate));

    smooth.lerp(pointer, k(4));
    scrollS += (window.scrollY - scrollS) * k(6);
    camera.position.set(smooth.x * 0.5, smooth.y * 0.3, 9);
    camera.lookAt(0, 0, 0);

    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    quietRects = quietEls.map((el) => el.getBoundingClientRect());

    /* ---- robot: choose anchor, hop, follow ---- */
    const upp = (2 * halfH) / vh; // world units per pixel at z = 0
    let best = 0;
    anchors.forEach((a, i) => {
      const r = a.getBoundingClientRect();
      rects[i] = r;
      const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      vis[i] = THREE.MathUtils.clamp(overlap / Math.min(Math.max(r.height, 1), vh * 0.6), 0, 1);
      if (vis[i] > vis[best]) best = i;
    });
    if (!robotInit) {
      current = best;
      robotInit = true;
      spinT = 1;
      const r0 = rects[current];
      robotPos.set(
        (((r0.left + r0.right) / 2 / vw) * 2 - 1) * halfW,
        -((((r0.top + r0.bottom) / 2 / vh) * 2 - 1)) * halfH,
        0,
      );
    } else if (best !== current && (vis[current] < 0.05 || vis[best] > vis[current] + 0.2)) {
      current = best;
      curScale = 0;
      spinT = 0;
      waveUntil = clock + 2.4;
      const r1 = rects[current];
      robotPos.set(
        (((r1.left + r1.right) / 2 / vw) * 2 - 1) * halfW,
        -((((r1.top + r1.bottom) / 2 / vh) * 2 - 1)) * halfH,
        0,
      );
    }

    const r = rects[current];
    const tx = (((r.left + r.right) / 2 / vw) * 2 - 1) * halfW;
    const ty = -((((r.top + r.bottom) / 2 / vh) * 2 - 1)) * halfH;
    const fit = Math.min(1, (r.height * upp) / 4.4, (r.width * upp) / 5.6);
    const targetScale = fit * smoothstep(0.05, 0.55, vis[current]);

    robotPos.x += (tx - robotPos.x) * k(6);
    robotPos.y += (ty - robotPos.y) * k(6);
    curScale += (targetScale - curScale) * k(5);

    robot.visible = curScale > 0.01;
    robot.scale.setScalar(Math.max(curScale, 0.0001));
    robot.position.set(robotPos.x, robotPos.y + Math.sin(t * 1.4) * 0.15 * curScale, 0);

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

    /* ---- glow blobs ---- */
    for (const g of glows) {
      g.sprite.position.set(
        g.home.x + Math.sin(t * g.sp + g.ph) * 1.5,
        wrapY(g.home.y + Math.cos(t * g.sp * 0.8 + g.ph) * 1.0 + scrollS * g.par),
        g.home.z,
      );
    }

    /* ---- floating orbs: drift, parallax, dodge cursor, fade over text ---- */
    for (const f of floaters) {
      const dispY = wrapY(f.base.y + scrollS * f.par);
      const dx = f.base.x - mouseWorld.x;
      const dy = dispY - mouseWorld.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2 && dist > 0.001) {
        const push = (1 - dist / 2) * 30;
        f.vel.x += (dx / dist) * push * dt;
        f.vel.y += (dy / dist) * push * dt;
      }
      const hx = f.home.x + Math.sin(t * f.fx + f.ph) * 0.6;
      const hy = f.home.y + Math.cos(t * f.fy + f.ph) * 0.5;
      f.vel.x += (hx - f.base.x) * 2.5 * dt;
      f.vel.y += (hy - f.base.y) * 2.5 * dt;
      f.vel.multiplyScalar(Math.exp(-2.2 * dt));
      f.base.x += f.vel.x * dt;
      f.base.y += f.vel.y * dt;

      f.mesh.position.set(f.base.x, dispY, f.base.z);
      f.mesh.rotation.x += f.spin.x * dt;
      f.mesh.rotation.y += f.spin.y * dt;
      f.mesh.rotation.z += f.spin.z * dt;

      v.copy(f.mesh.position).project(camera);
      const px = (v.x * 0.5 + 0.5) * vw;
      const py = (-v.y * 0.5 + 0.5) * vh;
      f.q += (quietAt(px, py, 50) - f.q) * k(4);
      f.mat.opacity = f.baseOpacity * (1 - 0.88 * f.q);
    }

    /* ---- falling NEXUSAI ---- */
    for (const f of fallers) {
      f.y -= f.speed * dt;
      const disp = wrapY(f.y + scrollS * f.par);
      if (disp - f.prevDisp > 9) f.sprite.position.x = (Math.random() - 0.5) * 26; // wrapped: new lane
      f.prevDisp = disp;
      f.sprite.position.y = disp;
      f.sprite.position.x += Math.sin(t * 0.3 + f.ph) * f.sway * dt;
      f.mat.rotation = f.rot + Math.sin(t * 0.4 + f.ph) * 0.1;

      v.copy(f.sprite.position).project(camera);
      const px = (v.x * 0.5 + 0.5) * vw;
      const py = (-v.y * 0.5 + 0.5) * vh;
      f.q += (quietAt(px, py, 80) - f.q) * k(4);
      f.mat.opacity = f.baseOpacity * (1 - 0.92 * f.q);
    }

    dust.rotation.y = t * 0.015;
    dust.position.x = smooth.x * 0.4;
    dust.position.y = scrollS * 0.0025;

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', layout);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    root.style.cursor = '';

    scene.traverse((obj) => {
      const o = obj as THREE.Mesh | THREE.Points | THREE.Sprite;
      if ('geometry' in o && o.geometry) o.geometry.dispose();
      const m = (o as THREE.Mesh).material;
      if (Array.isArray(m)) m.forEach(disposeMaterial);
      else if (m) disposeMaterial(m);
    });
    textures.forEach((tx) => tx.dispose());
    glowTex.dispose();
    envTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function MarqueeBand({ reverse = false }: { reverse?: boolean }) {
  const row = (copy: number) => (
    <div className="landing-marquee-row" aria-hidden={copy > 0}>
      {marqueeItems.map((item) => (
        <span className="landing-marquee-item" key={item}>
          <BrainCircuit size={26} />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className={`landing-marquee ${reverse ? 'is-reverse' : ''}`}>
      <div className="landing-marquee-track">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}

function TypedPrompt({ reduced }: { reduced: boolean }) {
  const [text, setText] = useState(reduced ? prompts[0] : '');

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    let c = 0;
    let deleting = false;
    let id = 0;
    const step = () => {
      const full = prompts[i];
      if (!deleting) {
        c++;
        setText(full.slice(0, c));
        if (c === full.length) {
          deleting = true;
          id = window.setTimeout(step, 1600);
          return;
        }
        id = window.setTimeout(step, 55);
      } else {
        c--;
        setText(full.slice(0, c));
        if (c === 0) {
          deleting = false;
          i = (i + 1) % prompts.length;
          id = window.setTimeout(step, 350);
          return;
        }
        id = window.setTimeout(step, 22);
      }
    };
    id = window.setTimeout(step, 600);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <span>
      {text}
      <i className="landing-caret" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function LandingPage() {
  const pageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);
  const featuresSlotRef = useRef<HTMLDivElement>(null);
  const ctaSlotRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Three.js scene
  useEffect(() => {
    const root = pageRef.current;
    const canvas = canvasRef.current;
    const anchors = [heroStageRef.current, featuresSlotRef.current, ctaSlotRef.current];
    if (!root || !canvas || anchors.some((a) => !a)) return;

    let dispose: (() => void) | undefined;
    try {
      dispose = createScene(root, canvas, anchors as HTMLElement[], reduced);
    } catch (err) {
      console.warn('Nexus landing: WebGL scene could not start.', err);
    }
    return () => dispose?.();
  }, [reduced]);

  // Reveal on scroll + scroll progress bar
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // "How it works" auto-advances; clicking a step jumps there
  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setActiveStep((s) => (s + 1) % steps.length), 3800);
    return () => window.clearTimeout(id);
  }, [activeStep, reduced]);

  const onHeroMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const onCardMove = (e: ReactMouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 12}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 12}deg`);
    el.style.setProperty('--px', `${px * 100}%`);
    el.style.setProperty('--py', `${py * 100}%`);
  };
  const onCardLeave = (e: ReactMouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <main className="landing-page" ref={pageRef}>
      {/* One fixed 3D layer behind the whole page */}
      <canvas className="landing-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="landing-progress" aria-hidden="true" />

      {/* Navigation */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">
            <BrainCircuit size={23} />
          </span>
          <span>
            NEXUS
            <span className="landing-brand-highlight">AI</span>
          </span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-login-link">
            Log in
          </Link>
          <Link to="/signup" className="landing-nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero: robot on the left, copy on the right */}
      <section className="landing-hero" onMouseMove={onHeroMove}>
        <div className="landing-spotlight" />

        <div className="landing-hero-inner">
          <div className="landing-stage" ref={heroStageRef}>
            <div className="landing-hint">
              <MousePointer2 size={14} />
              Move your cursor. Click the bot.
            </div>
          </div>

          <div className="landing-hero-content" data-quiet>
            <div className="landing-eyebrow">
              <span className="landing-status-dot" />
              Your business, reimagined with AI
            </div>

            <h1>
              Turn your ideas into
              <span className="landing-gradient-text"> real business actions.</span>
            </h1>

            <p className="landing-hero-description">
              Meet your AI-powered business workspace. Build websites, manage customers, organize
              webinars, and understand your business — all from one place.
            </p>

            <div className="landing-hero-actions">
              <Link to="/signup" className="landing-primary-button">
                Start building <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="landing-secondary-button">
                Explore Nexus <span>↓</span>
              </a>
            </div>

            <div className="landing-trust-note">
              <span className="landing-trust-icon">
                <Zap size={15} />
              </span>
              From a simple prompt to a real business workflow.
            </div>
          </div>
        </div>
      </section>

      {/* Crossing marquee bands */}
      <div className="landing-marquee-zone" aria-hidden="true">
        <div className="landing-band landing-band-a">
          <MarqueeBand />
        </div>
        <div className="landing-band landing-band-b">
          <MarqueeBand reverse />
        </div>
      </div>

      {/* Features: the robot hops here and sits beside the heading */}
      <section className="landing-features" id="features">
        <div className="landing-features-head">
          <div className="landing-section-heading" data-reveal data-quiet>
            <span className="landing-section-kicker">Built for builders</span>
            <h2>Everything your business needs.</h2>
            <p>Less switching between tools. More time getting things done.</p>
          </div>
          <div className="landing-robot-slot" ref={featuresSlotRef} aria-hidden="true" />
        </div>

        <div className="landing-feature-grid">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <article
                className="landing-feature-card"
                key={feature.number}
                data-reveal
                style={{ '--d': `${i * 90}ms` } as CSSProperties}
                onMouseMove={onCardMove}
                onMouseLeave={onCardLeave}
              >
                <div className="landing-feature-card-top">
                  <span className="landing-feature-icon">
                    <Icon size={22} />
                  </span>
                  <span className="landing-feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="landing-feature-arrow">
                  <ArrowRight size={18} />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works: auto-advancing, each step shows a live mini demo */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-how-head" data-quiet>
          <span className="landing-section-kicker" data-reveal>
            Simple by design
          </span>
          <h2 data-reveal>Describe it. Build it. Use it.</h2>
        </div>

        <div className="landing-steps">
          <div className="landing-steps-line" aria-hidden="true">
            <span style={{ transform: `scaleX(${(activeStep + 1) / steps.length})` }} />
          </div>

          {steps.map((step, i) => (
            <button
              type="button"
              key={step.n}
              className={`landing-step ${activeStep === i ? 'is-active' : ''}`}
              onClick={() => setActiveStep(i)}
              data-reveal
              style={{ '--d': `${i * 120}ms` } as CSSProperties}
            >
              <span className="landing-step-number">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>

              <div className="landing-step-demo">
                {i === 0 && (
                  <div className="landing-demo-prompt">
                    <span className="landing-demo-chevron">&gt;</span>
                    <TypedPrompt reduced={reduced} />
                  </div>
                )}
                {i === 1 &&
                  reviewRows.map((row, j) => (
                    <div className="landing-demo-row" key={row} style={{ '--i': j } as CSSProperties}>
                      <span className="landing-demo-check">
                        <Check size={12} />
                      </span>
                      {row}
                    </div>
                  ))}
                {i === 2 &&
                  launchRows.map((row, j) => (
                    <div className="landing-demo-row" key={row} style={{ '--i': j } as CSSProperties}>
                      <span className="landing-demo-live" />
                      {row}
                    </div>
                  ))}
              </div>
            </button>
          ))}
        </div>

        {/* The robot hops here and waves above the button */}
        <div className="landing-robot-slot landing-robot-slot-cta" ref={ctaSlotRef} aria-hidden="true" />

        <Link to="/signup" className="landing-primary-button landing-bottom-cta">
          Create your workspace <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-icon">
            <BrainCircuit size={19} />
          </span>
          <span>
            NEXUS
            <span className="landing-brand-highlight">AI</span>
          </span>
        </Link>
        <span>One workspace. More possibilities.</span>
      </footer>
    </main>
  );
}

export default LandingPage;