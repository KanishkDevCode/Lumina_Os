import React, { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, Center, Sparkles, Clouds, Cloud, ContactShadows, SpotLight, PerformanceMonitor, AdaptiveDpr, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

// ==========================================
// CONFIGURATION: Add your games here!
// ==========================================
const DASHBOARD_GAMES = [
    {
        id: 'GOW',
        title: 'GOD OF WAR',
        logoPath: '/Dashboard/GOW_LOGO.png',
        bgPath: '/Dashboard/GOW_BG.png',
        modelPath: '/models/axe.glb',
        themeColor: '#00d2ff', // Cyan
        modelScale: 5,
        modelLeft: '72vw',
        modelTop: '55vh',
        modelZ: -2,
        modelRotation: [0, Math.PI / 2, 0],
        logoWidth: '550px',
        logoLeft: '10vw',
        logoTop: '15vh',
        logoTransform: 'translateY(-50%)',
        atmosphere: {
            particleColor: '#ffffff',
            particleCount: 200,
            particleSize: 4,
            particleSpeed: 0.8,
            fogColor: '#00d2ff',
            fogOpacity: 0.15,
            fogSpeed: 0.2
        },
        modelHighlight: {
            rimColor: '#00d2ff', // Icy blue rim
            rimIntensity: 5,
            rimPosition: [0, 5, -5],
            bounceColor: '#ffffff', // Snow bounce
            bounceIntensity: 2,
            bouncePosition: [0, -3, 2],
            particleColor: '#ffffff', // Frost orbiting
            particleCount: 40,
            particleSize: 2.5,
            particleSpeed: 0.8,
            hoverSpeed: 1,
            hoverFloat: 0.2
        }
    },
    {
        id: 'AC',
        title: "ASSASSIN'S CREED",
        logoPath: '/Dashboard/AC_LOGO.png',
        bgPath: '/Dashboard/AC_BG.png',
        modelPath: '/models/hidden_blade.glb',
        themeColor: '#ffffff', // White
        modelScale: 2,
        modelLeft: '31vw',
        modelTop: '60vh',
        modelZ: 0,
        modelRotation: [0, Math.PI / 2, 0],
        logoWidth: '550px',
        logoLeft: '35vw',
        logoTop: '25vh',
        logoTransform: 'translateY(-50%)',
        atmosphere: {
            particleColor: '#aaaaaa',
            particleCount: 150,
            particleSize: 2,
            particleSpeed: 0.5,
            fogColor: '#ffffff',
            fogOpacity: 0.2,
            fogSpeed: 0.5
        },
        modelHighlight: {
            rimColor: '#c4d4e6', // Silver moonlight rim
            rimIntensity: 4,
            rimPosition: [5, 8, -5],
            bounceColor: '#ff2222', // Subtle crimson accent reflection
            bounceIntensity: 1,
            bouncePosition: [-2, -2, 2],
            particleColor: '#aaaaaa', // Dust wisps
            particleCount: 30,
            particleSize: 1.5,
            particleSpeed: 0.4,
            hoverSpeed: 0.6,
            hoverFloat: 0.1
        }
    },
    {
        id: 'HL',
        title: "HOGWARTS LEGACY",
        logoPath: '/Dashboard/HL_LOGO.png',
        bgPath: '/Dashboard/HL_BG.png',
        modelPath: '/models/wand.glb',
        themeColor: '#2a9d8f', // Emerald Green
        modelScale: 2.3,
        modelLeft: '70vw',
        modelTop: '60vh',
        modelZ: -1,
        modelPivot: [-0.5, 0, 0],
        modelRotation: [0, Math.PI / 2, 0],
        logoWidth: '400px',
        logoLeft: '8vw',
        logoTop: '20vh',
        logoTransform: 'translateY(-50%)',
        atmosphere: {
            particleColor: '#2a9d8f',
            particleCount: 250,
            particleSize: 3,
            particleSpeed: 1.5,
            fogColor: '#2a9d8f',
            fogOpacity: 0.25,
            fogSpeed: 0.4
        },
        modelHighlight: {
            baseColor: '#2a9d8f', // Magical Arcane Light
            baseIntensity: 7,
            rimColor: '#2a9d8f', // Magical green rim
            rimIntensity: 6,
            rimPosition: [-5, 5, -5],
            bounceColor: '#a8ffb2', // Green glow bounce
            bounceIntensity: 3,
            bouncePosition: [0, -2, 0],
            particleColor: '#a8ffb2', // Floating magical embers
            particleCount: 80,
            particleSize: 2,
            particleSpeed: 1.2,
            hoverSpeed: 1.5,
            hoverFloat: 0.3
        }
    },
    {
        id: 'RDR',
        title: "RED DEAD REDEMPTION",
        logoPath: '/Dashboard/RDR_LOGO.png',
        bgPath: '/Dashboard/RDR_BG.png',
        modelPath: '/models/revolver.glb',
        themeColor: '#d62828', // Crimson Red
        modelScale: 29,
        modelLeft: '28vw',
        modelTop: '70vh',
        modelZ: -2,
        modelPivot: [0, 0, 0],
        modelRotation: [0, Math.PI / 2, 0],
        logoWidth: '500px',
        logoLeft: '7vw',
        logoTop: '25vh',
        logoTransform: 'translateY(-50%)',
        atmosphere: {
            particleColor: '#ffb703',
            particleCount: 120,
            particleSize: 2.5,
            particleSpeed: 0.6,
            fogColor: '#fb8500',
            fogOpacity: 0.15,
            fogSpeed: 0.4
        },
        modelHighlight: {
            baseColor: '#ffb703', // Sunset Amber Light
            baseIntensity: 9,
            rimColor: '#ffb703', // Sunset gold rim
            rimIntensity: 5,
            rimPosition: [10, 5, -10],
            bounceColor: '#8b4513', // Warm wood bounce
            bounceIntensity: 2,
            bouncePosition: [0, -3, 2],
            particleColor: '#ffb703', // Drifting amber dust
            particleCount: 60,
            particleSize: 1.5,
            particleSpeed: 0.3,
            hoverSpeed: 0.8,
            hoverFloat: 0.15
        }
    },
    {
        id: 'HITMAN',
        title: "HITMAN",
        logoPath: '/Dashboard/HITMAN_LOGO.png',
        bgPath: '/Dashboard/HITMAN_BG.png',
        modelPath: '/models/pistol.glb',
        themeColor: '#8b939c', // Shadow Silver
        modelScale: 0.35,
        modelLeft: '75vw',
        modelTop: '70vh',
        modelZ: -2,
        modelPivot: [0, 0, 0],
        modelRotation: [0, Math.PI / 2, 0],
        logoWidth: '400px',
        logoLeft: '30vw',
        logoTop: '20vh',
        logoTransform: 'translateY(-50%)',
        atmosphere: {
            particleColor: '#ffffff',
            particleCount: 300,
            particleSize: 1.5,
            particleSpeed: 2.5,
            fogColor: '#8b939c',
            fogOpacity: 0.1,
            fogSpeed: 0.2
        },
        modelHighlight: {
            rimColor: '#ffffff', // Clean white rim
            rimIntensity: 6,
            rimPosition: [0, 8, -2],
            bounceColor: '#ffffff', // Reflective bounce
            bounceIntensity: 1.5,
            bouncePosition: [0, -2, 5],
            particleColor: '#ffffff', // Subtle mist
            particleCount: 20,
            particleSize: 1,
            particleSpeed: 0.5,
            hoverSpeed: 0.5,
            hoverFloat: 0.05
        }
    }
];

// ==========================================
// THEME PHYSICS & TRANSITION CONFIG
// ==========================================
const THEME_CONFIG = {
    'GOW': { duration: 1.4, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    'AC': { duration: 0.7, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    'HL': { duration: 1.2, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    'RDR': { duration: 1.5, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    'HITMAN': { duration: 0.65, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
};

// ==========================================
// RDR2 TRAIN SMOKE DYNAMIC CONFIG SYSTEM
// Configure colors, sizes, and layout for the 5 different sections here!
// ==========================================
const RDR_SMOKE_SECTIONS = [
    {
        name: "1_Emission_Point",      // Directly at the train's chimney
        color: "#110705",             // Extremely dark coal charcoal
        position: [-4.9, 0.0, 0.0],    // Chimney source
        scale: [0.05, 0.05, 0.05],    // Tiny, tight puff emerging
        opacity: 0.90,
        speed: 0.1,
    },
    {
        name: "2_Initial_Rise",        // Rising slightly out of the stack
        color: "#160907",             // Heavy dark charcoal
        position: [-5.5, 1, 0.0],   // Chuffing upward and slightly back
        scale: [0.1, 0.1, 0.1],    // Growing
        opacity: 0.85,
        speed: 0.32,
    },
    {
        name: "3_Transition_Wind",     // Sweeping backward into the slipstream
        color: "#1d0f0b",             // Dark chocolate umber
        position: [-6.7, 1.7, 0.0],   // Moving left into trailing stream
        scale: [0.25, 0.25, 0.25],    // Spreading out
        opacity: 0.80,
        speed: 0.1,
    },
    {
        name: "4_Vast_Billow",        // Fully expanded massive cloud body
        color: "#2a1912",             // Sunset-shadowed deep woodsmoke
        position: [-10.4, 2.5, 0.0],   // Billowing heavily across train cars
        scale: [0.8, 0.8, 0.8],    // Massive body shape
        opacity: 0.65,
        speed: 0.11,
    },
    {
        name: "5_Sky_Dispersion",      // Dispersing and fading into the atmosphere
        color: "#37251d",             // Warm umber ash blending with sunset sky
        position: [-17.9, 2.5, 0.0],  // Far trailing edge
        scale: [0.8, 0.8, 0.8],    // Vast dispersed cloud bank
        opacity: 0.30,
        speed: 0.06,
    },
    {
        name: "6_Evaporation",         // Fully dissolved into the atmosphere
        color: "#6b4a3a",             // Lighter warm ash matching the sunset
        position: [-22.0, 2.5, 0.0],  // Extended further back
        scale: [1.1, 1.1, 1.1],       // Slightly more expanded
        opacity: 0.0,                 // Smooth fade to invisible
        speed: 0.03,
    }
];

function MovingRDRSmoke() {
    const [time, setTime] = useState(0);

    useFrame((state, delta) => {
        // Drives the physical movement of smoke puffs backward
        setTime((prev) => (prev + delta * 0.03) % 1);
    });

    const parseHex = (hex) => {
        const c = hex.replace("#", "");
        return {
            r: parseInt(c.substring(0, 2), 16),
            g: parseInt(c.substring(2, 4), 16),
            b: parseInt(c.substring(4, 6), 16)
        };
    };

    // Render 12 moving puffs that continuously emerge, travel backward, expand and fade
    return (
        <>
            {Array.from({ length: 12 }).map((_, i) => {
                // Progress from 0 to 1 of this specific puff along the trail
                const t = (time + i / 12) % 1;

                // Interpolate properties between the 5 configuration sections
                const numSegments = RDR_SMOKE_SECTIONS.length - 1;
                const segmentProgress = t * numSegments;
                const index = Math.floor(segmentProgress);
                const localT = segmentProgress - index;

                const secA = RDR_SMOKE_SECTIONS[index];
                const secB = RDR_SMOKE_SECTIONS[Math.min(index + 1, RDR_SMOKE_SECTIONS.length - 1)];

                // Interpolate 3D position
                const x = secA.position[0] + localT * (secB.position[0] - secA.position[0]);
                const y = secA.position[1] + localT * (secB.position[1] - secA.position[1]);
                const z = secA.position[2] + localT * (secB.position[2] - secA.position[2]);

                // Interpolate 3D scale
                const scaleX = secA.scale[0] + localT * (secB.scale[0] - secA.scale[0]);
                const scaleY = secA.scale[1] + localT * (secB.scale[1] - secA.scale[1]);
                const scaleZ = secA.scale[2] + localT * (secB.scale[2] - secA.scale[2]);

                // Interpolate opacity & speed
                const opacity = secA.opacity + localT * (secB.opacity - secA.opacity);
                const speed = secA.speed + localT * (secB.speed - secA.speed);

                // Interpolate color (RGB transition for smooth blending)
                const colorA = parseHex(secA.color);
                const colorB = parseHex(secB.color);
                const r = Math.floor(colorA.r + localT * (colorB.r - colorA.r));
                const g = Math.floor(colorA.g + localT * (colorB.g - colorA.g));
                const b = Math.floor(colorA.b + localT * (colorB.b - colorA.b));
                const color = `rgb(${r},${g},${b})`;

                return (
                    <Cloud
                        key={i}
                        seed={100 + i}
                        segments={10}
                        bounds={[scaleX * 0.7, scaleY * 0.7, scaleZ * 0.7]}
                        volume={5}
                        color={color}
                        opacity={opacity}
                        position={[x, y, z]}
                        speed={speed}
                        scale={[scaleX, scaleY, scaleZ]}
                    />
                );
            })}
        </>
    );
}

// Single global Target Scale reference for performance
const targetScale = new THREE.Vector3(1, 1, 1);

// ==========================================
// THEME OVERLAY: Pure CSS animated identity layers
// ==========================================
function ThemeOverlay({ game, isVisible }) {
    const [entryKey, setEntryKey] = useState(0);
    useEffect(() => {
        if (isVisible) setEntryKey(k => k + 1);
    }, [game.id, isVisible]);

    if (!isVisible) return null;

    if (game.id === 'GOW') return (
        <div key={entryKey} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Frost vignette border */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,180,255,0.18) 100%)',
                animation: 'gow-vignette-pulse 4s ease-in-out infinite alternate',
            }} />
            {/* Icy breath fog rising from bottom */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                background: 'linear-gradient(to top, rgba(0,200,255,0.09) 0%, transparent 100%)',
                animation: 'gow-fog-rise 6s ease-in-out infinite alternate',
            }} />
            {/* Cold blue tint wash */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,160,255,0.04)',
                animation: 'gow-tint-breathe 5s ease-in-out infinite alternate',
            }} />
            {/* Frost crack lines — top-left */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '280px', height: '280px',
                background: 'radial-gradient(ellipse at top left, rgba(0,210,255,0.12) 0%, transparent 70%)',
                animation: 'gow-crack-glow 3s ease-in-out infinite alternate',
            }} />
            {/* Frost crack lines — bottom-right */}
            <div style={{
                position: 'absolute', bottom: 0, right: 0, width: '220px', height: '220px',
                background: 'radial-gradient(ellipse at bottom right, rgba(0,210,255,0.10) 0%, transparent 70%)',
                animation: 'gow-crack-glow 3s ease-in-out infinite alternate 1.5s',
            }} />
        </div>
    );

    if (game.id === 'AC') return (
        <div key={entryKey} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Scanlines */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
                animation: 'ac-scanlines-drift 8s linear infinite',
            }} />
            {/* DNA data stream left */}
            <div style={{
                position: 'absolute', top: 0, left: '15%', width: '1px', height: '100%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.5) 60%, transparent 100%)',
                animation: 'ac-data-stream 4s linear infinite',
            }} />
            {/* DNA data stream right */}
            <div style={{
                position: 'absolute', top: 0, right: '20%', width: '1px', height: '100%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.35) 60%, transparent 100%)',
                animation: 'ac-data-stream 5.5s linear infinite reverse',
            }} />
            {/* Animus entry glitch flash */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255,255,255,0.06)',
                animation: 'ac-glitch-enter 1s ease-out forwards',
            }} />
        </div>
    );

    if (game.id === 'HL') return (
        <div key={entryKey} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Rotating magical shimmer */}
            <div style={{
                position: 'absolute', inset: '-20%',
                background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(42,157,143,0.04) 60deg, transparent 120deg)',
                animation: 'hl-conic-spin 20s linear infinite',
                transformOrigin: 'center center',
            }} />
            {/* Floating orbs */}
            {[{ l: '12%', b: '20%', s: 10, d: 0 }, { l: '25%', b: '55%', s: 7, d: 1.2 }, { l: '55%', b: '75%', s: 12, d: 2.4 },
            { l: '70%', b: '30%', s: 8, d: 0.7 }, { l: '80%', b: '65%', s: 6, d: 3.1 }, { l: '40%', b: '15%', s: 9, d: 1.8 }].map((o, i) => (
                <div key={i} style={{
                    position: 'absolute', left: o.l, bottom: o.b,
                    width: `${o.s}px`, height: `${o.s}px`, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(100,255,180,0.9) 0%, rgba(42,157,143,0.6) 60%, transparent 100%)',
                    boxShadow: '0 0 12px 4px rgba(42,157,143,0.5)',
                    animation: `hl-orb-float 6s ease-in-out infinite`,
                    animationDelay: `${o.d}s`,
                }} />
            ))}
            {/* Wand spell trail */}
            <div style={{
                position: 'absolute', top: '20%', left: 0, width: '2px', height: '60%',
                background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.7) 40%, rgba(100,255,180,0.4) 60%, transparent)',
                animation: 'hl-spell-trail 3s ease-in-out infinite alternate',
            }} />
        </div>
    );

    if (game.id === 'RDR') return (
        <div key={entryKey} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Cinematic black bars */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '22px',
                background: 'rgba(0,0,0,0.85)',
                animation: 'rdr-bar-enter 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '22px',
                background: 'rgba(0,0,0,0.85)',
                animation: 'rdr-bar-enter 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
            }} />
            {/* Dust streaks */}
            {[{ t: '18%', spd: '12s', op: 0.12, d: 0 }, { t: '42%', spd: '9s', op: 0.08, d: 1.5 },
            { t: '63%', spd: '15s', op: 0.10, d: 0.8 }, { t: '80%', spd: '11s', op: 0.07, d: 2.2 }].map((s, i) => (
                <div key={i} style={{
                    position: 'absolute', top: s.t, left: 0, right: 0, height: '1px',
                    background: `linear-gradient(to left, transparent 0%, rgba(180,100,40,${s.op}) 40%, rgba(220,130,60,${s.op * 0.6}) 70%, transparent 100%)`,
                    animation: `rdr-dust-streak ${s.spd} linear infinite`,
                    animationDelay: `${s.d}s`,
                }} />
            ))}
            {/* Warm sun flare — top right */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '350px', height: '350px',
                background: 'radial-gradient(ellipse at top right, rgba(255,160,50,0.10) 0%, transparent 65%)',
                animation: 'rdr-sun-breathe 5s ease-in-out infinite alternate',
            }} />
        </div>
    );

    if (game.id === 'HITMAN') return (
        <div key={entryKey} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Barcode scan line — sweeps once on entry */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.7) 70%, transparent 100%)',
                animation: 'hitman-scan-sweep 1.2s cubic-bezier(0,0,0.2,1) forwards',
            }} />
            {/* HUD corner brackets */}
            {[{ top: '12px', left: '12px', bottom: undefined, right: undefined, rot: '0deg' },
            { top: '12px', left: undefined, bottom: undefined, right: '12px', rot: '90deg' },
            { top: undefined, left: '12px', bottom: '12px', right: undefined, rot: '270deg' },
            { top: undefined, left: undefined, bottom: '12px', right: '12px', rot: '180deg' }].map((c, i) => (
                <div key={i} style={{
                    position: 'absolute', top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                    width: '28px', height: '28px',
                    borderTop: '2px solid rgba(255,255,255,0.55)',
                    borderLeft: '2px solid rgba(255,255,255,0.55)',
                    '--r': c.rot,
                    animation: `hitman-hud-in 0.6s cubic-bezier(0,0,0.2,1) ${i * 0.08}s both`,
                }} />
            ))}
            {/* Subtle dark vignette */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%)',
            }} />
        </div>
    );

    return null;
}

