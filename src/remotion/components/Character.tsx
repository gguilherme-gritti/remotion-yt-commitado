import { AbsoluteFill, Img } from 'remotion';
import { resolveCharacterSrc } from '../../data/resolveAsset';
import type {
  AnnotationDirection,
  AnnotationKind,
  CharacterAnimation,
  CharacterPosition,
} from '../../types/scene';
import { AnnotatedBox } from './annotations/AnnotationOverlay';
import { DrawInMask } from './DrawInMask';
import { LineBoil } from './effects/LineBoilFilter';
import { getCharacterLayoutStyle } from './elementPosition';

interface CharacterProps {
  pose: string;
  animation: CharacterAnimation;
  position?: CharacterPosition;
  inline?: boolean;
  annotation?: AnnotationKind;
  annotationFrom?: number;
  annotationColor?: string;
  annotationDirection?: AnnotationDirection;
  lineBoil?: boolean;
}

export const Character = ({
  pose,
  animation,
  position = 'bottom_right',
  inline = false,
  annotation,
  annotationFrom,
  annotationColor,
  annotationDirection,
  lineBoil = true,
}: CharacterProps) => {
  const layout = getCharacterLayoutStyle(position);

  const fillsParent = position === 'left_giant' || position === 'center';
  const portrait = (
    <LineBoil enabled={lineBoil} fill={fillsParent} mixBlendMode="multiply">
      <Img src={resolveCharacterSrc(pose)} style={layout.image} />
    </LineBoil>
  );

  const box = (
    <div
      style={
        inline
          ? {
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              overflow: 'visible',
            }
          : layout.wrapper
      }
    >
      <AnnotatedBox
        annotation={annotation}
        annotationFrom={annotationFrom}
        annotationColor={annotationColor}
        annotationDirection={annotationDirection}
        fill={fillsParent}
      >
        {animation === 'draw_in' ? (
          <DrawInMask fill={fillsParent}>{portrait}</DrawInMask>
        ) : (
          portrait
        )}
      </AnnotatedBox>
    </div>
  );

  if (inline) {
    return box;
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: annotation && annotation !== 'none' ? 55 : 40,
        overflow: 'visible',
      }}
    >
      {box}
    </AbsoluteFill>
  );
};
