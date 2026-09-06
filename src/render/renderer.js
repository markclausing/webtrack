/**
 * Drawing. Reads the state, never writes to it.
 *
 * The world is built out of the track itself. There is no terrain mesh and no
 * scene graph: for every node in front of the camera this walks outwards from
 * the centreline - tarmac, kerb, run-off, barrier, hillside, distance - and puts
 * down a quad at each step. A mountain is the outermost of those quads a long
 * way up. The sea is the outermost of them at zero. Nothing else is needed, and
 * anything else would have to be kept in step with a track that bends.
 *
 * Three things are worth knowing before changing anything in here.
 *
 * Everything fades to one colour, and that colour is also the bottom band of the
 * sky. That is what makes a horizon: the far quads arrive at the haze colour at
 * exactly the height the sky starts, and the join disappears. Change one without
 * the other and there is a line across the world.
 *
 * Detail is dropped by distance, not by count. The near quads are drawn one node
 * at a time, the middle ones every second node and the far ones every fourth,
 * which is roughly constant work per pixel rather than per metre.
 *
 * And the field of view moves with speed. Half of everything that makes this
 * feel quick is in `follow`: the lens goes wide, the camera drops towards the
 * road and pulls in, and the horizon shakes. None of it changes the simulation
 * by a single tick, and all of it changes the game. What is deliberately not in
 * here is anything painted on top of the picture rather than into it - there
 * were streaks up the sides for a while and they read as a fault in the
 * renderer, because that is what an artefact that does not belong to the world
 * looks like.
 */

import {
  CAM_AHEAD, CAM_BACK, CAM_BACK_FAST, CAM_HIGH, CAM_HIGH_FAST, CAM_LAG, CHECKPOINT_TIME,
  DRAW_AHEAD, DRAW_BEHIND, FOCAL, FOCAL_FAST, gearAt, GRID_GAP, GRID_OFF, LIGHTS,
  ROAD_HALF, RUMBLE, SCREEN_H, SCREEN_W, SEG, TICK_RATE, TOP_SPEED, WALL_AT,
} from '../constants.js';
import { BRIDGE_NODES, RINGS, TOWERS } from '../game/route.js';
import {
  formatClock, formatGap, formatTime, kmh, lapOf, nodeAt, nodeStep, ordinal, player,
  progress, racing, worldOf,
} from '../game/state.js';
import { drawProp, drawRacer, drawShadow, drawSmoke } from './models.js';
import { C, lit, SUN_BEARING, TEAM_COLOURS, THEMES, TIMES } from './palette.js';
import { md, mix, Raster, shade } from './raster.js';

/** Where the haze starts biting, and where nothing is left of the colour. */
const FOG_NEAR = 190;
const FOG_FAR = DRAW_AHEAD * SEG;

/**
 * The ground, in rings, as [inner, outer, which colour, how often].
 *
 * The outermost is three hundred and forty metres and it stays there, however
 * big the circuit is. On the largest one that leaves a few hundred pixels of sky
 * showing across the middle of the loop, which is worth having: a band that
 * reaches further than this on a track that curves does not stay in the middle,
 * it comes out the far side and lands on the piece of road the car is on. Two
 * attempts at closing that hole - one to the widest point of the loop, one to
 * the centre of it - both put a grey-green plain over the track with the car
 * apparently driving through a lake.
 *
 * The last number is the only interesting one: the run-off beside the kerb is
 * drawn at every node, the middle distance at every second and the far hills at
 * every fourth. That keeps the work roughly proportional to the pixels a band
 * covers rather than to the metres it spans, which is what makes a kilometre of
 * scenery affordable.
 */
const BANDS = [
  [ROAD_HALF + RUMBLE, RINGS[0], 'verge', 1],
  [RINGS[0], RINGS[1], 'near', 1],
  [RINGS[1], RINGS[2], 'mid', 2],
  [RINGS[2], RINGS[3], 'far', 4],
];

/** The little map, in pixels. Small enough to ignore, big enough to read. */
const MAP_W = 62;
const MAP_H = 52;

/**
 * The HUD is drawn in a fixed space and scaled onto the screen.
 *
 * Every number in the panels below - four pixels from this edge, a bar
 * eighty-four wide, a gap of ten between two rows - was chosen against a screen
 * four hundred and eighty across, and there are about ninety of them. Left as
 * raw pixels they are a layout that quietly shrinks every time the resolution
 * goes up: the last increase took the HUD from a fifth of the screen to a sixth
 * and nobody noticed until the one after it.
 *
 * So they stay as they were written and the drawing is scaled instead. The one
 * thing that cannot follow smoothly is the font, which is a five by seven bitmap
 * blitted at whole multiples - so it goes up in steps while the panels around it
 * move continuously, which is what a bitmap interface at a higher resolution has
 * always looked like.
 */
const HUD_BASE_W = 480;
const HUD_BASE_H = 336;
const HUD_SCALE = SCREEN_W / HUD_BASE_W;

const HUD_BACK = md(12, 12, 24);
const HUD_EDGE = md(80, 84, 110);
const HUD_TEXT = md(226, 230, 240);
const HUD_DIM = md(130, 136, 156);
const GOOD = md(60, 200, 90);
const WARN = md(240, 180, 40);
const BAD = md(220, 50, 40);

