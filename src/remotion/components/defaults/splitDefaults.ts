import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ElementPosition,
  SceneElement,
  SceneSchema,
} from '../../../types/scene';
import { createClock, playElement, sortByOriginalStart } from '../../utils/pacing';

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
  startAtFrame: 0,
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

function splitBoard(scene: SceneSchema): {
  left: SceneElement[];
  right: SceneElement[];
  sourceCharacter: CharacterElement | undefined;
} {
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );
  const board = scene.elements.filter(
    (element) => element.type !== 'character' && element.type !== 'annotation',
  );
  const leftByPosition = sortByOriginalStart(
    board.filter((element) => isLeftPosition(element.position)),
  );
  const rightByPosition = sortByOriginalStart(
    board.filter((element) => isRightPosition(element.position)),
  );
  const rest = sortByOriginalStart(
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

  return { left, right, sourceCharacter };
}

type SplitSequence = {
  character: CharacterElement;
  left: SceneElement[];
  right: SceneElement[];
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceSplitLayout(scene: SceneSchema): SplitSequence {
  const clock = createClock(scene);
  const { left: leftSources, right: rightSources, sourceCharacter } =
    splitBoard(scene);

  const left = leftSources.map((element) => playElement(clock, element));
  const right = rightSources.map((element) => playElement(clock, element));
  const character = playElement(clock, {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: sourceCharacter?.pose ?? SPLIT_CHARACTER_POSE,
    position: 'bottom_right',
    animation: 'draw_in',
  }) as CharacterElement;

  return {
    character,
    left,
    right,
    cameraMoves: [],
    durationFrames: clock.sceneDuration(),
  };
}

export function getSplitLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  left: SceneElement[];
  right: SceneElement[];
} {
  const { character, left, right } = sequenceSplitLayout(scene);
  return { character, left, right };
}

export function getSplitLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [];
}

export function getSplitLayoutDuration(scene: SceneSchema): number {
  return sequenceSplitLayout(scene).durationFrames;
}
