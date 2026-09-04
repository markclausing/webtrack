/**
 * The page: menus, the loop, and the wiring between the two.
 *
 * Everything below is a shell round two calls. `step(state, mask)` advances the
 * world by exactly one sixtieth of a second, and `renderer.draw(state)` puts it
 * on the screen. The loop runs the first as many times as real time says it
 * should have run and the second once, which is what keeps a run on a slow
 * machine the same run as on a fast one - it drops frames, never ticks. A time
 * on the board has to mean the same thing on every machine that set it, and a
 * simulation that ran in variable steps would not manage that for ten seconds.
 *
 * The menu is HTML because a menu should be: it has text you can select, buttons
 * a screen reader can find, and a table of times. The game is a canvas because
 * it has to be. Behind the menu a race is already going on with nobody watching
 * it, which is the oldest trick a coin-op ever pulled and still the best
 * argument for pressing start.
 */

import { Sound } from './audio.js';
import { boardFor } from './config.js';
import { MODES, TIERS } from './constants.js';
import { Highscores, makeId, NAME_LENGTH, placeOf } from './highscores.js';
import {
  ACTIONS, InputDevices, keyLabel, loadBindings, PRESETS, saveBindings,
} from './input.js';
import { NameEntry } from './nameEntry.js';
import { Renderer } from './render/renderer.js';
import { finalTicks, formatTime, lapOf, ordinal, player, ROUTES } from './game/state.js';
import { driveLine, makeRace, step } from './game/sim.js';
import { isTouchDevice, TouchControls } from './touch.js';

const TICK_MS = 1000 / 60;

const canvas = document.getElementById('screen');
const renderer = new Renderer(canvas);
const sound = new Sound();
const highscores = new Highscores();

// Its own key, like the score board: the other four games are on this domain
// and one key would mean rebinding here silently rebinding a game of football.
const BINDINGS_KEY = 'webtrack.bindings.v1';

/**
 * What the keys do before anybody has said otherwise.
 *
 * The shared input module defaults its first slot to W A S D, which is right for
 * the four games that seat two people at one keyboard. This one seats one, and
 * one person driving one car reaches for the arrows. So an untouched browser
 * gets the arrow preset, and a browser that has been to the controls screen gets
 * whatever it chose - the check is for the stored bindings, not for their value,
 * or changing your mind back to W A S D would be overruled on the next visit.
 */
function firstBindings() {
  let saved = null;
  try {
    saved = globalThis.localStorage?.getItem(BINDINGS_KEY);
  } catch { /* private mode: there is nothing stored and nothing to read */ }
  const out = loadBindings(BINDINGS_KEY);
  if (!saved) out[0] = { ...PRESETS.find((p) => p.key === 'arrows').bindings };
  return out;
}

const bindings = firstBindings();
const input = new InputDevices(bindings);
input.attach(window);

const touch = new TouchControls();
touch.attach({
  root: document.getElementById('touch'),
  stick: document.getElementById('stick'),
  knob: document.getElementById('knob'),
  kick: document.getElementById('btnFire'),
  swap: document.getElementById('btnPod'),
});
input.touch = touch;

const menu = document.getElementById('menu');
const pauseBox = document.getElementById('pause');
const overBox = document.getElementById('gameover');
const hiscoreBox = document.getElementById('hiscore');

let mode = 'gp';
let route = 'pass';
let tier = 'normal';
let dusk = false;

const game = {
  state: null,
  playing: false,
  paused: false,
  acc: 0,
  last: 0,
  demo: null,
};

// --- The loop ----------------------------------------------------------------

/**
 * One animation frame: as many ticks as the clock owes, then one picture.
 *
 * The cap on the debt matters. A tab that was in the background for a minute
 * comes back owing three and a half thousand ticks, and running them would
 * freeze the page for a second and then kill you at a corner you never saw.
 * Time missed while nobody was looking is simply forgiven.
 */
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(250, now - game.last);
  game.last = now;

  let steps = 0;
  if (game.playing && !game.paused) {
    game.acc += dt;
    while (game.acc >= TICK_MS) {
      game.acc -= TICK_MS;
      steps++;
      step(game.state, input.mask(0));
      drain(game.state);
      if (game.state.over || game.state.finished) {
        finish(game.state);
        break;
      }
    }
    sound.update(game.state);
    renderer.draw(game.state);
    if (game.meter) meter(dt, steps);
    return;
  }

  // The menu is up, so the attract loop is riding.
  if (game.demo) {
    game.acc += dt;
    let ticks = 0;
    while (game.acc >= TICK_MS && ticks < 4) {
      game.acc -= TICK_MS;
      ticks++;
      step(game.demo, autopilot(game.demo));
      game.demo.events.length = 0;
      if (game.demo.over || game.demo.finished) game.demo = attract();
    }
    renderer.draw(game.demo, { chrome: false });
  }
}

