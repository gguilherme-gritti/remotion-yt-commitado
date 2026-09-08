import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { resolveProjectImage } from '../../data/resolveAsset';
import type { ElementPosition, ImageAnimation } from '../../types/scene';
import { getSketchImagePositionStyle } from './elementPosition';
import { POP_SPRING } from './motion';

interface SketchImageProps {
  videoId: string;
  src: string;
  position: ElementPosition;
  animation: ImageAnimation;
}

export const SketchImage = ({ videoId, src, position, animation }: SketchImageProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: POP_SPRING,
  });

  const scale = animation === 'pop_in' ? interpolate(pop, [0, 1], [0.78, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) : 1;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 10 }}>
      <div style={getSketchImagePositionStyle(position)}>
        <Img
          src={resolveProjectImage(videoId, src)}
          style={{
            display: 'block',
            width: 420,
            maxWidth: 450,
            maxHeight: 450,
            height: 'auto',
            objectFit: 'contain',
            backgroundColor: 'transparent',
            mixBlendMode: 'multiply',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
