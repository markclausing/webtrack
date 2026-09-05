/**
 * The four circuits that exist.
 *
 * Everything else in this game is invented, and these are not: the line in
 * `line` is a survey, resampled to ten metres and stored in decimetres, and the
 * corner you turn into at Eau Rouge is the corner that is there. That is worth
 * the twenty kilobytes on its own - a made-up circuit can be good, but it cannot
 * be learned anywhere except here, and the first time somebody who knows Spa
 * comes over the crest at Raidillon and finds it in the right place, the whole
 * thing has paid for itself.
 *
 * What is not in the survey is everything else, and this file is mostly that.
 *
 * `climb` is by hand. The survey is flat - two coordinates and a width, no
 * height at all - and a flat Spa is not Spa, it is a diagram of Spa. So the
 * heights are written here as metres above the start line at fractions of a lap,
 * taken from what these places actually do: Eau Rouge twenty-nine metres below
 * the line and Les Combes sixty-seven above it, which is the hundred metre
 * spread the circuit is famous for. It is authored, and it is honest about being
 * authored, and it is much closer to the truth than nothing.
 *
 * `bank` is by hand for the same reason and matters at exactly one circuit.
 * Zandvoort's corners are dished - eighteen degrees at Hugenholtz and at the
 * last corner - and that is not decoration either: a banked corner is a corner
 * you take faster, so it changes the lap rather than the picture.
 *
 * `land`, `scatter` and `marks` are the invention, and they are invented towards
 * something. A circuit is recognisable from about four things, and for these
 * four they are: spruce, dunes, a park and a big wheel. So Spa is walled in
 * conifers with campervans in the clearings, Zandvoort runs through sand with
 * the North Sea and its turbines off one side, Monza is deciduous parkland with
 * the derelict banking of the old oval alongside the Serraglio, and Suzuka has
 * the ferris wheel and the crossover it is known for - the crossover being the
 * one piece of flair that is also load-bearing, because the circuit is a figure
 * of eight and the two roads have to miss each other.
 *
 * Positions are fractions of a lap rather than metres so that everything here
 * survives a change to SEG, and so that reading it against a track map is a
 * matter of one multiplication.
 */

/** Metres between stored points, before the spline. Set by tools/import-circuit.js. */
export const STORE = 10;

/**
 * What the surveyed widths are multiplied by, and the narrowest the road may be.
 *
 * The survey measures the tarmac off satellite imagery, and it measures it
 * honestly: the asphalt, not the asphalt plus the bit of kerb and paint a car
 * actually uses. It comes out around nine or ten metres across at Zandvoort
 * where the circuit is really twelve to fourteen, and against the fourteen the
 * drawn circuits have always been, that is the difference between a track you
 * race on and a corridor you queue in - eight cars, and no room to be alongside
 * anybody through a corner.
 *
 * So the whole set is scaled, which keeps what the survey is actually good for:
 * the differences. Monza stays the narrow one and Spa stays the wide one, and
 * the chicane at the Roggia stays tighter than the Kemmel straight.
 */
export const WIDEN = 1.32;
export const NARROWEST = 5.2;

/**
 * The surveyed centre lines, as base-36 decimetre deltas: x, z, half-width,
 * repeating. Generated - do not edit by hand. See docs/CIRCUITS.md for where
 * they came from and what that obliges us to say about it.
 */
