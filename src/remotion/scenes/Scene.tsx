import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { AnnotationElement, SceneSchema } from '../../types/scene';
import { getDynamicCamera } from '../components/dynamicCamera';
import { FreeformLayout, LAYOUT_MAP, resolveLayoutCameraMoves } from '../components/layouts';
import { TimedElement } from '../components/SceneElementView';

interface SceneProps {
  videoId: string;
  scene: SceneSchema;
}

export const Scene: FC<SceneProps> = ({ videoId, scene }) => {
  const frame = useCurrentFrame();
  const { scale, x, y } = getDynamicCamera(resolveLayoutCameraMoves(scene), frame);
  const LayoutComponent =
    (scene.layoutType && LAYOUT_MAP[scene.layoutType]) || FreeformLayout;
  const annotations = scene.elements.filter(
    (element): element is AnnotationElement =>
      element.type === 'annotation' && !element.nested,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
          transformOrigin: 'center center',
        }}
      >
        <LayoutComponent videoId={videoId} scene={scene} />
        {annotations.map((element, index) => (
          <TimedElement
            key={`${scene.id}-annotation-${index}`}
            sceneId={scene.id}
            index={900 + index}
            videoId={videoId}
            element={element}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
