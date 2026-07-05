import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float, RoundedBox, OrbitControls } from '@react-three/drei';
import { THEMES } from '../shared/gameData';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

// Holographic Trading Card Component
function HologramCard({ char, animClass }) {
  const { glowColor, roughness, metalness, image } = char;
  const [charTexture, setCharTexture] = useState(null);

  // Load the full card image (user provided)
  useEffect(() => {
    if (!image) { setCharTexture(null); return; }
    const loader = new THREE.TextureLoader();
    loader.load(
      image,
      (txt) => {
        txt.colorSpace = THREE.SRGBColorSpace;
        setCharTexture(txt);
      },
      undefined,
      (err) => {
        console.error(`Failed to load image: ${image}`, err);
        setCharTexture(null);
      }
    );
  }, [image]);

  const cardRef = useRef();
  const spawnPos = useRef(new THREE.Vector3());
  const spawnScale = useRef(new THREE.Vector3(1, 1, 1));
  const warpSpin = useRef(0);

  useEffect(() => {
    if (animClass === 'slide-in-up') {
      spawnPos.current.set(0, -12, 0); spawnScale.current.set(0.05, 4, 0.05); warpSpin.current = Math.PI * 2;
    } else if (animClass === 'slide-in-down') {
      spawnPos.current.set(0, 10, 0); spawnScale.current.set(0.05, 4, 0.05); warpSpin.current = -Math.PI * 2;
    } else if (animClass === 'slide-in-left') {
      spawnPos.current.set(12, -1, 0); spawnScale.current.set(4, 0.05, 0.05); warpSpin.current = Math.PI * 2;
    } else if (animClass === 'slide-in-right') {
      spawnPos.current.set(-12, -1, 0); spawnScale.current.set(4, 0.05, 0.05); warpSpin.current = -Math.PI * 2;
    }
    if (cardRef.current) {
      cardRef.current.position.copy(spawnPos.current);
      cardRef.current.scale.copy(spawnScale.current);
    }
  }, [char, animClass]);

  useFrame(() => {
    if (!cardRef.current) return;
    spawnPos.current.lerp(new THREE.Vector3(0, 0, 0), 0.12);
    spawnScale.current.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    warpSpin.current = THREE.MathUtils.lerp(warpSpin.current, 0, 0.1);

    cardRef.current.position.copy(spawnPos.current);
    cardRef.current.scale.copy(spawnScale.current);
    cardRef.current.rotation.y = warpSpin.current;
  });

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={cardRef}>

        {/* MAIN CARD BODY — Flat image mapped onto a 3D box */}
        <RoundedBox args={[3.2, 4.6, 0.12]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color={new THREE.Color(char.glowColor).multiplyScalar(0.3)}
            roughness={0.25}
            metalness={0.7}
            clearcoat={1.0}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>

        {/* PERFECT FLAT FRONT FACE FOR THE IMAGE (Leaves a cool 0.08 bezel) */}
        {charTexture && (
          <mesh position={[0, 0, 0.061]}>
            <planeGeometry args={[3.04, 4.44]} />
            <meshPhysicalMaterial
              map={charTexture}
              emissiveMap={charTexture}
              emissive="#ffffff"
              emissiveIntensity={1.0}
              color="#ffffff"
              roughness={0.4}
              metalness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              transparent
            />
          </mesh>
        )}

        {/* Glowing Emissive Edge Outline (Back Glow) */}
        <RoundedBox args={[3.26, 4.66, 0.02]} radius={0.09} smoothness={4} position={[0, 0, -0.06]}>
          <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.8} />
        </RoundedBox>
      </group>
    </Float>
  );
}


const GAME_ORDER = ['GOW', 'AC', 'HL', 'RDR', 'HITMAN'];

