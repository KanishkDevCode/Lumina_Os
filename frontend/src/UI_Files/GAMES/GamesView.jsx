import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/useStore'
import Icons from '../shared/Icons'
import { CAROUSEL_GAMES, THEMES } from '../shared/gameData'

export default function GamesView({ setCurrentRoute }) {
  const [activeTab, setActiveTab] = useState('01. BASIC INFORMATION')

  // --- VIEWING STATES ---
  const [activeGalleryImg, setActiveGalleryImg] = useState(null)
  const [playingVideo, setPlayingVideo] = useState(null)

  // --- DRAG TO SWIPE STATE ---
  const [dragStartX, setDragStartX] = useState(null)
  const [dragOffset, setDragOffset] = useState(0) // Tracks real-time mouse movement
  const [isDragging, setIsDragging] = useState(false)
  const dragThreshold = 75 // Pixels required to trigger a slide

  // --- CLOUDINARY UPLOAD STATE ---
  const [isUploading, setIsUploading] = useState(false)

  const {
    user, activeGameId, setActiveGameId,
    gamesData, fetchGameData, updateGameField, saveGameToCloud
  } = useStore()

  const theme = { ...THEMES[activeGameId], ...gamesData[activeGameId] }
  const isAdmin = !!user

  // --- YOUTUBE HELPER ---
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // --- CAROUSEL LOGIC ---
  const activeIndex = CAROUSEL_GAMES.findIndex(g => g.id === activeGameId)
  const activeCarouselData = CAROUSEL_GAMES[activeIndex]

  const getGame = (offset) => {
    let index = (activeIndex + offset) % CAROUSEL_GAMES.length
    if (index < 0) index += CAROUSEL_GAMES.length
    return CAROUSEL_GAMES[index]
  }

  const leftGames = [getGame(-2), getGame(-1)]
  const rightGames = [getGame(1), getGame(2)]

  // Navigation Helpers
  const handleNextGame = () => {
    const next = getGame(1)
    if (THEMES[next.id]) setActiveGameId(next.id)
  }

  const handlePrevGame = () => {
    const prev = getGame(-1)
    if (THEMES[prev.id]) setActiveGameId(prev.id)
  }

  // Pointer Events for 60fps Dragging
  const handlePointerDown = (e) => {
    setDragStartX(e.clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    setDragOffset(e.clientX - dragStartX) // Move track with mouse
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return

    if (dragOffset > dragThreshold) {
      handlePrevGame() // Swiped right
    } else if (dragOffset < -dragThreshold) {
      handleNextGame() // Swiped left
    }

    setIsDragging(false)
    setDragOffset(0) // Smoothly snap back to center
  }

  const SIDEBAR_NAV_ITEMS = [
    '01. BASIC INFORMATION', '02. GAME SETTINGS', '03. GAMEPLAY',
    '04. VISUALS', '05. WORLD & LORE', '06. WEAPONS', '07. ABILITIES', '08. PUBLISH & REVIEW'
  ]

  const handleSettingChange = (key, val) => {
    updateGameField(activeGameId, 'settings', { ...theme.settings, [key]: val })
  }

  // --- UPLOAD HANDLER ---
  const handleMediaUpload = async (field, index = null, subField = null) => {
    if (!isAdmin) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setIsUploading(true);
        useStore.getState().showToast('Uploading media to Cloudinary...', 'success');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'lumina_uploads');

        const response = await fetch('https://api.cloudinary.com/v1_1/dae4eteqc/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const url = data.secure_url;

        if (index !== null) {
          const arr = theme[field] ? [...theme[field]] : [];
          if (subField) {
            arr[index] = { ...arr[index], [subField]: url };
          } else {
            arr[index] = url;
          }
          updateGameField(activeGameId, field, arr);

          if (field === 'basicThumbs') setActiveGalleryImg(url);

        } else {
          updateGameField(activeGameId, field, url);
          if (field === 'mainGallery') setActiveGalleryImg(url);
        }

        useStore.getState().showToast('Upload Complete!', 'success');
      } catch (error) {
        console.error('Upload failed:', error);
        useStore.getState().showToast('Upload failed: ' + error.message, 'error');
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  // --- REMOVE MEDIA HANDLER ---
  const handleRemoveMedia = (field, index = null, subField = null) => {
    if (!isAdmin) return;

    if (index !== null) {
      const arr = theme[field] ? [...theme[field]] : [];
      if (subField) {
        arr[index] = { ...arr[index], [subField]: null };
      } else {
        arr[index] = null;
      }
      updateGameField(activeGameId, field, arr);
    } else {
      updateGameField(activeGameId, field, null);
    }
  };

  // --- REUSABLE DELETE BUTTON ---
  const renderRemoveBtn = (field, index = null, subField = null) => {
    if (!isAdmin) return null;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveMedia(field, index, subField);
        }}
        style={{
          position: 'absolute', top: '10px', right: '10px', width: '26px', height: '26px',
          background: 'rgba(255, 50, 50, 0.9)', color: 'white', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 20, fontSize: '14px', fontWeight: 'bold',
          border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Remove Media"
      >
        ✕
      </div>
    );
  };

  const publishData = theme.publishData || {
    progress: 78,
    phases: [
      { name: 'Core Gameplay', done: true },
      { name: 'World Building', done: true },
      { name: 'Storyline', done: true },
      { name: 'Visuals & Audio', done: false },
      { name: 'Polishing', done: false }
    ],
    updates: [
      { version: 'v0.3.2 (Alpha)', date: '2 days ago', desc: 'New realm exploration, boss AI improvements and combat balancing.' },
      { version: 'v0.3.1 (Alpha)', date: '1 week ago', desc: 'Added new abilities, upgraded visuals and fixed major issues.' },
      { version: 'v0.3.0 (Alpha)', date: '2 weeks ago', desc: 'First playable build with main storyline and core mechanics.' }
    ],
    testing: [
      { name: 'Gameplay Testing', status: 'In Progress', icon: '✓', color: '#00ff88' },
      { name: 'Bug Fixing', status: 'In Progress', icon: '⚡', color: '#ffcc00' },
      { name: 'Performance Testing', status: 'In Progress', icon: '⟳', color: '#00ff88' },
      { name: 'Compatibility Testing', status: 'Pending', icon: '⏱', color: '#888' }
    ],
    issues: [
      'Minor texture pop-in on low-end devices',
      'Occasional AI pathfinding issues in caves',
      'Menu animation glitch on resolution change.'
    ],
    roadmap: [
      { milestone: 'Beta Release', date: 'Q3 2024' },
      { milestone: 'Full Release', date: 'Q4 2024' },
      { milestone: 'New Game+', date: 'Q1 2025' },
      { milestone: 'Expansions', date: 'Q2 2025' }
    ]
  };

  const handlePublishChange = (key, value) => {
    updateGameField(activeGameId, 'publishData', { ...publishData, [key]: value });
  };

  const adminInputStyle = {
    background: isAdmin ? 'rgba(255,255,255,0.05)' : 'transparent',
    border: isAdmin ? '1px dashed rgba(255,255,255,0.2)' : 'none',
    padding: isAdmin ? '4px 8px' : '0',
    borderRadius: '4px'
  };

  return (
    <>
      <main className="scroll-container">
        <div className="content-bounds">

          {/* --- CAROUSEL SECTION --- */}
          <section
            className="hero-carousel"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              // Change the second linear-gradient to end in rgba(0,0,0,1)
              backgroundImage: activeCarouselData?.heroBg
                ? `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.9) 100%),
                   linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,1) 100%), 
                   url(${activeCarouselData.heroBg})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 0.6s ease-in-out',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            <div className="carousel-arrow" onClick={(e) => { e.stopPropagation(); handlePrevGame(); }}>‹</div>

            <div
              className="games-track"
              style={{
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4%', // Mathematically spaces the items
                width: '100%',
                // 60fps Physical Drag & Smooth Snap!
                transform: `translateX(${dragOffset}px)`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >

              {leftGames.map((game, i) => (
                <div key={`left-${i}`} className="game-card side" style={{ pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); THEMES[game.id] && setActiveGameId(game.id) }}>
                  {game.logoImg ? (
                    <img src={game.logoImg} alt={game.id} className="game-logo-img" draggable="false" style={{ maxWidth: ['RDR', 'HL', 'HITMAN'].includes(game.id) ? '220px' : '150px', maxHeight: ['RDR', 'HL', 'HITMAN'].includes(game.id) ? '120px' : '80px' }} />
                  ) : (
                    <div className={`mock-logo ${game.color}`}>{game.titleLines[0]}<br />{game.titleLines[1]}</div>
                  )}
                  <div className="mock-sub">{game.sub}</div>
                </div>
              ))}

              <div className="game-card center" style={{ position: 'relative' }}>

                {/* UPGRADED: Cinematic Particle Emitter */}
                <div className="logo-emitter">
                  {[...Array(25)].map((_, i) => ( // Increased count to 25 for better density
                    <div
                      key={i}
                      className="logo-particle"
                      style={{
                        '--dx': `${(Math.random() - 0.5) * 400}px`, // Wider spread
                        '--dy': `${(Math.random() - 0.5) * 300}px`, // Taller spread
                        '--size': `${Math.random() * 5 + 2}px`,     // Random sizes between 2px and 7px
                        '--blur': `${Math.random() * 3}px`,         // Fake 3D depth of field
                        animationDelay: `${Math.random() * 4}s`,    // Staggered start times
                        animationDuration: `${3 + Math.random() * 3}s` // Random lifespans (3s to 6s)
                      }}
                    />
                  ))}

                  {/* NEW: Ambient Core Glow */}
                  <div className="logo-core-glow" />
                </div>

                {/* Active Center Game Logo (Your existing code) */}
                {activeCarouselData?.logoImg ? (
                  <img src={activeCarouselData.logoImg} alt={theme.title} className="center-game-logo" draggable="false" style={{ maxWidth: ['RDR', 'HL', 'HITMAN'].includes(activeCarouselData.id) ? '550px' : '380px', maxHeight: ['RDR', 'HL', 'HITMAN'].includes(activeCarouselData.id) ? '220px' : '160px' }} />
                ) : (
                  <div className={`cinematic-logo ${activeGameId.toLowerCase()}-logo`}>
                    {theme.title}
                  </div>
                )}

                <div className="center-tagline" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{theme.tagline}</div>
                <div className="pagination" style={{ pointerEvents: 'auto' }}>
                  {CAROUSEL_GAMES.map(g => (
                    <span
                      key={g.id}
                      className={activeGameId === g.id ? 'active' : ''}
                      onClick={(e) => { e.stopPropagation(); THEMES[g.id] && setActiveGameId(g.id) }}
                    />
                  ))}
                </div>
              </div>

              {rightGames.map((game, i) => (
                <div key={`right-${i}`} className="game-card side" style={{ pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); THEMES[game.id] && setActiveGameId(game.id) }}>
                  {game.logoImg ? (
                    <img src={game.logoImg} alt={game.id} className="game-logo-img" draggable="false" style={{ maxWidth: ['RDR', 'HL', 'HITMAN'].includes(game.id) ? '220px' : '150px', maxHeight: ['RDR', 'HL', 'HITMAN'].includes(game.id) ? '120px' : '80px' }} />
                  ) : (
                    <div className={`mock-logo ${game.color}`}>{game.titleLines[0]}<br />{game.titleLines[1]}</div>
                  )}
                  <div className="mock-sub">{game.sub}</div>
                </div>
              ))}
            </div>

            <div className="carousel-arrow" onClick={(e) => { e.stopPropagation(); handleNextGame(); }}>›</div>
          </section>

          {/* --- DASHBOARD HEADER --- */}
          <div className="dash-header">
            <div className="header-left">
              <span className="back-arrow">←</span>
              <div>
                <div className="sup-title">CREATE GAME</div>
                <h1>{theme.title}</h1>
              </div>
            </div>
            <div className="header-right">
              {isAdmin && (
                <>
                  <button className="btn outline" onClick={() => fetchGameData(activeGameId)}>DISCARD CHANGES</button>
                  <button className="btn solid" onClick={() => saveGameToCloud(activeGameId)}>SAVE DRAFT</button>
                </>
              )}
            </div>
          </div>

          {/* --- DASHBOARD GRID --- */}
          <section className="dash-grid">

            <div className="grid-col sidebar">
              {SIDEBAR_NAV_ITEMS.map((item) => (
                <div key={item} className={`side-nav-item ${activeTab === item ? 'active' : ''}`} onClick={() => setActiveTab(item)}>
                  {activeTab === item ? <span className="active-icon">{Icons.Hexagon}</span> : <span className="empty-circle">○</span>} {item}
                </div>
              ))}
              <div className="game-resources">
                GAME RESOURCES <span className="dl-icon">{Icons.Download}</span>
              </div>
            </div>

            {/* TAB 01: BASIC INFO */}
            {activeTab === '01. BASIC INFORMATION' && (
              <>
                <div className="grid-col overview-col tab-fade">
                  <h3 className="panel-title">GAME OVERVIEW</h3>
                  <textarea className="panel-desc" value={theme.overview || ''} onChange={(e) => updateGameField(activeGameId, 'overview', e.target.value)} disabled={!isAdmin} rows="6" />
                  <ul className="icon-list">
                    {theme.overviewIcons?.map(icon => <li key={icon}><span className="hex-icon">{Icons.Hexagon}</span> {icon}</li>)}
                  </ul>
                  <div className="status-box">
                    <div className="status-header">GAME STATUS</div>
                    <div className="status-val"><span className="info-icon">!</span>
                      <input type="text" value={theme.status || ''} onChange={(e) => updateGameField(activeGameId, 'status', e.target.value)} disabled={!isAdmin} style={{ fontSize: '12px', padding: 0, fontWeight: 'bold' }} />
                    </div>
                    <div className="status-chart">{Icons.Chart}</div>
                  </div>
                </div>

                <div className="grid-col form-col tab-fade" style={{ animationDelay: '0.05s' }}>
                  <h3 className="panel-title">BASIC INFORMATION</h3>

                  <div className="input-group">
                    <div className="label-row"><label>GAME TITLE</label><span>{theme.title?.length || 0} / 60</span></div>
                    <input type="text" value={theme.title || ''} onChange={(e) => updateGameField(activeGameId, 'title', e.target.value)} disabled={!isAdmin} />
                  </div>

                  <div className="input-group">
                    <div className="label-row"><label>TAGLINE</label><span>{theme.tagline?.length || 0} / 100</span></div>
                    <input type="text" value={theme.tagline || ''} onChange={(e) => updateGameField(activeGameId, 'tagline', e.target.value)} disabled={!isAdmin} />
                  </div>

                  <div className="input-group">
                    <div className="label-row"><label>DESCRIPTION</label><span>{theme.description?.length || 0} / 500</span></div>
                    <textarea rows="4" value={theme.description || ''} onChange={(e) => updateGameField(activeGameId, 'description', e.target.value)} disabled={!isAdmin} />
                  </div>

                  <div className="form-row">
                    <div className="input-group half">
                      <div className="label-row"><label>GENRE</label></div>
                      <input type="text" value={theme.genre || ''} onChange={(e) => updateGameField(activeGameId, 'genre', e.target.value)} disabled={!isAdmin} />
                    </div>
                    <div className="input-group half">
                      <div className="label-row"><label>PLATFORM</label></div>
                      <div className="checkboxes">
                        {['Web', 'PC', 'Console', 'Mobile'].map(plat => {
                          const isChecked = (theme.platforms || []).includes(plat);
                          return (
                            <label key={plat} className={isChecked ? 'active' : ''} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
                              <div className="cb-box" onClick={() => isAdmin && updateGameField(activeGameId, 'platforms', isChecked ? theme.platforms.filter(p => p !== plat) : [...theme.platforms, plat])}>
                                {isChecked && Icons.Check}
                              </div> {plat}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group third">
                      <div className="label-row"><label>RELEASE DATE</label></div>
                      <input type="text" value={theme.releaseDate || ''} onChange={(e) => updateGameField(activeGameId, 'releaseDate', e.target.value)} disabled={!isAdmin} />
                    </div>
                    <div className="input-group third">
                      <div className="label-row"><label>DEVELOPER</label></div>
                      <input type="text" value={theme.developer || ''} onChange={(e) => updateGameField(activeGameId, 'developer', e.target.value)} disabled={!isAdmin} />
                    </div>
                    <div className="input-group third">
                      <div className="label-row"><label>GAME MODE</label></div>
                      <input type="text" value={theme.gameMode || ''} onChange={(e) => updateGameField(activeGameId, 'gameMode', e.target.value)} disabled={!isAdmin} />
                    </div>
                  </div>
                </div>

                <div className="grid-col tab-fade" style={{ gridColumn: 'span 2', animationDelay: '0.1s', display: 'flex', flexDirection: 'column' }}>
                  <h3 className="panel-title">MAIN GAME COVER</h3>
                  <p className="panel-desc">Primary promotional artwork</p>

                  <div
                    className="media-placeholder"
                    style={{
                      flex: 1, width: '100%', minHeight: '350px', cursor: theme.mainCover ? 'pointer' : 'default',
                      backgroundImage: theme.mainCover ? `url(${theme.mainCover})` : 'none',
                      backgroundPosition: 'center', backgroundSize: 'cover',
                      borderRadius: '8px'
                    }}
                    onClick={() => { if (theme.mainCover) setActiveGalleryImg(theme.mainCover) }}
                  >
                    {!theme.mainCover && <span style={{ opacity: 0.5 }}>NO COVER UPLOADED</span>}
                    {isAdmin && (
                      <div className="admin-overlay" style={{ zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('mainCover'); }}>
                        {theme.mainCover ? 'CHANGE COVER' : 'UPLOAD COVER'}
                      </div>
                    )}
                    {theme.mainCover && renderRemoveBtn('mainCover')}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <div className="summary-card" style={{ flex: 1, margin: 0, padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <h3 className="panel-title">GAME SUMMARY</h3>
                      <div className="sum-row" style={{ marginBottom: '5px' }}><span>TITLE</span> <span>{theme.title}</span></div>
                      <div className="sum-row" style={{ marginBottom: '5px' }}><span>STATUS</span> <span>{theme.status}</span></div>
                      <div className="sum-row" style={{ marginBottom: '5px' }}><span>VERSION</span> <span>{theme.version}</span></div>
                    </div>
                    <div className="world-card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 className="panel-title">KEY FEATURES</h3>
                      <ul className="icon-list small" style={{ marginBottom: 0, flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
                        {theme.features?.slice(0, 4).map(feat => <li key={feat}><span className="hex-icon">{Icons.Hexagon}</span> {feat}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 02: GAME SETTINGS */}
            {activeTab === '02. GAME SETTINGS' && (
              <div className="grid-col tab-span tab-fade">
                <div style={{ display: 'flex', gap: '40px', height: '100%' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 className="panel-title">GAME SETTINGS</h3>
                    {['difficulty', 'graphics', 'multiplayer', 'language', 'camera', 'accessibility'].map(key => (
                      <div className="input-group" key={key}>
                        <div className="label-row"><label>{key.toUpperCase()}</label></div>
                        <input type="text" value={theme.settings?.[key] || ''} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={!isAdmin} />
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 className="panel-title">PC SYSTEM REQUIREMENTS</h3>
                    <div 
                      className="media-placeholder large" 
                      style={{ 
                        flex: 1,
                        backgroundImage: theme.pcSpecsImg ? `url(${theme.pcSpecsImg})` : 'none', 
                        backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', 
                        cursor: theme.pcSpecsImg ? 'pointer' : 'default' 
                      }} 
                      onClick={() => { if (theme.pcSpecsImg) setActiveGalleryImg(theme.pcSpecsImg) }}
                    >
                      {!theme.pcSpecsImg && <span style={{ opacity: 0.5 }}>PC SPECS GRAPHIC</span>}
                      {isAdmin && <div className="admin-overlay" onClick={(e) => { e.stopPropagation(); handleMediaUpload('pcSpecsImg'); }}>{theme.pcSpecsImg ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</div>}
                      {theme.pcSpecsImg && renderRemoveBtn('pcSpecsImg')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 03: GAMEPLAY */}
            {activeTab === '03. GAMEPLAY' && (
              <div className="grid-col tab-span tab-fade">
                <h3 className="panel-title">GAMEPLAY SHOWCASE</h3>

                <div
                  className="media-placeholder cinematic-hero"
                  style={{
                    height: '550px',
                    width: '100%',
                    backgroundImage: theme.trailerUrl
                      ? (getYoutubeId(theme.trailerUrl) ? `url(https://img.youtube.com/vi/${getYoutubeId(theme.trailerUrl)}/maxresdefault.jpg)` : `url(${theme.trailerUrl})`)
                      : "url('https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop')",
                    backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                  }}
                  onClick={() => { if (theme.trailerUrl) setPlayingVideo(theme.trailerUrl) }}
                >
                  <div className="play-ring" style={{ zIndex: 2 }}><div className="play-btn">{Icons.Play}</div></div>
                  {isAdmin && (
                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', display: 'flex', gap: '10px', zIndex: 10 }}>
                      <div className="admin-overlay" style={{ position: 'relative', right: 'auto', bottom: 'auto' }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('trailerUrl'); }}>
                        {theme.trailerUrl ? 'UPLOAD TRAILER' : 'UPLOAD TRAILER'}
                      </div>
                      <div className="admin-overlay" style={{ position: 'relative', right: 'auto', bottom: 'auto' }} onClick={(e) => {
                        e.stopPropagation();
                        const url = prompt("Paste 4K YouTube URL (e.g. https://www.youtube.com/watch?v=...)");
                        if (url) updateGameField(activeGameId, 'trailerUrl', url);
                      }}>
                        {theme.trailerUrl ? 'PASTE YOUTUBE' : 'PASTE YOUTUBE'}
                      </div>
                    </div>
                  )}
                  {theme.trailerUrl && renderRemoveBtn('trailerUrl')}
                </div>
              </div>
            )}

            {/* TAB 04: VISUALS */}
            {activeTab === '04. VISUALS' && (
              <div className="grid-col tab-span tab-fade">
                <h3 className="panel-title">VISUALS GALLERY</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 200px', gap: '15px' }}>

                  <div
                    className="media-placeholder"
                    style={{
                      gridRow: 'span 2', cursor: theme.mainVisual ? 'pointer' : 'default',
                      backgroundImage: theme.mainVisual ? `url(${theme.mainVisual})` : 'none',
                      backgroundPosition: 'center', backgroundSize: 'cover'
                    }}
                    onClick={() => { if (theme.mainVisual) setActiveGalleryImg(theme.mainVisual) }}
                  >
                    {isAdmin && <div className="admin-overlay" style={{ zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('mainVisual'); }}>{theme.mainVisual ? 'CHANGE MAIN' : 'ADD MAIN VISUAL'}</div>}
                    {theme.mainVisual && renderRemoveBtn('mainVisual')}
                  </div>

                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="media-placeholder"
                      style={{
                        cursor: theme.visualThumbs?.[i] ? 'pointer' : 'default',
                        backgroundImage: theme.visualThumbs && theme.visualThumbs[i] ? `url(${theme.visualThumbs[i]})` : 'none',
                        backgroundPosition: 'center', backgroundSize: 'cover'
                      }}
                      onClick={() => { if (theme.visualThumbs?.[i]) setActiveGalleryImg(theme.visualThumbs[i]) }}
                    >
                      {isAdmin && <div className="admin-overlay" style={{ fontSize: theme.visualThumbs?.[i] ? '10px' : '20px', zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('visualThumbs', i); }}>{theme.visualThumbs?.[i] ? 'CHANGE' : '+'}</div>}
                      {theme.visualThumbs?.[i] && renderRemoveBtn('visualThumbs', i)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 05: WORLD & LORE */}
            {activeTab === '05. WORLD & LORE' && (
              <div className="grid-col tab-span tab-fade">
                <h3 className="panel-title">WORLD & LORE</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                  {(theme.lore || []).map((realm, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                      <div
                        className="media-placeholder"
                        style={{
                          height: '140px', cursor: realm.image ? 'pointer' : 'default',
                          backgroundImage: realm.image ? `url(${realm.image})` : 'none',
                          backgroundPosition: 'center', backgroundSize: 'cover'
                        }}
                        onClick={() => { if (realm.image) setActiveGalleryImg(realm.image) }}
                      >
                        {isAdmin && <div className="admin-overlay" style={{ zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('lore', i, 'image'); }}>{realm.image ? 'CHANGE ART' : 'ADD ART'}</div>}
                        {realm.image && renderRemoveBtn('lore', i, 'image')}
                      </div>

                      <input
                        type="text" value={realm.name}
                        onChange={(e) => { const newLore = [...theme.lore]; newLore[i].name = e.target.value; updateGameField(activeGameId, 'lore', newLore); }}
                        disabled={!isAdmin} style={{ fontWeight: 'bold', color: 'white', background: 'transparent', padding: '0', fontSize: '12px' }}
                      />
                      <textarea
                        value={realm.desc}
                        onChange={(e) => { const newLore = [...theme.lore]; newLore[i].desc = e.target.value; updateGameField(activeGameId, 'lore', newLore); }}
                        disabled={!isAdmin} style={{ color: 'var(--text-muted)', background: 'transparent', padding: '0', fontSize: '10px', height: '80px', border: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 06: WEAPONS */}
            {activeTab === '06. WEAPONS' && (
              <div className="grid-col tab-span tab-fade">
                <h3 className="panel-title">WEAPONS ARSENAL</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                  {(theme.weapons || []).map((wep, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>

                      <div
                        className="media-placeholder"
                        style={{
                          height: '300px', marginBottom: '15px', fontSize: '40px', cursor: wep.image ? 'pointer' : 'default',
                          background: wep.image ? `url(${wep.image}) center/cover` : 'radial-gradient(circle, rgba(255,255,255,0.05), transparent)'
                        }}
                        onClick={() => { if (wep.image) setActiveGalleryImg(wep.image) }}
                      >
                        {!wep.image && wep.icon}
                        {isAdmin && <div className="admin-overlay" style={{ zIndex: 10 }} onClick={(e) => { e.stopPropagation(); handleMediaUpload('weapons', i, 'image'); }}>{wep.image ? 'CHANGE ART' : 'ADD ART'}</div>}
                        {wep.image && renderRemoveBtn('weapons', i, 'image')}
                      </div>

                      <input type="text" value={wep.name} onChange={(e) => { const newWep = [...theme.weapons]; newWep[i].name = e.target.value; updateGameField(activeGameId, 'weapons', newWep); }} disabled={!isAdmin} style={{ fontWeight: 'bold', color: 'var(--primary)', background: 'transparent', padding: '0', fontSize: '14px', marginBottom: '10px' }} />
                      <textarea value={wep.desc} onChange={(e) => { const newWep = [...theme.weapons]; newWep[i].desc = e.target.value; updateGameField(activeGameId, 'weapons', newWep); }} disabled={!isAdmin} style={{ color: 'var(--text-muted)', background: 'transparent', padding: '0', fontSize: '11px', height: '60px', border: 'none' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 07: ABILITIES */}
            {activeTab === '07. ABILITIES' && (
              <div className="grid-col tab-span tab-fade">
                <h3 className="panel-title">SKILL TREES</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                  {['LEVIATHAN AXE', 'BLADES OF CHAOS', 'DRAUPNIR SPEAR'].map((treeName, i) => (
                    <div key={treeName} style={{ background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '20px' }}>{treeName}</div>

                      <div
                        className="media-placeholder"
                        style={{
                          width: '100%', height: '360px', cursor: theme.abilityTrees?.[i] ? 'pointer' : 'default',
                          backgroundImage: theme.abilityTrees && theme.abilityTrees[i] ? `url(${theme.abilityTrees[i]})` : 'none',
                          backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat'
                        }}
                        onClick={() => { if (theme.abilityTrees?.[i]) setActiveGalleryImg(theme.abilityTrees[i]) }}
                      >
                        {!theme.abilityTrees?.[i] && <span style={{ opacity: 0.5, fontSize: '10px' }}>NO SKILL TREE UPLOADED</span>}

                        {isAdmin && (
                          <div
                            className="admin-overlay"
                            style={{ zIndex: 10 }}
                            onClick={(e) => { e.stopPropagation(); handleMediaUpload('abilityTrees', i); }}
                          >
                            {theme.abilityTrees?.[i] ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                          </div>
                        )}

                        {theme.abilityTrees?.[i] && renderRemoveBtn('abilityTrees', i)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 08: PUBLISH & REVIEW */}
            {activeTab === '08. PUBLISH & REVIEW' && (
              <div className="grid-col tab-span tab-fade">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr 1fr', gap: '30px' }}>

                  {/* COL 1: PROGRESS TRACKER */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '130px', height: '130px', borderRadius: '50%', marginBottom: '20px',
                      background: `conic-gradient(var(--primary) ${publishData.progress}%, rgba(255,255,255,0.05) 0)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                    }}>
                      <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--bg-core)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isAdmin ? (
                          <input
                            type="number" min="0" max="100"
                            value={publishData.progress}
                            onChange={(e) => handlePublishChange('progress', e.target.value)}
                            style={{ width: '60px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', padding: '5px', color: 'white' }}
                          />
                        ) : (
                          <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{publishData.progress}%</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {publishData.phases.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', opacity: p.done ? 1 : 0.5 }}>
                          <span
                            onClick={() => {
                              if (isAdmin) {
                                const newPhases = [...publishData.phases];
                                newPhases[i].done = !newPhases[i].done;
                                handlePublishChange('phases', newPhases);
                              }
                            }}
                            style={{ cursor: isAdmin ? 'pointer' : 'default', color: p.done ? '#00ff88' : 'var(--text-muted)', fontSize: '10px' }}
                          >
                            {p.done ? '●' : '○'}
                          </span>
                          <input
                            disabled={!isAdmin} value={p.name}
                            onChange={(e) => {
                              const newPhases = [...publishData.phases];
                              newPhases[i].name = e.target.value;
                              handlePublishChange('phases', newPhases);
                            }}
                            style={{ ...adminInputStyle, fontSize: '11px', color: 'white', flex: 1 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COL 2: LATEST UPDATES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>LATEST UPDATES</h4>
                    {publishData.updates.map((upd, i) => (
                      <div key={i} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <input disabled={!isAdmin} value={upd.version} onChange={(e) => { const newU = [...publishData.updates]; newU[i].version = e.target.value; handlePublishChange('updates', newU); }} style={{ ...adminInputStyle, fontWeight: 'bold', fontSize: '11px', color: 'white', width: '60%' }} />
                          <input disabled={!isAdmin} value={upd.date} onChange={(e) => { const newU = [...publishData.updates]; newU[i].date = e.target.value; handlePublishChange('updates', newU); }} style={{ ...adminInputStyle, fontSize: '10px', color: 'var(--text-muted)', width: '35%', textAlign: 'right' }} />
                        </div>
                        <textarea disabled={!isAdmin} value={upd.desc} onChange={(e) => { const newU = [...publishData.updates]; newU[i].desc = e.target.value; handlePublishChange('updates', newU); }} style={{ ...adminInputStyle, fontSize: '11px', color: 'var(--text-muted)', minHeight: '40px', lineHeight: '1.4' }} />
                      </div>
                    ))}
                  </div>

                  {/* COL 3: TESTING STATUS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>TESTING STATUS</h4>
                    {publishData.testing.map((test, i) => (
                      <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${test.color}`, color: test.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{test.icon}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <input disabled={!isAdmin} value={test.name} onChange={(e) => { const newT = [...publishData.testing]; newT[i].name = e.target.value; handlePublishChange('testing', newT); }} style={{ ...adminInputStyle, fontSize: '11px', color: 'white', fontWeight: 'bold' }} />
                          <input disabled={!isAdmin} value={test.status} onChange={(e) => { const newT = [...publishData.testing]; newT[i].status = e.target.value; handlePublishChange('testing', newT); }} style={{ ...adminInputStyle, fontSize: '10px', color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COL 4: KNOWN ISSUES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>KNOWN ISSUES</h4>
                    {isAdmin ? (
                      <textarea value={publishData.issues.join('\n')} onChange={(e) => handlePublishChange('issues', e.target.value.split('\n'))} style={{ ...adminInputStyle, fontSize: '11px', color: 'var(--text-muted)', minHeight: '150px', lineHeight: '1.8' }} placeholder="Enter issues on new lines..." />
                    ) : (
                      publishData.issues.map((iss, i) => (
                        <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: '1.4' }}>
                          <span style={{ color: '#ff3333', marginTop: '1px' }}>●</span>
                          <span>{iss}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* COL 5: ROADMAP */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>ROADMAP</h4>
                    {publishData.roadmap.map((rm, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '2px 5px', borderRadius: '4px' }}>1</span>
                          <input disabled={!isAdmin} value={rm.milestone} onChange={(e) => { const newR = [...publishData.roadmap]; newR[i].milestone = e.target.value; handlePublishChange('roadmap', newR); }} style={{ ...adminInputStyle, fontSize: '11px', color: 'white', fontWeight: 'bold' }} />
                        </div>
                        <input disabled={!isAdmin} value={rm.date} onChange={(e) => { const newR = [...publishData.roadmap]; newR[i].date = e.target.value; handlePublishChange('roadmap', newR); }} style={{ ...adminInputStyle, fontSize: '10px', color: 'var(--text-muted)', width: '45px', textAlign: 'right' }} />
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

          </section>

          {/* --- BOTTOM: TEST PLAY LAUNCHER --- */}
          <section className="test-play-footer">
            <div className="footer-left">
              <div className="step-badge">{Icons.Check}</div>
              <span className="step-text">9. TEST YOUR GAME</span>
            </div>

            <div className="footer-center">
              <p className="test-desc">Test your game in real-time before publishing.</p>
              <div className="test-badges">
                <span><span className="b-icon">▣</span> Real-time Preview</span>
                <span><span className="b-icon">✦</span> Performance Check</span>
                <span><span className="b-icon">⊗</span> Gameplay Test</span>
                <span><span className="b-icon">▢</span> Cross-Device Test</span>
              </div>
            </div>

            <div className="footer-right">
              <button className="btn-massive-play" onClick={() => { if (activeGameId === 'GOW') setCurrentRoute('PLAYING_GOW') }}>
                <div className="play-text"><span className="play-ico">{Icons.Play}</span> TEST PLAY</div>
                <div className="play-sub">Launch your demo gameplay</div>
              </button>
              <svg className="decorative-arrow" width="80" height="40" viewBox="0 0 100 50" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M10 40 Q 50 40 90 10" strokeDasharray="4 4" />
                <path d="M80 10 L 90 10 L 85 20" />
              </svg>
            </div>
          </section>

        </div>
      </main>

      {/* --- FULLSCREEN VIDEO PLAYER MODAL --- */}
      {playingVideo && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'
          }}
          onClick={() => setPlayingVideo(null)}
        >
          <div
            style={{
              position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
              cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 100000
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onClick={(e) => { e.stopPropagation(); setPlayingVideo(null); }}
          >✕</div>

          {getYoutubeId(playingVideo) ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(playingVideo)}?autoplay=1&rel=0&hd=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width: '90%', height: '80%', borderRadius: '12px',
                border: '1px solid var(--primary)', boxShadow: '0 0 40px rgba(var(--primary-rgb), 0.4)'
              }}
            />
          ) : (
            <video
              src={playingVideo}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90%', maxHeight: '90%', borderRadius: '12px',
                border: '1px solid var(--primary)', boxShadow: '0 0 40px rgba(var(--primary-rgb), 0.4)'
              }}
            />
          )}
        </div>,
        document.body
      )}

      {/* --- FULLSCREEN IMAGE LIGHTBOX MODAL --- */}
      {activeGalleryImg && createPortal(
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
            animation: 'splashFadeIn 0.3s ease-out forwards'
          }}
          onClick={() => setActiveGalleryImg(null)}
        >
          {/* Close Button */}
          <div
            style={{
              position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
              cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 100000
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onClick={(e) => { e.stopPropagation(); setActiveGalleryImg(null); }}
          >✕</div>

          {/* Image Container */}
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img
              src={activeGalleryImg}
              alt="Gallery Fullscreen"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px',
                border: '1px solid var(--primary)',
                boxShadow: `0 0 40px rgba(${theme.primaryRgb || '255,255,255'}, 0.4)`,
                objectFit: 'contain',
                animation: 'splashIconPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}