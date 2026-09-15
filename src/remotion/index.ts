import { continueRender, delayRender, registerRoot } from 'remotion';
import { loadAnimeAceFont } from './utils/loadAnimeAceFont';
import { RemotionRoot } from './Root';

const waitForFont = delayRender('Carregando fonte Anime Ace');

loadAnimeAceFont()
  .then(() => continueRender(waitForFont))
  .catch((error) => {
    console.error(error);
    continueRender(waitForFont);
  });

registerRoot(RemotionRoot);
