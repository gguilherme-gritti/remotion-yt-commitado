import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { SceneElement } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';

function isQuestionText(element: SceneElement): boolean {
  return (
    element.type === 'text' &&
    (element.position === 'top_center' || element.content.includes('?') || element.content.length > 18)
  );
}

function isEquationPiece(element: SceneElement): boolean {
  if (element.type === 'character') {
    return false;
  }
  return !isQuestionText(element);
}

export const EquationLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const characters = scene.elements.filter((element) => element.type === 'character');
  const questions = scene.elements.filter(isQuestionText);
  const pieces = scene.elements.filter(isEquationPiece);

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

      {questions.map((element, index) => (
        <TimedElement
          key={`${scene.id}-q-${index}`}
          sceneId={scene.id}
          index={index}
          videoId={videoId}
          element={element}
          position="top_center"
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {pieces.map((element, index) => (
          <TimedElement
            key={`${scene.id}-eq-${index}`}
            sceneId={scene.id}
            index={index + 10}
            videoId={videoId}
            element={element}
            inline
            size={element.type === 'image' ? element.size ?? 'medium' : undefined}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
