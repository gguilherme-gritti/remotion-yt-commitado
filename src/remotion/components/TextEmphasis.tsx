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

  const isCenter = position === 'center';

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 30 }}>
      <div
        style={
          isCenter
            ? {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '80%',
              }
            : {
                ...getElementPositionStyle(position),
                maxWidth: '70%',
              }
        }
      >
        <span
          style={{
            display: 'block',
            width: '100%',
            color: '#000000',
            fontFamily: "'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', cursive",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '2px',
            lineHeight: 1.25,
            textAlign: isCenter ? 'center' : 'left',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {content.slice(0, count)}
        </span>
      </div>
    </AbsoluteFill>
  );
};
