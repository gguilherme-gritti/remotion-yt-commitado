import type { CameraMove, SceneSchema } from '../../../types/scene';
import { getBalloonLayoutCameraMoves } from '../defaults/balloonDefaults';
import { getComicGridLayoutCameraMoves } from '../defaults/comicGridDefaults';
import { getFreeformLayoutCameraMoves } from '../defaults/freeformDefaults';
import { getEquationLayoutCameraMoves } from '../defaults/equationDefaults';
import { getListLayoutCameraMoves } from '../defaults/listDefaults';
import { getFlowLayoutCameraMoves } from '../defaults/flowDefaults';
import { getMangaImpactLayoutCameraMoves } from '../defaults/mangaImpactDefaults';
import { getNestedZoomLayoutCameraMoves } from '../defaults/nestedZoomDefaults';
import { getRadialLayoutCameraMoves } from '../defaults/radialDefaults';
import { getSplitLayoutCameraMoves } from '../defaults/splitDefaults';
import { getSpotlightLayoutCameraMoves } from '../defaults/spotlightDefaults';
import { getTimelineLayoutCameraMoves } from '../defaults/timelineDefaults';

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
