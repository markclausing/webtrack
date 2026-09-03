/**
 * The simulation. Sixty ticks a second, and the only thing in the game allowed
 * to change the state.
 *
 * Two ideas hold it together.
 *
 * The first is that the player is a rider and nothing else. There is no code
 * anywhere that says "if this is the player": the same function rides the bike,
 * the same function swings the arm, and the same function decides that somebody
 * has taken enough and is going down the road on their back. What the player has
 * that the others do not is a five-bit input mask instead of a mind. That is why
 * a rival can knock a policeman off, why a policeman will happily flatten a
 * gang member who gets between you, and why none of that needed writing.
 *
 * The second is that everything is measured along the road, not across the
 * world. A rider is a distance and an offset; so is a car, a dropped club and a
 * checkpoint. Two things are near each other when their distances are close,
 * which is one subtraction, and the road being a mile of bends up a mountain
 * costs the collision test nothing at all.
 */

import {
  ACCEL, BONUS_COP, BONUS_GANG, BONUS_RIVAL, BRAKE, BTN, CHECKPOINT_EVERY, CHECKPOINT_TIME,
  COP_SPEED, CRASH_DMG, DMG_CLUB, DMG_FIST, DMG_KICK, DOWN_TIME, DRAG, DROP_LIFE, DT,
  GANG_SPEED, GRAVITY, HEAT_CHOPPER, HEAT_COOL, HEAT_PATROL, HEAT_PER_COP, HEAT_PER_DOWN,
  HEAT_PER_HIT, KICK_COOL,
  KICK_TIME, OFFROAD_DRAG, OFFROAD_TOP, PLAYER_DOWN_TIME, REACH_LONG, REACH_SIDE, REMOUNT_SPEED,
  RIVAL_SPEED,
  ROAD_HALF, ROLL_DRAG, SEG, SHOVE_CLUB, SHOVE_FIST, SHOVE_KICK, SLOPE_PULL, STEER_FLOOR,
  STEER_RATE, STEER_SPEED, SWING_COOL, SWING_TIME, TOP_SPEED, TRAFFIC_MAX,
  TRAFFIC_MIN, WOBBLE_MAX, WOBBLE_RECOVER,
} from '../constants.js';
import { nextRandom, randRange } from '../util.js';
import { makeRider, nodeAt, player, surfaceOf } from './state.js';

/** How much of a bend you have to steer against. Small, on purpose: this is a
 * road bike on a road, and a corner should cost you a little of your line
 * rather than everything you have. */
const CENTRIFUGAL = 0.062;
/** How far past the verge you can be before the scenery has you. */
const OFF_LIMIT = 21;
/** Rider bodies, for the shoving: half a bike wide and a bike and a half long. */
const BODY_X = 1.15;
const BODY_S = 2.6;
/** Ticks before the same rider can be charged for hitting something again. */
const BUMP_COOL = 34;
/** Ticks of grace a rider gets after a punch has landed on them. */
const GUARD = 26;

// --- The tick ----------------------------------------------------------------

export function step(state, mask = 0) {
  state.events.length = 0;
  if (state.over || state.finished) return state;

  const p = player(state);
  state.tick++;
  state.elapsed++;
  state.clock -= DT;
  state.shake *= 0.88;
  state.flash *= 0.86;
  if (state.checkNote > 0) state.checkNote--;

  if (state.clock <= 0) {
    state.clock = 0;
    return end(state, 'time');
  }

  control(state, p, mask);
  for (let i = 1; i < state.riders.length; i++) think(state, state.riders[i]);
  for (const r of state.riders) ride(state, r);

  moveCars(state);
  swings(state);
  contacts(state);
  pickups(state);
  law(state);
  populate(state);
  checkpoints(state);

  state.riders = state.riders.filter((r) => !r.gone || r === p);
  state.cars = state.cars.filter((c) => !c.gone);
  state.drops = state.drops.filter((d) => d.life > 0);

  if (p.s >= state.route.metres - 12) return end(state, 'finish');
  state.prevMask = mask;
  return state;
}

