import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from './balloonDefaults';
import { getComicGridLayoutCameraMoves } from './comicGridDefaults';
import { getEquationLayoutCameraMoves } from './equationDefaults';
import { getListLayoutCameraMoves } from './listDefaults';
import { getFlowLayoutCameraMoves } from './flowDefaults';
import { getMangaImpactLayoutCameraMoves } from './mangaImpactDefaults';
import { getNestedZoomLayoutCameraMoves } from './nestedZoomDefaults';
import { getRadialLayoutCameraMoves } from './radialDefaults';
import { getSplitLayoutCameraMoves } from './splitDefaults';

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
    case 'split_comparativo':
      return getSplitLayoutCameraMoves(scene);
    case 'impacto_manga':
      return getMangaImpactLayoutCameraMoves(scene);
    case 'comic_grid':
      return getComicGridLayoutCameraMoves(scene);
    case 'nested_zoom':
      return getNestedZoomLayoutCameraMoves(scene);
    default:
      return scene.cameraMoves ?? [];
  }
}
