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
  centre: md(228, 224, 180),
  kerbA: md(206, 60, 52),
  kerbB: md(232, 232, 228),
  shadow: md(28, 28, 34),
  wreck: md(52, 48, 52),
  spark: md(255, 220, 96),
  blood: md(190, 40, 40),
  chrome: md(196, 200, 208),
  tyre: md(34, 34, 40),
  glass: md(96, 150, 176),
  metal: md(120, 124, 132),
  club: md(126, 92, 56),
  baton: md(232, 232, 236),
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
 * The colours a rider is made of.
 *
 * Each gang gets one, and they are picked so you can tell who is about to hit
 * you from a hundred metres away, in one glance, at this resolution - which
 * rules out anything subtle. The player is the only one in cream and burgundy.
 */
export const RIDERS = {
  player: { body: md(160, 30, 40), skin: md(214, 168, 128), kit: md(226, 214, 190), helmet: md(230, 226, 210) },
  rival: { body: md(40, 80, 160), skin: md(196, 150, 112), kit: md(60, 100, 190), helmet: md(230, 230, 236) },
  gang: { body: md(30, 30, 36), skin: md(180, 140, 108), kit: md(60, 56, 60), helmet: md(120, 20, 24) },
  cop: { body: md(236, 236, 240), skin: md(200, 158, 120), kit: md(30, 40, 90), helmet: md(240, 240, 244) },
};

export const CARS = [
  md(180, 40, 44), md(220, 190, 60), md(60, 120, 190), md(230, 230, 230),
  md(40, 130, 80), md(150, 90, 40), md(90, 90, 100), md(200, 110, 40),
];

/** The gangs' cars, which are not civilian colours and are not meant to be. */
export const GANG_CARS = [md(30, 30, 36), md(70, 20, 24), md(50, 40, 70)];