function end(state, reason) {
  state.reason = reason;
  if (reason === 'finish') state.finished = true;
  else state.over = true;
  state.events.push({ t: reason });
  return state;
}

// --- Riding ------------------------------------------------------------------

/** Turns the input mask into the same orders the ai gives its riders. */
function control(state, p, mask) {
  const prev = state.prevMask || 0;
  const pressed = mask & ~prev;

  if (p.down) {
    p.ctl = { throttle: false, brake: false, steer: 0 };
    return;
  }

  const steer = ((mask & BTN.RIGHT) ? 1 : 0) - ((mask & BTN.LEFT) ? 1 : 0);
  p.ctl = {
    throttle: !!(mask & BTN.UP),
    brake: !!(mask & BTN.DOWN),
    steer,
  };

  if (pressed & (BTN.FIRE | BTN.SWITCH)) {
    // Which way you swing: the way you are leaning if you are leaning, and
    // otherwise at whoever is nearest. Making the player say it every time would
    // be one decision too many at a hundred and eighty.
    const side = steer || sideOfNearest(state, p) || p.swingSide || 1;
    strike(state, p, side, !!(pressed & BTN.SWITCH));
  }
}

/** Which side the nearest rider worth hitting is on, or 0 if nobody is. */
function sideOfNearest(state, r) {
  let best = 0;
  let bestD = REACH_LONG + 4;
  for (const o of state.riders) {
    if (o === r || o.down || o.gone) continue;
    const ds = Math.abs(o.s - r.s);
    if (ds > bestD) continue;
    if (Math.abs(o.x - r.x) > REACH_SIDE + 2) continue;
    bestD = ds;
    best = o.x > r.x ? 1 : -1;
  }
  if (best) return best;
  for (const c of state.cars) {
    if (!c.gang || c.gone) continue;
    if (Math.abs(c.s - r.s) > REACH_LONG) continue;
    if (Math.abs(c.x - r.x) > REACH_SIDE + 1.5) continue;
    return c.x > r.x ? 1 : -1;
  }
  return 0;
}

/**
 * One bike, one tick.
 *
 * The gradient is in here rather than in a special case for the mountain,
 * because there is nothing special about it: the road has a slope everywhere,
 * the coast's is nearly zero, and a rider climbing out of a hairpin at a one in
 * eight should feel the same arithmetic a rider on the sea front feels none of.
 */
