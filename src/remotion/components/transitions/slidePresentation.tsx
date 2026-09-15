import type { CSSProperties, FC } from 'react';
import type { TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill, Easing, interpolate } from 'remotion';

export type SlidePresentationProps = Record<string, never>;

export const SlidePresentation: FC<
  TransitionPresentationComponentProps<SlidePresentationProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const isExiting = presentationDirection === 'exiting';
  const translateX = interpolate(
    presentationProgress,
    [0, 1],
    isExiting ? [0, -100] : [100, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  );

  const style: CSSProperties = {
    transform: `translateX(${translateX}%)`,
    zIndex: isExiting ? 1 : 2,
  };

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
