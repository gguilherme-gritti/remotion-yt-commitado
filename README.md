# Canal de Mangá Automatizado

Vídeos em estilo **sketchboard**: nanquim preto sobre quadro branco. Cada cena é um quadro novo. Os elementos entram no tempo e convivem até a borracha apagar a lousa.

O React/Remotion é o mesmo para qualquer vídeo. O que muda é o **roteiro** em JSON, isolado por projeto em `src/data/projects/{videoId}/`.

---

## Modelo mental: três camadas

Pense no vídeo como uma peça de teatro desenhada na lousa.

### 1. Dados — o roteiro

O JSON diz **o quê** entra na lousa e **em que ordem**. Não encena. Não aponta a câmera. Só lista o elenco e as falas.

Mora em `src/data/projects/{videoId}/`:

- `scenes.json` — a ordem dos quadros
- `layouts/` — um JSON por cena
- `assets/` — sketches daquele vídeo

Personagens compartilhados ficam em `public/characters/`.

### 2. Cena — o palco

Cada cena é um **quadro em branco**. Quando a cena começa, a lousa é limpa. Os elementos entram e ficam até o fim. Nos últimos instantes, uma borracha apaga o nanquim e revela o próximo quadro.

A cena não inventa o desenho: ela escolhe o diretor (`layoutType`) e entrega o roteiro.

### 3. Template — o diretor

O layout é quem **encena**. Lê o roteiro, coloca cada elemento no seu lugar, escolhe a pose do personagem e decide para onde a câmera olha.

O JSON descreve o conteúdo. O template decide a fotografia.

Sem `layoutType`, entra o **Freeform**: o diretor que obedece o roteiro à risca.

---

## Entidades

| Entidade     | O que é                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| **Projeto**  | Um vídeo. Tem metadados, áudio e uma lista de cenas.                       |
| **Cena**     | Um quadro. Tem duração, um `layoutType` opcional e uma lista de elementos. |
| **Elemento** | Algo que entra na lousa: personagem, imagem ou texto.                      |
| **Layout**   | O arquétipo visual daquele quadro.                                         |

Três tipos de elemento:

- **character** — o avatar. Pose + canto da lousa.
- **image** — um sketch. Caminho do arquivo + ideia da ilustração.
- **text** — ênfase em letra de quadrinho, revelada no tempo.

Com um `layoutType`, o template pode **reinterpretar** pose, posição e até o momento em que o personagem entra. O roteiro continua válido; o diretor rearranja o palco.

---

## Templates

### Balão de pensamento (`balao_pensamento`)

O personagem pensa. Um balão enorme ocupa o topo; o conteúdo (textos e sketches) nasce **dentro** dele. A câmera chega perto do interior do balão e depois volta ao quadro inteiro.

```json
{
  "id": "ideia",
  "layoutType": "balao_pensamento",
  "elements": [
    {
      "type": "character",
      "pose": "pensativo",
      "startAtFrame": 0,
      "animation": "draw_in",
      "position": "bottom_left"
    },
    {
      "type": "image",
      "src": "balao_pensamento.jpg",
      "imageIdea": "Balão no topo da lousa.",
      "startAtFrame": 18,
      "animation": "pop_in",
      "position": "top_center",
      "size": "hero"
    },
    {
      "type": "text",
      "content": "E SE...?",
      "startAtFrame": 48,
      "animation": "typewriter",
      "position": "center"
    },
    {
      "type": "image",
      "src": "ponto_interrogacao_gigante.jpg",
      "imageIdea": "Interrogação dentro do balão.",
      "startAtFrame": 72,
      "animation": "pop_in",
      "position": "center",
      "size": "small"
    }
  ]
}
```

### Lista condicional (`lista_condicional`)

Um “se isto, então aquilo”. O personagem fica no centro. Cada item vira um **par**: texto à esquerda, imagem à direita. A câmera abre no personagem e recua antes da lista aparecer.

```json
{
  "id": "condicoes",
  "layoutType": "lista_condicional",
  "elements": [
    {
      "type": "character",
      "pose": "joia.jpg",
      "startAtFrame": 0,
      "animation": "draw_in",
      "position": "center"
    },
    {
      "type": "text",
      "content": "SE CHUVA",
      "startAtFrame": 36,
      "animation": "typewriter",
      "position": "center_left"
    },
    {
      "type": "image",
      "src": "prancheta_checklist.jpg",
      "imageIdea": "Resultado da condição chuva.",
      "startAtFrame": 48,
      "animation": "pop_in",
      "position": "center_right",
      "size": "small"
    },
    {
      "type": "text",
      "content": "SE SOL",
      "startAtFrame": 78,
      "animation": "typewriter",
      "position": "center_left"
    },
    {
      "type": "image",
      "src": "computador_amigavel.jpg",
      "imageIdea": "Resultado da condição sol.",
      "startAtFrame": 90,
      "animation": "slide_in",
      "position": "center_right",
      "size": "small"
    }
  ]
}
```

### Equação visual (`equacao_visual`)

Isto vira aquilo. Título no topo. A câmera visita o objeto A, a seta, o objeto B — e só então abre o plano, revelando a equação inteira e o personagem curioso na base.