/**
 * The frame meter, drawn straight onto the finished picture.
 *
 * Three numbers and one of them is the point. `ms` is how long the whole frame
 * took including everything the browser did with it; `x1` or `x2` is how many
 * simulation steps went into it. A steady x1 is a game running at speed. An x1
 * and x2 alternating is a game that has run out of frame, and it is the one
 * failure that looks like a fault in the road rather than a fault in the clock -
 * the car appears to shiver, and nothing about the car is wrong.
 */
const meterTimes = [];
function meter(dt, steps) {
  meterTimes.push(dt);
  if (meterTimes.length > 30) meterTimes.shift();
  const worst = Math.max(...meterTimes);
  const rt = renderer.rt;
  const bad = worst > 18;
  rt.panel(4, rt.h - 16, 116, 12, 0xff101018, bad ? 0xff4060ff : 0xff40a060);
  rt.text(`${dt.toFixed(1)}MS X${steps} ${rt.tris}T`, 8, rt.h - 13,
    bad ? 0xff4060ff : 0xffd0d8e0);
  renderer.show();
}

/** Whatever the simulation said happened, said out loud. */
function drain(state) {
  for (const event of state.events) sound.play(event);
}

/**
 * The car on the menu screen.
 *
 * Not an opponent and not a replay: the game's own reference driver, which is
 * the same braking arithmetic the rivals use, given a little less grip than it
 * has. It is not quick and is not supposed to be - an attract screen wants to
 * look like somebody playing, and somebody playing is somebody you can beat.
 */
const autopilot = (state) => driveLine(state, 0.88);

function attract() {
  // Always a grand prix behind the menu, whatever is selected in front of it: an
  // empty circuit is the correct thing to qualify on and the wrong thing to
  // watch.
  const state = makeRace({ route, mode: 'gp', tier, dusk, seed: (Math.random() * 1e9) | 0 });
  // Started a long way in, at speed, with the lights already out and the clock
  // wound up: the menu is never showing a standing start it will not finish, and
  // never the same forty metres of track twice.
  const at = Math.random() * state.route.metres + 200;
  for (const car of state.cars) {
    car.s += at;
    car.speed = 62;
    car.lap = Math.floor(car.s / state.route.metres);
  }
  state.lights = 0;
  state.clock = 9999;
  state.laps = 99;
  return state;
}

// --- Starting and stopping ----------------------------------------------------

function startRun() {
  sound.wake();
  game.state = makeRace({ route, mode, tier, dusk, seed: (Date.now() & 0x7fffffff) });
  game.playing = true;
  game.paused = false;
  game.acc = 0;
  game.demo = null;
  renderer.reset();
  menu.classList.add('hidden');
  overBox.classList.add('hidden');
  hiscoreBox.classList.add('hidden');
  touch.show(isTouchDevice());
  sound.start();
  canvas.focus();
}

function toMenu() {
  game.playing = false;
  game.paused = false;
  sound.stop();
  touch.show(false);
  menu.classList.remove('hidden');
  pauseBox.classList.add('hidden');
  renderer.reset();
  game.demo = attract();
}

/** The end of a run: the board first, and the result card if it declines. */
function finish(state) {
  game.playing = false;
  sound.stop();
  touch.show(false);
  if (offerRecord(state)) return;
  showResult(state);
}

