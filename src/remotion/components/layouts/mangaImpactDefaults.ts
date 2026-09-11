import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';

export const IMPACT_POP_FRAMES = 10;
export const IMPACT_IMAGE_SIZE = 'large' as const;
export const IMPACT_FONT_SIZE = 72;

const DEFAULT_FOCUS: ImageElement = {
  type: 'image',
  src: 'placa_alerta.jpeg',
  imageIdea: 'Objeto de impacto no centro do quadro.',
  startAtFrame: 0,
  animation: 'pop_in',
  position: 'center',
  size: IMPACT_IMAGE_SIZE,
};

export const IMPACT_STAGE_STYLE: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  backgroundColor: 'transparent',
  boxShadow: 'none',
};

export const IMPACT_FOCUS_STYLE: CSSProperties = {
  background: 'transparent',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  mixBlendMode: 'multiply',
};

export type MangaImpactFocus = CharacterElement | ImageElement | TextElement;

function isBoardElement(
  element: SceneElement,
): element is MangaImpactFocus {
  return (
    element.type === 'character' ||
    element.type === 'image' ||
    element.type === 'text'
  );
}

function pickFocus(scene: SceneSchema): MangaImpactFocus {
  const board = scene.elements.filter(isBoardElement);
  const centered = board.find((element) => element.position === 'center');

  if (centered) {
    return centered;
  }

  return (
    board.find((element): element is ImageElement => element.type === 'image') ??
    board.find((element): element is CharacterElement => element.type === 'character') ??
    board.find((element): element is TextElement => element.type === 'text') ??
    DEFAULT_FOCUS
  );
}

export function getMangaImpactLayoutParts(scene: SceneSchema): {
  focus: MangaImpactFocus;
} {
  const source = pickFocus(scene);

  if (source.type === 'character') {
    const focus: CharacterElement = {
      ...source,
      startAtFrame: 0,
      position: 'center',
    };
    return { focus };
  }

  if (source.type === 'image') {
    const focus: ImageElement = {
      ...source,
      startAtFrame: 0,
      position: 'center',
      size: source.size ?? IMPACT_IMAGE_SIZE,
    };
    return { focus };
  }

  const focus: TextElement = {
    ...source,
    startAtFrame: 0,
    position: 'center',
  };
  return { focus };
}

export function getMangaImpactLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [
    {
      startAtFrame: 0,
      type: 'none',
      target: 'center',
      zoom: 1,
    },
  ];
}
