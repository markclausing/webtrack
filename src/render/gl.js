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

/** A buffer with something already in it. Used for the one full-screen triangle. */
export function buffer(gl, target, data, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(target, buf);
  gl.bufferData(target, data, usage || gl.STATIC_DRAW);
  return buf;
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

// --- The surfaces ------------------------------------------------------------

/** A deterministic little generator, so every player gets the same tarmac. */
function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * How many texels across a surface is.
 *
 * A hundred and twenty-eight, which over the four metres the tarmac is sampled
 * at is three centimetres a texel. Two hundred and fifty-six was the first
 * number tried and cost sixty-three milliseconds of arithmetic at startup for a
 * difference nobody can see: these are modulations of a colour by a few per
 * cent, not pictures.
 */
const SURFACE = 128;

/**
 * Value noise on a grid that wraps, so the surface tiles.
 *
 * Tiling is the whole requirement. These are sampled from world coordinates
 * that run for kilometres, so a texture with a seam in it has a seam every four
 * metres all the way down the straight - which is a thing you notice at three
 * hundred and not at rest, which is the worst way to find it.
 */
function noiseField(seed, grid) {
  const rand = rng(seed);
  const points = new Float32Array(grid * grid);
  for (let i = 0; i < points.length; i++) points[i] = rand();
  const at = (a, b) => points[(((b % grid) + grid) % grid) * grid + (((a % grid) + grid) % grid)];
  return (x, y) => {
    const fx = x * grid;
    const fy = y * grid;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = at(ix, iy);
    const b = at(ix + 1, iy);
    const c = at(ix, iy + 1);
    const d = at(ix + 1, iy + 1);
    const top = a + (b - a) * sx;
    return top + ((c + (d - c) * sx) - top) * sy;
  };
}

/**
 * The three surfaces, drawn here, out of nothing.
 *
 * This is the one place in the game with a texture in it and there is still no
 * assets folder: they are written into a byte array by the arithmetic below and
 * handed to the card, which costs about twenty milliseconds once.
 *
 * They are not colours. Every colour in this game was chosen against a palette
 * and then put through a time-of-day transform, and a texture that replaced any
 * of that would be a texture that has to know about dusk, about the twenty-seven
 * circuits' themes, and about the sea at Monaco. So these are *modulations* -
 * grey, with a mean of one - and the shader multiplies. The tarmac stays the
 * colour the palette says and gains an aggregate; the grass stays the colour the
 * circuit says and gains tufts. Nothing else had to change.
 *
 * And they are sampled from world coordinates rather than from texture
 * coordinates, because the models have none: fifteen hundred lines of polygons
 * written out by hand, not one of which says where it is on a picture. What
 * every surface does know is where it is in the world, which for a road and a
 * field is the same information.
 */
function makeSurfaces(gl) {
  const make = (build) => {
    const data = new Uint8Array(SURFACE * SURFACE * 4);
    build(data);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SURFACE, SURFACE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    // A road seen at three degrees is the case anisotropy exists for, and this
    // game is mostly a road seen at three degrees.
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic')
      || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    if (aniso) {
      const most = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, most));
    }
    return texture;
  };

  const put = (data, i, v) => {
    const b = Math.max(0, Math.min(255, Math.round(v)));
    data[i] = b; data[i + 1] = b; data[i + 2] = b; data[i + 3] = 255;
  };

  return {
    /**
     * Tarmac: aggregate, and the patches it has been mended with.
     *
     * Three things at three scales. The fine speckle is the stone in it and is
     * what you see from inside the car; the patches are what you see a hundred
     * metres up the road, where the speckle has gone to grey; and the faint
     * darker lane down the middle is where everybody drives, which is the only
     * part of this that is about a racing circuit rather than about a road.
     */
    tarmac: make((data) => {
      const grit = noiseField(7, 64);
      const patch = noiseField(11, 8);
      const lane = noiseField(13, 4);
      for (let y = 0; y < SURFACE; y++) {
        for (let x = 0; x < SURFACE; x++) {
          const u = x / SURFACE;
          const v = y / SURFACE;
          let n = 128;
          n += (grit(u, v) - 0.5) * 34;
          n += (patch(u, v) - 0.5) * 16;
          n += (lane(u, v) - 0.5) * 9;
          put(data, (y * SURFACE + x) * 4, n);
        }
      }
    }),

    /** Grass, sand, gravel: one mottle, at two scales, for all three. */
    ground: make((data) => {
      const broad = noiseField(23, 6);
      const tuft = noiseField(29, 24);
      for (let y = 0; y < SURFACE; y++) {
        for (let x = 0; x < SURFACE; x++) {
          const u = x / SURFACE;
          const v = y / SURFACE;
          let n = 128;
          n += (broad(u, v) - 0.5) * 30;
          n += (tuft(u, v) - 0.5) * 22;
          put(data, (y * SURFACE + x) * 4, n);
        }
      }
    }),

    /**
     * Concrete: courses, and the streaks down them.
     *
     * Horizontal bands, because everything this goes on was poured or laid in
     * layers, and a vertical streak every so often because everything this goes
     * on has been rained on.
     */
    stone: make((data) => {
      const grain = noiseField(41, 32);
      const streak = noiseField(43, 12);
      for (let y = 0; y < SURFACE; y++) {
        const course = Math.sin((y / SURFACE) * Math.PI * 2 * 8) * 5;
        for (let x = 0; x < SURFACE; x++) {
          const u = x / SURFACE;
          const v = y / SURFACE;
          let n = 128 + course;
          n += (grain(u, v) - 0.5) * 14;
          n += (streak(u * 0.25, v) - 0.5) * 18;
          put(data, (y * SURFACE + x) * 4, n);
        }
      }
    }),
  };
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
uniform mat4 uLightProj;
varying vec4 vColour;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vShadow;
void main() {
  vColour = aColour;
  vNormal = aNormal;
  vWorld = aPos;
  // Where this point is in the sun's own view, which is what decides whether
  // anything is standing between it and the sun.
  vShadow = (uLightProj * vec4(aPos, 1.0)).xyz * 0.5 + 0.5;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;

const FLAT_FS = `
precision highp float;
varying vec4 vColour;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vShadow;
uniform vec3 uSun;
uniform vec3 uCamera;
uniform vec3 uFogColour;
uniform float uAmbient;
uniform float uExposure;
uniform float uFogNear;
uniform float uFogFar;
uniform sampler2D uShadow;
uniform float uShadowTexel;
uniform float uShadowOn;
uniform sampler2D uTarmac;
uniform sampler2D uGround;
uniform sampler2D uStone;
uniform float uTextured;
uniform float uLampOn;
uniform float uDim;
uniform vec3 uWash;
uniform float uPull;
uniform float uNight;

/**
 * A surface, sampled from where it is in the world.
 *
 * Two projections rather than three. A full triplanar blend costs three samples
 * and two of them are thrown away on everything in this game that is flat - the
 * road, the run-off, the sand - so this takes the one the normal points most
 * along and accepts the stretch on the faces in between. On a wall with a corner
 * in it that shows as the texture changing direction at the corner, which is
 * where a change of direction belongs.
 */
vec3 surface(sampler2D tex, vec3 world, vec3 n, float scale) {
  vec2 uv = abs(n.y) > 0.6 ? world.xz
    : abs(n.x) > abs(n.z) ? world.zy : world.xy;
  // Grey with a mean of a half, doubled: a modulation around one, so the palette
  // decides the colour and this decides only the unevenness.
  return texture2D(tex, uv * scale).rgb * 2.0;
}

/**
 * How much of the sun reaches this pixel.
 *
 * Four taps a pixel rather than one. A single tap gives an edge that is a
 * staircase of fourteen centimetre steps, which at the near end of the shadow is
 * a staircase you can count; four taps half a texel apart turn it into two
 * steps, and past about forty metres there is nothing left to see either way.
 *
 * The bias is scaled by how square-on the surface is to the sun, because that is
 * where the error is: a road lit at seventeen degrees has a texel of shadow map
 * spanning half a metre of depth, and a constant bias big enough to survive that
 * lifts every shadow off its own feet.
 */
float sunlight(vec3 sc, float slope) {
  if (uShadowOn < 0.5) return 1.0;
  // Outside the box there is no answer, and full sun is the right guess: the box
  // is the near hundred and forty metres and everything past it is fog anyway.
  if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0) return 1.0;
  float bias = 0.0018 + 0.010 * slope;
  float lit = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 o = vec2(i == 0 || i == 3 ? -0.5 : 0.5, i < 2 ? -0.5 : 0.5) * uShadowTexel;
    lit += texture2D(uShadow, sc.xy + o).r + bias < sc.z ? 0.0 : 1.0;
  }
  return lit * 0.25;
}

void main() {
  /**
   * The time of day, which used to be done a colour at a time on the processor.
   *
   * Darken by uDim, then pull uPull of the way towards uWash. That is the
   * whole of it and it was three lines of JavaScript run against every colour of
   * every face of every frame - which is also the single thing that stopped the
   * world being built once and kept, because a buffer you cannot recolour is a
   * buffer that cannot get dark.
   *
   * uLampOn is nought for the things still drawn a frame at a time - the cars,
   * the smoke, the flags - because those have already been through it on the way
   * in and doing it twice is dusk twice.
   */
  vec4 base = vColour;
  if (uLampOn > 0.5) base.rgb = mix(base.rgb * uDim, uWash, uPull);

  // Two-sided, and it has to be: a tree in this game is two flat quads crossed
  // at right angles, and the winding of a polygon written out by hand fifteen
  // hundred lines ago is whatever it happened to be. Turning the normal to face
  // whoever is looking at it makes the visible side of every surface the lit one,
  // which for a closed box is its outside and for a leaf is both of them.
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  float face = dot(n, uSun);
  float wrap = 0.5 + 0.5 * face;
  // Only the directional half is shadowed. Ambient is the light that arrives
  // from everywhere, and a shadow that took that away as well would be a hole.
  /**
   * Only a face that can see the sun is asked whether something is in the way.
   *
   * A face pointing away from the sun is already at the ambient and shadowing it
   * further changes nothing - except that it is exactly where a shadow map is
   * least sure of itself. Along the line where a surface turns away, the depth
   * it stored and the depth it is testing agree to within the thickness of a
   * texel, and the answer comes out speckled. On a six-sided tree crown at a low
   * sun that speckle is the whole difference between a tree and a tree with a
   * rash.
   */
  float sun = face > 0.02 ? sunlight(vShadow, 1.0 - face) : 1.0;
  float light = (uAmbient + (1.0 - uAmbient) * wrap * sun) * uExposure;
  vec3 colour = base.rgb * light;
  float away = length(vWorld - uCamera);
  /**
   * And a highlight on anything painted.
   *
   * The alpha byte carries the material in the solid pass, where nothing is
   * blended and it is otherwise wasted: two hundred and fifty of two hundred and
   * fifty-five means paint. A narrow window rather than a threshold, so the half
   * transparency the smoke uses is not mistaken for a gloss.
   *
   * It is worth more than it sounds. A flat-shaded car is the same colour for as
   * long as it is pointing the same way; a car with a highlight has something
   * that moves across it as it turns, which is the one thing on the screen that
   * says the light is coming from somewhere.
   */
  /**
   * Ground, which is the one thing here big enough to need a texture.
   *
   * There are no textures in this game and there is no room for UV coordinates:
   * the models are fifteen hundred lines of hand-written polygons and none of
   * them says where it is on a picture. What every surface does know is where it
   * is in the world, and for the two things that actually need breaking up -
   * tarmac and whatever is beside it - that is enough. Both are flat, both are
   * horizontal, and both are seen from above, so a value noise in x and z is a
   * texture in every way that matters here and needs nothing carried through the
   * pipeline to get it.
   *
   * Two octaves and four per cent either way. It has to be almost nothing: this
   * is a flat-shaded game and what it is standing in for is the unevenness of a
   * surface, not a pattern on it. At ten per cent the road looks like carpet.
   */
  /**
   * And the three surfaces big enough to need one.
   *
   * Which one is in the alpha byte, which the solid pass has no use for because
   * nothing is blended while it is drawn - the same channel the paint and the
   * lights ride in, five values apart so a window test cannot confuse them.
   *
   * The strength is held down to a third of what the texture says. These are
   * flat-shaded polygons under one sun and what the texture is standing in for
   * is a surface being uneven, not a pattern on it; at full strength the road
   * looks like gravel and the grass looks like a carpet sample.
   */
  /**
   * The headlights, and the floodlights along the road.
   *
   * Only on the tarmac, which is the only thing either of them is pointed at,
   * and only after dark. Two terms and the brighter wins: your own lights, which
   * are brightest under the nose and gone by ninety metres, and the circuit's,
   * which are dimmer and go all the way to the horizon. That is what a night lap
   * looks like from inside the car - a pool that belongs to you, on a road that
   * is lit anyway.
   *
   * Both were worked out per node per frame on the processor and folded into the
   * colour, and the first was the reason: it depends on how far the node is from
   * the camera, which changes every frame by definition. Here it is the distance
   * this pixel already knows.
   *
   * The floodlights do not depend on the camera - they are a pattern that runs
   * along the road, every twelve nodes - so they are baked. They ride in the
   * length of the normal, which is a channel nothing else was using: the shader
   * normalises it anyway, so what it was scaled by on the way in survives the
   * trip and costs no extra bytes a vertex.
   */
  if (uNight > 0.0 && vColour.a > 0.930 && vColour.a < 0.950) {
    float pool = clamp(length(vNormal) - 1.0, 0.0, 1.0);
    float lamps = pow(max(0.0, 1.0 - away / 85.0), 1.4);
    /**
     * Half what it was, and the reason is that the distance changed meaning.
     *
     * On the processor this was worked out per node from how far that node was
     * along the drawn range, which starts six nodes behind the camera - so the
     * road under the car came out at about forty metres and got roughly half the
     * beam. Here it is the real distance from the camera, which under the nose is
     * eight metres and nearly all of it. Same formula, twice the light, and a
     * night lap that had been moody went to a white floor with a car on it.
     */
    colour *= 1.0 + uNight * max(lamps, pool) * 0.85;
  }

  if (uTextured > 0.5 && vColour.a > 0.905 && vColour.a < 0.950) {
    vec3 tex = vec3(1.0);
    if (vColour.a > 0.930) tex = surface(uTarmac, vWorld, n, 0.25);
    else if (vColour.a > 0.912) tex = surface(uGround, vWorld, n, 0.11);
    else tex = surface(uStone, vWorld, n, 0.16);
    colour *= mix(vec3(1.0), tex, 0.34);
  }

  /**
   * A light, rather than a thing a light falls on.
   *
   * Straight out at more than white, with none of the shading applied: the sun
   * does not light a lamp, and a floodlight on the shadow side of its own post
   * is still on.
   */
  if (vColour.a > 0.950 && vColour.a < 0.970) {
    // A light is not dimmed by the evening. That is what makes it a light.
    gl_FragColor = vec4(vColour.rgb * 2.1, 1.0);
    return;
  }
  float gloss = step(0.970, vColour.a) * step(vColour.a, 0.995);
  if (gloss > 0.0) {
    vec3 eye = normalize(uCamera - vWorld);
    float spec = pow(max(dot(reflect(-uSun, n), eye), 0.0), 22.0);
    colour += vec3(0.55, 0.55, 0.52) * spec * sun * gloss;
  }
  float fog = clamp((away - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  gl_FragColor = vec4(mix(colour, uFogColour, pow(fog, 0.75)), base.a);
}`;

/** Flat things in screen space: the sky and the sun. Coordinates are already NDC. */
const SCREEN_VS = `
precision highp float;
attribute vec2 aPos;
attribute vec4 aColour;
varying vec4 vColour;
varying vec2 vNdc;
void main() {
  vColour = aColour;
  vNdc = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * The sky, the sun, and the clouds in between.
 *
 * `uBoost` is how much brighter than the screen a thing is. It is one for the
 * sky and two and a half for the sun, and the difference is what the bloom pass
 * later finds: a disc at exactly white bleeds nothing, because there is nothing
 * over the edge to bleed.
 *
 * The clouds are the reason this shader knows where the camera is pointing.
 *
 * A gradient is a perfectly good sky for a game that draws one at three hundred
 * and twenty pixels across, and it was the sky here for as long as that was
 * true. It is also a third of the screen with nothing in it, and - this is the
 * part that matters in a driving game - a third of the screen that does not move
 * when you do. A cloud is the only thing above the horizon that tells you you
 * have turned.
 *
 * So the ray through each pixel is worked out from its device coordinates and
 * turned into the world with the camera's own basis, and where that ray crosses
 * a plane a kilometre up is where the cloud is sampled. That makes them sit in
 * the world rather than on the screen: they stay put as you go round a corner
 * and they come towards you down a straight, both of which a screen-space cloud
 * does not do.
 *
 * Two octaves, not four. Near the horizon the ray is nearly flat, the crossing
 * point runs away to the distance and a whole cloud field lands inside one pixel
 * - so they are faded out down there, which is also what haze does to real ones.
 */
const SCREEN_FS = `
precision highp float;
varying vec4 vColour;
varying vec2 vNdc;
uniform float uBoost;
uniform mat3 uSkyBasis;
uniform vec2 uRay;
uniform vec2 uCamXZ;
uniform vec3 uCloud;
uniform vec3 uCloudDark;
uniform float uCover;
uniform float uDrift;

float skyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float skyNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(skyHash(i), skyHash(i + vec2(1.0, 0.0)), u.x),
             mix(skyHash(i + vec2(0.0, 1.0)), skyHash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 colour = vColour.rgb * uBoost;
  if (uCover > 0.001) {
    // The ray through this pixel, in the camera's frame and then in the world.
    vec3 dir = normalize(uSkyBasis * vec3(vNdc.x * uRay.x, vNdc.y * uRay.y, 1.0));
    if (dir.y > 0.02) {
      // Where it crosses the cloud deck. Seven hundred metres rather than a
      // thousand: lower is bigger on the screen, and the deck a driver notices
      // is the one that is over the circuit rather than over the county.
      vec2 at = (uCamXZ + dir.xz * (700.0 / dir.y)) * 0.0009;
      at.x += uDrift;
      // Three octaves. Two gave something that drifted between haze and a smear;
      // what makes a cloud read is the small stuff on the edge of the big stuff.
      float n = skyNoise(at) * 0.54 + skyNoise(at * 2.3 + 31.4) * 0.30
        + skyNoise(at * 5.1 + 11.7) * 0.16;
      /**
       * Coverage as a threshold with a narrow edge.
       *
       * The width of that edge is the entire difference between a cloud and a
       * stain. Wide, every value of the noise is partly cloud and the sky is
       * evenly grey; narrow, most of it is nothing and the rest has an outline.
       */
      float cloud = smoothstep(1.0 - uCover, 1.0 - uCover + 0.13, n);
      // Gone by the horizon, where one pixel covers a mile of the deck.
      cloud *= smoothstep(0.02, 0.22, dir.y);
      // Lit on top and dark underneath, which from below is mostly the dark.
      colour = mix(colour, mix(uCloudDark, uCloud, smoothstep(0.1, 0.75, dir.y)), cloud);
    }
  }
  gl_FragColor = vec4(colour, vColour.a);
}`;

/**
 * The shadow pass: the same world, from the sun, keeping only how far away it is.
 *
 * No colour comes out of this and none goes in. It is the solid buffer drawn a
 * second time with a different matrix, which is why it is nearly free: the
 * processor has already walked the circuit and written the vertices, and this
 * hands the card the same bytes again.
 */
const DEPTH_VS = `
precision highp float;
attribute vec3 aPos;
uniform mat4 uLightProj;
void main() { gl_Position = uLightProj * vec4(aPos, 1.0); }`;

const DEPTH_FS = `
precision highp float;
void main() { gl_FragColor = vec4(1.0); }`;

/** How many texels across the shadow map is. */
const SHADOW_SIZE = 2048;
/**
 * How far round the camera the shadows reach, in metres.
 *
 * A hundred and forty is about four seconds at the speed this game is usually
 * doing, and it is the distance at which a shadow stops being a shadow and
 * starts being a smudge: two thousand texels over two hundred and eighty metres
 * is fourteen centimetres a texel, which is a wheel. Doubling the distance
 * doubles the smudge and buys shadows nobody looks at.
 */
const SHADOW_REACH = 140;
/** And how deep along the sun's own direction, so a hill behind can still cast. */
const SHADOW_DEPTH = 900;

/**
 * The matrix that puts the world into the sun's view.
 *
 * An orthographic box, because the sun is far enough away that its rays are
 * parallel - which is the one thing that makes a directional light cheaper than
 * a lamp. The box follows the camera and is pushed a little way ahead of it,
 * because the half of it behind the car is the half nobody is looking at.
 *
 * It is snapped to whole texels. Without that, a box that moves smoothly with
 * the car makes every shadow edge crawl: the texels it lands on change by a
 * fraction each frame and the staircase along a shadow's edge walks along it.
 * That shimmer is the single thing that makes a shadow map look like a shadow
 * map rather than like a shadow.
 */
export function lightProjection(out, sun, cam, ahead) {
  // A basis with the sun down one axis. The world's up is the reference, unless
  // the sun is directly overhead, which it never is here.
  const fx = -sun[0]; const fy = -sun[1]; const fz = -sun[2];
  let rx = fz; let ry = 0; let rz = -fx;        // cross((0,1,0), forward)
  const rl = Math.hypot(rx, ry, rz) || 1;
  rx /= rl; ry /= rl; rz /= rl;
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;

  // The centre of the box: a little up the road from the camera.
  const cx = cam.x + ahead[0];
  const cy = cam.y + ahead[1];
  const cz = cam.z + ahead[2];
  // In light space, snapped to whole texels so the edges do not crawl.
  const texel = (SHADOW_REACH * 2) / SHADOW_SIZE;
  let lx = rx * cx + ry * cy + rz * cz;
  let ly = ux * cx + uy * cy + uz * cz;
  const lz = fx * cx + fy * cy + fz * cz;
  lx = Math.round(lx / texel) * texel;
  ly = Math.round(ly / texel) * texel;

  // Into the box, which runs from minus one to one down each of its three axes.
  const sx = 1 / SHADOW_REACH;
  const sz = 2 / SHADOW_DEPTH;
  out[0] = rx * sx; out[4] = ry * sx; out[8] = rz * sx; out[12] = -lx * sx;
  out[1] = ux * sx; out[5] = uy * sx; out[9] = uz * sx; out[13] = -ly * sx;
  out[2] = fx * sz; out[6] = fy * sz; out[10] = fz * sz; out[14] = -lz * sz;
  out[3] = 0; out[7] = 0; out[11] = 0; out[15] = 1;
  return out;
}

/**
 * The three passes that happen after the world is drawn.
 *
 * A full screen triangle each time - one triangle rather than two, because a
 * quad has a seam down its diagonal where the hardware runs the fragments twice
 * and there is nothing on the other side of it worth having.
 */
const POST_VS = `
precision highp float;
attribute vec2 aPos;
varying vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** What is brighter than the screen can show. Everything else is thrown away. */
const BRIGHT_FS = `
precision highp float;
varying vec2 vUV;
uniform sampler2D uScene;
uniform float uThreshold;
void main() {
  vec3 c = texture2D(uScene, vUV).rgb;
  // Luminance rather than any one channel: a saturated red at 1.4 is as bright
  // as a white at 1.4 and should bleed the same amount.
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float over = max(0.0, lum - uThreshold);
  gl_FragColor = vec4(c * (over / max(lum, 0.0001)), 1.0);
}`;

/**
 * A blur, one axis at a time.
 *
 * Nine taps as five, using the hardware's own bilinear filtering to read two
 * texels at once - the oldest trick in this particular book and still worth
 * nearly half the work.
 */
const BLUR_FS = `
precision highp float;
varying vec2 vUV;
uniform sampler2D uScene;
uniform vec2 uStep;
void main() {
  vec3 c = texture2D(uScene, vUV).rgb * 0.2270270270;
  c += texture2D(uScene, vUV + uStep * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(uScene, vUV - uStep * 1.3846153846).rgb * 0.3162162162;
  c += texture2D(uScene, vUV + uStep * 3.2307692308).rgb * 0.0702702703;
  c += texture2D(uScene, vUV - uStep * 3.2307692308).rgb * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}`;

/**
 * How much of the sky a pixel can see, from the depth of what is around it.
 *
 * There are no shadows from the ambient light - it arrives from everywhere, and
 * a shadow map answers one direction - so the places where light cannot in
 * practice reach are exactly the places this picture had no way of darkening: the
 * gap under a car, the inside corner where a wall meets the ground, the step down
 * the outside of a kerb. Flat shading makes that worse rather than better,
 * because two faces meeting at a right angle are two flat colours with a hard
 * line between them and nothing to say which way the corner goes.
 *
 * Eight taps on a spiral, comparing view depth. A neighbour that is nearer than
 * this pixel is something between it and the sky. The radius is in metres and
 * converted to pixels per sample, so a contact shadow is the same size in the
 * world whether it is under your own car or under one two hundred metres up the
 * road - which a fixed pixel radius is not, and which is what makes a screen
 * space effect look like a screen space effect.
 *
 * `uFalloff` is what stops the sky occluding the horizon: past this many metres
 * of depth difference the neighbour is not a corner, it is a different object
 * altogether, and it is ignored.
 */
const AO_FS = `
precision highp float;
varying vec2 vUV;
uniform sampler2D uDepth;
uniform vec2 uSize;
uniform float uNear;
uniform float uFar;
uniform float uFocal;
uniform float uRadius;
uniform float uFalloff;

float viewDepth(vec2 uv) {
  float z = texture2D(uDepth, uv).r * 2.0 - 1.0;
  return 2.0 * uFar * uNear / ((uFar + uNear) - z * (uFar - uNear));
}

void main() {
  float here = viewDepth(vUV);
  if (here >= uFar * 0.9) {
    // The sky. Nothing is in front of it and nothing occludes it.
    gl_FragColor = vec4(1.0);
    return;
  }
  /**
   * A world-space radius, in pixels at this depth, with a ceiling on it.
   *
   * The radius is in metres so that a contact shadow is the same size in the
   * world wherever it is - which is right, and which for the car eight metres
   * from the camera works out at nearly two hundred pixels. At that size it
   * stops being a contact shadow and becomes a bruise the width of the road. The
   * cap costs correctness on the nearest metre or two of the picture and buys
   * back the thing the effect is for.
   */
  float px = min(uRadius * uFocal / max(here, 0.5), 14.0);
  // Not named step: that is a built-in, and shadowing it makes the compiler
  // reject the call to it four lines down with a message about a function name.
  vec2 reach = px / uSize;
  float dark = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7853981634;
    // Two rings rather than one, so the near samples catch a tight corner and
    // the far ones catch a car sitting over the road.
    float r = (i == 0 || i == 3 || i == 5 || i == 6) ? 0.45 : 1.0;
    vec2 at = vUV + vec2(cos(a), sin(a)) * reach * r;
    float diff = here - viewDepth(at);
    /**
     * Near enough to be the same object, and no nearer.
     *
     * The second half is the whole difference between an occlusion and a dark
     * halo round everything. A pixel of distant grass next to a car sees the car
     * as something between it and the sky, which it is - and it is also two
     * hundred metres away and has nothing to do with that piece of grass. A
     * difference bigger than the radius is not a crease, it is a different
     * object, and it is thrown away rather than counted at full strength.
     */
    dark += step(0.03, diff) * (1.0 - smoothstep(uFalloff * 0.5, uFalloff, diff));
  }
  gl_FragColor = vec4(vec3(1.0 - dark * 0.0625), 1.0);
}`;

/**
 * The world and its glow, onto the screen, with the range brought back in.
 *
 * A soft knee rather than a tone curve: below four fifths of white nothing is
 * touched at all, and above it the rest of the range is folded into what is
 * left. That matters more here than in a game whose picture was authored in high
 * range to begin with. Every colour in this one was chosen against a screen that
 * stops at white - the greens, the tarmac, the eight team colours - and a curve
 * that pulls the whole picture down to make room for a sun that is brighter than
 * white is a curve that makes every one of those choices wrong. Reinhard across
 * the whole range, which is what this had first, took a fifth of the brightness
 * out of the entire circuit to accommodate one disc.
 *
 * On the luminance rather than per channel. Per channel, anything over one goes
 * towards white, which turns a low sun from orange into a white disc with an
 * orange ring; on the luminance the hue survives being too bright, which is the
 * whole point of drawing a sunset.
 */
const COMPOSE_FS = `
precision highp float;
varying vec2 vUV;
uniform sampler2D uScene;
uniform sampler2D uGlow;
uniform sampler2D uOcclusion;
uniform float uBloom;
uniform float uAo;
uniform float uRush;
const float KNEE = 0.8;

/**
 * The world, smeared outwards from the middle of the screen by how fast you are
 * going.
 *
 * Everything else in this game that says "fast" is geometry: the lens opens from
 * fifty degrees to seventy, the camera drops two feet and comes in, and the
 * whole thing starts to shiver. All three are worth more than the number in the
 * corner and none of them is about the pixels. This is the one that is - it is
 * what a camera does at three hundred, and it is the last thing on the list that
 * a flat-shaded polygon renderer could not do before there was a buffer to read
 * back.
 *
 * Radially, and scaled by the square of the distance from the centre: nothing at
 * all where you are looking, and most of it at the edges, where the kerbs are
 * going past. Blurring the middle of the screen would only make the car you are
 * chasing hard to see, which is the opposite of the point.
 *
 * Six taps. Four is a smear with steps in it at the corners of the screen and
 * eight is not visibly better than six.
 */
vec3 rushed(vec2 uv) {
  vec2 out_ = uv - 0.5;
  float amount = uRush * dot(out_, out_);
  if (amount < 0.0001) return texture2D(uScene, uv).rgb;
  vec3 c = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    c += texture2D(uScene, uv - out_ * amount * float(i) * 0.2).rgb;
  }
  return c / 6.0;
}

void main() {
  // The occlusion first, and before the glow: a light bleeding out of a corner
  // is not dimmed by the corner it is bleeding out of.
  float ao = mix(1.0, texture2D(uOcclusion, vUV).r, uAo);
  vec3 c = rushed(vUV) * ao + texture2D(uGlow, vUV).rgb * uBloom;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  if (lum > KNEE) {
    float over = (lum - KNEE) / (1.0 - KNEE);
    float mapped = KNEE + (1.0 - KNEE) * (1.0 - exp(-over));
    c *= mapped / max(lum, 0.0001);
  }
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
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
    this.lightProj = new Float32Array(16);
    this.shadow = makeShadowMap(gl);
    if (this.shadow) this.depth = compile(gl, DEPTH_VS, DEPTH_FS);
    /**
     * Where the world is drawn before it reaches the screen.
     *
     * A floating point one, so a colour may be brighter than white: the sun, a
     * highlight on a wing, a floodlight. Everything that follows - the glow, the
     * range being brought back in at the end - only means anything because there
     * is something over the edge to find.
     *
     * Nothing if the card will not give us one, and then the world is drawn
     * straight to the screen exactly as it was before any of this. A missing
     * glow is a missing glow.
     */
    /**
     * The three surfaces, built once, out of arithmetic.
     *
     * Wrapped in a try because a card that will not give us these is a card that
     * should still get a picture: the shader falls back to the flat colour it
     * had before there were any, which is the game as it was yesterday.
     */
    try {
      this.surfaces = makeSurfaces(gl);
    } catch {
      this.surfaces = null;
    }
    this.hdr = makeSceneBuffer(gl);
    if (this.hdr) {
      this.post = {
        bright: compile(gl, POST_VS, BRIGHT_FS),
        blur: compile(gl, POST_VS, BLUR_FS),
        ao: compile(gl, POST_VS, AO_FS),
        compose: compile(gl, POST_VS, COMPOSE_FS),
        // One triangle, big enough to cover the screen.
        quad: buffer(gl, gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3])),
      };
    }
    this.bloom = 1;
    /** How much of the occlusion is used. One is all of it, nought is none. */
    this.ao = 1;

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
    /**
     * Paint rather than plastic.
     *
     * A flag, not a colour: it rides in the alpha byte, which the solid pass has
     * no use for because blending is off while it is drawn. Two hundred and
     * fifty instead of two hundred and fifty-five says "this face is painted
     * metal", and the shader gives it a highlight from the sun.
     *
     * It is the difference between a car and a shape the colour of a car. A
     * single seater is the only thing in this world with a gloss on it - the
     * road is not polished, a tree is not, and a grandstand is concrete - so
     * this is on for the bodywork and off for everything else, including the
     * tyres.
     */
    this.shine = 0;
    /**
     * A thing that is a light rather than a thing a light falls on.
     *
     * Same trick as the gloss and the same byte: two hundred and forty-five. A
     * lamp, a floodlight, the strip down the roof of the tunnel, the rain light
     * on the back of a car. It is drawn above white, so it survives the fold at
     * the end and it bleeds into what is around it - which is the whole reason
     * the picture goes through a floating point buffer at all. A headlight that
     * is exactly white is a white rectangle; one at twice white is a headlight.
     */
    this.emissive = 0;
    /**
     * Which surface this is: 1 tarmac, 2 ground, 3 stone. Nought for none.
     *
     * The last of the material flags and the one with more than two states. What
     * it buys is a texture on the three things in this picture large enough to
     * need one, sampled from where the surface is in the world - which is the
     * only kind of texture available to a renderer whose models have no UV
     * coordinates and are not going to get any.
     */
    this.ground = 0;
    /**
     * How much of the circuit's own lighting falls here, from nought to one.
     *
     * Only the tarmac sets it, only while a world is being recorded, and it
     * rides in the length of the face normal rather than in a channel of its own.
     */
    this.pool = 0;
    this.recording = false;
    this.normalise = false;
    this.kept = null;
  }

  /** The size of the picture. Set by the renderer when the window changes. */
  resize(width, height) {
    if (this.w === width && this.h === height) return;
    this.w = width;
    this.h = height;
    if (this.hdr) this.hdr = makeSceneBuffer(this.gl, width, height, this.hdr);
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

    if (this.hdr) gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdr.draw);
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
    // Everything after this point in the screen buffer is the sun, which is
    // drawn brighter than the screen can show.
    this.skyCount = this.ui.count;
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
   * Start writing into a buffer that will be kept, rather than into this frame's.
   *
   * A circuit does not move. The road, the kerbs, the barriers, the ground and
   * fifty thousand trees are the same eighteen hundred metres of geometry on the
   * first lap as on the last, and they were being walked, transformed and written
   * out sixty times a second because the colours had to be recomputed for the
   * time of day. They do not any more - that moved into the shader - so the whole
   * circuit is built once and a frame is a range of it.
   *
   * `mark` is called at each node, so the renderer knows where that node's
   * geometry starts and what the frame draws is a slice.
   */
  record() {
    this.kept = makeSink(65536);
    this.kept.marks = [];
    this.recording = true;
    this.normalise = true;
  }

  /** Where the buffer has got to. The renderer notes one of these a node. */
  mark() {
    this.kept.marks.push(this.kept.count);
  }

  /** Hands the recording to the card and stops recording. */
  keep() {
    const gl = this.gl;
    const sink = this.kept;
    this.recording = false;
    this.normalise = false;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(sink.f32.buffer, 0, sink.count * 7), gl.STATIC_DRAW);
    const out = {
      buffer, count: sink.count, marks: sink.marks, tris: sink.count / 3,
      bytes: sink.count * STRIDE,
    };
    this.kept = null;
    return out;
  }

  /** Throws a kept world away. Called when the circuit changes. */
  forget(world) {
    if (world) this.gl.deleteBuffer(world.buffer);
  }

  /**
   * Which kept world to draw this frame, and which slices of it.
   *
   * Said here rather than drawn here: nothing in this class draws until `blit`,
   * because the program, the matrix and every uniform are set up there. The
   * renderer walks the nodes it can see, works out the ranges, and leaves them.
   */
  show(world, ranges) {
    this.world = world;
    this.ranges = ranges;
  }

  /** The slices, with whichever program is already bound. */
  drawKept(attribs) {
    const gl = this.gl;
    if (!this.world || !this.ranges) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.buffer);
    gl.vertexAttribPointer(attribs.aPos, 3, gl.FLOAT, false, STRIDE, 0);
    if (attribs.aNormal !== undefined) {
      gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, STRIDE, 12);
    }
    if (attribs.aColour !== undefined) {
      gl.vertexAttribPointer(attribs.aColour, 4, gl.UNSIGNED_BYTE, true, STRIDE, 24);
    }
    for (let i = 0; i < this.ranges.length; i++) {
      const first = this.ranges[i][0];
      const count = this.ranges[i][1];
      if (count <= 0) continue;
      gl.drawArrays(gl.TRIANGLES, first, count);
      this.tris += count / 3;
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
    const sink = this.recording ? this.kept : this.stipple ? this.clear : this.solid;
    if ((sink.count + 3) * STRIDE > sink.data.byteLength) grow(sink);
    const alpha = this.stipple ? 150
      : this.emissive ? 245
        : this.ground === 1 ? 240
          : this.ground === 2 ? 235
            : this.ground === 3 ? 230
              : this.shine ? 250 : 255;
    // The chequered second colour is now simply the colour in between.
    const c = this.dither ? blend(colour, this.dither) : colour;
    const ux = bx - ax; const uy = by - ay; const uz = bz - az;
    const vx = cx - ax; const vy = cy - ay; const vz = cz - az;
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    /**
     * A kept world's normals are unit length and a frame's are not.
     *
     * The cross product's length is twice the triangle's area, which the shader
     * does not care about because it normalises - except that the length is also
     * where the floodlight pattern rides, and a channel cannot carry two things.
     * So the world that is built once pays for a square root a triangle, and the
     * frame, which is built sixty times a second, does not.
     */
    if (this.normalise) {
      const len = Math.hypot(nx, ny, nz) || 1;
      const k = (1 + this.pool) / len;
      nx *= k; ny *= k; nz *= k;
    }
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
  light({
    sun, ambient, fogColour, fogNear, fogFar, ahead = [0, 0, 0],
    cloud, cloudDark, cover = 0, drift = 0,
  }) {
    this.cloud = cloud;
    this.cloudDark = cloudDark;
    this.cover = cover;
    this.drift = drift;
    this.sun = sun;
    this.ahead = ahead;
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
      const sky = Math.min(this.skyCount || this.ui.count, this.ui.count);
      /**
       * What the sky shader needs to know about where the camera is pointing.
       *
       * The basis is the transpose of the view rotation, which for an orthonormal
       * matrix is its inverse - so it turns a direction in the camera's frame
       * into one in the world. `uRay` converts device coordinates back into that
       * frame: the projection multiplied x by two focal lengths over the width,
       * so this divides it out again.
       */
      const c = this.cam;
      const m = [
        c.cr * c.cy - c.sr * c.sp * c.sy, -c.sr * c.cp, -c.cr * c.sy - c.sr * c.sp * c.cy,
        c.sr * c.cy + c.cr * c.sp * c.sy, c.cr * c.cp, -c.sr * c.sy + c.cr * c.sp * c.cy,
        c.cp * c.sy, -c.sp, c.cp * c.cy,
      ];
      // Transposed, and in the column-major order a mat3 uniform is read in.
      gl.uniformMatrix3fv(this.screen.uniforms.uSkyBasis, false, new Float32Array([
        m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8],
      ]));
      gl.uniform2f(this.screen.uniforms.uRay,
        this.w / (2 * this.focal), this.h / (2 * this.focal));
      gl.uniform2f(this.screen.uniforms.uCamXZ, c.x, c.z);
      gl.uniform3fv(this.screen.uniforms.uCloud, this.cloud || [1, 1, 1]);
      gl.uniform3fv(this.screen.uniforms.uCloudDark, this.cloudDark || [0.8, 0.8, 0.85]);
      gl.uniform1f(this.screen.uniforms.uCover, this.cover ?? 0);
      gl.uniform1f(this.screen.uniforms.uDrift, this.drift || 0);
      gl.uniform1f(this.screen.uniforms.uBoost, 1);
      gl.drawArrays(gl.TRIANGLES, 0, sky);
      if (this.ui.count > sky) {
        // The sun, at two and a half times white. On a card with no floating
        // point buffer this clamps back to white and simply looks like the sun
        // did last week.
        // The cloud is left on for the sun, so a cloud in front of it is in
        // front of it. Turned off - which is how this was first written - the
        // sun is painted over the deck, which is a sun nearer than the weather.
        gl.uniform1f(this.screen.uniforms.uBoost, SUN_BRIGHT);
        gl.drawArrays(gl.TRIANGLES, sky, this.ui.count - sky);
      }
      gl.enable(gl.DEPTH_TEST);
    }

    // The sun's own view of the world, into a depth texture, before anything is
    // drawn for the screen. It is the same buffer that is about to be drawn
    // again, so the only cost is the card filling two thousand square texels.
    if (this.shadow && (this.solid.count || this.world)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.flatBuf);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(this.solid.f32.buffer, 0, this.solid.count * 7), gl.STREAM_DRAW);
      this.solid.sent = true;
      lightProjection(this.lightProj, this.sun || [0, 1, 0], this.cam, this.ahead || [0, 0, 0]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadow.frame);
      gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.depth.program);
      gl.uniformMatrix4fv(this.depth.uniforms.uLightProj, false, this.lightProj);
      const d = this.depth.attribs;
      gl.enableVertexAttribArray(d.aPos);
      gl.vertexAttribPointer(d.aPos, 3, gl.FLOAT, false, STRIDE, 0);
      gl.drawArrays(gl.TRIANGLES, 0, this.solid.count);
      // And the circuit, which is most of what there is to cast: without this a
      // world that had been built once stopped throwing any shadow at all, and
      // the cars were the only things in the game with one.
      const before = this.tris;
      this.drawKept(d);
      this.tris = before;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.flatBuf);
      // Back to whatever the world is being drawn into, which is the floating
      // point picture when there is one and the screen when there is not. Bound
      // to null here, the sky went into the picture and everything after it went
      // to the screen - where the glow pass then painted the picture over it.
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdr ? this.hdr.draw : null);
      gl.viewport(0, 0, this.w, this.h);
    }

    viewProjection(this.viewProj, this.cam, this.focal, this.w, this.h);
    gl.useProgram(this.flat.program);
    gl.uniformMatrix4fv(this.flat.uniforms.uViewProj, false, this.viewProj);
    gl.uniformMatrix4fv(this.flat.uniforms.uLightProj, false, this.lightProj);
    if (this.shadow) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.shadow.texture);
      gl.uniform1i(this.flat.uniforms.uShadow, 0);
      gl.uniform1f(this.flat.uniforms.uShadowTexel, 1 / SHADOW_SIZE);
    }
    gl.uniform1f(this.flat.uniforms.uShadowOn, this.shadow ? 1 : 0);
    if (this.surfaces) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.surfaces.tarmac);
      gl.uniform1i(this.flat.uniforms.uTarmac, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.surfaces.ground);
      gl.uniform1i(this.flat.uniforms.uGround, 2);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.surfaces.stone);
      gl.uniform1i(this.flat.uniforms.uStone, 3);
      gl.activeTexture(gl.TEXTURE0);
    }
    gl.uniform1f(this.flat.uniforms.uTextured, this.surfaces ? 1 : 0);
    gl.uniform1f(this.flat.uniforms.uDim, this.dim ?? 1);
    gl.uniform3fv(this.flat.uniforms.uWash, this.wash || [1, 1, 1]);
    gl.uniform1f(this.flat.uniforms.uPull, this.pull ?? 0);
    gl.uniform1f(this.flat.uniforms.uNight, this.night ?? 0);
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

    gl.depthMask(true);
    gl.disable(gl.BLEND);
    // The circuit first, with the time of day applied here; then whatever this
    // frame built, which has been through it already on the way in.
    if (this.world) {
      gl.uniform1f(this.flat.uniforms.uLampOn, 1);
      this.drawKept(a);
    }
    gl.uniform1f(this.flat.uniforms.uLampOn, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.flatBuf);

    if (this.solid.count) {
      // Already sent, if the shadow pass has been through it.
      if (!this.solid.sent) {
        gl.bufferData(gl.ARRAY_BUFFER,
          new Float32Array(this.solid.f32.buffer, 0, this.solid.count * 7), gl.STREAM_DRAW);
      }
      this.solid.sent = false;
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

    this.glow();
  }

  /**
   * The glow, and the way back to a screen that only goes to white.
   *
   * Three passes over a quarter-size picture and one over the full one. What
   * comes out of the world is a floating point image where the sun is at two and
   * a half and a highlight on a wing may be at one and a bit; the screen has one.
   * Something has to decide what to do with the rest, and the choice of what -
   * clip it, or let it bleed into what is next to it - is most of the difference
   * between a sunset that is a bright disc and a sunset.
   *
   * The blur is separable and runs at a quarter of the width, which is sixteen
   * times fewer pixels and is invisible: a glow is the one thing in a picture
   * that is allowed to be low resolution, because it is already the shape of
   * something being out of focus.
   */
  glow() {
    const gl = this.gl;
    if (!this.hdr) return;
    // The samples down to one picture, colour and depth both, before anything
    // reads either of them.
    if (this.hdr.multi) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.hdr.multi.frame);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.hdr.frame);
      gl.blitFramebuffer(0, 0, this.w, this.h, 0, 0, this.w, this.h,
        gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.blitFramebuffer(0, 0, this.w, this.h, 0, 0, this.w, this.h,
        gl.DEPTH_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.post.quad);

    const pass = (program, target, source, set) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.frame : null);
      gl.viewport(0, 0, target ? target.w : this.w, target ? target.h : this.h);
      gl.useProgram(program.program);
      gl.enableVertexAttribArray(program.attribs.aPos);
      gl.vertexAttribPointer(program.attribs.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, source);
      gl.uniform1i(program.uniforms.uScene, 0);
      if (set) set(program.uniforms);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const half = this.hdr.half;
    const spare = this.hdr.spare;

    // How much of the sky each pixel can see, from the depth of its neighbours.
    // Its own pass because it reads depth rather than colour.
    const ao = this.hdr.ao;
    gl.bindFramebuffer(gl.FRAMEBUFFER, ao.frame);
    gl.viewport(0, 0, ao.w, ao.h);
    gl.useProgram(this.post.ao.program);
    gl.enableVertexAttribArray(this.post.ao.attribs.aPos);
    gl.vertexAttribPointer(this.post.ao.attribs.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.hdr.depth);
    gl.uniform1i(this.post.ao.uniforms.uDepth, 0);
    gl.uniform2f(this.post.ao.uniforms.uSize, ao.w, ao.h);
    gl.uniform1f(this.post.ao.uniforms.uNear, NEAR);
    gl.uniform1f(this.post.ao.uniforms.uFar, FAR);
    gl.uniform1f(this.post.ao.uniforms.uFocal, this.focal * (ao.w / this.w));
    // A metre and a bit: the gap under a car, the step off a kerb, the corner
    // where a wall meets the ground. Bigger than that and it stops being a
    // contact shadow and starts being a stain round everything.
    gl.uniform1f(this.post.ao.uniforms.uRadius, 0.85);
    // And the depth beyond which a neighbour is a different object rather than
    // the other side of a corner. A little under the radius: a crease this size
    // cannot be deeper than it is wide.
    gl.uniform1f(this.post.ao.uniforms.uFalloff, 0.7);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    pass(this.post.bright, half, this.hdr.texture, (u) => gl.uniform1f(u.uThreshold, 1.0));
    pass(this.post.blur, spare, half.texture, (u) => gl.uniform2f(u.uStep, 1 / half.w, 0));
    pass(this.post.blur, half, spare.texture, (u) => gl.uniform2f(u.uStep, 0, 1 / half.h));

    // And back to the screen, with the glow added and the range brought in.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(this.post.compose.program);
    gl.enableVertexAttribArray(this.post.compose.attribs.aPos);
    gl.vertexAttribPointer(this.post.compose.attribs.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.hdr.texture);
    gl.uniform1i(this.post.compose.uniforms.uScene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, half.texture);
    gl.uniform1i(this.post.compose.uniforms.uGlow, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, ao.texture);
    gl.uniform1i(this.post.compose.uniforms.uOcclusion, 2);
    gl.uniform1f(this.post.compose.uniforms.uBloom, this.bloom);
    gl.uniform1f(this.post.compose.uniforms.uAo, this.ao);
    gl.uniform1f(this.post.compose.uniforms.uRush, this.rush || 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.DEPTH_TEST);
  }
}

/**
 * The depth texture the sun's view is drawn into, or nothing.
 *
 * Nothing on a context that cannot do it - WebGL 1 without the depth texture
 * extension, which is most phones from before about 2015 - and the shader falls
 * back to the light it had before, which is the picture this game had last week.
 * A missing shadow is a missing shadow; a black screen is a bug report.
 */
function makeShadowMap(gl) {
  const depthOk = gl.webgl2 || gl.getExtension('WEBGL_depth_texture');
  if (!depthOk) return null;
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (gl.webgl2) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SHADOW_SIZE, SHADOW_SIZE, 0,
      gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, SHADOW_SIZE, SHADOW_SIZE, 0,
      gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
  }
  // Nearest, and clamped: a shadow map is a depth, and interpolating between two
  // depths gives a depth that is at neither of the two things that were there.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const frame = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
  if (gl.webgl2) {
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
  }
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return ok ? { texture, frame } : null;
}

/** How much brighter than the screen the sun is drawn. */
const SUN_BRIGHT = 2.5;

/**
 * A picture that may be brighter than white, and a quarter-size pair to blur in.
 *
 * Half float rather than full: it is a picture, not a simulation, and eleven bits
 * of mantissa is more than a screen with eight will ever ask for. WebGL 2 has it
 * as standard; WebGL 1 needs two extensions and most cards that far back have
 * them. Where it is not there this returns nothing and the world goes straight
 * to the screen, which is what it did before there was a glow at all.
 */
function makeSceneBuffer(gl, width = gl.drawingBufferWidth, height = gl.drawingBufferHeight, old = null) {
  if (old) {
    for (const part of [old, old.half, old.spare, old.ao]) {
      if (!part) continue;
      gl.deleteFramebuffer(part.frame);
      gl.deleteTexture(part.texture);
      if (part.depth) gl.deleteTexture(part.depth);
    }
    if (old.multi) {
      gl.deleteFramebuffer(old.multi.frame);
      gl.deleteRenderbuffer(old.multi.colour);
      gl.deleteRenderbuffer(old.multi.depth);
    }
  }
  const float = gl.webgl2
    ? gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')
    : gl.getExtension('OES_texture_half_float');
  if (!float) return null;
  const HALF_FLOAT = gl.webgl2 ? 0x140B : (gl.getExtension('OES_texture_half_float') || {}).HALF_FLOAT_OES;
  if (!gl.webgl2 && !gl.getExtension('OES_texture_half_float_linear')) return null;

  const target = (w, h, withDepth) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (gl.webgl2) {
      gl.texImage2D(gl.TEXTURE_2D, 0, 0x881A /* RGBA16F */, w, h, 0, gl.RGBA, HALF_FLOAT, null);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, HALF_FLOAT, null);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const frame = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    let depth = null;
    if (withDepth) {
      /**
       * A texture rather than a renderbuffer, because it is read back.
       *
       * What reads it is the occlusion pass: how much of the sky a pixel can
       * see is a question about the depth of its neighbours and about nothing
       * else, and a renderbuffer is a place to put depth that cannot be asked.
       */
      depth = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, depth);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.webgl2 ? gl.DEPTH_COMPONENT24 : gl.DEPTH_COMPONENT,
        w, h, 0, gl.DEPTH_COMPONENT, gl.webgl2 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    return ok ? { texture, frame, depth, w, h } : null;
  };

  const scene = target(width, height, true);
  /**
   * And the same picture again, multisampled, which is the one drawn into.
   *
   * `antialias: true` on the context buys a multisampled default framebuffer,
   * and the moment the world started being drawn into one of our own it bought
   * nothing at all: every edge in the game went hard overnight and the only
   * reason it was not noticed immediately is that flat shading has a lot of
   * hard edges in it on purpose.
   *
   * So the world goes into multisampled renderbuffers and is resolved into the
   * texture afterwards, which is one blit and is what the hardware is for. Both
   * the colour and the depth are resolved, because the occlusion pass reads the
   * depth and an aliased depth gives an aliased contact shadow.
   *
   * WebGL 1 cannot do it at all and gets the picture without, which is what it
   * would have had anyway.
   */
  let multi = null;
  if (gl.webgl2) {
    const samples = Math.min(4, gl.getParameter(0x8D57 /* MAX_SAMPLES */) || 1);
    if (samples > 1) {
      const colour = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, colour);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, 0x881A /* RGBA16F */, width, height);
      const depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, width, height);
      const frame = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colour);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
        multi = { frame, colour, depth, samples, w: width, h: height };
      }
    }
  }
  // A quarter of the width, which is a sixteenth of the pixels. A glow is the
  // one thing in a picture allowed to be low resolution.
  const hw = Math.max(1, Math.floor(width / 4));
  const hh = Math.max(1, Math.floor(height / 4));
  const half = target(hw, hh, false);
  const spare = target(hw, hh, false);
  // And the occlusion, at half the width rather than a quarter: a glow is
  // allowed to be soft and a contact shadow is not.
  const ao = target(Math.max(1, Math.floor(width / 2)), Math.max(1, Math.floor(height / 2)), false);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  if (!scene || !half || !spare || !ao) return null;
  // `draw` is what the world is drawn into and `frame` is what is read back.
  // They are the same thing when there is no multisampling to resolve.
  return { ...scene, half, spare, ao, multi, draw: multi ? multi.frame : scene.frame };
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
