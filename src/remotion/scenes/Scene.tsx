import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import type { SceneElement, SceneSchema } from '../../types/scene';
import { CharacterOverlay } from '../components/CharacterOverlay';
import { getDynamicCamera } from '../components/dynamicCamera';
import { EraserWipe } from '../components/EraserWipe';
import { SketchImage } from '../components/SketchImage';
import { TextEmphasis } from '../components/TextEmphasis';

interface SceneProps {
  videoId: string;
  scene: SceneSchema;
}

export const Scene: FC<SceneProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { scale, x, y } = getDynamicCamera(scene.cameraMoves ?? [], frame);

  const boardElements = scene.elements.filter((element) => element.type !== 'character');
  const characterElements = scene.elements.filter((element) => element.type === 'character');

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      <EraserWipe durationFrames={scene.durationFrames}>
        <AbsoluteFill
          style={{
            transform: `scale(${scale}) translate(${x}px, ${y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {boardElements.map((element, index) => (
            <Sequence
              key={`${scene.id}-${element.type}-${index}-${element.startAtFrame}`}
              from={Math.max(0, element.startAtFrame)}
              name={`${scene.id}-${element.type}-${index}`}
            >
              <SceneElementView videoId={videoId} element={element} />
            </Sequence>
          ))}
        </AbsoluteFill>
        {characterElements.map((element, index) => (
          <Sequence
            key={`${scene.id}-${element.type}-${index}-${element.startAtFrame}`}
            from={Math.max(0, element.startAtFrame)}
            name={`${scene.id}-${element.type}-${index}`}
          >
            <SceneElementView videoId={videoId} element={element} />
          </Sequence>
        ))}
      </EraserWipe>
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
