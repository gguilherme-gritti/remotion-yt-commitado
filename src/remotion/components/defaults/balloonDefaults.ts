import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneElement,
  SceneSchema,
} from '../../../types/scene';
import {
  createClock,
  playCamera,
  playElement,
  playElements,
  setupCamera,
  sortByOriginalStart,
} from '../../utils/pacing';

export const BALLOON_CHARACTER_POSE = 'pensativo';
export const BALLOON_CHARACTER_SHIFT_PX = 280;
export const BALLOON_ZOOM = 2.25;
export const BALLOON_LIFT_PX = -148;
export const BALLOON_STRETCH_X = 1.72;
export const BALLOON_INNER_IMAGE_SCALE = 0.62;
export const BALLOON_INNER_FONT_SIZE = 34;

export const BALLOON_INNER_STYLE: CSSProperties = {
  position: 'absolute',
  top: '19%',
  left: '24%',
  width: '52%',
  height: '30%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  alignContent: 'center',
  gap: 14,
  padding: '12px 28px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  zIndex: 20,
};

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: BALLOON_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_left',
};

function isBalloonImage(element: ImageElement): boolean {
  const haystack = `${element.src} ${element.imageIdea}`.toLowerCase();
  return /bala[oõ]|speech|fala|bubble/.test(haystack);
}

type BalloonSequence = {
  characters: CharacterElement[];
  balloon: ImageElement | undefined;
  inner: SceneElement[];
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceBalloonLayout(scene: SceneSchema): BalloonSequence {
  const clock = createClock(scene);
  const sourceCharacters = scene.elements.filter(
    (element): element is CharacterElement => element.type === 'character',
  );
  const characterSources =
    sourceCharacters.length > 0
      ? sourceCharacters.map((element) => ({
          ...element,
          pose: BALLOON_CHARACTER_POSE,
          position: 'bottom_left' as const,
        }))
      : [DEFAULT_CHARACTER];

  const images = scene.elements.filter(
    (element): element is ImageElement => element.type === 'image',
  );
  const balloonSource =
    images.find(isBalloonImage) ??
    images.find((element) => element.size === 'hero' || element.size === 'large');
  const innerSources = sortByOriginalStart(
    scene.elements.filter((element) => {
      if (element.type === 'character' || element.type === 'annotation') {
        return false;
      }

      return element !== balloonSource;
    }),
  );

  const cameraMoves: CameraMove[] = [
    setupCamera({
      type: 'none',
      target: 'center',
      zoom: 1,
    }),
  ];

  const characters = playElements(clock, characterSources) as CharacterElement[];
  const balloon = balloonSource
    ? (playElement(clock, balloonSource) as ImageElement)
    : undefined;

  if (balloon || innerSources.length > 0) {
    cameraMoves.push(
      playCamera(clock, {
        type: 'zoom_in',
        target: 'speech_bubble',
        zoom: BALLOON_ZOOM,
      }),
    );
  }

  const inner = playElements(clock, innerSources);

  if (balloon || innerSources.length > 0) {
    cameraMoves.push(
      playCamera(clock, {
        type: 'none',
        target: 'center',
        zoom: 1,
      }),
    );
  }

  return {
    characters,
    balloon,
    inner,
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getBalloonLayoutParts(scene: SceneSchema): {
  characters: CharacterElement[];
  balloon: ImageElement | undefined;
  inner: SceneElement[];
} {
  const { characters, balloon, inner } = sequenceBalloonLayout(scene);
  return { characters, balloon, inner };
}

export function getBalloonLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  return sequenceBalloonLayout(scene).cameraMoves;
}

export function getBalloonLayoutDuration(scene: SceneSchema): number {
  return sequenceBalloonLayout(scene).durationFrames;
}
