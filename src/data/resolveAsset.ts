import panel01 from './projects/video-001/assets/panel-01.png';
import panel02 from './projects/video-001/assets/panel-02.png';
import panel03 from './projects/video-001/assets/panel-03.png';

const PROJECT_ASSETS: Record<string, Record<string, string>> = {
  'video-001': {
    'panel-01.png': panel01,
    'panel-02.png': panel02,
    'panel-03.png': panel03,
  },
};

export function resolvePanelImage(videoId: string, filename: string): string {
  const src = PROJECT_ASSETS[videoId]?.[filename];

  if (!src) {
    throw new Error(`Asset não encontrado: src/data/projects/${videoId}/assets/${filename}`);
  }

  return src;
}
