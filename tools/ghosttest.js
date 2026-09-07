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

/**
 * A whole session, so the best lap is a flying one.
 *
 * `lap` above stops at the first recording there is, which is the lap out of the
 * grid - two and a half seconds off the pace at Monza and the wrong thing to
 * race against.
 */
function lapsOf(route, push, seed = 7) {
  const state = makeRace({ route, mode: 'qual', tier: 'normal', seed });
  for (let t = 0; t < 40000 && !state.over; t++) {
    step(state, driveLine(state, push));
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
  const quick = lapsOf('monza', 0.97);
  const packed = pack(quick.best, Math.round(quick.best.time));
  const ghostTicks = Math.round(quick.best.time);

  /**
   * A session driven against that recording, and what the difference read at
   * the end of each flying lap against what that lap actually took.
   *
   * The two have to agree: the difference is only worth showing if the number on
   * screen when you cross the line is the number that goes on the board.
   */
  const drive = (push) => {
    const run = makeRace({ route: 'monza', mode: 'qual', tier: 'normal', seed: 7 });
    run.ghost = { ...unpack(packed, run.route.length), name: 'TST' };
    const laps = [];
    const seen = [];
    let lap = -2;
    let last = null;
    for (let t = 0; t < 40000 && !run.over; t++) {
      const before = run.delta;
      step(run, driveLine(run, push));
      run.clock = 999;
      const p = player(run);
      if (p.lap !== lap) {
        if (lap >= 1 && before !== null) laps.push({ took: p.last, delta: before });
        lap = p.lap;
      }
      if (run.delta !== null) {
        seen.push(run.delta);
        last = run.delta;
      }
    }
    return { laps, seen, last };
  };

  const slow = drive(0.92);
  ok(`a slower lap reads as slower: ${slow.laps.length} flying laps, and at the `
    + `line each difference is what the lap actually lost `
    + `(${slow.laps.map((l) => (l.delta / 60).toFixed(2)).join(', ')}s against `
    + `${slow.laps.map((l) => ((l.took - ghostTicks) / 60).toFixed(2)).join(', ')}s)`,
  slow.laps.length >= 1
    && slow.laps.every((l) => l.delta > 0 && Math.abs(l.delta - (l.took - ghostTicks)) < 30));

  // The difference is a running total, not a per-corner reading: it should not
  // swing about by more than a car's length of time between ticks.
  let jumpiest = 0;
  for (let i = 1; i < slow.seen.length; i++) {
    // The reset at each crossing is not a jump.
    const step2 = Math.abs(slow.seen[i] - slow.seen[i - 1]);
    if (step2 < 60) jumpiest = Math.max(jumpiest, step2);
  }
  ok(`and it moves smoothly rather than jumping (worst ${(jumpiest / 60).toFixed(3)}s a tick)`,
    jumpiest < 6);

  // The same lap against itself is nought, which is the sanity check that the
  // recording and the playback are the same idea.
  const same = drive(0.97);
  const worst = same.seen.reduce((m, d) => Math.max(m, Math.abs(d)), 0);
  ok(`a lap raced against its own recording never gets more than `
    + `${(worst / 60).toFixed(3)}s from itself`, worst < 6);
}

// --- Level again at every crossing ---------------------------------------------

// The quick lap of a session is the second or the third, because you cross the
// line at speed and the recording did too. So the ghost has to be set going
// again at every crossing rather than run once and be gone - and it has to stay
// out of the lap that comes off the grid, where it would be over the horizon
// inside ten seconds against a car starting from a standstill.
{
  const quick = lapsOf('monza', 0.97);
  const packed = pack(quick.best, Math.round(quick.best.time));

  const run = makeRace({ route: 'monza', mode: 'qual', tier: 'normal', seed: 7 });
  run.ghost = { ...unpack(packed, run.route.length), name: 'REC' };
  const starts = [];
  const shown = new Set();
  let lap = -2;
  for (let t = 0; t < 40000 && !run.over; t++) {
    step(run, driveLine(run, 0.93));
    run.clock = 999;
    const p = player(run);
    if (p.lap !== lap) {
      lap = p.lap;
      // A tick after the crossing, which is when the ghost has been set going
      // again: `haunt` runs before the lap is counted.
      step(run, driveLine(run, 0.93));
      run.clock = 999;
      // Not the crossing that ends the session: there is no lap after it.
      if (lap >= 1 && lap < run.laps) {
        starts.push({ lap, gap: run.ghostCar.s - player(run).s, delta: run.delta });
      }
    }
    if (run.delta !== null) shown.add(lap);
  }

  ok(`the ghost is not on the lap out of the grid`, !shown.has(0));
  ok(`and it is on every flying lap after it (${[...shown].join(', ')})`,
    shown.has(1) && shown.has(2) && !shown.has(-1));
  const worst = starts.reduce((m, s) => Math.max(m, Math.abs(s.gap)), 0);
  ok(`and it sets off level at each of the ${starts.length} crossings `
    + `(worst ${worst.toFixed(1)}m apart)`, starts.length >= 2 && worst < 12);
  const late = starts.reduce((m, s) => Math.max(m, Math.abs(s.delta)), 0);
  ok(`with the difference back at nought each time (worst ${(late / 60).toFixed(3)}s)`,
    late < 6);
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
