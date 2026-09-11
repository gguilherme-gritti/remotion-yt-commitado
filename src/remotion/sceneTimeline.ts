import type { SceneSchema } from '../types/scene';
import { ERASE_PRESENTATION_FRAMES } from './components/transitions';

export function getSceneStartFrame(scenes: SceneSchema[], sceneIndex: number): number {
  let startFrame = 0;

  for (let index = 0; index < sceneIndex; index += 1) {
    startFrame += scenes[index].durationFrames - ERASE_PRESENTATION_FRAMES;
  }

  return startFrame;
}

export function getScenesDuration(scenes: SceneSchema[]): number {
  if (scenes.length === 0) {
    return 0;
  }

  const total = scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);
  return total - ERASE_PRESENTATION_FRAMES * (scenes.length - 1);
}
