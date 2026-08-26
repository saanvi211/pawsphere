import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Heart, Shield, ArrowRight, PawPrint, MapPin, User, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { SpeciesType } from '../../types/animal';

interface LandingViewProps {
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onExplorePublicPets: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenAuthModal,
  onExplorePublicPets
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotating 3D Paw & Floating Shapes Canvas using Solid Colors (Zero Gradients!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.012;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Rotating Platform Ring in Solid Brand Blue
      ctx.save();
      ctx.translate(cx, cy + 60);
      ctx.scale(1, 0.38);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed outer ring in Solid Brand Orange
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 130, -angle, -angle + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Rotating 3D Paw Icon constructed with Solid Circles
      ctx.save();
      ctx.translate(cx, cy - 20 + Math.sin(angle * 1.5) * 10);
      
      // Floating small decorative stars/spheres
      const colors = ['#1d4ed8', '#ea580c', '#15803d'];
      for (let i = 0; i < 3; i++) {
        const offsetAngle = angle + (i * Math.PI * 2) / 3;
        const sx = Math.cos(offsetAngle) * 85;
        const sy = Math.sin(offsetAngle) * 45;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Paw Pad (Solid Brand Orange)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 10, 32, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw 4 Toe Pads (Solid Brand Blue)
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(-22, -14, 10, 0, Math.PI * 2); // Toe 1
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-8, -26, 11, 0, Math.PI * 2);  // Toe 2
      ctx.fill();

      ctx.beginPath();
      ctx.arc(8, -26, 11, 0, Math.PI * 2);   // Toe 3
      ctx.fill();

      ctx.beginPath();
      ctx.arc(22, -14, 10, 0, Math.PI * 2);  // Toe 4
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-6">
        
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-lightBlue text-brand-solidBlue border-2 border-brand-solidBlue text-xs font-extrabold shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-solidBlue animate-spin" />
            <span>Introducing PawSphere 3D Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Everything Your Pet Needs in One <span className="text-brand-solidOrange">3D Care Hub</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
            Manage medical passports for your companion animals, test diet/play reactions via our actual 3D digital twins, connect with local vet clinics, and find your perfect matching rescue pet.
          </p>

          {/* Action Buttons strictly lead to login/signup */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-solidGreen text-white font-extrabold text-xs shadow-md border-2 border-brand-solidGreen transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
            >
              <span>Create Account to Enter App</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white border-2 border-slate-300 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm hover:bg-slate-50"
            >
              <LogIn className="w-4 h-4 text-brand-solidBlue" />
              <span>Already Have Account? Sign In</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 font-bold">
            🔒 Protected Portal: Logged-in users gain full access to 3D Digital Twins, Smart AI Matchmaking, and Emergency Vet Directories.
          </p>
        </div>

        {/* Right 3D Interactive Card Preview (Strictly Decorative, No Digital Twin Preview) */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                PawSphere Live 3D Canvas
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-lightOrange text-brand-solidOrange border border-brand-solidOrange font-bold text-[10px] uppercase">
                Active Render
              </span>
            </div>

            {/* 3D Canvas Viewport */}
            <div className="relative w-full h-[300px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-contain" />
              
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950 p-3 text-white flex items-center justify-between border-2 border-brand-solidBlue rounded-xl">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-brand-solidOrange">Interactive 3D Engine</div>
                  <div className="text-[9px] text-slate-400 font-semibold">Join today to customize body parameters</div>
                </div>
                <button onClick={() => onOpenAuthModal('signup')} className="px-3.5 py-1.5 rounded-lg bg-brand-solidBlue text-white font-extrabold text-[10px] uppercase">
                  Register
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Card 1: For Pet Buyers / Adopters */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-lightOrange border-2 border-brand-solidOrange text-brand-solidOrange flex items-center justify-center font-bold">
            <Heart className="w-6 h-6 fill-brand-solidOrange" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Looking to Adopt or Buy a Pet?</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
            Take our personality-based AI Matchmaking Quiz to map compatible traits. Browse verified animal shelters, veterinary directories, and local pharmacies.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-bold pt-1">
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>AI Matchmaking Alignment Index</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>Shelter Phone Contact & Directions</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>Responsive cards layout for all devices</span></li>
          </ul>
        </div>

        {/* Card 2: For Existing Pet Owners */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-lightGreen border-2 border-brand-solidGreen text-brand-solidGreen flex items-center justify-center font-bold">
            <PawPrint className="w-6 h-6 text-brand-solidGreen" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Existing Pet Care & 3D Twins</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
            Groom your pet's record via the Digital QR Passport. Open 3D digital twins for multiple dog/cat breeds and simulate reactions to new food, exercise, and thunderstorms.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-bold pt-1">
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>3D Breed-Specific Twin Viewports</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>Diet & Play Reactivity Simulation Sandbox</span></li>
            <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-brand-solidGreen" /><span>Digital passport vaccination logs & reminders</span></li>
          </ul>
        </div>

      </div>

    </div>
  );
};