function ride(state, r) {
  if (r.gone) return;

  if (r.down) {
    r.speed *= 0.93;
    r.s += r.speed * DT;
    r.spin += 0.22;
    r.downT--;
    if (r.downT <= 0) remount(state, r);
    return;
  }

  const ctl = r.ctl || { throttle: true, brake: false, steer: 0 };
  const { i } = nodeAt(state.route, r.s);
  const node = state.route.nodes[i];
  const surf = surfaceOf(r.x);
  const rough = surf === 'road' ? 0 : surf === 'verge' ? 0.45 : 1;
  const top = (r.top || TOP_SPEED) * (surf === 'rough' ? OFFROAD_TOP : 1)
    * (r.hurt > 0 ? 0.94 : 1);

  let acc = 0;
  if (ctl.throttle) acc += ACCEL * Math.max(0, 1 - r.speed / Math.max(6, top));
  if (ctl.brake) acc -= BRAKE;
  acc -= DRAG * r.speed * r.speed;
  acc -= ROLL_DRAG * (0.02 + rough * OFFROAD_DRAG);
  acc -= GRAVITY * SLOPE_PULL * node.slope;
  r.speed = Math.max(0, r.speed + acc * DT);

  // Steering. A bike at a standstill does not turn, and one on gravel turns
  // less than it is asked to, which is most of what going off the road costs.
  const grip = Math.min(1, r.speed / STEER_FLOOR) * (surf === 'rough' ? 0.55 : 1);
  const want = ctl.steer * STEER_SPEED * grip;
  r.vx += (want - r.vx) * STEER_RATE * DT;
  // And the corner, pushing you to the outside of it.
  r.vx -= (node.curve / SEG) * r.speed * r.speed * CENTRIFUGAL * DT;
  r.x += r.vx * DT;

  // Into the trees. Charged once on the way in rather than every tick you spend
  // scraping along it, or a rider pinned against the scenery would die standing
  // still - which is not a crash, it is a bookkeeping error.
  if (Math.abs(r.x) > OFF_LIMIT) {
    r.x = Math.sign(r.x) * OFF_LIMIT;
    r.vx *= -0.2;
    r.speed *= 0.86;
    if (!r.scraping) hurt(state, r, CRASH_DMG * 0.7, -Math.sign(r.x) * 2, 'scenery');
    r.scraping = 12;
  } else if (r.scraping > 0) r.scraping--;

  r.s += r.speed * DT;

  const leanTo = -(ctl.steer * 0.34) - node.curve * 2.2 - r.vx * 0.012;
  r.lean += (leanTo - r.lean) * 0.14;
  if (r.hurt > 0) {
    r.hurt--;
    r.lean += Math.sin(state.tick * 0.9) * 0.05;
  }

  if (r.cool > 0) r.cool--;
  if (r.swingT > 0) {
    const total = r.kicking ? KICK_TIME : SWING_TIME;
    r.swingT--;
    const phase = 1 - r.swingT / total;
    r.swing = Math.sin(phase * Math.PI);
    if (r.hitAt && r.swingT <= total / 2) {
      r.hitAt = false;
      land(state, r);
    }
  } else {
    r.swing *= 0.7;
  }

  r.wobble = Math.max(0, r.wobble - WOBBLE_RECOVER * DT);
  if (r.wobble >= WOBBLE_MAX) knockDown(state, r, 'wobble');
}

/** Back on the bike, slower and shorter of temper. */
function remount(state, r) {
  if (r.kind !== 'player') {
    // Nobody who went down comes back: they are behind now, and a road game
    // that keeps re-inserting the man you just beat has no arc to it.
    r.gone = true;
    return;
  }
  r.down = false;
  r.health = 55;
  r.wobble = 0;
  r.speed = REMOUNT_SPEED;
  r.vx = 0;
  r.spin = 0;
  r.guardT = 75;
  r.bumpT = 40;
  r.x = Math.max(-ROAD_HALF + 2, Math.min(ROAD_HALF - 2, r.x));
  state.events.push({ t: 'remount' });
}

// --- Fighting ----------------------------------------------------------------

/** Starts a swing, if the arm is back and there is nothing else going on. */
function strike(state, r, side, kick) {
  if (r.cool > 0 || r.swingT > 0 || r.down) return;
  r.kicking = kick;
  r.swingSide = side;
  r.swingT = kick ? KICK_TIME : SWING_TIME;
  r.cool = kick ? KICK_COOL : SWING_COOL;
  r.hitAt = true;
  state.events.push({ t: 'swing', kick, player: r.kind === 'player' });
}

/** Nothing to do but count down what the arms are already doing. */
function swings(state) {
  for (const r of state.riders) {
    if (!r.down && !r.gone && r.kind !== 'player' && r.wantSwing) {
      strike(state, r, r.wantSwing.side, r.wantSwing.kick);
      r.wantSwing = null;
    }
  }
}

/**
 * The moment a swing arrives.
 *
 * One target, the nearest on the side the arm went out, so a swing into a knot
 * of three riders is worth exactly what a swing at one is. Cars count: a gang
 * car alongside you is a thing with a man leaning out of it, and the answer to
 * that is the same as the answer to everything else here.
 */
