/**
 * Everything in the world that is a thing rather than the ground.
 *
 * The rule these are built to is the one the whole look rests on: if you cannot
 * say what it is from three polygons, it does not need more than five. A palm
 * tree is a trunk and three fronds. A rock is a pyramid. A car is a box with a
 * smaller box on it and two red squares on the back, and the two red squares
 * are doing more work than the rest of it put together, because they are how you
 * know at two hundred metres that the thing ahead is slower than you.
 *
 * Nothing here is a sprite. Every one of these is real geometry standing in the
 * world, so it turns as you go round it, it is hidden by a crest, and it grows
 * as you arrive. That is the difference between this and the road games these
 * machines actually ran, and it is the one place where not being a Mega Drive
 * is allowed to show.
 */

import { C, CARS, RIDERS } from './palette.js';
import { shade } from './raster.js';

/**
 * Puts local coordinates into the world.
 *
 * Roll first, then scale, then heading. Roll before heading because a bike
 * leans about its own axis, not about the world's, and doing it the other way
 * round makes a bike in a left-hander lean into the scenery.
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

/** A flat box: four sides and a lid. Five faces is a building, a crate, a bus. */
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

export function drawProp(rt, prop, x, y, z, tint, theme, spin = 0) {
  const s = prop.s || 1;
  put.set(x, y, z, prop.r || 0, 0, s);
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
      put.face(rt, tint(C.kerbB), [-0.14, 0, 0, 0.14, 0, 0, 0.14, 1.1, 0, -0.14, 1.1, 0]);
      put.face(rt, tint(C.kerbA), [-0.14, 0.75, 0.01, 0.14, 0.75, 0.01, 0.14, 1.02, 0.01, -0.14, 1.02, 0.01]);
      break;
    case 'block':
      box(rt, tint, theme.ridge, -3.4, 3.4, 0, 5.5, -3.4, 3.4);
      // Windows: two dark bands, which at this size is a building with people
      // in it rather than a grey box.
      put.face(rt, tint(C.glass), [-3.0, 2.0, -3.45, 3.0, 2.0, -3.45, 3.0, 3.2, -3.45, -3.0, 3.2, -3.45]);
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
      const post = tint(C.metal);
      box(rt, tint, C.metal, -12.6, -11.4, 0, 7.2, -0.4, 0.4);
      box(rt, tint, C.metal, 11.4, 12.6, 0, 7.2, -0.4, 0.4);
      put.face(rt, tint(C.kerbA), [-12.6, 7.2, 0, 12.6, 7.2, 0, 12.6, 9.4, 0, -12.6, 9.4, 0]);
      put.face(rt, post, [-12.6, 7.0, 0.05, 12.6, 7.0, 0.05, 12.6, 7.2, 0.05, -12.6, 7.2, 0.05]);
      break;
    }
    default:
      break;
  }
  if (spin) drawRotor(rt, x, y, z, spin, tint);
}

/**
 * The dark patch under a vehicle.
 *
 * Four polygons of bike floating a few centimetres above four polygons of road
 * do not look like a bike on a road; they look like a bike near a road. One flat
 * hexagon of shadow fixes it completely, and it is the cheapest thing in the
 * renderer. Lifted three centimetres so it wins the depth test against the
 * tarmac it is painted on.
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

// --- Vehicles ----------------------------------------------------------------

/**
 * A car, from any angle, in about a dozen faces.
 *
 * The lights are the point. Red at the back and white at the front is how you
 * read, in the half second you have, whether the thing in your lane is going
 * your way or coming the other way, and no amount of shape does that job at
 * this resolution.
 */
