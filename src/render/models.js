/**
 * Everything in the world that is a thing rather than the ground.
 *
 * The rule these are built to is the one the whole look rests on: if you cannot
 * say what it is from three polygons, it does not need more than five. A palm
 * tree is a trunk and three fronds. A rock is a pyramid. A grandstand is a slab
 * at an angle with a roof over it.
 *
 * The car is the exception and is allowed to be, because it is the thing you
 * look at for three minutes without a break and the thing that has to be
 * recognisable at two hundred metres. It gets about twenty faces: a wedge, two
 * wings, four wheels standing away from the body, and a helmet. Twenty is not
 * many - the machine this is imitating drew fifty a car and thought it was
 * showing off - and every one of them is doing something. Take the front wing
 * off and it stops being a racing car; take the wheels in and it becomes a
 * saloon.
 *
 * Nothing here is a sprite. Every one of these is real geometry standing in the
 * world, so it turns as you go round it, it is hidden by a crest, and it grows
 * as you arrive.
 */

import { C, CROWD, DUST, SMOKE, TEAM_COLOURS } from './palette.js';
import { mix, shade } from './colour.js';

/**
 * Puts local coordinates into the world.
 *
 * Roll first, then scale, then heading. Roll before heading because a car rolls
 * about its own axis, not about the world's, and doing it the other way round
 * makes a car in a left-hander lean into the scenery.
 */
class Placer {
  constructor() {
    this.buf = new Float64Array(24);
    this.set(0, 0, 0, 0, 0, 1);
  }

  set(x, y, z, yaw, roll, scale, pitch = 0) {
    this.ox = x; this.oy = y; this.oz = z;
    this.sy = Math.sin(yaw); this.cy = Math.cos(yaw);
    this.sr = Math.sin(roll); this.cr = Math.cos(roll);
    this.sp = Math.sin(pitch); this.cp = Math.cos(pitch);
    this.s = scale;
    return this;
  }

  /** One face, given as flat local triples. Colour is already fogged. */
  face(rt, colour, v) {
    const b = this.buf;
    const n = v.length / 3;
    for (let i = 0; i < n; i++) {
      const lx = v[i * 3];
      const ly = v[i * 3 + 1];
      const lz = v[i * 3 + 2];
      const rx = (lx * this.cr - ly * this.sr) * this.s;
      const ry0 = (lx * this.sr + ly * this.cr) * this.s;
      const rz0 = lz * this.s;
      // Pitch after roll and before heading: a car noses down the hill it is on,
      // not down whatever direction the world happens to run.
      const ry = ry0 * this.cp - rz0 * this.sp;
      const rz = ry0 * this.sp + rz0 * this.cp;
      b[i * 3] = this.ox + rx * this.cy + rz * this.sy;
      b[i * 3 + 1] = this.oy + ry;
      b[i * 3 + 2] = this.oz - rx * this.sy + rz * this.cy;
    }
    rt.poly(n === 8 ? b : b.subarray(0, n * 3), colour);
  }
}

const put = new Placer();

/**
 * A cone on its point or on its base: a conifer, a marker, a pile of anything.
 *
 * Six sides. Not eight, and not four: four is a pyramid you can see is a
 * pyramid, eight costs a third more for a silhouette nobody can tell from six at
 * the distance a tree is usually seen, and six lit by one sun has three faces
 * you can see and each of them a different brightness - which is the whole of
 * what makes it read as round.
 */
function cone(rt, colour, y0, y1, radius, sides = 6, turn = 0) {
  const p = new Float64Array(9);
  for (let i = 0; i < sides; i++) {
    const a0 = turn + (i / sides) * Math.PI * 2;
    const a1 = turn + ((i + 1) / sides) * Math.PI * 2;
    p[0] = 0; p[1] = y1; p[2] = 0;
    p[3] = Math.cos(a0) * radius; p[4] = y0; p[5] = Math.sin(a0) * radius;
    p[6] = Math.cos(a1) * radius; p[7] = y0; p[8] = Math.sin(a1) * radius;
    put.face(rt, colour, p);
  }
}

/**
 * A crown: a six-sided band with a dome over it and a taper under it.
 *
 * What an oak was made of before this was three flat quads crossed at angles,
 * which is a perfectly good tree in a renderer with no light in it - you see one
 * face on and one edge on and the eye fills in the rest. Under a sun it is three
 * flat cards, and worse, it casts the shadow of three flat cards.
 */
function crown(rt, colour, y0, y1, radius, sides = 6, skirt = true) {
  const p = new Float64Array(12);
  const low = y0 + (y1 - y0) * 0.18;
  const waist = y0 + (y1 - y0) * 0.42;
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2;
    const a1 = ((i + 1) / sides) * Math.PI * 2;
    const c0 = Math.cos(a0) * radius; const s0 = Math.sin(a0) * radius;
    const c1 = Math.cos(a1) * radius; const s1 = Math.sin(a1) * radius;
    p.set([c0, low, s0, c1, low, s1, c1, waist, s1, c0, waist, s0]);
    put.face(rt, colour, p);
    p.set([c0, waist, s0, c1, waist, s1, 0, y1, 0]);
    put.face(rt, colour, p.subarray(0, 9));
    // The underside, which is only ever seen from under the tree.
    if (skirt) {
      p.set([c1, low, s1, c0, low, s0, 0, y0, 0]);
      put.face(rt, colour, p.subarray(0, 9));
    }
  }
}

/**
 * A flat box: four sides and a lid. Five faces is a building, a crate, a stand.
 *
 * One colour, and it used to be three. The sides were written out at sixty-eight
 * and eighty-four per cent of the top, which is a sun directly overhead, painted
 * on by hand, and the same sun at four in the afternoon as at dusk with it on the
 * horizon. The faces carry their normals now and the light is worked out where
 * the light is - so a building at Monaco has a bright side and a dark side, they
 * are the sides the sun says they are, and they swap over as the afternoon goes.
 */
function box(rt, tint, colour, x0, x1, y0, y1, z0, z1) {
  const c = tint(colour);
  put.face(rt, c, [x0, y0, z0, x1, y0, z0, x1, y1, z0, x0, y1, z0]);
  put.face(rt, c, [x1, y0, z1, x0, y0, z1, x0, y1, z1, x1, y1, z1]);
  put.face(rt, c, [x0, y0, z1, x0, y0, z0, x0, y1, z0, x0, y1, z1]);
  put.face(rt, c, [x1, y0, z0, x1, y0, z1, x1, y1, z1, x1, y1, z0]);
  put.face(rt, c, [x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1]);
}

// --- Scenery -----------------------------------------------------------------

/**
 * How much of a model to draw, from how far away it is being seen.
 *
 * A tree near the car is a crown with a dome on it and six sides to catch the
 * light; the same tree four hundred metres up the road is nine pixels tall. The
 * first pass at rounding the trees put both of them at thirty-two triangles and
 * took Monza from nineteen thousand a frame to thirty-nine - eight and a half
 * milliseconds of a sixteen millisecond budget, for trees you cannot see.
 *
 * Two hundred metres is where it changes, which is about where a tree stops
 * having a side to it at this resolution.
 */
const NEAR_ENOUGH = 130;
/**
 * And where a tree stops being a shape and becomes a smudge.
 *
 * Past five hundred metres a seven metre tree is about nine pixels tall on a
 * screen this size. Everything a crown is made of - the band, the dome, the
 * trunk under it - is inside one of those pixels, so past here a tree is one
 * four-sided cone and nothing else. It is the difference between Monza costing
 * thirty thousand triangles a frame and twenty-two, and there is nothing to see
 * either way.
 */
const A_SMUDGE = 500;

/**
 * And how close before the underside of a crown is drawn at all.
 *
 * A tree is open underneath unless something closes it, and what closes it is
 * six triangles on the most numerous model in the game. You can only see under
 * one from inside about sixty metres, and the ones you get that close to are the
 * ones on the verge beside you.
 */
const UNDER_TREE = 60;

