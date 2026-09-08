import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  RADIAL_MASTER_SCALE,
  RADIAL_MASTER_SLOT_STYLE,
  RADIAL_SAFEZONE_STYLE,
  RADIAL_SATELLITE_SCALE,
  RADIAL_SATELLITE_SLOT_STYLES,
  getRadialLayoutParts,
} from './radialDefaults';

export const RadialWebLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { character, master, satellites } = getRadialLayoutParts(scene);

  return (
    <AbsoluteFill>
      <div style={RADIAL_SAFEZONE_STYLE}>
        {master ? (
          <div style={RADIAL_MASTER_SLOT_STYLE}>
            <TimedElement
              sceneId={scene.id}
              index={0}
              videoId={videoId}
              element={master}
              inline
              size="medium"
              scale={RADIAL_MASTER_SCALE}
            />
          </div>
        ) : null}

        {satellites.map((element, index) => (
          <div
            key={`${scene.id}-sat-${index}`}
            style={RADIAL_SATELLITE_SLOT_STYLES[index % RADIAL_SATELLITE_SLOT_STYLES.length]}
          >
            <TimedElement
              sceneId={scene.id}
              index={index + 1}
              videoId={videoId}
              element={element}
              inline
              size="small"
              scale={RADIAL_SATELLITE_SCALE}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
        }}
      >
        <TimedElement
          sceneId={scene.id}
          index={100}
          videoId={videoId}
          element={character}
          characterPosition="bottom_center"
        />
      </div>
    </AbsoluteFill>
  );
};
