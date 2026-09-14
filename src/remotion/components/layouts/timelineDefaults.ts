import type { CSSProperties } from 'react';
import { Easing, interpolate } from 'remotion';
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneElement,
  SceneSchema,
  TextElement,
} from '../../../types/scene';
import {
  createClock,
  playElement,
  setupCamera,
  sortByOriginalStart,
} from '../pacing';

export const TIMELINE_INK = '#111111';
export const TIMELINE_STROKE_WIDTH = 4;
export const TIMELINE_CANVAS_WIDTH = 1920;
export const TIMELINE_CANVAS_HEIGHT = 1080;
export const TIMELINE_AXIS_Y = 0.52;
export const TIMELINE_FONT_SIZE = 34;
export const TIMELINE_IMAGE_SCALE = 1.12;
export const TIMELINE_CHARACTER_POSE = 'curioso';
export const TIMELINE_ACTIVE_SCALE = 1.1;
export const TIMELINE_DIM_OPACITY = 0.35;
export const TIMELINE_PAN_PX = 160;
export const TIMELINE_PAN_BLEND = 28;
export const TIMELINE_LINE_BLEND = 22;
export const TIMELINE_NODE_RADIUS = 11;
export const TIMELINE_MIN_STEPS = 3;
export const TIMELINE_MAX_STEPS = 4;

const SMOOTH = Easing.bezier(0.4, 0, 0.2, 1);

const DEFAULT_CHARACTER: CharacterElement = {
  type: 'character',
  pose: TIMELINE_CHARACTER_POSE,
  startAtFrame: 0,
  animation: 'draw_in',
  position: 'bottom_left',
};

const DEFAULT_STEPS: { text: string; src: string; idea: string }[] = [
  {
    text: 'IDEIA',
    src: 'brain_math.jpeg',
    idea: 'Primeiro nó: a ideia.',
  },
  {
    text: 'PLANO',
    src: 'prancheta_checklist.jpg',
    idea: 'Segundo nó: o plano.',
  },
  {
    text: 'CÓDIGO',
    src: 'codigo_binario.jpg',
    idea: 'Terceiro nó: o código.',
  },
  {
    text: 'SHIP',
    src: 'computador_amigavel.jpg',
    idea: 'Quarto nó: o resultado.',
  },
];

export type TimelineStep = {
  index: number;
  startAtFrame: number;
  panAt: number;
  panFrames: number;
  lineAt: number;
  lineFrames: number;
  x: number;
  elements: SceneElement[];
  image?: ImageElement;
  text?: TextElement;
};

export const TIMELINE_STAGE_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
};

export const TIMELINE_TITLE_STYLE: CSSProperties = {
  position: 'absolute',
  top: 92,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  zIndex: 30,
  pointerEvents: 'none',
};

export function getTimelineNodeX(index: number, count: number): number {
  if (count <= 1) {
    return 0.5;
  }

  const first = 0.14;
  const last = 0.86;
  return first + ((last - first) * index) / (count - 1);
}

export function getTimelineNodeStyle(x: number): CSSProperties {
  return {
    position: 'absolute',
    left: `${x * 100}%`,
    top: `${TIMELINE_AXIS_Y * 100}%`,
    transform: 'translateX(-50%)',
    width: 320,
    zIndex: 12,
  };
}

function boardElements(scene: SceneSchema): SceneElement[] {
  return scene.elements.filter(
    (element) => element.type !== 'annotation' && element.type !== 'character',
  );
}

function defaultStep(index: number, startAtFrame: number): SceneElement[] {
  const source = DEFAULT_STEPS[Math.min(index, DEFAULT_STEPS.length - 1)];
  const step = index as 0 | 1 | 2 | 3;

  return [
    {
      type: 'text',
      content: source.text,
      startAtFrame,
      animation: 'typewriter',
      position: 'center',
      step,
    },
    {
      type: 'image',
      src: source.src,
      imageIdea: source.idea,
      startAtFrame: startAtFrame + 8,
      animation: 'pop_in',
      position: 'center',
      size: 'small',
      step,
    },
  ];
}

function groupByStep(scene: SceneSchema): SceneElement[][] {
  const board = boardElements(scene).filter(
    (element) => element.position !== 'top_center',
  );
  const tagged = board.filter(
    (element) => element.step != null && Number.isFinite(element.step),
  );

  const buckets: SceneElement[][] = [];

  if (tagged.length > 0) {
    tagged.forEach((element) => {
      const index = Math.max(0, Math.min(TIMELINE_MAX_STEPS - 1, element.step ?? 0));
      buckets[index] = buckets[index] ?? [];
      buckets[index].push(element);
    });
  } else {
    const ordered = sortByOriginalStart(board);
    const count = Math.min(
      TIMELINE_MAX_STEPS,
      Math.max(TIMELINE_MIN_STEPS, Math.ceil(ordered.length / 2) || TIMELINE_MIN_STEPS),
    );
    const chunk = Math.max(1, Math.ceil(ordered.length / count));
    ordered.forEach((element, index) => {
      const slot = Math.min(count - 1, Math.floor(index / chunk));
      buckets[slot] = buckets[slot] ?? [];
      buckets[slot].push(element);
    });
  }

  const filled = buckets.filter((bucket) => bucket && bucket.length > 0);
  const count = Math.min(
    TIMELINE_MAX_STEPS,
    Math.max(TIMELINE_MIN_STEPS, filled.length),
  );

  return Array.from({ length: count }, (_, index) => {
    if (filled[index] && filled[index].length > 0) {
      return sortByOriginalStart(filled[index]);
    }

    return defaultStep(index, index * 70);
  });
}

