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

export type CameraAnimation = 'none' | 'zoom_in' | 'zoom_out' | 'pan_right' | 'pan_left';

export interface CameraMove {
  startAtFrame: number;
  type: CameraAnimation;
  target: ElementPosition;
  zoom: number;
}

export type CharacterAnimation = 'draw_in';

export type ImageAnimation = 'pop_in' | 'slide_in' | 'none';

export type TextAnimation = 'typewriter';

interface SceneElementBase {
  /** Frame relativo ao início da scene. O elemento permanece até o quadro ser limpo. */
  startAtFrame: number;
}

export interface CharacterElement extends SceneElementBase {
  type: 'character';
  pose: string;
  animation: CharacterAnimation;
}

export interface ImageElement extends SceneElementBase {
  type: 'image';
  src: string;
  imageIdea: string;
  animation?: ImageAnimation;
  position: ElementPosition;
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
  elements: SceneElement[];
  cameraMoves: CameraMove[];
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

export interface ActiveProjectSchema {
  videoId: string;
}
