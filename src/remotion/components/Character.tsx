import { AbsoluteFill, Img } from 'remotion';
import { resolveCharacterSrc } from '../../data/resolveAsset';
import type { CharacterAnimation, CharacterPosition } from '../../types/scene';
import { DrawInMask } from './DrawInMask';
import { getCharacterLayoutStyle } from './elementPosition';

interface CharacterProps {
  pose: string;
  animation: CharacterAnimation;
  position?: CharacterPosition;
}

export const Character = ({
  pose,
  animation,
  position = 'bottom_right',
}: CharacterProps) => {
  const layout = getCharacterLayoutStyle(position);

  const fillsParent = position === 'left_giant' || position === 'center';
  const portrait = (
    <Img src={resolveCharacterSrc(pose)} style={layout.image} />
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40, overflow: 'visible' }}>
      <div style={layout.wrapper}>
        {animation === 'draw_in' ? (
          <DrawInMask fill={fillsParent}>{portrait}</DrawInMask>
        ) : (
          portrait
        )}
      </div>
    </AbsoluteFill>
  );
};
