import React from 'react';
import { INTRO_TEXT, COLOR_PALETTE, MAX_SELECTION } from '../constants';
import { ColorOption } from '../types';

interface IntroCardProps {
  stage: 'intro' | 'selection';
  onStart: () => void;
  selectedColors: string[];
  onToggleColor: (hex: string) => void;
  onFinishSelection: () => void;
}

const IntroCard: React.FC<IntroCardProps> = ({
  stage,
  onStart,
  selectedColors,
  onToggleColor,
  onFinishSelection,
}) => {
  if (stage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center animate-fade-in z-10">
        <h1 className="font-serif text-3xl text-gray-800 mb-6 leading-relaxed">
          Hello Tatii.
        </h1>
        <p className="font-sans font-light text-gray-500 mb-10 text-lg leading-relaxed">
          {INTRO_TEXT}
        </p>
        <button
          onClick={onStart}
          className="px-8 py-3 bg-gray-900 text-white font-sans text-sm tracking-widest uppercase rounded-full hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Begin
        </button>
      </div>
    );
  }

  // Selection Stage
  const remaining = MAX_SELECTION - selectedColors.length;

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center animate-fade-in z-10 w-full">
      <h2 className="font-serif text-2xl text-gray-800 mb-2">
        Pick {MAX_SELECTION} colors
      </h2>
      <p className="font-sans text-sm text-gray-400 mb-8 h-6">
        {remaining === 0 ? "Perfect." : `${remaining} more to go...`}
      </p>

      <div className="grid grid-cols-5 gap-4 mb-10">
        {COLOR_PALETTE.map((color: ColorOption) => {
          const isSelected = selectedColors.includes(color.hex);
          return (
            <button
              key={color.id}
              onClick={() => onToggleColor(color.hex)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 relative focus:outline-none`}
              style={{
                backgroundColor: color.hex,
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 0 0 2px white, 0 0 0 4px ${color.hex}`
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                opacity: (selectedColors.length >= MAX_SELECTION && !isSelected) ? 0.5 : 1
              }}
            >
               {isSelected && (
                 <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                   ✓
                 </span>
               )}
            </button>
          );
        })}
      </div>

      {remaining === 0 && (
        <button
          onClick={onFinishSelection}
          className="px-8 py-3 bg-gray-900 text-white font-sans text-sm tracking-widest uppercase rounded-full hover:bg-gray-700 transition-all duration-300 shadow-lg animate-bounce"
        >
          Bloom
        </button>
      )}
    </div>
  );
};

export default IntroCard;