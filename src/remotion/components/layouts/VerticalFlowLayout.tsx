import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { ElementPosition } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

const FLOW_SLOTS: ElementPosition[] = ['top_center', 'center', 'bottom_center'];

export const VerticalFlowLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const flow = scene.elements.filter((element) => element.type !== 'character');

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

      {flow.map((element, index) => (
        <TimedElement
          key={`${scene.id}-flow-${index}`}
          sceneId={scene.id}
          index={index + 10}
          videoId={videoId}
          element={element}
          position={FLOW_SLOTS[index % FLOW_SLOTS.length]}
        />
      ))}
    </AbsoluteFill>
  );
};
