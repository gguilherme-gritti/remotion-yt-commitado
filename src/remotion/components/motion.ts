/** Entrada pausada e grounded das imagens/personagens. */
export const ENTRY_DURATION_FRAMES = 20;

export const POP_SPRING = {
  mass: 0.8,
  damping: 18,
  stiffness: 110,
} as const;

export const SOFT_SPRING = {
  mass: 0.8,
  damping: 18,
  stiffness: 90,
} as const;

export const DRAW_SPRING = {
  mass: 0.8,
  damping: 18,
  stiffness: 80,
} as const;

export const MARKER_SPRING = {
  mass: 0.35,
  damping: 16,
  stiffness: 190,
} as const;
