/**
 * The circuit, and everything standing beside it.
 *
 * Built once, before the race starts, from a seed - so the mountain circuit is
 * the same mountain circuit every time anybody drives it. That is not a detail:
 * a board of lap times is worthless if the track was different, and a track
 * generated as you drive it cannot be learned, which is the only thing that
 * makes a time come down on the tenth attempt.
 *
 * It closes. That is the whole difference from what was here before, and it is
 * the reason for the shape of this file. You cannot make a road that returns to
 * where it started by walking forwards and turning: the total turning has to
 * come to exactly two pi and the position has to land back on itself, and
 * nudging a heading until it does is a fight you lose. So it is built the other
 * way round - a closed loop first, laid out as control points around a circle,
 * and the headings and curvatures read back off it afterwards. Closure is then
 * not something to be achieved; it is a property of the thing that was drawn.
 *
 * Everything that varies around the lap is made of harmonics of the lap, for the
 * same reason: a sine of the lap position comes back to where it started
 * because that is what a sine does. The hills, the wobble in the hillsides and
 * the change from mountain to sea front are all sums of those, so there is never
 * a seam at the start line - the place the player looks at most.
 *
 * Nothing here is a billboard. A palm tree is three polygons standing in the
 * world, and if you go round a bend you see it from the side, because it is
 * actually there.
 */

import { CHECKPOINT_EVERY, SEG } from '../constants.js';

/**
 * How far out, in metres from the centreline, each ground ring sits.
 *
 * The first one is where the run-off ends and the barrier stands. Everything
 * between the kerb and it is grass you can put a car on and get away with, which
 * is what makes a mistake a mistake rather than an accident.
 */
export const RINGS = [15.6, 32, 95, 340];

/** Where the water is, for the circuits that have any. Everything else is above it. */
export const SEA = -6;

/** Deterministic and local: track building must not touch the simulation's rng. */
function seeded(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * A wobble that comes back to where it started.
 *
 * A sum of harmonics of the lap: whatever it decides at the start line it
 * decides again a lap later, exactly, because sin(2 pi) is sin(0). Every varying
 * quantity in this file is one of these, which is why there is no seam anywhere
 * and no code that goes looking for one.
 *
 * Normalised to roughly minus one to one so the amplitudes below mean metres.
 */
function loopNoise(rnd, harmonics = 5) {
  const parts = [];
  let scale = 0;
  for (let h = 1; h <= harmonics; h++) {
    const amp = (rnd() * 2 - 1) / h;
    scale += Math.abs(amp);
    parts.push({ h, amp, phase: rnd() * Math.PI * 2 });
  }
  return (t) => {
    let sum = 0;
    for (const p of parts) sum += p.amp * Math.sin(p.h * t * Math.PI * 2 + p.phase);
    return sum / (scale || 1);
  };
}

/**
 * The bones of the circuit: a ring of points at uneven angles and uneven radii.
 *
 * The unevenness is the design. Two points close together in angle with
 * different radii make a corner; a wide angular gap between two at a similar
 * radius makes a straight. Squaring the random gap is what gives a handful of
 * long gaps and a lot of short ones, which is the shape of every real circuit -
 * three or four straights that matter and a dozen corners between them.
 */
function controlPoints(rnd, count, radius) {
  const gaps = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const gap = 0.3 + rnd() ** 2 * 2.6;
    gaps.push(gap);
    total += gap;
  }
  const pts = [];
  let angle = 0;
  for (let i = 0; i < count; i++) {
    const r = radius * (0.56 + rnd() * 0.66);
    // x = r sin, z = r cos with the angle increasing puts the outside of the
    // loop on the left of the car, which is where the sea has to be.
    pts.push({ x: Math.sin(angle) * r, z: Math.cos(angle) * r });
    angle += (gaps[i] / total) * Math.PI * 2;
  }
  return pts;
}

/** Catmull-Rom through four points: the curve that passes through its controls. */
function spline(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const at = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t
    + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: at(p0.x, p1.x, p2.x, p3.x), z: at(p0.z, p1.z, p2.z, p3.z) };
}

/** The control ring, as a dense closed polyline. */
function sampleLoop(pts, per = 48) {
  const n = pts.length;
  const at = (i) => pts[((i % n) + n) % n];
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < per; k++) {
      out.push(spline(at(i - 1), at(i), at(i + 1), at(i + 2), k / per));
    }
  }
  return out;
}

/**
 * The polyline again, with its points exactly one node apart.
 *
 * The spacing is the lap length divided by a whole number of nodes rather than
 * six metres exactly, so the last node is the same distance from the first as
 * every other pair. Six metres and a remainder would put one short segment at
 * the start line, which is a bump you would feel on every lap.
 */
