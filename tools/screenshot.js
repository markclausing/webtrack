// Photographs the game, without anybody having to sit and play it.
//
//   node tools/screenshot.js                  # a handful, into shots/
//   node tools/screenshot.js pass 900 4       # route, tick, how many
//   node tools/screenshot.js docs             # the set the README uses
//   ONLY=climb node tools/screenshot.js docs  # just that one, again
//
// This used to run entirely in Node, because the renderer wrote into a
// Uint32Array and would run anywhere the arithmetic ran. It draws in WebGL now,
// so the picture has to come from something with a graphics driver in it - a
// headless Chrome, driven over the DevTools protocol by tools/browser.js, which
// is a WebSocket and some JSON and still no dependencies.
//
// The work is split where each half is good at it. Finding the moment worth
// photographing is a search over three thousand ticks of simulation and it
// happens here, in Node, in about a second per picture. Drawing that tick is one
// frame and it happens in the browser, which is asked for it by name:
// ?play=zandvoort&ticks=1487. The same seed and the same hands give the same
// race in both places - simtest checks exactly that property - so the tick this
// finds is the tick that gets drawn.
//
// It is not a test. It is how you find out that the horizon is in the wrong
// place, and finding that out from a file is quicker than finding it out from a
// browser.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, open, sleep } from './browser.js';
import { driveLine, makeRace, step } from '../src/game/sim.js';
import { nodeAt, player } from '../src/game/state.js';
import { pack, unpack } from '../src/game/ghost.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;
const WIDTH = Number(process.env.SHOT_WIDTH) || 1600;
const HEIGHT = Number(process.env.SHOT_HEIGHT) || 1000;
/** The seed every picture is taken on, so the same call gives the same frame. */
const SEED = 20260903;

/**
 * Runs the race until the moment is right, and says which tick that was.
 *
 * The camera is eased every tick even though nothing is being drawn, because
 * `follow` is what some of these conditions are about and because it costs
 * nothing next to the simulation.
 */
function findTick({ route, mode, dusk = false, push = 0.95, ghost = false }, when) {
  const state = makeRace({ route, mode, tier: 'normal', seed: SEED, dusk });
  if (ghost) {
    // The same warm-up lap the page drives, written down and read back the same
    // way. It has to be the real recording rather than a stand-in: the condition
    // this is searching for is about where the ghost has got to, and the
    // simulation plays it back every tick.
    const warm = makeRace({ route, mode: 'qual', tier: 'normal', seed: SEED });
    for (let t = 0; t < 40000 && !warm.over; t++) {
      step(warm, driveLine(warm, 0.97));
      warm.clock = 999;
    }
    if (warm.best) {
      state.ghost = {
        ...unpack(pack(warm.best, Math.round(warm.best.time)), state.route.length),
        name: 'REC',
      };
    }
  }
  for (let t = 1; t < 60 * 60 * 6; t++) {
    step(state, driveLine(state, push));
    state.clock = Math.max(state.clock, 40);
    state.over = false;
    state.finished = false;
    if (when(state)) {
      return { tick: t, lap: player(state).lap + 1, kmh: Math.round(player(state).speed * 3.6) };
    }
  }
  return null;
}

/** The address that draws one particular tick of one particular race. */
function addressFor({ route, mode, dusk, push, ghost }, tick) {
  const q = new URLSearchParams({ play: route, mode, ticks: String(tick), seed: String(SEED) });
  if (dusk) q.set('dusk', '1');
  if (ghost) q.set('ghost', '1');
  if (push && push !== 0.95) q.set('push', String(push));
  return `http://localhost:${PORT}/?${q}`;
}

// --- Riding to the interesting bit ---------------------------------------------

const [route = 'grand', until = '1500', count = '6'] = process.argv.slice(2);

mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

/**
 * The browser, and one page reused for every picture.
 *
 * A page per picture would be simpler and is four seconds of Chrome starting up
 * each time. This navigates the one page instead, which is a reload and a
 * circuit being built, and that is the cost that is actually unavoidable.
 */
await launch({ width: WIDTH, height: HEIGHT });

