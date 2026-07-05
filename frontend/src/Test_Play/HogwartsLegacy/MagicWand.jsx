import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles, Trail } from '@react-three/drei'
import * as THREE from 'three'

export default function MagicWand({ wandState, setWandState, castPos }) {
  const wandRef = useRef()
  const tipRef = useRef()
  const beamRef = useRef()
  const { scene } = useGLTF('/models/wand_draco.glb')

  const sounds = {
    charge: new Audio('/sound_effects/charge.mp3'),
    cast: new Audio('/sound_effects/cast.mp3')
  }

  useEffect(() => {
    Object.values(sounds).forEach(audio => {
      audio.volume = 0.5
    })
  }, [])

  const playSound = (audio) => {
    try {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (wandState === 'charging') {
      playSound(sounds.charge)
    } else if (wandState === 'casting') {
      playSound(sounds.cast)
      // Hide the beam after 0.5s
      setTimeout(() => {
        setWandState('idle')
      }, 800)
    }
  }, [wandState])

  useFrame((state, delta) => {
    if (!wandRef.current) return

    // Smooth mouse tracking
    const targetX = state.pointer.x * 2.5
    const targetY = state.pointer.y * 2.5 - 1.5

    if (wandState === 'casting') {
      // Recoil animation
      wandRef.current.position.lerp(new THREE.Vector3(targetX, targetY - 1, 4), delta * 10)
      wandRef.current.rotation.x = THREE.MathUtils.lerp(wandRef.current.rotation.x, -Math.PI / 6, delta * 15)
      
      if (beamRef.current) {
        beamRef.current.scale.z = THREE.MathUtils.lerp(beamRef.current.scale.z, 50, delta * 20)
        beamRef.current.position.z = -beamRef.current.scale.z / 2
      }
    } else if (wandState === 'charging') {
      // Shaking while charging
      const shake = Math.sin(state.clock.elapsedTime * 40) * 0.05
      wandRef.current.position.lerp(new THREE.Vector3(targetX + shake, targetY + shake, 2.5), delta * 5)
      wandRef.current.rotation.x = THREE.MathUtils.lerp(wandRef.current.rotation.x, Math.PI / 8, delta * 5)
      
      if (beamRef.current) beamRef.current.scale.z = 0
    } else {
      // Idle
      wandRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 3), delta * 4)
      wandRef.current.rotation.x = THREE.MathUtils.lerp(wandRef.current.rotation.x, state.pointer.y * 0.2, delta * 4)
      wandRef.current.rotation.y = THREE.MathUtils.lerp(wandRef.current.rotation.y, state.pointer.x * -0.2, delta * 4)
      
      if (beamRef.current) beamRef.current.scale.z = 0
    }
  })

  return (
    <group ref={wandRef} position={[0, -1.5, 3]}>
      {/* The Wand Model */}
      <group scale={0.5} rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={scene} />
      </group>

      {/* The Wand Tip (where magic originates) */}
      <group ref={tipRef} position={[0, 0, -2.2]}>
        {/* Charging Sparkles */}
        {wandState === 'charging' && (
          <Sparkles count={100} scale={1} size={8} speed={3} opacity={1} color="#00ffff" />
        )}

        {/* The Spell Beam */}
        <mesh ref={beamRef} rotation={[0, 0, 0]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.05, 1, 16]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} />
          {/* Inner core for extreme brightness */}
          <mesh>
            <cylinderGeometry args={[0.08, 0.02, 1, 16]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </mesh>

        <pointLight intensity={wandState === 'charging' ? 2 : (wandState === 'casting' ? 10 : 0)} color="#00ffff" distance={10} />
      </group>
    </group>
  )
}