function land(state, r) {
  const dmg = (r.weapon ? DMG_CLUB : r.kicking ? DMG_KICK : DMG_FIST)
    * (r.kind === 'player' ? 1 : state.cfg.damage);
  const shove = r.weapon ? SHOVE_CLUB : r.kicking ? SHOVE_KICK : SHOVE_FIST;

  let hit = null;
  let hitD = REACH_LONG;
  for (const o of state.riders) {
    if (o === r || o.down || o.gone) continue;
    const dx = (o.x - r.x) * r.swingSide;
    if (dx < -0.4 || dx > REACH_SIDE) continue;
    const ds = Math.abs(o.s - r.s);
    if (ds > hitD) continue;
    hitD = ds;
    hit = o;
  }
  if (hit) {
    hurt(state, hit, dmg, r.swingSide * shove, r === player(state) ? 'player' : 'foe');
    if (r === player(state)) state.heat = Math.min(1, state.heat + HEAT_PER_HIT
      * (hit.kind === 'cop' ? 3 : 1));
    return;
  }

  for (const c of state.cars) {
    if (c.gone) continue;
    const dx = (c.x - r.x) * r.swingSide;
    if (dx < -0.4 || dx > REACH_SIDE) continue;
    if (Math.abs(c.s - r.s) > REACH_LONG) continue;
    if (!c.gang) {
      // A civilian car is a wall. Hitting one hurts your hand and does nothing
      // else, which is the correct outcome and also stops the flailing.
      state.events.push({ t: 'clang' });
      return;
    }
    c.health -= dmg;
    c.wobbleT = 26;
    if (r.kind === 'player') state.heat = Math.min(1, state.heat + HEAT_PER_HIT);
    state.events.push({ t: 'hit', on: 'car', by: r.kind === 'player' ? 'player' : 'foe', mine: false });
    if (c.health <= 0) spinCar(state, c, r === player(state));
    return;
  }
  state.events.push({ t: 'whiff' });
}

/**
 * Damage, a shove and a stagger, to whoever it was.
 *
 * A landed swing buys the rider who took it a third of a second of nothing,
 * which is not mercy - it is what makes a fight legible. Two riders either side
 * of you can otherwise land six punches in a second between them, and at that
 * rate nothing you do with the bars or the arm changes the outcome.
 */
function hurt(state, r, amount, push, from) {
  if (r.down || r.gone) return;
  if (r.guardT > 0 && from !== 'car' && from !== 'scenery') return;
  r.guardT = GUARD;
  // Remembered, because most riders do not go down from the damage - they go
  // down from the wobble a moment later, and by then nobody would know whose
  // punch it was. A knockdown with no name on it pays nobody.
  r.lastHit = from;
  r.health -= amount;
  r.wobble += amount * 1.5;
  r.vx += push;
  r.hurt = 14;
  if (r === player(state)) {
    state.shake = Math.min(1, state.shake + amount / 60);
    state.flash = Math.min(1, state.flash + amount / 90);
  }
  // `by` is who did it and `mine` is whether it happened to you. Two fields
  // rather than one, because a punch you landed and a punch you took are the
  // same event with opposite meanings, and one boolean called `player` was
  // quietly answering a different question in each place that read it.
  state.events.push({ t: 'hit', on: r.kind, by: from, mine: r === player(state) });
  if (r.health <= 0) knockDown(state, r, from);
}

/**
 * Off the bike.
 *
 * For anybody else this is the end of their run and the start of yours: the
 * clock gets a few seconds back, the law gets interested, and if they were
 * carrying anything it is now lying in the road. For the player it is two
 * seconds on the tarmac and another eight winding a big twin back up to two
 * hundred, which is the harshest thing in the game and is meant to be: it is the
 * reason you think twice about the third swing.
 */
