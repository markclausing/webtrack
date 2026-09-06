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

import { CHECKPOINT_EVERY, ROAD_HALF, SEG, WALL_AT } from '../constants.js';
import {
  centreLine, measured, NARROWEST, profile, SURVEYED, things, tunnels, WIDEN,
} from './circuits.js';

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

/**
 * The height the start line of a surveyed circuit sits at.
 *
 * Arbitrary, and it has to be something: the survey is two coordinates and a
 * width, so there is no datum in the data to inherit. Forty metres is enough
 * that Eau Rouge - twenty-nine below the line - is still above zero, and the
 * heights written in circuits.js are all relative to this, including the sea.
 */
const REAL_BASE = 40;

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
    const point = { x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t) };
    // The surveyed circuits carry a width that varies round the lap, and it has
    // to survive being resampled or the road narrows in the wrong places.
    if (a.half !== undefined) point.half = lerp(a.half, b.half, t);
    out.push(point);
  }
  return out;
}

/**
 * A surveyed line as a dense polyline, splined rather than joined up.
 *
 * The survey is stored every ten metres, and ten metre chords round a twenty-two
 * metre hairpin - which is La Source, and Suzuka's - is a corner made of six
 * flat faces. Running the same Catmull-Rom through it that the drawn circuits
 * use costs nothing at build time and gives back the curve the ten metres were
 * sampled from.
 */
