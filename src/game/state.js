/**
 * What a run is made of, and how to read it.
 *
 * The state is a plain object and nothing outside the simulation writes to it.
 * The renderer reads it, the sound reads it, the score board reads two numbers
 * off it at the end, and none of them may change it - which is the only rule
 * that keeps a game like this honest, because the moment drawing can nudge the
 * world, what you see stops being what happened.
 *
 * Position along the road is a distance in metres, not a node index. Nodes are
 * six metres apart and that is an implementation detail of the road; a rider who
 * knew about it would have to be rewritten the day the spacing changes.
 */

import { HEALTH, ROAD_HALF, SEG, START_TIME, TICK_RATE, TIERS } from '../constants.js';
import { buildRoute } from './route.js';

export const ROUTES = {
  pass: {
    label: 'THE PASS',
    blurb: 'Ten kilometres of switchbacks out of the valley and down the far side. '
      + 'The climbs cost you everything the descents give back.',
  },
  coast: {
    label: 'THE BOULEVARD',
    blurb: 'The sea front, flat and open, four lanes of it. Nothing here slows you '
      + 'down except the traffic and the people trying to put you in it.',
  },
  grand: {
    label: 'THE GRAND RUN',
    blurb: 'Over the pass and along the coast without stopping. Twice the road, '
      + 'twice the law, and the only time worth having.',
  },
};

/** A rider, whoever is on the bike. The player is one of these and nothing more. */
export function makeRider(kind, s, x, extra = {}) {
  return {
    kind,
    pal: kind === 'player' ? 'player' : kind,
    s,
    x,
    vx: 0,
    speed: 0,
    health: HEALTH,
    wobble: 0,
    lean: 0,
    swing: 0,
    swingSide: 0,
    swingT: 0,
    cool: 0,
    kicking: false,
    hurt: 0,          // ticks of flinch, drawn as a stagger
    down: false,
    downT: 0,
    spin: 0,
    gone: false,
    weapon: null,
    want: 0,          // where the ai would like to be, across the road
    think: 0,
    ...extra,
  };
}

export function makeState({ route = 'pass', tier = 'normal', seed = 1 } = {}) {
  const cfg = TIERS[tier] || TIERS.normal;
  const built = buildRoute(route);
  return {
    routeKey: route,
    route: built,
    tier,
    cfg,
    rng: seed | 0,
    tick: 0,
    riders: [makeRider('player', 0, 3.5, { weapon: null })],
    cars: [],
    drops: [],
    chopper: null,
    heat: 0,
    clock: START_TIME * cfg.clock,
    elapsed: 0,
    bonus: 0,
    knocks: { rival: 0, gang: 0, cop: 0 },
    checkpoint: 0,
    checkNote: 0,
    // Counters, not times: each one is ticked down and fires at zero. The gang
    // starts a long way from zero because being jumped on the first corner
    // teaches you nothing about the road.
    spawn: { rival: 0, gang: 720, cop: 240, car: 0 },
    prevMask: 0,
    finished: false,
    over: false,
    reason: '',
    shake: 0,
    flash: 0,
    events: [],
  };
}

export const player = (state) => state.riders[0];

/** How far along, as a fraction. What the progress bar is. */
export function progress(state) {
  return Math.max(0, Math.min(1, player(state).s / state.route.metres));
}

/**
 * The node under a given distance, and how far past it we are.
 *
 * Clamped at both ends rather than wrapping: this is a road from somewhere to
 * somewhere, not a circuit, and a rider who has run off the end of it should
 * stay pinned to the last piece of tarmac rather than reappear at the start.
 */
export function nodeAt(route, s) {
  const at = s / SEG;
  const i = Math.max(0, Math.min(route.nodes.length - 2, Math.floor(at)));
  return { i, t: Math.max(0, Math.min(1, at - i)) };
}

/** World position and heading of a point on the road, `x` metres off centre. */
export function worldOf(route, s, x, lift = 0) {
  const { i, t } = nodeAt(route, s);
  const a = route.nodes[i];
  const b = route.nodes[i + 1];
  const cx = a.x + (b.x - a.x) * t;
  const cy = a.y + (b.y - a.y) * t;
  const cz = a.z + (b.z - a.z) * t;
  const nx = a.nx + (b.nx - a.nx) * t;
  const nz = a.nz + (b.nz - a.nz) * t;
  const bank = a.bank + (b.bank - a.bank) * t;
  return {
    x: cx + nx * x,
    y: cy + lift - bank * x * 0.12,
    z: cz + nz * x,
    a: a.a + (b.a - a.a) * t,
    bank,
    slope: a.slope,
    curve: a.curve,
    node: a,
  };
}

/** Is this point on the tarmac, on the verge, or in the scenery? */
export function surfaceOf(x) {
  const off = Math.abs(x) - ROAD_HALF;
  if (off <= 0) return 'road';
  if (off <= 3.2) return 'verge';
  return 'rough';
}

// --- Putting numbers on the screen -------------------------------------------

export const kmh = (speed) => Math.round(speed * 3.6);

/** Ticks into `1:23.45`, which is the only shape a time is ever shown in. */
export function formatTime(ticks) {
  const total = Math.max(0, ticks) / TICK_RATE;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const h = Math.floor((total * 100) % 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(h).padStart(2, '0')}`;
}

/** Seconds on the clock, in the two digits an arcade cabinet would give you. */
export function formatClock(seconds) {
  return String(Math.max(0, Math.ceil(seconds))).padStart(2, '0');
}

/**
 * The number that goes on the score board.
 *
 * Your time, less what putting people down was worth. Working it out here rather
 * than in the simulation keeps the bonus honest: the clock you race against and
 * the time you are judged on are two different things, and mixing them would
 * mean a rider who fought could never be compared with one who did not.
 */
export function finalTicks(state) {
  return Math.max(1, Math.round(state.elapsed - state.bonus * TICK_RATE));
}
