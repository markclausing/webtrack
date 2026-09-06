# Where the sixteen real circuits came from

Three of the twenty-seven circuits in this game were drawn by a random number
generator. Sixteen came from a survey, and eight were measured off
OpenStreetMap. The surveyed sixteen are: Spa-Francorchamps, Monza, Suzuka,
Zandvoort, Silverstone, Interlagos, the Red Bull Ring, Gilles Villeneuve,
Austin, Bahrain, Mexico City, the Hungaroring, Albert Park, Shanghai, Catalunya
and Yas Marina — which is every circuit the source survey has that is on the
2026 Formula One calendar.
This is where the shapes came from, what is ours, and what that obliges us to
say.

## The centre lines

`src/game/circuits.js` holds a surveyed centre line for each of the sixteen, at ten
metre spacing, in decimetres, delta encoded. They were produced by
`tools/import-circuit.js` from the [TUM racetrack
database](https://github.com/TUMFTM/racetrack-database), published by the
Institute of Automotive Technology at the Technical University of Munich.

That repository gives, per circuit, an `x_m, y_m` centre line and the width of
the tarmac to the left and right of it. Its own README says the centre lines
began as GPS traces from **OpenStreetMap** and the widths were measured from
satellite imagery.

Two licences therefore reach this game:

- The TUM repository is **LGPL-3.0**.
- The centre lines are derived from OpenStreetMap, which is **ODbL 1.0**. ODbL
  is a share-alike licence for *databases*: `src/game/circuits.js` is a derived
  database and carries the same terms, and OpenStreetMap and its contributors
  must be credited.

So: **circuit geometry © OpenStreetMap contributors, ODbL 1.0**, by way of
TUMFTM/racetrack-database, LGPL-3.0. The rest of this game is under the licence
in the README and is not affected by this; the obligation attaches to the
geometry, and the geometry is confined to one file so that stays true.

## What is not in the data, and is therefore ours

The survey is two coordinates and a width. Everything else about these sixteen
circuits was written by hand in `circuits.js`, and none of it is claimed to be
measured:

**Elevation.** The data is flat. A flat Spa is a diagram of Spa, so each circuit
has a height profile written as metres above its start line at fractions of a
lap, taken from what these places do rather than from a survey: Eau Rouge
twenty-nine metres below the line, Les Combes sixty-seven above it, ninety-eight
metres of spread. The Red Bull Ring gets sixty-three over four kilometres,
Interlagos forty-three with the start line at the top of it, Suzuka forty,
Zandvoort twenty-five, Silverstone fifteen, Monza nine, and Gilles Villeneuve
three, because it is an island.

They are authored, and they are much closer to the truth than nothing. One thing
learned by writing Zandvoort's profile twice: a *steady* gradient is invisible,
because the camera pitches to meet it. What makes a hill read is where it
changes, so spend the height on sharp local features rather than spreading it
evenly.

**Banking.** Zandvoort's two dished corners, Hugenholtz and the last one, at
eighteen degrees. Written down because a banked corner is taken faster, so it
changes the lap and not only the picture.

**Everything you can see.** Themes, trees, dunes, grandstands, the pit
buildings, the campsites, the wind turbines, the derelict oval alongside the
Serraglio at Monza and the wheel over the infield at Suzuka. Placed towards what
makes each circuit recognisable, invented in the detail.

**How much room there is beside the road.** Six metres of run-off past the kerb
everywhere except Gilles Villeneuve, which asks for two, because it is a road on
an island with concrete down both sides.

**The air, and the time of day.** Mexico City is two thousand two hundred metres
up, where there is about a fifth less of the first: less drag, so the highest top
speed here, and less of everything a wing is for, which a game with no downforce
model stands in for by taking a little grip away. Bahrain and Yas Marina set the
second for themselves - both are run in the evening, so they switch the sunset on
whatever the menu says.

Those three - the run-off, the air and the hour - are the only authored values in
this file that change how a circuit *drives* rather than how it looks.

**The viaduct.** Suzuka's crossover is *found* rather than authored - the
geometry says the circuit passes within a few metres of itself twice, two and a
half kilometres apart along the lap, and the height profile says which of them is
on top. What is built there is ours.

## Redoing it

```
git clone https://github.com/TUMFTM/racetrack-database
node tools/import-circuit.js racetrack-database/tracks
```

which prints the `LINES` table to standard output. Paste it into
`src/game/circuits.js`.

The importer reads sixteen of the twenty-five that database has: every one of
them that is on the 2026 Formula One calendar. The names this game gives them are
in `WANTED` at the top of the file. The nine it skips - Brands Hatch,
Hockenheim, the Nürburgring, Oschersleben, the Norisring, Moscow Raceway,
Sepang, Sochi and Indianapolis - are not on that calendar, which is the only
reason.

## The eight the survey does not have

The sixteen above came from a survey that gives a centre line and a width and
nothing else, so their height, their surroundings and everything else about them
was written by hand.

The eight circuits on the 2026 calendar that survey does not cover — Monaco,
Jeddah, Miami, Las Vegas, Singapore, Madrid, Baku and Losail — need a different
approach, and `tools/import-osm.js` is it. Rather than authoring what the survey
lacks, it measures it:

- **The road** comes from OpenStreetMap, `highway=raceway`.
- **The height** comes from an elevation service, sampled at every point of the
  lap and smoothed over sixty metres until it is a road rather than a terrain
  model.
- **The tunnels** come from OSM's own `tunnel=yes` tags, so Monaco's tunnel is
  where Monaco's tunnel is and nobody had to decide that.

Three things make it harder than it sounds, and the tool handles all three.

**A circuit is mapped three different ways.** A permanent one is a set of raceway
ways. Some are a route relation instead — Las Vegas and Madrid are. A street
circuit is neither: it is public road for fifty weeks of the year, so only the
parts that are never anything else carry the tag. Measured coverage:

```
losail    183%    miami      128%    jeddah     124%
madrid     67%    singapore   41%    monaco      31%    baku  15%
```

**So the gaps have to be driven.** Where the fragments do not meet, the importer
routes between them along the ordinary street graph, taking the fragments in the
order they sit around the loop rather than nearest-first — nearest-first sends
the route back on itself and put Monaco nineteen per cent over its true length.
In ring order it comes out at 107 per cent.

**And the elevation services rate limit.** Two are used, Open-Meteo first and
Open Topo Data as a fallback. They are not equivalent: Open-Meteo reports 41
metres across Monaco, which is right, and the SRTM behind the fallback reports
21, because thirty metre SRTM in a town that dense is looking at roofs.

**And the boats go where boats go.** Scattered at random inside the harbour
polygon they came out in the middle of the water and nowhere a boat would be. A
harbour is not a lake with boats in it: it is quays and pontoons with boats lying
alongside them, and OpenStreetMap has every one of those as `man_made=pier` -
forty-one of them at Monaco. One boat every twenty-two metres along each pier,
alternating sides, bow on. Eighty-one of them, and none of it decided here.

### Where this has got to

All eight are in the game, and all eight assemble into a lap that closes and
turns through two pi exactly once. Measured against their published length:

```
losail 100%   madrid 100%   monaco 100%   baku 101%   jeddah 104%
miami  118%   vegas   80%   singapore 74%
```

Five of those - Losail, Madrid, Monaco, Baku and Jeddah - contain no
straight-line jump anywhere in the lap and no stretch of road lying on top of
another. Losail needed nothing at all: the whole lap carries the map's own
raceway tag, so not a metre of it had to be driven along a public road.

### Choosing which ways are the circuit

There is no single rule, and three were written before that was admitted. The
named raceway ways are the whole lap at Monaco and two thirds of it at Losail,
where four more carry no name. A route relation is the whole lap at Madrid and,
at Las Vegas, a hundred and one ways that come apart into twenty-two fragments -
more than can be searched. Every version of this as one rule with conditions
attached broke one circuit to fix another.

So all three selections are assembled, and each is scored on the same
measurement the fragment orders are scored on: real length, turning through two
pi once, and no straight lines across the city. The best is kept. Two extra
assemblies of a few hundred milliseconds, and not one per-circuit rule.

Two things had to be right before a relation was worth reading. It was being
fetched and thrown away - membership was guessed at as "every raceway way in the
box", which misses the entire point of a route relation, which is that it names
the ordinary streets the lap runs on. And read properly it lists both
carriageways of a divided street, which chain end to end into an out-and-back:
Madrid came back at 199 per cent turning through four pi with 95 per cent of the
lap on top of itself. A way whose middle third already lies within fifteen
metres of one already kept is now dropped before anything is chained.

### Ordering the fragments

A street circuit arrives as fragments with gaps between them, and the order the
lap visits them in is not obvious. Three attempts:

**Nearest reachable next** is the obvious one and is wrong: two fragments can be
close together and still be visited a whole lap apart, so the route doubles
back. Monaco came out 19 per cent too long.

**Sorted by angle about the centre** is better - it is what "in order" means on a
loop - and is still a guess. On a circuit that wraps a harbour, climbs a hill and
comes back through a tunnel, the angular order of six fragments is not the order
a car drives them, and it left the lap turning through nought where a closed
circuit turns through two pi.

**Every order, priced.** Six fragments have 720 orders and each can be driven
either way about, and every one of those laps can be costed from a table of the
distance between each pair of fragment ends - twelve shortest-path searches, done
once. The cheapest closed lap wins. A greedy lap is handed to the search first so
that its bound has something to cut against from the start, which is what makes
eleven fragments affordable where eight was the ceiling.

The lap may also close before every fragment has been used. Tags can tell a pit
lane from a circuit and can do no more than that: Jeddah arrives as nine ways all
called حلبة كورنيش جدة and Miami as ten all named after the autodrome, and in
both cases that is half again as much road as the lap has. Since the order is
free, skipping a fragment is the same as closing before it is reached, so every
closed tour over every subset is already reachable from the same walk - and each
is scored on how near it comes to the real distance.

### Five faults that were in the way of that working

- the leg table was built without the no-reuse rule, so a connector was free to
  run the length of a fragment it had not reached yet, and did: five circuits
  came back with between 33 and 90 per cent of the lap on top of itself
- the legs were priced together and then driven independently, so with two
  fragments and only one possible order Las Vegas took the same road both ways
- a fragment that already closes on itself had no way to say so, which is the
  ordinary case for a permanent circuit
- a failed search was remembered as null, and the straight-line fallback tested
  for the key rather than the value, so it skipped the very gaps it was for
- and that fallback measured in degrees, giving every leg a cost of NaN, which
  loses every comparison and therefore chose nothing

A floor goes with all of it: below three fifths of the published distance an
assembly has failed rather than found a shorter lap. Without one the search kept
choosing a 283 metre loop off the end of Jeddah, which closes cleanly, jumps
nowhere and beats better laps on every other term in the score.

### Long enough, rather than shortest

Where a street circuit runs on public road there is no raceway tag, and the
router took the shortest way across the gap. That is right for a forty metre
joint and wrong for Singapore, where three kilometres of the lap are public road
and the shortest way home is seven hundred metres - forty per cent of a circuit.
The gap is now given a budget, from the length the lap is missing, and the search
is shaken onto neighbouring roads until it finds a route near it. Singapore 40 to
74 per cent.

### The one authored height

Marina Bay is about five metres above the sea for the whole lap. The terrain
service returned a range of sixty-six metres with a peak of a hundred and nine,
because in a city that dense it is looking at roofs. Singapore keeps twelve per
cent of its measured range: the shape of the profile is still the map's, and only
the size of it is ours. It is the only measured circuit whose height has been
touched, and `flatten` in `circuits.js` is the whole of it.

### Twelve metres was narrower than the road

Three separate thresholds in this pipeline were set to twelve metres: the
router's refusal to drive near road it has already driven, the reported doubling
figure, and the test for one way duplicating another. Twelve metres between two
centre lines is two carriageways of one boulevard with their kerbs almost
touching - so the router was free to come back along the other side of Boulevard
Albert 1er, the doubling figure said nought per cent because the two were
thirteen metres apart, and the dedupe agreed. Two hundred metres of Monaco was
drawn with the ground and the barriers of one carriageway lying across the
other. All three now ask for eighteen, which is about two road widths, and the
dedupe measures a way over its whole length rather than its middle third.

  monaco 13% of the lap beside itself -> 8%      vegas 18% -> 0%
  jeddah  2% -> 0%                               miami  6% -> 4%

Las Vegas went from 80 per cent of its length with a 1.3 kilometre straight line
in it to 104 per cent with a 25 metre one, and Jeddah from 112 per cent with a
300 metre jump to 102 with none.

### A band of ground that is a cliff is not drawn

The ground beside the road is clamped so it can never be drawn over a lower
piece of the circuit. That is right and it was drawing cliffs: Monaco climbs
forty-one metres on a site four hundred metres across, so nearly every point has
a much lower piece of road within the ninety-five metres the second band's
ceiling looks at, and the ceiling pulled that band down to the harbour - a
thirty-four metre wall of ground beside the track, over the road on the other
side of it. The ceiling was right; the band should not have been there.

A band whose ceiling sits more than five metres below the road it belongs to is
now dropped, node by node. Only on the eight measured circuits, which have
already said their ground stops close by: on a circuit in open country a band
clamped thirty metres down is a hillside and is meant to be there. Applied to
all of them it took the landscape off eight hundred and twenty-nine of Spa's
eleven hundred nodes.

### What is still not right



Miami comes out 18 per cent long and Las Vegas 20 per cent short, and Las Vegas
has a 1.3 kilometre straight line in it where no street the map knows about
joins two fragments. Singapore is 74 per cent, which is as far as budgeted
routing gets it without knowing which public roads the circuit actually uses -
and that is the one thing about these circuits that is not written down anywhere
we can read.

Overpass answers are cached in `.osm-cache`. Delete it to fetch again.
