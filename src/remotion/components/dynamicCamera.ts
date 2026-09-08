import { interpolate } from 'remotion';
import type { CameraMove, ElementPosition } from '../../types/scene';

const CAMERA_BLEND_FRAMES = 42;

export type CameraPose = {
  scale: number;
  x: number;
  y: number;
};

const IDENTITY: CameraPose = { scale: 1, x: 0, y: 0 };

export function getDynamicCamera(moves: CameraMove[], frame: number): CameraPose {
  const ordered = [...moves].sort((a, b) => a.startAtFrame - b.startAtFrame);
  let pose = IDENTITY;

  for (const move of ordered) {
    if (move.startAtFrame > frame) {
      break;
    }

    const target = poseFromMove(move);
    const start = move.startAtFrame;
    const end = start + CAMERA_BLEND_FRAMES;

    if (frame >= end) {
      pose = target;
      continue;
    }

    pose = {
      scale: interpolate(frame, [start, end], [pose.scale, target.scale], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
      x: interpolate(frame, [start, end], [pose.x, target.x], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
      y: interpolate(frame, [start, end], [pose.y, target.y], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  }

  return pose;
}

function poseFromMove(move: CameraMove): CameraPose {
  const focus = positionToOffset(move.target);
  let { x, y } = focus;
  let scale = move.zoom > 0 ? move.zoom : 1;

  switch (move.type) {
    case 'zoom_in':
      scale = Math.max(scale, 1.06);
      break;
    case 'zoom_out':
      scale = Math.min(scale, 1);
      break;
    case 'pan_right':
      x -= 150;
      break;
    case 'pan_left':
      x += 150;
      break;
    case 'none':
      break;
  }

  return { scale, x, y };
}

function positionToOffset(position: ElementPosition): { x: number; y: number } {
  switch (position) {
    case 'center':
      return { x: 0, y: 0 };
    case 'center_left':
      return { x: 210, y: 10 };
    case 'center_right':
      return { x: -180, y: -20 };
    case 'top_center':
      return { x: 0, y: 110 };
    case 'top_left':
      return { x: 200, y: 90 };
    case 'top_right':
      return { x: -160, y: 90 };
    case 'bottom_center':
      return { x: 0, y: -70 };
    case 'bottom_left':
      return { x: 200, y: -50 };
    case 'bottom_right':
      return { x: -120, y: -50 };
  }
}
