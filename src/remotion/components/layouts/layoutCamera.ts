import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from './balloonDefaults';
import { getListLayoutCameraMoves } from './listDefaults';

export function resolveLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  switch (scene.layoutType) {
    case 'balao_pensamento':
      return getBalloonLayoutCameraMoves(scene);
    case 'lista_condicional':
      return getListLayoutCameraMoves(scene);
    default:
      return scene.cameraMoves ?? [];
  }
}
