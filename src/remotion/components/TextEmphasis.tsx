import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TextEmphasisAnimation } from '../../types/scene';
import { INK_SPRING } from './motion';

interface TextEmphasisProps {
  text: string;
  animation: TextEmphasisAnimation;
}

const TEXT_DELAY_FRAMES = 12;

export const TextEmphasis = ({ text }: TextEmphasisProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - TEXT_DELAY_FRAMES,
    fps,
    config: INK_SPRING,
  });

  const visible = interpolate(appear, [0, 0.15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100, overflow: 'visible' }}>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '3%',
          left: 'auto',
          zIndex: 100,
          width: '28%',
          maxWidth: '28%',
          transform: `scale(${appear})`,
          transformOrigin: 'right top',
          opacity: visible,
        }}
      >
        <div
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#000000',
            border: '4px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            padding: '14px 28px',
          }}
        >
          <span
            style={{
              display: 'block',
              color: '#ffffff',
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', 'Comic Sans MS', sans-serif",
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: 2,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
