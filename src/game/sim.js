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
  ACCEL, AI_GRIP, AI_LOOK, AI_TOP, BODY_S, BODY_X, BRAKE, BTN,
  CHECKPOINT_TIME, DRAG, DRIVE, DT, GRAVITY, GRIP, GRIP_ROUGH, GRIP_VERGE, NUDGE, NUDGE_COST,
  OFFROAD_DRAG, OFFROAD_TOP, PIT_SPEED, PIT_TIME, PIT_X, ROAD_HALF, ROLL_DRAG, SCRUB, SEG,
  SLOPE_PULL, SPIN_AT,
  SPIN_KEEP, SPIN_TIME, STEER_FLOOR, STEER_RATE, STEER_SPEED, TOP_SPEED, TOW_DRAG,
  TOW_RANGE, TOW_WIDTH, TYRE_FLOOR, TYRE_WEAR, WALL_AT, WALL_KEEP,
} from '../constants.js';
import { nextRandom, randRange } from '../util.js';
import { makeState, nodeAt, nodeStep, player, racing, surfaceOf } from './state.js';

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
  pits(state);
  laps(state);
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

  // Four wheels off and nothing happening. The clock does not stop for it, which
  // is the entire cost of a pit stop and the reason it is a decision.
  if (car.pitT > 0) {
    car.speed = 0;
    car.vx = 0;
    car.slide = 0;
    return;
  }

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

  // Anything sitting still that is not being worked on gets going again. There
  // is no reverse gear and no marshal, and a car parked on the circuit for the
  // rest of the race is a bug however it got there.
  const ctl = car.ctl || { throttle: true, brake: false, steer: 0 };
  if (car.speed < 0.4 && racing(state)) ctl.throttle = true;
  const { i } = nodeAt(state.route, car.s);
  const node = state.route.nodes[i];
  const surf = surfaceOf(car.x, node);

  // What is under the tyres. Off the tarmac you lose most of the grip and a
  // great deal of the speed, which is what makes running wide a mistake rather
  // than a wider line. The pit lane is tarmac like any other.
  const hold = surf === 'road' || surf === 'pit' ? 1 : surf === 'verge' ? GRIP_VERGE : GRIP_ROUGH;
  // What is left of the tyres. Fresh they give everything; gone, four fifths.
  const rubber = TYRE_FLOOR + (1 - TYRE_FLOOR) * car.tyre;
  const grip = GRIP * state.cfg.grip * hold * rubber * (car.gripScale || 1);
  // In the lane the engine simply will not pull past the limit. A penalty for
  // exceeding it would be a second rule to explain and a second thing to be
  // annoyed by; a limiter is what the car actually has.
  const pull = surf === 'pit' ? PIT_SPEED
    : (car.power || DRIVE) * (surf === 'rough' ? OFFROAD_TOP : 1);

  let acc = 0;
  if (ctl.throttle) acc += ACCEL * Math.max(0, 1 - car.speed / Math.max(8, pull));
  // And if you arrived at three hundred, it takes it off you.
  if (surf === 'pit' && car.speed > PIT_SPEED) acc -= BRAKE * 0.8;
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

  // The tyres, charged for lateral load squared. A driver who was smooth for two
  // laps has something left for the third; one who leant on them does not.
  if (state.rules.wear) {
    const load = need / Math.max(1, grip);
    car.tyre = Math.max(0, car.tyre - TYRE_WEAR * DT
      * (0.06 + load * load * 1.5 + car.slide * 0.02 + (surf === 'road' ? 0 : 1.4)));
  }

  // Which way the car is pointed, for drawing. It follows where the car is
  // actually going rather than where it is asked to go, so a car running wide is
  // visibly pointing at the apex it is not going to make.
  const to = Math.max(-0.45, Math.min(0.45, car.vx * 0.028 - Math.sign(kappa) * Math.min(0.3, car.slide * 0.02)));
  car.yaw += (to - car.yaw) * 0.25;
  car.roll = -Math.sign(kappa) * Math.min(0.045, (need / Math.max(1, grip)) * 0.045);

}

/** Round it goes: the end of somebody's afternoon, and often somebody else's. */
function spin(state, car) {
  if (car.spinT > 0) return;
  car.spinT = SPIN_TIME;
  car.slide = 1;
  if (car === player(state)) state.shake = 1;
  state.events.push({ t: 'spin', mine: car === player(state) });
}

