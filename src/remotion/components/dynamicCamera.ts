import { interpolate } from 'remotion';
import type { CameraMove, CameraTarget } from '../../types/scene';

const CAMERA_BLEND_FRAMES = 42;
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const MAX_ZOOM = 1.6;

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
  const focus = getCameraFocusPoint(move.target);
  let scale = move.zoom > 0 ? move.zoom : 1;

  switch (move.type) {
    case 'zoom_in':
      scale = Math.max(scale, 1.08);
      break;
    case 'zoom_out':
      scale = Math.min(scale, 1);
      break;
    default:
      break;
  }

  scale = Math.min(Math.max(scale, 0.85), MAX_ZOOM);

  let x = CENTER_X - focus.x;
  let y = CENTER_Y - focus.y;

  if (move.type === 'pan_right') {
    x -= 90;
  }

  if (move.type === 'pan_left') {
    x += 90;
  }

  return { scale, x, y };
}

function getCameraFocusPoint(target: CameraTarget): { x: number; y: number } {
  switch (target) {
    case 'center':
      return { x: CENTER_X, y: CENTER_Y };
    case 'top_left':
      return { x: CANVAS_WIDTH * 0.22, y: CANVAS_HEIGHT * 0.22 };
    case 'top_right':
      return { x: CANVAS_WIDTH * 0.78, y: CANVAS_HEIGHT * 0.22 };
    case 'speech_bubble':
      return { x: CANVAS_WIDTH * 0.74, y: CANVAS_HEIGHT * 0.28 };
    case 'top_center':
      return { x: CENTER_X, y: CANVAS_HEIGHT * 0.2 };
    case 'center_left':
      return { x: CANVAS_WIDTH * 0.22, y: CENTER_Y };
    case 'center_right':
      return { x: CANVAS_WIDTH * 0.72, y: CENTER_Y };
    case 'bottom_center':
      return { x: CENTER_X, y: CANVAS_HEIGHT * 0.8 };
    case 'bottom_left':
      return { x: CANVAS_WIDTH * 0.2, y: CANVAS_HEIGHT * 0.8 };
    case 'bottom_right':
      return { x: CANVAS_WIDTH * 0.82, y: CANVAS_HEIGHT * 0.82 };
    case 'left_giant':
      return { x: CANVAS_WIDTH * 0.18, y: CENTER_Y };
  }
}
