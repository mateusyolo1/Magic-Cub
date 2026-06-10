import React from 'react';
import { BookOpen, X, Rotate3d, Layers } from 'lucide-react';

export const HeroTheory = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto custom-scrollbar flex p-4 md:p-8">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl mx-auto rounded-3xl shadow-2xl relative flex flex-col my-auto max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md rounded-t-3xl z-10">
          <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-3">
            <BookOpen className="w-6 h-6" /> Metodologia & Teoria do Cubo
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Intro */}
          <section>
            <h3 className="text-xl font-bold text-slate-200 mb-3 text-blue-400">🧠 Construindo Memória Muscular</h3>
            <p className="text-slate-400 leading-relaxed">
              O Treinador Neural adota um formato fragmentado (blocos). Decorar algorítimos do cubo mágico não é sobre 
              "lembrar as letras", mas sim converter padrões visuais e posições para reflexos mecânicos nas mãos (Finger Tricks).
              Por isso, você passa pelos blocos 1, 2, 3 e só depois pratica "Tudo" com avaliações rígidas (modo Quiz).
            </p>
          </section>

          {/* Peças e Slots */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Anatomia do Cubo
              </h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><strong className="text-slate-200">Centros (1 cor):</strong> Fixos na base. Ditam qual cor aquela face do cubo será. O centro branco é oco-oposto ao amarelo.</li>
                <li><strong className="text-slate-200">Meios (2 cores):</strong> Conectam dois centros. Fundamentais para montar a Cruz e orientações da última camada (OLL).</li>
                <li><strong className="text-slate-200">Quinas (3 cores):</strong> Ocupam os vértices. Resolver o cubo é essencialmente alinhar essas peças com os Padrões F2L (Primeiras Duas Camadas).</li>
                <li><strong className="text-slate-200">Slots:</strong> Refere-se a uma posição coluna "Vazia" aguardando um par (1 Quina + 1 Meio) nas técnicas do CFOP (F2L).</li>
              </ul>
            </section>
            
            <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Rotate3d className="w-5 h-5 text-emerald-400" /> Notação Padrão (Letras)
              </h3>
              <p className="text-sm text-slate-400 mb-3">Cada letra representa a face de inglês que gira em sentido horário. O Apóstrofo (') inverte o giro (anti-horário).</p>
              <ul className="space-y-1 text-sm text-slate-400 font-mono">
                <li><span className="text-blue-400 font-bold">R</span>ight (Direita)</li>
                <li><span className="text-green-400 font-bold">L</span>eft (Esquerda)</li>
                <li><span className="text-yellow-400 font-bold">U</span>p (Topo)</li>
                <li><span className="text-white font-bold">D</span>own (Baixo)</li>
                <li><span className="text-red-400 font-bold">F</span>ront (Frente)</li>
                <li><span className="text-orange-400 font-bold">B</span>ack (Trás)</li>
              </ul>
            </section>
          </div>

          {/* Rotações de Base */}
          <section>
            <h3 className="text-xl font-bold mb-3 text-purple-400">Eixos: x, y, z</h3>
            <p className="text-slate-400 leading-relaxed text-sm mb-4">
              Diferente de M, E, e S (que movem fatias internas), as letras minúsculas <strong>x, y, z</strong> giram o cubo inteiro nas mãos. Útil para posicioná-lo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
               <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-2xl font-black font-mono text-slate-200">x e x'</span>
                  <p className="text-xs text-slate-400 mt-2">Equivale à direção do <strong>R</strong>. A face da frente (F) sobe para o topo (U). O movimento contrário <strong>(x')</strong> rotaciona o topo para a frente.</p>
               </div>
               <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-2xl font-black font-mono text-slate-200">y e y'</span>
                  <p className="text-xs text-slate-400 mt-2">Equivale à direção do <strong>U</strong>. Gira o cubo horizontalmente. A face da direita (R) vem para a frente (F).</p>
               </div>
               <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-2xl font-black font-mono text-slate-200">z e z'</span>
                  <p className="text-xs text-slate-400 mt-2">Equivale à direção do <strong>F</strong>. Tomba o cubo como um ponteiro de relógio. O topo (U) cai para o lado direito (R).</p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
