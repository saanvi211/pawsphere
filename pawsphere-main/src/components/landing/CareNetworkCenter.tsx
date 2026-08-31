import React, { useRef, useEffect, useState } from 'react';
import { 
  Heart, 
  Utensils, 
  Activity, 
  Users, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Globe,
  Stethoscope
} from 'lucide-react';

interface CareNetworkCenterProps {
  onNavigate: (route: string) => void;
}

interface CareNode {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  position: 'top' | 'top-left' | 'left' | 'top-right' | 'right';
  coords: { x: number; y: number }; // percentage or relative
  color: string;
  glow: string;
  route: string;
}

export const CareNetworkCenter: React.FC<CareNetworkCenterProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>(null);

  const careNodes: CareNode[] = [
    {
      id: 'health',
      label: 'Health',
      category: 'AI Diagnostics',
      icon: Stethoscope,
      position: 'top',
      coords: { x: 50, y: 8 },
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.5)] border-pink-400/60 text-pink-300',
      route: 'ai-triage'
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      category: 'Smart Diet',
      icon: Utensils,
      position: 'top-left',
      coords: { x: 12, y: 26 },
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)] border-emerald-400/60 text-emerald-300',
      route: 'nutrition'
    },
    {
      id: 'play',
      label: 'Play',
      category: 'Mood & Activity',
      icon: Activity,
      position: 'left',
      coords: { x: 8, y: 70 },
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-400/60 text-amber-300',
      route: 'grooming'
    },
    {
      id: 'adoption',
      label: 'Adoption',
      category: 'Rescue Match',
      icon: Heart,
      position: 'top-right',
      coords: { x: 88, y: 26 },
      color: 'from-purple-500 to-indigo-500',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.5)] border-purple-400/60 text-purple-300',
      route: 'buy-pets'
    },
    {
      id: 'community',
      label: 'Community',
      category: 'Social Circle',
      icon: Users,
      position: 'right',
      coords: { x: 92, y: 70 },
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)] border-cyan-400/60 text-cyan-300',
      route: 'community'
    }
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Render glowing 3D rings, particle orbits, and laser vector lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.012;
      const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 560);
      const cx = w / 2 + mouseOffset.x * 10;
      const cy = h / 2 + mouseOffset.y * 8 + 20;

      ctx.clearRect(0, 0, w, h);

      // 1. Central Ambient Radial Glow
      const radGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 260);
      radGlow.addColorStop(0, 'rgba(147, 51, 234, 0.22)');
      radGlow.addColorStop(0.4, 'rgba(59, 130, 246, 0.12)');
      radGlow.addColorStop(0.8, 'rgba(6, 182, 212, 0.05)');
      radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, w, h);

      // 2. Futuristic 3D Elliptical Platform Rings
      ctx.save();
      ctx.translate(cx, cy + 90);
      ctx.scale(1, 0.36);

      // Ring 1 (Outer Cyan Glow)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 210, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 2 (Purple Rotating Dashed)
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, 175, -angle * 1.5, -angle * 1.5 + Math.PI * 2);
      ctx.stroke();

      // Ring 3 (Electric Blue Grid)
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Laser Radial spokes
      for (let i = 0; i < 8; i++) {
        const spokeAngle = (i * Math.PI) / 4 + angle * 0.3;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(spokeAngle) * 70, Math.sin(spokeAngle) * 70);
        ctx.lineTo(Math.cos(spokeAngle) * 210, Math.sin(spokeAngle) * 210);
        ctx.stroke();
      }

      ctx.restore();

      // 3. Orbiting Hologram Particle Rings
      const particleCount = 24;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = angle * 0.6 + (i * Math.PI * 2) / particleCount;
        const rx = 180 + Math.sin(angle * 2 + i) * 15;
        const ry = 95 + Math.cos(angle * 2 + i) * 10;
        const px = cx + Math.cos(pAngle) * rx;
        const py = cy + 20 + Math.sin(pAngle) * ry;
        const pSize = (Math.sin(angle * 3 + i) + 1) * 1.5 + 1;

        ctx.fillStyle = i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#a855f7' : '#ec4899';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 4. Connecting Laser Lines to Surrounding Floating Nodes
      const nodeTargetPoints = [
        { x: cx, y: h * 0.12 },        // Health (Top)
        { x: w * 0.18, y: h * 0.28 },  // Nutrition (Top Left)
        { x: w * 0.16, y: h * 0.68 },  // Play (Left)
        { x: w * 0.82, y: h * 0.28 },  // Adoption (Top Right)
        { x: w * 0.84, y: h * 0.68 }   // Community (Right)
      ];

      nodeTargetPoints.forEach((pt, idx) => {
        const strokeGlow = idx === 0 ? '#ec4899' : idx === 1 ? '#10b981' : idx === 2 ? '#f59e0b' : idx === 3 ? '#a855f7' : '#06b6d4';
        ctx.save();
        ctx.strokeStyle = strokeGlow;
        ctx.shadowColor = strokeGlow;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 8]);
        ctx.lineDashOffset = -angle * 30;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 30);
        ctx.quadraticCurveTo((cx + pt.x) / 2, (cy + pt.y) / 2 - 20, pt.x, pt.y);
        ctx.stroke();

        // Little glowing pulse dot moving along the line
        const t = ((angle * 0.8 + idx * 0.2) % 1);
        const invT = 1 - t;
        const dotX = invT * invT * cx + 2 * invT * t * ((cx + pt.x) / 2) + t * t * pt.x;
        const dotY = invT * invT * (cy + 30) + 2 * invT * t * ((cy + pt.y) / 2 - 20) + t * t * pt.y;

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [mouseOffset]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] flex items-center justify-center select-none overflow-visible"
    >
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Floating Status Pill */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 rounded-full bg-[#080e22]/90 border border-purple-500/30 backdrop-blur-md flex items-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-200">
          3D Digital Twin Platform
        </span>
        <span className="text-[10px] text-purple-400 font-mono">LIVE</span>
      </div>

      {/* CENTRAL 3D MULTI-ANIMAL DIGITAL TWIN COMPOSITION */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${mouseOffset.x * 6}deg) rotateX(${-mouseOffset.y * 6}deg) translate3d(${mouseOffset.x * -10}px, ${mouseOffset.y * -8}px, 0px)`
        }}
      >
        {/* Hologram Aura */}
        <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-pink-500/30 blur-3xl opacity-80 animate-pulse pointer-events-none" />

        {/* 3D Circular Stage with Layered Animal Visuals */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center">
          {/* Futuristic Glowing Stage SVG Backdrop */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
            <defs>
              <linearGradient id="stageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
              <radialGradient id="stageCenter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Concentric Holographic Stage Rings */}
            <circle cx="200" cy="200" r="185" stroke="url(#stageGrad)" strokeWidth="2" strokeDasharray="6 8" opacity="0.6" />
            <circle cx="200" cy="200" r="160" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" filter="url(#neonGlow)" />
            <circle cx="200" cy="200" r="135" fill="url(#stageCenter)" stroke="#a855f7" strokeWidth="2" opacity="0.9" />

            {/* Orbiting Axis Marks */}
            <line x1="200" y1="20" x2="200" y2="40" stroke="#06b6d4" strokeWidth="2" />
            <line x1="200" y1="360" x2="200" y2="380" stroke="#06b6d4" strokeWidth="2" />
            <line x1="20" y1="200" x2="40" y2="200" stroke="#a855f7" strokeWidth="2" />
            <line x1="360" y1="200" x2="380" y2="200" stroke="#a855f7" strokeWidth="2" />
          </svg>

          {/* HIGH POLISH 3D MULTI-ANIMAL SCENE (Golden Retriever, Cat, Rabbit, Parrot, Turtle) */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg 
              className="w-[92%] h-[92%] drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] filter transition-transform duration-500 group-hover:scale-105"
              viewBox="0 0 500 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="dogFur" x1="200" y1="150" x2="320" y2="380" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FBBF24" />
                  <stop offset="0.5" stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="catFur" x1="120" y1="220" x2="200" y2="360" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E2E8F0" />
                  <stop offset="0.6" stopColor="#94A3B8" />
                  <stop offset="1" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="rabbitFur" x1="300" y1="260" x2="390" y2="380" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.7" stopColor="#F1F5F9" />
                  <stop offset="1" stopColor="#CBD5E1" />
                </linearGradient>
                <linearGradient id="parrotFeathers" x1="210" y1="90" x2="290" y2="220" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#EC4899" />
                  <stop offset="0.4" stopColor="#8B5CF6" />
                  <stop offset="0.8" stopColor="#06B6D4" />
                  <stop offset="1" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="turtleShell" x1="180" y1="360" x2="320" y2="440" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34D399" />
                  <stop offset="0.5" stopColor="#059669" />
                  <stop offset="1" stopColor="#065F46" />
                </linearGradient>
                <filter id="petGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#8b5cf6" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* 1. TURTLE (Bottom Center / Foreground on platform) */}
              <g transform="translate(185, 335)" filter="url(#petGlowEffect)">
                {/* Shell */}
                <ellipse cx="65" cy="45" rx="55" ry="32" fill="url(#turtleShell)" stroke="#6EE7B7" strokeWidth="2.5" />
                {/* Shell pattern lines */}
                <path d="M40 30L65 45L90 30M40 60L65 45L90 60M65 15V45V75" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                {/* Head */}
                <ellipse cx="125" cy="45" rx="14" ry="10" fill="#34D399" />
                <circle cx="130" cy="42" r="2.5" fill="#064E3B" />
                <circle cx="131" cy="41" r="0.8" fill="#FFFFFF" />
                {/* Flippers */}
                <ellipse cx="40" cy="18" rx="14" ry="8" fill="#10B981" transform="rotate(-25 40 18)" />
                <ellipse cx="95" cy="18" rx="16" ry="9" fill="#10B981" transform="rotate(25 95 18)" />
                <ellipse cx="38" cy="70" rx="12" ry="7" fill="#10B981" transform="rotate(20 38 70)" />
                <ellipse cx="92" cy="70" rx="14" ry="8" fill="#10B981" transform="rotate(-20 92 70)" />
                {/* Tiny Tail */}
                <path d="M10 45L0 45" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* 2. GOLDEN RETRIEVER (Center Proud Mascot) */}
              <g transform="translate(180, 160)" filter="url(#petGlowEffect)">
                {/* Body & Chest */}
                <path d="M30 110C30 80 55 60 85 60C115 60 140 80 140 110V180H30V110Z" fill="url(#dogFur)" />
                {/* Soft Chest fur highlight */}
                <path d="M60 85C60 70 72 65 85 65C98 65 110 70 110 85C110 120 60 120 60 85Z" fill="#FDE68A" opacity="0.8" />
                {/* Head */}
                <ellipse cx="85" cy="55" rx="42" ry="38" fill="url(#dogFur)" />
                {/* Muzzle */}
                <ellipse cx="85" cy="68" rx="22" ry="18" fill="#FEF3C7" />
                {/* Nose */}
                <path d="M78 62H92C92 62 90 72 85 72C80 72 78 62 78 62Z" fill="#1E293B" />
                {/* Friendly Smile */}
                <path d="M78 74C82 78 88 78 92 74" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M85 72V75" stroke="#1E293B" strokeWidth="2" />
                {/* Tongue */}
                <path d="M82 76C82 82 88 82 88 76Z" fill="#F43F5E" />
                {/* Eyes */}
                <circle cx="70" cy="48" r="5.5" fill="#1E293B" />
                <circle cx="100" cy="48" r="5.5" fill="#1E293B" />
                <circle cx="72" cy="46" r="2" fill="#FFFFFF" />
                <circle cx="102" cy="46" r="2" fill="#FFFFFF" />
                {/* Eyebrow tufts */}
                <ellipse cx="68" cy="40" rx="6" ry="2.5" fill="#D97706" />
                <ellipse cx="102" cy="40" rx="6" ry="2.5" fill="#D97706" />
                {/* Fluffy Golden Ears */}
                <path d="M48 38C35 48 30 75 42 90C46 95 54 85 54 75L50 42Z" fill="#D97706" />
                <path d="M122 38C135 48 140 75 128 90C124 95 116 85 116 75L120 42Z" fill="#D97706" />
                {/* Paws */}
                <ellipse cx="55" cy="180" rx="14" ry="10" fill="#FDE68A" />
                <ellipse cx="115" cy="180" rx="14" ry="10" fill="#FDE68A" />
                {/* Glowing High-Tech Collar */}
                <path d="M52 94C72 105 98 105 118 94" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round" />
                <circle cx="85" cy="104" r="6" fill="#A855F7" stroke="#38BDF8" strokeWidth="2" />
              </g>

              {/* 3. SLEEK CAT (Left Side Companion) */}
              <g transform="translate(90, 220)" filter="url(#petGlowEffect)">
                {/* Body */}
                <path d="M35 85C35 55 55 45 75 45C95 45 110 55 110 85V140H35V85Z" fill="url(#catFur)" />
                {/* Head */}
                <ellipse cx="72" cy="40" rx="30" ry="26" fill="url(#catFur)" />
                {/* Pointy Cat Ears */}
                <polygon points="50,25 40,-5 62,18" fill="#64748B" />
                <polygon points="52,23 44,0 60,18" fill="#F472B6" />
                <polygon points="94,25 104,-5 82,18" fill="#64748B" />
                <polygon points="92,23 100,0 84,18" fill="#F472B6" />
                {/* Glowing Cyan Cat Eyes */}
                <ellipse cx="60" cy="38" rx="6" ry="7" fill="#06B6D4" />
                <ellipse cx="84" cy="38" rx="6" ry="7" fill="#06B6D4" />
                <ellipse cx="60" cy="38" rx="2" ry="6" fill="#0F172A" />
                <ellipse cx="84" cy="38" rx="2" ry="6" fill="#0F172A" />
                <circle cx="61" cy="36" r="1.5" fill="#FFFFFF" />
                <circle cx="85" cy="36" r="1.5" fill="#FFFFFF" />
                {/* Nose & Whiskers */}
                <polygon points="70,47 74,47 72,50" fill="#F472B6" />
                <path d="M48 48L32 46M48 52L30 54M96 48L112 46M96 52L114 54" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
                {/* Curved Tail */}
                <path d="M35 125C15 120 10 90 20 80C25 75 30 85 25 95C20 105 28 115 40 120" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
                {/* Paws */}
                <ellipse cx="50" cy="140" rx="10" ry="7" fill="#E2E8F0" />
                <ellipse cx="95" cy="140" rx="10" ry="7" fill="#E2E8F0" />
              </g>

              {/* 4. FLUFFY RABBIT (Right Side Companion) */}
              <g transform="translate(320, 240)" filter="url(#petGlowEffect)">
                {/* Body */}
                <ellipse cx="50" cy="75" rx="35" ry="38" fill="url(#rabbitFur)" />
                {/* Head */}
                <circle cx="45" cy="40" r="24" fill="url(#rabbitFur)" />
                {/* Long Ears */}
                <ellipse cx="36" cy="2" rx="7" ry="24" fill="#FFFFFF" transform="rotate(-10 36 2)" />
                <ellipse cx="36" cy="2" rx="4" ry="18" fill="#FBCFE8" transform="rotate(-10 36 2)" />
                <ellipse cx="54" cy="4" rx="7" ry="24" fill="#FFFFFF" transform="rotate(12 54 4)" />
                <ellipse cx="54" cy="4" rx="4" ry="18" fill="#FBCFE8" transform="rotate(12 54 4)" />
                {/* Cute Ruby/Dark Eyes */}
                <circle cx="37" cy="38" r="4.5" fill="#BE185D" />
                <circle cx="53" cy="38" r="4.5" fill="#BE185D" />
                <circle cx="38" cy="36" r="1.5" fill="#FFFFFF" />
                <circle cx="54" cy="36" r="1.5" fill="#FFFFFF" />
                {/* Pink Nose & Cheeks */}
                <ellipse cx="45" cy="46" rx="2.5" ry="2" fill="#F472B6" />
                <ellipse cx="30" cy="44" rx="3" ry="2" fill="#FCE7F3" />
                <ellipse cx="60" cy="44" rx="3" ry="2" fill="#FCE7F3" />
                {/* Whiskers */}
                <path d="M28 46L15 44M28 49L16 52M62 46L75 44M62 49L74 52" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
                {/* Fluffy Tail */}
                <circle cx="84" cy="80" r="10" fill="#FFFFFF" />
              </g>

              {/* 5. VIBRANT PARROT (Perched Top-Right on Dog or Ring) */}
              <g transform="translate(265, 80)" filter="url(#petGlowEffect)">
                {/* Long Tail Feathers */}
                <path d="M30 80L38 150L44 140L35 75Z" fill="#06B6D4" />
                <path d="M34 80L45 160L52 145L38 75Z" fill="#8B5CF6" />
                {/* Body */}
                <ellipse cx="32" cy="55" rx="16" ry="26" fill="url(#parrotFeathers)" />
                {/* Wing */}
                <path d="M24 45C24 45 42 55 42 75C42 85 30 85 24 75Z" fill="#10B981" stroke="#34D399" strokeWidth="1" />
                {/* Head */}
                <circle cx="30" cy="30" r="14" fill="#EC4899" />
                {/* Crest feathers */}
                <path d="M30 18C30 18 36 8 44 12C44 12 38 18 34 20Z" fill="#FBBF24" />
                <path d="M26 19C26 19 28 6 36 8C36 8 32 16 28 20Z" fill="#F43F5E" />
                {/* White eye patch & Eye */}
                <circle cx="26" cy="28" r="6" fill="#FFFFFF" />
                <circle cx="25" cy="28" r="3" fill="#0F172A" />
                <circle cx="26" cy="27" r="1" fill="#FFFFFF" />
                {/* Curved Beak */}
                <path d="M18 28C10 32 14 42 20 40L22 32Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Interactive Core Holographic Pet Badge */}
          <div 
            onClick={() => onNavigate('digital-twin')}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#091122]/95 border border-purple-500/50 hover:border-cyan-400 text-cyan-300 text-[11px] font-mono font-extrabold flex items-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer group hover:scale-105 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="group-hover:text-white transition-colors">Enter 3D Digital Twin</span>
            <span className="text-purple-400">→</span>
          </div>
        </div>
      </div>

      {/* SURROUNDING 5 FLOATING CARE NETWORK NODES */}
      {careNodes.map((node) => {
        const Icon = node.icon;
        const isHovered = activeHoverNode === node.id;
        
        // Compute positioning style
        const style: React.CSSProperties = {
          left: `${node.coords.x}%`,
          top: `${node.coords.y}%`,
          transform: `translate(-50%, -50%) translate3d(${mouseOffset.x * (node.coords.x > 50 ? 12 : -12)}px, ${mouseOffset.y * (node.coords.y > 50 ? 10 : -10)}px, 0px)`
        };

        return (
          <button
            key={node.id}
            onClick={() => onNavigate(node.route)}
            onMouseEnter={() => setActiveHoverNode(node.id)}
            onMouseLeave={() => setActiveHoverNode(null)}
            style={style}
            className={`absolute z-30 group p-2.5 sm:p-3 rounded-2xl bg-[#091126]/85 backdrop-blur-xl border ${node.glow} transition-all duration-300 flex items-center space-x-2.5 text-left hover:-translate-y-1.5 cursor-pointer`}
          >
            {/* Glowing Icon Box */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${node.color} p-[1px] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <div className="w-full h-full rounded-[11px] bg-[#070d1e] flex items-center justify-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

            {/* Label Details */}
            <div className="pr-1">
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide text-white group-hover:text-cyan-200">
                {node.label}
              </div>
              <div className="text-[9px] text-slate-400 font-mono hidden sm:block">
                {node.category}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
