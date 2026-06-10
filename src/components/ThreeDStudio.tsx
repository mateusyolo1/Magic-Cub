import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { HelixCurve } from '../lib/threeUtils';
import { COLOR_THEMES, STUDIO_PRESETS, CORE_MATERIALS, SKINS } from '../lib/constants';

interface ThreeDStudioProps {
  stateRef: React.MutableRefObject<any>;
  cubeStateRef: React.MutableRefObject<any>;
  commandQueue: React.MutableRefObject<Array<{ face: string, dir: number }>>;
  activeMoveState: React.MutableRefObject<{ face: string, dir: number, angle: number, speed: number } | null>;
  selectedStudio: string;
  selectedSkin: string;
  selectedTheme: string;
  selectedCore: string;
  coreShape: string;
  explodeDistance: number;
  detachCaps: number;
  seamLinesWidth: number;
  centerCapRadius: number;
  edgeCapRadius: number;
  cornerCapRadius: number;
  outerCapRadius: number;
  centerBodySize: number;
  coreThickness: number;
  coreLength: number;
  springTension: number;
  capThickness: number;
  showForceFields: boolean;
  showInternalCore: boolean;
  viewMode: 'full' | 'closeup';
  cameraRotX: number;
  cameraRotY: number;
  onMoveFinished?: (move: { face: string, dir: number }) => void;
  focusCase?: 'none' | 'f2l' | 'oll' | 'pll';
  useStealthFocus?: boolean;
}

