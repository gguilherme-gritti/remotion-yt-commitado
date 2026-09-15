import type { CSSProperties } from "react";
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneSchema,
  TextElement,
} from "../../../types/scene";
import {
  createClock,
  playCamera,
  playElement,
  setupCamera,
} from "../../utils/pacing";

export const LIST_CHARACTER_POSE = "joia.jpg";
export const LIST_CHARACTER_SCALE = 1.22;
export const LIST_ITEM_IMAGE_SCALE = 1.08;
export const LIST_ITEM_FONT_SIZE = 44;
export const LIST_OPENING_ZOOM = 1.18;

export const LIST_STAGE_STYLE: CSSProperties = {
  position: "absolute",
  inset: "48px 200px",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
};

export const LIST_COLUMN_STYLE: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 28,
  minWidth: 0,
};

export const LIST_SPACER_STYLE: CSSProperties = {
  flex: "0 0 10%",
  height: "100%",
};

const DEFAULT_CHARACTER: CharacterElement = {
  type: "character",
  pose: LIST_CHARACTER_POSE,
  startAtFrame: 0,
  animation: "draw_in",
  position: "center",
};

export type ListLayoutItem = {
  text?: TextElement;
  image?: ImageElement;
};

type ListSequence = {
  character: CharacterElement;
  items: ListLayoutItem[];
  cameraMoves: CameraMove[];
  durationFrames: number;
};

export function sequenceListLayout(scene: SceneSchema): ListSequence {
  const clock = createClock(scene);
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === "character",
  );
  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === "text",
  );
  const images = scene.elements.filter(
    (element): element is ImageElement => element.type === "image",
  );
  const count = Math.max(texts.length, images.length);

  const cameraMoves: CameraMove[] = [
    setupCamera({
      type: "zoom_in",
      target: "center",
      zoom: LIST_OPENING_ZOOM,
    }),
  ];

  const character = playElement(clock, {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: LIST_CHARACTER_POSE,
    position: "center",
    animation: "draw_in",
  }) as CharacterElement;

  cameraMoves.push(
    playCamera(clock, {
      type: "none",
      target: "center",
      zoom: 1,
    }),
  );

  const items: ListLayoutItem[] = Array.from({ length: count }, (_, index) => {
    const text = texts[index]
      ? (playElement(clock, texts[index]) as TextElement)
      : undefined;
    const image = images[index]
      ? (playElement(clock, images[index]) as ImageElement)
      : undefined;

    return { text, image };
  });

  return {
    character,
    items,
    cameraMoves,
    durationFrames: clock.sceneDuration(),
  };
}

export function getListLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  items: ListLayoutItem[];
} {
  const { character, items } = sequenceListLayout(scene);
  return { character, items };
}

export function getListLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  return sequenceListLayout(scene).cameraMoves;
}

export function getListLayoutDuration(scene: SceneSchema): number {
  return sequenceListLayout(scene).durationFrames;
}
