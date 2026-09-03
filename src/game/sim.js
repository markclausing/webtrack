/**
 * The simulation. Sixty ticks a second, and the only thing in the game allowed
 * to change the state.
 *
 * Two ideas hold it together.
 *
 * The first is that the player is a car and nothing else. There is no code
 * anywhere that says "if this is the player": the same function drives, the same
 * function works out whether the corner is going to have it, and the same
 * function decides that two cars cannot be in the same place. What the player
 * has that the others do not is a six-bit input mask instead of a mind. That is
 * why a rival will put another rival in the gravel without being told to.
 *
 * The second is grip, and it is worth reading twice because everything that
 * feels like driving comes out of four lines in `drive`. A corner of curvature k
 * asks for v squared times k of sideways acceleration. If the car has that much,
 * it goes where it is pointed, and whatever is left over is what the steering has
 * to work with. If it does not, the difference goes two ways at once: outwards,
 * as the car running wide, and backwards, as speed scrubbed off the tyres. Brake
 * too late and you get both, which is exactly what happens in the real thing.
 *
 * Everything is measured along the track rather than across the world. A car is a
 * distance and an offset. Two cars are near each other when their distances are
 * close, which is one subtraction, and who is winning is whoever has the larger
 * one - true through every corner, for free.
 */

import {
  ACCEL, AI_GRIP, AI_LOOK, AI_TOP, BODY_S, BODY_X, BRAKE, BTN, CHECKPOINT_EVERY,
  CHECKPOINT_TIME, DRAG, DRIVE, DT, GRAVITY, GRIP, GRIP_ROUGH, GRIP_VERGE, NUDGE, NUDGE_COST,
  OFFROAD_DRAG, OFFROAD_TOP, ROAD_HALF, ROLL_DRAG, SCRUB, SEG, SLOPE_PULL, SPIN_AT,
  SPIN_KEEP, SPIN_TIME, STEER_FLOOR, STEER_RATE, STEER_SPEED, TOP_SPEED, TOW_DRAG,
  TOW_RANGE, TOW_WIDTH, WALL_AT, WALL_KEEP,
} from '../constants.js';
import { nextRandom, randRange } from '../util.js';
import { makeState, nodeAt, player, racing, surfaceOf } from './state.js';

/** Ticks before the same pair of cars can be charged for touching again. */
const BUMP_COOL = 20;
/** How far past the racing line a rival will run when it makes a mistake. */
const MISTAKE = 4.5;

// --- The tick ----------------------------------------------------------------

export function step(state, mask = 0) {
  state.events.length = 0;
  if (state.over || state.finished) return state;

  state.tick++;
  state.shake *= 0.86;
  if (state.checkNote > 0) state.checkNote--;

  if (!racing(state)) {
    lights(state, mask);
    state.prevMask = mask;
    return state;
  }

  state.elapsed++;
  state.clock -= DT;
  if (state.clock <= 0) {
    state.clock = 0;
    return end(state, 'time');
  }

  control(state, player(state), mask);
  for (let i = 1; i < state.cars.length; i++) think(state, state.cars[i]);
  for (const car of state.cars) drive(state, car);

  tow(state);
  contacts(state);
  order(state);
  checkpoints(state);

  const p = player(state);
  if (p.done) return end(state, 'finish');
  state.prevMask = mask;
  return state;
}

function end(state, reason) {
  state.reason = reason;
  if (reason === 'finish') state.finished = true;
  else state.over = true;
  state.events.push({ t: reason, place: state.place });
  return state;
}

/**
 * Five lights on, five lights off.
 *
 * Nothing moves until they do. Holding the throttle through them does not give
 * you a better start and does not give you a penalty either - a launch minigame
 * in front of a three minute race is one decision too many before you have even
 * turned a wheel - but the engine answers, which is the half of it that matters.
 */
function lights(state, mask) {
  const was = Math.floor(state.lights / 40);
  state.lights--;
  const now = Math.floor(state.lights / 40);
  if (now !== was) state.events.push({ t: 'light', left: now });
  if (state.lights <= 0) state.events.push({ t: 'green' });
  const p = player(state);
  p.ctl = { throttle: false, brake: true, steer: 0, revving: !!(mask & (BTN.UP | BTN.FIRE)) };
  for (const car of state.cars) car.speed = 0;
}

// --- Driving ------------------------------------------------------------------

/**
 * Turns the input mask into the same orders the ai gives its drivers.
 *
 * The two buttons do the pedals as well as the stick does. On a keyboard nobody
 * will ever use them; on a phone the stick has to be free to steer with, and a
 * thumb pushing up on a stick while the other thumb is not on a pedal is how you
 * end up in the barrier at the first corner.
 */
