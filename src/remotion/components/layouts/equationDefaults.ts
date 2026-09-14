import { interpolate } from 'remotion';
import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import {
  createClock,
  playCamera,
  playElement,
  setupCamera,
} from '../pacing';

export const EQUATION_CHARACTER_POSE = 'curioso';
export const EQUATION_CHARACTER_SCALE = 1.4;
export const EQUATION_CLOSE_ZOOM = 2.95;
export const EQUATION_TITLE_FONT_SIZE = 64;
export const EQUATION_SLOT_CLOSE_A = 16;
export const EQUATION_SLOT_WIDE_A = 28;
export const EQUATION_SLOT_CLOSE_B = 84;
export const EQUATION_SLOT_WIDE_B = 72;

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

function isArrowImage(element: ImageElement): boolean {
  const haystack = `${element.src} ${element.imageIdea}`.toLowerCase();
  return /seta|arrow|igual/.test(haystack);
}

type EquationSequence = {
  character: CharacterElement;
  title: TextElement | undefined;
  objectA: ImageElement | undefined;
  operator: ImageElement | undefined;
  objectB: ImageElement | undefined;
  zoomOutAt: number;
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceEquationLayout(scene: SceneSchema): EquationSequence {
  const clock = createClock(scene);
  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === 'text',
  );
  const titleSource = texts.find(isQuestionText) ?? texts[0];
  const images = scene.elements
    .filter((element): element is ImageElement => element.type === 'image')
    .slice()
    .sort((left, right) => left.startAtFrame - right.startAtFrame);

  const operatorSource = images.find(isArrowImage) ?? images[1];
  const sides = images.filter((image) => image !== operatorSource);
  const objectASource = sides[0];
  const objectBSource = sides[1];
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );

  const cameraMoves: CameraMove[] = [
    setupCamera({
      type: 'none',
      target: 'center',
      zoom: 1,
    }),
  ];

  const title = titleSource
    ? (playElement(clock, titleSource) as TextElement)
    : undefined;

  if (objectASource) {
    cameraMoves.push(
      playCamera(clock, {
        type: 'zoom_in',
        target: 'equation_a',
        zoom: EQUATION_CLOSE_ZOOM,
      }),
    );
  }

  const objectA = objectASource
    ? (playElement(clock, objectASource) as ImageElement)
    : undefined;

  if (operatorSource) {
    cameraMoves.push(
      playCamera(clock, {
        type: 'none',
        target: 'equation_op',
        zoom: EQUATION_CLOSE_ZOOM,
      }),
    );
  }

  const operator = operatorSource
    ? (playElement(clock, operatorSource) as ImageElement)
    : undefined;

  if (objectBSource) {
    cameraMoves.push(
      playCamera(clock, {
        type: 'none',
        target: 'equation_b',
        zoom: EQUATION_CLOSE_ZOOM,
      }),
    );
  }

  const objectB = objectBSource
    ? (playElement(clock, objectBSource) as ImageElement)
    : undefined;

  const zoomOutMove = playCamera(clock, {
    type: 'none',
    target: 'center',
    zoom: 1,
  });
  cameraMoves.push(zoomOutMove);

  const character = playElement(clock, {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: EQUATION_CHARACTER_POSE,
    position: 'bottom_center',
    animation: 'draw_in',
  }) as CharacterElement;

  return {
    character,
    title,
    objectA,
    operator,
    objectB,
    zoomOutAt: zoomOutMove.startAtFrame,
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getEquationLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  title: TextElement | undefined;
  objectA: ImageElement | undefined;
  operator: ImageElement | undefined;
  objectB: ImageElement | undefined;
  zoomOutAt: number;
} {
  const { character, title, objectA, operator, objectB, zoomOutAt } =
    sequenceEquationLayout(scene);
  return { character, title, objectA, operator, objectB, zoomOutAt };
}

export function getEquationLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  return sequenceEquationLayout(scene).cameraMoves;
}

export function getEquationLayoutDuration(scene: SceneSchema): number {
  return sequenceEquationLayout(scene).durationFrames;
}

export function getEquationZoomOutAt(scene: SceneSchema): number {
  return sequenceEquationLayout(scene).zoomOutAt;
}
