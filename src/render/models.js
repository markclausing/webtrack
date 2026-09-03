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

import { C, DUST, SMOKE, TEAM_COLOURS } from './palette.js';
import { shade } from './raster.js';

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

  set(x, y, z, yaw, roll, scale) {
    this.ox = x; this.oy = y; this.oz = z;
    this.sy = Math.sin(yaw); this.cy = Math.cos(yaw);
    this.sr = Math.sin(roll); this.cr = Math.cos(roll);
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
      const ry = (lx * this.sr + ly * this.cr) * this.s;
      const rz = lz * this.s;
      b[i * 3] = this.ox + rx * this.cy + rz * this.sy;
      b[i * 3 + 1] = this.oy + ry;
      b[i * 3 + 2] = this.oz - rx * this.sy + rz * this.cy;
    }
    rt.poly(n === 8 ? b : b.subarray(0, n * 3), colour);
  }
}

const put = new Placer();

/** A flat box: four sides and a lid. Five faces is a building, a crate, a stand. */
function box(rt, tint, colour, x0, x1, y0, y1, z0, z1) {
  const dark = tint(shade(colour, 0.68));
  const side = tint(shade(colour, 0.84));
  const lit = tint(colour);
  put.face(rt, dark, [x0, y0, z0, x1, y0, z0, x1, y1, z0, x0, y1, z0]);
  put.face(rt, dark, [x1, y0, z1, x0, y0, z1, x0, y1, z1, x1, y1, z1]);
  put.face(rt, side, [x0, y0, z1, x0, y0, z0, x0, y1, z0, x0, y1, z1]);
  put.face(rt, side, [x1, y0, z0, x1, y0, z1, x1, y1, z1, x1, y1, z0]);
  put.face(rt, lit, [x0, y1, z0, x1, y1, z0, x1, y1, z1, x0, y1, z1]);
}

// --- Scenery -----------------------------------------------------------------

