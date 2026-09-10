import type { FC } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type {
  AnnotationElement,
  CharacterPosition,
  ElementPosition,
  ImageSize,
  SceneElement,
  SceneSchema,
} from '../../types/scene';
import { AnnotationMark, getAnnotationSequenceFrom } from './annotations/AnnotationOverlay';
import {
  DRAWN_ARROW_HEIGHT,
  DRAWN_ARROW_MAX_HEIGHT,
  DRAWN_ARROW_MAX_WIDTH,
  DRAWN_ARROW_WIDTH,
} from './annotations/DrawnArrow';
import { Character } from './Character';
import { getElementPositionStyle } from './elementPosition';
import { SketchImage } from './SketchImage';
import { TextEmphasis } from './TextEmphasis';

const STANDALONE_MARK_SIZE = 360;

export interface BoardLayoutProps {
  videoId: string;
  scene: SceneSchema;
}

export interface SceneElementViewProps {
  videoId: string;
  element: SceneElement;
  inline?: boolean;
  position?: ElementPosition;
  characterPosition?: CharacterPosition;
  size?: ImageSize;
  scale?: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  nowrap?: boolean;
  letterSpacing?: number;
}

function annotationProps(element: SceneElement) {
  return {
    annotation: element.annotation,
    annotationFrom: getAnnotationSequenceFrom(
      element.startAtFrame,
      element.annotationStartFrame,
    ),
    annotationColor: element.highlightColor ?? element.annotationColor,
    annotationDirection: element.annotationDirection,
  };
}

const StandaloneAnnotation: FC<{
  element: AnnotationElement;
  position?: ElementPosition;
  scale?: number;
  inline?: boolean;
}> = ({ element, position, scale, inline = false }) => {
  const boxScale = scale ?? element.scale ?? 1;
  const isArrow = element.effect === 'drawn_arrow';
  const isHighlight = element.effect === 'highlight';
  const width =
    (isArrow ? DRAWN_ARROW_WIDTH : isHighlight ? 520 : STANDALONE_MARK_SIZE) *
    boxScale;
  const height =
    (isArrow ? DRAWN_ARROW_HEIGHT : isHighlight ? 72 : STANDALONE_MARK_SIZE) *
    boxScale;
  const mark = (
    <div
      style={{
        position: inline ? 'relative' : 'absolute',
        width,
        height,
        maxWidth: isArrow ? DRAWN_ARROW_MAX_WIDTH : undefined,
        maxHeight: isArrow ? DRAWN_ARROW_MAX_HEIGHT : undefined,
        ...(inline ? undefined : getElementPositionStyle(position ?? element.position)),
      }}
    >
      <AnnotationMark
        annotation={element.effect}
        color={element.highlightColor ?? element.annotationColor}
        direction={element.annotationDirection}
      />
    </div>
  );

  if (inline) {
    return mark;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 60 }}>
      {mark}
    </AbsoluteFill>
  );
};

export const SceneElementView: FC<SceneElementViewProps> = ({
  videoId,
  element,
  inline = false,
  position,
  characterPosition,
  size,
  scale,
  fontSize,
  textAlign,
  color,
  strokeColor,
  strokeWidth,
  nowrap,
  letterSpacing,
}) => {
  const overlay = annotationProps(element);

  switch (element.type) {
    case 'character':
      return (
        <Character
          pose={element.pose}
          animation={element.animation}
          position={characterPosition ?? element.position ?? 'bottom_right'}
          {...overlay}
          lineBoil={element.lineBoil}
        />
      );
    case 'image':
      return (
        <SketchImage
          videoId={videoId}
          src={element.src}
          position={position ?? element.position}
          animation={element.animation}
          size={size ?? element.size}
          scale={scale ?? element.scale}
          inline={inline}
          {...overlay}
          lineBoil={element.lineBoil}
        />
      );
    case 'text':
      return (
        <TextEmphasis
          content={element.content}
          position={position ?? element.position}
          animation={element.animation}
          inline={inline}
          fontSize={fontSize}
          textAlign={textAlign}
          color={color}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          nowrap={nowrap}
          letterSpacing={letterSpacing}
          {...overlay}
          lineBoil={element.lineBoil}
        />
      );
    case 'annotation':
      return (
        <StandaloneAnnotation
          element={element}
          position={position}
          scale={scale}
          inline={inline}
        />
      );
  }
};

export const TimedElement: FC<
  SceneElementViewProps & { sceneId: string; index: number }
> = ({ sceneId, index, element, ...viewProps }) => {
  return (
    <Sequence
      layout={viewProps.inline ? 'none' : 'absolute-fill'}
      from={Math.max(0, element.startAtFrame)}
      name={`${sceneId}-${element.type}-${index}`}
    >
      <SceneElementView element={element} {...viewProps} />
    </Sequence>
  );
};
