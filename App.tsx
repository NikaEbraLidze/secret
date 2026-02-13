import React, { useState, useEffect, useRef } from 'react';
import { AppStage, FlowerData } from './types';
import { MAX_SELECTION, TITLE_TEXT, SIGNATURE_TEXT, FINAL_MESSAGE } from './constants';
import IntroCard from './components/IntroCard';
import Flower from './components/Flower';
import { Heart, RotateCcw, Plus, Minus, X } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>('intro');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [initialCount, setInitialCount] = useState<number>(0);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background particles
  const [particles, setParticles] = useState<{x:number, y:number, size:number}[]>([]);

  useEffect(() => {
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

  // Generate a position that looks like it's growing from a central bush
  const getPlantPosition = (width: number, height: number, index: number, total: number) => {
    const cx = width / 2;
    const bottomY = height * 0.9; // Start near bottom
    
    // Spread calculation: Fanning out from -60 degrees to +60 degrees
    const angleSpread = Math.PI / 1.5; // 120 degrees total spread
    const baseAngle = -Math.PI / 2; // Pointing up
    
    // Random angle
    const randomAngle = baseAngle + (Math.random() - 0.5) * angleSpread;
    
    // Height of the stem varies
    const stemLength = height * 0.3 + Math.random() * (height * 0.3);

    const x = cx + Math.cos(randomAngle) * stemLength;
    const y = bottomY + Math.sin(randomAngle) * stemLength;

    return { x, y, startX: cx, startY: bottomY };
  };

  const generateFlowers = (colors: string[]) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const newFlowers: FlowerData[] = [];
    const count = 15; // A nice full bush

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const pos = getPlantPosition(width, height, i, count);
      
      const size = 30 + Math.random() * 30;

      newFlowers.push({
        id: i,
        x: pos.x,
        y: pos.y,
        size,
        color,
        delay: i * 100 + Math.random() * 300,
        petalCount: 5 + Math.floor(Math.random() * 4),
        rotationOffset: Math.random() * 360
      });
    }
    setFlowers(newFlowers);
    setInitialCount(count);
  };

  const handleAddFlower = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current || selectedColors.length === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();

    const color = selectedColors[Math.floor(Math.random() * selectedColors.length)];
    const pos = getPlantPosition(width, height, 0, 1);
    const size = 30 + Math.random() * 30;
    
    const newFlower: FlowerData = {
        id: Date.now() + Math.random(),
        x: pos.x,
        y: pos.y,
        size,
        color,
        delay: 0,
        petalCount: 5 + Math.floor(Math.random() * 4),
        rotationOffset: Math.random() * 360
    };

    setFlowers(prev => [...prev, newFlower]);
  };

  const handleRemoveFlower = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (flowers.length > initialCount) {
          setFlowers(prev => prev.slice(0, -1));
      }
  };

  const handleFinishSelection = () => {
    setStage('blooming');
    setTimeout(() => {
        generateFlowers(selectedColors);
    }, 100);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStage('selection');
    setFlowers([]);
    setSelectedColors([]);
    setInitialCount(0);
    setIsLetterOpen(false);
  };

  const handleGlobalClick = () => {
      if (stage === 'blooming' && !isLetterOpen) {
          setIsLetterOpen(true);
      }
  };

  // Helper function to calculate point and rotation on bezier curve
  const getBezierData = (t: number, sx:number, sy:number, cx:number, cy:number, ex:number, ey:number) => {
      const inv = 1 - t;
      const x = inv * inv * sx + 2 * inv * t * cx + t * t * ex;
      const y = inv * inv * sy + 2 * inv * t * cy + t * t * ey;
      
      // Derivative for angle (tangent)
      const dx = 2 * inv * (cx - sx) + 2 * t * (ex - cx);
      const dy = 2 * inv * (cy - sy) + 2 * t * (ey - cy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      return { x, y, angle };
  };

  // Screen center for stem origin calculation
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const originX = screenW / 2;
  const originY = screenH * 0.95; 

  return (
    <div 
      ref={containerRef}
      onClick={handleGlobalClick}
      className={`relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-white ${stage === 'blooming' && !isLetterOpen ? 'cursor-pointer' : ''}`}
    >
        {/* CSS for Sway Animation */}
        <style>{`
            @keyframes sway {
                0% { transform: rotate(-2deg); }
                50% { transform: rotate(2deg); }
                100% { transform: rotate(-2deg); }
            }
            .sway-animation {
                animation: sway 6s ease-in-out infinite;
                transform-origin: center 95%;
            }
        `}</style>

        {/* Background Particles */}
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
      <div className="z-20 w-full flex-grow flex flex-col items-center justify-center relative pointer-events-none">
        
        {/* Intro & Selection UI */}
        {(stage === 'intro' || stage === 'selection') && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-1000 pointer-events-auto cursor-default">
                <IntroCard 
                    stage={stage}
                    onStart={handleStart}
                    selectedColors={selectedColors}
                    onToggleColor={handleToggleColor}
                    onFinishSelection={handleFinishSelection}
                />
            </div>
        )}

        {/* Controls */}
        {stage === 'blooming' && (
          <>
            <button 
              onClick={handleReset}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-gray-300 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 z-50 cursor-pointer pointer-events-auto"
              title="Restart"
            >
               <RotateCcw size={20} />
            </button>

            <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 animate-fade-in pointer-events-auto">
                <button
                    onClick={handleAddFlower}
                    className="p-3 bg-white/80 backdrop-blur-sm text-gray-600 rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all transform hover:scale-105 active:scale-95"
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
                >
                    <Minus size={20} />
                </button>
            </div>
            
            {/* Hint Text */}
            {!isLetterOpen && (
                <div className="absolute top-20 md:top-32 left-0 right-0 text-center pointer-events-none animate-pulse opacity-40 z-40">
                    <p className="font-serif text-gray-400 italic text-sm tracking-widest">Tap anywhere to read...</p>
                </div>
            )}
          </>
        )}
      </div>

      {/* Plant Layer - Single Swaying Group */}
      {stage === 'blooming' && (
          <svg className="absolute inset-0 w-full h-full z-10 overflow-visible pointer-events-none">
              <g className="sway-animation">
                  {flowers.map((f, i) => {
                      const startX = originX;
                      const startY = originY;
                      const endX = f.x;
                      const endY = f.y;
                      const controlX = startX + (endX - startX) * 0.2;
                      const controlY = startY - (startY - endY) * 0.5;
                      
                      // Calculate leaf positions deterministically based on ID/Index
                      const hasLeaf1 = (f.id % 2) === 0;
                      const hasLeaf2 = (f.id % 3) !== 0;
                      
                      const t1 = 0.35 + ((f.id * 13) % 15) / 100; // Random t between 0.35 and 0.5
                      const t2 = 0.65 + ((f.id * 7) % 15) / 100; // Random t between 0.65 and 0.8
                      
                      const leaf1Data = getBezierData(t1, startX, startY, controlX, controlY, endX, endY);
                      const leaf2Data = getBezierData(t2, startX, startY, controlX, controlY, endX, endY);

                      return (
                          <React.Fragment key={f.id}>
                              {/* Stem */}
                              <path 
                                  d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                                  stroke="#6B8E23" // Olive green
                                  strokeWidth={f.size > 40 ? 3 : 2}
                                  strokeLinecap="round"
                                  fill="none"
                                  opacity="0.9"
                                  className="transition-all duration-1000"
                              />

                              {/* Leaf 1 */}
                              {hasLeaf1 && (
                                  <path 
                                    d="M 0 0 Q 15 -10 30 0 Q 15 10 0 0" 
                                    fill="#6B8E23" 
                                    opacity="0.9"
                                    transform={`translate(${leaf1Data.x}, ${leaf1Data.y}) rotate(${leaf1Data.angle - 45}) scale(${0.4 + (f.id % 4)/10})`}
                                  />
                              )}

                              {/* Leaf 2 - Opposite Side */}
                              {hasLeaf2 && (
                                  <path 
                                    d="M 0 0 Q 15 -10 30 0 Q 15 10 0 0" 
                                    fill="#556B2F" // Slightly darker
                                    opacity="0.9"
                                    transform={`translate(${leaf2Data.x}, ${leaf2Data.y}) rotate(${leaf2Data.angle + 135}) scale(${0.3 + (f.id % 5)/10})`}
                                  />
                              )}

                              <Flower {...f} />
                          </React.Fragment>
                      );
                  })}
              </g>
          </svg>
      )}

      {/* Letter Modal */}
      {isLetterOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsLetterOpen(false)}>
              <div 
                className="bg-white p-8 md:p-12 max-w-lg w-full shadow-2xl rounded-sm relative transform transition-all animate-float cursor-default"
                onClick={(e) => e.stopPropagation()} 
              >
                  <button 
                    onClick={() => setIsLetterOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                  >
                      <X size={24} />
                  </button>

                  <div className="text-center">
                      <h1 className="font-serif text-3xl md:text-4xl text-gray-800 mb-6 tracking-tight leading-snug">
                        <span className="italic">{TITLE_TEXT.split('Tatii')[0]}</span> 
                        <span className="text-pink-400 font-semibold ml-2">Tatii</span> 
                      </h1>
                      
                      <div className="w-16 h-[1px] bg-gray-200 mx-auto mb-6"></div>

                      <p className="font-sans text-gray-600 text-lg leading-relaxed mb-10">
                          {FINAL_MESSAGE}
                      </p>

                      <div className="flex flex-col items-center gap-2 mt-8">
                        <span className="font-sans text-xs text-gray-400 tracking-[0.3em] uppercase">From</span>
                        <span className="font-serif italic text-2xl text-gray-800 relative">
                            {SIGNATURE_TEXT}
                            <span className="absolute -right-6 top-1 text-red-400 text-sm animate-pulse">
                                <Heart size={16} fill="currentColor" />
                            </span>
                        </span>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;