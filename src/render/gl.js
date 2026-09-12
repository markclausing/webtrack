/**
 * The graphics card, and the smallest amount of it that will do the job.
 *
 * This game drew into a Uint32Array for a long time and the argument for it was
 * a good one: two thousand flat triangles over seventy thousand pixels is a few
 * milliseconds of arithmetic, and doing it by hand bought the exact look. What
 * it also bought was a ceiling. A triangle costs about a microsecond of
 * JavaScript on the way through that rasteriser - transform, clip, project,
 * fill - and six thousand of them is four milliseconds of a sixteen millisecond
 * frame before anything else happens. Every question worth asking about this
 * picture from here on is a question about more: more of the circuit visible at
 * once, more of a car than twenty flat faces, more than a tree made of two
 * crossed quads.
 *
 * The same triangle written into a vertex buffer costs eighty-five nanoseconds,
 * which is twelve times as many for the same money, and a triangle that was
 * written once and is only being looked at again costs nothing at all. That is
 * the whole reason this file exists.
 *
 * There is no library here and no build step. One context, two programs, and a
 * class at the bottom that takes the same calls the software rasteriser took -
 * `tri`, `quad`, `poly`, a packed colour - so that the eleven hundred lines of
 * this game that know what a circuit looks like did not have to be rewritten to
 * find out what a graphics card is.
 */

import { NEAR } from '../constants.js';

/** How far the world is drawn before the depth buffer stops caring. */
export const FAR = 6000;

export function getContext(canvas) {
  const attrs = {
    alpha: false,
    antialias: true,
    depth: true,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  };
  const gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs);
  if (!gl) return null;
  gl.webgl2 = typeof gl.texStorage2D === 'function';
  return gl;
}

export function compile(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const pair = [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]];
  for (const [type, source] of pair) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader: `
        + gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
  }
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  const attribs = {};
  const attrCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < attrCount; i++) {
    const info = gl.getActiveAttrib(program, i);
    attribs[info.name] = gl.getAttribLocation(program, info.name);
  }
  return { program, uniforms, attribs };
}

// --- The matrix --------------------------------------------------------------

/**
 * The camera and the lens, as one matrix.
 *
 * The rotation is exactly the one the software rasteriser did by hand - yaw,
 * then pitch, then roll, in that order and about those axes - because the road
 * is built in the same convention and a camera that disagreed with it would
 * need every call site changed. What it does not do by hand any more is do it
 * per vertex: this goes to the card once a frame and the card does the rest.
 *
 * The projection is written from the focal length rather than from a field of
 * view, for the same reason. `focal` moves with speed and is the single largest
 * thing in this game for how fast it feels; it is a number of pixels on a screen
 * of a given width, and turning it into an angle and back would only be a way of
 * getting it slightly wrong.
 *
 * Column major, because that is the order WebGL reads them in.
 */
export function viewProjection(out, cam, focal, width, height) {
  const { sy, cy, sp, cp, sr, cr } = cam;
  // The rotation, written out. See the software view() this replaces.
  const m00 = cr * cy - sr * sp * sy;
  const m01 = -sr * cp;
  const m02 = -cr * sy - sr * sp * cy;
  const m10 = sr * cy + cr * sp * sy;
  const m11 = cr * cp;
  const m12 = -sr * sy + cr * sp * cy;
  const m20 = cp * sy;
  const m21 = -sp;
  const m22 = cp * cy;
  // And the lens: x and y scaled by the focal length over half the screen, z
  // mapped from the near plane to the far one. The camera looks down +z, which
  // is the road's convention and not the one OpenGL was written in, so the w
  // that comes out is +z rather than -z and the sign is in row three.
  const fx = 2 * focal / width;
  const fy = 2 * focal / height;
  const zs = (FAR + NEAR) / (FAR - NEAR);
  const zo = -2 * FAR * NEAR / (FAR - NEAR);
  // Translation: everything is drawn relative to the camera, so the position is
  // folded in here rather than subtracted from every vertex.
  const tx = -(m00 * cam.x + m01 * cam.y + m02 * cam.z);
  const ty = -(m10 * cam.x + m11 * cam.y + m12 * cam.z);
  const tz = -(m20 * cam.x + m21 * cam.y + m22 * cam.z);

  out[0] = fx * m00; out[4] = fx * m01; out[8] = fx * m02; out[12] = fx * tx;
  out[1] = fy * m10; out[5] = fy * m11; out[9] = fy * m12; out[13] = fy * ty;
  out[2] = zs * m20; out[6] = zs * m21; out[10] = zs * m22; out[14] = zs * tz + zo;
  out[3] = m20; out[7] = m21; out[11] = m22; out[15] = tz;
  return out;
}

// --- The two programs --------------------------------------------------------

/**
 * The world: a position, a normal, a colour, and a sun.
 *
 * The software renderer had no normals and no light. Every face arrived with its
 * shading already in it - a box was written as a dark side, a mid side and a lit
 * top, by hand, with the numbers 0.68, 0.84 and 1 - which works, is what these
 * machines did, and has one thing wrong with it: it is the same shading wherever
 * the sun is and wherever the face is pointing. A building at Monaco was lit from
 * above at four in the afternoon and lit from above again at dusk with the sun on
 * the horizon behind it.
 *
 * So the face brings its normal now and the light is worked out here. It is a
 * wrapped diffuse term rather than a straight Lambert - half the dot product
 * plus a half, so a face pointing away from the sun goes to the ambient rather
 * than to black - because the alternative on flat-shaded geometry with no shadows
 * is a world where every north wall is a silhouette.
 *
 * `uExposure` is what keeps this honest against the pictures the old renderer
 * took: it is set so that a surface pointing straight up comes out at exactly the
 * colour it was given. The road, the grass and the sand are unchanged, and
 * everything with a side to it gained one.
 *
 * The fog moved here too, and that is the larger change. It used to be mixed into
 * every face's colour on the processor, which meant a face was one distance from
 * the camera - so a length of road forty metres long was fogged as though all of
 * it were at the near end, and the joins between road sections were visible on a
 * long straight at dusk. Per pixel there are no joins.
 */
const FLAT_VS = `
precision highp float;
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec4 aColour;
uniform mat4 uViewProj;
varying vec4 vColour;
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vColour = aColour;
  vNormal = aNormal;
  vWorld = aPos;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;

