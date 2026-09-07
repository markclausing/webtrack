# WebTrack

### ▶ [Play it](https://markclausing.github.io/webtrack/)

A polygon racing game in the browser, in the spirit of the first generation of
them. Twenty-seven closed circuits, eight single seaters, and an afternoon that
runs out: you start in daylight, the sun is on the horizon by the second lap and
you finish in the dark.

No dependencies, no build step, no WebGL — HTML, CSS and JavaScript exactly as
the browser receives them, and a polygon renderer written by hand into a
`Uint32Array` at 640 × 448.

![The last corner at Zandvoort, eighteen degrees of banking](docs/screenshots/banked.png)

*Zandvoort's last corner: eighteen degrees of dish, and the car leaning into it.*

## The circuits

**Twenty-four of them are places**, and between them they are the whole of the
2026 Formula One calendar.

**Sixteen came from a survey** — a centre line and a width, and nothing else. So
their height, their banking and everything beside the road was written by hand:
Eau Rouge twenty-nine metres below the start line and Les Combes sixty-seven
above it, Zandvoort's two dished corners at eighteen degrees, the derelict oval
alongside the Serraglio at Monza, the big wheel over Suzuka's infield.

**Eight were measured off OpenStreetMap**, and almost nothing about those was
decided here. The road is the road the map has. The height was sampled at every
point of the lap. Monaco's tunnel is where the tags say a tunnel is, its
buildings stand on their own footprints at their own heights, and its yachts lie
along Port Hercule's own piers. Monaco, Baku, Singapore, Losail and Las Vegas
come out within a per cent of their published lap length; Baku to the metre.

**Three were drawn by a random number generator** — a mountain pass, a coast
road and a long fast circuit — and they are still the best three to learn on.

[docs/CIRCUITS.md](docs/CIRCUITS.md) is where the measured ones came from and
what it cost to get them right.

![Inside the tunnel at Monaco, at 265 km/h](docs/screenshots/street.png)

*Monaco's tunnel. The roof is there because the map says a tunnel is.*

And the landmarks are where the landmarks are. On the Strip you pass the Palazzo
and the Venetian's campanile, Caesars, the Eiffel Tower of Paris Las Vegas and
the fountains, each one at the point of the lap its own coordinates put it at —
with the Strat two and a half kilometres north on the skyline and the south end
of the Strip away in the other direction.

![Down the Strip at night, past the Eiffel Tower](docs/screenshots/vegas.png)

*Las Vegas. The buildings either side are measured; what is invented is which
one of them is which.*

## Driving it

**The road is not one surface.** Tarmac, then a metre and a half of kerb, then
grass, then whatever is past that. A kerb costs almost nothing and rumbles under
the wheels — the ridges go past faster the quicker you are going. Putting a wheel
in the grass costs you 27 km/h in a second, two wheels more, and the grass stays
on the tyres for about three seconds after you rejoin. Running wide is a mistake
rather than a wider line.

**All of it is measured from the outside wheel**, not from the middle of the
car, so a wheel over the edge is a wheel over the edge.

**The tow is real.** Sitting in somebody's hole in the air is the only thing that
will drag you past them on a straight, and the only warning you get that it has
stopped working is the noise going quiet.

**Corners are banked and cambered** where the circuit is, and the car leans with
them. Chevron boards on the outside of every corner tell you which way it goes
and how hard, and no two of them ever contradict each other.

**And the ground is the ground.** Austin's turn one is thirty-three metres
straight up and blind over the top; Eau Rouge is twenty-nine metres below the
start line and Les Combes sixty-seven above it.

## Two ways out

**Qualifying** is one lap on an empty circuit, and there is a ghost on it with
you: your own best lap here, replaced by the quickest lap anybody has posted as
soon as it arrives. It is drawn as a stippled cyan silhouette you cannot hit, and
under the clock is the difference — where that lap was at *this place*, in green
or red. It sets off level with you at every crossing, which is why the quick lap
is usually the second or the third.

**A grand prix** starts you eighth of eight against seven cars in the same
machinery, over three laps, with a clock that runs out unless you reach the next
gantry. They defend, they take a line, and they leave you a gap only if you have
earned it.

Whichever you drive, the time goes on a board shared with everybody else who
plays it.

**And the afternoon runs out** whichever you drive. You start in daylight and
finish under the floodlights, and the four circuits that are run at night — Las
Vegas, Jeddah, Singapore, Losail — are dark from the flag.

![A ghost lap at the bottom of Eau Rouge](docs/screenshots/ghost.png)

*The ghost a tenth up the road at Spa, and the climb out of Eau Rouge ahead.*

## Controls

|            | Keys      |
| ---------- | --------- |
| Accelerate | `↑`       |
| Brake      | `↓`       |
| Steer      | `←` / `→` |
| Pause      | `Esc`     |

Every key can be changed in the menu and W A S D is a preset. Gamepads need no
setting up: the stick steers and any face button is the throttle.

On a phone the controls come up on their own: the wheel bottom-left, `GAS` and
`BRAKE` bottom-right, and the pause under the picture. Standing up they fall
entirely clear of the road; sideways they sit in the letterbox bars either side
of it, which is what `npm run test:touch` checks on seven handsets.

<img src="docs/screenshots/mobile.jpg" alt="The touch controls on a phone" width="320">

## Running it yourself

```bash
git clone https://github.com/markclausing/webtrack.git
cd webtrack && npm start
```

Then open http://localhost:8080/. There is no `npm install`, because there is
nothing to install.

`npm test` drives the whole thing headlessly: races to the flag on every
circuit, checks that nothing is standing on the road, that every recorded lap
survives being written down and read back, and that the game asks for the sounds
it says it does. [worker/README.md](worker/README.md) has the two commands that
put the shared board live.

## Elsewhere

The fifth game built this way, after
[websoccer](https://github.com/markclausing/websoccer),
[webtennis](https://github.com/markclausing/webtennis),
[webracing](https://github.com/markclausing/webracing) and
[webtype](https://github.com/markclausing/webtype).

Circuit geometry for the twenty-four real ones is derived from OpenStreetMap and
carries **ODbL 1.0** — see [docs/CIRCUITS.md](docs/CIRCUITS.md). Everything else
is MIT; see [LICENSE](LICENSE).
