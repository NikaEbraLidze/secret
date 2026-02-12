import React, { useState, useEffect, useRef } from 'react';
import { AppStage, FlowerData } from './types';
import { MAX_SELECTION, TITLE_TEXT, SIGNATURE_TEXT, FINAL_MESSAGE } from './constants';
import IntroCard from './components/IntroCard';
import Flower from './components/Flower';
import { Heart, RotateCcw, Plus, Minus } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('intro');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [initialCount, setInitialCount] = useState<number>(0); // Track initial count
  const containerRef = useRef<HTMLDivElement>(null);

  // Background particles
  const [particles, setParticles] = useState<{x:number, y:number, size:number}[]>([]);

  useEffect(() => {
    // Generate static background particles once
    const p = [];
    for(let i=0; i<20; i++) {
        p.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1
        });
    }
    setParticles(p);
  }, []);

  const handleStart = () => {
    setStage('selection');
  };

  const handleToggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      setSelectedColors(selectedColors.filter(c => c !== hex));
    } else {
      if (selectedColors.length < MAX_SELECTION) {
        setSelectedColors([...selectedColors, hex]);
      }
    }
  };

  const generateFlowers = (colors: string[]) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const newFlowers: FlowerData[] = [];
    const count = 45; // Number of flowers

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      // Random position with bias towards bottom/center
      const x = Math.random() * width;
      // Start flowers from bottom 50% mostly
      const y = height * 0.4 + (Math.random() * height * 0.6);
      
      // Random size
      const size = 30 + Math.random() * 50;

      newFlowers.push({
        id: i,
        x,
        y,
        size,
        color,
        delay: i * 150 + Math.random() * 500, // Staggered animation
        petalCount: 5 + Math.floor(Math.random() * 4), // 5 to 8 petals
        rotationOffset: Math.random() * 360
      });
    }
    setFlowers(newFlowers);
    setInitialCount(count); // Store the baseline
  };

  const handleAddFlower = () => {
    if (!containerRef.current || selectedColors.length === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    const color = selectedColors[Math.floor(Math.random() * selectedColors.length)];
    const x = Math.random() * width;
    const y = height * 0.4 + (Math.random() * height * 0.6);
    const size = 30 + Math.random() * 50;
    
    const newFlower: FlowerData = {
        id: Date.now() + Math.random(), // Unique ID
        x,
        y,
        size,
        color,
        delay: 0, // Instant appear
        petalCount: 5 + Math.floor(Math.random() * 4),
        rotationOffset: Math.random() * 360
    };

    setFlowers(prev => [...prev, newFlower]);
  };

  const handleRemoveFlower = () => {
      // Prevent removing if we are at or below the initial count
      if (flowers.length > initialCount) {
          setFlowers(prev => prev.slice(0, -1));
      }
  };

  const handleFinishSelection = () => {
    setStage('blooming');
    // Trigger flower generation slightly after state change for clean render
    setTimeout(() => {
        generateFlowers(selectedColors);
    }, 100);
  };

  const handleReset = () => {
    setStage('selection');
    setFlowers([]);
    setSelectedColors([]);
    setInitialCount(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-white"
    >
        {/* Subtle Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
                <div 
                    key={i}
                    className="absolute rounded-full bg-gray-100 opacity-60 animate-float"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${i * 0.5}s`
                    }}
                />
            ))}
        </div>

      {/* Main Content Area */}
      <div className="z-20 w-full flex-grow flex flex-col items-center justify-center relative">
        
        {/* Intro & Selection UI */}
        {(stage === 'intro' || stage === 'selection') && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-1000">
                <IntroCard 
                    stage={stage}
                    onStart={handleStart}
                    selectedColors={selectedColors}
                    onToggleColor={handleToggleColor}
                    onFinishSelection={handleFinishSelection}
                />
            </div>
        )}

        {/* Blooming Stage Header */}
        {stage === 'blooming' && (
          <>
            {/* Top Controls */}
            <button 
              onClick={handleReset}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 z-50 cursor-pointer"
              aria-label="Restart"
              title="Restart"
            >
               <RotateCcw size={20} />
            </button>

            {/* Title & Message */}
            <div className="absolute top-12 md:top-20 text-center w-full px-4 animate-fade-in z-30 pointer-events-none">
              <h1 className="font-serif text-3xl md:text-5xl text-gray-800 mb-4 tracking-tight drop-shadow-sm">
                <span className="italic">{TITLE_TEXT.split('Tatii')[0]}</span> 
                <span className="text-pink-400 font-semibold ml-2">Tatii</span> 
                <span className="text-red-400 ml-2 text-2xl align-middle inline-block animate-pulse">
                  <Heart size={28} fill="currentColor" />
                </span>
              </h1>
              <p className="font-sans text-xs md:text-sm text-gray-400 mt-2 tracking-widest uppercase opacity-80 max-w-md mx-auto leading-relaxed">
                  {FINAL_MESSAGE}
              </p>
            </div>

            {/* Flower Controls (Bottom Right) */}
            <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 animate-fade-in">
                <button
                    onClick={handleAddFlower}
                    className="p-3 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                    title="Add Flower"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={handleRemoveFlower}
                    disabled={flowers.length <= initialCount}
                    className={`p-3 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full shadow-md transition-all transform ${
                        flowers.length <= initialCount 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg hover:bg-white hover:scale-105 active:scale-95'
                    }`}
                    title="Remove Flower"
                >
                    <Minus size={20} />
                </button>
            </div>
          </>
        )}
      </div>

      {/* Flower Layer */}
      {stage === 'blooming' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {flowers.map((f) => (
                <Flower key={f.id} {...f} />
            ))}
        </svg>
      )}

      {/* Footer / Signature */}
      {stage === 'blooming' && (
        <div className="absolute bottom-8 z-30 animate-fade-in text-center pb-4 pointer-events-none" style={{ animationDelay: '2s' }}>
            <div className="flex flex-col items-center gap-1">
                <span className="font-sans text-[10px] text-gray-400 tracking-[0.3em] uppercase">From</span>
                <span className="font-serif italic text-2xl text-gray-700 relative">
                    {SIGNATURE_TEXT}
                    <span className="absolute -right-6 top-1 text-red-300 text-sm">
                         <Heart size={14} fill="currentColor" />
                    </span>
                </span>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;