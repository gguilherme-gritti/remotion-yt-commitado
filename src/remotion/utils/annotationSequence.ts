export function getAnnotationSequenceFrom(
  elementStartAtFrame: number,
  annotationStartFrame?: number,
): number {
  if (annotationStartFrame == null) {
    return 0;
  }

  return Math.max(0, annotationStartFrame - elementStartAtFrame);
}
