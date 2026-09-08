import type { CSSProperties } from 'react';
import type { ElementPosition } from '../../types/scene';

export function getElementPositionStyle(position: ElementPosition): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
  };

  switch (position) {
    case 'center':
      return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    case 'center_left':
      return { ...base, top: '50%', left: '5%', transform: 'translateY(-50%)' };
    case 'center_right':
      return { ...base, top: '50%', right: '5%', transform: 'translateY(-50%)' };
    case 'top_center':
      return { ...base, top: '6%', left: '50%', transform: 'translateX(-50%)' };
    case 'top_left':
      return { ...base, top: '6%', left: '5%' };
    case 'top_right':
      return { ...base, top: '6%', right: '5%' };
    case 'bottom_center':
      return { ...base, bottom: '8%', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom_left':
      return { ...base, bottom: '8%', left: '5%' };
    case 'bottom_right':
      return { ...base, bottom: '6%', right: '3%' };
  }
}