const LINES = {
  monza: '-3 b 1m a 2r 0 9 2s 0 a 2r 0 a 2s 0 9 2s 0 a 2r 0 a 2s 0 a 2r 0 9 2s 0 a 2r 0 a 2s 0 a 2r 0 9 2s -1 a 2r 0 a 2s 0 a 2r 0 a 2s 0 9 2r 0 a 2s 0 a 2r 0 a 2s 0 a 2r 0 a 2s 0 b 2r 0 a 2s 0 a 2r 0 a 2s -1 a 2r 0 a 2s 0 a 2r 0 9 2s 0 a 2r 0 a 2s 0 a 2r 0 9 2s 0 a 2s 0 9 2r 0 a 2s 0 9 2r 0 a 2s -1 9 2r 0 9 2s 0 9 2s 0 9 2r -1 9 2s 0 9 2r 0 8 2s -1 9 2s 0 9 2r 0 9 2s -1 8 2r 0 9 2s -1 8 2s 0 9 2r -1 8 2s 0 9 2s 0 8 2r 0 9 2s -1 8 2s 0 9 2r 0 8 2s 0 8 2s 0 9 2r -1 8 2s 0 9 2s 0 8 2r 0 8 2s 0 9 2r -1 8 2s 0 9 2s 0 8 2r 0 8 2s 0 9 2s -1 8 2r 0 9 2s 0 9 2s 0 8 2r 0 9 2s -1 8 2s 0 9 2r 0 9 2s 0 8 2r 0 9 2s -1 8 2s 0 9 2r 0 8 2s 0 8 2s 0 9 2r -1 8 2s 0 8 2s 0 9 2r 0 8 2s 0 r 2n 1 2g 12 -2 2r -d 1 2r -4 0 2f 1a 1 1a 2f 1 -5 2r -2 -n 2p 0 -p 2p 1 -q 2p 0 -r 2o 0 -q 2p -1 -r 2o 0 -p 2p 0 -o 2p 0 -n 2p 0 -k 2q 1 -h 2r -1 -f 2r 0 -b 2r 1 -7 2s 0 -2 2s 0 0 2s 1 4 2s 0 6 2r 0 7 2s -1 8 2s 0 8 2s 0 8 2r 0 8 2s 0 7 2s 0 7 2r 0 7 2s 0 7 2s -1 7 2s 0 9 2r 0 b 2s 1 d 2r 0 f 2r 0 i 2q -1 l 2q 0 p 2p 0 u 2n 1 y 2m 0 12 2k 0 16 2j 0 18 2i -1 19 2h 1 1a 2h 0 1c 2g 1 1h 2d 0 1k 2a 0 1p 28 0 1r 25 1 1v 23 -1 1w 21 0 1z 1y 0 21 1w 0 24 1u 0 25 1s 0 27 1p 0 28 1o -1 2a 1l -1 2c 1j 0 2c 1h 1 2f 1e 0 2g 1c 0 2h 1a -1 2i 16 0 2k 14 0 2l 11 0 2m x 0 2n v 0 2o t 0 2o r 0 2p q 0 2p o 0 2p n 0 2q m 1 2q j 3 2r h 1 2q g -1 2r d -1 2s d -2 2r b -1 2s 9 1 2r 9 0 2s 9 0 2s 8 0 2r 8 0 2s 7 0 2s 8 0 2r 7 0 2s 8 0 2s 7 0 2s 8 0 2r 8 0 2s 8 0 2s 9 0 2r 8 0 2s 9 0 2r 8 0 2s 9 0 2s 8 0 2r 8 0 2s 8 0 2s 7 0 2s 7 0 2r 6 0 2s 6 3 2s 5 2 2s 4 3 2s 5 2 2s 4 2 2s 4 3 2s 4 2 2s 4 0 2s 4 -4 2r 4 -5 2s 6 -4 2s 6 -4 2q i -2 29 1j 0 19 2h 0 q 2o 0 u 2n 0 1o 26 1 2k y 0 2s b 0 2q g 1 2r k 0 2p n 0 2o q 0 2o s 0 2o t 0 2n v 0 2n v 0 2n w 0 2n w 0 2m x 0 2n w 0 2m x 0 2n x 0 2m w 0 2n w 0 2n v 0 2n w 1 2n v 0 2n v 0 2n w 1 2n v 0 2n v 1 2n w 0 2n w 0 2n v 1 2n u 0 2o t 1 2o q -4 2r g -1 2s 3 0 2r -b 0 2o -p 2 2l -13 -2 2e -1f 1 27 -1p 1 1z -1y -1 1p -26 -1 1d -2g -1 w -2m 0 j -2q 0 d -2r 0 d -2s 0 b -2r 0 a -2s 1 a -2r 0 9 -2s 0 8 -2r 0 9 -2s 0 9 -2s 0 9 -2r 0 9 -2s 0 a -2r 0 9 -2s 0 a -2r 0 a -2s 0 a -2r 0 9 -2s 0 9 -2s 0 9 -2r 0 9 -2s 0 9 -2r 0 9 -2s 0 a -2r 0 9 -2s 0 -5 -2s -1 -t -2n 0 -1h -2c 0 -21 -1w -1 -2d -1h -1 -2g -1b 0 -2g -1c 0 -2f -1d 0 -2f -1e 0 -2f -1d 1 -2f -1d 0 -2g -1d 0 -2f -1c 0 -2f -1d 0 -2f -1d 0 -2g -1d 0 -2f -1c 1 -2f -1d 0 -2g -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2g -1d 1 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2g -1c 0 -2f -1d 1 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2f -1d 0 -2f -1d 1 -2f -1e 0 -2e -1f 0 -2d -1g -1 -2d -1h -2 -2c -1i -2 -2b -1k -1 -2b -1l -1 -29 -1m 0 -27 -1p 1 -27 -1q 1 -25 -1r 1 -25 -1s -1 -24 -1t -1 -23 -1u -1 -23 -1v -1 -22 -1u 0 -23 -1v 0 -22 -1v 0 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1t 0 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1u 1 -23 -1u 0 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 1 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -24 -1u 1 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 1 -23 -1u 0 -23 -1u 0 -23 -1u 0 -24 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -24 -1u 1 -23 -1t 0 -23 -1u 0 -23 -1u 0 -23 -1u 0 -23 -1v 0 -21 -1w 0 -1r -25 0 -t -2n 0 1 -2s 0 d -2r 0 d -2r 0 9 -2r 1 5 -2s 0 -2 -2s 0 -b -2s -2 -k -2q 1 -t -2n 2 -12 -2l -1 -1a -2h 0 -1h -2c 0 -1p -27 1 -1w -21 1 -24 -1u 1 -28 -1o 1 -28 -1n 0 -1z -1y -1 -18 -2h 1 -m -2q 4 -g -2q 5 -f -2r 0 -d -2r 0 -d -2s -1 -d -2r 0 -b -2r -1 -c -2r 0 -c -2s -1 -b -2r 0 -c -2r -1 -b -2s -1 -c -2r 0 -c -2r -1 -c -2s 0 -d -2r -1 -b -2r 0 -c -2r -1 -c -2s 0 -c -2r -1 -b -2r 0 -b -2s -1 -b -2r 0 -b -2s 0 -a -2r 0 -b -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -9 -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -9 -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -b -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -9 -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -a -2s 0 -a -2r 0 -9 -2s 0 -a -2r 0 -b -2s 0 -b -2r 0 -b -2s 0 -e -2r 1 -j -2q 1 -x -2m 2 -1b -2g 1 -1n -29 0 -1v -22 1 -24 -1t -1 -2b -1k 0 -2g -1c 1 -2k -12 0 -2o -r 0 -2r -e 0 -2s 2 0 -2r e 0 -2p n 1 -2n x 0 -2k 13 -1 -2g 1a 0 -2e 1f 0 -2a 1l 0 -27 1q 0 -23 1u 0 -1y 1z 0 -1v 23 0 -1q 27 0 -1l 29 -1 -1i 2d 0 -1d 2f -1 -18 2h 1 -15 2k 0 -11 2l 0 -w 2m 0 -t 2o 0 -p 2p 0 -l 2q 0 -j 2q 0 -f 2r 0 -c 2r 0 -a 2s 0 -8 2r 0 -6 2s 0 -5 2s 0 -2 2s 0 -2 2s 1 -1 2s 0 0 2s 1 0 2s 0 0 2s 1 -1 2s 1 0 2s 0 -2 2s 1 -2 2s 1 -2 2s 0 -2 2s -1 -1 2s -1 -1 2s 0 0 2s -1 0 2s -1 2 2s 1 1 2s 0 3 2s 0 3 2s 0 5 2s 1 6 2r 0 8 2s 0 9 2s 1 9 2r 1',
  spa: '-2 l 1w -1i 2c 0 -1h 2d 0 -1h 2d 0 -1h 2c 0 -1h 2d 0 -1h 2d 0 -1h 2d 0 -1h 2d 0 -1h 2c 0 -1h 2d 0 -1h 2d 0 -1h 2d 0 -1h 2d 0 -1h 2c 0 -1h 2d 0 -1h 2d 0 -1h 2d 0 -1h 2c 0 -1i 2d 0 -1h 2d 1 -1h 2c 0 -1h 2d 0 -1i 2d 0 -1h 2c 0 -1h 2d 0 -1h 2d 0 -1i 2c 0 -1h 2d 0 -1h 2d 0 -1h 2c 0 -1h 2d 1 -1h 2d 0 -1g 2d -1 -1g 2e 0 -1h 2d 0 -1i 2c 0 -1e 2e 0 -r 2o 0 l 2o -3 1m 2a 4 2j p a 2o -u 2 2k -14 0 2i -16 0 2j -15 0 2k -14 -1 2k -14 0 2k -13 0 2j -14 0 2k -14 0 2k -14 0 2j -15 -2 2i -17 -5 2i -17 -4 2i -19 -5 2h -1a -3 2g -1a -3 2g -1d -1 2f -1d -1 2e -1f -1 2d -1g 0 2d -1h -1 2b -1j -1 2b -1l -2 2a -1l -1 29 -1m -2 28 -1o -3 28 -1o 1 28 -1o 3 27 -1p 1 27 -1q -1 24 -1s -2 22 -1w -1 20 -1y 0 1y -1z 1 1x -20 0 1x -21 0 1w -21 0 1v -22 0 1w -22 0 1v -21 0 1w -22 0 1w -22 0 1w -21 0 1v -22 0 1w -22 0 1v -21 0 1w -22 0 1v -22 0 1w -22 0 1v -22 0 1v -22 0 1w -22 0 1v -22 0 1v -22 0 1w -21 0 1v -22 0 1w -22 0 1v -22 0 1w -22 1 1v -21 0 1w -22 -1 1x -20 0 1y -20 0 20 -1x -3 26 -1q -3 2d -1i 2 2h -18 1 2i -18 1 2f -1d 0 2e -1g -1 2d -1g 0 29 -1n 0 21 -1v 0 1v -23 0 1o -28 1 1i -2c 0 1d -2f 0 18 -2i -1 12 -2k 0 x -2n -1 s -2o -1 n -2p 0 i -2q 0 h -2r 0 h -2r 2 k -2p -2 s -2p -2 10 -2l 0 19 -2h 2 1f -2e 0 1j -2b 0 1l -2b -1 1m -29 0 1l -2a 0 1m -2a 0 1l -2a 0 1l -2a 0 1l -2a 0 1l -2a 0 1l -2a 1 1m -2a 0 1l -2a 0 1l -2a 0 1l -2a 0 1m -2a 0 1l -2a 1 1l -2a 0 1m -2a 0 1l -2a 0 1l -2a 0 1m -2a 0 1l -2a 0 1k -2a 0 1l -2b -1 1k -2b 0 1j -2b 1 1h -2d 0 1e -2e 0 1c -2g 1 18 -2i 0 15 -2j 0 13 -2k 0 10 -2m 0 y -2m 0 w -2m 0 w -2n 0 w -2n 1 w -2n 0 v -2n 0 v -2n 0 w -2n 1 v -2n 0 v -2n 0 w -2n 0 v -2n 1 v -2m 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2m 0 v -2n 0 v -2n 1 w -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2m 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2n 0 v -2m 0 w -2n 0 u -2o -1 o -2p 1 e -2r 1 -3 -2r 1 -o -2p 0 -1e -2e -2 -1v -22 -3 -26 -1r -1 -2e -1f -1 -2a -1k 0 -1w -21 0 -1h -2d 0 -12 -2k 0 -l -2q -1 -1 -2r 0 l -2q 0 s -2o 0 s -2o 0 s -2o 0 s -2o 1 s -2o 0 t -2o 0 u -2n 1 r -2o 0 l -2q 0 c -2r 0 -1 -2s -1 -h -2q 0 -z -2m -1 -1h -2d -1 -1y -1z 3 -26 -1p 1 -29 -1o 0 -28 -1n 0 -28 -1o 0 -28 -1o 0 -28 -1o 0 -28 -1p 0 -28 -1o 0 -27 -1p 0 -28 -1o 0 -27 -1p -1 -28 -1p 0 -27 -1o 0 -28 -1p 0 -28 -1o 0 -27 -1p 0 -28 -1o 0 -28 -1o 0 -27 -1p 0 -28 -1o 0 -28 -1o 0 -27 -1p 0 -28 -1p 0 -27 -1o 0 -28 -1p 0 -27 -1p 0 -28 -1o 0 -28 -1o 0 -28 -1o 0 -2a -1m 0 -2f -1d 0 -2o -q 0 -2r 2 0 -2r i 0 -2n t 0 -2g 1b -1 -26 1r 0 -1r 25 0 -1a 2g 0 -q 2p 0 -5 2r 0 g 2r 0 10 2l 0 1i 2c 0 1v 22 0 24 1s 1 2b 1l -1 2d 1g 0 2e 1g 0 2d 1g 1 2c 1h 0 2c 1i 0 2c 1k 0 2b 1j 0 2b 1k 0 2a 1l 0 2b 1k 0 28 1o -1 20 1x 1 1m 29 0 15 2j 0 m 2p 0 1 2s 1 -g 2r -1 -r 2o 0 -x 2m 0 -11 2l 1 -11 2l 1 -11 2l 2 -10 2m 1 -10 2l 1 -z 2l 1 -10 2m 1 -10 2l 1 -z 2m 1 -10 2l 1 -y 2m 0 -x 2m 1 -w 2n 0 -u 2n 0 -t 2o -1 -s 2o 0 -q 2p -3 -p 2p -3 -o 2p -3 -n 2p -3 -m 2q 0 -m 2p 0 -m 2q 0 -m 2p 0 -l 2q 0 -m 2q 1 -m 2p 0 -m 2q 0 -m 2p 0 -l 2q 0 -m 2q 0 -m 2p 0 -m 2q 0 -m 2p 0 -l 2q 0 -m 2q 0 -l 2p 0 -l 2q 0 -l 2q 0 -k 2q -1 -j 2q 0 -m 2q 0 -p 2o -1 -u 2o 1 -11 2k 0 -1a 2h 0 -1i 2c 1 -1q 27 0 -1z 1z 0 -25 1r 0 -2c 1i 0 -2h 19 -1 -2k 13 0 -2o t 0 -2r e 0 -2s 5 0 -2s 3 0 -2r 5 -1 -2s 5 0 -2s 3 0 -2s 0 0 -2s -3 1 -2s -9 -1 -2r -f 0 -2p -l 0 -2p -r 0 -2l -z 0 -2j -16 0 -2f -1d 1 -2c -1i 0 -29 -1o 0 -24 -1s 1 -21 -1x 0 -1v -21 -1 -1r -26 0 -1l -2a 0 -1h -2d 0 -1a -2h -1 -16 -2j 1 -11 -2k 0 -y -2m 0 -x -2n 0 -v -2n 0 -w -2n 0 -x -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2n 0 -x -2m 0 -x -2m 0 -x -2m 0 -y -2n 0 -y -2m 0 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 0 -y -2m 0 -x -2n 0 -y -2m 1 -x -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -w -2n -1 -y -2m 0 -12 -2l -1 -1a -2g -2 -1k -2b -1 -1t -24 0 -23 -1u 0 -2b -1j 0 -2i -17 -1 -2o -s 1 -2r -f 1 -2s 0 -1 -2q h 0 -2n u 1 -2m y 2 -2k 14 2 -2g 1b 0 -2e 1g 0 -2f 1c 0 -2m y -1 -2q l 0 -2r 8 0 -2s -2 0 -2q -j -1 -2m -y 0 -2h -19 0 -2b -1k 1 -23 -1u 0 -1t -24 1 -1j -2b -1 -1f -2f 0 -1d -2e 0 -1d -2g 1 -1c -2f 0 -1d -2g 0 -1d -2f 0 -1e -2e 0 -1e -2f 0 -1f -2e 1 -1f -2e 1 -1f -2e 0 -1g -2e -1 -1f -2d -1 -1f -2e -1 -1e -2f 0 -1e -2e 0 -1e -2f 0 -1e -2f 0 -1i -2c 0 -1o -28 1 -21 -1w 0 -2e -1d 1 -2o -u -1 -2r -6 0 -2r c 0 -2p q -1 -2g 1b 0 -2b 1k 0 -2b 1k 0 -2c 1i 0 -2c 1i 0 -2c 1j 0 -2b 1i 0 -2c 1k 0 -2b 1j 0 -2c 1i 0 -2e 1g 1 -2c 1i 0 -2a 1l 1 -25 1s 0 -1z 1y 0 -1p 27 0 -1h 2d -1 -19 2h 0 -11 2l 0 -t 2o -1 -j 2q 0 -9 2r 0 3 2s 0 f 2r -1 o 2p 0 t 2o 0 u 2n 1 v 2n 0 v 2n 0 w 2n 1 x 2m 0 10 2m 0 11 2k 1 14 2k -1 17 2i 0 19 2h -1 1d 2g 0 1e 2e 1 1h 2d -1 1k 2b -1 1l 2a 0 1n 29 0 1p 27 0 1r 26 0 1s 25 0 1u 23 0 1u 23 1 1w 22 0 1w 21 1 1v 22 1 1w 21 0 1v 22 0 1w 22 1 1w 21 0 1x 20 0 1z 1z 0 21 1w 0 23 1u 0 25 1s 0 27 1p -1 29 1n 0 2b 1l 1 2c 1i 0 2d 1g 0 2e 1f 0 2f 1d 0 2f 1d 0 2f 1d 0 2f 1d 0 2f 1e 0 2f 1d 0 2f 1e 1 2e 1f 1 2e 1f 0 2f 1e 1 2e 1f 0 2e 1e 1 2g 1d 1 2g 1b -1 2g 1c -2 2g 1b -1 2f 1e -1 2d 1f 0 2c 1j 0 29 1m 1 27 1p 0 25 1s 0 23 1v 0 20 1x 0 1z 1z 0 1w 21 0 1u 23 0 1r 25 0 1p 27 -1 1n 2a -1 1j 2b 0 1f 2e 1 1b 2g 1 18 2i 0 15 2j -1 13 2k 0 13 2l -1 11 2k 0 11 2l 0 11 2l 0 12 2l 1 11 2l 0 12 2k 0 11 2l 0 12 2l 0 11 2k 0 11 2l 0 12 2l 0 12 2k 0 11 2l 0 z 2m -1 s 2o 0 l 2q 0 f 2q 0 9 2s 0 3 2s 0 -6 2s 0 -g 2q 0 -n 2q 0 -u 2n 1 -y 2m 0 -11 2l 0 -12 2l 0 -12 2k 0 -13 2k 0 -14 2k 0 -13 2k 0 -14 2k 0 -13 2j 0 -14 2k 0 -13 2k 0 -13 2k 0 -13 2l 0 -13 2k 0 -13 2k 0 -13 2k 0 -13 2k 0 -13 2k 0 -13 2k 0 -13 2k 0 -13 2k 0 -11 2l 1 -10 2l 1 -x 2n 1 -u 2n 1 -s 2o 2 -q 2p 1 -n 2p 1 -l 2q 0 -k 2q 0 -h 2q 0 -g 2r 0 -f 2r 0 -e 2r 0 -d 2r 0 -d 2r -1 -c 2r 0 -b 2s 0 -c 2r 0 -c 2r 0 -c 2s 0 -c 2r 0 -c 2r 0 -d 2r 0 -c 2s 0 -c 2r 0 -c 2r 0 -c 2r 0 -d 2s -1 -2 2r 0 10 2k 1 2f 18 1 2s 2 1 2r -8 -3 2r -h -2 2l t 2 1p 26 1 n 2o 1 -12 2j 1 -1k 2b 6 -1j 2c 1 -1i 2c 0 -1h 2d 0 -1i 2c 1 -1h 2d 0 -1i 2c 0 -1h 2d 1 -1i 2c 0 -1i 2c 0 -1h 2d 1 -1i 2c 0 -1i 2d 0 -1h 2c 1 -1i 2d 0 -1h 2c 0',
  suzuka: 'v 1 21 1u -23 0 1t -24 0 1t -24 0 1u -23 0 1t -25 0 1t -24 0 1s -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1u -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -25 0 1t -24 0 1t -24 0 1t -24 0 1t -24 0 1t -24 1 1s -24 0 1t -24 0 1t -24 0 1t -24 0 1t -25 0 1t -24 0 1t -24 0 1t -24 0 1s -24 -1 1t -25 0 1t -24 -1 1t -24 -1 1s -25 0 1t -24 -1 1t -24 -1 1s -25 0 1t -24 -1 1t -24 -1 1s -25 0 1t -24 -1 1s -25 -1 1t -24 0 1s -25 -1 1t -24 -1 1s -25 0 1s -24 -1 1t -25 -1 1s -25 0 1t -24 -1 1s -25 -1 1t -24 0 1t -24 -1 1t -24 -1 1t -24 0 1u -23 -1 1t -24 -1 1u -24 -1 1r -25 -2 1n -29 -3 1i -2c -2 1b -2g -1 12 -2l 0 r -2o 0 g -2r 0 1 -2s 1 -c -2r -1 -l -2q 0 -s -2o 1 -t -2o 0 -s -2o 0 -u -2n -1 -10 -2m 0 -1a -2g 0 -1p -28 2 -21 -1v 1 -2c -1i 1 -2k -14 -1 -2p -p 1 -2r -9 0 -2s 7 -1 -2p o 0 -2j 15 0 -29 1n -1 -1x 20 0 -1o 28 -1 -1k 2b -1 -1h 2d -1 -1h 2d 0 -1j 2b 0 -1k 2b 0 -1k 2b 0 -1k 2b 1 -1k 2b 0 -1j 2b 0 -1k 2c 0 -1j 2b 0 -1i 2c 0 -1j 2c 0 -1l 2a 0 -1n 29 0 -1q 26 1 -1w 22 -1 -23 1u 0 -2b 1j 1 -2j 17 -1 -2n u 0 -2q i 1 -2s 9 -1 -2s 4 0 -2s 1 0 -2s 3 0 -2r c 0 -2p p 0 -2k 13 0 -2d 1g 0 -24 1t -1 -1v 23 0 -1i 2c -1 -14 2j 0 -t 2o 1 -q 2p 0 -t 2n 1 -u 2o 0 -r 2o 0 -r 2o 0 -t 2o 0 -z 2m 1 -18 2i 0 -1j 2b -1 -1s 25 0 -1z 1y 0 -26 1r -1 -2d 1g 1 -2k 15 0 -2n t 0 -2q k 0 -2s a 0 -2s 3 0 -2s -1 0 -2s -1 -1 -2s 2 0 -2s 6 1 -2q h 1 -2n w 0 -2j 15 0 -2e 1e -1 -28 1o 1 -21 1x 0 -1t 24 -1 -1j 2c 0 -18 2h 0 -x 2n -1 -l 2p 1 -7 2s 0 7 2s -1 m 2p 0 v 2o 1 x 2m 0 x 2m 0 x 2n 0 x 2m 0 x 2n 0 w 2n 0 p 2o 0 e 2r 1 1 2s 0 -c 2r -1 -o 2q 1 -10 2l 0 -1a 2h 0 -1k 2a 0 -1u 23 0 -23 1u -1 -2b 1l 0 -2e 1e 1 -2h 1a 0 -2i 17 0 -2k 15 -1 -2l 11 -1 -2l 11 0 -2l z 0 -2n v -1 -2q o 2 -2q g 0 -2s 9 -1 -2s 6 0 -2s 2 0 -2s -1 0 -2s -3 -1 -2s -7 0 -2r -c 0 -2r -h 0 -2p -p 0 -2m -y 0 -2j -15 0 -2i -16 1 -2k -15 0 -2j -15 0 -2h -19 0 -2f -1e 0 -2b -1j 0 -28 -1o 0 -24 -1t 0 -21 -1x 0 -1y -1z -1 -1w -22 -2 -1t -24 -1 -1s -25 0 -1r -25 0 -1r -26 0 -1r -26 0 -1r -26 0 -1q -26 0 -1r -26 0 -1q -27 0 -1q -26 0 -1r -26 0 -1q -26 1 -1r -26 0 -1r -26 0 -1s -25 0 -1x -20 4 -2b -1i 3 -2p -n 1 -2s -9 0 -2r -8 -1 -2s -a 0 -2r -a 0 -2s -a 0 -2r -a 0 -2s -a 0 -2s -9 0 -2r -9 0 -2s -a 0 -2r -b 0 -2s -a 0 -2s 0 4 -2p m 5 -25 1p -6 -15 2j -5 -o 2p -2 -l 2q 0 -l 2p 0 -m 2q 0 -m 2p 0 -m 2q -1 -m 2q 0 -l 2p -1 -l 2q 0 -l 2q -1 -l 2q 0 -l 2q 0 -k 2q 0 -l 2q 0 -k 2q 0 -k 2q 0 -l 2q -1 -k 2q 0 -l 2p 0 -k 2q 0 -l 2q 0 -l 2q 0 -l 2q 0 -m 2q -1 -l 2p 0 -k 2q 0 -i 2r -1 -f 2r 0 -a 2r 1 -3 2s 0 a 2s 1 m 2p 0 t 2o 0 y 2m 1 10 2l 1 14 2k 2 14 2k 1 13 2k 1 12 2k 1 15 2k 1 15 2j 1 u 2n 3 4 2r 4 -z 2k 5 -25 1q 4 -2p d 3 -2m -v 0 -26 -1q -1 -1q -26 1 -1f -2e -4 -19 -2h -4 -19 -2h -4 -1c -2g -3 -1g -2e -4 -1h -2c -2 -1j -2c -2 -1j -2c -1 -1j -2b -2 -1i -2d 0 -1g -2d 0 -1g -2e 1 -1h -2c 0 -1m -2a 0 -1r -26 0 -1t -24 0 -1v -22 0 -1z -1z 0 -22 -1v -1 -27 -1p 0 -2a -1l 0 -2e -1f 1 -2g -1c 1 -2k -14 2 -2n -v 2 -2p -l 1 -2s -b 0 -2r -c 1 -2s -b 1 -2r -8 1 -2s -5 -1 -2s -2 -1 -2s 2 0 -2s 5 0 -2s 9 1 -2r b 0 -2r f -1 -2r h 0 -2q j -1 -2q n 0 -2o p 0 -2o s 0 -2o u 0 -2n w 0 -2n w 0 -2n u -2 -2m x -1 -2m 10 -1 -2k 13 -1 -2i 18 -1 -2g 1a -1 -2f 1e -1 -2e 1g 1 -2b 1j 0 -2a 1m 1 -27 1o 1 -25 1t 1 -22 1v 0 -20 1y 0 -1w 21 0 -1t 24 0 -1r 26 0 -1n 29 0 -1j 2b 0 -1g 2d 0 -1d 2g 0 -19 2h -1 -17 2i 0 -16 2j 0 -15 2k 0 -15 2j 0 -15 2j 0 -15 2j 1 -16 2j 0 -15 2j 0 -16 2j -1 -15 2j 0 -16 2j 0 -15 2j 0 -15 2k -1 -16 2j 0 -1a 2g 0 -1n 29 1 -1z 1x 0 -29 1n 0 -2g 1c 0 -2l 10 0 -2q m 0 -2r a 0 -2s 0 0 -2s -7 0 -2r -b 0 -2r -g 0 -2q -l 1 -2o -r -1 -2n -w 0 -2k -14 0 -2f -1c 1 -25 -1s 3 -1n -29 1 -1a -2g 2 -z -2m 1 -j -2q 0 -4 -2s -1 b -2r -2 n -2p -1 z -2m 0 1a -2h -1 1i -2c -2 1p -27 1 1v -22 0 1z -1z -1 23 -1u -1 25 -1t -2 25 -1r 0 26 -1r -1 26 -1r 0 26 -1q 0 27 -1q 0 28 -1o 0 29 -1m 0 2a -1l 0 2b -1k 0 2c -1j 3 2b -1j 2 2d -1i -1 2c -1i -1 2d -1h 0 2d -1h -1 2d -1g -1 2e -1f 0 2e -1f 0 2f -1e -1 2f -1d 0 2g -1c 0 2g -1c 0 2h -1a 0 2h -19 0 2i -18 0 2i -17 1 2j -15 2 2j -16 1 2k -14 -2 2j -15 0 2k -14 -1 2k -14 -1 2j -14 1 2k -13 0 2l -12 1 2m -z 0 2m -w 0 2o -v -1 2n -v 0 2n -v -1 2n -v 0 2n -u 0 2n -v 0 2o -v 0 2n -v 1 2n -v 0 2n -v 0 2n -w 0 2n -v 1 2n -w 0 2n -w 0 2m -w -1 2n -x 0 2n -w 0 2m -x 0 2n -x 0 2m -x 0 2n -x -1 2m -x 0 2n -w 0 2m -x 0 2n -w 0 2n -x 0 2m -w 0 2n -w 0 2n -w 0 2m -x 0 2n -w 1 2n -x 0 2m -w 0 2n -x 0 2m -x 0 2n -x 0 2m -w 1 2n -x 0 2n -w 0 2n -v 0 2n -v 0 2n -u 0 2o -v -1 2n -t 0 2o -v -1 2n -u 0 2n -t -1 2p -p 1 2r -g 2 2s -4 0 2s 8 1 2q k 0 2o r 0 2n v 0 2n x 1 2m w 0 2m y 0 2k 13 0 2j 16 0 2j 17 0 2h 18 0 2f 1e -1 2b 1k 0 2a 1m 1 2a 1l 0 2a 1l -1 26 1q 0 24 1t 1 23 1v 0 22 1v 0 21 1x 0 21 1w 0 20 1x 0 21 1x 0 20 1y 0 20 1x 0 20 1x 0 20 1x -1 21 1x 0 21 1x 0 20 1x 0 21 1x 0 20 1x 0 20 1x 0 21 1x 0 23 1u 1 24 1t 0 26 1q -1 26 1r -1 27 1q 0 2e 1e -1 2q 9 0 2l -10 3 28 -1o 0 21 -1x 0 26 -1p 0 2l -z -1 2r b 1 2e 1e 0 22 1v 0 21 1x 0 24 1t 0 27 1p 1 2c 1i 0 2h 1b 0 2k 11 1 2o s 5 2r i 7 2s 6 1 2s -6 -1 2r -e -1 2q -g -1 2r -h -8 2q -j -2 2p -o -1 2n -v 2 2k -14 2 2h -1a 3 2f -1e 3 2d -1h 4 2a -1k 5 29 -1n 4 27 -1q 2 24 -1t 3 21 -1v 1 20 -1z 1 1x -20 -1 1w -21 0 1w -22 -1 1v -22 0 1v -22 -1 1u -23 0',
  zandvoort: '-h -j 1g 11 2l 0 11 2l 1 10 2l 0 11 2l 1 11 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 11 2l 1 10 2l 0 11 2l 1 11 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 11 2l 1 10 2l 0 11 2l 1 10 2k 0 11 2l 1 11 2l 0 10 2l 0 11 2l 1 11 2l 0 10 2l 1 11 2l 0 11 2l 1 10 2l 0 12 2l 0 1a 2g -4 1x 20 -4 2h 19 1 2q e -1 2s -3 0 2r -g 0 2i -16 1 24 -1t 0 1p -27 -1 10 -2l -3 8 -2r 0 -h -2r -2 -w -2m -2 -z -2m -1 -z -2l -1 -z -2m -1 -z -2l -1 -z -2m -1 -10 -2l -1 -z -2m -1 -11 -2l -1 -10 -2l -1 -z -2l -1 -x -2n -1 -v -2n 0 -r -2o 1 -n -2p 0 -j -2q -1 -d -2r 1 -9 -2s -1 -4 -2s 1 -1 -2s 0 2 -2r -1 4 -2s 0 1 -2s 0 -7 -2s 0 -l -2p 1 -12 -2l 2 -1i -2c 2 -1x -20 -3 -29 -1l -1 -2i -18 0 -2l -11 0 -2l -11 0 -2l -10 -1 -2l -10 0 -2m -x 0 -2o -v 0 -2m -v 1 -2k -13 1 -2e -1f 2 -1y -1z -2 -14 -2j 1 -c -2r 3 e -2r 1 13 -2j -2 1p -27 0 28 -1o -1 2j -14 1 2r -9 -1 2q j -3 2o t 0 2l z 0 2l 11 0 2m z 0 2m y 0 2m x -1 2n x 0 2m w 0 2n w 0 2n u 0 2o t 0 2o q -1 2p o 1 2q m 0 2q j 1 2q g 1 2r f 1 2s b 3 2r 8 1 2s 4 1 2s 0 0 2s -5 -2 2r -b -1 2q -h -3 2q -k -2 2q -m -1 2p -m 0 2q -k 1 2q -k 0 2q -i 0 2r -g -1 2r -f 0 2r -e 1 2r -d 0 2r -7 1 2s 0 0 2r b -1 2q k 0 2q m 0 2o q 0 2l 11 0 2i 17 -1 2g 1b 0 2f 1e 1 2e 1f 0 2c 1i -1 2b 1k 0 2a 1l -1 2a 1l 0 2c 1i 1 2f 1d 0 2h 18 -1 2k 13 0 2n x 2 2o s 2 2p n 0 2q j -1 2r e -1 2s 7 1 2r -1 0 2s -5 -1 2s -5 0 2s -6 0 2s -7 2 2r -6 1 2s -5 2 2s -4 1 2s -2 -2 2s -2 -1 2s -3 -2 2r -4 0 2s -9 0 2r -g 0 2o -o -1 2m -y 0 2j -17 -1 2d -1f 1 28 -1o 0 22 -1v 0 1v -22 0 1n -29 -1 1d -2f 2 15 -2j -2 v -2n -1 l -2q 1 b -2r 1 1 -2s 0 -a -2r 0 -j -2q 0 -t -2o 0 -11 -2l 0 -19 -2h -1 -1e -2e -1 -1h -2d 0 -1j -2c 0 -1k -2b 0 -1k -2a 1 -1k -2b 0 -1k -2a 0 -1k -2b -1 -1j -2c 0 -1h -2d 1 -1e -2e 1 -1b -2g 4 -17 -2i 5 -15 -2j 7 -14 -2k 7 -15 -2j 4 -16 -2j 1 -17 -2i 0 -17 -2i 0 -17 -2j -1 -15 -2j -1 -1c -2f 1 -1y -1z -1 -2g -1b 0 -2n -s 1 -2r -d 1 -2s -1 0 -2s 5 0 -2s 8 0 -2r 8 1 -2s a -1 -2r e 0 -2p m 0 -2o s 0 -2m y 0 -2j 14 0 -2i 18 0 -2g 1c 0 -2d 1g 0 -2b 1j 0 -2a 1n 0 -26 1p 1 -25 1s 0 -1x 20 0 -1i 2c -1 -t 2n -1 3 2s 1 15 2i -1 1x 20 0 25 1r 1 2b 1k -1 2f 1c 1 2k 15 0 2n u 0 2q j 0 2r c -1 2r e 0 2q i -1 2q m 0 2p o 1 2o r 0 2n v 0 2n w 0 2l 11 0 2j 15 0 2g 1a -1 2b 1k 1 1z 1y 0 1i 2c 0 12 2k 1 l 2q -1 2 2s 1 -k 2p 0 -14 2k -1 -1p 27 1 -27 1o 1 -2h 19 -1 -2o s 0 -2r c 0 -2s 7 0 -2r 7 -2 -2s 8 -2 -2s 8 -2 -2r 7 -2 -2s 7 -3 -2s 6 -2 -2r 4 -1 -2s 3 0 -2s 0 0 -2s -2 0 -2s -5 5 -2s -7 6 -2r -9 -3 -2r -a -4 -2s -c -3 -2r -d 1 -2r -d 4 -2r -d 2 -2r -e -2 -2r -f -3 -2q -g -4 -2q -i -1 -2q -k 0 -2q -m 0 -2p -p 1 -2o -q 0 -2o -u 0 -2n -t 0 -2p -p 0 -2p -n 0 -2n -u 0 -2m -y 5 -2m -10 b -2l -z -1 -2m -z -4 -2l -y -4 -2m -10 -4 -2l -11 1 -2k -12 3 -2k -13 2 -2j -15 2 -2j -17 2 -2h -18 2 -2h -19 4 -2h -1a 6 -2g -1c -2 -2f -1c -3 -2e -1f -3 -2d -1h -4 -2k -11 -2 -2l u 2 -1r 25 2 -1a 2h -1 -1g 2d -2 -1y 1z -9 -2e 1e -2 -2q l -1 -2r -a -5 -2n -w -3 -2d -1f -1 -1t -24 0 -11 -2k 1 -5 -2s -1 b -2r 2 h -2q 0 j -2q 0 l -2q -1 j -2q 0 j -2q 0 i -2r 0 j -2q 0 j -2q 0 j -2q 0 j -2q 0 k -2q 0 j -2q 0 j -2q 0 j -2q 0 i -2q 0 j -2r 0 j -2q -1 j -2q 0 j -2q 0 k -2q 0 k -2q 0 j -2q 0 i -2q 0 f -2r 1 9 -2r 0 -7 -2s -1 -q -2o 1 -17 -2i -1 -1j -2c 2 -1x -20 0 -2b -1j 1 -2l -10 -2 -2q -k 1 -2r -b 0 -2s -6 0 -2r -5 0 -2s -4 0 -2s -5 -1 -2s -5 0 -2s -3 0 -2s 0 0 -2r 4 0 -2s a 0 -2q h 0 -2p n 0 -2o v 0 -2k 12 0 -2h 18 0 -2e 1f 0 -2a 1m -1 -25 1r 0 -21 1x 1 -1v 22 -1 -1p 27 0 -1j 2b 1 -1d 2f 0 -16 2j 0 -y 2m 0 -s 2o 1 -k 2q 0 -c 2r -2 -5 2s 1 2 2r 0 9 2s -1 f 2r 0 l 2p -1 r 2p 1 v 2n 2 z 2l 0 10 2l -1 11 2l 0 10 2l 0 10 2m 0 z 2l 0 10 2l 0 10 2m -1 z 2l 0 10 2l 0 10 2m 0 10 2l 0 z 2l 0 10 2l -1 11 2m 0 10 2l 0 10 2l 0 10 2l 0 10 2l 0 11 2l 1 10 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 10 2l 1 11 2l 0 11 2l 1 10 2l 0 11 2l 1 11 2l 0',
  silverstone: 'y -5 1t 1n 29 0 1n 29 1 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1n 29 0 1m 29 0 1m 29 1 1n 29 0 1m 2a 0 1l 29 0 1m 2a 0 1m 29 1 1n 29 -1 1m 2a -1 1q 25 1 2a 1m 3 2l 10 -1 2o s 0 2p o 0 2r e 1 2r 6 1 2s -1 0 2s -4 -1 2s -4 0 2s -2 0 2s -2 0 2s -2 0 2s -3 -1 2s -7 0 2r -8 0 2s -a 0 2r -a 0 2s -9 0 2r -6 0 2s -1 0 2s 6 0 2r e 1 2r h -1 2p k -1 2p r 1 2k 11 0 2h 1a 1 2e 1f 0 2b 1k 0 29 1n 0 27 1p 0 25 1r 0 26 1r 1 24 1t 0 24 1s 1 24 1u 0 23 1t 1 24 1u 0 23 1t 1 24 1u 0 23 1t 1 25 1t 0 24 1s 0 24 1t 1 24 1t 0 22 1v 1 24 1t 0 28 1o 0 2f 1c 0 2q k 0 2o -o 0 29 -1m 0 1l -2a 1 10 -2l -1 w -2n 0 w -2m -1 w -2n 0 v -2n 0 w -2n 0 v -2n 0 w -2m 0 w -2n -1 11 -2l -2 1i -2c -5 26 -1p 3 2q 0 -2 2c 1g 3 21 1y 0 1p 26 -2 19 2h 1 10 2m 0 y 2m -1 w 2m 0 u 2o -1 r 2o 0 o 2p 0 l 2q 0 i 2q -1 f 2r 1 b 2r 0 9 2s -1 5 2r 0 3 2s 0 -3 2s -1 -d 2r -1 -u 2n 1 -1o 28 1 -1x 21 0 -20 1x -1 -22 1u 1 -24 1u 1 -24 1s 0 -24 1t 1 -24 1t 0 -24 1u 1 -23 1t 0 -24 1t 1 -24 1t 1 -24 1t 0 -24 1u 1 -23 1t 0 -24 1t 1 -24 1t 0 -24 1t 1 -24 1t 1 -23 1t 0 -24 1t 1 -24 1t 0 -24 1u 1 -24 1t 0 -24 1t 1 -23 1t 1 -24 1t 0 -24 1t 1 -24 1t 0 -24 1u 1 -23 1t 0 -24 1t 1 -24 1t 1 -24 1t 0 -23 1u 1 -24 1t 0 -24 1t 1 -24 1t 0 -23 1t 1 -24 1u 1 -24 1t 0 -24 1t -3 -23 1t -3 -24 1t -4 -24 1t -4 -24 1t -4 -24 1t -2 -24 1t 0 -24 1t 0 -24 1t 0 -24 1t 0 -24 1t 0 -24 1s 0 -25 1t 0 -24 1s 0 -24 1t 0 -25 1s 0 -24 1t 0 -24 1s 0 -25 1t 0 -24 1t 0 -23 1t 0 -25 1t 0 -24 1s 0 -25 1r 0 -27 1p -1 -2f 1f 0 -2m x 0 -2p p -2 -2q f 3 -2s 5 -1 -2s -6 -1 -2q -k 0 -2l -10 -2 -2b -1k -1 -1u -22 2 -1b -2g 0 -q -2p 1 -b -2r 1 -7 -2s 0 -6 -2s 0 -5 -2r 0 -7 -2s 0 -9 -2s 1 -c -2r -1 -k -2q -1 -v -2n 0 -1c -2f 0 -1t -24 0 -24 -1t 1 -2d -1f 0 -2m -y 0 -2r -e 2 -2s a -2 -2m v 2 -2h 1b -2 -27 1p 1 -1v 22 -1 -1h 2c -1 -12 2l 0 -n 2p 0 -5 2r -1 f 2r 2 u 2n 0 12 2l 1 16 2j -1 17 2i -1 16 2i 0 16 2j -1 16 2j 0 15 2j -1 15 2j 0 16 2j -1 15 2j 0 15 2j -1 16 2j 0 17 2i -1 19 2i 2 1c 2f 2 1h 2d 1 1n 28 1 1s 25 -2 1v 22 2 1v 22 2 1x 20 1 20 1y 0 21 1w 0 20 1y -1 20 1x 0 27 1p -1 2g 1b 2 2j 16 -1 2k 14 0 2l y 1 2o t 0 2p o 1 2q j 0 2r h 0 2q f 0 2r f -1 2r e -1 2r e -1 2r e -2 2r e -1 2r d -1 2r d -1 2r e -1 2r c 0 2s d -1 2r d 0 2r c -1 2r d 0 2r c -1 2r c 0 2s c 0 2r c -1 2r c 0 2r c -1 2s c 0 2r c -1 2r c 0 2r b -1 2s c 1 2r b 0 2r b 0 2s a 0 2r b 0 2s a 0 2r a 0 2r 9 1 2s a 0 2r a 0 2s a 0 2r a 0 2s b 0 2r b 1 2r b 1 2s 5 2 2s -8 3 2q -j 2 2p -p 4 2n -t 0 2n -w 0 2k -13 0 2h -19 0 2d -1g 0 29 -1o 0 23 -1u -1 1r -25 -4 1b -2g 3 15 -2j 0 11 -2l 0 z -2l 0 x -2n 1 w -2m 0 v -2n 0 v -2o 0 u -2n -1 s -2o 2 s -2o 1 r -2o -1 q -2o -1 p -2p -1 o -2p -1 n -2p 0 m -2q 1 k -2q 0 k -2q 0 i -2q 0 h -2r -1 g -2q 1 f -2r 0 e -2r 0 c -2r 0 c -2s 0 b -2r 1 9 -2r 0 9 -2s 0 9 -2s 1 8 -2r -1 7 -2s -1 7 -2r -2 7 -2s 0 7 -2s 0 7 -2s 0 7 -2r 0 7 -2s 1 6 -2s 0 7 -2r 0 7 -2s 0 6 -2s 0 7 -2s 0 8 -2r 0 b -2s 0 f -2q -1 k -2q 0 r -2o 1 x -2n 0 12 -2k 0 17 -2i 1 1b -2h -1 1e -2e 1 1k -2b 0 1l -2a 2 1g -2e -1 12 -2k 0 n -2p -1 4 -2s 0 -c -2r -1 -o -2p 1 -v -2n 1 -w -2n 0 -u -2n 0 -u -2n 0 -w -2n 0 -w -2n 0 -v -2n 1 -s -2o -1 -n -2p 2 -j -2q 0 -c -2r -1 -5 -2s -1 4 -2s 2 g -2q 0 q -2p 0 11 -2l 0 1a -2g 1 1j -2b -2 1r -27 0 1u -23 0 1u -23 -1 1p -27 -1 1h -2d -1 14 -2j 0 t -2n 0 f -2r 1 1 -2s -2 -d -2r 1 -s -2o 1 -15 -2j 1 -1g -2d -1 -1q -26 0 -1z -1z 0 -25 -1s 1 -27 -1o 2 -2a -1m 0 -2c -1i -1 -2d -1h 0 -2e -1f 1 -2e -1e -1 -2e -1g 0 -2a -1l 0 -25 -1s 0 -23 -1u 1 -1t -23 0 -1l -2b -1 -1d -2f -1 -1a -2g -3 -19 -2i -1 -19 -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -19 -2i 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2i 0 -19 -2h 0 -18 -2h 0 -19 -2i 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2i 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2i 0 -19 -2h -1 -1a -2h 0 -19 -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -1a -2h 0 -19 -2h 0 -19 -2h 0 -1a -2i 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2h 0 -19 -2i 1 -19 -2h 1 -18 -2i 1 -19 -2h 1 -18 -2i 1 -18 -2h 1 -18 -2i 1 -17 -2i 1 -18 -2i 0 -17 -2i 0 -19 -2i 0 -1b -2g -1 -1d -2f -1 -1d -2f -1 -1d -2f -1 -1e -2f 0 -1e -2e 0 -1f -2e 0 -1g -2d 0 -1h -2d 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1j -2b 0 -1i -2c 0 -1i -2c 0 -1i -2d 0 -1h -2c 0 -1i -2d 0 -1k -2a 0 -1o -28 -1 -1v -23 0 -21 -1v -1 -2a -1m 2 -2g -1a -1 -2m -z 0 -2o -q 1 -2r -i 0 -2r -9 0 -2s 1 -1 -2r d 0 -2o r 0 -2k 14 1 -2e 1f 0 -28 1n 0 -22 1w 0 -1u 22 -1 -1l 2a 0 -1c 2g 1 -17 2i -1 -17 2j 1 -18 2h 0 -1b 2g 0 -1c 2g 0 -1d 2f 0 -1f 2e 0 -1g 2d 0 -1j 2c 0 -1k 2b -1 -1m 29 0 -1p 28 0 -1p 26 1 -1s 25 1 -1t 24 -1 -1u 23 0 -1v 22 1 -1x 21 2 -1x 20 2 -1y 20 2 -1y 1z 0 -1y 1z -1 -1y 1z 0 -1y 20 -1 -1y 1z -1 -1x 21 0 -1w 20 -1 -1w 22 -1 -1v 22 0 -1v 23 -1 -1t 23 0 -1u 23 -1 -1t 24 0 -1t 24 -1 -1z 1y 0 -2l x 1 -2r -d 5 -2j -14 2 -25 -1s -1 -1x -20 -2 -25 -1s -4 -2e -1e -1 -2m -y 3 -2r -6 0 -2n v -1 -2b 1k 1 -20 1w -1 -1w 22 0 -1t 24 -1 -1q 26 0 -1n 29 0 -1j 2b 1 -1f 2e -1 -1a 2h 0 -17 2i -1 -11 2l 0 -y 2m 0 -s 2o 1 -p 2p 0 -k 2p -1 -9 2s -1 a 2r -2 13 2k 1 1i 2c -1 1l 2a 0 1m 29 1 1n 29 0 1m 29 -1 1n 29 0 1n 29 0 1m 29 0 1n 29 0',
  interlagos: '-5 -5 22 p -2p -3 p -2p -3 p -2p -2 o -2p 2 p -2p 0 p -2p -1 r -2p 0 r -2o 0 r -2o 0 q -2p -1 r -2o 0 q -2p 0 r -2o 0 q -2p -1 q -2p 0 q -2o 0 r -2p 0 q -2o 0 r -2p -1 q -2p 0 r -2o 0 q -2p 0 r -2o -1 q -2p 0 q -2o 0 q -2p 0 r -2o -1 t -2o -3 y -2m -7 17 -2j -3 1i -2c 0 1j -2b 1 1u -23 5 29 -1n 8 2l -z 5 2r -j 3 2s -1 -2 2i 13 -7 21 1y -1 1v 22 1 1w 21 0 1x 21 0 1z 1y 0 26 1q 5 2i 17 0 2q k -4 2r -9 -4 2i -16 0 2e -1g 1 2e -1f 2 2g -1b 0 2j -16 0 2l -10 0 2o -v 1 2p -p 2 2q -i -1 2r -c 0 2s -5 -1 2s 3 -1 2s a 0 2r h 1 2o q 0 2n x -1 2j 16 0 2f 1d -1 2b 1k 0 27 1p 0 23 1v 0 1x 20 1 1r 25 0 1l 2b 1 1g 2d 0 1c 2g 0 17 2i 1 10 2m -1 r 2o -3 r 2p -6 r 2o -5 t 2o -1 u 2n -1 u 2o -1 q 2p -1 n 2p 5 m 2q 5 n 2p 6 o 2p 3 o 2p -3 o 2q -2 p 2p -3 o 2p -2 p 2p -2 p 2p -2 p 2p 0 p 2o -1 q 2p 0 p 2p -1 p 2p 0 p 2p -1 p 2p 0 p 2p -1 p 2p 0 p 2p 0 o 2p 0 p 2p 0 p 2p 0 p 2p 0 o 2p 0 p 2p 0 p 2p 0 p 2p 0 p 2p 0 o 2p 0 p 2p 0 p 2p 0 p 2p -1 p 2p 0 p 2o 0 p 2p 1 q 2p 0 p 2p 1 p 2p 1 p 2p 0 p 2p 1 p 2p 1 q 2p 1 p 2o 0 p 2p 1 p 2p 0 q 2p 1 p 2p 0 p 2p 0 p 2p 0 p 2p 0 p 2p 1 p 2p 0 p 2p 0 o 2p 0 j 2q 1 4 2s 3 -b 2r 4 -m 2q 7 -19 2h 4 -1x 1z 1 -2d 1g -7 -2m 10 -8 -2o p 1 -2r j 1 -2q i 0 -2r h 0 -2r f -1 -2r e 0 -2r c 0 -2s 9 -1 -2s 4 -1 -2s -1 0 -2s -7 -1 -2q -j 0 -2m -y 0 -2m -10 0 -2m -x -1 -2m -z 0 -2i -17 3 -2b -1k 0 -28 -1p 0 -24 -1s -1 -1y -20 -3 -1q -27 -2 -1n -28 0 -1m -2a 0 -1l -2a 0 -1k -2b 1 -1j -2c 0 -1k -2b 0 -1k -2b 0 -1j -2b 1 -1k -2b 0 -1k -2b 0 -1l -2b 0 -1k -2a 0 -1l -2b 0 -1m -2a 0 -1l -2a 0 -1m -29 1 -1m -2a 0 -1m -2a 0 -1m -29 0 -1n -29 0 -1m -2a 0 -1n -29 1 -1m -29 0 -1n -29 0 -1n -29 0 -1n -29 0 -1n -29 0 -1n -29 0 -1n -29 1 -1n -28 0 -1o -29 0 -1q -26 -1 -1v -23 -2 -20 -1x 1 -27 -1p -1 -2g -1b 2 -2r -g -1 -2s -7 -1 -2s -2 3 -2s 4 0 -2r b 0 -2r j 1 -2o s 0 -2k 12 0 -2h 1b -2 -2f 1d 1 -2d 1g 3 -29 1n 2 -21 1x -1 -1o 28 -7 -1a 2g -5 -11 2l 2 -y 2n 1 -r 2o 1 -l 2q 0 -g 2r -1 -g 2r 0 -h 2q -1 -i 2r 0 -h 2q -1 -f 2r -1 -b 2s -2 -4 2s 2 3 2s 3 n 2p 7 1r 25 5 2c 1i 3 2m z 2 2r 5 -3 2o -r -7 2g -1b -2 2a -1m -2 28 -1o -2 2d -1i 1 2j -15 0 2o -p 2 2s -2 0 2p o 1 2c 1h 0 1u 24 -1 1a 2g 1 u 2n 1 b 2s 0 -6 2r -3 -p 2p -3 -15 2k 0 -1j 2b 0 -1w 22 -1 -20 1x -2 -21 1x -1 -20 1x -1 -1z 1y 0 -1z 1z 0 -1x 21 2 -1u 22 3 -1r 26 2 -1n 29 1 -1i 2d 0 -18 2h -1 -y 2m -3 -r 2p -2 -o 2p 2 -n 2p 1 -p 2p 2 -o 2q 2 -7 2r 1 q 2n 6 1z 1x 4 2h 19 2 2m z 0 2q 1 -7 28 -1l -d 1u -24 1 1t -24 0 1u -23 -2 1u -23 -2 1u -23 -1 1u -24 0 1u -23 -1 1v -22 1 1y -20 2 22 -1w 3 26 -1p 1 2d -1i 1 2i -18 1 2m -z 1 2o -p 3 2r -i 1 2r -9 0 2t -1 2 2r 7 0 2r f -1 2q m -1 2n w -1 2g 1b 2 28 1o 0 1z 1y -2 1t 24 -3 1o 29 -4 1k 2b 0 1h 2c 1 1h 2d 0 1g 2e 0 1g 2d 0 1g 2e 0 1g 2d 0 1g 2e 0 1g 2e 0 1g 2d 0 1g 2e 0 1f 2e 0 1g 2e 0 1f 2e 0 1e 2e 0 1e 2f 0 18 2i 1 w 2m 7 b 2s 7 -g 2q -1 -1c 2e 2 -25 1r -6 -2h 1b 3 -2l 12 0 -2m x -1 -2n w -2 -2m y -1 -2m y -2 -2m z -1 -2m z -2 -2n u -1 -2q l -2 -2s 8 1 -2s -5 2 -2q -f 3 -2r -j 1 -2q -k 1 -2q -j 2 -2r -h 2 -2r -g 2 -2q -h 3 -2q -l 3 -2p -r 3 -2m -w 1 -2m -10 1 -2k -12 -1 -2l -13 -2 -2j -15 -1 -2j -16 -2 -2h -19 0 -2h -1b 0 -2f -1d 0 -2e -1f 0 -2d -1h 1 -2a -1l 1 -29 -1n 1 -26 -1r 1 -23 -1u 1 -20 -1x 0 -1w -22 -2 -1o -28 -1 -1g -2e -1 -1b -2g 0 -1a -2h 0 -15 -2j 1 -z -2m 0 -t -2o 0 -p -2p -3 -n -2p -2 -o -2q -3 -n -2p -3 -o -2p -3 -n -2p 0 -n -2q 1 -m -2q 1 -l -2p 0 -l -2q 1 -l -2q 1 -l -2q 1 -l -2q 0 -l -2q 1 -l -2q 0 -m -2p 0 -m -2q 0 -m -2q 1 -n -2p 0 -n -2q 0 -n -2p 0 -m -2q 0 -l -2p 0 -j -2r 3 -g -2r 5 -e -2r 5 -a -2r 3 -7 -2s 2 -3 -2s 2 0 -2s 2 4 -2s 0 7 -2s -1 c -2s -1 g -2q -2 i -2r -3 l -2q -3 n -2p -2 o -2p -1 o -2p -2 p -2q -1 p -2p -1 o -2p -2 p -2p -1 p -2o -2 q -2p -1 p -2p 1 q -2p 1 r -2o 0 q -2p 1 r -2o 0 q -2p 1 r -2o 1 r -2p 0 q -2o 1 r -2p 1 q -2o 0',
  spielberg: '-c -9 1p -2p -q 0 -2o -q -1 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q -1 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -p -1 -2o -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q -1 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q -1 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q 0 -2o -p -1 -2p -q 0 -2o -q 0 -2p -q 0 -2o -r 0 -2p -q 0 -2o -p 0 -2o -q -1 -2q 8 c -24 1s -2 -1h 2d -5 -17 2i -1 -1a 2g -2 -1f 2e -2 -1i 2c -1 -1l 2a 0 -1n 29 3 -1p 27 -1 -1n 29 0 -1n 29 0 -1l 29 -1 -1l 2a 0 -1m 2a 0 -1l 29 0 -1m 2a 0 -1m 29 0 -1m 2a 0 -1m 29 0 -1m 29 0 -1m 29 0 -1n 2a 0 -1m 29 0 -1m 29 0 -1m 29 0 -1m 2a 0 -1m 29 0 -1l 2a 0 -1l 2a 0 -1i 2c 0 -1g 2e 0 -1d 2e -1 -1d 2g 0 -1b 2g 0 -1c 2f -1 -1b 2g 0 -1b 2h -1 -1a 2g 0 -1a 2h 0 -19 2h 0 -19 2h 0 -18 2i 0 -18 2i 0 -17 2i 0 -17 2i 0 -16 2j 0 -16 2i 0 -16 2j 0 -16 2j 0 -16 2i 0 -15 2j 1 -16 2j 0 -15 2j 0 -16 2j 0 -16 2i 0 -16 2j 0 -15 2j 0 -15 2j 0 -16 2j 1 -17 2i 0 -1a 2g 0 -1f 2f 0 -1k 2a 1 -1l 2a 0 -1k 2b 0 -1i 2c 1 -1k 2b 0 -1n 28 -1 -1r 26 0 -1t 24 0 -1v 22 0 -1w 21 0 -1x 20 0 -1y 20 0 -1x 1z 0 -1y 20 0 -1x 20 0 -1y 1z 0 -1y 20 0 -1x 20 0 -1y 1z 0 -1y 20 0 -1y 1z 0 -1y 1z 0 -1y 1z 0 -1z 1z 0 -1y 1z 0 -1z 1y 0 -20 1y 0 -1z 1y 0 -1y 1z 0 -1w 21 0 -1p 28 -1 -u 2m 1 12 2h 0 2p k 1 2r a -1 2r c 0 2r e 0 2r e 0 2r c 0 2s 8 0 2s 5 0 2s 3 0 2r 1 0 2s 0 1 2s -1 0 2s 0 0 2s 0 0 2s 0 0 2s 0 0 2s 0 0 2s -1 -1 2r -5 0 2s -8 1 2r -c -1 2s -9 0 2r -9 0 2s -a 0 2q -e -1 2q -j 0 2q -j 1 2q -j 0 2q -k 0 2q -j 0 2q -k 1 2q -j 0 2q -k 0 2q -j 1 2q -k 0 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 0 2q -j 0 2q -j 0 2r -j 1 2q -j 0 2q -j 0 2q -j 0 2q -j 0 2q -j 0 2q -i 0 2r -h 1 2q -h -1 2r -g 0 2r -e -1 2r -d 0 2r -b 0 2r -b 2 2s -9 0 2r -8 -2 2s -6 -1 2s -6 -1 2r -5 0 2s -4 0 2s -4 0 2s -3 -1 2s -4 0 2s -4 0 2r -4 0 2s -4 0 2s -5 -1 2s -4 0 2s -5 0 2r -5 1 2s -5 0 2s -5 0 2s -4 0 2s -2 0 2r -5 -1 2q -j 0 2h -18 0 1r -25 -1 n -2o 1 -j -2q 0 -14 -2k 0 -1c -2f 1 -1j -2b 0 -1m -2a 0 -1p -27 0 -1r -26 1 -1t -23 0 -1x -21 -1 -20 -1x 0 -24 -1s 1 -28 -1o 0 -2c -1i 0 -2f -1d 0 -2h -1a -1 -2j -16 0 -2k -11 0 -2n -x 0 -2o -p 0 -2q -k 1 -2r -g 0 -2r -d 0 -2r -d 0 -2r -8 -1 -2s -2 0 -2s 8 0 -2r d 0 -2r g 0 -2r c 0 -2r a 0 -2s a 0 -2r b 0 -2q g -1 -2q j 1 -2q k 0 -2q l 0 -2q j 0 -2q k 0 -2q k 0 -2q k 0 -2q k -1 -2q g 2 -2r d 0 -2s 7 2 -2s -4 -1 -2q -h -1 -2n -u -2 -2j -16 0 -2c -1h 1 -26 -1r -1 -1x -20 -1 -1m -29 0 -19 -2h 0 -x -2m 0 -j -2q 1 -7 -2s 0 6 -2s 0 h -2q 0 t -2n 0 14 -2k 1 1b -2g 0 1d -2f 0 1c -2g 0 1b -2g -1 1b -2g 0 1c -2g 0 1e -2e 0 1e -2f 0 1f -2e 0 1f -2e 0 1e -2e 0 1e -2f 0 1c -2f 0 1d -2f 0 1h -2d 0 1m -29 0 1v -22 1 23 -1u -1 2a -1k 1 2i -18 -1 2n -w 0 2q -h 1 2s -3 0 2r c 0 2p n 0 2n w 0 2j 15 -1 2c 1i 0 22 1v 1 1s 24 -1 1n 29 0 1m 29 0 1o 28 -1 1v 22 1 22 1v 0 27 1q 0 27 1p 1 28 1n 0 2c 1j 0 2f 1d 0 2j 15 0 2l z 0 2o s 0 2p n 0 2r h 0 2r e 0 2r a 0 2s 8 0 2r 6 0 2s 5 0 2s 5 0 2s 5 0 2r 5 0 2s 4 0 2s 3 0 2s 2 0 2s 1 0 2s -1 0 2s -2 0 2s -1 0 2r -1 0 2s -1 0 2s 0 0 2s 1 0 2s 1 0 2s 1 0 2s 2 0 2s 1 0 2s 2 0 2r 3 0 2s 2 0 2s 3 0 2s 2 0 2s 3 0 2s 2 0 2s 3 0 2r 2 0 2s 3 0 2s 2 0 2s 3 0 2s 2 0 2s 2 0 2s 3 0 2r 2 0 2s 2 0 2s 2 0 2s 2 0 2s 1 0 2s 3 0 2s 4 0 2r 5 0 2s 2 0 2s -5 -3 2r -g 3 2o -s -1 2j -14 -1 2b -1j 3 23 -1u -1 1q -26 0 1f -2e -1 12 -2k 2 u -2o 0 q -2o 1 r -2o 0 s -2o 0 u -2n -1 u -2o 0 s -2o 0 s -2n -1 s -2o 0 r -2p 0 s -2o -1 s -2n 0 t -2o 0 t -2o 0 q -2o -1 2 -2r 1 -17 -2i 0 -1w -21 0 -26 -1q 1 -2a -1m 1 -2b -1i 2 -2d -1h 2 -2f -1d 2 -2g -1c 2 -2h -1a 3 -2h -19 1 -2h -18 0 -2l -12 1 -2n -u -3 -2o -r -1 -2o -q -1 -2p -q 0 -2p -p 0 -2o -q 0 -2p -q 0 -2o -p 0 -2p -q -1 -2o -q 0 -2p -r 0 -2o -q 0 -2o -q 0 -2p -q 0 -2o -q 0 -2p -q -1 -2o -q 0 -2p -q 0 -2o -p 0 -2p -q 0',
  montreal: '1 -7 1j m -2q 0 m -2p -1 k -2q -1 i -2r 0 f -2q 1 c -2s 0 9 -2r 1 6 -2s 1 3 -2s 0 1 -2s 2 -1 -2s 2 -4 -2s 2 -5 -2r 1 -6 -2s -1 -8 -2s 0 -9 -2r 0 -a -2s 0 -b -2r 0 -b -2s 0 -a -2r 1 -b -2r 0 -a -2s 0 -d -2r 0 -c -2r 1 7 -2s 1 10 -2k 0 21 -1v 2 2i -17 -2 2m -y -1 2m -y -2 2h -1a -2 24 -1t 4 1k -2a 9 s -2n -3 -8 -2r -2 -17 -2i 1 -20 -1y 0 -2h -17 -5 -2p -n -9 -2s -6 -5 -2s 8 -2 -2q h -2 -2p n 0 -2p r -1 -2o s 0 -2o r 0 -2o q 0 -2o r 0 -2o t 0 -2n v -1 -2m y 0 -2l 12 0 -2i 16 0 -2h 1a 1 -2e 1g 0 -2a 1k 0 -28 1o 0 -26 1q 1 -27 1q 2 -27 1p -1 -27 1p 0 -27 1p -1 -26 1r 0 -25 1r 0 -25 1s 0 -25 1s 0 -25 1s 0 -24 1t 0 -25 1r 0 -25 1s -1 -22 1w 0 -1w 21 0 -1m 29 4 -v 2m 0 d 2r -6 w 2n 0 v 2n 0 l 2p 0 0 2s -1 -w 2m 1 -1r 25 2 -1s 25 0 -1s 25 1 -1s 24 0 -1t 25 0 -1s 24 0 -1s 25 0 -1r 26 -1 -1q 26 -1 -1p 27 -1 -1q 27 -1 -1s 24 -1 -1x 20 1 -23 1v 1 -28 1o 0 -2c 1h -1 -2f 1e 1 -2b 1j 0 -23 1u 1 -1y 1z 1 -1s 25 -2 -1f 2e -1 -18 2i 5 -16 2i 0 -13 2l 0 -w 2m -3 -m 2q -1 -e 2r 0 -7 2r -1 -5 2s 1 -3 2s -2 -2 2s 0 -1 2s 0 -1 2s 1 0 2s 0 0 2s 1 1 2s 0 0 2s 1 0 2s 0 -1 2s 0 -1 2r 1 -2 2s 0 -2 2s 1 -5 2s -2 -p 2p -1 -1k 2a 2 -2c 1i 1 -2p i 3 -2s -8 -1 -2n -u -4 -2n -v -1 -2r -9 2 -2q j -1 -2k 14 2 -2d 1g -1 -25 1s 0 -1v 21 1 -1n 29 -1 -1d 2f -1 -14 2k 0 -x 2m 0 -q 2p 0 -m 2p 0 -j 2q 0 -i 2r 0 -g 2q 0 -f 2r 1 -d 2r -1 -c 2r 0 -b 2s -1 -a 2r -1 -8 2s 0 -8 2r -1 -7 2s 0 -7 2s 1 -7 2r 0 -7 2s 1 -8 2s 0 -9 2r 1 -8 2s 0 -8 2s 0 -7 2r 0 -5 2s 0 -4 2s 0 -2 2s -1 0 2s 0 1 2s 0 3 2s -1 4 2r 0 5 2s 0 5 2s 1 5 2s 0 5 2s 1 6 2s 0 7 2r -1 7 2s -1 8 2s -1 9 2r 1 a 2s 0 c 2r 0 c 2r 0 f 2r 0 f 2r 1 i 2q 1 j 2q 0 l 2q 1 m 2p -2 o 2p -2 o 2p 0 o 2p 0 p 2p 0 p 2p 1 p 2p 0 o 2p 0 o 2p 0 p 2o 1 o 2p 0 p 2p 0 p 2p 1 p 2p 0 o 2p -1 1e 2d 5 2m t -3 2s 3 -1 2r 8 -1 2o t 1 2f 1d 1 24 1s -1 1q 26 0 1f 2e 0 16 2j -1 10 2l 1 v 2n -1 r 2o 0 q 2p 0 q 2o 1 r 2p 0 q 2o 0 q 2p 1 o 2o -1 o 2q -2 m 2p 0 m 2q 0 k 2p -1 l 2q 1 j 2q 0 j 2q 0 i 2r 0 i 2q 0 i 2q 1 h 2r 0 i 2q -1 h 2r 0 h 2q 0 g 2r 1 f 2r 0 e 2q -1 d 2s 0 b 2r 0 a 2r 2 8 2s 0 6 2s 0 5 2s 0 4 2r 0 3 2s 0 1 2s 1 1 2s -1 0 2s -2 -2 2s 0 -4 2s 0 -7 2s 0 -9 2r 0 -d 2r 1 -g 2r 0 -j 2q 0 -k 2q 0 -m 2p 0 -n 2q 0 -n 2p 0 -n 2p 0 -n 2q 0 -m 2p 0 -m 2p 0 -n 2q 0 -n 2p 0 -o 2p 0 -o 2p 0 -g 2r 2 5 2r 2 1n 25 5 2n u 4 2o -n 3 1z -1x 3 10 -2l 1 o -2p 1 o -2p 3 j -2q 2 b -2r 1 7 -2s -3 6 -2s -4 8 -2r -7 e -2r -9 m -2q 0 u -2n 0 12 -2k -2 17 -2i -1 19 -2i 0 19 -2h -1 19 -2h 1 19 -2h 1 19 -2i 1 18 -2i 1 17 -2i 1 15 -2j 1 15 -2j 0 14 -2k 1 12 -2k 1 13 -2k 1 11 -2l 0 12 -2k 1 12 -2l 1 11 -2k 0 12 -2l 0 11 -2l 0 12 -2k 1 11 -2l 0 12 -2l 0 11 -2k 0 12 -2l 1 11 -2l 0 11 -2k 0 12 -2l 1 11 -2l 0 11 -2l 1 11 -2l 1 11 -2l 1 10 -2l 1 z -2l 1 z -2m 1 y -2m -2 x -2m -4 u -2n -2 p -2p 3 l -2q 1 l -2p -2 m -2q -2 m -2p -2 m -2q -2 n -2p 0 m -2q 0 n -2p -1 m -2q 0 m -2p 0 n -2p 0 m -2q -1 m -2p 0 n -2q 0 m -2p 0 n -2p -1 m -2q 0 n -2p 0 m -2q 0 m -2p 0 n -2p 0 m -2q -1 n -2p 0 m -2q 0 m -2p 0 n -2p 0 m -2q 0 n -2p -1 m -2q 0 m -2p 0 n -2p 0 m -2q 0 n -2p -1 m -2q 0 m -2p 0 m -2p 0 n -2q 0 m -2p 0 m -2q -1 m -2p 0 n -2q 0 m -2p 0 m -2q 0 m -2p 0 m -2p 0 m -2q 0 m -2p 0 m -2q -1 m -2p 0 m -2q 0 m -2p 0 m -2q 0 m -2p 0 m -2q 0 m -2p 0 m -2q 0 l -2q 0 m -2p 0 m -2q 0 l -2p 0 m -2q 0 m -2p 0 l -2q 1 m -2q 0 l -2p 1 m -2q 0 j -2q 1 -2 -2r 0 -1q -23 5 -2f -1d 2 -20 -1x 2 -m -2n -1 i -2q 0 m -2q 0 m -2p 0 n -2q 0 m -2p 0 m -2p 0 m -2q 0 n -2p 0 m -2q 0 n -2p 0 m -2p 1 m -2q 0 n -2p 0 m -2q 0 n -2p 0 m -2p 0 n -2q 0 m -2p 0 n -2p 0 m -2q 0 n -2p 0 m -2q 0 n -2p 0 m -2p 0 n -2q 0 m -2p 0 n -2q 0 m -2p 0 n -2p 0 m -2q 0 n -2p 0 m -2p 0 m -2q 0 n -2p 0 m -2q 0 m -2p 0 n -2q 0 m -2p 0 m -2p 0 m -2q 0',
  austin: 'a 14 23 27 -1o 0 27 -1p 0 28 -1p 1 27 -1p 0 28 -1o 1 27 -1p 0 28 -1p 0 27 -1o 1 28 -1p 0 27 -1p 1 27 -1o 0 28 -1p 0 27 -1o 1 28 -1p 0 27 -1p 1 28 -1o 0 27 -1p 0 28 -1p 1 27 -1o 0 27 -1p 1 28 -1p 0 27 -1o 0 28 -1p 1 27 -1p 0 28 -1o 1 27 -1p 0 28 -1p 0 27 -1o 1 27 -1p 0 28 -1p 1 27 -1o 0 28 -1p 0 27 -1p 1 28 -1o 0 27 -1p 1 28 -1p 0 27 -1o 0 27 -1p 1 28 -1p 0 27 -1o 0 28 -1p 1 27 -1p 0 28 -1o 1 27 -1p 0 27 -1p 0 28 -1o 1 27 -1p 0 28 -1p 1 27 -1o 0 28 -1p 0 27 -1p 1 28 -1o 0 27 -1p 1 28 -1o 0 27 -1p 0 27 -1p 1 28 -1p 1 27 -1p 6 28 -1o 6 2d -1g 7 2i -18 9 2h -19 7 2i -18 3 2l -11 1 2p -m -6 2p f -i 1p 23 -p -b 2r -5 -t 2o -5 -v 2n -4 -w 2m -2 -x 2n -1 -x 2m -1 -x 2m -1 -y 2m -1 -y 2m -1 -y 2m -1 -y 2m -1 -y 2n -1 -x 2m -1 -x 2m -1 -y 2m -1 -y 2m -1 -v 2n -1 -m 2q 0 -c 2r 1 -1 2s -1 a 2r 0 i 2q 0 q 2p 0 x 2m 0 15 2j 1 1b 2h -1 1i 2b 1 1s 26 0 21 1w 0 26 1p 0 2a 1m 1 2b 1k 0 2c 1i 0 2d 1h 0 2c 1h 0 2d 1h 0 2d 1h 0 2c 1h 0 2d 1h 0 2d 1h 0 2d 1g 0 2d 1g 0 2e 1h -1 2c 1h 0 2d 1h 0 2c 1i 0 2c 1i -1 2b 1k 0 27 1p 1 1y 1z 0 1n 29 -1 1e 2f 0 16 2i -1 11 2l -1 z 2m 0 z 2l 2 12 2l 1 18 2h 0 1i 2d 1 1t 24 0 26 1q -1 2e 1d 1 2k 14 0 2m z 1 2m y -1 2j 14 -2 2b 1j 0 23 1u 0 1x 20 0 1h 2d 0 z 2m -1 m 2p 1 e 2r 1 b 2r 1 b 2s 1 e 2r 0 m 2p -2 x 2n 0 17 2i 1 1g 2d 0 1p 27 0 1w 22 1 22 1v 0 27 1p -1 2c 1i 0 2f 1e 1 2h 18 0 2l 12 -1 2n u -2 2q k -3 2r 9 0 2s -2 3 2r -e 3 2p -o -1 2m -y 0 2j -15 -1 2i -17 0 2j -17 1 2j -15 0 2j -15 0 2j -15 0 2k -14 -1 2k -13 0 2k -12 -1 2o -u -1 2r 5 -1 2l 10 3 2f 1c 1 2a 1l 0 27 1q 0 23 1u 0 22 1v 0 1z 1y 0 1x 21 0 1s 24 -1 1n 29 -2 1i 2c 0 1n 29 1 1y 1y 1 2c 1j -2 2l 10 2 2q i -1 2s 5 0 2r -9 0 2p -p -1 2i -17 1 29 -1n 0 1x -20 0 1k -2b -2 1d -2f 0 1z -1w 0 2k -12 0 2s -9 2 2r d 1 2p p 0 2p o 1 2p m 0 2q m 0 2p m 0 2q m 0 2p m 0 2q n 0 2p m 0 2p m 0 2q m 0 2p m 0 2q m 0 2p m 0 2q m 0 2p n -1 2p p 0 2h 19 -1 21 1w 1 1s 24 1 1q 27 0 1q 26 1 1q 26 0 1r 26 1 1r 26 1 1r 26 1 1r 25 0 1r 26 1 1q 26 1 1r 25 0 1r 26 1 1r 26 1 1r 26 1 1r 25 0 1q 26 1 1r 26 1 1r 26 0 1r 25 1 1q 26 1 1r 26 1 1r 26 0 1r 26 1 1r 25 1 1q 26 0 1r 26 1 1r 26 1 1r 26 1 1q 25 3 1r 26 4 1q 26 4 1r 26 4 1q 27 4 1p 27 4 1l 2a 6 1i 2c 7 1g 2e a q 2n -5 -r 2n -y -28 1j -7 -2r 3 2 -2r -e -3 -2p -q -3 -2m -v -3 -2m -y -3 -2n -x 0 -2n -v -1 -2n -v -1 -2n -v 0 -2n -u -1 -2n -w -1 -2n -v -1 -2n -v 0 -2n -w 0 -2n -v 0 -2n -v 0 -2n -v 0 -2n -u 0 -2n -u 0 -2o -u 1 -2n -t 0 -2o -t -1 -2o -s 0 -2o -t 0 -2o -s 0 -2o -s 0 -2o -s 0 -2o -s 0 -2o -s 0 -2o -r 0 -2o -s 0 -2o -r 0 -2o -r 0 -2o -r 0 -2p -q 0 -2o -q 0 -2p -p 0 -2p -p 0 -2p -p -1 -2p -o 0 -2p -o 0 -2p -o 0 -2p -o 0 -2p -o 1 -2p -p 0 -2p -o 0 -2p -o 0 -2p -o 0 -2p -o 0 -2p -n 0 -2p -n 0 -2q -n 0 -2p -l 0 -2q -m 0 -2q -l 0 -2p -k 0 -2q -l 0 -2q -l 0 -2q -l 0 -2p -l 0 -2q -l 0 -2q -k 0 -2q -k -1 -2q -j 0 -2q -j 0 -2q -j 1 -2r -i 0 -2q -i 0 -2q -i 0 -2r -i 1 -2q -h 0 -2r -i 0 -2q -g 1 -2r -h 0 -2q -h 0 -2r -g 0 -2r -g 1 -2q -g 0 -2r -f 1 -2r -f 0 -2r -f 0 -2r -f 1 -2q -e 0 -2r -e 0 -2r -e 1 -2r -e 1 -2s -d 0 -2r -d 1 -2r -d 1 -2r -c 1 -2r -c 1 -2r -c 0 -2s -d 0 -2r -c -1 -2r -c 0 -2r -c 0 -2r -d 0 -2r -d 0 -2s -c 0 -2r -d 0 -2r -c 0 -2r -d 0 -2r -c 0 -2s -c 1 -2r -c 1 -2r -c 2 -2r -c 1 -2s -b 1 -2r -c 1 -2r -b 1 -2r -c 1 -2s -c 1 -2r -c 2 -2r -c 1 -2s -b 1 -2r -9 1 -2r -f 2 -2k -z 5 -1f -2b -6 6 -2q -b 1g -2d -2 1o -28 -2 1q -26 0 1r -26 0 1r -26 0 1q -26 0 1r -26 0 1p -27 0 1p -27 0 1o -28 -1 1m -29 0 1l -2a 0 1l -2b 0 1j -2b 0 1j -2c 0 1i -2c 0 1h -2d 0 1g -2d -1 1e -2e -2 r -2o -1 -d -2q -1 -1f -2d 1 -2e -1d -1 -2r -9 6 -2r 8 1 -2s 8 0 -2s 4 -2 -2s 2 -2 -2r 9 -2 -2q n -1 -2h 18 1 -1t 23 -4 -14 2j 0 -w 2n -1 -z 2m 0 -13 2k 1 -1a 2h -2 -1l 2a -3 -1w 21 -1 -1y 1z 0 -1v 22 -1 -1w 21 -1 -24 1u 0 -2d 1f 8 -2n w d -2q g 5 -2r e -1 -2s 9 -4 -2s -2 -5 -2d -19 -a -l -2p -6 s -2o 1 1c -2f 0 1e -2f 1 1e -2f 0 1e -2e 0 1f -2e 0 1g -2e 0 1f -2d 0 1f -2e 0 1g -2e 0 1f -2e 0 1f -2e 0 1f -2e 0 1f -2d 0 1h -2e 0 1g -2d 0 1e -2e 0 1b -2h 2 14 -2j 5 w -2n 4 i -2q 4 1 -2s -2 -d -2r -5 -o -2p -5 -u -2n -3 -x -2n -1 -y -2m -1 -11 -2k 0 -18 -2i 1 -1l -2b 0 -1y -1z -1 -29 -1l 2 -2h -19 0 -2l -12 0 -2k -14 0 -2i -16 -1 -2h -19 0 -2i -19 -1 -2j -14 -1 -2o -t 0 -2r -d 1 -2s 2 1 -2r 8 0 -2s 9 0 -2q i 0 -2o s 0 -2n v 0 -2n v -1 -2m y -1 -2i 17 0 -2d 1h 1 -28 1o 1 -20 1x -1 -1u 24 1 -1n 28 1 -1k 2b 0 -1j 2b 0 -1m 2a 0 -1p 27 0 -1p 27 0 -1p 27 0 -1o 28 0 -1n 29 -1 -1p 27 0 -1o 28 -1 -1p 27 1 -1q 27 0 -1q 26 0 -1r 26 1 -1r 25 0 -1t 24 0 -1u 23 0 -1y 20 -2 -29 1m -1 -2n t 2 -2r 8 4 -2s -a 1 -2p -p 0 -2l -z 0 -2k -13 0 -2j -14 1 -2j -16 -1 -2j -17 0 -2i -16 0 -2j -15 0 -2j -15 0 -2k -15 0 -2j -15 0 -2j -15 0 -2j -15 0 -2j -15 0 -2j -15 0 -2k -15 0 -2j -16 0 -2j -15 0 -2j -15 0 -2j -16 0 -2j -15 0 -2j -15 1 -2j -15 0 -2k -13 -1 -2j -16 -1 -2a -1k 5 -1u -23 j -1a -2h 9 o -2l -8 23 -1u -g 28 -1o -2 27 -1p -1 27 -1p 1 27 -1p 0 28 -1p 0 27 -1o 1 28 -1p 0 27 -1p 1 28 -1o 0 27 -1p 0 28 -1o 1 27 -1p 0',
  sakhir: '-e -g 1p 4 2s 0 5 2s 0 4 2s 0 5 2s 0 4 2r 0 5 2s 0 4 2s 0 5 2s 1 4 2s 0 5 2s 0 4 2r 0 5 2s 0 4 2s 0 5 2s 0 4 2s 0 5 2r 1 4 2s 0 5 2s 0 4 2s 0 5 2s 0 4 2s 0 5 2r 0 5 2s 1 4 2s 0 5 2s 0 4 2s 0 5 2r 0 4 2s 0 5 2s 0 4 2s 0 5 2s 1 4 2s 0 5 2r 0 4 2s 0 5 2s 0 4 2s 0 5 2s 0 4 2r 0 5 2s 1 5 2s 0 4 2s 0 5 2s 0 4 2s 0 5 2r 0 5 2s 0 4 2s 1 5 2s 0 4 2s 0 5 2r 0 4 2s 0 5 2s 0 4 2s 0 5 2s 0 4 2s 1 4 2r 0 5 2s 0 4 2s 0 4 2s 0 4 2s 1 4 2s 1 4 2r 1 3 2s 0 4 2s 1 4 2s 1 4 2s 1 3 2s 0 4 2s 1 4 2r 1 4 2s 1 3 2s 0 2 2s 1 4 2s 1 g 2q 6 1v 1y 5 2q -5 -4 2b -1k -2 1x -1z -1 1z -1z -2 20 -1x -1 21 -1w -1 1z -1y -2 1y -20 -1 22 -1v -1 2f -1c -2 2r -3 2 2o q -1 2n u 0 2n v -1 2n w -1 2n u -1 2o u 0 2n u -1 2n w -1 2n v -1 2p n -1 2r c -2 2s -3 -2 2r -e 1 2q -g -1 2r -i 0 2q -j 1 2q -k 1 2q -j 0 2q -k 0 2q -j 1 2q -k 0 2q -j 0 2q -j 1 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2q -k 0 2q -j 1 2q -j 0 2r -k 0 2q -j 1 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -k 1 2q -j 0 2q -j 0 2q -j 1 2q -k 0 2q -j 1 2q -j 0 2q -m 0 2d -1d a 14 -2j d 9 -2r 3 -4 -2s -c -d -2r -8 -m -2p 6 -1j -2a 2 -26 -1r -1 -25 -1r -2 -25 -1r -1 -26 -1r -1 -25 -1r -1 -26 -1r -2 -25 -1r -1 -26 -1s -1 -25 -1r -2 -25 -1r -1 -25 -1s -1 -25 -1s -2 -24 -1t -3 -23 -1u -4 -20 -1x -3 -1z -1y -4 -1y -20 -2 -1w -21 1 -1v -22 0 -1v -22 0 -1s -25 -1 -1m -29 0 -1f -2e 0 -18 -2i 0 -16 -2j -1 -13 -2k 0 -13 -2j 0 -15 -2j 0 -1h -2d 0 -21 -1v 1 -2e -1f 0 -2m -y 0 -2q -i 1 -2s -5 1 -2s 5 0 -2r b -1 -2s c -1 -2r c 0 -2r e -1 -2r c -2 -2s 0 -1 -2r -e 0 -2o -r 0 -2j -14 0 -2c -1i -1 -24 -1t 1 -1w -21 1 -1r -25 1 -1q -27 0 -1q -27 1 -1q -26 0 -1q -26 1 -1q -27 0 -1q -26 1 -1q -26 0 -1q -27 1 -1q -26 0 -1p -27 1 -1q -26 0 -1q -26 1 -1r -27 0 -1q -26 1 -1q -26 0 -1p -27 1 -1q -26 0 -1z -1z 2 -2n -m -1 -2r c 2 -2n v -1 -20 1u -1 -q 2n -3 1 2s 1 c 2r -1 h 2r 0 h 2q 0 g 2r -1 g 2r 0 f 2q 0 g 2r -1 g 2r 0 f 2q 0 g 2r 0 g 2r -1 g 2q 0 g 2r 0 g 2r -1 g 2q 0 g 2r 0 f 2r 0 g 2q -1 g 2r 0 g 2r 0 g 2q -1 f 2r 0 g 2q 0 g 2r 0 g 2r -1 f 2r 0 f 2q -1 e 2r -1 b 2s 0 1 2r -1 -a 2s 0 -j 2q 0 -o 2p 0 -x 2m 1 -1b 2g 0 -1m 2a 0 -1v 21 0 -22 1w 2 -24 1s 3 -26 1r 4 -27 1p 4 -2j 12 b -2h -10 a -18 -2g -5 -g -2r -2 -e -2q -1 -e -2r -2 -e -2r -2 -c -2s -2 -d -2r -1 -d -2r -2 -d -2r -2 -d -2r -1 -f -2r -2 -f -2r -2 -e -2q -1 -c -2s -2 -b -2r -2 -9 -2r -1 -7 -2s -1 -6 -2s 0 -5 -2s 0 -5 -2r -1 -5 -2s 0 -4 -2s -1 -4 -2s 0 -5 -2s 0 -4 -2s -1 -5 -2r 0 -4 -2s -1 -5 -2s 0 -4 -2s -1 -5 -2s 0 -5 -2r 0 -4 -2s -1 -5 -2s 0 -4 -2s -1 -5 -2s 0 -4 -2s 0 -5 -2r 0 -4 -2s 0 -5 -2s 0 -4 -2s 0 -4 -2s 0 -5 -2s 0 -4 -2r 0 -4 -2s 0 -5 -2s 0 -4 -2s 0 -4 -2s 0 -4 -2r 0 -5 -2s 0 -4 -2s 0 -4 -2s 1 -4 -2s 0 -5 -2s 0 -4 -2r 0 -4 -2s 0 -4 -2s 0 -5 -2s 0 -4 -2s 0 -5 -2s 0 -4 -2r 0 -4 -2s 0 -5 -2s 0 -4 -2s 0 -4 -2s 0 -4 -2s 0 -5 -2r 0 -4 -2s 0 -5 -2s 0 -4 -2s 1 3 -2s 4 z -2k 2 2b -1j 2 2j -13 2 2n -v 0 2q -k 0 2s -9 1 2s -2 2 2s 4 2 2r a -2 2r g -4 2p m -2 2o s 0 2l z 0 2j 17 0 2e 1e 1 2a 1m -1 23 1t 0 1y 20 0 1s 25 1 1m 28 -1 1i 2d -1 1d 2f 1 17 2i 0 13 2k 0 11 2l 0 11 2l 0 11 2l -3 z 2l -2 10 2l -2 z 2m -2 13 2k 0 1c 2f -1 1p 28 0 1u 22 0 1y 20 0 21 1v 0 26 1s 1 29 1m 0 2d 1g 5 2h 19 6 2m 10 2 2o o -1 2r f -3 2s 7 -3 2s 0 4 2r -9 5 2q -j 3 2q -m 1 2p -o 1 2k -13 0 2i -16 0 2j -17 0 2i -17 -1 2i -18 0 2h -18 0 2i -17 -1 2i -18 0 2j -16 0 2i -16 0 2i -18 -1 2g -1b 0 2a -1l 0 1x -20 1 1j -2b -4 1f -2e -3 1f -2e -1 1b -2h -1 z -2l -4 h -2q -2 -7 -2s 1 -y -2l -1 -1n -28 0 -21 -1x 0 -26 -1p 0 -2b -1l 0 -2d -1g 0 -2g -1b 1 -2h -1a 1 -2h -18 1 -2i -19 0 -2g -1a 1 -2h -1b 0 -2g -1b 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2f -1c 0 -2g -1d 0 -2f -1c 0 -2f -1d 0 -2g -1d 1 -2f -1c 0 -2f -1d 0 -2f -1c 0 -2g -1d 0 -2f -1d 0 -2f -1d 0 -2f -1c 0 -2g -1d 0 -2f -1d 0 -2f -1d 0 -2f -1c 0 -2f -1d 0 -2g -1d 0 -2f -1d 0 -2f -1c 0 -2f -1d 0 -2g -1d 0 -2f -1c 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2g -1c 0 -2f -1d 0 -2f -1c 0 -2f -1d 0 -2f -1d 0 -2f -1d 0 -2f -1d 1 -2f -1e 0 -2f -1d 1 -2f -1e 1 -2f -1d 0 -2f -1d 1 -2f -1d 1 -2g -1c 0 -2g -1b 1 -2g -1c 1 -2g -1a 1 -2g -1b 1 -2h -1a 0 -2h -1a 1 -2h -19 1 -2h -19 1 -2g -1c 1 -2f -1d -4 -2q -a 1 -2k 13 i -1m 27 8 -14 2k -4 -12 2k -3 -11 2l -4 -12 2l -3 -14 2j -4 -11 2l -3 -p 2p -1 -8 2r 1 1 2s -2 3 2s -1 3 2s -1 3 2s -1 3 2s -1 3 2r -1 3 2s -1 3 2s -1 3 2s -1 2 2s -1 3 2s -1 3 2s -2 2 2s -1 3 2r -1 3 2s -1 4 2s -1 3 2s -1 4 2s -1 4 2s 0 4 2s 0 4 2r 0 4 2s 0 4 2s 1 5 2s 0 4 2s 0 5 2s 0 4 2r 0 5 2s 0 4 2s 0 5 2s 0 5 2s 1 4 2r 0 5 2s 0 4 2s 0 5 2s 0 4 2s 0 5 2s 0',
  mexico: '-j w 1w 2r -e 1 2r -f 0 2r -e 0 2q -e 0 2r -e 0 2r -e 0 2r -e 0 2r -e 0 2r -e 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e -1 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2q -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -e 0 2r -e 0 2r -d 0 2r -f 0 2r -e 0 2r -f 6 2q -g 7 2q -m 7 1r -20 -3 0 -2r -4 -a -2r -3 -8 -2s -4 -8 -2r -3 -c -2s -2 -d -2r -1 -9 -2r -1 2 -2s 1 v -2m -6 2d -1e -3 2j -16 0 2i -16 0 2h -1a -1 1e -2b d -a -2r -2 -g -2r -3 -e -2r -4 -d -2r -3 -g -2q -3 -i -2q -2 -o -2p 0 -u -2o 0 -x -2m 0 -w -2n 0 -v -2n 0 -y -2m 0 -13 -2k 0 -17 -2i 0 -1b -2g 0 -1c -2g 0 -1f -2e 1 -1f -2e 0 -1f -2e 0 -1g -2d 0 -1f -2e -1 -1f -2e 0 -1g -2d 0 -1f -2e 0 -1g -2d 0 -1g -2e 0 -1f -2e 0 -1g -2d 0 -1g -2e 0 -1g -2d 0 -1f -2e 0 -1g -2d 0 -1g -2d 0 -1g -2e 0 -1g -2d 0 -1g -2e 0 -1f -2d 0 -1g -2e 0 -1g -2d 0 -1g -2d 0 -1g -2e 0 -1g -2d 0 -1g -2e 0 -1f -2d 0 -1g -2e 0 -1g -2d 0 -1g -2e 0 -1f -2d 0 -1g -2d 0 -1g -2e 0 -1h -2d 0 -1g -2d 0 -1g -2d 0 -1h -2d 0 -1h -2d 0 -1i -2c 0 -1h -2c 0 -1i -2d 0 -1j -2b 0 -1j -2c 0 -1k -2b 1 -1l -2a 2 -1l -2a 2 -1l -2a 2 -1l -2a 3 -1i -2c 2 -1h -2c 3 -1i -2d 2 -1d -2f 4 8 -2o 9 1y -1y 4 2d -1g -1 2d -1g -1 2c -1j -1 28 -1n -9 26 -1r -a 1e -2b -b -12 -2i 2 -1x -20 0 -25 -1r 0 -29 -1o -1 -28 -1n 0 -28 -1o 0 -28 -1o 0 -28 -1o 0 -28 -1o 0 -29 -1n -1 -27 -1o 0 -27 -1q 0 -2g -1b -1 -2q -2 4 -2i 15 -3 -1x 20 0 -w 2m 5 1 2s 1 9 2r -2 d 2r -1 d 2r -1 d 2r -1 e 2r -1 d 2r -1 d 2s 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 d 2r 1 d 2r 0 d 2r 0 d 2r 0 d 2s 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 d 2r 0 c 2r 0 d 2r -1 d 2r 0 d 2s 0 b 2r 0 -1 2s 0 -10 2k 2 -1u 22 0 -28 1o 0 -2d 1h 0 -2d 1g 0 -2d 1g -1 -2d 1h 0 -2b 1j 0 -29 1n 0 -24 1u 0 -1v 21 0 -1l 2a 0 -1d 2f -1 -15 2k 0 -10 2l 0 -12 2k 0 -1a 2h 1 -1l 29 0 -1x 21 0 -25 1s 1 -26 1q 0 -2a 1l 0 -2l 11 0 -2p l 0 -2r g 0 -2r d 0 -2r b 1 -2s b 0 -2r a 0 -2s a -1 -2r a 0 -2s 9 0 -2r 9 0 -2s 8 0 -2r 9 -1 -2r f 0 -2p p 0 -2j 14 0 -29 1l 1 -1u 24 0 -1b 2f -1 -y 2n 0 -s 2n 0 -s 2o 0 -r 2p 0 -t 2n -1 -12 2k 2 -1h 2d 3 -1t 24 2 -1z 1y 1 -26 1r 0 -2d 1g 0 -2i 18 0 -2j 15 0 -2j 16 0 -2h 19 0 -2h 1a -1 -2f 1c -1 -2f 1e -1 -2e 1f -1 -2d 1h -1 -2d 1f -1 -2h 1a 0 -2k 12 1 -2k 15 0 -2h 19 0 -2o r 0 -2q h 0 -2r g 0 -2r f 0 -2r e 0 -2r e 0 -2r d 0 -2r d 0 -2r e 0 -2r d 0 -2r e 0 -2r e 0 -2r e 0 -2r e 0 -2r d 0 -2r e 0 -2r e 0 -2q e 0 -2r d 0 -2r e 0 -2r e 0 -2r d 0 -2r e 0 -2r e 0 -2r d 0 -2r e 0 -2r e 0 -2r d 0 -2r e 0 -2r e 0 -2r e 0 -2r e 0 -2r d 0 -2r e 0 -2r d 0 -2r e 0 -2r f 0 -2q k 0 -2d 1e 0 -19 2g 1 -h 2q 0 -6 2s 0 -6 2s 0 -6 2r 0 -6 2s 0 -7 2s 0 -8 2r 0 -9 2s 0 -b 2r 2 -c 2s 1 -d 2r 2 -d 2r 2 -d 2r 2 -e 2r 2 -g 2q 2 -r 2o 0 -23 1r -6 -2q 5 -5 -2c -1g 0 -1p -27 -1 -1i -2c -3 -1p -27 -2 -25 -1r -2 -2q -7 -2 -2m y 3 -28 1n -2 -2k 11 -2 -2r h 3 -2r b 3 -2s 9 0 -2r 8 -1 -2s 8 -1 -2r c -2 -2p p 1 -2h 18 1 -20 1x 6 -h 2p 5 c 2r 4 p 2p 4 x 2m 2 15 2k -1 1c 2f -1 1j 2c -3 1o 27 -3 1t 24 -3 1x 21 -2 20 1x -1 25 1r 0 2b 1k 2 2h 19 2 2l 10 2 2p r 2 2q h 0 2r b -1 2s 7 -1 2s 5 0 2s 1 -1 2r -a 0 2r -g 0 2q -f 0 2r -f 0 2r -e 0 2r -e 0 2r -f 0 2r -e 0 2r -f 0 2r -f 0 2q -f 1 2r -g 0 2r -f 0 2r -g 0 2q -g 0 2r -g 0 2q -g 1 2r -g 0 2r -g 0 2q -g 0 2r -g 0 2r -g 0 2q -g 0 2r -g 1 2r -f 0 2q -g 0 2r -f 0 2r -f 0',
  hungaroring: '-o 1 1r -26 1s 0 -25 1r 0 -25 1s 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -26 1s 0 -25 1r 0 -25 1s 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -26 1r 0 -25 1s 0 -25 1r 0 -25 1s -1 -26 1r 0 -25 1r 0 -25 1s 0 -25 1r 0 -26 1r 0 -25 1s 0 -25 1r -1 -26 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r 0 -26 1s 0 -25 1r 0 -25 1s -1 -25 1r 0 -25 1s 0 -25 1s 0 -25 1s 0 -25 1s 0 -24 1r 0 -25 1s 0 -25 1s 0 -25 1s 0 -25 1s 0 -25 1r 0 -26 1r 0 -25 1r -1 -25 1s 0 -22 1v 0 -1w 22 6 -1k 2a 6 -r 2o 7 g 2q 2 1u 21 -2 2k 13 -7 2q j -9 2r 8 -1 2s 3 0 2s -1 -1 2s -4 -2 2s -7 0 2r -a -1 2r -d 0 2r -f -1 2q -i 0 2q -l 0 2p -n 0 2p -r 0 2n -u 0 2m -y 1 2k -13 0 2h -19 0 2g -1c 0 2d -1g 0 2a -1k 0 29 -1n 0 27 -1p 1 26 -1r -1 25 -1s -1 24 -1s -1 25 -1t 0 24 -1s -1 25 -1s 0 25 -1r 0 25 -1s 0 26 -1r -1 25 -1s 0 25 -1r 0 25 -1s 0 25 -1r 0 25 -1s -1 25 -1s 0 25 -1s 0 25 -1s 0 24 -1s 0 25 -1s -1 26 -1r 1 28 -1n 1 2d -1g 0 2n -v -1 2s -4 0 2p l 1 2l 11 -2 2e 1f 1 1x 1z 2 1c 2g -2 x 2m 0 k 2q 0 4 2s 0 -g 2q -1 -z 2m -2 -18 2h 1 -1a 2h 0 -1c 2g 0 -1b 2g 0 -1b 2g 0 -1a 2h 0 -1b 2g 0 -1b 2g 1 -1a 2h 0 -19 2h -2 -11 2l 3 -l 2q 6 8 2r 7 x 2m -3 16 2j -7 18 2h 0 1a 2h -1 1a 2h 0 1b 2g -1 1a 2h 0 19 2h -1 1a 2g 0 1a 2h -1 1a 2h 0 1a 2h 0 1a 2h -1 1a 2g 0 1a 2h 0 1a 2g 0 1b 2h 1 1a 2g 0 1b 2h 0 1a 2g 0 1b 2h 0 1a 2g 0 1b 2g 0 1b 2h 0 1a 2g 1 1b 2h 0 1a 2g 0 1b 2h 0 1a 2g 0 1a 2h 0 1a 2g 0 1a 2h 0 1a 2h 0 1a 2h 0 1d 2f 0 1f 2e 0 1i 2c 0 1l 2a 1 1m 29 0 1n 29 -1 1q 27 0 1r 24 -1 1w 22 0 1z 1z 0 20 1x 0 1p 26 -1 13 2k 0 c 2r -1 -9 2r -1 -m 2q 1 -p 2p -1 -o 2p 0 -n 2p 0 -p 2p -1 -o 2p 0 -o 2o 0 -p 2p -1 -o 2p 0 -o 2p -1 -o 2p 0 -n 2q 0 -o 2o -1 -q 2p 0 -p 2p -1 -m 2p -1 -d 2r 0 -1 2s 1 j 2q 2 16 2i 0 1m 29 -3 1y 1z -2 28 1p 1 2e 1e 1 2l 12 -1 2o o 1 2s 8 0 2r -b -1 2o -s 0 2i -17 2 2e -1f 0 2c -1i 0 2b -1k 0 29 -1n 0 27 -1p -1 25 -1r 1 23 -1u 0 21 -1x 0 1y -1y -1 1x -21 -1 1w -22 0 1u -22 0 1u -24 0 1t -23 0 1u -23 -1 1u -23 0 1v -22 0 1v -23 0 1v -22 0 1v -22 0 1v -22 0 1v -23 0 1s -24 0 1n -29 -1 q -2n 2 -n -2p -1 -1i -2b 0 -1x -20 -1 -1m -29 2 -5 -2r -1 l -2p -2 r -2p 0 o -2p 1 n -2p 0 n -2p 0 o -2p 0 o -2p 0 o -2p 0 o -2p 0 o -2p 0 n -2p 0 n -2q 0 n -2p 0 t -2n 1 15 -2k 0 1l -29 2 20 -1y -1 2a -1k 1 2m -y -2 2r -b 1 2s -a 0 2q -f 0 2s -d 0 2r -a 0 2r -c 0 2r -g 0 2p -p 0 2k -12 1 2a -1l 1 1t -23 -1 1a -2h -1 s -2o 0 8 -2r 1 -7 -2s -1 -g -2q 0 -i -2r 0 -h -2q 0 -f -2r 0 -f -2r 0 -g -2q 0 -h -2r 0 -h -2q 0 -h -2r 1 -g -2q 0 -g -2r 0 -g -2r 0 -d -2r 0 -a -2r 0 -1 -2s 0 a -2r -1 l -2q 1 x -2n 1 14 -2j -1 1c -2f 0 1g -2e -1 1i -2c 0 1i -2c 0 1h -2d 0 1g -2d 0 1h -2d 1 1i -2c 0 1i -2c 0 1h -2d 0 1f -2d 0 1a -2h -3 x -2m 1 g -2r 0 0 -2s 1 -a -2r -1 -m -2q 0 -10 -2l 1 -1c -2f 0 -1n -29 2 -1s -25 0 -1v -22 -1 -1w -21 -1 -1w -21 0 -1x -21 0 -1w -21 0 -1x -21 0 -1w -20 0 -1x -21 0 -1w -21 0 -1x -20 0 -1w -21 0 -1x -21 0 -1x -20 0 -1w -21 0 -1x -21 0 -1w -20 0 -1x -21 0 -1w -21 0 -1x -21 0 -1w -21 0 -1w -21 1 -1w -21 0 -1w -21 1 -1w -21 1 -1w -21 0 -1w -22 1 -1x -21 0 -1w -21 1 -1w -21 1 -1w -21 0 -1x -21 1 -1w -20 0 -1x -21 1 -1x -20 0 -25 -1s 0 -2n -r 3 -2q f 1 -2e 1e -2 -20 1x -1 -1v 22 -1 -1t 24 -1 -1t 24 0 -1t 24 -1 -1t 24 -1 -1t 24 -1 -1u 23 -1 -1t 24 -1 -1v 22 -1 -1v 22 0 -1z 1z -1 -21 1w -1 -25 1r 1 -26 1r 0 -26 1r 0 -23 1u 0 -24 1s 0 -2c 1i -2 -2n u 3 -2r 1 2 -2s -d -4 -2n -r 1 -2e -1f 1 -1z -1z 1 -1d -2e 0 -m -2p 0 8 -2s -2 w -2m 1 1g -2d 1 1w -22 0 24 -1s 1 27 -1p 1 27 -1p 0 25 -1s 1 24 -1t 1 25 -1s 0 26 -1r 1 25 -1q 0 26 -1r 1 26 -1r 1 25 -1r 0 25 -1s 1 25 -1r 0 22 -1w -2 1m -29 1 13 -2k -1 o -2p 0 a -2r 2 -4 -2s -2 -j -2q 2 -x -2m -1 -1c -2g 1 -1p -27 1 -21 -1w 0 -2b -1j 2 -2k -15 3 -2p -m 2 -2r -6 2 -2s a -1 -2p o 2 -2k 11 1 -2g 1c 0 -2c 1i 1 -28 1o 0 -25 1s 0 -24 1s 0 -24 1t 0 -25 1s 0 -25 1r 0 -26 1r 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1r -1 -25 1s 0 -25 1s 0 -25 1s 0 -25 1r 0 -25 1s 0 -25 1s 0',
  melbourne: '-a -d 1r -20 1y 0 -20 1x 1 -20 1y 0 -20 1x 0 -20 1x 0 -1z 1y 1 -20 1x 0 -20 1x 0 -20 1y 1 -20 1x 0 -20 1y 0 -20 1x 0 -20 1x 1 -20 1y 0 -20 1x 0 -21 1x 0 -20 1y 1 -20 1x 0 -20 1x 0 -20 1x 0 -20 1x 0 -20 1y 0 -21 1x 0 -20 1x 0 -20 1x 0 -21 1x 0 -20 1x 0 -20 1x 0 -21 1w 0 -20 1x 0 -21 1x 0 -21 1x 0 -20 1w 0 -21 1x 0 -20 1x 0 -1z 1y 0 -1r 26 0 -t 2m 0 l 2q 0 18 2h 0 15 2j 0 13 2l 0 u 2n 0 l 2p 0 e 2s 0 5 2r 0 -3 2s 0 -b 2s 0 -j 2q 0 -r 2o 0 -y 2m 0 -17 2i 0 -1f 2e 0 -1n 29 0 -1v 22 0 -20 1x 0 -22 1w 0 -22 1v 0 -22 1v 0 -22 1v 0 -23 1v 0 -22 1u 0 -22 1v 0 -23 1v 0 -21 1w 0 -22 1w 0 -21 1w 0 -20 1x 0 -20 1y 0 -1z 1y 0 -1z 1z 0 -1x 1z 0 -1y 20 0 -1w 21 0 -1w 22 0 -1v 22 0 -1u 23 0 -1u 23 0 -1t 24 0 -1t 24 0 -1s 24 0 -1t 25 0 -1s 24 0 -1t 25 0 -1s 24 0 -1s 25 0 -1r 26 0 -1q 26 0 -1p 28 0 -1n 28 0 -1m 29 0 -1k 2b 0 -1i 2c 0 -1h 2d 0 -1g 2d 0 -1h 2e 0 -1g 2d 0 -1g 2d 0 -1h 2d 0 -1g 2d 0 -1h 2d 0 -1g 2e 0 -1g 2d 0 -1f 2e 0 -1f 2e 0 -1d 2f 0 -1c 2f 0 -1b 2h 0 -17 2i 0 -m 2p 0 m 2o 0 1x 20 0 2l 11 0 2q g 0 2q j -8 2p q -9 2p p -6 2p o -5 2q l 0 2q j 0 2q i 0 2q k 0 2o r 0 2j 14 0 25 1s 0 1d 2f 0 n 2p 0 2 2s 0 -9 2r 0 -8 2s 0 -7 2s 0 -6 2r 0 -7 2s 0 -7 2s 0 -8 2s 0 -9 2r 0 -7 2s 0 -7 2s 0 -6 2r 0 -4 2s 2 -1 2s 3 0 2s 6 1 2s 3 -2 2s 0 -7 2s 1 -6 2s 0 r 2n 1 1k 2b 1 20 1x 0 25 1r 0 26 1q 0 27 1q 0 26 1q 0 28 1p 0 27 1p 0 27 1p 0 27 1p 0 28 1p 0 27 1o 0 28 1o 0 29 1o 0 29 1m 0 2b 1k 0 2c 1i 0 2e 1f 0 2g 1b 0 2i 18 0 2j 15 0 2l 12 0 2k 11 0 2m 11 0 2l 10 0 2l 10 0 2l 10 0 2l 11 0 2l 12 0 2k 12 0 2k 13 0 2j 15 0 2j 16 0 2i 17 0 2h 1a 0 2g 1c 0 2e 1e 0 2d 1h 0 2b 1j 0 2a 1m 0 29 1m 0 2h 1a 0 2p -2 1 20 -1w b 1z -1z 5 24 -1t 0 29 -1m 0 2d -1g -2 2h -1b -2 2g -1a -2 2f -1d -2 2i -19 -1 2n -u 0 2q -i 0 2s -8 0 2s -4 0 2s -3 0 2s -5 0 2r -7 0 2s -b -1 2q -h 0 2q -m -1 2o -s 0 2m -x 0 2l -12 0 2i -16 0 2h -1b 0 2e -1f 0 2b -1j 0 29 -1m 0 26 -1r 0 23 -1u 0 1z -1y 0 1w -22 0 1s -25 0 1o -28 0 1j -2b 0 1f -2e 0 19 -2h 0 15 -2j 0 10 -2m 0 u -2n 0 q -2p 0 m -2p 0 l -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2q 0 k -2p 0 k -2q 0 k -2q 0 k -2q 0 l -2q 0 l -2q 0 l -2q 0 l -2p 0 m -2q 0 n -2p 0 n -2p 0 n -2q 0 n -2p 0 m -2q 0 f -2q 0 -5 -2s -5 -1q -24 -1 -2l -y 0 -2q -m 0 -2n -v 0 -2j -14 0 -2f -1e 0 -2a -1k 0 -28 -1p 0 -1t -23 0 -15 -2j 0 -10 -2m 1 -t -2n 1 -m -2q 1 -i -2q 0 -h -2r 0 -g -2q 0 -g -2r 0 -f -2r 0 -g -2r 0 -g -2q 0 -g -2r 0 -g -2r 0 -g -2q 0 -g -2r 0 -g -2r 0 -f -2q 0 -f -2r 0 -e -2r 0 -b -2s 0 -a -2r 0 -7 -2s 0 -3 -2s 0 0 -2s 0 3 -2s 0 6 -2s 0 9 -2r 0 c -2r 0 e -2r 0 g -2r 0 j -2q 0 l -2q 0 o -2p 0 q -2p 0 t -2n 0 v -2n 0 z -2m 0 12 -2k 0 15 -2k 0 17 -2h 0 1a -2h 0 1c -2g 0 1e -2f 0 1f -2e 0 1h -2c 0 1k -2c 0 1l -29 0 1o -28 0 1r -26 0 1t -24 0 1v -22 0 1y -1z 0 20 -1y 0 22 -1v 0 24 -1t 0 24 -1t 0 26 -1r 0 25 -1r 0 25 -1s 0 25 -1s 0 25 -1s 0 24 -1s 0 25 -1t 0 24 -1t 0 24 -1t 0 23 -1t 0 24 -1t 0 24 -1t 0 25 -1s 1 28 -1o 0 2i -18 0 2q -k 0 2r -1 0 2s c 0 2q h 0 2r e 0 2r d 0 2r d 0 2r e 0 2r g 0 2q i 0 2r i 0 2q h 0 2p -k 0 29 -1n 2 21 -1v 2 24 -1t 2 25 -1s 2 25 -1s 5 26 -1r 4 25 -1r 0 26 -1r 0 26 -1q 0 26 -1r 0 27 -1q 0 25 -1r 0 26 -1r 0 25 -1r 0 25 -1s 0 24 -1u 0 23 -1t 0 23 -1u 0 24 -1t 0 26 -1r -2 27 -1p -2 26 -1r -2 22 -1v -4 21 -1w -4 23 -1v -1 22 -1v 0 1x -20 0 1t -24 0 1o -28 0 1m -2a 0 1i -2c 0 1f -2d 0 1d -2g 0 18 -2h 0 12 -2l 0 v -2n 0 t -2o 0 t -2n 0 u -2o 0 u -2n 0 u -2n 0 u -2o 0 u -2n 0 u -2o 0 u -2n 0 t -2n 0 u -2o 0 t -2n 0 u -2o 0 t -2o 0 t -2n 0 s -2o 0 s -2o 0 s -2o -1 r -2p 0 q -2o 0 q -2p 0 p -2o 0 o -2p 0 o -2p 0 n -2q 1 n -2p 0 n -2p 0 n -2q 0 m -2p 0 n -2p 0 k -2q 0 c -2s -1 -1i -25 -2 -2m -10 -1 -2m -y -1 -2l -z 0 -2l -11 0 -2l -11 0 -2l -10 0 -2l -11 0 -2l -10 0 -2l -11 0 -2l -10 0 -2m -11 0 -2k -11 0 -2l -11 0 -2l -12 0 -2k -12 0 -2l -12 0 -2k -12 0 -2l -12 0 -2k -12 0 -2k -14 0 -2k -11 0 -2o -t 0 -2r -e 0 -2s 4 0 -2p n 0 -2k 13 0 -2e 1f 0 -26 1r 0 -1x 20 0 -1o 28 0 -1g 2d 0 -1d 2f 0 -1f 2e 0 -1e 2e 0 -1f 2f 0 -1e 2e 0 -1d 2f 0 -1e 2f 0 -1f 2e 0 -1e 2e 0 -1g 2e 0 -1f 2e 0 -1g 2d 0 -1g 2e 0 -1h 2d 0 -1h 2c 0 -1i 2c 0 -1i 2d 0 -1j 2b 0 -24 1s 0 -2q 5 0 -2a -1i 0 -1s -25 0 -1t -24 0 -1t -24 0 -1t -24 0 -1t -24 0 -1r -25 0 -1r -26 0 -1s -25 0 -1w -21 0 -24 -1t 0 -2e -1f 0 -2l -10 0 -2q -k 0 -2s -4 0 -2r c 0 -2o s 0 -2j 16 0 -2b 1j 0 -26 1r 0 -23 1u 0 -21 1w 0 -20 1x 0 -20 1y 0 -1z 1y 0 -1z 1y 0 -20 1y 0 -20 1x 0 -1z 1y 0 -20 1y 0 -20 1x 0 -20 1y 0 -20 1x 0 -1z 1y 0 -20 1x 0 -20 1y 0 -20 1x 1 -20 1x 0 -20 1y 0 -20 1x 0 -20 1x 0 -20 1y 1 -21 1x 0 -20 1x 0 -20 1x 0 -20 1y 0 -20 1x 0 -20 1x 1 -20 1y 0 -20 1x 0 -20 1x 0 -20 1x 0 -20 1y 1 -20 1x 0 -20 1x 0 -20 1y 0 -21 1x 0 -20 1x 1 -20 1y 0 -20 1x 0',
  shanghai: '1 0 1w -2q -l 0 -2q -l -1 -2q -k 0 -2p -l 0 -2q -l 0 -2q -l 0 -2p -m 0 -2q -l 0 -2p -m 0 -2q -l 1 -2q -m 0 -2p -m 0 -2q -l 0 -2p -m 0 -2q -m 0 -2p -l 0 -2q -m 0 -2p -l 0 -2q -m 0 -2q -l 0 -2p -l 0 -2q -l -1 -2q -l 0 -2p -k 0 -2q -l 0 -2q -l -1 -2q -l 0 -2p -l 0 -2q -l 0 -2q -l -1 -2p -m 0 -2q -l 0 -2p -l 0 -2q -k -1 -2q -j 0 -2q -j 1 -2r -j 0 -2q -k 0 -2p -k 0 -2q -l 0 -2q -m 0 -2p -l 0 -2q -m 0 -2p -m 0 -2q -m 0 -2p -l -1 -2q -l 0 -2q -l 0 -2p -m 0 -2p -n 1 -2r -g 2 -2s -3 -1 -2r 8 -1 -2r f -1 -2p n -1 -2n v -1 -2k 14 0 -2f 1d 0 -2a 1l -2 -24 1t 1 -1w 21 1 -1l 2a 0 -19 2h 0 -x 2m 0 -l 2q 2 -a 2r -1 0 2s 0 a 2r 1 j 2r 0 t 2n 0 14 2j 0 1i 2d -2 1u 22 0 28 1o -1 2j 14 0 2r g 0 2r -3 0 2q -l 0 2l -10 -1 2e -1e 1 20 -1x 1 1c -2f -1 e -2r 1 -s -2n 0 -19 -2i -2 -16 -2i -1 -q -2o 2 -3 -2s 1 v -2m 1 1z -1y 0 2k -12 -1 2p -q 1 2r -9 -1 2n u 0 23 1t 2 1o 28 0 1d 2f -1 13 2k -1 v 2n -1 k 2q 1 a 2r -1 -2 2s 1 -e 2r 0 -o 2p -1 -y 2m 1 -1i 2c 1 -1q 26 0 -1r 26 0 -1s 24 0 -1t 25 0 -1s 24 0 -1s 25 0 -1s 24 0 -1s 25 0 -1s 25 0 -1s 25 0 -1s 25 0 -1s 24 0 -1s 25 0 -1s 25 0 -1s 24 0 -1s 25 0 -1t 24 0 -1t 24 0 -1s 24 0 -1t 24 0 -1t 24 0 -1u 24 0 -1t 23 0 -1t 24 0 -1u 23 0 -1u 23 0 -1t 24 -1 -1q 26 -1 -1k 2b 1 -1b 2g 1 -11 2l -2 -v 2n -1 -v 2n 0 -v 2n 0 -w 2m 0 -w 2n 0 -w 2n 0 -v 2n 0 -w 2m 0 -v 2n 0 -w 2n 0 -v 2n -1 -v 2n 0 -w 2n 0 -v 2n 0 -w 2m 0 -w 2n 0 -w 2n 0 -w 2m 0 -v 2n 0 -t 2o 0 -j 2p 2 19 2h 1 1v 22 1 2e 1c 0 2q -f 1 2d -1f 4 26 -1q 4 27 -1q 0 27 -1p 1 24 -1s -2 21 -1x -1 1v -22 -1 1t -24 -1 1s -25 -2 1q -26 -1 1k -2b -2 1f -2e -1 1d -2f 0 1d -2f 1 1d -2f 0 1d -2f 1 1d -2f 0 1c -2f 0 1d -2g -1 1d -2f 0 1c -2f 0 1d -2f 0 1c -2g 0 1d -2f -1 1d -2f 0 1d -2f 0 1d -2f 0 1e -2f -1 1e -2f 0 1e -2e 1 1g -2d 0 1m -29 1 1v -23 1 22 -1v -1 28 -1n 0 2b -1j 0 2c -1k 0 2g -1a 1 2m -z 0 2o -s -1 2p -k 0 2r -f -1 2r -b 0 2s -5 0 2s 4 0 2r c 0 2q m 0 2n u -1 2k 12 2 2h 19 0 2d 1h 0 29 1n -1 24 1t 1 1y 1z -1 1q 26 -1 1k 2b 2 1c 2f 0 18 2i -1 15 2j 0 15 2j 0 16 2j -1 17 2i 0 17 2i -1 18 2i 0 1b 2g 0 1g 2e 1 1m 29 0 1u 23 1 22 1v 0 29 1n 0 2f 1d 0 2k 13 0 2n t 1 2r h 0 2r 3 0 2s -c 0 2o -o 1 2l -11 1 2g -1d -1 29 -1m -1 21 -1v 0 1u -24 0 1k -2a 0 1b -2g 0 16 -2j -1 15 -2j 0 15 -2j -1 15 -2j -1 16 -2j 0 15 -2j -1 13 -2k 2 1t -23 2 2g -1c 2 2n -s 1 2r -b -4 2p n -1 26 1r 1 1t 23 0 1q 26 0 1r 26 -1 1t 24 0 1r 25 -1 1n 29 1 17 2i 0 g 2q -1 -9 2r -1 -w 2n 3 -19 2h 2 -1e 2f 0 -1g 2d -1 -1f 2e 0 -1g 2e 0 -1f 2d 0 -1f 2e 0 -1f 2e 0 -1f 2e 0 -1e 2e 0 -1e 2f 0 -1e 2e -1 -1e 2f 0 -1f 2e 0 -1e 2f 0 -1e 2e 0 -1f 2e -1 -1f 2e -1 -1f 2e -1 -1f 2d -1 -1g 2e -1 -1f 2e 3 -1f 2e 0 -1g 2d 1 -1f 2e 1 -1f 2e 0 -1f 2e 1 -1e 2e 1 -1f 2e 1 -1e 2f 0 -1e 2e 0 -1e 2f -1 -1e 2e -1 -1e 2f 0 -1d 2f -1 -1e 2e 1 -1e 2f 1 -1d 2f 1 -1e 2e 1 -1f 2e 0 -1f 2e 1 -1f 2e 1 -1f 2e 1 -1c 2g 1 -1j 2b 3 -2c 1c -4 -2n -t -5 -23 -1t -1 -1p -27 1 -1m -29 -2 -1s -25 -3 -26 -1q 3 -2l -10 0 -2r -9 0 -2q h -2 -2j 16 -1 -26 1q 0 -1v 22 1 -1k 2b 1 -1c 2f 1 -12 2l 0 -r 2o -3 -h 2q -1 -5 2s 2 6 2s 0 i 2q 0 v 2n 0 17 2i 2 1j 2b 3 1r 25 2 20 1y 1 27 1p -1 2d 1g 2 2j 16 0 2m x 0 2p n 0 2r e 0 2s 5 1 2s -4 -1 2r -c 0 2q -k 0 2n -t 1 2k -13 0 2g -1c 1 28 -1n 1 25 -1t 0 22 -1u 0 1x -20 0 1p -28 1 1l -2a -1 1j -2b -1 1i -2c 0 1i -2c 0 1h -2d -1 1i -2c 0 1h -2c 0 1i -2d 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2d -1 1h -2c 0 1i -2c 0 1h -2d 0 1i -2c 0 1h -2d 0 1h -2c 0 1h -2d 0 1h -2c 0 1i -2d 0 1h -2d 0 1h -2c 0 1h -2d 0 1h -2c 0 1i -2d -1 1h -2c 0 1h -2d 0 1i -2c 0 1h -2d 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1h -2d 0 1i -2c 0 1i -2c 0 1i -2c -1 1i -2c 0 1i -2c 0 1h -2d 0 1i -2c 0 1h -2d 0 1h -2c 2 1h -2d 1 1h -2d 2 1h -2c 1 1g -2d 2 1h -2e 1 1g -2d 2 1g -2d 1 1h -2d 2 1h -2d 1 1h -2c 2 1h -2d 1 1i -2c 2 1i -2c -2 1i -2c -1 1j -2b -2 1j -2c -2 1k -2b -1 1j -2b -2 1j -2b -1 1k -2b -2 1j -2c -1 1j -2b -2 1j -2c -1 1i -2b -2 1j -2c -1 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1h -2d 0 1h -2c 0 1i -2d 0 1h -2c 0 1h -2d 0 1h -2c 0 1i -2d 0 1h -2c 0 1i -2d 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1j -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2d 0 1i -2c 0 1i -2b 0 1i -2c 0 1i -2c 0 1i -2c 0 1i -2d 0 1h -2d -2 1d -2e 0 15 -2j 6 -13 -2a -2 -2n j 2 -2c 1h 6 -2c 1j 9 -2d 1g 1 -2f 1e -5 -2f 1c -5 -2f 1e -4 -2b 1j -5 -24 1t -1 -1w 21 -1 -1p 27 -1 -1l 2a 0 -1k 2b 0 -1k 2a -1 -1l 2a 0 -1m 2a 0 -1l 2a -1 -1m 2a 0 -1l 29 0 -1m 2a 0 -1l 2a -1 -1l 2a 0 -1m 2a 0 -1l 2a -1 -1l 2a 0 -1l 2a 0 -1l 29 -1 -1l 2a 0 -1m 2a 0 -1l 2a 0 -1l 2a -1 -1l 2a 0 -1m 2a -1 -1l 29 -1 -1m 2a -2 -1m 2a -1 -1r 25 -1 -2o 9 2 -2o -o 2 -2q -l 1 -2p -o 1 -2q -l 1 -2q -k 1 -2p -m 2 -2q -m 1 -2p -n 1 -2p -n 1 -2p -o 0 -2p -o 0 -2p -o 1 -2p -n 0 -2p -o 0 -2q -m 0 -2p -n 0 -2p -m 0 -2q -m 1 -2p -l 0 -2q -m 0 -2q -l 1 -2p -l 0 -2q -k 0 -2q -l 0 -2q -l 0',
  catalunya: '-5 7 1n -1i -2c 0 -1i -2c 0 -1i -2c -1 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 1 -1i -2c 0 -1i -2d 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c 1 -1i -2c 0 -1i -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2d 1 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c -1 -1h -2c -1 -1g -2e 3 -1f -2e 4 -1f -2e -2 -1j -2c -1 -1j -2b -2 -1k -2b -1 -1o -28 -1 -1w -21 -1 -29 -1n -1 -2l -x -1 -2s 0 0 -2r c -4 -2k 12 0 -2c 1k 2 -29 1m 0 -2d 1h -1 -2j 15 0 -2n t -1 -2r f 0 -2s 4 0 -2r -d 0 -2k -11 0 -2d -1h 0 -2a -1l 0 -29 -1n 1 -29 -1n 0 -29 -1n 0 -2a -1l 0 -2a -1l 0 -29 -1n 0 -28 -1o 0 -2a -1l 1 -2g -1a 0 -2m -10 -1 -2n -u 0 -2p -m 0 -2s -e 0 -2r -2 0 -2s 7 0 -2r h 0 -2o p 0 -2n w 0 -2j 15 0 -2d 1h 0 -27 1q 0 -22 1v 0 -1x 20 1 -1s 25 0 -1l 2a 0 -1f 2e 0 -18 2h 0 -12 2l 0 -v 2n -1 -o 2p 0 -i 2q 0 -b 2s 0 -4 2s 0 1 2s 1 6 2r 0 a 2s 0 e 2r 0 j 2q 0 m 2q 0 r 2o 1 v 2n 1 10 2l 1 13 2k 0 17 2j 0 1a 2h 0 1d 2f 0 1g 2d 0 1i 2c 0 1j 2b 0 1j 2c 0 1i 2c 0 1i 2c 0 1h 2d -1 1i 2c 0 1i 2d 0 1i 2c 0 1i 2c 0 1i 2c 0 1i 2c -1 1i 2c 0 1i 2c 0 1i 2d 0 1i 2c 0 1i 2c 0 1i 2c 0 1i 2d -1 1i 2c 0 1i 2c 0 1i 2c 0 1o 28 0 1y 1z 1 2b 1k -1 2l 10 0 2q g 0 2s -3 0 2q -k 0 2m -z 0 2f -1d 0 27 -1o 0 1z -1z -1 1p -27 0 1e -2e 0 14 -2k 0 t -2o 0 i -2q 0 8 -2s -1 -1 -2s 0 -a -2r 1 -k -2q 0 -r -2o 1 -z -2m 2 -16 -2i 0 -1b -2h 0 -1f -2e 0 -1i -2c 0 -1i -2c 0 -1j -2c -1 -1j -2b 0 -1i -2c 0 -1i -2d -1 -1i -2c 0 -1i -2c 0 -1i -2c -1 -1j -2c 0 -1k -2b 0 -1i -2b 0 -1h -2d -1 -1i -2d 0 -1l -2a 0 -1j -2b -1 -1a -2h 1 -t -2n 0 -5 -2s 0 l -2p -1 1c -2f 1 1y -1z 0 2g -1a -1 2q -c 0 2r f 0 2o t 2 2k 12 0 2j 16 0 2j 16 0 2j 15 0 2k 13 0 2k 13 0 2k 13 0 2j 15 0 2k 15 0 2j 14 0 2k 14 0 2k 14 0 2j 14 0 2j 15 0 2i 18 2 2g 1b 2 2c 1i 0 28 1o -1 25 1s 0 23 1u 0 20 1y 0 1w 21 0 1t 24 -1 1q 26 0 1o 29 0 1l 29 -1 1l 2b 0 1j 2c -1 1i 2b 0 1j 2c -1 1j 2b 0 1k 2b -1 1j 2c -1 1f 2e 0 16 2i 1 s 2o 1 6 2r 0 -n 2p 1 -1d 2e 0 -1z 1y 0 -2a 1m -1 -2d 1g 2 -2c 1i 0 -29 1o 0 -24 1s 0 -1z 1z 0 -1n 28 -1 -1c 2g 0 -16 2j 1 -12 2k -1 -12 2l -2 -11 2k -1 -12 2l -1 -12 2l -1 -11 2k -2 -12 2l -1 -12 2k -1 -12 2l -1 -12 2k 1 -13 2k 1 -12 2l 1 -13 2k 2 -13 2k 1 -14 2k 1 -13 2k 1 -11 2l 1 -x 2m 2 -n 2p 0 -d 2r 0 -1 2s -1 9 2s 0 l 2p 0 w 2n 0 16 2j 0 1f 2e 0 1p 27 1 1y 1z 0 26 1q 0 2c 1j -1 2f 1e 0 2g 1a 0 2i 19 0 2i 17 0 2i 18 -1 2i 17 0 2i 17 0 2i 18 0 2i 18 0 2i 18 0 2h 19 0 2i 18 0 2h 19 0 2i 18 0 2h 19 0 2h 19 0 2i 19 0 2h 19 0 2i 19 0 2h 18 0 2h 19 0 2i 19 0 2i 18 0 2h 18 0 2i 19 0 2i 18 1 2h 18 0 2i 18 0 2i 18 1 2i 18 -1 2i 18 0 2h 18 -1 2i 18 0 2i 18 -1 2i 18 0 2h 18 1 2i 18 1 2i 19 1 2h 18 1 2i 18 2 2i 18 1 2i 18 1 2i 17 1 2i 17 1 2i 17 1 2j 16 1 2j 16 2 2i 17 0 2f 1e 1 23 1t 6 1i 2c 2 q 2o 4 -7 2q 6 -1y 1u 5 -2n u -6 -2q m -2 -2p n -1 -2p o -1 -2p o -1 -2q o -2 -2p n -1 -2p m -1 -2p o -1 -2p q -2 -2r 9 -4 -2n -t 0 -2c -1g 3 -29 -1n -1 -28 -1o -4 -2a -1m -4 -2e -1e -6 -2k -14 -2 -2o -r 1 -2r -e 0 -2s -1 0 -2r e 0 -2l z -1 -2c 1i 1 -20 1y 0 -1n 28 0 -19 2h 0 -v 2n 0 -g 2r -1 1 2r 0 g 2r 0 y 2m 0 1g 2d 1 1w 21 1 24 1t 0 27 1q 0 27 1p -1 26 1q 0 27 1q 0 26 1q 0 26 1r 0 26 1q 0 26 1r 0 25 1r 0 26 1r 0 24 1t 0 25 1s 0 23 1u 0 29 1m 0 2m y 5 2r -4 4 2g -18 -1 27 -1q 0 28 -1o -1 2a -1m -1 29 -1m -2 29 -1m -1 29 -1n -1 29 -1n 0 28 -1o 0 27 -1p 0 27 -1p 0 2b -1j -2 2p -b 5 29 1k 2 1t 24 -2 1v 22 -3 2j w 2 2m -x -4 2e -1e 9 2c -1i 5 2c -1j -2 2b -1j -3 2d -1h -2 2d -1h -3 2b -1j -2 29 -1n -1 25 -1t 0 1x -20 -1 1n -28 0 1a -2h 1 10 -2l 0 s -2o 1 g -2r 0 1 -2s 0 -8 -2r -3 -h -2r 1 -r -2o 3 -11 -2l -1 -1c -2g 0 -1g -2d 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 1 -1j -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 1 -1i -2c 0 -1j -2b 0 -1i -2c 0 -1i -2c 0 -1j -2c 0 -1i -2c 0 -1i -2c 1 -1i -2c 0 -1j -2c 0',
  yasmarina: 'n -1g 1w 2r d -1 2r d 0 2r c 0 2r d 0 2s d 0 2r d 0 2r c -1 2r d 0 2r c 0 2r d 0 2r c 0 2s d 0 2r c 0 2r c 0 2r d 0 2r c 0 2r c 0 2s d 0 2r c 0 2r c 0 2r c 0 2r d 0 2s c 0 2r c 0 2r c 0 2r d 0 2r c -1 2r c 0 2s d 0 2r c 0 2r c 0 2r c 0 2r d 0 2s c 0 2r c 0 2r d 0 2r c 0 2r c 0 2q i 0 2h 19 1 1t 23 1 17 2i -1 l 2q 1 1 2r 2 -d 2r 0 -k 2q 0 -m 2q 0 -m 2p 0 -m 2q 0 -l 2p 0 -m 2q 0 -l 2q -1 -l 2p 0 -m 2q 0 -l 2q 0 -m 2p 0 -m 2q 0 -l 2p 0 -n 2q -2 -m 2p -1 -m 2p -1 -m 2q -2 -m 2p 1 -s 2o -4 -14 2k 3 -1o 27 3 -2b 1j 1 -2m z -1 -2n v 0 -2n u -1 -2o t 0 -2n t -1 -2o s 0 -2o t -1 -2m y 0 -2j 15 -1 -2f 1e -1 -29 1m 1 -27 1p 2 -28 1n 0 -27 1p 0 -20 1y 1 -1t 24 1 -1t 24 0 -1s 24 -2 -1n 2a -2 -1d 2e 1 -16 2j 0 -y 2m 0 -o 2p 2 -b 2r 4 -5 2s 2 -4 2s 1 5 2s 1 l 2p 2 w 2n 1 v 2n 0 v 2n -1 v 2n -2 v 2n -3 u 2n -1 s 2o 0 p 2p 1 m 2p -1 k 2q -2 h 2r -2 f 2r 0 c 2r 0 a 2r -1 7 2s 0 4 2s 0 2 2s 0 -2 2s -1 -5 2s 0 -6 2r 0 -8 2s 0 -9 2r 0 -a 2s 0 -a 2r 0 -b 2s 0 -a 2r 1 -a 2r 0 -a 2s 0 -a 2r 0 -9 2s 0 -a 2r 0 -a 2s 0 -b 2r 0 -b 2r 1 -c 2s 0 -8 2r 0 -6 2s 0 -f 2r 0 -1p 21 1 -2p o 0 -2q k 0 -2p n 0 -2f 1c -1 -1s 24 0 -o 2o 4 n 2p -1 13 2j 0 13 2k 0 11 2l -1 11 2l 0 11 2l 0 13 2k 0 14 2k -1 11 2l 0 u 2n -1 k 2q -2 -t 2k 6 -2g 1a -2 -2r -4 0 -2j -14 2 -1y -1y 9 -11 -2l 0 -w -2m 0 -y -2m 0 -y -2m 0 -x -2m -1 -y -2m 0 -y -2m 0 -y -2n 0 -x -2m 0 -y -2m 0 -x -2m -1 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 0 -y -2m -1 -y -2m 0 -x -2n 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m -1 -y -2m 0 -x -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2l 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 0 -y -2m -2 -y -2n -2 -y -2m -2 -x -2m 0 -y -2m 0 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 0 -x -2n 0 -y -2m 0 -x -2m 0 -y -2m 0 -x -2m 1 -y -2m 0 -x -2n 1 -y -2m 1 -x -2m 0 -y -2m 1 -y -2m 0 -y -2m 1 -x -2m 0 -y -2m 0 -y -2m 0 -y -2m -2 -y -2m -3 -x -2n -2 -v -2m -2 -u -2o 0 -r -2o -1 -r -2o 0 -q -2p 0 -r -2o 1 -q -2o 0 -s -2o 0 -s -2o -1 -u -2o 0 -v -2n 0 -w -2m 0 -x -2n 0 -y -2m 0 -y -2m 0 -x -2m 0 -y -2m 1 -x -2m 0 -y -2m 0 -x -2m 0 -y -2n 0 -x -2m 0 -y -2m 1 -x -2m 0 -y -2m 0 -x -2n 0 -x -2m 0 -y -2m 0 -x -2m 1 -y -2m 0 -y -2m 0 -x -2m 0 -y -2n 0 -x -2m 0 -x -2m 1 -w -2n 3 h -2o 1 26 -1l -b 2r -9 1 2r 8 0 2s a 0 2s 6 -1 2r 8 0 2h -x -1 t -2n -2 j -2q 2 m -2q 1 o -2p 2 o -2p 1 p -2p 1 o -2p 0 r -2o 1 s -2o 0 v -2n 0 x -2m 1 z -2m 1 y -2m 2 12 -2k 1 17 -2i 0 1c -2g -2 1f -2e -1 1h -2d -1 1i -2c 0 1k -2a -1 1n -2a 0 1o -27 -1 1s -25 0 1u -23 1 1x -21 0 1z -1y -1 21 -1w 0 22 -1v 0 24 -1t 0 25 -1s 0 25 -1s 0 25 -1s 0 24 -1r -1 25 -1t 0 25 -1s 0 24 -1s 0 25 -1s 0 25 -1s 0 25 -1s 0 25 -1s -1 25 -1r 1 25 -1s 0 25 -1r 0 25 -1s 0 25 -1r 0 25 -1s 0 25 -1s 1 26 -1r 0 25 -1r 0 25 -1s 0 26 -1r 0 25 -1s 0 24 -1s 0 24 -1t 0 24 -1t 0 25 -1s 0 26 -1q 0 28 -1o 0 29 -1m 0 2b -1k 0 2c -1j 0 2b -1j 0 2b -1j 0 2c -1j 0 2c -1j 0 2b -1i 0 2d -1i 0 2d -1g 0 2d -1g 0 2f -1e 0 2f -1d 0 2g -1b -1 2g -1b 0 2h -19 -1 2h -1a 0 2h -19 0 2i -19 1 2h -19 0 2h -19 0 2i -18 0 2h -19 1 2i -19 0 2h -18 0 2i -18 1 2h -19 0 2i -18 0 2h -19 0 2i -18 1 2h -19 0 2i -18 0 2h -18 0 2i -19 1 2h -19 0 2h -1a 0 2i -15 1 2r -5 1 1p 22 0 r 2o 0 i 2q 0 h 2r 0 t 2n -2 1e 2e -3 25 1r 1 2n u -1 2r 5 0 2s -3 0 2h 16 7 o 2n 0 1 2s 0 2 2s 0 2 2s 0 3 2s 0 3 2r 0 2 2s 0 2 2s 0 0 2s 0 -1 2s 1 -3 2s 0 -4 2s -2 -4 2s -4 -8 2r -4 -1a 2e -1 -2q 5 -1 -2q -j 0 -2r -e 1 -2r -f 0 -2r -g 1 -2r -g 0 -2q -f 0 -2r -d 1 -2s -c 0 -2r -a 1 -2s -9 0 -2r -8 1 -2s -9 0 -2r -9 0 -2s -a 1 -2r -9 0 -2s -a 1 -2r -9 0 -2s -7 1 -2r -9 0 -2s -9 0 -2r -c 1 -2r -e -2 -2r -g -1 -2q -g -2 -2r -e -1 -2s -a -1 -2s 0 0 -2q j 0 -2k 11 1 -2h 1b -1 -2d 1f 0 -2c 1j 0 -2a 1k 0 -2a 1l 0 -2b 1l 0 -2b 1j 0 -2b 1k 0 -2b 1j 0 -2b 1j 0 -2b 1l -1 -2a 1m 0 -26 1q 0 -1z 1y -1 -1j 2b 0 -x 2m 2 -n 2p 0 -k 2q 0 -j 2q -1 -k 2q 0 -k 2q 0 -l 2q -1 -k 2q 0 -j 2q 0 -j 2q -1 -o 2p 0 d 2p 0 2f 19 -6 2r h 1 2r d -1 2r d 0 2r e 0 2r d 0 2r e -1 2r d 0 2r d 0 2r d 0 2r h 0 23 1o 3 s 2o 6 7 2s 2 0 2s -1 1 2s 0 3 2r 0 1 2s 0 2 2s 0 1 2s -1 2 2s 0 2 2s 0 -4 2s -2 -11 2k -6 -2c 1d 3 -2r d -1 -2r g -1 -2q h -1 -2r f -1 -2s 6 0 -2r -9 -1 -2r -g 1 -2r -f 0 -2r -e 0 -2r -c 0 -2r -d 0 -2r -d 0 -2r -d 0 -2r -e 0 -2r -d 0 -2s -d 0 -2r -d 0 -2r -e 0 -2r -d 0 -2r -d 0 -2r -d 0 -2r -d 0 -2r -e 0 -2r -d 0 -2r -d 0 -2r -c 0 -2s -b 1 -2p g 2 -2g 1c 4 -26 1q 3 -1t 24 0 -1g 2d 0 -19 2h 0 -1b 2h 0 -1b 2g 1 -1b 2g 0 -1b 2g 0 -1b 2g 0 -1b 2g 1 -1b 2g 0 -1c 2g 0 -1c 2g 0 -1d 2f -1 -1d 2f 0 -1d 2f 0 -19 2i 0 -11 2l 0 -o 2o -2 -b 2s -1 -8 2r 2 e 2r 7 1j 2a 0 2d 1g -1 2n u 0 2r g 1 2r d 0 2r c 0 2r c 0 2r d 1 2r d 0 2s d 0 2r e 1 2r d 0 2r d 0 2r d 0 2r d -1',
};

