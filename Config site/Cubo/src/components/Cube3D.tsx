import React, { useState, useEffect, useRef, PointerEvent } from 'react';
import { Piece, Move, getInitialPieces, parseMoveToCSS, commitMove, toCSSMatrix3d } from '../cubeMath';

const pieceSize = 75;
const pieceGap = 4;
const d = pieceSize;

const faceRotations = {
  front: 'rotateY(0deg)', back: 'rotateY(180deg)', right: 'rotateY(90deg)',
  left: 'rotateY(-90deg)', top: 'rotateX(90deg)', bottom: 'rotateX(-90deg)',
} as const;

// Allow mapping custom face colors based on top color choice
export const availableTopColors = [
  { id: 'white', value: 'bg-[#ffffff]', name: 'Branco' },
  { id: 'yellow', value: 'bg-[#ffed00]', name: 'Amarelo' },
  { id: 'red', value: 'bg-[#df152a]', name: 'Vermelho' },
  { id: 'blue', value: 'bg-[#0062d6]', name: 'Azul' },
  { id: 'green', value: 'bg-[#00c54f]', name: 'Verde' },
  { id: 'orange', value: 'bg-[#ff7b00]', name: 'Laranja' },
];

function getDynamicFaceColors(topColorValue: string) {
  // Base fixed palette
  const p = {
    white: 'bg-[#ffffff]', yellow: 'bg-[#ffed00]',
    red: 'bg-[#df152a]', orange: 'bg-[#ff7b00]',
    blue: 'bg-[#0062d6]', green: 'bg-[#00c54f]'
  };
  
  // simple mapping relative to TOP
  if (topColorValue === p.yellow) {
    return { top: p.yellow, bottom: p.white, front: p.orange, back: p.red, right: p.blue, left: p.green };
  } else if (topColorValue === p.red) {
    return { top: p.red, bottom: p.orange, front: p.white, back: p.yellow, right: p.blue, left: p.green };
  } else if (topColorValue === p.blue) {
    return { top: p.blue, bottom: p.green, front: p.red, back: p.orange, right: p.yellow, left: p.white };
  } else if (topColorValue === p.green) {
    return { top: p.green, bottom: p.blue, front: p.red, back: p.orange, right: p.white, left: p.yellow };
  } else if (topColorValue === p.orange) {
    return { top: p.orange, bottom: p.red, front: p.yellow, back: p.white, right: p.blue, left: p.green };
  }
  
  // Default White
  return { top: p.white, bottom: p.yellow, front: p.red, back: p.orange, right: p.blue, left: p.green };
}