```json
{
  "id": "equacao",
  "layoutType": "equacao_visual",
  "elements": [
    {
      "type": "text",
      "content": "ISTO VIRA AQUILO?",
      "startAtFrame": 0,
      "animation": "typewriter",
      "position": "top_center"
    },
    {
      "type": "image",
      "src": "brain_math.jpeg",
      "imageIdea": "Objeto A: o cérebro.",
      "startAtFrame": 92,
      "animation": "pop_in",
      "position": "center_left",
      "size": "medium"
    },
    {
      "type": "image",
      "src": "seta_solida.jpg",
      "imageIdea": "A seta da equação.",
      "startAtFrame": 182,
      "animation": "pop_in",
      "position": "center",
      "size": "small"
    },
    {
      "type": "image",
      "src": "computador_amigavel.jpg",
      "imageIdea": "Objeto B: o computador.",
      "startAtFrame": 242,
      "animation": "slide_in",
      "position": "center_right",
      "size": "medium"
    }
  ]
}
```

### Teia radial (`teia_radial`)

Um núcleo e satélites ao redor. O personagem aparece na base; a câmera sobe para a teia e o tira do quadro. A imagem maior (ou a do centro) vira o mestre; o resto orbita.

```json
{
  "id": "teia",
  "layoutType": "teia_radial",
  "elements": [
    {
      "type": "character",
      "pose": "zanka.png",
      "startAtFrame": 0,
      "animation": "draw_in",
      "position": "bottom_center"
    },
    {
      "type": "image",
      "src": "prancheta_checklist.jpg",
      "imageIdea": "Objeto mestre no centro.",
      "startAtFrame": 100,
      "animation": "pop_in",
      "position": "center",
      "size": "medium"
    },
    {
      "type": "image",
      "src": "seta_dupla.jpg",
      "imageIdea": "Satélite no canto.",
      "startAtFrame": 118,
      "animation": "pop_in",
      "position": "top_left",
      "size": "small"
    },
    {
      "type": "image",
      "src": "relogio_mecanico.jpg",
      "imageIdea": "Outro satélite.",
      "startAtFrame": 136,
      "animation": "slide_in",
      "position": "top_right",
      "size": "small"
    }
  ]
}
```

### Fluxo vertical (`fluxo_vertical`)

Um passo depois do outro, empilhados no centro. A câmera desce a pilha, item a item. No fim, abre o plano: personagem à direita e, se houver, legendas na faixa esquerda.

Textos no topo são título. Textos à esquerda são legendas (entram depois do personagem). O resto vira a pilha — o template marca o ritmo da revelação.

```json
{
  "id": "passos",
  "layoutType": "fluxo_vertical",
  "elements": [
    {
      "type": "text",
      "content": "FLUXO VERTICAL",
      "startAtFrame": 0,
      "animation": "typewriter",
      "position": "top_center"
    },
    {
      "type": "image",
      "src": "prancheta_checklist.jpg",
      "imageIdea": "Primeiro passo.",
      "startAtFrame": 32,
      "animation": "pop_in",
      "position": "top_center",
      "size": "small"
    },
    {
      "type": "image",
      "src": "seta_zigue_zague.jpg",
      "imageIdea": "Segundo passo.",
      "startAtFrame": 82,
      "animation": "slide_in",
      "position": "center",
      "size": "small"
    },
    {
      "type": "image",
      "src": "x_vermelho.jpeg",
      "imageIdea": "Terceiro passo.",
      "startAtFrame": 132,
      "animation": "pop_in",
      "position": "bottom_center",
      "size": "small"
    },
    {
      "type": "text",
      "content": "PASSO A PASSO",
      "startAtFrame": 0,
      "animation": "typewriter",
      "position": "center_left"
    }
  ]
}
```

### Split comparativo (`split_comparativo`)

Dois lados da mesma ideia. Esquerda contra direita, cada coluna com texto e imagem. A câmera não se mexe. O personagem entra no canto no fim.

```json
{
  "id": "comparacao",
  "layoutType": "split_comparativo",
  "elements": [
    {
      "type": "text",
      "content": "COMO VOCÊ ACHA",
      "startAtFrame": 0,
      "animation": "typewriter",
      "position": "center_left"
    },
    {
      "type": "image",
      "src": "monitor_hacker.jpg",
      "imageIdea": "O mito.",
      "startAtFrame": 24,
      "animation": "pop_in",
      "position": "center_left",
      "size": "medium"
    },
    {
      "type": "text",
      "content": "COMO REALMENTE É",
      "startAtFrame": 48,
      "animation": "typewriter",
      "position": "center_right"
    },
    {
      "type": "image",
      "src": "computador_amigavel.jpg",
      "imageIdea": "A realidade.",
      "startAtFrame": 72,
      "animation": "slide_in",
      "position": "center_right",
      "size": "medium"
    }
  ]
}
```

### Freeform (sem `layoutType`)

A lousa livre. Cada elemento vai para a posição que o JSON pediu, na hora que o JSON pediu. A câmera, se existir, também vem do roteiro.

```json
{
  "id": "livre",
  "elements": [
    {
      "type": "text",
      "content": "FREEFORM",
      "startAtFrame": 0,
      "animation": "typewriter",
      "position": "top_center"
    },
    {
      "type": "image",
      "src": "monitor_hacker.jpg",
      "imageIdea": "Sketch à esquerda.",
      "startAtFrame": 18,
      "animation": "pop_in",
      "position": "center_left",
      "size": "medium"
    },
    {
      "type": "image",
      "src": "computador_amigavel.jpg",
      "imageIdea": "Sketch à direita.",
      "startAtFrame": 66,
      "animation": "pop_in",
      "position": "center_right",
      "size": "medium"
    },
    {
      "type": "character",
      "pose": "apontando_frente",
      "startAtFrame": 90,
      "animation": "draw_in",
      "position": "bottom_right"
    }
  ]
}
```

---

## Como rodar

```bash
pnpm install
pnpm run remotion:studio
```
