'use client';

import { ModelControlsProvider } from './ModelControlsContext';
import ThreeScene from './ThreeScene';

export default function ThreeSceneWrapper() {
  return (
    <div className="w-full">
      <ModelControlsProvider>
        <ThreeScene />
      </ModelControlsProvider>
    </div>
  );
}

export * from './ThreeScene';
export * from './ModelControlsContext';
