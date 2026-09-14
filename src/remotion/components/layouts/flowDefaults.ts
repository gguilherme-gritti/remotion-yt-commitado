import type { CSSProperties } from 'react';
import type {
  CameraMove,
  CharacterElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import {
  createClock,
  playCamera,
  playElement,
  playElements,
  setupCamera,
  sortByOriginalStart,
} from '../pacing';

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

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: FLOW_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_right',
};

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

type FlowSequence = {
  character: CharacterElement;
  title: TextElement | undefined;
  captions: TextElement[];
  items: SceneElement[];
  zoomOutAt: number;
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceFlowLayout(scene: SceneSchema): FlowSequence {
  const clock = createClock(scene);
  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === 'text',
  );
  const titleSource = texts.find((element) => element.position === 'top_center');
  const captionSources = texts.filter(
    (element) => element !== titleSource && element.position === 'center_left',
  );
  const captionSet = new Set(captionSources);
  const itemSources = sortByOriginalStart(
    scene.elements.filter((element) => {
      if (
        element.type === 'character' ||
        element.type === 'annotation' ||
        element === titleSource
      ) {
        return false;
      }

      return !captionSet.has(element as TextElement);
    }),
  );
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === 'character',
  );
  const count = Math.max(1, itemSources.length);
  const blendFrames = clock.preset.cameraBlendFrames;

  const cameraMoves: CameraMove[] = [
    setupCamera({
      type: 'none',
      target: 'center',
      zoom: 1,
      blendFrames: 1,
    }),
  ];

  const title = titleSource
    ? (playElement(clock, titleSource) as TextElement)
    : undefined;

  const items = itemSources.map((element, index) => {
    cameraMoves.push(
      playCamera(clock, {
        type: index === 0 ? 'zoom_in' : 'none',
        target: 'center',
        zoom: FLOW_CLOSE_ZOOM,
        focusX: FLOW_COLUMN_X,
        focusY: getFlowSlotY(index, count),
        blendFrames,
      }),
    );

    return playElement(clock, element);
  });

  const zoomOutMove = playCamera(clock, {
    type: 'none',
    target: 'center',
    zoom: 1,
    blendFrames,
  });
  cameraMoves.push(zoomOutMove);

  const character = playElement(clock, {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: sourceCharacter?.pose ?? FLOW_CHARACTER_POSE,
    position: 'bottom_right',
    animation: 'draw_in',
  }) as CharacterElement;

  const captions = playElements(
    clock,
    captionSources.map((element) => ({
      ...element,
      animation: 'typewriter' as const,
    })),
  ) as TextElement[];

  return {
    character,
    title,
    captions,
    items,
    zoomOutAt: zoomOutMove.startAtFrame,
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getFlowLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  title: TextElement | undefined;
  captions: TextElement[];
  items: SceneElement[];
  zoomOutAt: number;
} {
  const { character, title, captions, items, zoomOutAt } =
    sequenceFlowLayout(scene);
  return { character, title, captions, items, zoomOutAt };
}

export function getFlowLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  return sequenceFlowLayout(scene).cameraMoves;
}

export function getFlowLayoutDuration(scene: SceneSchema): number {
  return sequenceFlowLayout(scene).durationFrames;
}
