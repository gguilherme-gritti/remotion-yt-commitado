import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

export const SplitLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const board = scene.elements.filter((element) => element.type !== 'character');
  const splitAt = Math.ceil(board.length / 2);
  const left = board.slice(0, splitAt);
  const right = board.slice(splitAt);

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
          inset: '80px 60px 80px 60px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: 40,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {left.map((element, index) => (
            <TimedElement
              key={`${scene.id}-left-${index}`}
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
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {right.map((element, index) => (
            <TimedElement
              key={`${scene.id}-right-${index}`}
              sceneId={scene.id}
              index={index + 20}
              videoId={videoId}
              element={element}
              inline
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