const CHARACTER_ROSTER = {
  GOW: [
    { id: '001', name: "KRATOS", role: "Protagonist", lore: "Once the Ghost of Sparta, Kratos destroyed the Greek pantheon in a blind rage. Now residing in the harsh Norse realm of Midgard, he wields the Leviathan Axe and struggles to suppress the monster within to be a better father to his son.", image: "/cards/Kratos.png", frameColor: "#001144", glowColor: "#082154", roughness: 0.8, metalness: 0.1 },
    { id: '002', name: "ATREUS", role: "Archer / Companion", lore: "Son of Kratos and the giantess Laufey. Born with the secret name Loki, Atreus is a skilled archer struggling to understand his divine heritage, control his emerging magical abilities, and forge his own destiny outside his father's shadow.", image: "/cards/Atreus.png", frameColor: "#220044", glowColor: "#4c094c", roughness: 0.8, metalness: 0.1 }
  ],
  AC: [
    { id: '003', name: "ALTAÏR IBN-LA'AHAD", role: "Master Assassin", lore: "A legendary Syrian Master Assassin during the Third Crusade. Stripped of his rank for breaking the Creed, Altaïr embarked on a quest for redemption, ultimately seizing the Apple of Eden and reforming the entire Brotherhood with his immense wisdom.", image: "/cards/Altair.png", frameColor: "#ffffff", glowColor: "#ffffff", roughness: 0.5, metalness: 0.5 },
    { id: '004', name: "EZIO AUDITORE", role: "Master Assassin", lore: "Driven by the tragic execution of his father and brothers, this charismatic Florentine noble evolved from a vengeful youth into a legendary Mentor. He spent his life systematically dismantling the Templar Order across Renaissance Italy and Constantinople.", image: "/cards/Ezio.png", frameColor: "#ffffff", glowColor: "#883030", roughness: 0.5, metalness: 0.5 }
  ],
  HL: [
    { id: '006', name: "ISABELLA", role: "Student", lore: "A remarkably gifted 5th-year student at Hogwarts School of Witchcraft and Wizardry. Possessing the incredibly rare ability to perceive and manipulate ancient magic, she holds the key to stopping a devastating goblin rebellion led by Ranrok.", image: "/cards/Isabella.png", frameColor: "#002200", glowColor: "#006e1d", roughness: 0.2, metalness: 0.9 }
  ],
  RDR: [
    { id: '007', name: "ARTHUR MORGAN", role: "Outlaw", lore: "A fiercely loyal senior gun in the Van der Linde gang. As the Wild West dies around him, Arthur wrestles with a crisis of faith in his leader, Dutch, ultimately seeking redemption in his final days through acts of selfless sacrifice.", image: "/cards/Arthur.png", frameColor: "#110000", glowColor: "#693901", roughness: 0.9, metalness: 0.1 },
    { id: '008', name: "JOHN MARSTON", role: "Outlaw", lore: "A scarred, hardened former outlaw trying to build an honest life for his family at Beecher's Hope. Tragically blackmailed by federal agents, John is forced to hunt down his former brothers-in-arms across the dying American frontier.", image: "/cards/John.png", frameColor: "#440000", glowColor: "#521010", roughness: 0.9, metalness: 0.1 }
  ],
  HITMAN: [
    { id: '009', name: "AGENT 47", role: "Assassin", lore: "A genetically perfected clone created by Dr. Ort-Meyer from the DNA of five master criminals. Emotionless, calculating, and armed with a mastery of disguises, 47 executes high-profile targets worldwide for the International Contract Agency.", image: "/cards/Agent47.png", frameColor: "#050505", glowColor: "#222222", roughness: 0.2, metalness: 1.0 }
  ]
};

const GAME_SYMBOLS = {
  GOW: "ᚠᚢᚦᚬᚱᚴᚼᚽᚾᚿᛅᛆᛋᛌᛏᛐᛓᛔᛙᛚᛦᛧ",
  AC: "01",
  HL: "★⚡✧✦☾🪄",
  RDR: "♠♦♣♥★✪",
  HITMAN: "|||0147⌖☠"
};

function SymbolRain({ activeGameId, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let particles = [];
    const maxParticles = 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const chars = GAME_SYMBOLS[activeGameId] || GAME_SYMBOLS['GOW'];
      const charArray = [...chars];
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.2 + Math.random() * 0.8,
          size: 14 + Math.random() * 24,
          opacity: 0.1 + Math.random() * 0.5,
          char: charArray[Math.floor(Math.random() * charArray.length)]
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const chars = GAME_SYMBOLS[activeGameId] || GAME_SYMBOLS['GOW'];
      const charArray = [...chars];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.font = `bold ${p.size}px monospace`;
        ctx.textAlign = 'center';

        ctx.fillText(p.char, p.x, p.y);

        p.y += p.speed;

        if (p.y > canvas.height + p.size) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
          p.char = charArray[Math.floor(Math.random() * charArray.length)];
        }
      }

      ctx.globalAlpha = 1.0;
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeGameId, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6
      }}
    />
  );
}

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

  // Removed swipe logic as it conflicts with 3D rotation. Keyboard and buttons are used instead.

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
        <SymbolRain activeGameId={activeGameId} color={color} />
      </div>

      {/* LEFT: 3D MODEL VIEWER & CAROUSEL */}
      <div
        style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}
      >
        <Canvas camera={{ position: [0, 1, 8], fov: 45 }} style={{ cursor: 'grab' }}>
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2.5} color={color} />
          <spotLight position={[-10, 10, -10]} angle={0.2} penumbra={1} intensity={1.5} color="#ffffff" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#ffffff" />

          <Suspense fallback={
            <RoundedBox args={[3.2, 4.6, 0.12]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
              <meshStandardMaterial color="#222" wireframe />
            </RoundedBox>
          }>
            <HologramCard char={char} key={char.image} animClass={animClass} />
          </Suspense>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2 - 0.4}
            maxPolarAngle={Math.PI / 2 + 0.4}
            minAzimuthAngle={-0.8}
            maxAzimuthAngle={0.8}
          />
        </Canvas>

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
          CLICK ◄ ► FOR CHARACTERS<br />
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