export function drawCar(rt, car, x, y, z, yaw, tint, braking = false) {
  const colour = CARS[car.paint % CARS.length];
  const long = car.long || 2.3;
  const wide = car.wide || 0.95;
  put.set(x, y, z, yaw, car.roll || 0, 1);
  box(rt, tint, colour, -wide, wide, 0.34, 1.18, -long, long);
  box(rt, tint, shade(colour, 0.9), -wide * 0.86, wide * 0.86, 1.18, 1.74, -long * 0.45, long * 0.42);
  const glass = tint(C.glass);
  put.face(rt, glass, [-wide * 0.8, 1.24, long * 0.44, wide * 0.8, 1.24, long * 0.44,
    wide * 0.7, 1.7, long * 0.4, -wide * 0.7, 1.7, long * 0.4]);
  const tyre = tint(C.tyre);
  for (const zz of [-long * 0.62, long * 0.62]) {
    put.face(rt, tyre, [-wide - 0.06, 0, zz - 0.42, -wide - 0.06, 0, zz + 0.42,
      -wide - 0.06, 0.62, zz + 0.42, -wide - 0.06, 0.62, zz - 0.42]);
    put.face(rt, tyre, [wide + 0.06, 0, zz + 0.42, wide + 0.06, 0, zz - 0.42,
      wide + 0.06, 0.62, zz - 0.42, wide + 0.06, 0.62, zz + 0.42]);
  }
  const lamp = tint(braking ? C.spark : C.kerbA);
  put.face(rt, braking ? tint(C.kerbA) : lamp, [-wide + 0.1, 0.62, -long - 0.02, -wide + 0.45, 0.62, -long - 0.02,
    -wide + 0.45, 0.92, -long - 0.02, -wide + 0.1, 0.92, -long - 0.02]);
  put.face(rt, braking ? tint(C.kerbA) : lamp, [wide - 0.45, 0.62, -long - 0.02, wide - 0.1, 0.62, -long - 0.02,
    wide - 0.1, 0.92, -long - 0.02, wide - 0.45, 0.92, -long - 0.02]);
  const head = tint(C.kerbB);
  put.face(rt, head, [-wide + 0.1, 0.66, long + 0.02, -wide + 0.5, 0.66, long + 0.02,
    -wide + 0.5, 0.94, long + 0.02, -wide + 0.1, 0.94, long + 0.02]);
  put.face(rt, head, [wide - 0.5, 0.66, long + 0.02, wide - 0.1, 0.66, long + 0.02,
    wide - 0.1, 0.94, long + 0.02, wide - 0.5, 0.94, long + 0.02]);
}

/**
 * A rider, on a bike, doing whatever they are doing.
 *
 * The arm is the only part that is not a fixed model, because the arm is the
 * game. `swing` runs from 0 to 1 and puts the fist out to the side it is aimed
 * at; at full stretch it is roughly where the hit is tested, which is not a
 * coincidence - a swing you can see land is a swing you can learn to time.
 */
export function drawRider(rt, r, x, y, z, yaw, tint) {
  const pal = RIDERS[r.pal] || RIDERS.rival;
  const lean = r.lean || 0;
  put.set(x, y, z, yaw, lean, 1);

  const tyre = tint(C.tyre);
  const metal = tint(C.metal);
  const body = tint(pal.body);
  const kit = tint(pal.kit);
  const skin = tint(pal.skin);
  const helmet = tint(pal.helmet);

  // Wheels, as a tread you see from behind and a disc you see from the side.
  for (const zz of [-0.66, 0.86]) {
    put.face(rt, tyre, [-0.11, 0.04, zz, 0.11, 0.04, zz, 0.11, 0.68, zz, -0.11, 0.68, zz]);
    put.face(rt, shade(tyre, 0.8), [0, 0.04, zz - 0.34, 0, 0.36, zz - 0.36, 0, 0.68, zz,
      0, 0.36, zz + 0.36, 0, 0.04, zz + 0.34]);
  }
  // Engine and tank. A big twin has a lot of metal between the wheels and it is
  // most of the silhouette.
  box(rt, tint, C.metal, -0.3, 0.3, 0.4, 0.82, -0.5, 0.5);
  box(rt, tint, pal.body, -0.26, 0.26, 0.82, 1.02, -0.12, 0.58);
  put.face(rt, metal, [-0.44, 1.06, 0.6, 0.44, 1.06, 0.6, 0.44, 1.14, 0.66, -0.44, 1.14, 0.66]);

  // The rider: legs, back, shoulders, head. Seen from behind almost always, so
  // the back is the face that gets the colour.
  put.face(rt, kit, [-0.34, 0.42, -0.44, 0.34, 0.42, -0.44, 0.34, 0.96, -0.34, -0.34, 0.96, -0.34]);
  put.face(rt, body, [-0.36, 0.92, -0.4, 0.36, 0.92, -0.4, 0.32, 1.62, -0.3, -0.32, 1.62, -0.3]);
  put.face(rt, shade(body, 0.8), [-0.32, 1.62, -0.3, 0.32, 1.62, -0.3, 0.28, 1.66, 0.16, -0.28, 1.66, 0.16]);
  put.face(rt, helmet, [-0.17, 1.62, -0.28, 0.17, 1.62, -0.28, 0.17, 1.96, -0.24, -0.17, 1.96, -0.24]);
  put.face(rt, shade(helmet, 0.82), [0.17, 1.62, -0.28, 0.17, 1.62, 0.14, 0.17, 1.94, 0.12, 0.17, 1.96, -0.24]);
  put.face(rt, shade(helmet, 0.82), [-0.17, 1.62, 0.14, -0.17, 1.62, -0.28, -0.17, 1.96, -0.24, -0.17, 1.94, 0.12]);

  // Arms. The idle pair reach for the bars; the swinging one goes out sideways
  // and takes the shoulder with it.
  const swing = r.swing || 0;
  const side = r.swingSide || 0;
  for (const arm of [-1, 1]) {
    const out = arm === side ? swing : 0;
    const hx = arm * (0.36 + out * 1.05);
    const hy = 1.1 + out * 0.16 - out * out * 0.2;
    const hz = 0.52 - out * 0.72;
    put.face(rt, kit, [arm * 0.3, 1.5, -0.24, arm * 0.36, 1.46, -0.2, hx, hy + 0.1, hz, hx, hy, hz]);
    put.face(rt, skin, [hx - 0.09, hy - 0.08, hz, hx + 0.09, hy - 0.08, hz,
      hx + 0.09, hy + 0.12, hz, hx - 0.09, hy + 0.12, hz]);
    // What is in the hand, if anything.
    if (out > 0.15 && r.weapon) {
      const club = tint(r.weapon === 'baton' ? C.baton : C.club);
      put.face(rt, club, [hx - 0.05, hy - 0.02, hz, hx + 0.05, hy - 0.02, hz,
        hx + 0.05 + arm * 0.5, hy + 0.16, hz - 0.1, hx - 0.05 + arm * 0.5, hy + 0.16, hz - 0.1]);
    }
  }
}

