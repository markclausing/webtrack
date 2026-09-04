/**
 * Colour.
 *
 * Every value here goes through md(), which throws away everything below the
 * top three bits of each channel - so these are not the colours written down,
 * they are the nearest colours the machine being imitated could actually make.
 * Writing them out in full and letting the snap happen is deliberate: it means
 * the numbers read like colours rather than like a lookup table, and two greens
 * that snap to the same green are a signal that one of them was never needed.
 *
 * Two themes, because the two halves of the route are two different times of
 * day as much as two different places: the pass is cold, blue and high, and the
 * boulevard is warm, low and hazy. Fog colour matters more than any of the rest,
 * because everything distant becomes it.
 */

import { md } from './raster.js';

export const C = {
  road: md(74, 74, 82),
  roadAlt: md(86, 86, 94),
  kerbA: md(206, 60, 52),
  kerbB: md(232, 232, 228),
  shadow: md(28, 28, 34),
  chrome: md(196, 200, 208),
  tyre: md(34, 34, 40),
  glass: md(96, 150, 176),
  metal: md(120, 124, 132),
  helmet: md(236, 236, 240),
  hot: md(250, 190, 40),
  tail: md(255, 60, 40),
  lamp: md(255, 244, 196),
  crowd: md(160, 120, 150),
  armco: md(206, 210, 214),
};

/**
 * `ridge` is a misnomer kept for the sake of the two themes that were here
 * first: nothing draws a ridge with it. It is the colour of anything built -
 * grandstands and the blocks along the boulevard - and on a circuit in the sand
 * that matters more than it sounds. Given the dunes' own tan it camouflaged
 * every stand at Zandvoort, and eighteen metres of grandstand the colour of the
 * dune behind it reads as a mesa, which is what it looked like.
 */
export const THEMES = {
  mountain: {
    sky: [
      [0.20, md(24, 32, 92)],
      [0.34, md(46, 60, 132)],
      [0.44, md(84, 108, 168)],
      [0.52, md(140, 168, 200)],
      [1.00, md(176, 196, 214)],
    ],
    fog: md(150, 172, 196),
    near: md(66, 104, 58),
    mid: md(52, 86, 52),
    far: md(74, 96, 92),
    ridge: md(96, 112, 140),
    verge: md(96, 106, 70),
    rock: md(122, 116, 108),
    tree: md(30, 66, 44),
    trunk: md(74, 54, 38),
    water: md(58, 94, 128),
  },
  /**
   * The Ardennes. Spruce to the barrier on both sides, and a sky that is doing
   * you a favour by not raining - which at Spa it usually is, and which is why
   * the green here is a cold one rather than a summer one.
   */
  ardennes: {
    sky: [
      [0.20, md(30, 44, 92)],
      [0.34, md(58, 78, 132)],
      [0.44, md(102, 126, 166)],
      [0.52, md(150, 170, 194)],
      [1.00, md(184, 196, 206)],
    ],
    fog: md(168, 180, 190),
    near: md(58, 96, 54),
    mid: md(44, 78, 46),
    far: md(52, 74, 62),
    ridge: md(116, 122, 128),
    verge: md(88, 110, 66),
    rock: md(112, 110, 104),
    tree: md(22, 54, 38),
    trunk: md(64, 48, 36),
    water: md(52, 84, 110),
  },
  /**
   * The Royal Park at Monza: broadleaf rather than conifer, and a warmer, dustier
   * light. The park is the reason the circuit looks like nowhere else - it is a
   * road through a wood, not a facility with trees around it.
   */
  park: {
    sky: [
      [0.20, md(36, 56, 116)],
      [0.34, md(70, 100, 158)],
      [0.44, md(122, 156, 190)],
      [0.52, md(176, 196, 208)],
      [1.00, md(206, 210, 200)],
    ],
    fog: md(198, 200, 186),
    near: md(84, 116, 56),
    mid: md(66, 98, 50),
    far: md(84, 102, 74),
    ridge: md(134, 134, 130),
    verge: md(110, 128, 68),
    rock: md(132, 126, 114),
    tree: md(44, 84, 40),
    trunk: md(84, 62, 42),
    water: md(60, 96, 120),
  },
  /** Suzuka: bright, humid, and hazier the further out you look. */
  japan: {
    sky: [
      [0.20, md(40, 66, 128)],
      [0.34, md(78, 116, 172)],
      [0.44, md(134, 172, 200)],
      [0.52, md(186, 206, 216)],
      [1.00, md(212, 218, 216)],
    ],
    fog: md(204, 212, 212),
    near: md(76, 122, 62),
    mid: md(58, 102, 56),
    far: md(78, 106, 88),
    ridge: md(124, 132, 138),
    verge: md(104, 132, 72),
    rock: md(124, 122, 114),
    tree: md(36, 80, 46),
    trunk: md(78, 60, 42),
    water: md(56, 100, 132),
  },
  /**
   * Zandvoort. Sand on both sides and the North Sea over the top of it, which is
   * a colder and greyer sea than the one on the boulevard - that one is a
   * holiday and this one is weather.
   */
  dunes: {
    sky: [
      [0.20, md(48, 68, 118)],
      [0.34, md(88, 116, 158)],
      [0.44, md(140, 164, 188)],
      [0.52, md(186, 200, 210)],
      [1.00, md(212, 214, 210)],
    ],
    fog: md(186, 192, 190),
    near: md(190, 174, 130),
    mid: md(172, 158, 118),
    far: md(152, 144, 116),
    ridge: md(126, 130, 136),
    verge: md(158, 156, 96),
    rock: md(164, 152, 126),
    tree: md(96, 116, 62),
    trunk: md(112, 96, 62),
    // Colder and greyer than the boulevard's water, and a good deal stronger
    // than it started out: at the first attempt the North Sea was within a
    // shade of the haze in front of it and the beach read as an overexposure.
    water: md(40, 86, 122),
  },
  coast: {
    sky: [
      [0.16, md(38, 76, 150)],
      [0.30, md(84, 132, 190)],
      [0.42, md(160, 190, 214)],
      [0.50, md(226, 196, 152)],
      [1.00, md(238, 214, 170)],
    ],
    fog: md(226, 206, 176),
    near: md(198, 178, 124),
    mid: md(176, 158, 112),
    far: md(150, 142, 110),
    ridge: md(170, 160, 150),
    verge: md(206, 190, 140),
    rock: md(168, 152, 120),
    tree: md(48, 96, 56),
    trunk: md(96, 74, 50),
    water: md(28, 96, 138),
  },
};

