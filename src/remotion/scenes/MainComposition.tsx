import type { FC } from 'react';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import type { SceneSchema } from '../../types/scene';
import { LineBoilFilter } from '../components/effects/LineBoilFilter';
import {
  getTransitionDurationFrames,
  presentationFor,
  resolveTransitionType,
} from '../components/transitions';
import { Scene } from './Scene';

export type MainCompositionProps = {
  videoId: string;
  scenes: SceneSchema[];
};

export const MainComposition: FC<MainCompositionProps> = ({
  videoId,
  scenes,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      <LineBoilFilter />
      <TransitionSeries>
        {scenes.flatMap((scene, index) => {
          const sequence = (
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={scene.durationFrames}
              name={scene.id}
            >
              <Scene videoId={videoId} scene={scene} />
            </TransitionSeries.Sequence>
          );

          if (index === 0) {
            return [sequence];
          }

          const outgoingType = resolveTransitionType(scenes[index - 1].transitionType);
          if (outgoingType === 'none') {
            return [sequence];
          }

          return [
            <TransitionSeries.Transition
              key={`${outgoingType}-${scene.id}`}
              presentation={presentationFor(outgoingType)}
              timing={linearTiming({
                durationInFrames: getTransitionDurationFrames(outgoingType),
              })}
            />,
            sequence,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
