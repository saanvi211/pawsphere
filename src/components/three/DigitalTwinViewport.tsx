import React, { useState, useRef, useEffect } from 'react';
import { Animal } from '../../types/animal';
import { 
  Activity, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Info,
  Sparkles,
  Heart,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Spatial3DHealthViewerProps {
  animal: Animal;
  allAnimals: Animal[];
  onSelectAnimal: (id: string) => void;
  onOpenPassport: () => void;
  onOpenAITriage: () => void;
}

// Breeds dictionary for each species
const BREEDS_DATABASE: Record<string, Array<{ id: string; name: string; color: string; scale: [number, number]; ears: 'pointed' | 'droopy' | 'flat' }>> = {
  dog: [
    { id: 'golden', name: 'Golden Retriever', color: '#ea580c', scale: [1, 1], ears: 'droopy' },
    { id: 'shepherd', name: 'German Shepherd', color: '#9a3412', scale: [1.1, 0.9], ears: 'pointed' },
    { id: 'bulldog', name: 'Bulldog', color: '#64748b', scale: [0.85, 1.2], ears: 'droopy' },
    { id: 'poodle', name: 'Poodle', color: '#f8fafc', scale: [0.95, 0.95], ears: 'droopy' }
  ],
  cat: [
    { id: 'siamese', name: 'Siamese', color: '#fed7aa', scale: [0.9, 0.8], ears: 'pointed' },
    { id: 'persian', name: 'Persian', color: '#cbd5e1', scale: [1, 1.15], ears: 'flat' },
    { id: 'mainecoon', name: 'Maine Coon', color: '#475569', scale: [1.2, 1], ears: 'pointed' },
    { id: 'tabby', name: 'Tabby Cat', color: '#b45309', scale: [0.95, 0.9], ears: 'pointed' }
  ],
  bird: [
    { id: 'macaw', name: 'Macaw', color: '#1d4ed8', scale: [1, 1], ears: 'pointed' },
    { id: 'cockatiel', name: 'Cockatiel', color: '#e2e8f0', scale: [0.8, 0.8], ears: 'pointed' }
  ],
  fish: [
    { id: 'betta', name: 'Betta Fish', color: '#1d4ed8', scale: [1.1, 0.7], ears: 'flat' },
    { id: 'goldfish', name: 'Goldfish', color: '#ea580c', scale: [0.9, 1.2], ears: 'flat' }
  ],
  reptile: [
    { id: 'beardie', name: 'Bearded Dragon', color: '#15803d', scale: [1.2, 0.8], ears: 'flat' },
    { id: 'gecko', name: 'Leopard Gecko', color: '#ea580c', scale: [0.9, 0.7], ears: 'flat' }
  ],
  rabbit: [
    { id: 'holland', name: 'Holland Lop', color: '#d1fae5', scale: [0.9, 1.1], ears: 'droopy' },
    { id: 'angora', name: 'Angora', color: '#ffffff', scale: [1.1, 1.2], ears: 'droopy' }
  ],
  hamster: [
    { id: 'syrian', name: 'Syrian Hamster', color: '#ffedd5', scale: [0.65, 0.65], ears: 'pointed' },
    { id: 'dwarf', name: 'Dwarf Hamster', color: '#94a3b8', scale: [0.5, 0.5], ears: 'pointed' }
  ],
  other: [
    { id: 'default', name: 'Other Species Companion', color: '#15803d', scale: [1, 1], ears: 'droopy' }
  ]
};

// Treatment plan diagnostics data based on body region
const TREATMENT_PLANS = {
  heart: {
    title: 'Heart & Cardiovascular',
    condition: 'Healthy strong sinus rhythm (78 BPM). Mild stress observed.',
    plan: 'Maintain a consistent aerobic exercise routine of 30 minutes daily. Reduce sodium in kibble.',
    nextVetCheck: 'February 2027'
  },
  stomach: {
    title: 'Stomach & Digestion',
    condition: 'Acidic irritation, slight allergy sensitivity to synthetic fillers.',
    plan: 'Introduce Grain-Free wet diet or raw food formulas. Add 1 tbsp Salmon Oil weekly for digestion support.',
    nextVetCheck: 'September 2026'
  },
  joints: {
    title: 'Joints & Locomotion',
    condition: 'Rear hip tightness, joint friction (common in mature retrievers/shepherds).',
    plan: 'Administer Glucosamine & Chondroitin supplements twice daily. Restrict high jumps; use steps.',
    nextVetCheck: 'October 2026'
  },
  teeth: {
    title: 'Dental & Oral Cavity',
    condition: 'Minor tartar buildup on upper premolars.',
    plan: 'Weekly manual teeth brushing. Provide organic raw dental bone chews twice a week.',
    nextVetCheck: 'November 2026'
  },
  skin: {
    title: 'Skin, Fur & Coat',
    condition: 'Slight seasonal dry flakiness under stomach coat.',
    plan: 'Brush coat 3 times weekly to distribute natural skin hydration oils. Add Omega-3 fatty supplements.',
    nextVetCheck: 'January 2027'
  }
};

export const DigitalTwinViewport: React.FC<Spatial3DHealthViewerProps> = ({
  animal,
  allAnimals,
  onSelectAnimal,
  onOpenPassport,
  onOpenAITriage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Twin Configuration States
  const [selectedBreedId, setSelectedBreedId] = useState(
    BREEDS_DATABASE[animal.species]?.[0]?.id || 'default'
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [angle, setAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  // Body Region Diagnostics Selector
  const [selectedRegion, setSelectedRegion] = useState<'heart' | 'stomach' | 'joints' | 'teeth' | 'skin'>('heart');

  // Reaction Testing States
  const [testFood, setTestFood] = useState<'raw' | 'kibble' | 'supplement' | 'none'>('none');
  const [testExercise, setTestExercise] = useState<'fetch' | 'sprint' | 'none'>('none');
  const [testWeather, setTestWeather] = useState<'thunder' | 'sun' | 'none'>('none');

  // Computed Vitals based on Reaction States
  const [heartRate, setHeartRate] = useState(80);
  const [stamina, setStamina] = useState(90);
  const [anxiety, setAnxiety] = useState(10);
  const [twinAnimationOffset, setTwinAnimationOffset] = useState(0);

  const availableBreeds = BREEDS_DATABASE[animal.species] || BREEDS_DATABASE.other;
  const activeBreed = availableBreeds.find(b => b.id === selectedBreedId) || availableBreeds[0];

  // Dynamic reaction vital effects simulator
  useEffect(() => {
    let targetHr = 80;
    let targetStamina = 90;
    let targetAnxiety = 10;

    if (testExercise === 'fetch') {
      targetHr = 115;
      targetStamina = 70;
      targetAnxiety = 5;
    } else if (testExercise === 'sprint') {
      targetHr = 145;
      targetStamina = 45;
      targetAnxiety = 10;
    }

    if (testWeather === 'thunder') {
      targetAnxiety = 75;
      targetHr += 25;
    } else if (testWeather === 'sun') {
      targetAnxiety = 5;
      targetHr += 10;
    }

    if (testFood === 'raw') {
      targetStamina += 10;
      targetAnxiety = Math.max(0, targetAnxiety - 5);
    } else if (testFood === 'supplement') {
      targetHr = Math.max(65, targetHr - 5);
    }

    setHeartRate(targetHr);
    setStamina(Math.min(100, Math.max(0, targetStamina)));
    setAnxiety(Math.min(100, Math.max(0, targetAnxiety)));
  }, [testFood, testExercise, testWeather]);

  // Canvas render animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let renderAngle = 0;

    const render = () => {
      if (isRotating) {
        renderAngle += 0.015;
        setAngle(renderAngle);
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + 50;

      ctx.clearRect(0, 0, w, h);

      // Floor Platform (Isometric ellipse) in solid blue
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoomLevel, zoomLevel * 0.38);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed radar indicator in solid orange
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 180, renderAngle, renderAngle + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Render 3D actual animal structure using pure geometric primitives with solid colors (No gradients!)
      ctx.save();
      ctx.translate(cx, cy - 80 + Math.sin(renderAngle * 2) * (testExercise !== 'none' ? 12 : 5));
      ctx.scale(zoomLevel * activeBreed.scale[0], zoomLevel * activeBreed.scale[1]);

      // Base shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.beginPath();
      ctx.ellipse(0, 100, 75, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Torso) in Active Breed Solid Color
      ctx.fillStyle = activeBreed.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 85, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(60, -40, 38, 0, Math.PI * 2);
      ctx.fill();

      // Eyes (Solid Slate)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(72, -45, 5, 0, Math.PI * 2);
      ctx.fill();

      // Snout (Dog / Cat structure)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(82, -36, 12, 8, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Ears based on Breed Profile
      ctx.fillStyle = '#ea580c';
      if (activeBreed.ears === 'droopy') {
        // Drooping long dog ears
        ctx.beginPath();
        ctx.moveTo(48, -60);
        ctx.quadraticCurveTo(35, -20, 38, -10);
        ctx.quadraticCurveTo(55, -20, 52, -50);
        ctx.fill();
      } else if (activeBreed.ears === 'pointed') {
        // Pointed ears (German shepherd, Tabby cat)
        ctx.beginPath();
        ctx.moveTo(48, -65);
        ctx.lineTo(40, -90);
        ctx.lineTo(60, -70);
        ctx.fill();
      } else {
        // Flat face ears
        ctx.beginPath();
        ctx.arc(45, -60, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tail with animation wiggles
      const tailWiggle = Math.sin(renderAngle * (testExercise !== 'none' ? 6 : 2)) * 25;
      ctx.strokeStyle = activeBreed.color;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-75, 10);
      ctx.quadraticCurveTo(-110, -10 + tailWiggle, -125, -20 + tailWiggle);
      ctx.stroke();

      // Four Legs in solid slate/gray shading
      ctx.fillStyle = '#475569';
      // Front Right Leg
      ctx.fillRect(40, 45, 12, 45);
      // Front Left Leg
      ctx.fillRect(20, 45, 12, 45);
      // Back Right Leg
      ctx.fillRect(-45, 45, 14, 45);
      // Back Left Leg
      ctx.fillRect(-65, 45, 14, 45);

      // Heartbeat pulse simulation if heart region is active
      if (selectedRegion === 'heart') {
        const heartPulse = Math.sin(renderAngle * (heartRate / 30)) * 6 + 12;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(20, -10, heartPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [animal, activeBreed, selectedRegion, heartRate, testExercise]);

  const handleResetSimulator = () => {
    setTestFood('none');
    setTestExercise('none');
    setTestWeather('none');
  };

  const activePlan = TREATMENT_PLANS[selectedRegion];

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            3D Breed Digital Twin & <span className="text-brand-solidOrange">Treatment Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold font-mono">Select specific animal breeds, test reaction vitals, and diagnose treatment plans</p>
        </div>

        {/* Breed Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-extrabold text-slate-700 uppercase">Breed Selection:</label>
          <select
            value={selectedBreedId}
            onChange={e => setSelectedBreedId(e.target.value)}
            className="bg-white border-2 border-brand-solidBlue text-slate-800 text-xs font-extrabold p-2.5 rounded-xl outline-none"
          >
            {availableBreeds.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: 3D Viewport & Simulation Vitals */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-lg relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Twin Model: {activeBreed.name}
              </span>

              {/* Viewport Control Panel */}
              <div className="flex space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <button onClick={() => setIsRotating(!isRotating)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg">
                  <RotateCw className="w-4 h-4" />
                </button>
                <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.45))} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.65))} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg">
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="relative w-full h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-700">
              <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-contain" />
              
              {/* Overlay Interactive region markers */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md p-3 text-white rounded-xl border border-slate-700 space-y-1.5">
                <span className="text-[10px] font-extrabold text-brand-solidOrange uppercase">Active Diagnostics</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={() => setSelectedRegion('heart')} className={`px-2 py-1 rounded text-[9px] font-bold ${selectedRegion === 'heart' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Heart Rate</button>
                  <button onClick={() => setSelectedRegion('stomach')} className={`px-2 py-1 rounded text-[9px] font-bold ${selectedRegion === 'stomach' ? 'bg-brand-solidOrange text-white' : 'bg-slate-800 text-slate-300'}`}>Digestive</button>
                  <button onClick={() => setSelectedRegion('joints')} className={`px-2 py-1 rounded text-[9px] font-bold ${selectedRegion === 'joints' ? 'bg-brand-solidBlue text-white' : 'bg-slate-800 text-slate-300'}`}>Joints</button>
                  <button onClick={() => setSelectedRegion('teeth')} className={`px-2 py-1 rounded text-[9px] font-bold ${selectedRegion === 'teeth' ? 'bg-brand-solidGreen text-white' : 'bg-slate-800 text-slate-300'}`}>Dental</button>
                  <button onClick={() => setSelectedRegion('skin')} className={`px-2 py-1 rounded text-[9px] font-bold ${selectedRegion === 'skin' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Coat & Skin</button>
                </div>
              </div>

              {/* Stress / Hot warning banner */}
              {anxiety >= 60 && (
                <div className="absolute top-4 right-4 bg-red-600 border border-red-500 text-white font-extrabold text-[10px] py-1 px-3 rounded-full flex items-center space-x-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>HIGH ANXIETY STATE</span>
                </div>
              )}
            </div>

            {/* Vitals Telemetry Panel */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-bold">
              <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[10px] block">Heart Rate Vitals</span>
                <span className="text-lg font-extrabold text-red-600 flex items-center space-x-1">
                  <Activity className="w-4.5 h-4.5 animate-pulse" />
                  <span>{heartRate} BPM</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[10px] block">Muscle Stamina</span>
                <span className="text-lg font-extrabold text-brand-solidBlue">{stamina}%</span>
              </div>
              <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[10px] block">Anxiety Index</span>
                <span className={`text-lg font-extrabold ${anxiety >= 50 ? 'text-red-600' : 'text-brand-solidGreen'}`}>{anxiety}%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Reaction Control Panel & Treatment Plan */}
        <div className="lg:col-span-4 space-y-6 text-xs">
          
          {/* Reaction Simulator Sandbox */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Reactivity Test Bench</h4>
              <button onClick={handleResetSimulator} className="text-[10px] text-slate-500 hover:text-brand-solidOrange font-bold underline">
                Reset Vitals
              </button>
            </div>

            <div className="space-y-3">
              {/* Food Reaction */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase block">Dietary Ingestion Test:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => setTestFood('raw')} className={`py-1.5 rounded-lg border-2 font-bold ${testFood === 'raw' ? 'bg-brand-solidGreen border-brand-solidGreen text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Raw Meat</button>
                  <button onClick={() => setTestFood('kibble')} className={`py-1.5 rounded-lg border-2 font-bold ${testFood === 'kibble' ? 'bg-brand-solidGreen border-brand-solidGreen text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Kibble</button>
                  <button onClick={() => setTestFood('supplement')} className={`py-1.5 rounded-lg border-2 font-bold ${testFood === 'supplement' ? 'bg-brand-solidGreen border-brand-solidGreen text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Salmon Oil</button>
                </div>
              </div>

              {/* Physical Excitement */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase block">Physical Activity Test:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTestExercise('fetch')} className={`py-1.5 rounded-lg border-2 font-bold ${testExercise === 'fetch' ? 'bg-brand-solidBlue border-brand-solidBlue text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Play Fetch</button>
                  <button onClick={() => setTestExercise('sprint')} className={`py-1.5 rounded-lg border-2 font-bold ${testExercise === 'sprint' ? 'bg-brand-solidBlue border-brand-solidBlue text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Agility Sprint</button>
                </div>
              </div>

              {/* Environment Conditions */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase block">Atmospheric Stress Test:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTestWeather('thunder')} className={`py-1.5 rounded-lg border-2 font-bold ${testWeather === 'thunder' ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Thunderstorm</button>
                  <button onClick={() => setTestWeather('sun')} className={`py-1.5 rounded-lg border-2 font-bold ${testWeather === 'sun' ? 'bg-brand-solidOrange border-brand-solidOrange text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>Extreme Sun</button>
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Diagnostics Drawer */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Diagnostic Treatment Plan
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-brand-lightBlue border-2 border-brand-solidBlue rounded-xl text-brand-darkBlue">
                <span className="text-[10px] font-bold block uppercase">Body System</span>
                <span className="font-extrabold text-xs">{activePlan.title}</span>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase text-[9px]">Observed Condition</span>
                <p className="font-semibold text-slate-700">"{activePlan.condition}"</p>
              </div>

              <div className="space-y-1 bg-brand-lightGreen p-3 rounded-xl border-2 border-brand-solidGreen text-brand-solidGreen">
                <span className="font-extrabold block uppercase text-[9px]">Prescribed Treatment Actions</span>
                <p className="font-bold">"{activePlan.plan}"</p>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500">
                <span>Next Routine Checkup:</span>
                <span className="font-extrabold text-slate-800">{activePlan.nextVetCheck}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button onClick={onOpenAITriage} className="flex-1 py-2.5 rounded-xl bg-brand-solidBlue text-white font-extrabold">
                  Ask AI Health Triage
                </button>
                <button onClick={onOpenPassport} className="flex-1 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-extrabold">
                  View QR ID Card
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
