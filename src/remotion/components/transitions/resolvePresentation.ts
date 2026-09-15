import type { TransitionPresentation } from '@remotion/transitions';
import type { TransitionType } from '../../../types/scene';
import { erasePresentation } from './erase';
import type { ErasePresentationProps } from './erasePresentation';
import { slidePresentation } from './slide';
import type { SlidePresentationProps } from './slidePresentation';

export function presentationFor(
  type: TransitionType,
): TransitionPresentation<ErasePresentationProps> | TransitionPresentation<SlidePresentationProps> {
  if (type === 'slide') {
    return slidePresentation();
  }

  return erasePresentation();
}
