import type { CameraAnimation, PanelEffect, SceneSchema } from '../types/scene';

export type PanelRun = {
  key: string;
  panelImage: string;
  effect: PanelEffect;
  cameraAnimation?: CameraAnimation | null;
  startFrame: number;
  durationFrames: number;
  scenes: SceneSchema[];
};

export function groupPanelRuns(scenes: SceneSchema[]): PanelRun[] {
  const ordered = [...scenes].sort((a, b) => a.startFrame - b.startFrame);
  const runs: PanelRun[] = [];

  for (const scene of ordered) {
    const current = runs[runs.length - 1];
    const sceneEnd = scene.startFrame + scene.durationFrames;

    if (current && current.panelImage === scene.panelImage) {
      current.scenes.push(scene);
      current.durationFrames = sceneEnd - current.startFrame;
      continue;
    }

    runs.push({
      key: `panel-${scene.panelImage}-${scene.startFrame}`,
      panelImage: scene.panelImage,
      effect: scene.effect ?? 'hatch-reveal',
      cameraAnimation: scene.cameraAnimation,
      startFrame: scene.startFrame,
      durationFrames: scene.durationFrames,
      scenes: [scene],
    });
  }

  return runs;
}
