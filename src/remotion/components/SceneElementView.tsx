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
import { getAnnotationSequenceFrom } from './annotations/AnnotationOverlay';
import { GreenCheck } from './annotations/GreenCheck';
import { RedX } from './annotations/RedX';
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
  };
}

const StandaloneAnnotation: FC<{
  element: AnnotationElement;
  position?: ElementPosition;
  scale?: number;
  inline?: boolean;
}> = ({ element, position, scale, inline = false }) => {
  const boxScale = scale ?? element.scale ?? 1;
  const size = STANDALONE_MARK_SIZE * boxScale;
  const mark = (
    <div
      style={{
        position: inline ? 'relative' : 'absolute',
        width: size,
        height: size,
        ...(inline ? undefined : getElementPositionStyle(position ?? element.position)),
      }}
    >
      {element.effect === 'green_check' ? <GreenCheck /> : <RedX />}
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