/** What a tunnel takes the daylight down to. Not black: black is a hole. */
const TUNNEL_DARK = md(18, 20, 26);

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.rt = new Raster(SCREEN_W, SCREEN_H);
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
    this.cam = null;
    this.surf = 0;
  }

  /** A new race: the camera must not glide in from where the last one ended. */
  reset() {
    this.cam = null;
  }

  /**
   * Where a car is now, as opposed to where it was at the last simulation tick.
   *
   * The simulation runs at sixty and the screen may not. On a hundred-and-twenty
   * hertz panel half the frames arrive with no tick in them at all - the meter
   * reads X0, X1, X0, X1 - so the car moved on every other frame and stood still
   * in between, which is a judder with nothing wrong behind it. The circuits
   * where it showed were the cheap ones, because those are the ones that can
   * reach a hundred and twenty in the first place; Monza did it and Spa did not.
   *
   * `alpha` is how much of a tick has already gone by, so each car is carried
   * forward by its own speed for that fraction. It is extrapolation rather than
   * interpolation - the future is guessed rather than the past re-read - and
   * over a sixtieth of a second at three hundred and fifty that is a guess about
   * a metre and a half long, made from the velocity that is about to be used
   * anyway.
   */
  at(state, car) {
    const a = state.alpha || 0;
    if (!a) return worldOf(state.route, car.s, car.x);
    const on = a / TICK_RATE;
    return worldOf(state.route, car.s + car.speed * on, car.x + car.vx * on);
  }

  /**
   * The canvas is the size of the picture, and the browser stretches it.
   *
   * It used to be the size of the window, and the frame was blown up onto it by
   * hand every time. That is one drawImage of six hundred and forty by four
   * hundred and forty-eight onto two thousand by eleven hundred and fifty - two
   * and a third million pixels of nearest-neighbour scaling, in JavaScript, sixty
   * times a second - and it cost more than everything else in the frame put
   * together. It was also invisible to every measurement in this repository,
   * because the headless harness stubs the canvas out and its drawImage does
   * nothing at all: three thousand triangles and seventeen milliseconds, and
   * none of the seventeen anywhere the tools could see it.
   *
   * Sized to the buffer instead, the scaling belongs to the compositor, which
   * does it on the graphics hardware for nothing. `object-fit: contain` in the
   * stylesheet keeps it in proportion and letterboxes the rest.
   *
   * The arguments are ignored and kept: `fit()` still calls this on every resize,
   * and there is nothing left for it to do.
   */
  size() {
    this.canvas.width = SCREEN_W;
    this.canvas.height = SCREEN_H;
  }

  draw(state, { chrome = true } = {}) {
    const rt = this.rt;
    const p = player(state);
    const cam = this.follow(state, p);
    this.surf += 0.05;

    // The time of day, worked out once and then applied to every colour that
    // goes into the world. The head-up display does not get it: a dashboard is
    // lit from the inside.
    this.hour(state.light || 0);
    const theme = this.theme(
      state.route.nodes[nodeAt(state.route, p.s).i].warm, state.route.theme,
    );
    // The horizon moves with the camera, so the sky bands move with it. Signed
    // the other way it looks almost right, which is worse than looking wrong.
    const lift = Math.tan(cam.pitch) * rt.focal / SCREEN_H;
    rt.begin(this.sky(theme).map(([at, colour]) => [at - lift, colour]));
    this.sun(cam);
    rt.setCamera(cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);

    this.ground(state, theme, p);
    this.cars(state, theme, p);

    if (chrome) this.hud(state, p);
    rt.blit(this.ctx);
  }

  /**
   * Hands the picture over again, for anything drawn after `draw` finished.
   *
   * Only the frame meter uses it, and only when it is switched on: it has to
   * report how long the frame took, which is not known until the frame is over.
   */
  show() {
    this.rt.blit(this.ctx);
  }

  /**
   * The camera: behind the car, low, and lower the faster it goes.
   *
   * It rides the track rather than the car - its position comes from the
   * centreline at a distance behind you, only partly following you across the
   * road - so that being shoved sideways moves the car in the frame instead of
   * moving the whole world.
   *
   * Everything else in here is speed. The lens widens from a calm fifty degrees
   * to a shouting seventy, the eye height drops by two feet, the camera comes
   * in, and the whole thing starts to shiver. Not one of those is a change to
   * the simulation; together they are worth more than fifty km/h would be.
   */
  follow(state, p) {
    const route = state.route;
    const rush = Math.max(0, Math.min(1, (p.speed - 24) / (TOP_SPEED - 24)));
    const eased = rush * rush;

    // Laterally the camera all but sits on the car, and looks at a point half
    // way back to the centreline ahead of it. Following loosely across the track
    // sounds like it would be smoother and is not: it swings the car out to the
    // edge of the frame every time you take a wide line, and at this field of
    // view the edge of the frame is off the screen.
    // Where the car is this instant, not where the last tick left it: the camera
    // sits on the car, so a camera built from the tick judders exactly as much
    // as the car would.
    const on = (state.alpha || 0) / TICK_RATE;
    const here = p.s + p.speed * on;
    const side = p.x + p.vx * on;
    const back = worldOf(route, here - (CAM_BACK + (CAM_BACK_FAST - CAM_BACK) * eased), side * 0.94);
    const look = worldOf(route, here + CAM_AHEAD, side * 0.5);
    const high = CAM_HIGH + (CAM_HIGH_FAST - CAM_HIGH) * eased;
    const dx = look.x - back.x;
    const dz = look.z - back.z;
    const flat = Math.hypot(dx, dz) || 1;
    const want = {
      x: back.x,
      y: back.y + high,
      z: back.z,
      yaw: Math.atan2(dx, dz),
      pitch: Math.atan2(back.y + high - (look.y + 1.1), flat),
      // Rolled with the road, but not all the way with it. A camera bolted to
      // the car would roll the full eighteen degrees through Tarzan and you
      // would see a level road and a world on its ear; at nought this is a
      // level world and a road on its ear. Six tenths splits it, which is about
      // what a camera hanging behind the car would actually do.
      roll: -p.yaw * 0.1 - back.bank * 0.22 - back.dish * 0.6,
    };

    if (!this.cam) this.cam = { ...want };
    const cam = this.cam;
    for (const key of ['x', 'y', 'z', 'pitch', 'roll']) {
      cam[key] += (want[key] - cam[key]) * CAM_LAG;
    }
    // Heading is an angle, so it has to be eased the short way round or the
    // camera spins the wrong way through every hairpin that crosses north.
    let turn = want.yaw - cam.yaw;
    while (turn > Math.PI) turn -= Math.PI * 2;
    while (turn < -Math.PI) turn += Math.PI * 2;
    cam.yaw += turn * (CAM_LAG + 0.12);

    this.rt.focal = FOCAL + (FOCAL_FAST - FOCAL) * eased;

    // A shiver that grows with speed, and a proper thump when something hits.
    const buzz = eased * 0.35 + state.shake;
    if (buzz > 0.02) {
      cam.x += this.wob(state.tick * 1.9) * buzz * 0.34;
      cam.y += this.wob(state.tick * 2.7 + 5) * buzz * 0.22;
      cam.roll += this.wob(state.tick * 3.3 + 9) * buzz * 0.022;
    }
    return cam;
  }

  wob(t) {
    return Math.sin(t) * Math.cos(t * 0.7 + 1.3);
  }

  /**
   * Where in the afternoon we are, as the two numbers everything else needs.
   *
   * Bucketed into sixteen, because the palette cannot express more than that
   * between one end of a race and the other and because every distinct value is
   * a new set of cached theme colours. Sixteen steps over three laps is a change
   * nobody can catch happening.
   */
  hour(light) {
    const step = Math.round(Math.max(0, Math.min(1, light)) * 16) / 16;
    if (step === this.lightAt) return;
    this.lightAt = step;
    // Between whichever two times of day it falls between.
    let i = 0;
    while (i < TIMES.length - 2 && step > TIMES[i + 1].at) i++;
    const a = TIMES[i];
    const b = TIMES[i + 1];
    const t = Math.max(0, Math.min(1, (step - a.at) / (b.at - a.at)));
    this.now = {
      dim: a.dim + (b.dim - a.dim) * t,
      wash: mix(a.wash, b.wash, t),
      pull: a.pull + (b.pull - a.pull) * t,
      sun: mix(a.sun, b.sun, t),
      sunSize: a.sunSize + (b.sunSize - a.sunSize) * t,
      sunHigh: a.sunHigh + (b.sunHigh - a.sunHigh) * t,
      from: a,
      to: b,
      t,
    };
    // The cached blends belong to the old light and are no longer true.
    for (const key of Object.keys(this)) if (key.startsWith('blend')) delete this[key];
    this.skyOf = -1;
  }

  /** One colour, at this time of day. Everything in the world goes through it. */
  lamp(colour) {
    const now = this.now;
    return lit(colour, now.dim, now.wash, now.pull);
  }

  /**
   * The same, but softer, for the cars.
   *
   * A car at night takes a good deal less of the wash than a hillside does, and
   * that is not a cheat: they are the nearest things on the screen, they are the
   * only things lit by anybody's headlights, and a race in which you cannot tell
   * the red one from the blue one is a race you are not in. It is the same
   * argument as the head-up display being lit from the inside.
   */
  lampCar(colour) {
    const now = this.now;
    return lit(colour, now.dim + (1 - now.dim) * 0.42, now.wash, now.pull * 0.5);
  }

  /**
   * The sky, which is the one thing that is replaced rather than tinted.
   *
   * Darkening a blue afternoon sky gives a darker blue afternoon sky, and dusk
   * is not a darker afternoon, it is a different set of colours in a different
   * order. So each time of day carries its own bands and they are blended; only
   * the daytime one is the circuit's own.
   */
  sky(theme) {
    if (this.skyOf === this.lightAt) return this.skyBands;
    const { from, to, t } = this.now;
    const a = from.sky || theme.sky;
    const b = to.sky || theme.sky;
    this.skyBands = a.map(([at, colour], i) => {
      const other = b[Math.min(i, b.length - 1)];
      return [at + (other[0] - at) * t, mix(colour, other[1], t)];
    });
    this.skyOf = this.lightAt;
    return this.skyBands;
  }

  /**
   * The sun, or the moon, sitting where it actually is.
   *
   * Drawn straight into the sky before anything else, so the hills cover it when
   * it goes behind one. Its place on the screen comes from the angle between
   * where the camera is looking and the bearing the sun is on, which means it
   * stays put in the world while you go round the circuit - and coming out of a
   * corner with it straight ahead is worth more than any amount of shading.
   */
  sun(cam) {
    const rt = this.rt;
    const now = this.now;
    let turn = SUN_BEARING - cam.yaw;
    while (turn > Math.PI) turn -= Math.PI * 2;
    while (turn < -Math.PI) turn += Math.PI * 2;
    // Behind you, or so far round the edge that it would be a smear rather than
    // a disc: the tangent runs away long before the field of view does.
    if (Math.abs(turn) > 1.1) return;
    const x = Math.round(SCREEN_W / 2 + Math.tan(turn) * rt.focal);
    const horizon = SCREEN_H / 2 - Math.tan(cam.pitch) * rt.focal;
    const y = Math.round(horizon - now.sunHigh * SCREEN_H);
    const r = Math.round(now.sunSize);
    for (let dy = -r; dy <= r; dy++) {
      const half = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
      rt.rect(x - half, y + dy, half * 2 + 1, 1, now.sun);
    }
  }

  /**
   * Which set of colours, at a given amount of sea front.
   *
   * A circuit can be mountain at the start line and coast on the far side of the
   * lap, so this is asked per node rather than per frame - and cached in nine
   * buckets, because nine greens that differ by less than the palette can
   * express are one green wearing nine hats.
   *
   * The sky and the haze come from the node the player is on; the ground comes
   * from the node being drawn. That is what lets the land arrive at the water
   * over a few hundred metres instead of changing its mind at a line.
   */
  /**
   * The colours of the place.
   *
   * The drawn circuits blend between two of them, because the grand circuit
   * leaves the mountains and arrives at the sea inside a lap and there must be
   * no line across the world where it changes its mind. A surveyed circuit is
   * one place and stays there, so it just names its theme and nothing is
   * blended at all.
   */
  theme(warm, named) {
    if (named) {
      const key = `named${named}`;
      if (this[key]) return this[key];
      const src = THEMES[named] || THEMES.mountain;
      const out = { sky: src.sky.map(([f, c]) => [f, c]) };
      for (const k of ['fog', 'near', 'mid', 'far', 'ridge', 'verge', 'rock', 'tree', 'trunk', 'water']) {
        out[k] = this.lamp(src[k]);
      }
      this[key] = out;
      return out;
    }
    const key = `blend${Math.round(warm * 8)}`;
    if (this[key]) return this[key];
    const t = Math.round(warm * 8) / 8;
    const a = THEMES.mountain;
    const b = THEMES.coast;
    const out = {
      sky: a.sky.map(([f, c], i) => [f + (b.sky[i][0] - f) * t, mix(c, b.sky[i][1], t)]),
    };
    for (const k of ['fog', 'near', 'mid', 'far', 'ridge', 'verge', 'rock', 'tree', 'trunk', 'water']) {
      out[k] = this.lamp(mix(a[k], b[k], t));
    }
    this[key] = out;
    return out;
  }

  // --- The world ------------------------------------------------------------

  /**
   * Tarmac, kerb, barrier and every band of ground out to the horizon.
   *
   * Drawn from the camera outwards so the depth buffer throws away most of the
   * far pixels before they are written - the near track covers a third of the
   * screen and everything behind it is rejected in one compare.
   */
  ground(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    const first = nodeAt(route, p.s).i - DRAW_BEHIND;

    // Nought until the sun is on the horizon, one when it has gone. It starts
    // early enough that the floodlights come on at dusk, which is when a real
    // circuit switches them on - a good half hour before anybody needs them.
    const night = Math.max(0, (this.lightAt - 0.4) / 0.6);
    for (let step = 0; step < DRAW_AHEAD; step++) {
      const i = first + step;
      const a = nodeStep(route, i, 0);
      const b = nodeStep(route, i, 1);
      const away = step * SEG;
      const f = fog(away);
      // The headlights: at night the near tarmac is a good deal brighter than
      // the rest of the world, which is what a car's own lights look like from
      // inside it and is most of what makes a night lap readable.
      // Two things light the tarmac after dark: your own headlights, which are
      // brightest under the nose and gone by ninety metres, and the floodlights,
      // which are dimmer and go all the way to the horizon. The brighter of the
      // two wins, so the pool in front of you still reads as yours.
      const beam = night > 0
        ? night * Math.max(
          Math.max(0, 1 - away / 85) ** 1.4,
          0.34 + 0.2 * Math.cos((((i % 12) + 12) % 12) / 12 * Math.PI * 2),
        )
        : 0;
      /**
       * Under a roof, and dark under it.
       *
       * A tunnel is drawn by taking the daylight away and putting a strip of
       * sodium back, which is what a tunnel is. The fog goes with it - there is
       * no distance to lose colour to in there - so the far end of a tunnel is
       * a bright hole rather than a grey one, which is the whole picture of
       * Monaco from the inside.
       */
      const roof = a.tunnel || 0;
      // Dark, but not so dark that the road stops being a road. Two thirds of
      // the way to the tunnel colour and a little sodium put back, which is
      // about what a lit road tunnel looks like from inside a car.
      const dark = (colour) => (roof > 0
        ? mix(mix(colour, TUNNEL_DARK, roof * 0.62), C.lamp, roof * 0.10)
        : colour);
      const haze = roof > 0 ? f * (1 - roof) : f;
      const tint = (colour) => mix(dark(this.lamp(colour)), theme.fog, haze);
      const road = beam > 0
        ? (colour) => mix(dark(shade(this.lamp(colour), 1 + beam * 2.4)), theme.fog, haze)
        : tint;
      // The ground beside this node takes its colours from this node, which is
      // how a circuit can leave the hills and arrive at the sea inside a lap.
      const local = !route.theme && a.warm > 0.02 && a.warm < 0.98
        ? this.theme(a.warm)
        : theme;

      // Tarmac, in bands of three nodes, which is the oldest trick there is for
      // telling you how fast you are going without a speedometer. The lighter
      // band is a chequer of the two greys rather than a third colour, because
      // there is no third colour between them to have.
      // How wide the road is here, and at the node after it. Two numbers rather
      // than one because the tarmac is a quad between two nodes and a surveyed
      // circuit changes width along it: a road drawn to the near node's width at
      // both ends steps in and out every six metres, which reads as a ragged
      // edge rather than as a road that narrows.
      const ha = a.half;
      const hb = b.half;
      rt.dither = (i % 6) < 3 ? 0 : road(C.roadAlt);
      rt.quad(
        a.x - a.nx * ha, roadY(a, -ha), a.z - a.nz * ha,
        a.x + a.nx * ha, roadY(a, ha), a.z + a.nz * ha,
        b.x + b.nx * hb, roadY(b, hb), b.z + b.nz * hb,
        b.x - b.nx * hb, roadY(b, -hb), b.z - b.nz * hb,
        road(C.road),
      );
      rt.dither = 0;
      // Kerbs. Red and white, one node each, which at three hundred and fifty is
      // sixteen stripes a second going past at the edge of the screen.
      const kerb = road((i % 2) < 1 ? C.kerbA : C.kerbB);
      for (const side of [-1, 1]) {
        const ea = side * (ha + RUMBLE);
        const eb = side * (hb + RUMBLE);
        rt.quad(
          a.x + a.nx * side * ha, roadY(a, side * ha), a.z + a.nz * side * ha,
          a.x + a.nx * ea, roadY(a, ea), a.z + a.nz * ea,
          b.x + b.nx * eb, roadY(b, eb), b.z + b.nz * eb,
          b.x + b.nx * side * hb, roadY(b, side * hb), b.z + b.nz * side * hb,
          kerb,
        );
      }

      // A broken line down the middle: three nodes of paint and three of
      // nothing, which at three hundred and fifty is eight dashes a second
      // arriving at the centre of the screen. The edge lines tell you where the
      // track is; this one tells you how fast you are crossing it.
      if ((((i % 6) + 6) % 6) < 3 && away < 520) {
        rt.quad(
          a.x - a.nx * 0.28, roadY(a, 0) + 0.04, a.z - a.nz * 0.28,
          a.x + a.nx * 0.28, roadY(a, 0) + 0.04, a.z + a.nz * 0.28,
          b.x + b.nx * 0.28, roadY(b, 0) + 0.04, b.z + b.nz * 0.28,
          b.x - b.nx * 0.28, roadY(b, 0) + 0.04, b.z - b.nz * 0.28,
          road(C.kerbB),
        );
      }

      // The white line down each edge of the tarmac, lifted a few centimetres so
      // it is not fighting the road it is painted on.
      for (const side of [-1, 1]) {
        const ia = side * (ha - 0.3);
        const oa = side * ha;
        const ib = side * (hb - 0.3);
        const ob = side * hb;
        rt.quad(
          a.x + a.nx * ia, roadY(a, ia) + 0.04, a.z + a.nz * ia,
          a.x + a.nx * oa, roadY(a, oa) + 0.04, a.z + a.nz * oa,
          b.x + b.nx * ob, roadY(b, ob) + 0.04, b.z + b.nz * ob,
          b.x + b.nx * ib, roadY(b, ib) + 0.04, b.z + b.nz * ib,
          road(C.kerbB),
        );
      }

      // The barrier: a rail on posts, all the way round, both sides. It is what
      // turns a road into a circuit, and it is the second best thing in the game
      // for the feeling of speed after the marker posts.
      //
      // Drawn at the height of the track rather than on the ground it stands
      // over. A barrier beside a road is at the height of the road by
      // definition; taken off the terrain it slid down the beach on the sea
      // front and left the edge of the track dropping into nothing. On the
      // bridge there is none, because there the railing is the barrier.
      if (away < 640 && a.bridge === undefined && !a.deck) {
        for (const side of [-1, 1]) {
          const at = side * a.wall;
          const ax = a.x + a.nx * at;
          const az = a.z + a.nz * at;
          const bx = b.x + b.nx * at;
          const bz = b.z + b.nz * at;
          const ay = roadY(a, at);
          const by = roadY(b, at);
          rt.quad(ax, ay + 0.5, az, bx, by + 0.5, bz, bx, by + 1.05, bz, ax, ay + 1.05, az,
            tint((i % 8) < 4 ? C.armco : C.kerbA));
          rt.quad(ax, ay + 0.5, az, ax, ay + 1.05, az, bx, by + 1.05, bz, bx, by + 0.5, bz,
            tint(shade(C.armco, 0.7)));
        }
      }

      // The ground: four bands a side, each drawn less often than the one
      // inside it.
      // No ground at all on a viaduct: the road there is twenty metres in the
      // air over another piece of road, and its ground would be a plain laid
      // across the one underneath.
      // No ground inside a tunnel and none on a viaduct. In a tunnel there is a
      // wall where the verge would be, and drawing the verge through it puts a
      // strip of daylit grass along the inside of a mountain.
      // Ground stops where the tunnel starts, and not a node later. A band
      // reaches ninety-five metres sideways, so one node at the mouth still
      // drawing its ground lays a strip of daylit verge along twenty metres of
      // tunnel floor - which is what it did, and what it looked like was a pale
      // wedge across the road that no amount of darkening would touch, because
      // the node it belonged to was outside and therefore not dark.
      /**
       * The ground, out as far as this circuit has any.
       *
       * All four bands everywhere except a street circuit, where the far ones
       * are wrong twice over: you cannot see three hundred metres of open
       * ground down a street because there are buildings in the way, and on a
       * circuit that folds back on itself those bands belong to other parts of
       * the lap and arrive across the view at an angle. Fogged to the fog
       * colour they are invisible in themselves; what gives them away is the
       * hard edge where they meet the sky.
       */
      for (let band = 0; band < BANDS.length && band < a.reach
        && !a.deck && roof < 0.05; band++) {
        const [inner0, outer, kind, every] = BANDS[band];
        // The first band starts at the kerb, wherever the kerb happens to be.
        const inner = band === 0 ? Math.max(ha + RUMBLE, inner0 - (ROAD_HALF - ha)) : inner0;
        if (((i % every) + every) % every !== 0) continue;
        const far = nodeStep(route, i, every);
        for (const side of [-1, 1]) {
          const colour = bandColour(local, a, side, kind, i, this.surf);
          rt.quad(
            a.x + a.nx * side * inner, groundY(a, side, inner), a.z + a.nz * side * inner,
            a.x + a.nx * side * outer, groundY(a, side, outer), a.z + a.nz * side * outer,
            far.x + far.nx * side * outer, groundY(far, side, outer), far.z + far.nz * side * outer,
            far.x + far.nx * side * inner, groundY(far, side, inner), far.z + far.nz * side * inner,
            tint(colour),
          );
        }
      }

      // Surf. A white line that shuffles along the waterline, and the single
      // cheapest thing in the game that makes the sea look wet.
      if (a.g.wet > 0.6 && (((i % 2) + 2) % 2) === 0 && away < 620) {
        const far = nodeStep(route, i, 2);
        const w0 = RINGS[1] + Math.sin(i * 0.7 + this.surf) * 2.2;
        const w1 = RINGS[1] + Math.sin((i + 2) * 0.7 + this.surf) * 2.2;
        rt.quad(
          a.x - a.nx * w0, a.g.l[1] + 0.06, a.z - a.nz * w0,
          a.x - a.nx * (w0 + 2.8), a.g.l[1] + 0.06, a.z - a.nz * (w0 + 2.8),
          far.x - far.nx * (w1 + 2.8), far.g.l[1] + 0.06, far.z - far.nz * (w1 + 2.8),
          far.x - far.nx * w1, far.g.l[1] + 0.06, far.z - far.nz * w1,
          tint(C.kerbB),
        );
      }

      this.startLine(state, a.i, a, b, tint);
      if (a.bridge !== undefined) this.bridge(route, a, b, tint);
      if (a.deck) this.viaduct(a, b, tint, i);
      // Built only where the tunnel is properly a tunnel. The darkness eases in
      // over the mouth by itself, and easing the geometry in with it was the
      // mistake: a roof at five and a half metres times a tenth is a slab six
      // inches above the road, and what that looks like from inside is a pale
      // wedge lying across the floor.
      // And the tunnel takes over from exactly there, at full height, so the
      // mouth is a portal rather than a gap. It is a portal in life too.
      if (roof > 0.05) this.tunnel(a, b, tint, i);

      const props = route.props[a.i];
      if (props && away < 900) {
        for (const prop of props) {
          const off = prop.side * prop.off;
          // Anything that belongs to the track is turned to face along it. A
          // gantry is a wall across the road if it is left pointing at world
          // north, and the track only points at world north twice a lap.
          // `lift` is for the things that are not standing on anything.
          // `flat` stands a prop at the height of the track rather than on
          // whatever the ground is doing out there. A floodlight beside a
          // boulevard belongs level with the road; the ground at that distance
          // on the seaward side is the sea, and a lamp post standing in it is
          // a lamp post standing in the sea.
          const foot = prop.flat
            ? roadY(a, off)
            : groundY(a, Math.sign(off) || 1, Math.abs(off));
          drawProp(rt, prop,
            a.x + a.nx * off, foot + (prop.lift || 0), a.z + a.nz * off,
            tint, local, prop.align ? a.a : 0, state.tick, night);
        }
      }
    }
  }

  /**
   * A tunnel: two walls, a roof and a light in it.
   *
   * The walls stand at the barrier and the roof is five and a half metres up,
   * which is a road tunnel. Both fade in over the same easing the darkness uses,
   * so the mouth arrives as a mouth rather than as a wall appearing in front of
   * the car - and the light is a strip down the middle of the roof, on always,
   * because a tunnel is lit whatever time of day it is outside.
   *
   * Monaco's is eight hundred and forty metres of it, and neither the length nor
   * the position was decided here: OpenStreetMap tags the road as a tunnel and
   * the importer carried the tag through.
   */
  tunnel(a, b, tint, i) {
    const rt = this.rt;
    const wide = a.wall + 0.4;
    const high = 5.5;
    const wall = tint(shade(C.chrome, 0.5));
    const ceiling = tint(shade(C.shadow, 1.35));
    const strip = mix(C.lamp, C.hot, 0.25);

    for (const side of [-1, 1]) {
      const at = side * wide;
      const ax = a.x + a.nx * at;
      const az = a.z + a.nz * at;
      const bx = b.x + b.nx * at;
      const bz = b.z + b.nz * at;
      const ay = roadY(a, at);
      const by = roadY(b, at);
      rt.quad(ax, ay, az, bx, by, bz, bx, by + high, bz, ax, ay + high, az, wall);
    }
    // The roof, and a lit strip down the middle of it.
    const ay = roadY(a, 0) + high;
    const by = roadY(b, 0) + high;
    rt.quad(
      a.x - a.nx * wide, ay, a.z - a.nz * wide,
      b.x - b.nx * wide, by, b.z - b.nz * wide,
      b.x + b.nx * wide, by, b.z + b.nz * wide,
      a.x + a.nx * wide, ay, a.z + a.nz * wide,
      ceiling,
    );
    if ((((i % 3) + 3) % 3) === 0) {
      rt.quad(
        a.x - a.nx * 1.1, ay - 0.12, a.z - a.nz * 1.1,
        b.x - b.nx * 1.1, by - 0.12, b.z - b.nz * 1.1,
        b.x + b.nx * 1.1, by - 0.12, b.z + b.nz * 1.1,
        a.x + a.nx * 1.1, ay - 0.12, a.z + a.nz * 1.1,
        strip,
      );
    }
  }

  /**
   * The flyover, where a circuit crosses its own path.
   *
   * Only Suzuka has one, and Suzuka is the reason it exists: a figure of eight
   * has to pass over itself somewhere, and the road that does the passing cannot
   * simply hang there. So it gets an underside, two fascias, a parapet you
   * cannot drive through, and a pier every fifth node down to the road below.
   *
   * Drawn from the node's own width, so it narrows with the tarmac it carries.
   */
  viaduct(a, b, tint, i) {
    const rt = this.rt;
    const t = a.deck;
    const ha = a.half + 1.1;
    const hb = b.half + 1.1;
    const drop = 1.4 + 1.2 * t;
    const concrete = tint(shade(C.chrome, 0.74));
    const dark = tint(shade(C.chrome, 0.56));
    const rail = tint(C.armco);

    // The underside, which is the only part of it anybody sees from below.
    rt.quad(
      a.x - a.nx * ha, roadY(a, -ha) - drop, a.z - a.nz * ha,
      b.x - b.nx * hb, roadY(b, -hb) - drop, b.z - b.nz * hb,
      b.x + b.nx * hb, roadY(b, hb) - drop, b.z + b.nz * hb,
      a.x + a.nx * ha, roadY(a, ha) - drop, a.z + a.nz * ha,
      dark,
    );
    for (const side of [-1, 1]) {
      const oa = side * ha;
      const ob = side * hb;
      const ax = a.x + a.nx * oa;
      const az = a.z + a.nz * oa;
      const bx = b.x + b.nx * ob;
      const bz = b.z + b.nz * ob;
      const ay = roadY(a, oa);
      const by = roadY(b, ob);
      // The fascia: the depth of the deck, seen from the side.
      rt.quad(ax, ay, az, bx, by, bz, bx, by - drop, bz, ax, ay - drop, az, concrete);
      // The parapet, which is what stops the car.
      rt.quad(ax, ay, az, bx, by, bz, bx, by + 0.95, bz, ax, ay + 0.95, az,
        (i % 8) < 4 ? rail : tint(C.kerbA));
      // A pier every fifth node, down to the road underneath.
      if (t > 0.98 && ((i % 5) + 5) % 5 === 0 && a.deckFoot !== undefined) {
        const px = a.x + a.nx * oa * 0.72;
        const pz = a.z + a.nz * oa * 0.72;
        const py = ay - drop;
        rt.quad(px - 1.1, py, pz, px + 1.1, py, pz,
          px + 1.1, a.deckFoot, pz, px - 1.1, a.deckFoot, pz, concrete);
        rt.quad(px, py, pz - 1.1, px, py, pz + 1.1,
          px, a.deckFoot, pz + 1.1, px, a.deckFoot, pz - 1.1, dark);
      }
    }
  }

  /**
   * The chequered line, and the boxes the grid is painted in.
   *
   * The line is node zero, which on a circuit is a place you come back to rather
   * than a place you leave, so it is drawn every lap. The boxes behind it are
   * only worth drawing while there is anybody standing on them.
   */
  startLine(state, node, a, b, tint) {
    const rt = this.rt;
    if (node === 0) {
      for (let k = -5; k < 5; k++) {
        const x0 = k * (a.half / 5);
        const x1 = (k + 1) * (a.half / 5);
        rt.quad(
          a.x + a.nx * x0, roadY(a, x0) + 0.05, a.z + a.nz * x0,
          a.x + a.nx * x1, roadY(a, x1) + 0.05, a.z + a.nz * x1,
          b.x + b.nx * x1, roadY(b, x1) + 0.05, b.z + b.nz * x1,
          b.x + b.nx * x0, roadY(b, x0) + 0.05, b.z + b.nz * x0,
          tint(k % 2 ? C.kerbB : C.shadow),
        );
      }
      return;
    }
    if (!racing(state)) {
      const count = state.route.nodes.length;
      for (let slot = 0; slot < state.field; slot++) {
        const at = Math.round(-(24 + slot * GRID_GAP) / SEG);
        if (((at % count) + count) % count !== node) continue;
        const side = slot % 2 === 0 ? -1 : 1;
        const x0 = side * GRID_OFF - 1.3;
        const x1 = side * GRID_OFF + 1.3;
        rt.quad(
          a.x + a.nx * x0, roadY(a, x0) + 0.045, a.z + a.nz * x0,
          a.x + a.nx * x1, roadY(a, x1) + 0.045, a.z + a.nz * x1,
          b.x + b.nx * x1, roadY(b, x1) + 0.045, b.z + b.nz * x1,
          b.x + b.nx * x0, roadY(b, x0) + 0.045, b.z + b.nz * x0,
          tint(C.kerbB),
        );
      }
    }
  }

  /**
   * The red bridge: the one bit of the circuit you drive over rather than past.
   *
   * Everything here follows the track, which is why it is drawn node by node
   * rather than placed as a prop: the deck is the track, the railings are the
   * edges of it, and the cable is a curve hung between two towers that are
   * themselves standing on a road that goes up and down. A prop would be a model
   * of a bridge standing near one.
   *
   * The cable is the whole thing. Take it away and this is a road with red walls
   * on it; put it back and it is a crossing, from half a mile away, in eight
   * quads a node.
   */
  bridge(route, a, b, tint) {
    const rt = this.rt;
    const red = tint(C.kerbA);
    const dark = tint(shade(C.kerbA, 0.66));
    const edge = ROAD_HALF + 0.7;
    const cableX = ROAD_HALF + 1.5;

    // The railings, along both edges, all the way over.
    for (const side of [-1, 1]) {
      const ax = a.x + a.nx * side * edge;
      const az = a.z + a.nz * side * edge;
      const bx = b.x + b.nx * side * edge;
      const bz = b.z + b.nz * side * edge;
      const ay = roadY(a, side * edge);
      const by = roadY(b, side * edge);
      // The face, and a flat top rail on it. The top rail used to be the same
      // quad wound the other way, which is not a second surface, it is the same
      // surface fighting itself for the depth buffer - and it came out as a red
      // venetian blind the length of the bridge.
      rt.quad(ax, ay, az, bx, by, bz, bx, by + 1.3, bz, ax, ay + 1.3, az, red);
      const inx = a.nx * side * 0.22;
      const inz = a.nz * side * 0.22;
      rt.quad(ax - inx, ay + 1.3, az - inz, ax + inx, ay + 1.3, az + inz,
        bx + inx, by + 1.3, bz + inz, bx - inx, by + 1.3, bz - inz, dark);
    }

    // The cable, and the hangers holding the deck off it.
    const ca = cableHeight(a.bridge);
    const cb = cableHeight(b.bridge);
    for (const side of [-1, 1]) {
      const ax = a.x + a.nx * side * cableX;
      const az = a.z + a.nz * side * cableX;
      const bx = b.x + b.nx * side * cableX;
      const bz = b.z + b.nz * side * cableX;
      const ay = roadY(a, side * cableX) + ca;
      const by = roadY(b, side * cableX) + cb;
      rt.quad(ax, ay, az, bx, by, bz, bx, by + 0.45, bz, ax, ay + 0.45, az, red);
      if (a.i % 3 === 0 && ca > 2.4) {
        const hy = roadY(a, side * cableX);
        rt.quad(ax - a.nx * 0.16, hy, az - a.nz * 0.16, ax + a.nx * 0.16, hy, az + a.nz * 0.16,
          ax + a.nx * 0.16, hy + ca, az + a.nz * 0.16, ax - a.nx * 0.16, hy + ca, az - a.nz * 0.16,
          dark);
      }
    }

    // And the two towers, on the nodes nearest where they belong.
    for (const at of TOWERS) {
      if (Math.abs(a.bridge - at) > 0.5 / BRIDGE_NODES) continue;
      const high = cableHeight(at) + 3.5;
      for (const side of [-1, 1]) {
        const tx = a.x + a.nx * side * cableX;
        const tz = a.z + a.nz * side * cableX;
        const ty = roadY(a, side * cableX);
        // A leg, as a box: two faces across the track and two along it.
        for (const [dx, dz] of [[a.nx * 1.1, a.nz * 1.1], [a.dx * 1.1, a.dz * 1.1]]) {
          rt.quad(tx - dx, ty, tz - dz, tx + dx, ty, tz + dz,
            tx + dx, ty + high, tz + dz, tx - dx, ty + high, tz - dz,
            dx === a.nx * 1.1 ? red : dark);
        }
      }
      // Two crossbeams between the legs, which is what makes it a tower rather
      // than two posts.
      for (const h of [high * 0.55, high - 1.6]) {
        rt.quad(
          a.x - a.nx * cableX, roadY(a, -cableX) + h, a.z - a.nz * cableX,
          a.x + a.nx * cableX, roadY(a, cableX) + h, a.z + a.nz * cableX,
          a.x + a.nx * cableX, roadY(a, cableX) + h + 1.6, a.z + a.nz * cableX,
          a.x - a.nx * cableX, roadY(a, -cableX) + h + 1.6, a.z - a.nz * cableX,
          red,
        );
      }
    }
  }

  /** The other seven, and you. */
  cars(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    for (const car of state.cars) {
      const away = car.s - p.s;
      if (away < -60 || away > 780) continue;
      const at = this.at(state, car);
      // A car right on the camera fills a quarter of the screen with one dark
      // polygon and reads as a fault in the renderer. It is also almost entirely
      // behind you: the camera sits eight metres back, so anything this close is
      // a car you are about to be overtaken by and cannot see anyway.
      if (Math.hypot(at.x - this.cam.x, at.z - this.cam.z) < 5.4) continue;
      const tint = this.tinter(theme, Math.abs(away));
      const yaw = at.a + car.yaw;
      // Nose up the hill or down it, so the car sits on the road rather than
      // through it.
      const pitch = -Math.atan(at.slope);
      drawShadow(rt, at.x, at.y, at.z, yaw, 1.15, 2.5, tint, pitch);
      drawRacer(rt, car, at.x, at.y, at.z, yaw, tint, this.lightAt, pitch);
      // Smoke when the tyres have given up, dust when they are on the grass.
      const rough = Math.abs(car.x) > at.node.half + RUMBLE;
      if ((car.slide > 2 || rough) && car.speed > 8) {
        drawSmoke(rt, car, at.x, at.y, at.z, yaw, tint, rough, state.tick + car.slot * 7);
      }
    }
  }

  /**
   * The circuit, from above, worked out once and kept.
   *
   * A hundred points round the lap, scaled to fit the box, stored as pixel
   * offsets. It is not drawn from the nodes every frame because it never
   * changes: the shape of the track is decided before the lights go out and the
   * only thing that moves on it is the cars.
   *
   * This is also the only place in the game that looks at the circuit as a
   * shape rather than as a distance, which is the whole reason it is worth
   * having on the screen - it is the one thing the view out of the cockpit
   * cannot tell you.
   */
  map(route) {
    if (this.mapOf === route.key) return this.mapPts;
    const nodes = route.nodes;
    // Enough points that the outline is a line rather than a dotted one: about
    // one per pixel of its perimeter, which for a box this size is under two
    // hundred of them and costs nothing because it is worked out once.
    const step = Math.max(1, Math.floor(nodes.length / 190));
    let minX = Infinity; let maxX = -Infinity; let minZ = Infinity; let maxZ = -Infinity;
    for (let i = 0; i < nodes.length; i += step) {
      minX = Math.min(minX, nodes[i].x); maxX = Math.max(maxX, nodes[i].x);
      minZ = Math.min(minZ, nodes[i].z); maxZ = Math.max(maxZ, nodes[i].z);
    }
    const scale = Math.min((MAP_W - 5) / Math.max(1, maxX - minX),
      (MAP_H - 5) / Math.max(1, maxZ - minZ));
    /**
     * North at the top, which took noticing.
     *
     * The world's z is northing and a screen's y counts downward, so mapping one
     * straight onto the other puts north at the bottom and hands you a track map
     * that is a mirror image of every track map ever printed. On the three drawn
     * circuits nobody could tell. On the seventeen real ones it is the first
     * thing anybody who knows the place will see, and what it reads as is not
     * "upside down" but "you have mirrored my circuit".
     *
     * The circuits themselves were never mirrored - a point placed on the left of
     * the car lands on the left of the screen, checked - and this is the map
     * alone.
     */
    const place = (x, z) => [
      Math.round(2 + (x - minX) * scale + (MAP_W - 4 - (maxX - minX) * scale) / 2),
      Math.round(2 + (maxZ - z) * scale + (MAP_H - 4 - (maxZ - minZ) * scale) / 2),
    ];
    const pts = [];
    for (let i = 0; i < nodes.length; i += step) pts.push(place(nodes[i].x, nodes[i].z));
    this.mapOf = route.key;
    this.mapPts = { pts, place, start: place(nodes[0].x, nodes[0].z) };
    return this.mapPts;
  }

  /** The map, the field on it, and you. */
  drawMap(state, p, x, y) {
    const rt = this.ui;
    const { pts, place, start } = this.map(state.route);
    rt.panel(x, y, MAP_W, MAP_H, HUD_BACK, HUD_EDGE);
    for (const [px, py] of pts) rt.rect(x + px, y + py, 1, 1, HUD_DIM);
    rt.rect(x + start[0] - 1, y + start[1] - 1, 3, 3, HUD_TEXT);
    // Everybody else first, so you are never underneath one of them.
    for (const car of state.cars) {
      if (car === p) continue;
      const at = worldOf(state.route, car.s, car.x);
      const [px, py] = place(at.x, at.z);
      rt.rect(x + px - 1, y + py - 1, 2, 2, TEAM_COLOURS[car.team % 8].body);
    }
    const me = worldOf(state.route, p.s, p.x);
    const [px, py] = place(me.x, me.z);
    // Blinking, because on a map this size a stationary dot among seven others
    // is a dot you have to hunt for and this one you have to find at a glance.
    rt.rect(x + px - 1, y + py - 1, 3, 3, (state.tick % 40) < 26 ? WARN : HUD_TEXT);
  }

  /** A fog function for one distance, made once and handed to a model. */
  tinter(theme, away) {
    const f = fog(away);
    return (colour) => mix(this.lampCar(colour), theme.fog, f);
  }

  // --- The panel ------------------------------------------------------------

  /**
   * The head-up display.
   *
   * Six things, and which six depends on what you came out to do. Qualifying
   * wants the lap you are on, the lap you just did and the best you have
   * managed; a grand prix wants where you are and who is in front. The clock,
   * the speed, the gear and the map are the same either way.
   *
   * Everything is in the corner an arcade cabinet put it in, and the biggest
   * thing on the screen is whichever number you are actually playing for.
   *
   * All of it is laid out against a screen four hundred and eighty across and
   * scaled onto whatever the screen actually is, which is what `ui` below is
   * for.
   */

  /**
   * The raster, taking coordinates in the HUD's own four-hundred-and-eighty-wide
   * space instead of in pixels.
   */
  get ui() {
    if (this._ui) return this._ui;
    const rt = this.rt;
    const u = HUD_SCALE;
    const q = (n) => Math.round(n * u);
    // At least one, and whole: half a pixel of bitmap font is no font at all.
    const k = (n) => Math.max(1, Math.round((n || 1) * u));
    this._ui = {
      panel: (x, y, w, h, a, b) => rt.panel(q(x), q(y), q(w), q(h), a, b),
      rect: (x, y, w, h, c) => rt.rect(q(x), q(y), q(w), q(h), c),
      /**
       * A rectangle given by its edges rather than by a corner and a size.
       *
       * The difference matters wherever shapes are built out of rows. Scaling a
       * position and a height separately rounds each of them on its own, so two
       * rows that touched at four hundred and eighty are one pixel apart at six
       * hundred and forty - or one pixel on top of each other. The corner arrow
       * was eight such rows and came out with a comb down the side of it.
       * Scaling both edges instead makes the next row start exactly where the
       * last one stopped, whatever the scale is.
       */
      span: (x0, y0, x1, y1, c) => rt.rect(q(x0), q(y0), q(x1) - q(x0), q(y1) - q(y0), c),
      text: (str, x, y, c, n) => rt.text(str, q(x), q(y), c, k(n)),
      textMid: (str, x, y, c, n) => rt.textMid(str, q(x), q(y), c, k(n)),
      blit: (...args) => rt.blit(...args),
    };
    return this._ui;
  }

  hud(state, p) {
    const rt = this.ui;
    const W = HUD_BASE_W;
    const SCREEN_H = HUD_BASE_H;
    const qual = state.mode === 'qual';

    // The clock, in the middle, big, and red when it is nearly gone.
    const urgent = state.clock < 10;
    const clockColour = urgent && (state.tick % 30) < 15 ? BAD : state.clock < 20 ? WARN : HUD_TEXT;
    rt.panel(W / 2 - 26, 3, 52, 22, HUD_BACK, HUD_EDGE);
    rt.textMid(formatClock(state.clock), W / 2, 7, clockColour, 2);

    // The lap you are on and how long you have been on it, top left.
    rt.panel(4, 3, 92, 20, HUD_BACK, HUD_EDGE);
    rt.text('LAP', 8, 6, HUD_DIM);
    rt.text(`${Math.min(state.laps, lapOf(p) + 1)}/${state.laps}`, 28, 6, HUD_TEXT);
    rt.text(formatTime(state.elapsed - p.lapFrom), 50, 6, HUD_TEXT);
    rt.rect(8, 16, 84, 2, shade(HUD_EDGE, 0.6));
    rt.rect(8, 16, Math.round(84 * progress(state)), 2, GOOD);

    // The circuit from above, with everybody on it. The one thing the view out
    // of the cockpit cannot tell you is what the next corner but one is.
    this.drawMap(state, p, 4, 26);

    // Top right: where you are, or what you came out here to beat.
    rt.panel(W - 84, 3, 80, 26, HUD_BACK,
      (qual ? p.best && state.lapNote > 0 : state.place === 1) ? WARN : HUD_EDGE);
    if (qual) {
      rt.text('BEST', W - 80, 6, HUD_DIM);
      rt.text(p.best ? formatTime(p.best) : '-:--.--', W - 80, 16, p.best ? WARN : HUD_DIM);
    } else {
      rt.text(ordinal(state.place), W - 80, 6, state.place <= 3 ? WARN : HUD_TEXT, 2);
      rt.text(`OF ${state.field}`, W - 40, 12, HUD_DIM);
    }

    // Speed and gear, bottom right, because it is where a right hand is already
    // pointing. The rev bar above them is the only part of the gearbox that
    // exists, and it is enough.
    const speed = kmh(p.speed);
    const { gear, rev } = gearAt(p.speed);
    // Held against the limiter on the grid, which is what the engine is doing
    // and what a dial reading zero would be flatly contradicting.
    const needle = racing(state) ? rev : 0.72 + Math.sin(state.tick * 0.6) * 0.22;
    rt.panel(W - 84, SCREEN_H - 34, 80, 30, HUD_BACK, HUD_EDGE);
    for (let i = 0; i < 16; i++) {
      const on = i / 16 < needle;
      rt.rect(W - 80 + i * 4, SCREEN_H - 31, 3, 4,
        on ? (i > 12 ? BAD : i > 9 ? WARN : GOOD) : shade(HUD_EDGE, 0.45));
    }
    rt.text(`${speed}`.padStart(3, ' '), W - 80, SCREEN_H - 24, speed > 300 ? WARN : HUD_TEXT, 2);
    rt.text('KM/H', W - 42, SCREEN_H - 12, HUD_DIM);
    rt.text(`${gear}`, W - 18, SCREEN_H - 24, WARN, 2);

    // Bottom left: the last lap, or the man in front and how long it would take
    // to get there.
    rt.panel(4, SCREEN_H - 34, 104, 30, HUD_BACK, HUD_EDGE);
    const row = SCREEN_H - 30;
    if (qual) {
      rt.text('LAST', 8, row, HUD_DIM);
      rt.text(p.last ? formatTime(p.last) : '-:--.--', 34, row,
        p.last && p.last === p.best ? WARN : HUD_TEXT);
      rt.text(`${state.laps - lapOf(p)} TO GO`, 8, row + 10, HUD_DIM);
    } else {
      const ahead = state.order && state.order[p.place - 2];
      if (ahead) {
        rt.text('AHEAD', 8, row, HUD_DIM);
        rt.text(`-${formatGap(p.gap)}`, 44, row, p.gap < 1.2 ? WARN : HUD_TEXT);
        rt.text(teamName(ahead), 8, row + 10, HUD_TEXT);
      } else {
        rt.text('LEADING', 8, row, WARN);
        const behind = state.order && state.order[1];
        if (behind) rt.text(`+${formatGap(behind.gap)}`, 8, row + 10, HUD_TEXT);
      }
      // The tow, when you are in one. It is worth twenty km/h and you should know.
      if (p.tow > 0.15) {
        rt.text('TOW', 76, row + 10, (state.tick % 20) < 10 ? WARN : HUD_DIM);
      }
    }

    this.cornerSign(state, p);

    // The lap you have just done, in the middle, for two seconds.
    if (state.lapNote > 0) {
      const fresh = p.last && p.last === p.best;
      rt.panel(W / 2 - 52, 44, 104, 24, HUD_BACK, fresh ? WARN : HUD_EDGE);
      rt.textMid(fresh ? 'BEST LAP' : `LAP ${lapOf(p)}`, W / 2, 48, fresh ? WARN : HUD_DIM);
      rt.textMid(formatTime(p.last), W / 2, 58, HUD_TEXT);
    } else if (state.checkNote > 0) {
      rt.panel(W / 2 - 62, 44, 124, 24, HUD_BACK, GOOD);
      rt.textMid('CHECKPOINT', W / 2, 48, GOOD);
      rt.textMid(`+${Math.round(state.cfg.clock * state.rules.clock * CHECKPOINT_TIME)} SECONDS`,
        W / 2, 58, HUD_TEXT);
    }

    if (!racing(state)) this.lights(state);
  }

  /**
   * The board at the side of the road, a corner early.
   *
   * Looks half a straight up the track for the sharpest thing on it and draws an
   * arrow for it if it is worth a warning. Everybody who has ever played one of
   * these reads it without being told, and without it a blind crest on the pass
   * is a guess rather than a corner.
   *
   * An arrow rather than a chevron, and drawn as a solid triangle. A chevron at
   * this size is five pixels of outline and reads as a smudge; a triangle reads
   * as a direction from across the room.
   */
  cornerSign(state, p) {
    const from = nodeAt(state.route, p.s).i;
    let worst = 0;
    let at = 0;
    for (let n = 6; n < 46; n++) {
      const node = nodeStep(state.route, from, n);
      if (Math.abs(node.curve) > Math.abs(worst)) {
        worst = node.curve;
        at = n;
      }
    }
    if (Math.abs(worst) < 0.035) return;

    const rt = this.ui;
    // The same three grades the boards beside the track use, worked out the same
    // way, so the panel and the verge never say different things about the same
    // corner. Six over the curvature is the radius.
    const peak = Math.abs(worst);
    const sharp = peak > 0.12 ? 3 : peak > 0.055 ? 2 : 1;
    const near = at < 24;
    const colour = sharp >= 3 ? (near ? BAD : WARN) : sharp === 2 ? WARN : HUD_DIM;
    const bend = worst > 0 ? 1 : -1;
    const wide = 10 + sharp * 8;
    const x = HUD_BASE_W / 2 + (bend > 0 ? 26 : -26 - wide);
    rt.panel(x, 28, wide, 20, HUD_BACK, colour);

    // Chevrons, drawn as rows between two edges rather than as rows of a fixed
    // height, so they tile exactly at any scale.
    const mid = 38;
    const tall = 6;
    for (let c = 0; c < sharp; c++) {
      const tip = bend > 0 ? x + wide - 5 - c * 8 : x + 5 + c * 8;
      for (let row = 0; row <= tall * 2; row++) {
        const y = mid - tall + row;
        // Distance back from the tip grows to the middle of the chevron and
        // shrinks again, which is what makes it an arrowhead and not a triangle.
        const back = Math.abs(row - tall) * 0.62;
        const from = tip - bend * (back + 3.4);
        const to = tip - bend * back;
        rt.span(Math.min(from, to), y, Math.max(from, to), y + 1, colour);
      }
    }
  }

  /**
   * Five lights on, one at a time, and then all of them gone at once.
   *
   * That is the order they actually go in and it is a better piece of drama than
   * a countdown: the tension is in not knowing which of the five is the last
   * one, and the start is the moment the row goes dark rather than the moment a
   * number reaches zero.
   */
  lights(state) {
    const rt = this.ui;
    const W = HUD_BASE_W;
    const on = Math.min(5, Math.floor((LIGHTS - state.lights) / 40));
    rt.panel(W / 2 - 56, 78, 112, 24, HUD_BACK, HUD_EDGE);
    for (let i = 0; i < 5; i++) {
      const lit = i < on;
      rt.rect(W / 2 - 50 + i * 21, 82, 16, 16, lit ? BAD : shade(HUD_EDGE, 0.4));
    }
    if (on >= 5) rt.textMid('READY', W / 2, 106, WARN);
  }
}

