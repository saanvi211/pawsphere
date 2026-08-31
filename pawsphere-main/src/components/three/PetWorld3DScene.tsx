import React, { useRef, useEffect, useState } from 'react';
import { Animal } from '../../types/animal';
import { PetImage } from '../PetImage';
import { 
  Heart, 
  Dog, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Sparkles,
  Zap,
  PawPrint
} from 'lucide-react';


interface PetWorld3DSceneProps {
  animal: Animal | null;
  onOpenAITriage: () => void;
  onOpen3DViewer: () => void;
  onOpenPassport: () => void;
  onSelectTab: (tab: string) => void;
  isScanningTransition?: boolean;
  onOpenAddPet?: () => void;
}

export const PetWorld3DScene: React.FC<PetWorld3DSceneProps> = ({
  animal,
  onOpenAITriage,
  onOpen3DViewer,
  onOpenPassport,
  onSelectTab,
  isScanningTransition = false,
  onOpenAddPet
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // WebGL Availability Check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setWebGLSupported(!!gl);
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  // Track Mouse for Parallax Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  // 3D Canvas Render Loop (WebGL or 2D Accelerated Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webGLSupported) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.015;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 550);
      const cx = w / 2 + mousePos.x * 12;
      const cy = h / 2 + mousePos.y * 8 + 30;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Atmospheric Background Glow
      const bgGlow = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy, 320);
      bgGlow.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
      bgGlow.addColorStop(0.5, 'rgba(29, 78, 216, 0.08)');
      bgGlow.addColorStop(1, 'rgba(6, 11, 23, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // 2. Holographic Platform Outer Ring
      ctx.save();
      ctx.translate(cx, cy + 90);
      ctx.scale(1, 0.38);

      // Outer Cyan Glowing Ring
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = isScanningTransition ? 6 : 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = isScanningTransition ? 25 : 12;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Rotating Orange Dashed Laser Ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 16]);
      ctx.beginPath();
      ctx.arc(0, 0, 130, -time * 1.5, -time * 1.5 + Math.PI * 2);
      ctx.stroke();

      // Platform Grid Concentric Circles
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Scanning Chamber Ring Expansion effect
      if (isScanningTransition) {
        const scanRadius = 40 + ((time * 100) % 200);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, scanRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 3. Floating Particles & Energy Sparks
      const particleCount = 28;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = time * 0.4 + (i * Math.PI * 2) / particleCount;
        const radius = 100 + Math.sin(time + i) * 45;
        const px = cx + Math.cos(pAngle) * radius;
        const py = cy + Math.sin(pAngle * 2) * 25 - 40;
        const pSize = (Math.sin(time * 2 + i) + 1) * 1.8 + 1;
        
        ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.7)' : 'rgba(234, 88, 12, 0.7)';
        ctx.shadowColor = i % 2 === 0 ? '#06b6d4' : '#ea580c';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 4. Laser Connecting Vectors to Portals
      const portalPositions = [
        { x: cx - 180, y: cy - 70 }, // HEALTH
        { x: cx + 180, y: cy - 70 }, // 3D DIGITAL TWIN
        { x: cx - 210, y: cy + 40 }, // PASSPORT
        { x: cx + 210, y: cy + 40 }, // ADOPTION
        { x: cx, y: cy + 130 }         // NEARBY CARE
      ];

      portalPositions.forEach((pos, idx) => {
        ctx.save();
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(6, 182, 212, 0.25)' : 'rgba(234, 88, 12, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(cx, cy + 50);
        ctx.quadraticCurveTo((cx + pos.x) / 2, (cy + pos.y) / 2 - 20, pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [webGLSupported, mousePos, isScanningTransition]);

  // Derived Pet Display Details
  const petName = animal?.name || 'Pet Companion';

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[520px] sm:h-[560px] flex items-center justify-center overflow-hidden rounded-3xl selection:bg-brand-solidOrange"
    >
      {/* Background 3D Canvas */}
      {webGLSupported && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
        />
      )}

      {/* Scanning Chamber Transition Overlay */}
      {isScanningTransition && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-cyan-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-64 h-64 rounded-full border-4 border-cyan-400 border-t-transparent animate-scan-ring flex items-center justify-center">
            <Zap className="w-12 h-12 text-cyan-300 animate-pulse" />
          </div>
          <div className="mt-4 px-4 py-1.5 rounded-full bg-cyan-900/90 border border-cyan-400 text-cyan-200 text-xs font-mono font-extrabold uppercase tracking-widest animate-pulse shadow-[0_0_20px_#06b6d4]">
            ACTIVATING VETERINARY SCANNING CHAMBER...
          </div>
        </div>
      )}

      {/* CENTRAL 3D PET HOLOGRAPHIC BILLBOARD */}
      <div 
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
          isScanningTransition ? 'scale-110 translate-y-2' : ''
        }`}
        style={{
          transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -6}px, 0px)`
        }}
      >
        {/* Holographic Pet Image Frame */}
        <div className="relative group cursor-pointer" onClick={animal ? onOpen3DViewer : (onOpenAddPet || onOpen3DViewer)}>
          
          {/* Volumetric Holographic Glow Aura */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-600/20 to-orange-500/30 blur-2xl group-hover:opacity-100 transition-opacity animate-pulse" />
          
          {/* Glowing Holographic Ring Stand */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-b from-cyan-400/40 via-blue-600/20 to-cyan-500/40 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-md flex items-center justify-center">
            {animal?.photoUrl ? (
              <PetImage
                pet={animal}
                className="w-full h-full rounded-full object-cover holographic-pet-mask transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#091122]/90 border border-cyan-400/40 flex flex-col items-center justify-center p-4 text-center space-y-3 text-cyan-300">
                <PawPrint className="w-14 h-14 text-cyan-400 animate-pulse" />
                <div className="space-y-2">
                  {animal ? (
                    <>
                      <span className="text-xs font-extrabold text-white block uppercase tracking-wider">
                        No Photo Yet
                      </span>
                      <span className="text-[10px] text-cyan-300 font-semibold block leading-tight max-w-[180px]">
                        Upload a photo to showcase {animal.name}'s profile.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-extrabold text-white block uppercase tracking-wider">
                        Meet Your Companion
                      </span>
                      <span className="text-[10px] text-cyan-300 font-semibold block leading-tight max-w-[180px]">
                        Add your first pet to create their PawSphere profile.
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Holographic Scanline Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-400/10 via-transparent to-cyan-500/10 pointer-events-none border border-cyan-300/30" />
          </div>

          {/* Interactive Holographic Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#091122]/95 border border-cyan-400 text-cyan-300 text-[11px] font-extrabold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{animal?.photoUrl ? `${petName}'s 3D Sanctuary` : animal ? `${petName}'s Profile` : '+ Add Pet'}</span>
          </div>

        </div>
      </div>

      {/* SURROUNDING HOLOGRAPHIC SPATIAL FEATURE PORTALS */}
      <div 
        className={`absolute inset-0 pointer-events-none z-20 transition-all duration-500 ${
          isScanningTransition ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}
      >
        {/* 1. HEALTH PORTAL (Top Left) */}
        <button
          onClick={onOpenAITriage}
          style={{ transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0px)` }}
          className="absolute top-12 left-4 sm:left-12 pointer-events-auto group p-3 sm:p-4 rounded-2xl bg-[#091122]/85 backdrop-blur-xl border border-pink-500/40 hover:border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all duration-300 flex items-center space-x-3 text-left hover:-translate-y-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-pink-500/30" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white group-hover:text-pink-300 tracking-wide uppercase">
              HEALTH
            </div>
            <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
              Checkup, Records & AI Health Helper
            </div>
          </div>
        </button>

        {/* 2. 3D DIGITAL TWIN PORTAL (Top Right) */}
        <button
          onClick={onOpen3DViewer}
          style={{ transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * 10}px, 0px)` }}
          className="absolute top-12 right-4 sm:right-12 pointer-events-auto group p-3 sm:p-4 rounded-2xl bg-[#091122]/85 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center space-x-3 text-left hover:-translate-y-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Dog className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white group-hover:text-cyan-300 tracking-wide uppercase">
              3D DIGITAL TWIN
            </div>
            <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
              Explore {petName}'s Digital Twin
            </div>
          </div>
        </button>

        {/* 3. DIGITAL PASSPORT PORTAL (Middle Left) */}
        <button
          onClick={onOpenPassport}
          style={{ transform: `translate3d(${mousePos.x * 16}px, ${mousePos.y * -8}px, 0px)` }}
          className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-8 pointer-events-auto group p-3 sm:p-4 rounded-2xl bg-[#091122]/85 backdrop-blur-xl border border-blue-500/40 hover:border-blue-400 shadow-[0_0_20px_rgba(29,78,216,0.25)] hover:shadow-[0_0_30px_rgba(29,78,216,0.4)] transition-all duration-300 flex items-center space-x-3 text-left hover:-translate-y-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white group-hover:text-blue-300 tracking-wide uppercase">
              PASSPORT
            </div>
            <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
              Verified Identity & Medical Records
            </div>
          </div>
        </button>

        {/* 4. ADOPTION PORTAL (Middle Right) */}
        <button
          onClick={() => onSelectTab('buy-pets')}
          style={{ transform: `translate3d(${mousePos.x * -16}px, ${mousePos.y * -8}px, 0px)` }}
          className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-8 pointer-events-auto group p-3 sm:p-4 rounded-2xl bg-[#091122]/85 backdrop-blur-xl border border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center space-x-3 text-left hover:-translate-y-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white group-hover:text-emerald-300 tracking-wide uppercase">
              ADOPTION
            </div>
            <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
              Find Friends & Forever Homes
            </div>
          </div>
        </button>

        {/* 5. NEARBY CARE PORTAL (Bottom Center) */}
        <button
          onClick={() => onSelectTab('shelters')}
          style={{ transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * -14}px, 0px)` }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto group p-3 sm:p-4 rounded-2xl bg-[#091122]/90 backdrop-blur-xl border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center space-x-3 text-center sm:text-left hover:-translate-y-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white group-hover:text-cyan-300 tracking-wide uppercase">
              NEARBY CARE
            </div>
            <div className="text-[10px] text-slate-300 font-semibold hidden sm:block">
              Vets, Shelters, Pharmacy & Emergency Care
            </div>
          </div>
        </button>

      </div>

    </div>
  );
};
