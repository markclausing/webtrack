// A graphics card that is not there.
//
// The renderer talks to WebGL now, and WebGL needs a browser. Most of what the
// page tests check has nothing to do with a graphics card - the menu wiring, the
// score panel, the key bindings, the loop - and losing all of that to the one
// thing that does would be a poor trade, so this is enough of a context for the
// renderer to build itself against and run.
//
// It draws nothing, and it is honest about that: what it counts is the calls.
// A frame that issued a draw with thirty thousand vertices in it went through
// every line of the renderer that matters, and if the renderer throws - a
// uniform that is not there, a buffer of the wrong shape, a matrix with a NaN
// in it - it throws here exactly as it would in a browser.
//
// The pictures are checked by tools/screenshot.js, which drives a real Chrome.

/** Every constant WebGL is asked for, as itself. Nothing here compares them. */
const CONSTANTS = [
  'VERTEX_SHADER', 'FRAGMENT_SHADER', 'COMPILE_STATUS', 'LINK_STATUS',
  'ACTIVE_UNIFORMS', 'ACTIVE_ATTRIBUTES', 'ARRAY_BUFFER', 'ELEMENT_ARRAY_BUFFER',
  'FLOAT', 'UNSIGNED_BYTE', 'UNSIGNED_SHORT', 'UNSIGNED_INT', 'TRIANGLES',
  'DEPTH_TEST', 'CULL_FACE', 'BLEND', 'LEQUAL', 'BACK', 'SRC_ALPHA',
  'ONE_MINUS_SRC_ALPHA', 'ONE', 'COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT',
  'STREAM_DRAW', 'STATIC_DRAW', 'DYNAMIC_DRAW', 'TEXTURE_2D', 'TEXTURE0', 'RGBA',
  'LINEAR', 'LINEAR_MIPMAP_LINEAR', 'CLAMP_TO_EDGE', 'REPEAT',
  'TEXTURE_MIN_FILTER', 'TEXTURE_MAG_FILTER', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T',
];

export function makeGlStub() {
  const counts = { draws: 0, vertices: 0, programs: 0, buffers: 0 };
  const gl = {
    counts,
    canvas: null,
    drawingBufferWidth: 1280,
    drawingBufferHeight: 800,
    createProgram: () => ({ uniforms: {} }),
    createShader: () => ({}),
    createBuffer: () => { counts.buffers++; return {}; },
    createTexture: () => ({}),
    shaderSource() {},
    compileShader() {},
    attachShader() {},
    deleteShader() {},
    linkProgram() { counts.programs++; },
    getShaderParameter: () => true,
    getProgramParameter: (program, name) => (name === true ? true : 0),
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    getActiveUniform: () => ({ name: 'u' }),
    getActiveAttrib: () => ({ name: 'a' }),
    getUniformLocation: () => ({}),
    getAttribLocation: () => 0,
    getExtension: () => null,
    drawArrays(mode, first, count) { counts.draws++; counts.vertices += count; },
    drawElements(mode, count) { counts.draws++; counts.vertices += count; },
  };
  // getProgramParameter is asked two different questions - did it link, and how
  // many uniforms are there - and both go through the same call. True for the
  // first and nought for the second: nought uniforms means the loop that looks
  // them up does not run, which is right, because there is nothing to look up.
  gl.getProgramParameter = (program, name) => name !== 'count';
  for (let i = 0; i < CONSTANTS.length; i++) gl[CONSTANTS[i]] = i + 1;
  // Everything else - viewport, enable, bindBuffer, bufferData, uniform*, the
  // forty calls that set state and return nothing - does nothing and returns
  // nothing, which is exactly what it does on a card as far as this code knows.
  return new Proxy(gl, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'string' && prop.toUpperCase() === prop) return 1;
      return () => {};
    },
  });
}

/**
 * A canvas that will hand out either context.
 *
 * The world asks for 'webgl2' and the display asks for '2d', and both get
 * something that takes the calls. The 2D one counts its fills, which is how the
 * page test knows the display was drawn rather than merely asked for.
 */
export function makeCanvas(width = 1280, height = 800) {
  const canvas = { width, height, clientWidth: width, clientHeight: height };
  const glStub = makeGlStub();
  glStub.canvas = canvas;
  const ctx2d = {
    canvas,
    fills: 0,
    imageSmoothingEnabled: false,
    fillStyle: '#000',
    fillRect() { ctx2d.fills++; },
    clearRect() {},
    putImageData() {},
    drawImage() {},
    save() {}, restore() {}, beginPath() {}, closePath() {}, fill() {}, stroke() {},
    moveTo() {}, lineTo() {}, arc() {}, translate() {}, scale() {}, rotate() {},
  };
  canvas.glStub = glStub;
  canvas.ctx2d = ctx2d;
  canvas.getContext = (kind) => (kind === '2d' ? ctx2d : glStub);
  canvas.addEventListener = () => {};
  canvas.removeEventListener = () => {};
  canvas.focus = () => {};
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width, height });
  return canvas;
}
