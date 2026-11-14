"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHydroSite = exports.hasOceanAccess = exports.isCoastal = void 0;
const TerrainFeatureRegistry_1 = require("@civ-clone/core-terrain-feature/TerrainFeatureRegistry");
const hydro_1 = require("@civ-clone/civ2-world/lib/hydro");
// OpenCiv2 `src/auto/city.cpp` `city_create` (richardpenman/civ2@49f26ec) sets a city's site flags from the 9 squares
//  of its own and its neighbours': `CITYF_COASTAL` for any ocean, `CITYF_OCEAN_ACCESS` for ocean that is more than a
//  one-square lake, and `CITYF_HYDRO_POSSIBLE` for a river or mountains (civ2-world's `lib/hydro`).
const around = (city) => [
    city.tile(),
    ...city.tile().getNeighbours(),
];
/** Water on the city's square or next to it: a Harbour and an Offshore Platform need it. */
const isCoastal = (city) => around(city).some((tile) => tile.isWater());
exports.isCoastal = isCoastal;
/**
 * Water next to the city that isn't a one-square lake: a Port Facility and a Coastal Fortress need it. Approximated by
 *  a water square with another water square beside it.
 */
const hasOceanAccess = (city) => around(city).some((tile) => tile.isWater() &&
    tile.getNeighbours().some((other) => other.isWater()));
exports.hasOceanAccess = hasOceanAccess;
/**
 * A river or mountains on the city's square or next to it: a Hydro Plant needs one (civ2-world's `hydroPossible`). Civ2
 *  decides it once, when the city is founded; this asks the map as it is now.
 */
const isHydroSite = (city, terrainFeatureRegistry = TerrainFeatureRegistry_1.instance) => (0, hydro_1.default)(city.tile(), terrainFeatureRegistry);
exports.isHydroSite = isHydroSite;
//# sourceMappingURL=site.js.map