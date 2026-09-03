// Draws frames of the game without a browser and writes them out as PNGs.
//
//   node tools/screenshot.js                  # a handful, into shots/
//   node tools/screenshot.js pass 900 4 3     # route, tick, how many, blow-up
//   node tools/screenshot.js docs             # the set the README uses
//
// The renderer needs three things from a browser and no more: an ImageData to
// write into, a canvas element to hand the finished picture to, and a 2D context
// on that canvas. All three are stubbed below in about twenty lines, which is
// the whole argument for a renderer that talks to a Uint32Array instead of to a
// graphics API - it will run anywhere the arithmetic runs.
//
// This is not a test. It is how you find out that the horizon is in the wrong
// place, and finding that out from a file is a great deal quicker than finding
// it out from a browser.

import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CRC = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  let c = -1;
  const body = out.subarray(4, 8 + data.length);
  for (let i = 0; i < body.length; i++) c = CRC[(c ^ body[i]) & 0xff] ^ (c >>> 8);
  out.writeUInt32BE((c ^ -1) >>> 0, 8 + data.length);
  return out;
}

// --- Just enough browser ------------------------------------------------------

class FakeImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

const fakeCanvas = () => {
  const canvas = { width: 640, height: 448 };
  canvas.getContext = () => ({
    canvas,
    imageSmoothingEnabled: false,
    putImageData() {},
    drawImage() {},
  });
  return canvas;
};

globalThis.ImageData = FakeImageData;
globalThis.document = { createElement: () => fakeCanvas() };

const { Renderer } = await import('../src/render/renderer.js');
const { step } = await import('../src/game/sim.js');
const { makeState, player } = await import('../src/game/state.js');
const { BTN } = await import('../src/constants.js');

// --- Riding to the interesting bit ---------------------------------------------

const [route = 'grand', until = '1500', count = '6', zoom = '3'] = process.argv.slice(2);
const state = makeState({ route, tier: 'normal', seed: 31337 });
const renderer = new Renderer(fakeCanvas());

function hand(s) {
  const p = player(s);
  let mask = BTN.UP;
  let want = 0;
  for (const c of s.cars) {
    const gap = c.s - p.s;
    const closing = c.dir < 0 ? p.speed + c.speed : p.speed - c.speed;
    if (gap < 1 || closing <= 1 || gap / closing > 3) continue;
    if (Math.abs(c.x - p.x) < 4) want = c.x > 0 ? c.x - 5.5 : c.x + 5.5;
  }
  if (p.x > want + 0.8) mask |= BTN.LEFT;
  if (p.x < want - 0.8) mask |= BTN.RIGHT;
  // Swing at anybody genuinely alongside, which is what puts the heat up and
  // gets the interesting things - the law, the helicopter - into a picture.
  for (const r of s.riders) {
    if (r === p || r.down || r.gone) continue;
    if (Math.abs(r.s - p.s) < 5 && Math.abs(r.x - p.x) < 5) mask |= BTN.FIRE;
  }
  return mask;
}

mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

/**
 * The pictures the README needs, taken when the thing they are pictures of
 * actually happens.
 *
 * Waiting for the moment rather than picking a tick is the only way to get a
 * photograph of a fight: the fights are not on a timetable, and a frame chosen
 * in advance is a frame of an empty road nine times out of ten.
 */
if (route === 'docs') {
  const want = [
    ['pass', (s) => s.tick > 900 && player(s).speed > 55, 'grand'],
    ['fight', (s) => s.riders.some((r) => r !== player(s) && !r.down && !r.gone
      && Math.abs(r.s - player(s).s) < 6 && Math.abs(r.x - player(s).x) < 5.5)
      && player(s).swing > 0.4, 'grand'],
    ['checkpoint', (s) => {
      const next = (s.checkpoint + 1) * 220 * 6;
      const gap = next - player(s).s;
      return gap > 45 && gap < 70;
    }, 'grand'],
    ['police', (s) => s.chopper && s.riders.some((r) => r.kind === 'cop' && !r.gone
      && Math.abs(r.s - player(s).s) < 40), 'grand'],
    ['coast', (s) => player(s).s > 1000 && player(s).speed > 55, 'coast'],
  ];
  mkdirSync(path.join(ROOT, 'docs', 'screenshots'), { recursive: true });
  for (const [name, when, on] of want) {
    const world = makeState({ route: on, tier: 'normal', seed: 20260903 });
    const view = new Renderer(fakeCanvas());
    // The grand run's fights and police are in its second half, so the coast
    // shot skips ahead rather than riding twenty kilometres for one picture.
    if (name === 'coast') player(world).s = 3000;
    let got = false;
    for (let t = 0; t < 60 * 60 * 6 && !got; t++) {
      step(world, hand(world));
      world.clock = Math.max(world.clock, 40);
      world.over = false;
      view.follow(world, player(world));
      if (t > 240 && when(world)) {
        view.draw(world);
        writeFileSync(path.join(ROOT, 'docs', 'screenshots', `${name}.png`), png(view.rt, 2));
        console.log(`docs/screenshots/${name}.png  at ${(player(world).s / 1000).toFixed(2)}km`);
        got = true;
      }
    }
    if (!got) console.log(`could not catch ${name}`);
  }
  process.exit(0);
}

const stops = Number(count);
const target = Number(until);
let shot = 0;

for (let t = 0; t <= target; t++) {
  step(state, hand(state));
  // The clock is not what this is about, and running out of it halfway through
  // a set of pictures would leave half of them of the same frame.
  state.clock = Math.max(state.clock, 40);
  state.over = false;
  // The camera is eased towards where it should be a little each frame, so it
  // has to be stepped every tick like it is in the game. Only easing it on the
  // frames that get saved leaves it four hundred metres behind the bike, which
  // produces a picture of a road disappearing sideways and half an hour of
  // looking for a bug in the projection.
  renderer.follow(state, player(state));
  if (t > 0 && t % Math.floor(target / stops) === 0 && shot < stops) {
    renderer.draw(state);
    const name = `shot-${route}-${String(++shot).padStart(2, '0')}.png`;
    writeFileSync(path.join(ROOT, 'shots', name), png(renderer.rt, Number(zoom)));
    console.log(`${name}  tick ${t}  ${(player(state).s / 1000).toFixed(2)}km  `
      + `${Math.round(player(state).speed * 3.6)}km/h  ${renderer.rt.tris} triangles`);
  }
}

// --- Writing it out --------------------------------------------------------------

/**
 * The frame, blown up by whole pixels.
 *
 * Nearest neighbour and nothing else, for the same reason the game does it that
 * way: a screenshot of a 320 x 224 game that has been smoothed on the way out is
 * a screenshot of a different game.
 */
function png(rt, zoom = 1) {
  const w = rt.w * zoom;
  const h = rt.h * zoom;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  const src = Buffer.from(rt.image.data.buffer);
  for (let y = 0; y < h; y++) {
    const at = y * (w * 4 + 1);
    raw[at] = 0;
    const from = Math.floor(y / zoom) * rt.w * 4;
    for (let x = 0; x < w; x++) {
      src.copy(raw, at + 1 + x * 4, from + Math.floor(x / zoom) * 4,
        from + Math.floor(x / zoom) * 4 + 4);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