function showResult(state) {
  const p = player(state);
  const done = state.finished;
  const title = document.getElementById('overTitle');
  const text = document.getElementById('overText');

  if (state.mode === 'qual') {
    title.textContent = p.best ? 'LAP SET' : 'NO TIME';
    text.textContent = p.best
      ? `${formatTime(p.best)}, best of ${lapOf(p)} laps.`
      : 'The clock went before a lap was finished. There is no time to show and '
        + 'nothing to beat.';
  } else {
    title.textContent = done
      ? (state.place === 1 ? 'WINNER' : `FINISHED ${ordinal(state.place)}`)
      : 'OUT OF TIME';
    text.textContent = done
      ? `${formatTime(finalTicks(state))} for ${state.laps} laps, ${ordinal(state.place)} `
        + `of ${state.field}, from ${ordinal(p.slot + 1)} on the grid. `
        + `Best lap ${formatTime(p.best)}.`
      : `The clock went on lap ${lapOf(p) + 1}, ${ordinal(state.place)} of `
        + `${state.field}. Checkpoints are the only thing that puts seconds back.`;
  }
  overBox.classList.remove('hidden');
}

document.getElementById('start').addEventListener('click', startRun);
document.getElementById('overBack').addEventListener('click', () => {
  overBox.classList.add('hidden');
  toMenu();
});
document.getElementById('resume').addEventListener('click', () => {
  game.paused = false;
  pauseBox.classList.add('hidden');
});
document.getElementById('quit').addEventListener('click', () => {
  overBox.classList.add('hidden');
  toMenu();
});
document.getElementById('btnPause').addEventListener('click', togglePause);

function togglePause() {
  if (!game.playing) return;
  game.paused = !game.paused;
  pauseBox.classList.toggle('hidden', !game.paused);
  if (game.paused) sound.stop();
  else sound.start();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && game.playing) {
    togglePause();
    e.preventDefault();
  }
  // F for frames: how long the last frame took, how many simulation steps went
  // into it, and how many triangles came out.
  //
  // It is here because of a question this could not otherwise answer. A car that
  // appears to shiver at speed is either the road, the model or the frame rate,
  // and the first two can be measured from a file while the third can only be
  // measured on the machine it is happening on: if a frame runs over sixteen and
  // a half milliseconds the loop puts two simulation steps into the next one,
  // and one-two-one-two reads exactly like a vibration.
  if (e.key === 'f' || e.key === 'F') {
    game.meter = !game.meter;
    e.preventDefault();
  }
});

// --- The menu -----------------------------------------------------------------

function pick(attr, onPick) {
  for (const button of document.querySelectorAll(`[data-${attr}]`)) {
    button.addEventListener('click', () => {
      for (const other of document.querySelectorAll(`[data-${attr}]`)) {
        other.classList.toggle('active', other === button);
      }
      onPick(button.dataset[attr]);
    });
  }
}

pick('mode', (value) => {
  mode = value;
  renderMode();
  renderScores(mode, route, tier);
});
pick('route', (value) => {
  route = value;
  document.getElementById('routeBlurb').textContent = ROUTES[route].blurb;
  renderScores(mode, route, tier);
  game.demo = attract();
});
pick('skill', (value) => {
  tier = value;
  renderSkill();
  renderScores(mode, route, tier);
});

function renderMode() {
  document.getElementById('modeBlurb').textContent = mode === 'qual'
    ? 'An empty circuit and a long clock. Three laps, and the quickest single one '
      + 'is what the board keeps. Nobody in the way and nobody to blame.'
    : 'Seven other cars and a standing start from the back row. They are within a '
      + 'per cent of each other and of you, they will shut the door, and the board '
      + 'keeps the whole race rather than your best lap.';
}
pick('dusk', (value) => {
  dusk = value === 'on';
  renderDusk();
  game.demo = attract();
});
pick('sound', (value) => sound.enable(value === 'on'));

function renderDusk() {
  document.getElementById('duskBlurb').textContent = dusk
    ? 'The race starts in the afternoon, has the sun on the horizon by the second '
      + 'lap and finishes in the dark. The floodlights come on at dusk.'
    : 'Daylight the whole way. A circuit you are learning is easier to learn in '
      + 'the light, and the board does not care either way.';
}
pick('talk', (value) => sound.voice(value === 'on'));

function renderSkill() {
  const cfg = TIERS[tier];
  document.getElementById('skillBlurb').textContent
    = `Clock ${Math.round(cfg.clock * 100)}%, your grip ${Math.round(cfg.grip * 100)}%, `
    + `and the others driving at ${Math.round(cfg.ai * 100)}% of what they can do. `
    + 'Each setting keeps its own list.';
}