export function drawProp(rt, prop, x, y, z, tint, theme, facing = 0, time = 0, night = 0,
  away = 0) {
  const near = away < NEAR_ENOUGH;
  const under = away < UNDER_TREE;
  const smudge = away > A_SMUDGE;
  const s = prop.s || 1;
  // Trees and rocks are turned any old way and that is the point of them. A
  // gantry, a grandstand and a marker post belong to the track and are handed
  // its heading; without it they stand at whatever angle the world happens to
  // be at, which for a gantry means lying across the road.
  put.set(x, y, z, facing + (prop.r || 0), 0, s);
  switch (prop.kind) {
    case 'pine': {
      // One cone on a trunk. It was two flat triangles crossed at right angles,
      // on the reasoning that from any direction you see one face on and the
      // other edge on - which is what a conifer looks like from a moving
      // vehicle, and not what it looks like standing still or in its own shadow.
      if (smudge) {
        cone(rt, tint(theme.tree), 0.8, 6.4, 1.6, 3);
        break;
      }
      const trunk = tint(theme.trunk);
      put.face(rt, trunk, [-0.2, 0, 0, 0.2, 0, 0, 0.2, 1.6, 0, -0.2, 1.6, 0]);
      cone(rt, tint(theme.tree), 1.1, 6.4, 1.7, near ? 6 : 4);
      break;
    }
    case 'palm': {
      const trunk = tint(theme.trunk);
      const lit = tint(theme.tree);
      const dark = tint(shade(theme.tree, 0.72));
      // Leaning, because a palm on a sea front always is, and a row of them all
      // leaning the same way is most of what makes a boulevard read as one.
      put.face(rt, trunk, [-0.22, 0, 0, 0.22, 0, 0, 0.62, 5.2, 0, 0.28, 5.2, 0]);
      put.face(rt, lit, [0.45, 5.4, 0, -2.4, 4.2, 0.5, -1.6, 6.1, -0.4]);
      put.face(rt, dark, [0.45, 5.4, 0, 2.8, 4.4, -0.4, 1.7, 6.2, 0.5]);
      put.face(rt, lit, [0.45, 5.4, 0, 0.2, 4.1, 2.6, 1.1, 6.0, 1.5]);
      put.face(rt, dark, [0.45, 5.4, 0, 0.6, 4.3, -2.6, -0.4, 6.0, -1.4]);
      break;
    }
    /**
     * A spruce. Taller and narrower than the pine, and darker.
     *
     * It exists because Spa is a corridor through conifers and the pine already
     * in here reads as an alpine tree standing on its own. Three crossed
     * triangles rather than two: a spruce seen from a car is a column, and two
     * flat triangles give you a column that thins out every ninety degrees.
     */
    case 'spruce': {
      // Two cones, the upper one narrower and turned off the lower: a conifer
      // is widest a third of the way up and a single cone is not.
      if (smudge) {
        cone(rt, tint(theme.tree), 1.2, 9.4, 1.2, 3);
        break;
      }
      const trunk = tint(shade(theme.trunk, 0.85));
      put.face(rt, trunk, [-0.18, 0, 0, 0.18, 0, 0, 0.18, 1.9, 0, -0.18, 1.9, 0]);
      cone(rt, tint(theme.tree), 1.2, 6.6, 1.3, near ? 6 : 4);
      cone(rt, tint(shade(theme.tree, 1.06)), 4.4, 9.4, 0.86, near ? 6 : 3, 0.5);
      break;
    }
    /**
     * A broadleaf. A trunk and a lump, which is what a big deciduous tree is
     * from a moving car - the crown reads as a mass and never as a shape.
     */
    case 'oak': {
      // A trunk with four sides and a round crown. It was three flat quads
      // crossed at angles, which is a tree from the front and a set of cards
      // from anywhere else - and casts the shadow of a set of cards.
      if (smudge) {
        cone(rt, tint(theme.tree), 1.6, 7.4, 2.3, 4);
        break;
      }
      const trunk = tint(theme.trunk);
      const bark = tint(shade(theme.trunk, 0.82));
      put.face(rt, trunk, [-0.3, 0, -0.28, 0.3, 0, -0.28, 0.3, 2.8, -0.28, -0.3, 2.8, -0.28]);
      put.face(rt, trunk, [0.3, 0, 0.28, -0.3, 0, 0.28, -0.3, 2.8, 0.28, 0.3, 2.8, 0.28]);
      if (near) {
        put.face(rt, bark, [-0.28, 0, 0.3, -0.28, 0, -0.3, -0.28, 2.8, -0.3, -0.28, 2.8, 0.3]);
        put.face(rt, bark, [0.28, 0, -0.3, 0.28, 0, 0.3, 0.28, 2.8, 0.3, 0.28, 2.8, -0.3]);
      }
      crown(rt, tint(theme.tree), 2.2, 7.4, 2.5, near ? 6 : 4, under);
      break;
    }
    /**
     * A dune: a long low hummock of sand lying across the wind.
     *
     * The whole of Zandvoort's character is that you cannot see the next corner,
     * and this is why. Wide and low rather than tall and pointed, because a
     * pointed dune is a rock and the difference is the whole reason for having
     * a separate shape.
     */
    case 'dune': {
      // Lit brighter than the ground it stands on, not the same as it. Painted
      // in theme.near it was the exact colour of the sand under it and seventeen
      // hundred dunes were drawn at Zandvoort without one of them being visible.
      const lit = tint(shade(theme.near, 1.14));
      const side = tint(shade(theme.near, 0.94));
      const dark = tint(shade(theme.near, 0.74));
      // A ridge rather than a plateau, and it took getting wrong to see why:
      // built with a flat top it came out as a seventeen metre mesa and the
      // circuit ran through Arizona. The crest is a line, the two flanks meet
      // along it, and the ends come to a point - which is a dune.
      put.face(rt, lit, [-5, 0, -2.6, 5, 0, -2.6, 2.2, 1.5, 0, -2.2, 1.5, 0]);
      put.face(rt, dark, [5, 0, 2.6, -5, 0, 2.6, -2.2, 1.5, 0, 2.2, 1.5, 0]);
      put.face(rt, side, [-5, 0, -2.6, -2.2, 1.5, 0, -5, 0, 2.6]);
      put.face(rt, side, [5, 0, 2.6, 2.2, 1.5, 0, 5, 0, -2.6]);
      break;
    }
    /** Marram grass: two blades. It is the thing that holds the dune together. */
    case 'marram': {
      const lit = tint(theme.tree);
      const dark = tint(shade(theme.tree, 0.74));
      put.face(rt, lit, [-0.5, 0, 0, 0.5, 0, 0, 0.15, 1.5, 0.2]);
      put.face(rt, dark, [0, 0, -0.5, 0, 0, 0.5, 0.25, 1.3, 0.1]);
      break;
    }
    /**
     * A stack of tyres. Black, banded, and where the barrier is doing the most
     * work - the outside of the fast corners and the inside of the hairpins.
     */
    case 'tyres': {
      const dark = tint(shade(C.tyre, 0.8));
      const lit = tint(C.tyre);
      const stripe = tint(C.kerbB);
      for (let k = 0; k < 3; k++) {
        const y0 = k * 0.62;
        box(rt, tint, k === 1 ? C.kerbA : C.tyre, -2.6, 2.6, y0, y0 + 0.58, -0.5, 0.5);
      }
      // A white cap so the stack reads as a stack and not as a wall.
      put.face(rt, stripe, [-2.6, 1.88, -0.5, 2.6, 1.88, -0.5, 2.6, 1.94, 0.5, -2.6, 1.94, 0.5]);
      void dark; void lit;
      break;
    }
    /**
     * The pit building: a long shed with a control tower on the end of it.
     *
     * Every circuit has one and every one of them is the thing you see first,
     * so it is the single most useful building in the game. The tower is what
     * tells you the start line is coming rather than another grandstand.
     */
    case 'pit': {
      const wall = tint(shade(C.chrome, 0.92));
      const glass = tint(C.glass);
      box(rt, tint, C.chrome, -13, 13, 0, 5.2, -3.4, 3.4);
      // The glazing along the front, which is what a pit building is.
      put.face(rt, glass, [-12.4, 2.4, -3.5, 12.4, 2.4, -3.5, 12.4, 4.6, -3.5, -12.4, 4.6, -3.5]);
      // The tower, off one end.
      box(rt, tint, C.chrome, 7.5, 13, 5.2, 13.5, -2.6, 2.6);
      put.face(rt, glass, [8, 9.4, -2.7, 12.5, 9.4, -2.7, 12.5, 12.8, -2.7, 8, 12.8, -2.7]);
      // The roof slab, overhanging, which is most of the silhouette.
      put.face(rt, wall, [-13.8, 5.2, -4.2, 13.8, 5.2, -4.2, 13.8, 5.2, 4.2, -13.8, 5.2, 4.2]);
      break;
    }
    /** A big screen on a frame, showing something too small to make out. */
    case 'screen': {
      const leg = tint(shade(C.metal, 0.8));
      const face = tint(C.shadow);
      const glow = tint(night > 0.3 ? C.lamp : shade(C.glass, 1.1));
      box(rt, tint, C.metal, -0.4, 0.4, 0, 5.4, -0.4, 0.4);
      void leg;
      put.face(rt, face, [-4.2, 5.2, 0, 4.2, 5.2, 0, 4.2, 10.4, 0, -4.2, 10.4, 0]);
      put.face(rt, glow, [-3.7, 5.7, -0.12, 3.7, 5.7, -0.12, 3.7, 9.9, -0.12, -3.7, 9.9, -0.12]);
      break;
    }
    /** A campervan. There is a small town of these at Spa for one weekend a year. */
    case 'camper': {
      const body = 1 + ((prop.i || 0) % 3);
      const paint = TEAM_COLOURS[(body * 3) % TEAM_COLOURS.length];
      box(rt, tint, C.chrome, -2.4, 2.4, 0.5, 2.6, -1.1, 1.1);
      box(rt, tint, paint, -2.4, 0.4, 2.6, 3.4, -1.05, 1.05);
      put.face(rt, tint(C.tyre), [-1.9, 0, -1.15, -1.1, 0, -1.15, -1.1, 0.7, -1.15, -1.9, 0.7, -1.15]);
      put.face(rt, tint(C.tyre), [1.1, 0, -1.15, 1.9, 0, -1.15, 1.9, 0.7, -1.15, 1.1, 0.7, -1.15]);
      break;
    }
    /**
     * A flag on a pole, and the pole is most of the point.
     *
     * A row of these along a straight does something no static prop does: they
     * are the only thing on the circuit that says which way the wind is going,
     * and at a hundred metres apart they give a straight a rhythm. The banner
     * ripples in three panels rather than one, because a flat rectangle that
     * merely swings reads as a door.
     */
    case 'flag': {
      const pole = tint(shade(C.chrome, 0.9));
      // A team colour is three colours - body, wing and trim - so the one that
      // is wanted has to be asked for. Handed the whole entry, `shade` does
      // arithmetic on an object and every flag on the circuit came out black.
      const cloth = prop.paint !== undefined
        ? TEAM_COLOURS[prop.paint % TEAM_COLOURS.length].body
        : theme.ridge;
      put.face(rt, pole, [-0.12, 0, 0, 0.12, 0, 0, 0.12, 9, 0, -0.12, 9, 0]);
      // Three panels, each lagging the one before it, which is what a flag does.
      const wave = time * 0.05 + (prop.off || 0);
      for (let k = 0; k < 3; k++) {
        const x0 = 0.1 + k * 1.15;
        const x1 = x0 + 1.15;
        const z0 = Math.sin(wave - k * 0.9) * 0.34 * (k + 0.4);
        const z1 = Math.sin(wave - (k + 1) * 0.9) * 0.34 * (k + 1.4);
        // Lit on the near panel and shaded on the far one, so the ripple is
        // visible as shading and not only as a wobble.
        put.face(rt, tint(shade(cloth, k === 1 ? 0.82 : 1)),
          [x0, 6.2, z0, x1, 6.2, z1, x1, 8.9, z1, x0, 8.9, z0]);
      }
      break;
    }
    /**
     * A train, on the embankment beside the circuit.
     *
     * Four circuits here run alongside a railway that is genuinely there - the
     * line through the park at Monza, the MRT viaduct at Marina Bay, the metro
     * above Baku's seafront and the freight line behind Miami - and a train is
     * the one piece of scenery that moves across the view rather than past it.
     * It is drawn as a rake of boxes with a window stripe, which at a hundred
     * metres is a train and at three hundred is still a train.
     */
    case 'train': {
      const livery = prop.paint !== undefined
        ? TEAM_COLOURS[prop.paint % TEAM_COLOURS.length].trim
        : shade(C.chrome, 0.86);
      // The rails it stands on, so it is not floating on the grass.
      put.face(rt, tint(shade(C.metal, 0.7)),
        [-30, 0.1, -1.5, 30, 0.1, -1.5, 30, 0.1, 1.5, -30, 0.1, 1.5]);
      for (let k = 0; k < 3; k++) {
        const x0 = -28 + k * 19;
        const x1 = x0 + 17.4;
        box(rt, tint, livery, x0, x1, 0.9, 4.2, -1.4, 1.4);
        // The window stripe, both sides, which is what makes it read as
        // carriages rather than as containers.
        put.face(rt, tint(C.glass), [x0 + 1, 2.5, 1.45, x1 - 1, 2.5, 1.45,
          x1 - 1, 3.6, 1.45, x0 + 1, 3.6, 1.45]);
        put.face(rt, tint(shade(C.glass, 0.7)), [x1 - 1, 2.5, -1.45, x0 + 1, 2.5, -1.45,
          x0 + 1, 3.6, -1.45, x1 - 1, 3.6, -1.45]);
        // Bogies.
        put.face(rt, tint(C.tyre), [x0 + 2, 0.2, -1.45, x0 + 5, 0.2, -1.45,
          x0 + 5, 0.9, -1.45, x0 + 2, 0.9, -1.45]);
        put.face(rt, tint(C.tyre), [x1 - 5, 0.2, -1.45, x1 - 2, 0.2, -1.45,
          x1 - 2, 0.9, -1.45, x1 - 5, 0.9, -1.45]);
      }
      break;
    }
    /**
     * The Strip, as silhouettes.
     *
     * Seven of them, and every one is a shape rather than a building: at three
     * hundred and thirty km/h with fog on everything past a kilometre, what you
     * recognise is an outline. A tower with a pod on it is the Strat and nothing
     * else is; a lattice pyramid is the Eiffel; a square campanile is the
     * Venetian; turrets are Excalibur.
     *
     * Placed where they are. The four that stand beside the circuit - Palazzo,
     * Venetian, Caesars and the Eiffel - are within two hundred metres of the
     * road, and the four that do not are on the skyline in the direction they
     * are actually in: the Strat two and a half kilometres north, MGM, Excalibur
     * and Mandalay Bay away down the Strip to the south.
     */
    case 'strat': {
      const pale = shade(C.chrome, 1.05);
      // The shaft, three sided and tapering, which is what makes it read from
      // any angle without being a box.
      box(rt, tint, pale, -9, 9, 0, 240, -9, 9);
      box(rt, tint, shade(pale, 0.9), -6, 6, 240, 268, -6, 6);
      // The pod.
      box(rt, tint, shade(C.chrome, 1.15), -17, 17, 268, 292, -17, 17);
      put.face(rt, tint(C.glass), [-16, 274, -17.5, 16, 274, -17.5, 16, 286, -17.5, -16, 286, -17.5]);
      put.face(rt, tint(C.glass), [16, 274, 17.5, -16, 274, 17.5, -16, 286, 17.5, 16, 286, 17.5]);
      // And the mast on top, which is most of the height.
      put.face(rt, tint(pale), [-2, 292, 0, 2, 292, 0, 0.6, 350, 0, -0.6, 350, 0]);
      put.face(rt, tint(shade(pale, 0.8)), [0, 292, -2, 0, 292, 2, 0, 350, 0.6, 0, 350, -0.6]);
      break;
    }
    /** Paris: the tower, at half of the one in Paris, which is what it is. */
    case 'eiffel': {
      const iron = shade(theme.ridge, 0.7);
      const dark = tint(shade(iron, 0.72));
      const lit = tint(iron);
      // Four legs meeting twice, drawn as two crossed silhouettes so it is a
      // lattice from every side and eight faces in total.
      for (const turn of [0, Math.PI / 2]) {
        const c = Math.cos(turn);
        const sn = Math.sin(turn);
        const at = (x, y) => [x * c, y, -x * sn];
        const shade2 = turn ? dark : lit;
        // Legs to the first platform, then the shaft, then the spire.
        put.face(rt, shade2, [...at(-26, 0), ...at(-16, 0), ...at(-6, 62), ...at(-9, 62)]);
        put.face(rt, shade2, [...at(16, 0), ...at(26, 0), ...at(9, 62), ...at(6, 62)]);
        put.face(rt, shade2, [...at(-9, 62), ...at(9, 62), ...at(4, 128), ...at(-4, 128)]);
        put.face(rt, shade2, [...at(-3, 128), ...at(3, 128), ...at(0.8, 165), ...at(-0.8, 165)]);
      }
      // The two platforms, which are the thing that says Eiffel rather than
      // pylon.
      put.face(rt, lit, [-12, 62, -12, 12, 62, -12, 12, 62, 12, -12, 62, 12]);
      put.face(rt, lit, [-6, 128, -6, 6, 128, -6, 6, 128, 6, -6, 128, 6]);
      break;
    }
    /** The Venetian's campanile: a square tower with a pyramid on it. */
    case 'campanile': {
      const brick = shade(C.board, 0.62);
      box(rt, tint, brick, -8, 8, 0, 76, -8, 8);
      box(rt, tint, shade(brick, 1.1), -10, 10, 76, 88, -10, 10);
      // The roof, four faces to a point.
      for (const [ax, az] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        put.face(rt, tint(shade(C.chrome, ax || az ? 0.95 : 1)),
          [ax * 10 - az * 10, 88, az * 10 + ax * 10, ax * 10 + az * 10, 88, az * 10 - ax * 10,
            0, 112, 0]);
      }
      break;
    }
    /** Excalibur: white walls and turrets with coloured cones on them. */
    case 'castle': {
      const wall = shade(C.chrome, 1.12);
      box(rt, tint, wall, -46, 46, 0, 34, -20, 20);
      for (const [tx, high, cone] of [[-46, 52, 0xffd23b2e], [-16, 44, 0xff2f6fd0],
        [16, 44, 0xff2f6fd0], [46, 52, 0xffd23b2e]]) {
        box(rt, tint, wall, tx - 8, tx + 8, 0, high, -8, 8);
        for (const [ax, az] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          put.face(rt, tint(shade(cone, ax > 0 || az > 0 ? 1 : 0.82)),
            [tx + ax * 9 - az * 9, high, az * 9 + ax * 9, tx + ax * 9 + az * 9, high,
              az * 9 - ax * 9, tx, high + 22, 0]);
        }
      }
      break;
    }
    /** Mandalay and the MGM: one big coloured slab, which is what they are. */
    case 'slab': {
      const paint = prop.paint !== undefined
        ? TEAM_COLOURS[prop.paint % TEAM_COLOURS.length].body
        : shade(C.board, 0.9);
      const high = 60 + (prop.s || 1) * 60;
      box(rt, tint, paint, -60, 60, 0, high, -26, 26);
      // Window bands, which is the only thing that gives a slab a size.
      for (let y = 12; y < high - 8; y += 14) {
        put.face(rt, tint(C.glass), [-56, y, -26.5, 56, y, -26.5, 56, y + 6, -26.5, -56, y + 6, -26.5]);
      }
      break;
    }
    /** Caesars: low, wide, and colonnaded. */
    case 'colonnade': {
      const stone = shade(C.chrome, 1.16);
      box(rt, tint, stone, -54, 54, 0, 40, -22, 22);
      box(rt, tint, shade(stone, 0.94), -30, 30, 40, 58, -18, 18);
      for (let k = -5; k <= 5; k++) {
        put.face(rt, tint(shade(stone, 0.86)),
          [k * 9 - 2, 0, -23, k * 9 + 2, 0, -23, k * 9 + 2, 30, -23, k * 9 - 2, 30, -23]);
      }
      put.face(rt, tint(stone), [-56, 30, -24, 56, 30, -24, 56, 36, -24, -56, 36, -24]);
      break;
    }
    /**
     * The sign out front, which on this road is half the point of the place.
     *
     * A pylon and a lit board, in the hotel's own colour. They are the thing you
     * actually read at speed - the buildings are behind their own forecourts and
     * the signs are on the pavement.
     */
    case 'marquee': {
      const paint = prop.paint !== undefined
        ? TEAM_COLOURS[prop.paint % TEAM_COLOURS.length].body
        : C.board;
      const post = tint(shade(C.metal, 0.8));
      put.face(rt, post, [-1.6, 0, 0, 1.6, 0, 0, 1.6, 15, 0, -1.6, 15, 0]);
      box(rt, tint, paint, -7, 7, 15, 33, -1.2, 1.2);
      // A bright panel on the face, so it reads as lit rather than as a wall.
      put.face(rt, tint(shade(C.chrome, 1.25)),
        [-5.6, 18, -1.4, 5.6, 18, -1.4, 5.6, 30, -1.4, -5.6, 30, -1.4]);
      put.face(rt, tint(shade(paint, 1.2)),
        [5.6, 18, 1.4, -5.6, 18, 1.4, -5.6, 30, 1.4, 5.6, 30, 1.4]);
      break;
    }
    /**
     * The fountains, which are the one thing on the Strip everybody knows.
     *
     * A dark pool and a fan of jets, and the jets are the whole of it: they
     * climb and fall on their own timings, so no two of them are at the same
     * height and the shape is never the same twice. Drawn with the stipple, so
     * they are spray rather than columns and the hotel behind shows through
     * them.
     *
     * The lake is measured - it is in the map, and the Bellagio's own footprint
     * is one of the buildings standing beside this circuit. What is invented is
     * the water going up.
     */
    case 'fountain': {
      const pool = tint(shade(theme.water, 0.9));
      const lit = tint(shade(theme.water, 1.2));
      // The basin, long across the view because that is how it is seen.
      put.face(rt, pool, [-46, 0.2, -22, 46, 0.2, -22, 46, 0.2, 22, -46, 0.2, 22]);
      put.face(rt, lit, [-46, 0.25, -4, 46, 0.25, -4, 46, 0.25, 4, -46, 0.25, 4]);
      const white = tint(shade(C.chrome, 1.3));
      rt.stipple = 1;
      for (let k = 0; k < 11; k++) {
        const at = -40 + k * 8;
        // Each jet on its own clock, so the fan breathes rather than pulses.
        const beat = Math.sin(time * 0.021 + k * 1.7) * 0.5 + 0.5;
        const high = 6 + beat * beat * 34 * (1 - Math.abs(k - 5) / 9);
        const wide = 0.8 + beat * 1.4;
        put.face(rt, white, [at - wide, 0.3, 0, at + wide, 0.3, 0,
          at + wide * 0.35, high, 0, at - wide * 0.35, high, 0]);
        put.face(rt, white, [at - wide, 0.3, -wide, at - wide, 0.3, wide,
          at - wide * 0.35, high, wide * 0.35, at - wide * 0.35, high, -wide * 0.35]);
      }
      rt.stipple = 0;
      break;
    }
    /**
     * A recovery crane, behind the barrier on the outside of a corner.
     *
     * There is one of these at every place an F1 car is likely to end up, and
     * they are half the reason a run-off area looks the way it does on
     * television: a yellow lorry with a lattice boom over the fence and a hook
     * hanging off it, sitting there all weekend doing nothing until it is the
     * only thing anybody is looking at.
     *
     * Built with the boom reaching towards the track - local +z - so that
     * standing it on the outside of the bend points it at the road.
     */
    case 'crane': {
      const yellow = shade(C.board, 1.0);
      const dark = shade(C.metal, 0.7);
      // Built the way a marker post's arm is: length along the track, which is
      // local z, and the boom reaching towards local -x, which is the track's
      // left. So a crane on the right of the road is placed as drawn and one on
      // the left is turned round. Built the other way about - carrier across the
      // road, boom pointing down it - it parked in the run-off sideways and
      // waved its jib at the scenery.
      box(rt, tint, yellow, -1.4, 1.4, 1.0, 2.1, -4.6, 3.4);
      box(rt, tint, yellow, -1.3, 1.3, 2.1, 3.9, 2.0, 4.4);
      put.face(rt, tint(C.glass), [-1.35, 2.6, 3.4, -1.35, 2.6, 4.4, -1.35, 3.6, 4.4, -1.35, 3.6, 3.4]);
      for (const wz of [-4.0, -2.2, 2.6]) {
        put.face(rt, tint(C.tyre), [-1.45, 0.1, wz, -1.45, 0.1, wz + 1.3,
          -1.45, 1.1, wz + 1.3, -1.45, 1.1, wz]);
        put.face(rt, tint(C.tyre), [1.45, 0.1, wz + 1.3, 1.45, 0.1, wz,
          1.45, 1.1, wz, 1.45, 1.1, wz + 1.3]);
      }
      // Outriggers, down and planted, which is how one of these actually stands.
      for (const oz of [-3.4, 1.6]) {
        put.face(rt, tint(dark), [-2.6, 0.9, oz, -2.6, 0.9, oz + 0.5, 1.4, 1.3, oz + 0.5, 1.4, 1.3, oz]);
        put.face(rt, tint(dark), [2.6, 0.9, oz, 2.6, 0.9, oz + 0.5, -1.4, 1.3, oz + 0.5, -1.4, 1.3, oz]);
      }
      // The turntable, and the boom off it. Three faces - two sides and a top -
      // so it is a beam from every angle: as two thin plates it vanished
      // whenever you were level with it, which beside a track is most of the
      // time.
      box(rt, tint, shade(yellow, 0.9), -1.1, 1.1, 2.1, 3.3, -2.6, -0.4);
      const tipX = -9.2;
      const tipY = 12.4;
      const lit = tint(shade(yellow, 1.06));
      const shadow = tint(shade(yellow, 0.74));
      // Near side, far side, and the top edge between them.
      put.face(rt, lit, [-0.6, 3.2, -1.9, -0.6, 3.2, -1.1, tipX, tipY, -1.4, tipX, tipY, -1.7]);
      put.face(rt, shadow, [0.6, 3.2, -1.1, 0.6, 3.2, -1.9, tipX, tipY, -1.7, tipX, tipY, -1.4]);
      put.face(rt, tint(yellow), [-0.6, 3.2, -1.9, 0.6, 3.2, -1.9, tipX, tipY, -1.7, tipX, tipY, -1.4]);
      // The cable and the hook, hanging where the boom ends.
      put.face(rt, tint(dark),
        [tipX, tipY, -1.7, tipX, tipY, -1.4, tipX, tipY - 4.6, -1.4, tipX, tipY - 4.6, -1.7]);
      put.face(rt, tint(shade(C.metal, 1.1)),
        [tipX - 0.3, tipY - 4.6, -1.85, tipX - 0.3, tipY - 4.6, -1.25,
          tipX - 0.3, tipY - 5.5, -1.25, tipX - 0.3, tipY - 5.5, -1.85]);
      break;
    }
    /**
     * A team transporter: cab, trailer, and the team's colour down the side.
     *
     * What is actually behind a pit building on a race weekend is forty of
     * these in a row, and a paddock without them looks like a car park on a
     * Tuesday.
     */
    case 'lorry': {
      const paint = TEAM_COLOURS[((prop.paint ?? prop.i ?? 0) * 5) % TEAM_COLOURS.length].body;
      // White, because a transporter is. Left at plain chrome the only face you
      // ever see from the track is the shaded one, and a row of them read as a
      // row of dark boxes.
      const shell = shade(C.chrome, 1.24);
      box(rt, tint, shell, -6.5, 2.5, 1.1, 4.6, -1.3, 1.3);
      box(rt, tint, paint, 2.5, 6.5, 0.8, 3.6, -1.25, 1.25);
      put.face(rt, tint(C.glass), [5.6, 2.4, -1.3, 6.5, 2.4, -1.3, 6.5, 3.5, -1.3, 5.6, 3.5, -1.3]);
      // The team's colour down both sides of the trailer, deep enough to be the
      // thing you see rather than a pinstripe.
      put.face(rt, tint(paint),
        [-6.2, 2.2, 1.35, 2.2, 2.2, 1.35, 2.2, 4.2, 1.35, -6.2, 4.2, 1.35]);
      put.face(rt, tint(shade(paint, 0.8)),
        [2.2, 2.2, -1.35, -6.2, 2.2, -1.35, -6.2, 4.2, -1.35, 2.2, 4.2, -1.35]);
      for (const wx of [-5.2, -3.4, 4.4]) {
        put.face(rt, tint(C.tyre), [wx, 0.2, -1.35, wx + 1.4, 0.2, -1.35,
          wx + 1.4, 1.2, -1.35, wx, 1.2, -1.35]);
        put.face(rt, tint(C.tyre), [wx + 1.4, 0.2, 1.35, wx, 0.2, 1.35,
          wx, 1.2, 1.35, wx + 1.4, 1.2, 1.35]);
      }
      break;
    }
    /** A beach pavilion: a flat-roofed box on legs with a deck in front of it. */
    case 'pavilion': {
      box(rt, tint, C.chrome, -5, 5, 1.2, 4.2, -3, 3);
      put.face(rt, tint(shade(C.chrome, 1.06)),
        [-5.8, 4.2, -3.6, 5.8, 4.2, -3.6, 5.8, 4.2, 3.6, -5.8, 4.2, 3.6]);
      // The deck, out towards the water.
      put.face(rt, tint(theme.trunk), [-5, 1.2, -3, 5, 1.2, -3, 5, 1.2, -7, -5, 1.2, -7]);
      put.face(rt, tint(C.glass), [-4.4, 1.8, -3.1, 4.4, 1.8, -3.1, 4.4, 3.6, -3.1, -4.4, 3.6, -3.1]);
      break;
    }
    /**
     * A wind turbine, out on the horizon off Zandvoort. Three hundred metres
     * away and forty metres tall, so it is a mast and three blades and that is
     * the whole of it. Turning, because a still one reads as broken.
     */
    case 'turbine': {
      const white = tint(shade(C.chrome, 1.1));
      const spin = time * 0.012 + (prop.off || 0);
      put.face(rt, white, [-0.5, 0, 0, 0.5, 0, 0, 0.28, 17, 0, -0.28, 17, 0]);
      for (let k = 0; k < 3; k++) {
        const a2 = spin + (k / 3) * Math.PI * 2;
        const sx = Math.cos(a2);
        const sy = Math.sin(a2);
        put.face(rt, white, [
          0, 17.4, -0.35,
          sx * 9 - sy * 0.5, 17.4 + sy * 9 + sx * 0.5, -0.35,
          sx * 9 + sy * 0.5, 17.4 + sy * 9 - sx * 0.5, -0.35,
        ]);
      }
      break;
    }
    /**
     * A section of the old banked oval at Monza.
     *
     * Concrete, thirty degrees, and falling apart in the trees along the
     * Serraglio, which is exactly what is there: they stopped racing on it in
     * nineteen sixty-one and never took it down. Three of these in a row and you
     * get the curve arriving and leaving, which is how you see it from the road.
     */
    case 'banking': {
      const face = tint(shade(C.chrome, 0.72));
      const top = tint(shade(C.chrome, 0.86));
      const under = tint(shade(C.shadow, 1.3));
      // The banked surface: a long quad leaning back at about thirty degrees.
      put.face(rt, face, [-14, 0, 0, 14, 0, 0, 14, 7.4, -8.6, -14, 7.4, -8.6]);
      // The lip along the top, and the dark underside of the structure.
      put.face(rt, top, [-14, 7.4, -8.6, 14, 7.4, -8.6, 14, 8.1, -9.4, -14, 8.1, -9.4]);
      put.face(rt, under, [14, 0, 0, -14, 0, 0, -14, 8.1, -9.4, 14, 8.1, -9.4]);
      break;
    }
    /**
     * The underside of the flyover, seen from the road going under it.
     *
     * Drawn where the other half of the circuit crosses, at the angle it
     * crosses at, and only from below - from above you are driving on the deck
     * itself and the renderer builds that out of the road. Deliberately deep and
     * dark: what you get at Suzuka is a slab of shadow arriving overhead at
     * three hundred, and the shadow is the whole effect.
     */
    case 'flyover': {
      const deck = tint(shade(C.chrome, 0.6));
      const under = tint(shade(C.shadow, 1.15));
      const pier = tint(shade(C.chrome, 0.78));
      const W = 34;    // half the length of the span, across the road below
      const D = 7.6;   // half the width of the deck itself
      // The underside, and the two fascias hanging below it.
      put.face(rt, under, [-W, 0, -D, W, 0, -D, W, 0, D, -W, 0, D]);
      put.face(rt, deck, [-W, 0, -D, W, 0, -D, W, 2.6, -D, -W, 2.6, -D]);
      put.face(rt, deck, [W, 0, D, -W, 0, D, -W, 2.6, D, W, 2.6, D]);
      // The parapet along each edge, which is what you see against the sky.
      put.face(rt, pier, [-W, 2.6, -D, W, 2.6, -D, W, 3.5, -D, -W, 3.5, -D]);
      put.face(rt, pier, [W, 2.6, D, -W, 2.6, D, -W, 3.5, D, W, 3.5, D]);
      // Two piers, well clear of the road underneath.
      for (const at of [-25, 25]) {
        put.face(rt, pier, [at - 2.4, 0, -D, at + 2.4, 0, -D,
          at + 2.4, -60, -D, at - 2.4, -60, -D]);
        put.face(rt, under, [at + 2.4, 0, D, at - 2.4, 0, D,
          at - 2.4, -60, D, at + 2.4, -60, D]);
      }
      break;
    }
    /**
     * A corner board: chevrons on a panel, on two legs, facing back up the road.
     *
     * One chevron for a corner you lift for, three for one that needs the
     * brakes, which is the convention every rally and half the circuits in the
     * world already use - so it needs no explaining, and it is readable at the
     * distance where reading it is still worth something.
     *
     * Built in the local x-y plane, so with the track's heading it stands square
     * across the road and faces whoever is arriving.
     */
    case 'sign': {
      const bend = prop.bend || 1;
      const count = Math.max(1, Math.min(3, prop.sharp || 1));
      const leg = tint(shade(C.metal, 0.8));
      const face = tint(count >= 3 ? C.boardHard : C.board);
      const mark = tint(C.boardMark);
      const back = tint(shade(C.metal, 0.55));
      const W = 2.9;
      const y0 = 1.9;
      const y1 = 4.5;
      for (const at of [-W * 0.62, W * 0.62]) {
        put.face(rt, leg, [at - 0.14, 0, 0, at + 0.14, 0, 0, at + 0.14, y0, 0, at - 0.14, y0, 0]);
      }
      // The panel, and its back, so it is a board rather than a hole in the air
      // when you look at it from the far side of the corner.
      put.face(rt, back, [W, y0, 0.09, -W, y0, 0.09, -W, y1, 0.09, W, y1, 0.09]);
      put.face(rt, face, [-W, y0, 0, W, y0, 0, W, y1, 0, -W, y1, 0]);
      // The chevrons, pointing the way the road goes.
      const mid = (y0 + y1) / 2;
      const tall = (y1 - y0) * 0.34;
      const wide = 0.62;
      const step = 1.55;
      const left = -((count - 1) * step) / 2;
      for (let c = 0; c < count; c++) {
        const cx = left + c * step;
        // A filled arrowhead: tip on the bend's side, two tails behind it, and a
        // notch cut out of the back so it reads as a chevron and not a triangle.
        put.face(rt, mark, [
          cx + bend * wide, mid, -0.02,
          cx - bend * wide * 0.55, mid + tall, -0.02,
          cx - bend * wide * 0.05, mid + tall, -0.02,
          cx + bend * wide * 1.5, mid, -0.02,
          cx - bend * wide * 0.05, mid - tall, -0.02,
          cx - bend * wide * 0.55, mid - tall, -0.02,
        ]);
      }
      break;
    }
    /**
     * A building, at the size the map says it is.
     *
     * Not a `block`, which is a box of a fixed shape scattered by rule. This one
     * is handed a width, a depth and a height taken off OpenStreetMap - so a
     * hotel on the front at Monaco is a hotel-sized building and the thing next
     * to it is whatever that is. Windows are a single darker band rather than a
     * grid: at this resolution a grid is noise, and one band reads as glazing
     * from two hundred metres, which is where these are seen from.
     */
    case 'tower': {
      const w = (prop.w || 10) / 2;
      const d = (prop.d || 10) / 2;
      const h = prop.h || 9;
      // Warmer or cooler by the building, so a street is not one colour.
      const shift = 0.86 + ((prop.w * 7 + prop.h * 13) % 9) * 0.035;
      box(rt, tint, shade(theme.ridge, shift), -w, w, 0, h, -d, d);
      if (h > 7) {
        const glass = tint(shade(C.glass, night > 0.4 ? 1.5 : 0.95));
        for (let floor = 1; floor * 6 < h - 3; floor++) {
          const y = floor * 6;
          put.face(rt, glass, [-w * 0.86, y, -d - 0.05, w * 0.86, y, -d - 0.05,
            w * 0.86, y + 2.2, -d - 0.05, -w * 0.86, y + 2.2, -d - 0.05]);
          put.face(rt, glass, [w * 0.86, y, d + 0.05, -w * 0.86, y, d + 0.05,
            -w * 0.86, y + 2.2, d + 0.05, w * 0.86, y + 2.2, d + 0.05]);
        }
      }
      break;
    }
    case 'rock':
    case 'crag': {
      const lit = tint(theme.rock);
      const dark = tint(shade(theme.rock, 0.66));
      const side = tint(shade(theme.rock, 0.82));
      const h = prop.kind === 'crag' ? 3.4 : 1.5;
      put.face(rt, lit, [0, h, 0, -1, 0, 1, 1, 0, 1]);
      put.face(rt, side, [0, h, 0, 1, 0, 1, 1.1, 0, -0.9]);
      put.face(rt, dark, [0, h, 0, 1.1, 0, -0.9, -1, 0, -1]);
      put.face(rt, side, [0, h, 0, -1, 0, -1, -1, 0, 1]);
      break;
    }
    case 'mast': {
      // A floodlight on a pole, leaning out over the track. Two faces of pole,
      // an arm and a head - and after dark the head is not tinted at all,
      // because a lamp is a lamp and the whole reason it is there is that the
      // rest of the world has gone dark around it.
      const steel = tint(C.metal);
      const dark = tint(shade(C.metal, 0.7));
      put.face(rt, steel, [-0.24, 0, 0, 0.24, 0, 0, 0.18, 11, 0, -0.18, 11, 0]);
      put.face(rt, dark, [0, 0, -0.24, 0, 0, 0.24, 0, 11, 0.18, 0, 11, -0.18]);
      put.face(rt, steel, [-0.16, 10.5, 0, -0.16, 11, 0, -3.4, 11.6, 0, -3.4, 11.2, 0]);
      const lit = night > 0.03;
      const lamp = lit ? C.lamp : tint(shade(C.chrome, 0.9));
      put.face(rt, lamp, [-4.1, 10.9, -0.5, -2.9, 10.9, -0.5, -2.9, 11.5, -0.5, -4.1, 11.5, -0.5]);
      put.face(rt, lamp, [-2.9, 10.9, 0.5, -4.1, 10.9, 0.5, -4.1, 11.5, 0.5, -2.9, 11.5, 0.5]);
      put.face(rt, lit ? C.lamp : tint(C.chrome),
        [-4.1, 10.85, -0.5, -2.9, 10.85, -0.5, -2.9, 10.85, 0.5, -4.1, 10.85, 0.5]);
      break;
    }
    case 'post':
      // A distance marker. Two faces, and between them they are worth more to
      // the feeling of speed than anything else in this file.
      put.face(rt, tint(C.kerbB), [-0.13, 0, 0, 0.13, 0, 0, 0.13, 1.15, 0, -0.13, 1.15, 0]);
      put.face(rt, tint(C.kerbA), [-0.13, 0.78, 0.01, 0.13, 0.78, 0.01,
        0.13, 1.06, 0.01, -0.13, 1.06, 0.01]);
      break;
    case 'stand': {
      /**
       * A grandstand: long along the track, facing across it, and full of people.
       *
       * It was a sloped plate with a stripe painted across it, and the comment
       * here used to explain why: at this size a crowd is a texture, there are no
       * textures, so a crowd is a stripe. Both halves of that were true of a
       * renderer that filled every triangle by hand. A grandstand is thirty
       * metres of the picture at every corner on sixteen of these circuits, and a
       * stripe is what it looked like.
       *
       * So it is terraced now: eight rows, each with a tread and a riser, and the
       * risers carry the people. The people are blocks - six to a row, each a
       * different shade off the same hash, so no two rows repeat - and at forty
       * metres that is a crowd, at two hundred it is a texture, and up close it is
       * still not people but it is seating with something in it.
       *
       * A hundred and thirty triangles against twenty. Everything still meets
       * something else: back wall to roof, roof to posts, posts to fascia, treads
       * to risers. Nothing is left over on its own, which was the thing that made
       * the old one read as flat plates hanging in the air.
       */
      const wall = tint(shade(theme.ridge, 0.72));
      const side = tint(shade(theme.ridge, 0.6));
      const deck = tint(shade(theme.ridge, 0.94));
      const ROWS = 8;
      const back = -4.6;
      const front = -0.6;
      const low = 1.1;
      const high = 6.4;

      // The terracing, from the front row back and up.
      for (let r = 0; r < ROWS; r++) {
        const t0 = r / ROWS;
        const t1 = (r + 1) / ROWS;
        const z0 = front + (back - front) * t0;
        const z1 = front + (back - front) * t1;
        const y0 = low + (high - low) * t0;
        const y1 = low + (high - low) * t1;
        // The tread you sit on, and the riser behind it.
        put.face(rt, deck, [-9, y0, z0, 9, y0, z0, 9, y0, z1, -9, y0, z1]);
        put.face(rt, side, [-9, y0, z1, 9, y0, z1, 9, y1, z1, -9, y1, z1]);
        /**
         * And the people on it.
         *
         * Six blocks to a row rather than one strip, each picked out of the
         * crowd colour by a hash of where it is. A single colour across the whole
         * stand reads as a painted band; six that differ by a tenth read as a
         * crowd, and the difference costs twelve triangles a row.
         */
        for (let c = 0; c < 6; c++) {
          const x0 = -8.6 + c * (17.2 / 6) + 0.1;
          const x1 = x0 + (17.2 / 6) - 0.2;
          // A cheap deterministic scatter: the same stand looks the same every
          // lap, and two stands next to each other do not look like each other.
          // Two numbers that share no factor with the palette length, so the
          // pattern does not line up into stripes down the stand.
          const h = (r * 5 + c * 3) % CROWD.length;
          const who = shade(CROWD[h], 0.88 + ((r * 3 + c * 7) % 5) * 0.06);
          // In front of the riser, not behind it. The stand is built going away
          // from the track, so the row behind is at a smaller z - and a crowd
          // placed a a few centimetres further back is a crowd inside the
          // concrete, which is exactly where the first pass put it.
          const face = z1 + 0.06;
          put.face(rt, tint(who), [x0, y0 + 0.12, face, x1, y0 + 0.12, face,
            x1, y1 - 0.12, face, x0, y1 - 0.12, face]);
        }
      }

      // The shell round it: back wall, front fascia, two ends and a roof on posts.
      put.face(rt, wall, [-9, 0, back - 0.4, 9, 0, back - 0.4,
        9, 8.4, back - 0.4, -9, 8.4, back - 0.4]);
      put.face(rt, wall, [-9, 0, front, 9, 0, front, 9, low, front, -9, low, front]);
      put.face(rt, side, [-9, 0, front, -9, 0, back - 0.4, -9, 7.4, back - 0.4, -9, low, front]);
      put.face(rt, side, [9, 0, back - 0.4, 9, 0, front, 9, low, front, 9, 7.4, back - 0.4]);
      put.face(rt, tint(C.metal), [-9.4, 8.4, back - 0.6, 9.4, 8.4, back - 0.6,
        9.4, 7.6, 0.8, -9.4, 7.6, 0.8]);
      // Four posts rather than two: a roof this wide on two legs is a canopy.
      for (const at of [-8.6, -3, 3, 8.6]) {
        put.face(rt, side, [at - 0.22, 1, 0.4, at + 0.22, 1, 0.4,
          at + 0.22, 7.7, 0.6, at - 0.22, 7.7, 0.6]);
      }
      break;
    }
    case 'block':
      box(rt, tint, theme.ridge, -3.4, 3.4, 0, 5.5, -3.4, 3.4);
      put.face(rt, tint(C.glass), [-3.0, 2.0, -3.45, 3.0, 2.0, -3.45,
        3.0, 3.2, -3.45, -3.0, 3.2, -3.45]);
      break;
    case 'boat': {
      const hull = tint(C.kerbB);
      const deep = tint(shade(C.kerbB, 0.7));
      const cab = tint(C.kerbA);
      put.face(rt, hull, [-3.2, 0, 0, 3.2, 0, 0, 2.4, 1.1, 0, -2.4, 1.1, 0]);
      put.face(rt, deep, [-3.2, 0, 0, -2.4, 1.1, 0, -2.4, 1.1, -1.4, -3.2, 0, -1.4]);
      put.face(rt, cab, [-0.9, 1.1, 0, 0.9, 1.1, 0, 0.9, 2.1, 0, -0.9, 2.1, 0]);
      put.face(rt, tint(C.chrome), [0.1, 2.1, 0, 0.3, 2.1, 0, 0.3, 4.6, 0, 0.1, 4.6, 0]);
      break;
    }
    case 'buoy':
      put.face(rt, tint(C.kerbA), [0, 1.5, 0, -0.5, 0, 0.5, 0.5, 0, 0.5]);
      put.face(rt, tint(shade(C.kerbA, 0.7)), [0, 1.5, 0, 0.5, 0, 0.5, 0, 0, -0.6]);
      break;
    case 'bridge': {
      // The red bridge, which is the one piece of scenery in this whole file
      // that exists because of another game. A crossing over the track with a
      // deck you go under and a truss you can see the sky through: at this size
      // it is a red band and two legs, and that is all it ever needs to be.
      const red = tint(C.kerbA);
      const dark = tint(shade(C.kerbA, 0.62));
      box(rt, tint, C.kerbA, -23, -18, 0, 9.5, -1.6, 1.6);
      box(rt, tint, C.kerbA, 18, 23, 0, 9.5, -1.6, 1.6);
      put.face(rt, red, [-23, 9.5, -1.6, 23, 9.5, -1.6, 23, 12.2, -1.6, -23, 12.2, -1.6]);
      put.face(rt, dark, [23, 9.5, 1.6, -23, 9.5, 1.6, -23, 12.2, 1.6, 23, 12.2, 1.6]);
      put.face(rt, tint(shade(C.kerbA, 0.8)), [-23, 12.2, -1.6, 23, 12.2, -1.6,
        23, 12.2, 1.6, -23, 12.2, 1.6]);
      // The truss: five diagonals, which is what makes it a bridge rather than a
      // wall with a hole under it.
      for (let k = -4; k <= 4; k += 2) {
        const at = k * 5;
        put.face(rt, dark, [at - 0.5, 9.6, -1.7, at + 4.5, 12.1, -1.7,
          at + 5.5, 12.1, -1.7, at + 0.5, 9.6, -1.7]);
      }
      break;
    }
    case 'balloon': {
      // Two flat six-sided outlines crossed at right angles, a basket, and two
      // ropes. From any direction one of them is face on and the other is edge
      // on, which is the same trick the pine trees use and works just as well
      // for something round.
      const hot = [C.kerbA, C.hot, C.kerbB];
      for (const [turnBy, shadeBy] of [[0, 1], [Math.PI / 2, 0.78]]) {
        put.set(x, y, z, facing + turnBy, 0, prop.s || 1);
        for (let band = 0; band < 3; band++) {
          const top = 12 - band * 3.4;
          const bot = 12 - (band + 1) * 3.4;
          const wide = (h) => 4.6 * Math.sin(Math.max(0.12, Math.min(Math.PI - 0.12,
            ((h - 1.6) / 10.8) * Math.PI)));
          const wt = wide(top);
          const wb = wide(bot);
          put.face(rt, tint(shade(hot[band % 3], shadeBy)),
            [-wb, bot, 0, wb, bot, 0, wt, top, 0, -wt, top, 0]);
        }
      }
      put.set(x, y, z, facing, 0, prop.s || 1);
      put.face(rt, tint(C.trunk || C.tyre), [-1, 0, 0, 1, 0, 0, 1, 1.6, 0, -1, 1.6, 0]);
      put.face(rt, tint(C.metal), [-1.3, 1.6, 0, -1.1, 1.6, 0, -0.7, 4.2, 0, -0.9, 4.2, 0]);
      put.face(rt, tint(C.metal), [1.1, 1.6, 0, 1.3, 1.6, 0, 0.9, 4.2, 0, 0.7, 4.2, 0]);
      break;
    }
    case 'chopper': {
      // Hanging over the circuit with a camera in it. The rotor is two thin
      // quads turning, which at sixty frames a second is a blur of exactly the
      // right kind.
      box(rt, tint, C.kerbB, -1.1, 1.1, -0.9, 0.9, -1.6, 1.8);
      put.face(rt, tint(C.glass), [-0.9, -0.6, 1.85, 0.9, -0.6, 1.85,
        0.7, 0.7, 1.5, -0.7, 0.7, 1.5]);
      put.face(rt, tint(C.metal), [-0.22, -0.1, -1.6, 0.22, -0.1, -1.6,
        0.22, 0.35, -5.4, -0.22, 0.35, -5.4]);
      put.face(rt, tint(C.kerbA), [-0.1, 0.35, -5.4, 0.1, 0.35, -5.4,
        0.1, 1.6, -5.0, -0.1, 1.6, -5.0]);
      for (const off of [0, Math.PI / 2]) {
        put.set(x, y + 1.1 * (prop.s || 1), z, facing + time * 0.55 + off, 0, prop.s || 1);
        put.face(rt, tint(C.metal), [-0.18, 0, -5.6, 0.18, 0, -5.6,
          0.18, 0, 5.6, -0.18, 0, 5.6]);
      }
      break;
    }
    case 'wheel': {
      // The big wheel. Twelve spokes, twelve cabins and a rim in twelve
      // straight pieces, turning slowly - which is the only thing in the world
      // that moves without a car in it, and is worth the thirty-six polygons for
      // that alone.
      const R = 11;
      const spin = time * 0.006 + (prop.r || 0);
      const rim = tint(C.metal);
      const leg = tint(shade(C.metal, 0.72));
      const hub = 12;
      put.face(rt, leg, [-3.4, 0, 0.6, -0.5, hub, 0.6, 0.5, hub, 0.6, 3.4, 0, 0.6]);
      put.face(rt, shade(leg, 0.8), [-3.4, 0, -0.6, -0.5, hub, -0.6, 0.5, hub, -0.6, 3.4, 0, -0.6]);
      for (let k = 0; k < 12; k++) {
        const a0 = spin + (k / 12) * Math.PI * 2;
        const a1 = spin + ((k + 1) / 12) * Math.PI * 2;
        const x0 = Math.cos(a0) * R;
        const y0 = Math.sin(a0) * R + hub;
        const x1 = Math.cos(a1) * R;
        const y1 = Math.sin(a1) * R + hub;
        put.face(rt, rim, [x0, y0, -0.25, x1, y1, -0.25, x1, y1, 0.25, x0, y0, 0.25]);
        put.face(rt, leg, [0, hub, 0, x0 * 0.06, y0 * 0.06 + hub * 0.94, 0.12,
          x0, y0, 0.12, x0, y0, -0.12]);
        // A cabin, hanging the right way up however far round it has gone.
        const cab = tint(TEAM_COLOURS[k % TEAM_COLOURS.length].body);
        put.face(rt, cab, [x0 - 0.8, y0 - 1.7, -0.8, x0 + 0.8, y0 - 1.7, -0.8,
          x0 + 0.8, y0 - 0.3, -0.8, x0 - 0.8, y0 - 0.3, -0.8]);
        put.face(rt, shade(cab, 0.75), [x0 + 0.8, y0 - 1.7, 0.8, x0 - 0.8, y0 - 1.7, 0.8,
          x0 - 0.8, y0 - 0.3, 0.8, x0 + 0.8, y0 - 0.3, 0.8]);
      }
      break;
    }
    case 'arch': {
      box(rt, tint, C.metal, -17, -15.6, 0, 7.6, -0.4, 0.4);
      box(rt, tint, C.metal, 15.6, 17, 0, 7.6, -0.4, 0.4);
      put.face(rt, tint(C.kerbA), [-17, 7.6, 0, 17, 7.6, 0, 17, 9.8, 0, -17, 9.8, 0]);
      put.face(rt, tint(C.metal), [-17, 7.4, 0.05, 17, 7.4, 0.05,
        17, 7.6, 0.05, -17, 7.6, 0.05]);
      break;
    }
    default:
      break;
  }
}