type TimelineSequence = {
  title: TextElement | undefined;
  character: CharacterElement;
  steps: TimelineStep[];
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceTimelineLayout(scene: SceneSchema): TimelineSequence {
  const clock = createClock(scene);
  const panFrames = clock.preset.cameraBlendFrames;
  const lineFrames = Math.max(12, Math.round(clock.preset.entryFrames * 1.1));
  const titleSource = scene.elements.find(
    (element): element is TextElement =>
      element.type === 'text' &&
      element.position === 'top_center' &&
      element.step == null,
  );
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement =>
      element.type === 'character' && element.step == null,
  );
  const groups = groupByStep(scene);

  const character = playElement(clock, {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: TIMELINE_CHARACTER_POSE,
    position: 'bottom_left',
    animation: 'draw_in',
  }) as CharacterElement;

  const title = titleSource
    ? (playElement(clock, titleSource) as TextElement)
    : undefined;

  const steps: TimelineStep[] = groups.map((groupSources, index) => {
    let panAt = clock.now();
    let lineAt = clock.now();

    if (index > 0) {
      panAt = clock.take(panFrames);
      lineAt = clock.take(lineFrames);
    }

    const elements = groupSources.map((element) => playElement(clock, element));
    const image = elements.find(
      (element): element is ImageElement => element.type === 'image',
    );
    const text = elements.find(
      (element): element is TextElement => element.type === 'text',
    );

    return {
      index,
      startAtFrame: elements[0]?.startAtFrame ?? clock.now(),
      panAt,
      panFrames: index > 0 ? panFrames : 1,
      lineAt,
      lineFrames: index > 0 ? lineFrames : 1,
      x: getTimelineNodeX(index, groups.length),
      elements,
      image,
      text,
    };
  });

  return {
    title,
    character,
    steps,
    cameraMoves: [
      setupCamera({
        type: 'none',
        target: 'center',
        zoom: 1,
      }),
    ],
    durationFrames: clock.sceneDuration(),
  };
}

export function getTimelineLayoutParts(scene: SceneSchema): {
  title: TextElement | undefined;
  character: CharacterElement;
  steps: TimelineStep[];
} {
  const { title, character, steps } = sequenceTimelineLayout(scene);
  return { title, character, steps };
}

export function getActiveTimelineStep(frame: number, steps: TimelineStep[]): number {
  let active = 0;

  steps.forEach((step, index) => {
    if (frame >= step.startAtFrame) {
      active = index;
    }
  });

  return active;
}

export function getTimelinePanX(frame: number, steps: TimelineStep[]): number {
  if (steps.length === 0) {
    return 0;
  }

  let pan = (0.5 - steps[0].x) * TIMELINE_PAN_PX;

  for (let index = 1; index < steps.length; index += 1) {
    const start = steps[index].panAt;
    if (frame < start) {
      break;
    }

    const from = (0.5 - steps[index - 1].x) * TIMELINE_PAN_PX;
    const to = (0.5 - steps[index].x) * TIMELINE_PAN_PX;
    pan = interpolate(frame, [start, start + steps[index].panFrames], [from, to], {
      easing: SMOOTH,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  return pan;
}

export function getTimelineLineProgress(frame: number, steps: TimelineStep[]): number {
  if (steps.length <= 1) {
    return 1;
  }

  let progress = 0;

  for (let index = 1; index < steps.length; index += 1) {
    const from = (index - 1) / (steps.length - 1);
    const to = index / (steps.length - 1);
    const start = steps[index].lineAt;
    const end = start + steps[index].lineFrames;

    if (frame < start) {
      return from;
    }

    progress = interpolate(frame, [start, end], [from, to], {
      easing: SMOOTH,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  return progress;
}

export function getTimelinePath(steps: TimelineStep[]): string {
  const y = TIMELINE_AXIS_Y * TIMELINE_CANVAS_HEIGHT;
  const xs = steps.map((step) => step.x * TIMELINE_CANVAS_WIDTH);

  if (xs.length === 0) {
    return '';
  }

  let d = `M ${xs[0]} ${y}`;
  for (let index = 1; index < xs.length; index += 1) {
    const prev = xs[index - 1];
    const curr = xs[index];
    const mid = (prev + curr) / 2;
    const wobble = index % 2 === 0 ? 12 : -12;
    d += ` C ${mid} ${y + wobble}, ${mid} ${y + wobble}, ${curr} ${y}`;
  }

  return d;
}

export function isTimelineText(element: SceneElement): element is TextElement {
  return element.type === 'text';
}

export function isTimelineImage(element: SceneElement): element is ImageElement {
  return element.type === 'image';
}

export function getTimelineLayoutCameraMoves(_scene: SceneSchema): CameraMove[] {
  return [
    setupCamera({
      type: 'none',
      target: 'center',
      zoom: 1,
    }),
  ];
}

export function getTimelineLayoutDuration(scene: SceneSchema): number {
  return sequenceTimelineLayout(scene).durationFrames;
}
