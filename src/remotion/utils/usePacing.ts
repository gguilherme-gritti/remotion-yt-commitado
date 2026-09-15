import { createContext, useContext } from 'react';
import {
  DEFAULT_PACING,
  PACING_PRESETS,
  type PacingPreset,
} from './pacing';

export const PacingContext = createContext<PacingPreset>(
  PACING_PRESETS[DEFAULT_PACING],
);

export function usePacing(): PacingPreset {
  return useContext(PacingContext);
}