/**
 * The dark patch under a car.
 *
 * Twenty polygons of racing car floating a few centimetres above four polygons
 * of tarmac do not look like a car on a track; they look like a car near one.
 * One flat hexagon of shadow fixes it completely, and it is the cheapest thing
 * in the renderer.
 */
export function drawShadow(rt, x, y, z, yaw, wide, long, tint, pitch = 0) {
  put.set(x, y + 0.03, z, yaw, 0, 1, pitch);
  put.face(rt, tint(C.shadow), [
    -wide, 0, -long * 0.6,
    -wide * 0.7, 0, -long,
    wide * 0.7, 0, -long,
    wide, 0, -long * 0.6,
    wide, 0, long * 0.6,
    wide * 0.7, 0, long,
    -wide * 0.7, 0, long,
    -wide, 0, long * 0.6,
  ]);
}

// --- The car -------------------------------------------------------------------

/** Half the track, half the wheelbase, and the size of a tyre. */
const HALF = 0.88;
const AXLE = 1.5;
const TYRE_R = 0.34;
/** How many segments a tyre is made of. Ten is round at any distance that matters. */
const TYRE_SEGS = 10;

/**
 * A wheel, as a wheel.
 *
 * It was two flat quads and a pentagon for a long time: a tread you saw from
 * behind, a disc you saw from the side, and nothing in between. From directly
 * behind that is a tyre; from three quarters on, which is where the camera
 * actually sits, it is a piece of cardboard - and the four wheels standing out
 * in the air are the whole silhouette of an open wheeler, so it is the piece of
 * cardboard you look at for three minutes.
 *
 * Ten segments of tread with a sidewall each side and a rim in the middle. Forty
 * triangles a wheel against four, which is a hundred and sixty against sixteen
 * for a car, and at fifteen thousand triangles a frame that is a rounding error.
 *
 * The normals do the rest: a cylinder made of ten flat faces lit by one sun has
 * a highlight that runs round it, which is what makes it read as round rather
 * than as a decagon.
 */
