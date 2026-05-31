import React, { useState, useMemo, useEffect, Suspense, lazy, useRef } from 'react'
import GodOfWarExperience from './pages/GodOfWar/GodOfWarExperience'
import { useStore } from './store/useStore'
import { auth } from './config/firebase'
import LoginModal from "./components/LoginModal";
import Toast from "./components/Toast";
import { signOut } from 'firebase/auth'

// --- DATA & ICONS ---
import { THEMES } from './UI_Files/shared/gameData'
import Icons from './UI_Files/shared/Icons'

// --- UI ROUTE VIEWS (LAZY LOADED) ---
const DashboardView = lazy(() => import('./UI_Files/DASHBOARD/DashboardView'))
const GamesView = lazy(() => import('./UI_Files/GAMES/GamesView'))
const AssistantView = lazy(() => import('./UI_Files/ASSISTANT/AssistantView'))
const DocsView = lazy(() => import('./UI_Files/DOCUMENTATION/DocsView'))
const CommunityView = lazy(() => import('./UI_Files/COMMUNITY/CommunityView'))
const SettingsView = lazy(() => import('./UI_Files/SETTINGS/SettingsView'))

const AmbientParticles = React.memo(function AmbientParticles({ theme }) {
  const particles = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i, left: `${Math.random() * 100}%`,
    duration: `${Math.random() * 15 + 10}s`, delay: `${Math.random() * 5}s`,
    size: `${Math.random() * 3 + 1}px`, opacity: Math.random() * 0.5 + 0.1
  })), [])

  return (
    <div className="particles-layer">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left, width: p.size, height: p.size, animationDuration: p.duration,
          animationDelay: p.delay, opacity: p.opacity, background: theme?.particleColor || '#ffffff',
          boxShadow: `0 0 10px ${theme?.particleColor || '#ffffff'}`
        }} />
      ))}
    </div>
  )
})

function BootScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Silently pre-cache background assets for maximum fluidity later
    Object.values(THEMES).forEach(game => {
      if (game.bgPath) { const img = new Image(); img.src = game.bgPath; }
      if (game.logoPath) { const img = new Image(); img.src = game.logoPath; }
    });

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          sessionStorage.setItem('lumina_booted', 'true');
          onComplete();
        }, 500);
      }
      setProgress(Math.min(current, 100));
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#02050a', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00d2ff', fontFamily: 'monospace' }}>
      <div style={{ fontSize: '24px', letterSpacing: '8px', marginBottom: '20px', animation: 'pulseLogo 2s infinite alternate', fontWeight: '900', textShadow: '0 0 20px #00d2ff' }}>
        LUMINA_OS
      </div>
      <div style={{ width: '300px', height: '2px', background: 'rgba(0, 210, 255, 0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: '#00d2ff', transition: 'width 0.1s linear', boxShadow: '0 0 10px #00d2ff' }} />
      </div>
      <div style={{ marginTop: '15px', fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
        INITIALIZING SUBSYSTEMS... {Math.floor(progress)}%
      </div>
      <style>{`@keyframes pulseLogo { 0% { opacity: 0.6; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('HUB')
  const [activeNav, setActiveNavState] = useState(() => sessionStorage.getItem('lumina_activeNav') || 'DASHBOARD') // Handles Top Nav Routing
  const [isBooting, setIsBooting] = useState(() => !sessionStorage.getItem('lumina_booted'))
  const navContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const setActiveNav = (nav) => {
    sessionStorage.setItem('lumina_activeNav', nav);
    setActiveNavState(nav);
  }

  const { user, setUser, activeGameId, gamesData, fetchGameData } = useStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    fetchGameData(activeGameId)
  }, [activeGameId, fetchGameData])

  useEffect(() => {
    if (navContainerRef.current) {
      const activeEl = navContainerRef.current.querySelector('.nav-item.active');
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth
        });
      }
    }
  }, [activeNav]);

  const theme = { ...THEMES[activeGameId], ...gamesData[activeGameId] }
  const isAdmin = !!user

  const handleLogin = () => setShowLoginModal(true)
  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const renderActiveView = () => {
    switch (activeNav) {
      case 'GAMES': return <GamesView setCurrentRoute={setCurrentRoute} />
      case 'ASSISTANT': return <AssistantView />
      case 'DOCUMENTATION': return <DocsView />
      case 'COMMUNITY': return <CommunityView />
      case 'SETTINGS': return <SettingsView />
      default: return null;
    }
  }

  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />
  }

  if (currentRoute === 'HUB') {
    return (
      <div className="lumina-os" style={{
        '--primary': theme.primary,
        '--primary-rgb': theme.primaryRgb,
        '--bg-core': theme.bgCore,
        '--bg-glow': theme.bgGlow,
        '--surface': theme.surface
      }}>
        <AmbientParticles theme={theme} />
        <Toast />

        {/* --- TOP NAVIGATION BAR --- */}
        <nav className="top-nav" style={{ boxShadow: `0 4px 40px rgba(${theme.primaryRgb}, 0.18)` }}>
          {/* Logo with theme-colored animated pulse */}
          <div className="logo" style={{ animation: 'logoPulse 3s ease-in-out infinite alternate' }}>LUMINA_OS</div>

          <div className="nav-links" style={{ position: 'relative' }} ref={navContainerRef}>
            {/* Sliding active indicator pill dynamically matches text width */}
            <div className="nav-slide-indicator" style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              background: `rgba(${theme.primaryRgb}, 0.12)`,
              borderBottom: `2px solid var(--primary)`,
              boxShadow: `0 0 12px rgba(${theme.primaryRgb}, 0.5)`
            }} />
            <span className={`nav-item ${activeNav === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setActiveNav('DASHBOARD')}>{Icons.Dashboard} DASHBOARD</span>
            <span className={`nav-item ${activeNav === 'GAMES' ? 'active' : ''}`} onClick={() => setActiveNav('GAMES')}>{Icons.Games} GAMES</span>
            <span className={`nav-item ${activeNav === 'ASSISTANT' ? 'active' : ''}`} onClick={() => setActiveNav('ASSISTANT')}>{Icons.Assistant} ASSISTANT</span>
            <span className={`nav-item ${activeNav === 'DOCUMENTATION' ? 'active' : ''}`} onClick={() => setActiveNav('DOCUMENTATION')}>{Icons.Docs} DOCUMENTATION</span>
            <span className={`nav-item ${activeNav === 'COMMUNITY' ? 'active' : ''}`} onClick={() => setActiveNav('COMMUNITY')}>{Icons.Community} COMMUNITY</span>
            <span className={`nav-item ${activeNav === 'SETTINGS' ? 'active' : ''}`} onClick={() => setActiveNav('SETTINGS')}>{Icons.Settings} SETTINGS</span>
          </div>
          <div className="nav-empty-spacer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            {isAdmin ? (
              <button className="btn outline" onClick={handleLogout}>LOGOUT</button>
            ) : (
              <button className="btn solid" onClick={handleLogin}>ADMIN LOGIN</button>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Persistent Dashboard Layer (WebGL Canvas stays alive but sleeps when hidden) */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: activeNav === 'DASHBOARD' ? 1 : 0,
            pointerEvents: activeNav === 'DASHBOARD' ? 'auto' : 'none',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1
          }}>
            <Suspense fallback={null}>
              <DashboardView isActive={activeNav === 'DASHBOARD'} />
            </Suspense>
          </div>

          {/* Dynamic Route Injection for other modules */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: activeNav === 'DASHBOARD' ? 'none' : 'flex', flexDirection: 'column' }}>
            <Suspense fallback={
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', letterSpacing: '4px', fontSize: '12px' }}>
                <span className="pulse-text" style={{ animation: 'pulseLogo 1.5s infinite alternate' }}>INITIALIZING MODULE...</span>
              </div>
            }>
              {renderActiveView()}
            </Suspense>
          </div>

        </div>

        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

        {/* --- GLOBAL CSS STYLESHEET --- */}
        <style>{`
          :root { --text-main: #ffffff; --text-muted: #8b99a6; --border-light: rgba(255, 255, 255, 0.08); --font-sans: 'Inter', system-ui, sans-serif; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .lumina-os { width: 100vw; height: 100vh; background: radial-gradient(circle at 50% -10%, var(--bg-glow) 0%, var(--bg-core) 60%); color: var(--text-main); font-family: var(--font-sans); display: flex; flex-direction: column; overflow: hidden; transition: background 0.8s ease; }
          .particles-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
          .particle { position: absolute; bottom: -20px; border-radius: 50%; animation: floatUp linear infinite; filter: blur(2px); }
          @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: var(--opacity); } 80% { opacity: var(--opacity); } 100% { transform: translateY(-100vh); opacity: 0; } }
          .top-nav { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; height: 64px; background: rgba(0, 0, 0, 0.4); border-bottom: 1px solid var(--border-light); backdrop-filter: blur(20px); transition: box-shadow 0.8s ease; }
          .logo { font-size: 16px; font-weight: 900; letter-spacing: 3px; color: var(--primary); text-shadow: 0 0 15px rgba(var(--primary-rgb),0.6); flex: 1; }
          @keyframes logoPulse { 0% { text-shadow: 0 0 15px rgba(var(--primary-rgb),0.6); } 100% { text-shadow: 0 0 30px rgba(var(--primary-rgb),1), 0 0 60px rgba(var(--primary-rgb),0.4); } }
          .nav-links { display: flex; gap: 35px; justify-content: center; flex: 2; position: relative; }
          .nav-slide-indicator { position: absolute; bottom: 0; height: 100%; border-radius: 0; transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease; pointer-events: none; z-index: 0; }
          .nav-empty-spacer { flex: 1; } 
          .nav-item { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: var(--text-muted); cursor: pointer; height: 64px; border-bottom: 2px solid transparent; transition: color 0.3s; padding: 0 10px; }
          .nav-item:hover { color: var(--text-main); }
          .nav-item.active { color: var(--primary); }
          .scroll-container { flex: 1; overflow-y: auto; overflow-x: hidden; position: relative; z-index: 5; }
          .scroll-container::-webkit-scrollbar { width: 8px; }
          .scroll-container::-webkit-scrollbar-track { background: transparent; }
          .scroll-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          .content-bounds { max-width: 1700px; margin: 0 auto; padding: 30px 40px 80px 40px; display: flex; flex-direction: column; gap: 20px; }
          
          /* --- HERO CAROUSEL UPDATES --- */
          /* Simply delete the border-bottom property from this line */
          .hero-carousel { min-height: 400px; display: flex; align-items: center; justify-content: space-between; padding: 40px 20px; position: relative; overflow: hidden; }
          .carousel-arrow { font-size: 30px; color: var(--primary); cursor: pointer; opacity: 0.5; transition: 0.3s; z-index: 10; }
          .carousel-arrow:hover { opacity: 1; transform: scale(1.2); }
          .games-track { display: flex; align-items: center; justify-content: center; width: 100%; }
          .game-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex-shrink: 0; }
          .game-card.side { width: 14%; opacity: 0.5; transition: opacity 0.3s ease, transform 0.3s ease; cursor: pointer; filter: grayscale(50%); }
          .game-card.side:hover { opacity: 1; transform: scale(1.05); filter: grayscale(0%); }
          
          /* --- CENTER CARD (Removed Glassmorphism) --- */
          .game-card.center { width: 35%; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; padding: 20px; border: none; box-shadow: none; z-index: 2; transform: scale(1); }
          
          /* --- LOGO LEGIBILITY UPDATES --- */
          .game-logo-img { width: 100%; max-width: 150px; max-height: 80px; object-fit: contain; filter: drop-shadow(0px 10px 10px rgba(0,0,0,0.9)); transition: transform 0.3s ease; }
          .center-game-logo { width: 100%; max-width: 380px; max-height: 160px; object-fit: contain; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(var(--primary-rgb), 0.5)); animation: pulseLogo 4s infinite alternate; }
          @keyframes pulseLogo { 0% { transform: scale(1); } 100% { transform: scale(1.03); } }
          
          /* --- MOCK LOGO UPDATES --- */
          .mock-logo { background: rgba(10, 15, 25, 0.85); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 15px 10px; border-radius: 12px; font-size: 16px; font-weight: 800; text-align: center; color: #ffffff; width: 100%; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; min-height: 80px; line-height: 1.2; }
          .mock-sub { color: #ffffff; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; font-size: 10px; letter-spacing: 1px; margin-top: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
          
          .text-cyan { color: #00d2ff; } .text-purple { color: #b052ff; } .text-red { color: #ff3333; } .text-blue { color: #5288ff; }
          .cinematic-logo { font-size: 65px; font-weight: 900; letter-spacing: 5px; text-align: center; margin-bottom: 15px; color: #fff; }
          .gow-logo { text-shadow: 0 0 30px rgba(0, 210, 255, 0.8), 0 10px 20px #000; }
          .ac-logo { text-shadow: 0 0 30px rgba(255, 42, 42, 0.8), 0 10px 20px #000; }
          
          /* Tagline text shadow for readability */
          .center-tagline { font-size: 13px; letter-spacing: 5px; font-weight: 900; color: var(--primary); text-align: center; margin-top: 20px; margin-bottom: 25px; text-shadow: 0 2px 4px rgba(0,0,0,1), 0 0 15px rgba(var(--primary-rgb), 1), 0 0 30px rgba(var(--primary-rgb), 0.8); }
          .pagination { display: flex; gap: 8px; justify-content: center; }
          .pagination span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); cursor: pointer; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.8); }
          .pagination span.active { background: var(--primary); box-shadow: 0 0 10px var(--primary); transform: scale(1.3); }
          
          /* --- DASHBOARD STYLES --- */
          .dash-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 20px 30px; background: var(--surface); border: 1px solid var(--border-light); border-radius: 12px 12px 0 0; border-bottom: none; backdrop-filter: blur(10px); }
          .header-left { display: flex; gap: 20px; align-items: flex-start; }
          .back-arrow { font-size: 20px; color: var(--text-muted); cursor: pointer; margin-top: 5px; }
          .sup-title { font-size: 9px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 5px; }
          .dash-header h1 { font-size: 20px; font-weight: 600; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; }
          .header-right { display: flex; gap: 15px; align-items: center;}
          .btn { padding: 10px 20px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 1px; cursor: pointer; transition: 0.3s; font-family: var(--font-sans); }
          .btn.outline { background: transparent; border: 1px solid var(--border-light); color: var(--text-muted); }
          .btn.outline:hover { background: rgba(255,255,255,0.05); color: white; }
          .btn.solid { background: rgba(var(--primary-rgb), 0.1); border: 1px solid var(--primary); color: var(--primary); box-shadow: inset 0 0 10px rgba(var(--primary-rgb), 0.2); }
          .btn.solid:hover { background: rgba(var(--primary-rgb), 0.2); box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.4); }
          .dash-grid { display: grid; grid-template-columns: 220px 240px minmax(300px, 1.2fr) minmax(300px, 1fr) 280px; gap: 0; background: var(--surface); border: 1px solid var(--border-light); border-radius: 0 0 12px 12px; backdrop-filter: blur(10px); min-height: 550px; align-items: stretch; }
          .grid-col { padding: 30px; border-right: 1px solid var(--border-light); display: flex; flex-direction: column; }
          .grid-col:last-child { border-right: none; }
          .tab-span { grid-column: span 4; }
          .tab-fade { animation: cinematicFadeIn 0.4s ease-out forwards; opacity: 0; transform: translateY(10px); }
          @keyframes cinematicFadeIn { to { opacity: 1; transform: translateY(0); } }
          .panel-title { font-size: 11px; font-weight: 600; letter-spacing: 1px; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
          .panel-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 25px; line-height: 1.5; background: transparent; border: none; width: 100%; resize: none; }
          .sidebar { padding: 30px 0; gap: 4px; }
          .side-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 30px; font-size: 10px; font-weight: 600; letter-spacing: 1px; color: var(--text-muted); cursor: pointer; transition: 0.3s; border-left: 2px solid transparent; }
          .side-nav-item:hover { color: white; background: rgba(255,255,255,0.02); }
          .side-nav-item.active { color: white; background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 0%, transparent 100%); border-left-color: var(--primary); }
          .active-icon { color: var(--primary); }
          .empty-circle { font-size: 14px; opacity: 0.5; }
          .game-resources { margin-top: auto; padding: 20px 30px 0 30px; font-size: 10px; font-weight: 600; letter-spacing: 1px; color: var(--primary); display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
          .icon-list { list-style: none; display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px; }
          .icon-list li { display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--text-main); letter-spacing: 0.5px; }
          .icon-list.small li { font-size: 10px; color: var(--text-muted); }
          .hex-icon { color: var(--primary); opacity: 0.8; }
          .status-box { background: rgba(0,0,0,0.4); border: 1px solid var(--border-light); border-radius: 8px; padding: 20px; }
          .status-header { font-size: 10px; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 10px; }
          .status-val { font-size: 12px; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; }
          .info-icon { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--primary); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 10px; }
          .input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
          .input-group.half { width: 48%; margin-bottom: 0; }
          .input-group.third { width: 31%; margin-bottom: 0; }
          .label-row { display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px; }
          .label-row span { opacity: 0.5; font-weight: 400; }
          input, textarea, select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border-light); border-radius: 6px; padding: 12px 15px; color: white; font-family: var(--font-sans); font-size: 12px; transition: 0.3s; outline: none; }
          input:focus:not(:disabled), textarea:focus:not(:disabled) { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
          input:disabled, textarea:disabled, select:disabled { background: transparent !important; border-color: transparent !important; opacity: 1 !important; cursor: default !important; padding-left: 0 !important; padding-right: 0 !important; padding-top: 5px !important; color: white !important; box-shadow: none !important; resize: none; }
          .form-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .checkboxes { display: flex; gap: 12px; padding-top: 10px; flex-wrap: wrap; }
          .checkboxes label { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted); transition: 0.3s; }
          .checkboxes label.active { color: white; }
          .cb-box { width: 14px; height: 14px; border: 1px solid var(--border-light); border-radius: 3px; display: flex; align-items: center; justify-content: center; }
          .checkboxes label.active .cb-box { background: var(--primary); border-color: var(--primary); color: #000; }
          .admin-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: var(--primary); opacity: 0; transition: 0.3s; backdrop-filter: blur(2px); cursor: pointer; border: 1px dashed var(--primary); }
          .media-placeholder:hover .admin-overlay { opacity: 1; }
          .summary-card { padding: 20px 0; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); margin-bottom: 20px; }
          .sum-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 12px; }
          .sum-row span:first-child { color: var(--text-muted); letter-spacing: 1px; }
          .sum-row span:last-child { color: white; text-align: right; }
          .world-card { margin-bottom: 20px; }
          .test-play-footer { background: rgba(0,0,0,0.5); border: 1px solid var(--border-light); border-radius: 12px; padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(10px); margin-top: 10px; }
          .footer-left { display: flex; align-items: center; gap: 15px; }
          .step-badge { width: 24px; height: 24px; border-radius: 50%; background: rgba(var(--primary-rgb),0.1); border: 1px solid var(--primary); color: var(--primary); display: flex; align-items: center; justify-content: center; }
          .step-text { font-size: 12px; font-weight: 600; letter-spacing: 1px; }
          .footer-center { flex: 1; margin: 0 50px; }
          .test-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
          .test-badges { display: flex; gap: 25px; font-size: 10px; color: var(--text-muted); }
          .b-icon { color: var(--primary); font-size: 12px; margin-right: 4px; }
          .footer-right { position: relative; }
          .btn-massive-play { background: linear-gradient(90deg, rgba(var(--primary-rgb), 0.15) 0%, transparent 100%); border: 1px solid var(--primary); padding: 18px 45px; border-radius: 8px; color: white; display: flex; flex-direction: column; align-items: center; gap: 6px; box-shadow: inset 0 0 20px rgba(var(--primary-rgb), 0.2), 0 0 20px rgba(var(--primary-rgb), 0.1); transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; position: relative; z-index: 2; }
          .btn-massive-play:hover { transform: scale(1.05); border-color: #fff; box-shadow: inset 0 0 30px rgba(var(--primary-rgb), 0.4), 0 0 40px rgba(var(--primary-rgb), 0.3); }
          .play-text { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; letter-spacing: 2px; }
          .play-ico { color: var(--primary); display: flex; }
          .play-sub { font-size: 9px; font-weight: 400; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
          .decorative-arrow { position: absolute; right: -40px; bottom: -10px; opacity: 0.6; pointer-events: none; }
          .media-placeholder { background: rgba(0,0,0,0.5); border: 1px dashed var(--border-light); border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .media-placeholder.large { height: 180px; }
          .media-placeholder.cinematic-hero { height: 350px; background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop') center/cover; }
          .play-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 1px solid var(--primary); color: var(--primary); display: flex; align-items: center; justify-content: center; padding-left: 2px; transition: 0.3s; z-index: 2; cursor: pointer; }
          .media-placeholder:hover .play-btn { background: var(--primary); color: #000; box-shadow: 0 0 20px var(--primary); transform: scale(1.1); }
          /* --- UPGRADED LOGO PARTICLE EMITTER --- */
          .logo-emitter { position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; transform: translate(-50%, -50%); pointer-events: none; z-index: -1; }
          
          /* Ambient breathing glow directly behind the logo */
          .logo-core-glow {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 250px; height: 100px;
            background: radial-gradient(ellipse, rgba(var(--primary-rgb), 0.4) 0%, transparent 70%);
            animation: breathe 4s ease-in-out infinite alternate;
            filter: blur(20px);
          }

          /* The individual drifting embers */
          .logo-particle { 
            position: absolute; top: 50%; left: 50%; 
            width: var(--size); height: var(--size); 
            background: var(--primary); border-radius: 50%; 
            box-shadow: 0 0 10px var(--primary), 0 0 20px rgba(255,255,255,0.5); 
            animation: emitCinematic var(--duration, 4s) infinite cubic-bezier(0.25, 0.8, 0.25, 1); 
            opacity: 0; 
            filter: blur(var(--blur)); /* Creates the fake 3D camera focus effect */
            mix-blend-mode: screen;
          }

          /* Upward drift with a flicker effect */
          @keyframes emitCinematic {
            0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
            20% { opacity: 0.8; }
            50% { 
              opacity: 1; 
              /* Drifts slightly upward on the Y axis (-30px) as it expands */
              transform: translate(calc(-50% + (var(--dx) * 0.6)), calc(-50% + (var(--dy) * 0.6) - 30px)) scale(1.2); 
            }
            80% { opacity: 0.5; }
            100% { 
              /* Continues drifting upward as it dies out */
              transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) - 80px)) scale(0); 
              opacity: 0; 
            }
          }

          @keyframes breathe {
            0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          }
        `}</style>
      </div>
    )
  }

  // Handoff to 3D Experience unchanged
  if (currentRoute === 'PLAYING_GOW') return <GodOfWarExperience onExit={() => setCurrentRoute('HUB')} />

  return null
}