function control(state, p, mask) {
  p.ctl = {
    throttle: !!(mask & (BTN.UP | BTN.FIRE)),
    brake: !!(mask & (BTN.DOWN | BTN.SWITCH)),
    steer: ((mask & BTN.RIGHT) ? 1 : 0) - ((mask & BTN.LEFT) ? 1 : 0),
  };
}

/**
 * One car, one tick.
 *
 * Read in this order: what is under the tyres, what the engine and the brakes
 * are doing, what the corner is taking, and what is left for the driver.
 */
function drive(state, car) {
  if (car.done) return;

  if (car.spinT > 0) {
    // Round it goes. No control, and the tyres take most of what is left of the
    // speed with them.
    car.spinT--;
    car.yaw += 0.16;
    car.speed *= 0.955;
    car.vx *= 0.94;
    car.x += car.vx * DT;
    car.s += car.speed * DT;
    car.slide = 1;
    if (car.spinT <= 0) {
      car.yaw = 0;
      car.speed = Math.max(car.speed, TOP_SPEED * SPIN_KEEP);
    }
    return;
  }

  const ctl = car.ctl || { throttle: true, brake: false, steer: 0 };
  const { i } = nodeAt(state.route, car.s);
  const node = state.route.nodes[i];
  const surf = surfaceOf(car.x);

  // What is under the tyres. Off the tarmac you lose most of the grip and a
  // great deal of the speed, which is what makes running wide a mistake rather
  // than a wider line.
  const hold = surf === 'road' ? 1 : surf === 'verge' ? GRIP_VERGE : GRIP_ROUGH;
  const grip = GRIP * state.cfg.grip * hold * (car.gripScale || 1);
  const pull = (car.power || DRIVE) * (surf === 'rough' ? OFFROAD_TOP : 1);

  let acc = 0;
  if (ctl.throttle) acc += ACCEL * Math.max(0, 1 - car.speed / Math.max(8, pull));
  if (ctl.brake) acc -= BRAKE * (0.4 + 0.6 * hold);
  // The tow: less air in front of you is less drag, and it is the only thing
  // that will drag you past somebody on a straight.
  acc -= DRAG * car.speed * car.speed * (1 - TOW_DRAG * car.tow);
  acc -= ROLL_DRAG * (0.04 + (surf === 'road' ? 0 : OFFROAD_DRAG));
  acc -= GRAVITY * SLOPE_PULL * node.slope;

  // The corner. `need` is what it is asking for and `grip` is what there is.
  const kappa = node.curve / SEG;
  const need = car.speed * car.speed * Math.abs(kappa);
  car.slide = Math.max(0, need - grip);
  if (car.slide > 0) {
    // Out it goes, and the tyres pay for it.
    car.vx -= Math.sign(kappa) * car.slide * DT;
    acc -= car.slide * SCRUB;
  }
  car.speed = Math.max(0, car.speed + acc * DT);

  // Whatever the corner did not take is what the driver has. At the limit the
  // wheel stops doing anything, which is the moment you learn to brake earlier.
  const spare = Math.max(0, 1 - need / Math.max(1, grip));
  const bite = Math.min(1, car.speed / STEER_FLOOR) * Math.sqrt(spare) * hold;
  const want = ctl.steer * STEER_SPEED * bite;
  car.vx += (want - car.vx) * STEER_RATE * DT;
  car.x += car.vx * DT;

  // The barrier. Always there, always the same price.
  if (Math.abs(car.x) > WALL_AT) {
    const into = Math.abs(car.vx) + car.speed * 0.05;
    car.x = Math.sign(car.x) * WALL_AT;
    car.vx = -car.vx * 0.25;
    car.speed *= WALL_KEEP;
    if (car === player(state)) state.shake = 1;
    state.events.push({ t: 'wall', mine: car === player(state) });
    if (into > SPIN_AT * 0.7) spin(state, car);
  }

  car.s += car.speed * DT;

  // Which way the car is pointed, for drawing. It follows where the car is
  // actually going rather than where it is asked to go, so a car running wide is
  // visibly pointing at the apex it is not going to make.
  const to = Math.max(-0.45, Math.min(0.45, car.vx * 0.028 - Math.sign(kappa) * Math.min(0.3, car.slide * 0.02)));
  car.yaw += (to - car.yaw) * 0.25;
  car.roll = -Math.sign(kappa) * Math.min(0.045, (need / Math.max(1, grip)) * 0.045);

  if (car.s >= state.route.metres - 12) {
    car.done = true;
    car.doneAt = state.elapsed;
  }
}