function GlobalAtmosphere({ game }) {
    const cloudsRef = useRef();

    // Smoothly animate fog rotation to simulate wind
    useFrame((state, delta) => {
        if (cloudsRef.current && game?.atmosphere) {
            cloudsRef.current.rotation.y -= delta * 0.05 * game.atmosphere.fogSpeed;
        }
    });

    if (!game || !game.atmosphere) return null;
    const { atmosphere } = game;

    return (
        <group>
            {/* Background Depth Fog */}
            <Clouds ref={cloudsRef} material={THREE.MeshBasicMaterial}>
                <Cloud seed={1} segments={20} bounds={[30, 10, 20]} volume={20} color={atmosphere.fogColor} opacity={atmosphere.fogOpacity} position={[0, -5, -15]} speed={atmosphere.fogSpeed} />
                <Cloud seed={2} segments={20} bounds={[30, 10, 20]} volume={20} color={atmosphere.fogColor} opacity={atmosphere.fogOpacity * 0.5} position={[0, 5, -25]} speed={atmosphere.fogSpeed * 1.5} />
            </Clouds>

            {/* Specific RDR2 Distant Train Smoke (Parametric Multi-Point System) */}
            {game.id === 'RDR' && (
                <Clouds>
                    <group position={[7.5, -7.4, -20]} rotation={[0, 0, -Math.PI / 16]} scale={[0.6, 0.6, 0.6]}>
                        <MovingRDRSmoke />
                    </group>
                </Clouds>
            )}

            {/* Depth-Layered Particle Systems */}
            <Sparkles
                count={atmosphere.particleCount}
                scale={[25, 20, 15]}
                size={atmosphere.particleSize}
                speed={atmosphere.particleSpeed}
                color={atmosphere.particleColor}
                opacity={0.8}
                position={[0, 0, -5]}
            />

            {/* Foreground Parallax Particles (Larger & Faster) */}
            <Sparkles
                count={Math.floor(atmosphere.particleCount / 3)}
                scale={[20, 15, 5]}
                size={atmosphere.particleSize * 1.8}
                speed={atmosphere.particleSpeed * 1.5}
                color={atmosphere.particleColor}
                opacity={0.4}
                position={[0, 0, 8]}
            />
        </group>
    );
}

