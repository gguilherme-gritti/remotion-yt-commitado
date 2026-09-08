import type { SceneSchema } from '../types/scene';

export function getSceneStartFrame(scenes: SceneSchema[], sceneIndex: number): number {
  let startFrame = 0;

  for (let index = 0; index < sceneIndex; index += 1) {
    startFrame += scenes[index].durationFrames;
  }

  return startFrame;
}

export function getScenesDuration(scenes: SceneSchema[]): number {
  return scenes.reduce((total, scene) => total + scene.durationFrames, 0);
}
