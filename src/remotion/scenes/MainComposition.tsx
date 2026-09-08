import type { FC } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import type { SceneSchema } from '../../types/scene';
import { CameraMotion } from '../components/CameraMotion';
import { CharacterOverlay } from '../components/CharacterOverlay';
import { MangaPanel } from '../components/MangaPanel';
import { TextEmphasis } from '../components/TextEmphasis';
import { groupPanelRuns } from '../groupPanelRuns';

export type MainCompositionProps = {
  videoId: string;
  scenes: SceneSchema[];
};

export const MainComposition: FC<MainCompositionProps> = ({ videoId, scenes }) => {
  const panelRuns = groupPanelRuns(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      {panelRuns.map((run) => (
        <Sequence
          key={run.key}
          from={run.startFrame}
          durationInFrames={run.durationFrames}
          name={run.key}
        >
          <CameraMotion type={run.cameraAnimation} durationFrames={run.durationFrames}>
            <MangaPanel
              videoId={videoId}
              panelImage={run.panelImage}
              effect={run.effect}
            />
          </CameraMotion>
        </Sequence>
      ))}

      {scenes.map((scene) => (
        <Sequence
          key={`${scene.id}-overlay`}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
          name={`${scene.id}-overlay`}
        >
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
