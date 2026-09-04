import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolvePanelImage } from '../../data/resolveAsset';
import type { PanelEffect } from '../../types/scene';
import { HatchReveal } from './HatchReveal';
import { MangaInkFilter } from './MangaInkFilter';
import { INK_SPRING } from './motion';

interface MangaPanelProps {
  videoId: string;
  panelImage: string;
  effect: PanelEffect;
}

export const MangaPanel = ({ videoId, panelImage, effect }: MangaPanelProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = resolvePanelImage(videoId, panelImage);

  const punch = spring({
    frame,
    fps,
    config: INK_SPRING,
  });

  const scale = interpolate(punch, [0, 1], [1.14, 1.02], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
      <MangaInkFilter />
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <HatchReveal effect={effect}>
          <Img
            src={src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${scale})`,
              filter: 'url(#manga-ink) contrast(1.8) grayscale(1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 7px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 5px)',
              mixBlendMode: 'multiply',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </HatchReveal>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 18,
          border: '6px solid #ffffff',
          boxShadow: 'inset 0 0 0 3px #000000',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
