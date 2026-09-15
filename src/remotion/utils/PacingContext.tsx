import type { ReactNode } from 'react';
import type { SceneSchema } from '../../types/scene';
import { getPacingPreset } from './pacing';
import { PacingContext } from './usePacing';

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
