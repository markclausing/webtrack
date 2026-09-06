/**
 * Colour.
 *
 * Every value here goes through md(), which keeps the top five bits of each
 * channel - so these are not quite the colours written down, they are the
 * nearest the palette can make. Writing them out in full and letting the snap
 * happen is deliberate: it means the numbers read like colours rather than like
 * a lookup table.
 *
 * Five bits, and it was three. Three is the Mega Drive's five hundred and twelve
 * and it is what gives flat shading its bite, because two greens that were
 * nearly the same stop being nearly the same. It went up because eight values of
 * blue cannot make a sky: the gradient had to be drawn as four or five stripes
 * with a great deal of care taken over hiding the joins, which worked and still
 * left a sky that looked like stripes with the joins hidden.
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
  // Corner boards. Yellow with a black chevron on it, which is the most legible
  // pair of colours there is and is what the boards beside a real circuit are
  // painted, for the same reason.
  board: md(248, 206, 48),
  boardHard: md(240, 96, 36),
  boardMark: md(24, 22, 20),
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
  /**
   * Silverstone: a wartime airfield in Northamptonshire. Flat, open, and green
   * in a way that is nothing like the Ardennes - this is farmland, not forest,
   * and the sky over it is doing you a favour by holding off.
   */
  downs: {
    sky: [
      [0.20, md(44, 62, 112)],
      [0.34, md(84, 110, 152)],
      [0.44, md(140, 162, 186)],
      [0.52, md(184, 196, 206)],
      [1.00, md(208, 212, 210)],
    ],
    fog: md(196, 202, 202),
    near: md(88, 128, 62),
    mid: md(74, 112, 58),
    far: md(92, 116, 84),
    ridge: md(132, 136, 134),
    verge: md(118, 138, 70),
    rock: md(140, 138, 130),
    tree: md(44, 88, 46),
    trunk: md(84, 66, 46),
    water: md(64, 100, 124),
  },
  /**
   * Interlagos: a hollow with a city up the sides of it. Warm, hazy, and a
   * harder light than anywhere else here - the green is dusty rather than lush,
   * because that is what it is.
   */
  brasil: {
    sky: [
      [0.20, md(46, 74, 140)],
      [0.34, md(92, 128, 182)],
      [0.44, md(150, 180, 204)],
      [0.52, md(206, 212, 204)],
      [1.00, md(230, 220, 196)],
    ],
    fog: md(222, 214, 194),
    near: md(102, 122, 62),
    mid: md(88, 106, 56),
    far: md(114, 118, 92),
    ridge: md(150, 142, 130),
    verge: md(126, 132, 68),
    rock: md(148, 134, 112),
    tree: md(52, 92, 44),
    trunk: md(96, 72, 48),
    water: md(58, 96, 116),
  },
  /**
   * The Red Bull Ring: Styria, which is spruce and steep grass and a sky with
   * altitude in it. Colder and cleaner than the Ardennes, and brighter, because
   * a hillside in Austria in July is not a forest in Belgium in August.
   */
  alps: {
    sky: [
      [0.20, md(28, 52, 118)],
      [0.34, md(62, 100, 166)],
      [0.44, md(118, 158, 198)],
      [0.52, md(176, 200, 216)],
      [1.00, md(206, 218, 220)],
    ],
    fog: md(198, 210, 214),
    near: md(84, 132, 62),
    mid: md(64, 110, 54),
    far: md(76, 104, 92),
    ridge: md(126, 132, 136),
    verge: md(112, 140, 70),
    rock: md(132, 130, 126),
    tree: md(26, 66, 42),
    trunk: md(70, 54, 40),
    water: md(56, 104, 134),
  },
  /**
   * Ile Notre-Dame: parkland on an island, with the St Lawrence round it and
   * Montreal on the far bank. The one theme here where the water is a river
   * rather than a sea, so it takes its colour from the sky rather than from
   * depth.
   */
  island: {
    sky: [
      [0.20, md(38, 66, 128)],
      [0.34, md(80, 118, 172)],
      [0.44, md(138, 172, 202)],
      [0.52, md(190, 206, 214)],
      [1.00, md(214, 218, 214)],
    ],
    fog: md(206, 212, 212),
    near: md(78, 118, 58),
    mid: md(62, 102, 52),
    far: md(84, 108, 86),
    ridge: md(128, 132, 136),
    verge: md(108, 132, 66),
    rock: md(134, 132, 126),
    tree: md(38, 82, 44),
    trunk: md(80, 62, 44),
    water: md(72, 108, 130),
  },
  /** Austin: open scrubland, hot and hazy, with nothing tall in it. */
  texas: {
    sky: [
      [0.20, md(44, 78, 146)],
      [0.34, md(92, 132, 186)],
      [0.44, md(152, 184, 206)],
      [0.52, md(208, 216, 208)],
      [1.00, md(232, 224, 198)],
    ],
    fog: md(226, 218, 196),
    near: md(116, 128, 66),
    mid: md(100, 112, 60),
    far: md(126, 126, 94),
    ridge: md(154, 148, 134),
    verge: md(140, 138, 74),
    rock: md(158, 142, 116),
    tree: md(62, 90, 48),
    trunk: md(98, 76, 52),
    water: md(60, 100, 122),
  },
  /**
   * Bahrain. Sand in every direction, and it hardly matters what colour the sky
   * is written as here because this circuit is always run at dusk - the
   * time-of-day pass replaces the bands and pulls everything else towards the
   * sodium of the floodlights. What matters is the ground.
   */
  desert: {
    sky: [
      [0.20, md(52, 74, 128)],
      [0.34, md(104, 126, 164)],
      [0.44, md(168, 174, 186)],
      [0.52, md(216, 200, 168)],
      [1.00, md(232, 210, 172)],
    ],
    fog: md(222, 202, 168),
    near: md(196, 166, 116),
    mid: md(180, 150, 104),
    far: md(166, 142, 106),
    ridge: md(150, 142, 132),
    verge: md(178, 154, 108),
    rock: md(170, 146, 112),
    tree: md(84, 96, 54),
    trunk: md(110, 88, 58),
    water: md(58, 96, 118),
  },
  /**
   * Mexico City, two thousand two hundred metres up. There is a fifth less air
   * overhead than anywhere else in this game and the sky says so: deeper and
   * harder at the top, with less haze to soften the distance.
   */
  altiplano: {
    sky: [
      [0.20, md(24, 52, 130)],
      [0.34, md(56, 96, 178)],
      [0.44, md(114, 156, 206)],
      [0.52, md(176, 200, 216)],
      [1.00, md(212, 216, 208)],
    ],
    fog: md(206, 208, 196),
    near: md(96, 122, 62),
    mid: md(80, 106, 56),
    far: md(104, 116, 88),
    ridge: md(146, 142, 134),
    verge: md(124, 132, 70),
    rock: md(150, 138, 118),
    tree: md(48, 86, 46),
    trunk: md(92, 72, 50),
    water: md(58, 98, 124),
  },
  /** The Hungaroring: a bowl of dry grass with the heat sitting in it. */
  puszta: {
    sky: [
      [0.20, md(40, 70, 138)],
      [0.34, md(86, 124, 180)],
      [0.44, md(146, 178, 204)],
      [0.52, md(202, 212, 208)],
      [1.00, md(226, 222, 200)],
    ],
    fog: md(220, 216, 196),
    near: md(122, 130, 68),
    mid: md(106, 116, 60),
    far: md(124, 124, 96),
    ridge: md(148, 144, 132),
    verge: md(146, 140, 78),
    rock: md(152, 140, 116),
    tree: md(58, 92, 48),
    trunk: md(96, 74, 50),
    water: md(60, 100, 124),
  },
  /** Shanghai: humid, hazy, and grey-blue rather than blue. Built on marsh. */
  delta: {
    sky: [
      [0.20, md(52, 74, 122)],
      [0.34, md(98, 124, 164)],
      [0.44, md(154, 176, 196)],
      [0.52, md(200, 210, 212)],
      [1.00, md(220, 222, 216)],
    ],
    fog: md(214, 218, 214),
    near: md(84, 116, 62),
    mid: md(70, 100, 56),
    far: md(96, 112, 96),
    ridge: md(136, 138, 138),
    verge: md(112, 128, 70),
    rock: md(140, 138, 132),
    tree: md(46, 84, 48),
    trunk: md(86, 68, 48),
    water: md(70, 100, 118),
  },
  /**
   * Catalunya: dry hillside, ochre under the grass, and a hard clean light. The
   * sky here is the deepest of any of the daytime themes because that part of
   * Spain in May genuinely is.
   */
  iberia: {
    sky: [
      [0.20, md(30, 62, 140)],
      [0.34, md(72, 114, 184)],
      [0.44, md(134, 172, 206)],
      [0.52, md(196, 210, 210)],
      [1.00, md(224, 218, 198)],
    ],
    fog: md(220, 212, 190),
    near: md(122, 126, 70),
    mid: md(112, 110, 62),
    far: md(134, 124, 96),
    ridge: md(154, 146, 132),
    verge: md(146, 136, 78),
    rock: md(164, 144, 114),
    tree: md(54, 84, 46),
    trunk: md(94, 72, 50),
    water: md(56, 98, 124),
  },
  /**
   * Yas Marina. Reclaimed sand beside the water, and like Bahrain it is always
   * run at dusk, so these daytime colours are a starting point that the
   * time-of-day pass immediately pulls towards sodium. The ground is paler than
   * Bahrain's - this is dredged sand rather than desert - and the water is the
   * point of the place.
   */
  marina: {
    sky: [
      [0.20, md(44, 68, 124)],
      [0.34, md(94, 122, 166)],
      [0.44, md(158, 176, 194)],
      [0.52, md(210, 202, 178)],
      [1.00, md(226, 212, 184)],
    ],
    fog: md(218, 208, 184),
    near: md(190, 176, 140),
    mid: md(176, 162, 128),
    far: md(160, 150, 128),
    ridge: md(158, 156, 152),
    verge: md(176, 166, 128),
    rock: md(168, 156, 130),
    tree: md(62, 96, 58),
    trunk: md(102, 84, 58),
    water: md(36, 92, 130),
  },
  /**
   * Monaco. Pale stone, a hard Mediterranean light and water that is the reason
   * anybody built there. The built colour matters more here than on any other
   * circuit in this game, because on this one almost everything you can see is
   * a building and every one of them was measured rather than invented.
   */
  riviera: {
    sky: [
      [0.20, md(26, 60, 142)],
      [0.34, md(68, 112, 186)],
      [0.44, md(132, 172, 208)],
      [0.52, md(196, 212, 214)],
      [1.00, md(226, 220, 202)],
    ],
    fog: md(220, 214, 198),
    near: md(120, 132, 78),
    mid: md(106, 116, 68),
    far: md(132, 128, 104),
    ridge: md(206, 196, 176),
    verge: md(140, 138, 84),
    rock: md(176, 164, 138),
    tree: md(52, 90, 50),
    trunk: md(94, 74, 50),
    water: md(30, 96, 142),
  },
  /**
   * The Las Vegas Strip, which is run at night and is the only circuit here
   * where that is the whole point rather than a detail. The ground is desert
   * under asphalt and the buildings do the work; what these colours mostly do is
   * give the time-of-day pass something dark and warm to pull towards.
   */
  strip: {
    sky: [
      [0.20, md(32, 40, 88)],
      [0.34, md(64, 78, 128)],
      [0.44, md(118, 132, 166)],
      [0.52, md(176, 176, 178)],
      [1.00, md(206, 194, 172)],
    ],
    fog: md(200, 188, 166),
    near: md(158, 146, 118),
    mid: md(144, 132, 108),
    far: md(138, 128, 110),
    ridge: md(178, 172, 164),
    verge: md(150, 142, 112),
    rock: md(160, 146, 120),
    tree: md(74, 96, 60),
    trunk: md(104, 86, 60),
    water: md(48, 88, 116),
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
