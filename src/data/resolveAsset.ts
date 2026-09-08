import { staticFile } from "remotion";

export function resolvePanelImage(videoId: string, filename: string): string {
  return staticFile(`projects/${videoId}/panels/${filename}`);
}
