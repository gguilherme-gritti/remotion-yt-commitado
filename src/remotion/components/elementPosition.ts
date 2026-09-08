import type { CSSProperties } from 'react';
import type { CharacterPosition, ElementPosition } from '../../types/scene';

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

export function getCharacterLayoutStyle(position: CharacterPosition): {
  wrapper: CSSProperties;
  image: CSSProperties;
} {
  const imageBase: CSSProperties = {
    display: 'block',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
  };

  switch (position) {
    case 'bottom_left':
      return {
        wrapper: {
          ...base,
          left: 40,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          overflow: 'visible',
        },
        image: {
          ...imageBase,
          height: 350,
          maxHeight: '100%',
          width: 'auto',
          maxWidth: 310,
          objectPosition: 'bottom left',
        },
      };
    case 'left_giant':
      return {
        wrapper: {
          ...base,
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '25%',
          height: '60%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'visible',
        },
        image: {
          ...imageBase,
          width: '100%',
          height: '100%',
          objectPosition: 'left center',
        },
      };
    case 'center':
      return {
        wrapper: {
          ...base,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '27%',
          height: '51%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        },
        image: {
          ...imageBase,
          width: '100%',
          height: '100%',
          objectPosition: 'center center',
        },
      };
    case 'bottom_right':
    default:
      return {
        wrapper: {
          ...base,
          right: 40,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          overflow: 'visible',
        },
        image: {
          ...imageBase,
          height: 350,
          maxHeight: '100%',
          width: 'auto',
          maxWidth: 310,
          objectPosition: 'bottom right',
        },
      };
  }
}
