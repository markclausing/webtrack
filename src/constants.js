/**
 * Every number the game is made of, in one place.
 *
 * Metres and seconds throughout, converted to km/h only on the way to the
 * screen. The simulation runs at a fixed sixty ticks a second and never reads
 * the clock, so a slow machine drives the same race as a fast one - it just
 * draws fewer of the frames.
 *
 * The car is a ground-effect single seater and the numbers say so: it arrives at
 * a corner far faster than it can go round one, it stops harder than anything
 * else on the road, and everything it does depends on how much grip it has left
 * over after the corner has taken its share. That last idea is the whole game,
 * and it is four lines of arithmetic in sim.js - see GRIP.
 */

export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;

/** The six bits an input mask is made of. Same set as the other four games. */
export const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, FIRE: 16, SWITCH: 32 };

// --- The circuit -------------------------------------------------------------

/** Distance between two track nodes. Everything about the world is built on it. */
export const SEG = 6;
/** Half the tarmac, in metres. Fourteen across is a grand prix track. */
export const ROAD_HALF = 7;
/** How far past the tarmac you can still be before it is scenery. */
export const VERGE = 3.4;
/** The painted kerb, which is the first metre and a half of that. */
export const RUMBLE = 1.5;
/** Nodes drawn ahead of the camera. Past this the world is haze. */
export const DRAW_AHEAD = 165;
/** And behind, so the track does not vanish out of the mirror on a crest. */
export const DRAW_BEHIND = 6;

// --- The car -----------------------------------------------------------------

/**
 * The speed the car actually reaches, and the speed the engine is pulling for.
 *
 * They are two numbers because they are two things. DRIVE is where the
 * acceleration curve runs out; TOP_SPEED is where that curve meets the drag and
 * the car stops gaining, which is a hundred and ninety km/h lower than you would
 * guess and is why setting one number and hoping produced a car that would not
 * go over two hundred and ninety. TOP_SPEED is also what the camera, the rev
 * counter and the sound normalise against, so it has to be the speed you see.
 */
export const TOP_SPEED = 97;        // m/s on the straight: 350 km/h
export const DRIVE = 116;           // where the engine gives up pulling
export const ACCEL = 21;            // m/s^2 off the line, tailing off with speed
export const BRAKE = 44;            // about four and a half g, which is a wing car
export const DRAG = 0.00034;        // quadratic, and what actually sets the top speed
export const ROLL_DRAG = 1.4;       // linear, so a coasting car comes to rest
export const GRAVITY = 9.81;
/** How much of the gradient you feel. Full gravity on a climb is too cruel. */
export const SLOPE_PULL = 0.5;

/**
 * Lateral grip, in metres per second squared. The most important number here.
 *
 * A corner of curvature k asks for v squared times k of sideways acceleration to
 * get round it. Below this the car goes where it is pointed and whatever is left
 * over is available for steering; above it the car runs to the outside of the
 * corner and scrubs off speed doing it. That is the entire driving model, and
 * everything that feels like driving comes out of it: braking points, the way a
 * fast corner punishes an extra ten km/h far more than a slow one does, and why
 * lifting in the middle of one gives you the front end back.
 *
 * Thirty-two is a shade over three g, which is what a wing and slick tyres are
 * worth. Off the tarmac you get a fraction of it, which is why the grass ends
 * your corner rather than widening it.
 */
export const GRIP = 27;
export const GRIP_VERGE = 0.62;
export const GRIP_ROUGH = 0.24;
/** Speed scrubbed off per unit of grip you asked for and did not have. */
export const SCRUB = 0.34;

/** Sideways metres per second at full lock, and how quickly the car gets there. */
export const STEER_SPEED = 17;
export const STEER_RATE = 8.5;
/** A car at walking pace does not turn. Steering scales in over this speed. */
export const STEER_FLOOR = 5;

/** Rolling resistance off the tarmac: grass and gravel. */
export const OFFROAD_DRAG = 0.9;
export const OFFROAD_TOP = 0.42;

/**
 * The tow.
 *
 * Sitting in the hole another car punches in the air is worth this much of its
 * drag, and it is the largest single thing you can do about the car in front. It
 * reaches about forty metres and needs you roughly behind them, which is what
 * makes the last third of a straight interesting instead of a formality.
 */
export const TOW_RANGE = 42;
export const TOW_WIDTH = 3.4;
export const TOW_DRAG = 0.55;       // how much of your drag disappears, at best

