import type { SceneSchema } from '../../../../types/scene';
import listaInstrucoes from './lista_instrucoes.json';
import mitoLetrinhas from './mito_letrinhas.json';
import oQueEPrograma from './o_que_e_programa.json';
import traduzirRotina from './traduzir_rotina.json';
import voceJaE from './voce_ja_e.json';

export const VIDEO_002_LAYOUTS: Record<string, SceneSchema> = {
  mito_letrinhas: mitoLetrinhas as SceneSchema,
  voce_ja_e: voceJaE as SceneSchema,
  traduzir_rotina: traduzirRotina as SceneSchema,
  o_que_e_programa: oQueEPrograma as SceneSchema,
  lista_instrucoes: listaInstrucoes as SceneSchema,
};
