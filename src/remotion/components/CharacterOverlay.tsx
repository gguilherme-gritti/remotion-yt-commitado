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
        height: 480,
        width: 'auto',
        mixBlendMode: 'multiply',
      }}
    />
  );

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40 }}>
      <div
        style={{
          position: 'absolute',
          right: '2%',
          bottom: 0,
        }}
      >
        {animation === 'draw_in' ? <DrawInMask>{portrait}</DrawInMask> : portrait}
      </div>
    </AbsoluteFill>
  );
};
