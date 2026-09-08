import { AbsoluteFill, Img } from 'remotion';
import { resolveCharacterSrc } from '../../data/resolveAsset';
import type { CharacterAnimation } from '../../types/scene';
import { DrawInMask } from './DrawInMask';

interface CharacterOverlayProps {
  pose: string;
  animation: CharacterAnimation;
}

export const CharacterOverlay = ({ pose, animation }: CharacterOverlayProps) => {
  const portrait = (
    <Img
      src={resolveCharacterSrc(pose)}
      style={{
        display: 'block',
        height: 540,
        maxHeight: '100%',
        width: 'auto',
        maxWidth: 480,
        objectFit: 'contain',
        objectPosition: 'bottom right',
        mixBlendMode: 'multiply',
      }}
    />
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40, overflow: 'visible' }}>
      <div
        style={{
          position: 'absolute',
          right: 40,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          overflow: 'visible',
        }}
      >
        {animation === 'draw_in' ? <DrawInMask>{portrait}</DrawInMask> : portrait}
      </div>
    </AbsoluteFill>
  );
};
