import type { ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DRAW_SPRING } from './motion';

interface DrawInMaskProps {
  children: ReactNode;
  fill?: boolean;
}

export const DrawInMask = ({ children, fill = false }: DrawInMaskProps) => {
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
        display: fill ? 'flex' : 'inline-flex',
        width: fill ? '100%' : undefined,
        height: fill ? '100%' : undefined,
        clipPath: `inset(${clipTop}% 0% 0% 0%)`,
      }}
    >
      {children}
    </div>
  );
};