function resample(poly, seg) {
  const n = poly.length;
  const run = [0];
  for (let i = 1; i <= n; i++) {
    const a = poly[i - 1];
    const b = poly[i % n];
    run.push(run[i - 1] + Math.hypot(b.x - a.x, b.z - a.z));
  }
  const total = run[n];
  const count = Math.max(240, Math.round(total / seg));
  const step = total / count;
  const out = [];
  let at = 0;
  for (let i = 0; i < count; i++) {
    const want = i * step;
    while (at < n - 1 && run[at + 1] < want) at++;
    const span = run[at + 1] - run[at] || 1;
    const t = (want - run[at]) / span;
    const a = poly[at];
    const b = poly[(at + 1) % n];
    out.push({ x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t) });
  }
  return out;
}

/**
 * The sharpest corner on the loop, in radians per node.
 *
 * A curve through control points does whatever the control points ask for, and
 * two of them close together at different radii ask for a hairpin tighter than
 * anything a car with a wing has ever been round - thirty-seven km/h, on one
 * circuit, which is not a corner, it is a wall with a gap in it.
 */
function sharpest(ring) {
  const n = ring.length;
  const at = (i) => ring[((i % n) + n) % n];
  let worst = 0;
  let prev = Math.atan2(at(1).x - at(0).x, at(1).z - at(0).z);
  for (let i = 1; i <= n; i++) {
    const now = Math.atan2(at(i + 1).x - at(i).x, at(i + 1).z - at(i).z);
    worst = Math.max(worst, Math.abs(turn(prev, now)));
    prev = now;
  }
  return worst;
}

/**
 * Each point pulled a little towards the average of its neighbours.
 *
 * Closed, so the start line is smoothed exactly like everywhere else. Repeated,
 * it takes the spikes out of the curvature and leaves the shape of the circuit
 * alone - a hairpin becomes a slow corner rather than becoming a straight.
 */
function relax(ring, amount) {
  const n = ring.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = ring[(i - 1 + n) % n];
    const b = ring[i];
    const c = ring[(i + 1) % n];
    out[i] = {
      x: lerp(b.x, (a.x + c.x) / 2, amount),
      z: lerp(b.z, (a.z + c.z) / 2, amount),
    };
  }
  return out;
}

