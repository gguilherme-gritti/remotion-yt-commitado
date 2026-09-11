import type { SceneSchema } from '../../../../types/scene';
import balaoPensamento from './balao_pensamento.json';
import comicGrid from './comic_grid.json';
import equacaoVisual from './equacao_visual.json';
import fluxoVertical from './fluxo_vertical.json';
import freeform from './freeform.json';
import impactoManga from './impacto_manga.json';
import listaCondicional from './lista_condicional.json';
import splitComparativo from './split_comparativo.json';
import teiaRadial from './teia_radial.json';

export const VIDEO_001_LAYOUTS: Record<string, SceneSchema> = {
  freeform: freeform as SceneSchema,
  balao_pensamento: balaoPensamento as SceneSchema,
  lista_condicional: listaCondicional as SceneSchema,
  equacao_visual: equacaoVisual as SceneSchema,
  teia_radial: teiaRadial as SceneSchema,
  fluxo_vertical: fluxoVertical as SceneSchema,
  split_comparativo: splitComparativo as SceneSchema,
  impacto_manga: impactoManga as SceneSchema,
  comic_grid: comicGrid as SceneSchema,
};
