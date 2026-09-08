import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

export const ConditionalListLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const texts = scene.elements.filter((element) => element.type === 'text');
  const images = scene.elements.filter((element) => element.type === 'image');

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

      <div
        style={{
          position: 'absolute',
          inset: '80px 80px 80px 80px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 30,
          }}
        >
          {texts.map((element, index) => (
            <TimedElement
              key={`${scene.id}-text-${index}`}
              sceneId={scene.id}
              index={index}
              videoId={videoId}
              element={element}
              inline
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 30,
          }}
        >
          {images.map((element, index) => (
            <TimedElement
              key={`${scene.id}-img-${index}`}
              sceneId={scene.id}
              index={index + 20}
              videoId={videoId}
              element={element}
              inline
              size={element.size ?? 'medium'}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
