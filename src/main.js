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
 * it has to be. Behind the menu the simulation is already running, with the
 * autopilot riding it, which is the oldest trick a coin-op ever pulled and still
 * the best argument for pressing start.
 */

import { Sound } from './audio.js';
import { boardFor } from './config.js';
import { BTN, TIERS } from './constants.js';
import { Highscores, makeId, NAME_LENGTH, placeOf } from './highscores.js';
import {
  ACTIONS, InputDevices, keyLabel, loadBindings, PRESETS, saveBindings,
} from './input.js';
import { NameEntry } from './nameEntry.js';
import { Renderer } from './render/renderer.js';
import { finalTicks, formatTime, makeState, player, ROUTES } from './game/state.js';
import { step } from './game/sim.js';
import { isTouchDevice, TouchControls } from './touch.js';

const TICK_MS = 1000 / 60;

const canvas = document.getElementById('screen');
const renderer = new Renderer(canvas);
const sound = new Sound();
const highscores = new Highscores();

// Its own key, like the score board: the other four games are on this domain
// and one key would mean rebinding here silently rebinding a game of football.
const bindings = loadBindings('webtrack.bindings.v1');
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

let route = 'pass';
let tier = 'normal';

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

  if (game.playing && !game.paused) {
    game.acc += dt;
    while (game.acc >= TICK_MS) {
      game.acc -= TICK_MS;
      step(game.state, input.mask(0));
      drain(game.state);
      if (game.state.over || game.state.finished) {
        finish(game.state);
        break;
      }
    }
    sound.update(game.state);
    renderer.draw(game.state);
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

/** Whatever the simulation said happened, said out loud. */
function drain(state) {
  for (const event of state.events) sound.play(event);
}

/**
 * The rider on the menu screen.
 *
 * Not an opponent and not a replay: the same simulation with a very stupid hand
 * on the bars. It holds the throttle open, aims for the middle of the road and
 * swings at anything that comes alongside, which is enough to look like somebody
 * playing badly - and looking like somebody playing badly is the point of an
 * attract screen.
 */
function autopilot(state) {
  const p = player(state);
  let mask = BTN.UP;
  const want = 0;
  if (p.x > want + 1.2) mask |= BTN.LEFT;
  if (p.x < want - 1.2) mask |= BTN.RIGHT;
  // A car in the way is worth more than the middle of the road.
  for (const c of state.cars) {
    const gap = c.s - p.s;
    if (gap < 4 || gap > 70) continue;
    if (Math.abs(c.x - p.x) > 3) continue;
    mask &= ~(BTN.LEFT | BTN.RIGHT);
    mask |= c.x > p.x ? BTN.LEFT : BTN.RIGHT;
  }
  if ((state.tick % 47) === 0) mask |= BTN.FIRE;
  return mask;
}

function attract() {
  const state = makeState({ route, tier, seed: (Math.random() * 1e9) | 0 });
  // Started a little way in and with the clock wound up, so the menu is never
  // showing the same forty metres of road and never runs out of time behind a
  // panel nobody is looking at.
  player(state).s = Math.random() * (state.route.metres * 0.7);
  player(state).speed = 45;
  state.clock = 9999;
  return state;
}

// --- Starting and stopping ----------------------------------------------------

function startRun() {
  sound.wake();
  game.state = makeState({ route, tier, seed: (Date.now() & 0x7fffffff) });
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
  document.getElementById('overTitle').textContent = done ? 'YOU MADE IT'
    : state.reason === 'busted' ? 'BUSTED' : 'OUT OF TIME';
  const knocked = state.knocks.rival + state.knocks.gang + state.knocks.cop;
  document.getElementById('overText').textContent = done
    ? `${formatTime(finalTicks(state))} - ${formatTime(state.elapsed)} on the road, `
      + `less ${state.bonus} seconds for the ${knocked} you put down.`
    : state.reason === 'busted'
      ? `They had you on the ground with a patrol car alongside, ${(p.s / 1000).toFixed(1)} `
        + `kilometres in. There is no bail in this game.`
      : `The clock went at ${(p.s / 1000).toFixed(1)} kilometres. `
        + `Checkpoints are the only thing that puts seconds back.`;
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

pick('route', (value) => {
  route = value;
  document.getElementById('routeBlurb').textContent = ROUTES[route].blurb;
  renderScores(route, tier);
  game.demo = attract();
});
pick('skill', (value) => {
  tier = value;
  renderSkill();
  renderScores(route, tier);
});
pick('sound', (value) => sound.enable(value === 'on'));
pick('talk', (value) => sound.voice(value === 'on'));

function renderSkill() {
  const cfg = TIERS[tier];
  document.getElementById('skillBlurb').textContent
    = `Clock ${Math.round(cfg.clock * 100)}%, their punches ${Math.round(cfg.damage * 100)}%, `
    + `and ${cfg.foes < 1 ? 'fewer' : cfg.foes > 1 ? 'more' : 'the usual number of'} `
    + 'people looking for you. Each setting keeps its own list.';
}

// --- The score board ----------------------------------------------------------

const pending = { open: false, entry: null, route: 'pass', tier: 'normal' };

const nameEntry = new NameEntry(document.getElementById('hiscoreLetters'), (name) => {
  try {
    globalThis.localStorage?.setItem('webtrack.name', name);
  } catch { /* private mode */ }
  const place = highscores.add(pending.route, pending.tier, { ...pending.entry, name });
  pending.open = false;
  hiscoreBox.classList.add('hidden');
  renderScores(pending.route, pending.tier, place);
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
 * Only a finished run counts.
 *
 * A board of times cannot hold a run that stopped halfway, because there is no
 * number to compare: somebody who gave up after four hundred metres has a
 * shorter elapsed time than anybody who finished. So the board is the finishers'
 * board, and everything else goes on the result card and nowhere else.
 */
function offerRecord(state) {
  if (pending.open) return true;
  if (!state.finished) return false;

  const entry = {
    id: makeId(),
    name: lastName(),
    time: finalTicks(state),
    down: state.knocks.rival + state.knocks.gang + state.knocks.cop,
    metres: Math.round(state.route.metres),
    at: Date.now(),
  };
  if (!highscores.qualifies(route, tier, entry)) return false;

  pending.entry = entry;
  pending.route = route;
  pending.tier = tier;
  pending.open = true;
  document.getElementById('hiscoreLine').textContent
    = `${formatTime(entry.time)}: number `
    + `${placeOf(highscores.table(route, tier), entry)} `
    + `of the ${boardName(route, tier)} board`;
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
    renderScores(route, tier);
    return true;
  } catch {
    return false;
  }
}

function boardName(r, t) {
  return `${ROUTES[r].label} ${t.toUpperCase()}`;
}

function renderScores(r, t, freshPlace = 0) {
  const body = document.getElementById('scoresBody');
  document.getElementById('scoresLevel').textContent = boardName(r, t);
  body.innerHTML = '';
  const rows = highscores.table(r, t);
  for (let i = 0; i < rows.length; i++) {
    const tr = document.createElement('tr');
    if (i + 1 === freshPlace) tr.className = 'fresh';
    for (const [cls, text] of [
      ['place', `${i + 1}`],
      ['name', rows[i].name],
      ['result', formatTime(rows[i].time)],
      // Labelled rather than bare. A column of "4"s next to a column of times is
      // a column nobody can read without being told what it is.
      ['stage', `${rows[i].down} DOWN`],
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
    ? 'Your time from the line to the end of the road, less the seconds everybody '
      + 'you put down was worth. Only a finished run goes on the board, and each '
      + 'route and setting keeps its own.'
    : 'Nothing here yet. Get to the end of this road on this setting and the list '
      + 'is yours.';
}

// --- Changing the keys ---------------------------------------------------------
//
// The same arrangement as the other four games, on the same shared input module.
// The labels are this game's own, because "kick or slide" means something else
// here and "pod" means nothing at all.

const KEY_LABELS = {
  up: 'Throttle',
  down: 'Brake',
  left: 'Lean left',
  right: 'Lean right',
  fire: 'Punch / club',
  switch: 'Kick',
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
    saveBindings(bindings, 'webtrack.bindings.v1');
    renderKeys();
  };
}

window.addEventListener('keydown', (e) => {
  if (!binding) return;
  e.preventDefault();
  if (e.code !== 'Escape') {
    bindings[0][binding] = e.code;
    input.setBindings(bindings);
    saveBindings(bindings, 'webtrack.bindings.v1');
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
renderSkill();
renderKeys();
renderScores(route, tier);
syncScores();
game.demo = attract();
game.last = performance.now();
requestAnimationFrame(frame);
requestAnimationFrame(pickerFrame);