function wheel(rt, tyre, wall, rim, cx, cz, width, steer = 0) {
  const sin = Math.sin(steer);
  const cos = Math.cos(steer);
  // Steering turns the wheel about its own centre, so the corners are worked out
  // in the wheel's own frame and turned on the way out.
  const put3 = (out, at, ox, oy, oz) => {
    out[at] = cx + ox * cos - oz * sin;
    out[at + 1] = oy;
    out[at + 2] = cz + ox * sin + oz * cos;
  };
  const p = new Float64Array(12);
  for (let i = 0; i < TYRE_SEGS; i++) {
    const a0 = (i / TYRE_SEGS) * Math.PI * 2;
    const a1 = ((i + 1) / TYRE_SEGS) * Math.PI * 2;
    const y0 = TYRE_R + Math.sin(a0) * TYRE_R;
    const z0 = Math.cos(a0) * TYRE_R;
    const y1 = TYRE_R + Math.sin(a1) * TYRE_R;
    const z1 = Math.cos(a1) * TYRE_R;
    // The tread.
    put3(p, 0, -width, y0, z0);
    put3(p, 3, width, y0, z0);
    put3(p, 6, width, y1, z1);
    put3(p, 9, -width, y1, z1);
    put.face(rt, tyre, p);
    // And a sidewall each side, as a fan back to the hub.
    for (const side of [-width, width]) {
      put3(p, 0, side, TYRE_R, 0);
      put3(p, 3, side, y0, z0);
      put3(p, 6, side, y1, z1);
      put.face(rt, wall, p.subarray(0, 9));
    }
  }
  /**
   * The rim: a small disc standing a little proud of the sidewall.
   *
   * Small on purpose. At three fifths of the radius in a bright metal it is not
   * a rim, it is a white wheel - which is what the first pass at this looked
   * like from any distance at all. Two fifths, in something nearer to the colour
   * of a brake drum than to chrome, is a wheel with a rim in it.
   */
  for (const side of [-width - 0.012, width + 0.012]) {
    for (let i = 0; i < TYRE_SEGS; i++) {
      const a0 = (i / TYRE_SEGS) * Math.PI * 2;
      const a1 = ((i + 1) / TYRE_SEGS) * Math.PI * 2;
      put3(p, 0, side, TYRE_R, 0);
      put3(p, 3, side, TYRE_R + Math.sin(a0) * TYRE_R * 0.40, Math.cos(a0) * TYRE_R * 0.40);
      put3(p, 6, side, TYRE_R + Math.sin(a1) * TYRE_R * 0.40, Math.cos(a1) * TYRE_R * 0.40);
      put.face(rt, rim, p.subarray(0, 9));
    }
  }
}

