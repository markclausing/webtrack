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
  ACCEL, AI_DEFEND, AI_GRIP, AI_LOOK, AI_MIRROR, AI_SPREAD, AI_TOP, BODY_S, BODY_X, BRAKE,
  BTN, CHECKPOINT_TIME, DRAG, DRIVE, DT, GRAVITY, GRIP, GRIP_ROUGH, GRIP_VERGE, NUDGE,
  NUDGE_COST, OFFROAD_DRAG, OFFROAD_TOP, ROLL_DRAG, SCRUB, SEG, SLOPE_PULL, VERGE_TOP,
  SPIN_AT, SPIN_KEEP, SPIN_TIME, STEER_FLOOR, STEER_RATE, STEER_SPEED, TOP_SPEED, TOW_DRAG,
  TOW_RANGE, TOW_WIDTH, WALL_AT, WALL_KEEP, CAR_HALF,
} from '../constants.js';
import { nextRandom, randRange } from '../util.js';
import { makeState, nodeAt, nodeStep, player, racing, surfaceOf } from './state.js';

/**
 * How much of a corner arrives as a push at the outside of it.
 *
 * The single most important number in the file for whether this is a driving
 * game. Below the grip limit the car used to follow the road for nothing and the
 * wheel only moved you across it - which is why a lap driven flat out with no
 * brakes at all was five seconds quicker than a lap driven properly, with the
 * car leaning on the barrier for a quarter of it. There was no reason to slow
 * down because slowing down bought you nothing.
 *
 * Now a third of what the corner is asking for arrives as v-squared-times-
 * curvature of sideways acceleration, and the wheel is what you hold against it.
 * A corner is a thing you are doing rather than a thing that is happening.
 */
const CORNER_PUSH = 0.44;

/**
 * How quickly the wheel goes from straight to full lock.
 *
 * The keyboard has two positions and a corner needs all of the ones in between,
 * so the key moves a wheel rather than a car: a tap is a small correction, a
 * held key winds on more lock. Without it the only way to hold a line against
 * the push above is to tap the key thirty times a corner, which is not driving,
 * it is morse code.
 */
const WHEEL_RATE = 5.2;

/** Ticks before the same pair of cars can be charged for touching again. */
const BUMP_COOL = 20;
/** How far past the racing line a rival will run when it makes a mistake. */
const MISTAKE = 4.5;

