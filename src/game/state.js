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
  GRID_GAP, GRID_OFF, LAPS, LIGHTS, MODES, ROAD_HALF, SEG, START_TIME, TICK_RATE, TIERS, VERGE,
} from '../constants.js';
import { buildRoute } from './route.js';
import { SURVEYED, SURVEYED_KEYS } from './circuits.js';

/**
 * The circuits, in the order they appear in the menu.
 *
 * Three drawn and four surveyed, and the drawn ones come first on purpose: they
 * are the ones with a mountain and a sea and a suspension bridge on them, which
 * the real ones cannot have because the real ones are real. A surveyed circuit
 * takes its name and its description from circuits.js, so there is one place
 * where Spa is described and it is the place where Spa is.
 */
export const ROUTES = {
  pass: {
    label: 'THE PASS',
    blurb: 'Four and a quarter kilometres through the mountains, climbing fifty '
      + 'metres and giving it all back. Third gear corners with nowhere at all to '
      + 'put a car that arrives in fifth.',
  },
  coast: {
    label: 'THE BOULEVARD',
    blurb: 'Five and three quarters along the sea front: flat, open and quick, '
      + 'with four corners on it that matter and a great deal of full throttle in '
      + 'between. Whoever leads onto the last straight rarely leads off it.',
  },
  grand: {
    label: 'THE GRAND CIRCUIT',
    blurb: 'Eight kilometres out of the hills, down to the water and back up '
      + 'again. Two laps, because one of them is already a long afternoon.',
  },
  ...Object.fromEntries(SURVEYED_KEYS.map(
    (k) => [k, { label: SURVEYED[k].label, blurb: SURVEYED[k].blurb, real: true }],
  )),
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
    /** How far it is leaning, from the corner and from the road under it. */
    roll: 0,
    /** Where the wheel is, from -1 to 1. The keys move this, not the car. */
    wheel: 0,
    slide: 0,        // grip it is asking for and not getting
    tow: 0,          // how much of another car's hole in the air it is sitting in
    spinT: 0,
    place: slot + 1,
    gap: 0,
    // Laps completed. Minus one on the grid, because the grid is behind the line
    // and the first crossing of it starts the race rather than ending a lap.
    lap: -1,
    lapFrom: 0,      // the tick this lap started on
    last: 0,         // the lap just finished
    best: 0,         // the quickest so far, which is the whole of qualifying
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
export function makeState({
  route = 'pass', mode = 'gp', tier = 'normal', seed = 1, dusk = false,
} = {}) {
  const cfg = TIERS[tier] || TIERS.normal;
  const rules = MODES[mode] || MODES.gp;
  const built = buildRoute(route);
  const field = rules.field;

  const grid = [];
  for (let slot = 0; slot < field; slot++) {
    // The grid is behind the line, so everybody starts on a negative distance
    // and the first thing that happens is a lap counter going from minus one to
    // nought. Pole sits nearest the line; the player is on the back row.
    const at = -(24 + slot * GRID_GAP);
    const side = slot % 2 === 0 ? -1 : 1;
    grid.push(makeCar(slot === field - 1 ? 'player' : 'rival', slot, at, side * GRID_OFF));
  }

  return {
    routeKey: route,
    route: built,
    mode,
    rules,
    laps: LAPS[route] || SURVEYED[route]?.laps || 3,
    field,
    tier,
    cfg,
    rng: seed | 0,
    tick: 0,
    /** cars[0] is always the player. Where they started lives in `slot`. */
    cars: [grid[field - 1], ...grid.slice(0, field - 1)],
    lights: LIGHTS,
    clock: START_TIME * cfg.clock * rules.clock,
    elapsed: 0,
    checkpoint: 0,
    checkNote: 0,
    lapNote: 0,
    // The next checkpoint, as a distance rather than a node: the line itself,
    // which everybody crosses on the way out of the first corner of their lives.
    cpAt: 0,
    cpIndex: 0,
    place: field,
    finished: false,
    over: false,
    reason: '',
    shake: 0,
    /**
     * Nought at the start, one at the flag: afternoon, then dusk, then night.
     *
     * Held at nought for the whole race unless the sunset is asked for, which is
     * the default because a circuit is easier to learn in the light - and
     * because a lap set at midnight and one set at four in the afternoon go on
     * the same board either way.
     */
    dusk,
    light: 0,
    prevMask: 0,
    events: [],
  };
}

export const player = (state) => state.cars[0];

/** Has the race actually started, or are the lights still on? */
export const racing = (state) => state.lights <= 0;

/** How far round this lap, as a fraction. What the progress bar is. */
export function progress(state) {
  return wrap(player(state).s, state.route.metres) / state.route.metres;
}

/** Anything, into the range zero to `by`. Negative distances included. */
export function wrap(value, by) {
  return ((value % by) + by) % by;
}

/** Laps completed, never below zero, for putting on the screen. */
export const lapOf = (car) => Math.max(0, car.lap);

/**
 * The node under a given distance, and how far past it we are.
 *
 * Wrapped, because the track is a loop and a car's distance is not: `s` keeps
 * going up for the whole race and the lap it is on is that distance divided by
 * the length of the circuit. Everything that asks where a car is goes through
 * here, so that is the only place the loop has to be remembered.
 */
export function nodeAt(route, s) {
  const at = wrap(s, route.metres) / SEG;
  const i = Math.floor(at) % route.nodes.length;
  return { i, t: at - Math.floor(at) };
}

/**
 * The node this many further round the lap.
 *
 * Every piece of code that looks up the road goes through here. On a loop that
 * is not a nicety: `nodes[i + 20]` is undefined a hundred metres before the
 * line and negative on the grid, and both of those are a crash rather than a
 * wrong answer.
 */
export function nodeStep(route, i, ahead) {
  const n = route.nodes.length;
  return route.nodes[(((i + ahead) % n) + n) % n];
}

/** World position and heading of a point on the track, `x` metres off centre. */
export function worldOf(route, s, x, lift = 0) {
  const { i, t } = nodeAt(route, s);
  const a = route.nodes[i];
  const b = route.nodes[(i + 1) % route.nodes.length];
  const bank = a.bank + (b.bank - a.bank) * t;
  const dish = a.dish + (b.dish - a.dish) * t;
  const nx = a.nx + (b.nx - a.nx) * t;
  const nz = a.nz + (b.nz - a.nz) * t;
  return {
    x: a.x + (b.x - a.x) * t + nx * x,
    // Camber at a twelfth, banking at its face value: on a dished corner the
    // inside of the road really is metres below the outside, and a car sitting
    // on it has to sit on it.
    y: a.y + (b.y - a.y) * t + lift - bank * x * 0.12 - dish * x,
    z: a.z + (b.z - a.z) * t + nz * x,
    // The heading is continuous round the lap and then jumps by two pi at the
    // line, so the two are compared the short way round rather than subtracted.
    a: a.a + shortTurn(a.a, b.a) * t,
    bank,
    dish,
    // Interpolated like everything else here: taken from the near node alone it
    // holds for six metres and then steps, and a car pitched by it steps with it.
    slope: a.slope + (b.slope - a.slope) * t,
    curve: a.curve,
    node: a,
  };
}

/** Two headings apart, the short way round. */
function shortTurn(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Is this point on the tarmac, on the kerb and grass, or in the gravel?
 *
 * Takes the width it is asked about rather than assuming one. The surveyed
 * circuits are narrower than the drawn ones and narrower in some places than
 * others - Monza is under four metres either side at the Roggia - so a fixed
 * seven would have had cars on the grass reported as being on the road, which
 * is a car with full grip and a puff of dust under it.
 */
export function surfaceOf(x, half = ROAD_HALF) {
  const off = Math.abs(x) - half;
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
 * The number that goes on the score board, which is not the same number in the
 * two modes.
 *
 * Qualifying keeps your quickest single lap, because that is the entire point of
 * going out on an empty circuit. A grand prix keeps the whole race, because a
 * quick lap in a race you lost is a consolation and not a result.
 */
export function finalTicks(state) {
  if (state.mode === 'qual') return Math.max(1, Math.round(player(state).best || 0));
  return Math.max(1, Math.round(state.elapsed));
}
