import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table ??= (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    pixels[y].copy(raw, row + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function canvas(width, height, fill = TRANSPARENT) {
  const rows = Array.from({ length: height }, () => {
    const row = Buffer.alloc(width * 4);
    for (let x = 0; x < width; x++) {
      row[x * 4] = fill[0];
      row[x * 4 + 1] = fill[1];
      row[x * 4 + 2] = fill[2];
      row[x * 4 + 3] = fill[3];
    }
    return row;
  });

  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

  const set = (x, y, color) => {
    x = x | 0;
    y = y | 0;
    if (!inBounds(x, y)) return;
    const i = x * 4;
    rows[y][i] = color[0];
    rows[y][i + 1] = color[1];
    rows[y][i + 2] = color[2];
    rows[y][i + 3] = color[3];
  };

  const fillRect = (x, y, w, h, color) => {
    const x0 = Math.max(0, x | 0);
    const y0 = Math.max(0, y | 0);
    const x1 = Math.min(width, (x + w) | 0);
    const y1 = Math.min(height, (y + h) | 0);
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) set(px, py, color);
    }
  };

  const fillCircle = (cx, cy, r, color) => {
    const r2 = r * r;
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(height - 1, Math.ceil(cy + r));
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(width - 1, Math.ceil(cx + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) set(x, y, color);
      }
    }
  };

  const strokeCircle = (cx, cy, r, thickness, color) => {
    const outer = (r + thickness) ** 2;
    const inner = Math.max(0, r - thickness) ** 2;
    const y0 = Math.max(0, Math.floor(cy - r - thickness));
    const y1 = Math.min(height - 1, Math.ceil(cy + r + thickness));
    const x0 = Math.max(0, Math.floor(cx - r - thickness));
    const x1 = Math.min(width - 1, Math.ceil(cx + r + thickness));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d <= outer && d >= inner) set(x, y, color);
      }
    }
  };

  const fillPoly = (points, color) => {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(...xs)));
    const minY = Math.max(0, Math.floor(Math.min(...ys)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(...ys)));
    for (let y = minY; y <= maxY; y++) {
      const hits = [];
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if ((yi > y) !== (yj > y) && yj !== yi) {
          hits.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
        }
      }
      hits.sort((a, b) => a - b);
      for (let k = 0; k < hits.length; k += 2) {
        const x0 = Math.max(minX, Math.floor(hits[k]));
        const x1 = Math.min(maxX, Math.ceil(hits[k + 1] ?? hits[k]));
        for (let x = x0; x <= x1; x++) set(x, y, color);
      }
    }
  };

  const hatch = (spacing, thickness, color, offset = 0) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x + y + offset) % spacing < thickness) set(x, y, color);
      }
    }
  };

  const noiseDots = (count, color, seed = 1) => {
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      set(rand() * width, rand() * height, color);
    }
  };

  return { width, height, rows, set, fillRect, fillCircle, strokeCircle, fillPoly, hatch, noiseDots };
}

