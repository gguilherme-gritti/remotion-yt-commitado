import type { TransitionPresentation } from '@remotion/transitions';
import {
  SlidePresentation,
  type SlidePresentationProps,
} from './slidePresentation';

export const SLIDE_PRESENTATION_FRAMES = 20;

export type { SlidePresentationProps };

export const slidePresentation = (
  props?: SlidePresentationProps,
): TransitionPresentation<SlidePresentationProps> => {
  return {
    component: SlidePresentation,
    props: props ?? {},
  };
};
