export type ElementPosition =
  | 'center'
  | 'center_left'
  | 'center_right'
  | 'top_center'
  | 'top_left'
  | 'top_right'
  | 'bottom_center'
  | 'bottom_left'
  | 'bottom_right';

export type CharacterPosition =
  | 'bottom_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'left_giant'
  | 'center';

export type CameraTarget =
  | ElementPosition
  | CharacterPosition
  | 'speech_bubble'
  | 'equation_a'
  | 'equation_op'
  | 'equation_b'
  | 'radial_web';

export type CameraAnimation = 'none' | 'zoom_in' | 'zoom_out' | 'pan_right' | 'pan_left';

export interface CameraMove {
  startAtFrame: number;
  type: CameraAnimation;
  target: CameraTarget;
  zoom: number;
  /** 0–1. Se existir, substitui o X do target. */
  focusX?: number;
  /** 0–1. Se existir, substitui o Y do target. */
  focusY?: number;
  /** Duração da interpolação. Default: 42. */
  blendFrames?: number;
  /** Curva da interpolação. `smooth` = cubic-bezier(0.4, 0, 0.2, 1). Default linear. */
  easing?: 'linear' | 'smooth';
}

export type CharacterAnimation = 'draw_in';

export type ImageAnimation = 'pop_in' | 'slide_in' | 'none';

export type ImageSize = 'small' | 'medium' | 'large' | 'hero';

export type LayoutType =
  | 'balao_pensamento'
  | 'lista_condicional'
  | 'equacao_visual'
  | 'teia_radial'
  | 'fluxo_vertical'
  | 'split_comparativo'
  | 'impacto_manga'
  | 'comic_grid'
  | 'nested_zoom';

export type TextAnimation = 'typewriter';

export type AnnotationKind =
  | 'red_x'
  | 'green_check'
  | 'drawn_arrow'
  | 'highlight'
  | 'cross_hatch'
  | 'ink_splatter'
  | 'encircle'
  | 'none';

export type AnnotationEffect =
  | 'red_x'
  | 'green_check'
  | 'drawn_arrow'
  | 'highlight'
  | 'cross_hatch'
  | 'ink_splatter'
  | 'encircle';

export type AnnotationDirection = 'right' | 'left' | 'up' | 'down' | 'curve_right';

interface SceneElementBase {
  /** Frame relativo ao início da scene. O elemento permanece até o quadro ser limpo. */
  startAtFrame: number;
  /** Rabisco sobreposto à caixa do elemento (ex.: X vermelho de canetinha). */
  annotation?: AnnotationKind;
  /** Frame da scene em que a anotação começa a ser desenhada. Default: startAtFrame. */
  annotationStartFrame?: number;
  /** Cor da canetinha. Usado por `drawn_arrow` e `encircle` (default nanquim `#111111`). */
  annotationColor?: string;
  /** Cor do marca-texto. Usado por `highlight`. Default: `#FFD000`. */
  highlightColor?: string;
  /** Direção da seta. Usado por `drawn_arrow`. Default: `right`. */
  annotationDirection?: AnnotationDirection;
  /**
   * Traço vivo (line boil). Default: `true` em imagens e personagens,
   * `false` em textos.
   */
  lineBoil?: boolean;
  /**
   * Índice do painel no ComicGridLayout (0–2).
   * Sem este campo, o layout agrupa por `position` ou pela ordem de entrada.
   */
  panel?: number;
  /**
   * Moldura do NestedZoomLayout (monitor/TV). Se nenhum elemento marcar,
   * o layout usa a primeira imagem.
   */
  isContainer?: boolean;
  /**
   * Conteúdo interno do NestedZoomLayout. Só entra depois do zoom na tela.
   */
  nested?: boolean;
}

export interface CharacterElement extends SceneElementBase {
  type: 'character';
  pose: string;
  animation: CharacterAnimation;
  position?: CharacterPosition;
}

export interface ImageElement extends SceneElementBase {
  type: 'image';
  src: string;
  imageIdea: string;
  animation?: ImageAnimation;
  position: ElementPosition;
  size?: ImageSize;
  scale?: number;
}

export interface TextElement extends SceneElementBase {
  type: 'text';
  content: string;
  animation: TextAnimation;
  position: ElementPosition;
}

export interface AnnotationElement extends SceneElementBase {
  type: 'annotation';
  effect: AnnotationEffect;
  position: ElementPosition;
  scale?: number;
}

export type SceneElement =
  | CharacterElement
  | ImageElement
  | TextElement
  | AnnotationElement;

/** Cada scene é um quadro em branco. Ao trocar de scene, a tela é limpa. */
export interface SceneSchema {
  id: string;
  durationFrames: number;
  scenes_context: string;
  layoutType?: LayoutType;
  elements: SceneElement[];
  cameraMoves?: CameraMove[];
}

export interface ProjectMetaSchema {
  title: string;
  fps: number;
  totalFrames: number;
  audioFile: string;
}

export interface ProjectSchema {
  meta: ProjectMetaSchema;
  scenes: SceneSchema[];
}

/** scenes.json aponta a ordem dos arquivos em layouts/*.json */
export interface ProjectManifestSchema {
  meta: ProjectMetaSchema;
  scenes: string[];
}

export interface ActiveProjectSchema {
  videoId: string;
}
