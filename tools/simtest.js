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

import { BTN, GRIP, ROAD_HALF, SEG, TICK_RATE, TOP_SPEED, WALL_AT } from '../src/constants.js';
import { buildRoute, RINGS } from '../src/game/route.js';
import { SURVEYED_KEYS } from '../src/game/circuits.js';

/** Every circuit in the game: the three that were drawn and the ones that are places. */
const ALL_ROUTES = ['pass', 'coast', 'grand', ...SURVEYED_KEYS];
import { driveLine, makeRace, step } from '../src/game/sim.js';
import {
  finalTicks, formatTime, nodeAt, nodeStep, ordinal, player,
} from '../src/game/state.js';
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
}

// Qualifying: nobody else on it, fresh rubber all the way, and a best lap.
{
  const { state } = race({ route: 'coast', mode: 'qual', tier: 'normal', seed: 4 });
  const p = player(state);
  ok(`qualifying: alone on the circuit for ${state.laps} laps`, state.cars.length === 1);
  ok(`qualifying: a best lap of ${formatTime(p.best)}, quicker than the out lap`,
    p.best > 0 && p.best < p.lapFrom);
  ok('qualifying: the board is given the lap, not the session',
    finalTicks(state) === p.best);
}

/**
 * The afternoon goes, and it goes on distance rather than on the clock.
 *
 * A race that has gone badly should get dark at the same place on the circuit as
 * one that has gone well - the light belongs to how far round you are, not to
 * how long you took, or a driver who spun twice would be finishing at midnight
 * on the lap everybody else did in daylight.
 */
{
  const state = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 6, dusk: true });
  ok('it starts in daylight', state.light === 0);
  const seen = [];
  let lap = -1;
  let t = 0;
  while (!state.over && !state.finished && t < TICK_RATE * 600) {
    step(state, driveLine(state, 0.98));
    t++;
    if (player(state).lap !== lap) {
      lap = player(state).lap;
      if (lap >= 0) seen.push(state.light);
    }
  }
  ok(`and it is dark at the flag (light at each line: ${seen.map((v) => v.toFixed(2)).join(', ')})`,
    state.light > 0.97 && seen.every((v, i) => i === 0 || v > seen[i - 1]));

  // And it does not without being asked, which is the default.
  const bright = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 6 });
  for (let t = 0; t < TICK_RATE * 200 && !bright.over && !bright.finished; t++) {
    step(bright, driveLine(bright, 0.98));
  }
  ok('and it is daylight the whole way unless the sunset is asked for',
    bright.light === 0);
}

/**
 * The racing is close, and it is close because of the numbers rather than
 * because of a rubber band.
 *
 * The field is spread by about one per cent of pace end to end, which is what
 * keeps eight cars in touch for three laps; the check is that somebody is
 * genuinely within a couple of seconds of the player for most of the race. A
 * field that strings out is a field you are not racing, and it is the failure
 * this game is most likely to drift back into, because every number that makes a
 * rival quicker also makes it quicker than the rival behind it.
 */
{
  let close = 0;
  let ticks = 0;
  let places = [];
  for (const seed of [3, 11, 42]) {
    const state = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed });
    let t = 0;
    while (!state.over && !state.finished && t < TICK_RATE * 600) {
      step(state, driveLine(state, 0.98));
      t++;
      ticks++;
      const p = player(state);
      if (state.order.some((c) => c !== p && Math.abs(c.s - p.s) < 90)) close++;
    }
    places.push(state.place);
  }
  const share = Math.round((100 * close) / ticks);
  ok(`somebody is within ninety metres of you ${share}% of the race`, share > 45);
  ok(`and everybody finishes it (${places.join(', ')})`,
    places.every((p) => p >= 1 && p <= 8));
}

