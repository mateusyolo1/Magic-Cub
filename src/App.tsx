import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { 
  Sparkles, Rotate3d, Layers, Copy, Check, Palette, Sliders, Info, Eye, Grid3X3,
  Compass, Cpu, SlidersHorizontal, Lightbulb, Camera, Sun, Activity, Zap, RotateCcw,
  Maximize, CheckCircle2, HelpCircle, Download, X, Play, Pause, FastForward, CheckCircle, EyeOff, BrainCircuit, Library, Plus, Trash2, Shuffle, BookOpen, Clock, Lock, ArrowUpRight, ArrowRight, ArrowDown, Settings, Save, Database, Upload, RefreshCw, HardDrive, ChevronDown, ChevronUp
} from 'lucide-react';
import { CubeMoveVisualizer } from './components/CubeMoveVisualizer';
import { SpeedTimer } from './components/SpeedTimer';
import { defaultAlgorithms, parseSequence, invertSequenceStr, AlgoStep, AlgorithmDef } from './algorithms';
import { HeroTheory } from './components/HeroTheory';
import { CubeStateManager } from './lib/CubeState';
import { FlatCubeMap } from './components/FlatCubeMap';
import { COLOR_THEMES, SKINS, STUDIO_PRESETS, CORE_MATERIALS } from './lib/constants';
import { HelixCurve, exportSceneToDXF } from './lib/threeUtils';
import { ThreeDStudio } from './components/ThreeDStudio';

