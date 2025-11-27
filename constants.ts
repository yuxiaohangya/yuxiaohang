import { PlanetData } from './types';

export const COLORS = {
  CYAN: '#00FFFF',
  CYAN_DIM: 'rgba(0, 255, 255, 0.2)',
  RED_ALERT: '#FF3333',
  bgDark: '#000505',
};

export const PLANETS: PlanetData[] = [
  { 
    name: 'SOL (太阳)', 
    color: '#FFD700', 
    distance: 0, 
    size: 2.5, 
    speed: 0,
    description: 'G2V型主序星，太阳系核心。',
    temperature: '5778 K',
    gravity: '274 m/s²'
  },
  { 
    name: 'MERCURY (水星)', 
    color: '#A5A5A5', 
    distance: 4, 
    size: 0.5, 
    speed: 0.8,
    description: '最接近太阳，表面温差极大。',
    temperature: '440 K',
    gravity: '3.7 m/s²'
  },
  { 
    name: 'VENUS (金星)', 
    color: '#E3BB76', 
    distance: 6, 
    size: 0.9, 
    speed: 0.6,
    description: '浓厚大气层，温室效应严重。',
    temperature: '737 K',
    gravity: '8.87 m/s²'
  },
  { 
    name: 'EARTH (地球)', 
    color: '#22A6B3', 
    distance: 8, 
    size: 1, 
    speed: 0.4,
    description: '已知唯一孕育生命的行星。',
    temperature: '288 K',
    gravity: '9.8 m/s²'
  },
  { 
    name: 'MARS (火星)', 
    color: '#EB4D4B', 
    distance: 11, 
    size: 0.7, 
    speed: 0.3,
    description: '红色星球，也是本次任务目的地。',
    temperature: '210 K',
    gravity: '3.71 m/s²'
  },
];

export const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm';