/** Two angles apart, the short way round. Used everywhere a heading is compared. */
export function turn(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * The ground either side, as absolute heights at the four rings.
 *
 * The two sides are not two variations on a theme, they are two different
 * places, and on a closed circuit they have to be. The left of the car is always
 * the outside of the loop - that is a property of the direction the control
 * points are laid out in - and the right of it is always the infield.
 *
 * The outside can do what it likes: it points away from the circuit and nothing
 * it does can ever be in front of anything. It is the hillside on the mountain
 * circuit and the sea on the coastal one.
 *
 * The infield may not. It is the middle of the loop, which means it is also what
 * you are looking across when you look at the far side of the track, and a
 * hundred and twenty metre hill in it is a hundred and twenty metre hill drawn
 * over the track - which is exactly what it was, and exactly what it looked
 * like. So it ramps from the verge to one height that belongs to the whole
 * circuit and stays there: a flat plain a few metres below the average of the
 * track, which cannot cover anything because there is nothing for it to be
 * above.
 *
 * Blending the outside by `warm` rather than switching it is what lets one
 * circuit be both, and is why the grand circuit can climb out of the hills and
 * arrive at the coast without a line across the world where it changes its mind.
 */
function ground(y, curve, warm, wob, infield) {
  const lean = Math.max(-1, Math.min(1, curve * 22));
  // The outside: hillside, or water.
  const mL = [y + 0.6 + wob(0.7) * 1.4, y + 6 * (1 + lean) + wob(0.3) * 8,
    y + 30 * (1 + lean) + wob(0.11) * 34];
  const mFarL = y + 58 + wob(0.05) * 74;
  const cL = [SEA, SEA, SEA];

  // The infield: down off the verge and then flat, wherever the track happens to
  // be at the time.
  const r = [
    y + 0.5 + wob(0.9) * 1.1,
    lerp(y, infield, 0.55) + wob(0.37) * 2.4,
    infield + wob(0.13) * 3,
  ];

  const mix3 = (a, b) => [lerp(a[0], b[0], warm), lerp(a[1], b[1], warm), lerp(a[2], b[2], warm)];
  return {
    l: mix3(mL, cL),
    r,
    far: [lerp(mFarL, SEA, warm), infield + wob(0.09) * 3],
    // How much of this node is sea front rather than mountain. Used for the
    // colour of the water and for whether there is any.
    wet: warm,
  };
}

/** The three circuits. `warm` is 0 for mountain, 1 for sea front. */
const CIRCUITS = {
  pass: {
    seed: 0x2c19, points: 15, radius: 640, climb: 54, tightest: 0.15,
    warm: () => 0,
  },
  coast: {
    seed: 0x51a7, points: 13, radius: 780, climb: 6, tightest: 0.082,
    warm: () => 1,
  },
  grand: {
    seed: 0x77b3, points: 19, radius: 980, climb: 46, tightest: 0.125,
    // Half the lap in the hills and half of it beside the water, with the start
    // line in the mountains. Cosine rather than a step, because the terrain has
    // to arrive at the sea rather than fall into it.
    warm: (t) => 0.5 - 0.5 * Math.cos(t * Math.PI * 2),
  },
};

export function buildRoute(key) {
  const plan = CIRCUITS[key] || CIRCUITS.pass;
  const rnd = seeded(plan.seed);
  const climb = loopNoise(seeded(plan.seed ^ 0x9e37), 4);
  const roll = loopNoise(seeded(plan.seed ^ 0x1d3f), 7);
  const wobble = loopNoise(seeded(plan.seed ^ 0x51ed), 6);

  // Drawn, then relaxed until nothing on it is sharper than this circuit is
  // allowed to be. Forty passes is plenty and the loop stops as soon as it can;
  // the alternative - rejecting seeds until one behaves - throws away a good
  // circuit because of one corner on it.
  let ring = resample(sampleLoop(controlPoints(rnd, plan.points, plan.radius)), SEG);
  for (let pass = 0; pass < 40 && sharpest(ring) > plan.tightest; pass++) {
    ring = resample(relax(ring, 0.5), SEG);
  }
  const count = ring.length;
  const at = (i) => ring[((i % count) + count) % count];

  // Heading first, kept continuous around the lap so that interpolating between
  // two nodes never has to think about where the angle wrapped.
  const heading = new Float64Array(count);
  let a = Math.atan2(at(1).x - at(0).x, at(1).z - at(0).z);
  heading[0] = a;
  for (let i = 1; i < count; i++) {
    const want = Math.atan2(at(i + 1).x - at(i).x, at(i + 1).z - at(i).z);
    a += turn(a, want);
    heading[i] = a;
  }

  // Then the hills, and a check that none of them is a wall. A sum of harmonics
  // can produce a one in three if the phases line up, and a one in three is not
  // a gradient, it is a ramp.
  const height = new Float64Array(count);
  let steepest = 0;
  for (let pass = 0; pass < 6; pass++) {
    const scale = plan.climb / (1 + pass * 0.55);
    steepest = 0;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const warm = plan.warm(t);
      height[i] = 5 + (climb(t) + 1) * 0.5 * scale * (1 - warm) + roll(t) * 2.4;
    }
    for (let i = 0; i < count; i++) {
      const rise = Math.abs(height[(i + 1) % count] - height[i]) / SEG;
      steepest = Math.max(steepest, rise);
    }
    if (steepest <= 0.13) break;
  }

  // One height for the whole infield: a little below the average of the track,
  // so it is a plain the circuit sits on rather than a wall across the middle.
  let mean = 0;
  for (let i = 0; i < count; i++) mean += height[i];
  const infield = mean / count - 9;

  const nodes = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const warm = plan.warm(t);
    const curve = turn(heading[i], heading[(i + 1) % count]);
    const y = height[i];
    const wob = (freq) => wobble((t * count * freq) % 1);
    nodes.push({
      i,
      x: at(i).x,
      y,
      z: at(i).z,
      a: heading[i],
      dx: Math.sin(heading[i]),
      dz: Math.cos(heading[i]),
      nx: Math.cos(heading[i]),      // the right-hand vector, in the ground plane
      nz: -Math.sin(heading[i]),
      curve,
      slope: (height[(i + 1) % count] - y) / SEG,
      // Banking, into the corner. Small: this is a circuit, not a bowl.
      bank: -curve * 3.2,
      warm,
      g: ground(y, curve, warm, wob, infield),
    });
  }

  return {
    key,
    nodes,
    props: scatter(nodes, seeded(plan.seed ^ 0x3a71)),
    length: count,
    metres: count * SEG,
    steepest,
    infield,
    // Which nodes stop the clock. The line, and one on the far side of the lap,
    // so a long circuit is not one enormous held breath.
    checkpoints: checkpointsFor(count),
  };
}

