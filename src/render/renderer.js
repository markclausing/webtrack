/**
 * Drawing. Reads the state, never writes to it.
 *
 * The world is built out of the road itself. There is no terrain mesh and no
 * scene graph: for every node in front of the camera this walks outwards from
 * the centreline - tarmac, rumble strip, verge, hillside, distance - and puts
 * down a quad at each step. A mountain is the outermost of those quads a long
 * way up. The sea is the outermost of them at zero. Nothing else is needed, and
 * anything else would have to be kept in step with a road that bends.
 *
 * Two things are worth knowing before changing anything in here.
 *
 * Everything fades to one colour, and that colour is also the bottom band of the
 * sky. That is what makes a horizon: the far quads arrive at the fog colour at
 * exactly the height the sky starts, and the join disappears. Change one without
 * the other and there is a line across the world.
 *
 * And detail is dropped by distance, not by count. The near quads are drawn one
 * node at a time, the middle ones every second node and the far ones every
 * fourth, which is roughly constant work per pixel rather than per metre - the
 * only reason a road nine hundred metres long can be drawn sixty times a second
 * by arithmetic in a browser.
 */

import {
  CAM_AHEAD, CAM_BACK, CAM_HIGH, CAM_LAG, CHECKPOINT_TIME, DRAW_AHEAD, DRAW_BEHIND, HEAT_CHOPPER,
  FOCAL, ROAD_HALF, RUMBLE, SCREEN_H, SCREEN_W, SEG,
} from '../constants.js';
import { RINGS } from '../game/route.js';
import { formatClock, formatTime, kmh, player, progress, worldOf } from '../game/state.js';
import {
  drawCar, drawChopper, drawDown, drawDrop, drawProp, drawRider, drawShadow,
} from './models.js';
import { C, THEMES } from './palette.js';
import { md, mix, Raster, shade } from './raster.js';

/** Where the fog starts biting, and where nothing is left of the colour. */
const FOG_NEAR = 170;
const FOG_FAR = DRAW_AHEAD * SEG;

