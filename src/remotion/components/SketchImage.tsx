import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveProjectImage } from "../../data/resolveAsset";
import type {
  AnnotationDirection,
  AnnotationKind,
  ElementPosition,
  ImageAnimation,
  ImageSize,
} from "../../types/scene";
import { AnnotatedBox } from "./annotations/AnnotationOverlay";
import { LineBoil } from "./effects/LineBoilFilter";
import { getSketchImagePositionStyle } from "../utils/elementPosition";
import { POP_SPRING, SOFT_SPRING } from "../utils/motion";
import { usePacing } from "../utils/usePacing";

interface SketchImageProps {
  videoId: string;
  src: string;
  position: ElementPosition;
  animation?: ImageAnimation | null;
  size?: ImageSize;
  scale?: number;
  inline?: boolean;
  annotation?: AnnotationKind;
  annotationFrom?: number;
  annotationColor?: string;
  annotationDirection?: AnnotationDirection;
  lineBoil?: boolean;
}

const IMAGE_SIZE_WIDTH: Record<ImageSize, number> = {
  small: 220,
  medium: 480,
  large: 700,
  hero: 950,
};

const BASE_IMAGE_WIDTH = IMAGE_SIZE_WIDTH.medium;

function resolveImageWidth(size?: ImageSize, scale?: number): number {
  const tokenWidth = size ? IMAGE_SIZE_WIDTH[size] : BASE_IMAGE_WIDTH;

  if (scale != null && Number.isFinite(scale) && scale > 0) {
    return tokenWidth * scale;
  }

  return tokenWidth;
}

export const SketchImage = ({
  videoId,
  src,
  position,
  animation,
  size,
  scale: sizeScale,
  inline = false,
  annotation,
  annotationFrom,
  annotationColor,
  annotationDirection,
  lineBoil = true,
}: SketchImageProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { entryFrames } = usePacing();
  const useSoftEntry =
    animation == null || animation === "none" || animation === "slide_in";
  const width = resolveImageWidth(size, sizeScale);

  const pop = spring({
    frame,
    fps,
    durationInFrames: entryFrames,
    config: useSoftEntry ? SOFT_SPRING : POP_SPRING,
  });

  const fromScale = useSoftEntry ? 0.85 : 0.78;
  const enterScale = interpolate(pop, [0, 1], [fromScale, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, Math.min(10, entryFrames)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const image = (
    <AnnotatedBox
      annotation={annotation}
      annotationFrom={annotationFrom}
      annotationColor={annotationColor}
      annotationDirection={annotationDirection}
    >
      <LineBoil enabled={lineBoil} mixBlendMode="multiply">
        <Img
          src={resolveProjectImage(videoId, src)}
          style={{
            display: "block",
            width,
            maxWidth: width,
            maxHeight: width,
            height: "auto",
            objectFit: "contain",
            objectPosition: "center center",
            backgroundColor: "transparent",
            mixBlendMode: lineBoil ? undefined : "multiply",
            opacity,
            transform: `scale(${enterScale})`,
            transformOrigin: "center center",
          }}
        />
      </LineBoil>
    </AnnotatedBox>
  );

  if (inline) {
    return (
      <div style={{ display: "inline-block", mixBlendMode: "multiply" }}>
        {image}
      </div>
    );
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: annotation && annotation !== "none" ? 55 : 4,
        overflow: "visible",
      }}
    >
      <div style={getSketchImagePositionStyle(position)}>{image}</div>
    </AbsoluteFill>
  );
};
