import type { ProjectManifestSchema, ProjectSchema, SceneSchema } from '../types/scene';
import activeProject from './projects/active-project.json';
import { VIDEO_001_LAYOUTS } from './projects/video-001/layouts';
import video001Manifest from './projects/video-001/scenes.json';

export const DEFAULT_VIDEO_ID: string = activeProject.videoId;

function assembleProject(
  manifest: ProjectManifestSchema,
  layouts: Record<string, SceneSchema>,
): ProjectSchema {
  const scenes = manifest.scenes.map((layoutId) => {
    const scene = layouts[layoutId];

    if (!scene) {
      throw new Error(`Layout não encontrado: ${layoutId}`);
    }

    return scene;
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
