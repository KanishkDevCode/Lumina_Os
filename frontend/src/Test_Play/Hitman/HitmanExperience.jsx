import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import Silverballer from './Silverballer'

function Target({ position, onHit }) {
  const [hit, setHit] = useState(false)
  
  return (
    <mesh 
      position={position}
      onClick={() => {
        if (!hit) {
          setHit(true)
          onHit()
        }
      }}
      visible={!hit}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ff0000" emissive="#550000" roughness={0.2} metalness={0.8} />
    </mesh>
  )
}

export default function HitmanExperience({ onExit }) {
  const [isFiring, setIsFiring] = useState(false)
  const [score, setScore] = useState(0)

  const targets = [
    [-3, 2, -5],
    [4, 1, -8],
    [-2, 4, -10],
    [5, 3, -12],
    [0, 1, -6]
  ]

  const handleShoot = () => {
    setIsFiring(true)
    setTimeout(() => setIsFiring(false), 100) // Reset recoil quickly
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'black', cursor: 'crosshair' }}
      onPointerDown={handleShoot}
    >
      
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
        {/* Clinical dark environment */}
        <color attach="background" args={['#0a0f12']} />
        
        <ambientLight intensity={0.2} />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" castShadow />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>

        <Suspense fallback={null}>
          <Silverballer isFiring={isFiring} />
          {targets.map((pos, i) => (
            <Target key={i} position={pos} onHit={() => setScore(s => s + 1)} />
          ))}
        </Suspense>

        <EffectComposer disableNormalPass>
          <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={2} />
          <Vignette eskil={false} offset={0.3} darkness={1.8} />
          <Noise opacity={0.08} />
        </EffectComposer>
      </Canvas>

      {/* OVERLAY UI */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '8px', color: 'white' }}>ICA TERMINAL</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#ff3333', letterSpacing: '3px' }}>
          TARGETS ELIMINATED: {score} / {targets.length}
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '4px' }}>
          CLICK TO ASSASSINATE
        </p>
      </div>

      <button 
        onClick={onExit}
        style={{
          position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
          cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 10
        }}
      >
        ×
      </button>
    </div>
  )
}
