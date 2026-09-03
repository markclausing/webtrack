/**
 * Sound, out of oscillators. There are no samples in this repository.
 *
 * The engine is the only difficult one and it is worth the trouble, because on
 * a bike the engine is the speedometer - you know what a hundred and eighty
 * sounds like long before you can spare the half second it takes to read the
 * number. It is built the way the real thing works: a big twin fires twice and
 * then waits, which is why a Harley lopes instead of hums. Two detuned sawtooths
 * give the metal, a low-pass that opens with the throttle gives the effort, and
 * an amplitude wobble at the firing rate gives the lope. Take the wobble out and
 * it is a lawnmower.
 *
 * Everything else is a short burst of something: filtered noise for a fist, a
 * longer one with a pitch drop for the crash, two square waves alternating for
 * the siren.
 *
 * The voice is not built here at all. speech.js is one of the five files shared
 * word for word with the other four games and knows nothing about any of them;
 * this hands it an audio context and a vocabulary and it says what it is told.
 */

import { LINES, WORDS } from './commentary.js';
import { Speech } from './speech.js';

export class Sound {
  constructor() {
    this.ctx = null;
    this.on = true;
    this.talk = true;
    this.running = false;
    this.nodes = null;
    this.sirenUntil = 0;
    this.speech = null;
  }