export default function App() {
  const [showTrainer, setShowTrainer] = useState<boolean>(true);
  const [selectedSkin, setSelectedSkin] = useState<string>('glossy-stickerless');
  const [selectedTheme, setSelectedTheme] = useState<string>('standard');
  const [selectedStudio, setSelectedStudio] = useState<string>('dark-keyshot');
  const [selectedCore, setSelectedCore] = useState<string>('primary-white');
  const [coreShape, setCoreShape] = useState<'standard' | 'magnetic-ipg'>('magnetic-ipg');

  // Ajustes anatômicos e mecânicos
  const [explodeDistance, setExplodeDistance] = useState<number>(0); 
  const [detachCaps, setDetachCaps] = useState<number>(0); 
  const [seamLinesWidth, setSeamLinesWidth] = useState<number>(15); 
  const [centerCapRadius, setCenterCapRadius] = useState<number>(45);
  const [edgeCapRadius, setEdgeCapRadius] = useState<number>(25);
  const [cornerCapRadius, setCornerCapRadius] = useState<number>(25);
  const [outerCapRadius, setOuterCapRadius] = useState<number>(5);
  const [capThickness, setCapThickness] = useState<number>(45);
  const [centerBodySize, setCenterBodySize] = useState<number>(95);
  const [coreThickness, setCoreThickness] = useState<number>(100);
  const [coreLength, setCoreLength] = useState<number>(100);
  const [springTension, setSpringTension] = useState<number>(3);
  
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [showForceFields, setShowForceFields] = useState<boolean>(true);
  const [showInternalCore, setShowInternalCore] = useState<boolean>(true);
  
  const [viewMode, setViewMode] = useState<'full' | 'closeup'>('full');
  const [rotateX, setRotateX] = useState<number>(-22);
  const [rotateY, setRotateY] = useState<number>(35);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const [exportTab, setExportTab] = useState<'html' | 'python'>('html');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const cubeState2DRef = useRef<CubeStateManager>(new CubeStateManager());
  const [cubeState2D, setCubeState2D] = useState(cubeState2DRef.current.getState());
  const [turnSpeed, setTurnSpeed] = useState<number>(0.35); // segundos para giro

  // NOVO TREINADOR STATES
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [speed, setSpeed] = useState(800);

  // Prevent bugs when switching between Config and Trainer screens
  React.useEffect(() => {
    setIsPlaying(false);
    commandQueueRef.current = [];
    activeMoveStateRef.current = null;
    if (showTrainer) {
      setCurrentStep(-1);
      setMoveHistory([]);
    } else {
      setIsAutoRotate(false);
    }
  }, [showTrainer]);

  const [reps, setReps] = useState(0);
  const [showVisuals, setShowVisuals] = useState(true);
  const [useStealthFocus, setUseStealthFocus] = useState(false);
  const [focusCase, setFocusCase] = useState<'none' | 'f2l' | 'oll' | 'pll'>('none');
  const [savedCameraAngle, setSavedCameraAngle] = useState<{ x: number, y: number }>(() => {
    try {
      const saved = localStorage.getItem('cube_saved_camera_angle');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { x: -22, y: 35 };
  });

  useEffect(() => {
    if (!useStealthFocus) {
      setFocusCase('none');
    }
  }, [useStealthFocus]);

  // Progression & Quiz
  const [activeChunk, setActiveChunk] = useState<number | 'all'>(1);
  const [unlockedChunk, setUnlockedChunk] = useState<number | 'all'>(1);
  const [quizMode, setQuizMode] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState(false);
  const [recognitionOptions, setRecognitionOptions] = useState<AlgorithmDef[]>([]);
  const [recognitionCorrect, setRecognitionCorrect] = useState<AlgorithmDef | null>(null);
  const [recognitionStats, setRecognitionStats] = useState({ correct: 0, total: 0 });
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [mistakes, setMistakes] = useState(0);

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

  // --- SISTEMA DE CACHE & BACKUPS ---
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cube_autosave_enabled');
      return saved === null ? true : saved === 'true';
    } catch (e) {
      return true;
    }
  });
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [cacheSuccessMessage, setCacheSuccessMessage] = useState<string | null>(null);
  const [dragOverImport, setDragOverImport] = useState<boolean>(false);
  const [isCacheModalOpen, setIsCacheModalOpen] = useState<boolean>(false);
  const [hasLoadedCache, setHasLoadedCache] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('cube_autosave_enabled', String(isAutoSaveEnabled));
    } catch (e) {}
  }, [isAutoSaveEnabled]);

  // Carregar dados salvos no cache (local Storage) ao inicializar
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('cube_app_cache_v1');
      if (savedConfig) {
        const cache = JSON.parse(savedConfig);
        if (cache.settings) {
          const s = cache.settings;
          if (s.selectedSkin !== undefined) setSelectedSkin(s.selectedSkin);
          if (s.selectedTheme !== undefined) setSelectedTheme(s.selectedTheme);
          if (s.selectedStudio !== undefined) setSelectedStudio(s.selectedStudio);
          if (s.selectedCore !== undefined) setSelectedCore(s.selectedCore);
          if (s.coreShape !== undefined) setCoreShape(s.coreShape);
          if (s.explodeDistance !== undefined) setExplodeDistance(s.explodeDistance);
          if (s.detachCaps !== undefined) setDetachCaps(s.detachCaps);
          if (s.seamLinesWidth !== undefined) setSeamLinesWidth(s.seamLinesWidth);
          if (s.centerCapRadius !== undefined) setCenterCapRadius(s.centerCapRadius);
          if (s.edgeCapRadius !== undefined) setEdgeCapRadius(s.edgeCapRadius);
          if (s.cornerCapRadius !== undefined) setCornerCapRadius(s.cornerCapRadius);
          if (s.outerCapRadius !== undefined) setOuterCapRadius(s.outerCapRadius);
          if (s.capThickness !== undefined) setCapThickness(s.capThickness);
          if (s.centerBodySize !== undefined) setCenterBodySize(s.centerBodySize);
          if (s.coreThickness !== undefined) setCoreThickness(s.coreThickness);
          if (s.coreLength !== undefined) setCoreLength(s.coreLength);
          if (s.springTension !== undefined) setSpringTension(s.springTension);
          if (s.showInternalCore !== undefined) setShowInternalCore(s.showInternalCore);
          if (s.showForceFields !== undefined) setShowForceFields(s.showForceFields);
          if (s.viewMode !== undefined) setViewMode(s.viewMode);
          if (s.turnSpeed !== undefined) setTurnSpeed(s.turnSpeed);
          if (s.useStealthFocus !== undefined) setUseStealthFocus(s.useStealthFocus);
          if (s.focusCase !== undefined) setFocusCase(s.focusCase);
        }
        if (cache.trainer) {
          const t = cache.trainer;
          if (t.showTrainer !== undefined) setShowTrainer(t.showTrainer);
          if (t.currentAlgoId !== undefined) setCurrentAlgoId(t.currentAlgoId);
          if (t.reps !== undefined) setReps(t.reps);
          if (t.mistakes !== undefined) setMistakes(t.mistakes);
          if (t.activeChunk !== undefined) setActiveChunk(t.activeChunk);
          if (t.unlockedChunk !== undefined) setUnlockedChunk(t.unlockedChunk);
          if (t.algos !== undefined) setAlgos(t.algos);
        }
        if (cache.moves) {
          const m = cache.moves;
          if (m.moveHistory !== undefined) {
             setMoveHistory(m.moveHistory);
             
             // Restaurar estado 2D
             if (m.cubeState2D !== undefined) {
                cubeState2DRef.current.setState(m.cubeState2D);
             } else if (m.moveHistory.length > 0) {
               cubeState2DRef.current.reset();
               m.moveHistory.forEach((moveStr: string) => {
                 cubeState2DRef.current.applyMove(moveStr);
               });
             }
             if (m.orientationLogic !== undefined) {
                cubeState2DRef.current.orientationLogic = m.orientationLogic;
             }
             setCubeState2D(cubeState2DRef.current.getState());
          }
        }
        setLastSavedTime(new Date().toLocaleTimeString() + ' (Restaurado)');
      }
    } catch (e) {
      console.error("Erro ao carregar cache inicial:", e);
    } finally {
      setHasLoadedCache(true);
    }
  }, []);

  // Sincronizar cache no localStorage AUTOMATICAMENTE ao mudar dados
  useEffect(() => {
    if (!isAutoSaveEnabled) return;
    if (!hasLoadedCache) return;
    
    try {
      const cacheObj = {
        settings: {
          selectedSkin,
          selectedTheme,
          selectedStudio,
          selectedCore,
          coreShape,
          explodeDistance,
          detachCaps,
          seamLinesWidth,
          centerCapRadius,
          edgeCapRadius,
          cornerCapRadius,
          outerCapRadius,
          capThickness,
          centerBodySize,
          coreThickness,
          coreLength,
          springTension,
          showInternalCore,
          showForceFields,
          viewMode,
          turnSpeed,
          useStealthFocus,
          focusCase,
        },
        trainer: {
          showTrainer,
          currentAlgoId,
          reps,
          mistakes,
          activeChunk,
          unlockedChunk,
          algos,
        },
        moves: {
          moveHistory,
          cubeState2D: cubeState2DRef.current.getState(),
          orientationLogic: cubeState2DRef.current.orientationLogic,
        }
      };
      localStorage.setItem('cube_app_cache_v1', JSON.stringify(cacheObj));
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Erro ao salvar cache automaticamente:", e);
    }
  }, [
    isAutoSaveEnabled,
    hasLoadedCache,
    selectedSkin,
    selectedTheme,
    selectedStudio,
    selectedCore,
    coreShape,
    explodeDistance,
    detachCaps,
    seamLinesWidth,
    centerCapRadius,
    edgeCapRadius,
    cornerCapRadius,
    outerCapRadius,
    capThickness,
    centerBodySize,
    coreThickness,
    coreLength,
    springTension,
    showInternalCore,
    showForceFields,
    viewMode,
    turnSpeed,
    useStealthFocus,
    focusCase,
    showTrainer,
    currentAlgoId,
    reps,
    mistakes,
    activeChunk,
    unlockedChunk,
    algos,
    moveHistory,
  ]);

  const saveAppDataToCache = () => {
    try {
      const cacheObj = {
        settings: {
          selectedSkin,
          selectedTheme,
          selectedStudio,
          selectedCore,
          coreShape,
          explodeDistance,
          detachCaps,
          seamLinesWidth,
          centerCapRadius,
          edgeCapRadius,
          cornerCapRadius,
          outerCapRadius,
          capThickness,
          centerBodySize,
          coreThickness,
          coreLength,
          springTension,
          showInternalCore,
          showForceFields,
          viewMode,
          turnSpeed,
          useStealthFocus,
          focusCase,
        },
        trainer: {
          showTrainer,
          currentAlgoId,
          reps,
          mistakes,
          activeChunk,
          unlockedChunk,
          algos,
        },
        moves: {
          moveHistory,
          cubeState2D: cubeState2DRef.current.getState(),
          orientationLogic: cubeState2DRef.current.orientationLogic,
        }
      };
      localStorage.setItem('cube_app_cache_v1', JSON.stringify(cacheObj));
      setLastSavedTime(new Date().toLocaleTimeString() + ' (Manual)');
      setCacheSuccessMessage("Sucesso: Tudo foi persistido localmente!");
      setTimeout(() => setCacheSuccessMessage(null), 3000);
    } catch (e) {
      setCacheSuccessMessage("Erro ao salvar cache de dados!");
      setTimeout(() => setCacheSuccessMessage(null), 3000);
    }
  };

  const clearAppCache = () => {
    if (window.confirm("Deseja realmente redefinir o App e apagar todo o Cache de movimentos, alterações e configurações?")) {
      try {
        localStorage.removeItem('cube_app_cache_v1');
        localStorage.removeItem('cube_saved_camera_angle');
        setCacheSuccessMessage("Cache redefinido! Reiniciando...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (e) {
        window.location.reload();
      }
    }
  };

  const exportAppCache = () => {
    try {
      const cacheObj = {
        app: "GAN Cubing CAD Trainer 3D",
        exportedAt: new Date().toISOString(),
        settings: {
          selectedSkin,
          selectedTheme,
          selectedStudio,
          selectedCore,
          coreShape,
          explodeDistance,
          detachCaps,
          seamLinesWidth,
          centerCapRadius,
          edgeCapRadius,
          cornerCapRadius,
          outerCapRadius,
          capThickness,
          centerBodySize,
          coreThickness,
          coreLength,
          springTension,
          showInternalCore,
          showForceFields,
          viewMode,
          turnSpeed,
          useStealthFocus,
          focusCase,
        },
        trainer: {
          currentAlgoId,
          reps,
          mistakes,
          activeChunk,
          unlockedChunk,
          algos,
        },
        moves: {
          moveHistory,
          cubeState2D: cubeState2DRef.current.getState(),
          orientationLogic: cubeState2DRef.current.orientationLogic,
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cacheObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cube_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setCacheSuccessMessage("Backup exportado com sucesso!");
      setTimeout(() => setCacheSuccessMessage(null), 3000);
    } catch (e) {
      setCacheSuccessMessage("Erro ao exportar backup.");
      setTimeout(() => setCacheSuccessMessage(null), 3000);
    }
  };

  const importAppCacheFromObj = (cache: any) => {
    try {
      if (cache.settings) {
        const s = cache.settings;
        if (s.selectedSkin !== undefined) setSelectedSkin(s.selectedSkin);
        if (s.selectedTheme !== undefined) setSelectedTheme(s.selectedTheme);
        if (s.selectedStudio !== undefined) setSelectedStudio(s.selectedStudio);
        if (s.selectedCore !== undefined) setSelectedCore(s.selectedCore);
        if (s.coreShape !== undefined) setCoreShape(s.coreShape);
        if (s.explodeDistance !== undefined) setExplodeDistance(s.explodeDistance);
        if (s.detachCaps !== undefined) setDetachCaps(s.detachCaps);
        if (s.seamLinesWidth !== undefined) setSeamLinesWidth(s.seamLinesWidth);
        if (s.centerCapRadius !== undefined) setCenterCapRadius(s.centerCapRadius);
        if (s.edgeCapRadius !== undefined) setEdgeCapRadius(s.edgeCapRadius);
        if (s.cornerCapRadius !== undefined) setCornerCapRadius(s.cornerCapRadius);
        if (s.outerCapRadius !== undefined) setOuterCapRadius(s.outerCapRadius);
        if (s.capThickness !== undefined) setCapThickness(s.capThickness);
        if (s.centerBodySize !== undefined) setCenterBodySize(s.centerBodySize);
        if (s.coreThickness !== undefined) setCoreThickness(s.coreThickness);
        if (s.coreLength !== undefined) setCoreLength(s.coreLength);
        if (s.springTension !== undefined) setSpringTension(s.springTension);
        if (s.showInternalCore !== undefined) setShowInternalCore(s.showInternalCore);
        if (s.showForceFields !== undefined) setShowForceFields(s.showForceFields);
        if (s.viewMode !== undefined) setViewMode(s.viewMode);
        if (s.turnSpeed !== undefined) setTurnSpeed(s.turnSpeed);
        if (s.useStealthFocus !== undefined) setUseStealthFocus(s.useStealthFocus);
        if (s.focusCase !== undefined) setFocusCase(s.focusCase);
      }
      if (cache.trainer) {
        const t = cache.trainer;
        if (t.currentAlgoId !== undefined) setCurrentAlgoId(t.currentAlgoId);
        if (t.reps !== undefined) setReps(t.reps);
        if (t.mistakes !== undefined) setMistakes(t.mistakes);
        if (t.activeChunk !== undefined) setActiveChunk(t.activeChunk);
        if (t.unlockedChunk !== undefined) setUnlockedChunk(t.unlockedChunk);
        if (t.algos !== undefined) setAlgos(t.algos);
      }
      if (cache.moves) {
        const m = cache.moves;
        if (m.moveHistory !== undefined) {
           setMoveHistory(m.moveHistory);
           
           if (m.cubeState2D !== undefined) {
              cubeState2DRef.current.setState(m.cubeState2D);
           } else if (m.moveHistory.length > 0) {
              cubeState2DRef.current.reset();
              m.moveHistory.forEach((moveStr: string) => {
                 cubeState2DRef.current.applyMove(moveStr);
              });
           }
           if (m.orientationLogic !== undefined) {
              cubeState2DRef.current.orientationLogic = m.orientationLogic;
           }
           setCubeState2D(cubeState2DRef.current.getState());
        }
      }
      setCacheSuccessMessage("Backup importado com sucesso!");
      setTimeout(() => setCacheSuccessMessage(null), 3000);
    } catch (e) {
      setCacheSuccessMessage("Erro: Formato de arquivo inválido!");
      setTimeout(() => setCacheSuccessMessage(null), 3500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importAppCacheFromObj(parsed);
      } catch (err) {
        setCacheSuccessMessage("Arquivo JSON de backup inválido!");
        setTimeout(() => setCacheSuccessMessage(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  // ALGORITMO RESOLUTION
  const selectedAlgoDef = React.useMemo(() => algos.find(a => a.id === currentAlgoId) || algos[0], [algos, currentAlgoId]);
  const sourceSequence = React.useMemo(() => isReversed ? invertSequenceStr(selectedAlgoDef.sequence) : selectedAlgoDef.sequence, [isReversed, selectedAlgoDef]);
  const algorithmData: AlgoStep[] = React.useMemo(() => parseSequence(sourceSequence), [sourceSequence]);
  const initialScrambleForCube = activeScramble || (isReversed ? '' : invertSequenceStr(sourceSequence));
  const filteredAlgo = React.useMemo(() => activeChunk === 'all' ? algorithmData : algorithmData.filter(m => m.chunk === activeChunk), [activeChunk, algorithmData]);
  const maxChunks = React.useMemo(() => algorithmData.reduce((acc, a) => Math.max(acc, a.chunk), 1), [algorithmData]);
  const baseMoves = React.useMemo(() => {
    return activeChunk === 'all' 
      ? [] 
      : algorithmData.filter(m => m.chunk < activeChunk).map(a => a.move);
  }, [activeChunk, algorithmData]);

  const quizOptions = React.useMemo(() => {
     const standard = ['R', "R'", 'R²', 'U', "U'", "U²", 'L', "L'", 'F', "F'", 'D', "D'", "B", "M", "M²", "x", "y"];
     const fromAlgo = algorithmData.map(s => s.move);
     return Array.from(new Set([...standard, ...fromAlgo])).sort();
  }, [algorithmData]);  

  const pointerStartX = useRef<number>(0);
  const pointerStartY = useRef<number>(0);
  const rotateStartX = useRef<number>(0);
  const rotateStartY = useRef<number>(0);

  // Fila de movimentos compartilhada via Refs com o loop ThreeJS
  const commandQueueRef = useRef<Array<{ face: string, dir: number }>>([]);
  const activeMoveStateRef = useRef<{ face: string, dir: number, angle: number, speed: number } | null>(null);

  // Sincronizar estados com ThreeJS
  const configStateRef = useRef({
    selectedTheme, selectedSkin, selectedStudio, selectedCore, coreShape,
    explodeDistance, detachCaps, seamLinesWidth, centerCapRadius, edgeCapRadius, cornerCapRadius, outerCapRadius, centerBodySize, coreThickness, coreLength, springTension, capThickness,
    showForceFields, showInternalCore, rotateX, rotateY, viewMode, turnSpeed
  });

  useEffect(() => {
    configStateRef.current = {
      selectedTheme: selectedTheme, selectedSkin, selectedStudio, selectedCore, coreShape,
      explodeDistance, detachCaps, seamLinesWidth, centerCapRadius, edgeCapRadius, cornerCapRadius, outerCapRadius, centerBodySize, coreThickness, coreLength, springTension, capThickness,
      showForceFields, showInternalCore, rotateX, rotateY, viewMode, turnSpeed
    };
  }, [
    selectedTheme, selectedSkin, selectedStudio, selectedCore, coreShape,
    explodeDistance, detachCaps, seamLinesWidth, centerCapRadius, edgeCapRadius, cornerCapRadius, outerCapRadius, centerBodySize, coreThickness, coreLength, springTension, capThickness,
    showForceFields, showInternalCore, rotateX, rotateY, viewMode, turnSpeed
  ]);

  // Orbit rotation automática
  useEffect(() => {
    if (!isAutoRotate || isDragging) return;
    const id = setInterval(() => {
      setRotateY((y) => (y + 0.4) % 360);
    }, 16);
    return () => clearInterval(id);
  }, [isAutoRotate, isDragging]);

  const pointerDownHandler = (e: React.MouseEvent) => {
    setIsDragging(true);
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    rotateStartX.current = rotateX;
    rotateStartY.current = rotateY;
  };

  const touchStartHandler = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      pointerStartX.current = e.touches[0].clientX;
      pointerStartY.current = e.touches[0].clientY;
      rotateStartX.current = rotateX;
      rotateStartY.current = rotateY;
    }
  };

  useEffect(() => {
    const mouseMoveListener = (e: MouseEvent) => {
      if (!isDragging) return;
      const dX = e.clientX - pointerStartX.current;
      const dY = e.clientY - pointerStartY.current;
      setRotateX(Math.max(-85, Math.min(85, rotateStartX.current - dY * 0.4)));
      setRotateY(rotateStartY.current + dX * 0.4);
    };
    const touchMoveListener = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const dX = e.touches[0].clientX - pointerStartX.current;
      const dY = e.touches[0].clientY - pointerStartY.current;
      setRotateX(Math.max(-85, Math.min(85, rotateStartX.current - dY * 0.4)));
      setRotateY(rotateStartY.current + dX * 0.4);
    };
    const stopDragging = () => setIsDragging(false);

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', touchMoveListener);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', touchMoveListener);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging]);

  const addCubeMove = (face: string, dir: number) => {
    commandQueueRef.current.push({ face, dir });
    const sym = dir === 1 ? face : `${face}'`;
    setMoveHistory(prev => [sym, ...prev].slice(0, 16));
  };

  const handleMoveFinished = (move: { face: string, dir: number }) => {
    let suffix = '';
    if (move.dir === -1) suffix = "'";
    else if (move.dir === 2) suffix = "2";
    cubeState2DRef.current.applyMove(`${move.face}${suffix}`);
    setCubeState2D(cubeState2DRef.current.getState());
  };

  const handleScramble = () => {
    const faces = ['U', 'D', 'F', 'B', 'R', 'L'];
    const dirs = [1, -1];
    setMoveHistory([]);
    for (let i = 0; i < 15; i++) {
      const f = faces[Math.floor(Math.random() * faces.length)];
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      commandQueueRef.current.push({ face: f, dir: d });
      const sym = d === 1 ? f : `${f}'`;
      setMoveHistory(prev => [...prev, sym]);
    }
  };

  const handleResetCube = (setupAlgo?: string) => {
    commandQueueRef.current = [];
    activeMoveStateRef.current = null;
    setMoveHistory([]);
    cubeState2DRef.current.reset();
    if (setupAlgo) {
        cubeState2DRef.current.applyAlgorithm(setupAlgo);
    }
    setCubeState2D(cubeState2DRef.current.getState());
    setRotateX(savedCameraAngle.x);
    setRotateY(savedCameraAngle.y);
    // Envia evento customizado para forçar reload e resetar a posição frotal
    window.dispatchEvent(new CustomEvent('reset-cube-data-solved', { detail: { setupAlgo } }));
  };

  // HANDLERS E EFEITOS DO TREINADOR
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

  const startRecognitionQuiz = () => {
    const validAlgos = algos.filter(a => a.sequence.trim() !== "");
    if (validAlgos.length < 4) return;
    
    // Pick correct
    const correct = validAlgos[Math.floor(Math.random() * validAlgos.length)];
    
    // Pick 3 wrong
    const options = [correct];
    while(options.length < 4) {
      const wrong = validAlgos[Math.floor(Math.random() * validAlgos.length)];
      if (!options.find(o => o.id === wrong.id)) {
         options.push(wrong);
      }
    }
    
    // Shuffle
    options.sort(() => Math.random() - 0.5);
    
    setRecognitionCorrect(correct);
    setRecognitionOptions(options);
    setRecognitionMode(true);
    setQuizMode(false);
    
    // Apply inverse to scramble
    const setup = invertSequenceStr(correct.sequence);
    
    // Wait for the UI layer (ThreeDStudio mounting) to evaluate before dispatching the sync event
    setTimeout(() => {
       handleResetCube(setup);
    }, 50);
  };

  const handleRecognitionGuess = (algo: AlgorithmDef) => {
    if (!recognitionCorrect) return;
    setRecognitionStats(prev => ({ ...prev, total: prev.total + 1 }));
    if (algo.id === recognitionCorrect.id) {
       setRecognitionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
       startRecognitionQuiz();
    } else {
       setErrorFeedback(true);
       setTimeout(() => setErrorFeedback(false), 500);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setMistakes(0);
    setErrorFeedback(false);
    setTimeout(() => {
      if (showTrainer) {
          handleResetCube(initialScrambleForCube);
      } else {
          handleResetCube();
      }
    }, 50);
  };

  const addRep = () => {
    setReps(prev => prev + 1);
    reset();
  };

  const handleQuizGuess = (move: string) => {
    const nextStep = currentStep + 1;
    if (nextStep >= filteredAlgo.length) return;
    if (filteredAlgo[nextStep].move === move) {
      setCurrentStep(nextStep);
      setMistakes(0);
      
      if (nextStep >= filteredAlgo.length - 1) {
         if (activeChunk === 'all') { addRep(); } 
         else {
            const nextCh = (activeChunk as number) + 1;
            if (nextCh > maxChunks) {
               setUnlockedChunk('all');
               setActiveChunk('all');
            } else {
               const currentMax = unlockedChunk === 'all' ? 999 : (unlockedChunk as number);
               if (nextCh > currentMax) { setUnlockedChunk(nextCh); }
               setActiveChunk(nextCh);
            }
         }
         setTimeout(() => { setQuizMode(false); reset(); }, 1500);
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
     setActiveScramble(scrambleInput.trim());
     reset();
  };

  const currentDesc = currentStep >= 0 && currentStep < filteredAlgo.length 
      ? filteredAlgo[currentStep].desc 
      : 'Inicie ou arraste para visualizar';

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

  useEffect(() => {
    if (quizMode) setShowVisuals(false);
  }, [quizMode]);
  
  useEffect(() => {
     reset();
  }, [activeChunk, currentAlgoId, isReversed, activeScramble]);

  // Sincronizar passo atual com o commandoQueueRef para o ThreeDStudio
  useEffect(() => {
    if (currentStep >= 0 && currentStep < filteredAlgo.length) {
       const m = filteredAlgo[currentStep].move;
       // Parsear o move do CFOP para o commando do ThreeDStudio (aceitar minúsculas para wide moves)
       let face = m;
       face = face.replace(/'|2|²/g, '');
       
       if (face.length === 2 && face.toLowerCase().endsWith('w')) {
           face = face[0].toUpperCase() + 'w';
       } else if (face.length === 1 && face === face.toLowerCase()) {
           const upper = face.toUpperCase();
           if (['R','U','L','D','F','B'].includes(upper)) {
               face = upper + 'w';
           } else {
               face = upper;
           }
       } else {
           face = face.toUpperCase();
       }
       let dir = m.includes("'") ? -1 : 1;
       if (face === 'M' || face === 'E' || face === 'S' || face === 'X' || face === 'Y' || face === 'Z') {
           // Some slices have different polarity conventions in visualizers
       }
       if (m.includes("²") || m.includes("2")) {
          commandQueueRef.current.push({ face, dir });
          commandQueueRef.current.push({ face, dir });
       } else {
          commandQueueRef.current.push({ face, dir });
       }
    }
  }, [currentStep, filteredAlgo]);

  // Código compactado e limpo para cópia (VS Code)
  const codeHTML = `<!DOCTYPE html>
<html>
<head>
  <title>GAN 3D CAD Studio Previewer</title>
  <style>
    body { margin: 0; background: #060810; color: #fff; font-family: sans-serif; overflow: hidden; }
    #canvas { width: 100vw; height: 100vh; }
    #hud { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.85); padding: 15px; border-radius: 8px; border: 1px solid #222; font-family: monospace; font-size: 11px; pointer-events: none; }
    #keys { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
    button { background: #eab308; border: none; color: #000; padding: 6px 14px; font-weight: bold; border-radius: 4px; cursor: pointer; }
    button:hover { background: #facc15; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="hud">
    <b>GAN CUBE PROTOTYPE PREVIEW</b><br/>
    Comandos de tecla:<br/>
    • U, R, F, L, D, B (Giro Horário)<br/>
    • Shift + Tecla (Anti-Horário)<br/>
  </div>
  <div id="keys">
    <button onclick="triggerMove('U', 1)">U</button>
    <button onclick="triggerMove('U', -1)">U'</button>
    <button onclick="triggerMove('R', 1)">R</button>
    <button onclick="triggerMove('R', -1)">R'</button>
    <button onclick="triggerMove('F', 1)">F</button>
    <button onclick="triggerMove('F', -1)">F'</button>
  </div>
  <div id="canvas"></div>

  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5, 5, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas').appendChild(renderer.domElement);

    // Iluminação
    const ambient = new THREE.AmbientLight(0x334466, 0.6); scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(5,8,5); scene.add(key);

    // Transparente Core
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, roughness: 0.1, transparent: true }));
    scene.add(coreMesh);

    // Peças do cubo (Stickerless 3D Caps)
    const cubieGroup = new THREE.Group();
    scene.add(cubieGroup);
    
    const cubies = [];
    const colorsList = { U:0xffffff, D:0xffec00, F:0xdf1a22, B:0xff5800, L:0x00cd38, R:0x0062e3, inner:0x151518 };

    // Construção das 26 peças
    for (let cx=-1; cx<=1; cx++) {
      for (let cy=-1; cy<=1; cy++) {
        for (let cz=-1; cz<=1; cz++) {
          if (cx===0 && cy===0 && cz===0) continue;
          
          const g = new THREE.Group();
          g.position.set(cx*1.1, cy*1.1, cz*1.1);
          g.userData = { gridX: cx, gridY: cy, gridZ: cz, basePos: new THREE.Vector3(cx, cy, cz), baseQuat: new THREE.Quaternion() };
          
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), new THREE.MeshStandardMaterial({ color: colorsList.inner, roughness: 0.3 }));
          g.add(body);

          // Caps externos coloridos nas laterais
          if (cy === 1) addFaceCap(g, colorsList.U, 0, 0.485, 0, Math.PI/2, 0, 0);
          if (cy === -1) addFaceCap(g, colorsList.D, 0, -0.485, 0, -Math.PI/2, 0, 0);
          if (cx === 1) addFaceCap(g, colorsList.R, 0.485, 0, 0, 0, Math.PI/2, 0);
          if (cx === -1) addFaceCap(g, colorsList.L, -0.485, 0, 0, 0, -Math.PI/2, 0);
          if (cz === 1) addFaceCap(g, colorsList.F, 0, 0, 0.485, 0, 0, 0);
          if (cz === -1) addFaceCap(g, colorsList.B, 0, 0, -0.485, 0, Math.PI, 0);

          cubies.push(g);
          cubieGroup.add(g);
        }
      }
    }

    function addFaceCap(g, color, x, y, z, rx, ry, rz) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.9), new THREE.MeshPhysicalMaterial({ color: color, roughness: 0.15, clearcoat: 0.5 }));
      cap.position.set(x, y, z);
      cap.rotation.set(rx, ry, rz);
      g.add(cap);
    }

    // Engine de Rotações 3D
    let activeMove = null;
    const queue = [];

    function triggerMove(face, dir) {
      queue.push({ face, dir });
    }

    const faceAxes = {
      U: { axis: new THREE.Vector3(0,1,0), test: p => p.y > 0.5 },
      D: { axis: new THREE.Vector3(0,-1,0), test: p => p.y < -0.5 },
      R: { axis: new THREE.Vector3(1,0,0), test: p => p.x > 0.5 },
      L: { axis: new THREE.Vector3(-1,0,0), test: p => p.x < -0.5 },
      F: { axis: new THREE.Vector3(0,0,1), test: p => p.z > 0.5 },
      B: { axis: new THREE.Vector3(0,0,-1), test: p => p.z < -0.5 },
    };

    window.addEventListener('keydown', e => {
      const f = e.key.toUpperCase();
      const dir = e.shiftKey ? -1 : 1;
      if (['U','R','F','L','D','B'].includes(f)) triggerMove(f, dir);
    });

    const tempQuat = new THREE.Quaternion();

    function animate() {
      requestAnimationFrame(animate);

      if (!activeMove && queue.length > 0) {
        activeMove = queue.shift();
        activeMove.angle = 0;
        activeMove.axisData = faceAxes[activeMove.face];
      }

      if (activeMove) {
        const step = 0.1;
        const target = (Math.PI / 2) * activeMove.dir;
        const delta = Math.sign(target) * step;
        activeMove.angle += delta;

        const isFinished = Math.abs(activeMove.angle) >= Math.abs(target);
        const currentFrameAngle = isFinished ? target : activeMove.angle;

        cubies.forEach(c => {
          if (activeMove.axisData.test(c.userData.basePos)) {
            // Posicionamento espacial orbital rotativo
            const p = c.userData.basePos.clone().applyAxisAngle(activeMove.axisData.axis, currentFrameAngle);
            c.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);

            // Quaternion de orientação para as cores acompanharem
            tempQuat.setFromAxisAngle(activeMove.axisData.axis, currentFrameAngle);
            c.quaternion.copy(tempQuat).multiply(c.userData.baseQuat);
          }
        });

        if (isFinished) {
          cubies.forEach(c => {
            if (activeMove.axisData.test(c.userData.basePos)) {
              c.userData.basePos.applyAxisAngle(activeMove.axisData.axis, target);
              c.userData.basePos.set(Math.round(c.userData.basePos.x), Math.round(c.userData.basePos.y), Math.round(c.userData.basePos.z));
              
              tempQuat.setFromAxisAngle(activeMove.axisData.axis, target);
              c.userData.baseQuat.premultiply(tempQuat);
            }
          });
          activeMove = null;
        }
      }

      cubieGroup.rotation.y += 0.003;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

  const codePython = `import bpy\nimport math\n\n# Limpar cena\nbpy.ops.object.select_all(action='DESELECT')\nbpy.ops.object.select_by_type(type='MESH')\nbpy.ops.object.delete()\n\n# Parametros\nspacing = 2.05\n\n# Gerar os 26 cubos base\nfor x in range(-1, 2):\n    for y in range(-1, 2):\n        for z in range(-1, 2):\n            if x == 0 and y == 0 and z == 0:\n                continue\n            bpy.ops.mesh.primitive_cube_add(size=2.0, location=(x * spacing, y * spacing, z * spacing))\n            cubie = bpy.context.active_object\n            mod = cubie.modifiers.new(name='Bevel', type='BEVEL')\n            mod.width = 0.15\n            mod.segments = 4\n\n# Adicionar o Omni-Core\nbpy.ops.mesh.primitive_uv_sphere_add(radius=0.7, location=(0, 0, 0))\n\nprint("Cubo 3D Estrutural Gerado com Sucesso!")`;

  const handleCopyCode = () => {
    const textBlob = exportTab === 'html' ? codeHTML : codePython;
    navigator.clipboard.writeText(textBlob).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };


const activeThemeInfo = useMemo(() => COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0], [selectedTheme]);
const activeStudioInfo = useMemo(() => STUDIO_PRESETS.find(s => s.id === selectedStudio) || STUDIO_PRESETS[0], [selectedStudio]);
const activeCoreInfo = useMemo(() => CORE_MATERIALS.find(c => c.id === selectedCore) || CORE_MATERIALS[0], [selectedCore]);
const activeStyleInfo = useMemo(() => SKINS.find(s => s.id === selectedSkin) || SKINS[0], [selectedSkin]);
return (
  <>
    {cacheSuccessMessage && (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-slate-950 font-black px-5 py-3 rounded-2xl shadow-[0_10px_35px_rgba(16,185,129,0.35)] border border-emerald-400 flex items-center gap-2.5 animate-bounce">
        <Database className="w-4.5 h-4.5 text-slate-950" />
        <span className="text-[11px] uppercase tracking-wider font-bold">{cacheSuccessMessage}</span>
        <button onClick={() => setCacheSuccessMessage(null)} className="ml-1 hover:bg-black/10 p-1 rounded-lg cursor-pointer">
          <X className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>
    )}
{showTrainer && (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans flex flex-col items-center">
      {showTheory && <HeroTheory onClose={() => setShowTheory(false)} />}
      
      {/* Hero Bar Component */}
      {!recognitionMode && !quizMode && (
      <div className="max-w-6xl w-full mb-6 flex flex-col md:flex-row justify-between items-center bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
             <h2 className="text-lg font-bold text-slate-100 leading-tight">Neural Hub</h2>
             <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Painel de Controle</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowTheory(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors text-slate-200">
             <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
             <span className="hidden sm:inline">Metodologia & Teoria</span>
          </button>
          <button onClick={() => setShowTrainer(false)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors text-slate-200">
             <Settings className="w-3.5 h-3.5 text-blue-400" />
             <span className="hidden sm:inline">Config 3D</span>
          </button>
          <button onClick={() => setIsCacheModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors text-slate-200">
             <HardDrive className="w-3.5 h-3.5 text-amber-500" />
             <span className="hidden sm:inline">Config de Cache</span>
          </button>
        </div>
      </div>
      )}

      <div className="max-w-6xl w-full space-y-6">
        
        {showTrainer && !recognitionMode && (
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
        )}

        {showTrainer && !recognitionMode && (
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button 
                onClick={() => { setRecognitionMode(false); setQuizMode(!quizMode); reset(); }} 
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-[11.5px] whitespace-nowrap font-bold flex items-center justify-center gap-1.5 transition-all border ${quizMode && !recognitionMode ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-400'}`}
              >
                <BrainCircuit className="w-3.5 h-3.5"/> QUIZ CFOP
              </button>
              
              <button 
                onClick={() => {
                  if (recognitionMode) {
                     setRecognitionMode(false);
                     reset();
                  } else {
                     startRecognitionQuiz();
                  }
                }} 
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-[11.5px] whitespace-nowrap font-bold flex items-center justify-center gap-1.5 transition-all border ${recognitionMode ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'}`}
              >
                <HelpCircle className="w-3.5 h-3.5"/> RECONHECER
              </button>

              <button 
                onClick={() => setShowVisuals(!showVisuals)} 
                disabled={quizMode || recognitionMode}
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-[11.5px] whitespace-nowrap font-bold flex items-center justify-center gap-1.5 transition-all border bg-slate-900 text-slate-400 ${(quizMode || recognitionMode) ? 'opacity-50 cursor-not-allowed border-slate-800' : 'border-slate-800 hover:text-white'}`}
              >
                {showVisuals ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showVisuals ? 'MEMÓRIA CEGA' : 'VER DICAS'}
              </button>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 min-h-[400px] relative overflow-hidden shadow-inner shadow-black/50 cursor-grab active:cursor-grabbing" onMouseDown={pointerDownHandler} onTouchStart={touchStartHandler}>
             <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
             <ThreeDStudio 
                key="neural-studio"
                stateRef={configStateRef}
                cubeStateRef={cubeState2DRef}
                explodeDistance={explodeDistance}
                capThickness={capThickness}
                cornerCapRadius={cornerCapRadius}
                edgeCapRadius={edgeCapRadius}
                centerCapRadius={centerCapRadius}
                outerCapRadius={outerCapRadius}
                centerBodySize={centerBodySize}
                seamLinesWidth={seamLinesWidth}
                detachCaps={detachCaps}
                selectedTheme={selectedTheme}
                selectedStudio={selectedStudio}
                selectedCore={selectedCore}
                coreShape={coreShape}
                springTension={springTension}
                coreThickness={coreThickness}
                coreLength={coreLength}
                showForceFields={showForceFields}
                showInternalCore={showInternalCore}
                selectedSkin={selectedSkin}
                viewMode={viewMode}
                commandQueue={commandQueueRef}
                activeMoveState={activeMoveStateRef}
                cameraRotX={rotateX}
                cameraRotY={rotateY}
                onMoveFinished={handleMoveFinished}
                focusCase={focusCase}
                useStealthFocus={useStealthFocus}
             />
             
             {/* Controles de Câmera e Skin Slim */}
             <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 backdrop-blur-sm select-none">
                <button
                   title="Mudar Skin para Preta (Stealth Focus)"
                   onClick={() => {
                     const isStealth = !useStealthFocus;
                     setUseStealthFocus(isStealth);
                     if (isStealth) {
                       const algoType = (selectedAlgoDef.category || '').toLowerCase();
                       if (algoType.includes('pll')) setFocusCase('pll');
                       else if (algoType.includes('oll')) setFocusCase('oll');
                       else setFocusCase('f2l');
                     } else {
                       setFocusCase('none');
                     }
                   }}
                   type="button"
                   className={`p-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 leading-none ${
                      useStealthFocus 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                   }`}
                >
                   <Palette className="w-3.5 h-3.5 text-current" />
                   <span className="text-[9px] hidden sm:inline">Skin Preta FFocus</span>
                </button>

                {useStealthFocus && (
                   <>
                      <div className="h-3.5 w-[1px] bg-slate-800" />
                      <div className="flex bg-slate-900 border border-slate-800 rounded p-[2px] gap-0.5">
                         {(['none', 'f2l', 'oll', 'pll'] as const).map(mode => (
                            <button
                               key={mode}
                               onClick={() => setFocusCase(mode)}
                               type="button"
                               className={`px-1 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer ${
                                  focusCase === mode
                                  ? 'bg-amber-500 text-slate-950 px-1.5'
                                  : 'text-slate-400 hover:text-white'
                               }`}
                            >
                               {mode === 'none' ? 'OFF' : mode}
                            </button>
                         ))}
                      </div>
                   </>
                )}
                <div className="h-3.5 w-[1px] bg-slate-850" />
                <button
                   title="Resetar Câmera"
                   onClick={() => { setRotateX(-22); setRotateY(35); }}
                   type="button"
                   className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 leading-none"
                >
                   <RotateCcw className="w-3.5 h-3.5 text-current" />
                   <span className="text-[9px] hidden sm:inline">Reset Cam</span>
                </button>
                <div className="h-3.5 w-[1px] bg-slate-850" />
                <button
                   title="Salvar Ângulo de Câmera Atual como Padrão"
                   onClick={() => {
                      const angleObj = { x: rotateX, y: rotateY };
                      setSavedCameraAngle(angleObj);
                      localStorage.setItem('cube_saved_camera_angle', JSON.stringify(angleObj));
                   }}
                   type="button"
                   className="p-1 rounded bg-slate-900 border border-slate-800 text-amber-500 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 leading-none"
                >
                   <Save className="w-3.5 h-3.5 text-current" />
                   <span className="text-[9px] hidden sm:inline">Salvar Ângulo</span>
                </button>
                <button
                   title="Carregar Ângulo Salvo"
                   onClick={() => {
                      setRotateX(savedCameraAngle.x);
                      setRotateY(savedCameraAngle.y);
                   }}
                   type="button"
                   className="p-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1 leading-none"
                >
                   <Compass className="w-3.5 h-3.5 text-current" />
                   <span className="text-[9px] hidden sm:inline">Ver Salvo ({savedCameraAngle.x.toFixed(0)}°, {savedCameraAngle.y.toFixed(0)}°)</span>
                </button>
             </div>

             <div className="absolute top-4 left-4 right-4 text-center pointer-events-none z-10 mx-auto w-fit max-w-[50%]">
                <span className="inline-block bg-slate-950/80 px-4 py-2 rounded-full border border-slate-700/50 text-slate-300 font-medium shadow-xl backdrop-blur-sm truncate w-full">
                  {currentDesc}
                </span>
             </div>
             
             <div className="absolute bottom-4 left-4 z-20 pointer-events-none drop-shadow-lg opacity-80 mix-blend-screen mix-blend-mode-lighten">
                <FlatCubeMap state={cubeState2D} focusCase={focusCase} />
             </div>
          </div>
        </div>
        )}

        {/* Separated RECOGNITION GAME UI */}
        {showTrainer && recognitionMode && (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full animate-in fade-in duration-300">
             
             {/* Recognition Controls */}
             <div className="flex flex-col gap-4 w-full lg:w-[450px]">
               <div className="bg-amber-900/10 border border-amber-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(217,119,6,0.05)] flex-1 flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="text-amber-400 text-2xl font-black flex items-center gap-2 tracking-tight">
                           <HelpCircle className="w-6 h-6"/> Game Mode
                        </h4>
                        <span className="text-sm text-amber-500 font-bold bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-900/50">Score: {recognitionStats.correct} / {recognitionStats.total}</span>
                     </div>
                     
                     <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                       Analise o estado do cubo abaixo. Qual algoritmo resolve esse caso específico?
                     </p>

                     <div className="grid grid-cols-1 gap-3">
                        {recognitionOptions.map(opt => (
                           <button
                             key={opt.id}
                             onClick={() => handleRecognitionGuess(opt)}
                             className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/80 hover:bg-slate-800 text-slate-200 hover:text-amber-400 font-medium py-4 px-5 rounded-xl shadow-lg transition-all active:scale-[0.98] text-left flex flex-col gap-1 group"
                           >
                             <span className="font-bold text-lg">{opt.name}</span>
                             <span className="text-xs text-slate-500 uppercase tracking-wider group-hover:text-amber-500/70">{opt.category}</span>
                           </button>
                        ))}
                     </div>

                     {errorFeedback && (
                       <div className="mt-6 p-4 bg-red-950/40 border-2 border-red-500/30 text-red-500 rounded-xl text-center font-bold animate-shake">
                         ❌ Resposta Incorreta! Tente novamente.
                       </div>
                     )}
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                     <button onClick={startRecognitionQuiz} className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 text-sm">
                       <RotateCcw className="w-4 h-4"/> Pular Caso
                     </button>
                     <button 
                       onClick={() => { setRecognitionMode(false); reset(); }} 
                       className="flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-amber-600 hover:bg-amber-500 text-slate-950 text-sm shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                     >
                       SAIR DO JOGO
                     </button>
                  </div>
               </div>
             </div>

             {/* Recognition 3D Viewer (Isolated) */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 min-h-[500px] relative overflow-hidden shadow-inner shadow-black/50 cursor-grab active:cursor-grabbing" onMouseDown={pointerDownHandler} onTouchStart={touchStartHandler}>
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />
                <ThreeDStudio 
                   key="recognition-studio"
                   stateRef={configStateRef}
                   cubeStateRef={cubeState2DRef}
                   explodeDistance={explodeDistance}
                   capThickness={capThickness}
                   cornerCapRadius={cornerCapRadius}
                   edgeCapRadius={edgeCapRadius}
                   centerCapRadius={centerCapRadius}
                   outerCapRadius={outerCapRadius}
                   centerBodySize={centerBodySize}
                   seamLinesWidth={seamLinesWidth}
                   detachCaps={detachCaps}
                   selectedTheme={selectedTheme}
                   selectedStudio={selectedStudio}
                   selectedCore={selectedCore}
                   coreShape={coreShape}
                   springTension={springTension}
                   coreThickness={coreThickness}
                   coreLength={coreLength}
                   showForceFields={showForceFields}
                   showInternalCore={showInternalCore}
                   selectedSkin={selectedSkin}
                   viewMode={viewMode}
                   commandQueue={commandQueueRef}
                   activeMoveState={activeMoveStateRef}
                   cameraRotX={rotateX}
                   cameraRotY={rotateY}
                   onMoveFinished={handleMoveFinished}
                   focusCase={focusCase}
                   useStealthFocus={useStealthFocus}
                />
                <div className="absolute top-6 left-0 right-0 text-center pointer-events-none z-20">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-2 rounded-full font-black tracking-widest text-sm backdrop-blur-md shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                        MODO RECONHECIMENTO DE PADRÕES
                    </span>
                </div>
                {/* Slim Controls identical to trainer */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 backdrop-blur-sm select-none">
                    <button onClick={() => { setRotateX(-22); setRotateY(35); }} className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                       <RotateCcw className="w-3.5 h-3.5" />
                       <span className="text-[9px]">Reset Cam</span>
                    </button>
                    <button onClick={() => { setRotateX(savedCameraAngle.x); setRotateY(savedCameraAngle.y); }} className="p-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer flex items-center gap-1">
                       <Compass className="w-3.5 h-3.5" />
                       <span className="text-[9px]">Câmera Salva</span>
                    </button>
                </div>
             </div>
          </div>
        )}

        {!recognitionMode && (
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
                 const isUnlocked = !quizMode || unlockedChunk === 'all' || ch <= (unlockedChunk as number);
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
                disabled={quizMode && unlockedChunk !== 'all'}
                onClick={() => { setActiveChunk('all'); reset(); }} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeChunk === 'all' ? 'bg-blue-600 text-white' : (!quizMode || unlockedChunk === 'all') ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-800/30 text-slate-600 cursor-not-allowed'}`}
              >
                Tudo {(!quizMode || unlockedChunk === 'all') ? '' : ' 🔒'}
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
        )}

        {/* Library & Custom Config (Hidden in Quiz Mode) */}
        {!quizMode && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
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
                       if (recognitionMode) {
                         setRecognitionMode(false);
                       }
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
                      onChange={(e) => setCustomSequence(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-mono p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-bold tracking-wider"
                    />
                    <button type="submit" disabled={!customSequence.trim()} className="w-full py-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-all shadow-lg shadow-purple-500/20">
                      Adicionar aos Meus Treinos
                    </button>
                  </form>
                </div>
             </div>

             {/* Removed inline Cache Panel */}
          </div>
        )}

        {/* JANELA DE CACHE & BACKUPS AVANÇADOS (Modo Janela) */}
        {isCacheModalOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
            onClick={() => setIsCacheModalOpen(false)}
          >
            <div 
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
                 <h3 className="font-extrabold text-slate-100 flex items-center gap-2 text-xs uppercase tracking-wider">
                   <HardDrive className="w-4.5 h-4.5 text-amber-500" /> Painel de Cache & Backups
                 </h3>
                 <button 
                   onClick={() => setIsCacheModalOpen(false)}
                   className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Aqui você pode salvar manualmente suas modificações de blocos/sequências, reiniciar o progresso ou exportar e importar backups completos do seu ambiente de treino.
              </p>

              {/* Status Indicators */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 mb-5">
                 <div className="flex items-center justify-between text-xs text-slate-300">
                   <span className="flex items-center gap-1.5 font-bold text-[11px]">
                     <span className={`w-2 h-2 rounded-full ${isAutoSaveEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     Auto-Salvar Ativo
                   </span>
                   <button
                     type="button"
                     onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                     className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border cursor-pointer transition-colors ${isAutoSaveEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                   >
                     {isAutoSaveEnabled ? 'LIGADA' : 'DESACTIVADO'}
                   </button>
                 </div>

                 <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                   <span>Último sync realizado em:</span>
                   <span className="text-slate-200 font-bold">{lastSavedTime || 'Sem registros'}</span>
                 </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                 <button
                   type="button"
                   onClick={() => {
                     saveAppDataToCache();
                     setIsCacheModalOpen(false);
                   }}
                   className="py-2.5 px-3 rounded-lg border border-slate-850 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                   title="Salvar Estado Manualmente"
                 >
                   <Save className="w-3.5 h-3.5 text-amber-500" /> Salvar Cache
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     clearAppCache();
                     setIsCacheModalOpen(false);
                   }}
                   className="py-2.5 px-3 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                   title="Limpar Cache de Dados"
                 >
                   <RefreshCw className="w-3.5 h-3.5 text-red-500" /> Limpar Tudo
                 </button>
              </div>

              <div className="h-[1px] bg-slate-850 mb-5" />

              {/* Import / Export File section */}
              <div className="space-y-3">
                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Backups Extensíveis (JSON)</h4>
                 <button
                   type="button"
                   onClick={() => {
                     exportAppCache();
                     setIsCacheModalOpen(false);
                   }}
                   className="w-full py-2.5 px-3 rounded-lg border border-blue-900/40 bg-blue-950/10 hover:bg-blue-950/20 text-blue-400 hover:text-blue-300 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                 >
                   <Download className="w-3.5 h-3.5 text-blue-400" /> Exportar Backup JSON
                 </button>

                 {/* Drag Zone */}
                 <div 
                   onDragOver={(e) => { e.preventDefault(); setDragOverImport(true); }}
                   onDragLeave={() => setDragOverImport(false)}
                   onDrop={(e) => {
                     e.preventDefault();
                     setDragOverImport(false);
                     const file = e.dataTransfer.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = (event) => {
                         try {
                           const parsed = JSON.parse(event.target?.result as string);
                           importAppCacheFromObj(parsed);
                           setIsCacheModalOpen(false);
                         } catch (err) {
                           setCacheSuccessMessage("JSON de backup inválido!");
                           setTimeout(() => setCacheSuccessMessage(null), 3500);
                         }
                       };
                       reader.readAsText(file);
                     }
                   }}
                   className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${dragOverImport ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-750'}`}
                 >
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => {
                        handleFileUpload(e);
                        setIsCacheModalOpen(false);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-300">Arrastar ou clicar para importar</span>
                    <p className="text-[9px] text-slate-500 mt-0.5">Arquivos .json criados neste cubo</p>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
)}

  <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans antialiased text-[13px] selection:bg-neutral-200 text-neutral-900 font-medium selection:text-black ${showTrainer ? 'hidden' : 'flex'}`}>
{/* GLOW DE FUNDO */}
<div className="fixed inset-0 bg-neutral-950 pointer-events-none z-0 overflow-hidden" />
{/* HEADER DE PRECISÃO */}
<header className="relative z-10 border-b border-neutral-900 bg-neutral-950 backdrop-blur-md sticky top-0 px-6 py-3.5">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center shadow-sm">
  <Rotate3d className="w-5 h-5 text-neutral-400" />
</div>
<div>
<div className="flex items-center gap-2">
<h1 className="text-md sm:text-lg font-medium tracking-tight text-white tracking-tight ">
3D Structural Studio
</h1>
<span className="text-[9px] font-medium tracking-wider  px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 tracking-tight">
v100 CAD-PRO
</span>
</div>
<p className="text-[11px] text-neutral-400">
Advanced structural modeling and mechanism simulation.
</p>
</div>
</div>
<div className="flex items-center gap-3">
<div className="flex bg-[#0f1322] p-1 rounded-lg border border-neutral-800 text-[11px]">
<button
id="view-full-btn"
onClick={() => setViewMode('full')}
className={`px-3 py-1.5 rounded-md tracking-tight font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
viewMode === 'full' ? 'bg-neutral-200 text-neutral-900 font-medium text-black shadow' : 'text-neutral-400 hover:text-white'
}`}
>
<Grid3X3 className="w-3.5 h-3.5" /> CUBO COMPLETO
</button>
<button
id="view-closeup-btn"
onClick={() => setViewMode('closeup')}
className={`px-3 py-1.5 rounded-md tracking-tight font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
viewMode === 'closeup' ? 'bg-neutral-200 text-neutral-900 font-medium text-black shadow' : 'text-neutral-400 hover:text-white'
}`}
>
<Activity className="w-3.5 h-3.5 " /> ANATOMIA DE CANTO
</button>
</div>
<button onClick={() => setShowTrainer(true)} className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white ml-2" title="Voltar para o Treinador">
  <ArrowRight className="w-5 h-5" />
</button>
</div>
</div>
</header>
{/* DASHBOARD GRID */}
<main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* COLUNA ESQUERDA: CONTROLES CAD */}
<div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
{/* PAINEL 1: GEOMETRIA E ANATOMIA MECÂNICA (VISTA EXPLODIDA / CAPS / CONTATOS) */}
<div className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
<h2 className="text-xs font-medium  tracking-normal text-neutral-300 flex items-center gap-2 border-b border-neutral-900 pb-2.5 tracking-tight">
<Sliders className="w-3.5 h-3.5" /> Assembly & Tolerances
</h2>
{/* Slider de Vista Explodida */}
<div className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-900 flex flex-col gap-2">
<div className="flex items-center justify-between text-xs tracking-tight">
<span className="text-neutral-300 font-bold flex items-center gap-1.5">
<Grid3X3 className="w-4 h-4 text-neutral-400 " /> Vista Explodida:
</span>
<div className="flex items-center gap-1">
<input 
type="number"
min="-20"
max="500"
value={explodeDistance}
onChange={(e) => setExplodeDistance(parseFloat(e.target.value) || 0)}
className="text-neutral-300 font-bold bg-neutral-800 px-1 py-0.5 rounded border border-neutral-700 tracking-tight w-16 text-right outline-none"
/>
<span className="text-[10px] text-neutral-300">%</span>
</div>
</div>
<input 
id="explode-distance-range"
type="range" 
min="-20" 
max="150" 
step="1"
value={explodeDistance}
onChange={(e) => setExplodeDistance(parseFloat(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
/>
<div className="flex justify-between text-[10px] text-neutral-500 tracking-tight">
<span>Compact (-20%)</span>
<span>Expanded (100%)</span>
</div>
</div>
{/* Configurações de Caps e Slots */}
<div className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-900 flex flex-col gap-2">
<div className="flex items-center justify-between text-xs tracking-tight">
<span className="text-neutral-300 font-bold flex items-center gap-1.5">
<Layers className="w-4 h-4 text-neutral-400" /> Panel Gap:
</span>
<span className="text-neutral-300 font-bold bg-neutral-800 px-2.5 py-0.5 rounded border border-neutral-700">
{detachCaps}% (Clips-Pegs)
</span>
</div>
<input 
id="caps-detach-range"
type="range"
min="-20" 
max="100" 
step="5"
value={detachCaps}
onChange={(e) => setDetachCaps(parseInt(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
/>
<p className="text-[10px] text-neutral-500 leading-normal tracking-tight">
*Afasta as tampas coloridas da estrutura de plástico preto, mostrando os clipes internos masculinos e os furos/slots da peça, igual às peças de speedcube desmontadas!
</p>
</div>
{/* Ajustes Otimizadores da Moldura */}
<div className="grid grid-cols-2 gap-3">
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Canaletas (Gaps):</span>
<span className="text-neutral-300 font-bold">{seamLinesWidth}%</span>
</div>
<input 
id="seams-width-range"
type="range" 
min="0" 
max="100" 
step="1"
value={seamLinesWidth}
onChange={(e) => setSeamLinesWidth(parseFloat(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
/>
</div>
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Espessura do Adesivo (Plástico):</span>
<span className="text-neutral-300 font-bold">{capThickness}%</span>
</div>
<input 
type="range" 
min="0" 
max="100" 
step="1"
value={capThickness}
onChange={(e) => setCapThickness(parseInt(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
/>
</div>
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Arredondar Quina Interna (Canto):</span>
<span className="text-neutral-300 font-bold">{cornerCapRadius}%</span>
</div>
<input type="range" min="0" max="100" step="1" value={cornerCapRadius} onChange={(e) => setCornerCapRadius(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Arredondar Quina Externa:</span>
<span className="text-neutral-300 font-bold">{outerCapRadius}%</span>
</div>
<input type="range" min="0" max="100" step="1" value={outerCapRadius} onChange={(e) => setOuterCapRadius(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Arredondar Adesivo Meios (Cruz):</span>
<span className="text-neutral-300 font-bold">{edgeCapRadius}%</span>
</div>
<input type="range" min="0" max="100" step="1" value={edgeCapRadius} onChange={(e) => setEdgeCapRadius(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
<div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Arredondar Adesivo Centro:</span>
<span className="text-neutral-300 font-bold">{centerCapRadius}%</span>
</div>
<input type="range" min="0" max="100" step="1" value={centerCapRadius} onChange={(e) => setCenterCapRadius(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
<div className="col-span-2 bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Arredondar Peça Central:</span>
<span className="text-neutral-300 font-bold">{centerBodySize}%</span>
</div>
<input type="range" min="0" max="100" step="1" value={centerBodySize} onChange={(e) => setCenterBodySize(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
</div>
</div>
{/* PAINEL 2: MOTORES DE ROTAÇÃO E CONTROLES DE GIRO REAL */}
<div className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
<div className="flex items-center justify-between border-b border-neutral-900 pb-2 flex-wrap gap-2">
<h2 className="text-xs font-medium  tracking-normal text-[#5588ff] flex items-center gap-2 tracking-tight">
<Rotate3d className="w-3.5 h-3.5 text-neutral-300 " /> Mechanism Controls
</h2>
<span className="text-[10px] bg-neutral-800 text-blue-300 tracking-tight px-2 py-0.5 rounded font-medium ">
Matrix Active
</span>
</div>
<p className="text-[11.5px] text-neutral-400">
Gire as camadas do cubo em tempo real. A posição das peças e suas cores são recalculadas e gravadas no estado após cada giro, evitando desalinhamentos.
</p>
{/* Painel do Teclado de Movimentos */}
<div className="grid grid-cols-4 gap-2 tracking-tight">
{[
{ label: 'U (Acima)', face: 'U', dir: 1 },
{ label: "U' (Anti)", face: 'U', dir: -1 },
{ label: 'D (Baixo)', face: 'D', dir: 1 },
{ label: "D' (Anti)", face: 'D', dir: -1 },
{ label: 'F (Frente)', face: 'F', dir: 1 },
{ label: "F' (Anti)", face: 'F', dir: -1 },
{ label: 'R (Direita)', face: 'R', dir: 1 },
{ label: "R' (Anti)", face: 'R', dir: -1 },
{ label: 'L (Esquerd)', face: 'L', dir: 1 },
{ label: "L' (Anti)", face: 'L', dir: -1 },
{ label: 'B (Atrás)', face: 'B', dir: 1 },
{ label: "B' (Anti)", face: 'B', dir: -1 },
].map((btn, idx) => (
<button
key={idx}
onClick={() => addCubeMove(btn.face, btn.dir)}
className="bg-neutral-800 hover:bg-neutral-200 border border-neutral-900 hover:border-neutral-700 py-2 rounded-lg text-neutral-300 font-bold hover:text-black text-xs transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 active:bg-neutral-300"
>
<span className="text-[10.5px]">{btn.label}</span>
</button>
))}
</div>
{/* Slider de velocidade do giro */}
<div className="bg-neutral-950 rounded-xl p-3 border border-neutral-900 flex flex-col gap-1.5">
<div className="flex items-center justify-between text-xs tracking-tight">
<span className="text-neutral-400">Tempo de Giro (Velocidade):</span>
<span className="text-neutral-300 font-bold bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded">
{turnSpeed.toFixed(2)}s
</span>
</div>
<input 
id="turn-speed-range"
type="range"
min="0.10" 
max="1.20" 
step="0.05"
value={turnSpeed}
onChange={(e) => setTurnSpeed(parseFloat(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500"
/>
</div>
{/* Comandos de Ação Secundários */}
<div className="grid grid-cols-2 gap-3">
<button
id="scramble-btn"
onClick={handleScramble}
className="bg-neutral-200 text-neutral-900 font-medium hover:bg-neutral-200 text-neutral-900 font-medium text-black py-2.5 px-3 rounded-lg text-xs tracking-tight font-medium transition-all cursor-pointer text-center"
>
🌀 EMBARALHAR (Scramble)
</button>
<button
id="reset-cube-btn"
onClick={() => handleResetCube()}
className="bg-neutral-800/80 hover:bg-red-950/20 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-neutral-200 py-2.5 px-3 rounded-lg text-xs tracking-tight font-bold transition-all cursor-pointer text-center"
>
🔄 REDEFINIR RESOLVIDO
</button>
</div>
{/* Histórico das Jogadas */}
{moveHistory.length > 0 && (
<div className="bg-black/40 rounded-xl p-2 px-3 border border-neutral-900 flex items-center gap-2 overflow-x-auto select-none">
<span className="text-[10px] tracking-tight text-neutral-500 flex-shrink-0">MOVES:</span>
<div className="flex gap-1.5 tracking-tight">
{moveHistory.map((mov, i) => (
<span key={i} className="bg-neutral-800 text-neutral-300 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] font-bold">
{mov}
</span>
))}
</div>
</div>
)}
</div>
{/* PAINEL 3: SISTEMA DE ATOMIZAÇÃO INTERNA (CORE / SPRING / MAGLEV) */}
<div className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
<div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
<h2 className="text-xs font-medium  tracking-normal text-[#10b981] flex items-center gap-2 tracking-tight">
<Cpu className="w-3.5 h-3.5 text-neutral-300" /> Core & Suspension
</h2>
<span className="text-[9px] bg-neutral-800 text-neutral-300 tracking-tight px-2 py-0.5 rounded font-medium ">
Active
</span>
</div>
{/* Seleção da Arquitetura do Núcleo */}
<div className="flex flex-col gap-2">
<span className="text-[11px] tracking-tight text-neutral-400">Arquitetura do Núcleo 3D:</span>
<div className="grid grid-cols-2 gap-2">
<button
onClick={() => setCoreShape('magnetic-ipg')}
className={`py-2 px-2.5 rounded-lg text-[11px] tracking-tight font-bold transition-all text-center cursor-pointer border ${
coreShape === 'magnetic-ipg'
? 'border-neutral-700 bg-neutral-800 text-white'
: 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
}`}
>
💠 Magnetic IPG (GAN Pro)
</button>
<button
onClick={() => setCoreShape('standard')}
className={`py-2 px-2.5 rounded-lg text-[11px] tracking-tight font-bold transition-all text-center cursor-pointer border ${
coreShape === 'standard'
? 'border-neutral-700 bg-neutral-800 text-white'
: 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
}`}
>
🟡 Original Classic Core
</button>
</div>
</div>
{/* Seleção do Tipo de Material Core */}
<div className="flex flex-col gap-2">
<span className="text-[11px] tracking-tight text-neutral-400">Material do Core Central:</span>
<div className="grid grid-cols-3 gap-2">
{CORE_MATERIALS.map(core => (
<button
key={core.id}
id={`core-selector-btn-${core.id}`}
onClick={() => setSelectedCore(core.id)}
className={`py-2 px-2.5 rounded-lg text-[11.5px] tracking-tight font-bold transition-all text-center cursor-pointer border ${
selectedCore === core.id
? 'border-neutral-700 bg-neutral-800 text-white'
: 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
}`}
>
{core.name}
</button>
))}
</div>
</div>
<div className="col-span-2 bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5 mt-2">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Espessura dos Mastros (Núcleo):</span>
<span className="text-neutral-300 font-bold">{coreThickness}%</span>
</div>
<input type="range" min="10" max="250" step="1" value={coreThickness} onChange={(e) => setCoreThickness(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
<div className="col-span-2 bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col gap-1.5 mt-2 mb-2">
<div className="flex justify-between items-center text-[10.5px] tracking-tight">
<span className="text-neutral-400">Comprimento dos Mastros (X, Y, Z):</span>
<span className="text-neutral-300 font-bold">{coreLength}%</span>
</div>
<input type="range" min="10" max="250" step="1" value={coreLength} onChange={(e) => setCoreLength(parseInt(e.target.value))} className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-500" />
</div>
{/* Ajuste de Elasticidade da Mola CAD */}
<div className="bg-neutral-950 rounded-xl p-3 border border-neutral-900 flex flex-col gap-1.5">
<div className="flex items-center justify-between text-xs tracking-tight">
<span className="text-neutral-300">Tensão da Mola Helicoidal:</span>
<span className="text-neutral-300 font-bold bg-neutral-800 px-2.5 py-0.5 rounded border border-neutral-700 tracking-tight">
Nível {springTension} (Tensão {(springTension * 1.5).toFixed(1)}N)
</span>
</div>
<input 
id="spring-tension-range"
type="range"
min="1" 
max="5" 
step="1"
value={springTension}
onChange={(e) => setSpringTension(parseInt(e.target.value))}
className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
/>
</div>
{/* Toggles de Sólidos e Campos */}
<div className="grid grid-cols-2 gap-3">
<button
id="toggle-magnetic-force"
onClick={() => setShowForceFields(!showForceFields)}
className={`py-2 px-3 rounded-lg text-xs tracking-tight font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
showForceFields 
? 'border-neutral-700 bg-neutral-800 text-neutral-300' 
: 'border-neutral-900 bg-neutral-950 text-neutral-500 hover:text-neutral-400'
}`}
>
<Zap className="w-3.5 h-3.5" /> Força Magnética {showForceFields ? 'ON' : 'OFF'}
</button>
<button
id="toggle-internal-core"
onClick={() => setShowInternalCore(!showInternalCore)}
className={`py-2 px-3 rounded-lg text-xs tracking-tight font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
showInternalCore 
? 'border-neutral-700 bg-neutral-800 text-neutral-300' 
: 'border-neutral-900 bg-neutral-950 text-neutral-500 hover:text-neutral-400'
}`}
>
<Layers className="w-3.5 h-3.5" /> Core Sólido {showInternalCore ? 'ON' : 'OFF'}
</button>
</div>
</div>
</div>
{/* COLUNA DIREITA: SUPER VIEWPORT DE RENDERING E EXPORT */}
<div className="lg:col-span-7 flex flex-col gap-6">
{/* VIEWPORT WEBGL */}
<div className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden group">
{/* HUD de Medição Técnica */}
<div className="flex items-center justify-between z-20 relative select-none tracking-tight">
<span className="text-[11.5px] font-medium text-neutral-300 flex items-center gap-1.5  tracking-wide">
<Activity className="w-4 h-4 text-neutral-300 " /> Interactive Viewport
</span>
<div className="flex gap-2 text-[9px] text-neutral-500">
<span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
ESTÚDIO: {activeStudioInfo.name.split(' ')[1] || activeStudioInfo.name}
</span>
<span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900 ">
Skins: {activeStyleInfo.name.split(' ')[0]}
</span>
</div>
</div>
{/* CONTAINER CANVAS RENDERER */}
<div 
id="webgl-viewport-wrapper"
onMouseDown={pointerDownHandler}
onTouchStart={touchStartHandler}
className="h-[440px] md:h-[480px] w-full rounded-xl relative select-none overflow-hidden cursor-grab active:cursor-grabbing border border-neutral-900/80 transition-all duration-300"
style={{ background: activeStudioInfo.bg }}
>
{/* O CANVAS DO THREE.JS */}
{!showTrainer && <ThreeDStudio 
key="config-studio"
stateRef={configStateRef}
cubeStateRef={cubeState2DRef}
explodeDistance={explodeDistance}
capThickness={capThickness}
cornerCapRadius={cornerCapRadius}
edgeCapRadius={edgeCapRadius}
centerCapRadius={centerCapRadius}
outerCapRadius={outerCapRadius}
centerBodySize={centerBodySize}
seamLinesWidth={seamLinesWidth}
detachCaps={detachCaps}
selectedTheme={selectedTheme}
selectedStudio={selectedStudio}
selectedCore={selectedCore}
coreShape={coreShape}
springTension={springTension}
coreThickness={coreThickness}
coreLength={coreLength}
showForceFields={showForceFields}
showInternalCore={showInternalCore}
selectedSkin={selectedSkin}
viewMode={viewMode}
commandQueue={commandQueueRef}
                activeMoveState={activeMoveStateRef}
cameraRotX={rotateX}
cameraRotY={rotateY}
onMoveFinished={handleMoveFinished}
focusCase={focusCase}
useStealthFocus={useStealthFocus}
/>}
{/* Bússola Vetorial CAD / Medições HUD */}
<div className="absolute top-3 left-3 bg-black/75 rounded-lg p-3 border border-neutral-800 backdrop-blur-sm pointer-events-none text-[10px] tracking-tight text-neutral-300 flex flex-col gap-1 z-20">
<span className="text-neutral-300 font-bold flex items-center gap-1  tracking-wider">
<Cpu className="w-3 h-3" /> Viewport Info:
</span>
<span>• Fendas (Gaps): {seamLinesWidth.toFixed(2)} mm</span>
<span>• Caps Soltos: {detachCaps}% (Clips expostos)</span>
<span>• Tema Atual: {activeThemeInfo.name}</span>
<span>• Relevo Pele: {activeStyleInfo.name}</span>
<span>• Órbita Camera: X:{rotateX.toFixed(0)}° Y:{rotateY.toFixed(0)}°</span>
<span>• Ímãs de Posicionamento: 76 Magnets</span>
</div>
{/* Botões do Topo Direito (Orbit e Recam) */}
<div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
<button
id="auto-orbit-toggle-btn"
onClick={() => setIsAutoRotate(!isAutoRotate)}
className={`px-3 py-1.5 rounded-full border text-[9px] font-medium tracking-wider  transition-all cursor-pointer shadow-md backdrop-blur-sm flex items-center gap-1.5 ${
isAutoRotate 
? 'border-neutral-700 bg-neutral-800 text-neutral-300' 
: 'border-neutral-800 bg-black/60 text-neutral-400 hover:text-white'
}`}
>
<Compass className={`w-3.5 h-3.5 ${isAutoRotate ? '' : ''}`} />
{isAutoRotate ? 'ROTATIVO AUTOMÁTICO' : 'CÂMERA MANUAL'}
</button>
<button
id="reset-cam-btn"
onClick={() => { setRotateX(-22); setRotateY(35); }}
className="px-2.5 py-1.5 rounded-lg border border-neutral-850 bg-black/60 shadow-md backdrop-blur-sm text-[9px] font-bold text-neutral-400 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
>
<RotateCcw className="w-3 h-3" /> RETORNAR CÂMERA
</button>
<button
title="Salvar esta rotação de câmera como padrão para o treinador"
onClick={() => {
  const angleObj = { x: rotateX, y: rotateY };
  setSavedCameraAngle(angleObj);
  localStorage.setItem('cube_saved_camera_angle', JSON.stringify(angleObj));
}}
className="px-2.5 py-1.5 rounded-lg border border-neutral-850 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-bold text-[9px] cursor-pointer transition-all flex items-center gap-1"
>
<Save className="w-3 h-3 text-amber-400" /> SALVAR ESTA VISÃO
</button>
</div>
{/* Seletor do Preset de Luzes */}
<div className="absolute bottom-3 left-3 z-20 bg-black/70 p-2.5 rounded-lg border border-neutral-800 backdrop-blur-md flex flex-col gap-1 w-[180px]">
<span className="text-[9px] font-medium  text-neutral-400 tracking-tight tracking-wider flex items-center gap-1">
<Camera className="w-3 h-3" /> ILUMINAÇÃO ESTÚDIO:
</span>
<select
id="studio-select-dropdown"
value={selectedStudio}
onChange={(e) => setSelectedStudio(e.target.value)}
className="bg-neutral-950 border border-neutral-800 text-[10.5px] tracking-tight text-white rounded px-1.5 py-1 focus:outline-none cursor-pointer w-full"
>
{STUDIO_PRESETS.map(s => (
<option key={s.id} value={s.id}>{s.name.replace('Professional ', '')}</option>
))}
</select>
</div>
{/* 2D Map */}
<div className="absolute bottom-20 left-3 z-20 pointer-events-none drop-shadow-lg opacity-80 mix-blend-screen mix-blend-mode-lighten">
  <FlatCubeMap state={cubeState2D} focusCase={focusCase} />
</div>
{/* On-Canvas Face Selectors */}
<div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto bg-black/50 p-2 rounded-lg border border-neutral-800 backdrop-blur-sm">
  <div className="flex flex-col gap-1">
    <div className="text-[8px] text-neutral-400 text-center mb-0.5 tracking-tighter">FACE MOVES</div>
    <div className="grid grid-cols-2 gap-1">
      {['U', 'D', 'R', 'L', 'F', 'B'].map((face) => (
        <React.Fragment key={face}>
          <button
            onClick={(e) => { e.stopPropagation(); addCubeMove(face, 1); }}
            className="bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 text-slate-200 font-bold w-7 h-7 text-[10px] rounded shadow active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
          >
            {face}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addCubeMove(face, -1); }}
            className="bg-neutral-900 hover:bg-neutral-700 border border-neutral-700 text-slate-200 font-bold w-7 h-7 text-[10px] rounded shadow active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
          >
            {face}'
          </button>
        </React.Fragment>
      ))}
    </div>
  </div>
  <div className="flex flex-col gap-1 border-t border-neutral-800 pt-1.5">
    <div className="text-[8px] text-[#10b981] text-center mb-0.5 tracking-tighter w-14 leading-tight mx-auto">ROTACIONAR CUBO</div>
    <div className="grid grid-cols-2 gap-1">
      {['X', 'Y', 'Z'].map((axis) => (
        <React.Fragment key={axis}>
          <button
            onClick={(e) => { e.stopPropagation(); addCubeMove(axis, 1); }}
            className="bg-[#10b981]/20 hover:bg-[#10b981]/40 border border-[#10b981]/50 text-[#10b981] font-bold w-7 h-7 text-[10px] rounded shadow active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
          >
            {axis}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addCubeMove(axis, -1); }}
            className="bg-[#10b981]/20 hover:bg-[#10b981]/40 border border-[#10b981]/50 text-[#10b981] font-bold w-7 h-7 text-[10px] rounded shadow active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
          >
            {axis}'
          </button>
        </React.Fragment>
      ))}
    </div>
  </div>
</div>
{/* Indicador 3D */}
<div className="absolute bottom-3 right-3 text-[10px] tracking-tight text-neutral-300 bg-black/70 border border-neutral-700 px-2.5 py-1 rounded-full z-20 flex items-center gap-1.5 shadow">
<span className="w-1.5 h-1.5 rounded-full bg-neutral-200 text-neutral-900 animate-ping" /> Real 3D Solids Active
</div>
</div>
{/* SELEÇÃO DO TEMA E CORES */}
<div className="bg-neutral-950 rounded-xl p-4 border border-neutral-900 flex flex-col gap-3">
<span className="text-xs tracking-tight font-bold text-neutral-300 block">Esquema Cromático Oficial (Tema do Cubo):</span>
<div className="flex flex-col sm:flex-row gap-2">
{COLOR_THEMES.map(theme => {
const isSelected = selectedTheme === theme.id;
return (
<button
key={theme.id}
id={`theme-btn-${theme.id}`}
onClick={() => setSelectedTheme(theme.id)}
className={`flex-1 p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
isSelected 
? 'border-neutral-700 bg-neutral-800' 
: 'border-neutral-900 bg-neutral-900/40 text-neutral-400 hover:text-white hover:border-neutral-800'
}`}
>
{/* Paleta rápida de cores da tampa */}
<div className="grid grid-cols-2 gap-0.5 mt-0.5">
<div className="w-3.5 h-3.5 rounded-[1px]" style={{ backgroundColor: `#${theme.colors.F.toString(16).padStart(6,'0')}` }} />
<div className="w-3.5 h-3.5 rounded-[1px]" style={{ backgroundColor: `#${theme.colors.R.toString(16).padStart(6,'0')}` }} />
</div>
<div>
<span className="text-xs font-bold tracking-tight text-neutral-200 block leading-tight">{theme.name}</span>
<span className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{theme.description}</span>
</div>
</button>
);
})}
</div>
</div>
{/* SELETOR RÁPIDO DE TEXTURAS / ACABAMENTO */}
<div className="bg-neutral-950 rounded-xl p-3 border border-neutral-900 flex flex-col gap-2">
<span className="text-xs tracking-tight font-bold text-neutral-300 block">Textura Superficial das Peças (Acabamento):</span>
<div className="grid grid-cols-4 gap-2">
{SKINS.map((sk) => {
const isSelected = selectedSkin === sk.id;
return (
<button
key={sk.id}
onClick={() => setSelectedSkin(sk.id)}
className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
isSelected
? 'border-neutral-700 bg-neutral-800 text-white shadow-md'
: 'border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400'
}`}
>
<span className="text-xs font-bold leading-none block tracking-tight">{sk.name.split(' ')[0]} {sk.name.split(' ')[1]}</span>
<span className="text-[8.5px] text-neutral-500 tracking-tight italic truncate">{sk.tag}</span>
</button>
);
})}
</div>
<div className="bg-neutral-900 p-2.5 rounded border border-neutral-900 text-[10.5px] text-neutral-400 flex items-start gap-1.5">
<Info className="w-3.5 h-3.5 text-neutral-300 mt-0.5 flex-shrink-0" />
<span>
{selectedSkin === 'honeycomb-tech' && 'Honeycomb Friction: Relevo hexagonal alveolar interno proprietário da GAN, ideal para retenção/fluxo de óleo e giros super suaves.'}
{selectedSkin === 'carbon-fighter' && 'Carbon Fiber: Micro trama cruzada diagonal que impede marcas de abrasão, dando toque altamente tátil.'}
{selectedSkin === 'glossy-stickerless' && 'UV-Gloss Finish: Verniz espelhado de super proteção UV de reflexo reto nítido.'}
{selectedSkin === 'frost-satin' && 'Frosted Matte: Superfície ligeiramente rugosa jateada de grande pegada e anti-riscos.'}
{selectedSkin === 'cyber-neon' && 'Cyber Glow: Pigmentação neon vibrante e luminescente de alta saturação reflexiva.'}
</span>
</div>
</div>
</div>
{/* PAINEL CÓDIGO FONTE EXPORTÁVEL (Visual Studio / VS Code) */}
<div className="bg-neutral-900 border border-neutral-900 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
<div className="flex items-center justify-between border-b border-neutral-900 pb-2">
<div>
<h2 className="text-xs font-medium  tracking-normal text-neutral-300 flex items-center gap-2 tracking-tight">
<SlidersHorizontal className="w-4 h-4" /> Export to Component
</h2>
<p className="text-[10.5px] text-neutral-500">Desenvolva diretamente no seu Visual Studio local!</p>
</div>
{/* Toggle de Tabs */}
<div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-850 text-[10px] tracking-tight">
<button 
onClick={() => setExportTab('html')}
className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-bold ${exportTab === 'html' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-400'}`}
>
SINGLE HTML
</button>
<button 
onClick={() => setExportTab('python')}
className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-bold ${exportTab === 'python' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-400'}`}
>
PYTHON (BLENDER)
</button>
</div>
</div>
<p className="text-[11px] text-neutral-400 leading-normal">
{exportTab === 'html' 
? 'Copie este arquivo HTML completo de alta fidelidade e execute-o diretamente no seu navegador abrindo o arquivo sem precisar instalar dependências! Possui suporte a giros rápidos por teclado.' 
: 'Copie este script Python e execute-o na aba "Scripting" do Blender para gerar a estrutura base do cubo magneticamente posicionado e pronto para renderização ou modelagem das skins.'}
</p>


            <div className="relative rounded-xl bg-neutral-950 border border-neutral-900 px-4 py-3 max-h-[140px] overflow-y-auto tracking-tight text-[10.5px] leading-relaxed text-neutral-300 scrollbar-thin select-all">
              <pre className="whitespace-pre tracking-tight">
                {exportTab === 'html' ? codeHTML : codePython}
              </pre>
            </div>

            <div className="flex justify-end gap-3 w-full">
              <button
                id="export-dxf-btn"
                onClick={() => {
                  const scene = (window as any).__threeScene;
                  if (scene) exportSceneToDXF(scene);
                }}
                className="py-2 px-4 rounded-xl border border-neutral-700 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 tracking-tight font-bold text-xs text-neutral-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" /> EXPORTAR P/ DXF (CAD 3D)
              </button>

              <button
                id="copy-cad-math-btn"
                onClick={handleCopyCode}
                className="py-2 px-4 rounded-xl bg-neutral-200 text-neutral-900 font-medium hover:bg-neutral-200 text-neutral-900 font-medium tracking-tight font-medium text-xs text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" /> ¡CÓDIGO COPIADO COM SUCESSO!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> COPIAR ARQUIVO DE CÓDIGO FONTE
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-5 px-6 text-center text-xs text-neutral-500 mt-auto tracking-tight">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 3D Structural Studio. Modelagem tridimensional matemática de comutação real de giro.</p>
          <div className="flex items-center gap-4 text-[9.5px]">
            <span>ENGINE: THREE.JS + WEBGL</span>
            <span className="text-neutral-300 font-bold">PHYSICAL MESH DETECTS: COMPACT ACTIVE</span>
          </div>
        </div>
      </footer>

    </div>
  </>
  );
}
