import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trash2, AlertTriangle } from 'lucide-react';

export function SpeedTimer({ currentAlgoId }: { currentAlgoId?: string }) {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<'idle' | 'inspecting' | 'ready' | 'running' | 'stopped'>('idle');
  const [inspectionTime, setInspectionTime] = useState(15000);
  const [inspectionAlert, setInspectionAlert] = useState<string | null>(null);
  
  const timerRef = useRef<number>();
  const startTime = useRef(0);
  const inspectionStart = useRef(0);
  const alert8Ref = useRef(false);
  const alert12Ref = useRef(false);
  const justStopped = useRef(false);
  
  // Records tracking
  const [records, setRecords] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('cube_app_records_v2');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('cube_app_records_v2', JSON.stringify(records));
  }, [records]);

  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const playAlert = (msg: string) => {
    setInspectionAlert(msg);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(msg);
      u.lang = 'pt-BR';
      u.volume = 0.8;
      speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    let keyIsDown = false;
    
    const tick = () => {
       const now = performance.now();
       const currentState = stateRef.current;
       
       if (currentState === 'running') {
         setTime(now - startTime.current);
         timerRef.current = requestAnimationFrame(tick);
       } else if (currentState === 'inspecting') {
         const elapsed = now - inspectionStart.current;
         const remaining = 15000 - elapsed;
         
         if (remaining <= 0) {
           setInspectionTime(0);
         } else {
           setInspectionTime(remaining);
           // 8s alert (7s remaining)
           if (remaining <= 7000 && !alert8Ref.current) {
             alert8Ref.current = true;
             playAlert("Oito segundos decorridos");
           }
           // 12s alert (3s remaining)
           if (remaining <= 3000 && !alert12Ref.current) {
             alert12Ref.current = true;
             playAlert("Três");
           }
         }
         timerRef.current = requestAnimationFrame(tick);
       }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code !== 'Space') return;
      
      e.preventDefault();
      // Prevent OS key repeat from triggering multiple times
      if (keyIsDown) return;
      keyIsDown = true;

      const currentState = stateRef.current;

      if (currentState === 'inspecting') {
         if (timerRef.current) cancelAnimationFrame(timerRef.current);
         setState('ready');
         stateRef.current = 'ready';
      } else if (currentState === 'running') {
         if (timerRef.current) cancelAnimationFrame(timerRef.current);
         setState('stopped');
         stateRef.current = 'stopped';
         justStopped.current = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code !== 'Space') return;
      
      e.preventDefault();
      keyIsDown = false;

      if (justStopped.current) {
         justStopped.current = false;
         return;
      }

      const currentState = stateRef.current;

      if (currentState === 'idle' || currentState === 'stopped') {
         alert8Ref.current = false;
         alert12Ref.current = false;
         setInspectionAlert(null);
         setInspectionTime(15000);
         inspectionStart.current = performance.now();
         setState('inspecting');
         stateRef.current = 'inspecting';
         timerRef.current = requestAnimationFrame(tick);
      } else if (currentState === 'ready') {
         setTime(0);
         startTime.current = performance.now();
         setState('running');
         stateRef.current = 'running';
         setInspectionAlert(null);
         timerRef.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, []);

  // Save record when stopped
  useEffect(() => {
    if (state === 'stopped' && time > 0 && currentAlgoId) {
      setRecords(prev => ({
         ...prev,
         [currentAlgoId]: [time, ...(prev[currentAlgoId] || [])]
      }));
    }
  }, [state, currentAlgoId]); // 'time' is left out to capture only at stop

  const formatTime = (ms: number) => (ms / 1000).toFixed(2);
  const timeDisplay = formatTime(time);
  const inspectionDisplay = Math.ceil(inspectionTime / 1000).toString();
  
  let textColor = 'text-slate-100';
  if (state === 'ready') textColor = 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]';
  if (state === 'stopped') textColor = 'text-red-400';
  if (state === 'inspecting' && inspectionTime <= 3000) textColor = 'text-orange-500';

  const algoRecords = currentAlgoId ? (records[currentAlgoId] || []) : [];

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden relative">
       <div className="p-6 flex flex-col items-center justify-center relative group min-h-[160px]">
         <span className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest mb-2"><Timer className="w-4 h-4"/> Timer de Treino</span>
         
         {state === 'inspecting' ? (
           <div className="flex flex-col items-center">
             <span className={`text-[80px] font-black font-mono tracking-tighter leading-none transition-colors ${textColor}`}>
               {inspectionDisplay}
             </span>
             {inspectionAlert && (
               <span className="text-orange-400 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-1 animate-pulse">
                 <AlertTriangle className="w-4 h-4"/> {inspectionAlert}
               </span>
             )}
           </div>
         ) : (
           <span className={`text-[80px] font-black font-mono tracking-tighter leading-none transition-colors ${textColor}`}>
             {timeDisplay}
           </span>
         )}

         <span className="text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-widest text-center opacity-70 group-hover:opacity-100 transition-opacity">
           {state === 'idle' || state === 'stopped' 
             ? "Toque na barra de espaço para iniciar inspeção de 15s" 
             : state === 'inspecting' 
               ? "Segure espaço quando estiver pronto" 
               : state === 'ready' 
                 ? "Solte para iniciar o timer" 
                 : "Pressione espaço para parar"}
         </span>
       </div>
       
       {algoRecords.length > 0 && (
         <div className="border-t border-slate-800 bg-slate-950 p-4 shrink-0 max-h-[140px] overflow-y-auto custom-scrollbar">
           <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-slate-400 uppercase">Tempos (Ao5: {algoRecords.length >= 5 ? formatTime(algoRecords.slice(0,5).reduce((a,b)=>a+b,0)/5) : '--'})</span>
             <button onClick={() => setRecords(p => ({...p, [currentAlgoId!]: []}))} className="text-slate-600 hover:text-red-400 transition-colors">
               <Trash2 className="w-4 h-4" />
             </button>
           </div>
           <div className="grid grid-cols-5 gap-2">
             {algoRecords.map((rec, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-mono text-xs font-bold text-slate-300">
                  {formatTime(rec)}s
                </div>
             ))}
           </div>
         </div>
       )}
    </div>
  );
}
