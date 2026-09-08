import type { ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DRAW_SPRING } from './motion';

interface DrawInMaskProps {
  children: ReactNode;
}

export const DrawInMask = ({ children }: DrawInMaskProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    config: DRAW_SPRING,
  });

  const clipTop = interpolate(reveal, [0, 1], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        clipPath: `inset(${clipTop}% 0% 0% 0%)`,
      }}
    >
      {children}
    </div>
  );
};
