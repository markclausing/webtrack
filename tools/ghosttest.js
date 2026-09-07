// The recorded lap, driven, written down, read back and raced against.
//
//   node tools/ghosttest.js
//
// A ghost is the one part of this game where a bug is invisible rather than
// ugly: a recording that is a tenth out plays back as a car that is a tenth
// away, and a car a tenth away looks exactly like a car a tenth away that is
// meant to be there. So this checks the numbers rather than the picture.
//
// No network anywhere near it. The lap is driven by the game's own reference
// driver, packed, unpacked, and driven against - which is every step the real
// thing takes except the fetch.

import { at, cleanGhost, pack, timeAt, unpack } from '../src/game/ghost.js';
import { driveLine, makeRace, step } from '../src/game/sim.js';
import { player } from '../src/game/state.js';
import { SEG } from '../src/constants.js';

let failures = 0;
const ok = (what, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${what}`);
};

/** One qualifying lap, driven at the given commitment, and its recording. */
function lap(route, push, seed = 7) {
  const state = makeRace({ route, mode: 'qual', tier: 'normal', seed });
  for (let t = 0; t < 40000 && !state.best; t++) {
    step(state, driveLine(state, push));
    // The clock is not what is being tested; a session that runs out mid-lap is.
    state.clock = 999;
  }
  return state;
}

// --- There and back again ---------------------------------------------------

for (const route of ['monaco', 'monza', 'spa']) {
  const state = lap(route, 0.95);
  ok(`${route}: a lap was driven and recorded whole`, !!state.best);
  if (!state.best) continue;

  const nodes = state.route.length;
  const ticks = Math.round(state.best.time);
  const packed = pack(state.best, ticks);
  const back = unpack(packed, nodes);

  ok(`${route}: ${(ticks / 60).toFixed(2)}s over ${nodes} nodes packs into `
    + `${(packed.length / 1024).toFixed(1)}KB`, packed.length < 8 * 1024);
  ok(`${route}: and comes back as the same lap time`, back && back.lap === ticks);

  // Every node, to the tick. There is no rounding in here to forgive: times are
  // whole ticks going in and whole ticks coming out.
  let worstTime = 0;
  let worstAcross = 0;
  for (let i = 0; i < nodes; i++) {
    worstTime = Math.max(worstTime, Math.abs(back.times[i] - Math.round(state.best.times[i])));
    worstAcross = Math.max(worstAcross, Math.abs(back.xs[i] - state.best.xs[i]));
  }
  ok(`${route}: every one of ${nodes} nodes survives the round trip `
    + `(worst ${worstTime} ticks, ${(worstAcross * 100).toFixed(0)}cm across)`,
  worstTime === 0 && worstAcross <= 0.05);

  // The times have to climb. A ghost that goes backwards is a ghost that drives
  // through you.
  let climbs = true;
  for (let i = 1; i < nodes; i++) if (back.times[i] < back.times[i - 1]) climbs = false;
  ok(`${route}: and every node is later than the one before it`, climbs);

  // Playback: asked where it was at the moment it crossed node i, it should say
  // node i. This is the whole of the ghost car in one assertion.
  let worstAlong = 0;
  for (let i = 1; i < nodes - 1; i += 7) {
    const spot = at(back, back.times[i]);
    worstAlong = Math.max(worstAlong, Math.abs(spot.along - i * SEG));
  }
  ok(`${route}: played back, it is where it said it was (worst `
    + `${worstAlong.toFixed(2)}m out)`, worstAlong < 0.05);

  // And the other question: what did its clock say at this place?
  let worstHere = 0;
  for (let i = 1; i < nodes - 1; i += 7) {
    worstHere = Math.max(worstHere, Math.abs(timeAt(back, i * SEG) - back.times[i]));
  }
  ok(`${route}: and its clock at a given place agrees with its own recording`,
    worstHere < 0.001);
}

// --- Racing against it -------------------------------------------------------

{
  const quick = lap('monza', 0.95);
  const packed = pack(quick.best, Math.round(quick.best.time));

  const slow = makeRace({ route: 'monza', mode: 'qual', tier: 'normal', seed: 7 });
  slow.ghost = { ...unpack(packed, slow.route.length), name: 'TST' };
  const seen = [];
  for (let t = 0; t < 40000 && !slow.best; t++) {
    step(slow, driveLine(slow, 0.92));
    slow.clock = 999;
    if (slow.delta !== null) seen.push(slow.delta);
  }

  const ended = slow.best.time - quick.best.time;
  ok(`a lap driven slower reads as slower all the way round `
    + `(${(seen[seen.length - 1] / 60).toFixed(2)}s down at the line, `
    + `${(ended / 60).toFixed(2)}s slower over the lap)`,
  ended > 0 && seen[seen.length - 1] > 0
    && Math.abs(seen[seen.length - 1] - ended) < 30);

  // The difference is a running total, not a per-corner reading: it should not
  // swing about by more than a car's length of time between ticks.
  let jumpiest = 0;
  for (let i = 1; i < seen.length; i++) jumpiest = Math.max(jumpiest, Math.abs(seen[i] - seen[i - 1]));
  ok(`and it moves smoothly rather than jumping (worst ${(jumpiest / 60).toFixed(3)}s a tick)`,
    jumpiest < 6);

  // The same lap against itself is nought, which is the sanity check that the
  // recording and the playback are the same idea.
  const same = makeRace({ route: 'monza', mode: 'qual', tier: 'normal', seed: 7 });
  same.ghost = unpack(packed, same.route.length);
  let worst = 0;
  for (let t = 0; t < 40000 && !same.best; t++) {
    step(same, driveLine(same, 0.95));
    same.clock = 999;
    if (same.delta !== null) worst = Math.max(worst, Math.abs(same.delta));
  }
  ok(`a lap raced against its own recording never gets more than `
    + `${(worst / 60).toFixed(3)}s from itself`, worst < 3);
}

// --- What a server will accept ------------------------------------------------

{
  const state = lap('monaco', 0.95);
  const nodes = state.route.length;
  const ticks = Math.round(state.best.time);
  const good = { nodes, time: ticks, lap: pack(state.best, ticks), name: 'abc' };
  ok('a real recording is accepted', !!cleanGhost(good));
  ok('and its name is squared up', cleanGhost(good).name === 'ABC');
  ok('a lap with the wrong number of nodes is not',
    cleanGhost({ ...good, nodes: nodes + 1 }) === null);
  ok('nor is a ten second lap', cleanGhost({ ...good, time: 300 }) === null);
  ok('nor is an hour', cleanGhost({ ...good, time: 300000 }) === null);
  ok('nor is anything with a bracket in it',
    cleanGhost({ ...good, lap: `${good.lap}<script>` }) === null);
  ok('nor is an empty one', cleanGhost({ ...good, lap: '' }) === null);
  ok('nor is nothing at all', cleanGhost(null) === null);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
