import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CameraAnimation } from '../../types/scene';
import { getShakeOffset, INK_SPRING } from './motion';

interface CameraMotionProps {
  type?: CameraAnimation | null;
  durationFrames: number;
  children: ReactNode;
}

export const CameraMotion = ({ type, durationFrames, children }: CameraMotionProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { scale, x, y } = getCameraTransform(type, frame, fps, durationFrames);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function getCameraTransform(
  type: CameraAnimation | null | undefined,
  frame: number,
  fps: number,
  durationFrames: number,
): { scale: number; x: number; y: number } {
  const lastFrame = Math.max(1, durationFrames - 1);

  switch (type) {
    case 'slow_zoom_in': {
      const scale = interpolate(frame, [0, lastFrame], [1, 1.14], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return { scale, x: 0, y: 0 };
    }
    case 'punch_zoom': {
      const punch = spring({
        frame,
        fps,
        config: INK_SPRING,
      });
      const scale = interpolate(punch, [0, 1], [1, 1.24], {
        extrapolateRight: 'clamp',
      });
      return { scale, x: 0, y: 0 };
    }
    case 'pan_down': {
      const scale = 1.16;
      const y = interpolate(frame, [0, lastFrame], [40, -90], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      return { scale, x: 0, y };
    }
    case 'screen_shake': {
      const decay = interpolate(frame, [0, Math.min(16, lastFrame)], [1, 0.18], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const shake = getShakeOffset(frame, 16 * decay);
      return { scale: 1.08, x: shake.x, y: shake.y };
    }
    case 'scroll_down':
      return { scale: 1.2, x: 0, y: scroll(0, -80) };
    case 'scroll_up':
      return { scale: 1.2, x: 0, y: scroll(0, 80) };
    case 'scroll_right':
      return { scale: 1.2, x: scroll(0, -120), y: 0 };
    case 'scroll_left':
      return { scale: 1.2, x: scroll(0, 120), y: 0 };
    default:
      return { scale: 1, x: 0, y: 0 };
  }

  function scroll(from: number, to: number) {
    return interpolate(frame, [0, lastFrame], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
}
