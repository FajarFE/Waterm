'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vector3 } from 'three';

// Define model positions type
type Position = {
  original: Vector3;
  new: Vector3;
  animationSpeed?: number;
};

type ModelPositions = {
  [key: string]: Position;
};

// Update context type
interface ModelControlsContextType {
  isPositionChanged: boolean;
  isFlipped: boolean; // Add this
  togglePosition: () => void;
  toggleFlip: () => void; // Add this
  modelPositions: ModelPositions;
  currentModel: string;
  setCurrentModel: (model: string) => void;
  updateModelPosition: (modelId: string, position: Partial<Position>) => void;
}

const defaultPositions: ModelPositions = {
  box: {
    original: new Vector3(0, 0, 0),
    new: new Vector3(2, 1, -1),
    animationSpeed: 0.02,
  },
  charger: {
    original: new Vector3(-2, 0, 0),
    new: new Vector3(2, 2, 2),
    animationSpeed: 0.03,
  },
  tutup: {
    original: new Vector3(2, 0, 0),
    new: new Vector3(-2, 1, 1),
    animationSpeed: 0.01,
  },
};

const ModelControlsContext = createContext<
  ModelControlsContextType | undefined
>(undefined);

export function ModelControlsProvider({ children }: { children: ReactNode }) {
  const [isPositionChanged, setIsPositionChanged] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false); // Add this
  const [currentModel, setCurrentModel] = useState<string>('box');
  const [modelPositions, setModelPositions] =
    useState<ModelPositions>(defaultPositions);

  const togglePosition = () => {
    setIsPositionChanged((prev) => !prev);
  };

  const toggleFlip = () => {
    // Add this
    setIsFlipped((prev) => !prev);
  };

  const updateModelPosition = (
    modelId: string,
    position: Partial<Position>,
  ) => {
    setModelPositions((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        ...position,
      },
    }));
  };

  return (
    <ModelControlsContext.Provider
      value={{
        isPositionChanged,
        isFlipped,
        togglePosition,
        toggleFlip,
        modelPositions,
        currentModel,
        setCurrentModel,
        updateModelPosition,
      }}
    >
      {children}
    </ModelControlsContext.Provider>
  );
}

export function useModelControls(modelId?: string) {
  const context = useContext(ModelControlsContext);
  if (!context) {
    throw new Error(
      'useModelControls must be used within ModelControlsProvider',
    );
  }

  const { modelPositions, isPositionChanged, isFlipped } = context;
  const currentPositions = modelPositions[modelId || context.currentModel];
  const targetPosition = isPositionChanged
    ? currentPositions.new
    : currentPositions.original;

  return {
    ...context,
    originalPosition: currentPositions.original,
    newPosition: currentPositions.new,
    targetPosition: isFlipped
      ? targetPosition.clone().negate()
      : targetPosition,
    animationSpeed: currentPositions.animationSpeed || 0.02,
  };
}
