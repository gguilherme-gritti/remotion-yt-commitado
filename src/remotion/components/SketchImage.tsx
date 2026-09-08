import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveProjectImage } from "../../data/resolveAsset";
import type { ElementPosition, ImageAnimation } from "../../types/scene";
import { getSketchImagePositionStyle } from "./elementPosition";
import { POP_SPRING, SOFT_SPRING } from "./motion";

interface SketchImageProps {
  videoId: string;
  src: string;
  position: ElementPosition;
  animation?: ImageAnimation | null;
}

export const SketchImage = ({
  videoId,
  src,
  position,
  animation,
}: SketchImageProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const useSoftEntry =
    animation == null || animation === "none" || animation === "slide_in";

  const pop = spring({
    frame,
    fps,
    config: useSoftEntry ? SOFT_SPRING : POP_SPRING,
  });

  const fromScale = useSoftEntry ? 0.85 : 0.78;
  const scale = interpolate(pop, [0, 1], [fromScale, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 10 }}>
      <div style={getSketchImagePositionStyle(position)}>
        <Img
          src={resolveProjectImage(videoId, src)}
          style={{
            display: "block",
            width: 520,
            maxWidth: 580,
            maxHeight: 580,
            height: "auto",
            objectFit: "contain",
            backgroundColor: "transparent",
            mixBlendMode: "multiply",
            opacity,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
