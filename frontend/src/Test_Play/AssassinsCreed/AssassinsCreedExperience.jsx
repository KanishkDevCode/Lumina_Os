import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Grid } from '@react-three/drei'
import { EffectComposer, Vignette, ChromaticAberration, Noise, Glitch, Bloom } from '@react-three/postprocessing'
import { GlitchMode, BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import HiddenBlade from './HiddenBlade'

// Camera logic to track mouse and shake on impact
function CinematicCamera({ isAssassinating, shake }) {
  const vec = new THREE.Vector3()
  useFrame((state, delta) => {
    // Air assassination - start high up and drop down
    const targetX = state.pointer.x * 3
    const targetY = isAssassinating ? 1.5 : 12
    const targetZ = isAssassinating ? 3.0 : 8 
    
    const targetFov = isAssassinating ? 60 : 50
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, delta * 4)
    state.camera.updateProjectionMatrix()

    if (shake > 0) {
      state.camera.position.x = targetX + (Math.random() - 0.5) * shake
      state.camera.position.y = targetY + (Math.random() - 0.5) * shake
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 15)
    } else {
      // Fast drop speed when assassinating
      state.camera.position.lerp(vec.set(targetX, targetY, targetZ), delta * (isAssassinating ? 8 : 4))
    }
    
    // Look down at the target on the ground
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function HolographicTarget({ onAssassinate }) {
  const groupRef = useRef()
  const innerRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Floating & spinning animation near the ground
  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8
    groupRef.current.rotation.y += delta * 0.5
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 1.5
      innerRef.current.rotation.z += delta * 1.5
    }
  })

  const color = hovered ? "#ff0033" : "#00ffff"

  return (
    <group 
      ref={groupRef} 
      position={[0, 0.8, 0]}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        if (hovered) onAssassinate(groupRef.current.position)
      }}
    >
      {/* Outer shell */}
      <mesh>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Inner core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color={color} wireframe={false} toneMapped={false} />
      </mesh>
      
      {/* Target indicator ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <ringGeometry args={[0.8, 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <pointLight color={color} intensity={hovered ? 5 : 2} distance={5} />
    </group>
  )
}

function DataParticles() {
  const count = 500
  const meshRef = useRef()
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for(let i=0; i<count; i++) {
      temp[i*3] = (Math.random() - 0.5) * 20
      temp[i*3+1] = Math.random() * 10 - 2
      temp[i*3+2] = (Math.random() - 0.5) * 20
    }
    return temp
  }, [])

  useFrame((state, delta) => {
    if(!meshRef.current) return
    const positions = meshRef.current.geometry.attributes.position.array
    for(let i=0; i<count; i++) {
      positions[i*3+1] += delta * 2 // move up
      if(positions[i*3+1] > 8) {
        positions[i*3+1] = -2
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export default function AssassinsCreedExperience({ onExit }) {
  const [isAssassinating, setIsAssassinating] = useState(false)
  const [shake, setShake] = useState(0)
  const [targetPos, setTargetPos] = useState(new THREE.Vector3())
  const [hudStatus, setHudStatus] = useState("LOCATING MEMORY SEQUENCE")
  const [isRedAlert, setIsRedAlert] = useState(false)

  const triggerAssassination = (position) => {
    if (isAssassinating) return 
    
    setIsAssassinating(true)
    setTargetPos(position)
    setHudStatus("SEQUENCE CORRUPTED // TARGET ELIMINATED")
    setIsRedAlert(true)
    
    // Impact shake - greatly reduced to prevent geometry clipping
    setTimeout(() => setShake(0.4), 50)
    setTimeout(() => setShake(0.1), 250)
    setTimeout(() => setShake(0), 600)

    // Reset 
    setTimeout(() => {
      setIsAssassinating(false)
      setIsRedAlert(false)
      setHudStatus("SYNCHRONIZING...")
    }, 3000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#02050a', cursor: 'crosshair' }}>
      
      <Canvas camera={{ position: [0, 12, 8], fov: 50 }}>
        <color attach="background" args={isRedAlert ? ['#1a0000'] : ['#02050a']} />
        
        <CinematicCamera isAssassinating={isAssassinating} shake={shake} />
        
        <ambientLight intensity={0.5} />
        
        {/* Animus Infinite Grid */}
        <Grid 
          position={[0, -0.5, 0]} 
          args={[40, 40]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor={isRedAlert ? "#ff0000" : "#00ffff"} 
          sectionSize={4} 
          sectionThickness={1.5} 
          sectionColor={isRedAlert ? "#ff3333" : "#00aaff"} 
          fadeDistance={25} 
          fadeStrength={1} 
        />

        <DataParticles />

        <Suspense fallback={null}>
          <HolographicTarget onAssassinate={triggerAssassination} />
          <HiddenBlade isAssassinating={isAssassinating} targetPos={targetPos} />
        </Suspense>

        {/* POST PROCESSING */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.0} />
          {isRedAlert && <Glitch delay={[0, 0]} duration={[0.2, 0.4]} strength={[0.05, 0.2]} mode={GlitchMode.SPORADIC} />}
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[isRedAlert ? 0.02 : 0.003, isRedAlert ? 0.02 : 0.003]} />
          <Vignette eskil={false} offset={0.2} darkness={1.2} />
          <Noise opacity={isRedAlert ? 0.15 : 0.05} />
        </EffectComposer>
      </Canvas>

      {/* OVERLAY UI */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', pointerEvents: 'none', fontFamily: 'monospace' }}>
        <h1 style={{ margin: 0, fontSize: '32px', letterSpacing: '12px', color: 'white', textShadow: isRedAlert ? '0 0 20px #ff0000' : '0 0 20px #00ffff' }}>
          ANIMUS 3.0
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRedAlert ? '#ff3333' : '#00ffff', boxShadow: `0 0 10px ${isRedAlert ? '#ff3333' : '#00ffff'}` }}></div>
          <p style={{ margin: 0, fontSize: '12px', color: isRedAlert ? '#ff3333' : '#00ffff', letterSpacing: '4px' }}>
            STATUS: {hudStatus}
          </p>
        </div>
      </div>

      {/* Crosshair / Reticle */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
        width: '4px', height: '4px', background: 'white', borderRadius: '50%', pointerEvents: 'none',
        boxShadow: '0 0 5px white'
      }} />

      <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center', pointerEvents: 'none', fontFamily: 'monospace' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', letterSpacing: '6px' }}>
          HOVER OVER DATA FRAGMENT AND CLICK TO ASSASSINATE
        </p>
      </div>

      {/* EXIT BUTTON */}
      <button 
        onClick={onExit}
        style={{
          position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
          cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 10, fontFamily: 'monospace'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'black' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
      >
        ×
      </button>

    </div>
  )
}
