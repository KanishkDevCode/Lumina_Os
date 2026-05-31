import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { THEMES } from '../shared/gameData';
import Icons from '../shared/Icons';

// Per-game cinematic config
const GAME_CINEMA = {
  GOW: {
    splashIcon: '🪓',
    splashLogo: null, // Replace with URL later, e.g. '/images/gow-logo.png'
    splashTitle: 'REALM UPLINK ESTABLISHED',
    splashSub: 'MIMIR — KEEPER OF KNOWLEDGE',
    splashAnim: 'gowSplash',
    bgElements: [
      { type: 'rune', count: 8, color: '0, 210, 255', anim: 'runeFloat' },
      { type: 'shard', count: 12, color: '0, 210, 255', anim: 'iceShard' },
    ]
  },
  AC: {
    splashIcon: '🦅',
    splashLogo: null,
    splashTitle: 'ANIMUS SYNCHRONISED',
    splashSub: 'BROTHERHOOD INTELLIGENCE ACTIVE',
    splashAnim: 'acSplash',
    bgElements: [
      { type: 'feather', count: 10, color: '255, 255, 255', anim: 'featherDrift' },
      { type: 'line', count: 6, color: '255, 255, 255', anim: 'scanLine' },
    ]
  },
  HL: {
    splashIcon: '⚡',
    splashLogo: null,
    splashTitle: 'WIZARDING UPLINK',
    splashSub: 'HOGWARTS SPELLBOOK LOADED',
    splashAnim: 'hlSplash',
    bgElements: [
      { type: 'star', count: 20, color: '42, 157, 143', anim: 'starTwinkle' },
      { type: 'orb', count: 5, color: '42, 157, 143', anim: 'orbFloat' },
    ]
  },
  RDR: {
    splashIcon: '🤠',
    splashLogo: null,
    splashTitle: 'FRONTIER DISPATCH',
    splashSub: 'OUTLAW INTELLIGENCE ONLINE',
    splashAnim: 'rdrSplash',
    bgElements: [
      { type: 'dust', count: 15, color: '214, 40, 40', anim: 'dustDrift' },
      { type: 'shard', count: 6, color: '255, 123, 0', anim: 'emberFloat' },
    ]
  },
  HITMAN: {
    splashIcon: '🎯',
    splashLogo: null,
    splashTitle: 'ICA SECURE CHANNEL',
    splashSub: 'HANDLER: DIANA BURNWOOD',
    splashAnim: 'hitmanSplash',
    bgElements: [
      { type: 'line', count: 8, color: '139, 147, 156', anim: 'laserScan' },
      { type: 'dot', count: 20, color: '139, 147, 156', anim: 'radarDot' },
    ]
  },
};

