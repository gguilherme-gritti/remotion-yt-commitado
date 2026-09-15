import type { ProjectManifestSchema, ProjectSchema, SceneSchema } from '../types/scene';
import { withPacedDuration } from '../remotion/components/layouts/resolveSceneDuration';
import { resolveTransitionType } from '../remotion/components/transitions';
import activeProject from './projects/active-project.json';
import { VIDEO_001_LAYOUTS } from './projects/video-001/layouts';
import video001Manifest from './projects/video-001/scenes.json';
import { VIDEO_002_LAYOUTS } from './projects/video-002/layouts';
import video002Manifest from './projects/video-002/scenes.json';

export const DEFAULT_VIDEO_ID: string = activeProject.videoId;

function assembleProject(
  manifest: ProjectManifestSchema,
  layouts: Record<string, SceneSchema>,
): ProjectSchema {
  const scenes = manifest.scenes.map((layoutId, index) => {
    const scene = layouts[layoutId];

    if (!scene) {
      throw new Error(`Layout não encontrado: ${layoutId}`);
    }

    const previous = index > 0 ? layouts[manifest.scenes[index - 1]] : undefined;
    const type = resolveTransitionType(scene.transitionType);
    const previousType = previous
      ? resolveTransitionType(previous.transitionType)
      : undefined;

    return withPacedDuration({
      ...scene,
      transitionIn: previousType === 'erase',
      transitionOut: index < manifest.scenes.length - 1 && type !== 'none',
    });
  });

  return {
    meta: manifest.meta,
    scenes,
  };
}

const PROJECTS: Record<string, ProjectSchema> = {
  'video-001': assembleProject(video001Manifest, VIDEO_001_LAYOUTS),
  'video-002': assembleProject(video002Manifest, VIDEO_002_LAYOUTS),
};

export function loadProject(videoId: string): ProjectSchema {
  const project = PROJECTS[videoId];

  if (!project) {
    throw new Error(`Projeto não encontrado: ${videoId}`);
  }

  return project;
}

export function listProjectIds(): string[] {
  return Object.keys(PROJECTS);
}
