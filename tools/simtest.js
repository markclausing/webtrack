// Runs the simulation without a browser, which is the only way to find out
// whether it still works before looking at it.
//
//   node tools/simtest.js
//
// Nothing in here draws, and nothing in here is a unit test in the usual sense.
// It rides each route for a few minutes with a hand on the bars that is not
// quite random, and then asks the questions a bug would answer wrongly: is
// anybody outside the world, is anybody's speed a number, did the clock move,
// did the fighting actually happen. A road game breaks by drifting rather than
// by throwing, so drift is what this looks for.

import { BTN, TICK_RATE } from '../src/constants.js';
import { buildRoute } from '../src/game/route.js';
import { step } from '../src/game/sim.js';
import { finalTicks, formatTime, makeState, player } from '../src/game/state.js';
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

// --- Riding it ------------------------------------------------------------------

/**
 * A rider who is not very good but is trying: throttle open, steering back
 * towards the middle, swinging at whatever is beside them. Deterministic, so a
 * failure here can be run again and looked at.
 */
function hand(state, tick) {
  const p = player(state);
  let mask = BTN.UP;
  if (p.x > 1.5) mask |= BTN.LEFT;
  if (p.x < -1.5) mask |= BTN.RIGHT;
  for (const c of state.cars) {
    const gap = c.s - p.s;
    if (gap > 3 && gap < 60 && Math.abs(c.x - p.x) < 3) {
      mask &= ~(BTN.LEFT | BTN.RIGHT);
      mask |= c.x > p.x ? BTN.LEFT : BTN.RIGHT;
    }
  }
  if (tick % 37 === 0) mask |= BTN.FIRE;
  if (tick % 313 === 0) mask |= BTN.SWITCH;
  return mask;
}

for (const tier of ['easy', 'normal', 'hard']) {
  const state = makeState({ route: 'pass', tier, seed: 12345 });
  let sane = true;
  let top = 0;
  let swings = 0;
  for (let t = 0; t < TICK_RATE * 240 && !state.over && !state.finished; t++) {
    step(state, hand(state, t));
    for (const event of state.events) if (event.t === 'hit') swings++;
    for (const r of [...state.riders, ...state.cars]) {
      if (!Number.isFinite(r.s) || !Number.isFinite(r.x) || !Number.isFinite(r.speed)) sane = false;
    }
    // Riders are held on the world; traffic that has been knocked off it is
    // allowed to leave, and does.
    for (const r of state.riders) if (Math.abs(r.x) > 22) sane = false;
    top = Math.max(top, player(state).speed);
  }
  const p = player(state);
  ok(`${tier}: 4 minutes of riding stays finite and on the road`, sane);
  // The hand above is a poor rider on purpose, so the bar is "got past the
  // first checkpoint and was still going fast", not "finished". A tier that
  // stops a bad rider dead in the first kilometre is a tier nobody will play.
  ok(`${tier}: got somewhere (${(p.s / 1000).toFixed(1)}km at up to ${Math.round(top * 3.6)}km/h)`,
    p.s > 2500 && top > 40 && top < 120);
  ok(`${tier}: something happened (${swings} landed hits, ${state.knocks.rival
    + state.knocks.gang + state.knocks.cop} down, ${state.checkpoint} checkpoints)`,
    swings > 0 && state.checkpoint > 0);
  ok(`${tier}: ended for a reason (${state.reason || 'still going'})`,
    state.over || state.finished || p.s > 3000);
}

// A run that is left alone must end, and must end on the clock rather than by
// quietly going on for ever.
{
  const state = makeState({ route: 'coast', tier: 'normal', seed: 7 });
  let ticks = 0;
  while (!state.over && !state.finished && ticks < TICK_RATE * 400) {
    step(state, 0);
    ticks++;
  }
  ok(`nobody riding: out of time after ${(ticks / TICK_RATE).toFixed(0)}s`,
    state.over && state.reason === 'time');
}

// The same seed and the same hands must produce the same run, twice. Without
// this a time on the board is a story rather than a record.
{
  const a = makeState({ route: 'pass', tier: 'normal', seed: 999 });
  const b = makeState({ route: 'pass', tier: 'normal', seed: 999 });
  for (let t = 0; t < TICK_RATE * 60; t++) {
    step(a, hand(a, t));
    step(b, hand(b, t));
  }
  ok('the same seed rides the same run',
    player(a).s === player(b).s && a.bonus === b.bonus && a.heat === b.heat);
}

// --- The board -------------------------------------------------------------------

{
  const quick = { id: 'a', name: 'AAA', time: 9000, down: 2, at: 1 };
  const slow = { id: 'b', name: 'BBB', time: 12000, down: 9, at: 1 };
  ok('quicker sorts first', compare(cleanEntry(quick), cleanEntry(slow)) < 0);
  ok('a tie goes to whoever put more people down',
    compare(cleanEntry({ ...quick, down: 1 }), cleanEntry({ ...quick, id: 'c', down: 4 })) > 0);
  ok('a nonsense row is refused', cleanEntry({ time: -5 }) === null
    && cleanEntry({ time: 'fast' }) === null && cleanEntry(null) === null);

  const full = Array.from({ length: 10 }, (_, i) => ({
    id: `x${i}`, name: 'ZZZ', time: 20000 + i * 100, down: 0, at: 1,
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
  const state = makeState({ route: 'pass', tier: 'normal', seed: 5 });
  state.elapsed = TICK_RATE * 200;
  state.bonus = 12;
  ok(`the bonus comes off the time (${formatTime(state.elapsed)} - 12s = ${
    formatTime(finalTicks(state))})`, finalTicks(state) === TICK_RATE * 188);
  state.bonus = 100000;
  ok('and cannot take it below zero', finalTicks(state) === 1);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
