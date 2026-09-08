import { staticFile } from "remotion";

export function resolveCharacterSrc(pose: string): string {
  const file = pose.includes(".") ? pose : `${pose}.svg`;

  if (file.startsWith("characters/")) {
    return staticFile(file);
  }

  return staticFile(`characters/${file}`);
}

export function resolveProjectImage(videoId: string, filename: string): string {
  return staticFile(`projects/${videoId}/assets/${filename}`);
}
