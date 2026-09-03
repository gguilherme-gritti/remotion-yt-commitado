export type PanelEffect = 'hatch-reveal' | 'hard-cut' | 'tear-slide';

export type CharacterPose = 'explicando' | 'surpreso';

export type TextEmphasisAnimation = 'pop-in' | 'shake' | 'glitch';

export type TextEmphasisPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export type CameraAnimation =
  | 'slow_zoom_in'
  | 'punch_zoom'
  | 'pan_down'
  | 'screen_shake'
  | 'scroll_down'
  | 'scroll_up'
  | 'scroll_right'
  | 'scroll_left';

export interface TextEmphasisSchema {
  text: string;
  animation: TextEmphasisAnimation;
  position: TextEmphasisPosition;
}

export interface SceneSchema {
  id: string;
  startFrame: number;
  durationFrames: number;
  panelImage: string;
  effect: PanelEffect;
  characterPose: CharacterPose;
  textEmphasis: TextEmphasisSchema | null;
  cameraAnimation?: CameraAnimation | null;
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
