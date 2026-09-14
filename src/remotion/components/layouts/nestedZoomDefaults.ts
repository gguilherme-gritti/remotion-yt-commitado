import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import {
  createClock,
  playElements,
  setupCamera,
  sortByOriginalStart,
} from '../pacing';

export const NESTED_ENTRY_FRAMES = 40;
export const NESTED_ZOOM_FRAMES = 40;
export const NESTED_STAGE_AT = 80;
export const NESTED_ZOOM = 2.8;
export const NESTED_ENTRY_FROM = 0.82;
export const NESTED_FONT_SIZE = 22;
export const NESTED_IMAGE_SCALE = 0.52;
export const NESTED_FRAME_SIZE = 'hero' as const;
export const NESTED_INK_COLOR = '#111111';

/**
 * Visor do `monitor_hacker.jpg` em % da caixa da moldura (vista 3/4).
 * `transformOrigin` da câmera usa o centro desta área.
 */
export const NESTED_SCREEN_RECT = {
  left: '40%',
  top: '21%',
  width: '44%',
  height: '40%',
} as const;

export const NESTED_SCREEN_ORIGIN = {
  x: 0.4 + 0.44 / 2,
  y: 0.21 + 0.4 / 2,
} as const;

const DEFAULT_CONTAINER: ImageElement = {
  type: 'image',
  src: 'monitor_hacker.jpg',
  imageIdea: 'Moldura: monitor/TV no centro da lousa.',
  startAtFrame: 0,
  animation: 'none',
  position: 'center',
  size: NESTED_FRAME_SIZE,
  isContainer: true,
};

const DEFAULT_NESTED: SceneElement[] = [
  {
    type: 'text',
    content: 'POR DENTRO',
    startAtFrame: NESTED_STAGE_AT,
    animation: 'typewriter',
    position: 'center',
    nested: true,
  },
  {
    type: 'image',
    src: 'codigo_binario.jpg',
    imageIdea: 'Código nascendo dentro da tela.',
    startAtFrame: NESTED_STAGE_AT + 28,
    animation: 'pop_in',
    position: 'center',
    size: 'small',
    nested: true,
  },
];

export const NESTED_STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const NESTED_FRAME_WRAP_STYLE: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  lineHeight: 0,
};

export const NESTED_SCREEN_STYLE: CSSProperties = {
  position: 'absolute',
  left: NESTED_SCREEN_RECT.left,
  top: NESTED_SCREEN_RECT.top,
  width: NESTED_SCREEN_RECT.width,
  height: NESTED_SCREEN_RECT.height,
  overflow: 'hidden',
  borderRadius: '6% / 8%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: 12,
  boxSizing: 'border-box',
  zIndex: 4,
};

export const NESTED_SCREEN_COVER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: '#ffffff',
  pointerEvents: 'none',
  zIndex: 0,
};

function boardElements(scene: SceneSchema): SceneElement[] {
  return scene.elements.filter((element) => element.type !== 'annotation');
}

function pickContainer(scene: SceneSchema): ImageElement {
  const flagged = scene.elements.find((element) => element.isContainer);
  if (flagged?.type === 'image') {
    return flagged;
  }

  const firstImage = scene.elements.find(
    (element): element is ImageElement => element.type === 'image' && !element.nested,
  );

  return firstImage ?? DEFAULT_CONTAINER;
}

type NestedZoomSequence = {
  container: ImageElement;
  nested: SceneElement[];
  outer: SceneElement[];
  enterFrames: number;
  zoomAt: number;
  zoomFrames: number;
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceNestedZoomLayout(scene: SceneSchema): NestedZoomSequence {
  const clock = createClock(scene);
  const enterFrames = clock.preset.entryFrames * 2;
  const zoomFrames = clock.preset.cameraBlendFrames;
  const containerSource = pickContainer(scene);
  const nestedSources = sortByOriginalStart(
    scene.elements.filter(
      (element) => element.nested === true && element !== containerSource,
    ),
  );
  const used = new Set<SceneElement>([containerSource, ...nestedSources]);
  const outerSources = sortByOriginalStart(
    boardElements(scene).filter((element) => !used.has(element)),
  );

  const container: ImageElement = {
    ...containerSource,
    isContainer: true,
    nested: false,
    position: 'center',
    size: containerSource.size ?? NESTED_FRAME_SIZE,
    startAtFrame: clock.now(),
    animation: containerSource.animation ?? 'none',
  };

  clock.take(enterFrames);
  const outer = playElements(clock, outerSources);
  const zoomAt = clock.take(zoomFrames);
  const nested = playElements(
    clock,
    nestedSources.length > 0
      ? nestedSources
      : DEFAULT_NESTED.map((element) => ({ ...element })),
  );

  return {
    container,
    nested,
    outer,
    enterFrames,
    zoomAt,
    zoomFrames,
    cameraMoves: [
      setupCamera({
        type: 'none',
        target: 'center',
        zoom: 1,
      }),
    ],
    durationFrames: clock.sceneDuration(),
  };
}

export function getNestedZoomLayoutParts(scene: SceneSchema): {
  container: ImageElement;
  nested: SceneElement[];
  outer: SceneElement[];
  enterFrames: number;
  zoomAt: number;
  zoomFrames: number;
} {
  const { container, nested, outer, enterFrames, zoomAt, zoomFrames } =
    sequenceNestedZoomLayout(scene);
  return { container, nested, outer, enterFrames, zoomAt, zoomFrames };
}

export function isNestedText(element: SceneElement): element is TextElement {
  return element.type === 'text';
}

export function isNestedImage(element: SceneElement): element is ImageElement {
  return element.type === 'image';
}

export function isNestedCharacter(
  element: SceneElement,
): element is CharacterElement {
  return element.type === 'character';
}

export function getNestedZoomLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [
    setupCamera({
      type: 'none',
      target: 'center',
      zoom: 1,
    }),
  ];
}

export function getNestedZoomLayoutDuration(scene: SceneSchema): number {
  return sequenceNestedZoomLayout(scene).durationFrames;
}
