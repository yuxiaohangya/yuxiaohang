import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HandLandmarker } from '@mediapipe/tasks-vision';
import { createHandLandmarker } from './services/mediapipeService';
import { HologramSystem } from './components/HologramSystem';
import { HUDLayer } from './components/HUDLayer';
import { InteractionState } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // High-performance refs for animation loop
  const interactionRef = useRef<InteractionState>({
    leftHandDetected: false,
    rightHandDetected: false,
    isPinchingRight: false,
    isPinchingLeft: false,
    rotation: { x: 0, y: 0 },
    scale: 1,
    dragPosition: { x: 0, y: 0 }
  });

  // React state for UI updates (lower frequency)
  const [uiState, setUiState] = useState<InteractionState>(interactionRef.current);
  const [focusedPlanet, setFocusedPlanet] = useState<string>('SOL');
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const prevTime = useRef(performance.now());

  // Setup Camera and MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        const landmarker = await createHandLandmarker();
        handLandmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error initializing camera or mediapipe:", err);
      }
    };

    init();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Main Loop
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;

    if (!video || !canvas || !landmarker) return;

    // FPS Calculation
    frames.current++;
    const now = performance.now();
    if (now - prevTime.current >= 1000) {
      setFps(frames.current);
      frames.current = 0;
      prevTime.current = now;
      // Sync UI state occasionally
      setUiState({ ...interactionRef.current });
    }

    // Process Frame
    if (video.currentTime > 0 && !video.paused && !video.ended) {
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset detections
        interactionRef.current.leftHandDetected = false;
        interactionRef.current.rightHandDetected = false;

        if (results.landmarks) {
          for (const [index, landmarks] of results.landmarks.entries()) {
            // Draw Skeleton
            drawHandSkeleton(ctx, landmarks);

            // Determine handedness (MediaPipe 'Left' is typically user's right in mirrored selfie mode, need to check)
            // Note: MediaPipe handedness is based on the perspective of the camera usually.
            // If we mirror the video via CSS, visual left is left.
            // However, MediaPipe logic: "Left" label usually means left hand.
            const classification = results.handedness[index][0];
            const isLeftHand = classification.categoryName === 'Left'; 
            const isRightHand = classification.categoryName === 'Right';

            // Interaction Logic
            if (isLeftHand) {
              interactionRef.current.leftHandDetected = true;
              
              // 1. Rotation (Palm Center)
              const p9 = landmarks[9]; // Middle finger knuckle
              // Map x (0-1) to rotation (-1 to 1)
              interactionRef.current.rotation.x = (p9.y - 0.5) * 2; // Up/Down
              interactionRef.current.rotation.y = (p9.x - 0.5) * 4; // Left/Right (amplified)

              // 2. Zoom (Thumb tip 4 to Index tip 8 distance)
              const p4 = landmarks[4];
              const p8 = landmarks[8];
              const distance = Math.hypot(p4.x - p8.x, p4.y - p8.y);
              // Map distance (approx 0.02 to 0.2) to scale (0.5 to 2.5)
              interactionRef.current.scale = Math.max(0.5, Math.min(3, distance * 10));
            } 
            
            if (isRightHand) {
              interactionRef.current.rightHandDetected = true;

              // 3. Pinch Detection for Dragging
              const p4 = landmarks[4];
              const p8 = landmarks[8];
              const distance = Math.hypot(p4.x - p8.x, p4.y - p8.y);
              const isPinching = distance < 0.05; // Threshold
              
              interactionRef.current.isPinchingRight = isPinching;
              if (isPinching) {
                // Update drag position (mapped to screen coordinates)
                // Need to mirror X because of CSS transform
                interactionRef.current.dragPosition = {
                  x: (1 - p8.x) * window.innerWidth, // Mirror logic
                  y: p8.y * window.innerHeight
                };
              }
            }
          }
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const drawHandSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.strokeStyle = COLORS.CYAN;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.CYAN;

    // Finger connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      // Mirror X drawing because video is mirrored
      ctx.beginPath();
      ctx.moveTo((1 - p1.x) * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo((1 - p2.x) * ctx.canvas.width, p2.y * ctx.canvas.height);
      ctx.stroke();
    });

    // Draw joints
    ctx.fillStyle = "#FFFFFF";
    landmarks.forEach((p) => {
      ctx.beginPath();
      ctx.arc((1 - p.x) * ctx.canvas.width, p.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 1. Camera Feed Layer (Mirrored) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-60 contrast-125 brightness-75 filter grayscale-[0.3]"
      />
      
      {/* 2. Scanlines & Vignette */}
      <div className="scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* 3. Hand Skeleton Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* 4. 3D Hologram Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <HologramSystem 
            rotation={interactionRef.current.rotation}
            scale={interactionRef.current.scale}
            onPlanetFocus={setFocusedPlanet}
          />
        </Canvas>
      </div>

      {/* 5. UI HUD Layer */}
      <HUDLayer 
        focusedPlanet={focusedPlanet}
        interactionState={uiState}
        fps={fps}
      />
    </div>
  );
};

export default App;