/**
 * A shape lofted along the length of the car.
 *
 * Each station is a rectangle at a distance down the car - how wide, how low,
 * how high - and this joins consecutive ones with four faces. It is how a tub
 * that tapers to a nose and an engine cover that tapers to nothing are written
 * as six numbers each rather than as a dozen polygons with the corners typed out
 * twice.
 */
function loft(rt, colour, stations, { cap = true, at = 0 } = {}) {
  const p = new Float64Array(12);
  const face = (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) => {
    p[0] = at + ax; p[1] = ay; p[2] = az;
    p[3] = at + bx; p[4] = by; p[5] = bz;
    p[6] = at + cx; p[7] = cy; p[8] = cz;
    p[9] = at + dx; p[10] = dy; p[11] = dz;
    put.face(rt, colour, p);
  };
  for (let i = 0; i < stations.length - 1; i++) {
    const a = stations[i];
    const b = stations[i + 1];
    // Top, bottom and the two sides.
    face(-a.hw, a.y1, a.z, a.hw, a.y1, a.z, b.hw, b.y1, b.z, -b.hw, b.y1, b.z);
    face(-a.hw, a.y0, a.z, -b.hw, b.y0, b.z, b.hw, b.y0, b.z, a.hw, a.y0, a.z);
    face(-a.hw, a.y0, a.z, -a.hw, a.y1, a.z, -b.hw, b.y1, b.z, -b.hw, b.y0, b.z);
    face(a.hw, a.y0, a.z, b.hw, b.y0, b.z, b.hw, b.y1, b.z, a.hw, a.y1, a.z);
  }
  if (!cap) return;
  const first = stations[0];
  const last = stations[stations.length - 1];
  face(-first.hw, first.y0, first.z, first.hw, first.y0, first.z,
    first.hw, first.y1, first.z, -first.hw, first.y1, first.z);
  face(last.hw, last.y0, last.z, -last.hw, last.y0, last.z,
    -last.hw, last.y1, last.z, last.hw, last.y1, last.z);
}

