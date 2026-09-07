/**
 * Sound, out of oscillators. There are no samples in this repository.
 *
 * The engine is the only difficult one and it is worth the trouble, because in a
 * car like this the engine is the rev counter - you know when to change up long
 * before you can spare the tenth of a second it takes to look at a number. It is
 * built the way the noise is actually made: a stack of detuned sawtooths at the
 * firing frequency, a resonant band that sweeps up with the revs and gives it the
 * shriek, and a second oscillator an octave up mixed in at the top of the range
 * so the last two thousand revs sound like they cost something.
 *
 * The important part is what happens at a gear change. The note drops by the
 * ratio, the gain ducks for four frames, and it comes back in lower. That
 * half-tenth of silence is the whole difference between an engine and a siren,
 * and it is four lines.
 *
 * Everything else is a short burst of something: filtered noise for a lock-up,
 * a tone that slides for a spin, a square wave for the lights.
 *
 * The voice is not built here at all. speech.js is one of the five files shared
 * word for word with the other four games and knows nothing about any of them;
 * this hands it an audio context and a vocabulary and it says what it is told.
 */

import { LINES, WORDS } from './commentary.js';
import { gearAt, TOP_SPEED } from './constants.js';
import { Speech } from './speech.js';

export class Sound {
  constructor() {
    this.ctx = null;
    this.on = true;
    // The voice is off unless it is asked for. It says four things and it says
    // them well, and it is still the first thing anybody turns off.
    this.talk = false;
    this.running = false;
    this.nodes = null;
    this.speech = null;
    this.gear = 1;
    this.squeal = 0;
    this.kerb = 0;
    this.grass = 0;
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
      // The synthesiser reaches for a longer buffer under a name of its own.
      // Same noise; a second of it is plenty for both.
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

  /** Fires it up and leaves it running until the race ends. */
  start() {
    if (!this.on || this.running) return;
    const ctx = this.wake();
    if (!ctx) return;
    const now = ctx.currentTime;

    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.master);

    // The shriek: a resonant band that climbs with the revs. Without the Q this
    // is a lawnmower; with it, it is a ten cylinder engine.
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 700;
    filter.Q.value = 5.5;
    const body = ctx.createBiquadFilter();
    body.type = 'lowpass';
    body.frequency.value = 4200;
    filter.connect(body).connect(out);
    // A little of the raw stack goes past the band, or the low end vanishes.
    const bypass = ctx.createGain();
    bypass.gain.value = 0.35;
    bypass.connect(out);

    const oscs = [];
    for (const [type, detune, level] of [
      ['sawtooth', 0, 0.34], ['sawtooth', 8, 0.3], ['sawtooth', -11, 0.3], ['square', 4, 0.14],
    ]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = 200;
      osc.detune.value = detune;
      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain);
      gain.connect(filter);
      gain.connect(bypass);
      osc.start(now);
      oscs.push(osc);
    }
    // An octave up, mixed in only at the top of a gear.
    const top = ctx.createOscillator();
    top.type = 'sawtooth';
    top.frequency.value = 400;
    const topGain = ctx.createGain();
    topGain.gain.value = 0;
    top.connect(topGain).connect(filter);
    top.start(now);

    // The tyres, for when they have had enough.
    const squeal = ctx.createOscillator();
    squeal.type = 'sawtooth';
    squeal.frequency.value = 1150;
    const squealBand = ctx.createBiquadFilter();
    squealBand.type = 'bandpass';
    squealBand.frequency.value = 1600;
    squealBand.Q.value = 9;
    const squealGain = ctx.createGain();
    squealGain.gain.value = 0;
    squeal.connect(squealBand).connect(squealGain).connect(this.master);
    squeal.start(now);