// --- The pit lane ----------------------------------------------------------------

/**
 * Stopping, and getting going again.
 *
 * A stop is four wheels stationary in the box for two and a half seconds and a
 * new set of tyres at the end of it. The clock does not stop and neither does
 * anybody else, which together with the length of the lane is the whole price -
 * about nine seconds against a lap of the pass, against tyres worth about two
 * and a half a lap. On a three lap race that is a mistake and on a four lap race
 * it is a question, which is the only reason to have it.
 */
function pits(state) {
  if (!state.rules.wear) return;
  for (const car of state.cars) {
    if (car.pitCool > 0) car.pitCool--;
    if (car.pitT > 0) {
      car.pitT--;
      if (car.pitT === 0) {
        car.tyre = 1;
        car.stops++;
        car.wantPit = false;
        // Or the car finishes the stop standing on the box at no speed at all,
        // which is the condition for starting one, and the afternoon becomes a
        // tyre change that never ends.
        car.pitCool = 420;
        state.events.push({ t: 'tyres', mine: car === player(state) });
      }
      continue;
    }
    if (car.done || car.pitCool > 0 || car.speed > 3) continue;
    const node = state.route.nodes[nodeAt(state.route, car.s).i];
    if (!node.pitBox) continue;
    if (surfaceOf(car.x, node) !== 'pit') continue;
    car.pitT = PIT_TIME;
    state.events.push({ t: 'pitin', mine: car === player(state) });
  }
}

// --- Laps ----------------------------------------------------------------------

/**
 * Who has crossed the line, and what it took them.
 *
 * A car's distance keeps going up for the whole race; the lap it is on is that
 * distance divided by the length of the circuit, and a lap is finished when that
 * division rolls over. There is no trigger on the track and nothing to miss:
 * driving backwards over the line would take the counter down again, which is
 * exactly what should happen and is not a case anybody had to write.
 *
 * The first crossing is the start of the race rather than the end of a lap,
 * because the grid is behind the line - which is why laps start at minus one.
 */