/** The nodes that give time back, always including the start line itself. */
function checkpointsFor(count) {
  const every = Math.max(CHECKPOINT_EVERY, Math.ceil(count / 3));
  const out = [0];
  for (let at = every; at < count - every * 0.4; at += every) out.push(at);
  return out;
}

/**
 * Everything standing beside the track.
 *
 * Placed on the node it belongs to and drawn when that node is drawn, which
 * means the scenery is culled by the same distance test as the track and costs
 * nothing to sort. Density is deliberately uneven: a run of bare verge makes the
 * next stand of pines look like something.
 */
function scatter(nodes, rnd) {
  const out = nodes.map(() => null);
  const count = nodes.length;
  const add = (i, prop) => {
    const at = ((i % count) + count) % count;
    (out[at] ||= []).push(prop);
  };

  for (let i = 0; i < count; i++) {
    const n = nodes[i];
    const warm = n.warm;

    // Marker posts, both sides, every twenty-four metres, everywhere.
    //
    // The single cheapest thing in the game for how fast it feels. At three
    // hundred and fifty they arrive eight times a second at the edges of the
    // screen, and the eye reads a regular thing going past far more readily than
    // it reads a number in the corner. Take them out and the car feels like it
    // has lost fifty km/h.
    if (i % 4 === 0) {
      add(i, { kind: 'post', side: -1, off: 16.4, s: 1, r: 0, align: true });
      add(i, { kind: 'post', side: 1, off: 16.4, s: 1, r: 0, align: true });
    }

    if (warm < 0.55) {
      // Trees on the low side, rock on the high side: that is what a cut through
      // a hill looks like, and it also tells you which way the track is about to
      // go before you can see the corner.
      const low = n.g.l[1] < n.g.r[1] ? -1 : 1;
      const many = 1 - warm;
      if (rnd() < 0.5 * many) {
        add(i, { kind: 'pine', side: low, off: 19 + rnd() * 26, s: 0.8 + rnd() * 0.9, r: rnd() * 6.28 });
      }
      if (rnd() < 0.34 * many) {
        add(i, { kind: 'pine', side: low, off: 34 + rnd() * 55, s: 0.9 + rnd() * 1.2, r: rnd() * 6.28 });
      }
      if (rnd() < 0.2 * many) {
        add(i, { kind: 'rock', side: -low, off: 18 + rnd() * 9, s: 0.7 + rnd() * 1.4, r: rnd() * 6.28 });
      }
      if (rnd() < 0.06 * many) {
        add(i, { kind: 'crag', side: -low, off: 30 + rnd() * 40, s: 2 + rnd() * 4, r: rnd() * 6.28 });
      }
    }
    if (warm > 0.45) {
      const many = warm;
      if (i % 7 === 0 && rnd() < many) {
        add(i, { kind: 'palm', side: -1, off: 17.5 + rnd() * 2, s: 0.9 + rnd() * 0.5, r: rnd() * 6.28 });
      }
      if (rnd() < 0.3 * many) {
        add(i, { kind: 'palm', side: 1, off: 18 + rnd() * 6, s: 0.9 + rnd() * 0.6, r: rnd() * 6.28 });
      }
      if (rnd() < 0.13 * many) {
        add(i, { kind: 'block', side: 1, off: 38 + rnd() * 30, s: 1 + rnd() * 2.6, r: rnd() * 0.6 - 0.3 });
      }
      // Out on the water. Far enough that they read as scenery, near enough that
      // you can tell a hull from a buoy.
      if (rnd() < 0.05 * many) {
        add(i, { kind: 'boat', side: -1, off: 120 + rnd() * 260, s: 1.4 + rnd() * 2.6, r: rnd() * 6.28 });
      }
      if (rnd() < 0.05 * many) {
        add(i, { kind: 'buoy', side: -1, off: 45 + rnd() * 70, s: 1, r: 0 });
      }
    }
  }

  // The grandstands go where the grid is, which on a circuit is where the start
  // line is - and node zero is a place you come back to every lap rather than
  // somewhere you leave once.
  for (let i = -22; i < 14; i += 4) {
    add(i, { kind: 'stand', side: -1, off: 24, s: 1, r: 0, align: true });
    add(i, { kind: 'stand', side: 1, off: 24, s: 1, r: Math.PI, align: true });
  }

  // The gantry is the checkpoint. It is placed on the node the clock is actually
  // reading, not near it, because a gate you go under half a second before the
  // seconds arrive is a gate that is lying to you.
  for (const at of checkpointsFor(count)) {
    add(at, { kind: 'arch', side: 0, off: 0, s: 1, r: 0, align: true });
  }
  return out;
}
