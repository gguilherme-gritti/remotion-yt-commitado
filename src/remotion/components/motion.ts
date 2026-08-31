export const INK_SPRING = {
  mass: 0.5,
  damping: 8,
} as const;

export function getShakeOffset(frame: number, intensity: number): { x: number; y: number } {
  return {
    x: Math.sin(frame * 2.17) * intensity,
    y: Math.cos(frame * 1.73) * intensity * 0.7,
  };
}