function laps(state) {
  const total = state.route.metres;
  for (const car of state.cars) {
    if (car.done) continue;
    const now = Math.floor(car.s / total);
    if (now === car.lap) continue;
    const was = car.lap;
    car.lap = now;
    if (was >= 0 && now > was) {
      car.last = state.elapsed - car.lapFrom;
      if (!car.best || car.last < car.best) {
        car.best = car.last;
        if (car === player(state)) {
          state.lapNote = 130;
          state.events.push({ t: 'best', time: car.last });
        }
      } else if (car === player(state)) {
        state.lapNote = 130;
        state.events.push({ t: 'lap', time: car.last });
      }
    }
    car.lapFrom = state.elapsed;
    if (now >= state.laps) {
      car.done = true;
      car.doneAt = state.elapsed;
    }
  }
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

  // Tyres. A rival stops when the set has genuinely gone and there is enough
  // race left to be worth it, and not otherwise - which is the same sum the
  // player is being asked to do, and means the field does not all dive in at
  // once because a lap counter said so.
  if (state.rules.wear && !car.wantPit && car.stops === 0
    && car.tyre < 0.42 && state.laps - car.lap >= 2) {
    car.wantPit = true;
  }

  if (car.think > 0) car.think--;
  else {
    car.think = 10 + Math.floor(nextRandom(state) * 14);
    const { i } = nodeAt(state.route, car.s);
    // Where the corner is going, a good way ahead: you turn in before you can
    // feel it, which is what makes a line a line rather than a reaction.
    const soon = nodeStep(state.route, i, 22);
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

  // Into the lane, if that is where this one is going.
  const aim = pitAim(state, car);
  let want = limit;
  if (aim) {
    line = aim.line;
    want = Math.min(limit, aim.speed);
  }

  const off = line - car.x;
  car.ctl = {
    throttle: car.speed < want,
    brake: car.speed > want * 1.02 + 0.5,
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
function safeSpeed(state, car, share = AI_GRIP) {
  const rubber = TYRE_FLOOR + (1 - TYRE_FLOOR) * car.tyre;
  const grip = GRIP * state.cfg.grip * share * rubber * (car.gripScale || 1);
  const brake = BRAKE * 0.82;
  let limit = TOP_SPEED;
  const from = nodeAt(state.route, car.s).i;
  const reach = Math.ceil(AI_LOOK / SEG);

  for (let n = 0; n <= reach; n++) {
    const node = nodeStep(state.route, from, n);
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

/**
 * Where a car that has decided to stop should be, and how fast.
 *
 * Shared by the rivals and the reference driver, because the awkward half of it
 * is the same for both: the box has to be braked for from a long way out, and a
 * car that arrives at it still doing eighty simply drives past it and has to go
 * round again. The distance is measured the long way round the lap so that
 * approaching the line from behind gives a large gap rather than a negative one.
 */
function pitAim(state, car) {
  if (!car.wantPit || car.stops > 0) return null;
  const route = state.route;
  const here = route.nodes[nodeAt(route, car.s).i];
  if (!here.pit) return null;
  const box = route.pitBox * SEG;
  const gap = (((box - car.s) % route.metres) + route.metres) % route.metres;
  // Crawling rather than stopping until the box is actually underneath, so a
  // car that has misjudged the braking rolls the last few metres instead of
  // standing still in the lane for the rest of the afternoon.
  const closing = gap < 34;
  return {
    line: PIT_X,
    speed: closing ? Math.max(gap < 4 ? 0 : 3, gap * 0.7 - 1) : PIT_SPEED,
  };
}

/**
 * A hand on the wheel: the reference driver.
 *
 * The same two sums the rivals do - how fast may I be going for what is coming,
 * and where is the apex - handed the player's car instead of a rival's. `share`
 * is how much of the available grip it is willing to use, so it is a dial from
 * timid to over-committed.
 *
 * It exists because three other places wanted a driver and each had written its
 * own: the attract screen behind the menu, the screenshot tool, and the test
 * that checks braking later is still quicker. Three copies of a braking point is
 * three things to get wrong, and the test was the one that mattered - it was
 * checking its own arithmetic rather than the game's.
 */
export function driveLine(state, share = 0.95) {
  const p = player(state);
  const route = state.route;
  let limit = safeSpeed(state, p, share);
  const soon = nodeStep(route, nodeAt(route, p.s).i, 20);

  // It stops when the set has gone and there is a lap left to use a new one on,
  // which is the same call the rivals make and the same one the player is being
  // asked to make.
  if (state.rules.wear && !p.wantPit && p.stops === 0
    && p.tyre < 0.42 && state.laps - p.lap >= 2) {
    p.wantPit = true;
  }

  // The apex, and then anybody slow enough to be in the way of it.
  let line = -Math.sign(soon.curve) * Math.min(1, Math.abs(soon.curve) * 34) * (ROAD_HALF - 1.6);
  for (const other of state.cars) {
    if (other === p || other.done) continue;
    const gap = other.s - p.s;
    if (gap > 2 && gap < 26 && Math.abs(other.x - p.x) < 3.6) {
      line = other.x + (other.x > 0 ? -3.6 : 3.6);
    }
  }

  const aim = pitAim(state, p);
  if (aim) {
    line = aim.line;
    limit = Math.min(limit, aim.speed);
  }

  let mask = p.speed < limit ? BTN.UP : 0;
  if (p.speed > limit * 1.02 + 0.5) mask |= BTN.DOWN;
  const off = line - p.x;
  if (off > 0.5) mask |= BTN.RIGHT;
  if (off < -0.5) mask |= BTN.LEFT;
  return mask;
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

/**
 * The gantries, which give the clock its seconds back.
 *
 * Held as one absolute distance rather than as a node and a lap, so crossing the
 * line for the fourth time is the same arithmetic as crossing it for the first
 * and there is no case where the lap rolled over and the checkpoint did not.
 */
function checkpoints(state) {
  const p = player(state);
  const route = state.route;
  const cps = route.checkpoints;
  let guard = 0;
  while (p.s >= state.cpAt && guard++ < 8) {
    state.checkpoint++;
    state.clock += CHECKPOINT_TIME * state.cfg.clock * state.rules.clock;
    state.checkNote = 110;
    state.events.push({ t: 'check', clock: state.clock });
    state.cpIndex = (state.cpIndex + 1) % cps.length;
    const lap = Math.floor(state.cpAt / route.metres) + (state.cpIndex === 0 ? 1 : 0);
    state.cpAt = lap * route.metres + cps[state.cpIndex] * SEG;
  }
}

/** A race, ready to run: a grid, and a field with something to tell apart. */
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
