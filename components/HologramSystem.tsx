import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, COLORS } from '../constants';

interface HologramSystemProps {
  rotation: { x: number; y: number };
  scale: number;
  onPlanetFocus: (planetName: string) => void;
}

export const HologramSystem: React.FC<HologramSystemProps> = ({ rotation, scale, onPlanetFocus }) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetsRef = useRef<THREE.Group[]>([]);
  
  // Create orbit lines geometry
  const orbits = useMemo(() => {
    return PLANETS.map(planet => {
      if (planet.distance === 0) return null;
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * planet.distance, 0, Math.sin(angle) * planet.distance));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      return { geometry: lineGeometry, distance: planet.distance };
    });
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth LERP for interaction transforms
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x * 0.5, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y + state.clock.getElapsedTime() * 0.05, 0.1);
    
    // Scale limiting
    const targetScale = THREE.MathUtils.clamp(scale, 0.5, 3);
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Animate planets
    planetsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const planet = PLANETS[i];
      // Orbit rotation
      const angle = state.clock.getElapsedTime() * planet.speed * 0.2;
      mesh.position.x = Math.cos(angle) * planet.distance;
      mesh.position.z = Math.sin(angle) * planet.distance;
      
      // Self rotation
      mesh.rotation.y += 0.01;
    });

    // Calculate focused planet based on rotation
    // Normalize rotation Y to find which sector is facing "forward" (Camera is at Z positive)
    // Simplified: Just highlight the one closest to Z+ after group rotation
    let closestZ = -Infinity;
    let closestName = "";
    
    planetsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      // Get world position
      const worldPos = mesh.getWorldPosition(new THREE.Vector3());
      if (worldPos.z > closestZ) {
        closestZ = worldPos.z;
        closestName = PLANETS[i].name;
      }
    });

    if (closestName) {
      onPlanetFocus(closestName);
    }
  });

  return (
    <group ref={groupRef} position={[-2, 0, 0]} rotation={[0.4, 0, 0]}>
      {/* Central glow */}
      <pointLight position={[0, 0, 0]} intensity={2} color={COLORS.CYAN} distance={20} decay={2} />
      
      {PLANETS.map((planet, index) => (
        <group key={planet.name} ref={el => { if (el) planetsRef.current[index] = el }}>
           {/* Wireframe Sphere representing the planet */}
          <Sphere args={[planet.size, 16, 16]}>
            <meshBasicMaterial 
              color={planet.name.includes('SOL') ? '#ffff00' : COLORS.CYAN} 
              wireframe 
              transparent 
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>
          
          {/* Inner solid core for better visibility */}
          <Sphere args={[planet.size * 0.8, 16, 16]}>
            <meshBasicMaterial 
              color={planet.color} 
              transparent 
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>
          
          {/* Label */}
          <Html position={[0, planet.size + 0.5, 0]} center distanceFactor={15}>
            <div className="text-[10px] text-cyan-400 font-mono tracking-widest whitespace-nowrap opacity-70">
              {planet.name}
            </div>
          </Html>
        </group>
      ))}

      {/* Orbits */}
      {orbits.map((orbit, i) => (
        orbit && (
          <line geometry={orbit.geometry} key={`orbit-${i}`}>
            <lineBasicMaterial color={COLORS.CYAN} transparent opacity={0.15} />
          </line>
        )
      ))}
      
      {/* Grid Floor for reference */}
      <gridHelper args={[30, 30, COLORS.CYAN_DIM, COLORS.CYAN_DIM]} position={[0, -2, 0]} />
    </group>
  );
};