function knockDown(state, r, from) {
  if (r.down) return;
  r.down = true;
  r.downT = r.kind === 'player' ? PLAYER_DOWN_TIME : DOWN_TIME;
  r.health = 0;
  r.wobble = 0;
  r.swing = 0;
  r.swingT = 0;
  if (r.weapon) {
    state.drops.push({ s: r.s, x: r.x, kind: r.weapon, life: DROP_LIFE });
    r.weapon = null;
  }
  state.events.push({ t: 'down', on: r.kind, by: from, mine: r === player(state) });

  if (r === player(state)) {
    state.shake = 1;
    // Going down with the law on top of you is not a crash, it is an arrest.
    const near = state.riders.some((o) => o.kind === 'cop' && !o.down && !o.gone
      && Math.abs(o.s - r.s) < 26);
    if (near) end(state, 'busted');
    return;
  }

  // Who gets the credit. A rider who wobbles off a hundred metres later still
  // went down because of the last person who hit them.
  const by = from === 'wobble' || from === 'pile' ? r.lastHit : from;
  if (by !== 'player') return;

  const worth = r.kind === 'cop' ? BONUS_COP : r.kind === 'gang' ? BONUS_GANG : BONUS_RIVAL;
  state.bonus += worth;
  state.knocks[r.kind] = (state.knocks[r.kind] || 0) + 1;
  // Somebody sliding down the road on their back is the thing that gets
  // reported - and putting one of theirs down is reported rather louder.
  state.heat = Math.min(1, state.heat + (r.kind === 'cop' ? HEAT_PER_COP : HEAT_PER_DOWN));
  state.events.push({ t: 'bonus', worth, kind: r.kind });
}

/** A gang car that has taken enough: it goes sideways and off. */
function spinCar(state, c, byPlayer) {
  c.spinning = 90;
  c.gang = false;
  c.health = 0;
  if (byPlayer) {
    state.bonus += BONUS_GANG;
    state.knocks.gang++;
    state.heat = Math.min(1, state.heat + HEAT_PER_DOWN);
    state.events.push({ t: 'bonus', worth: BONUS_GANG, kind: 'gang' });
  }
  state.events.push({ t: 'down', on: 'car', by: byPlayer ? 'player' : 'foe', mine: false });
}

// --- Everything touching everything else --------------------------------------

function contacts(state) {
  const rs = state.riders;
  for (const r of rs) {
    if (r.bumpT > 0) r.bumpT--;
    if (r.guardT > 0) r.guardT--;
  }
  for (let i = 0; i < rs.length; i++) {
    const a = rs[i];
    if (a.gone) continue;

    for (let j = i + 1; j < rs.length; j++) {
      const b = rs[j];
      if (b.gone) continue;
      if (Math.abs(a.s - b.s) > BODY_S || Math.abs(a.x - b.x) > BODY_X) continue;
      // Two bikes cannot be in the same place. They lean off each other and both
      // lose a little, which is what riding through a pack feels like.
      const push = (a.x < b.x ? -1 : 1) * 2.4;
      if (!a.down) { a.vx += push; a.speed *= 0.995; }
      if (!b.down) { b.vx -= push; b.speed *= 0.995; }
      if (a.down !== b.down) {
        const up = a.down ? b : a;
        if (!up.bumpT) {
          hurt(state, up, 9, 0, 'pile');
          up.bumpT = BUMP_COOL;
        }
      }
    }

    for (const c of state.cars) {
      if (c.gone || a.down) continue;
      if (Math.abs(a.s - c.s) > c.long + 1.3) continue;
      if (Math.abs(a.x - c.x) > c.wide + 0.6) continue;
      // Charged once and then not again for half a second. Riding into the back
      // of a lorry leaves you overlapping it for a second and a half, and a
      // collision that bills you sixty times over is not a collision, it is a
      // firing squad.
      if (a.bumpT) continue;
      a.bumpT = BUMP_COOL;
      // Head on with something coming the other way is the worst thing that can
      // happen to you on this road, and it is scaled by the closing speed so
      // that clipping a slow van is not the same event.
      const closing = c.dir < 0 ? a.speed + c.speed : Math.abs(a.speed - c.speed);
      const damage = CRASH_DMG * Math.min(2.2, 0.35 + closing / 44);
      a.speed *= c.dir < 0 ? 0.15 : 0.45;
      hurt(state, a, damage, (a.x < c.x ? -1 : 1) * 4, 'car');
    }
  }
}

/** A club in the road belongs to whoever rides over it first. */
function pickups(state) {
  for (const d of state.drops) {
    d.life--;
    if (d.life <= 0) continue;
    for (const r of state.riders) {
      if (r.down || r.gone || r.weapon) continue;
      if (Math.abs(r.s - d.s) > 2.6 || Math.abs(r.x - d.x) > 1.6) continue;
      r.weapon = d.kind;
      d.life = 0;
      state.events.push({ t: 'pickup', mine: r === player(state) });
      break;
    }
  }
}