/** The packed line, unpacked: `{x, z, half}` in metres. */
export function centreLine(key) {
  // A circuit measured out of OpenStreetMap carries its own line, in pairs
  // rather than triples: the map knows where the road is and almost never how
  // wide, so the width is one number written down beside it instead.
  const real = SURVEYED[key];
  if (real && real.line) {
    // One delta chain, not two. The importer walks the interleaved x, z, x, z
    // sequence subtracting each value from the one before it whichever axis it
    // is, so summing it back gives the values in the same order - and reading it
    // as two independent chains, which is the obvious thing, gave a Monaco two
    // hundred and thirty-one kilometres round.
    const parts = real.line.split(' ');
    const out = [];
    let at = 0;
    for (let i = 0; i < parts.length - 1; i += 2) {
      at += parseInt(parts[i], 36);
      const x = at;
      at += parseInt(parts[i + 1], 36);
      out.push({ x: x / 10, z: at / 10, half: real.width });
    }
    return out;
  }
  const src = LINES[key];
  if (!src) return null;
  const out = [];
  let x = 0;
  let z = 0;
  let h = 0;
  const parts = src.split(' ');
  for (let i = 0; i < parts.length; i += 3) {
    x += parseInt(parts[i], 36);
    z += parseInt(parts[i + 1], 36);
    h += parseInt(parts[i + 2], 36);
    out.push({ x: x / 10, z: z / 10, half: h / 10 });
  }
  return out;
}

