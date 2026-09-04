// Where the on-screen controls land on a real phone, in both orientations.
//
//   node tools/touchtest.js
//
// The picture is letterboxed to ten by seven and a phone is not ten by seven, so
// on every device there is dead space, and where the dead space falls decides
// whether the controls sit on the road or beside it. That is a question of
// arithmetic between the canvas size and about eight numbers in the stylesheet,
// and it is worth asking here rather than by holding a phone: nobody notices
// that a thumb covers the speed readout until they are trying to read the speed.
//
// The numbers are read out of styles.css rather than copied, so this follows the
// stylesheet instead of drifting away from it.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCREEN_H, SCREEN_W } from '../src/constants.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

let failures = 0;
function ok(what, passed) {
  if (!passed) failures++;
  console.log(`  ${passed ? 'ok  ' : 'FAIL'} ${what}`);
}

/**
 * The first `prop: <n>px` inside the block for `selector`.
 *
 * Anchored to the start of a line, because a selector also appears at the end of
 * the list that turns pointer events on for all of them - `#knob, #btnPause {` -
 * and that block has no width in it.
 */
function px(selector, prop) {
  const block = css.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([^}]*)\\}`));
  if (!block) throw new Error(`no rule for ${selector}`);
  const found = block[1].match(new RegExp(`${prop}:[^;]*?(\\d+)px`));
  if (!found) throw new Error(`no ${prop} in ${selector}`);
  return Number(found[1]);
}

const size = {
  stickW: px('#stick', 'width'),
  stickH: px('#stick', 'height'),
  gas: px('#btnFire', 'width'),
  brake: px('#btnPod', 'width'),
  brakeLift: px('#btnPod', 'margin-bottom'),
  gap: px('#touchButtons', 'gap'),
  right: px('#touchButtons', 'right'),
  bottom: px('#touchButtons', 'bottom'),
  pauseW: px('#btnPause', 'width'),
  pauseH: px('#btnPause', 'height'),
};

/** Everything the page puts on the screen, in viewport pixels. */
function layout(vw, vh) {
  const portrait = vh > vw;
  const scale = Math.min(vw / SCREEN_W, vh / SCREEN_H);
  const cw = SCREEN_W * scale;
  const ch = SCREEN_H * scale;
  const cx = (vw - cw) / 2;
  // object-position: center top when standing up, centred when sideways.
  const cy = portrait ? 0 : (vh - ch) / 2;
  const picture = { x: cx, y: cy, w: cw, h: ch };

  const controls = {
    stick: { x: 0, y: vh - size.stickH, w: size.stickW, h: size.stickH },
    gas: {
      x: vw - size.right - size.gas, y: vh - size.bottom - size.gas,
      w: size.gas, h: size.gas,
    },
    brake: {
      x: vw - size.right - size.gas - size.gap - size.brake,
      y: vh - size.bottom - size.brakeLift - size.brake,
      w: size.brake, h: size.brake,
    },
    // Standing up: just under the picture, which is 70vw tall because it is the
    // full width of the window and ten by seven. Sideways: the top left corner,
    // which is the letterbox bar.
    pause: portrait
      ? { x: vw / 2 - size.pauseW / 2, y: vw * 0.7 + 16, w: size.pauseW, h: size.pauseH }
      : { x: 6, y: 6, w: size.pauseW, h: size.pauseH },
  };
  return { picture, controls, portrait, scale };
}

const overlap = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const DEVICES = [
  ['iPhone SE', 375, 667],
  ['iPhone 15', 393, 852],
  ['Pixel 7', 412, 915],
  ['iPad mini', 744, 1133],
];

/** Apple and Google both say this, and a brake is not a control to miss. */
const MIN_TARGET = 44;

console.log(`  the picture is ${SCREEN_W}x${SCREEN_H}; the stylesheet says stick `
  + `${size.stickW}x${size.stickH}, gas ${size.gas}, brake ${size.brake}\n`);

let worstLandscape = 0;
let worstPortrait = 0;
for (const [name, w, h] of DEVICES) {
  for (const [label, vw, vh] of [[`${name} upright`, w, h], [`${name} sideways`, h, w]]) {
    const { picture, controls, portrait } = layout(vw, vh);
    const covered = ['stick', 'gas', 'brake']
      .reduce((sum, k) => sum + overlap(controls[k], picture), 0) / (picture.w * picture.h);
    if (portrait) worstPortrait = Math.max(worstPortrait, covered);
    else worstLandscape = Math.max(worstLandscape, covered);

    // Nothing may sit on top of anything else it is not part of.
    const names = Object.keys(controls);
    const clashes = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        if (overlap(controls[names[i]], controls[names[j]]) > 0) {
          clashes.push(`${names[i]}/${names[j]}`);
        }
      }
    }
    // Everything has to be on the screen, whole.
    const offscreen = names.filter((k) => {
      const c = controls[k];
      return c.x < 0 || c.y < 0 || c.x + c.w > vw || c.y + c.h > vh;
    });
    const share = (picture.w * picture.h) / (vw * vh);
    console.log(`  ${label.padEnd(20)} ${vw}x${vh}  picture ${(share * 100).toFixed(0)}% of the `
      + `screen, thumbs over ${(covered * 100).toFixed(0)}% of it`
      + `${clashes.length ? `  CLASH ${clashes.join(' ')}` : ''}`
      + `${offscreen.length ? `  OFF: ${offscreen}` : ''}`);
    if (clashes.length || offscreen.length) failures++;
  }
}

console.log('');
ok(`standing up the controls fall clear of the picture entirely `
  + `(worst ${(worstPortrait * 100).toFixed(0)}%)`, worstPortrait < 0.005);
ok(`sideways they mostly fall in the letterbox bars `
  + `(worst ${(worstLandscape * 100).toFixed(0)}%)`, worstLandscape < 0.12);
ok('every control is at least a 44px target',
  Math.min(size.stickW, size.stickH, size.gas, size.brake, size.pauseW, size.pauseH) >= MIN_TARGET);

// The stick is measured from the middle of its own box by touch.js, and the
// throw has to fit inside it or full lock is off the edge of the control.
const THROW = Number(/MAX_THROW = (\d+)/.exec(readFileSync(path.join(ROOT, 'src/touch.js'), 'utf8'))[1]);
ok(`full lock (${THROW}px) is inside the stick box`,
  size.stickW / 2 > THROW && size.stickH / 2 > THROW);

// And the one that started this: the head-up display keeps its corners.
{
  const { picture, controls } = layout(852, 393);
  const clock = {
    x: picture.x + picture.w / 2 - 40, y: picture.y + 2, w: 80, h: 30,
  };
  ok('sideways, the pause button is not sitting on the lap clock',
    overlap(controls.pause, clock) === 0);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
