import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshReflectorMaterial, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import MagicWand from './MagicWand'

function CinematicCamera({ shake }) {
  const vec = new THREE.Vector3()
  useFrame((state, delta) => {
    if (shake > 0) {
      state.camera.position.x = (state.pointer.x * 2) + (Math.random() - 0.5) * shake
      state.camera.position.y = (state.pointer.y * 2) + 2 + (Math.random() - 0.5) * shake
    } else {
      state.camera.position.lerp(vec.set(state.pointer.x * 2, (state.pointer.y * 2) + 2, 8), delta * 4)
    }
    state.camera.lookAt(0, 1, 0)
  })
  return null
}

export default function HogwartsExperience({ onExit }) {
  const [wandState, setWandState] = useState('idle') // idle, charging, casting
  const [shake, setShake] = useState(0)

  const handlePointerDown = () => {
    if (wandState !== 'casting') {
      setWandState('charging')
    }
  }

  const handlePointerUp = () => {
    if (wandState === 'charging') {
      setWandState('casting')
      setShake(0.5)
      setTimeout(() => setShake(0), 400)
    }
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'black', cursor: 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
        <color attach="background" args={['#01050a']} />
        <CinematicCamera shake={shake} />

        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 10, -5]} intensity={0.5} color="#4455ff" castShadow />

        {/* The mysterious ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <MeshReflectorMaterial 
            blur={[200, 100]} resolution={512} mixBlur={1} mixStrength={5} 
            depthScale={1} minDepthThreshold={0.85} color="#05101a" metalness={0.5} roughness={1} 
          />
        </mesh>

        <Suspense fallback={null}>
          <MagicWand wandState={wandState} setWandState={setWandState} />
        </Suspense>

        {/* Ambient magical fireflies */}
        <Sparkles count={400} scale={20} size={3} speed={0.2} opacity={0.5} color="#aaccff" />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={wandState === 'casting' ? 5.0 : 1.5} />
          <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={2} />
          <Vignette eskil={false} offset={0.1} darkness={1.3} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>

      {/* OVERLAY UI */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '8px', color: 'white', textShadow: '0 0 15px rgba(0,255,255,0.8)' }}>FIELD GUIDE</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#00ffff', letterSpacing: '3px' }}>
          SPELL: EXPELLIARMUS
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '4px' }}>
          HOLD CLICK TO CHARGE. RELEASE TO CAST.
        </p>
      </div>

      {/* EXIT BUTTON */}
      <button 
        onClick={onExit}
        style={{
          position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
          cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 10
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'black' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
      >
        ×
      </button>
    </div>
  )
}
