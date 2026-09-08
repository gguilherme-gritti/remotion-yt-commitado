import type { FC } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SceneElement, SceneSchema } from '../../types/scene';
import { CharacterOverlay } from '../components/CharacterOverlay';
import { SketchImage } from '../components/SketchImage';
import { TextEmphasis } from '../components/TextEmphasis';

interface SceneProps {
  videoId: string;
  scene: SceneSchema;
}

export const Scene: FC<SceneProps> = ({ videoId, scene }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      {scene.elements.map((element, index) => (
        <Sequence
          key={`${scene.id}-${element.type}-${index}-${element.startAtFrame}`}
          from={Math.max(0, element.startAtFrame)}
          name={`${scene.id}-${element.type}-${index}`}
        >
          <SceneElementView videoId={videoId} element={element} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SceneElementView: FC<{ videoId: string; element: SceneElement }> = ({
  videoId,
  element,
}) => {
  switch (element.type) {
    case 'character':
      return <CharacterOverlay pose={element.pose} animation={element.animation} />;
    case 'image':
      return (
        <SketchImage
          videoId={videoId}
          src={element.src}
          position={element.position}
          animation={element.animation}
        />
      );
    case 'text':
      return (
        <TextEmphasis
          content={element.content}
          position={element.position}
          animation={element.animation}
        />
      );
  }
};