/** A rider who is no longer on the bike: sliding, and briefly an obstacle. */
export function drawDown(rt, r, x, y, z, yaw, tint) {
  const pal = RIDERS[r.pal] || RIDERS.rival;
  put.set(x, y, z, yaw, r.spin || 0, 1);
  put.face(rt, tint(shade(pal.body, 0.8)), [-0.9, 0.12, -0.5, 0.9, 0.12, -0.5, 0.9, 0.12, 0.5, -0.9, 0.12, 0.5]);
  put.face(rt, tint(C.metal), [-1.1, 0.05, 0.6, 1.1, 0.05, 0.6, 1.1, 0.42, 0.9, -1.1, 0.42, 0.9]);
  put.face(rt, tint(pal.helmet), [-0.2, 0.12, -0.8, 0.2, 0.12, -0.8, 0.2, 0.44, -0.8, -0.2, 0.44, -0.8]);
}

/** A club lying in the road, waiting for somebody to ride over it. */
export function drawDrop(rt, x, y, z, yaw, tint, bob) {
  put.set(x, y + bob, z, yaw, 0, 1);
  put.face(rt, tint(C.chrome), [-0.12, 0.1, -0.7, 0.12, 0.1, -0.7, 0.12, 0.1, 0.7, -0.12, 0.1, 0.7]);
  put.face(rt, tint(C.spark), [-0.12, 0.1, 0.4, 0.12, 0.1, 0.4, 0.12, 0.5, 0.4, -0.12, 0.5, 0.4]);
}

/**
 * A police helicopter, hanging over the road when the heat is up.
 *
 * It never touches you. It is a light in the sky and a noise, and its whole job
 * is to tell you that what happens on the ground for the next half minute is
 * going to be worse.
 */
export function drawChopper(rt, x, y, z, yaw, spin, tint) {
  put.set(x, y, z, yaw, 0, 1);
  box(rt, tint, C.kerbB, -1.1, 1.1, -0.9, 0.9, -1.6, 1.8);
  put.face(rt, tint(C.glass), [-0.9, -0.6, 1.85, 0.9, -0.6, 1.85, 0.7, 0.7, 1.5, -0.7, 0.7, 1.5]);
  put.face(rt, tint(C.metal), [-0.22, -0.1, -1.6, 0.22, -0.1, -1.6, 0.22, 0.35, -5.4, -0.22, 0.35, -5.4]);
  put.face(rt, tint(C.kerbA), [-0.1, 0.35, -5.4, 0.1, 0.35, -5.4, 0.1, 1.6, -5.0, -0.1, 1.6, -5.0]);
  drawRotor(rt, x, y + 1.1, z, spin, tint);
}

/** Two blurred blades, which is what a rotor is when it is turning. */
function drawRotor(rt, x, y, z, spin, tint) {
  const colour = tint(C.metal);
  for (const off of [0, Math.PI / 2]) {
    const a = spin + off;
    put.set(x, y, z, a, 0, 1);
    put.face(rt, colour, [-0.18, 0, -5.6, 0.18, 0, -5.6, 0.18, 0, 5.6, -0.18, 0, 5.6]);
  }
}