function ModelHighlight({ game, children }) {
    if (!game || !game.modelHighlight) return <>{children}</>;
    const { modelHighlight } = game;

    return (
        <group>
            {/* Cinematic Contact Shadows anchoring the model without giant black planes */}
            <ContactShadows position={[0, -2.5, 0]} opacity={0.65} scale={12} blur={3} far={5} color="#000000" />

            {/* Localized Rim Light (Environmental Integration) */}
            <spotLight position={modelHighlight.rimPosition} angle={0.4} penumbra={1} intensity={modelHighlight.rimIntensity} color={modelHighlight.rimColor} distance={30} decay={2} castShadow />

            {/* Localized Bounce Light (Platform Reflection) */}
            <spotLight position={modelHighlight.bouncePosition} angle={0.6} penumbra={1} intensity={modelHighlight.bounceIntensity} color={modelHighlight.bounceColor} distance={20} decay={2} />

            {/* Micro-Particle System tightly orbiting the weapon */}
            <Sparkles
                count={modelHighlight.particleCount}
                scale={[6, 6, 6]}
                size={modelHighlight.particleSize}
                speed={modelHighlight.particleSpeed}
                color={modelHighlight.particleColor}
                opacity={0.6}
            />

            {children}
        </group>
    );
}

function AnimatedModelViewer({ game }) {
    const { scene } = useGLTF(game.modelPath);
    const spinRef = useRef();
    const groupRef = useRef();
    const { size } = useThree();

    // Arcball tracking state
    const isDragging = useRef(false);
    const previousQuat = useRef(new THREE.Quaternion());
    const currentQuat = useRef(new THREE.Quaternion());
    const startVector = useRef(new THREE.Vector3());

    const { clonedScene, hitboxRadius } = React.useMemo(() => {
        const clone = scene.clone();
        // Calculate true geometric centroid
        const box = new THREE.Box3().setFromObject(clone);

        // Dynamically calculate the model's true bounding radius
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const rawRadius = (maxDim / 2) || 1; // Fallback to 1 just in case

        const center = new THREE.Vector3();
        box.getCenter(center);

        // Apply manual pivot offset to allow the user to fine-tune the rotation axis
        const pivotOffset = new THREE.Vector3(...(game.modelPivot || [0, 0, 0]));
        center.sub(pivotOffset);

        // Shift geometry so its center aligns exactly with [0,0,0] rotation axis
        clone.position.sub(center);

        return { clonedScene: clone, hitboxRadius: rawRadius };
    }, [scene, game.modelPivot]);

    // Reset scales and rotations when the active game changes
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.scale.set(0, 0, 0);
        }
        currentQuat.current.identity();
        if (spinRef.current) {
            spinRef.current.quaternion.identity();
        }
    }, [game.id]);

    // Viewport-to-3D Coordinate Bridge
    const { viewport, pointer } = useThree();

    // Calculates the responsive 3D position based on vw/vh config
    const responsivePosition = React.useMemo(() => {
        let x = 0;
        let y = 0;
        let z = game.modelZ || 0;

        if (game.modelLeft && typeof game.modelLeft === 'string' && game.modelLeft.includes('vw')) {
            const val = parseFloat(game.modelLeft);
            x = -(viewport.width / 2) + (viewport.width * (val / 100));
        }
        if (game.modelTop && typeof game.modelTop === 'string' && game.modelTop.includes('vh')) {
            const val = parseFloat(game.modelTop);
            y = (viewport.height / 2) - (viewport.height * (val / 100));
        }
        return [x, y, z];
    }, [viewport.width, viewport.height, game.modelLeft, game.modelTop, game.modelZ]);

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
        e.target.setPointerCapture(e.pointerId); // Crucial for dragging outside the mesh bounds
        isDragging.current = true;
        startVector.current.copy(getArcballVector(pointer));
        previousQuat.current.copy(currentQuat.current);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        e.stopPropagation();
        const currentVector = getArcballVector(pointer);

        // Calculate the rotational difference (delta) strictly using Quaternions
        const deltaQuat = new THREE.Quaternion().setFromUnitVectors(startVector.current, currentVector);

        // Apply the delta rotation to the previous rotation in world space to avoid Gimbal Lock
        currentQuat.current.copy(deltaQuat).multiply(previousQuat.current);
    };

    const handlePointerUp = (e) => {
        if (isDragging.current) {
            e.target.releasePointerCapture(e.pointerId);
            isDragging.current = false;
        }
    };

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.scale.lerp(targetScale, 0.08);
        }
        if (spinRef.current) {
            // Slerp towards the target quaternion for cinematic smoothness
            spinRef.current.quaternion.slerp(currentQuat.current, 0.2);

            // Allow for a very slow ambient spin when the user is not actively interacting
            if (!isDragging.current) {
                const autoSpinQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.1); // Ultra slow cinematic rotation
                currentQuat.current.premultiply(autoSpinQuat);
            }
        }
    });

    return (
        <Float speed={game.modelHighlight?.hoverSpeed || 1} rotationIntensity={0} floatIntensity={game.modelHighlight?.hoverFloat || 0.2}>
            <group ref={groupRef} position={responsivePosition}>
                <ModelHighlight game={game}>
                    <group ref={spinRef}>
                        <group scale={game.modelScale} rotation={game.modelRotation}>
                            <primitive object={clonedScene} />
                        </group>
                    </group>
                </ModelHighlight>

                {/* Virtual Hitbox Sphere to catch pointer events smoothly across the Arcball surface */}
                <mesh
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerOut={handlePointerUp}
                >
                    <sphereGeometry args={[Math.min(hitboxRadius * game.modelScale * 1.5, 10), 16, 16]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </Float>
    );
}

