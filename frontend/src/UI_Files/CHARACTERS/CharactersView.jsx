import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float, useGLTF } from '@react-three/drei';
import { THEMES } from '../shared/gameData';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

// Placeholder Model Component
function CharacterModel({ url, scale, pivot = [0, 0, 0], animClass }) {
  const { scene } = useGLTF(url);
  
  const { clonedScene, hitboxRadius } = React.useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const rawRadius = (maxDim / 2) || 1;

    const pivotOffset = new THREE.Vector3(...pivot);
    center.sub(pivotOffset);
    
    clone.position.sub(center);
    return { clonedScene: clone, hitboxRadius: rawRadius };
  }, [scene, pivot]);

  // Apply a uniform 0.8 multiplier to make them slightly smaller to fit the Characters left panel
  const adjustedScale = scale * 0.8;

  const spinRef = useRef();
  const { pointer } = useThree();

  const isDragging = useRef(false);
  const previousQuat = useRef(new THREE.Quaternion());
  const currentQuat = useRef(new THREE.Quaternion());
  const startVector = useRef(new THREE.Vector3());

  useEffect(() => {
    currentQuat.current.identity();
    if (spinRef.current) spinRef.current.quaternion.identity();
  }, [url]);

  const getArcballVector = (ptr) => {
      const x = ptr.x;
      const y = ptr.y;
      const rSq = x * x + y * y;
      if (rSq <= 1) {
          return new THREE.Vector3(x, y, Math.sqrt(1 - rSq));
      } else {
          const r = Math.sqrt(rSq);
          return new THREE.Vector3(x / r, y / r, 0).normalize();
      }
  };

  const handlePointerDown = (e) => {
      e.stopPropagation();
      e.target.setPointerCapture(e.pointerId);
      isDragging.current = true;
      startVector.current.copy(getArcballVector(pointer));
      previousQuat.current.copy(currentQuat.current);
  };

  const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      e.stopPropagation();
      const currentVector = getArcballVector(pointer);
      const deltaQuat = new THREE.Quaternion().setFromUnitVectors(startVector.current, currentVector);
      currentQuat.current.copy(deltaQuat).multiply(previousQuat.current);
  };

  const handlePointerUp = (e) => {
      if (isDragging.current) {
          e.target.releasePointerCapture(e.pointerId);
          isDragging.current = false;
      }
  };

  // Animate 3D Model Entrance
  const spawnPos = useRef(new THREE.Vector3());
  const spawnScale = useRef(new THREE.Vector3(1, 1, 1));
  const warpSpin = useRef(0);

  useEffect(() => {
    // 'Warp' Stretch & Spin Effect
    if (animClass === 'slide-in-up') {
      spawnPos.current.set(0, -12, 0);
      spawnScale.current.set(0.05, 4, 0.05);
      warpSpin.current = Math.PI * 2;
    } else if (animClass === 'slide-in-down') {
      spawnPos.current.set(0, 10, 0);
      spawnScale.current.set(0.05, 4, 0.05);
      warpSpin.current = -Math.PI * 2;
    } else if (animClass === 'slide-in-left') {
      spawnPos.current.set(12, -1, 0);
      spawnScale.current.set(4, 0.05, 0.05);
      warpSpin.current = Math.PI * 2;
    } else if (animClass === 'slide-in-right') {
      spawnPos.current.set(-12, -1, 0);
      spawnScale.current.set(4, 0.05, 0.05);
      warpSpin.current = -Math.PI * 2;
    } else {
      spawnPos.current.set(0, -1, 0);
      spawnScale.current.set(1, 1, 1);
      warpSpin.current = 0;
    }
    
    if (spinRef.current) {
      spinRef.current.position.copy(spawnPos.current);
      spinRef.current.scale.copy(spawnScale.current);
    }
  }, [url, animClass]);

  useFrame((state, delta) => {
      if (spinRef.current) {
          // Snap position back to center
          spawnPos.current.lerp(new THREE.Vector3(0, -1, 0), 0.12);
          spinRef.current.position.copy(spawnPos.current);
          
          // Snap scale back to normal
          spawnScale.current.lerp(new THREE.Vector3(1, 1, 1), 0.18);
          spinRef.current.scale.copy(spawnScale.current);

          // Dampen warp spin
          warpSpin.current = THREE.MathUtils.lerp(warpSpin.current, 0, 0.15);
          
          spinRef.current.quaternion.slerp(currentQuat.current, 0.2);

          // Apply high-speed warp spin on top of normal rotation
          if (Math.abs(warpSpin.current) > 0.01) {
             const warpQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), warpSpin.current);
             spinRef.current.quaternion.multiply(warpQuat);
          }
          
          if (!isDragging.current) {
              const autoSpinQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.1);
              currentQuat.current.premultiply(autoSpinQuat);
          }
      }
  });

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <group position={[0, 0, 0]}>
          <group ref={spinRef}>
              <group rotation={[0, Math.PI / 2, 0]} scale={adjustedScale}>
                  <primitive object={clonedScene} />
              </group>
          </group>
          <mesh
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOut={handlePointerUp}
          >
              <sphereGeometry args={[Math.min(hitboxRadius * adjustedScale * 1.5, 10), 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
      </group>
    </Float>
  );
}

