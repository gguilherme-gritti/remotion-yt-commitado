import { createContext, useContext, type ReactNode } from 'react';
import type { SceneSchema } from '../../types/scene';
import {
  DEFAULT_PACING,
  PACING_PRESETS,
  getPacingPreset,
  type PacingPreset,
} from './pacing';

const PacingContext = createContext<PacingPreset>(PACING_PRESETS[DEFAULT_PACING]);

export function PacingProvider({
  scene,
  children,
}: {
  scene: Pick<SceneSchema, 'pacing' | 'breathFrames'>;
  children: ReactNode;
}) {
  return (
    <PacingContext.Provider value={getPacingPreset(scene)}>
      {children}
    </PacingContext.Provider>
  );
}

export function usePacing(): PacingPreset {
  return useContext(PacingContext);
}
