/**
 * The road, and everything standing beside it.
 *
 * Built once, before the run starts, from a seed - so the mountain pass is the
 * same mountain pass every time anybody rides it. That is not a detail: a score
 * board of times is worthless if the road is different on each attempt, and a
 * road generated as you ride it cannot be learned, which is the only thing that
 * makes a time come down on the tenth run.
 *
 * A route is a list of nodes six metres apart. Each one knows where it is in the
 * world, which way it is pointing, and how high the ground is on either side at
 * three distances out. That last part is what the scenery is: there are no
 * models of hills anywhere, only the ground rising away from the tarmac, and a
 * mountain is what you get when it rises a long way.
 *
 * Nothing here is a billboard. A palm tree is three polygons standing in the
 * world, and if you ride round a bend you see it from the side, because it is
 * actually there. Everything else follows from that.
 */

import { CHECKPOINT_EVERY } from '../constants.js';

/** How far out, in metres from the centreline, each ground ring sits. */
export const RINGS = [12.2, 30, 95, 340];

/** Deterministic and local: route building must not touch the simulation's rng. */
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

/**
 * A run of road with one character to it.
 *
 * `curve` is radians of heading per node and `slope` is metres of climb per
 * node; both are targets that the builder eases into rather than steps to, or
 * the road would have corners in it in the geometric sense.
 */
function sections(kind, rnd) {
  const out = [];
  const push = (n, curve, slope, tag = '') => out.push({ n, curve, slope, tag });

  if (kind === 'mountain') {
    // Out of the valley on a straight, so the first thing you do is get on the
    // throttle rather than wonder which way the road goes.
    push(70, 0, 0.01, 'start');
    for (let i = 0; i < 8; i++) {
      const hard = rnd() < 0.42;
      const dir = rnd() < 0.5 ? -1 : 1;
      // Hairpins climb; the straights between them are where you catch up.
      push(26 + Math.floor(rnd() * 22), dir * (hard ? 0.052 : 0.026), 0.05 + rnd() * 0.06);
      push(30 + Math.floor(rnd() * 40), dir * 0.006, 0.02);
      push(24 + Math.floor(rnd() * 26), -dir * (hard ? 0.045 : 0.022), -0.02 + rnd() * 0.05);
      push(40 + Math.floor(rnd() * 60), 0, -0.06 + rnd() * 0.1);
    }
    // And down the other side, fast, which is where the time is.
    push(90, 0.004, -0.09);
    push(60, -0.03, -0.07);
    push(120, 0.012, -0.05);
  } else {
    // The sea front. Long, open and almost flat: the curves are there to stop
    // you holding the throttle wide, not to catch you out.
    push(60, 0, 0, 'start');
    for (let i = 0; i < 7; i++) {
      const dir = rnd() < 0.5 ? -1 : 1;
      push(70 + Math.floor(rnd() * 70), dir * (0.004 + rnd() * 0.012), (rnd() - 0.5) * 0.02);
      push(40 + Math.floor(rnd() * 30), -dir * (0.01 + rnd() * 0.02), (rnd() - 0.5) * 0.03);
      push(50 + Math.floor(rnd() * 60), 0, (rnd() - 0.5) * 0.02);
    }
    push(120, 0.006, 0);
  }
  return out;
}

/**
 * The ground either side, as absolute heights at the three rings.
 *
 * A mountain road has a cut face on the inside of the hill and nothing at all on
 * the outside, and which side is which changes as the road turns - so it is
 * worked out per node from the heading, not fixed per route. The coast is
 * simpler and more absolute: the sea is at zero, always, and the road is a
 * shelf above it.
 */
function ground(kind, i, y, curve, rnd, noise) {
  const wob = (a, b) => noise(i * a) * b;
  if (kind === 'mountain') {
    // Uphill side and downhill side, swapping with the direction of the bend.
    const lean = Math.max(-1, Math.min(1, curve * 26));
    const cliff = [1 + lean, 1 - lean];   // left, right multipliers
    return {
      l: [y + 0.6 + wob(0.7, 1.4), y + 5 * cliff[0] + wob(0.3, 7), y + 34 * cliff[0] + wob(0.11, 40)],
      r: [y + 0.6 + wob(0.9, 1.4), y + 5 * cliff[1] + wob(0.37, 7), y + 34 * cliff[1] + wob(0.13, 40)],
      far: [y + 120 + noise(i * 0.05) * 190, y + 120 + noise(i * 0.043 + 9) * 190],
    };
  }
  // Coast: sea to the left of the boulevard, town rising to the right.
  const shelf = 4 + noise(i * 0.09) * 3;
  return {
    l: [y - 0.4, y - shelf, 0],
    r: [y + 0.5 + wob(1.1, 0.7), y + 2.2 + wob(0.4, 3), y + 9 + wob(0.16, 16)],
    far: [0, y + 40 + noise(i * 0.05 + 4) * 60],
    sea: true,
  };
}

