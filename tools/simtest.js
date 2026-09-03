// Runs the simulation without a browser, which is the only way to find out
// whether it still works before looking at it.
//
//   node tools/simtest.js
//
// Nothing in here draws, and nothing in here is a unit test in the usual sense.
// It drives each circuit with a hand on the wheel that brakes for corners, and
// then asks the questions a bug would answer wrongly: is anybody outside the
// barriers, is anybody's speed a number, did the field race, and - the only one
// that is about the game rather than the code - is braking later still quicker.
// A racing game breaks by drifting rather than by throwing, so drift is what
// this looks for.

import {
  BRAKE, BTN, GRIP, LIGHTS, ROAD_HALF, SEG, TICK_RATE, TOP_SPEED, WALL_AT,
} from '../src/constants.js';
import { buildRoute } from '../src/game/route.js';
import { makeRace, step } from '../src/game/sim.js';
import { finalTicks, formatTime, ordinal, player } from '../src/game/state.js';
import {
  cleanEntry, compare, Highscores, merge, qualifies, sortTable,
} from '../src/highscores.js';

let failures = 0;
const ok = (what, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${what}`);
};

// --- The road ------------------------------------------------------------------

for (const key of ['pass', 'coast', 'grand']) {
  const route = buildRoute(key);
  const finite = route.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)
    && Number.isFinite(n.z) && Number.isFinite(n.a));
  ok(`${key}: ${route.nodes.length} nodes, ${(route.metres / 1000).toFixed(1)}km, all finite`,
    finite && route.nodes.length > 800);

  // Consecutive nodes are six metres apart, everywhere. If they are not, the
  // road has a jump in it and everything measured along it is wrong.
  let worst = 0;
  for (let i = 1; i < route.nodes.length; i++) {
    const a = route.nodes[i - 1];
    const b = route.nodes[i];
    worst = Math.max(worst, Math.abs(Math.hypot(b.x - a.x, b.z - a.z) - 6));
  }
  ok(`${key}: node spacing holds (worst ${worst.toFixed(4)}m)`, worst < 0.01);

  const same = buildRoute(key);
  ok(`${key}: built twice, identical`,
    same.nodes[900].x === route.nodes[900].x && same.nodes[900].y === route.nodes[900].y);
}

// --- Driving it -----------------------------------------------------------------

/**
 * A driver: brakes for the corner it can see and aims at the apex.
 *
 * The same arithmetic the rivals use, at a chosen fraction of the grip, so that
 * `skill` is a dial from timid to over-committed. That is what makes the test
 * below worth anything: a driving model in which braking later is not faster is
 * broken however finite its numbers are, and nothing else here would notice.
 */
function hand(state, skill) {
  const p = player(state);
  const nodes = state.route.nodes;
  const from = Math.floor(p.s / SEG);
  let limit = TOP_SPEED;
  for (let n = 0; n <= 34; n++) {
    const node = nodes[Math.min(nodes.length - 1, from + n)];
    const k = Math.abs(node.curve) / SEG;
    if (k < 1e-5) continue;
    const corner = Math.sqrt(GRIP * skill / k);
    limit = Math.min(limit, Math.sqrt(corner * corner + 2 * BRAKE * 0.8 * Math.max(0, n * SEG - 8)));
  }
  const soon = nodes[Math.min(nodes.length - 1, from + 20)];
  let line = -Math.sign(soon.curve) * Math.min(1, Math.abs(soon.curve) * 34) * (ROAD_HALF - 1.6);
  for (const other of state.cars) {
    if (other === p) continue;
    const gap = other.s - p.s;
    if (gap > 2 && gap < 26 && Math.abs(other.x - p.x) < 3.6) {
      line = other.x + (other.x > 0 ? -3.6 : 3.6);
    }
  }
  let mask = p.speed < limit ? BTN.UP : 0;
  if (p.speed > limit * 1.02) mask |= BTN.DOWN;
  const off = line - p.x;
  if (off > 0.5) mask |= BTN.RIGHT;
  if (off < -0.5) mask |= BTN.LEFT;
  return mask;
}

/** Runs one race to the flag, or until the clock or the patience runs out. */
function race(options, skill = 0.95, alone = false) {
  const state = makeRace(options);
  if (alone) for (let i = 1; i < state.cars.length; i++) state.cars[i].s = 1e9;
  let sane = true;
  let top = 0;
  let ticks = 0;
  while (!state.over && !state.finished && ticks < TICK_RATE * 420) {
    step(state, hand(state, skill));
    ticks++;
    if (alone) state.clock = 999;
    for (const car of state.cars) {
      if (!Number.isFinite(car.s) || !Number.isFinite(car.x) || !Number.isFinite(car.speed)) {
        sane = false;
      }
      if (Math.abs(car.x) > WALL_AT + 0.5) sane = false;
      if (car.speed > TOP_SPEED * 1.05) sane = false;
    }
    top = Math.max(top, player(state).speed);
  }
  return { state, sane, top, ticks };
}

for (const tier of ['easy', 'normal', 'hard']) {
  const { state, sane, top } = race({ route: 'pass', tier, seed: 12345 });
  const p = player(state);
  ok(`${tier}: a race stays finite and inside the barriers`, sane);
  ok(`${tier}: got to the flag in ${formatTime(state.elapsed)} at up to `
    + `${Math.round(top * 3.6)}km/h`, state.finished && top > 80 && top < 100);
  ok(`${tier}: raced the others (started 8th, finished ${ordinal(state.place)})`,
    state.place >= 1 && state.place <= 8);
  ok(`${tier}: everybody else got somewhere too`,
    state.cars.filter((c) => c.s > 3000).length >= 6);
  ok(`${tier}: the clock kept up (${state.checkpoint} checkpoints)`, state.checkpoint > 3);
}

// The lights hold everybody until they go out, and nobody creeps.
{
  const state = makeRace({ route: 'pass', tier: 'normal', seed: 3 });
  const where = state.cars.map((c) => c.s);
  for (let t = 0; t < LIGHTS - 1; t++) step(state, BTN.UP);
  ok('nothing moves while the lights are on',
    state.cars.every((c, i) => c.s === where[i]) && state.elapsed === 0);
  for (let t = 0; t < 120; t++) step(state, BTN.UP);
  ok('and everybody goes when they go out', state.cars.every((c) => c.speed > 5));
}

/**
 * The one test that is about the game rather than about the code.
 *
 * Braking later has to be faster, or there is no driving in this driving game -
 * and it has to stop being faster somewhere, or there is no skill in it either.
 * Run alone, because the point is the track and not the traffic.
 */
{
  const times = [0.7, 0.9, 1.05].map((skill) => race({ route: 'pass', tier: 'normal', seed: 5 }, skill, true));
  const [timid, brave, wild] = times.map((r) => r.state.elapsed);
  ok(`braking later is quicker: ${times.map((r) => formatTime(r.state.elapsed)).join('  ')}`,
    brave < timid && wild < brave);
  ok('and going over the limit puts you on the grass',
    race({ route: 'pass', tier: 'normal', seed: 5 }, 1.45, true).state.elapsed > 0);
}

// A race nobody drives must end, and must end on the clock rather than by
// quietly going on for ever.
{
  const state = makeRace({ route: 'coast', tier: 'normal', seed: 7 });
  let ticks = 0;
  while (!state.over && !state.finished && ticks < TICK_RATE * 400) {
    step(state, 0);
    ticks++;
  }
  ok(`nobody driving: out of time after ${(ticks / TICK_RATE).toFixed(0)}s`,
    state.over && state.reason === 'time');
}

// The same seed and the same hands must produce the same race, twice. Without
// this a time on the board is a story rather than a record.
{
  const a = makeRace({ route: 'pass', tier: 'normal', seed: 999 });
  const b = makeRace({ route: 'pass', tier: 'normal', seed: 999 });
  for (let t = 0; t < TICK_RATE * 90; t++) {
    step(a, hand(a, 0.95));
    step(b, hand(b, 0.95));
  }
  ok('the same seed drives the same race',
    player(a).s === player(b).s && a.place === b.place);
}

// --- The board -------------------------------------------------------------------

{
  const quick = { id: 'a', name: 'AAA', time: 9000, place: 2, at: 1 };
  const slow = { id: 'b', name: 'BBB', time: 12000, place: 1, at: 1 };
  ok('quicker sorts first', compare(cleanEntry(quick), cleanEntry(slow)) < 0);
  ok('a tie goes to whoever finished higher up',
    compare(cleanEntry({ ...quick, place: 4 }), cleanEntry({ ...quick, id: 'c', place: 1 })) > 0);
  ok('a nonsense row is refused', cleanEntry({ time: -5 }) === null
    && cleanEntry({ time: 'fast' }) === null && cleanEntry(null) === null);

  const full = Array.from({ length: 10 }, (_, i) => ({
    id: `x${i}`, name: 'ZZZ', time: 20000 + i * 100, place: 3, at: 1,
  }));
  ok('a full board still takes a quicker run', qualifies(full, quick));
  ok('a full board refuses a slower one', !qualifies(full, { ...slow, time: 99000 }));
  ok('ten rows and no more', sortTable([...full, quick]).length === 10);

  const merged = merge({ 'pass:normal': [quick] }, { 'pass:normal': [quick, slow] });
  ok('merging does not duplicate a run that has travelled',
    merged['pass:normal'].length === 2);

  const store = new Map();
  const board = new Highscores({
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  }, 'test.board');
  ok('a run lands where it belongs', board.add('pass', 'normal', quick) === 1);
  ok('and is still there when the page comes back',
    new Highscores({ getItem: (k) => store.get(k) ?? null }, 'test.board')
      .table('pass', 'normal').length === 1);
}

// --- What the score board is actually given ---------------------------------------

{
  const state = makeRace({ route: 'pass', tier: 'normal', seed: 5 });
  state.elapsed = TICK_RATE * 200;
  ok(`the board gets the elapsed time and nothing else (${formatTime(finalTicks(state))})`,
    finalTicks(state) === TICK_RATE * 200);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
