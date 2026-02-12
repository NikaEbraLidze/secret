import React, { useState, useEffect, useRef } from 'react';
import { AppStage, FlowerData } from './types';
import { MAX_SELECTION, TITLE_TEXT, SIGNATURE_TEXT, FINAL_MESSAGE } from './constants';
import IntroCard from './components/IntroCard';
import Flower from './components/Flower';
import { Heart } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('intro');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
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
  };

  const handleFinishSelection = () => {
    setStage('blooming');
    // Trigger flower generation slightly after state change for clean render
    setTimeout(() => {
        generateFlowers(selectedColors);
    }, 100);
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
          <div className="absolute top-12 md:top-20 text-center w-full px-4 animate-fade-in z-30 pointer-events-none">
            <h1 className="font-serif text-3xl md:text-5xl text-gray-800 mb-4 tracking-tight drop-shadow-sm">
              <span className="italic">{TITLE_TEXT.split('Tati')[0]}</span> 
              <span className="text-pink-400 font-semibold ml-2">Tati</span> 
              <span className="text-red-400 ml-2 text-2xl align-middle inline-block animate-pulse">
                <Heart size={28} fill="currentColor" />
              </span>
            </h1>
            <p className="font-sans text-xs md:text-sm text-gray-400 mt-2 tracking-widest uppercase opacity-80 max-w-md mx-auto leading-relaxed">
                {FINAL_MESSAGE}
            </p>
          </div>
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
        <div className="absolute bottom-8 z-30 animate-fade-in text-center pb-4" style={{ animationDelay: '2s' }}>
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