// --- Traffic ------------------------------------------------------------------

function moveCars(state) {
  const p = player(state);
  for (const c of state.cars) {
    if (c.spinning > 0) {
      c.spinning--;
      c.roll += 0.06;
      // Sliding away and slowing as it goes, so it ends up on the verge rather
      // than a hundred metres out in a field.
      c.x += c.spinX * (c.spinning / 90);
      c.speed *= 0.97;
      if (c.spinning <= 0) c.gone = true;
    } else if (c.gang) {
      // Gang cars hunt: they come alongside and hold there while whoever is
      // hanging out of the window does the work.
      const want = p.x + (c.side || 1) * 2.6;
      c.x += Math.max(-0.09, Math.min(0.09, (want - c.x) * 0.045));
      const ahead = c.s - p.s;
      c.speed += ((p.speed + (ahead < -3 ? 9 : ahead > 3 ? -6 : 0)) - c.speed) * 0.035;
      c.swingT = Math.max(0, c.swingT - 1);
      if (Math.abs(ahead) < 4 && Math.abs(c.x - p.x) < REACH_SIDE && c.swingT === 0
          && !p.down) {
        c.swingT = 70;
        hurtFromCar(state, c, p);
      }
    }
    c.s += c.speed * c.dir * DT;
    if (c.wobbleT > 0) c.wobbleT--;
    // Anything a long way behind or absurdly far ahead is not scenery any more.
    const gap = c.s - p.s;
    if (gap < -140 || gap > 700) c.gone = true;
  }
}

/** The arm out of the window. Same numbers as a rider's, from a moving box. */
function hurtFromCar(state, c, p) {
  const side = c.x > p.x ? -1 : 1;
  state.events.push({ t: 'swing', kick: false, mine: false });
  hurt(state, p, DMG_CLUB * 0.8 * state.cfg.damage, side * SHOVE_CLUB, 'foe');
}

// --- Minds --------------------------------------------------------------------

/**
 * What everybody who is not you is doing.
 *
 * Deliberately shallow. A rival wants to be in front, a gang member wants to be
 * next to you, and a policeman wants to be next to you and does not care what it
 * costs him. Everything interesting that happens on this road comes out of three
 * of those in the same place at the same time, not out of any one of them being
 * clever.
 */
function think(state, r) {
  if (r.down || r.gone) return;
  const p = player(state);
  const ahead = r.s - p.s;

  // Nobody hangs off your elbow for ever. A rider who has been alongside for
  // eight seconds drops back and has a think about it, which is the difference
  // between a fight and a grinding wheel: it gives the road back to you, and it
  // is why a pack arrives in waves rather than as a wall.
  const glued = Math.abs(ahead) < 9 && Math.abs(p.x - r.x) < 7;
  if (r.rest > 0) r.rest--;
  else if (glued) {
    r.press = (r.press || 0) + 1;
    if (r.press > (r.kind === 'cop' ? 620 : 460)) {
      r.press = 0;
      r.rest = r.kind === 'cop' ? 160 : 260;
    }
  } else r.press = Math.max(0, (r.press || 0) - 2);

  if (r.think > 0) r.think--;
  else {
    r.think = 14 + Math.floor(nextRandom(state) * 20);
    // The swing is decided here, with everything else, rather than every tick.
    // Rolling for it sixty times a second put four of these alongside you
    // landing a punch each between them almost every second, which is not a
    // fight - it is being kicked down a staircase.
    const toSide = p.x > r.x ? 1 : -1;
    const alongside = Math.abs(ahead) < REACH_LONG - 1.5
      && Math.abs(p.x - r.x) < REACH_SIDE - 0.6;
    if (alongside && !p.down && !r.rest && r.cool === 0 && r.swingT === 0) {
      const eager = r.kind === 'cop' ? 0.5 : r.kind === 'gang' ? 0.42 : 0.18;
      if (nextRandom(state) < eager * state.cfg.foes) {
        r.wantSwing = { side: toSide, kick: nextRandom(state) < 0.25 };
      }
    }
    if (r.kind === 'rival') {
      // Racing. It picks a line and holds it, and only bothers with you if you
      // are in the way of it.
      r.want = randRange(state, -ROAD_HALF + 2.5, ROAD_HALF - 2.5);
      if (Math.abs(ahead) < 14 && nextRandom(state) < 0.35) r.want = p.x + (p.x > 0 ? -2.4 : 2.4);
    } else if (r.rest) {
      r.want = p.x + (r.x > p.x ? 6.5 : -6.5);
    } else {
      r.want = p.x + (nextRandom(state) < 0.5 ? -2.6 : 2.6);
      if (r.kind === 'cop') r.want = p.x + (r.x > p.x ? 2.4 : -2.4);
    }
    // Something in the road matters more than any of that.
    const dodge = lookAhead(state, r);
    if (dodge !== null) r.want = dodge;
  }

  const gap = r.want - r.x;
  const steer = Math.max(-1, Math.min(1, gap * 0.5));

  // Speed: match the player and then some, so nobody is ever simply dropped.
  const chase = r.rest ? -14 : r.kind === 'rival' ? 0 : 6;
  const target = Math.min(r.top, p.speed + chase + (ahead < -12 ? 10 : 0));
  r.ctl = {
    throttle: r.speed < target,
    brake: r.speed > target + 8 || (r.kind !== 'rival' && ahead > 16),
    steer,
  };

}

