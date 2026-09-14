import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import { sequenceFreeformLayout } from './freeformDefaults';

export const FreeformLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { elements } = sequenceFreeformLayout(scene);

  return (
    <AbsoluteFill>
      {elements.map((element, index) =>
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
