import type { CameraMove, SceneElement, SceneSchema } from '../../../types/scene';
import {
  createClock,
  playCamera,
  playElement,
  setupCamera,
  sortByOriginalStart,
} from '../pacing';

type FreeformEvent =
  | { kind: 'element'; order: number; startAtFrame: number; element: SceneElement }
  | { kind: 'camera'; order: number; startAtFrame: number; move: CameraMove };

function isRestCamera(move: CameraMove, index: number): boolean {
  return (
    index === 0 &&
    move.startAtFrame <= 0 &&
    (move.blendFrames == null || move.blendFrames <= 1)
  );
}

type FreeformSequence = {
  elements: SceneElement[];
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceFreeformLayout(scene: SceneSchema): FreeformSequence {
  const clock = createClock(scene);
  const sourceElements = sortByOriginalStart(scene.elements);
  const sourceCameras = [...(scene.cameraMoves ?? [])].sort(
    (left, right) => left.startAtFrame - right.startAtFrame,
  );

  const events: FreeformEvent[] = [
    ...sourceElements.map((element, order) => ({
      kind: 'element' as const,
      order,
      startAtFrame: element.startAtFrame,
      element,
    })),
    ...sourceCameras.map((move, order) => ({
      kind: 'camera' as const,
      order,
      startAtFrame: move.startAtFrame,
      move,
    })),
  ].sort((left, right) => {
    const byStart = left.startAtFrame - right.startAtFrame;
    if (byStart !== 0) {
      return byStart;
    }

    if (left.kind !== right.kind) {
      return left.kind === 'camera' ? -1 : 1;
    }

    return left.order - right.order;
  });

  const stamped = new Map<SceneElement, SceneElement>();
  const cameraMoves: CameraMove[] = [];

  events.forEach((event) => {
    if (event.kind === 'element') {
      stamped.set(event.element, playElement(clock, event.element));
      return;
    }

    if (isRestCamera(event.move, event.order) && cameraMoves.length === 0) {
      cameraMoves.push(setupCamera(event.move));
      return;
    }

    cameraMoves.push(playCamera(clock, event.move));
  });

  return {
    elements: sourceElements.map(
      (element) => stamped.get(element) ?? element,
    ),
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getFreeformLayoutDuration(scene: SceneSchema): number {
  return sequenceFreeformLayout(scene).durationFrames;
}

export function getFreeformLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const sequenced = sequenceFreeformLayout(scene);
  return sequenced.cameraMoves.length > 0
    ? sequenced.cameraMoves
    : scene.cameraMoves ?? [];
}
