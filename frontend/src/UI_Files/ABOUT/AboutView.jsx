import React from 'react';
import Icons from '../shared/Icons';

export default function AboutView() {
  return (
    <main className="scroll-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
      
      <div style={{ 
        width: '100%', maxWidth: '900px', 
        background: 'rgba(10, 15, 25, 0.6)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '24px', 
        backdropFilter: 'blur(30px)',
        display: 'flex', overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        
        {/* LEFT: Branding/Image */}
        <div style={{ 
          width: '40%', 
          background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(0,0,0,0.8) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px', position: 'relative'
        }}>
          {/* Cyber grid background */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.3 }} />
          
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '50%', 
            background: 'rgba(0, 210, 255, 0.1)', border: '2px solid #00d2ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0, 210, 255, 0.3)', marginBottom: '30px',
            position: 'relative', zIndex: 2
          }}>
            <div style={{ fontSize: '50px', color: '#00d2ff' }}>{Icons.Characters}</div>
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: 'white', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            KANISHK
          </h2>
          <div style={{ fontSize: '10px', letterSpacing: '4px', color: '#00d2ff', marginTop: '10px', position: 'relative', zIndex: 2 }}>
            LEAD ARCHITECT
          </div>
        </div>

        {/* RIGHT: Info/Bio */}
        <div style={{ width: '60%', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '30px', height: '2px', background: '#00d2ff' }} />
            <span style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>ABOUT THE DEVELOPER</span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '1px', marginBottom: '25px', lineHeight: 1.2 }}>
            Engineering the <span style={{ color: '#00d2ff' }}>Future of UI</span>
          </h1>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '40px' }}>
            Lumina OS was built to push the boundaries of what is possible in a web browser. By combining Agentic AI integrations, raw WebGL rendering through React Three Fiber, and seamless Cloudinary CDN pipelines, this project serves as a next-generation blueprint for AAA web experiences.
          </p>

          {/* Tech Stack */}
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '15px', fontWeight: 600 }}>
            CORE TECHNOLOGIES
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {['REACT 19', 'THREE.JS', 'ZUSTAND', 'FIREBASE', 'CLOUDINARY', 'DRACO COMPRESSION'].map(tech => (
              <span key={tech} style={{ 
                padding: '8px 16px', background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                fontSize: '10px', letterSpacing: '1px', color: 'white'
              }}>
                {tech}
              </span>
            ))}
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ 
              background: '#00d2ff', border: 'none', color: '#000', 
              padding: '12px 30px', borderRadius: '8px', fontSize: '12px', 
              fontWeight: 700, letterSpacing: '1px', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)', transition: '0.3s'
            }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
              GITHUB PROFILE
            </button>
            <button style={{ 
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', 
              padding: '12px 30px', borderRadius: '8px', fontSize: '12px', 
              fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', transition: '0.3s'
            }} onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'white'; }} onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
              LINKEDIN
            </button>
          </div>

        </div>
      </div>

    </main>
  );
}
