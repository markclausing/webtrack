// Draws the app icons and writes them as PNGs.
//
//   node tools/make-icons.js
//
// Hand rolled rather than pulled from a library, the same way the other three
// games do it: a PNG is a header, one zlib stream of filtered scanlines and a
// trailer, and node has zlib built in. That keeps the project at zero
// dependencies, and the icons stay reproducible - run this again and you get the
// same bytes.
//
// The picture is the track at dusk with a car on it, in the colours the game
// actually uses. At thirty-two pixels there is room for a sky, a horizon, a
// piece of tarmac and one shape on it, and that is exactly the icon: it is what
// the game looks like, reduced until nothing else fits.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  const body = out.subarray(4, 8 + data.length);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** @param {Uint8Array} rgba length size*size*4 */
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour with alpha
  // 10, 11, 12 stay zero: deflate, adaptive filtering, no interlacing

  // Each scanline is prefixed with its filter type; 0 means "store as is".
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const at = y * (size * 4 + 1);
    raw[at] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, at + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** '#58e6ff' -> [88, 230, 255]. */
function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * The track, going away from you, under a sunset, with one car on it.
 *
 * Everything in here is a shape rather than a drawing: a band for the sky, a
 * disc for the sun, a triangle for the tarmac and a wide red slab with a wing on
 * it. At thirty-two pixels anything more careful is mud, and the three things
 * that survive being that small - the orange, the converging lines and the low
 * wide shape sitting between two black wheels - are exactly what the game is.
 */
function draw(size) {
  const px = new Uint8Array(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= size || iy >= size) return;
    const i = (iy * size + ix) * 4;
    const was = [px[i], px[i + 1], px[i + 2]];
    const now = a >= 255 ? [r, g, b] : mix(was, [r, g, b], a / 255);
    px[i] = now[0];
    px[i + 1] = now[1];
    px[i + 2] = now[2];
    px[i + 3] = 255;
  };

  const high = rgb('#241a4a');
  const low = rgb('#ff8a3d');
  const sun = rgb('#ffd166');
  const land = rgb('#2a2118');
  const road = rgb('#4a4a52');
  const line = rgb('#e4e0b4');
  const dark = rgb('#0a0908');
  const car = rgb('#c4181c');
  const wing = rgb('#781216');
  const lamp = rgb('#ff8a3d');

  const horizon = size * 0.46;

  // Sky, in bands rather than a smooth ramp, because that is how the game draws
  // it and because a gradient at this size dithers into mud.
  for (let y = 0; y < horizon; y++) {
    const t = y / horizon;
    const band = Math.floor(t * 5) / 5;
    for (let x = 0; x < size; x++) set(x, y, mix(high, low, band));
  }
  // The sun, sitting on the horizon and cut off by it.
  const r = size * 0.17;
  for (let y = -r; y <= 0; y += 0.4) {
    for (let x = -r; x <= r; x += 0.4) {
      if (Math.hypot(x, y) > r) continue;
      set(size * 0.5 + x, horizon + y, sun);
    }
  }
  for (let y = horizon; y < size; y++) {
    for (let x = 0; x < size; x++) set(x, y, land);
  }

  // The tarmac: a triangle from the bottom edge to a point on the horizon.
  for (let y = horizon; y < size; y++) {
    const t = (y - horizon) / (size - horizon);
    const half = size * 0.03 + t * size * 0.52;
    for (let x = size * 0.5 - half; x <= size * 0.5 + half; x += 0.4) set(x, y, road);
    // Dashes down the middle, which is what makes it read as going away rather
    // than as a grey triangle.
    if ((Math.floor(t * 7) % 2) === 0) {
      const w = Math.max(0.5, t * size * 0.035);
      for (let x = -w; x <= w; x += 0.4) set(size * 0.5 + x, y, line);
    }
  }

  // The car, from behind, low in the frame: a wide dark-red slab between two
  // black wheels, with a wing over the back of it. The wing is what stops it
  // reading as a hatchback, and it is four pixels.
  const bx = size * 0.5;
  const by = size * 0.8;
  const half = size * 0.2;
  for (const side of [-1, 1]) {
    for (let y = -size * 0.11; y <= 0; y += 0.4) {
      for (let x = -size * 0.055; x <= size * 0.055; x += 0.4) {
        set(bx + side * half + x, by + y, dark);
      }
    }
  }
  for (let y = -size * 0.085; y <= 0; y += 0.4) {
    const t = (y + size * 0.085) / (size * 0.085);
    const w = half * (0.55 + t * 0.35);
    for (let x = -w; x <= w; x += 0.4) set(bx + x, by + y, car);
  }
  for (let y = -size * 0.05; y <= -size * 0.026; y += 0.4) {
    for (let x = -size * 0.03; x <= size * 0.03; x += 0.4) set(bx + x, by + y, lamp);
  }
  // The rear wing, wider than the body and a shade darker.
  for (let y = -size * 0.16; y <= -size * 0.125; y += 0.4) {
    for (let x = -half * 0.95; x <= half * 0.95; x += 0.4) set(bx + x, by + y, wing);
  }
  // And the helmet, one dot of colour above all of it.
  for (let y = -size * 0.145; y <= -size * 0.115; y += 0.4) {
    for (let x = -size * 0.03; x <= size * 0.03; x += 0.4) set(bx + x, by + y, sun);
  }

  return px;
}

mkdirSync(path.join(ROOT, 'icons'), { recursive: true });
for (const size of [32, 180, 192, 512]) {
  const file = path.join('icons', `icon-${size}.png`);
  writeFileSync(path.join(ROOT, file), encodePng(size, draw(size)));
  console.log(`wrote ${file}`);
}
