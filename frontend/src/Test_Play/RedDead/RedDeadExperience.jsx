import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Vignette, Noise, Sepia, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Revolver from './Revolver'

export default function RedDeadExperience({ onExit }) {
  // states: 'WAITING' -> 'DRAW' -> 'FIRED' or 'MISFIRE'
  const [duelState, setDuelState] = useState('WAITING')
  const [reactionTime, setReactionTime] = useState(null)
  
  const drawTimer = useRef(null)
  const drawStartTime = useRef(0)

  useEffect(() => {
    // Random wait between 3 and 7 seconds before DRAW
    const waitTime = Math.random() * 4000 + 3000
    drawTimer.current = setTimeout(() => {
      setDuelState('DRAW')
      drawStartTime.current = Date.now()
    }, waitTime)

    return () => clearTimeout(drawTimer.current)
  }, [])

  const handleClick = () => {
    if (duelState === 'WAITING') {
      // Clicked too early!
      clearTimeout(drawTimer.current)
      setDuelState('MISFIRE')
    } else if (duelState === 'DRAW') {
      // Good shot!
      const time = Date.now() - drawStartTime.current
      setReactionTime(time)
      setDuelState('FIRED')
    }
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'black', cursor: 'crosshair' }}
      onPointerDown={handleClick}
    >
      
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
        <color attach="background" args={['#1a1005']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[-5, 10, -5]} intensity={1.5} color="#ffddaa" castShadow />

        {/* The dusty ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#3a2211" roughness={1} metalness={0} />
        </mesh>

        <Suspense fallback={null}>
          <Revolver duelState={duelState} />
        </Suspense>

        <EffectComposer disableNormalPass>
          <Sepia intensity={1.0} blendFunction={BlendFunction.NORMAL} />
          <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={1} />
          <Vignette eskil={false} offset={0.2} darkness={1.5} />
          <Noise opacity={0.15} />
        </EffectComposer>
      </Canvas>

      {/* OVERLAY UI */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', textAlign: 'center' }}>
        {duelState === 'DRAW' && (
          <h1 style={{ fontSize: '72px', letterSpacing: '10px', color: '#ff0000', margin: 0, textShadow: '2px 2px 0 #000' }}>DRAW!</h1>
        )}
        {duelState === 'FIRED' && (
          <>
            <h1 style={{ fontSize: '48px', letterSpacing: '5px', color: 'white', margin: 0, textShadow: '2px 2px 0 #000' }}>LETHAL HIT</h1>
            <p style={{ color: '#ffcc00', fontSize: '24px' }}>{reactionTime}ms</p>
          </>
        )}
        {duelState === 'MISFIRE' && (
          <h1 style={{ fontSize: '48px', letterSpacing: '5px', color: '#555', margin: 0, textShadow: '2px 2px 0 #000' }}>MISFIRE</h1>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', letterSpacing: '4px' }}>
          {duelState === 'WAITING' ? "WAIT FOR THE SIGNAL..." : "CLICK TO RESTART (not implemented)"}
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
      >
        ×
      </button>
    </div>
  )
}
