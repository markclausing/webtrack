// Runs the simulation without a browser, which is the only way to find out
// whether it still works before looking at it.
//
//   node tools/simtest.js
//
// Nothing in here draws, and nothing in here is a unit test in the usual sense.
// It drives each circuit with the game's own reference driver and then asks the
// questions a bug would answer wrongly: does the track close, is anybody outside
// the barriers, did the field race, did the laps count - and the only one that is
// about the game rather than the code, is braking later still quicker. A racing
// game breaks by drifting rather than by throwing, so drift is what this looks
// for.

import {
  BTN, GRIP, PIT_SPEED, PIT_X, SEG, TICK_RATE, TOP_SPEED, WALL_AT,
} from '../src/constants.js';
import { buildRoute } from '../src/game/route.js';
import { driveLine, makeRace, step } from '../src/game/sim.js';
import { finalTicks, formatTime, ordinal, player, surfaceOf } from '../src/game/state.js';
import {
  cleanEntry, compare, Highscores, merge, qualifies, sortTable,
} from '../src/highscores.js';

let failures = 0;
const ok = (what, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${what}`);
};

// --- The circuit -----------------------------------------------------------------

for (const key of ['pass', 'coast', 'grand']) {
  const route = buildRoute(key);
  const nodes = route.nodes;
  const finite = nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)
    && Number.isFinite(n.z) && Number.isFinite(n.a) && Number.isFinite(n.curve));
  ok(`${key}: ${nodes.length} nodes, ${(route.metres / 1000).toFixed(2)}km, all finite`,
    finite && nodes.length > 400);

  // Every pair of nodes the same distance apart, including the pair that
  // straddles the start line. If that one is short there is a bump on it, and it
  // is the piece of track everybody drives most.
  let shortest = Infinity;
  let longest = 0;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    const d = Math.hypot(b.x - a.x, b.z - a.z);
    shortest = Math.min(shortest, d);
    longest = Math.max(longest, d);
  }
  ok(`${key}: node spacing even all the way round (${shortest.toFixed(3)}m to `
    + `${longest.toFixed(3)}m)`, longest - shortest < 0.05);

  // The one property that makes it a circuit rather than a road: the headings
  // come back to where they started, having gone round exactly once.
  const turned = nodes.reduce((sum, n) => sum + n.curve, 0) / (Math.PI * 2);
  ok(`${key}: closes, having turned through exactly one lap (${turned.toFixed(4)})`,
    Math.abs(turned - 1) < 1e-6);

  // Nothing on it sharper than a car with a wing can go round.
  const slowest = Math.min(...nodes.map((n) => {
    const k = Math.abs(n.curve) / SEG;
    return k < 1e-6 ? Infinity : Math.sqrt(GRIP / k) * 3.6;
  }));
  ok(`${key}: slowest corner is ${Math.round(slowest)}km/h, and the hills are `
    + `${(route.steepest * 100).toFixed(1)}% at worst`,
    slowest > 90 && slowest < 260 && route.steepest < 0.14);

  ok(`${key}: the line is a checkpoint (${route.checkpoints.join(', ')})`,
    route.checkpoints[0] === 0 && route.checkpoints.length >= 2);

  const same = buildRoute(key);
  ok(`${key}: built twice, identical`,
    same.nodes[300].x === nodes[300].x && same.nodes[300].y === nodes[300].y);
}

// --- Driving it -----------------------------------------------------------------

/** Runs one session to the flag, or until the clock or the patience runs out. */
function race(options, skill = 0.95) {
  const state = makeRace(options);
  let sane = true;
  let top = 0;
  let ticks = 0;
  while (!state.over && !state.finished && ticks < TICK_RATE * 600) {
    step(state, driveLine(state, skill));
    ticks++;
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
  const { state, sane, top } = race({ route: 'pass', mode: 'gp', tier, seed: 12345 });
  const p = player(state);
  ok(`${tier}: a race stays finite and inside the barriers`, sane);
  ok(`${tier}: ran the ${state.laps} laps in ${formatTime(state.elapsed)} at up to `
    + `${Math.round(top * 3.6)}km/h`, state.finished && top > 80 && top < 100);
  ok(`${tier}: best lap ${formatTime(p.best)}, finished ${ordinal(state.place)} from 8th`,
    p.best > TICK_RATE * 40 && p.best < TICK_RATE * 150 && state.place >= 1 && state.place <= 8);
  ok(`${tier}: everybody else raced too`,
    state.cars.filter((c) => c.lap >= 1).length >= 7);
  ok(`${tier}: the tyres went off (${Math.round(p.tyre * 100)}% left)`,
    p.tyre < 0.65 && p.tyre >= 0);
}

// Qualifying: nobody else on it, fresh rubber all the way, and a best lap.
{
  const { state } = race({ route: 'coast', mode: 'qual', tier: 'normal', seed: 4 });
  const p = player(state);
  ok(`qualifying: alone on the circuit for ${state.laps} laps`, state.cars.length === 1);
  ok(`qualifying: fresh tyres the whole way (${Math.round(p.tyre * 100)}%)`, p.tyre === 1);
  ok(`qualifying: a best lap of ${formatTime(p.best)}, quicker than the out lap`,
    p.best > 0 && p.best < p.lapFrom);
  ok('qualifying: the board is given the lap, not the session',
    finalTicks(state) === p.best);
}

// The pit lane: a surface, a speed limit, and a set of tyres at the end of it.
{
  const state = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 8 });
  const route = state.route;
  const box = route.nodes[route.pitBox];
  ok('the box is in the lane and the lane is tarmac',
    box.pit && surfaceOf(PIT_X, box) === 'pit' && surfaceOf(0, box) === 'road');
  ok('and the grass beside the lane is still grass',
    surfaceOf(PIT_X, route.nodes[route.pitBox + 200]) === 'rough');

  // Driven into the box and stopped: the tyres come back and the clock does not.
  const p = player(state);
  state.lights = 0;
  p.tyre = 0.1;
  p.s = route.pitBox * SEG;
  p.x = PIT_X;
  p.speed = 0;
  const before = state.elapsed;
  let ticks = 0;
  while (p.tyre < 1 && ticks < 300) {
    step(state, 0);
    ticks++;
  }
  ok(`a stop takes ${((state.elapsed - before) / TICK_RATE).toFixed(1)}s and fits new tyres`,
    p.tyre === 1 && p.stops === 1 && ticks < 200);
  ok('and the clock ran the whole time it was standing there',
    state.elapsed > before);

  // The limiter: full throttle in the lane will not get you past it.
  p.pitCool = 0;
  p.speed = 90;
  for (let t = 0; t < 240; t++) {
    p.x = PIT_X;
    step(state, BTN.UP);
  }
  ok(`the limiter holds it to ${Math.round(p.speed * 3.6)}km/h in the lane`,
    p.speed <= PIT_SPEED + 0.5);
}

// Laps roll over cleanly at the line, on a track that has no beginning.
{
  const state = makeRace({ route: 'pass', mode: 'qual', tier: 'easy', seed: 2 });
  ok('the grid is behind the line, so nobody has done a lap yet', player(state).lap === -1);
  let crossings = 0;
  let was = player(state).lap;
  for (let t = 0; t < TICK_RATE * 400 && !state.over && !state.finished; t++) {
    step(state, driveLine(state, 0.95));
    if (player(state).lap !== was) {
      crossings++;
      was = player(state).lap;
    }
  }
  ok(`the line was crossed ${crossings} times for ${state.laps} laps`,
    crossings === state.laps + 1);
}

// The one test that is about the game rather than about the code.
//
// Braking later has to be quicker, or there is no driving in this driving game.
// It runs the game's own driver at three levels of commitment, so what is being
// checked is the simulation and not a second implementation of it.
{
  const times = [0.7, 0.9, 1.05].map((skill) => race(
    { route: 'pass', mode: 'qual', tier: 'normal', seed: 5 }, skill,
  ).state);
  const [timid, brave, wild] = times.map((r) => player(r).best);
  ok(`braking later is quicker: ${times.map((r) => formatTime(player(r).best)).join('  ')}`,
    brave < timid && wild < brave);
}

// A race nobody drives must end, and must end on the clock rather than by
// quietly going on for ever.
{
  const state = makeRace({ route: 'coast', mode: 'gp', tier: 'normal', seed: 7 });
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
  const a = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 999 });
  const b = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 999 });
  for (let t = 0; t < TICK_RATE * 90; t++) {
    step(a, driveLine(a, 0.95));
    step(b, driveLine(b, 0.95));
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

  const merged = merge({ 'gp:pass:normal': [quick] }, { 'gp:pass:normal': [quick, slow] });
  ok('merging does not duplicate a run that has travelled',
    merged['gp:pass:normal'].length === 2);

  const store = new Map();
  const board = new Highscores({
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, v),
  }, 'test.board');
  ok('a run lands where it belongs', board.add('gp', 'pass', 'normal', quick) === 1);
  ok('and is still there when the page comes back',
    new Highscores({ getItem: (k) => store.get(k) ?? null }, 'test.board')
      .table('gp', 'pass', 'normal').length === 1);
}

// --- What the score board is actually given ---------------------------------------

{
  const gp = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 5 });
  gp.elapsed = TICK_RATE * 200;
  player(gp).best = TICK_RATE * 70;
  ok(`a race gives the board the whole race (${formatTime(finalTicks(gp))})`,
    finalTicks(gp) === TICK_RATE * 200);

  const qual = makeRace({ route: 'pass', mode: 'qual', tier: 'normal', seed: 5 });
  qual.elapsed = TICK_RATE * 200;
  player(qual).best = TICK_RATE * 70;
  ok(`and qualifying gives it the lap (${formatTime(finalTicks(qual))})`,
    finalTicks(qual) === TICK_RATE * 70);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