/** Grip per radian of banking. Eighteen degrees is worth about a fifth. */
const BANK_GRIP = 0.62;

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
  // The afternoon going, if it is going at all. Measured on distance rather
  // than on the clock, so a race that has gone badly gets dark at the same place
  // on the circuit as one that has gone well - the light is a property of how
  // far round you are, not of how long you took.
  state.light = state.dusk
    ? Math.max(0, Math.min(1, player(state).s / (state.route.metres * state.laps)))
    : 0;
  if (state.clock <= 0) {
    state.clock = 0;
    return end(state, 'time');
  }

  control(state, player(state), mask);
  for (let i = 1; i < state.cars.length; i++) think(state, state.cars[i]);
  for (const car of state.cars) drive(state, car);

  tow(state);
  contacts(state);
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
  const { i, t: along } = nodeAt(state.route, car.s);
  const node = state.route.nodes[i];
  const after = state.route.nodes[(i + 1) % state.route.nodes.length];
  const surf = surfaceOf(car.x, node.half);

  // What is under the tyres. Off the tarmac you lose most of the grip and a
  // great deal of the speed, which is what makes running wide a mistake rather
  // than a wider line.
  const hold = surf === 'road' ? 1 : surf === 'verge' ? GRIP_VERGE : GRIP_ROUGH;
  const grip = GRIP * state.cfg.grip * hold * (car.gripScale || 1) * dished(node);
  // And how much of the engine reaches the ground.
  //
  // The verge used to get all of it: thirty-eight per cent less grip, a little
  // rolling drag, and full power. Which meant that on any corner exit you could
  // put three metres of the car on the grass and it cost eight hundredths of a
  // second - so running wide was not a mistake, it was a slightly different
  // line. Grass does not give you full traction. It gives you wheelspin.
  const pull = (car.power || DRIVE)
    * (surf === 'rough' ? OFFROAD_TOP : surf === 'verge' ? VERGE_TOP : 1);

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
  if (car.slide > 0) acc -= car.slide * SCRUB;
  car.speed = Math.max(0, car.speed + acc * DT);

  // And out it goes: a share of the corner all of the time, and all of the
  // excess on top when there is any. The first term is what makes holding a line
  // work; the second is what makes getting it wrong cost you the corner.
  car.vx -= Math.sign(kappa) * (need * CORNER_PUSH + car.slide) * DT;

  // Whatever the corner did not take is what the driver has. At the limit the
  // wheel stops doing anything, which is the moment you learn to brake earlier.
  const spare = Math.max(0, 1 - need / Math.max(1, grip));
  const bite = Math.min(1, car.speed / STEER_FLOOR) * Math.sqrt(spare) * hold;
  car.wheel += (ctl.steer - car.wheel) * WHEEL_RATE * DT;
  const want = car.wheel * STEER_SPEED * bite;
  car.vx += (want - car.vx) * STEER_RATE * DT;
  car.x += car.vx * DT;

  // The barrier. Always there, and the price is most of your speed - which is
  // the only thing that stops driving at it being a racing line.
  //
  // On the bridge it is the railing, because on a bridge there is nothing on the
  // other side of the railing. It closes in as the span begins, on the same
  // easing the ground uses to fall away, so the eight metres of run-off narrow
  // to nothing over the first twenty-four metres of the crossing rather than
  // disappearing between one node and the next.
  const wall = node.wall + (node.half + 0.75 - node.wall) * (node.g.bay || 0) - CAR_HALF;
  if (Math.abs(car.x) > wall) {
    const into = Math.abs(car.vx) + car.speed * 0.08;
    car.x = Math.sign(car.x) * wall;
    car.vx = -car.vx * 0.25;
    car.speed *= WALL_KEEP;
    if (car === player(state)) state.shake = 1;
    state.events.push({ t: 'wall', mine: car === player(state) });
    if (into > SPIN_AT * 0.55) spin(state, car);
  }

  car.s += car.speed * DT;

  // Which way the car is pointed, for drawing. It follows where the car is
  // actually going rather than where it is asked to go, so a car running wide is
  // visibly pointing at the apex it is not going to make.
  const to = Math.max(-0.45, Math.min(0.45,
    car.vx * 0.028 + car.wheel * 0.16 - Math.sign(kappa) * Math.min(0.3, car.slide * 0.02)));
  car.yaw += (to - car.yaw) * 0.25;
  // How the car sits: a little lean on its own springs, and the angle of
  // whatever it is standing on.
  //
  // The second half is new and was a bug you could see from the cockpit. The
  // road at Tarzan tilts eighteen degrees and the car was drawn level on it, so
  // half of it went through the surface - a car is nearly two metres wide, and
  // two metres across eighteen degrees is thirty centimetres of bodywork under
  // the tarmac.
  // How far it leans on its springs, from the corner it is in rather than from
  // the node it is on.
  //
  // This was the shiver. At two hundred and sixty the lean saturates at a
  // curvature of three hundredths, and a surveyed line wanders by one hundredth
  // from one node to the next - so on a fast curve the body was slamming from
  // full lean one way to part lean the other and back, ten times a second, on
  // nothing but survey noise. Read over sixty-six metres it is a corner again.
  const felt = node.felt !== undefined ? node.felt / SEG : kappa;
  const load = car.speed * car.speed * Math.abs(felt);
  const lean = -Math.sign(felt) * Math.min(0.045, (load / Math.max(1, grip)) * 0.045);
  // Interpolated between the two nodes, the way the road under it is. Taken from
  // the near node alone the car's roll held still for six metres and then
  // stepped, which at sixty metres a second is ten steps a second and reads as a
  // shiver - the road was already smooth between nodes and the car standing on
  // it was not.
  const tilt = (a, b) => a + (b - a) * along;
  car.roll = lean
    - (tilt(node.dish, after.dish) + tilt(node.bank, after.bank) * 0.12);

}

