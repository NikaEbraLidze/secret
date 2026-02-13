import React, { useEffect, useState } from 'react';

interface FlowerProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  petalCount: number;
  rotationOffset: number;
}

const Flower: React.FC<FlowerProps> = ({ x, y, size, color, delay, petalCount, rotationOffset }) => {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale(1);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Generate petals
  const petals = [];
  const centerSize = size * 0.2;
  const petalLength = size * 0.5;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360) / petalCount;
    petals.push(
      <ellipse
        key={i}
        cx="0"
        cy={-petalLength / 2}
        rx={size * 0.15}
        ry={petalLength / 2}
        fill={color}
        fillOpacity="0.9"
        transform={`rotate(${angle})`}
      />
    );
  }

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotationOffset}) scale(${scale})`}
      style={{
        transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        // No transform origin needed here as x/y are handled by parent mostly
      }}
    >
      {/* Internal stem removed. Stems are now drawn by the parent for the swaying effect */}
      
      {/* Petals Group */}
      <g>{petals}</g>

      {/* Center */}
      <circle cx="0" cy="0" r={centerSize} fill="#FFF" fillOpacity="0.9" />
      <circle cx="0" cy="0" r={centerSize * 0.6} fill="#FFD700" fillOpacity="0.8" />
    </g>
  );
};

export default Flower;