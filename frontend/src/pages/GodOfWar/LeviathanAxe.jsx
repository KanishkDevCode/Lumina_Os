import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Trail, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import FimbulwinterSnow from './FimbulwinterSnow'

// 🚀 REWRITTEN: Safer, highly performant particle burst
function SlamParticles({ triggerCount, targetRef }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [isActive, setIsActive] = useState(false);

  // Pre-generate particle math
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 200; i++) {
      temp.push({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 8 + 4,       // Outward explosion speed
        life: Math.random() * 0.4 + 0.3,    // Shorter, snappier life
        verticalSpeed: Math.random() * 4 + 1, // Bounces upward
        progress: 1.1, // Start "dead"
        startX: 0, startY: 0, startZ: 0
      });
    }
    return temp;
  }, []);

  // When triggered, reset all particles to the impact point
  useEffect(() => {
    if (triggerCount > 0 && targetRef?.current) {
      const impactPos = targetRef.current.position;
      particles.forEach(p => {
        p.progress = 0;
        p.startX = impactPos.x;
        p.startY = impactPos.y;
        p.startZ = impactPos.z;
      });
      setIsActive(true);
    }
  }, [triggerCount, particles, targetRef]);

  useFrame((state, delta) => {
    if (!isActive || !meshRef.current) return;

    let allDead = true;

    particles.forEach((p, i) => {
      if (p.progress < 1.0) {
        allDead = false;
        p.progress += delta / p.life;

        // Calculate physics
        const distance = p.speed * (p.progress * p.life);
        dummy.position.set(
          p.startX + Math.cos(p.angle) * distance,
          p.startY + (p.verticalSpeed * (p.progress * p.life)),
          p.startZ + Math.sin(p.angle) * distance
        );

        // Shrink as they die
        const scale = Math.max(0, (1.0 - p.progress) * 1.5);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        // Keep dead particles invisible
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (allDead) setIsActive(false); // Stop rendering loop when done
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, 200]} visible={isActive}>
      <sphereGeometry args={[0.08, 8, 8]} />
      {/* 🚀 FIX: meshBasicMaterial does not support emissive. Use toneMapped={false} for pure glow! */}
      <meshBasicMaterial color="#00ffff" toneMapped={false} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

export default function LeviathanAxe({ appState, setHudState, triggerShake, setIsAiming, weaponPath, environmentRef }) {
  const axeRef = useRef()
  const [state, setState] = useState(appState === 'FORGING' ? 'forging' : 'idle')

  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const chargeLevel = useRef(0)
  const recallCurve = useRef(null)
  const recallProgress = useRef(0)

  const slashProgress = useRef(0)

  // 🚀 NEW: A guard ref to prevent the infinite crash loop!
  const hasSlammed = useRef(false)
  
  // 🚀 OPTIMIZATION: Track the last percent so we don't spam DOM updates
  const lastChargePercent = useRef(-1)

  const auraRef = useRef()
  const auraScale = useRef(1)

  const materializeProgress = useRef(0)
  const trajectoryRef = useRef()
  const impactMarkerRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // To track where the user is aiming in 3D space
  const pointerRef = useRef(new THREE.Vector2())
  const cameraRef = useRef()

  // 🚀 FIX: Changed to a safe counter instead of a timestamp to avoid render loops
  const [slamTriggerCount, setSlamTriggerCount] = useState(0);
  const hasRestoredOpacity = useRef(false);

  // 🚀 NEW: Raycaster for dynamic environment collision
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const throwDirection = useMemo(() => new THREE.Vector3(), [])

  const { scene } = useGLTF(weaponPath)

  const sounds = useMemo(() => {
    try {
      return {
        throw: new Audio('/sound_effects/throw.mp3'),
        catch: new Audio('/sound_effects/catch.mp3'),
        slam: new Audio('/sound_effects/slam.mp3')
      }
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (sounds) {
      sounds.throw.volume = 0.8
      sounds.catch.volume = 1.0
      sounds.slam.volume = 1.0
    }
  }, [sounds])

  const playSound = (audio) => {
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(e => console.log("Audio blocked.", e))
    }
  }

  useEffect(() => {
    if (appState === 'PLAYING' && state === 'forging') setState('idle')
  }, [appState, state])

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 0 && state === 'idle') {
        setState('charging')
        setHudState("ABSORBING FROST...")
        setIsAiming(true)
      }
    }

    const handleMouseUp = (e) => {
      if (e.button === 0 && state === 'charging') {
        if (chargeLevel.current >= 0.99) {
          setState('thrown')
          setHudState("PROJECTILE AIRBORNE")
          setIsAiming(false)
          playSound(sounds?.throw)

          const force = 80 + (chargeLevel.current * 70)

          // 🚀 FIX: Precise 3D Aiming! Throw exactly where the crosshair is pointing!
          if (cameraRef.current) {
            const aimRaycaster = new THREE.Raycaster();
            aimRaycaster.setFromCamera(pointerRef.current, cameraRef.current);

            let targetPoint = new THREE.Vector3();
            if (environmentRef?.current) {
              const hits = aimRaycaster.intersectObject(environmentRef.current, true);
              if (hits.length > 0) {
                targetPoint.copy(hits[0].point); // Aim at exactly what we clicked on
              } else {
                aimRaycaster.ray.at(200, targetPoint); // Aim far away into the sky
              }
            } else {
              aimRaycaster.ray.at(200, targetPoint);
            }

            // Calculate direction from axe to the target point
            const dir = targetPoint.clone().sub(axeRef.current.position).normalize();
            velocity.current.copy(dir).multiplyScalar(force);
          } else {
            // Fallback
            velocity.current.set(0, 10, -force)
          }

          chargeLevel.current = 0
          lastChargePercent.current = 0

          const frostBar = document.getElementById('frost-surge-bar');
          if (frostBar) frostBar.style.width = '0%';
          const frostText = document.getElementById('frost-surge-text');
          if (frostText) frostText.innerText = '0%';

          triggerShake(0.6, 150)
        } else {
          setState('slash')
          setHudState("LIGHT SLASH")
          setIsAiming(false)
          chargeLevel.current = 0
          lastChargePercent.current = 0

          const frostBar = document.getElementById('frost-surge-bar');
          if (frostBar) frostBar.style.width = '0%';
          const frostText = document.getElementById('frost-surge-text');
          if (frostText) frostText.innerText = '0%';

          slashProgress.current = 0
          triggerShake(0.2, 150)
          playSound(sounds?.throw)
        }
      }
    }

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      if (key === 'r' && (state === 'thrown' || state === 'stuck')) {
        setState('recalling')
        setHudState("RECALL INITIATED")
        recallProgress.current = 0
        playSound(sounds?.throw)

        if (axeRef.current) {
          const start = axeRef.current.position.clone()
          const end = new THREE.Vector3(0, 2, 0)
          const control = new THREE.Vector3(15, 6, (start.z + end.z) / 2)
          recallCurve.current = new THREE.QuadraticBezierCurve3(start, control, end)
        }
      }
      if (key === 'shift' && state === 'idle') {
        hasSlammed.current = false; // 🚀 Reset the guard!
        setState('slam')
        setHudState("HEAVY SLAM")
        velocity.current.set(0, 20, 0)
        triggerShake(0.8, 300);
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [state, setHudState, triggerShake, setIsAiming, sounds])

  useFrame((ctx, delta) => {
    pointerRef.current.copy(ctx.pointer)
    cameraRef.current = ctx.camera

    if (!axeRef.current) return

    const mouseX = ctx.pointer.x * 12
    const mouseY = (ctx.pointer.y * 8) + 2

    if (auraRef.current) {
      const targetScale = (state === 'idle') ? 1 : 0
      auraScale.current = THREE.MathUtils.lerp(auraScale.current, targetScale, delta * 5)
      auraRef.current.scale.setScalar(auraScale.current)
    }

    if (state === 'forging') {
      hasRestoredOpacity.current = false;
      materializeProgress.current = THREE.MathUtils.lerp(materializeProgress.current, 1, delta * 1.5)
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true
          child.material.opacity = materializeProgress.current
        }
      })
      axeRef.current.position.set(0, 2 + Math.sin(ctx.clock.elapsedTime * 5) * 0.1, 0)
      axeRef.current.rotation.x = THREE.MathUtils.lerp(axeRef.current.rotation.x, 0, 0.1)
      axeRef.current.rotation.y += delta * 2
      return
    } else if (!hasRestoredOpacity.current) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) child.material.opacity = 1
      })
      hasRestoredOpacity.current = true;
    }

    if (state === 'charging' && trajectoryRef.current && impactMarkerRef.current) {
      const force = 40 + (chargeLevel.current * 50)
      const P0 = axeRef.current.position
      const V0y = 12
      const V0z = -force
      const aY = -40

      const A = 0.5 * aY
      const B = V0y
      const C = P0.y + 1.5
      const discriminant = B * B - 4 * A * C

      if (discriminant > 0) {
        const tImpact = (-B - Math.sqrt(discriminant)) / (2 * A)
        for (let i = 0; i < 30; i++) {
          const t = (i / 29) * tImpact
          const px = P0.x
          const py = P0.y + V0y * t + 0.5 * aY * t * t
          const pz = P0.z + V0z * t

          dummy.position.set(px, py, pz)
          const scale = 1 - (i / 29) * 0.6
          dummy.scale.set(scale, scale, scale)
          dummy.updateMatrix()
          trajectoryRef.current.setMatrixAt(i, dummy.matrix)
        }
        trajectoryRef.current.instanceMatrix.needsUpdate = true
        trajectoryRef.current.visible = true

        impactMarkerRef.current.position.set(P0.x, -1.48, P0.z + V0z * tImpact)
        impactMarkerRef.current.visible = true
        impactMarkerRef.current.rotation.z -= delta * 4
        const pulse = 1 + chargeLevel.current * 0.8 + Math.sin(ctx.clock.elapsedTime * 10) * 0.1
        impactMarkerRef.current.scale.setScalar(pulse)
      }
    } else {
      if (trajectoryRef.current) trajectoryRef.current.visible = false
      if (impactMarkerRef.current) impactMarkerRef.current.visible = false
    }

    switch (state) {
      case 'idle':
        axeRef.current.position.lerp(new THREE.Vector3(mouseX, mouseY, 0), 0.08)
        axeRef.current.rotation.x = THREE.MathUtils.lerp(axeRef.current.rotation.x, 0, 0.1)
        axeRef.current.rotation.z = THREE.MathUtils.lerp(axeRef.current.rotation.z, -ctx.pointer.x * 0.5, 0.1)
        axeRef.current.rotation.y = THREE.MathUtils.lerp(axeRef.current.rotation.y, 0, 0.1)
        break

      case 'slash':
        slashProgress.current += delta * 4.5;
        const s = Math.min(slashProgress.current, 1);

        const ease = 1 - Math.pow(1 - s, 3);
        const arc = Math.sin(ease * Math.PI);

        const sweepDirection = 1 - (ease * 2);
        const targetX = mouseX + (sweepDirection * 8);
        const targetY = mouseY + (sweepDirection * 2) - (arc * 1.5);
        const targetZ = arc * -6;

        axeRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.6);

        axeRef.current.rotation.x = THREE.MathUtils.lerp(axeRef.current.rotation.x, -Math.PI / 4, 0.4);
        axeRef.current.rotation.y = THREE.MathUtils.lerp(axeRef.current.rotation.y, sweepDirection * -Math.PI, 0.5);
        axeRef.current.rotation.z = THREE.MathUtils.lerp(axeRef.current.rotation.z, -Math.PI / 3, 0.4);

        if (s >= 1) {
          setState('idle');
          setHudState("WEAPON AWAKENED");
        }
        break;

      case 'charging':
        chargeLevel.current = Math.min(chargeLevel.current + delta * 1.5, 1)
        const chargePercent = Math.round(chargeLevel.current * 100);
        
        // 🚀 OPTIMIZATION: Only query the DOM when the number actually changes!
        if (chargePercent !== lastChargePercent.current) {
          lastChargePercent.current = chargePercent;
          const frostBar = document.getElementById('frost-surge-bar');
          if (frostBar) frostBar.style.width = `${chargePercent}%`;
          const frostText = document.getElementById('frost-surge-text');
          if (frostText) frostText.innerText = `${chargePercent}%`;
        }

        axeRef.current.position.x = mouseX + (Math.random() - 0.5) * (chargeLevel.current * 0.3)
        axeRef.current.position.y = mouseY + (Math.random() - 0.5) * (chargeLevel.current * 0.3)
        break

      case 'thrown':
        // Reduce gravity dramatically so the axe flies straighter and hits the pillars instead of the ground
        velocity.current.y -= 15 * delta
        axeRef.current.position.addScaledVector(velocity.current, delta)

        // Aerodynamic Spin: Spin fast around X axis, aligning slightly with velocity
        axeRef.current.rotation.x -= 45 * delta
        axeRef.current.rotation.z = THREE.MathUtils.lerp(axeRef.current.rotation.z, -Math.PI / 8, 0.1)

        // Dynamic 3D Collision Detection
        let isCollided = false;

        if (environmentRef?.current) {
          throwDirection.copy(velocity.current).normalize();
          
          const travelDistance = velocity.current.length() * delta;
          
          raycaster.set(axeRef.current.position, throwDirection);
          
          // 🚀 OPTIMIZATION: Tell Three.js to completely ignore 99% of the map that is far away!
          raycaster.far = travelDistance + 4.0;

          // Check intersection with the loaded environment
          const intersects = raycaster.intersectObject(environmentRef.current, true);

          // Find the first valid solid hit within range (ignoring invisible bounding boxes)
          const validHit = intersects.find(hit => hit.object.visible !== false);

          if (validHit) {

            // Embed axe perfectly into the wall at the exact impact point
            axeRef.current.position.copy(validHit.point);
            axeRef.current.position.addScaledVector(throwDirection, -0.3); // Pull back so handle sticks out

            isCollided = true;
          }
        }

        // Fallback safety net (way down below the map) in case it falls into the void
        if (!isCollided && axeRef.current.position.y <= -50) {
          isCollided = true;
        }

        if (isCollided) {
          setState('stuck')
          setHudState("TARGET IMPACT")
          triggerShake(1.5, 400) // Crunchy impact shake
          playSound(sounds?.slam) // Play a thud sound
        }
        break

      case 'stuck':
        axeRef.current.rotation.z = Math.sin(ctx.clock.elapsedTime * 25) * 0.03
        break

      case 'recalling':
        if (recallCurve.current) {
          recallProgress.current += delta * 1.5
          const t = Math.min(recallProgress.current, 1)

          // Violent Snapping Ease (Exponential easeOut)
          const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

          const newPos = recallCurve.current.getPoint(ease)
          axeRef.current.position.copy(newPos)

          // Spin violently on recall
          axeRef.current.rotation.x += 45 * delta
          axeRef.current.rotation.y += 15 * delta

          if (t >= 1) {
            setState('idle')
            setHudState("WEAPON AWAKENED")
            triggerShake(2.5, 300) // Stronger snap shake
            axeRef.current.rotation.y = 0
            playSound(sounds?.catch)
          }
        }
        break

      case 'slam':
        velocity.current.y -= 60 * delta
        axeRef.current.position.addScaledVector(velocity.current, delta)

        axeRef.current.rotation.x = THREE.MathUtils.lerp(axeRef.current.rotation.x, -Math.PI / 2, 0.25)
        axeRef.current.rotation.y = THREE.MathUtils.lerp(axeRef.current.rotation.y, Math.PI / 2, 0.1)
        axeRef.current.rotation.z = THREE.MathUtils.lerp(axeRef.current.rotation.z, Math.sin(ctx.clock.elapsedTime * 20) * 0.1, 0.2)

        let isSlammed = false;

        // Dynamic 3D Ground Collision Detection
        if (environmentRef?.current) {
          throwDirection.set(0, -1, 0); // Raycast straight down
          
          const travelDistance = Math.abs(velocity.current.y) * delta;
          
          raycaster.set(axeRef.current.position, throwDirection);
          
          // 🚀 OPTIMIZATION: Tell Three.js to completely ignore 99% of the map that is far away!
          raycaster.far = travelDistance + 0.5;

          const intersects = raycaster.intersectObject(environmentRef.current, true);

          if (intersects.length > 0 && intersects[0].distance < travelDistance + 0.5) {
            axeRef.current.position.copy(intersects[0].point);
            isSlammed = true;
          }
        }

        // Safety net just in case there is no floor model underneath
        if (!isSlammed && axeRef.current.position.y <= -20) {
          axeRef.current.position.y = -20;
          isSlammed = true;
        }

        if (isSlammed) {
          // 🚀 FIX: The Guard! This prevents the infinite render loop crash.
          if (!hasSlammed.current) {
            hasSlammed.current = true;

            setState('stuck')
            setHudState("SEISMIC IMPACT")

            axeRef.current.rotation.x = -Math.PI / 2;
            axeRef.current.rotation.y = Math.PI / 2;
            axeRef.current.rotation.z = 0;

            triggerShake(2.5, 500)
            playSound(sounds?.slam)

            // Hit stop delay for particles to simulate immense weight
            setTimeout(() => {
              setSlamTriggerCount(prev => prev + 1);
              triggerShake(3.5, 600) // Secondary intense shake
            }, 150)
          }
        }
        break
    }
  })

  return (
    <>
      <FimbulwinterSnow count={7000} axePosition={axeRef.current?.position} axeVelocity={velocity.current} />

      <instancedMesh ref={trajectoryRef} args={[null, null, 30]} visible={false}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} transparent opacity={1.0} />
      </instancedMesh>

      <group ref={impactMarkerRef} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 1.0, 32]} />
          <meshBasicMaterial color="#00ffff" toneMapped={false} transparent opacity={0.8} />
        </mesh>
      </group>

      <group ref={axeRef}>
        {(state === 'thrown' || state === 'recalling' || state === 'slam' || state === 'slash') && (
          <Trail width={6} length={25} color={'#00ffff'} attenuation={(t) => t * t}>
            <mesh visible={false}><boxGeometry /></mesh>
          </Trail>
        )}

        <group ref={auraRef}>
          <Sparkles count={80} scale={2.5} size={5} speed={1.0} opacity={0.9} color="#aaddff" />
        </group>

        <group position={[0, -0.5, 0]}>
          <group scale={6} rotation={[0, 0, 0]}>
            <primitive object={scene} />
          </group>
        </group>
      </group>

      {/* 🚀 Pass the safe trigger and current axe ref down */}
      <SlamParticles triggerCount={slamTriggerCount} targetRef={axeRef} />
    </>
  )
}