/** Smooth-ish value noise, so hillsides roll instead of jittering. */
function noiseFn(rnd) {
  const table = new Float32Array(512);
  for (let i = 0; i < table.length; i++) table[i] = rnd() * 2 - 1;
  return (x) => {
    const f = Math.floor(x);
    const t = x - f;
    const a = table[((f % 512) + 512) % 512];
    const b = table[(((f + 1) % 512) + 512) % 512];
    const s = t * t * (3 - 2 * t);
    return a + (b - a) * s;
  };
}

/**
 * Builds one leg: the pass, or the sea front.
 *
 * @param {'mountain'|'coast'} kind
 * @param {number} seed
 */
export function buildLeg(kind, seed) {
  const rnd = seeded(seed);
  const noise = noiseFn(seeded(seed ^ 0x9e37));
  const plan = sections(kind, rnd);

  const nodes = [];
  let a = 0;          // heading, radians, 0 = down +z
  let x = 0;
  let y = kind === 'mountain' ? 40 : 7;
  let z = 0;
  let curve = 0;
  let slope = 0;

  for (const part of plan) {
    for (let i = 0; i < part.n; i++) {
      // Eased rather than stepped: a road that changed curvature instantly would
      // have a kink you could see and a bump you could feel.
      curve += (part.curve - curve) * 0.09;
      slope += (part.slope - slope) * 0.07;
      a += curve;
      const n = nodes.length;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      x += dx * 6;
      z += dz * 6;
      y += slope * 6;
      if (kind === 'coast') y = Math.max(4.5, y);

      nodes.push({
        i: n,
        x, y, z,
        a,
        dx, dz,
        nx: dz, nz: -dx,          // the right-hand vector, in the ground plane
        curve,
        slope,
        // Banking, into the corner. Small: this is a road, not a velodrome.
        bank: -curve * 5.5,
        g: ground(kind, n, y, curve, rnd, noise),
      });
    }
  }

  return { kind, nodes, seed, props: scatter(kind, nodes, seeded(seed ^ 0x51ed)) };
}

/**
 * Everything standing beside the road.
 *
 * Placed on the node it belongs to and drawn when that node is drawn, which
 * means the scenery is culled by the same distance test as the road and costs
 * nothing to sort. Density is deliberately uneven: a run of bare road makes the
 * next stand of pines look like something.
 */
function scatter(kind, nodes, rnd) {
  const out = nodes.map(() => null);
  const add = (i, prop) => {
    if (i < 0 || i >= nodes.length) return;
    (out[i] ||= []).push(prop);
  };

  for (let i = 4; i < nodes.length; i++) {
    const n = nodes[i];
    if (kind === 'mountain') {
      // Trees on the low side, rock on the high side: that is what a cut through
      // a hill looks like, and it also tells you which way the road is about to
      // go before you can see the bend.
      const low = n.g.l[1] < n.g.r[1] ? -1 : 1;
      if (rnd() < 0.5) {
        add(i, { kind: 'pine', side: low, off: 15 + rnd() * 26, s: 0.8 + rnd() * 0.9, r: rnd() * 6.28 });
      }
      if (rnd() < 0.34) {
        add(i, { kind: 'pine', side: low, off: 30 + rnd() * 55, s: 0.9 + rnd() * 1.2, r: rnd() * 6.28 });
      }
      if (rnd() < 0.2) {
        add(i, { kind: 'rock', side: -low, off: 13.5 + rnd() * 9, s: 0.7 + rnd() * 1.4, r: rnd() * 6.28 });
      }
      if (rnd() < 0.06) {
        add(i, { kind: 'crag', side: -low, off: 26 + rnd() * 40, s: 2 + rnd() * 4, r: rnd() * 6.28 });
      }
      if (i % 9 === 0) {
        add(i, { kind: 'post', side: low, off: 11.4, s: 1, r: 0 });
      }
    } else {
      if (i % 7 === 0) {
        add(i, { kind: 'palm', side: -1, off: 12.5 + rnd() * 2, s: 0.9 + rnd() * 0.5, r: rnd() * 6.28 });
      }
      if (rnd() < 0.3) {
        add(i, { kind: 'palm', side: 1, off: 13 + rnd() * 6, s: 0.9 + rnd() * 0.6, r: rnd() * 6.28 });
      }
      if (rnd() < 0.13) {
        add(i, { kind: 'block', side: 1, off: 34 + rnd() * 30, s: 1 + rnd() * 2.6, r: rnd() * 0.6 - 0.3 });
      }
      // Out on the water. Far enough that they read as scenery, near enough
      // that you can tell a hull from a buoy.
      if (rnd() < 0.05) {
        add(i, { kind: 'boat', side: -1, off: 120 + rnd() * 260, s: 1.4 + rnd() * 2.6, r: rnd() * 6.28 });
      }
      if (rnd() < 0.05) {
        add(i, { kind: 'buoy', side: -1, off: 45 + rnd() * 70, s: 1, r: 0 });
      }
      if (i % 11 === 0) {
        add(i, { kind: 'post', side: -1, off: 11.4, s: 1, r: 0 });
      }
    }
    // The gantry is the checkpoint. It is placed on the node the clock is
    // actually reading, not near it, because a gate you ride under half a
    // second before the seconds arrive is a gate that is lying to you.
    if (i > 0 && i % CHECKPOINT_EVERY === 0) {
      add(i, { kind: 'arch', side: 0, off: 0, s: 1, r: 0 });
    }
  }
  return out;
}

