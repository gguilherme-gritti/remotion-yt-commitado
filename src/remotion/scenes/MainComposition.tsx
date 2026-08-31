import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import type { SceneSchema } from '../../types/scene';
import { CharacterOverlay } from '../components/CharacterOverlay';
import { MangaPanel } from '../components/MangaPanel';
import { getShakeOffset } from '../components/motion';
import { TextEmphasis } from '../components/TextEmphasis';

export type MainCompositionProps = {
  videoId: string;
  scenes: SceneSchema[];
};

export const MainComposition: FC<MainCompositionProps> = ({ videoId, scenes }) => {
  const frame = useCurrentFrame();

  const currentScene = scenes.find(
    (scene) => frame >= scene.startFrame && frame < scene.startFrame + scene.durationFrames,
  );

  const impactShake =
    currentScene?.effect === 'hard-cut'
      ? getShakeOffset(frame, 5)
      : { x: 0, y: 0 };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        transform: `translate(${impactShake.x}px, ${impactShake.y}px)`,
      }}
    >
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
          name={scene.id}
        >
          <MangaPanel
            videoId={videoId}
            panelImage={scene.panelImage}
            effect={scene.effect}
          />
          <CharacterOverlay characterPose={scene.characterPose} />
          {scene.textEmphasis ? (
            <TextEmphasis
              text={scene.textEmphasis.text}
              animation={scene.textEmphasis.animation}
              position={scene.textEmphasis.position}
            />
          ) : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
