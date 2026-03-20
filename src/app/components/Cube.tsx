"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- 四元数数学工具类 ---
class Quaternion {
  constructor(public x: number, public y: number, public z: number, public w: number) {}

  static identity() { return new Quaternion(0, 0, 0, 1); }

  // 从旋转轴和角度创建四元数
  static fromAxisAngle(axis: {x: number, y: number, z: number}, angle: number) {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
  }

  // 四元数乘法 (q1 * q2)
  multiply(q: Quaternion) {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    );
  }

  // 归一化，防止浮点数精度丢失导致的变形
  normalize() {
    const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (len === 0) return Quaternion.identity();
    return new Quaternion(this.x / len, this.y / len, this.z / len, this.w / len);
  }

  // 转换为 CSS matrix3d 接受的 16 个值
  toMatrix4() {
    const { x, y, z, w } = this;
    return [
      1 - 2*y*y - 2*z*z, 2*x*y + 2*w*z,     2*x*z - 2*w*y,     0,
      2*x*y - 2*w*z,     1 - 2*x*x - 2*z*z, 2*y*z + 2*w*x,     0,
      2*x*z + 2*w*y,     2*y*z - 2*w*x,     1 - 2*x*x - 2*y*y, 0,
      0, 0, 0, 1
    ];
  }
}

interface RubiksCubeProps {
  baseSize?: number;
  speed?: number; 
}

