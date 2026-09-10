import { AbsoluteFill, Img } from 'remotion';
import { resolveCharacterSrc } from '../../data/resolveAsset';
import type {
  AnnotationKind,
  CharacterAnimation,
  CharacterPosition,
} from '../../types/scene';
import { AnnotatedBox } from './annotations/AnnotationOverlay';
import { DrawInMask } from './DrawInMask';
import { getCharacterLayoutStyle } from './elementPosition';

interface CharacterProps {
  pose: string;
  animation: CharacterAnimation;
  position?: CharacterPosition;
  annotation?: AnnotationKind;
  annotationFrom?: number;
}

export const Character = ({
  pose,
  animation,
  position = 'bottom_right',
  annotation,
  annotationFrom,
}: CharacterProps) => {
  const layout = getCharacterLayoutStyle(position);

  const fillsParent = position === 'left_giant' || position === 'center';
  const portrait = (
    <Img src={resolveCharacterSrc(pose)} style={layout.image} />
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40, overflow: 'visible' }}>
      <div style={layout.wrapper}>
        <AnnotatedBox
          annotation={annotation}
          annotationFrom={annotationFrom}
          fill={fillsParent}
        >
          {animation === 'draw_in' ? (
            <DrawInMask fill={fillsParent}>{portrait}</DrawInMask>
          ) : (
            portrait
          )}
        </AnnotatedBox>
      </div>
    </AbsoluteFill>
  );
};
