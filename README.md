# WebTrack

### ▶ [Play it](https://markclausing.github.io/webtrack/)

A polygon racing game in the browser, in the spirit of the first generation of
them: eight single seaters, a standing start, and about three minutes between
the lights and the flag. You start eighth of eight. Ten kilometres of mountain
pass or sea front, a clock that only checkpoints will refill, and seven cars
that brake later than you do until you learn where they brake.

Your time at the flag goes on a shared board.

No dependencies, no build step, no WebGL — HTML, CSS and JavaScript exactly as
the browser receives them, and a polygon renderer written by hand into a
`Uint32Array` at 320 × 224. It is the fifth game built this way, after
[websoccer](https://github.com/markclausing/websoccer),
[webtennis](https://github.com/markclausing/webtennis),
[webracing](https://github.com/markclausing/webracing) and
[webtype](https://github.com/markclausing/webtype).

![Three cars into a mountain corner at three hundred and twenty](docs/screenshots/corner.png)

## Running it yourself

```bash
git clone https://github.com/markclausing/webtrack.git
cd webtrack && npm start
```

Then open http://localhost:8080/. There is no `npm install`, because there is
nothing to install.

## Controls

|                   | Keys      |
| ----------------- | --------- |
| Accelerate        | `W`       |
| Brake             | `S`       |
| Steer             | `A` / `D` |
| Pause             | `Esc`     |

Every key can be changed in the menu. Gamepads need no setting up: the stick
steers and any face button is the throttle.

On a phone, hold it sideways. The bottom-left corner is the wheel, `GAS` is the
big button, `BRAKE` is the small one beside it, and the little `II` at the top
pauses.

![The grid, five lights on, and seven cars in front of you](docs/screenshots/grid.png)

## How it drives

**Grip is one number and you are always spending it.** A corner of curvature *k*
asks for *v²k* of sideways acceleration. If the car has that much it goes where
it is pointed and whatever is left over is what the steering has to work with; if
it does not, the difference goes two ways at once — outwards, as the car running
wide, and backwards, as speed scrubbed off the tyres. That is the entire driving
model. It is four lines in `sim.js` and everything that feels like driving comes
out of it.

The consequence you feel first is that at the limit **the wheel stops
answering**. That is not the corner being unfair, it is the corner telling you to
brake earlier. The consequence you feel later is that lifting in the middle of
one gives you the front end back.

**Brake in a straight line, then turn.** The brakes are worth four and a half g
and the corner is worth three. You can have all of one or all of the other, and
asking for both at once gets you neither and a lot of grass.

**Sit behind somebody on the straight.** The tow removes nearly half your drag
and is worth about twenty km/h. It reaches forty metres and needs you roughly
behind them, which is what makes the last third of a straight interesting instead
of a formality.

**The kerbs are yours; the grass is not.** Two wheels on the red and white costs
you very little. Four wheels on the green costs three quarters of your grip.

![Wheel to wheel out of a slow corner](docs/screenshots/battle.png)

**The other seven are the race; the clock is not.** Seventy seconds at the lights
and forty more under every gantry. It is there so that a race which has gone
wrong ends, not to be raced against. Where you finish is the game — your time is
just what the board keeps.

**They are given slightly less grip and slightly less top end than you, and
nothing else.** No rubber band, no catching you up when you crash, no pulling
away when you do not. A rival that cheated would be one you could not learn, and
learning where they brake is the only way to get past seven of them in three
minutes.

## Two circuits, and a third that is both

**The pass** is ten kilometres of mountain: three kinds of corner, all of them
third gear or lower, and long enough between them to use what you gained.
**The boulevard** is the sea front, flat and quick, four corners that matter and
a great deal of full throttle. **The grand run** is one after the other without
stopping, twenty-one kilometres, and the only time worth having.

![The sea front at three hundred and forty](docs/screenshots/coast.png)

## The look

Everything you can see is polygons standing in the world — no sprites, no
billboards, no textures anywhere. Go round a bend and the palm tree turns,
because it is actually there.

The renderer is about five hundred lines and does not use the GPU. It transforms,
clips, projects and fills every triangle by hand into a `Uint32Array` at 320 ×
224, which is what a Mega Drive put on a television, and blows the result up to
fit the window with the smoothing turned off. That is not the slow way round:
five thousand flat triangles over seventy-one thousand pixels is about two
milliseconds, which leaves fourteen of the sixteen a frame gets.

Doing it in software buys the one thing a modern pipeline will not give you,
which is the actual look:

- **Every colour is one of the 512 that machine could make** — three bits a
  channel, snapped on the way in. Two greens that were nearly the same stop being
  nearly the same, which is what flat shading wants anyway.
- **The track is chequered, not banded.** There is no grey between the two greys
  that palette has, so the lighter stripe is a one-pixel chequerboard of both,
  exactly the way the hardware faked a colour it did not have.
- **The sky is bands and the haze is one colour.** Everything distant fades to
  the colour the bottom of the sky is painted, so the horizon is a join you
  cannot see rather than a line.
- **There is no terrain model.** For every node of track in front of you the
  renderer walks outwards — tarmac, kerb, run-off, barrier, hillside, distance —
  and puts down a quad at each step. A mountain is the outermost of those a long
  way up; the sea is the outermost of them at zero.

### Where the speed comes from

Half of it is not speed. The car does 350 km/h, which is a number; the rest is
five things that cost nothing and are worth more than another fifty would be:

- **The lens opens with the throttle.** The focal length goes from 250 to 178
  between a standstill and flat out, so the world stops going past through the
  middle of the screen and starts going past at the edges. This is the single
  largest one.
- **The camera drops and closes in**, from two and a half metres above the
  tarmac to under two, and starts to shiver.
- **Marker posts every twenty-four metres, both sides, all the way round.** Two
  polygons each. At 350 they arrive eight times a second in your peripheral
  vision. Take them out and the car feels like it has lost fifty km/h.
- **Kerb stripes every six metres**, so there is something ticking past even on
  a straight with nothing beside it.
- **Streaks at the edges of the screen** over about 220 km/h. Not a real effect,
  and it does not need to be — it only agrees with the other four.

![Out of the valley on the mountain pass](docs/screenshots/pass.png)

## How it is put together

```
src/
  constants.js      every number the game is made of
  config.js         the one line that points at a score board
  highscores.js     ten times a list, merged rather than overwritten
  audio.js          a V10 out of four oscillators, and everything else
  main.js           menus, the loop, the wiring between them
  game/
    route.js        the circuit, built once from a seed
    sim.js          sixty ticks a second, and the only thing that writes
    state.js        what a race is, and how to read it
  render/
    raster.js       the polygon renderer: transform, clip, fill, blit
    models.js       the car, and everything that is a thing not the ground
    palette.js      colour
    renderer.js     the camera, the world, the head-up display
tools/              tests, screenshots, icons
server/board.js     the development score board
worker/             the same board, as a Cloudflare Worker
```

Four ideas hold it up.

**The player is a car and nothing else.** There is no code anywhere that says
"if this is the player": the same function drives, the same function works out
whether the corner is going to have it, and the same function decides that two
cars cannot be in the same place. What the player has that the others do not is a
six-bit input mask instead of a mind.

**Everything is measured along the track, not across the world.** A car is a
distance and an offset. Two cars are near each other when their distances are
close, which is one subtraction — and who is winning is whoever has the larger
one, which stays true through every corner for free.

**The circuit is built from a seed, once.** A time is worthless if the track was
different, and a track generated as you drive it cannot be learned, which is the
only thing that makes a time come down on the tenth attempt.

**The simulation never reads the clock.** It runs at a fixed sixtieth and the
loop runs it as many times as real time says it should have; a slow machine drops
frames, never ticks. A time on the board has to mean the same thing on every
machine that set it.

## The score board

Ten times per circuit per setting, sorted quickest first, kept in `localStorage`
so a browser on its own needs nothing. Point `src/config.js` at a Cloudflare
Worker and every page posts its board and reads everybody else's back; boards are
*merged* by row id rather than overwritten, so two devices and two browsers add up
instead of taking turns. `worker/README.md` is the two commands, plus the broom
for when somebody puts something on it you would rather they had not.

Only a race you finished goes on the board. A board of times cannot hold one that
stopped halfway — somebody who gave up after four hundred metres has a shorter
elapsed time than anybody who got to the flag.

## Tests

```bash
npm test
```

Three things, none of which need a browser:

- `tools/simtest.js` drives every circuit with a hand on the wheel that brakes
  for corners, and asks the questions a bug would answer wrongly: is anybody
  outside the barriers, did the field race, does the same seed still drive the
  same race — and the one that is about the game rather than the code, **is
  braking later still quicker**. A driving model in which it is not is broken
  however finite its numbers are, and nothing else here would notice.
- `tools/pagecheck.js` builds a document out of `index.html` — every id that is
  actually in the markup and nothing else — imports `main.js` against it, presses
  start, and drives four seconds of the real loop. An element the code asks for
  that the markup does not have comes back `null`, exactly as it would in a
  browser.
- `tools/sync-shared.js` checks the five files this game shares word for word
  with the other four have not drifted apart.

And when the question is what it looks like rather than whether it works:

```bash
node tools/screenshot.js pass 1500 6 3    # circuit, tick, how many, blow-up
node tools/screenshot.js docs             # the set in this README
```

The renderer needs three things from a browser and no more — an `ImageData`, a
canvas and a 2D context — so twenty lines of stubs run it under node and write
PNGs. Every picture above came out of that.

## Licence

MIT. See [LICENSE](LICENSE).