    /**
     * What is under the wheels, which is two sounds and not one.
     *
     * A kerb is a row of ridges: a low note switched on and off as they go past,
     * so the rate follows the speed rather than the note doing it. Under about
     * fifty km/h it is a knock and at three hundred it is a buzz, which is what
     * a kerb does.
     *
     * Grass is not ridges, it is noise - a loop of it through a band, low and
     * wide. Both are kept well under the engine: they are meant to tell you where
     * the car is, not to be the loudest thing on the circuit.
     */
    const ridges = ctx.createOscillator();
    ridges.type = 'triangle';
    ridges.frequency.value = 62;
    const kerbGain = ctx.createGain();
    kerbGain.gain.value = 0;
    const shake = ctx.createOscillator();
    shake.type = 'square';
    shake.frequency.value = 12;
    const shakeDepth = ctx.createGain();
    shakeDepth.gain.value = 0;
    shake.connect(shakeDepth).connect(kerbGain.gain);
    ridges.connect(kerbGain).connect(this.master);
    ridges.start(now);
    shake.start(now);

    // A second of white noise, looped. Made once and left running, because
    // starting a source costs more than turning one down.
    const seconds = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const grains = seconds.getChannelData(0);
    for (let i = 0; i < grains.length; i++) grains[i] = Math.random() * 2 - 1;
    const hiss = ctx.createBufferSource();
    hiss.buffer = seconds;
    hiss.loop = true;
    const gravelBand = ctx.createBiquadFilter();
    gravelBand.type = 'bandpass';
    gravelBand.frequency.value = 1100;
    gravelBand.Q.value = 0.7;
    const grassGain = ctx.createGain();
    grassGain.gain.value = 0;
    hiss.connect(gravelBand).connect(grassGain).connect(this.master);
    hiss.start(now);

