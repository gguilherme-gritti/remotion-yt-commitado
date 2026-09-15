import type { SceneSchema } from '../../types/scene';
import { getTransitionDurationFrames } from '../components/transitions';

export function getSceneStartFrame(scenes: SceneSchema[], sceneIndex: number): number {
  let startFrame = 0;

  for (let index = 0; index < sceneIndex; index += 1) {
    startFrame +=
      scenes[index].durationFrames -
      getTransitionDurationFrames(scenes[index].transitionType);
  }

  return startFrame;
}

export function getScenesDuration(scenes: SceneSchema[]): number {
  if (scenes.length === 0) {
    return 0;
  }

  const total = scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);
  let overlap = 0;

  for (let index = 0; index < scenes.length - 1; index += 1) {
    overlap += getTransitionDurationFrames(scenes[index].transitionType);
  }

  return total - overlap;
}