/** Round it goes: the end of somebody's afternoon, and often somebody else's. */
function spin(state, car) {
  if (car.spinT > 0) return;
  car.spinT = SPIN_TIME;
  car.slide = 1;
  if (car === player(state)) state.shake = 1;
  state.events.push({ t: 'spin', mine: car === player(state) });
}

// --- The tow -------------------------------------------------------------------

/**
 * How much of somebody else's hole in the air each car is sitting in.
 *
 * Worked out once for everybody rather than inside `drive`, because it is the
 * one thing here that depends on two cars at the same instant, and doing it in
 * the middle of driving would mean the answer depended on the order the cars
 * happen to sit in the array.
 */
function tow(state) {
  for (const car of state.cars) {
    if (car.done) { car.tow = 0; continue; }
    let best = 0;
    for (const other of state.cars) {
      if (other === car || other.done) continue;
      const gap = other.s - car.s;
      if (gap <= BODY_S || gap > TOW_RANGE) continue;
      if (Math.abs(other.x - car.x) > TOW_WIDTH) continue;
      // Strongest right behind them and gone by forty metres.
      best = Math.max(best, 1 - (gap - BODY_S) / (TOW_RANGE - BODY_S));
    }
    // Eased rather than switched, or the note and the speed would flicker every
    // time a wheel moved half a metre.
    car.tow += (best - car.tow) * 0.12;
  }
}

// --- Two cars in the same place ------------------------------------------------

function contacts(state) {
  const cars = state.cars;
  for (const car of cars) if (car.bumpT > 0) car.bumpT--;

  for (let i = 0; i < cars.length; i++) {
    const a = cars[i];
    if (a.done) continue;
    for (let j = i + 1; j < cars.length; j++) {
      const b = cars[j];
      if (b.done) continue;
      const ds = a.s - b.s;
      if (Math.abs(ds) > BODY_S || Math.abs(a.x - b.x) > BODY_X) continue;

      // Side by side: they lean on each other and both lose a little.
      const push = (a.x < b.x ? -1 : 1) * NUDGE;
      a.vx += push;
      b.vx -= push;
      a.speed *= NUDGE_COST;
      b.speed *= NUDGE_COST;

      if (a.bumpT || b.bumpT) continue;
      a.bumpT = BUMP_COOL;
      b.bumpT = BUMP_COOL;
      state.events.push({ t: 'touch', mine: a === player(state) || b === player(state) });

      // Nose to tail is a different thing entirely. Whoever was behind was the
      // one who got it wrong, and it is their race that ends.
      const behind = ds < 0 ? a : b;
      const ahead = ds < 0 ? b : a;
      const closing = behind.speed - ahead.speed;
      if (Math.abs(ds) < BODY_S * 0.8 && closing > 6) {
        behind.speed -= closing * 0.75;
        ahead.speed += closing * 0.15;
        if (closing > SPIN_AT) spin(state, behind);
      }
    }
  }
}

// --- Minds ----------------------------------------------------------------------

/**
 * What the other seven are doing.
 *
 * A rival brakes for the corner it can see, aims for the inside of it, and goes
 * round the outside of anybody slow enough to be in the way. It is not modelling
 * a driver; it is doing the two things a driver does that you would notice if
 * they were missing - arriving at a corner at the right speed, and not driving
 * into the back of people.
 *
 * They are given slightly less grip than you and slightly less top end, which is
 * the whole of the difficulty setting. That is deliberate: a rival that cheated
 * would be one you could not learn, and learning where they brake is the only
 * thing that gets you past seven of them in three minutes.
 */
function think(state, car) {
  if (car.spinT > 0 || car.done) return;

  const limit = safeSpeed(state, car);
  const wide = ROAD_HALF - 1.4;

  if (car.think > 0) car.think--;
  else {
    car.think = 10 + Math.floor(nextRandom(state) * 14);
    const { i } = nodeAt(state.route, car.s);
    // Where the corner is going, a good way ahead: you turn in before you can
    // feel it, which is what makes a line a line rather than a reaction.
    const soon = state.route.nodes[Math.min(state.route.nodes.length - 1, i + 22)];
    const apex = -Math.sign(soon.curve) * Math.min(1, Math.abs(soon.curve) * 34) * wide;
    car.line = apex;

    // Somebody slow in the way is worth more than the perfect line.
    const block = inTheWay(state, car);
    if (block) car.line = Math.max(-wide, Math.min(wide, block));

    // And every so often one of them gets it wrong, because a field that never
    // does is a field you are racing against a spreadsheet.
    if (nextRandom(state) < 0.006 * (2 - state.cfg.ai)) {
      car.wrong = 40 + Math.floor(nextRandom(state) * 50);
      car.wrongTo = (nextRandom(state) < 0.5 ? -1 : 1) * MISTAKE;
    }
  }

  let line = car.line;
  if (car.wrong > 0) {
    car.wrong--;
    line += car.wrongTo;
  }

  const off = line - car.x;
  car.ctl = {
    throttle: car.speed < limit,
    brake: car.speed > limit * 1.02,
    steer: Math.max(-1, Math.min(1, off * 0.42)),
  };
}