function sampleSurvey(pts, per = 6) {
  const n = pts.length;
  const at = (i) => pts[((i % n) + n) % n];
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const p = spline(at(i - 1), at(i), at(i + 1), at(i + 2), t);
      p.half = lerp(at(i).half, at(i + 1).half, t);
      out.push(p);
    }
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
function ground(y, lean, warm, wob, infield) {
  // The outside: hillside, or water.
  const mL = [y + 0.6 + wob(9) * 1.4, y + 6 * (1 + lean) + wob(5) * 8,
    y + 30 * (1 + lean) + wob(3) * 30];
  const mFarL = y + 58 + wob(2) * 62;
  // The run-off is level with the road out to the barrier and the ground falls
  // away beyond it. It used to go straight from the kerb to sea level, which
  // put the barrier - drawn on the ground - nine metres down the beach with the
  // edge of the track dropping into nothing beside it.
  const cL = [y - 0.4, SEA, SEA];

  // The infield: down off the verge and then flat, wherever the track happens to
  // be at the time.
  const r = [
    y + 0.5 + wob(11) * 1.1,
    lerp(y, infield, 0.55) + wob(6) * 2.4,
    infield + wob(4) * 3,
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

/**
 * The ground beside a circuit that is a real place.
 *
 * Symmetric, low, and it follows the road. That is three decisions and all three
 * are forced by the same fact: a real circuit folds back on itself. The drawn
 * circuits are laid out around a ring, so the left of the car is always the
 * outside of the loop and can be a mountain safely - nothing is ever behind it.
 * Spa is not laid out around anything. It crosses its own path, runs anti-clock
 * for a third of a lap and comes back, and Zandvoort's main straight passes
 * within thirty metres of Hugenholtz. On a shape like that there is no side that
 * is reliably "away", so a thirty metre hillside beside one piece of road is a
 * thirty metre hillside drawn over another piece of road, and the only safe hill
 * is a low one.
 *
 * Which is also the truth of it. These places are not carved out of an alp. Spa
 * has its hundred metres in the road itself rather than in a wall beside it, and
 * that is exactly what makes it what it is.
 */
function groundReal(y, land, wob, near, wet) {
  // Only the first ring follows the road. The two beyond it come back to the
  // smoothed height and stay there, and that is not a stylistic choice.
  //
  // Built the obvious way - every ring at the local road height plus a bank -
  // Zandvoort drew the sky tan. The circuit climbs seventeen metres and folds
  // back on itself, so the ground belonging to Scheivlak, which is up in the
  // dunes, was being drawn ninety-five metres wide across the road at
  // Hugenholtz, which is not. From the cockpit it was a plain covering the
  // world. The bank beside the road is the part you actually look at; anything
  // further out only has to be a surface, and a surface that agrees with itself
  // everywhere cannot loom over anything.
  const bank = (phase) => [
    y + 0.5 + wob(phase + 5) * 0.7,
    lerp(y + land.rise * (0.55 + 0.45 * wob(phase + 2)), near, 0.55),
    near + land.roll * 0.5 * wob(phase),
  ];
  // Two phases rather than one, or both sides of the road do the same thing at
  // the same time and the circuit reads as a trench.
  const l = bank(3);
  const far = [near + land.roll * 0.7 * wob(1.6), near + land.roll * 0.5 * wob(1.1)];
  if (wet > 0) {
    // Zandvoort is on a beach, and the part of it that is on a beach is the part
    // you can see the beach from. Only the outer rings go down to the water: the
    // dune between the barrier and it stays where it was, because that dune is
    // the reason the sea is a glimpse rather than a view.
    //
    // Measured from the start line rather than from zero. Written as an absolute
    // it put the North Sea forty-seven metres below the circuit, which is not a
    // beach, it is a cliff with a view.
    const sea = REAL_BASE + land.sea.level;
    // Both outer rings, not just the far one. Water is flat, and pulling only
    // the ring at ninety-five metres down left the sea running downhill from
    // thirty-two metres out to ninety-five - a sloping North Sea, which the eye
    // reads as a beach the colour of water rather than as water.
    //
    // The crest at fifteen metres comes down only part of the way, so there is
    // still a dune between the road and the beach. You see the sea over it,
    // which is what you do at Zandvoort.
    l[1] = lerp(l[1], sea, wet);
    l[2] = lerp(l[2], sea, wet);
    l[0] = lerp(l[0], y + 1.2, wet * 0.8);
    far[0] = lerp(far[0], sea, wet);
  }
  return { l, r: bank(8), far, wet };
}

/**
 * How much sea there is at this point of the lap, from nought to one.
 *
 * Raised over a cosine and wrapped, so the water arrives and leaves rather than
 * switching on - a hard edge between grass and the North Sea is a wall of water
 * standing in a field, which is exactly what it looked like the first time.
 */
function coastAt(sea, t) {
  if (!sea) return 0;
  let d = Math.abs(((t - sea.at) % 1 + 1.5) % 1 - 0.5);
  if (d > sea.span) return 0;
  d /= sea.span;
  return 0.5 + 0.5 * Math.cos(d * Math.PI);
}

/**
 * A patch of ground held under its lids.
 *
 * Three of them, one per band, and each ring is held under the lid of the
 * furthest band it is a corner of: the ring at thirty-two metres is the outer
 * edge of the near band and the inner edge of the mid band, so it has to satisfy
 * the stricter of the two. The margins are small and they matter - a band drawn
 * at exactly the height of the road it crosses is a coin toss in the depth
 * buffer, and the coin came up ground.
 */
function capped(g, near, mid, far) {
  const lid = [
    Number.isFinite(near) ? near - 0.6 : Infinity,
    Number.isFinite(mid) ? mid - 1.5 : Infinity,
    Number.isFinite(far) ? far - 2 : Infinity,
  ];
  const cut = (v, k) => Math.min(v, lid[k]);
  return {
    l: g.l.map(cut),
    r: g.r.map(cut),
    far: g.far.map((v) => Math.min(v, lid[2])),
    wet: g.wet,
  };
}

/** A name, as a seed. Stable, so a circuit's scenery never moves. */
function nameSeed(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h | 0;
}

/**
 * How many nodes of the circuit are a bridge, and where the towers stand on it.
 *
 * A suspension bridge wants a straight, so the span is put on the straightest
 * run of track there is rather than at a fixed place - which on a procedural
 * circuit is the difference between a crossing and a very odd looking curved
 * one.
 */
export const BRIDGE_NODES = 76;
export const TOWERS = [0.22, 0.78];

/** The straightest run of `want` nodes anywhere on the lap. */
function straightest(nodes, want) {
  const n = nodes.length;
  let best = Infinity;
  let at = 0;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < want; k++) sum += Math.abs(nodes[(i + k) % n].curve);
    if (sum < best) {
      best = sum;
      at = i;
    }
  }
  return at;
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
  const real = SURVEYED[key] || null;
  const plan = real || CIRCUITS[key] || CIRCUITS.pass;
  // The drawn circuits carry their own seed. A surveyed one has no seed to
  // carry, so its name is its seed: the scenery beside Spa is the same scenery
  // beside Spa every time, which is the only property any of this needs.
  const seed = real ? nameSeed(key) : plan.seed;
  const rnd = seeded(seed);
  const climb = loopNoise(seeded(seed ^ 0x9e37), 4);
  const roll = loopNoise(seeded(seed ^ 0x1d3f), 7);
  const wobble = loopNoise(seeded(seed ^ 0x51ed), 6);
  // Measured if the circuit has a measurement, written by hand if not. The two
  // are read identically from here on, which is the point of having both.
  const height0 = real
    ? (real.height ? measured(real.height, 10, real.flatten ?? 1) : profile(real.climb))
    : null;
  const inTunnel = real && real.tunnel ? tunnels(real.tunnel) : null;

  let ring;
  if (real) {
    // A survey needs no relaxing: its corners are the corners. That is the whole
    // reason for having it, and running `relax` over it would take La Source
    // from twenty-two metres to thirty and make it somebody else's hairpin.
    ring = resample(sampleSurvey(centreLine(key)), SEG);
  } else {
    // Drawn, then relaxed until nothing on it is sharper than this circuit is
    // allowed to be. Forty passes is plenty and the loop stops as soon as it
    // can; the alternative - rejecting seeds until one behaves - throws away a
    // good circuit because of one corner on it.
    ring = resample(sampleLoop(controlPoints(rnd, plan.points, plan.radius)), SEG);
    for (let pass = 0; pass < 40 && sharpest(ring) > plan.tightest; pass++) {
      ring = resample(relax(ring, 0.5), SEG);
    }
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
  if (real) {
    // Read straight off the profile in circuits.js. No relaxing and no ceiling
    // on the gradient: Eau Rouge is genuinely that steep, and the one thing the
    // player is going to check is whether it is.
    for (let i = 0; i < count; i++) height[i] = REAL_BASE + height0(i / count);
    for (let i = 0; i < count; i++) {
      steepest = Math.max(steepest, Math.abs(height[(i + 1) % count] - height[i]) / SEG);
    }
  }
  for (let pass = 0; pass < 6 && !real; pass++) {
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

  /**
   * The height of the infield, per node: the track's own height smoothed over a
   * sixth of a lap and dropped a few metres.
   *
   * One flat plain for the whole circuit was the fix for a hillside that reached
   * across the middle of the loop and drew itself over the far side of the
   * track. It worked, and it bought a second problem: on a circuit that climbs
   * fifty metres, a plain at the average height stands twenty metres above the
   * track wherever the track is in a dip, and a twenty metre embankment beside
   * the road reads as a flat polygon dropped on the scene.
   *
   * Smoothed rather than flat keeps both properties. It never rises far above
   * the road beside it, because it is that road's own height; and it can never
   * tower over the far side of the loop, because it never leaves the range of
   * heights the circuit itself occupies.
   */
  const infield = new Float64Array(count);
  const soften = Math.max(8, Math.round(count / 6));
  for (let i = 0; i < count; i++) {
    let sum = 0;
    for (let k = -soften; k <= soften; k++) sum += height[((i + k) % count + count) % count];
    // Never above the road beside it, whatever the smoothing says. The plain
    // reaches all the way across the loop now, and a plain ten metres above the
    // road is not scenery, it is a lid: from a dip in the circuit it covered the
    // world and the car appeared to be driving through a lake.
    // A real circuit gets its own number: the plain sits a couple of metres
    // under the road rather than six, because these places are flat facilities
    // and a six metre ditch round the whole of Monza is a moat.
    infield[i] = real
      ? Math.min(sum / (soften * 2 + 1) + real.land.plain, height[i] - 1.2)
      : Math.min(sum / (soften * 2 + 1) - 6, height[i] - 4);
  }

  // Which way the hill leans, from the curvature averaged over eighty metres.
  //
  // Averaged, because it multiplies a thirty metre hillside and the raw
  // curvature goes from a corner to a straight in a handful of nodes: at full
  // strength that swung the ground sixty metres between one node and the next,
  // and two ground quads that far apart do not meet, they cross. A hillside is a
  // feature of a stretch of road, not of a node on it.
  const lean = new Float64Array(count);
  const span = 7;
  for (let i = 0; i < count; i++) {
    let sum = 0;
    for (let k = -span; k <= span; k++) {
      const j = ((i + k) % count + count) % count;
      sum += turn(heading[j], heading[(j + 1) % count]);
    }
    lean[i] = Math.max(-0.8, Math.min(0.8, (sum / (span * 2 + 1)) * 14));
  }

  /**
   * The lowest road that any of this node's ground could be drawn over.
   *
   * This is the rule the surveyed circuits could not do without, and it took a
   * tan sky at Zandvoort to find it. That circuit climbs seventeen metres into
   * the dunes and comes back within twenty-eight metres of its own main
   * straight, so the ground belonging to Scheivlak - which is up at the top -
   * was being drawn ninety-five metres wide over the road at the bottom. From
   * the cockpit it was not a hillside. It was a lid: a flat plane above the
   * camera, near at the top of the screen and far at the bottom, covering the
   * whole sky in the colour of sand.
   *
   * So every node is told the height of the lowest road within a hundred and
   * thirty metres of it that is somewhere else on the lap, and nothing it draws
   * may rise above that. Nodes on the same stretch of road are excluded, or a
   * circuit that merely goes downhill would clamp its own verge flat.
   *
   * The drawn circuits do not need it - laid out around a ring, they never come
   * back on themselves - and do not get it, so nothing about the mountain pass
   * changes.
   */
  const ceiling = [
    new Float64Array(count).fill(Infinity),
    new Float64Array(count).fill(Infinity),
    new Float64Array(count).fill(Infinity),
  ];
  if (real) {
    // One ceiling per band, because a band that only reaches thirty-two metres
    // can only be drawn over a road that is within thirty-two metres. Giving
    // them all the same ceiling was the first attempt and it was both too
    // strict near the road - the verge became a ditch - and not strict enough
    // far from it, which is where the trouble actually was.
    const near2 = RINGS[1] * RINGS[1];
    const mid2 = RINGS[2] * RINGS[2];
    const far2 = RINGS[3] * RINGS[3];
    const AWAY = 40;
    // Flat arrays rather than the ring objects: this is the one loop in the file
    // that runs a million times, and reading two fields off an object a million
    // times is most of what it was doing.
    const xs = new Float64Array(count);
    const zs = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      xs[i] = ring[i].x;
      zs[i] = ring[i].z;
    }
    const c0 = ceiling[0];
    const c1 = ceiling[1];
    const c2 = ceiling[2];
    for (let i = 0; i < count; i++) {
      const xi = xs[i];
      const zi = zs[i];
      const hi = height[i];
      // Each pair once, and only pairs that are a long way apart along the lap:
      // the wrap is handled by stopping short at the end rather than by working
      // out a wrapped distance a million times.
      const last = count - (i < AWAY ? AWAY - i : 0);
      for (let j = i + AWAY; j < last; j++) {
        const dx = xi - xs[j];
        const dz = zi - zs[j];
        const d2 = dx * dx + dz * dz;
        if (d2 > far2) continue;
        const hj = height[j];
        if (hj < c2[i]) c2[i] = hj;
        if (hi < c2[j]) c2[j] = hi;
        if (d2 > mid2) continue;
        if (hj < c1[i]) c1[i] = hj;
        if (hi < c1[j]) c1[j] = hi;
        if (d2 > near2) continue;
        if (hj < c0[i]) c0[i] = hj;
        if (hi < c0[j]) c0[j] = hi;
      }
    }
  }

  /**
   * How many bands of ground this node may draw before one of them turns into a
   * cliff. See `reach` below for what this is for.
   */
  const baseReach = real && real.land.reach !== undefined ? real.land.reach : 99;
  const CLIFF = 5;
  const bandsAt = (i) => {
    // Only where the circuit has already said its ground stops close by, which
    // is the eight measured ones and nowhere else. On a circuit in open country
    // a band clamped thirty metres down is a hillside and is meant to be there:
    // applied to all of them this took the landscape off eight hundred and
    // twenty-nine of Spa's eleven hundred nodes.
    if (!real || real.land.reach === undefined) return baseReach;
    let n = baseReach;
    for (let k = 0; k < 3; k++) {
      if (ceiling[k][i] < height[i] - CLIFF) { n = Math.min(n, k); break; }
    }
    return n;
  };

  /**
   * Extra banking, for the circuits that are dished.
   *
   * Zandvoort is the only one of the four, and it matters there: eighteen
   * degrees at Hugenholtz and at the last corner, which is enough that you carry
   * speed through them you could not carry anywhere else on the lap.
   *
   * The sign comes from the corner rather than from the table, so a dished
   * corner leans into whichever way it turns and the table only has to say how
   * much. Raised over a cosine so the car is not asked to roll eighteen degrees
   * between two nodes - a step in the banking is a kerb across the track.
   */
  const dish = new Float64Array(count);
  for (const bend of (real?.bank) || []) {
    const span = Math.max(1, Math.round((bend.span || 0.02) * count));
    const mid = Math.round(bend.at * count);
    // Which way this corner goes, decided once for the whole of it.
    //
    // Read per node it flipped inside a single corner: Hugenholtz reverses
    // curvature at its exit, so the banking went from eighteen degrees one way
    // to thirteen the other over forty metres. That is not a dished corner, it
    // is a camber change you would feel through the wheel as a step. A bend is
    // banked one way along its whole length because that is how one gets built.
    let sum = 0;
    for (let m = -span; m <= span; m++) {
      sum += turn(heading[((mid + m) % count + count) % count],
        heading[((mid + m + 1) % count + count) % count]);
    }
    for (let k = -span; k <= span; k++) {
      const j = ((mid + k) % count + count) % count;
      const fade = 0.5 + 0.5 * Math.cos((k / span) * Math.PI);
      // Plus, not minus, and that sign is the whole of it.
      //
      // A positive heading change turns the forward vector towards the
      // right-hand vector, so a positive curve is a right-hander and the outside
      // of it is the left, at negative x. Road height is `y - dish * x`, so
      // raising the outside means a positive dish. It was written negative
      // first, which put the inside of Tarzan three and a half metres above the
      // outside: a corner that throws the car out rather than holding it in,
      // and eighteen degrees of it.
      dish[j] = Math.sign(sum || 1) * (bend.deg * Math.PI / 180) * fade;
    }
  }

  /**
   * The curvature a driver feels, as opposed to the curvature of one node.
   *
   * Camber is read off this rather than off `curve`, and it has to be. A node is
   * six metres, and six metres of a surveyed line is noise: Suzuka's curvature
   * moves by a hundredth of a radian from one node to the next, so a camber
   * taken straight off it swung the road - and the car standing on it - by a
   * degree per node. At two hundred that is nine wobbles a second, and it read
   * exactly as it sounds, as a car with something loose in the suspension.
   *
   * Averaged over sixty-six metres, which is about the length of road a camber
   * change is actually built over.
   */
  const felt = new Float64Array(count);
  {
    const span = 5;
    for (let i = 0; i < count; i++) {
      let sum = 0;
      for (let k = -span; k <= span; k++) {
        const j = ((i + k) % count + count) % count;
        sum += turn(heading[j], heading[(j + 1) % count]);
      }
      felt[i] = sum / (span * 2 + 1);
    }
  }

  const nodes = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const warm = plan.warm ? plan.warm(t) : 0;
    const curve = turn(heading[i], heading[(i + 1) % count]);
    const y = height[i];
    // Cycles per lap, not a frequency per node.
    //
    // This used to be `wobble((i * freq) % 1)`, which looks like sampling noise
    // along the track and is not: `wobble` is periodic over one lap, so the
    // modulo threw it back to the start every twenty nodes and the hillsides
    // arrived as a sawtooth with a cliff in it every hundred metres. Whole
    // numbers of cycles round the lap keep it periodic, which is the property
    // the whole file is built on, and low ones keep the features hundreds of
    // metres long, which is what a hillside is.
    const wob = (cycles) => wobble(t * cycles);
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
      // Banking, into the corner. Small: this is a circuit, not a bowl - except
      // where the circuit really is a bowl, which is what `dish` is for.
      //
      // Clamped on the surveyed circuits only, and the split is not a fudge.
      // Three point two times the curvature is a reasonable lean on a corner of
      // a hundred metres' radius and nonsense on one of twenty. The drawn
      // circuits are relaxed until nothing on them is sharper than the plan
      // allows, so the number can never run away there and has been tuned in
      // place. A survey is not relaxed - that is the point of it - so Monza's
      // Rettifilo came out at a hundred and twenty-five degrees of camber, which
      // is not a corner, it is a wall the car drives up.
      // Camber: a road detail, and a fudge factor rather than a gradient - it is
      // drawn at a twelfth of its nominal value and it never touches the car's
      // grip.
      //
      // Positive, and it used to be negative, which had every corner in the game
      // cambered the wrong way round. A positive curve is a right-hander, so its
      // outside is at negative x, and road height is `y - bank * x * 0.12`:
      // raising the outside wants a positive bank. Written the other way it put
      // the inside of the sharpest corner on the pass a metre and a third above
      // the outside. It was invisible for years because a twelfth of a fudge
      // factor is a metre over the width of the road and nothing sits on it -
      // and it stopped being invisible the moment eighteen degrees of real
      // banking arrived at Tarzan with the same sign on it.
      //
      // Clamped on the surveyed circuits because a survey is not relaxed, and
      // Monza's Rettifilo came out at a hundred and twenty-five degrees.
      bank: real ? Math.max(-0.12, Math.min(0.12, felt[i] * 3.2)) : felt[i] * 3.2,
      // The curvature over sixty-six metres of road rather than over six. The
      // camber is built from it, and so is how far the car leans on its springs:
      // both are responses to a corner, and a corner is longer than a node.
      felt: felt[i],
      // Banking: a structure, and a real angle. Held apart from the camber
      // because the two behave nothing alike. Camber is drawn at a twelfth of
      // its nominal value and does not touch the car at all; eighteen degrees of
      // banking is eighteen degrees, it drops the inside of the road by four
      // metres over its width, and it is worth a fifth of the grip. Anything
      // else would be a picture of a banked corner rather than one.
      dish: dish[i],
      // How wide the tarmac is here.
      //
      // A constant everywhere until the surveyed circuits arrived, and it could
      // not stay one: Monza averages four and three quarter metres either side
      // of the line and Spa reaches eight, so one number would have made half of
      // them wrong and the wrong half feel like the other one.
      // WIDEN corrects the survey, which measures the asphalt and not the width
      // a car uses. A circuit measured off OpenStreetMap has no width in the
      // data at all - its width is one number written down beside it, chosen to
      // be the width the place actually is - so it is not corrected for
      // something it was never subject to.
      half: at(i).half === undefined
        ? ROAD_HALF
        : (real && real.osm ? at(i).half : Math.max(NARROWEST, at(i).half * WIDEN)),
      // How much of this node is under a roof. Nought almost everywhere.
      tunnel: inTunnel ? inTunnel(t) : 0,
      // How far out this circuit draws ground.
      //
      // Everywhere but a street circuit draws all of it - but a band is also
      // dropped, node by node, when its ceiling sits far below the road, because
      // a band clamped a long way down is not ground, it is a cliff.
      //
      // Monaco is where this shows. It climbs forty-one metres on a site four
      // hundred metres across, so almost every point on it has a much lower
      // piece of road within the ninety-five metres the second band's ceiling
      // looks at - and the ceiling did its job, pulled the band down to the
      // harbour, and drew a thirty-four metre wall of ground beside the track,
      // over the road on the other side of it. The ceiling was right and the
      // band should not have been there at all.
      reach: bandsAt(i),
      // The barrier, which has to stay outside the road however wide the road
      // gets. Fifteen metres is a good run-off beside a nine metre track and is
      // inside the kerb of a sixteen metre one.
      // The barrier. Six metres of run-off past the kerb unless the circuit says
      // otherwise, and one of them does: an island in the St Lawrence has
      // concrete where everywhere else has grass, so Montreal asks for two.
      // Everywhere else the barrier also stays outside fifteen metres, because
      // fifteen is a good run-off beside a nine metre track; a circuit that has
      // asked for less has asked for less on purpose.
      wall: real && real.land.runoff !== undefined
        ? (real.osm ? at(i).half : Math.max(NARROWEST, at(i).half * WIDEN))
          + real.land.runoff
        : Math.max(WALL_AT, (at(i).half === undefined
          ? ROAD_HALF
          : Math.max(NARROWEST, at(i).half * WIDEN)) + 6),
      warm,
      g: real
        ? capped(groundReal(y, real.land, wob, infield[i], coastAt(real.land.sea, t)),
          ceiling[0][i], ceiling[1][i], ceiling[2][i])
        : ground(y, lean[i], warm, wob, infield[i]),
    });
  }

  /**
   * Where the circuit crosses its own path, and what to do about it.
   *
   * Suzuka is a figure of eight. That is not a curiosity, it is a problem the
   * geometry hands you: at 0.44 and 0.85 of the lap the road is in the same
   * place twice, twenty-one metres apart in height, and each node draws its own
   * ground for three hundred metres in every direction. Left alone the upper
   * road lays a plain across the lower one and the back straight becomes a
   * tunnel through a hillside that is not there.
   *
   * So the higher road gives up its ground and becomes a viaduct: no terrain,
   * a deck with sides, and piers down to whatever is underneath. Which is what
   * is actually built at Suzuka, and is the single thing everybody knows about
   * the place.
   *
   * Found rather than written down. It is a property of the survey, and a
   * property of the survey should be read off the survey.
   */
  const flyovers = [];
  // Not on a circuit that came off the map. Those are assembled by routing
  // between fragments, so where the road appears to pass near itself it is
  // usually the route having doubled back rather than a crossing - and where it
  // genuinely does pass under something, the map has already said so and it is
  // a tunnel.
  if (real && !real.osm) {
    const apart = (i, j) => {
      const d = Math.abs(i - j);
      return Math.min(d, count - d);
    };
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        // Sixty nodes is three hundred and sixty metres of road: closer than
        // that and it is the same corner, not a crossing.
        if (apart(i, j) < 60) continue;
        const gap = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
        if (gap > 26) continue;
        const drop = nodes[i].y - nodes[j].y;
        if (Math.abs(drop) < 6) continue;
        // A circuit that says it has a tunnel here has already answered the
        // question this is asking. Monaco doubles back under itself for eight
        // hundred metres and the map calls that a tunnel, which it is; building
        // a viaduct over the top of it as well would be two answers.
        if (nodes[i].tunnel > 0.2 || nodes[j].tunnel > 0.2) continue;
        const over = drop > 0 ? i : j;
        const under = drop > 0 ? j : i;
        if (flyovers.some((f) => apart(f.at, over) < 60)) continue;
        flyovers.push({
          at: over,
          under,
          clear: Math.abs(drop),
          // The angle the upper road crosses the lower one at, so the deck can
          // be laid over it the way it actually lies rather than square to it.
          cross: turn(heading[under], heading[over]),
        });
      }
    }
    // Nineteen nodes of deck: long enough to read as a structure, short enough
    // that the ground comes back before the next corner does.
    for (const { at: mid, clear } of flyovers) {
      for (let k = -18; k <= 18; k++) {
        const j = ((mid + k) % count + count) % count;
        const t = Math.min(1, Math.max(0, (18 - Math.abs(k)) / 5));
        if (t <= (nodes[j].deck || 0)) continue;
        nodes[j].deck = t;
        // How far down the piers go, which is as far as the road underneath.
        nodes[j].deckFoot = nodes[j].y - clear - 1;
        // And the parapet closes in as the deck begins. This is the same trick
        // the suspension bridge uses and for the same reason: without it the
        // barrier stays out at fifteen metres, where on a viaduct there is
        // nothing at all, and the car drives off the side into the air.
        nodes[j].wall = nodes[j].wall + (nodes[j].half + 1.1 - nodes[j].wall) * t;
      }
    }
  }

  // The bridge, laid on the straightest stretch there is, with the water under
  // it a good way below the deck. Done after the nodes exist because it needs
  // their curvature to choose where to go and their heights to decide how far
  // down the water is.
  const from = real ? -1 : straightest(nodes, BRIDGE_NODES);
  let lowest = Infinity;
  for (let k = 0; !real && k < BRIDGE_NODES; k++) {
    lowest = Math.min(lowest, nodes[(from + k) % count].y);
  }
  const water = lowest - 26;
  for (let k = 0; !real && k < BRIDGE_NODES; k++) {
    const node = nodes[(from + k) % count];
    node.bridge = k / (BRIDGE_NODES - 1);
    // Everything either side of the deck falls away to the water, and both
    // sides of it are water rather than only the seaward one.
    // Four nodes to fall away rather than seven: the run-off narrows with it,
    // and a long ramp beside the deck reads as land you could drive on.
    const ease = Math.min(1, Math.min(k, BRIDGE_NODES - 1 - k) / 4);
    const drop = (h) => h + (water - h) * ease;
    // The heights ease down over the four nodes at each end; the colour does
    // not ease at all. Blending it was the bug: on the approach the hillside was
    // still thirty metres up and already being painted as sea, so a bay
    // appeared in mid-air over the track and the car drove into it. Water is
    // drawn only where the ground has actually arrived at the water.
    const wet = ease > 0.999 ? 1 : 0;
    node.g = {
      ...node.g,
      l: [drop(node.y - 1), drop(node.g.l[1]), drop(node.g.l[2])],
      r: [drop(node.y - 1), drop(node.g.r[1]), drop(node.g.r[2])],
      far: [drop(node.g.far[0]), drop(node.g.far[1])],
      wet: Math.max(node.g.wet, wet),
      bay: wet,
    };
  }

  return {
    key,
    nodes,
    bridgeFrom: from,
    bridgeWater: water,
    props: real
      ? dress(nodes, { ...real, flyovers }, seeded(seed ^ 0x3a71))
      : scatter(nodes, seeded(seed ^ 0x3a71)),
    real: !!real,
    label: real ? real.label : undefined,
    theme: real ? real.theme : null,
    flyovers,
    length: count,
    metres: count * SEG,
    steepest,
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
 * Corner boards: chevrons on the approach to every corner, and down the outside
 * of it.
 *
 * This is a driving aid and it is the honest kind. The circuit does not change
 * and the car does not change; what changes is that you are told a corner is
 * coming while there is still time to do something about it, which is exactly
 * what the boards beside a real circuit are for. At three hundred and fifty a
 * corner arrives in under two seconds from the point where the road ahead of it
 * stops looking straight, and on a crest or through trees it arrives from
 * nowhere at all.
 *
 * One chevron for a corner you lift for, two for third gear, three for one that
 * needs the brakes properly - the same convention as everywhere else, so nobody
 * has to be told. Two boards on the approach at about ninety and forty-five
 * metres, then a run of them down the outside of the corner itself, which is
 * where your eyes already are.
 *
 * The curvature is read over a stretch rather than off a node: one node of a
 * circuit is six metres, and six metres of anything is noise.
 */
function cornerBoards(nodes, add) {
  const count = nodes.length;
  const at = (i) => nodes[((i % count) + count) % count];
  // Four nodes, which is twenty-four metres either side.
  //
  // It was five, and five could not tell Monaco's corners apart: they are forty
  // metres from each other and a sixty-six metre window spans two of them, so
  // three boards ended up in a right-hander pointing left. The window has to be
  // shorter than the shortest corner, and Monaco has the shortest corners there
  // are. Measured over all twenty circuits, four gets every one of one thousand
  // six hundred and fifty-six boards pointing the way its corner goes; five got
  // three wrong and three got one.
  const SPAN = 4;
  const smooth = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    let sum = 0;
    for (let k = -SPAN; k <= SPAN; k++) sum += at(i + k).curve;
    smooth[i] = sum / (SPAN * 2 + 1);
  }

  // Anything gentler than this is a bend you take flat, and a board on it is a
  // board nobody reads. A node is six metres, so curvature in radians per node
  // is six over the radius: this is a two hundred and fifty metre corner, which
  // at this much grip is about two hundred and eighty km/h.
  const ENOUGH = 0.024;
  const corners = [];
  let run = null;
  const close = () => {
    if (run && run.to - run.from >= 3) corners.push(run);
    run = null;
  };
  for (let i = 0; i < count; i++) {
    if (Math.abs(smooth[i]) > ENOUGH) {
      // A corner ends where the road starts turning the other way, and not only
      // where it stops turning. Without that a chicane is one corner: at
      // Montreal's turn six and seven, sixty metres apart, the right-hander's
      // run of boards carried on past the point where the road had already gone
      // left, so four of them stood in a left-hander pointing right.
      if (run && Math.sign(smooth[i]) !== Math.sign(run.peak)) close();
      run ||= { from: i, peak: 0 };
      if (Math.abs(smooth[i]) > Math.abs(run.peak)) run.peak = smooth[i];
      run.to = i;
    } else if (run) {
      close();
    }
  }
  close();

  // Every board anybody might want, before any of them are allowed to stand.
  //
  // Collected rather than placed, because two corners close together both want
  // the same piece of verge and they want it pointing opposite ways. A chicane
  // is a left and a right forty metres apart: the left's boards go on the right
  // of the road and the right's on the left, and placed as they fell you got
  // chevrons on both sides at once, disagreeing with each other, at the one
  // moment you most need to be told a single thing.
  const wanted = [];
  for (const corner of corners) {
    const bend = corner.peak > 0 ? 1 : -1;
    // How many chevrons, from what the corner is actually worth in speed rather
    // than from a number that looked about right. Six over the curvature is the
    // radius and the square root of grip times radius is the speed, so three
    // chevrons is a fifty metre corner at around a hundred and thirty km/h,
    // two is a hundred and ten metres at about a hundred and ninety, and one is
    // everything else that is still a corner.
    const peak = Math.abs(corner.peak);
    const sharp = peak > 0.12 ? 3 : peak > 0.055 ? 2 : 1;
    // The outside of the corner, which is the side you are looking at on the way
    // in and the side you end up on if you get it wrong.
    const side = -bend;
    const want = (i) => {
      const node = ((i % count) + count) % count;
      // How much of this corner is still to come, from here. It is what decides
      // who gets the ground when two corners want it: the board for the corner
      // you have not finished yet beats the board for the one after it.
      let left = corner.to - node;
      if (left < 0) left += count;
      // And not if the road it would actually stand on bends the other way.
      //
      // A board belongs to a corner, but it is put down somewhere on the
      // approach to it, and on a circuit where one bend runs straight into the
      // opposite one that somewhere can be the tail of the corner before. One
      // board at Madrid ended up on a right-hander pointing left. A board that
      // disagrees with the road under it is worse than no board, so it is
      // dropped rather than turned - turning it would make it point away from
      // the corner it was put there for.
      let round = 0;
      for (let k = -4; k <= 4; k++) round += nodes[((node + k) % count + count) % count].curve;
      if (Math.abs(round / 9) >= 0.03 && Math.sign(round) !== bend) return;
      wanted.push({ node, left, corner, side, bend, sharp });
    };
    // On the approach: sixty metres and thirty. Late on purpose - a board a
    // hundred metres out is read, believed and forgotten before the corner
    // arrives, and the one that does the work is the last one you see.
    //
    // Not if the approach is already somebody else's corner, though. At Monaco
    // the corners are forty metres apart, so a board sixty metres before one of
    // them stands in the middle of the one before it - pointing left while the
    // road under it goes right, which is worse than no board.
    const inAnother = (i) => {
      const at = ((i % count) + count) % count;
      return corners.some((c) => c !== corner
        && ((at >= c.from && at <= c.to)
          || (c.from > c.to && (at >= c.from || at <= c.to))));
    };
    if (!inAnother(corner.from - 10)) want(corner.from - 10);
    if (!inAnother(corner.from - 5)) want(corner.from - 5);
    // And down the outside of the corner itself, every eighteen metres, which is
    // close enough that they read as a line following the road round rather than
    // as three separate signs.
    for (let i = corner.from; i <= corner.to; i += 3) want(i);
  }

  /**
   * One board to a place, and the most relevant one wins it.
   *
   * Sorted by how much of its own corner is still ahead, so a board about the
   * corner you are in beats a board about the corner after it, and placed
   * greedily. A board keeps three nodes clear of any board belonging to a
   * different corner - eighteen metres - which is what stops a chicane putting
   * up two contradictory signs, while leaving a corner free to have as many of
   * its own as it likes.
   */
  const taken = new Int32Array(count).fill(-1);
  const owner = new Map(corners.map((c, i) => [c, i]));
  wanted.sort((a, b) => a.left - b.left);
  for (const board of wanted) {
    const mine = owner.get(board.corner);
    let clear = true;
    for (let k = -3; k <= 3 && clear; k++) {
      const j = ((board.node + k) % count + count) % count;
      if (taken[j] < 0) continue;
      // Its own corner may stand next to itself; anybody else's may not.
      if (taken[j] !== mine || k === 0) clear = false;
    }
    if (!clear) continue;
    taken[board.node] = mine;
    add(board.node, {
      kind: 'sign', side: board.side, off: at(board.node).wall + 2.4, s: 1, r: 0,
      align: true, flat: true, bend: board.bend, sharp: board.sharp,
    });
  }
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
  const onRoad = roadGuard(nodes);
  const add = (i, prop) => {
    // Rounded, because a prop placed on node 355.5 is stored under a key the
    // renderer never asks for and is simply never drawn - which is a silent
    // failure and took a helicopter going missing to notice.
    const at = ((Math.round(i) % count) + count) % count;
    // And the same question the measured circuits are asked: is this standing on
    // some other piece of the road? A generated circuit was assumed not to fold
    // back on itself tightly enough to matter, and the Pass does, at the hairpin
    // - where a pine stood two and a half metres inside the tarmac.
    if (prop.side && prop.off) {
      const a = nodes[at];
      const spread = spreadOf(prop);
      const x = a.x + a.nx * prop.side * prop.off;
      const z = a.z + a.nz * prop.side * prop.off;
      if (onRoad(x, z, spread, at)) return;
    }
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
      add(i, { kind: 'post', side: -1, off: 16.4, s: 1, r: 0, align: true, flat: true });
      add(i, { kind: 'post', side: 1, off: 16.4, s: 1, r: 0, align: true, flat: true });
    }

    // Flags at the start line, the same as the real circuits get. The three
    // drawn ones had none, because everything here is placed by rule and there
    // was no rule for them.
    if (i % 8 === 0 && i < 56) {
      add(i, { kind: 'flag', side: -1, off: 21, s: 1, align: true, flat: true, paint: i / 8 });
      add(i, { kind: 'flag', side: 1, off: 21, s: 1, align: true, flat: true, paint: 3 + i / 8 });
    }
    // And the paddock, past the pit exit where it can be seen.
    if (i % 6 === 0 && i > 60 && i < 108) {
      add(i, { kind: 'lorry', side: 1, off: 40, s: 1, align: true, flat: true, paint: i / 6 });
    }

    // Floodlights, alternating sides every seventy metres, leaning out over the
    // track. On a circuit that finishes in the dark they are not decoration -
    // they are the reason the third lap is a lap rather than a corridor.
    if (i % 12 === 0 && !nodes[i].bridge) {
      const side = (i / 12) % 2 === 0 ? -1 : 1;
      // The arm is built pointing at local -x, which with the track's heading is
      // its left. So the mast on the right of the track is placed as drawn and
      // the one on the left is turned round - the other way about had both of
      // them leaning out over the scenery.
      add(i, {
        kind: 'mast', side, off: 16.4, s: 1, r: side < 0 ? Math.PI : 0,
        align: true, flat: true,
      });
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
  // Turned a quarter, because a grandstand is long along the track and faces
  // across it - the other way round it is a wall standing in the road with its
  // seats pointing up the straight at nobody. And stood on the track's own
  // height, or a circuit that climbs leaves them hanging in the air beside it.
  for (let i = -22; i < 18; i += 6) {
    add(i, {
      kind: 'stand', side: -1, off: 26, s: 1, r: Math.PI / 2, align: true, flat: true,
    });
    add(i, {
      kind: 'stand', side: 1, off: 26, s: 1, r: -Math.PI / 2, align: true, flat: true,
    });
  }

  // Flair: the things you look at rather than drive past.
  //
  // A landmark is worth a great deal on a circuit you go round three times. The
  // second time you see the big wheel you know where you are on the lap without
  // reading anything, which is the whole job of it - and the balloon and the
  // helicopter are there because a sky with nothing in it is a colour rather
  // than a place.
  const third = Math.floor(count / 3);
  for (let k = 0; k < 3; k++) {
    // The red bridges, spaced round the lap and kept off the gantries.
    add(third * k + Math.floor(third / 2), {
      kind: 'bridge', side: 0, off: 0, s: 1, r: 0, align: true,
    });
  }
  // All of them on the infield side and close in. Out on the hillside a big
  // wheel is behind the hillside and a balloon a hundred and fifty metres off
  // the track is a dot: the infield is flat, it is what you look across for half
  // the lap, and it is where anything worth seeing has to stand.
  add(40, { kind: 'wheel', side: 1, off: 44, s: 1, r: 0, align: true });
  add(third + 40, { kind: 'balloon', side: 1, off: 80, s: 1, r: 0.7, lift: 42 });
  add(third * 2 + 90, { kind: 'balloon', side: 1, off: 120, s: 0.8, r: 2.1, lift: 58 });
  add(Math.floor(third * 1.5), { kind: 'chopper', side: 1, off: 30, s: 1, r: 0, lift: 32, align: true });

  cornerBoards(nodes, add);

  // The gantry is the checkpoint. It is placed on the node the clock is actually
  // reading, not near it, because a gate you go under half a second before the
  // seconds arrive is a gate that is lying to you.
  for (const at of checkpointsFor(count)) {
    add(at, { kind: 'arch', side: 0, off: 0, s: 1, r: 0, align: true });
  }
  return out;
}

/** How far from a piece of road a prop of each kind needs for its own footprint. */
export const SPREAD = {
  dune: 6, spruce: 2.5, oak: 3, pine: 2.5, marram: 1, rock: 2, crag: 4,
  palm: 2.5, stand: 10, pit: 15, screen: 5, tyres: 3.5, camper: 3,
  pavilion: 7, turbine: 10, banking: 15, block: 4, boat: 4, buoy: 1,
  post: 0.5, mast: 1, flag: 2.5, train: 30, lorry: 7,
  // A corner board is six metres wide and a hand's breadth deep, and only the
  // depth is on the ground. Left to the default of three it needed four and a
  // half metres of clearance from the kerb, which is more run-off than
  // Montreal has anywhere - so every board on that circuit was rejected and it
  // came out with none at all.
  sign: 1,
};

/** The ground a prop covers: a measured building carries its own footprint. */
export function spreadOf(prop) {
  if (prop.w !== undefined && prop.d !== undefined) return Math.hypot(prop.w, prop.d) / 2;
  return (SPREAD[prop.kind] ?? 3) * (prop.s || 1);
}

/**
 * Is there road here that this prop does not belong to?
 *
 * Every node on the circuit, in a grid, and one question asked of it. `mine` is
 * the node the prop was placed against, and nodes near it in lap distance are
 * excused. They have to be: a corner board stands just outside its own barrier
 * on purpose, and at Montreal the barrier is two metres from the kerb rather
 * than six - so measured against its own node every board on the circuit was
 * rejected as standing on the road, and Montreal came out with none at all. The
 * question this is asking has always been whether a prop has landed on some
 * *other* piece of the circuit.
 *
 * Pulled out of `dress` so that `scatter` can ask it too. The three drawn
 * circuits had no such check at all, on the reasoning that a generated circuit
 * does not fold back on itself - which it does, at the hairpin on the Pass,
 * where a pine was standing two and a half metres inside the road.
 */
function roadGuard(nodes) {
  const CELL = 20;
  const count = nodes.length;
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minZ = Math.min(minZ, n.z);
    maxZ = Math.max(maxZ, n.z);
  }
  const cols = Math.max(1, Math.ceil((maxX - minX) / CELL) + 1);
  const rows = Math.max(1, Math.ceil((maxZ - minZ) / CELL) + 1);
  const grid = new Array(cols * rows);
  const cellOf = (x, z) => Math.max(0, Math.min(cols - 1, Math.floor((x - minX) / CELL)))
    + Math.max(0, Math.min(rows - 1, Math.floor((z - minZ) / CELL))) * cols;
  for (const n of nodes) (grid[cellOf(n.x, n.z)] ||= []).push(n);

  return (x, z, spread, mine) => {
    const cx = Math.floor((x - minX) / CELL);
    const cz = Math.floor((z - minZ) / CELL);
    // As far out as the prop itself reaches, plus the widest road.
    //
    // This was two cells - forty metres - on the reasoning that the widest thing
    // here needs fifteen metres of clearance. That is true of everything placed
    // by rule and not of a measured building: Losail has one whose footprint
    // reaches sixty metres, so the road it was standing on lay outside the
    // search and it was waved through. Eight buildings across the six imported
    // circuits were sitting on the track for exactly this reason.
    const reach = Math.ceil((spread + 20) / CELL);
    for (let dz = -reach; dz <= reach; dz++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const col = cx + dx;
        const row = cz + dz;
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        const cell = grid[col + row * cols];
        if (!cell) continue;
        for (const n of cell) {
          if (mine !== undefined) {
            const apart = Math.abs(n.i - mine);
            if (Math.min(apart, count - apart) <= 2) continue;
          }
          const want = n.half + 1.5 + spread;
          const ax = x - n.x;
          const az = z - n.z;
          if (ax * ax + az * az < want * want) return true;
        }
      }
    }
    return false;
  };
}