/** Round it goes: the end of somebody's afternoon, and often somebody else's. */
function spin(state, car) {
  if (car.spinT > 0) return;
  car.spinT = SPIN_TIME;
  car.slide = 1;
  if (car === player(state)) state.shake = 1;
  state.events.push({ t: 'spin', mine: car === player(state) });
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

      // Side by side: they are moved apart until they are not in the same place,
      // and the speed they lose is charged once.
      //
      // Moved rather than pushed. An acceleration applied every tick they
      // overlap accumulates: two cars leaning on each other for half a second
      // come out of it with fifteen metres a second of sideways speed and go
      // straight into the barriers, which is where a hundred and eighty barrier
      // hits a race came from. This separates them by the overlap and cancels
      // the speed they were closing at, which is what two cars leaning on each
      // other actually do.
      const gap = a.x - b.x;
      const dir = gap < 0 ? -1 : 1;
      const overlap = BODY_X - Math.abs(gap);
      a.x += dir * overlap * 0.5;
      b.x -= dir * overlap * 0.5;
      const leaning = (a.vx - b.vx) * dir;
      if (leaning < 0) {
        a.vx -= leaning * 0.5 * dir;
        b.vx += leaning * 0.5 * dir;
      }
      // And a shove, once, so contact is felt rather than merely resolved.
      if (!a.bumpT && !b.bumpT) {
        a.vx += dir * NUDGE * 0.35;
        b.vx -= dir * NUDGE * 0.35;
      }

      if (a.bumpT || b.bumpT) continue;
      a.bumpT = BUMP_COOL;
      b.bumpT = BUMP_COOL;
      a.speed *= NUDGE_COST;
      b.speed *= NUDGE_COST;
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
  // How far off the centre the driver is willing to run, which is the road
  // rather than a number: on a four metre half-width the old constant put the
  // racing line five and a half metres out, which is in the barrier.
  const wide = state.route.nodes[nodeAt(state.route, car.s).i].half - 1.4;

  if (car.think > 0) car.think--;
  else {
    car.think = 10 + Math.floor(nextRandom(state) * 14);
    // Where the corner is going, a good way ahead: you turn in before you can
    // feel it, which is what makes a line a line rather than a reaction.
    //
    // Only the apex, deliberately. A proper three-phase line - outside on entry,
    // apex, outside on exit - was tried and made them two seconds a lap slower
    // and put them on the grass a third of the time: the line moves further and
    // faster than their steering can follow, and a car sawing at a line it
    // cannot hold is slower than a car holding a worse one. If they are to be
    // quicker it will be by driving this line better, not by aiming at a
    // cleverer one.
    const { i } = nodeAt(state.route, car.s);
    const soon = nodeStep(state.route, i, 22);
    const now = nodeStep(state.route, i, 4);
    const late = nodeStep(state.route, i, 40);
    const apex = Math.min(1, Math.abs(soon.curve) * 34);
    // Out, in, out - as much of it as their hands can actually follow.
    //
    // The apex on its own is what they used to aim at, and it is a slow way
    // round: a corner taken from the middle of the road has a smaller radius
    // than the same corner taken from the outside of it, and a smaller radius is
    // a lower speed. The three-phase line was tried before and abandoned because
    // it moved faster than their steering could follow - but their steering has
    // an anticipation term now that it did not have then, and with that it
    // holds. It is worth less in a single fast lap than it is over a race: their
    // quickest lap is unchanged, and they spend a fifth of the time off the
    // tarmac and stopped hitting the barrier altogether, which is where the race
    // pace actually comes from.
    //
    // Which phase they are in comes from comparing the corner in front of them
    // with the corner under them: rising curvature is an entry and wants the
    // outside, falling curvature is an exit and wants the outside as well, and
    // the apex is the moment in between.
    const rising = Math.abs(late.curve) - Math.abs(now.curve);
    const wideSide = Math.sign(soon.curve || now.curve || 1);
    if (apex < 0.12) {
      car.line = 0;
    } else if (rising > 0.006) {
      car.line = wideSide * wide * Math.min(1, apex * 1.1);
    } else if (rising < -0.006) {
      car.line = Math.sign(now.curve || 1) * wide * Math.min(1, apex * 0.9);
    } else {
      car.line = -Math.sign(soon.curve) * apex * wide;
    }

    // Somebody slow in the way is worth more than the perfect line.
    const block = inTheWay(state, car);
    if (block) car.line = Math.max(-wide, Math.min(wide, block));

    // And somebody in the mirrors is worth more than either - but only when
    // there is actually a move being made, and only where a move can be made.
    //
    // Defending on every straight against everybody within twenty-six metres
    // cost the field seven seconds a lap, because in a bunched race there is
    // always somebody there: all eight of them spent the whole afternoon off
    // the racing line covering each other and the player drove round the
    // outside of the lot. So: close, genuinely quicker, and not in a corner -
    // a corner is where the line is worth more than the door.
    const chaser = behind(state, car);
    const inCorner = Math.abs(nodeStep(state.route, i, 6).curve) > 0.02;
    if (chaser && !inCorner && chaser.speed > car.speed + 1.5) {
      const cover = car.line + (chaser.x - car.line) * AI_DEFEND;
      car.line = Math.max(-wide, Math.min(wide, cover));
    }

    // And every so often one of them gets it wrong, because a field that never
    // does is a field you are racing against a spreadsheet.
    if (nextRandom(state) < 0.004 * (2 - state.cfg.ai)) {
      car.wrong = 34 + Math.floor(nextRandom(state) * 40);
      car.wrongTo = (nextRandom(state) < 0.5 ? -1 : 1) * MISTAKE;
    }
  }

  let line = car.line;
  if (car.wrong > 0) {
    car.wrong--;
    line += car.wrongTo;
  }

  // Steering against where the car is going as well as where it is. Without the
  // second term it is a proportional controller fighting a corner that pushes
  // continuously, which leaves a standing error: they ran eight per cent of
  // every lap off the tarmac and into the barrier twice a lap, alone on an
  // empty circuit. It is the same anticipation the reference driver uses.
  const off = (line - car.x) - car.vx * 0.34;

  /**
   * And they no longer drive into the back of each other.
   *
   * There was nothing in here about the car in front. The only speed a rival
   * knew was the speed the next corner allows, so on a circuit where they are
   * evenly matched - which is every circuit, the field is spread by one per cent
   * end to end - the one behind simply drove into the one ahead, was shoved
   * sideways by the contact code, lost three and a half per cent of its speed,
   * and did it again. They spend forty per cent of a race within fifteen metres
   * of somebody, so that ran to about three seconds a lap: the fastest of them
   * could lap Spa in 1:58 and the field averaged 2:01, and the difference was
   * paid straight to whoever was in clean air. Which was the player.
   *
   * Nine metres and matching speed. Closer than that and they lift; further and
   * they can close, which keeps them inside the forty-two metres a tow works
   * over - so a car that cannot pass sits in the hole in the air and waits for
   * somewhere it can, instead of hammering the car in front down the straight.
   */
  let want = limit;
  const front = ahead(state, car);
  if (front) {
    const gap = front.s - car.s;
    want = Math.min(want, front.speed + Math.max(0, (gap - 9) * 0.9));
  }
  car.ctl = {
    throttle: car.speed < want,
    brake: car.speed > want * 1.02 + 0.5,
    steer: Math.max(-1, Math.min(1, off * 0.95)),
  };
}