/**
 * The fastest this car may be going right now, given what is coming.
 *
 * Walks up the road looking at every corner within braking distance and asks the
 * only question that matters: if I am doing v here, can I still be down to that
 * corner's speed by the time I reach it? The lowest answer wins. This is what a
 * braking point is, and working it out rather than scripting it is why the same
 * code drives the pass and the boulevard.
 */
function safeSpeed(state, car) {
  const nodes = state.route.nodes;
  const grip = GRIP * state.cfg.grip * AI_GRIP * (car.gripScale || 1);
  const brake = BRAKE * 0.82;
  let limit = TOP_SPEED;
  const from = Math.floor(car.s / SEG);
  const reach = Math.ceil(AI_LOOK / SEG);

  for (let n = 0; n <= reach; n++) {
    const node = nodes[Math.min(nodes.length - 1, from + n)];
    const kappa = Math.abs(node.curve) / SEG;
    if (kappa < 1e-5) continue;
    const corner = Math.sqrt(grip / kappa);
    if (corner >= limit) continue;
    // v² = corner² + 2·a·d, which is the same sum a driver does with their eyes.
    const d = Math.max(0, n * SEG - 8);
    limit = Math.min(limit, Math.sqrt(corner * corner + 2 * brake * d));
  }
  return limit;
}

/** Where to go to get round somebody who is slower and in front. */
function inTheWay(state, car) {
  let worst = null;
  let worstGap = 46;
  for (const other of state.cars) {
    if (other === car || other.done) continue;
    const gap = other.s - car.s;
    if (gap <= 0 || gap > worstGap) continue;
    if (Math.abs(other.x - car.x) > 4.2) continue;
    if (other.speed > car.speed + 2) continue;
    worstGap = gap;
    worst = other;
  }
  if (!worst) return null;
  // Round whichever side there is more room on.
  const room = worst.x > 0 ? -1 : 1;
  return worst.x + room * 3.6;
}

// --- Who is winning -------------------------------------------------------------

/**
 * Places and gaps, once a tick.
 *
 * A car that has finished is ahead of every car that has not, however far up the
 * road the others still are, and among the finished it goes on who got there
 * first. Sorting on distance alone would have the leader drop to last the moment
 * they crossed the line and stopped moving.
 */
function order(state) {
  const sorted = [...state.cars].sort((a, b) => {
    if (a.done !== b.done) return a.done ? -1 : 1;
    if (a.done && b.done) return a.doneAt - b.doneAt;
    return b.s - a.s;
  });
  for (let i = 0; i < sorted.length; i++) {
    const car = sorted[i];
    car.place = i + 1;
    const ahead = sorted[i - 1];
    // A gap in seconds rather than metres, because seconds are the unit anybody
    // watching a race thinks in and metres are the unit nobody does.
    car.gap = ahead ? (ahead.s - car.s) / Math.max(20, car.speed) : 0;
  }
  state.place = player(state).place;
  state.order = sorted;
}

// --- The clock -------------------------------------------------------------------

function checkpoints(state) {
  const p = player(state);
  const node = Math.floor(p.s / SEG);
  const next = (state.checkpoint + 1) * CHECKPOINT_EVERY;
  if (node < next) return;
  state.checkpoint++;
  state.clock += CHECKPOINT_TIME * state.cfg.clock;
  state.checkNote = 110;
  state.events.push({ t: 'check', clock: state.clock });
}

/** A race, ready to run: a grid, and eight drivers with something to tell apart. */
export function makeRace(options) {
  return seedField(makeState(options));
}

/**
 * Gives the field its characters.
 *
 * Called once when a race is made rather than from makeState, because it needs
 * the difficulty setting and the seeded rng and makeState has no business
 * knowing about either. Pole is the quickest and the back of the grid is the
 * slowest, by about four per cent end to end - enough that the order means
 * something and not so much that the last row is scenery.
 */
export function seedField(state) {
  for (const car of state.cars) {
    if (car.kind === 'player') {
      car.power = DRIVE;
      car.gripScale = 1;
      continue;
    }
    const pace = 1 - car.slot * 0.006;
    car.power = DRIVE * AI_TOP * state.cfg.ai * pace;
    car.gripScale = AI_GRIP * state.cfg.ai * pace * randRange(state, 0.995, 1.02);
    car.think = Math.floor(nextRandom(state) * 12);
  }
  order(state);
  return state;
}