export default function DashboardView({ isActive = true }) {
    const [activeIndex, setActiveIndexState] = useState(() => parseInt(sessionStorage.getItem('lumina_dashboard_activeIndex') || '0', 10));

    const setActiveIndex = useCallback((val) => {
        setActiveIndexState(prev => {
            const nextVal = typeof val === 'function' ? val(prev) : val;
            sessionStorage.setItem('lumina_dashboard_activeIndex', nextVal.toString());
            return nextVal;
        });
    }, []);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { setActiveGameId } = useStore();
    const scrollAccumulator = useRef(0);
    const scrollCooldown = useRef(false);
    const mainRef = useRef(null);

    // Track mouse for cursor aura + logo parallax
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!mainRef.current) return;
            const rect = mainRef.current.getBoundingClientRect();
            setMousePos({
                x: (e.clientX - rect.left) / rect.width - 0.5,  // -0.5 to 0.5
                y: (e.clientY - rect.top) / rect.height - 0.5,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Momentum-based directional scroll handler
    const handleWheel = useCallback((e) => {
        if (scrollCooldown.current) return;

        scrollAccumulator.current += e.deltaY;

        if (scrollAccumulator.current > 200) {
            if (activeIndex < DASHBOARD_GAMES.length - 1) {
                setScrollDirection('down');
                changeGame(activeIndex + 1);
            }
            scrollAccumulator.current = 0;
        } else if (scrollAccumulator.current < -200) {
            if (activeIndex > 0) {
                setScrollDirection('up');
                changeGame(activeIndex - 1);
            }
            scrollAccumulator.current = 0;
        }
    }, [activeIndex]);

    // Decay accumulator so small jitters don't build up
    useEffect(() => {
        const id = setInterval(() => { scrollAccumulator.current *= 0.75; }, 80);
        return () => clearInterval(id);
    }, []);

    const changeGame = (newIndex) => {
        const newGame = DASHBOARD_GAMES[newIndex];
        const cfg = THEME_CONFIG[newGame?.id] || THEME_CONFIG['HITMAN'];

        scrollCooldown.current = true;
        setIsTransitioning(true);
        setActiveIndex(newIndex);

        if (newGame?.id) setActiveGameId(newGame.id);

        setTimeout(() => {
            setIsTransitioning(false);
            scrollCooldown.current = false;
        }, cfg.duration * 1000);
    };

    const activeGame = DASHBOARD_GAMES[activeIndex];
    const nextGameIndex = (activeIndex + 1) % DASHBOARD_GAMES.length;
    const nextGame = DASHBOARD_GAMES[nextGameIndex];

    return (
        <main
            ref={mainRef}
            className="scroll-container"
            style={{ overflow: 'hidden', height: 'calc(100vh - 64px)', position: 'relative', contain: 'strict' }}
            onWheel={handleWheel}
        >
            {/* 1. Crossfading Backgrounds */}
            {DASHBOARD_GAMES.map((g, i) => {
                const isActive = activeIndex === i;
                const isPast = i < activeIndex;
                const cfg = THEME_CONFIG[g.id] || THEME_CONFIG['HITMAN'];

                // Directional slide offset — very subtle (1.5%) for premium feel
                let slideY = '0%';
                if (!isActive) {
                    slideY = (scrollDirection === 'down' && !isPast) || (scrollDirection === 'up' && isPast)
                        ? '1.5%' : '-1.5%';
                }

                return (
                    <div
                        key={`bg-${g.id}`}
                        style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: `url(${g.bgPath})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'scale(1) translateY(0%)' : `scale(1.04) translateY(${slideY})`,
                            transition: `opacity ${cfg.duration}s ${cfg.easing}, transform ${cfg.duration * 1.4}s ${cfg.easing}`,
                            zIndex: 0
                        }}
                    />
                );
            })}

            {/* Subtle vignette overlay to make text pop */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)', zIndex: 1, pointerEvents: 'none' }} />

            {/* Cursor Aura — a soft glow that tracks the mouse */}
            <div style={{
                position: 'absolute',
                width: '500px', height: '500px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${activeGame.themeColor}18 0%, transparent 70%)`,
                transform: `translate(calc(${(mousePos.x + 0.5) * 100}vw - 250px), calc(${(mousePos.y + 0.5) * (window.innerHeight - 64)}px - 250px))`,
                transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), background 1s ease',
                pointerEvents: 'none',
                zIndex: 2
            }} />

            {/* Theme-specific animated overlay layer */}
            <ThemeOverlay game={activeGame} isVisible={true} />

            {/* 2. Crossfading Game Logos — with Mouse Parallax */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none',
                transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -12}px)`,
                transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
                {DASHBOARD_GAMES.map((g, i) => {
                    const isActive = activeIndex === i;
                    const isPast = i < activeIndex;
                    const cfg = THEME_CONFIG[g.id] || THEME_CONFIG['HITMAN'];

                    // Unique per-theme logo entrance transform
                    let offTransform = g.logoTransform || 'none';
                    if (!isActive) {
                        const yOff = scrollDirection === 'down' && !isPast ? '45px' : scrollDirection === 'up' && isPast ? '-45px' : '30px';
                        offTransform = `${offTransform} translateY(${yOff})`;
                        if (g.id === 'AC') offTransform = `${g.logoTransform || 'none'} translateX(-30px)`;
                        if (g.id === 'HITMAN') offTransform = `${g.logoTransform || 'none'} translateX(20px)`;
                    }

                    return (
                        <img
                            key={`logo-${g.id}`}
                            src={g.logoPath}
                            alt={`${g.title} Logo`}
                            style={{
                                position: 'absolute',
                                width: g.logoWidth,
                                left: g.logoLeft,
                                top: g.logoTop,
                                objectFit: 'contain',
                                filter: `drop-shadow(0 10px 30px rgba(0,0,0,0.8)) drop-shadow(0 0 40px ${g.themeColor}80)`,
                                opacity: isActive ? 1 : 0,
                                transform: isActive ? (g.logoTransform || 'none') : offTransform,
                                transition: `opacity ${cfg.duration}s ${cfg.easing}, transform ${cfg.duration}s ${cfg.easing}`,
                            }}
                        />
                    );
                })}
            </div>

            {/* 3. Global Shared 3D Canvas */}
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, cursor: 'grab' }}>
                <Canvas
                    camera={{ position: [0, 1.5, 11], fov: 45 }}
                    gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                    style={{ background: 'transparent' }}
                    onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
                    dpr={[1, 2]} // Allow DPR to scale between 1 and 2
                    frameloop={isActive ? "always" : "demand"}
                >
                    <PerformanceMonitor>
                        <AdaptiveDpr pixelRatio={2} />
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.6} />
                            <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={2.5} color={activeGame.themeColor} />
                            <spotLight position={[-10, 5, -10]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
                            <Environment preset="city" />

                            {/* Render Macro Background Atmospheric Effects */}
                            <GlobalAtmosphere game={activeGame} />

                            <AnimatedModelViewer game={activeGame} />
                            <Preload all />
                        </Suspense>
                    </PerformanceMonitor>
                </Canvas>
            </div>

            {/* 4. Scroll Progress Dots (themed, right edge) */}
            <div style={{ position: 'absolute', right: '28px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {DASHBOARD_GAMES.map((g, i) => (
                    <div
                        key={g.id}
                        onClick={() => changeGame(i)}
                        style={{
                            width: activeIndex === i ? '4px' : '3px',
                            height: activeIndex === i ? '28px' : '12px',
                            borderRadius: '4px',
                            background: activeIndex === i ? activeGame.themeColor : 'rgba(255,255,255,0.2)',
                            boxShadow: activeIndex === i ? `0 0 10px ${activeGame.themeColor}` : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        title={g.title}
                    />
                ))}
            </div>

            {/* 5. Bottom Right Next Game Preview Card */}
            <div style={{ position: 'absolute', bottom: '40px', right: '5vw', zIndex: 10 }} onClick={() => changeGame(nextGameIndex)}>
                <div
                    style={{
                        width: '320px', height: '120px', borderRadius: '12px', position: 'relative',
                        cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                        willChange: 'transform'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.querySelector('.hover-glow').style.opacity = '1';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.querySelector('.hover-glow').style.opacity = '0';
                    }}
                >
                    {/* GPU-Accelerated Hover Glow Layer */}
                    <div className="hover-glow" style={{
                        position: 'absolute', inset: 0, borderRadius: '12px',
                        boxShadow: `0 15px 50px ${activeGame.themeColor}90`,
                        opacity: 0, transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'opacity', pointerEvents: 'none', zIndex: -1
                    }} />

                    {/* Content Container (Overflow Hidden) */}
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${activeGame.themeColor}50` }}>
                        <img src={nextGame.bgPath} alt="Next Game" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', display: 'flex', alignItems: 'flex-end', padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <img src={nextGame.logoPath} alt="Next Game Logo" style={{ height: '35px', objectFit: 'contain' }} />
                                <div style={{ fontSize: '10px', color: 'white', letterSpacing: '1px', fontWeight: 'bold' }}>EXPLORE &gt;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global CSS for Animations */}
            <style>{`
        @keyframes scrollWheelAnim {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }

        /* ====== GOD OF WAR ====== */
        @keyframes gow-vignette-pulse {
          0% { opacity: 0.6; } 100% { opacity: 1; }
        }
        @keyframes gow-fog-rise {
          0% { transform: translateY(0%); opacity: 0.6; }
          100% { transform: translateY(-8%); opacity: 1; }
        }
        @keyframes gow-tint-breathe {
          0% { opacity: 0.5; } 100% { opacity: 1; }
        }
        @keyframes gow-crack-glow {
          0% { opacity: 0.4; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.08); }
        }

        /* ====== ASSASSIN'S CREED ====== */
        @keyframes ac-scanlines-drift {
          0% { background-position-y: 0px; }
          100% { background-position-y: 40px; }
        }
        @keyframes ac-data-stream {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes ac-glitch-enter {
          0%  { opacity: 0; }
          8%  { opacity: 1; }
          14% { opacity: 0; }
          22% { opacity: 0.7; }
          28% { opacity: 0; }
          100% { opacity: 0; }
        }

        /* ====== HOGWARTS LEGACY ====== */
        @keyframes hl-conic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes hl-orb-float {
          0%   { transform: translateY(0px) scale(1); opacity: 0.7; }
          50%  { transform: translateY(-22px) scale(1.15); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: 0.7; }
        }
        @keyframes hl-spell-trail {
          0%   { opacity: 0.2; transform: scaleY(0.8); }
          100% { opacity: 0.7; transform: scaleY(1); }
        }

        /* ====== RED DEAD REDEMPTION ====== */
        @keyframes rdr-bar-enter {
          0%   { transform: scaleX(0); opacity: 0; transform-origin: left; }
          100% { transform: scaleX(1); opacity: 1; transform-origin: left; }
        }
        @keyframes rdr-dust-streak {
          0%   { transform: translateX(120%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(-120%); opacity: 0; }
        }
        @keyframes rdr-sun-breathe {
          0%   { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        /* ====== HITMAN ====== */
        @keyframes hitman-scan-sweep {
          0%   { transform: translateY(0vh); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes hitman-hud-in {
          0%   { opacity: 0; transform: rotate(var(--r,0deg)) scale(0.4); }
          100% { opacity: 1; transform: rotate(var(--r,0deg)) scale(1); }
        }
      `}</style>
        </main>
    );
}

// ==========================================
// PERFORMANCE OPTIMIZATION: Preload Assets
// ==========================================
// This completely eliminates the "freeze" stutter when scrolling to a new game
// by silently pre-compiling all massive .glb geometries in the background.
DASHBOARD_GAMES.forEach((game) => {
    useGLTF.preload(game.modelPath);
});