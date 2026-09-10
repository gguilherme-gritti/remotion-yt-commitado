import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  ImageSize,
  SceneElement,
  SceneSchema,
} from '../../../types/scene';
import { CAMERA_BLEND_FRAMES } from '../dynamicCamera';

export const RADIAL_CHARACTER_POSE = 'zanka.png';
export const RADIAL_INTRO_ZOOM = 1;
export const RADIAL_WEB_ZOOM = 1.48;
export const RADIAL_MASTER_SCALE = 0.88;
export const RADIAL_SATELLITE_SCALE = 1.1;

const CHARACTER_HOLD_FRAMES = 40;

const SIZE_RANK: Record<ImageSize, number> = {
  small: 0,
  medium: 1,
  large: 2,
  hero: 3,
};

const SLOT_BASE: CSSProperties = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const RADIAL_SAFEZONE_STYLE: CSSProperties = {
  position: 'absolute',
  left: '20%',
  top: '10%',
  width: '60%',
  height: '46%',
};

export const RADIAL_MASTER_SLOT_STYLE: CSSProperties = {
  ...SLOT_BASE,
  left: '50%',
  top: '50%',
};

export const RADIAL_SATELLITE_SLOT_STYLES: CSSProperties[] = [
  { ...SLOT_BASE, left: '16%', top: '16%' },
  { ...SLOT_BASE, left: '84%', top: '16%' },
  { ...SLOT_BASE, left: '16%', top: '84%' },
  { ...SLOT_BASE, left: '84%', top: '84%' },
];

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: RADIAL_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_center',
};

export function pickRadialMaster(images: ImageElement[]): ImageElement | undefined {
  if (images.length === 0) {
    return undefined;
  }

  const ranked = [...images].sort((a, b) => {
    const sizeRank = SIZE_RANK[b.size ?? 'medium'] - SIZE_RANK[a.size ?? 'medium'];
    if (sizeRank !== 0) {
      return sizeRank;
    }
    if (a.position === 'center') {
      return -1;
    }
    if (b.position === 'center') {
      return 1;
    }
    return a.startAtFrame - b.startAtFrame;
  });

  return ranked[0];
}

export function getRadialLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  master: ImageElement | undefined;
  satellites: SceneElement[];
} {
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );
  const character: CharacterElement = {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: RADIAL_CHARACTER_POSE,
    position: 'bottom_center',
    startAtFrame: 0,
    animation: 'draw_in',
  };

  const images = scene.elements.filter(
    (element): element is ImageElement => element.type === 'image',
  );
  const master = pickRadialMaster(images);
  const satellites = scene.elements.filter(
    (element) =>
      element !== master &&
      element.type !== 'character' &&
      element.type !== 'annotation',
  );

  return { character, master, satellites };
}

export function getRadialLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const { character } = getRadialLayoutParts(scene);
  const panUpAt = character.startAtFrame + CHARACTER_HOLD_FRAMES;

  return [
    {
      startAtFrame: -CAMERA_BLEND_FRAMES,
      type: 'none',
      target: 'center',
      zoom: RADIAL_INTRO_ZOOM,
    },
    {
      startAtFrame: panUpAt,
      type: 'none',
      target: 'radial_web',
      zoom: RADIAL_WEB_ZOOM,
    },
  ];
}
