export type AlgorithmDef = {
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

export const defaultAlgorithms: AlgorithmDef[] = [
  {
    "id": "algo-1",
    "name": "F2L 01",
    "category": "Free Pairs",
    "sequence": "U R U' R'"
  },
  {
    "id": "algo-2",
    "name": "F2L 02",
    "category": "Free Pairs",
    "sequence": "F R' F' R"
  },
  {
    "id": "algo-3",
    "name": "F2L 03",
    "category": "Free Pairs",
    "sequence": "F' U' F"
  },
  {
    "id": "algo-4",
    "name": "F2L 04",
    "category": "Free Pairs",
    "sequence": "R U R'"
  },
  {
    "id": "algo-5",
    "name": "F2L 05",
    "category": "Disconnected Pairs",
    "sequence": "U' R U R' U2 R U' R'"
  },
  {
    "id": "algo-6",
    "name": "F2L 06",
    "category": "Disconnected Pairs",
    "sequence": "U' r U' R' U R U r'"
  },
  {
    "id": "algo-7",
    "name": "F2L 07",
    "category": "Disconnected Pairs",
    "sequence": "U' R U2 R' U' R U2 R'"
  },
  {
    "id": "algo-8",
    "name": "F2L 08",
    "category": "Disconnected Pairs",
    "sequence": "d R' U2 R U R' U2 R"
  },
  {
    "id": "algo-9",
    "name": "F2L 09",
    "category": "Disconnected Pairs",
    "sequence": "U' R U' R' U F' U' F"
  },
  {
    "id": "algo-10",
    "name": "F2L 10",
    "category": "Disconnected Pairs",
    "sequence": "U' R U R' U R U R'"
  },
  {
    "id": "algo-11",
    "name": "F2L 11",
    "category": "Connected Pairs",
    "sequence": "U' R U2 R' U F' U' F"
  },
  {
    "id": "algo-12",
    "name": "F2L 12",
    "category": "Connected Pairs",
    "sequence": "R U' R' U R U' R' U2 R U' R'"
  },
  {
    "id": "algo-13",
    "name": "F2L 13",
    "category": "Connected Pairs",
    "sequence": "y' U R' U R U' R' U' R"
  },
  {
    "id": "algo-14",
    "name": "F2L 14",
    "category": "Connected Pairs",
    "sequence": "U' R U' R' U R U R'"
  },
  {
    "id": "algo-15",
    "name": "F2L 15",
    "category": "Connected Pairs",
    "sequence": "R' D' R U' R' D R U R U' R'"
  },
  {
    "id": "algo-16",
    "name": "F2L 16",
    "category": "Connected Pairs",
    "sequence": "R U' R' U2 F' U' F"
  },
  {
    "id": "algo-17",
    "name": "F2L 17",
    "category": "Connected Pairs",
    "sequence": "R U2 R' U' R U R'"
  },
  {
    "id": "algo-18",
    "name": "F2L 18",
    "category": "Connected Pairs",
    "sequence": "y' R' U2 R U R' U' R"
  },
  {
    "id": "algo-19",
    "name": "F2L 19",
    "category": "Disconnected Pairs",
    "sequence": "U R U2 R' U R U' R'"
  },
  {
    "id": "algo-20",
    "name": "F2L 20",
    "category": "Disconnected Pairs",
    "sequence": "y' U' R' U2 R U' R' U R"
  },
  {
    "id": "algo-21",
    "name": "F2L 21",
    "category": "Disconnected Pairs",
    "sequence": "U2 R U R' U R U' R'"
  },
  {
    "id": "algo-22",
    "name": "F2L 22",
    "category": "Disconnected Pairs",
    "sequence": "r U' r' U2 r U r'"
  },
  {
    "id": "algo-23",
    "name": "F2L 23",
    "category": "Connected Pairs",
    "sequence": "U R U' R' U' R U' R' U R U' R'"
  },
  {
    "id": "algo-24",
    "name": "F2L 24",
    "category": "Connected Pairs",
    "sequence": "F U R U' R' F' R U' R'"
  },
  {
    "id": "algo-25",
    "name": "F2L 25",
    "category": "Corner In Slot",
    "sequence": "U' R' F R F' R U R'"
  },
  {
    "id": "algo-26",
    "name": "F2L 26",
    "category": "Corner In Slot",
    "sequence": "U R U' R' F R' F' R"
  },
  {
    "id": "algo-27",
    "name": "F2L 27",
    "category": "Corner In Slot",
    "sequence": "R U' R' U R U' R'"
  },
  {
    "id": "algo-28",
    "name": "F2L 28",
    "category": "Corner In Slot",
    "sequence": "R U R' U' F R' F' R"
  },
  {
    "id": "algo-29",
    "name": "F2L 29",
    "category": "Corner In Slot",
    "sequence": "R' F R F' U R U' R'"
  },
  {
    "id": "algo-30",
    "name": "F2L 30",
    "category": "Corner In Slot",
    "sequence": "R U R' U' R U R'"
  },
  {
    "id": "algo-31",
    "name": "F2L 31",
    "category": "Edge In Slot",
    "sequence": "U' R' F R F' R U' R'"
  },
  {
    "id": "algo-32",
    "name": "F2L 32",
    "category": "Edge In Slot",
    "sequence": "U R U' R' U R U' R' U R U' R'"
  },
  {
    "id": "algo-33",
    "name": "F2L 33",
    "category": "Edge In Slot",
    "sequence": "U' R U' R' U2 R U' R'"
  },
  {
    "id": "algo-34",
    "name": "F2L 34",
    "category": "Edge In Slot",
    "sequence": "U R U R' U2 R U R'"
  },
  {
    "id": "algo-35",
    "name": "F2L 35",
    "category": "Edge In Slot",
    "sequence": "U' R U R' U F' U' F"
  },
  {
    "id": "algo-36",
    "name": "F2L 36",
    "category": "Edge In Slot",
    "sequence": "U F' U' F U' R U R'"
  },
  {
    "id": "algo-37",
    "name": "F2L 37",
    "category": "Pieces In Slot",
    "sequence": "R2 U2 F R2 F' U2 R' U R'"
  },
  {
    "id": "algo-38",
    "name": "F2L 38",
    "category": "Pieces In Slot",
    "sequence": "R U' R' U' R U R' U2 R U' R'"
  },
  {
    "id": "algo-39",
    "name": "F2L 39",
    "category": "Pieces In Slot",
    "sequence": "R U' R' U R U2 R' U R U' R'"
  },
  {
    "id": "algo-40",
    "name": "F2L 40",
    "category": "Pieces In Slot",
    "sequence": "r U' r' U2 r U r' R U R'"
  },
  {
    "id": "algo-41",
    "name": "F2L 41",
    "category": "Pieces In Slot",
    "sequence": "R U' R' r U' r' U2 r U r'"
  },
  {
    "id": "algo-42",
    "name": "OLL 01",
    "category": "Solved Cross",
    "sequence": "R U R' U R U2 R'"
  },
  {
    "id": "algo-43",
    "name": "OLL 02",
    "category": "Solved Cross",
    "sequence": "R U2 R' U' R U' R'"
  },
  {
    "id": "algo-44",
    "name": "OLL 03",
    "category": "Solved Cross",
    "sequence": "R U R' U R U' R' U R U2 R'"
  },
  {
    "id": "algo-45",
    "name": "OLL 04",
    "category": "Solved Cross",
    "sequence": "R U2 R2 U' R2 U' R2 U2 R"
  },
  {
    "id": "algo-46",
    "name": "OLL 05",
    "category": "Solved Cross",
    "sequence": "R U R D R' U' R D' R2"
  },
  {
    "id": "algo-47",
    "name": "OLL 06",
    "category": "Solved Cross",
    "sequence": "R2 D' R U' R' D R U R"
  },
  {
    "id": "algo-48",
    "name": "OLL 07",
    "category": "Solved Cross",
    "sequence": "R2 D R' U2 R D' R' U2 R'"
  },
  {
    "id": "algo-49",
    "name": "OLL 08",
    "category": "T Shapes",
    "sequence": "F R U R' U' F'"
  },
  {
    "id": "algo-50",
    "name": "OLL 09",
    "category": "T Shapes",
    "sequence": "R U R' U' R' F R F'"
  },
  {
    "id": "algo-51",
    "name": "OLL 10",
    "category": "Block Shapes",
    "sequence": "r U2 R' U' R U' r'"
  },
  {
    "id": "algo-52",
    "name": "OLL 11",
    "category": "Block Shapes",
    "sequence": "r' U2 R U R' U r"
  },
  {
    "id": "algo-53",
    "name": "OLL 12",
    "category": "Edges Only",
    "sequence": "r U R' U' M U R U' R'"
  },
  {
    "id": "algo-54",
    "name": "OLL 13",
    "category": "Edges Only",
    "sequence": "R U R' U' M' U R U' r'"
  },
  {
    "id": "algo-55",
    "name": "OLL 14",
    "category": "Lightning Shapes",
    "sequence": "r U R' U R U2 r'"
  },
  {
    "id": "algo-56",
    "name": "OLL 15",
    "category": "Lightning Shapes",
    "sequence": "R' F' r U' r' F2 R"
  },
  {
    "id": "algo-57",
    "name": "OLL 16",
    "category": "Lightning Shapes",
    "sequence": "r' R2 U R' U R U2 R' U M'"
  },
  {
    "id": "algo-58",
    "name": "OLL 17",
    "category": "Lightning Shapes",
    "sequence": "r R2 U' R U' R' U2 R U' M"
  },
  {
    "id": "algo-59",
    "name": "OLL 18",
    "category": "Lightning Shapes",
    "sequence": "f R' F' R U R U' R' S'"
  },
  {
    "id": "algo-60",
    "name": "OLL 19",
    "category": "Lightning Shapes",
    "sequence": "f' r U r' U' r' F r S"
  },
  {
    "id": "algo-61",
    "name": "OLL 20",
    "category": "P Shapes",
    "sequence": "F U R U' R' F'"
  },
  {
    "id": "algo-62",
    "name": "OLL 21",
    "category": "P Shapes",
    "sequence": "R' U' F' U F R"
  },
  {
    "id": "algo-63",
    "name": "OLL 22",
    "category": "P Shapes",
    "sequence": "R' U' F U R U' R' F' R"
  },
  {
    "id": "algo-64",
    "name": "OLL 23",
    "category": "P Shapes",
    "sequence": "S R U R' U' R' F R f'"
  },
  {
    "id": "algo-65",
    "name": "OLL 24",
    "category": "C Shapes",
    "sequence": "R' U' R' F R F' U R"
  },
  {
    "id": "algo-66",
    "name": "OLL 25",
    "category": "C Shapes",
    "sequence": "f R f' U' r' U' R U M'"
  },
  {
    "id": "algo-67",
    "name": "OLL 26",
    "category": "Fish Shapes",
    "sequence": "F R' F' R U R U' R'"
  },
  {
    "id": "algo-68",
    "name": "OLL 27",
    "category": "Fish Shapes",
    "sequence": "R U2 R2 F R F' R U2 R'"
  },
  {
    "id": "algo-69",
    "name": "OLL 28",
    "category": "Fish Shapes",
    "sequence": "R U R' U' R' F R2 U R' U' F'"
  },
  {
    "id": "algo-70",
    "name": "OLL 29",
    "category": "Fish Shapes",
    "sequence": "R U R' U R' F R F' R U2 R'"
  },
  {
    "id": "algo-71",
    "name": "OLL 30",
    "category": "W Shapes",
    "sequence": "R U R' U R U' R' U' R' F R F'"
  },
  {
    "id": "algo-72",
    "name": "OLL 31",
    "category": "W Shapes",
    "sequence": "L' U' L U' L' U L U r U' r' F"
  },
  {
    "id": "algo-73",
    "name": "OLL 32",
    "category": "Hook Shapes",
    "sequence": "F R U R' U' R U R' U' F'"
  },
  {
    "id": "algo-74",
    "name": "OLL 33",
    "category": "Hook Shapes",
    "sequence": "F R' F' R U2 R U' R' U R U2 R'"
  },
  {
    "id": "algo-75",
    "name": "OLL 34",
    "category": "Hook Shapes",
    "sequence": "r U R' U R U' R' U R U2 r'"
  },
  {
    "id": "algo-76",
    "name": "OLL 35",
    "category": "Hook Shapes",
    "sequence": "r' U' R U' R' U R U' R' U2 r"
  },
  {
    "id": "algo-77",
    "name": "OLL 36",
    "category": "Hook Shapes",
    "sequence": "r U' r2 U r2 U r2 U' r"
  },
  {
    "id": "algo-78",
    "name": "OLL 37",
    "category": "Hook Shapes",
    "sequence": "r' U r2 U' r2 U' r2 U r'"
  },
  {
    "id": "algo-79",
    "name": "OLL 38",
    "category": "Line Shapes",
    "sequence": "F U R U' R' U R U' R' F'"
  },
  {
    "id": "algo-80",
    "name": "OLL 39",
    "category": "Line Shapes",
    "sequence": "R' F' U' F U' R U R' U R"
  },
  {
    "id": "algo-81",
    "name": "OLL 40",
    "category": "Line Shapes",
    "sequence": "r U r' U R U' R' U R U' R' r U' r'"
  },
  {
    "id": "algo-82",
    "name": "OLL 41",
    "category": "Line Shapes",
    "sequence": "R' F R U R U' R2 F' R2 U' R' U R U R'"
  },
  {
    "id": "algo-83",
    "name": "OLL 42",
    "category": "L Shapes",
    "sequence": "r U r' R U R' U' r U' r'"
  },
  {
    "id": "algo-84",
    "name": "OLL 43",
    "category": "L Shapes",
    "sequence": "R' F' R L' U' L U R' F R"
  },
  {
    "id": "algo-85",
    "name": "OLL 44",
    "category": "L Shapes",
    "sequence": "F U R U' R2 F' R U R U' R'"
  },
  {
    "id": "algo-86",
    "name": "OLL 45",
    "category": "L Shapes",
    "sequence": "R' F R U R' F' R F U' F'"
  },
  {
    "id": "algo-87",
    "name": "OLL 46",
    "category": "Awkward Shapes",
    "sequence": "r2 D' r U r' D r2 U' r' U' r"
  },
  {
    "id": "algo-88",
    "name": "OLL 47",
    "category": "Awkward Shapes",
    "sequence": "F U R U2 R' U' R U2 R' U' F'"
  },
  {
    "id": "algo-89",
    "name": "OLL 48",
    "category": "Awkward Shapes",
    "sequence": "R U R' U R U2 R' F R U R' U' F'"
  },
  {
    "id": "algo-90",
    "name": "OLL 49",
    "category": "Awkward Shapes",
    "sequence": "R' U' F2 u' R U R' D R2 B"
  },
  {
    "id": "algo-91",
    "name": "OLL 50",
    "category": "Dot Cases",
    "sequence": "R U2 R2 F R F' U2 R' F R F'"
  },
  {
    "id": "algo-92",
    "name": "OLL 51",
    "category": "Dot Cases",
    "sequence": "f U R U' R' S' U R U' R' F'"
  },
  {
    "id": "algo-93",
    "name": "OLL 52",
    "category": "Dot Cases",
    "sequence": "F R' F' R U S' R U' R' S"
  },
  {
    "id": "algo-94",
    "name": "OLL 53",
    "category": "Dot Cases",
    "sequence": "S' R U R' S U' R' F R F'"
  },
  {
    "id": "algo-95",
    "name": "OLL 54",
    "category": "Dot Cases",
    "sequence": "r U R' U R U2 r' r' U' R U' R' U2 r"
  },
  {
    "id": "algo-96",
    "name": "OLL 55",
    "category": "Dot Cases",
    "sequence": "R' F2 R2 U2 R' F' R U2 R2 F2 R"
  },
  {
    "id": "algo-97",
    "name": "OLL 56",
    "category": "Dot Cases",
    "sequence": "S R' U' R U R U R U' R' S'"
  },
  {
    "id": "algo-98",
    "name": "OLL 57",
    "category": "Dot Cases",
    "sequence": "R' F2 R2 U2 R' F R U2 R2 F2 R"
  },
  {
    "id": "algo-99",
    "name": "PLL Ua",
    "category": "Edges Only",
    "sequence": "R U R' U R' U' R2 U' R' U R' U R"
  },
  {
    "id": "algo-100",
    "name": "PLL Ub",
    "category": "Edges Only",
    "sequence": "R' U R' U' R3 U' R' U R U R2"
  },
  {
    "id": "algo-101",
    "name": "PLL H",
    "category": "Edges Only",
    "sequence": "M2 U' M2 U2 M2 U' M2"
  },
  {
    "id": "algo-102",
    "name": "PLL Z",
    "category": "Edges Only",
    "sequence": "M' U' M2 U' M2 U' M' U2 M2"
  },
  {
    "id": "algo-103",
    "name": "PLL Aa",
    "category": "Corners Only",
    "sequence": "x R' U R' D2 R U' R' D2 R2 x'"
  },
  {
    "id": "algo-104",
    "name": "PLL Ab",
    "category": "Corners Only",
    "sequence": "x R2 D2 R U R' D2 R U' R x'"
  },
  {
    "id": "algo-105",
    "name": "PLL E",
    "category": "Corners Only",
    "sequence": "x' R U' R' D R U R' D' R U R' D R U' R' D' x"
  },
  {
    "id": "algo-106",
    "name": "PLL Jb",
    "category": "Adjacent Swap",
    "sequence": "R U R' U' R' F R2 U' R' U' R U R' F'"
  },
  {
    "id": "algo-107",
    "name": "PLL Ja",
    "category": "Adjacent Swap",
    "sequence": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"
  },
  {
    "id": "algo-108",
    "name": "PLL Ra",
    "category": "Adjacent Swap",
    "sequence": "R U' R' U' R U R D R' U' R D' R' U2 R'"
  },
  {
    "id": "algo-109",
    "name": "PLL Rb",
    "category": "Adjacent Swap",
    "sequence": "R' U2 R U2 R' F R U R' U' R' F' R2"
  },
  {
    "id": "algo-110",
    "name": "PLL T",
    "category": "Adjacent Swap",
    "sequence": "x R2 F R F' R U2 r' U r U2 x'"
  },
  {
    "id": "algo-111",
    "name": "PLL F",
    "category": "Adjacent Swap",
    "sequence": "R U R' F' R U R' U' R' F R2 U' R'"
  },
  {
    "id": "algo-112",
    "name": "PLL Y",
    "category": "Diagonal Swap",
    "sequence": "F R U' R' U' R U R' F' R U R' U' R' F R F'"
  },
  {
    "id": "algo-113",
    "name": "PLL Na",
    "category": "Diagonal Swap",
    "sequence": "R U R' U R U R' F' R U R' U' R' F R2 U' R'"
  },
  {
    "id": "algo-114",
    "name": "PLL Nb",
    "category": "Diagonal Swap",
    "sequence": "R' U R U' R' F' U' F R U R' F R' F' R U' R"
  },
  {
    "id": "algo-115",
    "name": "PLL V",
    "category": "Diagonal Swap",
    "sequence": "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2"
  },
  {
    "id": "algo-116",
    "name": "PLL Ga",
    "category": "G-Perms",
    "sequence": "R2 U R' U R' U' R U' R2 D U' R' U R D'"
  },
  {
    "id": "algo-117",
    "name": "PLL Gb",
    "category": "G-Perms",
    "sequence": "D R' U' R U D' R2 U R' U R U' R U' R2"
  },
  {
    "id": "algo-118",
    "name": "PLL Gc",
    "category": "G-Perms",
    "sequence": "R2 U' R U' R U R' U R2 D' U R U' R' D"
  },
  {
    "id": "algo-119",
    "name": "PLL Gd",
    "category": "G-Perms",
    "sequence": "R U R' U' D R2 U' R U' R' U R' U R2 D'"
  }
];

export function invertMoveStr(m: string): string {
  if (m.includes('²') || m.includes('2')) return m;
  if (m.includes("'")) return m.replace("'", "");
  return m + "'";
}

export function invertSequenceStr(seq: string): string {
  // Capture standard moves, filter out parens
  const tokens = seq.trim().replace(/2/g, '²').match(/[()[\]{}RULDFBxyzMSEruldvw][w]?'?²?/g) || [];
  const validTokens = tokens.filter(t => !['(', ')', '[', ']', '{', '}'].includes(t));
  const inverted = validTokens.map(invertMoveStr).reverse();
  return inverted.join(' ');
}

export function parseSequence(seq: string): AlgoStep[] {
  // Capture parens explicitly, and standard moves
  const tokens: string[] = seq.trim().replace(/2/g, '²').match(/[()[\]{}RULDFBxyzMSEruldvw][w]?'?²?/g) || [];
  
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
         desc: `Movimento ${m}`
       });
       tempMoveCounter++;
    }
  }
  
  return result;
}
