import type { CSSProperties, ReactNode } from 'react';
import { Sequence } from 'remotion';
import type { AnnotationKind } from '../../../types/scene';
import { GreenCheck } from './GreenCheck';
import { RedX } from './RedX';

export function getAnnotationSequenceFrom(
  elementStartAtFrame: number,
  annotationStartFrame?: number,
): number {
  if (annotationStartFrame == null) {
    return 0;
  }

  return Math.max(0, annotationStartFrame - elementStartAtFrame);
}

const OVERLAY_BOX: Record<'red_x' | 'green_check', CSSProperties> = {
  red_x: {
    position: 'absolute',
    inset: '-12%',
    zIndex: 8,
    pointerEvents: 'none',
  },
  green_check: {
    position: 'absolute',
    left: '10%',
    top: '-8%',
    width: '82%',
    height: '82%',
    zIndex: 8,
    pointerEvents: 'none',
  },
};

interface AnnotationOverlayProps {
  annotation?: AnnotationKind;
  from?: number;
}

export const AnnotationOverlay = ({
  annotation,
  from = 0,
}: AnnotationOverlayProps) => {
  if (annotation !== 'red_x' && annotation !== 'green_check') {
    return null;
  }

  return (
    <Sequence from={from} layout="none" name={`annotation-${annotation}`}>
      <div style={OVERLAY_BOX[annotation]}>
        {annotation === 'red_x' ? <RedX /> : <GreenCheck />}
      </div>
    </Sequence>
  );
};

interface AnnotatedBoxProps {
  annotation?: AnnotationKind;
  annotationFrom?: number;
  fill?: boolean;
  children: ReactNode;
}

export const AnnotatedBox = ({
  annotation,
  annotationFrom = 0,
  fill = false,
  children,
}: AnnotatedBoxProps) => {
  return (
    <div
      style={{
        position: 'relative',
        display: fill ? 'flex' : 'inline-block',
        width: fill ? '100%' : undefined,
        height: fill ? '100%' : undefined,
        overflow: 'visible',
      }}
    >
      {children}
      <AnnotationOverlay annotation={annotation} from={annotationFrom} />
    </div>
  );
};