export default function AssistantView() {
    const { activeGameId, gamesData, setActiveGameId } = useStore();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [streamingId, setStreamingId] = useState(null);
    const [showSplash, setShowSplash] = useState(false);
    const [splashOut, setSplashOut] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const messagesEndRef = useRef(null);
    const streamTimer = useRef(null);
    const bgParticles = useRef(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 4,
      opacity: Math.random() * 0.3 + 0.1
    }))).current;

    // Merge static themes with dynamic database info
    const game = { ...THEMES[activeGameId], ...gamesData[activeGameId] };

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle game switch (Reset chat & send new greeting)
    useEffect(() => {
        let greeting = "How can I assist you today?";
        let agentName = "Lumina AI";

        if (activeGameId === 'GOW') {
            greeting = "Greetings, Spartan. What knowledge of the Nine Realms do you seek?";
            agentName = "Mimir (Lore-keeper)";
        } else if (activeGameId === 'AC') {
            greeting = "Initiating Animus protocols... Welcome to the Brotherhood. How can I assist your mission?";
            agentName = "Animus AI";
        } else if (activeGameId === 'HL') {
            greeting = "Welcome to the Room of Requirement. What magical secrets can I uncover for you today?";
            agentName = "Hogwarts Guide";
        } else if (activeGameId === 'RDR') {
            greeting = "Howdy partner. Need directions around the frontier or weapon specs?";
            agentName = "Outlaw Informant";
        } else if (activeGameId === 'HITMAN') {
            greeting = "Good evening, 47. I have the intel for your next assignment. What do you need?";
            agentName = "ICA Handler (Diana)";
        }

        setMessages([
            { id: 1, sender: 'ai', text: greeting, name: agentName }
        ]);
        setInputValue('');
        setIsTyping(false);
        setStreamingText('');
        setStreamingId(null);

        // Show cinematic splash on every game switch (skip very first render)
        if (!isFirstLoad) {
            setSplashOut(false);
            setShowSplash(true);
            const hideTimer = setTimeout(() => {
                setSplashOut(true);
                setTimeout(() => setShowSplash(false), 600);
            }, 2000);
            return () => clearTimeout(hideTimer);
        }
        setIsFirstLoad(false);
    }, [activeGameId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue, name: 'User' };
        const currentHistory = [...messages]; 
        
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: newUserMsg.text, 
                    gameId: activeGameId,
                    history: currentHistory
                })
            });
            
            const data = await response.json();
            const fullText = data.response || "No response received.";
            
            const msgId = Date.now() + 1;
            const agentName = messages[0]?.name || 'Lumina AI';

            setIsTyping(false);
            setStreamingId(msgId);
            setStreamingText('');
            setMessages(prev => [...prev, { id: msgId, sender: 'ai', text: '', name: agentName }]);

            // Stream characters in to simulate typing
            let i = 0;
            if (streamTimer.current) clearInterval(streamTimer.current);
            streamTimer.current = setInterval(() => {
                i++;
                setStreamingText(fullText.slice(0, i));
                if (i >= fullText.length) {
                    clearInterval(streamTimer.current);
                    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText } : m));
                    setStreamingId(null);
                    setStreamingText('');
                }
            }, 12); // Speed up slightly for longer AI responses

        } catch (error) {
            console.error("Backend fetch error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                text: "[ERROR] Could not connect to Lumina Backend. Is your server.js running on port 3001?", 
                name: 'System Error' 
            }]);
        }
    };

    const cinema = GAME_CINEMA[activeGameId] || GAME_CINEMA.GOW;

    return (
        <main className="scroll-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

            {/* === PER-GAME AMBIENT BACKGROUND LAYER === */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                {bgParticles.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute',
                        left: `${p.x}%`, top: `${p.y}%`,
                        width: `${p.size}px`, height: `${p.size}px`,
                        borderRadius: activeGameId === 'GOW' ? '3px' : activeGameId === 'HITMAN' ? '0' : '50%',
                        background: `rgba(${game.primaryRgb}, ${p.opacity})`,
                        animation: `bgParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
                        transform: activeGameId === 'GOW' ? 'rotate(45deg)' : 'none',
                        boxShadow: `0 0 ${p.size * 2}px rgba(${game.primaryRgb}, ${p.opacity * 0.5})`,
                    }} />
                ))}
                {/* Themed corner glows */}
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, rgba(${game.primaryRgb}, 0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, rgba(${game.primaryRgb}, 0.04) 0%, transparent 70%)`, pointerEvents: 'none' }} />
                {/* Game-specific extra element */}
                {activeGameId === 'HITMAN' && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${15 + i * 20}%`, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${game.primaryRgb}, 0.2), transparent)`, animation: `scanLine ${3 + i}s ${i * 0.5}s linear infinite` }} />
                ))}
                {activeGameId === 'HL' && Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: `${10 + i * 12}%`, top: `${5 + (i % 3) * 30}%`, fontSize: `${24 + (i % 3) * 12}px`, opacity: 0.25, animation: `starTwinkle ${2 + i * 0.5}s ${i * 0.3}s ease-in-out infinite alternate`, color: game.primary }}>✦</div>
                ))}
                {activeGameId === 'GOW' && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: `${5 + i * 20}%`, top: `${10 + (i % 2) * 60}%`, fontSize: `${30 + i * 10}px`, opacity: 0.2, animation: `runeFloat ${4 + i}s ${i * 0.7}s ease-in-out infinite alternate`, color: game.primary, filter: `drop-shadow(0 0 10px ${game.primary})` }}>ᚠ</div>
                ))}
                {activeGameId === 'AC' && Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: `${10 + i * 12}%`, top: `${-10 - (i % 4) * 20}%`, fontSize: `${20 + (i % 3) * 15}px`, opacity: 0.15, animation: `featherDrift ${5 + i}s ${i * 0.5}s ease-in infinite`, color: game.primary, filter: `drop-shadow(0 0 5px ${game.primary})` }}>◈</div>
                ))}
                {activeGameId === 'RDR' && Array.from({ length: 12 }).map((_, i) => {
                    const suits = ['♠', '♥', '♦', '♣'];
                    // Pseudo-random but deterministic values so they don't jump on re-render
                    const left = (i * 29) % 100;
                    const top = -10 - ((i * 17) % 40);
                    const size = 20 + ((i * 11) % 24);
                    const dur = 6 + ((i * 7) % 6);
                    const del = (i * 0.73) % 5;
                    const suit = suits[i % 4];
                    const isRed = suit === '♥' || suit === '♦';
                    return (
                        <div key={i} style={{ 
                            position: 'absolute', left: `${left}%`, top: `${top}%`, fontSize: `${size}px`, opacity: 0.25, 
                            animation: `cardTumble ${dur}s ${del}s linear infinite`, 
                            color: isRed ? game.primary : 'rgba(255, 255, 255, 0.4)', 
                            filter: isRed ? `drop-shadow(0 0 8px ${game.primary})` : 'none' 
                        }}>
                            {suit}
                        </div>
                    );
                })}
            </div>

            {/* === CINEMATIC GAME SWITCH SPLASH === */}
            {showSplash && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: `radial-gradient(ellipse at center, rgba(${game.primaryRgb}, 0.25) 0%, rgba(0,0,0,0.97) 70%)`,
                    animation: splashOut ? 'splashFadeOut 0.6s ease-in forwards' : 'splashFadeIn 0.4s ease-out forwards',
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Icon or Logo */}
                    <div style={{ fontSize: '72px', marginBottom: '24px', animation: 'splashIconPop 0.5s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1.2) both', filter: `drop-shadow(0 0 30px ${game.primary})`, display: 'flex', justifyContent: 'center' }}>
                        {cinema.splashLogo ? (
                            <img src={cinema.splashLogo} alt="Game Logo" style={{ height: '80px', objectFit: 'contain' }} />
                        ) : (
                            cinema.splashIcon
                        )}
                    </div>
                    {/* Animated bar */}
                    <div style={{ width: '200px', height: '1px', background: `linear-gradient(90deg, transparent, ${game.primary}, transparent)`, marginBottom: '24px', animation: 'splashBarExpand 0.6s 0.2s ease-out both' }} />
                    {/* Title */}
                    <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '6px', color: game.primary, textShadow: `0 0 30px ${game.primary}`, margin: 0, animation: 'splashTitleRise 0.5s 0.3s ease-out both' }}>
                        {cinema.splashTitle}
                    </h2>
                    <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', marginTop: '12px', animation: 'splashTitleRise 0.5s 0.45s ease-out both' }}>
                        {cinema.splashSub}
                    </p>
                    {/* Bottom scan line */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${game.primary}, transparent)`, animation: 'splashScanLine 1.5s 0.3s linear forwards', width: '0%' }} />
                </div>
            )}
            
            <div style={{ flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, zIndex: 10 }}>
                
                {/* Expandable Game Switcher Menu */}
                <div style={{ position: 'absolute', top: '30px', right: '40px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            background: `rgba(${game.primaryRgb}, 0.2)`,
                            border: `1px solid ${game.primary}`,
                            color: game.primary,
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '900',
                            letterSpacing: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 0 15px rgba(${game.primaryRgb}, 0.3)`
                        }}
                    >
                        {Icons.Games} {game.id} {isMenuOpen ? '▲' : '▼'}
                    </button>

                    {isMenuOpen && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '5px',
                            background: 'rgba(10, 15, 20, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px',
                            backdropFilter: 'blur(10px)',
                            animation: 'cinematicFadeIn 0.2s ease-out forwards',
                            minWidth: '200px'
                        }}>
                            {Object.keys(THEMES).map(id => {
                                const isSelected = activeGameId === id;
                                const t = THEMES[id];
                                return (
                                    <button 
                                        key={id}
                                        onClick={() => { setActiveGameId(id); setIsMenuOpen(false); }}
                                        style={{
                                            background: isSelected ? `rgba(${t.primaryRgb}, 0.2)` : 'transparent',
                                            border: `1px solid ${isSelected ? t.primary : 'transparent'}`,
                                            color: isSelected ? t.primary : 'var(--text-muted)',
                                            padding: '10px 15px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            letterSpacing: '1px',
                                            textAlign: 'right',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseOver={(e) => {
                                            if(!isSelected) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = 'white';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if(!isSelected) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                            }
                                        }}
                                    >
                                        {t.title}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Header Section */}
                <div style={{ marginBottom: '30px', textAlign: 'center', position: 'relative' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <span style={{ color: game.primary }}>{Icons.Assistant}</span> 
                        {game.title} ASSISTANT
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px', marginTop: '10px' }}>
                        INTELLIGENT DATABASE UPLINK ACTIVE
                    </p>
                </div>

                {/* Chat History Area */}
                <div className="chat-scroll" style={{ 
                    flex: 1, 
                    minHeight: 0, 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border-light)', 
                    borderRadius: '16px', 
                    padding: '30px',
                    overflowY: 'scroll',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 10px 40px rgba(0,0,0,0.5), inset 0 0 0 1px ${game.primary}20`
                }}>
                    {messages.map((msg, index) => {
                        const isStreaming = msg.id === streamingId;
                        const displayText = isStreaming ? streamingText : msg.text;
                        return (
                        <div key={msg.id} className="chat-msg-enter" style={{ 
                            display: 'flex', 
                            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                            gap: '15px',
                            alignItems: 'flex-start',
                            animationDelay: `${index * 0.04}s`
                        }}>
                            {/* Avatar */}
                            <div style={{ 
                                width: '40px', height: '40px', borderRadius: '50%', 
                                background: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : `rgba(${game.primaryRgb}, 0.2)`,
                                border: `1px solid ${msg.sender === 'user' ? 'var(--border-light)' : game.primary}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: msg.sender === 'user' ? 'white' : game.primary,
                                flexShrink: 0
                            }}>
                                {msg.sender === 'user' ? 'U' : Icons.Assistant}
                            </div>
                            
                            {/* Message Bubble */}
                            <div style={{ maxWidth: '75%' }}>
                                <div style={{ 
                                    fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px', 
                                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                                    letterSpacing: '1px', fontWeight: 'bold'
                                }}>
                                    {msg.name}
                                </div>
                                <div style={{ 
                                    background: msg.sender === 'user' ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, rgba(${game.primaryRgb}, 0.15) 0%, rgba(0,0,0,0.5) 100%)`,
                                    border: `1px solid ${msg.sender === 'user' ? 'var(--border-light)' : `rgba(${game.primaryRgb}, 0.3)`}`,
                                    padding: '16px 20px',
                                    borderRadius: msg.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                    whiteSpace: 'pre-wrap',
                                    minHeight: isStreaming ? '52px' : 'auto'
                                }}>
                                    {displayText.split('**').map((chunk, i) => i % 2 === 1 ? <strong key={i} style={{ color: game.primary }}>{chunk}</strong> : chunk)}
                                    {isStreaming && <span className="stream-cursor" style={{ borderRight: `2px solid ${game.primary}`, marginLeft: '2px' }}>&nbsp;</span>}
                                </div>
                            </div>
                        </div>
                        );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `rgba(${game.primaryRgb}, 0.2)`, border: `1px solid ${game.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: game.primary }}>
                                {Icons.Assistant}
                            </div>
                            <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px', letterSpacing: '1px', fontWeight: 'bold' }}>
                                    {messages[0]?.name}
                                </div>
                                <div style={{ background: `rgba(${game.primaryRgb}, 0.1)`, border: `1px solid rgba(${game.primaryRgb}, 0.3)`, padding: '16px 20px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <span className="dot-typing" style={{ background: game.primary, animationDelay: '0s' }}></span>
                                    <span className="dot-typing" style={{ background: game.primary, animationDelay: '0.2s' }}></span>
                                    <span className="dot-typing" style={{ background: game.primary, animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{ marginTop: '20px', position: 'relative' }}>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Ask about ${game.title}...`}
                        disabled={isTyping}
                        style={{
                            width: '100%',
                            padding: '20px 60px 20px 25px',
                            background: 'rgba(0,0,0,0.5)',
                            border: `1px solid ${game.primary}50`,
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '15px',
                            outline: 'none',
                            fontFamily: 'var(--font-sans)',
                            transition: '0.3s',
                            boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`
                        }}
                        onFocus={(e) => e.target.style.borderColor = game.primary}
                        onBlur={(e) => e.target.style.borderColor = `${game.primary}50`}
                    />
                    <button 
                        type="submit" 
                        disabled={isTyping || !inputValue.trim()}
                        style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: game.primary, border: 'none', width: '40px', height: '40px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black',
                            cursor: (isTyping || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                            opacity: (isTyping || !inputValue.trim()) ? 0.5 : 1, transition: '0.3s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>

            </div>

            {/* Local + Cinematic Styles */}
            <style>{`
                .dot-typing { width: 6px; height: 6px; border-radius: 50%; animation: typingPulse 1.4s infinite ease-in-out both; }
                @keyframes typingPulse { 0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
                
                /* Custom Theme Scrollbar */
                .chat-scroll::-webkit-scrollbar { width: 6px; }
                .chat-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; margin: 10px 0; }
                .chat-scroll::-webkit-scrollbar-thumb { background: rgba(${game.primaryRgb}, 0.5); border-radius: 10px; }
                .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(${game.primaryRgb}, 0.8); }

                .chat-msg-enter { animation: msgSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
                @keyframes msgSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .stream-cursor { animation: cursorBlink 0.7s step-end infinite; display: inline-block; }
                @keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                /* Splash animations */
                @keyframes splashFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes splashFadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.05); } }
                @keyframes splashIconPop { from { opacity: 0; transform: scale(0.3) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
                @keyframes splashBarExpand { from { width: 0; opacity: 0; } to { width: 200px; opacity: 1; } }
                @keyframes splashTitleRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes splashScanLine { from { width: 0%; left: 0; } to { width: 100%; left: 0; } }
                /* BG particle animations */
                @keyframes bgParticle { from { transform: translateY(0) scale(1); opacity: 0.1; } to { transform: translateY(-20px) scale(1.3); opacity: 0.4; } }
                @keyframes scanLine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
                @keyframes starTwinkle { from { opacity: 0.05; transform: scale(0.8); } to { opacity: 0.2; transform: scale(1.2); } }
                @keyframes runeFloat { from { transform: translateY(0) rotate(0deg); opacity: 0.06; } to { transform: translateY(-15px) rotate(10deg); opacity: 0.14; } }
                @keyframes featherDrift { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 20% { opacity: 0.15; } 80% { opacity: 0.15; } 100% { transform: translateY(120vh) rotate(180deg); opacity: 0; } }
                @keyframes cardTumble { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.2; } 90% { opacity: 0.2; } 100% { transform: translateY(120vh) rotate(360deg); opacity: 0; } }
            `}</style>
        </main>
    );
}
