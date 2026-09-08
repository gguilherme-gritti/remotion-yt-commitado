import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolvePanelImage } from "../../data/resolveAsset";
import type { PanelEffect } from "../../types/scene";
import { HatchReveal } from "./HatchReveal";
import { MangaInkFilter } from "./MangaInkFilter";
import { INK_SPRING } from "./motion";

interface MangaPanelProps {
  videoId: string;
  panelImage: string;
  effect: PanelEffect;
}

export const MangaPanel = ({
  videoId,
  panelImage,
  effect,
}: MangaPanelProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = resolvePanelImage(videoId, panelImage);

  const punch = spring({
    frame,
    fps,
    config: INK_SPRING,
  });

  const scale = interpolate(punch, [0, 1], [1.14, 1.02], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: "transparent", overflow: "visible" }}
    >
      <MangaInkFilter />
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "5%",
          width: "63%",
          height: "63%",
          overflow: "hidden",
          backgroundColor: "#000000",
          border: "6px solid #000000",
          boxShadow: "12px 12px 0px #000000",
        }}
      >
        <HatchReveal key={panelImage} effect={effect}>
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
              filter: "url(#manga-ink) contrast(1.2) grayscale(1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 7px)",
              mixBlendMode: "multiply",
            }}
          />
        </HatchReveal>
      </div>
    </AbsoluteFill>
  );
};