  /**
   * A browser will not make a sound until somebody has clicked something, so
   * this is called from the first press rather than at load. Called again later
   * it does nothing, which is what makes it safe to call from everywhere.
   */
  wake() {
    if (!this.on) return null;
    if (!this.ctx) {
      const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.noise = makeNoise(this.ctx);
      // The synthesiser reaches for a longer buffer than the impacts do, under
      // a name of its own. Same noise; a second of it is plenty for both.
      this.longNoise = this.noise;
      this.speech = new Speech(this, { WORDS, LINES });
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  enable(on) {
    this.on = on;
    if (!on) this.stop();
    if (this.master) this.master.gain.value = on ? 0.5 : 0;
  }

  voice(on) {
    this.talk = on;
  }

  /**
   * Says something, if there is anything to say and anybody to say it.
   *
   * Rate limited to one line at a time on purpose: two of these overlapping is
   * not two things being said, it is a noise.
   */
  say(event) {
    if (!this.on || !this.talk || !this.wake() || !this.speech) return;
    const now = this.ctx.currentTime;
    if (now < (this.talkUntil || 0)) return;
    this.talkUntil = now + 1.1;
    this.speech.say(event);
  }

  /** Fires up the engine and leaves it running until the run ends. */
  start() {
    if (!this.on || this.running) return;
    const ctx = this.wake();
    if (!ctx) return;
    const now = ctx.currentTime;

    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 3;
    filter.connect(out);

    // The lope. A gain that dips between firings, at the same rate as the
    // cylinders, which is what makes it a twin rather than a tone.
    const chug = ctx.createGain();
    chug.gain.value = 0.6;
    chug.connect(filter);
    const lfo = ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.value = 12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.45;
    lfo.connect(lfoGain).connect(chug.gain);
    lfo.start(now);

    const a = ctx.createOscillator();
    a.type = 'sawtooth';
    a.frequency.value = 60;
    const b = ctx.createOscillator();
    b.type = 'square';
    b.frequency.value = 60.9;
    const mixA = ctx.createGain();
    mixA.gain.value = 0.5;
    const mixB = ctx.createGain();
    mixB.gain.value = 0.22;
    a.connect(mixA).connect(chug);
    b.connect(mixB).connect(chug);
    a.start(now);
    b.start(now);

    out.gain.linearRampToValueAtTime(0.3, now + 0.4);
    this.nodes = { out, filter, a, b, lfo };
    this.running = true;
  }

  stop() {
    if (!this.nodes) return;
    const { out, a, b, lfo } = this.nodes;
    const now = this.ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(0, now + 0.25);
    for (const node of [a, b, lfo]) node.stop(now + 0.3);
    this.nodes = null;
    this.running = false;
  }

  /**
   * The engine, once a frame.
   *
   * Speed drives the pitch and the filter together, and the gearing is faked the
   * way a game of this shape has to fake it: the note climbs, drops back and
   * climbs again every so many km/h, so that accelerating sounds like getting
   * somewhere rather than like a siren winding up.
   */
  update(state) {
    if (!this.nodes || !this.on) return;
    const p = state.riders[0];
    const speed = Math.max(0, p.speed);
    const gear = Math.min(5, Math.floor(speed / 15));
    const within = (speed - gear * 15) / 15;
    const rev = 0.25 + within * 0.75;
    const now = this.ctx.currentTime;
    const base = 46 + rev * 74;

    const set = (param, value) => {
      param.setTargetAtTime(value, now, 0.04);
    };
    set(this.nodes.a.frequency, base);
    set(this.nodes.b.frequency, base * 1.012);
    set(this.nodes.filter.frequency, 260 + rev * 1500 + speed * 12);
    set(this.nodes.lfo.frequency, 7 + rev * 26);
    // Off the tarmac the note goes rough and quiet, which is the fastest way to
    // tell somebody they are in the gravel without putting a word on the screen.
    const rough = Math.abs(p.x) > 9 ? 0.72 : 1;
    set(this.nodes.out.gain, (p.down ? 0.06 : 0.3) * rough);
  }

  /** Whatever the simulation just said happened. */
  play(event) {
    if (!this.on || !this.wake()) return;
    switch (event.t) {
      case 'swing':
        this.blip(event.kick ? 190 : 320, 0.06, 'triangle', 0.1);
        break;
      case 'hit': {
        // Louder when it landed on you, because it did.
        const metal = event.on === 'car';
        this.burst(metal ? 0.14 : 0.09, metal ? 900 : 1800, event.mine ? 0.52 : 0.3);
        this.blip(metal ? 90 : 150, 0.1, 'square', event.mine ? 0.24 : 0.14);
        break;
      }
      case 'clang':
        this.blip(880, 0.09, 'square', 0.14);
        break;
      case 'down':
        this.burst(0.55, 700, 0.42);
        this.sweep(320, 60, 0.5, 0.2);
        if (event.mine) this.say('down');
        break;
      case 'pickup':
        if (!event.mine) break;
        this.blip(660, 0.06, 'square', 0.2);
        setTimeout(() => this.blip(990, 0.08, 'square', 0.2), 60);
        break;
      case 'check':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.blip(520 + i * 260, 0.12, 'square', 0.22), i * 110);
        }
        this.say('check');
        break;
      case 'siren':
        this.siren();
        this.say('law');
        break;
      case 'remount':
        this.sweep(80, 260, 0.4, 0.16);
        break;
      case 'finish':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.blip(440 + i * 165, 0.16, 'square', 0.24), i * 130);
        }
        this.say('finish');
        break;
      case 'busted':
        this.sweep(420, 70, 1.1, 0.28);
        this.say('busted');
        break;
      case 'time':
        this.sweep(420, 70, 1.1, 0.28);
        this.say('over');
        break;
      default:
        break;
    }
  }

  /** A short tone. Most of the game's punctuation is one of these. */
  blip(freq, life, type, level) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + life);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + life + 0.02);
  }

  /** Filtered noise: everything that is an impact rather than a note. */
  burst(life, cut, level) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cut, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(90, cut * 0.2), now + life);
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + life);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(now);
    src.stop(now + life + 0.02);
  }

  sweep(from, to, life, level) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + life);
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + life);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + life + 0.02);
  }

  /** Two notes, four times, from behind. */
  siren() {
    const now = Date.now();
    if (now < this.sirenUntil) return;
    this.sirenUntil = now + 3000;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => this.blip(i % 2 ? 660 : 880, 0.24, 'square', 0.14), i * 260);
    }
  }
}

/** One second of white noise, made once and looped by everything that needs it. */
function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
