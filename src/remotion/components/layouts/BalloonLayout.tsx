import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { ImageElement } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

function isBalloonImage(element: ImageElement): boolean {
  const haystack = `${element.src} ${element.imageIdea}`.toLowerCase();
  return /bala[oõ]|speech|fala|bubble/.test(haystack);
}

export const BalloonLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const images = scene.elements.filter((element): element is ImageElement => element.type === 'image');
  const balloon = images.find(isBalloonImage) ?? images.find((element) => element.size === 'hero' || element.size === 'large');
  const inner = scene.elements.filter((element) => {
    if (element.type === 'character') {
      return false;
    }
    return element !== balloon;
  });

  return (
    <AbsoluteFill>
      {characters.map((element, index) => (
        <TimedElement
          key={`${scene.id}-char-${index}`}
          sceneId={scene.id}
          index={index}
          videoId={videoId}
          element={element}
          characterPosition="bottom_left"
        />
      ))}

      {balloon ? (
        <TimedElement
          sceneId={scene.id}
          index={0}
          videoId={videoId}
          element={balloon}
          position="top_center"
          size={balloon.size ?? 'hero'}
        />
      ) : null}

      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '22%',
          width: '56%',
          height: '48%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          zIndex: 20,
        }}
      >
        {inner.map((element, index) => (
          <TimedElement
            key={`${scene.id}-inner-${index}`}
            sceneId={scene.id}
            index={index + 10}
            videoId={videoId}
            element={element}
            inline
            size={element.type === 'image' ? element.size ?? 'small' : undefined}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