export function drawProp(rt, prop, x, y, z, tint, theme, facing = 0) {
  const s = prop.s || 1;
  // Trees and rocks are turned any old way and that is the point of them. A
  // gantry, a grandstand and a marker post belong to the track and are handed
  // its heading; without it they stand at whatever angle the world happens to
  // be at, which for a gantry means lying across the road.
  put.set(x, y, z, facing + (prop.r || 0), 0, s);
  switch (prop.kind) {
    case 'pine': {
      const trunk = tint(theme.trunk);
      const dark = tint(shade(theme.tree, 0.7));
      const lit = tint(theme.tree);
      put.face(rt, trunk, [-0.2, 0, 0, 0.2, 0, 0, 0.2, 1.6, 0, -0.2, 1.6, 0]);
      // Two flat triangles crossed at right angles. From any direction you see
      // one of them face on and the other edge on, which is exactly what a
      // conifer looks like from a moving vehicle.
      put.face(rt, lit, [0, 6.4, 0, -1.7, 1.1, 0, 1.7, 1.1, 0]);
      put.face(rt, dark, [0, 6.4, 0, 0, 1.1, -1.7, 0, 1.1, 1.7]);
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
    case 'post':
      // A distance marker. Two faces, and between them they are worth more to
      // the feeling of speed than anything else in this file.
      put.face(rt, tint(C.kerbB), [-0.13, 0, 0, 0.13, 0, 0, 0.13, 1.15, 0, -0.13, 1.15, 0]);
      put.face(rt, tint(C.kerbA), [-0.13, 0.78, 0.01, 0.13, 0.78, 0.01,
        0.13, 1.06, 0.01, -0.13, 1.06, 0.01]);
      break;
    case 'stand': {
      // Seating on the slope, a roof over it, and a band of colour where the
      // people are. Nobody is modelled: at this size a crowd is a texture, and
      // there are no textures, so a crowd is a stripe.
      const frame = tint(shade(theme.ridge, 0.8));
      put.face(rt, frame, [-6, 0, -0.6, 6, 0, -0.6, 6, 4.6, 5.4, -6, 4.6, 5.4]);
      put.face(rt, tint(C.crowd), [-6, 1.4, 1.2, 6, 1.4, 1.2, 6, 3.4, 3.6, -6, 3.4, 3.6]);
      put.face(rt, tint(shade(theme.ridge, 0.6)), [-6, 4.6, 5.4, 6, 4.6, 5.4, 6, 4.6, -0.4, -6, 4.6, -0.4]);
      put.face(rt, tint(C.metal), [-6, 6.6, -0.6, 6, 6.6, -0.6, 6, 6.9, 4.4, -6, 6.9, 4.4]);
      put.face(rt, frame, [-6, 4.6, -0.5, -5.7, 4.6, -0.5, -5.7, 6.7, -0.5, -6, 6.7, -0.5]);
      put.face(rt, frame, [5.7, 4.6, -0.5, 6, 4.6, -0.5, 6, 6.7, -0.5, 5.7, 6.7, -0.5]);
      break;
    }
    case 'garage': {
      // A bay with a dark opening and a strip of colour over it. Four faces, and
      // the only one doing any work is the dark one: an opening is what makes a
      // row of boxes read as somewhere cars go into.
      const wall = tint(shade(theme.ridge, 1.1));
      put.face(rt, wall, [-4.4, 0, 0, 4.4, 0, 0, 4.4, 5, 0, -4.4, 5, 0]);
      put.face(rt, tint(C.tyre), [-3.4, 0, -0.05, 3.4, 0, -0.05, 3.4, 3.4, -0.05, -3.4, 3.4, -0.05]);
      put.face(rt, tint(C.kerbA), [-4.4, 3.6, -0.1, 4.4, 3.6, -0.1, 4.4, 4.4, -0.1, -4.4, 4.4, -0.1]);
      put.face(rt, tint(shade(theme.ridge, 0.7)), [-4.6, 5, 0.4, 4.6, 5, 0.4,
        4.6, 5.3, -1.6, -4.6, 5.3, -1.6]);
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
export function drawShadow(rt, x, y, z, yaw, wide, long, tint) {
  put.set(x, y + 0.03, z, yaw, 0, 1);
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

/** Half the track, half the wheelbase, and the height of the airbox. */
const HALF = 0.88;
const AXLE = 1.5;

/**
 * A single seater, from any angle, in about twenty faces.
 *
 * Built from the back forwards, because the back is what you look at. The rear
 * wing is the widest thing on it and sits highest, which is what makes a car two
 * hundred metres up the road read as a racing car and not as a dot; the four
 * wheels standing out in the air are what stop it reading as a saloon; and the
 * helmet is how you tell at a glance that there is somebody in it.
 */
export function drawRacer(rt, car, x, y, z, yaw, tint) {
  const pal = TEAM_COLOURS[car.team % TEAM_COLOURS.length];
  put.set(x, y, z, yaw, car.roll || 0, 1);

  const body = tint(pal.body);
  const dark = tint(shade(pal.body, 0.72));
  const wing = tint(pal.wing);
  const wingLit = tint(shade(pal.wing, 1.25));
  const trim = tint(pal.trim);
  const tyre = tint(C.tyre);
  const rim = tint(C.chrome);

  // Wheels: tread you see from behind, disc you see from the side. They stand
  // clear of the body, which is the whole silhouette of an open wheeler.
  for (const zz of [-AXLE, AXLE]) {
    for (const side of [-1, 1]) {
      const wx = side * HALF;
      put.face(rt, tyre, [wx - 0.18, 0.04, zz - 0.36, wx + 0.18, 0.04, zz - 0.36,
        wx + 0.18, 0.72, zz - 0.36, wx - 0.18, 0.72, zz - 0.36]);
      put.face(rt, tyre, [wx + 0.18, 0.04, zz + 0.36, wx - 0.18, 0.04, zz + 0.36,
        wx - 0.18, 0.72, zz + 0.36, wx + 0.18, 0.72, zz + 0.36]);
      put.face(rt, shade(tyre, 0.82), [wx + side * 0.19, 0.04, zz - 0.33,
        wx + side * 0.19, 0.4, zz - 0.4, wx + side * 0.19, 0.72, zz,
        wx + side * 0.19, 0.4, zz + 0.4, wx + side * 0.19, 0.04, zz + 0.33]);
      put.face(rt, rim, [wx + side * 0.2, 0.3, zz - 0.12, wx + side * 0.2, 0.46, zz,
        wx + side * 0.2, 0.3, zz + 0.12, wx + side * 0.2, 0.14, zz]);
    }
  }

  // The tub, from the nose back, and the sidepods either side of it.
  put.face(rt, body, [-0.16, 0.22, 2.35, 0.16, 0.22, 2.35, 0.44, 0.54, 0.9, -0.44, 0.54, 0.9]);
  put.face(rt, dark, [-0.16, 0.22, 2.35, -0.44, 0.54, 0.9, -0.44, 0.2, 0.9, -0.16, 0.14, 2.35]);
  put.face(rt, dark, [0.44, 0.54, 0.9, 0.16, 0.22, 2.35, 0.16, 0.14, 2.35, 0.44, 0.2, 0.9]);
  box(rt, tint, pal.body, -0.46, 0.46, 0.18, 0.56, -1.1, 0.9);
  box(rt, tint, shade(pal.body, 0.9), -0.9, -0.5, 0.16, 0.66, -0.9, 0.7);
  box(rt, tint, shade(pal.body, 0.9), 0.5, 0.9, 0.16, 0.66, -0.9, 0.7);

  // The cockpit, the airbox behind the driver's head, and the head.
  put.face(rt, tint(C.tyre), [-0.34, 0.58, 0.86, 0.34, 0.58, 0.86,
    0.32, 0.6, 0.16, -0.32, 0.6, 0.16]);
  put.face(rt, trim, [-0.2, 0.6, 0.2, 0.2, 0.6, 0.2, 0.17, 1.04, -0.1, -0.17, 1.04, -0.1]);
  put.face(rt, tint(shade(pal.trim, 0.8)), [-0.17, 1.04, -0.1, 0.17, 1.04, -0.1,
    0.2, 0.98, -1.0, -0.2, 0.98, -1.0]);
  put.face(rt, tint(C.helmet), [-0.16, 0.62, 0.48, 0.16, 0.62, 0.48,
    0.16, 0.92, 0.42, -0.16, 0.92, 0.42]);

  // The engine cover, tapering to nothing over the gearbox.
  put.face(rt, body, [-0.4, 0.6, -0.2, 0.4, 0.6, -0.2, 0.2, 0.48, -1.9, -0.2, 0.48, -1.9]);
  put.face(rt, dark, [-0.4, 0.6, -0.2, -0.2, 0.48, -1.9, -0.2, 0.2, -1.9, -0.44, 0.2, -0.2]);
  put.face(rt, dark, [0.2, 0.48, -1.9, 0.4, 0.6, -0.2, 0.44, 0.2, -0.2, 0.2, 0.2, -1.9]);

  // The wings. Wide, flat and dark, and the reason the car is legible from a
  // long way back.
  put.face(rt, wingLit, [-0.95, 0.16, 2.5, 0.95, 0.16, 2.5, 0.95, 0.24, 2.05, -0.95, 0.24, 2.05]);
  put.face(rt, wing, [-0.95, 0.1, 2.48, 0.95, 0.1, 2.48, 0.95, 0.16, 2.5, -0.95, 0.16, 2.5]);
  put.face(rt, wingLit, [-0.82, 0.78, -2.1, 0.82, 0.78, -2.1, 0.82, 1.02, -2.32, -0.82, 1.02, -2.32]);
  put.face(rt, wing, [-0.82, 0.78, -2.1, -0.82, 1.02, -2.32, -0.86, 1.02, -2.32, -0.86, 0.78, -2.1]);
  put.face(rt, wing, [-0.86, 0.5, -2.34, -0.7, 0.5, -2.34, -0.7, 1.08, -2.34, -0.86, 1.08, -2.34]);
  put.face(rt, wing, [0.7, 0.5, -2.34, 0.86, 0.5, -2.34, 0.86, 1.08, -2.34, 0.7, 1.08, -2.34]);
  // And one red light in the middle of it, which is what a wet grand prix looks
  // like from behind and what a tow looks like here.
  put.face(rt, tint(C.kerbA), [-0.1, 0.6, -2.36, 0.1, 0.6, -2.36,
    0.1, 0.74, -2.36, -0.1, 0.74, -2.36]);
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
