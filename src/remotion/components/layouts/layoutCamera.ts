import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from './balloonDefaults';

export function resolveLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  switch (scene.layoutType) {
    case 'balao_pensamento':
      return getBalloonLayoutCameraMoves(scene);
    default:
      return scene.cameraMoves ?? [];
  }
}
