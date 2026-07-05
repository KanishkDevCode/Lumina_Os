import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function HiddenBlade({ isAssassinating, targetPos }) {
  const bladeRef = useRef()
  const { scene } = useGLTF('/models/hidden_blade_draco.glb')

  // Audio setup
  const sounds = {
    shing: new Audio('/sound_effects/shing.mp3'),
    eagle: new Audio('/sound_effects/eagle.mp3'),
  }

  useEffect(() => {
    Object.values(sounds).forEach(audio => { audio.volume = 0.8 })
  }, [])

  const playSound = (audio) => {
    try {
      audio.currentTime = 0
      audio.play().catch(() => { })
    } catch { }
  }

  useEffect(() => {
    if (isAssassinating) {
      playSound(sounds.shing)
      playSound(sounds.eagle)
    }
  }, [isAssassinating])

  useFrame((state, delta) => {
    if (!bladeRef.current) return

    const camera = state.camera

    if (isAssassinating) {
      // Thrust blade aggressively down into the target
      bladeRef.current.position.lerp(new THREE.Vector3(targetPos.x, targetPos.y + 0.5, targetPos.z), delta * 25)

      // Point it downwards
      const lookTarget = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
      bladeRef.current.lookAt(lookTarget)
    } else {
      // Stay attached to the camera in first person (Air Assassination view)
      // Offset values: X (right), Y (up/down), Z (forward/back relative to camera)
      const targetOffset = new THREE.Vector3(
        (state.pointer.x * 0.2) + 0.8, // Right side of screen
        (state.pointer.y * 0.2) - 0.5, // Slightly below center
        -2.0 // 2 units in front of the camera lens
      )

      // Convert local offset to world position so it follows the camera!
      targetOffset.applyMatrix4(camera.matrixWorld)

      bladeRef.current.position.lerp(targetOffset, delta * 12)

      // Match camera rotation so it points where we are looking, plus slight sway
      const targetQuat = camera.quaternion.clone()
      bladeRef.current.quaternion.slerp(targetQuat, delta * 12)
    }
  })

  return (
    <group ref={bladeRef}>
      <group scale={1} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
