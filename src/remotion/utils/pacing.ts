import type {
  AnnotationEffect,
  AnnotationKind,
  CameraMove,
  SceneElement,
  ScenePacing,
  SceneSchema,
} from '../../types/scene';
import { ERASER_FRAMES } from '../components/transitions';

export type { ScenePacing };

export type PacingPreset = {
  id: ScenePacing;
  /** Respiro depois que uma ação termina e antes da próxima. */
  breathFrames: number;
  /** Duração de pop_in / draw_in / slide_in. */
  entryFrames: number;
  /** Interpolação de câmera (zoom/pan). */
  cameraBlendFrames: number;
  /** Velocidade do typewriter. */
  typewriterCharsPerSecond: number;
  /** Hold extra no fim da cena, antes da borracha. */
  tailFrames: number;
};

export const DEFAULT_FPS = 30;
export const DEFAULT_PACING: ScenePacing = 'medium';

export const PACING_PRESETS: Record<ScenePacing, PacingPreset> = {
  fast: {
    id: 'fast',
    breathFrames: 8,
    entryFrames: 12,
    cameraBlendFrames: 20,
    typewriterCharsPerSecond: 28,
    tailFrames: 12,
  },
  medium: {
    id: 'medium',
    breathFrames: 16,
    entryFrames: 20,
    cameraBlendFrames: 36,
    typewriterCharsPerSecond: 22,
    tailFrames: 20,
  },
  slow: {
    id: 'slow',
    breathFrames: 28,
    entryFrames: 28,
    cameraBlendFrames: 50,
    typewriterCharsPerSecond: 14,
    tailFrames: 32,
  },
};

const ANNOTATION_DURATION_FRAMES: Record<AnnotationEffect, number> = {
  red_x: 16,
  green_check: 14,
  drawn_arrow: 16,
  highlight: 12,
  cross_hatch: 14,
  ink_splatter: 10,
  encircle: 20,
};

export function isScenePacing(value: unknown): value is ScenePacing {
  return value === 'fast' || value === 'medium' || value === 'slow';
}

export function getPacingPreset(scene: Pick<SceneSchema, 'pacing' | 'breathFrames'>): PacingPreset {
  const base = PACING_PRESETS[scene.pacing ?? DEFAULT_PACING];
  if (scene.breathFrames == null || !Number.isFinite(scene.breathFrames)) {
    return base;
  }

  return {
    ...base,
    breathFrames: Math.max(0, Math.round(scene.breathFrames)),
  };
}

export function typewriterDurationFrames(
  content: string,
  fps = DEFAULT_FPS,
  charsPerSecond = PACING_PRESETS.medium.typewriterCharsPerSecond,
): number {
  if (!content) {
    return 1;
  }

  return Math.max(1, Math.ceil(content.length / (charsPerSecond / fps)));
}

export function annotationDurationFrames(
  kind: AnnotationKind | AnnotationEffect | undefined,
): number {
  if (!kind || kind === 'none') {
    return 0;
  }

  return ANNOTATION_DURATION_FRAMES[kind];
}

export function hasDrawableAnnotation(element: SceneElement): boolean {
  if (element.type === 'annotation') {
    return true;
  }

  return Boolean(element.annotation && element.annotation !== 'none');
}

export function elementActionDuration(
  element: SceneElement,
  preset: PacingPreset,
  fps = DEFAULT_FPS,
): number {
  if (element.type === 'text') {
    return typewriterDurationFrames(
      element.content,
      fps,
      preset.typewriterCharsPerSecond,
    );
  }

  if (element.type === 'annotation') {
    return annotationDurationFrames(element.effect);
  }

  return preset.entryFrames;
}

export class BeatClock {
  cursor = 0;
  readonly preset: PacingPreset;
  readonly fps: number;
  readonly transitionOut: boolean;

  constructor(
    preset: PacingPreset,
    fps = DEFAULT_FPS,
    transitionOut = true,
  ) {
    this.preset = preset;
    this.fps = fps;
    this.transitionOut = transitionOut;
  }

  now(): number {
    return this.cursor;
  }

  play(durationFrames: number): number {
    const start = this.cursor;
    this.cursor += Math.max(0, Math.round(durationFrames));
    return start;
  }

  breathe(frames = this.preset.breathFrames): void {
    this.cursor += Math.max(0, Math.round(frames));
  }

  /** Executa a ação e aplica o respiro. */
  take(durationFrames: number): number {
    const start = this.play(durationFrames);
    this.breathe();
    return start;
  }

  /**
   * Hold do quadro pronto + respiro + janela da borracha (se houver próxima cena).
   * A borracha não começa em cima da última ação.
   */
  sceneDuration(): number {
    return (
      this.cursor +
      this.preset.tailFrames +
      this.preset.breathFrames +
      (this.transitionOut ? ERASER_FRAMES : 0)
    );
  }
}

export function createClock(
  scene: Pick<SceneSchema, 'pacing' | 'breathFrames' | 'transitionIn' | 'transitionOut'>,
): BeatClock {
  const clock = new BeatClock(
    getPacingPreset(scene),
    DEFAULT_FPS,
    scene.transitionOut !== false,
  );

  if (scene.transitionIn) {
    clock.play(ERASER_FRAMES);
    clock.breathe();
  }

  return clock;
}

/** Frames em branco no início da cena, enquanto o erase da anterior ainda atravessa. */
export function getIncomingEraseCover(
  scene: Pick<SceneSchema, 'transitionIn'>,
): number {
  return scene.transitionIn ? ERASER_FRAMES : 0;
}

export function playElement(
  clock: BeatClock,
  element: SceneElement,
  options?: { skipAnnotation?: boolean },
): SceneElement {
  const startAtFrame = clock.take(
    elementActionDuration(element, clock.preset, clock.fps),
  );

  if (options?.skipAnnotation || element.type === 'annotation') {
    return { ...element, startAtFrame };
  }

  if (!hasDrawableAnnotation(element)) {
    return { ...element, startAtFrame };
  }

  const annotationStartFrame = clock.take(
    annotationDurationFrames(element.annotation),
  );

  return { ...element, startAtFrame, annotationStartFrame };
}

export function playElements(
  clock: BeatClock,
  elements: SceneElement[],
  options?: { skipAnnotation?: boolean },
): SceneElement[] {
  return elements.map((element) => playElement(clock, element, options));
}

export function setupCamera(
  move: Omit<CameraMove, 'startAtFrame'> & { startAtFrame?: number },
): CameraMove {
  return {
    ...move,
    startAtFrame: move.startAtFrame ?? 0,
    blendFrames: move.blendFrames ?? 1,
  };
}

export function playCamera(
  clock: BeatClock,
  move: Omit<CameraMove, 'startAtFrame'> & { startAtFrame?: number },
): CameraMove {
  const blendFrames = move.blendFrames ?? clock.preset.cameraBlendFrames;
  const startAtFrame = clock.take(blendFrames);

  return {
    ...move,
    startAtFrame,
    blendFrames,
  };
}

export function sortByOriginalStart<T extends { startAtFrame: number }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const byStart = left.item.startAtFrame - right.item.startAtFrame;
      return byStart !== 0 ? byStart : left.index - right.index;
    })
    .map(({ item }) => item);
}
