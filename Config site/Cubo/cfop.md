# CFOP - 119 Casos por Camada

Este guia lista os 119 casos normalmente associados ao CFOP completo:

- Cruz: primeira camada, etapa intuitiva, nao entra nos 119 algoritmos.
- F2L: primeiras duas camadas, 41 casos.
- OLL: orientacao da ultima camada, 57 casos.
- PLL: permutacao da ultima camada, 21 casos.

Notacao basica:

- `'` significa anti-horario: `R'`, `U'`, `F'`.
- `2` significa giro duplo: `R2`, `U2`, `M2`.
- `x`, `y`, `z` sao rotacoes do cubo inteiro.
- `r`, `l`, `f` sao wide moves, ou seja, camada externa + camada do meio.
- `M`, `S`, `E` sao movimentos de fatia central.

Fontes de conferencia: SpeedCubeDB, Cube.Academy, J Perm e Speedsolving Wiki.

## Resumo por camada

| Etapa | Camada | Quantidade | Objetivo |
|---|---:|---:|---|
| Cruz | 1a camada | 0 | Montar a cruz inicial de forma intuitiva |
| F2L | 1a + 2a camadas | 41 | Inserir os 4 pares canto+aresta |
| OLL | Ultima camada | 57 | Orientar todas as pecas da ultima camada |
| PLL | Ultima camada | 21 | Permutar a ultima camada e finalizar o cubo |

Total: 41 + 57 + 21 = 119 casos.

## F2L - Primeiras duas camadas - 41 casos

