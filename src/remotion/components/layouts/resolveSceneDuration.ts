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
    case 'balao_pensamento':
      return getBalloonLayoutDuration(scene);
    case 'lista_condicional':
      return getListLayoutDuration(scene);
    case 'equacao_visual':
      return getEquationLayoutDuration(scene);
    case 'teia_radial':
      return getRadialLayoutDuration(scene);
    case 'fluxo_vertical':
      return getFlowLayoutDuration(scene);
    case 'split_comparativo':
      return getSplitLayoutDuration(scene);
    case 'impacto_manga':
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