/**
 * The nearest thing in this rider's lane, and where to be instead.
 *
 * Closing speed rather than distance decides what is worth avoiding: a lorry
 * forty metres ahead going almost as fast as you is not a problem, and one
 * coming the other way at the same distance is about a second away.
 */
function lookAhead(state, r) {
  let worst = null;
  let worstT = 3.2;   // seconds to contact worth reacting to
  for (const c of state.cars) {
    if (c.gone) continue;
    const gap = c.s - r.s;
    if (gap < 2) continue;
    const closing = c.dir < 0 ? r.speed + c.speed : r.speed - c.speed;
    if (closing <= 1) continue;
    const when = gap / closing;
    if (when > worstT) continue;
    if (Math.abs(c.x - r.x) > 3.4) continue;
    worstT = when;
    worst = c;
  }
  if (!worst) return null;
  const room = worst.x > 0 ? -1 : 1;
  return Math.max(-ROAD_HALF + 2, Math.min(ROAD_HALF - 2, worst.x + room * 4.6));
}

// --- The law ------------------------------------------------------------------

function law(state) {
  const p = player(state);
  state.heat = Math.max(0, state.heat - HEAT_COOL * DT);

  if (state.heat >= HEAT_CHOPPER) {
    if (!state.chopper) state.chopper = { s: p.s + 60, x: 0, y: 26, spin: 0, sway: 0 };
    const c = state.chopper;
    c.sway += 0.013;
    c.s += ((p.s + 46 + Math.sin(c.sway) * 30) - c.s) * 0.03;
    c.x += ((Math.sin(c.sway * 0.7) * 14) - c.x) * 0.02;
    c.y = 24 + Math.sin(c.sway * 1.3) * 4;
    c.spin += 0.55;
  } else if (state.chopper) {
    state.chopper.s += 3;
    state.chopper.y += 0.35;
    state.chopper.spin += 0.55;
    if (state.chopper.y > 90) state.chopper = null;
  }
}

// --- Filling the road ----------------------------------------------------------

/**
 * Keeps the road populated around the player.
 *
 * Everything is spawned relative to where you are rather than laid out in
 * advance, which is the one place this game gives up on being reproducible - and
 * has to, because a rider who spent ninety seconds on the floor would otherwise
 * arrive at an empty road. The route is fixed; who is on it is not.
 */
