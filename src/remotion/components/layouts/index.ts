import type { FC } from 'react';
import type { LayoutType } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { BalloonLayout } from './BalloonLayout';
import { ComicGridLayout } from './ComicGridLayout';
import { ConditionalListLayout } from './ConditionalListLayout';
import { EquationLayout } from './EquationLayout';
import { FreeformLayout } from './FreeformLayout';
import { MangaImpactLayout } from './MangaImpactLayout';
import { NestedZoomLayout } from './NestedZoomLayout';
import { RadialWebLayout } from './RadialWebLayout';
import { SplitLayout } from './SplitLayout';
import { TimelineLayout } from './TimelineLayout';
import { VerticalFlowLayout } from './VerticalFlowLayout';

export const LAYOUT_MAP: Record<LayoutType, FC<BoardLayoutProps>> = {
  balao_pensamento: BalloonLayout,
  lista_condicional: ConditionalListLayout,
  equacao_visual: EquationLayout,
  teia_radial: RadialWebLayout,
  fluxo_vertical: VerticalFlowLayout,
  split_comparativo: SplitLayout,
  impacto_manga: MangaImpactLayout,
  comic_grid: ComicGridLayout,
  nested_zoom: NestedZoomLayout,
  timeline: TimelineLayout,
};

export {
  BalloonLayout,
  ComicGridLayout,
  ConditionalListLayout,
  EquationLayout,
  FreeformLayout,
  MangaImpactLayout,
  NestedZoomLayout,
  RadialWebLayout,
  SplitLayout,
  TimelineLayout,
  VerticalFlowLayout,
};

export { resolveLayoutCameraMoves } from './layoutCamera';
