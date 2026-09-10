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
  | 'split_comparativo';

export type TextAnimation = 'typewriter';

interface SceneElementBase {
  /** Frame relativo ao início da scene. O elemento permanece até o quadro ser limpo. */
  startAtFrame: number;
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

export type SceneElement = CharacterElement | ImageElement | TextElement;

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
