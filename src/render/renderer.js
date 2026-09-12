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
  MAX_PIXELS, ROAD_HALF, RUMBLE, SCREEN_H, SCREEN_W, SEG, TICK_RATE, TOP_SPEED, WALL_AT,
} from '../constants.js';
import { BRIDGE_NODES, RINGS, TOWERS } from '../game/route.js';
import {
  formatClock, formatGap, formatTime, kmh, lapOf, nodeAt, nodeStep, ordinal, player,
  progress, racing, worldOf,
} from '../game/state.js';
import { drawProp, drawRacer, drawShadow, drawSmoke } from './models.js';
import { C, lit, SUN_BEARING, TEAM_COLOURS, THEMES, TIMES } from './palette.js';
import { md, mix, shade } from './colour.js';
import { Batch } from './gl.js';
import { Hud, HUD_BASE_H } from './hud.js';

/**
 * The props that are not part of a world built once.
 *
 * Five of them move - a flag flaps, a wheel and a turbine and a chopper turn, a
 * fountain plays - and one changes with the light in a way the shader cannot do
 * for it. Six kinds out of forty and a few dozen in view at a time.
 *
 * There were eight. A floodlight head and the glass in a building also change at
 * dusk, and they were drawn every frame for it - which at Baku, where there are
 * a great many of both, was two and a half milliseconds once the buildings had
 * windows in them. They are materials now: the shader knows a light that only
 * lights up after dark, and a window that takes the sky by day and is lit from
 * inside by night, so both can be part of a world that is built once.
 */
const LIVE_PROPS = new Set(['flag', 'fountain', 'turbine', 'chopper', 'wheel', 'screen']);

/** How far up the road the shadow box is pushed, in metres. */
const SHADOW_AHEAD = 60;

/**
 * How far the scenery stands.
 *
 * Nine hundred metres, once, because that was the whole world. Trees and
 * grandstands are the cheapest thing in the game per metre of distance - a tree
 * is four triangles - and the far ones are what tell you there is a circuit out
 * there rather than a road, so they go as far as the road does.
 */
const PROP_FAR = DRAW_AHEAD * SEG;

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
 * The last number used to be the interesting one. The run-off beside the kerb
 * was drawn at every node, the middle distance at every second and the far hills
 * at every fourth, on the reasoning that it keeps the work proportional to the
 * pixels a band covers rather than to the metres it spans.
 *
 * It also put a hole in the world on every circuit in the game.
 *
 * Two bands that meet share an edge, and an edge drawn at two different
 * resolutions is two different edges: the fine one follows every node round the
 * corner and the coarse one goes straight from one node to the one four along.
 * At ninety-five metres off the centre line - which is where the middle distance
 * meets the far hills - that chord cuts the corner by up to a hundred and
 * sixty-seven metres at Las Vegas, eighty-seven at Monaco, and between eight and
 * fifty everywhere else. It is not a crack, it is a gap you can see the sky
 * through, and it was there for as long as the bands have been.
 *
 * It was invisible for most of that time and stopped being so for three reasons
 * at once: the draw distance went from a kilometre to eighteen hundred metres,
 * the fog stopped being mixed per face, and the picture went from six hundred
 * and forty pixels across to whatever your window is. None of those caused it.
 *
 * So every band is drawn at every node now and the shared edges are the same
 * line by construction. It costs about fifteen hundred triangles a frame, which
 * on a card is nothing and in the software rasteriser this was written for would
 * have been a millisecond and a half - which is presumably why it was four.
 */