/**
 * The car this one is about to run into: nearest ahead, in its path, and closing.
 *
 * Narrower than `inTheWay`, and looking for something else. That one asks which
 * side to go round somebody slow; this one asks whether to be on the brakes at
 * all, so it only cares about cars actually in front of this one's nose.
 */
function ahead(state, car) {
  let best = null;
  let closest = 34;
  for (const other of state.cars) {
    if (other === car || other.done) continue;
    const gap = other.s - car.s;
    if (gap <= 0 || gap > closest) continue;
    if (Math.abs(other.x - car.x) > BODY_X * 1.15) continue;
    closest = gap;
    best = other;
  }
  return best;
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
  const base = GRIP * state.cfg.grip * share * (car.gripScale || 1);
  // How much of the brakes the braking point is worked out with. Under one
  // because a car that brakes at exactly the last possible moment has no margin
  // for the corner being slightly different than it looked - and over the old
  // 0.82, because that margin was a second a lap of nothing.
  const brake = BRAKE * 0.92;
  let limit = TOP_SPEED;
  const from = nodeAt(state.route, car.s).i;
  const reach = Math.ceil(AI_LOOK / SEG);

  for (let n = 0; n <= reach; n++) {
    const node = nodeStep(state.route, from, n);
    const kappa = Math.abs(node.curve) / SEG;
    if (kappa < 1e-5) continue;
    // The banking is read at the corner rather than under the car, or a driver
    // would brake for a dished corner as though it were flat and then find they
    // had thrown away the whole advantage of it on the way in.
    const corner = Math.sqrt((base * dished(node)) / kappa);
    if (corner >= limit) continue;
    // v² = corner² + 2·a·d, which is the same sum a driver does with their eyes.
    const d = Math.max(0, n * SEG - 8);
    limit = Math.min(limit, Math.sqrt(corner * corner + 2 * brake * d));
  }
  return limit;
}