function inkFigure(c, pose) {
  const { width, height } = c;
  const cx = width * 0.5;
  const ground = height - 20;
  const surprised = pose === 'surpreso';

  const headY = surprised ? height * 0.28 : height * 0.32;
  const headR = surprised ? 118 : 102;
  const bodyTop = headY + headR + 8;

  c.fillPoly(
    [
      [cx - 70, bodyTop],
      [cx + 70, bodyTop],
      [cx + 90, ground - 210],
      [cx - 90, ground - 210],
    ],
    BLACK,
  );
  c.fillPoly(
    [
      [cx - 58, bodyTop + 8],
      [cx + 58, bodyTop + 8],
      [cx + 74, ground - 218],
      [cx - 74, ground - 218],
    ],
    WHITE,
  );

  c.fillPoly(
    [
      [cx - 40, ground - 210],
      [cx - 8, ground - 210],
      [cx - 18, ground],
      [cx - 62, ground],
    ],
    BLACK,
  );
  c.fillPoly(
    [
      [cx + 8, ground - 210],
      [cx + 40, ground - 210],
      [cx + 62, ground],
      [cx + 18, ground],
    ],
    BLACK,
  );
  c.fillPoly(
    [
      [cx - 34, ground - 204],
      [cx - 14, ground - 204],
      [cx - 24, ground - 8],
      [cx - 54, ground - 8],
    ],
    WHITE,
  );
  c.fillPoly(
    [
      [cx + 14, ground - 204],
      [cx + 34, ground - 204],
      [cx + 54, ground - 8],
      [cx + 24, ground - 8],
    ],
    WHITE,
  );

  if (surprised) {
    c.fillPoly(
      [
        [cx - 70, bodyTop + 30],
        [cx - 40, bodyTop + 50],
        [cx - 160, bodyTop - 90],
        [cx - 200, bodyTop - 70],
      ],
      BLACK,
    );
    c.fillPoly(
      [
        [cx - 68, bodyTop + 36],
        [cx - 48, bodyTop + 50],
        [cx - 154, bodyTop - 78],
        [cx - 186, bodyTop - 66],
      ],
      WHITE,
    );
    c.fillPoly(
      [
        [cx + 40, bodyTop + 50],
        [cx + 70, bodyTop + 30],
        [cx + 200, bodyTop - 70],
        [cx + 160, bodyTop - 90],
      ],
      BLACK,
    );
    c.fillPoly(
      [
        [cx + 48, bodyTop + 50],
        [cx + 68, bodyTop + 36],
        [cx + 186, bodyTop - 66],
        [cx + 154, bodyTop - 78],
      ],
      WHITE,
    );
    c.fillCircle(cx - 186, bodyTop - 78, 28, BLACK);
    c.fillCircle(cx - 186, bodyTop - 78, 18, WHITE);
    c.fillCircle(cx + 186, bodyTop - 78, 28, BLACK);
    c.fillCircle(cx + 186, bodyTop - 78, 18, WHITE);
  } else {
    c.fillPoly(
      [
        [cx - 70, bodyTop + 40],
        [cx - 42, bodyTop + 60],
        [cx - 150, ground - 240],
        [cx - 186, ground - 260],
      ],
      BLACK,
    );
    c.fillPoly(
      [
        [cx - 64, bodyTop + 48],
        [cx - 50, bodyTop + 58],
        [cx - 146, ground - 246],
        [cx - 172, ground - 258],
      ],
      WHITE,
    );
    c.fillPoly(
      [
        [cx + 50, bodyTop + 20],
        [cx + 78, bodyTop + 40],
        [cx + 210, bodyTop - 130],
        [cx + 170, bodyTop - 160],
      ],
      BLACK,
    );
    c.fillPoly(
      [
        [cx + 56, bodyTop + 28],
        [cx + 72, bodyTop + 38],
        [cx + 196, bodyTop - 128],
        [cx + 168, bodyTop - 148],
      ],
      WHITE,
    );
    c.fillCircle(cx + 188, bodyTop - 148, 26, BLACK);
    c.fillCircle(cx + 188, bodyTop - 148, 16, WHITE);
  }

  c.fillCircle(cx, headY, headR + 10, BLACK);
  c.fillCircle(cx, headY, headR, WHITE);

  c.fillPoly(
    [
      [cx - headR - 8, headY - 20],
      [cx - 40, headY - headR - 36],
      [cx + 10, headY - headR - 10],
      [cx + 80, headY - headR - 44],
      [cx + headR + 16, headY - 10],
      [cx + 40, headY - 40],
      [cx - 20, headY - 28],
    ],
    BLACK,
  );

  const eyeY = headY - 8;
  const eyeR = surprised ? 22 : 14;
  c.fillCircle(cx - 34, eyeY, eyeR + 6, BLACK);
  c.fillCircle(cx + 34, eyeY, eyeR + 6, BLACK);
  c.fillCircle(cx - 34, eyeY, eyeR, WHITE);
  c.fillCircle(cx + 34, eyeY, eyeR, WHITE);
  c.fillCircle(cx - 30, eyeY + 2, 7, BLACK);
  c.fillCircle(cx + 38, eyeY + 2, 7, BLACK);

  if (surprised) {
    c.fillCircle(cx, headY + 48, 28, BLACK);
    c.fillCircle(cx, headY + 48, 16, WHITE);
  } else {
    c.fillRect(cx - 18, headY + 42, 36, 8, BLACK);
  }
}

function panelAbyss(c) {
  const { width, height } = c;
  c.fillRect(0, 0, width, height, BLACK);
  c.hatch(18, 2, WHITE, 3);
  c.fillPoly(
    [
      [width * 0.08, height * 0.12],
      [width * 0.92, height * 0.18],
      [width * 0.96, height * 0.9],
      [width * 0.05, height * 0.86],
    ],
    WHITE,
  );
  c.fillPoly(
    [
      [width * 0.18, height * 0.28],
      [width * 0.82, height * 0.24],
      [width * 0.7, height * 0.78],
      [width * 0.3, height * 0.82],
    ],
    BLACK,
  );
  c.hatch(11, 1, WHITE, 7);
  c.fillCircle(width * 0.5, height * 0.52, 120, BLACK);
  c.strokeCircle(width * 0.5, height * 0.52, 160, 6, WHITE);
  c.fillPoly(
    [
      [width * 0.48, height * 0.2],
      [width * 0.52, height * 0.2],
      [width * 0.51, height * 0.5],
      [width * 0.49, height * 0.5],
    ],
    WHITE,
  );
  c.noiseDots(1800, WHITE, 11);
  c.noiseDots(900, BLACK, 29);
}

