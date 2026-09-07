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
    // And the one number about its height. Read off the map's own circuit
    // relation the lap comes back with fifty-three metres between its lowest
    // point and its highest, where Monaco is about forty-two: in a town this
    // dense the terrain service is reading roofs, the same way it does at Marina
    // Bay. Four fifths of the measured range. The shape of the profile is still
    // the map's; only the size of it is ours.
    flatten: 0.8,
    metres: 3325,
    line: 'sa -rw ro -ow op -lx lp -ix io -fw fp -cy ct -a1 9y -76 77 -4e 4j -1r 1y u -n 3e -30 5s -5c 82 -7h a7 -9i c7 -bd e1 -d7 fu -f4 ht -hf k6 -jr mi -lz op -n8 pj -mx nq -ky lb -ik ix -g6 gj -dr e4 -bd br -90 9e -6n 72 -4b 4s -22 2l 5 h 27 -1h 46 -3g 64 -5b 7z -77 9v -92 bq -ax dl -ct fh -eq hf -gn jb -im lc -ko nf -mz pq -pf s7 -rw un -uc x4 -wv zk -yy 11k -10l 133 -11v 14d -136 15p -14h 16z -15s 18a -172 19k -18c 1aw -19t 1cg -1bk 1e9 -1dj 1g7 -1fi 1i6 -1hd 1k1 -1j7 1lu -1ky 1ni -1mg 1o3 -1pf 1s7 -1rz 1up -1u7 1ww -1w8 1yt -1xt 20a -1z0 21b -1zq 21w -206 226 -208 220 -1zv 21f -1z5 208 -1xo 1y1 -1va 1v7 -1sf 1s0 -1p9 1om -1lw 1ky -1ic 1h7 -1eo 1dk -1b1 18v -177 155 -13a 117 -zc xb -vf tq -rj qh -nx ns -l0 lr -j3 kb -ht jc -h0 in -ge i0 -fr he -f5 gt -el g7 -dx fk -db ex -co ec -c3 ds -bl da -b2 cp -ah c5 -9x bl -9c b0 -8s ag -88 9w -7n 9a -72 8r -6j 8n -6y 9o -9t c9 -dk fc -hg ic -ky l2 -nu o4 -qw rw -uh vz -yb zw -126 13s -162 17g -19v 1aw -1dh 1fk -1h8 1js -1iv 1jt -1hb 1fz -1dm 1bn -19p 17w -15r 144 -11w 108 -xz wl -u7 u7 -rh t4 -qz ti -sc v1 -ub wy -w5 yq -xo 109 -z9 11x -115 13x -13q 16a -174 182 -1al 1ai -1da 1d5 -1fx 1fs -1ik 1ig -1l8 1l3 -1nv 1nq -1qi 1qe -1t6 1t0 -1vs 1vj -1yb 1y1 -20s 20d -234 22n -25e 24t -27j 26w -29l 28v -2bk 2aq -2de 2ci -2f5 2e7 -2gt 2fq -2ia 2h6 -2jq 2ij -2l1 2jq -2m7 2kv -2nb 2lv -2o8 2mq -2p3 2nj -2pu 2o7 -2qf 2op -2qw 2p5 -2rb 2pg -2rj 2pn -2ro 2pq -2rp 2po -2rl 2pi -2rd 2p9 -2r1 2ou -2qk 2ob -2pz 2np -2pa 2my -2og 2m3 -2nk 2l5 -2mi 2k1 -2lb 2iu -2k4 2hm -2iv 2ge -2hn 2f6 -2gg 2dz -2f9 2cs -2e2 2bl -2cv 2a8 -2b4 28h -29d 26q -27m 24z -25u 235 -23u 215 -21u 1z4 -1zp 1wz -1xg 1up -1v6 1sf -1sx 1q7 -1qp 1ny -1of 1lp -1m7 1jg -1jw 1h5 -1hm 1gn -1j3 1j6 -1ly 1jx -1lg 1ip -1j4 1gi -1fw 1df -1c4 19e -19h 16q -175 14e -14s 121 -12f zn -100 x9 -xn uw -v9 si -sw q4 -qh nq -o4 ld -lr j0 -jd gm -h0 e9 -eo bx -ce 9n -a5 7e -7r 50 -5d 2l -2x 6 -j -28 1v -4n 4a -6o 5c -6v 4k -5v 3f -4n 25 -3a r -1r -v 1 -2o 1y -4n 40 -6p 69 -90 8o -bg bd -e5 e4 -gw h1 -jt k4 -mv nn -qb rm -u1 w5 -xx 105 -11t 13t -15q 16s -19a 19l -1cd 1cs -1fi 1g1 -1is 1ja -1m0 1mi -1p9 1pr -1sh 1sz -1vq 1w8 -1yy 1zh -228 22u -25j 266 -28w 290 -2bq 29x -2c0 29l -2ax 29b -2be 2bp -2eg 2f8 -2hx 2it -2lf 2md -2p0 2q1 -2sm 2ts -2wb 2xj -301 31b -33r 358 -37l 399 -3bi 3da -3ff 3hd -3jc 3lh -3n9 3pl -3r4 3tl -3uu 3xd -3yk 410 -42b 446 -464 46q -49e 481 -4ad 47t -48v 467 -46y 449 -450 42b -42z 408 -40n 3xv -3y2 3va -3v4 3sn -3rg 3q2 -3nq 3nf -3ko 3jw -3h8 3fx -3dh 3bs -39k 37u -35o 345 -31t 30c -2xz 2wh -2u5 2ss -2qd 2p4 -2mm 2ll -2j0 2i7 -2fj 2eu -2c6 2bf -28q 27w -259 24h -21t 211 -1yc 1xk -1uw 1u5 -1rh 1qq -1o1 1nc -1kn 1jz -1ha 1gp -1dz 1di -1as 1ac -17l 175 -14e 13z -118 10u -y3 xr -uz',
    height: '2d 1 1 1 e d e d d d e d d p p q p -1 0 -1 -1 -1 0 -1 4 4 -9 -8 -9 -8 4 8 8 7 8 8 7 4 0 1 1 1 0 1 -2 -3 h h h g h k i j i i j i k -6 -5 -6 -5 -5 -6 -4 -5 -9 -9 -a -4 -5 0 0 0 0 0 0 0 0 a 3 3 -1 -2 -1 -2 -1 -2 -1 -2 -6 -1 -6 1 0 1 1 1 1 0 1 -5 2 6 1 1 0 1 1 1 1 -6 -5 -g -b -h -h -h -h -h -h -h -h -g -b -b 0 0 2 3 2 2 3 2 2 -9 -9 -a -9 -9 -b -d -d -d -d -d -d -d -2 6 6 7 6 7 8 8 8 g g i h i a a a a a a a a b -2 -3 -3 -3 -3 -3 -3 5 5 6 5 6 -4 8 9 d d d -b -b -j -j -f -e -f -f -e -f -j -f -e 9 9 9 a 4 5 5 5 5 6 5 1 1 3 3 3 3 3 3 3 -1 0 -1 -1 -1 0 -4 -7 -8 -8 -7 -p -p -l -m -l -m -l -m -l -k -j -j -j -3 -2 -2 -2 -3 -2 -2 -3 -2 0 0 0 0 0 0 0 0 2 3 2 2 3 2 2 2 3 2 6 0 0 -2 -2 -3 -2 -2 -3 -2 -4 -4 -3 -2 4 4 4 3 4 4 4 d d 8 7 8 2 2 2 3 2 2 3 -2 -b -b -3 3 4 4 4 4 4 0 0 0 4 3 4 4 -4 -4 -3 -3 -3 -3 1 1',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001100000111111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '85,0,4f,q,p,9,hd 86,0,58,26,1f,9,gv 8c,0,56,b,c,9,bv 84,0,4y,r,t,9,ah 8c,0,51,c,9,9,h4 8c,0,58,7,e,9,ca 8c,0,4l,q,15,d,84 8a,0,4p,h,1b,9,t 86,0,4c,1f,18,9,83 8a,0,4a,j,n,a,7v 8b,0,45,j,r,d,96 8c,0,45,t,13,d,86 8c,0,3l,j,1s,d,gl 89,0,33,h,p,d,hd 89,0,3v,8,f,9,d1 86,0,3o,k,h,9,8f 1d,0,w,q,r,9,4w 1m,0,1e,25,z,9,f0 b,0,4x,h,c,16,1x a,0,4j,r,b,1f,1g 1c,0,1q,m,i,d,ep 18,0,1z,10,k,d,fg 1a,0,15,c,z,9,9a 1b,0,28,a,a,d,5z m,0,2g,l,d,9,2o 6,0,2y,f,d,9,an 6,0,1l,7,b,d,8s s,0,54,f,d,a,4l k,0,38,n,b,q,a9 10,0,2y,o,n,28,56 2j,0,4i,i,j,9,e 0,0,46,8,9,d,8m d,0,2p,d,a,q,5x 7,0,1c,3,d,d,8n r,0,t,a,a,a,4r 2p,0,47,e,e,9,h3 1a,0,50,c,9,9,eq 91,0,3b,e,m,9,4i 35,0,46,h,f,9,56 2i,0,4d,h,j,9,5k 8v,0,50,6,6,d,4p 6,0,27,7,a,a,hd 17,0,2w,k,f,j,bz 2y,0,l,1e,q,6,8r 7,0,3i,b,9,j,ai q,0,z,7,9,g,dh 33,0,2z,u,v,q,e 8v,0,3s,7,9,d,4n s,0,3h,o,w,g,a 33,0,4o,b,b,m,4r 91,0,2h,8,a,9,4k 37,0,16,f,z,29,21 8v,0,4j,c,c,d,4w 7,0,2p,6,6,a,5y x,0,k,o,1h,q,he 8,0,2f,b,9,d,1p 0,0,4k,8,9,d,20 35,0,3b,s,a,w,1w 94,0,50,9,g,g,d5 m,0,26,d,8,a,2l 8u,0,4y,7,a,d,de k,0,1k,y,f,1f,1p 35,0,59,d,e,g,t 6,0,q,b,b,t,d2 2l,0,4y,k,j,d,84 e,0,29,g,a,q,en 8z,0,4e,7,8,d,4p 96,0,50,c,a,g,1y m,0,43,b,k,j,9o l,0,2u,6,d,6,72 b,0,1j,j,h,d,1h 1,0,58,h,e,m,ao 2s,0,53,1j,n,9,hf 5,0,49,8,9,a,1x 35,0,2v,f,a,9,aj 6,0,12,7,b,d,8r 2u,0,3s,m,d,z,4m 91,0,4y,h,h,9,0 34,0,3h,j,c,d,43 8u,0,3d,9,8,9,dd c,0,n,f,n,1f,8v m,0,54,8,6,a,b2 1s,0,16,10,v,a,4 2m,0,4x,d,d,9,3s 5,0,59,q,j,z,1x 19,0,3m,o,f,9,bc 91,0,4h,a,e,d,4k 13,0,2w,o,h,t,7t n,0,3p,g,i,j,a 31,0,17,1f,10,6,8o 8u,0,2b,o,t,9,4o l,0,48,j,f,w,d2 97,0,47,9,a,d,8p 8u,0,4k,9,a,d,4t 35,0,3l,d,8,a,at 2n,0,57,i,d,9,cj 7,0,4h,h,f,z,a5 1n,0,3m,l,q,1y,61 35,0,1w,c,b,6,1h 8v,0,3a,8,b,9,94 9,0,3k,g,d,d,1s 2s,0,46,d,9,9,4p 8z,0,4f,8,8,d,d7 97,0,4s,b,8,d,20 m,0,2t,6,7,9,3h c,0,20,t,6,a,af 8x,0,x,v,19,19,7 35,0,3e,p,e,j,1v 34,0,4i,u,a,t,8h 1,0,48,c,b,a,1x 8,0,1t,c,b,a,ag 6,0,3w,d,b,g,aj u,0,z,q,b,j,98 8z,0,4t,9,9,d,d3 2w,0,2n,18,n,t,8o 8w,0,3o,9,c,9,4n v,0,4y,b,b,6,d9 o,0,2a,u,14,9,8b 8z,0,3h,h,h,9,b 9,0,25,a,a,a,62 m,0,2k,a,7,9,33 2i,0,4u,k,j,9,a2 2j,0,42,k,h,9,d 6,0,2o,9,a,a,0 8,0,34,g,b,m,ag m,0,37,8,e,9,59 35,0,25,e,d,6,el 90,0,4c,9,c,d,8x 10,0,51,z,q,t,8j 6,0,1v,7,9,d,4 n,0,3v,c,e,j,di l,0,4i,d,k,m,bk o,0,x,9,c,j,4p 8v,0,3j,7,9,9,b 96,0,4c,9,b,g,4b 1a,0,44,f,g,9,5v l,0,2f,9,a,j,6e 8w,0,4i,c,h,j,4p 2x,0,3x,k,g,q,e 4,0,4k,a,a,j,en 12,0,29,c,e,9,8g 8u,0,3o,c,b,9,d e,0,k,8,b,9,4b m,0,4m,c,b,a,1q 94,0,4b,9,c,g,8u g,0,4t,i,8,12,9y o,0,4o,b,e,g,3d n,0,2v,9,9,a,4i o,0,59,d,h,t,3g d,0,4a,n,c,m,a2 1k,0,2s,1b,1f,j,ay 3w,0,1t,c,k,9,59 3z,0,4i,i,n,9,cj 36,0,53,9,b,9,3i 36,0,4m,e,d,9,3i 35,0,55,e,b,9,ed 36,0,3l,g,g,9,34 35,0,4k,m,y,9,52 36,0,5a,b,e,9,44 35,0,2s,e,i,9,de 36,0,2j,g,m,9,g9 m,0,2v,k,c,9,41 84,0,4o,9,8,9,ev 8d,0,4c,h,i,9,72 8b,0,57,8,c,9,hb 87,1,g,b,g,9,4 94,0,2y,h,p,q,4h 4v,0,t,13,14,d,8g 53,0,4s,21,24,9,dn 40,0,53,5,8,3,y 3z,0,3q,3,4,3,3q 2r,1,t,14,1g,6,8t 5h,1,k,u,11,9,8 3o,1,h,e,p,q,ab 2c,1,22,2i,1e,6,4c 1m,0,s,l,j,a,f1 1i,0,i,p,j,a,8q h,0,g,o,o,1m,d 6n,1,k,7,8,9,1z 84,0,25,2v,47,9,au 8d,0,4a,3,4,9,2m 8d,0,3h,6,8,9,fl 1l,1,h,1b,r,9,dn 14,0,1k,h,13,d,9l 8n,0,4k,q,12,9,l 8h,0,12,b,b,9,gy 8o,0,25,k,t,9,9p 2,0,k,d,r,d,8m 93,0,1j,g,14,9,4i 16,0,2e,9,9,9,gk 35,0,4t,e,g,9,dt 0,0,3a,f,m,9,8m 95,0,23,9,b,9,8h 3,0,2v,j,v,d,48 8q,0,53,b,c,d,48 8q,0,4n,a,a,d,cy 8r,0,4l,8,8,d,4f 8r,0,58,c,e,d,4a 8q,0,1k,b,9,d,8t 8q,0,1w,5,9,d,93 8q,0,21,6,9,d,c 8q,0,2b,a,b,d,91 8q,0,2n,8,9,d,94 8q,0,2x,7,9,d,95 8q,0,35,7,7,d,92 8q,0,3i,8,b,d,da 8q,0,3x,8,a,d,d1 8r,0,1h,a,d,9,4g 8r,0,22,9,b,d,4e 8r,0,2q,c,h,d,4f 8r,0,3l,d,n,d,d6 8e,0,1q,z,14,9,a 8m,0,z,11,o,9,h7 91,0,21,d,d,9,5 8r,0,t,9,b,9,d9 8y,0,2h,4,5,9,fc 8y,0,2p,3,3,9,a 5t,1,j,e,1f,9,2x 1a,1,d,h,i,9,8j 1d,1,i,b,m,9,92 16,1,g,h,u,9,8z n,0,4p,9,7,a,c6 v,0,1x,7,e,d,t 2k,0,4v,c,a,9,8j 16,0,3k,9,8,9,gm 82,0,3q,5,6,9,5r 14,0,28,a,a,9,h1 2p,0,h,7,6,3,8q 5j,0,2q,13,23,9,d9 97,0,29,8,c,9,47 2,0,1e,g,m,q,8d 97,0,y,a,k,1f,8z 2i,0,2y,a,j,18,8j 40,0,37,12,11,6,ar 42,0,32,15,15,1q,10 8d,0,4p,8,6,9,cw 8d,0,4g,e,j,9,63 2j,0,2d,7,6,9,e2 35,0,1c,s,p,6,1o q,0,3w,b,c,j,2 3z,0,34,k,u,9,cl c,0,1b,e,9,9,1l 15,0,j,5,b,6,j 8m,0,3o,r,m,d,9d 8j,0,34,i,o,d,6l 89,0,3t,c,f,d,hf 88,0,3q,f,d,9,d9 8a,0,45,4,5,9,d2 8q,0,45,5,5,d,8u 1n,0,19,k,n,9,et 1o,0,r,r,v,9,hb n,0,4t,h,i,a,7p m,0,59,7,7,6,co 3z,0,4k,3,3,3,n 8u,0,j,b,e,9,1 8t,0,14,j,10,j,dc b,0,30,f,f,g,1t 31,0,14,r,g,9,8o 91,0,4a,b,f,9,4i 7e,1,p,3,4,a,0 0,0,1c,b,e,9,8d a,0,2m,d,5,9,ap 1,0,2d,f,i,j,8e 7,0,3r,a,5,9,1u 97,0,k,5,9,9,d1 93,0,l,a,h,9,4 3j,1,o,i,9,9,9j 83,0,u,i,h,9,47 1q,0,1h,7,9,9,67 18,0,q,h,10,9,92 5v,0,e,3,4,9,5s 19,0,40,6,9,9,6b 2i,0,1g,7,6,9,ex 2i,0,2d,7,6,9,ey 2h,0,1p,3,3,9,2o 2g,0,1h,c,b,9,3l 40,0,4q,29,1a,d,ar 41,0,1w,h,e,9,5b 40,0,3g,b,b,9,1z 49,0,29,y,w,1q,9l 1h,0,53,i,k,9,2d 40,0,2k,3,3,9,f1 40,0,33,3,3,9,8p 4s,0,n,6,7,9,bk 8p,0,2w,9,c,9,9g 3z,0,c,f,20,9,3c 40,0,q,3,4,9,6i',
    boats: '75,0,x,u,dq 74,0,1p,12,ev 6w,0,1a,x,dg 6t,0,1s,g,cx 6x,0,1p,r,3v 74,0,16,z,64 75,0,18,11,4z 83,0,98,g,cx 83,0,93,i,2 83,0,8s,p,45 7i,0,2i,v,1u 7i,0,2d,n,1u 7i,0,1y,12,ar 7i,0,z,k,1v 7i,0,1r,i,1v 7i,0,1c,q,al 83,0,7r,11,cv 83,0,7h,k,d1 83,0,71,l,d1 83,0,6u,s,4b 83,0,5i,j,cz 83,0,65,v,cz 83,0,5x,h,cz 83,0,6l,13,cz 83,0,60,x,48 83,0,4o,m,cz 83,0,4a,k,cz 83,0,51,11,cz 82,0,4y,q,ej 82,0,5p,12,ej 7h,0,53,p,ch 82,0,57,11,5t 83,0,5e,v,49 83,0,4l,10,49 83,0,4s,l,49 83,0,49,l,49 5w,0,4v,11,47 5w,0,41,z,47 5w,0,4d,h,ha 5w,0,4u,m,ha 5m,0,4g,j,d1 5b,0,1w,13,g 58,0,22,13,l 56,0,2v,j,ds 57,0,28,m,9b 55,0,1r,q,9f 82,0,r,10,eg 82,0,1m,r,eg 80,0,1q,t,fh 7v,0,26,g,9y 82,0,14,12,5q 83,0,20,p,d0 81,0,2c,u,fd 83,0,1e,p,49 75,0,26,n,dq 75,0,2w,x,dq 6t,0,2h,q,c0 74,0,2f,k,65 75,0,2l,h,50 75,0,1y,o,50 62,0,s,t,hf 63,0,1e,l,hf 61,0,20,j,0 63,0,2m,l,hf 5x,0,36,k,ge 52,0,2f,f,9c 54,0,2s,i,58 54,0,1z,12,dv 52,0,1p,11,e1 8c,0,8b,13,cd 8c,0,7o,m,cd 8c,0,7i,z,3n 8c,0,84,g,3n 83,0,2w,r,cv 82,0,2p,z,ef 82,0,3f,m,ef 82,0,2z,h,a3 82,0,3u,r,3j 83,0,39,n,45 83,0,2m,x,8l 48,0,1a,w,5d',
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
    /**
     * Ground out to ninety-five metres, and the sea where the boats are.
     *
     * It was one band - fifteen metres either side - which was right when the
     * lap here was mostly guesswork and came back past itself with a shelf of
     * ground hanging over the road below. Read off the circuit relation it does
     * not do that any more, and one band left two hundred and eighty measured
     * buildings standing on nothing with the road floating between them.
     *
     * The sea window used to say the second to the twelfth per cent of the lap.
     * It was written when lap nought began wherever the first fragment did,
     * which turned out to be four fifths of a lap from the start line - so the
     * harbour was being drawn in the hills above Casino. The boats are measured,
     * along Port Hercule's own piers, so the water goes where they are.
     */
    land: { rise: 0.5, roll: 0.3, plain: -1.2, runoff: 1.6, reach: 3,
      sea: { at: 0.26, span: 0.30, level: -4 } },
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
    metres: 6290,
    line: '-hbx r73 -r7k rab -ras rdj -re0 rgq -rh7 rjy -rkf rn5 -rnm rqd -rqu rtk -ru1 rws -rx9 rzz -s0g s37 -s3o s6e -s6v s9m -sa3 scu -sdb sg1 -sgi sj9 -sjp smf -smv spm -sq2 sst -sta sw0 -swg sz7 -szn t2e -t2l t5c -t5i t8a -t8h tb9 -tbc te4 -tf6 thm -tk4 tlb -tnv toy -tri tsl -tv4 tw9 -tyq u00 -u26 u3v -u5w u7t -u9p ubq -udg ufm -uh2 ujg -ukj un2 -uo2 uqo -urb uu0 -uuf ux6 -uxg v07 -v04 v2w -v2m v5d -v4v v7m -v6w v9k -v8j vb4 -v9u vcb -vav vd8 -vbj vdq -vc1 ve8 -vcw vfc -vea vgu -vfy vik -vi1 vks -vkg vn7 -vn3 vpv -vq3 vsu -vti vw7 -vwy vzn -w0e w32 -w3t w6h -w78 w9x -waq wdd -wei wh1 -wim wkv -wmt wos -wqw wsp -wv0 wwj -wyv x0e -x2j x4a -x68 x87 -x9r xc2 -xd5 xfo -xg8 xiy -xj5 xlx -xlw xoo -xom xre -xrc xu4 -xu2 xwu -xws xzj -xzi y2a -y29 y51 -y51 y7t -y7o yag -y9v ycl -ybn ye9 -ycv yf9 -ydm yfu -ydv yfu -ydo yfe -ycx ye6 -ybk ych -y9u yaq -y85 y94 -y6m y7t -y5g y6x -y4v y6q -y52 y7a -y5x y8b -y7f ya2 -y9m ycc -yc2 yeu -yei yh9 -ygv yjm -yj6 ylx -yld yo3 -yni yq8 -yph ys5 -yrb yty -ysx yvi -yug yx0 -yvw yyg -yxg z01 -yz3 z1p -z0y z3m -z30 z5q -z56 z7w -z7i za9 -za1 zct -zcl zfc -zf7 zhz -zhv zkn -zki zna -zn6 zpy -zpw zso -zso zvg -zvf zy7 -zy7 100z -1012 103u -103y 106q -106t 109l -109q 10ch -10cn 10ff -10fl 10id -10ij 10lb -10lg 10o8 -10od 10r5 -10ra 10u2 -10u7 10wy -10x3 10zv -10zz 112r -112w 115o -115t 118l -118p 11bh -11bm 11ee -11ei 11ha -11hf 11k6 -11kd 11n5 -11nb 11q3 -11q9 11t1 -11t7 11vz -11w5 11yx -11z3 121u -121y 124q -124t 127l -127p 12ah -12am 12de -12dk 12gc -12gj 12jb -12jh 12m8 -12me 12p6 -12pp 12sf -12tc 12vy -12xc 12zr -131o 133o -135r 137k -139x 13bc -13dy 13ew -13hl 13i7 -13kz 13l0 -13nr 13nc -13py 13p1 -13rh 13q7 -13sf 13qs -13so 13qm -13s4 13pt -13qv 13oa -13p3 13mg -13n3 13kd -13ks 13i2 -13i8 13fg -13ff 13cn -13ch 139p -1398 136i -135s 1333 -1325 12zj -12ye 12vv -12uj 12s3 -12qo 12ob -12mv 12kh -12j1 12gn -12f5 12ct -12bb 1290 -127h 1255 -123n 121b -1200 11xk -11wg 11tw -11sw 11qa -11pd 11mr -11m2 11jd -11is 11g3 -11fm 11cv -11ci 119r -119j 116r -116l 113u -113s 1110 -110z 10y7 -10y9 10vh -10vo 10sw -10t6 10qf -10qs 10o0 -10og 10lq -10mf 10jq -10kg 10hr -10ij 10fv -10gr 10e5 -10f7 10cm -10dt 10bb -10cj 10a1 -10bc 108w -10a7 107r -1092 106m -107t 105a -106b 103q -104n 1021 -102r 1003 -100r zy1 -zyl zvv -zw7 ztg -ztn zqw -zqw zo4 -zo3 zlb -zlc zik -zj6 zgg -zhm zf4 -zgs zek -zgn zet -zh5 zfo -zi9 zh9 -zjy zjc -zlz zl4 -znq zmr -zp6 znt -zpy zo7 -zq6 zo7 -zpw znq -zp3 zmn -znk zky -zlo zj0 -zjj zgt -zh7 zeg -zet zc2 -zcd z9l -z9r z6z -z75 z4e -z4f z1n -z1k yys -yyn yvv -yvn ysv -ysk ypt -ypg ymp -yma yjj -yiy yg8 -yfm ycx -yc8 y9j -y8r y63 -y59 y2m -y1n xz1 -xxy xve -xub xrr -xqo xo3 -xn1 xkh -xje xgu -xfr xd7 -xc4 x9k -x8j x5y -x4w x2b -x1b wyq -wxr wv5 -wu6 wrl -wqp wo2 -wna wkm -wjv wh7 -wgk wdu -wde wao -wa8 w7h -w71 w4a -w41 w1a -w13 vyb -vya vvi -vvi vsq -vsr vpz -vq4 vnc -vnh vkp -vkt vi1 -vi2 vfa -vf9 vci -vcd v9l -v9f v6n -v6d v3l -v3b v0k -v02 uxb -uws uu2 -utf uqq -uq3 une -umk ujw -uj0 uge -ufd ucs -ubp u95 -u80 u5h -u48 u1q -u0g txz -twh tu5 -tso tqc -tov tmi -tl1 tio -th7 teu -tdg tb2 -t9o t79 -t5y t3i -t27 szq -syi sw1 -sut ssb -sr8 soo -snp sl3 -skb shn -sgw se8 -sdh sat -sa6 s7g -s6w s46 -s3m s0w -s0d rxn -rx6 rug -ru3 rrc -rr0 ro8 -ro2 rla -rl4 rid -ri8 rfg -rfd rcl -rcn r9v -r9y r76 -r78 r4g -r4k r1s -r1z qz7 -qzi qwr -qx2 qua -qup qrz -qsg qpp -qq9 qnj -qo5 qlg -qm2 qjc -qjz qha -qi5 qfi -qg4 qde -qdj qas -qac q7m -q6n q41 -q2p q0a -pyl pwe -puc psh -pqb pol -pmd pkp -pij pgs -pep pcv -pb1 p8y -p7g p54 -p3u p1d -p0b oxr -owz oub -otp oqz -oqd ono -on2 okc -ojp oh0 -ogg odq -od6 oag -o9y o78 -o6y o46 -o4b o1j -o1v nz4 -nzq nx1 -ny2 nvh -nwp nu7 -nvh nt0 -nu9 nrs -nt2 nql -nru npd -nqo no8 -npi nn1 -nob nlu -nn4 nko -nlz nji -nks nib -njl nh5 -nig nfz -nh9 net -ng1 ndj -neq nc7 -nd8 nao -nbp n94 -na0 n7d -n88 n5l -n6d n3p -n4c n1n -n2b mzm -mzz mx7 -mxl muu -mv8 msh -msn mpw -mq1 mn9 -mnb mkj -mke mhm -mhi meq -meg mbo -mbd m8m -m87 m5g -m4x m27 -m1m lyw -ly6 lvi -lus ls3 -lrd lop -lo5 llf -lkv li5 -lhl lev -leb lbl -lax l88 -l7i l4t -l42 l1e -l0n kxz -kx4 kuh -ktl kqy -kq1 kne -kmi kjw -kiw kga -kfa kcp -kbp k94 -k80 k5g -k4c k1t -k0m jy3 -jww jue -jt4 jqn -jp9 jmv -jlh jj2 -jhl jf8 -jdr jbf -j9x j7k -j62 j3q -j28 izw -iy8 iw0 -iuc is4 -iqg io8 -imk ikc -iio igg -ien ick -iao i8l -i6q i4o -i2o i0r -hyr hwu -hut hsx -hqw hoz -hmx hl2 -hix hh5 -hf0 hd9 -hb2 h9c -h75 h5g -h37 h1l -gzc gxp -gvg gtt -gri gpz -gno gm4 -gjt gi9 -gfy gee -gc4 gaj -g88 g6n -g4d g2s -g0j fyx -fwn fv2 -fss fr6 -fow fna -fkz fjg -fgw ffu -fd4 fco -f9x fa7 -f7m f8l -f6f f85 -f6a f8b -f6z f9e -f8o fbc -fbi fe9 -ff0 fho -fie fl3 -flt foh -fp7 frw -fsm fvb -fw0 fyo -fze g23 -g2p g5e -g60 g8q -g9b gc1 -gcl gfb -gfv gil -gj5 glv -gmd gp3 -gpk gsb -gss gvi -gvz gyq -gz7 h1x -h2d h54 -h67 h8d -hb4 hao -hdd hcq -hf1 hf9 -he5 hgp -hfm hi5 -hh1 hjl -hii hl2 -hjz hmj -hmp hpf -hpz hsp -hta hw0 -hwk hz9 -hzu i2k -i34 i5u -i6g i96 -i9t ici -id4 ifu -igg ij5 -ijr imh -in3 ips -iqe it4 -its iwh -ix4 izt -j0h j36 -j3y j6m -j7f ja3 -jaw jdk -jef jh2 -jhx jkk -jlg jo3 -joy jrl -jsg jv3 -jvz jym -jyg k0y -jyb jz3 -jwd jwz -jua jux -jt2 jue -jwv jxx -k0m k1a -k3z k4n -k7c k7z -kaf kbp -kcz kfc -kg9 kiw -kjt kmf -knc kpy -kqv kti -kuf kx1 -kxy l0l -l1i l44 -l51 l7n -l8k lb7 -lc4 leq -lfm li9 -lj6 lls -lmp lpb -lq8 lsv -lts lwe -lxb lzy -m0v m3h -m4e m71 -m7x maj -mbf me2 -mey mhl -mih ml3 -mlz mom -mpj ms6 -mt2 mvp -mwl mz7 -n03 n2q -n3m n69 -n75 n9r -nan nda -ne6 ngt -nhq nkc -nl8 nnv -nor nre -nsa nux -nvt nyf -nzc o1z -o2v o5h -o6e o91 -o9x ock -odg og2 -ogz ojm -oki on4 -oo1 oqo -ork ou7 -ov3 oxp -oym p19 -p24 p4r -p5l p88 -p98 pbt -pdj pfn -pia piy -pll pku -pnb pm3 -poo pnn -pqd pqe -psv pu5 -pvy py0 -pyx q1i -q1f q46 -q3s q6j -q5y q8o -q82 qas -q9w qcj -qbn qe9 -qd8 qft -qes qhd -qgk qj7 -qii ql7 -qko qne -qmz qpq -qpj qsb -qs9 qv1 -qv2 qxu -qy2 r0t -r16 r3y',
    height: '13 -2 -2 -3 -2 -2 -3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 -1 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 0 0 0 0 0 0 0 0 0 -1 -1 0 0 0 -1 -1 -1 -1 0 -1 -1 -1 0 0 0 -1 -1 -1 0 -1 -1 -1 -1 0 0 0 0 0 1 1 1 1 0 3 2 2 3 1 2 1 2 1 1 1 1 0 0 -1 -1 -1 -1 0 -1 -1 -1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 -1 1 1 0 1 1 1 0 1 1 1 1 2 1 0 0 0 0 0 0 0 0 0 0 0 0 -3 -3 -3 -3 -3 -3 -1 -1 0 -1 -1 -1 0 2 2 2 3 2 2 0 -2 -2 -3 -2 -2 -2 -3 -2 -2 -3 0 0 0 3 2 2 3 2 2 2 3 2 2 0 0 -1 -2 -1 -2 -1 -2 -1 -2 -1 0 0 0 0 1 2 1 2 1 2 1 2 1 0 0 0 0 0 0 0 -1 -1 -1 0 -1 -1 -1 -1 0 -3 -2 -2 -2 -1 -2 -1 -2 -1 -2 1 1 0 3 2 2 3 2 2 2 3 2 2 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 0 2 2 1 2 0 1 1 0 0 -1 -1 -2 -1 -3 -2 -2 -2 -1 0 1 2 2 2 4 4 3 3 2 2 0 -1 -2 -3 -4 -5 -4 -6 -5 -4 -4 -2 -2 0 1 1 1 1 2 1 2 1 2 1 2 2 1 2 3 3 3 3 3 3 2 2 1 1 2 1 0 0 0 0 1 0 0 1 1 0 0 0 -1 -1 -1 -1 -2 -2 -2 -1 -1 -1 0 1 1 1 0 0 1 1 1 0 1 1 1 0 0 0 0 0 1 0 0 -1 -1 -2 -2 -2 -2 -3 -2 -2 -2 -1 -1 -1 1 1 2 1 2 1 2 2 1 2 1 2 3 2 2 1 2 0 1 1 1 1 0 -1 -2 -1 -3 -2 -1 -2 -1 -1 0 -1 0 0 1 0 1 1 1 1 1 2 1 2 1 1 1 1 0 1 0 0 0 -1 -2 -2 -1 -2 0 -1 -1 0 0 2 1 1 1 1 1 2 2 1 2 1 0 -1 -2 -3 -3 -3 -2 -2 -2 -2 -3 -2 -1 -2 -2 0 0 0 0 0 0 0 0 0 0 0 0 1 3 1 1 1 2 1 0 0 0 0 0 0 0 -2 -1 0 0 0 0 0 1 2 1 3 1 1 0 -1 -1 -1 -3 -2 -3 -3 -3 -2 -3 -1 -1 -1 0 1 0 1 1 0 1 0 -1 -1 -2 -1 0 0 0 0 1 1 1 1 0 0 0 0 0 -2 -2 -1 -2 -1 -2 0 -1 1 1 2 1 2 4 3 3 3 3 1 0 0 -1 -2 -1',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '3m,1,3r,8,f,9,db 3j,1,3t,6,e,9,4h fu,1,k,30,3k,9,hf 9q,1,m,p,15,9,1 gs,1,1l,w,10,9,cy 9w,1,11,o,y,9,ad 3l,1,1g,m,u,c0,4g ab,0,g,k,1r,9,4r 9l,0,h,f,1l,9,40 4v,1,2l,1c,1p,9,83 4p,1,4w,i,k,9,3n 4p,1,40,h,i,9,cd 55,1,32,k,l,9,45',
    boats: '4s,1,81,u,ff 4s,1,79,12,ff 4s,1,6w,x,2a 4s,1,6s,g,2a 4t,1,7o,j,74 4q,1,92,n,97 4q,1,8h,k,4t 4q,1,95,x,e 4q,1,8i,z,4t 4r,1,96,k,x 4r,1,8q,q,9n 4q,1,8g,j,94 4q,1,6o,12,4t 4q,1,7b,t,95 4r,1,6s,11,5d 4r,1,7u,x,5b 4r,1,7g,r,9n 4q,1,64,10,95 50,1,5d,o,48 51,1,5u,l,4g 52,1,5c,m,4l 53,1,5v,p,4v 53,1,5f,q,4v 54,1,64,n,55 53,1,66,g,dl 50,1,65,g,9f 4z,1,60,i,j',
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
    metres: 5532,
    line: '-1na -69d 66m -670 649 -64h 61p -61u 5z2 -5z2 5wa -5w3 5tb -5t1 5qb -5pt 5n3 -5mi 5ju -5j5 5gh -5fo 5d2 -5c3 59h -58j 562 -54t 52d -511 4ym -4x8 4uv -4tg 4r2 -4pm 4n8 -4ls 4jf -4i0 4fm -4e6 4bt -4ac 47y -46i 445 -42p 40c -3yw 3wj -3v2 3so -3r8 3ov -3nf 3l2 -3jl 3h7 -3fr 3de -3by 39l -385 35s -34b 31x -30h 2y4 -2wo 2ub -2su 2qh -2p1 2mn -2l6 2iu -2hd 2ew -2dm 2b2 -2a0 27a -26r 23z -23p 20x -20v 1y3 -1ya 1vj -1vy 1tb -1u3 1rk -1sq 1qc -1rr 1pi -1r4 1ou -1qf 1o6 -1ps 1ni -1p3 1mo -1o2 1lg -1mf 1jq -1ke 1hn -1i1 1f9 -1f8 1ch -1c3 19f -18p 164 -152 12n -11c z6 -xg vc -ti ri -pk nk -ln jn -hq fq -ds bi -9y 7f -6a 3o -2p 0 p -3g 3r -6j 6k -9b 92 -bs b9 -dy da -fy f5 -hq gq -ja i5 -ki j3 -lf jw -lx k2 -m0 k0 -lp ji -kx ij -jq h8 -i7 fl -g6 dh -dq ay -ay 86 -7q 50 -46 1j -3 -2a 4d -66 8m -9x cn -d4 fv -fn if -i3 ku -kh n8 -mx pp -pj sb -sa v2 -v8 xz -ya 111 -11h 146 -14s 17i -184 1at -1bf 1e5 -1es 1hi -1i4 1kt -1lf 1o5 -1oq 1rg -1s1 1uq -1vc 1y2 -1yn 21d -21y 24p -254 27v -287 2az -2b4 2dw -2dx 2gp -2gq 2ji -2jg 2m8 -2m5 2ox -2ou 2rm -2rj 2ub -2u8 2x0 -2wx 2zp -2zm 32e -32b 353 -351 37t -37q 3ai -3af 3d7 -3d4 3fw -3ft 3il -3ii 3la -3l7 3nz -3nx 3qp -3qm 3te -3tb 3w3 -3w0 3ys -3yp 41h -41e 446 -443 46v -46t 49l -49m 4cd -4cm 4fc -4fu 4ik -4j7 4lv -4ml 4p9 -4q1 4so -4tl 4w7 -4x4 4zq -50o 53a -548 56v -57t 5af -5bc 5dz -5ev 5hh -5id 5l0 -5lw 5oj -5pg 5s1 -5t0 5vm -5wl 5z9 -603 62q -63k 668 -671 69o -6ah 6d6 -6dw 6gl -6ha 6jz -6ko 6ne -6ny 6qo -6r7 6rs -6p7 6pp -6my 6ng -6kq 6l7 -6ig 6iy -6g8 6gq -6dz 6g5 -6ey 6hm -6gu 6je -6ib 6kv -6js 6ma -6l1 6ni -6m9 6ol -6n3 6pd -6nr 6pt -6nz 6px -6nx 6pm -6ng 6oo -6m6 6n4 -6ki 6la -6im 6j0 -6g9 6gd -6dm 6d3 -6ad 69v -674 66r -640 644 -61c 620 -5zb 60l -5y6 5zy -5xt 5zs -5xu 600 -5y8 60e -5yo 60v -5z6 61d -5zo 61q -5zv 61n -5zj 603 -5xf 5wv -5u6 5sc -5qb 5nz -5mg 5k3 -5in 5ga -5et 5cg -5b0 58m -576 54t -53d 50z -4zj 4x6 -4vq 4td -4rx 4pj -4o3 4lq -4ka 4hw -4gg 4e3 -4cm 4a9 -48t 46f -44z 42m -416 3ys -3xc 3uz -3tk 3r6 -3pq 3nc -3lw 3jj -3i3 3fp -3ea 3bw -3ag 383 -36n 349 -32u 30g -2z0 2wm -2v7 2su -2re 2p0 -2nk 2l7 -2js 2he -2fy 2dl -2c5 29r -28b 25x -24h 224 -20o 1ya -1wv 1ui -1t2 1qo -1p8 1mv -1lf 1j1 -1hl 1f7 -1ds 1bf -19z 17l -165 13r -12c zz -yj w1 -uv s9 -r9 ol -nv l6 -kg hp -h8 ei -e2 bo -aa 7z -6g 44 -2l a 19 -3l 54 -7u 85 -ax b2 -du dz -gr gw -jo jt -mk mp -ph pm -se sj -vb vg -y8 yd -115 119 -141 144 -16w 170 -19s 19w -1co 1cs -1fk 1fo -1ig 1ij -1lb 1lf -1o7 1ob -1r3 1r7 -1tz 1u2 -1wu 1wy -1zq 1zu -22m 22q -25h 25l -28d 28e -2b5 2as -2ct 2b0 -2bi 28u -283 25f -23t 21k -1ze 1xo -1ve 1ts -1ri 1px -1nn 1m2 -1js 1i7 -1fx 1ec -1c1 1ah -186 16m -149 12t -10a z5 -wi vo -sw sk -pt po -mw n4 -ke kx -ia j2 -gk ht -fc gl -e3 fb -ct e1 -bj cq -a8 bf -8w a2 -7j 8q -65 74 -4i 5h -2u 3p -11 1t x -f 36 -2q 5i -5e 86 -84 aw -ay dq -dq gc -fe hz -h0 jm -io la -kb mx -lz ol -nm qa -pq si -sm ve -vh y9 -yd 115 -118 140 -144 16w -16z 19r -19v 1cn -1cr 1fj -1fm 1ie -1ii 1la -1ld 1o5 -1o9 1r1 -1r4 1tw -1u0 1ws -1wv 1zn -1zr 22j -22m 25e -25i 28a -28e 2b6 -2b9 2e1 -2e5 2gx -2h0 2js -2jw 2mo -2mr 2pj -2pn 2sf -2si 2v9 -2vd 2y5 -2y9 311 -314 33w -340 36s -36v 39n -39r 3cj -3cm 3fe -3fi 3ia -3id 3l5 -3l9 3o1 -3o4 3qw -3r0 3ts -3tw 3wo -3wr 3zj -3zn 42f -42i 45a -45e 486 -489 4b1 -4b5 4dx -4e0 4gs -4gw 4jo -4jr 4mj -4mo 4pg -4pk 4sc -4sg 4v8 -4vd 4y5 -4y9 511 -515 53w -541 56t -56x 59p -59t 5cl -5cq 5fi -5fm 5ie -5ii 5la -5lf 5o7 -5ob 5r3 -5r7 5tz -5u3 5wv -5x0 5zs -5zw 62o -62s 65k -65p 68h -68l 6bd -6bh 6e8 -6ed 6h5 -6h9 6k1 -6k5 6mx -6n2 6pu -6py 6sq -6su 6vm -6vr 6yj -6yn 71f -71j 74b -74g 778 -77c 7a4 -7a8 7d0 -7d4 7fw -7g1 7it -7ix 7lp -7lt 7ol -7oq 7rh -7rl 7ud -7uh 7x9 -7xe 806 -80a 832 -83d 85v -870 889 -8am 8a7 -8cy 8c9 -8ex 8e7 -8gw 8g7 -8iw 8i7 -8kw 8k6 -8mu 8m5 -8ou 8oa -8r0 8ri -8u4 8wn -8xq 909 -91a 91v -94f 93a -95t 94g -96v 95i -97x 96k -98z 97j -99x 98a -9aj 98k -9ah 985 -99n 970 -97u 952 -956 92e -92d 8zl -8zj 8wr -8wq 8ty -8tx 8r5 -8r7 8oh -8p0 8mk -8nt 8lt -8np 8ma -8on 8nt -8qg 8q3 -8su 8sv -8vn 8w9 -8yy 8zx -92j 943 -96d 98d -9aa 9ch -9e6 9gj -9i0 9kd -9lv 9o8 -9po 9s1 -9th 9um -9x3 9wt -9zj 9xy -a07 9y1 -9zr 9xe -9yv 9wh -9xw 9vi -9wy 9ul -9w1 9tn -9v2 9so -9u4 9rq -9t6 9qt -9s8 9pu -9ra 9ow -9qb 9ny -9pe 9my -9ob 9lv -9n6 9kp -9ly 9jh -9kq 9i8 -9jg 9gx -9i3 9fk -9gq 9e7 -9fb 9cr -9dw 9bd -9ch 99w -9ax 98c -99d 96s -97s 956 -966 93k -94j 91x -92v 90a -919 8yn -8zl 8wz -8xy 8vc -8wb 8tp -8un 8s1 -8t0 8qe -8rd 8os -8ps 8n7 -8o6 8lk -8mj 8jx -8kw 8ia -8j8 8gm -8hl 8ez -8fx 8db -8ea 8bp -8cn 8a1 -8b0 88e -89d 86r -87p 850 -85i 82q -82v 803 -809 7xh -7xn 7uv -7v1 7s9 -7se 7pm -7ps 7n0 -7n6 7kf -7kk 7hs -7hy 7f6 -7fc 7ck -7cq 79y -7a3 77b -77h 74p -74v 724 -72a 6zi -6zn 6wv -6x1 6u9 -6uf 6rn -6rt 6p1 -6p6 6me -6mk 6kl -6iy 6hx -6fg 6f5 -6ce 6cy -6a8 6bl -696',
    height: '1c -3 -3 -3 -2 -2 0 -2 -1 1 2 3 3 4 3 4 3 3 3 2 2 1 0 1 0 0 -1 -1 0 0 0 0 0 1 0 1 0 1 0 1 1 -1 -1 -1 -2 -3 -3 -2 -2 -2 -1 -1 0 0 1 1 2 3 4 3 4 3 2 0 -1 -2 -3 -4 -6 -6 -6 -6 -6 -6 -5 -3 -2 -3 0 0 0 2 2 3 3 3 3 2 2 0 1 0 0 0 1 1 2 2 1 2 1 2 2 2 3 2 2 3 1 2 0 0 0 0 -2 -2 -3 -4 -5 -4 -6 -4 -4 -3 -3 -1 -1 -1 0 0 1 1 1 1 2 1 1 2 1 2 3 3 4 3 5 5 4 2 1 0 0 -2 -2 -3 -3 -2 -1 -2 -2 0 0 2 2 2 2 2 3 1 3 1 2 1 1 -1 -1 -1 -2 -4 -4 -5 -4 -6 -7 -7 -6 -6 -5 -5 -3 -1 0 1 3 3 4 4 5 3 3 2 0 -2 -3 -2 -2 -3 -1 0 1 1 3 3 4 6 6 7 7 7 6 5 4 3 2 0 0 0 -2 -2 -4 -5 -3 -3 -1 0 1 3 3 3 3 2 2 3 3 0 0 -2 -4 -6 -7 -7 -6 -5 -5 -4 -3 -3 -2 -3 0 0 1 2 1 3 3 3 4 3 3 3 2 1 0 -2 -2 -2 -3 -1 -2 -2 -1 -2 -1 0 1 2 2 3 3 2 2 1 2 1 2 0 0 -1 -1 -2 -1 -2 -1 -2 -2 -3 -3 -4 -4 -4 -3 -3 -3 -3 -1 -1 0 1 1 2 2 3 3 1 2 1 1 0 -1 0 -1 -1 -1 -1 -1 0 1 4 3 3 4 4 3 3 3 3 2 3 2 0 -1 -2 -2 -2 -3 -3 -2 -2 0 1 2 4 4 6 7 6 7 5 4 2 0 -1 -3 -4 -6 -7 -7 -6 -7 -5 -4 -3 -1 0 0 2 1 1 1 0 -1 -1 -1 -2 0 -1 0 0 1 1 2 1 2 3 2 2 3 2 2 3 2 1 2 2 1 1 1 0 0 0 0 -2 -3 -3 -5 -5 -7 -8 -7 -8 -8 -6 -5 -4 -2 -1 -1 2 3 5 7 8 7 8 7 6 5 3 2 2 2 1 -1 -1 -1 0 -1 -2 -2 -3 -2 -3 -2 -2 -3 -3 -4 -4 -4 -4 -2 -2 0 -2 -2 -1 -2 0 0 1 2 3 3 2 2 3 3 2 2 1 1 0 -1 -1 -2 -3 -3 -3 -2 -2 -1 1 2 1 2 0 1 1 1 1 0 0 0 -1 -2 -1 0 0 3 2 4 3 3 2 0 0 0 0 0 -1 -1 -1 -2 -2 -2 -1 0 0 3 3 3 3 3 2 1 1 1 1 1 0 -1 -2 -3',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '2i,1,4m,8,s,7,e 2h,1,4q,a,i,7,hd bl,0,4p,r,p,d,bp 2n,1,36,c,i,6,8r 4l,1,55,8,a,4,c5 2m,1,49,f,p,a,2w a0,0,3s,8,6,4,d4 7s,1,3u,c,7,4,4e 7v,1,54,9,a,4,2q 9v,0,3t,7,6,4,d4 ar,0,4w,8,a,5,8j 9e,0,59,9,d,4,cc 7g,1,4z,8,8,4,7o ad,0,4q,b,7,4,h 85,1,56,8,9,4,25 av,0,3r,9,b,5,4d ak,0,4b,c,a,5,71 9e,0,55,a,9,4,ds 7u,1,3t,9,6,4,d3 7l,1,3u,b,7,4,4c 7n,1,3u,8,8,4,4c 7f,1,3w,6,8,4,0 ay,0,50,8,a,5,8j an,0,4v,8,9,5,ha a7,0,3q,a,a,4,d4 a1,0,54,9,8,4,a 7j,1,3v,6,a,4,8p 9e,0,3w,8,6,4,d4 b7,0,3r,8,b,5,4b an,0,3s,9,b,5,4e a2,0,3s,7,6,4,d2 7e,1,3w,9,6,4,45 80,1,3w,c,9,4,1 9x,0,3s,8,6,4,4d al,0,3w,b,a,5,65 9e,0,3x,9,6,4,d3 9h,0,51,8,8,4,30 9y,0,53,8,b,4,c0 a0,0,4x,3,5,3,d7 ab,0,40,a,7,4,6u b9,0,3r,9,b,5,4e a4,0,3s,8,8,4,d3 9f,0,3v,6,7,4,8p 7z,1,52,8,7,4,94 a6,0,4x,a,9,4,c5 7p,1,3v,6,a,4,8p 9t,0,3t,8,6,4,d4 9t,0,53,8,9,4,j 9q,0,53,c,e,6,bz 9k,0,52,6,7,4,h9 b6,0,3r,9,b,5,4c b3,0,3r,9,b,5,4d 7e,1,57,8,9,4,dg 7k,1,52,9,8,4,9g a9,0,3s,5,8,4,8p 7e,1,43,8,7,4,47 ap,0,3n,9,b,5,4d aw,0,3r,9,b,5,4d 85,1,4r,b,b,4,26 9r,0,3v,b,9,4,8a 9k,0,3r,9,9,4,ee 7s,1,53,8,9,4,55 a9,0,4x,8,9,4,4t 84,1,47,c,8,4,2g az,0,3r,9,b,5,4d b4,0,3r,9,b,5,4d 7y,1,3u,c,7,4,4e 82,1,54,9,8,4,32 av,0,4y,8,8,5,ha ay,0,3r,9,b,5,4d aj,0,4v,8,a,5,8k aq,0,3r,9,b,5,4d 9i,0,3v,7,6,3,d3 85,1,3i,3,3,3,au b1,0,3r,9,b,5,4d 85,1,55,8,5,4,aq 7n,1,51,a,b,4,82 at,0,3r,9,b,5,4d 84,1,53,8,b,3,dd as,0,3r,9,b,5,4d 7w,1,3v,6,a,4,8r 7g,1,3t,9,6,4,4c 85,1,4f,b,a,7,8y 83,1,3v,6,a,4,8u c0,0,47,7,a,4,ex cc,0,53,8,7,3,bu cc,0,45,8,6,4,bt cg,0,52,6,b,3,fw cc,0,4y,6,8,4,7h ce,0,4p,a,8,4,2w cb,0,53,9,7,4,e4 cc,0,4z,6,8,3,7h c1,0,3z,5,c,4,go cc,0,3s,a,7,3,bu cd,0,4d,c,7,4,2w cc,0,51,a,9,4,7g c0,0,50,6,b,4,41 cc,0,3x,8,6,4,bt cc,0,3l,b,c,4,g7 cc,0,3v,9,6,4,bv 6t,0,u,4y,2k,9,1 2u,1,r,a,7,9,8e h,0,e,9,9,9,77 i,0,c,3,4,9,76 2v,1,j,3,3,9,h4 25,1,2m,d,1b,9,9s 27,1,35,7,d,9,1h 21,1,2c,8,d,9,91 10,0,1l,h,z,9,2r 42,0,p,a,m,9,85',
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
    metres: 6190,
    line: '-1sv 1o 14 -14 3w -3w 6o -6p 9h -9h c9 -c9 f1 -f1 ht -ht kl -kl nd -nd q5 -q6 sy -sy vq -vq yi -yi 11a -119 141 -141 16t -16t 19l -19l 1cd -1cf 1f7 -1f8 1i0 -1i2 1ku -1kv 1nn -1nn 1qf -1qe 1t6 -1t5 1vx -1vw 1yo -1yn 21f -21f 247 -247 26z -26z 29r -29q 2ci -2ci 2fa -2fa 2i0 -2hl 2jp -2i1 2jx -2hw 2jz -2i6 2kl -2j8 2lm -2k7 2mi -2kz 2mu -2kr 2mc -2k2 2ln -2jd 2l6 -2j4 2lm -2kh 2n8 -2mw 2pk -2ox 2qz -2p9 2r3 -2oz 2qt -2or 2qm -2oj 2qd -2oa 2q5 -2o3 2px -2nu 2pp -2nm 2pg -2ne 2p9 -2n6 2p0 -2mx 2os -2mq 2ok -2mh 2oc -2m9 2o3 -2m1 2nw -2lt 2nn -2lk 2nf -2ld 2n7 -2l4 2mz -2kx 2mr -2ko 2mj -2kg 2ma -2k8 2m3 -2k0 2lu -2jr 2lm -2jk 2lf -2jc 2l6 -2j3 2ky -2iw 2ko -2ik 2jq -2h7 2he -2eo 2e0 -2bb 29v -27i 25t -23m 21w -1zp 1zz -1z6 216 -21s 1z4 -1yb 1vl -1v4 1sd -1rz 1p7 -1p9 1mh -1mn 1jz -1kq 1i4 -1j1 1gk -1ht 1ff -1gt 1ei -1g2 1dr -1fb 1d6 -1ex 1cx -1eu 1ct -1eq 1cq -1eo 1co -1el 1ch -1e9 1by -1di 1aw -1bu 196 -19v 174 -17i 14q -14w 124 -121 ze -yk vx -v2 sh -rg oz -np lb -jy hu -g0 dx -c4 ad -87 6h -4a 2w -i -s 39 -4j 6z -7o aa -ab d3 -d4 fw -fx ip -ir lj -ll od -og r8 -r9 u1 -u1 wt -wt zl -zl 12d -12d 155 -155 17x -17x 1ap -1ap 1dh -1dh 1g9 -1g8 1j0 -1j4 1lw -1lz 1or -1os 1rk -1rl 1ud -1ue 1x6 -1x7 1zz -200 22s -22t 25l -25m 28e -28f 2b7 -2b8 2e0 -2e1 2gt -2gu 2jm -2jn 2mf -2mg 2p8 -2pa 2s2 -2s3 2uv -2uw 2xo -2xq 30i -30h 339 -33a 362 -363 38v -38w 3bo -3bn 3ef -3ee 3h6 -3h5 3jw -3jv 3mn -3mm 3pe -3pd 3s5 -3s4 3uw -3uw 3xo -3xo 40g -40g 438 -438 460 -460 48s -48t 4bl -4bm 4ee -4ef 4h7 -4h8 4k0 -4k1 4mt -4mu 4pm -4pn 4sf -4sg 4v8 -4v9 4y1 -4y2 50u -50v 53n -53n 56f -56g 598 -599 5c1 -5c2 5eu -5ev 5hn -5ho 5kg -5kh 5n9 -5na 5q2 -5q3 5sv -5sv 5vn -5vo 5yg -5yh 619 -61a 642 -642 66u -66v 69n -69m 6ce -6ce 6f6 -6f7 6hz -6i0 6ks -6kt 6nl -6nl 6qd -6qe 6t6 -6t7 6vz -6w0 6ys -6ys 71k -70w 73k -72p 75c -72w 73c -70k 70j -6xr 6xr -6uz 6uz -6s7 6s6 -6pe 6pe -6mm 6mm -6ju 6jt -6h1 6h0 -6e8 6e6 -6be 6bb -68j 68h -65p 65n -62v 62s -600 5zy -5x6 5x3 -5ub 5u9 -5rh 5rf -5on 5ol -5lt 5lr -5iz 5ix -5g5 5g3 -5db 5d9 -5ah 5af -57r 580 -55p 57a -550 56k -54d 562 -542 560 -541 55z -53z 55x -53y 55v -545 56c -54q 56z -55i 57u -56o 597 -581 5ak -59g 5c0 -5aw 5df -5ct 5fj -5ey 5ho -5h8 5jy -5jo 5mg -5m7 5oy -5ov 5rn -5rn 5uf -5uf 5x7 -5xm 60b -62l 640 -66r 676 -69u 6ah -6cq 6ea -6fk 6i0 -6if 6l6 -6le 6o5 -6ob 6r3 -6r9 6u1 -6st 6va -6u1 6wi -6v8 6xp -6wn 6z7 -6yz 71r -71o 74g -74d 775 -77i 79x -7cm 7d9 -7fz 7gn -7jc 7jz -7mq 7mv -7pn 7pp -7sh 7sj -7vb 7vd -7y5 7y7 -80z 811 -83t 83v -86n 86p -89h 89k -8cc 8cf -8f7 8fb -8i3 8i6 -8ky 8l1 -8nt 8nx -8qp 8qs -8tk 8tn -8wf 8wj -8zb 8ze -926 929 -951 954 -97v 97w -9ao 9ao -9dg 9dg -9g8 9g7 -9iz 9iz -9lr 9lr -9oj 9oj -9rb 9ra -9u2 9u2 -9w8 9xa -9ym a11 -a2m a4p -a7g a7l -aad aai -ada adf -ag7 agc -aj4 aj9 -am0 ame -ap3 app -ase at1 -avr awe -az0 azw -b2d b3m -b63 b7c -b9h bb8 -bdc bf6 -bh9 bj2 -bl2 bmz -box bqx -bsu buu -bwk byq -c08 c2k -c3t c6b -c7i ca0 -cb7 cdp -cet chd -cic cky -clw coh -cpg cs2 -ct1 cvn -cwm cz7 -d06 d2s -d3r d6d -d7c d9x -daw ddi -deh dh3 -di2 dkn -dlt doc -dpl ds2 -dtg dvv -dxj dzq -e1n e3n -e5p e7l -e9n ebi -edk eff -ehh ejd -elg ena -epk er5 -etf ev0 -exl eym -f17 f25 -f4r f5q -f8d f97 -fbw fcl -ffa ffy -fin fjb -fm2 fml -fpb fpt -fsj ft1 -fvr fwa -fz1 fzj -g29 g2s -g5i g61 -g8s g99 -gc0 gce -gec gd7 -geh gc0 -gd9 gar -gby g9g -gao g86 -g9f g6y -g88 g5r -g71 g4k -g5u g3e -g4n g26 -g3g g0z -g29 fzs -g12 fyl -fzu fxd -fyn fw6 -fxg fuz -fw9 ftt -fv4 fsn -fty fri -fst fqd -fro fp8 -fqj fo2 -fpd fmx -fo8 fls -fn3 fkm -flx fjh -fks fic -fjm fh5 -fih fg1 -fhf ff1 -fgf fe0 -ffe fd0 -fee fbz -fdd fay -fcc f9y -fbc f8x -faa f7v -f99 f6v -f89 f5u -f78 f4t -f66 f3r -f55 f2r -f40 f1j -f2o f04 -f18 eyp -ezt ex9 -eyd evu -ewz euf -evj esz -eu3 erk -esp eq5 -er8 eop -epj emv -eno el1 -elv ej7 -ek1 ehe -ei7 efj -egd edq -eek ebw -ecq ea3 -eav e87 -e8z e6b -e73 e4f -e57 e2j -e3b e0n -e1f dyr -dzk dww -dxn duz -dvo dsz -dtp dr0 -drn doy -dpm dmx -dnj dku -dlf dip -dj9 dgj -dh4 dee -dey dc8 -dcp d9z -daf d7o -d84 d5d -d5s d32 -d3e d0m -d0x cy6 -cyi cvr -cw2 cta -ctl cqu -cr6 coe -cop cly -cma cjj -cjs ch0 -ch5 ced -cej cbs -cbx c95 -c9a c6i -c6o c3w -c41 c19 -c1f byn -byp bvx -bw1 bt9 -bt9 bqh -bqh bnq -bnp bkx -bkw bi4 -bi5 bfd -bfd bcl -bcl b9t -b9u b72 -b72 b4a -b4a b1i -b1j ayr -ayr avz -avz at7 -at8 aqg -aqg ano -ano akw -akv ai3 -ai2 afa -afa aci -ach a9p -a9p a6x -a6w a44 -a44 a1c -a1b 9yj -9yi 9vq -9vq 9sy -9sx 9q5 -9q5 9nd -9ng 9ko -9kt 9i1 -9i6 9fe -9fj 9cr -9cx 9a5 -9aa 97j -97o 94w -951 929 -92c 8zk -8zm 8wu -8wv 8u3 -8u5 8rd -8re 8om -8oo 8lw -8lx 8j5 -8j7 8gf -8gg 8do -8dq 8ay -8az 887 -889 85h -85k 82s -82w 804 -807 7xf -7xi 7uq -7uu 7s2 -7s6 7pe -7ph 7mq -7mu 7k2 -7k5 7hd -7hh 7ep -7es 7c0 -7c4 79c -79e 76m -76p 73x -741 719 -71c 6yk -6yo 6vw -6vz 6t7 -6ta 6qi -6qm 6nu -6nx 6l5 -6l8 6ih -6ij 6fr -6fs 6d0 -6d1 6a9 -6aa 67i -67j 64r -64s 620 -621 5z9 -5za 5wi -5wj 5tr -5tr 5qz -5r0 5o8 -5o9 5lh -5lh 5ip -5ip 5fx -5fx 5d5 -5d4 5ac -5ac 57k -57k 54s -54r 51z -51y 4z6 -4z6 4we -4wg 4to -4tq 4qy -4r1 4o9 -4nh 4l2 -4j2 4h4 -4f5 4d6 -4ba 49a -47d 45c -43d 41e -3zg 3xh -3vi 3tk -3rj 3pm -3nl 3lp -3jm 3hr -3fm 3dv -3bm 3a0 -37h 36c -33n 332 -30a 301 -2x9 2x5 -2ud 2ua -2ri 2rf -2on 2ok -2lt 2lr -2iz 2iz -2g7 2g8 -2dg 2dh -2ap 2ap -27x 27w -254 253 -22b 22a -1zi 1zi -1wq 1wp -1tx 1tv -1r3 1r1 -1o9 1o8 -1lg 1lf -1in 1im -1fu 1ft -1d1 1d0 -1a8 1a6 -17e 17d -14l 14k -11s 11r -yz yy -w6 w4 -tc tb -qj qk -ns nu -l2 l2 -ia ia -fi fj -cr cr -9z 9z -77 77 -4f 4g',
    height: '4w -3 -4 -5 -6 -6 -6 0 -1 0 -2 -1 -2 -2 -1 -2 0 -1 -4 -4 -4 -4 -3 -3 -4 -3 -3 -3 -3 -3 -3 0 0 0 -1 -1 0 -1 -1 -1 0 -1 -1 -1 -3 -3 -3 -2 -4 -4 -4 -4 -3 -4 -4 -4 -4 -1 -2 -1 -2 -1 -1 0 -1 -1 -1 0 -1 -1 -1 0 -1 1 3 2 2 3 2 2 2 1 2 1 2 1 0 -1 -1 -1 0 -2 -2 0 -1 -1 -1 0 0 0 0 0 0 0 0 3 4 3 3 3 1 1 1 1 0 1 1 1 -2 -1 -2 -1 -2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 1 1 1 0 1 1 1 1 2 1 1 1 1 0 1 1 1 0 1 1 0 0 0 0 0 -2 -3 -2 -2 -3 -2 -2 -2 -3 -2 -2 -1 -2 1 1 1 0 1 1 1 0 1 1 0 0 0 0 0 1 1 0 1 1 1 1 2 1 2 1 2 1 -3 -3 -3 -3 -3 -3 -4 -4 -4 -5 -5 -4 -5 -1 0 -1 -2 -1 -2 -1 -2 -1 0 -1 -1 -1 0 -1 -1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2 1 2 1 2 1 2 1 2 1 3 4 3 1 2 1 2 1 3 2 2 3 2 1 0 0 0 0 0 0 0 0 -1 -1 -1 0 -1 -1 0 0 0 2 3 2 2 3 2 2 2 0 0 0 0 0 -2 -2 -2 -3 7 7 7 7 9 8 8 7 8 8 7 8 8 -2 -1 -7 -6 -5 -4 -4 -4 -3 -4 -4 -4 -4 1 1 5 2 0 1 1 1 0 1 1 -2 -3 -7 -6 -7 -3 -4 -3 1 1 1 0 1 4 4 4 4 3 3 3 3 -1 4 4 4 4 3 0 0 0 1 1 1 0 1 -4 -3 -4 -1 -1 3 3 3 3 4 3 3 3 3 -1 -1 -4 -3 -4 -1 -1 -1 0 -1 -2 -3 -2 2 1 2 1 2 -2 -1 -1 -1 -1 1 1 1 0 1 5 5 6 5 5 5 5 4 5 4 5 d d 9 9 8 9 8 9 8 -2 -2 -3 -2 -b -b -a -b -b -c -d -c -c -2 -1 -2 -1 -2 -1 -2 -1 -2 0 0 0 0 0 0 2 1 2 1 2 1 2 1 2 1 0 1 1 -1 -1 0 -1 -1 -1 2 1 2 2 3 2 2 2 3 -1 -1 -1 0 -3 -3 -4 -3 -3 -3 -3 -3 -3 0 0 0 0 0 -1 -1 0 -1 -1 -1 0 -1 -1 -1 1 1 1 1 2 1 2 1 2 4 4 3 4 3 2 2 2 3 1 2 1 2 -1 -1 0 -1 -1 -1 0 -1 0 1 0 1 1 1 0 1 1 2 3 2 2 2 1 2 1 2 1 2 1 2 0 0 -1 -1 2 2 3 3 5 5 5 4 2 1 -1 0 0 -2 -2 -2 -3 -3 -4 -9 -8 -6 -5 -3 -3',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: 'el,0,2a,z,x,4l,6w ge,1,4e,1c,10,1m,4e ea,0,4i,e,21,28,d2 9j,0,34,2f,20,5g,ce au,1,2t,2k,49,9,bq en,0,4y,5n,2n,g,hc bc,1,2x,1u,2i,c,30 br,0,1v,d,17,9,c0 dl,1,u,g,r,6,8t cm,1,3x,2q,ax,a,44 bp,0,1f,c,c,2o,2t fq,1,4b,2w,30,u,f0 ft,1,56,l,u,3o,1z dt,0,28,15,3k,9,4h f,0,2e,e,t,9,d3 h3,1,1j,j,1e,q,4c 9,1,1k,12,d,41,fa 9,1,3j,v,e,41,6j go,1,4r,x,25,9,d2 3x,1,12,r,r,9,8r 9w,1,41,6q,6r,9,h9 8d,0,4i,14,3v,p,d3 a4,1,3a,9,a,9,h0 8y,0,2f,5s,4t,9,fh 75,1,4h,10,i,a,9e et,0,3u,5,9,m,d0 ev,0,3v,5,9,m,4a eu,0,3r,7,9,m,d0 e4,1,55,j,i,a,10 eq,0,1z,o,f,m,8n ds,1,2z,9,q,6,d6 d6,0,3h,1j,1h,2b,8p dh,0,3j,1t,36,2b,d2 db,0,2s,3,3,2e,4b dp,0,4b,c,p,6,4d d7,0,41,6,6,a,8r d7,0,41,b,b,6,7t d8,0,4p,d,d,a,6v d8,0,4p,8,8,d,8r cp,0,49,1q,3v,g,cu cp,0,5a,1p,2v,1s,cu bp,0,3z,q,p,9,gd d9,0,1e,r,1y,m,8q dc,0,24,38,4l,9,d2 cd,0,4c,29,3l,9,3v ca,0,3j,e,16,20,gu cd,0,49,g,1l,9,3u f9,1,2e,z,v,54,4f fh,0,3g,v,u,28,bv fc,0,4y,1i,2r,3e,g7 f6,0,3h,w,s,28,5k 4k,0,41,1i,2j,9,d5 4m,0,1j,l,v,9,2 b,1,1r,7,b,9,f9 b,1,3v,9,b,9,f8 47,1,2f,s,1r,9,0 9w,1,3l,d,d,9,cx 9w,1,4e,e,a,9,1t 9w,1,2g,i,d,9,6k 4x,1,4l,1i,1g,9,6s 4p,1,2p,1e,1f,9,aw 52,1,20,1i,1g,9,6s as,0,26,n,o,9,4e an,0,37,33,5a,9,34 cc,1,11,3,f,9,3t ao,1,1e,10,r,9,3a ao,1,1r,e,b,9,7g d0,1,x,9,9,9,79 c1,0,1k,1k,1r,9,8t 6x,1,2o,10,5k,9,85 74,1,40,10,j,a,2k 6w,1,4w,8,8,u,70 9i,1,48,7,8,9,68 9k,1,4z,b,d,9,6f 3o,1,1i,1e,1d,9,4c gs,1,1v,1l,1k,3k,8o df,0,59,3d,2j,6,4c c0,0,3z,k,x,g,7v c5,0,26,9,v,6,3m dp,1,1j,c,e,9,8u dp,1,2i,h,g,9,e7 dr,1,1l,4,3,2,2v ew,0,1h,c,b,1a,cc 8v,0,3c,a,b,9,bt 48,1,u,8,e,9,4g 45,1,v,7,j,9,4h f3,1,2j,2k,1f,9,60 5l,1,l,b,l,9,2 5d,1,l,b,w,9,8r 5b,1,2c,u,w,9,e1 5c,1,3o,c,13,9,4 56,1,55,10,s,9,ee 6c,1,53,d,v,9,0 62,1,2k,f,1g,9,8r 5g,1,3g,e,r,9,4g 5g,1,24,w,r,9,e4 69,1,31,c,15,9,d3 6d,1,2k,c,p,9,1 6d,1,3t,c,p,9,1 6c,1,37,8,a,9,cz 6h,1,32,c,17,9,df 6i,1,36,c,1a,9,63 6i,1,3b,d,y,9,ag 6i,1,4h,d,y,9,ag 6i,1,3o,9,b,9,5z 6k,1,4v,b,x,9,ex 3q,1,47,c,1a,a,8q 3z,1,47,d,1a,a,8q 3z,1,4z,c,q,a,8q 2g,1,2z,c,q,a,8v 2k,1,30,c,1a,a,1g 2i,1,4l,e,1a,a,dz 2g,1,4k,b,q,a,5 2g,1,3u,c,d,a,8v 46,1,49,b,r,a,8r 2e,1,3z,d,1a,a,co 2f,1,27,c,19,a,8t h,1,1k,9,8,9,4c cm,0,2h,e,e,9,1x cy,0,4o,x,5t,9,d0 cz,0,3d,6,6,9,hd dh,0,4t,a,i,9,d3 dg,0,4y,5,6,9,4b 8,1,2b,p,5,9,aw 3,1,3l,b,5,9,27 3,1,1b,4,9,9,d2 2,1,1v,7,h,9,4c cg,0,3o,b,7,9,86 3x,1,2g,s,s,9,8r 3t,1,16,8,d,9,8r 42,1,15,c,a,9,4g ff,1,3p,y,1l,54,d5 eq,0,1e,6,6,6,8n ea,0,2v,l,1x,9,d2 au,1,14,c,9,9,es al,1,y,11,q,9,1 ao,1,w,a,a,9,am b2,1,q,f,c,9,8u gv,1,43,h,18,9,8p h4,1,40,j,y,9,8r bo,0,22,8,8,9,c2 fb,1,4b,e,16,z,4d fa,1,51,f,1w,6,d4 f4,1,2n,6,7,9,s f2,1,3i,6,6,9,et f0,1,4c,6,6,9,ae e6,0,41,8,8,3,3d e4,0,1h,m,i,9,33 e0,0,1b,l,h,9,c2 e1,0,2w,4,k,9,45 cc,1,s,3,4,3,3t 9s,1,32,f,g,9,r 3,0,1c,m,g,9,d2 81,0,37,2g,2i,34,a6 dz,0,3w,a,c,9,8k 5z,0,1p,q,19,9,8p 3w,0,2l,v,1g,9,8r 7w,1,3z,7,d,9,8s 8c,1,47,34,3n,9,8w dg,1,3n,u,o,9,em 6d,0,2r,k,q,9,gh 1r,0,11,4o,1c,k,8p 1a,1,3r,3,8,9,6b x,1,4l,b,1x,19,al 25,1,4i,8,10,9,h8 25,1,3z,4,1f,9,8i 25,1,3b,6,17,9,h8 24,1,55,5,16,9,7j 23,1,4o,6,1c,9,6r 3n,1,t,6,8,9,he dz,0,2g,5,13,9,45 e0,0,24,b,1c,9,cv e6,0,29,5,1d,9,d0 e5,0,2p,6,u,9,d0 e4,0,2o,6,u,9,d0 e2,0,2o,6,u,9,45 e3,0,3y,b,i,a,8h fw,0,1s,18,11,a,fa 8n,1,o,e,t,9,4c dn,1,27,3,4,2,1 dm,1,2s,3,5,2,cp 4g,0,17,4,g,9,4f 4i,0,1h,b,f,9,d4 13,1,2g,16,1e,t,u x,1,36,5,9,3,68 12,1,3p,5,9,3,eq 2h,1,3h,5,8,9,9g 8,0,20,3,i,9,0 4,0,20,3,h,9,0 fk,1,14,3,3,6,cx fr,1,1f,3,3,6,75 fp,1,22,17,13,9,aj g2,1,e,3,3,9,ca fp,1,4c,12,1d,9,4y fp,1,3g,s,u,9,68 45,1,i,8,9,9,ay eo,0,1h,3,6,9,8m eo,0,1f,4,6,9,d0 ep,0,1f,3,6,9,49 eq,0,1g,3,6,9,4a 49,1,x,9,5,9,4h 48,1,h,7,5,9,3 by,1,2b,g,1m,9,ca',
    boats: 'ar,1,u,u,7 at,1,r,i,4h at,1,18,g,93',
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
    // And the one number about its height. Marina Bay is a few metres above the
    // sea except where it climbs onto the Anderson Bridge; the terrain service
    // returns a range of thirty-odd metres, because in a city this dense it is
    // looking at roofs. Three tenths of it, which leaves about ten - the shape of
    // the profile is still the map's, only the size of it is ours.
    //
    // It was twelve per cent, set when the lap here was three quarters guesswork
    // and came back with sixty-six metres of range and a peak of a hundred and
    // nine. Read off the circuit relation instead, the same service returns a
    // third of that, and twelve per cent of it was a billiard table.
    flatten: 0.3,
    metres: 4928,
    line: '-4qa 4qd -4nz 4mk -4k6 4ir -4ge 4ey -4cj 4b6 -48r 47e -44z 43m -416 3zt -3xe 3w1 -3tm 3s9 -3pv 3oh -3m2 3ko -3ia 3gv -3eg 3d2 -3ao 39a -36v 35h -332 31p -2zb 2xw -2vi 2u4 -2rp 2qb -2nv 2mk -2jy 2iz -2ge 2ff -2cs 2bv -296 28n -25w 25f -22o 22a -1zj 1za -1wi 1w8 -1tg 1ta -1qj 1qd -1nl 1nf -1kn 1kh -1hp 1hk -1es 1em -1bv 1bo -18w 18q -15y 15s -130 12u -102 zw -x5 wz -u7 tz -r8 qw -o5 nt -l1 kp -hy hn -ew eo -bw by -96 99 -6h 6j -3r 3s -10 11 1r -1r 4j -4i 7a -79 a1 -a8 cz -dc g3 -gg j7 -jj ma -mm pe -po sf -sq vh -vr yi -yg 115 -10g 133 -12a 14u -13q 163 -14o 16v -156 16x -14s 163 -13n 14c -11o 11t -z1 yy -w6 vy -t7 t0 -q8 pt -n2 mm -jw jg -gp g9 -di d2 -ac 9q -70 69 -3l 2q -3 -r 3e -4c 6y -7x aj -bh e3 -f2 ho -im l8 -m7 os -pv sf -tk w3 -x8 zs -10p 13b -141 16p -176 19x -1a5 1cw -1d0 1fs -1fl 1id -1i5 1kw -1kp 1nh -1n9 1q1 -1pu 1sl -1s6 1uw -1tp 1w7 -1um 1wx -1v3 1x5 -1ut 1w8 -1ti 1tv -1r5 1qp -1o7 1n1 -1l8 1j4 -1hv 1fe -1e0 1bm -1am 183 -161 148 -11w 10d -xz wl -u0 t1 -qb pr -n1 mf -ju iw -gq f1 -df b7 -ah 7t -7f 4o -49 1i -14 -1n 21 -4s 56 -7x 8b -b2 bd -e4 ee -h6 hd -k4 k9 -n1 ne -q5 qi -t9 tm -wd wr -zi zv -12m 12z -15r 164 -18v 199 -1c0 1cd -1f4 1fh -1i8 1il -1lc 1lq -1oh 1ou -1rl 1ry -1up 1v2 -1xt 1y7 -20y 21b -242 24f -276 27j -2ab 2ap -2dg 2dt -2gk 2gx -2jo 2k1 -2ms 2n6 -2px 2qa -2t1 2te -2w5 2wi -2z9 2zn -32e 32r -35i 35v -38m 390 -3bs 3c5 -3ew 3f9 -3i0 3id -3l4 3li -3o9 3om -3rd 3rq -3uh 3uu -3xl 3xy -40p 40v -43n 43c -463 45i -488 474 -49n 487 -4ak 493 -4bg 49z -4cc 4av -4d7 4bq -4e3 4cj -4eu 4cv -4er 4c6 -4d4 4ac -4aj 47r -47u 452 -455 42d -42h 3zp -3zs 3x1 -3x4 3uc -3uh 3rp -3rv 3p3 -3p9 3mh -3mo 3jx -3k3 3hb -3h7 3ef -3e4 3bd -3b3 38c -382 35a -350 329 -31z 2z7 -2yx 2w6 -2vw 2t4 -2st 2q2 -2ps 2n1 -2mq 2jy -2jn 2gw -2gl 2dt -2di 2at -2a9 27r -26m 24j -22q 21c -1yz 1y4 -1vh 1v6 -1sg 1sf -1pn 1pn -1mv 1lv -1jb 1h5 -1fh 1cx -1bu 194 -18o 15w -15q 12y -12s 101 -zw x4 -wz u7 -u2 ra -r4 oc -o7 lf -la ij -id fl -fg co -cj 9r -9l 6t -6n 3w -3r z -t -1z 25 -4x 52 -7u 7z -ar aw -dn dr -gj go -jg jm -me mj -pb pg -s8 se -v5 va -y2 y7 -10z 115 -13x 142 -16u 16z -19q 19v -1cn 1ct -1fl 1fq -1ii 1in -1lf 1ll -1od 1oi -1r9 1re -1u6 1uc -1x4 1x9 -201 206 -22y 234 -25v 260 -28s 295 -2bv 2c9 -2ez 2fi -2i7 2iz -2lm 2mg -2oy 2q4 -2sk 2tx -2w8 2xr -2zu 31o -33p 35k -37l 39h -3bm 3df -3fj 3hc -3jf 3l8 -3nc 3p5 -3r9 3t3 -3v7 3x0 -3z3 40w -430 44t -46x 48r -4av 4co -4es 4gl -4io 4kh -4ml 4oe -4qi 4sc -4ug 4w9 -4yc 505 -529 542 -567 57z -5a4 5bw -5dr 5eq -5fn 5d1 -5dy 5bb -5c9 59n -5al 57z -58w 56a -576 54j -55g 52u -53r 514 -521 4zf -50c 4xq -4yn 4w0 -4wy 4ud -4vc 4sq -4to 4r2 -4s1 4pf -4qd 4nr -4op 4m3 -4n2 4kg -4le 4it -4jr 4h5 -4i4 4fi -4gg 4du -4et 4c7 -4d5 4aj -4b5 48g -48y 468 -46r 440 -44i 41s -42b 3zl -404 3xe -3xw 3v6 -3vp 3sy -3th 3qr -3r9 3oj -3p2 3mc -3mu 3k3 -3km 3hw -3if 3fp -3g7 3dh -3e0 3ba -3bt 392 -39k 36u -37d 34n -355 32f -32y 308 -30r 2y0 -2yi 2vs -2wb 2tl -2u4 2re -2rw 2p6 -2pp 2my -2ng 2kq -2l9 2ij -2j2 2gc -2ic 2gt -2j0 2jr -2ld 2nn -2p9 2ri -2t2 2vc -2x0 2z9 -310 335 -34l 36y -38r 3av -3d1 3er -3gw 3in -3kt 3mj -3op 3qg -3sm 3ud -3wj 3y9 -40e 426 -445 463 -482 4a1 -4c2 4dz -4fw 4hv -4jm 4lr -4mn 4p9 -4q0 4so -4tg 4w4 -4w4 4yw -4yo 51f -511 53i -55d 579 -594 5b6 -5dc 5f2 -5h6 5iz -5l5 5mw -5p7 5qr -5t1 5ul -5wv 5yh -60p 62c -64l 669 -68h 6a4 -6cb 6e0 -6g8 6hw -6iw 6l3 -6k1 6ml -6la 6nq -6me 6ou -6ni 6py -6ol 6r0 -6pn 6s2 -6qq 6t6 -6rt 6u8 -6sw 6vc -6tz 6we -6v2 6xh -6w4 6yk -6x7 6zm -6ya 70p -6zc 71s -70g 72v -71i 73x -72l 751 -73o 763 -74q 776 -75t 788 -76v 79a -77y 7ad -790 7bf -7a3 7cj -7b7 7dm -7ca 7eq -7dd 7fs -7ef 7gu -7fg 7hw -7gj 7iy -7hl 7k0 -7in 7l2 -7jp 7m4 -7kr 7n6 -7lu 7o9 -7mx 7pd -7o1 7qh -7p5 7rk -7q8 7so -7rc 7ts -7rz 7u1 -7ry 7tt -7rk 7t5 -7qo 7rw -7p7 7pu -7ng 7mc -7k0 7ih -7g5 7en -7cb 7as -78q 76w -74y 72z -710 6z1 -6x3 6v4 -6t5 6r6 -6p8 6n9 -6lc 6jc -6hg 6fe -6di 6bi -69j 67k -65l 63n -61o 5zq -5xr 5vs -5tu 5rv -5px 5ny -5mp 5ok -5nf 5py -5oo 5r5 -5pu 5sa -5r0 5th -5s6 5um -5tc 5vt -5ui 5wy -5vo 5y5 -5wu 5za -5xz 60f -5z2 61h -604 62j -613 63h -621 64e -62x 65a -63t 666 -64q 673 -65n 681 -66m 68z -67j 69x -68i 6aw -68k 67g -651 63n -618 5zv -5xg 5w3 -5to 5sb -5pw 5oj -5m4 5kr -5ic 5gz -5ek 5d7 -5at 59e -56z 55k -536 51s -4ze 4xz -4vl 4u6',
    height: '4f -1 3 4 5 7 9 b b c c a a 7 6 3 0 -3 -4 -7 -a -a -8 -6 -4 -3 -2 -3 -1 -1 -1 0 0 0 3 4 5 7 8 b d d d c c b a 7 3 0 -5 -7 -9 -c -e -f -h -g -f -e -b -7 -7 -3 -1 0 2 6 7 9 a a 9 5 2 -1 -2 -3 -3 -3 -3 -1 0 0 3 2 2 2 1 0 -1 -2 -3 -5 -5 -5 -5 -6 -5 -3 -3 -3 0 1 2 3 4 4 4 5 4 6 7 6 6 5 4 2 0 -6 -9 -c -g -h -k -j -i -g -e -a -8 -4 2 6 8 9 b 9 7 4 3 1 -1 -3 -6 -8 -a -a -a -a -6 -2 0 -2 -3 -5 -5 -3 -3 -1 0 0 4 2 2 2 3 4 4 2 0 -1 -2 -2 -3 -5 -6 -8 -7 -7 -6 -5 -2 -1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2 4 6 7 7 9 9 a b c e f h g f d e f e f e d 9 5 3 0 -1 0 1 3 4 2 3 0 -2 -3 -2 -3 -2 -3 -5 -8 -b -a -a -a -9 -8 -7 -6 -6 -5 -5 -4 -4 -6 -a -d -f -e -c -a -9 -7 -4 -4 -3 -2 0 3 4 3 5 5 5 4 3 1 1 0 0 1 1 3 8 a d e g g g g f e 9 5 -1 -6 -b -e -j -i -j -h -j -i -i -e -b -6 -4 -2 2 4 3 3 2 2 1 1 1 0 -1 -2 -1 -2 -2 -2 -2 -1 0 0 2 1 3 1 2 1 0 0 -1 -1 -1 1 2 3 5 6 6 5 2 1 0 -1 -2 -5 -8 -c -d -g -i -g -b -6 -3 -2 2 6 a e j l o q o m g c a 6 1 -2 -6 -7 -a -a -a -9 -8 -6 -2 -1 0 1 4 5 7 8 7 7 6 6 5 5 5 4 3 1 0 -1 -3 -4 -4 -6 -6 -7 -7 -8 -6 -6 -3 0 0 1 2 4 4 7 8 9 c d e e c c a 6 2 -1 -3 1 1 1 -3 -7 -9 -a -d -b -6 2 8 d e e c e e d d a 7 3 -3 -6 -a -f -g -h -h -g -g -e -9 -5 -3 0 -1 -2 -4 -3 -5 -5 -3 -1 0 -3 -2 -4 -6 -5 -5 -4',
    tunnel: '0000000000000111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '6i,1,2r,1h,1a,g,1b m,1,2y,1h,1e,9,4w d1,1,1r,1v,25,14,hd d,0,59,y,1k,o,7e 13,0,3w,u,x,67,16 4f,1,k,1s,5k,f,8r 5d,1,24,1m,1y,9,ap 7o,0,2k,2f,2s,d,64 i,0,25,1q,1n,9,d5 7k,0,3u,o,q,g,he 86,1,h,9,5,5,8u 8c,0,n,9,c,5,6u de,1,u,c,7,1,4h 7e,0,t,k,n,6,45 64,1,3n,2h,2o,a,c8 17,0,x,e,9,3,f6 7g,0,z,6,i,3,cj 5f,1,1x,2f,p,9,72 8s,0,2j,1f,1d,z,bg 7v,0,1k,1f,1e,z,19 9,1,1c,7j,51,9,8r 7i,0,21,y,1c,a,c1 da,0,3m,v,m,6,4p da,0,4q,y,n,6,4m dm,0,3c,37,33,9,4c m,0,2j,36,2d,6,gn 2z,0,2b,i,k,g,eb 2x,0,z,8,9,g,fk da,0,3e,1w,1d,9,da 33,0,38,8,a,g,ar 4j,1,29,b,s,4,4v 4g,1,1j,9,j,4,1 1d,0,33,a,17,3,ct 2m,0,48,4,10,3,9f 2o,0,4i,i,7,3,6m 2q,0,4b,d,p,3,gn 1b,0,4a,3,7,3,4g dj,1,2i,b,8,9,hb 5m,0,g,3,3,9,8i 1r,1,3e,19,1e,f,bj 7e,0,1x,o,1h,9,h8 5,1,2z,2t,1q,9,3 d6,0,l,a,8,1,8r u,0,3t,41,3h,1b,4b 6p,0,2r,3d,50,9,1',
    boats: '7h,0,3s,u,gq 5x,0,88,x,bz 5x,0,7v,g,gd 5x,0,81,r,3a 5n,0,v,z,cy 5l,0,n,i,8l',
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
    metres: 5443,
    line: '-cr5 110j -10xr 10y1 -10vl 10wq -10ue 10vw -10tk 10v3 -10sr 10u9 -10rl 10sc -10pl 10pz -10n8 10nm -10kv 10l9 -10ii 10iw -10g5 10gj -10ds 10e5 -10bd 10bm -108u 108y -1066 1069 -103i 103d -100u zzu -zy3 zvz -zv4 zsi -zs0 zp9 -zoq zm0 -zli zis -zia zfj -zf0 zca -zbs z92 -z8k z5t -z5b z2l -z22 yzb -yyt yw3 -yvl ysv -ysc ypl -yp3 ymd -ylv yj5 -yim yfv -yfd ycn -yc5 y9f -y8w y65 -y5n y2x -y2f xzo -xz5 xwf -xvx xt7 -xsp xpy -xpf xmp -xm7 xjh -xiz xg8 -xfq xd0 -xdz xbe -xd3 xax -xdd xc4 -xeu xeb -xh1 xgi -xj8 xiq -xlh xky -xno xn5 -xpv xpc -xs2 xrj -xua xts -xwi xvz -xyp xy6 -y0x y0e -y34 y2m -y5c y4t -y7j y70 -y9r y98 -yby ybg -ye7 ydq -ygg yfy -yip yi8 -yky ykg -yn7 ymq -ypg yoy -yrp yr8 -yty ytg -yw7 yvq -yyg yxz -z0q z08 -z2y z2h -z58 z4q -z7g z6z -z9q z98 -zby zbh -ze8 zdq -zgg zfz -ziq zi8 -zky zkh -zn8 zmq -zph zp0 -zrq zr9 -zu0 ztj -zw9 zvt -zyk zy3 -100u 100e -1035 102o -105e 104y -107p 1078 -109z 109i -10c8 10bs -10ej 10e2 -10gt 10gd -10j3 10im -10ld 10kx -10no 10n9 -10q0 10pl -10sc 10rx -10uo 10u9 -10wy 10wd -10z3 10yf -1114 110g -1135 112h -114q 113c -114b 111r -111w 10z4 -10z8 10wg -10wl 10tt -10uy 10sh -10uv 10tj -10wa 10w3 -10yv 10yp -111h 111c -1144 113y -116q 116k -119b 119j -11c8 11ct -11fi 11g8 -11iw 11jo -11ma 11n9 -11pu 11qu -11tc 11uj -11x1 11y9 -120n 1223 -124h 125w -127t 129q -12b7 12dj -12f1 12he -12iv 12l7 -12mp 12p2 -12qk 12sw -12ud 12wq -12y8 130k -1321 134e -135w 1388 -139q 13c3 -13dk 13fw -13he 13jr -13l8 13nk -13p2 13rf -13sx 13v9 -13wq 13z3 -140l 142x -144f 146s -1489 14al -14c3 14eg -14fx 14i9 -14jr 14m4 -14nm 14py -14rf 14tr -14v9 14xm -14z3 151f -152x 155a -156s 1594 -15al 15cy -15eg 15gs -15i9 15km -15m4 15og -15py 15sb -15ts 15w4 -15xm 15zz -161h 163t -165a 167n -1695 16bh -16cz 16fb -16gt 16j6 -16ko 16n0 -16oe 16qs -16s1 16uj -16vr 16y8 -16zg 171y -1737 175p -176y 179f -17ak 17d3 -17e2 17go -17hn 17k9 -17l9 17nu -17op 17rc -17s1 17uq -17vg 17y4 -17yz 181n -182h 1854 -185o 188e -188y 18bo -18c8 18ey -18fi 18i8 -18is 18li -18lu 18om -18oy 18rp -18rw 18uo -18us 18xk -18xl 190d -190d 1935 -1934 195w -195q 198i -198a 19b1 -19am 19dd -19cy 19fp -19f3 19ht -19h7 19jw -19j7 19lw -19l4 19ns -19mx 19pk -19oo 19rb -19qb 19sw -19rt 19ue -19t9 19vs -19un 19x6 -19vt 19y8 -19wt 19z7 -19yd 1a0z -1a21 1a4j -1a5x 1a8c -1a93 1abp -1abi 1ae9 -1ad3 1afl -1adk 1aff -1ad2 1aei -1ado 1ag1 -1agv 1aji -1ake 1an1 -1anx 1aqk -1arg 1au3 -1auz 1axm -1ayi 1b14 -1b20 1b4n -1b5w 1b8c -1b9v 1bc7 -1bdr 1bg2 -1bht 1bjz -1blr 1bnv -1bpo 1brt -1btk 1bvp -1bxg 1bzm -1c1b 1c3i -1c4f 1c71 -1c7t 1cah -1cb9 1cdx -1cep 1chd -1ci5 1ckt -1clj 1co8 -1cou 1crk -1cs6 1cuv -1cvg 1cy6 -1cys 1d1i -1d24 1d4t -1d5f 1d85 -1d92 1dbo -1ddc 1dfk -1dh1 1dje -1dji 1dm7 -1dkk 1dmq -1dki 1dm7 -1dk1 1dlr -1djk 1dla -1djb 1dl8 -1dk9 1dmu -1dmj 1dpa -1dpe 1ds6 -1dsq 1dvg -1dwh 1dz1 -1e0e 1e2u -1e47 1e6m -1e7y 1ead -1ebq 1ee6 -1efi 1ehx -1ej9 1elp -1emn 1ep9 -1epk 1esc -1ese 1ev6 -1ev6 1exy -1exy 1f0q -1f0q 1f3i -1f3i 1f6a -1f6b 1f93 -1f93 1fbv -1fbv 1fen -1fen 1fhf -1fhf 1fk7 -1fk8 1fn0 -1fn0 1fps -1fps 1fsk -1fsb 1fv2 -1fuf 1fx5 -1fw3 1fyn -1fwp 1fyo -1fwi 1fy9 -1fw0 1fxn -1fvc 1fww -1ful 1fw5 -1ftu 1fve -1ft4 1fup -1fso 1fuk -1fsr 1fuu -1fte 1fvr -1fuq 1fxb -1fwr 1fzh -1fzj 1g2a -1g2o 1g5f -1g65 1g8t -1g9m 1gca -1gdb 1gfw -1ggx 1gji -1gkj 1gn4 -1go5 1gqq -1grr 1guc -1gvc 1gxx -1gyy 1h1j -1h2k 1h55 -1h66 1h8r -1h9s 1hcd -1hda 1hfw -1hgi 1hj8 -1hjf 1hm6 -1hm0 1hos -1ho6 1hqv -1hq5 1hsu -1hrs 1huc -1ht4 1hvm -1hu7 1hwl -1hus 1hww -1hux 1hwu -1huo 1hwf -1hu3 1hvk -1ht2 1hua -1hro 1hsl -1hpy 1hqt -1ho2 1hok -1hlt 1hm8 -1hjg 1hji -1hgq 1hgo -1hdy 1hdg -1haq 1ha5 -1h7i 1h6p -1h42 1h37 -1h0r 1gzf -1gwz 1gvn -1gtj 1grq -1gpo 1gnt -1gly 1gjw -1gi2 1gfz -1geb 1gc3 -1gan 1g89 -1g71 1g4k -1g3p 1g12 -1g0d 1fxo -1fxc 1ful -1fuc 1frk -1frk 1fos -1fov 1fm3 -1fme 1fjn -1fjy 1fh7 -1fhu 1ff4 -1ffr 1fd2 -1fe0 1fbe -1fce 1f9t -1fb4 1f8n -1fa1 1f7n -1f96 1f6u -1f8d 1f61 -1f7j 1f57 -1f6q 1f4f -1f5y 1f3m -1f56 1f2v -1f4k 1f2d -1f41 1f1t -1f3i 1f1a -1f2z 1f0s -1f2g 1f08 -1f1x 1ezq -1f1f 1ez7 -1f0v 1eyo -1f0d 1ey5 -1ezs 1exk -1ez8 1ewz -1eym 1ewd -1ey0 1evs -1exf 1ev6 -1ewt 1euk -1ew8 1eu0 -1evn 1ete -1ev1 1ess -1eud 1es3 -1etn 1erc -1esw 1eql -1es4 1ept -1erd 1ep2 -1eqi 1eo5 -1ep4 1emi -1emo 1ejx -1eit 1ega -1eeh 1ece -1ea7 1e8i -1e6a 1e4l -1e2e 1e0p -1dyh 1dwt -1dul 1dsx -1dqp 1dp1 -1dmt 1dl5 -1dix 1dh9 -1df1 1ddc -1db4 1d9g -1d78 1d5k -1d3c 1d1o -1czi 1cxs -1cvn 1ctu -1crx 1cpx -1cob 1cm2 -1ckq 1cib -1chb 1cep -1ce8 1cbi -1cb4 1c8d -1c8a 1c5i -1c5e 1c2m -1c2i 1bzq -1bzn 1bwv -1bwr 1btz -1btv 1br3 -1bqz 1bo7 -1bo4 1blc -1bl8 1big -1bic 1bfk -1bfd 1bcl -1bcd 1b9m -1b97 1b6g -1b5u 1b34 -1b25 1azl -1ayc 1avu -1aud 1as0 -1aqd 1ao5 -1am9 1ak7 -1ai9 1aga -1ae8 1acd -1aa7 1a8h -1a69 1a4k -1a27 1a0r -19ya 19x0 -19uf 19tf -19qr 19q1 -19na 19mu -19k3 19jr -19gz 19gp -19dy 19dr -19az 19ay -1985 1984 -195c 195b -192j 192i -18zq 18zp -18wx 18ww -18u4 18u4 -18rc 18rg -18op 18p1 -18mc 18mz -18kd 18lb -18is 18jx -18hg 18iq -18ge 18hv -18fi 18gz -18eg 18fk -18cz 18c9 -18ab 188d -186z 184l -183d 180v -17zp 17x7 -17w1 17ti -17sc 17pt -17om 17m3 -17k7 17i7 -17g8 17ea -17ce 17ad -178x 176j -1753 172q -1719 16yw -16xj 16v4 -16tu 16rd -16q4 16nn -16mg 16jx -16iv 16gb -16f4 16cm -16ba 168v -166t 164x -162r 1612 -15yp 15x7 -15uo 15tm -15qy 15q4 -15nd 15n0 -15k9 15k0 -15h8 15gz -15e7 15eb -15bj 15bm -158u 1592 -156b 156k -153s 153z -1517 1518 -14yg 14yh -14vp 14vs -14t0 14sz -14q7 14q0 -14n9 14mv -14k5 14jk -14gw 14g5 -14dl 14cj -14a8 148q -146s 144t -1430 140v -13za 13x0 -13vo 13t9 -13s4 13pk -13oi 13ly -13kv 13ib -13hv 13f4 -13en 13bw -13bf 138p -1389 135i -1351 132a -131t 12z3 -12yn 12vw -12vf 12so -12s7 12ph -12p1 12ma -12lt 12j2 -12im 12fw -12ff 12co -12c7 129g -1290 126a -125t 1232 -122l 11zu -11ze 11wo -11w7 11tg -11sz 11q8 -11ps 11n2 -11ml 11ju -11jd 11gm -11g6 11dg -11cz 11a8 -119q 1170 -116i 113r',
    height: '2k -7 -6 -6 -6 -8 -7 -d -c -c -8 -2 -1 -4 3 3 3 3 5 5 4 5 4 5 7 7 9 2 3 2 2 3 2 -2 -1 -2 -1 -4 -4 -4 -4 -3 -4 -5 -5 -4 -1 2 3 2 2 3 2 2 2 1 3 2 2 3 -1 2 2 3 2 2 3 3 6 6 6 6 6 7 3 4 3 4 4 4 4 1 0 0 0 0 0 0 0 -1 -4 -4 -4 -4 -3 -9 -8 -5 -5 -6 -5 -6 -5 -2 -4 -4 -4 -4 1 1 -2 -1 -2 -1 -2 -1 0 0 1 1 1 1 0 -2 -2 -3 -2 -2 -3 -3 -3 1 2 1 -3 -3 0 0 0 0 0 0 5 6 1 0 1 -1 0 -1 -1 -1 -1 6 5 0 0 0 0 0 6 0 -1 -1 7 7 1 0 1 1 1 1 0 1 9 5 5 -4 -3 -3 -3 -3 -3 -3 1 1 0 0 3 4 4 4 4 5 6 5 5 2 1 2 1 2 2 2 2 2 1 1 1 1 2 1 2 5 6 5 5 4 5 5 4 5 4 3 1 1 -3 1 2 2 1 2 1 2 1 3 2 5 6 5 1 1 4 5 4 5 5 4 4 4 4 4 3 4 4 -3 -7 -7 -7 -7 -7 -6 -7 0 0 0 -3 -2 1 4 5 5 4 5 4 3 -5 -4 -5 -2 -3 -2 -2 -3 -2 -5 -4 -5 -5 -6 -5 -5 -6 -5 -5 -6 -5 -6 -3 -4 -4 -1 -1 0 -1 -1 -1 -2 -2 -3 -2 -2 -1 -2 -1 -2 -1 -3 -2 -2 -1 -1 0 -1 -1 -1 -1 -2 -1 -2 -1 0 -1 -4 -4 -4 -4 -3 -4 -3 -3 -6 -5 -6 0 -1 2 2 3 2 2 3 2 2 6 7 6 1 2 2 2 3 2 2 2 1 2 0 0 0 0 2 0 1 1 1 0 2 1 2 2 1 2 4 3 3 3 4 4 4 4 4 4 3 4 4 -1 -2 -2 -1 -2 -1 -2 -1 -4 -4 -4 -4 -3 -2 -2 -1 -2 0 -1 -1 -1 2 1 2 1 2 5 6 5 6 3 4 4 4 4 1 6 5 5 2 2 1 2 1 -1 -2 -1 -2 1 -3 -3 -b -b -b -a -b -b -8 -a -a -a -a -a -a -2 -2 -3 -2 -2 -3 -2 0 0 0 6 6 7 6 6 6 7 7 7 7 7 4 5 -2 -1 -2 -3 -3 -3 -4 -4 -3 -4 -6 -4 -4 -4 -4 -4 -2 -5 -4 -5 -4 -5 -5 -2 -2 -3 -2 5 6 5 8 2 3 2 2 2 6 5 6 5 -2 -3 -2 -2 3 3 3 3 3 0 0 0 0 0 0 5 4 5 0 -6 -6',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111000000000000000000000000000000000000000000000000000000000',
    buildings: '2q,1,26,1f,1r,9,8q 8,1,2s,2s,2k,9,he 25,1,4q,26,34,9,8r ei,1,2p,3r,2p,9,0 2q,1,4q,2j,38,9,8q dn,1,23,1t,29,9,7v 0,1,39,27,2o,9,8j es,1,3a,2j,33,9,d3 25,1,26,1l,1r,9,8r 12,1,2l,2i,2e,9,4f 4u,0,54,r,10,9,cq 4d,1,21,s,y,9,12 1c,0,4b,n,n,9,5n 3o,0,14,x,m,9,0 37,0,53,11,18,9,w 6n,1,1q,8,7,9,7n 6r,1,21,6,d,9,dw 6s,1,1e,8,9,9,9i 6s,1,14,a,b,9,r 8t,0,4l,5,5,9,y 3r,1,1c,1a,1c,9,13 4a,1,3q,1u,4g,9,13 3z,0,1g,6,5,9,4a 3x,0,1f,d,9,9,8r 4e,1,x,13,w,9,8r 1o,0,4e,7,7,3,8s 3z,0,12,e,9,9,8q 8u,0,4f,5,6,9,9d 6u,0,1f,n,u,9,hc 6q,0,26,b,b,9,f4 6s,0,2q,c,b,9,fb 6u,0,37,b,9,9,6e 83,0,37,7,1c,9,fa 8t,0,3u,d,l,9,9n 81,0,3e,6,7,9,eu 81,0,3r,9,7,9,ge 82,0,3d,6,6,9,7n 83,0,3k,6,6,9,6k 83,0,3q,6,6,9,2c 83,0,3x,6,6,9,b0 83,0,45,5,6,9,ax 80,0,3w,6,6,9,h8 7y,0,3v,6,o,9,8q 7s,0,3l,8,8,9,e1 7v,0,3z,7,9,9,e0 7t,0,3k,8,7,9,z 7u,0,3f,f,i,9,x 7m,0,3f,1b,l,9,g2 8s,0,4r,6,6,9,e6 84,0,4s,6,6,9,am 83,0,4e,6,8,9,b1 83,0,4j,5,7,9,29 83,0,4l,7,9,9,fb 6y,0,1g,6,6,9,h8 6z,0,1h,5,b,9,19 6z,0,1m,8,a,9,9y 6z,0,1v,5,5,9,fr 75,0,2d,h,b,9,50 6z,0,3c,a,7,9,2t 6y,0,3x,c,7,9,2s 74,0,2s,b,6,9,27 74,0,22,e,7,9,28 74,0,1g,8,7,9,71 7v,0,53,d,f,9,e0 7x,0,58,6,9,9,d7 7x,0,4p,c,c,9,8q 7z,0,4o,5,8,9,d7 80,0,57,4,8,9,47 80,0,58,4,7,9,cu 80,0,4m,5,7,9,cu 81,0,4r,3,a,9,3q 80,0,54,4,4,9,47 80,0,4o,6,8,9,47 7r,0,3q,7,9,9,dy 7q,0,3u,7,8,9,dz 7p,0,3v,9,9,9,e1 7p,0,3z,7,8,9,e1 7o,0,42,7,7,9,e5 7o,0,48,6,6,9,5j 7m,0,49,a,8,9,g1 7m,0,43,9,6,9,7b 7l,0,3y,8,6,9,3o 75,0,3m,7,7,9,9g 7l,0,3v,9,6,9,gq 75,0,4i,8,6,9,57 75,0,4l,4,7,9,b8 7l,0,4t,4,8,9,5d 75,0,58,j,8,9,dv 75,0,59,4,7,9,2k 83,0,5a,4,a,9,29 8u,0,57,8,7,9,ds 8u,0,53,8,6,9,ds 8v,0,4o,9,8,9,ek 8v,0,51,7,8,9,4x 81,0,4v,6,7,9,ce',
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
    metres: 6003,
    line: '1mu -9i3 9fj -9gn 9e3 -9f7 9cn -9dr 9b8 -9cc 99s -9av 98b -99f 96v -97z 95g -96k 940 -954 92k -93n 913 -927 8zn -90r 8y8 -8zc 8ws -8xw 8vc -8wg 8tw -8uz 8sf -8tj 8qz -8s3 8pj -8qm 8o2 -8p5 8ml -8no 8l4 -8m7 8jn -8kr 8i7 -8ja 8gq -8ht 8f9 -8gc 8ds -8ev 8cb -8df 8av -8by 89e -8ah 87x -890 86g -87k 850 -863 83j -84m 822 -835 80l -81o 7z4 -808 7xo -7yr 7w7 -7xa 7uq -7vt 7t8 -7ub 7rr -7sv 7qc -7rg 7ox -7q3 7nk -7op 7m6 -7nc 7kt -7ly 7jf -7kl 7i2 -7j7 7go -7hu 7fb -7gg 7dx -7f4 7co -7dy 7bk -7cz 7am -7c4 79u -7bf 795 -7ar 78j -7a6 77z -79o 77h -797 770 -78p 76i -787 760 -77q 75j -778 751 -76r 74k -769 742 -75r 73k -75a 733 -74s 72l -74a 723 -73t 71m -73b 714 -72u 70n -72c 705 -71u 6zn -71d 6z6 -70v 6yo -70d 6y6 -6zw 6xp -6ze 6x7 -6yx 6wp -6yd 6w5 -6xu 6vm -6xa 6v2 -6wq 6ui -6w6 6u0 -6vq 6tr -6vp 6ub -6wp 6vs -6yf 6xr -70g 6zw -72m 724 -74u 74d -774 76n -79d 78w -7bn 7b6 -7dx 7dg -7g6 7fp -7ig 7hz -7kp 7k7 -7my 7mh -7p8 7om -7rb 7q8 -7ss 7r2 -7t7 7ra -7ta 7r8 -7t4 7r2 -7sy 7qx -7ss 7qq -7sm 7ql -7sh 7qf -7sb 7q9 -7s4 7q3 -7rz 7px -7rt 7pr -7rm 7pl -7rh 7pf -7rb 7p9 -7r4 7p3 -7qz 7ox -7qt 7or -7qn 7om -7qh 7of -7qb 7o9 -7q5 7o4 -7pz 7nx -7pt 7nw -7pw 7o9 -7qi 7p9 -7rq 7qg -7sx 7ro -7u5 7sv -7vc 7u2 -7wj 7va -7xr 7wh -7yy 7xp -806 7yw -81e 809 -82s 81q -84a 837 -85r 84p -87a 868 -88s 87p -8aa 891 -8bh 89q -8bv 89m -8b9 88p -89s 872 -87f 84n -84f 81u -80w 7yd -7x7 7uo -7ti 7qz -7pt 7na -7m4 7jl -7if 7fx -7er 7c8 -7b3 78k -77e 74v -73p 716 -700 6xh -6wb 6tt -6sn 6q5 -6ow 6mf -6l5 6io -6hf 6ey -6do 6b7 -69x 67g -666 63q -62g 5zz -5yp 5w8 -5uy 5sh -5r8 5or -5nh 5l0 -5jq 5h9 -5fz 5di -5c8 59r -58h 560 -54q 529 -510 4yj -4x9 4ut -4tj 4r4 -4pr 4p3 -4mg 4mb -4jk 4je -4gm 4gg -4do 4dj -4ar 4al -47t 47m -44u 44o -41w 41p -3yx 3yq -3vz 3vs -3t0 3st -3q1 3pv -3n3 3mw -3k4 3jx -3h6 3h1 -3e9 3e3 -3bb 3b6 -38e 388 -35g 35b -32j 32d -2zl 2zg -2wo 2wm -2tu 2tz -2r8 2ro -2ox 2pn -2my 2nr -2l4 2lx -2j9 2k3 -2hf 2i8 -2fl 2ge -2dq 2ej -2bv 2cn -29z 2as -284 28x -26a 273 -24f 257 -22j 23b -20n 21f -1yr 1zk -1ww 1xo -1v0 1vt -1t5 1tz -1rc 1sg -1pw 1rd -1p1 1qt -1oo 1qr -1ow 1r5 -1pk 1ry -1qi 1sv -1rf 1tt -1sd 1ur -1tb 1vo -1u9 1wn -1v7 1xl -1w5 1yi -1x3 1zh -1y1 20f -1yz 21c -1zx 22f -217 23p -22i 251 -23t 26b -254 27m -26e 28w -27o 2a6 -28z 2bh -2a9 2cs -2bm 2e5 -2d0 2fj -2ee 2gx -2fs 2ic -2h7 2jq -2il 2l4 -2k0 2mn -2lw 2om -2o9 2qw -2q1 2so -2rs 2uf -2tj 2w6 -2vb 2xy -2x2 2zp -2yu 31h -30l 338 -32d 34y -353 36f -38s 39l -3c9 3d3 -3fr 3gk -3j7 3k1 -3mp 3np -3qa 3so -3tv 3wn -3wo 3zg -3ze 426 -41z 44r -44l 479 -47w 4ab -4bp 4e4 -4fh 4i1 -4iu 4lj -4ku 4nf -4nz 4p6 -4rn 4sj -4v6 4w2 -4yp 4zl -527 533 -55q 56m -599 5a5 -5cs 5do -5gb 5h7 -5jt 5kp -5nc 5o8 -5qv 5rr -5ue 5va -5xx 5yt -61f 62b -64y 65u -68h 69d -6c0 6cw -6fj 6gf -6j1 6kk -6mu 6p9 -6qk 6si -6rr 6tg -6r9 6t9 -6rb 6tg -6rp 6tx -6s9 6ug -6sr 6uz -6tb 6vj -6tu 6w2 -6ue 6wm -6uy 6x6 -6vi 6xq -6w3 6yc -6wo 6yw -6x8 6zg -6xs 700 -6yc 70k -6yw 714 -6zg 71p -702 729 -70k 72q -710 737 -71g 73m -71w 742 -72b 74h -72r 74x -737 75e -73n 75t -743 769 -74j 76p -74y 775 -75f 77l -75v 783 -76f 78n -76y 796 -77i 79p -780 7a8 -78k 7as -794 7aq -78i 78z -769 75j -72v 722 -6ze 6yl -6vx 6v7 -6sj 6sn -6pw 6r8 -6ot 6qp -6op 6qt -6oy 6r7 -6pl 6rw -6qe 6sr -6r9 6tm -6s6 6uk -6t4 6vh -6u1 6wf -6uz 6xd -6vx 6ya -6wv 6z9 -6xt 706 -6yq 714 -6zo 721 -70l 734 -71x 74h -73e 75y -74v 77f -76d 78x -77u 7af -79c 7bv -7aq 7da -7c7 7er -7dn 7g7 -7f3 7hm -7gj 7j3 -7hz 7ki -7jc 7lv -7kq 7n9 -7m3 7om -7ng 7pz -7ot 7pr -7nz 7mv -7kb 7j7 -7go 7fk -7d0 7bx -79d 789 -75p 74m -722 70y -6ye 6xb -6ur 6tn -6r3 6q0 -6ng 6mc -6js 6ip -6g6 6f3 -6ci 6bh -68w 67y -65c 64e -61s 60u -5y8 5xa -5uo 5tr -5r5 5q7 -5nk 5mm -5k0 5j3 -5gh 5g9 -5dw 5gf -5fc 5hv -5gp 5j8 -5i2 5kl -5jf 5ly -5kt 5nc -5m6 5op -5nj 5q2 -5ow 5rf -5qa 5st -5rn 5u6 -5t0 5vj -5ud 5wv -5vp 5y8 -5x3 5zm -5yg 60z -5zt 62c -616 63p -62k 653 -63x 66g -65a 67t -66n 696 -681 6ak -69e 6bx -6ar 6da -6c6 6ep -6dk 6g4 -6ez 6hi -6gd 6iw -6hq 6k9 -6j4 6ln -6ki 6n1 -6lv 6oe -6n9 6ps -6on 6r7 -6q1 6sk -6rf 6ty -6st 6vc -6u6 6wp -6vk 6y3 -6wy 6zh -6yb 70u -6zp 728 -712 73l -72g 750 -73v 76e -758 77r -76m 795 -780 7aj -79d 7bw -7ar 7da -7c5 7ep -7dk 7g4 -7f3 7ho -7gn 7j8 -7i7 7ks -7jr 7mc -7la 7nv -7mt 7pd -7ob 7qw -7pu 7se -7rd 7ty -7sw 7vh -7uf 7wz -7vx 7yi -7xg 800 -7yy 81j -80h 832 -820 84k -83i 862 -850 87l -86j 895 -886 8ar -89s 8ce -8bf 8e1 -8d2 8fn -8eo 8ha -8ga 8iw -8hx 8ki -8jj 8m5 -8l6 8ns -8ms 8pd -8oc 8qw -8pv 8sg -8rf 8u0 -8sz 8vl -8ul 8x6 -8wb 8xg -8zz 912 -93m 94o -978 98b -9aw 9bz -9ej 9fl -9i5 9j8 -9ls 9mx -9ph 9qo -9t6 9uc -9wv 9y0 -a0j a1p -a48 a5g -a7y a95 -abn acv -afd agk -aj2 aka -ams anz -aqh arp -au7 ave -axw az4 -b1n b2t -b5b b6h -b90 ba5 -bco bds -bgc bhf -bjz bl2 -bnm bor -brb bsk -bv1 bw1 -bym bzl -c27 c36 -c5r c6m -c9a c9h -cc8 can -ccp ca6 -cb9 c8p -c9t c79 -c8c c5s -c6v c4b -c5f c2v -c3y c1e -c2i bzy -c11 byh -bzk bx0 -by4 bvk -bwn bu3 -bv6 bsm -btq br6 -bs9 bpp -bqt bo9 -bpc bms -bnv blb -bmf bjv -bky bie -bji bgy -bi1 bfh -bgk be0 -bf4 bck -bdn bb3 -bc7 b9n -baq b86 -b99 b6p -b7t b5a -b6d b3t -b4x b2d -b3g b0w -b1z azf -b0j axz -az2 awi -axl av1 -aw4 atj -aun as3 -at6 aqm -arp ap5 -aq8 ano -aor am8 -ane aku -alw ajb -ake ahu -aiw agc -ahe aeu -afx add -aeh abx -ad0 aag -abj a8y -aa1 a7h -a8l a61 -a74 a4k -a5n a33 -a46 a1m -a2q a06 -a19 9yp -9zs 9x8 -9yb 9vr -9wu 9ua -9vd 9st -9tw 9rc -9sf 9pu -9qx 9od -9pg 9mw -9nz 9lf -9mi 9jy -9l1 9ih -9jk',
    height: '1q 0 -3 -1 -2 -1 -1 -6 -1 -1 -1 0 -1 -1 -1 0 0 0 1 1 1 0 1 1 1 0 0 0 0 0 0 -1 -1 0 0 0 0 0 1 1 0 0 0 0 0 0 0 -1 -1 5 4 5 5 4 6 5 5 7 7 6 7 6 0 1 1 1 3 3 3 3 2 1 2 3 -8 -5 -4 -5 -4 -7 -7 -7 -7 -7 -7 -7 -7 9 5 5 6 5 6 5 -2 -2 -2 -2 -4 -3 -8 -9 -7 -8 -8 -7 -8 -1 0 0 0 1 0 0 -1 -1 -2 -1 -1 0 1 3 3 3 3 3 3 4 4 4 3 3 1 -1 -3 -3 -4 -5 -4 -4 -3 -3 -3 -1 -1 0 0 1 0 1 2 1 3 2 2 2 1 2 2 2 3 4 3 4 5 5 6 7 8 9 a a d d d e e f c b 9 9 7 6 4 4 4 3 3 2 2 3 5 5 5 7 6 7 7 6 6 5 4 4 2 2 0 0 -1 -1 -3 -3 -4 -4 -3 -4 -3 -2 -1 0 0 0 1 1 1 1 1 1 -1 -1 -2 -2 -3 -4 -3 -4 -4 -4 -4 -3 -1 0 -1 -1 -1 -3 -2 -3 -3 -3 -4 -5 -6 -8 -9 -9 -9 -a -a -a -b -c -d -a -a -7 -5 -3 -2 0 0 1 3 5 5 6 3 3 1 -1 -2 -3 -3 -4 -4 -4 -6 -5 -5 -5 -4 -3 -3 -4 -3 -4 -3 -4 -3 -2 -4 -4 -4 -6 -5 -5 -4 -3 -4 -3 -2 -2 -2 0 3 3 3 4 4 5 4 5 5 5 5 4 3 2 1 0 2 1 1 2 1 2 1 0 -1 0 0 1 0 0 0 0 -1 -2 -2 -2 0 -1 -1 -1 0 -2 -2 -3 -2 -1 -2 0 0 1 1 2 1 2 2 3 3 4 4 4 3 2 0 0 0 0 0 -2 -2 -3 -5 -5 -6 -5 -5 -6 -4 -5 -5 -4 -2 -1 -1 0 1 2 1 3 2 2 0 1 1 0 0 1 0 0 0 0 0 0 1 3 4 5 5 6 4 6 4 3 3 1 1 0 -2 -2 -2 -1 -2 -1 -2 -1 1 1 2 3 3 2 2 2 1 0 2 2 1 2 3 3 3 3 2 3 2 3 3 2 3 0 0 -3 -4 -6 -4 -5 -5 -5 -6 -6 -6 -7 -6 -6 -4 -4 -3 -3 -4 -3 -3 -4 -4 -4 -3 -2 -1 0 1 3 2 3 4 5 3 4 3 2 1 0 -1 -2 -4 -4 -5 -6 -7 -6 -7 -6 -5 -4 -4 -2 -2 0 1 2 3 5 5 6 6 6 4 4 3 0 0 -2 -2 -2 -1 -2 -1 -2 -1 0 0 0 0 0 -1 -1 -2 -3 -4 -3 -3 -3 -1 0 1 3 3 3 2 2 2 1 1 2 1 2 2 3 4 4 6 8 9 a b a 8 7 4 2 -1 -2 -1 -4 -6 -6 -6 -6 -6 -6 -4 -4 2 -2 -2 -3 -1 -1',
    tunnel: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '9x,1,10,13,13,d,8o ep,0,3z,17,1k,6,ag bc,0,3s,13,16,9,8x bc,0,4u,10,x,6,4m 9r,0,4e,j,d,d,5j 4c,0,17,t,u,q,d7 46,0,1j,16,1e,j,96 4h,0,1n,1m,z,g,4l 4b,0,2s,y,j,9,dg 4e,0,2s,w,l,9,de 48,0,30,17,q,9,de 4c,0,4f,10,l,9,df 46,0,3j,h,d,9,l 46,0,54,1e,j,9,dq 7s,0,v,y,w,a,23 7i,0,1k,u,y,a,d0 7r,0,n,y,o,d,bn 83,0,11,1e,m,d,gi 82,0,i,l,x,9,8q 7w,0,34,13,q,9,f0 93,0,44,q,d,9,4e 7x,0,4n,k,e,9,gx 7g,0,3a,v,12,9,i 7x,0,44,n,g,9,gu 7g,0,4i,n,14,9,dn 7x,0,1u,p,i,9,cl 7x,0,1v,14,s,9,gy 7x,0,2p,10,v,9,cl 6e,1,1m,1f,1z,9,4i 50,0,1d,15,16,a,4c 68,1,27,b,f,9,8q 2c,0,18,l,r,9,8r 3u,1,11,1g,1g,t,8s 57,1,n,25,1i,6,ep 3h,1,1c,q,m,9,d1 38,1,12,w,o,9,8t 33,1,15,o,b,9,0 2p,1,13,f,j,9,d0 8g,1,p,m,o,d,s 95,0,14,1b,x,d,1 w,1,16,s,v,9,8s n,1,1e,1x,1q,9,8q aa,1,q,v,12,9,2 af,1,r,u,10,9,1 t,0,2o,1e,1h,d,8q g4,0,2b,26,2f,j,8q gb,1,p,16,11,t,hf g2,1,1m,12,19,28,4h ea,0,2m,w,17,t,4f eb,0,4p,r,t,1f,4h dx,0,48,1n,22,9,4l 54,0,2e,12,1h,t,13 53,0,54,z,u,9,aq f7,1,3s,1p,1t,w,hf cp,1,4l,1e,1b,g,d2 cm,1,3i,b,e,6,d2 cg,1,3h,18,14,g,8q bz,1,3h,l,j,9,4d ei,0,44,16,16,1s,2 4j,0,58,1i,1e,9,ah 5r,1,1k,o,16,a,9 6p,1,1a,w,10,d,d2 9r,0,4z,e,h,a,ea 61,1,1c,1d,1f,j,4b 6v,1,1i,18,16,d,4h 9r,0,54,r,l,9,9v e6,0,4l,u,14,q,df e4,0,2l,k,s,q,4t 9s,0,3y,i,h,a,dn 7x,0,5a,k,n,6,87 97,0,41,l,o,9,4e 95,0,4f,b,9,9,1 7x,0,50,r,k,q,3t c5,0,1v,m,p,9,2 c5,0,u,u,w,9,3 c8,0,t,n,m,9,2 cb,0,k,j,j,9,3 ce,0,q,g,i,9,8t ch,0,p,l,n,9,8t cl,0,p,k,n,9,3 ck,0,1f,t,u,9,8q cd,0,20,17,15,j,1 cl,0,20,s,s,d,1 ca,0,21,h,e,j,0 c8,0,1w,d,f,j,4e cp,0,1d,15,10,d,4e bc,0,3l,p,p,g,8y 9u,0,3y,r,q,9,9l 7g,0,4x,c,a,5,98 9s,0,4n,e,e,9,do 82,0,1z,1i,p,9,7t 9r,0,42,c,c,d,17 9s,0,3w,b,9,9,dl 7z,0,3p,15,h,9,gl 83,0,2u,z,p,9,7t 7z,0,2b,h,f,9,gj 8y,0,2k,p,k,9,8p 7z,0,33,l,n,9,c5 9c,0,46,p,n,9,8p 98,0,2j,i,g,9,8r 9c,0,3b,19,p,9,4b 97,0,2v,e,c,9,1 94,0,1n,e,a,9,8r 7x,0,48,l,c,9,gw 97,0,3f,f,e,9,8r 7x,0,51,n,j,9,3t 9q,0,1y,j,k,a,b8 7x,0,4b,f,d,a,3t 9q,0,2e,s,j,a,fl 9r,0,1f,g,d,a,5j 9r,0,2s,19,g,a,5k 66,0,53,o,s,a,73 5z,0,4d,u,10,9,8m 62,0,4x,h,i,9,d0 cb,0,37,1b,18,g,8q 4k,1,2z,b,7,9,dp 4j,1,2v,c,5,9,dq 4m,1,32,3,3,9,r 4l,1,36,6,6,9,4y 4l,1,34,5,3,9,g 4l,1,2w,8,7,9,c 4l,1,38,6,5,9,57 4t,1,38,h,a,9,a5 4u,1,3e,9,9,9,1e 4r,1,2v,c,8,9,1a c3,0,3z,f,g,9,d4 c5,0,32,9,b,9,d5 cn,0,35,p,r,d,8t c3,0,4n,e,g,9,4a cj,0,33,h,g,d,8t c7,0,32,f,d,9,8r ci,0,3b,b,c,g,8p cq,0,3j,o,q,d,4g c4,0,36,m,h,9,d5 ch,0,4a,g,j,9,8r cp,0,4v,t,v,9,hf b7,0,57,l,q,9,4h a7,0,52,n,t,9,92 b9,0,4q,b,d,d,8v a6,0,46,e,e,9,9d ba,0,52,h,j,d,4e a2,0,4l,f,g,9,m 9y,0,55,i,l,9,4x a7,0,45,l,j,9,92 a4,0,4z,b,b,9,do a4,0,4f,e,f,9,n a3,0,58,h,e,9,o a5,0,52,g,j,9,p a0,0,4x,n,o,6,9c bw,0,1k,1f,1k,d,8r 9z,0,3w,h,j,9,9e 9w,0,3z,c,g,9,q a7,0,3b,d,e,9,93 a5,0,36,r,r,9,9e 9t,0,40,h,a,9,de a7,0,1a,m,i,9,dh 9s,0,2k,l,d,9,dn 9y,0,j,g,d,a,hd a1,0,l,h,e,9,8n 9w,0,i,m,f,a,8p 9t,0,3e,f,d,9,de 9s,0,11,1a,t,a,dn a7,0,2h,p,r,9,dh a5,0,n,m,i,d,8n bt,0,3h,w,10,9,4e bj,0,32,r,l,9,hd bc,0,2a,z,15,d,90 bh,0,3l,v,w,9,dd by,0,3x,16,11,9,d3 bo,0,1t,u,q,9,1 by,1,47,l,l,a,0 1,1,3q,g,e,9,hd bs,1,4g,o,u,d,hf bc,0,w,g,p,g,dd b9,0,3m,p,t,a,8r bc,0,1o,l,s,g,8z bb,0,3j,p,y,9,3p bc,0,3z,t,x,9,db b5,0,28,k,k,9,1 db,0,4f,t,q,d,49 c9,0,4h,e,g,9,3 ct,0,50,l,m,9,d3 cx,0,3i,13,1u,9,8r 5a,0,j,b,h,9,hf 5g,0,1e,k,13,9,d1 5q,0,13,1a,10,q,p 5q,0,4h,j,s,g,9c 5r,0,2c,h,l,9,92 5o,0,4z,h,l,g,e0 5l,0,o,g,q,q,hf 56,0,s,n,o,9,60 d5,0,1p,t,u,12,8u d1,0,1n,h,h,8,4f cz,0,n,w,10,9,8q cy,0,1l,p,n,9,4e 71,0,19,1i,1f,d,8m 67,0,q,m,p,9,8p 5y,0,1l,1s,1r,9,hf 6p,0,l,l,j,6,8u 6f,0,o,i,n,9,5i 55,0,38,1a,18,d,5e bp,1,38,s,o,d,hf 5u,0,31,t,n,9,d0 5u,0,48,h,k,9,8p 5p,0,33,1s,1c,g,dx 5z,0,2x,y,1a,9,he 74,0,2o,r,o,d,90 74,0,4c,r,s,d,4m 76,0,47,o,t,9,ci 76,0,32,m,l,9,ci cc,1,4f,p,l,19,d3 fz,1,4o,19,1d,j,hc 67,0,34,r,t,9,hd 66,0,1s,i,g,9,4f 68,0,1t,h,k,9,8o 6c,0,47,1c,12,12,9r 3x,0,13,6,7,3,2t cn,1,4h,l,n,9,4e e8,0,3h,k,l,9,4j eq,0,59,h,k,6,8w eq,0,3g,a,b,6,d3 1,0,26,d,b,9,0 k,0,1f,v,t,a,4a aj,0,12,1f,1b,d,8s ag,0,2b,f,c,9,hf 6o,0,4k,1p,1d,9,dq 7g,0,3s,b,b,5,98 65,0,18,a,c,9,4d 66,0,2h,e,f,9,d1 3m,1,1d,10,q,9,5a 3p,0,1d,k,m,6,4n 7c,0,25,1b,1r,d,8q 4w,0,43,j,o,9,bp d4,0,10,s,p,a,4e d7,0,w,w,r,9,8q bx,1,3i,h,l,g,8r bu,1,3m,l,j,g,4g dw,0,1l,1i,21,9,4k dr,0,2q,1y,2m,9,dc dr,0,49,m,k,q,8y ci,1,11,14,x,8,8q dr,0,35,o,u,m,db bp,1,3m,m,n,6,hf f7,1,2r,6,7,5,8p dn,0,l,m,o,6,hf ag,0,1b,1k,11,9,8q b0,1,32,l,r,9,8n dg,0,18,1q,1s,9,8r aa,0,12,v,16,9,8o bm,0,15,2a,26,g,8r b4,0,1o,1f,16,9,44 53,0,3v,j,k,t,em 2r,1,2a,e,d,t,5g 34,1,38,e,7,6,gx 34,1,2a,k,h,6,4n 3j,1,2f,8,a,6,6u 3d,1,3h,f,h,6,74 8b,1,h,a,c,d,1 8d,1,k,j,n,g,8q 89,1,k,c,d,a,8p 80,1,n,1l,1t,d,2 8g,1,1t,9,p,6,af 5x,1,48,8,9,6,30 5w,1,4p,7,7,6,7x 5j,0,1g,d,s,d,cz 6h,0,4q,j,u,m,e5 6b,0,51,y,u,d,1e d0,1,l,1e,1e,q,1 d0,1,23,1e,1e,q,8q di,1,l,1e,1d,g,he dv,1,m,q,r,d,2 dk,1,21,1d,1f,q,8o d6,1,23,e,i,a,8q dd,1,1h,s,o,12,4b dd,1,23,f,f,a,he dd,1,n,e,i,a,he d6,1,19,s,o,12,d4 d6,1,n,f,f,a,8q bb,0,5a,1p,14,d,ch 4j,0,3v,k,e,9,d9 4o,0,3b,12,13,9,8r 1m,0,3y,c,c,6,20 gk,1,4i,1c,1b,a,8n 7x,0,j,p,u,6,cm 8g,1,4c,b,d,9,du 43,0,3p,g,h,6,6c 43,0,4p,b,e,6,em 1v,0,1l,9,a,6,27 1o,0,1q,7,7,3,em 51,0,4y,c,g,a,bp 6t,0,55,a,a,3,dw 6n,0,3c,u,z,6,9c 6f,0,4m,1x,1i,a,a 9y,0,1e,n,m,9,4a dr,0,52,1z,2i,9,db dr,0,55,g,j,t,d8 dr,0,3v,x,w,12,7 dr,0,3u,17,12,9,2 d6,0,3a,u,r,3,d3 dp,0,x,9,a,3,d0 6j,0,1s,v,x,a,58 6h,0,29,j,d,q,9d 6g,0,1r,d,n,a,5i 7f,0,33,o,m,3,7p 7a,0,2s,g,f,3,4e 7e,0,3k,8,8,3,4b 7a,0,3e,q,s,a,hf 7c,0,4h,s,y,6,8r au,1,4b,g,e,6,he 6v,0,30,x,12,9,d 6x,0,3d,e,f,q,95 72,0,34,g,i,3,9 70,0,2w,q,k,w,4n 3h,1,4t,b,8,9,92 4k,1,29,6,5,9,8x 4i,1,2m,5,4,3,g 30,1,1q,f,a,9,f d,0,1p,9,9,9,el 2m,1,z,g,m,9,hd 9g,0,1l,e,c,a,1 9p,0,1f,e,c,6,c2 9p,0,x,l,f,a,7q 9j,0,q,l,d,a,2 9h,0,w,i,i,a,d5 3c,1,19,s,o,9,2 6,1,w,1j,1a,9,he c,1,12,q,j,9,4c e,1,13,w,w,9,4c ap,1,1e,11,t,9,d1 ap,1,28,x,v,9,4b 3,1,2d,s,y,9,8p 90,0,p,u,d,9,8p 8z,0,1c,10,p,9,he 8u,0,q,u,g,9,8l 8t,0,1e,q,k,9,he 9c,0,1j,k,b,9,8s 9b,0,16,c,8,a,4f 9c,0,r,k,h,a,4 9d,0,16,c,b,a,4e 9r,0,31,d,e,9,17 9r,0,3i,b,9,9,5k 9r,0,3f,c,9,9,17 as,1,18,14,z,9,cz 5z,0,2x,i,g,9,d1 di,0,2v,l,m,d,hf dc,0,36,x,z,g,8o dm,0,2t,h,j,d,8q do,0,39,l,n,d,d3 c4,1,u,q,11,9,d5 c8,1,g,q,q,9,1 cd,1,o,s,v,9,1 c6,1,24,16,15,9,8q ce,1,1r,j,k,9,d3 cg,1,1n,h,j,9,d3 ce,1,2a,n,o,j,0 cp,1,t,11,t,9,4e co,1,22,t,x,9,8s cj,1,2a,v,v,9,8q 8g,1,3i,g,b,9,dd 7n,1,2k,x,r,6,ch 86,1,3r,x,17,6,92 3i,1,2d,h,d,9,8j 8c,1,22,g,o,9,8w do,0,43,4,4,3,d7 do,0,4c,8,7,3,4e dl,0,46,a,9,3,d6 do,0,50,i,h,a,d5 dk,0,54,w,17,a,4f di,0,4w,v,13,a,d2 de,0,51,1l,16,3,d2 dr,0,4w,9,9,3,8x d3,0,3y,c,b,3,d4 2p,1,4i,8,9,9,7k 3d,0,2k,n,g,9,gr 9d,0,1l,m,b,a,1 7t,1,j,b,q,6,73 g9,1,2c,q,r,9,8n gb,1,20,q,t,9,hd g5,1,u,k,h,9,8r g4,1,1q,o,s,9,2 82,1,20,k,g,6,4m 7t,1,18,i,i,6,2e 4e,1,2u,i,e,3,94 3u,1,24,v,n,3,2 3q,1,2d,f,f,a,1l f8,1,w,3m,3b,3,hf fk,1,y,j,j,3,d2 33,1,3y,g,p,9,2t ce,1,3d,8,7,6,8q 3w,0,25,4,9,9,ch fj,0,2f,c,e,9,d4 fd,0,2b,d,f,9,8r fd,0,1q,e,g,9,d6 46,0,2g,n,q,9,dm fi,1,2f,6,6,3,6m eh,1,1y,6,6,3,3o 3a,1,2f,14,n,6,8u 8r,0,1c,3,3,9,4b 8r,0,z,3,3,9,4f 5m,1,z,4,7,3,dq 5k,1,1m,5,8,9,d4 61,1,52,6,6,9,3k 61,1,4y,c,e,9,3l 5g,1,45,5,5,9,dc 5g,1,3f,7,7,9,1 5f,1,4f,f,e,9,bw 5h,1,47,5,a,9,4k 5f,1,3l,6,a,9,d8 5b,1,3m,a,9,9,7k 5d,1,3m,7,9,9,dy 5c,1,3k,9,c,9,1 5j,1,3f,6,9,9,d3 5i,1,3f,6,8,9,4f 5i,1,3p,7,7,9,8p 5h,1,3d,4,8,9,8r 5g,1,3u,5,8,9,8 5l,1,36,9,a,9,gn 5l,1,3q,e,a,9,b2 5m,1,3h,d,6,3,b0 5j,1,3p,3,6,9,d4 5j,1,3z,3,7,9,0 4q,1,2x,8,6,9,8p 4q,1,37,6,5,9,2g 4p,1,2u,4,4,9,1v 4o,1,2z,c,d,9,90 3l,1,2u,f,d,9,62 4h,1,3a,b,c,9,5j 4o,1,34,9,8,9,8t 3l,1,4s,6,5,9,f0 5f,1,45,5,8,9,4a 4u,1,3t,5,5,9,2l 4u,1,49,6,b,9,g5 4t,1,4j,8,f,9,7e 4s,1,4s,3,5,9,g6 4t,1,4w,6,8,9,7i 4s,1,57,5,5,9,cc 5e,1,4d,6,6,9,h6 5c,1,40,6,7,9,3 5e,1,42,5,7,9,d3 5d,1,42,7,8,9,8z 5d,1,48,4,5,9,8x 5d,1,4e,6,8,9,3k 5d,1,4n,4,6,9,8z 5i,1,45,6,6,9,0 5k,1,3y,8,8,9,8t 6i,1,3z,c,c,3,u 6l,1,3f,d,7,9,83 7m,1,2e,8,9,9,2v 7n,1,1r,9,c,6,4d 7n,1,1e,e,i,6,3r 7n,1,1f,5,9,6,5 6u,1,30,d,c,9,8f 6w,1,2v,8,9,9,ds 6y,1,2n,7,5,9,84 77,1,2i,6,6,9,cw 70,1,2i,a,b,9,8n 5k,1,4b,5,4,9,63 5k,1,46,6,8,9,5i 5l,1,46,6,4,9,27 5n,1,3s,5,5,3,6g 5o,1,3v,5,6,3,al 5m,1,4g,8,9,3,32 5l,1,4k,a,9,9,g7 5m,1,4o,7,9,3,gv 5l,1,44,9,4,9,b4 5n,1,40,8,7,3,70 5m,1,3z,6,4,3,6o 5m,1,47,3,3,9,g5 5e,1,59,8,8,9,ej 5f,1,4x,a,6,9,b0 4r,1,52,6,8,9,bv 4q,1,4u,5,7,9,ge 4q,1,4h,3,6,9,bl 4q,1,4i,4,7,9,b9 4p,1,4f,9,8,9,ak 4p,1,4d,5,5,9,66 4p,1,4a,6,6,9,65 4o,1,45,7,8,9,ai 4n,1,3y,7,8,9,ab 4o,1,4s,9,8,9,ev 4s,1,47,5,7,9,2y 4p,1,4w,5,5,9,6c 4p,1,52,6,6,9,66 4p,1,56,5,5,9,6e 5i,1,4v,9,7,9,am 5h,1,4z,7,6,9,69 5n,1,4h,9,a,3,7s 4u,1,3q,5,5,9,5z 4t,1,3p,6,5,9,60 4s,1,3g,8,6,9,1i 4r,1,49,7,7,9,7k 4q,1,42,8,7,9,a9 4p,1,3e,b,a,9,f1 4o,1,3k,7,9,9,1p 4p,1,3u,d,b,9,1q 4q,1,3m,8,a,9,f1 4r,1,3u,9,7,9,5t 4r,1,3e,8,b,9,6g 4n,1,3b,5,6,9,b 4q,1,38,9,9,9,f6 4p,1,59,5,6,9,6k 5o,1,4a,5,4,3,6k 5u,1,43,6,4,3,5y 5v,1,44,5,4,3,ap 61,1,32,e,c,9,74 6r,1,33,c,b,9,89 6p,1,36,b,9,9,ba 6o,1,34,8,6,9,81 6t,1,31,b,8,9,40 6x,1,2v,9,9,9,82 70,1,2r,8,a,9,8z 73,1,2o,h,p,6,99 7n,1,3x,8,e,9,h5 7n,1,3i,b,b,9,gk 6v,1,4c,6,8,9,ek 7n,1,3o,8,a,9,7u 7n,1,41,e,b,9,ge 70,1,4j,5,6,9,4v 7m,1,4k,9,i,9,6u 7m,1,3u,c,d,9,2f 7m,1,3w,6,a,9,bg 72,1,46,8,c,9,i 6z,1,36,7,b,9,9w 6y,1,36,5,6,9,57 6x,1,33,6,5,9,dt 6z,1,3g,5,8,9,13 6x,1,3f,5,6,9,9q 6y,1,34,5,5,9,dp 7x,0,m,g,i,9,7 bi,0,40,j,g,9,2 63,1,4v,k,k,3,29 65,1,5a,4,5,9,2p 66,1,46,9,a,3,br 6i,1,4i,7,6,3,d8 65,1,4p,l,i,3,2b 89,1,4m,8,8,9,9p 8c,1,4c,h,c,9,at 8a,1,47,h,n,9,e8 7n,1,4u,d,l,9,3z 6u,1,3s,8,7,g,22 5p,1,3l,4,6,3,5 5y,1,2u,c,b,9,hf 5z,1,3t,6,8,9,3q 87,1,2p,i,f,9,h3 7n,1,q,e,c,6,4a 3e,1,2g,k,j,3,6 ev,0,2g,9,8,9,4f ff,0,2f,8,9,9,4e ft,1,1a,4,4,9,he ft,1,2g,5,5,9,hb ei,0,1s,7,6,9,8t ey,1,1y,f,d,9,0 f2,1,1y,f,d,9,8q f5,1,1y,f,d,9,8q f7,1,1y,f,d,9,0 fa,1,1x,f,d,9,0 fc,1,1x,f,d,9,0 fg,1,1x,f,d,9,0 fk,1,1t,b,9,9,0 g5,1,k,6,7,9,8r gc,1,h,4,6,9,18 g1,1,1n,9,a,9,dj 7m,1,13,8,d,6,6p 7m,1,1m,7,9,6,fa 7m,1,1x,9,7,6,er 78,1,22,6,5,6,hb 87,1,48,3,d,9,57 7n,1,2d,a,9,6,di 7n,1,4n,f,v,9,4p 7m,1,3b,k,m,9,6z ay,0,z,f,g,9,0 aj,0,19,e,c,9,4f ah,0,19,e,c,9,d3 7m,1,2n,8,a,9,bl 7m,1,2m,a,c,9,fg 7m,1,24,e,c,9,39 7m,1,2c,j,n,9,6j 7m,1,1m,c,b,9,f9 ae,0,1q,6,8,9,4 9v,0,2w,14,11,9,0 9t,0,3k,c,9,9,a 9t,0,2o,m,f,9,95 9y,0,2f,g,m,9,dr a1,0,2q,f,o,9,dr a2,0,2d,l,k,9,9e 9w,0,2b,7,7,9,53 a6,0,23,d,d,9,o 9z,0,3b,7,7,9,51 a4,0,31,e,f,9,dr 9u,0,22,d,g,9,4i 9x,0,38,a,9,9,9e a1,0,1b,v,1h,9,4a a0,0,35,8,a,9,dr 33,1,53,9,i,9,3l 8c,1,58,b,a,9,7 36,1,54,a,9,9,h7 37,1,56,e,m,9,4x 33,1,4e,7,a,9,5o 8f,1,2m,a,9,9,8a 8f,1,2v,a,c,9,gt 32,1,4c,9,8,9,1a 2p,1,3e,c,9,9,f0 8g,1,3r,p,e,9,e3 8g,1,4b,a,e,9,2a 8g,1,4s,e,g,9,9p 34,1,4h,c,c,9,9k 36,1,43,9,4,9,90 37,1,4a,x,f,9,8j 3c,1,49,g,c,9,3 3e,1,49,f,8,9,4k 3b,1,49,c,9,9,d6 83,1,10,b,c,6,9 8p,0,c,4,3,9,7 88,1,4l,3,8,9,5a 8a,1,2l,c,c,9,7 89,1,31,8,c,9,9u 8a,1,38,a,d,9,15 8d,1,2x,d,d,9,8g 8d,1,3g,9,a,9,45 8c,1,3n,8,8,9,at 8d,1,3y,7,6,9,aj 8e,1,3x,7,b,9,d4 86,1,1f,8,9,9,1g 7n,1,o,3,3,3,d0 77,1,1x,1b,1v,a,9 5n,1,4z,q,s,3,bu 1o,0,2m,a,6,3,8y 1m,0,2u,6,6,3,4l 3l,1,3x,n,f,9,5p 3n,1,3m,d,b,9,9n 3o,1,3c,g,8,9,a7 3l,1,59,f,a,9,5x 4l,1,4l,e,b,9,ab 4i,1,3q,e,e,9,5n 3r,1,3y,7,5,9,1b 3s,1,3p,d,c,9,19 4i,1,49,a,6,9,a8 3o,1,45,a,a,9,5j 3m,1,41,a,b,9,d2 3s,1,2x,g,e,9,5r 3k,1,3x,e,c,9,a2',
    boats: 'ge,0,6j,u,he gh,0,6s,12,he gf,0,79,x,he gh,0,7v,g,he gf,0,8h,t,he gg,0,8q,j,4b gf,0,8z,11,d1 gb,0,90,w,8p ge,0,7s,12,8o gb,0,7d,l,8p gc,0,6g,h,d1 ge,0,5m,i,4c ep,0,5h,11,1v ep,0,5i,g,1v 3s,0,99,10,7u 3r,0,8i,m,7u 3w,0,82,q,82 3t,0,7c,p,7u 3x,0,6v,l,82 3w,0,66,x,82 3y,0,5p,w,82 40,0,65,g,3b 40,0,6u,z,3b 40,0,6s,l,c0 3z,0,64,13,c8 3z,0,6o,k,gq 40,0,73,p,38 40,0,7p,10,c8 3y,0,7g,v,ce 3y,0,80,z,gt 3x,0,8l,k,3p 40,0,89,k,3h 3s,0,8u,j,gk 3x,0,92,v,3o 13,0,5s,j,h7 14,0,6g,v,h7 12,0,70,h,h7 14,0,7o,13,h7 12,0,88,s,h7 13,0,8h,v,43 15,0,8i,x,8h 14,0,79,10,8h 16,0,6o,m,8j 14,0,61,f,8h 17,0,5h,u,8j eq,0,6k,h,o eq,0,7b,o,o eq,0,7q,r,o eq,0,8g,r,o eq,0,98,k,dx eq,0,6w,10,9f eq,0,6k,13,9f eq,0,6d,p,4h',
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
    metres: 5402,
    line: '1sp -633 626 -5zk 5yj -5vy 5uv -5sb 5r3 -5ol 5na -5kt 5jh -5h2 5fp -5d9 5bx -59h 585 -55q 54e -51y 50m -4y6 4wt -4ue 4t2 -4qm 4pa -4mu 4li -4j3 4hr -4fb 4dz -4bj 4a6 -47r 46f -43z 42n -407 3yv -3wg 3v4 -3so 3rb -3ov 3nj -3l4 3js -3hc 3g0 -3dk 3c8 -39t 38g -360 34o -328 30w -2yh 2x5 -2up 2td -2qx 2pk -2n5 2lt -2jd 2i1 -2fl 2e9 -2bu 2ai -282 26q -24a 22x -20i 1z6 -1wq 1ve -1sy 1rm -1p7 1nv -1lf 1k2 -1hm 1ga -1dv 1cj -1a3 18r -16b 14z -12k 117 -yr xf -uz tn -r8 pw -ng m4 -jo ic -fx ek -c4 as -8c 70 -4l 39 -t -j 2z -4c 6r -83 aj -bv eb -fn i2 -je lu -n6 pm -qz tf -ur x6 -yi 10y -12a 14q -162 18h -19u 1ca -1dq 1g3 -1hn 1jy -1lk 1nu -1pe 1rp -1te 1vl -1xe 1zh -21d 23e -250 27a -28n 2b2 -2cf 2eu -2g7 2im -2jz 2mf -2ns 2q7 -2rk 2tz -2vc 2xr -2z4 31j -32x 35c -37g 396 -3ai 3cy -3ea 3gq -3i1 3kh -3lt 3o9 -3pl 3s1 -3tc 3vs -3x4 3zk -40u 43a -44a 46w -47f 4a5 -4a9 4d0 -4co 4fg -4eq 4he -4g7 4ip -4h6 4jh -4hl 4jm -4he 4j3 -4go 4i1 -4fe 4g8 -4di 4dz -4b7 4b7 -48g 481 -45e 44k -423 40u -3yh 3x0 -3un 3t6 -3qt 3pc -3mz 3li -3j5 3ho -3fb 3du -3bh 3a0 -37n 366 -33t 32d -300 2yj -2w7 2uq -2sd 2qw -2oj 2n2 -2kp 2j8 -2gv 2fe -2d1 2bk -294 27u -256 24c -21l 218 -1yg 1yh -1vr 1w9 -1to 1un -1s8 1tl -1re 1t4 -1r9 1tb -1rx 1ub -1te 1w0 -1vd 1y2 -1xp 20h -20g 237 -238 261 -262 28u -28v 2bn -2bo 2eg -2eh 2h9 -2ha 2k2 -2k3 2mv -2mw 2po -2pp 2sh -2sj 2vb -2vc 2y4 -2y8 310 -30u 33m -337 35x -359 37y -370 39m -38f 3ay -39i 3bv -3a7 3cf -3ak 3cm -3aq 3cs -3ax 3cz -3b3 3d5 -3ba 3dc -3bh 3dj -3bn 3dp -3bu 3dw -3c1 3e3 -3c7 3e9 -3ce 3eg -3cl 3en -3cr 3et -3cy 3f0 -3d4 3f6 -3db 3fd -3di 3fk -3do 3fq -3dv 3fx -3e2 3g3 -3e7 3g9 -3ee 3gg -3el 3gn -3er 3gt -3ey 3h0 -3f5 3h7 -3fb 3hd -3fj 3hm -3fr 3ht -3fy 3i1 -3g6 3i8 -3gd 3ig -3gl 3in -3gk 3id -3g0 3hh -3ew 3fx -3d8 3dt -3b1 3b7 -38g 384 -35g 34n -325 30y -2yp 2x2 -2uz 2t5 -2r3 2p8 -2n6 2lb -2j9 2he -2fc 2dg -2be 29j -27g 25l -23k 21o -1zw 1xr -1wd 1tz -1sy 1qd -1pt 1n3 -1my 1k7 -1kj 1hr -1ii 1fu -1h1 1ej -1g4 1du -1fo 1dl -1fg 1de -1f9 1d7 -1f3 1d1 -1ew 1cu -1ep 1cn -1ei 1cg -1ec 1ca -1e5 1c2 -1dx 1bv -1dr 1bp -1dk 1bi -1dd 1bb -1d6 1b4 -1d0 1ay -1ct 1ar -1cm 1ak -1cf 1ad -1c9 1a7 -1c2 1a0 -1bv 19t -1bi 19b -1aa 17p -17v 153 -14d 11p -107 xw -vq u0 -rf qf -no nj -ku lj -iy k0 -hg ih -fw gx -ec fd -cs du -b9 ca -9p aq -85 96 -6l 7m -52 63 -3i 4k -1z 30 -f 1g 15 -4 2p -1o 49 -37 5s -4r 7b -6a 8v -7u af -9e bz -ay dj -ch f2 -e1 gm -fl i6 -h5 jp -io l9 -k7 ms -lq oe -no qf -q4 sw -t1 vq -wc yx -zy 12c -13s 15v -17o 19h -1bl 1d0 -1fe 1ge -1j0 1jl -1ma 1me -1p6 1ov -1rm 1qt -1th 1s8 -1up 1t2 -1vb 1tc -1va 1t9 -1v5 1t2 -1uw 1st -1uo 1sn -1uj 1sn -1uo 1su -1uy 1t7 -1vc 1tq -1vz 1ue -1wp 1v8 -1xk 1w6 -1yl 1xb -1zs 1yl -213 200 -22k 21k -246 239 -25v 254 -27s 273 -29s 297 -2bx 2bf -2e5 2do -2gf 2fu -2ik 2hj -2k4 2iq -2l4 2je -2lk 2jh -2lc 2j1 -2kk 2i1 -2j5 2gi -2hd 2en -2fa 2cl -2d8 2ai -2b5 28g -293 26e -271 24b -24y 229 -22w 207 -20u 1y4 -1yr 1w2 -1wp 1u0 -1un 1rx -1sk 1pv -1qi 1nu -1ol 1m3 -1nb 1l5 -1mv 1l1 -1n4 1ls -1o7 1nd -1q0 1pu -1sm 1t0 -1vr 1wn -1za 20p -232 24v -26z 28v -2ax 2ct -2eu 2gu -2is 2kt -2mp 2or -2qm 2ss -2uj 2wp -2yf 30o -32b 34m -366 38j -3a0 3ce -3dt 3g9 -3hl 3k2 -3lc 3nu -3p1 3rl -3so 3v8 -3wa 3yw -3zv 42i -43d 461 -46v 49j -4a9 4cz -4dk 4ga -4gu 4jl -4k1 4ms -4n6 4px -4q7 4sz -4t7 4vz -4w4 4yw -4yy 51q -51p 54h -54d 575 -56z 59q -59h 5c9 -5bx 5eo -5ec 5h3 -5gq 5ji -5j6 5lx -5ll 5oc -5o0 5qr -5qf 5t7 -5su 5vl -5v9 5y0 -5xo 60g -604 62v -62j 65a -64x 67o -67c 6a4 -69s 6cj -6c7 6ey -6em 6he -6h1 6js -6jg 6m7 -6lv 6on -6oj 6rb -6ri 6u8 -6up 6xd -6y5 70q -71r 747 -75j 77t -79e 7bi -7db 7f7 -7h9 7iw -7l4 7mk -7oy 7qa -7sp 7u1 -7wh 7xu -80a 81m -841 85d -87t 896 -8bl 8cx -8fd 8gp -8j4 8kh -8mx 8o7 -8qo 8rp -8u9 8uw -8xm 8xt -90k 90d -935 92j -958 947 -96s 95f -97u 96c -98o 977 -99k 982 -9ae 98w -9b9 99s -9c4 9am -9cz 9bi -9du 9cc -9ep 9d8 -9fk 9e2 -9gf 9ex -9h9 9fs -9i5 9gn -9iz 9hg -9js 9i0 -9k4 9i0 -9jt 9hf -9iu 9ga -9hc 9em -9f7 9cf -9cl 99u -99j 96t -969 93j -930 90a -8zq 8x0 -8wh 8tr -8t7 8qh -8px 8n7 -8mo 8jx -8jd 8gn -8g3 8dd -8cu 8a4 -89k 86u -86b 83l -831 80b -7zr 7x1 -7wi 7ts -7t8 7qi -7pz 7n8 -7mo 7jy -7je 7go -7g5 7df -7cv 7a5 -79l 76v -76c 73m -732 70b -6zu 6x3 -6x1 6ua -6un 6rz -6ss 6qa -6rh 6p7 -6qs 6os -6qq 6p2 -6r9 6px -6sd 6r4 -6tl 6sb -6us 6tj -6w0 6uq -6x7 6vx -6ye 6x5 -6zm 6yc -70t 6zk -721 70r -738 71y -74f 736 -75o 74e -76v 75m -783 76t -79a 780 -7ah 798 -7bp 7af -7cw 7bm -7e3 7cu -7fb 7e1 -7gi 7f9 -7hq 7gg -7ix 7gx -7i6 7fj -7gc 7e7 -7fy 7ek -7gz 7fq -7i7 7gx -7je 7i5 -7km 7jd -7lu 7kk -7n1 7ls -7oa 7n1 -7pi 7o8 -7qp 7pg -7rx 7qp -7t7 7ru -7u9 7sf -7ui 7sc -7u2 7rk -7sr 7q1 -7qm 7nu -7nt 7l4 -7kj 7i1 -7gu 7el -7cy 7b2 -791 77i -757 73s -71e 6zz -6xl 6w6 -6ts 6sc -6py 6oj -6m5 6kq -6ic 6gw -6ei 6d3 -6ap 69a -66x',
    height: '1h -2 -3 -1 -2 0 -1 0 0 1 0 0 0 0 0 -1 -1 -1 0 0 0 -1 -1 -1 0 -1 0 -1 -1 -1 -2 -1 -1 -1 0 0 0 0 1 0 1 0 1 1 0 0 -2 -1 -2 -1 -2 -1 0 1 1 1 0 0 0 0 0 0 0 0 -2 -1 -3 -2 -2 -1 0 1 0 2 2 1 2 3 2 2 3 2 1 0 -1 -1 -1 0 0 0 0 0 -1 -1 -1 0 0 0 1 2 2 1 3 1 2 1 2 1 0 0 0 -1 -2 -2 -2 -3 -2 -1 -1 -1 0 1 1 0 0 0 0 0 0 0 -1 -2 -1 -3 -2 -2 -2 0 0 0 0 1 1 1 0 1 2 1 2 1 0 0 -1 -2 -1 -2 -1 -1 -1 -1 0 0 0 1 2 1 1 1 0 0 0 0 -1 -1 -1 -3 -4 -3 -3 -2 -2 -3 -1 -2 0 -1 0 -1 0 0 0 0 0 0 0 1 1 0 1 1 1 1 1 1 0 0 0 0 -1 -2 0 -1 -1 0 2 2 2 3 3 4 3 4 4 2 3 1 1 0 -1 0 1 0 0 1 1 2 2 2 3 2 2 3 1 1 0 -1 -1 -1 -2 -1 -2 -1 -2 -1 -3 -2 -3 -2 -2 -1 -2 -2 0 0 0 0 0 0 2 2 3 2 1 2 1 -1 -2 -1 -2 -3 -2 -2 -3 -2 -2 -2 -1 -1 0 -1 -1 0 1 1 1 0 2 2 3 3 4 3 5 5 4 4 4 3 2 2 0 -1 -1 -4 -3 -3 -4 -4 -4 -5 -4 -5 -4 -4 -3 -3 -2 -2 0 0 0 0 0 2 2 3 3 3 4 3 3 3 2 2 4 3 2 2 3 1 2 0 1 1 1 0 1 -1 0 -2 -1 -2 -1 -3 -2 -2 -3 -1 -2 -1 0 0 0 1 1 1 2 2 3 2 2 1 2 0 0 0 0 0 -1 -2 -2 -2 -3 -3 -4 -2 -1 -2 -1 -2 -2 0 -1 0 0 1 1 2 1 0 0 0 0 0 0 -1 -1 -1 -1 -3 -3 -3 -2 -2 -3 -2 -2 0 0 0 2 3 3 5 5 6 6 7 7 6 7 6 4 3 3 1 1 0 0 -1 -1 -2 -2 -2 -3 -1 -1 -2 0 -1 -1 -1 -1 -2 -1 -2 -1 -1 -2 -1 -1 -1 0 -1 -2 0 0 0 1 1 0 1 2 1 0 1 1 1 1 1 1 0 0 0 -2 -1 -1 0 0 0 0 1 0 1 1 1 0 1 0 0 -2 -2 -3 -3 -4 -5 -4 -3 -3 -1 -2 0 0 2 2 2 3 4 5 4 3 3 1 2 0 0 -2 -1 -2 -1',
    tunnel: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '19,0,1h,5g,3f,9,0 19,1,16,58,40,9,8q i,1,l,x,p,9,0 27,0,2u,a,9,9,d6 1g,0,3n,i,d,9,8r 9z,0,1i,c,b,9,cq e1,0,1x,d,a,9,32 ds,0,40,o,k,9,1 ds,0,27,o,k,9,d3 dm,0,42,1x,1m,9,4d k,0,1a,6,5,9,8u 27,0,1k,c,b,9,8r 34,0,3c,b,7,9,1c 45,0,29,4,b,9,0 3g,0,27,c,b,9,ek 1e,1,2o,b,9,9,8s 1h,1,2o,b,9,9,8q 1l,1,2q,k,g,9,8q 1c,1,1x,w,x,9,4d 1k,1,1v,p,12,9,d2 u,1,1z,x,y,9,d5 12,1,1x,q,11,9,d3 x,1,2o,b,9,9,0 10,1,2n,b,8,9,8s g,1,27,13,z,9,8r n,1,2c,11,10,9,1 o,1,3a,18,12,9,8r dr,1,4r,h,f,9,ae 1,1,23,8,7,9,42 2,1,1z,8,9,9,47 7,1,29,a,b,9,d5 e6,1,2m,n,g,9,1o e4,1,24,l,h,9,a8 du,1,44,l,h,9,1o 24,1,s,k,g,9,9c 1w,1,46,9,9,9,28 cd,0,2n,d,9,9,8u 7c,0,1c,d,9,9,h3 4n,1,1i,a,5,9,8p 5e,0,2h,e,a,9,dz 8d,0,28,e,7,9,dr ba,0,2m,e,9,9,aa ef,0,36,c,9,9,hc eu,1,l,d,a,9,4 u,1,2p,j,f,9,8r 2w,1,1m,t,u,9,dy 2q,0,2q,b,9,9,3k 2s,0,3f,d,a,9,70 5,1,28,6,6,9,4f 1j,0,3k,b,b,9,4e ex,0,2c,c,b,9,5 0,0,2c,b,9,9,gz ab,1,2o,4,6,9,h4 1u,1,1d,i,i,9,4c 8v,0,2v,j,8,9,9p 2t,0,50,i,d,9,fb 7,1,37,n,f,9,8q 8,1,2r,s,j,9,0 c,1,2x,9,8,9,4d e,1,2x,a,b,9,4d g,1,2x,a,b,9,d3 i,1,2y,a,a,9,d3 1p,1,21,e,b,9,d4 1t,1,2d,a,8,9,2 1r,1,29,c,c,9,d5 9o,1,4d,b,9,9,9b 9o,1,4u,j,e,9,9c 9n,1,4s,b,9,9,8w aw,0,4l,3,4,9,3 8v,0,4n,6,7,9,cy 8v,0,4g,5,3,9,ee 8v,0,4r,7,5,9,5p au,0,4k,4,7,9,8s 8w,0,3k,4,4,9,6h 8w,0,45,a,o,9,24 8x,0,3d,a,8,9,es 8x,0,2y,6,c,9,ev 8z,0,37,f,i,9,9d 8v,0,42,7,6,9,ef 8u,0,38,8,7,9,65 8q,0,59,i,d,9,6j 8j,0,49,j,d,9,5v 21,1,2g,19,s,9,91 22,1,2u,1c,v,9,8z 3i,1,1x,10,13,9,aj 3h,1,26,10,13,9,1t ce,0,52,k,g,9,48 cf,0,53,k,g,9,3q cg,0,58,j,h,9,3f cg,0,58,h,j,9,c5 eu,0,36,d,a,9,3 eh,0,3m,d,b,9,7i 1z,0,38,d,a,9,8v 11,0,3j,x,o,9,8q 4z,0,4v,3,3,9,w 1u,0,4w,3,3,9,hc 4g,0,48,5,4,9,eb 3q,1,3b,7,5,9,6y 3q,1,3h,3,3,9,b3 5,0,29,g,k,9,97 7q,0,1v,4,4,9,6s 8z,0,28,4,3,9,gw 8z,0,26,4,4,9,6 8e,0,44,8,6,9,e2 8p,0,3i,i,9,9,6g 8s,0,2x,l,e,9,6o 8r,0,3b,l,e,9,6n 8t,0,41,j,d,9,6i 8u,0,3n,j,d,9,eu 8t,0,2m,i,a,9,f8 8w,0,2m,d,7,9,k 8u,0,32,7,5,9,ev 8v,0,2j,7,7,9,5a 8x,0,2i,4,4,9,1o 8w,0,3v,4,4,9,26 8x,0,38,5,6,9,62 8w,0,3l,3,3,9,9d ax,0,4l,7,6,9,4g cw,0,4r,a,9,9,dt co,0,2r,4,3,9,3n cm,0,2n,3,4,9,hd ab,1,2k,3,3,9,8c 2o,0,17,1d,14,9,he eg,0,1s,1i,17,9,82 33,0,4j,3,3,9,ag eg,0,3e,3,3,9,cf di,1,3l,3,3,9,8c di,1,3l,3,3,9,h5',
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