| # | Caso | Camada | Grupo | Algoritmo |
|---:|---|---|---|---|
| 1 | F2L 01 | 1a + 2a | Free Pairs | `U R U' R'` |
| 2 | F2L 02 | 1a + 2a | Free Pairs | `F R' F' R` |
| 3 | F2L 03 | 1a + 2a | Free Pairs | `F' U' F` |
| 4 | F2L 04 | 1a + 2a | Free Pairs | `R U R'` |
| 5 | F2L 05 | 1a + 2a | Disconnected Pairs | `U' R U R' U2 R U' R'` |
| 6 | F2L 06 | 1a + 2a | Disconnected Pairs | `U' r U' R' U R U r'` |
| 7 | F2L 07 | 1a + 2a | Disconnected Pairs | `U' R U2 R' U' R U2 R'` |
| 8 | F2L 08 | 1a + 2a | Disconnected Pairs | `d R' U2 R U R' U2 R` |
| 9 | F2L 09 | 1a + 2a | Disconnected Pairs | `U' R U' R' U F' U' F` |
| 10 | F2L 10 | 1a + 2a | Disconnected Pairs | `U' R U R' U R U R'` |
| 11 | F2L 11 | 1a + 2a | Connected Pairs | `U' R U2 R' U F' U' F` |
| 12 | F2L 12 | 1a + 2a | Connected Pairs | `R U' R' U R U' R' U2 R U' R'` |
| 13 | F2L 13 | 1a + 2a | Connected Pairs | `y' U R' U R U' R' U' R` |
| 14 | F2L 14 | 1a + 2a | Connected Pairs | `U' R U' R' U R U R'` |
| 15 | F2L 15 | 1a + 2a | Connected Pairs | `R' D' R U' R' D R U R U' R'` |
| 16 | F2L 16 | 1a + 2a | Connected Pairs | `R U' R' U2 F' U' F` |
| 17 | F2L 17 | 1a + 2a | Connected Pairs | `R U2 R' U' R U R'` |
| 18 | F2L 18 | 1a + 2a | Connected Pairs | `y' R' U2 R U R' U' R` |
| 19 | F2L 19 | 1a + 2a | Disconnected Pairs | `U R U2 R' U R U' R'` |
| 20 | F2L 20 | 1a + 2a | Disconnected Pairs | `y' U' R' U2 R U' R' U R` |
| 21 | F2L 21 | 1a + 2a | Disconnected Pairs | `U2 R U R' U R U' R'` |
| 22 | F2L 22 | 1a + 2a | Disconnected Pairs | `r U' r' U2 r U r'` |
| 23 | F2L 23 | 1a + 2a | Connected Pairs | `U R U' R' U' R U' R' U R U' R'` |
| 24 | F2L 24 | 1a + 2a | Connected Pairs | `F U R U' R' F' R U' R'` |
| 25 | F2L 25 | 1a + 2a | Corner In Slot | `U' R' F R F' R U R'` |
| 26 | F2L 26 | 1a + 2a | Corner In Slot | `U R U' R' F R' F' R` |
| 27 | F2L 27 | 1a + 2a | Corner In Slot | `R U' R' U R U' R'` |
| 28 | F2L 28 | 1a + 2a | Corner In Slot | `R U R' U' F R' F' R` |
| 29 | F2L 29 | 1a + 2a | Corner In Slot | `R' F R F' U R U' R'` |
| 30 | F2L 30 | 1a + 2a | Corner In Slot | `R U R' U' R U R'` |
| 31 | F2L 31 | 1a + 2a | Edge In Slot | `U' R' F R F' R U' R'` |
| 32 | F2L 32 | 1a + 2a | Edge In Slot | `U R U' R' U R U' R' U R U' R'` |
| 33 | F2L 33 | 1a + 2a | Edge In Slot | `U' R U' R' U2 R U' R'` |
| 34 | F2L 34 | 1a + 2a | Edge In Slot | `U R U R' U2 R U R'` |
| 35 | F2L 35 | 1a + 2a | Edge In Slot | `U' R U R' U F' U' F` |
| 36 | F2L 36 | 1a + 2a | Edge In Slot | `U F' U' F U' R U R'` |
| 37 | F2L 37 | 1a + 2a | Pieces In Slot | `R2 U2 F R2 F' U2 R' U R'` |
| 38 | F2L 38 | 1a + 2a | Pieces In Slot | `R U' R' U' R U R' U2 R U' R'` |
| 39 | F2L 39 | 1a + 2a | Pieces In Slot | `R U' R' U R U2 R' U R U' R'` |
| 40 | F2L 40 | 1a + 2a | Pieces In Slot | `r U' r' U2 r U r' R U R'` |
| 41 | F2L 41 | 1a + 2a | Pieces In Slot | `R U' R' r U' r' U2 r U r'` |

## OLL - Orientacao da ultima camada - 57 casos