function populate(state) {
  const p = player(state);
  const cfg = state.cfg;
  const far = state.route.metres;
  const near = p.s;

  // Civilian traffic, both ways, kept at a steady density ahead of you.
  //
  // Five is not many for a four-lane road and it is the right number. Nine put a
  // car every thirty metres, which is not traffic, it is a wall - and a wall
  // makes the fighting impossible, because you cannot go alongside somebody when
  // there is a van in the way every second.
  const wantCars = 5;
  const live = state.cars.filter((c) => !c.gone && !c.gang).length;
  if (live < wantCars && --state.spawn.car <= 0) {
    state.spawn.car = 26;
    // Oncoming is the rarer half deliberately: it closes at a hundred and eighty
    // between you, which is about a second of warning at this draw distance.
    const oncoming = nextRandom(state) < 0.32;
    const at = near + randRange(state, 260, 620);
    if (at < far - 40) {
      state.cars.push(makeCar(state, at, oncoming));
    }
  }

  // Rivals: a pack, topped up so there is always somebody to catch.
  const rivals = state.riders.filter((r) => r.kind === 'rival' && !r.gone).length;
  if (rivals < 4 && --state.spawn.rival <= 0) {
    state.spawn.rival = 150;
    const at = near + randRange(state, 60, 200);
    if (at < far - 60) state.riders.push(spawnRider(state, 'rival', at));
  }

  // Gangs come up behind you, which is the only way an ambush works.
  if (--state.spawn.gang <= 0) {
    state.spawn.gang = Math.round(randRange(state, 900, 1900) / cfg.foes);
    const pair = nextRandom(state) < 0.5;
    state.riders.push(spawnRider(state, 'gang', near - randRange(state, 30, 70)));
    if (pair) state.riders.push(spawnRider(state, 'gang', near - randRange(state, 30, 80)));
    else state.cars.push(makeGangCar(state, near - randRange(state, 40, 90)));
  }

  // And the law, once you have given it a reason.
  const cops = state.riders.filter((r) => r.kind === 'cop' && !r.gone).length;
  if (state.heat > HEAT_PATROL && cops < (state.heat > 0.6 ? 3 : 1) && --state.spawn.cop <= 0) {
    state.spawn.cop = 200;
    state.riders.push(spawnRider(state, 'cop', near - randRange(state, 40, 90)));
    state.events.push({ t: 'siren' });
  }
}

function spawnRider(state, kind, at) {
  const top = kind === 'cop' ? COP_SPEED : kind === 'gang' ? GANG_SPEED : RIVAL_SPEED;
  const p = player(state);
  const r = makeRider(kind, at, randRange(state, -ROAD_HALF + 3, ROAD_HALF - 3), {
    top: top * (0.94 + state.cfg.foes * 0.08),
    speed: Math.max(p.speed * 0.9, 30),
    weapon: kind === 'cop' ? 'baton' : nextRandom(state) < 0.45 ? 'club' : null,
    health: kind === 'cop' ? 110 : kind === 'gang' ? 95 : 80,
  });
  return r;
}

function makeCar(state, at, oncoming) {
  const lorry = nextRandom(state) < 0.22;
  const lane = randRange(state, 2.4, ROAD_HALF - 2);
  return {
    s: at,
    x: oncoming ? -lane : lane,
    dir: oncoming ? -1 : 1,
    speed: randRange(state, TRAFFIC_MIN, TRAFFIC_MAX) * (lorry ? 0.8 : 1),
    paint: Math.floor(nextRandom(state) * 8),
    long: lorry ? 4.2 : 2.3,
    wide: lorry ? 1.25 : 0.95,
    roll: 0,
    health: 999,
    gang: false,
    spinning: 0,
    spinX: 0,
    wobbleT: 0,
    swingT: 0,
    gone: false,
  };
}

function makeGangCar(state, at) {
  const c = makeCar(state, at, false);
  c.gang = true;
  c.paint = 6;
  c.speed = 40;
  c.health = 78 * state.cfg.foes;
  c.side = nextRandom(state) < 0.5 ? -1 : 1;
  c.spinX = (nextRandom(state) < 0.5 ? -1 : 1) * 0.5;
  return c;
}

// --- The clock ----------------------------------------------------------------

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
