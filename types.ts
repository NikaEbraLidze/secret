export type AppStage = 'intro' | 'selection' | 'blooming';

export interface FlowerData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  petalCount: number;
  rotationOffset: number;
}

export interface ColorOption {
  id: string;
  hex: string;
  name: string;
}