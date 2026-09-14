import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from './balloonDefaults';
import { getComicGridLayoutCameraMoves } from './comicGridDefaults';
import { getFreeformLayoutCameraMoves } from './freeformDefaults';
import { getEquationLayoutCameraMoves } from './equationDefaults';
import { getListLayoutCameraMoves } from './listDefaults';
import { getFlowLayoutCameraMoves } from './flowDefaults';
import { getMangaImpactLayoutCameraMoves } from './mangaImpactDefaults';
import { getNestedZoomLayoutCameraMoves } from './nestedZoomDefaults';
import { getRadialLayoutCameraMoves } from './radialDefaults';
import { getSplitLayoutCameraMoves } from './splitDefaults';
import { getSpotlightLayoutCameraMoves } from './spotlightDefaults';
import { getTimelineLayoutCameraMoves } from './timelineDefaults';

export function resolveLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  switch (scene.layoutType) {
    case 'balloon':
      return getBalloonLayoutCameraMoves(scene);
    case 'conditional_list':
      return getListLayoutCameraMoves(scene);
    case 'equation':
      return getEquationLayoutCameraMoves(scene);
    case 'radial_web':
      return getRadialLayoutCameraMoves(scene);
    case 'vertical_flow':
      return getFlowLayoutCameraMoves(scene);
    case 'split':
      return getSplitLayoutCameraMoves(scene);
    case 'manga_impact':
      return getMangaImpactLayoutCameraMoves(scene);
    case 'comic_grid':
      return getComicGridLayoutCameraMoves(scene);
    case 'nested_zoom':
      return getNestedZoomLayoutCameraMoves(scene);
    case 'timeline':
      return getTimelineLayoutCameraMoves(scene);
    case 'spotlight':
      return getSpotlightLayoutCameraMoves(scene);
    default:
      return getFreeformLayoutCameraMoves(scene);
  }
}