// --- Contact -----------------------------------------------------------------

/** Car bodies, for the shoving: half a car wide and a car and a bit long. */
export const BODY_X = 1.9;
export const BODY_S = 4.6;
/**
 * Half the width of one, for the barrier.
 *
 * The barrier stops the car, and a car is not a point: clamping the centreline
 * to the rail leaves the outer wheels a metre past it, which anywhere else looks
 * like a car leaning on a barrier and on a bridge looks like a car parked in
 * mid-air over the water.
 */
export const CAR_HALF = 1.05;
/** Metres per second of shove when two cars touch, and what it costs the pair. */
export const NUDGE = 6.5;
export const NUDGE_COST = 0.965;
/** Closing speed above which contact is not contact but an accident. */
export const SPIN_AT = 26;
/** Ticks of a spin, and what is left of your speed at the end of one. */
export const SPIN_TIME = 105;
export const SPIN_KEEP = 0.12;

/**
 * The barrier, in metres from the centreline, and what is left of you after it.
 *
 * Eight metres of run-off between the kerb and it: enough that a corner you got
 * slightly wrong is a moment on the grass and a lost second, and not enough that
 * one you got properly wrong is anything other than over.
 *
 * The number that matters is the second one. At four tenths it was cheaper to
 * drive at the scenery than to brake - a lap driven flat out with the wheel held
 * against the barrier was five seconds quicker than a lap driven properly, which
 * is not a difficulty problem, it is the game telling you to do the wrong thing.
 * At a fifth, an accident costs you the next two corners.
 */
export const WALL_AT = 15;
export const WALL_KEEP = 0.2;

// --- The field ---------------------------------------------------------------

/**
 * The two ways to go out.
 *
 * Qualifying is you and an empty circuit and one number that matters: the
 * quickest single lap you managed. A grand prix is seven other cars over the
 * same number of laps, and one number that matters rather less than where you
 * finished.
 *
 * They are two games on one track and they want two boards, because a lap on
 * empty tarmac and a lap spent trying to get past somebody are not comparable
 * and never will be.
 */
export const MODES = {
  qual: { label: 'Qualifying', field: 1, clock: 1.5 },
  gp: { label: 'Grand Prix', field: 8, clock: 1 },
};

/** How many cars are in a grand prix, including you. */
export const FIELD = 8;
/** And how many laps each circuit is worth. The long one is worth fewer. */
export const LAPS = { pass: 3, coast: 3, grand: 2 };
/** Metres between rows on the grid, and how far off centre a grid slot sits. */
export const GRID_GAP = 11;
export const GRID_OFF = 2.6;
/** How long the lights hold before they go out. */
export const LIGHTS = 200;          // ticks

/**
 * What a rival will do, before the skill setting has its say.
 *
 * They are one, and they are one on purpose. A rival with ninety-four per cent
 * of your grip is a rival you drive past on the second corner and never see
 * again; a rival with ninety-eight is one a driver who knows the circuit still
 * walks away from. The same car as yours, driven properly, is the only setting
 * that makes the race about the driving - and it leaves the difficulty to be the
 * one thing it should be, which is how well they use it. That is `cfg.ai`, and
 * on hard they are given a few per cent more than you have.
 */
export const AI_TOP = 1.0;        // fraction of your top speed
export const AI_GRIP = 1.0;       // fraction of your grip, so you can out-brake them
/** How far ahead they look for the corner, in metres, when deciding to brake. */
export const AI_LOOK = 190;

/**
 * How much the field is spread out, end to end, by pace alone.
 *
 * Small, and that is what keeps them in touch. At four per cent the front row
 * was half a minute up the road by the flag and the race was two separate races;
 * at one per cent all eight are within a few seconds all afternoon and there is
 * always somebody to have a go at.
 */
export const AI_SPREAD = 0.0016;    // per grid slot

/**
 * How hard a rival will defend.
 *
 * A car with somebody close behind and genuinely coming past moves part of the
 * way across to cover the side they are on - part, so there is always a way
 * through, and never in a corner, where the line is worth more than the door.
 *
 * The range matters more than the strength. At twenty-six metres, in a field
 * this close, every car had somebody in its mirrors the whole race and the whole
 * field drove defensively for three laps: seven seconds a lap slower than the
 * same cars spread out. Fifteen metres is somebody who is actually there.
 */
export const AI_DEFEND = 0.55;      // how far across they will come
export const AI_MIRROR = 15;        // metres of mirror they look into