/**
 * Buildings and boats, as they were measured off the map.
 *
 * Six numbers a building - which node of the lap it stands nearest, which side,
 * how far off, how wide, how deep, how tall, and which way it faces - and five a
 * boat. Two hundred and fifty-three buildings of Monaco fit in seven kilobytes
 * this way, which is less than one of the screenshots.
 */
export function things(packed, fields) {
  if (!packed) return [];
  return packed.split(' ').filter(Boolean).map((row) => {
    const n = row.split(',').map((v) => parseInt(v, 36));
    const out = {};
    fields.forEach((f, i) => { out[f] = n[i]; });
    out.side = out.side ? 1 : -1;
    if (out.r !== undefined) out.r /= 100;
    if (out.s !== undefined) out.s /= 10;
    return out;
  });
}

/**
 * A packed list of numbers, unpacked. The same base-36 deltas the lines use.
 */
function unpack(src, scale) {
  const out = [];
  let at = 0;
  for (const part of src.split(' ')) {
    at += parseInt(part, 36);
    out.push(at / scale);
  }
  return out;
}

/**
 * The measured height of a circuit, read at any fraction of a lap.
 *
 * Sixteen circuits here have a height profile written by hand, because their
 * survey is flat and there was nothing else to do. The ones that came out of
 * OpenStreetMap have a measured one instead: every point of the lap was put to
 * an elevation service and the answers smoothed until they were a road again,
 * so Monaco's forty-one metres between the harbour and Casino is a measurement
 * rather than a recollection.
 *
 * Read the same way a written profile is, so nothing downstream can tell which
 * kind a circuit has.
 */
