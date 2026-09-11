import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  ImageSize,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';

export const COMIC_INK_COLOR = '#111111';
export const COMIC_STROKE_WIDTH = 6;
export const COMIC_CANVAS_WIDTH = 1920;
export const COMIC_CANVAS_HEIGHT = 1080;
export const COMIC_FONT_SIZE = 36;
export const COMIC_IMAGE_SIZE = 'medium' as const;
export const COMIC_IMAGE_SCALE = 0.82;

/** Painel 0 (hero) até este frame; daqui a câmera desliza para o Painel 1. */
export const COMIC_FOCUS_PANEL_1_AT = 90;
/** Painel 1 até este frame; daqui a câmera desliza para o Painel 2. */
export const COMIC_FOCUS_PANEL_2_AT = 190;
/** Painel 2 até este frame; daqui a câmera recua para a página inteira. */
export const COMIC_ZOOM_OUT_AT = 250;
/** Recuo final: `scale` 1 e `translate(0, 0)` em 50 frames. */
export const COMIC_ZOOM_OUT_FRAMES = 50;
export const COMIC_CAMERA_BLEND = 40;

const MARGIN_X = 28 / COMIC_CANVAS_WIDTH;
const MARGIN_Y = 28 / COMIC_CANVAS_HEIGHT;
const GUTTER_X = 18 / COMIC_CANVAS_WIDTH;
const GUTTER_Y = 18 / COMIC_CANVAS_HEIGHT;
const HERO_HEIGHT_SHARE = 0.56;
const COVER_INSET = 1.03;

export type ComicPanelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const COMIC_STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
};

export const COMIC_PANEL_INNER_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  padding: 22,
  boxSizing: 'border-box',
  overflow: 'hidden',
  zIndex: 2,
};

export const COMIC_PANEL_CHARACTER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  transform: 'scale(0.78)',
  transformOrigin: 'center bottom',
};

export function getComicPanelFrameStyle(rect: ComicPanelRect): CSSProperties {
  return {
    position: 'absolute',
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  };
}

/** Painel 0 no topo; Painel 1 inferior esquerdo; Painel 2 inferior direito. */
export function getComicPanelRects(): ComicPanelRect[] {
  const innerW = 1 - MARGIN_X * 2;
  const innerH = 1 - MARGIN_Y * 2;
  const topH = (innerH - GUTTER_Y) * HERO_HEIGHT_SHARE;
  const botH = innerH - GUTTER_Y - topH;
  const botW = (innerW - GUTTER_X) / 2;

  return [
    { x: MARGIN_X, y: MARGIN_Y, width: innerW, height: topH },
    { x: MARGIN_X, y: MARGIN_Y + topH + GUTTER_Y, width: botW, height: botH },
    {
      x: MARGIN_X + botW + GUTTER_X,
      y: MARGIN_Y + topH + GUTTER_Y,
      width: botW,
      height: botH,
    },
  ];
}

export function getComicPanelFillZoom(rect: ComicPanelRect): number {
  return Math.max(1 / rect.width, 1 / rect.height) / COVER_INSET;
}

export function getComicZoomOutAt(durationFrames: number): number {
  const latestStart = Math.max(0, durationFrames - COMIC_ZOOM_OUT_FRAMES);
  return Math.min(COMIC_ZOOM_OUT_AT, latestStart);
}

export function splitComicPanelContent(elements: SceneElement[]): {
  characters: CharacterElement[];
  board: SceneElement[];
} {
  return {
    characters: elements.filter(
      (element): element is CharacterElement => element.type === 'character',
    ),
    board: elements.filter(
      (element) => element.type !== 'character' && element.type !== 'annotation',
    ),
  };
}

export function getComicPanelImageSize(panelIndex: number): ImageSize {
  return panelIndex === 0 ? COMIC_IMAGE_SIZE : 'small';
}

/**
 * 0–90: Painel 0. 90–190: Painel 1. 190 até o recuo: Painel 2.
 * Durante o zoom out, retorna `null` (página inteira).
 */
export function getActivePanelIndex(
  frame: number,
  durationFrames: number,
): number | null {
  if (frame >= getComicZoomOutAt(durationFrames)) {
    return null;
  }

  if (frame >= COMIC_FOCUS_PANEL_2_AT) {
    return 2;
  }

  if (frame >= COMIC_FOCUS_PANEL_1_AT) {
    return 1;
  }

  return 0;
}

function cameraToPanel(
  rect: ComicPanelRect,
  startAtFrame: number,
  blendFrames: number,
  type: CameraMove['type'],
): CameraMove {
  return {
    startAtFrame,
    type,
    target: 'center',
    zoom: getComicPanelFillZoom(rect),
    focusX: rect.x + rect.width / 2,
    focusY: rect.y + rect.height / 2,
    blendFrames,
    easing: 'smooth',
  };
}

export function getComicGridLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const [hero, bottomLeft, bottomRight] = getComicPanelRects();
  const zoomOutAt = getComicZoomOutAt(scene.durationFrames);

  return [
    cameraToPanel(hero, -1, 1, 'zoom_in'),
    cameraToPanel(bottomLeft, COMIC_FOCUS_PANEL_1_AT, COMIC_CAMERA_BLEND, 'none'),
    cameraToPanel(bottomRight, COMIC_FOCUS_PANEL_2_AT, COMIC_CAMERA_BLEND, 'none'),
    {
      startAtFrame: zoomOutAt,
      type: 'zoom_out',
      target: 'center',
      zoom: 1,
      focusX: 0.5,
      focusY: 0.5,
      blendFrames: COMIC_ZOOM_OUT_FRAMES,
      easing: 'smooth',
    },
  ];
}

export function isComicText(element: SceneElement): element is TextElement {
  return element.type === 'text';
}

export function isComicImage(element: SceneElement): element is ImageElement {
  return element.type === 'image';
}
