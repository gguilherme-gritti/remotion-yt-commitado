import type { TransitionPresentation } from '@remotion/transitions';
import {
  ErasePresentation,
  type ErasePresentationProps,
} from './erasePresentation';

/** Tempo suficiente para cada passada diagonal ser lida como um gesto separado. */
export const ERASE_PRESENTATION_FRAMES = 42;
export const ERASER_FRAMES = ERASE_PRESENTATION_FRAMES;

export type { ErasePresentationProps };

export const erasePresentation = (
  props?: ErasePresentationProps,
): TransitionPresentation<ErasePresentationProps> => {
  return {
    component: ErasePresentation,
    props: props ?? {},
  };
};
