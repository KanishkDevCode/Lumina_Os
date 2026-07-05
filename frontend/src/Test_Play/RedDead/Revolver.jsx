import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function Revolver({ duelState, onFire }) {
  const gunRef = useRef()
  const muzzleRef = useRef()
  const { scene } = useGLTF('/models/revolver_draco.glb')

  const [muzzleFlash, setMuzzleFlash] = useState(false)

  const sounds = {
    draw: new Audio('/sound_effects/draw.mp3'),
    shot: new Audio('/sound_effects/shot.mp3'),
    jam: new Audio('/sound_effects/jam.mp3')
  }

  useEffect(() => {
    Object.values(sounds).forEach(audio => { audio.volume = 0.8 })
  }, [])

  const playSound = (audio) => {
    try {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (duelState === 'FIRED') {
      playSound(sounds.shot)
      setMuzzleFlash(true)
      setTimeout(() => setMuzzleFlash(false), 50)
    } else if (duelState === 'MISFIRE') {
      playSound(sounds.jam)
    }
  }, [duelState])

  useFrame((state, delta) => {
    if (!gunRef.current) return

    if (duelState === 'FIRED') {
      // Recoil
      gunRef.current.position.lerp(new THREE.Vector3(1, -1, 3.5), delta * 15)
      gunRef.current.rotation.x = THREE.MathUtils.lerp(gunRef.current.rotation.x, -Math.PI / 4, delta * 20)
    } else if (duelState === 'DRAW' || duelState === 'MISFIRE') {
      // Snapped to aiming position
      gunRef.current.position.lerp(new THREE.Vector3(1.5, -1.5, 4), delta * 10)
      gunRef.current.rotation.x = THREE.MathUtils.lerp(gunRef.current.rotation.x, 0, delta * 10)
    } else {
      // Holstered (Low on screen, pointing slightly down)
      gunRef.current.position.lerp(new THREE.Vector3(2.5, -3, 3), delta * 5)
      gunRef.current.rotation.x = THREE.MathUtils.lerp(gunRef.current.rotation.x, Math.PI / 6, delta * 5)
      
      // Idle sway
      gunRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.005
    }
  })

  return (
    <group ref={gunRef} position={[2.5, -3, 3]}>
      {/* Revolver Model */}
      <group scale={8} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={scene} />
      </group>

      {/* Muzzle Flash Point */}
      <group ref={muzzleRef} position={[-0.2, 0.5, -2.5]}>
        {muzzleFlash && (
          <>
            <pointLight intensity={20} distance={10} color="#ffaa00" />
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.3, 1, 8]} />
              <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} toneMapped={false} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}
