import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
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
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50, overflow: 'visible' }}>
      <SpeedLines intensity={impact} />
      <Img
        src={staticFile(`characters/${characterPose}.svg`)}
        style={{
          position: 'absolute',
          right: '2%',
          bottom: 0,
          height: 370,
          width: 'auto',
          zIndex: 50,
          transform: `translateY(${lift}px)`,
          filter: 'drop-shadow(6px 6px 0px #000000)',
        }}
      />
    </AbsoluteFill>
  );
};