const GAME_ORDER = ['GOW', 'AC', 'HL', 'RDR', 'HITMAN'];

const CHARACTER_ROSTER = {
  GOW: [
    { id: '001', name: "KRATOS", role: "Protagonist", lore: "The Ghost of Sparta. A demigod whose rage once tore down Olympus, now seeking a quiet life in the Norse realm, only to be drawn back into the fray by the gods of Asgard.", model: "/models/axe_draco.glb", scale: 5 },
    { id: '002', name: "ATREUS", role: "Archer / Companion", lore: "Son of Kratos. A young boy discovering his divine heritage and learning what it means to be a god, all while struggling to find his place in a harsh world.", model: "/models/axe_draco.glb", scale: 5 }
  ],
  AC: [
    { id: '003', name: "ALTAÏR IBN-LA'AHAD", role: "Master Assassin", lore: "A legendary Syrian Assassin during the Third Crusade. His actions reformed the Brotherhood and laid the foundation for the modern Creed.", model: "/models/hidden_blade_draco.glb", scale: 2 },
    { id: '004', name: "EZIO AUDITORE", role: "Master Assassin", lore: "A charismatic Florentine noble who became a Master Assassin to exact vengeance on the Templars for the murder of his family.", model: "/models/hidden_blade_draco.glb", scale: 2 },
    { id: '005', name: "CONNOR KENWAY", role: "Master Assassin", lore: "A Native American Assassin during the American Revolution. He fought for freedom and the survival of his people against Templar manipulation.", model: "/models/hidden_blade_draco.glb", scale: 2 }
  ],
  HL: [
    { id: '006', name: "HARRY POTTER", role: "Student", lore: "The Boy Who Lived. (Placeholder for custom character). A student possessing the rare ability to perceive and wield ancient magic.", model: "/models/wand_draco.glb", scale: 2.3, pivot: [-0.5, 0, 0] }
  ],
  RDR: [
    { id: '007', name: "ARTHUR MORGAN", role: "Outlaw", lore: "A senior gun in the Van der Linde gang. As the era of outlaws comes to an end, Arthur must choose between his own ideals and his loyalty to the gang.", model: "/models/revolver_draco.glb", scale: 29 },
    { id: '008', name: "JOHN MARSTON", role: "Outlaw", lore: "A core member of the Van der Linde gang. Seeking a better life for his family, he is forced to hunt down his former brothers in arms.", model: "/models/revolver_draco.glb", scale: 29 }
  ],
  HITMAN: [
    { id: '009', name: "AGENT 47", role: "Assassin", lore: "A genetically enhanced clone engineered to be the perfect assassin. Known only by the barcode on the back of his head, he works for the ICA.", model: "/models/pistol_draco.glb", scale: 0.35 }
  ]
};

