import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { ElementPosition, ImageElement, ImageSize } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

const CORNERS: ElementPosition[] = ['top_left', 'top_right', 'bottom_left', 'bottom_right'];

const SIZE_RANK: Record<ImageSize, number> = {
  small: 0,
  medium: 1,
  large: 2,
  hero: 3,
};

function pickMaster(images: ImageElement[]): ImageElement | undefined {
  if (images.length === 0) {
    return undefined;
  }

  const ranked = [...images].sort((a, b) => {
    const sizeRank = SIZE_RANK[b.size ?? 'medium'] - SIZE_RANK[a.size ?? 'medium'];
    if (sizeRank !== 0) {
      return sizeRank;
    }
    if (a.position === 'center') {
      return -1;
    }
    if (b.position === 'center') {
      return 1;
    }
    return a.startAtFrame - b.startAtFrame;
  });

  return ranked[0];
}

export const RadialWebLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const images = scene.elements.filter((element): element is ImageElement => element.type === 'image');
  const master = pickMaster(images);
  const satellites = scene.elements.filter((element) => element !== master && element.type !== 'character');

  return (
    <AbsoluteFill>
      {characters.map((element, index) => (
        <TimedElement
          key={`${scene.id}-char-${index}`}
          sceneId={scene.id}
          index={index}
          videoId={videoId}
          element={element}
        />
      ))}

      {master ? (
        <TimedElement
          sceneId={scene.id}
          index={0}
          videoId={videoId}
          element={master}
          position="center"
          size={master.size ?? 'large'}
        />
      ) : null}

      {satellites.map((element, index) => (
        <TimedElement
          key={`${scene.id}-sat-${index}`}
          sceneId={scene.id}
          index={index + 1}
          videoId={videoId}
          element={element}
          position={CORNERS[index % CORNERS.length]}
          size={element.type === 'image' ? element.size ?? 'small' : undefined}
        />
      ))}
    </AbsoluteFill>
  );
};
