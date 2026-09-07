// The sounds that say what is under the wheels, checked without a speaker.
//
//   node tools/soundtest.js
//
// Sound is the one part of this game with no way to see whether it worked. A
// polygon in the wrong place is on the screen; a gain that is never raised, or
// raised on a note below what a laptop reproduces, is indistinguishable from
// working perfectly - and both of those had happened before anybody said "I
// cannot hear the kerbs".
//
// So this stands a recording AudioContext up in place of the real one and asks
// what the game *asked for*: which gains it raised, when, and how far. It cannot
// tell you the kerb sounds like a kerb. It can tell you the game tried.

import { Sound } from '../src/audio.js';
import { driveLine, makeRace, step } from '../src/game/sim.js';
import { nodeAt, player } from '../src/game/state.js';

let failures = 0;
const ok = (what, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? '  ok  ' : ' FAIL '} ${what}`);
};

// --- An audio graph that only remembers ---------------------------------------

class Param {
  constructor() { this.value = 0; }

  setTargetAtTime(v) { this.value = v; }

  setValueAtTime(v) { this.value = v; }

  linearRampToValueAtTime(v) { this.value = v; }

  cancelScheduledValues() {}
}

const node = () => ({
  gain: new Param(),
  frequency: new Param(),
  Q: new Param(),
  detune: new Param(),
  type: '',
  buffer: null,
  loop: false,
  connect(next) { return next; },
  start() {},
  stop() {},
  getChannelData() { return new Float32Array(8); },
});

globalThis.AudioContext = class {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 8;
    this.state = 'running';
    this.destination = node();
  }

  createGain() { return node(); }

  createBiquadFilter() { return node(); }

  createOscillator() { return node(); }

  createBufferSource() { return node(); }

  createBuffer() { return node(); }

  resume() {}
};

// --- Driving over things ------------------------------------------------------

const sound = new Sound();
sound.start();
ok('the engine starts and the surface voices are built with it',
  sound.running && !!sound.nodes.kerbGain && !!sound.nodes.grassGain);

const state = makeRace({ route: 'monza', mode: 'qual', tier: 'normal', seed: 7 });
for (let t = 0; t < 1500; t++) {
  step(state, driveLine(state, 0.95));
  state.clock = 999;
}
const p = player(state);

/**
 * A second held that far past the edge of the road, and what it asked for.
 *
 * The width is read again every tick rather than once at the start: Monza is
 * between five and eight metres either side depending on where you are, so a
 * position measured against the width at one corner is somewhere else entirely
 * by the next.
 */
function held(over) {
  for (let t = 0; t < 60; t++) {
    const here = state.route.nodes[nodeAt(state.route, p.s).i];
    if (over !== null) p.x = here.half + over;
    step(state, driveLine(state, 0.95));
    state.clock = 999;
    sound.update(state);
  }
  return {
    surf: p.surf,
    kerb: sound.nodes.kerbGain.gain.value,
    swing: sound.nodes.shakeDepth.gain.value,
    rate: sound.nodes.shake.frequency.value,
    cut: sound.nodes.kerbBand.frequency.value,
    grass: sound.nodes.grassGain.gain.value,
    speed: p.speed,
  };
}

const road = held(-2);
ok(`on the road both are silent (kerb ${road.kerb.toFixed(3)}, grass ${road.grass.toFixed(3)})`,
  road.surf === 'road' && road.kerb === 0 && road.grass === 0);

const kerb = held(-0.5);
ok(`a wheel on the kerb is heard (${kerb.kerb.toFixed(3)}) and is not the grass `
  + `(${kerb.grass.toFixed(3)})`,
kerb.surf === 'kerb' && kerb.kerb > 0.02 && kerb.grass < 0.005);

// Loud enough to be there and quiet enough to sit under the engine, which runs
// at 0.26 and has four oscillators in it.
ok(`and it is under the engine without being inaudible (${kerb.kerb.toFixed(3)} plus `
  + `${kerb.swing.toFixed(3)} of swing)`,
kerb.kerb < 0.2 && kerb.swing > 0.02);

/**
 * The filter is what makes this survive a laptop.
 *
 * The first version of this was a triangle wave at sixty-two hertz, which is
 * below what a small speaker reproduces at all: the sound was in the graph, at
 * the right volume, and silent. Noise through a filter is broadband, so
 * whatever the speaker can do, some of it comes out.
 */
ok(`the kerb is noise through a filter at ${Math.round(kerb.cut)}Hz rather than a `
  + 'note below what a speaker can make', kerb.cut > 200);

const grass = held(1.5);
// Faded rather than switched: both levels ease towards what the surface asks
// for, so the one you have just left is small rather than nought. A step from
// full to silence in a single frame is a click, and a click is the one noise a
// speaker makes that nothing on a circuit does.
ok(`two wheels in the verge is heard (${grass.grass.toFixed(3)}) and is not the kerb `
  + `(${grass.kerb.toFixed(3)})`,
grass.surf === 'verge' && grass.grass > 0.03 && grass.kerb < 0.005);
ok(`and it is under the engine too (${grass.grass.toFixed(3)})`, grass.grass < 0.2);

// The ridges go past faster the quicker you are going, which is the whole of
// what makes a kerb a kerb rather than a note.
{
  const fast = held(-0.5);
  const wasRate = fast.rate;
  for (let t = 0; t < 120; t++) {
    p.x = state.route.nodes[nodeAt(state.route, p.s).i].half - 0.5;
    p.speed = 12;
    step(state, driveLine(state, 0));
    state.clock = 999;
    sound.update(state);
  }
  const slow = sound.nodes.shake.frequency.value;
  ok(`the ridges go past at ${Math.round(wasRate)} a second at `
    + `${Math.round(fast.speed * 3.6)} km/h and ${Math.round(slow)} at 43`, wasRate > slow + 20);
}

console.log(failures ? `\n${failures} failed` : '\nall good');
process.exit(failures ? 1 : 0);