| # | Caso | Camada | Grupo | Algoritmo |
|---:|---|---|---|---|
| 42 | OLL 01 | Ultima | Solved Cross | `R U R' U R U2 R'` |
| 43 | OLL 02 | Ultima | Solved Cross | `R U2 R' U' R U' R'` |
| 44 | OLL 03 | Ultima | Solved Cross | `R U R' U R U' R' U R U2 R'` |
| 45 | OLL 04 | Ultima | Solved Cross | `R U2 R2 U' R2 U' R2 U2 R` |
| 46 | OLL 05 | Ultima | Solved Cross | `R U R D R' U' R D' R2` |
| 47 | OLL 06 | Ultima | Solved Cross | `R2 D' R U' R' D R U R` |
| 48 | OLL 07 | Ultima | Solved Cross | `R2 D R' U2 R D' R' U2 R'` |
| 49 | OLL 08 | Ultima | T Shapes | `F R U R' U' F'` |
| 50 | OLL 09 | Ultima | T Shapes | `R U R' U' R' F R F'` |
| 51 | OLL 10 | Ultima | Block Shapes | `r U2 R' U' R U' r'` |
| 52 | OLL 11 | Ultima | Block Shapes | `r' U2 R U R' U r` |
| 53 | OLL 12 | Ultima | Edges Only | `r U R' U' M U R U' R'` |
| 54 | OLL 13 | Ultima | Edges Only | `R U R' U' M' U R U' r'` |
| 55 | OLL 14 | Ultima | Lightning Shapes | `r U R' U R U2 r'` |
| 56 | OLL 15 | Ultima | Lightning Shapes | `R' F' r U' r' F2 R` |
| 57 | OLL 16 | Ultima | Lightning Shapes | `r' R2 U R' U R U2 R' U M'` |
| 58 | OLL 17 | Ultima | Lightning Shapes | `r R2 U' R U' R' U2 R U' M` |
| 59 | OLL 18 | Ultima | Lightning Shapes | `f R' F' R U R U' R' S'` |
| 60 | OLL 19 | Ultima | Lightning Shapes | `f' r U r' U' r' F r S` |
| 61 | OLL 20 | Ultima | P Shapes | `F U R U' R' F'` |
| 62 | OLL 21 | Ultima | P Shapes | `R' U' F' U F R` |
| 63 | OLL 22 | Ultima | P Shapes | `R' U' F U R U' R' F' R` |
| 64 | OLL 23 | Ultima | P Shapes | `S R U R' U' R' F R f'` |
| 65 | OLL 24 | Ultima | C Shapes | `R' U' R' F R F' U R` |
| 66 | OLL 25 | Ultima | C Shapes | `f R f' U' r' U' R U M'` |
| 67 | OLL 26 | Ultima | Fish Shapes | `F R' F' R U R U' R'` |
| 68 | OLL 27 | Ultima | Fish Shapes | `R U2 R2 F R F' R U2 R'` |
| 69 | OLL 28 | Ultima | Fish Shapes | `R U R' U' R' F R2 U R' U' F'` |
| 70 | OLL 29 | Ultima | Fish Shapes | `R U R' U R' F R F' R U2 R'` |
| 71 | OLL 30 | Ultima | W Shapes | `R U R' U R U' R' U' R' F R F'` |
| 72 | OLL 31 | Ultima | W Shapes | `L' U' L U' L' U L U r U' r' F` |
| 73 | OLL 32 | Ultima | Hook Shapes | `F R U R' U' R U R' U' F'` |
| 74 | OLL 33 | Ultima | Hook Shapes | `F R' F' R U2 R U' R' U R U2 R'` |
| 75 | OLL 34 | Ultima | Hook Shapes | `r U R' U R U' R' U R U2 r'` |
| 76 | OLL 35 | Ultima | Hook Shapes | `r' U' R U' R' U R U' R' U2 r` |
| 77 | OLL 36 | Ultima | Hook Shapes | `r U' r2 U r2 U r2 U' r` |
| 78 | OLL 37 | Ultima | Hook Shapes | `r' U r2 U' r2 U' r2 U r'` |
| 79 | OLL 38 | Ultima | Line Shapes | `F U R U' R' U R U' R' F'` |
| 80 | OLL 39 | Ultima | Line Shapes | `R' F' U' F U' R U R' U R` |
| 81 | OLL 40 | Ultima | Line Shapes | `r U r' U R U' R' U R U' R' r U' r'` |
| 82 | OLL 41 | Ultima | Line Shapes | `R' F R U R U' R2 F' R2 U' R' U R U R'` |
| 83 | OLL 42 | Ultima | L Shapes | `r U r' R U R' U' r U' r'` |
| 84 | OLL 43 | Ultima | L Shapes | `R' F' R L' U' L U R' F R` |
| 85 | OLL 44 | Ultima | L Shapes | `F U R U' R2 F' R U R U' R'` |
| 86 | OLL 45 | Ultima | L Shapes | `R' F R U R' F' R F U' F'` |
| 87 | OLL 46 | Ultima | Awkward Shapes | `r2 D' r U r' D r2 U' r' U' r` |
| 88 | OLL 47 | Ultima | Awkward Shapes | `F U R U2 R' U' R U2 R' U' F'` |
| 89 | OLL 48 | Ultima | Awkward Shapes | `R U R' U R U2 R' F R U R' U' F'` |
| 90 | OLL 49 | Ultima | Awkward Shapes | `R' U' F2 u' R U R' D R2 B` |
| 91 | OLL 50 | Ultima | Dot Cases | `R U2 R2 F R F' U2 R' F R F'` |
| 92 | OLL 51 | Ultima | Dot Cases | `f U R U' R' S' U R U' R' F'` |
| 93 | OLL 52 | Ultima | Dot Cases | `F R' F' R U S' R U' R' S` |
| 94 | OLL 53 | Ultima | Dot Cases | `S' R U R' S U' R' F R F'` |
| 95 | OLL 54 | Ultima | Dot Cases | `r U R' U R U2 r' r' U' R U' R' U2 r` |
| 96 | OLL 55 | Ultima | Dot Cases | `R' F2 R2 U2 R' F' R U2 R2 F2 R` |
| 97 | OLL 56 | Ultima | Dot Cases | `S R' U' R U R U R U' R' S'` |
| 98 | OLL 57 | Ultima | Dot Cases | `R' F2 R2 U2 R' F R U2 R2 F2 R` |

