# civ2-city-improvement

Civilization II's 34 buildable city improvements (21 shared with Civilization, 13 of their own), and Capitalization, on
`base-city-improvement-rules`, from RULES.TXT @IMPROVE (numbers only, in `data/improvements.ts`, checked against a local
copy by `tests/rulesTxt.test.ts` when `CIV2_PATH` names its folder) and OpenCiv2 (richardpenman/civ2@49f26ec), each rule
citing its function. Other numbers are in `data/rules.ts`.

- **Build list, cost and requirements** (`Rules/City/build`, `build-cost`, `Requirements`): @IMPROVE's cost × @COSMIC's
  shield rows and advance; built once a city; a Bank needs a Marketplace, a Stock Exchange a Bank, a University a
  Library, a Research Lab a University, a Sewer System an Aqueduct, a Manufacturing Plant and every plant a Factory; no
  Courthouse beside the Palace, nor a plant beside a better one; a Harbour and an Offshore Platform only on the coast, a
  Port Facility and a Coastal Fortress only with ocean access, a Hydro Plant only by a river or mountains (`lib/site`);
  nothing a Wonder its player owns already stands in for (`city_can_build_improvement`).
- **The Palace** (`Rules/City/created`, `Rules/CityImprovement/created`, `Rules/City/captured`, `lib/capital`): a
  civilization's only city gets it; building another moves it; it can't be sold (civ2-treasury); a captured capital
  loses it, and its player may buy it into its best city for 1000 gold (`city_capture_aftermath_palace_escape`): a
  computer player decides by itself; a person's client is asked there and then (`lib/palaceEscapeChoice`,
  `capture-city.palace-escape`, yes or no, with the city and the cost), and the capture's plunder waits for the
  answer, as Civ2 pays for the escape before plunder (through civ2-city's `waitBeforePlunder`).
  civ2-city measures corruption from it. A computer player without one rebuilds it in its largest city
  (`Rules/City/build-priority`). These rules of thumb rank only a computer player's own choices: a city on Auto is
  ranked by civ2-city's Civ2 scores.
- **Every improvement built is registered** in the game's `cityImprovements`, Wonders included, so a Wonder stays known
  as built after its city is gone.
- **Upkeep** (`lib/upkeep`, `Rules/City/cost`): @IMPROVE's, with Barracks' steps, Adam Smith's and Fundamentalism's free
  Temples, Colosseums and Cathedrals; paid only by a person's cities and not under Anarchy
  (`city_pay_improvement_upkeep`).
- **Growth** (`Rules/City/grow`): the Aqueduct (8) and Sewer System (12) caps from @COSMIC; a Granary (or the Pyramids)
  leaves half a box after growth.
- **Content** (`lib/content`): a Colosseum, a Cathedral (or Michelangelo's) and a Temple (doubled by the Oracle), with
  Civ2's advance steps; under Democracy a Courthouse or the Palace makes a citizen happy; under Fundamentalism their
  content, and J. S. Bach's 2, are paid as tithes.
- **The Courthouse** halves trade corruption before the trade is split (`Rules/City/yield`). Shield waste is halved
  inside civ2-city's own corruption, as `city_calc_corruption` halves before the waste's capital link and divisor.
- **Squares** (`Rules/City/tile-yield`), each a `CityTileYield` step at its place in civ2-city's order
  (`lib/tileYieldPipeline`, `city_tile_yield`): a Harbour +1 food and an Offshore Platform +1 shield on ocean; a
  Supermarket half the food again, rounded down, on farmland and the city's square, before the government's penalty;
  Superhighways half the trade again on a road, a railroad or the city's square, after the government's penalty and
  trade bonus and before pollution.
- **Capitalization** (`Rules/City/capitalization`, base-city-improvement-capitalization's class): with The
  Corporation; it costs nothing, never completes and moves on to what's queued. It turns production into gold only
  with civ2-city's production step, which pays the turn's net shields out (`payOut`) instead of adding them to the
  box, outside disorder and Anarchy (`city_process_production`, `city_split_trade`, `city_process_disorder`); this
  package registers no conversion of its own.
- **Nuclear Plant meltdown** (`lib/meltdown`, `Rules/City/meltdown`): a person's city in civil disorder with a Nuclear
  Plant, without Fusion Power, melts down 1 time in (6 − level), every time on Deity (`city_process_pollution`; the
  survey's "never on Emperor or Deity" isn't the code's): `city:nuclear-meltdown`, then `nuclear_blast` over the 9
  squares (each city halved, rounded down; on land a Fortress lost, the railroad, mine, irrigation or farmland on a roll
  of 1 in 2 each, fallout 2 in 3; no units lost), and the plant is gone.
- **Multipliers** (`lib/bonus`): Marketplace, Bank and Stock Exchange, and Library, University and Research Lab (or
  SETI; all of it in Newton's city), each half the base, never compounding; Factory, Manufacturing Plant and plants (or
  the Hoover Dam) a quarter-step each.
- **Veterans** (`Rules/Unit/created`): Barracks (or Sun Tzu's) for land units, a Port Facility (or the Lighthouse) for
  ships, an Airport for aircraft; obsolete Barracks are sold on Gunpowder and Mobile Warfare.
- **Defences** (`Rules/Unit/strength`): a Coastal Fortress, SAM Missile Battery and SDI Defense each double a defence.
  City Walls are civ2-unit's (by class).
- **Pollution** (`lib/pollution`, `Rules/City/pollution`): Civ2's shields and population steps, divisors and roll, only
  in a person's cities. The shields are counted before unit support and civ2-city's waste.

## Not yet (Civ2 M2a deviations and gaps)

- **Superhighways and Airport trade route bonuses** (no trade routes yet). The Police Station's exemption from
  military unhappiness is civ2-city-happiness's.
- **Not here, by design:** what Barracks, an Airport and a Port Facility do for a damaged unit (a full heal), an
  Airport's airlifts, and SDI Defense stopping a nuclear attack within 3 squares are civ2-unit's rules, which ask for
  the improvements' base classes, so civ2-unit doesn't depend on this package.
- **Capture:** the founder a capture spares is civ2-city's (`lib/founder`: the loser of the last capture, or the owner
  after 63 turns). A city retaken by its founder loses its Palace too (Civ2 leaves the bit, giving the founder a second);
  the escape's spaceship condition isn't modelled, nor the original skipping its first city slot (`0 < city3`).
- **Communism's veteran Diplomats** (`city_process_production_unit`) are civ2-unit's.
- **The Palace escape** counts the loser's cities and the captured city's size after civ2-city's capture rules have run
  (Civ2 counts before), and measures distance by the world's own metric rather than Civ2's diagonal one, so it can be
  one off at its thresholds.
- **A computer player's late refounding** with free improvements isn't modelled.
- **Shield waste**, and the computer players' shield rows by level, are civ2-city's and civ2-difficulty's; the Airport's
  part in the capital link (across land masses) is civ2-city's walk.