async function photograph(url, file, note) {
  const page = await open(url, { width: WIDTH, height: HEIGHT });
  const ready = await page.ready(90);
  if (!ready) {
    console.log(`  !! ${file}: the page never became ready`);
    for (const line of page.logs.slice(0, 4)) console.log(`     ${line.level}: ${line.text}`);
    await page.close();
    return false;
  }
  // One more frame after ready, so the picture is of a settled camera rather
  // than of the first frame after a circuit was built.
  await sleep(250);
  writeFileSync(file, await page.screenshot());
  console.log(`${path.relative(ROOT, file)}  ${note}`);
  const bad = page.logs.filter((l) => l.level === 'error');
  for (const line of bad.slice(0, 3)) console.log(`     error: ${line.text.slice(0, 200)}`);
  await page.close();
  return true;
}

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
    /**
     * The four the README leads with, each one a thing the game does rather
     * than a circuit it has.
     *
     * `street` is Monaco at the tunnel mouth: measured buildings on their own
     * footprints, a roof over the road where the tags say there is one. `climb`
     * is Spa going up out of Eau Rouge, which is the steepest ground in the
     * game. `night` is Las Vegas, a street circuit run after dark, which is both
     * of those things at once. `ghost` is a qualifying lap with the recording of
     * a quicker one on the road beside it.
     */
    /**
     * The middle of a banked corner, which is the one thing in this game you
     * cannot photograph anywhere else.
     *
     * Zandvoort's last corner is eighteen degrees of dish, and the deepest of it
     * is at ninety per cent of the lap. Caught mid-corner rather than on the way
     * in: what makes it read is the road tilting under the car and the car
     * leaning with it, and on the entry the road is still flat.
     */
    ['banked', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.897 && at < s.route.metres * 0.918
        && player(s).speed > 50;
    }, 'zandvoort', 'gp'],
    ['street', (s) => {
      const at = s.route.nodes[nodeAt(s.route, player(s).s).i];
      return at.tunnel > 0.4 && at.tunnel < 0.9 && player(s).speed > 55;
    }, 'monaco', 'gp'],
    /**
     * The crest, not the climb.
     *
     * A steady gradient is invisible: the camera pitches to meet it, so a
     * fourteen per cent hill at Spa photographs as a flat road. What reads is
     * where the gradient *changes* - and the sharpest change in the game is
     * Austin's turn one, nine per cent up turning into a drop, arriving at a
     * corner you cannot see into.
     */
    /**
     * The Strip, past the fountains.
     *
     * At night, because Las Vegas is run at night, and looking at them rather
     * than at the road: the one landmark on this circuit everybody recognises
     * without being told what it is.
     */
    ['vegas', (s) => {
      const at = player(s).s % s.route.metres;
      // Off the centre line, like the Spa one: a car sitting on the road marking
      // and straddling it reads as a mistake in a still, whatever it is doing at
      // three hundred.
      // And not in the two seconds after a lap, when the panel that reports it
      // sits in the middle of the picture - which is over the tower.
      return at > s.route.metres * 0.796 && at < s.route.metres * 0.836
        && Math.abs(player(s).x) > 1.6 && player(s).speed > 45 && s.lapNote === 0;
    }, 'vegas', 'gp', 0.95, true],
    ['climb', (s) => {
      const at = player(s).s % s.route.metres;
      return at > s.route.metres * 0.098 && at < s.route.metres * 0.116 && player(s).speed > 45;
    }, 'austin', 'gp'],
    ['night', (s) => s.light > 0.88 && player(s).speed > 55, 'vegas', 'gp', 0.95, true],
    /**
     * The ghost, at the bottom of Eau Rouge with the climb ahead.
     *
     * Two things had to be right about this one. The car has to be off the
     * centre line - on a straight it sits on the white line and straddles it,
     * which looks like a mistake rather than a racing line. And the road has to
     * be doing something: this is the one place in the game where you can see a
     * descent turn into a climb from inside it.
     */
    ['ghost', (s) => {
      const at = player(s).s % s.route.metres;
      return s.ghost && s.delta !== null && player(s).lap >= 1
        && s.ghostAt && !s.ghostAt.done
        && Math.abs(player(s).x) > 1.2
        && at > s.route.metres * 0.090 && at < s.route.metres * 0.190
        // Up the road rather than on your gearbox - and not much further than
        // this is available, because the ghost sets off level at the line and
        // Eau Rouge is twenty seconds later.
        && s.ghostCar.s - player(s).s > 16 && s.ghostCar.s - player(s).s < 30;
    }, 'spa', 'qual', 0.90],
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
  // ONLY=climb to take one of them again without waiting for the other thirty.
  const only = process.env.ONLY;
  for (const [name, when, on, mode, push = 0.95, dusk = false] of want) {
    if (only && name !== only) continue;
    const race = { route: on, mode, dusk, push, ghost: name === 'ghost' };
    const found = findTick(race, when);
    if (!found) {
      console.log(`could not catch ${name}`);
      continue;
    }
    await photograph(addressFor(race, found.tick), path.join(ROOT, 'docs', 'screenshots', `${name}.png`),
      `tick ${found.tick}, lap ${found.lap}, ${found.kmh}km/h`);
  }
  process.exit(0);
}

// --- Or a handful along one circuit ----------------------------------------------

const target = Number(until);
const stops = Number(count);
const race = { route, mode: process.env.MODE || 'gp', push: Number(process.env.PUSH) || 0.95 };
const every = Math.max(1, Math.floor(target / stops));

for (let i = 1; i <= stops; i++) {
  const tick = i * every;
  const name = `shot-${route}-${String(i).padStart(2, '0')}.png`;
  await photograph(addressFor(race, tick), path.join(ROOT, 'shots', name), `tick ${tick}`);
}
process.exit(0);
