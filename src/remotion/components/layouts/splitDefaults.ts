import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ElementPosition,
  SceneElement,
  SceneSchema,
} from '../../../types/scene';

export const SPLIT_CHARACTER_POSE = 'surpreso';
export const SPLIT_LABEL_FONT_SIZE = 42;
export const SPLIT_IMAGE_SLOT_PX = 480;

export const SPLIT_STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: '80px 60px 80px 60px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  gap: 40,
};

export const SPLIT_COLUMN_STYLE: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
  minWidth: 0,
};

export const SPLIT_LABEL_SLOT_STYLE: CSSProperties = {
  minHeight: SPLIT_LABEL_FONT_SIZE * 1.25,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

export const SPLIT_IMAGE_SLOT_STYLE: CSSProperties = {
  width: SPLIT_IMAGE_SLOT_PX,
  height: SPLIT_IMAGE_SLOT_PX,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
};

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: SPLIT_CHARACTER_POSE,
  startAtFrame: 110,
  animation: 'draw_in',
  position: 'bottom_right',
};

function isLeftPosition(position: ElementPosition): boolean {
  return (
    position === 'center_left' ||
    position === 'top_left' ||
    position === 'bottom_left'
  );
}

function isRightPosition(position: ElementPosition): boolean {
  return (
    position === 'center_right' ||
    position === 'top_right' ||
    position === 'bottom_right'
  );
}

function sortByStart(elements: SceneElement[]): SceneElement[] {
  return elements.slice().sort((left, right) => left.startAtFrame - right.startAtFrame);
}

function lastStartAt(elements: SceneElement[]): number | undefined {
  return elements.at(-1)?.startAtFrame;
}

export function getSplitLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  left: SceneElement[];
  right: SceneElement[];
} {
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );

  const board = scene.elements.filter(
    (element) => element.type !== 'character' && element.type !== 'annotation',
  );
  const leftByPosition = sortByStart(
    board.filter((element) => isLeftPosition(element.position)),
  );
  const rightByPosition = sortByStart(
    board.filter((element) => isRightPosition(element.position)),
  );
  const rest = sortByStart(
    board.filter(
      (element) =>
        !isLeftPosition(element.position) && !isRightPosition(element.position),
    ),
  );

  let left = leftByPosition;
  let right = rightByPosition;

  if (left.length === 0 && right.length === 0 && rest.length > 0) {
    const splitAt = Math.ceil(rest.length / 2);
    left = rest.slice(0, splitAt);
    right = rest.slice(splitAt);
  } else if (rest.length > 0) {
    const splitAt = Math.ceil(rest.length / 2);
    left = [...left, ...rest.slice(0, splitAt)];
    right = [...right, ...rest.slice(splitAt)];
  }

  const lastBoardStart =
    lastStartAt([...left, ...right].sort((a, b) => a.startAtFrame - b.startAtFrame)) ?? 0;

  const character: CharacterElement = {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: sourceCharacter?.pose ?? SPLIT_CHARACTER_POSE,
    position: 'bottom_right',
    animation: 'draw_in',
    startAtFrame: sourceCharacter?.startAtFrame ?? lastBoardStart + 38,
  };

  return { character, left, right };
}

export function getSplitLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [];
}