export function measured(packed, spacing = 10) {
  const heights = unpack(packed, 10);
  const n = heights.length;

  /**
   * Relaxed until nothing on it is a wall.
   *
   * A terrain model does not know about roads. It knows about the ground, and in
   * a town as vertical as Monaco the ground twenty metres either side of the
   * climb to Casino is a building or a retaining wall - so the profile that
   * comes back has a median gradient of five per cent and spikes of
   * twenty-six, which is not a hill, it is a step.
   *
   * Smoothing it away costs the climb: the honest total is forty-four metres and
   * a wide enough average to remove the spikes removes a third of that too. So
   * it is relaxed instead, the same way the drawn circuits' own hills are - each
   * point pulled towards the average of its neighbours, only where the slope is
   * over the cap, until nothing exceeds it. The shape and the total survive; the
   * steps do not.
   */
  const CAP = 0.115;
  for (let pass = 0; pass < 400; pass++) {
    let worst = 0;
    for (let i = 0; i < n; i++) {
      worst = Math.max(worst, Math.abs(heights[(i + 1) % n] - heights[i]) / spacing);
    }
    if (worst <= CAP) break;
    const next = heights.slice();
    for (let i = 0; i < n; i++) {
      const a = heights[(i - 1 + n) % n];
      const b = heights[(i + 1) % n];
      const slope = Math.max(Math.abs(heights[i] - a), Math.abs(b - heights[i])) / spacing;
      if (slope <= CAP) continue;
      next[i] = heights[i] + ((a + b) / 2 - heights[i]) * 0.5;
    }
    for (let i = 0; i < n; i++) heights[i] = next[i];
  }

  return (t) => {
    const at = (((t % 1) + 1) % 1) * n;
    const i = Math.floor(at);
    const f = at - i;
    return heights[i % n] + (heights[(i + 1) % n] - heights[i % n]) * f;
  };
}

