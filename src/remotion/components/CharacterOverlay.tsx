import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CharacterPose } from '../../types/scene';
import { INK_SPRING } from './motion';
import { SpeedLines } from './SpeedLines';

interface CharacterOverlayProps {
  characterPose: CharacterPose;
}

export const CharacterOverlay = ({ characterPose }: CharacterOverlayProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: INK_SPRING,
  });

  const lift = interpolate(enter, [0, 1], [28, 0], {
    extrapolateRight: 'clamp',
  });

  const impact = interpolate(enter, [0, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <SpeedLines intensity={impact} />
      <Img
        src={staticFile(`characters/${characterPose}.png`)}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 40,
          height: '58%',
          width: 'auto',
          transform: `translateY(${lift}px)`,
          filter: 'drop-shadow(4px 4px 0px #000) drop-shadow(-2px -2px 0px #fff)',
        }}
      />
    </AbsoluteFill>
  );
};