const FLAT_FS = `
precision highp float;
varying vec4 vColour;
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 uSun;
uniform vec3 uCamera;
uniform vec3 uFogColour;
uniform float uAmbient;
uniform float uExposure;
uniform float uFogNear;
uniform float uFogFar;
void main() {
  // Two-sided, and it has to be: a tree in this game is two flat quads crossed
  // at right angles, and the winding of a polygon written out by hand fifteen
  // hundred lines ago is whatever it happened to be. Turning the normal to face
  // whoever is looking at it makes the visible side of every surface the lit one,
  // which for a closed box is its outside and for a leaf is both of them.
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  float wrap = 0.5 + 0.5 * dot(n, uSun);
  float light = (uAmbient + (1.0 - uAmbient) * wrap) * uExposure;
  vec3 colour = vColour.rgb * light;
  float away = length(vWorld - uCamera);
  float fog = clamp((away - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  gl_FragColor = vec4(mix(colour, uFogColour, pow(fog, 0.75)), vColour.a);
}`;

const SCREEN_FS = `
precision highp float;
varying vec4 vColour;
void main() {
  gl_FragColor = vColour;
}`;

/** Flat things in screen space: the sky and the sun. Coordinates are already NDC. */
const SCREEN_VS = `
precision highp float;
attribute vec2 aPos;
attribute vec4 aColour;
varying vec4 vColour;
void main() {
  vColour = aColour;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// --- The batch ---------------------------------------------------------------

/** How many triangles a buffer starts out able to hold. It grows if it must. */
const START_TRIS = 16384;
// Position, normal, colour: seven floats and four bytes. The normal is not
// packed into bytes, which it easily could be, because the processor would then
// have to normalise it - a square root a triangle - and the card can do that for
// nothing in the fragment shader.
const STRIDE = 28;

/**
 * A triangle sink with the shape of the old rasteriser.
 *
 * `tri`, `quad` and `poly` take world coordinates and a packed colour and put
 * them in a buffer; `blit` hands the buffer to the card. Nothing is clipped
 * here, nothing is projected here and nothing is filled here - all three were
 * the expensive part and all three belong to the hardware.
 *
 * Two buffers rather than one, because there are two kinds of triangle in this
 * game: the ones that are there, and the ones you can see through. The second
 * kind used to be drawn as a chequerboard with every other pixel missing, which
 * is what a machine with no alpha channel had to do; it gets a real alpha
 * channel now and is drawn after everything else with the depth buffer read but
 * not written, which is what makes smoke sit in front of the car without
 * punching a hole in it.
 */
export class Batch {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = getContext(canvas);
    if (!gl) throw new Error('this game needs WebGL');
    this.gl = gl;
    this.flat = compile(gl, FLAT_VS, FLAT_FS);
    this.screen = compile(gl, SCREEN_VS, SCREEN_FS);
    this.viewProj = new Float32Array(16);

    this.solid = makeSink(START_TRIS);
    this.clear = makeSink(2048);
    this.flatBuf = gl.createBuffer();
    this.screenBuf = gl.createBuffer();
    // Screen-space work - the sky and the sun - in its own little buffer, in
    // normalised device coordinates, two floats and a colour a corner.
    this.ui = { data: new ArrayBuffer(4096 * 12), count: 0 };
    this.ui.f32 = new Float32Array(this.ui.data);
    this.ui.u8 = new Uint8Array(this.ui.data);

    this.w = canvas.width;
    this.h = canvas.height;
    this.cam = { x: 0, y: 0, z: 0, sy: 0, cy: 1, sp: 0, cp: 1, sr: 0, cr: 1 };
    this.focal = 500;
    this.tris = 0;
    /**
     * Two colours, chequered one pixel at a time against the first.
     *
     * It was a way of inventing a colour that the palette did not have: half the
     * pixels one grey and half the other, read at a distance as the grey in
     * between. There are sixteen million colours here now and the one in between
     * is simply available, so this averages the pair and draws that. The call
     * sites did not have to know.
     */
    this.dither = 0;
    /**
     * Half the pixels, in a chequerboard, and the other half left alone.
     *
     * This was how a machine with no alpha channel drew smoke. It has one now.
     */
    this.stipple = 0;
  }

  /** The size of the picture. Set by the renderer when the window changes. */
  resize(width, height) {
    this.w = width;
    this.h = height;
  }

  setCamera(x, y, z, yaw, pitch, roll) {
    const c = this.cam;
    c.x = x; c.y = y; c.z = z;
    c.sy = Math.sin(yaw); c.cy = Math.cos(yaw);
    c.sp = Math.sin(pitch); c.cp = Math.cos(pitch);
    c.sr = Math.sin(roll); c.cr = Math.cos(roll);
  }

  /**
   * Wipes the frame and paints the sky into it.
   *
   * Two triangles a band, in screen space, with the colour interpolated down
   * them by the hardware. The software renderer did this a row at a time with an
   * ordered dither to hide the steps between the five colours it could afford;
   * there are no steps to hide any more, so a gradient is a gradient.
   */
  begin(bands) {
    const gl = this.gl;
    this.solid.count = 0;
    this.clear.count = 0;
    this.ui.count = 0;
    this.tris = 0;

    gl.viewport(0, 0, this.w, this.h);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Device coordinates count up from the bottom of the screen and the band
    // stops count down from the top of it, so this walks from +1 downwards.
    let top = 1;
    let from = bands[0][1];
    for (let i = 0; i < bands.length; i++) {
      const [at, colour] = bands[i];
      const bottom = 1 - 2 * Math.max(0, Math.min(1, at));
      this.skyBand(top, from, bottom, colour);
      top = Math.min(top, bottom);
      from = colour;
    }
    // Whatever is left below the last stop, in the last colour. There always is
    // some: the stops are written for a screen a particular shape and the
    // horizon moves up and down with the camera besides.
    this.skyBand(top, from, -1, from);
  }

  /** One stripe of sky, from `y0` at the top in `c0` to `y1` at the bottom in `c1`. */
  skyBand(y0, c0, y1, c1) {
    if (y1 >= y0) return;
    this.screenTri(-1, y0, c0, 1, y0, c0, 1, y1, c1);
    this.screenTri(-1, y0, c0, 1, y1, c1, -1, y1, c1);
  }

  /** A triangle in normalised device coordinates. The sky and the sun only. */
  screenTri(ax, ay, ac, bx, by, bc, cx, cy, cc) {
    const ui = this.ui;
    if ((ui.count + 3) * 12 > ui.data.byteLength) return;
    const put = (x, y, colour) => {
      const at = ui.count * 3;
      ui.f32[at] = x;
      ui.f32[at + 1] = y;
      const b = ui.count * 12 + 8;
      ui.u8[b] = colour & 255;
      ui.u8[b + 1] = (colour >> 8) & 255;
      ui.u8[b + 2] = (colour >> 16) & 255;
      ui.u8[b + 3] = 255;
      ui.count++;
    };
    put(ax, ay, ac);
    put(bx, by, bc);
    put(cx, cy, cc);
  }

  /**
   * The sun, as a disc in screen space.
   *
   * Given in pixels, because that is what the renderer works the position out
   * in, and turned into device coordinates here. Sixteen segments: at this size
   * that is a circle, and the sun is the one thing in the game with a curve on
   * it.
   */
  disc(x, y, r, colour) {
    const nx = (px) => (px / this.w) * 2 - 1;
    const ny = (py) => 1 - (py / this.h) * 2;
    const SEGS = 24;
    for (let i = 0; i < SEGS; i++) {
      const a0 = (i / SEGS) * Math.PI * 2;
      const a1 = ((i + 1) / SEGS) * Math.PI * 2;
      this.screenTri(
        nx(x), ny(y), colour,
        nx(x + Math.cos(a0) * r), ny(y + Math.sin(a0) * r), colour,
        nx(x + Math.cos(a1) * r), ny(y + Math.sin(a1) * r), colour,
      );
    }
  }

  // --- Triangles ------------------------------------------------------------

  tri(ax, ay, az, bx, by, bz, cx, cy, cz, colour) {
    this.push(ax, ay, az, bx, by, bz, cx, cy, cz, colour);
  }

  quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, colour) {
    this.push(ax, ay, az, bx, by, bz, cx, cy, cz, colour);
    this.push(ax, ay, az, cx, cy, cz, dx, dy, dz, colour);
  }

  /** Any face up to eight corners, as a fan. The models are built out of these. */
  poly(pts, colour) {
    const count = pts.length / 3;
    if (count < 3) return;
    for (let i = 1; i < count - 1; i++) {
      this.push(
        pts[0], pts[1], pts[2],
        pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2],
        pts[i * 3 + 3], pts[i * 3 + 4], pts[i * 3 + 5],
        colour,
      );
    }
  }

  /**
   * One triangle into whichever buffer it belongs in, with its normal.
   *
   * The normal is the cross product of two edges and is deliberately not
   * normalised here: that is a square root per triangle on the processor, forty
   * thousand times a frame, to produce a number the fragment shader is going to
   * normalise anyway.
   */
  push(ax, ay, az, bx, by, bz, cx, cy, cz, colour) {
    const sink = this.stipple ? this.clear : this.solid;
    if ((sink.count + 3) * STRIDE > sink.data.byteLength) grow(sink);
    const alpha = this.stipple ? 150 : 255;
    // The chequered second colour is now simply the colour in between.
    const c = this.dither ? blend(colour, this.dither) : colour;
    const ux = bx - ax; const uy = by - ay; const uz = bz - az;
    const vx = cx - ax; const vy = cy - ay; const vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const f = sink.f32;
    const u = sink.u8;
    let at = sink.count * 7;
    let b = sink.count * STRIDE + 24;
    f[at] = ax; f[at + 1] = ay; f[at + 2] = az;
    f[at + 3] = nx; f[at + 4] = ny; f[at + 5] = nz;
    u[b] = c & 255; u[b + 1] = (c >> 8) & 255; u[b + 2] = (c >> 16) & 255; u[b + 3] = alpha;
    at += 7; b += STRIDE;
    f[at] = bx; f[at + 1] = by; f[at + 2] = bz;
    f[at + 3] = nx; f[at + 4] = ny; f[at + 5] = nz;
    u[b] = c & 255; u[b + 1] = (c >> 8) & 255; u[b + 2] = (c >> 16) & 255; u[b + 3] = alpha;
    at += 7; b += STRIDE;
    f[at] = cx; f[at + 1] = cy; f[at + 2] = cz;
    f[at + 3] = nx; f[at + 4] = ny; f[at + 5] = nz;
    u[b] = c & 255; u[b + 1] = (c >> 8) & 255; u[b + 2] = (c >> 16) & 255; u[b + 3] = alpha;
    sink.count += 3;
    this.tris++;
  }

  /**
   * Where the sun is, how much light there is without it, and what the distance
   * is made of.
   *
   * Set once a frame by the renderer, which is the only thing that knows what
   * time of day it is. `exposure` is worked out from the sun's height so that a
   * surface pointing straight up is left exactly the colour it was given.
   */
  light({ sun, ambient, fogColour, fogNear, fogFar }) {
    this.sun = sun;
    this.ambient = ambient;
    this.fogColour = fogColour;
    this.fogNear = fogNear;
    this.fogFar = fogFar;
    // The road is the thing every other brightness in this game was chosen
    // against, so the road is what the exposure is set by.
    const up = 0.5 + 0.5 * sun[1];
    this.exposure = 1 / Math.max(0.05, ambient + (1 - ambient) * up);
  }

  // --- Handing it over ------------------------------------------------------

  /**
   * The frame, to the card: the sky, then everything solid, then everything you
   * can see through.
   *
   * The argument is ignored and kept. `blit(ctx)` was how the software renderer
   * handed its pixel buffer to a canvas, and every call site still says that.
   */
  blit() {
    const gl = this.gl;

    // The sky and the sun, behind everything, with the depth buffer untouched:
    // there is nothing in front of the sky and everything is in front of it.
    if (this.ui.count) {
      gl.useProgram(this.screen.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.screenBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.ui.f32.buffer, 0, this.ui.count * 3),
        gl.STREAM_DRAW);
      const a = this.screen.attribs;
      gl.enableVertexAttribArray(a.aPos);
      gl.vertexAttribPointer(a.aPos, 2, gl.FLOAT, false, 12, 0);
      gl.enableVertexAttribArray(a.aColour);
      gl.vertexAttribPointer(a.aColour, 4, gl.UNSIGNED_BYTE, true, 12, 8);
      gl.disable(gl.DEPTH_TEST);
      gl.drawArrays(gl.TRIANGLES, 0, this.ui.count);
      gl.enable(gl.DEPTH_TEST);
    }

    viewProjection(this.viewProj, this.cam, this.focal, this.w, this.h);
    gl.useProgram(this.flat.program);
    gl.uniformMatrix4fv(this.flat.uniforms.uViewProj, false, this.viewProj);
    const u = this.flat.uniforms;
    gl.uniform3fv(u.uSun, this.sun || [0, 1, 0]);
    gl.uniform3fv(u.uCamera, [this.cam.x, this.cam.y, this.cam.z]);
    gl.uniform3fv(u.uFogColour, this.fogColour || [0.6, 0.7, 0.8]);
    gl.uniform1f(u.uAmbient, this.ambient ?? 0.55);
    gl.uniform1f(u.uExposure, this.exposure ?? 1);
    gl.uniform1f(u.uFogNear, this.fogNear ?? 190);
    gl.uniform1f(u.uFogFar, this.fogFar ?? 990);
    const a = this.flat.attribs;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.flatBuf);
    gl.enableVertexAttribArray(a.aPos);
    gl.enableVertexAttribArray(a.aNormal);
    gl.enableVertexAttribArray(a.aColour);

    if (this.solid.count) {
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(this.solid.f32.buffer, 0, this.solid.count * 7), gl.STREAM_DRAW);
      gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.vertexAttribPointer(a.aNormal, 3, gl.FLOAT, false, STRIDE, 12);
      gl.vertexAttribPointer(a.aColour, 4, gl.UNSIGNED_BYTE, true, STRIDE, 24);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, this.solid.count);
    }

    // And what you can see through, afterwards, reading the depth buffer but not
    // writing to it - so smoke is hidden by the car in front of it and does not
    // hide the car behind it.
    if (this.clear.count) {
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(this.clear.f32.buffer, 0, this.clear.count * 7), gl.STREAM_DRAW);
      gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.vertexAttribPointer(a.aNormal, 3, gl.FLOAT, false, STRIDE, 12);
      gl.vertexAttribPointer(a.aColour, 4, gl.UNSIGNED_BYTE, true, STRIDE, 24);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.drawArrays(gl.TRIANGLES, 0, this.clear.count);
      gl.depthMask(true);
      gl.disable(gl.BLEND);
    }
  }
}

/** A growable heap of vertices, with the two views everything is written through. */
function makeSink(tris) {
  const data = new ArrayBuffer(tris * 3 * STRIDE);
  return { data, f32: new Float32Array(data), u8: new Uint8Array(data), count: 0 };
}

/** Twice the room, keeping what is already in it. Happens once and then never. */
function grow(sink) {
  const data = new ArrayBuffer(sink.data.byteLength * 2);
  new Uint8Array(data).set(sink.u8);
  sink.data = data;
  sink.f32 = new Float32Array(data);
  sink.u8 = new Uint8Array(data);
}

/** Two packed colours, half and half. What the chequerboard used to stand in for. */
function blend(a, b) {
  const r = (((a & 255) + (b & 255)) >> 1);
  const g = ((((a >> 8) & 255) + ((b >> 8) & 255)) >> 1);
  const bl = ((((a >> 16) & 255) + ((b >> 16) & 255)) >> 1);
  return (255 << 24) | (bl << 16) | (g << 8) | r;
}
