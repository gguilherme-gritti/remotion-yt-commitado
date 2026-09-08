import type { ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

export const ERASER_FRAMES = 22;

interface EraserWipeProps {
  durationFrames: number;
  children: ReactNode;
}

export const EraserWipe = ({ durationFrames, children }: EraserWipeProps) => {
  const frame = useCurrentFrame();
  const start = Math.max(0, durationFrames - ERASER_FRAMES);
  const end = Math.max(start + 1, durationFrames - 1);

  const progress = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const wipe = interpolate(progress, [0, 1], [0, 112]);
  const clipPath = [
    `${wipe}% 0%`,
    '100% 0%',
    '100% 100%',
    `${wipe - 6}% 100%`,
    `${wipe + 8}% 83%`,
    `${wipe - 7}% 66%`,
    `${wipe + 6}% 48%`,
    `${wipe - 5}% 30%`,
    `${wipe + 7}% 14%`,
  ].join(', ');

  return (
    <AbsoluteFill
      style={{ clipPath: progress <= 0 ? undefined : `polygon(${clipPath})` }}
    >
      {children}
    </AbsoluteFill>
  );
};
