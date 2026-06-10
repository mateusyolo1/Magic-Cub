import React from 'react';

export const CubeMoveVisualizer = ({ move, isActive }: { move: string, isActive: boolean }) => {
  const getHighlight = () => {
    const m = move.replace(/['2²w]/g, '');
    const isM = move.includes('M') || move.includes('E') || move.includes('S');
    const isW = move.includes('w') || ['r','l','u','d','f','b'].includes(move[0]);
    const isRot = ['x','y','z','X','Y','Z'].includes(move[0]);

    if (isRot) return <rect x="0" y="0" width="60" height="60" fill={isActive ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"} rx="2" />; // Full cube
    
    if (m === 'R' || (move.toLowerCase()[0] === 'r')) return <rect x={isW ? "20" : "40"} y="0" width={isW ? "40" : "20"} height="60" fill={isActive ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 0.3)"} rx="2" />;
    if (m === 'L' || (move.toLowerCase()[0] === 'l')) return <rect x="0" y="0" width={isW ? "40" : "20"} height="60" fill={isActive ? "rgba(249, 115, 22, 0.6)" : "rgba(249, 115, 22, 0.3)"} rx="2" />;
    if (m === 'U' || (move.toLowerCase()[0] === 'u')) return <rect x="0" y="0" width="60" height={isW ? "40" : "20"} fill={isActive ? "rgba(234, 179, 8, 0.6)" : "rgba(234, 179, 8, 0.3)"} rx="2" />;
    if (m === 'D' || (move.toLowerCase()[0] === 'd')) return <rect x="0" y={isW ? "20" : "40"} width="60" height={isW ? "40" : "20"} fill={isActive ? "rgba(248, 250, 252, 0.6)" : "rgba(248, 250, 252, 0.3)"} rx="2" />;
    if (m === 'F' || (move.toLowerCase()[0] === 'f')) return <rect x="20" y="20" width="20" height="20" fill={isActive ? "rgba(34, 197, 94, 0.6)" : "rgba(34, 197, 94, 0.3)"} rx="2" />;
    if (m === 'B' || (move.toLowerCase()[0] === 'b')) return <rect x="0" y="0" width="60" height="60" fill={isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"} rx="2" />;

    if (move.includes('M')) return <rect x="20" y="0" width="20" height="60" fill={isActive ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 0.3)"} rx="2" />;
    if (move.includes('E')) return <rect x="0" y="20" width="60" height="20" fill={isActive ? "rgba(234, 179, 8, 0.6)" : "rgba(234, 179, 8, 0.3)"} rx="2" />;
    if (move.includes('S')) return <rect x="20" y="20" width="20" height="20" fill={isActive ? "rgba(34, 197, 94, 0.6)" : "rgba(34, 197, 94, 0.3)"} rx="2" />;

    return null;
  };

  const getArrow = () => {
    const isW = move.toLowerCase().includes('w') || ['r','l','u','d','f','b'].includes(move[0]);
    const arrowColor = isActive ? "#ffffff" : "#cbd5e1";
    const strokeWidth = isW ? "6" : "4";
    const fill = "none";
    const strokeLinecap = "round";
    const strokeLinejoin = "round";
    const props = { stroke: arrowColor, strokeWidth, fill, strokeLinecap, strokeLinejoin };

    const getDoubleArrowPaths = (dBase: string, p1: string, p2: string) => (
      <>
        <path d={dBase} />
        <path d={p1} />
        <path d={p2} />
      </>
    );

    const normalizedMove = move.toUpperCase().replace('W', '');

    switch (normalizedMove) {
      case 'R': case 'X': return <g {...props}><path d="M50 50 L50 10" /><path d="M44 16 L50 10 L56 16" /></g>;
      case "R'": case "X'": return <g {...props}><path d="M50 10 L50 50" /><path d="M44 44 L50 50 L56 44" /></g>;
      case 'R2': case 'R²': case 'X2': case 'X²': return <g {...props}>{getDoubleArrowPaths("M50 50 L50 10", "M44 16 L50 10 L56 16", "M44 26 L50 20 L56 26")}</g>;
      case "R'2": case "R'²": case "X'2": case "X'²": return <g {...props}>{getDoubleArrowPaths("M50 10 L50 50", "M44 44 L50 50 L56 44", "M44 34 L50 40 L56 34")}</g>;
      
      case 'L': case 'M': return <g {...props}><path d="M10 10 L10 50" /><path d="M4 44 L10 50 L16 44" /></g>;
      case "L'": case "M'": return <g {...props}><path d="M10 50 L10 10" /><path d="M4 16 L10 10 L16 16" /></g>;
      case 'L2': case 'L²': case 'M2': case 'M²': return <g {...props}>{getDoubleArrowPaths("M10 10 L10 50", "M4 44 L10 50 L16 44", "M4 34 L10 40 L16 34")}</g>;
      case "L'2": case "L'²": case "M'2": case "M'²": return <g {...props}>{getDoubleArrowPaths("M10 50 L10 10", "M4 16 L10 10 L16 16", "M4 26 L10 20 L16 26")}</g>;
      
      case 'U': case 'Y': return <g {...props}><path d="M50 10 L10 10" /><path d="M16 4 L10 10 L16 16" /></g>;
      case "U'": case "Y'": return <g {...props}><path d="M10 10 L50 10" /><path d="M44 4 L50 10 L44 16" /></g>;
      case 'U2': case 'U²': case 'Y2': case 'Y²': return <g {...props}>{getDoubleArrowPaths("M50 10 L10 10", "M16 4 L10 10 L16 16", "M26 4 L20 10 L26 16")}</g>;
      case "U'2": case "U'²": case "Y'2": case "Y'²": return <g {...props}>{getDoubleArrowPaths("M10 10 L50 10", "M44 4 L50 10 L44 16", "M34 4 L40 10 L34 16")}</g>;

      case 'D': case 'E': return <g {...props}><path d="M10 50 L50 50" /><path d="M44 44 L50 50 L44 56" /></g>;
      case "D'": case "E'": return <g {...props}><path d="M50 50 L10 50" /><path d="M16 44 L10 50 L16 56" /></g>;
      case 'D2': case 'D²': case 'E2': case 'E²': return <g {...props}>{getDoubleArrowPaths("M10 50 L50 50", "M44 44 L50 50 L44 56", "M34 44 L40 50 L34 56")}</g>;
      case "D'2": case "D'²": case "E'2": case "E'²": return <g {...props}>{getDoubleArrowPaths("M50 50 L10 50", "M16 44 L10 50 L16 56", "M26 44 L20 50 L26 56")}</g>;

      case 'F': case 'S': case 'Z': return <g {...props}><path d="M20 20 A 10 10 0 0 1 40 20" /><path d="M36 26 L40 20 L46 22" /></g>;
      case "F'": case "S'": case "Z'": return <g {...props}><path d="M40 20 A 10 10 0 0 0 20 20" /><path d="M14 22 L20 20 L24 26" /></g>;
      case 'F2': case 'F²': case 'S2': case 'S²': case 'Z2': case 'Z²': return <g {...props}><path d="M20 20 A 10 10 0 0 1 40 20" /><path d="M36 26 L40 20 L46 22" /><path d="M30 20 A 10 10 0 0 1 40 20" /></g>; // simplified 2 for circular
      case "F'2": case "F'²": case "S'2": case "S'²": case "Z'2": case "Z'²": return <g {...props}><path d="M40 20 A 10 10 0 0 0 20 20" /><path d="M14 22 L20 20 L24 26" /><path d="M30 20 A 10 10 0 0 0 20 20" /></g>;

      case 'B': return <g {...props}><path d="M40 20 A 10 10 0 0 0 20 20" /><path d="M14 22 L20 20 L24 26" /></g>; // B visually inverse of F from front view
      case "B'": return <g {...props}><path d="M20 20 A 10 10 0 0 1 40 20" /><path d="M36 26 L40 20 L46 22" /></g>;
      case 'B2': case 'B²': return <g {...props}><path d="M40 20 A 10 10 0 0 0 20 20" /><path d="M14 22 L20 20 L24 26" /><path d="M30 20 A 10 10 0 0 0 20 20" /></g>;
      case "B'2": case "B'²": return <g {...props}><path d="M20 20 A 10 10 0 0 1 40 20" /><path d="M36 26 L40 20 L46 22" /><path d="M30 20 A 10 10 0 0 1 40 20" /></g>;

      default:
        return <text x="30" y="36" textAnchor="middle" fill={arrowColor} fontSize="18" fontWeight="bold">{move}</text>;
    }
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
