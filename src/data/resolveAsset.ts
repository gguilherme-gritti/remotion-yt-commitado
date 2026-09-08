import { staticFile } from 'remotion';
import panel01 from './projects/video-001/assets/panel-01.png';
import panel02 from './projects/video-001/assets/panel-02.png';
import panel03 from './projects/video-001/assets/panel-03.png';

const PROJECT_IMAGES: Record<string, Record<string, string>> = {
  'video-001': {
    'panel-01.png': panel01,
    'panel-02.png': panel02,
    'panel-03.png': panel03,
  },
};

export function resolveCharacterSrc(pose: string): string {
  const file = pose.includes('.') ? pose : `${pose}.svg`;

  if (file.startsWith('characters/')) {
    return staticFile(file);
  }

  return staticFile(`characters/${file}`);
}

export function resolveProjectImage(videoId: string, filename: string): string {
  const mapped = PROJECT_IMAGES[videoId]?.[filename];

  if (mapped) {
    return mapped;
  }

  return staticFile(`projects/${videoId}/assets/${filename}`);
}
