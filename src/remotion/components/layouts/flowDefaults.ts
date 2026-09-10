import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import { CAMERA_BLEND_FRAMES } from '../dynamicCamera';
import { TYPEWRITER_CHARS_PER_SECOND } from '../TextEmphasis';

export const FLOW_CHARACTER_POSE = 'desconfiado';
export const FLOW_CHARACTER_SCALE = 2;
export const FLOW_CLOSE_ZOOM = 2.45;
export const FLOW_COLUMN_X = 0.5;
export const FLOW_TOP_Y = 0.34;
export const FLOW_BOTTOM_Y = 0.8;
export const FLOW_TITLE_FONT_SIZE = 56;
export const FLOW_BLEND_FRAMES = 20;
export const FLOW_CAPTION_FONT_SIZE = 62;
export const FLOW_CAPTION_COLOR = '#ffe14a';
export const FLOW_CAPTION_STROKE = '#000000';
export const FLOW_CAPTION_STROKE_WIDTH = 6;

const DEFAULT_FPS = 30;
const TITLE_BREATH_FRAMES = 20;
const ITEM_REVEAL_DELAY_FRAMES = 8;
const ITEM_POP_FRAMES = 18;
const ITEM_STILL_FRAMES = 32;
const CHARACTER_DRAW_FRAMES = 38;
const CAPTION_GAP_FRAMES = 18;

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: FLOW_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_right',
};

function typewriterDurationFrames(content: string, fps = DEFAULT_FPS): number {
  return Math.ceil(content.length / (TYPEWRITER_CHARS_PER_SECOND / fps));
}

export function getFlowSlotY(index: number, count: number): number {
  if (count <= 1) {
    return 0.5;
  }

  return FLOW_TOP_Y + (FLOW_BOTTOM_Y - FLOW_TOP_Y) * (index / (count - 1));
}

export function getFlowItemScale(count: number): number {
  if (count <= 3) {
    return 1.12;
  }

  return Math.max(0.72, 1.12 * (3 / count));
}

export function getFlowSlotStyle(index: number, count: number): CSSProperties {
  return {
    position: 'absolute',
    left: `${FLOW_COLUMN_X * 100}%`,
    top: `${getFlowSlotY(index, count) * 100}%`,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10 + index,
  };
}

export const FLOW_CAPTION_AREA_STYLE: CSSProperties = {
  position: 'absolute',
  left: '1%',
  width: '38%',
  top: '24%',
  height: '58%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 28,
  zIndex: 40,
  pointerEvents: 'none',
};

export function getFlowLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  title: TextElement | undefined;
  captions: TextElement[];
  items: SceneElement[];
  zoomOutAt: number;
} {
  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === 'text',
  );
  const title = texts.find((element) => element.position === 'top_center');
  const sourceCaptions = texts.filter(
    (element) => element !== title && element.position === 'center_left',
  );
  const captionSet = new Set(sourceCaptions);

  const orderedItems = scene.elements
    .filter((element) => {
      if (
        element.type === 'character' ||
        element.type === 'annotation' ||
        element === title
      ) {
        return false;
      }

      return !captionSet.has(element as TextElement);
    })
    .slice()
    .sort((left, right) => left.startAtFrame - right.startAtFrame);

  const titleHoldUntil = title
    ? title.startAtFrame +
      typewriterDurationFrames(title.content) +
      TITLE_BREATH_FRAMES
    : TITLE_BREATH_FRAMES;

  let previousItemStart = 0;
  const items = orderedItems.map((element, index) => {
    const startAtFrame =
      index === 0
        ? titleHoldUntil + FLOW_BLEND_FRAMES + ITEM_REVEAL_DELAY_FRAMES
        : previousItemStart +
          ITEM_POP_FRAMES +
          ITEM_STILL_FRAMES +
          FLOW_BLEND_FRAMES +
          ITEM_REVEAL_DELAY_FRAMES;
    previousItemStart = startAtFrame;
    return { ...element, startAtFrame };
  });

  const lastStart = items.at(-1)?.startAtFrame ?? titleHoldUntil;
  const zoomOutAt = lastStart + ITEM_POP_FRAMES + ITEM_STILL_FRAMES;

  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );

  const character: CharacterElement = {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: sourceCharacter?.pose ?? FLOW_CHARACTER_POSE,
    position: 'bottom_right',
    startAtFrame: zoomOutAt,
    animation: 'draw_in',
  };

  let captionCursor = zoomOutAt + CHARACTER_DRAW_FRAMES;
  const captions = sourceCaptions.map((element) => {
    const startAtFrame = captionCursor;
    captionCursor +=
      typewriterDurationFrames(element.content) + CAPTION_GAP_FRAMES;
    return { ...element, startAtFrame, animation: 'typewriter' as const };
  });

  return { character, title, captions, items, zoomOutAt };
}

export function getFlowLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const { items, zoomOutAt } = getFlowLayoutParts(scene);
  const count = Math.max(1, items.length);
  const cameraLeadFrames = FLOW_BLEND_FRAMES + ITEM_REVEAL_DELAY_FRAMES;

  const moves: CameraMove[] = [
    {
      startAtFrame: -CAMERA_BLEND_FRAMES,
      type: 'none',
      target: 'center',
      zoom: 1,
      blendFrames: FLOW_BLEND_FRAMES,
    },
  ];

  items.forEach((item, index) => {
    moves.push({
      startAtFrame: item.startAtFrame - cameraLeadFrames,
      type: index === 0 ? 'zoom_in' : 'none',
      target: 'center',
      zoom: FLOW_CLOSE_ZOOM,
      focusX: FLOW_COLUMN_X,
      focusY: getFlowSlotY(index, count),
      blendFrames: FLOW_BLEND_FRAMES,
    });
  });

  moves.push({
    startAtFrame: zoomOutAt,
    type: 'none',
    target: 'center',
    zoom: 1,
    blendFrames: FLOW_BLEND_FRAMES,
  });

  return moves;
}
