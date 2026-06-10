import React from 'react';
import { CubeStateArray, StickerColor } from '../lib/CubeState';

const COLOR_MAP: Record<StickerColor, string> = {
  W: 'bg-slate-100',
  Y: 'bg-yellow-400',
  G: 'bg-green-500',
  B: 'bg-blue-500',
  R: 'bg-red-500',
  O: 'bg-orange-500',
};

export const FlatCubeMap: React.FC<{ state: CubeStateArray, focusCase?: 'none' | 'f2l' | 'oll' | 'pll' }> = ({ state, focusCase = 'none' }) => {
  const renderFace = (offset: number) => {
    const faceIndex = Math.floor(offset / 9);

    return (
      <div className="grid grid-cols-3 gap-[1px] w-6 h-6 bg-neutral-900 border-2 border-neutral-900">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const rawColor = state[offset + i];
          let colorClass = COLOR_MAP[rawColor] || 'bg-neutral-600';

          const isULayerSticker = (faceIndex === 0) || (
            (faceIndex === 1 || faceIndex === 2 || faceIndex === 4 || faceIndex === 5) && i < 3
          );

          let isStickerActive = true;

          if (focusCase === 'f2l') {
            if (isULayerSticker) {
              isStickerActive = false;
            }
          } else if (focusCase === 'oll') {
            if (!isULayerSticker) {
              isStickerActive = false;
            } else {
              if (rawColor !== 'Y') { // Top layer in CFOP is Yellow
                isStickerActive = false;
              }
            }
          } else if (focusCase === 'pll') {
            if (!isULayerSticker) {
              isStickerActive = false;
            }
          }

          if (!isStickerActive) {
            colorClass = 'bg-neutral-800';
          }

          return <div key={i} className={`${colorClass} w-full h-full rounded-[1px]`} />;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[2px]">
      {/* Top row */}
      <div className="flex gap-[2px]">
        <div className="w-6 h-6" />
        {renderFace(0)} {/* U */}
        <div className="w-6 h-6" />
        <div className="w-6 h-6" />
      </div>
      {/* Middle row */}
      <div className="flex gap-[2px]">
        {renderFace(36)} {/* L */}
        {renderFace(18)} {/* F */}
        {renderFace(9)} {/* R */}
        {renderFace(45)} {/* B */}
      </div>
      {/* Bottom row */}
      <div className="flex gap-[2px]">
        <div className="w-6 h-6" />
        {renderFace(27)} {/* D */}
        <div className="w-6 h-6" />
        <div className="w-6 h-6" />
      </div>
    </div>
  );
};
