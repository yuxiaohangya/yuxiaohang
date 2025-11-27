import React, { useState, useEffect } from 'react';
import { PlanetData, InteractionState } from '../types';
import { PLANETS } from '../constants';
import { Move, Activity, Globe, Zap, Cpu, Wifi } from 'lucide-react';

interface HUDLayerProps {
  focusedPlanet: string;
  interactionState: InteractionState;
  fps: number;
}

export const HUDLayer: React.FC<HUDLayerProps> = ({ focusedPlanet, interactionState, fps }) => {
  const [time, setTime] = useState('');
  const [hexStream, setHexStream] = useState<string[]>([]);
  const currentPlanetData = PLANETS.find(p => p.name === focusedPlanet) || PLANETS[0];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Manual formatting used because 'fractionalSecondDigits' might not be in the TS lib definition
      const timePart = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const msPart = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
      setTime(`${timePart}.${msPart}`);
    }, 50);

    const hexTimer = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
      setHexStream(prev => [hex, ...prev.slice(0, 8)]);
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(hexTimer);
    };
  }, []);

  // Calculate style for draggable panel based on right hand
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    left: interactionState.rightHandDetected && interactionState.isPinchingRight 
      ? interactionState.dragPosition.x 
      : 'auto',
    top: interactionState.rightHandDetected && interactionState.isPinchingRight 
      ? interactionState.dragPosition.y 
      : '20%',
    right: interactionState.rightHandDetected && interactionState.isPinchingRight 
      ? 'auto' 
      : '2rem',
    transform: interactionState.rightHandDetected && interactionState.isPinchingRight
      ? 'translate(-50%, -50%)'
      : 'none',
    transition: interactionState.isPinchingRight ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: interactionState.isPinchingRight ? 'grabbing' : 'grab'
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-6 select-none flex flex-col justify-between overflow-hidden">
      
      {/* --- TOP HEADER --- */}
      <div className="flex justify-between items-start">
        {/* Left: System Stats & Hex Stream */}
        <div className="flex flex-col gap-2">
          <div className="border border-cyan-500/50 bg-black/40 p-2 rounded backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,255,0.2)]">
            <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
              <Cpu size={14} /> <span>CPU_LOAD: {Math.floor(Math.random() * 30 + 10)}%</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
              <Activity size={14} /> <span>FPS: {fps}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs">
              <Wifi size={14} /> <span>NET: SECURE</span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-700 font-mono leading-tight opacity-70 mt-2">
            {hexStream.map((hex, i) => (
              <div key={i} style={{ opacity: 1 - i * 0.1 }}>0x{hex}</div>
            ))}
          </div>
        </div>

        {/* Right: Title & Time */}
        <div className="text-right">
          <h1 className="text-4xl font-bold text-cyan-400 tracking-tighter drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] animate-pulse">
            鱼小航 W.Y.H.C.Z.X.T)
          </h1>
          <div className="text-2xl text-cyan-200 font-mono mt-1 border-b border-cyan-500/50 inline-block px-2">
            {time}
          </div>
          <div className="text-xs text-cyan-600 mt-1 animate-bounce">
             SYSTEM ONLINE /// AWAITING INPUT
          </div>
        </div>
      </div>

      {/* --- DRAGGABLE INFO PANEL (RIGHT) --- */}
      <div 
        style={panelStyle}
        className="w-72 bg-black/60 border-l-2 border-r-2 border-cyan-500 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(0,255,255,0.3)] relative group pointer-events-auto"
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white"></div>
        
        <h2 className="text-xl text-cyan-300 font-bold mb-2 flex items-center gap-2 border-b border-cyan-500/30 pb-1">
          <Globe size={18} />
          {currentPlanetData.name}
        </h2>
        
        <div className="space-y-3 text-cyan-100/90 text-sm font-light">
          <p className="text-xs text-cyan-400/80 uppercase tracking-widest mb-1">DATA_LOG</p>
          <p>{currentPlanetData.description}</p>
          
          <div className="grid grid-cols-2 gap-2 mt-3 bg-cyan-900/20 p-2 rounded">
            <div>
              <span className="text-[10px] text-cyan-500 block">TEMP</span>
              <span className="font-mono">{currentPlanetData.temperature}</span>
            </div>
            <div>
              <span className="text-[10px] text-cyan-500 block">GRAVITY</span>
              <span className="font-mono">{currentPlanetData.gravity}</span>
            </div>
             <div>
              <span className="text-[10px] text-cyan-500 block">DIST</span>
              <span className="font-mono">{currentPlanetData.distance} AU</span>
            </div>
          </div>
        </div>

        <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 text-[10px] text-cyan-800 font-bold tracking-[0.3em]">
          TARGET_LOCKED
        </div>
      </div>

      {/* --- BOTTOM STATUS --- */}
      <div className="flex items-end justify-between w-full">
        {/* Left Hand Status */}
        <div className={`transition-all duration-300 border border-cyan-500/40 p-3 rounded bg-black/50 ${interactionState.leftHandDetected ? 'shadow-[0_0_10px_#00ffff]' : 'opacity-50'}`}>
          <div className="flex items-center gap-2 mb-1">
             <Zap size={16} className={interactionState.leftHandDetected ? "text-yellow-400" : "text-gray-500"} />
             <span className="text-cyan-400 text-sm font-bold">L-HAND: NAV</span>
          </div>
          <div className="text-[10px] text-cyan-600 font-mono">
             ACTION: {interactionState.leftHandDetected ? 'ROTATION / ZOOM' : 'SEARCHING...'}
          </div>
          {/* Zoom Bar */}
           <div className="w-32 h-1 bg-gray-800 mt-2 rounded overflow-hidden">
             <div 
               className="h-full bg-cyan-400 transition-all duration-100" 
               style={{ width: `${(interactionState.scale - 0.5) / 2.5 * 100}%` }}
             ></div>
           </div>
        </div>

        {/* Right Hand Status */}
        <div className={`transition-all duration-300 border border-cyan-500/40 p-3 rounded bg-black/50 ${interactionState.rightHandDetected ? 'shadow-[0_0_10px_#00ffff]' : 'opacity-50'}`}>
           <div className="flex items-center gap-2 mb-1">
             <Move size={16} className={interactionState.rightHandDetected ? "text-yellow-400" : "text-gray-500"} />
             <span className="text-cyan-400 text-sm font-bold">R-HAND: INTERACT</span>
          </div>
          <div className="text-[10px] text-cyan-600 font-mono">
             STATE: {interactionState.isPinchingRight ? 'DRAGGING [LOCKED]' : 'HOVER'}
          </div>
        </div>
      </div>
    </div>
  );
};