## PLL - Permutacao da ultima camada - 21 casos

| # | Caso | Camada | Grupo | Algoritmo |
|---:|---|---|---|---|
| 99 | PLL Ua | Ultima | Edges Only | `R U R' U R' U' R2 U' R' U R' U R` |
| 100 | PLL Ub | Ultima | Edges Only | `R' U R' U' R3 U' R' U R U R2` |
| 101 | PLL H | Ultima | Edges Only | `M2 U' M2 U2 M2 U' M2` |
| 102 | PLL Z | Ultima | Edges Only | `M' U' M2 U' M2 U' M' U2 M2` |
| 103 | PLL Aa | Ultima | Corners Only | `x R' U R' D2 R U' R' D2 R2 x'` |
| 104 | PLL Ab | Ultima | Corners Only | `x R2 D2 R U R' D2 R U' R x'` |
| 105 | PLL E | Ultima | Corners Only | `x' R U' R' D R U R' D' R U R' D R U' R' D' x` |
| 106 | PLL Jb | Ultima | Adjacent Swap | `R U R' U' R' F R2 U' R' U' R U R' F'` |
| 107 | PLL Ja | Ultima | Adjacent Swap | `R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R` |
| 108 | PLL Ra | Ultima | Adjacent Swap | `R U' R' U' R U R D R' U' R D' R' U2 R'` |
| 109 | PLL Rb | Ultima | Adjacent Swap | `R' U2 R U2 R' F R U R' U' R' F' R2` |
| 110 | PLL T | Ultima | Adjacent Swap | `x R2 F R F' R U2 r' U r U2 x'` |
| 111 | PLL F | Ultima | Adjacent Swap | `R U R' F' R U R' U' R' F R2 U' R'` |
| 112 | PLL Y | Ultima | Diagonal Swap | `F R U' R' U' R U R' F' R U R' U' R' F R F'` |
| 113 | PLL Na | Ultima | Diagonal Swap | `R U R' U R U R' F' R U R' U' R' F R2 U' R'` |
| 114 | PLL Nb | Ultima | Diagonal Swap | `R' U R U' R' F' U' F R U R' F R' F' R U' R` |
| 115 | PLL V | Ultima | Diagonal Swap | `R' U R' U' R D' R' D R' U D' R2 U' R2 D R2` |
| 116 | PLL Ga | Ultima | G-Perms | `R2 U R' U R' U' R U' R2 D U' R' U R D'` |
| 117 | PLL Gb | Ultima | G-Perms | `D R' U' R U D' R2 U R' U R U' R U' R2` |
| 118 | PLL Gc | Ultima | G-Perms | `R2 U' R U' R U R' U R2 D' U R U' R' D` |
| 119 | PLL Gd | Ultima | G-Perms | `R U R' U' D R2 U' R U' R' U R' U R2 D'` |
