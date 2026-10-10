import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import {
  Plus, Globe, ExternalLink, Eye, Sparkles, Search, CheckCircle2,
  LayoutTemplate, ArrowUpRight, X, WandSparkles, RefreshCw,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import WebsitePreview from '../components/WebsitePreview';
import '../styles/Websites.css';

type Website = {
  id: string | number;
  name: string;
  domain?: string | null;
  description?: string | null;
  status: 'Published' | 'Draft';
  updatedAt?: string | null;
  updated?: string | null;
  accentColor?: string | null;
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

function InteractiveWebGL() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 100);
    camera.position.z = 14;

    const group = new THREE.Group();
    scene.add(group);

    const nodeCount = 95;
    const positions = new Float32Array(nodeCount * 3);
    const velocities: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.003, (Math.random() - 0.5) * 0.003, 0));
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({ color: 0xb7a2ff, size: 0.055, transparent: true, opacity: 0.78, sizeAttenuation: true })
    );
    group.add(points);

    const linePositions = new Float32Array(nodeCount * nodeCount * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 0x8b76ff, transparent: true, opacity: 0.16 })
    );
    group.add(lines);

    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.35, 2),
      new THREE.MeshBasicMaterial({ color: 0x8066e8, wireframe: true, transparent: true, opacity: 0.2 })
    );
    orb.position.set(4.4, -0.3, -1.5);
    group.add(orb);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    host.addEventListener('pointermove', onPointerMove);

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frame += 0.006;
      orb.rotation.x += 0.0018;
      orb.rotation.y += 0.0025;
      group.rotation.y += (pointer.x * 0.035 - group.rotation.y) * 0.025;
      group.rotation.x += (-pointer.y * 0.025 - group.rotation.x) * 0.025;

      const pos = pointsGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < nodeCount; i++) {
        pos.array[i * 3] += velocities[i].x;
        pos.array[i * 3 + 1] += velocities[i].y;
        if (pos.array[i * 3] > 11) pos.array[i * 3] = -11;
        if (pos.array[i * 3] < -11) pos.array[i * 3] = 11;
        if (pos.array[i * 3 + 1] > 6) pos.array[i * 3 + 1] = -6;
        if (pos.array[i * 3 + 1] < -6) pos.array[i * 3 + 1] = 6;
      }
      pos.needsUpdate = true;

      const current = pos.array as Float32Array;
      const connections: number[] = [];
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = current[i * 3] - current[j * 3];
          const dy = current[i * 3 + 1] - current[j * 3 + 1];
          const dz = current[i * 3 + 2] - current[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < 2.5) {
            connections.push(
              current[i * 3], current[i * 3 + 1], current[i * 3 + 2],
              current[j * 3], current[j * 3 + 1], current[j * 3 + 2]
            );
          }
        }
      }
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.computeBoundingSphere();
      orb.position.y = -0.3 + Math.sin(frame) * 0.18;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!host.isConnected) return;
      camera.aspect = host.clientWidth / Math.max(host.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      pointsGeometry.dispose();
      lineGeometry.dispose();
      points.material.dispose();
      lines.material.dispose();
      orb.geometry.dispose();
      orb.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="websites-scene" ref={hostRef} aria-hidden="true" />;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function Websites() {
  const [searchParams] = useSearchParams();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [search, setSearch] = useState(
    () => searchParams.get('search') ?? ''
  );
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/websites`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Could not load websites (${response.status}).`);
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.websites;
      if (!Array.isArray(items)) throw new Error('The websites API returned an unexpected response.');
      setWebsites(items);
    } catch (err) {
      setError(`${getErrorMessage(err)} Check that your backend has GET /api/websites.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadWebsites(); }, [loadWebsites]);

  const filteredWebsites = websites.filter((website) =>
    `${website.name} ${website.domain ?? ''} ${website.description ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function createWebsite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/websites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), status: 'Draft' }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Could not create website (${response.status}).`);
      }
      const body = await response.json();
      const created = body.website ?? body;
      setWebsites((current) => [created, ...current]);
      setSelectedWebsite(created);
      setShowCreate(false);
      setName('');
      setDescription('');
    } catch (err) {
      setError(`${getErrorMessage(err)} Check that your backend has POST /api/websites.`);
    } finally {
      setSaving(false);
    }
  }

  const publishedCount = websites.filter((website) => website.status === 'Published').length;
  const draftCount = websites.filter((website) => website.status === 'Draft').length;

  return (
    <div className="websites-layout">
      <Sidebar />
      <main className="websites-main">
        <Topbar title="Websites" />

        <section
          className="websites-content"
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
          }}
        >
          <div className="nexus-ambient-layer" aria-hidden="true" />
          <div className="nexus-floating-agent" aria-hidden="true">
            <video autoPlay muted loop playsInline>
              <source src="/videos/nexus-robot.mp4" type="video/mp4" />
            </video>
            <span>NEXUS AI</span>
          </div>
          <div className="websites-ambient">
            <InteractiveWebGL />
            <div className="websites-ambient-shade" />
          </div>

          <div className="websites-heading">
            <div className="websites-heading-copy">
              <div className="websites-eyebrow"><Globe size={14} /> YOUR DIGITAL PRESENCE</div>
              <h2>Websites<span className="websites-heading-dot">.</span></h2>
              <p>Bring your ideas to life. Your websites, all in one place.</p>
            </div>
            <button type="button" className="websites-create-button" onClick={() => setShowCreate(true)}>
              <Plus size={17} /> Create website
            </button>
          </div>

          <div className="websites-stats">
            <div className="websites-stat-card">
              <span className="websites-stat-icon purple"><Globe size={19} /></span>
              <div><p>Total websites</p><h3>{loading ? '—' : websites.length}</h3></div>
            </div>
            <div className="websites-stat-card">
              <span className="websites-stat-icon green"><CheckCircle2 size={19} /></span>
              <div><p>Published</p><h3>{loading ? '—' : publishedCount}</h3></div>
            </div>
            <div className="websites-stat-card">
              <span className="websites-stat-icon orange"><LayoutTemplate size={19} /></span>
              <div><p>Drafts</p><h3>{loading ? '—' : draftCount}</h3></div>
            </div>
          </div>

          <div className="websites-toolbar">
            <div><h3>Your projects</h3><p>Every project starts with an idea.</p></div>
            <label className="websites-search">
              <Search size={16} />
              <input type="search" placeholder="Search your websites..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
          </div>

          {error && (
            <div className="websites-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => void loadWebsites()}><RefreshCw size={14} /> Retry</button>
            </div>
          )}

          {loading ? (
            <div className="websites-state"><span className="websites-loader" /><h3>Gathering your projects</h3><p>Getting your workspace ready…</p></div>
          ) : filteredWebsites.length > 0 ? (
            <div className="websites-grid">
              {filteredWebsites.map((website) => (
                <article className="website-card" key={website.id}>
                  <div className="website-card-preview">
                    <div className="website-browser-bar">
                      <div className="website-browser-dots"><span /><span /><span /></div>
                      <div className="website-browser-address"><Globe size={11} />{website.domain || 'Your domain will appear here'}</div>
                      <span className="website-live-dot" />
                    </div>
                    <div className="website-mini-preview" style={{ '--website-accent': website.accentColor || '#9b83ff' } as React.CSSProperties}>
                      <div className="website-mini-orb" />
                      <div className="website-mini-nav"><span>{website.name}</span><span className="website-mini-menu">☰</span></div>
                      <div className="website-mini-hero">
                        <span className="website-mini-label">MADE FOR YOUR NEXT IDEA</span>
                        <h4>{website.name}</h4>
                        <p>{website.description || 'A new digital experience starts here.'}</p>
                        <span className="website-mini-button">Explore website <ArrowUpRight size={11} /></span>
                      </div>
                      <div className="website-mini-bottom"><span /><span /><span /></div>
                    </div>
                  </div>
                  <div className="website-card-body">
                    <div className="website-card-title-row">
                      <div><h3>{website.name}</h3><p className="website-domain">{website.domain || 'No domain connected'}</p></div>
                      <span className={`website-status ${website.status.toLowerCase()}`}>{website.status}</span>
                    </div>
                    <p className="website-description">{website.description || 'Add a description to tell your story.'}</p>
                    <div className="website-card-footer">
                      <span className="website-updated">{website.updatedAt || website.updated ? `Updated ${new Date(website.updatedAt || website.updated!).toLocaleDateString()}` : 'Recently created'}</span>
                      <div className="website-card-actions">
                        <button type="button" className="website-preview-button" onClick={() => setSelectedWebsite(website)}><Eye size={15} /> Preview</button>
                        {website.domain && website.status === 'Published' && (
                          <a className="website-icon-button" href={website.domain.startsWith('http') ? website.domain : `https://${website.domain}`} target="_blank" rel="noreferrer" aria-label={`Open ${website.name}`}><ExternalLink size={15} /></a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              <button type="button" className="website-add-card" onClick={() => setShowCreate(true)}>
                <span className="website-add-icon"><Plus size={23} /></span>
                <strong>Make something new</strong>
                <span>Start with a name. Shape the rest as you go.</span>
              </button>
            </div>
          ) : (
            <div className="websites-state websites-empty">
              <div className="websites-empty-icon"><WandSparkles size={25} /></div>
              <h3>{search ? 'Nothing matches that search' : 'Your next big idea starts here'}</h3>
              <p>{search ? 'Try another search term.' : 'You have a clean canvas. Create your first website and make it yours.'}</p>
              {!search && <button type="button" className="websites-create-button" onClick={() => setShowCreate(true)}><Plus size={16} /> Create your first website</button>}
            </div>
          )}
        </section>
      </main>

      {showCreate && (
        <div className="websites-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}>
          <form className="websites-create-modal" onSubmit={createWebsite}>
            <div className="websites-modal-header">
              <div><span className="websites-eyebrow"><Sparkles size={13} /> NEW PROJECT</span><h2>Start with an idea.</h2><p>Give your website a name. You can change everything later.</p></div>
              <button type="button" className="website-icon-button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={17} /></button>
            </div>
            <label className="websites-field">Website name<input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. My creative studio" /></label>
            <label className="websites-field">What is it about?<textarea maxLength={300} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A few words about the website (optional)" rows={3} /></label>
            <div className="websites-modal-footer"><button type="button" className="websites-cancel-button" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="websites-create-button" disabled={saving}>{saving ? 'Creating…' : <><Plus size={16} /> Create draft</>}</button></div>
          </form>
        </div>
      )}

      {selectedWebsite && (
        <div className="websites-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedWebsite(null); }}>
          <section className="websites-preview-modal" role="dialog" aria-modal="true" aria-label={`${selectedWebsite.name} preview`}>
            <div className="websites-modal-header">
              <div><span className="websites-eyebrow"><Sparkles size={13} /> LIVE PREVIEW</span><h2>{selectedWebsite.name}</h2></div>
              <button type="button" className="website-icon-button" onClick={() => setSelectedWebsite(null)} aria-label="Close preview"><X size={17} /></button>
            </div>
            <WebsitePreview
              title={selectedWebsite.name}
              description={selectedWebsite.description || 'A new digital experience starts here.'}
              buttonText="Explore website"
              brandName={selectedWebsite.name}
              accentColor={selectedWebsite.accentColor || '#9b83ff'}
            />
            <div className="websites-modal-footer"><span className={`website-status ${selectedWebsite.status.toLowerCase()}`}>{selectedWebsite.status}</span><button type="button" className="websites-create-button" onClick={() => setSelectedWebsite(null)}>Done</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Websites;
