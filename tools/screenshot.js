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
const { driveLine, makeRace, step } = await import('../src/game/sim.js');
const { nodeAt, player } = await import('../src/game/state.js');
const { SEG } = await import('../src/constants.js');

// --- Riding to the interesting bit ---------------------------------------------

const [route = 'grand', until = '1500', count = '6', zoom = '3'] = process.argv.slice(2);
const state = makeRace({ route, mode: process.env.MODE || 'gp', tier: 'normal', seed: 31337 });
const renderer = new Renderer(fakeCanvas());

/** The game's own reference driver, so a screenshot is of the game driving. */
const hand = (world) => driveLine(world, 0.95);

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
    ['grid', (s) => s.lights > 20 && s.lights < 60, 'pass', 'gp'],
    ['pass', (s) => player(s).s > 1800 && player(s).speed > 78, 'pass', 'gp'],
    ['battle', (s) => s.cars.some((c) => c !== player(s) && Math.abs(c.s - player(s).s) < 14
      && Math.abs(c.x - player(s).x) < 6) && player(s).speed > 55, 'pass', 'gp'],
    // Over-committed on purpose: a picture of the tyres letting go needs a
    // driver asking for more grip than there is.
    ['corner', (s) => player(s).slide > 2 && player(s).speed > 55, 'pass', 'gp', 1.35],
    ['coast', (s) => player(s).s > 2500 && player(s).speed > 82, 'coast', 'gp'],
    // Coming up on the big wheel, which stands on the infield beside turn one.
    ['landmark', (s) => {
      const at = nodeAt(s.route, player(s).s).i;
      return at > 10 && at < 22 && player(s).speed > 45 && player(s).lap >= 0;
    }, 'pass', 'gp'],
    // The afternoon going: the same circuit on the second lap and the third.
    ['dusk', (s) => s.light > 0.5 && s.light < 0.62 && player(s).speed > 60, 'pass', 'gp', 0.95, true],
    ['night', (s) => s.light > 0.9 && player(s).speed > 60, 'pass', 'gp', 0.95, true],
    ['bridge', (s) => {
      const at = nodeAt(s.route, player(s).s).i;
      const from = s.route.bridgeFrom;
      return at > from + 20 && at < from + 50 && player(s).speed > 55;
    }, 'pass', 'gp'],
    ['qualifying', (s) => player(s).best > 0 && player(s).speed > 70, 'coast', 'qual'],
    ['grand', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.42 && at < s.route.metres * 0.58 && player(s).speed > 70;
    }, 'grand', 'gp'],
    // The four that are places, each caught where it is most itself: the climb
    // out of Eau Rouge, the park along the straight before Lesmo, the flyover
    // from underneath, and the dunes on the way to Tarzan.
    ['spa', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.20 && at < s.route.metres * 0.26 && player(s).speed > 72;
    }, 'spa', 'gp'],
    ['monza', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.26 && at < s.route.metres * 0.32 && player(s).speed > 75;
    }, 'monza', 'gp'],
    ['suzuka', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.835 && at < s.route.metres * 0.852 && player(s).speed > 70;
    }, 'suzuka', 'gp'],
    ['zandvoort', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.055 && at < s.route.metres * 0.085 && player(s).speed > 55;
    }, 'zandvoort', 'gp'],
    // And the four after them: the esses at Silverstone, the drop into the Senna
    // S, the climb to turn three in Styria, and the walls on the island.
    ['silverstone', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.615 && at < s.route.metres * 0.700 && player(s).speed > 60;
    }, 'silverstone', 'gp'],
    ['interlagos', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.070 && at < s.route.metres * 0.110 && player(s).speed > 40;
    }, 'interlagos', 'gp'],
    ['spielberg', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.200 && at < s.route.metres * 0.290 && player(s).speed > 70;
    }, 'spielberg', 'gp'],
    ['montreal', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.880 && at < s.route.metres * 0.930 && player(s).speed > 40;
    }, 'montreal', 'gp'],
    // And the last four: the blind climb to turn one in Texas, the desert with
    // the sun going down, the stadium at Mexico City, and turn one at the
    // Hungaroring dropping away into the bowl.
    ['austin', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.090 && at < s.route.metres * 0.130;
    }, 'austin', 'gp'],
    ['sakhir', (s) => s.light > 0.55 && player(s).speed > 55, 'sakhir', 'gp'],
    ['mexico', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.845 && at < s.route.metres * 0.895 && player(s).speed > 45;
    }, 'mexico', 'gp'],
    ['hungaroring', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.120 && at < s.route.metres * 0.170 && player(s).speed > 40;
    }, 'hungaroring', 'gp'],
    // The last four, which finish the sixteen the source database has: the lake
    // at Albert Park, the spiral at Shanghai, the climb to turn one at
    // Catalunya, and the marina after dark.
    ['melbourne', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.580 && at < s.route.metres * 0.650 && player(s).speed > 55;
    }, 'melbourne', 'gp'],
    ['shanghai', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.130 && at < s.route.metres * 0.175;
    }, 'shanghai', 'gp'],
    ['catalunya', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.150 && at < s.route.metres * 0.200 && player(s).speed > 45;
    }, 'catalunya', 'gp'],
    ['yasmarina', (s) => {
      const at = player(s).s % s.route.metres;
      return s.light > 0.5 && at > s.route.metres * 0.760 && at < s.route.metres * 0.850;
    }, 'yasmarina', 'gp'],
  ];
  mkdirSync(path.join(ROOT, 'docs', 'screenshots'), { recursive: true });
  for (const [name, when, on, mode, share = 0.95, dusk = false] of want) {
    const world = makeRace({ route: on, mode, tier: 'normal', seed: 20260903, dusk });
    const view = new Renderer(fakeCanvas());

    let got = false;
    for (let t = 0; t < 60 * 60 * 6 && !got; t++) {
      step(world, driveLine(world, share));
      world.clock = Math.max(world.clock, 40);
      world.over = false;
      world.finished = false;
      view.follow(world, player(world));
      if (when(world)) {
        view.draw(world);
        writeFileSync(path.join(ROOT, 'docs', 'screenshots', `${name}.png`), png(view.rt, 2));
        console.log(`docs/screenshots/${name}.png  lap ${player(world).lap + 1}, `
          + `${Math.round(player(world).speed * 3.6)}km/h`);
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
  state.finished = false;
  // The camera is eased towards where it should be a little each frame, so it
  // has to be stepped every tick like it is in the game. Only easing it on the
  // frames that get saved leaves it four hundred metres behind the car, which
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

