import React from 'react';
import { useStore } from '../store/useStore';
import { THEMES } from '../UI_Files/shared/gameData';

export default function Toast() {
  const { toast, activeGameId } = useStore();

  if (!toast) return null;

  const theme = THEMES[activeGameId] || THEMES['GOW'];
  const primaryColor = theme.primary || '#00d2ff';
  const primaryRgb = theme.primaryRgb || '0, 210, 255';
  const bgCore = theme.bgCore || '#02050a';

  const isError = toast.type === 'error';
  const glowColor = isError ? '#ff3333' : primaryColor;
  const glowRgb = isError ? '255, 51, 51' : primaryRgb;

  return (
    <div style={{
      position: 'fixed',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      background: `rgba(5, 10, 15, 0.85)`,
      backdropFilter: 'blur(16px)',
      border: `1px solid rgba(${glowRgb}, 0.5)`,
      borderBottom: `3px solid ${glowColor}`,
      borderRadius: '12px',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: `0 10px 40px rgba(${glowRgb}, 0.25), 0 0 15px rgba(${glowRgb}, 0.1)`,
      animation: toast.isExiting 
        ? 'toastSlideUp 0.4s cubic-bezier(0.895, 0.03, 0.685, 0.22) forwards' 
        : 'toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      color: '#fff',
      fontWeight: '600',
      letterSpacing: '0.5px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: `rgba(${glowRgb}, 0.2)`,
        color: glowColor
      }}>
        {isError ? '✕' : '✓'}
      </div>
      <span>{toast.message}</span>

      <style>{`
        @keyframes toastSlideDown {
          0% { opacity: 0; transform: translate(-50%, -30px) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes toastSlideUp {
          0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -30px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
