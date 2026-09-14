import type { SceneSchema } from '../../../../types/scene';
import balloon from './balloon.json';
import comicGrid from './comic_grid.json';
import conditionalList from './conditional_list.json';
import equation from './equation.json';
import freeform from './freeform.json';
import mangaImpact from './manga_impact.json';
import nestedZoom from './nested_zoom.json';
import radialWeb from './radial_web.json';
import split from './split.json';
import spotlight from './spotlight.json';
import timeline from './timeline.json';
import verticalFlow from './vertical_flow.json';

export const VIDEO_001_LAYOUTS: Record<string, SceneSchema> = {
  freeform: freeform as SceneSchema,
  balloon: balloon as SceneSchema,
  conditional_list: conditionalList as SceneSchema,
  equation: equation as SceneSchema,
  radial_web: radialWeb as SceneSchema,
  vertical_flow: verticalFlow as SceneSchema,
  split: split as SceneSchema,
  manga_impact: mangaImpact as SceneSchema,
  comic_grid: comicGrid as SceneSchema,
  nested_zoom: nestedZoom as SceneSchema,
  timeline: timeline as SceneSchema,
  spotlight: spotlight as SceneSchema,
};