/**
 * Everything standing beside a circuit that is a real place.
 *
 * The drawn circuits scatter their scenery by rule, because there is nothing to
 * be faithful to: a procedural mountain pass wants pines where the ground is
 * low and rock where it is high, and any particular pine is as good as any
 * other. A real one is the other way round. Nobody minds which tree is at the
 * ninth marker post on the Kemmel straight, but everybody minds that there are
 * conifers there rather than palms, that the crowd is round the outside of
 * Tarzan, and that the wheel is where the wheel is.
 *
 * So this reads two tables. `scatter` is the ambient stuff, placed at random
 * within rules - the forest, the dunes, the parkland - and it is what makes one
 * circuit not look like another from the cockpit. `marks` is the specific stuff,
 * placed at a fraction of a lap, and it is what makes a circuit findable: the
 * second time round you know where you are from the big wheel rather than from
 * the counter in the corner.
 *
 * The universal furniture - marker posts, floodlights, gantries - is added here
 * too and on the same terms as everywhere else, because a circuit that had none
 * of it would be the only one in the game that did not feel fast.
 */
function dress(nodes, real, rnd) {
  const count = nodes.length;
  const out = nodes.map(() => null);
  /** A fraction of a lap, as a node. */
  const node = (t) => Math.round(t * count);

  /**
   * Is there road here?
   *
   * Scenery is placed at a distance out from a node, which is fine on a road
   * that never comes back on itself and is not fine on any of these. Zandvoort
   * put sixty-two dunes on its own circuit: a dune twenty-six metres off the
   * main straight is a dune on the road at Hugenholtz, because Hugenholtz is
   * twenty-eight metres away. Spa did it with thirty-one conifers, Suzuka with
   * sixty trees and three marker posts. Inside a hairpin it is worse still -
   * anything placed further in than the corner's own radius comes out the other
   * side of it.
   *
   * A twenty metre grid over the nodes makes the question cheap enough to ask
   * about every prop on the circuit, which is the only way to be sure: the ways
   * a circuit can fold back on itself are not worth enumerating.
   */
  const onRoad = roadGuard(nodes);

  /**
   * A prop, put where it was asked for if there is room and pulled in towards
   * its own node if there is not.
   *
   * Dropped rather than forced if it will not fit anywhere: a missing tree is
   * invisible and a tree in the middle of the road is the only thing anybody
   * will talk about.
   */
  const add = (i, prop) => {
    const at = ((Math.round(i) % count) + count) % count;
    if (prop.side && prop.off) {
      const a = nodes[at];
      // A measured building carries its own footprint, and it has to be asked
      // about with that rather than with a guess. Monaco has one that is a
      // hundred and three metres by a hundred and fifty-one - a whole block,
      // mapped as one building - and checked against the default three metres it
      // sailed through and laid itself across the road.
      const spread = spreadOf(prop);
      let off = prop.off;
      let room = false;
      // Its own place first, then three quarters of the way in, then half - but
      // only for the things that were placed by rule. Something measured off a
      // map is where it is: a building that does not fit is dropped rather than
      // dragged towards the road, because dragging it puts a real building in a
      // place no building is.
      for (const share of (prop.fixed ? [1] : [1, 0.75, 0.5])) {
        const tryOff = Math.max(a.half + 1.5 + spread * 0.6, prop.off * share);
        const x = a.x + a.nx * prop.side * tryOff;
        const z = a.z + a.nz * prop.side * tryOff;
        if (onRoad(x, z, spread, at)) continue;
        off = tryOff;
        room = true;
        break;
      }
      if (!room) return;
      prop = { ...prop, off };
    }
    (out[at] ||= []).push(prop);
  };

  for (let i = 0; i < count; i++) {
    // Marker posts and floodlights, exactly as on the drawn circuits. The posts
    // are the cheapest speed in the game and the masts are what makes a night
    // lap a lap; neither has any business changing because the corners came
    // from a survey.
    if (i % 4 === 0) {
      add(i, { kind: 'post', side: -1, off: nodes[i].wall + 1.4, s: 1, r: 0, align: true, flat: true });
      add(i, { kind: 'post', side: 1, off: nodes[i].wall + 1.4, s: 1, r: 0, align: true, flat: true });
    }
    if (i % 12 === 0 && !nodes[i].deck) {
      const side = (i / 12) % 2 === 0 ? -1 : 1;
      add(i, {
        kind: 'mast', side, off: nodes[i].wall + 1.4, s: 1, r: side < 0 ? Math.PI : 0,
        align: true, flat: true,
      });
    }

    // The ambient scenery. Nothing on the deck of a viaduct, which is twenty
    // metres up in the air.
    if (nodes[i].deck) continue;
    for (const rule of real.scatter) {
      const sides = rule.side === 0 ? [-1, 1] : [rule.side];
      for (const side of sides) {
        if (rnd() >= rule.chance) continue;
        const [lo, hi] = rule.s;
        add(i, {
          kind: rule.kind,
          side,
          off: rule.from + rnd() * (rule.to - rule.from),
          s: lo + rnd() * (hi - lo),
          r: rnd() * 6.28,
        });
      }
    }
  }

  // The things that are where they are. `every` spreads one entry along a
  // stretch of lap, which is how a grandstand becomes a grandstand rather than
  // a shed - the models are one bay wide and a stand is twenty of them.
  for (const mark of real.marks) {
    const shape = {
      kind: mark.kind,
      side: mark.side,
      off: mark.off,
      s: mark.s ?? 1,
      r: mark.r ?? 0,
      align: true,
      // A grandstand belongs level with the road it looks at, not with the sand
      // behind it. Anything in the air says how far up it is instead.
      flat: mark.lift === undefined,
    };
    if (mark.lift !== undefined) shape.lift = mark.lift;
    // Which paint a transporter or a flag wears. Left off, they take their
    // colour from the run of them, so a row is not all one colour.
    if (mark.paint !== undefined) shape.paint = mark.paint;
    // A stand faces across the track, so it is turned a quarter turn and turned
    // the other quarter on the other side of the road.
    if (mark.kind === 'stand' || mark.kind === 'pit') {
      shape.r += mark.side < 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    if (mark.from === undefined) {
      add(node(mark.at), shape);
      continue;
    }
    // Numbered along the run, so a row of transporters is a row of teams and a
    // line of flags is not one colour repeated twenty times.
    let nth = 0;
    for (let t = mark.from; t <= mark.to + 1e-9; t += mark.every) {
      add(node(t), { ...shape, i: nth, paint: shape.paint ?? nth });
      nth++;
    }
  }

  // The other end of the flyover.
  //
  // The renderer draws a window of about a kilometre of road ahead of you, in
  // lap order. That is the right thing to draw and it has one consequence here:
  // the two halves of Suzuka's crossing are two and a half kilometres apart
  // along the lap, so when you are on the back straight going under the bridge,
  // the bridge is not in the window and is not drawn at all. You went under
  // nothing, at three hundred, which is a poor showing for the most famous piece
  // of road furniture in motor racing.
  //
  // So the deck gets drawn a second time, as scenery hanging over the lower
  // road, at the height and the angle the real one crosses at.
  for (const { under, clear, cross } of real.flyovers || []) {
    add(under, {
      kind: 'flyover', side: 0, off: 0, s: 1, r: cross, lift: clear, align: true,
    });
  }

  /**
   * And whatever the map said was there.
   *
   * The circuits measured out of OpenStreetMap carry their surroundings with
   * them: every building within a hundred and ninety metres of the road, with
   * the width and depth of its own footprint and the height off its own tags,
   * and whatever is moored in the water beside it. Nothing here is placed by
   * rule - a building stands where that building stands and is as tall as it is.
   *
   * It is the reason a street circuit is worth importing this way at all. Monaco
   * with invented buildings is a road between boxes.
   */
  for (const b of things(real.buildings, ['at', 'side', 'off', 'w', 'd', 'h', 'r'])) {
    add(b.at, {
      kind: 'tower', side: b.side, off: b.off, s: 1, r: b.r,
      align: true, fixed: true, w: b.w, d: b.d, h: b.h,
    });
  }
  for (const b of things(real.boats, ['at', 'side', 'off', 's', 'r'])) {
    add(b.at, {
      kind: 'boat', side: b.side, off: b.off, s: b.s, r: b.r, align: true, fixed: true,
    });
  }

  cornerBoards(nodes, add);

  // The gantry is the checkpoint, on the node the clock actually reads.
  for (const at of checkpointsFor(count)) {
    add(at, { kind: 'arch', side: 0, off: 0, s: 1, r: 0, align: true });
  }
  return out;
}
