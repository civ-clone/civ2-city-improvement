# civ2-city-improvement

Civilization II's 34 buildable city improvements (21 shared with Civilization, 13 of their own) on
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
  loses it, and a computer player may buy it into its best city for 1000 gold (`city_capture_aftermath_palace_escape`).
  civ2-city measures corruption from it. A computer player without one rebuilds it in its largest city
  (`Rules/City/build-priority`).
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
- **The Courthouse** halves corruption before the trade is split (`Rules/City/yield`).
- **Multipliers** (`lib/bonus`): Marketplace, Bank and Stock Exchange, and Library, University and Research Lab (or
  SETI; all of it in Newton's city), each half the base, never compounding; Factory, Manufacturing Plant and plants (or
  the Hoover Dam) a quarter-step each. Harbour, Offshore Platform and Superhighways add to the squares worked.
- **Veterans** (`Rules/Unit/created`): Barracks (or Sun Tzu's) for land units, a Port Facility (or the Lighthouse) for
  ships, an Airport for aircraft; obsolete Barracks are sold on Gunpowder and Mobile Warfare.
- **Defences** (`Rules/Unit/strength`): a Coastal Fortress, SAM Missile Battery and SDI Defense each double a defence.
  City Walls are civ2-unit's (by class).
- **Pollution** (`lib/pollution`, `Rules/City/pollution`): Civ2's shields and population steps, divisors and roll, only
  in a person's cities.

## Not yet (Civ2 M2a deviations and gaps)

- **Supermarket:** farmland is inert until G20, so the Supermarket does nothing.
- **Superhighways and Airport trade route bonuses** (no trade routes in M2a), and the Police Station's exemption
  (civ2-city-happiness#2, by the same "improvement or Wonder" test).
- **Not here, by design:** what Barracks, an Airport and a Port Facility do for a damaged unit (a full heal), an
  Airport's airlifts, and SDI Defense stopping a nuclear attack within 3 squares are civ2-unit's rules, which ask for
  the improvements' base classes, so civ2-unit doesn't depend on this package.
- **Squares:** Harbour, Offshore Platform and Superhighways add to the city's totals rather than each square's yield, so
  they come before the government's square penalty rather than after.
- **Capture:** a city retaken by its founder loses its Palace too (Civ2 leaves the bit, giving the founder a second);
  the escape's land-mass halving and spaceship condition aren't modelled, and a person is never offered the escape.
- **Nuclear Plant meltdowns** in disorder aren't modelled.
- **Communism's veteran Diplomats** (`city_process_production_unit`) aren't modelled.
- **Superhighways** read each square's `yields()` and count only a Road (or the city's square), not a Railroad alone;
  their half is added to the city's total, so after pollution's halving, and without the celebration +1 or the Colossus,
  where Civ2 adds it to the square before pollution.
- **The Palace escape** counts the loser's cities and the captured city's size after civ2-city's capture rules have run
  (Civ2 counts before), and measures distance by the world's own metric rather than Civ2's diagonal one, so it can be
  one off at its thresholds.
- **The founder** is the city's original player, as civ2-city has it; Civ2 makes the loser the founder after each
  capture, so a city taken back and forth loses differently.
- **A computer player's late refounding** with free improvements isn't modelled.
- **Shield waste**, and the computer players' shield rows by level, are civ2-city's and civ2-difficulty's.
