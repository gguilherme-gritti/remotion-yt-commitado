import { Player } from '@remotion/player';
import { DEFAULT_VIDEO_ID, loadProject } from './data/loadProject';
import { MainComposition } from './remotion/scenes/MainComposition';

const project = loadProject(DEFAULT_VIDEO_ID);

function App() {
  return (
    <div className="app-shell">
      <Player
        component={MainComposition}
        inputProps={{
          videoId: DEFAULT_VIDEO_ID,
          scenes: project.scenes,
        }}
        durationInFrames={project.meta.totalFrames}
        fps={project.meta.fps}
        compositionWidth={1920}
        compositionHeight={1080}
        acknowledgeRemotionLicense
        style={{ width: '100%', height: '100%' }}
        controls
      />
    </div>
  );
}

export default App;
