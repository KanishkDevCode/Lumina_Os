import { useState, useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Sparkles, MeshReflectorMaterial, useTexture, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import LeviathanAxe from './LeviathanAxe'

function CinematicCamera({ appState, shake, isAiming }) {
  const vec = new THREE.Vector3()
  useFrame((state, delta) => {
    const isSummoning = ['ACTIVATING', 'CONVERGING', 'FORGING'].includes(appState)
    const targetFov = appState === 'PLAYING' ? (isAiming ? 40 : 55) : (isSummoning ? 35 : 45)

    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, delta * 2.5)
    state.camera.updateProjectionMatrix()

    const time = state.clock.getElapsedTime()
    const breathX = Math.sin(time * 0.5) * 0.05
    const breathY = Math.cos(time * 0.4) * 0.05

    const mouseX = isSummoning ? 0 : (state.pointer.x * 2) + breathX
    const mouseY = isSummoning ? 2 : (state.pointer.y * 2) + breathY + 2

    if (shake > 0) {
      state.camera.position.x = mouseX + (Math.random() - 0.5) * shake
      state.camera.position.y = mouseY + (Math.random() - 0.5) * shake
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 7.5, delta * 5)
    } else {
      state.camera.position.lerp(vec.set(mouseX, mouseY, 8), delta * 3)
    }
    state.camera.lookAt(0, 2, 0)
  })
  return null
}

function SummonVortex({ appState }) {
  const vortexRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const isActive = ['ACTIVATING', 'CONVERGING', 'FORGING'].includes(appState)

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 400; i++) {
      temp.push({
        angle: Math.random() * Math.PI * 2,
        radius: 8 + Math.random() * 15,
        y: (Math.random() - 0.5) * 15 + 2,
        speed: Math.random() * 2 + 1
      })
    }
    return temp
  }, [])

  useFrame((state, delta) => {
    if (!isActive || !vortexRef.current) return

    particles.forEach((p, i) => {
      p.angle += p.speed * delta * (appState === 'CONVERGING' ? 3 : 1)
      if (appState === 'CONVERGING' || appState === 'FORGING') {
        p.radius -= (p.radius * 0.8 + 0.5) * delta * 2.5
        p.y = THREE.MathUtils.lerp(p.y, 2, delta * 3)
      }
      const px = Math.cos(p.angle) * p.radius
      const pz = Math.sin(p.angle) * p.radius

      dummy.position.set(px, p.y, pz)
      const scale = p.radius > 0.1 ? (p.radius < 5 ? 1.5 : 1) : 0
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      vortexRef.current.setMatrixAt(i, dummy.matrix)
    })
    vortexRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={vortexRef} args={[null, null, 400]} visible={isActive}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  )
}

function FimbulwinterSkybox({ appState }) {
  const texture = useTexture('/cinematic_bg.png')
  const visible = appState !== 'MENU' && appState !== 'ACTIVATING'

  return (
    // Pushed far back into the scene. Uses a 16:9 aspect ratio size (320x180) 
    // so the image doesn't stretch and the whole thing is visible.
    <mesh position={[0, 5, -80]} visible={visible}>
      <planeGeometry args={[320, 180]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}



function LevelEnvironment() {
  const { scene } = useGLTF('/models/Environment(GOW).glb')

  // Traverse the model to adjust materials so they match the Fimbulwinter vibe
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Blend the dark stone with a frosty blue/grey to match the background
        child.material.color.lerp(new THREE.Color('#88bbdd'), 0.45)
        
        // Boost environmental reflections to make the stone look wet/icy
        child.material.envMapIntensity = 3.0
        
        // Slightly reduce roughness for an icy sheen
        if (child.material.roughness !== undefined) {
          child.material.roughness = Math.max(0.2, child.material.roughness - 0.2)
        }
        
        child.material.needsUpdate = true
      }
    })
  }, [scene])

  return (
    <group position={[0, 6, -20]} scale={50}>
      <primitive object={scene} />

      {/* Broad ambient fill light matching the Fimbulwinter skybox */}
      <hemisphereLight skyColor="#aaddff" groundColor="#001133" intensity={2.5} />
      
      {/* Frontal cinematic light to illuminate the faces of the pillars we are looking at */}
      <directionalLight position={[0, 10, 20]} intensity={3.5} color="#ccf0ff" />
    </group>
  )
}

