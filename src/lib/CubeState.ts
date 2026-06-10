export enum Face {
  U = 'U',
  R = 'R',
  F = 'F',
  D = 'D',
  L = 'L',
  B = 'B',
}

export type StickerColor = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O';
export type CubeStateArray = StickerColor[]; // 54 length array

const FACES = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

export class CubeStateManager {
  private state: CubeStateArray;

  constructor() {
    this.state = this.getSolvedState();
  }

  public orientationLogic: { face: string; dir: number }[] = [];

  public getSolvedState(): CubeStateArray {
    return [
      ...Array(9).fill('Y'), // 0-8: U (Yellow)
      ...Array(9).fill('O'), // 9-17: R (Orange)
      ...Array(9).fill('G'), // 18-26: F (Green)
      ...Array(9).fill('W'), // 27-35: D (White)
      ...Array(9).fill('R'), // 36-44: L (Red)
      ...Array(9).fill('B'), // 45-53: B (Blue)
    ];
  }

  public getState(): CubeStateArray {
    return [...this.state];
  }

  public setState(newState: CubeStateArray) {
    if (newState.length === 54) this.state = [...newState];
  }

  public reset() {
    this.state = this.getSolvedState();
    this.orientationLogic = [];
  }

  private cycle(arr: any[], indices: number[]) {
    const temp = arr[indices[indices.length - 1]];
    for (let i = indices.length - 1; i > 0; i--) {
      arr[indices[i]] = arr[indices[i - 1]];
    }
    arr[indices[0]] = temp;
  }

  private rotateFaceCW(faceIndex: number) {
    const offset = faceIndex * 9;
    // Corners: 0->2, 2->8, 8->6, 6->0
    this.cycle(this.state, [offset + 0, offset + 2, offset + 8, offset + 6]);
    // Edges: 1->5, 5->7, 7->3, 3->1
    this.cycle(this.state, [offset + 1, offset + 5, offset + 7, offset + 3]);
  }

  public applyMove(move: string) {
    let cleanMove = move.trim();
    if (cleanMove.length >= 2 && cleanMove[1].toLowerCase() === 'w') {
        cleanMove = cleanMove[0].toUpperCase() + 'w' + cleanMove.slice(2);
    } else if (/^[mesxyz]/i.test(cleanMove[0])) {
        cleanMove = cleanMove[0].toUpperCase() + cleanMove.slice(1);
    } else if (cleanMove.length > 0 && /^[ruldfb]$/i.test(cleanMove[0]) && cleanMove[0] === cleanMove[0].toLowerCase()) {
        // lower case face letters like 'r' are kept as they are because macros has "r"
        // but if they entered 'R', keep it 'R'
    } else {
        cleanMove = cleanMove[0].toUpperCase() + cleanMove.slice(1);
    }
    
    // Expansion for wide and slice moves
    const macros: Record<string, string[]> = {
       "M": ["R", "L'", "X'"], "M'": ["R'", "L", "X"], "M2": ["R2", "L2", "X2"], "M²": ["R2", "L2", "X2"],
       "E": ["U", "D'", "Y'"], "E'": ["U'", "D", "Y"], "E2": ["U2", "D2", "Y2"], "E²": ["U2", "D2", "Y2"],
       "S": ["F'", "B", "Z"], "S'": ["F", "B'", "Z'"], "S2": ["F2", "B2", "Z2"], "S²": ["F2", "B2", "Z2"],
       "r": ["L", "X"], "r'": ["L'", "X'"], "r2": ["L2", "X2"], "r²": ["L2", "X2"],
       "Rw": ["L", "X"], "Rw'": ["L'", "X'"], "Rw2": ["L2", "X2"], "Rw²": ["L2", "X2"],
       "l": ["R", "X'"], "l'": ["R'", "X"], "l2": ["R2", "X2"], "l²": ["R2", "X2"],
       "Lw": ["R", "X'"], "Lw'": ["R'", "X"], "Lw2": ["R2", "X2"], "Lw²": ["R2", "X2"],
       "u": ["D", "Y"], "u'": ["D'", "Y'"], "u2": ["D2", "Y2"], "u²": ["D2", "Y2"],
       "Uw": ["D", "Y"], "Uw'": ["D'", "Y'"], "Uw2": ["D2", "Y2"], "Uw²": ["D2", "Y2"],
       "d": ["U", "Y'"], "d'": ["U'", "Y"], "d2": ["U2", "Y2"], "d²": ["U2", "Y2"],
       "Dw": ["U", "Y'"], "Dw'": ["U'", "Y"], "Dw2": ["U2", "Y2"], "Dw²": ["U2", "Y2"],
       "f": ["B", "Z"], "f'": ["B'", "Z'"], "f2": ["B2", "Z2"], "f²": ["B2", "Z2"],
       "Fw": ["B", "Z"], "Fw'": ["B'", "Z'"], "Fw2": ["B2", "Z2"], "Fw²": ["B2", "Z2"],
       "b": ["F", "Z'"], "b'": ["F'", "Z"], "b2": ["F2", "Z2"], "b²": ["F2", "Z2"],
       "Bw": ["F", "Z'"], "Bw'": ["F'", "Z"], "Bw2": ["F2", "Z2"], "Bw²": ["F2", "Z2"]
    };

    if (macros[cleanMove]) {
        macros[cleanMove].forEach(m => this.applyMove(m));
        return;
    }

    if (['X', 'Y', 'Z', "X'", "Y'", "Z'", "X2", "Y2", "Z2", "X²", "Y²", "Z²"].includes(cleanMove)) {
      let face = cleanMove[0];
      let dir = cleanMove.includes("'") ? -1 : (cleanMove.includes("2") || cleanMove.includes("²") ? 2 : 1);
      if (dir === 2) {
          this.orientationLogic.push({ face, dir: 1 });
          this.orientationLogic.push({ face, dir: 1 });
      } else {
          this.orientationLogic.push({ face, dir });
      }
    }
    this._applyMoveOnly(cleanMove);
  }