/**
 * Which parts of the lap are in a tunnel, as a function of lap fraction.
 *
 * Stored as one character a point, and read back with the ends softened: a
 * tunnel that arrives between one node and the next is a wall, and what actually
 * happens is that the light goes over about thirty metres.
 */
export function tunnels(mask) {
  const n = mask.length;
  const inside = (i) => (mask[((i % n) + n) % n] === '1' ? 1 : 0);
  const SOFT = 3;
  return (t) => {
    const at = Math.round((((t % 1) + 1) % 1) * n);
    let sum = 0;
    for (let d = -SOFT; d <= SOFT; d++) sum += inside(at + d);
    return sum / (SOFT * 2 + 1);
  };
}

/**
 * A height profile, read at any fraction of a lap.
 *
 * Catmull-Rom through the control points and wrapped at both ends, so the
 * gradient at the start line is continuous with the gradient arriving at it.
 * A linear interpolation would give every control point a kink, and a kink in a
 * height profile is a bump you feel at three hundred - the numbers below are
 * two hundred metres apart, which is close enough that a corner would appear at
 * each one of them.
 */
export function profile(points) {
  if (!points || points.length < 2) return () => 0;
  const n = points.length;
  const at = (i) => points[((i % n) + n) % n];
  // Wrapped in lap space: the point before the first one is the last one, a lap
  // earlier.
  const fx = (i) => {
    const wraps = Math.floor(i / n);
    return at(i)[0] + wraps;
  };
  const fy = (i) => at(i)[1];
  return (t) => {
    const u = ((t % 1) + 1) % 1;
    let i = 0;
    while (i < n - 1 && points[i + 1][0] <= u) i++;
    const x1 = fx(i);
    const x2 = fx(i + 1);
    const span = x2 - x1 || 1;
    const s = (u - x1) / span;
    const y0 = fy(i - 1);
    const y1 = fy(i);
    const y2 = fy(i + 1);
    const y3 = fy(i + 2);
    const s2 = s * s;
    const s3 = s2 * s;
    return 0.5 * ((2 * y1) + (-y0 + y2) * s
      + (2 * y0 - 5 * y1 + 4 * y2 - y3) * s2
      + (-y0 + 3 * y1 - 3 * y2 + y3) * s3);
  };
}

/**
 * The circuits, and what makes each of them itself.
 *
 * `land.rise` is how far the ground climbs away from the road at the barrier,
 * `land.roll` how much that wanders round the lap, and `land.plain` where the
 * ground settles once it is far enough away to be scenery. All three are small
 * numbers on purpose: these loops fold back on themselves - Zandvoort's main
 * straight passes within thirty metres of Hugenholtz - so a hillside beside one
 * piece of road is drawn across another, and the only safe hill on a real
 * circuit is a low one.
 */