    out.gain.linearRampToValueAtTime(0.26, now + 0.3);
    this.nodes = {
      out, filter, body, oscs, top, topGain, squeal, squealGain,
      ridges, kerbGain, shake, shakeDepth, hiss, gravelBand, grassGain,
    };
    this.running = true;
    this.gear = 1;
  }

  stop() {
    if (!this.nodes) return;
    const { out, oscs, top, squeal, squealGain, ridges, shake, hiss, kerbGain, grassGain }
      = this.nodes;
    const now = this.ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(0, now + 0.25);
    squealGain.gain.setTargetAtTime(0, now, 0.05);
    kerbGain.gain.setTargetAtTime(0, now, 0.05);
    grassGain.gain.setTargetAtTime(0, now, 0.05);
    for (const node of [...oscs, top, squeal, ridges, shake, hiss]) node.stop(now + 0.32);
    this.nodes = null;
    this.running = false;
  }

  /**
   * The engine and the tyres, once a frame.
   *
   * `rev` comes out of the gearbox in constants.js, which exists for this and
   * for the dial and for nothing else. The note follows it rather than the
   * speed, so the pitch sweeps up seven times over a lap and drops six.
   */
  update(state) {
    if (!this.nodes || !this.on) return;
    const p = state.cars[0];
    const speed = Math.max(0, p.speed);
    const { gear, rev } = gearAt(speed);
    const now = this.ctx.currentTime;
    const set = (param, value, time = 0.035) => param.setTargetAtTime(value, now, time);

    // On the grid the engine is not idling, it is being held against the
    // limiter, which is the noise everybody in the crowd is waiting for.
    const held = state.lights > 0;
    const load = held ? 0.72 + Math.sin(state.tick * 0.6) * 0.22 : 0.22 + rev * 0.78;

    const base = 118 + load * 340;
    for (const osc of this.nodes.oscs) set(osc.frequency, base);
    set(this.nodes.top.frequency, base * 2);
    set(this.nodes.topGain.gain, Math.max(0, load - 0.5) * 0.22);
    set(this.nodes.filter.frequency, 520 + load * 2600);
    set(this.nodes.body.frequency, 2200 + load * 4200);

    // The change up: the note has already dropped, so all that is missing is the
    // moment of nothing that tells you it happened.
    if (gear !== this.gear) {
      const drop = gear > this.gear;
      this.gear = gear;
      const out = this.nodes.out.gain;
      out.cancelScheduledValues(now);
      out.setValueAtTime(drop ? 0.06 : 0.2, now);
      out.linearRampToValueAtTime(0.26, now + 0.09);
    }

    /**
     * What is under the wheels.
     *
     * `surf` is worked out by the simulation from the outside wheel rather than
     * from the middle of the car, so this is the same answer the grip is using -
     * which it has to be, or the car slows down for something you cannot hear.
     * It used to be `Math.abs(p.x) > 8.5`, a number that is the edge of the road
     * at exactly none of the twenty-seven circuits.
     */
    const surf = p.surf || 'road';
    const off = p.outside || 0;
    const rough = surf === 'verge' || surf === 'rough';
    // Nothing at a walking pace: a kerb you are creeping over does not rumble.
    const rolling = Math.min(1, speed / 22);

    // The kerb. The ridges go past faster the quicker you are going, which is
    // the whole of what makes it a kerb and not a note.
    const onKerb = surf === 'kerb' ? Math.max(0.4, off) * rolling : 0;
    this.kerb += (onKerb - this.kerb) * 0.35;
    set(this.nodes.kerbGain.gain, this.kerb * 0.05, 0.02);
    set(this.nodes.shakeDepth.gain, this.kerb * 0.05, 0.02);
    set(this.nodes.shake.frequency, 7 + speed * 0.42, 0.02);

    // The grass, and gravel beyond it: wider and lower the further out you are.
    const onGrass = rough ? Math.max(0.45, off) * rolling : 0;
    this.grass += (onGrass - this.grass) * 0.25;
    set(this.nodes.grassGain.gain, this.grass * 0.075, 0.03);
    set(this.nodes.gravelBand.frequency, surf === 'rough' ? 620 : 1150, 0.05);

    // Tyres. Sliding squeals; the grass has its own voice now, so this is only
    // ever the tyres letting go.
    const want = p.spinT > 0 ? 0.3 : Math.min(0.26, p.slide * 0.03);
    this.squeal += (want - this.squeal) * 0.2;
    set(this.nodes.squealGain.gain, this.squeal, 0.03);
    set(this.nodes.squeal.frequency, 900 + Math.min(700, p.slide * 40), 0.05);

    // Quieter with a nose full of somebody else's exhaust, which is not physics
    // but is the only cue the tow gets other than the speedometer.
    set(this.nodes.out.gain, 0.26 * (1 - p.tow * 0.12) * (speed > 2 ? 1 : 0.5), 0.08);
  }

  /** Whatever the simulation just said happened. */
  play(event) {
    if (!this.on || !this.wake()) return;
    switch (event.t) {
      case 'light':
        this.blip(440, 0.16, 'square', 0.24);
        break;
      case 'green':
        this.blip(880, 0.4, 'square', 0.3);
        this.say('green');
        break;
      case 'touch':
        this.burst(0.1, 2600, event.mine ? 0.4 : 0.2);
        this.blip(220, 0.07, 'square', event.mine ? 0.2 : 0.1);
        break;
      case 'wall':
        this.burst(0.28, 1300, event.mine ? 0.5 : 0.24);
        this.blip(110, 0.2, 'square', event.mine ? 0.3 : 0.14);
        break;
      case 'spin':
        this.burst(0.7, 1800, event.mine ? 0.42 : 0.2);
        this.sweep(900, 220, 0.8, event.mine ? 0.22 : 0.1);
        break;
      case 'check':
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.blip(520 + i * 260, 0.12, 'square', 0.22), i * 110);
        }
        this.say('check');
        break;
      case 'finish':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => this.blip(440 + i * 165, 0.16, 'square', 0.24), i * 130);
        }
        this.say(event.place === 1 ? 'won' : 'finish');
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
}

/** One second of white noise, made once and looped by everything that needs it. */
function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
