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

/**
 * Value noise, from a hash, with nothing behind it.
 *
 * Four corners of a grid cell, smoothed between. It is the cheapest noise there
 * is and it is the right one here: what it is standing in for is a surface being
 * slightly uneven, which has no structure to get wrong.
 */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float grain(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
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
  vec3 colour = vColour.rgb * light;
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
  if (vColour.a > 0.930 && vColour.a < 0.950) {
    colour *= 0.96 + 0.08 * (grain(vWorld.xz * 0.22) * 0.65 + grain(vWorld.xz * 1.7) * 0.35);
  }

  /**
   * A light, rather than a thing a light falls on.
   *
   * Straight out at more than white, with none of the shading applied: the sun
   * does not light a lamp, and a floodlight on the shadow side of its own post
   * is still on.
   */
  if (vColour.a > 0.950 && vColour.a < 0.970) {
    gl_FragColor = vec4(vColour.rgb * 2.1, 1.0);
    return;
  }
  float gloss = step(0.970, vColour.a) * step(vColour.a, 0.995);
  if (gloss > 0.0) {
    vec3 eye = normalize(uCamera - vWorld);
    float spec = pow(max(dot(reflect(-uSun, n), eye), 0.0), 22.0);
    colour += vec3(0.55, 0.55, 0.52) * spec * sun * gloss;
  }
  float away = length(vWorld - uCamera);
  float fog = clamp((away - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  gl_FragColor = vec4(mix(colour, uFogColour, pow(fog, 0.75)), vColour.a);
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

/**
 * The sky and the sun, and the one place in this game with a colour over one.
 *
 * `uBoost` is how much brighter than the screen a thing is. It is one for the
 * sky and two and a half for the sun, and the difference is what the bloom pass
 * later finds: a disc at exactly white bleeds nothing, because there is nothing
 * over the edge to bleed.
 */
const SCREEN_FS = `
precision highp float;
varying vec4 vColour;
uniform float uBoost;
void main() {
  gl_FragColor = vec4(vColour.rgb * uBoost, vColour.a);
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
uniform float uBloom;
const float KNEE = 0.8;
void main() {
  vec3 c = texture2D(uScene, vUV).rgb + texture2D(uGlow, vUV).rgb * uBloom;
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
    this.hdr = makeSceneBuffer(gl);
    if (this.hdr) {
      this.post = {
        bright: compile(gl, POST_VS, BRIGHT_FS),
        blur: compile(gl, POST_VS, BLUR_FS),
        compose: compile(gl, POST_VS, COMPOSE_FS),
        // One triangle, big enough to cover the screen.
        quad: buffer(gl, gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3])),
      };
    }
    this.bloom = 1;

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
     * Tarmac, grass, sand: the surfaces big enough to need breaking up.
     *
     * The third of these material flags and the last. What it buys is a little
     * unevenness worked out from where the surface is in the world, which is the
     * only kind of texture available to a renderer whose models have no UV
     * coordinates and are not going to get any.
     */
    this.ground = 0;
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

    if (this.hdr) gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdr.frame);
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
    const alpha = this.stipple ? 150
      : this.emissive ? 245 : this.ground ? 240 : this.shine ? 250 : 255;
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
  light({ sun, ambient, fogColour, fogNear, fogFar, ahead = [0, 0, 0] }) {
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
      gl.uniform1f(this.screen.uniforms.uBoost, 1);
      gl.drawArrays(gl.TRIANGLES, 0, sky);
      if (this.ui.count > sky) {
        // The sun, at two and a half times white. On a card with no floating
        // point buffer this clamps back to white and simply looks like the sun
        // did last week.
        gl.uniform1f(this.screen.uniforms.uBoost, SUN_BRIGHT);
        gl.drawArrays(gl.TRIANGLES, sky, this.ui.count - sky);
      }
      gl.enable(gl.DEPTH_TEST);
    }

    // The sun's own view of the world, into a depth texture, before anything is
    // drawn for the screen. It is the same buffer that is about to be drawn
    // again, so the only cost is the card filling two thousand square texels.
    if (this.shadow && this.solid.count) {
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
      // Back to whatever the world is being drawn into, which is the floating
      // point picture when there is one and the screen when there is not. Bound
      // to null here, the sky went into the picture and everything after it went
      // to the screen - where the glow pass then painted the picture over it.
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdr ? this.hdr.frame : null);
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
    gl.uniform1f(this.post.compose.uniforms.uBloom, this.bloom);
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
    for (const part of [old, old.half, old.spare]) {
      if (!part) continue;
      gl.deleteFramebuffer(part.frame);
      gl.deleteTexture(part.texture);
      if (part.depth) gl.deleteRenderbuffer(part.depth);
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
      depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
    }
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    return ok ? { texture, frame, depth, w, h } : null;
  };

  const scene = target(width, height, true);
  // A quarter of the width, which is a sixteenth of the pixels. A glow is the
  // one thing in a picture allowed to be low resolution.
  const hw = Math.max(1, Math.floor(width / 4));
  const hh = Math.max(1, Math.floor(height / 4));
  const half = target(hw, hh, false);
  const spare = target(hw, hh, false);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  if (!scene || !half || !spare) return null;
  return { ...scene, half, spare };
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