export const SURVEYED = {
  spa: {
    label: 'SPA-FRANCORCHAMPS',
    blurb: 'Seven kilometres of Ardennes forest with a hundred metres of height '
      + 'in it. Eau Rouge arrives twenty-nine metres below the start line and '
      + 'Les Combes sixty-seven above it, and the climb between them is the '
      + 'whole circuit: whatever you carry over the crest at Raidillon is what '
      + 'you have got for the Kemmel straight.',
    theme: 'ardennes',
    laps: 2,
    // La Source at 0.06, down to Eau Rouge at 0.14, up the Kemmel to Les Combes
    // at 0.34 - the high point - then downhill for the rest of the lap.
    climb: [
      [0.000, 0], [0.056, 4], [0.100, -12], [0.143, -29], [0.186, 7],
      [0.250, 38], [0.343, 67], [0.400, 62], [0.443, 54], [0.471, 45],
      [0.553, 23], [0.600, 16], [0.657, 11], [0.729, -6], [0.800, -2],
      [0.857, 3], [0.900, 2], [0.971, -1],
    ],
    bank: [],
    land: { rise: 7.5, roll: 3.2, plain: -6 },
    scatter: [
      // Walled in on both sides, which is the single fact about the place.
      //
      // The near band is the wall and stays as it was. The far one was almost as
      // dense and is almost entirely hidden behind the near one - it was costing
      // Spa about fifteen hundred triangles a frame to draw trees behind trees,
      // which took the circuit close enough to the frame budget that the loop
      // started alternating one and two simulation steps a frame. That beat is
      // what you see, and it reads as the car shaking.
      { kind: 'spruce', side: 0, from: 19, to: 46, chance: 0.95, s: [0.85, 1.9] },
      { kind: 'spruce', side: 0, from: 40, to: 120, chance: 0.34, s: [1.2, 2.4] },
      { kind: 'pine', side: 0, from: 24, to: 70, chance: 0.12, s: [0.8, 1.4] },
      { kind: 'rock', side: 0, from: 17, to: 25, chance: 0.05, s: [0.6, 1.1] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.1 },
      { at: 0.010, kind: 'screen', side: 1, off: 34, s: 1 },
      { from: -0.030, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.1 },
      { from: -0.014, to: 0.016, every: 0.007, kind: 'stand', side: 1, off: 44, s: 1 },
      // La Source, and the run down to Eau Rouge.
      { at: 0.052, kind: 'stand', side: 1, off: 30, s: 1.2 },
      { at: 0.060, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      // Raidillon: the grandstand on the outside of the crest, and the camping
      // above it, which at Spa is a small town for one weekend a year.
      { at: 0.150, kind: 'tyres', side: 1, off: 17, s: 1.2 },
      { from: 0.170, to: 0.200, every: 0.008, kind: 'stand', side: -1, off: 30, s: 1.3 },
      { from: 0.176, to: 0.212, every: 0.009, kind: 'camper', side: -1, off: 62, s: 1.1 },
      { at: 0.196, kind: 'screen', side: -1, off: 44, s: 1 },
      { at: 0.230, kind: 'balloon', side: 1, off: 130, s: 1.1, lift: 74, r: 0.6 },
      // Les Combes, at the top of the hill.
      { from: 0.330, to: 0.356, every: 0.008, kind: 'stand', side: 1, off: 29, s: 1.1 },
      { from: 0.320, to: 0.352, every: 0.010, kind: 'camper', side: 1, off: 58, s: 1 },
      { at: 0.340, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.366, kind: 'chopper', side: 1, off: 46, s: 1, lift: 40 },
      // Rivage and the long descent through Pouhon.
      { at: 0.443, kind: 'stand', side: -1, off: 28, s: 1 },
      { from: 0.545, to: 0.570, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.2 },
      { at: 0.560, kind: 'screen', side: 1, off: 40, s: 0.9 },
      { at: 0.600, kind: 'camper', side: -1, off: 70, s: 1.1 },
      // Fagnes, Stavelot, and back through the trees.
      { at: 0.660, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.735, kind: 'stand', side: -1, off: 28, s: 1 },
      { at: 0.745, kind: 'tyres', side: 1, off: 17, s: 1.2 },
      { at: 0.820, kind: 'camper', side: 1, off: 66, s: 1 },
      // The Bus Stop, and the pit lane wall back to the line.
      { from: 0.960, to: 0.988, every: 0.007, kind: 'stand', side: -1, off: 28, s: 1.1 },
      { at: 0.972, kind: 'tyres', side: 1, off: 17, s: 1.4 },
    ],
  },

  monza: {
    label: 'MONZA',
    blurb: 'The fastest circuit there is, and the flattest: six metres of height '
      + 'over five and three quarter kilometres, three chicanes and two Lesmos '
      + 'in the way of four straights. The concrete curve rotting in the trees '
      + 'along the Serraglio is the old banked oval, which they stopped using in '
      + 'nineteen sixty-one and never quite got round to removing.',
    theme: 'park',
    laps: 3,
    // Almost nothing, and what there is runs downhill to Lesmo and back up
    // through Ascari. Written out rather than zeroed because a circuit with no
    // gradient at all reads as a drawing.
    climb: [
      [0.000, 0], [0.169, -1], [0.249, -3], [0.350, -5], [0.447, -4],
      [0.497, -3], [0.600, 0], [0.683, 4], [0.750, 3], [0.890, 0], [0.950, 0],
    ],
    bank: [],
    land: { rise: 3.5, roll: 1.6, plain: -3 },
    scatter: [
      // The Royal Park: broadleaf, dense, and right up to the barrier.
      { kind: 'oak', side: 0, from: 18, to: 44, chance: 0.9, s: [0.9, 1.7] },
      { kind: 'oak', side: 0, from: 38, to: 110, chance: 0.36, s: [1.2, 2.2] },
      { kind: 'pine', side: 0, from: 22, to: 80, chance: 0.1, s: [0.9, 1.5] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 32, s: 1.2 },
      { at: 0.012, kind: 'screen', side: 1, off: 36, s: 1.1 },
      // The main straight, which at Monza is a grandstand on both sides for
      // most of its length.
      { from: -0.040, to: 0.040, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.2 },
      { from: -0.022, to: 0.030, every: 0.007, kind: 'stand', side: 1, off: 46, s: 1.1 },
      { at: 0.030, kind: 'balloon', side: -1, off: 120, s: 1, lift: 66, r: 2.2 },
      // Rettifilo.
      { at: 0.160, kind: 'tyres', side: 1, off: 17, s: 1.5 },
      { at: 0.172, kind: 'stand', side: -1, off: 29, s: 1.1 },
      // Roggia and the Lesmos.
      { at: 0.350, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.445, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.500, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.505, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      // The Serraglio, with the old banking curving away through the trees.
      // Two of them, because from the road you see it arrive and leave.
      { at: 0.560, kind: 'banking', side: -1, off: 52, s: 1.3, r: -0.5 },
      { at: 0.586, kind: 'banking', side: -1, off: 44, s: 1.3, r: -0.15 },
      { at: 0.612, kind: 'banking', side: -1, off: 48, s: 1.2, r: 0.25 },
      { at: 0.575, kind: 'screen', side: 1, off: 42, s: 0.9 },
      // Ascari.
      { at: 0.676, kind: 'tyres', side: 1, off: 17, s: 1.4 },
      { from: 0.680, to: 0.702, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.1 },
      { at: 0.700, kind: 'chopper', side: -1, off: 50, s: 1, lift: 38 },
      // Parabolica, which is a grandstand round the whole outside of it.
      { from: 0.876, to: 0.918, every: 0.007, kind: 'stand', side: -1, off: 31, s: 1.2 },
      { at: 0.890, kind: 'tyres', side: -1, off: 18, s: 1.6 },
      { at: 0.905, kind: 'screen', side: 1, off: 38, s: 1 },
    ],
  },

  suzuka: {
    label: 'SUZUKA',
    blurb: 'The only figure of eight anybody races on: the run down to Degner '
      + 'crosses the back straight on a bridge, twenty metres above it. Forty '
      + 'metres of climb through the Esses, everything downhill from Dunlop to '
      + 'the hairpin, and a ferris wheel over the infield that tells you where '
      + 'you are without looking at anything.',
    theme: 'japan',
    laps: 3,
    // The crossing is at 0.439 and 0.849 of the lap, which the survey settles
    // and this profile has to respect: the first has to be well above the
    // second or the two roads meet in mid-air. It is, by twenty-one metres.
    climb: [
      [0.000, 0], [0.075, 3], [0.151, 10], [0.210, 19], [0.275, 28],
      [0.300, 33], [0.395, 40], [0.423, 36], [0.478, 20], [0.504, 4],
      [0.551, 9], [0.619, 16], [0.683, 11], [0.780, 18], [0.856, 12],
      [0.900, 7], [0.955, 3],
    ],
    bank: [],
    land: { rise: 4.5, roll: 2.2, plain: -5 },
    scatter: [
      { kind: 'pine', side: 0, from: 19, to: 50, chance: 0.55, s: [0.8, 1.5] },
      { kind: 'oak', side: 0, from: 26, to: 96, chance: 0.5, s: [0.9, 1.7] },
      { kind: 'rock', side: 0, from: 17, to: 24, chance: 0.04, s: [0.5, 1] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.15 },
      { at: 0.014, kind: 'screen', side: 1, off: 34, s: 1 },
      { from: -0.034, to: 0.034, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.2 },
      { from: -0.016, to: 0.022, every: 0.008, kind: 'stand', side: 1, off: 44, s: 1 },
      // The wheel, on the infield where it can be seen from half the lap. It is
      // at the amusement park behind the main straight, and it is the thing
      // everybody draws when they draw Suzuka.
      { at: 0.040, kind: 'wheel', side: 1, off: 78, s: 1.5 },
      { at: 0.062, kind: 'block', side: 1, off: 96, s: 2.4, r: 0.2 },
      // Turn 1 and 2, then the Esses climbing away.
      { at: 0.150, kind: 'stand', side: -1, off: 30, s: 1.1 },
      { at: 0.158, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { from: 0.200, to: 0.290, every: 0.014, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.250, kind: 'balloon', side: -1, off: 110, s: 1, lift: 70, r: 1.1 },
      // Dunlop, at the top.
      { at: 0.390, kind: 'stand', side: -1, off: 29, s: 1.1 },
      { at: 0.398, kind: 'screen', side: -1, off: 40, s: 0.9 },
      // The crossover. The bridge carries this road; the back straight goes
      // under it at 0.849, which is why the profile above puts them apart.
      { at: 0.439, kind: 'bridge', side: 0, off: 0, s: 1 },
      // The hairpin, at the bottom.
      { from: 0.494, to: 0.516, every: 0.007, kind: 'stand', side: 1, off: 28, s: 1.15 },
      { at: 0.504, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.520, kind: 'chopper', side: 1, off: 44, s: 1, lift: 36 },
      // Spoon.
      { at: 0.678, kind: 'stand', side: 1, off: 29, s: 1 },
      { at: 0.690, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      // 130R and the Casio triangle.
      { at: 0.856, kind: 'tyres', side: 1, off: 18, s: 1.2 },
      { from: 0.944, to: 0.972, every: 0.007, kind: 'stand', side: -1, off: 28, s: 1.15 },
      { at: 0.958, kind: 'screen', side: 1, off: 38, s: 1 },
    ],
  },

  zandvoort: {
    label: 'ZANDVOORT',
    blurb: 'Four and a bit kilometres through the dunes with the North Sea over '
      + 'the top of them. Two of the corners are dished - Hugenholtz and the '
      + 'last one, both at eighteen degrees - and a banked corner is not '
      + 'scenery: you go round it faster, so the lap is shorter for it.',
    theme: 'dunes',
    laps: 3,
    // Tarzan sits low by the paddock, the middle of the lap climbs into the
    // dunes as far as Scheivlak, and the rest of it comes back down.
    // Written twice. The first attempt had the right total - seventeen metres,
    // which is what the place has - spread evenly over fourteen points three
    // hundred metres apart, and from the cockpit it was flat. The camera looks
    // at a point twenty-six metres up the road, so a steady gradient is a
    // gradient you have already pitched down to meet: what you see of a hill is
    // where it changes, not how much of it there is.
    //
    // So the same height is spent differently. The climb out of Hugenholtz
    // through Hunserug is made to happen over four hundred metres instead of a
    // kilometre, and Scheivlak gets what Scheivlak is famous for - a crest at
    // the top of the circuit with the road falling away behind it, ten metres
    // in a hundred and fifty, which you arrive at flat out and cannot see over.
    climb: [
      [0.000, 0], [0.055, -1], [0.100, -3], [0.140, -2], [0.176, 1],
      [0.210, 7], [0.250, 13], [0.300, 17], [0.360, 20], [0.405, 21],
      [0.440, 11], [0.470, 7], [0.500, 5], [0.545, 4], [0.605, 3],
      [0.660, 5], [0.735, 9], [0.800, 13], [0.850, 12], [0.905, 6],
      [0.950, 2],
    ],
    // The dished corners, in degrees, and how much of a lap each one lasts.
    // Tarzan is the mildest of the three and the other two are the ones that
    // were rebuilt for it.
    bank: [
      { at: 0.100, deg: 14, span: 0.028 },
      { at: 0.176, deg: 18, span: 0.026 },
      { at: 0.905, deg: 18, span: 0.030 },
    ],
    // The North Sea, off the outside of the main straight and Tarzan, which is
    // the stretch that genuinely runs along the beach. Everywhere else the dunes
    // are between you and it, which is the honest arrangement: at Zandvoort you
    // hear the sea for most of a lap and see it for a fifth of one.
    land: {
      rise: 6, roll: 4.2, plain: -4, sea: { at: 0.03, span: 0.13, level: -9 },
    },
    scatter: [
      // Sand, marram and very little else. The dunes are the reason the place
      // is blind: you cannot see the next corner over the top of them.
      { kind: 'dune', side: 0, from: 22, to: 60, chance: 0.7, s: [0.8, 1.5] },
      { kind: 'dune', side: 0, from: 50, to: 130, chance: 0.55, s: [1.2, 2.2] },
      { kind: 'marram', side: 0, from: 17, to: 60, chance: 0.8, s: [0.7, 1.5] },
      { kind: 'pine', side: 0, from: 34, to: 90, chance: 0.1, s: [0.6, 1.1] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 28, s: 1.1 },
      { at: 0.012, kind: 'screen', side: 1, off: 32, s: 1 },
      { from: -0.040, to: 0.040, every: 0.006, kind: 'stand', side: -1, off: 26, s: 1.2 },
      { from: -0.020, to: 0.026, every: 0.008, kind: 'stand', side: 1, off: 42, s: 1.1 },
      // The sea, off the outside of the main straight and Tarzan, which is the
      // part of the circuit that is genuinely on the beach. Turbines on the
      // horizon beyond it.
      { from: -0.060, to: 0.120, every: 0.020, kind: 'turbine', side: -1, off: 300, s: 2.2 },
      { from: -0.050, to: 0.110, every: 0.030, kind: 'boat', side: -1, off: 210, s: 2 },
      { at: 0.020, kind: 'pavilion', side: -1, off: 74, s: 1.2 },
      { at: 0.070, kind: 'pavilion', side: -1, off: 88, s: 1 },
      // Tarzan, banked, with the crowd all the way round the outside of it.
      { from: 0.086, to: 0.118, every: 0.007, kind: 'stand', side: -1, off: 27, s: 1.25 },
      { at: 0.100, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      // Hugenholtz, the other dished one.
      { from: 0.166, to: 0.190, every: 0.008, kind: 'stand', side: 1, off: 27, s: 1.1 },
      { at: 0.176, kind: 'screen', side: 1, off: 38, s: 0.9 },
      { at: 0.200, kind: 'balloon', side: 1, off: 100, s: 1, lift: 58, r: 1.7 },
      // Out into the dunes, where there is nothing but sand and the odd stand.
      { at: 0.300, kind: 'stand', side: -1, off: 30, s: 1 },
      { at: 0.410, kind: 'stand', side: 1, off: 29, s: 1 },
      { at: 0.420, kind: 'chopper', side: -1, off: 46, s: 1, lift: 34 },
      { at: 0.545, kind: 'tyres', side: 1, off: 17, s: 1.2 },
      { at: 0.610, kind: 'stand', side: -1, off: 28, s: 1 },
      { at: 0.740, kind: 'stand', side: 1, off: 28, s: 1 },
      { at: 0.745, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      // Arie Luyendijk, dished, and the run onto the straight.
      { from: 0.890, to: 0.926, every: 0.007, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.905, kind: 'tyres', side: -1, off: 18, s: 1.4 },
      { at: 0.950, kind: 'pavilion', side: -1, off: 70, s: 1.1 },
    ],
  },

  silverstone: {
    label: 'SILVERSTONE',
    blurb: 'A wartime airfield with a circuit painted on it: flat, wide open and '
      + 'faster than anywhere else that is not Monza. Copse is barely a corner at '
      + 'the speed it is taken, and Maggotts, Becketts and Chapel are five '
      + 'direction changes in fifteen seconds with nothing to hit and everything '
      + 'to lose.',
    theme: 'downs',
    laps: 3,
    // Fifteen metres over six kilometres, which is what an airfield is. Written
    // out anyway: a circuit with no gradient in it reads as a drawing, and the
    // little there is arrives at Copse and leaves again at Stowe.
    climb: [
      [0.000, 0], [0.069, 3], [0.152, 7], [0.178, 6], [0.250, 2],
      [0.339, -3], [0.370, -1], [0.450, 3], [0.530, 8], [0.615, 10],
      [0.661, 6], [0.712, 2], [0.800, -2], [0.864, -5], [0.938, -2],
      [0.970, -1],
    ],
    bank: [],
    land: { rise: 3, roll: 1.4, plain: -3 },
    scatter: [
      // Grass, and a long way of it. The trees are a boundary rather than a
      // wall - you can see across most of this circuit, which is half of why it
      // feels as fast as it is.
      { kind: 'oak', side: 0, from: 46, to: 130, chance: 0.4, s: [1.0, 2.0] },
      { kind: 'pine', side: 0, from: 60, to: 140, chance: 0.18, s: [0.9, 1.6] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 34, s: 1.3 },
      { at: 0.014, kind: 'screen', side: 1, off: 40, s: 1.1 },
      { from: -0.036, to: 0.036, every: 0.006, kind: 'stand', side: -1, off: 30, s: 1.25 },
      { from: -0.020, to: 0.026, every: 0.007, kind: 'stand', side: 1, off: 48, s: 1.1 },
      { at: 0.040, kind: 'balloon', side: 1, off: 130, s: 1.1, lift: 70, r: 0.9 },
      // Abbey and Village.
      { at: 0.069, kind: 'tyres', side: -1, off: 18, s: 1.3 },
      { from: 0.146, to: 0.184, every: 0.009, kind: 'stand', side: -1, off: 30, s: 1.15 },
      { at: 0.178, kind: 'screen', side: -1, off: 42, s: 0.9 },
      // Brooklands, Luffield and the old pit straight, which is a grandstand
      // most of the way round.
      { from: 0.334, to: 0.386, every: 0.007, kind: 'stand', side: 1, off: 29, s: 1.2 },
      { at: 0.345, kind: 'tyres', side: -1, off: 18, s: 1.2 },
      { at: 0.376, kind: 'screen', side: -1, off: 40, s: 1 },
      // Copse.
      { from: 0.520, to: 0.548, every: 0.008, kind: 'stand', side: -1, off: 31, s: 1.2 },
      { at: 0.530, kind: 'tyres', side: -1, off: 19, s: 1.4 },
      { at: 0.560, kind: 'chopper', side: 1, off: 50, s: 1, lift: 40 },
      // Maggotts, Becketts, Chapel: nothing to hit, which is the point of them.
      { from: 0.610, to: 0.716, every: 0.020, kind: 'stand', side: 1, off: 34, s: 1 },
      { at: 0.680, kind: 'balloon', side: -1, off: 150, s: 0.9, lift: 60, r: 2.4 },
      // Stowe, Vale and Club.
      { from: 0.856, to: 0.880, every: 0.008, kind: 'stand', side: -1, off: 30, s: 1.2 },
      { at: 0.864, kind: 'tyres', side: -1, off: 18, s: 1.4 },
      { from: 0.936, to: 0.966, every: 0.007, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.950, kind: 'screen', side: 1, off: 40, s: 1 },
    ],
  },

  interlagos: {
    label: 'INTERLAGOS',
    blurb: 'Four and a third kilometres the other way round, in a bowl, with '
      + 'forty metres of height in it. The start line is at the top: turn one '
      + 'drops away from under you and everything from Junção to the flag is one '
      + 'long climb back up, which is why the last corner here decides more races '
      + 'than the first one.',
    theme: 'brasil',
    laps: 3,
    // The one circuit here that runs anticlockwise, which is worth knowing when
    // reading this: the outside of a corner is the other side.
    //
    // Down from the line into the Senna S, low round the lake, lower still at
    // Junção, and then eleven hundred metres of climb at nearly four per cent.
    climb: [
      [0.000, 0], [0.040, 2], [0.084, -8], [0.146, -18], [0.250, -26],
      [0.332, -35], [0.400, -32], [0.468, -28], [0.544, -30], [0.569, -33],
      [0.641, -36], [0.701, -38], [0.757, -40], [0.820, -28], [0.880, -16],
      [0.938, -6], [0.970, -2],
    ],
    bank: [],
    land: { rise: 8, roll: 4, plain: -6 },
    scatter: [
      // A city circuit in a hollow, with the city up the sides of it.
      { kind: 'palm', side: 0, from: 22, to: 70, chance: 0.3, s: [0.9, 1.5] },
      { kind: 'oak', side: 0, from: 30, to: 90, chance: 0.35, s: [0.9, 1.7] },
      { kind: 'block', side: 0, from: 90, to: 220, chance: 0.5, s: [1.6, 4.2] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.15 },
      { at: 0.012, kind: 'screen', side: 1, off: 36, s: 1 },
      { from: -0.040, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.25 },
      { from: -0.022, to: 0.020, every: 0.007, kind: 'stand', side: 1, off: 44, s: 1.1 },
      // The Senna S, where the road falls away.
      { from: 0.076, to: 0.104, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.084, kind: 'tyres', side: 1, off: 17, s: 1.4 },
      { at: 0.120, kind: 'balloon', side: -1, off: 120, s: 1, lift: 64, r: 1.4 },
      // Round the lake.
      { at: 0.332, kind: 'tyres', side: 1, off: 17, s: 1.3 },
      { at: 0.360, kind: 'stand', side: -1, off: 30, s: 1 },
      { at: 0.468, kind: 'stand', side: 1, off: 29, s: 1 },
      { at: 0.520, kind: 'chopper', side: -1, off: 46, s: 1, lift: 36 },
      // Bico de Pato and Mergulho.
      { at: 0.641, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.660, kind: 'stand', side: 1, off: 28, s: 1.1 },
      // Junção, and the climb.
      { from: 0.748, to: 0.772, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.757, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.800, kind: 'screen', side: -1, off: 40, s: 1 },
      { from: 0.900, to: 0.960, every: 0.010, kind: 'stand', side: -1, off: 30, s: 1.15 },
    ],
  },

  spielberg: {
    label: 'RED BULL RING',
    blurb: 'The shortest lap of the eight and the steepest: nine corners in four '
      + 'and a third kilometres, with sixty metres of Styrian hillside between '
      + 'the start line and turn three. It is over in a little more than a '
      + 'minute, and most of that minute is spent going up or coming down.',
    theme: 'alps',
    laps: 3,
    // Up from the line to turn three at about five per cent, and down again the
    // rest of the way. Sixty-two metres, on a lap of four kilometres, which is
    // the most height per metre of road anywhere in this game.
    climb: [
      [0.000, 0], [0.104, 12], [0.200, 32], [0.320, 58], [0.400, 52],
      [0.510, 40], [0.560, 30], [0.635, 18], [0.701, 10], [0.747, 6],
      [0.820, 2], [0.879, -2], [0.925, -4], [0.970, -2],
    ],
    bank: [],
    land: { rise: 11, roll: 5.5, plain: -8 },
    scatter: [
      // Spruce up the hillsides, thinning towards the top of the circuit.
      { kind: 'spruce', side: 0, from: 22, to: 60, chance: 0.5, s: [0.9, 1.9] },
      { kind: 'spruce', side: 0, from: 55, to: 150, chance: 0.4, s: [1.2, 2.6] },
      { kind: 'crag', side: 0, from: 70, to: 170, chance: 0.05, s: [2, 5] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.1 },
      { at: 0.012, kind: 'screen', side: 1, off: 36, s: 1 },
      { from: -0.038, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.2 },
      { from: -0.018, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 44, s: 1.05 },
      // Turn one, at the bottom, and then the climb.
      { from: 0.096, to: 0.120, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.15 },
      { at: 0.104, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.180, kind: 'balloon', side: 1, off: 120, s: 1.1, lift: 78, r: 0.4 },
      // Turn three, at the top of everything.
      { from: 0.310, to: 0.336, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.2 },
      { at: 0.320, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.340, kind: 'screen', side: 1, off: 40, s: 0.9 },
      { at: 0.360, kind: 'chopper', side: 1, off: 48, s: 1, lift: 42 },
      // Down the hill again.
      { at: 0.510, kind: 'stand', side: -1, off: 30, s: 1 },
      { at: 0.520, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      { at: 0.635, kind: 'stand', side: 1, off: 29, s: 1 },
      { from: 0.870, to: 0.934, every: 0.010, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { at: 0.925, kind: 'tyres', side: -1, off: 18, s: 1.3 },
    ],
  },

  montreal: {
    label: 'GILLES VILLENEUVE',
    blurb: 'An island in the St Lawrence, flat as the water round it, and lined '
      + 'with concrete from end to end. There is no run-off here worth the name: '
      + 'the hairpin is nineteen metres across and the wall on the exit of the '
      + 'last chicane has taken enough front wings off world champions to have '
      + 'been given a name.',
    theme: 'island',
    laps: 3,
    // Five metres, on an island. Almost nothing, and written out anyway.
    climb: [
      [0.000, 0], [0.080, -1], [0.230, 0], [0.470, 2], [0.620, -1],
      [0.800, 0], [0.900, 2], [0.960, 1],
    ],
    bank: [],
    // The one number here that changes how it drives: two metres from the kerb
    // to the wall instead of six. Everywhere else in this game a mistake costs
    // you the corner; here it costs you the car.
    land: {
      rise: 2.5, roll: 1.2, plain: -3, runoff: 2,
      sea: { at: 0.42, span: 0.16, level: -4 },
    },
    scatter: [
      // Parkland along the island, and the river beyond it.
      { kind: 'oak', side: 0, from: 14, to: 44, chance: 0.7, s: [0.9, 1.8] },
      { kind: 'oak', side: 0, from: 40, to: 100, chance: 0.45, s: [1.1, 2.1] },
      { kind: 'pine', side: 0, from: 20, to: 70, chance: 0.15, s: [0.9, 1.5] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 24, s: 1.1 },
      { at: 0.012, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.036, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 22, s: 1.2 },
      { from: -0.016, to: 0.022, every: 0.008, kind: 'stand', side: 1, off: 38, s: 1.05 },
      // Virage Senna.
      { at: 0.080, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { from: 0.072, to: 0.096, every: 0.008, kind: 'stand', side: 1, off: 23, s: 1.1 },
      // Out along the water, where the city is on the far bank.
      { from: 0.380, to: 0.470, every: 0.022, kind: 'block', side: -1, off: 240, s: 5 },
      { at: 0.420, kind: 'boat', side: -1, off: 150, s: 2.4 },
      { at: 0.450, kind: 'boat', side: -1, off: 190, s: 2 },
      { at: 0.430, kind: 'balloon', side: 1, off: 110, s: 1, lift: 60, r: 1.9 },
      // The hairpin, nineteen metres across.
      { from: 0.612, to: 0.634, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.2 },
      { at: 0.620, kind: 'tyres', side: 1, off: 13, s: 1.4 },
      { at: 0.640, kind: 'screen', side: 1, off: 32, s: 0.9 },
      { at: 0.660, kind: 'chopper', side: -1, off: 44, s: 1, lift: 34 },
      // The last chicane, and the wall on the exit of it.
      { at: 0.900, kind: 'tyres', side: -1, off: 13, s: 1.5 },
      { at: 0.916, kind: 'tyres', side: 1, off: 13, s: 1.5 },
      { from: 0.930, to: 0.970, every: 0.008, kind: 'stand', side: -1, off: 22, s: 1.2 },
    ],
  },

  monaco: {
    label: 'MONACO',
    blurb: 'Three and a third kilometres of public road with a barrier bolted '
      + 'down each side, forty-four metres of hill in it, and a tunnel. Nothing '
      + 'about this circuit was written by hand: the road is the road '
      + 'OpenStreetMap has, the height was measured at every point of the lap, '
      + 'and the tunnel is where the map says the tunnel is.',
    theme: 'riviera',
    laps: 3,
    // Measured rather than authored. See docs/CIRCUITS.md and
    // tools/import-osm.js for where each of these numbers came from.
    osm: true,
    // OpenStreetMap almost never says how wide a road is, so this is the one
    // number about the road itself that is still written down. Monaco is nine
    // to eleven metres across, which is the narrowest of the twenty.
    width: 5.2,
    metres: 3562,
    line: '13p -lz mu -ph qh -t1 v1 -wy z6 -10t 12x -14q 165 -18i 18t -1bk 1by -1ep 1f7 -1hx 1if -1l6 1lp -1of 1ox -1ro 1s6 -1uw 1ve -1y4 1ym -21d 21x -24n 25b -280 28f -2b5 29s -2c4 29s -2b9 294 -2at 2av -2dm 2eb -2h0 2hu -2kh 2lf -2o1 2p0 -2rm 2sr -2va 2wh -2yz 309 -32q 345 -36j 385 -3af 3c6 -3eb 3g7 -3i8 3kb -3m6 3of -3q1 3si -3tt 3wb -3xi 400 -418 43f -452 45z -48l 47u -4af 481 -49e 46q -47h 44t -45k 42v -43m 40w -41d 3yl -3yu 3w2 -3w0 3td -3sl 3qs -3oq 3od -3ln 3kz -3ia 3h4 -3el 3d0 -3aq 38y -36t 359 -32y 31h -2z4 2xm -2va 2tv -2rh 2q7 -2nq 2ml -2k2 2j9 -2gl 2fv -2d7 2cg -29r 28y -26b 25i -22u 222 -1ze 1ym -1vy 1v7 -1si 1rr -1p3 1od -1lo 1kz -1ia 1hp -1f0 1ei -1br 1bb -18k 184 -15e 14y -127 11t -z2 yq -vy vm -sv sm -pu pm -mv mn -jv jn -gv gn -dv dq -az at -81 83 -5b 5e -2m 2s 0 7 2l -28 4z -4m 7e -6t 9i -8v bl -as df -cl f9 -e7 gr -f7 hh -fx i8 -gm iw -gh hj -es f8 -ci d4 -ad ar -80 8e -5n 61 -3a 3o -x 1b 1g -12 3t -3e 65 -5r 8i -83 av -aj da -cx fo -f8 hy -hi k9 -js mj -m3 ou -og r7 -qt tk -t7 vy -vk yc -xz 10q -10d 134 -12r 138 -148 134 -15o 18c -17z 1aq -1ab 1cy -1dh 1fx -1h9 1jz -1jz 1mp -1m7 1n9 -1ky 1ky -1i6 1k1 -1if 1l6 -1kp 1ng -1n0 1pq -1p8 1rz -1rh 1u7 -1tp 1wg -1vz 1yp -1y8 20z -20j 238 -22j 258 -24j 277 -26h 294 -288 2av -29z 2cm -2bq 2eb -2da 2fr -2eh 2gy -2fo 2i5 -2gv 2jc -2i3 2kk -2jb 2ls -2ki 2mz -2lq 2o6 -2mu 2p9 -2nv 2q8 -2or 2r2 -2pj 2rt -2q7 2se -2qp 2sw -2r6 2ta -2rh 2ti -2rm 2tm -2ro 2tm -2rn 2ti -2rg 2ta -2r6 2sx -2qs 2sg -2q8 2rv -2pm 2r5 -2ot 2qa -2nx 2pc -2my 2oa -2lu 2n3 -2km 2lt -2jb 2ke -2ht 2iu -2ga 2h8 -2em 2fh -2ct 2dm -2az 2bn -28y 29l -26v 27f -24p 255 -22e 22r -200 20b -1xk 1xr -1uz 1v4 -1sc 1sh -1pp 1pu -1n2 1n6 -1ke 1kj -1hr 1hv -1f3 1f8 -1cg 1cf -19n 183 -15y 138 -12u 104 -10k xx -yr w6 -x8 xv -xl 106 -z6 11u -111 13s -13k 15q -17a 18b -1av 1b7 -1dy 1du -1gm 1gh -1j9 1j5 -1lx 1ls -1ok 1of -1r7 1r2 -1tu 1to -1wf 1w6 -1yy 1ym -21d 20y -23p 237 -25y 25d -283 27e -2a3 29d -2c1 2b7 -2du 2cx -2fk 2ek -2h5 2g3 -2io 2hi -2k1 2iu -2lc 2k1 -2mh 2l3 -2ni 2m3 -2oh 2my -2pa 2np -2pz 2ob -2qj 2ot -2r0 2p9 -2re 2pi -2rk 2po -2rp 2pq -2rp 2po -2rk 2ph -2rb 2p6 -2qy 2or -2qg 2o7 -2pu 2nj -2p3 2mr -2o9 2lv -2nb 2kw -2m9 2js -2l2 2il -2ju 2hc -2il 2g4 -2he 2ex -2g6 2dp -2ez 2ci -2ds 2ba -2ch 29u -2aq 283 -28z 26d -279 24l -25f 22q -23e 20p -21e 1yo -1z8 1wi -1wz 1u8 -1up 1ry -1sg 1pq -1q7 1nh -1nz 1l8 -1lp 1iy -1jf 1gp -1h6 1ef -1ex 1c6 -1ck 19t -1a5 17e -17r 14z -15b 12k -12w 105 -10i xq -y3 vc -vq sz -tc ql -qy o7 -ol lu -m8 jh -jx h6 -hn ex -fd cm -d3 ac -ao 7w -88 5h -5x 36 -3k t -17 -1k 16 -3x 3j -6a 5w -8n 89 -b0 am -dd cz -fr fz -il jf -h7 iu -ga hb -en ff -hh ha -k2 jp -mg m3 -ou og -qv pl -qm o3 -oj ls -m6 jf -jw h5 -ga h1 -fh hr -g7 ii -gq it -g4 gn -dw ed -bn c7 -9g 9u -73 7i -4r 55 -2e 2s -1 f 2c -1y 4q -4c 73 -6p 8a -8x 7s -aa 7o -8c 5k -5x 36 -3i r -14 -1o 1b -42 3p -69 5a -6y 4s -65 3q -4y 2g -3n 14 -25 -f -f -29 1h -45 3h -66 5o -8f 83 -au ao -dg df -g7 gb -j3',
    height: 'v -6 -5 -5 -4 -3 -2 0 0 0 0 0 2 3 2 2 3 2 2 3 2 2 6 0 0 -2 -2 -3 -2 -2 -2 -3 -4 -3 -4 -8 5 3 4 4 4 4 4 4 d 7 8 8 7 2 2 3 2 2 2 3 -2 -b -3 -4 4 3 4 4 4 0 0 0 0 4 4 4 3 -3 -4 -3 -3 -4 1 1 1 1 0 1 e e e d e d d d d p q p c 0 -1 -1 -1 -1 4 4 4 4 -9 -8 -9 8 8 8 7 8 8 3 0 1 1 1 1 0 -2 -2 -3 -3 -3 -3 -3 -1 0 -1 -1 -1 -5 -6 -5 -5 -5 -5 -4 -9 -a -9 -9 f e j f f e f e f j b b b -d -e -d -8 -9 4 -5 -5 -6 -5 3 3 3 3 3 3 2 1 -j -a -a -a -a -a -a -a -i -h -i -g -g -8 -8 -7 -8 -6 -6 -7 -6 2 1 d e d d 1 2 1 0 0 -1 -2 -1 -2 -d -d -d -d -2 6 7 6 6 8 7 8 8 g g i h i a a a a a a a j b -1 -4 -3 -3 -3 -3 -3 5 6 5 6 -4 -4 8 9 d d d -b -a -k -j -f -e -f -e -f -f -j -e -f 9 9 a 9 5 6 5 5 6 5 6 3 3 3 3 3 3 2 0 -1 -1 -1 -1 0 -m -m -n -n -k -k -g -f -g -h -g -f -d 7 a b a 8 6 4 3 4 4 1 -3 -5 -8 -a -a -8 -7 -5 -5 -2 -1 -2 -2 -1 0 -1 -1 -2 -4 -6 -7 -7 -9 -8 -6 -2 -1 0 1 2 0 0 -3 -1 -2 -1 -3 -3',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111111111111111111111111000000110000110000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '15,0,4e,q,p,9,a 16,0,58,26,1f,9,gv 1c,0,55,b,c,9,cb 15,0,4y,r,t,9,90 1c,0,51,c,9,9,4 1c,0,58,7,e,9,cq 1d,0,4l,q,15,d,6z 1a,0,4p,h,1b,9,w 16,0,4b,1f,18,9,83 1a,0,4a,j,n,a,7y 1c,0,45,j,r,d,8j 1d,0,44,t,13,d,71 1c,0,3l,j,1s,d,h1 1a,0,34,h,p,d,h7 19,0,3u,8,f,9,d2 16,0,3o,k,h,9,8f 7t,1,1q,q,r,9,dc 7l,1,2u,25,z,9,5v 2j,0,4x,h,c,16,1z 2i,0,4j,r,b,1f,1h 7u,1,2l,m,i,d,63 3f,0,2u,10,k,d,fd 7w,1,20,c,z,9,m 3i,0,33,a,a,d,2k 8q,1,2g,l,d,9,dv 2f,0,2y,f,d,9,ai 2f,0,1l,7,b,d,8n 8l,1,54,f,d,a,d7 8r,1,38,n,b,q,1m 35,0,3h,o,n,28,4p 28,0,46,8,9,d,8o 2l,0,2p,d,a,q,5y 2f,0,1c,3,d,d,8n 8l,1,t,a,a,a,dd 22,0,3b,e,m,9,4h 1v,0,50,6,6,d,4q 2f,0,27,7,a,a,h9 3c,0,3o,k,f,j,bq 5q,0,43,1e,q,6,7a 2f,0,3i,b,9,j,aj 8m,1,z,7,9,g,4q 1w,0,3s,7,9,d,4m 8l,1,3i,o,w,g,8w 21,0,2i,8,a,9,4k 5q,0,1n,f,z,29,5j 1w,0,4j,c,c,d,4v 2f,0,2p,6,6,a,5y 89,1,10,o,1h,q,8c 2g,0,2f,b,9,d,1r 28,0,4k,8,9,d,21 5q,0,55,s,a,w,35 24,0,50,9,g,g,d5 8q,1,25,d,8,a,ds 1u,0,4y,7,a,d,de 8s,1,1k,y,f,1f,aj 2f,0,p,b,b,t,cx 2m,0,29,g,a,q,eo 20,0,4e,7,8,d,4m 26,0,50,c,a,g,1y 8p,1,44,b,k,j,1i 8q,1,2u,6,d,6,ga 2j,0,1j,j,h,d,1i 29,0,58,h,e,m,ao 2d,0,49,8,9,a,1x 5q,0,4v,f,a,9,br 2f,0,12,7,b,d,8n 21,0,4y,h,h,9,1 1u,0,3d,9,8,9,dc 2l,0,n,f,n,1f,8q 8q,1,55,8,6,a,4u 7e,1,2s,10,v,a,8g 2e,0,59,q,j,z,1x 3f,0,4h,o,f,9,be 21,0,4h,a,e,d,4l 39,0,3k,o,h,t,7h 8p,1,3p,g,i,j,a0 5q,0,40,1f,10,6,77 1v,0,2b,o,t,9,4p 8q,1,49,j,f,w,4v 27,0,47,9,a,d,8p 1u,0,4k,9,a,d,4t 2f,0,4h,h,f,z,a6 7k,1,54,l,q,1y,ej 5q,0,3w,c,b,6,2q 1v,0,3a,8,b,9,94 2i,0,3l,g,d,d,1s 1z,0,4f,8,8,d,d9 28,0,4s,b,8,d,1x 8q,1,2s,6,7,9,eo 2l,0,1z,t,6,a,a9 1y,0,x,v,19,19,6 5q,0,51,p,e,j,34 29,0,49,c,b,a,1x 2g,0,1t,c,b,a,ai 2e,0,3w,d,b,g,al 8l,1,1b,q,b,j,b 1z,0,4t,9,9,d,d5 1w,0,3o,9,c,9,4n 8l,1,53,b,b,6,4b 8n,1,2a,u,14,9,h1 1z,0,3h,h,h,9,c 2h,0,25,a,a,a,62 8q,1,2j,a,7,9,ea 2f,0,2o,9,a,a,hb 2h,0,34,g,b,m,ae 8q,1,36,8,e,9,gh 5q,0,3v,e,d,6,fu 20,0,4c,9,c,d,8x 2e,0,1v,7,9,d,6 8p,1,3u,c,e,j,5s 8r,1,4j,d,k,m,3z 8o,1,w,9,c,j,dg 1v,0,3j,7,9,9,b 26,0,4c,9,b,g,4b 7v,1,4z,f,g,9,en 8q,1,2f,9,a,j,fm 1x,0,4j,c,h,j,4p 2c,0,4k,a,a,j,eo 37,0,2v,c,e,9,82 1u,0,3o,c,b,9,d 2m,0,k,8,b,9,4c 8q,1,4m,c,b,a,cy 25,0,4b,9,c,g,8t 2o,0,4t,i,8,12,9y 8n,1,4o,b,e,g,c3 8p,1,2u,9,9,a,e8 8o,1,59,d,h,t,c6 2m,0,4a,n,c,m,a0 7o,1,40,1b,1f,j,1h 5q,0,1t,c,k,9,5c 5u,0,4i,i,n,9,bo 5s,0,4u,e,d,9,5p 5p,1,3r,g,g,9,ea 5q,0,59,m,y,9,6b 5q,0,3x,e,i,9,en 5r,0,2s,g,m,9,17 8q,1,2v,k,c,9,f9 15,0,4n,9,8,9,de 1d,0,4c,h,i,9,7l 1b,0,56,8,c,9,hf 17,1,g,b,g,9,4 24,0,2y,h,p,q,4h 6q,0,t,13,14,d,8f 4j,1,4s,21,24,9,51 5m,1,52,5,8,3,cp 5m,1,3p,3,4,3,cz 52,0,4x,14,1g,6,9i 45,0,k,u,11,9,8y 5q,1,14,e,p,q,5a 6m,1,2s,2i,1e,6,8r 3w,0,27,l,j,a,en 7o,1,1p,p,j,a,gp 8u,0,h,o,o,1m,g6 14,0,25,2v,47,9,bk 1e,0,4b,3,4,9,1i 1e,0,3h,6,8,9,ei 7k,1,z,1b,r,9,4b 3a,0,2a,h,13,d,9a 1o,0,4k,q,12,9,g 1i,0,12,b,b,9,h1 1o,0,25,k,t,9,9t 2b,0,k,d,r,d,8m 24,0,1j,g,14,9,4i 81,1,36,9,9,9,7k 28,0,3a,f,m,9,8n 26,0,23,9,b,9,8f 2b,0,2v,j,v,d,48 1r,0,54,b,c,d,49 1r,0,4n,a,a,d,d0 1s,0,4l,8,8,d,4g 1r,0,58,c,e,d,49 1q,0,1k,b,9,d,8u 1q,0,1w,5,9,d,94 1q,0,21,6,9,d,e 1q,0,2b,a,b,d,93 1r,0,2n,8,9,d,96 1q,0,2x,7,9,d,96 1r,0,36,7,7,d,93 1r,0,3j,8,b,d,dc 1r,0,3x,8,a,d,d3 1r,0,1g,a,d,9,4f 1r,0,21,9,b,d,4d 1r,0,2q,c,h,d,4e 1r,0,3l,d,n,d,d5 1e,0,1q,z,14,9,d 1n,0,z,11,o,9,h3 21,0,21,d,d,9,6 1r,0,t,9,b,9,d8 1y,0,2h,4,5,9,fd 1y,0,2p,3,3,9,b 7o,1,i,e,1f,9,4 3h,0,j,h,i,9,8l 7s,1,d,b,m,9,2 3d,0,d,h,u,9,8m 8p,1,4p,9,7,a,4g 8l,1,2a,7,e,d,9b 3b,0,4b,9,8,9,ga 12,0,3q,5,6,9,67 83,1,2x,a,a,9,80 43,1,2q,13,23,9,4l 27,0,29,8,c,9,47 2a,0,1e,g,m,q,8d 27,0,y,a,k,1f,8z 5m,1,37,12,11,6,51 5k,1,32,15,15,1q,9v 1d,0,4q,8,6,9,de 1e,0,4g,e,j,9,50 4f,0,1b,8,7,9,7l 5q,0,33,s,p,6,2x 8m,1,3w,b,c,j,8r 5n,1,34,k,u,9,57 2l,0,1a,e,9,9,1g 81,1,1a,5,b,6,8y 1m,0,3o,r,m,d,9g 1j,0,35,i,o,d,6n 19,0,3t,c,f,d,0 18,0,3q,f,d,9,dc 1b,0,45,4,5,9,ct 1r,0,45,5,5,d,8w 3x,0,2q,k,n,9,el 3y,0,2a,r,v,9,h3 8p,1,4t,h,i,a,hf 8q,1,59,7,7,6,6f 5m,1,4k,3,3,3,9v 1u,0,j,b,e,9,1 1u,0,14,j,10,j,db 2k,0,30,f,f,g,1u 5q,0,3z,r,g,9,76 22,0,4a,b,f,9,4h f,1,p,3,4,a,2 28,0,1c,b,e,9,8e 2i,0,2m,d,5,9,aq 2a,0,2d,f,i,j,8f 2f,0,3r,a,5,9,1u 27,0,k,5,9,9,d1 24,0,l,a,h,9,4 66,1,u,i,9,9,1e 14,0,t,i,h,9,2t 40,0,32,7,9,9,5u 7y,1,1l,h,10,9,9 3r,1,g,3,4,9,h1 3f,0,4v,6,9,9,6c 76,1,56,3,3,9,79 75,1,46,c,b,9,7h 5l,1,4r,29,1a,d,2s 5l,1,1w,h,e,9,fu 5m,1,3g,b,b,9,dp 64,0,29,y,w,1q,9j 5m,1,2j,3,3,9,9b 5m,1,32,3,3,9,2z 4u,1,n,6,7,9,2y 1p,0,2w,9,c,9,9g 5m,1,r,3,4,9,t',
    boats: '5m,1,4l,r,75 5m,1,3f,12,g8 5f,1,30,k,6w 5k,1,3j,s,7s',

    bank: [],
    // Barriers where the pavement is, which is the whole character of the place.
    land: { rise: 5, roll: 2.4, plain: -5, runoff: 1.6,
      sea: { at: 0.02, span: 0.10, level: -6 } },
    scatter: [
      // Almost nothing scattered: what is beside this road is the town, and the
      // town is measured. A few palms along the front is all that is invented.
      { kind: 'palm', side: 0, from: 14, to: 34, chance: 0.16, s: [0.9, 1.4] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 22, s: 1 },
      { at: 0.012, kind: 'screen', side: 1, off: 26, s: 0.9 },
      { from: -0.030, to: 0.026, every: 0.007, kind: 'stand', side: -1, off: 20, s: 1.1 },
      { at: 0.070, kind: 'tyres', side: -1, off: 12, s: 1.3 },
      { at: 0.300, kind: 'tyres', side: 1, off: 12, s: 1.3 },
      { at: 0.520, kind: 'tyres', side: -1, off: 12, s: 1.3 },
      { at: 0.780, kind: 'tyres', side: 1, off: 12, s: 1.3 },
      { at: 0.870, kind: 'chopper', side: -1, off: 44, s: 1, lift: 40 },
      { from: 0.930, to: 0.970, every: 0.008, kind: 'stand', side: -1, off: 20, s: 1.1 },
    ],
  },

  austin: {
    label: 'AUSTIN',
    blurb: 'Five and a half kilometres of Texas built out of other circuits, and '
      + 'the borrowing is the good part. Turn one is thirty metres straight up '
      + 'and blind over the top; the esses that follow are Maggotts and Becketts '
      + 'with the brakes taken off. It runs anticlockwise, which most of it does '
      + 'not tell you until you are in it.',
    theme: 'texas',
    laps: 3,
    // The climb to turn one is the circuit: thirty-three metres, most of it in
    // the last hundred, arriving at a corner you cannot see into.
    climb: [
      [0.000, 0], [0.040, 4], [0.075, 12], [0.100, 24], [0.119, 33],
      [0.160, 26], [0.220, 17], [0.300, 11], [0.398, 6], [0.471, -4],
      [0.550, 4], [0.620, 12], [0.687, 9], [0.729, 5], [0.780, 3],
      [0.838, 7], [0.900, 4], [0.972, 1],
    ],
    bank: [],
    land: { rise: 5, roll: 3, plain: -5 },
    scatter: [
      // Scrub oak and open ground. Nothing tall enough to hide behind, which is
      // how a circuit in a field ends up feeling this big.
      { kind: 'oak', side: 0, from: 34, to: 110, chance: 0.35, s: [0.8, 1.6] },
      { kind: 'rock', side: 0, from: 24, to: 70, chance: 0.08, s: [0.6, 1.3] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 32, s: 1.2 },
      { at: 0.014, kind: 'screen', side: 1, off: 38, s: 1.1 },
      { from: -0.036, to: 0.032, every: 0.006, kind: 'stand', side: -1, off: 29, s: 1.2 },
      { from: -0.018, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 46, s: 1.05 },
      // The climb, and the tower at the top of it.
      { from: 0.104, to: 0.134, every: 0.008, kind: 'stand', side: 1, off: 30, s: 1.25 },
      { at: 0.119, kind: 'tyres', side: 1, off: 18, s: 1.4 },
      { at: 0.130, kind: 'block', side: -1, off: 70, s: 4.2, r: 0.2 },
      { at: 0.150, kind: 'screen', side: -1, off: 44, s: 1 },
      { at: 0.170, kind: 'balloon', side: -1, off: 130, s: 1.1, lift: 76, r: 1.2 },
      // The esses.
      { from: 0.160, to: 0.396, every: 0.028, kind: 'stand', side: 1, off: 34, s: 1 },
      { at: 0.300, kind: 'chopper', side: -1, off: 50, s: 1, lift: 42 },
      // Turn eleven, at the end of the long one.
      { from: 0.462, to: 0.486, every: 0.008, kind: 'stand', side: 1, off: 29, s: 1.2 },
      { at: 0.471, kind: 'tyres', side: 1, off: 18, s: 1.4 },
      // The hairpins on the far side.
      { at: 0.729, kind: 'tyres', side: -1, off: 18, s: 1.3 },
      { at: 0.780, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      { from: 0.720, to: 0.790, every: 0.018, kind: 'stand', side: -1, off: 30, s: 1.05 },
      { from: 0.930, to: 0.972, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.15 },
    ],
  },

  sakhir: {
    label: 'BAHRAIN',
    blurb: 'Desert, and the only circuit here that is run in the dark: the sun is '
      + 'already on the horizon when the lights go out and it is night by the '
      + 'flag, whatever the menu says. Four heavy braking zones, a great deal of '
      + 'nothing in between, and floodlights all the way round.',
    theme: 'desert',
    laps: 3,
    // Always at dusk, and that is not a setting. Bahrain starts in the evening
    // and finishes in the dark, so this circuit turns the sunset on for itself
    // and the menu switch has no say in it.
    dusk: true,
    // Seventeen metres of desert, most of it a slow rise to the far side of the
    // circuit and back.
    climb: [
      [0.000, 0], [0.136, 3], [0.285, 8], [0.420, 13], [0.506, 15],
      [0.639, 11], [0.710, 6], [0.790, 2], [0.880, -1], [0.960, -1],
    ],
    bank: [],
    land: { rise: 4, roll: 2.4, plain: -4 },
    scatter: [
      // Sand and rock, and the odd palm somebody planted.
      { kind: 'rock', side: 0, from: 20, to: 80, chance: 0.3, s: [0.5, 1.4] },
      { kind: 'crag', side: 0, from: 60, to: 170, chance: 0.06, s: [1.5, 4] },
      { kind: 'palm', side: 0, from: 26, to: 60, chance: 0.1, s: [0.9, 1.4] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 32, s: 1.25 },
      { at: 0.014, kind: 'screen', side: 1, off: 38, s: 1.1 },
      { from: -0.038, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 28, s: 1.25 },
      { from: -0.018, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 46, s: 1.1 },
      // Turn one, which is where the race is won and lost here.
      { from: 0.128, to: 0.152, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.2 },
      { at: 0.136, kind: 'tyres', side: -1, off: 18, s: 1.4 },
      { at: 0.160, kind: 'screen', side: -1, off: 42, s: 1 },
      { at: 0.200, kind: 'balloon', side: 1, off: 130, s: 1, lift: 70, r: 2.6 },
      // Turn four, and the far side.
      { at: 0.285, kind: 'tyres', side: -1, off: 18, s: 1.3 },
      { at: 0.300, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.420, kind: 'tyres', side: -1, off: 18, s: 1.3 },
      { at: 0.440, kind: 'chopper', side: 1, off: 48, s: 1, lift: 40 },
      // Turn ten and eleven, the two lefts on the far loop.
      { at: 0.506, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      { at: 0.639, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      { at: 0.660, kind: 'stand', side: -1, off: 30, s: 1 },
      // The run back.
      { at: 0.765, kind: 'stand', side: 1, off: 29, s: 1.05 },
      { from: 0.900, to: 0.960, every: 0.010, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { at: 0.930, kind: 'screen', side: 1, off: 40, s: 1 },
    ],
  },

  mexico: {
    label: 'MEXICO CITY',
    blurb: 'Two thousand two hundred metres above the sea, which is the whole '
      + 'story: there is a fifth less air here, so the cars go faster down the '
      + 'straight than anywhere in this game and hold on rather less when they '
      + 'get to the end of it. The last corner runs through the middle of a '
      + 'baseball stadium.',
    theme: 'altiplano',
    laps: 3,
    // Thin air, as one number. A fifth less of it is a fifth less drag - this is
    // the fastest trap speed on the calendar and this is why - and a fifth less
    // of everything a wing is for, which a game with no downforce model stands
    // in for by taking a little grip away. It is the only circuit here that
    // changes the car rather than the road.
    air: 0.79,
    // Flat, by the standards of anywhere with a mountain in sight.
    climb: [
      [0.000, 0], [0.226, -3], [0.420, -6], [0.560, -4], [0.700, -1],
      [0.800, 2], [0.882, 4], [0.950, 2],
    ],
    bank: [],
    land: { rise: 4, roll: 2.2, plain: -4 },
    scatter: [
      { kind: 'oak', side: 0, from: 24, to: 80, chance: 0.45, s: [0.9, 1.7] },
      { kind: 'palm', side: 0, from: 20, to: 56, chance: 0.15, s: [0.9, 1.5] },
      { kind: 'block', side: 0, from: 110, to: 230, chance: 0.3, s: [1.8, 4] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.15 },
      { at: 0.012, kind: 'screen', side: 1, off: 36, s: 1 },
      { from: -0.040, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.25 },
      { from: -0.020, to: 0.022, every: 0.008, kind: 'stand', side: 1, off: 44, s: 1.1 },
      // Turn one, at the end of the longest straight of the twelve.
      { from: 0.218, to: 0.242, every: 0.008, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { at: 0.226, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.260, kind: 'balloon', side: 1, off: 120, s: 1, lift: 68, r: 0.8 },
      // The esses and the middle of the lap.
      { at: 0.442, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      { at: 0.470, kind: 'stand', side: 1, off: 29, s: 1 },
      { at: 0.600, kind: 'stand', side: -1, off: 29, s: 1 },
      { at: 0.620, kind: 'chopper', side: 1, off: 46, s: 1, lift: 36 },
      // The stadium: grandstand on both sides, close in, all the way round.
      { from: 0.840, to: 0.900, every: 0.005, kind: 'stand', side: -1, off: 24, s: 1.3 },
      { from: 0.840, to: 0.900, every: 0.005, kind: 'stand', side: 1, off: 24, s: 1.3 },
      { at: 0.855, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.882, kind: 'screen', side: 1, off: 34, s: 0.9 },
    ],
  },

  hungaroring: {
    label: 'HUNGARORING',
    blurb: 'Monaco without the walls, and without the excuse of being Monaco: '
      + 'four and a third kilometres of corner after corner in a natural bowl, '
      + 'with one straight on it and nowhere else to pass. Whoever leads into '
      + 'turn one usually leads out of the last one, which is why qualifying '
      + 'here is worth more than it is anywhere else.',
    theme: 'puszta',
    laps: 3,
    // The start line is at the top of the bowl, turn one drops away, and it
    // climbs back through the last two corners. Thirty-four metres.
    climb: [
      [0.000, 0], [0.070, -6], [0.145, -18], [0.258, -26], [0.306, -30],
      [0.404, -26], [0.465, -22], [0.546, -24], [0.625, -20], [0.712, -14],
      [0.809, -10], [0.870, -6], [0.920, -1], [0.965, 2],
    ],
    bank: [],
    land: { rise: 7, roll: 3.6, plain: -6 },
    scatter: [
      // Dusty grass and low scrub on the slopes of the bowl.
      { kind: 'oak', side: 0, from: 24, to: 84, chance: 0.4, s: [0.8, 1.6] },
      { kind: 'pine', side: 0, from: 36, to: 110, chance: 0.2, s: [0.9, 1.6] },
      { kind: 'rock', side: 0, from: 20, to: 50, chance: 0.06, s: [0.5, 1.1] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 28, s: 1.15 },
      { at: 0.012, kind: 'screen', side: 1, off: 34, s: 1 },
      { from: -0.040, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 26, s: 1.25 },
      { from: -0.020, to: 0.022, every: 0.008, kind: 'stand', side: 1, off: 42, s: 1.1 },
      // Turn one, downhill, and turn two at the bottom of it.
      { from: 0.138, to: 0.162, every: 0.008, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { at: 0.145, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.258, kind: 'tyres', side: 1, off: 17, s: 1.3 },
      { at: 0.200, kind: 'balloon', side: 1, off: 110, s: 1, lift: 62, r: 1.6 },
      // The twisty middle, which is most of the lap.
      { from: 0.300, to: 0.640, every: 0.042, kind: 'stand', side: -1, off: 30, s: 1 },
      { at: 0.465, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      { at: 0.500, kind: 'chopper', side: 1, off: 44, s: 1, lift: 34 },
      { at: 0.625, kind: 'tyres', side: 1, off: 17, s: 1.2 },
      { at: 0.700, kind: 'screen', side: -1, off: 38, s: 0.9 },
      // The last two, and the climb to the line.
      { at: 0.809, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { from: 0.870, to: 0.900, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.920, kind: 'tyres', side: 1, off: 17, s: 1.3 },
      { from: 0.930, to: 0.968, every: 0.008, kind: 'stand', side: -1, off: 27, s: 1.2 },
    ],
  },

  melbourne: {
    label: 'ALBERT PARK',
    blurb: 'A public park with a circuit painted on it for a fortnight a year, '
      + 'round a lake, and quicker than a park has any business being: fourteen '
      + 'corners and most of them taken without much of a lift. The walls are '
      + 'where the pavement is, because the pavement is where the walls are for '
      + 'the other fifty weeks.',
    // The same parkland-by-water as the island at Montreal, and it gets the same
    // colours. Two circuits that are genuinely the same kind of place should not
    // have two tables of nearly identical greens between them.
    theme: 'island',
    laps: 3,
    // Seven metres. It is a park round a lake and it is as flat as that sounds.
    climb: [
      [0.000, 0], [0.210, 2], [0.380, 4], [0.560, 2], [0.720, -1],
      [0.850, 1], [0.950, 0],
    ],
    bank: [],
    // Street furniture where the run-off would be: three metres, between the two
    // an island and a permanent circuit get.
    land: { rise: 3, roll: 1.6, plain: -3, runoff: 3.2,
      sea: { at: 0.62, span: 0.14, level: -3 } },
    scatter: [
      { kind: 'oak', side: 0, from: 16, to: 52, chance: 0.65, s: [0.9, 1.8] },
      { kind: 'oak', side: 0, from: 46, to: 110, chance: 0.4, s: [1.1, 2.1] },
      { kind: 'palm', side: 0, from: 20, to: 60, chance: 0.14, s: [0.9, 1.4] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.15 },
      { at: 0.012, kind: 'screen', side: 1, off: 32, s: 1 },
      { from: -0.038, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 24, s: 1.2 },
      { from: -0.018, to: 0.022, every: 0.008, kind: 'stand', side: 1, off: 40, s: 1.05 },
      { at: 0.209, kind: 'tyres', side: -1, off: 15, s: 1.4 },
      { from: 0.200, to: 0.244, every: 0.010, kind: 'stand', side: 1, off: 25, s: 1.1 },
      { at: 0.260, kind: 'balloon', side: -1, off: 120, s: 1, lift: 66, r: 2.1 },
      // Round the lake, with the city on the far side of it.
      { from: 0.560, to: 0.660, every: 0.024, kind: 'block', side: -1, off: 250, s: 5.5 },
      { at: 0.620, kind: 'boat', side: -1, off: 140, s: 2.2 },
      { at: 0.650, kind: 'boat', side: -1, off: 175, s: 1.8 },
      { at: 0.480, kind: 'tyres', side: 1, off: 15, s: 1.2 },
      { at: 0.560, kind: 'stand', side: -1, off: 25, s: 1 },
      { at: 0.700, kind: 'chopper', side: 1, off: 44, s: 1, lift: 36 },
      { at: 0.786, kind: 'tyres', side: -1, off: 15, s: 1.3 },
      { at: 0.883, kind: 'tyres', side: 1, off: 15, s: 1.3 },
      { from: 0.900, to: 0.966, every: 0.008, kind: 'stand', side: -1, off: 24, s: 1.2 },
      { at: 0.930, kind: 'screen', side: 1, off: 34, s: 1 },
    ],
  },

  shanghai: {
    label: 'SHANGHAI',
    blurb: 'Turn one is two hundred and ninety-seven degrees of right-hander that '
      + 'tightens the whole way round, which nothing else here does at all: you '
      + 'arrive at nearly three hundred, you leave in second, and it is the same '
      + 'corner throughout. Then a kilometre and a quarter of straight, and a '
      + 'twenty metre hairpin at the end of it.',
    theme: 'delta',
    laps: 3,
    // Eight metres, on reclaimed marsh. Flat by construction.
    climb: [
      [0.000, 0], [0.150, 3], [0.300, 5], [0.470, 2], [0.580, 4],
      [0.700, 2], [0.860, -2], [0.950, -1],
    ],
    bank: [],
    land: { rise: 3.5, roll: 1.8, plain: -4 },
    scatter: [
      { kind: 'oak', side: 0, from: 30, to: 90, chance: 0.35, s: [0.9, 1.7] },
      { kind: 'block', side: 0, from: 120, to: 260, chance: 0.35, s: [2, 5] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 34, s: 1.3 },
      { at: 0.014, kind: 'screen', side: 1, off: 40, s: 1.1 },
      { from: -0.036, to: 0.032, every: 0.006, kind: 'stand', side: -1, off: 29, s: 1.25 },
      { from: -0.018, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 46, s: 1.1 },
      // The spiral, which is worth watching somebody else take.
      { from: 0.140, to: 0.180, every: 0.007, kind: 'stand', side: -1, off: 30, s: 1.2 },
      { at: 0.150, kind: 'tyres', side: -1, off: 18, s: 1.5 },
      { at: 0.185, kind: 'screen', side: -1, off: 42, s: 1 },
      { at: 0.220, kind: 'balloon', side: 1, off: 130, s: 1.1, lift: 74, r: 0.5 },
      { at: 0.294, kind: 'tyres', side: -1, off: 18, s: 1.3 },
      { at: 0.310, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.470, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      { at: 0.580, kind: 'stand', side: -1, off: 30, s: 1 },
      { at: 0.600, kind: 'chopper', side: 1, off: 48, s: 1, lift: 40 },
      // The hairpin at the end of the long one.
      { from: 0.872, to: 0.896, every: 0.008, kind: 'stand', side: -1, off: 29, s: 1.25 },
      { at: 0.882, kind: 'tyres', side: -1, off: 18, s: 1.5 },
      { at: 0.900, kind: 'screen', side: 1, off: 40, s: 1 },
      { from: 0.930, to: 0.966, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.15 },
    ],
  },

  catalunya: {
    label: 'CATALUNYA',
    blurb: 'The circuit every team has more data on than any other, because it is '
      + 'where they test. Thirty metres of dry Catalan hillside, a long third '
      + 'sector that punishes a car that will not turn, and a first corner at the '
      + 'top of a climb you spend the whole straight making.',
    theme: 'iberia',
    laps: 3,
    // Up to turn one, up again through turn three, and down to La Caixa which is
    // the bottom of it.
    climb: [
      [0.000, 0], [0.090, 8], [0.182, 14], [0.248, 20], [0.330, 26],
      [0.400, 22], [0.460, 16], [0.550, 10], [0.620, 4], [0.700, -2],
      [0.750, -4], [0.806, 0], [0.862, 6], [0.930, 4], [0.970, 2],
    ],
    bank: [],
    land: { rise: 7, roll: 3.4, plain: -6 },
    scatter: [
      // Dry scrub and umbrella pine on the slopes.
      { kind: 'pine', side: 0, from: 24, to: 90, chance: 0.4, s: [0.8, 1.7] },
      { kind: 'oak', side: 0, from: 30, to: 100, chance: 0.22, s: [0.8, 1.5] },
      { kind: 'rock', side: 0, from: 20, to: 60, chance: 0.1, s: [0.5, 1.3] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 30, s: 1.2 },
      { at: 0.012, kind: 'screen', side: 1, off: 36, s: 1 },
      { from: -0.040, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 27, s: 1.3 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 44, s: 1.1 },
      // Turn one, at the top of the climb.
      { from: 0.174, to: 0.200, every: 0.008, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { at: 0.182, kind: 'tyres', side: -1, off: 17, s: 1.4 },
      { at: 0.210, kind: 'balloon', side: 1, off: 120, s: 1, lift: 70, r: 1.8 },
      { at: 0.248, kind: 'tyres', side: 1, off: 17, s: 1.2 },
      { at: 0.330, kind: 'stand', side: -1, off: 29, s: 1.05 },
      { at: 0.368, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.400, kind: 'chopper', side: 1, off: 46, s: 1, lift: 38 },
      // La Caixa, at the bottom.
      { from: 0.742, to: 0.766, every: 0.008, kind: 'stand', side: 1, off: 28, s: 1.2 },
      { at: 0.750, kind: 'tyres', side: 1, off: 17, s: 1.3 },
      { at: 0.780, kind: 'screen', side: -1, off: 38, s: 0.9 },
      // The last sector, and the climb home.
      { at: 0.806, kind: 'tyres', side: -1, off: 17, s: 1.3 },
      { at: 0.862, kind: 'tyres', side: -1, off: 17, s: 1.2 },
      { from: 0.920, to: 0.968, every: 0.008, kind: 'stand', side: -1, off: 27, s: 1.2 },
    ],
  },

  yasmarina: {
    label: 'YAS MARINA',
    blurb: 'The other one run in the dark, and a very different dark: a marina '
      + 'with boats in it, a hotel built over the road, and the whole thing lit '
      + 'like a showroom. Anticlockwise, five and a half kilometres, and a '
      + 'nineteen metre hairpin at the end of the long straight.',
    theme: 'marina',
    laps: 3,
    // Abu Dhabi runs at dusk into night, like Bahrain, and says so for itself.
    dusk: true,
    // Ten metres, on reclaimed sand beside the water.
    climb: [
      [0.000, 0], [0.120, 3], [0.277, 6], [0.400, 4], [0.539, 2],
      [0.700, -2], [0.830, -3], [0.930, -1],
    ],
    bank: [],
    land: { rise: 3, roll: 1.6, plain: -4,
      sea: { at: 0.80, span: 0.13, level: -3 } },
    scatter: [
      { kind: 'palm', side: 0, from: 18, to: 56, chance: 0.55, s: [0.9, 1.5] },
      { kind: 'block', side: 0, from: 80, to: 200, chance: 0.4, s: [2, 5] },
    ],
    marks: [
      { at: 0.000, kind: 'pit', side: 1, off: 32, s: 1.25 },
      { at: 0.014, kind: 'screen', side: 1, off: 38, s: 1.1 },
      { from: -0.036, to: 0.030, every: 0.006, kind: 'stand', side: -1, off: 28, s: 1.2 },
      { from: -0.018, to: 0.024, every: 0.008, kind: 'stand', side: 1, off: 46, s: 1.1 },
      { at: 0.075, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      // The hairpin at the end of the long straight.
      { from: 0.268, to: 0.292, every: 0.008, kind: 'stand', side: 1, off: 29, s: 1.25 },
      { at: 0.277, kind: 'tyres', side: 1, off: 18, s: 1.5 },
      { at: 0.300, kind: 'screen', side: 1, off: 42, s: 1 },
      { at: 0.330, kind: 'balloon', side: -1, off: 130, s: 1, lift: 72, r: 2.8 },
      { at: 0.500, kind: 'stand', side: 1, off: 30, s: 1 },
      { at: 0.539, kind: 'tyres', side: 1, off: 18, s: 1.2 },
      // The hotel, which is built over the road.
      { at: 0.700, kind: 'bridge', side: 0, off: 0, s: 1 },
      { at: 0.690, kind: 'block', side: -1, off: 60, s: 4.5, r: 0.3 },
      { at: 0.712, kind: 'block', side: 1, off: 58, s: 4, r: -0.2 },
      // The marina, with the water and the boats on the outside.
      { from: 0.760, to: 0.850, every: 0.022, kind: 'boat', side: -1, off: 120, s: 2.4 },
      { at: 0.800, kind: 'buoy', side: -1, off: 70, s: 1 },
      { at: 0.820, kind: 'chopper', side: 1, off: 46, s: 1, lift: 38 },
      { at: 0.874, kind: 'tyres', side: 1, off: 18, s: 1.3 },
      { from: 0.930, to: 0.972, every: 0.008, kind: 'stand', side: -1, off: 28, s: 1.2 },
    ],
  },
};

export const SURVEYED_KEYS = Object.keys(SURVEYED);
