import type { SceneElement } from '../../types/scene';

/** Gaps menores que isto disparam o respiro automático. */
export const ENTRY_CADENCE_TRIGGER_FRAMES = 20;
/** Espaçamento forçado (25–30) quando as entradas estão coladas. */
export const ENTRY_CADENCE_GAP_FRAMES = 28;

/**
 * Se dois elementos consecutivos entram com menos de 20 frames de intervalo,
 * empurra o seguinte para um respiro de 28 frames a partir do anterior já ajustado.
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
