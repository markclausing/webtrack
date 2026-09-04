/**
 * A polygon renderer, in software, at 320 x 224.
 *
 * There is no WebGL here and no library. Every triangle is transformed,
 * clipped, projected and filled by hand into a Uint32Array, and the result is
 * blown up to fit the window with the smoothing turned off. That sounds like the
 * slow way round and is not: two thousand flat triangles over seventy-one
 * thousand pixels is a few milliseconds of arithmetic, and doing it this way
 * buys the one thing a modern pipeline will not give you - the actual look.
 * Hard-edged pixels, no filtering, no gradients, no anti-aliasing, colours off a
 * fixed palette, and a horizon that bands.
 *
 * The depth buffer holds 1/z rather than z, because 1/z is what interpolates
 * linearly across a triangle in screen space. That is the whole trick, and it is
 * why the fill loop has no divisions in it.
 *
 * Coordinates: +x right, +y up, +z forward. The camera looks down +z at zero
 * heading, which is the same convention the road is built in, so a node's
 * heading can be handed straight to the camera.
 */

import { FOCAL, NEAR } from '../constants.js';

/**
 * Snaps a colour to the 512 a Mega Drive could make: three bits a channel.
 *
 * Called on the way in rather than on the way out, so it costs nothing per
 * frame, and it is not decoration - it is what stops two greens that were
 * nearly the same from staying nearly the same. The palette does the flattening
 * that a flat-shaded renderer wants anyway.
 */
export function md(r, g, b) {
  const q = (v) => Math.round(Math.max(0, Math.min(255, v)) / 255 * 7) * 255 / 7 | 0;
  return (255 << 24) | (q(b) << 16) | (q(g) << 8) | q(r);
}

/** Two colours, mixed and re-snapped. Used for fog and for lighting a face. */
export function mix(a, b, t) {
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  const ar = a & 255; const ag = (a >> 8) & 255; const ab = (a >> 16) & 255;
  const br = b & 255; const bg = (b >> 8) & 255; const bb = (b >> 16) & 255;
  return md(ar + (br - ar) * u, ag + (bg - ag) * u, ab + (bb - ab) * u);
}

/** Same colour, darker or lighter. `s` of 1 is unchanged. */
export function shade(c, s) {
  return md((c & 255) * s, ((c >> 8) & 255) * s, ((c >> 16) & 255) * s);
}

/**
 * The four by four ordered dither, in the order Bayer put them in.
 *
 * Sixteen thresholds arranged so that whichever fraction of them is below a
 * given level, the pixels that light up are as far apart as they can be. That
 * is the whole of it, and it is why a checkerboard of two blues looks like a
 * third blue rather than like a checkerboard.
 */
const BAYER = new Uint8Array([
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
]);

