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
export function measured(packed, spacing = 10, flatten = 1) {
  const heights = unpack(packed, 10);
  const n = heights.length;

  /**
   * Where the terrain model is reading roofs, and we know it is.
   *
   * The elevation services are looking at a surface model, not the ground, and
   * in a city dense enough they return the tops of the buildings. Monaco
   * survives that because Monaco genuinely climbs forty metres and the errors
   * are small beside it. Singapore does not: Marina Bay is about five metres
   * above the sea for the whole lap, and what came back was a range of
   * sixty-six with a peak of a hundred and nine.
   *
   * This is the one authored number about a measured circuit's height, and it is
   * one number: how much of the measured range to keep. It scales about the
   * average so the shape of the profile - which is still the map's - survives.
   */
  if (flatten !== 1) {
    const mean = heights.reduce((a, b) => a + b, 0) / n;
    for (let i = 0; i < n; i++) heights[i] = mean + (heights[i] - mean) * flatten;
  }

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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      // The Milan line runs along the western edge of the park.
      { at: 0.760, kind: 'train', side: -1, off: 140, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      // Suzuka has its own railway station - Suzuka Circuit Ino, on the Ise
      // line, a few hundred metres from the back of the circuit.
      { at: 0.640, kind: 'train', side: 1, off: 132, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      // The train, which at Zandvoort is not decoration: the line from Haarlem
      // ends at a station in the dunes beside the circuit, and it is how most of
      // the crowd arrives.
      { at: 0.120, kind: 'train', side: -1, off: 118, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
    metres: 3200,
    line: '3dk -1k5 1jq -1md 1js -1km 1hv -1i6 1fp -1ej 1bz -1az 188 -18n 15w -16b 13k -13y 117 -11k yt -z7 wg -wt u2 -ug rp -s2 pa -po mx -nb kk -kx i6 -ik ft -g7 dg -dv b5 -bn 8x -9e 6m -6y 47 -4k 1t -26 -l 9 -30 2n -5d 4u -6y 58 -6n 49 -5i 31 -48 1p -2t a -17 -1f l -39 2k -59 4o -7e 70 -9r 9g -c7 c6 -ey f2 -hu i8 -kz le -o5 oq -rf t1 -v9 xh -z5 11d -131 14v -16y 17l -1a9 1aj -1da 1ds -1gj 1h1 -1jr 1ka -1n0 1ni -1q9 1qr -1th 1u0 -1wq 1xa -200 20k -23a 23u -26k 276 -29v 29d -2c0 29y -2bs 29c -2an 29r -2c8 2cq -2fg 2g8 -2iw 2ju -2mg 2ne -2q0 2r3 -2tn 2ut -2xc 2yk -311 32e -34u 36c -38o 3ad -3ck 3ed -3gh 3ii -3ke 3mk -3ob 3qo -3s4 3um -3vt 3yb -3zi 41w -43b 44v -472 478 -49x 484 -4a4 47h -48d 45p -46g 43s -44j 41t -42e 3zn -401 3xa -3xd 3um -3ub 3s0 -3qi 3pk -3n1 3mn -3jw 3iy -3gc 3ey -3ck 3at -38n 36y -34r 33a -30y 2zh -2x4 2vm -2t9 2rx -2pi 2oa -2ls 2kv -2i9 2hh -2et 2e4 -2bf 2am -27y 275 -24i 23q -212 20a -1xm 1wu -1u6 1tf -1qq 1q0 -1nc 1mm -1jx 1ja -1gl 1g1 -1db 1cv -1a4 19o -16y 16i -13r 13b -10k 108 -xh x5 -ue u2 -rb r4 -oc o4 -lc l4 -ic i3 -fc f6 -ce c9 -9h 9f -6n 6p -3x 42 -1b 1i 1a -12 3u -3g 67 -5q 8g -7u ak -9u ci -bo ec -dj g7 -fi i6 -ht kk -k4 mv -ma oz -na pe -mp nc -kl ky -i7 ik -ft g6 -gn gb -iy i4 -kk j9 -j7 hp -ey ej -bs bv -94 9i -6r 76 -4f 4t -22 2g b 3 2o -2a 51 -4n 7e -6z 9q -9d c4 -br ei -e4 gv -gf j5 -io lf -kz nq -nb q2 -pn se -s1 us -uf x6 -wt zk -z6 11x -11k 14c -13z 16q -16f 196 -18t 1bk -1b8 1dz -1dm 1gd -1fx 1in -1i5 1kw -1kf 1n6 -1mq 1pg -1oy 1ro -1r7 1ty -1tg 1w6 -1vp 1yg -1xz 20p -208 22y -22a 24y -249 26y -269 28w -280 2an -29r 2cd -2bh 2e3 -2d4 2fl -2eb 2gs -2fj 2hz -2gp 2j6 -2hw 2ke -2j5 2lm -2kd 2mu -2lk 2o0 -2mp 2p4 -2nq 2q3 -2on 2qy -2pf 2rp -2q3 2sb -2qn 2st -2r3 2t8 -2rf 2th -2rm 2tm -2rp 2tn -2ro 2tj -2rh 2tb -2r8 2t0 -2qv 2sj -2qb 2ry -2pp 2r9 -2oy 2qf -2o3 2pj -2n5 2og -2m0 2na -2kt 2m0 -2ji 2km -2i2 2j3 -2gj 2hi -2ew 2fr -2d4 2dy -2ba 2by -299 29w -277 27s -252 25i -22r 235 -20f 20q -1xy 1y6 -1ve 1vk -1st 1sx -1q5 1qa -1ni 1nm -1ku 1kz -1i7 1ic -1fk 1fl -1cu 1c9 -19j 182 -15r 138 -12h zr -109 xm -yi 10y -105 12u -12a 152 -156 175 -18x 193 -1bu 1bq -1ei 1ee -1h6 1h1 -1js 1jo -1mg 1mb -1p3 1oy -1rq 1rl -1ud 1u7 -1wz 1wp -1zg 1z3 -21u 21f -246 23m -26c 25r -28h 27s -2ah 29q -2ce 2bk -2e7 2d9 -2fv 2ev -2hh 2ge -2iy 2hs -2ka 2j2 -2lk 2k9 -2mp 2lb -2nq 2ma -2on 2n3 -2pe 2nt -2q3 2of -2qn 2ow -2r2 2pa -2rf 2pk -2rm 2pp -2rp 2pq -2rp 2pn -2ri 2pf -2r9 2p3 -2qu 2on -2qc 2o3 -2pq 2nf -2oy 2mm -2o4 2lp -2n4 2kp -2m1 2jk -2ku 2id -2jm 2h5 -2ie 2fx -2h7 2eq -2fz 2di -2es 2cb -2dl 2b2 -2c6 29j -2af 27s -28o 262 -26y 24a -253 22e -232 20d -212 1yc -1yv 1w4 -1wl 1tv -1uc 1rl -1s3 1pd -1pu 1n4 -1nm 1kv -1lc 1il -1j1 1gn -1ho',
    height: '5z f g h j j m 3 3 3 3 3 3 -1 -1 -1 0 -1 -1 -3 -8 -7 -8 -p -o -p -l -m -l -m -m -l -m -j -j -j -3 -2 -2 -3 -2 -2 -2 -3 -2 -2 0 0 0 0 0 0 0 2 2 3 2 2 2 3 2 2 3 2 0 0 -2 -3 -2 -2 -3 -2 -2 -2 -4 -4 -4 5 3 4 4 4 4 4 4 d 6 7 8 8 1 3 2 2 3 2 2 -1 -b -4 -4 4 4 4 4 3 4 0 0 0 4 4 4 4 -4 -4 -3 -3 -3 -3 0 1 1 1 1 d e e e d d d d d d q p q c -1 -1 0 -1 -1 -1 -1 0 -1 -d -d -d -d 4 5 4 5 5 4 5 8 7 8 8 7 8 1 1 0 1 1 1 0 -3 -3 -3 -3 -3 -3 -1 -5 -6 -5 -5 -6 -5 -5 -9 -9 -9 -a f f j e f f e f f j j b b -e -d -d -8 -9 4 -5 -6 -5 -5 -6 3 3 4 3 3 3 1 -j -a -a -a -a -a -a -a -i -h -i -i -g -8 -7 -8 -8 -7 -6 -7 -6 2 1 d 2 1 2 2 1 2 0 -2 -1 -2 -2 -1 -d -2 -1 6 6 6 6 8 8 7 8 g g i i i a a a a a a a j -2 -1 -3 -3 -4 -3 -3 -3 6 5 5 6 -4 -d -c -c -c -a -a -a -8 -h -i -j -k -l -2 -3 -5 -7 -8 -a -c 7 7 8 9 a d',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111111111111111111111111000001110111000001111111111111111111111111111111111111111000000000000000000000',
    buildings: '2a,0,4f,q,p,9,16 2c,0,58,26,1f,9,gv 2h,0,55,b,c,9,cs 2a,0,4y,r,t,9,9w 2i,0,51,c,9,9,gq 2i,0,58,7,e,9,bw 2i,0,4k,q,15,d,7q 2g,0,4p,h,1b,9,q 2b,0,4b,1f,18,9,88 2f,0,4a,j,n,a,83 2h,0,45,j,r,d,91 2i,0,44,t,13,d,7s 2i,0,3l,j,1s,d,g7 2f,0,33,h,p,d,hc 2e,0,3u,8,f,9,d6 2c,0,3p,k,h,9,8f 4x,0,1q,q,r,9,4m 55,0,2u,25,z,9,em 3p,0,4x,h,c,16,1y 3o,0,4j,r,b,1f,1f 4w,0,2l,m,i,d,er 4s,0,2u,10,k,d,fd 4u,0,20,c,z,9,9c 4v,0,33,a,a,d,62 40,0,2g,l,d,9,2i 3k,0,2y,f,d,9,am 3k,0,1l,7,b,d,8q 44,1,54,f,d,a,ej 3y,0,38,n,b,q,a6 4i,0,3h,o,n,28,4q 3e,0,46,8,9,d,8m 3r,0,2p,d,a,q,5x 3k,0,1c,3,d,d,8q 44,1,t,a,a,a,ep 37,0,3b,e,m,9,4i 30,0,50,6,6,d,4q 3k,0,27,7,a,a,hc 4p,0,3o,k,f,j,bq 6y,0,4c,1e,q,6,72 3l,0,3i,b,9,j,ai 43,0,z,7,9,g,dg 31,0,3s,7,9,d,4n 44,1,3i,o,w,g,a8 37,0,2h,8,a,9,4j 6y,0,1r,f,z,29,5b 31,0,4j,c,c,d,4w 3l,0,2p,6,6,a,5y 4h,0,10,o,1h,q,h2 3l,0,2f,b,9,d,1s 3e,0,4k,8,9,d,1z 6y,0,5a,s,a,w,2x 3a,0,50,9,g,g,d5 3z,0,26,d,8,a,48 2z,0,4y,7,a,d,df 3x,0,1k,y,f,1f,1s 3k,0,q,b,b,t,d1 3s,0,29,g,a,q,em 35,0,4e,7,8,d,4o 3c,0,50,c,a,g,1y 40,0,43,b,k,j,9i 3z,0,2t,6,d,6,6r 3p,0,1j,j,h,d,1h 3f,0,58,h,e,m,ao 3i,0,49,8,9,a,1y 6y,0,51,f,a,9,bj 3k,0,12,7,b,d,8q 37,0,4y,h,h,9,0 2z,0,3d,9,8,9,dd 3q,0,n,f,n,1f,8u 40,0,54,8,6,a,aw 8l,1,2s,10,v,a,8g 3j,0,59,q,j,z,1x 4s,0,4h,o,f,9,be 37,0,4h,a,e,d,4k 4m,0,3k,o,h,t,7h 41,0,3p,g,i,j,a 6y,0,47,1f,10,6,6z 30,0,2b,o,t,9,4o 3z,0,48,j,f,w,cr 3d,0,47,9,a,d,8p 30,0,4k,9,a,d,4t 3l,0,4h,h,f,z,a5 8r,1,54,l,q,1y,ej 6y,0,42,c,b,6,2i 30,0,3a,8,b,9,94 3n,0,3k,g,d,d,1s 34,0,4f,8,8,d,d9 3d,0,4s,b,8,d,20 3z,0,2t,6,7,9,54 3q,0,1z,t,6,a,ad 33,0,x,v,19,19,7 6y,0,55,p,e,j,2w 3f,0,48,c,b,a,1x 3m,0,1t,c,b,a,af 3k,0,3w,d,b,g,ai 44,1,1d,q,b,j,1m 34,0,4t,9,9,d,d5 32,0,3o,9,c,9,4n 44,1,54,b,b,6,5n 42,0,2a,u,14,9,8b 35,0,3h,h,h,9,a 3n,0,25,a,a,a,62 3z,0,2k,a,7,9,4q 3k,0,2o,9,a,a,hf 3m,0,34,g,b,m,af 3z,0,37,8,e,9,6x 6y,0,40,e,d,6,fl 36,0,4c,9,c,d,8w 3k,0,1v,7,9,d,3 40,0,3u,c,e,j,ds 3z,0,4j,d,k,m,b8 41,0,x,9,c,j,4p 31,0,3j,7,9,9,a 3b,0,4c,9,b,g,4b 4v,0,4z,f,g,9,5x 3z,0,2f,9,a,j,63 32,0,4i,c,h,j,4p 3i,0,4k,a,a,j,em 4l,0,2v,c,e,9,83 30,0,3o,c,b,9,d 3s,0,k,8,b,9,49 40,0,4m,c,b,a,1k 3a,0,4b,9,c,g,8u 3u,0,4t,i,8,12,9z 42,0,4o,b,e,g,3d 41,0,2v,9,9,a,4i 42,0,59,d,h,t,3g 3r,0,4a,n,c,m,a2 51,0,40,1b,1f,j,a7 6y,0,1u,c,k,9,54 6w,1,4i,i,n,9,57 6z,0,4u,e,d,9,5g 6y,0,3r,g,g,9,5d 6y,0,59,m,y,9,63 6y,0,40,e,i,9,ef 6y,0,2s,g,m,9,13 40,0,2v,k,c,9,3v 2a,0,4n,9,8,9,ea 2j,0,4b,h,i,9,6l 2g,0,57,8,c,9,4 2d,1,g,b,g,9,4 3a,0,2y,h,p,q,4h 60,1,t,13,14,d,h9 5s,1,4s,21,24,9,50 71,0,52,5,8,3,2c 71,0,3p,3,4,3,2m 6b,0,4x,14,1g,6,9h 5e,0,k,u,11,9,8y 6y,1,1a,e,p,q,52 7t,1,2s,2i,1e,6,8r 55,0,27,l,j,a,en 52,0,1p,p,j,a,7y 3v,0,g,o,o,1m,e 49,1,c,7,8,9,7t 2a,0,26,2v,47,9,aa 2j,0,4a,3,4,9,24 2j,0,3g,6,8,9,f4 8r,1,10,1b,r,9,4b 4n,0,2a,h,13,d,9a 2t,0,4k,q,12,9,k 2n,0,12,b,b,9,h0 2t,0,25,k,t,9,9x 3g,0,k,d,r,d,8m 39,0,1j,g,14,9,4i 4p,0,36,9,9,9,g8 3e,0,3a,f,m,9,8l 3b,0,23,9,b,9,8g 3h,0,2v,j,v,d,49 2w,0,53,b,c,d,48 2w,0,4n,a,a,d,cy 2x,0,4l,8,8,d,4g 2x,0,58,c,e,d,4b 2v,0,1k,b,9,d,8w 2v,0,1w,5,9,d,96 2w,0,21,6,9,d,c 2w,0,2b,a,b,d,91 2w,0,2n,8,9,d,94 2w,0,2x,7,9,d,95 2w,0,35,7,7,d,92 2w,0,3i,8,b,d,da 2w,0,3x,8,a,d,d1 2x,0,1h,a,d,9,4h 2x,0,22,9,b,d,4f 2x,0,2q,c,h,d,4g 2x,0,3l,d,n,d,d7 2k,0,1q,z,14,9,e 2s,0,y,11,o,9,h6 37,0,21,d,d,9,5 2w,0,t,9,b,9,d7 34,0,2h,4,5,9,fc 34,0,2p,3,3,9,a 51,0,i,e,1f,9,8t 4u,0,j,h,i,9,8l 4x,0,e,b,m,9,8s 4q,0,d,h,u,9,8m 40,0,4p,9,7,a,cg 44,1,2b,7,e,d,an 4o,0,4b,9,8,9,gb 28,0,3q,5,6,9,5a 4n,0,2x,a,a,9,gq 5c,1,2q,13,23,9,4k 3d,0,29,8,c,9,47 3g,0,1e,g,m,q,8d 3c,0,y,a,k,1f,8z 72,0,37,12,11,6,9y 73,0,32,15,15,1q,10 2j,0,4p,8,6,9,ce 2j,0,4g,e,j,9,5l 5o,0,1b,8,7,9,7l 6y,0,38,s,p,6,2p 44,1,3w,b,c,j,a0 6w,1,34,k,u,9,59 3q,0,1b,e,9,9,1k 4p,0,1a,5,b,6,6 2r,0,3o,r,m,d,9i 2p,0,35,i,o,d,6j 2f,0,3t,c,f,d,hd 2e,0,3q,f,d,9,d6 2g,0,44,4,5,9,cy 2w,0,45,5,5,d,8u 56,0,2q,k,n,9,el 8p,1,2a,r,v,9,8e 41,0,4t,h,i,a,7p 40,0,59,7,7,6,ci 71,0,4j,3,3,3,gy 30,0,j,b,e,9,1 2z,0,14,j,10,j,dc 3p,0,30,f,f,g,1u 6y,0,47,r,g,9,6y 37,0,4a,b,f,9,4h 1k,1,p,3,4,a,2 3d,0,1c,b,e,9,8g 3o,0,2m,d,5,9,ao 3f,0,2d,f,i,j,8e 3l,0,3r,a,5,9,1u 3c,0,k,5,9,9,d1 39,0,l,a,h,9,4 7d,1,u,i,9,9,1e 29,0,t,i,h,9,3s 8n,1,32,7,9,9,ek 4s,0,1l,h,10,9,8z 1,0,f,3,4,9,4t 4s,0,4v,6,9,9,6c 8d,1,56,3,3,9,79 8c,1,46,c,b,9,7h 72,0,4q,29,1a,d,9y 72,0,1w,h,e,9,5k 71,0,3g,b,b,9,3c 6m,1,29,y,w,1q,x 71,0,2j,3,3,9,ge 71,0,32,3,3,9,a2 63,1,n,6,7,9,2x 2u,0,2w,9,c,9,9k 72,0,r,3,4,9,5p',
    boats: '1a,0,x,u,em 1a,0,1o,12,em 12,0,1a,x,dk z,0,1s,g,cz 13,0,1p,r,3y 19,0,17,z,6g 1b,0,18,11,4i 29,0,98,g,ch 29,0,93,i,h3 29,0,8s,p,3q 1n,0,2j,v,3a 1o,0,2d,n,1h 1n,0,1y,12,c7 1o,0,z,k,1i 1o,0,1r,i,1i 1o,0,1d,q,a7 29,0,7r,11,cg 29,0,7h,k,cm 29,0,71,l,cm 29,0,6u,s,3w 29,0,5i,j,cj 29,0,66,v,cj 28,0,5x,h,e2 28,0,6l,13,e2 29,0,60,x,3t 29,0,4o,m,ck 28,0,4b,k,e3 28,0,51,11,e3 28,0,4y,q,e3 28,0,5o,12,e3 1n,0,52,p,bv 28,0,57,11,5d 28,0,5e,v,5d 28,0,4l,10,5d 29,0,4t,l,3u 29,0,49,l,3u 1,0,4u,11,4o 1,0,40,z,4o 1,0,4d,h,b 1,0,4u,m,b 8n,0,4g,j,d1 8d,0,1w,13,g 8a,0,22,13,l 5p,1,2v,j,55 5o,1,28,m,n 87,0,1r,q,9e 28,0,r,10,e0 28,0,1m,r,e0 26,0,1q,t,fh 21,0,26,g,9z 28,0,13,12,5a 28,0,20,p,e3 27,0,2c,u,f9 29,0,1e,p,3u 1b,0,26,n,d9 1b,0,2w,x,d9 z,0,2h,q,c2 1a,0,2e,k,5w 1b,0,2l,h,4j 1b,0,1x,o,4j 7,0,s,t,hf 9,0,1e,l,hf 7,0,20,j,hf 9,0,2m,l,hf 3,0,35,k,ft 5t,1,2f,f,p 5r,1,2s,i,e2 5r,1,1z,12,58 5t,1,1p,11,5e 2i,0,8b,13,bz 2i,0,7n,m,bz 2i,0,7i,z,39 2i,0,84,g,39 29,0,2x,r,cg 28,0,2p,z,dy 28,0,3f,m,dy 28,0,2z,h,9n 28,0,3u,r,32 28,0,39,n,58 29,0,2m,x,86 7a,0,1a,w,5d',
    bank: [],
    /**
     * Barriers where the pavement is, and no landscape at all.
     *
     * Every other circuit here gets a bank beside the road and some roll in the
     * ground beyond it, because every other circuit has some. A street does not.
     * Given the usual numbers, Monaco drew hillsides - and because the route
     * folds back on itself with forty-four metres of height in it, the hillside
     * belonging to Casino came across the view at Sainte Dévote as a pale slab
     * at an angle. Held flat and close to the road it reads as what it is:
     * pavement, and then buildings.
     */
    land: { rise: 0.5, roll: 0.3, plain: -1.2, runoff: 1.6, reach: 2,
      sea: { at: 0.02, span: 0.10, level: -4 } },
    scatter: [
      // Almost nothing scattered: what is beside this road is the town, and the
      // town is measured. A few palms along the front is all that is invented.
      { kind: 'palm', side: 0, from: 14, to: 34, chance: 0.16, s: [0.9, 1.4] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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

  jeddah: {
    label: 'JEDDAH',
    blurb: 'Six kilometres of wall down both sides at two hundred and fifty '
      + 'kilometres an hour, which makes it the fastest street circuit '
      + 'there has ever been. Twenty-seven corners and almost none of them '
      + 'ask you to slow down; what they ask is whether you can see far '
      + 'enough past the barrier to know that.',
    theme: 'marina',
    laps: 3,
    dusk: true,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 6.0,
    metres: 6402,
    line: '-ho1 rdl -rcr rff -ree rgz -rf4 rh4 -rej rfe -rcn rcf -ra5 r8o -r86 r90 -r9h rc8 -rcp rfg -rfx rin -rj4 rlv -rmc rp2 -rpj rsa -rsr rvi -rvz ryp -rz6 s1x -s2e s54 -s5l s8c -s8t sbj -sc0 ser -sf8 shz -sig sl6 -slm sod -sot srk -ss0 suq -sv6 sxx -syd t14 -t1f t46 -t4d t75 -t7b ta3 -ta8 td0 -tde tg4 -tia tjv -tmg tnj -tq3 tr5 -ttp tut -txb tyi -u0s u2d -u4g u6a -u88 ua7 -uc2 ue5 -ufm uhy -uj7 ulo -umo up9 -uq1 usp -ut9 uvz -uw9 uz0 -uz3 v1v -v1q v4i -v40 v6r -v64 v8t -v7w vai -v9e vbx -vai vcw -vba vdk -vbu ve0 -vcj vev -vdo vg7 -vf8 vht -vh7 vjx -vjh vm7 -vm0 vos -vox vrp -vs7 vux -vvn vyc -vz2 w1q -w2h w55 -w5w w8l -w9d wc1 -wd0 wfl -wgz wjd -wl8 wnb -wpd wr8 -wth wv3 -wxf wyy -x16 x2t -x4x x6q -x8f xam -xbu xec -xf2 xhq -xi3 xku -xkv xnn -xnl xqd -xqb xt3 -xt1 xvt -xvr xyj -xyh y19 -y19 y41 -y40 y6s -y6q y9i -y96 ybx -yb0 ydm -yce yew -ydf yfr -ydv yfw -yds yfm -yda yeq -yc4 yd4 -yai ybe -y8r y9o -y75 y89 -y5t y76 -y50 y6p -y4v y6z -y5h y7t -y6s y9c -y8o ybd -yb6 ydy -ydl ygc -yfz yir -yic yl2 -ykk ynb -ymq ypg -yor yrf -yqn ytb -ysc yuy -ytx ywi -yve yxy -yww yzg -yyh z13 -z0a z2x -z28 z4x -z4d z73 -z6l z9c -z94 zbv -zbn zef -ze9 zh1 -zgw zjo -zjk zmc -zm8 zp0 -zow zro -zro zug -zuf zx7 -zx7 zzz -1001 102t -102w 105o -105s 108k -108o 10bg -10bm 10ed -10ej 10hb -10hh 10k9 -10ke 10n6 -10nb 10q3 -10q8 10t0 -10t5 10vx -10w2 10yu -10yz 111r -111w 114n -114r 117j -117o 11ag -11ak 11dc -11dh 11g9 -11gd 11j5 -11jb 11m3 -11ma 11p2 -11p8 11s0 -11s6 11ux -11v3 11xv -11y1 120t -120x 123p -123t 126l -126o 129g -129l 12cd -12cj 12fb -12fi 12ia -12ig 12l7 -12ld 12o5 -12oh 12r8 -12s2 12uq -12vy 12yf -1304 132a -134b 1368 -138i 13a3 -13cm 13dq -13gf 13h3 -13jv 13k2 -13mt 13ml -13p9 13ok -13r2 13pv -13s7 13qo -13sn 13qq -13se 13q6 -13rd 13ov -13pq 13n3 -13nt 13l4 -13ll 13iv -13j4 13gc -13ge 13dm -13dj 13ar -13ad 137m -1370 134b -133e 130r -12zq 12x6 -12vw 12tf -12rz 12pl -12o6 12ls -12kc 12hz -12gi 12e5 -12cm 12aa -128r 126f -124x 122m -1219 11yt -11xm 11v4 -11u3 11ri -11qj 11nx -11n7 11kj -11jv 11h6 -11gp 11dy -11di 11as -11aj 117r -117k 114s -114q 111y -111w 10z4 -10z5 10wd -10wj 10tr -10tz 10r8 -10rk 10os -10p8 10mi -10n3 10kd -10l3 10ie -10j5 10gh -10hd 10eq -10fn 10d1 -10e9 10br -10cy 10ag -10br 109a -10al 1085 -109g 1070 -1088 105q -106u 104a -1058 102n -103f 100q -101e zyp -zzb zwm -zx1 zua -zuk zrs -zrs zp0 -zoz zm7 -zm8 zjg -zju zh4 -zi3 zfi -zh1 zep -zgl zel -zgw zfb -zhs zgl -zjb zio -zlb zkj -zn6 zmb -zor zng -zpq zo4 -zq6 zob -zq3 zny -zpe zn1 -zo3 zlj -zmb zjn -zk9 zhk -zhy zf7 -zfl zct -zd5 zae -zal z7t -z80 z59 -z5a z2i -z2h yzp -yzl ywt -ywn ytv -ytk yqs -yqg ynp -yn9 yki -yk0 yha -ygo ydy -ydb yam -y9u y76 -y6e y3q -y2r y06 -xz4 xwj -xvg xsw -xru xp9 -xo6 xlm -xkj xhz -xgw xec -xd9 xap -x9n x72 -x61 x3g -x2f wzu -wyv wwa -wvb wsp -wrr wp5 -wod wlp -wkx wi9 -whl wew -wed wbn -wb8 w8h -w81 w5a -w4z w28 -w20 vz8 -vz5 vwd -vwd vtl -vtl vqt -vqy vo6 -voa vli -vln viv -vix vg5 -vg6 vde -vd8 vag -vab v7j -v7a v4j -v49 v1h -v12 uyb -uxs uv2 -uug urr -ur4 uoe -unm uky -uk3 uhg -ugh udw -uct ua9 -u94 u6k -u5d u2v -u1m tz5 -txp tvb -ttt trh -tq0 tnn -tm6 tjt -tic tfz -tej tc6 -tat t8e -t71 t4m -t3c t0v -szm sx5 -svx stf -ssa spr -sor sm5 -slb sio -shx sf9 -sei sbt -sb4 s8f -s7v s55 -s4l s1v -s1b ryl -ry4 rve -ruz rs8 -rrx rp6 -roy rm6 -rm0 rj8 -rj2 rga -rg6 rde -rdf ran -raq r7y -r81 r59 -r5c r2k -r2q qzy -r07 qxg -qxr quz -qvd qsm -qt3 qqd -qqw qo6 -qor qm1 -qmn qjx -qkk qhv -qio qg0 -qgp qe1 -qec qbl -qbc q8l -q7q q53 -q3w q1e -pzr pxi -pvk ptm -prh ppp -pnh plt -pjm phw -pfs pe0 -pc3 pa2 -p8g p66 -p4v p2f -p1b oys -oxv ov9 -ouo ory -orc oom -oo0 olb -okn ohy -ohe oeo -oe4 obe -oav o84 -o7q o4z -o51 o29 -o2i nzr -o0a nxk -nyi nvw -nx3 nuk -nvt ntc -nul ns4 -nte nqx -ns6 npp -nr0 noj -npt nnd -non nm6 -nnh nl0 -nma nju -nl4 nin -njy nhh -nir ngb -nhl nf4 -ngd ndv -nf2 nck -ndn nb3 -nc5 n9k -nag n7u -n8q n63 -n6x n4a -n4x n27 -n2u n05 -n0m mxv -my8 mvh -mvv mt4 -mtd mqm -mqs mo0 -mo1 ml9 -ml7 mif -mia mfi -mfa mci -mc7 m9g -m93 m6c -m5t m33 -m2k lzt -lz3 lwf -lvp lt0 -lsa lpl -loz lma -llq lj0 -lih lfr -lf7 lch -lbu l94 -l8e l5q -l4z l2b -l1k kyv -ky2 kvf -kui krv -kqz koc -knf kkt -kju kh8 -kg8 kdn -kco ka2 -k8z k6f -k5b k2r -k1k jz2 -jxv jvd -ju5 jrn -jq9 jnu -jmg jk2 -jim jg8 -jer jcf -jax j8k -j72 j4q -j39 j0w -iz9 ix1 -ivd it5 -irh ip9 -inl ild -ijp ihg -ifo idk -ibp i9m -i7q i5o -i3q i1r -hzq hxu -hvt htw -hrv hpz -hny hm2 -hjy hi5 -hg0 he8 -hc1 hac -h85 h6f -h46 h2j -h0a gyo -gwf gus -gsi gqy -gon gn3 -gks gj8 -ggx gfd -gd2 gbh -g97 g7m -g5c g3r -g1h fzw -fxm fw0 -ftr fs5 -fpv fo9 -fly fkf -fhy fgp -fdz fde -fan faq -f83 f8v -f6m f88 -f68 f85 -f6p f92 -f86 fas -far fdi -fe5 fgu -fhl fk9 -fkz fno -foe fr2 -frs fuh -fv6 fxv -fyl g19 -g1w g4m -g58 g7x -g8i gb8 -gbt gej -gf2 ghs -gic gl2 -gll gob -gos grj -gs0 guq -gv7 gxy -gye h15 -h1m h4c -h4w h7l -hab ha6 -hcw hc9 -hez hej -hdx hgd -hf9 hht -hgq hja -hi6 hkq -hjn hm7 -hlz hon -hp8 hry -hsi hv8 -hvt hyi -hz2 i1s -i2d i53 -i5o i8e -i90 ibp -icc if2 -ifo iid -iiz ilp -imb ip1 -ipn isc -isz ivo -iwc iz2 -izp j2e -j36 j5u -j6m j9a -ja3 jcr -jdm jg9 -jh4 jjr -jkm jn9 -jo5 jqs -jrn jua -jv6 jxt -jy6 k0r -jye jzk -jwu jxg -jur jvd -jsv jtr -jvn jx6 -jzv k0j -k38 k3v -k6k k78 -k9s kas -kcc kej -kfg ki2 -kiz klm -kmj kp5 -kq2 ksp -ktm kw8 -kx5 kzs -l0p l3b -l48 l6u -l7r lae -lbb ldx -leu lhh -lie ll0 -llx lok -lph ls3 -lt0 lvn -lwk lz6 -m03 m2p -m3m m69 -m75 m9s -mao mda -me6 mgt -mhp mkc -ml8 mnv -mos mre -msa mux -mvt myg -mzc n1y -n2u n5h -n6d n90 -n9w ncj -ndg ng2 -ngy njl -nkh nn4 -no0 nqn -nrj nu5 -nv1 nxo -nyl o18 -o24 o4q -o5n o8a -o96 obs -ocp ofc -og8 oiv -ojr omd -ona opx -oqt otg -oud owz -oxv p0i -p1d p40 -p4v p7i -p8g pb2 -pci pev -phf pic -pl1 pkk -pn2 plu -pod pn9 -ppz ppq -psa ptc -pv9 px7 -pyg q0w -q0w q3o -q3b q62 -q5i q88 -q7n qad -q9j qc6 -qba qdx -qcw qfh -qeg qh1 -qg6 qit -qi3 qkr -qk8 qmz -qmi qp8 -qoz qrr -qrq qui -qug qx8 -qxg r07 -r0j r3b -r3q r6h -r8l r87 -rap r9j -rc2 rav -rde rc8',
    height: '2u 0 0 0 0 0 0 -1 -1 0 0 0 -1 -1 -2 -1 -2 -1 -2 -1 -1 0 0 1 1 1 0 0 -1 -1 -1 0 -1 -1 -1 0 -1 -1 -1 1 1 2 2 4 3 2 2 1 0 -1 -1 -2 -2 -2 -4 -3 -5 -5 -4 -4 -2 -2 0 2 2 2 3 2 3 3 2 3 3 1 1 0 -1 -3 -4 -5 -5 -6 -5 -4 -4 -3 -3 -2 0 -1 1 1 4 4 4 4 3 3 1 1 -1 -3 -4 -7 -7 -9 -9 -9 -8 -6 -5 -2 0 2 4 6 9 9 a a a 8 7 7 4 4 2 3 1 1 0 1 0 1 2 1 1 2 0 1 0 0 0 1 1 0 2 1 1 0 0 0 0 0 0 0 0 0 0 -1 -1 -1 0 0 0 1 2 1 2 1 2 0 0 0 0 -2 -1 -2 -1 -4 -3 -3 -3 -3 -1 -1 -1 1 1 0 0 0 1 1 0 0 0 -1 -1 -1 -2 -1 -2 0 0 0 0 2 1 2 1 3 2 3 3 3 3 1 1 1 -1 -1 -1 -2 -2 -2 -2 -2 -3 -2 -2 -3 -4 -3 -4 -3 -2 -1 -1 -2 -1 -2 -1 -1 1 2 3 3 2 3 1 1 1 1 0 1 0 -1 -1 -2 -4 -3 -3 -3 -2 -2 0 -1 0 1 3 2 2 3 2 3 3 3 3 3 3 3 3 1 3 3 5 5 3 2 2 0 -1 -1 -2 -3 -3 -3 -4 -4 -4 -4 -3 -3 -2 -3 -2 -1 -1 -1 -1 -1 0 -1 1 0 1 2 1 2 1 1 1 1 0 0 0 -1 -2 -1 -2 -3 -2 -2 0 0 0 1 2 3 2 4 3 3 2 2 0 -1 -1 -3 -4 -4 -5 -4 -6 -4 -3 -3 -1 0 0 1 1 2 1 2 1 2 1 2 1 1 1 1 3 3 3 3 3 3 3 2 1 2 1 2 1 0 0 0 0 1 0 0 1 1 0 0 -1 -1 -1 -1 -2 -2 -2 -2 -1 -1 0 0 1 0 1 0 1 1 0 1 1 2 0 0 0 0 0 0 1 0 0 -1 0 -2 -2 -3 -2 -2 -3 -2 -1 -2 -1 0 0 1 2 1 2 1 2 1 2 1 1 2 3 2 2 2 1 1 1 1 1 0 1 0 -1 -2 -2 -3 -1 -2 0 -1 -1 -1 0 0 0 1 1 1 0 1 2 1 2 1 2 1 0 1 1 1 0 0 0 -2 -1 -2 -2 -1 -1 -1 0 -1 0 1 2 1 1 1 1 1 2 1 2 1 1 -1 -2 -3 -2 -3 -3 -2 -2 -2 -2 -2 -3 -1 -2 -1 0 0 0 0 1 0 0 0 0 0 0 2 2 2 0 2 1 1 1 0 0 0 0 0 -1 -1 -1 0 -1 -1 0 1 1 1 2 2 3 1 1 0 -1 -1 -1 -2 -4 -3 -3 -2 -2 -3 -1 -2 0 0 0 0 1 1 1 0 -1 -2 -1 -2 0 0 0 1 1 1 0 1 0 0 0 0 0 -1 -2 -2 -1 -2 -1 -1 -1 1 1 1 2 1 4 3 3 3 3 3 2 3 1 2 0 1 0 -1 -2 -1',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '3s,1,3r,8,f,9,db 3q,1,3t,6,e,9,4j g0,1,l,30,3k,9,hf 9w,1,n,p,15,9,1 gy,1,1l,w,10,9,cp a2,1,11,o,y,9,a8 3r,1,1g,m,u,c0,4g ah,0,g,k,1r,9,4r 9r,0,h,f,1l,9,40 51,1,2m,1c,1p,9,7x 4v,1,4w,i,k,9,3h 4v,1,40,h,i,9,c7 5b,1,32,k,l,9,44',
    boats: '4z,1,81,u,fo 4y,1,79,12,fb 4y,1,6w,x,26 4z,1,6s,g,2j 4z,1,7n,j,6y 4w,1,92,n,8z 4x,1,8h,k,53 4x,1,95,x,o 4x,1,8i,z,53 4x,1,96,k,p 4x,1,8q,q,9f 4w,1,8g,j,8x 4x,1,6o,12,54 4x,1,7b,t,9f 4x,1,6s,11,55 4x,1,7u,x,53 4x,1,7g,r,9f 4w,1,64,10,8y 56,1,5d,o,45 57,1,5u,l,4d 58,1,5c,m,4j 59,1,5v,p,4s 5a,1,5f,q,51 5a,1,64,n,51 59,1,66,g,di 56,1,65,g,9c 55,1,61,i,h',
    bank: [],
    land: { rise: 0.4, roll: 0.2, plain: -1.0, runoff: 2.2, reach: 3,
      sea: { at: 0.10, span: 0.30, level: -3 } },
    scatter: [
      { kind: 'palm', side: 0, from: 18, to: 44, chance: 0.22, s: [1.0, 1.6] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  miami: {
    label: 'MIAMI',
    blurb: 'A car park, a stadium and a flyover, which sounds like nothing and '
      + 'drives better than it reads. Three long straights with heavy '
      + 'braking at the end of each, and a slow twisting section under the '
      + 'road bridges where the walls come in close enough to matter.',
    theme: 'coast',
    laps: 3,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 6.0,
    metres: 6409,
    line: '-384 -oo lw -ls j0 -iv g3 -fz d7 -d3 ab -a6 7e -7a 4i -4e 1m -1i -19 1e -46 4a -72 77 -9z a3 -cv d0 -fs fx -ip iu -lm lr -oi on -rf rk -uc uh -x9 xe -106 10a -132 136 -15y 162 -18u 18y -1bp 1bt -1el 1eo -1hg 1hk -1kc 1kg -1n8 1nc -1q4 1q7 -1sz 1t3 -1vv 1vz -1yr 1yv -21n 21q -24i 24m -27d 27g -2a8 2a2 -2ci 2ba -2ca 29s -29f 26o -25b 22x -20w 1z0 -1wr 1v5 -1sv 1ra -1p0 1nf -1l5 1jj -1h9 1fo -1dd 1bt -19i 17y -15l 144 -11p 10d -xq wv -u5 tn -qw ql -nt o0 -l9 ln -iy jl -h3 i9 -fr h0 -ej fs -da ei -c0 d7 -ap bw -9d aj -81 97 -6m 7p -54 63 -3g 4d -1p 2h 8 f 2b -1v 4n -4g 78 -74 9w -9x cp -cr fi -fu ik -j0 lq -mc p1 -pr sd -t9 vv -wu z7 -10n 131 -14g 16u -18a 1an -1c3 1eh -1fw 1i9 -1jp 1m3 -1nj 1pw -1rc 1tq -1v5 1xi -1yy 21c -22s 255 -26l 28z -2ae 2cr -2e7 2gl -2i1 2kf -2lv 2o8 -2po 2s2 -2th 2vu -2xa 2zo -313 33h -34x 37a -38p 3b3 -3cj 3ex -3gd 3iq -3k5 3mj -3nz 3qc -3rs 3u6 -3vl 3xy -3ze 41s -438 45l -471 49f -4av 4d8 -4ep 4h2 -4ii 4kv -4mb 4op -4q5 4si -4ty 4wc -4xs 505 -51l 53y -55e 57s -598 5bl -5d1 5fe -5gu 5j7 -5ko 5n1 -5oh 5qp -5sd 5ti -5w0 5w0 -5yr 5xh -5zw 5xx -5zv 5xo -5ze 5x7 -5yw 5wq -5yg 5w9 -5xz 5vy -5xu 5vy -5xz 5wd -5yl 5xp -60c 5zy -62o 62u -65m 662 -68t 69e -6c3 6ca -6f2 6eu -6hl 6gz -6jp 6ir -6ld 6kc -6mw 6le -6nq 6lw -6nz 6m1 -6o1 6ls -6ne 6l5 -6mr 6kb -6ln 6j6 -6kf 6hw -6j1 6gh -6hk 6ey -6fw 6d8 -6dz 6b9 -6bv 696 -69s 671 -67f 64n -64x 626 -62c 5zk -5zk 5ws -5wn 5tv -5tl 5qv -5qf 5np -5n4 5kf -5jr 5h3 -5ga 5do -5cr 5a5 -596 56o -55h 531 -51q 4zb -4xy 4vk -4u4 4rr -4qc 4ny -4mi 4k5 -4ip 4gb -4ew 4cj -4b2 48p -479 44v -43f 412 -3zm 3x9 -3vs 3tf -3rz 3pl -3o5 3ls -3kb 3hy -3gi 3e5 -3cp 3ab -38v 36i -351 32o -318 2yv -2xf 2v2 -2tm 2r8 -2pr 2ne -2ly 2jm -2i4 2fo -2ec 2bt -2ap 27z -27e 24n -24b 21j -21f 1yn -1ys 1w1 -1we 1tq -1uf 1rv -1sy 1qj -1rw 1pm -1r8 1oz -1ql 1ob -1pw 1nn -1pa 1mx -1od 1ls -1mt 1k4 -1kt 1i3 -1ij 1fr -1ft 1d2 -1cs 1a3 -19g 16v -15v 13c -125 zz -y9 w5 -uc sc -qf of -mi ki -il gk -em cf -ar 8a -72 4h -3g s -2 -2p 35 -5x 5z -8r 8k -ba au -dj cu -fi eq -hc gf -iz hu -k9 ix -l8 jp -lu k3 -m0 k0 -lt jp -l6 it -k1 hj -ij fz -gp e0 -ec bl -bm 8u -8j 5s -50 2d -12 -1e 3b -5a 7o -93 br -ci f9 -f3 hv -hj ka -jx mo -mb p3 -ox rp -rn ue -ui xa -xk 10b -10o 13d -140 16q -17c 1a1 -1an 1dd -1dz 1go -1hb 1k1 -1kn 1nd -1ny 1qn -1r8 1ty -1uj 1x9 -1xv 20k -215 23w -24d 274 -27g 2a8 -2ae 2d6 -2d9 2g1 -2g2 2iu -2is 2lj -2lg 2o8 -2o6 2qy -2qv 2tn -2tk 2wc -2w9 2z1 -2yy 31q -31n 34f -34c 374 -371 39t -39r 3cj -3cg 3f8 -3f5 3hx -3hu 3km -3kj 3nb -3n8 3q0 -3px 3so -3sm 3ve -3vb 3y3 -3y0 40s -40p 43h -43e 466 -464 48w -48v 4bn -4bt 4ej -4f0 4hq -4ib 4kz -4lp 4oe -4p4 4rq -4sn 4va -4w7 4yt -4zr 52d -53b 55x -56v 59h -5af 5d2 -5dy 5gk -5hg 5k3 -5kz 5nm -5oi 5r3 -5s2 5uo -5vn 5ya -5z5 61t -62n 65a -663 68q -69k 6c9 -6cz 6fo -6gd 6j1 -6jr 6mh -6n1 6pr -6qb 6t2 -6tf 6w7 -6wj 6za -6zk 72c -72k 75b -75j 78b -78d 7b5 -7b4 7dw -7dv 7gn -7gi 7ja -7j3 7lu -7lm 7oe -7o7 7qy -7qk 7tb -7sw 7vn -7v8 7xx -7xc 801 -7zb 81z -818 83w -834 85s -84y 87l -86q 89c -88f 8b1 -8a2 8cn -8bo 8ea -8dc 8fy -8ez 8hl -8gn 8j9 -8ia 8kv -8jx 8mj -8lk 8o6 -8n7 8pt -8ov 8rg -8qg 8t1 -8s1 8un -8to 8wa -8vc 8xy -8wz 8zl -8yn 919 -90a 92v -91x 94j -93k 966 -957 97t -96v 99g -98f 9b0 -9a0 9cl -9bk 9e4 -9d2 9fm -9eh 9h0 -9fw 9if -9ha 9jt -9in 9l6 -9k0 9mh -9l8 9np -9mg 9ox -9nn 9q3 -9os 9r6 -9pr 9s5 -9qq 9t4 -9ro 9u1 -9sl 9uz -9tk 9vy -9ui 9wv -9vg 9xu -9we 9ys -9xc 9zp -9ya a0o -9z8 a1j -a00 a21 -a05 a19 -9yr 9yh -9vr 9tz -9ry 9pk -9o6 9lt -9kc 9i0 -9gi 9e6 -9co 9aj -98r 96w -94u 93l -914 909 -8xm 8x7 -8uh 8ul -8rt 8sc -8pm 8qo -8o4 8pr -8ni 8pp -8o1 8qo -8ps 8sj -8s7 8uz -8v0 8xs -8xu 90m -90n 93f -93h 968 -969 990 -98m 9b6 -9a3 9ca -9al 9ch -9ag 9bx -99k 9az -98l 99y -97j 98v -96g 97t -95e 966 -93j 91y -8zv 8x7 -8wg 8uf -8sq 8sw -8q5 8qs -8o3 8ot -8m4 8mt -8k4 8kt -8i5 8iv -8g6 8gv -8e6 8ev -8c6 8c5 -89f 87i -85l 82x -827 7zf -7z7 7wf -7wb 7tj -7tf 7qo -7qj 7nr -7nn 7kv -7kr 7hz -7hv 7f3 -7ey 7c6 -7c2 79a -796 76e -769 73i -73e 70m -70i 6xq -6xl 6ut -6up 6rx -6rt 6p1 -6ow 6m4 -6m0 6j8 -6j4 6gc -6g7 6dg -6dc 6ak -6ag 67o -67k 64s -64n 61v -61r 5yz -5yv 5w3 -5vy 5t6 -5t2 5qa -5q6 5nf -5na 5ki -5ke 5hm -5hi 5eq -5el 5bt -5bp 58x -58t 561 -55w 534 -530 508 -504 4xd -4x8 4ug -4uc 4rk -4rg 4oo -4ok 4ls -4ln 4iv -4it 4g1 -4g1 4d9 -4da 4ai -4ai 47q -47q 44y -44y 426 -427 3zf -3zf 3wn -3wn 3tv -3tv 3r3 -3r4 3oc -3oc 3pa -3pu 3si -3tc 3vz -3ws 3zg -409 42w -43s 46e -47b 49y -4au 4dg -4ec 4gy -4hx 4ki -4li 4o3 -4p4 4ro -4ss 4va -4wh 4z1 -505 51x -540 54w -57h 57x -5an 5b0 -5ds 5dv -5gm 5go -5jg 5ji -5ma 5mc -5p4 5p6 -5ry 5s0 -5us 5uu -5xm 5xo -60g 60i -63a 63c -664 665 -68x 68w -6bo 6bd -6e4 6dp -6gg 6fo -6ic 6hc -6jx 6j2 -6lp 6kw -6nk 6mz -6pp 6pl -6sc 6s9 -6v1 6v1 -6xt 6xs -70k 70j -73b 735 -75x 75r -78j 78c -7b4 7ay -7dp 7dm -7ge 7gf -7j7 7j9 -7m1 7m3 -7ov 7ow -7ro 7rq -7ui 7uj -7xb 7wv -7zm 7yr -81d 7zp -81w 7zo -81b 7yr -7zw 7xd -7yi 7vz -7x4 7ul -7vq 7tg -7uz 7tz -7wj 7wg -7z7 7zf -826 825 -84x 844 -86p 852 -84z 83b -813 7zf -7x7 7vj -7tb 7rn -7pg 7ns -7lk 7jw -7ho 7fz -7dr 7c3 -79v 787 -75z 74b -723 70f -6y7 6wj -6ub 6sn -6qg 6os -6mk 6kw -6io 6gz -6er 6d3 -6av 697 -66z 65b -633 61f -5z7 5xj -5vb 5tn -5rg 5ps -5nk 5lw -5jo 5hz -5fr 5e3 -5bv 5a7 -57z 56b -543 52f -507 4yj -4wb 4un -4sg 4qs -4ok 4mw -4ko 4iz -4gr 4f3 -4cv 4b7 -48z 47b -453 43f -417 3zj -3xb 3vn -3tg 3rs -3pk 3nw -3lo 3jz -3hr 3g3 -3dv 3c7 -39z 38b -363 34f -327 30j -2yb 2wn -2ug 2ss -2qk 2ow -2mo 2kz -2ir 2h3 -2ev 2d7 -2az 29b -273 25f -237 21j -1zb 1xn -1vg 1ts -1rk 1pw -1no 1lz -1jr 1i3 -1fv 1e7 -1bz 1ab -183 16f -147 12j -10b yn -wg us -sk',
    height: 'z -1 -1 0 1 2 2 3 2 2 3 4 3 3 2 2 0 0 -2 -2 -3 -1 -2 -2 -2 -2 -1 0 0 2 2 3 3 2 1 2 2 1 2 0 0 0 -2 -1 -2 -2 -1 -2 -2 -3 -3 -4 -3 -4 -4 -3 -3 -2 -2 0 -1 1 1 2 2 2 3 1 2 1 1 0 -1 -1 -1 -1 -1 0 0 0 3 2 2 3 3 5 5 7 6 8 7 5 3 1 -1 -2 -2 -2 -2 -2 -3 -3 -4 -3 0 0 3 3 4 4 3 1 1 0 0 -1 -2 -4 -5 -5 -5 -7 -6 -8 -6 -5 -4 -2 -2 -2 0 1 1 2 2 3 2 1 -2 -2 -4 -5 -4 -4 -4 -3 -2 0 0 3 4 5 6 6 6 7 4 4 2 1 0 -1 -1 -2 -2 -3 -3 -2 -1 -1 1 1 3 3 3 4 3 3 4 3 2 1 2 0 1 0 0 0 -1 0 0 0 0 0 1 0 1 0 0 1 1 1 0 -1 -2 -1 -3 -3 -2 -2 -2 -1 -1 0 0 0 1 3 2 3 4 4 4 2 1 -1 -2 -3 -4 -6 -6 -6 -6 -6 -6 -6 -4 -3 -2 -1 0 1 2 2 2 3 3 3 3 1 1 1 0 0 0 1 1 2 1 2 1 2 1 3 2 2 3 2 2 2 1 1 1 0 -1 -2 -2 -3 -4 -4 -5 -5 -6 -4 -4 -3 -2 -1 0 0 0 1 1 1 1 3 1 2 1 2 1 3 3 3 4 5 5 3 3 2 1 -1 -2 -2 -3 -2 -3 -2 -1 -2 -1 1 1 1 3 2 2 2 1 0 -1 -2 0 -2 -2 -3 -2 -3 -3 -3 -2 -3 -1 1 2 1 2 2 2 0 1 1 1 0 0 -1 -2 -2 -3 -3 -3 -2 -1 0 1 1 2 0 0 0 0 -2 -1 -1 -1 -1 -2 -2 -2 0 1 2 3 3 3 4 2 1 0 -1 -1 -1 -3 -2 -2 -3 -2 -2 -3 -3 -2 -1 1 2 1 2 1 1 1 1 3 3 5 4 4 3 2 2 3 2 2 3 3 1 1 1 1 0 -1 -2 -2 -2 -3 -3 -5 -6 -7 -8 -8 -7 -6 -4 -2 0 1 1 3 4 6 7 7 8 8 7 7 5 4 3 1 2 1 0 -1 -1 -1 -1 -2 -1 -2 -2 -2 -2 -2 -2 -3 -2 -2 -3 -1 -2 -1 -1 0 0 0 1 0 2 2 0 0 0 -1 -2 -1 -2 -1 1 2 0 0 -1 -2 -1 -2 -1 -1 -1 -1 0 -2 -1 0 0 3 3 4 3 4 4 2 3 1 1 0 -1 0 -1 -2 -1 -2 -1 -2 -1 0 0 0 0 1 1 1 1 2 0 0 0 -2 -3 -3 -4 -4 -7 -6 -6 -7 -7 -4 -3 -2 1 3 3 4 4 7 6 6 7 7 6 6 5 4 3 1 2 0 -2 -3 -5 -5 -5 -7 -7 -7 -6 -6 -4 -3 -2 -1 0 1 2 3 6 5 6 7 6 7 8 8 8 8 8 8 7 5 3 4 3 1 1 0 -1 0 1 1 0 0 0 0 -3 -3 -5 -5 -6 -6 -7 -7 -8 -7 -8 -8 -5 -4 -3 -2 -2 -2',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '70,1,4l,8,s,7,r 6y,1,4q,a,i,7,hc cu,1,4p,r,p,d,2z 75,1,36,c,i,6,9e 93,1,55,8,a,4,c8 73,1,49,f,p,a,2s o,1,3u,c,7,4,4e r,1,54,9,a,4,2q do,1,4w,8,a,5,hb 4,1,53,9,d,4,3m c,1,4z,8,8,4,7o e0,0,4v,b,7,4,gi 12,1,55,8,9,4,3e dk,1,3r,9,b,5,d3 dv,1,4d,c,a,5,fv 1,1,55,a,9,4,51 q,1,3t,9,6,4,d3 h,1,3u,b,7,4,4c j,1,3u,8,8,4,4c a,1,3v,6,8,4,1 dg,1,50,8,a,5,h9 dr,1,4w,8,9,5,8o e0,0,4f,a,a,4,bp f,1,3u,6,a,4,8p 1,1,3v,8,6,4,4d d8,1,3r,8,b,5,d2 dr,1,3t,9,b,5,d8 e0,0,59,7,6,4,bo 8,1,3t,9,6,4,4c x,1,3w,c,9,4,1 dt,1,3y,b,a,5,ez 3,1,3s,9,6,4,4c 0,1,53,8,8,4,bq e0,0,48,a,7,4,5g d6,1,3r,9,b,5,d4 e0,0,4u,8,8,4,bp 0,1,3w,6,7,4,hf v,1,52,8,7,4,94 m,1,3v,6,a,4,8p d9,1,3r,9,b,5,d2 dc,1,3r,9,b,5,d3 9,1,56,8,9,4,dn g,1,52,9,8,4,9g e0,0,47,5,8,4,7b 5,1,3u,8,7,4,4d dq,1,3n,9,b,5,d7 di,1,3r,9,b,5,d3 12,1,4r,b,b,4,3f 0,1,5a,b,9,4,gz 0,1,46,9,9,4,5n o,1,53,8,9,4,55 11,1,47,c,8,4,3d df,1,3r,9,b,5,d3 db,1,3r,9,b,5,d3 v,1,3u,c,7,4,4e z,1,54,9,8,4,33 dk,1,4y,8,8,5,8k dh,1,3r,9,b,5,d3 dv,1,4y,8,a,5,hd do,1,3r,9,b,5,d5 0,1,40,7,6,3,4d 11,1,3i,3,3,3,a2 de,1,3r,9,b,5,d3 11,1,55,8,5,4,9y j,1,51,a,b,4,82 dl,1,3r,9,b,5,d3 11,1,53,8,b,3,ea dn,1,3r,9,b,5,d3 s,1,3v,6,a,4,8r c,1,3t,9,6,4,4c 11,1,4f,b,a,7,87 z,1,3v,6,a,4,8t ce,1,47,7,a,4,6n c3,1,54,8,7,3,65 c2,1,45,8,6,4,3i bz,1,52,6,b,3,79 c3,1,4x,6,8,4,1r c0,1,4p,a,8,4,bm c3,1,51,9,7,4,6m c3,1,4z,6,8,3,1s ce,1,3z,5,c,4,8p c3,1,3s,a,7,3,64 c2,1,4d,c,7,4,c8 c3,1,50,a,9,4,1q ce,1,50,6,b,4,d7 c3,1,3x,8,6,4,64 c3,1,3l,b,c,4,ah c3,1,3t,9,6,4,66 hg,0,i,4y,2k,9,gf 7c,1,r,a,7,9,8a 4y,0,e,9,9,9,77 4z,0,c,3,4,9,76 7c,1,j,3,3,9,h5 6m,1,2m,d,1b,9,9p 6o,1,35,7,d,9,1e 6i,1,2c,8,d,9,8z 5h,0,1l,h,z,9,2r 8j,0,p,a,m,9,85',
    boats: '',
    bank: [],
    land: { rise: 0.6, roll: 0.4, plain: -1.0, runoff: 3.0, reach: 4 },
    scatter: [
      { kind: 'palm', side: 0, from: 22, to: 60, chance: 0.18, s: [0.9, 1.5] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  vegas: {
    label: 'LAS VEGAS',
    blurb: 'Two kilometres flat out down the Strip at night, past the whole of '
      + 'it lit up, and then a set of ninety degree turns through the '
      + 'streets behind. The widest circuit here and the one where the '
      + 'scenery is doing the most talking.',
    theme: 'strip',
    laps: 3,
    dusk: true,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 7.5,
    metres: 4933,
    line: '25t -2rx 2q3 -2s6 2qc -2sf 2qk -2sn 2qt -2sw 2r2 -2t5 2ra -2td 2rj -2tm 2rs -2tv 2s0 -2u3 2s9 -2ub 2sg -2uj 2sp -2us 2sy -2v1 2sy -2ut 2so -2uf 2s2 -2tk 2r4 -2se 2pu -2qy 2of -2pl 2n2 -2o8 2lm -2mk 2jz -2ky 2id -2je 2hs -2i4 2k0 -2hy 2ju -2ht 2k5 -2io 2l4 -2jr 2m2 -2kj 2mn -2kw 2mn -2kg 2m0 -2jq 2lb -2j1 2l6 -2jf 2m5 -2lk 2ob -2o1 2qk -2ph 2r8 -2p3 2qy -2ov 2qp -2on 2qi -2of 2q9 -2o6 2q1 -2ny 2pt -2nr 2pl -2ni 2pd -2na 2p4 -2n2 2ox -2mu 2oo -2ml 2og -2md 2o8 -2m6 2o0 -2lx 2ns -2lp 2nj -2lh 2nc -2l9 2n3 -2l0 2mv -2ks 2mn -2kl 2mf -2kc 2m7 -2k4 2ly -2jw 2lr -2jo 2li -2jf 2la -2j7 2l2 -2j0 2ku -2ir 2k8 -2hw 2ip -2g3 2fs -2d1 2by -29g 27v -25l 23v -21o 1zy -1xr 1x3 -1uf 1ts -1r3 1qg -1nq 1n3 -1ke 1jr -1h1 1ge -1dp 1d2 -1ad 19q -170 16d -13o 131 -10b zo -wz wc -tn t0 -qa pn -my mb -jl iy -g9 fm -cx ca -9k 8x -68 5l -2v 28 h -14 3t -4g 76 -7t ai -b5 dv -ei h7 -hu kj -l6 nw -oj r8 -rv ul -v8 xx -yk 119 -11w 14m -159 17y -18l 1bb -1by 1en -1fa 1hz -1im 1lc -1lz 1oo -1pb 1s1 -1so 1vd -1w0 1yp -1zc 222 -22p 25e -261 28q -29d 2c3 -2cq 2ff -2g2 2is -2jf 2m4 -2mr 2pg -2q3 2st -2tg 2w5 -2ws 2zi -305 32u -33h 366 -36t 39j -3a6 3cv -3di 3g8 -3gu 3jj -3k6 3mv -3ni 3q8 -3qv 3tk -3u7 3wx -3xk 409 -40w 43l -448 46y -47l 4aa -4ax 4dn -4ea 4gz -4hm 4kb -4ky 4no -4ob 4r0 -4rn 4ud -4v0 4xp -4yc 511 -51o 54e -551 57q -58d 5b3 -5bq 5ef -5f2 5hr -5ie 5l4 -5lr 5og -5p3 5rt -5sg 5v5 -5vs 5yh -5z4 61u -62h 656 -65t 68j -696 6bv -6ci 6f7 -6fu 6ik -6j7 6lw -6mj 6p8 -6pv 6sl -6t8 6vx -6wk 6za -6zx 72m -739 75y -76l 79b -79y 7cn -7da 7g0 -7gn 7jc -7jz 7mo -7nb 7q1 -7qo 7td -7u0 7wq -7xd 802 -80p 83e -841 86r -87e 8a3 -8aq 8dg -8e3 8gs -8hf 8k4 -8kr 8nh -8o4 8qt -8rg 8u6 -8ut 8xi -8y4 90t -91g 946 -94t 97i -985 9av -9bi 9e7 -9eu 9hj -9i6 9kw -9lj 9o8 -9ov 9rl -9s8 9ux -9sw 9th -9qo 9qo -9nw 9nx -9l5 9l5 -9id 9id -9fl 9fl -9ct 9cu -9a2 9a2 -97a 97a -94i 94g -91o 91l -8yt 8yq -8vy 8vv -8t3 8t0 -8q8 8q4 -8nc 8n9 -8kh 8ke -8hm 8hi -8eq 8en -8bv 8bs -890 88w -864 861 -839 837 -80f 80d -7xl 7xj -7ur 7up -7rw 7ru -7p2 7p0 -7m8 7m6 -7je 7jc -7gk 7gj -7dr 7dp -7ax 7av -783 780 -758 756 -72e 72c -6zk 6zi -6wq 6wo -6tw 6ts -6r0 6qu -6o2 6nv -6l4 6ks -6i1 6ho -6ew 6ek -6bt 6bg -68r 683 -65e 64q -622 618 -5yl 5xq -5v3 5u8 -5rl 5qq -5o3 5n8 -5kn 5jn -5h1 5g1 -5dg 5cf -59u 58u -569 559 -552 534 -54c 51u -52q 504 -50v 4y7 -4yv 4w5 -4wl 4tv -4uc 4rl -4rs 4p1 -4p1 4m9 -4m9 4jh -4jc 4gk -4gg 4do -4dj 4ar -4ai 47q -47f 44o -44d 41l -417 3yg -3y0 3v9 -3ue 3rr -3qw 3o9 -3na 3ko -3jn 3h2 -3g1 3dg -3cg 39v -38q 366 -351 32i -31c 2yt -2xo 2v5 -2ty 2rg -2qb 2ns -2mn 2k3 -2iz 2gg -2fc 2cs -2bo 294 -288 25m -24z 229 -21t 1z3 -1yx 1w5 -1w6 1te -1tm 1qu -1r3 1oc -1om 1lu -1ma 1jj -1jz 1h8 -1ho 1ey -1fm 1cx -1dm 1ax -1bm 18x -19z 17e -18h 15x -173 14k -15v 13f -14t 12e -13w 11k -134 10t -12e 105 -11u zm -11b z3 -10x yu -10o yl -10f yc -106 y3 -zx xu -zp xm -zg xd -z7 x4 -yz ww -yr wp -yk wh -yc wb -y6 w3 -xu vp -x6 ut -w4 tn -ut sa -tc qs -ro p1 -po mz -nf ko -l0 i9 -ib fj -fg co -cm 9u -9o 6w -6r 3z -3z 17 -1b -1h 1e -46 43 -6v 6t -9l 96 -bk 8s -8o 5w -5t 31 -2y 6 -2 -2q 2t -5l 5o -8g 8k -bc bf -e7 ea -h2 h6 -jy k1 -mt mw -po ps -sk sn -vf vi -ya ye -116 119 -141 144 -16x 171 -19t 19w -1co 1cr -1fj 1fn -1if 1ii -1la 1ld -1o5 1o7 -1qz 1r1 -1tt 1tw -1wo 1wq -1zi 1zk -22c 22e -256 259 -281 283 -2av 2ay -2dq 2ds -2gk 2gn -2jf 2jh -2m9 2mc -2p4 2p6 -2pm 2na -2n8 2kg -2kd 2hl -2hj 2er -2eo 2bw -2dp 2cp -2fh 2fe -2i6 2i3 -2kw 2kt -2nl 2ni -2o3 2lx -2lw 2j4 -2j3 2gb -2ga 2di -2dh 2ap -2ao 27w -27v 253 -252 22a -229 1zg -1zf 1wn -1wm 1tu -1tt 1r1 -1qz 1o7 -1mk 1lg -1io 1ip -1hz 1fy -1fy 1d6 -1d7 1af -1ag 17o -17p 14w -14x 125 -126 ze -ze wm -wn tv -tw r4 -r5 od -qa pf -s7 s8 -s8 pi -pg mo -mh jq -j4 ge -fs d2 -cg 9r -95 6f -5t 33 -2h -8 u -3j 59 -7g 96 -bd df -fa he -j7 lj -n0 pg -qs td -ue x0 -xx 10l -11f 146 -14e 176 -173 19u -19f 1c4 -1bi 1e5 -1da 1fm -1e4 1ga -1ek 1gk -1en 1go -1er 1gr -1et 1gt -1ew 1h0 -1f7 1hi -1fy 1i9 -1gp 1j2 -1hm 1k3 -1it 1le -1ke 1n2 -1mb 1p2 -1ot 1rl -1rg 1u7 -1uk 1xb -1xq 20e -217 23q -24v 274 -28q 2an -2cm 2dv -2gc 2gr -2jh 2iz -2lp 2kd -2ms 2l6 -2nf 2ll -2no 2lt -2nw 2m2 -2o5 2mb -2oe 2mj -2om 2ms -2ou 2n0 -2p3 2n8 -2pb 2nh -2pk 2np -2ps 2ny -2q1 2o7 -2qa 2of -2qi 2oo -2qr 2ox -2r0 2p5 -2r8 2pe -2rh 2pn -2rp',
    height: '7e 8 7 7 7 4 4 2 2 1 0 0 -1 -2 -2 -2 -3 -3 -3 -2 -2 -1 -1 -1 0 0 0 1 1 1 2 2 3 2 2 3 0 0 0 0 -2 -2 -3 -3 -6 -6 -7 -8 -7 -7 -6 -6 -4 -3 -2 -2 0 1 1 1 0 -1 -2 -2 -3 -3 -3 -4 -5 -5 -6 -6 -7 -6 -6 -7 -6 -6 -7 -8 -7 -8 -8 -8 -a -a -b -b -b -c -a -a -9 -7 -4 -2 2 8 c g h j k j j h h f e a 8 5 3 3 2 3 3 4 5 4 6 4 5 5 4 5 3 3 2 3 1 1 0 -2 -1 -2 -1 -2 -2 -2 -2 -3 -3 -4 -2 -1 2 2 3 3 2 3 1 1 1 -1 0 -2 -4 -5 -4 -3 -1 0 1 4 5 6 6 6 8 8 6 6 4 2 0 -2 -3 -4 -3 -3 -2 -4 -4 -6 -5 -6 -6 -4 -2 -1 -1 -1 -1 -1 0 0 0 -1 -1 -2 -2 -4 -4 -5 -4 -4 -5 -4 -3 -3 -1 0 1 0 1 2 1 2 3 4 3 2 2 2 1 2 2 2 0 -1 -1 -1 0 0 -1 -1 -1 -3 -2 -2 -2 0 1 0 -2 -1 -3 -2 -3 -2 -2 -1 -1 0 -1 0 0 1 1 0 2 3 3 4 4 4 4 4 3 3 3 3 4 3 1 1 -2 -3 -5 -6 -7 -4 -2 1 3 3 3 6 6 7 8 9 7 6 3 0 -3 -5 -7 -7 -7 -6 -2 -1 0 2 4 4 4 4 4 2 2 0 -3 -7 -6 -7 -7 -6 -6 -2 -1 2 3 6 7 7 6 4 4 3 1 0 -1 -3 -4 -7 -9 -9 -8 -7 -6 -4 -3 -3 -3 -3 -4 -7 -7 -7 -9 -a -a -b -9 -6 -5 -3 -2 1 4 6 8 b c e e c b 9 8 6 5 4 3 2 2 2 1 -1 -2 -3 -3 -2 -2 0 0 0 1 0 -1 -1 -2 -3 -3 -1 -2 -1 -1 -1 0 0 1 0 0 1 3 2 2 3 1 1 -1 -1 0 0 0 1 0 0 1 1 0 0 1 2 1 0 1 -1 0 2 1 1 0 0 -1 0 0 -2 -1 -1 0 0 -1 -1 -1 -1 -2 -2 -3 -3 -3 -4 -3 -4 -5 -5 -5 -6 -4 -5 -4 -3 -1 0 3 3 4 5 6 6 4 5 4 3 3 1 0 0 0 0 1 2 3 4 4 6 6',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: 'ba,0,12,r,r,9,0 53,1,j,14,3v,p,9d 70,1,1g,10,i,a,16 aq,1,40,l,v,9,8a av,0,13,s,1r,9,5q 7i,0,3h,j,15,9,dc 76,0,3x,i,14,9,36 84,0,1p,l,p,1m,g2 3d,1,p,m,c,9,2w 3o,1,f,1i,1g,9,7f 3i,1,2z,1e,19,9,9f 3i,0,1x,1e,1f,9,bj 3v,0,1s,1i,1g,9,7f a2,1,35,1b,1e,9,3 97,1,11,i,p,1s,j 94,1,1q,b,b,9,bh 7n,1,38,10,5k,9,v 84,0,3s,14,1q,9,9d 8r,1,18,14,q,9,8q 8s,0,49,28,12,9,2 91,1,15,i,s,1s,1u 7g,1,1d,10,j,a,b0 8w,1,3a,m,1d,d,fg 7r,1,1i,8,8,u,he 8z,0,1o,r,p,9,2 8o,0,1r,r,s,9,c 82,1,2k,j,14,9,e9 8g,0,43,k,17,9,cf 8b,0,3y,u,p,9,8d 8c,0,1f,o,n,g,co 8e,0,10,6,5,g,96 8a,0,1v,6,6,g,1q bl,0,10,1e,1d,9,d1 9j,0,41,8,c,3,4b 5g,0,4n,a,b,9,9d ax,1,d,8,e,9,8v ax,0,h,7,j,9,8w 4f,0,20,b,l,9,o 47,0,2i,b,w,9,9e 43,0,y,u,w,9,en 43,1,g,c,13,9,q 3w,1,1i,10,s,9,f1 3x,1,2y,e,1d,9,9g 3x,1,2c,9,b,9,9l 40,1,1x,d,v,9,53 48,1,i,e,r,9,53 48,0,v,w,r,9,er 48,1,1o,c,15,9,q 49,1,2p,c,p,9,53 45,1,2d,c,p,9,54 47,1,29,8,a,9,l 46,1,3n,c,17,9,q 45,1,4w,c,1a,9,9f 91,1,47,b,15,9,ff 95,1,4p,e,w,9,bc 3u,1,48,d,1a,9,q 3t,1,4s,8,a,9,o a0,1,1f,c,h,9,8q 2j,0,2n,c,1a,a,9d 2k,1,p,d,1a,a,dp 2r,0,23,d,1a,a,9c 2q,0,l,c,q,a,m 2q,0,1d,c,q,a,9c 2c,0,2i,c,1a,a,dq 2i,0,1u,e,1a,a,9c 2m,1,2c,1g,2k,a,dq ag,0,1g,b,r,a,d1 2f,1,1a,d,1a,a,9c o,0,4z,9,8,9,6o bf,0,27,s,s,9,y bg,0,o,8,d,9,he b5,0,15,c,a,9,d5 9o,0,19,8,a,9,4c 9o,0,31,i,12,9,d0 9o,0,58,b,o,9,cz 9o,0,4j,b,t,9,d0 d4,0,53,a,w,a,g0 9h,0,4s,4,6,3,4m 7a,0,1q,7,p,9,co 7d,0,1t,7,p,9,d2 9e,1,1b,m,1c,9,db 62,1,36,2g,2i,34,1g 9d,0,1c,j,10,9,2 bb,1,2l,v,1g,9,1 67,0,3z,7,d,9,2 5r,0,47,34,3n,9,6 4r,1,43,k,q,9,43 1i,0,11,4o,1c,k,8p e,0,39,3,8,9,ez n,0,4k,b,1x,19,l d4,0,42,8,10,9,7b d5,0,53,8,1q,9,fr d4,0,3k,4,1f,9,g1 d4,0,2w,6,17,9,7b d6,0,4t,5,16,9,ff d7,0,4c,6,1c,9,fg bl,0,b,6,8,9,8n 2o,1,u,6,6,3,9b 2t,0,f,16,b,a,n 5k,0,1n,e,t,9,dy 84,0,2r,j,r,9,n 7s,0,1l,1c,1f,m,9r aq,1,2t,4,g,9,co aq,1,3a,b,f,9,3x h,0,1z,16,1e,t,8e k,0,30,5,9,3,e3 i,0,3b,5,9,3,5k 2e,0,k,5,8,9,4z ay,0,i,8,9,9,fd 99,0,12,4,3,9,x 9h,0,19,6,a,9,dc at,1,g,9,5,9,d8 az,1,f,7,5,9,4i 9o,0,2z,9,9,9,22 2s,1,1t,a,c,9,dp 9v,0,2t,d,9,9,hd 8h,0,4u,5,5,9,bd 8o,0,4c,d,5,9,g 9o,0,44,9,9,9,cc',
    boats: '',
    bank: [],
    land: { rise: 0.3, roll: 0.2, plain: -1.0, runoff: 2.6, reach: 3 },
    scatter: [
      { kind: 'palm', side: 0, from: 20, to: 50, chance: 0.14, s: [1.0, 1.7] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  singapore: {
    label: 'SINGAPORE',
    blurb: 'Run at night under floodlights, along the water and back through '
      + 'the city, with a bumpy concrete surface and barriers everywhere. '
      + 'It is the longest race of the year by time and it is not close.',
    theme: 'marina',
    laps: 3,
    dusk: true,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 5.5,
    // And the one number about its height. Marina Bay is about five metres above
    // the sea for the whole lap; the terrain service returned a range of
    // sixty-six metres, because in a city this dense it is looking at roofs. The
    // shape of the profile is still the map's - only the size of it is ours.
    flatten: 0.12,
    metres: 3677,
    line: 'aj -3jv 3mn -3mr 3pi -3pl 3sd -3sh 3v9 -3vd 3y5 -3y9 411 -414 43w -440 46s -46w 49n -49s 4ck -4cp 4fh -4fm 4ie -4id 4kr -4jk 4lc -4j6 4kn -4ib 4jt -4hh 4iz -4gn 4i5 -4ft 4hb -4ey 4gf -4e3 4fl -4d9 4ej -4c2 4cp -4a1 4a3 -47b 473 -44c 441 -41a 40z -3y7 3xv -3v4 3ut -3s2 3rq -3oy 3on -3lw 3lk -3it 3ii -3fr 3ff -3cn 3cc -39l 399 -36i 367 -33g 334 -30c 301 -2xa 2wy -2u7 2tw -2r5 2qt -2o1 2nq -2kz 2kn -2hw 2hl -2eu 2ei -2bq 2bf -28o 28c -25l 256 -22f 220 -1z9 1yv -1w4 1vp -1sy 1sj -1pt 1pe -1mn 1m8 -1jh 1j3 -1gc 1fx -1d6 1cr -1a1 19m -16v 16g -13p 13b -10k 105 -xe wz -u8 tt -r3 qp -ny nj -ks kd -hm h7 -eg e1 -ba aw -86 7r -50 4l -1u 1f 1c -1q 4h -4u 7l -7u al -b7 dw -fu hp -kb l0 -ns nq -qh qf -t7 tf -w2 wv -zf 10h -12y 148 -16p 17z -19x 1br -1d5 1fk -1gu 1ja -1l4 1n7 -1pp 1qu -1tk 1tz -1wp 1wb -1ym 1x5 -1yz 1wx -1yh 1w6 -1xc 1uu -1us 1wo -1wc 1z3 -1yr 21i -216 23x -23l 26d -262 28t -28h 2b8 -2aw 2dn -2db 2g3 -2fy 2ip -2im 2le -2l5 2nx -2no 2qf -2q3 2sv -2sk 2vb -2uz 2xq -2x9 300 -2zk 32a -31u 34l -345 36v -36f 396 -38q 3bh -3b1 3dr -3db 3g2 -3g6 3iu -3ju 3mf -3o9 3q6 -3sx 3so -3vg 3v5 -3xe 3w6 -3xz 3vu -3xm 3vi -3xb 3v6 -3wy 3uu -3wn 3uj -3wb 3u6 -3vz 3tv -3vn 3tj -3vh 3ti -3vk 3to -3vp 3tt -3vu 3ty -3vy 3u1 -3w2 3u5 -3w5 3u8 -3w4 3u3 -3vu 3tp -3va 3t0 -3u0 3rh -3r6 3of -3px 3qw -3st 3us -3wk 3yp -40k 42m -44j 46e -47m 4a4 -4ba 4ds -4ey 4hh -4io 4l7 -4md 4ov -4q1 4sk -4t5 4vu -4w7 4yy -4zc 523 -524 54v -54q 57i -575 59w -59j 5ca -5c3 5ev -5f0 5hs -5if 5l4 -5ls 5oh -5p5 5ru -5sj 5v8 -5vw 5yk -5zh 624 -636 65q -66r 69c -6ad 6cy -6dz 6gk -6hl 6k5 -6l6 6nr -6os 6rd -6se 6uz -6w2 6ym -6zp 729 -73c 75w -772 79k -7ay 7dd -7er 7h6 -7ik 7ky -7mc 7or -7q5 7sj -7tw 7wb -7xp 803 -81k 83y -85f 87r -898 8bl -8d2 8ff -8gw 8j8 -8kh 8my -8o7 8qp -8s6 8t5 -8v5 8t7 -8v7 8ta -8va 8tc -8vc 8tf -8vf 8th -8vg 8tj -8vj 8tl -8vl 8to -8vn 8tp -8vo 8tp -8vo 8tq -8vo 8tp -8vo 8tp -8vn 8to -8vn 8to -8vm 8to -8vn 8to -8vm 8tn -8vm 8tn -8vl 8tn -8vm 8tn -8vm 8tn -8t4 8r3 -8p6 8n6 -8l9 8j9 -8hc 8fb -8de 8be -89g 87g -85k 83j -81n 7zm -7xp 7vp -7tt 7rs -7pu 7nv -7lw 7jx -7hy 7g0 -7e1 7c3 -7a4 785 -765 747 -728 70a -6yb 6wd -6ud 6sf -6qf 6oj -6mi 6km -6il 6go -6en 6cr -6aq 68t -66s 64w -62v 60z -5zv 5xb -5w9 5tp -5td 5qn -5qr 5nz -5p1 5mh -5nm 5l3 -5m7 5jn -5ks 5i9 -5jm 5h7 -5iq 5gf -5hy 5fm -5h4 5et -5g9 5dv -5f7 5cs -5e5 5bq -5d3 5an -5c0 59l -5ay 58j -5an 591 -59z 59e -56t 55v -53k 521 -505 4y4 -4wp 4ub -4ti 4qv -4qp 4nx -4oc 4lm -4k1 4hs -4fe 4e0 -4bm 4a8 -47t 46f -441 42n -408 3yu -3wg 3v1 -3sm 3r8 -3ow 3nf -3l2 3jm -3h9 3fs -3de 3by -39l 385 -35s 34c -31y 30j -2y6 2wq -2ub 2sy -2u7 2rx -2pp 2o1 -2mf 2k6 -2iq 2gd -2fa 2cq -2c3 29e -290 26a -263 23b -233 20b -204 1xd -1x6 1ue -1u7 1rf -1rc 1ok -1oh 1lq -1ln 1iv -1is 1g0 -1fw 1d4 -1d3 1ab -1aa 17i -17h 14p -14o 11w -11v z3 -z2 wa -w9 th -tg qp -qo nw -nw l4 -l3 ib -ia fi -fg co -cl 9t -9r 6z -6w 44 -42 1a -17 -1l 1n -4e 4h -79 7c -a4 a6 -cy d1 -ft fv -in iq -li lk -oc of -r7 r9 -u0 u3 -wv wx -zp zs -12k 13g -15f 186 -18e 1b2 -1bu 1ei -1fa 1hj -1iz 1k4 -1mm 1mn -1pf 1pg -1s7 1sg -1v7 1w1 -1yo 200 -22f 24f -26a 28s -29z 2co -2d9 2g0 -2gb 2j3 -2je 2m5 -2mg 2p7 -2pi 2sa -2sl 2vc -2vm 2ye -2yo 31f -31p 34g -34q 37i -37s 3aj -3at 3dl -3dv 3gm -3gx',
    height: 's 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 2 1 2 1 1 1 1 0 0 0 0 0 2 2 1 1 -1 -1 0 -1 0 0 0 0 -1 -2 -1 1 7 a c b c a 9 8 6 5 4 0 -3 -7 -a -8 -6 -3 2 5 8 6 7 c h i j j g d a 5 2 0 2 1 -3 -7 -7 -7 -6 -6 -6 -4 -4 -5 -4 -5 -4 -4 -3 -3 -3 -3 -2 -2 -1 1 3 3 4 6 7 7 7 6 6 4 1 1 -1 -1 -3 -3 -3 -5 -6 -9 -b -b -c -c -g -h -j -k -m -i -e -9 -3 0 1 2 5 b e k p s p k f b 9 9 8 6 5 5 4 6 9 b 7 3 0 0 -1 -2 -3 -6 -b -h -g -f -b -6 -2 4 3 4 6 8 a e f b 5 -2 -2 -3 -3 -3 -4 -5 -4 -6 -5 -6 -5 -6 -6 -5 -5 -5 -5 -3 -3 -4 -3 -4 -4 -5 -4 -5 -5 -4 -5 -4 -3 -2 -1 0 1 0 -1 -3 -7 -c -f -i -h -f -b -8 -6 -4 -2 -1 2 4 9 d e d a 7 3 2 2 5 8 g o v 13 19 1f 1i 1l 1k 1i 1p 1y 21 1v 1r 1o 1d 17 14 z p g 5 -i -17 -1o -1y -21 -24 -1y -1y -24 -26 -22 -1s -1h -13 -n -a -1 0 0 -3 -1 1 3 5 4 5 5 4 3 1 0 -2 -4 -2 -1 2 6 8 b b 8 6 4 2 1 0 0 -2 -3 -8 -b -g -h -f -e -7 1 7 9 9 7 7 7 6 7 6 7 5 -2 -7 -d -e -f -e -f -e -d -f -g -h -g -e -c -b -a -9 -8 -8 -7 -6 -4 -2',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '96,1,2k,1h,1a,g,5w 7g,1,4z,z,q,x,dj 7g,1,3x,2v,22,k,4u 7p,1,3y,y,1k,o,7e 7g,1,3n,17,1e,9,dj 7g,0,21,v,w,9,f 7a,1,w,u,w,9,4c 7b,0,19,y,x,40,4e 5b,0,1k,1b,f,46,80 5z,0,20,1e,g,46,d4 5d,1,1o,1n,14,d,ha 5i,1,3k,2g,m,j,bo 8i,1,1h,u,x,67,ej 14,0,10,1s,5k,f,hf 4,0,28,1m,1y,9,1p 7s,0,z,z,10,40,d3 7y,1,v,5,d,4,79 85,1,1a,x,x,4e,7l 9l,0,3o,2h,2o,a,25 6a,1,3x,o,h,9,d0 66,1,52,t,h,c,7e 67,1,53,h,g,q,89 67,1,3q,h,e,m,4c 8t,1,s,e,9,3,b5 5d,1,3n,11,x,2u,9 5c,1,3s,2g,1o,9,cu 2,0,1z,2f,p,9,fi 67,1,4u,a,5,c,d7 66,1,4g,c,4,c,30 67,1,33,d,8,o,0 66,1,54,b,4,c,32 66,1,4k,c,7,c,bq 66,1,57,b,4,c,bs 66,1,4p,c,4,c,bq 66,1,59,b,4,c,32 66,1,4s,c,4,c,bq 66,1,4v,c,4,c,30 67,1,47,9,4,c,4e 66,1,3e,f,3,c,br 66,1,4z,c,4,c,30 66,1,54,c,6,c,30 66,1,59,b,3,c,2x 66,1,3h,f,4,c,br 67,1,4v,b,4,c,d7 66,1,3j,f,4,c,31 67,1,47,b,4,c,d4 66,1,3m,f,4,c,bs 67,1,4x,b,4,c,4h 66,1,4b,c,4,c,bq 66,1,3o,f,4,c,bs 67,1,4z,b,4,c,d7 66,1,3r,f,4,c,bs 66,1,4e,c,4,c,bq 66,1,3u,f,4,c,32 66,1,44,n,g,m,g4 67,1,52,b,4,c,4h 67,1,4o,f,8,q,85 2y,0,18,i,k,g,h0 2s,0,s,8,9,g,gw 7v,0,1r,3h,1t,k,hd 33,1,2i,8,a,g,h7 10,0,2o,b,s,4,dj 13,0,1y,9,j,4,8p 79,1,1y,21,1w,k,27 5v,1,37,38,2t,9,cu 60,1,28,21,15,9,d5 5v,1,4x,11,1d,9,8k 8m,0,z,a,17,3,8g 8c,0,10,4,10,3,6 88,0,s,i,7,3,g8 84,0,19,d,p,3,6q 8i,0,e,3,7,3,3 a3,1,g,3,3,9,h8 9l,0,48,19,1e,f,7n 6d,1,23,10,10,9,48 6a,1,2d,19,o,e,d4 6g,1,3j,o,e,9,4b 6e,1,42,q,w,9,cz 66,1,35,31,1b,6,g4 8i,1,47,41,3h,1b,8 7z,1,16,7,8,5,g0 66,1,2h,x,m,2o,6u 66,1,4v,j,t,2o,b8',
    boats: '9s,1,7p,i,40 9s,1,7y,t,8d 9s,1,8j,t,cq a2,1,1d,j,48 a2,1,o,11,hb',
    bank: [],
    land: { rise: 0.4, roll: 0.3, plain: -1.1, runoff: 1.8, reach: 2,
      sea: { at: 0.30, span: 0.22, level: -3 } },
    scatter: [
      { kind: 'palm', side: 0, from: 16, to: 38, chance: 0.2, s: [0.9, 1.4] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      // The MRT runs across Marina Bay on a viaduct, in sight of the circuit.
      { at: 0.420, kind: 'train', side: -1, off: 110, s: 1, lift: 9 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  madrid: {
    label: 'MADRID',
    blurb: 'New for 2026 and half street circuit, half purpose-built: it runs '
      + 'out of the exhibition grounds, through a tunnel, and back over '
      + 'ground that climbs and falls more than a city has any business '
      + 'doing. The tunnel here was not put in by hand either.',
    theme: 'iberia',
    laps: 3,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 6.0,
    metres: 5471,
    line: '-j1n 1b65 -1b7p 1ba0 -1bbj 1bdv -1bfh 1bhq -1bji 1bln -1bng 1bpk -1brc 1bth -1bv8 1bxd -1bz4 1c1a -1c2o 1c51 -1c5u 1c8i -1c99 1cbx -1ccq 1cfe -1cg6 1ciu -1cjm 1cma -1cmy 1cpn -1cq8 1csy -1ctk 1cwa -1cww 1czl -1d06 1d2w -1d3i 1d67 -1d6w 1d9l -1daw 1ddb -1dex 1dh7 -1dib 1dkt -1dk3 1dmp -1dkn 1dmi -1dkc 1dm1 -1dju 1dlk -1dje 1dl4 -1djj 1dlr -1dl5 1dnu -1dnp 1dqh -1dqq 1dth -1du7 1dww -1dy6 1e0m -1e1y 1e4e -1e5r 1e86 -1e9i 1eby -1edb 1efq -1eh3 1eji -1ekn 1en6 -1env 1eqj -1eqr 1etj -1etj 1ewb -1ewb 1ez3 -1ez3 1f1v -1f1v 1f4n -1f4o 1f7g -1f7g 1fa8 -1fa8 1fd0 -1fd0 1ffs -1ffs 1fik -1fik 1flc -1fld 1fo5 -1fo5 1fqx -1fqx 1ftp -1ft8 1fvy -1fv7 1fxv -1fwd 1fyo -1fwm 1fyh -1fwc 1fy4 -1fvt 1fxc -1fv1 1fwl -1fua 1fvu -1ftj 1fv3 -1fsx 1fun -1fsl 1fuh -1fsv 1fv4 -1ftt 1fw9 -1fvi 1fy6 -1fxt 1g0j -1g0o 1g3g -1g42 1g6r -1g7h 1ga6 -1gb4 1gdq -1ger 1ghc -1gid 1gky -1gly 1goj -1gpk 1gs5 -1gt6 1gvr -1gws 1gzd -1h0e 1h2z -1h3z 1h6k -1h7l 1ha6 -1hb8 1hdt -1hek 1hh8 -1hhu 1hkj -1hkf 1hn7 -1hmu 1hpl -1hp0 1hrq -1hqt 1htf -1hsd 1hux -1htk 1hvz -1hui 1hwv -1hux 1hwx -1huv 1hwp -1huj 1hwa -1htt 1hv2 -1hsj 1htn -1hr0 1hrw -1hp8 1hpz -1hn8 1hno -1hkx 1hl9 -1hih 1hif -1hfn 1hfh -1hcs 1hc7 -1h9i 1h8u -1h66 1h5d -1h2t 1h1r -1gzb 1gxz -1gvo 1gu5 -1gs1 1gq9 -1goa 1gmb -1gkh 1gif -1ggn 1geh -1gcu 1gam -1g9c 1g6v -1g5o 1g36 -1g2h 1fzs -1fz8 1fwj -1fw6 1fte -1fta 1fqj -1fqj 1fnr -1fny 1fl6 -1flh 1fiq -1fj6 1fgf -1fh2 1fed -1ff3 1fce -1fdc 1faq -1fbv 1f9c -1fan 1f87 -1f9o 1f7c -1f8v 1f6j -1f82 1f5q -1f79 1f4x -1f6f 1f44 -1f5n 1f3b -1f4x 1f2o -1f4d 1f25 -1f3u 1f1n -1f3b 1f13 -1f2s 1f0l -1f2a 1f02 -1f1q 1ezj -1f18 1ez0 -1f0o 1eyg -1f05 1exy -1ezl 1exc -1eyz 1ewq -1eyd 1ew5 -1exs 1evj -1ex7 1euz -1ewm 1eud -1ew0 1etr -1eve 1et6 -1eut 1esk -1eu4 1ert -1etd 1er2 -1esm 1eqb -1eru 1epj -1er3 1eos -1eq1 1enk -1eoa 1eln -1elc 1eim -1eh9 1eev -1ecw 1eb0 -1e8s 1e73 -1e4w 1e37 -1e0z 1dzb -1dx4 1dvf -1dt7 1drj -1dpb 1dnn -1dlf 1djr -1dhj 1dfv -1ddm 1dby -1d9q 1d82 -1d5u 1d46 -1d1z 1d0a -1cy4 1cwe -1cud 1csh -1cqk 1cok -1cn4 1ckq -1cjj 1ch1 -1cg6 1cdk -1cd6 1caf -1ca5 1c7d -1c79 1c4h -1c4e 1c1m -1c1i 1byq -1bym 1bvu -1bvr 1bt0 -1bsw 1bq4 -1bq0 1bn8 -1bn5 1bkd -1bk9 1bhh -1bhc 1bek -1bec 1bbk -1bbc 1b8k -1b80 1b5b -1b4q 1b20 -1b0s 1aya -1ax2 1auk -1asy 1aqp -1ap0 1ams -1aku 1aiv -1agx 1aey -1acu 1ab2 -1a8v 1a75 -1a4v 1a3a -1a0x 19zh -19wy 19vt -19t8 19s8 -19pi 19oz -19m8 19ls -19j0 19iq -19fz 19fp -19cx 19ct -19a1 19a0 -1978 1977 -194f 194e -191m 191l -18yt 18ys -18w0 18vz -18t7 18t6 -18qe 18qm -18nw 18od -18lo 18ma -18jq 18ku -18ib 18jg -18h2 18ig -18g3 18hl -18f8 18gp -18e2 18em -18c8 18b0 -1897 1874 -185v 183d -1820 17zl -17y3 17vr -17u9 17rx -17qf 17o3 -17mk 17k8 -17iq 17ge -17ew 17ck -17b3 178q -177a 174x -173g 1713 -16zn 16x9 -16vy 16ti -16s9 16ps -16oi 16m1 -16ky 16ie -16hc 16er -16dh 16b1 -169d 1677 -1655 1639 -160y 15zf -15x2 15vm -15sy 15s4 -15pg 15or -15lz 15lq -15iz 15iq -15fy 15fv -15d3 15d6 -15ae 15aj -157s 1581 -1559 155h -152p 152t -1501 1502 -14xa 14xc -14uk 14un -14rv 14rq -14oz 14os -14m1 14li -14it 14i5 -14fh 14ep -14c8 14b0 -148v 1474 -1459 1436 -141h 13za -13xs 13vg -13u8 13rq -13qm 13o2 -13n0 13kg -13jm 13gz -13gj 13ds -13db 13al -13a4 137d -136x 1347 -133q 130z -130j 12xs -12xb 12ul -12u4 12rd -12qx 12o7 -12nq 12kz -12ki 12hr -12hb 12el -12e4 12bd -12aw 1285 -127p 124z -124i 121r -121b 11yl -11y4 11vd -11uw 11s5 -11rp 11oz -11oi 11lr -11la 11ij -11i3 11fd -11ew 11c5 -11b9 118p -1176 114u -113c 1110 -10zg 10x8 -10ux 10wg -10u4 10vn -10tb 10ut -10se 10tq -10r0 10rk -10ot 10p7 -10mg 10mt -10k2 10kg -10hp 10i3 -10fc 10fq -10cz 10dd -10al 10aq -107y 1082 -105a 105d -102n 1029 -zzv zyj -zx4 zur -zu5 zrg -zqy zo7 -zno zky -zkg zhq -zh8 zeh -zdz zb9 -zaq z80 -z7i z4s -z4a z1j -z10 yya -yxs yv2 -yuk yrt -yra yok -yo2 ylc -yku yi3 -yhk yeu -yec ybm -yb4 y8d -y7v y55 -y4m y1w -y1e xyn -xy5 xvf -xuw xs6 -xro xox -xof xlp -xl6 xig -xhy xf7 -xf3 xce -xdk xb2 -xd1 xb4 -xdp xcs -xfi xez -xhq xh7 -xjx xjf -xm5 xlm -xoc xnt -xqk xq1 -xsr xs9 -xuz xug -xx6 xwn -xze xyv -y1l y13 -y3t y3a -y60 y5h -y87 y7o -yaf y9w -ycm yc5 -yew yee -yh4 ygn -yje yix -yln yl5 -ynw ynf -yq5 ypn -ysd yrw -yun yu5 -ywv ywe -yz5 yyn -z1d z0w -z3n z35 -z5v z5e -z85 z7n -zad z9w -zcn zc6 -zew zee -zh5 zgo -zje ziw -zln zl6 -znw zne -zq5 zpp -zsf zry -zup zu8 -zwy zwh -zz8 zyr -101i 1012 -103s 103b -1062 105m -108d 107w -10am 10a6 -10cx 10cg -10f7 10er -10hh 10h0 -10jr 10ja -10m0 10lk -10ob 10ns -10qi 10py -10so 10s5 -10uv 10ub -10x1 10wi -10z8 10yo -111e 110v -113l 1131 -114w 1131 -113n 110y -1113 10yc -10yh 10vp -10vw 10t4 -10uq 10sj -10v4 10u8 -10x0 10wv -10zn 10zh -1129 1123 -114v 114p -117g 117a -11a1 11ah -11d6 11ds -11gh 11h7 -11ju 11kp -11na 11o9 -11qu 11rw -11ue 11vl -11y1 11zc -121q 1235 -125j 126z -128n 12at -12ca 12em -12g4 12ih -12jz 12mb -12ns 12q5 -12rn 12tz -12vg 12xt -12zb 131n -1334 135g -136y 139b -13at 13d5 -13em 13gz -13ih 13kt -13ma 13on -13q5 13sh -13tz 13wc -13xt 1405 -141n 143z -145g 147t -149b 14bn -14d4 14fh -14gz 14jb -14kt 14n6 -14on 14qz -14sh 14uu -14wb 14yn -1505 152h -153z 156c -157t 15a5 -15bn 15e0 -15fh 15ht -15jb 15lo -15n5 15ph -15qz 15tc -15uu 15x6 -15yn 160z -162h 164u -166c 168o -16a6 16ci -16dz 16gc -16hu 16k6 -16lo 16o0 -16pc 16rs -16t0 16vi -16wr 16z8 -170g 172y -1747 176o -177w 17ae -17bh 17e1 -17f0 17hm -17im 17l7 -17m7 17os -17pj 17s7 -17sw 17vl -17wd 17z1 -17zw 182j -183a 185y -186i 1898 -189s 18ci -18d3 18ft -18gc 18j2 -18jk 18mb -18mn 18pe -18pq 18sh -18sm 18ve -18vi 18ya -18ya 1912 -1912 193u -193s 196k -196d 1995 -198v 19bm -19b7 19dy -19dh 19g8 -19fn 19ic -19hp 19kf -19jp 19md -19lk 19o8 -19ne 19q1 -19p3 19rp -19qp 19ta -19s6 19uq -19tl 19w4 -19ux 19xg -19w2 19yg -19wl 19yn -19wn 19yl -19w8 19x3 -19uf 19v5 -19sp 19u1 -19sd 19uj -19tr 19we -19wj 19z9 -1a0d 1a2w -1a4s 1a6q -1a98 1aae -1ad6 1adg -1adl 1aek -1aeu 1ahi -1aie 1al1 -1alx 1aok -1apg 1as3 -1asy 1avl -1awh 1az3 -1azz 1b2m',
    height: '6k 6 6 6 5 5 4 6 4 4 5 5 4 5 4 3 4 3 4 3 2 1 0 -4 -6 -9 -a -a -a -9 -9 -8 -7 -6 -7 -6 -6 -5 -5 -3 -5 -4 -4 -4 -3 -3 -3 -2 -3 -2 -1 0 1 1 0 0 0 -1 -3 -3 -4 -4 -3 -4 -4 -4 -4 -3 -3 -3 -2 -2 -1 0 1 2 2 2 3 3 3 2 2 0 0 -1 -1 -1 -1 -3 -2 -3 -4 -3 -4 -4 -3 -3 -3 -3 -4 -4 -4 -5 -5 -5 -4 -4 -3 -3 -1 -2 -1 -1 -1 0 0 1 1 1 3 2 1 2 2 1 2 1 2 1 2 1 2 1 1 2 2 3 4 5 4 5 4 5 5 3 3 1 2 0 -1 -1 -3 -2 -2 -2 -1 -2 -1 0 1 2 2 3 3 3 2 3 3 2 2 3 2 2 1 1 0 0 0 0 -1 0 0 0 1 1 1 3 4 5 5 5 7 6 5 6 5 5 4 3 3 0 0 0 -1 -1 -1 -1 -2 -3 -4 -6 -6 -8 -7 -9 -9 -9 -9 -8 -9 -7 -7 -7 -6 -6 -5 -6 -4 -4 -4 -5 -3 -4 -4 -2 -2 0 1 1 3 4 3 2 1 1 0 -1 -1 -2 -3 -3 -3 -4 -4 -4 -4 -4 -4 -3 -3 -3 -3 -3 -3 -3 -3 -3 -3 -1 -1 0 0 2 2 4 6 7 7 8 9 7 6 6 4 5 4 3 2 0 -1 -2 -1 -3 -2 -1 -1 0 0 1 0 2 1 2 1 1 1 1 1 0 1 1 0 0 -1 -1 0 -1 -1 1 2 3 4 3 2 2 0 -2 -2 -1 -2 0 -2 -1 -2 -3 -4 -3 -3 0 0 2 -1 -1 -4 -3 -6 -6 -5 -3 -3 -2 -2 0 2 4 5 7 7 7 6 5 4 2 1 1 -1 -1 -2 -1 -2 0 2 3 4 4 5 3 2 2 1 -1 -2 -2 -3 -4 -4 -5 -5 -4 -3 -3 -3 -3 -2 -2 -3 -2 -2 -3 -2 -2 -2 -1 -2 -1 -1 0 0 0 0 0 1 0 2 1 2 1 1 0 -1 -1 -2 -2 -3 -4 -4 -5 -5 -4 -2 -1 1 2 3 4 4 7 7 8 6 5 4 2 1 -1 -2 -4 -5 -6 -9 -8 -9 -7 -5 -3 -2 0 1 2 3 4 5 7 7 8 7 6 5 5 4 3 3 1 1 0 -1 -1 -1 -2 -1 0 0 1 2 3 4 4 5 4 4 3 2 1 -1 -1 -3 -3 -4 -6 -6 -7 -6 -6 -5 -2 0 2 3 4 5 6 7 8 a b b b 9 8 6 6 5 5 4 4 3 4 3 4 3 3 2 2 2 1 2 1 2 1 0 0 0 2 4 4 6',
    tunnel: '1100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111',
    buildings: 'bc,1,26,1f,1r,9,8q 8u,1,2s,2s,2k,9,he ar,1,4q,26,34,9,8r 81,1,2p,3r,2p,9,0 bc,1,4q,2j,38,9,8q 76,1,23,1t,29,9,7j 8l,1,3h,27,2o,9,5h 8c,1,3a,2j,33,9,d3 ar,1,27,1l,1r,9,8r 9p,1,2l,2i,2e,9,4f dg,0,54,r,10,9,cu d0,1,21,s,y,9,12 9y,0,4b,n,n,9,6g cb,0,14,x,m,9,0 bu,0,53,11,18,9,e 6,1,1q,8,7,9,7n a,1,21,6,d,9,dw b,1,1e,8,9,9,9i c,1,14,a,b,9,r 2d,0,4l,5,5,9,s ce,1,1c,1a,1c,9,13 cx,1,3q,1u,4g,9,13 cm,0,1g,6,5,9,4a ck,0,1f,d,9,9,8r d1,1,w,13,w,9,8r ab,0,4e,7,7,3,8s cl,0,12,e,9,9,8q 2d,0,4f,5,6,9,9j e,0,1f,n,u,9,h9 a,0,27,b,b,9,f4 b,0,2q,c,b,9,fb d,0,36,b,9,9,6g 1n,0,38,7,1c,9,f4 2d,0,3u,d,l,9,9h 1l,0,3e,6,7,9,er 1k,0,3r,9,7,9,gk 1m,0,3d,6,6,9,74 1m,0,3k,6,6,9,74 1m,0,3q,6,6,9,2v 1n,0,3y,6,6,9,au 1n,0,46,5,6,9,ar 1k,0,3w,6,6,9,h0 1h,0,3v,6,o,9,8q 1b,0,3l,8,8,9,e1 1e,0,3z,7,9,9,e0 1c,0,3k,8,7,9,z 1e,0,3f,f,i,9,x 15,0,3g,1b,l,9,gg 2b,0,4r,6,6,9,e6 1n,0,4s,6,6,9,ar 1m,0,4e,6,8,9,bk 1m,0,4j,5,7,9,2t 1m,0,4l,7,9,9,fv h,0,1h,6,6,9,h8 i,0,1h,5,b,9,19 j,0,1m,8,a,9,9y i,0,1v,5,5,9,fr o,0,2d,h,b,9,62 j,0,3c,a,7,9,2t h,0,3x,c,7,9,2s n,0,2s,b,6,9,38 n,0,22,e,7,9,39 o,0,1h,8,7,9,67 1e,0,53,d,f,9,e0 1g,0,58,6,9,9,d7 1g,0,4p,c,c,9,8q 1j,0,4o,5,8,9,d7 1k,0,57,4,8,9,3y 1k,0,58,4,7,9,cl 1k,0,4m,5,7,9,cm 1k,0,4q,3,a,9,3x 1k,0,53,4,4,9,3y 1k,0,4o,6,8,9,3y 1b,0,3q,7,9,9,dy 1a,0,3u,7,8,9,dz 19,0,3u,9,9,9,e1 18,0,3z,7,8,9,e1 17,0,42,7,7,9,e5 17,0,48,6,6,9,5j 16,0,4a,a,8,9,fy 15,0,44,9,6,9,7p 15,0,3y,8,6,9,3e p,0,3m,7,7,9,8x 14,0,3v,9,6,9,gz p,0,4j,8,6,9,4o p,0,4m,4,7,9,ap 15,0,4u,4,8,9,53 p,0,59,j,8,9,dc p,0,5a,4,7,9,20 2d,0,57,8,7,9,dx 2e,0,53,8,6,9,ds 2f,0,4o,9,8,9,ea 2f,0,50,7,8,9,4n 1l,0,4v,6,7,9,cb',
    boats: '',
    bank: [],
    land: { rise: 1.2, roll: 0.8, plain: -1.4, runoff: 3.4, reach: 5 },
    scatter: [
      { kind: 'oak', side: 0, from: 26, to: 70, chance: 0.16, s: [0.8, 1.4] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  baku: {
    label: 'BAKU',
    blurb: 'Two kilometres flat out along the Caspian and, before that, a '
      + 'climb through the old city where the walls close to seven and a '
      + 'half metres - narrower than anywhere else in this game, Monaco '
      + 'included. Get it wrong there and the lap is over.',
    theme: 'coast',
    laps: 3,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 5.0,
    metres: 6060,
    line: '-7qe -6ri 6u1 -6v7 6xq -6yw 71f -72l 754 -76a 78s -79y 7ch -7dn 7g6 -7hc 7jv -7l1 7nk -7op 7r7 -7sd 7uw -7w2 7yl -7zr 82b -83f 865 -86k 89c -897 8bs -8au 8d7 -8bq 8dm -8bm 8d3 -8ar 8bt -899 8ab -87q 88s -868 87b -84r 85t -838 84b -81r 831 -80k 81t -7zc 80m -7y5 7ze -7wx 7y7 -7vq 7wz -7ui 7vs -7tb 7uk -7s3 7td -7qw 7sd -7q0 7ru -7ps 7ru -7py 7rz -7q3 7s5 -7q9 7sa -7qf 7sh -7ql 7sn -7qr 7ss -7qx 7sz -7r3 7t5 -7r9 7ta -7rf 7th -7rl 7tm -7rq 7ts -7rx 7tz -7s3 7u4 -7s8 7ua -7sf 7ug -7sk 7um -7sq 7us -7sw 7ux -7t2 7v4 -7t8 7v7 -7t9 7v5 -7t3 7uc -7rw 7sn -7pz 7qg -7np 7o6 -7lg 7lx -7j6 7jn -7gw 7hd -7en 7f4 -7cd 7cu -7a4 7al -77u 78b -75l 762 -73b 73v -715 71r -6z2 6zw -6x8 6yf -6vx 6xq -6vn 6xs -6w0 6y8 -6wk 6ys -6x4 6zc -6xo 6zw -6y8 70f -6yq 70x -6z8 71f -6zp 71w -707 72e -70p 72w -716 73d -71o 73v -726 74d -72n 74u -735 75c -73n 75u -744 76b -74m 76t -754 77b -75l 77s -763 78a -76k 78r -772 799 -77k 79r -781 7a8 -78j 7aq -791 7b8 -79i 7bp -7a0 7c7 -7aj 7ct -7b7 7dh -7bv 7e6 -7co 7f1 -7dj 7g0 -7eq 7h7 -7fy 7ih -7hc 7jv -7iq 7l9 -7k3 7mm -7lh 7o0 -7mu 7pd -7o8 7qr -7pl 7s4 -7qz 7ti -7sc 7ur -7te 7vs -7ud 7wr -7vc 7xq -7wb 7yq -7xc 7zp -7y8 7zn -7xf 7ww -7u7 7td -7qp 7pv -7n8 7me -7jq 7iw -7g9 7fg -7cs 7by -79b 78h -75t 74z -72c 736 -719 73t -72p 759 -746 76q -75n 787 -774 79o -78m 7b6 -7a2 7cm -7bi 7e2 -7cy 7fh -7ed 7gx -7fu 7ie -7ha 7jt -7ip 7l8 -7k2 7ml -7lf 7ny -7ms 7pb -7o5 7qn -7ph 7s0 -7qt 7tb -7s4 7um -7tf 7vy -7ur 7x9 -7w2 7yk -7xd 7zv -7yo 816 -7zy 82g -817 83o -82f 84w -83o 866 -84x 87e -865 88n -87f 89x -88p 8b7 -89z 8cg -8b8 8dr -8ck 8f2 -8dw 8gf -8f8 8hq -8gj 8j2 -8hw 8ke -8j7 8lq -8kk 8n2 -8lv 8oe -8n7 8pp -8oj 8r2 -8pv 8sd -8r6 8to -8si 8v1 -8tu 8wd -8v7 8xq -8wl 8z4 -8xy 90h -8zb 91u -90p 937 -920 94i -93b 95u -94o 977 -961 98k -97e 99x -98t 9bc -9a7 9cr -9bn 9dm -9dx 9f1 -9hl 9iq -9l9 9md -9ox 9q1 -9sk 9to -9w8 9xc -9zw a11 -a3k a4p -a79 a8d -aaw ac0 -aek afs -ai5 akx -akq anc -ame aoy -anx aqi -apg as1 -ar0 atk -ash av1 -aty awh -awx azm -azh b20 -b0x b3h -b2d b4x -b3u b6e -b5b b7v -b6r b9b -b88 bas -b9o bc8 -bb5 bdp -bcm bf6 -be2 bgm -bfj bi3 -bh0 bjk -big bkz -bjv bmf -blb bnu -bmp bp9 -bo5 bqo -bpk bs4 -bqz bti -bse buy -btt bwc -bv8 bxs -bwn bz6 -by2 c0l -bzg c20 -c0w c3f -c2b c4v -c3q c69 -c55 c7p -c6k c93 -c7z caj -c9e cbx -cat cdd -cc8 cdf -cbc cau -c84 c76 -c4k c3l -c0z c00 -bxf bwc -bts bsj -bq1 boy -bme blb -bir bho -bf4 bdz -bbg bab -b7s b6n -b44 b2w -b0d az6 -awo avg -asy arr -ap9 ao1 -alj akc -ahu agm -ae4 acx -aaf a97 -a6p a5i -a30 a1u -9zb 9y6 -9vn 9ug -9ry 9qs -9o9 9n5 -9kl 9jj -9gz 9fw -9dc 9c9 -99o 98m -962 94z -92f 91c -8ys 8x6 -8vq 8t4 -8u1 8rg -8sh 8pw -8qx 8oc -8pd 8ms -8nt 8l8 -8m9 8jo -8kn 8i1 -8j0 8gf -8hf 8et -8fs 8d6 -8e5 8bk -8cj 89x -8aw 88a -899 86o -87n 851 -861 83h -84j 81z -832 80h -81i 7yx -7zz 7xf -7yh 7vw -7wy 7ue -7vg 7sv -7tx 7rd -7sf 7pu -7qv 7ob -7pd 7ms -7nu 7l9 -7mb 7jr -7kt 7i8 -7j9 7go -7hp 7f4 -7g5 7dk -7el 7c1 -7d4 7al -7bq 797 -7ac 77t -78y 76f -77l 751 -766 73n -74s 729 -73f 70w -721 6zi -70n 6y4 -6za 6wr -6xw 6vd -6wi 6tz -6v5 6sm -6tr 6r8 -6sd 6pu -6r0 6oh -6pm 6n3 -6o8 6lp -6mv 6kc -6lh 6ix -6k2 6hj -6ip 6g6 -6hb 6es -6fx 6de -6ek 6c1 -6d5 6am -6br 697 -6ac 67t -68y 66f -67l 653 -669 63q -64w 62d -63i 60z -625 5zm -60s 5y9 -5zf 5ww -5y1 5vi -5wo 5u6 -5vc 5st -5tz 5rg -5sl 5q2 -5r8 5op -5pv 5nc -5oi 5lz -5n4 5kl -5lr 5j9 -5kf 5hw -5j2 5gj -5ho 5f5 -5gb 5ds -5ex 5cd -5dg 5au -5bu 599 -5a9 57n -58m 561 -570 54e -55d 52r -53q 514 -523 4zi -50g 4xt -4yr 4w5 -4x2 4ug -4vd 4sq -4tn 4r1 -4rz 4pd -4qa 4no -4ol 4n5 -4lo 4kr -4i4 4h7 -4el 4do -4b2 4a5 -47i 46l -43z 432 -40f 3zi -3ww 3vz -3td 3sg -3pt 3ow -3ma 3ld -3iq 3ht -3f7 3ea -3bn 3aq -384 378 -34m 33j -318 2yl -2zg 2wt -2xp 2v2 -2vy 2tc -2u8 2rl -2si 2pv -2qr 2o5 -2p1 2me -2na 2kn -2lk 2iy -2ju 2h7 -2i3 2fg -2gc 2dq -2en 2c0 -2cw 2a9 -2b3 28f -296 26h -278 24k -25b 22m -23c 20o -21f 1yr -1zi 1wt -1xj 1uv -1vm 1sy -1tp 1r0 -1rr 1p3 -1pt 1n5 -1nw 1l7 -1ly 1ja -1k1 1hc -1i2 1fe -1g5 1dg -1e4 1bf -1c4 19f -1a4 17f -183 17m -1a3 19z -1cr 1co -1fg 1fc -1i4 1i2 -1ku 1kr -1nj 1ng -1q8 1q5 -1sx 1t2 -1vt 1ua -1vs 1t5 -1u1 1rf -1sb 1po -1qk 1ny -1ov 1m8 -1n4 1kh -1ld 1iq -1jm 1h0 -1hw 1f9 -1g5 1di -1ee 1br -1cn 1a1 -1ax 18a -196 16j -17f 14s -15o 132 -13y 11b -127 zk -10g xt -yp w3 -wz uc -v7 sk -tf qr -rm oz -pu n7 -o3 lg -mb jp -kl hy -iu g7 -h3 eh -fd cq -dm az -bw 99 -a5 7i -8a 5j -61 3d -42 1f -2a -d -j -24 19 -3w 30 -5n 4s -7f 6j -96 8b -ay a2 -cp bu -eh dl -g7 fc -gc ei -dw b7 -al 7v -79 4k -3y 18 -m -23 2o -5e 5y -8o 99 -bz ck -fa fv -ik j5 -lv mg -p6 pm -sd ss -vj vy -yo z3 -11u 129 -150 15h -188 18y -1bm 1c9 -1ey 1fm -1ic 1iz -1lo 1mc -1p1 1po -1sd 1t1 -1vq 1wj -1z7 1xj -1z7 1wu -1ya 1vw -1xc 1uz -1we 1u0 -1vg 1t2 -1ui 1s5 -1tk 1r6 -1sm 1q9 -1rp 1pb -1qr 1oe -1pu 1nj -1p2 1mx -1op 1mu -1ow 1nb -1pl 1od -1qv 1q0 -1sn 1ru -1ui 1tq -1wd 1vk -1y8 1xg -204 1zc -220 218 -23w 233 -25r 24y -27m 26t -29h 28p -2bc 2aj -2d7 2ce -2f2 2e9 -2gx 2g4 -2ir 2hx -2kl 2js -2mf 2lo -2od 2nt -2qi 2qa -2t2 2t3 -2vv 2vz -2yr 2yx -31p 31v -34n 34s -37j 37p -3ah 3am -3de 3dk -3gc 3gi -3ja 3jh -3m9 3mg -3p7 3pd -3s5 3sc -3v4 3vb -3y3 3ya -412 418 -43z 446 -46y 474 -49w 4a2 -4cu 4cz -4fr 4fx -4io 4iu -4lm 4lv -4om 4qr -4sf 4uv -4w5 4ym -4zw 52d -53n 564 -57e 59v -5b5 5dm -5ev 5hc -5im 5l3 -5md 5ot -5q3 5sk -5tu 5wb -5xl 602 -61c 63t -652 67j -68t 6ba -6ck 6f1 -6gb 6is -6k2 6mi -6ns',
    height: '1t -4 -4 -4 -2 -3 -2 -1 -2 -1 -2 -2 -2 -2 -2 0 -1 -1 -1 0 0 1 2 2 3 4 4 4 4 4 2 2 0 -2 -3 -4 -4 -3 -4 -3 -3 -3 -4 -2 -1 -1 1 1 2 1 1 1 0 -1 0 0 0 1 1 0 2 1 2 2 3 2 2 2 0 1 -1 -1 -2 -3 -3 -3 -2 -2 -3 -1 -1 1 1 3 3 3 5 5 4 4 5 4 5 3 2 1 0 1 1 1 2 1 2 1 0 0 -1 -1 -1 -1 -2 -1 -2 -1 -2 -1 -2 -2 -3 -2 -3 -2 -2 -1 -2 -1 -2 -2 -1 -2 0 2 2 4 5 5 5 5 5 4 3 4 5 4 3 3 1 1 0 0 0 -1 0 -2 -2 -3 -4 -3 -3 -3 -2 -2 -3 -2 -1 -3 -1 -1 -2 0 -3 -2 -2 -3 -1 -1 1 1 4 3 3 5 5 7 7 6 7 7 4 2 1 -1 -2 -4 -4 -4 -6 -6 -6 -6 -7 -6 -5 -4 -3 -3 -2 -3 -3 -2 -2 -1 0 1 1 1 -1 -2 -1 -2 -1 -2 -2 -3 -4 -4 -3 -2 -2 0 1 1 3 4 3 3 2 2 1 0 0 0 -1 0 1 1 1 2 2 3 1 2 2 0 -2 -3 -4 -5 -6 -6 -6 -6 -4 -2 -2 -1 0 2 3 4 5 6 6 7 6 6 6 4 4 3 3 1 0 -1 -3 -3 -4 -3 -4 -4 -2 -3 -1 -2 0 2 2 3 4 4 4 3 3 2 3 4 5 5 5 7 6 6 6 5 6 4 5 5 4 3 2 1 -1 -2 -3 -3 -2 -3 -3 -2 -3 -3 -2 -3 -2 -1 -2 -2 0 -2 -1 -3 -2 -2 -3 -2 -1 0 0 3 1 2 2 2 3 0 0 -1 -2 -3 -4 -4 -6 -5 -5 -6 -4 -4 -3 0 0 0 0 0 0 -1 0 0 0 0 0 1 0 1 2 1 2 2 2 4 3 4 3 3 3 1 2 1 0 0 0 0 -3 -1 -1 1 0 2 2 1 2 1 2 1 3 4 2 2 0 0 -2 -2 -2 -3 -3 -3 -3 -4 -3 -3 -3 -1 -2 0 1 1 1 1 2 1 2 1 2 1 1 2 0 2 4 5 8 8 9 7 7 4 4 2 0 0 -3 -4 -6 -7 -7 -7 -6 -4 -3 -2 0 2 3 5 5 4 6 4 5 4 4 3 4 3 3 4 4 5 4 6 6 6 8 8 9 9 8 9 8 6 7 5 4 4 4 3 3 4 3 4 3 3 3 1 1 1 0 -1 -2 -1 -2 -3 -4 -2 -2 -2 0 0 0 1 2 4 4 4 4 4 3 4 3 3 2 2 0 0 0 -2 -2 0 -1 -1 -1 0 2 1 3 3 4 4 3 4 3 1 1 0 0 -2 -2 -3 -4 -5 -6 -6 -7 -6 -6 -6 -6 -5 -5 -3 -2 -2 -3 -3 -4 -4 -5 -5 -6 -8 -9 -a -d -d -e -e -d -d -d -b -b -9 -8 -7 -7 -5',
    tunnel: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '3c,0,1m,13,13,d,8c 73,1,3z,17,1k,6,40 b9,1,3a,13,16,9,d3 b9,1,17,10,x,6,8r 7,1,17,t,u,q,4h d,1,1j,16,1e,j,10 2,1,1n,1m,z,g,db 8,1,2s,y,j,9,4q 5,1,2s,w,l,9,4o b,1,30,17,q,9,4n 7,1,4f,10,l,9,4p d,1,3k,h,d,9,9v d,1,54,1e,j,9,5k 29,0,3t,1e,m,d,4b 27,0,48,l,x,9,dz 2m,0,4e,q,d,9,4d co,0,4h,17,g,9,c4 cl,0,31,w,13,d,69 cl,0,3l,k,o,9,cb ez,0,1m,1f,1z,9,dg gd,1,1d,15,16,a,d2 f5,0,27,b,f,9,0 28,1,18,l,r,9,1 p,0,11,1g,1g,t,hd g6,0,n,25,1i,6,5y 12,0,1c,q,m,9,4b 1c,0,12,w,o,9,3 1h,0,15,o,b,9,8q 1v,0,13,f,j,9,4a 21,0,19,m,o,d,70 2o,0,1e,1b,x,d,0 3n,1,t,s,v,9,45 45,1,1m,1x,1q,9,1 3w,1,q,v,12,9,2 41,1,r,u,10,9,1 3j,1,3h,1e,1h,d,1n 5v,1,3g,26,2f,j,gj 55,1,2p,16,11,t,8s 5q,1,1m,12,19,28,8v 7i,1,2m,w,17,t,d6 7g,1,4p,r,t,1f,d7 7v,1,48,1n,22,9,db ga,1,2e,12,1h,t,c5 gb,1,55,z,u,9,4d 6l,0,3r,1p,1t,w,8q 5k,0,2g,1e,1b,g,8o 5j,0,2y,b,e,6,bf 5g,0,2t,18,14,g,8q 50,0,2u,l,j,9,4e 78,1,44,16,16,1s,8x 0,1,58,1i,1e,9,1u fm,0,1k,o,16,a,97 d3,1,q,q,r,12,4d ep,0,1a,w,10,d,4c cx,0,v,m,j,5,8r fc,0,1c,1d,1f,j,d1 co,1,10,m,t,19,8x dg,0,r,z,18,f,0 cp,0,12,16,16,9,3 ct,1,y,l,j,12,d9 c1,0,2v,x,11,9,8m en,0,24,18,16,d,e6 7m,1,4l,u,14,q,4q 7o,1,2l,k,s,q,dj 2q,0,4b,l,o,9,4d 2o,0,4p,b,9,9,0 9n,1,1v,m,p,9,8s 9m,1,u,u,w,9,8t 9k,1,t,n,m,9,8s 9g,1,k,j,j,9,8t 9e,1,q,g,i,9,3 9b,1,p,l,n,9,3 96,1,p,k,n,9,8t 97,1,1f,t,u,9,1 9e,1,20,17,15,j,8r 97,1,20,s,s,d,8r 9h,1,21,h,e,j,8q 9j,1,1w,d,f,j,d4 93,1,1d,15,10,d,d4 bc,1,1e,v,10,1c,he b3,1,1f,p,p,g,d3 aw,0,54,g,l,a,2 cp,0,53,l,u,9,6a d2,0,2k,c,a,5,4c ck,0,3u,d,b,9,df ck,0,49,i,g,9,94 ck,0,4l,k,g,9,g ck,0,4r,j,i,9,f 2d,0,3w,1i,p,9,d4 ck,0,28,l,k,d,53 ck,0,2h,s,i,d,4y ck,0,1r,e,e,d,9h ck,0,1s,i,d,6,du ck,0,1c,b,9,d,9h ck,0,1k,o,f,a,du ck,0,13,p,h,6,54 bt,0,3l,h,k,9,8h c1,0,3x,t,12,d,hb c2,0,36,f,f,9,8i bt,0,35,g,l,9,8h bt,0,3z,k,k,9,ha bt,0,2q,p,m,9,8k ck,0,3f,f,c,9,dt ck,0,40,j,g,9,95 ck,0,2j,h,g,9,9z ck,0,3e,k,f,9,f ck,0,2v,c,i,9,1b ck,0,2x,e,c,9,i cl,0,56,j,i,9,3j cl,0,4m,j,h,9,c3 cl,0,4a,h,c,6,c9 cl,0,3o,i,m,9,c0 2j,0,42,15,h,9,4g 2f,0,3f,z,p,9,d4 2f,0,4j,h,f,9,4e 2i,0,2u,p,k,9,8r 2h,0,48,l,n,9,hf bw,0,2t,p,r,g,h9 bp,0,2i,o,l,d,8o bt,0,1c,l,j,a,ha cu,0,n,t,s,9,d5 cg,0,w,a,c,9,c5 ch,0,g,b,b,9,3f cf,0,1e,n,s,a,g0 2v,0,4g,p,n,9,8n 2r,0,2t,i,g,9,8p 2v,0,3l,19,p,9,4a 2r,0,35,e,c,9,0 2n,0,1x,e,a,9,8q 2r,0,3p,f,e,9,8p 30,0,2x,j,k,a,8l 2z,0,34,s,j,a,d2 32,0,2u,g,d,a,3x 32,0,4g,19,g,a,3x cx,1,4h,b,e,9,d5 cb,1,4k,i,i,9,bq cz,1,4l,f,j,9,8q cb,1,3z,e,i,9,bq cb,1,2u,9,b,9,br cb,1,2p,c,c,9,30 cb,1,35,c,d,9,br cb,1,4u,9,c,9,br cb,1,57,8,b,9,31 cb,1,4h,b,c,9,br cb,1,3t,e,c,9,2z cb,1,3e,d,g,9,7e f7,1,53,o,s,a,fu ff,1,4d,u,10,9,hc fb,1,4x,h,i,9,4a 9g,1,36,1b,18,g,0 gt,0,2z,b,7,9,4z 0,0,2v,c,5,9,53 gr,0,32,3,3,9,9h gt,0,36,6,6,9,do gs,0,34,5,3,9,96 gs,0,2w,8,7,9,92 gs,0,38,6,5,9,dx gk,0,38,h,a,9,1f gj,0,3e,9,9,9,a4 gm,0,2v,c,8,9,a0 9p,1,3z,f,g,9,4e 9n,1,32,9,b,9,4f 95,1,35,p,r,d,3 9p,1,4n,e,g,9,d0 98,1,33,h,g,d,3 9l,1,32,f,d,9,1 9a,1,3b,b,c,g,hf 92,1,3j,o,q,d,d6 9o,1,36,m,h,9,4f 9b,1,4a,g,j,9,1 93,1,4v,t,v,9,8p av,0,1n,l,q,9,5n aw,0,3r,i,h,9,4d av,0,24,n,t,9,ec aw,0,29,h,f,9,2 av,0,y,b,d,d,a2 aw,0,2r,b,a,d,2 av,0,34,e,e,9,ec aw,0,2h,9,9,9,hf av,0,y,h,j,d,5l av,0,2m,e,j,9,ec av,0,3o,f,g,9,5l aw,0,1z,n,o,9,4d av,0,4j,i,l,9,9x av,0,2s,l,j,9,ec aw,0,3r,f,f,6,d3 av,0,33,b,b,9,18 av,0,3b,e,f,9,5n aw,0,37,f,b,a,4b av,0,3a,h,e,9,5o av,0,2t,g,j,9,5o av,0,44,n,o,6,eb 9w,1,1k,1f,1k,d,1 bi,1,4z,y,15,1s,8u 3u,0,4n,h,j,9,91 3t,0,53,c,g,9,2c 3u,0,3b,d,e,9,91 3u,0,39,r,r,9,91 3u,0,1b,m,i,9,de 33,0,4n,l,d,9,cn 3t,0,2j,g,d,a,1m 3t,0,1s,h,e,9,ab 3a,0,32,m,f,a,8b 35,0,3a,1a,t,a,ck 3u,0,2h,p,r,9,de 3t,0,10,m,i,d,ab b3,0,18,f,f,a,d3 9z,1,3h,w,10,9,d4 b3,0,k,e,f,d,4e a9,1,32,r,l,9,8o bx,0,1l,z,y,d,8j ak,1,1v,z,15,d,5 c3,0,1h,t,o,a,3o ab,1,3l,v,w,9,4n 9t,1,3x,16,11,9,4d a4,1,1t,u,q,9,8r cc,1,2f,u,y,12,3g cx,1,3s,d,c,9,1 d4,1,2y,8,b,9,8t cy,1,3f,9,8,9,4e cx,1,2z,9,a,9,8s cz,1,31,e,h,9,4e d4,1,3x,9,8,9,8s d4,1,38,a,b,9,4g d4,1,3n,9,b,9,8w cz,1,3t,g,e,9,4f d2,1,3s,d,f,9,3 d2,1,3g,a,a,9,da 4y,0,24,l,l,a,1 4r,0,h,g,e,9,8r 4s,0,1w,o,u,d,0 ai,1,p,g,p,g,4i at,0,v,p,t,a,d4 al,1,k,l,s,g,4 as,1,i,p,y,9,8q b1,1,o,t,x,9,1 ao,0,1u,k,k,9,4e bl,1,10,x,x,9,8s bn,1,1n,b,c,9,4f bq,1,1s,a,c,9,8q bq,1,1e,a,b,9,0 bp,1,n,l,l,9,d5 bl,1,1o,f,h,9,8s bo,1,i,a,b,9,2 bc,1,2n,r,q,a,d4 c0,1,11,1g,1d,9,he bc,1,2u,b,a,a,hf bc,1,3o,c,h,9,8u bc,1,31,a,c,a,8p bp,1,3x,k,k,9,d3 bc,1,2q,e,d,a,4c bc,1,3m,d,d,9,8u 8h,1,4f,t,q,d,d2 9i,1,4h,e,g,9,8t 8z,1,50,l,m,9,4f 8v,1,3i,13,1u,9,1 g4,1,k,b,h,9,8o fx,1,1d,k,13,9,4b fo,1,13,1a,10,q,9p fo,1,4h,j,s,g,v fm,1,2c,h,l,9,k fp,1,4y,h,l,g,5b fs,1,o,g,q,q,8p g7,1,s,n,o,9,eq 8m,1,1p,t,u,12,4 8r,1,1o,h,h,8,d5 8t,1,o,w,10,9,1 8u,1,1l,p,n,9,d4 eh,0,2s,1i,1f,d,3q f6,1,q,m,p,9,hf fg,1,1l,1s,1r,9,8p em,1,k,l,j,6,3s ey,1,o,i,n,9,ed g8,1,38,1a,18,d,e4 4q,0,34,s,o,d,1 fj,1,31,t,n,9,4a fj,1,48,h,k,9,hf fo,1,33,1s,1c,g,59 ff,1,2x,y,1a,9,8o ea,0,39,r,o,d,3w dn,0,2m,r,s,d,d3 di,0,2o,o,t,9,49 di,0,3t,m,l,9,49 do,1,u,y,14,d,8s dm,1,3y,1s,28,g,4c 5c,0,1v,p,l,19,d5 5h,0,16,19,1d,j,8o f6,1,34,r,t,9,8n f7,1,1s,i,g,9,d5 f5,1,1t,h,k,9,he f1,1,47,1c,12,12,1a m,1,13,6,7,3,bj 5j,0,27,l,n,9,2s 7k,1,3h,k,l,9,da 72,1,3h,a,b,6,65 48,1,4g,v,t,a,d3 46,0,12,1f,1b,d,8t 42,0,2c,f,c,9,hf e8,1,23,1p,1d,9,8g d4,0,3l,b,b,5,4d f8,1,18,a,c,9,d3 f8,1,2h,e,f,9,4c y,0,1d,10,q,9,dr v,1,1d,k,m,6,dd de,0,4s,1b,1r,d,0 gh,1,43,j,o,9,2z 8o,1,10,s,p,a,d4 8l,1,v,w,r,9,1 4y,0,2u,h,l,g,8s 4v,0,2q,l,j,g,4h 7w,1,1l,1i,21,9,da 80,1,2s,1y,2m,9,5r 80,1,4b,m,k,q,1d 9a,0,11,14,x,8,0 81,1,38,o,u,m,8r 4q,0,2r,m,n,6,2 6l,0,2q,6,7,5,0 85,1,l,m,o,6,8p 42,0,1b,1k,11,9,8q 4n,0,2y,l,r,9,4f 8c,1,18,1q,1s,9,1 3x,0,12,v,16,9,8o a6,1,15,2a,26,g,1 am,0,27,1f,16,9,8i bn,1,46,m,u,9,3 ga,1,3w,j,k,t,7p 1s,0,2a,e,d,t,e6 1f,0,38,e,7,6,87 1f,0,2a,k,h,6,dd 10,0,2f,8,a,6,fe 17,0,3h,f,h,6,fu 23,0,2h,a,c,d,5u 23,0,22,j,n,g,ek 24,0,2w,c,d,a,e3 25,0,54,1l,1t,d,5b 20,0,2f,9,p,6,gv fg,0,48,8,9,6,bq fh,0,4p,7,7,6,gm bl,1,2j,z,z,12,2 fu,1,1g,d,s,d,49 eb,1,3v,j,u,m,8p f2,1,51,y,u,d,af cb,1,18,p,u,19,g5 8r,0,l,1e,1e,q,8r 8r,0,23,1e,1e,q,1 8a,0,l,1e,1d,g,8o 7x,0,l,q,r,d,8s 88,0,21,1d,1f,q,he 8m,0,23,e,i,a,1 8f,0,1h,s,o,12,d1 8f,0,23,f,f,a,8o 8f,0,n,e,i,a,8o 8m,0,19,s,o,12,4e 8m,0,n,f,f,a,1 az,0,3g,x,u,d,4f bq,0,2z,f,e,6,4c b3,0,2a,m,s,g,d4 b0,0,1u,z,1a,6,d5 ax,0,2q,e,d,6,d5 az,0,u,1p,14,d,d5 1,1,3v,k,e,9,4m gp,1,3b,12,13,9,0 2y,1,3y,c,c,6,al 4w,0,17,1c,1b,a,1 1v,0,4i,b,d,9,30 h,1,3p,g,h,6,g7 g,1,4p,b,e,6,6c 2o,1,1l,9,a,6,ax 2v,1,1r,7,7,3,5w gc,1,4y,c,g,a,2z dw,1,2z,19,1k,19,aw e2,1,4f,t,r,a,gr e1,1,3z,o,w,d,5 dp,1,4p,8,e,6,dy dg,1,26,r,x,12,hf e4,1,e,a,a,3,8v dt,0,i,b,d,a,0 dz,0,f,h,m,6,h5 e1,0,17,9,c,a,cs ed,1,1w,u,z,6,3w ec,1,4i,1x,1i,a,ca 3t,0,2w,n,m,9,5z c4,0,n,10,t,a,0 cy,1,k,j,l,12,2 cy,1,23,p,v,6,d5 cw,1,25,w,16,d,8v cv,1,1l,9,8,6,d8 dd,1,2e,u,r,6,4i cx,1,z,k,l,t,8s cb,1,4l,l,s,6,bo cb,1,4z,k,r,d,bq cc,1,3e,z,u,6,gi cv,1,3y,8,b,3,8r c3,1,4z,q,o,1f,4c bu,1,4y,l,m,d,cz bc,1,3x,j,s,a,3 bc,1,2v,1c,16,9,8q bh,1,z,y,13,9,d5 bc,1,3l,1b,1h,a,8p bc,1,4t,h,j,9,8r bc,1,34,w,10,a,8p bc,1,59,e,b,t,4e bm,1,3p,l,n,9,2 bp,1,2p,h,l,d,d6 bc,1,59,j,u,9,8s bc,1,1h,t,r,a,8p bu,1,10,z,10,9,4a 81,1,54,1z,2i,9,8r 81,1,57,g,j,t,8o 81,1,3x,x,w,12,d3 81,1,3u,17,12,9,cx 8m,1,3a,u,r,3,4d 83,1,x,9,a,3,4b eu,1,1s,v,x,a,dy ew,1,29,j,d,q,n ex,1,1r,d,n,a,e8 d9,0,3v,o,m,3,1 dg,0,45,g,f,3,d5 dc,0,3d,8,8,3,d2 df,0,3j,q,s,a,8p dd,0,2f,s,y,6,2 ca,1,g,p,t,a,1 c0,0,z,i,l,3,8q cb,1,1h,8,a,3,bs bx,0,s,l,k,3,8q bz,0,f,o,w,a,0 c3,0,y,d,d,3,82 bu,0,l,q,s,a,8q bf,0,r,k,n,t,4d bp,0,h,j,k,19,0 bh,0,c,k,l,9,0 bh,0,17,k,l,9,8r 4r,0,19,g,e,6,d6 eb,0,r,x,12,9,cm ea,0,15,e,f,q,3y e9,0,2i,g,i,3,cm ea,0,25,q,k,w,gy 12,0,4t,b,8,9,c gt,0,29,6,5,9,7 2,0,2m,5,4,3,96 1k,0,1q,f,a,9,95 4e,1,4s,9,9,9,5z bm,1,4w,b,f,a,d5 1y,0,z,g,m,9,8n 30,0,1w,e,c,a,ha 31,0,1v,e,c,6,8j 32,0,1r,l,f,a,3y 32,0,14,l,d,a,h1 30,0,17,i,i,a,cy 17,0,1a,s,o,9,8r 4m,1,2a,1j,1a,9,8t 4g,1,22,q,j,9,d5 4e,1,20,w,w,9,d5 4e,1,10,11,t,9,8r 4j,1,l,x,v,9,3 4p,1,v,s,y,9,3 2j,0,z,u,d,9,8r 2j,0,1n,10,p,9,0 2d,0,11,u,g,9,8n 2d,0,1p,q,k,9,0 2w,0,1u,k,b,9,8q 2u,0,1h,c,8,a,4e 2v,0,11,k,h,a,3 2w,0,1h,c,b,a,4e 2z,0,42,d,e,9,he 2z,0,4k,b,9,9,4a 30,0,4q,c,9,9,hb bg,1,3w,v,w,9,3 bh,1,3k,m,w,9,2 bd,1,3n,e,c,9,4f 4g,0,z,14,z,9,8p fe,1,2x,i,g,9,4b 8a,1,2v,l,m,d,8p 8f,1,36,x,z,g,he 86,1,2t,h,j,d,0 83,1,39,l,n,d,4d 9n,0,u,q,11,9,4f 9k,0,g,q,q,9,8r 9e,0,o,s,v,9,8r 9m,0,24,16,15,9,0 9e,0,1q,j,k,9,4d 9c,0,1n,h,j,9,4d 9e,0,2a,n,o,j,8q 93,0,t,11,t,9,d4 94,0,22,t,x,9,2 99,0,2a,v,v,9,0 1x,0,3s,g,b,9,2i 12,0,2d,h,d,9,h8 22,0,3b,g,o,9,fi 83,1,43,4,4,3,4h 84,1,4c,8,7,3,d4 87,1,46,a,9,3,4e 84,1,50,i,h,a,4f 88,1,54,w,17,a,d5 8a,1,4w,v,13,a,4c 8d,1,51,1l,16,3,4c 81,1,4x,9,9,3,4d 8o,1,3y,c,b,3,4e 1u,0,4i,8,9,9,ga 17,1,2k,n,g,9,80 2w,0,1w,m,b,a,0 57,1,13,q,r,9,0 55,1,1f,q,t,9,8q 5t,1,29,k,h,9,d6 5c,1,1q,o,s,9,8w 23,0,57,k,g,6,ag 5,0,2u,i,e,3,e p,0,24,v,n,3,8n u,0,2d,f,f,a,ab 6k,0,w,3m,3b,3,8q 67,0,y,j,j,3,4c 1h,0,3y,g,p,9,bj 5e,0,2w,8,7,6,8r o,1,25,4,9,9,3q 69,1,2f,c,e,9,4e 6e,1,2b,d,f,9,1 6e,1,1q,e,g,9,4g e,1,2g,n,q,9,5z 6a,0,2f,6,6,3,fb 7b,0,1y,6,6,3,ce 1a,0,2f,14,n,6,4 2b,0,1o,3,3,9,4d 2b,0,1b,3,3,9,4h fr,0,y,4,7,3,50 ft,0,1m,5,8,9,4e fd,0,52,6,6,9,ca fc,0,4y,c,e,9,cb fy,0,45,5,5,9,4l fx,0,3f,7,7,9,8r fy,0,4f,f,e,9,36 fx,0,47,5,a,9,da fz,0,3l,6,a,9,4i g3,0,3m,a,9,9,ga g0,0,3m,7,9,9,57 g1,0,3k,9,c,9,8r fu,0,3f,6,9,9,4d fv,0,3f,6,8,9,d5 fw,0,3p,7,7,9,0 fw,0,3d,4,8,9,1 fx,0,3u,5,8,9,8y fs,0,36,9,a,9,7x fs,0,3q,e,a,9,2c fr,0,3h,d,6,3,2a fu,0,3p,3,6,9,4e fv,0,3y,3,7,9,8r go,0,2x,8,6,9,hf gn,0,37,6,5,9,b6 go,0,2u,4,4,9,al gp,0,2z,c,d,9,9 y,0,2v,f,d,9,ej 2,0,3a,b,c,9,e9 gp,0,34,9,8,9,3 z,0,4t,6,5,9,5k fz,0,45,5,8,9,d0 gj,0,3t,5,5,9,bb gj,0,49,6,b,9,7f gl,0,4j,8,f,9,g4 gl,0,4s,3,5,9,7g gk,0,4w,6,8,9,g8 gl,0,57,5,5,9,3m fz,0,4d,6,6,9,8f g2,0,40,6,7,9,8s fz,0,42,5,7,9,4d g0,0,42,7,8,9,9 g1,0,48,4,5,9,7 g0,0,4e,6,8,9,ca g0,0,4n,4,6,9,8 fv,0,45,6,6,9,8r ft,0,3y,8,8,9,3 ev,0,3z,c,c,3,9k es,0,3f,d,7,9,gt en,0,3a,d,c,9,n en,0,3c,8,9,9,61 en,0,3j,7,5,9,f en,0,4w,6,6,9,5h en,0,3u,a,b,9,y ft,0,4b,5,4,9,es fu,0,46,6,8,9,e8 ft,0,46,6,4,9,ax fq,0,3s,5,5,3,f6 fp,0,3v,5,6,3,1v fs,0,4g,8,9,3,bs ft,0,4k,a,9,9,7h fr,0,4o,7,9,3,85 fs,0,44,9,4,9,2e fq,0,40,8,7,3,fq fr,0,3z,6,4,3,fe fr,0,47,3,3,9,7f fz,0,59,8,8,9,5t fz,0,4w,a,6,9,2a gm,0,52,6,8,9,34 gn,0,4u,5,7,9,7n gn,0,4h,3,6,9,2v go,0,4i,4,7,9,2j gp,0,4f,9,8,9,1u go,0,4d,5,5,9,ew gp,0,4a,6,6,9,ev gp,0,45,7,8,9,1r gq,0,3y,7,8,9,1l gp,0,4r,9,8,9,65 gl,0,47,5,7,9,bo go,0,4w,5,5,9,f2 go,0,52,6,6,9,ew gp,0,56,5,5,9,f3 fw,0,4v,9,7,9,1y fx,0,4z,7,6,9,ez fq,0,4h,9,a,3,gh gj,0,3q,5,5,9,ep gk,0,3o,6,5,9,eq gl,0,3g,8,6,9,a8 gm,0,49,7,7,9,ga gn,0,42,8,7,9,1j go,0,3e,b,a,9,6b gq,0,3k,7,9,9,ae go,0,3u,d,b,9,ag gn,0,3m,8,a,9,6b gn,0,3u,9,7,9,ej gm,0,3e,8,b,9,f6 gq,0,3b,5,6,9,91 gn,0,38,9,9,9,6f go,0,59,5,6,9,fa fp,0,4a,5,4,3,fa fj,0,43,6,4,3,ep fj,0,44,5,4,3,1z fc,0,32,e,c,9,fv eo,0,34,c,b,9,h9 eo,0,36,b,9,9,2k eq,0,34,8,6,9,gr eo,0,37,b,8,9,d0 en,0,3k,9,9,9,b en,0,3y,8,a,9,1a en,0,4k,h,p,6,1l eo,0,4k,6,8,9,64 en,0,5a,8,c,9,aa en,0,44,7,b,9,27 en,0,3y,5,6,9,ey en,0,3n,6,5,9,62 en,0,47,5,8,9,av en,0,41,5,6,9,1z en,0,3t,5,5,9,60 a9,1,40,j,g,9,8s fb,0,4v,k,k,3,az f8,0,5a,4,5,9,bf f8,0,46,9,a,3,32 ev,0,4i,7,6,3,4i f9,0,4p,l,i,3,b1 20,0,57,h,c,9,k e0,0,s,g,k,9,8e eo,0,3y,8,7,g,b1 fp,0,3l,4,6,3,8z ff,0,2u,c,b,9,8q ff,0,3t,6,8,9,cg 23,0,4n,i,f,9,5h 15,0,2g,k,j,3,8w 6x,1,2i,9,8,9,d6 6d,1,2f,8,9,9,d4 5s,0,w,4,4,9,4c 5o,0,y,5,5,9,48 7a,1,1t,7,6,9,1 6u,0,1x,f,d,9,8r 6q,0,1x,f,d,9,1 6n,0,1x,f,d,9,1 6l,0,1y,f,d,9,8r 6i,0,1x,f,d,9,8r 6g,0,1x,f,d,9,8q 6c,0,1x,f,d,9,8q 68,0,1t,b,9,9,8q bz,0,l,6,6,9,8q 5u,1,2i,6,7,9,db 54,1,2x,4,6,9,a2 5q,1,18,9,a,9,h cj,0,c,4,5,9,8i cg,0,1t,j,c,9,2x cg,0,18,5,7,9,gi cg,0,p,3,4,9,7s bv,1,15,a,a,9,4a bu,1,y,d,h,9,4a en,0,56,6,5,6,9w 48,0,2o,f,g,9,d6 46,0,19,e,c,9,4g 44,0,19,e,c,9,d3 40,0,1q,6,8,9,4 cb,1,3l,d,e,9,7d d0,1,4x,5,6,9,0 cb,1,35,e,f,9,g5 cb,1,42,b,b,9,br cy,1,5a,8,9,9,3 3t,0,4j,14,11,9,1m 35,0,4z,m,f,9,8b 3t,0,3j,g,m,9,ff 3u,0,37,f,o,9,de 3u,0,2r,l,k,9,91 3t,0,3u,7,7,9,6p 3u,0,25,d,d,9,b 3t,0,45,7,7,9,6p 3u,0,38,e,f,9,de 36,0,4f,d,g,9,3y 3t,0,4c,a,9,9,b2 3t,0,25,v,1h,9,5z 3u,0,3q,8,a,9,de 1g,0,53,9,i,9,cb 1d,0,54,a,9,9,8h 1c,0,56,e,m,9,dn 1h,0,4e,7,a,9,ed 20,0,3b,a,9,9,fh 1z,0,3i,a,c,9,6n 1h,0,4c,9,8,9,a0 1u,0,3e,c,9,9,6a 1x,0,45,p,e,9,38 1x,0,4o,a,e,9,8v 1u,0,4s,e,g,9,ga 1f,0,4h,c,c,9,u 1d,0,43,9,4,9,9 1d,0,4a,x,f,9,h9 18,0,49,g,c,9,8t 16,0,49,f,8,9,d9 18,0,49,c,9,9,4g cb,1,59,e,f,9,32 cb,1,4z,d,i,9,32 24,0,4n,b,c,6,5o 28,0,n,4,3,9,6 22,0,43,c,c,9,6s 22,0,4k,8,c,9,gf 21,0,4g,a,d,9,85 21,0,3v,d,d,9,fg 20,0,48,9,a,9,bc 20,0,4k,8,8,9,l 1z,0,4p,7,6,9,d 1z,0,4k,7,b,9,2y 23,0,42,8,9,9,7a en,0,4y,1b,1v,a,ab fq,0,4z,q,s,3,33 2w,1,2m,a,6,3,8 2x,1,2u,6,6,3,da be,1,4u,8,a,3,d6 bc,1,52,6,6,3,4g y,0,3x,n,f,9,e6 x,0,3m,d,b,9,x w,0,3c,g,8,9,1g y,0,59,f,a,9,ee gs,0,4l,e,b,9,1l 1,0,3q,e,e,9,ed t,0,3y,7,5,9,a1 s,0,3p,d,c,9,9z 1,0,48,a,6,9,1h v,0,45,a,a,9,e9 x,0,41,a,b,9,4c r,0,2x,g,e,9,eh z,0,3y,e,c,9,12',
    boats: '5v,1,8g,u,7r 5v,1,96,12,7r 5v,1,97,x,7r 5v,1,96,i,gh 5v,1,91,w,gh 5v,1,8j,z,3e 73,1,5j,h,cw 72,1,5h,13,ay r,1,98,t,gk s,1,8i,u,gk o,1,82,v,gr r,1,7b,10,gk m,1,6w,m,gs o,1,66,q,gr l,1,5p,p,gs j,1,63,x,c8 j,1,6s,w,c8 j,1,6q,g,3i k,1,64,g,3i k,1,6p,z,80 k,1,74,l,c6 j,1,7p,p,3q k,1,80,u,cf j,1,8y,y,3o m,1,9a,k,3p i,1,95,12,c3 3e,1,5v,k,8t 3d,1,6h,l,8s 3e,1,73,q,8t 3d,1,7p,s,8s 3e,1,8b,j,8t 3d,1,8j,v,d5 3d,1,8i,h,3 3d,1,7a,u,3 3d,1,6p,p,3 3d,1,62,h,3 3c,1,5h,r,h9 72,1,6m,t,b7 72,1,7d,g,b7 72,1,7s,12,b7 72,1,8j,w,b7 72,1,98,h,70 72,1,84,g,2h 72,1,7q,j,2h 72,1,6d,k,2h 72,1,5x,k,f0',
    bank: [],
    land: { rise: 0.5, roll: 0.3, plain: -1.2, runoff: 1.8, reach: 2,
      sea: { at: 0.55, span: 0.28, level: -3 } },
    scatter: [
      { kind: 'palm', side: 0, from: 18, to: 40, chance: 0.14, s: [0.9, 1.5] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
    ],
  },

  losail: {
    label: 'LOSAIL',
    blurb: 'A permanent circuit in the desert, run at night, and the only one '
      + 'of the eight measured circuits where the whole lap carried the '
      + 'own raceway tag on the map - not a metre of it had to be driven along a '
      + 'public road. Fast sweeping corners and sand on every side.',
    theme: 'desert',
    laps: 3,
    dusk: true,
    // Measured, not authored: the road, the height and the tunnels all come
    // from OpenStreetMap by way of tools/import-osm.js. See docs/CIRCUITS.md.
    osm: true,
    // The one number about the road itself that is still written down: the map
    // almost never says how wide a road is.
    width: 6.0,
    metres: 5426,
    line: '-1kp 38x -3a9 3cp -3e1 3gh -3hs 3k8 -3lk 3o0 -3pb 3rr -3t3 3vj -3wv 3za -40k 431 -442 46n -477 49w -4a1 4ct -4cj 4fa -4ek 4h9 -4g4 4im -4h3 4jf -4hl 4jn -4hg 4j6 -4gs 4i5 -4fi 4ge -4do 4e6 -4be 4bf -48p 48c -45o 44v -42d 416 -3yt 3xc -3v0 3tj -3r6 3pp -3nc 3lv -3ji 3i1 -3fo 3e7 -3bv 3af -382 36l -348 32r -30e 2yx -2wk 2v3 -2sr 2ra -2ox 2nh -2l4 2jn -2ha 2ft -2dh 2c0 -29k 289 -25m 24p -21z 21k -1ys 1yt -1w2 1wi -1tw 1us -1sc 1tn -1rg 1t5 -1r9 1t9 -1rs 1u5 -1t6 1vr -1v3 1xs -1xf 206 -203 22v -22v 25n -25p 28h -28i 2ba -2bb 2e2 -2e3 2gv -2gw 2jo -2jp 2mh -2mi 2pa -2pb 2s3 -2s4 2uw -2ux 2xp -2xt 30l -30i 33a -32w 35m -34z 37o -36r 39e -388 3aq -39c 3br -3a4 3cc -3ai 3cl -3ap 3cr -3aw 3cy -3b3 3d5 -3ba 3db -3bf 3dh -3bm 3do -3bt 3dv -3bz 3e1 -3c6 3e8 -3cd 3ef -3ck 3em -3cq 3er -3cw 3ey -3d3 3f5 -3d9 3fb -3dg 3fi -3dn 3fp -3du 3fw -3e0 3g2 -3e7 3g9 -3ee 3gf -3ek 3gm -3eq 3gs -3ex 3gz -3f4 3h6 -3fb 3hd -3fi 3hk -3fp 3hs -3fx 3hz -3g5 3i7 -3gc 3if -3gk 3im -3gl 3ih -3g6 3ho -3f5 3gb -3dm 3ea -3bi 3bp -38y 38r -363 35d -32t 31p -2zf 2xv -2vr 2tx -2rv 2q0 -2ny 2m3 -2k1 2i6 -2g4 2e9 -2c7 2ac -28a 26f -24d 22h -20m 1yk -1x3 1ur -1to 1r4 -1qg 1ns -1nk 1ks -1kz 1i8 -1ix 1g8 -1hb 1er -1g9 1dx -1fq 1dm -1fh 1df -1fa 1d8 -1f4 1d2 -1ex 1cv -1eq 1co -1ej 1ci -1ed 1cb -1e6 1c4 -1e0 1by -1dt 1br -1dm 1bk -1df 1bd -1d8 1b6 -1d2 1b0 -1cv 1at -1co 1am -1ch 1af -1ca 1a8 -1c3 1a1 -1bx 19v -1bn 19j -1ap 187 -18k 15t -15b 12m -11a yu -wu uy -sh ra -oj o6 -lg lz -je ke -hu iv -ga hc -er fs -d7 e8 -bn co -a4 b5 -8k 9l -70 81 -5g 6i -3y 4z -2e 3f -u 1v q b 29 -18 3t -2s 5d -4c 6x -5v 8f -7e 9z -8y bj -ai d3 -c2 em -dl g6 -f5 hq -go j9 -i8 kt -js mc -la nx -n2 ps -pc s4 -s5 uv -vb xx -yv 11b -12m 14t -16i 18d -1af 1bz -1ea 1ff -1hy 1in -1lb 1ll -1oc 1o5 -1qx 1q9 -1sy 1rv -1ue 1sv -1v7 1tb -1vc 1tb -1v7 1t5 -1v0 1sx -1ur 1so -1ui 1sl -1um 1ss -1uu 1t2 -1v7 1tj -1vr 1u5 -1wf 1uy -1xa 1vv -1y9 1wx -1zd 1y6 -20o 1zj -222 211 -23m 22p -25b 24i -275 26f -294 28i -2b7 2an -2dd 2cx -2fo 2f6 -2hw 2h0 -2jn 2ie -2kv 2j8 -2lg 2ji -2lh 2j8 -2kv 2if -2jq 2h4 -2i0 2fb -2g0 2db -2dy 2b8 -2bv 296 -29t 274 -27r 252 -25p 22z -23m 20x -21k 1yv -1zi 1wt -1xg 1ur -1ve 1so -1tb 1qm -1r9 1ok -1p7 1mn -1np 1ld -1mw 1kz -1my 1le -1np 1mp -1pa 1ov -1rl 1rs -1uk 1va -1xy 1z5 -21n 23b -25i 27e -29f 2bb -2dd 2fc -2ha 2j9 -2l7 2na -2p5 2r9 -2t1 2v7 -2wy 2z6 -30u 334 -34p 371 -38j 3aw -3cc 3er -3g4 3il -3jw 3me -3nl 3q4 -3r9 3tt -3uw 3xh -3yg 412 -41z 44n -45i 486 -48w 4bl -4c9 4ez -4fj 4i9 -4iq 4lh -4lx 4oo -4oz 4rr -4s1 4us -4ux 4xp -4xs 50k -50l 53d -53a 562 -55x 58o -58g 5b8 -5ax 5do -5dc 5g3 -5fr 5ii -5i5 5kw -5kk 5nc -5n0 5pr -5pf 5s6 -5ru 5ul -5u8 5wz -5wn 5ze -5z2 61u -61i 649 -63x 66o -66b 692 -68q 6bh -6b5 6dw -6dk 6gc -6g0 6ir -6if 6l6 -6kt 6nk -6nc 6q4 -6q5 6sw -6t8 6vy -6wm 6z7 -705 72n -73u 767 -77o 79u -7bk 7dk -7fi 7h9 -7je 7kx -7n8 7ol -7r0 7sc -7ur 7w4 -7yk 7zw -82b 83n -863 87g -89v 8b7 -8dn 8ez -8he 8ir -8l7 8mj -8oy 8q4 -8sn 8tg -8w3 8wh -8z8 8z9 -921 91l -94b 93h -964 94x -97f 95x -98a 96t -995 97n -99z 98i -9av 99d -9bp 9a8 -9cl 9b3 -9df 9by -9ea 9cs -9f5 9do -9g0 9ei -9gv 9fe -9hq 9g8 -9ik 9h3 -9jg 9ht -9k1 9i2 -9k1 9ht -9jf 9gx -9i5 9fi -9gc 9dl -9dy 9b6 -9b3 98d -97w 956 -94n 91x -91d 8yn -8y3 8vd -8uu 8s4 -8rk 8ou -8ob 8ll -8l1 8ib -8hr 8f1 -8ei 8bs -8b8 88i -87z 859 -84p 81z -81f 7yp -7y6 7vg -7uw 7s6 -7rn 7ox -7od 7ln -7l3 7id -7hu 7f4 -7ek 7bu -7bb 78l -781 75b -74r 721 -71i 6yr -6yf 6vo -6vu 6t4 -6tp 6r4 -6s3 6pp -6r4 6oy -6qo 6ot -6qv 6pd -6rp 6qg -6sy 6rp -6u5 6sv -6vc 6u3 -6wk 6va -6xr 6wi -6yz 6xp -706 6yw -71d 704 -72l 71b -73s 72j -750 73q -767 74y -77f 765 -78m 77d -79t 78j -7b0 79q -7c7 7ay -7df 7c5 -7em 7dd -7fu 7ek -7h1 7fs -7i9 7gz -7jg 7i6 -7kn 7je -7lv 7kl -7n2 7lt -7oa 7n0 -7ph 7o8 -7qo 7pe -7rv 7ql -7t2 7rt -7ua 7t0 -7vh 7u8 -7wp 7vf -7xw 7wl -7z1 7xn -802 7yd -80j 7yh -80c 7y1 -7zk 7x0 -7y3 7ve -7w3 7tc -7tl 7qt -7ql 7nx -7n9 7ko -7jm 7h9 -7ft 7dq -7bw 7a5 -780 76k -747 72w -70g 6z4 -6wo 6vd -6sx 6rm -6p6 6nu -6le 6k3 -6hn 6gc -6dw 6ck -6a4 68s -66c 650 -62l 618 -5ys 5xg -5v1 5tp -5r9 5px -5ni 5m6 -5jq 5id -5fy 5em -5c6 5au -58f 573 -54n 53a -50v 4zj -4x3 4vr -4tc 4s0 -4pk 4o7 -4ls 4kg -4i0 4go -4e9 4cx -4ah 494 -46p 45d -42x 41l -3z6 3xu -3ve 3u1 -3rm 3qa -3nu 3mi -3k3 3ir -3gb 3ey -3cj 3b7 -38r 37f -350 33o -318 2zw -2xh 2w4 -2to 2sc -2px 2ol -2m5 2kt -2ie 2h1 -2el 2d9 -2au 29i -272 25q -23b 21y -1zi 1y6 -1vr 1uf -1rz 1qn -1o8 1mv -1kf 1j3 -1go 1fc -1cw 1bk -195 17s -15c 140 -11l 109 -xt wh -u2 sq -qa ox -mi l6 -iq he -ey dn -b8 9w -7g 64 -3o 2c 4 -1g 3v -57 7n -8z bf -cr f6 -gh ix -k9 mp -o1 qh -rt u8 -vk y0 -zb 11r -133 15j -16v 19a -1am 1d2 -1ed 1gt -1i5 1kl -1lz 1od -1pu 1s7 -1tp 1w1 -1xm 1zw -21h 23r -256 27k -28u 2bb -2cl 2f1 -2gb 2is -2k1 2mi -2ns 2q9 -2rj 2u0 -2v9 2xq -2z0 31h -32r 358',
    height: 'z 0 0 -1 -1 -1 0 0 0 1 2 2 1 2 2 1 2 1 1 0 0 0 -1 -1 -3 -2 -2 -2 -1 -1 -1 0 1 1 0 0 0 0 0 0 0 -1 -2 -1 -3 -2 -2 -2 0 0 0 0 1 1 1 0 1 2 1 2 1 0 0 0 -2 -2 -1 -2 0 -1 -1 -1 0 0 1 1 1 1 1 1 0 0 -1 -1 -1 -1 -2 -4 -3 -3 -2 -2 -3 -1 -2 0 -1 0 -1 0 0 0 0 0 0 0 1 1 0 1 1 1 2 1 0 1 1 0 0 -2 -1 -1 -1 0 0 0 2 2 3 3 3 4 3 4 3 2 1 1 0 0 0 0 0 0 1 1 2 2 3 2 2 3 2 1 2 0 0 -1 -1 -2 -1 -2 -2 -1 -2 -2 -2 -3 -3 -2 -1 -2 -2 0 -1 0 0 0 1 1 3 2 2 2 1 1 0 -1 -1 -2 -2 -2 -3 -2 -2 -3 -1 -2 -1 0 -1 -1 -1 0 1 0 1 1 3 2 3 3 4 5 4 5 5 3 4 3 1 0 0 -1 -3 -3 -4 -4 -3 -4 -5 -4 -5 -5 -4 -3 -3 -2 -2 0 0 0 0 0 1 3 2 3 3 4 3 3 3 2 3 3 3 3 2 3 1 2 0 1 1 1 0 1 -1 0 -2 -1 -2 -1 -3 -2 -2 -3 -1 -2 -1 0 0 0 1 1 1 2 2 3 2 2 1 2 0 0 0 0 0 0 -2 -1 -3 -2 -3 -3 -3 -2 -1 -2 -1 -2 -1 -1 0 0 0 0 2 1 1 0 0 0 0 0 0 -1 -1 -2 -1 -2 -3 -4 -2 -2 -2 -3 -1 -1 1 1 3 3 3 5 5 7 6 7 7 7 6 5 3 3 3 0 1 0 -1 0 -2 -2 -3 -2 -1 -1 -1 -2 0 -1 -1 -1 -1 -2 -1 -2 -1 0 -2 -1 -1 -1 -1 -1 -2 0 0 0 1 0 1 1 1 1 1 0 2 1 1 1 1 0 0 -2 -1 -1 -1 0 0 0 0 0 0 0 0 0 1 0 0 -1 -2 -2 -4 -3 -3 -3 -3 -2 -2 -2 -1 -1 0 2 2 3 3 3 3 4 3 3 1 2 1 1 0 0 -1 -1 -2 -1 -2 -3 -2 -1 -1 0 0 0 0 0 0 1 0 0 0 0 -1 0 0 0 0 0 0 0 0 0 -1 -1 -1 0 -2 -1 -1 0 0 0 0 0 0 0 1 1 1 1 0 -1 -1 -2 -3 -2 -1 0 -1 0 0 0 0 -1 0 0 0 0 0 -2 -1 -2 -3 -2 -2 -2 0 0 0 1 1 2 2 3 3 2 2 3 0 0 0 0 0 0 0',
    tunnel: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: 'dv,0,13,5g,3f,9,0 dv,1,1l,58,40,9,8q d4,1,z,x,p,9,0 et,0,2n,a,9,9,d3 e2,0,38,i,d,9,8r 7j,0,1i,c,b,9,ct bo,0,1o,d,a,9,4k bb,0,40,o,k,9,1 bb,0,27,o,k,9,d3 b6,0,42,1x,1m,9,4d d7,0,w,6,5,9,8u et,0,1d,c,b,9,8o n,0,3c,b,7,9,1d 1o,0,29,4,b,9,0 z,0,27,c,b,9,ek e0,1,33,b,9,9,8s e3,1,33,b,9,9,8q e7,1,35,k,g,9,8p dy,1,2b,w,x,9,4d e6,1,2a,p,12,9,d2 dg,1,2d,x,y,9,d5 do,1,2c,q,11,9,d4 dj,1,33,b,9,9,0 dm,1,32,b,8,9,8t d2,1,2m,13,z,9,8r d9,1,2q,11,10,9,1 da,1,3o,18,12,9,8r ba,1,4r,h,f,9,ae cm,1,2d,8,7,9,4e co,1,2b,8,9,9,4h ct,1,2n,a,b,9,d5 cl,1,30,n,g,9,d4 bm,1,2j,l,h,9,ae bd,1,44,l,h,9,1o eq,1,12,k,g,9,90 ei,1,4k,9,9,9,27 9x,0,2n,d,9,9,8l 4w,0,1c,d,9,9,h3 26,1,1i,a,5,9,8p 2x,0,2h,e,a,9,e0 5w,0,28,e,7,9,dp 8u,0,2m,e,9,9,a3 by,0,2r,c,9,9,hb cg,1,y,d,a,9,hf dg,1,33,j,f,9,8r f,1,1m,t,u,9,e0 9,0,2q,b,9,9,3l b,0,3f,d,a,9,71 cr,1,2m,6,6,9,4f e5,0,35,b,b,9,4e cj,0,21,c,b,9,0 co,0,20,b,9,9,hf 7u,1,2o,4,6,9,h2 eg,1,1r,i,i,9,4c 6f,0,2v,j,8,9,9f c,0,50,i,d,9,fc ct,1,3l,n,f,9,8r cu,1,35,s,j,9,0 cz,1,3c,9,8,9,4d d0,1,3c,a,b,9,4d d2,1,3b,a,b,9,d3 d4,1,3d,a,a,9,d3 eb,1,2g,e,b,9,d4 ef,1,2r,a,8,9,2 ed,1,2o,c,c,9,d4 78,1,4d,b,9,9,9f 77,1,4u,j,e,9,96 77,1,4s,b,9,9,98 8f,0,4l,3,4,9,3 6e,0,4n,6,7,9,d4 6e,0,4g,5,3,9,ek 6f,0,4s,7,5,9,5f 8e,0,4k,4,7,9,8s 6g,0,3k,4,4,9,67 6f,0,45,a,o,9,29 6g,0,3d,a,8,9,ey 6g,0,2y,6,c,9,f1 6i,0,37,f,i,9,9l 6e,0,42,7,6,9,ek 6e,0,38,8,7,9,5v 6a,0,59,i,d,9,6l 62,0,49,j,d,9,5t eo,1,2t,19,s,9,8v ep,1,36,1c,v,9,8y 11,1,1x,10,13,9,aj 10,1,26,10,13,9,1t 9y,0,52,k,g,9,3z 9y,0,54,k,g,9,40 9z,0,58,j,h,9,3n a0,0,58,h,j,9,bw cf,0,2u,d,a,9,hf c1,0,37,d,b,9,7a el,0,2u,d,a,9,8q dn,0,34,x,o,9,8q 2i,0,4v,3,3,9,w eg,0,4i,3,3,9,hc 1z,0,48,5,4,9,ed 1a,1,3c,7,5,9,7c 19,1,3h,3,3,9,b0 cr,0,1v,g,k,9,97 59,0,1v,4,4,9,6r 6j,0,28,4,3,9,go 6i,0,26,4,4,9,e 5y,0,44,8,6,9,e6 68,0,3i,i,9,9,6e 6b,0,2x,l,e,9,6o 6a,0,3b,l,e,9,6l 6d,0,41,j,d,9,68 6d,0,3n,j,d,9,ey 6c,0,2m,i,a,9,fb 6g,0,2m,d,7,9,a 6d,0,32,7,5,9,f0 6e,0,2j,7,7,9,5g 6h,0,2i,4,4,9,1e 6f,0,3v,4,4,9,2b 6g,0,39,5,6,9,68 6f,0,3l,3,3,9,9i 8g,0,4l,7,6,9,4g ag,0,4r,a,9,9,dt a7,0,2r,4,3,9,3n a5,0,2n,3,4,9,hd 7v,1,2k,3,3,9,8c 7,0,17,1d,14,9,he bz,0,1c,1i,17,9,88 m,0,4j,3,3,9,ai bz,0,2z,3,3,9,ck b2,1,3l,3,3,9,8c b1,1,3l,3,3,9,h5',
    boats: '',
    bank: [],
    land: { rise: 1.0, roll: 0.6, plain: -2.0, runoff: 5.0, reach: 6 },
    scatter: [
      { kind: 'palm', side: 0, from: 30, to: 80, chance: 0.05, s: [0.8, 1.3] },
      { kind: 'rock', side: 0, from: 22, to: 90, chance: 0.1, s: [0.5, 1.2] },
    ],
    marks: [
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      { at: 0.000, kind: 'pit', side: 1, off: 26, s: 1.1 },
      { at: 0.014, kind: 'screen', side: 1, off: 30, s: 1 },
      { from: -0.032, to: 0.028, every: 0.007, kind: 'stand', side: -1, off: 22, s: 1.15 },
      { at: 0.250, kind: 'tyres', side: -1, off: 13, s: 1.3 },
      { at: 0.500, kind: 'tyres', side: 1, off: 13, s: 1.3 },
      { at: 0.750, kind: 'tyres', side: -1, off: 13, s: 1.3 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
      // Albert Park is ringed by tram and rail lines; one of them is always
      // going past behind the trees.
      { at: 0.300, kind: 'train', side: 1, off: 126, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
      // Flags along the pit straight, and the paddock behind it.
      //
      // Both are true of every circuit on the calendar and neither was here: a
      // row of flags is the only thing on a circuit that says which way the wind
      // is blowing, and what is actually behind a pit building on a race weekend
      // is forty transporters in a row.
      { from: -0.026, to: 0.030, every: 0.007, kind: 'flag', side: -1, off: 21, s: 1 },
      { from: -0.020, to: 0.024, every: 0.008, kind: 'flag', side: 1, off: 21, s: 1 },
      // Past the pit exit rather than behind the pit building. Behind it is
      // where a paddock is and is also where the pit building hides it: at
      // Monza the row was there and not one of them was ever on screen.
      { from: 0.052, to: 0.094, every: 0.006, kind: 'lorry', side: 1, off: 30, s: 1 },
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
