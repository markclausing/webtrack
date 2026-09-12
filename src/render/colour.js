/**
 * Colours, and the three things ever done to one.
 *
 * A colour is a packed integer in the order a canvas wants its bytes - red in
 * the low byte, alpha in the high one - because that is what the software
 * rasteriser wrote into its pixel buffer and what the vertex buffer now takes a
 * copy of. Keeping the format meant the six hundred lines of palette next door
 * did not have to change when the renderer did.
 *
 * What did change is `md`. It used to snap every channel to one of thirty-two
 * steps, because the picture was being built for a machine that had that many
 * and because flattening the palette is half of what makes flat shading read.
 * The card has sixteen million and the snapping was costing the two places that
 * most needed the difference - a sky, which was five stripes and a great deal of
 * ordered dither to hide the joins, and a corner at dusk, where the shading on a
 * car went from one step to the next in a band you could see move. So the
 * quantisation is gone and the name is kept: there are four hundred calls to it
 * and every one of them means "a colour".
 */

/** A colour, from three channels. Clamped, and nothing else. */
export function md(r, g, b) {
  const q = (v) => (v < 0 ? 0 : v > 255 ? 255 : v) | 0;
  return (255 << 24) | (q(b) << 16) | (q(g) << 8) | q(r);
}

/** Two colours, mixed. Used for fog, for the time of day, and for lighting a face. */
export function mix(a, b, t) {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  const ar = a & 255; const ag = (a >> 8) & 255; const ab = (a >> 16) & 255;
  const br = b & 255; const bg = (b >> 8) & 255; const bb = (b >> 16) & 255;
  return md(ar + (br - ar) * u, ag + (bg - ag) * u, ab + (bb - ab) * u);
}

/** The same colour, darker or lighter. `s` of 1 is unchanged. */
export function shade(c, s) {
  return md((c & 255) * s, ((c >> 8) & 255) * s, ((c >> 16) & 255) * s);
}
