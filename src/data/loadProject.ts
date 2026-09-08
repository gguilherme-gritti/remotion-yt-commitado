import type { ProjectSchema } from '../types/scene';
import activeProject from './projects/active-project.json';
import video001 from './projects/video-001/scenes.json';

export const DEFAULT_VIDEO_ID: string = activeProject.videoId;

const PROJECTS: Record<string, ProjectSchema> = {
  'video-001': video001 as ProjectSchema,
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
