import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { ElementPosition, TextAnimation } from '../../types/scene';
import { getElementPositionStyle } from './elementPosition';

interface TextEmphasisProps {
  content: string;
  position: ElementPosition;
  animation: TextAnimation;
}

const CHARS_PER_SECOND = 22;

export const TextEmphasis = ({ content, position, animation }: TextEmphasisProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsPerFrame = CHARS_PER_SECOND / fps;
  const count =
    animation === 'typewriter'
      ? Math.min(content.length, Math.floor(Math.max(0, frame) * charsPerFrame))
      : content.length;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 30 }}>
      <div
        style={{
          ...getElementPositionStyle(position),
          maxWidth: '70%',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            color: '#000000',
            fontFamily: "Impact, Haettenschweiler, 'Arial Black', 'Comic Sans MS', sans-serif",
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: 1.5,
            lineHeight: 1.08,
            textTransform: 'uppercase',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            WebkitTextStroke: '4px #000000',
            paintOrder: 'stroke fill',
          }}
        >
          {content.slice(0, count)}
        </span>
      </div>
    </AbsoluteFill>
  );
};
