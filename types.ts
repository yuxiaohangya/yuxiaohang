export interface HandLandmarkerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
  worldLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
  handedness: Array<{ index: number; score: number; categoryName: string; displayName: string }>;
}

export interface PlanetData {
  name: string;
  color: string;
  distance: number; // Distance from center
  size: number;
  speed: number;
  description: string;
  temperature: string;
  gravity: string;
}

export interface SystemState {
  fps: number;
  cpuLoad: number;
  memory: number;
  networkStatus: 'ONLINE' | 'OFFLINE' | 'WARN';
}

export interface InteractionState {
  leftHandDetected: boolean;
  rightHandDetected: boolean;
  isPinchingRight: boolean;
  isPinchingLeft: boolean;
  rotation: { x: number; y: number };
  scale: number;
  dragPosition: { x: number; y: number };
}
