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

export function drawProp(rt, prop, x, y, z, tint, theme, facing = 0, time = 0, night = 0) {
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
    /**
     * A spruce. Taller and narrower than the pine, and darker.
     *
     * It exists because Spa is a corridor through conifers and the pine already
     * in here reads as an alpine tree standing on its own. Three crossed
     * triangles rather than two: a spruce seen from a car is a column, and two
     * flat triangles give you a column that thins out every ninety degrees.
     */
    case 'spruce': {
      const trunk = tint(shade(theme.trunk, 0.85));
      const dark = tint(shade(theme.tree, 0.6));
      const mid = tint(shade(theme.tree, 0.8));
      const lit = tint(theme.tree);
      put.face(rt, trunk, [-0.18, 0, 0, 0.18, 0, 0, 0.18, 1.9, 0, -0.18, 1.9, 0]);
      put.face(rt, lit, [0, 9.4, 0, -1.25, 1.3, 0, 1.25, 1.3, 0]);
      put.face(rt, dark, [0, 9.4, 0, 0, 1.3, -1.25, 0, 1.3, 1.25]);
      put.face(rt, mid, [0, 8.2, 0, -0.9, 1.3, -0.9, 0.9, 1.3, 0.9]);
      break;
    }
    /**
     * A broadleaf. A trunk and a lump, which is what a big deciduous tree is
     * from a moving car - the crown reads as a mass and never as a shape.
     */
    case 'oak': {
      const trunk = tint(theme.trunk);
      const dark = tint(shade(theme.tree, 0.66));
      const mid = tint(shade(theme.tree, 0.86));
      const lit = tint(shade(theme.tree, 1.08));
      put.face(rt, trunk, [-0.32, 0, 0, 0.32, 0, 0, 0.32, 2.6, 0, -0.32, 2.6, 0]);
      // Three overlapping quads at different angles: a crown with a top on it,
      // rather than a disc that vanishes when you drive past it.
      put.face(rt, dark, [-2.5, 2.4, 0, 2.5, 2.4, 0, 2.1, 6.6, 0, -2.1, 6.6, 0]);
      put.face(rt, mid, [0, 2.4, -2.5, 0, 2.4, 2.5, 0, 6.6, 2.1, 0, 6.6, -2.1]);
      put.face(rt, lit, [-1.7, 6.2, -1.7, 1.7, 6.2, -1.7, 1.7, 7.4, 1.7, -1.7, 7.4, 1.7]);
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
      // A grandstand: long along the track, facing across it, and solid.
      //
      // It used to be a set of separate plates - a slope, a roof and a canopy
      // floating two metres above that on two thin legs - which from any
      // distance read as flat polygons hanging in the air rather than as a
      // building. Everything here now meets something else: back wall to roof,
      // roof to posts, posts to fascia. Nothing is left over on its own.
      //
      // Built facing local +z. Nobody is modelled: at this size a crowd is a
      // texture, there are no textures, so a crowd is a stripe.
      const wall = tint(shade(theme.ridge, 0.72));
      const side = tint(shade(theme.ridge, 0.6));
      const deck = tint(shade(theme.ridge, 0.94));
      put.face(rt, wall, [-9, 0, -5, 9, 0, -5, 9, 8.4, -5, -9, 8.4, -5]);
      put.face(rt, deck, [-9, 1, 0, 9, 1, 0, 9, 6.4, -4.6, -9, 6.4, -4.6]);
      put.face(rt, tint(C.crowd), [-8.4, 2.2, -1.4, 8.4, 2.2, -1.4,
        8.4, 5.2, -3.4, -8.4, 5.2, -3.4]);
      put.face(rt, wall, [-9, 0, 0, 9, 0, 0, 9, 1, 0, -9, 1, 0]);
      put.face(rt, side, [-9, 0, 0, -9, 0, -5, -9, 7.4, -5, -9, 1, 0]);
      put.face(rt, side, [9, 0, -5, 9, 0, 0, 9, 1, 0, 9, 7.4, -5]);
      put.face(rt, tint(C.metal), [-9.4, 8.4, -5.2, 9.4, 8.4, -5.2,
        9.4, 7.6, 0.8, -9.4, 7.6, 0.8]);
      for (const at of [-8.6, 8.6]) {
        put.face(rt, side, [at - 0.3, 1, 0.4, at + 0.3, 1, 0.4,
          at + 0.3, 7.7, 0.6, at - 0.3, 7.7, 0.6]);
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
/**
 * The car.
 *
 * `pitch` is the slope of the road under it, and it was missing for a long time.
 * Nothing in the Placer could tilt a model nose-up or nose-down, so on a hill the
 * car was drawn dead level while the road ran away underneath it: at Spa's
 * steepest, fifteen in a hundred, that buried the nose a third of a metre in the
 * tarmac. A buried nose is not a static ugliness, it is a fight in the depth
 * buffer that resolves differently every frame as the camera moves, and it reads
 * as the whole car shivering. Spa was the worst of the seven because Spa is the
 * steepest of the seven, which is how it was found.
 */
export function drawRacer(rt, car, x, y, z, yaw, tint, night = 0, pitch = 0) {
  const pal = TEAM_COLOURS[car.team % TEAM_COLOURS.length];
  put.set(x, y, z, yaw, car.roll || 0, 1, pitch);

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
  // like from behind and what a tow looks like here. After dark it is not tinted
  // at all: a light is a light, and the one thing that should not get darker
  // when the sun goes down is the thing you are following.
  const lamp = night > 0.35 ? C.tail : tint(C.kerbA);
  put.face(rt, lamp, [-0.12, 0.58, -2.36, 0.12, 0.58, -2.36,
    0.12, 0.76, -2.36, -0.12, 0.76, -2.36]);
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
