import type { FC } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { MangaSpeedLines } from '../effects/MangaSpeedLines';
import { POP_SPRING } from '../../utils/motion';
import { usePacing } from '../../utils/usePacing';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  IMPACT_FOCUS_STYLE,
  IMPACT_FONT_SIZE,
  IMPACT_IMAGE_SIZE,
  IMPACT_STAGE_STYLE,
  getMangaImpactLayoutParts,
} from '../defaults/mangaImpactDefaults';

export const MangaImpactLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { entryFrames } = usePacing();
  const { focus } = getMangaImpactLayoutParts(scene);

  const pop = spring({
    frame: Math.max(0, frame - focus.startAtFrame),
    fps,
    durationInFrames: entryFrames,
    config: POP_SPRING,
  });
  const scale = interpolate(pop, [0, 1], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(pop, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {frame >= focus.startAtFrame ? <MangaSpeedLines /> : null}
      <AbsoluteFill
        style={{
          ...IMPACT_STAGE_STYLE,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          mixBlendMode: 'multiply',
        }}
      >
        <div style={IMPACT_FOCUS_STYLE}>
          <TimedElement
            sceneId={scene.id}
            index={0}
            videoId={videoId}
            element={focus}
            inline={focus.type !== 'character'}
            characterPosition={focus.type === 'character' ? 'center' : undefined}
            position="center"
            size={focus.type === 'image' ? IMPACT_IMAGE_SIZE : undefined}
            fontSize={focus.type === 'text' ? IMPACT_FONT_SIZE : undefined}
            textAlign={focus.type === 'text' ? 'center' : undefined}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
