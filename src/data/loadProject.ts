import type { ProjectManifestSchema, ProjectSchema, SceneSchema } from '../types/scene';
import { withPacedDuration } from '../remotion/components/layouts/resolveSceneDuration';
import activeProject from './projects/active-project.json';
import { VIDEO_001_LAYOUTS } from './projects/video-001/layouts';
import video001Manifest from './projects/video-001/scenes.json';

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

    return withPacedDuration({
      ...scene,
      transitionIn: index > 0,
      transitionOut: index < manifest.scenes.length - 1,
    });
  });

  return {
    meta: manifest.meta,
    scenes,
  };
}

const PROJECTS: Record<string, ProjectSchema> = {
  'video-001': assembleProject(video001Manifest, VIDEO_001_LAYOUTS),
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