/**
 * The colours a car is painted.
 *
 * Eight, and they are picked so you can tell who is in front of you from two
 * hundred metres away, at this resolution, in one glance - which rules out
 * anything subtle and rules out two of anything. Red and orange are the two that
 * come closest and they are kept apart on the grid.
 *
 * `body` is the tub and the engine cover, `wing` is the front and rear wings and
 * is deliberately darker, and `trim` is the airbox and the helmet: the one part
 * of the car you see from directly behind for three minutes at a time.
 */
export const TEAM_COLOURS = [
  { body: md(196, 24, 28), wing: md(120, 14, 18), trim: md(240, 224, 96) },   // ROSSO
  { body: md(206, 210, 216), wing: md(120, 124, 132), trim: md(30, 60, 150) }, // ARGENT
  { body: md(28, 76, 190), wing: md(16, 40, 110), trim: md(240, 240, 244) },   // AZUL
  { body: md(24, 140, 72), wing: md(14, 80, 44), trim: md(240, 240, 120) },    // VERDE
  { body: md(238, 150, 20), wing: md(140, 84, 12), trim: md(40, 40, 48) },     // AMBRA
  { body: md(40, 40, 48), wing: md(20, 20, 24), trim: md(230, 190, 40) },      // NERO
  { body: md(240, 240, 240), wing: md(150, 150, 156), trim: md(200, 30, 60) }, // BIANCO
  { body: md(128, 50, 180), wing: md(70, 26, 100), trim: md(240, 230, 240) },  // VIOLA
];

/** Smoke off a locked tyre, and the dust a car picks up off the grass. */
export const SMOKE = md(214, 214, 218);
export const DUST = md(176, 158, 112);

/**
 * The time of day, which moves while you are racing.
 *
 * A race starts in the afternoon, has the sun on the horizon by the second lap
 * and finishes in the dark. Rather than three copies of every colour in this
 * file, each time of day is a transformation applied to the colours that are
 * already here: darken by `dim`, then pull `wash` of the way towards a colour.
 * Dusk pulls everything towards orange and takes a fifth of the brightness;
 * night pulls it towards a deep blue and takes two thirds.
 *
 * That is one arithmetic operation per polygon colour and it means a colour
 * added to the game tomorrow gets a night version for nothing.
 */
export const TIMES = [
  {
    at: 0,
    dim: 1,
    wash: md(255, 246, 220),
    pull: 0,
    sun: md(255, 250, 226),
    sunSize: 7,
    sunHigh: 0.34,
    sky: null,          // whatever the circuit's own sky is
  },
  {
    at: 0.52,
    dim: 0.84,
    wash: md(255, 178, 98),
    pull: 0.24,
    sun: md(255, 140, 40),
    sunSize: 17,
    sunHigh: 0.01,
    sky: [
      [0.16, md(52, 30, 78)],
      [0.30, md(122, 52, 88)],
      [0.41, md(206, 96, 76)],
      [0.49, md(248, 158, 74)],
      [1.00, md(252, 196, 118)],
    ],
  },
  {
    at: 1,
    dim: 0.3,
    wash: md(56, 74, 134),
    pull: 0.34,
    sun: md(226, 230, 244),
    sunSize: 6,
    sunHigh: 0.2,
    sky: [
      [0.30, md(6, 6, 24)],
      [0.44, md(12, 14, 40)],
      [0.52, md(22, 28, 62)],
      [1.00, md(34, 42, 82)],
    ],
  },
];

/**
 * One colour, at a given time of day.
 *
 * Darkened and then pulled towards the wash in a single pass, because this runs
 * once per polygon colour per frame and doing it as two calls to the helpers
 * above would snap the colour to the palette twice - which loses a little of it
 * each time and shows up as banding on the hillsides.
 */
export function lit(colour, dim, wash, pull) {
  if (pull <= 0 && dim >= 1) return colour;
  const r = (colour & 255) * dim;
  const g = ((colour >> 8) & 255) * dim;
  const b = ((colour >> 16) & 255) * dim;
  return md(
    r + ((wash & 255) - r) * pull,
    g + (((wash >> 8) & 255) - g) * pull,
    b + (((wash >> 16) & 255) - b) * pull,
  );
}

/** Where the sun sits, as a world bearing. It does not move; you do. */
export const SUN_BEARING = 2.2;
