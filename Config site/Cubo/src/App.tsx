import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, CheckCircle, EyeOff, Eye, BrainCircuit, Library, Plus, Trash2, Shuffle, BookOpen } from 'lucide-react';
import { CssCube } from './components/Cube3D';
import { CubeMoveVisualizer } from './components/CubeMoveVisualizer';
import { SpeedTimer } from './components/SpeedTimer';
import { defaultAlgorithms, parseSequence, invertSequenceStr, AlgoStep } from './algorithms';
import { HeroTheory } from './components/HeroTheory';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(800);
  const [reps, setReps] = useState(0);
  const [showVisuals, setShowVisuals] = useState(true);
  
  // Progression & Quiz
  const [activeChunk, setActiveChunk] = useState<number | 'all'>(1);
  const [unlockedChunk, setUnlockedChunk] = useState<number | 'all'>(1);
  const [quizMode, setQuizMode] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Premium Custom Skins Configuration (persisted in localStorage)
  const [cubeSkin, setCubeSkin] = useState(() => localStorage.getItem('cube_skin') || 'glossy-stickerless');
  const [internalSkin, setInternalSkin] = useState(() => localStorage.getItem('internal_skin') || 'classic-black');

  useEffect(() => {
    localStorage.setItem('cube_skin', cubeSkin);
  }, [cubeSkin]);

  useEffect(() => {
    localStorage.setItem('internal_skin', internalSkin);
  }, [internalSkin]);
  
  // Library State
  const [algos, setAlgos] = useState(defaultAlgorithms);
  const [currentAlgoId, setCurrentAlgoId] = useState(defaultAlgorithms[0].id);
  const [algoCategory, setAlgoCategory] = useState<string>('all');
  const [customSequence, setCustomSequence] = useState('');
  
  // Scramble State
  const [scrambleInput, setScrambleInput] = useState('');
  const [activeScramble, setActiveScramble] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  
  // Details Modal
  const [showTheory, setShowTheory] = useState(false);

  const selectedAlgoDef = algos.find(a => a.id === currentAlgoId) || algos[0];
  const sourceSequence = isReversed ? invertSequenceStr(selectedAlgoDef.sequence) : selectedAlgoDef.sequence;
  const algorithmData: AlgoStep[] = parseSequence(sourceSequence);
  
  const initialScrambleForCube = activeScramble || invertSequenceStr(sourceSequence);

  const filteredAlgo = activeChunk === 'all' ? algorithmData : algorithmData.filter(m => m.chunk === activeChunk);
  const maxChunks = algorithmData.reduce((acc, a) => Math.max(acc, a.chunk), 1);

  const baseMoves = React.useMemo(() => {
    return activeChunk === 'all' 
      ? [] 
      : algorithmData.filter(m => m.chunk < activeChunk).map(a => a.move);
  }, [activeChunk, currentAlgoId, algos, algorithmData]);

  const quizOptions = React.useMemo(() => {
     const standard = ['R', "R'", 'R²', 'U', "U'", "U²", 'L', "L'", 'F', "F'", 'D', "D'", "B", "M", "M²", "x", "y"];
     const fromAlgo = algorithmData.map(s => s.move);
     return Array.from(new Set([...standard, ...fromAlgo])).sort();
  }, [algorithmData]);

  // Auto-play tick
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isPlaying && !quizMode) {
      const tick = () => {
        setCurrentStep((prev) => {
          if (prev >= filteredAlgo.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      };
      timeoutId = setTimeout(tick, speed);
    }
    return () => clearTimeout(timeoutId);
  }, [isPlaying, speed, quizMode, currentStep, filteredAlgo.length]);

  // Enforce "Cego" when in Quiz Mode
  useEffect(() => {
    if (quizMode) {
      setShowVisuals(false);
    }
  }, [quizMode]);
  
  // Reset sequence progress when changing active chunk or algorithm
  useEffect(() => {
     reset();
  }, [activeChunk, currentAlgoId]);

  const togglePlay = () => {
    if (quizMode) return;
    if (!isPlaying && currentStep >= filteredAlgo.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else if (!isPlaying && currentStep === -1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setMistakes(0);
    setErrorFeedback(false);
  };

  const addRep = () => {
    setReps(prev => prev + 1);
    reset();
  };

  const handleQuizGuess = (move: string) => {
    const nextStep = currentStep + 1;
    if (nextStep >= filteredAlgo.length) return;
    
    // Normalise visually similar variants (U2 vs U'²) just for standard fallback if needed, but strict equality is better.
    if (filteredAlgo[nextStep].move === move) {
      setCurrentStep(nextStep);
      setMistakes(0);
      
      if (nextStep >= filteredAlgo.length - 1) {
         // Finished Quiz Block!
         if (activeChunk === 'all') {
            addRep();
         } else {
            // Unlock next
            const nextCh = (activeChunk as number) + 1;
            if (nextCh > maxChunks) {
               setUnlockedChunk('all');
               setActiveChunk('all');
            } else {
               const currentMax = unlockedChunk === 'all' ? 999 : (unlockedChunk as number);
               if (nextCh > currentMax) {
                  setUnlockedChunk(nextCh);
               }
               setActiveChunk(nextCh);
            }
         }
         setTimeout(() => {
            setQuizMode(false);
            reset();
         }, 1500);
      }
    } else {
      setMistakes(m => m + 1);
      setErrorFeedback(true);
      setTimeout(() => setErrorFeedback(false), 500);
      
      if (mistakes + 1 >= 3) {
         alert("Você errou 3 vezes consecutivas. Retornando ao modo de estudo para este bloco!");
         setQuizMode(false);
         reset();
      }
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSequence.trim()) return;
    const newId = `custom-${Date.now()}`;
    setAlgos([...algos, { id: newId, name: 'Personalizado', category: 'Meus Algos', sequence: customSequence }]);
    setCurrentAlgoId(newId);
    setCustomSequence('');
    setUnlockedChunk(1);
    setActiveChunk(1);
  };
  
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     const nextAlgos = algos.filter(a => a.id !== id);
     setAlgos(nextAlgos);
     if (currentAlgoId === id) {
        setCurrentAlgoId(nextAlgos[0].id);
        setUnlockedChunk(1);
        setActiveChunk(1);
     }
  };
  
  const applyScramble = (e: React.FormEvent) => {
     e.preventDefault();
     setActiveScramble(scrambleInput.trim().toUpperCase());
     reset();
  };

  const currentDesc = currentStep >= 0 && currentStep < filteredAlgo.length 
      ? filteredAlgo[currentStep].desc 
      : 'Inicie ou arraste para visualizar';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans flex flex-col items-center">
      {showTheory && <HeroTheory onClose={() => setShowTheory(false)} />}
      
      <div className="max-w-6xl w-full space-y-6">
        
        {/* Header & Main Stats */}
        <div className="w-full flex flex-col lg:flex-row gap-6">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
             <div>
               <div className="flex justify-between items-start">
                   <div>
                     <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">Treinador Neural</h1>
                     <p className="text-slate-400 mt-2 text-sm lg:text-base max-w-lg">
                       Crie caminhos motores mecânicos e psicológicos. Memorize o CFOP com quizzes sequenciais.
                     </p>
                   </div>
                   <button onClick={() => setShowTheory(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span className="hidden md:inline">Metodologia & Teoria</span>
                   </button>
               </div>
             </div>
             
             <div className="flex items-center gap-4 mt-8">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Repetições Hoje (Apenas Séries Completas)</span>
               <div className="flex items-center gap-3">
                 <p className="text-4xl font-black text-emerald-400 leading-none">{reps}</p>
                 <button onClick={addRep} className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 grid place-items-center transition-all" title="Forçar +1 Repetição">
                   <CheckCircle className="w-5 h-5" />
                 </button>
               </div>
             </div>
           </div>
           
           {/* Spacebar Speed Timer */}
           <div className="lg:w-[400px]">
             <SpeedTimer currentAlgoId={currentAlgoId} />
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Controls Menu */}
          <div className="flex flex-col gap-4 w-full lg:w-[340px]">
            {quizMode ? (
              <div className="bg-purple-900/30 border border-purple-500/50 p-6 rounded-2xl shadow-inner shadow-purple-500/10 flex-1 flex flex-col justify-center min-h-[220px]">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-purple-300 font-bold flex items-center gap-2">
                       <BrainCircuit className="w-5 h-5"/> Próximo?
                    </h4>
                    <span className="text-xs text-red-400 font-bold bg-red-950/50 px-2 py-1 rounded">Erros: {mistakes}/3</span>
                 </div>
                 
                 <div className={`flex flex-wrap justify-center gap-2 ${errorFeedback ? 'animate-shake' : ''}`}>
                    {quizOptions.map(m => (
                       <button
                         key={m} onClick={() => handleQuizGuess(m)}
                         className="bg-purple-800 hover:bg-purple-600 border border-purple-500/50 text-white font-black py-2 px-4 min-w-[60px] rounded-xl shadow-lg transition-transform active:scale-95 text-xl"
                       >
                         {m}
                       </button>
                    ))}
                 </div>
                 {currentStep >= filteredAlgo.length - 1 && filteredAlgo.length > 0 && (
                   <div className="text-emerald-400 font-bold mt-4 text-center animate-pulse">
                     Excelente! Sequência completada.
                   </div>
                 )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex-1 flex flex-col gap-6 justify-center min-h-[220px]">
                <div className="flex gap-3">
                  <button onClick={togglePlay} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? 'Pausar' : 'Iniciar Ritmo'}
                  </button>
                  <button onClick={reset} className="w-16 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 492 492" className="w-5 h-5 text-slate-400 fill-current">
                      <path d="M464.9,284.408c0.053,0,0.105,0.004,0.157,0.004h0.055L464.9,284.408z"/>
                      <path d="M484.004,292.48c-5.063-5.086-11.821-8.025-18.947-8.068H330.468c-14.824,0-26.676,12.3-26.676,27.12v22.78
                            c0,7.156,2.7,13.9,7.788,18.992c5.088,5.092,11.784,7.896,18.94,7.896l39.052,0.008c-32.06,34.332-76.68,53.864-123.672,53.864
                            c-93.22,0-169.072-75.844-169.072-169.072s75.84-169.072,169.064-169.072c69.796,0,133.336,43.82,158.108,109.04
                            c5.632,14.816,20.068,24.776,35.916,24.776c4.66,0,9.248-0.848,13.632-2.52c19.8-7.516,29.784-29.748,22.26-49.544
                            C439.772,63.84,347.376,0.112,245.888,0.112C110.308,0.112,0,110.416,0,246s110.236,245.888,245.816,245.888
                            c62.584,0,123.272-24.632,169.364-67.872v21.788c0,14.824,12.208,26.812,27.032,26.812h22.78
                            c14.824,0,27.008-11.988,27.008-26.812v-134.18C492,304.444,489.116,297.564,484.004,292.48z"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <FastForward className="w-4 h-4" /> Velocidade do Metrônomo
                  </label>
                  <input type="range" min="300" max="1500" step="100" value={1800 - speed} onChange={(e) => setSpeed(1800 - parseInt(e.target.value))} className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Lento</span>
                    <span className="text-slate-300">{ speed <= 500 ? 'Veloz' : speed <= 900 ? 'Normal' : 'Lento' }</span>
                    <span>Rápido</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setQuizMode(!quizMode); reset(); }} className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${quizMode ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-400'}`}>
                <BrainCircuit className="w-4 h-4"/> {quizMode ? 'SAIR QUIZ' : 'MODO QUIZ'}
              </button>
              <button 
                onClick={() => setShowVisuals(!showVisuals)} 
                disabled={quizMode}
                className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border bg-slate-900 text-slate-400 ${quizMode ? 'opacity-50 cursor-not-allowed border-slate-800' : 'border-slate-800 hover:text-white'}`}
              >
                {showVisuals ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showVisuals ? 'Modo Cego' : 'Ver Dicas'}
              </button>
            </div>
            
            {/* Personalização Premium (Skins & Core Configs) */}
            <div className="bg-slate-950/40 border border-[#1e293b] p-4 rounded-xl flex flex-col gap-3.5 mt-1 mb-2 shadow-inner">
               <div>
                  <h4 className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#00c54f] flex items-center gap-1.5 mb-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#00c54f] animate-pulse"></span>
                     Customização Premium GAN
                  </h4>
                  <p className="text-[9.5px] text-slate-400 font-medium">Configure a textura externa das peças e a liga magnética.</p>
               </div>

               {/* Seleção de Skin */}
               <div className="space-y-1.5">
                  <span className="block text-[8px] font-extrabold uppercase tracking-wider text-slate-500">Adesivo / Plástico Externo</span>
                  <div className="grid grid-cols-2 gap-1.5">
                     <button 
                       type="button"
                       onClick={() => setCubeSkin('glossy-stickerless')}
                       className={`p-1.5 rounded-lg text-left border flex flex-col justify-between transition-all ${cubeSkin === 'glossy-stickerless' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                     >
                        <span className="text-[10px] font-bold block leading-none">✨ Glossy Pro</span>
                        <span className="text-[8px] opacity-75 mt-0.5">Polimento 3D</span>
                     </button>
                     <button 
                       type="button"
                       onClick={() => setCubeSkin('carbon-fighter')}
                       className={`p-1.5 rounded-lg text-left border flex flex-col justify-between transition-all ${cubeSkin === 'carbon-fighter' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                     >
                        <span className="text-[10px] font-bold block leading-none">🏎️ Carbon Fighter</span>
                        <span className="text-[8px] opacity-75 mt-0.5">Woven Fibra</span>
                     </button>
                     <button 
                       type="button"
                       onClick={() => setCubeSkin('cyber-neon')}
                       className={`p-1.5 rounded-lg text-left border flex flex-col justify-between transition-all ${cubeSkin === 'cyber-neon' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                     >
                        <span className="text-[10px] font-bold block leading-none">⚡ Cyber Glow</span>
                        <span className="text-[8px] opacity-75 mt-0.5">Neon Luminous</span>
                     </button>
                     <button 
                       type="button"
                       onClick={() => setCubeSkin('frost-satin')}
                       className={`p-1.5 rounded-lg text-left border flex flex-col justify-between transition-all ${cubeSkin === 'frost-satin' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                     >
                        <span className="text-[10px] font-bold block leading-none">❄️ Satin Matte</span>
                        <span className="text-[8px] opacity-75 mt-0.5">Satinado Fosco</span>
                     </button>
                  </div>
               </div>

               {/* Seleção de Core de Contato Interno */}
               <div className="space-y-1.5">
                  <span className="block text-[8px] font-extrabold uppercase tracking-wider text-slate-500">Plástico Interno (Core & Ímãs)</span>
                  <div className="grid grid-cols-3 gap-1.5">
                     <button 
                       type="button"
                       onClick={() => setInternalSkin('classic-black')}
                       className={`p-1 rounded-md text-center border transition-all flex flex-col items-center justify-center gap-1 ${internalSkin === 'classic-black' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_4px_rgba(59,130,246,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                       title="Preto Primário tradicional Gan com contatos Honeycomb"
                     >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
                           <div className="w-1 h-1 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[8px] font-extrabold leading-none">Preto Pro</span>
                     </button>
                     <button 
                       type="button"
                       onClick={() => setInternalSkin('primary-white')}
                       className={`p-1 rounded-md text-center border transition-all flex flex-col items-center justify-center gap-1 ${internalSkin === 'primary-white' ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-[0_0_4px_rgba(59,130,246,0.15)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                       title="Branco Primário tradicional com revestimento especial"
                     >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f3f4f6] border border-slate-200 shadow-inner flex items-center justify-center">
                           <div className="w-1 h-1 rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[8px] font-extrabold leading-none">Branco Core</span>
                     </button>
                     <button 
                       type="button"
                       onClick={() => setInternalSkin('transparent-cyan')}
                       className={`p-1 rounded-md text-center border transition-all flex flex-col items-center justify-center gap-1 ${internalSkin === 'transparent-cyan' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                       title="Edição Colecionador de Vidro Azul Turquesa Translúcido"
                     >
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/30 border border-cyan-400 shadow-inner flex items-center justify-center">
                           <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_2px_cyan]" />
                        </div>
                        <span className="text-[8px] font-extrabold leading-none">Aqua Glass</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Scramble Application */}
            <form onSubmit={applyScramble} className="flex gap-2">
               <input 
                 type="text" value={scrambleInput} onChange={e => setScrambleInput(e.target.value)} 
                 placeholder="R2 U' L2 F2..." 
                 className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 outline-none focus:border-blue-500 transition-colors"
               />
               <button type="submit" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-colors">
                  <Shuffle className="w-5 h-5" />
               </button>
            </form>
          </div>

          {/* 3D Cube Canvas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 min-h-[400px] relative overflow-hidden shadow-inner shadow-black/50">
             <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
             <CssCube step={currentStep} algo={filteredAlgo} speed={speed} scramble={initialScrambleForCube} baseMoves={baseMoves} skin={cubeSkin} internalSkin={internalSkin} />
             <div className="absolute top-4 left-4 right-4 text-center pointer-events-none z-10 mx-auto w-fit max-w-[50%]">
                <span className="inline-block bg-slate-950/80 px-4 py-2 rounded-full border border-slate-700/50 text-slate-300 font-medium shadow-xl backdrop-blur-sm truncate w-full">
                  {currentDesc}
                </span>
             </div>
          </div>
        </div>

        {/* Algorithm Wrapper */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
               <h3 className="font-bold text-slate-300 flex items-center gap-2"><Library className="w-5 h-5 text-blue-400" /> Sequência: {selectedAlgoDef.name}</h3>
               <button 
                 onClick={() => setIsReversed(!isReversed)} 
                 className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded font-bold transition-all ${isReversed ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 ring-1 ring-indigo-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                 title="Inverter Algoritmo (Aprender de trás pra frente)"
               >
                 <svg fill="currentColor" width="14" height="14" viewBox="-1.5 -2.5 24 24" xmlns="http://www.w3.org/2000/svg" className="transform -scale-y-100">
                   <path d="M4.859 5.308l1.594-.488a1 1 0 0 1 .585 1.913l-3.825 1.17a1 1 0 0 1-1.249-.665L.794 3.413a1 1 0 1 1 1.913-.585l.44 1.441C5.555.56 10.332-1.035 14.573.703a9.381 9.381 0 0 1 5.38 5.831 1 1 0 1 1-1.905.608A7.381 7.381 0 0 0 4.86 5.308zm12.327 8.195l-1.775.443a1 1 0 1 1-.484-1.94l3.643-.909a.997.997 0 0 1 .61-.08 1 1 0 0 1 .84.75l.968 3.88a1 1 0 0 1-1.94.484l-.33-1.322a9.381 9.381 0 0 1-16.384-1.796l-.26-.634a1 1 0 1 1 1.851-.758l.26.633a7.381 7.381 0 0 0 13.001 1.25z"></path>
                 </svg>
                 Inverter
               </button>
               {activeScramble && <button onClick={() => setActiveScramble('')} className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded font-bold hover:bg-orange-500/30">Remover Scramble</button>}
             </div>
            <div className="flex gap-2">
              {[...Array(maxChunks)].map((_, i) => {
                 const ch = i + 1;
                 const isUnlocked = unlockedChunk === 'all' || ch <= (unlockedChunk as number);
                 return (
                    <button 
                      key={ch} 
                      disabled={!isUnlocked}
                      onClick={() => { setActiveChunk(ch); reset(); }} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeChunk === ch ? 'bg-blue-600 text-white' : isUnlocked ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'}`}
                    >
                      Bloco {ch} {isUnlocked ? '' : ' 🔒'}
                    </button>
                 );
              })}
              <button 
                disabled={unlockedChunk !== 'all'}
                onClick={() => { setActiveChunk('all'); reset(); }} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeChunk === 'all' ? 'bg-blue-600 text-white' : unlockedChunk === 'all' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'}`}
              >
                Tudo {unlockedChunk === 'all' ? '' : ' 🔒'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap lg:justify-center gap-x-4 gap-y-6">
            {filteredAlgo.length === 0 && <p className="text-slate-500 italic">Nenhum movimento neste bloco.</p>}
            
            {filteredAlgo.map((item, index) => {
              const isActive = index === currentStep;
              const isPassed = index <= currentStep;
              const hideInQuiz = quizMode && !isPassed;

              return (
                <div 
                  key={`${item.id}-${index}`}
                  onClick={() => {
                     // Allow jumping to steps only if NOT in quiz mode
                     if (!quizMode) {
                        setCurrentStep(index);
                        setIsPlaying(false); // Auto-pause if jumping
                     }
                  }}
                  className={`
                    flex flex-col items-center justify-center w-24 h-32 rounded-2xl border-2 transition-all duration-300 shrink-0
                    ${!quizMode ? 'cursor-pointer hover:border-blue-400' : ''}
                    ${isActive ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-[0_0_30px_rgba(37,99,235,0.5)] z-20' 
                               : isPassed ? 'bg-slate-800/80 text-slate-400 border-slate-700/50' 
                                          : 'bg-slate-850 text-slate-600 border-slate-800'}
                  `}
                >
                  {hideInQuiz ? (
                    <span className="text-4xl text-purple-500 font-black mb-2 opacity-50 block">?</span>
                  ) : showVisuals ? (
                    <>
                      <CubeMoveVisualizer move={item.move} isActive={isActive} />
                      <span className="text-2xl font-black font-mono mt-3 leading-none opacity-90">{item.move}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-black font-mono mb-2">?</span>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-40">
                    Bloco {item.chunk}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Library & Custom Config (Hidden in Quiz Mode) */}
        {!quizMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
             {/* Library List */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col max-h-[500px]">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-300 flex items-center gap-2"><Library className="w-5 h-5 text-emerald-400" /> Biblioteca de Algoritmos</h3>
                 <select 
                   value={algoCategory} 
                   onChange={(e) => setAlgoCategory(e.target.value)}
                   className="bg-slate-800 text-slate-300 border border-slate-700 rounded-md px-2 py-1 text-sm outline-none focus:border-emerald-500"
                 >
                   <option value="all">Ver Todos</option>
                   <option value="CFOP - F2L">CFOP - F2L</option>
                   <option value="CFOP - OLL">CFOP - OLL</option>
                   <option value="CFOP - PLL">CFOP - PLL</option>
                   <option value="Meus Algos">Meus Algos</option>
                 </select>
               </div>
               <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                 {algos.filter(a => {
                    if (algoCategory === 'all') return true;
                    if (algoCategory === 'Meus Algos') return a.category === 'Meus Algos';
                    if (algoCategory === 'CFOP - F2L') return a.name.startsWith('F2L');
                    if (algoCategory === 'CFOP - OLL') return a.name.startsWith('OLL');
                    if (algoCategory === 'CFOP - PLL') return a.name.startsWith('PLL');
                    return true;
                 }).map(a => (
                   <button
                     key={a.id}
                     onClick={() => { 
                       setCurrentAlgoId(a.id); 
                       setUnlockedChunk(1);
                       setActiveChunk(1);
                       reset(); 
                     }}
                     className={`w-full text-left p-4 rounded-xl border transition-all relative group ${currentAlgoId === a.id ? 'bg-slate-800 border-emerald-500/50 shadow-inner' : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-700/50'}`}
                   >
                     <div className="flex justify-between items-center pr-8">
                       <span className="font-bold text-slate-200">{a.name}</span>
                       <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-semibold">{a.category}</span>
                     </div>
                     <p className="text-xs font-mono text-slate-500 mt-2 truncate">{a.sequence}</p>
                     
                     {a.category === 'Meus Algos' && (
                       <div 
                         onClick={(e) => handleDeleteCustom(a.id, e)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                         title="Excluir Algoritmo"
                       >
                         <Trash2 className="w-4 h-4" />
                       </div>
                     )}
                   </button>
                 ))}
               </div>
             </div>

             {/* Custom Algorithm Entry */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-start">
                <div>
                  <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-400" /> Registrar Algoritmo</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Insira o código de anotação do CFOP.  <strong>Use parênteses () para delimitar os blocos de estudo.</strong>
                  </p>
                  <form onSubmit={handleAddCustom} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Ex: (R U R' U') (R' F R2 U') (R' U' R U) (R' F')"
                      value={customSequence}
                      onChange={(e) => setCustomSequence(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-bold tracking-wider"
                    />
                    <button type="submit" disabled={!customSequence.trim()} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-all shadow-lg shadow-purple-500/20">
                      Adicionar aos Meus Treinos
                    </button>
                  </form>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
