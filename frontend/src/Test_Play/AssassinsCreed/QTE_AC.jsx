import React, { useRef, useState, useEffect } from 'react';

// Define the full multi-event sequence here!
const qteSequence = [
  { time: 3.0, key: 'w', prompt: "RUN" },
  { time: 5.0, key: 'space', prompt: "JUMP" },
  { time: 7.5, key: 'e', prompt: "ASSASSINATE" }
];

export default function QTE_AC({ onExit }) {
  const videoSrc = "/Test_Plays/AC_Test_Play.mp4";
  const themeColor = "#ffffff";

  const videoRef = useRef(null);
  const [qteState, setQteState] = useState('playing'); // 'playing', 'slowing', 'paused', 'finished'
  const [currentQteIndex, setCurrentQteIndex] = useState(0);

  // Get the active QTE based on current index
  const activeQte = qteSequence[currentQteIndex] || null;

  // Fullscreen Logic
  useEffect(() => {
    // Request fullscreen when Test Play opens
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("Fullscreen request was blocked or not supported:", err);
      });
    }

    // Exit fullscreen when Test Play closes
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Press Escape to instantly exit
      if (e.key === 'Escape') {
        if (onExit) onExit();
        return;
      }
      
      // Press QTE Key to resolve the action
      const pressedKey = e.key === ' ' ? 'space' : e.key.toLowerCase();
      if (qteState === 'paused' && activeQte && pressedKey === activeQte.key.toLowerCase()) {
        resolveQTE();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qteState, activeQte, onExit]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !activeQte) return;
    const currentTime = videoRef.current.currentTime;

    // Trigger time dilation 0.5s before QTE
    if (qteState === 'playing' && currentTime >= activeQte.time - 0.5 && currentTime < activeQte.time) {
      setQteState('slowing');
      videoRef.current.playbackRate = 0.3; // Bullet time
    }

    // Trigger full pause at exact QTE time
    if ((qteState === 'playing' || qteState === 'slowing') && currentTime >= activeQte.time) {
      setQteState('paused');
      videoRef.current.pause();
      videoRef.current.currentTime = activeQte.time; // Lock it exactly at the frame
    }
  };

  const resolveQTE = () => {
    // If there is another QTE in the sequence, increment and keep playing
    if (currentQteIndex < qteSequence.length - 1) {
      setCurrentQteIndex(prev => prev + 1);
    }
    setQteState('playing');
    
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play();
    }
  };

  const handleVideoEnd = () => {
    setQteState('finished');
    setTimeout(() => {
      if (onExit) onExit();
    }, 2500); // Wait 2.5s to show the final splash screen
  };

  // Determine CSS filters based on state
  const isCinematicPause = qteState === 'paused' || qteState === 'slowing';
  const showPrompt = qteState === 'paused' && activeQte;
  
  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 99999, background: 'black', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
    }}>
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: isCinematicPause ? 'scale(1.05)' : 'scale(1)',
          filter: isCinematicPause ? 'grayscale(80%) sepia(20%) brightness(0.7) contrast(1.2)' : 'none'
        }}
      />

      {/* Vignette Overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)',
        opacity: isCinematicPause ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }} />

      {/* QTE Prompt */}
      {showPrompt && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{
            fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '4px',
            border: `2px solid ${themeColor}`, padding: '15px 40px', borderRadius: '12px',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            boxShadow: `0 0 30px ${themeColor}80, inset 0 0 20px ${themeColor}40`,
            display: 'flex', alignItems: 'center', gap: '20px'
          }}>
            <span style={{ color: themeColor, fontSize: '60px' }}>[{activeQte.key.toUpperCase()}]</span>
            <span>{activeQte.prompt}</span>
          </div>
          <style>{`
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
              70% { transform: translate(-50%, -50%) scale(1.05); box-shadow: 0 0 0 20px rgba(255,255,255,0); }
              100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
            }
          `}</style>
        </div>
      )}

      {/* Final Splash Screen */}
      {qteState === 'finished' && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255, 0, 0, 0.2)',
          backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'glitch-flash 0.2s ease-out'
        }}>
          <h1 style={{
            fontSize: '64px', fontWeight: 900, color: '#ff3333', letterSpacing: '10px',
            textShadow: '4px 4px 0 #ffffff, -4px -4px 0 #00d2ff'
          }}>
            TARGET NEUTRALIZED
          </h1>
          <style>{`
            @keyframes glitch-flash {
              0% { background: white; opacity: 1; filter: invert(1); }
              100% { background: rgba(255,0,0,0.2); opacity: 1; filter: invert(0); }
            }
          `}</style>
        </div>
      )}

      {/* Exit Button */}
      <button 
        onClick={onExit}
        style={{
          position: 'absolute', top: '30px', right: '40px', fontSize: '24px', color: 'white',
          cursor: 'pointer', background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)', transition: '0.3s', zIndex: 10
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'black' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
      >
        ×
      </button>

    </div>
  );
}
