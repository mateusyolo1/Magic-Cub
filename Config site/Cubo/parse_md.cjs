const fs = require('fs');

const md = fs.readFileSync('cfop.md', 'utf8');

const regex = /\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*`(.+?)`\s*\|/g;
let match;
const algos = [];

while ((match = regex.exec(md)) !== null) {
  algos.push({
    id: `algo-${match[1]}`,
    name: match[2].trim(),
    category: match[4].trim(),
    sequence: match[5].trim()
  });
}

const out = `export type AlgorithmDef = {
  id: string;
  name: string;
  category: string;
  sequence: string;
};

export type AlgoStep = {
  id: number;
  move: string;
  chunk: number;
  desc: string;
};

export const defaultAlgorithms: AlgorithmDef[] = ${JSON.stringify(algos, null, 2)};

export function parseSequence(seq: string): AlgoStep[] {
  // Capture parens explicitly, and standard moves
  const tokens = seq.trim().replace(/2/g, '²').match(/[()[\\]{}RULDFBxyzMSEruldvw][w]?'?²?/g) || [];
  
  let currentChunk = 1;
  const result: AlgoStep[] = [];
  
  // check if there are parens at all. If not, auto chunk by 4!
  const hasParens = tokens.includes('(') || tokens.includes(')');
  
  let tempMoveCounter = 0;
  
  for (let m of tokens) {
    if (m === '(') {
       // Only start a new chunk if we already had moves in current chunk
       if (result.filter(r => r.chunk === currentChunk).length > 0) {
         currentChunk++;
       }
    } else if (m === ')') {
       // Pre-emptively advance chunk for next moves
       currentChunk++;
    } else {
       // if not using parens, auto chunk every 4 moves
       if (!hasParens && tempMoveCounter > 0 && tempMoveCounter % 4 === 0) {
         currentChunk++;
       }
       
       result.push({
         id: result.length,
         move: m,
         chunk: currentChunk,
         desc: \`Movimento \${m}\`
       });
       tempMoveCounter++;
    }
  }
  
  return result;
}
`;

fs.writeFileSync('src/algorithms.ts', out);
