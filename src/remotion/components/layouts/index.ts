import type { FC } from 'react';
import type { LayoutType } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { BalloonLayout } from './BalloonLayout';
import { ConditionalListLayout } from './ConditionalListLayout';
import { EquationLayout } from './EquationLayout';
import { FreeformLayout } from './FreeformLayout';
import { RadialWebLayout } from './RadialWebLayout';
import { SplitLayout } from './SplitLayout';
import { VerticalFlowLayout } from './VerticalFlowLayout';

export const LAYOUT_MAP: Record<LayoutType, FC<BoardLayoutProps>> = {
  balao_pensamento: BalloonLayout,
  lista_condicional: ConditionalListLayout,
  equacao_visual: EquationLayout,
  teia_radial: RadialWebLayout,
  fluxo_vertical: VerticalFlowLayout,
  split_comparativo: SplitLayout,
};

export {
  BalloonLayout,
  ConditionalListLayout,
  EquationLayout,
  FreeformLayout,
  RadialWebLayout,
  SplitLayout,
  VerticalFlowLayout,
};
