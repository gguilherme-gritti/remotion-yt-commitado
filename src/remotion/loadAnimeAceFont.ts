import { staticFile } from 'remotion';

export const ANIME_ACE_FONT_FAMILY = 'Anime Ace';

const FONT_FILES = [
  { file: 'fonts/animeace/animeace2_reg.ttf', weight: '400' },
  { file: 'fonts/animeace/animeace2_bld.ttf', weight: '700' },
] as const;

let loading: Promise<void> | null = null;

export function loadAnimeAceFont(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (!loading) {
    loading = Promise.all(
      FONT_FILES.map(async ({ file, weight }) => {
        const face = new FontFace(
          ANIME_ACE_FONT_FAMILY,
          `url(${staticFile(file)}) format('truetype')`,
          { weight, style: 'normal' },
        );
        const loaded = await face.load();
        document.fonts.add(loaded);
      }),
    ).then(() => undefined);
  }

  return loading;
}