function panelBurst(c) {
  const { width, height } = c;
  c.fillRect(0, 0, width, height, WHITE);
  const cx = width * 0.5;
  const cy = height * 0.48;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const jagged = 0.7 + ((i * 13) % 7) * 0.08;
    c.fillPoly(
      [
        [cx + Math.cos(a - 0.04) * 40, cy + Math.sin(a - 0.04) * 40],
        [cx + Math.cos(a + 0.04) * 40, cy + Math.sin(a + 0.04) * 40],
        [cx + Math.cos(a) * 980 * jagged, cy + Math.sin(a) * 620 * jagged],
      ],
      BLACK,
    );
  }
  c.fillCircle(cx, cy, 90, WHITE);
  c.strokeCircle(cx, cy, 90, 10, BLACK);
  c.fillCircle(cx, cy, 28, BLACK);
  c.hatch(22, 1, BLACK, 4);
  c.noiseDots(1200, BLACK, 3);
}

function panelCity(c) {
  const { width, height } = c;
  c.fillRect(0, 0, width, height, WHITE);
  c.hatch(16, 1, BLACK, 1);
  const blocks = [
    [80, 420, 220, 520],
    [280, 300, 180, 640],
    [500, 360, 260, 580],
    [820, 240, 200, 700],
    [1080, 390, 240, 550],
    [1360, 280, 180, 660],
    [1580, 430, 220, 510],
  ];
  for (const [x, y, w, h] of blocks) {
    c.fillRect(x, y, w, h, BLACK);
    c.fillRect(x + 10, y + 10, w - 20, h - 20, WHITE);
    for (let wy = y + 40; wy < y + h - 40; wy += 48) {
      for (let wx = x + 28; wx < x + w - 28; wx += 42) {
        c.fillRect(wx, wy, 18, 22, BLACK);
      }
    }
  }
  c.fillPoly(
    [
      [0, height],
      [width, height],
      [width, height - 140],
      [0, height - 80],
    ],
    BLACK,
  );
  c.fillPoly(
    [
      [width * 0.2, height * 0.55],
      [width * 0.38, height * 0.62],
      [width * 0.22, height * 0.8],
    ],
    BLACK,
  );
  c.noiseDots(1600, BLACK, 44);
}

function addStickerOutline(c, radius, color) {
  const { width, height, rows } = c;
  const marked = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rows[y][x * 4 + 3] > 0) marked.push([x, y]);
    }
  }
  for (const [x, y] of marked) {
    for (let oy = -radius; oy <= radius; oy++) {
      for (let ox = -radius; ox <= radius; ox++) {
        if (ox * ox + oy * oy > radius * radius) continue;
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (rows[ny][nx * 4 + 3] === 0) c.set(nx, ny, color);
      }
    }
  }
}

function save(path, c) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(c.width, c.height, c.rows));
  execFileSync('sips', ['-s', 'format', 'png', path, '--out', path], { stdio: 'ignore' });
  stripPngMetadata(path);
  console.log('wrote', path);
}

function stripPngMetadata(path) {
  const KEEP = new Set(['IHDR', 'IDAT', 'IEND', 'PLTE', 'tRNS']);
  const data = readFileSync(path);
  const out = [data.subarray(0, 8)];
  let offset = 8;
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.subarray(offset + 4, offset + 8).toString('ascii');
    const chunk = data.subarray(offset, offset + 12 + length);
    if (KEEP.has(type)) out.push(chunk);
    offset += 12 + length;
  }
  writeFileSync(path, Buffer.concat(out));
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const p1 = canvas(1920, 1080, BLACK);
panelAbyss(p1);
save(resolve(root, 'src/data/projects/video-001/assets/panel-01.png'), p1);

const p2 = canvas(1920, 1080, WHITE);
panelBurst(p2);
save(resolve(root, 'src/data/projects/video-001/assets/panel-02.png'), p2);

const p3 = canvas(1920, 1080, WHITE);
panelCity(p3);
save(resolve(root, 'src/data/projects/video-001/assets/panel-03.png'), p3);

const expl = canvas(720, 1080, TRANSPARENT);
inkFigure(expl, 'explicando');
addStickerOutline(expl, 14, WHITE);
addStickerOutline(expl, 6, BLACK);
save(resolve(root, 'public/characters/explicando.png'), expl);

const surp = canvas(720, 1080, TRANSPARENT);
inkFigure(surp, 'surpreso');
addStickerOutline(surp, 14, WHITE);
addStickerOutline(surp, 6, BLACK);
save(resolve(root, 'public/characters/surpreso.png'), surp);