/**
 * How much more grip a dished corner is worth.
 *
 * Banking works by tilting the road so that part of the car's weight points at
 * the middle of the corner instead of at the ground. The textbook sum for it
 * divides by one minus mu tan theta, which for a car with this much mechanical
 * grip goes to infinity somewhere around fifteen degrees and is no use to
 * anybody. So it is linear in the angle and tuned to arrive at about a fifth
 * more grip at eighteen degrees, which is what Zandvoort's two dished corners
 * are and roughly what they are worth.
 *
 * Only the authored banking counts. The camber every corner has is drawn at a
 * twelfth of its nominal value and has never touched the car; making it grip
 * would have quietly rewritten how the three drawn circuits drive.
 */
function dished(node) {
  // Positive when the road is tilted into the corner rather than out of it.
  // `dish` is signed by the corner it belongs to, so this is only ever a
  // multiplication - but it is the same sign the road geometry uses, and when
  // that was flipped this quietly stopped paying out anything at all.
  const lean = (node.dish || 0) * Math.sign(node.curve || 1);
  return lean > 0 ? 1 + lean * BANK_GRIP : 1;
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
  const limit = safeSpeed(state, p, share);
  const soon = nodeStep(route, nodeAt(route, p.s).i, 20);


  // The apex, and then anybody slow enough to be in the way of it.
  let line = -Math.sign(soon.curve) * Math.min(1, Math.abs(soon.curve) * 34) * (soon.half - 1.6);
  for (const other of state.cars) {
    if (other === p || other.done) continue;
    const gap = other.s - p.s;
    if (gap > 2 && gap < 26 && Math.abs(other.x - p.x) < 3.6) {
      line = other.x + (other.x > 0 ? -3.6 : 3.6);
    }
  }

  let mask = p.speed < limit ? BTN.UP : 0;
  if (p.speed > limit * 1.02 + 0.5) mask |= BTN.DOWN;
  // Steering against where the car is going as well as where it is, or it
  // arrives at the line already travelling across it and sails past.
  const off = (line - p.x) - p.vx * 0.34;
  if (off > 0.25) mask |= BTN.RIGHT;
  if (off < -0.25) mask |= BTN.LEFT;
  return mask;
}

/**
 * Whoever is close enough behind to be a threat, if anybody is.
 *
 * Only cars that are actually catching up: somebody sitting two lengths back at
 * the same speed is not attacking, and a car that weaved about because of them
 * would be slower for no reason and would look like it was panicking.
 */
function behind(state, car) {
  let close = null;
  let closest = AI_MIRROR;
  for (const other of state.cars) {
    if (other === car || other.done) continue;
    const gap = car.s - other.s;
    if (gap <= 0 || gap > closest) continue;
    if (other.speed < car.speed - 1) continue;
    closest = gap;
    close = other;
  }
  return close;
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
    // Pole is the quickest and the back of the grid the slowest, by about one
    // per cent end to end. That is deliberately almost nothing: a field spread
    // by four per cent is a field in which the front row is half a minute up the
    // road by the flag and you are racing two cars rather than seven.
    const pace = 1 - car.slot * AI_SPREAD;
    car.power = DRIVE * AI_TOP * state.cfg.ai * pace;
    car.gripScale = AI_GRIP * state.cfg.ai * pace * randRange(state, 0.997, 1.01);
    car.think = Math.floor(nextRandom(state) * 12);
  }
  order(state);
  return state;
}
