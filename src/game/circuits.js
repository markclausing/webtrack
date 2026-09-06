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
    metres: 3375,
    line: '1hs -231 23p -26e 271 -29r 29c -2by 29y -2bu 29e -2ap 29o -2c2 2ck -2fa 2g2 -2iq 2jn -2m9 2n7 -2pt 2qw -2tg 2ul -2x4 2yd -30u 326 -34m 364 -38g 3a4 -3cb 3e4 -3g9 3i9 -3k5 3mb -3o2 3qe -3rv 3ud -3vl 3y4 -3za 41o -432 44o -46s 473 -49t 484 -4a6 47k -48i 45u -46l 43x -44o 41z -42l 3zu -408 3xg -3xk 3ut -3uk 3s8 -3qu 3pr -3na 3mw -3k5 3ja -3go 3fb -3cw 3b6 -390 37a -353 33l -319 2zt -2xg 2vy -2tm 2s9 -2pu 2om -2m4 2l6 -2il 2hs -2f4 2ef -2br 2az -28b 27i -24u 241 -21d 20m -1xz 1x7 -1uj 1ts -1r3 1qc -1no 1mz -1kb 1jo -1gz 1ge -1do 1bp -1ay 1aa -17r 178 -14i 146 -11f 115 -yd y2 -vb v1 -sa s0 -p8 ox -m6 lw -j5 iu -g3 ft -d1 cx -a5 a0 -79 74 -4c 4f -1n 1v w -o 3g -33 5u -5f 86 -7m ab -9o cd -bk e8 -d9 fu -eg gu -fd hp -ha k1 -jn me -lw om -n8 pk -mz nv -l4 lh -iq j3 -gc gp -dy eb -bk by -97 9l -6u 78 -4i 50 -29 2r -2 o 21 -1c 40 -3a 5y -55 7s -70 9o -8v bj -aq dd -cl f9 -ei h7 -gg ie -gq ex -dg ap -aw 85 -8g 5p -61 39 -3h q -k -28 2e -56 5c -83 8a -b2 b7 -dt ek -h1 ia -jl lw -kh ml -jv ke -hn hu -f2 f0 -c9 bx -96 8t -62 5p -2y 2l 6 -l 34 -4a 6x -7l ac -am de -dn ge -go jf -jo mg -mq ph -pq si -ss vj -vs yj -yt 11l -11v 14m -14v 17n -17v 1an -1ar 1di -1dl 1gd -1gb 1j3 -1iz 1lr -1lk 1ob -1o2 1qt -1qi 1t9 -1sw 1vn -1v9 1y0 -1xj 208 -1zo 22d -21p 24d -23l 268 -25d 27z -271 29m -28m 2b6 -2a2 2ck -2be 2dv -2cm 2f2 -2dq 2g5 -2es 2h5 -2fp 2i1 -2gj 2iv -2hd 2jl -2hy 2k7 -2ij 2kn -2iv 2l0 -2j8 2l8 -2jb 2lb -2je 2lb -2jb 2l6 -2j4 2kw -2ir 2ki -2id 2k0 -2hr 2jd -2h4 2im -2ga 2hq -2fd 2gr -2ec 2fm -2d6 2ee -2bw 2d1 -2ai 2bk -290 2a0 -27e 28a -25o 26h -23t 24k -21w 22j -1zu 20g -1xr 1y7 -1vg 1vw -1t5 1tf -1qo 1qx -1o6 1ow -1m7 1mz -1kc 1l5 -1ih 1j1 -1gb 1gl -1du 1e5 -1be 1bo -18w 196 -16f 16p -13y 147 -11f yy -zi ww -xu wa -ww z7 -xo 109 -zb 121 -11i 146 -14v 171 -18j 18u -1bl 1bh -1e8 1e3 -1gv 1gr -1jj 1je -1m6 1m1 -1os 1oo -1rg 1rb -1u3 1tx -1wp 1wf -1z6 1yu -21l 215 -23w 23e -264 25j -288 27j -2a8 29h -2c5 2bc -2e0 2d2 -2fo 2ep -2ha 2g7 -2ir 2hl -2k4 2ix -2lf 2k4 -2mk 2l6 -2nl 2m6 -2oj 2n0 -2pb 2nq -2q0 2oc -2ql 2ov -2r1 2p9 -2re 2pj -2rl 2pp -2rp 2pq -2rp 2po -2rj 2pg -2ra 2p5 -2qx 2oq -2qf 2o6 -2pt 2nj -2p3 2mq -2o8 2lv -2na 2kv -2m8 2jr -2l1 2ik -2jt 2hc -2il 2g4 -2hd 2ew -2g6 2dp -2ez 2ci -2ds 2ba -2cg 29u -2aq 283 -28z 26c -278 24l -25f 22q -23e 20q -21f 1yp -1z9 1wi -1wz 1u9 -1uq 1s0 -1sh 1pq -1q8 1ni -1o0 1la -1lr 1j0 -1jg 1gq -1h7 1eh -1ez 1c8 -1cm 19v -1a8 17h -17t 151 -15d 12m -12z 108 -10l xu -y7 vg -vt t2 -tf qo -r2 ob -oo ly -md jm -k2 hc -hs f1 -fh cr -d8 ag -as 81 -8d 7g -9y 7v -9d 6m -6y 47 -4k 1t -26 -l 9 -31 2o -5d 4u -6y 58 -6n 49 -5i 31 -48 1q -2u a -17 -1f m -39 2j -58 4o -7e 6z -9p 9e -c6 c5 -ew ez -hr i6 -kx lb -o2 on -rc sy -v6 xe -z2 11a -12y 14s -16v 17i -1a5 1ag -1d8 1dq -1gg 1gy -1jo 1k6 -1mw 1ne -1q4 1qm -1td 1tv -1wl 1x3 -1zt',
    height: '2 2 2 2 4 3 3 3 3 2 1 0 0 0 -1 -1 1 2 5 8 8 9 8 9 a 9 9 9 9 5 2 0 -3 -3 -3 -2 -2 -2 -3 -4 -4 -4 -3 0 0 0 1 0 0 -1 0 2 3 5 6 5 5 3 1 0 -1 -2 -1 -3 -2 -3 -4 -3 -2 -2 0 3 4 6 8 9 a a 9 8 8 7 5 3 0 -4 -4 -6 -7 -7 -6 -6 -5 -4 -1 0 1 5 7 9 a b a c d d c a 9 8 8 5 3 2 1 1 3 6 6 8 8 a c c e e b 9 6 2 -3 -4 -5 -8 -9 -c -e -f -h -e -d -b -b -a -9 -9 -7 -6 -4 -1 0 2 4 3 2 1 1 -1 -1 -3 -3 -4 -4 -3 -3 -2 0 2 3 3 4 5 5 6 6 5 4 5 4 5 5 5 5 3 4 2 1 0 -1 0 -2 -4 -6 -9 -a -c -d -d -b -a -a -9 -8 -6 -1 1 2 1 0 -3 -4 -6 -6 -7 -7 -7 -9 -b -c -9 -5 -1 4 8 9 a 9 8 a 9 9 8 7 5 4 1 0 -1 -1 1 1 0 0 0 -1 -1 -1 0 0 0 0 -2 -2 -2 -2 -2 -2 0 0 1 1 3 3 4 4 4 4 2 1 -1 -3 -5 -6 -7 -a -c -c -d -a -7 -6 -1 0 1 3 4 4 5 5 5 4 3 3 1 0 -2 -4 -4 -6 -7 -7 -7 -7 -7 -8 -8 -9 -9 -7 -4 -2 -1 2 1 2 0 -2 -1 -3 -2 -3 -4 -5 -6 -6 -6 -5 -6 -4 -2 -1 -1 -1 0 0 1 0 1',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111111111111110000000000000000000000111111111111111111111111111111111111111111000001000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: 'p,0,4f,q,p,9,1a r,0,58,26,1f,9,gv w,0,55,b,c,9,cu p,0,4y,r,t,9,a1 x,0,51,c,9,9,gu x,0,58,7,e,9,c1 x,0,4l,q,15,d,7v v,0,4p,h,1b,9,r q,0,4b,1f,18,9,89 v,0,4a,j,n,a,7t w,0,45,j,r,d,92 x,0,44,t,13,d,7x x,0,3l,j,1s,d,gc u,0,33,h,p,d,hc t,0,3u,8,f,9,d7 r,0,3o,k,h,9,8f 3w,0,q,q,r,9,40 43,0,2b,25,z,9,e5 25,0,4q,h,c,16,1w 24,0,4c,r,b,1f,1b 3v,0,1j,m,i,d,e6 3r,0,1j,10,k,d,eq 21,0,55,b,9,6,at 3t,0,t,c,z,9,8p 3u,0,1z,a,a,d,5g 2g,0,2g,l,d,9,2r 20,0,2r,f,d,9,ao 20,0,1e,7,b,d,8t 3f,0,3k,f,d,a,4p 2e,0,38,n,b,q,aa 3h,0,1c,o,n,28,4b 1u,0,40,8,9,d,8p 27,0,2j,d,a,q,5w 20,0,15,3,d,d,8t 1n,0,57,c,e,d,4d 2l,0,t,a,a,a,4r 3n,0,4j,c,9,9,d8 1o,0,34,e,m,9,4j 1g,0,50,6,6,d,4p 20,0,20,7,a,a,hf 3n,0,21,k,f,j,a5 5v,0,42,1e,q,6,7t 21,0,3a,b,9,j,ah 2k,0,z,7,9,g,dh 1g,0,3s,7,9,d,4n 3f,0,21,o,w,g,f 1n,0,2b,8,a,9,4t 5v,0,1n,f,z,29,62 1g,0,4j,c,c,d,4w 21,0,2i,6,6,a,5w 3b,0,i,o,1h,q,76 21,0,27,b,9,d,1r 1u,0,4e,8,9,d,22 5v,0,54,s,a,w,3o 3j,0,4w,1l,1k,q,9l 1p,0,4s,9,g,g,d1 2g,0,26,d,8,a,2o 1f,0,4y,7,a,d,de 1q,0,53,c,9,d,1x 2e,0,1k,y,f,1f,1p 20,0,i,b,b,t,d3 28,0,23,g,a,q,ej 1n,0,4a,7,8,d,4r 1r,0,4t,c,a,g,1w 2g,0,43,b,k,j,9s 2f,0,2u,6,d,6,75 24,0,1c,j,h,d,1i 1v,0,51,h,e,m,as 1y,0,42,8,9,a,1x 5v,0,4u,f,a,9,ca 20,0,v,7,b,d,8t 1o,0,4s,h,h,9,1 1f,0,3d,9,8,9,dd 26,0,h,f,n,1f,8q 2g,0,54,8,6,a,b6 4b,0,2e,10,v,a,h1 1z,0,52,q,j,z,1w 3n,0,33,o,f,9,9u 1o,0,4b,a,e,d,4m 3k,0,1n,o,h,t,6n 3e,0,34,g,i,j,2n 5v,0,3y,1f,10,6,7p 1f,0,2b,o,t,9,4o 2f,0,48,j,f,w,d5 1t,0,41,9,a,d,8n 1f,0,4k,9,a,d,4t 21,0,49,h,f,z,a4 42,0,4k,l,q,1y,59 5v,0,3v,c,b,6,39 1f,0,3a,8,b,9,94 23,0,3d,g,d,d,1r 1n,0,4d,8,8,d,da 1t,0,4m,b,8,d,1y 2g,0,2t,6,7,9,3k 26,0,1t,t,6,a,aa 1i,0,x,v,19,19,7 5v,0,51,p,e,j,3n 3f,0,4q,e,e,d,81 1v,0,42,c,b,a,20 22,0,1m,c,b,a,ac 20,0,3o,d,b,g,al 3d,0,m,q,b,j,ej 1n,0,4q,9,9,d,d6 1h,0,3o,9,c,9,4n 3f,0,39,b,b,6,da 3e,0,20,u,14,9,ao 1n,0,3f,h,h,9,d 22,0,1y,a,a,a,61 2g,0,2k,a,7,9,36 3f,0,4l,1e,z,9,gp 20,0,2g,9,a,a,1 22,0,2x,g,b,m,ad 2g,0,37,8,e,9,5d 5v,0,3u,e,d,6,gc 1n,0,47,9,c,d,92 3g,0,3d,z,q,t,7x 20,0,1o,7,9,d,5 3e,0,3q,c,e,j,fu 2f,0,4i,d,k,m,bn 2i,0,x,9,c,j,4p 1g,0,3j,7,9,9,a 1r,0,45,9,b,g,49 3r,0,3s,f,g,9,5a 2f,0,2f,9,a,j,6h 1h,0,4i,c,h,j,4p 1y,0,4d,a,a,j,el 3j,0,v,c,e,9,79 1f,0,3o,c,b,9,d 28,0,e,8,b,9,47 2g,0,4m,c,b,a,1u 1p,0,44,9,c,g,8q 29,0,4n,i,8,12,9s 3f,0,4f,5,6,9,ch 3f,0,3l,b,e,g,3j 2h,0,2v,9,9,a,4i 3f,0,4u,f,g,a,3l 3f,0,46,d,h,t,3l 27,0,44,n,c,m,a1 3y,0,37,1b,1f,j,9f 5w,0,1s,c,k,9,58 5y,0,4h,i,n,9,cq 5x,0,4r,e,d,9,5f 5x,0,3p,g,g,9,50 5w,0,57,m,y,9,66 5v,0,3x,e,i,9,f5 5w,0,2q,g,m,9,16 2g,0,2v,k,c,9,45 p,0,4n,9,8,9,ef y,0,4b,h,i,9,6q v,0,57,8,c,9,5 s,1,g,b,g,9,4 1p,0,2r,h,p,q,4e 26,0,56,9,a,j,bp 6v,0,t,13,14,d,8f 72,0,4s,21,24,9,dp 5z,0,53,5,8,3,2n 5z,0,3p,3,4,3,2x 5b,0,43,14,1g,6,9s 5n,0,y,e,p,q,89 53,0,22,2i,1e,6,d 44,0,1o,l,j,a,e9 41,0,10,p,j,a,7c 2b,0,d,o,o,1m,gz 8m,1,k,7,8,9,21 p,0,25,2v,47,9,af y,0,4a,3,4,9,29 y,0,3h,6,8,9,f9 46,0,i,1b,r,9,cs 3m,0,i,h,13,d,8e 18,0,4k,q,12,9,k 12,0,12,b,b,9,gz 18,0,25,k,t,9,9y 1w,0,d,d,r,d,8o 1p,0,1b,g,14,9,4e 3m,0,1h,9,9,9,fe 1t,0,34,f,m,9,8o 1r,0,1w,9,b,9,8e 1x,0,2o,j,v,d,49 1b,0,53,b,c,d,48 1b,0,4n,a,a,d,cy 1c,0,4l,8,8,d,4f 1c,0,58,c,e,d,4a 1b,0,1k,b,9,d,8t 1b,0,1w,5,9,d,92 1b,0,21,6,9,d,c 1b,0,2b,a,b,d,91 1b,0,2n,8,9,d,94 1b,0,2x,7,9,d,95 1b,0,35,7,7,d,92 1b,0,3i,8,b,d,da 1b,0,3x,8,a,d,d1 1c,0,1h,a,d,9,4h 1c,0,22,9,b,d,4f 1c,0,2q,c,h,d,4g 1c,0,3l,d,n,d,d7 z,0,1q,z,14,9,c 17,0,y,11,o,9,h6 1n,0,1v,d,d,9,e 1b,0,t,9,b,9,d7 1j,0,2h,4,5,9,fc 1j,0,2p,3,3,9,a 80,1,j,h,i,9,hb 7x,1,d,b,m,9,2 84,1,d,h,u,9,hd 3f,0,46,9,7,a,cc 3f,0,c,7,e,d,t 3l,0,2j,9,8,9,fj n,0,3q,5,6,9,5f 3l,0,12,a,a,9,fw 7i,0,2q,13,23,9,d9 1s,0,23,8,c,9,46 1w,0,17,g,m,q,8g 1s,0,r,a,k,1f,8y 60,0,37,12,11,6,a3 61,0,32,15,15,1q,11 y,0,4p,8,6,9,ck y,0,4g,e,j,9,5r 4o,0,w,8,7,9,7u 5v,0,32,s,p,6,3g 23,0,58,a,5,d,an 3f,0,2m,b,c,j,7 5y,0,32,k,u,9,cs 26,0,14,e,9,9,1g 17,0,3o,r,m,d,9c 14,0,34,i,o,d,6j u,0,3t,c,f,d,he t,0,3q,f,d,9,d7 v,0,44,4,5,9,d0 1b,0,45,5,5,d,8u 45,0,29,k,n,9,ea 47,0,1t,r,v,9,gx 3f,0,44,h,i,a,7v 2g,0,59,7,7,6,cs 5z,0,4k,3,3,3,ha 1f,0,j,b,e,9,1 1e,0,14,j,10,j,dc 25,0,2t,f,f,g,1s 5v,0,3y,r,g,9,7p 1o,0,42,b,f,9,4j 9d,1,p,3,4,a,0 1t,0,16,b,e,9,8f 24,0,2f,d,5,9,ak 1v,0,26,f,i,j,8i 21,0,3k,a,5,9,1s 1s,0,d,5,9,9,cz 1p,0,d,a,h,9,0 o,0,t,i,h,9,3w 49,0,2m,7,9,9,5r 7s,0,q,3,4,9,4f 3n,0,3g,6,9,9,4s 4c,0,51,7,6,9,b4 4i,0,4u,3,3,9,fv 4l,0,3u,c,b,9,gb 60,0,4q,29,1a,d,a3 60,0,1w,h,e,9,5p 5z,0,3h,b,b,9,3n 69,0,29,y,w,1q,9j 3r,0,4t,i,k,9,u 5z,0,2k,3,3,9,gp 5z,0,32,3,3,9,ad 6r,0,o,6,7,9,bm 19,0,2w,9,c,9,9m 60,0,r,3,4,9,5u',
    boats: '93,0,x,u,en 93,0,1o,12,en 8v,0,1a,x,dj 8s,0,1s,g,cz 8w,0,1p,r,3y 92,0,17,z,6g 94,0,18,11,4j o,0,98,g,cm o,0,93,i,h8 o,0,8s,p,3v 2,0,2j,v,3e 3,0,2d,n,1j 2,0,1y,12,ca 3,0,z,k,1k 3,0,1r,i,1k 3,0,1d,q,aa o,0,7r,11,cl o,0,7h,k,cr o,0,71,l,cr o,0,6u,s,41 o,0,5i,j,co o,0,65,v,co o,0,5x,h,co n,0,6l,13,e6 o,0,60,x,3y o,0,4o,m,cp o,0,4a,k,cp n,0,51,11,e7 n,0,4y,q,e7 n,0,5o,12,e7 2,0,52,p,by n,0,57,11,5h n,0,5e,v,5h n,0,4l,10,5h o,0,4t,l,3z o,0,49,l,3z 7m,0,4w,11,4a 7o,0,4a,z,4b 7p,0,4q,h,hd 7r,0,5d,m,hc 7l,0,4g,j,d1 7b,0,1w,13,g 78,0,22,13,l 76,0,2v,j,dr 77,0,28,m,9b 75,0,1r,q,9f n,0,r,10,e4 n,0,1m,r,e4 l,0,1q,t,fh g,0,26,g,9z n,0,13,12,5e o,0,21,p,cp m,0,2c,u,fa o,0,1e,p,3z 94,0,26,n,da 94,0,2w,x,da 8s,0,2h,q,c2 93,0,2e,k,5x 94,0,2l,h,4k 94,0,1x,o,4k 80,0,14,t,hf 81,0,1r,l,hf 7z,0,2c,j,hf 81,0,2z,l,hf 7z,0,3k,k,hf 72,0,2f,f,9b 73,0,2s,i,5a 74,0,1z,12,du 72,0,1p,11,e0 x,0,8b,13,c3 x,0,7n,m,c3 x,0,7i,z,3e x,0,84,g,3e o,0,2x,r,cl n,0,2p,z,e3 n,0,3f,m,e3 n,0,2z,h,9r n,0,3u,r,37 n,0,39,n,5d o,0,2m,x,8b 7t,0,r,h,d9 7r,0,x,z,8v 68,0,1b,10,5d',
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
    // One band of ground and no more.
    //
    // Two reached thirty-two metres either side, which is sixty-four metres of
    // apron on a street where the buildings start at the kerb - and where the
    // lap comes back past itself it was drawn as a shelf hanging over the road
    // below. There is nothing beside this road but pavement and then a wall, so
    // that is all it draws.
    land: { rise: 0.5, roll: 0.3, plain: -1.2, runoff: 1.6, reach: 1,
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
    metres: 6290,
    line: '-hbx r73 -r7k rab -ras rdj -re0 rgq -rh7 rjy -rkf rn5 -rnm rqd -rqu rtk -ru1 rws -rx9 rzz -s0g s37 -s3o s6e -s6v s9m -sa3 scu -sdb sg1 -sgi sj9 -sjp smf -smv spm -sq2 sst -sta sw0 -swg sz7 -szn t2e -t2l t5c -t5i t8a -t8h tb9 -tbc te4 -tf6 thm -tk4 tlb -tnv toy -tri tsl -tv4 tw9 -tyq u00 -u26 u3v -u5w u7t -u9p ubq -udg ufm -uh2 ujg -ukj un2 -uo2 uqo -urb uu0 -uuf ux6 -uxg v07 -v04 v2w -v2m v5d -v4v v7m -v6w v9k -v8j vb4 -v9u vcb -vav vd8 -vbj vdq -vc1 ve8 -vcw vfc -vea vgu -vfy vik -vi1 vks -vkg vn7 -vn3 vpv -vq3 vsu -vti vw7 -vwy vzn -w0e w32 -w3t w6h -w78 w9x -waq wdd -wei wh1 -wim wkv -wmt wos -wqw wsp -wv0 wwj -wyv x0e -x2j x4a -x68 x87 -x9r xc2 -xd5 xfo -xg8 xiy -xj5 xlx -xlw xoo -xom xre -xrc xu4 -xu2 xwu -xws xzj -xzi y2a -y29 y51 -y51 y7t -y7o yag -y9v ycl -ybn ye9 -ycv yf9 -ydm yfu -ydv yfu -ydo yfe -ycx ye6 -ybk ych -y9u yaq -y85 y94 -y6m y7t -y5g y6x -y4v y6q -y52 y7a -y5x y8b -y7f ya2 -y9m ycc -yc2 yeu -yei yh9 -ygv yjm -yj6 ylx -yld yo3 -yni yq8 -yph ys5 -yrb yty -ysx yvi -yug yx0 -yvw yyg -yxg z01 -yz3 z1p -z0y z3m -z30 z5q -z56 z7w -z7i za9 -za1 zct -zcl zfc -zf7 zhz -zhv zkn -zki zna -zn6 zpy -zpw zso -zso zvg -zvf zy7 -zy7 100z -1012 103u -103y 106q -106t 109l -109q 10ch -10cn 10ff -10fl 10id -10ij 10lb -10lg 10o8 -10od 10r5 -10ra 10u2 -10u7 10wy -10x3 10zv -10zz 112r -112w 115o -115t 118l -118p 11bh -11bm 11ee -11ei 11ha -11hf 11k6 -11kd 11n5 -11nb 11q3 -11q9 11t1 -11t7 11vz -11w5 11yx -11z3 121u -121y 124q -124t 127l -127p 12ah -12am 12de -12dk 12gc -12gj 12jb -12jh 12m8 -12me 12p6 -12pp 12sf -12tc 12vy -12xc 12zr -131o 133o -135r 137k -139x 13bc -13dy 13ew -13hl 13i7 -13kz 13l0 -13nr 13nc -13py 13p1 -13rh 13q7 -13sf 13qs -13so 13qm -13s4 13pt -13qv 13oa -13p3 13mg -13n3 13kd -13ks 13i2 -13i8 13fg -13ff 13cn -13ch 139p -1398 136i -135s 1333 -1325 12zj -12ye 12vv -12uj 12s3 -12qo 12ob -12mv 12kh -12j1 12gn -12f5 12ct -12bb 1290 -127h 1255 -123n 121b -1200 11xk -11wg 11tw -11sw 11qa -11pd 11mr -11m2 11jd -11is 11g3 -11fm 11cv -11ci 119r -119j 116r -116l 113u -113s 1110 -110z 10y7 -10y9 10vh -10vo 10sw -10t6 10qf -10qs 10o0 -10og 10lq -10mf 10jq -10kg 10hr -10ij 10fv -10gr 10e5 -10f7 10cm -10dt 10bb -10cj 10a1 -10bc 108w -10a7 107r -1092 106m -107t 105a -106b 103q -104n 1021 -102r 1003 -100r zy1 -zyl zvv -zw7 ztg -ztn zqw -zqw zo4 -zo3 zlb -zlc zik -zj6 zgg -zhm zf4 -zgs zek -zgn zet -zh5 zfo -zi9 zh9 -zjy zjc -zlz zl4 -znq zmr -zp6 znt -zpy zo7 -zq6 zo7 -zpw znq -zp3 zmn -znk zky -zlo zj0 -zjj zgt -zh7 zeg -zet zc2 -zcd z9l -z9r z6z -z75 z4e -z4f z1n -z1k yys -yyn yvv -yvn ysv -ysk ypt -ypg ymp -yma yjj -yiy yg8 -yfm ycx -yc8 y9j -y8r y63 -y59 y2m -y1n xz1 -xxy xve -xub xrr -xqo xo3 -xn1 xkh -xje xgu -xfr xd7 -xc4 x9k -x8j x5y -x4w x2b -x1b wyq -wxr wv5 -wu6 wrl -wqp wo2 -wna wkm -wjv wh7 -wgk wdu -wde wao -wa8 w7h -w71 w4a -w41 w1a -w13 vyb -vya vvi -vvi vsq -vsr vpz -vq4 vnc -vnh vkp -vkt vi1 -vi2 vfa -vf9 vci -vcd v9l -v9f v6n -v6d v3l -v3b v0k -v02 uxb -uws uu2 -utf uqq -uq3 une -umk ujw -uj0 uge -ufd ucs -ubp u95 -u80 u5h -u48 u1q -u0g txz -twh tu5 -tso tqc -tov tmi -tl1 tio -th7 teu -tdg tb2 -t9o t79 -t5y t3i -t27 szq -syi sw1 -sut ssb -sr8 soo -snp sl3 -skb shn -sgw se8 -sdh sat -sa6 s7g -s6w s46 -s3m s0w -s0d rxn -rx6 rug -ru3 rrc -rr0 ro8 -ro2 rla -rl4 rid -ri8 rfg -rfd rcl -rcn r9v -r9y r76 -r78 r4g -r4k r1s -r1z qz7 -qzi qwr -qx2 qua -qup qrz -qsg qpp -qq9 qnj -qo5 qlg -qm2 qjc -qjz qha -qi5 qfi -qg4 qde -qdj qas -qac q7m -q6n q41 -q2p q0a -pyl pwe -puc psh -pqb pol -pmd pkp -pij pgs -pep pcv -pb1 p8y -p7g p54 -p3u p1d -p0b oxr -owz oub -otp oqz -oqd ono -on2 okc -ojp oh0 -ogg odq -od6 oag -o9y o78 -o6y o46 -o4b o1j -o1v nz4 -nzq nx1 -ny2 nvh -nwp nu7 -nvh nt0 -nu9 nrs -nt2 nql -nru npd -nqo no8 -npi nn1 -nob nlu -nn4 nko -nlz nji -nks nib -njl nh5 -nig nfz -nh9 net -ng1 ndj -neq nc7 -nd8 nao -nbp n94 -na0 n7d -n88 n5l -n6d n3p -n4c n1n -n2b mzm -mzz mx7 -mxl muu -mv8 msh -msn mpw -mq1 mn9 -mnb mkj -mke mhm -mhi meq -meg mbo -mbd m8m -m87 m5g -m4x m27 -m1m lyw -ly6 lvi -lus ls3 -lrd lop -lo5 llf -lkv li5 -lhl lev -leb lbl -lax l88 -l7i l4t -l42 l1e -l0n kxz -kx4 kuh -ktl kqy -kq1 kne -kmi kjw -kiw kga -kfa kcp -kbp k94 -k80 k5g -k4c k1t -k0m jy3 -jww jue -jt4 jqn -jp9 jmv -jlh jj2 -jhl jf8 -jdr jbf -j9x j7k -j62 j3q -j28 izw -iy8 iw0 -iuc is4 -iqg io8 -imk ikc -iio igg -ien ick -iao i8l -i6q i4o -i2o i0r -hyr hwu -hut hsx -hqw hoz -hmx hl2 -hix hh5 -hf0 hd9 -hb2 h9c -h75 h5g -h37 h1l -gzc gxp -gvg gtt -gri gpz -gno gm4 -gjt gi9 -gfy gee -gc4 gaj -g88 g6n -g4d g2s -g0j fyx -fwn fv2 -fss fr6 -fow fna -fkz fjg -fgw ffu -fd4 fco -f9x fa7 -f7m f8l -f6f f85 -f6a f8b -f6z f9e -f8o fbc -fbi fe9 -ff0 fho -fie fl3 -flt foh -fp7 frw -fsm fvb -fw0 fyo -fze g23 -g2p g5e -g60 g8q -g9b gc1 -gcl gfb -gfv gil -gj5 glv -gmd gp3 -gpk gsb -gss gvi -gvz gyq -gz7 h1x -h2d h54 -h67 h8d -hb4 hao -hdd hcq -hf1 hf9 -he5 hgp -hfm hi5 -hh1 hjl -hii hl2 -hjz hmj -hmp hpf -hpz hsp -hta hw0 -hwk hz9 -hzu i2k -i34 i5u -i6g i96 -i9t ici -id4 ifu -igg ij5 -ijr imh -in3 ips -iqe it4 -its iwh -ix4 izt -j0h j36 -j3y j6m -j7f ja3 -jaw jdk -jef jh2 -jhx jkk -jlg jo3 -joy jrl -jsg jv3 -jvz jym -jyg k0y -jyb jz3 -jwd jwz -jua jux -jt2 jue -jwv jxx -k0m k1a -k3z k4n -k7c k7z -kaf kbp -kcz kfc -kg9 kiw -kjt kmf -knc kpy -kqv kti -kuf kx1 -kxy l0l -l1i l44 -l51 l7n -l8k lb7 -lc4 leq -lfm li9 -lj6 lls -lmp lpb -lq8 lsv -lts lwe -lxb lzy -m0v m3h -m4e m71 -m7x maj -mbf me2 -mey mhl -mih ml3 -mlz mom -mpj ms6 -mt2 mvp -mwl mz7 -n03 n2q -n3m n69 -n75 n9r -nan nda -ne6 ngt -nhq nkc -nl8 nnv -nor nre -nsa nux -nvt nyf -nzc o1z -o2v o5h -o6e o91 -o9x ock -odg og2 -ogz ojm -oki on4 -oo1 oqo -ork ou7 -ov3 oxp -oym p19 -p24 p4r -p5l p88 -p98 pbt -pdj pfn -pia piy -pll pku -pnb pm3 -poo pnn -pqd pqe -psv pu5 -pvy py0 -pyx q1i -q1f q46 -q3s q6j -q5y q8o -q82 qas -q9w qcj -qbn qe9 -qd8 qft -qes qhd -qgk qj7 -qii ql7 -qko qne -qmz qpq -qpj qsb -qs9 qv1 -qv2 qxu -qy2 r0t -r16 r3y',
    height: '2x 0 -1 -1 -1 -2 -2 -1 -2 -1 -2 -1 -1 -1 0 0 0 1 1 1 0 -1 -1 -1 -1 0 -1 -1 -1 0 -1 -1 -1 1 2 3 2 3 3 2 1 0 -1 0 -2 -1 -3 -3 -3 -4 -4 -6 -4 -3 -1 0 0 1 3 2 2 3 3 3 3 2 2 2 0 0 -2 -3 -4 -6 -5 -5 -6 -4 -3 -3 -2 -2 0 0 0 3 4 4 4 4 3 1 2 0 -1 -4 -5 -7 -8 -a -a -8 -7 -5 -3 -2 1 2 5 7 a a a a a 7 6 6 4 3 2 2 1 1 0 1 0 2 2 1 2 1 1 1 0 0 0 0 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 -1 -1 0 0 0 0 2 1 2 1 2 0 1 0 0 -1 -2 -1 -2 -3 -3 -3 -3 -3 -3 -1 -1 -1 1 1 0 0 1 0 0 0 0 0 -1 -2 0 -2 -2 0 0 0 0 1 2 1 2 2 3 3 3 3 3 1 2 1 0 -1 -1 -1 -2 -2 -2 -2 -2 -3 -2 -3 -3 -4 -4 -3 -2 -3 -1 -2 -1 -2 -1 -1 1 1 3 3 2 2 3 1 1 1 0 1 1 -1 -1 -1 -2 -4 -3 -3 -3 -2 -2 0 0 0 3 1 2 2 2 3 4 3 3 3 3 2 2 2 2 3 4 5 3 3 2 2 0 -1 -1 -3 -3 -3 -3 -4 -4 -4 -3 -3 -4 -2 -2 -2 -1 -1 -1 -1 0 -1 1 0 1 1 2 1 2 1 1 1 0 0 0 0 -2 -1 -2 -2 -3 -2 -1 -1 0 1 1 2 3 4 3 4 3 2 1 0 0 -3 -3 -4 -4 -5 -5 -6 -3 -4 -3 -1 0 1 0 1 2 1 2 1 2 1 2 2 1 2 1 3 3 3 3 4 3 2 1 2 1 1 1 1 0 0 0 1 0 0 0 1 1 0 -1 -1 0 -1 -2 -1 -3 -1 -2 0 -1 0 1 0 1 1 0 1 0 1 1 1 1 0 0 0 0 0 0 1 0 0 -1 0 -2 -2 -3 -2 -2 -3 -2 -1 -2 -1 0 0 1 2 2 1 2 2 1 2 1 2 2 2 3 2 1 1 1 1 1 0 1 0 -1 -1 -2 -2 -2 -2 -1 -1 -1 -1 -1 0 0 1 1 1 1 0 1 2 1 2 1 2 1 0 1 1 1 0 0 0 -2 -1 -2 -2 -1 -1 -1 0 0 0 1 2 0 2 1 1 1 2 2 1 1 0 -1 -2 -3 -2 -3 -3 -1 -2 -3 -2 -2 -2 -1 -2 -1 0 0 0 0 0 0 0 0 0 0 0 2 2 2 0 2 1 1 1 0 0 0 0 0 -1 -1 -1 0 -1 0 0 1 1 1 2 2 2 0 0 0 -2 -1 -2 -2 -3 -3 -4 -2 -2 -2 0 -1 0 1 0 0 1 1 1 0 -1 -2 -1 -2 0 0 0 1 1 1 0 1 0 0 0 0 0 -1 -2 -2 -1 -2 -1 -1 -1 1 2 1 2 2 3 3 3 3 3 3 3 2 2 0 0',
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
    metres: 6621,
    line: '-e6 -3nh 3kp -3kk 3hs -3hn 3ev -3er 3bz -3bu 392 -38x 365 -360 339 -335 30d -308 2xg -2xb 2uj -2ue 2rm -2ri 2oq -2ol 2lt -2lo 2iw -2ir 2fz -2fu 2d2 -2cy 2a6 -2a1 27a -275 24d -248 21g -21c 1yk -1yf 1vn -1vi 1sq -1sl 1pt -1pp 1mx -1ms 1k0 -1jv 1h3 -1gy 1e6 -1e1 1ba -1b6 18e -189 15h -15c 12k -12f zn -zj wr -wm tu -tp qx -qs o0 -nw l4 -kz i7 -i3 fc -f8 cg -cc 9k -9f 6n -6j 3r -3n v -r -21 26 -4y 52 -7u 7z -ar aw -do dt -gl gq -jh jm -me mj -pb pf -s7 sc -v4 v9 -y1 y6 -10y 112 -13u 13y -16q 16u -19m 19q -1ci 1cm -1fe 1fh -1i9 1id -1l4 1l8 -1o0 1o4 -1qw 1qz -1tr 1tv -1wn 1wr -1zj 1zn -22f 22j -25b 25e -286 288 -2az 2ao -2cs 2b3 -2bo 290 -28c 25o -244 21u -1zo 1xx -1vo 1u2 -1rs 1q7 -1nx 1mc -1k2 1ig -1g5 1el -1ca 1ap -18f 16v -14h 131 -10j zd -wq vv -t4 ss -q1 pu -n2 nb -kl l2 -ie j5 -gn hw -ff go -e6 fe -cx e5 -bm ct -ab bi -8z a5 -7m 8t -68 78 -4n 5m -2z 3u -15 1x s -9 30 -2j 5b -58 80 -7x ap -ar dj -dl gc -gs ji -jy mn -nc q1 -qq tc -ub wu -xy 10c -11s 145 -15l 17z -19e 1bs -1d8 1fl -1h1 1jf -1ku 1n7 -1on 1r1 -1sh 1uu -1wa 1yo -204 22i -23x 26a -27q 2a4 -2bk 2dx -2fd 2hr -2j7 2lk -2n0 2pe -2qt 2t6 -2um 2x0 -2yg 30u -329 34n -362 38f -39v 3c9 -3dp 3g3 -3hj 3jw -3lb 3np -3p5 3rj -3sz 3vc -3wr 3z5 -40l 42y -44e 46r -487 4al -4c1 4ee -4fv 4i9 -4jp 4m2 -4ni 4pv -4rb 4tp -4v5 4xi -4yy 51c -52s 555 -56l 58y -5ae 5cs -5e8 5gl -5i2 5kf -5lv 5o8 -5pp 5rn -5tl 5ud -5wz 5wn -5zd 5xp -5zw 5xu -5zq 5xj -5z8 5x1 -5yq 5wk -5yb 5w5 -5xv 5vv -5xt 5w0 -5y4 5wq -5z3 5yb -60z 60t -63k 63u -66m 673 -69t 6af -6d5 6d4 -6fw 6fk -6ib 6hk -6k8 6ja -6lw 6kq -6n9 6lo -6nx 6lz -6nz 6lz -6nv 6ll -6n7 6kw -6mg 6jz -6l8 6ir -6k0 6hg -6ik 6g0 -6h2 6ee -6f8 6ck -6db 6al -6b6 68g -690 669 -66n 63v -642 61b -61f 5yn -5yo 5vw -5vn 5sw -5sl 5pu -5pc 5mn -5m0 5jb -5im 5fz -5f5 5cj -5bk 58y -57z 55j -549 51t -50h 4y2 -4wo 4ub -4sv 4qh -4p1 4mn -4l8 4iv -4hf 4f1 -4dl 4b8 -49s 47f -45y 43l -425 3zr -3yb 3vy -3ui 3s5 -3qo 3oa -3mu 3kh -3j1 3go -3f7 3cu -3be 390 -37k 357 -33r 31e -2zx 2xk -2w4 2tq -2sa 2px -2og 2m3 -2kn 2ia -2gt 2ec -2d3 2ai -29k 26t -26a 23j -23a 20i -20h 1xp -1xx 1v6 -1vm 1sz -1tu 1rc -1sj 1q7 -1ro 1pe -1r0 1or -1qd 1o3 -1pp 1ne -1oy 1mj -1nu 1l7 -1m4 1jf -1k2 1hb -1hn 1ev -1et 1c2 -1bm 18z -187 15n -14k 126 -10s ym -ww ut -sy qy -p1 n1 -l3 j3 -h6 f6 -d9 ax -9e 6u -5s 36 -28 -h 14 -3w 46 -6y 6x -9o 9e -c4 bk -e9 dk -g8 ff -hz gx -jg ib -ko j7 -lj k0 -lz k2 -lz jz -lm jd -kr id -jk h2 -hz fc -fv d5 -dd am -al 7t -7a 4k -3o 11 j -2t 4z -6p 96 -af d5 -dh g9 -g0 ir -if l6 -kt nl -na q2 -pw so -so vf -vm ye -yp 11f -11x 14n -159 17y -18k 1ba -1bw 1el -1f8 1hy -1ik 1l9 -1lv 1ol -1p6 1rw -1sh 1v7 -1vs 1yh -1z3 21t -22e 255 -25j 28a -28l 2bd -2bh 2e9 -2ea 2h2 -2h3 2jv -2js 2mk -2mh 2p9 -2p6 2ry -2rw 2uo -2ul 2xd -2xa 302 -2zz 32r -32o 35g -35d 385 -382 3au -3ar 3dj -3dh 3g9 -3g6 3iy -3iv 3ln -3lk 3oc -3o9 3r1 -3qy 3tq -3tn 3wf -3wd 3z5 -3z2 41u -41r 44j -44g 478 -476 49y -49z 4cq -4d1 4fr -4ga 4iz -4jm 4mb -4n1 4pp -4qi 4t4 -4u1 4wn -4xk 507 -515 53r -54p 57b -589 5av -5bs 5ef -5fb 5hy -5iu 5lg -5mc 5oz -5pw 5sh -5th 5w3 -5x1 5zp -60j 636 -63z 66n -67h 6a5 -6ay 6dm -6eb 6h0 -6hq 6kf -6l3 6nt -6oc 6r2 -6rl 6ud -6uo 6xf -6xq 70i -70r 73j -73r 76i -76p 79h -79g 7c8 -7c8 7f0 -7ey 7hq -7hj 7kb -7k4 7mw -7mo 7pf -7p6 7rx -7ri 7u9 -7tu 7wl -7w5 7yt -7y4 80t -804 82s -81z 84n -83v 86i -85o 88b -87f 8a1 -892 8bo -8aq 8dc -8cd 8ez -8e1 8gm -8fn 8i9 -8hb 8jx -8iy 8lk -8kl 8n7 -8m9 8ov -8nw 8qh -8pj 8s5 -8r4 8tp -8sq 8vc -8ud 8wz -8w1 8yn -8xo 90a -8zb 91w -90y 93k -92l 957 -949 96v -95w 98h -97i 9a4 -993 9bo -9ao 9d9 -9c8 9er -9dn 9g7 -9f2 9hl -9gh 9j0 -9hu 9kd -9j7 9lp -9ki 9mz -9lq 9o8 -9mz 9pf -9o4 9qk -9p8 9rl -9q5 9sj -9r4 9ti -9s2 9ug -9t1 9ve -9ty 9wc -9uw 9xa -9vv 9y8 -9ws 9z6 -9xq a04 -9yp a12 -9zm a1u -a06 a1w -9zr a0b -9xn 9wr -9u6 9ry -9qc 9ny -9mj 9k6 -9ip 9gc -9eu 9cm -9b0 98y -972 95e -936 925 -8zl 8yu -8w6 8w3 -8tb 8tl -8qu 8rl -8ox 8q7 -8nr 8pp -8nq 8q3 -8op 8re -8qr 8tj -8te 8w6 -8w8 8z0 -8z1 91t -91v 94n -94o 97g -97f 9a3 -99c 9bq -9ac 9cf -9al 9ca -9a3 9bj -996 9aj -984 99h -972 98f -95z 978 -94s 94o -920 8zn -8yd 8vq -8ut 8tu -8rf 8ry -8p8 8px -8n8 8nx -8l8 8lx -8j8 8jy -8ha 8hz -8fa 8g0 -8db 8du -8b4 8a8 -87p 85b -83z 819 -80v 7y3 -7xx 7v5 -7v1 7s9 -7s5 7pd -7p9 7mh -7mc 7jk -7jg 7go -7gk 7ds -7dn 7av -7ar 77z -77v 753 -74y 726 -722 6zb -6z7 6wf -6wa 6ti -6te 6qm -6qi 6nq -6nl 6kt -6kp 6hx -6ht 6f1 -6ew 6c4 -6c0 698 -694 66c -668 63g -63b 60j -60f 5xo -5xk 5us -5un 5rv -5rr 5oz -5ov 5m3 -5ly 5j6 -5j2 5ga -5g6 5de -5d9 5ah -5ad 57l -57h 54p -54k 51s -51o 4yw -4ys 4w0 -4vv 4t4 -4t0 4q8 -4q4 4nc -4n8 4kg -4kb 4hj -4hj 4er -4er 4bz -4c0 498 -498 46g -46g 43o -43o 40w -40x 3y5 -3y5 3vd -3vd 3sl -3sl 3pt -3pu 3nv -3nz 3qn -3rh 3u5 -3uy 3xl -3yf 412 -41w 44j -45g 483 -48z 4bl -4ch 4f4 -4g1 4im -4jm 4m7 -4n8 4pt -4qu 4tc -4uj 4x3 -4y8 50g -51y 53d -55p 56b -591 59f -5c6 5cd -5f4 5f7 -5hz 5i1 -5kt 5kv -5nn 5np -5qh 5qj -5tb 5td -5w5 5w7 -5yz 5z1 -61t 61v -64n 64p -67h 67h -6a9 6a3 -6cv 6ck -6fb 6eo -6hd 6gh -6j4 6i6 -6ks 6jy -6ml 6lv -6ok 6o8 -6qz 6qv -6tn 6tm -6we 6wd -6z5 6z5 -71x 71t -74l 74f -777 771 -79s 79l -7cd 7c7 -7ez 7ez -7hr 7ht -7kl 7kn -7nf 7ng -7q8 7qa -7t2 7t4 -7vw 7vo -7yf 7xw -80m 7za -81p 7zq -81o 7za -80m 7y2 -7z7 7wo -7xt 7va -7wf 7tw -7v2 7tb -7vf 7ux -7xn 7xx -80p 80w -83o 83b -861 84p -86z 86p -83x 83o -80x 80n -7xv 7xm -7uv 7um -7ru 7rk -7ot 7ok -7ls 7li -7iq 7ih -7fq 7fg -7co 7cf -79o 79f -76n 76d -73m 73d -70l 70b -6xj 6xa -6uj 6u9 -6rh 6r8 -6oh 6o8 -6lg 6l6 -6ie 6i5 -6fe 6f4 -6cc 6c3 -69c 693 -66b 661 -63a 631 -609 5zz -5x7 5wy -5u7 5tx -5r5 5qw -5o5 5nw -5l4 5ku -5i3 5hu -5f2 5es -5c0 5br -590 58q -55y 55p -52y 52p -4zx 4zn -4ww 4wn -4tv 4tl -4qt 4qk -4nt 4nj -4kr 4ki -4hr 4hi -4eq 4eg -4bp 4bg -48o 48e -45m 45d -42m 42d -3zl 3zb -3wk 3wb -3tj 3t9 -3qi',
    height: '2g 5 4 2 1 -1 -1 -3 -3 -6 -7 -7 -5 -5 -4 -3 0 0 1 2 2 2 3 2 1 1 0 -1 -3 -3 -3 -3 -3 -3 -3 -3 -4 -3 -3 -2 1 2 2 1 3 2 2 3 3 3 3 2 1 0 -1 -2 -2 -3 -1 -2 -2 -2 -1 -1 0 1 1 3 3 3 2 2 1 2 1 2 0 0 -1 -1 -2 -2 -1 -2 -1 -2 -4 -3 -3 -4 -4 -3 -3 -3 -3 -1 -1 0 1 1 2 2 3 3 1 2 1 1 0 -1 -1 -1 -1 -1 0 0 0 3 2 3 3 4 5 5 6 7 8 6 4 2 0 -1 -3 -2 -2 -3 -2 -3 -3 -4 -2 0 2 3 3 5 4 2 1 1 0 -1 -1 -3 -4 -5 -7 -6 -7 -7 -7 -5 -5 -3 -2 -1 -1 0 1 3 2 3 2 3 0 -2 -3 -4 -4 -4 -4 -4 -3 -2 0 1 3 4 5 7 6 6 5 5 4 2 1 0 -2 -1 -2 -2 -3 -3 -2 -1 -1 1 1 3 3 4 3 3 3 4 3 1 2 1 0 1 0 0 -1 -1 0 0 0 0 1 1 0 1 0 1 0 1 1 -1 -1 -1 -3 -2 -3 -2 -2 -1 -2 -1 0 0 1 2 2 3 3 4 4 2 2 0 -2 -2 -3 -4 -5 -7 -6 -6 -6 -5 -5 -3 -2 -2 -1 0 1 2 2 3 3 3 2 3 1 1 1 0 0 1 0 2 1 1 2 1 2 1 3 2 2 3 1 2 2 1 1 0 0 -1 -1 -2 -3 -4 -5 -5 -5 -5 -3 -3 -3 -1 -1 -1 0 0 1 1 0 2 2 1 2 1 2 2 3 3 4 4 4 5 4 2 1 0 -1 -1 -3 -3 -3 -2 -2 -1 -1 -1 1 2 1 2 2 2 2 0 0 -2 0 -2 -2 -2 -2 -2 -4 -3 -3 -2 -2 0 0 1 2 2 2 2 1 0 1 0 0 0 -1 -1 -2 -3 -4 -3 -3 0 0 1 2 1 1 0 -1 -1 0 -1 -2 0 -2 -2 -2 -1 0 2 2 3 3 3 3 1 1 0 -1 0 -2 -2 -3 -3 -2 -2 -3 -3 -2 -2 0 1 2 1 2 1 1 2 1 3 4 5 4 2 3 2 3 2 2 3 3 2 1 1 1 1 1 -1 -2 -2 -2 -3 -5 -5 -7 -7 -8 -8 -7 -5 -4 -1 0 0 3 4 4 6 7 8 8 7 7 6 5 4 3 1 1 0 0 -1 0 -1 -2 -1 -2 -1 -3 -2 -2 -2 -3 -2 -2 -3 -2 -2 -1 -2 0 0 0 0 1 2 1 1 1 0 -1 -2 -1 -2 0 0 0 2 1 -1 -1 -1 -2 -1 -1 -1 -1 -1 0 -1 -2 0 2 2 3 4 4 4 4 2 2 0 0 0 0 -1 -1 -2 -1 -2 -1 -2 0 0 0 0 0 1 1 1 1 1 0 0 -1 -1 -3 -4 -5 -5 -6 -7 -6 -7 -5 -4 -2 -1 2 3 3 5 5 6 7 6 7 6 5 5 4 3 2 3 3 3 1 1 1 1 0 0 0 -1 -2 -2 -5 -5 -5 -7 -7 -6 -6 -5 -4 -3 -2 -3 -1 1 2 2 3 4 4 3 2 2 0 -1 -1 -1 0 0 0 0 2 2 3 5 6 9 8 8',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '80,1,4l,8,s,7,h 7z,1,4q,a,i,7,he dv,1,4p,r,p,d,2z 85,1,36,c,i,6,8x a3,1,55,8,a,4,c5 84,1,49,f,p,a,2y f,1,3v,8,6,4,4d 1p,1,3u,c,7,4,4e 1s,1,54,9,a,4,2q j,1,3v,7,6,4,4d ep,1,4w,8,a,5,hd 15,1,53,9,d,4,3m 1d,1,4z,8,8,4,7o 2,1,4u,b,7,4,95 22,1,56,8,9,4,20 ek,1,3r,9,b,5,d3 ev,1,4d,c,a,5,fv 12,1,55,a,9,4,51 1r,1,3t,9,6,4,d3 1i,1,3u,b,7,4,4c 1k,1,3u,8,8,4,4c 1b,1,3v,6,8,4,0 eh,1,50,8,a,5,h9 er,1,4w,8,9,5,8o 8,1,3t,a,a,4,4c d,1,56,9,8,4,8z 1g,1,3v,6,a,4,8p 12,1,3v,8,6,4,4d e8,1,3r,8,b,5,d2 er,1,3t,9,b,5,d8 d,1,3v,7,6,4,4b 19,1,3t,9,6,4,4c 1x,1,3w,c,9,4,1 h,1,3u,8,6,4,d2 eu,1,3y,b,a,5,ez 14,1,3s,9,6,4,4c y,1,51,8,8,4,bp h,1,55,8,b,4,39 f,1,4z,3,5,3,4g 3,1,44,a,7,4,fj e6,1,3r,9,b,5,d4 a,1,3v,8,8,4,4c z,1,3v,6,7,4,he 1w,1,52,8,7,4,94 9,1,51,a,9,4,3e 1m,1,3v,6,a,4,8p m,1,3v,8,6,4,4d l,1,54,8,9,4,98 o,1,55,c,e,6,38 u,1,53,6,7,4,8i ea,1,3r,9,b,5,d2 ed,1,3r,9,b,5,d3 1a,1,56,8,9,4,dn 1h,1,52,9,8,4,9g 5,1,3w,5,8,4,he 16,1,3u,8,7,4,4d eq,1,3n,9,b,5,d7 ej,1,3r,9,b,5,d3 22,1,4r,b,b,4,21 o,1,3w,b,9,4,gz u,1,3s,9,9,4,5n 1p,1,53,8,9,4,55 6,1,51,8,9,4,di 21,1,47,c,8,4,2e eg,1,3r,9,b,5,d3 eb,1,3r,9,b,5,d3 1w,1,3u,c,7,4,4e 1z,1,54,9,8,4,32 ek,1,4y,8,8,5,8k eh,1,3r,9,b,5,d3 ev,1,4y,8,a,5,hd ep,1,3r,9,b,5,d7 x,1,3v,7,6,3,4c 22,1,3i,3,3,3,ap ee,1,3r,9,b,5,d3 22,1,55,8,5,4,al 1k,1,51,a,b,4,82 em,1,3r,9,b,5,d3 21,1,53,8,b,3,db en,1,3r,9,b,5,d3 1t,1,3v,6,a,4,8r 1d,1,3t,9,6,4,4c 22,1,4f,b,a,7,8t 20,1,3v,6,a,4,8u df,1,47,7,a,4,7j d3,1,53,8,7,3,4g d3,1,44,8,6,4,4g cz,1,52,6,b,3,78 d4,1,4y,6,8,4,2x d1,1,4p,a,8,4,bm d4,1,52,9,7,4,7r d3,1,4z,6,8,3,3 de,1,3z,5,c,4,84 d3,1,3s,a,7,3,4g d3,1,4d,c,7,4,d6 d3,1,51,a,9,4,2 df,1,50,6,b,4,e3 d3,1,3x,8,6,4,4g d3,1,3m,b,c,4,8t d4,1,3u,9,6,4,7b 3k,1,u,4y,2k,9,8r 8c,1,r,a,7,9,8d 5z,0,e,9,9,9,77 60,0,c,3,4,9,76 8d,1,j,3,3,9,h3 7m,1,2m,d,1b,9,9l 7p,1,35,7,d,9,1j 7j,1,2c,8,d,9,92 6i,0,1l,h,z,9,2q 9k,0,p,a,m,9,84',
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
    metres: 6437,
    line: 'rf -2i5 2k1 -2i0 2jw -2hv 2k3 -2ig 2kv -2ji 2lu -2kd 2ml -2kx 2mq -2km 2m6 -2jw 2lh -2j7 2l6 -2j9 2lu -2ky 2nq -2nh 2q4 -2pc 2r7 -2p6 2r0 -2ox 2qr -2oo 2qj -2oh 2qb -2o8 2q3 -2o1 2pv -2ns 2pn -2nk 2pe -2nc 2p7 -2n4 2oy -2mv 2oq -2mo 2oi -2mf 2oa -2m8 2o2 -2lz 2nu -2lr 2nl -2lj 2ne -2lb 2n5 -2l2 2mx -2kv 2mp -2km 2mh -2kf 2m9 -2k6 2m1 -2jy 2ls -2jq 2ll -2ji 2lc -2j9 2l4 -2j2 2kw -2it 2kh -2ia 2jd -2gt 2gp -2dy 2d3 -2ai 290 -26n 24x -22r 212 -1yv 203 -1zx 20r -211 1ye -1xk 1ut -1ug 1rp -1rc 1ok -1op 1ly -1m8 1jk -1kc 1hr -1ir 1ga -1hk 1f7 -1gn 1ec -1fw 1dl -1f5 1d2 -1ew 1cw -1et 1ct -1eq 1cq -1en 1cn -1ek 1cd -1e3 1br -1d8 1al -1bg 18r -19d 16m -171 149 -14b 11l -11c yo -xu v8 -ub rq -qq oa -mx kl -j4 h1 -f8 d6 -bb 9l -7e 5p -3i 27 9 -1j 40 -5b 7r -86 au -av dn -dp gh -gi ja -ku m2 -no mi -mi jq -jq gy -gx e5 -e4 bc -bb 8j -8i 5q -5p 2x -2w 4 -3 -2p 2q -5i 5j -8b 8c -b4 b5 -dx dy -gq gr -jj jl -mc md -p5 p5 -rx ry -uq sq -ti qq -qq ny -nx l5 -l6 k0 -ie ic -fk fi -cq co -9w 9u -73 71 -49 47 -1f 1d 1f -1h 49 -4b 73 -75 9x -9z cr -ct fl -fn if -ih l9 -mv o2 -qu qw -to tq -wi wk -zc ze -126 128 -150 14y -17q 17o -1ag 1ae -1d5 1cx -1fp 1fl -1id 1if -1jn 1l6 -1l5 1nx -1nw 1qo -1qn 1tf -1te 1w6 -1w5 1yx -1yw 21o -21n 24f -24e 276 -275 29x -29x 2cp -2co 2fg -2ff 2i7 -2i6 2ky -2kx 2np -2no 2qg -2qf 2t7 -2t6 2vx -2vw 2yo -2yn 31f -31e 346 -345 36x -36w 39o -39n 3cf -3ce 3f6 -3f5 3hx -3k4 3kq -3ni 3nl -3qd 3qf -3t7 3t8 -3tt 3vz -3vx 3yp -3ym 41d -41b 443 -441 46t -46q 49i -49q 4ch -4d8 4fu -4i5 4je -4m6 4m9 -4p1 4p5 -4rx 4s1 -4ut 4uw -4xo 4xs -50k 50o -53f 53o -569 577 -58j 5as -5co 5dw -5fm 5hn -5ke 5ko -5ng 5no -5qc 5qs -5sw 5up -5uv 5xl -5xk 60c -60c 634 -634 65w -65w 68o -68o 6bg -6bh 6e9 -6e9 6h0 -6h0 6js -6js 6mk -6mk 6pc -6pd 6s5 -6s6 6uy -6v0 6xs -6xt 70l -70l 73d -73d 765 -765 78x -78x 7bp -7bp 7eh -7ek 7hc -7hl 7kc -7kf 7n7 -7na 7q2 -7q6 7sy -7t0 7vs -7vs 7yk -7yl 81d -81e 846 -848 870 -873 89u -89w 8co -8cq 8fi -8fi 8ia -8ia 8l2 -8l2 8nu -8nu 8qm -8qn 8tf -8u6 8wu -8yf 90o -91x 949 -949 971 -971 99t -99t 9cl -9eb 9gh -9i3 9ka -9kc 9n3 -9n6 9py -9q0 9ss -9st 9vl -9vl 9yd -9ye a16 -a17 a3z -a3z a6r -a6j a94 -a6g a78 -a4k a5b -a2k a2o -9zw 9zu -9x2 9x0 -9u8 9u6 -9re 9rd -9ol 9oj -9lr 9lp -9ix 9iv -9g3 9g1 -9d9 9d7 -9af 9ae -97m 97k -94s 94q -91y 91w -8z5 8z3 -8wb 8wa -8ti 8tg -8qo 8qm -8nu 8ns -8l0 8ky -8je 8kn -8kj 8nb -8n8 8q0 -8px 8sp -8sl 8vd -8va 8y1 -8xx 90p -901 92a -8zi 8zg -8wo 8wn -8tv 8tt -8r1 8r0 -8o8 8o7 -8lf 8ld -8il 8ik -8fs 8fq -8cy 8cx -8a5 8a3 -87b 87a -84i 84h -81p 81o -7z0 7zd -7wx 7y8 -7xm 801 -802 82u -82v 85m -85o 88g -88h 8b9 -8ba 8e2 -8e4 8gw -8gx 8jp -8jq 8mi -8mk 8pc -8pd 8s5 -8s6 8uy -8v0 8xs -8xt 90l -90m 93e -93g 968 -969 991 -992 9bu -9bw 9eo -9ep 9hh -9hj 9ka -9kb 9n3 -9n5 9px -9py 9sq -9tk 9w7 -9x7 9zs -a0r a3d -a1i a21 -9z9 9z5 -9wd 9w9 -9th 9te -9qm 9qi -9nq 9nm -9ku 9kq -9hz 9hv -9f3 9ez -9c7 9c3 -99b 997 -96f 96b -93j 93f -90n 90j -8xr 8xo -8ux 8ut -8s1 8rx -8p5 8p1 -8m9 8m5 -8jd 8j9 -8gh 8gd -8dl 8dh -8ap 8al -87u 87s -850 84x -825 823 -7zb 7z8 -7wg 7we -7tm 7tj -7qr 7qp -7nx 7nu -7l2 7l0 -7i8 7i6 -7fe 7fb -7cj 7ch -79p 79m -76v 76t -741 73y -716 714 -6yc 6y9 -6vh 6vf -6sn 6sk -6ps 6pn -6mv 6mq -6jy 6ju -6h3 6gu -6e2 6ds -6b3 6ah -67t 672 -64g 63h -60w 5zw -5xa 5wb -5tq 5sr -5q6 5p5 -5ml 5lh -5ix 5hu -5fa 5e7 -5bn 5ak -580 56w -54b 53b -50r 4zq -4x6 4w3 -4tj 4sg -4pw 4ot -4m9 4l5 -4il 4hi -4ex 4dv -4bb 4aa -47p 46n -443 431 -40g 3ze -3wu 3vt -3t8 3s6 -3pj 3op -3m1 3l9 -3ik 3hw -3f6 3em -3bv 3bf -38o 38f -35n 35e -32m 32f -2zo 2zm -2wu 2ws -2uj 2sx -2s7 2ps -2pt 2n1 -2n3 2kb -2kc 2hk -2hl 2et -2ev 2c3 -2c4 29c -29d 26m -26n 23v -23w 214 -205 1xj -1xd 1um -1ul 1rt -1rt 1p1 -1p0 1m8 -1m5 1jd -1jc 1gk -1gj 1dr -1dr 1az -1az 188 -187 15f -15f 12n -12m zu -zt x1 -x1 u9 -u8 rg -rf on -on lv -lu j2 -j4 gc -ge dm -d8 aj -9d 6v -6p 3y -3u 12 -y -1u 1z -4r 4w -7o 7t -al aq -dh co -fa f6 -hv i8 -kz lg -o7 oo -re rv -um v5 -xv yf -115 11o -14e 14z -17p 18b -1b0 1bl -1eb 1ew -1hm 1i9 -1ky 1lp -1od 1p3 -1rs 1sj -1v7 1vy -1ym 1zc -221 22s -25g 266 -28u 29l -2ca 2d1 -2fp 2gf -2j3 2ju -2mj 2na -2py 2qo -2tc 2u3 -2ws 2y5 -30i 31g -340 34p -37e 381 -3ar 3bf -3e4 3et -3hh 3i7 -3kw 3ll -3o9 3oz -3ro 3sd -3v2 3vo -3yd 3z1 -41q 42f -454 45s -48h 496 -4bv 4ck -4f9 4fy -4im 4jb -4m0 4mp -4pe 4q3 -4ss 4th -4w6 4vh -4y2 4ya -50y 51n -54c 550 -57p 58e -5b3 5bs -5eh 5f5 -5hu 5ij -5l7 5lw -5ol 5oz -5ri 5ot -5pg 5mr -5ne 5ko -5la 5il -5j8 5gh -5gu 5e4 -5dt 5b3 -5ah 57r -579 54i -547 51f -51f 4yp -4z3 4wi -4xj 4v6 -4wm 4un -4wl 4v8 -4xn 4wy -4zl 4zd -524 523 -54v 54v -57n 57n -5af 5ae -5d6 5d6 -5fy 5fx -5ip 5ip -5lh 5lf -5o7 5n7 -5pm 5n5 -5oc 5lu -5mz 5kr -5mg 5jw -5kv 5i6 -5is 5hs -5jr 5jr -5mj 5mi -5pa 5pa -5s2 5s2 -5uu 5uu -5xm 5xm -60e 60e -636 635 -65x 65w -68n 681 -6al 68o -6ao 68q -6aq 68r -6ap 68q -6ao 68j -6ab 682 -69o 67c -68p 660 -65f 63f -63q 63q -66i 66i -69a 69b -6c3 6c3 -6ev 6ev -6hn 6hn -6kf 6kg -6n8 6n8 -6q0 6q0 -6ss 6ss -6vk 6vl -6yd 6yd -715 715 -73x 73x -76o 76o -79g 79f -7c7 7c5 -7ex 7fc -7i3 7hu -7kl 7jy -7mb 7jj -7jj 7gr -7gq 7dz -7dz 7b7 -7b7 78f -78f 75n -75m 72u -72t 701 -700 6x8 -6x8 6ug -6ug 6ro -6ro 6ow -6ow 6m4 -6m4 6jc -6jc 6gk -6gj 6dr -6dr 6az -6ay 686 -686 65e -65e 62m -62l 5zt -5zt 5x1 -5x1 5u9 -5u8 5rh -5rh 5op -5op 5lx -5lw 5j4 -5j4 5gc -5gd 5dl -5dl 5at -5au 582 -582 55a -55b 52j -52j 4zr -4zr 4wz -4x0 4u8 -4u9 4rh -4rh 4op -4oq 4ly -4ly 4j6 -4j7 4gf -4gg 4do -4do 4aw -4ax 486 -487 45f -45f 42n -42o 3zw -3zx 3x5 -3x5 3ud -3ue 3rm -3rm 3ou -3ou 3m2 -3m3 3jb -3jb 3gj -3gj 3dr -3dr 3az -3b0 388 -388 35g -35g 32o -32o 2zy -30d 2xm -2y4 2vd -2vq 2sy -2sz 2q7 -2q8 2nh -2ni 2kq -2kr',
    height: '45 -1 0 0 0 0 2 2 3 2 2 3 0 0 0 0 -2 -2 -2 -3 -5 -6 -7 -8 -8 -7 -6 -5 -5 -3 -2 -2 -1 1 1 1 1 -1 -2 -2 -3 -3 -3 -4 -5 -5 -5 -3 -2 -1 1 2 3 4 4 4 4 4 5 4 3 4 3 3 3 2 2 1 1 1 1 0 0 1 1 1 1 0 1 0 0 -1 -1 -1 0 1 -1 -2 -2 -2 -1 -1 1 1 4 3 4 5 4 4 4 5 4 5 4 2 2 2 2 0 0 0 -1 -2 -2 -3 -3 -3 -1 -2 -3 -3 -3 -4 -4 -3 -3 -3 -1 0 -1 -1 0 1 1 2 2 3 3 3 1 0 0 -3 -3 -4 -7 -6 -6 -6 -5 -6 -4 -2 -2 0 2 2 4 5 4 5 5 4 5 4 6 5 4 3 3 2 1 2 1 2 1 0 1 -1 0 3 4 4 6 5 5 7 6 7 5 2 1 -1 -2 -4 -4 -3 -3 -2 -3 -4 -4 -1 0 2 1 1 -1 -3 -5 -7 -8 -7 -6 -5 -5 -3 -4 -2 -2 0 2 2 4 3 2 0 -2 -2 -5 -4 -3 -4 -3 -3 -1 -1 0 2 2 3 3 4 3 4 4 3 1 2 1 2 1 3 3 3 4 4 1 1 0 0 0 -1 -1 0 -2 -2 -3 -3 -3 -3 -1 0 4 4 4 5 4 6 4 5 4 4 3 1 -1 -3 -5 -4 -5 -4 -5 -4 -3 -4 -3 -2 -1 0 0 0 1 1 -1 -1 -3 -2 -3 -2 -2 -1 0 -1 -1 -2 -2 -1 -2 0 1 1 1 0 -1 -2 -2 -2 -2 -2 -3 -2 -4 -5 -4 -3 -3 -2 -1 0 0 0 0 2 1 4 3 3 2 2 2 1 1 0 0 0 0 0 0 0 0 0 -1 -1 -2 -2 -1 -1 0 0 0 0 -2 -2 -3 -3 -3 -3 -4 -3 -2 -3 -3 -2 -3 -1 0 1 0 2 2 2 1 0 0 -1 -2 -2 -3 -4 -5 -4 -3 -5 -3 -3 -2 -2 -2 0 0 0 1 3 3 3 4 5 5 4 5 4 5 4 3 3 2 0 -1 -3 -3 -5 -5 -4 -5 -3 -2 -1 0 1 1 3 2 3 4 4 4 3 3 1 1 0 -1 -1 -1 -1 -1 -3 -2 -4 -4 -4 -3 -4 -4 -3 -3 -3 -4 -3 -3 -3 -3 -3 -4 -3 -4 -3 -3 -2 0 2 2 3 4 5 5 5 5 4 4 3 2 1 1 0 -1 0 -2 0 0 1 1 0 2 1 0 0 0 0 0 0 0 -1 0 0 1 0 1 2 1 2 1 2 1 2 2 0 1 0 -1 0 -1 -1 -1 -1 -1 0 1 0 1 1 1 1 0 0 0 0 2 1 0 0 0 0 -1 -1 0 -1 0 0 0 0 -1 0 -1 -1 0 1 1 1 1 2 2 2 3 1 1 1 0 0 0 -1 -1 -1 0 -2 -2 -3 0 -1 0 1 0 3 1 1 1 0 0 1 1 1 1 0 0 -1 -2 0 1 2 3 5 5 6 5 6 5 6 6 6 6 6 5 4 3 3 2 2 3 3 2 1 1 1 -1 -1 -1 -2 -1 -2 -3 -3 -3 -2',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '37,0,4s,e,t,9,1r 2j,1,4x,r,r,9,eu 6z,0,57,1q,1x,2r,9j 8h,1,1j,14,3v,p,8r 8z,0,59,5s,4t,9,9j 6z,0,4p,1k,18,31,7b 76,0,15,z,3a,9,hf 6z,0,2f,1p,1c,m,9j ah,1,1w,10,i,a,12 56,0,18,10,14,g,0 5q,0,3r,x,1w,t,d5 6c,0,3b,8,j,w,d3 65,0,32,b,l,a,8s 6c,0,2u,7,f,6,d3 65,0,2j,8,1r,1f,2 65,0,2a,9,7,6,2 5x,0,4b,m,2g,6,4d 5y,0,3h,9,f,w,4d 6q,0,31,1k,1n,j,d7 6l,0,4t,7,f,6,4f 5f,0,3j,2w,5v,2b,fl cs,0,2c,4,b,9,52 fv,0,1m,1a,1e,q,d3 f8,0,4b,4n,4k,9,5y es,0,28,16,1k,q,1i f7,0,r,b,b,9,1k 50,1,3s,1i,2j,9,g5 cd,0,1j,1d,13,9,4i b0,1,27,j,15,9,gm az,0,x,i,14,9,7q c0,1,3r,l,p,1m,fg d3,0,1z,15,2y,9,56 cx,1,u,m,m,9,2 by,1,1t,14,1q,9,8r cu,1,53,28,12,9,2s ak,1,3x,10,j,a,e4 cx,1,3d,o,y,z,fw bb,0,2v,9,i,9,dv ch,1,1s,k,17,9,dh cb,1,1l,u,p,9,8y c7,1,45,o,n,g,ec cc,1,4o,6,5,g,9z c7,1,3j,6,6,g,37 2j,1,2r,1e,1d,9,ag ds,0,2m,1a,1m,9,79 bb,0,4l,e,u,9,e4 ba,0,4o,c,b,9,1l ba,0,5a,a,n,9,70 bc,0,33,6,d,9,d2 bb,0,4a,13,1v,a,56 8p,0,4a,a,b,9,8s dt,1,11,9,i,9,8y dm,1,1g,9,c,9,9g dp,0,4i,1a,1f,9,da ds,0,3y,1r,1h,9,32 87,1,4o,b,l,9,eh d7,1,1a,r,10,9,v bf,0,4y,b,1i,9,d2 bi,0,4z,b,1i,9,d2 bi,0,1p,o,p,9,he bb,0,22,a,c,9,56 de,0,29,j,p,9,df 6t,0,p,9,12,9,0 5w,0,1p,a,1d,9,8p 1m,1,4s,c,1a,a,ee 1i,1,2z,c,q,a,8v 1n,1,30,c,1a,a,1j 1l,1,4l,e,1a,a,e3 1j,1,4k,b,q,a,a 1i,1,3t,c,d,a,8v 1h,1,3z,d,1a,a,cp 1i,1,26,c,19,a,8v 0,0,4x,9,8,9,6o 6k,0,17,g,a,9,ef 6d,0,52,1b,3n,9,4e 5z,0,q,c,l,9,hd 2j,1,40,8,d,9,eu g3,0,56,j,z,6,8p g1,0,53,k,10,9,hf g1,0,24,1y,1a,6,4d g2,0,4e,f,y,6,8q g1,0,2y,6,o,9,8q g1,0,3h,l,t,6,hf g1,0,4b,j,16,6,hf g5,0,2v,8,b,9,d3 g6,0,3g,8,f,9,d3 g2,0,37,u,t,9,8s ge,0,3x,a,1a,9,d3 gc,0,41,c,16,9,d3 ge,0,32,6,6,9,4c g1,0,58,e,g,9,x g0,0,4p,e,a,9,a8 g1,0,4s,8,h,9,d4 g0,0,58,e,f,9,d7 et,0,s,m,o,a,5s fi,1,2n,v,k,a,bj gg,1,43,11,o,a,75 ge,1,3k,12,l,a,fu fk,1,24,12,n,a,bg e8,1,15,h,12,9,89 e7,0,1p,1g,1g,9,h fh,1,1r,6,13,6,1 fh,1,36,8,o,a,0 fh,1,o,6,21,3,0 f2,1,2o,6,r,3,8r gd,1,2d,d,c,3,ge fo,1,1l,h,f,3,2z fp,1,29,e,7,3,b3 fr,1,2r,e,8,3,2h fh,1,41,f,f,9,55 fh,1,3h,9,11,a,hf fh,1,3m,g,9,a,4d fh,1,2g,a,p,a,8p fh,1,3h,r,9,a,d3 ey,1,3o,7,15,3,4e ey,1,3r,7,17,3,4e fh,1,54,a,w,a,hf d5,1,5a,n,t,3,57 d7,1,2s,5,k,3,1i 5q,0,15,n,w,9,8p 5m,0,40,p,22,6,d5 bp,0,1f,j,n,9,1 bt,0,21,f,18,d,d4 c0,0,1p,1e,17,9,4e at,1,1f,7,p,9,ge at,1,1w,7,p,9,gc 6u,0,25,v,20,9,d8 64,0,g,5,e,7,3 64,0,x,8,f,7,8t 7h,1,1t,3a,4n,9,8p gw,0,1u,d,8,9,d1 gt,0,1u,9,9,9,d3 go,0,25,d,8,9,4d gl,0,25,d,8,9,d3 gk,0,3p,d,8,9,hf gk,0,4k,d,8,9,8p gn,0,47,a,9,9,4d gp,0,47,a,9,9,d3 go,0,3k,m,8,9,d3 gr,0,4n,d,8,9,8q gu,0,4p,d,9,9,8q gw,0,4o,d,9,9,8p gu,0,3u,e,a,9,he gu,0,34,f,9,9,4d gw,0,3v,d,8,9,hf gv,0,2h,l,9,9,d3 9i,1,3m,2g,2i,34,1f c9,0,3t,j,1s,9,4 c8,0,34,k,1h,9,8u cu,0,57,7,f,9,p cn,1,17,l,x,9,8v bi,0,2v,d,o,9,hf bp,0,4o,c,r,9,8q 88,1,1z,q,19,9,cd 4k,1,26,v,1g,9,8p 9n,0,3k,7,d,9,2 96,0,3q,34,3n,9,2 u,0,11,4o,1c,k,8p hf,0,1b,3,8,9,d3 hr,0,49,b,1x,19,1 fh,1,4r,16,o,9,bj 18,1,4h,8,10,9,4 gh,1,2a,6,a,9,8r fi,1,4y,9,t,9,8p 18,1,3z,4,1f,9,8u 18,1,3b,6,17,9,4 gm,1,33,9,10,9,0 go,1,4u,5,16,9,d2 16,1,4o,6,1c,9,6y gp,1,1z,7,l,9,d0 gm,1,1t,9,h,9,gz 2j,1,2c,6,8,9,63 e2,0,2d,12,14,a,1 41,0,2z,a,1f,9,4c 4c,0,3x,8,18,9,0 3z,0,3e,5,7,9,4b 8z,0,11,e,t,9,dz c0,1,2p,j,r,9,1 az,1,4y,1c,1f,m,c0 50,1,53,4,g,9,7f 50,1,54,b,f,9,g5 hm,0,16,16,1e,t,78 hq,0,2k,5,9,3,dh hm,0,2k,5,9,3,4e gq,0,4s,3,5,9,4c go,0,4s,4,n,9,8p go,0,56,4,7,9,hf gy,0,4t,4,k,9,d3 gy,0,41,4,i,9,4d gx,0,1h,4,h,9,8q gy,0,2d,4,s,9,d3 gx,0,31,4,i,9,0 gx,0,3d,4,i,9,8q 1k,1,3h,5,8,9,9g gp,0,2x,9,a,9,4d gr,0,1u,4,d,9,hf d7,1,3l,b,e,3,a7 d7,1,36,6,d,3,aa d7,1,3a,5,d,3,1h d7,1,2v,6,d,3,a9 5m,0,16,a,m,9,hf 5m,0,1f,3,c,9,hf 5q,0,x,h,1a,9,hf 5k,0,11,e,c,9,8p bb,0,1p,g,d,9,ff dm,1,11,7,8,9,9e dt,1,18,7,c,9,9 do,1,27,5,a,9,52 dm,1,1e,a,g,9,9f 6c,0,x,h,s,9,2 6g,0,1w,4,4,9,4d g8,0,47,3,1a,9,d3 e2,0,4j,5,1h,9,p e2,0,4v,4,d,9,q e2,0,14,b,f,9,hd e2,0,2w,11,1t,9,8o e2,0,2k,e,l,9,he e2,0,3r,10,9,9,g6 e2,0,47,u,8,9,g6 e2,0,3l,6,7,9,8o e2,0,1v,6,7,9,he cz,1,32,9,9,9,bj d6,1,52,9,4,9,fj ck,1,1g,5,5,9,cx cs,1,3u,d,5,9,2s ff,0,k,a,6,9,60 gh,0,1r,4,y,9,d2 gh,0,3w,4,10,9,d2 g9,0,41,3,14,9,d3 g9,0,2j,4,x,9,d2 g8,0,1x,4,17,9,d2 bj,1,15,l,x,9,hf',
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
    metres: 3678,
    line: '-17t -1be 1dy -1f1 1h9 -1is 1jy -1mg 1mj -1pa 1pb -1s3 1sb -1v2 1vv -1yj 1zu -229 249 -265 28l -29t 2cj -2d5 2fw -2g7 2iz -2ja 2m1 -2mc 2p3 -2pe 2s6 -2sg 2v7 -2vh 2y8 -2yi 31a -31l 34c -34m 37e -37o 3af -3ap 3dh -3dr 3gi -3gs 3jk -3jr 3mi -3ml 3pd -3ph 3s9 -3sd 3v5 -3v9 3y1 -3y4 40w -410 43s -43w 46o -46s 49j -49o 4cg -4cl 4fd -4fi 4ia -4i9 4ko -4jk 4lc -4j7 4kp -4id 4jv -4hi 4j0 -4go 4i6 -4fu 4hb -4ez 4gh -4e5 4fn -4da 4ek -4c4 4cs -4a4 4a7 -47f 478 -44h 446 -41e 412 -3yb 3y0 -3v9 3ux -3s6 3rv -3p3 3or -3m0 3lp -3iy 3im -3fv 3fk -3cs 3cg -39p 39e -36n 36b -33j 338 -30h 305 -2xe 2x3 -2uc 2u0 -2r8 2qx -2o6 2nu -2l3 2ks -2i1 2hp -2ex 2em -2bv 2bj -28s 28g -25p 25b -22k 225 -1ze 1yz -1w8 1vt -1t2 1sn -1pw 1pi -1ms 1md -1jm 1j7 -1gg 1g1 -1da 1cw -1a5 19q -16z 16k -13u 13f -10o 109 -xi x4 -ud ty -r7 qs -o1 nm -kw ki -hr hc -el e6 -bf b0 -89 7u -53 4p -1z 1k 17 -1m 4d -4q 7h -7q ai -b2 dr -fo hl -k6 kw -no nm -qe qc -t3 ta -vy wr -zb 10d -12u 143 -16k 17u -19t 1bm -1d0 1ff -1go 1j5 -1kz 1n2 -1pk 1qq -1tg 1tw -1wm 1w9 -1yk 1x4 -1yz 1wx -1yh 1w7 -1xe 1uw -1uv 1wk -1w8 1z0 -1yo 21f -214 23v -23j 26a -25y 28q -28e 2b5 -2at 2dk -2d9 2g0 -2fu 2im -2ij 2lb -2l3 2nu -2nk 2qc -2q1 2ss -2sh 2v9 -2uw 2xn -2x7 2zx -2zh 328 -31s 34j -343 36t -36d 394 -38o 3be -3ay 3dp -3d9 3g0 -3g1 3ip -3jq 3mb -3o3 3q2 -3st 3sl -3vc 3v1 -3xc 3w6 -3xz 3vv -3xn 3vi -3xb 3v7 -3wz 3uv -3wo 3uj -3wb 3u7 -3w0 3tw -3vo 3tj -3vh 3ti -3vk 3to -3vp 3tu -3vv 3ty -3vy 3u1 -3w1 3u4 -3w5 3u8 -3w4 3u3 -3vu 3tp -3vb 3t1 -3u2 3rk -3r9 3oi -3py 3qr -3so 3uo -3wg 3yl -40g 42i -44g 46a -47h 49z -4b6 4dp -4ev 4hd -4ij 4l2 -4m9 4or -4px 4sg -4t1 4vq -4w4 4yv -4z8 51z -521 54s -54o 57g -573 59u -59h 5c8 -5c0 5es -5ex 5hp -5ic 5l1 -5lo 5od -5p1 5rq -5sf 5v4 -5vt 5yi -5ze 620 -632 65n -66o 698 -6a9 6cu -6dv 6gg -6hh 6k2 -6l3 6no -6op 6r9 -6sa 6uv -6vx 6yh -6zl 725 -738 75s -76y 79h -7av 7d9 -7em 7h1 -7if 7ku -7m8 7om -7q0 7sf -7tt 7w7 -7xl 800 -81g 83t -85a 87n -894 8bh -8cy 8fa -8gr 8j4 -8ke 8mv -8o4 8ql -8s1 8t5 -8v5 8t7 -8v7 8ta -8va 8tc -8vc 8tf -8vf 8th -8vg 8tj -8vj 8tl -8vl 8to -8vn 8tp -8vo 8tp -8vo 8tq -8vp 8tq -8vo 8tp -8vn 8to -8vn 8to -8vm 8to -8vn 8to -8vm 8tn -8vm 8tn -8vm 8tn -8vl 8tn -8vm 8tn -8t7 8r6 -8pa 8na -8lc 8jb -8he 8fe -8dh 8bh -89k 87k -85o 83n -81q 7zp -7xt 7vs -7tw 7rv -7pw 7nx -7ly 7k0 -7i1 7g3 -7e4 7c5 -7a6 788 -769 74b -72c 70e -6yf 6wg -6ug 6sj -6qi 6om -6ml 6ko -6io 6gs -6er 6cv -6au 68x -66w 650 -62z 612 -5zx 5xf -5wd 5tt -5tg 5qp -5qt 5o1 -5p2 5mi -5nn 5l4 -5m8 5jp -5ku 5ia -5jn 5h8 -5iq 5gf -5hy 5fm -5h5 5eu -5ga 5dw -5f8 5ct -5e6 5br -5d4 5ao -5c1 59m -5az 58k -5an 590 -5a3 59i -56w 55y -53m 524 -509 4y7 -4wr 4ue -4tl 4qy -4qr 4o0 -4oe 4ln -4k5 4hw -4fi 4e3 -4bo 4aa -47w 46i -444 42q -40b 3yx -3wj 3v5 -3sq 3rb -3oy 3ni -3l6 3jp -3hc 3fv -3dh 3c1 -39o 388 -35u 34f -322 30m -2y8 2ws -2ue 2t1 -2u9 2s0 -2pt 2o5 -2mi 2k9 -2it 2gg -2fd 2ct -2c6 29h -292 26c -265 23d -235 20d -206 1xf -1x8 1ug -1u9 1rh -1re 1om -1oj 1ls -1lp 1ix -1iu 1g2 -1fz 1d7 -1d5 1ad -1ac 17k -17j 14r -14q 11y -11x z5 -z4 wc -wb tj -ti qq -qp ny -ny l6 -l5 id -ic fk -fi cq -cn 9v -9t 71 -6y 46 -44 1c -19 -1j 1l -4d 4g -77 79 -a1 a4 -cw cz -fr ft -il io -lg li -oa od -r5 r7 -tz u2 -wu ww -zn zq -12i 13c -15d 185 -18b',
    height: '82 -2 -7 -d -f -f -e -f -e -d -e -g -h -f -e -c -b -a -9 -9 -7 -7 -6 -4 -3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 2 1 2 1 1 1 1 0 0 0 0 0 2 2 1 1 -1 -1 0 -1 0 0 0 0 -1 -2 -1 1 7 a c b c a 8 8 6 6 3 1 -4 -7 -a -8 -5 -3 1 6 8 6 7 c h i j j g d a 5 2 0 2 1 -3 -7 -7 -7 -6 -6 -6 -4 -4 -5 -4 -5 -4 -4 -3 -3 -3 -3 -2 -2 -1 1 3 3 4 6 7 7 7 6 6 4 1 1 -1 -1 -3 -3 -3 -5 -6 -9 -b -b -c -c -g -h -j -k -m -j -e -8 -4 0 1 2 4 a f k p s p k f c 9 8 8 7 6 5 4 6 9 b 7 4 0 0 -1 -1 -3 -6 -c -g -h -f -c -6 -2 3 3 4 7 7 a e g b 5 -2 -2 -3 -3 -3 -4 -5 -4 -6 -5 -6 -5 -6 -6 -5 -5 -5 -5 -3 -3 -4 -3 -4 -4 -5 -4 -5 -5 -4 -5 -4 -3 -2 -1 0 1 0 -1 -3 -7 -b -g -h -h -g -b -8 -6 -4 -2 -1 2 4 9 c f c b 7 3 2 2 5 8 f o v 13 18 1f 1i 1m 1k 1h 1p 1x 20 1w 1r 1o 1e 16 15 z o g 7 -h -14 -1o -1y -21 -24 -1y -1y -24 -26 -22 -1s -1i -12 -q -a -1 0 0 -3 -1 1 3 5 4 5 5 4 3 1 0 -2 -4 -2 -1 2 5 8 a b 8 6 4 2 0 0 0 -1 -3 -7 -b -f -h -f -e -7 1 7 a 8 8 7 7 6 7 6 6',
    tunnel: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '9v,1,2k,1h,1a,g,5w 85,1,4z,z,q,x,dj 85,1,3x,2v,22,k,4u 8e,1,3y,y,1k,o,7e 85,1,3n,17,1e,9,dj 85,0,20,v,w,9,f 7z,1,w,u,w,9,4c 80,0,19,y,x,40,4e 60,0,1k,1b,f,46,80 6o,0,20,1e,g,46,d4 62,1,1o,1n,14,d,ha 67,1,3k,2g,m,j,bo 97,1,1h,u,x,67,ej 1u,0,10,1s,5k,f,hf t,0,28,1m,1y,9,1p 8h,0,z,z,10,40,d3 8n,1,v,5,d,4,79 8u,1,1a,x,x,4e,7m 2,0,3o,2h,2o,a,27 6z,1,3x,o,h,9,d0 6v,1,52,t,h,c,79 6w,1,53,h,g,q,89 6w,1,3q,h,e,m,4c 9i,1,s,e,9,3,b5 62,1,3n,11,x,2u,9 61,1,3s,2g,1o,9,cu r,0,1z,2f,p,9,fi 6w,1,4u,a,5,c,d7 6v,1,4g,c,4,c,2v 6w,1,33,d,8,o,0 6w,1,54,b,4,c,4g 6v,1,4k,c,7,c,bl 6w,1,57,b,4,c,d6 6v,1,4p,c,4,c,bl 6v,1,59,b,4,c,2x 6v,1,4s,c,4,c,bl 6v,1,4v,c,4,c,2v 6w,1,47,9,4,c,4e 6v,1,3f,f,3,c,bm 6v,1,4z,c,4,c,2v 6v,1,54,c,6,c,2v 6v,1,59,b,3,c,2s 6v,1,3h,f,4,c,bn 6w,1,4v,b,4,c,d7 6v,1,3k,f,4,c,2w 6w,1,47,b,4,c,d4 6v,1,3m,f,4,c,bn 6w,1,4x,b,4,c,4h 6w,1,4b,c,4,c,d4 6v,1,3p,f,4,c,bn 6w,1,4z,b,4,c,d7 6v,1,3r,f,4,c,bn 6w,1,4e,c,4,c,d4 6v,1,3u,f,4,c,2x 6v,1,45,n,g,m,fz 6w,1,52,b,4,c,4h 6w,1,4n,f,8,q,85 3n,0,18,i,k,g,h0 3h,0,s,8,9,g,gw 8k,0,1r,3h,1t,k,hd 3t,1,2i,8,a,g,h6 1p,0,2o,b,s,4,dj 1s,0,1y,9,j,4,8p 7y,1,1y,21,1w,k,27 6k,1,37,38,2t,9,cu 6p,1,28,21,15,9,d5 6k,1,4x,11,1d,9,8k 9b,0,z,a,17,3,8g 91,0,10,4,10,3,6 8x,0,s,i,7,3,g8 8t,0,19,d,p,3,6r 97,0,e,3,7,3,3 k,1,g,3,3,9,h8 2,0,48,19,1e,f,7p 72,1,23,10,10,9,48 6z,1,2d,19,o,e,d4 75,1,3j,o,e,9,4b 73,1,42,q,w,9,cz 6v,1,35,31,1b,6,fz 97,1,47,41,3h,1b,8 8o,1,16,7,8,5,g0 6v,1,2h,x,m,2o,6p 6v,1,4v,j,t,2o,b3',
    boats: '9,1,7p,i,3z 9,1,7y,t,8c 9,1,8j,t,cp j,1,1d,j,48 j,1,o,11,hb',
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
    metres: 5560,
    line: '-jqo 1deg -1dg0 1dib -1diy 1dll -1dke 1dmu -1dkn 1dmc -1dk6 1dlw -1djp 1dle -1djb 1dl6 -1djv 1dm9 -1dlu 1dok -1doi 1dra -1dro 1duf -1dvb 1dxx -1dza 1e1q -1e32 1e5h -1e6u 1e9a -1eam 1ed1 -1eee 1egt -1ei6 1ekm -1elo 1eo8 -1eop 1erf -1erk 1euc -1euc 1ex4 -1ex4 1ezw -1ezw 1f2o -1f2o 1f5g -1f5h 1f89 -1f89 1fb1 -1fb1 1fdt -1fdt 1fgl -1fgl 1fjd -1fje 1fm6 -1fm6 1foy -1foy 1frq -1fro 1fug -1ftu 1fwj -1fvn 1fy9 -1fwj 1fyp -1fwl 1fye -1fw7 1fxw -1fvl 1fx5 -1fuu 1fwd -1fu2 1fvm -1ftb 1fuv -1fss 1fum -1fso 1fun -1ft2 1fvc -1fu5 1fwn -1fw2 1fys -1fym 1g1d -1g1l 1g4d -1g53 1g7r -1g8h 1gb6 -1gc7 1ges -1gfs 1gid -1gje 1glz -1gn0 1gpl -1gqm 1gt7 -1gu8 1gwt -1gxt 1h0e -1h1f 1h40 -1h51 1h7m -1h8n 1hb8 -1hca 1heu -1hfg 1hi6 -1hil 1hlb -1hl7 1hnz -1hnh 1hq7 -1hpm 1hsc -1hra 1htu -1hsq 1hva -1htw 1hwa -1hun 1hwv -1huy 1hwy -1hus 1hwk -1huc 1hvy -1htg 1huo -1hs3 1ht4 -1hqi 1hre -1hoo 1hpa -1hmk 1hn0 -1hk8 1hkf -1hhn 1hhl -1heu 1hej -1hbu 1hb9 -1h8k 1h7u -1h57 1h4d -1h1v 1h0o -1gy8 1gwx -1gup 1gt1 -1gqx 1gp4 -1gn8 1gl7 -1gjc 1gh9 -1gfk 1gdd -1gbs 1g9i -1g8a 1g5t -1g4s 1g27 -1g1i 1fyu -1fyd 1fvm -1fva 1fsj -1fsi 1fpq -1fpq 1fmy -1fn8 1fkh -1fks 1fi0 -1fij 1fft -1fgg 1fdr -1fel 1fby -1fcw 1faa -1fbj 1f91 -1fac 1f7w -1f9f 1f74 -1f8n 1f6b -1f7u 1f5i -1f70 1f4p -1f68 1f3w -1f5f 1f33 -1f4r 1f2j -1f47 1f20 -1f3p 1f1h -1f36 1f0z -1f2n 1f0f -1f24 1ezw -1f1k 1ezd -1f12 1eyu -1f0j 1eyc -1f00 1exs -1ezf 1ex6 -1eyt 1ewk -1ey7 1evz -1exm 1evd -1ex0 1eus -1ewg 1eu7 -1evu 1etl -1ev8 1et0 -1eum 1esd -1etx 1erm -1et6 1eqv -1esf 1eq4 -1ern 1epb -1eqv 1eok -1epn 1en4 -1enl 1ekv -1ek9 1ehm -1eg2 1eds -1ebn 1e9w -1e7p 1e60 -1e3s 1e23 -1dzw 1dy8 -1dw0 1dub -1ds3 1dqf -1do7 1dmj -1dkb 1din -1dgf 1der -1dcj 1dav -1d8n 1d6z -1d4r 1d33 -1d0w 1cz6 -1cx0 1cva -1ctb 1crd -1cpl 1cng -1cm0 1cjn -1cil 1cg1 -1cfc 1cco -1cca 1c9j -1c9c 1c6k -1c6g 1c3o -1c3l 1c0t -1c0p 1bxx -1bxt 1bv1 -1buy 1bs6 -1bs2 1bpa -1bp6 1bme -1bma 1bji -1bjf 1bgn -1bgg 1bdp -1bdi 1baq -1bag 1b7p -1b73 1b4d -1b3m 1b0y -1azq 1ax8 -1avx 1ati -1aru 1apl -1anu 1alp -1ajr 1ahs -1aft 1adu -1abo 1a9y -1a7r 1a61 -1a3p 1a27 -19zu 19ye -19vt 19ut -19s6 19r9 -19oj 19o2 -19lb 19kx -19i5 19hv -19f4 19eu -19c2 19c1 -1999 1998 -196g 196f -193n 193m -190u 190t -18y1 18y0 -18v8 18v7 -18sf 18sg -18po 18px -18n8 18ns -18l4 18lv -18jb 18kg -18hx 18j2 -18gq 18i7 -18fu 18hc -18ey 18gc -18dm 18ds -18bn 189w -1889 1861 -184t 182c -1815 17ym -17xg 17uy -17ts 17r9 -17q3 17nk -17na 17nb -17o4 17qs -17qy 17tq -17tq 17wi -17wh 17z9 -17z1 17zt -17z9 17wj -17vz 17t9 -17sd 17ps -17oa 17ly -17k8 17i1 -17gb 17e5 -17cf 17a8 -178q 176e -174z 172m -1716 16ys -16xd 16uz -16to 16r8 -16q1 16ni -16mc 16ju -16in 16g4 -16ey 16cg -16b9 168q -167f 1650 -162e 162d -15zl 15zu -15x2 15xb -15uj 15um -15rv 15rz -15p7 15p5 -15md 15mb -15jj 15jf -15gn 15gj -15dr 15dm -15au 15aq -157y 157t -1551 154x -1525 1520 -14z8 14z3 -14wb 14w7 -14tg 14tb -14qj 14qf -14nn 14ni -14kq 14km -14hu 14hq -14ey 14ex -14ca 14d6 -14al 14bm -148w 1490 -1468 1462 -143a 1435 -140e 1408 -13xg 13x7 -13uf 13u7 -13rg 13r7 -13oi 13nu -13l7 13kc -13hr 13gr -13e8 13d2 -13as 1396 -1372 135a -133u 131h -130i 12xx -12xj 12us -12tw 12rb -12pk 12ne -12kz 12jo -12gy 12gk -12e0 12d9 -12ax 129e -127e 125i -123s 121l -1208 11xt -11wo 11u5 -11t9 11qn -11q0 11nb -11ms 11k1 -11jl 11gv -11ge 11dn -11d6 11ag -11a0 1179 -116s 1141 -113k 110u -110e 10xn -10x6 10ug -10tz 10r8 -10qs 10o1 -10nk 10ku -10kd 10hm -10h6 10ef -10dy 10b8 -10ar 1080 -107k 104u -106d 1050 -107r 107c -10a3 109r -10ci 10c0 -10eq 10e8 -10gy 10gh -10iv 10hi -10k8 10jr -10mi 10m1 -10or 10oa -10r1 10qk -10ta 10st -10vk 10v3 -10xt 10xc -1103 10zm -112c 111v -114m 1145 -116w 116f -1195 118o -11ah 119d -118v 1165 -115n 112w -112e 10zo -10z7 10wg -10w0 10ta -10st 10q2 -10pl 10mv -10me 10jn -10j6 10gf -10fz 10d9 -10cs 10a1 -109k 106u -106d 103m -1035 100f -zzy zx7 -zwr zu0 -ztj zqt -zqc znl -zn4 zke -zjx zh6 -zgq zdz -zdi zas -zab z7k -z73 z4d -z3w z15 -z0p yxz -yxi yur -yua yrj -yr2 yoc -ynv yl4 -ykn yhx -yhh yeq -ye9 ybi -ycp yb5 -ydv ydd -yg4 yfn -yid yhv -ykl yk4 -ymv yme -yp4 yom -yrd yqw -ytm yt4 -yvv yve -yy4 yxm -z0d yzw -z2m z24 -z4v z4e -z74 z6m -z9d z8w -zbm zb4 -zdv zde -zg4 zfm -zid zhw -zkm zk5 -zmv zmd -zp4 zon -zre zqx -ztn zt6 -zvx zvh -zy7 zxq -100h 1000 -102r 102b -1051 104k -107b 106v -109l 1094 -10bv 10bf -10e6 10dp -10gf 10fz -10iq 10i9 -10l0 10kk -10na 10ms -10pi 10oy -10ro 10r5 -10tv 10tb -10w1 10vi -10y8 10xo -110f 10zw -112m 1122 -114g 113d -114m 1126 -112b 10zj -10zo 10ww -10x0 10u8 -10v3 10sj -10ut 10tb -10w1 10vo -10yg 10ya -1111 110w -113o 113i -116a 1164 -118v 118z -11bp 11c9 -11ey 11fn -11ib 11j2 -11lo 11mn -11p8 11q8 -11sr 11tw -11we 11xm -1200 121f -123t 1258 -127a 1291 -12aj 12cw -12ee 12gq -12i7 12kk -12m2 12oe -12pv 12s8 -12tq 12w2 -12xj 12zv -131d 133q -1358 137k -1391 13be -13cw 13f8 -13gp 13j2 -13kk 13mw -13oe 13qr -13s8 13uk -13w2 13ye -13zv 1428 -143q 1462 -147j 149w -14be 14dq -14f8 14hl -14j2 14le -14mw 14p9 -14qq 14t2 -14uk 14ww -14yd 150q -1528 154k -1562 158f -159w 15c8 -15dq 15g3 -15hk 15jw -15le 15nr -15p9 15rl -15t2 15ve -15ww 15z9 -161b 162c -164b 1661 -167h 169v -16bb 16do -16fn 16hj -16ji 16le -16my 16pa -16qt 16t4 -16um 16wy -16yc 170r -1724 174j -175v 178b -179i 17c0 -17d8 17fq -17gn 17j9 -17kd 17mp -17pa 17q9 -17sb 17u6 -17ve 17xu -17y8 180y -180c 1831 -181i 183t -183w 186m -186w 189n -18ab 18d1 -18dp 18ge -18h1 18jq -18k7 18mx -18ne 18q5 -18qh 18t8 -18tg 18w8 -18we 18z6 -18za 1922 -1925 194x -194w 197n -197h 19a9 -19a0 19cs -19ce 19f5 -19eq 19hh -19h0 19jq -19j8 19lz -19lc 19o1 -19nd 19q2 -19pc 19s0 -19r8 19tw -19t3 19vr -19us 19xe -19we 19yz -19xu 1a0d -19z5 1a1n -1a0g 1a2z -1a1p 1a45 -1a2u 1a5b -1a43 1a6k -1a7f 1a9x -1aaa 1ad1 -1acc 1af0 -1adu 1agc -1afr 1aih -1ai9 1al0 -1ale 1ao5 -1aop 1arf -1ary 1auo -1ava 1axz -1az1 1b1m -1b2n 1b57 -1b69 1b8u -1ba4 1bck -1bei 1bgh -1bir 1bkb -1bm2 1bo7 -1box 1brk -1bs8 1buw -1bw5 1bym -1c03 1c2g -1c3j 1c62 -1c6u 1c9i -1caa 1ccy -1cdq 1cge -1ch6 1cju -1ckm 1cna -1cnw 1cqm -1cr8 1ctx -1cui 1cx8 -1cxu 1d0k -1d16 1d3v -1d4h 1d77 -1d7z 1dam',
    height: '9e -5 -8 -9 -a -a -9 -9 -9 -8 -7 -6 -6 -7 -5 -5 -3 -5 -4 -4 -4 -3 -3 -3 -3 -2 -3 -1 -1 0 2 0 0 0 0 -2 -2 -3 -4 -4 -4 -4 -3 -4 -4 -3 -3 -3 -2 -1 -1 0 1 2 2 3 3 3 3 1 2 0 -1 -1 -1 -1 -2 -2 -3 -3 -4 -3 -3 -4 -3 -3 -3 -4 -4 -4 -5 -5 -5 -5 -4 -4 -3 -3 -1 -2 0 -1 0 0 0 1 0 2 2 3 1 2 1 2 1 2 1 2 1 2 1 1 2 2 3 4 5 4 5 4 5 5 4 3 3 2 1 -1 -2 -2 -2 -2 -3 -1 -2 -1 -1 0 1 1 2 4 3 3 3 3 2 2 3 2 2 2 1 0 0 0 0 0 -1 0 0 1 1 2 3 4 4 5 5 6 6 6 5 6 4 4 4 2 2 0 0 -1 -1 0 -1 -2 -2 -3 -5 -6 -7 -7 -9 -8 -a -9 -8 -9 -7 -7 -7 -6 -7 -5 -5 -5 -5 -3 -4 -5 -4 -4 -3 -2 -2 -3 -2 -1 -2 -1 0 1 1 1 0 1 1 2 3 5 4 4 3 1 0 -1 -1 -2 -4 -3 -5 -5 -5 -5 -4 -5 -4 -3 -2 -2 -3 -2 -2 -1 -2 -1 -2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 2 1 2 2 2 1 0 -1 -2 -1 -1 -2 -2 -3 -4 -4 -6 -4 -2 1 4 5 7 7 6 6 6 8 8 a a a 9 6 5 1 -1 0 0 -1 -1 0 0 -1 -2 -3 -2 -2 0 1 1 2 2 2 1 0 1 -1 0 -1 -1 -1 0 1 0 0 1 1 0 2 2 2 1 2 2 2 3 2 2 0 1 0 -1 0 -1 -1 0 0 1 1 1 2 0 0 0 0 -2 -1 -2 -2 -3 -4 -5 -5 -5 -4 -4 -4 -3 -3 -3 -2 -2 -2 -3 -2 -2 -3 -1 -2 -1 -2 -1 0 0 0 0 0 1 1 1 2 2 1 2 0 0 -2 -1 -3 -3 -4 -4 -5 -5 -3 -3 -1 0 1 3 3 5 6 8 8 6 5 4 2 1 0 -2 -4 -5 -6 -8 -9 -8 -8 -6 -4 -1 -1 0 1 3 4 6 6 7 7 7 8 6 5 4 4 3 2 1 0 0 0 -1 -2 -2 -2 0 1 1 2 3 3 5 4 4 4 3 3 1 0 -1 -2 -2 -3 -3 -5 -4 -6 -6 -5 -6 -4 -2 0 2 2 4 4 5 6 8 9 a b b 9 8 6 7 5 6 6 6 5 5 4 3 2 2 3 1 2 1 2 2 3 4 5 5 5 6 7 5 5 4 5 4 5 5 5 5 5 5 4 3 3 4 4 3 2 0',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110000000001111111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111000000000000000000000',
    buildings: 'b2,1,26,1f,1r,9,8q 9i,0,1z,2s,2k,9,d4 9o,1,3g,26,34,9,d3 77,1,4o,3r,2p,9,3r b2,1,4q,2j,38,9,8q 6q,1,2l,1t,29,9,88 9c,1,37,27,2o,9,4d 97,1,44,2j,33,9,d4 ah,1,26,1l,1r,9,8r 9v,0,2a,2i,2e,9,4e d7,0,4s,r,10,9,d1 cp,1,21,s,y,9,12 d1,0,57,12,m,9,d1 dh,0,4u,1h,14,9,h7 c0,0,14,x,m,9,0 bk,0,53,11,18,9,ha f1,1,1t,8,7,9,7b f4,1,21,6,d,9,dw f5,1,1e,8,9,9,9i f5,1,14,a,b,9,r 1r,0,4l,5,5,9,n c3,1,1c,1a,1c,9,13 cn,1,3q,1u,4g,9,13 cb,0,1g,6,5,9,4a ca,0,1g,d,9,9,8r cr,1,w,13,w,9,8r a5,0,4k,7,7,3,8q cb,0,12,e,9,9,8q 1r,0,4e,5,6,9,9e f8,0,1f,n,u,9,h7 f3,0,27,b,b,9,f4 f5,0,2q,c,b,9,fb f7,0,36,b,9,9,6g 10,0,38,7,1c,9,fl 1r,0,3u,d,l,9,9c y,0,3e,6,7,9,ew y,0,3r,9,7,9,gg z,0,3d,6,6,9,7t 10,0,3k,6,6,9,6u 10,0,3q,6,6,9,2m 10,0,3y,6,6,9,ba 10,0,46,5,6,9,b7 x,0,3w,6,6,9,hf v,0,3v,6,o,9,8q p,0,3l,8,8,9,e1 s,0,3z,7,9,9,e0 q,0,3k,8,7,9,z r,0,3f,f,i,9,x j,0,3g,1b,l,9,g9 1p,0,4r,6,6,9,e6 11,0,4s,6,6,9,an 10,0,4e,6,8,9,bb 10,0,4j,5,7,9,2k 10,0,4l,7,9,9,fm fb,0,1g,6,6,9,h8 fc,0,1h,5,b,9,19 fc,0,1m,8,a,9,9y fc,0,1u,5,5,9,fr 2,0,2d,h,b,9,5j fc,0,3c,a,7,9,2t fb,0,3x,c,7,9,2s 1,0,2s,b,6,9,2r 1,0,22,e,7,9,2s 1,0,1g,8,7,9,7l s,0,53,d,f,9,e0 u,0,58,6,9,9,d7 u,0,4p,c,c,9,8q w,0,4o,5,8,9,d7 x,0,57,4,8,9,4d y,0,58,4,7,9,cg x,0,4m,5,7,9,d1 y,0,4q,3,a,9,3s y,0,53,4,4,9,3t y,0,4o,6,8,9,3t o,0,3q,7,9,9,dy o,0,3u,7,8,9,dz n,0,3v,9,9,9,e1 m,0,3z,7,8,9,e1 l,0,42,7,7,9,e5 l,0,48,6,6,9,5j j,0,4a,a,8,9,g8 j,0,44,9,6,9,7h i,0,3y,8,6,9,3s 3,0,3n,7,7,9,8q i,0,3v,9,6,9,gu 2,0,4j,8,6,9,5q 2,0,4m,4,7,9,br j,0,4u,4,8,9,4w 2,0,58,j,8,9,ee 2,0,5a,4,7,9,33 1r,0,57,8,7,9,dt 1r,0,53,8,6,9,ds 1s,0,4p,9,8,9,es 1t,0,51,7,8,9,4n y,0,4v,6,7,9,cg',
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
    metres: 5857,
    line: '-7qe -6ri 6u1 -6v7 6xq -6yw 71f -72l 753 -769 78s -79y 7ch -7dn 7g6 -7hb 7jt -7kz 7ni -7oo 7r7 -7sd 7uw -7w2 7yk -7zq 82a -83d 863 -86j 89b -896 8bs -8au 8d6 -8bq 8dn -8bn 8d3 -8ar 8bt -899 8ac -87s 88u -869 87b -84r 85u -83a 84c -81r 831 -80k 81t -7zd 80n -7y6 7zf -7wy 7y8 -7vr 7x0 -7uj 7vt -7tc 7um -7s5 7te -7qx 7se -7q1 7ru -7pr 7rt -7px 7rz -7q4 7s5 -7q9 7sb -7qf 7sg -7ql 7sn -7qr 7ss -7qw 7sy -7r3 7t5 -7r9 7ta -7re 7tg -7rl 7tm -7rq 7ts -7rx 7ty -7s2 7u4 -7s8 7ua -7sf 7ug -7sk 7um -7sq 7ur -7sw 7uy -7t2 7v4 -7t8 7v7 -7ta 7v5 -7t3 7ue -7ry 7sp -7q1 7qi -7ns 7o9 -7li 7lz -7j9 7jq -7gz 7hg -7eq 7f7 -7cg 7cx -7a7 7ap -77y 78f -75p 766 -73f 73y -718 71u -6z5 6zz -6xb 6yg -6vy 6xr -6vn 6xr -6vz 6y7 -6wj 6yr -6x2 6za -6xm 6zu -6y6 70e -6yq 70w -6z7 71e -6zo 71v -706 72d -70o 72v -715 73c -71n 73u -725 74c -72m 74t -734 75b -73m 75t -743 76a -74l 76s -753 77a -75l 77r -761 788 -76j 78q -771 798 -77i 79p -780 7a7 -78i 7ap -78z 7b6 -79h 7bo -79z 7c6 -7ah 7cr -7b5 7df -7bu 7e5 -7cm 7ez -7di 7fy -7en 7h4 -7fv 7ie -7h9 7js -7im 7l5 -7k0 7mj -7ld 7nw -7mr 7pa -7o5 7qo -7pi 7s1 -7qw 7tf -7s9 7ut -7tq 7wa -7v7 7xr -7wn 7z7 -7y4 80o -7zl 825 -812 83m -82j 852 -83z 86j -85f 87z -86w 89g -88d 8ax -89u 8ce -8bb 8dv -8cs 8fc -8e9 8gt -8fp 8i9 -8h6 8jq -8in 8l7 -8k4 8mo -8ll 8o5 -8n2 8pm -8oi 8r2 -8pz 8sj -8rg 8u0 -8sx 8vg -8uc 8ww -8vs 8yc -8x9 8zt -8yp 918 -904 92o -91k 944 -930 95j -94g 970 -95w 98g -97c 99v -98r 9bb -9a8 9cs -9bo 9e7 -9d3 9fn -9ej 9h3 -9fz 9ij -9hg 9jz -9iv 9lf -9kc 9mw -9lt 9od -9na 9pv -9os 9rc -9q9 9st -9rq 9ua -9t7 9vr -9uo 9x8 -9w5 9yp -9xn a07 -9z4 a1o -a0l a35 -a21 a4l -a3i a62 -a4z a7j -a6g a8z -a7v aaf -a9c abw -aat add -aca aeu -adr agb -af7 ahr -ago aj8 -ai6 akr -ajo am8 -al6 anq -amo ap8 -ao4 aqn -api as2 -aqz atj -asg av0 -atx awh -ave axy -awv azf -ayc b0w -azs b2c -b19 b3t -b2q b5a -b46 b6p -b5m b86 -b73 b9n -b8j bb3 -ba0 bck -bbg be0 -bcx bfh -bee bgy -bfu bid -bha bju -bir blb -bk7 bmq -bll bo5 -bn1 bpk -bof bqz -bpv bse -bra btt -bso bv8 -bu4 bwn -bvi by2 -bwy bzh -byc c0v -bzr c2b -c17 c3q -c2l c55 -c41 c6k -c5f c7y -c6u c9e -c8a cat -c9o cc8 -cb4 cdn -cci cd6 -car ca3 -c7e c6g -c3u c2v -c09 bza -bwp bvk -bt1 brt -bpb bo8 -blo bkl -bi1 bgy -bee bd9 -baq b9l -b72 b5w -b3d b26 -azo ayg -avy aur -as9 ar2 -aok anc -aku ajn -ah5 afx -adf ac8 -a9q a8i -a60 a4t -a2b a16 -9yn 9xh -9uy 9tr -9r9 9q3 -9nk 9mh -9jx 9iu -9ga 9f8 -9co 9bl -990 97y -95e 94b -91r 90n -8y3 8w8 -8vf 8st -8tr 8r6 -8s7 8pm -8qn 8o3 -8p4 8mj -8nk 8kz -8lz 8jd -8kd 8hs -8ir 8g5 -8h4 8ei -8fh 8cw -8dv 8b9 -8c8 89n -8am 880 -88z 86d -87c 84r -85s 838 -84a 81p -82r 807 -819 7yp -7zr 7x6 -7y8 7vo -7wp 7u4 -7v6 7sm -7to 7r3 -7s5 7pl -7qn 7o2 -7p4 7mk -7nm 7l1 -7m2 7ji -7kk 7hz -7j0 7gf -7hg 7ev -7fw 7db -7ec 7bs -7cv 7ac -7bh 78y -7a4 77l -78q 767 -77c 74t -75y 73f -74l 722 -737 70o -71t 6za -70g 6xx -6z2 6wj -6xo 6v5 -6wb 6ts -6ux 6se -6tj 6r0 -6s6 6pn -6qs 6o9 -6pe 6mv -6o0 6lh -6mn 6k4 -6l9 6iq -6jv 6hc -6ii 6fz -6h4 6el -6fq 6d7 -6ed 6bu -6cy 6ae -6bj 690 -6a5 67m -68r 668 -67e 64v -661 63j -64p 626 -63b 60s -61y 5zf -60l 5y2 -5z8 5wp -5xu 5vc -5wi 5tz -5v5 5sm -5tr 5r8 -5se 5pv -5r1 5oj -5pp 5n6 -5ob 5ls -5my 5kf -5ll 5j2 -5k7 5ho -5iu 5gc -5hi 5ez -5g5 5dm -5eq 5c5 -5d8 5an -5bn 592 -5a2 57g -58f 55u -56t 547 -555 52j -53i 50w -51v 4za -508 4xl -4yj 4vx -4wu 4u8 -4v5 4sj -4th 4qu -4rr 4p5 -4q2 4ng -4oe 4n6 -4l8 4kb -4hp 4gs -4e5 4d8 -4am 49p -473 466 -43j 42m -400 3z3 -3wh 3vk -3sx 3s0 -3pe 3oh -3lv 3ky -3ib 3he -3es 3dv -3b9 3ac -37p 36t -347 32x -311 2ye -2z9 2wm -2xh 2uv -2vs 2t5 -2u1 2rf -2sb 2po -2qk 2nx -2ou 2m8 -2n4 2kh -2ld 2ir -2jn 2h0 -2hx 2fa -2g6 2dk -2eg 2bt -2cp 2a2 -2aw 287 -28y 26a -271 24d -253 22f -236 20h -218 1yk -1za 1wm -1xd 1uo -1vf 1sr -1ti 1qu -1rk 1ov -1pm 1my -1np 1l1 -1ls 1j3 -1jt 1h5 -1hw 1f8 -1fy 1d9 -1dy 1b9 -1bx 198 -19x 178 -17x 17p -1ac 1a8 -1d0 1cw -1fo 1fl -1id 1ia -1l2 1kz -1nr 1no -1qg 1qe -1t6 1td -1w4 1ub -1vm 1sz -1tw 1ra -1s6 1pj -1qf 1ns -1oo 1m2 -1mz 1kc -1l8 1il -1jg 1gu -1hq 1f3 -1fz 1dc -1e8 1bm -1cj 19w -1as 185 -191 16f -17b 14o -15k 12x -13t 117 -123 zg -10b xo -yk vx -wt u6 -v1 se -t9 qm -ri ov -pq n3 -ny lc -m7 jk -kg ht -ip g3 -gz ec -f9 cm -di aw -bs 95 -a1 7d -85 5f -5x 38 -3x 1a -26 -g -f -28 1d -40 34 -5r 4w -7j 6n -9a 8f -b2 a6 -ct by -ek do -gb fg -g9 ec -dq b0 -ae 7p -73 4d -3r 11 -f -2a 2v -5l 66 -8w 9h -c6 cr -fh g2 -is jd -m2 mm -pc ps -sj sy -vp w3 -yu z9 -11z 12e -155 15n -18d 193 -1bs 1cf -1f4 1fs -1ih 1j4 -1lu 1mi -1p7 1pu -1sj 1t7 -1vw 1wp -1zc 1xk -1z7 1wt -1y8 1vu -1xa 1ux -1wc 1ty -1ve 1t1 -1uh 1s3 -1ti 1r5 -1sl 1q7 -1rn 1pa -1qq 1oc -1ps 1ni -1p1 1mw -1op 1mv -1ox 1nc -1pm 1of -1qx 1q2 -1sp 1rw -1uk 1ts -1wg 1vn -1yb 1xj -206 1ze -222 21a -23y 235 -25t 250 -27o 26v -29i 28q -2be 2al -2d9 2cg -2f4 2eb -2gy 2g5 -2it 2hz -2km 2jt -2mh 2lq -2oe 2nv -2ql 2qd -2t5 2t6 -2vx 2w2 -2yu 2yz -31r 31x -34p 34u -37m 37s -3aj 3ao -3dg 3dm -3ge 3gk -3jc 3jj -3mb 3mi -3p9 3pf -3s7 3se -3v6 3vd -3y4 3yb -413 419 -441 448 -470 476 -49x 4a3 -4cv 4d0 -4fs 4fy -4iq 4iw -4ln 4lx -4oo 4qs -4sg 4ux -4w7 4yo -4zy 52f -53o 565 -57f 59w -5b6 5dm -5ew 5hd -5in 5l4 -5md 5ou -5q4 5sl -5tv 5wc -5xm 602 -61c 63t -653 67k -68t 6ba -6ck 6f1 -6gb 6is -6k2 6mi -6ns',
    height: '1u -4 -4 -4 -2 -3 -2 -2 -1 -2 -1 -2 -2 -2 -2 -1 0 -1 -1 0 0 1 1 3 3 4 3 5 4 4 2 2 0 -2 -3 -4 -4 -4 -3 -4 -3 -3 -3 -2 -2 0 0 2 1 2 1 1 0 -1 0 0 0 1 0 1 2 1 2 2 2 3 2 1 1 1 -1 -1 -2 -3 -3 -3 -2 -3 -2 -2 0 0 2 3 3 3 5 4 5 4 5 4 5 3 2 1 0 1 1 1 2 1 2 0 1 -1 0 -1 -1 -1 -2 -2 -1 -2 0 -2 -1 -3 -2 -3 -3 -3 -1 -2 -2 -1 0 0 0 2 3 4 6 6 6 6 4 5 2 2 0 0 0 0 0 -1 0 0 0 1 0 1 0 -1 -2 -2 -3 -4 -4 -4 -4 -3 -3 -2 -2 -2 -1 1 2 2 3 4 4 5 6 7 6 6 6 5 3 2 1 -1 -3 -6 -8 -a -c -a -a -8 -7 -5 -3 -4 -3 -2 -1 -1 -1 -1 -1 -2 -3 -3 -3 -2 -2 0 1 2 3 3 4 3 3 2 1 0 0 0 -1 0 0 1 1 2 1 3 1 2 2 -1 -2 -3 -4 -5 -6 -6 -6 -5 -4 -2 -2 -1 1 2 3 4 5 6 6 7 7 6 5 5 4 3 1 2 0 -2 -2 -3 -4 -4 -4 -4 -2 -3 -1 -1 0 1 3 3 4 4 3 3 4 2 3 4 4 6 5 6 6 7 6 5 6 4 5 4 5 3 2 0 -1 -2 -4 -3 -2 -3 -2 -3 -3 -3 -2 -2 -2 -1 -2 -1 -1 -1 -2 -2 -2 -3 -2 -1 -2 0 1 1 2 1 3 2 2 1 0 -1 -3 -3 -4 -4 -5 -5 -6 -5 -5 -3 -3 -1 0 0 1 0 -1 0 0 0 0 0 0 0 1 1 2 1 2 2 2 3 4 4 3 3 2 2 2 0 1 0 0 -1 -1 -2 -1 1 1 2 1 2 1 2 1 2 3 3 2 1 0 0 -2 -2 -3 -3 -3 -3 -2 -4 -3 -3 -2 -2 -1 0 1 1 2 1 1 2 1 2 1 2 1 1 1 2 4 5 8 9 7 8 6 5 3 2 0 -1 -3 -4 -6 -7 -7 -6 -6 -5 -3 0 0 2 3 5 4 5 5 5 4 4 3 4 3 4 3 4 4 5 5 5 6 7 8 9 8 9 9 8 8 7 6 5 3 4 3 3 3 4 4 4 3 3 2 2 1 1 0 -1 -2 -1 -3 -3 -3 -2 -2 -2 -1 0 1 1 2 4 4 4 4 3 4 4 3 2 3 1 1 0 -1 -1 -1 -1 -1 0 -1 0 1 2 2 3 4 4 4 3 2 2 1 0 0 -2 -2 -3 -4 -5 -6 -6 -7 -6 -6 -6 -6 -5 -5 -3 -2 -3 -3 -3 -4 -3 -5 -5 -7 -7 -9 -a -d -e -d -e -d -d -d -b -b -9 -8 -7 -7 -5',
    tunnel: '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    buildings: '3c,0,1m,13,13,d,8c 6j,1,40,17,1k,6,46 ao,1,3a,13,16,9,d3 ap,1,17,10,x,6,8r 7,1,17,t,u,q,4h d,1,1j,16,1e,j,z 2,1,1n,1m,z,g,db 8,1,2s,y,j,9,4q 5,1,2s,w,l,9,4o b,1,30,17,q,9,4n 7,1,4f,10,l,9,4p d,1,3k,h,d,9,9v d,1,54,1e,j,9,5k 29,0,3t,1e,m,d,4b 27,0,48,l,x,9,dz 2m,0,4e,q,d,9,4d c3,0,4h,17,g,9,c4 c1,0,31,w,13,d,69 c1,0,3l,k,o,9,cb ef,0,1m,1f,1z,9,dh ft,1,1d,15,16,a,d2 el,0,27,b,f,9,0 28,1,18,l,r,9,1 p,0,11,1g,1g,t,hd fm,0,n,25,1i,6,5y 12,0,1c,q,m,9,4b 1c,0,12,w,o,9,3 1h,0,15,o,b,9,8q 1v,0,13,f,j,9,4a 21,0,19,m,o,d,71 2o,0,1e,1b,x,d,0 3n,0,16,s,v,9,2 3w,0,1e,1x,1q,9,hf 3n,0,2a,v,12,9,3 3t,0,29,u,10,9,0 3q,1,2o,1e,1h,d,0 53,1,2b,26,2f,j,0 4x,0,p,16,11,t,8p 55,0,1m,12,19,28,d7 6y,1,2m,w,17,t,d6 6w,1,4p,r,t,1f,d7 7b,1,48,1n,22,9,db fq,1,2e,12,1h,t,c6 fr,1,55,z,u,9,4d 60,0,3r,1p,1t,w,8q 8i,0,4l,1e,1b,g,4c 8l,0,3i,b,e,6,4c 8s,0,3h,18,14,g,1 99,0,3i,l,j,9,d4 6o,1,44,16,16,1s,8w 0,1,58,1i,1e,9,1u f2,0,1k,o,16,a,98 cj,1,q,q,r,12,4d e5,0,1a,w,10,d,4c cd,0,v,m,j,5,8r es,0,1c,1d,1f,j,d1 c4,1,10,m,t,19,8x cw,0,r,z,18,f,0 c5,0,12,16,16,9,3 c9,1,y,l,j,12,d9 bh,0,2v,x,11,9,8m e3,0,24,18,16,d,e0 72,1,4l,u,14,q,4q 74,1,2l,k,s,q,dj 2q,0,4b,l,o,9,4d 2o,0,4p,b,9,9,0 92,1,1v,m,p,9,8s 92,1,u,u,w,9,8t 90,1,t,n,m,9,8s 8w,1,k,j,j,9,8t 8u,1,q,g,i,9,3 8q,1,p,l,n,9,3 8m,1,p,k,n,9,8t 8n,1,1f,t,u,9,1 8u,1,20,17,15,j,8r 8n,1,20,s,s,d,8r 8x,1,21,h,e,j,8q 8z,1,1v,d,f,j,d4 8j,1,1d,15,10,d,d4 as,1,1f,v,10,1c,he aj,1,1f,p,p,g,d3 ab,0,53,g,l,a,p c5,0,53,l,u,9,6a ci,0,2k,c,a,5,4c c0,0,3u,d,b,9,d1 c0,0,48,i,g,9,8q c0,0,4l,k,g,9,2 c0,0,4q,j,i,9,1 2d,0,3w,1i,p,9,d4 c0,0,28,l,k,d,4q c0,0,2h,s,i,d,4k c0,0,1r,e,e,d,93 c0,0,1s,i,d,6,dg c0,0,1c,b,9,d,93 c0,0,1k,o,f,a,dg c0,0,12,p,h,6,4q b9,0,3l,h,k,9,8h bh,0,3x,t,12,d,hb bi,0,36,f,f,9,8i b9,0,35,g,l,9,8h b8,0,3z,k,k,9,ha b9,0,2q,p,m,9,8k c0,0,3f,f,c,9,df c0,0,3z,j,g,9,8r c0,0,2i,h,g,9,9l c0,0,3d,k,f,9,1 c0,0,2u,c,i,9,x c0,0,2w,e,c,9,4 c1,0,56,j,i,9,3j c1,0,4m,j,h,9,c3 c1,0,4a,h,c,6,c9 c1,0,3o,i,m,9,c0 2j,0,42,15,h,9,4g 2f,0,3f,z,p,9,d4 2f,0,4j,h,f,9,4e 2i,0,2u,p,k,9,8r 2h,0,48,l,n,9,hf bc,0,2t,p,r,g,h9 b5,0,2i,o,l,d,8o b9,0,1c,l,j,a,ha ca,0,n,t,s,9,d5 bw,0,w,a,c,9,c5 bw,0,h,b,b,9,3f bv,0,1e,n,s,a,g0 2v,0,4g,p,n,9,8n 2r,0,2t,i,g,9,8p 2v,0,3l,19,p,9,4a 2r,0,35,e,c,9,0 2n,0,1x,e,a,9,8q 2r,0,3p,f,e,9,8p 31,0,2x,j,k,a,8k 2z,0,34,s,j,a,d2 32,0,2u,g,d,a,3y 32,0,4f,19,g,a,3y cd,1,4h,b,e,9,d5 br,1,4j,i,i,9,c1 cf,1,4l,f,j,9,8q br,1,3y,e,i,9,c1 br,1,2t,9,b,9,c1 br,1,2o,c,c,9,3b br,1,34,c,d,9,c1 br,1,4t,9,c,9,c1 br,1,56,8,b,9,3b br,1,4g,b,c,9,c1 br,1,3s,e,c,9,39 br,1,3e,d,g,9,7p en,1,53,o,s,a,fu ev,1,4d,u,10,9,hc er,1,4x,h,i,9,4a 8w,1,36,1b,18,g,0 g9,0,2z,b,7,9,4z 0,0,2v,c,5,9,53 g7,0,32,3,3,9,9h g9,0,36,6,6,9,do g8,0,34,5,3,9,96 g8,0,2w,8,7,9,92 g8,0,38,6,5,9,dx g0,0,38,h,a,9,1f fz,0,3e,9,9,9,a4 g2,0,2v,c,8,9,a0 94,1,3z,f,g,9,4e 93,1,32,9,b,9,4f 8l,1,35,p,r,d,3 94,1,4n,e,g,9,d0 8o,1,33,h,g,d,3 91,1,32,f,d,9,1 8q,1,3b,b,c,g,hf 8i,1,3j,o,q,d,d6 94,1,36,m,h,9,4f 8r,1,4a,g,j,9,1 8j,1,4v,t,v,9,8p ab,0,1n,l,q,9,53 ac,0,3r,i,h,9,4d ab,0,24,n,t,9,dr ab,0,28,h,f,9,q ab,0,x,b,d,d,9i ac,0,2r,b,a,d,2 ab,0,34,e,e,9,ds ac,0,2h,9,9,9,hf ab,0,x,h,j,d,50 ab,0,2l,e,j,9,ds ab,0,3n,f,g,9,51 ab,0,1z,n,o,9,50 ab,0,4i,i,l,9,9d ab,0,2r,l,j,9,dr ac,0,3r,f,f,6,d3 ab,0,32,b,b,9,n ab,0,3a,e,f,9,52 ac,0,37,f,b,a,4b ab,0,39,h,e,9,54 ab,0,2t,g,j,9,54 ab,0,43,n,o,6,dr 9c,1,1k,1f,1k,d,1 ay,1,4z,y,15,1s,8u ab,0,4w,h,j,9,dt ab,0,3k,d,e,9,dt ab,0,45,r,r,9,dt 3k,0,48,m,i,9,dc 33,0,4n,l,d,9,co 3c,0,36,g,d,a,h1 3f,0,3c,h,e,9,89 3a,0,32,m,f,a,8b 35,0,3a,1a,t,a,ck ab,0,4f,p,r,9,q 3i,0,3j,m,i,d,89 aj,0,18,f,f,a,d3 9f,1,3h,w,10,9,d4 aj,0,k,e,f,d,4e 9p,1,32,r,l,9,8o bd,0,1l,z,y,d,8j a0,1,1v,z,15,d,5 bj,0,1h,t,o,a,3o 9r,1,3l,v,w,9,4n 99,1,3x,16,11,9,4d 9k,1,1t,u,q,9,8r br,1,2f,u,y,12,3b cd,1,3s,d,c,9,1 ck,1,2y,8,b,9,8t cd,1,3f,9,8,9,4e cd,1,2z,9,a,9,8s cf,1,31,e,h,9,4e ck,1,3x,9,8,9,8s ck,1,38,a,b,9,4g ck,1,3n,9,b,9,8w cf,1,3t,g,e,9,4f ci,1,3s,d,f,9,3 ch,1,3g,a,a,9,da 9a,0,47,l,l,a,8q 4i,0,3q,g,e,9,8n 9g,0,4g,o,u,d,8q 9y,1,q,g,p,g,4i a9,0,v,p,t,a,d4 a1,1,k,l,s,g,4 a8,1,i,p,y,9,8q ah,1,o,t,x,9,1 a4,0,1u,k,k,9,4e b1,1,10,x,x,9,8s b3,1,1n,b,c,9,4f b5,1,1s,a,c,9,8s b5,1,1e,a,b,9,1 b5,1,n,l,l,9,d5 b1,1,1o,f,h,9,8s b4,1,i,a,b,9,2 as,1,2o,r,q,a,d4 bg,1,11,1g,1d,9,he as,1,2v,b,a,a,hf as,1,3p,c,h,9,8u as,1,31,a,c,a,8p b5,1,3x,k,k,9,d3 as,1,2r,e,d,a,4c as,1,3m,d,d,9,8u 7x,1,4f,t,q,d,d2 8y,1,4h,e,g,9,8t 8f,1,50,l,m,9,4f 8b,1,3i,13,1u,9,0 fk,1,k,b,h,9,8o fd,1,1d,k,13,9,4b f4,1,13,1a,10,q,9p f4,1,4h,j,s,g,v f2,1,2c,h,l,9,k f5,1,4y,h,l,g,5b f8,1,o,g,q,q,8p fn,1,s,n,o,9,eq 82,1,1p,t,u,12,4 87,1,1o,h,h,8,d5 88,1,o,w,10,9,1 8a,1,1l,p,n,9,d4 dx,0,2s,1i,1f,d,3q em,1,q,m,p,9,hf ew,1,1l,1s,1r,9,8p e2,1,k,l,j,6,3t ee,1,o,i,n,9,ed fo,1,38,1a,18,d,e4 9i,0,38,s,o,d,8p ez,1,31,t,n,9,4a ez,1,48,h,k,9,hf f4,1,33,1s,1c,g,59 ev,1,2x,y,1a,9,8o dq,0,39,r,o,d,3w d3,0,2m,r,s,d,d3 cy,0,2o,o,t,9,48 cy,0,3t,m,l,9,48 d4,1,u,y,14,d,8s d2,1,3y,1s,28,g,4c 8w,0,4f,p,l,19,4d 59,0,4o,19,1d,j,8m em,1,34,r,t,9,8n en,1,1s,i,g,9,d5 el,1,1t,h,k,9,he eh,1,47,1c,12,12,1b m,1,13,6,7,3,bj 8k,0,4h,l,n,9,d5 70,1,3h,k,l,9,da 6i,1,3h,a,b,6,6v 4j,1,26,d,b,9,8p 40,1,1f,v,t,a,d0 3x,0,42,1f,1b,d,8q a4,0,4b,f,c,9,8j do,1,23,1p,1d,9,8g ck,0,3l,b,b,5,4d eo,1,18,a,c,9,d3 en,1,2h,e,f,9,4b y,0,1d,10,q,9,dr v,1,1d,k,m,6,dd cu,0,4s,1b,1r,d,0 fx,1,43,j,o,9,2z 84,1,10,s,p,a,d4 81,1,w,w,r,9,1 9a,0,3i,h,l,g,1 9d,0,3m,l,j,g,d6 7c,1,1l,1i,21,9,da 7g,1,2s,1y,2m,9,6o 7g,1,4b,m,k,q,29 8q,0,11,14,x,8,0 7g,1,37,o,u,m,6n 9i,0,3m,m,n,6,8q 61,0,2q,6,7,5,0 7k,1,m,m,o,6,8p 3u,0,4b,1k,11,9,8q 9m,0,3g,l,r,9,d2 7s,1,18,1q,1s,9,1 3o,0,42,v,16,9,8p 9m,1,15,2a,26,g,1 a2,0,27,1f,16,9,8i b3,1,46,m,u,9,3 fq,1,3w,j,k,t,7q 1s,0,2a,e,d,t,e6 1f,0,38,e,7,6,87 1f,0,2a,k,h,6,dd 10,0,2f,8,a,6,fe 17,0,3h,f,h,6,fu 23,0,2h,a,c,d,5v 23,0,22,j,n,g,el 24,0,2w,c,d,a,e4 25,0,54,1l,1t,d,5b 20,0,2f,9,p,6,gv ew,0,48,8,9,6,bq ex,0,4p,7,7,6,gm b1,1,2j,z,z,12,2 fa,1,1g,d,s,d,49 dr,1,3v,j,u,m,8p ei,1,51,y,u,d,af br,1,18,p,u,19,gg 87,0,l,1e,1e,q,8r 87,0,23,1e,1e,q,1 7p,0,l,1e,1d,g,8o 7d,0,l,q,r,d,8s 7o,0,21,1d,1f,q,he 82,0,23,e,i,a,1 7v,0,1h,s,o,12,d1 7v,0,23,f,f,a,8o 7u,0,n,e,i,a,8o 82,0,19,s,o,12,4e 82,0,n,f,f,a,1 ae,0,3g,x,u,d,4f b6,0,2z,f,e,6,4c aj,0,2a,m,s,g,d4 ag,0,1u,z,1a,6,d5 ad,0,2r,e,d,6,d5 af,0,u,1p,14,d,d5 1,1,3v,k,e,9,4m g5,1,3b,12,13,9,0 2y,1,3y,c,c,6,al 4o,0,4i,1c,1b,a,hd 1v,0,4i,b,d,9,30 h,1,3p,g,h,6,g7 g,1,4p,b,e,6,6c 2o,1,1l,9,a,6,ax 2v,1,1r,7,7,3,5w fs,1,4y,c,g,a,2z dc,1,2z,19,1k,19,b7 di,1,4f,t,r,a,gq dh,1,3z,o,w,d,5 d5,1,4p,8,e,6,dy cw,1,26,r,x,12,hf dk,1,e,a,a,3,8v d9,0,i,b,d,a,0 df,0,f,h,m,6,h5 dh,0,17,9,c,a,cs dt,1,1w,u,z,6,3w ds,1,4i,1x,1i,a,ca 3c,0,40,n,m,9,3z bk,0,o,10,t,a,0 ce,1,k,j,l,12,2 ce,1,23,p,v,6,d5 cc,1,25,w,16,d,8v cb,1,1l,9,8,6,d8 ct,1,2e,u,r,6,4i cd,1,z,k,l,t,8s br,1,4l,l,s,6,bz br,1,4z,k,r,d,c0 bs,1,3e,z,u,6,gi cb,1,3y,8,b,3,8r bi,1,4z,q,o,1f,4c ba,1,4y,l,m,d,cz as,1,3y,j,s,a,3 as,1,2w,1c,16,9,8q aw,1,z,y,13,9,d5 as,1,3m,1b,1h,a,8p as,1,4u,h,j,9,8r as,1,35,w,10,a,8p as,1,59,e,b,t,4e b2,1,3p,l,n,9,2 b5,1,2p,h,l,d,d6 as,1,5a,j,u,9,8s as,1,1i,t,r,a,8p ba,1,10,z,10,9,4a 7g,1,55,1z,2i,9,6n 7g,1,59,g,j,t,6k 7h,1,3y,x,w,12,d4 7h,1,3u,17,12,9,cy 82,1,3a,u,r,3,4d 7j,1,x,9,a,3,4b ea,1,1s,v,x,a,dy ec,1,29,j,d,q,n ed,1,1r,d,n,a,e8 cp,0,3v,o,m,3,1 cv,0,45,g,f,3,d5 cs,0,3d,8,8,3,d2 cv,0,3j,q,s,a,8p ct,0,2f,s,y,6,2 bq,1,g,p,t,a,1 bg,0,z,i,l,3,8q br,1,1h,8,a,3,c2 bd,0,s,l,k,3,8q be,0,f,o,w,a,0 bj,0,y,d,d,3,82 ba,0,l,q,s,a,8q av,0,r,k,n,t,4d b5,0,h,j,k,19,0 ax,0,c,k,l,9,0 ax,0,17,k,l,9,8r 4i,0,4h,g,e,6,d1 dr,0,r,x,12,9,cm dp,0,15,e,f,q,3y dp,0,2i,g,i,3,cl dq,0,25,q,k,w,gy 12,0,4t,b,8,9,c g9,0,29,6,5,9,7 2,0,2m,5,4,3,96 1k,0,1q,f,a,9,95 46,1,1p,9,9,9,5v b2,1,4w,b,f,a,d5 1y,0,z,g,m,9,8n 30,0,1w,e,c,a,ha 31,0,1v,e,c,6,8j 32,0,1r,l,f,a,3z 32,0,14,l,d,a,h2 30,0,17,i,i,a,cy 17,0,1a,s,o,9,8r 4e,0,w,1j,1a,9,8n 47,0,12,q,j,9,d2 46,0,13,w,w,9,d2 46,0,23,11,t,9,8o 4a,0,2k,x,v,9,hd 4g,0,2d,s,y,9,he 2j,0,z,u,d,9,8r 2j,0,1m,10,p,9,0 2d,0,11,u,g,9,8n 2d,0,1p,q,k,9,0 2w,0,1u,k,b,9,8q 2u,0,1h,c,8,a,4e 2v,0,11,k,h,a,3 2w,0,1h,c,b,a,4e 2z,0,42,d,e,9,he 2z,0,4k,b,9,9,4a 30,0,4q,c,9,9,hb aw,1,3w,v,w,9,3 ax,1,3k,m,w,9,2 at,1,3n,e,c,9,4g 47,0,42,14,z,9,8m eu,1,2x,i,g,9,4b 7q,1,2v,l,m,d,8p 7v,1,36,x,z,g,he 7l,1,2t,h,j,d,0 7j,1,39,l,n,d,4d 93,0,u,q,11,9,4f 90,0,g,q,q,9,8r 8u,0,o,s,v,9,8r 92,0,24,16,15,9,0 8u,0,1q,j,k,9,4d 8s,0,1n,h,j,9,4d 8t,0,2a,n,o,j,8q 8j,0,t,11,t,9,d4 8k,0,22,t,x,9,2 8p,0,2a,v,v,9,0 1x,0,3s,g,b,9,2i 12,0,2d,h,d,9,h8 22,0,3b,g,o,9,fj 7j,1,43,4,4,3,4h 7j,1,4c,8,7,3,d4 7n,1,46,a,9,3,4e 7k,1,50,i,h,a,4f 7n,1,54,w,17,a,d5 7p,1,4w,v,13,a,4c 7t,1,51,1l,16,3,4c 7h,1,4x,9,9,3,4d 84,1,3y,c,b,3,4e 1u,0,4i,8,9,9,ga 17,1,2k,n,g,9,80 2w,0,1w,m,b,a,0 4y,0,2c,q,r,9,hd 4w,0,20,q,t,9,8n 53,0,t,k,h,9,1 53,0,1q,o,s,9,8s 23,0,57,k,g,6,ah 5,0,2u,i,e,3,e p,0,24,v,n,3,8n u,0,2d,f,f,a,ab 5z,0,w,3m,3b,3,8q 5n,0,y,j,j,3,4c 1h,0,3y,g,p,9,bj 8u,0,3d,8,7,6,0 o,1,25,4,9,9,3q 5o,1,2f,c,e,9,4e 5u,1,2b,d,f,9,1 5u,1,1p,e,g,9,4g e,1,2g,n,q,9,5z 5q,0,2f,6,6,3,fb 6r,0,1y,6,6,3,ce 1a,0,2f,14,n,6,4 2b,0,1o,3,3,9,4d 2b,0,1b,3,3,9,4h f7,0,y,4,7,3,50 f9,0,1m,5,8,9,4e et,0,52,6,6,9,ca es,0,4y,c,e,9,cb fe,0,45,5,5,9,4l fd,0,3f,7,7,9,8r fe,0,4f,f,e,9,36 fd,0,47,5,a,9,da ff,0,3l,6,a,9,4i fi,0,3m,a,9,9,ga fg,0,3m,7,9,9,57 fh,0,3k,9,c,9,8r fa,0,3f,6,9,9,4d fb,0,3f,6,8,9,d5 fc,0,3p,7,7,9,0 fc,0,3d,4,8,9,1 fd,0,3u,5,8,9,8y f8,0,36,9,a,9,7x f8,0,3q,e,a,9,2c f7,0,3h,d,6,3,2a fa,0,3p,3,6,9,4e fb,0,3y,3,7,9,8r g4,0,2x,8,6,9,hf g3,0,37,6,5,9,b6 g4,0,2u,4,4,9,al g5,0,2z,c,d,9,9 y,0,2v,f,d,9,ej 2,0,3a,b,c,9,e9 g5,0,34,9,8,9,3 z,0,4t,6,5,9,5l ff,0,45,5,8,9,d0 fz,0,3t,5,5,9,bb fz,0,49,6,b,9,7f g1,0,4j,8,f,9,g4 g1,0,4s,3,5,9,7g g0,0,4w,6,8,9,g8 g1,0,57,5,5,9,3m ff,0,4d,6,6,9,8f fi,0,40,6,7,9,8s ff,0,42,5,7,9,4d fg,0,42,7,8,9,9 fh,0,48,4,5,9,7 fg,0,4e,6,8,9,ca fg,0,4n,4,6,9,8 fb,0,45,6,6,9,8r f9,0,3y,8,8,9,3 eb,0,3z,c,c,3,9k e8,0,3f,d,7,9,gt e3,0,3a,d,c,9,h e3,0,3b,8,9,9,5v e3,0,3j,7,5,9,9 e3,0,4w,6,6,9,5b e3,0,3t,a,b,9,s f9,0,4b,5,4,9,es fa,0,46,6,8,9,e8 f9,0,46,6,4,9,ax f6,0,3s,5,5,3,f6 f5,0,3v,5,6,3,1v f8,0,4g,8,9,3,bs f9,0,4k,a,9,9,7h f7,0,4o,7,9,3,85 f8,0,44,9,4,9,2e f6,0,40,8,7,3,fq f7,0,3z,6,4,3,fe f7,0,47,3,3,9,7f ff,0,59,8,8,9,5t ff,0,4w,a,6,9,2a g2,0,52,6,8,9,34 g3,0,4u,5,7,9,7n g3,0,4h,3,6,9,2v g4,0,4i,4,7,9,2j g5,0,4f,9,8,9,1u g4,0,4d,5,5,9,ew g5,0,4a,6,6,9,ev g5,0,45,7,8,9,1r g6,0,3y,7,8,9,1l g5,0,4r,9,8,9,65 g1,0,47,5,7,9,bo g4,0,4w,5,5,9,f2 g4,0,52,6,6,9,ew g5,0,56,5,5,9,f3 fc,0,4v,9,7,9,1y fd,0,4z,7,6,9,ez f6,0,4h,9,a,3,gh fz,0,3q,5,5,9,ep g0,0,3o,6,5,9,eq g1,0,3g,8,6,9,a8 g2,0,49,7,7,9,ga g3,0,42,8,7,9,1j g4,0,3e,b,a,9,6b g6,0,3k,7,9,9,ae g4,0,3u,d,b,9,ag g3,0,3m,8,a,9,6b g3,0,3u,9,7,9,ej g2,0,3e,8,b,9,f6 g6,0,3b,5,6,9,91 g3,0,38,9,9,9,6f g4,0,59,5,6,9,fa f5,0,4a,5,4,3,fa ez,0,43,6,4,3,ep ez,0,44,5,4,3,1z es,0,32,e,c,9,fv e4,0,34,c,b,9,h9 e4,0,36,b,9,9,2k e6,0,34,8,6,9,gr e3,0,37,b,8,9,dj e3,0,3j,9,9,9,5 e3,0,3x,8,a,9,14 e3,0,4j,h,p,6,1f e3,0,4k,6,8,9,6n e3,0,5a,8,c,9,a4 e3,0,44,7,b,9,21 e3,0,3x,5,6,9,es e3,0,3n,6,5,9,5v e3,0,46,5,8,9,ap e3,0,41,5,6,9,1t e3,0,3s,5,5,9,5u 9p,1,40,j,g,9,8s eq,0,4v,k,k,3,az eo,0,5a,4,5,9,bf eo,0,46,9,a,3,32 eb,0,4i,7,6,3,4i ep,0,4p,l,i,3,b1 20,0,57,h,c,9,k df,0,s,g,k,9,8e e3,0,3y,8,7,g,bl f5,0,3l,4,6,3,8z ev,0,2u,c,b,9,8q ev,0,3t,6,8,9,cg 23,0,4n,i,f,9,5i 15,0,2g,k,j,3,8w 6d,1,2i,9,8,9,d6 5t,1,2f,8,9,9,d4 5e,0,1a,4,4,9,8n 5e,0,2g,5,5,9,8k 6p,1,1t,7,6,9,1 69,0,1x,f,d,9,8r 65,0,1x,f,d,9,1 63,0,1x,f,d,9,1 60,0,1y,f,d,9,8r 5y,0,1x,f,d,9,8r 5v,0,1x,f,d,9,8q 5r,0,1x,f,d,9,8q 5o,0,1t,b,9,9,8q bf,0,k,6,6,9,8q 52,0,k,6,7,9,1 4w,0,i,4,6,9,9y 57,0,1n,9,a,9,4t bz,0,c,4,5,9,8k bw,0,1t,j,c,9,2x bw,0,18,5,7,9,gi bw,0,p,3,4,9,7s bb,1,15,a,a,9,4a ba,1,y,d,h,9,4a e3,0,56,6,5,6,9q 9z,0,3v,f,g,9,48 3x,0,49,e,c,9,4d 3v,0,49,e,c,9,d3 3r,0,4q,6,8,9,3 br,1,3k,d,e,9,7o cf,1,4x,5,6,9,0 br,1,35,e,f,9,gg br,1,41,b,b,9,c1 ce,1,5a,8,9,9,3 35,0,4z,m,f,9,8b 3b,0,52,g,m,9,df ab,0,53,f,o,9,q 3f,0,55,l,k,9,8z 39,0,4v,7,7,9,4p ab,0,4z,d,d,9,53 ab,0,57,7,7,9,9g ab,0,4g,e,f,9,q 36,0,4f,d,g,9,3y 3e,0,42,v,1h,9,3w ab,0,4z,8,a,9,q 1g,0,53,9,i,9,cb 1d,0,54,a,9,9,8h 1c,0,56,e,m,9,dn 1h,0,4e,7,a,9,ed 20,0,3b,a,9,9,fh 20,0,3i,a,c,9,6l 1h,0,4c,9,8,9,a0 1v,0,3e,c,9,9,6a 1x,0,45,p,e,9,38 1x,0,4o,a,e,9,8v 1u,0,4s,e,g,9,ga 1f,0,4h,c,c,9,u 1d,0,43,9,4,9,9 1d,0,4a,x,f,9,h9 18,0,49,g,c,9,8t 16,0,49,f,8,9,d9 18,0,49,c,9,9,4g br,1,59,e,f,9,3d br,1,4y,d,i,9,3c 24,0,4n,b,c,6,5o 28,0,n,4,3,9,6 22,0,43,c,c,9,6t 22,0,4k,8,c,9,gg 21,0,4g,a,d,9,85 21,0,3v,d,d,9,fg 20,0,48,9,a,9,bc 20,0,4k,8,8,9,l 1z,0,4p,7,6,9,d 1z,0,4k,7,b,9,2y 23,0,42,8,9,9,7b e3,0,4y,1b,1v,a,a5 f6,0,4z,q,s,3,33 2w,1,2m,a,6,3,8 2x,1,2u,6,6,3,da au,1,4u,8,a,3,d6 as,1,52,6,6,3,4g y,0,3x,n,f,9,e7 x,0,3m,d,b,9,x w,0,3c,g,8,9,1g y,0,59,f,a,9,ee g8,0,4l,e,b,9,1l 1,0,3q,e,e,9,ed t,0,3y,7,5,9,a1 s,0,3p,d,c,9,9z 1,0,48,a,6,9,1h v,0,45,a,a,9,e9 x,0,41,a,b,9,4c r,0,2x,g,e,9,eh z,0,3y,e,c,9,13',
    boats: '4u,1,6j,u,8o 4q,1,6s,12,8o 4t,1,79,x,8o 4r,1,7v,g,8o 4t,1,8h,t,8o 4s,1,8q,j,d1 4t,1,8z,11,4b 4w,1,90,w,he 4u,1,7s,12,he 4w,1,7d,l,he 4v,1,6g,h,4b 4u,1,5m,i,d2 6i,1,5h,11,bo 6i,1,5i,g,bo r,1,99,10,gk s,1,8i,m,gk n,1,82,q,gs r,1,7c,p,gk m,1,6v,l,gs o,1,66,x,gr l,1,5p,w,gs j,1,65,g,c8 j,1,6u,z,c8 j,1,6s,l,3i k,1,64,13,3i l,1,6o,k,80 k,1,73,p,c6 j,1,7p,10,3q l,1,7g,v,3o m,1,80,z,83 m,1,8l,k,ce j,1,89,k,ce r,1,8u,j,7u m,1,92,v,ce 3h,1,5s,j,8g 3f,1,6g,v,8g 3h,1,70,h,8g 3f,1,7o,13,8g 3i,1,88,s,8g 3g,1,8h,v,ct 3e,1,8i,x,h7 3f,1,79,10,h7 3e,1,6o,m,h7 3f,1,61,f,h7 3d,1,5h,u,h7 6i,1,6m,h,bx 6i,1,7d,o,bx 6i,1,7t,r,bx 6i,1,8i,r,bx 6i,1,9a,k,7p 6i,1,6y,10,37 6i,1,6l,13,37 6i,1,6e,p,fp',
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