  private _applyMoveOnly(move: string) {
    let face = move[0] as string;
    let isInverse = move.includes("'");
    let isDouble = move.includes("2") || move.includes("²");

    // Fix: cycle mappings in singleMoveCW were actually mathematically CCW! 
    // To do CW (1 turn), we must run the CCW mapping 3 times.
    // To do CCW (inverse), run it 1 time.
    let times = isDouble ? 2 : (isInverse ? 1 : 3);

    for (let i = 0; i < times; i++) {
      this.singleMoveCW(face);
    }
  }

  private singleMoveCW(face: string) {
    if (face === 'X') {
      // X CCW: R-axis CCW. R CCW, L CW. F->D, D->B, B->U, U->F
      this.rotateFaceCW(FACES['R']); // natively CCW
      this.rotateFaceCW(FACES['L']); this.rotateFaceCW(FACES['L']); this.rotateFaceCW(FACES['L']);
      const s = this.state.slice();
      for (let i=0; i<9; i++) {
        this.state[18 + i] = s[0 + i];         // F gets U
        this.state[27 + i] = s[18 + i];        // D gets F
        this.state[45 + i] = s[27 + (8 - i)];  // B gets D (reversed)
        this.state[0 + i] = s[45 + (8 - i)];   // U gets B (reversed)
      }
      return;
    }
    if (face === 'Y') {
      // Y CCW: U-axis CCW. U CCW, D CW. F->R, R->B, B->L, L->F
      this.rotateFaceCW(FACES['U']); // natively CCW
      this.rotateFaceCW(FACES['D']); this.rotateFaceCW(FACES['D']); this.rotateFaceCW(FACES['D']);
      const s = this.state.slice();
      for (let i=0; i<9; i++) {
        this.state[18 + i] = s[36 + i];        // F gets L
        this.state[9 + i] = s[18 + i];         // R gets F
        this.state[45 + i] = s[9 + i];         // B gets R
        this.state[36 + i] = s[45 + i];        // L gets B
      }
      return;
    }
    if (face === 'Z') {
      // Z CCW: F-axis CCW. F CCW, B CW. U->L, L->D, D->R, R->U
      this.rotateFaceCW(FACES['F']); // natively CCW
      this.rotateFaceCW(FACES['B']); this.rotateFaceCW(FACES['B']); this.rotateFaceCW(FACES['B']);
      const s = this.state.slice();
      const rotCCW = [2,5,8, 1,4,7, 0,3,6];
      for (let i=0; i<9; i++) {
        this.state[36 + i] = s[0 + rotCCW[i]];   // L gets U rotated CCW
        this.state[27 + i] = s[36 + rotCCW[i]];  // D gets L rotated CCW
        this.state[9 + i] = s[27 + rotCCW[i]];   // R gets D rotated CCW
        this.state[0 + i] = s[9 + rotCCW[i]];    // U gets R rotated CCW
      }
      return;
    }

    // 0:U, 1:R, 2:F, 3:D, 4:L, 5:B
    if (FACES[face as keyof typeof FACES] !== undefined) {
      this.rotateFaceCW(FACES[face as keyof typeof FACES]);
    }

    // Adjacent cyclic rotations
    // The indices follow standard top-left to bottom-right per face 0-8.
    switch (face) {
      case 'U':
        this.cycle(this.state, [45, 9, 18, 36]);
        this.cycle(this.state, [46, 10, 19, 37]);
        this.cycle(this.state, [47, 11, 20, 38]);
        break;
      case 'D':
        this.cycle(this.state, [24, 15, 51, 42]);
        this.cycle(this.state, [25, 16, 52, 43]);
        this.cycle(this.state, [26, 17, 53, 44]);
        break;
      case 'F':
        this.cycle(this.state, [6, 9, 29, 44]);
        this.cycle(this.state, [7, 12, 28, 41]);
        this.cycle(this.state, [8, 15, 27, 38]);
        break;
      case 'B':
        this.cycle(this.state, [2, 36, 33, 17]);
        this.cycle(this.state, [1, 39, 34, 14]);
        this.cycle(this.state, [0, 42, 35, 11]);
        break;
      case 'R':
        this.cycle(this.state, [8, 45, 35, 26]);
        this.cycle(this.state, [5, 48, 32, 23]);
        this.cycle(this.state, [2, 51, 29, 20]);
        break;
      case 'L':
        this.cycle(this.state, [0, 18, 27, 53]);
        this.cycle(this.state, [3, 21, 30, 50]);
        this.cycle(this.state, [6, 24, 33, 47]);
        break;
    }
  }

  public applyAlgorithm(algo: string) {
    const MOVE_TOKEN_REGEX = /([RULDFBruldfb][wW]?(?:2|²|')?|[MESmesxyzXYZ](?:2|²|')?|[()])/g;
    const tokens = algo.trim().match(MOVE_TOKEN_REGEX) || [];
    tokens.forEach(t => {
       if (t !== '(' && t !== ')') {
         this.applyMove(t);
       }
    });
  }
}