export class Raster {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.cx = width / 2;
    this.cy = height / 2;
    this.image = new ImageData(width, height);
    this.pix = new Uint32Array(this.image.data.buffer);
    this.depth = new Float32Array(width * height);
    // Scratch, reused every triangle. Allocating three vectors per polygon at
    // two thousand polygons a frame is the one thing that would actually cost
    // something here.
    this.va = new Float64Array(24);
    // One longer than the input: clipping a polygon against a plane can add a
    // corner, and a buffer that was exactly big enough would drop it.
    this.vb = new Float64Array(30);
    this.cam = { x: 0, y: 0, z: 0, sy: 0, cy: 1, sp: 0, cp: 1, sr: 0, cr: 1 };
    this.tris = 0;
    /**
     * The focal length, which is the field of view, which moves with speed.
     *
     * It lives on the instance rather than in constants.js because the renderer
     * changes it every frame: flat out the view is pulled wide so that the world
     * goes past at the edges of the screen instead of through the middle of it.
     * That single number is doing more for how fast this game feels than the
     * speed itself is.
     */
    this.focal = FOCAL;
    /**
     * A second colour, chequered one pixel at a time against the first.
     *
     * Three bits a channel means the gap between one grey and the next is a
     * long way, and a road banded between two of them looks like a zebra
     * crossing. This is what the hardware did about that and what this does
     * about it: half the pixels one colour, half the other, and at 320 across
     * on a television the eye reads the tone in between. Set it, draw, clear it.
     */
    this.dither = 0;
    /**
     * Half the pixels, in a chequerboard, and the other half left alone.
     *
     * This is how a machine with no alpha channel drew smoke, and it is the only
     * honest way to draw it here: a flat light-grey polygon over the car is a
     * white slab, and the same polygon with every other pixel missing is a cloud
     * you can see the car through. Set it, draw, clear it.
     */
    this.stipple = 0;
  }

  /**
   * Where the camera is and which way it is pointing.
   * @param yaw   heading in radians, 0 looking down +z
   * @param pitch positive looks down
   * @param roll  positive tips the horizon clockwise
   */
  setCamera(x, y, z, yaw, pitch, roll) {
    const c = this.cam;
    c.x = x; c.y = y; c.z = z;
    c.sy = Math.sin(yaw); c.cy = Math.cos(yaw);
    c.sp = Math.sin(pitch); c.cp = Math.cos(pitch);
    c.sr = Math.sin(roll); c.cr = Math.cos(roll);
  }

  /** World point into camera space, written into `out` at `at`. */
  view(x, y, z, out, at) {
    const c = this.cam;
    const dx = x - c.x;
    const dy = y - c.y;
    const dz = z - c.z;
    // Yaw first: into the direction the car is facing.
    const rx = dx * c.cy - dz * c.sy;
    const rz = dx * c.sy + dz * c.cy;
    // Then pitch, then roll, both about the axes we now have.
    const py = dy * c.cp + rz * c.sp;
    const pz = rz * c.cp - dy * c.sp;
    out[at] = rx * c.cr - py * c.sr;
    out[at + 1] = rx * c.sr + py * c.cr;
    out[at + 2] = pz;
  }

  /**
   * Wipes the frame, and paints the sky into it.
   *
   * Bands, which is how these machines did skies - but with the joins between
   * them chequered rather than cut. Five flat stripes read as five flat stripes;
   * the same five with twenty rows of ordered dither between each pair read as
   * one gradient, out of exactly the same five colours, which is the trick the
   * hardware used and the only one available to a renderer with no more colours
   * to give.
   *
   * Ordered rather than random: a Bayer matrix puts the pixels in a repeating
   * pattern that the eye averages, where noise would crawl about between frames
   * and look like the sky was fizzing.
   */
  begin(bands) {
    this.depth.fill(0);
    this.tris = 0;
    const { pix, w, h } = this;
    const pattern = this.pattern || (this.pattern = new Uint32Array(4));
    let at = 0;

    for (let y = 0; y < h; y++, at += w) {
      const f = y / h;
      let i = 0;
      while (i < bands.length - 1 && f >= bands[i][0]) i++;
      const colour = bands[i][1];
      // How many rows until this band gives way to the next one.
      const rows = (bands[i][0] - f) * h;
      const next = i + 1 < bands.length ? bands[i + 1][1] : colour;
      // The fade is a share of the band it belongs to rather than a fixed
      // number of rows, so a thin band near the horizon is not entirely made of
      // dither while a deep one at the top of the sky gets a long enough run to
      // be a gradient.
      const from = i > 0 ? bands[i - 1][0] : 0;
      const fade = Math.max(3, Math.min(h * 0.13, (bands[i][0] - from) * h * 0.8));

      if (next === colour || rows > fade || rows < 0) {
        pix.fill(colour, at, at + w);
        continue;
      }
      // Four pixels of pattern, repeated across the row: the matrix only has
      // four columns, so the row only has four different answers in it.
      const t = (1 - rows / fade) * 16;
      const row = (y & 3) * 4;
      for (let k = 0; k < 4; k++) pattern[k] = BAYER[row + k] < t ? next : colour;
      for (let x = 0; x < w; x++) pix[at + x] = pattern[x & 3];
    }
  }

  /**
   * One triangle, in world coordinates, one colour.
   *
   * Clipped against the near plane first, because a road passing under the
   * camera has vertices behind it every single frame and projecting those gives
   * you a triangle stretched across the screen.
   */
  tri(ax, ay, az, bx, by, bz, cx, cy, cz, colour) {
    const v = this.va;
    this.view(ax, ay, az, v, 0);
    this.view(bx, by, bz, v, 3);
    this.view(cx, cy, cz, v, 6);
    this.clipped(v, 3, colour);
  }

  /** A four-sided face as two triangles, sharing an edge so no seam shows. */
  quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, colour) {
    const v = this.va;
    this.view(ax, ay, az, v, 0);
    this.view(bx, by, bz, v, 3);
    this.view(cx, cy, cz, v, 6);
    this.view(dx, dy, dz, v, 9);
    this.clipped(v, 4, colour);
  }

  /**
   * Any face up to eight corners, given as a flat array of world coordinates.
   * The models are built out of these; the two above are the common cases
   * written out so the hot path does not allocate.
   */
  poly(pts, colour) {
    const count = pts.length / 3;
    if (count < 3 || count > 8) return;
    const v = this.va;
    for (let i = 0; i < count; i++) {
      this.view(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2], v, i * 3);
    }
    this.clipped(v, count, colour);
  }

  /**
   * Cuts a polygon against z = NEAR and fans what is left into triangles.
   *
   * Sutherland-Hodgman, unrolled onto a flat array. Everything in front stays,
   * every edge that crosses the plane gains a vertex on it, and everything
   * behind is dropped.
   */
  clipped(src, count, colour) {
    let n = 0;
    const out = this.vb;
    for (let i = 0; i < count; i++) {
      const a = i * 3;
      const b = ((i + 1) % count) * 3;
      const az = src[a + 2];
      const bz = src[b + 2];
      if (az >= NEAR) {
        out[n] = src[a]; out[n + 1] = src[a + 1]; out[n + 2] = az;
        n += 3;
      }
      if ((az >= NEAR) !== (bz >= NEAR)) {
        const t = (NEAR - az) / (bz - az);
        out[n] = src[a] + (src[b] - src[a]) * t;
        out[n + 1] = src[a + 1] + (src[b + 1] - src[a + 1]) * t;
        out[n + 2] = NEAR;
        n += 3;
      }
    }
    const verts = n / 3;
    if (verts < 3) return;
    for (let i = 1; i < verts - 1; i++) {
      this.fill(out, 0, i * 3, (i + 1) * 3, colour);
    }
  }

  /** Projects three camera-space vertices and fills the triangle between them. */
  fill(v, a, b, c, colour) {
    const f = this.focal;
    const wa = 1 / v[a + 2];
    const wb = 1 / v[b + 2];
    const wc = 1 / v[c + 2];
    let x0 = this.cx + v[a] * f * wa;
    let y0 = this.cy - v[a + 1] * f * wa;
    let x1 = this.cx + v[b] * f * wb;
    let y1 = this.cy - v[b + 1] * f * wb;
    let x2 = this.cx + v[c] * f * wc;
    let y2 = this.cy - v[c + 1] * f * wc;
    let w0 = wa; let w1 = wb; let w2 = wc;

    // Sorted top to bottom, so the two halves can be walked in one direction.
    if (y0 > y1) { let t = y0; y0 = y1; y1 = t; t = x0; x0 = x1; x1 = t; t = w0; w0 = w1; w1 = t; }
    if (y1 > y2) { let t = y1; y1 = y2; y2 = t; t = x1; x1 = x2; x2 = t; t = w1; w1 = w2; w2 = t; }
    if (y0 > y1) { let t = y0; y0 = y1; y1 = t; t = x0; x0 = x1; x1 = t; t = w0; w0 = w1; w1 = t; }

    if (y2 - y0 < 0.0001) return;
    if (y2 < 0 || y0 >= this.h) return;
    if (Math.max(x0, x1, x2) < 0 || Math.min(x0, x1, x2) >= this.w) return;
    this.tris++;

    const long = (x2 - x0) / (y2 - y0);
    const longW = (w2 - w0) / (y2 - y0);
    this.half(y0, y1, x0, w0, long, longW, x0, w0, (x1 - x0) / (y1 - y0), (w1 - w0) / (y1 - y0), colour);
    this.half(y1, y2, x0 + long * (y1 - y0), w0 + longW * (y1 - y0), long, longW,
      x1, w1, (x2 - x1) / (y2 - y1), (w2 - w1) / (y2 - y1), colour);
  }

  /**
   * The span loop: one flat-topped or flat-bottomed half of a triangle.
   *
   * Both edges are given as a starting x and a slope, and 1/z rides along with
   * them. Nothing in here divides, and nothing in here branches except the depth
   * test, which is the point.
   */
  half(top, bottom, ax, aw, adx, adw, bx, bw, bdx, bdw, colour) {
    let y = Math.max(0, Math.ceil(top));
    const end = Math.min(this.h, Math.ceil(bottom));
    if (y >= end) return;
    const skip = y - top;
    let ex = ax + adx * skip;
    let ew = aw + adw * skip;
    let fx = bx + bdx * skip;
    let fw = bw + bdw * skip;
    const { pix, depth, w: width } = this;

    for (; y < end; y++, ex += adx, ew += adw, fx += bdx, fw += bdw) {
      let lx = ex; let lw = ew; let rx = fx; let rw = fw;
      if (lx > rx) { let t = lx; lx = rx; rx = t; t = lw; lw = rw; rw = t; }
      const span = rx - lx;
      if (span < 0.0001) continue;
      const dw = (rw - lw) / span;
      let x = Math.max(0, Math.ceil(lx));
      const stop = Math.min(width, Math.ceil(rx));
      let z = lw + dw * (x - lx);
      let at = y * width + x;
      if (this.stipple) {
        // Not written to the depth buffer: smoke does not hide what is behind
        // it, it is drawn over it, and a cloud that occluded the car would put
        // holes in the car instead of putting smoke in front of it.
        for (; x < stop; x++, at++, z += dw) {
          if (((x ^ y) & 1) && z > depth[at]) pix[at] = colour;
        }
      } else if (this.dither) {
        const other = this.dither;
        for (; x < stop; x++, at++, z += dw) {
          if (z > depth[at]) {
            depth[at] = z;
            pix[at] = ((x ^ y) & 1) ? other : colour;
          }
        }
      } else {
        for (; x < stop; x++, at++, z += dw) {
          if (z > depth[at]) {
            depth[at] = z;
            pix[at] = colour;
          }
        }
      }
    }
  }

  // --- Flat things, drawn straight onto the pixels ---------------------------

  rect(x, y, w, h, colour) {
    const x0 = Math.max(0, x | 0);
    const y0 = Math.max(0, y | 0);
    const x1 = Math.min(this.w, (x + w) | 0);
    const y1 = Math.min(this.h, (y + h) | 0);
    for (let row = y0; row < y1; row++) {
      this.pix.fill(colour, row * this.w + x0, row * this.w + x1);
    }
  }

  /** A HUD panel: filled, with a one-pixel border, the way these games did them. */
  panel(x, y, w, h, fillColour, edge) {
    this.rect(x, y, w, h, fillColour);
    this.rect(x, y, w, 1, edge);
    this.rect(x, y + h - 1, w, 1, edge);
    this.rect(x, y, 1, h, edge);
    this.rect(x + w - 1, y, 1, h, edge);
  }

  text(str, x, y, colour, scale = 1) {
    let at = x;
    for (const ch of String(str).toUpperCase()) {
      at += this.glyph(ch, at, y, colour, scale);
    }
    return at - x;
  }

  /** Centres a string on `x`, which is what every label on this HUD wants. */
  textMid(str, x, y, colour, scale = 1) {
    const wide = String(str).length * 6 * scale;
    return this.text(str, Math.round(x - wide / 2), y, colour, scale);
  }

  glyph(ch, x, y, colour, scale) {
    const rows = FONT[ch];
    if (!rows) return 6 * scale;
    for (let r = 0; r < rows.length; r++) {
      const bits = rows[r];
      for (let c = 0; c < 5; c++) {
        if (bits[c] !== '1') continue;
        if (scale === 1) {
          const px = x + c;
          const py = y + r;
          if (px >= 0 && px < this.w && py >= 0 && py < this.h) this.pix[py * this.w + px] = colour;
        } else {
          this.rect(x + c * scale, y + r * scale, scale, scale, colour);
        }
      }
    }
    return 6 * scale;
  }

  /** Hands the finished frame to a canvas, blown up, unsmoothed. */
  blit(ctx, buffer) {
    buffer.putImageData(this.image, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buffer.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Five by seven, which is as small as letters get and still read on a
 * television. Written out rather than generated because a font is data, and
 * data you can see is data you can fix.
 */
const FONT = {};
for (const [ch, rows] of Object.entries({
  A: '01110/10001/10001/11111/10001/10001/10001',
  B: '11110/10001/10001/11110/10001/10001/11110',
  C: '01110/10001/10000/10000/10000/10001/01110',
  D: '11110/10001/10001/10001/10001/10001/11110',
  E: '11111/10000/10000/11110/10000/10000/11111',
  F: '11111/10000/10000/11110/10000/10000/10000',
  G: '01110/10001/10000/10111/10001/10001/01111',
  H: '10001/10001/10001/11111/10001/10001/10001',
  I: '01110/00100/00100/00100/00100/00100/01110',
  J: '00111/00010/00010/00010/00010/10010/01100',
  K: '10001/10010/10100/11000/10100/10010/10001',
  L: '10000/10000/10000/10000/10000/10000/11111',
  M: '10001/11011/10101/10101/10001/10001/10001',
  N: '10001/11001/10101/10011/10001/10001/10001',
  O: '01110/10001/10001/10001/10001/10001/01110',
  P: '11110/10001/10001/11110/10000/10000/10000',
  Q: '01110/10001/10001/10001/10101/10010/01101',
  R: '11110/10001/10001/11110/10100/10010/10001',
  S: '01111/10000/10000/01110/00001/00001/11110',
  T: '11111/00100/00100/00100/00100/00100/00100',
  U: '10001/10001/10001/10001/10001/10001/01110',
  V: '10001/10001/10001/10001/10001/01010/00100',
  W: '10001/10001/10001/10101/10101/11011/10001',
  X: '10001/10001/01010/00100/01010/10001/10001',
  Y: '10001/10001/01010/00100/00100/00100/00100',
  Z: '11111/00001/00010/00100/01000/10000/11111',
  0: '01110/10001/10011/10101/11001/10001/01110',
  1: '00100/01100/00100/00100/00100/00100/01110',
  2: '01110/10001/00001/00110/01000/10000/11111',
  3: '11110/00001/00001/01110/00001/00001/11110',
  4: '00010/00110/01010/10010/11111/00010/00010',
  5: '11111/10000/11110/00001/00001/10001/01110',
  6: '00110/01000/10000/11110/10001/10001/01110',
  7: '11111/00001/00010/00100/01000/01000/01000',
  8: '01110/10001/10001/01110/10001/10001/01110',
  9: '01110/10001/10001/01111/00001/00010/01100',
  ' ': '00000/00000/00000/00000/00000/00000/00000',
  '.': '00000/00000/00000/00000/00000/01100/01100',
  ',': '00000/00000/00000/00000/01100/01100/11000',
  "'": '01100/01100/01000/00000/00000/00000/00000',
  ':': '00000/01100/01100/00000/01100/01100/00000',
  '-': '00000/00000/00000/11111/00000/00000/00000',
  '/': '00001/00010/00010/00100/01000/01000/10000',
  '!': '00100/00100/00100/00100/00100/00000/00100',
  '?': '01110/10001/00001/00110/00100/00000/00100',
  '%': '11001/11010/00010/00100/01000/01011/10011',
  '+': '00000/00100/00100/11111/00100/00100/00000',
  '*': '00000/10101/01110/11111/01110/10101/00000',
  '<': '00010/00100/01000/10000/01000/00100/00010',
  '>': '01000/00100/00010/00001/00010/00100/01000',
  '(': '00010/00100/01000/01000/01000/00100/00010',
  ')': '01000/00100/00010/00010/00010/00100/01000',
})) {
  FONT[ch] = rows.split('/');
}