/**
 * A whole route, one leg or two.
 *
 * The grand tour is the pass and the sea front joined end to end, with the
 * second leg's coordinates carried on from where the first stopped - so it is
 * one continuous world and one continuous time, not two races with a loading
 * screen between them.
 */
export function buildRoute(key) {
  const legs = key === 'coast' ? [['coast', 0x51a7]]
    : key === 'pass' ? [['mountain', 0x2c19]]
      : [['mountain', 0x2c19], ['coast', 0x51a7]];

  const nodes = [];
  const props = [];
  let ox = 0;
  let oz = 0;
  let oy = 0;
  let oa = 0;

  for (const [kind, seed] of legs) {
    const leg = buildLeg(kind, seed);
    const cos = Math.cos(oa);
    const sin = Math.sin(oa);
    for (const n of leg.nodes) {
      // Rotated and shifted onto the end of what came before, so the seam is a
      // piece of road like any other rather than a jump.
      const x = n.x * cos + n.z * sin;
      const z = -n.x * sin + n.z * cos;
      const a = n.a + oa;
      nodes.push({
        ...n,
        i: nodes.length,
        x: ox + x,
        z: oz + z,
        y: oy + (n.y - leg.nodes[0].y),
        a,
        dx: Math.sin(a),
        dz: Math.cos(a),
        nx: Math.cos(a),
        nz: -Math.sin(a),
        g: {
          ...n.g,
          l: n.g.l.map((h) => h + oy - leg.nodes[0].y),
          r: n.g.r.map((h) => h + oy - leg.nodes[0].y),
          far: n.g.far.map((h) => (n.g.sea && h === 0 ? 0 : h + oy - leg.nodes[0].y)),
        },
        kind,
      });
    }
    props.push(...leg.props);
    const last = nodes[nodes.length - 1];
    ox = last.x;
    oz = last.z;
    oy = last.y;
    oa = last.a;
  }

  // The coast leg puts the sea at zero, and the pass leg ends wherever it ends.
  // Joining them would leave the boulevard forty metres up a cliff, so the sea
  // is told where the road actually is.
  const seaAt = nodes.find((n) => n.kind === 'coast');
  const sea = seaAt ? seaAt.y - 4.5 : 0;
  for (const n of nodes) {
    if (!n.g.sea) continue;
    // Sand from the kerb out to thirty metres, and water from there to the
    // horizon. Putting the waterline that close is a lie about geography and
    // the right call about a video game: the sea has to be something you ride
    // beside, not something you can see in the distance.
    n.g.l = [n.g.l[0], sea, sea];
    n.g.far = [sea, n.g.far[1]];
  }

  // Where the pass becomes the boulevard, so the sky can change its mind
  // gradually rather than between one node and the next.
  let seam = -1;
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].kind !== nodes[i - 1].kind) { seam = i; break; }
  }

  return {
    key,
    nodes,
    props,
    sea,
    seam,
    length: nodes.length,
    metres: nodes.length * 6,
  };
}