export const ThreeDStudio: React.FC<ThreeDStudioProps> = ({
  stateRef,
  cubeStateRef,
  commandQueue,
  activeMoveState,
  selectedStudio,
  selectedSkin,
  selectedTheme,
  selectedCore,
  coreShape,
  explodeDistance,
  detachCaps,
  seamLinesWidth,
  centerCapRadius,
  edgeCapRadius,
  cornerCapRadius,
  outerCapRadius,
  centerBodySize,
  coreThickness,
  coreLength,
  springTension,
  capThickness,
  showForceFields,
  showInternalCore,
  viewMode,
  cameraRotX,
  cameraRotY,
  onMoveFinished,
  focusCase = 'none',
  useStealthFocus = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  
  // Lista indexada das 26 peças do cubo
  const cubiesRef = useRef<Array<{
    id: number;
    basePos: THREE.Vector3;
    baseQuat: THREE.Quaternion;
    meshGroup: THREE.Group;
    isCorner: boolean;
    isEdge: boolean;
    isCenter: boolean;
  }>>([]);

  const cleanThreeScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m: any) => {
          if (m.map) m.map.dispose();
          if (m.envMap) m.envMap.dispose();
          m.dispose();
        });
      }
    });
    cubiesRef.current = [];
  };

  // Carregar e montar contexto do Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    (window as any).__threeScene = scene;

    // 2. CAMERA SETUP
    const w = mountRef.current.clientWidth || 500;
    const h = mountRef.current.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 0, 18);

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;

    const faceAxes: any = {
      U: { axis: new THREE.Vector3(0, 1, 0), test: (p: THREE.Vector3) => p.y > 0.5 },
      D: { axis: new THREE.Vector3(0, -1, 0), test: (p: THREE.Vector3) => p.y < -0.5 },
      R: { axis: new THREE.Vector3(1, 0, 0), test: (p: THREE.Vector3) => p.x > 0.5 },
      L: { axis: new THREE.Vector3(-1, 0, 0), test: (p: THREE.Vector3) => p.x < -0.5 },
      F: { axis: new THREE.Vector3(0, 0, 1), test: (p: THREE.Vector3) => p.z > 0.5 },
      B: { axis: new THREE.Vector3(0, 0, -1), test: (p: THREE.Vector3) => p.z < -0.5 },
      M: { axis: new THREE.Vector3(-1, 0, 0), test: (p: THREE.Vector3) => p.x > -0.5 && p.x < 0.5 },
      E: { axis: new THREE.Vector3(0, -1, 0), test: (p: THREE.Vector3) => p.y > -0.5 && p.y < 0.5 },
      S: { axis: new THREE.Vector3(0, 0, 1), test: (p: THREE.Vector3) => p.z > -0.5 && p.z < 0.5 },
      r: { axis: new THREE.Vector3(1, 0, 0), test: (p: THREE.Vector3) => p.x > -0.5 },
      Rw: { axis: new THREE.Vector3(1, 0, 0), test: (p: THREE.Vector3) => p.x > -0.5 },
      l: { axis: new THREE.Vector3(-1, 0, 0), test: (p: THREE.Vector3) => p.x < 0.5 },
      Lw: { axis: new THREE.Vector3(-1, 0, 0), test: (p: THREE.Vector3) => p.x < 0.5 },
      u: { axis: new THREE.Vector3(0, 1, 0), test: (p: THREE.Vector3) => p.y > -0.5 },
      Uw: { axis: new THREE.Vector3(0, 1, 0), test: (p: THREE.Vector3) => p.y > -0.5 },
      d: { axis: new THREE.Vector3(0, -1, 0), test: (p: THREE.Vector3) => p.y < 0.5 },
      Dw: { axis: new THREE.Vector3(0, -1, 0), test: (p: THREE.Vector3) => p.y < 0.5 },
      f: { axis: new THREE.Vector3(0, 0, 1), test: (p: THREE.Vector3) => p.z > -0.5 },
      Fw: { axis: new THREE.Vector3(0, 0, 1), test: (p: THREE.Vector3) => p.z > -0.5 },
      b: { axis: new THREE.Vector3(0, 0, -1), test: (p: THREE.Vector3) => p.z < 0.5 },
      Bw: { axis: new THREE.Vector3(0, 0, -1), test: (p: THREE.Vector3) => p.z < 0.5 },
      X: { axis: new THREE.Vector3(1, 0, 0), test: (p: THREE.Vector3) => true },
      Y: { axis: new THREE.Vector3(0, 1, 0), test: (p: THREE.Vector3) => true },
      Z: { axis: new THREE.Vector3(0, 0, 1), test: (p: THREE.Vector3) => true }
    };

    const tempQuatStatic = new THREE.Quaternion();

    const applyOrientationState = () => {
       const oList = cubeStateRef.current.orientationLogic || [];
       oList.forEach((m: { face: string, dir: number }) => {
          const target = -(Math.PI / 2) * m.dir;
          const activeFaceData = faceAxes[m.face];
          if (!activeFaceData) return;
          cubiesRef.current.forEach(c => {
             if (activeFaceData.test(c.basePos)) {
                c.basePos.applyAxisAngle(activeFaceData.axis, target);
                c.basePos.set(Math.round(c.basePos.x), Math.round(c.basePos.y), Math.round(c.basePos.z));
                tempQuatStatic.setFromAxisAngle(activeFaceData.axis, target);
                c.baseQuat.premultiply(tempQuatStatic);
                // Also update the physical matrix immediately since we are doing static refresh
                c.meshGroup.position.set(c.basePos.x * 2.15, c.basePos.y * 2.15, c.basePos.z * 2.15); // Approximate scale, will be fixed in next tick
                c.meshGroup.quaternion.copy(c.baseQuat);
             }
          });
       });
    };

    rebuildEverything();
    applyOrientationState();

    // Resize Observer
    const ro = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width: nw, height: nh } = entries[0].contentRect;
      if (nw > 0 && nh > 0 && rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = nw / nh;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(nw, nh);
      }
    });
    ro.observe(mountRef.current);

    // Reset listener callback
    const testAndApplyInstantMove = (face: string, dir: number) => {
        const target = -(Math.PI / 2) * dir;
        const activeFaceData = faceAxes[face];
        if (!activeFaceData) return;
        
        cubiesRef.current.forEach(c => {
            if (activeFaceData.test(c.basePos)) {
                c.basePos.applyAxisAngle(activeFaceData.axis, target);
                c.basePos.set(Math.round(c.basePos.x), Math.round(c.basePos.y), Math.round(c.basePos.z));

                tempQuat.setFromAxisAngle(activeFaceData.axis, target);
                c.baseQuat.premultiply(tempQuat);

                c.meshGroup.position.set(c.basePos.x * 2.1, c.basePos.y * 2.1, c.basePos.z * 2.1);
                c.meshGroup.quaternion.copy(c.baseQuat);
            }
        });
    };

    const handleResetAll = (e: any) => {
      cubiesRef.current.forEach(c => {
        c.basePos.set(
          c.meshGroup.userData.origX,
          c.meshGroup.userData.origY,
          c.meshGroup.userData.origZ
        );
        c.baseQuat.set(0, 0, 0, 1);
        c.meshGroup.position.set(c.meshGroup.userData.origX * 2.1, c.meshGroup.userData.origY * 2.1, c.meshGroup.userData.origZ * 2.1);
        c.meshGroup.quaternion.set(0, 0, 0, 1);
      });
      // Optionally reapply logic here too! (BUT reset is supposed to be fully solved for Trainer configs... Wait, user wanted orientation to persist! So YES, reapply!
      applyOrientationState();

      // Aplica algoritmo para deixar o cubo pré embaralhado (setup case inicial)
      const setup = e?.detail?.setupAlgo;
      if (setup) {
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
        const MOVE_TOKEN_REGEX = /([RULDFBruldfb][wW]?(?:2|²|')?|[MESmesxyzXYZ](?:2|²|')?|[()])/g;
        const moves = setup.trim().match(MOVE_TOKEN_REGEX) || [];
        moves.forEach((rawMove: string) => {
           if (rawMove === '(' || rawMove === ')') return;
           let cleanMove = rawMove;
           if (cleanMove.length >= 2 && cleanMove[1].toLowerCase() === 'w') {
               cleanMove = cleanMove[0].toUpperCase() + 'w' + cleanMove.slice(2);
           } else if (/^[mesxyz]/i.test(cleanMove[0])) {
               cleanMove = cleanMove[0].toUpperCase() + cleanMove.slice(1);
           } else if (cleanMove.length > 0 && /^[ruldfb]$/i.test(cleanMove[0]) && cleanMove[0] === cleanMove[0].toLowerCase()) {
               // keeping lowercase
           } else {
               cleanMove = cleanMove[0].toUpperCase() + cleanMove.slice(1);
           }
           let expanded = macros[cleanMove] || [cleanMove];
           expanded.forEach(move => {
             let face = move[0];
             let dir = move.includes("'") ? -1 : (move.includes("2") || move.includes("²") ? 2 : 1);
             
             if (dir === 2) {
                 testAndApplyInstantMove(face, 1);
                 testAndApplyInstantMove(face, 1);
             } else {
                 testAndApplyInstantMove(face, dir);
             }
           });
        });
      }
    };
    window.addEventListener('reset-cube-data-solved', handleResetAll);

    // 4. TICK RENDER LOOP (Sem bugs e rotação matemática em tempo real)
    const tempQuat = new THREE.Quaternion();
    let tickId: number;
    let lastTime = performance.now();

    const tick = (time: number = performance.now()) => {
      tickId = requestAnimationFrame(tick);
      const dtMs = time - lastTime;
      const dt = dtMs > 0 ? dtMs / 1000 : 0.016;
      lastTime = time;
      const frameTimeRatio = dt / 0.016666;
      const state = stateRef.current;
      const activeTextTab = state.selectedSkin;

      // Movimentação orbital suave da camera
      if (cameraRef.current) {
        const radius = state.viewMode === 'closeup' ? 8.5 : 20.0;
        const phi = THREE.MathUtils.degToRad(90 - state.rotateX);
        const theta = THREE.MathUtils.degToRad(state.rotateY);

        cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cameraRef.current.position.y = radius * Math.cos(phi);
        cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);

        if (state.viewMode === 'closeup') {
          cameraRef.current.lookAt(1.15, 1.15, 1.15); // foca no canto up-front-right
        } else {
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      // 4A. ESTADO COGNITIVO DO GIRO MECÂNICO 3D EM DETALHES
      let currentMove = activeMoveState.current;
      if (!currentMove && commandQueue.current.length > 0) {
        const next = commandQueue.current.shift()!;
        currentMove = {
          face: next.face,
          dir: next.dir,
          angle: 0,
          speed: (Math.PI / 2) / (state.turnSpeed * 60) // radianos por frame (assumindo 60Hz)
        };
        activeMoveState.current = currentMove;
      }

      const spacingScale = 2.15 + (state.explodeDistance * 0.045);
      const capAddOffset = state.detachCaps * 0.0085;

      if (currentMove) {
        const target = -(Math.PI / 2) * currentMove.dir;
        currentMove.angle += Math.sign(target) * currentMove.speed * frameTimeRatio;

        const isFinished = Math.abs(currentMove.angle) >= Math.abs(target);
        const applyAngle = isFinished ? target : currentMove.angle;

        const activeFaceData = faceAxes[currentMove.face];
        
        if (!activeFaceData) {
            // Invalid move, clear from queue instantly to prevent crash/freeze
            activeMoveState.current = null;
        } else {
          cubiesRef.current.forEach(c => {
            const testBelongs = activeFaceData.test(c.basePos);
            if (testBelongs) {
              // Rotacionar radialmente a posição do cubie
              const animPos = c.basePos.clone().applyAxisAngle(activeFaceData.axis, applyAngle);
              c.meshGroup.position.set(animPos.x * spacingScale, animPos.y * spacingScale, animPos.z * spacingScale);

              // Quaternion de orientação para as capas coloridas acompanharem o giro perfeitamente
              tempQuat.setFromAxisAngle(activeFaceData.axis, applyAngle);
              c.meshGroup.quaternion.copy(tempQuat).multiply(c.baseQuat);
            } else {
              // Estático
              c.meshGroup.position.set(c.basePos.x * spacingScale, c.basePos.y * spacingScale, c.basePos.z * spacingScale);
              c.meshGroup.quaternion.copy(c.baseQuat);
            }
          });

          // Completou movimento: física permanente gravada
          if (isFinished) {
            cubiesRef.current.forEach(c => {
              if (activeFaceData.test(c.basePos)) {
                // Atualiza o vetor de coordenadas do grid e limpa fracionários
                c.basePos.applyAxisAngle(activeFaceData.axis, target);
                c.basePos.set(Math.round(c.basePos.x), Math.round(c.basePos.y), Math.round(c.basePos.z));

                // Atualiza quat permanente
                tempQuat.setFromAxisAngle(activeFaceData.axis, target);
                c.baseQuat.premultiply(tempQuat);
              }
            });
            if (onMoveFinished) {
              onMoveFinished({ face: currentMove.face, dir: currentMove.dir });
            }
            activeMoveState.current = null;
          }
        }
      } else {
        // Nenhuma animação rodando: apenas posiciona no grid escalado pelo slider de explosão
        cubiesRef.current.forEach(c => {
          c.meshGroup.position.set(c.basePos.x * spacingScale, c.basePos.y * spacingScale, c.basePos.z * spacingScale);
          c.meshGroup.quaternion.copy(c.baseQuat);
        });
      }

      // 4B. SLIDER DE AFUNDAMENTO E DESTACAMENTO DE CAPS & SLOTS DINAMICAMENTE
      cubiesRef.current.forEach(c => {
        c.meshGroup.children.forEach(meshChild => {
          // Identificar se o objeto é um Color Cap para aplicar offset extra de slots
          if (meshChild.userData && meshChild.userData.isColorCap) {
            const norm = meshChild.userData.faceNormal as THREE.Vector3;
            // Desloca o Cap para longe baseado no detachCaps
            const distance = meshChild.userData.baseDistance + capAddOffset;
            meshChild.position.copy(norm).multiplyScalar(distance);

            // Se forcloseup e detachCaps > 0, os pinos de encaixe do slot (locking clips) masculinos ficam visíveis!
            if (meshChild.userData.clipsGroup) {
              const clips = meshChild.userData.clipsGroup as THREE.Group;
              // Os clipes acompanham o deslocamento, mas estendem de volta até o corpo preto
              clips.position.copy(norm).multiplyScalar(-capAddOffset);
              clips.visible = state.detachCaps > 2;
            }
          }
        });
      });

      // 4C. FORÇA MAGNÉTICA (Forças lineares brilhantes) E MOLAS CORE MAGLEV
      if (mainGroupRef.current) {
        mainGroupRef.current.children.forEach(child => {
          if (child.name === 'forceFieldLine') {
            child.visible = state.showForceFields;
            if (child.visible) {
              const lineMat = (child as any).material;
              if (lineMat && 'dashOffset' in lineMat) {
                lineMat.dashOffset -= 0.04;
              }
            }
          }
          // Compressão física representativa da mola helicoidal baseada na tensão
          if (child.userData && child.userData.isCoreGroup) {
            child.userData.springsList?.forEach((springMesh: THREE.Mesh) => {
              const compression = 1.0 - (state.springTension - 1) * 0.12;
              springMesh.scale.set(1.0, compression, 1.0);
            });
          }
        });
      }

      rendererRef.current?.render(scene, cameraRef.current!);
    };

    tick();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(tickId);
      window.removeEventListener('reset-cube-data-solved', handleResetAll);
      cleanThreeScene();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (mountRef.current && rendererRef.current) {
         // Optionally remove the canvas child if still there
         try { mountRef.current.removeChild(rendererRef.current.domElement); } catch (e) {}
      }
    };
  }, []);

  // Recriar estrutura geométrica ao mudar estúdio/tema/arredondamento/slots
  useEffect(() => {
    rebuildEverything(true);
  }, [selectedStudio, selectedSkin, selectedTheme, selectedCore, coreShape, centerCapRadius, edgeCapRadius, cornerCapRadius, outerCapRadius, centerBodySize, coreThickness, coreLength, seamLinesWidth, capThickness, viewMode, focusCase, useStealthFocus]);

  const rebuildEverything = (preservePose = false) => {
    const scene = sceneRef.current;
    const mainGroup = mainGroupRef.current;
    if (!scene || !mainGroup) return;

    const preservedPoseById = preservePose
      ? new Map<string, { basePos: THREE.Vector3, baseQuat: THREE.Quaternion }>(cubiesRef.current.map(c => [
          `${c.meshGroup.userData.origX},${c.meshGroup.userData.origY},${c.meshGroup.userData.origZ}`,
          { basePos: c.basePos.clone(), baseQuat: c.baseQuat.clone() },
        ]))
      : null;

    // 1. LIMPEZA SEGURA E DIRECIONADA DE RECURSOS (Evitar memory leaks e silent WebGL failures)
    const objsToRemove: THREE.Object3D[] = [];
    scene.children.forEach(child => {
      if (child !== mainGroup) {
        objsToRemove.push(child);
      }
    });

    objsToRemove.forEach(obj => {
      obj.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
          else child.material.dispose();
        }
      });
      scene.remove(obj);
    });

    mainGroup.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
        else child.material.dispose();
      }
    });
    mainGroup.clear();

    cubiesRef.current = [];

    const activeStudio = STUDIO_PRESETS.find(s => s.id === selectedStudio) || STUDIO_PRESETS[0];
    const activeTheme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];
    const activeCore = CORE_MATERIALS.find(c => c.id === selectedCore) || CORE_MATERIALS[0];

    // 1. ADICIONAR LUZES DE ATOMIZAÇÃO FOTORREALISTAS (Soft Key / Rim dourada)
    scene.children.slice().forEach(c => {
      if (c instanceof THREE.Light) scene.remove(c);
    });

    const ambientLight = new THREE.AmbientLight(activeStudio.ambientColor, activeStudio.ambientIntensity);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(activeStudio.keyColor, activeStudio.keyIntensity);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(activeStudio.fillColor, activeStudio.fillIntensity);
    fillLight.position.set(-12, 5, 8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(activeStudio.rimColor, activeStudio.rimIntensity);
    rimLight.position.set(-8, 8, -12);
    scene.add(rimLight);

    // 2. TEXTURAS DE MICRO-RELIEF PROCEDURAIS HEXAGONAL (Favos de Mel)
    let honeyBump: THREE.Texture | null = null;
    let carbonBump: THREE.Texture | null = null;

    const cv = document.createElement('canvas');
    cv.width = 128; cv.height = 128;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.8;
    
    const drawHex = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(cx + r, cy);
      for (let s = 1; s <= 6; s++) {
        ctx.lineTo(cx + r * Math.cos(s*Math.PI/3), cy + r * Math.sin(s*Math.PI/3));
      }
      ctx.closePath(); ctx.stroke();
    };
    for (let y = -20; y < 150; y += 22) {
      for (let x = -20; x < 150; x += 13 * 3) {
        drawHex(x, y, 13);
        drawHex(x + 13 * 1.5, y + 11, 13);
      }
    }
    honeyBump = new THREE.CanvasTexture(cv);
    honeyBump.wrapS = THREE.RepeatWrapping; honeyBump.wrapT = THREE.RepeatWrapping;
    honeyBump.repeat.set(5, 5);

    if (selectedSkin === 'carbon-fighter') {
      const cv = document.createElement('canvas');
      cv.width = 64; cv.height = 64;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#606060'; ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#b0b0b0';
      for (let i = 0; i < 64; i += 8) {
        for (let j = 0; j < 64; j += 8) {
          if ((i + j) % 16 === 0) ctx.fillRect(i, j, 4, 8);
          else ctx.fillRect(i + 4, j, 4, 8);
        }
      }
      carbonBump = new THREE.CanvasTexture(cv);
      carbonBump.wrapS = THREE.RepeatWrapping; carbonBump.wrapT = THREE.RepeatWrapping;
      carbonBump.repeat.set(12, 12);
    }

    // Desenhar Logo GAN (Colocado centralizado no Cap Branco)
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 512; logoCanvas.height = 512;
    const lCtx = logoCanvas.getContext('2d')!;
    lCtx.fillStyle = '#ffffff'; lCtx.fillRect(0, 0, 512, 512);

    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const img = new Image();
    img.src = '/logo-gan.svg';
    img.onload = () => {
      lCtx.fillStyle = '#ffffff'; 
      lCtx.fillRect(0, 0, 512, 512);
      // Scale down image to have padding
      lCtx.drawImage(img, 96, 96, 320, 320);
      logoTexture.needsUpdate = true;
    };

    // 3. SHADERS FÍSICOS REAIS (MeshPhysicalMaterial)
    const isGloss = selectedSkin === 'glossy-stickerless';
    const isMatte = selectedSkin === 'frost-satin';

    // Corpo preto com relevo alveolar de fricção (mecanismo interno Black Premium de escorregamento)
    const innerBodyMaterial = new THREE.MeshPhysicalMaterial({
      color: useStealthFocus ? 0x0C0D0F : activeTheme.colors.inner,
      roughness: isMatte ? 0.6 : 0.4,
      metalness: (selectedTheme === 'stealth-carbon' || useStealthFocus) ? 0.3 : 0.05,
      bumpMap: honeyBump,
      bumpScale: 0.04, // Elevado para realismo mecânico interno
      roughnessMap: honeyBump,
      transmission: (!useStealthFocus && activeTheme.id === 'primary-esmerald') ? 0.35 : 0.0,
      thickness: (!useStealthFocus && activeTheme.id === 'primary-esmerald') ? 0.4 : 0.0
    });

    // Material de Neodímio Chrome N52 brilhante (Solid Metal Capsules)
    const neodymiumMetalMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc, metalness: 1.0, roughness: 0.12
    });

    // Acrílico translúcido ultra-refreativo cristalino transparente (Cápsulas e core)
    const transparentPolycarbonateMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85, transmission: 0.94, ior: 1.54, roughness: 0.1, thickness: 0.8
    });

    // Material dos Caps externos. Evita stretching usando Arrays de Materiais!
    const buildCapMesh = (color: number, norm: THREE.Vector3, isWhiteMap = false, pieceType: 'center' | 'edge' | 'corner' = 'corner', cr: {x:number, y:number, z:number}) => {
      let finalColor = color;
      let isPieceActive = true;

      if (useStealthFocus && focusCase === 'none') {
        isPieceActive = false;
      } else if (focusCase === 'f2l') {
        if (cr.y === 1) {
          isPieceActive = false;
        }
      } else if (focusCase === 'oll') {
        if (cr.y !== 1) {
          isPieceActive = false;
        } else {
          if (color !== activeTheme.colors.U) {
            isPieceActive = false;
          }
        }
      } else if (focusCase === 'pll') {
        if (cr.y !== 1) {
          isPieceActive = false;
        }
      }

      if (!isPieceActive) {
        if (norm.y > 0.5) finalColor = 0x2A2E35;
        else if (norm.y < -0.5) finalColor = 0x20242A;
        else if (norm.x > 0.5) finalColor = 0x1A1D21;
        else if (norm.x < -0.5) finalColor = 0x282C32;
        else if (norm.z > 0.5) finalColor = 0x1C1F24;
        else if (norm.z < -0.5) finalColor = 0x22262C;
      }

      const mappedSeamWidth = (seamLinesWidth / 100) * 4.0; // 0 a 4mm
      const extrudeWidth = 1.95 - (mappedSeamWidth * 0.1);
      
      const getR = (val: number) => Math.min((val / 100) * (extrudeWidth/2), (extrudeWidth/2) - 0.01);

      let rTR, rTL, rBL, rBR;

      if (pieceType === 'center') {
        const r = getR(centerCapRadius);
        rTR = r; rTL = r; rBL = r; rBR = r;
      } else {
        const diff = norm.clone().sub(new THREE.Vector3(cr.x, cr.y, cr.z));
        const qInv = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), norm).invert();
        const localDiff = diff.clone().applyQuaternion(qInv);
        const lX = Math.round(localDiff.x);
        const lY = Math.round(localDiff.y);

        const dotTR = 1*lX + 1*lY;
        const dotTL = -1*lX + 1*lY;
        const dotBL = -1*lX + -1*lY;
        const dotBR = 1*lX + -1*lY;

        const innerRadius = pieceType === 'edge' ? getR(edgeCapRadius) : getR(cornerCapRadius);
        const outerRadius = getR(outerCapRadius);

        rTR = dotTR > 0.5 ? innerRadius : outerRadius;
        rTL = dotTL > 0.5 ? innerRadius : outerRadius;
        rBL = dotBL > 0.5 ? innerRadius : outerRadius;
        rBR = dotBR > 0.5 ? innerRadius : outerRadius;
      }

      const right = extrudeWidth/2;
      const left = -extrudeWidth/2;
      const top = extrudeWidth/2;
      const bottom = -extrudeWidth/2;

      const path = new THREE.Shape();
      path.moveTo(left + rBL, bottom);
      path.lineTo(right - rBR, bottom);
      path.quadraticCurveTo(right, bottom, right, bottom + rBR);
      path.lineTo(right, top - rTR);
      path.quadraticCurveTo(right, top, right - rTR, top);
      path.lineTo(left + rTL, top);
      path.quadraticCurveTo(left, top, left, top - rTL);
      path.lineTo(left, bottom + rBL);
      path.quadraticCurveTo(left, bottom, left + rBL, bottom);

      const mappedThickness = 0.4 + (capThickness / 100) * 3.1;
      const depthVal = mappedThickness * 0.1;
      const capGeo = new THREE.ExtrudeGeometry(path, {
        depth: depthVal, bevelEnabled: true, bevelSegments: 8, steps: 1, bevelSize: 0.15, bevelThickness: 0.12
      });
      capGeo.center();

      // Normalize UVs for front face so logo renders correctly
      const pos = capGeo.attributes.position;
      const uv = capGeo.attributes.uv;
      if (uv) {
        for (let i = 0; i < uv.count; i++) {
          const u = uv.getX(i);
          const v = uv.getY(i);
          uv.setXY(i, (u + extrudeWidth/2) / extrudeWidth, (v + extrudeWidth/2) / extrudeWidth);
        }
      }

      // DUPLO SÃO DO MATERIAL PREVINE BUGS DE TEXTURA ESTRECHADA NAS ABAS!
      // Group 0 do Extrude correspondente a face chata | Group 1 correspondente ao Bevel das bordas.
      const useLogo = isWhiteMap && activeTheme.id !== 'stealth-carbon' && isPieceActive;
      
      const flatMat = new THREE.MeshPhysicalMaterial({
        color: finalColor,
        map: useLogo ? logoTexture : null,
        roughness: isMatte ? 0.5 : 0.08,
        clearcoat: isGloss ? 1.0 : 0.0,
        bumpMap: selectedSkin === 'carbon-fighter' ? carbonBump : null,
        bumpScale: 0.015
      });

      const bevelMat = new THREE.MeshPhysicalMaterial({
        color: finalColor, 
        roughness: isMatte ? 0.5 : 0.08,
        clearcoat: isGloss ? 1.0 : 0.0
      });

      const mesh = new THREE.Mesh(capGeo, [flatMat, bevelMat]);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm);
      
      const mappedSeamWidthForBox = (seamLinesWidth / 100) * 4.0;
      const boxHalf = (1.95 - (mappedSeamWidthForBox * 0.125)) / 2;
      const baseDist = boxHalf + (depthVal / 2) + 0.08;
      mesh.userData = { isColorCap: true, faceNormal: norm, baseDistance: baseDist };

      // Criar clips masculinos sob o Cap se detachCaps > 0 (Destaques de Encaixe real de fotos!)
      const clipsGroup = new THREE.Group();
      const prongGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8);
      // Quatro hastes redondas nas extremidades internas do cap que se acoplam nos slots cilíndricos fêmea do corpo
      const clipOffsets = [
        { cx: 0.45, cy: 0.45 }, { cx: -0.45, cy: 0.45 },
        { cx: 0.45, cy: -0.45 }, { cx: -0.45, cy: -0.45 }
      ];
      clipOffsets.forEach(co => {
        const p = new THREE.Mesh(prongGeo, new THREE.MeshStandardMaterial({ color: activeTheme.colors.inner, roughness: 0.4 }));
        p.position.set(co.cx, co.cy, -(depthVal/2 + 0.08 + 0.175));
        p.rotation.set(Math.PI/2, 0, 0);
        clipsGroup.add(p);
      });
      mesh.add(clipsGroup);
      mesh.userData.clipsGroup = clipsGroup;

      return mesh;
    };

    // 4. POSICIONAMENTO DAS 26 PEÇAS (CUBIES)
    const coords: {x:number, y:number, z:number}[] = [];
    for (let cx=-1; cx<=1; cx++) {
      for (let cy=-1; cy<=1; cy++) {
        for (let cz=-1; cz<=1; cz++) {
          if (cx===0 && cy===0 && cz===0) continue;
          coords.push({x: cx, y: cy, z: cz});
        }
      }
    }

    let renderList = coords;
    if (viewMode === 'closeup') {
      // Isolar um canto Up-Front-Right (+1, +1, +1) e bordo (+1, 0, +1) para detalhamento macro
      renderList = [
        { x: 1, y: 1, z: 1 },
        { x: 1, y: 0, z: 1 }
      ];
    }

    renderList.forEach((cr, index) => {
      const g = new THREE.Group();
      g.userData = { origX: cr.x, origY: cr.y, origZ: cr.z };
      
      const absSum = Math.abs(cr.x) + Math.abs(cr.y) + Math.abs(cr.z);
      const isCen = absSum === 1;
      const isEdge = absSum === 2;
      const isCor = absSum === 3;

      // Apenas corpo de plástico inicial
      const mappedSeamsForBox = (seamLinesWidth / 100) * 4.0;
      const bSize = 1.95 - (mappedSeamsForBox * 0.125);
      
      let baseBody = new THREE.Group();
      
      // Material de plástico liso suave para as entranhas e hastes (sem a textura de honeycomb)
      const smoothBodyMat = new THREE.MeshPhysicalMaterial({
        color: useStealthFocus ? 0x0C0D0F : activeTheme.colors.inner,
        roughness: isMatte ? 0.3 : 0.1,
        metalness: (selectedTheme === 'stealth-carbon' || useStealthFocus) ? 0.4 : 0.1,
        transmission: (!useStealthFocus && activeTheme.id === 'primary-esmerald') ? 0.35 : 0.0,
        thickness: (!useStealthFocus && activeTheme.id === 'primary-esmerald') ? 0.4 : 0.0,
        clearcoat: 0.2
      });

      if (isCen) {
        const cSize = bSize * (centerBodySize / 100);
        
        // Forma de copo oco: Base cylinder with a hole inside
        const cupShape = new THREE.Shape();
        cupShape.absarc(0, 0, cSize/2, 0, Math.PI * 2, false);
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, cSize/2 - 0.15, 0, Math.PI * 2, false);
        cupShape.holes.push(holePath);

        const extrudeSettings = { depth: bSize - 0.2, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.05, bevelThickness: 0.05, curveSegments: 32 };
        const cupGeo = new THREE.ExtrudeGeometry(cupShape, extrudeSettings);
        cupGeo.rotateX(Math.PI/2);
        cupGeo.translate(0, bSize/2 - 0.1, 0);

        const mCup = new THREE.Mesh(cupGeo, innerBodyMaterial); // com textura
        
        // Base plate closing the top (closest to colored cap)
        const basePlateGeo = new THREE.CylinderGeometry(cSize/2, cSize/2, 0.2, 32);
        basePlateGeo.translate(0, bSize/2 - 0.1, 0);
        const mPlate = new THREE.Mesh(basePlateGeo, smoothBodyMat);
        
        baseBody.add(mCup, mPlate);

        // Maglev Rings inside the cup
        if (showInternalCore) {
          // Bottom ring
          const magRingGeo = new THREE.TorusGeometry(0.24, 0.08, 16, 32);
          magRingGeo.rotateX(Math.PI/2);
          magRingGeo.translate(0, 0.2, 0);
          const bottomRing = new THREE.Mesh(magRingGeo, neodymiumMetalMat);

          // Top ring (repelling)
          const topRingGeo = new THREE.TorusGeometry(0.24, 0.08, 16, 32);
          topRingGeo.rotateX(Math.PI/2);
          topRingGeo.translate(0, 0.45, 0);
          const topRing = new THREE.Mesh(topRingGeo, neodymiumMetalMat);

          // Numerical Tuning Wheel (White Plastic Gear)
          const wheelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
          const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.15, 32);
          wheelGeo.translate(0, 0.45, 0);
          const mWheel = new THREE.Mesh(wheelGeo, wheelMat);
          
          // Gear teeth (dentições para cliques)
          for (let t = 0; t < 12; t++) {
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.15), wheelMat);
            tooth.position.set(Math.cos(t * Math.PI/6) * 0.42, 0.45, Math.sin(t * Math.PI/6) * 0.42);
            tooth.rotation.y = -(t * Math.PI/6);
            baseBody.add(tooth);
          }

          baseBody.add(bottomRing, topRing, mWheel);
        }

        if (cr.x === 1) baseBody.rotation.z = -Math.PI/2;
        if (cr.x === -1) baseBody.rotation.z = Math.PI/2;
        if (cr.z === 1) baseBody.rotation.x = Math.PI/2;
        if (cr.z === -1) baseBody.rotation.x = -Math.PI/2;
        if (cr.y === -1) baseBody.rotation.x = Math.PI;
      } else if (isEdge) {
        // Build edge piece structure
        const eGroup = new THREE.Group();
        
        // Edge main block (outer surface with honeycomb)
        const eBox = new THREE.Mesh(new RoundedBoxGeometry(bSize, bSize, bSize, 6, 0.15), innerBodyMaterial);
        eGroup.add(eBox);

        // Core Torpedo mechanism (the anchor pointing to center)
        const torpDir = new THREE.Vector3(-cr.x, -cr.y, -cr.z).normalize();
        const torpGroup = new THREE.Group();
        
        // "Pointed clasps" structure for edge (tapered wedge/torpedo combo)
        // Flared wide base turning into a torpedo
        const torpBaseGeo = new THREE.CylinderGeometry(0.5, 0.25, 0.9, 16);
        torpBaseGeo.translate(0, 0.45, 0);
        const mBase = new THREE.Mesh(torpBaseGeo, smoothBodyMat);

        const torpGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.9, 16);
        torpGeo.translate(0, 1.25, 0);
        const mTorp = new THREE.Mesh(torpGeo, smoothBodyMat);

        // A ring/clasp detail at the tip
        const torpRingGeo = new THREE.TorusGeometry(0.24, 0.08, 16, 32);
        torpRingGeo.rotateX(Math.PI/2);
        torpRingGeo.translate(0, 1.5, 0);
        const mRing = new THREE.Mesh(torpRingGeo, smoothBodyMat);

        torpGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), torpDir);
        torpGroup.add(mBase, mTorp, mRing);
        eGroup.add(torpGroup);

        // Edge-Corner Magnets embutidos nas laterais da face
        ['x', 'y', 'z'].forEach((axis) => {
          if (cr[axis as keyof typeof cr] === 0) {
            [1, -1].forEach(sign => {
              // HUGE magnets! (~25% da area)
              const tempGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 24);
              if (axis === 'x') tempGeo.rotateZ(Math.PI/2);
              if (axis === 'z') tempGeo.rotateX(Math.PI/2);
              const mC = new THREE.Mesh(tempGeo, transparentPolycarbonateMat);

              const mNeoGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.105, 24);
              if (axis === 'x') mNeoGeo.rotateZ(Math.PI/2);
              if (axis === 'z') mNeoGeo.rotateX(Math.PI/2);
              const mNeo = new THREE.Mesh(mNeoGeo, neodymiumMetalMat);

              const dist = bSize / 2;
              const pos = new THREE.Vector3();
              pos[axis as 'x'|'y'|'z'] = sign * dist;
              
              mC.position.copy(pos);
              mNeo.position.copy(pos);
              eGroup.add(mC, mNeo);
            });
          }
        });

        baseBody.add(eGroup);

      } else { // isCor
        const cGroup = new THREE.Group();
        
        // Corner main block
        const cBox = new THREE.Mesh(new RoundedBoxGeometry(bSize, bSize, bSize, 6, 0.15), innerBodyMaterial);
        cGroup.add(cBox);

        // Corner stalk to magnetic core
        const coreDir = new THREE.Vector3(-cr.x, -cr.y, -cr.z).normalize();
        
        const stalkGroup = new THREE.Group();
        
        // Base preta grossa conectada ao canto
        const cupGeo = new THREE.CylinderGeometry(0.26, 0.38, 0.45, 32);
        cupGeo.translate(0, 0.725, 0);
        const cupMesh = new THREE.Mesh(cupGeo, smoothBodyMat);

        // Umbrella/Shield Preta com 4 furos arredondados
        const skirtShape = new THREE.Shape();
        skirtShape.absarc(0, 0, 0.75, 0, Math.PI * 2, false);
        for(let i=0; i<4; i++) {
          const hole = new THREE.Path();
          const cx = Math.cos(i * Math.PI/2) * 0.40;
          const cy = Math.sin(i * Math.PI/2) * 0.40;
          hole.absarc(cx, cy, 0.18, 0, Math.PI * 2, false);
          skirtShape.holes.push(hole);
        }
        const skirtGeo = new THREE.ExtrudeGeometry(skirtShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.03, bevelThickness: 0.03, curveSegments: 32 });
        skirtGeo.rotateX(Math.PI/2);
        
        // Deforma o disco plano em uma curva/copo parabólico simulando um escudo
        const posAttr = skirtGeo.attributes.position;
        for(let i=0; i<posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vz = posAttr.getZ(i);
          const r0 = Math.sqrt(vx*vx + vz*vz);
          // curvar em direção ao bloco de quina
          posAttr.setY(i, posAttr.getY(i) - (r0 * r0 * 0.6)); 
        }
        skirtGeo.computeVertexNormals();
        skirtGeo.translate(0, 1.05, 0);
        const skirtMesh = new THREE.Mesh(skirtGeo, smoothBodyMat);

        // Haste Branca (Nylon) e Ponteira formato pílula
        const whiteNylonMat = new THREE.MeshStandardMaterial({
          color: 0xfcfcfc, roughness: 0.25, metalness: 0.05
        });
        
        const stalkGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 24);
        stalkGeo.translate(0, 1.25, 0); 
        const stalkMesh = new THREE.Mesh(stalkGeo, whiteNylonMat);

        // A ponteira esférica tipo pílula do ímã (Capsule ou pílula composta)
        const footGeo = new THREE.CapsuleGeometry(0.24, 0.25, 16, 24); // radius, length
        footGeo.translate(0, 1.7, 0);
        const footMesh = new THREE.Mesh(footGeo, whiteNylonMat);

        stalkGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), coreDir);
        stalkGroup.add(cupMesh, skirtMesh, stalkMesh, footMesh);
        
        // Fluxo Magnético Visual (Linhas de campo energético ao Omni-Core)
        if (showForceFields) {
          const lGeo = new THREE.BufferGeometry().setFromPoints([
             new THREE.Vector3(0, 2.0, 0),
             new THREE.Vector3(0, 3.8, 0)
          ]);
          const forceLine = new THREE.LineSegments(lGeo, new THREE.LineDashedMaterial({
            color: 0x0ea5e9, dashSize: 0.15, gapSize: 0.14, linewidth: 2.0
          }));
          forceLine.computeLineDistances();
          forceLine.name = 'forceFieldLine';
          stalkGroup.add(forceLine);
        }

        cGroup.add(stalkGroup);

        // Corner Edge-Corner Magnets! Nas 3 faces internas do bloco.
        ['x', 'y', 'z'].forEach((axis) => {
          const sign = -cr[axis as keyof typeof cr];
          
          // Anel externo prateado
          const ringGeo = new THREE.TorusGeometry(0.33, 0.05, 16, 32);
          if (axis === 'x') ringGeo.rotateY(Math.PI/2);
          if (axis === 'y') ringGeo.rotateX(Math.PI/2);
          // z não precisa rotacionar (já está no XY)
          const mRing = new THREE.Mesh(ringGeo, neodymiumMetalMat);

          // Ímã central plano
          const mNeoGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 24);
          if (axis === 'x') mNeoGeo.rotateZ(Math.PI/2);
          if (axis === 'z') mNeoGeo.rotateX(Math.PI/2);
          const mNeo = new THREE.Mesh(mNeoGeo, neodymiumMetalMat);

          const dist = bSize / 2 - 0.03; // slightly inside the face
          const pos = new THREE.Vector3();
          pos[axis as 'x'|'y'|'z'] = sign * dist;
          
          mRing.position.copy(pos);
          mNeo.position.copy(pos);
          cGroup.add(mRing, mNeo);
        });

        baseBody.add(cGroup);
      }
      g.add(baseBody);

      // slots das cavidades fêmeas no bloco preto (4 depressões cilíndricas) onde os pinos clicam
      const slotsGroup = new THREE.Group();
      if (!isCen) {
        const holeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 8);
      const holeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
      const faceDirections = [
        { norm: new THREE.Vector3(0,1,0), rot: new THREE.Vector3(Math.PI/2,0,0) },
        { norm: new THREE.Vector3(0,-1,0), rot: new THREE.Vector3(Math.PI/2,0,0) },
        { norm: new THREE.Vector3(1,0,0), rot: new THREE.Vector3(0,Math.PI/2,0) },
        { norm: new THREE.Vector3(-1,0,0), rot: new THREE.Vector3(0,Math.PI/2,0) },
        { norm: new THREE.Vector3(0,0,1), rot: new THREE.Vector3(0,0,0) },
        { norm: new THREE.Vector3(0,0,-1), rot: new THREE.Vector3(0,0,0) }
      ];

      faceDirections.forEach(fd => {
        // Encaixa 4 furos simétricos de slot nas faces visíveis
        const offsets = [{dx:0.45, dy:0.45},{dx:-0.45, dy:0.45},{dx:0.45, dy:-0.45},{dx:-0.45, dy:-0.45}];
        offsets.forEach(off => {
          const hMesh = new THREE.Mesh(holeGeo, holeMat);
          hMesh.position.copy(fd.norm).multiplyScalar(0.89);
          if (fd.norm.y !== 0) hMesh.position.add(new THREE.Vector3(off.dx, 0, off.dy));
          else if (fd.norm.x !== 0) hMesh.position.add(new THREE.Vector3(0, off.dx, off.dy));
          else hMesh.position.add(new THREE.Vector3(off.dx, off.dy, 0));
          hMesh.rotation.set(fd.rot.x, fd.rot.y, fd.rot.z);
          slotsGroup.add(hMesh);
        });
      });
      g.add(slotsGroup);
      }

      // Tampas com os caps coloridos
      let pieceType: 'center' | 'edge' | 'corner' = 'corner';
      if (isCen) pieceType = 'center';
      else if (isEdge) pieceType = 'edge';
      
      if (cr.y === 1) g.add(buildCapMesh(activeTheme.colors.U, new THREE.Vector3(0,1,0), false, pieceType, cr));
      if (cr.y === -1) g.add(buildCapMesh(activeTheme.colors.D, new THREE.Vector3(0,-1,0), cr.x === 0 && cr.z === 0, pieceType, cr));
      if (cr.x === 1) g.add(buildCapMesh(activeTheme.colors.R, new THREE.Vector3(1,0,0), false, pieceType, cr));
      if (cr.x === -1) g.add(buildCapMesh(activeTheme.colors.L, new THREE.Vector3(-1,0,0), false, pieceType, cr));
      if (cr.z === 1) g.add(buildCapMesh(activeTheme.colors.F, new THREE.Vector3(0,0,1), false, pieceType, cr));
      if (cr.z === -1) g.add(buildCapMesh(activeTheme.colors.B, new THREE.Vector3(0,0,-1), false, pieceType, cr));

      // Se for centro, renderiza o parafuso sob o cap!
      if (isCen && showInternalCore) {
        const faceAxisVector = new THREE.Vector3(cr.x, cr.y, cr.z);
        // Cabeça do parafuso Phillips em aço no meio da regulagem de comutação
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 16), neodymiumMetalMat);
        screw.position.copy(faceAxisVector).multiplyScalar(0.75);
        screw.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), faceAxisVector);
        g.add(screw);
      }

      cubiesRef.current.push({
        id: index,
        basePos: new THREE.Vector3(cr.x, cr.y, cr.z),
        baseQuat: new THREE.Quaternion(),
        meshGroup: g,
        isCorner: isCor,
        isEdge: Math.abs(cr.x) + Math.abs(cr.y) + Math.abs(cr.z) === 2,
        isCenter: isCen,
      });
      mainGroup.add(g);
    });

    // 5. NÚCLEO TRANSPARENTE ESFÉRICO DE LEVITAÇÃO MAGLEV (CORAÇÃO DO V100)
    if (showInternalCore) {
      const coreGroup = new THREE.Group();
      coreGroup.name = 'omniStarCore';
      coreGroup.userData = { isCoreGroup: true };
      mainGroup.add(coreGroup);

      const coreT = coreThickness / 100;
      const coreL = coreLength / 100;

      // Hub Esférico Central de Polycarbonate translúcido refletivo
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: activeCore.id === 'frosted-nylon' ? 0xffffff : activeCore.color,
        transmission: activeCore.id === 'frosted-nylon' ? 0.95 : 0.0,
        opacity: activeCore.id === 'frosted-nylon' ? 0.9 : 1.0,
        transparent: true, roughness: 0.15, metalness: activeCore.id === 'titanium-gold' ? 0.9 : 0.15
      });
      
      const pSpringMat = new THREE.MeshStandardMaterial({
        color: activeCore.id === 'titanium-gold' ? 0xffca28 : 0xd8d8d8,
        metalness: 0.95, roughness: 0.15
      });

      const springsList: THREE.Mesh[] = [];

      if (coreShape === 'standard') {
        const starSphere = new THREE.Mesh(new THREE.SphereGeometry(0.9 * coreT, 24, 24), sphereMat);
        coreGroup.add(starSphere);

        // Eixos do Omni-Core direcionados nas 6 frentes com molas helicoidais reguláveis
        const rods = [
          new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
          new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
          new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
        ];

        const shaftGeo = new THREE.CylinderGeometry(0.1 * coreT, 0.1 * coreT, 1.8 * coreL, 16);

        rods.forEach((dir, rIdx) => {
          if (viewMode === 'closeup' && rIdx > 2) return; // oculta eixos não incidentes secloseup macro

          const armGroup = new THREE.Group();
          // Deita o grupo no vetor ideal do eixo
          armGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          coreGroup.add(armGroup);

          // Haste de metal do eixo
          const metalShaft = new THREE.Mesh(shaftGeo, sphereMat);
          metalShaft.position.set(0, 0.9 * coreL, 0);
          armGroup.add(metalShaft);

          // Mola helicoidal em volta da haste
          const sprCurve = new HelixCurve(0.23 * coreT, 1.25 * coreL, 6);
          const sprGeo = new THREE.TubeGeometry(sprCurve, 42, 0.045 * coreT, 8, false);
          const sprMesh = new THREE.Mesh(sprGeo, pSpringMat);
          sprMesh.position.set(0, 0.9 * coreL, 0);
          sprMesh.rotation.set(Math.PI/2, 0, 0);
          armGroup.add(sprMesh);
          springsList.push(sprMesh); // guardada para compressão no loop frame

          // Ímã de núcleo (Chrome sphere do Omni-Magnetic layout de realismo magnético!)
          const magneticPin = new THREE.Mesh(new THREE.SphereGeometry(0.18 * coreT, 12, 12), neodymiumMetalMat);
          magneticPin.position.set(0, 1.15 * coreL, 0);
          armGroup.add(magneticPin);
        });
      } else if (coreShape === 'magnetic-ipg') {
        // NÚCLEO MAGNETIC IPG PRO (Estilo "Jack" de Policarbonato Transparente)
        const centerHub = new THREE.Mesh(new THREE.BoxGeometry(0.5 * coreT, 0.5 * coreT, 0.5 * coreT), transparentPolycarbonateMat);
        coreGroup.add(centerHub);

        // 6 Braços Principais (Cruz central)
        const mainDirs = [
          new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
          new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
          new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
        ];

        // Mastro cilíndrico ("agulha")
        const stemGeo = new THREE.CylinderGeometry(0.12 * coreT, 0.18 * coreT, 0.8 * coreL, 16);
        stemGeo.translate(0, 0.25 + (0.4 * coreL), 0); 
        
        // Ponteiras magnéticas na ponta dos mastros
        const tipMagGeo = new THREE.CylinderGeometry(0.12 * coreT, 0.12 * coreT, 0.15 * coreL, 16);
        tipMagGeo.translate(0, 0.25 + (0.8 * coreL), 0);

        mainDirs.forEach((dir, idx) => {
          if (viewMode === 'closeup' && idx > 2) return;
          const armGroup = new THREE.Group();
          armGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          
          const stem = new THREE.Mesh(stemGeo, transparentPolycarbonateMat);
          armGroup.add(stem);
          
          const tipMag = new THREE.Mesh(tipMagGeo, neodymiumMetalMat);
          armGroup.add(tipMag);

          coreGroup.add(armGroup);
        });

        // 8 Hastes Magnéticas Diagonais apontando para os cantos (Omnidirectional Magnet Feel)
        const diagDirs = [
          new THREE.Vector3(1,1,1), new THREE.Vector3(-1,1,1),
          new THREE.Vector3(1,-1,1), new THREE.Vector3(-1,-1,1),
          new THREE.Vector3(1,1,-1), new THREE.Vector3(-1,1,-1),
          new THREE.Vector3(1,-1,-1), new THREE.Vector3(-1,-1,-1)
        ].map(v => v.normalize());

        const diagStemGeo = new THREE.CylinderGeometry(0.10 * coreT, 0.14 * coreT, 0.45 * coreL, 16);
        diagStemGeo.translate(0, 0.2 + (0.22 * coreL), 0);
        const magGeo = new THREE.CylinderGeometry(0.13 * coreT, 0.13 * coreT, 0.10 * coreL, 16);
        magGeo.translate(0, 0.2 + (0.5 * coreL), 0);

        diagDirs.forEach(dir => {
          const diagGroup = new THREE.Group();
          diagGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          
          const diagStem = new THREE.Mesh(diagStemGeo, transparentPolycarbonateMat);
          diagGroup.add(diagStem);
          
          const mag = new THREE.Mesh(magGeo, neodymiumMetalMat);
          diagGroup.add(mag);
          
          coreGroup.add(diagGroup);
        });
      }

      coreGroup.userData.springsList = springsList;
    }

    // 6. PLANO SUAVE DE SOMBRAS (Ocluidor realista de chão renderizado)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShadowMaterial({ opacity: activeStudio.id === 'white-commercial' ? 0.15 : 0.55 })
    );
    floor.rotation.set(-Math.PI / 2, 0, 0);
    floor.position.set(0, -5.0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Cor do ambiente!
    scene.background = new THREE.Color(activeStudio.bg);

    if (preservedPoseById) {
      cubiesRef.current.forEach(c => {
        const pose = preservedPoseById.get(`${c.meshGroup.userData.origX},${c.meshGroup.userData.origY},${c.meshGroup.userData.origZ}`);
        if (!pose) return;
        c.basePos.copy(pose.basePos);
        c.baseQuat.copy(pose.baseQuat);
        const spacingScale = 2.15 + (explodeDistance * 0.045);
        c.meshGroup.position.set(c.basePos.x * spacingScale, c.basePos.y * spacingScale, c.basePos.z * spacingScale);
        c.meshGroup.quaternion.copy(c.baseQuat);
      });
    }
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full absolute inset-0 z-10 select-none outline-none overflow-hidden" 
    />
  );
};
