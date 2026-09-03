/**
 * What a race is made of, and how to read it.
 *
 * The state is a plain object and nothing outside the simulation writes to it.
 * The renderer reads it, the sound reads it, the score board reads two numbers
 * off it at the end, and none of them may change it - which is the only rule
 * that keeps a game like this honest, because the moment drawing can nudge the
 * world, what you see stops being what happened.
 *
 * Position along the track is a distance in metres, not a node index. Nodes are
 * six metres apart and that is an implementation detail of the road; a car that
 * knew about it would have to be rewritten the day the spacing changes.
 *
 * It is also what decides the race. Who is winning is who has the larger `s`,
 * which is one comparison, and it stays true through every corner because the
 * distance is measured along the track rather than across the world.
 */

import {
  FIELD, GRID_GAP, GRID_OFF, LIGHTS, ROAD_HALF, SEG, START_TIME, TICK_RATE, TIERS, VERGE,
} from '../constants.js';
import { buildRoute } from './route.js';

export const ROUTES = {
  pass: {
    label: 'THE PASS',
    blurb: 'Ten kilometres of mountain, climbing out of the valley and dropping '
      + 'down the far side. Third gear corners with nowhere at all to put a car '
      + 'that arrives in fifth.',
  },
  coast: {
    label: 'THE BOULEVARD',
    blurb: 'The sea front: long, open and quick, with four corners on it that '
      + 'matter and a great deal of full throttle in between. Whoever leads onto '
      + 'the last straight does not usually lead off it.',
  },
  grand: {
    label: 'THE GRAND RUN',
    blurb: 'Over the mountain and along the coast without stopping. Twenty-one '
      + 'kilometres, one set of tyres, and the only time worth having.',
  },
};

/** The teams, in the order they line up. Their colours live in the palette. */
export const TEAMS = [
  'ROSSO', 'ARGENT', 'AZUL', 'VERDE', 'AMBRA', 'NERO', 'BIANCO', 'VIOLA',
];

/** A car, whoever is driving it. The player is one of these and nothing more. */
export function makeCar(kind, slot, s, x, extra = {}) {
  return {
    kind,
    slot,
    // You are always in the red one. Which car is yours has to be answerable in
    // the quarter of a second you can spare for it at three hundred, and "the
    // one in the middle" stops being an answer the moment somebody is alongside.
    team: kind === 'player' ? 0 : 1 + (slot % (TEAMS.length - 1)),
    s,
    x,
    vx: 0,
    speed: 0,
    /** How far the car is pointed away from the track, in radians. */
    yaw: 0,
    slide: 0,        // grip it is asking for and not getting
    tow: 0,          // how much of another car's hole in the air it is sitting in
    spinT: 0,
    place: slot + 1,
    gap: 0,
    done: false,
    doneAt: 0,
    ctl: null,
    think: 0,
    line: 0,         // where the ai wants to be across the track
    ...extra,
  };
}

/**
 * A race, on the grid, with the lights still on.
 *
 * The player starts at the back. That is not a difficulty setting, it is the
 * shape of the game: a race you begin in front is a race you can only lose, and
 * an arcade racer has about three minutes in which to give you seven overtakes
 * and the feeling that you earned each one.
 */
export function makeState({ route = 'pass', tier = 'normal', seed = 1 } = {}) {
  const cfg = TIERS[tier] || TIERS.normal;
  const built = buildRoute(route);

  const grid = [];
  for (let slot = 0; slot < FIELD; slot++) {
    // Pole sits furthest up the road; the player is on the back row.
    const at = 30 + (FIELD - 1 - slot) * GRID_GAP;
    const side = slot % 2 === 0 ? -1 : 1;
    grid.push(makeCar(slot === FIELD - 1 ? 'player' : 'rival', slot, at, side * GRID_OFF));
  }

  return {
    routeKey: route,
    route: built,
    tier,
    cfg,
    rng: seed | 0,
    tick: 0,
    /** cars[0] is always the player. Where they started lives in `slot`. */
    cars: [grid[FIELD - 1], ...grid.slice(0, FIELD - 1)],
    lights: LIGHTS,
    clock: START_TIME * cfg.clock,
    elapsed: 0,
    checkpoint: 0,
    checkNote: 0,
    place: FIELD,
    finished: false,
    over: false,
    reason: '',
    shake: 0,
    prevMask: 0,
    events: [],
  };
}

export const player = (state) => state.cars[0];

/** Has the race actually started, or are the lights still on? */
export const racing = (state) => state.lights <= 0;

/** How far along, as a fraction. What the progress bar is. */
export function progress(state) {
  return Math.max(0, Math.min(1, player(state).s / state.route.metres));
}

/**
 * The node under a given distance, and how far past it we are.
 *
 * Clamped at both ends rather than wrapping: this is a road from somewhere to
 * somewhere, not a circuit, and a car that has run off the end of it should stay
 * pinned to the last piece of tarmac rather than reappear at the start.
 */
export function nodeAt(route, s) {
  const at = s / SEG;
  const i = Math.max(0, Math.min(route.nodes.length - 2, Math.floor(at)));
  return { i, t: Math.max(0, Math.min(1, at - i)) };
}

/** World position and heading of a point on the track, `x` metres off centre. */
export function worldOf(route, s, x, lift = 0) {
  const { i, t } = nodeAt(route, s);
  const a = route.nodes[i];
  const b = route.nodes[i + 1];
  const bank = a.bank + (b.bank - a.bank) * t;
  const nx = a.nx + (b.nx - a.nx) * t;
  const nz = a.nz + (b.nz - a.nz) * t;
  return {
    x: a.x + (b.x - a.x) * t + nx * x,
    y: a.y + (b.y - a.y) * t + lift - bank * x * 0.12,
    z: a.z + (b.z - a.z) * t + nz * x,
    a: a.a + (b.a - a.a) * t,
    bank,
    slope: a.slope,
    curve: a.curve,
    node: a,
  };
}

/** Is this point on the tarmac, on the kerb and grass, or in the gravel? */
export function surfaceOf(x) {
  const off = Math.abs(x) - ROAD_HALF;
  if (off <= 0) return 'road';
  if (off <= VERGE) return 'verge';
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

/** A gap between two cars, in seconds, the way a pit board writes one. */
export function formatGap(seconds) {
  const v = Math.abs(seconds);
  if (!Number.isFinite(v) || v >= 100) return '--.-';
  return v.toFixed(1);
}

/** Seconds on the clock, in the two digits an arcade cabinet would give you. */
export function formatClock(seconds) {
  return String(Math.max(0, Math.ceil(seconds))).padStart(2, '0');
}

/** `1ST`, `2ND`, `3RD`. Shown big enough that it is the first thing you read. */
export function ordinal(place) {
  const n = Math.max(1, Math.round(place));
  const suffix = n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH';
  return `${n}${suffix}`;
}

/**
 * The number that goes on the score board.
 *
 * Just the time. There is no bonus and nothing to subtract: a race is won by
 * being quicker than the others and the clock already knows who was. Where you
 * finished goes on the board beside it, because two drivers on the same time did
 * not have the same race, but it is not what the board is sorted by.
 */
export function finalTicks(state) {
  return Math.max(1, Math.round(state.elapsed));
}