/**
 * A wing: a plane with thickness, and an endplate at each end.
 *
 * Written as one thing because there are three of them on the car and they are
 * the same object at three sizes. The plane is given a leading and a trailing
 * edge at different heights, which is what makes it read as an aerofoil from the
 * side rather than as a shelf.
 */
function wingPlane(rt, colour, edge, { hw, zFront, zBack, yFront, yBack, thick, plate }) {
  const p = new Float64Array(12);
  const face = (v) => { p.set(v); put.face(rt, colour, p); };
  // Upper surface, lower surface, and the trailing edge between them.
  face([-hw, yFront, zFront, hw, yFront, zFront, hw, yBack, zBack, -hw, yBack, zBack]);
  face([-hw, yFront - thick, zFront, -hw, yBack - thick, zBack,
    hw, yBack - thick, zBack, hw, yFront - thick, zFront]);
  face([-hw, yBack, zBack, hw, yBack, zBack,
    hw, yBack - thick, zBack, -hw, yBack - thick, zBack]);
  if (!plate) return;
  for (const side of [-1, 1]) {
    const x = side * hw;
    const q = new Float64Array(12);
    q.set([x, plate.y0, plate.z0, x, plate.y1, plate.z0, x, plate.y1, plate.z1, x, plate.y0, plate.z1]);
    put.face(rt, edge, q);
  }
}