const Cube: React.FC<RubiksCubeProps> = ({ 
  baseSize = 44, 
  speed = 220 
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [netColors, setNetColors] = useState<Record<string, string[]>>({});
  const [mounted, setMounted] = useState(false);
  
  const frontConRef = useRef<HTMLDivElement>(null);
  const backConRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  
  // 核心引用：存储每个 HTML 元素对应的当前四元数
  const quatMapRef = useRef<Map<HTMLDivElement, Quaternion>>(new Map());
  const cubiesRef = useRef<{ front: HTMLDivElement[], back: HTMLDivElement[] }>({ front: [], back: [] });

  const offset = baseSize + 2;

  useEffect(() => { setMounted(true); }, []);

  // 辅助函数：应用变换。先旋转，再平移到逻辑位置
  const applyTransform = (el: HTMLDivElement, q: Quaternion, lx: number, ly: number, lz: number) => {
    const m = q.normalize().toMatrix4();
    const matrix3d = `matrix3d(${m.join(',')})`;
    const translate = `translate3d(${lx * offset}px, ${ly * offset}px, ${lz * offset}px)`;
    // 注意：CSS transform 顺序是从右往左应用的
    // 我们希望方块先在原地旋转，然后移动到它所在的 grid 位置
    el.style.transform = `${translate} ${matrix3d}`;
  };

  const initCube = useCallback(() => {
    if (!frontConRef.current || !backConRef.current) return;
    [frontConRef.current, backConRef.current].forEach(el => el.innerHTML = '');
    cubiesRef.current = { front: [], back: [] };
    quatMapRef.current.clear();

    const faces = ['u', 'd', 'f', 'b', 'l', 'r'];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          [frontConRef.current, backConRef.current].forEach((container, i) => {
            const div = document.createElement('div');
            div.className = 'absolute transition-transform duration-0'; 
            div.style.cssText = `width:${baseSize}px; height:${baseSize}px; transform-style:preserve-3d; margin:-${baseSize/2}px;`;
            
            // 初始化逻辑坐标
            div.dataset.x = x.toString(); 
            div.dataset.y = y.toString(); 
            div.dataset.z = z.toString();
            
            // 初始化四元数
            const q = Quaternion.identity();
            quatMapRef.current.set(div, q);
            applyTransform(div, q, x, y, z);

            faces.forEach(f => {
              const face = document.createElement('div');
              const isOuter = (f === 'u' && y === -1) || (f === 'd' && y === 1) ||
                              (f === 'f' && z === -1) || (f === 'b' && z === 1) ||
                              (f === 'l' && x === -1) || (f === 'r' && x === 1);
              const faceColorMap: Record<string, string> = {
                'u': 'bg-white', 'd': 'bg-yellow-400', 'f': 'bg-red-600',
                'b': 'bg-orange-500', 'l': 'bg-green-600', 'r': 'bg-blue-600'
              };
              const colorClass = isOuter ? faceColorMap[f] : 'bg-[#111]';
              face.className = `absolute w-full h-full border border-black/30 dark:border-white/5 rounded-[4px] [backface-visibility:hidden] ${colorClass}`;
              
              let transform = "";
              const half = baseSize / 2;
              if(f==='u') transform = `rotateX(90deg) translateZ(${half}px)`;
              else if(f==='d') transform = `rotateX(-90deg) translateZ(${half}px)`;
              else if(f==='f') transform = `rotateY(180deg) translateZ(${half}px)`; // F面
              else if(f==='b') transform = `rotateY(0deg) translateZ(${half}px)`;   // B面
              else if(f==='l') transform = `rotateY(-90deg) translateZ(${half}px)`;
              else if(f==='r') transform = `rotateY(90deg) translateZ(${half}px)`;
              face.style.transform = transform;
              div.appendChild(face);
            });
            container?.appendChild(div);
            i === 0 ? cubiesRef.current.front.push(div) : cubiesRef.current.back.push(div);
          });
        }
      }
    }
    updateNetView();
  }, [baseSize, offset]);

  useEffect(() => { if(mounted) initCube(); }, [mounted, initCube]);

  // 更新2D状态图：通过计算后的完整矩阵判定朝向
  const updateNetView = useCallback(() => {
    const sides = [
      { id: 'U', filter: (c: any) => Math.round(parseFloat(c.dataset.y)) === -1, sort: (a: any, b: any) => a.dataset.z - b.dataset.z || a.dataset.x - b.dataset.x },
      { id: 'D', filter: (c: any) => Math.round(parseFloat(c.dataset.y)) === 1,  sort: (a: any, b: any) => b.dataset.z - a.dataset.z || a.dataset.x - b.dataset.x },
      { id: 'F', filter: (c: any) => Math.round(parseFloat(c.dataset.z)) === -1, sort: (a: any, b: any) => a.dataset.y - b.dataset.y || a.dataset.x - b.dataset.x },
      { id: 'B', filter: (c: any) => Math.round(parseFloat(c.dataset.z)) === 1,  sort: (a: any, b: any) => a.dataset.y - b.dataset.y || b.dataset.x - a.dataset.x },
      { id: 'L', filter: (c: any) => Math.round(parseFloat(c.dataset.x)) === -1, sort: (a: any, b: any) => a.dataset.y - b.dataset.y || a.dataset.z - b.dataset.z },
      { id: 'R', filter: (c: any) => Math.round(parseFloat(c.dataset.x)) === 1,  sort: (a: any, b: any) => a.dataset.y - b.dataset.y || b.dataset.z - a.dataset.z }
    ];
    const newNet: Record<string, string[]> = {};
    sides.forEach(s => {
      const faceCubies = [...cubiesRef.current.front].filter(s.filter).sort(s.sort);
      newNet[s.id] = faceCubies.map(c => {
        const faces = c.querySelectorAll('div');
        // 虽然内部用四元数，但判定颜色时读取 getComputedStyle 依然是最简便的方法
        const mC = new DOMMatrix(getComputedStyle(c).transform);
        for (let f of faces) {
          const mF = new DOMMatrix(getComputedStyle(f).transform);
          const combined = mC.multiply(mF);
          const isMatch = (s.id === 'U' && Math.round(combined.m32) === -1) ||
                          (s.id === 'D' && Math.round(combined.m32) === 1) ||
                          (s.id === 'F' && Math.round(combined.m33) === -1) ||
                          (s.id === 'B' && Math.round(combined.m33) === 1) ||
                          (s.id === 'L' && Math.round(combined.m31) === -1) ||
                          (s.id === 'R' && Math.round(combined.m31) === 1);
          if (isMatch) return getComputedStyle(f).backgroundColor;
        }
        return '#111';
      });
    });
    setNetColors(newNet);
  }, []);

  const move = useCallback(async (type: string, isUndo = false) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);

    const face = type[0];
    const isPrime = type.includes("'");
    const cfg: any = {
      'U':{ax:'Y', axis:{x:0,y:1,z:0}, co:'y',v:-1,i:0}, 'D':{ax:'Y', axis:{x:0,y:1,z:0}, co:'y',v:1,i:1},
      'L':{ax:'X', axis:{x:1,y:0,z:0}, co:'x',v:-1,i:1}, 'R':{ax:'X', axis:{x:1,y:0,z:0}, co:'x',v:1,i:0},
      'F':{ax:'Z', axis:{x:0,y:0,z:1}, co:'z',v:-1,i:0}, 'B':{ax:'Z', axis:{x:0,y:0,z:1}, co:'z',v:1,i:1}
    }[face];

    const angleDeg = (isPrime ? 90 : -90) * (cfg.i ? -1 : 1);
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // 生成本次旋转的四元数
    const moveQuat = Quaternion.fromAxisAngle(cfg.axis, angleRad);

    const pivots = [
      { con: frontConRef.current, cubies: cubiesRef.current.front },
      { con: backConRef.current, cubies: cubiesRef.current.back }
    ].map(({ con, cubies }) => {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute; transform-style:preserve-3d; transition:transform ${speed}ms cubic-bezier(0.4, 0, 0.2, 1);`;
      con?.appendChild(p);
      const targets = cubies.filter(c => Math.round(parseFloat(c.dataset[cfg.co]!)) === cfg.v);
      targets.forEach(c => p.appendChild(c));
      p.offsetHeight; // 强制重绘
      p.style.transform = `rotate${cfg.ax}(${angleDeg}deg)`;
      return { p, targets, con };
    });

    return new Promise(resolve => {
      setTimeout(() => {
        pivots.forEach(({ p, targets, con }) => {
          targets.forEach(c => {
            const oldQuat = quatMapRef.current.get(c) || Quaternion.identity();
            // 四元数更新：NewRotation * OldRotation
            const newQuat = moveQuat.multiply(oldQuat).normalize();
            quatMapRef.current.set(c, newQuat);

            // 逻辑坐标旋转计算
            const x = parseFloat(c.dataset.x!);
            const y = parseFloat(c.dataset.y!);
            const z = parseFloat(c.dataset.z!);
            let nx = x, ny = y, nz = z;

            if (cfg.ax === 'X') {
                ny = y * Math.cos(angleRad) - z * Math.sin(angleRad);
                nz = y * Math.sin(angleRad) + z * Math.cos(angleRad);
            } else if (cfg.ax === 'Y') {
                nx = x * Math.cos(angleRad) + z * Math.sin(angleRad);
                nz = -x * Math.sin(angleRad) + z * Math.cos(angleRad);
            } else if (cfg.ax === 'Z') {
                nx = x * Math.cos(angleRad) - y * Math.sin(angleRad);
                ny = x * Math.sin(angleRad) + y * Math.cos(angleRad);
            }

            // 更新数据集
            c.dataset.x = Math.round(nx).toString();
            c.dataset.y = Math.round(ny).toString();
            c.dataset.z = Math.round(nz).toString();

            // 归位并应用最终精确变换
            con?.appendChild(c);
            applyTransform(c, newQuat, Math.round(nx), Math.round(ny), Math.round(nz));
          });
          p.remove();
        });
        
        if (!isUndo) setHistory(prev => [...prev, type]);
        updateNetView();
        isAnimatingRef.current = false;
        setIsAnimating(false);
        resolve(null);
      }, speed + 20);
    });
  }, [speed, offset, updateNetView]);

  const autoSolve = async () => {
    if (isAnimatingRef.current || history.length === 0 || isSolving) return;
    setIsSolving(true);
    const currentHistory = [...history];
    for (let i = currentHistory.length - 1; i >= 0; i--) {
      const step = currentHistory[i];
      const reverseMove = step.includes("'") ? step[0] : step + "'";
      await move(reverseMove, true);
      setHistory(prev => prev.slice(0, -1));
      await new Promise(r => setTimeout(r, 40)); 
    }
    setIsSolving(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isSolving || isAnimating) return;
      const k = e.key.toLowerCase();
      const map: any = { u:'U', d:'D', l:'L', r:'R', f:'F', b:'B' };
      if (map[k]) move(e.shiftKey ? map[k] + "'" : map[k]);
      if (k === 'z' && (e.ctrlKey || e.metaKey) && history.length > 0) {
          const last = history[history.length-1];
          move(last.includes("'") ? last[0] : last + "'", true);
          setHistory(p => p.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [history, move, isSolving, isAnimating]);

  if (!mounted) return <div className="h-[450px]" />;

  const controlsDisabled = isAnimating || isSolving;

  return (
    <div className="w-full flex flex-col gap-6 py-2 items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <div className="lg:col-span-3 flex flex-col items-center gap-2">
          <div className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">State Map</div>
          <div className="grid grid-cols-4 grid-rows-3 gap-1 w-32">
            <div /><NetFace colors={netColors['U']} /><div /><div />
            <NetFace colors={netColors['L']} /><NetFace colors={netColors['F']} /><NetFace colors={netColors['R']} /><NetFace colors={netColors['B']} />
            <div /><NetFace colors={netColors['D']} /><div /><div />
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center items-center bg-slate-200/30 dark:bg-white/5 rounded-3xl p-6 min-h-[320px] relative border border-slate-200 dark:border-white/10 overflow-hidden">
           <div className="relative w-48 h-48 flex items-center justify-center [perspective:1000px]">
              <div ref={frontConRef} className="relative w-0 h-0 [transform-style:preserve-3d] -rotate-x-30 rotate-y-45 scale-90 md:scale-100 transition-transform duration-500" />
           </div>
           <div className="absolute right-4 bottom-4 w-16 h-16 hidden md:flex items-center justify-center [perspective:1000px] opacity-30">
              <div ref={backConRef} className="relative w-0 h-0 [transform-style:preserve-3d] rotate-x-30 rotate-y-225 scale-[0.25]" />
           </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
            {['U','D','L','R','F','B',"U'","D'"].map(m => (
              <button key={m} onClick={() => move(m)} disabled={controlsDisabled}
                className="py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-black hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95 disabled:opacity-20">
                {m}
              </button>
            ))}
          </div>
          <button onClick={autoSolve} disabled={controlsDisabled || history.length === 0}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-tighter">
            {isSolving ? 'Solving...' : 'Auto Solve'}
          </button>
          <button onClick={async () => {
            if (controlsDisabled) return;
            const moves = ['U','D','L','R','F','B'];
            for(let i=0; i<10; i++) await move(moves[Math.floor(Math.random()*6)]);
          }} className="w-full py-2 bg-slate-800 dark:bg-white/10 text-white rounded-lg text-xs font-bold active:scale-95 disabled:opacity-30">
            SCRAMBLE
          </button>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-white/5 pb-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Algorithm Stream</span>
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${controlsDisabled ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] font-mono text-orange-500 font-bold">{history.length} STEPS</span>
           </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 min-h-[1.5rem] font-mono text-[13px] text-slate-500 dark:text-gray-400 italic">
          {history.length > 0 ? history.map((s,i) => (
            <span key={i} className={i === history.length-1 ? "text-orange-500 font-bold not-italic" : ""}>{s}</span>
          )) : <span className="text-slate-300 dark:text-gray-600 font-normal">Ready...</span>}
        </div>
      </div>
    </div>
  );
};

const NetFace = ({ colors }: { colors?: string[] }) => (
  <div className="grid grid-cols-3 gap-[1px] bg-slate-200 dark:bg-white/5 p-[1px] rounded-md overflow-hidden">
    {(colors || Array(9).fill('transparent')).map((c, i) => (
      <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-colors duration-500 rounded-[1px]" style={{ backgroundColor: c }} />
    ))}
  </div>
);

export default Cube;