export default function GodOfWarExperience({ onExit }) {
  const [appState, setAppState] = useState('MENU')
  const [hudStatus, setHudStatus] = useState("SYSTEM DORMANT")
  const [shakeAmount, setShakeAmount] = useState(0)
  const [isAiming, setIsAiming] = useState(false)
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const envRef = useRef()

  const [weaponPath, setWeaponPath] = useState('/models/axe.glb')

  const handleWeaponSelect = (path) => {
    if (path === '/models/axe.glb') {
      setWeaponPath(path)
      setHudStatus("WEAPON AWAKENED")
    } else {
      setHudStatus("PROTOCOL LOCKED: INTEGRATING SOON")
      triggerShake(0.1, 200)
    }
  }

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onExit() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onExit])

  const triggerShake = (intensity = 0.5, duration = 200) => {
    setShakeAmount(intensity)
    setTimeout(() => setShakeAmount(0), duration)
  }

  const handleAwaken = () => {
    setAppState('ACTIVATING')
    setHudStatus("RUNE IGNITION")
    triggerShake(0.05, 1000)

    setTimeout(() => {
      setAppState('CONVERGING')
      setHudStatus("ABSORBING AMBIENT FROST...")
      triggerShake(0.15, 2000)
    }, 1000)

    setTimeout(() => {
      setAppState('FORGING')
      setHudStatus("FORGING WEAPON...")
      triggerShake(0.3, 1500)
    }, 3000)

    setTimeout(() => {
      setAppState('PLAYING')
      setHudStatus("WEAPON AWAKENED")
      triggerShake(2.0, 500)
      setIsDashboardOpen(true)
      setTimeout(() => setIsDashboardOpen(false), 3500)
    }, 4500)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#010203', overflow: 'hidden', color: 'white', fontFamily: 'serif' }}>

      <style>{`
        @keyframes frostFlow {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes intensePulse {
          0%, 100% { box-shadow: 0 0 50px rgba(0, 255, 255, 0.3); transform: scale(1); }
          50% { box-shadow: 0 0 120px rgba(0, 255, 255, 0.8); transform: scale(1.05); }
        }
        .armory-btn {
          width: 100%; padding: 10px; background: rgba(0,255,255,0.05); color: #0ff; 
          border: 1px solid rgba(0,255,255,0.2); cursor: pointer; font-family: monospace; 
          letter-spacing: 2px; transition: all 0.2s; margin-bottom: 8px; text-align: left;
        }
        .armory-btn:hover { background: rgba(0,255,255,0.15); border: 1px solid #0ff; }
        .armory-btn.active { background: rgba(0,255,255,0.25); border: 1px solid #0ff; box-shadow: 0 0 10px rgba(0,255,255,0.5); }
      `}</style>

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
        <CinematicCamera appState={appState} shake={shakeAmount} isAiming={isAiming} />

        <ambientLight intensity={appState === 'PLAYING' ? 0.15 : 0.02} color="#446688" />
        <directionalLight position={[15, 30, -20]} intensity={appState === 'PLAYING' ? 2.5 : 0.05} color="#88ccff" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
        <Environment preset="night" blur={0.6} />

        <FimbulwinterSkybox appState={appState} />

        <group ref={envRef}>
          <LevelEnvironment />
        </group>

        <SummonVortex appState={appState} />



        <Suspense fallback={null}>
          {(appState === 'FORGING' || appState === 'PLAYING') && (
            <LeviathanAxe appState={appState} setHudState={setHudStatus} triggerShake={triggerShake} setIsAiming={setIsAiming} weaponPath={weaponPath} environmentRef={envRef} />
          )}
        </Suspense>

        <EffectComposer disableNormalPass multisampling={4}>
          <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={appState === 'FORGING' ? 4.0 : 2.8} mipmapBlur />
          <DepthOfField target={[0, 2, 0]} focalLength={0.025} bokehScale={isAiming ? 8 : (appState !== 'PLAYING' ? 10 : 4)} height={480} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} />
          <Vignette eskil={false} offset={0.3} darkness={appState === 'PLAYING' ? 0.9 : 1.2} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>

      {/* --- START MENU --- */}
      {appState !== 'PLAYING' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: appState === 'MENU' ? 'auto' : 'none' }}>
          <div onClick={appState === 'MENU' ? handleAwaken : null}
            style={{
              width: '90px', height: '90px', border: '2px solid rgba(0,255,255,0.3)', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
              animation: appState === 'CONVERGING' || appState === 'FORGING' ? 'intensePulse 0.4s infinite' : 'pulse 3s infinite',
              opacity: appState === 'FORGING' ? 0 : 1, transition: 'opacity 1s'
            }}>
            <span style={{ fontSize: '36px', color: '#0ff', textShadow: '0 0 15px #0ff' }}>ᛟ</span>
          </div>
          {appState !== 'MENU' && <p style={{ marginTop: '30px', color: '#0ff', letterSpacing: '10px', fontSize: '11px', animation: 'pulse 1s infinite' }}>{hudStatus}</p>}
        </div>
      )}

      {/* --- FROST SURGE BAR --- */}
      {appState === 'PLAYING' && (
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '500px', display: 'flex', flexDirection: 'column', zIndex: 15, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0ff', fontSize: '13px', letterSpacing: '4px', opacity: 0.9, marginBottom: '12px', textShadow: '0 0 10px rgba(0,255,255,0.4)' }}>
            <span>FROST SURGE</span>
            <span id="frost-surge-text">0%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(2, 10, 20, 0.8)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', boxShadow: '0 0 30px rgba(0,0,0,0.9)' }}>
            <div id="frost-surge-bar" style={{
              width: '0%', height: '100%',
              background: 'linear-gradient(90deg, #004488 0%, #00ffff 50%, #004488 100%)',
              backgroundSize: '200% 100%',
              animation: 'frostFlow 1.5s linear infinite',
              boxShadow: '0 0 20px #0ff', transition: 'none'
            }} />
          </div>
        </div>
      )}

      {/* --- DASHBOARD WITH ARMORY --- */}
      {appState === 'PLAYING' && (
        <div onMouseEnter={() => setIsDashboardOpen(true)} onMouseLeave={() => setIsDashboardOpen(false)}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '400px', transform: isDashboardOpen ? 'translateX(0)' : 'translateX(-370px)', transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)', display: 'flex', zIndex: 20 }}>
          <div style={{ width: '370px', height: '100%', background: 'linear-gradient(90deg, rgba(2,6,12,0.85) 0%, rgba(2,6,12,0.4) 100%)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(0,255,255,0.1)', padding: '50px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '32px', letterSpacing: '6px', color: '#0ff', textShadow: '0 0 20px rgba(0,255,255,0.8)' }}>GOD OF WAR</h2>
            <p style={{ margin: 0, color: '#0ff', fontSize: '11px', letterSpacing: '3px', opacity: 0.7 }}>STATUS // <span style={{ color: 'white', opacity: 1 }}>{hudStatus}</span></p>

            <div style={{ marginTop: '40px', fontSize: '11px', color: '#aaddff', opacity: 0.8, letterSpacing: '2px', lineHeight: '3' }}>
              <p style={{ margin: 0, borderBottom: '1px solid rgba(0,255,255,0.15)', paddingBottom: '10px', color: '#0ff', marginBottom: '15px' }}>TACTICAL LINK</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ padding: '4px 8px', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '4px' }}>TAP/SHORT HOLD</span><span style={{ color: 'white' }}>LIGHT SLASH</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}><span style={{ padding: '4px 8px', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '4px' }}>100% CHARGE</span><span style={{ color: 'white' }}>AXE THROW</span></div>

              {/* 🚀 NEW: Updated HUD text for heavy slam and frost orb burst */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}><span style={{ padding: '4px 8px', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '4px' }}> L_SHIFT </span><span style={{ color: 'white' }}>HEAVY SLAM + FROST BURST</span></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}><span style={{ padding: '4px 8px', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '4px' }}> R KEY </span><span style={{ color: 'white' }}>VIOLENT RECALL</span></div>
            </div>

            <div style={{ marginTop: '40px', flexGrow: 1 }}>
              <p style={{ margin: 0, borderBottom: '1px solid rgba(0,255,255,0.15)', paddingBottom: '10px', color: '#0ff', fontSize: '11px', letterSpacing: '2px', marginBottom: '15px' }}>ARMORY PROTOCOLS</p>

              <button onClick={() => handleWeaponSelect('/models/axe.glb')} className={`armory-btn ${weaponPath === '/models/axe.glb' ? 'active' : ''}`}>
                [01] LEVIATHAN AXE
              </button>

              <button onClick={() => handleWeaponSelect('/models/hammer.glb')} className={`armory-btn ${weaponPath === '/models/hammer.glb' ? 'active' : ''}`}>
                [02] MJOLNIR (LOCKED)
              </button>

              <button onClick={() => handleWeaponSelect('/models/spear.glb')} className={`armory-btn ${weaponPath === '/models/spear.glb' ? 'active' : ''}`}>
                [03] DRAUPNIR SPEAR (LOCKED)
              </button>
            </div>

            <button onClick={() => onExit()} style={{ marginTop: 'auto', width: '100%', padding: '15px', background: 'rgba(255,51,102,0.05)', color: '#ff3366', border: '1px solid rgba(255, 51, 102, 0.4)', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '4px', transition: 'all 0.3s' }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(255,51,102,0.2)'; e.target.style.boxShadow = '0 0 20px rgba(255,51,102,0.2)' }}
              onMouseOut={(e) => { e.target.style.background = 'rgba(255,51,102,0.05)'; e.target.style.boxShadow = 'none' }}>
              SEVER CONNECTION
            </button>
          </div>
          <div style={{ width: '30px', height: '100%', background: 'rgba(0, 255, 255, 0.02)', borderRight: '2px solid rgba(0, 255, 255, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: isDashboardOpen ? '5px 0 20px rgba(0,255,255,0.1)' : '3px 0 15px rgba(0,255,255,0.5)' }}>
            <span style={{ writingMode: 'vertical-rl', color: '#0ff', letterSpacing: '10px', fontSize: '14px', textShadow: '0 0 15px #0ff', opacity: isDashboardOpen ? 1 : 0.8 }}>GOD OF WAR</span>
          </div>
        </div>
      )}
    </div>
  )
}