import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface SpeedLinesProps {
  intensity: number;
}

export const SpeedLines = ({ intensity }: SpeedLinesProps) => {
  const frame = useCurrentFrame();
  const clamped = Math.max(0, Math.min(1, intensity));
  const flicker = 0.75 + Math.sin(frame * 3.1) * 0.25;

  if (clamped <= 0.02) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {LINES.map((line, index) => {
        const width = interpolate(clamped, [0, 1], [0, line.length]);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              right: line.right,
              bottom: line.bottom,
              width,
              height: line.thickness,
              backgroundColor: '#ffffff',
              transform: `rotate(${line.angle}deg)`,
              transformOrigin: 'right center',
              opacity: clamped * flicker * line.opacity,
              boxShadow: '0 0 0 1px #000',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const LINES = [
  { right: 80, bottom: 220, length: 520, thickness: 6, angle: -12, opacity: 0.9 },
  { right: 40, bottom: 340, length: 640, thickness: 10, angle: -4, opacity: 1 },
  { right: 120, bottom: 470, length: 480, thickness: 4, angle: 8, opacity: 0.8 },
  { right: 20, bottom: 160, length: 380, thickness: 5, angle: -22, opacity: 0.7 },
  { right: 90, bottom: 560, length: 420, thickness: 7, angle: 16, opacity: 0.85 },
  { right: 160, bottom: 280, length: 300, thickness: 3, angle: 3, opacity: 0.6 },
];