/**
 * A single seater, from any angle.
 *
 * It was about twenty faces, which was the right answer for a renderer that
 * filled every one of them by hand, and the comment here used to say so: if you
 * cannot say what it is from three polygons, it does not need more than five.
 * That rule still holds for a tree at four hundred metres. It never held for
 * this: the car is the thing you look at for three minutes without a break, it
 * is eight metres from the camera the whole time, and twenty flat faces is what
 * it looks like from eight metres.
 *
 * So it is about five hundred triangles now, and every one of them is one of
 * four things that were missing. The wheels are round. The suspension is there,
 * which is most of what an open wheeler looks like from behind - four wheels
 * hanging off a body they are not attached to was the oldest lie in this model.
 * There is a halo over the driver's head, because there is on the cars this is
 * a car of. And the tub is lofted through six stations rather than being a
 * wedge, so the nose has a shape.
 *
 * Eight of these is four thousand triangles, which is a quarter of a frame, and
 * a frame has room for four of those.
 *
 * `pitch` is the slope of the road under it, and it was missing for a long time.
 * Nothing in the Placer could tilt a model nose-up or nose-down, so on a hill the
 * car was drawn dead level while the road ran away underneath it: at Spa's
 * steepest, fifteen in a hundred, that buried the nose a third of a metre in the
 * tarmac. A buried nose is not a static ugliness, it is a fight in the depth
 * buffer that resolves differently every frame as the camera moves, and it reads
 * as the whole car shivering.
 */