// --- The score board ----------------------------------------------------------

const pending = { open: false, entry: null, mode: 'gp', route: 'pass', tier: 'normal' };

const nameEntry = new NameEntry(document.getElementById('hiscoreLetters'), (name) => {
  try {
    globalThis.localStorage?.setItem('webtrack.name', name);
  } catch { /* private mode */ }
  const place = highscores.add(pending.mode, pending.route, pending.tier,
    { ...pending.entry, name });
  pending.open = false;
  hiscoreBox.classList.add('hidden');
  renderScores(pending.mode, pending.route, pending.tier, place);
  document.getElementById('scoresBox').open = true;
  toMenu();
  syncScores();
});

window.addEventListener('keydown', (e) => {
  if (!pending.open) return;
  if (nameEntry.type(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

/**
 * The same picker, with something to press.
 *
 * The three letters are driven by the game's own stick and buttons, which is
 * right on a cabinet and on a keyboard and is nothing at all on a phone: those
 * controls live at the bottom of the screen, this panel is laid over the top of
 * them, and a tap lands on the panel. A run that had earned a time arrived at a
 * screen with no way off it.
 */
for (let slot = 0; slot < NAME_LENGTH; slot++) {
  for (const [row, by, label] of [
    ['hiscoreUp', -1, '▲'],
    ['hiscoreDown', 1, '▼'],
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      nameEntry.slot = slot;
      nameEntry.cycle(by);
      nameEntry.render();
      // Otherwise the button keeps focus and the next Space - which is the fist
      // on the default bindings - presses it again instead of confirming.
      button.blur();
    });
    document.getElementById(row).appendChild(button);
  }
}

document.getElementById('hiscoreLetters').addEventListener('click', (e) => {
  const at = [...e.currentTarget.children].indexOf(e.target);
  if (at < 0) return;
  nameEntry.slot = at;
  nameEntry.render();
});

document.getElementById('hiscoreOk').addEventListener('click', () => nameEntry.confirm());

/**
 * What counts, which is not the same thing in the two modes.
 *
 * A race has to have been finished: a board of race times cannot hold one that
 * stopped halfway, because somebody who gave up on lap one has a shorter elapsed
 * time than anybody who got to the flag. A qualifying lap only has to exist -
 * the session running out of time with two good laps behind you is a normal way
 * for qualifying to end, and the lap still counts.
 */
function offerRecord(state) {
  if (pending.open) return true;
  const p = player(state);
  const qual = state.mode === 'qual';
  if (qual ? !p.best : !state.finished) return false;

  const entry = {
    id: makeId(),
    name: lastName(),
    time: finalTicks(state),
    place: qual ? 1 : state.place,
    metres: Math.round(state.route.metres),
    at: Date.now(),
  };
  if (!highscores.qualifies(mode, route, tier, entry)) return false;

  pending.entry = entry;
  pending.mode = mode;
  pending.route = route;
  pending.tier = tier;
  pending.open = true;
  document.getElementById('hiscoreLine').textContent
    = `${formatTime(entry.time)}: number `
    + `${placeOf(highscores.table(mode, route, tier), entry)} `
    + `of the ${boardName(mode, route, tier)} board`;
  hiscoreBox.classList.remove('hidden');
  // Out of the way while the picker is up. They sit under this panel and cannot
  // be reached anyway, and a control showing through an overlay that swallows
  // every tap is worse than no control at all.
  touch.show(false);
  nameEntry.start(lastName());
  return true;
}

function lastName() {
  try {
    return globalThis.localStorage?.getItem('webtrack.name') || 'AAA';
  } catch {
    return 'AAA';
  }
}

async function syncScores() {
  const url = boardFor(location);
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ board: highscores.all() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.board) return false;
    highscores.absorb(data.board);
    renderScores(mode, route, tier);
    return true;
  } catch {
    return false;
  }
}

function boardName(m, r, t) {
  return `${MODES[m].label.toUpperCase()} ${ROUTES[r].label} ${t.toUpperCase()}`;
}

function renderScores(m, r, t, freshPlace = 0) {
  const body = document.getElementById('scoresBody');
  document.getElementById('scoresLevel').textContent = boardName(m, r, t);
  body.innerHTML = '';
  const rows = highscores.table(m, r, t);
  for (let i = 0; i < rows.length; i++) {
    const tr = document.createElement('tr');
    if (i + 1 === freshPlace) tr.className = 'fresh';
    for (const [cls, text] of [
      ['place', `${i + 1}`],
      ['name', rows[i].name],
      ['result', formatTime(rows[i].time)],
      // Labelled rather than bare. A column of "4"s next to a column of times is
      // a column nobody can read without being told what it is.
      // Where they finished, which qualifying does not have an answer to.
      ['stage', m === 'qual' || rows[i].place > 90 ? '\u2014' : ordinal(rows[i].place)],
      ['when', new Date(rows[i].at).toLocaleDateString()],
    ]) {
      const td = document.createElement('td');
      td.className = cls;
      td.textContent = text;
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  document.getElementById('scoresNote').textContent = rows.length
    ? (m === 'qual'
      ? 'The quickest single lap of the session. Each circuit and setting keeps its '
        + 'own list, and qualifying and the race keep separate ones.'
      : 'The whole race, from the lights to the flag, with where you finished beside '
        + 'it. Only a race you got to the end of goes on the board.')
    : 'Nothing here yet. Set a time on this circuit on this setting and the list is '
      + 'yours.';
}

// --- Changing the keys ---------------------------------------------------------
//
// The same arrangement as the other four games, on the same shared input module.
// The labels are this game's own, because "kick or slide" means something else
// here and "pod" means nothing at all.

const KEY_LABELS = {
  up: 'Accelerate',
  down: 'Brake',
  left: 'Steer left',
  right: 'Steer right',
  fire: 'Accelerate (2)',
  switch: 'Brake (2)',
};

let binding = null;

function renderKeys() {
  const body = document.getElementById('keysBody');
  body.innerHTML = '';
  for (const action of ACTIONS) {
    const tr = document.createElement('tr');
    const label = document.createElement('td');
    label.textContent = KEY_LABELS[action];
    tr.appendChild(label);
    const td = document.createElement('td');
    const button = document.createElement('button');
    button.className = 'keyBtn';
    button.textContent = keyLabel(bindings[0][action]);
    button.addEventListener('click', () => {
      binding = action;
      button.textContent = '...';
      document.getElementById('bindHint').textContent = `Press a key for ${KEY_LABELS[action]}.`;
    });
    td.appendChild(button);
    tr.appendChild(td);
    body.appendChild(tr);
  }

  const select = document.querySelector('[data-preset="0"]');
  select.innerHTML = '';
  for (const preset of PRESETS) {
    const option = document.createElement('option');
    option.value = preset.key;
    option.textContent = preset.label;
    select.appendChild(option);
  }
  select.onchange = () => {
    const preset = PRESETS.find((x) => x.key === select.value);
    if (!preset) return;
    bindings[0] = { ...preset.bindings };
    input.setBindings(bindings);
    saveBindings(bindings, BINDINGS_KEY);
    renderKeys();
  };
}

window.addEventListener('keydown', (e) => {
  if (!binding) return;
  e.preventDefault();
  if (e.code !== 'Escape') {
    bindings[0][binding] = e.code;
    input.setBindings(bindings);
    saveBindings(bindings, BINDINGS_KEY);
  }
  binding = null;
  document.getElementById('bindHint').textContent = 'Click a key to change it.';
  renderKeys();
}, true);

// --- The picker's own input -----------------------------------------------------
//
// The three letters read the stick directly rather than through the loop,
// because the loop is not running: the run that earned them is over.

function pickerFrame() {
  requestAnimationFrame(pickerFrame);
  if (!pending.open) return;
  if (!nameEntry.step(input.mask(0))) pending.open = false;
}

// --- Fitting the window ---------------------------------------------------------

function fit() {
  renderer.size(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
fit();

document.getElementById('routeBlurb').textContent = ROUTES[route].blurb;
renderMode();
renderDusk();
renderSkill();
renderKeys();
renderScores(mode, route, tier);
syncScores();
game.demo = attract();
game.last = performance.now();
requestAnimationFrame(frame);
requestAnimationFrame(pickerFrame);
