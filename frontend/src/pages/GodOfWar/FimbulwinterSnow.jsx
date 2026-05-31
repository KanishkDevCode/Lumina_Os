import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom Shader Material for the Snow Particles
const SnowShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color('#ffffff') },
    // Optional depth texture for soft particles (depth fade)
    // depthTexture: { value: null },
    // resolution: { value: new THREE.Vector2() },
    // cameraNear: { value: 0.1 },
    // cameraFar: { value: 100.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      
      // Extract instance position from instanceMatrix
      vec3 instancePosition = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      
      // Extract instance scale (assuming uniform scale for simplicity)
      float scale = length(vec3(instanceMatrix[0][0], instanceMatrix[1][0], instanceMatrix[2][0]));
      
      // BILLBOARDING: 
      // We take the modelViewMatrix and multiply it by the instance position to get the camera-space center.
      // Then we add the local vertex position (scaled) directly in camera space. 
      // This ensures the plane always faces the camera exactly.
      vec4 mvPosition = modelViewMatrix * vec4(instancePosition, 1.0);
      mvPosition.xy += position.xy * scale;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying vec2 vUv;
    
    void main() {
      // Center coordinates from -1 to 1
      vec2 cUv = vUv * 2.0 - 1.0;
      
      // Distance from center
      float dist = length(cUv);
      
      // Procedural shape: Soft circle (snowflake core)
      // Using smoothstep for a soft feathered edge
      float alpha = 1.0 - smoothstep(0.1, 0.8, dist);
      
      // Procedural Hexagonal Star (Dendrite) overlay
      // Calculate angle for the star pattern
      float angle = atan(cUv.y, cUv.x);
      // 6-pointed star using cosine
      float star = cos(angle * 6.0) * 0.5 + 0.5;
      // Shrink the star based on distance
      float starAlpha = smoothstep(0.8, 0.2, dist + star * 0.4);
      
      // Combine circle core and star edge
      float finalAlpha = max(alpha, starAlpha * 0.6);
      
      // Prevent rendering completely transparent pixels
      if (finalAlpha < 0.01) discard;
      
      // (Optional) Depth Fade calculation would go here if depth textures were bound
      
      gl_FragColor = vec4(color, finalAlpha * 0.8);
    }
  `
};

export default function FimbulwinterSnow({ 
  count = 7000, 
  axePosition = new THREE.Vector3(0, -100, 0), // Default far away
  axeVelocity = new THREE.Vector3(0, 0, 0)
}) {
  const meshRef = useRef();
  
  // Arrays for physics state (using Float32Array for better memory/cache performance)
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const phases = new Float32Array(count * 3); // For chaotic wind oscillation
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread across a 60x40x60 volume
      pos[i3] = (Math.random() - 0.5) * 60;     // x
      pos[i3 + 1] = Math.random() * 40;         // y (starts from 0 to 40)
      pos[i3 + 2] = (Math.random() - 0.5) * 60; // z
      
      // Base falling velocity
      vel[i3] = (Math.random() - 0.5) * 0.5;    // vx
      vel[i3 + 1] = -Math.random() * 2 - 1.0;   // vy (downward gravity)
      vel[i3 + 2] = (Math.random() - 0.5) * 0.5; // vz
      
      // Phase offsets for sine wave wind calculations
      phases[i3] = Math.random() * Math.PI * 2;
      phases[i3 + 1] = Math.random() * Math.PI * 2;
      phases[i3 + 2] = Math.random() * Math.PI * 2;
      
      // Size variance
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    return { pos, vel, phases, sizes };
  }, [count]);

  // Shader material uniform reference
  const materialRef = useRef();

  // 🚀 OPTIMIZATION: Initialize the scales once, so we don't have to calculate them every frame
  useEffect(() => {
    if (!meshRef.current) return;
    
    const { sizes } = particles;
    const dummyObj = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      dummyObj.position.set(0, 0, 0);
      dummyObj.scale.setScalar(sizes[i]);
      dummyObj.updateMatrix();
      meshRef.current.setMatrixAt(i, dummyObj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, particles]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    if (materialRef.current) materialRef.current.uniforms.time.value = time;
    
    // Clamp delta to prevent massive jumps during lag spikes
    const dt = Math.min(delta, 0.1);
    
    const { pos, vel, phases, sizes } = particles;
    const axeSpeed = axeVelocity.length();
    const isAxeMovingFast = axeSpeed > 15; // Threshold for axe slipstream effect

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      let px = pos[i3];
      let py = pos[i3 + 1];
      let pz = pos[i3 + 2];
      
      // --- 1. Base Physics (Gravity & Wind) ---
      // Multi-frequency sine waves simulate turbulent curl noise wind
      const windX = Math.sin(time * 0.5 + phases[i3]) * 1.5 + Math.cos(time * 1.2 + phases[i3+1]) * 0.5;
      const windZ = Math.cos(time * 0.6 + phases[i3+2]) * 1.5 + Math.sin(time * 1.1 + phases[i3]) * 0.5;
      
      // Apply base velocities
      px += (vel[i3] + windX) * dt;
      py += vel[i3 + 1] * dt;
      pz += (vel[i3 + 2] + windZ) * dt;
      
      // --- 2. Axe Slipstream Interaction ---
      if (isAxeMovingFast) {
        // Distance squared is faster than full distance calculation
        const dx = axePosition.x - px;
        const dy = axePosition.y - py;
        const dz = axePosition.z - pz;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        // Influence radius (e.g., 8 units -> 64 distSq)
        if (distSq < 64.0) {
          const dist = Math.sqrt(distSq);
          // Stronger pull when closer, factoring in axe speed
          const pullStrength = (1.0 - dist / 8.0) * axeSpeed * 0.5;
          
          // Pull particle towards the axe
          px += (dx / dist) * pullStrength * dt;
          py += (dy / dist) * pullStrength * dt;
          pz += (dz / dist) * pullStrength * dt;
          
          // Impart some of the axe's forward velocity (swirling slipstream)
          px += axeVelocity.x * pullStrength * 0.1 * dt;
          py += axeVelocity.y * pullStrength * 0.1 * dt;
          pz += axeVelocity.z * pullStrength * 0.1 * dt;
        }
      }
      
      // --- 3. Particle Recycling ---
      if (py < -5) {
        py = 35 + Math.random() * 5; // Reset high above
        px = (Math.random() - 0.5) * 60;
        pz = (Math.random() - 0.5) * 60;
      }
      
      // Write back
      pos[i3] = px;
      pos[i3 + 1] = py;
      pos[i3 + 2] = pz;
      
      // --- 4. Update Matrix (🚀 DIRECT MEMORY INJECTION) ---
      // We skip THREE.js object overhead and write directly to the GPU buffer
      const matrixArray = meshRef.current.instanceMatrix.array;
      const offset = i * 16;
      matrixArray[offset + 12] = px; // Translation X
      matrixArray[offset + 13] = py; // Translation Y
      matrixArray[offset + 14] = pz; // Translation Z
    }
    
    // Notify Three.js that the instance matrices have changed
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      {/* 2D Plane geometry for custom procedural shader */}
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        args={[SnowShaderMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
