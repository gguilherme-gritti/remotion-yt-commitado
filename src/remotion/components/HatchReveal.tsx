import type { CSSProperties, ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { PanelEffect } from '../../types/scene';
import { INK_SPRING } from './motion';

interface HatchRevealProps {
  effect: PanelEffect;
  children: ReactNode;
}

export const HatchReveal = ({ effect, children }: HatchRevealProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const raw = spring({
    frame,
    fps,
    config: INK_SPRING,
  });

  const progress = interpolate(raw, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (effect === 'hard-cut') {
    return <div style={fill}>{children}</div>;
  }

  if (effect === 'tear-slide') {
    const slide = interpolate(progress, [0, 1], [108, 0]);
    const tear = [
      `${slide}% 0%`,
      '100% 0%',
      '100% 100%',
      `${slide - 4}% 100%`,
      `${slide + 3}% 82%`,
      `${slide - 5}% 64%`,
      `${slide + 4}% 46%`,
      `${slide - 3}% 28%`,
      `${slide + 2}% 12%`,
    ].join(', ');

    return (
      <div style={{ ...fill, clipPath: `polygon(${tear})` }}>{children}</div>
    );
  }

  const open = interpolate(progress, [0, 1], [0, 14]);

  return (
    <div
      style={{
        ...fill,
        WebkitMaskImage: `repeating-linear-gradient(-45deg, #000 0px, #000 ${open}px, transparent ${open}px, transparent 14px)`,
        maskImage: `repeating-linear-gradient(-45deg, #000 0px, #000 ${open}px, transparent ${open}px, transparent 14px)`,
      }}
    >
      {children}
    </div>
  );
};

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};