export function drawRacer(rt, car, x, y, z, yaw, tint, night = 0, pitch = 0) {
  const pal = TEAM_COLOURS[car.team % TEAM_COLOURS.length];
  put.set(x, y, z, yaw, car.roll || 0, 1, pitch);

  const body = tint(pal.body);
  const dark = tint(shade(pal.body, 0.86));
  const wing = tint(pal.wing);
  const trim = tint(pal.trim);
  const tyre = tint(C.tyre);
  const wall = tint(shade(C.tyre, 1.2));
  const rim = tint(shade(C.metal, 0.9));
  const carbon = tint(shade(C.tyre, 1.05));

  // The wheels, and the arms holding them on. The fronts point where the wheel
  // is pointed, which at a third of full lock is a few degrees - enough to see
  // from behind, and the only part of this car that answers the steering.
  const steer = (car.wheel || 0) * 0.34;
  for (const front of [false, true]) {
    const zz = front ? AXLE : -AXLE;
    const width = front ? 0.17 : 0.22;
    for (const side of [-1, 1]) {
      const wx = side * (HALF + (front ? 0 : 0.04));
      wheel(rt, tyre, wall, rim, wx, zz, width, front ? steer : 0);
      /**
       * Two wishbones and a trackrod, as blades.
       *
       * Thin quads rather than boxes: at eight metres a suspension arm is two
       * pixels wide and a box costs five faces to say what one face says. What
       * matters is that there is something between the wheel and the body,
       * because four wheels floating beside a tub is what the car looked like
       * without them.
       */
      const inner = side * 0.3;
      for (const [y0, y1, dz] of [[0.16, 0.22, 0.2], [0.42, 0.5, -0.16]]) {
        const p = new Float64Array(12);
        p.set([
          inner, y0, zz + dz * 0.3, wx, y1, zz + dz,
          wx, y1 + 0.045, zz + dz, inner, y0 + 0.045, zz + dz * 0.3,
        ]);
        put.face(rt, carbon, p);
      }
    }
  }

  // Everything from here on is painted, and the shader gives paint a highlight.
  // The wheels above are not: a tyre with a gloss on it is a balloon.
  rt.shine = 1;

  /**
   * The tub, lofted from the nose to the gearbox.
   *
   * Six stations. The nose is narrow and low, it rises and widens to the
   * cockpit, and then falls away to almost nothing over the back axle - which is
   * what a modern single seater is, and what a wedge with a flat top was not.
   */
  loft(rt, body, [
    { z: 2.42, hw: 0.13, y0: 0.20, y1: 0.32 },
    { z: 1.90, hw: 0.19, y0: 0.18, y1: 0.40 },
    { z: 1.10, hw: 0.34, y0: 0.16, y1: 0.52 },
    { z: 0.35, hw: 0.46, y0: 0.15, y1: 0.60 },
    { z: -0.60, hw: 0.44, y0: 0.16, y1: 0.62 },
    { z: -1.55, hw: 0.26, y0: 0.18, y1: 0.50 },
    { z: -2.05, hw: 0.17, y0: 0.20, y1: 0.40 },
  ]);

  /**
   * The sidepods, one either side, on their own centre lines.
   *
   * The inlet at the front, the widest part level with the driver, and a taper
   * into the waist in front of the back wheel - which is the shape that makes
   * the gap between the wheels read as a car rather than as a slab. Lofted about
   * an axis of their own rather than about the middle of the car, because a
   * sidepod is not symmetrical about anything.
   */
  for (const side of [-1, 1]) {
    loft(rt, dark, [
      { z: 0.86, hw: 0.13, y0: 0.22, y1: 0.44 },
      { z: 0.55, hw: 0.25, y0: 0.17, y1: 0.64 },
      { z: -0.30, hw: 0.26, y0: 0.16, y1: 0.60 },
      { z: -1.05, hw: 0.17, y0: 0.17, y1: 0.42 },
      { z: -1.45, hw: 0.09, y0: 0.18, y1: 0.32 },
    ], { cap: false, at: side * 0.62 });
  }

  // The cockpit opening, the airbox behind the driver's head, and the head.
  put.face(rt, carbon, [-0.34, 0.60, 0.88, 0.34, 0.60, 0.88,
    0.32, 0.62, 0.14, -0.32, 0.62, 0.14]);
  put.face(rt, tint(C.helmet), [-0.15, 0.64, 0.50, 0.15, 0.64, 0.50,
    0.15, 0.94, 0.44, -0.15, 0.94, 0.44]);
  put.face(rt, tint(shade(C.helmet, 0.7)), [-0.15, 0.94, 0.44, 0.15, 0.94, 0.44,
    0.14, 0.90, 0.14, -0.14, 0.90, 0.14]);
  /**
   * The engine cover, and the airbox on top of it.
   *
   * Two things rather than one, and the first pass had them as one: a single
   * shape in the trim colour from the driver's shoulders to the gearbox, which
   * on a car whose trim is yellow is a yellow blanket over the whole car. The
   * cover is the body colour, like the rest of the body; the airbox is the scoop
   * over the driver's head and nothing else, and it is small.
   */
  loft(rt, body, [
    { z: 0.10, hw: 0.30, y0: 0.56, y1: 0.70 },
    { z: -0.50, hw: 0.28, y0: 0.52, y1: 0.74 },
    { z: -1.30, hw: 0.22, y0: 0.46, y1: 0.62 },
    { z: -1.95, hw: 0.14, y0: 0.36, y1: 0.48 },
  ], { cap: false });
  loft(rt, trim, [
    { z: 0.22, hw: 0.15, y0: 0.78, y1: 0.94 },
    { z: -0.10, hw: 0.17, y0: 0.72, y1: 1.02 },
    { z: -0.72, hw: 0.15, y0: 0.66, y1: 0.86 },
  ], { cap: false });

  /**
   * The halo.
   *
   * A hoop over the driver's head on a single pillar in front of him. It is four
   * segments a side and one in the middle, it is the least aerodynamic looking
   * thing on the car, and it is the single detail that dates these cars to the
   * decade they are from - which is worth more than any amount of shaping
   * elsewhere.
   */
  {
    const p = new Float64Array(12);
    const ring = [
      [-0.34, 0.72, 0.62], [-0.36, 0.98, 0.42], [-0.30, 1.06, 0.04],
      [-0.18, 1.08, -0.22], [0, 1.09, -0.30],
    ];
    for (const side of [-1, 1]) {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i];
        const b = ring[i + 1];
        p.set([
          side * a[0], a[1], a[2], side * b[0], b[1], b[2],
          side * b[0], b[1] + 0.05, b[2], side * a[0], a[1] + 0.05, a[2],
        ]);
        put.face(rt, carbon, p);
      }
    }
    // The pillar, down the middle, to the nose of the cockpit.
    p.set([-0.04, 0.66, 0.86, 0.04, 0.66, 0.86, 0.04, 1.09, 0.56, -0.04, 1.09, 0.56]);
    put.face(rt, carbon, p);
    p.set([-0.05, 1.05, 0.58, 0.05, 1.05, 0.58, 0.05, 1.09, -0.30, -0.05, 1.09, -0.30]);
    put.face(rt, carbon, p);
  }

  /**
   * The wings, which are what makes the car legible from two hundred metres.
   *
   * Two elements each now rather than one plane: the main and the flap, with the
   * gap between them, and endplates with a shape rather than a rectangle. At
   * distance it reads as it always did; at eight metres it is a wing.
   */
  wingPlane(rt, wing, wing, {
    hw: 0.95, zFront: 2.62, zBack: 2.24, yFront: 0.14, yBack: 0.22, thick: 0.05,
    plate: { y0: 0.06, y1: 0.40, z0: 2.66, z1: 2.16 },
  });
  wingPlane(rt, tint(shade(pal.wing, 1.3)), wing, {
    hw: 0.86, zFront: 2.30, zBack: 2.10, yFront: 0.24, yBack: 0.34, thick: 0.04,
  });
  wingPlane(rt, wing, wing, {
    hw: 0.78, zFront: -2.08, zBack: -2.36, yFront: 0.98, yBack: 1.14, thick: 0.05,
    plate: { y0: 0.62, y1: 1.24, z0: -2.02, z1: -2.46 },
  });
  wingPlane(rt, tint(shade(pal.wing, 1.3)), wing, {
    hw: 0.72, zFront: -2.32, zBack: -2.46, yFront: 1.14, yBack: 1.24, thick: 0.04,
  });
  // And the two pylons it stands on, off the gearbox. Without them the wing
  // floats: there is a foot of air between it and the car from every angle
  // except directly behind.
  for (const side of [-1, 1]) {
    const px = side * 0.11;
    put.face(rt, carbon, [px - 0.02, 0.42, -1.96, px + 0.02, 0.42, -1.96,
      px + 0.02, 1.00, -2.16, px - 0.02, 1.00, -2.16]);
    put.face(rt, carbon, [px - 0.02, 0.42, -1.96, px - 0.02, 1.00, -2.16,
      px - 0.05, 1.00, -2.16, px - 0.05, 0.42, -1.96]);
  }
  // And the diffuser under the gearbox, which is the one part of the floor you
  // ever see: it is the thing directly in front of the car behind.
  put.face(rt, carbon, [-0.34, 0.14, -1.90, 0.34, 0.14, -1.90,
    0.30, 0.30, -2.30, -0.30, 0.30, -2.30]);

  // One red light in the middle of it, which is what a wet grand prix looks like
  // from behind and what a tow looks like here. After dark it is not tinted at
  // all: a light is a light, and the one thing that should not get darker when
  // the sun goes down is the thing you are following.
  const lamp = night > 0.35 ? C.tail : tint(C.kerbA);
  put.face(rt, lamp, [-0.10, 0.60, -2.38, 0.10, 0.60, -2.38,
    0.10, 0.76, -2.38, -0.10, 0.76, -2.38]);
  rt.shine = 0;
}

/**
 * Smoke off the tyres, or dust off the grass.
 *
 * Six small squares behind the back wheels, growing and rising and drawn with
 * every other pixel missing. There is no particle system and no transparency: at
 * this resolution a chequerboard of light grey is a cloud, and a solid one is a
 * white slab over the car - which is exactly what this was before the stipple
 * existed, and it looked like a bug because it was one.
 *
 * They are small on purpose. A puff the size of the car reads as fog; a puff the
 * size of a wheel reads as a wheel that has stopped turning.
 */
export function drawSmoke(rt, car, x, y, z, yaw, tint, rough, tick) {
  const colour = tint(rough ? DUST : SMOKE);
  put.set(x, y, z, yaw, 0, 1);
  rt.stipple = 1;
  for (let i = 0; i < 4; i++) {
    const age = ((tick * 0.09 + i * 0.25) % 1);
    const size = 0.13 + age * 0.42;
    const back = -1.7 - age * 2.2;
    const lift = 0.2 + age * 0.42;
    // Drifting out as well as back, and each puff a little off from the one
    // before, so it is a cloud coming off a tyre rather than two neat columns.
    const drift = age * 0.5 + (i % 2) * 0.16;
    for (const side of [-HALF - drift, HALF + drift]) {
      put.face(rt, colour, [
        side - size, lift - size, back,
        side + size, lift - size, back,
        side + size, lift + size, back,
        side - size, lift + size, back,
      ]);
    }
  }
  rt.stipple = 0;
}
