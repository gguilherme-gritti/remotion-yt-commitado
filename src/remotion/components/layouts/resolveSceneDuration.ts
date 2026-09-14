import type { SceneSchema } from '../../../types/scene';
import { getBalloonLayoutDuration } from './balloonDefaults';
import { getComicGridLayoutDuration } from './comicGridDefaults';
import { getEquationLayoutDuration } from './equationDefaults';
import { getFlowLayoutDuration } from './flowDefaults';
import { getFreeformLayoutDuration } from './freeformDefaults';
import { getListLayoutDuration } from './listDefaults';
import { getMangaImpactLayoutDuration } from './mangaImpactDefaults';
import { getNestedZoomLayoutDuration } from './nestedZoomDefaults';
import { getRadialLayoutDuration } from './radialDefaults';
import { getSplitLayoutDuration } from './splitDefaults';
import { getSpotlightLayoutDuration } from './spotlightDefaults';
import { getTimelineLayoutDuration } from './timelineDefaults';

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
