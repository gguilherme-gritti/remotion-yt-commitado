import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

export const FreeformLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  return (
    <AbsoluteFill>
      {scene.elements.map((element, index) =>
        element.type === 'annotation' ? null : (
          <TimedElement
            key={`${scene.id}-${element.type}-${index}`}
            sceneId={scene.id}
            index={index}
            videoId={videoId}
            element={element}
          />
        ),
      )}
    </AbsoluteFill>
  );
};
