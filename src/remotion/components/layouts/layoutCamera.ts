import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from './balloonDefaults';
import { getEquationLayoutCameraMoves } from './equationDefaults';
import { getListLayoutCameraMoves } from './listDefaults';
import { getFlowLayoutCameraMoves } from './flowDefaults';
import { getRadialLayoutCameraMoves } from './radialDefaults';

export function resolveLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  switch (scene.layoutType) {
    case 'balao_pensamento':
      return getBalloonLayoutCameraMoves(scene);
    case 'lista_condicional':
      return getListLayoutCameraMoves(scene);
    case 'equacao_visual':
      return getEquationLayoutCameraMoves(scene);
    case 'teia_radial':
      return getRadialLayoutCameraMoves(scene);
    case 'fluxo_vertical':
      return getFlowLayoutCameraMoves(scene);
    default:
      return scene.cameraMoves ?? [];
  }
}
