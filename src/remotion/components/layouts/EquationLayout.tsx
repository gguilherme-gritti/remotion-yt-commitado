import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { getDynamicCamera } from '../dynamicCamera';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import { resolveLayoutCameraMoves } from './layoutCamera';
import {
  EQUATION_CHARACTER_SCALE,
  EQUATION_SLOT_OP_STYLE,
  EQUATION_SLOT_STYLE,
  EQUATION_TITLE_FONT_SIZE,
  getEquationLayoutParts,
  getEquationSlotLeft,
} from './equationDefaults';

export const EquationLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { scale } = getDynamicCamera(resolveLayoutCameraMoves(scene), frame);
  const { character, title, objectA, operator, objectB } = getEquationLayoutParts(scene);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${EQUATION_CHARACTER_SCALE})`,
          transformOrigin: 'center bottom',
        }}
      >
        <TimedElement
          sceneId={scene.id}
          index={0}
          videoId={videoId}
          element={character}
          characterPosition="bottom_center"
        />
      </div>

      {title ? (
        <TimedElement
          sceneId={scene.id}
          index={1}
          videoId={videoId}
          element={title}
          position="top_center"
          textAlign="center"
          fontSize={EQUATION_TITLE_FONT_SIZE}
        />
      ) : null}

      {objectA ? (
        <div style={{ ...EQUATION_SLOT_STYLE, left: getEquationSlotLeft(scale, 'a') }}>
          <TimedElement
            sceneId={scene.id}
            index={10}
            videoId={videoId}
            element={objectA}
            inline
            size={objectA.size ?? 'medium'}
          />
        </div>
      ) : null}

      {operator ? (
        <div style={EQUATION_SLOT_OP_STYLE}>
          <TimedElement
            sceneId={scene.id}
            index={11}
            videoId={videoId}
            element={operator}
            inline
            size={operator.size ?? 'small'}
          />
        </div>
      ) : null}

      {objectB ? (
        <div style={{ ...EQUATION_SLOT_STYLE, left: getEquationSlotLeft(scale, 'b') }}>
          <TimedElement
            sceneId={scene.id}
            index={12}
            videoId={videoId}
            element={objectB}
            inline
            size={objectB.size ?? 'medium'}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
