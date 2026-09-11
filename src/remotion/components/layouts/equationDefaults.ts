import { interpolate } from 'remotion';
import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import { CAMERA_BLEND_FRAMES } from '../dynamicCamera';
import { ERASER_FRAMES } from '../transitions';
import { TYPEWRITER_CHARS_PER_SECOND } from '../TextEmphasis';

export const EQUATION_CHARACTER_POSE = 'curioso';
export const EQUATION_CHARACTER_SCALE = 1.4;
export const EQUATION_CLOSE_ZOOM = 2.95;
export const EQUATION_TITLE_FONT_SIZE = 64;
export const EQUATION_SLOT_CLOSE_A = 16;
export const EQUATION_SLOT_WIDE_A = 28;
export const EQUATION_SLOT_CLOSE_B = 84;
export const EQUATION_SLOT_WIDE_B = 72;

const DEFAULT_FPS = 30;
const TITLE_BREATH_FRAMES = 24;
const OBJECT_A_POP_FRAMES = 20;
const OBJECT_A_STILL_FRAMES = 28;
const HOLD_AFTER_B_FRAMES = 22;

export const EQUATION_SLOT_STYLE: CSSProperties = {
  position: 'absolute',
  top: '48%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const EQUATION_SLOT_OP_STYLE: CSSProperties = {
  ...EQUATION_SLOT_STYLE,
  left: '50%',
};

export function getEquationSlotLeft(cameraScale: number, side: 'a' | 'b'): string {
  const close = side === 'a' ? EQUATION_SLOT_CLOSE_A : EQUATION_SLOT_CLOSE_B;
  const wide = side === 'a' ? EQUATION_SLOT_WIDE_A : EQUATION_SLOT_WIDE_B;
  const percent = interpolate(cameraScale, [1, EQUATION_CLOSE_ZOOM], [wide, close], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return `${percent}%`;
}

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: EQUATION_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_center',
};

function isQuestionText(element: TextElement): boolean {
  return (
    element.position === 'top_center' ||
    element.content.includes('?') ||
    element.content.length > 18
  );
}

function typewriterDurationFrames(content: string, fps = DEFAULT_FPS): number {
  return Math.ceil(content.length / (TYPEWRITER_CHARS_PER_SECOND / fps));
}

function getTitleHoldUntil(title: TextElement | undefined, fps = DEFAULT_FPS): number {
  if (!title) {
    return 0;
  }

  return title.startAtFrame + typewriterDurationFrames(title.content, fps) + TITLE_BREATH_FRAMES;
}

function isArrowImage(element: ImageElement): boolean {
  const haystack = `${element.src} ${element.imageIdea}`.toLowerCase();
  return /seta|arrow|igual/.test(haystack);
}

export function getEquationZoomOutAt(scene: SceneSchema, objectBStart: number): number {
  const latest = Math.max(0, scene.durationFrames - ERASER_FRAMES - CAMERA_BLEND_FRAMES);
  return Math.min(objectBStart + HOLD_AFTER_B_FRAMES, latest);
}

export function getEquationLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  title: TextElement | undefined;
  objectA: ImageElement | undefined;
  operator: ImageElement | undefined;
  objectB: ImageElement | undefined;
  zoomOutAt: number;
} {
  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === 'text',
  );
  const title = texts.find(isQuestionText) ?? texts[0];
  const images = scene.elements
    .filter((element): element is ImageElement => element.type === 'image')
    .slice()
    .sort((left, right) => left.startAtFrame - right.startAtFrame);

  const operator = images.find(isArrowImage) ?? images[1];
  const sides = images.filter((image) => image !== operator);
  const objectA = sides[0];
  const objectB = sides[1];
  const zoomOutAt = getEquationZoomOutAt(scene, objectB?.startAtFrame ?? 0);

  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );

  const character: CharacterElement = {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: EQUATION_CHARACTER_POSE,
    position: 'bottom_center',
    startAtFrame: zoomOutAt,
    animation: 'draw_in',
  };

  return { character, title, objectA, operator, objectB, zoomOutAt };
}

export function getEquationLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const { title, objectA, operator, objectB, zoomOutAt } = getEquationLayoutParts(scene);
  const aStart = objectA?.startAtFrame ?? 0;
  const arrowStart = operator?.startAtFrame ?? aStart + CAMERA_BLEND_FRAMES;
  const bStart = objectB?.startAtFrame ?? arrowStart + CAMERA_BLEND_FRAMES;
  const zoomToAAt = getTitleHoldUntil(title);

  const panToArrowAt = Math.max(
    aStart + OBJECT_A_POP_FRAMES + OBJECT_A_STILL_FRAMES,
    arrowStart - CAMERA_BLEND_FRAMES,
  );
  const panToBAt = Math.max(arrowStart + 12, bStart - CAMERA_BLEND_FRAMES);

  return [
    {
      startAtFrame: 0,
      type: 'none',
      target: 'center',
      zoom: 1,
    },
    {
      startAtFrame: zoomToAAt,
      type: 'zoom_in',
      target: 'equation_a',
      zoom: EQUATION_CLOSE_ZOOM,
    },
    {
      startAtFrame: panToArrowAt,
      type: 'none',
      target: 'equation_op',
      zoom: EQUATION_CLOSE_ZOOM,
    },
    {
      startAtFrame: panToBAt,
      type: 'none',
      target: 'equation_b',
      zoom: EQUATION_CLOSE_ZOOM,
    },
    {
      startAtFrame: zoomOutAt,
      type: 'none',
      target: 'center',
      zoom: 1,
    },
  ];
}
