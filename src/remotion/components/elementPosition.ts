import type { CSSProperties } from 'react';
import type { ElementPosition } from '../../types/scene';

const SAFE_MARGIN_PX = 80;

const base: CSSProperties = {
  position: 'absolute',
};

export function getElementPositionStyle(position: ElementPosition): CSSProperties {
  return getSketchImagePositionStyle(position);
}

export function getSketchImagePositionStyle(position: ElementPosition): CSSProperties {
  switch (position) {
    case 'center_left':
      return {
        ...base,
        left: '12%',
        top: '50%',
        transform: 'translate(0, -50%)',
      };
    case 'center':
      return {
        ...base,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case 'center_right':
      return {
        ...base,
        right: '18%',
        top: '50%',
        transform: 'translate(0, -50%)',
      };
    case 'top_center':
      return {
        ...base,
        left: '50%',
        top: '15%',
        transform: 'translate(-50%, 0)',
      };
    case 'top_left':
      return { ...base, top: SAFE_MARGIN_PX, left: SAFE_MARGIN_PX };
    case 'top_right':
      return { ...base, top: SAFE_MARGIN_PX, right: SAFE_MARGIN_PX };
    case 'bottom_center':
      return {
        ...base,
        bottom: SAFE_MARGIN_PX,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    case 'bottom_left':
      return { ...base, bottom: SAFE_MARGIN_PX, left: SAFE_MARGIN_PX };
    case 'bottom_right':
      return { ...base, bottom: SAFE_MARGIN_PX, right: 220 };
  }
}
