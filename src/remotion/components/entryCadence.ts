import type { SceneElement } from '../../types/scene';
import { PACING_PRESETS } from './pacing';

/** @deprecated Use `BeatClock` / `playElement` em `pacing.ts`. */
export const ENTRY_CADENCE_TRIGGER_FRAMES = PACING_PRESETS.medium.breathFrames;
/** @deprecated Use `BeatClock` / `playElement` em `pacing.ts`. */
export const ENTRY_CADENCE_GAP_FRAMES = PACING_PRESETS.medium.breathFrames +
  PACING_PRESETS.medium.entryFrames;

/**
 * @deprecated Layouts usam `BeatClock` para cadência sequencial.
 * Mantido para espaçar entradas coladas em listas avulsas.
 */
export function applyEntryCadence<T extends SceneElement>(
  elements: T[],
  gapFrames = ENTRY_CADENCE_GAP_FRAMES,
  triggerFrames = ENTRY_CADENCE_TRIGGER_FRAMES,
): T[] {
  const order = elements.map((element, index) => ({ element, index }));
  order.sort((left, right) => {
    const byStart = left.element.startAtFrame - right.element.startAtFrame;
    return byStart !== 0 ? byStart : left.index - right.index;
  });

  const nextStart = new Map<number, number>();
  let previousStart = Number.NEGATIVE_INFINITY;

  for (const item of order) {
    let start = item.element.startAtFrame;
    if (Number.isFinite(previousStart) && start - previousStart < triggerFrames) {
      start = previousStart + gapFrames;
    }
    nextStart.set(item.index, start);
    previousStart = start;
  }

  return elements.map((element, index) => ({
    ...element,
    startAtFrame: nextStart.get(index) ?? element.startAtFrame,
  }));
}
