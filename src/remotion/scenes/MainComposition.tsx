import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { SceneSchema } from "../../types/scene";
import { LineBoilFilter } from "../components/effects/LineBoilFilter";
import { getSceneStartFrame } from "../sceneTimeline";
import { Scene } from "./Scene";

export type MainCompositionProps = {
  videoId: string;
  scenes: SceneSchema[];
};

export const MainComposition: FC<MainCompositionProps> = ({
  videoId,
  scenes,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <LineBoilFilter />
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={getSceneStartFrame(scenes, index)}
          durationInFrames={scene.durationFrames}
          name={scene.id}
        >
          <Scene videoId={videoId} scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
