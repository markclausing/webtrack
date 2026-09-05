# Where the sixteen real circuits came from

Three of the nineteen circuits in this game were drawn by a random number
generator. Sixteen of them are places: Spa-Francorchamps, Monza, Suzuka,
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

## The eight the calendar has and this does not

Of the twenty-four circuits on the 2026 calendar, the TUM database covers
sixteen. Jeddah, Miami, Monaco, Madrid, Baku, Singapore, Las Vegas and Losail
are not in it. They are all in OpenStreetMap as `highway=raceway` and could be
traced with Overpass under the same ODbL terms, except Madrid, which is new
enough that the mapping may not be there yet.

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

Monaco is in the game: 3.56 km against a true 3.337, 840 metres of tunnel found
from the tags, 44 metres of measured climb, 252 buildings at their own footprints
and their own heights, and 79 boats along the piers of Port Hercule. The scatter
rule for the whole circuit is one line about palm trees, because everything else
beside that road was measured. Las Vegas imports correctly at 96 per cent.

One thing about it is not right. Its assembled route doubles back on itself for
about a fifth of the lap, which shows up as a net turn of zero where a closed
circuit should turn through exactly two pi - so the *shape* is not quite Monaco
even though the corners, the tunnel, the height and the buildings all are. That
is the routing between raceway fragments choosing a path out and back rather than
round, and it is the same work as getting the other six to import at all.

The other six do not import correctly yet, and the reason is the same for all of
them: picking which of the raceway ways in a bounding box form the Grand Prix lap
rather than a pit lane, an alternative layout or a karting circuit. Jeddah comes
out at 149 per cent, Miami 142, Madrid 187, Losail 43, Singapore 40, and Baku
times out. That is per-circuit work on the selection rules, not a fault in the
pipeline.
