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
  ROAD_HALF, RUMBLE, SCREEN_H, SCREEN_W, SEG, TOP_SPEED, WALL_AT,
} from '../constants.js';
import { RINGS } from '../game/route.js';
import {
  formatClock, formatGap, formatTime, kmh, lapOf, nodeAt, nodeStep, ordinal, player,
  progress, racing, worldOf,
} from '../game/state.js';
import { drawProp, drawRacer, drawShadow, drawSmoke } from './models.js';
import { C, TEAM_COLOURS, THEMES } from './palette.js';
import { md, mix, Raster, shade } from './raster.js';

/** Where the haze starts biting, and where nothing is left of the colour. */
const FOG_NEAR = 190;
const FOG_FAR = DRAW_AHEAD * SEG;

/**
 * The ground, in rings, as [inner, outer, which colour, how often].
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

const HUD_BACK = md(12, 12, 24);
const HUD_EDGE = md(80, 84, 110);
const HUD_TEXT = md(226, 230, 240);
const HUD_DIM = md(130, 136, 156);
const GOOD = md(60, 200, 90);
const WARN = md(240, 180, 40);
const BAD = md(220, 50, 40);

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.rt = new Raster(SCREEN_W, SCREEN_H);
    const off = document.createElement('canvas');
    off.width = SCREEN_W;
    off.height = SCREEN_H;
    this.buffer = off.getContext('2d');
    this.cam = null;
    this.surf = 0;
  }

  /** A new race: the camera must not glide in from where the last one ended. */
  reset() {
    this.cam = null;
  }

  size(width, height) {
    // Whole pixels only, and never smaller than the buffer, so the blow-up is a
    // clean multiple wherever it can be and the pixels stay square.
    this.canvas.width = Math.max(SCREEN_W, Math.round(width));
    this.canvas.height = Math.max(SCREEN_H, Math.round(height));
  }

  draw(state, { chrome = true } = {}) {
    const rt = this.rt;
    const p = player(state);
    const cam = this.follow(state, p);
    this.surf += 0.05;

    const theme = this.theme(nodeAt(state.route, p.s).t >= 0 ? state.route.nodes[nodeAt(state.route, p.s).i].warm : 0);
    // The horizon moves with the camera, so the sky bands move with it. Signed
    // the other way it looks almost right, which is worse than looking wrong.
    const lift = Math.tan(cam.pitch) * rt.focal / SCREEN_H;
    rt.begin(theme.sky.map(([at, colour]) => [at - lift, colour]));
    rt.setCamera(cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);

    this.ground(state, theme, p);
    this.cars(state, theme, p);

    if (chrome) this.hud(state, p);
    rt.blit(this.ctx, this.buffer);
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
    const back = worldOf(route, p.s - (CAM_BACK + (CAM_BACK_FAST - CAM_BACK) * eased), p.x * 0.94);
    const look = worldOf(route, p.s + CAM_AHEAD, p.x * 0.5);
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
      roll: -p.yaw * 0.1 - back.bank * 0.22,
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
  theme(warm) {
    if (warm <= 0.02) return THEMES.mountain;
    if (warm >= 0.98) return THEMES.coast;
    const key = `blend${Math.round(warm * 8)}`;
    if (this[key]) return this[key];
    const t = Math.round(warm * 8) / 8;
    const a = THEMES.mountain;
    const b = THEMES.coast;
    const out = {
      sky: a.sky.map(([f, c], i) => [f + (b.sky[i][0] - f) * t, mix(c, b.sky[i][1], t)]),
    };
    for (const k of ['fog', 'near', 'mid', 'far', 'ridge', 'verge', 'rock', 'tree', 'trunk', 'water']) {
      out[k] = mix(a[k], b[k], t);
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
    const edge = ROAD_HALF + RUMBLE;
    const first = nodeAt(route, p.s).i - DRAW_BEHIND;

    for (let step = 0; step < DRAW_AHEAD; step++) {
      const i = first + step;
      const a = nodeStep(route, i, 0);
      const b = nodeStep(route, i, 1);
      const away = step * SEG;
      const f = fog(away);
      const tint = (colour) => mix(colour, theme.fog, f);
      // The ground beside this node takes its colours from this node, which is
      // how a circuit can leave the hills and arrive at the sea inside a lap.
      const local = a.warm > 0.02 && a.warm < 0.98 ? this.theme(a.warm) : theme;

      // Tarmac, in bands of three nodes, which is the oldest trick there is for
      // telling you how fast you are going without a speedometer. The lighter
      // band is a chequer of the two greys rather than a third colour, because
      // there is no third colour between them to have.
      rt.dither = (i % 6) < 3 ? 0 : tint(C.roadAlt);
      rt.quad(
        a.x - a.nx * ROAD_HALF, roadY(a, -ROAD_HALF), a.z - a.nz * ROAD_HALF,
        a.x + a.nx * ROAD_HALF, roadY(a, ROAD_HALF), a.z + a.nz * ROAD_HALF,
        b.x + b.nx * ROAD_HALF, roadY(b, ROAD_HALF), b.z + b.nz * ROAD_HALF,
        b.x - b.nx * ROAD_HALF, roadY(b, -ROAD_HALF), b.z - b.nz * ROAD_HALF,
        tint(C.road),
      );
      rt.dither = 0;
      // Kerbs. Red and white, one node each, which at three hundred and fifty is
      // sixteen stripes a second going past at the edge of the screen.
      const kerb = tint((i % 2) < 1 ? C.kerbA : C.kerbB);
      for (const side of [-1, 1]) {
        rt.quad(
          a.x + a.nx * side * ROAD_HALF, roadY(a, side * ROAD_HALF), a.z + a.nz * side * ROAD_HALF,
          a.x + a.nx * side * edge, roadY(a, side * edge), a.z + a.nz * side * edge,
          b.x + b.nx * side * edge, roadY(b, side * edge), b.z + b.nz * side * edge,
          b.x + b.nx * side * ROAD_HALF, roadY(b, side * ROAD_HALF), b.z + b.nz * side * ROAD_HALF,
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
          tint(C.kerbB),
        );
      }

      // The white line down each edge of the tarmac, lifted a few centimetres so
      // it is not fighting the road it is painted on.
      for (const side of [-1, 1]) {
        const inner = side * (ROAD_HALF - 0.3);
        const outer = side * ROAD_HALF;
        rt.quad(
          a.x + a.nx * inner, roadY(a, inner) + 0.04, a.z + a.nz * inner,
          a.x + a.nx * outer, roadY(a, outer) + 0.04, a.z + a.nz * outer,
          b.x + b.nx * outer, roadY(b, outer) + 0.04, b.z + b.nz * outer,
          b.x + b.nx * inner, roadY(b, inner) + 0.04, b.z + b.nz * inner,
          tint(C.kerbB),
        );
      }

      // The barrier: a rail on posts, all the way round, both sides. It is what
      // turns a road into a circuit, and it is the second best thing in the game
      // for the feeling of speed after the marker posts.
      if (away < 640) {
        for (const side of [-1, 1]) {
          const at = side * WALL_AT;
          const ax = a.x + a.nx * at;
          const az = a.z + a.nz * at;
          const bx = b.x + b.nx * at;
          const bz = b.z + b.nz * at;
          const ay = groundY(a, side, WALL_AT);
          const by = groundY(b, side, WALL_AT);
          rt.quad(ax, ay + 0.5, az, bx, by + 0.5, bz, bx, by + 1.05, bz, ax, ay + 1.05, az,
            tint((i % 8) < 4 ? C.armco : C.kerbA));
          rt.quad(ax, ay + 0.5, az, ax, ay + 1.05, az, bx, by + 1.05, bz, bx, by + 0.5, bz,
            tint(shade(C.armco, 0.7)));
        }
      }

      // The ground: four bands a side, each drawn less often than the one
      // inside it.
      for (let band = 0; band < BANDS.length; band++) {
        const [inner, outer, kind, every] = BANDS[band];
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
        const w0 = RINGS[0] + Math.sin(i * 0.7 + this.surf) * 1.6;
        const w1 = RINGS[0] + Math.sin((i + 2) * 0.7 + this.surf) * 1.6;
        rt.quad(
          a.x - a.nx * w0, a.g.l[1] + 0.06, a.z - a.nz * w0,
          a.x - a.nx * (w0 + 2.8), a.g.l[1] + 0.06, a.z - a.nz * (w0 + 2.8),
          far.x - far.nx * (w1 + 2.8), far.g.l[1] + 0.06, far.z - far.nz * (w1 + 2.8),
          far.x - far.nx * w1, far.g.l[1] + 0.06, far.z - far.nz * w1,
          tint(C.kerbB),
        );
      }

      this.startLine(state, a.i, a, b, tint);

      const props = route.props[a.i];
      if (props && away < 900) {
        for (const prop of props) {
          const off = prop.side * prop.off;
          // Anything that belongs to the track is turned to face along it. A
          // gantry is a wall across the road if it is left pointing at world
          // north, and the track only points at world north twice a lap.
          // `lift` is for the things that are not standing on anything.
          drawProp(rt, prop,
            a.x + a.nx * off,
            groundY(a, Math.sign(off) || 1, Math.abs(off)) + (prop.lift || 0),
            a.z + a.nz * off,
            tint, local, prop.align ? a.a : 0, state.tick);
        }
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
        const x0 = k * (ROAD_HALF / 5);
        const x1 = (k + 1) * (ROAD_HALF / 5);
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

  /** The other seven, and you. */
  cars(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    for (const car of state.cars) {
      const away = car.s - p.s;
      if (away < -60 || away > 780) continue;
      const at = worldOf(route, car.s, car.x);
      // A car right on the camera fills a quarter of the screen with one dark
      // polygon and reads as a fault in the renderer. It is also almost entirely
      // behind you: the camera sits eight metres back, so anything this close is
      // a car you are about to be overtaken by and cannot see anyway.
      if (Math.hypot(at.x - this.cam.x, at.z - this.cam.z) < 5.4) continue;
      const tint = this.tinter(theme, Math.abs(away));
      const yaw = at.a + car.yaw;
      drawShadow(rt, at.x, at.y, at.z, yaw, 1.15, 2.5, tint);
      drawRacer(rt, car, at.x, at.y, at.z, yaw, tint);
      // Smoke when the tyres have given up, dust when they are on the grass.
      const rough = Math.abs(car.x) > ROAD_HALF + RUMBLE;
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
    const place = (x, z) => [
      Math.round(2 + (x - minX) * scale + (MAP_W - 4 - (maxX - minX) * scale) / 2),
      Math.round(2 + (z - minZ) * scale + (MAP_H - 4 - (maxZ - minZ) * scale) / 2),
    ];
    const pts = [];
    for (let i = 0; i < nodes.length; i += step) pts.push(place(nodes[i].x, nodes[i].z));
    this.mapOf = route.key;
    this.mapPts = { pts, place, start: place(nodes[0].x, nodes[0].z) };
    return this.mapPts;
  }

  /** The map, the field on it, and you. */
  drawMap(state, p, x, y) {
    const rt = this.rt;
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
    return (colour) => mix(colour, theme.fog, f);
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
   */
  hud(state, p) {
    const rt = this.rt;
    const W = SCREEN_W;
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

    const rt = this.rt;
    const hard = Math.abs(worst) > 0.085;
    const near = at < 24;
    const colour = hard ? (near ? BAD : WARN) : HUD_DIM;
    const right = worst > 0;
    const x = SCREEN_W / 2 + (right ? 32 : -50);
    rt.panel(x, 30, 18, 16, HUD_BACK, colour);
    // A solid triangle, eight rows, pointing the way the corner goes.
    for (let row = 0; row < 8; row++) {
      const len = Math.max(1, Math.round(11 - Math.abs(row - 3.5) * 2.4));
      rt.rect(right ? x + 3 : x + 15 - len, 34 + row, len, 1, colour);
    }
    // And a bar behind it for the corners that will actually have you.
    if (hard) rt.rect(right ? x + 2 : x + 14, 34, 2, 8, colour);
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
    const rt = this.rt;
    const on = Math.min(5, Math.floor((LIGHTS - state.lights) / 40));
    rt.panel(SCREEN_W / 2 - 56, 78, 112, 24, HUD_BACK, HUD_EDGE);
    for (let i = 0; i < 5; i++) {
      const lit = i < on;
      rt.rect(SCREEN_W / 2 - 50 + i * 21, 82, 16, 16, lit ? BAD : shade(HUD_EDGE, 0.4));
    }
    if (on >= 5) rt.textMid('READY', SCREEN_W / 2, 106, WARN);
  }
}

/** How much of the haze colour is in something this far away. */
function fog(away) {
  if (away <= FOG_NEAR) return 0;
  const t = (away - FOG_NEAR) / (FOG_FAR - FOG_NEAR);
  return Math.min(1, t) ** 0.75;
}

/** The tarmac's height at an offset, including the camber into the corner. */
function roadY(n, off) {
  return n.y - n.bank * off * 0.12;
}

/**
 * The ground's height, wherever it is.
 *
 * Inside the kerb it is the track; outside it, the three heights the route wrote
 * down, with straight lines between them. A straight line between two heights
 * ninety metres apart is not a hillside anybody would model by hand, and at this
 * resolution it is indistinguishable from one.
 */
function groundY(n, side, off) {
  const g = side < 0 ? n.g.l : n.g.r;
  const far = side < 0 ? n.g.far[0] : n.g.far[1];
  const kerb = ROAD_HALF + RUMBLE;
  if (off <= kerb) return roadY(n, side * off);
  if (off <= RINGS[0]) {
    return lerp(roadY(n, side * kerb), g[0], (off - kerb) / (RINGS[0] - kerb));
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
  if (node.g.wet > 0.5 && side < 0 && kind !== 'verge') {
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
