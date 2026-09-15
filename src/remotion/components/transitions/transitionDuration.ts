import type { TransitionType } from '../../../types/scene';
import { ERASE_PRESENTATION_FRAMES } from './erase';
import { SLIDE_PRESENTATION_FRAMES } from './slide';

export const DEFAULT_TRANSITION_TYPE: TransitionType = 'erase';

export function resolveTransitionType(type?: TransitionType): TransitionType {
  return type ?? DEFAULT_TRANSITION_TYPE;
}

export function getTransitionDurationFrames(type?: TransitionType): number {
  switch (resolveTransitionType(type)) {
    case 'slide':
      return SLIDE_PRESENTATION_FRAMES;
    case 'none':
      return 0;
    case 'erase':
      return ERASE_PRESENTATION_FRAMES;
  }
}
