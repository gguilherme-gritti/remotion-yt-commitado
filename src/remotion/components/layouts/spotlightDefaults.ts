import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  CharacterPosition,
  ElementPosition,
  ImageElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import { applyEntryCadence } from '../entryCadence';
import { ENTRY_DURATION_FRAMES } from '../motion';

export const SPOTLIGHT_PUNCH_ZOOM = 1.12;
export const SPOTLIGHT_TARGET_SCALE = 1.1;
export const SPOTLIGHT_DIM_OPACITY = 0.25;
export const SPOTLIGHT_DIM_SCALE = 0.94;
export const SPOTLIGHT_DIM_GRAYSCALE = 60;
export const SPOTLIGHT_PUNCH_FRAMES = 22;
export const SPOTLIGHT_TITLE_FONT_SIZE = 48;
export const SPOTLIGHT_ROW_GAP_PX = 48;
export const SPOTLIGHT_CANVAS_WIDTH = 1920;
export const SPOTLIGHT_CANVAS_HEIGHT = 1080;
export const SPOTLIGHT_PAD_X = 80;
export const SPOTLIGHT_PAD_Y = 60;
/** Respiro depois que o alvo termina a entrada (15–20 frames). */
export const SPOTLIGHT_HIGHLIGHT_HOLD_FRAMES = 18;

const DEFAULT_TARGET: ImageElement = {
  type: 'image',
  src: 'placa_alerta.jpeg',
  imageIdea: 'Alvo do spotlight no centro.',
  startAtFrame: 54,
  animation: 'pop_in',
  position: 'center',
  size: 'medium',
  isTarget: true,
};

export const SPOTLIGHT_STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: `${SPOTLIGHT_PAD_Y}px ${SPOTLIGHT_PAD_X}px`,
  boxSizing: 'border-box',
};

export const SPOTLIGHT_TITLE_STYLE: CSSProperties = {
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  justifyContent: 'center',
  textAlign: 'center',
  flexShrink: 0,
  width: '100%',
  pointerEvents: 'none',
};

export const SPOTLIGHT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  gap: SPOTLIGHT_ROW_GAP_PX,
  flex: 1,
  width: '100%',
  minHeight: 0,
};

export const SPOTLIGHT_ROW_SLOT_STYLE: CSSProperties = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 0,
  position: 'relative',
};

export const SPOTLIGHT_CHARACTER_STYLE: CSSProperties = {
  position: 'absolute',
  bottom: 40,
  left: 40,
  zIndex: 3,
  pointerEvents: 'none',
};

export function isSpotlightTarget(element: SceneElement): boolean {
  return element.isTarget === true || element.target === true;
}

export function isSpotlightText(
  element: SceneElement,
): element is TextElement {
  return element.type === 'text';
}

export function isSpotlightCharacter(
  element: SceneElement,
): element is CharacterElement {
  return element.type === 'character';
}

function spotlightRowRank(element: SceneElement): number {
  switch (element.position) {
    case 'center_left':
    case 'top_left':
    case 'bottom_left':
    case 'left_giant':
      return 0;
    case 'center_right':
    case 'top_right':
    case 'bottom_right':
      return 2;
    default:
      return 1;
  }
}

export function getSpotlightFocusPoint(
  position: ElementPosition | CharacterPosition | undefined,
): { x: number; y: number } {
  switch (position) {
    case 'center_left':
      return { x: 0.22, y: 0.5 };
    case 'center_right':
      return { x: 0.78, y: 0.5 };
    case 'top_center':
      return { x: 0.5, y: 0.18 };
    case 'top_left':
      return { x: 0.18, y: 0.18 };
    case 'top_right':
      return { x: 0.82, y: 0.18 };
    case 'bottom_center':
      return { x: 0.5, y: 0.8 };
    case 'bottom_left':
      return { x: 0.18, y: 0.82 };
    case 'bottom_right':
      return { x: 0.82, y: 0.82 };
    case 'left_giant':
      return { x: 0.18, y: 0.5 };
    case 'center':
    default:
      return { x: 0.5, y: 0.5 };
  }
}

export function getSpotlightRowFocus(
  index: number,
  count: number,
): { x: number; y: number } {
  if (count <= 0) {
    return { x: 0.5, y: 0.5 };
  }

  const inner = SPOTLIGHT_CANVAS_WIDTH - SPOTLIGHT_PAD_X * 2;
  const x =
    (SPOTLIGHT_PAD_X + ((index + 0.5) / count) * inner) / SPOTLIGHT_CANVAS_WIDTH;
  const y = 0.5;

  return { x, y };
}

function pickTarget(elements: SceneElement[]): SceneElement {
  const flagged = elements.find(
    (element) => element.type !== 'annotation' && isSpotlightTarget(element),
  );
  if (flagged) {
    return flagged;
  }

  const firstImage = elements.find(
    (element): element is ImageElement => element.type === 'image',
  );

  return firstImage ?? DEFAULT_TARGET;
}

export function getSpotlightHighlightAt(targetStartAtFrame: number): number {
  return (
    targetStartAtFrame +
    ENTRY_DURATION_FRAMES +
    SPOTLIGHT_HIGHLIGHT_HOLD_FRAMES
  );
}

export function getSpotlightLayoutParts(scene: SceneSchema): {
  target: SceneElement;
  texts: TextElement[];
  characters: CharacterElement[];
  row: SceneElement[];
  highlightAt: number;
  focus: { x: number; y: number };
} {
  const staggered = applyEntryCadence(
    scene.elements.filter((element) => element.type !== 'annotation'),
  );
  const source = pickTarget(staggered);
  const highlightAt = getSpotlightHighlightAt(source.startAtFrame);
  const target: SceneElement = {
    ...source,
    isTarget: true,
    annotation: 'encircle',
    annotationStartFrame: highlightAt,
    annotationColor: source.annotationColor ?? '#111111',
  };

  const secondary = staggered.filter((element) => element !== source);
  const texts = secondary.filter(isSpotlightText);
  const characters = staggered.filter(isSpotlightCharacter);
  const row = [
    ...secondary.filter(
      (element) => !isSpotlightText(element) && !isSpotlightCharacter(element),
    ),
    ...(isSpotlightText(target) || isSpotlightCharacter(target) ? [] : [target]),
  ].sort((left, right) => {
    const byRank = spotlightRowRank(left) - spotlightRowRank(right);
    return byRank !== 0 ? byRank : left.startAtFrame - right.startAtFrame;
  });

  const targetRowIndex = row.findIndex((element) => isSpotlightTarget(element));

  return {
    target,
    texts,
    characters,
    row,
    highlightAt,
    focus:
      targetRowIndex >= 0
        ? getSpotlightRowFocus(targetRowIndex, row.length)
        : getSpotlightFocusPoint(target.position),
  };
}

export function getSpotlightLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [
    {
      startAtFrame: 0,
      type: 'none',
      target: 'center',
      zoom: 1,
    },
  ];
}
