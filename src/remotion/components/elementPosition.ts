import type { CSSProperties } from 'react';
import type { ElementPosition } from '../../types/scene';

const base: CSSProperties = {
  position: 'absolute',
};

export function getElementPositionStyle(position: ElementPosition): CSSProperties {
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

/** Posições de imagem com faixa segura: 420px de largura, acima do avatar (~480px no canto inferior direito). */
export function getSketchImagePositionStyle(position: ElementPosition): CSSProperties {
  switch (position) {
    case 'center_left':
      return { ...base, top: '38%', left: '5%', transform: 'translateY(-50%)' };
    case 'center':
      return { ...base, top: '36%', left: '46%', transform: 'translate(-50%, -50%)' };
    case 'center_right':
      return { ...base, top: '28%', right: '8%', transform: 'translateY(-50%)' };
    case 'top_center':
      return { ...base, top: '5%', left: '46%', transform: 'translateX(-50%)' };
    case 'top_left':
      return { ...base, top: '5%', left: '5%' };
    case 'top_right':
      return { ...base, top: '5%', right: '8%' };
    case 'bottom_center':
      return { ...base, bottom: '48%', left: '46%', transform: 'translateX(-50%)' };
    case 'bottom_left':
      return { ...base, bottom: '8%', left: '5%' };
    case 'bottom_right':
      return { ...base, top: '28%', right: '28%' };
  }
}
