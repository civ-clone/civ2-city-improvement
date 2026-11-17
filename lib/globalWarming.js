"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solarPlantCities = exports.computerCityRadii = exports.warmedTerrain = exports.onPattern = exports.isInland = exports.oceansAround = exports.oceanDirections = exports.civ2X = void 0;
const CityImprovementRegistry_1 = require("@civ-clone/core-city-improvement/CityImprovementRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const Terrains_1 = require("@civ-clone/civ2-world/Terrains");
const rules_1 = require("../data/rules");
const CityImprovements_1 = require("../CityImprovements");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
// Civilization II's global warming, numbered for `base-global-warming`: OpenCiv2 `src/auto/game.cpp`
//  `game_update_global_warming` (00486c2e) and `src/auto/map.cpp` `map_apply_global_warming` (004868fb),
//  richardpenman/civ2@49f26ec. The numbers are in `data/rules.ts`.
/**
 * The square's x as the original numbers it: on a staggered isometric map, in half squares (`x2 += 2`, odd rows
 *  starting at 1), as the warming pattern reads it. On any other grid, its own x.
 */
const civ2X = (tile) => tile.map().topologyId() === 'staggered-iso'
    ? 2 * tile.x() + (tile.y() & 1)
    : tile.x();
exports.civ2X = civ2X;
/**
 * The directions `map_apply_global_warming` looks for ocean in, as the original reads them. Its loop takes 20 offsets
 *  from the 8-entry direction table (`dir_dx_table`, `dir_dy_table`) and reads past its end (the "Bug?" of RULES §6).
 *  What it reads there is fixed by the tables' place in memory (OpenCiv2 `src/data/state/ai.h`, `gamedata.cpp`): entries
 *  8 to 15 are 0 in both tables, the square itself, which is never ocean here; entries 16 to 19 are the next tables'
 *  first values, the offsets (−1, 1), (0, 2), (1, 1) and (2, 0) in half squares, the square's south-west, south,
 *  south-east and east neighbours again. So those four count twice. Named as on the staggered isometric grid
 *  (core-world's `StaggeredIsoTopology`): `dir_dx_table` is north-east, east, south-east, south, south-west, west,
 *  north-west, north. A grid without one of these directions skips it.
 */
exports.oceanDirections = Object.freeze([
    'ne',
    'e',
    'se',
    's',
    'sw',
    'w',
    'nw',
    'n',
    'sw',
    's',
    'se',
    'e',
]);
/**
 * How many of `oceanDirections`' squares around `tile` are water, each counted as often as it's listed. A square past
 *  the map's top or bottom row isn't counted (`map_in_bounds`): Civilization II's map doesn't wrap north to south, though
 *  core-world's grids do.
 */
const oceansAround = (tile) => {
    const world = tile.map(), topology = world.topology(), directions = topology.directions();
    return exports.oceanDirections.filter((direction) => {
        if (!directions.includes(direction)) {
            return false;
        }
        const [dx, dy] = topology.offset(direction, tile.x(), tile.y()), y = tile.y() + dy;
        return (y >= 0 && y < world.height() && world.get(tile.x() + dx, y).isWater());
    }).length;
};
exports.oceansAround = oceansAround;
/**
 * Whether a warming changes `tile` as an inland square: fewer oceans around it than 7 less the warmings so far. From the
 *  seventh warming on, none is (`oceans < 0`), so every square takes the coastal change.
 */
const isInland = (tile, warmings) => (0, exports.oceansAround)(tile) < rules_1.warmingInlandOceansBelow - warmings;
exports.isInland = isInland;
/** Whether an inland `tile` is on the warming's pattern: `(3x − 3y) & 7` is the warmings so far (none after the eighth). */
const onPattern = (tile, warmings) => ((3 * (0, exports.civ2X)(tile) - 3 * tile.y()) & rules_1.warmingPatternMask) === warmings;
exports.onPattern = onPattern;
/**
 * What a warming makes of `tile`, given the warmings before it (`map_apply_global_warming`), or `null` to leave it:
 *  - only Desert, Plains, Grassland and Forest change;
 *  - inland, on the pattern only, Desert and Plains become Desert, Grassland and Forest Plains;
 *  - otherwise (every such square, with no pattern) Forest becomes Jungle and the rest Swamp.
 * Irrigation, Farmland and a Mine go with the coastal change by civ2-world's `TerrainChanged` rule, as neither Swamp nor
 *  Jungle keeps them; the original keeps what an inland square has, and so does that rule.
 */
const warmedTerrain = (tile, warmings) => {
    const terrain = tile.terrain();
    if (!(terrain instanceof Terrains_1.Desert ||
        terrain instanceof Terrains_1.Plains ||
        terrain instanceof Terrains_1.Grassland ||
        terrain instanceof Terrains_1.Forest)) {
        return null;
    }
    if ((0, exports.isInland)(tile, warmings)) {
        if (!(0, exports.onPattern)(tile, warmings)) {
            return null;
        }
        return terrain instanceof Terrains_1.Desert || terrain instanceof Terrains_1.Plains
            ? Terrains_1.Desert
            : Terrains_1.Plains;
    }
    return terrain instanceof Terrains_1.Forest ? Terrains_1.Jungle : Terrains_1.Swamp;
};
exports.warmedTerrain = warmedTerrain;
/**
 * For each square, how many computer players' cities (the barbarians' included) have it in their radius: the original's
 *  `w` counts a polluted square once for each such city as it processes the city (`city_calc_tile_flags`, city.cpp
 *  004e7641, the 21 squares only). Here it is the cities standing when it's asked.
 */
const computerCityRadii = ({ cityRegistry = CityRegistry_1.instance, clientRegistry = ClientRegistry_1.instance, } = {}) => {
    const counts = new Map();
    cityRegistry
        .entries()
        .filter((city) => !city.destroyed() && !(0, isHuman_1.default)(city.player(), clientRegistry))
        .forEach((city) => city
        .tiles()
        .entries()
        .forEach((tile) => {
        var _a;
        counts.set(tile, ((_a = counts.get(tile)) !== null && _a !== void 0 ? _a : 0) + 1);
    }));
    return (tile) => { var _a; return (_a = counts.get(tile)) !== null && _a !== void 0 ? _a : 0; };
};
exports.computerCityRadii = computerCityRadii;
/** How many cities have a Solar Plant, whoever's they are. */
const solarPlantCities = ({ cityImprovementRegistry = CityImprovementRegistry_1.instance, } = {}) => new Set(cityImprovementRegistry
    .getByType(CityImprovements_1.SolarPlant)
    .map((improvement) => improvement.city())
    .filter((city) => !city.destroyed())).size;
exports.solarPlantCities = solarPlantCities;
//# sourceMappingURL=globalWarming.js.map