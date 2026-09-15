import type { SceneSchema } from '../../../types/scene';
import { getBalloonLayoutDuration } from '../defaults/balloonDefaults';
import { getComicGridLayoutDuration } from '../defaults/comicGridDefaults';
import { getEquationLayoutDuration } from '../defaults/equationDefaults';
import { getFlowLayoutDuration } from '../defaults/flowDefaults';
import { getFreeformLayoutDuration } from '../defaults/freeformDefaults';
import { getListLayoutDuration } from '../defaults/listDefaults';
import { getMangaImpactLayoutDuration } from '../defaults/mangaImpactDefaults';
import { getNestedZoomLayoutDuration } from '../defaults/nestedZoomDefaults';
import { getRadialLayoutDuration } from '../defaults/radialDefaults';
import { getSplitLayoutDuration } from '../defaults/splitDefaults';
import { getSpotlightLayoutDuration } from '../defaults/spotlightDefaults';
import { getTimelineLayoutDuration } from '../defaults/timelineDefaults';

export function resolveLayoutDuration(scene: SceneSchema): number {
  switch (scene.layoutType) {
    case 'balloon':
      return getBalloonLayoutDuration(scene);
    case 'conditional_list':
      return getListLayoutDuration(scene);
    case 'equation':
      return getEquationLayoutDuration(scene);
    case 'radial_web':
      return getRadialLayoutDuration(scene);
    case 'vertical_flow':
      return getFlowLayoutDuration(scene);
    case 'split':
      return getSplitLayoutDuration(scene);
    case 'manga_impact':
      return getMangaImpactLayoutDuration(scene);
    case 'comic_grid':
      return getComicGridLayoutDuration(scene);
    case 'nested_zoom':
      return getNestedZoomLayoutDuration(scene);
    case 'timeline':
      return getTimelineLayoutDuration(scene);
    case 'spotlight':
      return getSpotlightLayoutDuration(scene);
    default:
      return getFreeformLayoutDuration(scene);
  }
}

/** Expande `durationFrames` para caber a cadência sequencial do layout. */
export function withPacedDuration(scene: SceneSchema): SceneSchema {
  return {
    ...scene,
    durationFrames: Math.max(scene.durationFrames, resolveLayoutDuration(scene)),
  };
}
