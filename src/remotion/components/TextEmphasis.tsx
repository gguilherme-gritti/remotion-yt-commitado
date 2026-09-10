import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {
  AnnotationDirection,
  AnnotationKind,
  ElementPosition,
  TextAnimation,
} from '../../types/scene';
import { AnnotatedBox } from './annotations/AnnotationOverlay';
import { getElementPositionStyle } from './elementPosition';
import { ANIME_ACE_FONT_FAMILY } from '../loadAnimeAceFont';

interface TextEmphasisProps {
  content: string;
  position: ElementPosition;
  animation: TextAnimation;
  inline?: boolean;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  nowrap?: boolean;
  letterSpacing?: number;
  annotation?: AnnotationKind;
  annotationFrom?: number;
  annotationColor?: string;
  annotationDirection?: AnnotationDirection;
}

export const TYPEWRITER_CHARS_PER_SECOND = 22;

export const TextEmphasis = ({
  content,
  position,
  animation,
  inline = false,
  fontSize,
  textAlign,
  color = '#000000',
  strokeColor,
  strokeWidth,
  nowrap = false,
  letterSpacing,
  annotation,
  annotationFrom,
  annotationColor,
  annotationDirection,
}: TextEmphasisProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsPerFrame = TYPEWRITER_CHARS_PER_SECOND / fps;
  const count =
    animation === 'typewriter'
      ? Math.min(content.length, Math.floor(Math.max(0, frame) * charsPerFrame))
      : content.length;

  const isCenter = position === 'center';

  const text = (
    <AnnotatedBox
      annotation={annotation}
      annotationFrom={annotationFrom}
      annotationColor={annotationColor}
      annotationDirection={annotationDirection}
    >
      <span
        style={{
          display: nowrap ? 'inline-block' : 'block',
          width: inline || nowrap ? 'auto' : '100%',
          color,
          WebkitTextStroke:
            strokeColor && strokeWidth
              ? `${strokeWidth}px ${strokeColor}`
              : undefined,
          paintOrder: strokeColor ? 'stroke fill' : undefined,
          fontFamily: `'${ANIME_ACE_FONT_FAMILY}', 'Anime Ace 2.0 BB', sans-serif`,
          fontSize: fontSize ?? (inline ? 48 : 72),
          fontWeight: 700,
          letterSpacing: letterSpacing != null ? `${letterSpacing}px` : '2px',
          lineHeight: 1.25,
          textAlign: textAlign ?? (isCenter || inline ? 'center' : 'left'),
          whiteSpace: nowrap ? 'nowrap' : 'pre-wrap',
          overflowWrap: nowrap ? 'normal' : 'anywhere',
        }}
      >
        {content.slice(0, count)}
      </span>
    </AnnotatedBox>
  );

  if (inline) {
    return text;
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: annotation && annotation !== 'none' ? 55 : 30,
      }}
    >
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