/**
 * The ground, in rings, as [inner, outer, which colour, how often].
 *
 * The last number is the only interesting one: the strip beside the kerb is
 * drawn at every node, the middle distance at every second and the far hills at
 * every fourth. That keeps the work roughly proportional to the pixels a band
 * covers rather than to the metres it spans, which is what makes nine hundred
 * metres of scenery affordable.
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
    this.spin = 0;
    this.surf = 0;
  }

  /** A new run: the camera must not glide in from where the last one ended. */
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
    this.spin += 0.5;
    this.surf += 0.05;

    const theme = this.theme(state, p);
    // The horizon moves with the camera, so the sky bands move with it. Without
    // this the world tips over a crest and the sky stays where it was, which
    // looks less like a game of its era and more like a mistake.
    // Tilt the camera down and the horizon rises in the picture, so the bands
    // rise with it. Signed the other way it looks almost right, which is worse
    // than looking wrong: the sky just seems to lag behind the hills.
    const lift = Math.tan(cam.pitch) * FOCAL / SCREEN_H;
    rt.begin(theme.sky.map(([at, colour]) => [at - lift, colour]));
    rt.setCamera(cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);

    this.ground(state, theme, p);
    this.things(state, theme, p, cam);

    if (chrome) this.hud(state, p);
    rt.blit(this.ctx, this.buffer);
  }

  /**
   * The camera, a bike's length behind and a bike's height above.
   *
   * It rides the road rather than the rider: its position comes from the
   * centreline at a distance behind you, only partly following you across the
   * road. A camera welded to the bike would swing wildly every time you were
   * shoved, and being shoved is most of this game.
   */
  follow(state, p) {
    const route = state.route;
    const back = worldOf(route, p.s - CAM_BACK, p.x * 0.62);
    const look = worldOf(route, p.s + CAM_AHEAD, p.x * 0.28);
    const dx = look.x - back.x;
    const dz = look.z - back.z;
    const flat = Math.hypot(dx, dz) || 1;
    const want = {
      x: back.x,
      y: back.y + CAM_HIGH,
      z: back.z,
      yaw: Math.atan2(dx, dz),
      pitch: Math.atan2(back.y + CAM_HIGH - (look.y + 1.6), flat),
      roll: -p.lean * 0.14 - back.bank * 0.3,
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
    cam.yaw += turn * (CAM_LAG + 0.1);

    if (state.shake > 0.01) {
      const k = state.shake;
      cam.x += (this.wob(state.tick * 1.7) * k * 0.9);
      cam.y += (this.wob(state.tick * 2.3 + 5) * k * 0.7);
      cam.roll += this.wob(state.tick * 3.1 + 9) * k * 0.05;
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
   * Tarmac, rumble strip and every band of ground out to the horizon.
   *
   * Drawn from the camera outwards so the depth buffer throws away most of the
   * far pixels before they are written - the near road covers a third of the
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

      // Rumble strips. Red and white, two nodes each, and they are also the last
      // warning you get that the tarmac is about to stop.
      const kerb = tint((i % 4) < 2 ? C.kerbA : C.kerbB);
      for (const side of [-1, 1]) {
        rt.quad(
          a.x + a.nx * side * ROAD_HALF, roadY(a, side * ROAD_HALF), a.z + a.nz * side * ROAD_HALF,
          a.x + a.nx * side * edge, roadY(a, side * edge), a.z + a.nz * side * edge,
          b.x + b.nx * side * edge, roadY(b, side * edge), b.z + b.nz * side * edge,
          b.x + b.nx * side * ROAD_HALF, roadY(b, side * ROAD_HALF), b.z + b.nz * side * ROAD_HALF,
          kerb,
        );
      }

      // The dashes down the middle, lifted a few centimetres so they are not
      // fighting the road they are painted on.
      if (away < 420 && (i % 4) < 2) {
        rt.quad(
          a.x - a.nx * 0.3, roadY(a, 0) + 0.05, a.z - a.nz * 0.3,
          a.x + a.nx * 0.3, roadY(a, 0) + 0.05, a.z + a.nz * 0.3,
          b.x + b.nx * 0.3, roadY(b, 0) + 0.05, b.z + b.nz * 0.3,
          b.x - b.nx * 0.3, roadY(b, 0) + 0.05, b.z - b.nz * 0.3,
          tint(C.centre),
        );
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
        const w0 = 30 + Math.sin(i * 0.7 + this.surf) * 2.4;
        const w1 = 30 + Math.sin((i + 2) * 0.7 + this.surf) * 2.4;
        rt.quad(
          a.x - a.nx * w0, a.g.l[1] + 0.06, a.z - a.nz * w0,
          a.x - a.nx * (w0 + 3.2), a.g.l[1] + 0.06, a.z - a.nz * (w0 + 3.2),
          far.x - far.nx * (w1 + 3.2), far.g.l[1] + 0.06, far.z - far.nz * (w1 + 3.2),
          far.x - far.nx * w1, far.g.l[1] + 0.06, far.z - far.nz * w1,
          tint(C.kerbB),
        );
      }

      const props = route.props[i];
      if (props && away < 700) {
        for (const prop of props) {
          const off = prop.side * prop.off;
          drawProp(
            rt, prop,
            a.x + a.nx * off, groundY(a, Math.sign(off) || 1, Math.abs(off)), a.z + a.nz * off,
            tint, theme,
          );
        }
      }
    }
  }

  /** Everything that moves: traffic, riders, what they dropped, the helicopter. */
  things(state, theme, p, cam) {
    const rt = this.rt;
    const route = state.route;

    for (const c of state.cars) {
      const away = c.s - p.s;
      if (away < -70 || away > 700) continue;
      const at = worldOf(route, c.s, c.x);
      const tint = this.tinter(theme, Math.abs(away));
      const yaw = at.a + (c.dir < 0 ? Math.PI : 0)
        + (c.spinning > 0 ? c.spinning * 0.09 : 0);
      drawShadow(rt, at.x, at.y, at.z, yaw, (c.wide || 0.95) + 0.25, (c.long || 2.3) + 0.3, tint);
      drawCar(rt, c, at.x, at.y, at.z, yaw, tint, c.wobbleT > 0);
    }

    for (const d of state.drops) {
      const away = d.s - p.s;
      if (away < -20 || away > 300) continue;
      const at = worldOf(route, d.s, d.x);
      const tint = this.tinter(theme, Math.abs(away));
      drawDrop(rt, at.x, at.y, at.z, at.a, tint,
        0.12 + Math.sin(state.tick * 0.12) * 0.08);
    }

    for (const r of state.riders) {
      const away = r.s - p.s;
      if (away < -60 || away > 620) continue;
      // Not drawn when it is you and the camera is behind your head anyway -
      // except it is drawn, because a bike you cannot see is a bike you cannot
      // place on the road, and placing it is the whole skill.
      const at = worldOf(route, r.s, r.x);
      const tint = this.tinter(theme, Math.abs(away));
      const yaw = at.a + Math.max(-0.4, Math.min(0.4, r.vx * 0.03));
      drawShadow(rt, at.x, at.y, at.z, yaw, r.down ? 1.2 : 0.44, r.down ? 1.2 : 1.15, tint);
      if (r.down) drawDown(rt, r, at.x, at.y, at.z, yaw, tint);
      else drawRider(rt, r, at.x, at.y, at.z, yaw, tint);
    }

    if (state.chopper) {
      const c = state.chopper;
      const at = worldOf(route, c.s, c.x);
      const tint = this.tinter(theme, Math.abs(c.s - p.s) * 0.5);
      drawChopper(rt, at.x, at.y + c.y, at.z, at.a + Math.sin(c.sway) * 0.4, c.spin, tint);
    }
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
   * Four things, in the four places an arcade cabinet put them: what the clock
   * says, how fast you are going, how much is left of you, and how much road is
   * left. Everything else - the wanted stars, the club in your hand, the seconds
   * a knockdown just bought you - appears only when it is true, and goes away
   * again, because a permanent row of indicators is a permanent row of things
   * not to look at.
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

    // How far there is to go, top right, as a bar and a number.
    const done = progress(state);
    const left = Math.max(0, state.route.metres - p.s);
    rt.panel(W - 78, 3, 74, 15, HUD_BACK, HUD_EDGE);
    rt.rect(W - 75, 14, 68, 2, shade(HUD_EDGE, 0.6));
    rt.rect(W - 75, 14, Math.round(68 * done), 2, GOOD);
    rt.text('TO GO', W - 74, 5, HUD_DIM);
    rt.text(`${(left / 1000).toFixed(1)}KM`, W - 42, 5, HUD_TEXT);

    // Speed, bottom right, because it is the number you glance at most and the
    // bottom right is where a right hand is already pointing.
    const speed = kmh(p.speed);
    rt.panel(W - 76, SCREEN_H - 27, 72, 23, HUD_BACK, HUD_EDGE);
    rt.text(`${speed}`.padStart(3, ' '), W - 71, SCREEN_H - 23, speed > 230 ? WARN : HUD_TEXT, 2);
    rt.text('KM/H', W - 31, SCREEN_H - 15, HUD_DIM);

    // What is left of you, bottom left.
    rt.panel(4, SCREEN_H - 27, 96, 23, HUD_BACK, HUD_EDGE);
    rt.text('DAMAGE', 8, SCREEN_H - 23, HUD_DIM);
    const hp = Math.max(0, p.health) / 100;
    rt.rect(8, SCREEN_H - 14, 88, 6, shade(HUD_EDGE, 0.5));
    rt.rect(8, SCREEN_H - 14, Math.round(88 * hp), 6, hp > 0.55 ? GOOD : hp > 0.25 ? WARN : BAD);
    if (p.weapon) {
      rt.text(p.weapon === 'baton' ? 'BATON' : 'CLUB', 60, SCREEN_H - 23,
        p.weapon === 'baton' ? HUD_TEXT : C.club);
    }

    // The law's interest in you, as stars, which is the only honest unit for it.
    if (state.heat > 0.05) {
      const stars = Math.min(5, Math.ceil(state.heat * 5));
      for (let i = 0; i < stars; i++) {
        const on = state.heat < HEAT_CHOPPER || (state.tick % 24) < 12 || i < stars - 1;
        rt.text('*', W / 2 - 15 + i * 7, 27, on ? WARN : shade(WARN, 0.4));
      }
    }

    // Things that are only true for a moment.
    if (state.checkNote > 0) {
      rt.panel(W / 2 - 62, 44, 124, 26, HUD_BACK, GOOD);
      rt.textMid('CHECKPOINT', W / 2, 48, GOOD);
      rt.textMid(`+${Math.round(state.cfg.clock * CHECKPOINT_TIME)} SECONDS`, W / 2, 58, HUD_TEXT);
    }

    if (p.down) {
      rt.textMid('GET UP', W / 2, SCREEN_H / 2 - 8, (state.tick % 30) < 15 ? BAD : HUD_TEXT, 2);
    }

    if (state.flash > 0.02) {
      // A red wash when you have just been hit. Rows rather than a full screen:
      // it costs a fifth as much and reads exactly the same at this size.
      const rows = Math.round(state.flash * 10);
      for (let i = 0; i < rows; i++) {
        const y = (i * 23 + state.tick * 3) % SCREEN_H;
        rt.rect(0, y, SCREEN_W, 1, BAD);
      }
    }
  }
}

/** How much of the fog colour is in something this far away. */
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
 * Inside the verge it is the road; outside it, the three heights the route wrote
 * down, with straight lines between them. A straight line between two heights
 * ninety metres apart is not a hillside anybody would model by hand, and at this
 * resolution it is indistinguishable from one.
 */
function groundY(n, side, off) {
  const g = side < 0 ? n.g.l : n.g.r;
  const far = side < 0 ? n.g.far[0] : n.g.far[1];
  // Out to the far edge of the rumble strip the ground is the road; from there
  // to the first ring it climbs or drops away to whatever the route decided.
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
  if (node.g.sea && side < 0 && kind !== 'verge' && kind !== 'near') {
    const ripple = Math.sin(i * 0.5 + surf * 2) > 0.4;
    return ripple ? shade(theme.water, 1.18) : theme.water;
  }
  if (kind === 'verge') return theme.verge;
  if (kind === 'near') return (i % 8) < 4 ? theme.near : shade(theme.near, 0.94);
  if (kind === 'mid') return theme.mid;
  return theme.far;
}