/**
 * How high the cable is above the deck, across the span.
 *
 * Up to the first tower, a sag between the two, and down again to the far
 * abutment. It is the shape everybody recognises and it is three lines: the
 * middle one is a sine, which is close enough to a catenary that nobody who has
 * seen a real bridge would say otherwise at this resolution.
 */
function cableHeight(t) {
  const [first, last] = TOWERS;
  const high = 27;
  const sag = 8;
  const end = 1.2;
  if (t <= first) return end + (high - end) * (t / first);
  if (t >= last) return end + (high - end) * ((1 - t) / (1 - last));
  const u = (t - first) / (last - first);
  return sag + (high - sag) * (1 - Math.sin(u * Math.PI));
}

/** How much of the haze colour is in something this far away. */
function fog(away) {
  if (away <= FOG_NEAR) return 0;
  const t = (away - FOG_NEAR) / (FOG_FAR - FOG_NEAR);
  return Math.min(1, t) ** 0.75;
}

/** The tarmac's height at an offset, including the camber into the corner. */
function roadY(n, off) {
  return n.y - n.bank * off * 0.12 - n.dish * off;
}

/**
 * The ground's height, wherever it is.
 *
 * Inside the kerb it is the track; outside it, the three heights the route wrote
 * down, with straight lines between them. A straight line between two heights
 * ninety metres apart is not a hillside anybody would model by hand, and at this
 * resolution it is indistinguishable from one.
 */
