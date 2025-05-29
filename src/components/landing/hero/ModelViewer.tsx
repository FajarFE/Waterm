'use client';

import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3, Object3D } from 'three';
import { useMediaQuery } from 'react-responsive';

export function Model({ src, index }: { src: string; index: number }) {
  const { scene } = useGLTF(src);
  const [computedScale, setComputedScale] = useState(1);
  const [computedPosition, setComputedPosition] = useState([0, 0, 0]);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  useEffect(() => {
    if (scene) {
      const box = new Box3().setFromObject(scene as Object3D);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      if (maxDim > 0) {
        const scale = isMobile ? (index === 1 ? 0.47 : 1.2) : 4 / maxDim;
        setComputedScale(scale);
        setComputedPosition([
          -center.x * scale,
          -center.y * scale + 1.6, // Add 1 to move model up
          -center.z * scale,
        ]);
      } else {
        setComputedScale(1);
        setComputedPosition([0, 1, 0]); // Default position moved up
      }
    }
  }, [scene, isMobile, index]); // Added missing dependencies

  return (
    <primitive
      object={scene}
      scale={computedScale}
      position={computedPosition as [number, number, number]}
    />
  );
}
