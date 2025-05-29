'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { useModelControls } from './ModelControlsContext';
import { Group, Vector3 } from 'three';
import { LuRotate3D } from 'react-icons/lu';

interface ModelProps {
  modelId: string;
  modelPath: string;
  initialPosition?: [number, number, number];
  targetPosition?: [number, number, number];
  animationSpeed?: number;
  scale?: number; // Add scale prop
}

function Model({
  modelId,
  modelPath,
  initialPosition = [0, 0, 0],
  targetPosition = [2, 1, -1],
  animationSpeed = 0.02,
  scale = 1, // Default scale
}: ModelProps) {
  const meshRef = useRef<Group>(null!);
  const { scene } = useGLTF(modelPath);
  const { updateModelPosition } = useModelControls();
  const yAnimationComplete = useRef(false);
  const xAnimationComplete = useRef(false); // Add new ref for x animation
  const animationTimer = useRef<number>(0);

  // Set initial positions when component mounts
  useEffect(() => {
    updateModelPosition(modelId, {
      original: new Vector3(...initialPosition),
      new: new Vector3(...targetPosition),
      animationSpeed,
    });
  }, [
    modelId,
    initialPosition,
    targetPosition,
    animationSpeed,
    updateModelPosition,
  ]);

  const {
    isPositionChanged,
    togglePosition,
    originalPosition,
    newPosition,
    animationSpeed: speed,
  } = useModelControls(modelId);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetPosition = isPositionChanged ? newPosition : originalPosition;

      if (modelId === 'tutup') {
        if (isPositionChanged) {
          // Moving to new position: Y first, then X/Z
          if (!yAnimationComplete.current) {
            meshRef.current.position.y =
              meshRef.current.position.y +
              (targetPosition.y - meshRef.current.position.y) * speed;

            if (
              Math.abs(meshRef.current.position.y - targetPosition.y) < 0.001
            ) {
              yAnimationComplete.current = true;
              animationTimer.current = 0;
            }
          } else {
            animationTimer.current += delta;
            if (animationTimer.current > 0.003) {
              meshRef.current.position.x =
                meshRef.current.position.x +
                (targetPosition.x - meshRef.current.position.x) * speed;
              meshRef.current.position.z =
                meshRef.current.position.z +
                (targetPosition.z - meshRef.current.position.z) * speed;
            }
          }
        } else {
          // Moving back to original position: X/Z first, then Y
          if (!xAnimationComplete.current) {
            meshRef.current.position.x =
              meshRef.current.position.x +
              (targetPosition.x - meshRef.current.position.x) * speed;
            meshRef.current.position.z =
              meshRef.current.position.z +
              (targetPosition.z - meshRef.current.position.z) * speed;

            if (
              Math.abs(meshRef.current.position.x - targetPosition.x) < 0.01
            ) {
              xAnimationComplete.current = true;
              animationTimer.current = 0;
            }
          } else {
            animationTimer.current += delta;
            if (animationTimer.current > 0.02) {
              meshRef.current.position.y =
                meshRef.current.position.y +
                (targetPosition.y - meshRef.current.position.y) * speed;
            }
          }
        }
      } else {
        // For other models, use regular lerp
        meshRef.current.position.lerp(targetPosition, speed);
      }
    }
  });

  // Reset all animation states when position changes
  useEffect(() => {
    yAnimationComplete.current = false;
    xAnimationComplete.current = false;
    animationTimer.current = 0;
  }, [isPositionChanged]);

  return (
    <primitive
      object={scene}
      ref={meshRef}
      onClick={togglePosition}
      position={originalPosition}
      scale={scale} // Add scale to primitive
    />
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-[600px] relative">
      <LuRotate3D size={50} className="absolute right-0 top-0" />
      <Canvas camera={{ position: [3, 3, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Model
          modelId="box"
          modelPath="/asset/3D/3D BOX.glb"
          initialPosition={[0, 0, 0]}
          targetPosition={[0, 0, 0]}
          animationSpeed={0.02}
          scale={20}
        />

        <Model
          modelId="charger"
          modelPath="/asset/3D/Charger.glb"
          initialPosition={[-2.258, 0, -0.97]}
          targetPosition={[-2.258, 0, -0.5]}
          animationSpeed={0.03}
          scale={20} // Make Charger 2x bigger
        />

        <Model
          modelId="tutup"
          modelPath="/asset/3D/tutup.glb"
          initialPosition={[-0.23358999, -0.059, 0.555]}
          targetPosition={[1.3358999, 0.4, 0.555]} // First moves up, then other animations
          animationSpeed={0.03}
          scale={19.8} // Make Tutup 3x bigger
        />

        <OrbitControls
          enableZoom={false}
          enablePan={true}
          //   minPolarAngle={Math.PI / 2.5}
          //   maxPolarAngle={Math.PI / 2.5}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
