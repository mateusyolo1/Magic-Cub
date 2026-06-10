import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trash2 } from 'lucide-react';

export function SpeedTimer({ currentAlgoId }: { currentAlgoId?: string }) {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<'idle' | 'ready' | 'running' | 'stopped'>('idle');
  const timerRef = useRef<number>();
  const startTime = useRef(0);
  
  // Records tracking
  const [records, setRecords] = useState<Record<string, number[]>>({});

  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let keyIsDown = false;
    
    const tick = () => {
       setTime(Date.now() - startTime.current);
       timerRef.current = requestAnimationFrame(tick);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code !== 'Space') return;
      
      e.preventDefault();
      // Prevent OS key repeat from triggering multiple times
      if (keyIsDown) return;
      keyIsDown = true;

      const currentState = stateRef.current;

      if (currentState === 'idle' || currentState === 'stopped') {
        setTime(0);
        setState('ready');
        stateRef.current = 'ready';
      } else if (currentState === 'running') {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        setState('stopped');
        stateRef.current = 'stopped';
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code !== 'Space') return;
      
      e.preventDefault();
      keyIsDown = false;

      const currentState = stateRef.current;

      if (currentState === 'ready') {
        startTime.current = Date.now();
        setState('running');
        stateRef.current = 'running';
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

  let timeDisplay = (time / 1000).toFixed(2);
  let textColor = 'text-slate-100';
  if (state === 'ready') textColor = 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]';
  if (state === 'stopped') textColor = 'text-red-400';

  const formatTime = (ms: number) => (ms / 1000).toFixed(2);
  const algoRecords = currentAlgoId ? (records[currentAlgoId] || []) : [];

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden relative">
       <div className="p-6 flex flex-col items-center justify-center relative group min-h-[160px]">
         <span className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest mb-2"><Timer className="w-4 h-4"/> Timer de Treino</span>
         <span className={`text-[80px] font-black font-mono tracking-tighter leading-none transition-colors ${textColor}`}>
           {timeDisplay}
         </span>
         <span className="text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-widest text-center opacity-70 group-hover:opacity-100 transition-opacity">
           Segure Espaço para zerar. Solte para iniciar.<br/>Pressione novamente para parar.
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
