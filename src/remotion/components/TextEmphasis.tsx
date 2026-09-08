import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { ElementPosition, TextAnimation } from '../../types/scene';
import { getElementPositionStyle } from './elementPosition';
import { ANIME_ACE_FONT_FAMILY } from '../loadAnimeAceFont';

interface TextEmphasisProps {
  content: string;
  position: ElementPosition;
  animation: TextAnimation;
  inline?: boolean;
}

const CHARS_PER_SECOND = 22;

export const TextEmphasis = ({ content, position, animation, inline = false }: TextEmphasisProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsPerFrame = CHARS_PER_SECOND / fps;
  const count =
    animation === 'typewriter'
      ? Math.min(content.length, Math.floor(Math.max(0, frame) * charsPerFrame))
      : content.length;

  const isCenter = position === 'center';

  const text = (
    <span
      style={{
        display: 'block',
        width: inline ? 'auto' : '100%',
        color: '#000000',
        fontFamily: `'${ANIME_ACE_FONT_FAMILY}', 'Anime Ace 2.0 BB', sans-serif`,
        fontSize: inline ? 48 : 72,
        fontWeight: 700,
        letterSpacing: '2px',
        lineHeight: 1.25,
        textAlign: isCenter || inline ? 'center' : 'left',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {content.slice(0, count)}
    </span>
  );

  if (inline) {
    return text;
  }

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
        {text}
      </div>
    </AbsoluteFill>
  );
};
