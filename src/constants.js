/**
 * Every number the game is made of, in one place.
 *
 * Metres and seconds throughout, converted to km/h only on the way to the
 * screen. The simulation runs at a fixed sixty ticks a second and never reads
 * the clock, so a slow machine plays the same race as a fast one - it just
 * draws fewer of the frames.
 *
 * The bike is a big twin, not a superbike, and the numbers say so: it takes a
 * long time to get going, it does not want to change direction, and once it is
 * moving it does not want to stop. That is the whole character of the thing, and
 * most of what makes hitting somebody at a hundred and eighty feel like
 * something happened.
 */

export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;

/** The five bits an input mask is made of. Same set as the other four games. */
export const BTN = { UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8, FIRE: 16, SWITCH: 32 };

// --- The road ----------------------------------------------------------------

/** Distance between two road nodes. Everything about the world is built on it. */
export const SEG = 6;
/** Half the tarmac, in metres. Eighteen metres across is a boulevard, not a lane. */
export const ROAD_HALF = 9;
/** How far past the tarmac you can still ride before it turns into scenery. */
export const VERGE = 3.2;
/** The painted rumble strip, which is the first metre and a bit of that. */
export const RUMBLE = 1.4;
/** Nodes drawn ahead of the camera. Past this the world is fog. */
export const DRAW_AHEAD = 150;
/** And behind, so the road does not vanish out of the mirror on a crest. */
export const DRAW_BEHIND = 6;

// --- The bike ----------------------------------------------------------------

export const TOP_SPEED = 74;        // m/s on tarmac, flat, throttle pinned
export const ACCEL = 11.5;          // m/s^2 at a standstill, tailing off with speed
export const BRAKE = 26;
export const DRAG = 0.00042;        // quadratic, and what actually sets the top speed
export const ROLL_DRAG = 1.1;       // linear, so a coasting bike comes to rest
export const GRAVITY = 9.81;
/** How much of the slope you feel. Full gravity on a 1-in-8 climb is too cruel. */
export const SLOPE_PULL = 0.55;

/** Sideways metres per second at full lock, and how quickly the bike gets there. */
export const STEER_SPEED = 15.5;
export const STEER_RATE = 5.2;
/** A bike at walking pace does not lean. Steering scales in over this speed. */
export const STEER_FLOOR = 6;

/** Off the tarmac: dirt and sand hold you back and the bars fight you. */
export const OFFROAD_DRAG = 0.62;
export const OFFROAD_TOP = 0.45;

// --- Fighting ----------------------------------------------------------------

export const HEALTH = 100;
/** How far to the side an arm reaches, and how far up and down the road. */
export const REACH_SIDE = 5.4;
export const REACH_LONG = 7.5;

/** Ticks between swings, per attack. A kick leaves you open for longer. */
export const SWING_COOL = 26;
export const KICK_COOL = 44;
/** Ticks the arm is actually out. The hit lands on the first of them. */
export const SWING_TIME = 12;
export const KICK_TIME = 18;

export const DMG_FIST = 11;
export const DMG_CLUB = 23;
export const DMG_KICK = 17;
/** A kick shoves; a club rattles. Metres per second of sideways push. */
export const SHOVE_FIST = 3.5;
export const SHOVE_CLUB = 5;
export const SHOVE_KICK = 11;

/** A rider who has taken this much of a wobble is going down. */
export const WOBBLE_MAX = 100;
export const WOBBLE_RECOVER = 34;   // per second, once nobody is hitting you
/** Ticks on the floor before you are back on the bike. The real cost of a crash. */
export const DOWN_TIME = 150;
export const PLAYER_DOWN_TIME = 120;
/** How fast you are going when you get back on. Not from a standstill: the real
 * cost of going down is the two seconds and the speed you had, not a minute of
 * winding a big twin back up to two hundred from nothing. */
export const REMOUNT_SPEED = 22;

/** Clubs are not bought, they are taken. Ticks one lies in the road. */
export const DROP_LIFE = 420;

// --- Traffic, rivals and the law ---------------------------------------------

/** Civilian traffic, going your way, at a speed that makes it an obstacle. */
export const TRAFFIC_MIN = 22;
export const TRAFFIC_MAX = 34;
/** Hitting the back of a car. Most of your speed and a good deal of your skin. */
export const CRASH_DMG = 26;

export const RIVAL_SPEED = 62;
export const GANG_SPEED = 64;
export const COP_SPEED = 70;

/**
 * How hard the law looks at you, 0 to 1. Fighting raises it; behaving lowers it.
 *
 * A landed punch is worth a good deal less than putting somebody on the tarmac,
 * because a punch at two hundred kilometres an hour is something a witness might
 * have seen and a body sliding down the road is not in doubt. The cooling rate
 * is the number that matters most: at this setting a clean minute takes you from
 * the helicopter back to nothing, which is short enough that behaving is a real
 * option and long enough that it costs you the fight you were winning.
 */
export const HEAT_PER_HIT = 0.026;
export const HEAT_PER_DOWN = 0.16;
export const HEAT_PER_COP = 0.3;
export const HEAT_COOL = 0.013;     // per second
/** Above this a patrol is sent after you, and above the second, a helicopter. */
export const HEAT_PATROL = 0.24;
export const HEAT_CHOPPER = 0.5;

// --- The clock ---------------------------------------------------------------

/**
 * Seconds on the clock at the start, and what a checkpoint gives you back.
 *
 * A checkpoint every thirteen hundred metres worth forty-eight seconds means the
 * clock is asking for a hundred kilometres an hour on average, against a bike
 * that will do two hundred and thirty. That gap is the whole design of the
 * thing: it is enough slack to stop and have a fight, and not enough to have
 * three.
 */
export const START_TIME = 75;
export const CHECKPOINT_TIME = 48;
/** Checkpoints, in nodes. One every thirteen hundred metres or so. */
export const CHECKPOINT_EVERY = 220;

/** Seconds knocked off your final time for putting somebody down. */
export const BONUS_RIVAL = 3;
export const BONUS_GANG = 4;
export const BONUS_COP = 8;

/** What the three settings change. Easy is a longer clock and a softer world. */
export const TIERS = {
  easy: { clock: 1.35, damage: 0.7, foes: 0.75, label: 'Easy' },
  normal: { clock: 1, damage: 1, foes: 1, label: 'Normal' },
  hard: { clock: 0.82, damage: 1.3, foes: 1.35, label: 'Hard' },
};

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
export const SCREEN_W = 320;
export const SCREEN_H = 224;
/** Field of view, as the focal length of a screen this wide. */
export const FOCAL = 235;
/** Nothing nearer than this is drawn, because the maths stops working at zero. */
export const NEAR = 0.6;

/** Where the camera sits relative to the bike: behind it and above it. */
export const CAM_BACK = 8.2;
export const CAM_HIGH = 3.1;
export const CAM_AHEAD = 24;        // what it looks at, up the road
/** How lazily the camera follows. Low enough to swing, high enough to keep up. */
export const CAM_LAG = 0.13;