export const BANDS = [
  [ROAD_HALF + RUMBLE, RINGS[0], 'verge', 1],
  [RINGS[0], RINGS[1], 'near', 1],
  [RINGS[1], RINGS[2], 'mid', 1],
  [RINGS[2], RINGS[3], 'far', 1],
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
/**
 * How wide the layout space is, which is no longer a fixed number.
 *
 * It was four hundred and eighty by three hundred and thirty-six, which is the
 * shape a television was. The picture fills the window now, and a window is
 * whatever shape the person opening it chose, so the height is fixed and the
 * width follows: on a wide screen there is simply more space between the thing
 * anchored to the left edge and the thing anchored to the right one. Every panel
 * on this display was already written against one edge or against the middle,
 * which is why that works at all.
 */
const HUD_BASE_W = 480;

const HUD_BACK = md(12, 12, 24);
const HUD_EDGE = md(80, 84, 110);
const HUD_TEXT = md(226, 230, 240);
const HUD_DIM = md(130, 136, 156);
const GOOD = md(60, 200, 90);
const WARN = md(240, 180, 40);
const BAD = md(220, 50, 40);
/**
 * The recorded lap, on the map and on the road.
 *
 * Its own colour rather than one of the six above, because it has to be
 * unmistakable at three pixels: a pale cyan is not a team colour, not the white
 * of the start line, and not the amber that blinks for you.
 */
const PHANTOM = md(120, 220, 235);

/** What a tunnel takes the daylight down to. Not black: black is a hole. */
const TUNNEL_DARK = md(18, 20, 26);

/**
 * A display that is not there.
 *
 * The screenshot tool draws the world without one and so does the frame meter's
 * first pass. Every method a panel could ask for, doing nothing.
 */
const NO_HUD = {
  rect() {}, span() {}, panel() {}, text() { return 0; }, textMid() { return 0; },
  glyph() { return 0; }, begin() {}, blit() {},
};

export class Renderer {
  /**
   * @param canvas the one the world is drawn on, in WebGL
   * @param hudCanvas the one over the top of it, in 2D. Optional: the tools that
   *   only want the world do not pass one.
   */
  constructor(canvas, hudCanvas = null) {
    this.canvas = canvas;
    this.rt = new Batch(canvas);
    this.hudLayer = hudCanvas ? new Hud(hudCanvas) : null;
    this.cam = null;
    this.surf = 0;
    this.size(canvas.clientWidth || SCREEN_W, canvas.clientHeight || SCREEN_H);
  }

  /** A new race: the camera must not glide in from where the last one ended. */
  reset() {
    this.cam = null;
  }

  /** Lets go of the circuit that was built, so the next race builds its own. */
  drop() {
    this.rt.forget(this.world);
    this.world = null;
    this.worldOf = null;
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
  size(width = SCREEN_W, height = SCREEN_H) {
    // One device pixel per screen pixel, and no more than four million of them.
    // A retina laptop at two is sixteen million pixels a frame for a picture
    // nobody can see the difference in, and a phone will simply run out of fill.
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const want = Math.min(1, Math.sqrt(MAX_PIXELS / Math.max(1, width * height * dpr * dpr)));
    const w = Math.max(320, Math.round(width * dpr * want));
    const h = Math.max(224, Math.round(height * dpr * want));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.rt.resize(w, h);
    this.hudLayer?.resize(w, h);
    this.hudW = h ? (w / h) * HUD_BASE_H : HUD_BASE_W;
    this._ui = null;
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
    const lift = Math.tan(cam.pitch) * rt.focal / rt.h;
    rt.begin(this.sky(theme).map(([at, colour]) => [at - lift, colour]));
    this.sun(cam);
    rt.setCamera(cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);

    this.shine(state, theme, p);
    this.ground(state, theme, p);
    this.cars(state, theme, p);

    rt.blit();
    // The display is a canvas of its own over the top, so it is drawn after the
    // world has been handed over rather than into the same buffer.
    if (chrome && this.hudLayer) {
      this.hudLayer.begin();
      this.hud(state, p);
    }
  }

  /**
   * Hands the picture over again, for anything drawn after `draw` finished.
   *
   * Only the frame meter uses it, and only when it is switched on: it has to
   * report how long the frame took, which is not known until the frame is over.
   */
  show() {
    this.rt.blit();
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
    /**
     * How much the edges of the picture are smeared, for the pass at the end.
     *
     * The square of it, like everything else here that is about speed: at a
     * hundred and fifty there should be almost none of this, and what is worth
     * having is the difference between two hundred and eighty and three hundred
     * and fifty. Kept on the renderer rather than passed down through four calls,
     * because the post chain runs long after the camera has been worked out.
     *
     * A fifth rather than the third it started at. The edges of the screen are
     * also where the car you are about to pass is, and at a third that car was a
     * streak - which is what a camera would do and is not what a driver needs to
     * see.
     */
    this.rush = eased * eased * 0.22;

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

    /**
     * The lens, in pixels of the picture as it actually is.
     *
     * FOCAL is a number of pixels on a screen four hundred and forty-eight tall,
     * which is what this game used to be. The picture is whatever size the window
     * is now, so it is scaled by the height rather than by the width: the
     * vertical field of view stays exactly what it was and a wider window shows
     * more at the sides. Scaled by the width instead, a widescreen monitor would
     * show the same road through a letterbox, which is the wrong way round.
     */
    this.rt.focal = (FOCAL + (FOCAL_FAST - FOCAL) * eased) * (this.rt.h / SCREEN_H);

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
    const x = rt.w / 2 + Math.tan(turn) * rt.focal;
    const horizon = rt.h / 2 - Math.tan(cam.pitch) * rt.focal;
    const y = horizon - now.sunHigh * rt.h;
    // The size is written for a screen four hundred and forty-eight tall, like
    // the lens, and scales with the picture for the same reason.
    rt.disc(x, y, now.sunSize * (rt.h / SCREEN_H), now.sun);
  }

  /**
   * The sun, the ambient light and what the distance is made of.
   *
   * Worked out once a frame and handed to the card, where it is applied per
   * pixel. Three things come out of the time of day and one out of where the car
   * is standing.
   *
   * The sun's bearing does not move - it is a fixed direction in the world, which
   * is what makes coming out of a corner with it ahead of you feel like coming
   * out of a corner with it ahead of you - and its height comes from the same
   * number that puts the disc on the screen, so the shadow side of a building
   * and the sun you can see agree with each other.
   *
   * Ambient rises as the sun sets, which sounds backwards and is not: it is the
   * share of the light that has no direction, and by night almost all of it has
   * none. A directional term at midnight would light one side of every wall from
   * a sun that is not there.
   */
  shine(state, theme, p) {
    const now = this.now;
    // Where the sun is in the world. The height is read off the same fraction of
    // the screen the disc is drawn at, through the lens it was authored for.
    const high = Math.atan(now.sunHigh * SCREEN_H / FOCAL);
    const flat = Math.cos(high);
    const dim = now.dim;
    /**
     * Inside a tunnel the distance stops existing.
     *
     * Monaco's is eight hundred and forty metres long and you can see the far
     * end of it from the mouth. Fogged at the usual distance that end is a grey
     * smudge; it should be a bright hole, because that is what it is. Rather
     * than give every vertex a haze of its own, the fog is simply pushed out
     * while the car is under a roof - everything visible at that moment is the
     * tunnel, so there is nothing else for it to be wrong about.
     */
    const roof = state.route.nodes[nodeAt(state.route, p.s).i].tunnel || 0;
    const far = FOG_FAR + roof * 2600;
    this.rt.rush = this.rush || 0;
    /**
     * The time of day, as three numbers for the shader.
     *
     * Exactly what `lamp` did a colour at a time on the processor: darken by
     * `dim`, then pull `pull` of the way towards `wash`. Doing it there is what
     * made the world have to be rebuilt every frame.
     */
    this.rt.dim = now.dim;
    this.rt.wash = rgb(now.wash);
    this.rt.pull = now.pull;
    this.rt.night = Math.max(0, (this.lightAt - 0.4) / 0.6);
    this.rt.light({
      sun: [Math.sin(SUN_BEARING) * flat, Math.sin(high), Math.cos(SUN_BEARING) * flat],
      /**
       * How much of the light has no direction in it.
       *
       * Two fifths in the afternoon and nearly all of it once the sun has gone.
       * The first number is the one that decides how much a wall facing the sun
       * differs from the wall round the corner from it, and at the two thirds it
       * started at the difference was there and you had to look for it. At two
       * fifths a building has a bright side, which is the whole reason the faces
       * were given normals.
       */
      ambient: Math.min(0.94, 0.42 + 0.52 * (1 - dim)),
      fogColour: rgb(theme.fog),
      fogNear: FOG_NEAR + roof * 600,
      fogFar: far,
      /**
       * The weather, which is one number and two colours.
       *
       * The colours go through the same time-of-day transform every other colour
       * in this game goes through, which is the whole reason that function
       * exists: a white cloud handed to `lamp` comes back orange at dusk and a
       * deep blue-grey at midnight, and nothing here had to know that. The
       * underside is the same colour at two thirds, because from below a cloud
       * is mostly its underside.
       *
       * Coverage is held down at night. Not for realism - it is for the sky
       * gradient, which by then is four stops of very dark blue, and a cloud deck
       * over it is a grey lid.
       */
      cloud: rgb(this.lamp(md(252, 250, 248))),
      cloudDark: rgb(this.lamp(shade(md(252, 250, 248), 0.66))),
      cover: 0.42 * (1 - 0.55 * (state.light || 0)),
      // Slowly. A cloud that visibly moves in the three minutes a race lasts is
      // a cloud going at about two hundred kilometres an hour.
      drift: state.tick * 0.0000045,
      /**
       * Where to put the shadow box, relative to the camera.
       *
       * Up the road rather than centred on the camera. The camera sits eight
       * metres behind the car and looks forward, so half a box centred on it is
       * behind the picture - and at three hundred km/h the useful half is the
       * hundred metres in front of the car, not the seventy behind it.
       */
      ahead: [
        Math.sin(this.cam.yaw) * SHADOW_AHEAD,
        0,
        Math.cos(this.cam.yaw) * SHADOW_AHEAD,
      ],
    });
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
  /**
   * The circuit, built once, into a buffer that is kept.
   *
   * This was the frame. Every node between the camera and the horizon was walked
   * sixty times a second, and each one transformed, coloured, fogged and written
   * out - about four milliseconds of a sixteen millisecond budget on this
   * machine, and four times that on a telephone.
   *
   * None of it moves. The road is where it was, the trees are where they were,
   * and the only reason it was rebuilt was that the colours had to be worked out
   * again for the time of day. That went into the shader, so this happens once:
   * eighteen hundred metres of circuit is a range of a buffer now, and a frame
   * is two draw calls and a handful of things that actually change.
   *
   * What still changes is drawn by `live` below. There are three kinds: the cars
   * and their smoke, the props that move or light up, and the surf.
   */
  keepWorld(state, theme) {
    const rt = this.rt;
    const route = state.route;
    /**
     * Keyed on the circuit's name rather than on the object.
     *
     * A route is built fresh for every race - the same arithmetic from the same
     * seed, so the same road - and keying on the object would rebuild the world
     * every time one started. It would also rebuild it on every click in the
     * menu, because the car driving round behind the menu is a race too.
     */
    if (this.world && this.worldOf === route.key) return;
    rt.forget(this.world);
    this.worldOf = route.key;
    const started = performance.now();
    rt.record();

    // The world is built in daylight and the shader dims it. `night` here is
    // therefore always nought: the two props that care about it are drawn live.
    const night = 0;
    for (let i = 0; i < route.nodes.length; i++) {
      // Where this node's geometry begins, so a frame can find it again.
      rt.mark();
      const a = nodeStep(route, i, 0);
      const b = nodeStep(route, i, 1);
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
      // No haze in here any more: the distance is mixed in per pixel by the
      // shader, which is both cheaper and right. It used to be worked out once
      // for a whole section of road and applied to the near end and the far end
      // alike, so a straight at dusk had a visible join every forty metres.
      /**
       * No `lamp` in here any more either, and no headlights.
       *
       * The time of day is applied per pixel by the shader, from three uniforms,
       * which is what lets this be built once. The headlights and the
       * floodlights went the same way: the first depends on how far a node is
       * from the camera and could never have been baked, and the second is a
       * pattern along the road that now rides in the length of the face normal.
       */
      const tint = (colour) => dark(colour);
      const road = tint;
      /** How much of the circuit's own lighting falls on this stretch of road. */
      const pool = 0.34 + 0.2 * Math.cos((((i % 12) + 12) % 12) / 12 * Math.PI * 2);
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
      // Tarmac is the largest single surface in the picture and the flattest.
      // The grain is worked out from where it is in the world - see gl.js - and
      // it is the only texture in this game.
      rt.ground = 1;
      rt.pool = pool;
      rt.quad(
        a.x - a.nx * ha, roadY(a, -ha), a.z - a.nz * ha,
        a.x + a.nx * ha, roadY(a, ha), a.z + a.nz * ha,
        b.x + b.nx * hb, roadY(b, hb), b.z + b.nz * hb,
        b.x - b.nx * hb, roadY(b, -hb), b.z - b.nz * hb,
        road(C.road),
      );
      rt.ground = 0;
      rt.pool = 0;
      rt.dither = 0;
      /**
       * Kerbs. Red and white, one node each, which at three hundred and fifty is
       * sixteen stripes a second going past at the edge of the screen.
       *
       * And they stand up, which they did not. A kerb was one flat quad painted
       * on the road, so the only thing separating it from a stripe of paint was
       * its colour - and a stripe of paint is exactly what it looked like from
       * the cockpit, which is where you look at it for three minutes.
       *
       * Five centimetres, over three faces: a ramp the car climbs, a flat top,
       * and a lip down the far side. The ramp and the lip face different ways, so
       * under a sun they are different brightnesses, and that is what makes the
       * edge of the road read as an edge. Five rather than the ten a real one is:
       * the simulation has no kerb to ride, and a car sitting on the road at the
       * height of the road should not have its wheels buried in something.
       *
       * Only where you can see it. Past two hundred and fifty metres it is one
       * quad again, as it always was, because past there it is two pixels.
       */
      const kerb = road((i % 2) < 1 ? C.kerbA : C.kerbB);
      const lip = road(shade((i % 2) < 1 ? C.kerbA : C.kerbB, 0.82));
      const RISE = 0.05;
      const RAMP = 0.5;
      for (const side of [-1, 1]) {
        const ea = side * (ha + RUMBLE);
        const eb = side * (hb + RUMBLE);
        // Always the shape, never the flat one. There used to be a cheaper kerb
        // past two hundred and fifty metres, because past there it is two pixels
        // and it was being rebuilt every frame. A kept world has no distance in
        // it - what bounds the picture is which slice of it is drawn - so the
        // far kerbs cost nothing to have properly.
        //
        // Three stations across it: the road edge, the top of the ramp, and the
        // outer edge. The lip hangs from that last one down to the verge.
        const ra = side * (ha + RAMP);
        const rb = side * (hb + RAMP);
        const at = (n, off, lift) => [
          n.x + n.nx * off, roadY(n, off) + lift, n.z + n.nz * off,
        ];
        const p0 = at(a, side * ha, 0); const q0 = at(b, side * hb, 0);
        const p1 = at(a, ra, RISE); const q1 = at(b, rb, RISE);
        const p2 = at(a, ea, RISE); const q2 = at(b, eb, RISE);
        const p3 = at(a, ea, 0); const q3 = at(b, eb, 0);
        rt.quad(...p0, ...p1, ...q1, ...q0, kerb);
        rt.quad(...p1, ...p2, ...q2, ...q1, kerb);
        rt.quad(...p2, ...p3, ...q3, ...q2, lip);
      }

      // A broken line down the middle: three nodes of paint and three of
      // nothing, which at three hundred and fifty is eight dashes a second
      // arriving at the centre of the screen. The edge lines tell you where the
      // track is; this one tells you how fast you are crossing it.
      if ((((i % 6) + 6) % 6) < 3) {
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
      // No rail where the lap runs over its own tarmac: see route.js. It is the
      // one place a barrier would be drawn across a road rather than beside one.
      if (a.bridge === undefined && !a.deck && !a.open) {
        /**
         * Armco has a shape, and the shape is the whole of why it reads.
         *
         * It was two flat quads - a face and a back - from half a metre up to a
         * metre. Flat, it is a ribbon: one colour all the way round the circuit,
         * which is what a barrier looks like when the only thing that varies
         * along it is the red and white it is painted.
         *
         * Three strips instead, stepped in and out by six centimetres, which is
         * the W a crash barrier is pressed into. Nothing about that would have
         * been visible under the old renderer, because a face had whatever
         * shading was typed next to it - and under this one the three strips
         * face three different ways, so the top and bottom catch the sun and the
         * middle does not. That is a line of light running along the barrier all
         * the way to the corner, and it costs four triangles a node.
         */
        const paint = tint((i % 8) < 4 ? C.armco : C.kerbA);
        const back = tint(shade(C.armco, 0.7));
        for (const side of [-1, 1]) {
          const at = side * a.wall;
          const nx = a.nx * side;
          const nz = a.nz * side;
          const ax = a.x + a.nx * at;
          const az = a.z + a.nz * at;
          const bx = b.x + b.nx * at;
          const bz = b.z + b.nz * at;
          const ay = roadY(a, at);
          const by = roadY(b, at);
          // Out, in, out: the three faces of the pressing, each one leaning a
          // different way so each one takes a different amount of the sun.
          const strip = (y0, y1, o0, o1) => {
            rt.quad(
              ax + nx * o0, ay + y0, az + nz * o0,
              bx + nx * o0, by + y0, bz + nz * o0,
              bx + nx * o1, by + y1, bz + nz * o1,
              ax + nx * o1, ay + y1, az + nz * o1,
              paint,
            );
          };
          strip(0.50, 0.70, -0.05, 0.06);
          strip(0.70, 0.88, 0.06, -0.04);
          strip(0.88, 1.05, -0.04, 0.05);
          // The back of it, as one face: nobody sees the shape from behind.
          rt.quad(ax - nx * 0.06, ay + 0.5, az - nz * 0.06, ax - nx * 0.06, ay + 1.05, az - nz * 0.06,
            bx - nx * 0.06, by + 1.05, bz - nz * 0.06, bx - nx * 0.06, by + 0.5, bz - nz * 0.06,
            back);
          /**
           * And a post, every other node.
           *
           * Twelve metres apart rather than the four a real one is: at four they
           * are a picket fence at any distance past fifty metres, and at twelve
           * they are what they are for, which is to say that the rail is
           * standing on something. They are also what makes the barrier tell you
           * how fast you are going, which is the job the marker posts do on the
           * other side of the road.
           */
          if ((((i % 2) + 2) % 2) === 0) {
            const foot = groundY(a, side, Math.abs(at));
            const top = ay + 0.92;
            const px = ax - nx * 0.07;
            const pz = az - nz * 0.07;
            const wx = -a.nz * side * 0.09;
            const wz = a.nx * side * 0.09;
            rt.quad(px - wx, foot, pz - wz, px + wx, foot, pz + wz,
              px + wx, top, pz + wz, px - wx, top, pz - wz, back);
          }
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
      /**
       * The last band is always drawn, however close the circuit's ground stops.
       *
       * `reach` says how much ground a circuit lays down beside the road, and on
       * a street it is little: there are buildings against the barrier and no
       * hillside to model. What it must not do is leave a hole, and it did -
       * beyond the last band nothing is drawn at all, so you see the bottom of
       * the sky gradient, which is a pale warm grey and reads as a solid mass
       * hanging where the ground should be. On Monaco's eleven per cent drop
       * from Mirabeau, with the camera pitched down to follow it, that filled
       * half the screen and looked like a polygon lying over the circuit.
       *
       * So the far plane goes down whatever else does. It is one quad a node at
       * a quarter of the resolution, clamped by the same ceiling as the rest, and
       * it is the difference between a horizon and a hole.
       */
      for (let band = 0; band < BANDS.length
        && (band < a.reach || band === BANDS.length - 1)
        && !a.deck && roof < 0.05; band++) {
        const [inner0, outer, kind, every] = BANDS[band];
        /**
         * Where this band actually starts.
         *
         * Normally its own inner edge. The exception is the last one, which is
         * drawn whatever `reach` says because beyond it there is nothing at all
         * and the bottom of the sky shows through - and which therefore has to
         * start where the last band that *was* drawn stopped. It did not: it
         * started at its own edge, two hundred metres out, leaving a ring of
         * nothing between ninety-five and two hundred that you could see the sky
         * through. On Baku that was every node on the circuit, on Singapore
         * seven hundred and ninety-four of eight hundred and twenty, and on the
         * six other street circuits most of them.
         *
         * It has always been that way and it was invisible while the fog closed
         * at a kilometre.
         */
        const from = band === BANDS.length - 1 && band > a.reach
          ? BANDS[Math.max(0, Math.min(a.reach, BANDS.length - 1))][0]
          : inner0;
        /**
         * A band that starts at the kerb starts wherever the kerb happens to be
         * - which is not the same place at both ends of it.
         *
         * The quad runs from this node to the next and the road is not the same
         * width at the two. Taking the inner edge from this node alone and using
         * it at both ends leaves a sliver of nothing between the kerb and the
         * grass wherever the road narrows: two and a half metres of it at Austin,
         * about a metre at Interlagos, and something on sixteen of the twenty-four
         * surveyed circuits. It is the third way the ground has been found to
         * have a hole in it and the same mistake as the other two - a shared edge
         * worked out twice and not from the same numbers.
         */
        /**
         * Where this band starts, which is never inside the kerb.
         *
         * It used to be the first band alone that was pushed out to the kerb,
         * on the reasoning that it is the only one that could be inside it. At
         * Austin the road is fifteen and a half metres from the middle at its
         * widest and the first ring ends at fifteen point six, so there the
         * first band is not merely inside the kerb, it is entirely behind it -
         * an inverted quad - and the second band is the one that has to start
         * at the road. Fifteen nodes of it.
         *
         * So every band starts at the later of its own edge and the kerb, and
         * one that has been swallowed whole is not drawn at all.
         */
        const innerA = Math.max(from, bandInner(a, BANDS[0][0]));
        const innerB = Math.max(from, bandInner(b, BANDS[0][0]));
        if (innerA >= outer && innerB >= outer) continue;
        if (((i % every) + every) % every !== 0) continue;
        const far = nodeStep(route, i, every);
        // The near bands are grass, sand and gravel, and they take the ground
        // surface. Not the far ones: at three hundred metres out a band is a
        // wedge of colour under the haze and a texture on it is noise.
        rt.ground = band < 2 ? 2 : 0;
        for (const side of [-1, 1]) {
          /**
           * How far this ring may reach on this side.
           *
           * See narrowWhereItFoldsBack in route.js. A ring drawn out to three
           * hundred and forty metres where the lap folds back is a slab of
           * ground laid over the other carriageway with the road under it gone,
           * which from the car is an obstacle across the track - Monaco's
           * hairpin - and which is the other half of what "the track is
           * floating" means.
           */
          const stopA = Math.min(outer, side < 0 ? (a.groundL ?? outer) : (a.groundR ?? outer));
          const stopB = Math.min(outer, side < 0 ? (far.groundL ?? outer) : (far.groundR ?? outer));
          if (stopA <= innerA && stopB <= innerB) continue;

          /**
           * Cut at every ring edge it spans, and not just at its own two.
           *
           * A band is a flat quad between two offsets, so the surface it draws
           * is a straight line across it - and `groundY`, which is where every
           * tree, lorry and grandstand beside the road is stood, is a piecewise
           * curve through the height of each ring. While a band is one ring wide
           * the two agree at both ends and everywhere between.
           *
           * The last one is not one ring wide. It is always drawn, and where a
           * circuit's ground stops short it stands in for the rings that were
           * skipped - two hundred and forty metres of it in one quad, cutting
           * the corner off a curve that was meant to go through two more
           * heights. The things standing on that stretch were therefore in the
           * air, by up to twenty-three metres at Monaco.
           */
          const cuts = [innerA];
          const cutsB = [innerB];
          const reach = Math.min(stopA, stopB);
          for (let k = 0; k < BANDS.length; k++) {
            if (BANDS[k][0] > innerA && BANDS[k][0] < reach) {
              cuts.push(BANDS[k][0]);
              cutsB.push(BANDS[k][0]);
            }
          }
          cuts.sort((x, y) => x - y);
          cutsB.sort((x, y) => x - y);
          cuts.push(Math.max(innerA, stopA));
          cutsB.push(Math.max(innerB, stopB));

          const colour = bandColour(local, a, side, kind, i, this.surf);
          for (let k = 0; k < cuts.length - 1; k++) {
            const i0 = cuts[k];
            const i1 = cuts[k + 1];
            const j0 = cutsB[k];
            const j1 = cutsB[k + 1];
            if (i1 <= i0 && j1 <= j0) continue;
            rt.quad(
              a.x + a.nx * side * i0, groundY(a, side, i0), a.z + a.nz * side * i0,
              a.x + a.nx * side * i1, groundY(a, side, i1), a.z + a.nz * side * i1,
              far.x + far.nx * side * j1, groundY(far, side, j1), far.z + far.nz * side * j1,
              far.x + far.nx * side * j0, groundY(far, side, j0), far.z + far.nz * side * j0,
              tint(colour),
            );
          }
        }
        rt.ground = 0;
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
      if (roof > 0.05) this.tunnel(a, b, tint, i, roof);

      const props = route.props[a.i];
      if (props) {
        for (const prop of props) {
          // The ones that turn, flap, spin or come on at dusk are not part of a
          // world that is built once. They are drawn a frame at a time by `live`.
          if (LIVE_PROPS.has(prop.kind)) continue;
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
          const foot = prop.flat ? levelWith(a, off) : groundY(a, Math.sign(off) || 1, Math.abs(off));
          drawProp(rt, prop,
            a.x + a.nx * off, foot + (prop.lift || 0), a.z + a.nz * off,
            tint, local, prop.align ? a.a : 0, 0, night, 0);
        }
      }
    }

    // One past the end, so the last node's length can be worked out the same way
    // as everybody else's.
    rt.mark();
    this.world = rt.keep();
    this.builtIn = performance.now() - started;
  }

  /**
   * The circuit, as a slice of the buffer it was built into.
   *
   * The nodes in view are contiguous - the road is a loop and the buffer is in
   * node order - so this is one range, or two where the view crosses the start
   * line. Two draw calls for eighteen hundred metres of circuit.
   */
  ground(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    this.keepWorld(state, theme);
    const n = route.nodes.length;
    const marks = this.world.marks;
    const from = (((nodeAt(route, p.s).i - DRAW_BEHIND) % n) + n) % n;
    const span = Math.min(n, DRAW_AHEAD + DRAW_BEHIND);
    const to = (from + span) % n;
    const ranges = to > from
      ? [[marks[from], marks[to] - marks[from]]]
      : [[marks[from], marks[n] - marks[from]], [marks[0], marks[to]]];
    rt.show(this.world, ranges);
    this.live(state, theme, p);
  }

  /**
   * The parts of the circuit that are not the same as they were a frame ago.
   *
   * Three kinds. The props that move or light up - see LIVE_PROPS. The surf,
   * which shuffles along the waterline and is the single cheapest thing in the
   * game that makes the sea look wet. And that is all: everything else the eye
   * reads as changing is either a car, or the same geometry under a different
   * light.
   */
  live(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    const first = nodeAt(route, p.s).i - DRAW_BEHIND;
    const night = Math.max(0, (this.lightAt - 0.4) / 0.6);
    for (let step = 0; step < DRAW_AHEAD; step++) {
      const i = first + step;
      const a = nodeStep(route, i, 0);
      const away = step * SEG;
      const roof = a.tunnel || 0;
      const dark = (colour) => (roof > 0
        ? mix(mix(colour, TUNNEL_DARK, roof * 0.62), C.lamp, roof * 0.10)
        : colour);
      const tint = (colour) => dark(this.lamp(colour));
      const local = !route.theme && a.warm > 0.02 && a.warm < 0.98
        ? this.theme(a.warm) : theme;

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

      const props = route.props[a.i];
      if (!props || away >= PROP_FAR) continue;
      for (const prop of props) {
        if (!LIVE_PROPS.has(prop.kind)) continue;
        const off = prop.side * prop.off;
        const foot = prop.flat ? levelWith(a, off) : groundY(a, Math.sign(off) || 1, Math.abs(off));
        drawProp(rt, prop,
          a.x + a.nx * off, foot + (prop.lift || 0), a.z + a.nz * off,
          tint, local, prop.align ? a.a : 0, state.tick, night, away);
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
  tunnel(a, b, tint, i, roof = 1) {
    const rt = this.rt;
    /**
     * How far apart the walls are - at each end of this section, not at one.
     *
     * A tunnel section runs from this node to the next and the barrier line the
     * walls stand on is not in the same place at the two. Built to this node's
     * width at both ends, every section ends where the next one does not begin,
     * and eight hundred and forty metres of Monaco has a slit of daylight down
     * each wall every six metres. It is the same mistake as the sliver between
     * the kerb and the grass: a shared edge worked out once and used twice.
     */
    const wideA = a.wall + 0.4;
    const wideB = b.wall + 0.4;
    const high = 5.5;
    const wall = tint(shade(C.chrome, 0.5));
    const ceiling = tint(shade(C.shadow, 1.35));
    const strip = mix(C.lamp, C.hot, 0.25);

    const floor = tint(shade(C.chrome, 0.34));
    for (const side of [-1, 1]) {
      const atA = side * wideA;
      const atB = side * wideB;
      const ax = a.x + a.nx * atA;
      const az = a.z + a.nz * atA;
      const bx = b.x + b.nx * atB;
      const bz = b.z + b.nz * atB;
      const ay = roadY(a, atA);
      const by = roadY(b, atB);
      rt.quad(ax, ay, az, bx, by, bz, bx, by + high, bz, ax, ay + high, az, wall);
      /**
       * And the footway between the kerb and the wall, which was not there.
       *
       * No ground at all is drawn inside a tunnel - there is a wall where the
       * verge would be, and a strip of daylit grass along the inside of a
       * mountain is worse than nothing. But the wall stands at the barrier and
       * the kerb ends a metre and a half inside it, so between the two there was
       * a metre and a half of no floor, all the way through.
       */
      const eA = side * (a.half + RUMBLE);
      const eB = side * (b.half + RUMBLE);
      rt.quad(
        a.x + a.nx * eA, roadY(a, eA), a.z + a.nz * eA,
        b.x + b.nx * eB, roadY(b, eB), b.z + b.nz * eB,
        bx, by, bz, ax, ay, az,
        floor,
      );
    }
    /**
     * The roof, where there is one.
     *
     * The mask is softened over three nodes either side of the tags, so a node
     * at the mouth is a fraction under cover rather than all or nothing - and
     * the walls go up over that fraction, which is what makes the mouth a portal
     * rather than a hole cut in the air. The roof does not: it went on at full
     * height from the first node above five per cent, thirty metres before the
     * road actually goes under anything, and arrived as a slab sliding across a
     * street you could still see the sky over.
     *
     * Above half, then. That is where the tags say you are under something.
     */
    if (roof < 0.5) return;
    /**
     * The roof meets the tops of the walls, which are not at one height.
     *
     * It was drawn at the height of the middle of the road plus five and a half
     * metres, and the walls stand on the edges of it - and the edges of a road
     * with camber on them are not at the height of the middle. Every roof panel
     * therefore missed both walls by the camber, which is a slit of daylight
     * running the length of Monaco's tunnel at the top of each side.
     */
    rt.quad(
      a.x - a.nx * wideA, roadY(a, -wideA) + high, a.z - a.nz * wideA,
      b.x - b.nx * wideB, roadY(b, -wideB) + high, b.z - b.nz * wideB,
      b.x + b.nx * wideB, roadY(b, wideB) + high, b.z + b.nz * wideB,
      a.x + a.nx * wideA, roadY(a, wideA) + high, a.z + a.nz * wideA,
      ceiling,
    );
    const ay = roadY(a, 0) + high;
    const by = roadY(b, 0) + high;
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

  /**
   * A lap somebody already drove, drawn as a shape rather than as a car.
   *
   * There is no alpha in a renderer that writes whole pixels into a Uint32Array,
   * so a translucent car is not on offer. A flat one is: every colour on it goes
   * to the same pale blue, which reads as a silhouette rather than as a rival,
   * and there is never a moment where you look at it and think it is somebody
   * you can hit.
   */
  phantom(state, theme, p) {
    if (!state.ghost || !state.ghostAt || state.ghostAt.done) return;
    const car = state.ghostCar;
    const away = car.s - p.s;
    if (away < -60 || away > 780) return;
    const at = this.at(state, car);
    if (Math.hypot(at.x - this.cam.x, at.z - this.cam.z) < 5.4) return;
    // No shadow: a recording does not stand between the sun and the road.
    const tint = () => PHANTOM;
    /**
     * Every other pixel, and no depth written - the same trick the tyre smoke
     * uses. A checkerboard at this resolution is what a sixteen-bit machine had
     * instead of alpha, and it is still the right answer up close: the road
     * shows through it, a real car in front covers it, and nobody mistakes it
     * for something they can touch.
     *
     * Only up close, though. Three seconds ahead is a hundred and sixty metres,
     * where the car is a few dozen pixels; take half of those away and paint the
     * rest in something near the colour of fogged tarmac and there is nothing
     * left to see. It was being drawn the whole time - forty-eight faces of it -
     * and it was invisible. Past seventy metres it goes solid, which costs
     * nothing: there is nothing else on the circuit in qualifying to mistake it
     * for, and the colour says what it is.
     */
    this.rt.stipple = Math.abs(away) < 70 ? 1 : 0;
    const pitch = -Math.atan(at.slope);
    drawRacer(this.rt, car, at.x, at.y, at.z, at.a, tint, this.lightAt, pitch);
    this.rt.stipple = 0;
  }

  /** The other seven, and you. */
  cars(state, theme, p) {
    const rt = this.rt;
    const route = state.route;
    this.phantom(state, theme, p);
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
      /**
       * The blob under the car, when there is nothing better.
       *
       * It was a dark quad on the road under every car, at the size of the car,
       * and it was the only shadow this game had. There is a real one now - the
       * car is in the same buffer the sun's view is drawn from, so it casts
       * where the sun says it should - and drawing both puts two shadows under
       * one car pointing in different directions.
       *
       * It stays for the machines that cannot do the real one, where it is still
       * the difference between a car on the road and a car hovering over it.
       */
      if (!rt.shadow) drawShadow(rt, at.x, at.y, at.z, yaw, 1.15, 2.5, tint, pitch);
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
    /**
     * And the lap being raced against, as a hollow square.
     *
     * Qualifying is otherwise an empty map with one blinking dot on it, and the
     * ghost is the only other thing out there - whether it is round the next
     * corner or half a lap behind is exactly what a map is for. Hollow rather
     * than filled, and in its own pale colour, so it is never read as one of the
     * seven cars that can be hit: it is drawn the same way in both places, solid
     * nowhere.
     */
    if (state.ghost && state.ghostAt && !state.ghostAt.done) {
      const g = worldOf(state.route, state.ghostCar.s, state.ghostCar.x);
      const [gx, gy] = place(g.x, g.z);
      rt.rect(x + gx - 1, y + gy - 1, 3, 3, PHANTOM);
      rt.rect(x + gx, y + gy, 1, 1, HUD_BACK);
    }

    const me = worldOf(state.route, p.s, p.x);
    const [px, py] = place(me.x, me.z);
    // Blinking, because on a map this size a stationary dot among seven others
    // is a dot you have to hunt for and this one you have to find at a glance.
    rt.rect(x + px - 1, y + py - 1, 3, 3, (state.tick % 40) < 26 ? WARN : HUD_TEXT);
  }

  /** A fog function for one distance, made once and handed to a model. */
  tinter(theme, away) {
    return (colour) => this.lampCar(colour);
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
   * The display layer, or something shaped like it when there is not one.
   *
   * It used to be a proxy that scaled the HUD's own coordinates onto the pixel
   * buffer the world was drawn in. The scaling lives in hud.js now, so this is
   * only the answer to "is there a display to draw on" - and the tools that draw
   * the world without one get an object that quietly does nothing, which is
   * cheaper than a check at every call site.
   */
  get ui() {
    return this.hudLayer || NO_HUD;
  }

  hud(state, p) {
    const rt = this.ui;
    const W = this.hudW;
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

    /**
     * How far up or down you are on the lap you are chasing, under the clock.
     *
     * Green for ahead and red for behind, because at two hundred and eighty
     * nobody reads a sign - they read a colour, and then the number if there is
     * time. Whose lap it is goes above it in small letters: racing your own best
     * from yesterday and racing whoever is top of the board are different
     * feelings and it should be obvious which one is on.
     */
    if (qual && state.ghost) {
      // Fifty wide, not sixty: the corner arrow sits twenty-six either side of
      // the middle, and a sixty wide panel runs into whichever one is showing.
      rt.panel(W / 2 - 25, 27, 50, 20, HUD_BACK, HUD_EDGE);
      rt.textMid(state.ghost.name || 'GHOST', W / 2, 30, HUD_DIM);
      if (state.delta === null) {
        // The lap out of the grid, which is not the lap the ghost is on. Saying
        // so is better than showing a difference that only means you started
        // from a standstill and it did not.
        rt.textMid('OUT LAP', W / 2, 38, HUD_DIM);
      } else {
        const behind = state.delta > 0;
        const gap = Math.abs(state.delta) / 60;
        rt.textMid(`${behind ? '+' : '-'}${gap.toFixed(2)}`, W / 2, 38,
          gap < 0.005 ? HUD_TEXT : behind ? BAD : GOOD);
      }
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
    //
    // Below the difference rather than across it: this used to start at
    // forty-four, which is three pixels inside the bottom of the panel that says
    // how far up you are, so the two of them overlapped for exactly the two
    // seconds after a lap - which is the moment you most want to read both.
    if (state.lapNote > 0) {
      const fresh = p.last && p.last === p.best;
      rt.panel(W / 2 - 52, 50, 104, 24, HUD_BACK, fresh ? WARN : HUD_EDGE);
      rt.textMid(fresh ? 'BEST LAP' : `LAP ${lapOf(p)}`, W / 2, 54, fresh ? WARN : HUD_DIM);
      rt.textMid(formatTime(p.last), W / 2, 64, HUD_TEXT);
    } else if (state.checkNote > 0) {
      rt.panel(W / 2 - 62, 50, 124, 24, HUD_BACK, GOOD);
      rt.textMid('CHECKPOINT', W / 2, 54, GOOD);
      rt.textMid(`+${Math.round(state.cfg.clock * state.rules.clock * CHECKPOINT_TIME)} SECONDS`,
        W / 2, 64, HUD_TEXT);
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
    const x = this.hudW / 2 + (bend > 0 ? 26 : -26 - wide);
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
    const W = this.hudW;
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

/** A packed colour, as the three floats a shader takes. */
function rgb(colour) {
  return [(colour & 255) / 255, ((colour >> 8) & 255) / 255, ((colour >> 16) & 255) / 255];
}

/**
 * Where the first ring of ground starts, at a given node.
 *
 * At the kerb, wherever the kerb happens to be. It is a function rather than two
 * lines inside the loop so that the test next door can ask the same question the
 * renderer asks - the bug it is there to catch is the two of them disagreeing.
 */
export function bandInner(node, nominal) {
  return Math.max(node.half + RUMBLE, nominal - (ROAD_HALF - node.half));
}

/** The tarmac's height at an offset, including the camber into the corner. */
/**
 * How far a prop standing level with the road may hang over the ground.
 *
 * `flat` exists for one reason: the ground beside a boulevard can be the sea,
 * and a lamp post at the bottom of that is a lamp post in the water. Over water
 * a flat prop may stay this far above what is under it. Over land there is
 * nothing to be saved from and it stands on the ground.
 */
export const FLAT_DROP = 1.5;

/** How far from the road's edge the quay reaches, past which the water is water. */
const QUAY = 25;

/**
 * Level with the road, without the banking carrying it into the air.
 *
 * This used to be `roadY(n, off)`, which is the road's *plane* extended out to
 * wherever the prop stands. On a flat road that is the same thing. On eighteen
 * degrees of dish at Zandvoort, a marker post sixteen metres out is five metres
 * up; at Austin, where the ground falls away as well, it was twelve. Seven
 * thousand seven hundred props across the twenty-seven circuits were off the
 * ground, and the marker posts - the cheapest thing in the game and the one that
 * makes it feel fast - were most of them.
 *
 * The road's height is taken at its own edge instead, and then the prop stands
 * on the ground unless the ground is more than a stride below that.
 */
export function levelWith(n, off) {
  const under = groundY(n, Math.sign(off) || 1, Math.abs(off));
  // Dry land is land: stand on it. Held at road level instead, a grandstand on
  // the slope below Interlagos hung twenty-eight metres in the air, because the
  // rule that keeps a lamp post out of the harbour does not know the difference
  // between four metres of water and a hillside.
  if (!(n.g && n.g.wet > 0.5)) return under;
  // And only close in. The quay a lamp post stands on is a few metres from the
  // road; a wind turbine three hundred metres out to sea is in the sea, and
  // holding that at road level left it standing five metres above the water.
  if (Math.abs(off) - n.half > QUAY) return under;
  const edge = Math.sign(off) * Math.min(Math.abs(off), n.half);
  return Math.max(under, roadY(n, edge) - FLAT_DROP);
}

export function roadY(n, off) {
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

export function groundY(n, side, off) {
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
  /**
   * Out from the kerb through each ring's height in turn.
   *
   * Every segment starts at the later of its own inner edge and the kerb, and
   * the reason is Austin. The road there is sixteen and five sixths of a metre
   * from the middle at its widest and the first ring ends at fifteen point six -
   * so the kerb is past the end of the first ring, the span it was being
   * interpolated over was negative, and the height came out two metres below the
   * road a metre past the white line. A cliff at the edge of the track, and
   * everything standing on that stretch hanging over it.
   */
  const lip = roadY(n, side * kerb) - GROUND_DROP;
  const span = (lo, hi, y0, y1) => {
    const from = Math.max(lo, kerb);
    return lerp(from === lo ? y0 : lip, y1, (off - from) / (hi - from));
  };
  if (off <= RINGS[0]) return span(kerb, RINGS[0], lip, g[0]);
  if (off <= RINGS[1]) return span(RINGS[0], RINGS[1], g[0], g[1]);
  if (off <= RINGS[2]) return span(RINGS[1], RINGS[2], g[1], g[2]);
  if (off <= RINGS[3]) return span(RINGS[2], RINGS[3], g[2], far);
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
