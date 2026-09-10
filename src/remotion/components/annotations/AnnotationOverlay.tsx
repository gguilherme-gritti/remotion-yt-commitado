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
import { CrossHatch } from './CrossHatch';
import { GreenCheck } from './GreenCheck';
import {
  ENCIRCLE_DEFAULT_COLOR,
  HandDrawnEncircle,
} from './HandDrawnEncircle';
import { HIGHLIGHT_DEFAULT_COLOR, Highlight } from './Highlight';
import { InkSplatter } from './InkSplatter';
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

const MARK_OVERLAY: Record<
  | 'red_x'
  | 'green_check'
  | 'highlight'
  | 'cross_hatch'
  | 'ink_splatter'
  | 'encircle',
  CSSProperties
> = {
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
  highlight: {
    position: 'absolute',
    left: '-4%',
    right: '-4%',
    top: '14%',
    height: '72%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  cross_hatch: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 8,
    pointerEvents: 'none',
  },
  ink_splatter: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '48%',
    height: '48%',
    zIndex: 9,
    overflow: 'visible',
    pointerEvents: 'none',
  },
  encircle: {
    position: 'absolute',
    inset: -20,
    zIndex: 8,
    overflow: 'visible',
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
    case 'highlight':
      return <Highlight color={color ?? HIGHLIGHT_DEFAULT_COLOR} />;
    case 'cross_hatch':
      return <CrossHatch />;
    case 'ink_splatter':
      return <InkSplatter />;
    case 'encircle':
      return <HandDrawnEncircle color={color ?? ENCIRCLE_DEFAULT_COLOR} />;
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
    annotation !== 'drawn_arrow' &&
    annotation !== 'highlight' &&
    annotation !== 'cross_hatch' &&
    annotation !== 'ink_splatter' &&
    annotation !== 'encircle'
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
  const overlay = (
    <AnnotationOverlay
      annotation={annotation}
      from={annotationFrom}
      color={annotationColor}
      direction={annotationDirection}
    />
  );

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
      {annotation === 'highlight' ? overlay : null}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: fill ? 'flex' : undefined,
          width: fill ? '100%' : undefined,
          height: fill ? '100%' : undefined,
        }}
      >
        {children}
      </div>
      {annotation !== 'highlight' ? overlay : null}
    </div>
  );
};
