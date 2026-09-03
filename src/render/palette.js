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
  crowd: md(160, 120, 150),
  armco: md(206, 210, 214),
};

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
