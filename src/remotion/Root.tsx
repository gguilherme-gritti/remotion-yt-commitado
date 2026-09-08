import type { CalculateMetadataFunction } from 'remotion';
import { Composition, getInputProps } from 'remotion';
import { DEFAULT_VIDEO_ID, loadProject } from '../data/loadProject';
import { getScenesDuration } from './sceneTimeline';
import type { MainCompositionProps } from './scenes/MainComposition';
import { MainComposition } from './scenes/MainComposition';

const inputProps = getInputProps() as { videoId?: string };
const initialVideoId = inputProps.videoId ?? DEFAULT_VIDEO_ID;
const initialProject = loadProject(initialVideoId);

const defaultProps: MainCompositionProps = {
  videoId: initialVideoId,
  scenes: initialProject.scenes,
};

const calculateMetadata: CalculateMetadataFunction<MainCompositionProps> = ({ props }) => {
  const project = loadProject(props.videoId);
  const durationInFrames = getScenesDuration(project.scenes) || project.meta.totalFrames;

  return {
    durationInFrames,
    fps: project.meta.fps,
    props: {
      videoId: props.videoId,
      scenes: project.scenes,
    },
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="MainComposition"
      component={MainComposition}
      durationInFrames={getScenesDuration(initialProject.scenes) || initialProject.meta.totalFrames}
      fps={initialProject.meta.fps}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
