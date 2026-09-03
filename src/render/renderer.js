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
 * by a single tick, and all of it changes the game.
 */

import {
  CAM_AHEAD, CAM_BACK, CAM_BACK_FAST, CAM_HIGH, CAM_HIGH_FAST, CAM_LAG, CHECKPOINT_TIME,
  DRAW_AHEAD, DRAW_BEHIND, FIELD, FOCAL, FOCAL_FAST, gearAt, GRID_GAP, GRID_OFF, LIGHTS,
  ROAD_HALF, RUMBLE, SCREEN_H, SCREEN_W, SEG, TOP_SPEED, WALL_AT,
} from '../constants.js';
import { RINGS } from '../game/route.js';
import {
  formatClock, formatGap, formatTime, kmh, ordinal, player, progress, racing, worldOf,
} from '../game/state.js';
import { drawProp, drawRacer, drawShadow, drawSmoke } from './models.js';
import { C, THEMES } from './palette.js';
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

    const theme = this.theme(state, p);
    // The horizon moves with the camera, so the sky bands move with it. Signed
    // the other way it looks almost right, which is worse than looking wrong.
    const lift = Math.tan(cam.pitch) * rt.focal / SCREEN_H;
    rt.begin(theme.sky.map(([at, colour]) => [at - lift, colour]));
    rt.setCamera(cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);

    this.ground(state, theme, p);
    this.cars(state, theme, p);

    if (chrome) {
      this.streaks(p);
      this.hud(state, p);
    }
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
   * Which set of colours, blended across the join.
   *
   * On the grand run the pass becomes the boulevard somewhere in the middle, and
   * the light has to change with it. Three hundred nodes of blend is about
   * twenty seconds at speed: long enough that nobody sees it happen, short
   * enough that you notice afterwards that the sky went warm.
   */
  theme(state, p) {
    const route = state.route;
    const a = THEMES.mountain;
    const b = THEMES.coast;
    if (route.seam < 0) return route.nodes[0].kind === 'coast' ? b : a;
    const at = p.s / SEG;
    const t = Math.max(0, Math.min(1, (at - (route.seam - 200)) / 340));
    if (t <= 0) return a;
    if (t >= 1) return b;
    const key = `blend${Math.round(t * 8)}`;
    if (this[key]) return this[key];
    const out = { sky: a.sky.map(([f, c], i) => [f + (b.sky[i][0] - f) * t, mix(c, b.sky[i][1], t)]) };
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
    const nodes = route.nodes;
    const start = Math.max(0, Math.floor(p.s / SEG) - DRAW_BEHIND);
    const end = Math.min(nodes.length - 1, start + DRAW_AHEAD);
    const edge = ROAD_HALF + RUMBLE;

    for (let i = start; i < end; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const away = (i - start) * SEG;
      const f = fog(away);
      const tint = (colour) => mix(colour, theme.fog, f);

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
        const [inner, outer, kind, step] = BANDS[band];
        if (i % step !== 0) continue;
        const far = nodes[Math.min(nodes.length - 1, i + step)];
        for (const side of [-1, 1]) {
          const colour = bandColour(theme, a, side, kind, i, this.surf);
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
      if (a.g.sea && (i % 2) === 0 && away < 620) {
        const far = nodes[Math.min(nodes.length - 1, i + 2)];
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

      this.startLine(state, i, a, b, tint);

      const props = route.props[i];
      if (props && away < 760) {
        for (const prop of props) {
          const off = prop.side * prop.off;
          drawProp(rt, prop,
            a.x + a.nx * off, groundY(a, Math.sign(off) || 1, Math.abs(off)), a.z + a.nz * off,
            tint, theme);
        }
      }
    }
  }

  /** The chequered line, and the boxes the grid is painted in. */
  startLine(state, i, a, b, tint) {
    const rt = this.rt;
    const line = Math.round((30 + (FIELD - 1) * GRID_GAP + 18) / SEG);
    if (i === line) {
      // Chequers, across the whole width, in blocks of a metre and a bit.
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
    // A box for each grid slot, so the grid reads as a grid before the lights go.
    if (state.tick > 400) return;
    for (let slot = 0; slot < FIELD; slot++) {
      const at = Math.round((30 + (FIELD - 1 - slot) * GRID_GAP) / SEG);
      if (at !== i) continue;
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

  /** The other seven, and you. */
  cars(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    for (const car of state.cars) {
      const away = car.s - p.s;
      if (away < -60 || away > 780) continue;
      const at = worldOf(route, car.s, car.x);
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

  /** A fog function for one distance, made once and handed to a model. */
  tinter(theme, away) {
    const f = fog(away);
    return (colour) => mix(colour, theme.fog, f);
  }

  /**
   * Streaks at the edges of the screen, flat out.
   *
   * Four rows of pixels a side, moving outwards. It is not a real effect - there
   * is no motion blur here and there is not going to be - and it does not need
   * to be: at three hundred and fifty the eye is already being told it is
   * travelling by the kerbs and the posts, and this only agrees with them.
   */
  streaks(p) {
    const rush = (p.speed - TOP_SPEED * 0.62) / (TOP_SPEED * 0.38);
    if (rush <= 0) return;
    const rt = this.rt;
    const many = Math.round(Math.min(1, rush) * 7);
    for (let i = 0; i < many; i++) {
      const t = (i * 37 + p.s * 6) % 100 / 100;
      const y = Math.round(SCREEN_H * (0.36 + ((i * 0.19 + t) % 1) * 0.5));
      const len = 6 + Math.round(t * 22);
      const colour = shade(C.kerbB, 0.85);
      rt.rect(0, y, len, 1, colour);
      rt.rect(SCREEN_W - len, y + 3, len, 1, colour);
    }
  }

  // --- The panel ------------------------------------------------------------

  /**
   * The head-up display.
   *
   * Five things, in the five places an arcade cabinet put them: where you are in
   * the race, what the clock says, how fast you are going, what gear that is,
   * and who is in front. Position is the biggest of them because it is the one
   * you are actually playing for; the speed is second because it is the one you
   * glance at most.
   */
  hud(state, p) {
    const rt = this.rt;
    const W = SCREEN_W;

    // The clock, in the middle, big, and red when it is nearly gone.
    const urgent = state.clock < 10;
    const clockColour = urgent && (state.tick % 30) < 15 ? BAD : state.clock < 20 ? WARN : HUD_TEXT;
    rt.panel(W / 2 - 26, 3, 52, 22, HUD_BACK, HUD_EDGE);
    rt.textMid(formatClock(state.clock), W / 2, 7, clockColour, 2);

    // Elapsed, top left. This is the number the score board will keep.
    rt.panel(4, 3, 74, 15, HUD_BACK, HUD_EDGE);
    rt.text('TIME', 8, 7, HUD_DIM);
    rt.text(formatTime(state.elapsed), 33, 7, HUD_TEXT);

    // Where you are, top right, and the biggest thing on the screen after the
    // clock. `2ND OF 8` rather than a bare number: the second half is what makes
    // the first half mean anything on the first lap you ever drive.
    rt.panel(W - 78, 3, 74, 26, HUD_BACK, state.place === 1 ? WARN : HUD_EDGE);
    rt.text(ordinal(state.place), W - 74, 6, state.place <= 3 ? WARN : HUD_TEXT, 2);
    rt.text(`OF ${FIELD}`, W - 34, 12, HUD_DIM);
    const bar = Math.round(68 * progress(state));
    rt.rect(W - 75, 24, 68, 2, shade(HUD_EDGE, 0.6));
    rt.rect(W - 75, 24, bar, 2, GOOD);

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

    // Who is in front, bottom left, and how long it would take to get there.
    rt.panel(4, SCREEN_H - 34, 92, 30, HUD_BACK, HUD_EDGE);
    const ahead = state.order && state.order[p.place - 2];
    if (ahead) {
      rt.text('AHEAD', 8, SCREEN_H - 30, HUD_DIM);
      rt.text(`-${formatGap(p.gap)}`, 44, SCREEN_H - 30, p.gap < 1.2 ? WARN : HUD_TEXT);
      rt.text(teamName(ahead), 8, SCREEN_H - 20, HUD_TEXT);
    } else {
      rt.text('LEADING', 8, SCREEN_H - 30, WARN);
      const behind = state.order && state.order[1];
      if (behind) rt.text(`+${formatGap(behind.gap)}`, 8, SCREEN_H - 20, HUD_TEXT);
    }
    // The tow, when you are in one. It is worth twenty km/h and you should know.
    if (p.tow > 0.15) {
      rt.text('TOW', 66, SCREEN_H - 20, (state.tick % 20) < 10 ? WARN : HUD_DIM);
    }

    this.cornerSign(state, p);

    if (state.checkNote > 0) {
      rt.panel(W / 2 - 62, 44, 124, 26, HUD_BACK, GOOD);
      rt.textMid('CHECKPOINT', W / 2, 48, GOOD);
      rt.textMid(`+${Math.round(state.cfg.clock * CHECKPOINT_TIME)} SECONDS`, W / 2, 58, HUD_TEXT);
    }

    if (!racing(state)) this.lights(state);
  }

  /**
   * The board at the side of the road, a corner early.
   *
   * Looks half a straight up the track for the sharpest thing there, and draws
   * an arrow for it if it is sharp enough to matter. Everybody who has ever
   * played one of these reads it without being told, and without it a blind
   * crest on the pass is a guess rather than a corner.
   */
  cornerSign(state, p) {
    const nodes = state.route.nodes;
    const from = Math.floor(p.s / SEG);
    let worst = 0;
    let at = 0;
    for (let n = 6; n < 44; n++) {
      const node = nodes[Math.min(nodes.length - 1, from + n)];
      if (Math.abs(node.curve) > Math.abs(worst)) {
        worst = node.curve;
        at = n;
      }
    }
    if (Math.abs(worst) < 0.03) return;
    const rt = this.rt;
    const hard = Math.abs(worst) > 0.085;
    const near = at < 22;
    const colour = hard ? (near ? BAD : WARN) : HUD_DIM;
    const wide = hard ? 26 : 18;
    const x = SCREEN_W / 2 + (worst > 0 ? 34 : -34 - wide);
    rt.panel(x, 30, wide, 15, HUD_BACK, colour);
    // One chevron for a corner, two for one that will have you if you ignore it.
    for (let c = 0; c < (hard ? 2 : 1); c++) {
      const at = x + 4 + c * 9;
      for (let i = 0; i < 5; i++) {
        const step = worst > 0 ? i : 4 - i;
        rt.rect(at + step, 34 + Math.abs(i - 2), 1, 8 - Math.abs(i - 2) * 2, colour);
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
  if (node.g.sea && side < 0 && kind !== 'verge') {
    const ripple = Math.sin(i * 0.5 + surf * 2) > 0.4;
    return ripple ? shade(theme.water, 1.18) : theme.water;
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
