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
import {
  createClock,
  playCamera,
  playElements,
  sortByOriginalStart,
} from '../pacing';

export const COMIC_INK_COLOR = '#111111';
export const COMIC_STROKE_WIDTH = 6;
export const COMIC_CANVAS_WIDTH = 1920;
export const COMIC_CANVAS_HEIGHT = 1080;
export const COMIC_FONT_SIZE = 36;
export const COMIC_IMAGE_SIZE = 'medium' as const;
export const COMIC_IMAGE_SCALE = 0.82;
export const COMIC_CAMERA_BLEND = 40;
export const COMIC_ZOOM_OUT_FRAMES = 50;

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
  justifyContent: 'flex-start',
  gap: 10,
  padding: 22,
  boxSizing: 'border-box',
  overflow: 'hidden',
  zIndex: 2,
};

export const COMIC_CAPTION_STYLE: CSSProperties = {
  flex: '0 0 auto',
  width: '100%',
  minHeight: COMIC_FONT_SIZE * 1.35,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  zIndex: 3,
};

export const COMIC_MEDIA_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

function groupComicPanels(scene: SceneSchema): SceneElement[][] {
  const board = scene.elements.filter((element) => element.type !== 'annotation');
  const tagged = board.filter((element) => element.panel != null);
  const panels: SceneElement[][] = [[], [], []];

  if (tagged.length > 0) {
    tagged.forEach((element) => {
      const index = Math.max(0, Math.min(2, element.panel ?? 0));
      panels[index].push(element);
    });
    return panels.map(sortByOriginalStart);
  }

  const ordered = sortByOriginalStart(board);
  const chunk = Math.max(1, Math.ceil(ordered.length / 3));
  ordered.forEach((element, index) => {
    panels[Math.min(2, Math.floor(index / chunk))].push(element);
  });

  return panels;
}

type ComicGridSequence = {
  panels: SceneElement[][];
  focusAt: [number, number, number];
  zoomOutAt: number;
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceComicGridLayout(scene: SceneSchema): ComicGridSequence {
  const clock = createClock(scene);
  const rects = getComicPanelRects();
  const sources = groupComicPanels(scene);
  const blendFrames = clock.preset.cameraBlendFrames;
  const zoomOutFrames = clock.preset.cameraBlendFrames;
  const focusAt: [number, number, number] = [0, 0, 0];
  const cameraMoves: CameraMove[] = [
    cameraToPanel(rects[0], 0, 1, 'zoom_in'),
  ];

  const panels = sources.map((panelSources, panelIndex) => {
    if (panelIndex > 0) {
      const move = playCamera(clock, cameraToPanel(rects[panelIndex], 0, blendFrames, 'none'));
      cameraMoves.push(move);
      focusAt[panelIndex] = move.startAtFrame;
    }

    return playElements(clock, panelSources);
  });

  const zoomOutMove = playCamera(clock, {
    type: 'zoom_out',
    target: 'center',
    zoom: 1,
    focusX: 0.5,
    focusY: 0.5,
    blendFrames: zoomOutFrames,
    easing: 'smooth',
  });
  cameraMoves.push(zoomOutMove);

  return {
    panels,
    focusAt,
    zoomOutAt: zoomOutMove.startAtFrame,
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getComicGridLayoutParts(scene: SceneSchema): {
  panels: SceneElement[][];
  focusAt: [number, number, number];
  zoomOutAt: number;
} {
  const { panels, focusAt, zoomOutAt } = sequenceComicGridLayout(scene);
  return { panels, focusAt, zoomOutAt };
}

export function getComicZoomOutAt(scene: SceneSchema): number {
  return sequenceComicGridLayout(scene).zoomOutAt;
}

export function getActivePanelIndex(frame: number, scene: SceneSchema): number | null {
  const { focusAt, zoomOutAt } = sequenceComicGridLayout(scene);
  if (frame >= zoomOutAt) {
    return null;
  }

  if (frame >= focusAt[2] && focusAt[2] > 0) {
    return 2;
  }

  if (frame >= focusAt[1] && focusAt[1] > 0) {
    return 1;
  }

  return 0;
}

export function getComicGridLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  return sequenceComicGridLayout(scene).cameraMoves;
}

export function getComicGridLayoutDuration(scene: SceneSchema): number {
  return sequenceComicGridLayout(scene).durationFrames;
}

export function isComicText(element: SceneElement): element is TextElement {
  return element.type === 'text';
}

export function isComicImage(element: SceneElement): element is ImageElement {
  return element.type === 'image';
}