/**
 * How far under the kerb the ground starts, so that a road is never lost to
 * another piece of the circuit's ground in the depth test.
 */
const GROUND_DROP = 0.15;

function groundY(n, side, off) {
  const g = side < 0 ? n.g.l : n.g.r;
  const far = side < 0 ? n.g.far[0] : n.g.far[1];
  const kerb = n.half + RUMBLE;
  if (off <= kerb) return roadY(n, side * off);
  // Past the kerb the ground steps down a hand's breadth.
  //
  // Not for the look of it - at fifteen centimetres under the kerb nobody will
  // ever see it - but so that a road always beats somebody else's ground in the
  // depth test. Where a circuit runs close to itself the two are at the same
  // height and coplanar, and the ground of the far one was winning: at Monaco a
  // slab of it lay across the track for two hundred metres, with the barriers of
  // the other carriageway drawn over the road as well.
  if (off <= RINGS[0]) {
    return lerp(roadY(n, side * kerb) - GROUND_DROP, g[0], (off - kerb) / (RINGS[0] - kerb));
  }
  if (off <= RINGS[1]) return lerp(g[0], g[1], (off - RINGS[0]) / (RINGS[1] - RINGS[0]));
  if (off <= RINGS[2]) return lerp(g[1], g[2], (off - RINGS[1]) / (RINGS[2] - RINGS[1]));
  if (off <= RINGS[3]) return lerp(g[2], far, (off - RINGS[2]) / (RINGS[3] - RINGS[2]));
  return far;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * What colour a band of ground is.
 *
 * The sea is the interesting case: it is one flat colour with a second one
 * shuffled through it in stripes, which is precisely how every sixteen-bit game
 * drew water and still the best way to do it in a renderer with no textures.
 */
function bandColour(theme, node, side, kind, i, surf) {
  // Under the bridge it is water on both sides; everywhere else the sea is only
  // ever on the outside of the loop.
  // Water from the second ring outwards. The band between the barrier and it is
  // the bank the barrier stands on, and is sand or grass whatever is beyond it.
  if (node.g.wet > 0.5 && (side < 0 || node.g.bay > 0.5)
    && kind !== 'verge' && kind !== 'near') {
    const ripple = Math.sin(i * 0.5 + surf * 2) > 0.4;
    const water = ripple ? shade(theme.water, 1.18) : theme.water;
    // Eased in over the last half of the change, so the ground arrives at the
    // waterline instead of the waterline arriving at the ground.
    return mix(theme.near, water, Math.min(1, (node.g.wet - 0.5) * 4));
  }
  if (kind === 'verge') return (i % 6) < 3 ? theme.verge : shade(theme.verge, 0.92);
  if (kind === 'near') return (i % 8) < 4 ? theme.near : shade(theme.near, 0.94);
  if (kind === 'mid') return theme.mid;
  return theme.far;
}

/** Three letters of whoever is in front, off the team list. */
function teamName(car) {
  return ['ROSSO', 'ARGENT', 'AZUL', 'VERDE', 'AMBRA', 'NERO', 'BIANCO', 'VIOLA'][car.team % 8];
}