function CubieFace({ 
  face, 
  piece, 
  colors, 
  skin = 'glossy-stickerless', 
  internalSkin = 'classic-black' 
}: { 
  face: keyof typeof faceRotations, 
  piece: Piece, 
  colors: any, 
  skin?: string, 
  internalSkin?: string 
}) {
  const [ox, oy, oz] = piece.originalPos;
  let isExterior = false;
  let color = 'bg-black'; 
  
  if (face === 'front' && oz === 1) { isExterior = true; color = colors.front; }
  if (face === 'back' && oz === -1) { isExterior = true; color = colors.back; }
  if (face === 'right' && ox === 1) { isExterior = true; color = colors.right; }
  if (face === 'left' && ox === -1) { isExterior = true; color = colors.left; }
  if (face === 'top' && oy === -1) { isExterior = true; color = colors.top; }
  if (face === 'bottom' && oy === 1) { isExterior = true; color = colors.bottom; }

  const hasLogo = face === 'top' && ox === 0 && oy === -1 && oz === 0;
  const tz = (pieceSize - pieceGap) / 2;

  // Determine piece type to map organic speedcube rounded cuts (center, edge, corner)
  const sumAbs = Math.abs(ox) + Math.abs(oy) + Math.abs(oz);
  const pieceType = sumAbs === 3 ? 'corner' : sumAbs === 2 ? 'edge' : 'center';

  // Specific high-end rounded properties for ultra realism
  const radiusClass = pieceType === 'center' ? 'rounded-[38%]' : pieceType === 'corner' ? 'rounded-[25%]' : 'rounded-[20%]';

  // Extract precise hex color dynamically from Tailwind class representation
  const colorMatch = color.match(/#([a-fA-F0-9]{6})/);
  const hexColor = colorMatch ? `#${colorMatch[1]}` : '#ffffff';

  // Dynamic honeycombs (favo de mel) pattern for realistic interior surfaces
  const getHoneycombPattern = (strokeColor: string) => {
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='27.71' viewBox='0 0 16 27.71'%3E%3Cpath d='M8 0 L16 4.62 L16 13.86 L8 18.48 L0 13.86 L0 4.62 Z M8 27.71 L16 23.09 L16 13.86 L8 18.48 L0 13.86 L0 23.09 Z' fill='none' stroke='${encodeURIComponent(strokeColor)}' stroke-width='0.8'/%3E%3C/svg%3E")`;
  };

  if (isExterior) {
    if (skin === 'carbon-fighter') {
      return (
        <div 
          className="absolute inset-0 grid place-items-center"
          style={{ transform: `${faceRotations[face]} translateZ(${tz}px)`, backfaceVisibility: 'hidden', background: '#080808' }}
        >
           <div 
             className={`w-[96%] h-[96%] ${radiusClass} ${color} p-[3.2px] grid place-items-center relative shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_2.5px_4px_rgba(0,0,0,0.65)] border border-black/50 overflow-hidden`}
           >
             {/* Carbon fiber woven center in black */}
             <div 
               className="w-full h-full rounded-[14%] bg-gradient-to-br from-[#121212] to-[#080808] relative overflow-hidden shadow-[inset_0_2px_3px_rgba(0,0,0,0.85),0_1px_1px_rgba(255,255,255,0.1)]"
               style={{
                 backgroundImage: `
                   linear-gradient(45deg, #181818 25%, transparent 25%), 
                   linear-gradient(-45deg, #181818 25%, transparent 25%), 
                   linear-gradient(45deg, transparent 75%, #181818 75%), 
                   linear-gradient(-45deg, transparent 75%, #181818 75%)
                 `,
                 backgroundSize: '4.5px 4.5px',
               }}
             >
               <div className="absolute inset-1 border border-white/5 rounded-[12%] bg-transparent pointer-events-none" />
               <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/12 to-transparent rounded-t-[10%] pointer-events-none" />
             </div>
             
             {/* Gloss shine over frame */}
             <div className="absolute top-[2%] left-[3%] right-[3%] h-[20%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[14%] pointer-events-none" />
             
             {hasLogo && (
               <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
                 <span className="text-white font-black italic select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]" style={{ fontFamily: 'Arial, sans-serif', fontSize: '23px', transform: 'rotate(-5deg) skewX(-15deg)' }}>GAN</span>
               </div>
             )}
           </div>
        </div>
      );
    }

    if (skin === 'cyber-neon') {
      const glowColor = hexColor;
      return (
        <div 
          className="absolute inset-0 grid place-items-center"
          style={{ transform: `${faceRotations[face]} translateZ(${tz}px)`, backfaceVisibility: 'hidden', background: '#030712' }}
        >
           <div 
             className={`w-[96%] h-[96%] ${radiusClass} bg-slate-950 relative overflow-hidden border`}
             style={{ 
               borderColor: glowColor,
               boxShadow: `0 0 10px ${glowColor}59, inset 0 0 7px ${glowColor}40`,
             }}
           >
             <div 
               className="absolute inset-[2px] rounded-[15%] opacity-45 pointer-events-none"
               style={{ border: `1px solid ${glowColor}` }}
             />

             <div 
               className="absolute w-[65%] h-[65%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-65 filter blur-[3px] pointer-events-none"
               style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
             />

             <div 
               className="absolute w-[18%] h-[18%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_6px_#fff]"
               style={{ backgroundColor: '#ffffff', opacity: 0.95 }}
             />

             <div 
               className="absolute inset-0 opacity-[0.14] pointer-events-none"
               style={{
                 backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                 backgroundSize: '6px 6px'
               }}
             />

             <div className="absolute top-[3%] left-[4%] right-[4%] h-[35%] bg-gradient-to-b from-white/30 to-transparent rounded-t-[14%] pointer-events-none" />
             
             {hasLogo && (
               <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
                 <span className="font-black italic select-none" style={{ color: glowColor, textShadow: `0 0 5px ${glowColor}`, fontFamily: 'Arial, sans-serif', fontSize: '23px', transform: 'rotate(-5deg) skewX(-15deg)' }}>GAN</span>
               </div>
             )}
           </div>
        </div>
      );
    }

    if (skin === 'frost-satin') {
      return (
        <div 
          className="absolute inset-0 grid place-items-center"
          style={{ transform: `${faceRotations[face]} translateZ(${tz}px)`, backfaceVisibility: 'hidden', background: '#050505' }}
        >
           <div 
             className={`w-[96%] h-[96%] ${radiusClass} ${color} relative overflow-hidden shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.5),inset_-2.5px_-2.5px_5px_rgba(0,0,0,0.52),0_1.5px_3.5px_rgba(0,0,0,0.48)] border border-black/30`}
           >
             <div 
               className="absolute inset-0 opacity-[0.08] pointer-events-none"
               style={{
                 backgroundImage: 'radial-gradient(#fff 25%, transparent 26%)',
                 backgroundSize: '3.3px 3.3px'
               }}
             />
             
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25 pointer-events-none" />
             <div className="absolute top-[2%] left-[2%] right-[2%] h-[40%] bg-gradient-to-b from-white/18 to-transparent rounded-t-[16%] pointer-events-none" />
             
             {hasLogo && (
               <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none bg-white/[0.05]">
                 <span className="text-slate-800/80 font-black italic select-none" style={{ fontFamily: 'Arial, sans-serif', fontSize: '25px', transform: 'rotate(-5deg) skewX(-15deg)' }}>GAN</span>
               </div>
             )}
           </div>
        </div>
      );
    }

    // Default Premium Glossy Stickerless design with realistic rounded cushion bevel and specular glint
    return (
      <div 
        className="absolute inset-0 grid place-items-center"
        style={{ transform: `${faceRotations[face]} translateZ(${tz}px)`, backfaceVisibility: 'hidden', background: '#050505' }}
      >
         <div 
           className={`w-[96%] h-[96%] ${radiusClass} ${color} relative overflow-hidden shadow-[
             0_1.8px_3.5px_rgba(0,0,0,0.6),
             inset_0_2.2px_3.8px_rgba(255,255,255,0.7),
             inset_0_-2.2px_3.8px_rgba(0,0,0,0.48),
             inset_2px_0_3px_rgba(255,255,255,0.25),
             inset_-2px_0_3px_rgba(0,0,0,0.25)
           ] border border-black/50`}
         >
           {/* Soft specular ambient glare overlay */}
           <div className="absolute inset-[3px] rounded-[15%] bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none" />
           
           {/* High-definition crescent specular highlight */}
           <div className="absolute top-[2%] left-[5%] w-[42%] h-[20%] bg-gradient-to-br from-white/60 to-transparent rounded-full transform -rotate-[12deg] pointer-events-none blur-[0.3px]" />
           
           {/* Subtle bottom environmental reflection */}
           <div className="absolute bottom-[2.5%] left-[5%] right-[5%] h-[16%] bg-gradient-to-t from-black/28 to-transparent rounded-b-[14%] pointer-events-none" />

           {hasLogo && (
             <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
               {/* Realistic white centerpiece circular dome background (refer to GAN photos) */}
               <div className="w-[82%] h-[82%] rounded-full bg-gradient-to-b from-white via-[#fafafa] to-[#f0f0f0] border border-slate-200/50 shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.9),0_1.5px_3px_rgba(0,0,0,0.2)] grid place-items-center">
                 <span className="text-[#0062d6] font-black italic select-none filter drop-shadow-[0_1px_1.5px_rgba(255,255,255,0.95)]" style={{ fontFamily: 'Arial, sans-serif', fontSize: '24px', transform: 'rotate(-5deg) skewX(-15deg)' }}>GAN</span>
               </div>
             </div>
           )}
         </div>
      </div>
    );
  }

  // INTERIOR SURFACES (Exposed when pieces are turned)
  // Re-creates the beautiful detailed mechanical components from the Photos:
  // - Textured Honeycomb channels (favo de mel) on contact surfaces
  // - Cylindrical Neodymium magnetic capsules for corners/edges
  // - High-performance numerical GES dual-tension cups for centerpiece cores

  if (internalSkin === 'primary-white') {
    return (
      <div className="absolute inset-0 bg-[#ebebeb]" style={{ transform: `${faceRotations[face]} translateZ(${tz - 0.2}px)`, backfaceVisibility: 'hidden' }}>
        <div 
          className="absolute inset-0 overflow-hidden opacity-95 border-[1px] border-[#d4d4d8] rounded-[8%] font-sans"
          style={{ backgroundImage: getHoneycombPattern('#e4e4e7'), backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 grid place-items-center">
            {pieceType === 'center' ? (
              /* Numerical GES Dual-Adjustment Dial under Center Piece */
              <div className="relative w-8 h-8 rounded-full border border-slate-300 shadow-[0_1.5px_4px_rgba(0,0,0,0.15)] grid place-items-center bg-gradient-to-b from-white to-slate-100">
                {/* Spiral representation of the compression spring (GAN style) */}
                <div className="absolute inset-1 rounded-full border-[1.5px] border-slate-400 border-dashed opacity-55 animate-[spin_40s_linear_infinite]" />
                <div className="absolute inset-1.5 rounded-full border border-slate-400/80" />
                {/* Brass adjusting screw and numerical indicator wheel */}
                <div className="relative w-4.5 h-4.5 rounded-full border border-yellow-500 bg-[radial-gradient(circle_at_35%_25%,#fef08a,#eab308_60%,#a16207)] flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
                </div>
                {/* Micro numerical markings */}
                <div className="absolute text-[5.5px] scale-[0.8] text-slate-500 font-extrabold select-none top-[1px] font-mono">0.6</div>
                <div className="absolute text-[5.5px] scale-[0.8] text-slate-500 font-extrabold select-none bottom-[1px] font-mono">0.8</div>
              </div>
            ) : (
              /* Magnetic Neodymium Column Capsule */
              <div className="relative w-7 h-7 rounded-full border border-slate-300 bg-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {/* Smoke translucent spacer holding the neodymium magnet */}
                <div className="w-[18px] h-[18px] rounded-full border border-slate-400 bg-[radial-gradient(circle_at_35%_25%,#ffffff,#cbd5e1_55%,#64748b)] shadow-[0_1.2px_1.5px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.555)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 border border-slate-300 shadow-inner" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (internalSkin === 'transparent-cyan') {
    return (
      <div className="absolute inset-0 bg-[#06b6d4]/25 backdrop-blur-[0.5px]" style={{ transform: `${faceRotations[face]} translateZ(${tz - 0.2}px)`, backfaceVisibility: 'hidden' }}>
        <div 
          className="absolute inset-0 overflow-hidden opacity-90 border-[1px] border-[#0891b2]/40 rounded-[8%] font-sans"
          style={{ backgroundImage: getHoneycombPattern('#22d3ee'), backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 grid place-items-center">
            {pieceType === 'center' ? (
              /* Translucent Aqua GES Dial with glowing core elements */
              <div className="relative w-8 h-8 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.5)] grid place-items-center bg-cyan-950/70">
                <div className="absolute inset-1 rounded-full border-[1.5px] border-cyan-400/40 border-dashed animate-[spin_50s_linear_infinite]" />
                <div className="absolute inset-1.5 rounded-full border border-cyan-400/30" />
                <div className="relative w-4.5 h-4.5 rounded-full border border-cyan-400 bg-[radial-gradient(circle_at_35%_25%,#e2fbfc,#22d3ee_60%,#0891b2)] flex items-center justify-center shadow-[0_0_4px_#22d3ee]">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_2px_#fff]" />
                </div>
                <div className="absolute text-[5.5px] scale-[0.8] text-cyan-300 font-extrabold select-none top-[1px] font-mono">0.6</div>
                <div className="absolute text-[5.5px] scale-[0.8] text-cyan-300 font-extrabold select-none bottom-[1px] font-mono">0.8</div>
              </div>
            ) : (
              /* Neodymium Capsule inside translucent Cyan capsule */
              <div className="relative w-7 h-7 rounded-full border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.4)] grid place-items-center bg-cyan-950/70">
                <div className="w-[18px] h-[18px] rounded-full border border-slate-300 bg-[radial-gradient(circle_at_35%_25%,#e2e8f0,#64748b_60%,#475569)] shadow-[0_1px_1.5px_rgba(255,255,255,0.7),inset_0_1px_1px_rgba(255,255,255,0.5)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(34,211,238,1)]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Classic Black (Preto Pro Honeycomb with translucent red magnetic capsules)
  return (
    <div className="absolute inset-0 bg-[#0c0c0e]" style={{ transform: `${faceRotations[face]} translateZ(${tz - 0.2}px)`, backfaceVisibility: 'hidden' }}>
      <div 
        className="absolute inset-0 overflow-hidden opacity-95 border-[1px] border-[#1f1f23] rounded-[8%] font-sans"
        style={{ backgroundImage: getHoneycombPattern('#27272a'), backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 grid place-items-center">
          {pieceType === 'center' ? (
            /* GAN Classic GES Spring Core Adjustment */
            <div className="relative w-8 h-8 rounded-full border border-zinc-800 shadow-[0_1.5px_4px_rgba(0,0,0,0.5)] grid place-items-center bg-gradient-to-b from-zinc-900 to-black">
              {/* Concentric compression spring coil tracks */}
              <div className="absolute inset-1 rounded-full border-[1.5px] border-zinc-700 border-dashed opacity-45" />
              <div className="absolute inset-1.5 rounded-full border border-zinc-700/60" />
              {/* Gold/Brass adjustment tension nut */}
              <div className="relative w-4.5 h-4.5 rounded-full border border-yellow-600 bg-[radial-gradient(circle_at_35%_25%,#fde047,#ca8a04_65%,#713f12)] flex items-center justify-center shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 border border-zinc-500 shadow-inner" />
              </div>
              <div className="absolute text-[5.5px] scale-[0.8] text-zinc-500 font-extrabold select-none top-[1px] font-mono">0.6</div>
              <div className="absolute text-[5.5px] scale-[0.8] text-zinc-500 font-extrabold select-none bottom-[1px] font-mono">0.8</div>
            </div>
          ) : (
            /* Professional Neodymium capsule inside vibrant translucent Red spacer capsule (refer to Image 1 & 3) */
            <div className="relative w-7 h-7 rounded-full border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.35)] grid place-items-center bg-gradient-to-br from-red-950/40 to-black/60">
              <div className="w-[18px] h-[18px] rounded-full border border-zinc-300 bg-[radial-gradient(circle_at_35%_25%,#ffffff,#a1a1aa_55%,#4b5563_85%,#1f2937_100%)] shadow-[0_1px_2px_rgba(255,255,255,0.7),inset_0_1px_1px_rgba(255,255,255,0.5)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 border border-red-300 shadow-[0_0_3px_red]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Cubie({ 
  piece, 
  isTransitioning, 
  activeMove, 
  speed, 
  colors, 
  skin, 
  internalSkin 
}: any) {
  let aX = 0, aY = 0, aZ = 0;
  if (activeMove) {
    let onLayer = false;
    if (activeMove.axis === 'x' && activeMove.layers.includes(Math.round(piece.pos[0]))) onLayer = true;
    if (activeMove.axis === 'y' && activeMove.layers.includes(Math.round(piece.pos[1]))) onLayer = true;
    if (activeMove.axis === 'z' && activeMove.layers.includes(Math.round(piece.pos[2]))) onLayer = true;
    
    if (onLayer) {
      if (activeMove.axis === 'x') aX = activeMove.angle;
      if (activeMove.axis === 'y') aY = activeMove.angle;
      if (activeMove.axis === 'z') aZ = activeMove.angle;
    }
  }
  const transformStr = `translate(-50%, -50%) rotateX(${aX}deg) rotateY(${aY}deg) rotateZ(${aZ}deg) translate3d(${piece.pos[0] * d}px, ${piece.pos[1] * d}px, ${piece.pos[2] * d}px) ${toCSSMatrix3d(piece.rot)}`;
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: pieceSize - pieceGap, height: pieceSize - pieceGap,
        transformStyle: 'preserve-3d', transform: transformStr,
        transition: isTransitioning ? `transform ${speed * 0.75}ms cubic-bezier(.2, .72, .18, 1)` : 'none'
      }}
    >
      <CubieFace face="front" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
      <CubieFace face="back" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
      <CubieFace face="right" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
      <CubieFace face="left" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
      <CubieFace face="top" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
      <CubieFace face="bottom" piece={piece} colors={colors} skin={skin} internalSkin={internalSkin} />
    </div>
  )
}

export function computePieces(targetStep: number, algo: any[], scramble: string, baseMoves: string[]) {
  let p = getInitialPieces(scramble);
  baseMoves.forEach(mStr => {
    const move = parseMoveToCSS(mStr);
    if (move) p = commitMove(p, move);
  });
  for (let i = 0; i <= targetStep; i++) {
    if (algo[i]) {
      const move = parseMoveToCSS(algo[i].move);
      if (move) p = commitMove(p, move);
    }
  }
  return p;
}

export const CssCube = ({ 
  step, 
  algo, 
  speed, 
  scramble = '', 
  baseMoves = [],
  skin = 'glossy-stickerless', 
  internalSkin = 'classic-black'
}: { 
  step: number, 
  algo: any[], 
  speed: number, 
  scramble?: string, 
  baseMoves?: string[],
  skin?: string, 
  internalSkin?: string 
}) => {
  const [internalStep, setInternalStep] = useState(-1);
  const [pieces, setPieces] = useState<Piece[]>(() => computePieces(-1, algo, scramble, baseMoves));
  const [activeMove, setActiveMove] = useState<Move | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [topColorValue, setTopColorValue] = useState('bg-[#ffffff]');
  
  const [viewRx, setViewRx] = useState(-28);
  const [viewRy, setViewRy] = useState(38);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (step === internalStep) return;

    if (step === internalStep + 1 && step >= 0 && step < algo.length) {
       // Only animate if going exactly 1 step forward
       const move = parseMoveToCSS(algo[step].move);
       if (move) {
          setActiveMove(move);
          setIsTransitioning(true);
          const t = setTimeout(() => {
             setPieces(prev => commitMove(prev, move));
             setActiveMove(null);
             setIsTransitioning(false);
             setInternalStep(step);
          }, speed * 0.75);
          return () => {
             clearTimeout(t);
             setPieces(prev => commitMove(prev, move));
             setActiveMove(null);
             setIsTransitioning(false);
             setInternalStep(step);
          };
       } else {
          setInternalStep(step);
       }
    } else {
       // Jumping or resetting: instant transition
       setPieces(computePieces(step, algo, scramble, baseMoves));
       setActiveMove(null);
       setIsTransitioning(false);
       setInternalStep(step);
    }
  }, [step, algo, speed, scramble, baseMoves, internalStep]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setViewRy(prev => prev + dx * 0.5);
    setViewRx(prev => prev - dy * 0.5);
  };
  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const currentColors = getDynamicFaceColors(topColorValue);

  return (
    <div className="w-full h-full relative">
       {/* Top Face Color Selector */}
       <div className="absolute top-2 right-2 z-20 bg-slate-900/90 border border-slate-700 p-1.5 rounded-lg backdrop-blur-md shadow-xl flex items-center gap-2">
         <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cima</span>
         <div className="flex gap-1">
           {availableTopColors.map(c => (
              <button 
                key={c.id} 
                onClick={() => setTopColorValue(c.value)}
                className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${c.value} ${topColorValue === c.value ? 'border-blue-500 scale-110 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'border-black/50'}`}
                title={`Face topo: ${c.name}`}
              />
           ))}
         </div>
       </div>

      <div
        className="w-full h-full cursor-grab active:cursor-grabbing grid place-items-center"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 44%', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
         <div className="relative pointer-events-none" style={{ width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateX(${viewRx}deg) rotateY(${viewRy}deg)` }}>
            {pieces.map(p => (
              <Cubie 
                key={p.id} 
                piece={p} 
                isTransitioning={isTransitioning} 
                activeMove={activeMove as any} 
                speed={speed} 
                colors={currentColors} 
                skin={skin || 'glossy-stickerless'} 
                internalSkin={internalSkin || 'classic-black'} 
              />
            ))}
         </div>
      </div>
    </div>
  );
};