export default function CharactersView() {
  const { activeGameId, setActiveGameId } = useStore();
  const [activeCharIndex, setActiveCharIndex] = useState(0);

  const currentRoster = CHARACTER_ROSTER[activeGameId] || CHARACTER_ROSTER['GOW'];
  // Ensure the index doesn't go out of bounds if switching to a game with fewer characters
  const char = currentRoster[activeCharIndex] || currentRoster[0];

  const gameTheme = THEMES[activeGameId] || THEMES['GOW'];
  const color = gameTheme.primary;
  const gameName = gameTheme.title;

  const [animClass, setAnimClass] = useState('fade-in');

  // --- 2D NAVIGATION LOGIC ---
  const activeGameIndex = GAME_ORDER.indexOf(activeGameId);

  const switchGame = (direction) => {
    setAnimClass(direction > 0 ? 'slide-in-up' : 'slide-in-down');
    let newIdx = activeGameIndex + direction;
    if (newIdx < 0) newIdx = GAME_ORDER.length - 1;
    if (newIdx >= GAME_ORDER.length) newIdx = 0;
    setActiveGameId(GAME_ORDER[newIdx]);
    setActiveCharIndex(0); // Reset character when game changes
  };

  const switchChar = (direction) => {
    setAnimClass(direction > 0 ? 'slide-in-left' : 'slide-in-right');
    let newIdx = activeCharIndex + direction;
    if (newIdx < 0) newIdx = currentRoster.length - 1;
    if (newIdx >= currentRoster.length) newIdx = 0;
    setActiveCharIndex(newIdx);
  };

  // Touch / Mouse Swipe Logic
  const [touchStart, setTouchStart] = useState(null);
  const minSwipeDistance = 50;

  const onPointerDown = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setTouchStart({ x: clientX, y: clientY });
  };

  const onPointerUp = (e) => {
    if (!touchStart) return;
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

    const diffX = touchStart.x - clientX;
    const diffY = touchStart.y - clientY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal Swipe -> Characters
      if (diffX > minSwipeDistance) switchChar(1);
      else if (diffX < -minSwipeDistance) switchChar(-1);
    } else {
      // Vertical Swipe -> Games
      if (diffY > minSwipeDistance) switchGame(1);
      else if (diffY < -minSwipeDistance) switchGame(-1);
    }
    setTouchStart(null);
  };

  // Wheel Scroll for Games
  const onWheel = (e) => {
    if (e.deltaY > 50) switchGame(1);
    else if (e.deltaY < -50) switchGame(-1);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') switchChar(1);
      if (e.key === 'ArrowLeft') switchChar(-1);
      if (e.key === 'ArrowDown') switchGame(1);
      if (e.key === 'ArrowUp') switchGame(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGameIndex, activeCharIndex]);

  return (
    <main
      className="scroll-container"
      style={{ position: 'relative', display: 'flex', height: '100%', overflow: 'hidden' }}
      onWheel={onWheel}
    >
      {/* DYNAMIC COLOR BACKGROUND */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `radial-gradient(circle at center, ${gameTheme.bgGlow} 0%, ${gameTheme.bgCore} 80%)`,
        transition: 'background 0.8s ease-in-out'
      }}>
        {/* Scanlines / Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.015) 4px, rgba(255,255,255,0.015) 8px)', pointerEvents: 'none' }} />
      </div>

      {/* LEFT: 3D MODEL VIEWER & CAROUSEL */}
      <div
        style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}
        onMouseDown={onPointerDown}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchEnd={onPointerUp}
      >
        <Suspense fallback={
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, letterSpacing: '4px', fontSize: '12px' }}>
            LOADING BIOMETRICS...
          </div>
        }>
          <Canvas camera={{ position: [0, 1, 8], fov: 45 }} style={{ cursor: 'grab' }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={color} />
            <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />

            <CharacterModel url={char.model} scale={char.scale} pivot={char.pivot} key={char.model} animClass={animClass} />

            <Environment preset="city" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          </Canvas>
        </Suspense>

        {/* Vertical Game Indicators (Left Side) */}
        <div style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10 }}>
          <button onClick={() => switchGame(-1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px', padding: '10px' }}>&#9650;</button>

          {GAME_ORDER.map((g, i) => (
            <div key={g} style={{
              width: '4px', height: i === activeGameIndex ? '40px' : '15px',
              background: i === activeGameIndex ? color : 'rgba(255,255,255,0.1)',
              boxShadow: i === activeGameIndex ? `0 0 10px ${color}` : 'none',
              borderRadius: '2px', transition: 'all 0.3s', margin: '0 auto'
            }} />
          ))}

          <button onClick={() => switchGame(1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '18px', padding: '10px' }}>&#9660;</button>
        </div>

        {/* Horizontal Character Arrows */}
        {currentRoster.length > 1 && (
          <>
            <button onClick={() => switchChar(-1)} style={{
              position: 'absolute', left: '100px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: `1px solid ${color}`, borderRadius: '50%',
              width: '50px', height: '50px', color: color, fontSize: '20px', cursor: 'pointer',
              backdropFilter: 'blur(10px)', transition: '0.3s', zIndex: 10
            }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'rgba(0,0,0,0.4)'}>
              &#10094;
            </button>
            <button onClick={() => switchChar(1)} style={{
              position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.4)', border: `1px solid ${color}`, borderRadius: '50%',
              width: '50px', height: '50px', color: color, fontSize: '20px', cursor: 'pointer',
              backdropFilter: 'blur(10px)', transition: '0.3s', zIndex: 10
            }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.target.style.background = 'rgba(0,0,0,0.4)'}>
              &#10095;
            </button>
          </>
        )}

        {/* Swipe Hint */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '4px', pointerEvents: 'none', textAlign: 'center' }}>
          SWIPE ◄ ► FOR CHARACTERS<br />
          SCROLL ▲ ▼ FOR GAMES
        </div>
      </div>

      {/* RIGHT: CHARACTER INFO PANEL */}
      <div style={{
        width: '450px', position: 'relative', zIndex: 1,
        background: 'rgba(10, 15, 25, 0.2)', borderLeft: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(25px)', padding: '50px 40px', display: 'flex', flexDirection: 'column'
      }}>
        
        <div key={char.id} className={animClass} style={{ display: 'flex', flexDirection: 'column', flex: 1, animationDuration: '0.6s', animationFillMode: 'both' }}>
          <div style={{ fontSize: '10px', color: color, letterSpacing: '3px', fontWeight: 600, marginBottom: '10px', transition: 'color 0.5s ease' }}>
            SUBJECT PROFILE // {char.id}
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '2px', marginBottom: '5px', textShadow: `0 0 20px ${color}40`, transition: '0.5s ease' }}>
            {char.name}
          </h1>

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '40px' }}>
            ORIGIN: <span style={{ color: 'white', transition: '0.5s ease' }}>{gameName}</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>CLASSIFICATION</div>
            <div style={{ fontSize: '14px', letterSpacing: '1px', color: 'white', transition: '0.5s ease' }}>{char.role}</div>
          </div>

          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>BACKGROUND LORE</div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 'auto', transition: '0.5s ease' }}>
            {char.lore}
          </p>
        </div>

        {/* Character Selector Map (Only show if > 1 char) */}
        {currentRoster.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
            {currentRoster.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setActiveCharIndex(i)}
                style={{
                  flex: 1, height: '4px', cursor: 'pointer',
                  background: i === activeCharIndex ? color : 'rgba(255,255,255,0.1)',
                  boxShadow: i === activeCharIndex ? `0 0 10px ${color}` : 'none',
                  transition: '0.3s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .slide-in-up { animation: slide-in-up 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .slide-in-down { animation: slide-in-down 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .slide-in-left { animation: slide-in-left 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .slide-in-right { animation: slide-in-right 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .fade-in { animation: fade-in 0.7s ease-out; }

        @keyframes slide-in-up {
          0% { transform: translateY(100px) scale(0.8); opacity: 0; filter: blur(20px) brightness(2); }
          50% { transform: translateY(-10px) scale(1.02); opacity: 1; filter: blur(2px) brightness(1.5); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px) brightness(1); }
        }
        @keyframes slide-in-down {
          0% { transform: translateY(-100px) scale(0.8); opacity: 0; filter: blur(20px) brightness(2); }
          50% { transform: translateY(10px) scale(1.02); opacity: 1; filter: blur(2px) brightness(1.5); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px) brightness(1); }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(120px) skewX(-15deg); opacity: 0; filter: blur(15px) brightness(2); }
          50% { transform: translateX(-15px) skewX(8deg); opacity: 1; filter: blur(2px) brightness(1.3); }
          75% { transform: translateX(5px) skewX(-3deg); filter: blur(0) brightness(1); }
          100% { transform: translateX(0) skewX(0); opacity: 1; filter: blur(0) brightness(1); }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(-120px) skewX(15deg); opacity: 0; filter: blur(15px) brightness(2); }
          50% { transform: translateX(15px) skewX(-8deg); opacity: 1; filter: blur(2px) brightness(1.3); }
          75% { transform: translateX(-5px) skewX(3deg); filter: blur(0) brightness(1); }
          100% { transform: translateX(0) skewX(0); opacity: 1; filter: blur(0) brightness(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; filter: blur(10px); }
          100% { opacity: 1; filter: blur(0); }
        }
      `}</style>
    </main>
  );
}
