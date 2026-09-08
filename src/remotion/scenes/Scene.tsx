import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { SceneSchema } from '../../types/scene';
import { getDynamicCamera } from '../components/dynamicCamera';
import { EraserWipe } from '../components/EraserWipe';
import { FreeformLayout, LAYOUT_MAP, resolveLayoutCameraMoves } from '../components/layouts';

interface SceneProps {
  videoId: string;
  scene: SceneSchema;
}

export const Scene: FC<SceneProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { scale, x, y } = getDynamicCamera(resolveLayoutCameraMoves(scene), frame);
  const LayoutComponent =
    (scene.layoutType && LAYOUT_MAP[scene.layoutType]) || FreeformLayout;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      <EraserWipe durationFrames={scene.durationFrames}>
        <AbsoluteFill
          style={{
            transform: `scale(${scale}) translate(${x}px, ${y}px)`,
            transformOrigin: 'center center',
          }}
        >
          <LayoutComponent videoId={videoId} scene={scene} />
        </AbsoluteFill>
      </EraserWipe>
    </AbsoluteFill>
  );
};
