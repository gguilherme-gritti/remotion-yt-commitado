import type { CSSProperties } from "react";
import type {
  CameraMove,
  CharacterElement,
  ImageElement,
  SceneSchema,
  TextElement,
} from "../../../types/scene";
import { CAMERA_BLEND_FRAMES } from "../dynamicCamera";

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

export function getListLayoutParts(scene: SceneSchema): {
  character: CharacterElement;
  items: ListLayoutItem[];
} {
  const sourceCharacter = scene.elements.find(
    (element): element is CharacterElement => element.type === "character",
  );
  const character: CharacterElement = {
    ...(sourceCharacter ?? DEFAULT_CHARACTER),
    pose: LIST_CHARACTER_POSE,
    position: "center",
    startAtFrame: 0,
    animation: "draw_in",
  };

  const texts = scene.elements.filter(
    (element): element is TextElement => element.type === "text",
  );
  const images = scene.elements.filter(
    (element): element is ImageElement => element.type === "image",
  );
  const count = Math.max(texts.length, images.length);
  const items: ListLayoutItem[] = Array.from({ length: count }, (_, index) => ({
    text: texts[index],
    image: images[index],
  }));

  return { character, items };
}

export function getListLayoutCameraMoves(scene: SceneSchema): CameraMove[] {
  const { character, items } = getListLayoutParts(scene);
  const firstItemAt = items.reduce((earliest, item) => {
    const candidates = [
      item.text?.startAtFrame,
      item.image?.startAtFrame,
    ].filter((frame): frame is number => frame != null);

    if (candidates.length === 0) {
      return earliest;
    }

    return Math.min(earliest, ...candidates);
  }, Number.POSITIVE_INFINITY);

  const pullBackAt =
    Number.isFinite(firstItemAt) && firstItemAt > character.startAtFrame
      ? Math.max(character.startAtFrame + 20, firstItemAt - 8)
      : character.startAtFrame + CAMERA_BLEND_FRAMES;

  return [
    {
      startAtFrame: 0,
      type: "zoom_in",
      target: "center",
      zoom: LIST_OPENING_ZOOM,
    },
    {
      startAtFrame: pullBackAt,
      type: "none",
      target: "center",
      zoom: 1,
    },
  ];
}
