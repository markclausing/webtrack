/**
 * Everything drawn flat: the panels, the numbers, the map and the corner boards.
 *
 * On its own canvas over the top of the world, in 2D, because a head-up display
 * is text and rectangles and there is nothing a graphics card can do for either
 * that is worth a second program. It used to be drawn into the same pixel buffer
 * as the road; the road is on the card now, and reading a frame back off it to
 * put letters on would cost more than everything else in this file together.
 *
 * The layout is unchanged and so is the font. Coordinates arrive in the display's
 * own space - three hundred and thirty-six tall, and as wide as the picture is,
 * so that a panel anchored to the right hand edge stays anchored to it on a
 * screen of any shape - and are scaled onto the canvas here. That is the same
 * arrangement the software renderer had, for the same reason: a head-up display
 * laid out in real pixels shrinks every time the resolution goes up, and this one
 * went up by a factor of nine.
 */

import { FONT } from './font.js';

/** The height everything is laid out against. The width follows the picture. */
export const HUD_BASE_H = 336;

export class Hud {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 1;
    this.w = 480;
  }

  /**
   * The canvas, the scale, and how wide the layout space is.
   *
   * Everything is laid out against a fixed height and a width that follows the
   * shape of the screen, so the clock stays in the middle and the running order
   * stays against the right hand edge whether the picture is four by three or
   * twenty-one by nine.
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.scale = height / HUD_BASE_H;
    this.w = width / this.scale;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Wipes it. The world behind shows through wherever nothing is drawn. */
  begin() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** A packed colour, as something a canvas will take. */
  css(colour) {
    const r = colour & 255;
    const g = (colour >> 8) & 255;
    const b = (colour >> 16) & 255;
    const a = ((colour >>> 24) & 255) / 255;
    return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  rect(x, y, w, h, colour) {
    const u = this.scale;
    this.ctx.fillStyle = this.css(colour);
    // Rounded to whole device pixels, so a one-pixel border stays one pixel and
    // two rows that touched at the layout size still touch here.
    const x0 = Math.round(x * u);
    const y0 = Math.round(y * u);
    this.ctx.fillRect(x0, y0, Math.max(1, Math.round((x + w) * u) - x0),
      Math.max(1, Math.round((y + h) * u) - y0));
  }

  /** A rectangle given by its edges, so neighbouring rows never gain a seam. */
  span(x0, y0, x1, y1, colour) {
    this.rect(x0, y0, x1 - x0, y1 - y0, colour);
  }

  /** A panel: filled, with a one-pixel border, the way these games did them. */
  panel(x, y, w, h, fill, edge) {
    this.rect(x, y, w, h, fill);
    const px = 1 / this.scale;
    this.rect(x, y, w, px, edge);
    this.rect(x, y + h - px, w, px, edge);
    this.rect(x, y, px, h, edge);
    this.rect(x + w - px, y, px, h, edge);
  }

  text(str, x, y, colour, scale = 1) {
    let at = x;
    for (const ch of String(str).toUpperCase()) at += this.glyph(ch, at, y, colour, scale);
    return at - x;
  }

  /** Centres a string on `x`, which is what every label on this display wants. */
  textMid(str, x, y, colour, scale = 1) {
    const wide = String(str).length * 6 * scale;
    return this.text(str, x - wide / 2, y, colour, scale);
  }

  /**
   * One letter, as filled rectangles.
   *
   * A run of set bits on a row is drawn as one rectangle rather than as a
   * rectangle each: the letters are five wide, so that is at most three fills
   * instead of five, and the numbers on this display are redrawn sixty times a
   * second.
   */
  glyph(ch, x, y, colour, scale) {
    const rows = FONT[ch];
    if (!rows) return 6 * scale;
    this.ctx.fillStyle = this.css(colour);
    const u = this.scale;
    for (let r = 0; r < rows.length; r++) {
      const bits = rows[r];
      let c = 0;
      while (c < 5) {
        if (bits[c] !== '1') { c++; continue; }
        let end = c;
        while (end < 5 && bits[end] === '1') end++;
        const x0 = Math.round((x + c * scale) * u);
        const y0 = Math.round((y + r * scale) * u);
        this.ctx.fillRect(x0, y0,
          Math.max(1, Math.round((x + end * scale) * u) - x0),
          Math.max(1, Math.round((y + (r + 1) * scale) * u) - y0));
        c = end;
      }
    }
    return 6 * scale;
  }

  /** Kept because every call site says it. There is nothing to hand over. */
  blit() {}
}
