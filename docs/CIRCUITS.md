# Where the four real circuits came from

Three of the eleven circuits in this game were drawn by a random number
generator. Eight of them are places: Spa-Francorchamps, Monza, Suzuka,
Zandvoort, Silverstone, Interlagos, the Red Bull Ring and Gilles Villeneuve.
This is where the shapes came from, what is ours, and what that obliges us to
say.

## The centre lines

`src/game/circuits.js` holds a surveyed centre line for each of the four, at ten
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

The survey is two coordinates and a width. Everything else about these four
circuits was written by hand in `circuits.js`, and none of it is claimed to be
measured:

**Elevation.** The data is flat. A flat Spa is a diagram of Spa, so each circuit
has a height profile written as metres above its start line at fractions of a
lap, taken from what these places do rather than from a survey: Eau Rouge
twenty-nine metres below the line, Les Combes sixty-seven above it, ninety-eight
metres of spread. Monza gets nine metres, Suzuka forty, Zandvoort seventeen.
They are authored, and they are much closer to the truth than nothing.

**Banking.** Zandvoort's two dished corners, Hugenholtz and the last one, at
eighteen degrees. Written down because a banked corner is taken faster, so it
changes the lap and not only the picture.

**Everything you can see.** Themes, trees, dunes, grandstands, the pit
buildings, the campsites, the wind turbines, the derelict oval alongside the
Serraglio at Monza and the wheel over the infield at Suzuka. Placed towards what
makes each circuit recognisable, invented in the detail.

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
`src/game/circuits.js`. The importer only reads the four circuits this game
ships; the source database has twenty-five, sixteen of which are on the 2026
Formula One calendar.

## The eight it does not have

Of the twenty-four circuits on the 2026 calendar, the TUM database covers
sixteen. Jeddah, Miami, Monaco, Madrid, Baku, Singapore, Las Vegas and Losail
are not in it. They are all in OpenStreetMap as `highway=raceway` and could be
traced with Overpass under the same ODbL terms, except Madrid, which is new
enough that the mapping may not be there yet.
