import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { SceneElement } from '../../../types/scene';
import type { BoardLayoutProps } from '../SceneElementView';
import { TimedElement } from '../SceneElementView';
import {
  COMIC_CANVAS_HEIGHT,
  COMIC_CANVAS_WIDTH,
  COMIC_CAPTION_STYLE,
  COMIC_FONT_SIZE,
  COMIC_IMAGE_SCALE,
  COMIC_INK_COLOR,
  COMIC_MEDIA_STYLE,
  COMIC_PANEL_CHARACTER_STYLE,
  COMIC_PANEL_INNER_STYLE,
  COMIC_STAGE_STYLE,
  COMIC_STROKE_WIDTH,
  getComicGridLayoutParts,
  getComicPanelFrameStyle,
  getComicPanelImageSize,
  getComicPanelRects,
  isComicImage,
  isComicText,
  splitComicPanelContent,
  type ComicPanelRect,
} from '../defaults/comicGridDefaults';

const ROUGHNESS_FILTER_ID = 'ink-roughness-comic-grid';
const BOIL_HOLD_FRAMES = 3;

const ComicInkFrames: FC<{ rects: ComicPanelRect[] }> = ({ rects }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(Math.max(0, frame) / BOIL_HOLD_FRAMES);

  return (
    <svg
      aria-hidden
      className="ink-roughness"
      viewBox={`0 0 ${COMIC_CANVAS_WIDTH} ${COMIC_CANVAS_HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        mixBlendMode: 'multiply',
        zIndex: 20,
      }}
    >
      <defs>
        <filter
          id={ROUGHNESS_FILTER_ID}
          colorInterpolationFilters="sRGB"
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.07"
            numOctaves="2"
            result="noise"
            seed={seed}
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <g
        className="ink-roughness"
        filter={`url(#${ROUGHNESS_FILTER_ID})`}
        fill="none"
        stroke={COMIC_INK_COLOR}
        strokeWidth={COMIC_STROKE_WIDTH}
        strokeLinejoin="miter"
      >
        {rects.map((rect, index) => (
          <rect
            key={`comic-frame-${index}`}
            x={rect.x * COMIC_CANVAS_WIDTH}
            y={rect.y * COMIC_CANVAS_HEIGHT}
            width={rect.width * COMIC_CANVAS_WIDTH}
            height={rect.height * COMIC_CANVAS_HEIGHT}
          />
        ))}
      </g>
    </svg>
  );
};

const ComicPanel: FC<{
  videoId: string;
  sceneId: string;
  panelIndex: number;
  rect: ComicPanelRect;
  elements: SceneElement[];
  active: boolean;
}> = ({ videoId, sceneId, panelIndex, rect, elements, active }) => {
  const { characters, board } = splitComicPanelContent(elements);
  const imageSize = getComicPanelImageSize(panelIndex);
  const captions = board.filter(isComicText);
  const media = board.filter((element) => !isComicText(element));

  return (
    <div
      style={{
        ...getComicPanelFrameStyle(rect),
        zIndex: active ? 4 : 2,
      }}
    >
      <div style={COMIC_PANEL_INNER_STYLE}>
        {captions.length > 0 ? (
          <div style={COMIC_CAPTION_STYLE}>
            {captions.map((element, index) => (
              <TimedElement
                key={`${sceneId}-panel-${panelIndex}-caption-${index}`}
                sceneId={sceneId}
                index={panelIndex * 20 + index}
                videoId={videoId}
                element={element}
                inline
                fontSize={COMIC_FONT_SIZE}
                textAlign="center"
              />
            ))}
          </div>
        ) : null}

        <div style={COMIC_MEDIA_STYLE}>
          {media.map((element, index) => (
            <TimedElement
              key={`${sceneId}-panel-${panelIndex}-media-${index}`}
              sceneId={sceneId}
              index={panelIndex * 20 + 10 + index}
              videoId={videoId}
              element={element}
              inline
              size={isComicImage(element) ? imageSize : undefined}
              scale={isComicImage(element) ? COMIC_IMAGE_SCALE : undefined}
            />
          ))}
        </div>
      </div>

      {characters.map((element, index) => (
        <div
          key={`${sceneId}-panel-${panelIndex}-char-${index}`}
          style={COMIC_PANEL_CHARACTER_STYLE}
        >
          <TimedElement
            sceneId={sceneId}
            index={panelIndex * 20 + 10 + index}
            videoId={videoId}
            element={element}
            characterPosition="bottom_center"
          />
        </div>
      ))}
    </div>
  );
};

export const ComicGridLayout: FC<BoardLayoutProps> = ({
  videoId,
  scene,
  activePanelIndex: activeFromProps,
}) => {
  const frame = useCurrentFrame();
  const { panels, focusAt, zoomOutAt } = getComicGridLayoutParts(scene);
  const rects = getComicPanelRects();
  const activePanelIndex =
    activeFromProps ??
    (frame >= zoomOutAt
      ? null
      : frame >= focusAt[2] && focusAt[2] > 0
        ? 2
        : frame >= focusAt[1] && focusAt[1] > 0
          ? 1
          : 0);

  const [panel0, panel1, panel2] = panels;

  return (
    <AbsoluteFill>
      <div style={COMIC_STAGE_STYLE}>
        <ComicPanel
          videoId={videoId}
          sceneId={scene.id}
          panelIndex={0}
          rect={rects[0]}
          elements={panel0}
          active={activePanelIndex === 0}
        />
        <ComicPanel
          videoId={videoId}
          sceneId={scene.id}
          panelIndex={1}
          rect={rects[1]}
          elements={panel1}
          active={activePanelIndex === 1}
        />
        <ComicPanel
          videoId={videoId}
          sceneId={scene.id}
          panelIndex={2}
          rect={rects[2]}
          elements={panel2}
          active={activePanelIndex === 2}
        />
        <ComicInkFrames rects={rects} />
      </div>
    </AbsoluteFill>
  );
};
