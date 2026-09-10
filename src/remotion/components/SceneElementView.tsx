import type { FC } from 'react';
import { Sequence } from 'remotion';
import type {
  CharacterPosition,
  ElementPosition,
  ImageSize,
  SceneElement,
  SceneSchema,
} from '../../types/scene';
import { Character } from './Character';
import { SketchImage } from './SketchImage';
import { TextEmphasis } from './TextEmphasis';

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
  switch (element.type) {
    case 'character':
      return (
        <Character
          pose={element.pose}
          animation={element.animation}
          position={characterPosition ?? element.position ?? 'bottom_right'}
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
