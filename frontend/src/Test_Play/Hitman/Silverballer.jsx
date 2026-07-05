import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function Silverballer({ isFiring }) {
  const gunRef = useRef()
  const { scene } = useGLTF('/models/pistol_draco.glb')

  const sounds = {
    shoot: new Audio('/sound_effects/silenced.mp3'),
  }

  useEffect(() => {
    sounds.shoot.volume = 0.8
  }, [])

  const playSound = (audio) => {
    try {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    if (isFiring) {
      playSound(sounds.shoot)
    }
  }, [isFiring])

  useFrame((state, delta) => {
    if (!gunRef.current) return

    const targetX = state.pointer.x * 3
    const targetY = state.pointer.y * 3 - 1

    if (isFiring) {
      // Snappy precision recoil
      gunRef.current.position.lerp(new THREE.Vector3(targetX, targetY + 0.5, 4.5), delta * 30)
      gunRef.current.rotation.x = THREE.MathUtils.lerp(gunRef.current.rotation.x, -Math.PI / 12, delta * 30)
    } else {
      // Smooth tracking
      gunRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 4), delta * 10)
      
      // Slight sway
      gunRef.current.rotation.x = THREE.MathUtils.lerp(gunRef.current.rotation.x, state.pointer.y * 0.1, delta * 10)
      gunRef.current.rotation.y = THREE.MathUtils.lerp(gunRef.current.rotation.y, Math.PI + state.pointer.x * -0.1, delta * 10)
    }
  })

  return (
    <group ref={gunRef} position={[0, -1, 4]} rotation={[0, Math.PI, 0]}>
      {/* Pistol Model */}
      <group scale={3.5} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
