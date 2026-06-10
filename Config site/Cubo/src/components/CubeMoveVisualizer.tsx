import React from 'react';

export const CubeMoveVisualizer = ({ move, isActive }: { move: string, isActive: boolean }) => {
  const getHighlight = () => {
    if (move.includes('R')) return <rect x="40" y="0" width="20" height="60" fill={isActive ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 0.3)"} rx="2" />;
    if (move.includes('L')) return <rect x="0" y="0" width="20" height="60" fill={isActive ? "rgba(34, 197, 94, 0.6)" : "rgba(34, 197, 94, 0.3)"} rx="2" />;
    if (move.includes('U')) return <rect x="0" y="0" width="60" height="20" fill={isActive ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.3)"} rx="2" />;
    if (move.includes('D')) return <rect x="0" y="40" width="60" height="20" fill={isActive ? "rgba(234, 179, 8, 0.6)" : "rgba(234, 179, 8, 0.3)"} rx="2" />;
    if (move.includes('F')) return <rect x="20" y="20" width="20" height="20" fill={isActive ? "rgba(249, 115, 22, 0.6)" : "rgba(249, 115, 22, 0.3)"} rx="2" />;
    return null;
  };

  const getArrow = () => {
    const arrowColor = isActive ? "#ffffff" : "#cbd5e1";
    const strokeWidth = "4";
    
    if (move === 'R') return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M50 50 L50 10" /><path d="M44 16 L50 10 L56 16" /></g>
    );
    if (move === "R'") return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M50 10 L50 50" /><path d="M44 44 L50 50 L56 44" /></g>
    );
    if (move === 'L') return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10 L10 50" /><path d="M4 44 L10 50 L16 44" /></g>
    );
    if (move === "L'") return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 50 L10 10" /><path d="M4 16 L10 10 L16 16" /></g>
    );
    if (move === 'U') return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M50 10 L10 10" /><path d="M16 4 L10 10 L16 16" /></g>
    );
    if (move === "U'") return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10 L50 10" /><path d="M44 4 L50 10 L44 16" /></g>
    );
    if (move === "U'²" || move === "U2" || move === "U²") return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10 L50 10" /><path d="M44 4 L50 10 L44 16" /><path d="M34 4 L40 10 L34 16" /></g>
    );
    if (move === 'F') return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20 A 10 10 0 0 1 40 20" /><path d="M36 26 L40 20 L46 22" /></g>
    );
    if (move === "F'") return (
      <g stroke={arrowColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M40 20 A 10 10 0 0 0 20 20" /><path d="M14 22 L20 20 L24 26" /></g>
    );
    return null; // fallback for undocumented visualizers
  };

  return (
    <svg viewBox="0 0 60 60" className={`w-10 h-10 transition-transform ${isActive ? 'scale-110' : ''}`}>
      <rect x="0" y="0" width="60" height="60" rx="4" fill="#1e293b" stroke={isActive ? "#475569" : "#334155"} strokeWidth="2" />
      <line x1="20" y1="0" x2="20" y2="60" stroke="#334155" strokeWidth="2" />
      <line x1="40" y1="0" x2="40" y2="60" stroke="#334155" strokeWidth="2" />
      <line x1="0" y1="20" x2="60" y2="20" stroke="#334155" strokeWidth="2" />
      <line x1="0" y1="40" x2="60" y2="40" stroke="#334155" strokeWidth="2" />
      {getHighlight()}
      {getArrow()}
    </svg>
  );
};
