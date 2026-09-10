import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  FLOW_CAPTION_AREA_STYLE,
  FLOW_CAPTION_COLOR,
  FLOW_CAPTION_FONT_SIZE,
  FLOW_CAPTION_STROKE,
  FLOW_CAPTION_STROKE_WIDTH,
  FLOW_CHARACTER_SCALE,
  FLOW_TITLE_FONT_SIZE,
  getFlowItemScale,
  getFlowLayoutParts,
  getFlowSlotStyle,
} from './flowDefaults';

export const VerticalFlowLayout: FC<BoardLayoutProps> = ({ videoId, scene }) => {
  const { character, title, captions, items } = getFlowLayoutParts(scene);
  const itemScale = getFlowItemScale(items.length);

  return (
    <AbsoluteFill>
      {title ? (
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 35,
            pointerEvents: 'none',
          }}
        >
          <TimedElement
            sceneId={scene.id}
            index={0}
            videoId={videoId}
            element={title}
            inline
            textAlign="center"
            fontSize={FLOW_TITLE_FONT_SIZE}
          />
        </div>
      ) : null}

      {captions.length > 0 ? (
        <div style={FLOW_CAPTION_AREA_STYLE}>
          {captions.map((element, index) => (
            <div
              key={`${scene.id}-caption-${index}`}
              style={{
                width: '100%',
                minHeight: FLOW_CAPTION_FONT_SIZE * 1.25,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <TimedElement
                sceneId={scene.id}
                index={200 + index}
                videoId={videoId}
                element={element}
                inline
                textAlign="center"
                fontSize={FLOW_CAPTION_FONT_SIZE}
                color={FLOW_CAPTION_COLOR}
                strokeColor={FLOW_CAPTION_STROKE}
                strokeWidth={FLOW_CAPTION_STROKE_WIDTH}
                nowrap
                letterSpacing={1}
              />
            </div>
          ))}
        </div>
      ) : null}

      {items.map((element, index) => (
        <div
          key={`${scene.id}-flow-${index}`}
          style={getFlowSlotStyle(index, items.length)}
        >
          <TimedElement
            sceneId={scene.id}
            index={index + 1}
            videoId={videoId}
            element={element}
            inline
            size={element.type === 'image' ? 'small' : undefined}
            scale={element.type === 'image' ? itemScale : undefined}
            fontSize={element.type === 'text' ? 40 : undefined}
            textAlign="center"
          />
        </div>
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          transform: `scale(${FLOW_CHARACTER_SCALE})`,
          transformOrigin: 'right bottom',
        }}
      >
        <TimedElement
          sceneId={scene.id}
          index={100}
          videoId={videoId}
          element={character}
          characterPosition="bottom_right"
        />
      </div>
    </AbsoluteFill>
  );
};
