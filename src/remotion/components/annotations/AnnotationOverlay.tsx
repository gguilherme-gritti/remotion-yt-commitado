import type { CSSProperties, ReactNode } from 'react';
import { Sequence } from 'remotion';
import type {
  AnnotationDirection,
  AnnotationKind,
} from '../../../types/scene';
import {
  DRAWN_ARROW_GAP_PX,
  DRAWN_ARROW_HEIGHT,
  DRAWN_ARROW_MAX_HEIGHT,
  DRAWN_ARROW_MAX_WIDTH,
  DRAWN_ARROW_ORIGIN_INSET,
  DRAWN_ARROW_WIDTH,
  DrawnArrow,
} from './DrawnArrow';
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

type DrawableAnnotation = Exclude<AnnotationKind, 'none'>;

const MARK_OVERLAY: Record<'red_x' | 'green_check', CSSProperties> = {
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

const ARROW_BOX: CSSProperties = {
  position: 'absolute',
  zIndex: 8,
  pointerEvents: 'none',
  maxWidth: DRAWN_ARROW_MAX_WIDTH,
  maxHeight: DRAWN_ARROW_MAX_HEIGHT,
};

const ARROW_OVERLAY: Record<AnnotationDirection, CSSProperties> = {
  right: {
    ...ARROW_BOX,
    left: DRAWN_ARROW_ORIGIN_INSET,
    top: '50%',
    width: DRAWN_ARROW_WIDTH,
    height: DRAWN_ARROW_HEIGHT,
    transform: `translate(${DRAWN_ARROW_GAP_PX}px, -50%)`,
  },
  left: {
    ...ARROW_BOX,
    right: DRAWN_ARROW_ORIGIN_INSET,
    top: '50%',
    width: DRAWN_ARROW_WIDTH,
    height: DRAWN_ARROW_HEIGHT,
    transform: `translate(-${DRAWN_ARROW_GAP_PX}px, -50%)`,
  },
  up: {
    ...ARROW_BOX,
    left: '50%',
    bottom: DRAWN_ARROW_ORIGIN_INSET,
    width: DRAWN_ARROW_HEIGHT,
    height: DRAWN_ARROW_WIDTH,
    maxWidth: DRAWN_ARROW_MAX_HEIGHT,
    maxHeight: DRAWN_ARROW_MAX_WIDTH,
    transform: `translate(-50%, -${DRAWN_ARROW_GAP_PX}px)`,
  },
  down: {
    ...ARROW_BOX,
    left: '50%',
    top: DRAWN_ARROW_ORIGIN_INSET,
    width: DRAWN_ARROW_HEIGHT,
    height: DRAWN_ARROW_WIDTH,
    maxWidth: DRAWN_ARROW_MAX_HEIGHT,
    maxHeight: DRAWN_ARROW_MAX_WIDTH,
    transform: `translate(-50%, ${DRAWN_ARROW_GAP_PX}px)`,
  },
  curve_right: {
    ...ARROW_BOX,
    left: DRAWN_ARROW_ORIGIN_INSET,
    top: '46%',
    width: DRAWN_ARROW_WIDTH,
    height: DRAWN_ARROW_HEIGHT,
    transform: `translate(${DRAWN_ARROW_GAP_PX}px, -42%)`,
  },
};

function getOverlayBox(
  annotation: DrawableAnnotation,
  direction: AnnotationDirection = 'right',
): CSSProperties {
  if (annotation === 'drawn_arrow') {
    return ARROW_OVERLAY[direction];
  }

  return MARK_OVERLAY[annotation];
}

interface AnnotationMarkProps {
  annotation: DrawableAnnotation;
  color?: string;
  direction?: AnnotationDirection;
}

export const AnnotationMark = ({
  annotation,
  color,
  direction,
}: AnnotationMarkProps) => {
  switch (annotation) {
    case 'red_x':
      return <RedX />;
    case 'green_check':
      return <GreenCheck />;
    case 'drawn_arrow':
      return <DrawnArrow color={color} direction={direction} />;
  }
};

interface AnnotationOverlayProps {
  annotation?: AnnotationKind;
  from?: number;
  color?: string;
  direction?: AnnotationDirection;
}

export const AnnotationOverlay = ({
  annotation,
  from = 0,
  color,
  direction,
}: AnnotationOverlayProps) => {
  if (
    annotation !== 'red_x' &&
    annotation !== 'green_check' &&
    annotation !== 'drawn_arrow'
  ) {
    return null;
  }

  return (
    <Sequence from={from} layout="none" name={`annotation-${annotation}`}>
      <div style={getOverlayBox(annotation, direction)}>
        <AnnotationMark
          annotation={annotation}
          color={color}
          direction={direction}
        />
      </div>
    </Sequence>
  );
};

interface AnnotatedBoxProps {
  annotation?: AnnotationKind;
  annotationFrom?: number;
  annotationColor?: string;
  annotationDirection?: AnnotationDirection;
  fill?: boolean;
  children: ReactNode;
}

export const AnnotatedBox = ({
  annotation,
  annotationFrom = 0,
  annotationColor,
  annotationDirection,
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
      <AnnotationOverlay
        annotation={annotation}
        from={annotationFrom}
        color={annotationColor}
        direction={annotationDirection}
      />
    </div>
  );
};
