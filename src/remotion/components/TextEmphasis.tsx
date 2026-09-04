import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TextEmphasisAnimation, TextEmphasisPosition } from '../../types/scene';
import { getShakeOffset, INK_SPRING } from './motion';

interface TextEmphasisProps {
  text: string;
  animation: TextEmphasisAnimation;
  position: TextEmphasisPosition;
}

export const TextEmphasis = ({ text, animation, position }: TextEmphasisProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: Math.max(0, frame - 3),
    fps,
    config: INK_SPRING,
  });

  const shakeIntensity =
    animation === 'shake' ? 10 : animation === 'glitch' ? 14 : 1.6;

  const shake = getShakeOffset(frame, shakeIntensity * Math.min(1, appear));
  const glitchSlice = animation === 'glitch' ? Math.sin(frame * 4.2) * 8 : 0;

  const originX = position === 'left' || position === 'right' ? 0 : -50;
  const originY = position === 'center' ? -50 : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          ...POSITIONS[position],
          transform: `translate(${originX}%, ${originY}%) translate(${shake.x + glitchSlice}px, ${shake.y}px) scale(${appear})`,
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#ffffff',
            border: '4px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            padding: '16px 28px 18px',
            transform: 'rotate(-2deg)',
            opacity: interpolate(appear, [0, 0.15], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <span
            style={{
              display: 'block',
              color: '#000000',
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', 'Comic Sans MS', sans-serif",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: 3,
              lineHeight: 0.95,
              textTransform: 'uppercase',
            }}
          >
            {text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const POSITIONS: Record<TextEmphasisPosition, CSSProperties> = {
  center: { top: '42%', left: '50%' },
  top: { top: 64, left: '50%' },
  bottom: { bottom: 80, left: '50%' },
  left: { top: '38%', left: 80 },
  right: { top: '36%', right: 420 },
};
