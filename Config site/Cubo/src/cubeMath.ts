export type Vec3 = [number, number, number];
export type Mat3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

export type Move = { axis: 'x' | 'y' | 'z'; layers: number[]; angle: number; };
export type Piece = { id: string; originalPos: Vec3; pos: Vec3; rot: Mat3; };

export const identity: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function multiplyMatVec(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

export function multiplyMatMat(a: Mat3, b: Mat3): Mat3 {
  const r = new Array(9).fill(0) as Mat3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      r[row * 3 + col] = a[row * 3 + 0] * b[0 * 3 + col] + a[row * 3 + 1] * b[1 * 3 + col] + a[row * 3 + 2] * b[2 * 3 + col];
    }
  }
  return r;
}

export function getRotationMatrix(axis: 'x' | 'y' | 'z', angleDeg: number): Mat3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.round(Math.cos(rad));
  const s = Math.round(Math.sin(rad));
  if (axis === 'x') return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 'y') return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

export function toCSSMatrix3d(r: Mat3): string {
  return `matrix3d(${r[0]}, ${r[3]}, ${r[6]}, 0, ${r[1]}, ${r[4]}, ${r[7]}, 0, ${r[2]}, ${r[5]}, ${r[8]}, 0, 0, 0, 0, 1)`;
}

export function commitMove(pieces: Piece[], move: Move): Piece[] {
  const R = getRotationMatrix(move.axis, move.angle);
  return pieces.map(p => {
    let onLayer = false;
    if (move.axis === 'x' && move.layers.includes(Math.round(p.pos[0]))) onLayer = true;
    if (move.axis === 'y' && move.layers.includes(Math.round(p.pos[1]))) onLayer = true;
    if (move.axis === 'z' && move.layers.includes(Math.round(p.pos[2]))) onLayer = true;
    
    if (!onLayer) return p;
    let newPos = multiplyMatVec(R, p.pos);
    newPos = [Math.round(newPos[0]), Math.round(newPos[1]), Math.round(newPos[2])] as Vec3;
    let newRot = multiplyMatMat(R, p.rot);
    newRot = newRot.map(Math.round) as Mat3;
    return { ...p, pos: newPos, rot: newRot };
  });
}

export function parseMoveToCSS(m: string): Move | null {
  if (!m || m === '?') return null;
  let axis: 'x'|'y'|'z' = 'x';
  let layers: number[] = [1];
  let angle = 90;
  const base = m.replace(/['²2]/g, '').trim();
  const isPrime = m.includes("'");
  const isDouble = m.includes("²") || m.includes("2");

  if (base === 'R') { axis = 'x'; layers = [1]; angle = 90; }
  else if (base === 'L') { axis = 'x'; layers = [-1]; angle = -90; }
  else if (base === 'U') { axis = 'y'; layers = [-1]; angle = -90; }
  else if (base === 'D') { axis = 'y'; layers = [1]; angle = 90; }
  else if (base === 'F') { axis = 'z'; layers = [1]; angle = 90; }
  else if (base === 'B') { axis = 'z'; layers = [-1]; angle = -90; }
  else if (base === 'M') { axis = 'x'; layers = [0]; angle = -90; }
  else if (base === 'E') { axis = 'y'; layers = [0]; angle = 90; }
  else if (base === 'S') { axis = 'z'; layers = [0]; angle = 90; }
  else if (base === 'r' || base === 'Rw') { axis = 'x'; layers = [0, 1]; angle = 90; }
  else if (base === 'l' || base === 'Lw') { axis = 'x'; layers = [-1, 0]; angle = -90; }
  else if (base === 'u' || base === 'Uw') { axis = 'y'; layers = [-1, 0]; angle = -90; }
  else if (base === 'd' || base === 'Dw') { axis = 'y'; layers = [0, 1]; angle = 90; }
  else if (base === 'f' || base === 'Fw') { axis = 'z'; layers = [0, 1]; angle = 90; }
  else if (base === 'b' || base === 'Bw') { axis = 'z'; layers = [-1, 0]; angle = -90; }
  else if (base === 'x') { axis = 'x'; layers = [-1, 0, 1]; angle = 90; }
  else if (base === 'y') { axis = 'y'; layers = [-1, 0, 1]; angle = -90; }
  else if (base === 'z') { axis = 'z'; layers = [-1, 0, 1]; angle = 90; }
  else return null;

  if (isPrime) angle = -angle;
  if (isDouble) angle = angle * 2;
  return { axis, layers, angle };
}

export function getInitialPieces(scrambleStr: string = ''): Piece[] {
  const list: Piece[] = [];
  for (let x of [-1, 0, 1]) {
    for (let y of [-1, 0, 1]) {
       for (let z of [-1, 0, 1]) {
        if (x === 0 && y === 0 && z === 0) continue;
        list.push({ id: `${x},${y},${z}`, originalPos: [x as any, y as any, z as any], pos: [x as any, y as any, z as any], rot: identity });
      }
    }
  }
  
  if (scrambleStr) {
    const moves = scrambleStr.trim().replace(/2/g, '²').split(/\s+/).filter(Boolean);
    let p = list;
    for (const mStr of moves) {
       const m = parseMoveToCSS(mStr);
       if (m) {
          p = commitMove(p, m);
       }
    }
    return p;
  }
  
  return list;
}
