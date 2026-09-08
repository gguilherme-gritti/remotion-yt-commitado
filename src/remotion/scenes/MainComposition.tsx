import type { FC } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SceneSchema } from '../../types/scene';
import { CameraMotion } from '../components/CameraMotion';
import { CharacterOverlay } from '../components/CharacterOverlay';
import { MangaPanel } from '../components/MangaPanel';
import { TextEmphasis } from '../components/TextEmphasis';

export type MainCompositionProps = {
  videoId: string;
  scenes: SceneSchema[];
};

export const MainComposition: FC<MainCompositionProps> = ({ videoId, scenes }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
          name={scene.id}
        >
          <CameraMotion type={scene.cameraAnimation} durationFrames={scene.durationFrames}>
            <MangaPanel
              videoId={videoId}
              panelImage={scene.panelImage}
              effect={scene.effect}
            />
          </CameraMotion>
          <CharacterOverlay characterPose={scene.characterPose} />
          {scene.textEmphasis ? (
            <TextEmphasis
              text={scene.textEmphasis.text}
              animation={scene.textEmphasis.animation}
            />
          ) : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
