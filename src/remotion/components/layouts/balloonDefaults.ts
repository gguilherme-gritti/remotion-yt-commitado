import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneElement,
  SceneSchema,
} from '../../../types/scene';
import { CAMERA_BLEND_FRAMES } from '../dynamicCamera';
import { ERASER_FRAMES } from '../EraserWipe';

export const BALLOON_CHARACTER_POSE = 'pensativo';
export const BALLOON_CHARACTER_SHIFT_PX = 280;
export const BALLOON_ZOOM = 2.25;
export const BALLOON_LIFT_PX = -148;
export const BALLOON_STRETCH_X = 1.72;
export const BALLOON_INNER_IMAGE_SCALE = 0.62;
export const BALLOON_INNER_FONT_SIZE = 34;

const BALLOON_ENTRY_SETTLE_FRAMES = 22;
const HOLD_AFTER_INNER_FRAMES = 30;

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

export function getBalloonLayoutParts(scene: SceneSchema): {
  characters: CharacterElement[];
  balloon: ImageElement | undefined;
  inner: SceneElement[];
} {
  const sourceCharacters = scene.elements.filter(
    (element): element is CharacterElement => element.type === 'character',
  );
  const characters =
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
  const balloon =
    images.find(isBalloonImage) ??
    images.find((element) => element.size === 'hero' || element.size === 'large');
  const inner = scene.elements.filter((element) => {
    if (element.type === 'character' || element.type === 'annotation') {
      return false;
    }

    return element !== balloon;
  });

  return { characters, balloon, inner };
}

export function getBalloonLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const { balloon, inner } = getBalloonLayoutParts(scene);
  const balloonStart = balloon?.startAtFrame ?? 0;
  const lastInnerStart = inner.reduce(
    (latest, element) => Math.max(latest, element.startAtFrame),
    balloonStart,
  );

  const zoomInAt = balloonStart + BALLOON_ENTRY_SETTLE_FRAMES;
  const zoomOutLatest = Math.max(0, scene.durationFrames - ERASER_FRAMES - CAMERA_BLEND_FRAMES);
  const zoomOutAt = Math.min(
    Math.max(lastInnerStart + HOLD_AFTER_INNER_FRAMES, zoomInAt + CAMERA_BLEND_FRAMES + 12),
    zoomOutLatest,
  );

  const wide: CameraMove = {
    startAtFrame: 0,
    type: 'none',
    target: 'center',
    zoom: 1,
  };
  const closeUp: CameraMove = {
    startAtFrame: zoomInAt,
    type: 'zoom_in',
    target: 'speech_bubble',
    zoom: BALLOON_ZOOM,
  };

  if (zoomOutAt <= zoomInAt) {
    return [wide, closeUp];
  }

  return [
    wide,
    closeUp,
    {
      startAtFrame: zoomOutAt,
      type: 'none',
      target: 'center',
      zoom: 1,
    },
  ];
}
