// Loads the page the way a browser would, without a browser.
//
//   node tools/pagecheck.js
//
// The simulation has its own test next door and the renderer can be looked at
// with tools/screenshot.js. What neither of them covers is the third of the code
// that only exists because there is a page: the menu wiring, the score panel,
// the key binding table, the loop. That third is where a typo costs you an
// element id and nothing tells you until you open it.
//
// So this builds a document out of index.html - every id and every data-
// attribute that is actually in the markup, and nothing else - and imports
// main.js against it. An element the code asks for that the markup does not have
// comes back null, exactly as it would in a browser, and the first thing done
// with it throws. Then it starts a run, drives a few hundred frames of the real
// loop with the throttle held open, and checks something was drawn.
//
// It is a smoke test and it is honest about that: it cannot tell you the game
// looks right. It can tell you the page still opens, which is the failure that
// costs the most time to find any other way.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let failures = 0;
const ok = (what, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${what}`);
};

// --- A document, from the markup -----------------------------------------------

const byId = new Map();
const byData = new Map();
const frames = [];

class El {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.textContent = '';
    this.value = '';
    this.type = '';
    this.open = false;
    this.width = 0;
    this.height = 0;
    this.listeners = new Map();
    this.classes = new Set();
    this.classList = {
      add: (...c) => c.forEach((x) => this.classes.add(x)),
      remove: (...c) => c.forEach((x) => this.classes.delete(x)),
      contains: (c) => this.classes.has(c),
      toggle: (c, on) => {
        const want = on === undefined ? !this.classes.has(c) : !!on;
        if (want) this.classes.add(c);
        else this.classes.delete(c);
        return want;
      },
    };
  }

  set className(value) {
    this.classes = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  get className() {
    return [...this.classes].join(' ');
  }

  set innerHTML(value) {
    if (!value) this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }

  removeEventListener() {}

  /** Fires the handlers this element actually registered, like a real click. */
  fire(type, event = {}) {
    for (const fn of this.listeners.get(type) || []) fn({ preventDefault() {}, stopPropagation() {}, currentTarget: this, target: this, ...event });
  }

  focus() {}

  blur() {}

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 100, height: 100 };
  }

  setPointerCapture() {}

  getContext() {
    const self = this;
    // The count is the point: it is the only evidence from out here that a
    // frame was actually finished rather than thrown away halfway through.
    return {
      canvas: self,
      imageSmoothingEnabled: false,
      putImageData() {},
      drawImage() { self.drawn = (self.drawn || 0) + 1; },
    };
  }
}

// Every id in the markup, and every data- attribute, so the menu buttons the
// code looks for are the menu buttons that are actually there.
for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) byId.set(id, new El('div', id));
for (const [tag] of html.matchAll(/<[a-z]+[^>]*\bdata-[a-z]+="[^"]*"[^>]*>/g)) {
  const el = new El('button');
  for (const [, name, value] of tag.matchAll(/data-([a-z]+)="([^"]*)"/g)) {
    el.dataset[name] = value;
    if (!byData.has(name)) byData.set(name, []);
    byData.get(name).push(el);
  }
}

class FakeImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

const doc = {
  createElement: (tag) => new El(tag),
  getElementById: (id) => byId.get(id) || null,
  querySelectorAll: (sel) => {
    const attr = /\[data-([a-z]+)\]/.exec(sel);
    if (attr) return byData.get(attr[1]) || [];
    const exact = /\[data-([a-z]+)="([^"]*)"\]/.exec(sel);
    if (exact) return (byData.get(exact[1]) || []).filter((e) => e.dataset[exact[1]] === exact[2]);
    return [];
  },
  querySelector: (sel) => doc.querySelectorAll(sel)[0] || null,
  addEventListener() {},
};

const store = new Map();
globalThis.ImageData = FakeImageData;
globalThis.document = doc;
globalThis.location = {
  hostname: 'localhost', host: 'localhost:8080', protocol: 'http:', search: '',
  origin: 'http://localhost:8080',
};
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};
globalThis.matchMedia = () => ({ matches: false });
globalThis.requestAnimationFrame = (fn) => frames.push(fn);
globalThis.fetch = async () => ({ ok: false });

const winListeners = new Map();
globalThis.window = {
  innerWidth: 1280,
  innerHeight: 720,
  addEventListener: (type, fn) => {
    if (!winListeners.has(type)) winListeners.set(type, []);
    winListeners.get(type).push(fn);
  },
  removeEventListener() {},
};

// --- Opening the page -------------------------------------------------------------

let loaded = true;
try {
  await import('../src/main.js');
} catch (err) {
  loaded = false;
  console.error(err);
}
ok('the page loads without throwing', loaded);
if (!loaded) process.exit(1);

ok('the menu is showing and the score table was filled in',
  !byId.get('menu').classes.has('hidden')
  && byId.get('scoresNote').textContent.length > 20);
ok('the controls table has a row for every action',
  byId.get('keysBody').children.length === 6);
ok('the route blurb says something about the circuit',
  byId.get('routeBlurb').textContent.includes('mountain'));

// --- Pressing start ----------------------------------------------------------------

/** One turn of the browser's animation loop: whatever asked for a frame gets one. */
function pump(times = 1) {
  for (let i = 0; i < times; i++) {
    const due = frames.splice(0, frames.length);
    for (const fn of due) fn(performance.now() + i * 16.7);
  }
}

pump(3);
ok('the attract loop is drawing behind the menu', frames.length > 0);

byId.get('start').fire('click');
ok('the menu goes away when the run starts', byId.get('menu').classes.has('hidden'));

// The throttle, held. The loop reads the keyboard through the shared input
// module, so this is the same path a key press takes. The lights are still on
// for the first three seconds of it, which is part of what is being checked.
for (const fn of winListeners.get('keydown') || []) fn({ code: 'KeyW', key: 'w', preventDefault() {} });

const screen = byId.get('screen');
const before = screen.drawn || 0;
const started = Date.now();
pump(240);
const drawn = (screen.drawn || 0) - before;
ok(`four seconds of the loop drew ${drawn} frames in ${Date.now() - started}ms`, drawn > 200);
ok('and the race is still going',
  byId.get('gameover').classes.has('hidden') && byId.get('menu').classes.has('hidden'));

// Escape pauses, and pressing it again does not leave the game in a state where
// the loop has quietly stopped.
for (const fn of winListeners.get('keydown') || []) fn({ key: 'Escape', code: 'Escape', preventDefault() {} });
ok('escape pauses', !byId.get('pause').classes.has('hidden'));
byId.get('resume').fire('click');
pump(10);
ok('and resume carries on', byId.get('pause').classes.has('hidden'));

byId.get('quit').fire('click');
pump(3);
ok('quitting goes back to the menu', !byId.get('menu').classes.has('hidden'));

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