// --- The clock ---------------------------------------------------------------

/**
 * Seconds on the clock at the start, and what a checkpoint gives you back.
 *
 * A checkpoint every thirteen hundred metres worth forty seconds asks for about
 * a hundred and twenty kilometres an hour on average, against a car that will do
 * three hundred and fifty. That gap is deliberate: the clock is not the
 * opponent, the other seven cars are, and the clock is only there so that a race
 * which has gone wrong does not go on for ever.
 */
export const START_TIME = 70;
export const CHECKPOINT_TIME = 40;
/** Checkpoints, in nodes. One every thirteen hundred metres or so. */
export const CHECKPOINT_EVERY = 220;

/** What the three settings change. */
/**
 * What the three settings change.
 *
 * `ai` is the whole difficulty and is a multiplier on the rivals' grip and
 * power. On normal it is one: exactly the car you have, driven properly, which
 * is a good deal harder than it sounds and was worth three per cent extra only
 * while they were losing seven seconds a lap to each other. `grip` is your own,
 * and is the other half of the same dial from the other end.
 */
export const TIERS = {
  easy: { clock: 1.3, ai: 0.95, grip: 1.06, label: 'Easy' },
  normal: { clock: 1, ai: 1, grip: 1, label: 'Normal' },
  hard: { clock: 0.86, ai: 1.075, grip: 0.96, label: 'Hard' },
};

// --- The gearbox -------------------------------------------------------------

/**
 * Seven speeds, for the dial and the noise and nothing else.
 *
 * The car does not actually have a gearbox: the simulation has one number for
 * speed and no torque curve, and giving it one would be a day of work you could
 * not see. What you can hear is the note dropping every time the needle sweeps
 * round, and that is worth having, so the ratios exist to say which gear a given
 * speed is in and how far up the range it is.
 */
export const GEARS = [12, 23, 36, 50, 64, 80, 97];

/** Which gear a speed is in, from 1, and how far through it, from 0 to 1. */
export function gearAt(speed) {
  for (let i = 0; i < GEARS.length; i++) {
    if (speed < GEARS[i] || i === GEARS.length - 1) {
      const from = i === 0 ? 0 : GEARS[i - 1];
      const span = Math.max(1, GEARS[i] - from);
      return { gear: i + 1, rev: Math.max(0, Math.min(1, (speed - from) / span)) };
    }
  }
  return { gear: 1, rev: 0 };
}

// --- Drawing -----------------------------------------------------------------

/**
 * The screen, in pixels, before it is blown up to fit the window.
 *
 * Three hundred and twenty by two hundred and twenty-four is what a Mega Drive
 * put on a television, and it is not a stylistic flourish here: it is what makes
 * a polygon renderer written in JavaScript run at sixty frames a second on a
 * laptop. Every triangle is flat, every colour is one of the five hundred and
 * twelve that machine could make, and there is not a texture anywhere.
 */
/**
 * Four hundred by two hundred and eighty.
 *
 * A quarter more than the 320 x 224 a Mega Drive put on a television, in the
 * same ten by seven shape, and about the most that can be added without the
 * pixels stopping being pixels. It costs half again as many of them to fill -
 * a hundred and twelve thousand against seventy-two - which the software
 * rasteriser has the room for and the look has the tolerance for.
 */
export const SCREEN_W = 400;
export const SCREEN_H = 280;

/**
 * Field of view, as the focal length of a screen this wide.
 *
 * It moves with speed, and that is the largest single thing in this file for how
 * fast the game feels. Standing still the view is calm and long; flat out it is
 * pulled wide, so the kerbs go past at the edges of the screen rather than
 * through the middle of it. The eye reads that as velocity far more readily than
 * it reads a number changing in the corner.
 */
export const FOCAL = 312;
export const FOCAL_FAST = 222;
/** Nothing nearer than this is drawn, because the maths stops working at zero. */
export const NEAR = 0.55;

/** Where the camera sits relative to the car: behind it and above it. */
export const CAM_BACK = 8.6;
export const CAM_HIGH = 2.55;
export const CAM_AHEAD = 26;        // what it looks at, up the track
/** And where it goes flat out: lower, and closer in. */
export const CAM_BACK_FAST = 7.4;
export const CAM_HIGH_FAST = 1.95;
/** How lazily the camera follows. Low enough to swing, high enough to keep up. */
export const CAM_LAG = 0.16;