/**
 * The rivals lose almost nothing to each other.
 *
 * This is the one that matters, and it is the failure this game keeps drifting
 * back into: they were fine alone and ten seconds a lap slower in a pack,
 * because every car within twenty-six metres made every other car drive
 * defensively for the whole race, and because two cars leaning on each other
 * were charged three and a half per cent of their speed every frame it lasted.
 * A field that is quick on an empty circuit and slow in its own traffic is a
 * field you drive away from, however good its numbers look on paper.
 */
{
  const lap = (spread) => {
    const state = makeRace({ route: 'pass', mode: 'gp', tier: 'normal', seed: 5 });
    state.laps = 99;
    state.lights = 0;
    if (spread) {
      state.cars.forEach((c, i) => { c.s = -i * (state.route.metres / 8); });
    }
    for (let t = 0; t < TICK_RATE * 300; t++) step(state, driveLine(state, 0.98));
    const best = state.cars.filter((c) => c.kind === 'rival' && c.best).map((c) => c.best);
    return best.reduce((a, b) => a + b, 0) / Math.max(1, best.length);
  };
  const alone = lap(true);
  const pack = lap(false);
  ok(`in their own traffic they lose ${((pack - alone) / TICK_RATE).toFixed(1)}s a lap `
    + `(${formatTime(alone)} spread out, ${formatTime(pack)} in a pack)`,
    pack - alone < TICK_RATE * 2.5);
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

/**
 * The other test that is about the game rather than the code.
 *
 * Holding the throttle open and steering at the racing line has to be slower
 * than driving, or there is no driving in this driving game. It was not: with
 * the corner following the road for free and a barrier that only took half your
 * speed, a lap spent flat out leaning on the scenery was five seconds quicker
 * than a lap driven properly, which is the game telling you to do the wrong
 * thing. The margin is worth keeping an eye on because every number that makes
 * the car quicker moves it.
 */
{
  const flatOut = (s) => {
    const p = player(s);
    const soon = nodeStep(s.route, nodeAt(s.route, p.s).i, 20);
    const line = -Math.sign(soon.curve) * Math.min(1, Math.abs(soon.curve) * 34) * (ROAD_HALF - 1.6);
    let mask = BTN.UP;
    const off = (line - p.x) - p.vx * 0.34;
    if (off > 0.25) mask |= BTN.RIGHT;
    if (off < -0.25) mask |= BTN.LEFT;
    return mask;
  };
  const lap = (hand) => {
    const state = makeRace({ route: 'coast', mode: 'qual', tier: 'normal', seed: 5 });
    let t = 0;
    while (!state.finished && t < TICK_RATE * 600) {
      step(state, hand(state));
      state.clock = 999;
      t++;
    }
    return player(state).best;
  };
  const proper = lap((s) => driveLine(s, 0.98));
  const flat = lap(flatOut);
  ok(`driving beats not braking by ${((flat - proper) / TICK_RATE).toFixed(1)}s `
    + `(${formatTime(proper)} against ${formatTime(flat)})`, flat > proper + TICK_RATE * 3);
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

// --- Whether it is a race ------------------------------------------------------

// The one test that is about whether the game is any good rather than whether it
// works: the field has to be worth beating.
//
// It is here because it kept not being true. The rivals could each lap Spa in
// 1:58 and the field averaged 2:01, because they drove into the back of each
// other all afternoon and paid three and a half per cent of their speed for
// every contact - and whoever was in clean air pocketed the difference, which
// was always the player. They keep nine metres now, and they take a corner from
// the outside of it rather than from the middle.
{
  const field = (tier, share) => {
    let place = 0;
    let runs = 0;
    for (const route of ['spa', 'monza', 'zandvoort', 'pass', 'coast']) {
      for (const seed of [3, 9]) {
        const state = makeRace({ route, mode: 'gp', tier, seed });
        let t = 0;
        while (!state.finished && t < TICK_RATE * 900) {
          step(state, driveLine(state, share));
          state.clock = 999;
          t++;
        }
        place += player(state).place;
        runs++;
      }
    }
    return place / runs;
  };

  const normal = field('normal', 0.98);
  ok(`on normal the reference driver finishes ${normal.toFixed(1)}th, not first`, normal > 4);
  const committed = field('normal', 1.06);
  ok(`and has to be over-committed to be near the front (${committed.toFixed(1)}th at 1.06)`,
    committed < normal);
  const gentle = field('easy', 0.98);
  ok(`while on easy the same driver wins (${gentle.toFixed(1)}th)`, gentle < 2);
  const brutal = field('hard', 1.06);
  ok(`and on hard being over-committed is not enough (${brutal.toFixed(1)}th)`, brutal > 4);
}

// --- The corner boards --------------------------------------------------------

// Chevrons on every circuit, and never two of them disagreeing.
//
// A chicane is a left and a right forty metres apart. The left wants its boards
// on the right of the road and the right wants its on the left, so placed as
// they fell you got chevrons pointing both ways at once, at the one moment you
// most need to be told a single thing.
{
  for (const key of ALL_ROUTES) {
    const route = buildRoute(key);
    const count = route.nodes.length;
    const signs = new Map();
    for (let i = 0; i < count; i++) {
      for (const prop of route.props[i] || []) {
        if (prop.kind === 'sign') signs.set(i, prop);
      }
    }
    let contradicting = 0;
    for (const [i, a] of signs) {
      for (let d = -3; d <= 3; d++) {
        if (d === 0) continue;
        const b = signs.get(((i + d) % count + count) % count);
        if (b && b.side !== a.side) contradicting++;
      }
    }
    ok(`${key}: ${signs.size} corner boards, none of them contradicting a neighbour`,
      signs.size > 40 && contradicting === 0);
  }

  // And they say something true.
  //
  // Two things are checked and a third deliberately is not. Every board stands
  // on the outside of the bend it points at, which is structural - get the sign
  // wrong once and every board on every circuit is on the wrong verge. And every
  // board that is actually standing in a corner points the way that corner goes.
  //
  // What is not checked is the approach boards, and the reason is worth writing
  // down: they stand on straight road, so there is nothing under them to compare
  // against, and every attempt to work out which corner they must be about by
  // looking ahead got it wrong somewhere - on a circuit like Zandvoort the next
  // corner but one is often sharper than the one you are being warned about. The
  // test that catches a genuinely confusing board is the one above, about
  // neighbours disagreeing.
  let outside = 0;
  let pointing = 0;
  let inCorner = 0;
  let boards = 0;
  for (const key of ALL_ROUTES) {
    const route = buildRoute(key);
    const count = route.nodes.length;
    for (let i = 0; i < count; i++) {
      for (const prop of route.props[i] || []) {
        if (prop.kind !== 'sign') continue;
        boards++;
        if (prop.side !== -prop.bend) outside++;
        let here = 0;
        for (let k = -4; k <= 4; k++) here += route.nodes[((i + k) % count + count) % count].curve;
        // Unambiguously inside a corner: a two hundred metre radius or tighter.
        // Looser than that and a board can be warning about the right-hander
        // ahead while standing on the tail of the gentle left before it, which
        // is what one board at Eau Rouge does and is exactly where you want it.
        if (Math.abs(here / 9) < 0.03) continue;
        inCorner++;
        if (Math.sign(here) !== prop.bend) pointing++;
      }
    }
  }
  ok(`all ${boards} boards stand on the outside of the bend they point at`, outside === 0);
  ok(`and all ${inCorner} of the ones standing in a corner point the way it goes`,
    inCorner > 200 && pointing === 0);
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

// --- The circuits that are real places -------------------------------------------

// The surveyed circuits are checked against the things that are true of them
// rather than against the code that built them: the lap is the length the place
// is, the road is the width the survey says, the height it climbs is the height
// it climbs, and Suzuka's two roads miss each other.
{
  // Widths are after WIDEN and NARROWEST: the survey measures the asphalt and a
  // car uses a bit more than the asphalt, so the whole set is scaled and floored
  // in circuits.js. What is checked here is that they are still all different
  // from each other, which is the part the survey is actually good for.
  const want = {
    spa: { km: 7.00, climb: 98, half: [5.2, 10.8] },
    monza: { km: 5.79, climb: 9, half: [5.2, 8.1] },
    suzuka: { km: 5.80, climb: 40, half: [5.2, 10.1] },
    zandvoort: { km: 4.31, climb: 25, half: [5.3, 10.6] },
    silverstone: { km: 5.89, climb: 15, half: [7.4, 11.7] },
    interlagos: { km: 4.30, climb: 43, half: [5.9, 11.7] },
    spielberg: { km: 4.31, climb: 63, half: [6.7, 9.0] },
    montreal: { km: 4.36, climb: 3, half: [5.4, 9.6] },
    austin: { km: 5.51, climb: 37, half: [7.4, 18.1] },
    sakhir: { km: 5.41, climb: 16, half: [7.1, 14.3] },
    mexico: { km: 4.30, climb: 10, half: [6.5, 11.6] },
    hungaroring: { km: 4.38, climb: 32, half: [5.2, 10.6] },
    melbourne: { km: 5.30, climb: 5, half: [5.3, 10.3] },
    shanghai: { km: 5.44, climb: 7, half: [7.0, 11.5] },
    catalunya: { km: 4.65, climb: 30, half: [5.7, 11.7] },
    yasmarina: { km: 5.54, climb: 9, half: [6.6, 10.2] },
    // Measured rather than authored: the line, the height and the tunnel all
    // came off the map, so this checks a measurement rather than a decision.
    monaco: { km: 3.36, climb: 41, half: [5.2, 5.2] },
    jeddah: { km: 6.28, climb: 12, half: [6.0, 6.0] },
    miami: { km: 6.62, climb: 10, half: [6.0, 6.0] },
    vegas: { km: 6.38, climb: 20, half: [7.5, 7.5] },
    singapore: { km: 3.65, climb: 13, half: [5.5, 5.5] },
    madrid: { km: 5.53, climb: 34, half: [6.0, 6.0] },
    baku: { km: 5.84, climb: 35, half: [5.0, 5.0] },
    losail: { km: 5.42, climb: 8, half: [6.0, 6.0] },
  };
  ok('every surveyed circuit has an expectation written down here',
    SURVEYED_KEYS.every((k) => want[k]));
  for (const [key, w] of Object.entries(want)) {
    const route = buildRoute(key);
    const ys = route.nodes.map((n) => n.y);
    const halves = route.nodes.map((n) => n.half);
    const climb = Math.max(...ys) - Math.min(...ys);
    ok(`${key}: ${(route.metres / 1000).toFixed(2)} km, climbs ${climb.toFixed(0)} m, `
      + `${Math.min(...halves).toFixed(1)}-${Math.max(...halves).toFixed(1)} m either side`,
      Math.abs(route.metres / 1000 - w.km) < 0.02
      && Math.abs(climb - w.climb) < 2
      && Math.abs(Math.min(...halves) - w.half[0]) < 0.2
      && Math.abs(Math.max(...halves) - w.half[1]) < 0.2);
  }

  // Suzuka is a figure of eight, so it has to have a viaduct on it and the
  // viaduct has to have a parapet: without one the car leaves the deck sideways
  // into twenty metres of air.
  const suzuka = buildRoute('suzuka');
  const deck = suzuka.nodes.filter((n) => n.deck > 0.98);
  ok(`suzuka crosses itself on ${suzuka.flyovers.length} viaduct, `
    + `${deck.length} nodes of deck, ${suzuka.flyovers[0]?.clear.toFixed(0)} m of clearance`,
    suzuka.flyovers.length === 1 && deck.length > 8 && suzuka.flyovers[0].clear > 12);
  ok('and the parapet on it is inside the road it carries',
    deck.every((n) => n.wall < n.half + 2 && n.wall > n.half));
  ok('while nowhere else has one', SURVEYED_KEYS
    .filter((k) => k !== 'suzuka')
    .every((k) => buildRoute(k).flyovers.length === 0));

  // Zandvoort's two dished corners, which are the reason it is quicker than its
  // shape suggests.
  const dished = buildRoute('zandvoort').nodes.filter((n) => Math.abs(n.dish) > 0.2);
  const deepest = Math.max(...dished.map((n) => Math.abs(n.dish))) * 180 / Math.PI;
  ok(`zandvoort is dished at ${dished.length} nodes, deepest ${deepest.toFixed(0)} degrees`,
    dished.length > 40 && dished.length < 200 && deepest > 16 && deepest < 20);
  // And the banking has to be worth something, or it is a picture of a banked
  // corner rather than one. The drawn circuits must not have gained any.
  const drop = Math.max(...dished.map((n) => Math.abs(n.dish) * n.half * 2));
  ok(`and it drops the inside of the road by ${drop.toFixed(1)} m across its full width`,
    drop > 2.5);
  // Which way up, which is not a detail: written the other way round it put the
  // inside of Tarzan three and a half metres above the outside - eighteen
  // degrees of corner actively throwing the car off the road - and every other
  // test in this file stayed green.
  //
  // A positive curve is a right-hander, so its outside is at negative x, and the
  // road at x is y minus dish times x.
  // Which way up, checked a corner at a time rather than a node at a time. A
  // single node's curvature wobbles and at the exit of Hugenholtz it briefly
  // reverses, while the corner plainly does not - and a banked corner is banked
  // one way along the whole of its length, because that is how one gets built.
  const zNodes = buildRoute('zandvoort').nodes;
  const roadAt = (n, x) => n.y - n.bank * x * 0.12 - n.dish * x;
  const bends = [];
  let run = null;
  for (const n of zNodes) {
    if (Math.abs(n.dish) > 0.05) (run ||= []).push(n);
    else if (run) {
      bends.push(run);
      run = null;
    }
  }
  if (run) bends.push(run);
  const wrongWay = bends.filter((bend) => {
    const turning = bend.reduce((sum, n) => sum + n.curve, 0);
    // Positive curve is a right-hander, so its outside is at negative x.
    const outside = turning > 0 ? -1 : 1;
    return bend.some((n) => roadAt(n, outside * n.half) <= roadAt(n, -outside * n.half));
  });
  ok(`and all ${bends.length} of them are dished the right way up: `
    + 'the outside of the corner is the high side',
    bends.length === 3 && wrongWay.length === 0);

  // The same question asked of the camber, on every circuit including the three
  // drawn ones. It was answered wrong on all seven until the banking arrived
  // with the same sign on it and made it impossible to miss.
  for (const key of ALL_ROUTES) {
    const nodes = buildRoute(key).nodes;
    const surface = (n, x) => n.y - n.bank * x * 0.12;
    // Read over sixty-six metres, which is what the camber itself is read over:
    // six metres of a surveyed line is noise, and comparing a camber built from
    // a stretch of road against the curvature of one node in it disagrees at
    // every corner entry and exit for no reason anybody would care about.
    const felt = (i) => {
      let sum = 0;
      for (let k = -5; k <= 5; k++) {
        sum += nodes[((i + k) % nodes.length + nodes.length) % nodes.length].curve;
      }
      return sum / 11;
    };
    // Only corners worth the name: on a straight the camber is noise either way.
    const bendy = nodes.filter((n) => Math.abs(felt(n.i)) > 0.02);
    const wrong = bendy.filter((n) => {
      const out = felt(n.i) > 0 ? -n.half : n.half;
      return surface(n, out) < surface(n, -out);
    });
    ok(`${key}: all ${bendy.length} of its real corners are cambered outside-high`,
      bendy.length > 0 && wrong.length === 0);
  }
  ok('while the drawn circuits are dished nowhere',
    ['pass', 'coast', 'grand'].every(
      (k) => buildRoute(k).nodes.every((n) => n.dish === 0),
    ));

  // Nothing standing beside the circuit may be standing on it. A circuit that
  // folds back on itself puts one node's scenery on another node's road, and a
  // dune twenty-six metres off the main straight at Zandvoort was a dune on the
  // road at Hugenholtz - sixty-two of them, on that circuit alone.
  for (const key of SURVEYED_KEYS) {
    const route = buildRoute(key);
    const nodes = route.nodes;
    let on = 0;
    let total = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (const prop of route.props[i] || []) {
        total++;
        if (!prop.side || !prop.off) continue;
        const a = nodes[i];
        const x = a.x + a.nx * prop.side * prop.off;
        const z = a.z + a.nz * prop.side * prop.off;
        for (const b of nodes) {
          // Its own node and the two either side, which is the road it was
          // measured from - the same exemption the placement makes, because this
          // is meant to be asking the placement's question. On a fifteen metre
          // hairpin with a metre and a half of run-off, which is Monaco, a
          // marker post outside the barrier really is close to the road two
          // nodes on, and that is a marker post doing its job.
          const apart = Math.abs(b.i - i);
          if (Math.min(apart, nodes.length - apart) <= 2) continue;
          if (Math.hypot(x - b.x, z - b.z) < b.half + 1) {
            on++;
            break;
          }
        }
      }
    }
    ok(`${key}: none of its ${total} pieces of scenery stands on the road`, on === 0);
  }

  /**
   * And the one that cost a day: no ground may be drawn above a road it could be
   * drawn across.
   *
   * A real circuit folds back on itself, so the ground belonging to one piece of
   * road is drawn over another piece of road. Where the first is higher than the
   * second the result is a flat plane above the camera - Zandvoort put one over
   * a fifth of its lap and covered the sky in the colour of sand, with every
   * other test in this file green.
   */
  for (const key of SURVEYED_KEYS) {
    const route = buildRoute(key);
    const nodes = route.nodes;
    const n = nodes.length;
    const reach = [RINGS[1], RINGS[2], RINGS[3]];
    let worst = 0;
    let where = 0;
    for (let i = 0; i < n; i++) {
      if (nodes[i].deck) continue;
      const mine = [
        Math.max(nodes[i].g.l[0], nodes[i].g.r[0], nodes[i].g.l[1], nodes[i].g.r[1]),
        Math.max(nodes[i].g.l[2], nodes[i].g.r[2]),
        Math.max(...nodes[i].g.far),
      ];
      for (let j = 0; j < n; j++) {
        const gap = Math.min(Math.abs(i - j), n - Math.abs(i - j));
        if (gap < 40) continue;
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
        for (let b = 0; b < 3; b++) {
          if (d > reach[b]) continue;
          const over = mine[b] - nodes[j].y;
          if (over > worst) {
            worst = over;
            where = i;
          }
        }
      }
    }
    ok(`${key}: no ground stands over another part of the lap `
      + `(worst ${worst.toFixed(1)} m, at node ${where})`, worst <= 0);
  }
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
